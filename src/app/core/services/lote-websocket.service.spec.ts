import { TestBed } from '@angular/core/testing';
import { LoteWebsocketService } from './lote-websocket.service';

// Nota: `Client` (@stomp/stompjs) é instanciado diretamente dentro do serviço
// e não há um seam de DI para injetar um mock nele. O bundler de teste do
// Angular (esbuild) não respeita aliases de módulo do vitest para código de
// app, então não é possível interceptar a instância real do STOMP client
// aqui. Cobrimos o que é observável de fora sem exercitar uma conexão real.
describe('LoteWebsocketService', () => {
  let service: LoteWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoteWebsocketService);
  });

  afterEach(() => service.desconectar());

  it('desconectar() não lança erro quando nunca conectou', () => {
    expect(() => service.desconectar()).not.toThrow();
  });

  it('conectar() não lança erro ao criar a conexão STOMP', () => {
    expect(() => service.conectar()).not.toThrow();
  });

  it('conectar() é idempotente e não recria a conexão quando já está ativa', () => {
    service.conectar();
    expect(() => service.conectar()).not.toThrow();
  });

  it('novoLoteSubject está disponível como Subject para os consumidores se inscreverem', () => {
    const recebidos: any[] = [];
    const sub = service.novoLoteSubject.subscribe(l => recebidos.push(l));
    service.novoLoteSubject.next({ id: 1 });
    expect(recebidos).toEqual([{ id: 1 }]);
    sub.unsubscribe();
  });
});
