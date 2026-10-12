import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// #624 — UNE GRILLE QUI PORTE DES NOTES NE PART PAS (11 oct. 2026)
// =====================================================================
//
// Mesure du 11 oct. : le chemin unique de suppression d'une grille en Conception
// (`supprimerGrilleAvecPorteDeSortie`, quatre boutons) ne comptait que les CARTOUCHES. Une
// grille employée par des évaluations ou des productions, sans cartouche, partait sur un
// simple « Supprimer ? » et les laissait sans référence. L'onglet Données bloquait déjà ce cas.
// Même règle ici : bloquer et nommer les comptes, sans issue (rattacher des évaluations à une
// autre grille changerait leurs notes). Source seulement : aucune évaluation n'est rattachée
// après coup (les notes d'A2025 et d'H2026 ne sont pas rouvertes).

const T = 'a2031_';
const cle = (k) => T + k;

function fauxDb(initial) {
    const magasin = new Map(Object.entries(initial || {}));
    const copie = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    let ecritures = 0;
    return {
        getSync: (k, d) => (magasin.has(k) ? copie(magasin.get(k)) : d),
        get: async (k) => (magasin.has(k) ? copie(magasin.get(k)) : null),
        setSync: (k, v) => { magasin.set(k, copie(v)); ecritures++; return true; },
        async modifier(k, mutateur, d) {
            const v = await mutateur(magasin.has(k) ? copie(magasin.get(k)) : copie(d));
            if (v === undefined) return undefined;
            magasin.set(k, copie(v)); ecritures++;
            return v;
        },
        get ecritures() { return ecritures; }
    };
}

function monter(contenu) {
    const db = fauxDb(Object.assign({ [cle('grillesTemplates')]: [{ id: 'GR_1', nom: 'Grille fictive', criteres: [] }, { id: 'GR_2', nom: 'Autre grille', criteres: [] }] }, contenu));
    const alertes = []; const questions = [];
    const win = chargerScript('js/grilles.js', {
        db, cle, echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => p + 'NEUF',
        alert: (m) => alertes.push(m), confirm: (m) => { questions.push(m); return true; }, prompt: () => null,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {},
            body: { insertAdjacentHTML() {} }, createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }) },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    });
    win.estRessourceSupprimee = () => false;
    win.marquerRessourceSupprimee = () => {};
    win.IDS_GABARITS_HARDCODES = [];
    return { win, db, alertes, questions };
}

describe('#624 · supprimer une grille en Conception', () => {
    it('employée par une évaluation : refus nommé, rien n\'est écrit, aucune question', async () => {
        const { win, db, alertes, questions } = monter({ [cle('evaluationsSauvegardees')]: [{ id: 'E1', grilleId: 'GR_1' }, { id: 'E2', grilleId: 'GR_1' }] });
        expect(await win.supprimerGrilleAvecPorteDeSortie('GR_1')).toBe(false);
        expect(alertes).toHaveLength(1);
        expect(alertes[0]).toContain('Grille fictive');
        expect(alertes[0]).toContain('Utilisée par 2 évaluation(s)');
        expect(questions).toEqual([]);
        expect(db.ecritures).toBe(0);
        expect(db.getSync(cle('grillesTemplates')).map((g) => g.id)).toEqual(['GR_1', 'GR_2']);
    });

    it('employée par une production seulement : refus aussi', async () => {
        const { win, alertes } = monter({ [cle('productions')]: [{ id: 'P1', grilleId: 'GR_1' }] });
        expect(await win.supprimerGrilleAvecPorteDeSortie('GR_1')).toBe(false);
        expect(alertes[0]).toContain('Utilisée par 1 production(s)');
    });

    it('employée ailleurs seulement (une autre grille) : la question d\'avant, et elle part', async () => {
        const { win, db, alertes, questions } = monter({ [cle('evaluationsSauvegardees')]: [{ id: 'E1', grilleId: 'GR_2' }] });
        expect(await win.supprimerGrilleAvecPorteDeSortie('GR_1')).toBe(true);
        expect(alertes).toEqual([]);
        expect(questions).toEqual(['Supprimer la grille « Grille fictive » ?']);
        expect(db.getSync(cle('grillesTemplates')).map((g) => g.id)).toEqual(['GR_2']);
    });
});
