import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WhatsAppService } from './whatsapp.service';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(WhatsAppService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('enviarTexto() faz POST em /api/messages/send/text', () => {
    const msg = { numero: '5511999999999', texto: 'oi' } as any;
    service.enviarTexto(msg).subscribe();
    const req = http.expectOne('http://localhost:8080/api/messages/send/text');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(msg);
    req.flush({});
  });

  it('enviarMidia() faz POST em /api/messages/send/media', () => {
    const msg = { numero: '5511999999999' } as any;
    service.enviarMidia(msg).subscribe();
    http.expectOne('http://localhost:8080/api/messages/send/media').flush({});
  });

  it('enviarTextoEmMassa() faz POST em /api/messages/send/bulk', () => {
    const msg = { numeros: ['5511999999999'] } as any;
    service.enviarTextoEmMassa(msg).subscribe();
    http.expectOne('http://localhost:8080/api/messages/send/bulk').flush({});
  });

  it('enviarMidiaEmMassa() faz POST em /api/messages/send/bulk/media', () => {
    const msg = { numeros: ['5511999999999'] } as any;
    service.enviarMidiaEmMassa(msg).subscribe();
    http.expectOne('http://localhost:8080/api/messages/send/bulk/media').flush({});
  });
});
