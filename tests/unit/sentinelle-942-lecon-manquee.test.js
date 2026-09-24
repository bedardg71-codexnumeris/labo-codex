import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #942 — PROFIL › ENGAGEMENT : CHAQUE ABSENCE NOMME LA LEÇON MANQUÉE.
//
// Demande de Grégoire (24 sept. 2026, captures du profil et de l'Inspecteur de sa leçon « La carte mentale »,
// S5, A, vendredi 18 septembre) : « les absences indiquent le titre de la leçon manquée ».
// Consigne : plans de travail/CONSIGNE-LECON-MANQUEE.md.
//
// Ce que ce banc garde :
//   1. `rangDeLaDate` est l'INVERSE EXACT de `dateDeLecon` (#695) sur la même table — pas une seconde résolution ;
//   2. chaque cas du § 1 de la consigne : aucune leçon, deux leçons au même rang, retard, leçon sans titre, congé,
//      séance déplacée ; deux groupes aux horaires différents (la même date donne deux leçons différentes) ;
//   3. les leçons viennent des cartes que la carte elle-même lit pour une production (`idsCartesDuCours`) ;
//   4. le profil résout le groupe DE L'ÉLÈVE comme le PDF (`groupeCoursIdDeLEleve`) et pose `lecons` sur
//      chaque absence de `obtenirDetailsAssiduite`, sans rien écrire.

const seance = (date, numeroSemaine) => ({ id: `S-${date}`, date, debut: '08:30', fin: '10:20', numeroSemaine });
function table(lignes) {
    const t = {};
    lignes.forEach(([date, sem, n = 1]) => { t[date] = Array.from({ length: n }, () => seance(date, sem)); });
    return t;
}

// Groupe 01 : mercredi + vendredi. Semaine 5 : les deux rencontres ; semaine 6 : le vendredi est un CONGÉ
// (absent de la table) ; semaine 7 : la séance du mercredi est DÉPLACÉE au jeudi (la table porte le jeudi),
// et le vendredi a deux périodes (deux séances le même jour = une seule rencontre).
const HORAIRE_01 = table([
    ['2026-09-16', 5], ['2026-09-18', 5],
    ['2026-09-23', 6],
    ['2026-10-01', 7], ['2026-10-02', 7, 2]
]);
// Groupe 02 : lundi + vendredi — le vendredi 18 septembre est SA séance B, comme au groupe 01, mais le lundi
// 14 est sa séance A.
const HORAIRE_02 = table([['2026-09-14', 5], ['2026-09-18', 5], ['2026-09-21', 6], ['2026-09-25', 6]]);

const noeud = (id, type, titre, metadata = {}) => ({ id, type, titre, parent: null, enfants: [], metadata });

const CARTE_COURS = {
    noeuds: [
        noeud('L1', 'lecon', 'La lecture active', { semaine: 5, rangSeance: 1 }),
        noeud('L2', 'lecon', 'La carte mentale', { semaine: 5, rangSeance: 2 }),
        noeud('L3', 'lecon', 'Le plan détaillé', { semaine: 6, rangSeance: 1 }),
        noeud('L4', 'lecon', 'Atelier de révision', { semaine: 6, rangSeance: 1 }),   // même rang que L3
        noeud('L5', 'lecon', '', { semaine: 7, rangSeance: 1 }),                      // sans titre
        noeud('L6', 'lecon', 'La dissertation', { semaine: 7, rangSeance: 2 }),
        noeud('L7', 'lecon', 'Non planifiée', {}),                                    // ni semaine ni rang
        noeud('L8', 'lecon', 'Semaine seule', { semaine: 6 }),                        // sans rang
        noeud('A1', 'activite', 'Une activité', { semaine: 5, rangSeance: 2 })        // pas une leçon
    ],
    liens: []
};
const CARTE_AUTRE_COURS = { noeuds: [noeud('X1', 'lecon', 'Philosophie : Platon', { semaine: 5, rangSeance: 2 })], liens: [] };
const CARTE_SANS_COURS = { noeuds: [noeud('Y1', 'lecon', 'Leçon orpheline', { semaine: 5, rangSeance: 2 })], liens: [] };

const INDEX = { active: 'c1', cartes: [{ id: 'c1', coursId: 'C1' }, { id: 'c2', coursId: 'C2' }, { id: 'c3' }] };
const CONTENUS = { c1: CARTE_COURS, c2: CARTE_AUTRE_COURS, c3: CARTE_SANS_COURS };

