import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  CardModule, ButtonDirective, FormModule, GridModule,
  NavModule, TabsModule, BadgeModule
} from '@coreui/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faPlus, faTrash, faImage, faFileAlt, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, ButtonDirective, FormModule, GridModule,
    NavModule, TabsModule, BadgeModule, FontAwesomeModule,
  ],
  templateUrl: './whatsapp.component.html',
})
export class WhatsAppComponent {
  private whatsapp = inject(WhatsAppService);
  private alert = inject(AlertService);
  private fb = inject(FormBuilder);

  faPaperPlane = faPaperPlane;
  faPlus = faPlus;
  faTrash = faTrash;
  faImage = faImage;
  faFileAlt = faFileAlt;
  faBullhorn = faBullhorn;

  enviando = false;

  // ── Formulário 1: Enviar texto ──
  formTexto: FormGroup = this.fb.group({
    number: ['', Validators.required],
    text:   ['', Validators.required],
    delay:  [1200]
  });

  // ── Formulário 2: Enviar mídia ──
  formMidia: FormGroup = this.fb.group({
    number:    ['', Validators.required],
    mediatype: ['image', Validators.required],
    mimeType:  ['image/jpeg', Validators.required],
    fileName:  ['foto.jpg', Validators.required],
    url:       ['', Validators.required],
    caption:   ['']
  });

  // ── Formulário 3: Texto em massa ──
  formBulkTexto: FormGroup = this.fb.group({
    contatos:   this.fb.array([]),
    text:       ['', Validators.required],
    delayMinMs: [3000],
    delayMaxMs: [8000]
  });

  // ── Formulário 4: Mídia em massa ──
  formBulkMidia: FormGroup = this.fb.group({
    contatos:   this.fb.array([]),
    url:        ['', Validators.required],
    caption:    [''],
    mediatype:  ['document', Validators.required],
    mimeType:   ['application/pdf', Validators.required],
    delayMinMs: [3000],
    delayMaxMs: [8000]
  });

  // ── Helpers para FormArray de contatos ──
  get contatosBulkTexto(): FormArray {
    return this.formBulkTexto.get('contatos') as FormArray;
  }

  get contatosBulkMidia(): FormArray {
    return this.formBulkMidia.get('contatos') as FormArray;
  }

  addContato(formArray: FormArray) {
    formArray.push(this.fb.group({
      number: ['', Validators.required],
      nome:   ['', Validators.required]
    }));
  }

  removeContato(formArray: FormArray, index: number) {
    formArray.removeAt(index);
  }

  // ── Envios ──

  enviarTexto() {
    if (this.formTexto.valid) {
      this.enviando = true;
      this.whatsapp.enviarTexto(this.formTexto.getRawValue()).subscribe({
        next: () => { this.alert.success('Mensagem de texto enviada!'); this.enviando = false; },
        error: () => { this.alert.error('Erro ao enviar mensagem de texto'); this.enviando = false; }
      });
    }
  }

  enviarMidia() {
    if (this.formMidia.valid) {
      this.enviando = true;
      this.whatsapp.enviarMidia(this.formMidia.getRawValue()).subscribe({
        next: () => { this.alert.success('Mensagem com mídia enviada!'); this.enviando = false; },
        error: () => { this.alert.error('Erro ao enviar mensagem com mídia'); this.enviando = false; }
      });
    }
  }

  enviarBulkTexto() {
    if (this.formBulkTexto.valid && this.contatosBulkTexto.length > 0) {
      this.enviando = true;
      this.whatsapp.enviarTextoEmMassa(this.formBulkTexto.getRawValue()).subscribe({
        next: () => { this.alert.success('Envio em massa de texto iniciado!'); this.enviando = false; },
        error: () => { this.alert.error('Erro no envio em massa de texto'); this.enviando = false; }
      });
    } else if (this.contatosBulkTexto.length === 0) {
      this.alert.error('Adicione pelo menos um contato');
    }
  }

  enviarBulkMidia() {
    if (this.formBulkMidia.valid && this.contatosBulkMidia.length > 0) {
      this.enviando = true;
      this.whatsapp.enviarMidiaEmMassa(this.formBulkMidia.getRawValue()).subscribe({
        next: () => { this.alert.success('Envio em massa de mídia iniciado!'); this.enviando = false; },
        error: () => { this.alert.error('Erro no envio em massa de mídia'); this.enviando = false; }
      });
    } else if (this.contatosBulkMidia.length === 0) {
      this.alert.error('Adicione pelo menos um contato');
    }
  }
}
