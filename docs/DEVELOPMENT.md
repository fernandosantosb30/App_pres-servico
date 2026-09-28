# Desenvolvimento

## Preparar o projeto

Execute os comandos na pasta que contém `package.json`. Se clonou o repositório com uma pasta externa, entre primeiro em `conecta-santa-maria`.

Requisitos: Node.js 22.13+, npm e Git.

```bash
npm run install:ci
npm run setup:local
npm run build
```

O setup copia `.env.example` para `.env` e `.openai/hosting.example.json` para `.openai/hosting.json` somente se os destinos não existirem. O exemplo de hospedagem tem nomes lógicos dos recursos, sem vínculo com conta ou projeto remoto.

## Banco local

Para um banco novo, aplique a migração existente uma única vez:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_shocking_norman_osborn.sql
npm run dev
```

Abra o endereço informado pelo servidor. Não use `--remote` para preparar ou testar o banco local. `npm run db:generate` é necessário quando o esquema muda, não para instalar um clone novo. Preserve as migrações já aplicadas e gere novas migrações para mudanças posteriores.

D1 guarda perfis, pedidos, mensagens, avaliações, configurações, interesses, denúncias e metadados de arquivos. R2 guarda as fotos. Não versione o estado de `.wrangler` nem cópias dos dados.

## Autenticação e administração

O servidor de desenvolvimento oferece uma identidade fictícia do starter. No ambiente hospedado, a aplicação depende do Sites para autenticar o usuário e encaminhar sua identidade. Não exponha o servidor de desenvolvimento ou o Worker diretamente à internet aceitando cabeçalhos de identidade enviados por clientes.

`ADMIN_USER_IDS` é uma configuração privada do servidor. Vazio significa nenhum administrador. Os identificadores permitidos são separados por vírgula e podem ser consultados na página Minha conta pelo responsável. Não coloque IDs reais no exemplo público, README ou código. Configure o valor no ambiente de hospedagem; o carregamento de variáveis do ambiente local depende do runtime usado.

## Verificações

```bash
npm run typecheck
npm test
npm run check:public
npm run build
```

Os testes de integração usam exclusivamente o servidor local na porta 8787. Em um terminal:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local --persist-to .wrangler/state --ip 127.0.0.1 --port 8787 --inspector-port 0
```

Em outro:

```bash
npm run test:integration
```

Esses testes criam registros fictícios no banco local com prefixo `integration_` e imprimem esse prefixo para limpeza. Não envie esses dados a ambientes compartilhados. Não representam clientes, profissionais ou avaliações reais.

## Hospedagem

O GitHub armazena e apresenta o código; GitHub Pages não executa o backend desta aplicação. A implementação atual requer um ambiente compatível com Workers, D1, R2 e a integração confiável de identidade do Sites. Uma migração de hospedagem exige adaptar essa integração.

A configuração específica da conta deve ficar em `.openai/hosting.json`, ignorado pelo Git. Registre/configure o projeto no ambiente de destino e mantenha credenciais nas configurações privadas do provedor. Não reutilize identificadores de contas de terceiros.

## Limitações funcionais

Pagamento e reembolso são simulações internas, sem gateway externo. Fotos enviadas são públicas, não documentos de identidade. Chat exige atualização manual. Avisos de interesse, denúncias, disputas e exclusões dependem de acompanhamento humano. O service worker fornece uma página de indisponibilidade offline e não armazena pedidos ou mensagens para uso sem conexão.
