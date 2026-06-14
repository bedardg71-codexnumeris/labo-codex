import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #338 — ablation du vieil éditeur de pratique de notation mort (juin 2026).
// Les ids DOM de l'ancien formulaire « Pratique de notation » (#pratiqueNotation,
// #typePAN, #statutModalites, #configurationPAN, #portfolioActif, #jetonsActif…)
// n'existent NULLE PART : ni dans index.html, ni générés en JS. Toute la chaîne
// de configuration de cet éditeur tournait à vide derrière des gardes
// getElementById null (ou n'était jamais atteinte).
//
// Deux passages sur js/pratiques.js :
//   1er passage (1.17.3) : sous-graphe feuille 100 % mort + bug dormant.
//   2e passage  : la « zone grise » (fonctions appelées par un init/des handlers
//                 vivants mais no-op sur DOM absent) + les helpers orphelins
//                 exposés (jetons personnalisés, dropdown plafond, règles de
//                 conformité), avec nettoyage des sites d'appel vivants
//                 (initialiserModulePratiques, chargerConfigurationPratique,
//                 productions.js ×3, productions-liste.js ×1).
//
// Ce verrou garantit (cf. feedback-fix-perdu-refactoring-extraction : toute
// dette retirée doit être verrouillée contre la réintroduction) que la chaîne
// morte ne revient pas et que le flux VIVANT de configuration des pratiques
// (bibliothèque / PratiqueManager) reste en place.
//
// NB : js/pratique-notation-v2.js (moteur de config VIVANT consommé par
// pratiques-bibliotheque.js) n'est PAS couvert ici — son trio mort
// (chargerValeursDepuisStorage/sauvegarderPratiqueBaseV2/sauvegarderStructureV2)
// + bootstrap est un passage ultérieur dédié.

// Symboles retirés des deux passages (ne doivent plus être ni définis ni exportés).
const SYMBOLES_RETIRES = [
    // 1er passage
    'attacherEvenementsPratiques',
    'changerPratiqueNotation',
    'updateDescriptionModalite',
    'sauvegarderConfigurationPAN',
    'sauvegarderPratiqueNotation',
    'sauvegarderDansConfiguration',
    // 2e passage — zone grise
    'afficherInfoPAN',
    'afficherOptionsAffichage',
    'afficherConfigurationPAN',
    'afficherParametresPAN',
    'toggleConfigPortfolio',
    'toggleConfigJetons',
    'afficherCartesExtras',
    'chargerModalites',
    'chargerConfigurationPAN',
    'mettreAJourStatutModalites',
    // 2e passage — helpers orphelins exposés
    'afficherJetonsPersonnalises',
    'ajouterTypeJetonPersonnalise',
    'supprimerTypeJetonPersonnalise',
    'peuplerDropdownPlafondNoteCiblee',
    'getReglesConformiteConfig',
    'chargerReglesConformiteConfig'
];

// Le flux VIVANT de configuration des pratiques doit rester intact.
const SYMBOLES_VIVANTS = [
    'initialiserModulePratiques',
    'chargerConfigurationPratique',
    'activerPratique',
    'initialiserReglesConformite',
    'populerSelecteursNiveaux',
    'onEchelleConformiteChange'
];

// Branche pratique-notation-v2.js : l'éditeur AUTONOME mort (bootstrap +
// chargement/sauvegarde/type-selection sur le DOM `v2-pratique-type` disparu)
// est retiré ; le moteur de config consommé par la bibliothèque reste.
const V2_RETIRES = [
    'initialiserPratiqueNotationV2',
    'chargerDropdownEchellesV2',
    'afficherPreviewEchelleV2',
    'chargerValeursDepuisStorage',
    'changerTypePratiqueV2',
    'afficherConfigurationType',
    'sauvegarderStructureV2',
    'sauvegarderJetonsV2',
    'sauvegarderToutePratiqueV2',
    'sauvegarderConfigSpecifications',
    'appliquerModeleSpecifications',
    'initialiserComptageObjectifsV2'
];
const V2_VIVANTS = [
    'chargerConfigParObjectifs',
    'chargerConfigSpecifications',
    'afficherTypesTravauxSpec',
    'afficherForfaitsSpec',
    'changerVariantePANStandards',
    'sauvegarderPratiqueBaseV2'   // atteint par changerVariantePANStandards (vivant)
];

let source;
let productions;
let productionsListe;
let v2;

beforeAll(() => {
    source = readFileSync(path.join(racine, 'js/pratiques.js'), 'utf8');
    productions = readFileSync(path.join(racine, 'js/productions.js'), 'utf8');
    productionsListe = readFileSync(path.join(racine, 'js/productions-liste.js'), 'utf8');
    v2 = readFileSync(path.join(racine, 'js/pratique-notation-v2.js'), 'utf8');
});

describe('#338 · ablation du vieil éditeur de pratique mort (pratiques.js, 2 passages)', () => {

    it('aucun symbole mort n’est défini ni exporté dans pratiques.js', () => {
        for (const sym of SYMBOLES_RETIRES) {
            expect(source.includes(`function ${sym}(`), `${sym} ne doit plus être défini`).toBe(false);
            expect(source.includes(`window.${sym} =`), `window.${sym} ne doit plus être exporté`).toBe(false);
        }
    });

    it('le flux vivant de configuration des pratiques reste défini', () => {
        for (const sym of SYMBOLES_VIVANTS) {
            expect(source.includes(`function ${sym}(`), `${sym} doit rester défini`).toBe(true);
        }
    });

    it('plus aucune fonction ne déclare un paramètre `cle` qui masque le helper global window.cle', () => {
        // Bug dormant retiré : sauvegarderDansConfiguration(cle, valeur) — le
        // paramètre `cle` masquait la fonction globale cle() de namespacing.
        const shadows = source.match(/function +[A-Za-z0-9_]+ *\([^)]*\bcle\b[^)]*\)/g) || [];
        expect(shadows).toEqual([]);
    });

    it('plus aucun appel résiduel à mettreAJourStatutModalites dans les modules productions', () => {
        expect(productions.includes('mettreAJourStatutModalites')).toBe(false);
        expect(productionsListe.includes('mettreAJourStatutModalites')).toBe(false);
    });
});

describe('#338 · branche pratique-notation-v2.js (éditeur autonome mort retiré, moteur vivant conservé)', () => {

    it('le bootstrap autonome et la chaîne morte sont retirés', () => {
        // Plus de bootstrap DOMContentLoaded/db-ready de l'éditeur autonome.
        expect(v2.includes("document.readyState === 'loading'")).toBe(false);
        for (const sym of V2_RETIRES) {
            expect(v2.includes(`function ${sym}(`), `${sym} ne doit plus être défini`).toBe(false);
            expect(v2.includes(`window.${sym} =`), `window.${sym} ne doit plus être exporté`).toBe(false);
        }
    });

    it('le moteur de configuration consommé par la bibliothèque reste défini', () => {
        for (const sym of V2_VIVANTS) {
            expect(v2.includes(`function ${sym}(`), `${sym} doit rester défini`).toBe(true);
        }
    });
});
