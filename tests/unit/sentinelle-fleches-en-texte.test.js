import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// CONSIGNE DU 31 OCT. 2026, PARTIE F — ↔ ET ↕ S'AFFICHENT PARTOUT COMME SUR MAC.
//
// Sur l'iPad, Safari dessine « ↕ » (U+2195) avec la police emoji : un carré bleu. Le sélecteur de présentation
// texte U+FE0E, déjà employé pour le crochet (✔︎), ramène la flèche simple. Ne comptent pas : les commentaires,
// les libellés de graphiques (consigne), et ce qui ne s'affiche jamais à l'écran (voir ADMIS).
const ADMIS = {
    'js/correlations-longitudinales.js': ' ↔ P',   // libellés du graphique
    'js/cours.js': 'COURS↔PÉRIODE',                // bloc de commentaire
    'js/evaluation-chargement.js': 'travaux-ui ↔', // bloc de commentaire
    'js/migration-diagnostic.js': 'fichierId↔',    // console
    'index.html': 'stroke-width="2"/></svg>'       // légende du graphique des corrélations
};
const FLECHE = /[↔↕]|\\u2194|\\u2195/g;
const SELECTEUR = /^(︎|\\uFE0E|&#xFE0E;)/;

function fautives(fichier) {
    const out = [];
    readFileSync(path.join(racine, fichier), 'utf8').split('\n').forEach((ligne, i) => {
        const t = ligne.trim();
        if (/^(\/\/|\*|\/\*|<!--)/.test(t)) return;
        if (fichier === 'index.html' && /\(↕\) s'atténue/.test(t)) return; // commentaire CSS, sur plusieurs lignes
        for (const m of ligne.matchAll(FLECHE)) {
            const avant = ligne.slice(0, m.index);
            if (/(^|\s)\/\//.test(avant) || (avant.includes('<!--') && !avant.includes('-->'))) continue;
            if (ADMIS[fichier] && ligne.includes(ADMIS[fichier])) continue;
            if (!SELECTEUR.test(ligne.slice(m.index + m[0].length))) out.push(`${fichier}:${i + 1}`);
        }
    });
    return out;
}

describe('↔ et ↕ s’affichent en texte, jamais en emoji', () => {
    const fichiers = ['index.html', ...readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f)];

    it('aucune flèche visible sans son sélecteur U+FE0E', () => {
        expect(fichiers.length).toBeGreaterThan(100);
        expect(fichiers.flatMap(fautives)).toEqual([]);
    });

    it('témoin : le banc voit bien les flèches qu’il juge', () => {
        const source = readFileSync(path.join(racine, 'js', 'travaux-outils.js'), 'utf8');
        expect(source.match(/\\u2194\\uFE0E/g).length).toBeGreaterThanOrEqual(4);
        expect(source.match(/\\u2195\\uFE0E/g).length).toBeGreaterThanOrEqual(2);
    });
});
