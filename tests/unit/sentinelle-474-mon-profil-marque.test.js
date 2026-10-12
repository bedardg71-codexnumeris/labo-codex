import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #474 (lot 8, consigne de Cowork du 11 oct. 2026, constat CT-10) — « MON PROFIL » N'EST PLUS REMPLACÉ
// PAR LE DERNIER PROFIL MODIFIÉ.
//
// `profilEnseignant` est la copie que lisent en repli le groupe-cours (`'profil'`), l'attribution CC,
// l'export PDF et le codex. Avant, chaque profil enregistré l'écrasait : modifier la fiche d'un collègue
// faisait de lui « moi ». Le marqueur explicite est `profilEnseignant.enseignantId`, posé par un geste
// qui écrit déjà la copie, jamais au chargement. SANS LA PURGE : supprimer un profil n'efface pas la
// copie (suppression de donnée : à Grégoire, inscrit à la fiche).
// Même montage que `sentinelle-lot-e2-enseignant`. Noms fictifs.

const PROFIL = { id: 'ENS_1', prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca', institution: 'Cégep fictif', departement: '', discipline: '', siteWeb: '' };
let compteurIds = 0;
const COLLEGUE = { id: 'ENS_2', prenom: 'Alan', nom: 'Turing', courriel: 'alan@exemple.qc.ca', institution: 'Cégep fictif', departement: '', discipline: '', siteWeb: '' };

function monter({ enseignants = [PROFIL, COLLEGUE], copie = undefined, confirmer = true, quitter = true } = {}) {
    const store = { enseignants: JSON.parse(JSON.stringify(enseignants)) };
    if (copie !== undefined) store.profilEnseignant = JSON.parse(JSON.stringify(copie));
    const classes = {};
    const el = (id, cl = []) => {
        classes[id] = new Set(cl);
        return { value: '', textContent: '', focus() {}, classList: {
            add: (c) => classes[id].add(c), remove: (c) => classes[id].delete(c), contains: (c) => classes[id].has(c),
            toggle: (c, f) => { if (f) classes[id].add(c); else classes[id].delete(c); } } };
    };
    const ids = {
        'enseignant-etat-vide': el('enseignant-etat-vide'),
        'enseignant-formulaire-edition': el('enseignant-formulaire-edition', ['u-hide']),
        'v2-selectEnseignant': el('v2-selectEnseignant'),
        'v2-titreFormEnseignant': el('v2-titreFormEnseignant'),
        'v2-btnCreerEnseignant': el('v2-btnCreerEnseignant', ['u-hide'])
    };
    for (const c of ['prenom', 'nom', 'courriel', 'institution', 'departement', 'discipline', 'siteWeb']) ids['v2-ens-' + c] = el('v2-ens-' + c);
    const db = { getSync: (k, d) => (k in store ? store[k] : d), setSync: (k, v) => { store[k] = v; } };
    const sauvegarder = vi.fn((k, v) => { store[k] = v; return true; });
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const notifications = { succes: vi.fn(), erreur: vi.fn() };
    const synthese = vi.fn();
    // Comme le vrai (ui-dialogues.js) : la question n'est posée que si la fiche porte une saisie.
    const quitterCreationSiConfirme = vi.fn(async (genre) => (fiches[genre] && fiches[genre]() ? quitter : true));
    const fiches = {};
    const win = chargerScript('js/trimestre-v2-enseignants.js', {
        db, notifications, cle: (k) => k,
        sauvegarderDonneesSelonMode: sauvegarder,
        confirm: () => confirmer,
        genererIdUnique: (p) => p + 'NEUF' + (++compteurIds),   // un id par création (deux créations au même banc)
        trouverDoublonNaturel: (liste, obj, cleFn, opts) => liste.find(e => e.courriel === obj.courriel && (!opts || e.id !== opts.exclureId)) || null,
        cleNaturelleEnseignant: (e) => e.courriel,
        motsNatureContexteActif: () => ({ choisirPersonne: '—' }),
        echapperHtml: (t) => String(t), echapperAttribut: (t) => String(t),
        document: { getElementById: (id) => ids[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] }
    }, {
        temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1) + '.',
        afficherSyntheseEnseignant: synthese,
        uiDialogues: { quitterCreationSiConfirme, declarerFicheEnCreation: (g, p) => { fiches[g] = p; } }
    });
    const ouvrir = async (id) => { ids['v2-selectEnseignant'].value = id; await win.chargerEnseignantSelectionneV2(); };
    const saisir = (champ, valeur) => { ids['v2-ens-' + champ].value = valeur; return win.sauvegarderChampEnseignantV2(ids['v2-ens-' + champ]); };
    return { win, store, ids, classes, sauvegarder, temoin, notifications, synthese, quitterCreationSiConfirme, fiches, ouvrir, saisir };
}


