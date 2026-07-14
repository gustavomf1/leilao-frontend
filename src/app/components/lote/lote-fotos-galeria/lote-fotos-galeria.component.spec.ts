import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoteFotosGaleriaComponent } from './lote-fotos-galeria.component';
import { LoteFoto } from '../../../core/services/lote-foto.service';

describe('LoteFotosGaleriaComponent', () => {
  let component: LoteFotosGaleriaComponent;
  let fixture: ComponentFixture<LoteFotosGaleriaComponent>;

  const fotoMock: LoteFoto = {
    id: 1, loteId: 10, r2Key: 'lotes/10/a.jpg', ordem: 0,
    uploadedAt: '2026-01-01T00:00:00Z', viewUrl: 'https://minio.local/lotes/10/a.jpg'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteFotosGaleriaComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LoteFotosGaleriaComponent);
    component = fixture.componentInstance;
  });

  it('não renderiza nenhuma miniatura quando fotos está vazio', () => {
    component.fotos = [];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.galeria-fotos__item');
    expect(items.length).toBe(0);
  });

  it('renderiza uma miniatura por foto recebida', () => {
    component.fotos = [fotoMock, { ...fotoMock, id: 2 }];
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.galeria-fotos__item');
    expect(items.length).toBe(2);
  });

  it('abrir() chama window.open com a viewUrl em nova aba', () => {
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.abrir(fotoMock);
    expect(spy).toHaveBeenCalledWith(fotoMock.viewUrl, '_blank');
  });
});
