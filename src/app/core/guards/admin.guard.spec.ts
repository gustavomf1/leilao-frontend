import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  const runGuard = () => TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

  it('permite acesso quando logado e admin', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => true } },
        { provide: Router, useValue: { createUrlTree: vi.fn() } },
      ],
    });

    expect(runGuard()).toBe(true);
  });

  it('redireciona para /dashboard quando logado mas não é admin', () => {
    const urlTree = {} as any;
    const createUrlTree = vi.fn().mockReturnValue(urlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(runGuard()).toBe(urlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('redireciona para /dashboard quando não está logado', () => {
    const urlTree = {} as any;
    const createUrlTree = vi.fn().mockReturnValue(urlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => false, isAdmin: () => true } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(runGuard()).toBe(urlTree);
  });
});
