from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models import Category, Master, Service
from schemas import CategoryResponse, MasterResponse, ServiceCreate, ServiceResponse
from seed import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="ЛУНА — услуги салона", lifespan=lifespan)


@app.post("/services", response_model=ServiceResponse, status_code=201)
def create_service(data: ServiceCreate, db: Session = Depends(get_db)):
    if db.get(Category, data.categoryId) is None:
        raise HTTPException(status_code=404, detail="Category not found")

    service = Service(
        category_id=data.categoryId,
        title=data.title,
        desc=data.desc,
        duration=data.duration,
        price=data.price,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@app.get("/masters", response_model=list[MasterResponse])
def get_masters(specialization: str | None = None, db: Session = Depends(get_db)):
    query = select(Master).order_by(Master.id)
    if specialization is not None:
        query = query.where(Master.specialization == specialization)
    return db.scalars(query).all()


@app.get("/masters/{master_id}", response_model=MasterResponse)
def get_master(master_id: int, db: Session = Depends(get_db)):
    master = db.get(Master, master_id)
    if master is None:
        raise HTTPException(status_code=404, detail="Master not found")
    return master


def categories_query():
    return (
        select(Category.id, Category.name, func.count(Service.id).label("servicesCount"))
        .outerjoin(Service, Service.category_id == Category.id)
        .group_by(Category.id, Category.name)
        .order_by(Category.id)
    )


@app.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.execute(categories_query()).mappings().all()


@app.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.execute(categories_query().where(Category.id == category_id)).mappings().first()
    if category is None:
        return PlainTextResponse("Category not found", status_code=404)
    return category


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8002)

