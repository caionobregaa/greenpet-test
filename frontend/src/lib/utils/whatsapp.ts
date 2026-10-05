/**
 * Link do WhatsApp com mensagem pronta. Telefone sem DDI recebe o 55 (Brasil);
 * sem telefone válido, abre o WhatsApp só com o texto, para escolher o contato.
 */
export function whatsappUrl(telefone: string | null | undefined, texto: string): string {
  const digitos = (telefone ?? "").replace(/\D/g, "");
  const numero = digitos.length > 4 ? (digitos.startsWith("55") && digitos.length > 11 ? digitos : `55${digitos}`) : "";
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** Mensagem de lembrete de recompra (specs/recompra/spec-v2.md). */
export function mensagemRecompra(a: { clienteNome: string; produtoNome: string; animalNome?: string | null }): string {
  const primeiroNome = a.clienteNome.trim().split(/\s+/)[0] ?? a.clienteNome;
  const paraQuem = a.animalNome ? ` do(a) ${a.animalNome}` : "";
  return (
    `Olá, ${primeiroNome}! Aqui é da BEEZ PET 🐝\n` +
    `O(a) ${a.produtoNome}${paraQuem} deve estar acabando. Quer que a gente separe pra você?`
  );
}
