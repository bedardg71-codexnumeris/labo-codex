import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E2 DE L'ENREGISTREMENT — LE COURS OU SERVICE (D3, 28 sept. 2026)
//
// Une fiche existante s'enregistre toute seule, champ par champ, par le même écrivain que
// la création (`sauvegarderCoursV2` : vérifications #540, garde #455, CoursEntite) ; le
// témoin commun parle après l'écriture de l'entité (`ecrireEtAnnoncer`, espionné ici).
// « Créer le cours » / « Créer le service » est le seul geste qui crée ; « Annuler »
// devient « Fermer » ; la question de sortie porte le mot de la fiche. Noms fictifs.

const clone = (x) => JSON.parse(JSON.stringify(x));
function classList() { const s = new Set(); return { s, add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', placeholder: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: classList(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }, closest() { return null; }, focus() {}, scrollIntoView() {} };
}

const COURS = { id: 'C1', nature: 'cours', codeCours: '601-101-MQ', nomCours: 'Écriture fictive', discipline: '601 Français', ponderation: '2-2-3', competence: 'Analyser', numeroCompetence: '4EF0' };
const AUTRE = { id: 'C2', nature: 'cours', codeCours: '601-102-MQ', nomCours: 'Littérature fictive', discipline: '601 Français', ponderation: '2-2-3' };

function monter({ cours = [COURS, AUTRE], confirmer = true, quitter = true, echec = false } = {}) {
    const store = { cours: clone(cours), infoCours: null };
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null,
        querySelectorAll: () => [], createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
    document.getElementById('cours-formulaire-edition').classList.add('u-hide');
    document.getElementById('v2-btnCreerCours').classList.add('u-hide');
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, removeSync: (k) => { delete store[k]; } };
    const toasts = [];
    const notifications = { succes: (t) => toasts.push(t), erreur: (t) => toasts.push('ERREUR ' + t), info() {} };
    const appels = { creer: [], maj: [] };
    const CoursEntite = {
        creer: async (d) => { appels.creer.push(clone(d)); const c = Object.assign({ id: 'C_NEUF' }, d); store.cours.push(c); return c; },
        mettreAJour: async (id, d) => { appels.maj.push({ id, d: clone(d) }); store.cours = store.cours.map(c => (c.id === id ? Object.assign({}, c, d) : c)); return store.cours.find(c => c.id === id); },
        chercherDoublonCode: async (d, o) => store.cours.find(c => c.codeCours === d.codeCours && (!o || c.id !== o.exclureId)) || null
    };
    const ecrits = [];
    const ecrireEtAnnoncer = vi.fn(async (cleE, ecrire, options) => {
        if (echec) throw new Error('panne simulée');
        const r = await ecrire(); if (r) ecrits.push({ cle: cleE, geste: options && options.geste }); return r;
    });
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const fiches = {};
    const questions = [];
    const uiDialogues = {
        declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
        quitterCreationSiConfirme: vi.fn(async (g, titre) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(titre); return quitter; })
    };
    const win = { addEventListener() {}, temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1), uiDialogues };
    chargerScript('js/trimestre-v2-cours.js', { document, db, notifications, CoursEntite, ecrireEtAnnoncer,
        echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s),
        confirm: () => confirmer, alert() {}, toggleDisplay() {}, setTimeout: () => 0 }, win);
    const el = (id) => document.getElementById(id);
    const ouvrir = (id) => { el('v2-selectCours').value = id; win.changerCoursSelectionneV2(id); };
    const saisir = async (id, v) => { el(id).value = v; return win.sauvegarderChampCoursV2(); };
    return { win, store, el, appels, ecrits, temoin, toasts, questions, fiches, ouvrir, saisir, ecrireEtAnnoncer };
}

