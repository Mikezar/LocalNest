from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from localnest.db.session import SessionDep
from localnest.documents import discover_filesystem, list_drives
from localnest.documents.schemas import FileSystem, ScanDirectoryResponse, to_file_system_dto
from localnest.jobs.services import create_scan_job

router = APIRouter()


@router.get("/drives")
def read_drives() -> list[FileSystem]:
    nodes = list_drives()

    return to_file_system_dto(nodes)


@router.get("/directories/{path:path}")
def read_directory(path: str, depth: Annotated[int, Query(ge=0, le=10)] = 1) -> list[FileSystem]:
    try:
        nodes = discover_filesystem(Path(path), depth)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except NotADirectoryError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return to_file_system_dto(nodes)


@router.post("/directories/{path:path}", status_code=202)
def scan_directory(session: SessionDep, path: str) -> ScanDirectoryResponse:
    job = create_scan_job(session, Path(path))

    return ScanDirectoryResponse(job_id=job.id, status=job.status)
