from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from localnest.documents import FileStructureDiscoverService
from localnest.documents.schemas import FileSystem, to_file_system_dto

router = APIRouter()


@router.get("/drives")
def read_drives() -> list[FileSystem]:
    nodes = FileStructureDiscoverService().list_drives()

    return to_file_system_dto(nodes)


@router.get("/directories/{path:path}")
def read_directory(path: str, depth: Annotated[int, Query(ge=0, le=10)] = 1) -> list[FileSystem]:
    try:
        nodes = FileStructureDiscoverService().discover(Path(path), depth)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except NotADirectoryError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return to_file_system_dto(nodes)
