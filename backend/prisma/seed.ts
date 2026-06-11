import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Seeding banco de dados...')

  const senhaHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@greenpet.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@greenpet.com',
      senhaHash,
      papel: 'admin',
    },
  })
  console.log('✅ Usuário admin criado: admin@greenpet.com / admin123')

  await seedProdutosPrime(prisma)
  await seedProdutosBasso(prisma)
  await seedProdutosCentralPec(prisma)
  console.log('✅ Seed concluído.')
}

// ─── Margens por categoria ────────────────────────────────────────────────────
const M_MATISSE       = { margemCartao: 6.09, margemImposto: 5, margemOperacao: 2, margemLucro: 32 }
const M_PETICOS       = { margemCartao: 6.09, margemImposto: 5, margemOperacao: 2, margemLucro: 60 }
const M_SUPLEMENTO    = { margemCartao: 6.09, margemImposto: 5, margemOperacao: 2, margemLucro: 30 }
const M_ROYAL_CANINE  = { margemCartao: 6.09, margemImposto: 5, margemOperacao: 2, margemLucro: 45 }
const M_CENTRAL_PEC   = { margemCartao: 6.09, margemImposto: 5, margemOperacao: 2, margemLucro: 30 }

interface ProdutoSeed {
  nome: string; categoria: string; especie?: string; subCategoria?: string
  marca?: string; fornecedor?: string; pesoEmbalagem?: number
  valorCusto: number; valorVenda: number
  margemCartao?: number; margemImposto?: number; margemOperacao?: number; margemLucro?: number
}

