"""Create the sample input files.

    python samples/make_samples.py

Output:
    samples/tia_plc_tags_sample.xlsx   (TIA Portal "PLC Tags" export format)
    samples/io_list_generic_tr.csv     (generic IO list, Turkish headers, ';')
"""

from __future__ import annotations

import csv
from pathlib import Path

from openpyxl import Workbook

HERE = Path(__file__).parent

# (name, data type, address, comment)
TAGS = [
    ("EStop_Panel_CH1", "Bool", "%I0.0", "Emergency stop main panel channel 1"),
    ("EStop_Panel_CH2", "Bool", "%I0.1", "Emergency stop main panel channel 2"),
    ("Door1_Closed", "Bool", "%I0.2", "Safety door 1 closed (interlock)"),
    ("LightCurtain_OK", "Bool", "%I0.3", "Light curtain infeed OK"),
    ("PB_Start", "Bool", "%I0.4", "Push button start"),
    ("PB_Stop", "Bool", "%I0.5", "Push button stop"),
    ("PB_Reset", "Bool", "%I0.6", "Fault reset"),
    ("SS_AutoManual", "Bool", "%I0.7", "Selector auto / manual"),
    ("Q1_MCB_OK", "Bool", "%I1.0", "Main breaker Q1 feedback"),
    ("M1_Conveyor_Running", "Bool", "%I1.1", "Conveyor motor M1 running feedback"),
    ("M2_Pump_Running", "Bool", "%I1.2", "Hydraulic pump M2 running"),
    ("Cyl1_Extended", "Bool", "%I1.3", "Cylinder 1 end position extended"),
    ("Cyl1_Retracted", "Bool", "%I1.4", "Cylinder 1 end position retracted"),
    ("Prox_PartPresent", "Bool", "%I1.5", "Inductive sensor part present"),
    ("Photo_Infeed", "Bool", "%I1.6", "Photo sensor infeed"),
    ("Photo_Outfeed", "Bool", "%I1.7", "Photo sensor outfeed"),
    ("LS_Tank_High", "Bool", "%I2.0", "Level switch tank high"),
    ("PS_Air_OK", "Bool", "%I2.1", "Pressure switch compressed air OK"),
    ("VFD1_Ready", "Bool", "%I2.2", "G120 drive conveyor ready"),
    ("VFD1_Fault", "Bool", "%I2.3", "G120 drive conveyor fault"),
    ("M1_Contactor", "Bool", "%Q0.0", "Conveyor motor M1 contactor"),
    ("M2_Pump_Contactor", "Bool", "%Q0.1", "Hydraulic pump M2 contactor"),
    ("YV1_Cyl1_Extend", "Bool", "%Q0.2", "Valve cylinder 1 extend"),
    ("YV2_Cyl1_Retract", "Bool", "%Q0.3", "Valve cylinder 1 retract"),
    ("HL_Green", "Bool", "%Q0.4", "Signal lamp green"),
    ("HL_Red", "Bool", "%Q0.5", "Signal lamp red"),
    ("Horn", "Bool", "%Q0.6", "Alarm horn"),
    ("Heater1", "Bool", "%Q0.7", "Heater zone 1 contactor"),
    ("VFD1_Enable", "Bool", "%Q1.0", "G120 drive conveyor enable"),
    ("TT101_Temp", "Int", "%IW64", "Temperature tank PT100"),
    ("PT102_Pressure", "Int", "%IW66", "Hydraulic pressure transmitter"),
    ("LT103_Level", "Int", "%IW68", "Tank level transmitter"),
    ("FT104_Flow", "Int", "%IW70", "Cooling water flow"),
    ("VFD1_SpeedSP", "Int", "%QW80", "Conveyor speed setpoint to drive"),
    ("PV201_Position", "Int", "%QW82", "Proportional valve position setpoint"),
    # Non-physical tags: the parser must skip these
    ("Auto_Mode", "Bool", "%M10.0", "Internal flag auto mode"),
    ("Cycle_Counter", "DInt", "%MD20", "Cycle counter"),
    ("Clock_1Hz", "Bool", "%M0.5", "Clock memory 1 Hz"),
]

RANGES = {
    "TT101_Temp": (0, 150, "°C"),
    "PT102_Pressure": (0, 250, "bar"),
    "LT103_Level": (0, 2000, "mm"),
    "FT104_Flow": (0, 60, "l/min"),
    "VFD1_SpeedSP": (0, 1500, "rpm"),
    "PV201_Position": (0, 100, "%"),
}


def make_tia() -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = "PLC Tags"
    ws.append(["Name", "Path", "Data Type", "Logical Address", "Comment", "Hmi Visible", "Hmi Accessible",
               "Hmi Writeable", "Typeobject ID", "Version ID"])
    for name, dtype, addr, comment in TAGS:
        ws.append([name, "Default tag table", dtype, addr, comment, "True", "True", "True", "", ""])
    out = HERE / "tia_plc_tags_sample.xlsx"
    wb.save(out)
    return out


def make_generic_csv() -> Path:
    out = HERE / "io_list_generic_tr.csv"
    with out.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["Etiket", "Adres", "Veri Tipi", "Açıklama", "Pano", "Aralık Min", "Aralık Max", "Birim"])
        for name, dtype, addr, comment in TAGS:
            rmin, rmax, unit = RANGES.get(name, ("", "", ""))
            w.writerow([name, addr, dtype, comment, "+CP1", rmin, rmax, unit])
    return out


if __name__ == "__main__":
    print(make_tia())
    print(make_generic_csv())
