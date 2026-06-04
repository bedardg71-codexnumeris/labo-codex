import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session B (représentations des pratiques, juin 2026).
// Le registre est la SOURCE UNIQUE du triplet {code, couleur, famille}. Avant la
// Session B ce triplet était dupliqué dans ~7 tables locales. Ces tests verrouillent
// le contrat des helpers du registre (code/couleur/famille/badge) pour les 4 familles.
// Codes courts inchangés : SOM/STD/SPE/DEN. Couleurs = variables CSS canoniques.

let win;

beforeAll(() => {
    win = chargerScript('js/pratiques/pratique-registre.js', {
        db: { get: async () => null, getSync: (c, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => k
    });
});

describe('Session B · représentations canoniques', () => {
    it('expose les helpers de représentation', () => {
        expect(typeof win.obtenirRepresentationPratique).toBe('function');
        expect(typeof win.obtenirCodePratique).toBe('function');
        expect(typeof win.obtenirCouleurPratique).toBe('function');
        expect(typeof win.obtenirLabelFamillePratique).toBe('function');
        expect(typeof win.genererBadgePratiqueHTML).toBe('function');
    });

    it('rend le bon code court pour chaque famille canonique', () => {
        expect(win.obtenirCodePratique('sommative')).toBe('SOM');
        expect(win.obtenirCodePratique('standards')).toBe('STD');
        expect(win.obtenirCodePratique('specifications')).toBe('SPE');
        expect(win.obtenirCodePratique('denotation')).toBe('DEN');
    });

    it('rend la couleur via la variable CSS canonique du design system', () => {
        expect(win.obtenirCouleurPratique('sommative')).toBe('var(--som-orange)');
        expect(win.obtenirCouleurPratique('standards')).toBe('var(--std-bleu)');
        expect(win.obtenirCouleurPratique('specifications')).toBe('var(--spe-vert)');
        expect(win.obtenirCouleurPratique('denotation')).toBe('var(--den-violet)');
    });

    it('rend le libellé de famille (Sommative vs PAN)', () => {
        expect(win.obtenirLabelFamillePratique('sommative')).toBe('Sommative');
        expect(win.obtenirLabelFamillePratique('standards')).toBe('PAN');
        expect(win.obtenirLabelFamillePratique('specifications')).toBe('PAN');
        expect(win.obtenirLabelFamillePratique('denotation')).toBe('PAN');
    });

    it('normalise les identifiants legacy avant de représenter', () => {
        // pan-standards / pan-maitrise → standards → STD
        expect(win.obtenirCodePratique('pan-standards')).toBe('STD');
        expect(win.obtenirCodePratique('pan-maitrise')).toBe('STD');
        expect(win.obtenirCodePratique('pan-specifications')).toBe('SPE');
        expect(win.obtenirCodePratique('pan-denotation')).toBe('DEN');
    });

    it('remappe pan-objectifs vers la représentation Standards (décision D1, fold Session C)', () => {
        expect(win.obtenirCodePratique('pan-objectifs')).toBe('STD');
        expect(win.obtenirLabelFamillePratique('pan-objectifs')).toBe('PAN');
    });

    it('retombe sur la représentation par défaut (STD) pour un id inconnu ou vide', () => {
        for (const id of [null, undefined, '', 'id-inconnu', 'test']) {
            expect(win.obtenirCodePratique(id)).toBe('STD');
        }
    });

    it('génère un badge HTML cohérent (classe + code, sans donnée utilisateur)', () => {
        expect(win.genererBadgePratiqueHTML('sommative'))
            .toBe('<span class="badge-type-pratique badge-type-som">SOM</span>');
        expect(win.genererBadgePratiqueHTML('standards'))
            .toBe('<span class="badge-type-pratique badge-type-std">STD</span>');
        expect(win.genererBadgePratiqueHTML('pan-specifications'))
            .toBe('<span class="badge-type-pratique badge-type-spe">SPE</span>');
        expect(win.genererBadgePratiqueHTML('denotation'))
            .toBe('<span class="badge-type-pratique badge-type-den">DEN</span>');
    });

    it('expose une représentation complète {code, couleurVar, famille, classe}', () => {
        const rep = win.obtenirRepresentationPratique('standards');
        expect(rep).toEqual({ code: 'STD', couleurVar: '--std-bleu', famille: 'PAN', classe: 'badge-type-std' });
    });
});
