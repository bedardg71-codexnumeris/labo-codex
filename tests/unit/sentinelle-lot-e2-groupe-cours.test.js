import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E2 DE L'ENREGISTREMENT — LE GROUPE-COURS (D3, 28 sept. 2026)
//
// Un groupe-cours existant s'enregistre tout seul, au changement de chacune de ses six
// sélections, par le même écrivain que la création (`sauvegarderGroupeCoursV2` : cinq
// éléments requis, garde CT-15 du triplet, garde démo) ; « Créer le groupe-cours » est le
// seul geste qui crée ; « Annuler » devient « Fermer » ; le message de réussite ne part
// qu'après l'écriture. Tout passe par `sauvegarderDonneesSelonMode` (le témoin commun),
// espionné ici. Noms fictifs.

const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: classList(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }, closest() { return null; }, focus() {} };
}

const GC = { id: 'GC_1', nom: 'Écriture fictive gr. 00001', trimestreId: 'test', coursId: 'C_COURS', groupeNum: '00001', horaireId: 'HOR1', enseignantId: 'ENS1', pratiqueId: null, actif: true };

function monter({ groupesCours = [GC], confirmer = true, quitter = true, echec = false } = {}) {
    const store = {
        cours: [{ id: 'C_COURS', codeCours: '601-101-MQ', nomCours: 'Écriture fictive' }, { id: 'C_AUTRE', codeCours: '601-102-MQ', nomCours: 'Littérature fictive' }],
        test_groupesCours: clone(groupesCours), test_horaires: [{ id: 'HOR1', nom: 'Mar-Jeu', groupeAssocie: '00001', seances: [] }],
        trimestres: [{ id: 'test', session: 'automne', annee: '2026', actif: true }], enseignants: [{ id: 'ENS1', prenom: 'Léa', nom: 'Fictive' }]
    };
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
    document.getElementById('v2-formulaireGroupeCours').classList.add('u-hide');
    document.getElementById('v2-btnCreerGroupeCours').classList.add('u-hide');
    const sauvegarder = vi.fn((k, v) => { if (echec) return false; store[cle(k)] = clone(v); return true; });
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const toasts = [];
    const fiches = {};
    const questions = [];
    const uiDialogues = {
        declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
        quitterCreationSiConfirme: vi.fn(async (g) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(g); return quitter; })
    };
    const win = chargerScript('js/identite-naturelle.js', {}, { addEventListener() {}, temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1), uiDialogues });
    chargerScript('js/trimestre-v2-groupes-cours.js', {
        document, cle, sauvegarderDonneesSelonMode: sauvegarder,
        db: { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); } },
        notifications: { succes: (t) => toasts.push(t), erreur: (t) => toasts.push('ERREUR ' + t) },
        echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        trouverDoublonNaturel: win.trouverDoublonNaturel, cleNaturelleGroupeCours: win.cleNaturelleGroupeCours,
        obtenirTrimestreActif: () => store.trimestres[0], confirm: () => confirmer
    }, win);
    win.populerDropdownsAssemblageV2 = () => {};
    const el = (id) => document.getElementById(id);
    const ouvrir = (id) => win.changerGroupeCoursSelectionneV2(id);
    const choisir = (champ, v) => { el('v2-gc-' + champ).value = v; return win.changerChampGroupeCoursV2(el('v2-gc-' + champ)); };
    return { win, store, el, sauvegarder, temoin, toasts, fiches, questions, ouvrir, choisir };
}

