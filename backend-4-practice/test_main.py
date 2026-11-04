from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import create_db_engine, get_db
from main import app
from models import Service
from seed import init_db


class ServiceAPITests(unittest.TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.engine = create_db_engine(Path(self.directory.name) / "test.db")
        def test_db():
            with Session(self.engine) as session:
                yield session
        app.dependency_overrides[get_db] = test_db
        self.seed_patch = patch("main.init_db", lambda: init_db(self.engine))
        self.seed_patch.start()
        self.client = TestClient(app)
        self.client.__enter__()
        self.payload = {
            "categoryId": 3,
            "title": "Наращивание ресниц",
            "desc": "Огромные ресницы уже через 30 минут",
            "duration": 30,
            "price": 1500.00,
        }

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.seed_patch.stop()
        app.dependency_overrides.clear()
        self.engine.dispose()
        self.directory.cleanup()

    def count_services(self):
        with Session(self.engine) as session:
            return session.scalar(select(func.count(Service.id)))

    def test_valid_service_persisted(self):
        response = self.client.post("/services", json=self.payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"id": 1, **self.payload})
        with Session(self.engine) as session:
            record = session.get(Service, response.json()["id"])
            self.assertEqual(record.category_id, 3)
            self.assertEqual(record.title, self.payload["title"])
            self.assertEqual(record.price, 1500)
        self.assertEqual(self.client.get("/categories/3").json()["servicesCount"], 1)
        init_db(self.engine)
        self.assertEqual(self.count_services(), 1)

    def test_invalid_price_from_assignment(self):
        response = self.client.post("/services", json={**self.payload, "price": "бесплатно"})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.count_services(), 0)

    def test_multiple_invalid_fields_from_assignment(self):
        response = self.client.post("/services", json={**self.payload, "desc": "", "duration": 0, "price": -1500})
        self.assertEqual(response.status_code, 422)
        fields = {error["loc"][-1] for error in response.json()["detail"]}
        self.assertEqual(fields, {"desc", "duration", "price"})
        self.assertEqual(self.count_services(), 0)

    def test_validation_boundaries(self):
        for field, values in {
            "title": ["", "   ", "x" * 101, None],
            "desc": ["", "\t\n", "x" * 101, None],
            "duration": [29, 181, 30.5, "30", True],
            "price": [0, -1, "1500", True],
            "categoryId": [0, -1, "3", True],
        }.items():
            for value in values:
                with self.subTest(field=field, value=value):
                    response = self.client.post("/services", json={**self.payload, field: value})
                    self.assertEqual(response.status_code, 422)
                    self.assertEqual(self.count_services(), 0)
        for field in self.payload:
            payload = self.payload.copy()
            del payload[field]
            self.assertEqual(self.client.post("/services", json=payload).status_code, 422)
        self.assertEqual(self.count_services(), 0)

    def test_inclusive_limits_and_stripping(self):
        for duration in (30, 180):
            response = self.client.post("/services", json={**self.payload, "duration": duration, "title": " x ", "desc": "x" * 100, "price": 0.01})
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json()["title"], "x")
        self.assertEqual(self.client.post("/services", json={**self.payload, "title": "x" * 100}).status_code, 201)

    def test_unknown_category(self):
        response = self.client.post("/services", json={**self.payload, "categoryId": 999})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Category not found"})
        self.assertEqual(self.count_services(), 0)

    def test_existing_api(self):
        self.assertEqual(len(self.client.get("/masters").json()), 2)
        self.assertEqual(len(self.client.get("/categories").json()), 4)
        self.assertEqual(self.client.get("/categories/999").status_code, 404)


if __name__ == "__main__":
    unittest.main()
