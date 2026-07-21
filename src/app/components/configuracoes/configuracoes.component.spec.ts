import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ColorModeService } from '@coreui/angular';
import { ConfiguracoesComponent } from './configuracoes.component';
import { AuthService } from '../../core/services/auth.service';

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let fixture: ComponentFixture<ConfiguracoesComponent>;
  let mockColorMode: any;

  beforeEach(async () => {
    let mode = 'auto';
    mockColorMode = { colorMode: Object.assign((v?: string) => (v !== undefined ? (mode = v) : mode), { set: (v: string) => (mode = v) }) };

    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent],
      providers: [
        { provide: ColorModeService, useValue: mockColorMode },
        { provide: AuthService, useValue: { getUserNome: () => 'Ana', getUserTipo: () => 'FUNCIONARIO' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nomeUsuario e tipoUsuario refletem o AuthService', () => {
    expect(component.nomeUsuario).toBe('Ana');
    expect(component.tipoUsuario).toBe('FUNCIONARIO');
  });

  it('setTheme() atualiza o color mode e currentMode reflete a mudança', () => {
    component.setTheme('dark');
    expect(component.currentMode).toBe('dark');
  });
});
