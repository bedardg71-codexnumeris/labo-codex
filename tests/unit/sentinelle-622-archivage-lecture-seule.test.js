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
        cartouches_G1: [{ id: 'CART1', nom: 'Cartouche de G1' }],

        // Le trimestre ACTIF : ses pratiques n'ont AUCUN identifiant en commun.
        h2026_pratiquesConfigurables: [{ id: 'PRX', nom: 'Pratique du trimestre actif' }],

        grillesTemplates: []
    };
}

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

/* ------------------------------- B2 : l'export lit le trimestre qu'il exporte */

describe('#622 · l\'export d\'archive ne lit plus le trimestre ACTIF (B2, §6.2)', () => {
    function exporter(store) {
        const capture = {};
        const win = chargerTrimestres(store, {
            Blob: class { constructor(parts) { capture.json = parts[0]; } },
            URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
            // Le stub `document` du helper ne donne pas de `click()` à l'ancre de
            // téléchargement : sans cela l'export part en exception et rendrait un
            // rouge qui ne parle que du banc.
            document: {
                addEventListener: () => {}, removeEventListener: () => {},
                querySelector: () => null, querySelectorAll: () => [],
                getElementById: () => null,
                createElement: () => ({ click: () => {}, setAttribute: () => {}, style: {} }),
                body: { addEventListener: () => {}, appendChild: () => {}, style: {},
                        classList: { add: () => {}, remove: () => {}, contains: () => false } },
                documentElement: { addEventListener: () => {} }
            },
            // `obtenirDonneesSelonMode` vit dans `js/modes.js`, hors du sandbox. Le
            // stub reproduit fidèlement ce qui FAIT le défaut B2 : la fonction résout
            // sa clé par le trimestre ACTIF (modes.js:1030, via `obtenirTrimestreId`),
            // quel que soit le trimestre que l'appelant croit lire. Un stub qui
            // lirait `a2025_*` rendrait le banc vert sur le code fautif — un faux vert
            // fabriqué par le harnais, pas par le code.
            obtenirDonneesSelonMode: (nomCle) => {
                const actif = (store.trimestres.find(t => t.actif) || {}).id;
                const clesObjets = ['snapshots', 'calendrierComplet', 'indicesCP', 'indicesAssiduite'];
                const defaut = clesObjets.includes(nomCle) ? {} : [];
                const v = store[`${actif}_${nomCle}`];
                return v === undefined ? defaut : v;
            }
        });
        const r = win.exporterTrimestreArchive('a2025');
        // Un export qui ÉCHOUE ne prouve rien : le rouge doit venir de l'assertion
        // métier, pas d'une ReferenceError du banc (cadre §4 — le harnais aussi peut
        // être faux). On exige donc le succès AVANT de lire le contenu.
        expect(r.success).toBe(true);
        return JSON.parse(capture.json);
    }

    function storeExport() {
        const store = storeAvantArchivage();
        store.cours = [{ id: 'C1', trimestreId: 'a2025' }, { id: 'C9', trimestreId: 'h2026' }];
        store.a2025_presences = [{ coursId: 'C1', seance: '1a' }];
        store.h2026_presences = [{ coursId: 'C9', seance: '9z' }];
        store.a2025_snapshots  = { hebdomadaires: [{ id: 'S-A25' }], interventions: [] };
        store.h2026_snapshots  = { hebdomadaires: [{ id: 'S-H26' }], interventions: [] };
        store.a2025_groupeEtudiants = [{ da: '111', coursId: 'C1' }];
        store.a2025_evaluationsSauvegardees = [{ id: 'EV1', coursId: 'C1' }];
        return store;
    }

    it('exporte les PRÉSENCES du trimestre exporté, pas celles du trimestre actif', () => {
        const donnees = exporter(storeExport()).donnees;
        expect(donnees.presences).toEqual([{ coursId: 'C1', seance: '1a' }]);
    });

    it('exporte les CAPTURES du trimestre exporté, pas celles du trimestre actif', () => {
        const donnees = exporter(storeExport()).donnees;
        expect(donnees.snapshots.hebdomadaires.map(s => s.id)).toEqual(['S-A25']);
    });

    it('ne produit plus les deux champs alias `etudiants` et `evaluations` — ils dupliquaient sous un faux nom', () => {
        const donnees = exporter(storeExport()).donnees;
        expect('etudiants' in donnees).toBe(false);
        expect('evaluations' in donnees).toBe(false);
        // Les champs canoniques, eux, viennent bien du namespace exporté.
        expect(donnees.groupeEtudiants).toEqual([{ da: '111', coursId: 'C1' }]);
        expect(donnees.evaluationsSauvegardees.map(e => e.id)).toEqual(['EV1']);
    });
});
