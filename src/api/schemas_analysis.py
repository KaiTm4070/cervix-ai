from datetime import datetime

from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    id: str
    date: datetime
    classification: str
    confidence: float
    model: str
