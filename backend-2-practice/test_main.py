import unittest

from fastapi.testclient import TestClient

from main import app


class CategoryAPITests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.addCleanup(self.client.close)

    def test_categories(self):
        response = self.client.get("/categories")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [
            {"id": 1, "name": "Стрижки и укладки", "servicesCount": 5},
            {"id": 2, "name": "Маникюр и педикюр", "servicesCount": 5},
            {"id": 3, "name": "Брови и ресницы", "servicesCount": 4},
            {"id": 4, "name": "Спа-процедуры", "servicesCount": 4},
        ])

    def test_each_category(self):
        for expected in self.client.get("/categories").json():
            with self.subTest(category_id=expected["id"]):
                response = self.client.get(f'/categories/{expected["id"]}')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), expected)

    def test_missing_category(self):
        for category_id in (0, -1, 999):
            with self.subTest(category_id=category_id):
                response = self.client.get(f"/categories/{category_id}")
                self.assertEqual(response.status_code, 404)
                self.assertEqual(response.text, "Category not found")
                self.assertEqual(response.headers["content-type"], "text/plain; charset=utf-8")

    def test_invalid_id(self):
        self.assertEqual(self.client.get("/categories/abc").status_code, 422)

    def test_swagger_and_schema(self):
        self.assertEqual(self.client.get("/docs").status_code, 200)
        schema = self.client.get("/openapi.json").json()
        self.assertIn("/categories", schema["paths"])
        self.assertIn("404", schema["paths"]["/categories/{category_id}"]["get"]["responses"])


if __name__ == "__main__":
    unittest.main()
