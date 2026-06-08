import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Lot DEN-3 (#318) — parcours de création (volet pur).
// Verrouille la CLASSIFICATION : la carte « jugement » de la voie rapide produit
// une dénotation AVEC variante (plus variante:null). Les autres familles restent
// inchangées (non-régression).

const db = { getSync: (k, def) => (def !== undefined ? def : null), setSync: () => {} };
const win = chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k });
const deduire = win.deduireTypePratique;

describe('DEN-3 · deduireTypePratique — la dénotation est créable avec variante', () => {
    it('jugement → denotation / variante eliminee (plus null)', () => {
        const c = deduire({ calcNoteFinale: 'jugement' });
        expect(c.type).toBe('denotation');
        expect(c.variante).toBe('eliminee');
        expect(c.confiance).toBe(1.0);
    });

    it('les autres familles restent inchangées (non-régression)', () => {
        expect(deduire({ calcNoteFinale: 'moyenne' }).type).toBe('sommative');
        expect(deduire({ calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts' }).type).toBe('standards');
        expect(deduire({ calcNoteFinale: 'acceptable' }).type).toBe('specifications');
        expect(deduire({ calcNoteFinale: 'inconnu' }).type).toBeNull();
    });
});
