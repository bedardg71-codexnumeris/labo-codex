import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #330 — sentinelle bug assiduité bi-groupes (10 juin 2026).
// Bug réel (données H2026, groupes 00008/00002) : depuis la consolidation
// multi-groupes (chantier D, 29 mai), `groupeEtudiants` contient le roster du
// cours ENTIER. calculerAssiduite construisait `datesSaisies` depuis ce roster
// (la garde du FIX #220 supposait un roster mono-groupe) → chaque séance saisie
// de l'autre groupe comptait comme une absence complète : A ~50 % pour tout le
// monde dès la 2e semaine, étudiant·es pourtant présent·es.
// Contrat verrouillé :
//  1. les séances saisies de l'AUTRE groupe ne comptent jamais au dénominateur,
//     MÊME si seancesCompletes (cache) contient les dates des deux groupes ;
//  2. FIX #220 préservé : une séance saisie pour le groupe SANS fiche pour
//     l'étudiant·e compte toujours comme absence complète (intra-groupe) ;
//  3. roster legacy SANS champ groupe → comportement antérieur (roster entier).

const DA_A1 = '1111111';
const DA_A2 = '1111112';
const DA_B1 = '2222221';
const DA_B2 = '2222222';

// Jeudis du groupe 00008, lundis du groupe 00002.
const DATES_A = ['2026-01-22', '2026-01-29'];
const DATES_B = ['2026-01-26', '2026-02-02'];

// Cache volontairement CONTAMINÉ : les dates des deux groupes y figurent
// (cas réel constaté — le fix doit tenir sans dépendre d'un cache propre).
const seancesCompletes = {};
DATES_A.concat(DATES_B).forEach((d) => { seancesCompletes[d] = [{ nombrePeriodes: 2 }]; });

function fiche(da, date) {
    return { da, date, periodesPresentes: 2 };
}

const stores = {
    groupeEtudiants: [
        { da: DA_A1, groupe: '00008' },
        { da: DA_A2, groupe: '00008' },
        { da: DA_B1, groupe: '00002' },
        { da: DA_B2, groupe: '00002' }
    ],
    presences: [
        // Groupe 00008 : A1 présent partout ; A2 présent le 22 seulement (absent le 29).
        fiche(DA_A1, '2026-01-22'), fiche(DA_A1, '2026-01-29'),
        fiche(DA_A2, '2026-01-22'),
        // Groupe 00002 : B1 et B2 présents à leurs lundis.
        fiche(DA_B1, '2026-01-26'), fiche(DA_B1, '2026-02-02'),
        fiche(DA_B2, '2026-01-26'), fiche(DA_B2, '2026-02-02')
    ],
    indicesCP: {},
    indicesAssiduite: {}
};

const db = {
    getSync: (k, d) => (k in stores ? stores[k] : (d !== undefined ? d : null)),
    setSync: () => {}, get: async () => null, set: async () => {}
};
const cle = (k) => k;
const obtenirDonneesSelonMode = (k) => stores[k];
const obtenirSeancesCompletes = () => seancesCompletes;

let win;
beforeAll(() => {
    win = chargerScript('js/indices.js', {
        db, cle, obtenirDonneesSelonMode, obtenirSeancesCompletes
    });
});

describe('#330 · assiduité bi-groupes — les séances de l\'autre groupe ne contaminent pas le dénominateur', () => {
    it('étudiant 00008 présent à toutes SES séances → 100 %, même avec cache contaminé', () => {
        const r = win.calculerAssiduite(DA_A1, '2026-06-01');
        expect(r.indice).toBe(1);
        expect(r.periodesOffertes).toBe(4);   // 2 jeudis × 2 périodes — PAS les lundis du 00002
        expect(r.periodesPresentes).toBe(4);
        expect(r.nombreSeances).toBe(2);
    });

    it('étudiant 00002 présent à toutes SES séances → 100 % (symétrie)', () => {
        const r = win.calculerAssiduite(DA_B1, '2026-06-01');
        expect(r.indice).toBe(1);
        expect(r.periodesOffertes).toBe(4);   // 2 lundis × 2 périodes — PAS les jeudis du 00008
    });

    it('FIX #220 préservé : absence intra-groupe (séance saisie, pas de fiche) compte au dénominateur', () => {
        const r = win.calculerAssiduite(DA_A2, '2026-06-01');
        expect(r.indice).toBe(0.5);           // présent 22 jan (2/2), absent 29 jan (0/2)
        expect(r.periodesOffertes).toBe(4);
        expect(r.periodesPresentes).toBe(2);
    });

    it('calculerAssiduitePourAffichage ignore aussi les dates de l\'autre groupe', () => {
        // Séance en cours du 5 février pour A1, 2 périodes saisies : tout présent → 100.
        const r = win.calculerAssiduitePourAffichage(DA_A1, '2026-02-05', 2);
        expect(r.taux).toBe(100);
        expect(r.totalPeriodesPresentes).toBe(6); // 4 passées + 2 en cours
    });

    it('roster legacy SANS champ groupe → comportement antérieur (roster entier)', () => {
        const storesAvant = { groupeEtudiants: stores.groupeEtudiants, presences: stores.presences };
        stores.groupeEtudiants = [{ da: DA_A1 }, { da: DA_B1 }];
        stores.presences = [fiche(DA_A1, '2026-01-22'), fiche(DA_B1, '2026-01-26')];
        const r = win.calculerAssiduite(DA_A1, '2026-06-01');
        stores.groupeEtudiants = storesAvant.groupeEtudiants;
        stores.presences = storesAvant.presences;
        expect(r.indice).toBe(0.5);           // la fiche de l'autre DA compte (pas d'info de groupe)
        expect(r.periodesOffertes).toBe(4);
    });
});
