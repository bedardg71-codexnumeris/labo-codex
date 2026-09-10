/**
 * SENTINELLE #811 — LA MODALE « JOURNAL DE BORD » A UN FOND.
 *
 * Rapporté par Grégoire le 9 septembre 2026 au soir, sur son iPad (Safari 26.6,
 * 1.127.3) : le journal de bord d'une évaluation s'affichait SANS PANNEAU. Le
 * contenu se lisait à même le voile de `.modal-overlay` (bleu à 65 % + flou), et
 * le tableau des évaluations le traversait — bandeau bleu, badges verts, boutons.
 * Illisible par bandes.
 *
 * UNE SEULE DÉCLARATION en était la cause : `.journal-modal { background:
 * var(--surface); }`. `--surface` n'était définie NULLE PART dans l'application,
 * et l'appel n'avait pas de valeur de repli — la déclaration était donc invalide,
 * et le fond restait transparent. Quatre autres `var()` du même bloc étaient dans
 * le même cas (`--bordure` ×3, `--avertissement`), et trois de plus ne tenaient
 * que par leur repli en dur (`--radius-lg`, `--radius-sm`, `--ombre-elevation-3`,
 * `--surface-hover`, `--surface-secondaire`, `--avertissement-fond`).
 *
 * Le bloc avait été écrit contre un jeu de noms qui n'est pas celui de l'app.
 * Il est repris sur `.modal-contenu`, le patron des panneaux de modale.
 *
 * ▣ CE BANC NE DOUBLE PAS `sentinelle-567-variables-css-fantomes`. Celle-là tient
 * le CLIQUET général (aucun fantôme neuf, aucun usage de plus, et depuis #811 les
 * usages SANS REPLI comptés à part). Celui-ci dit ce que la modale du journal doit
 * ÊTRE : un fond opaque, des couleurs qui existent dans les deux modes, et un
 * contenu lisible — ce qu'un compte d'usages ne peut pas mesurer.
 *
 * Quatre bords :
 *   A — les noms morts ne reviennent pas dans le bloc du journal ;
 *   B — chaque var() du bloc est définie dans `:root`, la base de la cascade ;
 *   C — `.journal-modal` porte un fond, et ce fond est une SURFACE (pas une
 *       couleur de texte, pas une bordure) redéfinie par `.mode-clair` ;
 *   D — les contrastes du journal sont CALCULÉS depuis styles.css, dans les deux
 *       modes, et tiennent AA (4,5:1).
 *
 * BREAK-TESTS attendus : rendre `background: var(--surface)` à `.journal-modal` →
 * A, B et C rougissent ; poser `--texte-principal: #3a5a68` dans `.mode-clair` →
 * D rougit en nommant le mode et le rapport obtenu.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const CSS = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
const CSS_SANS_COMMENTAIRES = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/** Le bloc du journal, des `.journal-*` jusqu'au composant suivant. */
function blocJournal() {
    const regles = [...CSS_SANS_COMMENTAIRES.matchAll(/(?:^|\})\s*(\.journal-[a-z-]+(?:[^{]*?))\{([^}]*)\}/gm)];
    return regles.map((m) => m[2]).join('\n');
}

/** Le corps du PREMIER bloc portant ce sélecteur exact. */
function bloc(selecteur) {
    const m = new RegExp('(?:^|\\})\\s*' + selecteur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'm')
        .exec(CSS_SANS_COMMENTAIRES);
    return m ? m[1] : '';
}

function valeurDe(corps, nom) {
    const m = new RegExp('(?:^|;|\\n)\\s*' + nom + '\\s*:\\s*([^;]+)').exec(corps);
    return m ? m[1].trim() : null;
}

function versRgb(hex) {
    const h = hex.trim().replace('#', '');
    const p = h.length === 3 ? h.split('').map((c) => c + c) : [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)];
    return p.map((c) => parseInt(c, 16));
}

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

