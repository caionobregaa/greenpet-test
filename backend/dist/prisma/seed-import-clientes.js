"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Retorna o cliente existente ou cria um novo (busca por nome+telefone)
async function upsertCliente(data) {
    const existing = await prisma.cliente.findFirst({
        where: { nome: data.nome, telefone: data.telefone },
    });
    if (existing) {
        console.log(`  ↩  Já existe: ${data.nome}`);
        return existing;
    }
    const cliente = await prisma.cliente.create({ data: { ...data, cidade: data.cidade ?? 'Manaus' } });
    console.log(`  ✅ Cliente criado: ${data.nome}`);
    return cliente;
}
// Cria animal se ainda não existir (busca por nome+clienteId)
async function upsertAnimal(data) {
    const existing = await prisma.animal.findFirst({
        where: { clienteId: data.clienteId, nome: data.nome },
    });
    if (existing) {
        console.log(`  ↩  Já existe: ${data.nome}`);
        return existing;
    }
    const animal = await prisma.animal.create({ data });
    console.log(`  ✅ Animal criado: ${data.nome}`);
    return animal;
}
async function main() {
    console.log('\n🌱 Importando clientes e animais...\n');
    // ── CLIENTES ──────────────────────────────────────────────────────────────
    console.log('👤 Criando clientes...');
    const yolanda = await upsertCliente({
        nome: 'Yolanda Mucceda',
        telefone: '(92) 98643-8407',
        endereco: 'Rua Sebatião de Melo, n17',
        bairro: 'Ponta Negra',
    });
    const eliane = await upsertCliente({
        nome: 'Eliane',
        telefone: '(92) 98131-1067',
        endereco: 'Rua Alvaro Braga, n5',
        bairro: 'Parque Dez',
    });
    const madalena = await upsertCliente({
        nome: 'Madalena',
        telefone: '(92) 98182-9453',
        endereco: 'Rua dos Banibas, 241, Cond. Maron, ap210 bl C',
        bairro: 'Parque Dez',
    });
    const caio = await upsertCliente({
        nome: 'Caio Fernandes',
        telefone: '(92) 98110-2199',
        endereco: 'Rua Vasco Vasques',
        bairro: 'Parque Dez',
    });
    const rafael = await upsertCliente({
        nome: 'Rafael Nóbrega',
        telefone: '(92) 98408-0216',
        bairro: 'Parque Dez',
    });
    const anatacha = await upsertCliente({
        nome: 'Anatacha',
        telefone: '(92) 98408-4766',
        endereco: 'Rua Padre Augostinho, Caballero Martins, casa 8',
        bairro: 'Santo Agostinho',
    });
    const leandra = await upsertCliente({
        nome: 'Leandra Germana',
        telefone: '(92) 99319-3022',
        endereco: 'Cond. Smile (Passeio do Mindu) Bloco 4A - AP 3',
        bairro: 'Parque Dez',
    });
    const lea = await upsertCliente({
        nome: 'Lea Alves',
        telefone: '(92) 98456-1111',
        bairro: 'Ponta Negra',
    });
    const brenda = await upsertCliente({
        nome: 'Brenda',
        telefone: '(92) 9 0000-0000',
        bairro: 'Parque Dez',
        obs: 'Telefone incompleto na planilha original',
    });
    const paulo = await upsertCliente({
        nome: 'Paulo Amorim',
        telefone: '(92) 99521-4051',
    });
    const luiz = await upsertCliente({
        nome: 'Luiz',
        telefone: '(92) 99186-6665',
    });
    const domicio = await upsertCliente({
        nome: 'Domicio',
        telefone: '+351 913 462 026',
        endereco: 'Cond. Ponta Negra II, Rua Texas, 27',
        bairro: 'Ponta Negra',
    });
    // ── ANIMAIS ───────────────────────────────────────────────────────────────
    console.log('\n🐾 Criando animais...');
    // Yolanda Mucceda
    await upsertAnimal({ clienteId: yolanda.id, nome: 'Nala', especie: 'Cão', raca: 'Golden', obs: 'Porte: Grande' });
    await upsertAnimal({ clienteId: yolanda.id, nome: 'Frederico', especie: 'Cão', raca: 'Golden', obs: 'Porte: Grande' });
    await upsertAnimal({ clienteId: yolanda.id, nome: 'Lua', especie: 'Cão', raca: 'Spitz', obs: 'Porte: Mini' });
    await upsertAnimal({ clienteId: yolanda.id, nome: 'Malevola e Pits', especie: 'Cão', raca: 'Cane Corso e Pitbull', obs: 'Porte: Gigante' });
    // Eliane
    await upsertAnimal({ clienteId: eliane.id, nome: 'Olaf', especie: 'Cão', raca: 'Spitz', nascimento: new Date('2026-01-01'), obs: 'Porte: Mini' });
    // Caio Fernandes
    await upsertAnimal({ clienteId: caio.id, nome: 'Jimmy', especie: 'Cão', raca: 'SRD', obs: 'Porte: Grande' });
    // Madalena
    await upsertAnimal({ clienteId: madalena.id, nome: 'Fofinha', especie: 'Cão', raca: 'SRD', obs: 'Porte: Grande' });
    await upsertAnimal({ clienteId: madalena.id, nome: 'Harmony', especie: 'Cão', raca: 'SRD', obs: 'Porte: Médio' });
    // Rafael Nóbrega
    await upsertAnimal({ clienteId: rafael.id, nome: 'Lili', especie: 'Cão', raca: 'Dachshund', obs: 'Porte: Pequeno' });
    await upsertAnimal({ clienteId: rafael.id, nome: 'Kyro', especie: 'Gato', raca: 'Mênicon', obs: 'Porte: Médio' });
    // Anatacha
    await upsertAnimal({ clienteId: anatacha.id, nome: 'Pandora', especie: 'Cão', raca: 'Shih Tzu', obs: 'Porte: Pequeno' });
    await upsertAnimal({ clienteId: anatacha.id, nome: 'Zoe', especie: 'Cão', raca: 'Spitz', obs: 'Porte: Pequeno' });
    // Leandra Germana
    await upsertAnimal({ clienteId: leandra.id, nome: 'Chihuahaha', especie: 'Cão', raca: 'Chihuahua', obs: 'Porte: Mini' });
    // Lea Alves
    await upsertAnimal({ clienteId: lea.id, nome: 'Nick Cordeiro', especie: 'Cão', raca: 'Lhasa Apso', obs: 'Porte: Pequeno' });
    await upsertAnimal({ clienteId: lea.id, nome: 'Mike Cordeiro', especie: 'Cão', raca: 'Spitz', obs: 'Porte: Pequeno' });
    // Brenda
    await upsertAnimal({ clienteId: brenda.id, nome: 'Cão', especie: 'Cão' });
    // Paulo Amorim
    await upsertAnimal({ clienteId: paulo.id, nome: 'Pitbull', especie: 'Cão', raca: 'Pitbull', obs: 'Porte: Médio' });
    // Luiz
    await upsertAnimal({ clienteId: luiz.id, nome: 'Não tem', especie: 'Cão' });
    // Domicio
    await upsertAnimal({ clienteId: domicio.id, nome: 'Carl Johnson', especie: 'Cão', raca: 'SRD', obs: 'Porte: Médio' });
    await upsertAnimal({ clienteId: domicio.id, nome: 'Luca', especie: 'Cão', raca: 'SRD', obs: 'Porte: Médio' });
    console.log('\n✅ Importação concluída!');
    console.log(`   12 clientes | 20 animais processados`);
}
main()
    .catch((e) => { console.error('❌ Erro:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-import-clientes.js.map