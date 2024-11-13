from pydantic import BaseModel


class SUserBase(BaseModel):
    username: str
    password: str
    is_addmin: bool


class SMyFileBase(BaseModel):
    filepath: str