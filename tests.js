const request = require('supertest');
const app = require('../app');

describe('GET /messages', () => {
  it('should return a list of messages', async () => {
    const response = await request(app)
      .get('/api/messages')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});

describe('POST /messages', () => {
  it('should return 401 if the user is not authenticated', async () => {
    await request(app)
      .post('/api/messages')
      .send({ content: 'Hello world!' })
      .expect(401);
  });

  it('should return 403 if the user is not authorized', async () => {
    const token = 'invalid-token';
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello world!' })
      .expect(403);
  });

  it('should return the new message if the user is authorized', async () => {
    const token = 'valid-token';
    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello world!' })
      .expect(200);

    expect(response.body).toEqual({
      id: expect.any(Number),
      content: 'Hello world!',
      user_id: 1,
      date_created: expect.any(String),
    });
  });
});

describe('GET /messages/:id', () => {
  it('should return 404 if the message does not exist', async () => {
    await request(app)
      .get('/api/messages/1')
      .expect(404);
  });

  it('should return the message if it exists', async () => {
    const response = await request(app)
      .get('/api/messages/1')
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      content: 'Hello world!',
      user_id: 1,
      date_created: expect.any(String),
    });
  });
});

describe('POST /likes', () => {
  it('should return 401 if the user is not authenticated', async () => {
    await request(app)
      .post('/api/likes')
      .send({ message_id: 1 })
      .expect(401);
  });

  it('should return 403 if the user is not authorized', async () => {
    const token = 'invalid-token';
    await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ message_id: 1 })
      .expect(403);
  });

  it('should return 404 if the message does not exist', async () => {
    const token = 'valid-token';
    await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ message_id: 1 })
      .expect(404);
  });

  it('should return the updated message if the user is authorized', async () => {
    const token = 'valid-token';
    const response = await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ message_id: 2 })
      .expect(200);

    expect(response.body).toEqual({
      id: 2,
      content: 'Hello world!',
      user_id: 1,
      date_created: expect.any(String),
      likes: 1,
    });
  });
});
