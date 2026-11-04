from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, engine
from models import Category, Master


def init_db(bind=engine):
    Base.metadata.create_all(bind)
    with Session(bind) as session:
        if session.scalar(select(Master.id).limit(1)) is None:
            session.add_all([
                Master(id=1, name="Анна", specialization="Парикмахер"),
                Master(id=2, name="Мария", specialization="Визажист"),
            ])
        if session.scalar(select(Category.id).limit(1)) is None:
            session.add_all([
                Category(id=1, name="Стрижки и укладки"),
                Category(id=2, name="Маникюр и педикюр"),
                Category(id=3, name="Брови и ресницы"),
                Category(id=4, name="Спа-процедуры"),
            ])
        session.commit()

