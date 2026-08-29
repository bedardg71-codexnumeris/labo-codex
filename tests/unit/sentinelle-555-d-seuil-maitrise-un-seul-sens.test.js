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
//   · consolidation.js      → `scoreMaitrise` (+ `Deduit`, `Raison`), `_detecterScoreMaitrise`
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
    // `echelle.seuilMaitrise` lu deux fois par `_detecterScoreMaitrise`.
    'js/consolidation.js': 2,
    // Le libellé du repère, la copie dans `dupliquerEchelle`, le refus croisé,
    // et le `<select>` de l'éditeur : tous sur l'échelle.
    'js/echelles.js': 5,
    // Le transport à l'import : `SCHEMAS_IMPORT.echelle.seuilMaitrise`.
    'js/import-export.js': 1,
    // `rangDuCode(echelle.seuilMaitrise)` dans `zoneDuCodeDansNiveaux`.
    'js/profil-etudiant-calculs.js': 1,
    // #577 : l'assistant LIT le repère de l'échelle choisie (avertissement si
    // absent, récapitulatif) — trois lectures, toutes sur l'échelle.
    'js/wizard-pratique-v2.js': 3,
    // ⚠ EXCEPTION NOMMÉE — le POURCENTAGE 0-100 du mode « par objectifs »,
    // retiré par #435 (#443). Son écran n'existe plus dans index.html
    // (`v2-config-par-objectifs`, `v2-comptage-seuil-maitrise` : 0 occurrence),
    // ce code est MORT. On ne renomme pas du code mort : on le retire, et ce
    // retrait est inscrit au backlog (#592). Le jour où il tombe, cette ligne
    // tombe avec lui — un cliquet ne descend pas seul.
    'js/pratique-notation-v2.js': 4
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

    it('la matrice de consolidation nomme son score, et ne l\'appelle plus seuil', () => {
        const src = lire('js/consolidation.js');
        expect(src).toContain('function _detecterScoreMaitrise(');
        expect(src).toContain('window._detecterScoreMaitrise = _detecterScoreMaitrise');
        expect(compter(src, /\bctx\.scoreMaitrise\b/g)).toBeGreaterThanOrEqual(4);
        expect(src).toContain('scoreMaitriseDeduit');
        expect(src).toContain('scoreMaitriseRaison');
        // Les anciens noms n'existent plus, ni en lecture ni en écriture.
        expect(src).not.toMatch(/\bctx\.seuilMaitrise\b/);
        expect(src).not.toMatch(/\bseuilMaitriseDeduit\b/);
        expect(src).not.toMatch(/\bseuilMaitriseRaison\b/);
        expect(src).not.toMatch(/\b_detecterSeuilMaitrise\b/);
        expect(src).not.toMatch(/\b_seuilParConvention\b/);
    });

    it('le seul consommateur du score lit les nouveaux champs', () => {
        const src = lire('js/profil-etudiant-diagnostics.js');
        expect(src).toContain('consolidation.scoreMaitriseDeduit');
        expect(src).toContain('consolidation.scoreMaitriseRaison');
        expect(src).not.toMatch(/consolidation\.seuilMaitrise/);
    });

    it('la préférence IDME porte son nom, dans les trois fonctions qui la lisent', () => {
        for (const rel of ['js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js']) {
            const src = lire(rel);
            // Chaque lecture de la préférence est rangée sous un nom `seuilIdme*`…
            const lectures = src.match(/const\s+(\w+)\s*=\s*obtenirSeuil\('idme\.(maitrise|developpement|insuffisant)'\)/g) || [];
            expect(lectures.length, rel + ' : lectures de la préférence IDME').toBeGreaterThan(0);
            for (const l of lectures) {
                expect(l, rel).toMatch(/const\s+seuilIdme(Maitrise|Developpement|Insuffisant)\s*=/);
            }
            // …et aucun ancien nom nu ne subsiste pour les désigner.
            expect(src).not.toMatch(/\bconst\s+seuil(Maitrise|Developpement|Insuffisant)\s*=/);
        }
    });
});
