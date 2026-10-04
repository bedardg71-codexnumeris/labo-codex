import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #359 (RÉCONCILIÉ #358, Option A) — desarchiverTrimestre ne purge QUE les copies qui
// REDEVIENNENT ORPHELINES une fois `archive` retiré : celles dont cle() retombe sur une
// clé GLOBALE partagée. Avant Option A : grilles/échelles/pratiques + cartouches étaient
// toutes purgées. APRÈS : grilles/échelles/pratiques ont rejoint CLES_NAMESPACEES →
// `<id>_*` est la donnée VIVANTE du trimestre désarchivé (lue par cle() hors archive) →
// on NE LES PURGE PLUS (sinon perte de notes). NB : pratiquesConfigurables était déjà
// namespacé → le purger était un bug latent, corrigé ici. Seules les CARTOUCHES
// (cartouches_<grilleId>, restées globales) restent purgées. La condition est dérivée du
// REGISTRE (CLES_GLOBALES), pas d'un flag → s'auto-ajuste au déplacement du registre.
// Le backup `snapshot_<id>_*` (référence historique) est CONSERVÉ.
//
// Break-test : re-purger une copie namespacée vivante (ex. <id>_grillesTemplates) fait
// rougir « la copie namespacée SURVIT » ; ne plus purger la cartouche fait rougir « la
// cartouche orpheline est retirée ». Un test qui ne peut pas échouer ne prouve rien
// (SKILL_verification_adverse, P2).

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        removeSync: (c) => { delete store[c]; }
    };
}

function chargerTrimestres(store) {
    return chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
}

const CLE_SNAPSHOT = 'snapshot_a2025_2025-12-20T00-00-00-000Z';

// Store d'un trimestre A25 ARCHIVÉ, avec les copies de modèles qu'un archivage a posées.
function storeArchive() {
    return {
        trimestres: [{
            id: 'a2025', actif: false, archive: true, dateFin: '2025-12-20',
            statistiquesFinales: { nbEtudiants: 20, nbCours: 1 },
            snapshotRessources: CLE_SNAPSHOT
        }],
        // Productions du trimestre → re-dérivent les grilleIds des cartouches au désarchivage.
        a2025_productions: [{ id: 'P1', grilleId: 'G1', echelleId: 'E1', pratiqueId: 'PR1' }],
        grillesTemplates: [{ id: 'G1', echelleId: 'E1' }],
        // Copies figées par creerSnapshotRessources :
        a2025_grillesTemplates: [{ id: 'G1' }],
        a2025_echellesTemplates: [{ id: 'E1' }],
        a2025_pratiquesConfigurables: [{ id: 'PR1' }],
        a2025_cartouches_G1: [{ id: 'CART1' }],
        // Backup historique — NE DOIT PAS être purgé :
        [CLE_SNAPSHOT]: { grilles: [{ id: 'G1' }], _meta: { isolationArchive: true } }
    };
}

