import fs from "fs";
import path from "path";

const srcDir = path.resolve("./node_modules/zxing-wasm/dist/reader");
const destDir = path.resolve("./public/wasm");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach((file) => {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
});

console.log("ZXing WASM files copied to public/wasm/");
