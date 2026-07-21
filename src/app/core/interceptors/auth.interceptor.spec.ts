import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  afterEach(() => localStorage.clear());

  it('adiciona o header Authorization quando há token no localStorage', () => {
    localStorage.setItem('auth_token', 'meu-token');
    const req = new HttpRequest('GET', '/api/qualquer');
    const next = vi.fn().mockReturnValue(of('next-result' as any));

    const result = TestBed.runInInjectionContext(() => authInterceptor(req, next));

    const forwardedReq = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwardedReq.headers.get('Authorization')).toBe('Bearer meu-token');
    expect(result).toBeTruthy();
  });

  it('não adiciona header quando não há token', () => {
    const req = new HttpRequest('GET', '/api/qualquer');
    const next = vi.fn().mockReturnValue(of('next-result' as any));

    TestBed.runInInjectionContext(() => authInterceptor(req, next));

    const forwardedReq = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwardedReq.headers.has('Authorization')).toBe(false);
  });
});
