import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SnippetsModule } from '../src/snippets/snippets.module';
import mongoose from 'mongoose';

describe('SnippetsController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(uri),
        SnippetsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 30000); // Allow Mongo Memory Server extra time to start

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    await app.close();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  const mockSnippet = {
    title: 'Test Note',
    content: 'This is a test snippet content.',
    tags: ['test', 'nest'],
    type: 'note',
  };

  it('/snippets (POST) - should create a new snippet', () => {
    return request(app.getHttpServer())
      .post('/snippets')
      .send(mockSnippet)
      .expect(201)
      .expect((res: any) => {
        expect(res.body.title).toBe(mockSnippet.title);
        expect(res.body.tags).toEqual(mockSnippet.tags);
        expect(res.body._id).toBeDefined();
      });
  });

  it('/snippets (POST) - should fail with invalid data (Validation)', () => {
    return request(app.getHttpServer())
      .post('/snippets')
      .send({ title: 'No content here' }) // missing content and type
      .expect(400);
  });

  it('/snippets (GET) - should fetch with pagination and search', async () => {
    // Create multiple snippets
    await request(app.getHttpServer()).post('/snippets').send({
      title: 'First Code',
      content: 'Hello World',
      tags: ['code'],
      type: 'command',
    });
    await request(app.getHttpServer()).post('/snippets').send({
      title: 'Second Code',
      content: 'Fizz Buzz',
      tags: ['coding'],
      type: 'command',
    });

    const res = await request(app.getHttpServer())
      .get('/snippets?q=Hello')
      .expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('First Code');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it('/snippets/:id (PATCH) - should update a snippet', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/snippets')
      .send(mockSnippet);

    const id = createRes.body._id;

    const res = await request(app.getHttpServer())
      .patch(`/snippets/${id}`)
      .send({ title: 'Updated Title' })
      .expect(200);

    expect(res.body.title).toBe('Updated Title');
    expect(res.body.content).toBe(mockSnippet.content); // unchanged
  });

  it('/snippets/:id (DELETE) - should remove a snippet', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/snippets')
      .send(mockSnippet);

    const id = createRes.body._id;

    await request(app.getHttpServer()).delete(`/snippets/${id}`).expect(200);

    // Verify it is gone
    await request(app.getHttpServer()).get(`/snippets/${id}`).expect(404);
  });
});
