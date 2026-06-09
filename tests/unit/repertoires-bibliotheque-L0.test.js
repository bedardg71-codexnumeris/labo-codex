import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #320 Lot L0 — répertoires de classement des bibliothèques.
// Verrouille le contrat de js/repertoires-bibliotheque.js :
//  - DOSSIER EXCLUSIF : un item dans au plus un répertoire de la même biblio ;
//  - NON-DESTRUCTION : ne touche jamais les items, ni les autres bibliothèques ;
//  - cohérence : retrait d'un item (hook suppression) le sort de tout répertoire ;
//  - groupe virtuel « non classées » calculé, tolérant aux orphelins.
// L'UI (L1/L2) est hors périmètre de ce lot.

// db mock synchrone (la collection est petite → localStorage sync).
let store;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};

const win = chargerScript('js/repertoires-bibliotheque.js', { db });
const R = win.repertoiresBibliotheque;

beforeEach(() => { store = {}; });

// Helpers de fixtures
const repA = { id: 'a', nom: 'A', biblio: 'pratiques', itemIds: ['p1', 'p2'], ordre: 0 };
const repB = { id: 'b', nom: 'B', biblio: 'pratiques', itemIds: ['p3'], ordre: 1 };
const repAutre = { id: 'g', nom: 'G', biblio: 'grilles', itemIds: ['p1'], ordre: 0 };

describe('L0 · fonctions pures — création', () => {
    it('crée un répertoire avec itemIds vide et ordre = max+1', () => {
        const { repertoires, cree } = R.creerPur([repA, repB], { id: 'c', nom: 'C', biblio: 'pratiques' });
        expect(cree).toEqual({ id: 'c', nom: 'C', biblio: 'pratiques', itemIds: [], ordre: 2 });
        expect(repertoires).toHaveLength(3);
    });

    it('trime le nom et refuse un nom vide', () => {
        const ok = R.creerPur([], { id: 'c', nom: '  Essais  ', biblio: 'pratiques' });
        expect(ok.cree.nom).toBe('Essais');
        const vide = R.creerPur([], { id: 'c', nom: '   ', biblio: 'pratiques' });
        expect(vide.cree).toBeNull();
        expect(vide.repertoires).toEqual([]);
    });

    it('ordre repart à 0 pour une biblio sans répertoire', () => {
        const { cree } = R.creerPur([repA], { id: 'x', nom: 'X', biblio: 'grilles' });
        expect(cree.ordre).toBe(0);
    });
});

describe('L0 · fonctions pures — assignation (DOSSIER EXCLUSIF)', () => {
    it('ajoute l\'item au répertoire cible', () => {
        const out = R.assignerPur([repA, repB], 'pX', 'b', 'pratiques');
        expect(out.find(r => r.id === 'b').itemIds).toContain('pX');
    });

    it('EXCLUSIVITÉ : retire l\'item de tout autre répertoire de la même biblio', () => {
        // p1 est dans A ; on l'assigne à B → il doit quitter A
        const out = R.assignerPur([repA, repB], 'p1', 'b', 'pratiques');
        expect(out.find(r => r.id === 'a').itemIds).not.toContain('p1');
        expect(out.find(r => r.id === 'b').itemIds).toContain('p1');
    });

    it('idempotent : ré-assigner au même répertoire ne crée pas de doublon', () => {
        const out = R.assignerPur([repA], 'p1', 'a', 'pratiques');
        expect(out.find(r => r.id === 'a').itemIds.filter(x => x === 'p1')).toHaveLength(1);
    });

    it('cible inexistante → no-op (inchangé)', () => {
        const base = [repA, repB];
        expect(R.assignerPur(base, 'p1', 'inexistant', 'pratiques')).toEqual(base);
    });

    it('n\'affecte pas les répertoires d\'une AUTRE bibliothèque (même itemId)', () => {
        // p1 existe dans repA (pratiques) et repAutre (grilles)
        const out = R.assignerPur([repA, repB, repAutre], 'p1', 'b', 'pratiques');
        expect(out.find(r => r.id === 'g').itemIds).toContain('p1'); // grilles intact
    });
});

describe('L0 · fonctions pures — retrait / suppression', () => {
    it('retirerItemPur sort l\'item de tous les répertoires de la biblio', () => {
        const out = R.retirerItemPur([repA, repB], 'p1', 'pratiques');
        expect(out.find(r => r.id === 'a').itemIds).not.toContain('p1');
    });

    it('retirerItemPur ne touche pas une autre biblio', () => {
        const out = R.retirerItemPur([repAutre], 'p1', 'pratiques');
        expect(out.find(r => r.id === 'g').itemIds).toContain('p1');
    });

    it('supprimerPur retire le répertoire (les items repassent non classés)', () => {
        const out = R.supprimerPur([repA, repB], 'a');
        expect(out.map(r => r.id)).toEqual(['b']);
    });

    it('renommerPur change le nom ; nom vide → inchangé', () => {
        expect(R.renommerPur([repA], 'a', 'Nouveau').find(r => r.id === 'a').nom).toBe('Nouveau');
        expect(R.renommerPur([repA], 'a', '  ').find(r => r.id === 'a').nom).toBe('A');
    });
});

