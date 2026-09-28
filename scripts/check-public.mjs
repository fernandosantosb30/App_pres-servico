// Heuristic publication check. Never print matching values or file contents.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, lstatSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const project = fileURLToPath(new URL('../', import.meta.url));
let temporary;
function git(args, options = {}) {
  const result = spawnSync('git', args, { cwd: project, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  return result;
}
try {
  const existing = git(['rev-parse', '--show-toplevel']);
  const root = existing.status === 0 ? existing.stdout.trim() : project;
  let prefix = [];
  if (existing.status !== 0) {
    temporary = mkdtempSync(join(tmpdir(), 'conecta-public-'));
    const initialized = git(['init', '--bare', '--quiet', temporary]);
    if (initialized.status !== 0) throw Error('Não foi possível preparar a verificação.');
    prefix = [`--git-dir=${temporary}`, `--work-tree=${root}`];
  }
  const listing = git([...prefix, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root });
  if (listing.status !== 0) throw Error('Não foi possível listar os arquivos públicos.');
  const files = [...new Set(listing.stdout.split('\0').filter(Boolean))];
  const patterns = [
    ['chave privada', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
    ['token de provedor', /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|art_v2_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16})/],
    ['identificador de hospedagem', /appg(?:prj|repo)_[a-f0-9]{20,}/],
    ['caminho pessoal absoluto', /\/(?:home|Users)\/[A-Za-z0-9._-]+\//],
    ['URL com credencial', /https?:\/\/[^\s/<>"']+:[^\s/<>"']+@/],
  ];
  let findings = 0;
  for (const file of files) {
    const name = file.replaceAll('\\', '/');
    const forbidden = /(^|\/)(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|\.wrangler|\.sites-runtime|\.codex|\.agents|node_modules|dist|uploads|private|backups|exports)(?:\/|$)/.test(name)
      || /(^|\/)\.openai\/hosting\.json$/.test(name)
      || /\.(?:pem|key|p12|pfx|db|sqlite|sqlite3|log|dump|bak|zip)$/.test(name);
    if (forbidden && !name.endsWith('/.env.example') && name !== '.env.example') {
      console.error(`${file}: arquivo privado ou gerado incluído na seleção Git`);
      findings++;
      continue;
    }
    const absolute = resolve(root, file);
    let stat;
    try { stat = lstatSync(absolute); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (stat.isSymbolicLink()) { console.error(`${file}: revise o destino do link simbólico`); findings++; continue; }
    if (!stat.isFile()) continue;
    const buffer = readFileSync(absolute);
    if (buffer.includes(0)) continue;
    const content = buffer.toString('utf8');
    for (const [label, pattern] of patterns) {
      if (pattern.test(content)) { console.error(`${file}: possível ${label}`); findings++; }
    }
  }
  console.log(`${files.length} arquivos candidatos; ${findings} alerta(s). Valores sensíveis não são exibidos.`);
  console.log('Escopo: arquivos atuais selecionados pelo Git, sem varredura de histórico ou garantia de ausência de segredos.');
  process.exitCode = findings ? 1 : 0;
} finally {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