describe('#811 · A — les noms morts ne reviennent pas', () => {
    it('`--surface`, `--ombre-elevation-3`, `--radius-lg` et `--surface-hover` ont disparu de styles.css', () => {
        // Ces quatre-là n'avaient qu'un usage chacun, tous dans le bloc du journal :
        // les réparer les a fait tomber à zéro. Ils ne doivent pas revenir.
        for (const nom of ['--surface-hover', '--ombre-elevation-3', '--radius-lg']) {
            expect(CSS_SANS_COMMENTAIRES.includes('var(' + nom),
                nom + ' est revenu : il n\'est DÉFINI nulle part').toBe(false);
        }
        // `--surface` est un préfixe de `--surface-carte` : il faut le borner.
        expect(/var\(\s*--surface\s*[,)]/.test(CSS_SANS_COMMENTAIRES),
            '--surface est revenu : c\'est LE nom qui a vidé le panneau du journal').toBe(false);
    });

    it('le bloc du journal n\'appelle plus les autres noms morts', () => {
        const corps = blocJournal();
        expect(corps.length, 'bloc du journal introuvable — les sélecteurs .journal-* ont-ils été renommés ?')
            .toBeGreaterThan(200);
        for (const nom of ['--bordure', '--avertissement', '--avertissement-fond', '--surface-secondaire', '--radius-sm']) {
            expect(new RegExp('var\\(\\s*' + nom + '\\s*[,)]').test(corps),
                nom + ' est appelé par le journal alors qu\'il n\'existe pas').toBe(false);
        }
    });
});

describe('#811 · B — le bloc du journal n\'appelle que des variables qui existent', () => {
    it('chaque var() du bloc est déclarée dans `:root`', () => {
        const appelees = [...new Set([...blocJournal().matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]))];
        expect(appelees.length, 'le bloc n\'appelle plus aucune variable').toBeGreaterThan(0);
        const sombre = bloc(':root');
        const manquantes = appelees.filter((nom) => !valeurDe(sombre, nom));
        expect(manquantes,
            'Appelées par le journal sans être définies — la déclaration est ignorée\n' +
            'par le navigateur, en silence, comme le fond du panneau l\'a été :\n  ' +
            manquantes.join('\n  ')).toEqual([]);
    });
});

describe('#811 · C — le panneau a un fond, et ce fond est une surface', () => {
    it('`.journal-modal` déclare un background, un rayon et une ombre', () => {
        const corps = bloc('.journal-modal');
        expect(corps, '.journal-modal introuvable').toBeTruthy();
        expect(corps, 'sans background, le journal se lit à même le voile de la modale').toMatch(/background\s*:/);
        expect(corps).toMatch(/border-radius\s*:/);
        expect(corps).toMatch(/box-shadow\s*:/);
    });

    it('le background pointe une variable de SURFACE, définie dans les deux modes', () => {
        const corps = bloc('.journal-modal');
        const m = /background\s*:\s*var\(\s*(--[a-z0-9-]+)/.exec(corps);
        expect(m, 'le fond du panneau n\'est plus posé par une variable de la palette').not.toBeNull();
        const nom = m[1];
        expect(nom.startsWith('--surface-'),
            'le fond du panneau doit être une surface, pas ' + nom).toBe(true);
        for (const [mode, selecteur] of [['sombre', ':root'], ['clair', '.mode-clair']]) {
            expect(valeurDe(bloc(selecteur), nom), nom + ' n\'est pas défini en mode ' + mode).toBeTruthy();
        }
    });
});

describe('#811 · D — le journal se lit dans les deux modes', () => {
    // texte → fond, tels que le bloc les apparie.
    const paires = [
        ['sous-titre, dates et état vide', '--texte-secondaire', '--surface-carte'],
        ['libellé d\'action', '--texte-principal', '--surface-carte'],
        ['puce de détail', '--texte-principal', '--surface-element'],
    ];
    for (const [mode, selecteur] of [['sombre (défaut)', ':root'], ['clair', '.mode-clair']]) {
        for (const [quoi, varTexte, varFond] of paires) {
            it(`mode ${mode} — ${quoi} : ≥ 4,5:1`, () => {
                const corps = bloc(selecteur);
                const texte = valeurDe(corps, varTexte);
                const fond = valeurDe(corps, varFond);
                expect(texte, varTexte + ' introuvable dans ' + selecteur).toBeTruthy();
                expect(fond, varFond + ' introuvable dans ' + selecteur).toBeTruthy();
                const rapport = contraste(texte, fond);
                expect(rapport,
                    `contraste ${rapport.toFixed(2)}:1 (${varTexte} sur ${varFond}) en mode ${mode}`)
                    .toBeGreaterThanOrEqual(4.5);
            });
        }
    }
});
