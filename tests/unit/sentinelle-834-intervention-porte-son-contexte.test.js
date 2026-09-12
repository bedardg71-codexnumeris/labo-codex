import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

// SENTINELLE #834 — LOT D DU CADRAGE « RENCONTRES » (12 sept. 2026) : UNE INTERVENTION PORTE SON
// CONTEXTE DE NAISSANCE.
//
// Constat de l'audit du 5 sept. (E1) : « les interventions ne portent pas leur groupe-cours » —
// la liste d'un cours mêlait celles d'un autre. Désormais `creerIntervention` estampille
// `groupeCoursId` (via le point unique `obtenirIdContexteActif`, lot E), et la liste filtre.
//
// VERROUILLÉ ICI :
//   1. deux groupes-cours, une intervention chacun : chacun ne voit que la sienne ;
//   2. une intervention ANCIENNE (sans `groupeCoursId`) est vue des deux — aucune purge, aucun
//      semis — et prend son contexte au prochain Enregistrer ; une intervention née ailleurs,
//      rouverte et enregistrée ici, GARDE son contexte de naissance ;
//   3. sans contexte actif : tout est visible, et une création porte `null`.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 au soir — journal en fin de fichier.

const GLOBAUX = {
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({ structure: 0.7 }), obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
    calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t, dateLocaleYMD: () => '2026-09-11'
};
const intervention = (extra) => Object.assign({ id: 'I', titre: 'T', date: '2026-09-01', heure: '', duree: 2, type: 'individuel', niveauRai: 3, contexte: 'hors-classe', description: '', etudiants: [], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }, extra);
const troisInterventions = () => [
    intervention({ id: 'I_GC1', titre: 'Née sous GC1', groupeCoursId: 'GC1' }),
    intervention({ id: 'I_GC2', titre: 'Née sous GC2', groupeCoursId: 'GC2' }),
    intervention({ id: 'I_OLD', titre: 'D\'avant le lot' }),
];
const champs = () => ({ interventionNiveau: elementDom({ value: '3' }), interventionContexte: elementDom({ value: 'hors-classe' }), interventionTitre: elementDom({ value: 'T' }), interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '2' }), interventionDescription: elementDom({ value: '' }), interventionSeance: elementDom({ value: '' }), observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) });
const selecteurs = () => ({ '#listeEtudiantsIntervention input[type="checkbox"]': [], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [], 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] });
const sousGC2 = (store) => { store.infoCours = { id: 'GC2', nom: 'Autre', groupe: '02', _groupeCoursId: 'GC2' }; store.groupeCoursActif = { id: 'GC2', trimestreId: 'test', coursId: 'GC2', groupeNum: '02' }; };
const idsRendus = (b) => (b.elements.listeInterventions.innerHTML.match(/data-action="ouvrirIntervention" data-param="([^"]+)"/g) || []).map(m => m.match(/data-param="([^"]+)"/)[1]).sort();

describe('#834 lot D · création', () => {
    it('une intervention créée sous GC1 porte groupeCoursId GC1', () => {
        const store = storeBase(); store.test_interventions = [];
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX });
        const id = b.win.creerIntervention({ date: '2026-09-01', titre: 'X' });
        expect(store.test_interventions.find(i => i.id === id).groupeCoursId).toBe('GC1');
    });
    it('sans contexte actif, la création porte null — jamais un contexte inventé', () => {
        const store = storeBase(); store.test_interventions = []; store.infoCours = null; store.groupeCoursActif = null;
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX });
        const id = b.win.creerIntervention({ date: '2026-09-01', titre: 'X' });
        expect(store.test_interventions.find(i => i.id === id).groupeCoursId).toBeNull();
    });
});

describe('#834 lot D · la liste ne mêle plus les groupes-cours', () => {
    it('sous GC1 : la sienne et l\'ancienne ; sous GC2 : la sienne et l\'ancienne ; jamais celle de l\'autre', () => {
        const store = storeBase(); store.test_interventions = troisInterventions();
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, elements: { conteneurPrincipal: elementDom(), listeInterventions: elementDom() } });
        b.win.afficherListeInterventions();
        expect(idsRendus(b)).toEqual(['I_GC1', 'I_OLD']);
        sousGC2(store);
        b.win.afficherListeInterventions();
        expect(idsRendus(b)).toEqual(['I_GC2', 'I_OLD']);
        // Le magasin n'a pas bougé : trois interventions, aucune purge, aucun semis.
        expect(store.test_interventions.map(i => i.id).sort()).toEqual(['I_GC1', 'I_GC2', 'I_OLD']);
        expect(store.test_interventions.find(i => i.id === 'I_OLD').groupeCoursId).toBeUndefined();
    });
    it('sans contexte actif : tout est visible', () => {
        const store = storeBase(); store.test_interventions = troisInterventions(); store.infoCours = null; store.groupeCoursActif = null;
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, elements: { conteneurPrincipal: elementDom(), listeInterventions: elementDom() } });
        b.win.afficherListeInterventions();
        expect(idsRendus(b)).toEqual(['I_GC1', 'I_GC2', 'I_OLD']);
    });
    it('le filtre est une fonction exportée, pure sur sa liste', () => {
        const store = storeBase(); store.test_interventions = [];
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX });
        expect(b.win.interventionsDuContexteActif(troisInterventions()).map(i => i.id)).toEqual(['I_GC1', 'I_OLD']);
    });
});

describe('#834 lot D · l\'estampille au prochain Enregistrer', () => {
    it('une intervention d\'avant le lot, enregistrée sous GC1, prend GC1 ; celle née sous GC2 garde GC2', () => {
        const store = storeBase(); store.test_interventions = troisInterventions();
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, elements: Object.assign({ conteneurPrincipal: elementDom(), listeInterventions: elementDom() }, champs()), selecteurs: selecteurs() });
        b.win.sauvegarderPresencesIntervention('I_OLD');
        expect(store.test_interventions.find(i => i.id === 'I_OLD').groupeCoursId).toBe('GC1');
        b.win.sauvegarderPresencesIntervention('I_GC2');
        expect(store.test_interventions.find(i => i.id === 'I_GC2').groupeCoursId).toBe('GC2');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 11 septembre 2026, 21 h (Toronto). Mutations sur js/interventions.js,
// suite relancée, fichier restauré à empreinte SHA-256 identique.
//   1. création : `groupeCoursId` posé à null au lieu du contexte           → 1 rouge
//   2. liste : `interventionsDuContexteActif` rend tout                     → 2 rouges
//   3. liste : une intervention sans contexte n'est plus vue                → 2 rouges
//   4. enregistrer : l'estampille écrase le contexte de naissance (`if (true)`) → 1 rouge
//   5. enregistrer : plus d'estampille au prochain Enregistrer              → 1 rouge
// 6/6 verts une fois restauré.
