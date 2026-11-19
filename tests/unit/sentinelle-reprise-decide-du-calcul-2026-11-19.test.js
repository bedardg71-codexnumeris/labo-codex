import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — lot « journées reprise » (19 nov. 2026, décision de Grégoire avec Cowork).
//
// Le bogue VÉCU le 18 nov. 2026 : grève étudiante imprévue, mar. 10 et ven. 13 nov.,
// sans reprise. Déclarée « Institutionnel », elle sortait ces deux jours du compte
// « paquet de 5 » (js/trimestre.js, passe 1) et décalait toutes les semaines
// suivantes : la semaine 12 démarrait le mer. 18 nov. Ce que voulait Grégoire : la
// semaine 11 perdue, la numérotation inchangée.
//
// LA RÈGLE : une journée sans cours sort du compte SI ET SEULEMENT SI elle porte une
// dateReprise. L'étiquette (`categorie` : institutionnel / ferie / personnel) ne
// gouverne plus rien ; elle reste, inerte, dans le stock des journées saisies avant.
//
// Juge : le cadre A2026 réel (dates seulement, aucun nom d'élève), le même que le
// golden master #368, lui-même jugé jour par jour contre le PDF officiel du cégep.

const CADRE_A2026 = {
    dateDebut: '2026-08-20',
    finCours: '2026-12-11',
    finTrimestre: '2026-12-21',
    semainePlanificationDebut: '2026-10-12',
    semainePlanificationFin: '2026-10-16',
    semaineExamensDebut: '2026-12-14',
    semaineExamensFin: '2026-12-18'
};
// Les deux journées officielles, telles qu'elles sont dans le stock (avec leur ancienne étiquette).
const OFFICIELLES = [
    { id: 'E1', dateEvenement: '2026-09-07', description: 'Fête du travail', categorie: 'ferie', horaireReprise: 'Lundi', dateReprise: '2026-09-10' },
    { id: 'E2', dateEvenement: '2026-11-09', description: 'Journée Carrière', categorie: 'institutionnel', horaireReprise: 'Lundi', dateReprise: '2026-11-13' }
];

function greve(categorie, reprise) {
    const base = (id, date) => {
        const evt = { id, dateEvenement: date, description: 'Grève', horaireReprise: '', dateReprise: '' };
        if (categorie !== undefined) evt.categorie = categorie;
        return evt;
    };
    const j = [base('G1', '2026-11-10'), base('G2', '2026-11-13')];
    if (reprise) Object.assign(j[0], reprise);
    return j;
}

function generer(journees) {
    const store = {
        a2026_cadreCalendrier: CADRE_A2026,
        a2026_journeesSansCours: journees,
        a2026_horaires: []
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; }
    };
    const win = chargerScript('js/trimestre.js', { db, cle: (k) => 'a2026_' + k });
    return win.genererCalendrierComplet();
}

const SANS_GREVE = generer(OFFICIELLES);

describe('cas vécu — grève des 10 et 13 nov. SANS reprise, déclarée « Institutionnel » (le Mac)', () => {
    const cal = generer([...OFFICIELLES, ...greve('institutionnel')]);

    it('chaque jour du trimestre garde le numéro de semaine qu\'il a sans la grève', () => {
        const dates = Object.keys(SANS_GREVE).filter((d) => d <= CADRE_A2026.finCours);
        expect(dates.length).toBeGreaterThan(100);
        for (const date of dates) {
            expect(cal[date]?.numeroSemaine, `${date} (${cal[date]?.statut})`).toBe(SANS_GREVE[date].numeroSemaine);
        }
    });

    it('nommément : 16-17 nov. en semaine 12 (le bogue les mettait en 11), fin en semaine 15', () => {
        expect(cal['2026-11-16'].numeroSemaine).toBe(12);
        expect(cal['2026-11-17'].numeroSemaine).toBe(12);
        expect(cal['2026-11-18'].numeroSemaine).toBe(12);
        expect(cal['2026-12-11'].numeroSemaine).toBe(15);
    });

    it('les deux jours de grève : congés NON repris, en semaine 11, sans séance (le cours est perdu)', () => {
        for (const date of ['2026-11-10', '2026-11-13']) {
            expect(cal[date].statut).toBe('conge');
            expect(cal[date].motif).toBe('Grève');
            expect(cal[date].nonReprise).toBe(true);
            expect(cal[date].numeroSemaine).toBe(11);
            expect(cal[date].numeroJour).toBeUndefined();
        }
    });

    it('préséance congé > reprise : le 13 nov., reprise de la Journée Carrière ET grève, est la grève', () => {
        expect(SANS_GREVE['2026-11-13'].statut).toBe('reprise');
        expect(cal['2026-11-13'].statut).toBe('conge');
        // La Journée Carrière, elle, reste reprise : hors compte, sans numéro.
        expect(cal['2026-11-09'].statut).toBe('conge');
        expect(cal['2026-11-09'].nonReprise).toBeUndefined();
        expect(cal['2026-11-09'].numeroSemaine).toBeUndefined();
    });

    it('le calendrier ne porte plus le champ dérivé categorieEvenement', () => {
        expect(Object.values(cal).some((j) => 'categorieEvenement' in j)).toBe(false);
    });
});

