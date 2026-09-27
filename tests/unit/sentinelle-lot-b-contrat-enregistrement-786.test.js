import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// ═══════════════════════════════════════════════════════════════════════════
// LOT B DE L'ENREGISTREMENT — LE CONTRAT DE `sauvegarderDonneesSelonMode` (#786, #618)
// 27 septembre 2026. Décision D0, point 2 (Grégoire, 26 sept.) : « Un seul témoin,
// le même partout, dit « Enregistré » après chaque écriture. Si l'écriture échoue,
// il dit « Non enregistré », avec la raison. »
//
// Avant : la fonction rendait `true`, ou les chaînes `'quota'` et `'error'` — truthy,
// lues comme un succès par les appelants en `if (!…)`. Sur un quota dépassé, elle
// affichait « Les données sont sauvegardées… », faux à chaque fois (`db.setSync` ne
// lève que si rien n'a été écrit). La garde #340 faisait un `return` nu dans
// `db.setSync` : la fonction rendait `true` sans rien écrire.
//
// Maintenant : `true` si l'écriture a eu lieu, `false` sinon, et c'est ELLE qui fait
// parler le témoin commun — sur le succès comme sur l'échec, avec le geste.
//
// Ce banc charge `modes.js` RÉEL ; `db.setSync` et le témoin sont des doublures qui
// ENREGISTRENT ce qu'on leur fait. Le comportement du témoin lui-même (DOM, rôles,
// persistance du « Non enregistré ») est éprouvé au navigateur :
// tests/integration/temoin-enregistrement-lot-b.spec.js.
// ═══════════════════════════════════════════════════════════════════════════

function monter(comportementSetSync) {
    const appels = [];
    const toasts = [];
    const ecrit = {};
    const db = {
        getSync: (k, d) => (k in ecrit ? ecrit[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => {
            const r = comportementSetSync(k, v);
            if (r !== false) ecrit[k] = v;
            return r;
        },
        get: async () => null, set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {}
    };
    const cle = (k) => 'a2026_' + k;
    const notifications = {
        succes: (t, m) => toasts.push('succes:' + t + ' | ' + (m || '')),
        erreur: (t, m) => toasts.push('erreur:' + t + ' | ' + (m || '')),
        warning: () => {}, info: () => {}
    };
    const win = {
        addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'a2026', cle,
        temoinEnregistrement: {
            enregistre: () => appels.push(['enregistre']),
            nonEnregistre: (raison, geste) => appels.push(['nonEnregistre', raison, geste]),
            fermer: () => appels.push(['fermer'])
        }
    };
    chargerScript('js/modes.js', { db, cle, notifications, obtenirPreference: () => null, definirPreference: () => {} }, win);
    return { win, appels, toasts, ecrit };
}

const quota = () => { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; };
const erreur = () => { throw new Error('disque en panne'); };
const garde = () => false;          // `db.setSync` refusé par la garde #340 (rien d'écrit)
const accepte = () => true;

describe('lot B · sauvegarderDonneesSelonMode rend true ou false, jamais une chaîne (#786)', () => {
    for (const [nom, comportement, motif] of [
        ['quota dépassé', quota, /mémoire du navigateur est pleine/],
        ['autre erreur', erreur, /navigateur a refusé l'écriture/],
        ['garde #340', garde, /ne correspondent pas au trimestre ouvert/]
    ]) {
        it(`${nom} → false, le témoin dit « Non enregistré » avec la raison et le geste, aucun toast`, () => {
            const b = monter(comportement);
            const r = b.win.sauvegarderDonneesSelonMode('presences', [1], { geste: 'Enregistrement des présences' });
            expect(r).toBe(false);
            expect(b.appels).toHaveLength(1);
            expect(b.appels[0][0]).toBe('nonEnregistre');
            expect(b.appels[0][1]).toMatch(motif);
            expect(b.appels[0][2]).toBe('Enregistrement des présences');
            // L'ancien toast « Les données sont sauvegardées… » ne revient pas : un échec
            // ne se dit qu'une fois, par le témoin.
            expect(b.toasts).toEqual([]);
            expect(b.ecrit).toEqual({});
        });
    }

    it('un échec est dit même en écriture discrète', () => {
        const b = monter(quota);
        expect(b.win.sauvegarderDonneesSelonMode('indicesAssiduite', {}, { discret: true })).toBe(false);
        expect(b.appels.map(a => a[0])).toEqual(['nonEnregistre']);
    });

    it('écriture réussie → true, et le témoin dit « Enregistré »', () => {
        const b = monter(accepte);
        expect(b.win.sauvegarderDonneesSelonMode('presences', [1])).toBe(true);
        expect(b.appels).toEqual([['enregistre']]);
        expect(b.ecrit).toEqual({ a2026_presences: [1] });
    });

    it('écriture réussie discrète (recalcul, migration) → true, le témoin se tait', () => {
        const b = monter(accepte);
        expect(b.win.sauvegarderDonneesSelonMode('indicesAssiduite', {}, { discret: true })).toBe(true);
        expect(b.appels).toEqual([]);
    });

    it('le message « Les données sont sauvegardées » a quitté le code (#618)', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'modes.js'), 'utf8');
        expect(src.replace(/\/\/.*$/gm, '')).not.toContain('Les données sont sauvegardées');
    });
});

