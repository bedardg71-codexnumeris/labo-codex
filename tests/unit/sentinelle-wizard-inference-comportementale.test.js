import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — bug testeur 8 juin : doublon de question dans l'assistant.
// L'étape « sous-questions-guidees » reposait la même question (calcNoteFinale)
// au lieu de lever l'incertitude. Correction : deux questions COMPORTEMENTALES
// (uniteCorrection, sortReprise) → inférence de la famille par un moteur UNIQUE
// (deduireTypePratique), 3e question de départage si les signaux divergent.
// Cette sentinelle verrouille : chaque combinaison → bonne famille, divergence
// gérée (jamais d'impasse, jamais de retour à « nomme ta méthode »), et
// non-régression des chemins certains (#319 golden master).

const db = { getSync: (k, def) => (def !== undefined ? def : null), setSync: () => {} };
const win = chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k });
const deduire = win.deduireTypePratique;
const router = win._etapeApresInference;

// Signaux concordants par famille (unité de correction + sort de la reprise).
const SIGNAUX = {
    sommative:      { uniteCorrection: 'pourcentage', sortReprise: 'compte' },
    standards:      { uniteCorrection: 'niveau',      sortReprise: 'remplacee' },
    specifications: { uniteCorrection: 'mention',     sortReprise: 'exigence' }
};
const ETAPE_CONFIG = {
    sommative: 'regles-sommative',
    standards: 'approche-evaluation',
    specifications: 'nb-evaluations'
};

describe('inférence comportementale · signaux concordants → bonne famille', () => {
    for (const [famille, signaux] of Object.entries(SIGNAUX)) {
        it(`${signaux.uniteCorrection} + ${signaux.sortReprise} → ${famille}`, () => {
            const r = { calcNoteFinale: 'pas-certain', ...signaux };
            expect(deduire(r).type).toBe(famille);
            expect(router(r)).toBe(ETAPE_CONFIG[famille]);   // routage vers la config, pas d'impasse
        });
    }
});

describe('inférence comportementale · signaux divergents → départage (jamais d\'impasse)', () => {
    const unites = ['pourcentage', 'niveau', 'mention'];
    const reprises = { pourcentage: 'compte', niveau: 'remplacee', mention: 'exigence' };
    // 6 combinaisons croisées (u ≠ famille(r))
    for (const u of unites) {
        for (const autre of unites) {
            if (u === autre) continue;
            it(`${u} + reprise(${autre}) → null + route vers le départage`, () => {
                const r = { calcNoteFinale: 'pas-certain', uniteCorrection: u, sortReprise: reprises[autre] };
                expect(deduire(r).type).toBeNull();              // non tranché
                expect(router(r)).toBe('departage-pratique');    // 3e question, jamais « nomme ta méthode »
            });
        }
    }
});

describe('inférence comportementale · le départage tranche', () => {
    it('départage « somme » → sommative, même si les 2 signaux divergeaient', () => {
        const r = { calcNoteFinale: 'pas-certain', uniteCorrection: 'niveau', sortReprise: 'exigence', departagePratique: 'somme' };
        expect(deduire(r).type).toBe('sommative');
        expect(router(r)).toBe('regles-sommative');
    });
    it('départage « maitrise » → standards', () => {
        const r = { calcNoteFinale: 'pas-certain', uniteCorrection: 'pourcentage', sortReprise: 'exigence', departagePratique: 'maitrise' };
        expect(deduire(r).type).toBe('standards');
        expect(router(r)).toBe('approche-evaluation');
    });
    it('départage « exigences » → specifications', () => {
        const r = { calcNoteFinale: 'pas-certain', uniteCorrection: 'pourcentage', sortReprise: 'compte', departagePratique: 'exigences' };
        expect(deduire(r).type).toBe('specifications');
        expect(router(r)).toBe('nb-evaluations');
    });
});

describe('inférence comportementale · cas partiel (un seul signal)', () => {
    it('uniteCorrection seul → famille de ce signal', () => {
        expect(deduire({ calcNoteFinale: 'pas-certain', uniteCorrection: 'niveau' }).type).toBe('standards');
    });
    it('aucun signal → null (l\'étape reste à répondre, pas d\'impasse silencieuse)', () => {
        expect(deduire({ calcNoteFinale: 'pas-certain' }).type).toBeNull();
        expect(router({ calcNoteFinale: 'pas-certain' })).toBe('departage-pratique');
    });
});

describe('inférence comportementale · non-régression des chemins certains', () => {
    it('moyenne → sommative, niveaux → standards, acceptable → specifications, jugement → denotation', () => {
        expect(deduire({ calcNoteFinale: 'moyenne' }).type).toBe('sommative');
        expect(deduire({ calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts' }).type).toBe('standards');
        expect(deduire({ calcNoteFinale: 'acceptable' }).type).toBe('specifications');
        expect(deduire({ calcNoteFinale: 'jugement' }).type).toBe('denotation');
    });
    it('les signaux comportementaux n\'affectent PAS un choix certain', () => {
        // calcNoteFinale explicite l'emporte : les signaux ne sont consultés que pour 'pas-certain'.
        const r = { calcNoteFinale: 'moyenne', uniteCorrection: 'mention', sortReprise: 'exigence' };
        expect(deduire(r).type).toBe('sommative');
    });
});
