import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// SENTINELLE #556 — « VIDER LA CORBEILLE » DÉTRUIT EXACTEMENT CE QU'ELLE ANNONCE.
//
// LE DÉFAUT. La modale compte `obtenirCorbeille()` — la corbeille FILTRÉE par
// groupe-cours actif. `viderCorbeille()` itérait `obtenirCorbeilleComplete()` et
// terminait par `sauvegarderCorbeille([])` : blobs, vignettes et métadonnées de
// TOUS les groupes-cours du trimestre partaient. L'utilisateur voyait « 2 fichiers »
// et en perdait cinq, définitivement, sans que rien ne le dise.
//
// ⮕ CE QUI EST ÉPROUVÉ ICI, ET QUE NUL AUTRE BANC NE COUVRAIT (il n'existait
//   aucun test sur `viderCorbeille`) :
//   1. le comptage n'est plus une opinion : ce qui est détruit est ce qui a été
//      passé, et un fichier d'un autre groupe-cours SURVIT ;
//   2. l'omission ne détruit plus rien — l'ancienne signature `viderCorbeille()`
//      était le défaut lui-même, elle est désormais refusée et le dit ;
//   3. le retour est MESURÉ sur la corbeille, pas déduit de la longueur reçue ;
//   4. un fichier mis en corbeille PENDANT les suppressions de blobs survit à la
//      réécriture des métadonnées (relecture après les `await`) ;
//   5. l'appelant passe la liste CAPTURÉE à l'affichage — pas une relecture au
//      clic, qui pourrait rendre un autre ensemble si le groupe-cours a changé
//      entre l'ouverture de la modale et la confirmation.

const CLE_CORBEILLE = 'test_corbeilleFichiers';

/**
 * Monte `travaux-stockage.js` sur un stockage en mémoire.
 * `journal` recueille ce qui a été réellement détruit, côté blobs et vignettes :
 * on regarde ce qui SORT, pas ce que le code a l'air de faire.
 */
