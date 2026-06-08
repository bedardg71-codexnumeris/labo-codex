import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #319 Lot 5 + #318 DEN-3 — reconnaissance ET création de la Dénotation.
//
// Contrat : une pratique DEN (existante OU fraîchement créée) est reconnue — son
// badge récap est « DEN » (--den-violet), pas « Sommative » ni « Indéterminé ».
// Avant le Lot 5, chargerPratiqueExistante mappait 'denotation' → calcNoteFinale
// 'moyenne' (fallback) → deduire la classait en sommative. Depuis DEN-3 (#318), la
// DEN est CRÉABLE : la carte « jugement » de la voie rapide produit une classification
// denotation AVEC variante ('eliminee', seul mode du premier lot). Aucune régression
// des familles SOM/STD/SPE.

let store = [];
const db = {
    getSync: (k, def) => {
        if (k === 'pratiquesConfigurables') return store;
        if (k === 'echellesTemplates' || k === 'grillesTemplates') return [];
        if (k === 'modalitesEvaluation') return {};
        return def !== undefined ? def : null;
    },
    setSync: () => {}
};
// Réplique de la table du registre (pratique-registre.js) : couche défensive conservée.
const normMap = {
    'pan-denotation': 'denotation', 'pan-standards': 'standards',
    'pan-specifications': 'specifications', 'pan-maitrise': 'standards'
};
const globaux = {
    db,
    cle: (k) => k,
    notifications: { erreur: () => {}, succes: () => {} },
    echapperHtml: (s) => String(s == null ? '' : s),
    normaliserIdPratique: (t) => normMap[t] || t,
    estEnModeDemo: () => false,   // hors démo : pas de section exemple chiffrée (Lot 4)
    simulerIndices: () => null
};
const win = chargerScript('js/wizard-pratique-v2.js', globaux);

describe('#319 Lot 5 — reconnaissance DEN (a)', () => {
    beforeEach(() => { store = []; });

    it('deduireTypePratique : jugement → denotation (variante eliminee, créable depuis DEN-3)', () => {
        const c = win.deduireTypePratique({ calcNoteFinale: 'jugement' });
        expect(c.type).toBe('denotation');
        expect(c.variante).toBe('eliminee');
        expect(c.confiance).toBe(1.0);
    });

    it('aucune régression des 3 familles existantes', () => {
        expect(win.deduireTypePratique({ calcNoteFinale: 'moyenne' }).type).toBe('sommative');
        expect(win.deduireTypePratique({ calcNoteFinale: 'niveaux' }).type).toBe('standards');
        expect(win.deduireTypePratique({ calcNoteFinale: 'acceptable' }).type).toBe('specifications');
        expect(win.deduireTypePratique({}).type).toBeNull();
    });

    it('chargerPratiqueExistante (DEN canonique) pose jugement + type denotation', () => {
        store = [{ id: 'p-den', type: 'denotation', nom: 'Ma DEN' }];
        win.chargerPratiqueExistante('p-den');
        expect(win.wizardState.reponses.typePratique).toBe('denotation');
        expect(win.wizardState.reponses.calcNoteFinale).toBe('jugement');
        expect(win.deduireTypePratique(win.wizardState.reponses).type).toBe('denotation');
    });

    it('chargerPratiqueExistante (DEN legacy pan-denotation) normalise vers denotation', () => {
        store = [{ id: 'p-den2', type: 'pan-denotation', nom: 'DEN legacy' }];
        win.chargerPratiqueExistante('p-den2');
        expect(win.wizardState.reponses.typePratique).toBe('denotation');
        expect(win.wizardState.reponses.calcNoteFinale).toBe('jugement');
    });
});

describe('#319 Lot 5 — badge récap DEN (b)', () => {
    it('le récap d\'une DEN affiche le badge DEN, jamais SOM ni Indéterminé', () => {
        win.wizardState.reponses = { calcNoteFinale: 'jugement', typePratique: 'denotation' };
        win.wizardState.modeEdition = true;   // recap en mode édition
        const html = win.genererRecapitulatif();
        expect(html).toContain('wizard-v2-recap-diagnostic--den');
        expect(html).toContain('DEN');
        expect(html).toContain('Dénotation');
        expect(html).not.toContain('wizard-v2-recap-diagnostic--som');
        expect(html).not.toContain('wizard-v2-recap-diagnostic--indetermine');
    });
});
