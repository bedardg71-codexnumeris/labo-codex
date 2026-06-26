import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #348 — Consultation d'une éval (terminale A25) dont la grille est introuvable,
// alors que le panneau « Critères » (#listeCriteresGrille1) n'est PAS monté dans le
// DOM (il est déplacé par JS dans la visionneuse de travaux ; absent pour une éval
// terminale sans visionneuse déployée).
//
// Symptôme : afficherCriteresDepuisGrille accédait au conteneur sans garde →
// `document.getElementById('listeCriteresGrille1').innerHTML = …` sur `null` →
// TypeError « null is not an object » → toast « Impossible de charger l'évaluation ».
// Le crash interrompait _chargerEchelleEtCartoucheModif AVANT le fallback propre
// _appliquerFallbackGrilleManquanteModif (qui, lui, rend les critères depuis l'éval).
//
// Fix : garde DOM (variable `conteneur` + early return si absent), alignée sur le
// jumeau déjà gardé _afficherCriteresDepuisEvaluation (evaluation.js:1718-1719).
//
// Le helper chargerScript fournit un `document` dont getElementById rend null →
// reproduit EXACTEMENT la condition du crash. Break-test : retirer la garde →
// la fonction relève à nouveau (TypeError) → ce test rougit.

describe('#348 · afficherCriteresDepuisGrille — conteneur DOM absent', () => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, d) => (d !== undefined ? d : null),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirPreference: () => null
    };

    function charger() {
        return chargerScript('js/evaluation-chargement.js', stubs, {
            addEventListener: () => {},
            removeEventListener: () => {}
        });
    }

    it('expose afficherCriteresDepuisGrille', () => {
        const win = charger();
        expect(typeof win.afficherCriteresDepuisGrille).toBe('function');
    });

    it('ne plante pas quand #listeCriteresGrille1 est absent du DOM (grille introuvable)', () => {
        const win = charger();
        // getElementById rend null (helper) + grille introuvable (db rend []) :
        // condition exacte du crash #348. La garde doit faire dégrader, pas relever.
        expect(() => win.afficherCriteresDepuisGrille('GRILLE_A2025_FR_ALGO', 'idme-5niv')).not.toThrow();
    });
});
