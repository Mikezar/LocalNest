from sqlalchemy import Engine, create_engine, event
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import ConnectionPoolEntry

BUSY_TIMEOUT_MS = 5000


def create_db_engine(connection_string: str) -> Engine:
    engine = create_engine(connection_string, connect_args={"check_same_thread": False})

    if engine.dialect.name == "sqlite":

        @event.listens_for(engine, "connect")
        def set_sqlite_pragmas(
            dbapi_connection: DBAPIConnection, _connection_record: ConnectionPoolEntry
        ) -> None:
            # SQLite settings are per connection, so they are set on every new one.
            cursor = dbapi_connection.cursor()
            try:
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute(f"PRAGMA busy_timeout={BUSY_TIMEOUT_MS}")
            finally:
                cursor.close()

    return engine


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, expire_on_commit=False)
