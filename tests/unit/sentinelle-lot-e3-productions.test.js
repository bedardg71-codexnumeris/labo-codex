import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// LOT E3 DE L'ENREGISTREMENT — LA FICHE D'UNE PRODUCTION (D3, D0 ; 28 sept. 2026)
//
// Une production existante s'enregistre toute seule, champ par champ, par un seul
// écrivain (`enregistrerProductionModifiee`) qui relit tout le formulaire, comme le
// bouton d'avant ; le témoin commun parle (`modifierEtAnnoncer`, espionné ici).
// « Créer la production » est le seul geste qui crée ; « Annuler » devient « Fermer ».
// ⚠ Consigne : une écriture de champ ne réécrit AUCUNE évaluation (empreinte ci-dessous).
// Noms fictifs.

const clone = (x) => JSON.parse(JSON.stringify(x));
const racine = path.resolve(__dirname, '..', '..');

function element(id) {
    const set = new Set();
    let html = '';
    const el = {
        id, value: '', textContent: '', placeholder: '', dataset: {}, style: {}, disabled: false, options: [],
        ecouteurs: {},
        classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c), toggle: (c, f) => { if (f) set.add(c); else set.delete(c); } },
        get innerHTML() { return html; },
        // Un <select> redessiné retombe sur sa première option, comme dans le navigateur.
        set innerHTML(v) { html = String(v); el.value = ''; },
        focus() {}, scrollIntoView() {}, setAttribute() {}, getAttribute: () => null, remove() {},
        closest: () => null, removeAttribute() {}, insertAdjacentHTML() {}, insertBefore(c) { return c; }, children: [],
        querySelector: () => null, querySelectorAll: () => [], appendChild(c) { return c; },
        addEventListener(evt, fn) { (el.ecouteurs[evt] ||= []).push(fn); }
    };
    let parent = null;
    Object.defineProperty(el, 'parentElement', { get: () => (parent ||= element(null)) });
    return el;
}

const PROD = () => ({
    id: 'PROD_A', titre: 'Analyse de poème', activiteApprentissage: 'Lecture', type: 'examen', ponderation: 20,
    grilleId: 'G1', echelleId: '', cartoucheId: 'K1', verrouille: true, dansBibliotheque: true, coursId: 'C1',
    objectif: '', tache: '', detailTache: '', champsPersonnalises: [], titresBlocs: {}, ordreBlocs: []
});

function monter({ quitter = true, echec = false, refus = false, doublon = undefined, blocs = [] } = {}) {
    const store = {
        test_productions: [PROD(), { id: 'PROD_B', titre: 'Dissertation', type: 'examen', ponderation: 30 }],
        test_grillesTemplates: [{ id: 'G1', nom: 'Grille un' }, { id: 'G2', nom: 'Grille deux' }],
        test_cartouches_G1: [{ id: 'K1', nom: 'Cartouche un' }],
        test_cartouches_G2: [{ id: 'K2', nom: 'Cartouche deux' }],
        // Une évaluation déjà faite, avec SES références : rien ne doit la toucher.
        test_evaluationsSauvegardees: [{ id: 'EV1', productionId: 'PROD_A', etudiantDA: '1000001', grilleId: 'G1', cartoucheId: 'K1',
            criteres: [{ critereId: 'CR1', niveauSelectionne: 'M', ponderation: 50 }], noteFinale: 82 }]
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
        // La garde #340 refuse : le mutateur a tourné, rien n'est écrit, `undefined` revient.
        if (refus) { await mutateur(await db.get(k, defaut)); return undefined; }
        const r = await db.modifier(k, mutateur, defaut);
        if (r !== undefined) ecrits.push({ cle: k, geste: options && options.geste, discret: !!(options && options.discret) });
        return r;
    });
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = element(id))), createElement: () => element(null),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: element('body') };
    // Les blocs de consignes libres affichés (titre, contenu).
    document.getElementById('champsPersonnalisesListe').querySelectorAll = (sel) => sel === '.champ-perso' ? blocs.map((b, i) => ({
        getAttribute: (a) => (a === 'data-champ-id' ? 'CP' + i : null),
        querySelector: (s) => (s === '.champ-perso-titre' ? { value: b.titre } : { value: b.contenu })
    })) : [];
    document.getElementById('formulaireProduction').classList.add('u-hide');
    document.getElementById('btnCreerProduction').classList.add('u-hide');
    const toasts = [];
    const confirmations = [];
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const fiches = {};
    const questions = [];
    const uiDialogues = {
        declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
        quitterCreationSiConfirme: vi.fn(async (g) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(g); return quitter; })
    };
    const ouvertes = [];
    const win = { addEventListener() {}, temoinEnregistrement: temoin, uiDialogues,
        boutonsReordonnerBloc: () => '', boutonRetirerBloc: () => '',
        chargerProductionPourModif: async (id) => { ouvertes.push(id); } };
    chargerScript('js/productions.js', {
        document, db, cle: (k) => 'test_' + k, modifierEtAnnoncer, echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { succes: (t) => toasts.push(t), erreur: (t) => toasts.push('ERREUR ' + t), info() {}, avertissement() {} },
        alert: (t) => toasts.push('ALERTE ' + t), confirm: (t) => { confirmations.push(t); return true; },
        genererIdUnique: (p) => p + 'NEUF', obtenirIdentiteCCUtilisateur: () => 'banc', obtenirCoursActifId: () => 'C1',
        formaterDateCourte: (d) => d,
        verifierEtGererDoublon: async () => doublon,
        productionEnEdition: null,
        afficherListeProductions: async () => {}
    }, win);
    // Le banc ne mesure pas le rendu : les rafraîchissements d'affichage sont neutres.
    const champ = (id) => document.getElementById(id);
    const ouvrir = async (id = 'PROD_A') => { champ('formulaireProduction').classList.remove('u-hide'); await win.afficherFormProduction(id); };
    return { win, store, champ, ecrits, temoin, toasts, confirmations, fiches, questions, ouvertes, ouvrir, modifierEtAnnoncer };
}

