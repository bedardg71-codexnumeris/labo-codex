// SENTINELLE — LOT C DU 5 SEPTEMBRE 2026 : LES MÊMES GESTES PARTOUT
// Cadrage design (Cowork, 4 sept. au soir) : un seul bouton de suppression dans l'application —
// la corbeille ; un seul geste pour changer l'ordre — les chevrons sur la ligne de la corbeille ;
// une règle d'empilement pour la grille à deux colonnes sous 768 px. Ce que chaque suppression
// FAIT et DIT ne change pas ; l'ordre enregistré non plus.
//
// Les sites MESURÉS avant de toucher (`grep -n "✕" js/*.js`, `grep -n ">Ordre<" js/*.js`) :
// le dossier de la bibliothèque (1), la pratique de notation v2 (3), l'éditeur d'échelles
// (3 : la table et les deux cartes) — rendus ici par le code réel sur un DOM factice.
// ↻ 13 sept. 2026 (#658) : la TABLE est retirée avec sa fonction. Elle rendait dans
// `#tableauNiveaux`, un conteneur caché d'index.html que personne ne voyait. Restent les cartes.
//
//   A. la bibliothèque — le dossier : la corbeille, la confirmation intacte, plus de « ✕ » ;
//   B. la pratique v2 — objectifs, types de production, forfaits : la corbeille, mêmes actions ;
//   C. l'éditeur d'échelles — les deux cartes : le coin (la table est partie avec #658) ;
//   D. les sources : aucun « ✕ » de suppression, aucun « Ordre », dans les fichiers touchés ;
//   E. le CSS : la grille des niveaux à sept colonnes, le coin générique, 44 px, l'empilement
//      sous 768 px pour les deux grilles, et plus de doublon de `.grille-form-2col` dans index.html.
//
// BREAK-TESTS (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · un « ✕ » réintroduit dans la pratique v2 → B.a et D.a rougissent ;
//   · la colonne « Ordre » remise dans la table des niveaux → C.a et D.b rougissaient
//     (C.a est parti avec la table, #658) ;
//   · la règle d'empilement retirée → E.c rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jetonAuMoins } from './_helpers/jeton-anticache.js';
import { tranche } from './_helpers/tranche.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fauxElement() {
    return { value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, appendChild() {}, setAttribute() {} };
}
function fauxDocument() {
    const elements = {};
    return { _elements: elements,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {} },
        createElement: () => fauxElement(), addEventListener() {}, removeEventListener() {} };
}
const dbFactice = () => ({ get: async () => null, getSync: () => null, set: async () => {}, setSync: () => {}, modifier: async () => undefined, keys: async () => [], keysSync: () => [] });
const notifs = { succes() {}, erreur() {}, info() {}, avertissement() {} };

/** Les helpers réels (ui-blocs.js) dans une fenêtre, puis le module à éprouver par-dessus. */
function monter(script, globauxSup) {
    const document = fauxDocument();
    const globaux = Object.assign({ db: dbFactice(), cle: (k) => 'a2026_' + k, echapperHtml: echapper, document, notifications: notifs,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8), alert() {}, confirm: () => true }, globauxSup || {});
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript(script, globaux, win);
    return { win, document };
}
const compter = (h, m) => h.split(m).length - 1;

/* ============================================================ A — LA BIBLIOTHÈQUE */

