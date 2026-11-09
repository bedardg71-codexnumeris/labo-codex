import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// DEUX LIENS VERS LA CARTE — point 5 de la consigne du 9 nov. 2026 : « Vérifie qu'une production
// reprise d'un trimestre à l'autre garde un `idOriginal` qui permet de recoudre le lien à la rentrée.
// Dis ce qui se passe sinon. »
//
// Ce banc EXÉCUTE le chemin de la rentrée, sans rien en réécrire :
//   1. la production de l'automne entre dans la bibliothèque (`ajouterALaBibliotheque`) ;
//   2. l'hiver la reprend (`ajouterProductionIndividuelle`) : un id NEUF, et `idOriginal` ;
//   3. la carte de l'automne est reprise à l'hiver (`importerCarteDepuisTrimestre`).
// Ce qu'il établit : (1)+(2) gardent bien de quoi recoudre (`idOriginal` = l'id de l'automne) ; (3)
// ne recoud PAS aujourd'hui — le lien tombe, la ligne garde son dernier texte connu. Recoudre est une
// décision laissée à Grégoire (rapport, étape 2).

const identite = chargerScript('js/identite-item.js');

function bancBibliotheque(magasins) {
    const db = {
        get: async (k) => (k in magasins ? magasins[k] : null),
        set: async (k, v) => { magasins[k] = v; },
        getSync: (k, def) => (k in magasins ? magasins[k] : def),
        setSync: (k, v) => { magasins[k] = v; },
        modifier: async (k, mutateur, defaut = null) => {
            const resultat = await mutateur(k in magasins ? magasins[k] : defaut);
            if (resultat !== undefined) magasins[k] = resultat;
            return resultat;
        }
    };
    const biblio = chargerScript('js/productions-bibliotheque.js', { db, obtenirProfilAuteurActifSync: () => ({ auteur_original: 'Test' }) });
    const ui = chargerScript('js/productions-bibliotheque-ui.js', {
        db, echapperHtml: (s) => String(s == null ? '' : s), cle: (k) => 'h2027_' + k,
        genererIdUnique: (p) => (p || '') + 'NEUF_H27',
        getCleProductions: () => 'h2027_productions',
        obtenirToutesLesProductionsBibliotheque: biblio.obtenirToutesLesProductionsBibliotheque,
        afficherListeProductions: async () => {},
        ajouterAvecGardeIdentite: identite.ajouterAvecGardeIdentite, analyserDoublons: identite.analyserDoublons,
        reunirSources: identite.reunirSources, nommerCopie: identite.nommerCopie,
        getTypeLabel: (t) => String(t || ''), listerTrimestresAvecProductions: () => [],
        obtenirCoursActifId: () => null, obtenirIdentiteCCUtilisateur: () => 'Test', formaterDateCourte: (d) => d,
        notifications: { erreur() {}, succes() {}, info() {} }, uiDialogues: { confirmerAction: async () => true },
        // Le rafraîchissement de la fenêtre APRÈS l'écriture lit d'autres fonctions de BibliothequeUI ;
        // son échec est rattrapé et dit en console (« Erreur lors de l'ajout ») : l'écriture, seule ici
        // en cause, est déjà faite. Mêmes stubs que sentinelle-452.
        BibliothequeUI: {
            genererBadgeSource: () => '', genererIdCourt: (id) => String(id).slice(0, 6), filtrerParModeDemo: (a) => a,
            formaterTitreDemo: (t) => t, formaterTitre: (t) => t, lieeAExemplaire: () => false, estItemDemo: () => false, formaterInspireDe: () => '', fermerModal: () => {},
            renderAvertissementDoublons: () => '', obtenirAuteurActif: () => 'Test',
            forkerItem: (item, prefix) => ({ ...item, id: prefix + 'TEST' }),
            repertoires: { enregistrer() {}, genererZone: () => '', initialiserZone() {} }
        },
        productionEnEdition: null
    });
    return { biblio, ui };
}

describe('Deux liens · point 5 · la production reprise à la rentrée', () => {
    it('la bibliothèque garde l’id de l’automne, la reprise d’hiver le range dans idOriginal', async () => {
        const magasins = { h2027_productions: [] };
        const { biblio, ui } = bancBibliotheque(magasins);
        const automne = { id: 'PROD_A26_ANALYSE', titre: 'Analyse fictive', type: 'travail', objectif: 'Analyser un poème fictif' };

        await biblio.ajouterALaBibliotheque(automne);
        expect(magasins.bibliothequeProductions.map(p => p.id)).toEqual(['PROD_A26_ANALYSE']);

        await ui.ajouterProductionIndividuelle('PROD_A26_ANALYSE');
        const hiver = magasins.h2027_productions[0];
        expect(hiver.id).not.toBe('PROD_A26_ANALYSE');           // un id neuf…
        expect(hiver.idOriginal).toBe('PROD_A26_ANALYSE');         // …et la trace qui permettrait de recoudre
        expect(hiver.objectif).toBe('Analyser un poème fictif');   // l'objectif traverse
    });

    it('aujourd’hui, la reprise de la carte ne recoud pas : le lien tombe, le texte reste', () => {
        const store = {
            cours: [],
            h2027_productions: [{ id: 'PROD_NEUF_H27', idOriginal: 'PROD_A26_ANALYSE', objectif: 'Analyser un poème fictif' }],
            a2026_planification_mindmap: { index: { active: 'carte_1', compteurCartes: 1, cartes: [{ id: 'carte_1', nom: 'Fictive' }] },
                cartes: { carte_1: { compteur: 1, compteurLiens: 0, liens: [], noeuds: [
                    { id: 'L1', type: 'lecon', titre: 'Le sonnet', metadata: { objectifs: [
                        { id: 'o1', texte: 'Analyser un poème fictif', productionId: 'PROD_A26_ANALYSE' }] } }] } } },
            h2027_planification_mindmap: { index: { active: null, compteurCartes: 0, cartes: [] }, cartes: {} }
        };
        const copie = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
        const db = { getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = copie(v); }, get: async () => null, set: async () => {} };
        const win = chargerScript('js/planification-donnees.js', {
            db, cle: (k) => 'h2027_' + k, cleSource: (k, t) => t + '_' + k,
            obtenirCoursActifId: () => null, obtenirTrimestreId: () => 'h2027', obtenirTrimestres: () => []
        });
        win.cle = (k) => 'h2027_' + k;

        const id = win.planificationDonnees.importerCarteDepuisTrimestre('a2026', 'carte_1');
        const objs = store.h2027_planification_mindmap.cartes[id].noeuds[0].metadata.objectifs;
        expect(objs).toEqual([{ id: 'o1', texte: 'Analyser un poème fictif' }]);
    });
});
