import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// REPORT DES PRÉSENCES VERS LE SIS (Léa / Omnivox) — 7 septembre 2026
// =======================================================================
//
// Cible : construireReportPresences (js/presences-transfert.js), fonction
// PURE qui inverse le modèle de grille #485 pour UNE séance.
//
// L'INVERSION EST LE CŒUR : Labo Codex compte les PRÉSENCES, Léa réclame
// les ABSENCES. Ce qui suit éprouve les trois cas arbitrés avec Grégoire
// le 7 sept. 2026, parce qu'aucun ne se réduit à une soustraction :
//
//   1. Aucune saisie pour l'élève à cette date → il ne DOIT PAS être
//      proposé comme absent. Codex ne sait pas s'il était absent ou si la
//      séance n'a pas été saisie jusqu'au bout. Un faux positif ici
//      atterrirait dans un dossier officiel.
//   2. Présence facultative (rattrapage RàI, #747) → jamais déduite de
//      l'absence, mais l'élève est signalé. La règle « un rattrapage
//      annule-t-il l'absence ? » est institutionnelle, pas technique.
//   3. Retard (présence partielle) → Léa met absence et retard dans le
//      même champ : la différence suffit.
// =======================================================================

let construireReport;
let construireModele;

const OPTS_MODELE = { coursId: 'C1', dureePeriode: 50 };

// Une seule séance, de deux périodes : le cas de Grégoire.
const SEANCES = {
    '2026-09-04': [{ numeroSemaine: 1, nombrePeriodes: 2 }]
};

const ETUDIANTS = [
    { da: '9000195', nom: 'A.', prenom: 'Yacine', coursId: 'C1' },
    { da: '9000183', nom: 'B.', prenom: 'Ludovic', coursId: 'C1' },
    { da: '9000196', nom: 'B.', prenom: 'Maélia', coursId: 'C1' }
];

beforeAll(() => {
    const fenetre = chargerScript('js/presences-rapport.js');
    chargerScript('js/presences-transfert.js', {}, fenetre);
    construireModele = fenetre.construireModeleRapportPresences;
    construireReport = fenetre.construireReportPresences;
});

/** Raccourci : présences brutes → report, en passant par le vrai modèle #485. */
function reporter(presences, options) {
    const modele = construireModele(ETUDIANTS, SEANCES, presences, OPTS_MODELE);
    return construireReport(modele, '2026-09-04', options);
}

describe('Inversion présences → absences', () => {
    it('une présence complète ne produit AUCUNE ligne à reporter', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.aReporter).toEqual([]);
        expect(r.nbPresents).toBe(3);
        expect(r.sansSaisie).toEqual([]);
    });

    it('une absence totale reporte les périodes de la séance, pas les périodes présentes', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 0, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.aReporter).toHaveLength(1);
        expect(r.aReporter[0].da).toBe('9000195');
        expect(r.aReporter[0].periodesAbsence).toBe(2);
        expect(r.aReporter[0].periodesPresentes).toBe(0);
    });

    it('un retard (1 période sur 2) reporte 1, la différence', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 1, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.aReporter).toHaveLength(1);
        expect(r.aReporter[0].periodesAbsence).toBe(1);
    });

    it('une demi-période se conserve (Léa accepte les décimales)', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 1.5, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.aReporter[0].periodesAbsence).toBe(0.5);
    });

    it('borne haute : une saisie négative ne reporte jamais plus que la séance', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: -3, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.aReporter[0].periodesAbsence).toBe(2);
    });
});

describe('Cas 1 — aucune saisie : Codex n’affirme rien', () => {
    it('un élève sans présence enregistrée va dans sansSaisie, JAMAIS dans aReporter', () => {
        // Seuls deux des trois élèves ont été saisis.
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 0, coursId: 'C1' }
        ]);

        expect(r.sansSaisie.map(e => e.da)).toEqual(['9000196']);
        // Le seul à reporter est celui dont l'absence a été SAISIE.
        expect(r.aReporter.map(e => e.da)).toEqual(['9000183']);
    });

    it('une séance entièrement non saisie ne propose aucune absence', () => {
        const r = reporter([]);
        expect(r.aReporter).toEqual([]);
        expect(r.sansSaisie).toHaveLength(3);
        expect(r.nbPresents).toBe(0);
    });
});

