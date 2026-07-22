import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { manejoGuard } from './manejo.guard';
import { AuthService } from '../services/auth.service';

describe('manejoGuard', () => {
  const runGuard = () => TestBed.runInInjectionContext(() => manejoGuard({} as any, {} as any));

  it('redireciona usuários de manejo para /lotes/cadastrar', () => {
    const urlTree = {} as any;
    const createUrlTree = vi.fn().mockReturnValue(urlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isManejo: () => true } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(runGuard()).toBe(urlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/lotes/cadastrar']);
  });

  it('permite acesso para usuários que não são de manejo', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isManejo: () => false } },
        { provide: Router, useValue: { createUrlTree: vi.fn() } },
      ],
    });

    expect(runGuard()).toBe(true);
  });
});
