const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { it, expect, beforeAll, describe } = require('@jest/globals');
const app = require('../app');

let token;
let videoBuffer;
let imageBuffer;
let courseId;

beforeAll(async () => {
  const user = { email: 'admin2@gmail.com', password: 'admin1234' };
  const login = await request(app).post('/api/v1/auth/login').send(user);
  token = login.body.data.token;
  const videoPath = path.join(__dirname, '../public/vid/testing.mp4');
  const imagePath = path.join(__dirname, '../public/img/persia.jpg');
  imageBuffer = fs.readFileSync(imagePath);
  const createCourse = await request(app)
    .post('/api/v1/course')
    .field('name', `test_${new Date().getTime()}`)
    .field('level', 'Beginner')
    .field('categoryId', 1)
    .field('description', 'Test description')
    .field('benefits', 'Test benefits')
    .field('classCode', 'test123')
    .field('totalModule', 1)
    .field('type', 'Online')
    .field('price', 100000)
    .field('totalDuration', 1)
    .field('courseBy', 'test')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', imageBuffer, 'persia.jpg');
  courseId = createCourse.body.data.newCourse.id;
  videoBuffer = fs.readFileSync(videoPath);
}, 10000);

describe('API create module', () => {
  it('should return 201 Module created successfully (using url)', async () => {
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .field('videoUrl', 'https://www.youtube.com/watch?v=UIp6_0kct_U')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
  }, 10000);

  it('should return 201 Module created successfully (using video)', async () => {
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
  }, 15000);

  it('should return 400 All value fields are required', async () => {
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
  }, 10000);

  it('should return 400 Please provide either a video file or a video URL.', async () => {
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
  }, 10000);
});

describe('API update module', () => {
  let id;
  let chapterId;
  beforeAll(async () => {
    const chapter = {
      noChapter: 1,
      name: 'Chapter 1',
      courseId,
    };
    const createChapter = await request(app)
      .post('/api/v1/chapter')
      .send(chapter)
      .set('Authorization', `Bearer ${token}`);
    chapterId = createChapter.body.data.newChapter.id;
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    id = response.body.data.newModule.id;
  }, 15000);

  it('should return 200 Module updated successfully (using video)', async () => {
    const response = await request(app)
      .patch(`/api/v1/module/${id}`)
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', chapterId)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  }, 15000);

  it('should return 200 Module updated successfully (using url)', async () => {
    const response = await request(app)
      .patch(`/api/v1/module/${id}`)
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', chapterId)
      .field('videoUrl', 'https://www.youtube.com/watch?v=UIp6_0kct_U')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  }, 10000);

  it('should return 400 All value fields are required', async () => {
    const response = await request(app)
      .patch(`/api/v1/module/${id}`)
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
  }, 10000);

  it('should return 404 Module not found!', async () => {
    const response = await request(app)
      .patch('/api/v1/module/1000')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', chapterId)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  }, 10000);
});

describe('API delete module', () => {
  let id;
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    id = response.body.data.newModule.id;
  }, 15000);

  it('should return 200 Module deleted successfully', async () => {
    const response = await request(app)
      .delete(`/api/v1/module/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  }, 10000);

  it('should return 404 Module not found!', async () => {
    const response = await request(app)
      .delete('/api/v1/module/1000')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  }, 10000);
});

describe('API get all module', () => {
  it('should return 200 All modules fetched successfully', async () => {
    const response = await request(app).get('/api/v1/module');
    expect(response.statusCode).toBe(200);
  }, 10000);
});

describe('API get module by id', () => {
  let id;
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/v1/module')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    id = response.body.data.newModule.id;
  }, 15000);

  it('should return 200 Module fetched successfully', async () => {
    const response = await request(app).get(`/api/v1/module/${id}`);
    expect(response.statusCode).toBe(200);
  }, 10000);

  it('should return 404 Module not found!', async () => {
    const response = await request(app).get('/api/v1/module/1000');
    expect(response.statusCode).toBe(404);
  }, 10000);
});

describe('API create module', () => {
  it('should return 201 Module created successfully (using url)', async () => {
    const response = await request(app)
      .post('/api/v1/module/v2')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .field('videoUrl', 'https://www.youtube.com/watch?v=UIp6_0kct_U')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
  }, 60000);

  it('should return 201 Module created successfully (using video)', async () => {
    const response = await request(app)
      .post('/api/v1/module/v2')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .attach('video', videoBuffer, 'testing.mp4')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
  }, 15000);

  it('should return 400 All value fields are required', async () => {
    const response = await request(app)
      .post('/api/v1/module/v2')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
  }, 10000);

  it('should return 400 Please provide either a video file or a video URL.', async () => {
    const response = await request(app)
      .post('/api/v1/module/v2')
      .field('no', 1)
      .field('name', 'Module 1')
      .field('description', 'Test description')
      .field('chapterId', 1)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
  }, 10000);
});
