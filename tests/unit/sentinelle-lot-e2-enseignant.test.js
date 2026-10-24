import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E2 DE L'ENREGISTREMENT — LE PROFIL ENSEIGNANT (D3, 28 sept. 2026)
//
// Un profil existant s'enregistre tout seul, champ par champ ; « Créer le profil » est le
// seul geste qui crée ; « Annuler » devient « Fermer ». (La carte de synthèse, qui ne montrait plus
// que ce qui était écrit, est partie avec la colonne de gauche du Cadre : #1148, 24 oct. 2026 — la
// fiche montre les mêmes champs.) Tout passe par
// `sauvegarderDonneesSelonMode` (le témoin commun), espionné ici. Noms fictifs.

const PROFIL = { id: 'ENS_1', prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca', institution: 'Cégep fictif', departement: '', discipline: '', siteWeb: '' };

function monter({ enseignants = [PROFIL], confirmer = true, quitter = true } = {}) {
    const store = { enseignants: JSON.parse(JSON.stringify(enseignants)) };
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
    // Comme le vrai (ui-dialogues.js) : la question n'est posée que si la fiche porte une saisie.
    const quitterCreationSiConfirme = vi.fn(async (genre) => (fiches[genre] && fiches[genre]() ? quitter : true));
    const fiches = {};
    const win = chargerScript('js/trimestre-v2-enseignants.js', {
        db, notifications, cle: (k) => k,
        sauvegarderDonneesSelonMode: sauvegarder,
        confirm: () => confirmer,
        genererIdUnique: (p) => p + 'NEUF',
        trouverDoublonNaturel: (liste, obj, cleFn, opts) => liste.find(e => e.courriel === obj.courriel && (!opts || e.id !== opts.exclureId)) || null,
        cleNaturelleEnseignant: (e) => e.courriel,
        motsNatureContexteActif: () => ({ choisirPersonne: '—' }),
        echapperHtml: (t) => String(t), echapperAttribut: (t) => String(t),
        document: { getElementById: (id) => ids[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] }
    }, {
        temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1) + '.',
        uiDialogues: { quitterCreationSiConfirme, declarerFicheEnCreation: (g, p) => { fiches[g] = p; } }
    });
    const ouvrir = async (id) => { ids['v2-selectEnseignant'].value = id; await win.chargerEnseignantSelectionneV2(); };
    const saisir = (champ, valeur) => { ids['v2-ens-' + champ].value = valeur; return win.sauvegarderChampEnseignantV2(ids['v2-ens-' + champ]); };
    return { win, store, ids, classes, sauvegarder, temoin, notifications, quitterCreationSiConfirme, fiches, ouvrir, saisir };
}

describe('lot E2 · profil existant — champ par champ, par le témoin', () => {
    it('un champ modifié s\'écrit tout seul, geste « Modifier le profil »', async () => {
        const e = monter();
        await e.ouvrir('ENS_1');
        expect(e.saisir('departement', 'Lettres')).toBe(true);
        expect(e.sauvegarder).toHaveBeenCalledTimes(1);
        expect(e.sauvegarder.mock.calls[0][0]).toBe('enseignants');
        expect(e.sauvegarder.mock.calls[0][2]).toEqual({ geste: 'Modifier le profil' });
        expect(e.store.enseignants[0]).toMatchObject({ id: 'ENS_1', departement: 'Lettres' });
        expect(e.store.profilEnseignant).toMatchObject({ departement: 'Lettres' });
        expect(e.notifications.succes).not.toHaveBeenCalled();
    });

    it('un champ obligatoire vidé : « Non enregistré : ‹raison› », rien d\'écrit', async () => {
        const e = monter();
        await e.ouvrir('ENS_1');
        expect(e.saisir('institution', '')).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith('l\'institution est requise.', 'Modifier le profil', 'enseignants');
    });

    it('un courriel déjà porté par un autre profil : la question de CT-15 ; « Annuler » remet le courriel en base', async () => {
        const autre = { ...PROFIL, id: 'ENS_2', prenom: 'Bob', courriel: 'bob@exemple.qc.ca' };
        const e = monter({ enseignants: [PROFIL, autre], confirmer: false });
        await e.ouvrir('ENS_1');
        expect(e.saisir('courriel', 'bob@exemple.qc.ca')).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.ids['v2-ens-courriel'].value).toBe('ada@exemple.qc.ca');
    });

    it('en édition, « Créer le profil » est caché ; « Fermer » ne pose aucune question utile et referme', async () => {
        const e = monter();
        await e.ouvrir('ENS_1');
        expect(e.classes['v2-btnCreerEnseignant'].has('u-hide')).toBe(true);
        await e.win.fermerFicheEnseignantV2();
        expect(e.classes['enseignant-formulaire-edition'].has('u-hide')).toBe(true);
        expect(e.fiches.enseignant()).toBe(false);
    });
});

