/**
 * Fiche 3 du lot « Suivi » (décision de Grégoire, 27 nov. 2026) — LES CRITÈRES AU NOM PRESQUE PAREIL.
 * Dans le suivi, deux noms valent le même critère quand ils ne diffèrent que par les majuscules, les accents ou les
 * espaces. Rien de plus : « Structure » et « Structure du texte » restent deux critères.
 *
 * La règle existe déjà : `cleCritere` (js/profil-etudiant-helpers.js), jumelle de `_normaliserNomCritere` qui sert
 * `trouverCritereDepistage`. Les quatre endroits du suivi qui comparaient le nom brut la réemploient :
 *   1. les critères du graphique d'un profil (`obtenirDonneesCriteres`, js/graphiques-progression.js : l'ensemble) ;
 *   2. la valeur d'une copie dans ce graphique (même fonction : la recherche du critère dans la copie) ;
 *   3. la légende de ce graphique (`_genererGraphiqueCriteresHTML`, js/profil-etudiant-sections-affichage.js) ;
 *   4. les critères cochés d'une intervention rouverte (`ouvrirIntervention`, js/interventions.js).
 * Aucune donnée n'est réécrite.
 *
 *   cd tests && npx vitest run unit/suivi-criteres-nom-presque-pareil.test.js
 *
 * Break-test (27 nov. 2026) : sur le code d'avant, A (la fonction n'existait pas), B, C et D sont rouges.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, elementDom, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const helpers = () => monter(storeBase(), { modules: ['js/profil-etudiant-helpers.js'] }).win;

const copie = (id, date, noms) => ({ id, etudiantDA: '2000001', productionId: 'P_' + id, dateEvaluation: date, echelleId: 'E',
    criteres: noms.map((nom) => ({ critereNom: nom, niveauSelectionne: 'M' })) });

describe('fiche 3 · A — les critères distincts d\'un lot de copies', () => {
    it('majuscules, accents, espaces : un seul critère ; « Structure du texte » reste à part', () => {
        const w = helpers();
        const copies = [
            copie('c1', '2026-09-01', ['structure', 'Enonce', 'Structure du texte']),
            copie('c2', '2026-09-15', ['Structure ', 'Énoncé'])
        ];
        expect(w.criteresDistinctsDesEvaluations(copies)).toEqual(['Structure ', 'Structure du texte', 'Énoncé']);
    });

    it('le nom montré est celui de la copie la plus récente, quel que soit l\'ordre reçu', () => {
        const w = helpers();
        const recente = copie('c2', '2026-10-01', ['Rigueur']);
        const ancienne = copie('c1', '2026-09-01', ['rigueur']);
        expect(w.criteresDistinctsDesEvaluations([recente, ancienne])).toEqual(['Rigueur']);
        expect(w.criteresDistinctsDesEvaluations([ancienne, recente])).toEqual(['Rigueur']);
    });
});

describe('fiche 3 · B — le graphique des critères d\'un profil', () => {
    function donnees(copies) {
        const store = storeBase();
        store.test_evaluationsSauvegardees = copies;
        store.test_productions = copies.map((c) => ({ id: c.productionId, titre: c.productionId }));
        const b = monter(store, {
            modules: ['js/entites/production-diagnostique.js', 'js/profil-etudiant-helpers.js', { chemin: 'js/graphiques-progression.js', internes: ['obtenirDonneesCriteres'] }],
            globaux: { scoreCritereEvaluation: () => 0.8, tableConversionPourEvaluation: () => null, echelleMajoritaireDesEvaluations: () => null }
        });
        return b.interne['graphiques-progression.js'].obtenirDonneesCriteres('2000001');
    }

    it('« Structure » puis « structure » : une ligne, deux points ; « Structure du texte » a la sienne', () => {
        const d = donnees([copie('c1', '2026-09-01', ['Structure', 'Structure du texte']), copie('c2', '2026-09-15', ['structure'])]);
        expect(d.criteresUniques).toEqual(['Structure du texte', 'structure']);
        expect(d.criteres.structure).toEqual([80, 80]);
        expect(d.criteres['Structure du texte']).toEqual([80, null]);
    });
});

describe('fiche 3 · C — la légende du graphique lit les mêmes critères que le graphique', () => {
    it('`_genererGraphiqueCriteresHTML` passe par `criteresDistinctsDesEvaluations`, plus par le nom brut', () => {
        const corps = tranche(readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8'), 'function _genererGraphiqueCriteresHTML(', '\nfunction ');
        expect(corps).toContain('window.criteresDistinctsDesEvaluations(evaluationsAvecCriteres)');
        expect(corps).not.toContain('criteresSet.add(c.critereNom)');
        const graphique = tranche(readFileSync(path.join(RACINE, 'js/graphiques-progression.js'), 'utf8'), 'function obtenirDonneesCriteres(', '\nfunction ');
        expect(graphique).toContain('window.criteresDistinctsDesEvaluations(evaluationsEtudiant)');
    });
});

describe('fiche 3 · D — une intervention rouverte garde ses critères cochés', () => {
    const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [{ id: 'c1', nom: 'Structure', niveauSOLO: 'multistructurel' }, { id: 'c2', nom: 'Structure du texte', niveauSOLO: 'multistructurel' }, { id: 'c3', nom: 'Énoncé', niveauSOLO: 'multistructurel' }] };
    const intervention = (criteresCibles) => ({ id: 'I_F3', titre: 'Atelier', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2,
        contexte: 'en-classe', description: '', etudiants: ['2000001'], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles,
        objectifVise: '', statut: 'en-cours', bilan: null, jamaisSauvegardee: false });

    function cochees(criteresCibles) {
        const store = storeBase();
        store.test_interventions = [intervention(criteresCibles)];
        const avant = JSON.stringify(store.test_interventions);
        const conteneur = elementDom();
        const b = monter(store, { modules: ['js/interventions.js'], elements: { conteneurPrincipal: conteneur }, globaux: {
            determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
            calculerMoyennesCriteres: () => ({}), obtenirGrilleReferenceDepistage: () => GRILLE, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
            calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t } });
        b.win.ouvrirIntervention('I_F3', {});
        expect(JSON.stringify(store.test_interventions), 'rouvrir ne réécrit rien').toBe(avant);
        return [...conteneur.innerHTML.matchAll(/class="critere-cible-cb" value="([^"]*)" (checked)?/g)].filter((m) => m[2]).map((m) => m[1]);
    }

    it('enregistrée « structure » et « enonce » : « Structure » et « Énoncé » sont cochés, « Structure du texte » ne l\'est pas', () => {
        expect(cochees(['structure', 'enonce'])).toEqual(['Structure', 'Énoncé']);
    });

    it('enregistrée « Structure » : « Structure du texte » n\'est pas coché pour autant', () => {
        expect(cochees(['Structure'])).toEqual(['Structure']);
    });
});
