# Regras de Negócio — Auth

- Senhas devem ter no mínimo 8 caracteres, com ao menos 1 letra e 1 número
- Senhas são armazenadas com hash bcrypt (custo mínimo: 12)
- JWT de acesso expira em 8 horas
- Refresh token expira em 30 dias
- Após 5 tentativas de login falhas consecutivas, a conta é bloqueada por 15 minutos
- O refresh token é single-use: ao ser usado, um novo é emitido e o anterior invalidado
- Logout invalida o refresh token no servidor (blacklist ou deleção)
- Não existe "recuperação de senha" nesta versão (fora de escopo v1)
