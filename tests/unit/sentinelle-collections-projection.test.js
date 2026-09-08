// SENTINELLE — LES COLLECTIONS DE PARAMÈTRES DE PROJECTION (lot B du 5 septembre 2026, volet 1)
// Carte : `plans de travail/CARTE-2026-09-05-collections.md` (relue par Cowork, rien à corriger).
// Décision de Grégoire (4 sept.) : LA COPIE — choisir une collection verse ses valeurs dans le
// critère ; corriger ou supprimer la collection ensuite ne change ni la grille ni ce qu'un élève
// a lu. Le module réel (`js/collections-projection.js`) tourne ici sur une base FACTICE.
//
//   A. PUR — ce qu'une collection porte (modèle, quatre paramètres, paliers copiés), le nom pris,
//      et la COPIE dans un critère (égale, jamais identique : `!==` ; le calcul rend la même phrase) ;
//   B. STOCKAGE — enregistrer, lister (copies, par nom), nom pris refusé sans rien écrire, appliquer,
//      supprimer sans toucher le critère ; une seule clé, sous `cle()`, jamais nue ;
//   C. REGISTRES — la clé inscrite à CLES_NAMESPACEES, le script chargé au bon rang avec son jeton,
//      la clé documentée, le registre de projection intouché.
//
// BREAK-TESTS (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · `appliquerCollection` partage les paliers de la collection avec le critère → A.d rougit ;
//   · `nomPris` sensible à la casse → A.c et B.b rougissent ;
//   · `lister` rend le stock lui-même (sans copie) → B.a rougit.

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
const P = require(path.join(racine, 'js/evaluation-projection.js'));
const clone = (v) => JSON.parse(JSON.stringify(v));

const CLE = 'a2026_collectionsProjection';