describe('lot E2 · groupe-cours existant — chaque sélection s\'enregistre, par le témoin', () => {
    it('changer la pratique s\'écrit tout seul, geste « Modifier le groupe-cours », aucun message', () => {
        const e = monter();
        e.ouvrir('GC_1');
        expect(e.choisir('pratique', 'PRAT_1')).toBe(true);
        expect(e.store.test_groupesCours[0].pratiqueId).toBe('PRAT_1');
        expect(e.sauvegarder.mock.calls[0]).toEqual(['groupesCours', expect.any(Array), { geste: 'Modifier le groupe-cours' }]);
        expect(e.toasts).toEqual([]);
        expect(e.el('v2-btnCreerGroupeCours').classList.contains('u-hide')).toBe(true);
    });

    it('un élément requis retiré : « Non enregistré – Modifier le groupe-cours : choisis l\'enseignant·e. », rien d\'écrit', () => {
        const e = monter();
        e.ouvrir('GC_1');
        expect(e.choisir('enseignant', '')).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith('choisis l\'enseignant·e.', 'Modifier le groupe-cours', 'test_groupesCours');
    });

    it('le triplet d\'un autre groupe-cours : la question CT-15 ; « Annuler » remet la fiche au stock', () => {
        const jumeau = { ...GC, id: 'GC_2', coursId: 'C_AUTRE', nom: 'Littérature fictive gr. 00001' };
        const e = monter({ groupesCours: [GC, jumeau], confirmer: false });
        e.ouvrir('GC_1');
        expect(e.choisir('cours', 'C_AUTRE')).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.el('v2-gc-cours').value).toBe('C_COURS');
    });

    it('un échec d\'écriture : la fiche en base ne bouge pas, aucun message', () => {
        const e = monter({ echec: true });
        e.ouvrir('GC_1');
        expect(e.choisir('pratique', 'PRAT_1')).toBe(false);
        expect(e.store.test_groupesCours[0].pratiqueId).toBeNull();
        expect(e.toasts).toEqual([]);
    });
});

describe('lot E2 · nouveau groupe-cours — rien avant « Créer le groupe-cours »', () => {
    const remplir = (e) => { e.el('v2-gc-trimestre').value = 'test'; e.el('v2-gc-cours').value = 'C_AUTRE'; e.el('v2-gc-groupe').value = '00002'; e.el('v2-gc-horaire').value = 'HOR1'; e.el('v2-gc-enseignant').value = 'ENS1'; };

    it('les sélections n\'écrivent rien ; « Créer le groupe-cours » paraît ; la fiche retient le rechargement', async () => {
        const e = monter();
        await e.win.nouveauGroupeCoursV2();
        remplir(e);
        expect(e.win.changerChampGroupeCoursV2(e.el('v2-gc-enseignant'))).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.el('v2-btnCreerGroupeCours').classList.contains('u-hide')).toBe(false);
        expect(e.fiches.groupeCours()).toBe(true);
    });

    it('le trimestre prérempli seul ne compte pas pour une saisie', async () => {
        const e = monter();
        await e.win.nouveauGroupeCoursV2();
        e.el('v2-gc-trimestre').value = 'test';
        expect(e.fiches.groupeCours()).toBe(false);
    });

    it('« Créer le groupe-cours » écrit ; « Groupe-cours « … » créé. » ; la fiche passe en modification', async () => {
        const e = monter();
        await e.win.nouveauGroupeCoursV2();
        remplir(e);
        expect(e.win.sauvegarderGroupeCoursV2()).toBe(true);
        expect(e.store.test_groupesCours).toHaveLength(2);
        expect(e.sauvegarder.mock.calls[0][2]).toEqual({ geste: 'Créer le groupe-cours' });
        expect(e.toasts).toHaveLength(1);
        expect(e.toasts[0]).toMatch(/^Groupe-cours « .+ » créé\.$/);
        expect(e.el('v2-btnCreerGroupeCours').classList.contains('u-hide')).toBe(true);
        expect(e.fiches.groupeCours()).toBe(false);
    });

    it('un échec d\'écriture à la création : aucun message, la fiche reste en création', async () => {
        const e = monter({ echec: true });
        await e.win.nouveauGroupeCoursV2();
        remplir(e);
        expect(e.win.sauvegarderGroupeCoursV2()).toBe(false);
        expect(e.toasts).toEqual([]);
        expect(e.fiches.groupeCours()).toBe(true);
    });

    it('« Fermer » en création pose la question ; « Rester » garde la saisie', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauGroupeCoursV2();
        remplir(e);
        await e.win.fermerFicheGroupeCoursV2();
        expect(e.questions).toEqual(['groupeCours']);
        expect(e.el('v2-formulaireGroupeCours').classList.contains('u-hide')).toBe(false);
        expect(e.el('v2-gc-cours').value).toBe('C_AUTRE');
    });

    it('choisir un autre groupe-cours pendant une création : la question ; « Rester » garde la création', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauGroupeCoursV2();
        remplir(e);
        e.el('v2-selectGroupeCours').value = 'GC_1';
        await e.win.choisirGroupeCoursV2(e.el('v2-selectGroupeCours'));
        expect(e.questions).toEqual(['groupeCours']);
        expect(e.el('v2-selectGroupeCours').value).toBe('');
        expect(e.el('v2-gc-cours').value).toBe('C_AUTRE');
    });
});