describe('#359 (réconcilié #358) · désarchiver préserve les modèles vivants, purge les orphelins', () => {
    it('PRÉSERVE les copies namespacées VIVANTES (grilles/échelles/pratiques — Option A)', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        const r = win.desarchiverTrimestre('a2025');
        expect(r.success).toBe(true);
        // Après Option A, ces copies sont la donnée vivante du trimestre → CONSERVÉES.
        expect('a2025_grillesTemplates' in store).toBe(true);
        expect('a2025_echellesTemplates' in store).toBe(true);
        expect('a2025_pratiquesConfigurables' in store).toBe(true);
    });

    it('CONSERVE les cartouches du trimestre — elles ne sont plus des orphelines', () => {
        // ⚠ CAS RETOURNÉ PAR S5/#623 LE 31 AOÛT 2026. Il attendait l'INVERSE :
        // `a2025_cartouches_G1` devait être PURGÉE au désarchivage. Ce geste était
        // juste tant que les cartouches étaient globales — la copie namespacée
        // n'était alors qu'un doublon, et le trimestre désarchivé retrouvait la
        // collection commune intacte.
        // Sous S5 la même ligne DÉTRUIT LA SEULE COPIE : `<id>_cartouches_<x>` est
        // la donnée vivante du trimestre. La branche a été retirée de
        // `purgerCopiesModelesArchive`, et ce cas garde la porte fermée.
        // Perte verrouillée en bout de chaîne par
        // tests/unit/sentinelle-623-s5-cartouches-namespacees.test.js.
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        expect('a2025_cartouches_G1' in store).toBe(true);
    });

    it('CONSERVE le snapshot de sauvegarde historique (pas un orphelin)', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        expect(CLE_SNAPSHOT in store).toBe(true);
    });

    it('flippe le flag archive, retire dateFin, conserve statistiquesFinales', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        const t = store.trimestres.find(x => x.id === 'a2025');
        expect(t.archive).toBe(false);
        expect('dateFin' in t).toBe(false);
        expect(t.statistiquesFinales).toEqual({ nbEtudiants: 20, nbCours: 1 });
    });

    it('rapporte les clés effectivement purgées — aucune, et c\'est le régime attendu', () => {
        // ⚠ CAS RETOURNÉ PAR S5/#623 LE 31 AOÛT 2026 : il attendait
        // `['a2025_cartouches_G1']`. Les deux familles ont quitté la purge pour
        // deux raisons DISTINCTES, et il faut les garder distinctes :
        //   · les MODÈLES (grilles/échelles/pratiques) depuis #358/Option A — ils
        //     sont namespacés, donc données vivantes ; le cas ci-dessus le tient ;
        //   · les CARTOUCHES depuis S5/#623 — même raison, appliquée plus tard.
        // La purge n'est PAS morte pour autant : sa condition reste dérivée du
        // REGISTRE (cas suivant), donc toute clé qui redeviendrait globale serait
        // de nouveau purgée, sans qu'on ait à retoucher ce fichier.
        const store = storeArchive();
        const win = chargerTrimestres(store);
        const r = win.desarchiverTrimestre('a2025');
        expect(r.copiesPurgees).toEqual([]);
    });

    it('la purge reste DÉRIVÉE DU REGISTRE, pas d\'une liste figée', () => {
        // Le mécanisme de #359, que les deux cas retournés ci-dessus pourraient
        // laisser croire mort : `purgerCopiesModelesArchive` ne purge pas « rien »,
        // elle purge ce que le REGISTRE désigne encore comme GLOBAL. Aujourd'hui
        // l'intersection est vide ; elle se remplirait d'elle-même si une clé
        // repassait au régime global. Sans ce cas, quelqu'un pourrait vider la
        // fonction en constatant qu'elle ne retire jamais rien.
        const src = readFileSync(path.join(racine, 'js', 'trimestres.js'), 'utf8');
        const debut = src.indexOf('function purgerCopiesModelesArchive');
        expect(debut).toBeGreaterThan(-1);
        const corps = src.slice(debut, debut + 2000);
        expect(corps).toContain('CLES_TEMPLATES_ARCHIVES');
        expect(corps).toContain('CLES_GLOBALES.includes(nomCle)');
        // Et la branche cartouches ne revient pas par la porte de derrière.
        expect(corps).not.toMatch(/retirer\(`\$\{id\}_cartouches_/);
    });

    it('GARDE — appel sur un trimestre non archivé : refusé, copies intactes', () => {
        const store = storeArchive();
        store.trimestres[0].archive = false; // déjà désarchivé
        const win = chargerTrimestres(store);
        const r = win.desarchiverTrimestre('a2025');
        expect(r.success).toBe(false);
        expect(r.error).toBe('Trimestre non clos');
        expect('a2025_grillesTemplates' in store).toBe(true); // un refus ne purge rien
    });

    it('idempotent — un 2e désarchivage est refusé proprement', () => {
        const store = storeArchive();
        const win = chargerTrimestres(store);
        win.desarchiverTrimestre('a2025');
        const r2 = win.desarchiverTrimestre('a2025');
        expect(r2.success).toBe(false);
        expect(r2.error).toBe('Trimestre non clos');
    });
});
