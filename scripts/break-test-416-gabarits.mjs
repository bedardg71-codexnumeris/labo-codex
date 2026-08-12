// Boucle de cassure pour sentinelle-gabarits-416 (#416 lot H).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
//
// ⚠ Ce banc porte sur la seule partie du chantier qui touche une donnée que
// Grégoire a SAISIE : la migration du réglage de #431. Les quatre premières
// cassures sont celles qui lui feraient perdre quelque chose.
//
// Usage : node scripts/break-test-416-gabarits.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const EXPORT = path.join(racine, 'js', 'planification-export.js');

const cassures = [
    // --- Ce qui ferait perdre son réglage ---
    ['l’ancien réglage est effacé AVANT que le gabarit soit écrit',
        "    ecrirePreference(CLE_GABARITS, suite.map(serialiserGabarit));\n    ecrirePreference(CLE_PERSONNALISE_HERITE, null);   // l'ancien ne cohabite pas",
        "    ecrirePreference(CLE_PERSONNALISE_HERITE, null);\n    ecrirePreference(CLE_GABARITS, suite.map(serialiserGabarit));"],
    ['la migration n’efface plus l’ancien (les deux cohabitent)',
        "    ecrirePreference(CLE_PERSONNALISE_HERITE, null);   // l'ancien ne cohabite pas",
        ''],
    ['la migration produit un doublon à chaque lecture',
        "    var deja = gabaritsExistants.some(function(g) { return g.id === migre.id; });\n    var suite = deja ? gabaritsExistants : gabaritsExistants.concat([migre]);",
        '    var suite = gabaritsExistants.concat([migre]);'],
    ['la migration réinvente la traduction au lieu de reprendre celle de #431',
        '    var colonnes = colonnesPersonnalisees(incDepuisConfig(cfg), cfg.ordre);',
        "    var colonnes = COLONNES_USINE.deroulement.slice();"],

    // --- Ce que le magasin doit refuser ---
    ['un gabarit sans colonne connue est rendu vide au lieu d’être écarté',
        '    if (colonnes.length === 0) return null;',
        ''],
    ['une colonne inconnue entre dans le gabarit',
        '    var colonnes = (Array.isArray(brut.colonnes) ? brut.colonnes : []).filter(function(c) {\n        return !!CATALOGUE_COLONNES[c];\n    });',
        '    var colonnes = Array.isArray(brut.colonnes) ? brut.colonnes : [];'],
    ['un renommage survit à la colonne qu’il nommait',
        '            if (colonnes.indexOf(k) !== -1 && typeof brut.renommages[k] === \'string\') {',
        '            if (typeof brut.renommages[k] === \'string\') {'],
    ['un gabarit sans identifiant entre quand même',
        "    var id = typeof brut.id === 'string' && brut.id ? brut.id : null;\n    if (!id) return null;",
        "    var id = typeof brut.id === 'string' && brut.id ? brut.id : 'sans-id';"],
    ['deux duplications reçoivent le même identifiant',
        "    var n = 1;\n    var pris = {};\n    existants.forEach(function(g) { pris[g.id] = true; });\n    while (pris['gab-' + n]) n++;\n    return 'gab-' + n;",
        "    return 'gab-1';"],

    // --- Ce qui protège les gabarits d'usine ---
    ['un gabarit d’usine peut être écrasé',
        '    if (gaba' + 'ritsDUsine().some(function(g) { return g.id === propre.id; })) return null;',
        '    if (false) return null;'],
    ['les gabarits d’usine se déclarent modifiables',
        "        { id: 'calendrier', nom: 'Calendrier', dUsine: true,",
        "        { id: 'calendrier', nom: 'Calendrier', dUsine: false,"],

    // --- Ce que le gabarit produit ---
    ['un gabarit accepte le format Texte et rend un document dégradé',
        "    if (formatId !== 'tsv' && formatId !== 'markdown') return null;",
        "    if (formatId === 'jamais') return null;"],
    ['le Plan de cours perd sa règle « évaluations seulement » via le magasin',
        "        evaluationsSeulement: gabarit.id === 'sommaire'",
        '        evaluationsSeulement: false'],
    ['un identifiant inconnu rend un document par défaut',
        '    var gabarit = trouverGabarit(idGabarit);\n    if (!gabarit) return null;',
        '    var gabarit = trouverGabarit(idGabarit) || gabaritsDUsine()[0];'],
];

// ⚠ UNE CASSURE RETIRÉE DU BANC, ET POURQUOI. « La duplication partage les
// colonnes de l'original » restait VERTE — et c'est exact : ni les gabarits
// d'usine ni ceux de l'utilisateur ne sont jamais rendus deux fois depuis le
// même objet. `gabaritsDUsine()` les reconstruit à chaque appel, et
// `lireGabaritsUtilisateur` les re-normalise depuis le stockage. Le `.slice()`
// de la duplication est une troisième ceinture, utile le jour où l'une des
// deux autres tombera, mais inobservable tant qu'elles tiennent.

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
        execSync('npx vitest run unit/sentinelle-gabarits-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(EXPORT, original);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
