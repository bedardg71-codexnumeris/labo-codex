import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E2 DE L'ENREGISTREMENT — LA FICHE D'UN·E ÉTUDIANT·E (D3, 28 sept. 2026)
//
// Une fiche existante s'enregistre toute seule, champ par champ, par le même écrivain que
// l'ajout (`soumettreEtudiantV2` : DA #914, doublon L-8, fiche retrouvée #382) ; le témoin
// commun parle (`modifierEtAnnoncer`, espionné ici). « Ajouter l'étudiant·e » est le seul
// geste qui ajoute ; « Annuler » devient « Fermer ». Mots tranchés par Grégoire le 28 sept. :
// « Cet·te étudiant·e n'est pas encore ajouté·e. », « Étudiant·e « … » ajouté·e. ». Noms fictifs.

const clone = (x) => JSON.parse(JSON.stringify(x));
function element(id) {
    const set = new Set();
    return { id, value: '', textContent: '', innerHTML: '', placeholder: '', dataset: {}, style: {}, disabled: false, options: [],
        classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c), toggle: (c, f) => { if (f) set.add(c); else set.delete(c); } },
        focus() {}, scrollIntoView() {}, setAttribute() {}, getAttribute: () => null, querySelector: () => null, querySelectorAll: () => [], appendChild(c) { return c; } };
}

function monter({ quitter = true, echec = false } = {}) {
    const store = {
        infoCours: { id: 'C1', nom: 'Cours banc', groupe: '00001' },
        test_groupeEtudiants: [{ da: '1000001', nom: 'Aubin', prenom: 'Léa', groupe: '00001', coursId: 'C1', statut: 'actif' }]
    };
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; }
    };
    const ecrits = [];
    const modifierEtAnnoncer = vi.fn(async (k, mutateur, defaut, options) => {
        if (echec) throw new Error('panne simulée');
        const r = await db.modifier(k, mutateur, defaut);
        if (r !== undefined) ecrits.push({ cle: k, geste: options && options.geste });
        return r;
    });
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = element(id))), createElement: () => element(null),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, documentElement: element('html'), body: element('body'), readyState: 'complete' };
    document.getElementById('v2-btnAnnulerEdition').classList.add('u-hide');
    const toasts = [];
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const fiches = {};
    const questions = [];
    const uiDialogues = {
        declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
        quitterCreationSiConfirme: vi.fn(async (g) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(g); return quitter; })
    };
    const win = { addEventListener() {}, cle: (k) => 'test_' + k, db, temoinEnregistrement: temoin,
        raisonPourTemoin: (r) => { const t = String(r || '').trim(); const d = t.charAt(0).toLowerCase() + t.slice(1); return /[.!?]$/.test(d) ? d : d + '.'; }, uiDialogues };
    chargerScript('js/trimestre-v2-etudiants.js', {
        document, db, cle: (k) => 'test_' + k, modifierEtAnnoncer, echapperHtml: (s) => String(s == null ? '' : s),
        normaliserNumeroGroupe: (g) => String(g || '').padStart(5, '0'),
        notifications: { succes: (t) => toasts.push(t), erreur: (t) => toasts.push('ERREUR ' + t), info() {}, warning() {} },
        prompt: () => null, alert() {}, confirm: () => true, toggleDisplay() {}
    }, win);
    const champ = (id) => document.getElementById(id);
    return { win, store, champ, ecrits, temoin, toasts, fiches, questions, modifierEtAnnoncer };
}

