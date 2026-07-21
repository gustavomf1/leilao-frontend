import { SubformService } from './subform.service';

describe('SubformService', () => {
  it('emitir() propaga chave e dados para resultado$', () => {
    const service = new SubformService();
    const received: any[] = [];
    service.resultado$.subscribe(r => received.push(r));

    service.emitir('fazenda', { id: 1 });

    expect(received).toEqual([{ chave: 'fazenda', dados: { id: 1 } }]);
  });
});
