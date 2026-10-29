import { describe, it, expect } from 'vitest';
// ↻ #1152, retouche 2 du lot 5 (29 oct. 2026, plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md) : le champ « Séance concernée » (interventionSeance) est retiré.
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

// SENTINELLE #834 — LOT D DU CADRAGE « RENCONTRES » (12 sept. 2026) : UNE INTERVENTION PORTE SON
// CONTEXTE DE NAISSANCE.
//
// Constat de l'audit du 5 sept. (E1) : « les interventions ne portent pas leur groupe-cours » —
// la liste d'un cours mêlait celles d'un autre. Désormais la construction d'une intervention estampille
// `groupeCoursId` (via le point unique `obtenirIdContexteActif`, lot E), et la liste filtre.
// ↻ Lot 5 du cadrage 11 (12 sept. 2026) : `creerIntervention` est retirée (aucun appelant en production) —
// une création passe par « Planifier » (le brouillon, construit en mémoire, estampillé là) puis
// « Enregistrer ». Les trois essais de création suivent ce vrai chemin (`planifierPuisEnregistrer`).
//
// VERROUILLÉ ICI :
//   1. deux groupes-cours, une intervention chacun : chacun ne voit que la sienne ;
//   2. une intervention ANCIENNE (sans `groupeCoursId`) est vue des deux — aucune purge, aucun
//      semis — et prend son contexte au prochain Enregistrer ; une intervention née ailleurs,
//      rouverte et enregistrée ici, GARDE son contexte de naissance ;
//   3. sans contexte actif : tout est visible, et une création porte `null` ;
//   4. (relecture croisée de Cowork, 12 sept.) les deux TRAVERSÉES de mode : une intervention née en
//      mode cours (estampille = coursId) est vue depuis un groupe-cours de ce cours ; une intervention
//      née dans un groupe-cours est vue en mode cours de ce cours — et jamais celle d'un autre cours ;
//      en mode groupe-cours, celle de l'AUTRE groupe du même cours reste cachée.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 au soir, puis le 12 (traversées) — journal en fin de fichier.

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
const champs = () => ({ interventionNiveau: elementDom({ value: '3' }), interventionContexte: elementDom({ value: 'hors-classe' }), interventionTitre: elementDom({ value: 'T' }), interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '2' }), interventionDescription: elementDom({ value: '' }), observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) });
const selecteurs = () => ({ '#listeEtudiantsIntervention input[type="checkbox"]': [], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [], 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] });
const sousGC2 = (store) => { store.infoCours = { id: 'GC2', nom: 'Autre', groupe: '02', _groupeCoursId: 'GC2' }; store.groupeCoursActif = { id: 'GC2', trimestreId: 'test', coursId: 'GC2', groupeNum: '02' }; };
const idsRendus = (b) => (b.elements.listeInterventions.innerHTML.match(/data-action="ouvrirIntervention" data-param="([^"]+)"/g) || []).map(m => m.match(/data-param="([^"]+)"/)[1]).sort();
/** « Planifier » puis « Enregistrer », par les vrais gestes ; rend l'id lu sur le bouton du formulaire. */
function planifierPuisEnregistrer(b) {
    b.win.afficherFormulaireIntervention();
    const html = b.document.getElementById('conteneurPrincipal').innerHTML;
    const id = (html.match(/data-action="sauvegarderPresencesIntervention" data-param="([^"]+)"/) || [])[1];
    expect(id, 'le formulaire de création est rendu').toBeTruthy();
    b.win.sauvegarderPresencesIntervention(id);
    return id;
}
const monterFormulaire = (store) => monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX,
    elements: Object.assign({ conteneurPrincipal: elementDom(), listeInterventions: elementDom() }, champs()), selecteurs: selecteurs() });

