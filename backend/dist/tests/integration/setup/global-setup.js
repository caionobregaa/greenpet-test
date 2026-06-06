"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = setup;
exports.teardown = teardown;
const node_child_process_1 = require("node:child_process");
async function setup() {
    const testDb = process.env.TEST_DATABASE_URL;
    if (!testDb) {
        throw new Error('TEST_DATABASE_URL não está definida. Configure o .env.test antes de rodar os testes de integração.');
    }
    console.log('🔧 Aplicando migrations no banco de teste...');
    (0, node_child_process_1.execSync)('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: testDb },
        stdio: 'inherit',
    });
    console.log('✅ Banco de teste pronto.');
}
async function teardown() {
    // Nothing to tear down — Docker container lifecycle handles DB reset
}
//# sourceMappingURL=global-setup.js.map