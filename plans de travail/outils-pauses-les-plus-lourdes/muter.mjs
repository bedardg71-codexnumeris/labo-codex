// usage : node muter.mjs <spec> → applique la mutation (remplacement unique), imprime le fichier muté
import { readFileSync, writeFileSync } from 'node:fs';
const M = JSON.parse(readFileSync(new URL('./mutations.json', import.meta.url), 'utf8'));
const m = M.find((x) => x.spec === process.argv[2]);
const p = '/Users/kuekatsheu/Documents/GitHub/labo-codex/.claude/worktrees/pauses-les-plus-lourdes/' + m.fichier;
const s = readFileSync(p, 'utf8');
if (s.split(m.ancien).length !== 2) throw new Error('ancien non unique : ' + m.spec);
if (!process.env.SEC) writeFileSync(p, s.replace(m.ancien, () => m.nouveau));
console.log(m.fichier);
