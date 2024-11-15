from pydantic import BaseModel
from typing import Optional


class SUserBase(BaseModel):
    username: str
    password: str
    is_admin: bool


class SUserSignUp(SUserBase):
    admin_key: Optional[str]


class SUserPayload(BaseModel):
    user_id: int
    username: str
    is_admin: bool

