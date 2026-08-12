// Boucle de cassure pour golden-exports-416 (#416 lot G).
//
// ⚠ CE BANC VÉRIFIE LE FILET LUI-MÊME, pas le code. Le golden master est ce
// qui autorise le refactor du lot G : s'il ne rougit pas quand une sortie
// change, tout le refactor se fait à l'aveugle en croyant être couvert.
// Les cassures ci-dessous sont des changements MINUSCULES — une espace, un
// libellé, un ordre — exactement ce qu'un refactor laisse passer par
// inadvertance et qu'un test par tokens ne voit pas.
//
// Usage : node scripts/break-test-416-golden.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const EXPORT = path.join(racine, 'js', 'planification-export.js');

const cassures = [
    ['un libellé de colonne change (Pondération → Poids)',
        "'Évaluation', 'Pondération (%)', 'Échéance'],",
        "'Évaluation', 'Poids (%)', 'Échéance'],"],
    ['une colonne change de place (Semaine avant Leçon)',
        "sommaire: ['Séquence', 'Leçon', 'Semaine', 'Évaluation'",
        "sommaire: ['Séquence', 'Semaine', 'Leçon', 'Évaluation'"],
    ['une espace de plus dans le séparateur des objectifs',
        "            ? lecon.objectifs.join(' ; ')\n            : (lecon.objectifDerive || '');\n        var cellules = base.concat([",
        "            ? lecon.objectifs.join(' ;  ')\n            : (lecon.objectifDerive || '');\n        var cellules = base.concat(["],
    ['le préfixe fixe du personnalisé perd une colonne',
        "    var colonnes = ['Séquence', 'Leçon', 'Semaine'];",
        "    var colonnes = ['Séquence', 'Leçon'];"],
    ['une durée nulle sort « 0 » au lieu de vide',
        '            lecon.dureeRollup || \'\',',
        '            lecon.dureeRollup || 0,'],
];

const original = readFileSync(EXPORT, 'utf8');
let rouges = 0, verts = [];

for (const [nom, avant, apres] of cassures) {
    const n = original.split(avant).length - 1;
    if (n !== 1) {
        console.log(`⛔ ANCRE ${n === 0 ? 'ABSENTE' : 'AMBIGUË (' + n + ')'} — ${nom}`);
        verts.push(nom + ' (ancre)');
        continue;
    }
    writeFileSync(EXPORT, original.replace(avant, apres));
    let rouge = false;
    try {
        execSync('npx vitest run unit/golden-exports-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(EXPORT, original);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
