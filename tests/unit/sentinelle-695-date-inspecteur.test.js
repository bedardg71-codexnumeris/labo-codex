import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// LA DATE DANS L'INSPECTEUR (#695, élargie à l'évaluation le 22 sept. 2026).
//
// Ce que Grégoire a demandé : voir, dans l'Inspecteur d'une leçon ET de
// l'évaluation qu'elle contient, la date réelle où elle aura lieu. Ce qu'il a
// tranché : plusieurs groupes = une ligne par groupe, sans groupe « actif ».
//
// Ce que ce banc garde :
//   1. chaque cas de la consigne (tableau 4b) rend SA phrase, et jamais une
//      date devinée ;
//   2. deux groupes aux jours différents rendent deux dates différentes ;
//   3. l'Inspecteur n'a pas de calcul de date à lui (zéro-dette : pas de
//      quatrième copie) et sa ligne suit les gestes par `sauvegarder()` ;
//   4. l'export et `productions.js` rendent la même date pour le même
//      (groupe, semaine, rang) — mesure demandée par la consigne.

let store;

function fauxDb() {
    return {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
}

/** Une séance telle que `genererSeancesCompletes` la produit. */
function seance(date, numeroSemaine) {
    return { id: `S-${date}`, date, debut: '08:30', fin: '10:20', numeroSemaine };
}

function table(dates) {
    const t = {};
    dates.forEach(([date, sem]) => { t[date] = [seance(date, sem)]; });
    return t;
}

// Groupe 01 : lundi + mercredi. Groupe 02 : mardi + jeudi, et un congé le
// jeudi 1er octobre — sa semaine 5 n'a qu'UNE rencontre.
const HORAIRE_01 = table([
    ['2026-09-28', 5], ['2026-09-30', 5], ['2026-10-05', 6], ['2026-10-07', 6]
]);
const HORAIRE_02 = table([
    ['2026-09-29', 5], ['2026-10-06', 6], ['2026-10-08', 6]
]);

function monterExport(horaires = {}, groupesCours = []) {
    store['a2026_groupesCours'] = groupesCours;
    const win = chargerScript('js/planification-export.js', {
        db: fauxDb(),
        cle: (k) => `a2026_${k}`,
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} }
    });
    win.db = fauxDb();
    win.cle = (k) => `a2026_${k}`;
    win.obtenirSeancesCompletesDuGroupe = (gc) => horaires[gc] || {};
    return win.planificationExport;
}

const GC_01 = { id: 'GC_01', coursId: 'C1', nom: 'A2026-601-101-MQ-01 (Lun, Mer)', groupeNum: '01' };
const GC_02 = { id: 'GC_02', coursId: 'C1', nom: 'A2026-601-101-MQ-02 (Mar, Jeu)', groupeNum: '02' };

function lignes(api, coursId, semaine, rang, extra = {}) {
    return api.lignesDateDeLecon(Object.assign({
        coursId,
        groupes: api.horairesDesGroupesDuCours(coursId),
        semaine, rang,
        lettre: rang ? String.fromCharCode(64 + rang) : ''
    }, extra));
}

beforeEach(() => { store = {}; });

// ---------------------------------------------------------------------------
// 1. Le tableau 4b, rangée par rangée
// ---------------------------------------------------------------------------

