"""Запись клиентов салона. Запуск примеров: python main.py."""

from dataclasses import dataclass
import re


@dataclass
class Master:
    master_id: int
    name: str


@dataclass
class Service:
    service_id: int
    name: str


@dataclass
class Appoinment:
    """Название класса сохранено в точности как в задании."""

    id: int
    client_name: str
    master_id: int
    service_id: int
    time: str


# Минимальные тестовые данные, поскольку исходного backend в проекте нет.
masters = [Master(master_id=1, name="Анна")]
services = [Service(service_id=1, name="Стрижка")]
appointments: list[Appoinment] = []


def get_master(master_id: int) -> Master | None:
    return next((master for master in masters if master.master_id == master_id), None)


def get_service(service_id: int) -> Service | None:
    return next((service for service in services if service.service_id == service_id), None)


def is_working_time(time: str) -> bool:
    """Принимаем строго HH:MM, от 08:00 до 20:00 включительно."""
    if not isinstance(time, str) or not re.fullmatch(r"([01][0-9]|2[0-3]):[0-5][0-9]", time):
        return False
    hour, minute = map(int, time.split(":"))
    return 8 * 60 <= hour * 60 + minute <= 20 * 60


def create_appointment(
    client_name: str,
    master_id: int,
    service_id: int,
    time: str,
) -> Appoinment | None:
    """Проверяем поля до создания объекта и изменения списка записей."""
    if not isinstance(client_name, str) or not client_name.strip():
        return None
    if type(master_id) is not int or type(service_id) is not int:
        return None
    if not is_working_time(time):
        return None

    master = get_master(master_id)
    service = get_service(service_id)
    if master is None or service is None:
        return None

    appointment = Appoinment(
        id=len(appointments) + 1,
        client_name=client_name.strip(),
        master_id=master.master_id,
        service_id=service.service_id,
        time=time,
    )
    appointments.append(appointment)
    return appointment


def main() -> None:
    # Каждый сценарий начинается с пустого списка.
    appointments.clear()
    create_appointment("Иванова А.А.", 1, 1, "10:00")
    create_appointment("Петрова А.А.", 1, 1, "11:00")
    print("Список записей:")
    for appointment in appointments:
        print(appointment.client_name, appointment.time)

    appointments.clear()
    create_appointment("", 1, 1, "12:00")
    print("\nКоличество записей после попытки с пустым именем:")
    print(len(appointments))

    appointments.clear()
    create_appointment("Сидорова А.А.", 1, 1, "00:00")
    print("\nКоличество записей после попытки вне рабочих часов:")
    print(len(appointments))


if __name__ == "__main__":
    main()
