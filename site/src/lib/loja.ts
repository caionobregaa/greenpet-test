/** Dados públicos da loja: fonte única para o site inteiro (specs/site/spec-v1.md). */
export const LOJA = {
  nome: "BEEZ PET",
  url: "https://beezpet.com.br",
  whatsapp: "(92) 98470-3686",
  instagram: "beezpetbr",
  instagramUrl: "https://instagram.com/beezpetbr",
  endereco: "Avenida Duque de Caxias, 1225",
  bairro: "Praça 14 de Janeiro",
  cidade: "Manaus",
  uf: "AM",
  cep: "69020-141",
  cnpj: "65.788.498/0001-44",
  freteGratisPiso: 80,
};

export const ENDERECO_COMPLETO = `${LOJA.endereco}, ${LOJA.bairro}, ${LOJA.cidade}-${LOJA.uf}`;

export const MAPA_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO_COMPLETO)}`;
