/**
 * « APPORTER MON MATÉRIEL », ÉTAPE 5 DU PLAN « PRÊT POUR LUNDI » — les grilles en points,
 * acceptées telles quelles.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md (« Les bancs »).
 *
 * ⚰ 19 oct. 2026 : l'assistant en sept étapes est RETIRÉ (CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md),
 * avec sa lecture d'un tableau en rôles. Partis avec lui : la lecture des deux grilles fictives (G.a à G.c)
 * et ses règles (L), les étapes de l'assistant (A.a), son interface (U, sauf la confirmation), la lecture
 * de l'exemple (N.c). Ce qui reste éprouve la logique commune (`calculs`, `construire`, `materielCreation.creer`,
 * la confirmation), sur les modèles que l'assistant produisait, figés avant son retrait.
 *
 * Ce que ce banc verrouille :
 *   G — LES DEUX GRILLES FICTIVES de la forme de 1995 : leur total, rien ne manque, créées.
 *   A — LES POINTS : entiers de 0 à 100, total libre, sans « Ramener à 100 % ».
 *   C — LA CRÉATION : la grille seule, analytique, `grilleEntierementEnPoints` vrai (le prédicat de
 *       l'application) ; ni échelle ni cartouche écrites.
 *   U — LA CONFIRMATION d'une grille en points.
 *   N — NON-RÉGRESSION : les grilles à niveaux se créent comme avant.
 *
 * ⛔ Aucun texte d'une grille réelle de Grégoire : critères, explications et parties sont inventés.
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

let w, A, C, materiel, grilleEntierementEnPoints;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', {});   // `plagesContigues`, que `construire` appelle
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db }, w);
    A = w.materielAssistant; C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
    // Le prédicat de l'application (#941), pas une copie.
    ({ grilleEntierementEnPoints } = chargerScript('js/gabarits-utils.js', {
        db: { getSync: (c, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t)
    }));
});
beforeEach(() => {
    w.cle = (k) => 'a2032_' + k;
    w.estTrimestreArchive = () => false;
    db.reset();
});

/* ------------------------------------------------------------------ les modèles (figés) */

const avecParties = () => fige('étape 5 · avec parties');
const simple = () => fige('étape 5 · simple');
const exemple = () => fige('étape 5 · l’exemple');
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' });

/* ========================================================== G — LES GRILLES FICTIVES */

describe('étape 5 · G — une grille de la forme de 1995, sans rien toucher', () => {
    it('G.d total juste ; rien ne manque', () => {
        const c = A.calculs(avecParties());
        expect(c.total).toBe(64);
        expect(c.manquants).toEqual([]);
        expect(A.calculs(simple()).total).toBe(50);
    });

    it('G.e « Créer ma grille » : la grille seule, analytique, `grilleEntierementEnPoints` vrai ; ni échelle ni cartouche écrites', async () => {
        const r = await C.creer(avecParties());
        expect(r.erreur).toBeUndefined();
        expect([...db.store.keys()]).toEqual(['a2032_grillesTemplates']);
        const g = db.getSync('a2032_grillesTemplates')[0];
        expect(grilleEntierementEnPoints(g)).toBe(true);
        expect(g.criteres.map(c => c.ponderation)).toEqual([4, 3, 18, 15, 10, 6, 8]);
        expect(r.resume).toMatchObject({ enPoints: true, totalPoints: 64, nbC: 7, ids: { echelle: null, cartouche: null } });
    });
});

/* ================================================================ A — LES POINTS */