describe('Cas 2 — présence facultative (rattrapage RàI, #747)', () => {
    it('un rattrapage ne réduit pas l’absence au cours régulier', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 0, coursId: 'C1' },
            // Rattrapage le même jour : 2 périodes, facultatives.
            { date: '2026-09-04', da: '9000195', periodesPresentes: 2, coursId: 'C1', facultatif: true },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ], { dasFacultatifs: ['9000195'] });

        expect(r.aReporter).toHaveLength(1);
        expect(r.aReporter[0].periodesAbsence).toBe(2);
        // …mais l'élève est SIGNALÉ, pour que Grégoire tranche lui-même.
        expect(r.aReporter[0].rai).toBe(true);
    });

    it('sans rattrapage, aucun élève n’est marqué RàI', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 0, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-09-04', da: '9000196', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.aReporter[0].rai).toBe(false);
    });
});

describe('Séances sans périodes et dates hors modèle', () => {
    it('une date absente du modèle rend seanceIntrouvable, sans rien proposer', () => {
        const modele = construireModele(ETUDIANTS, SEANCES, [], OPTS_MODELE);
        const r = construireReport(modele, '2026-09-11', {});
        expect(r.seanceIntrouvable).toBe(true);
        expect(r.aReporter).toEqual([]);
        expect(r.sansSaisie).toEqual([]);
    });

    it('une séance à 0 période ne rend personne absent', () => {
        // L'horaire ne prévoit rien : `periodesAttendues` vaut 0 et nul ne peut
        // manquer une séance qui n'existe pas.
        const seancesVides = { '2026-09-04': [{ numeroSemaine: 1, nombrePeriodes: 0 }] };
        const modele = construireModele(ETUDIANTS, seancesVides, [
            { date: '2026-09-04', da: '9000195', periodesPresentes: 0, coursId: 'C1' }
        ], OPTS_MODELE);
        const r = construireReport(modele, '2026-09-04', {});
        expect(r.periodesAttendues).toBe(0);
        expect(r.aReporter).toEqual([]);
    });
});

describe('Ordre des lignes — celui de Léa, accents compris', () => {
    it('trie par nom puis prénom, en plaçant les accents à leur rang français', () => {
        const etudiantsAccentues = [
            { da: '3000003', nom: 'L.', prenom: 'Cédrick', coursId: 'C1' },
            { da: '3000002', nom: 'L.', prenom: 'Laurent', coursId: 'C1' },
            { da: '3000001', nom: 'Lafond', prenom: 'Amélie', coursId: 'C1' }
        ];
        const modele = construireModele(etudiantsAccentues, SEANCES, [
            { date: '2026-09-04', da: '3000001', periodesPresentes: 0, coursId: 'C1' },
            { date: '2026-09-04', da: '3000002', periodesPresentes: 0, coursId: 'C1' },
            { date: '2026-09-04', da: '3000003', periodesPresentes: 0, coursId: 'C1' }
        ], OPTS_MODELE);
        const r = construireReport(modele, '2026-09-04', {});

        // « Laguë » se classe entre « Lafond » et « Lebel », pas après le Z.
        expect(r.aReporter.map(e => e.nom)).toEqual(['Lafond', 'Laguë', 'Lebel']);
    });
});

describe('Comptes affichés', () => {
    it('nbTotal couvre tout le groupe, présents et sans-saisie compris', () => {
        const r = reporter([
            { date: '2026-09-04', da: '9000195', periodesPresentes: 0, coursId: 'C1' },
            { date: '2026-09-04', da: '9000183', periodesPresentes: 2, coursId: 'C1' }
        ]);
        expect(r.nbTotal).toBe(3);
        expect(r.nbPresents).toBe(1);
        expect(r.aReporter).toHaveLength(1);
        expect(r.sansSaisie).toHaveLength(1);
    });
});

describe('listerDasFacultatifs — appariement du coursId', () => {
    let lister;
    beforeAll(() => {
        const fenetre = chargerScript('js/presences-rapport.js');
        chargerScript('js/presences-transfert.js', {}, fenetre);
        lister = fenetre.listerDasFacultatifs;
    });

    it('ne retient que les présences facultatives de la date visée', () => {
        const das = lister([
            { date: '2026-09-04', da: '111', facultatif: true, coursId: 'C1' },
            { date: '2026-09-04', da: '222', coursId: 'C1' },
            { date: '2026-09-11', da: '333', facultatif: true, coursId: 'C1' }
        ], '2026-09-04', 'C1');
        expect(das).toEqual(['111']);
    });

    it('écarte une facultative d’un AUTRE groupe-cours', () => {
        const das = lister([
            { date: '2026-09-04', da: '111', facultatif: true, coursId: 'C2' }
        ], '2026-09-04', 'C1');
        expect(das).toEqual([]);
    });

    it('retient une facultative sans coursId (données d’avant le multi-cours)', () => {
        const das = lister([
            { date: '2026-09-04', da: '111', facultatif: true }
        ], '2026-09-04', 'C1');
        expect(das).toEqual(['111']);
    });
});
