/**
 * #1248 (rapport de Grégoire, iPad, 5 nov. 2026, 16 h 22) — « Dans les réglages spécifiques, il faudrait que lorsque
 * l'utilisateur clique le bouton « annuler », l'application ne fait pas que rétablir l'affichage précédent, mais
 * rétablit également l'affichage des réglages par la palette des paramètres. »
 *
 * Reproduit sous WebKit le 8 nov. : après « Annuler » (deux fois), puis « Réinit. », les curseurs Luminosité,
 * Contraste, Exposition et Rotation fine gardaient leurs valeurs défaites ; au fichier suivant, ils gardaient celles du
 * fichier précédent. Une seule source : rien ne remettait la palette d'accord avec la pile d'opérations.
 *
 * Ce banc tient la règle (`reglagesDeLaPile`, sur le vrai module : la dernière opération de chaque sorte, ou 0) et les
 * trois gestes qui la rappellent. Sans navigateur : le poste de préparation dessine sur un canevas que jsdom n'a pas.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = readFileSync(path.join(RACINE, 'js/travaux-preparation.js'), 'utf8');

function monterPreparation() {
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/travaux-preparation.js', {}, win);
    return win.travauxPreparation;
}

describe('#1248 — ce que la palette montre pour une pile d\'opérations', () => {
    it('0. la dernière opération de chaque sorte, ou 0 quand il n\'y en a plus', () => {
        const { reglagesDeLaPile } = monterPreparation();
        expect(reglagesDeLaPile([])).toEqual({ luminosite: 0, contraste: 0, exposition: 0, rotationFine: 0 });
        const pile = [
            { type: 'brightness', value: 10 },
            { type: 'contrast', value: 20 },
            { type: 'brightness', value: 30 },
            { type: 'exposure', value: -5 },
            { type: 'rotation90', direction: 'cw' },
            { type: 'fineRotation', degrees: 2.5 }
        ];
        expect(reglagesDeLaPile(pile)).toEqual({ luminosite: 30, contraste: 20, exposition: -5, rotationFine: 2.5 });
        expect(reglagesDeLaPile(pile.slice(0, 3))).toEqual({ luminosite: 30, contraste: 20, exposition: 0, rotationFine: 0 });
        expect(reglagesDeLaPile(pile.slice(0, 2)), 'annuler la luminosité de 30 rend celle de 10, pas 0').toEqual({ luminosite: 10, contraste: 20, exposition: 0, rotationFine: 0 });
    });
});

describe('#1248 — les gestes qui remettent la palette d\'accord', () => {
    it('1. « Annuler », « Réinit. » et le changement de fichier rappellent la palette', () => {
        const annuler = tranche(SOURCE, 'function annulerDerniere() {', '\n    }', { longueurMin: 100 });
        const reinit = tranche(SOURCE, 'function reinitialiser() {', '\n    }', { longueurMin: 100 });
        const charger = tranche(SOURCE, 'async function chargerFichier(index) {', '// Charger l\'image', { longueurMin: 200 });
        expect(annuler).toContain('synchroniserPalette();');
        expect(reinit).toContain('synchroniserPalette();');
        expect(charger, 'après que la pile du nouveau fichier est en place').toMatch(/operations = f\.operations;[\s\S]*synchroniserPalette\(\);/);
    });

    it('2. la palette pose les quatre curseurs et le libellé de l\'exposition, à partir de la pile', () => {
        const corps = tranche(SOURCE, 'function synchroniserPalette() {', '\n    }', { longueurMin: 200 });
        expect(corps).toContain('reglagesDeLaPile(operations)');
        for (const id of ['prep-luminosite', 'prep-contraste', 'prep-exposition', 'prep-rotation-fine', 'prep-exposition-valeur']) {
            expect(corps).toContain(`'${id}'`);
        }
    });
});

/*
 * BREAK-TESTS (8 nov. 2026) — chaque altération rend son essai rouge, puis retirée :
 *   « Annuler » sans `synchroniserPalette()` → 1 ; `reglagesDeLaPile` qui lit la PREMIÈRE opération de chaque sorte → 0 ;
 *   le changement de fichier sans `synchroniserPalette()` → 1.
 * Au navigateur (WebKit, essai jetable non gardé) : avant le correctif, après deux « Annuler » puis « Réinit. », les
 * curseurs restaient à 30, 20, +0.5 EV, 3° ; après, ils suivent la pile (3° → 0 ; +0.5 EV → 0 ; tout à 0 ; le fichier
 * suivant, sans opération, part de 0).
 */
