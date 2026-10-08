"""Command line use:

    python -m commissionpack samples/tia_plc_tags_sample.xlsx -o package.xlsx --lang tr \
        --project "Line 3 Retrofit" --customer "ACME" --license-key XXXX
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .generator import ProjectInfo, build_package
from .license import check_license
from .model import KINDS
from .parser import parse_file


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="commissionpack", description="IO list -> commissioning document package")
    ap.add_argument("input", help="IO list (.xlsx, .xlsm, .csv) or TIA Portal PLC tag export")
    ap.add_argument("-o", "--output", help="output .xlsx (default: <input>_commissioning.xlsx)")
    ap.add_argument("--lang", default="en", choices=["en", "tr", "de"])
    ap.add_argument("--project", default="")
    ap.add_argument("--customer", default="")
    ap.add_argument("--machine", default="")
    ap.add_argument("--plc", default="")
    ap.add_argument("--doc-no", default="")
    ap.add_argument("--revision", default="0")
    ap.add_argument("--prepared-by", default="")
    ap.add_argument("--license-key", default="")
    args = ap.parse_args(argv)

    src = Path(args.input)
    try:
        result = parse_file(src)
    except (ValueError, OSError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    lic = check_license(args.license_key)
    info = ProjectInfo(project=args.project, customer=args.customer, machine=args.machine, plc=args.plc,
                       doc_no=args.doc_no, revision=args.revision, prepared_by=args.prepared_by)
    data = build_package(result, info, lang=args.lang, licensed=lic.valid, source_name=src.name)
    out = Path(args.output) if args.output else src.with_name(src.stem + "_commissioning.xlsx")
    out.write_bytes(data)

    counts = ", ".join(f"{k}={result.count(k)}" for k in KINDS)
    print(f"Format: {result.source_format} | IO points: {len(result.points)} ({counts}) | skipped rows: {result.skipped}")
    for w in result.warnings:
        print(f"WARNING: {w}")
    print(f"License: {lic.message}")
    print(f"Written: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
