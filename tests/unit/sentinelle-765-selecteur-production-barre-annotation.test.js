// SENTINELLE #765 — LE SÉLECTEUR DE PRODUCTION DE LA BARRE D'ANNOTATION LAISSE SON TEXTE ENTIER VISIBLE.
//
// Rapport de Grégoire, 6 septembre 2026, 10 h 01 (1.123.5, Chrome 152, Mac) : « Le texte du bouton est à
// moitié visible. » Capture : Évaluations › Annoter et évaluer, le sélecteur « Portrait de lecteur/lectrice
// (28) » coupé à mi-hauteur.
//
// CE QUI SE PASSAIT. `.annot-toolbar-production select` (styles.css) fixe `height: 28px` et `font-size: 12px`
// et compte sur `.travaux-filtre-production { padding: 4px 8px }` pour le padding. Or le bloc `<style>` de
// `index.html`, chargé APRÈS styles.css, redéclare `.controle-form { padding: 8px }` : à spécificité égale,
// le dernier gagne, et le sélecteur (classes `controle-form travaux-filtre-production`) reçoit 8 px en haut
// et en bas. Reste 28 − 2 − 16 = 10 px de contenu pour une police de 12 px : Chrome coupe le texte.
// Mesuré dans le Chrome de Grégoire le 6 septembre, cascade relevée par `document.styleSheets`.
//
// CE QUI EST GARDÉ. La règle du sélecteur, plus spécifique que `.controle-form`, porte elle-même son padding
// vertical (0), quel que soit l'ordre des feuilles ; et l'arithmétique de la boîte laisse au texte au moins
// 1,2 fois sa police, en tenant compte du padding que le bloc inline imposerait sinon.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '');
const css = sansCommentaires(fs.readFileSync(path.join(racine, 'styles.css'), 'utf8'));
const index = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
const blocInline = sansCommentaires(index.slice(index.indexOf('<style>'), index.indexOf('</style>')));

function bloc(texte, selecteur) {
    const re = new RegExp('(?:^|\\n)[ \\t]*' + selecteur.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}');
    const m = texte.match(re);
    return m ? m[1] : null;
}
function prop(corps, nom) {
    const m = corps.match(new RegExp('(?:^|;|\\n)\\s*' + nom + '\\s*:\\s*([^;]+)'));
    return m ? m[1].trim() : null;
}
function paddingVertical(corps) {
    // padding-top / padding-bottom explicites d'abord, sinon le raccourci `padding`.
    const haut = prop(corps, 'padding-top'), bas = prop(corps, 'padding-bottom');
    if (haut !== null && bas !== null) return parseFloat(haut) + parseFloat(bas);
    const court = prop(corps, 'padding');
    if (court === null) return null;
    const v = court.split(/\s+/).map(parseFloat);
    if (v.length === 1) return 2 * v[0];
    if (v.length === 2 || v.length === 3) return v[0] + (v.length === 3 ? v[2] : v[0]);
    return v[0] + v[2];
}

describe('#765 · le sélecteur de production de la barre d\'annotation laisse son texte visible', () => {
    const regle = bloc(css, '.annot-toolbar-production select');

    it('la règle du sélecteur existe dans styles.css et porte elle-même un padding vertical nul', () => {
        expect(regle, 'règle .annot-toolbar-production select absente de styles.css').not.toBeNull();
        const padV = paddingVertical(regle);
        expect(padV, 'la règle ne déclare pas son padding : elle hérite de .controle-form, que le bloc inline d\'index.html redéclare à 8 px').not.toBeNull();
        expect(padV).toBe(0);
    });

    it('la boîte laisse au texte au moins 1,2 fois sa police, même sous le .controle-form du bloc inline', () => {
        expect(regle).not.toBeNull();
        const hauteur = parseFloat(prop(regle, 'height'));
        const police = parseFloat(prop(regle, 'font-size'));
        expect(hauteur).toBeGreaterThan(0);
        expect(police).toBeGreaterThan(0);
        // Padding effectif : celui de la règle si elle en déclare un, sinon celui que le bloc inline impose.
        let padV = paddingVertical(regle);
        if (padV === null) {
            const inline = bloc(blocInline, '.controle-form');
            padV = inline ? (paddingVertical(inline) || 0) : 0;
        }
        const bordure = 2; // 1 px de chaque côté (.controle-form)
        const contenu = hauteur - bordure - padV;
        expect(contenu, `contenu vertical ${contenu} px pour une police de ${police} px`).toBeGreaterThanOrEqual(police * 1.2);
    });
});
