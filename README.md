# FocusFlow

Bem-vindo ao FocusFlow — seu centro pessoal para organizar a busca por emprego, rotinas diárias e finanças em um único lugar. O projeto prioriza privacidade: todos os dados ficam no navegador (localStorage) por padrão.

## Visão geral

O FocusFlow ajuda quem está procurando emprego a manter foco e organização com ferramentas que cobrem o ciclo completo:

- Painel (Dashboard): visão rápida das tarefas do dia, aplicações ativas, finanças e metas.
- Rastreador de Vagas (Job Tracker): gerencie o fluxo de candidaturas (Wishlist → Applied → Interviewing → Offer).
- Rotinas diárias: listas de tarefas que podem ser completadas e registradas diariamente.
- Metas (Goals): acompanhe objetivos de curto, médio e longo prazo.
- Finanças: registre rendas, despesas e pagamentos; histórico mensal com registro (logs) e sugestões de IA.
- Controle de tempo: registre sessões (ex.: jogos, redes sociais) e visualize desperdício de tempo.
- Roadmap: árvore visual para organizar seu aprendizado e passos seguintes.
- Gráficos e análises: tendências de progresso, gastos e conclusão de rotinas.

Observações técnicas: autenticação opcional via Auth0; algumas funcionalidades de sugestão usam Genkit (Google Gemini) se configurado. Nada é enviado ao servidor sem sua configuração explícita.

## Tecnologias

- Next.js (app router)
- React 19 + TypeScript
- Tailwind CSS
- ShadCN UI (componentes)
- Recharts (visualizações)
- react-d3-tree (roadmap)
- Auth0 (opcional) e Genkit/Gemini para sugestões de IA

## Estrutura do projeto (resumo)

```
src/
  app/(features)/       # Páginas principais: dashboard, applications, finances, goals, etc.
  components/           # UI compartilhada (buttons, dialogs, cards)
  lib/                  # Tipos, utilitários, dados de placeholder
  hooks/                # Hooks: useLocalStorage, useDataLogger, useToast
  ai/                   # Flows e integrações Genkit
```

## Instalação e desenvolvimento

Requisitos recomendados: Node.js 18+ e npm/yarn.

No PowerShell (na raiz do projeto):

```powershell
npm install
npm run dev
```

O servidor de desenvolvimento padrão roda em `http://localhost:9002`.

Scripts úteis (definidos em `package.json`):

- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — build para produção
- `npm run start` — inicia a versão de produção (após build)
- `npm run typecheck` — roda verificação TypeScript
- `npm run lint` — lint do código
- `npm run genkit:dev` — roda a interface de desenvolvimento do Genkit (se disponível)

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com as chaves necessárias (se for usar Auth0/Genkit):

```text
GEMINI_API_KEY=your_key_here
AUTH0_SECRET=random_string
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_BASE_URL=http://localhost:9002
```

Observação: o app funciona sem essas variáveis para a maior parte das funcionalidades que são locais ao navegador.

## Como contribuir

1. Fork ou clone este repositório
2. Crie uma branch feature/bugfix
3. Faça alterações e adicione testes/validações simples quando possível
4. Abra um pull request com descrição das mudanças

Guidelines rápidas:

- Use `crypto.randomUUID()` para gerar IDs locais
- Prefira alterações pequenas e PRs com um objetivo claro

## Problemas comuns / Troubleshooting

- Porta 9002 ocupada: altere o script `dev` em `package.json` para `next dev -p <porta>`.
- Erros com Auth0: verifique as variáveis em `.env.local` e as configurações do client no painel Auth0.
- Sugestões de IA não aparecem: confirme `GEMINI_API_KEY` e a disponibilidade do serviço.

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes (se presente).

## Contato / notas finais

Se for usar em produção com integração de IA ou autenticação externa, revise as políticas de privacidade e onde os dados são enviados. Para dúvidas, abra uma issue no repositório.

Também há uma versão em inglês do README em `README-en.md`.
