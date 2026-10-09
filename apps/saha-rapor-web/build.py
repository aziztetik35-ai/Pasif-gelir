"""Build the landing page.

    python3 build.py

Reads src/index.template.html and src/icons.json (Lucide icon shapes, ISC license),
replaces every __ICON_<name>__ with the SVG shapes, and writes public/index.html.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
icons = json.loads((HERE / "src" / "icons.json").read_text())
html = (HERE / "src" / "index.template.html").read_text()

missing = sorted(set(re.findall(r"__ICON_([a-z0-9-]+)__", html)) - set(icons))
if missing:
    raise SystemExit(f"Unknown icons: {missing}")

html = re.sub(r"__ICON_([a-z0-9-]+)__", lambda m: icons[m.group(1)], html)
html = html.replace("<script>\n(() => {", "<script>\nconst ICONS = " + json.dumps(icons) + ";\n(() => {", 1)
(HERE / "public" / "index.html").write_text(html)
print(f"public/index.html written ({len(html) // 1024} KB)")
