"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding banco de dados...');
    const senhaHash = await bcryptjs_1.default.hash('admin123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@greenpet.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@greenpet.com',
            senhaHash,
            papel: 'admin',
        },
    });
    console.log('✅ Usuário admin criado: admin@greenpet.com / admin123');
    console.log('✅ Seed concluído.');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map