const PRODUTOS_PRIME: ProdutoSeed[] = [
  // ── ND Ancestral Grain Feline ────────────────────────────────────────────
  { nome: 'ND Ancestral Grain Feline Frango & Roma Adult Castrado 1,5kg', categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 140.19, valorVenda: 182 },
  { nome: 'ND Ancestral Grain Feline Frango & Roma Adult Castrado 7,5kg', categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 294.40, valorVenda: 383 },
  { nome: 'ND Ancestral Grain Feline Cordeiro & Blueberry Adult 1,5kg',   categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 148.12, valorVenda: 193 },
  { nome: 'ND Ancestral Grain Feline Cordeiro & Blueberry Adult 7,5kg',   categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 310.00, valorVenda: 403 },
  // ── ND Prime Feline ──────────────────────────────────────────────────────
  { nome: 'ND Prime Feline Frango & Roma 1,5kg',             categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 165.31, valorVenda: 215 },
  { nome: 'ND Prime Feline Frango & Roma 7,5kg',             categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 299.00, valorVenda: 389 },
  { nome: 'ND Prime Feline Frango & Roma Castrado 7,5kg',    categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 290.00, valorVenda: 377 },
  { nome: 'ND Prime Feline Cordeiro & Blueberry 1,5kg',      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 148.12, valorVenda: 193 },
  { nome: 'ND Prime Feline Cordeiro & Blueberry 7,5kg',      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 319.00, valorVenda: 415 },
  // ── ND Ocean Feline ──────────────────────────────────────────────────────
  { nome: 'ND Ocean Feline Salmão & Melão Castrado 1,5kg',   categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 189.12, valorVenda: 246 },
  { nome: 'ND Ocean Feline Salmão & Melão Castrado 7,5kg',   categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 342.70, valorVenda: 446 },
  // ── ND Quinoa Feline ─────────────────────────────────────────────────────
  { nome: 'ND Quinoa Feline Hairball 1,5kg',                 categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 178.54, valorVenda: 232 },
  { nome: 'ND Quinoa Feline Controle de Peso 1,5kg',         categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 201.02, valorVenda: 262 },
  { nome: 'ND Quinoa Feline Controle de Peso 7,5kg',         categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 414.00, valorVenda: 539 },
  // ── ND Spirulina Feline ──────────────────────────────────────────────────
  { nome: 'ND Spirulina Feline Tilapia/Spirulina/Goji Adult 1,5kg',    categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 154.73, valorVenda: 201 },
  { nome: 'ND Spirulina Feline Tilapia/Spirulina/Goji Adult 7kg',      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7,   valorCusto: 301.88, valorVenda: 393 },
  { nome: 'ND Spirulina Feline Suino/Spirulina/Goji Castrado 7kg',     categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7,   valorCusto: 301.88, valorVenda: 393 },
  // ── ND Tropical Selection Feline ─────────────────────────────────────────
  { nome: 'ND Tropical Selection Feline Cordeiro Adult Castrado 1,5kg', categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 108.50, valorVenda: 141 },
  { nome: 'ND Tropical Selection Feline Cordeiro Adult Castrado 7kg',   categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7,   valorCusto: 264.50, valorVenda: 344 },
  { nome: 'ND Tropical Selection Feline Frango Adult 1,5kg',            categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto:  85.96, valorVenda: 112 },
  { nome: 'ND Tropical Selection Feline Frango Adult 7kg',              categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7,   valorCusto: 218.50, valorVenda: 284 },
  // ── ND Filhotes ──────────────────────────────────────────────────────────
  { nome: 'ND Tropical Selection Filhote Suino 1,5kg',       categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 105.80, valorVenda: 138 },
  { nome: 'ND Tropical Selection Filhote Suino 7kg',         categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7,   valorCusto: 226.00, valorVenda: 294 },
  { nome: 'ND Prime Filhote Frango & Roma 1,5kg',            categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 1.5, valorCusto: 165.71, valorVenda: 216 },
  { nome: 'ND Prime Filhote Frango & Roma 7,5kg',            categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 333.50, valorVenda: 434 },
  // ── ND Gastrointestinal ──────────────────────────────────────────────────
  { nome: 'ND Gastrointestinal 2kg',                         categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'ND', fornecedor: 'PRIME', pesoEmbalagem: 2,   valorCusto: 132.83, valorVenda: 173 },
  // ── Matisse Ração Úmida ──────────────────────────────────────────────────
  { nome: 'Matisse Ração Úmida Mousse Salmão 85g',           categoria: 'Ração', especie: 'Gato', subCategoria: 'Úmida', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 0.085, valorCusto: 11.40, valorVenda: 17, ...M_MATISSE },
  { nome: 'Matisse Ração Úmida Mousse Sardinha 85g',         categoria: 'Ração', especie: 'Gato', subCategoria: 'Úmida', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 0.085, valorCusto: 11.04, valorVenda: 16, ...M_MATISSE },
  { nome: 'Matisse Ração Úmida Mousse Frango 85g',           categoria: 'Ração', especie: 'Gato', subCategoria: 'Úmida', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 0.085, valorCusto: 11.04, valorVenda: 16, ...M_MATISSE },
  { nome: 'Matisse Ração Úmida Mousse Cordeiro 85g',         categoria: 'Ração', especie: 'Gato', subCategoria: 'Úmida', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 0.085, valorCusto: 11.04, valorVenda: 16, ...M_MATISSE },
  { nome: 'Matisse Ração Úmida Mousse Bacalhau 85g',         categoria: 'Ração', especie: 'Gato', subCategoria: 'Úmida', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 0.085, valorCusto: 11.04, valorVenda: 16, ...M_MATISSE },
  // ── Matisse Ração Seca ───────────────────────────────────────────────────
  { nome: 'Matisse Ração Seca Gatos Adultos Frango e Arroz 2kg',          categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 2,   valorCusto:  51.45, valorVenda:  75, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Adultos Frango e Arroz 7,5kg',        categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 131.25, valorVenda: 190, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Adultos Salmão e Arroz 2kg',          categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 2,   valorCusto:  56.70, valorVenda:  82, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Adultos Salmão e Arroz 7,5kg',        categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 138.60, valorVenda: 201, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Filhotes 2kg',                        categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 2,   valorCusto:  56.70, valorVenda:  82, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Filhotes 7,5kg',                      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 138.70, valorVenda: 201, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Adultos Castrados Frango 2kg',        categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 2,   valorCusto:  58.80, valorVenda:  85, ...M_MATISSE },
  { nome: 'Matisse Ração Seca Gatos Adultos Castrados Frango 7,5kg',      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca', marca: 'Matisse', fornecedor: 'PRIME', pesoEmbalagem: 7.5, valorCusto: 149.10, valorVenda: 216, ...M_MATISSE },
  // ── LongCare Snacks para Cães ────────────────────────────────────────────
  { nome: 'Snack LongCare Hipersensível Proteína Hidrolisada',    categoria: 'Petisco', especie: 'Cão', subCategoria: 'Snack Funcional', marca: 'LongCare', fornecedor: 'PRIME', valorCusto: 10.08, valorVenda: 17, ...M_PETICOS },
  { nome: 'Snack LongCare Zen Maracujá Valeriana e Camomila',     categoria: 'Petisco', especie: 'Cão', subCategoria: 'Snack Funcional', marca: 'LongCare', fornecedor: 'PRIME', valorCusto: 10.08, valorVenda: 17, ...M_PETICOS },
  { nome: 'Snack LongCare Fit Abóbora Chia e Ervilha',            categoria: 'Petisco', especie: 'Cão', subCategoria: 'Snack Funcional', marca: 'LongCare', fornecedor: 'PRIME', valorCusto: 10.08, valorVenda: 17, ...M_PETICOS },
  { nome: 'Snack LongCare Sensível Sabor Cordeiro',               categoria: 'Petisco', especie: 'Cão', subCategoria: 'Snack Funcional', marca: 'LongCare', fornecedor: 'PRIME', valorCusto: 10.08, valorVenda: 17, ...M_PETICOS },
  // ── Churu para Gatos ─────────────────────────────────────────────────────
  { nome: 'Churu Atum e Salmão 4 Tubes 56g',  categoria: 'Petisco', especie: 'Gato', subCategoria: 'Churu', marca: 'Churu', fornecedor: 'PRIME', pesoEmbalagem: 0.056, valorCusto: 19.90, valorVenda: 25, ...M_PETICOS },
  { nome: 'Churu Galinha 4 Tubes 56g',        categoria: 'Petisco', especie: 'Gato', subCategoria: 'Churu', marca: 'Churu', fornecedor: 'PRIME', pesoEmbalagem: 0.056, valorCusto: 19.90, valorVenda: 25, ...M_PETICOS },
  { nome: 'Churu Atum e Salmão 1 Tube',       categoria: 'Petisco', especie: 'Gato', subCategoria: 'Churu', marca: 'Churu', fornecedor: 'PRIME', valorCusto:  4.97, valorVenda:  9, ...M_PETICOS },
  { nome: 'Churu Galinha 1 Tube',             categoria: 'Petisco', especie: 'Gato', subCategoria: 'Churu', marca: 'Churu', fornecedor: 'PRIME', valorCusto:  4.97, valorVenda:  9, ...M_PETICOS },
  // ── Suplementos ──────────────────────────────────────────────────────────
  { nome: 'QUERANON Pequenos 5KG 30 Comprimidos',                    categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Comprimido', marca: 'Queranon',  fornecedor: 'PRIME', valorCusto:  65.52, valorVenda:  94, ...M_SUPLEMENTO },
  { nome: 'QUERANON LB 30 Comprimidos',                              categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Comprimido', marca: 'Queranon',  fornecedor: 'PRIME', valorCusto: 133.00, valorVenda: 190, ...M_SUPLEMENTO },
  { nome: 'QUERANON 15KG 30 Comprimidos',                            categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Comprimido', marca: 'Queranon',  fornecedor: 'PRIME', valorCusto:  97.02, valorVenda: 139, ...M_SUPLEMENTO },
  { nome: 'Babyflora para Cães e Gatos 10g',                         categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Pó',         marca: 'Babyflora', fornecedor: 'PRIME', valorCusto: 105.84, valorVenda: 151, ...M_SUPLEMENTO },
  { nome: 'Beneflora Vet para Cães e Gatos 14g',                     categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Pó',         marca: 'Beneflora', fornecedor: 'PRIME', valorCusto:  66.84, valorVenda:  96, ...M_SUPLEMENTO },
  { nome: 'Beneflora para Gatos 5g',                                 categoria: 'Suplemento', especie: 'Gato',       subCategoria: 'Pó',         marca: 'Beneflora', fornecedor: 'PRIME', valorCusto:  65.52, valorVenda:  94, ...M_SUPLEMENTO },
  { nome: 'Beneflora Derme para Cães e Gatos 30g',                   categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Pó',         marca: 'Beneflora', fornecedor: 'PRIME', valorCusto: 160.02, valorVenda: 229, ...M_SUPLEMENTO },
  { nome: 'Beneflora Oro para Cães e Gatos 30g',                     categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Pó',         marca: 'Beneflora', fornecedor: 'PRIME', valorCusto: 160.02, valorVenda: 229, ...M_SUPLEMENTO },
  { nome: 'Up Flora para Cães e Gatos 8 Cápsulas',                   categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Cápsula',    marca: 'Up Flora',  fornecedor: 'PRIME', valorCusto: 110.88, valorVenda: 159, ...M_SUPLEMENTO },
  { nome: 'Macrogard 60g',                                           categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Pó',         marca: 'Macrogard', fornecedor: 'PRIME', valorCusto:  93.32, valorVenda: 134, ...M_SUPLEMENTO },
  { nome: 'Macrogard Pet Small Size Cães e Gatos 30 Comprimidos',    categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Comprimido', marca: 'Macrogard', fornecedor: 'PRIME', valorCusto:  83.75, valorVenda: 120, ...M_SUPLEMENTO },
  { nome: 'Macrogard Pet Cães e Gatos 30 Comprimidos',               categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Comprimido', marca: 'Macrogard', fornecedor: 'PRIME', valorCusto: 136.76, valorVenda: 196, ...M_SUPLEMENTO },
  { nome: 'Foli B para Cães e Gatos 30ml',                           categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Líquido',    marca: 'Foli B',    fornecedor: 'PRIME', valorCusto:  81.70, valorVenda: 117, ...M_SUPLEMENTO },
  { nome: 'Artrotabs Pasta para Gatos 60g',                          categoria: 'Suplemento', especie: 'Gato',       subCategoria: 'Pasta',      marca: 'Artrotabs', fornecedor: 'PRIME', valorCusto: 173.88, valorVenda: 249, ...M_SUPLEMENTO },
  { nome: 'Artrotabs para Cães e Gatos 30 Comprimidos',              categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Comprimido', marca: 'Artrotabs', fornecedor: 'PRIME', valorCusto: 170.10, valorVenda: 243, ...M_SUPLEMENTO },
  { nome: 'Ograx-3 500mg 30 Cápsulas para Cães e Gatos',            categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto:  85.68, valorVenda: 123, ...M_SUPLEMENTO },
  { nome: 'Ograx-3 1000mg 30 Cápsulas para Cães e Gatos',           categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto: 120.96, valorVenda: 173, ...M_SUPLEMENTO },
  { nome: 'Ograx Derme 10 para Cães e Gatos 30 Cápsulas',           categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto: 108.36, valorVenda: 155, ...M_SUPLEMENTO },
  { nome: 'Ograx Artro 10 para Cães e Gatos 30 Cápsulas',           categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto: 205.38, valorVenda: 294, ...M_SUPLEMENTO },
  { nome: 'Ograx Artro 20 para Cães 30 Cápsulas',                   categoria: 'Suplemento', especie: 'Cão',        subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto: 248.22, valorVenda: 355, ...M_SUPLEMENTO },
  { nome: 'Ograx Sênior 5 para Cães e Gatos 30 Cápsulas',           categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto:  82.49, valorVenda: 118, ...M_SUPLEMENTO },
  { nome: 'Ograx Baby para Cães e Gatos 30ml',                      categoria: 'Suplemento', especie: 'Cão e Gato', subCategoria: 'Líquido',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto:  94.50, valorVenda: 135, ...M_SUPLEMENTO },
  { nome: 'Ograx 5 para Gatos 30 Cápsulas',                         categoria: 'Suplemento', especie: 'Gato',       subCategoria: 'Cápsula',    marca: 'Ograx',     fornecedor: 'PRIME', valorCusto:  90.72, valorVenda: 130, ...M_SUPLEMENTO },
]

// ─── Royal Canine – BASSO PANCOTTE ───────────────────────────────────────────
const PRODUTOS_BASSO: ProdutoSeed[] = [
  // ── Cão · Adulto ─────────────────────────────────────────────────────────
  { nome: 'Royal Canine X Small Adult 2,5kg',                          categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto: 107.70, valorVenda: 170, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Mini Adult 2,5kg',                             categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto:  88.38, valorVenda: 140, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Mini Adult 7,5kg',                             categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  7.5, valorCusto: 192.23, valorVenda: 304, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Mini Indoor Adult 2,5kg',                      categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto:  96.84, valorVenda: 153, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Mini Indoor Adult 7,5kg',                      categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  7.5, valorCusto: 211.46, valorVenda: 334, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Medium Adult 2,5kg',                           categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto:  80.69, valorVenda: 128, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Medium Adult 12kg',                            categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 12,   valorCusto: 217.62, valorVenda: 344, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Maxi Adult 12kg',                              categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 12,   valorCusto: 265.08, valorVenda: 419, ...M_ROYAL_CANINE },
  // ── Cão · Filhote ────────────────────────────────────────────────────────
  { nome: 'Royal Canine Mini Puppy 2,5kg',                             categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto:  84.54, valorVenda: 134,    ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Mini Puppy 7,5kg',                             categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  7.5, valorCusto: 192.23, valorVenda: 304,    ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Maxi Puppy 4kg',                               categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  4,   valorCusto: 143.18, valorVenda: 226,    ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Maxi Puppy 12kg',                              categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 12,   valorCusto: 285.11, valorVenda: 451,    ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Medium Puppy 2,5kg',                           categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto:  76.85, valorVenda: 121.49, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Medium Puppy 12kg',                            categoria: 'Ração', especie: 'Cão', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 12,   valorCusto: 207.62, valorVenda: 328,    ...M_ROYAL_CANINE },
  // ── Cão · Raças Específicas ───────────────────────────────────────────────
  { nome: 'Royal Canine Yorkshire Adult 2,5kg',                        categoria: 'Ração', especie: 'Cão', subCategoria: 'Raça Específica', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 2.5, valorCusto: 102.23, valorVenda: 162, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Yorkshire Adult 8+ 2,5kg',                     categoria: 'Ração', especie: 'Cão', subCategoria: 'Raça Específica', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 2.5, valorCusto: 105.46, valorVenda: 167, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Shih Tzu Adult 2,5kg',                         categoria: 'Ração', especie: 'Cão', subCategoria: 'Raça Específica', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 2.5, valorCusto: 102.23, valorVenda: 162, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Maltês Adult 2,5kg',                           categoria: 'Ração', especie: 'Cão', subCategoria: 'Raça Específica', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 2.5, valorCusto: 102.23, valorVenda: 162, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Pomeranian Adult 2,5kg',                       categoria: 'Ração', especie: 'Cão', subCategoria: 'Raça Específica', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 2.5, valorCusto: 102.23, valorVenda: 162, ...M_ROYAL_CANINE },
  // ── Cão · Medicamentosas ─────────────────────────────────────────────────
  { nome: 'Royal Canine Light 3kg',                                    categoria: 'Ração', especie: 'Cão', subCategoria: 'Medicamentosa', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  3,   valorCusto: 226.31, valorVenda: 358, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Hipoalergênica Cães Pequenos e Adultos 7,5kg', categoria: 'Ração', especie: 'Cão', subCategoria: 'Medicamentosa', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  7.5, valorCusto: 386.26, valorVenda: 611, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Hipoalergênica Cães Adultos 10,1kg',           categoria: 'Ração', especie: 'Cão', subCategoria: 'Medicamentosa', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 10.1, valorCusto: 452.85, valorVenda: 716, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Urinary Cão',                                  categoria: 'Ração', especie: 'Cão', subCategoria: 'Medicamentosa', marca: 'Royal Canine', fornecedor: 'Basso Pancotte',                      valorCusto: 121.86, valorVenda: 193, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Ração Úmida Urinary Cão',                      categoria: 'Ração', especie: 'Cão', subCategoria: 'Úmida',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte',                      valorCusto:  34.34, valorVenda:  54, ...M_ROYAL_CANINE },
  // ── Gato · Adulto ─────────────────────────────────────────────────────────
  { nome: 'Royal Canine Super Premium Cat Adult Castrado 2,5kg',       categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  2.5, valorCusto: 103.30, valorVenda: 163, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Super Premium Cat Adult Castrado 10,1kg',      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 10.1, valorCusto: 239.21, valorVenda: 378, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Fit Gato 1,5kg',                               categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  1.5, valorCusto:  90.44, valorVenda: 143, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Fit Gato 7,5kg',                               categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca',         marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  7.5, valorCusto: 321.53, valorVenda: 508, ...M_ROYAL_CANINE },
  // ── Gato · Filhote ────────────────────────────────────────────────────────
  { nome: 'Royal Canine Mother e Baby Cat 1,5kg',                      categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  1.5, valorCusto: 103.56, valorVenda: 164, ...M_ROYAL_CANINE },
  { nome: 'Royal Canine Mother e Baby Cat 4kg',                        categoria: 'Ração', especie: 'Gato', subCategoria: 'Seca Filhote', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem:  4,   valorCusto: 250.28, valorVenda: 396, ...M_ROYAL_CANINE },
  // ── Gato · Raças Específicas ──────────────────────────────────────────────
  { nome: 'Royal Canine Maine Coon 4kg',                               categoria: 'Ração', especie: 'Gato', subCategoria: 'Raça Específica', marca: 'Royal Canine', fornecedor: 'Basso Pancotte', pesoEmbalagem: 4, valorCusto: 278.41, valorVenda: 440, ...M_ROYAL_CANINE },
]

// ─── Central Pec ─────────────────────────────────────────────────────────────
const PRODUTOS_CENTRAL_PEC: ProdutoSeed[] = [
  { nome: 'Simparic 1 Comp 5mg 1,3 a 2,5kg',   categoria: 'Suplemento', especie: 'Cão', subCategoria: 'Antiparasitário', marca: 'Simparic', fornecedor: 'Central Pec', valorCusto: 61.18, valorVenda:  88, ...M_CENTRAL_PEC },
  { nome: 'Simparic 1 Comp 10mg 2,6 a 5kg',    categoria: 'Suplemento', especie: 'Cão', subCategoria: 'Antiparasitário', marca: 'Simparic', fornecedor: 'Central Pec', valorCusto: 68.02, valorVenda:  97, ...M_CENTRAL_PEC },
  { nome: 'Simparic 1 Comp 20mg 5,1 a 10kg',   categoria: 'Suplemento', especie: 'Cão', subCategoria: 'Antiparasitário', marca: 'Simparic', fornecedor: 'Central Pec', valorCusto: 71.50, valorVenda: 102, ...M_CENTRAL_PEC },
]

async function seedProdutosCentralPec(prisma: PrismaClient): Promise<void> {
  console.log(`📦 Seeding ${PRODUTOS_CENTRAL_PEC.length} produtos Simparic (Central Pec)...`)
  let criados = 0
  let atualizados = 0

  for (const p of PRODUTOS_CENTRAL_PEC) {
    const data = {
      categoria:      p.categoria,
      especie:        p.especie ?? null,
      subCategoria:   p.subCategoria ?? null,
      marca:          p.marca ?? null,
      fornecedor:     p.fornecedor ?? null,
      pesoEmbalagem:  p.pesoEmbalagem ?? null,
      valorCusto:     p.valorCusto,
      valorVenda:     p.valorVenda,
      margemCartao:   p.margemCartao ?? 0,
      margemImposto:  p.margemImposto ?? 0,
      margemOperacao: p.margemOperacao ?? 0,
      margemLucro:    p.margemLucro ?? 0,
    }
    const existing = await prisma.produto.findUnique({ where: { nome: p.nome } })
    if (existing) {
      await prisma.produto.update({ where: { nome: p.nome }, data })
      atualizados++
    } else {
      await prisma.produto.create({ data: { nome: p.nome, ...data } })
      criados++
    }
  }

  console.log(`✅ Central Pec: ${criados} criados, ${atualizados} atualizados`)
}

async function seedProdutosBasso(prisma: PrismaClient): Promise<void> {
  console.log(`📦 Seeding ${PRODUTOS_BASSO.length} produtos Royal Canine (Basso Pancotte)...`)
  let criados = 0
  let atualizados = 0

  for (const p of PRODUTOS_BASSO) {
    const data = {
      categoria:      p.categoria,
      especie:        p.especie ?? null,
      subCategoria:   p.subCategoria ?? null,
      marca:          p.marca ?? null,
      fornecedor:     p.fornecedor ?? null,
      pesoEmbalagem:  p.pesoEmbalagem ?? null,
      valorCusto:     p.valorCusto,
      valorVenda:     p.valorVenda,
      margemCartao:   p.margemCartao ?? 0,
      margemImposto:  p.margemImposto ?? 0,
      margemOperacao: p.margemOperacao ?? 0,
      margemLucro:    p.margemLucro ?? 0,
    }
    const existing = await prisma.produto.findUnique({ where: { nome: p.nome } })
    if (existing) {
      await prisma.produto.update({ where: { nome: p.nome }, data })
      atualizados++
    } else {
      await prisma.produto.create({ data: { nome: p.nome, ...data } })
      criados++
    }
  }

  console.log(`✅ Royal Canine: ${criados} criados, ${atualizados} atualizados`)
}

async function seedProdutosPrime(prisma: PrismaClient): Promise<void> {
  console.log(`📦 Seeding ${PRODUTOS_PRIME.length} produtos PRIME...`)
  let criados = 0
  let atualizados = 0

  for (const p of PRODUTOS_PRIME) {
    const data = {
      categoria:      p.categoria,
      especie:        p.especie ?? null,
      subCategoria:   p.subCategoria ?? null,
      marca:          p.marca ?? null,
      fornecedor:     p.fornecedor ?? null,
      pesoEmbalagem:  p.pesoEmbalagem ?? null,
      valorCusto:     p.valorCusto,
      valorVenda:     p.valorVenda,
      margemCartao:   p.margemCartao ?? 0,
      margemImposto:  p.margemImposto ?? 0,
      margemOperacao: p.margemOperacao ?? 0,
      margemLucro:    p.margemLucro ?? 0,
    }
    const existing = await prisma.produto.findUnique({ where: { nome: p.nome } })
    if (existing) {
      await prisma.produto.update({ where: { nome: p.nome }, data })
      atualizados++
    } else {
      await prisma.produto.create({ data: { nome: p.nome, ...data } })
      criados++
    }
  }

  console.log(`✅ Produtos: ${criados} criados, ${atualizados} atualizados`)
}

main()
  .catch((e: unknown) => {
    console.error('❌ Seed falhou:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
