"""Validate `0x` + 40 hex digit Ethereum addresses from query params."""

import re
from fastapi import HTTPException, Query

_ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")


def normalize_ethereum_address(address: str) -> str:
    s = (address or "").strip()
    if not _ADDRESS_RE.match(s):
        raise ValueError("invalid Ethereum address")
    return s.lower()


def ethereum_address_query(
    address: str = Query(..., description="Wallet address (0x + 40 hex characters)"),
) -> str:
    try:
        return normalize_ethereum_address(address)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid Ethereum address. Use a 0x-prefixed 40-character hex string.",
        )