const empreinte = (store) => JSON.stringify(store.test_evaluationsSauvegardees);

describe('lot E3 · production existante — champ par champ, par le témoin', () => {
    it('un champ modifié s\'écrit tout seul, geste « Modifier la production », aucun message ; les champs d\'état ne bougent pas (#468)', async () => {
        const e = monter();
        await e.ouvrir();
        expect(e.champ('btnCreerProduction').classList.contains('u-hide')).toBe(true);
        e.champ('productionTitre').value = 'Analyse de sonnet';
        await e.win.surChangementFormulaireProduction(e.champ('productionTitre'));
        const p = e.store.test_productions.find(x => x.id === 'PROD_A');
        expect(p).toMatchObject({ titre: 'Analyse de sonnet', ponderation: 20, grilleId: 'G1', cartoucheId: 'K1', verrouille: true, coursId: 'C1' });
        expect(e.ecrits).toEqual([{ cle: 'test_productions', geste: 'Modifier la production', discret: false }]);
        expect(e.toasts).toEqual([]);
    });

    it('LE POINT DE LA CONSIGNE : changer la grille, la cartouche ou la pondération d\'une production évaluée n\'écrit aucune évaluation', async () => {
        const e = monter();
        const avant = empreinte(e.store);
        await e.ouvrir();
        e.champ('productionPonderation').value = '35';
        await e.win.surChangementFormulaireProduction(e.champ('productionPonderation'));
        e.champ('productionGrille').value = 'G2';
        await e.win.surChangementFormulaireProduction(e.champ('productionGrille'));
        expect(e.store.test_productions[0]).toMatchObject({ ponderation: 35, grilleId: 'G2' });
        expect(empreinte(e.store)).toBe(avant);
        expect(e.ecrits.every(x => x.cle === 'test_productions')).toBe(true);
    });

    it('la grille changée : la cartouche de l\'ancienne grille ne s\'écrit jamais avec la nouvelle', async () => {
        const e = monter();
        await e.ouvrir();
        expect(e.champ('productionCartouche').value).toBe('K1');
        e.champ('productionGrille').value = 'G2';
        await e.win.surChangementFormulaireProduction(e.champ('productionGrille'));
        expect(e.store.test_productions[0]).toMatchObject({ grilleId: 'G2', cartoucheId: '' });
    });

    it('un nom vidé : « Non enregistré – Modifier la production : le nom de la production est requis. », rien d\'écrit', async () => {
        const e = monter();
        await e.ouvrir();
        e.champ('productionTitre').value = '  ';
        await e.win.surChangementFormulaireProduction(e.champ('productionTitre'));
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith('le nom de la production est requis.', 'Modifier la production', 'test_productions');
        expect(e.store.test_productions[0].titre).toBe('Analyse de poème');
    });

    it('le nom d\'une autre production, question du doublon « Annuler » : le nom revient, rien d\'écrit', async () => {
        const e = monter({ doublon: null });
        await e.ouvrir();
        e.champ('productionTitre').value = 'Dissertation';
        await e.win.surChangementFormulaireProduction(e.champ('productionTitre'));
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
        expect(e.champ('productionTitre').value).toBe('Analyse de poème');
    });

    it('un bloc de consignes rempli sans nom : le reste s\'écrit en silence, le témoin dit que ce bloc n\'est pas conservé', async () => {
        const e = monter({ blocs: [{ titre: '', contenu: 'Remise avant 16 h.' }] });
        await e.ouvrir();
        e.champ('productionActivite').value = 'Écriture';
        await e.win.surChangementFormulaireProduction(e.champ('productionActivite'));
        expect(e.store.test_productions[0].activiteApprentissage).toBe('Écriture');
        expect(e.ecrits).toEqual([{ cle: 'test_productions', geste: 'Modifier la production', discret: true }]);
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith(
            'un bloc de consignes est rempli mais n\'a pas de nom ; il n\'est pas conservé. Donne-lui un nom.',
            'Modifier la production', 'test_productions');
    });

    it('une échéance hors du trimestre s\'écrit sans question (l\'avertissement sous le champ la signale)', async () => {
        const e = monter();
        e.store.test_cadreCalendrier = { dateDebut: '2026-08-20', finCours: '2026-12-10' };
        await e.ouvrir();
        e.champ('containerEcheancesGroupes').classList.add('u-hide');   // mode simple, sans groupe
        e.champ('productionDateEcheance').value = '2027-01-15';
        await e.win.surChangementFormulaireProduction(e.champ('productionDateEcheance'));
        expect(e.confirmations).toEqual([]);
        expect(e.store.test_productions[0].dateEcheance).toBe('2027-01-15');
    });

    it('un échec d\'écriture : aucun message, rien de réaffiché comme réussi', async () => {
        const e = monter({ echec: true });
        await e.ouvrir();
        e.champ('productionTitre').value = 'Autre';
        expect(await e.win.enregistrerProductionModifiee(e.champ('productionTitre'))).toBe(false);
        expect(e.toasts).toEqual([]);
    });

    it('l\'écouteur unique est posé sur le formulaire et écrit au « change »', async () => {
        const e = monter();
        await e.ouvrir();
        const ecouteurs = e.champ('formulaireProduction').ecouteurs.change || [];
        expect(ecouteurs).toHaveLength(1);
        e.champ('productionActivite').value = 'Relecture';
        ecouteurs[0]({ target: e.champ('productionActivite') });
        await new Promise(r => setTimeout(r, 10));
        expect(e.store.test_productions[0].activiteApprentissage).toBe('Relecture');
    });

    it('une fiche fermée n\'écrit plus rien', async () => {
        const e = monter();
        await e.ouvrir();
        e.champ('formulaireProduction').classList.add('u-hide');
        e.champ('productionActivite').value = 'Relecture';
        await e.win.surChangementFormulaireProduction(e.champ('productionActivite'));
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
    });
});