function monter({ index = INDEX, contenus = CONTENUS, horaires = { GC_01: HORAIRE_01, GC_02: HORAIRE_02 } } = {}) {
    const store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; }, get: async (k, d) => (k in store ? store[k] : d), set: async (k, v) => { store[k] = v; }
    };
    const ecritures = [];
    const pd = {
        getIndex: () => index,
        chargerCarte: (id) => contenus[id] || null,
        sauvegarderCarte: (...a) => { ecritures.push(a); },
        setDonnees: (...a) => { ecritures.push(a); }
    };
    const globaux = {
        db, cle: (k) => `a2026_${k}`, echapperHtml: (t) => String(t == null ? '' : t),
        obtenirSeancesCompletesDuGroupe: (gc) => horaires[gc] || {},
        obtenirCoursActifId: () => 'C1', GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {}, requestAnimationFrame: (fn) => { fn(); return 0; },
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {}, setAttribute() {} }),
            body: { appendChild() {}, classList: { add() {}, remove() {} } } }
    };
    const win = chargerScript('js/planification-carte.js', globaux);
    win.planificationDonnees = pd;
    chargerScript('js/planification-export.js', globaux, win);
    win.db = db; win.cle = globaux.cle;
    win.obtenirSeancesCompletesDuGroupe = globaux.obtenirSeancesCompletesDuGroupe;
    return { win, api: win.planificationExport, carte: win.planificationCarte, ecritures };
}

describe('#942 · date + groupe → leçon : l\'inverse de la date de l\'Inspecteur (#695), pas un second calcul', () => {

    it('`rangDeLaDate` est l\'inverse exact de `dateDeLecon` sur toute la table', () => {
        const { api } = monter();
        [HORAIRE_01, HORAIRE_02].forEach((h, i) => {
            const horaire = api.construireHoraireDeLecons(i === 0 ? 'GC_01' : 'GC_02');
            Object.keys(h).forEach(date => {
                const pos = api.rangDeLaDate(horaire, date);
                expect(pos, date).not.toBeNull();
                expect(api.dateDeLecon(horaire, pos.semaine, pos.rang)).toBe(date);
            });
        });
    });

    it('deux séances le même jour = une seule rencontre : le vendredi 2 oct. est la séance B de la semaine 7', () => {
        const { api } = monter();
        expect(api.rangDeLaDate(api.construireHoraireDeLecons('GC_01'), '2026-10-02')).toEqual({ semaine: 7, rang: 2 });
    });

    it('une date hors de l\'horaire du groupe (congé, jour sans cours) : null, aucune semaine devinée', () => {
        const { api } = monter();
        const h = api.construireHoraireDeLecons('GC_01');
        expect(api.rangDeLaDate(h, '2026-09-25')).toBeNull();   // le vendredi de la semaine 6 est un congé
        expect(api.rangDeLaDate(h, '2026-09-17')).toBeNull();   // un jeudi sans cours
        expect(api.rangDeLaDate(null, '2026-09-18')).toBeNull();
    });
});

