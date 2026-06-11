import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

// Sentinelle SSOT `modalitesEvaluation` — Lot 3 (11 juin 2026) : purge legacy.
//
// Verrouille les acquis du Lot 3 (cf. feedback-fix-perdu-refactoring-
// extraction — un retrait de fallback non verrouillé peut réapparaître
// silencieusement à un refactoring) :
//  1. La clé NUE 'modalitesEvaluation' (pré-namespacing 24 mai 2026) n'est
//     plus lue NULLE PART, sauf par la migration namespacing bornée de
//     main.js (le pont pour données anciennes) et la migration préférences
//     v3 de preferences.js (lecture via safeGet, flag migrationPrefs_v3_done).
//  2. Le champ legacy `dureePeriodeMinutes` n'est plus consommé : seul le
//     module propriétaire y touche encore (purgerLegacy, pour l'effacer).
//     La valeur vit dans la clé `dureePeriode` (domaine horaire, Lot 0).
//  3. horaire.js ne référence plus modalitesEvaluation du tout (la migration
//     paresseuse d'obtenirDureePeriode a été retirée).
//
// RATCHET : ces listes ne doivent que RÉTRÉCIR. Ne JAMAIS y rajouter un
// fichier sans décision explicite de Grégoire.

const LECTEURS_CLE_NUE_AUTORISES = new Set([
    'js/main.js'  // migration_modalites_namespacees_done — bornée, documentée
]);

const FICHIERS_DUREE_LEGACY_AUTORISES = new Set([
    'js/pratiques/modalites-evaluation.js'  // purgerLegacy() — seul consommateur (pour effacer)
]);

const MOTIF_LECTURE_CLE_NUE = /db\.get(?:Sync)?\s*\(\s*'modalitesEvaluation'/;
// Accès membre (.champ) ou clé citée — les simples mentions en prose de
// commentaire et les noms de paramètres JSDoc ne comptent pas.
const MOTIF_CHAMP_LEGACY = /\.dureePeriodeMinutes\b|'dureePeriodeMinutes'|"dureePeriodeMinutes"/;

function listerFichiersJs(dossier) {
    const resultats = [];
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, entree.name);
        if (entree.isDirectory()) {
            resultats.push(...listerFichiersJs(chemin));
        } else if (entree.name.endsWith('.js')) {
            resultats.push(chemin);
        }
    }
    return resultats;
}

function scanner(motif) {
    const touches = new Map(); // fichier relatif → [numéros de ligne]
    for (const fichier of listerFichiersJs(dossierJs)) {
        const relatif = path.relative(racineProjet, fichier).split(path.sep).join('/');
        fs.readFileSync(fichier, 'utf8').split('\n').forEach((ligne, i) => {
            if (motif.test(ligne)) {
                if (!touches.has(relatif)) touches.set(relatif, []);
                touches.get(relatif).push(i + 1);
            }
        });
    }
    return touches;
}

describe('Sentinelle SSOT · purge legacy modalitesEvaluation (Lot 3)', () => {

    it('la clé nue n\'est lue que par la migration namespacing bornée de main.js', () => {
        const lecteurs = scanner(MOTIF_LECTURE_CLE_NUE);
        const intrus = [...lecteurs.entries()]
            .filter(([fichier]) => !LECTEURS_CLE_NUE_AUTORISES.has(fichier))
            .map(([fichier, lignes]) => `${fichier}:${lignes.join(',')}`);
        expect(
            intrus,
            `Lecture de la clé nue 'modalitesEvaluation' hors migration bornée : ${intrus.join(' ; ')}. ` +
            `Le fallback clé nue a été purgé au Lot 3 — lire via window.modalitesEvaluation.lire().`
        ).toEqual([]);
    });

    it('main.js garde exactement UNE lecture de la clé nue (le pont, pas plus)', () => {
        const lecteurs = scanner(MOTIF_LECTURE_CLE_NUE);
        expect(lecteurs.get('js/main.js') || []).toHaveLength(1);
    });

    it('le champ legacy dureePeriodeMinutes n\'est consommé que par purgerLegacy()', () => {
        const consommateurs = scanner(MOTIF_CHAMP_LEGACY);
        const intrus = [...consommateurs.entries()]
            .filter(([fichier]) => !FICHIERS_DUREE_LEGACY_AUTORISES.has(fichier))
            .map(([fichier, lignes]) => `${fichier}:${lignes.join(',')}`);
        expect(
            intrus,
            `Référence au champ legacy dureePeriodeMinutes : ${intrus.join(' ; ')}. ` +
            `La durée de période se lit via obtenirDureePeriode() (clé dureePeriode, domaine horaire).`
        ).toEqual([]);
    });

    it('horaire.js ne référence plus modalitesEvaluation (migration paresseuse retirée)', () => {
        const src = fs.readFileSync(path.join(dossierJs, 'horaire.js'), 'utf8');
        expect(src.includes('modalitesEvaluation')).toBe(false);
    });

    it('la purge est câblée au boot (main.js appelle purgerLegacy)', () => {
        const src = fs.readFileSync(path.join(dossierJs, 'main.js'), 'utf8');
        expect(/window\.modalitesEvaluation\.purgerLegacy\(\)/.test(src)).toBe(true);
    });

});