describe('lot C · A — le dossier de la bibliothèque : la corbeille, la confirmation intacte', () => {
    it('A.a plus de « ✕ » ni de bouton plein ; la corbeille porte le même geste, les mêmes paramètres, le même `data-confirm`, et l\'étiquette', () => {
        // ↻ #1156 (25 oct. 2026) : la zone « Mes dossiers » (`genererZone`) est retirée ; la gestion des dossiers vit
        // dans la barre de la fenêtre en deux colonnes (« Gérer les dossiers… »), qui pose la même corbeille. Le banc
        // rend donc la fenêtre et lit cette barre. BREAK-TEST (25 oct.) : `window.boutonRetirerBloc(...)` remplacé par
        // un bouton plein « ✕ » dans `_renderBarreDossiers` → ROUGE.
        let html = '';
        const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
            body: { appendChild() {}, insertAdjacentHTML: (_ou, h) => { html += h; } },
            createElement: () => ({}), addEventListener() {}, removeEventListener() {} };
        const { win } = monter('js/bibliotheque-ui.js', {
            document, echapperAttribut: echapper, obtenirIdentiteCCUtilisateur: () => 'banc', obtenirProfilAuteurActifSync: () => ({ auteur_original: 'banc' }), nommerCopie: (n) => n + ' (copie)'
        });
        win.repertoiresBibliotheque = { obtenir: () => [] };
        win.BibliothequeUI.creerFenetreDeuxColonnes({
            modalId: 'banc', titre: 'Banc', menuFichiers: [],
            trimestre: { titre: 'Dans ce trimestre', rangees: [] },
            bibliotheque: { titre: 'Dans ta bibliothèque', rangees: [],
                dossiers: { biblio: 'echelles', reps: [{ id: 'R1', nom: 'Dossier <b>un</b>' }, { id: 'R2', nom: 'Deux' }], refreshFn: 'x', masquerLibelle: 'Masquer' } }
        });
        html = (html.match(/class="biblio2-dossiers"[\s\S]*$/) || [''])[0];
        expect(html).toContain('Mes dossiers');
        expect(html).not.toContain('✕');
        expect(html).not.toContain('btn-supprimer');
        expect(compter(html, 'icons8-trash.svg')).toBe(2);
        expect(html).toMatch(/data-action="BibliothequeUI\.repertoires\.supprimer" data-param="echelles" data-param2="R1" data-confirm="Supprimer ce dossier \? Son contenu n(?:'|&#x27;)est pas supprimé : les éléments repassent en « non classées »\."/);
        expect(html).toContain('aria-label="Supprimer le dossier"');
        expect(html).toContain('class="btn-mini btn-icone-nu"');
        expect(html).toContain('value="Dossier &lt;b&gt;un&lt;/b&gt;"');
        expect(html).not.toContain('<b>un</b>');
    });
});

/* ============================================================ B — LA PRATIQUE V2 */
// Le bloc B jugeait les trois tables de `pratique-notation-v2.js`, retiré en entier le
// 11 oct. 2026 (#469 : ses cibles `v2-*` n'existaient plus dans index.html).

/* ============================================================ C — L'ÉDITEUR D'ÉCHELLES */

const NIVEAUX = () => ([
    { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 40, couleur: '#c62828' },
    { code: 'D', nom: 'En développement', min: 60, max: 74, valeurCalcul: 67, couleur: '#e65100', verrouille: true },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 100, valeurCalcul: 88, couleur: '#2e7d32' }
]);

