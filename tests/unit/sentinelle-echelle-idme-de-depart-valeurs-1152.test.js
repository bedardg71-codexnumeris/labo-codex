import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — les valeurs ponctuelles de l'« Échelle de départ (IDME) » (27 oct. 2026).
// Décision de Grégoire (27 oct., 17 h 48-17 h 49, « c'est important ») : le semis prend 40 / 65 / 75 / 100, les
// valeurs de son échelle, au lieu de 32 / 69,5 / 79,5 / 92,5. VERDICT-RELECTURE-2026-10-27-aide-lot-2b.md, § 4.1.
//
// TARIR, PAS RÉPARER : la source change, le stock ne bouge pas. Une échelle de départ déjà semée dans un trimestre
// garde ses valeurs (le semis vérifie la présence de `ECHELLE_IDME_DEPART` à l'écriture) ; un trimestre neuf reçoit
// les nouvelles. Rien d'autre ne change dans les niveaux semés.
//
// Le vrai `js/echelles.js`, sur un stockage en mémoire, avec un trimestre actif (clé namespacée).

function dbDepuisStore(store) {
    return {
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

function charger(store) {
    const win = { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false };
    return chargerScript('js/echelles.js', { db: dbDepuisStore(store), cle: win.cle }, win);
}

const CLE = 'a2026_echellesTemplates';

describe('Échelle de départ (IDME) · les valeurs ponctuelles de Grégoire, au semis seulement', () => {
    it('un trimestre neuf reçoit 40 / 65 / 75 / 100 ; bornes, codes, noms, paliers SOLO et couleurs inchangés', async () => {
        const store = {};
        await charger(store).assurerEchelleIdmeDeDepart();
        const niveaux = store[CLE][0].niveaux;
        expect(niveaux.map((n) => [n.code, n.valeurCalcul])).toEqual([['I', 40], ['D', 65], ['M', 75], ['E', 100]]);
        expect(niveaux.map((n) => [n.code, n.nom, n.niveauSOLO, n.min, n.max, n.couleur])).toEqual([
            ['I', 'Incomplet', 'unistructurel', 0, 64.99, 'var(--niveau-attention-critique)'],
            ['D', 'Développement', 'multistructurel', 65, 74.99, 'var(--niveau-attention-modere)'],
            ['M', 'Maîtrise', 'relationnel', 75, 84.99, 'var(--niveau-attention-minimal)'],
            ['E', 'Étendu', 'abstrait_etendu', 85, 100, 'var(--niveau-attention-nul)']
        ]);
    });

    it('un trimestre qui a déjà son échelle de départ, aux anciennes valeurs, la garde telle quelle', async () => {
        const ancienne = {
            id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 64.99, valeurCalcul: 32 },
                { code: 'D', nom: 'Développement', min: 65, max: 74.99, valeurCalcul: 69.5 },
                { code: 'M', nom: 'Maîtrise', min: 75, max: 84.99, valeurCalcul: 79.5 },
                { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92.5 }
            ]
        };
        const store = { [CLE]: [JSON.parse(JSON.stringify(ancienne))] };
        await charger(store).assurerEchelleIdmeDeDepart();
        expect(store[CLE]).toEqual([ancienne]);
    });
});
