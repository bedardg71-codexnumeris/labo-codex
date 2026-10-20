/**
 * « APPORTER MON MATÉRIEL », ÉTAPE 5b DU PLAN « PRÊT POUR LUNDI » — la reconnaissance, d'après douze
 * grilles réelles.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md ;
 * numéros (1 à 11) et grilles fictives (F1 à F8) de PROPOSITION-2026-10-17-reconnaissance-des-grilles.md.
 *
 * ⚰ 19 oct. 2026 : l'assistant en sept étapes est RETIRÉ (CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md),
 * avec la reconnaissance qu'il faisait d'un tableau (la dissection, elle, s'étiquette à la main). Partis avec
 * lui : la lecture des grilles fictives F1 à F8 (F) et ses règles (R), son interface (U), la lecture de
 * l'exemple (N), la casse d'une partie lue (P.a, P.b). Ce qui reste éprouve la logique commune (`calculs`,
 * `construire`, `materielCreation.creer`, la confirmation, `casseDePartie`), sur les modèles que l'assistant
 * produisait de ces grilles, figés avant son retrait.
 *
 * Ce que ce banc verrouille :
 *   K — CE QUE LA CRÉATION ATTEND des grilles F1, F4b, F5, F6 : les noms de niveau qui manquent, comptés ;
 *       « / 0 » accepté, un nombre négatif ou décimal bloque.
 *   C — LA CRÉATION d'une grille en points À NIVEAUX : analytique, sans échelle, descripteurs rangés
 *       sous le nom du niveau ; lisibles dans Grilles de critères ; rien ne se perd au partage.
 *   U — « Aller plus loin » d'une grille en points qui décrit ses niveaux.
 *   P — LA CASSE d'une partie en capitales (règle 8.16).
 *
 * ⛔ Aucun texte d'une grille réelle de Grégoire : tout est inventé.
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

function vraiEchapperHtml(doc) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, doc || fenetreDom.document, console, stockage, stockage);
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

let w, L, A, C, materiel, grilleEntierementEnPoints;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', {});   // `plagesContigues`, que `construire` appelle ; `casseDePartie`
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db }, w);
    L = w.materielLecture; A = w.materielAssistant; C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
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

/* ===================================================== K — CE QUE LA CRÉATION ATTEND */

describe('étape 5b · K — ce que la création attend des grilles fictives', () => {
    const manques = (nom) => A.calculs(fige('étape 5b · ' + nom)).manquants;

    it('F1 bande à réglette : rien d’autre ne manque que les deux passages, calcul et total', () => {
        expect(manques('F1')).toEqual(['2 passages à classer ou à écarter']);
    });

    it('F4b en-têtes d’icônes : deux noms de niveau manquent, nommés', () => {
        expect(manques('F4b')).toEqual(['le nom de 2 niveaux', '2 passages à classer ou à écarter']);
    });

    it('F5 un niveau sur deux colonnes : le nom du 2e niveau manque', () => {
        expect(manques('F5')).toEqual(['le nom d’un niveau', 'un passage à classer ou à écarter']);
    });

    it('F6 liste à cocher : « / 0 » compris, le total fait 100', () => {
        expect(manques('F6')).toEqual(['2 passages à classer ou à écarter']);
        expect(A.calculs(fige('étape 5b · F6')).total).toBe(100);
    });

    it('R.4a des points décimaux (0,5 à 2,5) bloquent la création', () => {
        expect(manques('R.4a')).toContain('des points en nombre entier de 0 à 100 pour un critère');
    });

    it('R.1 « / 0 » accepté : 0 à 100 ; un nombre négatif ou décimal bloque', () => {
        const m = fige('étape 5b · R.1');
        expect(A.calculs(m).manquants).toEqual([]);
        m.criteres[0].ponderation = { valeur: '-1', etat: 'saisi' };
        expect(A.calculs(m).manquants).toEqual(['des points en nombre entier de 0 à 100 pour un critère']);
    });
});

/* ========================================================= C — LA CRÉATION À NIVEAUX */

const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' });

