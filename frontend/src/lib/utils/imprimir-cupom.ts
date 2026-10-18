// Cupom térmico (bobina 80 mm, driver POS80): largura útil de 72 mm, sem
// margens e com a altura do próprio conteúdo — ver specs/vendas/spec-v3.md.
export const LARGURA_CUPOM_MM = 72;
const FOLGA_MM = 2;
const PX_POR_MM = 96 / 25.4;

/** Mede o elemento mesmo quando ele está escondido na tela (`hidden print:block`). */
function medirAlturaPx(el: HTMLElement): number {
  const { display, position, visibility } = el.style;
  el.style.display = "block";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  const altura = el.getBoundingClientRect().height;
  el.style.display = display;
  el.style.position = position;
  el.style.visibility = visibility;
  return altura;
}

/** Imprime com `@page` do tamanho exato do cupom e remove a regra ao terminar. */
export function imprimirCupom(el: HTMLElement) {
  const alturaMm = Math.ceil(medirAlturaPx(el) / PX_POR_MM) + FOLGA_MM;
  const style = document.createElement("style");
  style.dataset.cupom = "";
  style.textContent = `@page { size: ${LARGURA_CUPOM_MM}mm ${alturaMm}mm; margin: 0; }`;
  document.head.appendChild(style);

  const limpar = () => {
    style.remove();
    window.removeEventListener("afterprint", limpar);
  };
  window.addEventListener("afterprint", limpar);
  window.print();
}
