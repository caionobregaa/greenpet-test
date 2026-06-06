"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaTest = void 0;
exports.truncateAll = truncateAll;
const client_1 = require("@prisma/client");
const testDb = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!testDb) {
    throw new Error('TEST_DATABASE_URL não está definida');
}
exports.prismaTest = new client_1.PrismaClient({ datasources: { db: { url: testDb } } });
async function truncateAll() {
    // Delete in reverse FK dependency order
    await exports.prismaTest.$transaction([
        exports.prismaTest.orcamentoItem.deleteMany(),
        exports.prismaTest.orcamento.deleteMany(),
        exports.prismaTest.vendaItem.deleteMany(),
        exports.prismaTest.venda.deleteMany(),
        exports.prismaTest.compraItem.deleteMany(),
        exports.prismaTest.compra.deleteMany(),
        exports.prismaTest.animal.deleteMany(),
        exports.prismaTest.produto.deleteMany(),
        exports.prismaTest.cliente.deleteMany(),
        exports.prismaTest.refreshToken.deleteMany(),
        exports.prismaTest.user.deleteMany(),
    ]);
}
//# sourceMappingURL=prisma-test-client.js.map