import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LOT F, LE STOCK (décision de Grégoire, 29 sept. 2026, option b).
//
// Un codex actif d'avant le lot (état sans `temoinFiable`) est posé « pas à jour », une
// fois. Le banc WebKit `lot-f-stock-codex-pas-a-jour.spec.js` l'éprouve sur le vrai code,
// mais deux choses y dépendent d'une course entre la base et l'initialisation du codex :
//   - lequel des deux appels (lecture immédiate, relecture après db-ready #142) répond ;
//     retirer l'un seul laisse le banc vert, retirer les deux le rougit ;
//   - la persistance : écrite AVANT db-ready, la synchronisation IDB → cache du démarrage
//     réécrasait la marque par l'ancien état (mesuré une fois, pas à chaque passage).
// Ces deux points sont donc tenus ici, sur le texte.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'codex.js'), 'utf8');

function corpsDe(nom) {
    const debut = source.indexOf(`function ${nom}(`);
    expect(debut).toBeGreaterThan(-1);
    const suivante = source.indexOf('\nfunction ', debut + 1);
    const asynchrone = source.indexOf('\nasync function ', debut + 1);
    const fins = [suivante, asynchrone].filter((i) => i > -1);
    return source.slice(debut, fins.length ? Math.min(...fins) : undefined);
}

describe('Lot F, le stock : un codex d\'avant le lot est posé « pas à jour », une fois', () => {
    it('les trois lectures de l\'état au démarrage passent par la marque', () => {
        const init = corpsDe('initialiserCodex');
        expect(init).toContain('_marquerStockAvantLotF(etatSauve);');
        expect(init).toContain('_marquerStockAvantLotF(etatTardif);');
        expect(init).toContain('_marquerStockAvantLotF(etatMigre);');
    });

    it('la marque n\'est persistée qu\'après db-ready, et une seule fois', () => {
        const marque = corpsDe('_marquerStockAvantLotF');
        expect(marque).toContain('etatLu.temoinFiable) return;');
        expect(marque).toContain('window.auDbPret(_sauvegarderEtat);');
        expect(marque).not.toMatch(/^\s*_sauvegarderEtat\(\);/m);
    });

    it('tout état écrit par cette version porte le drapeau, renommage compris', () => {
        expect(corpsDe('_instantaneEtat')).toContain('temoinFiable: true');
        expect(corpsDe('_sauvegarderEtat')).toContain('db.setSync(CLE_ETAT_CODEX, _instantaneEtat());');
        expect(source).toContain('await db.set(CLE_ETAT_CODEX, _instantaneEtat());');
        // Aucune autre écriture de l'état ne construit l'objet à la main (elle perdrait le drapeau).
        expect(source.match(/db\.set(Sync)?\(CLE_ETAT_CODEX,\s*\{/g)).toBeNull();
    });
});
