"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const recompra_alert_service_1 = require("../../../../src/modules/recompra/domain/services/recompra-alert.service");
(0, vitest_1.describe)('recompra-alert.service — classifyUrgency', () => {
    (0, vitest_1.it)('retorna vencido quando diasRestantes < 0', () => {
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(-1)).toBe('vencido');
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(-100)).toBe('vencido');
    });
    (0, vitest_1.it)('retorna urgente quando diasRestantes está em [0, 3]', () => {
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(0)).toBe('urgente');
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(3)).toBe('urgente');
    });
    (0, vitest_1.it)('retorna proximo quando diasRestantes está em [4, 7]', () => {
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(4)).toBe('proximo');
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(7)).toBe('proximo');
    });
    (0, vitest_1.it)('retorna ok quando diasRestantes > 7', () => {
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(8)).toBe('ok');
        (0, vitest_1.expect)((0, recompra_alert_service_1.classifyUrgency)(30)).toBe('ok');
    });
});
//# sourceMappingURL=recompra-alert.service.spec.js.map