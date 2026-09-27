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
        ['saisie-presences.js', "sauvegarderDonneesSelonMode('presences', presences,", "notifications.succes('Présences enregistrées')"],
        ['evaluation.js', "{ geste: 'Enregistrement de l\\'évaluation' }) !== true) return;", '_traiterPostRepriseMod(evaluations, indexEval, evaluationId);'],
        ['evaluation-sauvegarde.js', "{ geste: 'Enregistrement de l\\'évaluation' }) !== true) return;", '_postSauvegardeSauv(evaluation, groupeCoursActif);'],
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
