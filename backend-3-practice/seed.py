from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, engine
from models import Master


def init_db(db_engine=engine):
    """Создаём таблицы и заполняем только пустую таблицу мастеров."""
    Base.metadata.create_all(db_engine)
    with Session(db_engine) as session:
        if session.scalar(select(Master.id).limit(1)) is None:
            session.add_all([
                Master(name="Анна", specialization="Парикмахер"),
                Master(name="Мария", specialization="Визажист"),
            ])
            session.commit()
