import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// LES PARCOURS ASSISTÉS SONT FERMÉS (15 nov. 2026, consigne relayée par Cowork).
// Un seul verrou, `PARCOURS_OUVERTS`, dans js/assistance.js : fermé, le registre rendu est vide (l'accueil et la fin
// de « Découvrir » n'y trouvent rien à lancer), `lancerParcours` refuse, le menu ne porte plus de rang.
// ⮕ Quand les parcours rouvrent (`PARCOURS_OUVERTS = true`), ce fichier part avec la fermeture.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

function chargerAssistance() {
    const rang = { textContent: 'jamais écrit' };
    const document = {
        readyState: 'complete',
        getElementById: (id) => (id === 'assistance-menu-rang' ? rang : null),
        addEventListener() {}, removeEventListener() {}
    };
    const win = chargerScript('js/assistance.js',
        { document, obtenirPreference: () => null, definirPreference() {} },
        { addEventListener() {}, removeEventListener() {} });
    return { A: win.Assistance, rang };
}

describe('les parcours assistés sont fermés (15 nov. 2026)', () => {
    it('le verrou est fermé dans le code livré, et il n’y en a qu’un', () => {
        const code = lire('js/assistance.js');
        expect(code.match(/var PARCOURS_OUVERTS = (true|false);/g)).toEqual(['var PARCOURS_OUVERTS = false;']);
    });

    it('fermés : un parcours inscrit n’est ni offert ni lancé, et le menu ne porte pas de rang', () => {
        const { A, rang } = chargerAssistance();
        let lances = 0;
        A.enregistrer({ id: 'classe', titre: 'Mettre ta classe en place', total: 3, lancer() { lances++; } });
        expect(A.parcoursOuverts()).toBe(false);
        expect(A.parcours()).toEqual([]);
        expect(A.lancerParcours('classe')).toBe(false);
        expect(lances).toBe(0);
        expect(rang.textContent).toBe('');
    });

    it('le code des parcours reste en place : rouverts (les bancs), le même parcours est offert et part', () => {
        const { A, rang } = chargerAssistance();
        let lances = 0;
        A.enregistrer({ id: 'classe', titre: 'Mettre ta classe en place', total: 3, lancer() { lances++; } });
        A.ouvrirLesParcours(true);
        expect(A.parcours().map((p) => p.id)).toEqual(['classe']);
        expect(rang.textContent).toBe('1 sur 1');
        expect(A.lancerParcours('classe')).toBe(true);
        expect(lances).toBe(1);
        A.ouvrirLesParcours(false);
        expect(A.lancerParcours('classe')).toBe(false);
        expect(lances).toBe(1);
    });

    it('les deux portes hors du panneau lisent le registre rendu, pas les définitions', () => {
        const accueil = lire('js/accueil.js');
        const decouvrir = lire('js/parcours-decouvrir.js');
        expect(accueil).toContain("window.Assistance.parcours().find(function(p) { return p.id === 'classe'; })");
        expect(decouvrir).toContain("window.Assistance.parcours().find(function (p) { return p.id === 'classe'; })");
        // Et le moteur ne lance un parcours suivant que par lancerParcours, qui porte le verrou.
        expect(lire('js/parcours-moteur.js')).toContain('window.Assistance.lancerParcours(suivant.id)');
    });

    it('le panneau fermé écrit « À venir » et ne construit pas la liste', () => {
        const code = lire('js/assistance.js');
        expect(code).toContain("var TEXTE_A_VENIR = 'À venir';");
        expect(code).toMatch(/if \(ouverts\) \{\s*var liste = document\.createElement\('ol'\);/);
    });
});
