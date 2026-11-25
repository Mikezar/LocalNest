from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from localnest.main import app

client = TestClient(app)


def test_read_directory(sample_tree: Path) -> None:
    response = client.get(f"/directories/{sample_tree.as_posix()}")

    assert response.status_code == 200

    data = response.json()

    assert [node["name"] for node in data] == ["#2141!~#$422", "folder_1", "My Folder"]
    assert all(node["kind"] == "folder" for node in data)

    folder_with_children = next(node for node in data if node["name"] == "My Folder")
    assert folder_with_children["children"] is not None
    assert [child["name"] for child in folder_with_children["children"]] == [
        "file1.txt",
        "My Folder 2",
    ]


def test_read_directory_with_nonexistent_directory(sample_tree: Path) -> None:
    response = client.get(f"/directories/{(sample_tree / 'nonexistent').as_posix()}")
    assert response.status_code == 404


def test_read_directory_with_not_a_directory(sample_tree: Path) -> None:
    response = client.get(f"/directories/{(sample_tree / 'My Folder' / 'file1.txt').as_posix()}")
    assert response.status_code == 400


@pytest.fixture
def sample_tree(tmp_path: Path) -> Path:
    (tmp_path / "folder_1").mkdir()
    (tmp_path / "My Folder").mkdir()
    (tmp_path / "My Folder" / "My Folder 2").mkdir()
    (tmp_path / "My Folder" / "file1.txt").write_text("content")
    (tmp_path / "My Folder" / "image_1.jpeg").touch()
    (tmp_path / "#2141!~#$422").mkdir()
    (tmp_path / "#2141!~#$422" / "file2.txt").write_text("content")
    return tmp_path