describe('lot E2 · fiche existante — champ par champ, par le témoin', () => {
    it('un champ modifié s\'écrit tout seul : mettreAJour, geste « Modifier le cours », aucun message, le formulaire reste ouvert', async () => {
        const e = monter();
        e.ouvrir('C1');
        expect(await e.saisir('v2-competence', 'Analyser des textes')).toBe(true);
        expect(e.appels.maj).toHaveLength(1);
        expect(e.appels.maj[0].d.competence).toBe('Analyser des textes');
        expect(e.ecrits).toEqual([{ cle: 'cours', geste: 'Modifier le cours' }]);
        expect(e.toasts).toEqual([]);
        expect(e.el('cours-formulaire-edition').classList.contains('u-hide')).toBe(false);
        expect(e.el('v2-btnCreerCours').classList.contains('u-hide')).toBe(true);
    });

    it('un champ requis vidé : « Non enregistré – Modifier le cours : … », rien d\'écrit', async () => {
        const e = monter();
        e.ouvrir('C1');
        expect(await e.saisir('v2-codeCours', '')).toBe(false);
        expect(e.appels.maj).toHaveLength(0);
        expect(e.temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(e.temoin.nonEnregistre.mock.calls[0][1]).toBe('Modifier le cours');
        expect(e.temoin.nonEnregistre.mock.calls[0][0]).toMatch(/^le code du cours est requis/);
    });

    it('le code d\'une autre fiche : la question #455 ; « Annuler » remet le code en base', async () => {
        const e = monter({ confirmer: false });
        e.ouvrir('C1');
        expect(await e.saisir('v2-codeCours', '601-102-MQ')).toBe(false);
        expect(e.appels.maj).toHaveLength(0);
        expect(e.el('v2-codeCours').value).toBe('601-101-MQ');
    });

    it('un cours qui devient service : la question ; « Annuler » remet le menu, rien d\'écrit', async () => {
        const e = monter({ confirmer: false });
        e.ouvrir('C1');
        e.el('v2-natureCours').value = 'service';
        expect(await e.win.changerNatureFicheCoursV2()).toBe(false);
        expect(e.el('v2-natureCours').value).toBe('cours');
        expect(e.appels.maj).toHaveLength(0);
    });

    it('un cours qui devient service, confirmé : nature \'service\' en base, champs du devis vidés', async () => {
        const e = monter({ confirmer: true });
        e.ouvrir('C1');
        e.el('v2-natureCours').value = 'service';
        expect(await e.win.changerNatureFicheCoursV2()).toBe(true);
        expect(e.store.cours.find(c => c.id === 'C1')).toMatchObject({ nature: 'service', codeCours: '', discipline: '', ponderation: '' });
    });

    it('un échec d\'écriture : aucun message de réussite', async () => {
        const e = monter({ echec: true });
        e.ouvrir('C1');
        expect(await e.saisir('v2-competence', 'Autre')).toBe(false);
        expect(e.toasts).toEqual([]);
    });
});

describe('lot E2 · nouvelle fiche — rien avant « Créer le cours »', () => {
    const remplir = (e) => {
        e.el('v2-codeCours').value = '601-103-MQ'; e.el('v2-nomCours').value = 'Littérature québécoise fictive';
        e.el('v2-disciplineCours').value = '601 Français'; e.el('v2-ponderation').value = '2-2-3';
    };

    it('la saisie n\'écrit rien ; le bouton dit « Créer le cours », puis « Créer le service » si la nature bascule', async () => {
        const e = monter();
        await e.win.nouveauCoursV2();
        remplir(e);
        expect(await e.win.sauvegarderChampCoursV2()).toBe(false);
        expect(e.appels.creer).toHaveLength(0);
        expect(e.el('v2-btnCreerCours').classList.contains('u-hide')).toBe(false);
        expect(e.el('v2-btnCreerCours').textContent).toBe('Créer le cours');
        e.el('v2-natureCours').value = 'service'; e.win.changerNatureCoursV2();
        expect(e.el('v2-btnCreerCours').textContent).toBe('Créer le service');
        expect(e.fiches.cours()).toBe(true);
    });

    it('« Créer le cours » écrit, « Cours « … » créé. », puis la fiche s\'ouvre en modification', async () => {
        const e = monter();
        await e.win.nouveauCoursV2();
        remplir(e);
        expect(await e.win.sauvegarderCoursV2()).toBe(true);
        expect(e.appels.creer).toHaveLength(1);
        expect(e.ecrits).toEqual([{ cle: 'cours', geste: 'Créer le cours' }]);
        expect(e.toasts).toEqual(['Cours « 601-103-MQ » créé.']);
        expect(e.el('v2-btnCreerCours').classList.contains('u-hide')).toBe(true);
        expect(e.fiches.cours()).toBe(false);
    });

    it('« Fermer » en création : la question au mot de la fiche ; « Rester » garde la saisie', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauCoursV2();
        remplir(e);
        e.el('v2-natureCours').value = 'service'; e.win.changerNatureCoursV2();
        await e.win.fermerFicheCoursV2();
        expect(e.questions).toEqual(['Ce service n\'est pas encore créé.']);
        expect(e.el('cours-formulaire-edition').classList.contains('u-hide')).toBe(false);
        expect(e.el('v2-nomCours').value).toBe('Littérature québécoise fictive');
    });

    it('choisir une autre fiche pendant une création : la question ; « Rester » garde la création', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauCoursV2();
        remplir(e);
        e.el('v2-selectCours').value = 'C1';
        await e.win.choisirCoursV2(e.el('v2-selectCours'));
        expect(e.questions).toEqual(['Ce cours n\'est pas encore créé.']);
        expect(e.el('v2-selectCours').value).toBe('');
        expect(e.el('v2-codeCours').value).toBe('601-103-MQ');
    });
});
