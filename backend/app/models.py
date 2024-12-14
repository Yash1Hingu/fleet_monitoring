from pydantic import BaseModel
from typing import Tuple

class Robot(BaseModel):
    id: str
    online: bool
    battery: int
    cpu: int
    ram: int
    location: Tuple[float, float]
    last_updated: str
