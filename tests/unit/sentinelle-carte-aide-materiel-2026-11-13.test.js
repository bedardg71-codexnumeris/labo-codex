import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// LA CARTE D'AIDE DANS « APPORTER MON MATÉRIEL » (13 nov. 2026) — ce que le lot verrouille, lu dans les sources.
// Le comportement est jugé sous WebKit (tests/integration/carte-aide-materiel-2026-11-13.spec.js) ; ici, les invariants
// qu'une retouche pourrait défaire sans faire rougir un banc : une seule définition de ce qui guide la page, une carte
// qui n'écrit rien dans les parcours, des consignes qui ne reviennent pas dans la page, l'exemple qui n'écrit rien.
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');

describe('la carte d’aide · une seule définition de ce qui guide la page', () => {
    const evaluer = sansCommentaires(lire('js/parcours-evaluer.js'));
    const aide = sansCommentaires(lire('js/materiel-aide.js'));
    it('« Ta grille » ne garde aucune copie : l’aide, ses cibles et son premier geste vivent dans materiel-aide.js', () => {
        for (const nom of ['function aideOuverte', 'function ciblesDeLAide', 'function premierGesteDeLAide', 'GESTE_ACCUEIL', 'GESTE_EXEMPLE_COMPLET']) {
            expect(evaluer, nom + ' dans parcours-evaluer.js').not.toContain(nom);
            expect(aide, nom + ' dans materiel-aide.js').toContain(nom);
        }
        for (const appel of ['A().zones()', 'A().fleches()', 'A().aussiEviter()', 'A().contour()', 'A().geste(', 'A().complement()']) expect(evaluer).toContain(appel);
    });
    it('la carte de la page passe par le moteur, avec les mêmes fonctions que « Ta grille »', () => {
        expect(aide).toContain('M().lancer(DEF,');
        for (const champ of ['complement: complement', 'zones: zones', 'fleches: fleches', 'aussiEviter: aussiEviter', 'contour: contour']) expect(aide).toContain(champ);
    });
});

describe('la carte d’aide · pas un parcours', () => {
    const aide = sansCommentaires(lire('js/materiel-aide.js'));
    it('elle n’entre pas dans la liste des parcours et n’écrit ni progression ni préférence de l’application', () => {
        for (const interdit of ['Assistance', 'definirPreference', 'db.setSync', 'sauvegarderDonneesSelonMode', 'surEtape']) expect(aide).not.toContain(interdit);
    });
    it('ce qu’elle retient : une seule clé, hors de db, inscrite au registre', () => {
        expect(aide).toContain("var CLE = 'laboCodex.aideMateriel';");
        expect((aide.match(/localStorage\.setItem\(/g) || []).length).toBe(1);
        expect(lire('docs/DATA-OWNERSHIP.md')).toContain('`laboCodex.aideMateriel`');
    });
});

describe('la carte d’aide · la page n’a plus de consignes à elle', () => {
    const html = lire('index.html');
    const zone = tranche(html, '<div id="conception-materiel"', 'fin sous-section conception-materiel').replace(/<!--[\s\S]*?-->/g, '');   // les commentaires racontent ce qui est parti
    it('index.html : ni les trois cartes de l’accueil, ni les trois étapes, ni le texte du bandeau', () => {
        for (const parti of ['materiel-etapes', 'dissection-consignes', 'dissection-consigne-plusieurs', 'id="dissection-bandeau-texte"', 'Copie ton tableau', 'Touche une étiquette dans la légende']) {
            expect(zone, parti).not.toContain(parti);
        }
        expect(zone).toContain('M’accompagner pour étiqueter ma grille');
    });
    it('la dissection ne dit plus de consigne dans la page : elles sortent par consignes(), pour la carte', () => {
        const d = sansCommentaires(lire('js/materiel-dissection.js'));
        expect(d).not.toContain("'dissection-bandeau-texte'");
        expect(d).not.toMatch(/dire\(TEXTES_(COUPE|LIEN)\.bandeau/);
        expect(d).toContain('consignes: consignes');
    });
});

describe('la carte d’aide · l’exemple n’écrit rien', () => {
    it('« Essayer avec un exemple » est parti : aucun chemin n’ouvre l’exemple comme un collage', () => {
        const html = lire('index.html');
        expect(html).not.toContain('essayerExemple');
        expect(html).not.toContain('Essayer avec un exemple');
        expect(sansCommentaires(lire('js/materiel.js'))).not.toContain('exempleDoc');
        // Le seul appel de `exempleDoc` de l'application : `ouvrirExemple`, qui passe le drapeau de l'exemple.
        const js = ['js/materiel.js', 'js/materiel-dissection.js', 'js/materiel-aide.js', 'js/parcours-evaluer.js'].map((f) => sansCommentaires(lire(f))).join('\n');
        expect(js.match(/exempleDoc\(\)/g)).toEqual(['exempleDoc()']);
        expect(js).toContain("return ouvrir(D().exempleDoc(), null, null, complet ? 'complet' : 'exercice');");
    });
});
