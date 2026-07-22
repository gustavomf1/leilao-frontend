import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/lotes/lista' } as any));

  afterEach(() => localStorage.clear());

  it('permite acesso quando o usuário está logado', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        { provide: Router, useValue: { createUrlTree: vi.fn(), url: '/lotes/lista' } },
      ],
    });

    expect(runGuard()).toBe(true);
  });

  it('redireciona para /login e guarda a URL de origem quando não está logado', () => {
    const urlTree = {} as any;
    const createUrlTree = vi.fn().mockReturnValue(urlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
        { provide: Router, useValue: { createUrlTree, url: '/lotes/lista' } },
      ],
    });

    const result = runGuard();

    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
    expect(localStorage.getItem('redirectUri')).toBe('/lotes/lista');
  });
});
