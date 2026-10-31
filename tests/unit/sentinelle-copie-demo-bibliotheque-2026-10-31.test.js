import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// 31 oct. 2026 — le bouton « Garder » d'une copie faite en démo : un seul chemin d'écriture, le guidage
// dit vrai, et les quatre familles arrêtées à l'étape 0 ne reçoivent pas le geste en passant.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-31-copie-demo-bibliotheque.md. Le parcours : la spec WebKit.

const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');

function corps(source, debut) {
    const i = source.indexOf(debut);
    expect(i, debut).toBeGreaterThan(-1);
    return source.slice(i, source.indexOf('\n    };', i));
}

describe('la ligne de la copie de démo', () => {
    const ui = lire('js/bibliotheque-ui.js');
    const geste = corps(ui, 'BibliothequeUI.proposerGarderCopieDemo = function');

    it('n\'écrit rien : elle ne porte que l\'action de la rangée de la fenêtre', () => {
        expect(geste).not.toMatch(/db\.|importer|ajouter[A-Z]/);
        expect(geste).toContain('data-action="\' + echapperHtml(actionGarder)');
        expect(geste).toContain('data-param="\' + echapperHtml(copie.id)');
    });

    it('n\'existe qu\'en démo, et pour une copie', () => {
        expect(geste).toMatch(/modeDemoActif\(\) && !!copie && !!copie\.inspireDe && !BibliothequeUI\.estItemDemo\(copie\)/);
    });

    it('porte les mots proposés, et l\'état calme existant', () => {
        expect(geste).toContain('Cette copie reste dans la démo. Garde-la dans ta bibliothèque pour la retrouver dans tes vrais trimestres.');
        expect(geste).toContain('>Garder dans ma bibliothèque</button>');
        expect(geste).toContain('>Aussi dans ta bibliothèque</span>');
    });

    it('seule la grille l\'appelle : les quatre autres familles attendent la décision du rapport', () => {
        const appelants = ['echelles', 'cartouches', 'productions', 'productions-liste', 'productions-bibliotheque-ui', 'pratiques-gestion']
            .filter((m) => lire('js/' + m + '.js').includes('proposerGarderCopieDemo'));
        expect(appelants).toEqual([]);
        expect(lire('js/grilles.js')).toContain("'garderGrilleDansBibliotheque',\n        await obtenirToutesLesGrillesBibliotheque()");
    });
});

describe('le guidage', () => {
    it('ne promet la sortie de la démo qu\'à la grille', () => {
        const popup = lire('js/accompagnement-contenu-popup.js');
        expect(popup).toContain("Elle reste dans la démo\\u00a0: une nouvelle version du pack l'efface. Une copie de grille fait exception si tu la gardes dans ta bibliothèque\\u00a0: tu la retrouves alors dans tes vrais trimestres.");
        expect(popup).not.toContain('sauf si tu la gardes');
    });
});
