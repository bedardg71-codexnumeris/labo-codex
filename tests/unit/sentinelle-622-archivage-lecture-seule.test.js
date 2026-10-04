import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #622 / S4 (31 août 2026) — L'ARCHIVAGE D'UN TRIMESTRE EST UNE LECTURE.
// Constats B1 et B3 du rapport `Rapports/AUDIT-conception-Z1-cartouches-archivage-2026-08-30.md`,
// plus le « troisième défaut de B1 » relevé au plan (les deux getSync asymétriques).
//
// CE QUI ÉTAIT MESURÉ SUR LES DONNÉES RÉELLES DE GRÉGOIRE (#630) : archiver Hiver 2026
// aujourd'hui DÉTRUIRAIT ses dix pratiques. Pas « substituerait » — détruirait. Le
// mécanisme tient en deux lignes qui se lisent innocemment :
//
//   1. `db.getSync(cle('pratiquesConfigurables'))` — `cle()` route par le trimestre
//      ACTIF. Or on ne peut archiver qu'un trimestre NON actif (garde l.616-619).
//      La lecture portait donc, par construction, sur un AUTRE trimestre que celui
//      qu'on archive.
//   2. `db.setSync('<archivé>_pratiquesConfigurables', pratiquesUtilisees)` — écriture
//      INCONDITIONNELLE du sous-ensemble filtré. Les pratiques lues appartenant au
//      trimestre actif, aucun de leurs identifiants ne figure dans les `pratiqueIds`
//      du trimestre archivé : l'intersection est vide, et c'est `[]` qui est écrit
//      par-dessus la collection vivante.
//
// ⮕ ET IL N'EXISTAIT AUCUN FILET. Le snapshot dit « backup complet » dans son propre
// commentaire mais n'enregistrait que les SURVIVANTS (`grillesUtilisees`, déjà
// filtrées) et, pour les cartouches, un simple NOMBRE. Il ne pouvait donc rien
// restaurer de ce que l'archivage venait de retirer.
//
// POURQUOI CE BANC N'A PAS BESOIN DE LA FAUSSE CONNEXION IDB (cadre §6) : la règle
// existe parce que Node n'a pas d'IndexedDB, `db.set` y devient synchrone, et toute
// COURSE d'écriture s'y rend invisible. Il n'y a pas de course ici —
// `creerSnapshotRessources` est entièrement synchrone (`getSync`/`setSync`) et le
// défaut est un écrasement DÉTERMINISTE, que le magasin synchrone ci-dessous
// reproduit à l'identique. Ajouter le harnais IDB déguiserait le banc sans rien
// prouver de plus.
//
// BREAK-TEST (les deux côtés, cadre §4) :
//   · rétablir un `db.setSync('<id>_grillesTemplates', grillesUtilisees)` → ROUGE
//   · rétablir `cle('pratiquesConfigurables')` en lieu de `${trimestreId}_…` → ROUGE
//   · rétablir `grilles: grillesUtilisees` dans le snapshot → ROUGE
//   · rétablir `cartouches: nbCartouchesCopies` → ROUGE
//   · rétablir le repli sur la clé NUE `productions` → ROUGE
//   · rétablir la ligne `exportData.donnees.presences = presences.filter(…)` → ROUGE

/* ------------------------------------------------------------------ harnais */

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        removeSync: (c) => { delete store[c]; }
    };
}

function chargerTrimestres(store, globauxSupplementaires = {}) {
    return chargerScript('js/trimestres.js', {
        db: dbDepuisStore(store),
        ...globauxSupplementaires
    });
}

/**
 * Le décor du 30 août, réduit à sa forme minimale : un trimestre ACTIF (`h2026`)
 * riche, et un trimestre à archiver (`a2025`) dont les modèles ne recoupent AUCUN
 * identifiant de l'actif. C'est exactement la configuration mesurée chez Grégoire —
 * intersection vide — et c'est elle qui transforme un filtre en destruction.
 */
