-- Messages table, storing the content and other metadata for each message
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Users table, storing the user's name and other metadata
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Likes table, storing information about which messages each user likes
CREATE TABLE likes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (message_id) REFERENCES messages(id)
);
