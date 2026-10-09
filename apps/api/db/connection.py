"""
API-level DB connection stub.
The primary database lives in lab/db/connection.py.
This module is reserved for API-specific persistence (e.g. request logs).
"""
import aiosqlite
import pathlib

_DB_PATH = pathlib.Path(__file__).parent.parent / "data" / "api.db"


def get_db_path() -> pathlib.Path:
    return _DB_PATH


async def get_db() -> aiosqlite.Connection:
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = await aiosqlite.connect(_DB_PATH)
    conn.row_factory = aiosqlite.Row
    return conn
