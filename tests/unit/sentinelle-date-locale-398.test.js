import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #398 — « aujourd'hui » calculé en UTC dans 10 sites fonctionnels
// (rapport L5). new Date().toISOString().split('T')[0] rend la date UTC : à
// Toronto, « aujourd'hui » devient demain dès 20 h EDT — une séance saisie en
// soirée comptait immédiatement des absences (garde d'assiduité), les snapshots
// lisaient le jour calendaire de demain. Le fix : SSOT window.dateLocaleYMD()
// (js/date-utils.js) + bascule des 10 sites.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

// « Soirée à Toronto » déterministe quel que soit le fuseau du runner : une
// sous-classe dont les accesseurs LOCAUX rendent le 5 août, alors que l'instant
// UTC est déjà le 6 août — exactement la situation de 21 h EDT.
class DateSoirToronto extends Date {
    constructor() { super('2026-08-06T01:00:00Z'); } // 5 août, 21 h, UTC−4
    getFullYear() { return 2026; }
    getMonth() { return 7; }   // août (0-based)
    getDate() { return 5; }
}

describe('#398 · dateLocaleYMD — la SSOT du « aujourd\'hui » est LOCALE', () => {
    it('en soirée (21 h EDT), l\'UTC rend demain, dateLocaleYMD rend aujourd\'hui', () => {
        const win = chargerScript('js/date-utils.js', {});
        const soir = new DateSoirToronto();
        expect(soir.toISOString().split('T')[0]).toBe('2026-08-06'); // le bug d'avant
        expect(win.dateLocaleYMD(soir)).toBe('2026-08-05');          // le fix
    });

    it('format YYYY-MM-DD avec zéros de tête', () => {
        const win = chargerScript('js/date-utils.js', {});
        expect(win.dateLocaleYMD(new Date(2026, 0, 3))).toBe('2026-01-03');
    });
});

describe('#398 · intégration — la garde « séance du jour » de calculerAssiduite suit la date LOCALE', () => {
    it('séance du jour sans saisie pour l\'étudiant → exclue (avant : comptée comme absence après 20 h)', () => {
        // Fixture dans le passé : la séance « du jour » est le 2020-01-06. Le
        // stub dateLocaleYMD dit « aujourd'hui = 2020-01-06 » ; l'ancien code
        // (toISOString = vraie date courante) verrait 2020-01-06 < aujourd'hui
        // → séance passée saisie par le groupe → ABSENCE immédiate.
        const store = {
            groupeEtudiants: [{ da: '1111111' }, { da: '2222222' }],
            presences: [{ da: '2222222', date: '2020-01-06', periodesPresentes: 2 }]
        };
        const win = chargerScript('js/indices.js', {
            db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: (k) => (k in store ? store[k] : null),
            obtenirSeancesCompletes: () => ({ '2020-01-06': {} }),
            obtenirNombrePeriodesSeance: () => 2,
            obtenirDureePeriode: () => 55
        });
        win.dateLocaleYMD = () => '2020-01-06'; // le site consulte la SSOT locale

        const r = win.calculerAssiduite('1111111', null);
        // Séance du jour, aucune saisie pour CET étudiant → elle ne compte pas encore.
        expect(r.nombreSeances).toBe(0);
        expect(r.indice).toBe(1);
    });
});

describe('#398 · cliquet — les 10 sites fonctionnels consultent la SSOT', () => {
    const attendus = [
        ['js/indices.js', 1],
        ['js/snapshots.js', 3],
        ['js/presences-apercu.js', 2],
        ['js/rythme.js', 2],
        ['js/interventions.js', 1],
        // #749 lot 3 (11 sept. 2026) : un second site, `derniereSeancePassee` —
        // la date par défaut de la saisie (dernière séance ≤ aujourd'hui, LOCAL).
        ['js/saisie-presences.js', 2]
    ];

    it.each(attendus)('%s : %i appel(s) à window.dateLocaleYMD()', (fichier, n) => {
        const src = lire(...fichier.split('/'));
        const occ = src.match(/window\.dateLocaleYMD\(\)/g) || [];
        expect(occ.length).toBe(n);
        // et plus AUCUN « aujourd'hui » dérivé de toISOString dans ces fichiers
        expect(src).not.toMatch(/aujourd[hH]ui = (dateLimite \|\| )?new Date\(\)\.toISOString\(\)/);
    });

    it('js/date-utils.js est chargé dans index.html (avant les modules qui le consomment)', () => {
        const html = lire('index.html');
        expect(html).toMatch(/js\/date-utils\.js\?v=/);
        expect(html.indexOf('js/date-utils.js')).toBeLessThan(html.indexOf('js/indices.js?v='));
    });
});
