import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #925 (lot 6, consigne de Cowork du 11 oct. 2026) — L'ÉTAPE 3 DU GROUPE-COURS COMPTE LES ÉLÈVES DU
// COURS CHOISI AU CHAMP 2.
//
// Deux cours peuvent avoir chacun leur « 00001 ». L'étape 3 (`populerDropdownGroupesAssemblageV2`,
// trimestre-v2.js) affichait « 00001 (N étud.) » où N additionnait les deux cours. Seul le compte
// trompait : les listes de classe filtrent par cours. Correctif sans mot neuf : le compte suit le cours
// du champ 2 ; l'étape 3 se repeuple quand le cours change et quand un groupe-cours s'ouvre (elle
// était peuplée avant que son cours soit posé). La LISTE des numéros reste entière : un groupe-cours
// enregistré ne perd jamais le sien. Une fiche sans coursId (stock d'avant #887) compte partout,
// comme `obtenirEtudiantsCoursActif` l'accepte. Noms fictifs.
//
// Hors du lot : le « Groupe associé » de l'horaire (`groupeAssocie` relie un horaire à un numéro seul :
// changement de modèle, fiche #925, partie horaire).

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapper = (s) => String(s == null ? '' : s);

function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }, closest() { return null; }, focus() {} };
}
/** Un <select> fidèle sur ce qui compte : une valeur sans option le laisse sur ''. */
function selectFidele(id) {
    const el = elementDom(id);
    let html = '', valeur = '';
    const valeurs = () => [...html.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
    Object.defineProperty(el, 'innerHTML', { get() { return html; }, set(v) { html = String(v); valeur = ''; } });
    Object.defineProperty(el, 'value', { get() { return valeur; }, set(v) { valeur = valeurs().includes(String(v)) ? String(v) : ''; } });
    return el;
}

const ELEVES = [
    { da: '1000001', nom: 'Fictif', prenom: 'Ana', groupe: '00001', coursId: 'C1' },
    { da: '1000002', nom: 'Fictif', prenom: 'Bea', groupe: '00001', coursId: 'C1' },
    { da: '2000001', nom: 'Fictif', prenom: 'Cal', groupe: '00001', coursId: 'C2' },
    { da: '2000002', nom: 'Fictif', prenom: 'Dom', groupe: '00001', coursId: 'C2' },
    { da: '2000003', nom: 'Fictif', prenom: 'Eve', groupe: '00001', coursId: 'C2' },
    { da: '1000003', nom: 'Fictif', prenom: 'Fay', groupe: '00002', coursId: 'C1' }
];

/** L'étape 3, par la vraie fonction de trimestre-v2.js ; rend le texte de chaque option. */
function etape3(coursChoisi, eleves = ELEVES, groupeDejaChoisi = '') {
    const store = { test_groupeEtudiants: clone(eleves) };
    const elements = { 'v2-gc-groupe': selectFidele('v2-gc-groupe') };
    const document = { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
    document.getElementById('v2-gc-cours').value = coursChoisi;
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync() {} };
    const win = {};
    chargerScript('js/trimestre-v2.js', { document, db, cle: (k) => 'test_' + k, echapperHtml: echapper, echapperAttribut: echapper }, win);
    const select = document.getElementById('v2-gc-groupe');
    if (groupeDejaChoisi) {
        select.innerHTML = '<option value="' + groupeDejaChoisi + '"></option>';   // security-ok: faux select du banc, numéro littéral du banc
        select.value = groupeDejaChoisi;
    }
    win.populerDropdownGroupesAssemblageV2();
    return { textes: [...select.innerHTML.matchAll(/>([^<]*)<\/option>/g)].map((m) => m[1]), valeur: select.value };
}

describe('#925 — le compte de l\'étape 3 suit le cours du champ 2', () => {
    it('0. témoin : sans cours choisi, le compte est celui d\'avant (tous les cours)', () => {
        expect(etape3('').textes).toEqual(['— Choisir un groupe —', '00001 (5 étud.)', '00002 (1 étud.)']);
    });
    it('1. le « 00001 » de chaque cours compte ses seuls élèves (avant : 5 des deux côtés)', () => {
        expect(etape3('C1').textes).toEqual(['— Choisir un groupe —', '00001 (2 étud.)', '00002 (1 étud.)']);
        expect(etape3('C2').textes).toEqual(['— Choisir un groupe —', '00001 (3 étud.)', '00002 (0 étud.)']);
    });
    it('2. la liste des numéros reste entière, et le numéro déjà choisi est gardé', () => {
        const r = etape3('C2', ELEVES, '00002');
        expect(r.textes.length).toBe(3);
        expect(r.valeur).toBe('00002');
    });
    it('3. une fiche sans coursId (stock d\'avant #887) compte dans chaque cours', () => {
        const eleves = ELEVES.concat([{ da: '9000001', nom: 'Fictif', prenom: 'Gil', groupe: '00001' }]);
        expect(etape3('C1', eleves).textes[1]).toBe('00001 (3 étud.)');
        expect(etape3('C2', eleves).textes[1]).toBe('00001 (4 étud.)');
    });
});

// Le câblage : le formulaire du groupe-cours (trimestre-v2-groupes-cours.js), monté comme au banc du lot E2.
function monterLeFormulaire() {
    const store = {
        cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif 1' }, { id: 'C2', codeCours: '601-102-MQ', nomCours: 'Cours fictif 2' }],
        test_groupesCours: [{ id: 'GC_2', nom: 'Fictif gr. 00001', trimestreId: 'test', coursId: 'C2', groupeNum: '00001', horaireId: 'HOR1', enseignantId: 'ENS1', pratiqueId: null, actif: true }],
        test_horaires: [{ id: 'HOR1', nom: 'Mar-Jeu', groupeAssocie: '00001', seances: [] }],
        trimestres: [{ id: 'test', session: 'automne', annee: '2026', actif: true }], enseignants: [{ id: 'ENS1', prenom: 'Léa', nom: 'Fictive' }]
    };
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
    const uiDialogues = { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true };
    const win = chargerScript('js/identite-naturelle.js', {}, { addEventListener() {}, temoinEnregistrement: { nonEnregistre() {}, enregistre() {} }, raisonPourTemoin: (r) => r, uiDialogues });
    chargerScript('js/trimestre-v2-groupes-cours.js', {
        document, cle: (k) => (String(k).startsWith('test_') ? k : 'test_' + k), sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = clone(v); return true; },
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); } },
        notifications: { succes() {}, erreur() {} }, echapperHtml: echapper, echapperAttribut: echapper, genererIdUnique: (p) => p + 'NEUF',
        trouverDoublonNaturel: win.trouverDoublonNaturel, cleNaturelleGroupeCours: win.cleNaturelleGroupeCours,
        obtenirTrimestreActif: () => store.trimestres[0], confirm: () => true
    }, win);
    win.populerDropdownsAssemblageV2 = () => {};
    // L'espion note le cours du champ 2 à chaque appel : c'est lui que le compte lira.
    const coursAuxAppels = [];
    win.populerDropdownGroupesAssemblageV2 = vi.fn(() => { coursAuxAppels.push(document.getElementById('v2-gc-cours').value); });
    return { win, el: (id) => document.getElementById(id), coursAuxAppels };
}

describe('#925 — l\'étape 3 se repeuple quand son cours est connu', () => {
    it('4. changer le cours du champ 2 repeuple l\'étape 3, avec le nouveau cours', () => {
        const f = monterLeFormulaire();
        f.el('v2-gc-cours').value = 'C1';
        f.win.changerChampGroupeCoursV2(f.el('v2-gc-cours'));
        expect(f.coursAuxAppels).toEqual(['C1']);
    });
    it('5. changer un autre champ ne la repeuple pas', () => {
        const f = monterLeFormulaire();
        f.win.changerChampGroupeCoursV2(f.el('v2-gc-pratique'));
        expect(f.coursAuxAppels).toEqual([]);
    });
    it('6. ouvrir un groupe-cours la repeuple APRÈS avoir posé son cours', () => {
        const f = monterLeFormulaire();
        f.win.changerGroupeCoursSelectionneV2('GC_2');
        expect(f.coursAuxAppels).toContain('C2');
    });
});
