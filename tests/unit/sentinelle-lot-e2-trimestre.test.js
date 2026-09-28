import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E2 DE L'ENREGISTREMENT — LE TRIMESTRE DU CADRE (D3, 28 sept. 2026)
//
// Remplace la sentinelle #306 lot 2 (« save explicite », un bouton unique) : D3 la
// renverse. Modifier ce qui existe s'enregistre tout seul, champ par champ ; créer passe
// par un bouton qui nomme le geste (« Créer le trimestre »).
//
// Décisions techniques de Cowork (consigne du 28 sept., § 2), éprouvées ici :
//   - le NOM s'enregistre seul ; la SESSION et l'ANNÉE s'écrivent ENSEMBLE, au changement,
//     seulement quand les deux sont valides ; un état intermédiaire n'écrit rien et ne dit rien ;
//   - les gardes #379 disent leur refus par le témoin, remettent les champs, aucun succès ;
//   - le cadre s'écrit sous l'id EN VIGUEUR APRÈS l'identification ;
//   - aucune migration de clés.
// Tout passe par `sauvegarderDonneesSelonMode` (le témoin commun) : le harnais l'espionne.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDS_DATES = ['v2-debutTrimestre', 'v2-finCours', 'v2-finTrimestre', 'v2-remiseNotes',
    'v2-semainePlanificationDebut', 'v2-semainePlanificationFin', 'v2-semaineExamensDebut', 'v2-semaineExamensFin'];

function monter({ registre = [], champs = {}, donnees = {} } = {}) {
    const store = { trimestres: JSON.parse(JSON.stringify(registre)), ...donnees };
    const actif = registre.find(t => t.actif);
    if (actif) store.trimestreActif = actif.id;
    const ecritures = [];
    const db = {
        memoryCache: new Map(),
        getSync: (k, d) => (k in store ? store[k] : (d === undefined ? null : d)),
        setSync: (k, v) => { ecritures.push(k); store[k] = v; },
        removeSync: vi.fn((k) => { delete store[k]; })
    };
    // Le préfixe suit le trimestre actif du stock, comme `cle()` le lit dans trimestreActif.
    const cle = (k) => (k === 'trimestres' ? k : `${store.trimestreActif || ''}_${k}`);
    const elements = {};
    const classes = new Set(['u-hide']);
    for (const id of ['v2-nomTrimestre', 'v2-sessionTrimestre', 'v2-anneeTrimestre', ...IDS_DATES]) {
        elements[id] = { value: champs[id] || '' };
    }
    elements['v2-btnCreerTrimestre'] = { classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c) } };
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const notifications = { erreur: vi.fn(), succes: vi.fn() };
    const sauvegarder = vi.fn((cleBase, valeur, options) => {
        db.setSync(cle(cleBase), valeur);
        return true;
    });
    const genererCalendrierComplet = vi.fn();
    const fiches = {};
    const uiDialogues = { declarerFicheEnCreation: (genre, predicat) => { fiches[genre] = predicat; } };
    const win = chargerScript('js/trimestre-v2-init.js', {
        db, cle, notifications, genererCalendrierComplet,
        obtenirTrimestreActif: () => (store.trimestres || []).find(t => t && t.actif) || null,
        sauvegarderDonneesSelonMode: sauvegarder,
        localStorage: { get length() { return 0; }, key: () => null, getItem: () => null, setItem() {}, removeItem() {} },
        document: { getElementById: (id) => elements[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] },
        setTimeout: () => 0, setValue: () => {}
    }, { temoinEnregistrement: temoin, raisonPourTemoin: (r) => r, afficherStatistiquesTrimestreV2() {}, uiDialogues });
    return { win, store, db, elements, temoin, notifications, sauvegarder, ecritures, genererCalendrierComplet, fiches, boutonCache: () => classes.has('u-hide') };
}

const AUTOMNE_VIDE = [{ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: true }];

