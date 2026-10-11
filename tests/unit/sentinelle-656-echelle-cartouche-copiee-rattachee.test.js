import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #656 — L'ÉCHELLE D'UNE CARTOUCHE COPIÉE SE RATTACHE COMME À L'IMPORT.
//
// Le report « D-C4 » du cadrage des briques C-D (une cartouche copiée garde l'`echelleId`
// de sa source) devait être statué au pas 4 ; il ne l'a jamais été (fiche du 31 août).
// Statué le 11 oct. 2026 sur consigne : la règle de l'import (lot 3 du 10 oct., #952) —
// une échelle de MÊME NOM aux MÊMES CODES de niveaux est tenue pour déjà là.
//   1. l'id existe dans le trimestre actif → gardé ;
//   2. sinon, l'échelle source a une homonyme locale aux mêmes codes → son id ;
//   3. sinon → gardé (il se résout encore par le pool).
// Trois chemins : la Voûte, la copie d'une grille d'un autre trimestre (via
// dupliquerGrillePartagee) et la copie d'UNE cartouche d'un autre trimestre, dont la
// branche « grille d'accueil déjà là » n'appelle pas dupliquerGrillePartagee.
// La grille copiée garde son `echelleId` : l'import ne le rebranche pas non plus.
//
// Modules RÉELS : partage-section.js, identite-item.js, cartouches.js ; la règle de
// comparaison `memesIdentifiantsElements` est lue dans import-export.js (fonction pure,
// non exportée sur window : elle y est globale par sa déclaration).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcIE = readFileSync(path.join(racine, 'js/import-export.js'), 'utf8');
const debut = srcIE.indexOf('function memesIdentifiantsElements(');
const memesIdentifiantsElements = new Function(
    srcIE.slice(debut, srcIE.indexOf('\n}\n', debut) + 2) + '\nreturn memesIdentifiantsElements;'
)();

const NIVEAUX = (codes) => codes.map((c) => ({ code: c, nom: c }));

function faireDb(initial) {
    const donnees = JSON.parse(JSON.stringify(initial));
    return {
        _donnees: donnees,
        async get(k) { return k in donnees ? donnees[k] : null; },
        async set(k, v) { donnees[k] = v; },
        getSync(k, d) { return k in donnees ? donnees[k] : (d !== undefined ? d : null); },
        setSync(k, v) { donnees[k] = v; },
        async modifier(k, mutateur, defaut = null) {
            const r = await mutateur(k in donnees ? donnees[k] : defaut);
            if (r !== undefined) donnees[k] = r;
            return r;
        }
    };
}

function monter(initial) {
    const db = faireDb(initial);
    const cle = (nom) => `h2026_${nom}`;
    const cleSource = (nom, src) => `${src}_${nom}`;
    let compteur = 0;
    const genererIdUnique = (p) => `${p}${++compteur}`;
    const BibliothequeUI = {
        forgerInspireDe: (src) => ({ nom: (src && src.nom) || 'Inconnu', sourceId: src && src.id }),
        obtenirAuteurActif: () => 'Banc'
    };
    const winId = chargerScript('js/identite-item.js');
    const winPartage = { cle };
    chargerScript('js/partage-section.js', {
        db, cle, genererIdUnique, BibliothequeUI, memesIdentifiantsElements,
        echapperHtml: (s) => String(s == null ? '' : s)
    }, winPartage);
    const win = chargerScript('js/cartouches.js', {
        db, cle, cleSource, genererIdUnique, BibliothequeUI,
        partageSection: winPartage.partageSection,
        memeIdentite: winId.memeIdentite,
        ajouterAvecGardeIdentite: winId.ajouterAvecGardeIdentite,
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { succes() {}, info() {}, erreur() {} },
        obtenirTrimestres: () => [{ id: 'h2026', actif: true }, { id: 'a2025' }],
        obtenirTrimestreId: () => 'h2026',
        alert: () => {}, confirm: () => true
    });
    return { db, ps: winPartage.partageSection, win };
}

const GRILLE = { id: 'GR_A25', nom: 'Grille A25', criteres: [{ id: 'C1', nom: 'Structure' }], echelleId: 'ECH_A25' };
const CART = { id: 'CART_A25', nom: 'Cartouche', grilleId: 'GR_A25', echelleId: 'ECH_A25', criteres: [{ id: 'C1' }] };
const SOURCE_A25 = { id: 'ECH_A25', nom: 'IDME du cours', niveaux: NIVEAUX(['I', 'D', 'M', 'E']) };

const lireSource = (db) => (id) => (db.getSync('a2025_echellesTemplates', []) || []).find((e) => e.id === id) || null;
const cartouchesDe = (db, grilleId) => db.getSync(`h2026_cartouches_${grilleId}`, []);

