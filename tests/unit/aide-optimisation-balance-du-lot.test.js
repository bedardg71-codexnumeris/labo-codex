/**
 * L'aide survolée de l'étape « Optimisation » (décision de Grégoire, 27 nov. 2026, 15 h 20) — fiche 6 du lot
 * « Évaluation ». Depuis #598 volet B, la balance des blancs a sa case : l'aide qui la disait appliquée d'office en
 * disait trop case décochée. Texte validé par Grégoire, mot pour mot. Les deux lignes « Balance des blancs :
 * correction colorimétrique des photos prises en classe » (accompagnement-contenu-popup.js) restent telles quelles.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const TEXTE = 'Traitements appliqués aux images : balance des blancs si sa case est cochée, uniformisation DPI selon le sélecteur, compression JPEG. Les fichiers d\'un·e même étudiant·e pour une même production sont regroupés (multi-pages). Les PDF sont importés tels quels.';

describe('l\'aide survolée de l\'étape « Optimisation »', () => {
    it('dit la case : le texte validé par Grégoire, mot pour mot', () => {
        let entrees = null;
        chargerScript('js/accompagnement-contenu-hover.js', {}, { accompagnement: { ajouterEntrees: (e) => { entrees = e; } } });
        expect(entrees).toBeTruthy();
        const entree = entrees['travaux-pipeline-optimisation'];
        expect(entree && entree.hover).toBe(TEXTE);
    });

    it('les deux lignes de l\'aide détaillée restent telles quelles', () => {
        const popup = readFileSync(path.join(RACINE, 'js', 'accompagnement-contenu-popup.js'), 'utf8');
        // L'une porte une espace insécable avant le deux-points, l'autre une espace simple : les deux, telles quelles.
        expect((popup.match(/'Balance des blancs[ \u00a0]: correction colorimétrique des photos prises en classe'/g) || []).length).toBe(2);
    });
});