describe('lot E2 · fiche existante — champ par champ, par le témoin', () => {
    it('un champ modifié s\'écrit tout seul, geste « Modifier l\'étudiant·e », aucun message ; la fiche reste ouverte', async () => {
        const e = monter();
        await e.win.editerEtudiantV2('1000001');
        e.champ('v2-etudiantProgramme').value = '500.A1';
        expect(await e.win.sauvegarderChampEtudiantV2()).toBe(true);
        expect(e.store.test_groupeEtudiants[0]).toMatchObject({ da: '1000001', programme: '500.A1', statut: 'actif' });
        expect(e.ecrits).toEqual([{ cle: 'test_groupeEtudiants', geste: 'Modifier l\'étudiant·e' }]);
        expect(e.toasts).toEqual([]);
        expect(e.champ('v2-etudiantDA').value).toBe('1000001');                        // pas de retour à l'ajout
        expect(e.champ('v2-btnSoumettreEtudiant').classList.contains('u-hide')).toBe(true);
        expect(e.champ('v2-btnAnnulerEdition').classList.contains('u-hide')).toBe(false);
    });

    it('un nom vidé : « Non enregistré – Modifier l\'étudiant·e : le nom et le prénom sont obligatoires. », rien d\'écrit', async () => {
        const e = monter();
        await e.win.editerEtudiantV2('1000001');
        e.champ('v2-etudiantNom').value = '';
        expect(await e.win.sauvegarderChampEtudiantV2()).toBe(false);
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith('le nom et le prénom sont obligatoires.', 'Modifier l\'étudiant·e', 'test_groupeEtudiants');
    });

    it('le DA d\'une fiche existante ne se modifie pas : lecture seule, la phrase dit pourquoi, la base garde le DA (décision de Grégoire, 28 sept.)', async () => {
        const e = monter();
        e.store.test_groupeEtudiants.push({ da: '1000002', nom: 'Bédard', prenom: 'Zoé', groupe: '00001', coursId: 'C1' });
        await e.win.editerEtudiantV2('1000001');
        expect(e.champ('v2-etudiantDA').readOnly).toBe(true);
        expect(e.champ('v2-etudiantDAAide').classList.contains('u-hide')).toBe(false);
        // Quoi qu'on fasse du champ (formulaire, script, DA pris, DA vide, DA valide neuf) : la fiche garde son DA.
        for (const saisi of ['1000002', '', '2000077', 'abc']) {
            e.champ('v2-etudiantDA').value = saisi;
            e.champ('v2-etudiantProgramme').value = 'P' + saisi;
            expect(await e.win.sauvegarderChampEtudiantV2()).toBe(true);
            expect(e.store.test_groupeEtudiants.map(x => x.da)).toEqual(['1000001', '1000002']);
            expect(e.store.test_groupeEtudiants[0].programme).toBe('P' + saisi);
        }
        expect(e.temoin.nonEnregistre).not.toHaveBeenCalled();
        // « Fermer » : le champ redevient modifiable pour l'ajout, la phrase se cache.
        e.win.fermerFicheEtudiantV2();
        expect(e.champ('v2-etudiantDA').readOnly).toBe(false);
        expect(e.champ('v2-etudiantDAAide').classList.contains('u-hide')).toBe(true);
    });

    it('la phrase sous le DA, mot pour mot, et le champ n\'écrit plus rien de lui-même', () => {
        const html = readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        expect(html).toContain('<p id="v2-etudiantDAAide" class="texte-aide u-mt-5 u-hide">Le DA ne se modifie pas ici : il relie les évaluations et les présences de l\'étudiant·e.</p>');
        expect(html.match(/<input[^>]*id="v2-etudiantDA"[^>]*>/)[0]).not.toMatch(/data-on-change/);
    });

    it('« Fermer » ramène au formulaire d\'ajout', async () => {
        const e = monter();
        await e.win.editerEtudiantV2('1000001');
        e.win.fermerFicheEtudiantV2();
        expect(e.champ('v2-etudiantDA').value).toBe('');
        expect(e.champ('v2-btnSoumettreEtudiant').classList.contains('u-hide')).toBe(false);
        expect(e.champ('v2-btnAnnulerEdition').classList.contains('u-hide')).toBe(true);
    });

    it('un échec d\'écriture : aucun message', async () => {
        const e = monter({ echec: true });
        await e.win.editerEtudiantV2('1000001');
        e.champ('v2-etudiantProgramme').value = '500.A1';
        expect(await e.win.sauvegarderChampEtudiantV2()).toBe(false);
        expect(e.toasts).toEqual([]);
    });
});

describe('lot E2 · nouvelle fiche — rien avant « Ajouter l\'étudiant·e »', () => {
    const remplir = (e) => { e.champ('v2-etudiantDA').value = '2000009'; e.champ('v2-etudiantNom').value = 'Hamel'; e.champ('v2-etudiantPrenom').value = 'Noa'; };

    it('la saisie n\'écrit rien ; la fiche retient le rechargement ; le groupe prérempli ne compte pas', async () => {
        const e = monter();
        e.champ('v2-etudiantGroupe').value = '00001';
        expect(e.fiches.eleve()).toBe(false);
        remplir(e);
        expect(await e.win.sauvegarderChampEtudiantV2()).toBe(false);
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
        expect(e.fiches.eleve()).toBe(true);
    });

    it('« Ajouter l\'étudiant·e » écrit ; « Étudiant·e « … » ajouté·e. » ; le formulaire revient à l\'ajout', async () => {
        const e = monter();
        remplir(e);
        expect(await e.win.soumettreEtudiantV2()).toBe(true);
        expect(e.store.test_groupeEtudiants.map(x => x.da)).toEqual(['1000001', '2000009']);
        expect(e.ecrits[0].geste).toBe('Ajouter l\'étudiant·e');
        expect(e.toasts).toEqual(['Étudiant·e « Noa Hamel » ajouté·e.']);
        expect(e.champ('v2-etudiantDA').value).toBe('');
    });

    it('ouvrir une autre fiche pendant un ajout : la question ; « Rester » garde la saisie', async () => {
        const e = monter({ quitter: false });
        remplir(e);
        await e.win.editerEtudiantV2('1000001');
        expect(e.questions).toEqual(['eleve']);
        expect(e.champ('v2-etudiantDA').value).toBe('2000009');
        expect(e.champ('v2-etudiantNom').value).toBe('Hamel');
    });
});
