import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E2 DE L'ENREGISTREMENT — L'HORAIRE (D3, 28 sept. 2026)
//
// Un horaire existant s'enregistre tout seul, champ par champ (séances comprises), par le
// même écrivain que la création (`sauvegarderHoraireV2` : vérifications #540 et #478) ;
// « Créer l'horaire » est le seul geste qui crée ; « Annuler » devient « Fermer » ; le
// message de réussite ne part qu'après l'écriture. Tout passe par
// `sauvegarderDonneesSelonMode` (le témoin commun), espionné ici. Noms fictifs.

function element(classes = [], valeur = '') {
    const set = new Set(classes);
    return { value: valeur, textContent: '', innerHTML: '', options: [], focus() {}, scrollIntoView() {},
        classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c),
            toggle: (c, f) => { if (f === undefined ? !set.has(c) : f) set.add(c); else set.delete(c); } } };
}

const EXISTANT = { id: 'HOR_1', groupeAssocie: '00001', nom: 'Lun-Mer fictif', seances: [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' }] };

function monter({ horaires = [EXISTANT], quitter = true, echec = false } = {}) {
    const ids = {
        'v2-btnSupprimerHoraire': element(['u-hide']), 'v2-selectHoraire': element(), 'v2-titreFormHoraire': element(),
        'v2-btnCreerHoraire': element(['u-hide']), 'v2-carteResumeHoraire': element(), 'v2-horaireEtatVide': element(),
        'v2-formulaireHoraire': element(['u-hide']),
        'v2-hor-groupeAssocie': element(), 'v2-hor-nom': element(), 'v2-hor-nbSeances': element([], '1'),
        'v2-hor-seance-0-jour': element([], 'Lundi'), 'v2-hor-seance-0-debut': element([], '08:00'), 'v2-hor-seance-0-fin': element([], '10:00'),
        'v2-hor-seance-0-periodes': element(), 'v2-hor-seance-0-local': element()
    };
    ids['v2-hor-groupeAssocie'].options = [{ value: '' }, { value: '00001' }];
    const stores = { a2026_horaires: JSON.parse(JSON.stringify(horaires)), a2026_horaireHebdo: [], a2026_groupeEtudiants: [] };
    const sauvegarder = vi.fn((k, v, o) => { if (echec) return false; stores['a2026_' + k] = JSON.parse(JSON.stringify(v)); return true; });
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const toasts = [];
    const fiches = {};
    const questions = [];
    const uiDialogues = {
        declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
        quitterCreationSiConfirme: vi.fn(async (g) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(g); return quitter; })
    };
    const win = chargerScript('js/trimestre-v2-horaires.js', {
        document: { getElementById: (id) => ids[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], createElement: () => element() },
        db: { getSync: (k, d) => (k in stores ? JSON.parse(JSON.stringify(stores[k])) : d), setSync: (k, v) => { stores[k] = v; } },
        cle: (n) => 'a2026_' + n,
        sauvegarderDonneesSelonMode: sauvegarder,
        echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'NEUF', calculerHeureFin: () => '10:00',
        fusionnerSeancesHoraires: (hs) => (hs || []).flatMap(h => (h && h.seances) || []),
        notifications: { succes: (t) => toasts.push(t), erreur: (t) => toasts.push('ERREUR ' + t) },
        estEnModeDemo: () => false
    }, { temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1), uiDialogues });
    win.populerDropdownsAssemblageV2 = () => {};
    const ouvrir = (id) => win.changerHoraireSelectionneV2(id);
    const remplirSeance = () => { ids['v2-hor-seance-0-periodes'].value = '2'; ids['v2-hor-seance-0-local'].value = 'A-101'; };
    return { win, ids, stores, sauvegarder, temoin, toasts, fiches, questions, ouvrir, remplirSeance };
}

