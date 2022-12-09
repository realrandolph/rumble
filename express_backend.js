const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Parse JSON bodies
app.use(bodyParser.json());

// Connect to the database
const db = new sqlite3.Database('messages.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the messages database.');
  }
});

// Middleware to verify JSON web tokens and set the user on the request
app.use((req, res, next) => {
  const authorizationHeader = req.get('Authorization');
  if (!authorizationHeader) {
    req.user = null;
    return next();
  }
  const token = authorizationHeader.split(' ')[1];
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
});

// GET /messages - returns all messages
app.get('/messages', (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching messages from the database' });
    } else {
      res.json(rows);
    }
  });
});

// POST /messages - create a new message
app.post('/messages', (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    const { content } = req.body;
    
db.run('INSERT INTO messages (content, user_id) VALUES (?, ?)', [content, req.user.id], function(err) {
  if (err) {
    res.status(500).json({ error: 'Error inserting message into the database' });
  } else {
    res.status(201).json({ id: this.lastID });
  }
});

}
});

// POST /likes - like a message
app.post('/likes', (req, res) => {
if (!req.user) {
res.status(401).json({ error: 'Unauthorized' });
} else {
const { message_id } = req.body;
db.run('INSERT INTO likes (user_id, message_id) VALUES (?, ?)', [req.user.id, message_id], function(err) {
if (err) {
res.status(500).json({ error: 'Error inserting like into the database' });
} else {
res.status(201).json({ id: this.lastID });
}
});
}
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(Listening on port ${port});
});
