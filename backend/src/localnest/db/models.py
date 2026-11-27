import uuid
from datetime import UTC, datetime
from enum import StrEnum, auto

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from localnest.db.base import Base


class JobStatus(StrEnum):
    QUEUED = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()


class FileStatus(StrEnum):
    INDEXED = auto()
    PENDING = auto()
    STALE = auto()
    FAILED = auto()
    MISSING = auto()


class DocumentTaskStatus(StrEnum):
    QUEUED = auto()
    PROCESSING = auto()
    SUCCEEDED = auto()
    FAILED = auto()
    SKIPPED = auto()


class JobKind(StrEnum):
    SCAN = auto()
    INDEX = auto()


def utc_now() -> datetime:
    return datetime.now(UTC)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    path_key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    status: Mapped[FileStatus] = mapped_column(
        Enum(
            FileStatus,
            create_constraint=True,
            name="file_status",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    modified_at_disk: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    tasks: Mapped[list[DocumentTask]] = relationship(
        "DocumentTask",
        back_populates="document",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    status: Mapped[JobStatus] = mapped_column(
        Enum(
            JobStatus,
            create_constraint=True,
            name="job_status",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
    )
    kind: Mapped[JobKind] = mapped_column(
        Enum(
            JobKind,
            create_constraint=True,
            name="job_kind",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)
    payload: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False)
    error: Mapped[str | None] = mapped_column(String)
    tasks: Mapped[list[DocumentTask]] = relationship(
        "DocumentTask", back_populates="job", cascade="all, delete-orphan", passive_deletes=True
    )


class DocumentTask(Base):
    __tablename__ = "document_tasks"
    __table_args__ = (UniqueConstraint("job_id", "document_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[DocumentTaskStatus] = mapped_column(
        Enum(
            DocumentTaskStatus,
            create_constraint=True,
            name="document_task_status",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utc_now)
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error: Mapped[str | None] = mapped_column(String)
    job: Mapped[Job] = relationship("Job", back_populates="tasks")
    document: Mapped[Document] = relationship("Document", back_populates="tasks")
