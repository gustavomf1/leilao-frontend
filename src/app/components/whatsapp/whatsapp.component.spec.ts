import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { WhatsAppComponent } from './whatsapp.component';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { AlertService } from '../../shared/services/alert.service';

describe('WhatsAppComponent', () => {
  let component: WhatsAppComponent;
  let fixture: ComponentFixture<WhatsAppComponent>;
  let mockService: any;
  let mockAlert: any;

  beforeEach(async () => {
    mockService = {
      enviarTexto: vi.fn().mockReturnValue(of({})),
      enviarMidia: vi.fn().mockReturnValue(of({})),
      enviarTextoEmMassa: vi.fn().mockReturnValue(of({})),
      enviarMidiaEmMassa: vi.fn().mockReturnValue(of({})),
    };
    mockAlert = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [WhatsAppComponent],
      providers: [
        { provide: WhatsAppService, useValue: mockService },
        { provide: AlertService, useValue: mockAlert },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('enviarTexto() com form inválido não chama o service', () => {
    component.enviarTexto();
    expect(mockService.enviarTexto).not.toHaveBeenCalled();
  });

  it('enviarTexto() envia a mensagem e limpa o estado de "enviando"', () => {
    component.formTexto.setValue({ number: '5511999999999', text: 'oi', delay: 1200 });
    component.enviarTexto();
    expect(mockService.enviarTexto).toHaveBeenCalledWith({ number: '5511999999999', text: 'oi', delay: 1200 });
    expect(mockAlert.success).toHaveBeenCalledWith('Mensagem de texto enviada!');
    expect(component.enviando).toBe(false);
  });

  it('enviarTexto() mostra alerta de erro quando falha', () => {
    mockService.enviarTexto.mockReturnValue(throwError(() => ({ error: { mensagem: 'falhou' } })));
    component.formTexto.setValue({ number: '5511999999999', text: 'oi', delay: 1200 });
    component.enviarTexto();
    expect(mockAlert.error).toHaveBeenCalledWith('falhou');
    expect(component.enviando).toBe(false);
  });

  it('enviarMidia() envia a mensagem com mídia', () => {
    component.formMidia.setValue({
      number: '5511999999999', mediatype: 'image', mimeType: 'image/jpeg',
      fileName: 'foto.jpg', url: 'https://x.com/a.jpg', caption: '',
    });
    component.enviarMidia();
    expect(mockService.enviarMidia).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalledWith('Mensagem com mídia enviada!');
  });

  it('addContato()/removeContato() gerenciam o FormArray de contatos em massa', () => {
    component.addContato(component.contatosBulkTexto);
    expect(component.contatosBulkTexto.length).toBe(1);
    component.removeContato(component.contatosBulkTexto, 0);
    expect(component.contatosBulkTexto.length).toBe(0);
  });

  it('enviarBulkTexto() rejeita quando não há contatos, mesmo com form válido', () => {
    component.formBulkTexto.patchValue({ text: 'oi' });
    component.enviarBulkTexto();
    expect(mockAlert.error).toHaveBeenCalledWith('Adicione pelo menos um contato');
    expect(mockService.enviarTextoEmMassa).not.toHaveBeenCalled();
  });

  it('enviarBulkTexto() envia quando há contatos e o form é válido', () => {
    component.addContato(component.contatosBulkTexto);
    component.contatosBulkTexto.at(0).setValue({ number: '5511999999999', nome: 'João' });
    component.formBulkTexto.patchValue({ text: 'oi' });

    component.enviarBulkTexto();

    expect(mockService.enviarTextoEmMassa).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalledWith('Envio em massa de texto iniciado!');
  });

  it('enviarBulkMidia() rejeita quando não há contatos', () => {
    component.formBulkMidia.patchValue({ url: 'https://x.com/a.pdf' });
    component.enviarBulkMidia();
    expect(mockAlert.error).toHaveBeenCalledWith('Adicione pelo menos um contato');
    expect(mockService.enviarMidiaEmMassa).not.toHaveBeenCalled();
  });

  it('enviarBulkMidia() envia quando há contatos e o form é válido', () => {
    component.addContato(component.contatosBulkMidia);
    component.contatosBulkMidia.at(0).setValue({ number: '5511999999999', nome: 'João' });
    component.formBulkMidia.patchValue({ url: 'https://x.com/a.pdf' });

    component.enviarBulkMidia();

    expect(mockService.enviarMidiaEmMassa).toHaveBeenCalled();
    expect(mockAlert.success).toHaveBeenCalledWith('Envio em massa de mídia iniciado!');
  });
});
