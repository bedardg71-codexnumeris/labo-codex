import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #369 (relais Cadre→Trimestre, 4 août 2026) — validation de
// cohérence des bornes du trimestre : NON BLOQUANTE (signaler, expliquer,
// laisser passer). Ces champs se remplissent une fois en août et ne se
// revoient jamais — les deux cas fondateurs sont RÉELS (remise des notes
// saisie au 29/08 au lieu du 29/12 ; semainePlanificationFin vide).

function charger() {
    return chargerScript('js/trimestre-v2.js', {
        db: { getSync: () => null, setSync: () => {}, get: async () => null, set: async () => {} },
        cle: (k) => k
    });
}

// Cadre A2026 réel et COHÉRENT — base des cas : on ne casse qu'une règle à la fois.
const cadreValide = {
    dateDebut: '2026-08-20',
    finCours: '2026-12-11',
    finTrimestre: '2026-12-21',
    remiseNotes: '2026-12-29',
    semainePlanificationDebut: '2026-10-12',
    semainePlanificationFin: '2026-10-16',
    semaineExamensDebut: '2026-12-14',
    semaineExamensFin: '2026-12-21'
};

describe('#369 — validerCadreTrimestre (avertissements non bloquants)', () => {
    it('saisie valide → SILENCE (une validation qui crie tout le temps ne sera pas lue)', () => {
        const win = charger();
        const evenements = [
            { dateEvenement: '2026-09-07', dateReprise: '2026-09-10', description: 'Fête du travail' }
        ];
        expect(win.validerCadreTrimestre(cadreValide, evenements)).toEqual([]);
        expect(win.validerCadreTrimestre(null, [])).toEqual([]);
    });

    it('ordre des bornes : début ≥ fin des cours, fin des cours > fin du trimestre', () => {
        const win = charger();
        expect(win.validerCadreTrimestre({ ...cadreValide, dateDebut: '2026-12-12' }, [])
            .some(m => m.includes('début du trimestre'))).toBe(true);
        expect(win.validerCadreTrimestre({ ...cadreValide, finTrimestre: '2026-12-01', semaineExamensFin: '2026-12-01' }, [])
            .some(m => m.includes('fin des cours réguliers'))).toBe(true);
    });

    it('remise des notes AVANT la fin du trimestre (cas réel : 29/08 pour 29/12)', () => {
        const win = charger();
        const msgs = win.validerCadreTrimestre({ ...cadreValide, remiseNotes: '2026-08-29' }, []);
        expect(msgs.some(m => m.includes('remise des notes') && m.includes('mois'))).toBe(true);
    });

    it('borne partielle du/au → « sera ignorée », jamais devinée (cas réel #367)', () => {
        const win = charger();
        const msgs = win.validerCadreTrimestre({ ...cadreValide, semainePlanificationFin: '' }, []);
        expect(msgs.some(m => m.includes('planification') && m.includes('ignorée'))).toBe(true);
        const msgs2 = win.validerCadreTrimestre({ ...cadreValide, semaineExamensDebut: '' }, []);
        expect(msgs2.some(m => m.includes('examens') && m.includes('date de début'))).toBe(true);
    });

    it('semaine spéciale inversée ou hors des bornes du trimestre', () => {
        const win = charger();
        expect(win.validerCadreTrimestre({ ...cadreValide, semainePlanificationFin: '2026-10-01' }, [])
            .some(m => m.includes('avant de commencer'))).toBe(true);
        expect(win.validerCadreTrimestre({ ...cadreValide, semaineExamensFin: '2026-12-28' }, [])
            .some(m => m.includes('examens') && m.includes('déborde'))).toBe(true);
    });

    it('reprise une fin de semaine (cas réel : silencieusement absente du calendrier)', () => {
        const win = charger();
        const msgs = win.validerCadreTrimestre(cadreValide, [
            { dateEvenement: '2026-09-07', dateReprise: '2026-09-12', description: 'Fête du travail' } // un samedi
        ]);
        expect(msgs.some(m => m.includes('fin de semaine') && m.includes('2026-09-12'))).toBe(true);
    });

    it('reprise antérieure (ou égale) au congé qu\'elle remplace', () => {
        const win = charger();
        const msgs = win.validerCadreTrimestre(cadreValide, [
            { dateEvenement: '2026-11-09', dateReprise: '2026-11-06', description: 'Journée Carrière' }
        ]);
        expect(msgs.some(m => m.includes('précède le congé'))).toBe(true);
    });
});