function storeAvantArchivage() {
    return {
        trimestres: [
            { id: 'h2026', actif: true,  archive: false },
            { id: 'a2025', actif: false, archive: false }
        ],

        // Le trimestre À ARCHIVER : deux grilles, deux échelles, deux pratiques,
        // dont UNE SEULE de chaque est référencée par une production.
        a2025_productions: [{ id: 'P1', grilleId: 'G1', echelleId: 'E1', pratiqueId: 'PR1' }],
        a2025_grillesTemplates:      [{ id: 'G1', nom: 'Utilisée' }, { id: 'G2', nom: 'Jamais notée' }],
        a2025_echellesTemplates:     [{ id: 'E1', nom: 'Utilisée' }, { id: 'E2', nom: 'Jamais notée' }],
        a2025_pratiquesConfigurables: [{ id: 'PR1', nom: 'Utilisée' }, { id: 'PR2', nom: 'Jamais notée' }],
        // ⚠ CLÉ MISE À JOUR PAR S5/#623 LE 31 AOÛT 2026 : ce corpus posait
        // `cartouches_G1` — la clé NUE du régime global. Les cartouches suivent
        // désormais le régime de leur grille, et `creerSnapshotRessources` lit
        // `cleSource('cartouches_G1', trimestreId)`. Laisser la clé nue faisait
        // lire une case VIDE, sauter le `if (… > 0)`, et rendre `snapshot.cartouches`
        // sans sa grille : le cas plus bas mourait sur un `undefined`.
        // ⮕ Le cas « clé nue SEULEMENT » n'a pas disparu pour autant : c'est
        //   l'état d'un trimestre non encore migré, et il a sa propre sentinelle —
        //   l'archivage doit alors REFUSER en le disant, pas produire un snapshot
        //   amputé en silence.
        a2025_cartouches_G1: [{ id: 'CART1', nom: 'Cartouche de G1' }],

        // Le trimestre ACTIF : ses pratiques n'ont AUCUN identifiant en commun.
        h2026_pratiquesConfigurables: [{ id: 'PRX', nom: 'Pratique du trimestre actif' }],

        grillesTemplates: []
    };
}

/* --------------------- S5/#623 : le fil de détente des cartouches non migrées */

/**
 * Le même décor, mais avec les cartouches restées sous la clé NUE — l'état d'un
 * trimestre que la migration du volet (b) n'a pas encore touché. C'était le
 * corpus de ce fichier jusqu'au 31 août 2026 ; il est conservé ICI, exprès,
 * parce qu'il est devenu un cas à part entière.
 */
function storeCartouchesNonMigrees() {
    const store = storeAvantArchivage();
    delete store.a2025_cartouches_G1;
    store.cartouches_G1 = [{ id: 'CART1', nom: 'Cartouche de G1' }];
    return store;
}

