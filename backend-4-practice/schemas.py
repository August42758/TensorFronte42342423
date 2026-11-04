from pydantic import BaseModel, ConfigDict, Field


class ServiceCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    categoryId: int = Field(gt=0, strict=True)
    title: str = Field(min_length=1, max_length=100)
    desc: str = Field(min_length=1, max_length=100)
    duration: int = Field(ge=30, le=180, strict=True)
    price: float = Field(gt=0, allow_inf_nan=False, strict=True)


class ServiceResponse(ServiceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    categoryId: int = Field(gt=0, validation_alias="category_id")


class MasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    specialization: str


class CategoryResponse(BaseModel):
    id: int
    name: str
    servicesCount: int

