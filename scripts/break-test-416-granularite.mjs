// Boucle de cassure pour sentinelle-granularite-416 (#416 lot G, 3e axe).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
// Usage : node scripts/break-test-416-granularite.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const EXPORT = path.join(racine, 'js', 'planification-export.js');

const cassures = [
    ['la granularité séance éclate quand même la leçon en lignes',
        "        if (gabarit.granularite === 'seances') {\n            pousser({ seqTitre: seqTitre, lecon: lecon, estLecon: true, agregeSaLecon: true });\n            return;\n        }",
        ''],
    ['l’agrégation déborde sur la granularité nœuds',
        '    if (!c.agregeSaLecon || !c.lecon) return [];',
        '    if (!c.lecon) return [];'],
    ['le contenu agrège TOUT au lieu des seules activités',
        "        return joindreTitres(elementsAgreges(c, 'activite'));",
        '        return joindreTitres(c.agregeSaLecon && c.lecon ? c.lecon.elements : []);'],
    ['les évaluations agrégées perdent le nom de leur production',
        '        return el.production ? el.production.nomProduction : el.titre;',
        '        return el.titre;'],
    ['le séparateur des cellules agrégées change',
        "var SEPARATEUR_AGREGE = ' · ';",
        "var SEPARATEUR_AGREGE = ', ';"],
    ['le rang sort en CHIFFRE au lieu de la lettre',
        '        return String.fromCharCode(64 + c.lecon.rangSeance);',
        '        return String(c.lecon.rangSeance);'],
    ['une leçon sans rang affiche « @ » au lieu de rien',
        '        if (!c.lecon || !c.lecon.rangSeance) return \'\';',
        '        if (!c.lecon) return \'\';'],
    ['la séquence sans contenu s’invite dans le calendrier',
        '            if (parSeance) return;',
        '            if (false) return;'],
    ['les éléments hors leçon s’invitent dans le calendrier',
        '        if (!gabarit.evaluationsSeulement && !parSeance) {',
        '        if (!gabarit.evaluationsSeulement) {'],
    ['une colonne inconnue produit une colonne vide au lieu d’être écartée',
        '    var colonnes = Array.isArray(g.colonnes) ? g.colonnes.filter(function(id) {\n        return !!CATALOGUE_COLONNES[id];\n    }) : [];',
        '    var colonnes = Array.isArray(g.colonnes) ? g.colonnes : [];'],
    ['un gabarit vide ne montre plus rien au lieu de tout montrer',
        '        colonnes: colonnes.length > 0 ? colonnes : COLONNES_USINE.alignement,',
        '        colonnes: colonnes,'],
    ['le renommage est ignoré (l’en-tête garde le libellé d’usine)',
        '    if (renommages && renommages[id]) return renommages[id];',
        '    if (false) return renommages[id];'],
    ['la granularité inconnue bascule en mode séance au lieu de nœuds',
        "        granularite: g.granularite === 'seances' ? 'seances' : 'noeuds',",
        "        granularite: g.granularite === 'noeuds' ? 'noeuds' : 'seances',"],
    ['la date ne suit plus le groupe demandé',
        '    var groupeCoursId = opts.groupeCoursId || null;',
        '    var groupeCoursId = null;'],
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
        execSync('npx vitest run unit/sentinelle-granularite-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(EXPORT, original);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
