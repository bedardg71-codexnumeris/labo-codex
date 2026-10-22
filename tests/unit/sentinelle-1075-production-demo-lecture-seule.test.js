/**
 * #1075, POINT 5 — UNE PRODUCTION DE DÉMONSTRATION N'ÉCRIT RIEN (22 oct. 2026).
 *
 * Constat (audit 3.52) : la lecture seule d'un exemple désactivait les champs, pas les boutons des blocs ;
 * déplacer ou retirer un bloc, ou « + Nouveau champ », passaient par `enregistrerProductionModifiee`,
 * qui n'avait aucune garde démo, et écrivaient dans la production de démonstration.
 *
 * Ce banc charge `productions.js` RÉEL (montage du lot E3) et verrouille :
 *   A — un exemple (isDemo, ou auteur « Demo Labo Codex ») ne s'écrit pas : l'écriture qui suit un bloc
 *       déplacé (`enregistrerProductionModifiee`, celle de tous les gestes des blocs) ne change rien en base,
 *       et le témoin dit pourquoi ;
 *   B — une production à soi s'écrit comme avant ;
 *   C — la feuille de style cache les gestes des blocs d'un exemple, pas l'aide.
 *
 * Break-test (22 oct.) : sans la garde `estProductionDemo` du mutateur, A1 et A2 rougissent.
 *
 * Données FICTIVES.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));

function element(id) {
    const set = new Set();
    let html = '';
    const el = {
        id, value: '', textContent: '', placeholder: '', dataset: {}, style: {}, disabled: false, options: [],
        classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c), toggle: (c, f) => { if (f) set.add(c); else set.delete(c); } },
        get innerHTML() { return html; },
        set innerHTML(v) { html = String(v); el.value = ''; },
        focus() {}, scrollIntoView() {}, setAttribute() {}, getAttribute: () => null, remove() {},
        closest: () => null, removeAttribute() {}, insertAdjacentHTML() {}, insertBefore(c) { return c; }, children: [],
        querySelector: () => null, querySelectorAll: () => [], appendChild(c) { return c; }, addEventListener() {}
    };
    let parent = null;
    Object.defineProperty(el, 'parentElement', { get: () => (parent ||= element(null)) });
    return el;
}

const PROD = (extra) => ({
    id: 'PROD_X', titre: 'Exemple fictif', activiteApprentissage: 'Lecture', type: 'examen', ponderation: 20,
    grilleId: 'G1', echelleId: '', cartoucheId: '', objectif: '', tache: '', detailTache: '',
    champsPersonnalises: [{ id: 'CP0', titre: 'Remise', contenu: 'En classe' }, { id: 'CP1', titre: 'Format', contenu: 'Deux pages' }],
    titresBlocs: {}, ordreBlocs: [], ...extra
});

function monter(production) {
    const store = { test_productions: [production], test_grillesTemplates: [{ id: 'G1', nom: 'Grille fictive' }] };
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; }
    };
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = element(id))), createElement: () => element(null),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: element('body') };
    const blocs = () => production.champsPersonnalises;
    let ordre = [0, 1];
    document.getElementById('champsPersonnalisesListe').querySelectorAll = (sel) => (sel === '.champ-perso' ? ordre.map((i) => ({
        getAttribute: (a) => (a === 'data-champ-id' ? 'CP' + i : null),
        querySelector: (s) => (s === '.champ-perso-titre' ? { value: blocs()[i].titre } : { value: blocs()[i].contenu })
    })) : []);
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const win = { addEventListener() {}, temoinEnregistrement: temoin,
        uiDialogues: { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true },
        boutonsReordonnerBloc: () => '', boutonRetirerBloc: () => '', chargerProductionPourModif: async () => {} };
    const BibliothequeUI = { estItemDemo: (p) => !!p && (p.isDemo === true || p.auteur === 'Demo Labo Codex') };
    chargerScript('js/productions.js', {
        document, db, cle: (k) => 'test_' + k, BibliothequeUI,
        modifierEtAnnoncer: async (k, mutateur, defaut) => db.modifier(k, mutateur, defaut),
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        alert() {}, confirm: () => true, genererIdUnique: (p) => p + 'NEUF', obtenirIdentiteCCUtilisateur: () => 'banc',
        obtenirCoursActifId: () => 'C1', formaterDateCourte: (d) => d, verifierEtGererDoublon: async () => undefined,
        productionEnEdition: null, afficherListeProductions: async () => {}
    }, win);
    const ouvrir = async () => { document.getElementById('formulaireProduction').classList.remove('u-hide'); await win.afficherFormProduction('PROD_X'); };
    const inverser = () => { ordre = [1, 0]; };
    return { win, store, temoin, ouvrir, inverser };
}

describe('#1075, point 5 — un exemple de démonstration n\'écrit rien', () => {
    for (const [nom, marque] of [['isDemo', { isDemo: true }], ['auteur « Demo Labo Codex »', { auteur: 'Demo Labo Codex' }]]) {
        it(`A — ${nom} : un bloc déplacé ne change rien en base, et le témoin le dit`, async () => {
            const e = monter(PROD(marque));
            const avant = JSON.stringify(e.store.test_productions);
            await e.ouvrir();
            e.inverser();   // l'écran après « descendre » : les blocs redessinés dans l'autre ordre
            expect(await e.win.enregistrerProductionModifiee()).toBe(false);
            expect(JSON.stringify(e.store.test_productions)).toBe(avant);
            const dits = e.temoin.nonEnregistre.mock.calls.map((c) => c[0]);
            expect(dits.some((t) => /lecture seule/.test(t))).toBe(true);
        });
    }

    it('B — une production à soi s\'écrit comme avant', async () => {
        const e = monter(PROD({}));
        await e.ouvrir();
        e.inverser();
        expect(await e.win.enregistrerProductionModifiee()).toBe(true);
        expect(e.store.test_productions[0].champsPersonnalises.map((c) => c.titre)).toEqual(['Format', 'Remise']);
    });

    it('C — la feuille de style cache les gestes des blocs d\'un exemple', () => {
        const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
        for (const a of ['[data-action^="deplacerBlocConsigne"]', '[data-action="supprimerChampPersonnalise"]', '[data-action="ajouterChampPersonnalise"]']) {
            expect(css).toContain('#formulaireProduction.demo-readonly ' + a);
        }
    });
});
