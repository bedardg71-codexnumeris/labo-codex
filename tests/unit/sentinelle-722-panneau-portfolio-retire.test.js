import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #722 (11 oct. 2026) — l'ancien panneau de détail du portfolio (`chargerPortfolioEleveDetail`,
// `toggleArtefactPortfolio`, `toggleArtefactPortfolioFromEl`) est retiré : son conteneur
// `#portfolioEleveDetail` n'existait pas dans la page. `selectionnerArtefactsSelonModalite`
// reste (règle « Hybride » de Grégoire, banc #816).
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tous = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(path.join(racine, 'js', f), 'utf8')).join('\n');

describe('#722 · le panneau de détail du portfolio ne revient pas', () => {
    it('aucune des trois fonctions n\'est définie, aucun conteneur n\'est visé', () => {
        expect(tous).not.toMatch(/function (chargerPortfolioEleveDetail|toggleArtefactPortfolio|toggleArtefactPortfolioFromEl)\s*\(/);
        expect(tous).not.toMatch(/getElementById\('portfolioEleveDetail'\)/);
    });
    it('TÉMOIN · la règle de sélection reste exposée', () => {
        expect(tous).toMatch(/window\.selectionnerArtefactsSelonModalite = selectionnerArtefactsSelonModalite;/);
    });
});
