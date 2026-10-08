"""CommissionPack web app (Streamlit).

    streamlit run app.py

Environment variables (optional):
    POLAR_ORGANIZATION_ID  - enables license key check with Polar.sh
    CP_DEV_LICENSE_KEYS    - comma separated test keys
    CP_BUY_URL             - checkout link shown to free users
"""

from __future__ import annotations

import os
from pathlib import Path

import streamlit as st

from commissionpack import FREE_POINT_LIMIT, __version__
from commissionpack.generator import ProjectInfo, build_package
from commissionpack.i18n import device_name
from commissionpack.license import check_license
from commissionpack.model import KINDS
from commissionpack.parser import parse_file

BUY_URL = os.environ.get("CP_BUY_URL", "https://commissionpack.io/#pricing")
SAMPLES = Path(__file__).parent / "samples"

st.set_page_config(page_title="CommissionPack - IO list to FAT/SAT package", page_icon="✅", layout="wide")

# ---------------------------------------------------------------- sidebar: license
with st.sidebar:
    st.header("License")
    key = st.text_input("License key", type="password", help="You get the key by e-mail after purchase.")
    if st.session_state.get("license_key") != key:
        st.session_state["license_key"] = key
        st.session_state["license"] = check_license(key)
    lic = st.session_state["license"]
    if lic.valid:
        st.success(lic.message)
    else:
        prefix = "" if lic.message == "Free edition" else f"{lic.message}. "
        st.info(f"{prefix}Free edition: max {FREE_POINT_LIMIT} IO points.")
        st.link_button("Get the full version", BUY_URL)
    st.divider()
    st.caption("Sample files")
    for name in ("tia_plc_tags_sample.xlsx", "io_list_generic_tr.csv"):
        path = SAMPLES / name
        if path.exists():
            st.download_button(name, path.read_bytes(), file_name=name, key=f"dl_{name}")
    st.caption(f"CommissionPack {__version__}")

# ---------------------------------------------------------------- main
st.title("IO list → commissioning package in 1 minute")
st.write(
    "Upload a **TIA Portal PLC tag export** or any **IO list** (Excel / CSV). "
    "You get one Excel file with IO checkout sheets, analog loop checks, FAT and SAT protocols, "
    "a punch list and sign-off pages."
)
st.caption("Privacy: the file is processed in memory and is not stored. No AI service receives your data.")

upload = st.file_uploader("IO list", type=["xlsx", "xlsm", "csv"])

col1, col2, col3 = st.columns(3)
with col1:
    project = st.text_input("Project")
    customer = st.text_input("Customer")
    machine = st.text_input("Machine / line")
with col2:
    plc = st.text_input("PLC / controller", placeholder="e.g. S7-1516F, TIA Portal V19")
    doc_no = st.text_input("Document no.")
    revision = st.text_input("Revision", value="0")
with col3:
    prepared_by = st.text_input("Prepared by")
    lang = st.selectbox("Document language", options=["en", "tr", "de"],
                        format_func={"en": "English", "tr": "Türkçe", "de": "Deutsch"}.get)

if upload is None:
    st.stop()

try:
    result = parse_file(upload, filename=upload.name)
except ValueError as e:
    st.error(str(e))
    st.stop()

st.subheader("What we found")
cols = st.columns(6)
for c, kind in zip(cols, KINDS):
    c.metric(kind, result.count(kind))
cols[4].metric("Safety IO", sum(p.safety for p in result.points))
cols[5].metric("Skipped rows", result.skipped, help="Memory bits, DB tags, constants: no physical IO.")
st.caption("Detected format: " + ("TIA Portal PLC tag export" if result.source_format == "tia_portal" else "generic IO list"))
for w in result.warnings[:20]:
    st.warning(w)

with st.expander("Preview (first 200 rows)"):
    st.dataframe(
        [{"Kind": p.kind, "Address": p.address, "Tag": p.tag, "Comment": p.comment,
          "Device": device_name(p.device, "en"), "Safety": "yes" if p.safety else ""}
         for p in result.points[:200]],
        use_container_width=True, hide_index=True,
    )

if not result.points:
    st.stop()

if not lic.valid and len(result.points) > FREE_POINT_LIMIT:
    st.warning(f"Free edition: the package will contain {FREE_POINT_LIMIT} of {len(result.points)} IO points. "
               f"[Get the full version]({BUY_URL}).")

info = ProjectInfo(project=project, customer=customer, machine=machine, plc=plc, doc_no=doc_no,
                   revision=revision, prepared_by=prepared_by)
data = build_package(result, info, lang=lang, licensed=lic.valid, source_name=upload.name)
stem = (project or Path(upload.name).stem).replace(" ", "_")
st.download_button("⬇ Download commissioning package (.xlsx)", data, file_name=f"{stem}_commissioning_{lang}.xlsx",
                   mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", type="primary")