describe('lot C · C — l\'éditeur d\'échelles : la table et les deux cartes', () => {
    function monterEchelles() {
        const m = monter('js/echelles.js', { BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } }, obtenirIdentiteUtilisateur: () => 'banc' });
        // Le champ Couleur des cartes passe par le sélecteur de la palette d'annotation : un simulacre suffit ici.
        m.win.travauxOutils = { renderPickerCouleur: (c) => '<span class="travaux-retro-couleur-picker" data-couleur="' + c + '"></span>' };
        return m;
    }

    // ↻ 13 sept. 2026 (#658) : le cas « C.a la table » est retiré avec `afficherTableauNiveaux`,
    // qui rendait dans `#tableauNiveaux`, un conteneur caché d'index.html. Aucun écran ne l'affichait.

    it('C.b la carte d\'ÉDITION : la cellule « Ordre » a disparu de la grille ; le coin porte les chevrons puis la corbeille, avec le couple (échelle, index)', () => {
        const { win, document } = monterEchelles();
        win.afficherNiveauxEchelle({ id: 'ECH_A', nom: 'A', niveaux: NIVEAUX() });
        const html = document.getElementById('tableauNiveauxEchelle').innerHTML;
        expect(html).not.toContain('>Ordre</label>');
        expect(html).not.toContain('bloc-retirer-coin');
        const cartes = html.split('class="item-liste"').slice(1);
        expect(cartes.length).toBe(3);
        cartes.forEach((c, i) => {
            const coin = c.slice(c.indexOf('class="bloc-coin-outils"'), c.indexOf('class="echelle-niveau-grille"'));
            expect(coin.length, 'carte ' + i).toBeGreaterThan(0);
            expect(coin).toMatch(new RegExp('data-action="deplacerNiveauEchelleHaut" data-param="ECH_A" data-param2="' + i + '"'));
            expect(coin).toMatch(new RegExp('data-action="deplacerNiveauEchelleBas" data-param="ECH_A" data-param2="' + i + '"'));
            expect(coin).toMatch(new RegExp('data-action="supprimerNiveauEchelle" data-param="ECH_A" data-param2="' + i + '"'));
            expect(coin.indexOf('pipeline-btn-reorder')).toBeLessThan(coin.indexOf('icons8-trash.svg'));
            // La grille commence par le code : la première cellule n'est plus « Ordre ».
            const grille = tranche(c, 'class="echelle-niveau-grille"');
            expect(grille.indexOf('data-champ="code"')).toBeLessThan(grille.indexOf('data-champ="nom"'));
            expect(grille).not.toContain('bloc-reordonner');
            // La carte laisse la place au coin.
            expect(c.startsWith(' style="position: relative; padding: 15px 150px 15px 15px;')).toBe(true);
        });
        expect(cartes[0]).toMatch(/data-action="deplacerNiveauEchelleHaut" data-param="ECH_A" data-param2="0" disabled/);
        expect(cartes[2]).toMatch(/data-action="deplacerNiveauEchelleBas" data-param="ECH_A" data-param2="2" disabled/);
    });

    it('C.c la carte de CRÉATION : même chose, avec les gestes temp et l\'index seul ; un niveau seul n\'a pas de corbeille', () => {
        const { win, document } = monterEchelles();
        win._niveauxNouvelleEchelle = NIVEAUX();
        win.afficherNiveauxNouvelleEchelle();
        const html = document.getElementById('tableauNiveauxEchelle').innerHTML;
        expect(html).not.toContain('>Ordre</label>');
        expect(compter(html, 'class="bloc-coin-outils"')).toBe(3);
        expect(html).toMatch(/data-action="deplacerNiveauTempBas" data-param="0"\s*>/);
        expect(html).toMatch(/data-action="supprimerNiveauTemp" data-param="2"/);
        win._niveauxNouvelleEchelle = [NIVEAUX()[0]];
        win.afficherNiveauxNouvelleEchelle();
        const seul = document.getElementById('tableauNiveauxEchelle').innerHTML;
        expect(seul).not.toContain('icons8-trash.svg');
        expect(compter(seul, 'class="bloc-coin-outils"')).toBe(1);
    });
});

/* ============================================================ D — LES SOURCES */

describe('lot C · D — les sources des sites touchés', () => {
    it('D.a plus aucun « ✕ » de suppression dans la bibliothèque ni dans la pratique v2 ; la corbeille sait confirmer et se désactiver', () => {
        expect(sansCommentaires(source('js/bibliotheque-ui.js'))).not.toContain('✕');
        const ui = source('js/ui-blocs.js');
        expect(ui).toMatch(/const confirme = o\.confirm \? ` data-confirm="\$\{esc\(o\.confirm\)\}"` : '';/);
        expect(ui).toMatch(/const inactif = o\.disabled \? ' disabled' : '';/);
    });

    it('D.b plus aucun « Ordre » dans l\'éditeur d\'échelles, ni de bouton plein « Supprimer » sur un niveau', () => {
        const e = sansCommentaires(source('js/echelles.js'));
        expect(e).not.toContain('>Ordre<');
        expect(e).not.toContain('btn btn-supprimer btn-compact');
        // ↻ 11 oct. 2026 (#574) : 2 → 3, le coin du niveau en attente (sa seule corbeille).
        expect((e.match(/class="bloc-coin-outils"/g) || []).length).toBe(3);
        // ↻ 13 sept. 2026 (#658) : l'assertion « une seule `outils-rangee` » est retirée avec son
        // sujet. Cette rangée d'outils était celle de l'ancien tableau de niveaux
        // (`afficherTableauNiveaux`), rendu dans un conteneur caché d'index.html et parti avec lui.
    });
});

