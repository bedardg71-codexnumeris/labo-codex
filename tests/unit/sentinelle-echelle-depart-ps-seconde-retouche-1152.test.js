import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { monter, storeBase, chargerAvecInterne, RACINE } from './_helpers/bac-suivi.js';

// SENTINELLE — « PS – Préstructurel » dans tout ce qui lit l'Échelle de départ (27 oct. 2026, seconde retouche).
// VERDICT-RELECTURE-2026-10-27-aide-lot-2b-retouche.md, « La seconde retouche », points 1 à 5 : PS entrait dans
// l'échelle, pas encore dans tout ce qui la lit (« ce n'est pas une trouvaille, c'est le lot qui n'est pas fini »).
//   1. l'export anonymisé compte les copies PS (`nb_PS`) ;
//   2. la « Cartouche de départ » porte le niveau PS et les quatre commentaires dans les mots de Grégoire (27 oct.,
//      18 h 38) ; une cartouche déjà semée garde les siens ;
//   3. le message « en difficulté » du tableau de bord compte PS et I ensemble ;
//   4. une copie à 0 % s'annonce « 0 % », pas « --% », à la suppression ;
//   5. PS a sa couleur dans les graphiques de progression et dans l'aperçu PDF.
// Données FICTIVES.

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

function dbDepuisStore(store) {
    return {
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; }, setSync: (c, v) => { store[c] = v; }
    };
}

describe('#1152 · 1 — l\'export anonymisé compte les copies PS', () => {
    async function exporter() {
        const store = storeBase();
        store.trimestres = [{ id: 'test', nom: 'Automne banc', session: 'A', annee: 2026, actif: true }];
        store.cours = [{ id: 'GC1', sigle: '601-101', titre: 'Cours banc', groupe: '01', actif: true }];
        store.test_groupeEtudiants = [{ da: '1152101', nom: 'Fictif-Banc', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' }];
        store.test_grillesTemplates = [{ id: 'G1', nom: 'Grille banc', criteres: [{ id: 'c1', nom: 'Structure' }] }];
        store.test_productions = [{ id: 'P1', titre: 'Travail banc', type: 'travail' }, { id: 'P2', titre: 'Travail banc 2', type: 'travail' }];
        store.test_evaluationsSauvegardees = [
            { id: 'E1', etudiantDA: '1152101', productionId: 'P1', criteres: [{ critereNom: 'Structure', niveauSelectionne: 'PS' }] },
            { id: 'E2', etudiantDA: '1152101', productionId: 'P2', criteres: [{ critereNom: 'Structure', niveauSelectionne: 'M' }] }
        ];
        store.test_snapshots = { hebdomadaires: [], interventions: [] };
        const blobs = [];
        function Blob(parts) { blobs.push(parts.join('')); }
        const banc = monter(store, { modules: ['js/indices.js', 'js/trimestres.js'],
            globaux: { Blob, URL: { createObjectURL: () => 'blob:banc', revokeObjectURL() {} }, crypto: globalThis.crypto, TextEncoder } });
        try {
            const r = await banc.win.exporterFormatRecherche({ cleSecrete: 'CLE-DE-BANC-0123456789abcdefghij' });
            expect(r, JSON.stringify(r)).toMatchObject({ success: true });
            return JSON.parse(blobs[0]);
        } finally {
            banc.restaurerHorloge();
        }
    }

    it('une copie PS a son compte ; la somme des comptes égale nb_evaluations ; le taux de maîtrise reste (M + E) / total', async () => {
        const fichier = await exporter();
        const [ligne] = fichier.calculs.performance_par_critere;
        expect(ligne.structure).toEqual({ nb_evaluations: 2, nb_PS: 1, nb_I: 0, nb_D: 0, nb_M: 1, nb_E: 0, taux_maitrise: 0.5 });
        expect(fichier.meta.version_format).toBe('1.3');
    });
});

describe('#1152 · 2 — la Cartouche de départ porte PS, dans les mots de Grégoire', () => {
    const MOTS = {
        CR_COMPREHENSION_PS: 'La réponse ne traite pas encore du sujet demandé. Relis la consigne et repère ce qu\'elle te demande.',
        CR_APPLICATION_PS: 'Les connaissances ne sont pas encore appliquées à la tâche demandée. Repars d\'un exemple vu en classe.',
        CR_ANALYSE_PS: 'Aucun élément de l\'analyse demandée n\'est encore présent. Commence par nommer les éléments à examiner.',
        CR_SYNTHESE_PS: 'La synthèse demandée n\'est pas encore amorcée. Commence par dégager l\'idée principale.'
    };

    async function semer(store) {
        store.a2026_grillesTemplates = [{ id: 'GRILLE_GENERIQUE', nom: 'Grille de départ', criteres: [] }];
        const win = { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false };
        await chargerScript('js/cartouches.js', { db: dbDepuisStore(store), cle: win.cle }, win).assurerCartoucheDeDepart();
        return store.a2026_cartouches_GRILLE_GENERIQUE;
    }

    it('un trimestre neuf : cinq niveaux, PS en tête ; vingt commentaires, dont les quatre PS mot pour mot', async () => {
        const [cartouche] = await semer({});
        expect(cartouche.niveaux.map((n) => n.code)).toEqual(['PS', 'I', 'D', 'M', 'E']);
        expect(cartouche.niveaux[0]).toEqual({ code: 'PS', nom: 'Préstructurel' });
        expect(Object.keys(cartouche.commentaires)).toHaveLength(20);
        for (const [cle, mots] of Object.entries(MOTS)) expect(cartouche.commentaires[cle], cle).toBe(mots);
        // Chaque critère × niveau a son commentaire (la matrice est pleine).
        for (const c of cartouche.criteres) for (const n of cartouche.niveaux) expect(cartouche.commentaires[c.id + '_' + n.code], c.id + '_' + n.code).toBeTruthy();
    });

    it('TARIR, PAS RÉPARER : une cartouche de départ déjà semée garde ses niveaux et ses seize commentaires', async () => {
        const ancienne = { id: 'CART_GENERIQUE', nom: 'Cartouche de départ', niveaux: [{ code: 'I' }, { code: 'D' }, { code: 'M' }, { code: 'E' }],
            commentaires: Object.fromEntries(Array.from({ length: 16 }, (_, i) => ['K' + i, 'v' + i])) };
        const store = { a2026_cartouches_GRILLE_GENERIQUE: [JSON.parse(JSON.stringify(ancienne))] };
        const apres = await semer(store);
        expect(apres).toEqual([ancienne]);
    });
});

describe('#1152 · 3 — le message « en difficulté » du tableau de bord compte PS et I ensemble', () => {
    const ECHELLE = { niveaux: [
        { code: '0', min: 0, max: 0 }, { code: 'PS', min: 0, max: 39.99 }, { code: 'I', min: 40, max: 64.99 },
        { code: 'D', min: 65, max: 74.99 }, { code: 'M', min: 75, max: 84.99 }, { code: 'E', min: 85, max: 100 }] };

    function interpreter(etudiants) {
        const win = { addEventListener() {}, removeEventListener() {}, pluriel: (n, s, p) => (n > 1 ? p : s) };
        const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} };
        chargerAvecInterne('js/tableau-bord-apercu.js', { db, cle: (k) => 'test_' + k, formaterPourcentage: (v) => v + ' %',
            document: { addEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], readyState: 'complete' } },
        win, ['genererInterpretationPerformance']);
        return win.__audit['tableau-bord-apercu.js'].genererInterpretationPerformance(etudiants, ECHELLE);
    }

    it('deux étudiant·es PS et un I : « 3 étudiant·es en difficulté »', () => {
        const msg = interpreter([{ da: 'a', valeur: 0.10 }, { da: 'b', valeur: 0.30 }, { da: 'c', valeur: 0.50 }, { da: 'd', valeur: 0.80 }]);
        expect(msg).toMatch(/3 étudiant·es en difficulté/);
    });

    it('un·e seul·e étudiant·e, PS : le message le nomme encore (il y était, au niveau I, avant PS)', () => {
        expect(interpreter([{ da: 'a', valeur: 0.20 }])).toMatch(/1 étudiant·e en difficulté/);
    });
});

