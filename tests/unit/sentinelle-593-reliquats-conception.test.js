import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #593 (29 août 2026) — LES RELIQUATS CONCEPTION DE LA SECONDE PASSE.
//
// Quatre constats de l'audit du 27 août (§7.2 n° 5-6-7) n'avaient pas d'item :
//   1. le banc #549 était tautologique sur l'en-tête (réancré dans son fichier) ;
//   2. le modèle de cartouche parlait d'un « seuil de maîtrise » écrit dans le
//      code — ici : il nomme le repère « Maîtrisé à partir de » de l'échelle,
//      ou dit qu'elle n'en a pas ;
//   3. `sauvegarderCommentaire` lisait `cartoucheActuel` après un `await` — ici :
//      la cible est capturée, et l'écriture atterrit dans la bonne cartouche
//      même si une autre a été ouverte entre-temps ;
//   4. `getCouleurNiveau` (export-pdf.js) discriminait I/D/M/E avec quatre
//      couleurs identiques — retiré, cliquet.
// D3 (clés `cartouches_*` sans cle()) est renvoyé à #358, pas couvert ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

/* ------------------------------------------------ 2 · le modèle et les repères */

const GRILLE = { id: 'GR1', nom: 'Grille', criteres: [{ nom: 'Structure', ponderation: 50 }] };
const NIVEAUX = [
    { code: 'W', nom: 'Amorce', min: 0, max: 49 },
    { code: 'X', nom: 'Suffisant', min: 50, max: 69 },
    { code: 'Y', nom: 'Consolidé', min: 70, max: 100 }
];

function chargerComposeur() {
    return chargerScript('js/cartouches.js', {
        db: { get: async () => [], getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { succes() {}, erreur() {}, info() {} },
        obtenirDonneesSelonMode: () => [], obtenirPreference: () => null,
        genererIdUnique: (p) => p + '1',
        blocsInformationDocument: () => []
    });
}

describe('#593 · 2 — le modèle de cartouche lit les repères de l\'échelle', () => {
    it('avec un repère « Maîtrisé à partir de », le modèle NOMME ce niveau', () => {
        const win = chargerComposeur();
        const echelle = { id: 'E1', nom: 'W-X-Y', niveaux: NIVEAUX, seuilSuffisance: 'X', seuilMaitrise: 'Y' };
        const texte = win.composerModeleCartouche(GRILLE, echelle, null, 'Modèle');
        expect(texte).toContain('niveaux situés sous « Consolidé » (Y)');
        expect(texte).toContain('niveaux à partir de « Consolidé »');
        expect(texte).not.toContain('seuil de maîtrise');
        // Et la liste des niveaux marque les deux repères, au bon niveau chacun.
        expect(texte).toMatch(/\*\*Y\*\* — Consolidé.*« Maîtrisé à partir de »/);
        expect(texte).toMatch(/\*\*X\*\* — Suffisant.*« Suffisant à partir de »/);
        expect(texte).not.toMatch(/\*\*W\*\* — Amorce.*à partir de/);
    });

    it('sans repère, le modèle le DIT au lieu de deviner un seuil', () => {
        const win = chargerComposeur();
        const echelle = { id: 'E2', nom: 'Sans repère', niveaux: NIVEAUX };
        const texte = win.composerModeleCartouche(GRILLE, echelle, null, 'Modèle');
        expect(texte).toContain('ne porte PAS de repère « Maîtrisé à partir de »');
        expect(texte).not.toContain('seuil de maîtrise');
        expect(texte).not.toContain('à partir d\'ici');
    });

    it('un repère qui ne désigne aucun niveau de l\'échelle est traité comme absent', () => {
        const win = chargerComposeur();
        const echelle = { id: 'E3', nom: 'Repère orphelin', niveaux: NIVEAUX, seuilMaitrise: 'Z' };
        const texte = win.composerModeleCartouche(GRILLE, echelle, null, 'Modèle');
        expect(texte).toContain('ne porte PAS de repère');
    });
});

/* ------------------------------------------------ 3 · la course inter-cartouches */

function elementFictif(valeur = '') {
    return { value: valeur, innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false },
        querySelectorAll: () => [], querySelector: () => null, appendChild() {}, addEventListener() {} };
}

