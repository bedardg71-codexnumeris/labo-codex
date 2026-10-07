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

// Reste de 1 — tranché par Grégoire le 7 oct. 2026 à 12 h 42 : jamais d'équipe d'une seule personne.
describe('#1039 · reste de 1 : jamais d\'équipe d\'une personne', () => {
    const L = charger();

    it('équipes de 3 ou 4, « plus petites » : autant d\'équipes que nécessaire, tailles égales autant que possible', () => {
        expect(L.taillesEquipes(9, 4, 'petite')).toEqual([3, 3, 3]);
        expect(L.taillesEquipes(10, 3, 'petite')).toEqual([3, 3, 2, 2]);
        expect(L.taillesEquipes(5, 4, 'petite')).toEqual([3, 2]);
    });

    it('équipes de 3 ou 4, « plus grandes » : inchangé', () => {
        expect(L.taillesEquipes(9, 4, 'agrandir')).toEqual([5, 4]);
    });

    it('équipes de 2 : pas de question, une équipe de 3, quel que soit le mode reçu', () => {
        expect(L.resteDemande(9, 2)).toBe(false);
        expect(L.taillesEquipes(9, 2, 'petite')).toEqual([3, 2, 2, 2]);
        expect(L.taillesEquipes(9, 2, null)).toEqual([3, 2, 2, 2]);
    });

    it('la question n\'est posée que s\'il y a un reste, une équipe complète, et pas le cas « 2 avec reste 1 »', () => {
        expect(L.resteDemande(9, 4)).toBe(true);
        expect(L.resteDemande(27, 4)).toBe(true);
        expect(L.resteDemande(24, 4)).toBe(false);
        expect(L.resteDemande(3, 4)).toBe(false);
    });

    it('un reste de 2 ou plus ne change pas : « une équipe plus petite » garde l\'équipe du reste', () => {
        expect(L.taillesEquipes(27, 4, 'petite')).toEqual([4, 4, 4, 4, 4, 4, 3]);
        expect(L.taillesEquipes(10, 4, 'petite')).toEqual([4, 4, 2]);
    });

    it('balayage : de 2 à 60 étudiant·es, tailles 2-3-4, les deux modes — aucune équipe d\'une personne, personne d\'oublié', () => {
        const fautes = [];
        for (let n = 2; n <= 60; n++) {
            for (const t of [2, 3, 4]) {
                for (const mode of ['petite', 'agrandir']) {
                    const tailles = L.taillesEquipes(n, t, mode);
                    const somme = tailles.reduce((a, b) => a + b, 0);
                    if (Math.min(...tailles) < 2 || somme !== n) fautes.push(`${n}/${t}/${mode} → ${tailles.join(',')}`);
                }
            }
        }
        expect(fautes).toEqual([]);
    });

    it('par le tirage réel : aucune équipe d\'une personne', () => {
        for (let graine = 1; graine <= 10; graine++) {
            for (const t of [2, 3, 4]) {
                const { equipes } = L.formerEquipes(das(9), t, 'petite', [], rngFixe(graine));
                expect(Math.min(...equipes.map(e => e.length))).toBeGreaterThanOrEqual(2);
            }
        }
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
