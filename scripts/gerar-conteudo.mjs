// Converte content/home.html e content/sprite.svg em módulos TS (assim entram no bundle da Vercel).
import { readFileSync, writeFileSync } from "node:fs";

const pares = [
  ["content/home.html", "lib/content/home.ts", "HOME_HTML"],
  ["content/sprite.svg", "lib/content/sprite.ts", "SPRITE_SVG"],
];
for (const [origem, destino, nome] of pares) {
  const texto = readFileSync(origem, "utf8");
  writeFileSync(
    destino,
    `// Gerado a partir de ${origem} (protótipo). Edite o arquivo de origem e rode \`npm run conteudo\`.\nexport const ${nome} = ${JSON.stringify(texto)};\n`,
  );
  console.log(`${origem} → ${destino}`);
}
