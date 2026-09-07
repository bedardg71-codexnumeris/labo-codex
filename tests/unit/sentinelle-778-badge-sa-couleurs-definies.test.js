/**
 * SENTINELLE #778 — LE BADGE « SA » A DES COULEURS QUI EXISTENT.
 *
 * Mesuré au navigateur le 7 septembre 2026 : `.badge-sa` (styles.css) déclarait
 * `background: var(--orange-clair)` et `color: var(--orange-fonce)`. Ni l'une ni
 * l'autre n'était définie NULLE PART dans le fichier — les deux déclarations
 * étaient donc ignorées par le navigateur, et le marqueur des Services adaptés
 * (index.html, résumé du groupe) rendait sans fond, en couleur héritée. Un
 * marqueur qui ne marque plus rien.
 *
 * Repris sur le patron d'un marqueur d'ÉTAT — fond de surface, bordure, texte
 * principal — le seul qui tienne dans les deux modes.
 *
 * ▣ LA GARDE GÉNÉRALE EXISTE DÉJÀ : `sentinelle-567-variables-css-fantomes`
 * tient la liste fermée des variables jamais définies (#595, 78 noms) avec leur
 * nombre d'usages, et c'est elle qui a exigé qu'on retire de `TOLEREES` les deux
 * noms réparés ici. Ce banc-ci ne la double pas : il dit ce que `.badge-sa` doit
 * être — des couleurs qui existent, redéfinies par les deux modes, et LISIBLES,
 * ce que le compte d'usages de #567 ne peut pas mesurer.
 *
 * Trois bords :
 *   A — les deux noms morts ne reviennent nulle part ;
 *   B — chaque variable qu'appelle `.badge-sa` est définie dans `:root` (la base
 *       de la cascade), et ses COULEURS sont redéfinies par `.mode-clair` ;
 *   C — le contraste texte/fond est CALCULÉ depuis ces définitions, dans les
 *       deux modes, et tient le minimum AA (4,5:1).
 *
 * BREAK-TESTS attendus : rendre `--orange-clair`/`--orange-fonce` à la règle →
 * A et B rougissent ; poser `--texte-principal: #2a4a58` dans `.mode-clair` →
 * C rougit en nommant le mode et le rapport obtenu.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const CSS = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
// Les commentaires séparent les déclarations : sans ce retrait, `--texte-principal`
// (précédé de `/* Texte */` dans .mode-clair) échappe à la lecture des valeurs.
const CSS_SANS_COMMENTAIRES = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/** Le corps de la règle `.badge-sa` (une seule dans le fichier). */
function regleBadgeSa() {
    const m = /(?:^|\})\s*\.badge-sa\s*\{([^}]*)\}/m.exec(CSS_SANS_COMMENTAIRES);
    return m ? m[1] : null;
}

/**
 * Le corps du PREMIER bloc portant ce sélecteur exact — la déclaration de base.
 * Les blocs homonymes plus bas vivent sous `@media` (impression, contraste
 * forcé) : ce ne sont pas les couleurs de l'écran courant.
 */
function bloc(selecteur) {
    const m = new RegExp('(?:^|\\})\\s*' + selecteur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'm')
        .exec(CSS_SANS_COMMENTAIRES);
    return m ? m[1] : '';
}

/** La valeur d'une variable telle que déclarée dans un bloc. */
function valeurDe(corps, nom) {
    const m = new RegExp('(?:^|;|\\n)\\s*' + nom + '\\s*:\\s*([^;]+)').exec(corps);
    return m ? m[1].trim() : null;
}

/** #rgb / #rrggbb → [r, g, b]. */
function versRgb(hex) {
    const h = hex.trim().replace('#', '');
    const p = h.length === 3 ? h.split('').map((c) => c + c) : [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)];
    return p.map((c) => parseInt(c, 16));
}

/** Luminance relative WCAG 2.1. */
function luminance([r, g, b]) {
    const c = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contraste(hexA, hexB) {
    const a = luminance(versRgb(hexA));
    const b = luminance(versRgb(hexB));
    const [clair, sombre] = a > b ? [a, b] : [b, a];
    return (clair + 0.05) / (sombre + 0.05);
}

describe('#778 · A — les deux noms morts ne reviennent pas', () => {
    it('`--orange-clair` et `--orange-fonce` ne sont ni définis ni appelés', () => {
        for (const nom of ['--orange-clair', '--orange-fonce']) {
            expect(CSS_SANS_COMMENTAIRES.includes(nom),
                nom + ' est revenu dans styles.css : il n\'y a jamais été DÉFINI, ' +
                'donc toute déclaration qui l\'appelle est ignorée en silence').toBe(false);
        }
    });
});

describe('#778 · B — `.badge-sa` n\'appelle que des variables qui existent', () => {
    it('la règle existe et porte un fond, une couleur et une bordure', () => {
        const corps = regleBadgeSa();
        expect(corps, '.badge-sa introuvable dans styles.css').not.toBeNull();
        expect(corps).toMatch(/background\s*:/);
        expect(corps).toMatch(/color\s*:/);
        expect(corps).toMatch(/border\s*:/);
    });

    it('chaque var() appelée est déclarée dans `:root`, la base de la cascade', () => {
        const appelees = [...(regleBadgeSa() || '').matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]);
        expect(appelees.length, 'la règle n\'appelle plus aucune variable').toBeGreaterThan(0);
        const sombre = bloc(':root');
        const manquantes = appelees.filter((nom) => !valeurDe(sombre, nom));
        expect(manquantes,
            'Ces variables sont appelées par .badge-sa sans être définies : la déclaration\n' +
            'est ignorée par le navigateur, en silence — c\'est exactement #778.\n  ' +
            manquantes.join('\n  ')).toEqual([]);
    });

    it('les COULEURS du badge, elles, sont redéfinies par `.mode-clair`', () => {
        // Un token de forme (rayon, espacement) se partage entre les modes ;
        // une couleur qui ne serait posée que dans `:root` rendrait le badge
        // sombre sur fond clair.
        const clair = bloc('.mode-clair');
        for (const nom of ['--surface-element', '--texte-principal', '--bordure-moyenne']) {
            expect(valeurDe(clair, nom), nom + ' n\'est pas redéfini par .mode-clair').toBeTruthy();
        }
    });
});

describe('#778 · C — le badge se lit dans les deux modes', () => {
    for (const [mode, selecteur] of [['sombre (défaut)', ':root'], ['clair', '.mode-clair']]) {
        it(`mode ${mode} : texte sur fond ≥ 4,5:1`, () => {
            const corps = bloc(selecteur);
            const fond = valeurDe(corps, '--surface-element');
            const texte = valeurDe(corps, '--texte-principal');
            expect(fond, '--surface-element introuvable dans ' + selecteur).toBeTruthy();
            expect(texte, '--texte-principal introuvable dans ' + selecteur).toBeTruthy();
            const rapport = contraste(texte, fond);
            expect(rapport, `contraste ${rapport.toFixed(2)}:1 en mode ${mode} ` +
                `(${texte} sur ${fond}) — sous le minimum AA`).toBeGreaterThanOrEqual(4.5);
        });
    }
});
