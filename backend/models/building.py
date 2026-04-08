from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Room(BaseModel):
    id: str
    name: str
    type: str = "general"
    area_sqft: int = 500


class Floor(BaseModel):
    id: str
    number: int
    rooms: List[Room] = Field(default_factory=list)


class Budget(BaseModel):
    total: int = 5_000_000
    used: int = 0
    remaining: int = 5_000_000
    costPerFloor: int = 500_000
    costPerRoom: int = 100_000
    costPerSqft: int = 200


class Constraints(BaseModel):
    maxFloors: int = 10
    maxRoomsPerFloor: int = 6
    minRoomsPerFloor: int = 1
    defaultRoomSqft: int = 500
    shape: str = "rectangle"


class HistoryEntry(BaseModel):
    action: str
    timestamp: str
    details: str


class BuildingState(BaseModel):
    floors: List[Floor] = Field(default_factory=list)
    budget: Budget = Field(default_factory=Budget)
    constraints: Constraints = Field(default_factory=Constraints)
    history: List[HistoryEntry] = Field(default_factory=list)


# --- Request / Response models ---

class ChatRequest(BaseModel):
    message: str


class MaterialsCostBreakdown(BaseModel):
    concrete: int
    steel: int
    glass: int
    total: int


class ValidationResult(BaseModel):
    valid: bool
    violations: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)


class AnimationHint(BaseModel):
    type: str          # "add_floor", "remove_floor", "add_rooms", "remove_rooms", "error"
    target: dict = Field(default_factory=dict)   # e.g. { "floorNumber": 1, "count": 2 }


class ChatResponse(BaseModel):
    message: str
    message_type: str = "info"   # "success" | "error" | "warning" | "info"
    updatedState: Optional[BuildingState] = None
    suggestions: List[str] = Field(default_factory=list)
    actionLog: Optional[HistoryEntry] = None
    animationHint: Optional[AnimationHint] = None
    costBreakdown: Optional[MaterialsCostBreakdown] = None


class InterpretedAction(BaseModel):
    action: str
    params: dict = Field(default_factory=dict)
    confidence: float = 1.0
    clarification_needed: bool = False
    clarification_message: str = ""
