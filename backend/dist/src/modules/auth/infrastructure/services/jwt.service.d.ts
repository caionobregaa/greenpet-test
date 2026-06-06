import type { IJwtService } from '../../application/use-cases/login.use-case.js';
export declare class JwtService implements IJwtService {
    private readonly secret;
    constructor(secret: string);
    sign(payload: Record<string, unknown>, expiresIn: number): string;
}
//# sourceMappingURL=jwt.service.d.ts.map