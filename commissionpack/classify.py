"""Rule-based device classification from tag name + comment (EN / TR / DE).

The rules are deterministic on purpose: the same IO list always gives the
same documents, and no project data leaves the computer.
"""

from __future__ import annotations

import re

from .model import IOPoint

_FOLD = str.maketrans("ıİşŞğĞüÜöÖçÇäÄß", "iisSgGuUoOcCaAs")

# (device, pattern) - the first match wins, so the order is important.
RULES: list[tuple[str, str]] = [
    ("safety", r"e[-_ ]?stop|emergency|acil|not[-_ ]?(aus|halt)|light[-_ ]?curtain|isik[-_ ]?(perde|bariyer)|"
               r"lichtgitter|safety|guvenlik|sicherheit|interlock|safe[-_ ]?door|kapi[-_ ]?kilit|\bf[- ]?d[io]\b"),
    ("drive", r"\bvfd\b|inverter|frequenz|umrichter|surucu|\bdrive|g120|s120|s210|v90|\bfc\b|speed[-_ ]?(sp|set)|\bhiz"),
    ("temperature", r"temp|pt100|pt1000|thermo|sicaklik|\btt\d|\bte\d"),
    ("pressure", r"press|basinc|druck|\bpt\d|\bpi\d"),
    ("level", r"level|seviye|fullstand|niveau|\blt\d|\bls[hl]"),
    ("flow", r"flow|debi|akis|durchfluss|\bft\d|\bfi\d"),
    ("heater", r"heater|isitici|rezistans|heizung"),
    ("motor", r"motor|\bmtr|pump|pompa|\bfan\b|conveyor|konveyor|\bband|contactor|kontaktor|schutz|\bkm\d|starter"),
    ("valve", r"valve|\bvlv|valf|ventil|solenoid|\byv\d|cylinder|silindir|zylinder|piston"),
    ("feedback", r"breaker|\bmcb|sigorta|termik|thermal|overload|motorschutz|\bq\d+[-_ ]?(fb|ok)|feedback|geri[-_ ]?bildirim|ruckmeld"),
    ("pushbutton", r"button|\bpb|buton|taster|\bstart|\bstop|reset|selector|secici|wahlschalter|\back\b|onay"),
    ("indicator", r"lamp|lamba|indicator|beacon|horn|siren|korna|hupe|leuchte|melder|signal[-_ ]?light|\bhl\d"),
    ("sensor", r"prox|sensor|enduktif|inductive|kapasitif|capacitive|photo|fotosel|limit|\bls\d|switch|"
               r"schalter|initiator|bero|encoder|end[-_ ]?pos|reed"),
]

_COMPILED = [(name, re.compile(pat)) for name, pat in RULES]


def fold(text: str) -> str:
    return text.translate(_FOLD).lower()


def classify(point: IOPoint) -> tuple[str, bool]:
    """Return (device_category, is_safety_related)."""
    # Underscores are word characters for \b, so treat them as spaces.
    text = fold(f"{point.tag} {point.comment}").replace("_", " ")
    for name, rx in _COMPILED:
        if rx.search(text):
            return name, name == "safety"
    return "generic", False
