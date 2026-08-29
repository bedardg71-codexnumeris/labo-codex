import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #574 (29 août 2026) — PLUS AUCUNE ÉCHELLE N'EST SEMÉE PAR LE CODE.
//
// Arbitrage de Grégoire (option B) : l'échelle générique (`valeur`, pas
// `valeurCalcul`) et les deux gabarits d'échelle (sans valeur, ou `valeurNumerique`)
// étaient NON CALCULABLES depuis #527. Plutôt que de leur poser des valeurs
// choisies par le projet, on n'offre plus que des échelles que l'utilisateur
// complète. Ce banc tient trois bords :
//   A — le boot du module Échelles ne sème rien, même quand cle() est namespacé ;
//   B — `initialiserTousLesGabarits` ne touche pas `bibliothequeEchelles` ;
//   C — la SONDE `_sonder574` (lecture seule) voit une échelle fabriquée, un niveau
//       sans valeur et un usage — un zéro qui ne lirait rien serait un mensonge.
//   Plus un CLIQUET statique : les deux symboles retirés ne reviennent pas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store, ecritures) {
    return {
        get: async (c, d) => (c in store ? JSON.parse(JSON.stringify(store[c])) : (d !== undefined ? d : null)),
        getSync: (c, d) => (c in store ? JSON.parse(JSON.stringify(store[c])) : (d !== undefined ? d : null)),
        set: async (c, v) => { ecritures.push(c); store[c] = v; },
        setSync: (c, v) => { ecritures.push(c); store[c] = v; },
        keys: async () => Object.keys(store)
    };
}

function chargerEchelles(store) {
    const ecritures = [];
    const db = dbDepuisStore(store, ecritures);
    const win = chargerScript('js/echelles.js', {
        db, cle: (k) => 'h2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        estTrimestreArchive: () => false,
        localStorage: { }
    });
    return { win, ecritures };
}

describe('#574 · A — le boot du module Échelles ne sème plus rien', () => {
    it('initialiserModuleEchelles sur un trimestre vide : aucune échelle écrite', async () => {
        const store = { trimestres: [{ id: 'h2026', actif: true }] };
        const { win, ecritures } = chargerEchelles(store);
        expect(win.assurerEchelleGenerique).toBeUndefined();
        if (typeof win.initialiserModuleEchelles === 'function') {
            try { await win.initialiserModuleEchelles(); } catch (e) { /* DOM absent : le semis, lui, n'a pas besoin de DOM */ }
        }
        expect(store.h2026_echellesTemplates, 'aucune échelle générique semée').toBeUndefined();
        expect(ecritures.filter(k => k.endsWith('echellesTemplates'))).toEqual([]);
    });
});

describe('#574 · B — plus de gabarit d\'échelle', () => {
    it('initialiserTousLesGabarits laisse bibliothequeEchelles intacte', () => {
        const store = {};
        const win = chargerScript('js/gabarits-utils.js', {
            db: { getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)), setSync: (c, v) => { store[c] = v; },
                  get: async (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)), set: async (c, v) => { store[c] = v; } },
            cle: (k) => 'h2026_' + k, echapperHtml: (t) => String(t == null ? '' : t),
            estRessourceSupprimee: () => false, marquerRessourceSupprimee: () => {}
        });
        win.GabaritsUtils.initialiserTousLesGabarits();
        expect(store.bibliothequeEchelles).toBeUndefined();
        expect(win.GabaritsUtils.GABARITS_ECHELLES_DEFAUT).toBeUndefined();
        // Les grilles, elles, sont toujours semées : la garde vise les échelles, pas la famille.
        expect((store.bibliothequeGrilles || []).length).toBeGreaterThan(0);
    });
});

describe('#574 · C — la sonde voit ce qu\'il y a, et n\'écrit rien', () => {
    it('une échelle fabriquée, un niveau sans valeur, un usage par trimestre', async () => {
        const store = {
            trimestres: [{ id: 'a2025', actif: false }, { id: 'h2026', actif: true }],
            a2025_echellesTemplates: [
                { id: 'ECH_OK', nom: 'Complète', niveaux: [{ code: 'A', valeurCalcul: 80 }, { code: 'B', valeurCalcul: 0 }] },
                { id: 'ECH_COPIE', idOriginal: 'GABARIT_ECHELLE_IDME', nom: 'Copie de gabarit', niveaux: [{ code: 'I' }, { code: 'M', valeurCalcul: '' }] }
            ],
            h2026_echellesTemplates: [
                { id: 'ECHELLE_GENERIQUE', nom: 'Générique', niveaux: [{ code: 'I', valeur: 45 }] }
            ],
            a2025_evaluationsSauvegardees: [{ id: 'EV_1', echelleId: 'ECH_COPIE' }, { id: 'EV_2', echelleId: 'ECH_OK' }],
            h2026_productions: [{ id: 'P_1', echelleId: 'ECHELLE_GENERIQUE' }],
            cartouches_G1: [{ id: 'C_1', echelleId: 'ECHELLE_GENERIQUE' }, { id: 'C_2', echelleId: 'ECH_OK' }]
        };
        const { win, ecritures } = chargerEchelles(store);
        const r = await win._sonder574();

        expect(r.echellesFabriquees.map(e => e.echelleId).sort()).toEqual(['ECHELLE_GENERIQUE', 'ECH_COPIE']);
        // ECH_OK : le zéro est une VALEUR, pas une absence — pas dans la liste.
        expect(r.niveauxSansValeur.map(n => n.echelleId).sort()).toEqual(['ECHELLE_GENERIQUE', 'ECH_COPIE']);
        expect(r.niveauxSansValeur.find(n => n.echelleId === 'ECH_COPIE').niveauxSansValeur).toBe(2);
        expect(r.usages).toEqual({ evaluations: 1, productions: 1, cartouches: 1 });
        expect(ecritures).toEqual([]);
    });
});

describe('#574 · cliquet — les deux symboles retirés ne reviennent pas', () => {
    it('ni assurerEchelleGenerique ni GABARITS_ECHELLES_DEFAUT hors commentaires', () => {
        const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
        const echelles = nettoyer(readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8'));
        const gabarits = nettoyer(readFileSync(path.join(racineProjet, 'js', 'gabarits-utils.js'), 'utf8'));
        expect(echelles).not.toContain('assurerEchelleGenerique');
        expect(echelles).not.toContain("id: 'ECHELLE_GENERIQUE'");
        expect(gabarits).not.toContain('GABARITS_ECHELLES_DEFAUT');
        expect(gabarits).not.toContain('GABARIT_ECHELLE_');
    });
});