describe('étape 5b · C — une grille en points à niveaux se crée sans échelle, ses descripteurs sous le nom de leur niveau', () => {
    const f5Complete = () => fige('étape 5b · F5 complétée');

    it('C.a la grille seule, analytique ; `grilleEntierementEnPoints` vrai ; ni échelle ni cartouche écrites', async () => {
        const r = await C.creer(f5Complete());
        expect(r.erreur).toBeUndefined();
        expect([...db.store.keys()]).toEqual(['a2032_grillesTemplates']);
        const g = db.getSync('a2032_grillesTemplates')[0];
        expect(grilleEntierementEnPoints(g)).toBe(true);
        expect(g.criteres.map(c => [c.type, c.ponderation])).toEqual([['analytique', 10], ['analytique', 5], ['analytique', 5]]);
        expect(r.resume).toMatchObject({ enPoints: true, totalPoints: 20, descr: true, ids: { echelle: null, cartouche: null } });
    });

    it('C.b les descripteurs, rangés sous le NOM du niveau, sans `echelleId` ; la nature des cases n’y change rien', () => {
        const g = A.construire(f5Complete(), ctx()).grille;
        expect(g.criteres[0].descripteurs).toEqual({ parNiveau: { 'PALIER A': 'Jamais\n0-5', 'PALIER A+': 'Rarement\n6', 'PALIER B': 'Souvent\n7-8', 'PALIER C': 'Toujours\n9-10' } });
        expect(g.criteres[2]).not.toHaveProperty('descripteurs');   // « / 5 » fusionné : aucun texte de niveau
        const retro = A.construire(fige('étape 5b · F5 complétée, rétroactions'), ctx());
        expect(retro.cartouche).toBeNull();
        expect(Object.keys(retro.grille.criteres[0].descripteurs.parNiveau)).toHaveLength(4);
    });

    it('C.c les noms de niveau : requis, uniques, sans « _ » en tête ; ni plage, ni note retenue, ni code demandés', () => {
        const m = f5Complete();
        expect(A.calculs(m).manquants).toEqual([]);
        m.niveaux[1].titre = { valeur: 'palier a', etat: 'saisi' };
        expect(A.calculs(m).manquants).toEqual(['un nom différent pour chaque niveau']);
        m.niveaux[1].titre = { valeur: '_secret', etat: 'saisi' };
        expect(A.calculs(m).manquants).toEqual(['un nom de niveau qui ne commence pas par « _ »']);
    });

    it('C.d Grilles de critères les montre avec le nom de leur niveau, dans l’ordre (`rendreAttenduCritere`)', () => {
        const g = A.construire(f5Complete(), ctx()).grille;
        const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
        const store = { 'a2032_echellesTemplates': [] };
        const dbG = { getSync: (k, d) => (k in store ? store[k] : d), get: async (k) => store[k], modifier: async () => {}, set: async () => {} };
        const win = chargerScript('js/bareme.js');
        chargerScript('js/grilles.js', {
            db: dbG, cle: (k) => 'a2032_' + k, document: dom.window.document, echapperHtml: vraiEchapperHtml(dom.window.document),
            notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
        }, win);
        const div = dom.window.document.createElement('div');
        div.innerHTML = win.rendreAttenduCritere(g.criteres[0], { grilleId: g.id, index: 0 });
        // #1120, lot 1 (20 oct.) : le critère analytique montre son BARÈME — le nom du niveau devient le nom de
        // la tranche, sans points (« à compléter ») ; le texte, intact.
        const tranches = [...div.querySelectorAll('.grille-bareme-tranche')];
        expect(tranches.map(t => t.querySelector('[data-champ="nom"]').value)).toEqual(['PALIER A', 'PALIER A+', 'PALIER B', 'PALIER C']);
        expect(tranches.map(t => t.querySelector('[data-champ="points"]').value)).toEqual(['', '', '', '']);
        expect(tranches.map(t => t.querySelector('.grille-bareme-marque').textContent)).toEqual(Array(4).fill('à compléter'));
        expect(tranches[0].querySelector('textarea').value).toBe('Jamais\n0-5');
    });

    it('C.e rien ne se perd au partage : projetés tels quels, paquet valide ; l’import les garde', () => {
        const g = A.construire(f5Complete(), ctx()).grille;
        g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        const projete = wp.partageFormat.projeterEntite(g, 'grille');
        expect(projete.criteres.map(c => c.descripteurs)).toEqual(g.criteres.map(c => c.descripteurs));
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        expect(wp.partageValidation.validerPackage(paquet).erreurs).toEqual([]);
        // Un `echelleId: null` y serait refusé : c'est pourquoi la grille en points n'en porte pas.
        const avecNull = JSON.parse(JSON.stringify(g));
        avecNull.criteres[0].descripteurs.echelleId = null;
        expect(wp.partageValidation.validerPackage(wp.partageFormat.construirePackage(avecNull, { type: 'grille', identiteAuteur: 'Auteur fictif' })).valide).toBe(false);
        const wie = chargerScript('js/import-export.js');
        expect(wie.assainirObjet(g, wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs).toEqual(g.criteres[0].descripteurs);
    });
});

/* ======================================================= U — « ALLER PLUS LOIN » */

describe('étape 5b · U — la confirmation', () => {
    it('U.f « Aller plus loin » : une grille en points qui décrit ses niveaux a la phrase commune seule ; sans descripteurs, son paragraphe', () => {
        const para = (r) => {
            const div = fenetreDom.document.createElement('div');
            div.innerHTML = materiel.confirmationHtml(r);
            return [...div.querySelectorAll('.materiel-plus-loin p')].length;
        };
        const base = { nom: 'G', nbC: 3, enPoints: true, totalPoints: 20, retro: false, ids: {}, niveaux: [] };
        expect(para(Object.assign({}, base, { descr: true }))).toBe(1);
        expect(para(Object.assign({}, base, { descr: false }))).toBe(2);
    });

});

/* ======================================================= 8.16 — LA CASSE D'UNE PARTIE */

describe('étape 7 · 8.16 — une partie en capitales prend une majuscule initiale dans le nom fabriqué', () => {
    // Règle validée par Grégoire le 17 oct. 2026 (15 h 00) : le nom s'imprime sur le PDF des
    // étudiant·es. Lettre seule et chiffre romain gardent leur capitale (sa décision, même jour).
    it('P.c lettre seule, chiffre romain, lettre élidée, mots composés', () => {
        const c = L.casseDePartie;
        expect(['PARTIE A', 'PARTIE II', 'PARTIE XIV', 'ANALYSE DE L’ŒUVRE', 'MISE EN CONTEXTE', 'À PROPOS', 'PARTIE 1', 'Introduction', ''].map(c))
            .toEqual(['Partie A', 'Partie II', 'Partie XIV', 'Analyse de l’œuvre', 'Mise en contexte', 'À propos', 'Partie 1', 'Introduction', '']);
    });
});
