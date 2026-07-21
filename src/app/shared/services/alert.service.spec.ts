import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    service = new AlertService();
  });

  it('success()/error()/warning()/info() emitem em alert$ com a cor e o dismissible corretos', () => {
    const received: any[] = [];
    service.alert$.subscribe(a => received.push(a));

    service.success('ok');
    service.error('falhou');
    service.warning('atencao');
    service.info('info');

    expect(received).toEqual([
      { message: 'ok', color: 'success', dismissible: true, delay: 4000 },
      { message: 'falhou', color: 'danger', dismissible: true, delay: 5000 },
      { message: 'atencao', color: 'warning', dismissible: true, delay: 4000 },
      { message: 'info', color: 'info', dismissible: true, delay: 4000 },
    ]);
  });

  it('confirm() emite a mensagem, o callback e os labels customizados em confirm$', () => {
    const received: any[] = [];
    service.confirm$.subscribe(c => received.push(c));
    const callback = () => {};

    service.confirm('Excluir?', callback, 'Confirmar', 'success');

    expect(received).toEqual([{ message: 'Excluir?', callback, confirmLabel: 'Confirmar', confirmColor: 'success' }]);
  });
});
