import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #368 (relais Cadre→Trimestre, 4 août 2026) — numérotation des
// semaines par « paquet de 5 » : numeroSemaine = ⌈rang du jour effectif ÷ 5⌉.
//
// GOLDEN MASTER : calendrier officiel du Cégep de Drummondville 2026-2027
// (adopté au CA du 27 janvier 2026), qui imprime le numéro de semaine EN
// INDICE sur chaque jour. Source versionnée dans le dépôt :
// « DE_Calendrier scolaire_26-27.pdf » (racine, committé par Grégoire le
// 5 août 2026). VÉRIFICATION INTÉGRALE faite le 5 août : les 15 paquets
// (75/75 jours) sont conformes aux indices imprimés — 7 paquets-ancres
// transcrits en séance Cowork le 4 août, les 8 autres confrontés au PDF
// le 5 août (dont S8 qui enjambe la pause : 9 oct puis 19-22 oct).
// Recoupements bonus : 10 sept imprimé « LUN₃ » et 13 nov « LUN₁₁ »
// (changements d'horaire du lundi = les deux reprises saisies).
// Le PDF n'a pas été écrit ici : c'est un juge que le code ne peut pas
// contaminer. Toute divergence future = régression du générateur.
//
// Le bug d'origine (comptage PAR RÔLE : n-ième lundi = semaine n) : recul
// ven 13 nov = sem 13 → lun 16 nov = sem 12, maxSemaine 17, une « semaine »
// d'un seul jour. Données A2026 réelles.

// Saisie A2026 réelle de Grégoire (bornes officielles + ses 2 congés)
const CADRE_A2026 = {
    dateDebut: '2026-08-20',
    finCours: '2026-12-11',
    finTrimestre: '2026-12-21',
    semainePlanificationDebut: '2026-10-12',
    semainePlanificationFin: '2026-10-16',
    semaineExamensDebut: '2026-12-14',
    semaineExamensFin: '2026-12-18'
};
const JOURNEES_A2026 = [
    { id: 'E1', dateEvenement: '2026-09-07', description: 'Fête du travail', categorie: 'ferie', horaireReprise: 'Lundi', dateReprise: '2026-09-10' },
    { id: 'E2', dateEvenement: '2026-11-09', description: 'Journée Carrière', categorie: 'institutionnel', horaireReprise: 'Lundi', dateReprise: '2026-11-13' }
];

// numeroSemaine attendu par date — LES 75 JOURS, tous vérifiés contre le PDF officiel.
const GOLDEN = {
    1: ['2026-08-20', '2026-08-21', '2026-08-24', '2026-08-25', '2026-08-26'],   // ANCRE
    2: ['2026-08-27', '2026-08-28', '2026-08-31', '2026-09-01', '2026-09-02'],   // ANCRE
    3: ['2026-09-03', '2026-09-04', '2026-09-08', '2026-09-09', '2026-09-10'],   // ANCRE — absorbe le férié du 7
    4: ['2026-09-11', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17'],   // ANCRE — démarre un vendredi
    5: ['2026-09-18', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'],
    6: ['2026-09-25', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01'],
    7: ['2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'],
    8: ['2026-10-09', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'],   // enjambe la pause 12-16 oct
    9: ['2026-10-23', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29'],
    10: ['2026-10-30', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'],
    11: ['2026-11-06', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'],  // ANCRE — saute le 9 nov
    12: ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'],  // ANCRE — le recul d'origine était ici
    13: ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'],
    14: ['2026-11-30', '2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04'],
    15: ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11']   // ANCRE
};

function genererA2026() {
    const store = {
        h2026_cadreCalendrier: CADRE_A2026,
        h2026_journeesSansCours: JOURNEES_A2026,
        h2026_horaires: []
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; }
    };
    const win = chargerScript('js/trimestre.js', { db, cle: (k) => 'h2026_' + k });
    return win.genererCalendrierComplet();
}

describe('#368 — golden master : le calendrier A2026 officiel, jour par jour', () => {
    const calendrier = genererA2026();

    it('les 75 jours portent EXACTEMENT les numéros du calendrier du cégep', () => {
        for (const [semaine, dates] of Object.entries(GOLDEN)) {
            for (const date of dates) {
                expect(calendrier[date]?.numeroSemaine,
                    `${date} devrait être en semaine ${semaine} (statut: ${calendrier[date]?.statut})`
                ).toBe(Number(semaine));
            }
        }
    });

    it('75 jours de cours, 15 semaines, 15 paquets de 5 exactement (rend le diviseur visible)', () => {
        const parSemaine = {};
        let joursCours = 0;
        Object.values(calendrier).forEach(j => {
            if (j.statut === 'cours' || j.statut === 'reprise') joursCours++;
            if ((j.statut === 'cours' || j.statut === 'reprise' || j.statut === 'jour-ouvrable') && j.numeroSemaine) {
                parSemaine[j.numeroSemaine] = (parSemaine[j.numeroSemaine] || 0) + 1;
            }
        });
        expect(joursCours).toBe(75);
        expect(Object.keys(parSemaine)).toHaveLength(15);
        Object.entries(parSemaine).forEach(([sem, nb]) => {
            expect(nb, `la semaine ${sem} devrait être un paquet de 5`).toBe(5);
        });
    });

    it('MONOTONIE : numeroSemaine ne recule jamais quand la date croît (le bug du 13→16 nov)', () => {
        const dates = Object.keys(calendrier).sort();
        let dernier = 0;
        for (const date of dates) {
            const n = calendrier[date].numeroSemaine;
            if (!n) continue;
            expect(n, `recul en ${date} : semaine ${n} après semaine ${dernier}`).toBeGreaterThanOrEqual(dernier);
            dernier = n;
        }
        // Le cas d'origine, nommément :
        expect(calendrier['2026-11-13'].numeroSemaine).toBe(11);
        expect(calendrier['2026-11-16'].numeroSemaine).toBe(12);
    });

    it('statuts préservés : férié du 7 sept = congé repris, reprise du 10 sept comptée à sa date', () => {
        expect(calendrier['2026-09-07'].statut).toBe('conge');
        // 19 nov. 2026 : la nature ne gouverne plus rien — plus de champ dérivé ;
        // une journée REPRISE ne porte ni nonReprise ni numéro de semaine.
        expect(calendrier['2026-09-07'].categorieEvenement).toBeUndefined();
        expect(calendrier['2026-09-07'].nonReprise).toBeUndefined();
        expect(calendrier['2026-09-07'].numeroSemaine).toBeUndefined();
        expect(calendrier['2026-09-10'].statut).toBe('reprise');
        expect(calendrier['2026-10-14'].statut).toBe('semaine-planification');
    });
});

// 19 nov. 2026 (lot « journées reprise », décision de Grégoire) : les deux blocs qui
// suivaient ici sont RETIRÉS. Le premier (« grève : congé institutionnel SANS
// reprise ») posait que la numérotation ne dépend pas des reprises ; la règle dit
// désormais l'inverse : une journée sort du compte si et seulement si elle est
// reprise. Le second (« le congé personnel compte ») tenait à l'étiquette, qui ne
// gouverne plus rien. Les deux cas vivent dans
// sentinelle-reprise-decide-du-calcul-2026-11-19.test.js, avec le cas vécu (grève
// des 10 et 13 nov.) jugé contre le même cadre A2026.