describe('l\'étiquette ne gouverne plus rien (le stock des journées saisies avant)', () => {
    it('« Personnel » (l\'iPad), « Institutionnel » (le Mac), « Férié » ou aucune : le même calendrier', () => {
        const reference = generer([...OFFICIELLES, ...greve(undefined)]);
        for (const categorie of ['personnel', 'institutionnel', 'ferie', 'conge']) {
            expect(generer([...OFFICIELLES, ...greve(categorie)]), categorie).toEqual(reference);
        }
    });

    it('une journée « Personnel » AVEC reprise est désormais honorée (fin de la convention §3.0, plus de warn)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const cal = generer([...OFFICIELLES,
            { id: 'P1', dateEvenement: '2026-10-20', description: 'Maladie', categorie: 'personnel', horaireReprise: 'Mardi', dateReprise: '2026-10-24' }]);
        const avertie = warn.mock.calls.some((c) => String(c[0]).includes('convention §3.0'));
        warn.mockRestore();
        expect(avertie).toBe(false);
        expect(cal['2026-10-20'].statut).toBe('conge');
        expect(cal['2026-10-20'].numeroSemaine).toBeUndefined();   // hors compte
        expect(cal['2026-10-24'].statut).toBe('reprise');          // le samedi de reprise existe
        expect(cal['2026-10-24'].jourRemplace).toBe('Mardi');
    });
});

describe('la même journée AVEC reprise décale les semaines suivantes', () => {
    // Reprise du mardi 10 nov. le samedi 21 nov. (horaire du mardi) : le 10 sort du compte.
    const cal = generer([...OFFICIELLES, ...greve('institutionnel', { horaireReprise: 'Mardi', dateReprise: '2026-11-21' })]);

    it('le 10 nov. sort du compte : congé repris, sans numéro', () => {
        expect(cal['2026-11-10'].statut).toBe('conge');
        expect(cal['2026-11-10'].nonReprise).toBeUndefined();
        expect(cal['2026-11-10'].numeroSemaine).toBeUndefined();
        expect(cal['2026-11-21'].statut).toBe('reprise');
    });

    it('les semaines suivantes reculent d\'un jour : le lun. 16 nov. passe en semaine 11', () => {
        expect(SANS_GREVE['2026-11-16'].numeroSemaine).toBe(12);
        expect(cal['2026-11-16'].numeroSemaine).toBe(11);
        expect(cal['2026-11-17'].numeroSemaine).toBe(12);   // la semaine 12 démarre un mardi
    });

    it('le 13 nov., non repris, reste compté (une seule des deux journées décale)', () => {
        expect(cal['2026-11-13'].nonReprise).toBe(true);
        expect(cal['2026-11-13'].numeroSemaine).toBe(11);
    });
});

describe('le cadre réel de Grégoire, AVEC les Élections (mesure de Cowork, 19 nov. 2026)', () => {
    // Le cadre des blocs précédents n'a pas les Élections (lun. 5 oct., reprise ven. 2 oct.,
    // horaire du lundi). Avec elles, le 5 oct. sort du compte : tout ce qui suit recule d'un
    // jour. C'est ce qu'affiche l'iPad de Grégoire (capture du 19 nov., 8 h 17 : 16 nov. en
    // semaine 11, 18 nov. en semaine 12). L'ancien calcul, sur le Mac (grève « Institutionnel »),
    // laissait les 17 et 18 nov. en semaine 11 : la semaine 12 démarrait le jeudi 19.
    const ELECTIONS = { id: 'EL', dateEvenement: '2026-10-05', description: 'Élections', categorie: 'institutionnel', horaireReprise: 'Lundi', dateReprise: '2026-10-02' };

    for (const [appareil, categorie] of [['l\'iPad', 'personnel'], ['le Mac', 'institutionnel']]) {
        it(`grève « ${categorie} » (${appareil}) : 16 nov. en semaine 11, 17 et 18 nov. en 12, 11 déc. en 15`, () => {
            const cal = generer([...OFFICIELLES, ELECTIONS, ...greve(categorie)]);
            expect(cal['2026-10-05'].numeroSemaine).toBeUndefined();   // les Élections, reprises : hors compte
            expect(cal['2026-11-10'].numeroSemaine).toBe(11);
            expect(cal['2026-11-13'].numeroSemaine).toBe(11);
            expect(cal['2026-11-16'].numeroSemaine).toBe(11);
            expect(cal['2026-11-17'].numeroSemaine).toBe(12);
            expect(cal['2026-11-18'].numeroSemaine).toBe(12);
            expect(cal['2026-12-11'].numeroSemaine).toBe(15);
        });
    }
});
