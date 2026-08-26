import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #476 (26 août 2026) — LA RÉPARATION NE DOIT PAS LIBÉRER LES VRAIS
// EXEMPLES.
//
// `scripts/reparation-476-copies-marquees-exemple.js` retire la marque démo des
// copies restées bloquées en lecture seule. Tout son danger tient dans un seul
// critère : marque démo ET id absent du pack de démarrage. Le drapeau seul ne
// suffit pas — les exemples fournis le portent aussi, légitimement.
//
// ⚠ LE CAS QUI TUE : si le pack n'est pas chargé, « id absent du pack » devient
// vrai pour TOUT. Un critère qui devient universel quand sa référence manque
// n'est pas un critère, c'est un accident — et il libérerait la démo entière.
// Le script doit REFUSER de s'exécuter dans ce cas.

/* ------------------------------------------------------------------ harnais */

function monter({ store, pack, auteur = 'Grégoire Bédard' }) {
    // ⚠ `console` est déjà un paramètre nommé de `chargerScript` : le repasser
    // dans `globaux` fait « Duplicate parameter name ». Le journal se capture
    // donc par espionnage, pas par injection.
    const globaux = {
        db: {
            get: async (k) => (k in store ? store[k] : null),
            set: async (k, v) => { store[k] = v; },
            keysSync: () => Object.keys(store),
            keys: async () => Object.keys(store)
        },
        PACK_DEMARRAGE: pack,
        BibliothequeUI: { obtenirAuteurActif: () => auteur }
    };
    const journal = [];
    const espion = vi.spyOn(console, 'log').mockImplementation((m) => journal.push(String(m)));
    const win = chargerScript('scripts/reparation-476-copies-marquees-exemple.js', globaux);
    espion.mockRestore();
    return { win, store, journal, capturer: async (fn) => {
        const e = vi.spyOn(console, 'log').mockImplementation((m) => journal.push(String(m)));
        try { return await fn(); } finally { e.mockRestore(); }
    } };
}

const PACK = {
    grillesTemplates: [{ id: 'GRILLE_DEMO_1', nom: 'Grille d\'exemple' }],
    echellesTemplates: [{ id: 'ECHELLE_DEMO_1', nom: 'IDME d\'exemple' }],
    productions: []
};

const etatInitial = () => ({
    a2026_grillesTemplates: [
        // L'exemple FOURNI : son id est dans le pack. Il doit rester tel quel.
        { id: 'GRILLE_DEMO_1', nom: 'Grille d\'exemple', isDemo: true, auteur: 'Labo Codex' },
        // La COPIE mal faite : marquée démo, id inconnu du pack.
        { id: 'GRILLE_1755', nom: 'Grille d\'exemple (copie)', isDemo: true,
          auteur: 'Labo Codex', inspireDe: { nom: 'Grille d\'exemple', auteur: 'Labo Codex' } },
        // Une grille ordinaire : rien à y faire.
        { id: 'GRILLE_2000', nom: 'Ma grille', auteur: 'Grégoire Bédard' }
    ],
    a2026_echellesTemplates: [
        { id: 'ECHELLE_9001', nom: 'IDME (copie)', estDemo: true, auteur: 'Labo Codex' }
    ]
});

/* ------------------------------------------------------- A — le dry-run ne touche rien */

describe('#476 · A — le dry-run rapporte sans écrire', () => {
    it('A.a l\'état des données est identique après un dry-run', async () => {
        const store = etatInitial();
        const avant = JSON.stringify(store);
        const { win } = monter({ store, pack: PACK });

        const r = await win.reparer476();

        expect(r.total).toBe(2);
        expect(JSON.stringify(store), 'le dry-run a écrit').toBe(avant);
    });
});

/* --------------------------------------- B — LE CRITÈRE : copies oui, exemples non */

describe('#476 · B — les exemples fournis ne sont jamais libérés', () => {
    it('B.a LE CAS QUI PORTE LE SENS : la copie est libérée, l\'exemple reste intact', async () => {
        const store = etatInitial();
        const { win } = monter({ store, pack: PACK });

        await win.reparer476({ executer: true });

        const [exemple, copie, ordinaire] = store.a2026_grillesTemplates;
        expect(exemple.isDemo, 'l\'exemple fourni DOIT rester marqué').toBe(true);
        expect(exemple.auteur).toBe('Labo Codex');

        expect(copie.isDemo, 'la copie ne doit plus être marquée').toBeUndefined();
        expect(copie.estDemo).toBeUndefined();
        expect(copie.auteur).toBe('Grégoire Bédard');

        expect(ordinaire, 'une grille ordinaire n\'est pas touchée')
            .toEqual({ id: 'GRILLE_2000', nom: 'Ma grille', auteur: 'Grégoire Bédard' });
    });

    it('B.b les deux orthographes du drapeau sont traitées', async () => {
        const store = etatInitial();
        const { win } = monter({ store, pack: PACK });
        await win.reparer476({ executer: true });
        expect(store.a2026_echellesTemplates[0].estDemo).toBeUndefined();
    });

    it('B.c la trace CC est PRÉSERVÉE, et complétée avant d\'être déplacée', async () => {
        const store = etatInitial();
        const { win } = monter({ store, pack: PACK });
        await win.reparer476({ executer: true });

        const copie = store.a2026_grillesTemplates[1];
        expect(copie.inspireDe, 'inspireDe ne s\'efface jamais').toEqual({
            nom: 'Grille d\'exemple', auteur: 'Labo Codex'
        });
        // `auteur` valait « Labo Codex » et rien ne le disait ailleurs : il est
        // versé dans `auteurOriginal` AVANT la réattribution. On complète la
        // chaîne d'attribution, on n'en échange pas une contre une autre.
        expect(copie.auteurOriginal).toBe('Labo Codex');
    });
});

/* ------------------------------------------ C — le refus quand la référence manque */

describe('#476 · C — sans pack, le script refuse', () => {
    it('C.a LE CAS QUI TUE : pack absent ⇒ refus, et RIEN n\'est écrit', async () => {
        const store = etatInitial();
        const avant = JSON.stringify(store);
        const { win, journal, capturer } = monter({ store, pack: null });

        const r = await capturer(() => win.reparer476({ executer: true }));

        expect(r.refuse, 'le script doit refuser').toBe(true);
        expect(JSON.stringify(store), 'la démo entière aurait été libérée').toBe(avant);
        expect(journal.join('\n')).toContain('REFUS');
    });

    it('C.b une collection que le pack ne décrit pas est SAUTÉE, pas devinée', async () => {
        const store = { a2026_productions: [{ id: 'PROD_1', nom: 'X', isDemo: true }] };
        const { win } = monter({ store, pack: { grillesTemplates: [] } });

        await win.reparer476({ executer: true });

        expect(store.a2026_productions[0].isDemo, 'sautée faute de référence').toBe(true);
    });
});

/* ------------------------------------------------------------- D — l'annulation */

describe('#476 · D — l\'annulation rend l\'état d\'avant', () => {
    it('D.a après annuler476, les données sont celles du départ', async () => {
        const store = etatInitial();
        const avant = JSON.stringify(store);
        const { win } = monter({ store, pack: PACK });

        await win.reparer476({ executer: true });
        expect(JSON.stringify(store)).not.toBe(avant);

        await win.annuler476();
        expect(JSON.stringify(store)).toBe(avant);
    });
});