describe('lignesDateDeLecon — chaque cas dit sa phrase (#695)', () => {
    it('un groupe, date trouvée : jour et mois en toutes lettres, avec la séance', () => {
        const api = monterExport({ GC_01: HORAIRE_01 }, [GC_01]);
        expect(lignes(api, 'C1', 5, 2)).toEqual(['Mercredi 30 septembre · séance B']);
        expect(lignes(api, 'C1', 5, 1)).toEqual(['Lundi 28 septembre · séance A']);
    });

    it('plusieurs groupes : « séance B » une fois, puis une ligne par groupe', () => {
        const api = monterExport({ GC_01: HORAIRE_01, GC_02: HORAIRE_02 }, [GC_01, GC_02]);
        expect(lignes(api, 'C1', 6, 2)).toEqual([
            'Séance B',
            'Gr. 01 : mercredi 7 octobre',
            'Gr. 02 : jeudi 8 octobre'
        ]);
    });

    it('deux groupes aux jours différents rendent deux dates DIFFÉRENTES pour la même leçon', () => {
        const api = monterExport({ GC_01: HORAIRE_01, GC_02: HORAIRE_02 }, [GC_01, GC_02]);
        const [, l01, l02] = lignes(api, 'C1', 6, 1);
        expect(l01).toBe('Gr. 01 : lundi 5 octobre');
        expect(l02).toBe('Gr. 02 : mardi 6 octobre');
    });

    it('sans numéro de groupe, la ligne porte le nom du groupe tel que l’export le montre', () => {
        const sansNum = { id: 'GC_X', coursId: 'C1', nom: 'Groupe du soir' };
        const api = monterExport({ GC_01: HORAIRE_01, GC_X: HORAIRE_01 }, [GC_01, sansNum]);
        expect(lignes(api, 'C1', 5, 1)[2]).toBe('Groupe du soir : lundi 28 septembre');
    });

    it('semaine posée, rang absent : « séance non fixée », pas de date', () => {
        const api = monterExport({ GC_01: HORAIRE_01 }, [GC_01]);
        expect(lignes(api, 'C1', 5, null)).toEqual(['Semaine 5, séance non fixée']);
    });

    it('pas de semaine : « Leçon non planifiée »', () => {
        const api = monterExport({ GC_01: HORAIRE_01 }, [GC_01]);
        expect(lignes(api, 'C1', null, 2)).toEqual(['Leçon non planifiée']);
    });

    it('le groupe n’a pas de séance à ce rang : il le DIT, jamais le jour suivant', () => {
        const api = monterExport({ GC_01: HORAIRE_01, GC_02: HORAIRE_02 }, [GC_01, GC_02]);
        expect(lignes(api, 'C1', 5, 2)).toEqual([
            'Séance B',
            'Gr. 01 : mercredi 30 septembre',
            'Gr. 02 : pas de séance B en semaine 5'
        ]);
    });

    it('un seul groupe sans séance à ce rang : même aveu, sans préfixe de groupe', () => {
        const api = monterExport({ GC_02: HORAIRE_02 }, [GC_02]);
        expect(lignes(api, 'C1', 5, 2)).toEqual(['Pas de séance B en semaine 5']);
    });

    it('cours sans groupe : « Aucun horaire saisi pour ce cours »', () => {
        const api = monterExport({}, []);
        expect(lignes(api, 'C1', 5, 2)).toEqual(['Aucun horaire saisi pour ce cours']);
    });

    it('groupes sans horaire saisi : même phrase', () => {
        const api = monterExport({}, [GC_01, GC_02]);
        expect(lignes(api, 'C1', 5, 2)).toEqual(['Aucun horaire saisi pour ce cours']);
    });

    it('un groupe sans horaire parmi d’autres : sa ligne le dit', () => {
        const api = monterExport({ GC_01: HORAIRE_01 }, [GC_01, GC_02]);
        expect(lignes(api, 'C1', 5, 1)[2]).toBe('Gr. 02 : aucun horaire saisi');
    });

    it('carte rattachée à aucun cours', () => {
        const api = monterExport({ GC_01: HORAIRE_01 }, [GC_01]);
        expect(lignes(api, null, 5, 2)).toEqual(['Carte rattachée à aucun cours : pas de date']);
    });

    it('évaluation hors leçon : pas de date, même si le reste est complet', () => {
        const api = monterExport({ GC_01: HORAIRE_01 }, [GC_01]);
        expect(lignes(api, 'C1', 5, 2, { horsLecon: true })).toEqual(['Hors leçon : pas de date']);
    });

    it('seuls les groupes DU COURS de la carte comptent', () => {
        const autre = { id: 'GC_AUTRE', coursId: 'C2', nom: 'Autre', groupeNum: '09' };
        const api = monterExport({ GC_01: HORAIRE_01, GC_AUTRE: HORAIRE_02 }, [GC_01, autre]);
        expect(lignes(api, 'C1', 5, 2)).toEqual(['Mercredi 30 septembre · séance B']);
    });
});

