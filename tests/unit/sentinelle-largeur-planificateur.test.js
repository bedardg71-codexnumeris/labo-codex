import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE GÉOMÉTRIQUE DU PLANIFICATEUR (7 août 2026).
//
// Pourquoi elle existe — et pourquoi elle ne ressemble pas aux autres.
//
// Le « côte à côte » livré en 1.47.0 était INERTE. Le CSS était juste
// (flex + wrap sur la cellule, largeur plancher sur chaque bloc), la sentinelle
// de balisage était VERTE, et pourtant rien ne se mettait jamais côte à côte :
// la palette était plafonnée à 250 px, dont 44 px de chrome, soit 206 px utiles
// quand deux blocs en réclamaient 384. Aucun réglage ne pouvait l'atteindre —
// la palette n'était que déplaçable.
//
// Une sentinelle qui lit le BALISAGE ne peut pas voir ça : elle constate que le
// code est écrit, pas qu'il produit un effet. C'est très exactement
// « l'attestation n'est pas la preuve » (SKILL_verification_adverse).
//
// Celle-ci verrouille donc l'ARITHMÉTIQUE, seule chose qui décidait du résultat :
//
//     largeur par défaut − chrome  ≥  2 × plancher d'un bloc + gouttière
//
// Si quelqu'un resserre la palette, élargit le plancher d'un bloc, ou ajoute du
// padding, le côte à côte redevient impossible — et ce test rougit, alors que
// tous les tests de balisage resteraient verts.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

/**
 * Déclarations effectives d'un sélecteur, cascade respectée : on collecte TOUS
 * les blocs dont la liste de sélecteurs contient `selecteur`, dans l'ordre du
 * fichier, et la dernière déclaration l'emporte. Naïf mais suffisant ici — et
 * surtout : ça ne se laisse pas berner par un `#a, #b { }` groupé, qui est
 * précisément la forme qu'ont les règles de la palette.
 */
const cssSansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Scanner à profondeur d'accolades. Un `css.match(/[^{}]+\{[^{}]*\}/g)` ne suffit
 * PAS : le fichier contient des `@media` imbriqués, et le premier bloc imbriqué
 * décale tout ce qui suit — les sélecteurs suivants se lisent alors de travers.
 * (Premier jet de cette sentinelle : 7 échecs, tous de ce fait.)
 * Les at-rules sont traversées : leur contenu est aplati au même rang.
 */
function reglesDe(source) {
    const regles = [];
    let tampon = '';
    for (let i = 0; i < source.length; i++) {
        const c = source[i];
        if (c !== '{') { tampon += c; continue; }
        let profondeur = 1;
        let j = i + 1;
        while (j < source.length && profondeur > 0) {
            if (source[j] === '{') profondeur++;
            else if (source[j] === '}') profondeur--;
            if (profondeur > 0) j++;
        }
        const corps = source.slice(i + 1, j);
        const prelude = tampon.trim();
        if (prelude.startsWith('@')) regles.push(...reglesDe(corps));
        else regles.push({ selecteurs: prelude, corps: corps });
        tampon = '';
        i = j;
    }
    return regles;
}

const REGLES = reglesDe(cssSansCommentaires);

function declarations(selecteur) {
    const out = {};
    for (const regle of REGLES) {
        const liste = regle.selecteurs.split(',').map(s => s.trim());
        if (liste.indexOf(selecteur) === -1) continue;
        for (const decl of regle.corps.split(';')) {
            const i = decl.indexOf(':');
            if (i === -1) continue;
            const nom = decl.slice(0, i).trim();
            if (nom.indexOf('{') !== -1 || nom.indexOf('}') !== -1) continue;
            out[nom] = decl.slice(i + 1).trim();
        }
    }
    return out;
}

const px = v => {
    const m = /(-?[\d.]+)px/.exec(v || '');
    return m ? parseFloat(m[1]) : NaN;
};