function monter(corbeilleInitiale, options = {}) {
    const magasin = { [CLE_CORBEILLE]: JSON.parse(JSON.stringify(corbeilleInitiale)) };
    const journal = { blobsSupprimes: [], vignettesSupprimees: [] };

    const db = {
        getSync: (k, d) => (k in magasin ? magasin[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { magasin[k] = v; },
        get: async () => null,
        set: async () => {},
        remove: async (k) => { journal.vignettesSupprimees.push(k); },
        deleteBlob: async (id) => {
            journal.blobsSupprimes.push(id);
            if (typeof options.pendantSuppressionBlob === 'function') {
                options.pendantSuppressionBlob(magasin);
            }
        },
        listBlobsByStudent: async () => []
    };

    const w = chargerScript('js/travaux-stockage.js', {
        db,
        cle: (k) => 'test_' + k,
        Image: function () {},
        document: { createElement: () => ({ getContext: () => null }) },
        navigator: { storage: null }
    });

    return { travauxStockage: w.travauxStockage, magasin, journal };
}

const F = (id, gc) => ({ id, groupeCoursId: gc, etudiantDA: 'DA_' + id, productionId: 'P1', dateSuppression: new Date().toISOString() });

// Deux groupes-cours dans la MÊME corbeille de trimestre : c'est la situation
// réelle de Grégoire, qui enseigne plusieurs groupes du même cours.
const CORBEILLE_DEUX_GROUPES = [
    F('FT_a1', 'GC_601-101-01'),
    F('FT_a2', 'GC_601-101-01'),
    F('FT_b1', 'GC_601-102-02'),
    F('FT_b2', 'GC_601-102-02'),
    F('FT_b3', 'GC_601-102-02')
];

describe('#556 · « Vider la corbeille » détruit exactement l\'ensemble annoncé', () => {

    // ── 1. CE QUI EST DÉTRUIT EST CE QUI A ÉTÉ PASSÉ ────────────────────────

    it('les fichiers des AUTRES groupes-cours survivent — blobs, vignettes et métadonnées', async () => {
        const { travauxStockage, magasin, journal } = monter(CORBEILLE_DEUX_GROUPES);

        // Exactement ce que la modale annonce : la corbeille du groupe actif.
        const annonces = CORBEILLE_DEUX_GROUPES.filter(f => f.groupeCoursId === 'GC_601-101-01');
        expect(annonces).toHaveLength(2);

        await travauxStockage.viderCorbeille(annonces);

        // Les métadonnées : seuls les deux annoncés ont disparu.
        expect(magasin[CLE_CORBEILLE].map(f => f.id)).toEqual(['FT_b1', 'FT_b2', 'FT_b3']);

        // Les blobs : le geste irréversible n'a porté que sur les deux annoncés.
        expect(journal.blobsSupprimes.sort()).toEqual(['FT_a1', 'FT_a2']);

        // Les vignettes suivent le même ensemble.
        expect(journal.vignettesSupprimees.sort()).toEqual(['thumbnail_FT_a1', 'thumbnail_FT_a2']);
    });

    it('détruire toute la corbeille du trimestre reste possible — mais il faut le DEMANDER', async () => {
        const { travauxStockage, magasin } = monter(CORBEILLE_DEUX_GROUPES);

        await travauxStockage.viderCorbeille(CORBEILLE_DEUX_GROUPES);

        expect(magasin[CLE_CORBEILLE]).toEqual([]);
    });

    // ── 2. L'OMISSION NE DÉTRUIT PLUS RIEN ──────────────────────────────────

    it('appelée SANS liste, elle ne détruit rien et le dit', async () => {
        const avertissements = [];
        const avant = console.warn;
        console.warn = (...a) => avertissements.push(a.join(' '));
        try {
            const { travauxStockage, magasin, journal } = monter(CORBEILLE_DEUX_GROUPES);

            const n = await travauxStockage.viderCorbeille();

            expect(n).toBe(0);
            expect(magasin[CLE_CORBEILLE]).toHaveLength(5);
            expect(journal.blobsSupprimes).toEqual([]);
            expect(avertissements.join(' ')).toMatch(/#556/);
        } finally {
            console.warn = avant;
        }
    });

    it('un argument qui n\'est pas une liste est refusé, pas interprété', async () => {
        for (const mauvais of [null, 'FT_a1', 42, { id: 'FT_a1' }]) {
            const { travauxStockage, magasin } = monter(CORBEILLE_DEUX_GROUPES);
            const avant = console.warn; console.warn = () => {};
            try {
                expect(await travauxStockage.viderCorbeille(mauvais)).toBe(0);
            } finally { console.warn = avant; }
            expect(magasin[CLE_CORBEILLE]).toHaveLength(5);
        }
    });

    // ── 3. LE RETOUR EST MESURÉ, PAS DÉDUIT ─────────────────────────────────

    it('rend le nombre RÉELLEMENT retiré de la corbeille, pas la longueur reçue', async () => {
        const { travauxStockage } = monter(CORBEILLE_DEUX_GROUPES);

        // Une liste qui contient un fantôme (fichier déjà purgé ailleurs) et un
        // doublon : `fichiers.length` vaudrait 4, la corbeille n'en perd que 2.
        const n = await travauxStockage.viderCorbeille([
            F('FT_a1', 'GC_601-101-01'),
            F('FT_a1', 'GC_601-101-01'),
            F('FT_a2', 'GC_601-101-01'),
            F('FT_fantome', 'GC_601-101-01')
        ]);

        expect(n).toBe(2);
    });

    // ── 4. LA COURSE PENDANT LES `await` ────────────────────────────────────

    it('un fichier mis en corbeille PENDANT la suppression des blobs survit', async () => {
        // Le scénario : la suppression des blobs est asynchrone. Si les
        // métadonnées étaient lues AVANT les `await` et réécrites après, tout
        // ce qui arrive entre les deux serait effacé sans avoir été touché.
        let dejaFait = false;
        const { travauxStockage, magasin } = monter(CORBEILLE_DEUX_GROUPES, {
            pendantSuppressionBlob: (m) => {
                if (dejaFait) return;
                dejaFait = true;
                m[CLE_CORBEILLE] = m[CLE_CORBEILLE].concat([F('FT_pendant', 'GC_601-101-01')]);
            }
        });

        const annonces = CORBEILLE_DEUX_GROUPES.filter(f => f.groupeCoursId === 'GC_601-101-01');
        await travauxStockage.viderCorbeille(annonces);

        expect(magasin[CLE_CORBEILLE].map(f => f.id)).toContain('FT_pendant');
    });

    // ── 5. L'APPELANT PASSE L'ENSEMBLE ANNONCÉ ──────────────────────────────

    it('la modale et la destruction lisent la MÊME liste — capturée à l\'affichage', () => {
        const source = fs.readFileSync(path.join(racine, 'js', 'liste-evaluations.js'), 'utf8');

        // Retirer les commentaires AVANT d'asserter : les commentaires de ce
        // correctif nomment eux-mêmes `obtenirCorbeille()` et `viderCorbeille()`.
        const code = source
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^[ \t]*\/\/.*$/gm, '');

        const debut = code.indexOf('function viderTouteCorbeille');
        expect(debut).toBeGreaterThan(-1);
        const corps = code.slice(debut, debut + 4000);

        // L'appel de destruction reçoit un argument — jamais `viderCorbeille()` nu.
        expect(corps).not.toMatch(/viderCorbeille\(\s*\)/);

        // Et l'ensemble n'est lu qu'UNE fois : une seconde lecture au clic
        // pourrait rendre autre chose que ce que la modale a compté.
        const lectures = corps.match(/obtenirCorbeille\w*\(\)/g) || [];
        expect(lectures).toHaveLength(1);

        // ⮕ L'ASSERTION QUI DISTINGUE VRAIMENT, et sans laquelle les deux
        // précédentes restent vertes sur un appelant redevenu faux : c'est la
        // variable DONT LE NOMBRE EST ÉCRIT DANS LA MODALE qui doit voyager
        // jusqu'à la destruction. « viderCorbeille reçoit un argument » ne dit
        // rien tant qu'on ne dit pas LEQUEL.
        const annoncee = corps.match(/<strong>\$\{\s*([A-Za-z_$][\w$]*)\.length\s*\}<\/strong>/);
        expect(annoncee, 'le nombre annoncé dans la modale doit venir d\'une variable').not.toBeNull();

        const detruite = corps.match(/viderCorbeille\(\s*([A-Za-z_$][\w$]*)\s*\)/);
        expect(detruite, 'viderCorbeille doit recevoir une variable, pas un appel').not.toBeNull();

        // Suivre l'éventuel alias : `var fichiersCorbeille = corbeille;`
        let origine = detruite[1];
        const alias = corps.match(new RegExp('(?:var|let|const)\\s+' + origine + '\\s*=\\s*([A-Za-z_$][\\w$]*)\\s*;'));
        if (alias) origine = alias[1];

        expect(origine).toBe(annoncee[1]);
    });
});
