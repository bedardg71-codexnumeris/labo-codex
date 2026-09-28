/**
 * LOT E3 DE L'ENREGISTREMENT — RÉGLAGES ET BILAN RÉFLEXIF (D0, D3 ; 28 sept. 2026)
 *
 * Préférences, Outils d'observation et auto-réflexion s'écrivaient déjà au changement : le bouton
 * « Enregistrer » disparaît, les écritures passent par le témoin commun.
 *
 * ⚠ LE CAS DE L'INVENTAIRE (26 sept.) : des seuils mal ordonnés donnaient une alerte d'erreur PUIS
 * « Préférences enregistrées ». Désormais : « Non enregistré – Seuils : … », les champs reviennent à ce
 * qui est enregistré, rien n'est écrit, aucun succès.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));

function fauxDocument(champs) {
    const elems = {};
    for (const [id, valeur] of Object.entries(champs)) {
        let v = String(valeur);
        elems[id] = { checked: false, get value() { return v; }, set value(x) { v = String(x); } };
    }
    return {
        readyState: 'complete', addEventListener() {}, removeEventListener() {},
        getElementById: (id) => elems[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => ({ style: {}, classList: { add() {}, remove() {}, contains() { return false; } }, setAttribute() {}, appendChild() {}, addEventListener() {} }),
        body: { classList: { add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute() { return null; }, style: {} },
        documentElement: { addEventListener() {} }, _elems: elems
    };
}

function monter({ store = {}, champs = {}, ecritureOk = true, prefOk = () => true } = {}) {
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); }, removeSync: (k) => { delete store[k]; },
        get: async () => null, set: async () => {}
    };
    const ecritures = []; const toasts = []; const alertes = [];
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const annonces = [];
    const win = { addEventListener() {}, removeEventListener() {}, dbReady: false, obtenirTrimestreId: () => 'test', temoinEnregistrement: temoin };
    const globaux = {
        db, cle: (k) => k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        definirPreference: (n, v) => prefOk(n, v),
        sauvegarderDonneesSelonMode: (k, v, o) => { ecritures.push({ k, geste: o && o.geste }); if (!ecritureOk) return false; store[k] = clone(v); return true; },
        ecrireEtAnnoncer: async (k, ecrire, o) => { const r = await ecrire(); annonces.push({ k, r, geste: o && o.geste }); return r; },
        notifications: { succes: (t) => toasts.push(t), erreur() {}, info() {} },
        alert: (m) => alertes.push(m)
    };
    chargerScript('js/interpretation-config.js', globaux, win);
    globaux.obtenirSeuil = win.obtenirSeuil;
    globaux.chargerSeuilsInterpretation = win.chargerSeuilsInterpretation;
    chargerScript('js/profil-etudiant-helpers.js', globaux, win);
    const doc = fauxDocument(champs);
    chargerScript('js/preferences-v2.js', Object.assign({ document: doc }, globaux), win);
    return { win, store, doc, ecritures, toasts, alertes, temoin, annonces };
}

const SEUILS_ENREGISTRES = { interpretation: { acceptable: 0.65, bon: 0.78, excellent: 0.9 } };

describe('lot E3 · les seuils d\'interprétation, par le témoin', () => {
    it('LE CAS DE L\'INVENTAIRE : mal ordonnés → « Non enregistré – Seuils : … », champs revenus, rien d\'écrit, aucun succès, aucune alerte', () => {
        const b = monter({ store: { seuilsInterpretation: clone(SEUILS_ENREGISTRES) },
            champs: { 'v2-seuil-fragile': 90, 'v2-seuil-acceptable': 80, 'v2-seuil-bon': 85 } });
        // Le chargement de interpretation-config.js complète la clé avec ses défauts : c'est ce stock-là qui ne doit pas bouger.
        const avant = clone(b.store.seuilsInterpretation);
        expect(b.win.sauvegarderSeuilsV2()).toBe(false);
        expect(b.ecritures).toEqual([]);
        expect(b.store.seuilsInterpretation).toEqual(avant);
        expect(b.temoin.nonEnregistre).toHaveBeenCalledWith('les seuils doivent aller du plus bas au plus haut (Fragile < Acceptable < Bon).', 'Seuils', 'seuilsInterpretation');
        expect(['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon'].map(id => b.doc._elems[id].value)).toEqual(['65', '78', '90']);
        expect(b.toasts).toEqual([]);
        expect(b.alertes).toEqual([]);
    });

    it('bien ordonnés : écrits par le témoin commun (geste « Seuils »), en fraction', () => {
        const b = monter({ champs: { 'v2-seuil-fragile': 60, 'v2-seuil-acceptable': 75, 'v2-seuil-bon': 88 } });
        expect(b.win.sauvegarderSeuilsV2()).toBe(true);
        expect(b.ecritures).toEqual([{ k: 'seuilsInterpretation', geste: 'Seuils' }]);
        expect(b.store.seuilsInterpretation.interpretation).toEqual({ acceptable: 0.6, bon: 0.75, excellent: 0.88 });
    });

    it('« Restaurer » ne dit « restaurés » qu\'après une écriture réussie', () => {
        const ok = monter({ champs: { 'v2-seuil-fragile': 1, 'v2-seuil-acceptable': 2, 'v2-seuil-bon': 3 } });
        ok.win.restaurerSeuilsInterpretationDefautV2();
        expect(ok.toasts).toEqual(['Seuils d\'interprétation restaurés']);
        const ko = monter({ ecritureOk: false, champs: { 'v2-seuil-fragile': 1, 'v2-seuil-acceptable': 2, 'v2-seuil-bon': 3, 'v2-pref-fenetre-patterns': 3 } });
        ko.win.restaurerSeuilsInterpretationDefautV2();
        ko.win.restaurerSeuilsDetectionDefautV2();
        expect(ko.toasts).toEqual([]);
    });
});

describe('lot E3 · les préférences, par le témoin', () => {
    it('toutes écrites : le témoin parle après (ecrireEtAnnoncer, geste « Préférences »)', async () => {
        const b = monter();
        expect(await b.win.sauvegarderPreferencesV2()).toBe(true);
        expect(b.annonces).toEqual([{ k: 'preferencesUtilisateur', r: true, geste: 'Préférences' }]);
        expect(b.temoin.nonEnregistre).not.toHaveBeenCalled();
    });

    it('une écriture refusée : « Non enregistré – Préférences : le navigateur a refusé l\'écriture. », aucun succès', async () => {
        const b = monter({ prefOk: (n) => n !== 'afficherGraphiques' });
        expect(await b.win.sauvegarderPreferencesV2()).toBe(false);
        expect(b.annonces).toEqual([{ k: 'preferencesUtilisateur', r: false, geste: 'Préférences' }]);
        expect(b.temoin.nonEnregistre).toHaveBeenCalledWith('le navigateur a refusé l\'écriture.', 'Préférences', 'preferencesUtilisateur');
        expect(b.toasts).toEqual([]);
    });

    it('definirPreference rend le résultat de l\'écriture (preferences.js)', () => {
        const store = {};
        const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, removeSync() {} };
        const win = chargerScript('js/preferences.js', { db });
        expect(win.definirPreference('noteDifferee', true)).toBe(true);
        db.setSync = () => false;   // la garde #340 refuse
        expect(win.definirPreference('noteDifferee', false)).toBe(false);
        db.setSync = () => { throw new Error('quota simulé'); };
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(win.definirPreference('noteDifferee', true)).toBe(false);
    });
});

describe('lot E3 · les boutons « Enregistrer » sont partis', () => {
    const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
    const js = (f) => readFileSync(path.join(RACINE, 'js', f), 'utf8');

    it('Préférences et Outils d\'observation : plus de bouton, plus de `sauvegarderToutesPreferencesV2`', () => {
        expect(html).not.toContain('sauvegarderToutesPreferencesV2');
        expect(js('preferences-v2.js')).not.toContain('sauvegarderToutesPreferencesV2');
        expect(js('preferences-v2.js')).not.toMatch(/notifications\.succes\('Préférences enregistrées'/);
        for (const titre of ['<h2 class="u-mb-0">Outils d\'observation</h2>', '<h2 class="u-mb-0">Préférences</h2>']) {
            const entete = tranche(html, titre, '</div>');
            expect(entete, titre).not.toContain('<button');
        }
    });

    it('auto-réflexion : plus de bouton, l\'écrivain passe par le témoin commun', () => {
        expect(js('bilan-reflexif-reflexion.js')).not.toContain('sauvegarderReflexionExplicite');
        expect(js('bilan-reflexif.js')).not.toContain('sauvegarderReflexionExplicite');
        const ecrivain = tranche(js('bilan-reflexif-core.js'), 'function sauvegarderReflexion() {', '\n}');
        expect(ecrivain).toContain("sauvegarderDonneesSelonMode('autoreflexionBilan', etat.reflexion, { geste: 'Auto-réflexion' })");
        expect(ecrivain).not.toContain('db.setSync');
    });
});
