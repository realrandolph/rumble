import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch messages from the API
  useEffect(() => {
    axios.get('/api/messages')
      .then((response) => {
        setMessages(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Check for a valid JSON web token in local storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(decoded);
        }
      });
    } else {
      setUser(null);
    }
  }, []);

  // Handle login form submission
  const handleLogin = (event) => {
    event.preventDefault();
    const { username, password } = event.target.elements;
    axios.post('/api/auth', {
      username: username.value,
      password: password.value,
    })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Handle logout button click
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

// Handle message form submission
const handleMessage = (event) => {
  event.preventDefault();
  const { content } = event.target.elements;
  axios.post('/api/messages', {
    content: content.value,
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then((response) => {
      const newMessages = [...messages, {
        id: response.data.id,
        content: content.value,
        user_id: user.id,
        date_created: new Date(),
      }];
      setMessages(newMessages);
      content.value = '';
    })
    .catch((error) => {
      console.error(error);
    });
};
  
    return (
    <div>
      {!user && !loading && (
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input name="username" type="text" />
          </label>
          <label>
            Password:
            <input name="password" type="password" />
          </label>
          <button type="submit">Log in</button>
        </form>
      )}
      {user && (
        <>
          <p>Logged in as {user.username}</p>
          <button onClick={handleLogout}>Log out</button>
          <form onSubmit={handleMessage}>
            <label>
              Message:
              <input name="content" type="text" />
            </label>
            <button type="submit">Send</button>
          </form>
          {messages.map((message) => (
            <div key={message.id}>
              <p>{message.content}</p>
              <p>{message.user_id}</p>
              <p>{message.date_created}</p>
            </div>
          ))}
        </>
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default App;