describe('lot E3 · nouvelle production — rien avant « Créer la production »', () => {
    const remplir = (e) => { e.champ('productionTitre').value = 'Journal de bord'; e.champ('productionType').value = 'travail'; e.champ('productionPonderation').value = '10'; };

    it('la saisie n\'écrit rien ; la fiche retient le rechargement ; « Créer la production » paraît', async () => {
        const e = monter();
        await e.ouvrir(null);
        expect(e.champ('btnCreerProduction').classList.contains('u-hide')).toBe(false);
        expect(e.fiches.production()).toBe(false);
        remplir(e);
        await e.win.surChangementFormulaireProduction(e.champ('productionTitre'));
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
        expect(e.store.test_productions).toHaveLength(2);
        expect(e.fiches.production()).toBe(true);
    });

    it('« Fermer » pose la question ; « Rester » ne perd rien', async () => {
        const e = monter({ quitter: false });
        await e.ouvrir(null);
        remplir(e);
        await e.win.fermerFicheProduction();
        expect(e.questions).toEqual(['production']);
        expect(e.champ('formulaireProduction').classList.contains('u-hide')).toBe(false);
        expect(e.champ('productionTitre').value).toBe('Journal de bord');
    });

    it('« Quitter sans créer » : la fiche se ferme, rien d\'écrit', async () => {
        const e = monter({ quitter: true });
        await e.ouvrir(null);
        remplir(e);
        await e.win.fermerFicheProduction();
        expect(e.questions).toEqual(['production']);
        expect(e.champ('formulaireProduction').classList.contains('u-hide')).toBe(true);
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
        expect(e.store.test_productions).toHaveLength(2);
    });

    it('« Créer la production » écrit, par le témoin, puis dit « Production « … » créée. » et ouvre la fiche', async () => {
        const e = monter();
        await e.ouvrir(null);
        remplir(e);
        await e.win.sauvegarderProduction();
        const p = e.store.test_productions.find(x => x.id === 'PROD_NEUF');
        expect(p).toMatchObject({ titre: 'Journal de bord', type: 'travail', ponderation: 10, coursId: 'C1' });
        expect('verrouille' in p, '#489 : la création n\'écrit plus le verrou d\'une production').toBe(false);
        expect(e.ecrits).toEqual([{ cle: 'test_productions', geste: 'Créer la production', discret: false }]);
        expect(e.toasts).toEqual(['Production « Journal de bord » créée.']);
        expect(e.ouvertes).toEqual(['PROD_NEUF']);
    });

    it('une création refusée (type manquant) le dit par le témoin, sans alerte ni succès', async () => {
        const e = monter();
        await e.ouvrir(null);
        remplir(e);
        e.champ('productionType').value = '';
        await e.win.sauvegarderProduction();
        expect(e.temoin.nonEnregistre).toHaveBeenCalledWith('choisis le type de la production.', 'Créer la production', 'test_productions');
        expect(e.toasts).toEqual([]);
        expect(e.modifierEtAnnoncer).not.toHaveBeenCalled();
    });

    it('un refus de la garde à la création : aucun « créée », rien d\'écrit, la fiche reste ouverte', async () => {
        const e = monter({ refus: true });
        await e.ouvrir(null);
        remplir(e);
        await e.win.sauvegarderProduction();
        expect(e.toasts).toEqual([]);
        expect(e.store.test_productions).toHaveLength(2);
        expect(e.ouvertes).toEqual([]);
        expect(e.champ('formulaireProduction').classList.contains('u-hide')).toBe(false);
    });

    it('un échec d\'écriture à la création : aucun « créée », la fiche reste ouverte', async () => {
        const e = monter({ echec: true });
        await e.ouvrir(null);
        remplir(e);
        await e.win.sauvegarderProduction();
        expect(e.toasts).toEqual([]);
        expect(e.champ('formulaireProduction').classList.contains('u-hide')).toBe(false);
    });
});

describe('lot E3 · l\'écran', () => {
    const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
    const js = readFileSync(path.join(racine, 'js', 'productions.js'), 'utf8');

    it('« Fermer » et « Créer la production » (masqué par défaut) ; plus de « Enregistrer » ni d\'« Annuler »', () => {
        const barre = html.match(/<div id="actionsFicheProduction"[\s\S]*?\n {32}<\/div>/)[0];
        expect(barre).toContain('<button class="btn btn-annuler" data-action="fermerFicheProduction">Fermer</button>');
        expect(barre).toContain('<button id="btnCreerProduction" class="btn btn-confirmer u-hide" data-action="sauvegarderProduction">Créer la production</button>');
        expect(barre).not.toMatch(/>\s*(Enregistrer|Annuler)\s*</);
        expect(html).not.toContain('btnTexteEvaluation');
    });

    it('« Production modifiée avec succès ! » a disparu ; la question de sortie a ses mots', () => {
        expect(js).not.toContain('modifiée avec succès');
        expect(js).not.toContain('ajoutée avec succès');
        expect(readFileSync(path.join(racine, 'js', 'ui-dialogues.js'), 'utf8'))
            .toContain('production: \'Cette production n\\\'est pas encore créée.\'');
    });
});
