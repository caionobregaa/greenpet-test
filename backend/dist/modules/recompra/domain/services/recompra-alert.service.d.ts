export type UrgencyLevel = 'vencido' | 'urgente' | 'proximo' | 'ok';
export declare function classifyUrgency(diasRestantes: number): UrgencyLevel;
export declare function calcDiasRestantes(ultimaCompra: Date, diasRecompra: number): number;
//# sourceMappingURL=recompra-alert.service.d.ts.map