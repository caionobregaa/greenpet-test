# feature: Autenticação

## requisitos

- O sistema deve autenticar usuários via e-mail e senha
- O sistema deve emitir um JWT de acesso e um refresh token no login bem-sucedido
- O sistema deve renovar o JWT via refresh token sem exigir nova senha
- O sistema deve invalidar o refresh token no logout

## regras de negócio

Ver [rules.md](rules.md).

## endpoints

### POST /auth/login

**Request:**
```json
{
  "email": "admin@greenpet.com",
  "senha": "senha123"
}
```

**Response 200:**
```json
{
  "data": {
    "token": "<jwt>",
    "refreshToken": "<uuid>",
    "expiresIn": 28800,
    "user": {
      "id": "uuid",
      "nome": "Admin",
      "email": "admin@greenpet.com",
      "papel": "admin"
    }
  }
}
```

**Erros:**
- `401` — credenciais inválidas
- `403` — conta bloqueada por excesso de tentativas

---

### POST /auth/refresh

**Request:**
```json
{ "refreshToken": "<uuid>" }
```

**Response 200:**
```json
{
  "data": {
    "token": "<novo-jwt>",
    "refreshToken": "<novo-uuid>",
    "expiresIn": 28800
  }
}
```

**Erros:**
- `401` — refresh token inválido ou expirado

---

### POST /auth/logout

**Header:** `Authorization: Bearer <token>`

**Response 204** (sem corpo)

## critérios de aceitação

- [ ] Login com credenciais válidas retorna token e refreshToken
- [ ] Login com senha errada retorna 401
- [ ] Após 5 falhas, login retorna 403 por 15 minutos
- [ ] Refresh com token válido retorna novo par de tokens
- [ ] Refresh com token expirado retorna 401
- [ ] Refresh token usado uma segunda vez retorna 401 (single-use)
- [ ] Logout invalida o refresh token; uso posterior retorna 401

## casos de erro

| Situação | HTTP | Código |
|----------|------|--------|
| E-mail não cadastrado | 401 | `INVALID_CREDENTIALS` |
| Senha incorreta | 401 | `INVALID_CREDENTIALS` |
| Conta bloqueada | 403 | `ACCOUNT_LOCKED` |
| Token expirado | 401 | `TOKEN_EXPIRED` |
| Token inválido | 401 | `TOKEN_INVALID` |

## fora de escopo (v1)

- Recuperação de senha por e-mail
- Autenticação OAuth (Google, etc.)
- Múltiplos papéis/permissões granulares
- 2FA
