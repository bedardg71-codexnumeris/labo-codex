import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

// Sentinelle SSOT `modalitesEvaluation` — Lots 0, 1 et 3 (10-11 juin 2026).
//
// Contexte : audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`.
// La clé était écrite par read-modify-write depuis 14 fichiers (violation
// SSOT n°1 de l'audit annuel). Lot 0 : extraction des écrivains hors domaine
// (horaire.js → clé `dureePeriode` ; preferences-v2.js → toggles morts).
// Lot 1 : module PROPRIÉTAIRE `js/pratiques/modalites-evaluation.js`
// (lire/modifier/remplacer) — les 12 écrivains du domaine routés dessus.
// Lot 3 : purge legacy — la migration decouplerPR de main.js n'écrit plus la
// clé nue (volet retiré) et migration-pratiques.js est SUPPRIMÉ (les ids
// legacy résolvent à la volée par normaliserIdPratique). Le module est
// désormais le SEUL écrivain, point.
//
// RATCHET : cette liste ne doit que RÉTRÉCIR. Ne JAMAIS y rajouter un
// fichier sans décision explicite de Grégoire.
const ECRIVAINS_AUTORISES = new Set([
    'js/pratiques/modalites-evaluation.js'  // module PROPRIÉTAIRE — écritures NS + purge legacy (purgerLegacy)
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
        // Le module propriétaire écrit la clé en LITTÉRAL exprès pour rester visible ici.
        expect(ecrivainsTrouves.has('js/pratiques/modalites-evaluation.js')).toBe(true);
        expect(ecrivainsTrouves.size).toBeGreaterThanOrEqual(1);
    });

    it('les anciens écrivains du domaine sont bien routés (acquis Lot 1)', () => {
        for (const ancien of [
            'js/pratiques.js', 'js/objectifs.js',   // pratique-notation-v2.js : retiré (#469, 11 oct. 2026)
            'js/wizard-pratique-v2.js', 'js/pratiques/pratique-manager.js',
            'js/pratiques-bibliotheque.js', 'js/preferences.js',
            'js/import-export.js', 'js/demo-activation.js', 'js/evaluation-chargement.js'
        ]) {
            expect(ecrivainsTrouves.has(ancien), `${ancien} écrit encore la clé en direct`).toBe(false);
        }
    });

    it('les migrations bornées du Lot 1 ont disparu (acquis Lot 3)', () => {
        // main.js n'écrit plus la clé nue (volet decouplerPR retiré) et
        // migration-pratiques.js est supprimé du dépôt.
        expect(ecrivainsTrouves.has('js/main.js')).toBe(false);
        expect(
            fs.existsSync(path.join(dossierJs, 'pratiques', 'migration-pratiques.js')),
            'js/pratiques/migration-pratiques.js devait être supprimé au Lot 3'
        ).toBe(false);
    });
});
