"""Data model for one IO point."""

from dataclasses import dataclass, field

# Signal kinds
DI = "DI"
DO = "DO"
AI = "AI"
AO = "AO"
KINDS = (DI, DO, AI, AO)


@dataclass
class IOPoint:
    tag: str
    address: str  # normalized, e.g. "%I0.0", "%IW64"
    kind: str  # DI / DO / AI / AO
    data_type: str = ""
    comment: str = ""
    device: str = "generic"  # filled by classify.py
    safety: bool = False
    range_min: float | None = None
    range_max: float | None = None
    unit: str = ""
    location: str = ""


@dataclass
class ParseResult:
    points: list[IOPoint] = field(default_factory=list)
    skipped: int = 0  # rows that are not physical IO (M, DB, constants ...)
    warnings: list[str] = field(default_factory=list)
    source_format: str = ""  # "tia_portal" or "generic"

    def count(self, kind: str) -> int:
        return sum(1 for p in self.points if p.kind == kind)
