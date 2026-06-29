import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 T3 (terrain 21 juin) — « Éditer la pratique » (lien d'une colonne du comparateur)
// ouvrait l'assistant NON prérempli : champs obligatoires VIDES (« Nombre d'évaluations
// prévues »…). Cause RÉELLE (≠ wizard, ≠ divergence comparateur/sidebar) : dupliquerPratique
// et deriverMaquette écrivaient la copie sous la SEULE forme `.config` (config résolue),
// sans les champs TOP-LEVEL (type / configuration / seuils / nbEvaluationsPrevues /
// variante / reglesSpeciales) que chargerPratiqueExistante relit pour préremplir.
// Le fix fait naître la copie en forme CANONIQUE (mêmes champs top-level qu'une pratique
// du wizard), sourcés de construireConfigComplete.
//
// BREAK-TEST : retirer les champs top-level ajoutés au littéral `copie` (revenir à la
// forme `.config` seule) fait ROUGIR « la copie porte les champs TOP-LEVEL ».

let store, compteurId, wizardOuvert;

const db = {
    getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
    setSync: (k, v) => { store[k] = v; },
    set: async (k, v) => { store[k] = v; },
    get: async (k, d) => (k in store ? store[k] : d)
};
const cle = (k) => `h2026_${k}`;

// Reflète la VRAIE validation de PratiqueManager.sauvegarderPratique
// (new PratiqueConfigurable(pratique.config) exige id/nom/calcul_note à la racine de .config).
const PratiqueManager = {
    sauvegarderPratique: async (p) => {
        if (!p.config || !p.config.id || !p.config.nom || !p.config.calcul_note) {
            throw new Error('Champ obligatoire manquant (config invalide)');
        }
        store['h2026_pratiquesConfigurables'].push(p);
    },
    supprimerPratique: async () => {}
};
const BibliothequeUI = {
    obtenirAuteurActif: () => 'Grégoire',
    forgerInspireDe: (s) => ({ nom: s.nom, auteur: s.auteur || 'Inconnu', date: '2026-06-21', sourceId: s.id })
};

// Reflète construireConfigComplete : normalise vers une config résolue qui PORTE les
// champs canoniques (type, seuils, nbEvaluationsPrevues, variante, reglesSpeciales,
// configuration, calcul_note, echelle…), quelle que soit la forme d'origine. Les
// sources sont partagées PAR RÉFÉRENCE (comme le vrai résolveur) → le fix doit cloner.
const construireConfigComplete = (p) => {
    const c = p.config || {};
    return {
        id: c.id || p.id,
        nom: c.nom || p.nom,
        type: c.type || p.type || (p.configuration && p.configuration.type),
        calcul_note: c.calcul_note || p.calcul_note || { methode: 'conversion_niveaux' },
        echelle: c.echelle || p.echelle,
        description: p.description,
        etablissement: p.etablissement,
        discipline: p.discipline,
        seuils: c.seuils || p.seuils || (p.configuration && p.configuration.seuils),
        portfolio: c.portfolio || (p.configuration && p.configuration.portfolio),
        objectifs: c.objectifs || (p.configuration && p.configuration.objectifs),
        variante: p.variante || null,
        reglesSpeciales: p.reglesSpeciales || null,
        nbEvaluationsPrevues: p.nbEvaluationsPrevues || null,
        configuration: p.configuration
    };
};

const win = chargerScript('js/pratiques.js', {
    db, cle, PratiqueManager, BibliothequeUI, construireConfigComplete,
    genererIdUnique: (p) => p + (++compteurId),
    ouvrirWizardV2: (mode, id) => { wizardOuvert = { mode, id }; }
});
const dupliquer = win.dupliquerPratique;
const deriver = win.deriverMaquette;

// Souche AU FORMAT WIZARD (forme canonique), champs obligatoires renseignés.
const soucheWizard = () => ({
    id: 'p_souche', nom: 'Standards Bédard', auteur: 'Grégoire',
    etablissement: 'Cégep de Drummondville', discipline: 'Littérature',
    type: 'standards',
    variante: 'eliminatoire',
    calcul_note: { methode: 'conversion_niveaux' },
    seuils: { type: 'pourcentage', va_bien: 75, difficulte: 65, grande_difficulte: 55 },
    nbEvaluationsPrevues: 6,
    reglesSpeciales: ['portfolio'],
    echelle: { type: 'niveaux', niveaux: [{ code: 'A', valeur_pourcentage: 90 }] },
    configuration: {
        type: 'standards', approcheEvaluation: 'par-niveaux',
        echelleId: 'ech1', grilleId: 'gr1',
        portfolio: { utiliser: true, nombreARetenir: 3 }
    }
});

beforeEach(() => {
    store = { 'h2026_pratiquesConfigurables': [soucheWizard()] };
    compteurId = 0;
    wizardOuvert = null;
});

describe('#326 T3 · la copie naît en forme CANONIQUE (préremplissage de l\'édition)', () => {
    it('dupliquer : la copie porte les champs TOP-LEVEL lus par chargerPratiqueExistante', async () => {
        const id = await dupliquer('p_souche', { nom: 'Copie T3', silencieux: true });
        const copie = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(copie).toBeTruthy();
        // Champs relus AU TOP-LEVEL par chargerPratiqueExistante — sans eux → assistant vide.
        expect(copie.type).toBe('standards');
        expect(copie.nbEvaluationsPrevues).toBe(6);
        expect(copie.seuils).toEqual({ type: 'pourcentage', va_bien: 75, difficulte: 65, grande_difficulte: 55 });
        expect(copie.variante).toBe('eliminatoire');
        expect(copie.reglesSpeciales).toEqual(['portfolio']);
        expect(copie.configuration).toBeTruthy();
        expect(copie.configuration.echelleId).toBe('ech1');
        expect(copie.configuration.grilleId).toBe('gr1');
        expect(copie.configuration.portfolio).toEqual({ utiliser: true, nombreARetenir: 3 });
    });

    it('dupliquer : `.config` exécutable reste présent et valide (validation de sauvegarde + moteur)', async () => {
        const id = await dupliquer('p_souche', { nom: 'Copie T3', silencieux: true });
        const copie = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(copie.config).toBeTruthy();
        expect(copie.config.id).toBe(id);
        expect(copie.config.nom).toBe('Copie T3');
        expect(copie.config.calcul_note).toBeTruthy();
    });

    it('copie profonde : modifier la copie ne touche pas la souche (isolation des références)', async () => {
        const id = await dupliquer('p_souche', { nom: 'Copie T3', silencieux: true });
        const copie = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        copie.configuration.portfolio.nombreARetenir = 99;
        copie.seuils.va_bien = 1;
        const souche = store['h2026_pratiquesConfigurables'].find(p => p.id === 'p_souche');
        expect(souche.configuration.portfolio.nombreARetenir).toBe(3);
        expect(souche.seuils.va_bien).toBe(75);
    });

    it('dériver une maquette : même forme canonique (édition à la demande préremplie)', async () => {
        const id = await deriver('p_souche');
        const maquette = store['h2026_pratiquesConfigurables'].find(p => p.id === id);
        expect(maquette.estMaquette).toBe(true);
        expect(maquette.type).toBe('standards');
        expect(maquette.nbEvaluationsPrevues).toBe(6);
        expect(maquette.configuration.echelleId).toBe('ech1');
    });
});
