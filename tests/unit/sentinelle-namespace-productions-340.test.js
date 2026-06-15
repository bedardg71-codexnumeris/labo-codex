import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Bug terrain #340 (Grégoire, 12 juin 2026) — un changement de trimestre a
// écrasé `h2026_productions` avec le contenu intégral de `a2025_productions`
// (11 productions du cours COURS1766455789356, dans localStorage ET IDB).
// Mécanisme : un read-modify-write asynchrone lit la collection sous un
// namespace puis, le trimestre actif ayant basculé, ré-écrit le tableau périmé
// sous le namespace du NOUVEAU trimestre (cle('productions') dynamique).
//
// Décision (Grégoire, 15 juin 2026) : garde-fou ACTIF au point de persistance
// (db.set/setSync) qui BLOQUE l'écriture incohérente quel que soit l'écrivain,
// et journalise la pile d'appel du fautif. La logique métier vit dans
// js/productions-namespace-garde.js. Cette sentinelle valide cette logique
// (fonction pure + garde branchée sur un db stub) et le câblage db.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Charge le module de garde avec un db stub. Le module enregistre sa garde via
// db.enregistrerGardeEcriture('productions', fn) ; on capture cette fn.
function chargerGarde(store) {
    let gardeEnregistree = null;
    const db = {
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        enregistrerGardeEcriture: (cleBase, fn) => {
            if (cleBase === 'productions') gardeEnregistree = fn;
        }
    };
    const fauxWindow = chargerScript('js/productions-namespace-garde.js', { db });
    return { fauxWindow, garde: gardeEnregistree, evaluer: fauxWindow.evaluerCoherenceProductions };
}

// Cours témoins : un cours A25 (le fautif du terrain) + un cours H26 sain.
const COURS = [
    { id: 'COURS1766455789356', trimestreId: 'a2025' },
    { id: 'h2026-601-101-MQ-00001', trimestreId: 'h2026' }
];
const prodA25 = (id) => ({ id, coursId: 'COURS1766455789356' });
const prodH26 = (id) => ({ id, coursId: 'h2026-601-101-MQ-00001' });

describe('#340 · garde-fou anti-contamination productions inter-trimestres', () => {
    it('BLOQUE la signature exacte du terrain : tableau A25 écrit sous h2026_productions (cible avait du natif)', () => {
        const store = {
            cours: COURS,
            // État sain avant la corruption : 10 artefacts H26.
            h2026_productions: [prodH26('p1'), prodH26('p2')]
        };
        const { garde } = chargerGarde(store);
        expect(typeof garde).toBe('function');

        const tableauA25 = [prodA25('a1'), prodA25('a2'), prodA25('a3')];
        const res = garde('h2026_productions', tableauA25);

        expect(res.coherent).toBe(false);
        expect(res.fautifs).toHaveLength(3);
        expect(res.raison).toContain('a2025');
        expect(res.raison).toContain('h2026');
    });

    it('BLOQUE un dump 100 % étranger même sur cible vide (≥ 2 items étrangers)', () => {
        const store = { cours: COURS, h2026_productions: [] };
        const { garde } = chargerGarde(store);
        const res = garde('h2026_productions', [prodA25('a1'), prodA25('a2')]);
        expect(res.coherent).toBe(false);
    });

    it('AUTORISE une écriture native saine (productions du bon trimestre)', () => {
        const store = { cours: COURS, h2026_productions: [prodH26('p1')] };
        const { garde } = chargerGarde(store);
        const res = garde('h2026_productions', [prodH26('p1'), prodH26('p2')]);
        expect(res.coherent).toBe(true);
    });

    it('AUTORISE l\'ajout d\'UN item de bibliothèque inter-trimestres à un cours peuplé', () => {
        const store = { cours: COURS, h2026_productions: [prodH26('p1')] };
        const { garde } = chargerGarde(store);
        // Un item étranger ajouté MAIS du natif coexiste → légitime, pas bloqué.
        const res = garde('h2026_productions', [prodH26('p1'), prodA25('copie-biblio')]);
        expect(res.coherent).toBe(true);
    });

    it('AUTORISE l\'ajout d\'UN seul item de bibliothèque sur un cours vide (1re production)', () => {
        const store = { cours: COURS, h2026_productions: [] };
        const { garde } = chargerGarde(store);
        const res = garde('h2026_productions', [prodA25('copie-biblio')]);
        expect(res.coherent).toBe(true);
    });

    it('NEUTRE : productions sans coursId (bibliothèque/démo) jamais bloquées', () => {
        const store = { cours: COURS, h2026_productions: [] };
        const { garde } = chargerGarde(store);
        const res = garde('h2026_productions', [{ id: 'x' }, { id: 'y' }]);
        expect(res.coherent).toBe(true);
    });

    it('NE BLOQUE PAS une clé non namespacée (boot/legacy)', () => {
        const store = { cours: COURS };
        const { garde } = chargerGarde(store);
        expect(garde('productions', [prodA25('a1'), prodA25('a2')]).coherent).toBe(true);
    });

    it('fonction pure evaluerCoherenceProductions : cours inconnu = indéterminé = autorisé', () => {
        const { evaluer } = chargerGarde({ cours: COURS });
        const map = { 'COURS1766455789356': 'a2025' };
        // coursId absent de la map → neutre.
        const res = evaluer('h2026_productions', [{ id: 'z', coursId: 'COURS_DISPARU' }], map, []);
        expect(res.coherent).toBe(true);
    });
});

describe('#340 · câblage db.js (la garde est consultée avant toute persistance)', () => {
    const dbSource = readFileSync(path.join(racineProjet, 'js', 'db.js'), 'utf8');

    it('setSync consulte _ecritureAutorisee et abandonne si bloqué', () => {
        // La garde doit être appelée dans setSync ET la fonction doit return
        // (donc ne rien persister) quand l'écriture est refusée.
        expect(dbSource).toMatch(/setSync\(key, value\)\s*\{[\s\S]*?if \(!this\._ecritureAutorisee\(key, value\)\) return;/);
    });

    it('set (async) consulte _ecritureAutorisee et abandonne si bloqué', () => {
        expect(dbSource).toMatch(/async set\(key, value\)\s*\{[\s\S]*?if \(!this\._ecritureAutorisee\(key, value\)\) return;/);
    });

    it('_ecritureAutorisee journalise la pile et retourne false quand une garde refuse', () => {
        expect(dbSource).toContain('Écriture BLOQUÉE');
        expect(dbSource).toMatch(/_ecritureAutorisee\(key, value\)\s*\{/);
    });
});