describe('#656 · rattacherEchelle — la règle de l\'import', () => {
    it('1 · l\'id présent dans le trimestre actif est gardé, même si une homonyme existe', () => {
        const { ps } = monter({ h2026_echellesTemplates: [
            { id: 'ECH_A25', nom: 'Autre nom', niveaux: NIVEAUX(['X']) },
            { id: 'ECH_H26', nom: 'IDME du cours', niveaux: NIVEAUX(['I', 'D', 'M', 'E']) }
        ] });
        expect(ps.rattacherEchelle('ECH_A25', () => SOURCE_A25)).toBe('ECH_A25');
    });

    it('2 · absent : l\'homonyme locale aux mêmes codes le remplace', () => {
        const { ps } = monter({ h2026_echellesTemplates: [{ id: 'ECH_H26', nom: 'IDME du cours', niveaux: NIVEAUX(['E', 'M', 'D', 'I']) }] });
        expect(ps.rattacherEchelle('ECH_A25', () => SOURCE_A25)).toBe('ECH_H26');
    });

    it('3 · même nom, codes différents : pas la même échelle, l\'id est gardé', () => {
        const { ps } = monter({ h2026_echellesTemplates: [{ id: 'ECH_H26', nom: 'IDME du cours', niveaux: NIVEAUX(['I', 'D', 'M']) }] });
        expect(ps.rattacherEchelle('ECH_A25', () => SOURCE_A25)).toBe('ECH_A25');
    });

    it('4 · rien à quoi se rattacher : l\'id est gardé, rien n\'est inventé', () => {
        const { ps } = monter({ h2026_echellesTemplates: [] });
        expect(ps.rattacherEchelle('ECH_A25', () => SOURCE_A25)).toBe('ECH_A25');
        expect(ps.rattacherEchelle('ECH_A25', () => null)).toBe('ECH_A25');
    });
});

describe('#656 · les trois chemins de copie', () => {
    const LOCALE = { id: 'ECH_H26', nom: 'IDME du cours', niveaux: NIVEAUX(['I', 'D', 'M', 'E']) };

    it('A · copie d\'une grille d\'un autre trimestre : la cartouche suit l\'échelle locale, la grille garde la sienne', () => {
        const { db, ps } = monter({ h2026_echellesTemplates: [LOCALE], a2025_echellesTemplates: [SOURCE_A25] });
        const r = ps.dupliquerGrillePartagee(GRILLE, () => [CART], lireSource(db));
        expect(cartouchesDe(db, r.grille.id)[0].echelleId).toBe('ECH_H26');
        expect(r.grille.echelleId).toBe('ECH_A25');
    });

    it('B · la Voûte : l\'échelle source se lit dans partage_echelles', () => {
        const { db, ps } = monter({ h2026_echellesTemplates: [LOCALE], partage_echelles: [SOURCE_A25] });
        const r = ps.dupliquerGrillePartagee(GRILLE, () => [CART]);
        expect(cartouchesDe(db, r.grille.id)[0].echelleId).toBe('ECH_H26');
    });

    it('C · une cartouche copiée dans une grille d\'accueil déjà là suit aussi l\'échelle locale', async () => {
        const { db, win } = monter({
            h2026_echellesTemplates: [LOCALE], a2025_echellesTemplates: [SOURCE_A25],
            h2026_grillesTemplates: [{ ...GRILLE, id: 'GR_H26', idOriginal: 'GR_A25' }]
        });
        const r = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE, CART);
        expect(r.ajoutee).toBe(true);
        expect(r.grilleAccueil && r.grilleAccueil.id).toBe('GR_H26');
        expect(cartouchesDe(db, 'GR_H26')[0].echelleId).toBe('ECH_H26');
    });

    it('D · une cartouche copiée sans grille d\'accueil (grille copiée avec elle) suit l\'échelle locale', async () => {
        const { db, win } = monter({ h2026_echellesTemplates: [LOCALE], a2025_echellesTemplates: [SOURCE_A25], h2026_grillesTemplates: [] });
        const r = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE, CART);
        expect(r.grilleCreee).toBeTruthy();
        expect(cartouchesDe(db, r.grilleCreee.id)[0].echelleId).toBe('ECH_H26');
    });

    it('E · la source n\'est jamais touchée', () => {
        const { db, ps } = monter({ h2026_echellesTemplates: [LOCALE], a2025_echellesTemplates: [SOURCE_A25] });
        const cart = JSON.parse(JSON.stringify(CART));
        ps.dupliquerGrillePartagee(GRILLE, () => [cart], lireSource(db));
        expect(cart.echelleId).toBe('ECH_A25');
    });
});
