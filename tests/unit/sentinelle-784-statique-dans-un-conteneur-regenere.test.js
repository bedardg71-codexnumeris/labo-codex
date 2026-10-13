import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { conteneursRegeneres } from './_helpers/conteneurs-regeneres.js';

// =====================================================================
// #784 — UN ÉLÉMENT STATIQUE DANS UN CONTENEUR QUE LE JS RÉÉCRIT (11 oct. 2026)
// =====================================================================
// Le bouton « Reporter dans Léa » (1.124.0) vivait dans le HTML statique d'un conteneur que
// `chargerTableauPresences` réécrivait : il disparaissait au premier rendu, et la mesure au
// navigateur, qui n'ouvrait pas l'écran par son vrai chemin, ne l'a pas vu. Ce CLIQUET fige les
// conteneurs du jour (9) ; un conteneur neuf, réécrit par innerHTML ET porteur d'éléments à id ou
// à data-action dans index.html, rougit. Un conteneur réglé sort de la liste.
// Mettre à jour : tests/fixtures/cliquets/conteneurs-regeneres-784.json.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fige = JSON.parse(readFileSync(path.join(racine, 'tests', 'fixtures', 'cliquets', 'conteneurs-regeneres-784.json'), 'utf8'));

// TRI DU LOT 23 (12 oct. 2026) — 9 → 2. Sept étaient des homonymes (une variable du même nom
// réécrite par une AUTRE fonction du fichier) : le détecteur cherche maintenant dans la portée
// de la déclaration. Les deux qui restent sont VOULUS, et voici pourquoi :
const VOULUS = {
    'carte-indicateurs-acpe': 'tableau-bord-apercu.js garde explicitement le titre, le panneau de suivi et la note (outerHTML) avant de réécrire ; les clics y sont délégués (closest)',
    conteneurRencontres: 'rencontres.js recrée lui-même #listeRencontres, le seul élément à id qu\'il loge'
};

describe('#784 · cliquet des conteneurs régénérés qui logent du statique', () => {
    const mesure = conteneursRegeneres(racine);
    it('chaque conteneur de la liste figée a sa raison écrite', () => {
        expect(fige.filter((c) => !VOULUS[c])).toEqual([]);
        expect(Object.keys(VOULUS).filter((c) => !fige.includes(c))).toEqual([]);
    });
    it('aucun conteneur neuf (mets le gabarit dans le JS, ou ne réécris que ce qui change)', () => {
        expect(mesure.filter((c) => !fige.includes(c))).toEqual([]);
    });
    it('la liste figée descend avec les corrections', () => {
        expect(fige.filter((c) => !mesure.includes(c))).toEqual([]);
    });
    it('TÉMOIN · l\'en-tête « Présence », réglé par #783, n\'y est plus', () => {
        expect(mesure).not.toContain('colonneHeuresTitre');
    });
});

describe('#784 · TÉMOIN POSITIF — le détecteur trouve le statique sous un conteneur réécrit', () => {
    it('sur un dépôt fabriqué : seul le conteneur réécrit ET porteur d\'un bouton à action est trouvé', () => {
        const d = mkdtempSync(path.join(tmpdir(), 'conteneurs-784-'));
        try {
            mkdirSync(path.join(d, 'js', 'pratiques'), { recursive: true });
            writeFileSync(path.join(d, 'index.html'), [
                '<div id="porteur"><div><button data-action="reporter">Reporter</button></div></div>',
                '<div id="vide"><p>Chargement…</p></div>',
                '<div id="non-reecrit"><button id="b">x</button></div>',
                '<div id="par-variable"><span id="compteur"></span></div>'
            ].join('\n'));
            writeFileSync(path.join(d, 'js', 'banc.js'), [
                "document.getElementById('porteur').innerHTML = '';",
                "document.getElementById('vide').innerHTML = '';",
                "const zone = document.getElementById('par-variable');",
                "zone.innerHTML = '<b>neuf</b>';"
            ].join('\n'));
            expect(conteneursRegeneres(d)).toEqual(['par-variable', 'porteur']);
        } finally { rmSync(d, { recursive: true, force: true }); }
    });
});
