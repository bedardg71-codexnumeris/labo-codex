// Boucle de cassure pour sentinelle-rang-seance-416 (#416 lot A).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
// Usage : node scripts/break-test-416-rang-seance.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const CARTE = path.join(racine, 'js', 'planification-carte.js');
const CSS = path.join(racine, 'styles.css');

const cassures = [
    ['stocke la LETTRE au lieu du rang', CARTE,
        '        n.metadata.rangSeance = r;',
        '        n.metadata.rangSeance = lettreRangSeance(r);'],
    ['pose null au lieu de retirer la clé', CARTE,
        "        delete n.metadata.rangSeance;",
        "        n.metadata.rangSeance = null;"],
    ['ne borne plus le rang à l’écriture', CARTE,
        '    if (isNaN(r) || r < 1 || r > RANG_SEANCE_MAX) {\n        if (!(\'rangSeance\' in n.metadata)) return false;',
        '    if (isNaN(r) || r < 1) {\n        if (!(\'rangSeance\' in n.metadata)) return false;'],
    ['accepte une séquence', CARTE,
        "function definirRangSeance(leconId, rang) {\n    var n = etat.noeuds.get(leconId);\n    if (!n || n.type !== 'lecon') return false;",
        "function definirRangSeance(leconId, rang) {\n    var n = etat.noeuds.get(leconId);\n    if (!n) return false;"],
    ['rend un sélecteur pour une séquence', CARTE,
        "function selecteurRangSeanceHTML(n) {\n    if (!n || n.type !== 'lecon') return '';",
        "function selecteurRangSeanceHTML(n) {\n    if (!n) return '';"],
    ['ne coerce plus la valeur persistée', CARTE,
        '    var r = parseInt(n.metadata.rangSeance, 10);\n    return (isNaN(r) || r < 1 || r > RANG_SEANCE_MAX) ? null : r;',
        '    return n.metadata.rangSeance === undefined ? null : n.metadata.rangSeance;'],
    ['retire le sélecteur de l’en-tête', CARTE,
        'selecteurSemaineHTML(n) + selecteurRangSeanceHTML(n) + badgeObjectifHTML(n)',
        'selecteurSemaineHTML(n) + badgeObjectifHTML(n)'],
    ['peuple deux fois (garde d’idempotence retirée)', CARTE,
        "    if (!select || select.dataset.peuple === '1') return;\n    var courant = select.value;\n\n    // Construit en DOM, comme la semaine",
        "    if (!select) return;\n    var courant = select.value;\n\n    // Construit en DOM, comme la semaine"],
    ['écrase la valeur courante en peuplant', CARTE,
        "    select.value = courant;\n    select.dataset.peuple = '1';\n}\n\n// #150",
        "    select.dataset.peuple = '1';\n}\n\n// #150"],
    ['rend true même quand rien ne change', CARTE,
        '        if (n.metadata.rangSeance === r) return false;',
        '        if (false) return false;'],
    ['efface la semaine en posant le rang', CARTE,
        "    propagerModification(leconId, 'metadata', JSON.parse(JSON.stringify(n.metadata)));\n    sauvegarder();\n    return true;\n}\n\n// === SÉLECTEUR DE SEMAINE DANS LE BLOC",
        "    delete n.metadata.semaine;\n    propagerModification(leconId, 'metadata', JSON.parse(JSON.stringify(n.metadata)));\n    sauvegarder();\n    return true;\n}\n\n// === SÉLECTEUR DE SEMAINE DANS LE BLOC"],
    ['fait pousser le rang lui aussi (piège #412)', CSS,
        '.planif-noeud-seance {\n    margin-left: 4px;',
        '.planif-noeud-seance {\n    margin-left: auto;'],
    ['retire la cible tactile iPad', CSS,
        '@media (hover: none) {\n    .planif-noeud-seance {\n        opacity: 1;\n        min-height: 28px;\n        min-width: 44px;\n        padding: 2px 4px;\n    }\n}',
        ''],
];

const original = { [CARTE]: readFileSync(CARTE, 'utf8'), [CSS]: readFileSync(CSS, 'utf8') };
let rouges = 0, verts = [];

for (const [nom, fichier, avant, apres] of cassures) {
    const src = original[fichier];
    const n = src.split(avant).length - 1;
    if (n !== 1) {
        console.log(`⛔ ANCRE ${n === 0 ? 'ABSENTE' : 'AMBIGUË (' + n + ')'} — ${nom}`);
        verts.push(nom + ' (ancre)');
        continue;
    }
    writeFileSync(fichier, src.replace(avant, apres));
    let rouge = false;
    try {
        execSync('npx vitest run unit/sentinelle-rang-seance-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(fichier, src);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
