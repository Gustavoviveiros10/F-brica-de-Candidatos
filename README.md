# Fábrica de Candidatos

Marketplace B2B de candidatos operacionais e industriais. A empresa busca grátis e paga 1 crédito para liberar o contato.

## Stack
- Next.js 16 (App Router) na Vercel
- Supabase (Postgres + PostGIS, Auth, RLS). Toda regra de crédito e liberação mora em funções do banco (`buscar_candidatos`, `liberar_contato`, `cadastrar_empresa`...). O navegador nunca recebe contato sem débito de crédito.

## Rodar local
```bash
cp .env.example .env.local   # preencha com a URL e a publishable key do Supabase
npm install
npm run dev
```

## Estrutura
- `app/page.tsx`: home (HTML do protótipo em `content/home.html`, contagem por categoria vinda do banco)
- `app/entrar`, `app/cadastro`, `app/recuperar`, `app/nova-senha`, `app/completar-cadastro`: autenticação
- `app/app/*`: painel da empresa (visão geral, busca, contatos liberados, plano e créditos)
- `proxy.ts`: renova a sessão e protege `/app`

Editou `content/home.html` ou `content/sprite.svg`? Rode `npm run conteudo` para regenerar `lib/content/*`.

## Regras
- Repositório público: nada de chave secreta (service role) nem dado de candidato aqui. Exemplos sempre com dado fictício.
