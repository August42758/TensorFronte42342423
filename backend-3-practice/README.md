# Backend, практика 3 — мастера в SQLite

FastAPI + SQLAlchemy 2 + SQLite, по структуре [примера](https://github.com/aza954/tenzor-learn-front/tree/main/backend-3-practice). Требуется Python 3.10+. Папка `backend-2-practice` не изменяется; её эндпоинты категорий сохранены в новой версии.

## Запуск в PowerShell

```powershell
cd backend-3-practice
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe main.py
```

Сервер: http://127.0.0.1:8001. Swagger: http://127.0.0.1:8001/docs. Терминал должен оставаться открытым; остановка — Ctrl+C.

Для автоматической перезагрузки: `.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8001`.

## API

- `GET /masters` — все мастера из БД, отсортированные по ID.
- `GET /masters?specialization=Парикмахер` — точное совпадение специализации, фильтрация SQL-запросом. Если совпадений нет, возвращается HTTP 200 и `[]`.
- `GET /masters/1` — один мастер из БД.
- `GET /masters/999` — HTTP 404, `{"detail": "Master not found"}`.
- `GET /categories` и `GET /categories/{category_id}` — эндпоинты прошлой практики.

При первом запуске создаются файл `salon.db` рядом с `database.py` и таблица `masters`: `id` (первичный ключ), `name`, `specialization` (обязательные строки). Пустая таблица заполняется мастерами: Анна — Парикмахер, Мария — Визажист. Повторный запуск не дублирует и не перезаписывает существующие записи. Мастера хранятся только в SQLite, Python-список используется лишь для начального заполнения. Изменения БД сохраняются при перезапуске. Файл БД исключён из Git.

`database.py` настраивает движок и сессию на запрос; `models.py` описывает ORM-модель; `seed.py` создаёт таблицы и начальные записи; `main.py` содержит API и Pydantic-модель ответа с `from_attributes=True`.

## Проверка

```powershell
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe -m unittest -v
```

Тесты используют отдельную временную SQLite БД, проверяют список, получение по ID, фильтрацию, 404, валидацию ID, чтение изменённых данных из БД, повторную инициализацию и категории. Рабочая `salon.db` тестами не изменяется.
