import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CondicoesService } from './condicoes.service';

describe('CondicoesService', () => {
  let service: CondicoesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CondicoesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('usa o endpoint /api/condicao (herdado de ApiService)', () => {
    service.listar().subscribe();
    http.expectOne('http://localhost:8080/api/condicao').flush([]);
  });
});