describe('étape 5 · A — les points d’une grille en points', () => {
    const avecPoints = (valeurs) => {
        const m = simple();
        m.criteres.forEach((c, i) => { c.ponderation = { valeur: valeurs[i], etat: valeurs[i] ? 'saisi' : 'remplir' }; });
        return m;
    };
    const manques = (m) => A.calculs(m).manquants.filter(t => /points/.test(t));

    it('L.j ni niveau ni points : le manque se nomme', () => {
        expect(A.calculs(fige('étape 5 · ni niveau ni points')).manquants).toContain('les points de chaque critère, ou des colonnes de niveaux, à l’étape « Ce que contient ton tableau »');
    });

    // Étape 5b (point 1) : « / 0 » est accepté — la borne basse passe de 1 à 0.
    it('A.b des points entiers de 0 à 100 ; un manque nommé, au singulier ou au pluriel', () => {
        expect(manques(avecPoints(['5', '10', '20', '15']))).toEqual([]);
        expect(manques(avecPoints(['5', '', '20', '15']))).toEqual(['les points d’un critère']);
        expect(manques(avecPoints(['5', '', '', '15']))).toEqual(['les points de 2 critères']);
        expect(manques(avecPoints(['0', '2,5', '101', '100']))).toEqual(['des points en nombre entier de 0 à 100 pour 2 critères']);
        expect(manques(avecPoints(['-1', '0', '4', '100']))).toEqual(['des points en nombre entier de 0 à 100 pour un critère']);
    });

    it('A.c le total est libre : ni avertissement ni « Ramener à 100 % » ; pas de manque de niveau', () => {
        const c = A.calculs(avecPoints(['5', '10', '20', '15']));
        expect(c).toMatchObject({ total: 50, avertPond: false, peutRamener: false, avertPlages: '', avertNotes: '' });
        expect(c.manquants).toEqual([]);
    });
});

/* ================================================================ C — LA CRÉATION */

describe('étape 5 · C — la grille seule, en points', () => {
    it('C.a `type: \'analytique\'` sur la grille et chaque critère ; pondération = ses points ; aucun descripteur', () => {
        const o = A.construire(avecParties(), ctx());
        expect(o.echelle).toBeNull();
        expect(o.cartouche).toBeNull();
        expect(o.grille.type).toBe('analytique');
        expect(o.grille.criteres.every(c => c.type === 'analytique' && !('descripteurs' in c))).toBe(true);
        expect(o.grille.criteres[1]).toMatchObject({ nom: 'Introduction – Sujet posé', description: 'La question est formulée clairement.\nElle reprend les termes du sujet.', ponderation: 3 });
    });

    it('C.b le critère a la forme de l’éditeur (lot 3a), type mis à part', () => {
        const aNiveaux = A.construire(exemple(), ctx()).grille.criteres[0];
        const enPoints = A.construire(simple(), ctx()).grille.criteres[0];
        const cles = (c) => Object.keys(c).filter(k => k !== 'descripteurs').sort();
        expect(cles(enPoints)).toEqual(cles(aNiveaux));
        expect(enPoints).toMatchObject({ formule: '', niveauSOLO: 'aucun', verrouille: false });   // #1117
    });

    it('C.c `grilleEntierementEnPoints` vrai pour la grille en points, faux pour une grille à niveaux', () => {
        expect(grilleEntierementEnPoints(A.construire(simple(), ctx()).grille)).toBe(true);
        expect(grilleEntierementEnPoints(A.construire(exemple(), ctx()).grille)).toBe(false);
    });
});

/* ============================================================ U — LA CONFIRMATION */

describe('étape 5 · U — la confirmation', () => {
    it('U.d la confirmation : la carte « Grille » seule ; « Pour t’en servir… » inchangé', () => {
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.confirmationHtml({ nom: 'G', nbC: 7, enPoints: true, totalPoints: 64, retro: false, descr: false, ids: {}, niveaux: [] });
        expect([...div.querySelectorAll('[data-action="materiel.voir"]')].map(b => b.getAttribute('data-param'))).toEqual(['grille-criteres', 'productions']);
        expect(div.querySelector('.materiel-carte-cree span').textContent).toBe('7 critères, sur 64 points.');
        expect(div.querySelector('.materiel-suite span').textContent).toBe('Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle.');
    });

});

/* ================================================================ N — NON-RÉGRESSION */

describe('étape 5 · N — les grilles à niveaux, comme avant', () => {
    it('N.a l’exemple : échelle et grille créées, holistique', () => {
        const m = exemple();
        expect(m.enPoints).toBe(false);
        const o = A.construire(m, ctx());
        expect(o.echelle).not.toBeNull();
        expect(o.grille.criteres.every(c => c.type === 'holistique')).toBe(true);
        expect(o.grille).not.toHaveProperty('type');
    });

    it('N.b une pondération à 90 % avertit toujours, et « Ramener à 100 % » reste offert', () => {
        const m = exemple();
        m.criteres[0].ponderation = { valeur: '30', etat: 'saisi' };
        expect(A.calculs(m)).toMatchObject({ total: 90, avertPond: true, peutRamener: true });
    });
});
