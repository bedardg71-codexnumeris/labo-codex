import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Lot #317 — correctifs de l'assistant de pratique (audit du 5 juin 2026).
// Cette sentinelle verrouille trois des correctifs :
//  - #132 : le round-trip d'édition perdait la config (écriture sous noms
//    standardisés nombreTotal/nombreARetenir/methodeSelection/minimumCompletion,
//    relecture sous les noms périmés nbArtefactsSoumis… → undefined → écrasement
//    de la config à la re-sauvegarde). Plus les paramètres du mode objectifs,
//    jamais restaurés (TODO inachevé).
//  - #134 : calculerNbEtapes maintenait un compteur manuel qui divergeait du
//    graphe réel (« étape 8 sur 7 »). Il dérive désormais le total du parcours.
//  - #131 : wizardV2CreerGrilleDemo appelait afficherEtapeV2 (inexistant).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Store de pratiques mutable, lu par chargerPratiqueExistante via db.getSync.
let pratiquesStore = [];
const db = {
    getSync: (k, def) => (k === 'pratiquesConfigurables' ? pratiquesStore : (def !== undefined ? def : null)),
    setSync: () => {}
};
const win = chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k });

describe('#132 · round-trip d\'édition — portfolio (par-artefacts)', () => {
    const pratique = {
        id: 'p-port', nom: 'Test Portfolio', type: 'standards',
        configuration: {
            approcheEvaluation: 'par-artefacts',
            echelleId: 'ech1', grilleId: 'gr1',
            varianteCalcul: 'n-meilleurs',
            portfolio: {
                utiliser: true,
                nombreTotal: 10,
                nombreARetenir: 6,
                methodeSelection: 'meilleurs',
                minimumCompletion: 2,
                reprisesPermises: 'limite',
                hybride: false
            }
        }
    };

    it('relit les noms standardisés (et NON les noms périmés)', () => {
        pratiquesStore = [pratique];
        win.chargerPratiqueExistante('p-port');
        const r = win.wizardState.reponses;
        expect(r.nbArtefactsSoumis).toBe(10);       // ← nombreTotal
        expect(r.nbArtefactsRetenus).toBe(6);       // ← nombreARetenir
        expect(r.minAvantCalculFormatif).toBe(2);   // ← minimumCompletion
        expect(r.reprisesPermises).toBe('limite');
        expect(r.utiliserPortfolio).toBe(true);
    });

    it('restaure la méthode de sélection (meilleurs → n_meilleurs)', () => {
        pratiquesStore = [pratique];
        win.chargerPratiqueExistante('p-port');
        expect(win.wizardState.reponses.modeSelectionPortfolio).toBe('n_meilleurs');
    });

    it('restaure le mode hybride', () => {
        pratiquesStore = [{ ...pratique, configuration: { ...pratique.configuration,
            portfolio: { ...pratique.configuration.portfolio, hybride: true, methodeSelection: 'meilleurs' } } }];
        win.chargerPratiqueExistante('p-port');
        expect(win.wizardState.reponses.modeSelectionPortfolio).toBe('hybride');
    });
});

describe('#132 · round-trip d\'édition — objectifs (par-objectifs)', () => {
    it('restaure le mode comptage ET ses paramètres', () => {
        pratiquesStore = [{
            id: 'p-cpt', nom: 'Test Comptage', type: 'standards',
            configuration: {
                approcheEvaluation: 'par-objectifs',
                objectifs: { modeCalcul: 'comptage', nbObjectifs: 8,
                    comptage: { seuilMaitrise: 70, plafondSiEssentielNonMaitrise: 50 } }
            }
        }];
        win.chargerPratiqueExistante('p-cpt');
        const r = win.wizardState.reponses;
        expect(r.modeCalcul).toBe('comptage');
        expect(r.nbObjectifs).toBe(8);
        expect(r.seuilMaitrise).toBe(70);
        expect(r.plafondSiEssentielNonMaitrise).toBe(50);
    });

    it('restaure le mode seuils-critiques ET ses paramètres', () => {
        pratiquesStore = [{
            id: 'p-sc', nom: 'Test Seuils', type: 'standards',
            configuration: {
                approcheEvaluation: 'par-objectifs',
                objectifs: { modeCalcul: 'seuils-critiques', nbObjectifs: 5,
                    seuilsCritiques: { seuilReussite: 'M', noteBaseReussite: 80, bonusParNiveau: 3.33 } }
            }
        }];
        win.chargerPratiqueExistante('p-sc');
        const r = win.wizardState.reponses;
        expect(r.modeCalcul).toBe('seuils-critiques');
        expect(r.seuilReussite).toBe('M');
        expect(r.noteBaseReussite).toBe(80);
        expect(r.bonusParNiveau).toBe(3.33);
    });
});

