import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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
// NB : js/pratique-notation-v2.js est retiré en entier depuis le 11 oct. 2026 (#469).

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
    'chargerReglesConformiteConfig',
    // #469, lot 22 (12 oct. 2026) — graphe d'appels interne de pratiques.js : aucune fonction
    // vivante ne les appelait plus. `activerPratique` n'était atteinte que par
    // `activerPratiqueAffichee` (sans appelant) ; `onEchelleConformiteChange` par aucune.
    'activerPratique',
    'onEchelleConformiteChange'
];

// Le flux VIVANT de configuration des pratiques doit rester intact.
const SYMBOLES_VIVANTS = [
    'initialiserModulePratiques',
    'chargerConfigurationPratique',
    'initialiserReglesConformite',
    'populerSelecteursNiveaux'
];

// Branche pratique-notation-v2.js : l'éditeur AUTONOME mort (bootstrap +
// chargement/sauvegarde/type-selection sur le DOM `v2-pratique-type` disparu)
// est retiré ; le moteur de config consommé par la bibliothèque reste.
// ⚠ DEUX NOMS ONT CHANGÉ DE LISTE LE 31 AOÛT 2026 (#626, S8 du plan Conception),
// et leur date de péremption est datable : `changerVariantePANStandards` et
// `sauvegarderPratiqueBaseV2` figuraient en V2_VIVANTS, avec la note « atteint
// par changerVariantePANStandards (vivant) ». C'était vrai en juin. Ça a cessé
// de l'être le 9 août 2026 au commit `bbf17df4` (#434 Phase D — une seule
// question sur la construction de la note), qui a retiré le dernier appelant
// avec le DOM `v2-*` qu'ils lisaient. Entre le 9 et le 31 août, la liste
// affirmait donc vivant un code que plus rien n'atteignait — un cliquet ne vaut
// que ce que vaut la date de sa dernière vérification.
const V2_RETIRES = [
    'changerVariantePANStandards',   // #626 — dernier appelant parti avec bbf17df4 (#434, 9 août 2026)
    'sauvegarderPratiqueBaseV2',     // #626 — n'était atteint que par le précédent
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
// (V2_VIVANTS est tombé le 11 oct. 2026 : le fichier entier est retiré, #469.)

let source;
let productions;
let productionsListe;

beforeAll(() => {
    source = readFileSync(path.join(racine, 'js/pratiques.js'), 'utf8');
    productions = readFileSync(path.join(racine, 'js/productions.js'), 'utf8');
    productionsListe = readFileSync(path.join(racine, 'js/productions-liste.js'), 'utf8');
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

describe('#338 · branche pratique-notation-v2.js — fichier retiré en entier (#469, 11 oct. 2026)', () => {
    // Le « moteur vivant » que ce bloc gardait ne l'était plus : ses 14 cibles `v2-*` avaient
    // quitté index.html, ses trois appelants gardés ne faisaient rien. Le fichier est retiré ;
    // la chaîne morte ne peut revenir que dans un autre fichier de js/.
    it('aucun symbole de la chaîne morte n\'est défini dans js/', () => {
        const tous = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js'))
            .map((f) => readFileSync(path.join(racine, 'js', f), 'utf8')).join('\n');
        for (const sym of V2_RETIRES) {
            expect(tous.includes(`function ${sym}(`), `${sym} ne doit plus être défini`).toBe(false);
        }
    });
});
