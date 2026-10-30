import { describe, it, expect, vi } from 'vitest';
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
        expect(r.nbArtefactsSoumis).toBeUndefined();  // lot 5 des standards sans portfolio : plus relu ; la pratique le garde
        expect(r.nbArtefactsRetenus).toBe(6);       // ← nombreARetenir
        expect(r.minAvantCalculFormatif).toBe(2);   // ← minimumCompletion
        expect(r.reprisesPermises).toBeUndefined();  // #903 : plus relu ; l'objet enregistré le garde (sentinelle-903-909)
        expect(r.utiliserPortfolio).toBeUndefined();  // lot 5 : de même
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

describe('#443 · une pratique legacy « par objectifs » s\'ouvre sur le portfolio', () => {
    // Remplace le bloc « #132 · round-trip d'édition — objectifs » : l'approche
    // est retirée du wizard (décision Grégoire, 10 août), donc il n'y a plus de
    // round-trip à garder. Ce qui reste à garantir est l'inverse — qu'une
    // pratique STOCKÉE qui la porte encore ne casse pas et ne soit pas mutée
    // en douce. Même patron que #396 (registre) et #435 (pratiques-gestion).

    const legacy = () => ({
        id: 'p-obj', nom: 'Ancienne par objectifs', type: 'standards',
        configuration: {
            approcheEvaluation: 'par-objectifs',
            objectifs: { modeCalcul: 'comptage', nbObjectifs: 8,
                comptage: { seuilMaitrise: 70, plafondSiEssentielNonMaitrise: 50 } }
        }
    });

    it('elle s\'ouvre sur l\'approche portfolio, pas sur une approche morte', () => {
        pratiquesStore = [legacy()];
        win.chargerPratiqueExistante('p-obj');
        expect(win.wizardState.reponses.approcheEvaluation).toBe('par-artefacts');
    });

    it('la source stockée n\'est PAS mutée par l\'ouverture (lecture seule)', () => {
        const source = legacy();
        pratiquesStore = [source];
        win.chargerPratiqueExistante('p-obj');
        // Le patron #396/#435 : rien n'est réécrit tant que l'utilisateur ne
        // sauvegarde pas lui-même. Une normalisation qui mute au chargement
        // convertirait une simple consultation en migration silencieuse.
        expect(source.configuration.approcheEvaluation).toBe('par-objectifs');
        expect(source.configuration.objectifs).toBeTruthy();
    });

    it('l\'ouverture le DIT en console (pas de conversion muette)', () => {
        pratiquesStore = [legacy()];
        const journal = [];
        const espion = vi.spyOn(console, 'warn').mockImplementation(m => journal.push(String(m)));
        win.chargerPratiqueExistante('p-obj');
        espion.mockRestore();
        expect(journal.join('\n')).toMatch(/#443/);
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
