// Boucle de cassure pour sentinelle-calendrier-416 (#416 lot I).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
// Usage : node scripts/break-test-416-calendrier.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const EXPORT = path.join(racine, 'js', 'planification-export.js');

const cassures = [
    ['le Contenu annonce la production au lieu de l’activité',
        '    return elements.map(function(el) { return el.titre; }).join(SEPARATEUR_AGREGE);',
        '    return elements.map(function(el) { return el.production ? el.production.nomProduction : el.titre; }).join(SEPARATEUR_AGREGE);'],
    ['les Évaluations perdent le nom de la production',
        "    evaluations: { libelle: 'Évaluations',     valeur: function(c) {\n        return joindreEvaluations(elementsAgreges(c, 'evaluation'));",
        "    evaluations: { libelle: 'Évaluations',     valeur: function(c) {\n        return joindreTitres(elementsAgreges(c, 'evaluation'));"],
    ['une colonne du calendrier disparaît',
        "    colonnes: ['semaine', 'rangSeance', 'date', 'contenu', 'evaluations', 'travailPersonnel'],",
        "    colonnes: ['semaine', 'rangSeance', 'date', 'contenu', 'evaluations'],"],
    ['le calendrier repasse en granularité nœuds',
        "    colonnes: ['semaine', 'rangSeance', 'date', 'contenu', 'evaluations', 'travailPersonnel'],\n    granularite: 'seances',",
        "    colonnes: ['semaine', 'rangSeance', 'date', 'contenu', 'evaluations', 'travailPersonnel'],\n    granularite: 'noeuds',"],
    ['le format Texte est accepté et rend un document dégradé',
        '        if (GABARIT_CALENDRIER.formats.indexOf(formatId) === -1) return null;',
        '        if (false) return null;'],
    ['le titre de section n’est plus la PREMIÈRE colonne',
        "        var titre = String(cellules[0] == null ? '' : cellules[0]).trim();",
        "        var titre = String(cellules[1] == null ? '' : cellules[1]).trim();"],
    ['les cellules vides ne sont plus omises dans le document',
        "            if (!v) continue;",
        "            if (false) continue;"],
    ['une section sans aucun champ sort muette au lieu de le dire',
        "        if (champs.length === 0) champs.push('- *(rien de prévu)*');",
        ''],
    ['les champs perdent le libellé de leur colonne',
        "            champs.push('- **' + matrice.entetes[i] + '** : ' + v);",
        "            champs.push('- ' + v);"],
    ['les lignes entièrement vides reviennent',
        '    var nonVides = lignes.filter(function(l) {\n        return l.some(function(cellule) { return String(cellule) !== \'\'; });\n    });',
        '    var nonVides = lignes;'],
    ['le retrait des vides déborde et mange les lignes partiellement remplies',
        "        return l.some(function(cellule) { return String(cellule) !== ''; });",
        "        return l.every(function(cellule) { return String(cellule) !== ''; });"],
    ['le travail personnel se met à recopier tout le contenu',
        '        return c.lecon.elements.filter(estHorsClasse).map(function(el) {',
        '        return c.lecon.elements.map(function(el) {'],
    ['le calendrier ignore le groupe demandé',
        '        plan = construirePlan(options);\n        if (!plan) return null;\n        var matrice = construireMatrice(plan, normaliserGabarit(GABARIT_CALENDRIER));',
        '        plan = construirePlan();\n        if (!plan) return null;\n        var matrice = construireMatrice(plan, normaliserGabarit(GABARIT_CALENDRIER));'],
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
        execSync('npx vitest run unit/sentinelle-calendrier-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(EXPORT, original);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
