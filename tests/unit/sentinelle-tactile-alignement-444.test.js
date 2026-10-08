import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #444 — l'Inspecteur reste atteignable au doigt
// =======================================================================
//
// Deux constats terrain du 10 août 2026, qui se verrouillaient l'un l'autre :
//   1. le `dblclick` n'est JAMAIS émis sur iPad — tout l'Inspecteur (durée,
//      semaine, objectifs servis, rétroaction formative de #424 Lot E)
//      n'était atteignable que par le bouton 🕵️ ;
//   2. …et ce bouton était COUPÉ, la palette (18 pastilles, 6 familles)
//      dépassant la hauteur de l'écran.
//
// Trois remèdes, arbitrés par Grégoire, verrouillés ici :
//   A. les quatre boutons du bas de la palette vivent dans la BARRE D'OUTILS ;
//   B. un DOUBLE-TAP tactile ouvre l'Inspecteur (le tap long est exclu : il se
//      déclencherait pendant un déplacement, le doigt restant posé) ;
//   C. les familles de la palette sont des ACCORDÉONS, et leur état est
//      persisté par une préférence déclarée dans les DEFAUTS.
//
// Vérifié au navigateur (viewport iPad) avant d'écrire ce fichier : boutons en
// barre, corbeille visible à 21 px du bas pendant un drag, double-tap ouvrant
// l'Inspecteur, palette 801 → 663 px avec deux familles repliées, état
// survivant au rechargement.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const carte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const prefs = readFileSync(path.join(racine, 'js', 'preferences.js'), 'utf8');

// Le bouton des raccourcis a quitté la barre le 8 oct. 2026 (lot 1 du chantier
// de la carte) : les raccourcis sont au bas du menu « Vue ». Ses trois voisins restent.
const BOUTONS = [
    'planif-palette-inspecteur-btn',
    'planif-palette-aide-btn',
    'planif-palette-bibliotheque-btn'
];