describe('#942 · les cas du § 1 de la consigne, par le lecteur du groupe', () => {

    it('la capture de Grégoire : l\'absence du vendredi 18 sept. nomme « La carte mentale »', () => {
        const { api } = monter();
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-18')).toEqual(['La carte mentale']);
    });

    it('deux groupes aux horaires différents : la même date, deux leçons différentes', () => {
        const { api } = monter();
        // Le lundi 21 sept. : séance A de la semaine 6 pour le groupe 02 ; aucune séance pour le groupe 01.
        expect(api.lecteurLeconsDuGroupe('GC_02', 'C1')('2026-09-21')).toEqual(['Le plan détaillé', 'Atelier de révision']);
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-21')).toEqual([]);
        // Le mercredi 16 : séance A du groupe 01 ; le 16 n'est pas un jour de cours du groupe 02.
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-16')).toEqual(['La lecture active']);
        expect(api.lecteurLeconsDuGroupe('GC_02', 'C1')('2026-09-16')).toEqual([]);
        // Le lundi 14 : séance A du groupe 02.
        expect(api.lecteurLeconsDuGroupe('GC_02', 'C1')('2026-09-14')).toEqual(['La lecture active']);
    });

    it('deux leçons posées au même rang : les deux titres, dans l\'ordre de la carte', () => {
        const { api } = monter();
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-23')).toEqual(['Le plan détaillé', 'Atelier de révision']);
    });

    it('aucune leçon à cette date (congé) : aucun titre', () => {
        const { api } = monter();
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-25')).toEqual([]);
    });

    it('séance déplacée : la date réelle (jeudi 1er oct.) porte la leçon de la séance A', () => {
        const { api } = monter();
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-10-01')).toEqual(['Leçon sans titre']);
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-30')).toEqual([]);   // l'ancien mercredi
    });

    it('leçon sans titre : « Leçon sans titre », pas le silence ; une leçon sans semaine ou sans rang n\'est jamais citée', () => {
        const { api } = monter();
        expect(api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-10-02')).toEqual(['La dissertation']);
        const tous = Object.keys(HORAIRE_01).flatMap(d => api.lecteurLeconsDuGroupe('GC_01', 'C1')(d));
        expect(tous).not.toContain('Non planifiée');
        expect(tous).not.toContain('Semaine seule');
        expect(tous).not.toContain('Une activité');
    });

    it('groupe sans horaire, ou cours sans carte : aucun titre (rien d\'inventé)', () => {
        const { api } = monter();
        expect(api.lecteurLeconsDuGroupe('GC_INCONNU', 'C1')('2026-09-18')).toEqual([]);
        expect(api.lecteurLeconsDuGroupe(null, 'C1')('2026-09-18')).toEqual([]);
    });
});

describe('#942 · quelles cartes : la règle de la date d\'échéance, une seule', () => {

    it('les cartes du cours d\'abord ; jamais celle d\'un autre cours', () => {
        const { carte } = monter();
        const titres = carte.leconsSitueesDuCours('C1').map(l => l.titre);
        expect(titres).toContain('La carte mentale');
        expect(titres).not.toContain('Philosophie : Platon');
        expect(titres).not.toContain('Leçon orpheline');
    });

    it('seules les leçons SITUÉES (semaine ET séance) sortent : ni leçon sans rang, ni leçon non planifiée, ni activité', () => {
        const { carte } = monter();
        expect(carte.leconsSitueesDuCours('C1')).toEqual([
            { titre: 'La lecture active', semaine: 5, rang: 1 },
            { titre: 'La carte mentale', semaine: 5, rang: 2 },
            { titre: 'Le plan détaillé', semaine: 6, rang: 1 },
            { titre: 'Atelier de révision', semaine: 6, rang: 1 },
            { titre: '', semaine: 7, rang: 1 },
            { titre: 'La dissertation', semaine: 7, rang: 2 }
        ]);
    });

    it('à défaut de carte du cours : les cartes rattachées à aucun cours', () => {
        const { carte } = monter();
        expect(carte.leconsSitueesDuCours('C9').map(l => l.titre)).toEqual(['Leçon orpheline']);
    });

    it('la date d\'échéance proposée lit toujours les mêmes cartes (extraction sans changement de sens)', () => {
        const eval1 = { id: 'E1', type: 'evaluation', titre: 'Éval', parent: 'L2', enfants: [], metadata: { productionId: 'P1' } };
        const autre = { id: 'E2', type: 'evaluation', titre: 'Éval', parent: 'X1', enfants: [], metadata: { productionId: 'P1' } };
        const contenus = {
            c1: { noeuds: CARTE_COURS.noeuds.concat([eval1]), liens: [] },
            c2: { noeuds: CARTE_AUTRE_COURS.noeuds.concat([autre]), liens: [] },
            c3: CARTE_SANS_COURS
        };
        const { carte } = monter({ contenus });
        expect(carte.positionCarteDeLaProduction('P1', 'C1')).toMatchObject({ semaine: 5, rangSeance: 2, carteId: 'c1' });
        expect(carte.positionCarteDeLaProduction('P1', 'C9')).toBeNull();   // seule la carte sans cours, qui n'a pas P1
    });

    it('lecture seule : aucun appel d\'écriture pendant la lecture des leçons', () => {
        const { api, ecritures } = monter();
        api.lecteurLeconsDuGroupe('GC_01', 'C1')('2026-09-18');
        expect(ecritures).toEqual([]);
    });
});

describe('#942 · le profil : chaque absence de `obtenirDetailsAssiduite` porte ses leçons', () => {

    function monterProfil({ eleve = { da: '9000001', groupe: '01', coursId: 'C1' }, groupeNum01 = '01' } = {}) {
        const { win } = monter();
        const store = {
            a2026_indicesAssiduite: { sommatif: { '9000001': { periodesPresentes: 4, periodesOffertes: 8, nombreSeances: 4 } } },
            a2026_groupesCours: [{ id: 'GC_01', coursId: 'C1', groupeNum: groupeNum01 }, { id: 'GC_02', coursId: 'C1', groupeNum: '02' }],
            infoCours: { id: 'C1' }
        };
        const donnees = {
            groupeEtudiants: [eleve],
            groupesCours: store.a2026_groupesCours,
            presences: [
                // mercredi 16 : absent ; vendredi 18 : absent (0 pér.) ; mercredi 23 : retard (1 pér. sur 2).
                // ⚠ Le profil ne liste que les séances passées (`<= aujourd'hui`) : aucune date d'octobre ici.
                { da: '9000001', date: '2026-09-16', periodesPresentes: 0 },
                { da: '9000001', date: '2026-09-18', periodesPresentes: 0 },
                { da: '9000001', date: '2026-09-23', periodesPresentes: 1 }
            ]
        };
        const ecrites = [];
        const db = { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync: (k) => { ecrites.push(k); },
            get: async () => null, set: async (k) => { ecrites.push(k); } };
        const obtenirDonneesSelonMode = (k) => JSON.parse(JSON.stringify(donnees[k] || []));
        // La vraie règle de la liste des élèves (modes.js), recopiée à l'identique : `padStart(5, '0')`.
        const g = { db, cle: (k) => `a2026_${k}`, obtenirDonneesSelonMode, normaliserNumeroGroupe: (x) => String(x || '').padStart(5, '0') };
        chargerScript('js/synthese-retroaction-data.js', Object.assign({ travauxOutils: { AUTOCOLLANTS: [] } }, g), win);
        const horaireActif = {};
        Object.keys(HORAIRE_01).forEach(d => { if (d <= '2026-10-02') horaireActif[d] = HORAIRE_01[d]; });
        chargerScript('js/profil-etudiant-sections-affichage.js', Object.assign({
            obtenirSeancesCompletes: () => horaireActif, obtenirSeancesHoraire: () => [],
            obtenirNombrePeriodesSeance: () => 2, obtenirDureePeriode: () => 50, obtenirDateArrivee: () => null,
            echapperHtml: (t) => String(t)
        }, g), win);
        return { win, ecrites };
    }

    it('absence complète ET retard portent leur leçon', () => {
        const { win, ecrites } = monterProfil();
        const abs = win.obtenirDetailsAssiduite('9000001').absences.map(a => ({ date: a.date, lecons: a.lecons, pres: a.periodesPresence }));
        expect(abs).toEqual([
            { date: '2026-09-16', lecons: ['La lecture active'], pres: 0 },
            { date: '2026-09-18', lecons: ['La carte mentale'], pres: 0 },
            { date: '2026-09-23', lecons: ['Le plan détaillé', 'Atelier de révision'], pres: 1 }
        ]);
        expect(ecrites, 'aucune donnée écrite').toEqual([]);
    });

    it('le groupe est celui DE L\'ÉLÈVE : un élève du groupe 02 absent le vendredi 18 lit la leçon B de SA semaine', () => {
        // Même date, même séance B pour les deux groupes → même leçon ; les mercredis 16 et 23 ne sont pas des jours
        // du groupe 02 (les absences viennent de l'horaire ACTIF, celui du groupe 01 : aucune leçon n'y est devinée).
        const { win } = monterProfil({ eleve: { da: '9000001', groupe: '02', coursId: 'C1' } });
        const parDate = Object.fromEntries(win.obtenirDetailsAssiduite('9000001').absences.map(a => [a.date, a.lecons]));
        expect(parDate['2026-09-18']).toEqual(['La carte mentale']);
        expect(parDate['2026-09-23']).toEqual([]);
        expect(parDate['2026-09-16']).toEqual([]);
    });

    it('le numéro de groupe se compare NORMALISÉ, comme la liste des élèves : « 1 » trouve le groupe « 00001 »', () => {
        // Mesuré sur le pack démo le 24 sept. 2026 : élève « demo », groupe-cours « 0demo » → null en égalité stricte.
        const { win } = monterProfil({ eleve: { da: '9000001', groupe: '1', coursId: 'C1' }, groupeNum01: '00001' });
        expect(win.syntheseRetroactionData.groupeCoursIdDeLEleve('9000001')).toBe('GC_01');
        expect(win.obtenirDetailsAssiduite('9000001').absences.find(a => a.date === '2026-09-18').lecons).toEqual(['La carte mentale']);
    });

    it('élève sans groupe : les absences restent, sans titre', () => {
        const { win } = monterProfil({ eleve: { da: '9000001', coursId: 'C1' } });
        const abs = win.obtenirDetailsAssiduite('9000001').absences;
        expect(abs.length).toBe(3);
        abs.forEach(a => expect(a.lecons).toEqual([]));
    });
});
