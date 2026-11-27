from pathlib import Path


def to_path_key(path: Path) -> str:
    return path.resolve().as_posix().casefold()
