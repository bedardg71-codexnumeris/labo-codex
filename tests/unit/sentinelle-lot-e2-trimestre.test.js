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
    const classesAnnuler = new Set(['u-hide']);
    elements['v2-btnAnnulerCreationTrimestre'] = { classList: { add: (c) => classesAnnuler.add(c), remove: (c) => classesAnnuler.delete(c), contains: (c) => classesAnnuler.has(c) } };
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
    return { win, store, db, elements, temoin, notifications, sauvegarder, ecritures, genererCalendrierComplet, fiches, boutonCache: () => classes.has('u-hide'), annulerCache: () => classesAnnuler.has('u-hide') };
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

// #975 (7 oct. 2026) — « + Nouveau trimestre » passe par CETTE fiche, même quand un trimestre
// est actif : plus de `prompt`, plus d'`alert`. Pendant la création demandée, les champs
// n'écrivent rien dans le trimestre actif ; « Créer le trimestre » crée, active, et prend le
// chemin complet de la bascule (#466/CT-05).
describe('#975 · un trimestre actif — « + Nouveau trimestre » ouvre la fiche en création', () => {
    const HIVER = [{ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true }];
    const ouvrir = (opts) => {
        const e = monter({ registre: HIVER, champs: { 'v2-nomTrimestre': 'Hiver 2026', 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2026', 'v2-debutTrimestre': '2026-01-20' }, ...opts });
        e.win.changerTrimestreActifV2 = vi.fn();
        e.win.ouvrirCreationTrimestreV2();
        return e;
    };
    const saisir = (e, valeurs) => { for (const [id, v] of Object.entries(valeurs)) e.elements[id].value = v; };

    it('la fiche se vide, « Créer le trimestre » paraît, rien n\'est écrit', () => {
        const e = ouvrir();
        expect(e.boutonCache()).toBe(false);
        for (const id of ['v2-nomTrimestre', 'v2-sessionTrimestre', 'v2-anneeTrimestre', 'v2-debutTrimestre']) {
            expect(e.elements[id].value, id).toBe('');
        }
        expect(e.ecritures).toEqual([]);
    });

    it('pendant la saisie, ni le nom, ni la session et l\'année, ni les dates n\'écrivent dans le trimestre actif', () => {
        const e = ouvrir();
        saisir(e, { 'v2-nomTrimestre': 'Automne fictif', 'v2-sessionTrimestre': 'automne', 'v2-anneeTrimestre': '2026', 'v2-debutTrimestre': '2026-08-25' });
        expect(e.win.sauvegarderNomTrimestreV2()).toBe(false);
        expect(e.win.sauvegarderIdentificationTrimestreV2()).toBe(false);
        expect(e.win.sauvegarderCadreCalendrierV2()).toBe(false);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.store.trimestres).toEqual(HIVER);
    });

    it('« Créer le trimestre » : l\'ancien désactivé, intact ; le nouveau actif, son cadre sous son id ; la bascule complète ; aucun dialogue', () => {
        const e = ouvrir();
        saisir(e, { 'v2-sessionTrimestre': 'automne', 'v2-anneeTrimestre': '2026', 'v2-debutTrimestre': '2026-08-25', 'v2-finCours': '2026-12-11', 'v2-finTrimestre': '2026-12-22' });
        expect(e.win.creerTrimestreV2()).toBe(true);
        expect(e.store.trimestres).toEqual([
            { id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: false },
            expect.objectContaining({ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: true })
        ]);
        expect(e.store.trimestreActif).toBe('a2026');
        expect(e.store.a2026_cadreCalendrier).toMatchObject({ dateDebut: '2026-08-25', finTrimestre: '2026-12-22' });
        expect(e.store.h2026_cadreCalendrier).toBeUndefined();
        expect(e.win.changerTrimestreActifV2).toHaveBeenCalledWith('a2026');
        expect(e.sauvegarder.mock.calls[0][2]).toEqual({ geste: 'Créer le trimestre' });
        expect(e.notifications.succes).toHaveBeenCalledWith('Trimestre «\u00a0Automne 2026\u00a0» créé.');
        expect(e.boutonCache()).toBe(true);
    });

    it('un trimestre qui existe déjà : refus par le témoin (mots d\'E2), la saisie reste, la fiche reste en création', () => {
        const e = ouvrir();
        saisir(e, { 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2026' });
        expect(e.win.creerTrimestreV2()).toBe(false);
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith('Le trimestre « h2026 » existe déjà ; active-le depuis la bibliothèque des trimestres.', 'Créer le trimestre', 'trimestres');
        expect(e.elements['v2-sessionTrimestre'].value).toBe('hiver');
        expect(e.boutonCache()).toBe(false);
        expect(e.win.changerTrimestreActifV2).not.toHaveBeenCalled();
        expect(e.store.trimestres).toEqual(HIVER);
    });

    it('la question de sortie retient une saisie en création demandée ; relire la fiche (bascule) quitte la création', () => {
        const e = ouvrir();
        expect(e.fiches.trimestre()).toBe(false);          // vide : rien à perdre
        saisir(e, { 'v2-sessionTrimestre': 'automne' });
        expect(e.fiches.trimestre()).toBe(true);
        e.win.chargerIdentificationTrimestreV2();
        expect(e.boutonCache()).toBe(true);
        expect(e.elements['v2-nomTrimestre'].value).toBe('Hiver 2026');
        expect(e.fiches.trimestre()).toBe(false);
    });

    it('l\'ancien chemin est retiré : plus de prompt ni d\'alert de création ; le bouton mène à la fiche', () => {
        const liste = readFileSync(path.join(racine, 'js/trimestre-v2-liste.js'), 'utf8');
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(liste).not.toContain('function ouvrirModalNouveauTrimestre');
        expect(liste).not.toMatch(/prompt\(\s*['`]Créer un nouveau trimestre/);
        expect(liste).not.toContain('créé avec succès');
        expect(html).not.toContain('ouvrirModalNouveauTrimestre');
        expect(html).toMatch(/data-action="ouvrirCreationTrimestreV2">\s*\+ Nouveau trimestre/);
    });
});

// #975 suite (décisions de Grégoire, 7 oct. 2026) — « Annuler » à côté de « Créer le trimestre »,
// seulement quand un trimestre actif est à retrouver ; son clic n'écrit rien. Pas de question
// de sortie dans l'application (« on s'en passe ») : seule la question native au rechargement.
describe('#975 suite · « Annuler » quitte la création demandée sans rien écrire', () => {
    const AUTOMNE = [{ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: true }];
    const CADRE = { dateDebut: '2026-08-25', finCours: '2026-12-11', finTrimestre: '2026-12-22' };
    const monterAvecActif = () => monter({
        registre: AUTOMNE,
        champs: { 'v2-nomTrimestre': 'Automne 2026', 'v2-sessionTrimestre': 'automne', 'v2-anneeTrimestre': '2026', 'v2-debutTrimestre': '2026-08-25' },
        donnees: { a2026_cadreCalendrier: { ...CADRE }, a2026_calendrierComplet: { '2026-08-25': {}, '2026-12-22': {} } }
    });

    it('un trimestre actif : « Annuler » paraît avec « Créer le trimestre »', () => {
        const e = monterAvecActif();
        expect(e.annulerCache()).toBe(true);
        e.win.ouvrirCreationTrimestreV2();
        expect(e.boutonCache()).toBe(false);
        expect(e.annulerCache()).toBe(false);
    });

    it('aucun trimestre actif (poste vierge) : « Créer le trimestre » paraît, « Annuler » non', () => {
        const e = monter({ registre: [] });
        e.win.chargerIdentificationTrimestreV2();
        expect(e.boutonCache()).toBe(false);
        expect(e.annulerCache()).toBe(true);
        e.win.ouvrirCreationTrimestreV2();
        expect(e.boutonCache()).toBe(false);
        expect(e.annulerCache()).toBe(true);
    });

    it('le clic : rien d\'écrit (registre, cadre), la fiche du trimestre actif revient, les deux boutons disparaissent', () => {
        const e = monterAvecActif();
        e.win.ouvrirCreationTrimestreV2();
        for (const [id, v] of Object.entries({ 'v2-nomTrimestre': 'Hiver fictif', 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '2027', 'v2-debutTrimestre': '2027-01-19' })) {
            e.elements[id].value = v;
        }
        const avant = JSON.parse(JSON.stringify(e.store));
        expect(e.win.annulerCreationTrimestreV2()).toBe(true);
        expect(e.ecritures).toEqual([]);
        expect(e.sauvegarder).not.toHaveBeenCalled();
        expect(e.store).toEqual(avant);
        expect(e.elements['v2-nomTrimestre'].value).toBe('Automne 2026');
        expect(e.elements['v2-sessionTrimestre'].value).toBe('automne');
        expect(e.elements['v2-anneeTrimestre'].value).toBe(2026);
        expect(e.elements['v2-debutTrimestre'].value).toBe('2026-08-25');
        expect(e.elements['v2-finTrimestre'].value).toBe('2026-12-22');
        expect(e.boutonCache()).toBe(true);
        expect(e.annulerCache()).toBe(true);
        // La création est bien quittée : les champs écrivent de nouveau dans le trimestre actif.
        expect(e.fiches.trimestre()).toBe(false);
        e.elements['v2-nomTrimestre'].value = 'Automne fictif';
        expect(e.win.sauvegarderNomTrimestreV2()).toBe(true);
        expect(e.store.trimestres[0].nom).toBe('Automne fictif');
    });

    it('hors création demandée, « Annuler » ne fait rien', () => {
        const e = monterAvecActif();
        expect(e.win.annulerCreationTrimestreV2()).toBe(false);
        expect(e.elements['v2-debutTrimestre'].value).toBe('2026-08-25');
        expect(e.ecritures).toEqual([]);
    });

    it('index.html : « Annuler », bouton secondaire, caché d\'abord, à côté de « Créer le trimestre » ; aucune question de sortie branchée', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).toMatch(/<button id="v2-btnAnnulerCreationTrimestre" class="btn btn-secondaire btn-tres-compact u-hide" data-action="annulerCreationTrimestreV2">Annuler<\/button>\s*<button id="v2-btnCreerTrimestre"/);
        const code = readFileSync(path.join(racine, 'js/trimestre-v2-init.js'), 'utf8');
        expect(code).not.toMatch(/quitterCreationSiConfirme\(\s*['"]trimestre/);
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
