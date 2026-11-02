# Backend. Задание 2 — FastAPI

API категорий услуг на FastAPI по структуре [примера задания](https://github.com/aza954/tenzor-learn-front/tree/main/backend-2-practice). Модель `Category` описана через Pydantic; количество услуг пока задано вручную.

## Запуск (PowerShell, Python 3.10+)

```powershell
cd backend-2-practice
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe main.py
```

Оставьте терминал открытым. Остановка — Ctrl+C. Активация окружения не требуется.

- http://127.0.0.1:8000/categories — HTTP 200, JSON-массив четырёх категорий с полями `id`, `name`, `servicesCount`.
- http://127.0.0.1:8000/categories/1 — HTTP 200, JSON-объект выбранной категории.
- http://127.0.0.1:8000/categories/999 — HTTP 404, обычный текст `Category not found`.
- http://127.0.0.1:8000/docs — Swagger UI для проверки запросов.

Нечисловой `category_id` возвращает стандартную ошибку валидации FastAPI (422).

Для разработки с автоматической перезагрузкой:

```powershell
.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Если порт 8000 занят, добавьте к этой команде `--port 8001`.

## Тесты

```powershell
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe -m unittest -v
```

Тесты используют FastAPI TestClient и проверяют список, каждую категорию, текстовый ответ 404, валидацию ID и Swagger/OpenAPI.
