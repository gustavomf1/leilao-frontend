import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { AuthService, TokenPayload } from './auth.service';
import { LoteWebsocketService } from './lote-websocket.service';

function base64UrlEncode(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
}

function buildToken(payload: Partial<TokenPayload>): string {
  return `${base64UrlEncode({ alg: 'none' })}.${base64UrlEncode(payload)}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let wsService: { conectar: ReturnType<typeof vi.fn>; desconectar: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    wsService = { conectar: vi.fn(), desconectar: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoteWebsocketService, useValue: wsService },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('login() salva o token e conecta o websocket', () => {
    service.login({ email: 'a@a.com', senha: '123' } as any).subscribe();
    const req = http.expectOne('http://localhost:8080/api/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc.def.ghi' });

    expect(localStorage.getItem('auth_token')).toBe('abc.def.ghi');
    expect(wsService.conectar).toHaveBeenCalled();
  });

  it('isLoggedIn() reflete a presença do token', () => {
    expect(service.isLoggedIn()).toBe(false);
    localStorage.setItem('auth_token', 'x');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout() desconecta o websocket e remove o token', () => {
    localStorage.setItem('auth_token', 'x');
    service.logout();
    expect(wsService.desconectar).toHaveBeenCalled();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('getTokenPayload() retorna null quando não há token', () => {
    expect(service.getTokenPayload()).toBeNull();
  });

  it('getTokenPayload() retorna null para token malformado', () => {
    localStorage.setItem('auth_token', 'nao-e-um-jwt');
    expect(service.getTokenPayload()).toBeNull();
  });

  it('getTokenPayload() decodifica o payload do JWT', () => {
    localStorage.setItem('auth_token', buildToken({ nome: 'João', isAdmin: false }));
    expect(service.getTokenPayload()?.nome).toBe('João');
  });

  it('isAdmin() é true somente quando isAdmin === true no payload', () => {
    localStorage.setItem('auth_token', buildToken({ isAdmin: true }));
    expect(service.isAdmin()).toBe(true);

    localStorage.setItem('auth_token', buildToken({ isAdmin: false }));
    expect(service.isAdmin()).toBe(false);
  });

  describe('isManejo()', () => {
    it('retorna false sem token', () => {
      expect(service.isManejo()).toBe(false);
    });

    it('retorna true quando isManejo é boolean true', () => {
      localStorage.setItem('auth_token', buildToken({ isManejo: true }));
      expect(service.isManejo()).toBe(true);
    });

    it('retorna true quando isManejo é 1', () => {
      localStorage.setItem('auth_token', buildToken({ isManejo: 1 as any }));
      expect(service.isManejo()).toBe(true);
    });

    it('retorna true quando isManejo é string "S" (case-insensitive, sem acento)', () => {
      localStorage.setItem('auth_token', buildToken({ isManejo: 'S' as any }));
      expect(service.isManejo()).toBe(true);
    });

    it('retorna true quando o campo tipo contém MANEJO (ignorando acentuação)', () => {
      localStorage.setItem('auth_token', buildToken({ isManejo: false, tipo: 'Usuário de Manéjo' }));
      expect(service.isManejo()).toBe(true);
    });

    it('retorna true quando alguma role contém MANEJO', () => {
      localStorage.setItem('auth_token', buildToken({ isManejo: false, tipo: 'FUNCIONARIO', roles: ['MANEJO'] }));
      expect(service.isManejo()).toBe(true);
    });

    it('retorna false quando nada indica manejo', () => {
      localStorage.setItem('auth_token', buildToken({ isManejo: false, tipo: 'ADMIN', roles: ['ADMIN'] }));
      expect(service.isManejo()).toBe(false);
    });
  });

  it('getUserRoles() normaliza roles em string ou objeto', () => {
    localStorage.setItem('auth_token', buildToken({
      roles: ['ADMIN', { nome: 'GERENTE' }, { name: 'OPERADOR' }, { authority: 'FINANCEIRO' }] as any,
    }));
    expect(service.getUserRoles()).toEqual(['ADMIN', 'GERENTE', 'OPERADOR', 'FINANCEIRO']);
  });

  it('getUserNome() e getUserTipo() leem do payload, com fallback vazio', () => {
    expect(service.getUserNome()).toBe('');
    expect(service.getUserTipo()).toBe('');

    localStorage.setItem('auth_token', buildToken({ nome: 'Maria', tipo: 'FUNCIONARIO' }));
    expect(service.getUserNome()).toBe('Maria');
    expect(service.getUserTipo()).toBe('FUNCIONARIO');
  });

  describe('hasPermission()', () => {
    it('retorna true sempre para admin, mesmo sem a permissão explícita', () => {
      localStorage.setItem('auth_token', buildToken({ isAdmin: true, permissoes: [] }));
      expect(service.hasPermission('lotes', 'editar')).toBe(true);
    });

    it('retorna true quando a permissão "ambiente:acao" está na lista', () => {
      localStorage.setItem('auth_token', buildToken({ isAdmin: false, permissoes: ['lotes:editar'] }));
      expect(service.hasPermission('lotes', 'editar')).toBe(true);
    });

    it('retorna false quando a permissão não está na lista', () => {
      localStorage.setItem('auth_token', buildToken({ isAdmin: false, permissoes: ['lotes:editar'] }));
      expect(service.hasPermission('lotes', 'excluir')).toBe(false);
    });
  });
});