describe('#834 lot D · création', () => {
    it('une intervention créée sous GC1 porte groupeCoursId GC1', () => {
        const store = storeBase(); store.test_interventions = [];
        const b = monterFormulaire(store);
        const id = planifierPuisEnregistrer(b);
        expect(store.test_interventions.find(i => i.id === id).groupeCoursId).toBe('GC1');
    });
    it('sans contexte actif, la création porte null — jamais un contexte inventé', () => {
        const store = storeBase(); store.test_interventions = []; store.infoCours = null; store.groupeCoursActif = null;
        const b = monterFormulaire(store);
        const id = planifierPuisEnregistrer(b);
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

describe('#834 lot D · les deux traversées de mode (relecture croisée du 12 sept.)', () => {
    // Un cours C1 à deux groupes (GC1, GC2), un autre cours C9 (GC9).
    const groupesCours = () => [
        { id: 'GC1', coursId: 'C1', trimestreId: 'test', groupeNum: '01' },
        { id: 'GC2', coursId: 'C1', trimestreId: 'test', groupeNum: '02' },
        { id: 'GC9', coursId: 'C9', trimestreId: 'test', groupeNum: '01' },
    ];
    const cinqInterventions = () => [
        intervention({ id: 'I_C1', titre: 'Née en mode cours C1', groupeCoursId: 'C1' }),
        intervention({ id: 'I_GC1', titre: 'Née sous GC1', groupeCoursId: 'GC1' }),
        intervention({ id: 'I_GC2', titre: 'Née sous GC2', groupeCoursId: 'GC2' }),
        intervention({ id: 'I_GC9', titre: 'Née sous GC9 (autre cours)', groupeCoursId: 'GC9' }),
        intervention({ id: 'I_OLD', titre: 'D\'avant le lot' }),
    ];
    const enModeGroupeCours = (store, gcId) => {
        store.infoCours = { id: 'C1', codeCours: '601', groupe: '01', _modeCours: false, _source: 'groupe-cours', _groupeCoursId: gcId };
        store.groupeCoursActif = { modeCours: false, id: gcId, trimestreId: 'test', coursId: 'C1', groupeNum: '01' };
    };
    const enModeCours = (store, coursId) => {
        store.infoCours = { id: coursId, codeCours: '601', groupe: null, _modeCours: true };
        store.groupeCoursActif = { modeCours: true, coursId: coursId, trimestreId: 'test', groupe: null, id: null };
    };
    const monterCinq = (store) => monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, elements: { conteneurPrincipal: elementDom(), listeInterventions: elementDom() } });

    it('née en mode cours → vue depuis GC1 ; celle de GC2 (même cours, autre groupe) reste cachée ; celle de C9 aussi', () => {
        const store = storeBase(); store.test_interventions = cinqInterventions(); store.test_groupesCours = groupesCours();
        enModeGroupeCours(store, 'GC1');
        const b = monterCinq(store);
        b.win.afficherListeInterventions();
        expect(idsRendus(b)).toEqual(['I_C1', 'I_GC1', 'I_OLD']);
    });
    it('née dans un groupe → vue en mode cours de ce cours (GC1 et GC2), jamais celle d\'un autre cours', () => {
        const store = storeBase(); store.test_interventions = cinqInterventions(); store.test_groupesCours = groupesCours();
        enModeCours(store, 'C1');
        const b = monterCinq(store);
        b.win.afficherListeInterventions();
        expect(idsRendus(b)).toEqual(['I_C1', 'I_GC1', 'I_GC2', 'I_OLD']);
        // Et le magasin n'a pas bougé.
        expect(store.test_interventions.map(i => i.id).sort()).toEqual(['I_C1', 'I_GC1', 'I_GC2', 'I_GC9', 'I_OLD']);
    });
    it('en mode cours, une création est estampillée du coursId (granularité du mode, assumée) — et vue ensuite depuis chaque groupe', () => {
        const store = storeBase(); store.test_interventions = []; store.test_groupesCours = groupesCours();
        enModeCours(store, 'C1');
        const b = monterFormulaire(store);
        const id = planifierPuisEnregistrer(b);
        expect(store.test_interventions.find(i => i.id === id).groupeCoursId).toBe('C1');
        enModeGroupeCours(store, 'GC2');
        expect(b.win.interventionsDuContexteActif(store.test_interventions).map(i => i.id)).toEqual([id]);
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
//
// 12 septembre 2026 (traversées, relecture croisée de Cowork) — mutations sur js/interventions.js :
//   6. `_estampillesAcceptees` n'accepte plus le coursId du contexte               → 2 rouges
//   7. les groupes du cours acceptés dans TOUS les modes (GC2 visible depuis GC1)  → 1 rouge
//   8. en mode cours, les groupes d'un AUTRE cours acceptés                        → 1 rouge
// 9/9 verts une fois restauré, empreinte identique.
