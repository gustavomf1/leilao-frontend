import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('success()/error()/warning()/info() emitem em toast$ com título padrão e cor corretos', () => {
    const received: any[] = [];
    service.toast$.subscribe(t => received.push(t));

    service.success('ok');
    service.error('falhou');
    service.warning('atencao');
    service.info('info');

    expect(received).toEqual([
      { message: 'ok', title: 'Sucesso', color: 'success', delay: 3000 },
      { message: 'falhou', title: 'Erro', color: 'danger', delay: 4000 },
      { message: 'atencao', title: 'Atenção', color: 'warning', delay: 3000 },
      { message: 'info', title: 'Info', color: 'info', delay: 3000 },
    ]);
  });

  it('aceita título customizado', () => {
    const received: any[] = [];
    service.toast$.subscribe(t => received.push(t));

    service.success('ok', 'Tudo certo');

    expect(received[0].title).toBe('Tudo certo');
  });
});
