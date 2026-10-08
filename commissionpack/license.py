"""License key check.

Order of checks:
1. Empty key            -> free edition.
2. CP_DEV_LICENSE_KEYS  -> comma separated test keys (local testing only).
3. Polar.sh             -> POST /v1/customer-portal/license-keys/validate
                           (needs env POLAR_ORGANIZATION_ID).

Verify the Polar endpoint against https://docs.polar.sh before going live.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass

POLAR_API = os.environ.get("POLAR_API_URL", "https://api.polar.sh")


@dataclass
class LicenseStatus:
    valid: bool
    message: str


def check_license(key: str | None) -> LicenseStatus:
    key = (key or "").strip()
    if not key:
        return LicenseStatus(False, "Free edition")

    dev_keys = {k.strip() for k in os.environ.get("CP_DEV_LICENSE_KEYS", "").split(",") if k.strip()}
    if key in dev_keys:
        return LicenseStatus(True, "Development license")

    org_id = os.environ.get("POLAR_ORGANIZATION_ID", "").strip()
    if not org_id:
        return LicenseStatus(False, "License server is not configured")

    body = json.dumps({"key": key, "organization_id": org_id}).encode()
    req = urllib.request.Request(
        f"{POLAR_API}/v1/customer-portal/license-keys/validate",
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        if e.code in (404, 422):
            return LicenseStatus(False, "License key not found")
        return LicenseStatus(False, f"License server error ({e.code})")
    except (urllib.error.URLError, TimeoutError) as e:
        return LicenseStatus(False, f"License server not reachable: {e}")

    if data.get("status") == "granted":
        return LicenseStatus(True, "License valid")
    return LicenseStatus(False, f"License status: {data.get('status', 'unknown')}")
