/**
 * Sentinelle — UNE SEULE SOURCE POUR LES CODES, ET UNE SEULE FAÇON DE CHOISIR
 * UNE COULEUR (consigne du 3 septembre 2026, 16 h, née du coup d'œil de
 * Grégoire sur les lots 1 et 2). Témoins de SOURCE ; le comportement est
 * éprouvé dans WebKit par `tests/integration/source-unique-codes.spec.js`.
 *
 *   U.a la phrase arrêtée par Grégoire est écrite TELLE QUELLE, et « X » est le
 *       nom de la grille, jamais un identifiant ;
 *   U.b sous gouvernance, l'engrenage reste et porte la phrase, la palette ne
 *       porte pas de bandeau, l'écran de réglage n'offre que la phrase ;
 *       l'édition du REPLI n'est pas retirée (coup d'œil de Grégoire, 3 sept.) ;
 *   U.c le gabarit n'a plus d'`<input type="color">` nu : le sélecteur de la
 *       palette (douze pastilles + « Personnalisé… ») est appelé, pas copié.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

describe('source unique des codes · sources', () => {
    const outils = () => source('js/travaux-outils.js');

    it('U.a la phrase de Grégoire, telle quelle, avec le NOM de la grille', () => {
        const s = outils();
        expect(s).toContain("'Les codes de cette copie viennent de sa grille « ' + (nom || 'sans nom') + ' ». Pour les modifier, ouvre la grille.'");
        const f = tranche(s, 'function _phraseSourceCodes', 'function genererContenuErreursFr');
        expect(f).toMatch(/_grilleCourante\.nom/);
        expect(f).not.toMatch(/_grilleCourante\.id/);
    });

    it('U.b gouvernée : l\'engrenage reste et porte la phrase, pas de bandeau, l\'écran de réglage n\'offre que la phrase ; le repli reste éditable', () => {
        const s = outils();
        // L'engrenage est toujours rendu, et son titre est la phrase sous gouvernance…
        const barre = tranche(s, "palette.id = 'travaux-palette-erreurs-fr'", "id=\"travaux-errfr-contenu\"");
        expect(barre).toMatch(/_copieGouvernee\(\) \? _phraseSourceCodes\(\) : 'Personnaliser'/);
        expect(barre).not.toMatch(/if \(!_copieGouvernee\(\)\)/);
        // …la palette ne porte PAS de bandeau (coup d'œil : trop de place)…
        const contenu = tranche(s, 'function genererContenuErreursFr', 'function genererContenuTampons');
        expect(contenu).not.toMatch(/travaux-errfr-source/);
        // …et l'écran de réglage se garde AVANT de lire les codes du repli.
        const ecran = s.slice(s.indexOf('function ouvrirEditionRetroErreursFr'), s.indexOf('function reinitialiserRetroErreursFr'));
        expect(ecran.indexOf('_copieGouvernee()')).toBeLessThan(ecran.indexOf('obtenirCodesOrdonnes()'));
        // L'édition du repli n'est pas retirée : les écrivains des quatre clés sont là.
        ['sauvegarderPersonnalisationErreursFr(persObj)', 'sauvegarderOrdreErreursFr(ordre)', 'sauvegarderRetroactionsErreursFr(retroObj)']
            .forEach(w => expect(s).toContain(w));
    });

    it('U.d un sélecteur ouvert se referme au pointeur posé ailleurs — une définition pour tous', () => {
        const s = outils();
        expect(s).toMatch(/addEventListener\('pointerdown'[\s\S]*details\.travaux-retro-couleur-picker\[open\][\s\S]*d\.contains\(cible\)\) d\.open = false/);
    });

    it('U.e essai iPad : la pastille se repeint dans le module, « Personnalisé… » est une étiquette liée à l\'input', () => {
        const s = outils();
        // Un seul chemin repeint la pastille : l'écouteur `input` délégué (la pastille
        // cliquée dispatche `input`, le sélecteur natif aussi).
        expect(s).toMatch(/document\.addEventListener\('input'[\s\S]*input\.travaux-retro-couleur-input[\s\S]*pastille\.style\.background = input\.value/);
        expect(s).not.toMatch(/_repeindrePastille/);
        expect(s).toMatch(/<label class="travaux-btn-couleur-perso" for="' \+ inputId \+ '">/);
        expect(s).toMatch(/class="travaux-retro-couleur-input" id="' \+ inputId \+ '"/);
        expect(s).not.toMatch(/ouvrirCouleurPerso/);
        // Le câblage local de l'écran de réglage, devenu doublon, est parti.
        expect(s).not.toMatch(/Wiring: changement couleur/);
    });

    it('U.c le gabarit appelle le sélecteur de la palette, il ne le copie pas', () => {
        const g = source('js/grilles.js');
        expect((g.match(/type="color"/g) || []).length).toBe(0);
        expect(g).toMatch(/window\.travauxOutils\.renderPickerCouleur\(couleur, \{/);
        // Le sélecteur ne connaît la liste des douze qu'à un endroit.
        expect((source('js/travaux-outils.js').match(/hex: '#ff0000'/g) || []).length).toBe(1);
    });
});
