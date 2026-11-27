import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from localnest.db.models import JobStatus
from localnest.documents.models import DocumentFile, Folder, Node, NodeKind


class FileSystem(BaseModel):
    path: str
    name: str
    kind: NodeKind
    size_bytes: int | None = None
    modified_at: datetime
    children: list[FileSystem] | None = None


class ScanDirectoryResponse(BaseModel):
    job_id: uuid.UUID = Field(..., description="The ID of the created scan job")
    status: JobStatus = Field(..., description="The status of the created scan job")


def to_file_system_dto(nodes: tuple[Node, ...]) -> list[FileSystem]:
    return [
        FileSystem(
            path=n.path.as_posix(),
            name=n.name,
            size_bytes=n.size_bytes if isinstance(n, DocumentFile) else None,
            modified_at=n.modified_at,
            kind=n.kind,
            children=to_file_system_dto(n.children) if isinstance(n, Folder) else None,
        )
        for n in nodes
    ]