describe('lot E2 · nouveau profil — rien avant « Créer le profil »', () => {
    const remplir = (e) => {
        e.ids['v2-ens-prenom'].value = 'Grace'; e.ids['v2-ens-nom'].value = 'Hopper';
        e.ids['v2-ens-courriel'].value = 'grace@exemple.qc.ca'; e.ids['v2-ens-institution'].value = 'Cégep fictif';
    };

    it('la saisie n\'écrit rien, la fiche retient le rechargement', async () => {
        const e = monter();
        await e.win.nouveauProfilEnseignantV2();
        remplir(e);
        expect(e.win.sauvegarderChampEnseignantV2(e.ids['v2-ens-nom'])).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.fiches.enseignant()).toBe(true);
        expect(e.classes['v2-btnCreerEnseignant'].has('u-hide')).toBe(false);
    });

    it('« Créer le profil » écrit, puis la fiche passe en modification ; « Profil « … » créé. »', async () => {
        const e = monter();
        await e.win.nouveauProfilEnseignantV2();
        remplir(e);
        expect(e.win.creerProfilEnseignantV2()).toBe(true);
        expect(e.store.enseignants).toHaveLength(2);
        expect(e.store.enseignants[1]).toMatchObject({ id: 'ENS_NEUF', prenom: 'Grace', nom: 'Hopper' });
        expect(e.sauvegarder.mock.calls[0][2]).toEqual({ geste: 'Créer le profil' });
        expect(e.notifications.succes).toHaveBeenCalledWith('Profil « Grace Hopper » créé.');
        expect(e.classes['v2-btnCreerEnseignant'].has('u-hide')).toBe(true);
        expect(e.fiches.enseignant()).toBe(false);
    });

    it('« Créer le profil » incomplet : « Non enregistré – Créer le profil : … », aucun succès', async () => {
        const e = monter();
        await e.win.nouveauProfilEnseignantV2();
        e.ids['v2-ens-prenom'].value = 'Grace';
        expect(e.win.creerProfilEnseignantV2()).toBe(false);
        expect(e.temoin.nonEnregistre.mock.calls[0][1]).toBe('Créer le profil');
        expect(e.notifications.succes).not.toHaveBeenCalled();
    });

    it('un échec d\'écriture : aucun message de réussite, la fiche reste en création', async () => {
        const e = monter();
        await e.win.nouveauProfilEnseignantV2();
        remplir(e);
        e.sauvegarder.mockImplementation(() => false);
        expect(e.win.creerProfilEnseignantV2()).toBe(false);
        expect(e.notifications.succes).not.toHaveBeenCalled();
        expect(e.classes['v2-btnCreerEnseignant'].has('u-hide')).toBe(false);
    });

    it('« Fermer » en création pose la question ; « Rester » garde la saisie', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauProfilEnseignantV2();
        remplir(e);
        await e.win.fermerFicheEnseignantV2();
        expect(e.quitterCreationSiConfirme).toHaveBeenCalledWith('enseignant');
        expect(e.ids['v2-ens-prenom'].value).toBe('Grace');
        expect(e.classes['enseignant-formulaire-edition'].has('u-hide')).toBe(false);
    });

    it('choisir un autre profil pendant une création pose la question ; « Rester » garde la création', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauProfilEnseignantV2();
        remplir(e);
        await e.ouvrir('ENS_1');
        expect(e.ids['v2-ens-prenom'].value).toBe('Grace');
        expect(e.ids['v2-selectEnseignant'].value).toBe('');
    });
});
