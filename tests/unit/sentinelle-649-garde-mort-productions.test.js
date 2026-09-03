import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #649 (2 septembre 2026, soir) — UN GARDE MORT EST UNE BASCULE ARMÉE.
//
// `supprimerProductionDefinitivement` (onglet Données, `donnees-v2.js`) testait
// `typeof retirerProductionDeLaBibliotheque === 'function'` — un symbole que rien
// n'a jamais déclaré. Son « repli » (écriture directe de `bibliothequeProductions`)
// était donc l'unique chemin depuis toujours ; et le jour où quelqu'un aurait
// déclaré le nom attendu, la suppression aurait basculé EN SILENCE vers une
// sémantique que personne n'avait comparée.
//
// Ce que la sentinelle verrouille :
//   A — le symbole fantôme n'existe plus nulle part dans `js/` ;
//   B — la fonction appelle le chemin réel, `retirerDeLaBibliotheque`
//       (productions-bibliotheque.js), sans garde `typeof` ni repli ;
//   C — le témoin que #649 n'avait pas : ce chemin réel est DÉCLARÉ et EXPORTÉ ;
//   D — le résultat rendu est celui du chemin réel (vrai, faux, ou faux sur erreur).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const donneesV2 = nettoyer(lire('js/donnees-v2.js'));
const biblioProductions = lire('js/productions-bibliotheque.js');

function corps(src, nom) {
    let i = src.indexOf('function ' + nom + '(');
    expect(i, nom + ' doit exister').toBeGreaterThan(-1);
    // Une fonction `async` garde son mot-clé : sans lui, ses `await` ne compilent pas.
    if (src.slice(Math.max(0, i - 6), i) === 'async ') i -= 6;
    let j = i, prof = 0, vu = false;
    for (; j < src.length; j++) {
        if (src[j] === '{') { prof++; vu = true; }
        else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
    }
    return src.slice(i, j + 1);
}

function instancier(src, nom, globaux) {
    const noms = Object.keys(globaux);
    const fabrique = new Function(...noms, corps(src, nom) + '\nreturn ' + nom + ';');
    return fabrique(...noms.map(n => globaux[n]));
}

function fichiersJs(dossier) {
    const resultats = [];
    for (const entree of readdirSync(dossier)) {
        const chemin = path.join(dossier, entree);
        if (statSync(chemin).isDirectory()) resultats.push(...fichiersJs(chemin));
        else if (entree.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

describe('#649 · A — le symbole fantôme a disparu de js/', () => {
    it('retirerProductionDeLaBibliotheque : zéro occurrence dans le code (les commentaires peuvent raconter l\'histoire)', () => {
        const porteurs = fichiersJs(path.join(racineProjet, 'js'))
            .filter(f => nettoyer(readFileSync(f, 'utf8')).includes('retirerProductionDeLaBibliotheque'))
            .map(f => path.relative(racineProjet, f));
        expect(porteurs).toEqual([]);
    });
});

describe('#649 · B — un seul chemin, nommé, sans garde ni repli', () => {
    it('supprimerProductionDefinitivement (Données) appelle retirerDeLaBibliotheque et rien d\'autre', () => {
        const c = corps(donneesV2, 'supprimerProductionDefinitivement');
        expect(c).toContain('retirerDeLaBibliotheque(productionId)');
        expect(c).not.toContain('typeof');
        expect(c).not.toContain('bibliothequeProductions');
        expect(c).not.toMatch(/db\.(get|getSync|set|setSync|modifier)\(/);
    });
});

describe('#649 · C — le témoin : le chemin réel existe', () => {
    it('retirerDeLaBibliotheque est déclarée ET exportée par productions-bibliotheque.js', () => {
        expect(biblioProductions).toContain('async function retirerDeLaBibliotheque(');
        expect(biblioProductions).toContain('window.retirerDeLaBibliotheque = retirerDeLaBibliotheque');
    });
});

describe('#649 · D — le résultat rendu est celui du chemin réel', () => {
    const fabriquer = (retirer) => instancier(donneesV2, 'supprimerProductionDefinitivement', {
        retirerDeLaBibliotheque: retirer,
        console: { error: () => {} }
    });

    it('vrai quand la bibliothèque a retiré la production', async () => {
        const appels = [];
        const fn = fabriquer(async (id) => { appels.push(id); return true; });
        await expect(fn('P1')).resolves.toBe(true);
        expect(appels).toEqual(['P1']);
    });

    it('faux quand la production n\'y était pas — le repli d\'avant rendait toujours vrai', async () => {
        await expect(fabriquer(async () => false)('P1')).resolves.toBe(false);
    });

    it('faux, sans jeter, quand la file jette', async () => {
        await expect(fabriquer(async () => { throw new Error('boum'); })('P1')).resolves.toBe(false);
    });
});
