CREATE TABLE channel (
  uri VARCHAR NOT NULL  PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE episode (
  id INTEGER NOT NULL PRIMARY KEY,
  channel_uri VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  uri VARCHAR NOT NULL,
  current_time INTEGER,
  is_finish BOOLEAN NOT NULL DEFAULT 0,
  foreign key (channel_uri) references channel(uri)
);