describe("#593 · 3 — l'écriture d'une cellule atterrit dans la cartouche qui la portait", () => {
    it("même si une cartouche NEUVE est ouverte pendant l'await de l'écriture", async () => {
        const A = { id: 'CA', grilleId: 'G1', nom: 'A', criteres: [{ id: 'CR', nom: 'C' }], niveaux: [{ code: 'W', nom: 'w' }], commentaires: {} };
        // ⚠ CLÉ MIGRÉE PAR S5/#623 LE 31 AOÛT 2026 : ce corpus semait sous la clé NUE
        // `cartouches_G1`. `js/cartouches.js` route désormais par `cle(...)`, et le
        // stub `cle` de ce cas rend `a2026_` + k — comme pour les échelles et les
        // grilles ci-dessous, qui étaient DÉJÀ namespacées. La clé nue était le seul
        // reliquat, et c'est elle qui faisait lire une collection vide.
        const store = {
            a2026_cartouches_G1: [JSON.parse(JSON.stringify(A))],
            a2026_echellesTemplates: [{ id: 'E1', niveaux: [{ code: 'W', nom: 'w' }] }],
            a2026_grillesTemplates: [{ id: 'G1', nom: 'Grille', criteres: [{ id: 'CR', nom: 'C' }] }]
        };
        const els = { 'comm_CR_W': elementFictif('texte tapé dans A'), 'selectEchelleCartouche': elementFictif('') };
        let basculer = null;
        const globaux = {
            db: {
                get: async (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
                getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
                set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
                // Pendant l'écriture de la cellule, l'utilisateur ouvre une cartouche neuve : la
                // variable de module `cartoucheActuel` change de cible. ↻ #1149, lot 3b (24 oct. 2026) :
                // la bascule se faisait pendant la lecture des échelles du calcul de complétion ; ce
                // calcul (asynchrone) est parti avec les métriques, la chaîne se dessine sans attendre.
                // L'attente qui reste avant que la cellule atterrisse est celle de l'écriture.
                modifier: async (k, mutateur, defaut) => {
                    if (k === 'a2026_cartouches_G1' && basculer) { const b = basculer; basculer = null; await b(); }
                    const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                    const r = await mutateur(valeur); if (r === undefined) return undefined; store[k] = r; return r;
                }
            },
            cle: (k) => 'a2026_' + k, echapperHtml: (t) => String(t == null ? '' : t),
            notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
            genererIdUnique: (p) => p + 'neuve', obtenirIdentiteCCUtilisateur: () => 'Testeur',
            GabaritsUtils: new Proxy({}, { get: () => (() => []) }),
            BibliothequeUI: new Proxy({}, { get: (c, nom) => (nom === 'filtrerParModeDemo' ? ((x) => x || []) : (() => '')) }),
            alert: () => {}, confirm: () => true,
            cartoucheActuel: A,
            document: { getElementById: (id) => (els[id] || (els[id] = elementFictif())), querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => elementFictif() }
        };
        const win = chargerScript('js/cartouches.js', globaux);
        basculer = async () => { await win.ajouterCartoucheAGrille('G1'); };

        await win.sauvegarderCommentaire('CR_W');

        // La bascule a bien eu lieu : la cartouche ouverte est la neuve, jamais écrite.
        expect(win.cartoucheActuel.id).toBe('CART_neuve');
        // Et le texte est en base sous A — la cartouche qui portait la cellule.
        const enBase = Object.fromEntries(store.a2026_cartouches_G1.map(c => [c.id, c.commentaires.CR_W || '']));
        expect(enBase.CA).toBe('texte tapé dans A');
        expect(Object.keys(enBase)).toEqual(['CA']);
    });
});

/* ------------------------------------------------ 4 · le colorieur mort */

describe('#593 · 4 — cliquet : plus de couleur par lettre IDME dans export-pdf.js', () => {
    it('ni getCouleurNiveau ni niveauI/D/M/E hors commentaires', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'export-pdf.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
        expect(src).not.toContain('getCouleurNiveau');
        expect(src).not.toMatch(/\bniveau[IDME]\b/);
    });
});
