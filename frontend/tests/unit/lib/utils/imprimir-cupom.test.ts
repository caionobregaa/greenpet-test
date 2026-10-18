import { describe, it, expect, vi, afterEach } from "vitest";
import { imprimirCupom } from "@/lib/utils/imprimir-cupom";

function reciboComAltura(px: number) {
  const el = document.createElement("div");
  el.className = "hidden print:block";
  el.getBoundingClientRect = () => ({ height: px }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

describe("imprimirCupom", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.head.querySelectorAll("style[data-cupom]").forEach((s) => s.remove());
    document.body.innerHTML = "";
  });

  it("define @page com 72 mm de largura, altura do recibo + 2 mm e margem 0, e chama window.print", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    // 378px a 96 dpi = 100,0125 mm → arredonda pra cima (101) + 2 de folga
    imprimirCupom(reciboComAltura(378));

    const style = document.head.querySelector("style[data-cupom]");
    expect(style?.textContent).toBe("@page { size: 72mm 103mm; margin: 0; }");
    expect(print).toHaveBeenCalledOnce();
  });

  it("remove a regra @page depois do afterprint", () => {
    vi.spyOn(window, "print").mockImplementation(() => {});
    imprimirCupom(reciboComAltura(200));
    expect(document.head.querySelector("style[data-cupom]")).not.toBeNull();

    window.dispatchEvent(new Event("afterprint"));
    expect(document.head.querySelector("style[data-cupom]")).toBeNull();
  });

  it("restaura o estilo inline do elemento depois de medir", () => {
    vi.spyOn(window, "print").mockImplementation(() => {});
    const el = reciboComAltura(200);
    imprimirCupom(el);
    expect(el.getAttribute("style") ?? "").toBe("");
  });
});
