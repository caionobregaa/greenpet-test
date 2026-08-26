/**
 * Gera as marcações de um eixo numérico sempre em múltiplos fixos de `step`
 * (ex: 0, 500, 1000, 1500…), cobrindo até o menor múltiplo de `step` que seja
 * maior ou igual a `maxValue`. Garante pelo menos `[0, step]` quando não há dados.
 */
export function buildTicksStep(maxValue: number, step: number): number[] {
  const safeMax = Number.isFinite(maxValue) ? Math.max(0, maxValue) : 0;
  const top = Math.max(step, Math.ceil(safeMax / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= top; t += step) ticks.push(t);
  return ticks;
}