describe('#474 — la copie « mon profil » ne suit que mon profil', () => {
    it('1. copie marquée : modifier le collègue ne la touche pas ; modifier mon profil la met à jour', async () => {
        const e = monter({ copie: { ...PROFIL, enseignantId: 'ENS_1' } });
        await e.ouvrir('ENS_2');
        expect(e.saisir('departement', 'Mathématiques')).toBe(true);
        expect(e.store.profilEnseignant).toMatchObject({ prenom: 'Ada', enseignantId: 'ENS_1', departement: '' });
        await e.ouvrir('ENS_1');
        expect(e.saisir('departement', 'Lettres')).toBe(true);
        expect(e.store.profilEnseignant).toMatchObject({ prenom: 'Ada', enseignantId: 'ENS_1', departement: 'Lettres' });
    });
    it('2. copie d\'avant ce lot (sans marque) : le profil de même courriel est le mien et la marque ; un autre ne la touche pas', async () => {
        const e = monter({ copie: { prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca' } });
        await e.ouvrir('ENS_2');
        e.saisir('departement', 'Mathématiques');
        expect(e.store.profilEnseignant, 'le collègue ne devient pas « moi »').toEqual({ prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca' });
        await e.ouvrir('ENS_1');
        e.saisir('departement', 'Lettres');
        expect(e.store.profilEnseignant).toMatchObject({ enseignantId: 'ENS_1', departement: 'Lettres' });
    });
    it('2 bis. la marque suffit quand mon courriel a changé depuis la copie', async () => {
        const e = monter({ enseignants: [{ ...PROFIL, courriel: 'ada.nouveau@exemple.qc.ca' }, COLLEGUE], copie: { ...PROFIL, enseignantId: 'ENS_1' } });
        await e.ouvrir('ENS_1');
        e.saisir('departement', 'Lettres');
        expect(e.store.profilEnseignant).toMatchObject({ enseignantId: 'ENS_1', courriel: 'ada.nouveau@exemple.qc.ca', departement: 'Lettres' });
    });
    it('3. aucune copie : le premier profil créé devient le mien, marqué ; le second ne la touche pas', () => {
        const e = monter({ enseignants: [] });
        e.win.nouveauProfilEnseignantV2 && e.win.nouveauProfilEnseignantV2();
        const remplir = (p) => { for (const c of ['prenom', 'nom', 'courriel', 'institution']) e.ids['v2-ens-' + c].value = p[c]; };
        remplir(PROFIL);
        expect(e.win.creerProfilEnseignantV2()).toBe(true);
        const monId = e.store.profilEnseignant.enseignantId;
        expect(monId).toBeTruthy();
        expect(e.store.profilEnseignant.prenom).toBe('Ada');
        e.win.fermerFicheEnseignantV2();
        return Promise.resolve().then(() => {
            remplir(COLLEGUE);
            e.win.creerProfilEnseignantV2();
            expect(e.store.enseignants.length).toBe(2);
            expect(e.store.profilEnseignant).toMatchObject({ prenom: 'Ada', enseignantId: monId });
        });
    });
});