describe('lot E2 · trimestre existant — la session et l\'année s\'écrivent ensemble, au changement', () => {
    it('paire libre, trimestre sans données : UNE écriture du registre, l\'id suit, par le témoin', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-nomTrimestre': 'Automne 2026', 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2027' } });
        expect(e.win.sauvegarderIdentificationTrimestreV2()).toBe(true);
        expect(e.sauvegarder).toHaveBeenCalledTimes(1);
        expect(e.sauvegarder.mock.calls[0][0]).toBe('trimestres');
        expect(e.sauvegarder.mock.calls[0][2]).toEqual({ geste: 'Identification du trimestre' });
        expect(e.store.trimestres[0]).toMatchObject({ id: 'h2027', session: 'H', annee: 2027, actif: true });
        expect(e.store.trimestreActif).toBe('h2027');
    });

    it('état intermédiaire (session changée, année vide ou invalide) : rien d\'écrit, rien de dit', () => {
        for (const annee of ['', '20', '2026a']) {
            const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': annee } });
            expect(e.win.sauvegarderIdentificationTrimestreV2()).toBe(false);
            expect(e.sauvegarder).not.toHaveBeenCalled();
            expect(e.temoin.nonEnregistre).not.toHaveBeenCalled();
            expect(e.store.trimestres).toEqual(AUTOMNE_VIDE);
        }
    });

    it('paire prise : « Non enregistré », champs remis au stock, aucune clé déplacée, aucun succès', () => {
        const registre = [...AUTOMNE_VIDE, { id: 'h2027', nom: 'Hiver 2027', session: 'H', annee: 2027, actif: false }];
        const e = monter({ registre, champs: { 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2027' }, donnees: { a2026_cadreCalendrier: { dateDebut: '2026-08-25' } } });
        const clesAvant = Object.keys(e.store).sort();
        expect(e.win.sauvegarderIdentificationTrimestreV2()).toBe(false);
        expect(e.temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(e.temoin.nonEnregistre.mock.calls[0][1]).toBe('Identification du trimestre');
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.notifications.succes).not.toHaveBeenCalled();
        expect(e.elements['v2-sessionTrimestre'].value).toBe('automne');
        expect(e.elements['v2-anneeTrimestre'].value).toBe(2026);
        expect(Object.keys(e.store).sort()).toEqual(clesAvant);
    });

    it('trimestre qui a des données : « Changement bloqué » par le témoin, aucune clé déplacée', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2027' } });
        e.db.memoryCache.set('a2026_evaluationsSauvegardees', [{ id: 'EV1' }]);
        expect(e.win.sauvegarderIdentificationTrimestreV2()).toBe(false);
        expect(e.temoin.nonEnregistre.mock.calls[0][0]).toContain('contient des données');
        expect(e.store.trimestres[0].id).toBe('a2026');
        expect(e.store.trimestreActif).toBe('a2026');
    });

    it('un échec d\'écriture du registre : l\'id ne bascule pas, les champs reviennent', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2027' } });
        e.sauvegarder.mockImplementation(() => false);
        expect(e.win.sauvegarderIdentificationTrimestreV2()).toBe(false);
        expect(e.store.trimestreActif).toBe('a2026');
        expect(e.elements['v2-sessionTrimestre'].value).toBe('automne');
    });
});

describe('lot E2 · trimestre existant — le nom et les dates s\'enregistrent seuls', () => {
    it('le nom : écrit seul, l\'id ne bouge pas', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-nomTrimestre': 'Automne 2026 — groupe fictif' } });
        expect(e.win.sauvegarderNomTrimestreV2()).toBe(true);
        expect(e.store.trimestres[0]).toMatchObject({ id: 'a2026', nom: 'Automne 2026 — groupe fictif' });
    });

    it('une date seule : le cadre partiel est écrit, le calendrier généré est retiré, pas régénéré', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-debutTrimestre': '2026-08-25' }, donnees: { a2026_calendrierComplet: { x: 1 } } });
        expect(e.win.sauvegarderCadreCalendrierV2()).toBe(true);
        expect(e.store.a2026_cadreCalendrier).toMatchObject({ dateDebut: '2026-08-25', finCours: '', finTrimestre: '' });
        expect(e.db.removeSync).toHaveBeenCalledWith('a2026_calendrierComplet');
        expect(e.genererCalendrierComplet).not.toHaveBeenCalled();
        expect(e.notifications.succes).not.toHaveBeenCalled();
    });

    it('les trois dates obligatoires : le calendrier est régénéré', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-debutTrimestre': '2026-08-25', 'v2-finCours': '2026-12-11', 'v2-finTrimestre': '2026-12-22' } });
        expect(e.win.sauvegarderCadreCalendrierV2()).toBe(true);
        expect(e.genererCalendrierComplet).toHaveBeenCalledTimes(1);
        expect(e.sauvegarder.mock.calls[0][2]).toMatchObject({ geste: 'Modifier le cadre du trimestre' });
    });

    it('un échec d\'écriture du cadre : ni régénération, ni retrait du calendrier', () => {
        const e = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-debutTrimestre': '2026-08-25' } });
        e.sauvegarder.mockImplementation(() => false);
        expect(e.win.sauvegarderCadreCalendrierV2()).toBe(false);
        expect(e.db.removeSync).not.toHaveBeenCalled();
    });
});

