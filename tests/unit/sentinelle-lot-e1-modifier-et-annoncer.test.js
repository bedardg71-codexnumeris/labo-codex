import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// ═══════════════════════════════════════════════════════════════════════════
// LOT E1 DE L'ENREGISTREMENT — `modifierEtAnnoncer` (D0 point 2, D3 ; 27 sept. 2026)
// Les éditeurs de la Conception écrivent par `db.modifier` (#510), pas par
// `sauvegarderDonneesSelonMode` : le témoin commun ne parlait pas pour eux.
// Cette aide lui donne la parole avec le même contrat que le lot B :
// « Enregistré » après une écriture qui a eu lieu, « Non enregistré » avec la raison
// et le geste sur un échec, rien quand le mutateur renonce.
//
// Ce banc charge `modes.js` RÉEL ; `db.modifier` et le témoin sont des doublures.
// ═══════════════════════════════════════════════════════════════════════════

function monter({ echec = null, gardeRefuse = false } = {}) {
    const appels = [];
    const ecrit = {};
    const db = {
        getSync: () => null, setSync: () => true,
        get: async () => null, set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {},
        _ecritureAutorisee: () => !gardeRefuse,
        async modifier(k, mutateur, defaut) {
            const valeur = await mutateur(k in ecrit ? ecrit[k] : defaut);
            if (valeur === undefined) return undefined;
            if (echec) throw echec();
            ecrit[k] = valeur;
            return valeur;
        }
    };
    const cle = (k) => 'a2026_' + k;
    const win = {
        addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'a2026', cle,
        temoinEnregistrement: {
            enregistre: (k) => appels.push(['enregistre', k]),
            nonEnregistre: (raison, geste, k) => appels.push(['nonEnregistre', raison, geste, k]),
            fermer: () => {}
        }
    };
    const notifications = { succes() {}, erreur() {}, warning() {}, info() {} };
    chargerScript('js/modes.js', { db, cle, notifications, obtenirPreference: () => null, definirPreference: () => {} }, win);
    return { win, appels, ecrit };
}

const quota = () => { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; return e; };
const panne = () => new Error('Transaction IndexedDB avortée');

describe('lot E1 · modifierEtAnnoncer fait parler le témoin pour les écritures par db.modifier', () => {
    it('écriture réussie → « Enregistré » sur la clé écrite, la valeur est rendue', async () => {
        const b = monter();
        const r = await b.win.modifierEtAnnoncer('a2026_grillesTemplates', (l) => [...l, 'G'], [], { geste: 'Modifier la grille' });
        expect(r).toEqual(['G']);
        expect(b.appels).toEqual([['enregistre', 'a2026_grillesTemplates']]);
    });

    it('le mutateur renonce (undefined) → le témoin se tait, rien n\'est écrit', async () => {
        const b = monter();
        const r = await b.win.modifierEtAnnoncer('a2026_grillesTemplates', () => undefined, []);
        expect(r).toBeUndefined();
        expect(b.appels).toEqual([]);
        expect(b.ecrit).toEqual({});
    });

    it('discret → aucun « Enregistré »', async () => {
        const b = monter();
        await b.win.modifierEtAnnoncer('a2026_grillesTemplates', () => ['G'], [], { discret: true });
        expect(b.appels).toEqual([]);
    });

    for (const [nom, echec, motif] of [
        ['quota dépassé', quota, /mémoire du navigateur est pleine/],
        ['écriture avortée', panne, /navigateur a refusé l'écriture/]
    ]) {
        it(`${nom} → « Non enregistré » avec la raison et le geste, l'erreur est relancée, aucun succès`, async () => {
            const b = monter({ echec });
            await expect(b.win.modifierEtAnnoncer('a2026_echellesTemplates', () => ['E'], [], { geste: 'Modifier l\'échelle' }))
                .rejects.toThrow();
            expect(b.appels).toHaveLength(1);
            expect(b.appels[0][0]).toBe('nonEnregistre');
            expect(b.appels[0][1]).toMatch(motif);
            expect(b.appels[0][2]).toBe('Modifier l\'échelle');
            expect(b.appels[0][3]).toBe('a2026_echellesTemplates');
        });
    }

    it('garde #340 qui refuse → « Non enregistré » (garde), rien d\'écrit, aucun « Enregistré »', async () => {
        const b = monter({ gardeRefuse: true });
        const r = await b.win.modifierEtAnnoncer('a2026_pratiquesConfigurables', () => ['P'], [], { geste: 'Modifier la pratique' });
        expect(r).toBeUndefined();
        expect(b.ecrit).toEqual({});
        expect(b.appels).toHaveLength(1);
        expect(b.appels[0][0]).toBe('nonEnregistre');
        expect(b.appels[0][1]).toMatch(/ne correspondent pas au trimestre ouvert/);
    });
});
