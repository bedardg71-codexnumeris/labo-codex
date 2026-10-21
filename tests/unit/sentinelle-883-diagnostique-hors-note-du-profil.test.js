import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #883 (16 sept. 2026) — « Le pdf indique 1 note reçue sur les 2 meilleures productions, alors que la
// pratique de notation indique qu'il y a 4 meilleures productions. D'où vient la lecture du chiffre "2" ? »
//
// Mesuré sur A2026 (sonde `scripts/diagnostic-evaluees-vs-retenues.js`) : « Portrait de lecteur/lectrice »,
// artefact COCHÉ « Travail diagnostique — ne compte dans aucun calcul » (#790), évalué pour 28 élèves sur 28.
// Les familles de `js/pratiques/` l'écartent (porte 1 de #790). `calculerDetailsNoteFinale` — le second
// système, celui du profil et du PDF remis à l'élève — lisait les productions SANS filtre : la copie
// diagnostique entrait dans « N évaluées », réduisait le déficit du plafonnement, et entrait dans la
// note en sélection non hybride.

const PRODUCTIONS = [
    { id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'A2', titre: 'Artefact 2', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'A9', titre: 'Artefact 9', type: 'artefact-portfolio', categorie: 'obligatoire' },
    { id: 'PORTRAIT', titre: 'Portrait de lecteur/lectrice', type: 'artefact-portfolio', diagnostique: true },
    { id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 100 }
];

const EVAL = (id, productionId, note) => ({
    id, etudiantDA: '111', productionId, noteFinale: note, niveauFinal: 'D', verrouillee: true, statutIntegrite: 'recevable'
});

function monter({ hybride, diagnostique = true, minimum = 3 }) {
    const productions = PRODUCTIONS.map(p => (p.id === 'PORTRAIT' ? Object.assign({}, p, { diagnostique }) : p));
    const evaluations = [EVAL('E1', 'A1', 60), EVAL('EP', 'PORTRAIT', 95)];
    const config = {
        portfolio: { methodeSelection: 'meilleurs', nombreARetenir: 4, minimumCompletion: minimum,
            reglesConformite: { actif: true, seuils: [] } },
        categories: hybride
            ? { actif: true, selection: { nombreARetenir: 4, ponderation: 65 }, obligatoires: { ponderation: 35 } }
            : null
    };
    const store = { test_evaluationsSauvegardees: evaluations, test_productions: productions, test_pratiquesConfigurables: [] };
    const globaux = {
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync() {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (k) => store['test_' + k] || [],
        obtenirTypePratiqueActive: () => 'standards',
        obtenirPratiqueActiveGroupeCours: () => 'P1',
        // Lot N1a (21 sept. 2026) : le chemin riche lit la DÉSIGNATION de la pratique active (id, famille).
        designerPratiqueActive: () => ({ etat: 'ok', idBrut: 'P1', id: 'P1', donnees: null, famille: 'standards' }),
        obtenirConfigPratiqueActive: () => config,
        obtenirConfigCategories: () => config.categories
    };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/entites/production-diagnostique.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: function () {} }, globaux), win);
    chargerScript('js/profil-etudiant-actions.js', globaux, win);
    return win.calculerDetailsNoteFinale('111');
}