describe('Sentinelle · géométrie du planificateur — le côte à côte doit être ATTEIGNABLE', () => {

    const palette = declarations('#planif-palette-nav');
    const bloc = declarations('.planif-grille-bloc');
    const contenu = declarations('.planif-nav-contenu');
    const numero = declarations('.planif-grille-num');
    const rangee = declarations('.planif-grille-rangee');
    const cellule = declarations('.planif-grille-cellule');

    // --- Volet 1 : les valeurs sont bien là où on croit ------------------

    it('la palette du planificateur déclare une largeur par défaut, un plancher et un plafond', () => {
        expect(px(palette.width)).toBeGreaterThan(0);
        expect(px(palette['min-width'])).toBeGreaterThan(0);
        expect(px(palette['max-width'])).toBeGreaterThan(0);
    });

    it('la largeur par défaut tient entre le plancher et le plafond', () => {
        expect(px(palette.width)).toBeGreaterThanOrEqual(px(palette['min-width']));
        expect(px(palette.width)).toBeLessThanOrEqual(px(palette['max-width']));
    });

    it('un bloc de grille déclare une largeur plancher', () => {
        expect(px(bloc['min-width'])).toBeGreaterThan(0);
    });

    // --- Volet 2 : L'ARITHMÉTIQUE — le cœur de cette sentinelle ----------

    /**
     * Chrome = tout ce qui est pris entre le bord de la palette et la zone où
     * les blocs se posent réellement. Mesuré sur le CSS, pas deviné :
     *   2  bordures de la palette
     * + 2× padding de .planif-nav-contenu
     * + la gouttière du numéro de semaine (flex-basis)
     * + le gap de la rangée, entre le numéro et la cellule
     */
    function chrome() {
        const base = declarations('#planif-palette');   // bordure : règle groupée
        const bordure = px(base.border) || 1;
        const padding = px(contenu.padding);
        const gouttiere = px(numero.flex);
        const gapRangee = px(rangee.gap);
        for (const [nom, v] of Object.entries({ padding, gouttiere, gapRangee })) {
            if (isNaN(v)) throw new Error('Valeur de chrome introuvable dans styles.css : ' + nom);
        }
        return 2 * bordure + 2 * padding + gouttiere + gapRangee;
    }

    /** Gouttière ENTRE deux blocs : second terme de `gap: <ligne> <colonne>`. */
    function gapColonne() {
        const parts = String(cellule.gap || '').trim().split(/\s+/);
        const v = px(parts.length > 1 ? parts[1] : parts[0]);
        if (isNaN(v)) throw new Error('gap de .planif-grille-cellule introuvable');
        return v;
    }

    it('DEUX blocs tiennent côte à côte à la largeur PAR DÉFAUT (sans aucun geste)', () => {
        const utile = px(palette.width) - chrome();
        const requis = 2 * px(bloc['min-width']) + gapColonne();
        expect(utile).toBeGreaterThanOrEqual(requis);
    });

    it('le plafond laisse de la marge au-delà de deux blocs — la poignée sert à quelque chose', () => {
        const utileMax = px(palette['max-width']) - chrome();
        const requis = 2 * px(bloc['min-width']) + gapColonne();
        expect(utileMax).toBeGreaterThan(requis);
    });

    it('la cellule autorise réellement le passage à la ligne (flex + wrap)', () => {
        expect(cellule.display).toBe('flex');
        expect(cellule['flex-wrap']).toBe('wrap');
    });

    // (Le volet « réserve en COLONNE » du 7 août est retiré avec la colonne
    // elle-même, le 8 oct. 2026 — lot 2 du chantier de la carte. La grille
    // dispose de nouveau de toute la largeur utile : le volet 2 suffit.)

    // --- Volet 3 : la poignée existe et est câblée ----------------------

    it('la poignée est dans le planificateur, pas ailleurs', () => {
        const debut = sourceIndex.indexOf('id="planif-palette-nav"');
        expect(debut).toBeGreaterThan(-1);
        const fenetre = sourceIndex.slice(debut, debut + 1200);
        expect(fenetre).toContain('planif-palette-poignee');
    });

    it('la poignée répond au POINTER (souris, doigt, Pencil) et non à la souris seule', () => {
        const i = sourceCarte.indexOf('paletteHandle.addEventListener(');
        expect(i).toBeGreaterThan(-1);
        expect(sourceCarte.slice(i, i + 60)).toContain('pointerdown');
        // Une poignée en mousedown serait inerte sur iPad — le travers connu de
        // la poignée des nœuds, à ne pas reproduire ici.
        expect(sourceCarte).not.toContain("paletteHandle.addEventListener('mousedown'");
    });

    it('la poignée a une cible de 44 px au doigt', () => {
        const bloc44 = /@media \(hover: none\) \{[^}]*\.planif-palette-poignee \{([^}]*)\}/.exec(css);
        expect(bloc44).not.toBeNull();
        expect(px(/width:([^;]*)/.exec(bloc44[1])[1])).toBeGreaterThanOrEqual(44);
        expect(px(/height:([^;]*)/.exec(bloc44[1])[1])).toBeGreaterThanOrEqual(44);
    });

    it('les bornes sont LUES dans le CSS, jamais redéclarées en dur dans le JS', () => {
        const i = sourceCarte.indexOf('var bornesPalette');
        expect(i).toBeGreaterThan(-1);
        expect(sourceCarte.slice(i, i + 400)).toContain('getComputedStyle');
    });

    it('le geste refige le bord DROIT — la palette s’élargit sur place, elle ne se déplace pas', () => {
        const i = sourceCarte.indexOf('paletteHandle.addEventListener(');
        const corps = sourceCarte.slice(i, i + 2600);
        expect(corps).toContain("palette.style.left = 'auto'");
        expect(corps).toMatch(/palette\.style\.right\s*=/);
        // Ancrée à droite, la largeur croît quand le pointeur va vers la GAUCHE.
        expect(corps).toContain('departX - e2.clientX');
    });

    it('le double-clic rend la main à la taille par défaut', () => {
        const i = sourceCarte.indexOf("paletteHandle.addEventListener('dblclick'");
        expect(i).toBeGreaterThan(-1);
        const corps = sourceCarte.slice(i, i + 400);
        expect(corps).toContain("palette.style.width = ''");
        expect(corps).toContain("paletteContenu.style.maxHeight = ''");
    });
});

