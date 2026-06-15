import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #326 D-2b — sentinelle de sécurité : l'arbre d'exploration injecte des NOMS de
// pratiques de l'utilisateur dans innerHTML ; ils DOIVENT passer par _esc
// (echapperHtml) — règle non négociable (CLAUDE.md). Sentinelle statique car le
// rendu DOM (host.innerHTML) n'est pas exerçable dans le sandbox Node.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
    path.resolve(__dirname, '..', '..', 'js', 'comparateur-pratiques.js'), 'utf8'
);

// Isole le bloc d'exploration (entre le marqueur d'ouverture et la fin du module).
function blocExploration() {
    const i = src.indexOf("ARBRE D'EXPLORATION");
    expect(i, 'bloc ARBRE D\'EXPLORATION introuvable').toBeGreaterThan(-1);
    return src.slice(i);
}

describe('#326 D-2b · arbre — échappement des noms utilisateur', () => {
    it('le nom de pratique est toujours injecté via _esc', () => {
        const bloc = blocExploration();
        // Toute injection du nom passe par _esc(p.nom — jamais p.nom brut concaténé.
        expect(bloc).toMatch(/_esc\(p\.nom/);
        // Aucune concaténation brute d'un nom non échappé dans le HTML.
        expect(bloc).not.toMatch(/\+\s*p\.nom\s*\+/);
        expect(bloc).not.toMatch(/\$\{p\.nom\}/);
    });

    it('l\'id de pratique (attributs data-id) passe par _esc', () => {
        const bloc = blocExploration();
        expect(bloc).toMatch(/_esc\(p\.id\)/);
        expect(bloc).not.toMatch(/data-id="'\s*\+\s*p\.id\s*\+/); // pas d'id brut
    });

    it('l\'arbre consomme le moteur pur construireArbrePratiques (pas de second arbre)', () => {
        expect(blocExploration()).toMatch(/construireArbrePratiques/);
    });

    it('les actions délèguent aux fonctions d\'écriture de la couche pratiques', () => {
        const bloc = blocExploration();
        expect(bloc).toMatch(/deriverVarianteEssai/);
        expect(bloc).toMatch(/promouvoirPratiqueEssai/);
    });
});
