/**
 * #1039 — GÉNÉRATEUR D'ÉQUIPES (Suivi › Animation) : LA LOGIQUE PURE.
 *
 * Décisions de Grégoire (7 oct. 2026) verrouillées ici :
 *   - le reste se règle par le choix de l'utilisateur : une équipe plus petite, ou des équipes agrandies ;
 *   - les absents du jour sont écartés (fiche du jour à 0 période ; un retard reste ; sans fiche, on garde) ;
 *   - des équipes retenues, on évite de refaire les mêmes paires.
 *
 * Break-test attendu : chaque clause muette rougit son cas (voir le rapport de session).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function charger() {
    const win = {};
    const code = fs.readFileSync(path.resolve(__dirname, '../../js/equipes.js'), 'utf8');
    vm.runInNewContext(code, { window: win, document: undefined });
    return win.EquipesLogique;
}

// Générateur pseudo-aléatoire déterministe (mulberry32).
function rngFixe(graine) {
    let a = graine;
    return function() {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const das = n => Array.from({ length: n }, (_, i) => 'E' + String(i + 1).padStart(2, '0'));

describe('#1039 · le reste de la division', () => {
    const L = charger();

    it('27 en équipes de 4 : six complètes, reste 3', () => {
        expect(L.analyserReste(27, 4)).toEqual({ completes: 6, reste: 3 });
    });

    it('« une équipe plus petite » : six de 4 et une de 3', () => {
        expect(L.taillesEquipes(27, 4, 'petite')).toEqual([4, 4, 4, 4, 4, 4, 3]);
    });

    it('« agrandir » : trois équipes de 5 et trois de 4', () => {
        expect(L.taillesEquipes(27, 4, 'agrandir')).toEqual([5, 5, 5, 4, 4, 4]);
    });

    it('division exacte : aucune équipe de reste, quel que soit le choix', () => {
        expect(L.taillesEquipes(24, 4, 'petite')).toEqual([4, 4, 4, 4, 4, 4]);
        expect(L.taillesEquipes(24, 4, 'agrandir')).toEqual([4, 4, 4, 4, 4, 4]);
    });

    it('moins d\'élèves qu\'une équipe : une seule équipe ; aucun élève : aucune équipe', () => {
        expect(L.taillesEquipes(3, 4, 'petite')).toEqual([3]);
        expect(L.taillesEquipes(3, 4, 'agrandir')).toEqual([3]);
        expect(L.taillesEquipes(0, 4, 'petite')).toEqual([]);
    });

    it('un reste plus grand que le nombre d\'équipes s\'agrandit en boucle', () => {
        // 7 en équipes de 4 : une complète, reste 3 → une seule équipe de 7.
        expect(L.taillesEquipes(7, 4, 'agrandir')).toEqual([7]);
    });
});

describe('#1039 · les absents du jour', () => {
    const L = charger();
    const eleves = [{ da: 'A' }, { da: 'B' }, { da: 'C' }, { da: 'D' }];

    it('0 période ce jour-là : écarté ; un retard (1 période) reste ; sans fiche, reste', () => {
        const presences = [
            { da: 'A', date: '2026-10-07', periodesPresentes: 0 },
            { da: 'B', date: '2026-10-07', periodesPresentes: 1 },
            { da: 'C', date: '2026-10-06', periodesPresentes: 0 }
        ];
        const r = L.separerAbsentsDuJour(eleves, presences, '2026-10-07');
        expect(r.absents.map(e => e.da)).toEqual(['A']);
        expect(r.retenus.map(e => e.da)).toEqual(['B', 'C', 'D']);
        expect(r.fichesDuJour).toBe(2);
    });

    it('fiche ancienne sans periodesPresentes : `heures` à 0 vaut absent', () => {
        const r = L.separerAbsentsDuJour(eleves, [{ da: 'D', date: '2026-10-07', heures: 0 }], '2026-10-07');
        expect(r.absents.map(e => e.da)).toEqual(['D']);
    });

    it('présences du jour non saisies : personne n\'est écarté, et on le sait (0 fiche)', () => {
        const r = L.separerAbsentsDuJour(eleves, [], '2026-10-07');
        expect(r.absents).toEqual([]);
        expect(r.fichesDuJour).toBe(0);
    });
});

describe('#1039 · former les équipes', () => {
    const L = charger();

    it('chaque élève est dans une et une seule équipe, aux tailles demandées', () => {
        const liste = das(27);
        const { equipes } = L.formerEquipes(liste, 4, 'petite', [], rngFixe(1));
        expect(equipes.map(e => e.length)).toEqual([4, 4, 4, 4, 4, 4, 3]);
        expect(equipes.flat().sort()).toEqual(liste);
    });

    it('le tirage dépend du hasard : deux graines, deux ordres', () => {
        const a = L.formerEquipes(das(12), 3, 'petite', [], rngFixe(1)).equipes;
        const b = L.formerEquipes(das(12), 3, 'petite', [], rngFixe(2)).equipes;
        expect(a).not.toEqual(b);
    });

    it('les paires d\'équipes retenues ne se refont pas quand c\'est possible', () => {
        const liste = das(8);
        const premieres = [['E01', 'E02'], ['E03', 'E04'], ['E05', 'E06'], ['E07', 'E08']];
        const deja = L.pairesDe(premieres);
        for (let graine = 1; graine <= 20; graine++) {
            const r = L.formerEquipes(liste, 2, 'petite', deja, rngFixe(graine));
            expect(r.pairesRefaites).toBe(0);
            const refaites = L.pairesDe(r.equipes).filter(p => deja.includes(p));
            expect(refaites).toEqual([]);
        }
    });

    it('les paires se notent sans égard à l\'ordre', () => {
        expect(L.pairesDe([['E02', 'E01']])).toEqual(L.pairesDe([['E01', 'E02']]));
    });
});
