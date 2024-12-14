import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceFile = join(__dirname, "../node_modules/sql.js/dist/sql-wasm.wasm");
const targetDir = join(__dirname, "../public/sql.js");
const targetFile = join(targetDir, "sql-wasm.wasm");

try {
  // Create directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Copy file
  copyFileSync(sourceFile, targetFile);
  console.log("Successfully copied sql-wasm.wasm to public directory");
} catch (error) {
  console.error("Error copying sql-wasm.wasm:", error);
  process.exit(1);
}
