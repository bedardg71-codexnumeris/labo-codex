// Boucle de cassure pour sentinelle-repere-seance-416 (#416 lot E).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
//
// ⚠ LES QUATRE PREMIÈRES CASSURES PORTENT SUR LA RÈGLE DU 6 AOÛT, en
// réciproque : on ne lit JAMAIS le rang depuis le titre pour le poser
// d'office. Une interprétation produit des ancrages faux indiscernables de
// vrais — c'est ce qui a fait refuser la lecture de la semaine dans les
// titres, et ça vaut pour le rang.
//
// Usage : node scripts/break-test-416-repere-seance.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const CARTE = path.join(racine, 'js', 'planification-carte.js');

const cassures = [
    // --- La règle : trois conditions, aucune facultative ---
    ['le repère part dès que le TITRE porte un rang (le modèle ne compte plus)',
        '    var seanceRetirable = rangTitre !== null && rangAncre !== null && rangTitre === rangAncre;',
        '    var seanceRetirable = rangTitre !== null;'],
    ['le repère part dès qu’un rang est POSÉ, même s’il en contredit un autre',
        '    var seanceRetirable = rangTitre !== null && rangAncre !== null && rangTitre === rangAncre;',
        '    var seanceRetirable = rangTitre !== null && rangAncre !== null;'],
    ['deux rangs contradictoires ne bloquent plus rien',
        '&& rangTitre === rangAncre;',
        '&& rangTitre !== null;'],

    // --- Le nettoyage ---
    ['le repère de séance ne part plus du tout (report du 7 août réinstallé)',
        "    if (seanceRetirable) {\n        reste = reste.replace(RE_REPERE_SEANCE, '').replace(/^\\s*[-–—:.·]+\\s*/, '').trim();\n    }",
        ''],
    ['le repère part TOUJOURS, retirable ou non',
        '    if (seanceRetirable) {\n        reste = reste.replace(RE_REPERE_SEANCE',
        '    if (true) {\n        reste = reste.replace(RE_REPERE_SEANCE'],
    ['la ponctuation de liaison reste collée au titre nettoyé',
        "reste.replace(RE_REPERE_SEANCE, '').replace(/^\\s*[-–—:.·]+\\s*/, '').trim();",
        "reste.replace(RE_REPERE_SEANCE, '').trim();"],
    ['le numéro du repère n’est plus capturé',
        'var RE_REPERE_SEANCE = /s[ée]ance\\s*(\\d+)/i;',
        'var RE_REPERE_SEANCE = /s[ée]ance\\s*\\d+/i;'],

    // --- La catégorie « vide » ---
    ['un titre réduit à ses repères devient traitable et se vide',
        "    if (reste === '' || RE_REPERE_SEANCE.test(reste) && reste.replace(RE_REPERE_SEANCE, '').trim() === '') {",
        '    if (false) {'],

    // --- Ce que l'analyse expose ---
    ['l’analyse cesse de dire POURQUOI le repère reste',
        '        rangTitre: rangTitre,\n        rangAncre: rangAncre,\n        seanceRetirable: seanceRetirable',
        '        rangTitre: null,\n        rangAncre: null,\n        seanceRetirable: false'],
];

// ⚠ UNE CASSURE RETIRÉE DU BANC, ET POURQUOI. « Une séquence se voit lire un
// rang » restait VERTE — et c'est exact : `rangSeanceDeLecon` refuse déjà tout
// ce qui n'est pas une leçon. Le `n.type === 'lecon'` d'`analyserRepereTitre`
// dit l'intention sur place (une séquence n'a pas de rang dans une semaine,
// asymétrie du lot A) mais ne décide de rien tant que la porte de lecture
// tient. Le cas de sentinelle qui l'exerce, lui, reste : il documente
// l'asymétrie même s'il ne peut pas rougir seul.

const original = readFileSync(CARTE, 'utf8');
let rouges = 0, verts = [];

for (const [nom, avant, apres] of cassures) {
    const n = original.split(avant).length - 1;
    if (n !== 1) {
        console.log(`⛔ ANCRE ${n === 0 ? 'ABSENTE' : 'AMBIGUË (' + n + ')'} — ${nom}`);
        verts.push(nom + ' (ancre)');
        continue;
    }
    writeFileSync(CARTE, original.replace(avant, apres));
    let rouge = false;
    try {
        execSync('npx vitest run unit/sentinelle-repere-seance-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(CARTE, original);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
