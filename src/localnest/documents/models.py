from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum, auto
from pathlib import Path


class NodeKind(StrEnum):
    FILE = auto()
    FOLDER = auto()
    DRIVE = auto()


@dataclass(frozen=True, slots=True, kw_only=True)
class Node(ABC):
    path: Path
    name: str
    modified_at: datetime

    @property
    @abstractmethod
    def kind(self) -> NodeKind: ...


@dataclass(frozen=True, slots=True, kw_only=True)
class Drive(Node):
    @property
    def kind(self) -> NodeKind:
        return NodeKind.DRIVE


@dataclass(frozen=True, slots=True, kw_only=True)
class Folder(Node):
    children: tuple[Node, ...] = ()

    @property
    def kind(self) -> NodeKind:
        return NodeKind.FOLDER


@dataclass(frozen=True, slots=True, kw_only=True)
class DocumentFile(Node):
    extension: str
    size_bytes: int

    @property
    def kind(self) -> NodeKind:
        return NodeKind.FILE
