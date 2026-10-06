import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Express API Routes', () => {
  it('GET /api/health returns health status and model configuration', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('model');
    expect(res.body).toHaveProperty('apiKeyConfigured');
    expect(typeof res.body.apiKeyConfigured).toBe('boolean');
  });

  it('POST /api/judge/single rejects request with empty prompt (400)', async () => {
    const res = await request(app).post('/api/judge/single').send({ prompt: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/judge/multi rejects request with missing prompt (400)', async () => {
    const res = await request(app).post('/api/judge/multi').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/judge/both rejects request without prompt (400)', async () => {
    const res = await request(app).post('/api/judge/both').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/judge/single returns 503 with configuration advice when API key is missing', async () => {
    const res = await request(app)
      .post('/api/judge/single')
      .send({ prompt: 'Valid prompt but no API key configured' });
    
    // When API key is not configured in test environment
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('code', 'MISSING_API_KEY');
    expect(res.body).toHaveProperty('instructions');
  });
});
