/**
 * #1041 — LES ÉQUIPES DANS UN TRÈS PETIT GROUPE (Suivi › Animation).
 *
 * Décidé par Grégoire le 15 oct. 2026 à 13 h 24 : en mode « Des équipes plus grandes »,
 * chaque équipe reçoit AU PLUS UNE personne de plus que la taille demandée. Si ça ne
 * suffit pas à placer tout le monde, une équipe plus petite est formée à la place, et
 * l'écran le dit en une ligne. Motif : une équipe de 5 garde le dispositif demandé ; une
 * équipe de 7 n'est plus ce dispositif.
 *
 * Break-test (15 oct. 2026) : voir le journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const CODE = fs.readFileSync(path.resolve(__dirname, '../../js/equipes.js'), 'utf8');

function charger() {
    const win = {};
    vm.runInNewContext(CODE, { window: win, document: undefined });
    return win.EquipesLogique;
}

/** L'écran réel : rendreEquipes() dans un document minimal, n étudiant·es, une taille et un mode posés. */
function rendre(n, taille, modeReste) {
    const conteneur = { innerHTML: '' };
    const eleves = Array.from({ length: n }, (_, i) => ({ da: 'E' + i, prenom: 'Prénom' + i, nom: 'Fictif' }));
    const win = {
        echapperHtml: s => String(s),
        obtenirEtudiantsCoursActif: () => eleves,
    };
    const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
    const document = { getElementById: id => (id === 'equipes-contenu' ? conteneur : null), addEventListener() {} };
    let code = CODE;
    const fin = code.lastIndexOf('})();');
    code = code.slice(0, fin) + `
        ;window.__rendre = function(taille, mode) {
            rendreEquipes();
            etatEquipes.taille = taille; etatEquipes.modeReste = mode;
            rendreEquipes();
        };` + code.slice(fin);
    vm.runInNewContext(code, { window: win, document, db, echapperHtml: win.echapperHtml, obtenirEtudiantsCoursActif: win.obtenirEtudiantsCoursActif, console });
    win.__rendre(taille, modeReste);
    return conteneur.innerHTML;
}

describe('#1041 · au plus une personne de plus par équipe', () => {
    const L = charger();

    it('les trois cas de la décision : 7 en 4 → 4 et 3 ; 11 en 4 → 4, 4 et 3 ; 10 en 4 → 5 et 5', () => {
        expect(L.taillesEquipes(7, 4, 'agrandir')).toEqual([4, 3]);
        expect(L.taillesEquipes(11, 4, 'agrandir')).toEqual([4, 4, 3]);
        expect(L.taillesEquipes(10, 4, 'agrandir')).toEqual([5, 5]);
    });

    it('le plafond se lit : le reste dépasse le nombre d\'équipes complètes', () => {
        expect(L.agrandirPlafonne(7, 4)).toBe(true);
        expect(L.agrandirPlafonne(11, 4)).toBe(true);
        expect(L.agrandirPlafonne(5, 3)).toBe(true);
        expect(L.agrandirPlafonne(10, 4)).toBe(false);
        expect(L.agrandirPlafonne(27, 4)).toBe(false);
        expect(L.agrandirPlafonne(3, 4)).toBe(false);   // moins qu'une équipe : une seule équipe, pas un plafond
        expect(L.agrandirPlafonne(24, 4)).toBe(false);  // division exacte
    });

    it('cas limites inchangés : moins qu\'une équipe, division exacte, équipes de 2 avec un reste de 1, reste égal au nombre d\'équipes', () => {
        expect(L.taillesEquipes(3, 4, 'agrandir')).toEqual([3]);
        expect(L.taillesEquipes(24, 4, 'agrandir')).toEqual([4, 4, 4, 4, 4, 4]);
        expect(L.taillesEquipes(3, 2, 'agrandir')).toEqual([3]);
        expect(L.taillesEquipes(9, 2, 'petite')).toEqual([3, 2, 2, 2]);
        expect(L.taillesEquipes(27, 4, 'agrandir')).toEqual([5, 5, 5, 4, 4, 4]);
        expect(L.taillesEquipes(9, 4, 'agrandir')).toEqual([5, 4]);
        expect(L.taillesEquipes(8, 3, 'agrandir')).toEqual([4, 4]);
    });

    it('cas limites qui changent avec la décision : 5 en 3 → 3 et 2 (avant : 5) ; 11 en 3 → 3, 3, 3 et 2 (avant : 4, 4, 3)', () => {
        expect(L.taillesEquipes(5, 3, 'agrandir')).toEqual([3, 2]);
        expect(L.taillesEquipes(11, 3, 'agrandir')).toEqual([4, 4, 3]);   // reste 2 sur 3 équipes : inchangé
        expect(L.taillesEquipes(7, 3, 'agrandir')).toEqual([4, 3]);       // reste 1 sur 2 équipes : inchangé
    });

    it('balayage de 2 à 60, tailles 2-3-4 : jamais plus d\'une personne de plus, personne d\'oublié, aucune équipe d\'une personne', () => {
        const fautes = [];
        for (let n = 2; n <= 60; n++) {
            for (const t of [2, 3, 4]) {
                const tailles = L.taillesEquipes(n, t, 'agrandir');
                const somme = tailles.reduce((a, b) => a + b, 0);
                const unSeulGroupe = Math.floor(n / t) === 0;
                if (somme !== n || Math.min(...tailles) < 2 || (!unSeulGroupe && Math.max(...tailles) > t + 1)) {
                    fautes.push(`${n}/${t} → ${tailles.join(',')}`);
                }
            }
        }
        expect(fautes).toEqual([]);
    });
});

describe('#1041 · l\'écran le dit en une ligne', () => {

    it('7 en équipes de 4 : la ligne s\'affiche, et l\'option « plus grandes » annonce 4 et 3', () => {
        const html = rendre(7, 4, 'agrandir');
        expect(html).toContain('Au plus une personne de plus par équipe : il en reste trop, une équipe sera de 3.');
        expect(html).toMatch(/Des équipes plus grandes <span class="text-muted">\(1 de 4, 1 de 3\)/);
    });

    it('10 en équipes de 4 : tout le monde est placé, aucune ligne', () => {
        const html = rendre(10, 4, 'agrandir');
        expect(html).toContain('Des équipes plus grandes');
        expect(html).not.toContain('Au plus une personne de plus');
    });
});

// JOURNAL DES BREAK-TESTS — 15 oct. 2026, chaque mutation posée puis retirée (restauration par cp) :
//   1. retour à l'ancien agrandissement en boucle (`tailles[i % completes]`, sans plafond) ... rouge
//   2. la ligne retirée du rendu ................................................................ rouge
//   3. plafond à `reste >= completes` ........................................................... rouge
