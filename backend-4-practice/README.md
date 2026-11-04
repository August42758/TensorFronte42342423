# Backend, практика 4 — создание услуг

FastAPI, Pydantic 2, SQLAlchemy и SQLite. Реализация основана на [примере задания](https://github.com/aza954/tenzor-learn-front/tree/main/backend-4-practice). Предыдущие практики не изменяются.

## Запуск (PowerShell, Python 3.10+)

```powershell
cd backend-4-practice
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe main.py
```

Swagger: http://127.0.0.1:8002/docs. Терминал должен оставаться открытым. При запуске создаётся локальная `salon.db`, две записи мастеров и четыре категории. Повторный запуск не очищает данные и не дублирует начальные записи. БД предыдущей практики не используется.

## API

- `POST /services` — создать услугу: HTTP 201 и JSON с `id` и полями услуги.
- Несуществующая категория — HTTP 404, `{"detail":"Category not found"}`.
- Ошибочные поля — HTTP 422; услуга не записывается в БД.
- `GET /categories` и `GET /categories/{category_id}` — категории с реальным количеством сохранённых услуг. Изначально количество равно нулю.
- `GET /masters`, `GET /masters?specialization=Парикмахер`, `GET /masters/{master_id}` — API мастеров предыдущей практики.

В Swagger выберите POST /services → Try it out и отправьте:

```json
{
  "categoryId": 3,
  "title": "Наращивание ресниц",
  "desc": "Огромные ресницы уже через 30 минут",
  "duration": 30,
  "price": 1500.00
}
```

Ожидается 201. Замена цены на `"бесплатно"` даст 422. Комбинация `"desc": ""`, `"duration": 0`, `"price": -1500.00` также даст 422.

## Проверки и устройство

`schemas.py` содержит `ServiceCreate`: положительный целочисленный `categoryId`; название и описание длиной 1–100 символов после удаления пробелов по краям; целочисленная длительность 30–180 минут включительно; конечная числовая цена строго больше нуля. Строки из пробелов не допускаются. Числовые строки, например `"1500"`, не принимаются вместо чисел.

`models.py` описывает таблицы `masters`, `categories`, `services`. Услуга связана с категорией внешним ключом. Дополнительные CHECK-ограничения защищают обязательные бизнес-правила на уровне SQLite. В `main.py` проверяется существование категории, затем выполняются `add`, `commit`, `refresh`. `ServiceResponse` преобразует ORM-поле `category_id` в JSON-поле `categoryId`. `database.py` включает внешние ключи SQLite, `seed.py` заполняет пустые таблицы.

## Тесты

```powershell
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe -m unittest -v
```

Тесты используют временную SQLite БД. Проверяются три сценария задания, граничные значения, неизвестная категория, отсутствие изменений БД при 422, чтение созданной записи отдельной сессией и обновление счётчика услуг. Рабочая БД тестами не изменяется.
