const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const SISTEMA_URL = 'https://app.beezpet.com.br'

export type ImagemCatalogo =
  | { tipo: 'arquivo'; contentType: string; bytes: Buffer }
  | { tipo: 'redirecionar'; url: string }

/**
 * Interpreta `produtos.imagemUrl` (specs/catalogo/spec-v1.md): base64 vira arquivo; URL ou
 * caminho de cadastros antigos vira redirecionamento. Formato fora disso, inclusive SVG, é null.
 */
export function interpretarImagem(valor: string): ImagemCatalogo | null {
  if (valor.startsWith('data:')) {
    const virgula = valor.indexOf(',')
    if (virgula === -1) return null
    const [contentType, encoding] = valor.slice('data:'.length, virgula).split(';')
    if (encoding !== 'base64' || !TIPOS_PERMITIDOS.includes(contentType)) return null
    const bytes = Buffer.from(valor.slice(virgula + 1), 'base64')
    return bytes.length > 0 ? { tipo: 'arquivo', contentType, bytes } : null
  }
  if (/^https?:\/\//i.test(valor)) return { tipo: 'redirecionar', url: valor }
  if (valor.startsWith('/') && !valor.startsWith('//')) return { tipo: 'redirecionar', url: `${SISTEMA_URL}${valor}` }
  return null
}
