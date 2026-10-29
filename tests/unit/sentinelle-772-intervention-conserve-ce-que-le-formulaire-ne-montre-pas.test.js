/**
 * SENTINELLE #772 — ENREGISTRER UNE INTERVENTION NE DÉTRUIT PAS CE QUE LE FORMULAIRE N'A PAS MONTRÉ.
 *
 * Audit des sous-onglets de Suivi, 6 septembre 2026, CM-6. `sauvegarderPresencesIntervention` (js/interventions.js:1221)
 * reconstruisait `notesIndividuelles` à partir des seuls élèves cochés (décocher un absent détruisait sa note) et
 * réécrivait `etudiants` avec les seuls cochés du groupe-cours actif : une intervention planifiée sous GC2, rouverte
 * sous GC1 (le formulaire ne construit des cases que pour GC1) et enregistrée sans rien toucher perdait tous ses
 * participants et leurs notes. Mesures I-2 et I-3 du banc d'audit.
 *
 * Règle du garde-fou : ce que le formulaire a MONTRÉ (une case, un champ de note) s'écrit tel qu'il est ; ce qu'il n'a
 * pas montré (un DA sans case) reste tel qu'il était. La règle de Grégoire « une intervention appartient à un
 * groupe-cours » n'est PAS implémentée ici (mesure rapportée, ligne à inscrire).
 *
 * Break-test attendu : remettre `notesIndividuelles = {}` sur les seuls cochés → cas 1 rouge ; remettre
 * `marquerPresences(id, dasSelectionnes)` → cas 2 rouge.
 */
// ↻ #1152, retouche 2 du lot 5 (29 oct. 2026, plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md) : le champ « Séance concernée » (interventionSeance) est retiré.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const lireSource = () => readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'js', 'interventions.js'), 'utf8');

const GLOBAUX = {
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({ structure: 0.7 }), obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
    calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
};
const champs = (valeurs) => Object.assign({ interventionNiveau: elementDom({ value: '2' }), interventionContexte: elementDom({ value: 'rattrapage' }), interventionTitre: elementDom({ value: 'T' }), interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '2' }), interventionDescription: elementDom({ value: '' }), observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) }, valeurs);
const intervention = (extra) => Object.assign({ id: 'I1', titre: 'T', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'rattrapage', description: '', etudiants: [], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }, extra);

describe('#772 · enregistrer une intervention', () => {
    it('décocher Bruno (absent) garde sa note ; vider le champ affiché d\'Alice efface la sienne ; Chloé cochée avec une note la reçoit', () => {
        const store = storeBase();
        store.test_interventions = [intervention({ etudiants: ['2000001', '2000002'], notesIndividuelles: { 2000001: 'Alice progresse.', 2000002: 'Bruno absent, à revoir.' } })];
        const cases = [elementDom({ value: '2000001', checked: true }), elementDom({ value: '2000002', checked: false }), elementDom({ value: '2000003', checked: true })];
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX,
            elements: champs({ 'note-2000001': elementDom({ value: '' }), 'note-2000002': elementDom({ value: 'Bruno absent, à revoir.' }), 'note-2000003': elementDom({ value: 'Chloé : plan convenu.' }) }),
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': cases, '#listeEtudiantsIntervention input[type="checkbox"]:checked': cases.filter(c => c.checked), 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] } });
        b.win.sauvegarderPresencesIntervention('I1');
        const i = store.test_interventions[0];
        expect(i.etudiants.sort()).toEqual(['2000001', '2000003']);
        expect(i.notesIndividuelles).toEqual({ 2000002: 'Bruno absent, à revoir.', 2000003: 'Chloé : plan convenu.' });
    });

    it('une intervention de GC2 rouverte sous GC1 et enregistrée sans rien toucher garde Dario et sa note', () => {
        const store = storeBase();
        store.test_interventions = [intervention({ id: 'I2', niveauRai: 3, contexte: 'hors-classe', type: 'individuel', etudiants: ['2000004'], notesIndividuelles: { 2000004: 'Plan de travail convenu.' } })];
        const cases = ['2000001', '2000002', '2000003'].map(da => elementDom({ value: da, checked: false }));   // les cases de GC1, aucune cochée ; Dario n'a pas de case
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX,
            elements: champs({ interventionNiveau: elementDom({ value: '3' }), interventionContexte: elementDom({ value: 'hors-classe' }) }),
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': cases, '#listeEtudiantsIntervention input[type="checkbox"]:checked': [], 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] } });
        b.win.sauvegarderPresencesIntervention('I2');
        const i = store.test_interventions[0];
        expect(i.etudiants).toEqual(['2000004']);
        expect(i.notesIndividuelles).toEqual({ 2000004: 'Plan de travail convenu.' });
        // Et en cochant Alice sous GC1, Dario reste.
        cases[0].checked = true;
        b.selecteurs['#listeEtudiantsIntervention input[type="checkbox"]:checked'] = [cases[0]];
        b.win.sauvegarderPresencesIntervention('I2');
        expect(store.test_interventions[0].etudiants.sort()).toEqual(['2000001', '2000004']);
    });
});

describe('#1152, retouche 2 du lot 5 — « Séance concernée » retirée (décision de Grégoire, 29 oct. 2026, 6 h 46)', () => {
    it('le formulaire d\'un rattrapage n\'a plus de « Séance concernée » ; « Gestion des absences » et sa phrase restent', () => {
        const store = storeBase();
        store.test_interventions = [intervention({ seanceConcernee: '2026-08-30' })];
        const conteneur = elementDom({ id: 'conteneurPrincipal' });
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, elements: { conteneurPrincipal: conteneur } });
        b.win.ouvrirIntervention('I1', {});
        const html = conteneur.innerHTML;
        expect(html).toContain('Gestion des absences');
        expect(html).toContain('pour cette séance de rattrapage');
        expect(html).not.toContain('interventionSeance');
        expect(html).not.toMatch(/S(é|\\u00e9)ance concern/);
        expect(html).not.toContain('2026-08-30');
    });

    it('une intervention qui portait la clé la garde après enregistrement ; une neuve ne l\'écrit plus', () => {
        const store = storeBase();
        store.test_interventions = [intervention({ seanceConcernee: '2026-08-30' })];
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, elements: champs({}),
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': [], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [] } });
        b.win.sauvegarderPresencesIntervention('I1');
        const i = store.test_interventions[0];
        expect(i.seanceConcernee).toBe('2026-08-30');
        expect(i.marquerNonParticipantsMotives).toBe(true);
        expect(typeof b.win.obtenirAbsencesMotiveesParDate).toBe('undefined');
        expect(lireSource()).not.toMatch(/seanceConcernee:\s*data\./);
    });
});

