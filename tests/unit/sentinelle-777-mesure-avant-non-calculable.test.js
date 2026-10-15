/**
 * SENTINELLE #777 (15 oct. 2026) — LA MESURE « AVANT » D'UNE INTERVENTION N'ÉCRIT PLUS 0 POUR « NON CALCULABLE ».
 *
 * `calculerTousLesIndices` rend `P: 0` avec `noteConstructible: false` quand la note du cours ne se construit
 * pas encore (#394, #775). La fiche d'intervention recopiait ce 0 dans `snapshotAvant[da].P` : un zéro
 * indistinguable d'une vraie note nulle. Il s'écrit maintenant `null`. Le stock déjà écrit n'est pas touché.
 *
 * Mesuré le 15 oct. : c'est le SEUL écrivain vivant d'une mesure d'intervention (`capturerSnapshotIntervention`
 * et `mettreAJourSnapshotIntervention`, snapshots.js, n'ont aucun appelant) ; les captures hebdomadaires
 * écrivent déjà `null` depuis #716.
 *
 * Break-test attendu : rendre `indicesSnap.P` sans regarder `noteConstructible` → le premier cas rougit (0).
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const DA = '2000001';

function enregistrer(indices) {
    const store = storeBase();
    store.test_interventions = [{ id: 'I', titre: 'T', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'hors-classe',
        description: '', etudiants: [], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null,
        statut: 'en-cours', groupeCoursId: 'GC1' }];
    const caseCochee = elementDom({ value: DA, checked: true });
    const b = monter(store, { modules: ['js/interventions.js'],
        globaux: {
            determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }),
            calculerTousLesIndices: () => indices,
            calculerMoyennesCriteres: () => ({ structure: 0.7 }),
            obtenirGrilleReferenceDepistage: () => ({ criteres: [] }), libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
            calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
        },
        elements: { conteneurPrincipal: elementDom(), conteneurRencontres: elementDom(), listeInterventions: elementDom(), listeRencontres: elementDom(),
            observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) },
        selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': [caseCochee], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [caseCochee],
            'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] } });
    b.win.sauvegarderPresencesIntervention('I');
    return b.store.test_interventions[0].snapshotAvant[DA];
}

describe('#777 — la mesure « avant » d\'une intervention', () => {
    it('note NON CONSTRUCTIBLE : P s\'écrit null, pas 0', () => {
        expect(enregistrer({ A: 90, C: 100, P: 0, noteConstructible: false }).P).toBeNull();
    });

    it('TÉMOIN — note constructible : P s\'écrit tel quel, un vrai 0 compris', () => {
        expect(enregistrer({ A: 90, C: 100, P: 72, noteConstructible: true }).P).toBe(72);
        expect(enregistrer({ A: 90, C: 100, P: 0, noteConstructible: true }).P).toBe(0);
    });
});
