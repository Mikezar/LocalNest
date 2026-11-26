import os
from datetime import datetime
from pathlib import Path

from localnest.documents.models import DocumentFile, Drive, Folder, Node

SUPPORTED_EXTENSIONS = frozenset({".txt", ".md", ".pdf", ".docx"})


class FileStructureDiscoverService:
    def list_drives(self) -> tuple[Drive, ...]:
        drives = [Path(drive).as_posix() for drive in os.listdrives()]

        return tuple(
            Drive(name=drive, path=Path(drive), modified_at=datetime.now()) for drive in drives
        )

    def discover(self, directory: Path, depth: int = 1) -> tuple[Node, ...]:
        if not directory.exists():
            raise FileNotFoundError(f"{directory} does not exist")

        if not directory.is_dir():
            raise NotADirectoryError(f"{directory} is not a valid directory")

        nodes: list[Node] = []

        for item in sorted(directory.iterdir(), key=lambda p: p.name.casefold()):
            if item.is_symlink() or item.is_junction():
                continue

            item_stat = item.stat()
            modified_at: datetime = datetime.fromtimestamp(item_stat.st_mtime)

            try:
                if item.is_file() and self.is_file_supported(item):
                    nodes.append(
                        DocumentFile(
                            name=item.name,
                            path=item,
                            extension=item.suffix.lower(),
                            modified_at=modified_at,
                            size_bytes=item_stat.st_size,
                        )
                    )
                elif item.is_dir():
                    nodes.append(
                        Folder(
                            name=item.name,
                            path=item,
                            modified_at=modified_at,
                            children=self.discover(item, depth=depth - 1) if depth > 0 else (),
                        )
                    )
            except PermissionError:
                continue
        return tuple(nodes)

    def is_file_supported(self, file: Path) -> bool:
        return file.suffix.lower() in SUPPORTED_EXTENSIONS
