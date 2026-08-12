// Boucle de cassure pour sentinelle-hors-classe-416 (#416 lot B).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
//
// ⚠ CE BANC PORTE SUR LE Σ DES LEÇONS. `dureeRollupNoeud` alimente l'en-tête
// de chaque bloc et la jauge du planificateur : une erreur s'y voit PARTOUT et
// ne ressemble pas à un bug d'export — le compteur affiche un total, il a l'air
// juste, et il est faux. Le plan l'annonçait comme le lot qui mérite le plus de
// break-tests ; les six premières cassures sont là pour ça.
//
// Usage : node scripts/break-test-416-hors-classe.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const CARTE = path.join(racine, 'js', 'planification-carte.js');
const EXPORT = path.join(racine, 'js', 'planification-export.js');

const cassures = [
    // --- Le Σ des leçons ---
    ['le temps hors classe rentre dans le Σ', CARTE,
        '    if (estHorsClasseNoeud(nd)) return 0;',
        ''],
    ['cocher la case ne retire plus la durée (D3)', CARTE,
        '        delete n.metadata.duree;',
        '        n.metadata.duree = n.metadata.duree;'],
    ['décocher REND la durée que personne n’a ressaisie', CARTE,
        '    } else {\n        delete n.metadata.horsClasse;\n    }',
        '    } else {\n        delete n.metadata.horsClasse;\n        n.metadata.duree = 45;\n    }'],
    ['le drapeau se lit sur une valeur molle (« false », 0, "")', CARTE,
        '    return !!(n && n.metadata && n.metadata.horsClasse === true);',
        '    return !!(n && n.metadata && n.metadata.horsClasse);'],

    // --- La porte d'écriture ---
    ['une connaissance peut être marquée hors classe', CARTE,
        '    if (!n || TYPES_HORS_CLASSE.indexOf(n.type) === -1) return false;',
        '    if (!n) return false;'],
    ['décocher pose false au lieu de retirer la clé', CARTE,
        '        delete n.metadata.horsClasse;\n    }',
        '        n.metadata.horsClasse = false;\n    }'],
    ['la porte prétend avoir changé quelque chose sans rien changer', CARTE,
        '    if (estHorsClasseNoeud(n) === vise) return false;',
        '    if (false) return false;'],

    // --- Le champ Durée ---
    ['le champ Durée survit à la case cochée', CARTE,
        '    if (estHorsClasseNoeud(n)) return \'\';\n    var minutes =',
        '    var minutes ='],

    // --- L'export ---
    ['un nœud hors classe sort DEUX fois : dans Contenu et dans sa colonne', EXPORT,
        '        return el.categorie === categorie && !estHorsClasse(el);',
        '        return el.categorie === categorie;'],
    ['la colonne Travail personnel agrège TOUT au lieu du seul hors-classe', EXPORT,
        '        return c.lecon.elements.filter(estHorsClasse).map(function(el) {',
        '        return c.lecon.elements.map(function(el) {'],
    ['une évaluation hors classe perd le nom de sa production', EXPORT,
        "            return el.categorie === 'evaluation' && el.production\n                ? el.production.nomProduction\n                : el.titre;",
        '            return el.titre;'],
    ['le drapeau ne traverse plus le modèle intermédiaire', EXPORT,
        '        horsClasse: !!(nd.metadata && nd.metadata.horsClasse === true),',
        '        horsClasse: false,'],
];

const original = { [CARTE]: readFileSync(CARTE, 'utf8'), [EXPORT]: readFileSync(EXPORT, 'utf8') };
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
        execSync('npx vitest run unit/sentinelle-hors-classe-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(fichier, src);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
