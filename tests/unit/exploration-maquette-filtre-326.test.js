import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #326 R1 — invariant « pas de maquette dans la sidebar ni la bibliothèque propre ».
// Helpers BibliothequeUI.estMaquette / filtrerParMaquette (miroir de estItemDemo /
// filtrerParModeDemo) + sentinelle statique : les sites de présentation des
// pratiques (sidebar + bibliothèque) appliquent bien le filtre.
// (Renommage R1 : « essai » → « maquette ».)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineJs = path.resolve(__dirname, '..', '..', 'js');

const win = chargerScript('js/bibliotheque-ui.js');
const BU = win.BibliothequeUI;

describe('#326 R1 · BibliothequeUI.estMaquette / filtrerParMaquette', () => {
    it('estMaquette vrai seulement si estMaquette === true (strict)', () => {
        expect(BU.estMaquette({ estMaquette: true })).toBe(true);
        expect(BU.estMaquette({ estMaquette: false })).toBe(false);
        expect(BU.estMaquette({})).toBe(false);
        expect(BU.estMaquette(null)).toBe(false);
        expect(BU.estMaquette({ estMaquette: 'true' })).toBe(false); // pas de coercition
    });

    it('filtrerParMaquette retire les maquettes, préserve l\'ordre des autres', () => {
        const items = [
            { id: 'a' },
            { id: 'b', estMaquette: true },
            { id: 'c', estMaquette: false },
            { id: 'd', estMaquette: true },
            { id: 'e' }
        ];
        expect(BU.filtrerParMaquette(items).map(p => p.id)).toEqual(['a', 'c', 'e']);
    });

    it('filtrerParMaquette tolère une entrée non-tableau', () => {
        expect(BU.filtrerParMaquette(null)).toBeNull();
        expect(BU.filtrerParMaquette(undefined)).toBeUndefined();
    });

    it('une pratique aboutie (sans flag) n\'est jamais masquée', () => {
        expect(BU.filtrerParMaquette([{ id: 'x' }])).toHaveLength(1);
    });
});

describe('#326 R1 · sentinelle : sidebar + bibliothèque filtrent les maquettes', () => {
    const SITES = [
        { fichier: 'pratiques.js', fn: 'afficherListePratiquesSidebar' },
        { fichier: 'pratiques-gestion.js', fn: 'afficherListePratiquesMateriel' },
        // ↻ #1156 (25 oct. 2026) : la fenêtre passe en deux colonnes ; ses données sont préparées par
        // `preparerDonneesBibliothequePratiques`, où le filtre vit désormais, UNE FOIS PAR COLONNE (`sites: 2`).
        // BREAK-TEST (25 oct.) : `filtrerParMaquette` retiré de la seule colonne « Dans ce trimestre » → ROUGE
        // (avant `sites: 2`, l'autre colonne suffisait à le garder vert).
        { fichier: 'pratiques-gestion.js', fn: 'preparerDonneesBibliothequePratiques', sites: 2 }
    ];

    it('chaque site de présentation des pratiques applique le filtre maquette', () => {
        const manquants = [];
        SITES.forEach(({ fichier, fn, sites }) => {
            const code = readFileSync(path.join(racineJs, fichier), 'utf8');
            const i = code.indexOf('function ' + fn);
            expect(i, `${fn} introuvable dans ${fichier}`).toBeGreaterThan(-1);
            // Corps approximatif : du début de la fonction aux ~2500 caractères suivants.
            const corps = code.slice(i, i + 2500);
            if (!/filtrerParMaquette|estMaquette\s*!==\s*true/.test(corps)) {
                manquants.push(`${fichier}:${fn}`);
            }
            if (sites && (corps.match(/filtrerParMaquette\(/g) || []).length < sites) {
                manquants.push(`${fichier}:${fn} (${sites} colonnes)`);
            }
        });
        expect(
            manquants,
            `Sites de présentation sans filtre de maquette (régression #326 R1) :\n${manquants.join('\n')}`
        ).toEqual([]);
    });
});