describe('#623/S5 · cartouches non migrées : l\'archivage REFUSE au lieu d\'amputer', () => {

    // ⚠⚠ LE CAS LE PLUS IMPORTANT DE CE FICHIER — il verrouille la seule perte
    // SILENCIEUSE identifiée le 31 août 2026.
    //
    // Sous S5, `creerSnapshotRessources` lit `cleSource('cartouches_<g>', trimestreId)`.
    // Un trimestre dont les cartouches vivent encore sous la clé NUE rend donc une
    // case VIDE. Le `if (cartouches.length > 0)` sautait alors sans rien dire, et le
    // snapshot partait AMPUTÉ — or ce snapshot est le filet de la suppression
    // définitive (`trimestre-v2-liste.js:398-405`). Rien n'aurait signalé la perte
    // avant qu'on en ait besoin.
    //
    // Le remède retenu (décision `kuekatsheu-c8`, 31 août) n'est PAS d'ordonner les
    // volets — livrer la migration avant le routage déplacerait la fenêtre sans la
    // fermer : elle resterait ouverte si la migration échoue, ou si un chemin
    // archive avant elle. C'est un FIL DE DÉTENTE : après le volet (b), cet état
    // n'existe plus, et si ce refus se déclenche un jour, c'est que la migration a
    // échoué — ce qu'on veut apprendre à ce moment-là, pas au désarchivage.
    //
    // ⚠ Et surtout : PAS de repli silencieux sur la clé nue. Un repli discret
    // rendrait une migration ratée indétectable, c'est-à-dire exactement le défaut
    // qu'on referme.

    it('REFUSE le snapshot et NOMME les grilles concernées', () => {
        const store = storeCartouchesNonMigrees();
        const win = chargerTrimestres(store);

        const r = win.creerSnapshotRessources('a2025');

        expect(r.success).toBe(false);
        expect(r.refus).toBe('cartouches-non-migrees');
        // NOMMER, pas seulement refuser : sans le nom de la grille, l'utilisateur
        // ne sait pas quoi réparer, et le message ne vaut pas mieux qu'un silence.
        expect(r.grilles).toEqual(['G1']);
        expect(r.message).toMatch(/G1/);
    });

    it('n\'écrit AUCUN snapshot — pas même un snapshot amputé', () => {
        const store = storeCartouchesNonMigrees();
        const win = chargerTrimestres(store);

        win.creerSnapshotRessources('a2025');

        // La perte se produisait par un snapshot ÉCRIT mais incomplet : c'est lui
        // qu'on refuse, pas seulement le verdict.
        expect(Object.keys(store).filter(k => k.startsWith('snapshot_'))).toEqual([]);
    });

    it('archiverTrimestre LIT le refus : le trimestre n\'est PAS archivé', () => {
        // ⚠ La seconde moitié de la garde, et sans elle la première est décorative.
        // `archiverTrimestre` posait `trimestre.archive = true` sans lire le retour
        // de `creerSnapshotRessources` : le refus aurait été ignoré et le trimestre
        // archivé quand même, avec son snapshot manquant.
        // Un refus RENDU n'est pas une exception — rien ne l\'attrape tout seul.
        const store = storeCartouchesNonMigrees();
        const win = chargerTrimestres(store);

        const r = win.archiverTrimestre('a2025');

        expect(r.success).toBe(false);
        expect(r.refus).toBe('cartouches-non-migrees');

        // L'état est EXACTEMENT celui d'avant l'appel : aucun drapeau, aucune date.
        const t = store.trimestres.find(x => x.id === 'a2025');
        expect(t.archive).toBe(false);
        expect('dateFin' in t).toBe(false);
    });

    it('une fois les cartouches migrées, l\'archivage repart normalement', () => {
        // Contre-épreuve : la garde ne bloque QUE l'état non migré. Sans ce cas,
        // une garde devenue trop large (refusant toujours) passerait inaperçue —
        // les trois cas ci-dessus resteraient verts.
        const store = storeAvantArchivage();   // corpus MIGRÉ (a2025_cartouches_G1)
        const win = chargerTrimestres(store);

        const r = win.creerSnapshotRessources('a2025');

        expect(r.success).not.toBe(false);
        expect(r.refus).toBeUndefined();
        expect(store[r.cleSnapshot].cartouches.G1.map(c => c.id)).toEqual(['CART1']);
    });

});

/* ------------------------------------------------------- B1 : ne rien détruire */

describe('#622 · archiver un trimestre ne touche à aucune collection de travail (B1)', () => {
    it('CONSERVE les deux grilles du trimestre archivé, pas seulement celle qui a servi', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        win.creerSnapshotRessources('a2025');

        expect(store.a2025_grillesTemplates.map(g => g.id).sort()).toEqual(['G1', 'G2']);
    });

    it('CONSERVE les deux échelles du trimestre archivé', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        win.creerSnapshotRessources('a2025');

        expect(store.a2025_echellesTemplates.map(e => e.id).sort()).toEqual(['E1', 'E2']);
    });

    it('⛔ CONSERVE LES PRATIQUES DU TRIMESTRE ARCHIVÉ — le cas mesuré chez Grégoire (#630)', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        win.creerSnapshotRessources('a2025');

        // Avant le correctif : `[]`. Dix pratiques, sur les données réelles.
        expect(store.a2025_pratiquesConfigurables.map(p => p.id).sort()).toEqual(['PR1', 'PR2']);
    });

    it('ne touche pas non plus aux collections du trimestre ACTIF', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        win.creerSnapshotRessources('a2025');

        expect(store.h2026_pratiquesConfigurables.map(p => p.id)).toEqual(['PRX']);
    });
});

/* ------------------------------ B3 : lire le namespace du trimestre ARCHIVÉ */

