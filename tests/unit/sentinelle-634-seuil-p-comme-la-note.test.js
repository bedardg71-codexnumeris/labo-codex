import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #634 — LE TABLEAU DE BORD LIT LE SEUIL DE P COMME LA NOTE.
//
// « N évaluations en attente » (barre P du tableau de bord) dépend du minimum d'évaluations
// du portfolio. Mesuré le 11 oct. 2026 sur main : l'aperçu cherchait la pratique du
// groupe-cours par son id BRUT, en `.configuration`, `.portfolio` ou `.regles` ; la note la
// lit par `obtenirConfigPratiqueActive()` — id brut puis normalisé (#711), `.configuration`
// ou `.config` (#712), et 7 quand le portfolio ne dit pas son minimum. Une pratique importée
// (forme `.config`) ou désignée par un id ancien donnait deux seuils sur deux écrans.
// La bibliothèque PARTAGÉE (`bibliothequePratiques`) reste hors du chemin, des deux côtés.
//
// Modules RÉELS : pratique-registre.js (désignation), portfolio.js (obtenirConfigPratiqueActive),
// tableau-bord-apercu.js (seuilEvaluationsPourP).

function monter({ pratiques, pointeur, partagee }) {
    const store = { a2026_pratiquesConfigurables: pratiques, bibliothequePratiques: partagee || [] };
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        get: async (k) => (k in store ? store[k] : null), set: async () => {}, setSync() {}
    };
    const win = { PratiqueManager: {}, lirePointeurPratiqueGroupeCours: () => pointeur };
    const globaux = { db, cle: (k) => 'a2026_' + k };
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/portfolio.js', Object.assign({
        designerPratiqueActive: win.designerPratiqueActive,
        trouverPratiqueEnBibliotheque: win.trouverPratiqueEnBibliotheque
    }, globaux), win);
    chargerScript('js/tableau-bord-apercu.js', Object.assign({
        obtenirConfigPratiqueActive: win.obtenirConfigPratiqueActive
    }, globaux), win);
    return win;
}

const STD = (id, porte) => Object.assign({ id, nom: 'STD', type: 'standards' }, porte);

describe('#634 · seuilEvaluationsPourP lit la pratique active comme la note', () => {
    it('A · forme ordinaire : le minimum de `.configuration.portfolio`', () => {
        const win = monter({ pointeur: 'p1', pratiques: [STD('p1', { configuration: { portfolio: { minimumCompletion: 5 } } })] });
        expect(win.obtenirConfigPratiqueActive().portfolio.minimumCompletion).toBe(5);
        expect(win.seuilEvaluationsPourP({})).toBe(5);
    });

    it('B · forme d\'import `.config` (#712) : lue comme par la note (avant : ignorée, 3)', () => {
        const win = monter({ pointeur: 'p1', pratiques: [STD('p1', { config: { portfolio: { minimumCompletion: 4 } } })] });
        expect(win.seuilEvaluationsPourP({})).toBe(4);
    });

    it('C · pointeur ancien `pan-standards`, pratique rangée sous `standards` (#711)', () => {
        const win = monter({ pointeur: 'pan-standards', pratiques: [STD('standards', { configuration: { portfolio: { minimumCompletion: 6 } } })] });
        expect(win.seuilEvaluationsPourP({})).toBe(6);
    });

    it('D · un portfolio sans minimum : 7, le défaut du moteur (avant : le repli des modalités, ou 3)', () => {
        const win = monter({ pointeur: 'p1', pratiques: [STD('p1', { configuration: { portfolio: { nombreARetenir: 4 } } })] });
        expect(win.seuilEvaluationsPourP({ portfolio: { minimumCompletion: 2 } })).toBe(7);
    });

    it('E · sans portfolio de pratique : les modalités, sinon 3 (inchangé)', () => {
        const win = monter({ pointeur: null, pratiques: [] });
        expect(win.seuilEvaluationsPourP({ portfolio: { minimumCompletion: 2 } })).toBe(2);
        expect(win.seuilEvaluationsPourP({})).toBe(3);
    });

    it('F · la bibliothèque partagée n\'est pas consultée', () => {
        const win = monter({ pointeur: 'p1', pratiques: [],
            partagee: [STD('p1', { configuration: { portfolio: { minimumCompletion: 9 } } })] });
        expect(win.seuilEvaluationsPourP({})).toBe(3);
    });
});

describe('#1250 · un groupe sans aucune production ne dit plus « N évaluations en attente »', () => {
    const textes = (...args) => monter({ pratiques: [], pointeur: null }).textesAttenteCEtP(...args);
    it('aucune production : les deux phrases de Grégoire (27 nov. 2026)', () => {
        expect(textes(1, 3, 3, 0)).toEqual({
            texteAttenteC: 'Paraîtra quand tes étudiant·es auront remis une première production',
            texteAttenteP: 'Paraîtra après trois productions évaluées'
        });
    });
    it('le nombre suit le seuil de la pratique', () => {
        expect(textes(1, 5, 5, 0).texteAttenteP).toBe('Paraîtra après cinq productions évaluées');
        expect(textes(1, 1, 1, 0).texteAttenteP).toBe('Paraîtra après une première production évaluée');
    });
    it('témoin : dès qu\'une production existe, les messages d\'avant reviennent', () => {
        expect(textes(1, 3, 3, 1)).toEqual({ texteAttenteC: '1 évaluation en attente', texteAttenteP: '3 évaluations en attente' });
        expect(textes(0, 2, 3, 4)).toEqual({ texteAttenteC: '', texteAttenteP: '2 évaluations en attente' });
    });
});
