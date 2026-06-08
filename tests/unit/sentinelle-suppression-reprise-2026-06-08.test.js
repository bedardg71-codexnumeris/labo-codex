import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Bug Grégoire 8 juin 2026 : supprimer une reprise (jeton de reprise) laissait
// l'évaluation originale étiquetée « remplacée » (remplaceeParId orphelin).
// Correctif : restaurerOriginaleSiReprise() défait le statut « remplacée » quand
// on supprime la reprise correspondante. Ici on teste le helper pur exposé.

let win;

beforeAll(() => {
    // liste-evaluations.js est une IIFE : le chargement définit les fonctions et
    // peuple window ; aucune dépendance n'est appelée au top-level.
    win = chargerScript('js/liste-evaluations.js');
});

describe('restaurerOriginaleSiReprise (#bug-reprise 8 juin 2026)', () => {
    it('expose le helper', () => {
        expect(typeof win._restaurerOriginaleSiReprise).toBe('function');
    });

    it('supprimer une reprise restaure l’originale (retire remplaceeParId & co)', () => {
        const originale = {
            id: 'O1', etudiantDA: 'JUSTIN', productionId: 'art10',
            remplaceeParId: 'R1', dateRemplacement: '2026-06-08T00:00:00Z',
            archivee: true, dateArchivage: '2026-06-08T00:00:00Z'
        };
        const reprise = { id: 'R1', etudiantDA: 'JUSTIN', productionId: 'art10', repriseDeId: 'O1' };
        const evals = [originale, reprise];

        const restauree = win._restaurerOriginaleSiReprise(evals, 'R1');

        expect(restauree).toBe(true);
        expect('remplaceeParId' in originale).toBe(false);
        expect('dateRemplacement' in originale).toBe(false);
        expect('archivee' in originale).toBe(false);
        expect('dateArchivage' in originale).toBe(false);
    });

    it('ne touche à rien si l’évaluation n’est pas une reprise', () => {
        const evalNormale = { id: 'X1', etudiantDA: 'JUSTIN', productionId: 'art10' };
        const evals = [evalNormale];
        expect(win._restaurerOriginaleSiReprise(evals, 'X1')).toBe(false);
    });

    it('no-op si l’originale a déjà disparu (pas de faux positif)', () => {
        const reprise = { id: 'R1', repriseDeId: 'O1' };   // O1 absente
        const evals = [reprise];
        expect(win._restaurerOriginaleSiReprise(evals, 'R1')).toBe(false);
    });

    it('ne restaure pas une originale dont le remplaceeParId pointe ailleurs', () => {
        const originale = { id: 'O1', remplaceeParId: 'R_AUTRE', archivee: true };
        const reprise = { id: 'R1', repriseDeId: 'O1' };
        const evals = [originale, reprise];
        expect(win._restaurerOriginaleSiReprise(evals, 'R1')).toBe(false);
        expect(originale.remplaceeParId).toBe('R_AUTRE');   // intacte
        expect(originale.archivee).toBe(true);
    });

    it('défensif : tableau invalide → false', () => {
        expect(win._restaurerOriginaleSiReprise(null, 'R1')).toBe(false);
        expect(win._restaurerOriginaleSiReprise(undefined, 'R1')).toBe(false);
    });
});
