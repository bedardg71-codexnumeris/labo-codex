/**
 * #1244 (8 nov. 2026, décision de Grégoire) — UN EMOJI DEVIENT UN TAMPON, ET GARDE SES COULEURS.
 *
 * Le parcours (l'emoji tapé dans « ou un emoji », l'image PNG, le drapeau `emoji`, la phrase dans la synthèse, la
 * vignette non repeinte, la couleur de catégorie refusée) est joué au navigateur :
 * tests/integration/emojis-et-syntheses-papier.spec.js. Ce banc tient la règle de la teinte (`teinteDuTampon`, sur le
 * vrai module) et les lieux de dessin que la spec n'atteint pas sans copie importée :
 *   · la copie à l'écran (`travaux-annotation.js`) : la teinte de `teinteDuTampon` (aucune pour un emoji, même
 *     enregistrée sur un tampon posé avant), et pas d'inversion en mode sombre ;
 *   · la copie exportée (`travaux-export-pdf.js`) : la teinte de `teinteDuTampon` ;
 *   · la palette (`travaux-outils.js` + `styles.css`) : l'image d'un emoji n'est pas inversée ;
 *   · le partage des tampons : le drapeau part avec l'image, et revient à l'import.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** Le vrai module, avec un tampon-emoji (« EMO ») et une couleur pour la catégorie « observations ». */
function monterOutils() {
    const stock = {
        personnalisationObservations: { EMO: { nom: 'Étoile fictive', emoji: '🌟', imageBase64: 'data:image/png;base64,AAAA' } },
        couleursCategories: { observations: '#c62828' }
    };
    const win = { addEventListener() {}, removeEventListener() {} };
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    chargerScript('js/travaux-outils.js', { db: { ready: false, getSync: (k, d) => (k in stock ? stock[k] : d), setSync() {} }, Image: ImageStub }, win);
    return win.travauxOutils;
}

describe('#1244 — la teinte d\'un tampon posé, en un seul endroit', () => {
    it('0. un emoji n\'en a aucune, même enregistrée à la pose ; un tampon livré garde la sienne, ou prend celle de sa catégorie', () => {
        const o = monterOutils();
        expect(o.tamponGardeSesCouleurs('EMO')).toBe(true);
        expect(o.teinteDuTampon('EMO', '#123456'), 'la teinte enregistrée sur un tampon posé avant est ignorée').toBeNull();
        expect(o.teinteDuTampon('EMO')).toBeNull();
        expect(o.tamponGardeSesCouleurs('obs-hoc')).toBe(false);
        expect(o.teinteDuTampon('obs-hoc', '#123456'), 'témoin : la teinte enregistrée d\'un tampon livré').toBe('#123456');
        expect(o.teinteDuTampon('obs-hoc'), 'témoin : la couleur de sa catégorie').toBe('#c62828');
    });
});

describe('#1244 — chaque lieu de dessin laisse ses couleurs à un tampon-emoji', () => {
    it('1. la copie à l\'écran : sa teinte vient de `teinteDuTampon`, et l\'inversion du mode sombre est écartée', () => {
        const corps = tranche(lire('js/travaux-annotation.js'), '// Teinte de categorie : dessiner l\'image coloree', 'ctxAnnotation.drawImage(img, sx, sy, sw, sh);\n        }', { longueurMin: 400 });
        expect(corps).toContain('var gardeCouleurs = _outils().tamponGardeSesCouleurs(sticker.autocollantId);');
        expect(corps).toContain('var tint = _outils().teinteDuTampon(sticker.autocollantId, sticker.tint);');
        expect(corps).toMatch(/\} else if \(estModeSombre && !gardeCouleurs\) \{/);
        expect(corps, 'aucune autre source de teinte').not.toMatch(/sticker\.tint \|\||obtenirCouleurCategorieAutocollant/);
    });

    it('2. la copie exportée : sa teinte vient de `teinteDuTampon`', () => {
        const corps = tranche(lire('js/travaux-export-pdf.js'), '// Autocollants (avec teinte de categorie)', 'ctx.drawImage(img, sx, sy, sw, sh);', { longueurMin: 300 });
        expect(corps).toContain('const tint = travauxOutils.teinteDuTampon(stk.autocollantId, stk.tint);');
        expect(corps, 'aucune autre source de teinte').not.toMatch(/stk\.tint \|\||obtenirCouleurCategorieAutocollant/);
    });

    it('3. la palette : l\'image d\'un emoji porte sa classe, et la feuille de style ne l\'inverse pas', () => {
        expect(lire('js/travaux-outils.js')).toContain('(tamponGardeSesCouleurs(a.id) ? \' class="tampon-emoji"\' : \'\')');
        expect(lire('styles.css')).toMatch(/\.travaux-autocollant-item img\.tampon-emoji,\s*\.mode-clair \.travaux-autocollant-item\.actif img\.tampon-emoji \{\s*filter: none;/);
    });

    it('4. le partage des tampons : le drapeau part avec l\'image, et revient à l\'import', () => {
        const outils = lire('js/travaux-outils.js');
        expect(outils).toContain('emoji: (persObs[a.id] && persObs[a.id].emoji) || undefined,');
        expect(outils).toContain("if (typeof t.emoji === 'string' && t.emoji) persObj[t.id].emoji = t.emoji;");
    });
});

/*
 * BREAK-TESTS (8 nov. 2026) — chaque altération rend son essai rouge, puis retirée :
 *   `teinteDuTampon` rend la teinte enregistrée d'un emoji (garde retirée) → 0 ; l'écran reprend `sticker.tint ||` à
 *   côté de `teinteDuTampon` → 1 ; l'inversion du mode sombre rendue à l'emoji → 1 ; l'export reprend
 *   `stk.tint ||` → 2 ; la classe de la palette retirée → 3 ; le drapeau absent du partage → 4.
 * Au navigateur (emojis-et-syntheses-papier.spec.js, Chromium) : la couleur de catégorie rendue à l'emoji, la vignette
 * de la synthèse repeinte, le drapeau non enregistré : chacun rougit l'essai #1244 ; avec les fichiers d'avant, les
 * deux essais rougissent.
 */