describe('lot B · les sites vivants ne disent un succès que sur `true` (#618) — lecture du code', () => {
    // Le comportement est éprouvé au navigateur ; ici, le verrou qui rougit si un site
    // redevient un appel nu ou un `if (!…)` que `'quota'` traverserait.
    const lire = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');
    const cas = [
        // Lot D : « Présences enregistrées » est parti (le témoin le dit) ; le recalcul de l'assiduité
        // et l'état de la séance ne suivent qu'une écriture réelle.
        ['saisie-presences.js', "sauvegarderDonneesSelonMode('presences', presences, { geste }) !== true) return false;", 'calculerEtSauvegarderIndicesAssiduite();'],
        // Lot C : le geste est le verrouillage, et l'échec rend le tableau lu (R4) avant de sortir.
        ['evaluation.js', "{ geste: 'Verrouillage de l\\'évaluation' }) !== true) {", '_traiterPostRepriseMod(evaluations, indexEval, evaluationId);'],
        ['evaluation-sauvegarde.js', "{ geste: 'Verrouillage de l\\'évaluation' }) !== true) {", '_postSauvegardeSauv(evaluation, groupeCoursActif);'],
        ['liste-evaluations.js', "{ geste: 'Suppression de l\\'évaluation' }) !== true) return;", "'Évaluation supprimée'"]
    ];
    for (const [fichier, garde, succes] of cas) {
        it(`${fichier} : la garde \`!== true\` précède le succès`, () => {
            const src = lire(fichier);
            const iGarde = src.indexOf(garde);
            expect(iGarde, 'garde absente').toBeGreaterThan(-1);
            expect(src.indexOf(succes, iGarde), 'succès absent après la garde').toBeGreaterThan(iGarde);
        });
    }
});

describe('lot B · relecture de Cowork, R1 — la clé écrite accompagne le témoin', () => {
    // Le témoin n'efface un « Non enregistré » que par le succès de LA MÊME clé : il faut
    // donc qu'il la reçoive, sur l'échec comme sur le succès. Comportement du témoin lui-même
    // (l'échec reste sous le succès d'une autre clé) : banc WebKit.
    it('échec et succès portent la clé effective (préfixe de trimestre compris)', () => {
        const echec = monter(quota);
        const vuEchec = [];
        echec.win.temoinEnregistrement.nonEnregistre = (...a) => vuEchec.push(a);
        echec.win.sauvegarderDonneesSelonMode('presences', [1], { geste: 'g' });
        expect(vuEchec[0][2]).toBe('a2026_presences');

        const ok = monter(accepte);
        const vuOk = [];
        ok.win.temoinEnregistrement.enregistre = (...a) => vuOk.push(a);
        ok.win.sauvegarderDonneesSelonMode('presences', [1]);
        expect(vuOk).toEqual([['a2026_presences']]);
    });
});

describe('lot B · relecture de Cowork, R2 — une migration refusée ne se marque pas faite', () => {
    function monterMigration(ecritureAcceptee) {
        const store = { h2026_productions: [{ id: 'P1', description: 'Lire un conte' }] };
        const db = {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            removeSync: (k) => { delete store[k]; },
            get: async () => null, set: async () => {}
        };
        const win = chargerScript('js/migrations.js', {
            db, cle: (k) => 'h2026_' + k,
            obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(store['h2026_' + k] || [])),
            sauvegarderDonneesSelonMode: (k, v) => {
                if (!ecritureAcceptee) return false;
                store['h2026_' + k] = v;
                return true;
            }
        });
        return { win, store };
    }

    it('écriture refusée → aucun drapeau, la migration sera rejouée', () => {
        const b = monterMigration(false);
        expect(b.win.migrerDescriptionVersActivite()).toBe(0);
        expect(b.store.migration_activiteApprentissage).toBeUndefined();
    });

    it('contrôle : écriture acceptée → la production migre, le drapeau est posé', () => {
        const b = monterMigration(true);
        expect(b.win.migrerDescriptionVersActivite()).toBe(1);
        expect(b.store.h2026_productions[0].activiteApprentissage).toBe('Lire un conte');
        expect(b.store.migration_activiteApprentissage).toBe(true);
    });
});