describe('#622 · le snapshot lit le trimestre archivé, jamais le trimestre actif (B3)', () => {
    it('n\'enregistre AUCUNE pratique du trimestre actif dans le snapshot du trimestre archivé', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        const r = win.creerSnapshotRessources('a2025');
        const snapshot = store[r.cleSnapshot];

        expect(snapshot.pratiques.map(p => p.id)).not.toContain('PRX');
    });

    it('enregistre les COLLECTIONS COMPLÈTES du trimestre archivé, pas les survivants filtrés', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        const r = win.creerSnapshotRessources('a2025');
        const snapshot = store[r.cleSnapshot];

        expect(snapshot.grilles.map(g => g.id).sort()).toEqual(['G1', 'G2']);
        expect(snapshot.echelles.map(e => e.id).sort()).toEqual(['E1', 'E2']);
        expect(snapshot.pratiques.map(p => p.id).sort()).toEqual(['PR1', 'PR2']);
    });

    it('enregistre les CARTOUCHES elles-mêmes, pas leur compte — un nombre ne restaure rien', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        const r = win.creerSnapshotRessources('a2025');
        const snapshot = store[r.cleSnapshot];

        expect(typeof snapshot.cartouches).not.toBe('number');
        expect(snapshot.cartouches.G1.map(c => c.id)).toEqual(['CART1']);
    });

    it('conserve « quels modèles ont servi » comme MÉTADONNÉE, sans s\'en servir pour écrire', () => {
        const store = storeAvantArchivage();
        const win = chargerTrimestres(store);

        const r = win.creerSnapshotRessources('a2025');
        const snapshot = store[r.cleSnapshot];

        expect(snapshot.utilises.grilleIds).toEqual(['G1']);
        expect(snapshot.utilises.echelleIds).toEqual(['E1']);
        expect(snapshot.utilises.pratiqueIds).toEqual(['PR1']);
    });
});

/* ------------------- Le troisième défaut de B1 : deux getSync asymétriques */

describe('#622 · les deux lectures asymétriques du même motif (plan, §ordre strict)', () => {
    it('ne se rabat JAMAIS sur la clé NUE `productions` pour le snapshot d\'un trimestre', () => {
        const store = storeAvantArchivage();
        delete store.a2025_productions;
        // Une clé globale partagée, qui appartient à un autre trimestre.
        store.productions = [{ id: 'PX', nom: 'Production d\'un autre trimestre' }];

        const win = chargerTrimestres(store);
        const r = win.creerSnapshotRessources('a2025');
        const snapshot = store[r.cleSnapshot];

        // Sans garde, le snapshot d'a2025 enregistrait le contenu d'une clé partagée
        // SOUS LE NOM d'a2025 : `getSync(k)` sans défaut rend `null`, donc le `||` part.
        expect(snapshot.productions).toEqual([]);
    });

    it('lit bien la forme legacy `_productionsPedagogiques` quand `_productions` est ABSENTE', () => {
        const store = storeAvantArchivage();
        delete store.a2025_productions;
        store.a2025_productionsPedagogiques = [{ id: 'PL', grilleId: 'G2' }];

        const win = chargerTrimestres(store);
        const { grilleIds } = win.identifierTemplatesUtilises('a2025');

        // Avant : `getSync(k, [])` rend `[]`, qui est TRUTHY — les deux replis `||`
        // ne s'exécutaient JAMAIS et la forme legacy n'était jamais lue.
        expect(Array.from(grilleIds)).toContain('G2');
    });

    it('ne lit PAS la forme legacy quand `_productions` existe et est vide — une clé présente est une réponse', () => {
        const store = storeAvantArchivage();
        store.a2025_productions = [];
        store.a2025_productionsPedagogiques = [{ id: 'PL', grilleId: 'G2' }];

        const win = chargerTrimestres(store);
        const { grilleIds } = win.identifierTemplatesUtilises('a2025');

        expect(Array.from(grilleIds)).not.toContain('G2');
    });
});

/* B2 (l'export d'un trimestre lisait le trimestre actif) : la fonction `exporterTrimestreArchive` est
   retirée le 4 oct. 2026 (#1006, aucun écran ne l'appelait) ; l'archive d'un trimestre est E1 (#1022). */