describe('#883 — une production diagnostique ne compte pas dans le détail de la note du profil et du PDF', () => {

    it('HYBRIDE (le cas mesuré) : la copie diagnostique n\'est pas « évaluée »', () => {
        const d = monter({ hybride: true });
        expect(d.portfolio.nombreEvalues).toBe(1);
        expect(d.portfolio.artefactsRetenus.map(a => a.productionId)).toEqual(['A1']);
    });

    it('NON HYBRIDE : la copie diagnostique (95 %) n\'entre pas dans la note', () => {
        const d = monter({ hybride: false });
        expect(d.portfolio.artefactsRetenus.map(a => a.productionId)).toEqual(['A1']);
        expect(d.portfolio.nombreEvalues).toBe(1);
    });

    it('PDF — une production diagnostique non encore évaluée n\'est pas annoncée « à venir »', () => {
        const store = { productions: PRODUCTIONS, evaluationsSauvegardees: [EVAL('E1', 'A1', 60)] };
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/entites/production-diagnostique.js', {}, win);
        chargerScript('js/synthese-retroaction-data.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null) },
            cle: (k) => 'test_' + k,
            obtenirEchelleResolue: () => null,
            obtenirDonneesSelonMode: (k) => store[k] || [],
            obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
            obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
            travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] },
            obtenirPreference: () => null,
            obtenirConfigPratiqueActive: () => ({ configuration: {} }),
            calculerDetailsNoteFinale: () => ({ portfolio: { methodeSelection: 'meilleurs', moyenne: 60, nombreEvalues: 1,
                artefactsRetenus: [{ productionId: 'A1', niveau: 'D', note: 60 }] } })
        }, win);
        const fb = win.syntheseRetroactionData.construireFeedback(
            { id: 'E1', etudiantDA: '111', productionId: 'A1', grilleId: 'G', niveauFinal: 'D', noteFinale: 60, criteres: [] }, { id: 'F' }, null);
        expect(fb.bilan.note.avenir.map(a => a.titre)).toEqual(['Artefact 2', 'Artefact 9']);
    });

    // Mots arrêtés par Grégoire (16 sept.) pour la ligne « Sélection » du PDF.
    const ligneSelection = (retenus, nombreEvalues) => {
        const productions = [1, 2, 3, 4, 5, 6].map(i => ({ id: 'S' + i, titre: 'Artefact ' + i, type: 'artefact-portfolio', categorie: 'selection' }));
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/synthese-retroaction-data.js', {
            db: { getSync: (k, d) => (d !== undefined ? d : null) }, cle: (k) => 'test_' + k,
            obtenirEchelleResolue: () => null,
            obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : []),
            obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }), obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
            travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] }, obtenirPreference: () => null,
            obtenirConfigPratiqueActive: () => ({ configuration: { categories: {
                selection: { nombreARetenir: 4, ponderation: 65 }, obligatoires: { ponderation: 35 } } } }),
            calculerDetailsNoteFinale: () => ({ portfolio: { methodeSelection: 'hybride', moyenne: 70, nombreEvalues,
                artefactsRetenus: productions.slice(0, retenus).map(p => ({ productionId: p.id, niveau: 'M', note: 70 })) } })
        }, win);
        chargerScript('js/synthese-retroaction-rendu.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, cle: (k) => k }, win);
        const fb = win.syntheseRetroactionData.construireFeedback(
            { id: 'E', etudiantDA: '111', productionId: 'S1', grilleId: 'G', niveauFinal: 'M', noteFinale: 70, criteres: [] }, { id: 'F' }, null);
        const texte = win.syntheseRetroactionRendu.rendreSyntheseHTML(fb).replace(/<[^>]+>/g, ' ');
        return (texte.match(/Sélection \([^:]*:/) || [''])[0];
    };

    it('PDF — « 1 retenue sur 4 possibles » : le nombre de la pratique, pas le nombre retenu', () => {
        expect(ligneSelection(1, 1)).toBe('Sélection (1 retenue sur 4 possibles) (65\u00A0%) :');
    });

    it('PDF — « parmi N évaluées » seulement quand il y en a plus que de retenues', () => {
        expect(ligneSelection(4, 6)).toBe('Sélection (4 retenues sur 4 possibles, parmi 6 évaluées) (65\u00A0%) :');
    });

    it('TÉMOIN — décochée, la même production revient : évaluée, et retenue en non hybride', () => {
        const h = monter({ hybride: true, diagnostique: false });
        expect(h.portfolio.nombreEvalues).toBe(2);
        const n = monter({ hybride: false, diagnostique: false });
        expect(n.portfolio.artefactsRetenus.map(a => a.productionId).sort()).toEqual(['A1', 'PORTRAIT']);
    });
});
