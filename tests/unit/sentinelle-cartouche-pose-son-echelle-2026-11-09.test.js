// =======================================================================
// LA CARTOUCHE POSE SON ÉCHELLE, AU GESTE SEULEMENT (troisième parcours, 9 nov. 2026)
// =======================================================================
// Le défaut de la consigne du troisième parcours : sur une grille en points, la cartouche choisie n'ajoutait pas le
// commentaire de son palier tant qu'aucune échelle n'était choisie à l'écran. Le correctif
// (`_adopterEchelleDeLaCartouche`, js/evaluation-chargement.js) pose l'échelle de la cartouche sur l'évaluation.
// La relecture neuve du 9 nov. a mesuré qu'il agissait aussi SANS GESTE (les chargeurs passent par
// `cartoucheSelectionnee`) et écrivait des niveaux dans une copie déjà évaluée. Ce banc juge les quatre bornes :
//   1. un chargeur (`cartoucheSelectionnee` appelée directement) ne pose AUCUNE échelle ;
//   2. le geste (`choisirCartoucheEval`, le menu) pose l'échelle de la cartouche, quand aucune n'est choisie ;
//   3. jamais à la place d'une échelle choisie ;
//   4. jamais une échelle que le menu n'offre pas.
// Break-tests (9 nov.) : la garde `_echelleAuGeste` retirée → ROUGE (1) ; la garde « une échelle déjà choisie »
// retirée → ROUGE (3) ; l'appel retiré de `cartoucheSelectionnee` → ROUGE (2). Rétablis.
// Le bout en bout (le commentaire du palier dans la rétroaction) : tests/integration/parcours-3-evaluer-2026-11-09.spec.js.
// Noms et ids fictifs.

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const GRILLE = { id: 'G_POINTS', nom: 'Grille fictive en points', criteres: [{ id: 'CR_un', nom: 'Rédaction', ponderation: 100, type: 'analytique' }] };
const ECHELLE = (id) => ({ id, nom: 'Échelle ' + id, niveaux: [{ code: 'I', nom: 'Insuffisant', min: 0, max: 59 }, { code: 'M', nom: 'Maîtrisé', min: 60, max: 100 }] });
const CARTOUCHE = (echelleId) => ({ id: 'CART_un', nom: 'Cartouche fictive', grilleId: GRILLE.id, echelleId, niveaux: [], commentaires: { CR_un_M: 'Bien rédigé.' } });

function ecran({ echelleChoisie = '', echelleCartouche = 'ECH_A', offertes = ['ECH_A', 'ECH_B'] } = {}) {
    const options = ['<option value="">— Choisir une échelle —</option>'].concat(offertes.map((id) => `<option value="${id}"${id === echelleChoisie ? ' selected' : ''}>${id}</option>`));
    const dom = new JSDOM(`<!doctype html><body>
        <select id="selectCartoucheEval"><option value="">—</option><option value="CART_un" selected>c</option></select>
        <select id="remiseProduction1"><option value="remis" selected>remis</option></select>
        <select id="selectEchelle1">${options.join('')}</select>
        <div id="listeCriteresGrille1"></div></body>`);
    const document = dom.window.document;
    const store = {
        t_grillesTemplates: [GRILLE],
        t_echellesTemplates: [ECHELLE('ECH_A'), ECHELLE('ECH_B')],
        [`t_cartouches_${GRILLE.id}`]: [CARTOUCHE(echelleCartouche)],
        t_evaluationsSauvegardees: []
    };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d), get: async () => null, setSync() {}, set: async () => {} };
    const win = chargerScript('js/cartouche-correspondance.js', {});
    const evaluationEnCours = { grilleId: GRILLE.id, echelleId: echelleChoisie, criteres: {}, etudiantDA: '2390001', productionId: 'P1' };
    chargerScript('js/evaluation-chargement.js', {
        db, document, cle: (k) => 't_' + k,
        obtenirDonneesSelonMode: (k) => store['t_' + k] || [],
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        formaterPourcentage: (n) => (typeof n === 'number' ? `${n} %` : ''),
        ESPACE_INSECABLE: ' ',
        evaluationEnCours, calculerNote() {}, genererRetroaction() {},
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} }
    }, win);
    return { win, document, evaluationEnCours, echelle: () => [document.getElementById('selectEchelle1').value, evaluationEnCours.echelleId] };
}

describe('La cartouche pose son échelle, au geste seulement', () => {
    it('1. un chargeur (cartoucheSelectionnee) ne pose aucune échelle : la copie en points reste sans niveau', () => {
        const e = ecran();
        e.win.cartoucheSelectionnee();
        expect(e.echelle()).toEqual(['', '']);
    });

    it('2. le geste (le menu de la cartouche) pose l’échelle de la cartouche quand aucune n’est choisie', async () => {
        const e = ecran();
        await e.win.choisirCartoucheEval(e.document.getElementById('selectCartoucheEval'));
        expect(e.echelle()).toEqual(['ECH_A', 'ECH_A']);
    });

    it('3. jamais à la place d’une échelle choisie', async () => {
        const e = ecran({ echelleChoisie: 'ECH_B' });
        await e.win.choisirCartoucheEval(e.document.getElementById('selectCartoucheEval'));
        expect(e.echelle()).toEqual(['ECH_B', 'ECH_B']);
    });

    it('4. jamais une échelle que le menu n’offre pas', async () => {
        const e = ecran({ offertes: ['ECH_B'] });
        await e.win.choisirCartoucheEval(e.document.getElementById('selectCartoucheEval'));
        expect(e.echelle()).toEqual(['', '']);
    });
});
