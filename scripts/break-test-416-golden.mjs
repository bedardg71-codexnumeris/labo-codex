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
        "ponderation: { libelle: 'Pondération (%)'",
        "ponderation: { libelle: 'Poids (%)'"],
    ['une colonne change de place (Semaine avant Leçon)',
        "sommaire:    ['sequence', 'lecon', 'semaine', 'evaluation'",
        "sommaire:    ['sequence', 'semaine', 'lecon', 'evaluation'"],
    ['une espace de plus dans le séparateur des objectifs',
        "? c.lecon.objectifs.join(' ; ')",
        "? c.lecon.objectifs.join(' ;  ')"],
    ['une durée nulle sort « 0 » au lieu de vide',
        "        return c.estLecon ? (c.lecon.dureeRollup || '') : (c.el ? (c.el.duree || '') : '');",
        "        return c.estLecon ? (c.lecon.dureeRollup || 0) : (c.el ? (c.el.duree || 0) : 0);"],

    // --- Invariants introduits par le catalogue (#416 lot G) ---
    ['une ligne d’ÉLÉMENT répète les objectifs de sa leçon',
        "        if (!c.estLecon) return '';\n        return c.lecon.objectifs.length > 0",
        "        return c.lecon.objectifs.length > 0"],
    ['la séquence vide ne rend plus son étendue dans la colonne Semaine',
        "        if (c.etendue !== undefined) return etendueTexteTSV(c.etendue);",
        "        if (false) return etendueTexteTSV(c.etendue);"],
    ['le plan de cours cesse de n’émettre que les évaluations',
        "        evaluationsSeulement: niveauId === 'sommaire',",
        "        evaluationsSeulement: false,"],
];

// ⚠ UNE CASSURE RETIRÉE DU BANC, ET POURQUOI. « Retirer `!c.estLecon` de
// `prodDe` » restait VERTE — et c'est exact : le rendeur ne pose jamais `el`
// sur une ligne de leçon, donc `c.el && …` suffit déjà. Le `!c.estLecon` dit
// l'intention sur place (une ligne de leçon ne s'attribue rien de ses
// éléments) mais ne décide de rien tant que le rendeur tient sa promesse. Le
// garder au banc aurait exigé un contexte que le code ne construit jamais —
// c'est-à-dire un test qui n'observe rien.
//
// ⚠ UNE CASSURE DÉPLACÉE, ET POURQUOI. « Le préfixe du gabarit personnalisé
// perd une colonne » visait `colonnesPersonnalisees`. Au lot H, le niveau
// « Personnalisé » a disparu et ses références avec lui : casser cette
// fonction ne change plus AUCUNE sortie d'usine, donc le golden ne pouvait
// plus la voir. Elle n'est pas morte pour autant — elle traduit l'ancien
// réglage de Grégoire en colonnes pendant la MIGRATION. La cassure vit
// désormais dans `break-test-416-gabarits.mjs`, où elle a un objet.

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