describe('#1152 · 4 — à la suppression d\'une copie, une note de 0 s\'annonce « 0 % »', () => {
    it('l\'évaluation associée vaut 0 : le message dit 0 %, pas --%', async () => {
        // `confirmer: false` : la question est posée, puis refusée — rien n'est effacé.
        const banc = monter(storeBase(), { confirmer: false, modules: ['js/note-pourcentage.js', 'js/travaux-ui.js'], globaux: {
            travauxStockage: { obtenirFichierParId: () => ({ id: 'F1', nom: 'copie-fictive.pdf' }) },
            travauxResolution: { trouverEvaluationPourFichier: () => ({ id: 'E1', noteFinale: 0, note: null }) }
        } });
        try {
            await banc.win.travauxUI.supprimerFichierImporte('F1');
        } finally {
            banc.restaurerHorloge();
        }
        expect(banc.confirmations).toHaveLength(1);
        expect(banc.confirmations[0]).toMatch(/évaluation associée \(0\s%\)/);
        expect(banc.confirmations[0]).not.toMatch(/--%/);
    });
});

describe('#1152 · 5 — la couleur de PS', () => {
    it('les graphiques de progression lisent --gris-moyen (plus le gris de repli #888888)', () => {
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerAvecInterne('js/graphiques-progression.js', { db: { getSync: (k, d) => d }, cle: (k) => k,
            COULEURS: { indices: { A: '#1976D2', C: '#FF6B35', P: '#4CAF50' } },
            document: { addEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], readyState: 'complete' } },
        win, ['hexVersRgba']);
        const hexVersRgba = win.__audit['graphiques-progression.js'].hexVersRgba;
        expect(hexVersRgba('var(--gris-moyen)', 0.35)).toBe('rgba(138, 164, 176, 0.35)');
        expect(hexVersRgba('var(--une-variable-inconnue)', 0.35), 'témoin : le repli reste').toBe('rgba(136, 136, 136, 0.35)');
    });

    it('l\'aperçu PDF a une règle pour la classe que rend le code PS', () => {
        // export-pdf.js rend `apercu-niveau-${code.toUpperCase()}`.
        expect(lire('js/export-pdf.js')).toMatch(/apercu-niveau-\$\{\(n\.code \|\| ''\)\.toUpperCase\(\)\}/);
        const css = lire('styles.css');
        const regle = css.match(/\.apercu-niveau-PS,\s*\.apercu-niveau-ps\s*\{([^}]*)\}/);
        expect(regle, 'règle .apercu-niveau-PS').not.toBeNull();
        expect(regle[1]).toMatch(/color:\s*var\(--gris-moyen\)/);
    });
});
