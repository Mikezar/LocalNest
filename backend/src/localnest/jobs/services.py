import dataclasses
from pathlib import Path

from sqlalchemy.orm import Session

from localnest.db.models import Job, JobKind, JobStatus
from localnest.documents.discovery import (
    MAX_DEPTH,
    discover_filesystem,
    is_directory_supported,
    is_file_supported,
)
from localnest.documents.models import DocumentFile, Folder, Node
from localnest.jobs.models import IndexJobPayload


def create_scan_job(session: Session, path: Path) -> Job:
    if not path.exists():
        raise FileNotFoundError(f"Path '{path}' does not exist.")

    if path.is_file() and not is_file_supported(path):
        raise ValueError(f"File '{path}' is not supported.")
    elif path.is_dir() and not is_directory_supported(path):
        raise ValueError(f"Directory '{path}' is not supported.")

    payload = IndexJobPayload(path=str(path.resolve()))
    job = Job(kind=JobKind.SCAN, status=JobStatus.QUEUED, payload=dataclasses.asdict(payload))

    session.add(job)
    session.commit()

    return job


def _list_files_for_indexing(path: Path) -> tuple[DocumentFile, ...]:
    nodes = discover_filesystem(path, depth=MAX_DEPTH)
    return _get_flattened_files(nodes)


def _get_flattened_files(nodes: tuple[Node, ...]) -> tuple[DocumentFile, ...]:
    files: list[DocumentFile] = []

    for node in nodes:
        if isinstance(node, DocumentFile):
            files.append(node)

        if isinstance(node, Folder):
            files.extend(_get_flattened_files(node.children))

    return tuple(files)
