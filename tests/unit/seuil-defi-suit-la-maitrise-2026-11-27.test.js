/**
 * Fiche 2 du lot « Suivi » (décisions de Grégoire du 27 nov. 2026, sur la proposition du rapport du lot) — LE SEUIL DE
 * DÉFI D'UN CRITÈRE SUIT LE SEUIL DE MAÎTRISE DE L'ÉCHELLE.
 *   · Sans valeur choisie, le seuil de défi est le seuil de maîtrise de l'échelle, lu à la source de la famille P
 *     (`reperesPerformance`) ; une échelle sans seuil de maîtrise garde 70 %, comme avant.
 *   · Un 0,70 déjà enregistré compte pour laissé par défaut ; toute autre valeur enregistrée est un choix, gardé.
 *   · À l'avenir, seul le champ du seuil de défi l'enregistre (avec sa marque de choix, `defiSpecifiqueChoisi`) :
 *     toucher un autre champ de la page ne l'enregistre plus. Rien n'est réécrit dans les données.
 *
 *   cd tests && npx vitest run unit/seuil-defi-suit-la-maitrise-2026-11-27.test.js
 *
 * Break-test (27 nov. 2026) : sur le code d'avant, A1, A3, B1 à B5, C et D sont rouges.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, monter, storeBase, echelleAReperes, globauxEchelle, copieSurEchelle, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** interpretation-config.js réel, sur un stock ; `maitrise` : ce que rend la source des seuils de P (null : l'échelle n'en porte pas). */
function config(stocke, maitrise) {
    const store = stocke === undefined ? {} : { seuilsInterpretation: clone(stocke) };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); } };
    const win = { reperesPerformance: () => ({ echelle: {}, suffisance: 65, maitrise, audela: null, passage: 60 }) };
    chargerScript('js/interpretation-config.js', { db }, win);
    return { win, store };
}

describe('fiche 2 · A — la valeur du seuil de défi', () => {
    it('A1 un 0,70 enregistré compte pour laissé par défaut : il suit le seuil de maîtrise (75)', () => {
        expect(config({ defiSpecifique: 0.70 }, 75).win.obtenirSeuil('defiSpecifique')).toBe(0.75);
    });
    it('A2 un 0,65 enregistré est un choix : il est gardé', () => {
        expect(config({ defiSpecifique: 0.65 }, 75).win.obtenirSeuil('defiSpecifique')).toBe(0.65);
    });
    it('A3 rien d\'enregistré : le seuil de maîtrise', () => {
        expect(config(undefined, 80).win.obtenirSeuil('defiSpecifique')).toBe(0.8);
    });
    it('A4 une échelle sans seuil de maîtrise : 70 %, comme avant', () => {
        expect(config({ defiSpecifique: 0.70 }, null).win.obtenirSeuil('defiSpecifique')).toBe(0.70);
        expect(config(undefined, null).win.obtenirSeuil('defiSpecifique')).toBe(0.70);
    });
    it('A5 un 70 choisi au champ (marque de choix) reste 70, même sous une maîtrise à 75', () => {
        expect(config({ defiSpecifique: 0.70, defiSpecifiqueChoisi: true }, 75).win.obtenirSeuil('defiSpecifique')).toBe(0.70);
    });
    it('A6 lire ne réécrit rien', () => {
        const { win, store } = config({ defiSpecifique: 0.70, progressionArtefacts: 0.1, directionRisque: 0.05, nombreProductionsAnalyse: 3,
            interpretation: { excellent: 0.95, bon: 0.9, acceptable: 0.85 } }, 75);
        const avant = clone(store);
        win.obtenirSeuil('defiSpecifique');
        expect(store).toEqual(avant);
    });
});

/* ------------------------------------------------------------------ B — la page Labo › Observation */

function fauxDocument(champs) {
    const elems = {};
    for (const [id, valeur] of Object.entries(champs)) {
        let v = String(valeur);
        elems[id] = { checked: false, get value() { return v; }, set value(x) { v = String(x); } };
    }
    return { readyState: 'complete', addEventListener() {}, removeEventListener() {}, getElementById: (id) => elems[id] || null,
        querySelector: () => null, querySelectorAll: () => [], body: { classList: { add() {}, remove() {}, contains() { return false; } } }, _elems: elems };
}

const CHAMPS = { 'v2-seuil-fragile': 85, 'v2-seuil-acceptable': 90, 'v2-seuil-bon': 95, 'v2-pref-fenetre-patterns': 3, 'v2-seuil-progression': 10, 'v2-seuil-risque': 5, 'v2-seuil-defi': 75 };

function page(stocke, { maitrise = 75, champs = {} } = {}) {
    const store = stocke === undefined ? {} : { seuilsInterpretation: clone(stocke) };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, removeSync: (k) => { delete store[k]; } };
    const ecritures = [];
    const win = { addEventListener() {}, removeEventListener() {}, dbReady: false, obtenirTrimestreId: () => 'test', temoinEnregistrement: { nonEnregistre: vi.fn(), enregistre: vi.fn() },
        reperesPerformance: () => ({ echelle: {}, suffisance: 65, maitrise, audela: null, passage: 60 }) };
    const globaux = { db, cle: (k) => k, obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, definirPreference: () => true,
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push(clone(v)); store[k] = clone(v); return true; },
        ecrireEtAnnoncer: async (k, ecrire) => ecrire(), notifications: { succes() {}, erreur() {}, info() {} }, alert() {} };
    chargerScript('js/interpretation-config.js', globaux, win);
    globaux.obtenirSeuil = win.obtenirSeuil;
    globaux.chargerSeuilsInterpretation = win.chargerSeuilsInterpretation;
    chargerScript('js/profil-etudiant-helpers.js', globaux, win);
    const doc = fauxDocument(Object.assign({}, CHAMPS, champs));
    chargerAvecInterne('js/preferences-v2.js', Object.assign({ document: doc }, globaux), win, ['chargerPreferencesDepuisStorage']);
    return { win, store, doc, ecritures, interne: win.__audit['preferences-v2.js'] };
}

