import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle d'intégrité C1 (#358 — socle de la migration Option A des modèles).
//
// CE QU'ELLE VERROUILLE — l'invariant grade-bearing de la migration : une fois que
// `migrerModelesVersNamespace()` (C1) a peuplé les copies `<trim>_grillesTemplates`
// / `<trim>_echellesTemplates`, basculer `cle()` vers le régime namespacé doit
// préserver chaque note. Concrètement : pour CHAQUE trimestre, CHAQUE modèle
// référencé par une ÉVALUATION résout, depuis la copie locale, vers une définition
// BYTE-IDENTIQUE à sa source courante (global pour l'actif, copie d'archive pour
// l'archivé). C'est la condition pour que rouvrir/recalculer une éval donne la
// même note après migration. (Le golden master L0 est aveugle à ça : il agrège les
// notes STOCKÉES, il ne recalcule pas depuis les grilles — d'où cette sentinelle.)
//
// Vérifie aussi : ADDITIF (jamais de perte), IDEMPOTENT (2e passe = no-op),
// NON-INTRUSIF (catalogue, clé globale et registre intouchés — l'interrupteur
// `cle()` n'est PAS basculé par C1).
//
// BREAK-TEST (SKILL_verification_adverse) : neutraliser le peuplement depuis le
// global dans `_peuplerCopieModeleNamespace` rend `h2026_grillesTemplates` vide →
// les assertions « résout byte-identique » et « la copie a grandi » ROUGISSENT.

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}
const defOf = (arr, id) => { const m = (arr || []).find(x => x && x.id === id); return m ? JSON.stringify(m) : null; };

// Codex synthétique : h2026 ACTIF (lit le global), a2025 ARCHIVÉ (copie déjà là).
// Chaque trimestre a des grilles d'évals ; h2026 porte en plus une production à
// grilleId PÉRIMÉ (absent du global) = référence déjà cassée, à ignorer sans rougir.
function storeBase() {
    return {
        trimestres: [
            { id: 'a2025', actif: false, archive: true },
            { id: 'h2026', actif: true, archive: false }
        ],
        // Global = ce que l'actif h2026 référence + une grille en réserve (non utilisée).
        grillesTemplates: [
            { id: 'G_H1', nom: 'Grille H1', criteres: [1] },
            { id: 'G_H2', nom: 'Grille H2', criteres: [2] },
            { id: 'G_RESERVE', nom: 'Réserve' }
        ],
        echellesTemplates: [{ id: 'ECH_H', niveaux: 4 }, { id: 'ECH_RES' }],
        // a2025 archivé : ses modèles vivent UNIQUEMENT dans ses copies (hors global).
        a2025_grillesTemplates: [{ id: 'G_A1', nom: 'Grille A1', criteres: [9] }],
        a2025_echellesTemplates: [{ id: 'ECH_A', niveaux: 6 }],
        // Évaluations grade-bearing.
        h2026_evaluationsSauvegardees: [
            { id: 'EH1', grilleId: 'G_H1', echelleId: 'ECH_H' },
            { id: 'EH2', grilleId: 'G_H2', echelleId: 'ECH_H' }
        ],
        a2025_evaluationsSauvegardees: [
            { id: 'EA1', grilleId: 'G_A1', echelleId: 'ECH_A' }
        ],
        // Production périmée : grilleId absent du global → introuvable (pré-existant).
        h2026_productions: [{ id: 'P_STALE', grilleId: 'G_PERIME' }],
        a2025_productions: []
    };
}

// Source résolue AVANT migration pour un trimestre (= ce que cle() lit aujourd'hui).
function sourceAvant(store, trimId, nomCle, archive) {
    if (archive && store[`${trimId}_${nomCle}`]) return store[`${trimId}_${nomCle}`];
    return store[nomCle] || [];
}
function idsEval(store, trimId, champ) {
    const s = new Set();
    for (const e of (store[`${trimId}_evaluationsSauvegardees`] || [])) {
        const id = champ(e); if (id) s.add(id);
    }
    return s;
}
const grilleDeEval = e => e && e.grilleId;
const echelleDeEval = e => (e && typeof e.echelleId === 'string' && e.echelleId && !e.echelleId.startsWith('pratique-')) ? e.echelleId : null;

function migrer(store) {
    const win = chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
    expect(typeof win.migrerModelesVersNamespace).toBe('function');
    const rapport = win.migrerModelesVersNamespace();
    return { win, rapport };
}

