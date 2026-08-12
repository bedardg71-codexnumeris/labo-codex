// Boucle de cassure pour sentinelle-date-lecon-416 (#416 lot C).
// Chaque entrée casse UNE chose que la sentinelle prétend verrouiller.
// Si la suite reste VERTE après la cassure, c'est le TEST qui est faux.
// Usage : node scripts/break-test-416-lot-c-date.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const racine = path.resolve(import.meta.dirname, '..');
const HORAIRE = path.join(racine, 'js', 'horaire.js');
const EXPORT = path.join(racine, 'js', 'planification-export.js');

const cassures = [
    // --- La clé : le groupe explicite commande ---
    ['le groupe explicite ne commande plus (l’actif reprend la main)', HORAIRE,
        '    // Groupe explicite : il commande, et on ne consulte pas l\'état global.\n    if (groupeCoursId) {\n        return `seancesCompletes_gc_${groupeCoursId}`;\n    }',
        ''],
    ['le groupe explicite passe APRÈS l’actif', HORAIRE,
        '    if (groupeCoursId) {\n        return `seancesCompletes_gc_${groupeCoursId}`;\n    }\n\n    // 🆕 FIX (3 fév 2026)',
        '    if (false) {\n        return `seancesCompletes_gc_${groupeCoursId}`;\n    }\n\n    // 🆕 FIX (3 fév 2026)'],

    // --- La lecture stricte : jamais d'écriture ---
    ['la lecture stricte régénère (donc ÉCRIT) quand le cache manque', HORAIRE,
        '    const seances = db.getSync(cleSeancesCompletes(null, groupeCoursId), null);',
        '    const seances = db.getSync(cleSeancesCompletes(null, groupeCoursId), null)\n        || genererSeancesCompletes(null);'],
    ['la lecture stricte accepte un identifiant vide et lit au hasard', HORAIRE,
        "    if (!groupeCoursId || typeof groupeCoursId !== 'string') return {};",
        '    if (false) return {};'],
    ['la lecture stricte propage une donnée corrompue', HORAIRE,
        "    if (!seances || typeof seances !== 'object' || Array.isArray(seances)) return {};",
        '    if (!seances) return {};'],

    // --- La dérivation ---
    ['le rang n’est plus borné à 1 (rang 0 rend la dernière date)', EXPORT,
        '    if (isNaN(s) || isNaN(r) || r < 1) return null;',
        '    if (isNaN(s) || isNaN(r)) return null;'],
    ['le rang déborde la semaine (rang 3 sur deux rencontres)', EXPORT,
        '    if (!Array.isArray(dates) || dates.length < r) return null;',
        '    if (!Array.isArray(dates)) return null;'],
    ['les dates ne sont plus triées (l’ordre du magasin fait foi)', EXPORT,
        "    semaines.forEach(function(s) { datesParSemaine[s].sort(); });",
        '    semaines.forEach(function(s) { return s; });'],
    ['une date compte autant de fois qu’elle a de périodes', EXPORT,
        '        if (!datesParSemaine[semaine]) datesParSemaine[semaine] = [];\n        datesParSemaine[semaine].push(date);',
        '        if (!datesParSemaine[semaine]) datesParSemaine[semaine] = [];\n        seances.forEach(function() { datesParSemaine[semaine].push(date); });'],
    ['une séance sans numéro de semaine entre quand même', EXPORT,
        '        if (isNaN(semaine)) return;',
        '        if (isNaN(semaine)) semaine = 0;'],
    ['un horaire sans séance datable rend un objet au lieu de null', EXPORT,
        '    if (semaines.length === 0) return null;',
        '    if (semaines.length === 0) return { groupeCoursId: groupeCoursId, datesParSemaine: {} };'],
    // ⚠ La garde d'entrée se casse en la RETIRANT, pas en la réécrivant. La
    // version « if (!horaire) return null; sinon datesParSemaine = {} » restait
    // VERTE, et à raison : elle rend null elle aussi. Une cassure qui ne change
    // rien d'observable ne prouve rien — elle fabrique une fausse confiance.
    ['pas de garde d’entrée du tout (horaire absent → exception)', EXPORT,
        '    if (!horaire || !horaire.datesParSemaine) return null;\n\n    var s = parseInt(semaine, 10);',
        '    var s = parseInt(semaine, 10);'],

    // --- Le choix du groupe (D9) ---
    ['les groupes d’un AUTRE cours entrent dans les candidats', EXPORT,
        '        .filter(function(g) { return g && g.coursId === coursId; })',
        '        .filter(function(g) { return !!g; })'],
    ['une carte sans cours rend tous les groupes du trimestre', EXPORT,
        '    if (!coursId || typeof window.cle !== \'function\' || !window.db) return [];',
        '    if (typeof window.cle !== \'function\' || !window.db) return [];'],
];

// ⚠ UNE CASSURE RETIRÉE DU BANC, ET POURQUOI. « Retirer `if (!groupeCoursId)
// return null` de construireHoraireDeLecons » restait VERTE — et c'est exact :
// la lecture stricte refuse déjà l'identifiant vide et rend {}, d'où une table
// sans semaine, d'où null. La garde est une redondance DÉLIBÉRÉE (elle dit
// l'intention sur place et tient si la lecture stricte change un jour), pas un
// invariant observable. La laisser au banc aurait exigé un test qui n'observe
// rien — exactement le « vert et inerte » que ce projet a trouvé trois fois en
// deux jours au début d'août.

const original = { [HORAIRE]: readFileSync(HORAIRE, 'utf8'), [EXPORT]: readFileSync(EXPORT, 'utf8') };
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
        execSync('npx vitest run unit/sentinelle-date-lecon-416.test.js --reporter=dot',
            { cwd: path.join(racine, 'tests'), stdio: 'pipe' });
    } catch { rouge = true; }
    writeFileSync(fichier, src);
    if (rouge) { rouges++; console.log(`✅ ROUGE — ${nom}`); }
    else { verts.push(nom); console.log(`❌ RESTE VERT — ${nom}`); }
}

console.log(`\n${rouges}/${cassures.length} cassures détectées.`);
if (verts.length) { console.log('À revoir : ' + verts.join(' · ')); process.exit(1); }
