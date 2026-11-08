/**
 * #1243 (8 nov. 2026, suite du lot « Le graphique suit les présences », accord de Grégoire) — LES DEUX
 * GRAPHIQUES QUI LISENT LES CAPTURES SE LISENT À UNE SÉANCE, ET À DEUX SÉANCES PAR SEMAINE.
 *
 * Depuis le lot, chaque séance saisie a sa capture. Un groupe vu deux fois par semaine portait donc deux
 * points étiquetés « Sem. 2 » ; et sur un groupe neuf, le seul point se collait à l'axe vertical.
 *   · une semaine à une capture garde « Sem. N » ; une semaine à plusieurs captures écrit le jour et la date :
 *     « Sem. 2 · mar. 25 août » (jours et mois écrits par le module, pas par la langue du navigateur) ;
 *   · l'axe horizontal se décale d'une demi-colonne (`offset`) : le premier point s'écarte de l'axe.
 * Le Suivi du groupe (`creerGraphiqueGroupeSpaghettiACP`) et le profil (`creerGraphiqueIndividuel`).
 * Le rendu au navigateur : tests/integration/graphique-suit-les-presences.spec.js. Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const DA = '2000001';
const eleve = (A) => [{ da: '2000001', A, C: null, P: null }, { da: '2000002', A, C: null, P: null }];
const CAPTURES_GROUPE = [
    { numSemaine: 1, dateSeance: '2026-08-20', dateDebut: '2026-08-20', dateFin: '2026-08-20', etudiants: eleve(100) },
    { numSemaine: 2, dateSeance: '2026-08-25', dateDebut: '2026-08-25', dateFin: '2026-08-25', etudiants: eleve(100) },
    { numSemaine: 2, dateSeance: '2026-08-27', dateDebut: '2026-08-27', dateFin: '2026-08-27', etudiants: eleve(75) },
    { numSemaine: 3, dateSeance: '2026-09-01', dateDebut: '2026-09-01', dateFin: '2026-09-01', etudiants: eleve(80) }
];
const ATTENDUES = ['Sem. 1', 'Sem. 2 · mar. 25 août', 'Sem. 2 · jeu. 27 août', 'Sem. 3'];

function contexteMuet() {
    return new Proxy({ measureText: () => ({ width: 40 }) }, { get: (c, k) => (k in c ? c[k] : () => {}), set: () => true });
}

function rendre(captures, { profil = false } = {}) {
    const canvas = profil ? 'graphique-progression-' + DA : 'graphique-groupe-moyennes';
    const configs = [];
    const Chart = function (c, config) { configs.push(config); this.destroy = () => {}; };
    Chart.getChart = () => null;
    const b = monter(storeBase(), {
        elements: { [canvas]: elementDom({ id: canvas, parentNode: {}, ownerDocument: {}, getContext: () => contexteMuet() }) },
        globaux: {
            Chart,
            obtenirSnapshotsHebdomadaires: () => JSON.parse(JSON.stringify(captures)),
            obtenirSnapshotsEtudiant: () => captures.map((s) => ({ numSemaine: s.numSemaine, dateSeance: s.dateSeance, dateDebut: s.dateDebut, dateFin: s.dateFin, ...s.etudiants[0] })),
            obtenirTermeProduction: () => 'artefact', obtenirInterventionsEtudiant: () => [], toggleDisplay() {}
        },
        modules: ['js/graphiques-progression.js']
    });
    if (profil) b.win.creerGraphiqueIndividuel(canvas, DA); else b.win.creerGraphiqueGroupeSpaghettiACP(canvas, 'A');
    expect(configs.length, 'le graphique est construit').toBe(1);
    return configs[0];
}

describe('#1243 — le graphique du groupe se lit à une séance et à deux séances par semaine', () => {
    it('1. une semaine à deux séances : le jour et la date ; une semaine à une séance : « Sem. N »', () => {
        expect(rendre(CAPTURES_GROUPE).data.labels).toEqual(ATTENDUES);
    });
    it('2. une seule séance : « Sem. N », et le point s\'écarte de l\'axe (décalage d\'une demi-colonne)', () => {
        const config = rendre(CAPTURES_GROUPE.slice(1, 2));
        expect(config.data.labels).toEqual(['Sem. 2']);
        expect(config.options.scales.x.offset).toBe(true);
    });
});

describe('#1243 — le graphique du profil suit la même règle', () => {
    it('3. mêmes étiquettes, même décalage', () => {
        const config = rendre(CAPTURES_GROUPE, { profil: true });
        expect(config.data.labels).toEqual(ATTENDUES);
        expect(config.options.scales.x.offset).toBe(true);
    });
});

/*
 * BREAK-TESTS (8 nov. 2026) — sur la branche avant #1243 : 3 rouges sur 3 (étiquettes « Sem. 2 » répétées, pas de
 * décalage). Puis : l'étiquette du groupe revenue à `Sem. ${numSemaine}` → 1 ; le décalage retiré du groupe → 2 ;
 * l'étiquette ou le décalage retiré du profil → 3.
 */
