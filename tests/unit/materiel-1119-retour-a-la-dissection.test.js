/**
 * « APPORTER MON MATÉRIEL », #1119 — revenir à sa dissection après « Créer ma grille ».
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-20-retour-a-la-dissection.md (« Les bancs », Vitest).
 * Symptôme vécu par Grégoire le 19 oct. au soir : sa grille créée, il a dû reconstituer toute sa dissection.
 *
 * Ce que ce banc verrouille, sur le résumé que rend la VRAIE création (`materielCreation.creer`) et le VRAI
 * `materielDissection.aUnBrouillon` (la clé du brouillon dans le faux `db`) :
 *   B — LE BOUTON « Revenir à ma dissection » : dans les deux confirmations (en points, à niveaux) quand un
 *       brouillon existe, absent sans brouillon ; « Coller une autre grille » est là dans les deux cas.
 *   H — AUCUN HANDLER INLINE : le bouton passe par `data-action`, que le dispatcher de main.js résout.
 *
 * Le parcours (revenir, recréer, la première grille intacte) : `tests/integration/materiel-1119.spec.js`.
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

/** Un faux `db` qui se comporte comme le vrai pour `modifier` (même forme qu'à l'étape 6). */
const db = {
    store: new Map(),
    reset() { this.store = new Map(); },
    getSync(k, d) { return this.store.has(k) ? JSON.parse(JSON.stringify(this.store.get(k))) : d; },
    setSync(k, v) { this.store.set(k, JSON.parse(JSON.stringify(v))); },
    removeSync(k) { this.store.delete(k); },
    async get(k, d) { return this.getSync(k, d); },
    async set(k, v) { this.setSync(k, v); },
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
    w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    w.addEventListener = () => {};   // les branchements de la page, sans objet ici
    chargerScript('js/materiel-dissection.js', { db, document: fenetreDom.document }, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db, document: fenetreDom.document }, w);
    C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
});
beforeEach(() => {
    w.cle = (k) => 'a2032_' + k;
    w.estTrimestreArchive = () => false;
    db.reset();
});

/** La confirmation que Grégoire voit après « Créer ma grille », sur le résumé de la vraie création. */
async function confirmation(m) {
    const r = await C.creer(m);
    expect(r.erreur).toBeUndefined();
    const div = fenetreDom.document.createElement('div');
    div.innerHTML = materiel.confirmationHtml(r.resume);
    return { div, resume: r.resume };
}

const REVENIR = '[data-action="materiel.revenirDissection"]';
const brouillon = () => db.setSync('a2032_brouillonDissection', { format: 'dissection-9', doc: 'un brouillon, lisible ou non' });

const MODELES = {
    'en points': () => fige('plus-loin · en points'),
    'à niveaux': () => fige('plus-loin · à niveaux')
};

describe('B — « Revenir à ma dissection » dans les deux confirmations', () => {
    for (const [nom, modele] of Object.entries(MODELES)) {
        it('B.' + nom + ' — rendu quand un brouillon existe, bouton secondaire à côté de « Coller une autre grille »', async () => {
            brouillon();
            const { div, resume } = await confirmation(modele());
            expect(resume.enPoints).toBe(nom === 'en points');
            const b = div.querySelector(REVENIR);
            expect(b).not.toBeNull();
            expect(b.textContent).toBe('Revenir à ma dissection');
            expect(b.getAttribute('type')).toBe('button');
            expect(b.classList.contains('btn-secondaire')).toBe(true);
            // À côté des gestes existants : dans le même rang que « Coller une autre grille », avant lui.
            const rang = b.parentElement;
            expect(rang.classList.contains('materiel-retours')).toBe(true);
            expect([...rang.children].map((x) => x.getAttribute('data-action'))).toEqual(['materiel.revenirDissection', 'materiel.recommencer']);
        });

        it('B.' + nom + ' — absent sans brouillon ; « Coller une autre grille » reste', async () => {
            const { div } = await confirmation(modele());
            expect(div.querySelector(REVENIR)).toBeNull();
            expect(div.querySelector('[data-action="materiel.recommencer"]').textContent).toBe('Coller une autre grille');
        });
    }

    it('B.trimestre — le brouillon d’un autre espace (la démo) ne fait pas paraître le bouton', async () => {
        db.setSync('demo_brouillonDissection', { format: 'dissection-9', doc: 'x' });
        const { div } = await confirmation(fige('plus-loin · en points'));
        expect(div.querySelector(REVENIR)).toBeNull();
    });
});

describe('H — aucun handler inline', () => {
    it('H.a — aucun attribut on… dans la confirmation, et l’action existe pour le dispatcher', async () => {
        brouillon();
        const { div } = await confirmation(fige('plus-loin · à niveaux'));
        const inline = [...div.querySelectorAll('*')].filter((x) => [...x.attributes].some((a) => /^on/i.test(a.name)));
        expect(inline).toEqual([]);
        // main.js résout `data-action` en suivant les points depuis `window`.
        const fn = div.querySelector(REVENIR).getAttribute('data-action').split('.').reduce((o, k) => o && o[k], w);
        expect(typeof fn).toBe('function');
    });
});
