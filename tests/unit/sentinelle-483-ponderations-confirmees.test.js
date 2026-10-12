import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// #483 (moitié « confirmer », 11 oct. 2026) — DES PONDÉRATIONS QUI NE FONT PAS 100 %
// =====================================================================
// Enregistrer une grille par le geste explicite (créer, « Sauvegarder la grille ») dit, sans
// bloquer, que ses critères ne totalisent pas 100 %. Les sauvegardes automatiques se taisent.
// L'autre moitié de la fiche (le poids 1 des évaluations orphelines en sommatif) change des
// notes : elle revient à Grégoire.

const T = 'a2031_';
const cle = (k) => T + k;

function fauxDb(initial) {
    const magasin = new Map(Object.entries(initial || {}));
    const copie = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        getSync: (k, d) => (magasin.has(k) ? copie(magasin.get(k)) : d),
        get: async (k) => (magasin.has(k) ? copie(magasin.get(k)) : null),
        setSync: (k, v) => { magasin.set(k, copie(v)); return true; },
        async modifier(k, mutateur, d) {
            const v = await mutateur(magasin.has(k) ? copie(magasin.get(k)) : copie(d));
            if (v === undefined) return undefined;
            magasin.set(k, copie(v));
            return v;
        }
    };
}

function monter(criteres, grilleOuverte) {
    const avertis = [];
    const db = fauxDb({ [cle('grillesTemplates')]: grilleOuverte ? [grilleOuverte] : [] });
    const element = (v) => ({ value: v, textContent: '', innerHTML: '', style: {}, classList: { add() {}, remove() {}, contains: () => false } });
    const win = chargerScript('js/grilles.js', {
        db, cle, echapperHtml: (t) => String(t == null ? '' : t), genererIdUnique: (p) => p + 'NEUF',
        alert() {}, confirm: () => true, prompt: () => null,
        notifications: { succes() {}, erreur() {}, info() {}, warning: (m) => avertis.push(m) },
        document: { getElementById: (id) => (id === 'nomGrilleTemplate' ? element('Grille fictive') : null),
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {},
            body: { insertAdjacentHTML() {} }, createElement: () => element('') },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: grilleOpen(grilleOuverte),
        verifierEtGererDoublon: async () => ({ action: 'continuer' })
    });
    win.tempCriteres = criteres;
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, avertis };
}
const grilleOpen = (g) => (g ? JSON.parse(JSON.stringify(g)) : null);

describe('#483 · enregistrer une grille dit un total qui n\'est pas 100 %', () => {
    it('création, 60 + 30 : l\'avertissement nomme 90 %', async () => {
        const { win, avertis } = monter([{ id: 'c1', nom: 'A', ponderation: 60 }, { id: 'c2', nom: 'B', ponderation: 30 }]);
        await win.sauvegarderGrilleTemplate(false);
        expect(avertis).toEqual(['Grille enregistrée : ses critères totalisent 90 %, pas 100 %.']);
    });
    it('création, 60 + 40 : rien', async () => {
        const { win, avertis } = monter([{ id: 'c1', nom: 'A', ponderation: 60 }, { id: 'c2', nom: 'B', ponderation: 40 }]);
        await win.sauvegarderGrilleTemplate(false);
        expect(avertis).toEqual([]);
    });
    it('supprimer un critère (non silencieux, avec une modification) d\'une grille qui tombe à 60 % : rien', async () => {
        const g = { id: 'GR_1', nom: 'Grille fictive', criteres: [{ id: 'c1', nom: 'A', ponderation: 60 }, { id: 'c2', nom: 'B', ponderation: 40 }] };
        const { win, avertis } = monter([], g);
        await win.sauvegarderGrilleTemplate(false, (x) => { x.criteres = x.criteres.filter((c) => c.id !== 'c2'); });
        expect(avertis).toEqual([]);
    });

    it('sauvegarde automatique (silencieuse) d\'une grille à 90 % : rien', async () => {
        const g = { id: 'GR_1', nom: 'Grille fictive', criteres: [{ id: 'c1', nom: 'A', ponderation: 90 }] };
        const { win, avertis } = monter([], g);
        await win.sauvegarderGrilleTemplate(true);
        expect(avertis).toEqual([]);
    });
});
