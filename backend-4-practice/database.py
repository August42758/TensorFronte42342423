from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    pass


def create_db_engine(path: Path):
    db_engine = create_engine(
        f"sqlite:///{path.as_posix()}",
        connect_args={"check_same_thread": False},
    )

    @event.listens_for(db_engine, "connect")
    def enable_foreign_keys(connection, connection_record):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return db_engine


DATABASE_PATH = Path(__file__).resolve().parent / "salon.db"
engine = create_db_engine(DATABASE_PATH)


def get_db():
    with Session(engine) as session:
        yield session