describe('Sentinelle · libellés de case à cocher dans l’inspecteur', () => {

    // La règle générique `#planif-panneau label` impose display:block +
    // MAJUSCULES + gris à tout label de l'inspecteur. Portée par un ID, elle bat
    // une simple classe : sans rattrapage au même poids, la case et son texte
    // s'empilent et le texte de l'ENSEIGNANT s'affiche comme un titre de section.
    // Constat terrain du 7 août sur « Objectifs servis » (#403).

    it('la règle générique de l’inspecteur met bien les labels en majuscules (le piège existe)', () => {
        const generique = declarations('#planif-panneau label');
        expect(generique['text-transform']).toBe('uppercase');
        expect(generique.display).toBe('block');
    });

    it('le rattrapage est porté au poids d’un ID, sinon il ne s’applique pas', () => {
        // ⚠ Une simple recherche de la CHAÎNE ne suffit pas : au break-test, la
        // variante `.mode-clair #planif-panneau label.planif-checkbox-label`
        // (qui ne pose qu'une couleur) la satisfaisait alors que la règle
        // porteuse avait été retirée. On exige donc la règle PARSÉE.
        const rattrapage = declarations('#planif-panneau label.planif-checkbox-label');
        expect(Object.keys(rattrapage).length).toBeGreaterThan(0);
    });

    it('une case à cocher retrouve flex, casse normale et poids normal', () => {
        const rattrapage = declarations('#planif-panneau label.planif-checkbox-label');
        expect(rattrapage.display).toBe('flex');
        expect(rattrapage['text-transform']).toBe('none');
        expect(rattrapage['letter-spacing']).toBe('normal');
        expect(rattrapage['font-weight']).toBe('400');
    });

    it('le rattrapage vient APRÈS la règle générique — sinon, à poids égal, il perd', () => {
        expect(css.indexOf('#planif-panneau label.planif-checkbox-label'))
            .toBeGreaterThan(css.indexOf('#planif-panneau label {'));
    });

    it('les objectifs servis utilisent bien cette classe de case à cocher', () => {
        expect(sourceCarte).toContain('planif-checkbox-label planif-objectif-servi-ligne');
    });

    // ⚠ Le trou du 1er jet : la règle de LABEL avait été neutralisée, celle des
    // CHAMPS non. `#planif-panneau input` posait width:100% + padding:8px sur la
    // case, qui chassait son texte au bord droit du panneau. Deux règles
    // génériques portées par un ID, une seule neutralisée.

    it('la règle générique des champs étire bien tout input à 100 % (le second piège existe)', () => {
        const generique = declarations('#planif-panneau input');
        expect(generique.width).toBe('100%');
    });

    it('une case à cocher échappe à la largeur 100 % et au padding des champs', () => {
        const rattrapage = declarations('#planif-panneau label.planif-checkbox-label input[type="checkbox"]');
        expect(rattrapage.width).toBe('auto');
        // `0` sans unité est valide en CSS — px() exige un suffixe `px` et
        // renverrait NaN. Comparer la valeur normalisée.
        expect(parseFloat(rattrapage.padding)).toBe(0);
        expect(rattrapage.flex).toBe('0 0 auto');
    });

    it('le texte de l’objectif prend la place restante au lieu de déborder', () => {
        const span = declarations('#planif-panneau label.planif-checkbox-label > span');
        expect(span.flex).toBe('1 1 auto');
        expect(span['min-width']).toBe('0');
    });
});
