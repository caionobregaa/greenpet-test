import { type FastifyInstance } from 'fastify';
export interface AppOptions {
    jwtSecret: string;
    logger?: boolean;
}
export declare function buildApp(opts: AppOptions): Promise<FastifyInstance>;
//# sourceMappingURL=fastify-app.d.ts.map