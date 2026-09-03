/**
 * Sentinelle — LES CODES PAR GRILLE, lot 2 : l'annotation suit la grille
 * (3 septembre 2026). Témoins de SOURCE ; le comportement est éprouvé dans
 * WebKit par `tests/integration/codes-par-grille-palette.spec.js`.
 *
 *   L2.a la visionneuse annonce `travaux-fichier-ouvert` AVANT le premier rendu ;
 *   L2.b travaux-outils écoute l'ouverture ET la fermeture, expose `grilleCourante` ;
 *   L2.c le curseur, le dessin sur la copie et le PDF lisent le numéro dans la
 *        liste (`codesAnnotation.code`), et le PDF pose la grille de la copie
 *        qu'il exporte — pas celle de l'écran ;
 *   L2.d l'ordre global n'a plus de lecteur : `obtenirOrdreErreursFr` n'existe
 *        plus nulle part ; son écrivain (l'écran de réglage) reste ;
 *   L2.e la sélection visuelle d'un code suit `data-param`, plus un `onclick`
 *        que personne ne posait — et un code non numérique y passe.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

describe('codes par grille · lot 2 — l\'annotation suit la grille (sources)', () => {
    it('L2.a la visionneuse annonce l\'ouverture d\'un fichier, avant de rendre la première page', () => {
        const s = source('js/travaux-visionneuse.js');
        const annonce = s.indexOf("new CustomEvent('travaux-fichier-ouvert'");
        expect(annonce).toBeGreaterThan(-1);
        const pose = s.indexOf('fichierActuel = fichier;');
        const rendu = s.indexOf('await ouvrirPDF(blob);', pose);
        expect(annonce).toBeGreaterThan(pose);
        expect(annonce).toBeLessThan(rendu);
        // Le pendant existait déjà : la fermeture.
        expect(s).toMatch(/new CustomEvent\('travaux-fichier-ferme'\)/);
    });

    it('L2.b travaux-outils écoute l\'ouverture et la fermeture, et expose la grille courante', () => {
        const s = source('js/travaux-outils.js');
        expect(s).toMatch(/addEventListener\('travaux-fichier-ouvert'/);
        expect(s).toMatch(/addEventListener\('travaux-fichier-ferme'/);
        expect(s).toMatch(/grilleCourante: function\(\) \{ return _grilleCourante; \}/);
        expect(s).toMatch(/function _poserGrilleCourante\(grille\)/);
        expect(s).toMatch(/function _regenererOutilsCodes\(\)/);
    });

    it('L2.c curseur, dessin et PDF lisent le numéro dans la liste ; le PDF pose la grille de la copie exportée', () => {
        expect(source('js/travaux-outils.js')).toMatch(/_codes\(\)\.code\(_grilleCourante, outilId\)\.numero/);
        expect(source('js/travaux-annotation.js')).toMatch(/codesAnnotation\.code\(travauxOutils\.grilleCourante\(\), type\)\.numero/);
        const pdf = source('js/travaux-export-pdf.js');
        expect(pdf).toMatch(/codesAnnotation\.code\(_grilleExport, forme\.type\)\.numero/);
        // Posée à l'entrée de l'export, que la prévisualisation emprunte aussi.
        const entree = pdf.indexOf('async function genererDocPDF(');
        expect(pdf.indexOf('_poserGrilleExport(fichier);', entree)).toBeGreaterThan(entree);
        expect(pdf.indexOf("await genererDocPDF(fichierId)", pdf.indexOf('async function previsualiserPDF('))).toBeGreaterThan(-1);
    });

    it('L2.d `obtenirOrdreErreursFr` n\'existe plus nulle part — l\'écrivain de l\'ordre reste', () => {
        const fichiers = readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js'));
        const lecteurs = fichiers.filter(f => /obtenirOrdreErreursFr\s*\(|obtenirOrdreErreursFr\s*:/.test(source('js/' + f)));
        expect(lecteurs, 'appel ou export restant').toEqual([]);
        expect(source('js/travaux-outils.js')).toMatch(/function sauvegarderOrdreErreursFr\(/);
        // Et plus aucune constante des dix, nulle part dans js/ (le module la nomme en commentaire, sans la définir).
        const definitions = fichiers.filter(f => /CODES_ERREURS_FR\s*=/.test(source('js/' + f)));
        expect(definitions).toEqual([]);
    });

    it('L2.e la sélection visuelle d\'un code suit `data-param` — un code non numérique y passe', () => {
        const s = source('js/travaux-outils.js');
        expect(s).not.toMatch(/setOutilActif\\\('\(errfr_\\d\+\)'\\\)/);
        expect(s).toMatch(/item\.dataset\.param === outilActif/);
    });
});
