/**
 * Sentinelle — UNE SEULE SOURCE POUR LES CODES, ET UNE SEULE FAÇON DE CHOISIR
 * UNE COULEUR (consigne du 3 septembre 2026, 16 h, née du coup d'œil de
 * Grégoire sur les lots 1 et 2). Témoins de SOURCE ; le comportement est
 * éprouvé dans WebKit par `tests/integration/source-unique-codes.spec.js`.
 *
 *   U.a la phrase arrêtée par Grégoire est écrite TELLE QUELLE, et « X » est le
 *       nom de la grille, jamais un identifiant ;
 *   U.b sous gouvernance, la palette ne rend pas « Personnaliser » et l'écran de
 *       réglage n'offre que la phrase ; l'édition du REPLI n'est pas retirée ;
 *   U.c le gabarit n'a plus d'`<input type="color">` nu : le sélecteur de la
 *       palette (douze pastilles + « Personnalisé… ») est appelé, pas copié.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

describe('source unique des codes · sources', () => {
    const outils = () => source('js/travaux-outils.js');

    it('U.a la phrase de Grégoire, telle quelle, avec le NOM de la grille', () => {
        const s = outils();
        expect(s).toContain("'Les codes de cette copie viennent de sa grille « ' + (nom || 'sans nom') + ' ». Pour les modifier, ouvre la grille.'");
        const f = s.slice(s.indexOf('function _phraseSourceCodes'), s.indexOf('function genererContenuErreursFr'));
        expect(f).toMatch(/_grilleCourante\.nom/);
        expect(f).not.toMatch(/_grilleCourante\.id/);
    });

    it('U.b gouvernée : pas de « Personnaliser », l\'écran de réglage n\'offre que la phrase ; le repli reste éditable', () => {
        const s = outils();
        // Le bouton est conditionné à la gouvernance…
        const barre = s.slice(s.indexOf("palette.id = 'travaux-palette-erreurs-fr'"), s.indexOf("id=\"travaux-errfr-contenu\""));
        expect(barre).toMatch(/if \(!_copieGouvernee\(\)\) \{[\s\S]*ouvrirEditionRetroErreursFr/);
        // …la palette porte la phrase…
        const contenu = s.slice(s.indexOf('function genererContenuErreursFr'), s.indexOf("html += '<div class=\"travaux-errfr-liste\">'"));
        expect(contenu).toMatch(/_copieGouvernee\(\)[\s\S]*travaux-errfr-source/);
        // …et l'écran de réglage se garde AVANT de lire les codes du repli.
        const ecran = s.slice(s.indexOf('function ouvrirEditionRetroErreursFr'), s.indexOf('function reinitialiserRetroErreursFr'));
        expect(ecran.indexOf('_copieGouvernee()')).toBeLessThan(ecran.indexOf('obtenirCodesOrdonnes()'));
        // L'édition du repli n'est pas retirée : les écrivains des quatre clés sont là.
        ['sauvegarderPersonnalisationErreursFr(persObj)', 'sauvegarderOrdreErreursFr(ordre)', 'sauvegarderRetroactionsErreursFr(retroObj)']
            .forEach(w => expect(s).toContain(w));
    });

    it('U.c le gabarit appelle le sélecteur de la palette, il ne le copie pas', () => {
        const g = source('js/grilles.js');
        expect((g.match(/type="color"/g) || []).length).toBe(0);
        expect(g).toMatch(/window\.travauxOutils\.renderPickerCouleur\(couleur, \{/);
        // Le sélecteur ne connaît la liste des douze qu'à un endroit.
        expect((source('js/travaux-outils.js').match(/hex: '#ff0000'/g) || []).length).toBe(1);
    });
});
