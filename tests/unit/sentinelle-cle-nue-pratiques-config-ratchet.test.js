import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

// Cliquet global `pratiquesConfigurables` — Brique D namespacing (26 juin 2026).
//
// Généralise le ratchet local de #341 (sentinelle-pratique-config-namespacee-341,
// limité au seul pratiques-bibliotheque.js) à TOUT js/, sur le modèle de la
// sentinelle L3 `modalitesEvaluation` (sentinelle-ssot-modalites-purge-L3).
//
// RÉGIME DE LA CLÉ (≠ grilles/échelles, cf. sentinelle-cle-modeles-trimestre-briqueA) :
// `pratiquesConfigurables` ∈ CLES_NAMESPACEES → `cle('pratiquesConfigurables')` rend
// TOUJOURS la clé namespacée. La clé NUE n'apparaît donc légitimement qu'en FALLBACK
// de migration : `db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', [])`.
// On ne peut donc PAS interdire toute mention de la clé nue (ce serait ~55 faux positifs) :
// on interdit la lecture nue SÈCHE — celle qui ignore le namespacing, exactement le
// bug #341 (« Appliquer une pratique » lisait la globale au lieu de h2026_…).
//
// SEUL lecteur nu-sec autorisé : la migration namespacing bornée de main.js (le pont
// pour données pré-namespacing, flag migration_pratiques_namespacees_done).
//
// RATCHET : cette liste ne doit que RÉTRÉCIR. Ne JAMAIS y ajouter un fichier sans
// décision explicite de Grégoire.

const LECTEURS_NUE_SECHE_AUTORISES = new Set([
    'js/main.js'  // migration_pratiques_namespacees_done — bornée, documentée
]);

// Lecture directe de la clé nue (PAS db.getSync(cle('pratiquesConfigurables'), …),
// car là le 1er argument est `cle(` et non la chaîne). Couvre les trois formes de
// guillemets — simple/double/backtick — pour qu'on ne puisse pas contourner le
// cliquet en changeant de quote (faux négatif révélé au break-test du 26 juin).
const MOTIF_LECTURE_NUE = /db\.get(?:Sync)?\s*\(\s*['"`]pratiquesConfigurables['"`]/;

// Une lecture nue est TOLÉRÉE (fallback de migration, pas un court-circuit du
// namespacing) si la ligne résout d'abord via cle(), OU si la lecture nue est en
// position de repli (précédée d'un « || », éventuellement « await »/« window. »).
function estFallbackTolere(ligne) {
    if (/cle\(\s*['"`]pratiquesConfigurables['"`]\s*\)/.test(ligne)) return true;
    if (/\|\|\s*(?:await\s+)?(?:window\.)?db\.get(?:Sync)?\s*\(\s*['"`]pratiquesConfigurables['"`]/.test(ligne)) return true;
    return false;
}

function listerFichiersJs(dossier) {
    const resultats = [];
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, entree.name);
        if (entree.isDirectory()) resultats.push(...listerFichiersJs(chemin));
        else if (entree.name.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

// fichier relatif → [numéros de ligne en lecture nue SÈCHE]
function scannerNueSeche() {
    const touches = new Map();
    for (const fichier of listerFichiersJs(dossierJs)) {
        const relatif = path.relative(racineProjet, fichier).split(path.sep).join('/');
        fs.readFileSync(fichier, 'utf8').split('\n').forEach((ligne, i) => {
            if (MOTIF_LECTURE_NUE.test(ligne) && !estFallbackTolere(ligne)) {
                if (!touches.has(relatif)) touches.set(relatif, []);
                touches.get(relatif).push(i + 1);
            }
        });
    }
    return touches;
}

describe('Cliquet global · lecture nue de pratiquesConfigurables', () => {

    it('aucune lecture nue SÈCHE hors la migration bornée de main.js', () => {
        const lecteurs = scannerNueSeche();
        const intrus = [...lecteurs.entries()]
            .filter(([fichier]) => !LECTEURS_NUE_SECHE_AUTORISES.has(fichier))
            .map(([fichier, lignes]) => `${fichier}:${lignes.join(',')}`);
        expect(
            intrus,
            `Lecture nue SÈCHE de 'pratiquesConfigurables' (court-circuit du namespacing, bug #341) : ` +
            `${intrus.join(' ; ')}. Lire via db.getSync(cle('pratiquesConfigurables'), null) ` +
            `|| db.getSync('pratiquesConfigurables', []).`
        ).toEqual([]);
    });

    it('main.js garde exactement UNE lecture nue sèche (le pont de migration, pas plus)', () => {
        const lecteurs = scannerNueSeche();
        expect(lecteurs.get('js/main.js') || []).toHaveLength(1);
    });

    // Break-test « positif » du critère : il doit ATTRAPER le bug #341 et TOLÉRER
    // les vrais fallbacks. Prouve que le scan ci-dessus n'est pas vacuant (AP-2).
    describe('le critère discrimine nu-sec vs fallback', () => {
        it('attrape la lecture nue sèche (forme exacte du bug #341)', () => {
            const ligne = "    const configurables = await db.get('pratiquesConfigurables') || [];";
            expect(MOTIF_LECTURE_NUE.test(ligne) && !estFallbackTolere(ligne)).toBe(true);
        });
        it('attrape une affectation nue sèche (getSync)', () => {
            const ligne = "    const p = db.getSync('pratiquesConfigurables', []);";
            expect(MOTIF_LECTURE_NUE.test(ligne) && !estFallbackTolere(ligne)).toBe(true);
        });
        it('attrape la lecture nue sèche même en guillemets doubles (contournement de quote)', () => {
            const ligne = '    const p = db.getSync("pratiquesConfigurables", []);';
            expect(MOTIF_LECTURE_NUE.test(ligne) && !estFallbackTolere(ligne)).toBe(true);
        });
        it('tolère le pattern dominant cle() + fallback sur la même ligne', () => {
            const ligne = "    const p = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);";
            expect(estFallbackTolere(ligne)).toBe(true);
        });
        it('tolère le repli via variable résolue avant (cas comparateur)', () => {
            const ligne = "        return ns || db.getSync('pratiquesConfigurables', []) || [];";
            expect(estFallbackTolere(ligne)).toBe(true);
        });
        it('tolère le repli async (await) de pratiques-bibliotheque', () => {
            const ligne = "    const c = await db.get(cle('pratiquesConfigurables')) || await db.get('pratiquesConfigurables') || [];";
            expect(estFallbackTolere(ligne)).toBe(true);
        });
    });

    it('ne confond pas la clé globale légitime bibliothequePratiques', () => {
        // bibliothequePratiques est un catalogue GLOBAL partagé voulu (pratiques-bibliotheque.js)
        // — il ne doit jamais être attrapé par le motif de pratiquesConfigurables.
        expect(MOTIF_LECTURE_NUE.test("db.getSync('bibliothequePratiques', [])")).toBe(false);
    });

});
