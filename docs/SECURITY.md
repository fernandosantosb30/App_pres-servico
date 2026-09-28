# Segurança do repositório

## O que pode ser publicado

- Código-fonte, testes com dados fictícios e recursos visuais públicos.
- `package.json` e o lockfile, necessários à instalação reproduzível.
- Migrações SQL de **esquema** e seus metadados, sem exportações de registros reais.
- `.env.example` com valores vazios e `.openai/hosting.example.json` sem identificadores de conta.

## O que permanece privado

As regras de `.gitignore` excluem variáveis de ambiente, chaves e certificados, configuração de hospedagem da conta, dependências, builds, logs, banco local, uploads, backups, exportações e arquivos de ferramentas locais.

Identificadores de projeto não são senhas, mas são informações específicas da infraestrutura e não precisam estar no repositório público. O arquivo `.openai/hosting.json` continua disponível localmente para preservar o funcionamento do ambiente existente.

Use exclusivamente dados fictícios em testes, imagens de demonstração e exemplos. Capturas de tela também podem expor nomes, contatos, conversas ou identificadores; revise-as antes de enviar.

## Antes de enviar ao GitHub

Na raiz do projeto:

```bash
npm run check:public
```

O comando lista arquivos candidatos usando as regras do Git e procura alguns padrões de credenciais, identificadores de hospedagem e caminhos pessoais. Ele informa arquivo e tipo do alerta, sem imprimir o valor detectado. Sem repositório inicializado, usa um índice temporário e não cria histórico no projeto.

Após preparar o commit, revise também:

```bash
git status --short
git diff --cached --stat
git diff --cached
```

Verifique se `.env`, `.openai/hosting.json`, `.wrangler` e arquivos privados não aparecem. Não use `git add -f` para contornar essas exclusões. O scanner é heurístico: não cobre todo formato de segredo, conteúdo de imagens, arquivos binários ou histórico. A revisão manual do conteúdo preparado continua necessária.

## Arquivos já versionados ou publicados

Adicionar um arquivo ao `.gitignore` **não remove arquivos já rastreados nem versões antigas**. Se um arquivo privado estiver rastreado, remova-o apenas do índice com `git rm --cached -- caminho/do/arquivo`, preservando a cópia local, e revise o commit.

Se uma credencial real tiver sido enviada, revogue-a ou substitua-a no provedor. Apagar o arquivo em um commit posterior não invalida a credencial nem elimina cópias históricas. A limpeza de histórico exige revisão específica e coordenação com colaboradores.

## Limites de segurança da aplicação

- A identidade recebida pelo backend pressupõe uma camada autenticada e confiável do Sites. Cabeçalhos de identidade não podem ser aceitos diretamente de clientes externos.
- A autorização administrativa depende de uma lista privada no servidor; nenhum usuário deve conseguir conceder esse papel pela interface.
- Nenhum dado de cartão é solicitado ou armazenado. Pagamentos são simulações.
- Não publique documentos pessoais nos campos de fotos públicas.
- Moderação, tratamento de denúncias, retenção/exclusão e controles operacionais precisam ser finalizados antes do lançamento comercial.

Não publique credenciais ou dados pessoais em issues. Caso encontre um possível vazamento, informe apenas o arquivo e o tipo de problema até existir um canal privado acordado com o responsável.