/** Le module réel sur une base factice qui note ce qu'on lit et ce qu'on écrit. */
function monter(collections, opts) {
    const store = {};
    if (collections) store[CLE] = clone(collections);
    const lus = [];
    const ecrits = [];
    const db = {
        // ⚠ Le stock est rendu TEL QUEL (pas une copie) : c'est le module qui doit copier, et
        // c'est ce que B.a éprouve — un faux `db` qui clonerait rendrait ce cas tautologique.
        getSync: (k, d) => { lus.push(k); return (k in store) ? store[k] : d; },
        get: async (k, d) => { lus.push(k); return (k in store) ? store[k] : d; },
        setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        set: async (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            lus.push(k);
            const resultat = await mutateur((k in store) ? clone(store[k]) : defaut);
            if (resultat === undefined) return undefined;
            ecrits.push(k);
            store[k] = resultat;
            return resultat;
        }
    };
    const globaux = { db };
    if (!(opts && opts.sansCle)) globaux.cle = (k) => 'a2026_' + k;
    const win = chargerScript('js/collections-projection.js', globaux);
    win.projectionAlgo = P;
    return { C: win.collectionsProjection, store, lus, ecrits };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +', motsReference: 900, erreursTolerees: 30 } };
/** Un critère aux paliers ÉCRITS (composés), pour voir que la collection prend ceux-là. */
const ECRIT = { ...ALGO, paramsProjection: { nomServiceAide: 'Le CAF', motsReference: 600, erreursTolerees: 20, lienServiceAide: 'https://caf' },
                paliersProjection: P.paliersMigration().map((p) => (p.cle === 'risque' ? { ...p, texte: 'Palier {palier} : {projection} erreurs.', texteAide: 'Va voir {service}.' } : p)) };

/* ============================================================ A — PUR */

describe('collections · A — pur : ce qu\'une collection porte, et la copie dans un critère', () => {
    it('A.a `depuisCritere` : un id `coll_…`, le nom épuré, le modèle, les CINQ paramètres et les paliers de `normaliser`, copiés', () => {
        const { C } = monter();
        const c = C.depuisCritere(ECRIT, '  EUF  ');
        expect(c.id).toMatch(/^coll_[a-z0-9]+_[a-z0-9]{6}$/);
        expect(c.nom).toBe('EUF');
        expect(c.modeleId).toBe('norme_externe');
        expect(typeof c.dateCreation).toBe('string');
        const n = P.normaliser(ECRIT);
        expect(c.params).toEqual(n.params);
        // #790 (8 sept. 2026) : `libelleSignalement` s'ajoute aux quatre — le libellé du signalement
        // est un paramètre du gabarit, jamais une chaîne écrite dans le code.
        expect(Object.keys(c.params).sort()).toEqual(['erreursTolerees', 'libelleSignalement', 'lienServiceAide', 'motsReference', 'nomServiceAide']);
        expect(c.params.nomServiceAide).toBe('Le CAF');
        expect(c.paliers).toEqual(n.paliers);
        expect(c.paliers).not.toBe(n.paliers);
        c.paliers.forEach((p, i) => expect(p).not.toBe(n.paliers[i]));
        expect(c.paliers.find((p) => p.cle === 'risque').texte).toBe('Palier {palier} : {projection} erreurs.');
        // Deux appels : deux ids.
        expect(C.depuisCritere(ECRIT, 'EUF').id).not.toBe(c.id);
    });

    it('A.b rien à nommer : nom vide → null ; « Aucune projection » → null ; un critère migré (sans champ) porte les paliers du modèle', () => {
        const { C } = monter();
        expect(C.depuisCritere(ALGO, '   ')).toBeNull();
        expect(C.depuisCritere(ALGO, undefined)).toBeNull();
        expect(C.depuisCritere({ ...ALGO, modeleProjection: 'aucune', paramsProjection: {} }, 'EUF')).toBeNull();
        const migre = C.depuisCritere({ id: 'X', type: 'algorithmique' }, 'Migré');
        expect(migre.paliers.map((p) => p.cle)).toEqual(['sans_erreur', 'excellent', 'tres_bien', 'bien', 'risque', 'echec']);
        expect(migre.params.motsReference).toBe(900);
    });

    it('A.c `nomPris` : après trim et sans casse', () => {
        const { C } = monter();
        const liste = [{ id: 'a', nom: 'EUF' }, { id: 'b', nom: 'Philo 101' }];
        expect(C.nomPris(liste, 'euf')).toBe(true);
        expect(C.nomPris(liste, '  EUF ')).toBe(true);
        expect(C.nomPris(liste, 'PHILO 101')).toBe(true);
        expect(C.nomPris(liste, 'EUF 2')).toBe(false);
        expect(C.nomPris([], 'EUF')).toBe(false);
        expect(C.nomPris(null, 'EUF')).toBe(false);
    });

    it('A.d `appliquerCollection` COPIE : le critère reçoit le modèle, les paramètres et les paliers — égaux, jamais identiques ; la collection mutée ensuite ne le suit pas', () => {
        const { C } = monter();
        const c = C.depuisCritere(ECRIT, 'EUF');
        const critere = { id: 'NEUF', nom: 'Langue', type: 'algorithmique', ponderation: 30, modeleProjection: 'aucune', paramsProjection: {} };
        const rendu = C.appliquerCollection(critere, c);
        expect(rendu).toBe(critere);
        expect(critere.modeleProjection).toBe('norme_externe');
        expect(critere.paramsProjection).toEqual(c.params);
        expect(critere.paramsProjection).not.toBe(c.params);
        expect(critere.paliersProjection).toEqual(c.paliers);
        expect(critere.paliersProjection).not.toBe(c.paliers);
        critere.paliersProjection.forEach((p, i) => expect(p, 'palier ' + i).not.toBe(c.paliers[i]));
        // La collection change : le critère, non.
        c.paliers[4].texte = 'Changé après coup.';
        c.params.nomServiceAide = 'Autre service';
        expect(critere.paliersProjection[4].texte).toBe('Palier {palier} : {projection} erreurs.');
        expect(critere.paramsProjection.nomServiceAide).toBe('Le CAF');
        // Et il calcule EXACTEMENT ce que l'original calcule.
        expect(P.calculer(critere, { erreurs: 15, mots: 600 }).texte).toBe(P.calculer(ECRIT, { erreurs: 15, mots: 600 }).texte);
        expect(P.calculer(critere, { erreurs: 15, mots: 600 }).texte).toBe('Palier Risqué : 15 erreurs. Va voir Le CAF.');
        expect(C.appliquerCollection(null, c)).toBeNull();
        expect(C.appliquerCollection(critere, null)).toBeNull();
    });
});

/* ============================================================ B — STOCKAGE */

describe('collections · B — stockage : une clé, sous cle(), et rien d\'autre', () => {
    it('B.a `enregistrer` écrit UNE collection sous `a2026_collectionsProjection` ; `lister` la rend, par nom, en copies', async () => {
        const { C, store, ecrits, lus } = monter();
        const r = await C.enregistrer('EUF', ECRIT);
        expect(r.ok).toBe(true);
        expect(r.collection.nom).toBe('EUF');
        expect(ecrits).toEqual([CLE]);
        expect(store[CLE].length).toBe(1);
        expect(store[CLE][0]).toEqual(r.collection);
        await C.enregistrer('Philo 101', ALGO);
        await C.enregistrer('après', ALGO);
        const liste = C.lister();
        expect(liste.map((c) => c.nom)).toEqual(['après', 'EUF', 'Philo 101']);
        // Des COPIES : muter ce qui est rendu ne touche pas le stock.
        liste[1].nom = 'Cassé';
        liste[1].paliers[0].texte = 'Cassé';
        expect(store[CLE].find((c) => c.nom === 'EUF').paliers[0].texte).not.toBe('Cassé');
        expect(C.lister().map((c) => c.nom)).toEqual(['après', 'EUF', 'Philo 101']);
        expect(C.obtenir(r.collection.id).nom).toBe('EUF');
        expect(C.obtenir('coll_inconnu')).toBeNull();
        // Tout ce qui a été lu ou écrit : cette clé, et rien d'autre.
        expect(new Set(lus)).toEqual(new Set([CLE]));
        expect(new Set(ecrits)).toEqual(new Set([CLE]));
    });

    it('B.b un nom pris (trim, sans casse) est REFUSÉ, et rien n\'est écrit ; un nom vide ou un modèle sans paliers aussi', async () => {
        const { C, store, ecrits } = monter([{ id: 'coll_x', nom: 'EUF', modeleId: 'norme_externe', params: {}, paliers: [] }]);
        const avant = JSON.stringify(store[CLE]);
        expect(await C.enregistrer(' euf ', ECRIT)).toEqual({ ok: false, raison: 'nom_pris' });
        expect(await C.enregistrer('', ECRIT)).toEqual({ ok: false, raison: 'nom_vide' });
        expect(await C.enregistrer('Sans', { ...ALGO, modeleProjection: 'aucune' })).toEqual({ ok: false, raison: 'sans_paliers' });
        expect(JSON.stringify(store[CLE])).toBe(avant);
        expect(ecrits).toEqual([]);
    });

    it('B.c `appliquer(critere, id)` copie la collection du stock ; un id inconnu ne touche pas le critère', async () => {
        const { C } = monter();
        const r = await C.enregistrer('EUF', ECRIT);
        const critere = { id: 'NEUF', type: 'algorithmique', modeleProjection: 'aucune', paramsProjection: {} };
        const avant = JSON.stringify(critere);
        expect(C.appliquer(critere, 'coll_inconnu')).toBe(false);
        expect(JSON.stringify(critere)).toBe(avant);
        expect(C.appliquer(critere, r.collection.id)).toBe(true);
        expect(critere.modeleProjection).toBe('norme_externe');
        expect(critere.paramsProjection.nomServiceAide).toBe('Le CAF');
        expect(critere.paliersProjection.map((p) => p.cle)).toEqual(['sans_erreur', 'excellent', 'tres_bien', 'bien', 'risque', 'echec']);
    });

    it('B.d `supprimer` retire la collection ; le critère qui l\'avait copiée ne change pas ; un id inconnu n\'écrit rien', async () => {
        const { C, store, ecrits } = monter();
        const r = await C.enregistrer('EUF', ECRIT);
        const critere = { id: 'NEUF', type: 'algorithmique' };
        C.appliquer(critere, r.collection.id);
        const copie = JSON.stringify(critere);
        expect(await C.supprimer(r.collection.id)).toBe(true);
        expect(C.lister()).toEqual([]);
        expect(JSON.stringify(critere)).toBe(copie);
        expect(P.calculer(critere, { erreurs: 15, mots: 600 }).texte).toBe('Palier Risqué : 15 erreurs. Va voir Le CAF.');
        const nbEcrits = ecrits.length;
        expect(await C.supprimer('coll_inconnu')).toBe(false);
        expect(ecrits.length).toBe(nbEcrits);
        expect(store[CLE]).toEqual([]);
    });

    it('B.e sans `cle()`, le module REFUSE d\'écrire ou de lire : jamais une clé nue (#464)', async () => {
        const { C, store, ecrits } = monter(null, { sansCle: true });
        expect(() => C.lister()).toThrow(/cle\(\)/);
        await expect(C.enregistrer('EUF', ECRIT)).rejects.toThrow(/cle\(\)/);
        expect(ecrits).toEqual([]);
        expect(Object.keys(store)).toEqual([]);
    });

    it('B.f un stock abîmé se lit sans casser : ce qui n\'est pas une collection est ignoré', () => {
        const { C } = monter([null, 'x', { nom: 'sans id' }, { id: 'coll_ok', nom: 'OK', modeleId: 'norme_externe', params: {}, paliers: [] }]);
        expect(C.lister().map((c) => c.id)).toEqual(['coll_ok']);
    });
});

/* ============================================================ C — LES REGISTRES */

describe('collections · C — la clé inscrite, le script chargé, la clé documentée, le registre de projection intouché', () => {
    it('C.a `collectionsProjection` est dans CLES_NAMESPACEES (trimestres.js), pas dans CLES_TEMPLATES_ARCHIVES ni CLES_GLOBALES', () => {
        const t = source('js/trimestres.js');
        const namespacees = t.slice(t.indexOf('const CLES_NAMESPACEES = ['), t.indexOf('];', t.indexOf('const CLES_NAMESPACEES = [')));
        expect(namespacees).toContain("'collectionsProjection'");
        const archives = t.slice(t.indexOf('const CLES_TEMPLATES_ARCHIVES = ['), t.indexOf('];', t.indexOf('const CLES_TEMPLATES_ARCHIVES = [')));
        expect(archives).not.toContain('collectionsProjection');
        const globales = t.slice(t.indexOf('const CLES_GLOBALES = ['), t.indexOf('];', t.indexOf('const CLES_GLOBALES = [')));
        expect(globales).not.toContain('collectionsProjection');
    });

    it('C.b index.html charge le module après le registre de projection et avant grilles.js, avec un jeton ; trimestres.js a bougé', () => {
        const html = source('index.html');
        const projection = html.indexOf('js/evaluation-projection.js?v=');
        const collections = html.indexOf('js/collections-projection.js?v=');
        const grilles = html.indexOf('js/grilles.js?v=');
        expect(projection).toBeGreaterThan(-1);
        expect(collections).toBeGreaterThan(projection);
        expect(grilles).toBeGreaterThan(collections);
        expect(html).toMatch(/js\/collections-projection\.js\?v=2026090[5-9]|js\/collections-projection\.js\?v=20261/);
        expect(html).toMatch(/js\/trimestres\.js\?v=2026090[5-9]|js\/trimestres\.js\?v=20261/);
    });

    it('C.c la clé est documentée avec son propriétaire (docs/DATA-OWNERSHIP.md)', () => {
        const doc = source('docs/DATA-OWNERSHIP.md');
        expect(doc).toMatch(/\| `collectionsProjection` \| NS[^\n]*`collections-projection\.js`/);
    });

    it('C.d le module ne lit que sa clé et ne touche pas au document ; le registre de projection ignore les collections et la base', () => {
        const m = source('js/collections-projection.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(m).not.toMatch(/\bdocument\./);
        expect(m).not.toMatch(/localStorage/);
        expect((m.match(/cle\(CLE\)/g) || []).length).toBe(1);
        expect(m).not.toMatch(/db\.setSync|db\.set\(/);
        const r = source('js/evaluation-projection.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(r).not.toMatch(/collection/i);
        expect(r).not.toMatch(/\bdb\./);
    });
});
