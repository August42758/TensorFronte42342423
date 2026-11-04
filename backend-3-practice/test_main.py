from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from database import get_db
from main import app
from models import Master
from seed import init_db


class MasterAPITests(unittest.TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.engine = create_engine(
            f"sqlite:///{Path(self.directory.name).as_posix()}/test.db",
            connect_args={"check_same_thread": False},
        )
        def test_db():
            with Session(self.engine) as session:
                yield session
        app.dependency_overrides[get_db] = test_db
        self.seed_patch = patch("main.init_db", lambda: init_db(self.engine))
        self.seed_patch.start()
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.seed_patch.stop()
        app.dependency_overrides.clear()
        self.engine.dispose()
        self.directory.cleanup()

    def test_list_and_single_master(self):
        expected = [
            {"id": 1, "name": "Анна", "specialization": "Парикмахер"},
            {"id": 2, "name": "Мария", "specialization": "Визажист"},
        ]
        response = self.client.get("/masters")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), expected)
        for master in expected:
            response = self.client.get(f'/masters/{master["id"]}')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json(), master)

    def test_specialization_filter(self):
        for specialization, expected_ids in [("Парикмахер", [1]), ("Визажист", [2]), ("Нет такой", []), ("", [])]:
            with self.subTest(specialization=specialization):
                response = self.client.get("/masters", params={"specialization": specialization})
                self.assertEqual(response.status_code, 200)
                self.assertEqual([master["id"] for master in response.json()], expected_ids)

    def test_missing_master_and_invalid_id(self):
        for master_id in (0, -1, 999):
            response = self.client.get(f"/masters/{master_id}")
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json(), {"detail": "Master not found"})
        self.assertEqual(self.client.get("/masters/abc").status_code, 422)

    def test_database_changes_and_reinitialization(self):
        with Session(self.engine) as session:
            session.get(Master, 1).name = "Анна Иванова"
            session.add(Master(name="Ольга", specialization="Парикмахер"))
            session.commit()
        # Повторный старт не дублирует и не перезаписывает данные.
        init_db(self.engine)
        self.assertEqual(self.client.get("/masters/1").json()["name"], "Анна Иванова")
        response = self.client.get("/masters", params={"specialization": "Парикмахер"})
        self.assertEqual([master["name"] for master in response.json()], ["Анна Иванова", "Ольга"])
        with Session(self.engine) as session:
            self.assertEqual(len(session.scalars(select(Master)).all()), 3)

    def test_categories_preserved(self):
        self.assertEqual(len(self.client.get("/categories").json()), 4)
        self.assertEqual(self.client.get("/categories/1").status_code, 200)
        response = self.client.get("/categories/999")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.text, "Category not found")


if __name__ == "__main__":
    unittest.main()
