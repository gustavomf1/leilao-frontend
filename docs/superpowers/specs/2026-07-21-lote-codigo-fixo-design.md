# Design — Prefixo fixo "LOTE-" no código do lote

**Data:** 2026-07-21
**Branch:** `develop`
**Escopo:** `leilao-frontend` (Angular)

## Contexto

O campo "Código" do lote hoje é um texto livre (`formControlName="codigo"`), com placeholder "Ex: L-001". A pessoa digita o código completo à mão. Além disso, os campos `Qtd. Animais`, `Idade` e `Peso` do form de cadastro nascem com valores reais (`1`, `0`, `0`) no `FormBuilder`, e não com placeholder — a pessoa precisa clicar e apagar o número antes de digitar o dela.

## Objetivo

1. O campo Código passa a ter um prefixo fixo **"LOTE-"**, não editável, colado à esquerda do input. A pessoa digita só o sufixo (ex: `001`). O valor salvo no banco continua sendo só o sufixo digitado — o prefixo é 100% visual, nunca é persistido.
2. Em toda tela onde o código do lote aparece (formulários, listagens, telas de evento), o valor exibido passa a ser `"LOTE-" + valor salvo`.
3. Os campos `Qtd. Animais`, `Idade (meses)` e `Peso (kg)` do form de cadastro nascem vazios (sem valor `1`/`0`/`0`), mantendo as mesmas validações (`required`, `min`).

## Não-objetivos

- Não migra dados existentes no banco — os 3 lotes de teste hoje cadastrados (`imagem 2`, `teste`, `TESTE IMAGEM`) não têm prefixo manual, então não há conflito visual a resolver.
- Não altera a API/backend — `codigo` continua sendo enviado e recebido sem o prefixo.
- Fora de escopo por ora: relatórios/PDFs (fechamento de leilão, mapa do leilão, catálogo, liberação), que também referenciam `lote.codigo` mas não foram mencionados pelo usuário.

## Design

### 1. Pipe compartilhado `loteCodigo`

Não existe pasta de pipes no projeto ainda (`shared/` só tem `components/` e `services/`). Novo arquivo `src/app/shared/pipes/lote-codigo.pipe.ts`, seguindo o mesmo padrão de `shared/`:

```ts
@Pipe({ name: 'loteCodigo', standalone: true })
export class LoteCodigoPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '—';
    return `LOTE-${valor}`;
  }
}
```

Aplicado via `{{ lote.codigo | loteCodigo }}` (ou `{{ lote?.codigo | loteCodigo }}` onde já houver optional chaining) em todos os pontos abaixo, substituindo a interpolação direta de `lote.codigo`:

- `lote-list.component.html` (linha 56)
- `monitor-lotes.component.html` (linhas 78, 297) e título do modal (linha 290, 375 — interpolação em atributo/texto)
- `lote-details.component.html` — info-chips de resumo (linhas 474, 641)
- `evento-leilao.component.html` (linhas 136, 198, 248) e `evento-leilao.component.ts` — strings de template literal em `alert.confirm`/`alert.success` (linhas 227, 230) trocam para usar o valor já formatado, ex: `` `Confirmar lance de R$ ${valor.toFixed(2)} para o lote LOTE-${lote.codigo}?` `` (mesma lógica do pipe, aplicada inline já que é TS puro, não template)
- `evento-publico.component.html` (linhas 42, 135, 169) e `evento-publico.component.ts` (linha 139) — mesmo tratamento inline em TS

### 2. Form — prefixo colado no input

Em `lote-details.component.html`, o bloco do campo Código (linhas 37-44) passa de um `<input>` solto para um input-group:

```html
<div class="field-wrap field-wrap--md">
  <label class="field-label">Código <span class="req">*</span></label>
  <div class="input-group-codigo">
    <span class="input-group-codigo__prefix">LOTE-</span>
    <input class="field-input field-input--codigo" formControlName="codigo" placeholder="001" />
  </div>
  <span class="field-error" *ngIf="form.get('codigo')?.invalid && form.get('codigo')?.touched">
    Campo obrigatório
  </span>
</div>
```

CSS novo (`lote-details.component.css`): `.input-group-codigo` como flex container com borda única; `.input-group-codigo__prefix` com fundo levemente cinza, sem borda direita, alinhado ao input que perde a borda esquerda — visual de campo único dividido em duas partes. `formControlName="codigo"` continua vinculado só ao valor digitado (sufixo).

### 3. Remover valores default dos campos numéricos

Em `lote-details.component.ts`, no `ngOnInit` (linhas 178-182):

```ts
qntdAnimais: [null, [Validators.required, Validators.min(1)]],
idadeEmMeses: [null, [Validators.required, Validators.min(0)]],
peso: [null, [Validators.required, Validators.min(0)]],
```

Isso só afeta o estado inicial do form de criação — no modo de edição, `ngOnInit`/`patchValue` (fluxo existente de carregar o lote) sobrescreve com os valores reais salvos, sem mudança de comportamento ali.

## Testes manuais (verify)

- Criar um lote novo: campo Código mostra "LOTE-" fixo + input vazio; Qtd./Idade/Peso nascem vazios; salvar e confirmar que o valor persistido no banco é só o sufixo digitado (sem "LOTE-").
- Listagem (`lote-list`, `monitor-lotes`): código aparece como "LOTE-<valor salvo>".
- Editar um lote existente: prefixo fixo aparece, sufixo carregado é o valor real salvo; Qtd./Idade/Peso carregam os valores reais (não vazios).
- Tela de evento (`evento-leilao`) e link público (`evento-publico`): código aparece formatado nas mensagens de confirmação/sucesso e na listagem de lotes do evento.
