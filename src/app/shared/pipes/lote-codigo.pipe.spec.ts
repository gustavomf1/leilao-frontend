import { LoteCodigoPipe, formatarCodigoLote } from './lote-codigo.pipe';

describe('formatarCodigoLote', () => {
  it('prefixa o valor com "LOTE-"', () => {
    expect(formatarCodigoLote('001')).toBe('LOTE-001');
  });

  it('retorna "—" para valor nulo, indefinido ou vazio', () => {
    expect(formatarCodigoLote(null)).toBe('—');
    expect(formatarCodigoLote(undefined)).toBe('—');
    expect(formatarCodigoLote('')).toBe('—');
  });
});

describe('LoteCodigoPipe', () => {
  it('transform delega para formatarCodigoLote', () => {
    const pipe = new LoteCodigoPipe();
    expect(pipe.transform('L-9')).toBe('LOTE-L-9');
    expect(pipe.transform(null)).toBe('—');
  });
});