describe('C1 (#358) · intégrité de la migration namespacée des modèles', () => {

    it('INVARIANT GRADE-BEARING — chaque modèle d\'éval résout byte-identique après C1', () => {
        const store = storeBase();
        // Capturer les définitions sources AVANT migration.
        const trims = store.trimestres;
        const attendu = [];
        for (const t of trims) {
            for (const [nomCle, champ] of [['grillesTemplates', grilleDeEval], ['echellesTemplates', echelleDeEval]]) {
                const src = sourceAvant(store, t.id, nomCle, t.archive);
                for (const id of idsEval(store, t.id, champ)) attendu.push({ trim: t.id, nomCle, id, def: defOf(src, id) });
            }
        }
        migrer(store);
        // Après C1 : la copie locale `<trim>_<nomCle>` doit contenir l'id, byte-identique.
        for (const a of attendu) {
            const copie = store[`${a.trim}_${a.nomCle}`] || [];
            expect(defOf(copie, a.id), `${a.trim}/${a.nomCle}/${a.id} doit être dans la copie locale`).toBe(a.def);
            expect(a.def, `source de ${a.id} doit exister avant migration`).not.toBeNull();
        }
    });

    it('ACTIF — h2026 crée sa copie depuis le global (par usage, sans la réserve)', () => {
        const store = storeBase();
        expect(store.h2026_grillesTemplates).toBeUndefined();
        migrer(store);
        const ids = (store.h2026_grillesTemplates || []).map(g => g.id);
        expect(ids).toContain('G_H1');
        expect(ids).toContain('G_H2');
        expect(ids).not.toContain('G_RESERVE');     // par usage : la réserve reste au catalogue/global
        expect(ids).not.toContain('G_PERIME');      // production périmée ignorée
    });

    it('ARCHIVÉ — a2025 : copie complète préservée, JAMAIS réduite (additif)', () => {
        const store = storeBase();
        const avant = JSON.stringify(store.a2025_grillesTemplates);
        migrer(store);
        expect(JSON.stringify(store.a2025_grillesTemplates)).toBe(avant); // inchangé
        expect((store.a2025_grillesTemplates || []).map(g => g.id)).toContain('G_A1');
    });

    it('PRODUCTION PÉRIMÉE — grilleId absent du global = introuvable signalé, PAS une perte', () => {
        const store = storeBase();
        const { rapport } = migrer(store);
        // h2026 n'a pas d'éval pointant G_PERIME → il n'apparaît même pas en usage d'éval ;
        // mais via les productions, identifierTemplatesUtilises le collecte → introuvable.
        expect(rapport.trimestres.h2026.grilles.introuvables).toContain('G_PERIME');
        // aucune note ne dépend de G_PERIME → l'intégrité reste verte (couverte par le 1er test).
    });

    it('IDEMPOTENT — 2e exécution n\'ajoute rien et ne modifie pas les copies', () => {
        const store = storeBase();
        migrer(store);
        const snap = JSON.stringify(store.h2026_grillesTemplates);
        const { rapport } = migrer(store);
        expect(rapport.trimestres.h2026.grilles.ajoutes).toBe(0);
        expect(rapport.trimestres.h2026.echelles.ajoutes).toBe(0);
        expect(JSON.stringify(store.h2026_grillesTemplates)).toBe(snap);
    });

    it('RÉGIME NAMESPACÉ — cle() route vers la copie locale peuplée par C1 ; global + catalogue intouchés', () => {
        const store = storeBase();
        const globalAvant = JSON.stringify(store.grillesTemplates);
        const { win } = migrer(store);
        // C1 reste ADDITIF : il ne mute NI la clé globale héritée…
        expect(JSON.stringify(store.grillesTemplates)).toBe(globalAvant);
        // …NI le catalogue de gabarits (non sur-amorcé — D4).
        expect(store.bibliothequeGrilles).toBeUndefined();
        // Interrupteur basculé (déplacement du registre #358, Option A) : h2026 actif non
        // archivé résout désormais vers SA copie namespacée, que C1 vient de peupler.
        expect(win.cle('grillesTemplates')).toBe('h2026_grillesTemplates');
        const resolu = (store.h2026_grillesTemplates || []).map(g => g.id);
        expect(resolu).toContain('G_H1');
        expect(resolu).toContain('G_H2');
    });
});