describe('L0 · fonctions pures — vues', () => {
    it('repertoiresPourBibliothequePur filtre par biblio et trie par ordre', () => {
        const desordre = [{ ...repB, ordre: 5 }, { ...repA, ordre: 1 }, repAutre];
        const out = R.repertoiresPourBibliothequePur(desordre, 'pratiques');
        expect(out.map(r => r.id)).toEqual(['a', 'b']);
    });

    it('itemsNonClassesPur retourne les ids du pool absents de tout répertoire', () => {
        // classés : p1, p2 (A), p3 (B). Pool = p1..p4 → non classé = p4
        const out = R.itemsNonClassesPur([repA, repB], ['p1', 'p2', 'p3', 'p4'], 'pratiques');
        expect(out).toEqual(['p4']);
    });

    it('itemsNonClassesPur tolère un itemId orphelin (classé mais hors pool)', () => {
        // repA classe p1,p2 mais le pool ne contient que p2 → p1 orphelin, ignoré
        const out = R.itemsNonClassesPur([repA], ['p2'], 'pratiques');
        expect(out).toEqual([]); // p2 est classé, rien de non classé ; pas d'erreur sur p1
    });
});

describe('L0 · immuabilité', () => {
    it('les fonctions pures ne mutent pas la collection d\'entrée', () => {
        const base = [{ id: 'a', nom: 'A', biblio: 'pratiques', itemIds: ['p1'], ordre: 0 }];
        const snapshot = JSON.parse(JSON.stringify(base));
        R.assignerPur(base, 'p9', 'a', 'pratiques');
        R.retirerItemPur(base, 'p1', 'pratiques');
        R.supprimerPur(base, 'a');
        expect(base).toEqual(snapshot);
    });
});

describe('L3 · grouperPur (helper transversal de groupage)', () => {
    const items = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }];

    it('un groupe par dossier non vide (ordonné) + « Non classées » en dernier', () => {
        // A: p1,p2 ; B: p3 ; non classé: p4
        const g = R.grouperPur(items, [repA, repB], 'pratiques');
        expect(g.map(x => x.titre)).toEqual(['A', 'B', 'Non classées']);
        expect(g[0].items.map(i => i.id)).toEqual(['p1', 'p2']);
        expect(g[2].id).toBeNull();
        expect(g[2].items.map(i => i.id)).toEqual(['p4']);
    });

    it('omet un dossier vide (aucun item du lot dedans)', () => {
        const repVide = { id: 'v', nom: 'Vide', biblio: 'pratiques', itemIds: ['absent'], ordre: 2 };
        const g = R.grouperPur(items, [repA, repVide], 'pratiques');
        expect(g.map(x => x.titre)).not.toContain('Vide');
    });

    it('pas de groupe « Non classées » si tout est classé', () => {
        const g = R.grouperPur([{ id: 'p1' }, { id: 'p3' }], [repA, repB], 'pratiques');
        expect(g.map(x => x.titre)).toEqual(['A', 'B']);
    });

    it('ignore les répertoires d\'une autre biblio', () => {
        const g = R.grouperPur([{ id: 'p1' }], [repAutre], 'pratiques'); // repAutre = grilles
        expect(g.map(x => x.titre)).toEqual(['Non classées']);
    });

    it('getId personnalisé (grouper des cartes/vues, pas des items bruts)', () => {
        const cartes = [{ ref: 'p1' }, { ref: 'p4' }];
        const g = R.grouperPur(cartes, [repA], 'pratiques', c => c.ref);
        expect(g.find(x => x.titre === 'A').items).toEqual([{ ref: 'p1' }]);
        expect(g.find(x => x.titre === 'Non classées').items).toEqual([{ ref: 'p4' }]);
    });
});

describe('L0 · publiques (I/O via db) — round-trip', () => {
    it('creer puis obtenir relit le répertoire persisté', () => {
        const cree = R.creer('Essais SOM', 'pratiques');
        expect(cree).not.toBeNull();
        const lus = R.obtenir('pratiques');
        expect(lus).toHaveLength(1);
        expect(lus[0].nom).toBe('Essais SOM');
        // clé GLOBALE, non namespacée
        expect(store[R.CLE_REPERTOIRES]).toBeTruthy();
    });

    it('creer avec nom vide ne persiste rien et retourne null', () => {
        expect(R.creer('   ', 'pratiques')).toBeNull();
        expect(R.obtenir('pratiques')).toEqual([]);
    });

    it('assigner persiste l\'exclusivité de bout en bout', () => {
        const r1 = R.creer('Dossier 1', 'pratiques');
        const r2 = R.creer('Dossier 2', 'pratiques');
        R.assigner('p1', r1.id, 'pratiques');
        R.assigner('p1', r2.id, 'pratiques'); // doit quitter r1
        const lus = R.obtenir('pratiques');
        expect(lus.find(r => r.id === r1.id).itemIds).not.toContain('p1');
        expect(lus.find(r => r.id === r2.id).itemIds).toContain('p1');
    });

    it('retirerItem (hook suppression de pratique) sort l\'item du classement', () => {
        const r1 = R.creer('Dossier 1', 'pratiques');
        R.assigner('p1', r1.id, 'pratiques');
        R.retirerItem('p1', 'pratiques');
        expect(R.obtenir('pratiques').find(r => r.id === r1.id).itemIds).not.toContain('p1');
    });
});
