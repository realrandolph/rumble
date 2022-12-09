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

// GET /messages - returns all messages, with pagination and sorting
app.get('/messages', (req, res) => {
  const { limit, offset, sort } = req.query;
  let sql = 'SELECT * FROM messages';
  if (sort) {
    sql += ` ORDER BY ${sort}`;
  }
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }
  if (offset) {
    sql += ` OFFSET ${offset}`;
  }
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching messages from the database' });
    } else {
      res.json(rows);
    }
  });
});

// POST /messages - create a new message
/*
*This endpoint expects a JSON object with a content property in the request body. If the request does not contain a valid JSON web token in the Authorization header, it returns a 401 Unauthorized response. Otherwise, it uses the db.run() method to execute a SQL query that inserts a new row into the messages table with the specified content and user_id values. If the query is successful, it returns a 201 Created response with the id of the newly inserted row as the response body. If there is an error, it returns a 500 Internal Server Error response with an error property containing the error message.
*Note that this code assumes that the db object is a sqlite3.Database instance that is connected to the database. It also assumes that the messages table has been created using the schema specified in the previous answer, and that the users table contains rows with the id values specified in the user_id column of the messages table.
*In a real application, you may want to add additional features to this endpoint, such as validation, error handling, and other features. This would require modifying the SQL query and the logic in the endpoint.
*
*/
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
/*
This endpoint expects a JSON object with a message_id property in the request body. If the request does not contain a valid JSON web token in the Authorization header, it returns a 401 Unauthorized response. Otherwise, it uses the db.run() method to execute a SQL query that inserts a new row into the likes table with the specified user_id and message_id values. If the query is successful, it returns a 201 Created response with the id of the newly inserted row as the response body. If there is an error, it returns a 500 Internal Server Error response with an error property containing the error message.

Note that this code assumes that the db object is a sqlite3.Database instance that is connected to the database. It also assumes that the likes table has been created using the schema specified in the previous answer, and that the users and messages tables contain rows with the id values specified in the user_id and message_id columns of the likes table, respectively.

In a real application, you may want to add additional features to this endpoint, such as validation, error handling, and other features. This would require modifying the SQL query and the logic in the endpoint.
*/
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

// GET /likes - returns all likes
app.get('/likes', (req, res) => {
  db.all('SELECT * FROM likes', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching likes from the database' });
    } else {
      res.json(rows);
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(Listening on port ${port});
});
