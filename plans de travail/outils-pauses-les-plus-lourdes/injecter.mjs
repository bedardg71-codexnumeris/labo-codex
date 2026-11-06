// usage : node injecter.mjs <spec> <rang> → écrit la spec mutée en place, imprime la ligne du test à jouer
import { readFileSync, writeFileSync } from 'node:fs';
import { CAUSES } from './causes.mjs';
const [, , spec, rangTxt] = process.argv; const rang = Number(rangTxt);
const chemin = '/Users/kuekatsheu/Documents/GitHub/labo-codex/.claude/worktrees/pauses-les-plus-lourdes/tests/integration/' + spec;
const lignes = readFileSync(chemin, 'utf8').split('\n');
const marques = lignes.map((l, i) => (l.includes('pause-gardee :') ? i : -1)).filter((i) => i >= 0);
const i = marques[rang]; const [cause, delaiDonne, cible] = CAUSES[spec][rang];
// la fenêtre : le nombre dans la pause qui suit la marque
const fen = Number((lignes[i + 1].match(/(\d+)\)/) || [])[1]);
const delai = delaiDonne ?? Math.round(Math.max(200, fen * 0.55));
if (!(delai < fen)) throw new Error(`délai ${delai} ≥ fenêtre ${fen} : ${spec}#${rang}`);
const indent = lignes[i].match(/^\s*/)[0];
lignes.splice(i, 0, `${indent}await page.evaluate(() => { (window.__reactionsDuBanc?.poser || setTimeout)(() => { ${cause} }, ${delai}); });`);
if (!process.env.SEC) writeFileSync(chemin, lignes.join('\n'));
let ligne;
if (typeof cible === 'number') ligne = cible;
else if (typeof cible === 'string') ligne = lignes.findIndex((l) => l.includes(cible)) + 1;
else { let k = i; while (k >= 0 && !/^\s*test\(/.test(lignes[k])) k--; ligne = k + 1; }
console.log(`${ligne}\t${fen}\t${delai}`);
