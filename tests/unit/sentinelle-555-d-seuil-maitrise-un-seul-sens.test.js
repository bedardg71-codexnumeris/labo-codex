import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #555 (d) — « seuilMaitrise » N'A PLUS QU'UN SENS : LE CODE DE NIVEAU.
//
// CE QUI ÉTAIT LÀ (mesuré le 28 août 2026). Le même mot désignait quatre
// choses de types différents : le CODE de niveau posé sur l'échelle par le
// lot 1 (« M »), un SCORE 0-1 détecté par la matrice de consolidation, un
// SEUIL DE PRÉFÉRENCE 0-1 (`obtenirSeuil('idme.maitrise')`, défaut 0,85) et un
// POURCENTAGE 0-100 d'un mode de calcul retiré. Aucune collision d'exécution —
// mais un lecteur qui tombe sur `seuilMaitrise` ne peut pas savoir s'il lit
// une lettre ou un nombre, et c'est ainsi qu'un repli se recopie de travers.
//
// ⮕ DÉCISION DE GRÉGOIRE (28 août 2026, arbitrage A1, option A) : le CODE de
// niveau GARDE `seuilMaitrise` ; les autres sens deviennent explicites.
//   · profil-etudiant-*.js  → `seuilIdmeMaitrise` (avec ses deux voisins `seuilIdme*`)
//
// ⮕ CE BANC EST UN CLIQUET, PAS UNE PHOTO. Il compte, fichier par fichier et
// COMMENTAIRES RETIRÉS, les occurrences du mot dans le code exécutable, et les
// compare à une liste FERMÉE. Un fichier neuf qui emploie le mot, ou un compte
// qui monte, le fait rougir : le message dit alors quel nom explicite employer.
// Un compte qui DESCEND le fait rougir aussi — la liste doit suivre, c'est
// voulu (même doctrine que `DOUBLONS_CONNUS`, #557).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

/**
 * Le code exécutable seul : blocs `/* … *\/` et lignes `//` retirés. Une
 * assertion statique qui compte les commentaires mesure des mots, pas du code
 * (leçon de #551 et du lot 2 de #555).
 */
function sansCommentaires(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[;{}\s])\/\/[^\n]*/g, '$1');
}

function lire(relatif) {
    return sansCommentaires(readFileSync(path.join(racine, relatif), 'utf8'));
}

function compter(source, motif) {
    return (source.match(motif) || []).length;
}

/**
 * Les SEULS emplois restants du mot, et leur nombre. Chacun est le CODE de
 * niveau lu ou écrit sur une ÉCHELLE — sauf le dernier, une exception nommée.
 */
const EMPLOIS_CONNUS = {
    // Le libellé du repère, la copie dans `dupliquerEchelle`, le refus croisé,
    // et le `<select>` de l'éditeur : tous sur l'échelle.
    // #1149, lot 3b (24 oct. 2026) : +2, l'étape « Repères » de la chaîne lit le code posé (`e.seuilMaitrise`).
    'js/echelles.js': 7,
    // Le transport à l'import : `SCHEMAS_IMPORT.echelle.seuilMaitrise`.
    'js/import-export.js': 1,
    // #583 : le transport au PARTAGE (`SCHEMA_ENTITE.echelle.seuilMaitrise`), et le
    // libellé du repère orphelin retiré à la réception (`LIBELLES_REPERES`).
    'js/partage-schemas.js': 1,
    'js/partage-validation.js': 1,
    // 30 oct. 2026 : `reperesPerformance` lit le CODE posé sur l'échelle, et le transporte quand deux échelles
    // aux mêmes plages se fondent en une.
    'js/contexte-qualification.js': 4,
    // `rangDuCode(echelle.seuilMaitrise)` dans `zoneDuCodeDansNiveaux`.
    'js/profil-etudiant-calculs.js': 1,
    // #577 : l'assistant LIT le repère de l'échelle choisie (avertissement si
    // absent, récapitulatif) — trois lectures, toutes sur l'échelle.
    'js/wizard-pratique-v2.js': 3,
    // #593 : le modèle de cartouche remis à l'assistant LIT le repère de
    // l'échelle (`echelle.seuilMaitrise`, deux fois : garde + résolution du
    // niveau) pour nommer le niveau « Maîtrisé à partir de » — sur l'échelle.
    'js/cartouches.js': 2,
    // (L'exception `js/pratique-notation-v2.js`, code mort, est tombée avec lui : #469, 11 oct. 2026.)
};

const FICHIERS_EXCLUS = ['_archives', 'pack-demo'];

function fichiersJs(dossier) {
    const resultat = [];
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, entree.name);
        if (FICHIERS_EXCLUS.some((x) => chemin.includes(x))) continue;
        if (entree.isDirectory()) resultat.push(...fichiersJs(chemin));
        else if (entree.name.endsWith('.js')) resultat.push(chemin);
    }
    return resultat;
}

describe('#555 (d) · « seuilMaitrise » ne désigne plus que le code de niveau', () => {

    it('aucun fichier hors liste n\'emploie le mot, et aucun compte n\'a bougé', () => {
        const releve = {};
        for (const abs of fichiersJs(path.join(racine, 'js'))) {
            const rel = path.relative(racine, abs).split(path.sep).join('/');
            const n = compter(lire(rel), /\bseuilMaitrise\b/g);
            if (n > 0) releve[rel] = n;
        }
        expect(releve,
            'Un emploi de `seuilMaitrise` est apparu ou a bougé. S\'il désigne le CODE de '
            + 'niveau d\'une échelle, mettre la liste à jour ; sinon, employer le nom '
            + 'explicite du sens : `scoreMaitrise` (0-1 dérivé), `seuilIdmeMaitrise` '
            + '(préférence 0-1). Un compte qui DESCEND se reporte aussi ici.'
        ).toEqual(EMPLOIS_CONNUS);
    });


    it('la préférence IDME a disparu (30 oct. 2026) : plus aucune lecture de `idme.*`, l\'échelle fait foi', () => {
        for (const rel of ['js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js']) {
            const src = lire(rel);
            expect(src, rel).not.toMatch(/obtenirSeuil\('idme\./);
            expect(src, rel).not.toMatch(/\bseuilIdme(Maitrise|Developpement|Insuffisant)\b/);
            expect(src, rel).not.toMatch(/\bconst\s+seuil(Maitrise|Developpement|Insuffisant)\s*=/);
        }
    });
});