/* ============================================================ E — LE CSS */

describe('lot C · E — les règles : sept colonnes, le coin, 44 px, l\'empilement, plus de doublon', () => {
    const css = source('styles.css');

    it('E.a la grille des niveaux a sept colonnes (plus de 56 px), et ses règles par largeur suivent', () => {
        expect(css).toMatch(/\.echelle-niveau-grille \{\s*display: grid;\s*grid-template-columns: 64px minmax\(150px, 2fr\) 76px 76px 104px 64px minmax\(150px, 1fr\);/);
        expect(css).not.toContain('grid-template-columns: 56px 64px');
        expect(css).toMatch(/\.echelle-niveau-grille > \.groupe-form:nth-child\(7\) \{/);
        expect(css).toMatch(/\.echelle-niveau-grille > \.groupe-form:nth-child\(2\) \{/);
        expect(css).not.toMatch(/\.echelle-niveau-grille > \.groupe-form:nth-child\(8\)/);
    });

    it('E.b le coin d\'outils existe hors de l\'éditeur de grille, et ses cibles font 44 px', () => {
        expect(css).toMatch(/\n\.bloc-coin-outils \{\s*position: absolute;/);
        // ↻ 13 sept. 2026 (#658) : les deux sélecteurs `.outils-rangee …` sont partis de la règle avec
        // la seule rangée qui les portait, celle de l'ancien tableau de niveaux (conteneur caché).
        expect(css).toMatch(/\.bloc-coin-outils \.btn-icone-nu,\s*\.bloc-coin-outils \.pipeline-btn-reorder,\s*\.tableau td > \.btn-icone-nu,[\s\S]*?\{[^}]*min-width: 44px;[^}]*min-height: 44px/);
        // Les pipelines gardent leur taille.
        expect(css).toMatch(/\n\.pipeline-btn-reorder \{\s*width: 20px;/);
    });

    it('E.c sous 768 px, une règle empile les DEUX grilles ; le doublon de `.grille-form-2col` a quitté index.html', () => {
        const i = css.indexOf('.grille-form-2col,\n    #listeCriteres .sous-critere-champs-grid {');
        expect(i).toBeGreaterThan(-1);
        const bloc = css.lastIndexOf('@media (max-width: 768px) {', i);
        expect(bloc).toBeGreaterThan(-1);
        expect(css.slice(bloc, i)).not.toContain('\n}\n');
        expect(css.slice(i, i + 200)).toMatch(/grid-template-columns: 1fr;/);
        // La règle vient APRÈS les grilles qu'elle plie (la cascade tranche à spécificité égale).
        expect(i).toBeGreaterThan(css.indexOf('\n.grille-form-2col {'));
        expect(i).toBeGreaterThan(css.indexOf('#listeCriteres .sous-critere-champs-grid--note-codes {'));
        const html = source('index.html');
        expect(html).not.toMatch(/\.grille-form-2col \{\s*display: grid;/);
        expect(html).toContain('class="grille-form-2col u-mb-15"');
    });

    it('E.d les jetons des cinq fichiers du lot ont bougé', () => {
        const html = source('index.html');
        for (const f of ['js/ui-blocs.js', 'js/bibliotheque-ui.js', 'js/echelles.js']) {   // pratique-notation-v2.js retiré (#469)
            { const j = jetonAuMoins(html, f, '20260905a'); expect(j.ok, j.message).toBe(true); }
        }
        { const j = jetonAuMoins(html, 'styles.css', '20260905e'); expect(j.ok, j.message).toBe(true); }
    });
});