describe('#444 · A — les quatre boutons sont dans la barre d’outils', () => {
    it('chacun est déclaré DANS le bloc .planif-toolbar-droite', () => {
        const debut = html.indexOf('<div class="planif-toolbar-droite">');
        expect(debut).toBeGreaterThan(-1);
        const fin = html.indexOf('<div id="planif-zone-wrapper">', debut);
        const barre = html.slice(debut, fin);
        for (const id of BOUTONS) {
            expect(barre.includes('id="' + id + '"'), id + ' n’est plus dans la barre d’outils').toBe(true);
        }
    });

    it('le conteneur du bas de palette a disparu, CSS compris (zéro-dette)', () => {
        expect(html).not.toContain('planif-palette-bas-btns');
        // ⚠ On cherche les RÈGLES (ancrées en début de ligne), pas les
        // mentions : le commentaire qui explique le retrait cite forcément les
        // noms retirés. Premier jet en `toContain` — il rougissait sur sa
        // propre note de bas de page.
        expect(css).not.toMatch(/^\.planif-palette-bas-btns\s*\{/m);
        expect(css).not.toMatch(/^\.planif-palette-aide-btn[\s:{]/m);
        expect(css).not.toMatch(/^\.mode-clair \.planif-palette-aide-btn/m);
    });

    it('l’Inspecteur garde un nom accessible — au doigt, le survol n’existe pas', () => {
        expect(html).toMatch(/id="planif-palette-inspecteur-btn"[^>]*aria-label="/);
    });
});

describe('#444 · B — le double-tap ouvre l’Inspecteur', () => {
    it('un pointerdown tactile est écouté sur le nœud', () => {
        expect(carte).toMatch(/pointerType === 'mouse'\) return;/);
        expect(carte).toContain('_dernierTap');
    });

    it('la fenêtre est bornée en TEMPS et en DISTANCE, et les DEUX sont EMPLOYÉES', () => {
        // Sans la borne de distance, deux appuis éloignés sur le même bloc
        // passeraient pour un double-tap.
        expect(carte).toMatch(/Math\.abs\(e\.clientX - _dernierTapX\) < 30/);
        // ⚠ Vérifier que la borne EXISTE ne suffit pas : le premier jet de ce
        // test est resté VERT quand le break-test a retiré `&& proche` de la
        // condition — la variable était encore calculée, simplement plus
        // consultée. On exige donc les deux termes DANS le même `if`.
        expect(carte).toMatch(/if \(maintenant - _dernierTap < 300 && proche\)/);
    });

    it('il ouvre le panneau, et se réarme pour ne pas cascader', () => {
        // ⚠ On vise la REMISE À ZÉRO dans le handler, pas la déclaration
        // `var _dernierTap = 0;` qui la précède de quinze lignes — la borne
        // naïve tombait sur la déclaration et mesurait le mauvais bloc.
        const i = carte.indexOf('            _dernierTap = 0;');
        expect(i, 'le compteur doit être remis à zéro après ouverture').toBeGreaterThan(-1);
        const zone = carte.slice(i, i + 260);
        expect(zone).toContain('ouvrirPanneau(id)');
    });

    it('la saisie et les commandes du bloc sont épargnées', () => {
        const i = carte.indexOf('var _dernierTap = 0;');
        const zone = carte.slice(i - 400, i + 900);
        expect(zone).toContain('isContentEditable');
        expect(zone).toMatch(/closest\('button, select, input, textarea/);
    });
});

describe('#444 · C — les familles de la palette sont des accordéons', () => {
    it('chaque étiquette de famille est un bouton avec aria-expanded', () => {
        const boutons = html.match(/<button type="button" class="planif-palette-zone-label" aria-expanded="/g) || [];
        expect(boutons.length, 'les 6 familles doivent être repliables').toBe(6);
    });

    it('le CSS masque le groupe d’une famille repliée', () => {
        expect(css).toMatch(/\.planif-palette-zone-label\[aria-expanded="false"\] \+ \.planif-palette-groupe \{[^}]*display:\s*none/);
    });

    it('l’étiquette reste une cible tactile confortable (≥ 36 px de haut)', () => {
        // ⚠ Sélecteur ancré en DÉBUT DE LIGNE : sans l'ancre, le motif tombait
        // sur `.planif-palette-categorie[data-zone="pourquoi"] .planif-palette-zone-label
        // { color: … }` — une règle de couleur, qui n'a évidemment pas de
        // min-height. Troisième fois dans la journée que la sous-chaîne piège :
        // une borne de slice doit être ancrée, toujours.
        //
        // ▣ 36 px et non 44, sur retour terrain du 10 août (« l'espace occupé
        // par les familles est trop grand »). Le compromis est explicite : la
        // règle des 44 px vise les petites cibles carrées, celle-ci fait TOUTE
        // LA LARGEUR de la palette (~200 px). Mesuré au navigateur : six
        // familles repliées passent de ~360 px à 291 px, soit 27 % de l'écran
        // iPad — c'est ce chiffre-là qui décidait du chantier.
        const regle = css.match(/^\.planif-palette-zone-label \{[^}]*\}/m);
        expect(regle, 'la règle de base de l’étiquette est introuvable').not.toBeNull();
        const min = regle[0].match(/min-height:\s*(\d+)px/);
        expect(min, 'plus de min-height : la cible tactile n’est plus garantie').not.toBeNull();
        expect(Number(min[1])).toBeGreaterThanOrEqual(36);
    });

    it('une famille repliée ne garde PAS le gabarit d’un bloc plein', () => {
        // Sans cette règle, le padding et le fond de la catégorie continuaient
        // d'occuper la place — six familles fermées prenaient presque autant
        // qu'ouvertes, et le repli ne servait à rien.
        expect(css).toMatch(
            /\.planif-palette-categorie:has\(\.planif-palette-zone-label\[aria-expanded="false"\]\) \{[^}]*padding:\s*0/
        );
    });

    it('l’état est persisté par une préférence DÉCLARÉE dans les DEFAUTS', () => {
        // Pas de clé sauvage : la préférence doit exister côté preferences.js,
        // sinon elle ne survit pas et personne ne le voit.
        expect(prefs).toContain('planifPaletteFamillesRepliees');
        expect(carte).toContain("definirPreference('planifPaletteFamillesRepliees'");
    });

    it('⚠ l’écrivain de préférence est le BON nom', () => {
        // Premier jet : `sauvegarderPreference`, qui n'existe pas — le garde
        // défensif sortait en silence, les familles se repliaient sans que
        // l'état soit jamais persisté. Un garde sur un nom inexistant ne
        // proteste pas : il avale. Trouvé au navigateur, pas au test.
        expect(carte).not.toContain('sauvegarderPreference(');
    });
});