describe('lot E2 · horaire existant — champ par champ, par le témoin', () => {
    it('le nom modifié s\'écrit tout seul, geste « Modifier l\'horaire », aucun message ; l\'horaire hebdo dérivé est discret', () => {
        const e = monter();
        e.ouvrir('HOR_1');
        e.remplirSeance();
        e.ids['v2-hor-nom'].value = 'Lun-Mer fictif, local B';
        expect(e.win.sauvegarderChampHoraireV2()).toBe(true);
        expect(e.stores.a2026_horaires[0].nom).toBe('Lun-Mer fictif, local B');
        expect(e.sauvegarder.mock.calls[0]).toEqual(['horaires', expect.any(Array), { geste: 'Modifier l\'horaire' }]);
        expect(e.sauvegarder.mock.calls[1]).toEqual(['horaireHebdo', expect.any(Array), { geste: 'Modifier l\'horaire', discret: true }]);
        expect(e.toasts).toEqual([]);
        expect(e.ids['v2-btnCreerHoraire'].classList.contains('u-hide')).toBe(true);
    });

    it('une séance sans périodes : « Non enregistré – Modifier l\'horaire : séance 1 : … », rien d\'écrit', () => {
        const e = monter();
        e.ouvrir('HOR_1');
        e.ids['v2-hor-seance-0-periodes'].value = '';
        expect(e.win.sauvegarderChampHoraireV2()).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.temoin.nonEnregistre.mock.calls[0][1]).toBe('Modifier l\'horaire');
        expect(e.temoin.nonEnregistre.mock.calls[0][0]).toMatch(/^séance 1 : nombre de périodes manquant/);
    });

    it('un échec d\'écriture : l\'horaire en base ne bouge pas, aucun message', () => {
        const e = monter({ echec: true });
        e.ouvrir('HOR_1');
        e.remplirSeance();
        e.ids['v2-hor-nom'].value = 'Autre nom';
        expect(e.win.sauvegarderChampHoraireV2()).toBe(false);
        expect(e.stores.a2026_horaires[0].nom).toBe('Lun-Mer fictif');
        expect(e.toasts).toEqual([]);
    });
});

describe('lot E2 · nouvel horaire — rien avant « Créer l\'horaire »', () => {
    // « + Nouvel horaire » propose deux séances ; ce faux document n'en porte qu'une.
    const remplir = (e) => { e.ids['v2-hor-nbSeances'].value = '1'; e.ids['v2-hor-groupeAssocie'].value = '00001'; e.ids['v2-hor-nom'].value = 'Mar-Jeu fictif'; e.remplirSeance(); };

    it('la saisie n\'écrit rien ; « Créer l\'horaire » paraît ; la fiche retient le rechargement', async () => {
        const e = monter({ horaires: [] });
        await e.win.nouveauHoraireV2();
        remplir(e);
        expect(e.win.sauvegarderChampHoraireV2()).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.ids['v2-btnCreerHoraire'].classList.contains('u-hide')).toBe(false);
        expect(e.fiches.horaire()).toBe(true);
    });

    it('les défauts d\'une séance (jour, heures) ne comptent pas pour une saisie', async () => {
        const e = monter({ horaires: [] });
        await e.win.nouveauHoraireV2();
        expect(e.fiches.horaire()).toBe(false);
    });

    it('« Créer l\'horaire » écrit ; « Horaire « … » créé. » ; la fiche passe en modification', async () => {
        const e = monter({ horaires: [] });
        await e.win.nouveauHoraireV2();
        remplir(e);
        expect(e.win.sauvegarderHoraireV2()).toBe(true);
        expect(e.stores.a2026_horaires).toHaveLength(1);
        expect(e.sauvegarder.mock.calls[0][2]).toEqual({ geste: 'Créer l\'horaire' });
        expect(e.toasts).toEqual(['Horaire « Mar-Jeu fictif » créé.']);
        expect(e.ids['v2-btnCreerHoraire'].classList.contains('u-hide')).toBe(true);
        expect(e.fiches.horaire()).toBe(false);
    });

    it('un échec d\'écriture à la création : aucun message, la fiche reste en création', async () => {
        const e = monter({ horaires: [], echec: true });
        await e.win.nouveauHoraireV2();
        remplir(e);
        expect(e.win.sauvegarderHoraireV2()).toBe(false);
        expect(e.toasts).toEqual([]);
        expect(e.fiches.horaire()).toBe(true);
    });

    it('« Fermer » en création pose la question ; « Rester » garde la saisie', async () => {
        const e = monter({ horaires: [], quitter: false });
        await e.win.nouveauHoraireV2();
        remplir(e);
        await e.win.fermerFicheHoraireV2();
        expect(e.questions).toEqual(['horaire']);
        expect(e.ids['v2-formulaireHoraire'].classList.contains('u-hide')).toBe(false);
        expect(e.ids['v2-hor-nom'].value).toBe('Mar-Jeu fictif');
    });

    it('choisir un autre horaire pendant une création : la question ; « Rester » garde la création', async () => {
        const e = monter({ quitter: false });
        await e.win.nouveauHoraireV2();
        remplir(e);
        e.ids['v2-selectHoraire'].value = 'HOR_1';
        await e.win.choisirHoraireV2(e.ids['v2-selectHoraire']);
        expect(e.questions).toEqual(['horaire']);
        expect(e.ids['v2-selectHoraire'].value).toBe('');
        expect(e.ids['v2-hor-nom'].value).toBe('Mar-Jeu fictif');
    });
});
