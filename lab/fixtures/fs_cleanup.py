import os
import shutil
import tempfile
import pathlib

LAB_TEMP_ROOT = pathlib.Path(tempfile.gettempdir()) / "racepoint-lab"


def get_lab_dir(scenario_id: str, run_id: str) -> pathlib.Path:
    """Returns a fresh, empty temp directory for a lab run."""
    lab_dir = LAB_TEMP_ROOT / scenario_id / run_id
    lab_dir.mkdir(parents=True, exist_ok=True)
    return lab_dir


def cleanup_lab_dir(lab_dir: pathlib.Path) -> None:
    """Safely removes the lab directory."""
    if not str(lab_dir).startswith(str(LAB_TEMP_ROOT)):
        raise ValueError(f"Refusing to clean path outside lab root: {lab_dir}")
    if lab_dir.exists():
        shutil.rmtree(lab_dir)
