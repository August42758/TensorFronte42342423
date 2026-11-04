from sqlalchemy import CheckConstraint, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Master(Base):
    __tablename__ = "masters"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialization: Mapped[str] = mapped_column(String(100), nullable=False)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)


class Service(Base):
    __tablename__ = "services"
    __table_args__ = (
        CheckConstraint("length(trim(title)) BETWEEN 1 AND 100", name="valid_title"),
        CheckConstraint('length(trim("desc")) BETWEEN 1 AND 100', name="valid_desc"),
        CheckConstraint("duration BETWEEN 30 AND 180", name="valid_duration"),
        CheckConstraint("price > 0", name="positive_price"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    desc: Mapped[str] = mapped_column(String(100), nullable=False)
    duration: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)

