import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

// Sentinelle SSOT `modalitesEvaluation` — Lot 0 (10 juin 2026).
//
// Contexte : audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`.
// La clé est écrite par read-modify-write depuis trop d'endroits (violation
// SSOT n°1 de l'audit annuel). Le Lot 0 a extrait les deux écrivains HORS
// DOMAINE (horaire.js → clé `dureePeriode` ; preferences-v2.js → toggles
// comparatifs morts retirés). Cette sentinelle verrouille le résultat :
// tout NOUVEL écrivain hors de la liste ci-dessous fait échouer la suite.
//
// RATCHET : cette liste ne doit que RÉTRÉCIR. Au Lot 1 (module propriétaire
// + API d'écriture par section), la retailler vers le seul propriétaire.
// Ne JAMAIS y rajouter un fichier sans décision explicite de Grégoire.
const ECRIVAINS_AUTORISES = new Set([
    'js/pratique-notation-v2.js',          // éditeur de configuration (22 sites)
    'js/pratiques.js',                     // activation/sauvegarde de pratique
    'js/objectifs.js',                     // bascule multi-objectifs
    'js/wizard-pratique-v2.js',            // création (sync si pratique active)
    'js/pratiques/pratique-manager.js',    // changerPratiqueActive
    'js/pratiques/migration-pratiques.js', // migration one-shot (clé non namespacée, bornée)
    'js/pratiques-bibliotheque.js',        // appliquerConfigurationPratique
    'js/main.js',                          // migration decouplerPR (bornée, documentée)
    'js/preferences.js',                   // nettoyerLegacy (one-shot)
    'js/import-export.js',                 // executerImportConfigComplete
    'js/demo-activation.js',               // bascule démo (écrasement + restauration)
    'js/evaluation-chargement.js'          // _synchroniserJetonsPratique (miroir, cible Lot 2)
]);

const MOTIF_ECRITURE = /db\.set(?:Sync)?\s*\([^)]*modalitesEvaluation/;

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

describe('Sentinelle SSOT · écrivains de modalitesEvaluation (Lot 0)', () => {
    const ecrivainsTrouves = new Map(); // fichier relatif → [numéros de ligne]

    for (const fichier of listerFichiersJs(dossierJs)) {
        const relatif = path.relative(racineProjet, fichier).split(path.sep).join('/');
        const lignes = fs.readFileSync(fichier, 'utf8').split('\n');
        lignes.forEach((ligne, i) => {
            if (MOTIF_ECRITURE.test(ligne)) {
                if (!ecrivainsTrouves.has(relatif)) ecrivainsTrouves.set(relatif, []);
                ecrivainsTrouves.get(relatif).push(i + 1);
            }
        });
    }

    it('aucun écrivain hors de la liste autorisée', () => {
        const intrus = [...ecrivainsTrouves.entries()]
            .filter(([fichier]) => !ECRIVAINS_AUTORISES.has(fichier))
            .map(([fichier, lignesNum]) => `${fichier}:${lignesNum.join(',')}`);

        expect(
            intrus,
            `Écriture de modalitesEvaluation hors de la liste autorisée : ${intrus.join(' ; ')}. ` +
            `La clé est en consolidation SSOT (audit 10 juin 2026) — passer par le domaine pratiques, ` +
            `ne pas ajouter d'écrivain. Si c'est délibéré, décision Grégoire requise.`
        ).toEqual([]);
    });

    it('horaire.js et preferences-v2.js n\'écrivent plus la clé (acquis Lot 0)', () => {
        expect(ecrivainsTrouves.has('js/horaire.js')).toBe(false);
        expect(ecrivainsTrouves.has('js/preferences-v2.js')).toBe(false);
    });

    it('le périmètre scanné est plausible (la sentinelle voit bien les écrivains connus)', () => {
        // Garde anti-régression de la sentinelle elle-même : si le motif ou le
        // parcours casse silencieusement, ce test échoue au lieu de tout laisser passer.
        expect(ecrivainsTrouves.has('js/pratique-notation-v2.js')).toBe(true);
        expect(ecrivainsTrouves.size).toBeGreaterThanOrEqual(10);
    });
});