// ---------------------------------------------------------------------------
// 2. L'Inspecteur ne calcule pas : il lit l'export
// ---------------------------------------------------------------------------

describe('Inspecteur — aucune copie du calcul de date (#695, zéro-dette)', () => {
    const src = readFileSync(resolve(__dirname, '../../js/planification-carte.js'), 'utf8');

    /** Le corps d'une fonction, borné à la fonction suivante. */
    function corps(nom) {
        const debut = src.indexOf('function ' + nom + '(');
        expect(debut, `fonction ${nom} introuvable`).toBeGreaterThan(-1);
        const suite = src.indexOf('\nfunction ', debut + 1);
        return src.slice(debut, suite === -1 ? undefined : suite);
    }

    it('garde de non-vide : le fichier lu est bien celui de l’Inspecteur', () => {
        expect(src.length).toBeGreaterThan(100000);
        expect(corps('ouvrirPanneau')).toContain('planif-panneau-semaine');
    });

    it('le fichier de la carte ne parcourt pas les séances d’un groupe', () => {
        expect(src).not.toMatch(/obtenirSeancesCompletesDuGroupe/);
        // (`numeroSemaine` y est déjà lu par la grille du Planificateur, qui
        // range les SEMAINES du calendrier : ce n'est pas une date de séance.)
        expect(src).not.toMatch(/datesParSemaine/);
    });

    it('la ligne passe par lignesDateDeLecon de l’export', () => {
        expect(corps('rafraichirDateInspecteur')).toMatch(/exporteur\.lignesDateDeLecon\(/);
    });

    it('l’horaire se construit à l’ouverture, pas au rafraîchissement', () => {
        expect(corps('ouvrirPanneau')).toMatch(/horairesDesGroupesDuCours\(/);
        expect(corps('rafraichirDateInspecteur')).not.toMatch(/horairesDesGroupesDuCours|construireHoraireDeLecons/);
    });

    it('la ligne suit les gestes : sauvegarder() la rafraîchit', () => {
        expect(corps('sauvegarder')).toMatch(/rafraichirDateInspecteur\(\)/);
    });

    it('la ligne est écrite en textContent, jamais en innerHTML (nom de groupe saisi)', () => {
        const r = corps('rafraichirDateInspecteur');
        expect(r).toMatch(/\.textContent = texte/);
        expect(r).not.toMatch(/innerHTML/);
    });
});

// ---------------------------------------------------------------------------
// 3. Mesure : l'export et productions.js disent la même date
// ---------------------------------------------------------------------------

describe('export et productions.js — même date pour même (groupe, semaine, rang)', () => {
    it('sur chaque couple des deux horaires, y compris les cas sans séance', () => {
        const horaires = { GC_01: HORAIRE_01, GC_02: HORAIRE_02 };
        const api = monterExport(horaires, [GC_01, GC_02]);
        const prod = chargerScript('js/productions.js', {
            db: fauxDb(),
            cle: (k) => `a2026_${k}`,
            obtenirSeancesCompletesDuGroupe: (gc) => horaires[gc] || {},
            GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
            document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} }
        });

        let compares = 0, datees = 0;
        for (const gc of ['GC_01', 'GC_02']) {
            const horaire = api.construireHoraireDeLecons(gc);
            for (let s = 4; s <= 7; s++) {
                for (let r = 1; r <= 3; r++) {
                    expect(api.dateDeLecon(horaire, s, r), `${gc} S${s} r${r}`)
                        .toBe(prod.dateSeanceDuRang({ groupeCoursId: gc }, s, r));
                    compares++;
                    if (api.dateDeLecon(horaire, s, r)) datees++;
                }
            }
        }
        expect(compares).toBe(24);
        expect(datees).toBe(7); // garde de non-vide : la comparaison porte sur de vraies dates
    });
});
