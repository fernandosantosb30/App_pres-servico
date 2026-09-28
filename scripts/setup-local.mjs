import { copyFile, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
const root = new URL('../', import.meta.url);
await mkdir(new URL('.openai/', root), { recursive: true });
for (const [source, destination] of [
  ['.env.example', '.env'],
  ['.openai/hosting.example.json', '.openai/hosting.json'],
]) {
  try {
    await copyFile(new URL(source, root), new URL(destination, root), constants.COPYFILE_EXCL);
    console.log(`Criado: ${destination}`);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.log(`Preservado: ${destination}`);
  }
}
