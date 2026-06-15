import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #326 D-2 — invariant « pas d'essai dans la sidebar ni la bibliothèque propre ».
// Helpers BibliothequeUI.estEssai / filtrerParEssai (miroir de estItemDemo /
// filtrerParModeDemo) + sentinelle statique : les sites de présentation des
// pratiques (sidebar + bibliothèque) appliquent bien le filtre.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineJs = path.resolve(__dirname, '..', '..', 'js');

const win = chargerScript('js/bibliotheque-ui.js');
const BU = win.BibliothequeUI;

describe('#326 D-2 · BibliothequeUI.estEssai / filtrerParEssai', () => {
    it('estEssai vrai seulement si estEssai === true (strict)', () => {
        expect(BU.estEssai({ estEssai: true })).toBe(true);
        expect(BU.estEssai({ estEssai: false })).toBe(false);
        expect(BU.estEssai({})).toBe(false);
        expect(BU.estEssai(null)).toBe(false);
        expect(BU.estEssai({ estEssai: 'true' })).toBe(false); // pas de coercition
    });

    it('filtrerParEssai retire les essais, préserve l\'ordre des autres', () => {
        const items = [
            { id: 'a' },
            { id: 'b', estEssai: true },
            { id: 'c', estEssai: false },
            { id: 'd', estEssai: true },
            { id: 'e' }
        ];
        expect(BU.filtrerParEssai(items).map(p => p.id)).toEqual(['a', 'c', 'e']);
    });

    it('filtrerParEssai tolère une entrée non-tableau', () => {
        expect(BU.filtrerParEssai(null)).toBeNull();
        expect(BU.filtrerParEssai(undefined)).toBeUndefined();
    });

    it('une pratique aboutie (sans flag) n\'est jamais masquée', () => {
        expect(BU.filtrerParEssai([{ id: 'x' }])).toHaveLength(1);
    });
});

describe('#326 D-2 · sentinelle : sidebar + bibliothèque filtrent les essais', () => {
    const SITES = [
        { fichier: 'pratiques.js', fn: 'afficherListePratiquesSidebar' },
        { fichier: 'pratiques-gestion.js', fn: 'afficherListePratiquesMateriel' },
        { fichier: 'pratiques-gestion.js', fn: 'afficherBibliothequePratiques' }
    ];

    it('chaque site de présentation des pratiques applique le filtre estEssai', () => {
        const manquants = [];
        SITES.forEach(({ fichier, fn }) => {
            const code = readFileSync(path.join(racineJs, fichier), 'utf8');
            const i = code.indexOf('function ' + fn);
            expect(i, `${fn} introuvable dans ${fichier}`).toBeGreaterThan(-1);
            // Corps approximatif : du début de la fonction aux ~2500 caractères suivants.
            const corps = code.slice(i, i + 2500);
            if (!/filtrerParEssai|estEssai\s*!==\s*true/.test(corps)) {
                manquants.push(`${fichier}:${fn}`);
            }
        });
        expect(
            manquants,
            `Sites de présentation sans filtre d'essai (régression #326 D-2) :\n${manquants.join('\n')}`
        ).toEqual([]);
    });
});
