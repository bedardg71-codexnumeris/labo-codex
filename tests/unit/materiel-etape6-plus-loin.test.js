/**
 * « APPORTER MON MATÉRIEL », ÉTAPE 6 DU PLAN « PRÊT POUR LUNDI » — « Aller plus loin avec ta grille ».
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-6-aller-plus-loin.md (« Les bancs »).
 *
 * Ce que ce banc verrouille, sur le résumé que rend la VRAIE création (`materielCreation.creer`) :
 * (19 oct. 2026 : l'assistant qui lisait ces grilles est retiré ; ses modèles sont figés, `_helpers/modeles-assistant-figes.js`.)
 *   P — LE BON PARAGRAPHE selon la grille créée : en points, à niveaux, à niveaux avec rétroactions
 *       (la phrase commune seule).
 *   T — LES TEXTES, mot pour mot (validés par Grégoire le 17 oct. à 12 h 07).
 *   K — LE LIEN : il ouvre l'aide existante `grille-type-critere-detail`, qui existe au catalogue.
 *   O — LA PLACE : sous les cartes, avant « Pour t'en servir… ».
 *
 * ⛔ Aucun texte d'une grille réelle de Grégoire : critères et explications sont inventés.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { fige } from './_helpers/modeles-assistant-figes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

function vraiEchapperHtml() {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, fenetreDom.document, console, stockage, stockage);
}

/** Un faux `db` qui se comporte comme le vrai pour `modifier` (même forme qu'au lot 2). */
const db = {
    store: new Map(),
    reset() { this.store = new Map(); },
    getSync(k, d) { return this.store.has(k) ? JSON.parse(JSON.stringify(this.store.get(k))) : d; },
    async get(k, d) { return this.getSync(k, d); },
    async set(k, v) { this.store.set(k, JSON.parse(JSON.stringify(v))); },
    async modifier(k, mutateur, d) {
        const r = await mutateur(await this.get(k, d));
        if (r === undefined) return undefined;
        await this.set(k, r);
        return r;
    }
};

let w, C, materiel;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', {});   // `plagesContigues`, que `construire` appelle
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db }, w);
    C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
});
beforeEach(() => {
    w.cle = (k) => 'a2032_' + k;
    w.estTrimestreArchive = () => false;
    db.reset();
});

/* ------------------------------------------------------------------ les modèles (figés) */

const TITRE = 'Aller plus loin avec ta grille';
const EN_POINTS = 'Ta grille note chaque critère en points. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en décrivant, pour un critère, ce qu’on attend à chaque niveau.';
const A_NIVEAUX = 'Ta grille décrit ce qu’on attend à chaque niveau. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en associant une rétroaction à chaque niveau.';
const COMMUNE = 'Un critère peut s’évaluer de trois façons : holistique (par niveaux), analytique (par points) ou algorithmique (par un calcul).';
const LIEN = 'Les trois façons d’évaluer un critère';

/** La confirmation que Grégoire voit après « Créer ma grille », sur le résumé de la vraie création. */
async function confirmation(m) {
    const r = await C.creer(m);
    expect(r.erreur).toBeUndefined();
    const div = fenetreDom.document.createElement('div');
    div.innerHTML = materiel.confirmationHtml(r.resume);
    return div;
}
const enPoints = () => confirmation(fige('plus-loin · en points'));
const aNiveaux = () => confirmation(fige('plus-loin · à niveaux'));
const aRetroactions = () => confirmation(fige('plus-loin · rétroactions'));
const paragraphes = (d) => [...d.querySelectorAll('.materiel-plus-loin p')].map(x => x.textContent);

/* ======================================================= P — LE BON PARAGRAPHE */

describe('étape 6 · P — le paragraphe dépend de la grille créée', () => {
    it('P.a une grille en points : le paragraphe « en points », puis la phrase commune', async () => {
        expect(paragraphes(await enPoints())).toEqual([EN_POINTS, COMMUNE]);
    });
    it('P.b une grille à niveaux (descripteurs) : le paragraphe « à niveaux », puis la phrase commune', async () => {
        expect(paragraphes(await aNiveaux())).toEqual([A_NIVEAUX, COMMUNE]);
    });
    it('P.c une grille à niveaux dont les cases étaient des rétroactions : la phrase commune seule', async () => {
        const d = await aRetroactions();
        expect(d.querySelector('[data-param="retroactions"]')).not.toBeNull();   // la cartouche a bien été créée
        expect(paragraphes(d)).toEqual([COMMUNE]);
    });
});

/* ============================================================== T — LES TEXTES */

describe('étape 6 · T — les textes, mot pour mot', () => {
    it('T.a le titre, un h3 qui nomme l’encadré', async () => {
        for (const d of [await enPoints(), await aNiveaux(), await aRetroactions()]) {
            const encadre = d.querySelector('.materiel-plus-loin');
            const h3 = encadre.querySelector('h3');
            expect(h3.textContent).toBe(TITRE);
            expect(encadre.getAttribute('aria-labelledby')).toBe(h3.id);
        }
    });
});

/* ================================================================ K — LE LIEN */

describe('étape 6 · K — le lien ouvre l’aide existante sur les trois types de critères', () => {
    it('K.a un bouton, son texte, et la clé de l’aide passée à `afficherAideContextuelle`', async () => {
        for (const d of [await enPoints(), await aNiveaux(), await aRetroactions()]) {
            const liens = d.querySelectorAll('.materiel-plus-loin button');
            expect(liens).toHaveLength(1);
            expect(liens[0].textContent).toBe(LIEN);
            expect(liens[0].getAttribute('type')).toBe('button');
            expect(liens[0].getAttribute('data-action')).toBe('afficherAideContextuelle');
            expect(liens[0].getAttribute('data-param')).toBe('grille-type-critere-detail');
        }
    });
    it('K.b la clé existe au catalogue des aides, avec ses trois types (aucun texte d’aide neuf)', () => {
        let recues = {};
        chargerScript('js/accompagnement-contenu-popup.js', {}, { accompagnement: { ajouterEntrees: (o) => { recues = o; } } });
        const aide = recues['grille-type-critere-detail'] && recues['grille-type-critere-detail'].popup;
        expect(aide && aide.titre).toBe('Type de critère d’évaluation');
        expect(aide.sections[0].items.join(' ')).toMatch(/Holistique.*Analytique.*Algorithmique/);
    });
    it('K.c `afficherAideContextuelle` est bien offerte au dispatcher `data-action` (window)', () => {
        const src = readFileSync(path.join(racine, 'js', 'accompagnement.js'), 'utf8');
        expect(src).toMatch(/window\.afficherAideContextuelle\s*=\s*afficherAideContextuelle;/);
    });
});

/* ============================================================== O — LA PLACE */

describe('étape 6 · O — sous les cartes, avant « Pour t’en servir… »', () => {
    it('O.a l’encadré suit les cartes et précède la suite, dans les deux confirmations', async () => {
        for (const d of [await enPoints(), await aNiveaux()]) {
            const enfants = [...d.querySelector('.materiel-confirmation').children].map(x => x.className);
            const i = enfants.indexOf('materiel-plus-loin');
            expect(i).toBeGreaterThan(0);
            expect(enfants[i - 1]).toBe('materiel-cartes-cree');
            expect(enfants[i + 1]).toBe('materiel-suite');
        }
    });
});