describe('fiche 2 · B — seul le champ du seuil de défi l\'enregistre', () => {
    it('B1 toucher un autre champ de la page n\'enregistre plus de seuil de défi', () => {
        const b = page(undefined);
        expect(b.win.sauvegarderSeuilsV2()).toBe(true);
        const ecrit = b.ecritures[b.ecritures.length - 1];
        expect(ecrit.defiSpecifiqueChoisi).toBeUndefined();
        expect(ecrit.defiSpecifique === undefined || ecrit.defiSpecifique === 0.70).toBe(true);
        expect(b.win.obtenirSeuil('defiSpecifique')).toBe(0.75);
    });

    it('B2 le champ du seuil de défi enregistre la valeur et sa marque de choix ; elle est lue', () => {
        const b = page(undefined, { champs: { 'v2-seuil-defi': 68 } });
        expect(b.win.sauvegarderSeuilDefiV2()).toBe(true);
        expect(b.store.seuilsInterpretation.defiSpecifique).toBe(0.68);
        expect(b.store.seuilsInterpretation.defiSpecifiqueChoisi).toBe(true);
        expect(b.win.obtenirSeuil('defiSpecifique')).toBe(0.68);
    });

    it('B3 le champ vidé oublie le choix : le seuil suit de nouveau la maîtrise, et le champ la montre', () => {
        const b = page({ defiSpecifique: 0.68, defiSpecifiqueChoisi: true }, { champs: { 'v2-seuil-defi': '' } });
        b.win.sauvegarderSeuilDefiV2();
        expect(b.store.seuilsInterpretation.defiSpecifiqueChoisi).toBeUndefined();
        expect(b.win.obtenirSeuil('defiSpecifique')).toBe(0.75);
        expect(b.doc._elems['v2-seuil-defi'].value).toBe('75');
    });

    it('B4 « Restaurer » les seuils de détection oublie le choix', () => {
        const b = page({ defiSpecifique: 0.62, defiSpecifiqueChoisi: true }, { champs: { 'v2-seuil-defi': 62 } });
        b.win.restaurerSeuilsDetectionDefautV2();
        expect(b.store.seuilsInterpretation.defiSpecifiqueChoisi).toBeUndefined();
        expect(b.win.obtenirSeuil('defiSpecifique')).toBe(0.75);
        expect(b.doc._elems['v2-seuil-defi'].value).toBe('75');
    });

    it('B5 à l\'ouverture, le champ montre la valeur en vigueur (75, la maîtrise), pas le 70 enregistré', () => {
        const b = page({ defiSpecifique: 0.70 }, { champs: { 'v2-seuil-defi': '' } });
        b.interne.chargerPreferencesDepuisStorage();
        expect(b.doc._elems['v2-seuil-defi'].value).toBe('75');
        expect(b.store.seuilsInterpretation.defiSpecifique).toBe(0.70);   // rien de réécrit
    });
});

describe('fiche 2 · C — le champ, son aide et son infobulle (textes de Grégoire, 27 nov., 14 h 33)', () => {
    const PHRASE = 'Résultat sous lequel un critère est signalé comme un défi. Au départ, c\'est le seuil de maîtrise de ton échelle\u00a0; tu peux le changer. Plus il est haut, plus de critères sont signalés.';
    it('le champ accepte tout seuil de maîtrise (1 à 100) et s\'enregistre par son propre geste', () => {
        const html = lire('index.html');
        const bloc = tranche(html, '<!-- Défi spécifique -->', '<!-- Bouton restaurer seuils de détection -->');
        expect(bloc).toContain('<input type="number" id="v2-seuil-defi" class="controle-form" min="1" max="100" data-on-change="sauvegarderSeuilDefiV2">');
        expect(bloc.replace(/&nbsp;/g, '\u00a0').replace(/[ \t\r\n]+/g, ' ')).toContain(PHRASE + '<br>');
        expect(bloc).toContain('<em>Règle le dépistage seulement.</em>');
        expect(bloc).not.toMatch(/De 60/);
    });
    it('l\'infobulle dit la même phrase, suivie de « Règle le dépistage seulement. »', () => {
        const hover = lire('js/accompagnement-contenu-hover.js');
        const ligne = tranche(hover, "'depist-seuil-defi':", "\n    '");
        // La source écrit l'insécable en séquence et l'apostrophe échappée.
        expect(ligne).toContain(`'${PHRASE.replace(/'/g, "\\'").replace(/\u00a0/g, '\\u00a0')} Règle le dépistage seulement.'`);
    });
});

describe('fiche 2 · D — dans le banc du suivi, la vraie source des seuils de P', () => {
    it('une échelle à maîtrise 80 : le seuil de défi vaut 0,80 ; sans seuil de maîtrise, 0,70', () => {
        for (const [maitrise, attendu] of [['M', 0.8], [null, 0.7]]) {
            const echelle = echelleAReperes({ plages: [['I', 0, 64], ['D', 65, 79], ['M', 80, 89], ['E', 90, 100]], maitrise });
            if (!maitrise) delete echelle.seuilMaitrise;
            const store = storeBase();
            store.test_echellesTemplates = [echelle];
            store.test_evaluationsSauvegardees = [copieSurEchelle(echelle)];
            const b = monter(store, { modules: ['js/contexte-qualification.js'], globaux: globauxEchelle(echelle) });
            expect(b.win.obtenirSeuil('defiSpecifique')).toBe(attendu);
        }
    });
});