describe('#134 · calculerNbEtapes dérive du graphe réel', () => {
    // Déroule la navigation réelle (obtenirEtapeSuivante) depuis infos-base et
    // compte : calculerNbEtapes DOIT coïncider. Un futur compteur manuel divergent
    // (cause du « 8 sur 7 ») ferait casser ce test.
    // #319 Lot 2 (a6) : le parcours démarre à 'calcul-note-finale' (infos-base
    // a été déplacé juste avant le récap). Le compteur dérive de etapeInitiale.
    const ENTREE = 'calcul-note-finale';
    function compterParGraphe(reponses) {
        let count = 1, etape = ENTREE, garde = 0;
        while (etape && garde++ < 50) {
            const suivante = win.obtenirEtapeSuivante(etape, reponses);
            if (!suivante) break;
            count++; etape = suivante;
        }
        return count;
    }

    it('coïncide avec le déroulé réel — parcours sommative', () => {
        const reponses = { typePratique: 'sommative', calcNoteFinale: 'moyenne' };
        win.wizardState.reponses = reponses;
        win.wizardState.etapeInitiale = ENTREE;
        expect(win.calculerNbEtapes()).toBe(compterParGraphe(reponses));
        expect(win.calculerNbEtapes()).toBeGreaterThan(1);
    });

    it('coïncide avec le déroulé réel — parcours PAN-Standards par objectifs', () => {
        // #319 Lot 1 : vocabulaire interne canonique ('standards', plus 'pan-standards').
        const reponses = { typePratique: 'standards', approcheEvaluation: 'par-objectifs', calcNoteFinale: 'niveaux' };
        win.wizardState.reponses = reponses;
        win.wizardState.etapeInitiale = ENTREE;
        expect(win.calculerNbEtapes()).toBe(compterParGraphe(reponses));
    });
});

describe('#131 · wizardV2CreerGrilleDemo appelle la bonne fonction de rafraîchissement', () => {
    const source = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
    it('n\'appelle plus afficherEtapeV2 (fonction inexistante)', () => {
        expect(source).not.toMatch(/afficherEtapeV2\(/);
    });
    it('expose et référence afficherEtapeWizardV2', () => {
        expect(source).toMatch(/afficherEtapeWizardV2\(wizardState\.etapeActuelle\)/);
    });
});

describe('#133 · le wizard prime — plus de lecture prioritaire de Primo', () => {
    // Le récap et l'écriture lisaient modalitesEvaluation (Primo) EN PRIORITÉ sur
    // les réponses saisies → les valeurs tapées dans l'assistant étaient ignorées.
    // Décision A (Grégoire) : le wizard prime. Ces accès prioritaires sont retirés.
    // (modalites.utiliserCategories / modalites.categories restent : catégories hybrides.)
    const src = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
    it('ne lit plus modalites.nArtefactsPAN / nArtefactsRetenus / minimumAvantCalcul', () => {
        expect(src).not.toMatch(/modalites\.nArtefactsPAN/);
        expect(src).not.toMatch(/modalites\.nArtefactsRetenus/);
        expect(src).not.toMatch(/modalites\.minimumAvantCalcul/);
    });
});
