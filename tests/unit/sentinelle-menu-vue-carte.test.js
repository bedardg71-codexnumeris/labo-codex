import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// MENU « VUE » DE LA CARTE — lot 1 du chantier de la carte d'alignement (8 oct. 2026).
//
// Ce que le banc navigateur (`planif-menu-vue.spec.js`) ne voit pas :
//   A. les cibles tactiles de l'iPad — WebKit au banc a un pointeur FIN, la
//      règle `@media (pointer: coarse)` n'y joue jamais ;
//   B. le retrait sans reste (zéro-dette) : règles CSS et écouteurs, partis
//      avec les boutons qu'ils servaient ;
//   C. la palette des raccourcis revenue en 1.192.1 (décision de Grégoire,
//      8 oct.) : ouverte par le menu, jamais par une icône de la barre, et sa
//      table rendue depuis RACCOURCIS_CARTE, pas écrite à la main.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const carte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

/** Corps de chaque bloc `@media (pointer: coarse) { … }` (accolades équilibrées). */
function blocsPointeurGrossier(source) {
    const blocs = [];
    let i = source.indexOf('@media (pointer: coarse)');
    while (i !== -1) {
        const ouvre = source.indexOf('{', i);
        let profondeur = 0, j = ouvre;
        for (; j < source.length; j++) {
            if (source[j] === '{') profondeur++;
            else if (source[j] === '}' && --profondeur === 0) break;
        }
        blocs.push(source.slice(ouvre + 1, j));
        i = source.indexOf('@media (pointer: coarse)', j);
    }
    return blocs.join('\n');
}

const grossierToutes = blocsPointeurGrossier(css);

describe('menu « Vue » · A — au doigt, 44 px', () => {
    const grossier = blocsPointeurGrossier(css);

    it('chaque commande du menu monte à 44 px ; le bouton « Vue ▾ » prend la hauteur de ses voisins de rangée', () => {
        // Lot 3 (9 oct. 2026, relecture de Cowork) : à 44 px, « Vue ▾ » dépassait seul
        // sur la deuxième rangée de l'iPad. Il suit la règle de ses voisins.
        const voisins = (css.match(/@media \(hover: none\) \{\s*\.planif-btn-palette \{ min-height: (\d+)px;/) || [])[1];
        expect(voisins).toBeDefined();
        const vue = (grossier.match(/#planif-btn-vue\s*\{[^}]*min-height:\s*(\d+)px/) || [])[1];
        expect(vue).toBe(voisins);
        expect(grossier).toMatch(/\.planif-vue-dropdown \.planif-action-item\s*\{[^}]*min-height:\s*44px/);
    });

    it('les pastilles de fond du menu sont celles qui montent déjà à 44 px (#568)', () => {
        expect(html).toMatch(/id="planif-fond-swatches"[\s\S]{0,200}class="travaux-fond-swatch"/);
        expect(grossier).toMatch(/\.travaux-fond-swatch\s*\{[^}]*width:\s*44px;\s*height:\s*44px/);
    });
});

describe('menu « Vue » · B — ce qu’il remplace est retiré, sans alias', () => {
    const retires = ['planif-btn-plein-ecran', 'planif-btn-recentrer', 'planif-btn-tout-voir',
        'planif-btn-fond', 'planif-fond-dropdown', 'planif-fond-picker',
        'planif-palette-raccourcis-btn'];

    it('aucun id retiré ne reste dans la page ni dans le module', () => {
        for (const id of retires) {
            expect(html, id).not.toContain('id="' + id + '"');
            expect(carte, id).not.toContain("'" + id + "'");
        }
    });

    it('aucune RÈGLE CSS ne vise un élément retiré (les commentaires peuvent les citer)', () => {
        expect(css).not.toMatch(/^\.planif-fond-picker\s*\{/m);
        expect(css).not.toMatch(/^\.planif-fond-dropdown[\s.{]/m);
        expect(css).not.toMatch(/^#planif-btn-recentrer[\s:{]/m);
    });

    it('⌘1 n’est plus branché ; R l’est, sans modificateur', () => {
        expect(carte).not.toMatch(/e\.key === '1'/);
        expect(carte).toMatch(/!e\.metaKey && !e\.ctrlKey && !e\.altKey && \(e\.key === 'r' \|\| e\.key === 'R'\)/);
    });
});

describe('palette des raccourcis · C — revenue, par le menu seul (1.192.1)', () => {
    it('sa table est vide dans la page : le JS la remplit depuis RACCOURCIS_CARTE', () => {
        expect(html).toMatch(/<table class="planif-raccourcis-table" id="planif-raccourcis-table"><\/table>/);
        expect(html).not.toMatch(/<kbd>⌘/);
        expect(carte).toMatch(/function rendreRaccourcisPalette\(\)[\s\S]{0,400}RACCOURCIS_CARTE\.forEach/);
    });

    it('au doigt, son repli et sa croix montent à 44 px', () => {
        expect(grossierToutes).toMatch(/\.planif-raccourcis-panel-replier,\s*\.planif-raccourcis-panel-fermer\s*\{[^}]*width:\s*44px;\s*height:\s*44px/);
    });
});
