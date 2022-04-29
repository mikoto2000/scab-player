CREATE TABLE channel (
  id INTEGER NOT NULL PRIMARY KEY,
  uri VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL
);

CREATE TABLE episode (
  id INTEGER NOT NULL PRIMARY KEY,
  channel_id INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  uri VARCHAR NOT NULL,
  current_time INTEGER,
  is_finish BOOLEAN NOT NULL DEFAULT 0,
  foreign key (channel_id) references channel(id)
);
