import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CoreService } from './core.service';

describe('CoreService', () => {
  let coreService: CoreService;

  beforeEach(() => {
    coreService = new CoreService();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should build correct path', () => {
    expect(coreService.path('/test')).toBe('https://67eb7353aa794fb3222a4c0e.mockapi.io/test');
    expect(coreService.path('test')).toBe('https://67eb7353aa794fb3222a4c0e.mockapi.io/test');
    coreService.host = 'https://67eb7353aa794fb3222a4c0e.mockapi.io/';
    expect(coreService.path('/test')).toBe('https://67eb7353aa794fb3222a4c0e.mockapi.io/test');
  });

  it('should call API with GET and return data', async () => {
    const mockJson = vi.fn().mockResolvedValue({ success: true });

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: mockJson,
      status: 200,
      statusText: 'OK'
    });

    const result = await coreService.get('/test');

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://67eb7353aa794fb3222a4c0e.mockapi.io/test',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });

  it('should call API with POST and send data', async () => {
    const mockJson = vi.fn().mockResolvedValue({ created: true });

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: mockJson,
      status: 201,
      statusText: 'Created'
    });

    const result = await coreService.post('/test', { name: 'item' });

    expect(result).toEqual({ created: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://67eb7353aa794fb3222a4c0e.mockapi.io/test',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'item' })
      }
    );
  });

  it('should reject when response is not ok', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn(),
      status: 404,
      statusText: 'Not Found'
    });

    await expect(coreService.get('/fail')).rejects.toBe('[CLIENT ERROR][CODE: 404] Not Found');
  });
});
