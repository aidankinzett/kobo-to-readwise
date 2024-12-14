import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Resolve paths
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const tauriConfPath = resolve(__dirname, '../src-tauri/tauri.conf.json');
const packageJsonPath = resolve(__dirname, '../package.json');

(async () => {
  try {
    // Read package.json to get the version
    const pkg = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    // Read the Tauri configuration file
    const tauriConfig = JSON.parse(await readFile(tauriConfPath, 'utf-8'));

    // Update the top-level version field
    tauriConfig.version = pkg.version;

    // Write the updated configuration back to the file
    await writeFile(tauriConfPath, JSON.stringify(tauriConfig, null, 2) + '\n', 'utf-8');

    console.log(`Updated src-tauri/tauri.conf.json to version ${pkg.version}`);
  } catch (err) {
    console.error('Error updating Tauri config version:', err);
    process.exit(1);
  }
})();
