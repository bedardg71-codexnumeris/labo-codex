import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — #118 (SUIVI-BUGS, 22 mai 2026) + #283-T1 (21 juin 2026),
// livrés le 3 juillet 2026 (vague 3).
//
// #118 : overflow horizontal du sous-onglet Calendrier → Trimestre sur Safari
// 1470×956. Cause : les enfants d'une grid CSS ont min-width:auto — une colonne
// de la grille « Congés prévus | Événements imprévus » ne peut pas rétrécir sous
// la largeur intrinsèque de son contenu (formulaire interne 1fr 1fr avec inputs
// date WebKit, cartes avec boutons Modifier/Suppr.) et pousse la page au-delà
// du viewport (boutons clippés, « Sauvegarder le trimestre » coupé, scrollbar).
// Défense : min-width:0 sur les enfants des grilles du sous-onglet — les pistes
// redeviennent réellement 1fr, les contrôles (width:100%) suivent la piste.
//
// #283-T1 : la grille des mois du Calendrier scolaire (.cal-grid-2col, générée
// par calendrier-vue.js) n'avait AUCUNE règle responsive : 2 colonnes à toute
// largeur → le 2ᵉ mois déborde à droite sous 1024 px. Défense : empilement en
// 1 colonne sous le breakpoint 1024 acté pour #283 option B + même garde
// min-width:0 que #118.
//
// Vérifié fonctionnellement sous Chromium (probe 3 juillet) : 2 colonnes
// conservées à 1470 px sans scroll horizontal, 1 colonne à 900 px, 2 colonnes
// à 1200 px. La validation visuelle Safari/iPad reste en porte terrain (août).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('sentinelle · overflow horizontal Calendrier (#118 + #283-T1)', () => {
    const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
    const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

    it('#118 — les enfants des grilles du sous-onglet Trimestre ont min-width:0', () => {
        // Le sélecteur groupé doit couvrir les 2 grilles ET les cellules des
        // formulaires internes (les 3 endroits où min-width:auto élargissait la piste).
        const regle = css.match(
            /#calendrier-trimestre \.grille-2col > \*,\s*#calendrier-trimestre \.grille-2col-gap15 > \*,\s*#calendrier-trimestre \.formulaire-interne \.groupe-form \{\s*min-width: 0;\s*\}/
        );
        expect(regle, 'règle min-width:0 du sous-onglet Trimestre absente de styles.css').not.toBeNull();
    });

    it('#283-T1 — la grille des mois s\'empile en 1 colonne sous 1024 px', () => {
        // La media query doit exister et contenir la bascule 1fr de .cal-grid-2col.
        const bloc = css.match(/@media \(max-width: 1024px\) \{\s*\.cal-grid-2col \{\s*grid-template-columns: 1fr;\s*\}\s*\}/);
        expect(bloc, 'bascule 1 colonne de .cal-grid-2col sous 1024px absente').not.toBeNull();
    });

    it('#283-T1 — les mois eux-mêmes ont la garde min-width:0', () => {
        expect(css).toMatch(/\.cal-grid-2col > \* \{\s*min-width: 0;\s*\}/);
    });

    it('la grille des mois est bien .cal-grid-2col (le sélecteur verrouillé vise le vrai code)', () => {
        // Anti-tautologie : si calendrier-vue.js renomme la classe, la sentinelle
        // doit rougir plutôt que verrouiller un sélecteur mort.
        const vue = readFileSync(path.join(racine, 'js', 'calendrier-vue.js'), 'utf8');
        expect(vue).toContain("'<div class=\"cal-grid-2col\">'");
        // Même garde pour le sous-onglet Trimestre : la grille HTML existe toujours.
        expect(html).toMatch(/id="calendrier-trimestre"/);
        expect(html).toMatch(/<div class="grille-2col u-mt-15">/);
    });

    it('cache-busting : styles.css?v= bumpé au moins au 20260703', () => {
        const m = html.match(/styles\.css\?v=(\d{8})/);
        expect(m).not.toBeNull();
        expect(Number(m[1])).toBeGreaterThanOrEqual(20260703);
    });
});