describe('lot E2 · aucun trimestre actif — « Créer le trimestre »', () => {
    const SAISIE = { 'v2-nomTrimestre': '', 'v2-sessionTrimestre': 'automne', 'v2-anneeTrimestre': '2026', 'v2-debutTrimestre': '2026-08-25', 'v2-finCours': '2026-12-11', 'v2-finTrimestre': '2026-12-22' };

    it('rien n\'est écrit avant le clic : ni l\'identification, ni le nom, ni les dates', () => {
        const e = monter({ champs: SAISIE });
        e.win.sauvegarderIdentificationTrimestreV2();
        e.win.sauvegarderNomTrimestreV2();
        e.win.sauvegarderCadreCalendrierV2();
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.ecritures).toEqual([]);
    });

    it('le bouton paraît en création, disparaît après', () => {
        const e = monter();
        e.win.chargerIdentificationTrimestreV2();       // aucun trimestre actif : mode création (champs vidés)
        expect(e.boutonCache()).toBe(false);
        for (const [id, v] of Object.entries(SAISIE)) e.elements[id].value = v;   // puis la saisie
        expect(e.win.creerTrimestreV2()).toBe(true);
        expect(e.boutonCache()).toBe(true);
    });

    it('le clic écrit l\'identification PUIS le cadre, sous l\'id en vigueur après elle ; « Trimestre « … » créé. »', () => {
        const e = monter({ champs: SAISIE });
        expect(e.win.creerTrimestreV2()).toBe(true);
        expect(e.store.trimestres).toHaveLength(1);
        expect(e.store.trimestres[0]).toMatchObject({ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: true });
        expect(e.store.trimestreActif).toBe('a2026');
        expect(e.ecritures.indexOf('a2026_cadreCalendrier')).toBeGreaterThan(e.ecritures.indexOf('trimestres'));
        expect(e.store.a2026_cadreCalendrier).toMatchObject({ dateDebut: '2026-08-25', finTrimestre: '2026-12-22' });
        expect(Object.keys(e.store).some(k => k.startsWith('_'))).toBe(false);   // jamais sous un id vide
        expect(e.notifications.succes).toHaveBeenCalledWith('Trimestre « Automne 2026 » créé.');
    });

    it('un échec d\'écriture du registre : ni cadre, ni message de réussite', () => {
        const e = monter({ champs: SAISIE });
        e.sauvegarder.mockImplementation(() => false);
        expect(e.win.creerTrimestreV2()).toBe(false);
        expect(e.notifications.succes).not.toHaveBeenCalled();
        expect(e.store.trimestreActif).toBeUndefined();
    });

    it('la fiche en création retient le rechargement : saisie oui, vide non, trimestre actif non', () => {
        const vide = monter();
        expect(vide.fiches.trimestre()).toBe(false);
        const saisie = monter({ champs: { 'v2-sessionTrimestre': 'automne' } });
        expect(saisie.fiches.trimestre()).toBe(true);
        const actif = monter({ registre: AUTOMNE_VIDE, champs: { 'v2-nomTrimestre': 'Automne 2026' } });
        expect(actif.fiches.trimestre()).toBe(false);
    });
});

describe('lot E2 · index.html — chaque champ a son écrivain, au changement', () => {
    const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
    const balise = (id) => (html.match(new RegExp('<[^>]*id="' + id + '"[^>]*>')) || [''])[0];

    it('le nom, la session, l\'année, et les huit dates', () => {
        expect(balise('v2-nomTrimestre')).toContain('data-on-change="sauvegarderNomTrimestreV2"');
        for (const id of ['v2-sessionTrimestre', 'v2-anneeTrimestre']) {
            expect(balise(id)).toContain('data-on-change="sauvegarderIdentificationTrimestreV2"');
            expect(balise(id)).not.toContain('data-on-input');   // jamais à la frappe
        }
        for (const id of IDS_DATES) expect(balise(id)).toContain('data-on-change="sauvegarderCadreCalendrierV2"');
    });

    it('le bouton « Enregistrer » est retiré ; « Créer le trimestre » paraît en création seulement', () => {
        expect(html).not.toContain('sauvegarderTrimestreCompletV2');
        expect(html).toMatch(/<button id="v2-btnCreerTrimestre" class="[^"]*\bu-hide\b[^"]*" data-action="creerTrimestreV2">Créer le trimestre<\/button>/);
    });

    it('l\'ancien point de persistance unique n\'existe plus', () => {
        const code = readFileSync(path.join(racine, 'js/trimestre-v2-init.js'), 'utf8');
        expect(code).not.toContain('function sauvegarderTrimestreCompletV2');
    });
});
