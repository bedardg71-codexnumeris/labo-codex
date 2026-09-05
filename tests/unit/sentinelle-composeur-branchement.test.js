// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 3 : LE BRANCHEMENT DE LA VUE DANS LE GABARIT (lot D, volet 2)
// Le gabarit réel (`js/grilles.js`) avec un composeur ESPION : ce que grilles.js doit faire de la
// vue, et rien de ce que le composeur fait lui-même (sentinelle `sentinelle-composeur-badges`).
//
//   A. après chaque rendu du gabarit (édition, création), `monterTout(container)` — après que le
//      HTML est posé ; sans composeur chargé, le rendu est celui d'avant ;
//   B. la pose au clic : quand la zone porte une vue, le caret vient de la vue, le texte reste
//      `zone.value`, la vue se redessine (`ecrire`), l'écriture passe par le même chemin ; sans vue,
//      le chemin d'avant (selectionStart / setSelectionRange) ;
//   C. le focus : la vue focalisée vaut sa zone (`curseurVu`, `zoneActive`, la zone cible du palier) ;
//   D. les sources (un seul point de montage par rendu, le jeton).
//
// BREAK-TESTS (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · `monterVuesBadges` retiré du rendu en édition → A.a rougit ;
//   · la pose ignore le caret de la vue (selectionStart) → B.a rougit ;
//   · le focusin ne reconnaît plus la vue → C.a rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);
const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {}, tagName: 'DIV',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function monter(grilles) {
    const store = { a2026_grillesTemplates: clone(grilles) };
    const ecoutes = {};
    const elements = {};
    const document = {
        activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener: (type, fn) => { (ecoutes[type] = ecoutes[type] || []).push(fn); }, removeEventListener() {}
    };
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => { const r = await mutateur(k in store ? clone(store[k]) : defaut); if (r === undefined) return undefined; store[k] = r; return r; }
    };
    const globaux = { db, document, cle: (k) => 'a2026_' + k, echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8), alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = E;
    win.projectionAlgo = P;
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    // Le composeur ESPION.
    const appels = [];
    win.composeurBadges = {
        monterTout: (c) => { appels.push(['monterTout', c, c && c.innerHTML]); return 0; },
        vueDe: (zone) => (zone && zone._vue) || null,
        textareaDe: (vue) => (vue && vue._textarea) || null,
        curseur: (vue) => (vue && vue._curseur) || null,
        ecrire: (vue, texte, pos) => { appels.push(['ecrire', texte, pos]); vue._texte = texte; }
    };
    return { win, store, document, ecoutes, appels, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +' }, paliersProjection: P.paliersMigration() };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

/** Une zone (textarea simulé) d'un palier, avec ou sans vue. */
function zonePalier(opts) {
    const zone = Object.assign(fauxElement(), { tagName: 'TEXTAREA', value: opts.value || '', selectionStart: opts.sel || 0, selectionEnd: opts.sel || 0,
        dataset: { critereIndex: '0', palierIndex: '4', champ: opts.champ || 'texte', curseurVu: opts.visitee ? '1' : undefined },
        setSelectionRange(a, b) { this._range = [a, b]; }, focus() { this._focus = true; } });
    if (opts.vue) { zone._vue = Object.assign(fauxElement(), { _curseur: opts.curseur || null, _textarea: zone, closest: (s) => (s === '.composeur-badges' ? zone._vue : null), focus() { this._focus = true; } }); }
    const palier = { dataset: { zoneActive: opts.champ || 'texte' }, contains: (n) => n === zone || n === zone._vue, querySelector: () => zone, closest: () => null };
    zone.closest = (s) => (s === '.palier-projection' ? palier : null);
    const bouton = { closest: (s) => (s === '.palier-projection' ? palier : null), dataset: { jeton: opts.jeton || '{projection}' } };
    return { zone, palier, bouton };
}

/* ============================================================ A — LE MONTAGE */

describe('branchement · A — après chaque rendu, la vue se pose sur chaque zone', () => {
    it('A.a en ÉDITION comme en CRÉATION, `monterTout(container)` est appelé une fois, après que le HTML est posé', () => {
        const m = monter([GRILLE]);
        m.win.afficherCriteresGrille(clone(GRILLE));
        expect(m.appels.filter((a) => a[0] === 'monterTout').length).toBe(1);
        expect(m.appels[0][1]).toBe(m.liste());
        expect(m.appels[0][2]).toContain('data-palier-index="4" data-champ="texte"');
        expect(m.appels[0][2]).toContain('data-enonce-cle="decompte"');
        m.appels.length = 0;
        m.win.tempCriteres = [{ ...ALGO, id: 'T' }];
        m.win.afficherCriteresTemp();
        expect(m.appels.filter((a) => a[0] === 'monterTout').length).toBe(1);
        expect(m.appels[0][2]).toContain('data-enonce-cle="priorite"');
    });

    it('A.b sans composeur chargé, le rendu est celui d\'avant — mêmes zones, rien de plus', () => {
        const m = monter([GRILLE]);
        delete m.win.composeurBadges;
        m.win.afficherCriteresGrille(clone(GRILLE));
        const html = m.liste().innerHTML;
        expect((html.match(/<textarea/g) || []).length).toBe(12 + 4);   // six paliers × deux zones + quatre énoncés
        expect(html).not.toContain('composeur-badges');
    });
});

/* ============================================================ B — LA POSE AU CLIC */

describe('branchement · B — la pose au clic, avec et sans vue', () => {
    it('B.a avec une vue visitée : le caret vient de la vue, le texte est écrit, la vue se redessine après le badge, le même chemin d\'écriture', () => {
        const m = monter([]);
        m.win.tempCriteres = [clone(ALGO)];
        const { zone, bouton } = zonePalier({ value: 'Tu as. Bilan', sel: 0, visitee: true, vue: true, curseur: { debut: 6, fin: 6 } });
        m.win.insererRepereEnonce(bouton);
        expect(zone.value).toBe('Tu as. {projection} Bilan');
        expect(zone.dataset.composeurEcrit).toBe('Tu as. {projection} Bilan');
        expect(zone.dataset.curseurVu).toBe('1');
        // « ' {projection}' » (13 caractères) après « Tu as. » (6) : le caret du registre est à 19.
        expect(m.appels.filter((a) => a[0] === 'ecrire')).toEqual([['ecrire', 'Tu as. {projection} Bilan', 19]]);
        expect(zone._vue._focus).toBe(true);
        expect(zone._range).toBeUndefined();   // pas de setSelectionRange sur le textarea caché
        expect(m.win.tempCriteres[0].paliersProjection[4].texte).toBe('Tu as. {projection} Bilan');
    });

    it('B.b avec une vue jamais visitée : à la fin du texte, quoi que dise la vue', () => {
        const m = monter([]);
        m.win.tempCriteres = [clone(ALGO)];
        const { zone, bouton } = zonePalier({ value: 'Tu as', visitee: false, vue: true, curseur: { debut: 0, fin: 0 } });
        m.win.insererRepereEnonce(bouton);
        expect(zone.value).toBe('Tu as {projection}');
        expect(m.appels.filter((a) => a[0] === 'ecrire')[0]).toEqual(['ecrire', 'Tu as {projection}', 18]);
    });

    it('B.c sans vue : le chemin d\'avant — selectionStart, setSelectionRange, focus sur le textarea', () => {
        const m = monter([]);
        m.win.tempCriteres = [clone(ALGO)];
        const { zone, bouton } = zonePalier({ value: 'Tu as. Bilan', sel: 6, visitee: true, vue: false });
        m.win.insererRepereEnonce(bouton);
        expect(zone.value).toBe('Tu as. {projection} Bilan');
        expect(zone._range).toEqual([19, 19]);
        expect(zone._focus).toBe(true);
        expect(zone.dataset.composeurEcrit).toBeUndefined();
        expect(m.appels.filter((a) => a[0] === 'ecrire')).toEqual([]);
    });

    it('B.d un énoncé avec une vue : même chose, par le groupe de formulaire', () => {
        const m = monter([]);
        m.win.tempCriteres = [clone(ALGO)];
        // Un texte qui n'est PAS celui du modèle : le registre n'écrit `critere.enonces` que pour ce qui diffère du défaut.
        const zone = Object.assign(fauxElement(), { tagName: 'TEXTAREA', value: 'Travaille surtout', dataset: { critereIndex: '0', enonceCle: 'concentre', curseurVu: '1' } });
        zone._vue = Object.assign(fauxElement(), { _curseur: { debut: 17, fin: 17 }, _textarea: zone });
        const groupe = { querySelector: () => zone };
        const bouton = { closest: (s) => (s === '.groupe-form' ? groupe : null), dataset: { jeton: '{critere}' } };
        m.win.insererRepereEnonce(bouton);
        expect(zone.value).toBe('Travaille surtout {critere}');
        expect(m.win.tempCriteres[0].enonces.concentre).toBe('Travaille surtout {critere}');
        expect(E.normaliser(m.win.tempCriteres[0]).enonces.concentre).toBe('Travaille surtout {critere}');
        expect(m.appels.filter((a) => a[0] === 'ecrire')[0]).toEqual(['ecrire', 'Travaille surtout {critere}', 27]);
    });
});

/* ============================================================ C — LE FOCUS */

describe('branchement · C — la vue focalisée vaut sa zone', () => {
    it('C.a focusin sur la vue : la zone est marquée visitée et le palier retient sa zone active ; un textarea nu marche comme avant ; autre chose, rien', () => {
        const m = monter([]);
        const focusin = m.ecoutes.focusin[0];
        expect(typeof focusin).toBe('function');
        const { zone, palier } = zonePalier({ champ: 'texteAide', vue: true });
        palier.dataset.zoneActive = 'texte';
        zone.closest = (s) => (s === '.palier-projection' ? palier : null);
        delete zone.dataset.curseurVu;
        focusin({ target: zone._vue });
        expect(zone.dataset.curseurVu).toBe('1');
        expect(palier.dataset.zoneActive).toBe('texteAide');
        // Un textarea nu : comme avant.
        const nue = zonePalier({ champ: 'texte', vue: false });
        delete nue.zone.dataset.curseurVu;
        focusin({ target: nue.zone });
        expect(nue.zone.dataset.curseurVu).toBe('1');
        // Un élément quelconque : rien.
        expect(() => focusin({ target: { tagName: 'DIV', closest: () => null } })).not.toThrow();
        expect(() => focusin({ target: null })).not.toThrow();
    });

    it('C.b la zone cible d\'un palier : la vue qui a le focus désigne son textarea', () => {
        const m = monter([]);
        m.win.tempCriteres = [clone(ALGO)];
        const { zone, palier, bouton } = zonePalier({ value: 'Ici', visitee: true, vue: true, curseur: { debut: 3, fin: 3 }, champ: 'texteAide' });
        palier.dataset.zoneActive = 'texte';   // la dernière visitée dit « texte »…
        palier.querySelector = (sel) => (sel.indexOf('texteAide') >= 0 ? zone : null);
        m.document.activeElement = zone._vue;  // …mais la vue de « texteAide » a le focus : c'est elle la cible
        m.win.insererRepereEnonce(bouton);
        expect(zone.value).toBe('Ici {projection}');
        expect(m.win.tempCriteres[0].paliersProjection[4].texteAide).toBe('Ici {projection}');
    });
});

/* ============================================================ D — LES SOURCES */

describe('branchement · D — un point de montage par rendu, le jeton', () => {
    it('D.a `monterVuesBadges` est déclaré une fois et appelé par les deux rendus ; `_zoneDeFocus` sert le focusin et la zone cible ; jeton grilles (d)', () => {
        const code = source('js/grilles.js');
        expect((code.match(/function monterVuesBadges\(/g) || []).length).toBe(1);
        expect((code.match(/^\s*monterVuesBadges\(container\);/gm) || []).length).toBe(2);
        expect((code.match(/_zoneDeFocus\(/g) || []).length).toBe(3);
        expect(code).toMatch(/window\.composeurBadges\.ecrire\(vue, r\.texte, r\.curseur\)/);
        expect(source('index.html')).toMatch(/js\/grilles\.js\?v=20260905[d-z]|js\/grilles\.js\?v=2026090[6-9]|js\/grilles\.js\?v=20261/);
    });
});
