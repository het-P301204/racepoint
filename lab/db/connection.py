import aiosqlite
import pathlib

_DB_PATH = pathlib.Path(__file__).parent.parent / "data" / "racepoint.db"
_SCHEMA_PATH = pathlib.Path(__file__).parent / "schema.sql"


def get_db_path() -> pathlib.Path:
    return _DB_PATH


async def get_db() -> aiosqlite.Connection:
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = await aiosqlite.connect(_DB_PATH)
    conn.row_factory = aiosqlite.Row
    return conn


async def init_db() -> None:
    schema = _SCHEMA_PATH.read_text(encoding="utf-8")
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(_DB_PATH) as db:
        await db.executescript(schema)
        await db.commit()
