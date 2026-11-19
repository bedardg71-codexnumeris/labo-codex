import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// lot/dessiner-au-doigt (18 nov. 2026, vécu par Grégoire sur l'iPad) : la décision d'un doigt posé sur la copie.
// Choix éteint : le comportement d'avant, à l'identique (#1123 : tampon, code et Texte d'un toucher ; le reste, rien).
// Choix allumé : les outils qui tracent tracent au doigt ; le polygone se pose sommet par sommet, d'un toucher.
// Le crayon garde la priorité ; en Évaluer, aucun doigt n'annote (#1217).
const { annotationDoigt: d } = chargerScript('js/annotation-doigt.js', {});

const OUTILS = {
    stylo: { id: 'stylo' },
    surligneur: { id: 'surligneur', type: 'surligneur' },
    texte: { id: 'texte' },
    cercle: { id: 'cercle', type: 'forme' },
    rectangle: { id: 'rectangle', type: 'forme' },
    polygone: { id: 'polygone', type: 'forme' },
    fleche: { id: 'fleche', type: 'forme' },
    pointille: { id: 'pointille', type: 'forme' },
    ondule: { id: 'ondule', type: 'forme' },
    code: { id: 'C1', type: 'symbole' }
};
const QUI_TRACENT = ['stylo', 'surligneur', 'cercle', 'rectangle', 'fleche', 'pointille', 'ondule'];
const DUN_TOUCHER = ['texte', 'code'];

const geste = (outil, autres = {}) => d.gesteDuDoigt(Object.assign({
    outil: OUTILS[outil], autocollantActif: false, allume: false, enEvaluer: false,
    styletEnCours: false, depuisStyletMs: 10000, delaiPaumeMs: 500
}, autres));

describe('Dessiner au doigt — choix éteint : rien ne change', () => {
    it('les outils qui tracent ignorent le doigt', () => {
        for (const o of [...QUI_TRACENT, 'polygone']) expect(geste(o), o).toBe('rien');
    });
    it('tampon, code et Texte se posent d’un toucher (#1123)', () => {
        for (const o of DUN_TOUCHER) expect(geste(o), o).toBe('toucher');
        expect(geste('stylo', { autocollantActif: true })).toBe('toucher');
    });
});

describe('Dessiner au doigt — choix allumé', () => {
    it('un doigt trace avec tous les outils qui tracent', () => {
        for (const o of QUI_TRACENT) expect(geste(o, { allume: true }), o).toBe('tracer');
    });
    it('le polygone se pose sommet par sommet, d’un toucher', () => {
        expect(geste('polygone', { allume: true })).toBe('toucher');
    });
    it('tampon, code et Texte restent d’un toucher', () => {
        for (const o of DUN_TOUCHER) expect(geste(o, { allume: true }), o).toBe('toucher');
        expect(geste('surligneur', { allume: true, autocollantActif: true })).toBe('toucher');
    });
    it('le crayon garde la priorité : pendant son geste, et dans le délai de paume qui suit, le doigt est la paume', () => {
        expect(geste('surligneur', { allume: true, styletEnCours: true })).toBe('rien');
        expect(geste('surligneur', { allume: true, depuisStyletMs: 499 })).toBe('rien');
        expect(geste('surligneur', { allume: true, depuisStyletMs: 500 })).toBe('rien');
        expect(geste('surligneur', { allume: true, depuisStyletMs: 501 })).toBe('tracer');
        expect(geste('texte', { allume: true, depuisStyletMs: 100 })).toBe('rien');
    });
    it('en Évaluer, aucun doigt n’annote, allumé ou non (#1217)', () => {
        for (const allume of [true, false]) {
            for (const o of [...QUI_TRACENT, 'polygone', ...DUN_TOUCHER]) expect(geste(o, { allume, enEvaluer: true }), o).toBe('rien');
        }
    });
    it('Sélection et Déplacer ne sont pas des outils qui tracent', () => {
        expect(d.outilQuiTrace({ id: 'selection', type: 'selection' })).toBe(false);
        expect(d.outilQuiTrace({ id: 'position', type: 'position' })).toBe(false);
    });
});

describe('Dessiner au doigt — l’écran tactile et le réglage de l’appareil', () => {
    it('l’iPad (points de toucher) ou un pointeur grossier : oui ; le Mac : non', () => {
        const mm = (grossier) => () => ({ matches: grossier });
        expect(d.estEcranTactile({ maxTouchPoints: 5 }, mm(false))).toBe(true);
        expect(d.estEcranTactile({ maxTouchPoints: 0 }, mm(true))).toBe(true);
        expect(d.estEcranTactile({ maxTouchPoints: 0 }, mm(false))).toBe(false);
    });
    it('sans la clé : éteint ; allumé, il se garde sous laboCodex.dessinerAuDoigt, hors trimestre', () => {
        const stock = new Map();
        const localStorage = { getItem: (k) => (stock.has(k) ? stock.get(k) : null), setItem: (k, v) => stock.set(k, String(v)) };
        const w = chargerScript('js/annotation-doigt.js', { localStorage });
        w.localStorage = localStorage;
        const a = w.annotationDoigt;
        expect(a.CLE).toBe('laboCodex.dessinerAuDoigt');
        expect(a.estAllume()).toBe(false);
        a.definirAllume(true);
        expect(JSON.parse(stock.get('laboCodex.dessinerAuDoigt'))).toEqual({ allume: true });
        expect(a.estAllume()).toBe(true);
        a.definirAllume(false);
        expect(a.estAllume()).toBe(false);
    });
});
