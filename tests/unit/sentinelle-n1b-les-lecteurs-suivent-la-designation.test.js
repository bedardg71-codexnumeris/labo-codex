/**
 * SENTINELLE — LOT N1b (21 septembre 2026) : LES LECTEURS D'ÉCRAN SUIVENT LA DÉSIGNATION UNIQUE
 *
 * Décision de Grégoire (21 sept. 2026, 14 h 31) : sans pratique assignée, aucune note. Pas de repli.
 * N1a a posé la résolution unique (`designerPratiqueActive` / `resoudrePratiqueActive`) et l'a fait
 * lire par tout ce qui ÉCRIT une note. N1b y amène les LECTEURS : plus aucun module ne lit le pointeur
 * du groupe-cours lui-même, plus aucun ne se replie sur « sommative » ni sur PRATIQUE_DEFAUT.
 *
 * Ce fichier est le VERROU STRUCTUREL du lot (le comportement, lui, est éprouvé sur le vrai moteur
 * par le volet I de `audit-onglet-suivi-2026-09-05` et par `sentinelle-ssot-pratique-type-L2b1`).
 * Il balaie TOUT le dossier js, pas une liste de sites : un lecteur ajouté demain est vu.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOSSIER_JS = path.join(RACINE, 'js');

function fichiersJs(dossier) {
    return fs.readdirSync(dossier, { withFileTypes: true }).flatMap(e => {
        const chemin = path.join(dossier, e.name);
        if (e.isDirectory()) return fichiersJs(chemin);
        return e.name.endsWith('.js') ? [chemin] : [];
    });
}

/** Les lignes de CODE d'un fichier (commentaires de ligne et de bloc JSDoc écartés), avec leur numéro. */
function lignesDeCode(chemin) {
    return fs.readFileSync(chemin, 'utf8').split('\n')
        .map((texte, i) => ({ n: i + 1, texte: texte.replace(/\/\/.*$/, '').replace(/^\s*\/?\*.*$/, '') }));
}

function sites(motif) {
    const trouves = [];
    for (const fichier of fichiersJs(DOSSIER_JS)) {
        for (const l of lignesDeCode(fichier)) {
            if (motif.test(l.texte)) trouves.push(path.relative(RACINE, fichier) + ':' + l.n);
        }
    }
    return trouves;
}

describe('Lot N1b · les lecteurs suivent la désignation unique', () => {
    const FICHIERS = fichiersJs(DOSSIER_JS);

    it('le balayage mesure quelque chose : le dossier js est lu, et le motif témoin y est trouvé', () => {
        expect(FICHIERS.length).toBeGreaterThan(100);
        expect(sites(/designerPratiqueActive\s*\(/).length).toBeGreaterThan(5);
    });

    it('`obtenirPratiqueActiveGroupeCours` n\'existe plus : ni définition, ni export, ni appel', () => {
        expect(sites(/obtenirPratiqueActiveGroupeCours/)).toEqual([]);
    });

    it('le pointeur du groupe-cours n\'a qu\'UN lecteur : la désignation du registre (modes.js le définit et l\'exporte)', () => {
        const lecteurs = sites(/lirePointeurPratiqueGroupeCours/).map(s => s.split(':')[0]);
        expect([...new Set(lecteurs)].sort()).toEqual(['js/modes.js', 'js/pratiques/pratique-registre.js']);
    });

    it('modes.js : le lecteur du pointeur ne se replie sur AUCUNE pratique', () => {
        const source = fs.readFileSync(path.join(DOSSIER_JS, 'modes.js'), 'utf8');
        const corps = tranche(source, 'function lirePointeurPratiqueGroupeCours()', '\n// Exporter les nouvelles fonctions');
        expect(corps).toContain('return gc.pratiqueId || null;');
        expect(corps).not.toMatch(/['"](sommative|standards|specifications|denotation)['"]/);
    });

    it('PRATIQUE_DEFAUT : plus aucun lecteur, plus d\'export — il ne reste que la représentation neutre d\'un badge, dans le registre', () => {
        expect(sites(/PRATIQUE_DEFAUT/).map(s => s.split(':')[0]).filter(f => f !== 'js/pratiques/pratique-registre.js')).toEqual([]);
        expect(sites(/window\.PRATIQUE_DEFAUT/)).toEqual([]);
    });

    it('aucun appel d\'`obtenirTypePratiqueActive` n\'est suivi d\'un repli vers une famille (`|| \'sommative\'`, `|| \'standards\'`…)', () => {
        const fautifs = [];
        for (const fichier of FICHIERS) {
            const lignes = lignesDeCode(fichier);
            lignes.forEach((l, i) => {
                if (!/obtenirTypePratiqueActive\s*\(\s*\)/.test(l.texte)) return;
                // L'appel s'écrit souvent sur deux lignes (`? obtenirTypePratiqueActive() : null) || …`).
                const fenetre = l.texte + ' ' + (lignes[i + 1] ? lignes[i + 1].texte : '');
                if (/\|\|\s*\(?\s*(window\.PRATIQUE_DEFAUT|['"](sommative|standards|specifications|denotation)['"])/.test(fenetre)) {
                    fautifs.push(path.relative(RACINE, fichier) + ':' + l.n);
                }
            });
        }
        expect(fautifs).toEqual([]);
    });

    it('`obtenirTypePratiqueActive` lit LA désignation : ni pointeur, ni registre, ni bibliothèque relus de son côté', () => {
        const source = fs.readFileSync(path.join(DOSSIER_JS, 'pratiques', 'pratique-registre.js'), 'utf8');
        const corps = tranche(source, 'function obtenirTypePratiqueActive()', '\n/* ===============================');
        expect(corps).toContain('designerPratiqueActive()');
        expect(corps).not.toMatch(/pratiquesEnregistrees|db\.getSync|groupeCoursActif|pratiquesConfigurables/);
    });

    it('le code mort qui écrivait encore un pointeur nu est retiré (`desactiverPratique`, `genererCartePratique`)', () => {
        expect(sites(/\bdesactiverPratique\b|\bgenererCartePratique\b/)).toEqual([]);
    });

    it('l\'écrivain d\'indicesCP pose `completionConstructible: false` sans pratique, et le lecteur en fait un `null`', () => {
        const portfolio = fs.readFileSync(path.join(DOSSIER_JS, 'portfolio.js'), 'utf8');
        const bloc = tranche(portfolio, 'if (!pratique) {', 'db.setSyncSiChange(cleIndices, indicesCP');
        expect(bloc).toContain('completionConstructible: false');
        const indices = fs.readFileSync(path.join(DOSSIER_JS, 'indices.js'), 'utf8');
        expect(indices).toContain('C: completionConstructible ? Math.round(C * 100) : null,');
    });
});
