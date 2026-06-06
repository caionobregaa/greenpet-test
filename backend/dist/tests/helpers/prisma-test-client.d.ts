import { PrismaClient } from '@prisma/client';
export declare const prismaTest: PrismaClient<{
    datasources: {
        db: {
            url: string;
        };
    };
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function truncateAll(): Promise<void>;
//# sourceMappingURL=prisma-test-client.d.ts.map