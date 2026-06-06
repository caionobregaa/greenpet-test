"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyUrgency = classifyUrgency;
exports.calcDiasRestantes = calcDiasRestantes;
function classifyUrgency(diasRestantes) {
    if (diasRestantes < 0)
        return 'vencido';
    if (diasRestantes <= 3)
        return 'urgente';
    if (diasRestantes <= 7)
        return 'proximo';
    return 'ok';
}
function calcDiasRestantes(ultimaCompra, diasRecompra) {
    const proximaCompra = new Date(ultimaCompra);
    proximaCompra.setDate(proximaCompra.getDate() + diasRecompra);
    const hoje = new Date();
    const diffMs = proximaCompra.getTime() - hoje.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
//# sourceMappingURL=recompra-alert.service.js.map