import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #328 L2-c — dégonfler le dernier champ miroir de modalitesEvaluation : `configPAN.jetons`.
// La config des jetons DÉRIVE désormais de la pratique active (obtenirConfigJetons →
// obtenirConfigJetonsPratique), plus aucun snapshot/miroir (plan §4 bis D3).
//
// Verrouille :
//  1. RATCHET statique : plus AUCUN fichier de js/ n'accède (lit OU écrit) au miroir
//     `configPAN.jetons` — le balayage couvre tout js/ (ratchet au maximum).
//  2. purgerLegacy() retire `configPAN.jetons` des données stockées, en CONSERVANT
//     `configPAN.portfolio` (et le reste de configPAN).
//  3. D3 (sémantique) : la config suit la pratique VIVANTE — une modification de la
//     pratique se reflète à la lecture suivante, sans aucune synchronisation.

const MOTIF_ACCES_MIROIR = /\bconfigPAN\.jetons\b/;

function listerFichiersJs(dossier) {
    const resultats = [];
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, entree.name);
        if (entree.isDirectory()) resultats.push(...listerFichiersJs(chemin));
        else if (entree.name.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

describe('#328 L2-c · ratchet miroir `configPAN.jetons` (statique)', () => {

    it('le détecteur mord (break-test) : il reconnaît un accès miroir', () => {
        expect(MOTIF_ACCES_MIROIR.test('modalites.configPAN.jetons = x')).toBe(true);
        expect(MOTIF_ACCES_MIROIR.test('const j = m.configPAN.jetons;')).toBe(true);
    });

    it('PLUS AUCUN fichier de js/ n\'accède au miroir configPAN.jetons (hors commentaires)', () => {
        const fautifs = [];
        for (const fichier of listerFichiersJs(path.join(racineProjet, 'js'))) {
            const lignes = fs.readFileSync(fichier, 'utf8').split('\n');
            lignes.forEach((ligne, i) => {
                const sansCommentaire = ligne.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
                if (MOTIF_ACCES_MIROIR.test(sansCommentaire)) {
                    fautifs.push(`${path.relative(racineProjet, fichier)}:${i + 1}`);
                }
            });
        }
        expect(
            fautifs,
            'Accès au miroir configPAN.jetons réintroduit — la config des jetons se DÉRIVE ' +
            'via obtenirConfigJetons() / obtenirConfigJetonsPratique() (SSOT pratique, plan §4 bis D3)'
        ).toEqual([]);
    });
});

describe('#353 · purgerLegacy retire le miroir configPAN EN ENTIER', () => {
    // ⚠ CE BLOC A CHANGÉ D'INVARIANT LE 10 AOÛT, PAS DE CAMP. #328 L2-c ne
    // retirait que `configPAN.jetons` et CONSERVAIT `portfolio`, parce que
    // `portfolio` avait encore des lecteurs. G2-b (#436, 9 août) a retiré les
    // derniers ; décision Grégoire du 9 août : le miroir entier rejoint la
    // purge, dans la séance #353. Vérifié au code le 10 août : zéro lecteur,
    // zéro écrivain hors commentaires dans tout `js/`.
    // ⮕ Le gain de budget est NÉGLIGEABLE (~285 caractères par trimestre) :
    //   c'est de l'hygiène zéro-dette, pas une réponse à la saturation.
    let store;
    const db = {
        getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; }
    };
    const win = chargerScript('js/pratiques/modalites-evaluation.js', { db, cle: (k) => 't1_' + k });
    win.enumererTrimestres = () => [{ id: 't1' }];

    beforeEach(() => { store = {}; });

    it('retire configPAN au complet — jetons ET portfolio', () => {
        store['t1_modalitesEvaluation'] = {
            pratiquesUtilisees: ['garder'],          // le reste des modalités survit
            configPAN: {
                jetons: { actif: true, delai: { nombre: 9 } },
                portfolio: { methodeSelection: 'meilleurs', nombreARetenir: 4 },
                _migrationV1Complete: true
            }
        };
        const n = win.modalitesEvaluation.purgerLegacy();
        expect(n).toBe(1);
        const m = store['t1_modalitesEvaluation'];
        expect('configPAN' in m).toBe(false);
        // Ce qui n'est PAS le miroir n'est pas touché : une purge qui emporte
        // ses voisins serait une perte, pas un ménage.
        expect(m.pratiquesUtilisees).toEqual(['garder']);
    });

    it('idempotent : rien à purger si configPAN est déjà absent', () => {
        store['t1_modalitesEvaluation'] = { pratiquesUtilisees: ['x'] };
        expect(win.modalitesEvaluation.purgerLegacy()).toBe(0);
    });

    it('résiste à une réintroduction par import (le patron sans drapeau)', () => {
        // Un backup Codex antérieur PORTE la clé et la réintroduit à l'import.
        // La purge tourne à chaque démarrage, sans drapeau : elle repasse.
        store['t1_modalitesEvaluation'] = { configPAN: { portfolio: { x: 1 } } };
        expect(win.modalitesEvaluation.purgerLegacy()).toBe(1);
        store['t1_modalitesEvaluation'].configPAN = { portfolio: { x: 1 } };  // réimport
        expect(win.modalitesEvaluation.purgerLegacy()).toBe(1);
        expect('configPAN' in store['t1_modalitesEvaluation']).toBe(false);
    });
});

describe('#328 L2-c · D3 — la config des jetons suit la pratique VIVANTE (pas de snapshot)', () => {
    let store;
    const db = {
        get: async (k) => (k in store ? store[k] : null),
        getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; }
    };
    const win = chargerScript('js/evaluation-jetons.js', {
        db, cle: (k) => k, obtenirIdPratiqueActive: () => 'P'
    });

    it('modifier la pratique change la config lue ensuite, sans aucune synchronisation', () => {
        store = { pratiquesConfigurables: [{ id: 'P', configuration: { jetons: { activer: true, delai: { nombre: 3, dureeJours: 2 }, reprise: { nombre: 3 } } } }] };
        expect(win.obtenirConfigJetons().delai.nombre).toBe(3);

        // La pratique vivante est éditée (moins de jetons) — AUCUN appel de synchronisation.
        store.pratiquesConfigurables[0].configuration.jetons.delai.nombre = 1;
        expect(win.obtenirConfigJetons().delai.nombre).toBe(1);

        // Désactivation de la pratique → reflétée immédiatement.
        store.pratiquesConfigurables[0].configuration.jetons.activer = false;
        expect(win.obtenirConfigJetons().actif).toBe(false);
    });
});
