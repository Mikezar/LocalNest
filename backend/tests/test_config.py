from pathlib import Path

import pytest

from localnest.config import Settings


@pytest.fixture(autouse=True)
def clean_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("LOCALNEST_DATA_DIR", raising=False)


def test_data_dir_defaults_to_local_app_data(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setenv("LOCALAPPDATA", str(tmp_path))

    assert Settings().data_dir == tmp_path / "LocalNest"


def test_data_dir_falls_back_to_home_without_local_app_data(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.delenv("LOCALAPPDATA", raising=False)
    monkeypatch.setattr(Path, "home", lambda: tmp_path)

    assert Settings().data_dir == tmp_path / ".local" / "share" / "LocalNest"


def test_data_dir_can_be_set_by_environment_variable(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setenv("LOCALNEST_DATA_DIR", str(tmp_path))

    assert Settings().data_dir == tmp_path


def test_data_dir_can_be_passed_directly(tmp_path: Path) -> None:
    assert Settings(data_dir=tmp_path).data_dir == tmp_path


def test_database_lives_in_data_dir(tmp_path: Path) -> None:
    settings = Settings(data_dir=tmp_path)

    assert settings.database_path == tmp_path / "localnest.db"
    assert settings.database_url == f"sqlite:///{(tmp_path / 'localnest.db').as_posix()}"


def test_creating_settings_does_not_create_folders(tmp_path: Path) -> None:
    data_dir = tmp_path / "not-yet"

    Settings(data_dir=data_dir)

    assert not data_dir.exists()
