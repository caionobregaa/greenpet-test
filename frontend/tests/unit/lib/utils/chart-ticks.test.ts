import { describe, it, expect } from "vitest";
import { buildTicksStep } from "@/lib/utils/chart-ticks";

describe("chart-ticks — buildTicksStep", () => {
  it("retorna [0, step] quando não há valor (maxValue = 0)", () => {
    expect(buildTicksStep(0, 500)).toEqual([0, 500]);
  });

  it("arredonda para o próximo múltiplo do step quando o máximo não é exato", () => {
    expect(buildTicksStep(1200, 500)).toEqual([0, 500, 1000, 1500]);
  });

  it("mantém o topo exato quando o máximo já é múltiplo do step", () => {
    expect(buildTicksStep(1500, 500)).toEqual([0, 500, 1000, 1500]);
  });

  it("nunca gera passos diferentes de 'step' entre marcações consecutivas", () => {
    const ticks = buildTicksStep(3300, 500);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i] - ticks[i - 1]).toBe(500);
    }
  });

  it("trata valores negativos ou não finitos como zero", () => {
    expect(buildTicksStep(-100, 500)).toEqual([0, 500]);
    expect(buildTicksStep(NaN, 500)).toEqual([0, 500]);
  });

  it("funciona com um step diferente de 500", () => {
    expect(buildTicksStep(250, 100)).toEqual([0, 100, 200, 300]);
  });
});
