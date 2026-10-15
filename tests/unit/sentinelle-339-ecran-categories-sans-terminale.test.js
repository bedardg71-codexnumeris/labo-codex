import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #339 (15 oct. 2026, verdict de Cowork, point 3) — L'ÉCRAN DES CATÉGORIES NE PROPOSE PLUS LA TERMINALE PARMI LES
// OBLIGATOIRES, et ne la compte plus dans « 35 % ÷ N ».
//
// Depuis le correctif du zéro fantôme (sentinelle-339-terminale-obligatoire-zero-fantome), le calcul de la note
// écarte la terminale des obligatoires, en provisoire comme en final. L'écran affichait encore « 35 % ÷ 3 » pour un
// calcul qui divise par 2. Une configuration d'avant qui porte la terminale cochée n'est pas réécrite : la marque
// reste en base, inerte pour l'écran comme pour le calcul.
//
// Break-test attendu : rendre au compte de `recalculerPonderationsUnitaires` la terminale → 11,67 au lieu de 17,50.

const PRODUCTIONS = [
    { id: 'S1', titre: 'Artefact 1', type: 'artefact-portfolio', categorie: 'selection' },
    { id: 'O1', titre: 'Artefact 2', type: 'artefact-portfolio', categorie: 'obligatoire' },
    { id: 'O2', titre: 'Artefact 3', type: 'artefact-portfolio', categorie: 'obligatoire' },
    { id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60 },
    // Une configuration d'avant le lot : la terminale cochée « obligatoire ».
    { id: 'TERM', titre: 'Évaluation terminale', type: 'terminale', ponderation: 40, categorie: 'obligatoire' }
];

function monter() {
    const elements = {};
    const el = (id, init) => (elements[id] = Object.assign({ id, value: '', innerHTML: '' }, init || {}));
    el('mat-selection-liste'); el('mat-obligatoires-liste'); el('mat-selection-unitaire'); el('mat-obligatoires-unitaire');
    el('mat-selection-ponderation', { value: '65' }); el('mat-obligatoires-ponderation', { value: '35' }); el('mat-selection-nombre', { value: '1' });
    const store = { test_productions: JSON.parse(JSON.stringify(PRODUCTIONS)) };
    const win = chargerScript('js/pratiques-gestion.js', {
        db: { get: async (k) => store[k], getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync() {} },
        cle: (k) => 'test_' + k,
        document: { getElementById: (id) => elements[id] || null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
        echapperHtml: (t) => String(t == null ? '' : t)
    });
    win.identifierProductionTerminale = (productions) => productions.find(p => p && p.type === 'terminale') || null;
    return { win, elements, store };
}

describe('#339 — l\'écran des catégories : la terminale sort des obligatoires', () => {
    it('la liste des obligatoires ne propose pas la terminale ; la pondération unitaire divise par 2, pas par 3', async () => {
        const { win, elements } = monter();
        await win.chargerProductionsPourCategories();
        await win.recalculerPonderationsUnitaires();
        expect(elements['mat-obligatoires-liste'].innerHTML).not.toContain('data-prod-id="TERM"');
        expect(elements['mat-obligatoires-liste'].innerHTML).toContain('data-prod-id="O2"');
        expect(elements['mat-obligatoires-unitaire'].innerHTML).toContain('<strong>17.50%</strong>');
        expect(elements['mat-obligatoires-unitaire'].innerHTML).toContain('(2 cochées)');
    });

    it('dans la Sélection, la terminale n\'est ni cochée ni grisée par sa marque inerte', async () => {
        const { win, elements } = monter();
        await win.chargerProductionsPourCategories();
        const ligne = elements['mat-selection-liste'].innerHTML.split('<label').find(l => l.includes('data-prod-id="TERM"'));
        expect(ligne).toBeTruthy();
        expect(ligne).not.toContain('disabled');
        expect(ligne).not.toMatch(/<input type="checkbox" checked/);
    });

    it('rien n\'est réécrit : la marque reste sur la production', async () => {
        const { win, store } = monter();
        await win.chargerProductionsPourCategories();
        await win.recalculerPonderationsUnitaires();
        expect(store.test_productions.find(p => p.id === 'TERM').categorie).toBe('obligatoire');
    });
});
