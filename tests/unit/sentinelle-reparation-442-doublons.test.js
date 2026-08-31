import { describe, it, expect, vi, afterEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #442 — le script de nettoyage fait ce qu'il annonce
// =======================================================================
//
// `scripts/reparation-442-doublons.js` retire les exemplaires en trop des
// collections partagées (magasin global `cours`, magasins de modèles
// namespacés). Un script de réparation qui ne répare rien est le pire des
// résultats : il fait croire le problème réglé. On le pilote donc pour de
// vrai, sur un faux stockage, et on vérifie les écritures réelles.
//
// Ce qui est verrouillé ici :
//   A. le DRY-RUN n'écrit rien — aucune clé touchée ;
//   B. l'exécution retire les exemplaires en trop et garde LE PREMIER
//      (c'est celui que `find` atteint déjà : le retrait est un no-op
//      fonctionnel ; garder « le plus riche » changerait le comportement) ;
//   C. les homonymes à ids DIFFÉRENTS ne sont jamais touchés ;
//   D. une collection saine n'est pas réécrite du tout ;
//   E. `annuler442()` restaure l'état exact d'avant ;
//   F. les deux fonctions sont réellement exportées.

function fauxStockage(donnees) {
    const store = JSON.parse(JSON.stringify(donnees));
    const ecritures = [];
    const db = {
        keysSync: () => Object.keys(store),
        keys: async () => Object.keys(store),
        get: async (k, d = null) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { ecritures.push(k); store[k] = JSON.parse(JSON.stringify(v)); }
    };
    return { store, ecritures, db };
}

function chargerScriptReparation(db) {
    return chargerScript('scripts/reparation-442-doublons.js', { db });
}

// Le cas du terrain : trois exemplaires 601-102-MQ au même id, et une
// échelle en double dans un trimestre archivé.
const DONNEES_TERRAIN = {
    cours: [
        { id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire' },
        { id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire' },
        { id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ', titre: 'Littérature et imaginaire' },
        { id: 'h2026-601-101-MQ-00001', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }
    ],
    a2025_echellesTemplates: [
        { id: 'ECH_IDME_1', nom: 'IDME et niv 0', niveaux: [1, 2, 3, 4, 5] },
        { id: 'ECH_IDME_1', nom: 'IDME et niv 0', niveaux: [1, 2, 3, 4, 5] }
    ],
    h2026_grillesTemplates: [
        { id: 'GRILLE_A', nom: 'Global-5 (FR-ALGO) H26' }
    ]
};

describe('#442 · script de nettoyage des doublons', () => {

    it('A · le dry-run n\'écrit rien', async () => {
        const { store, ecritures, db } = fauxStockage(DONNEES_TERRAIN);
        const avant = JSON.stringify(store);

        const win = chargerScriptReparation(db);
        await win.reparer442();

        expect(ecritures).toEqual([]);
        expect(JSON.stringify(store)).toBe(avant);
    });

    it('B · l\'exécution retire les exemplaires en trop et garde LE PREMIER', async () => {
        const { store, db } = fauxStockage(DONNEES_TERRAIN);

        const win = chargerScriptReparation(db);
        // `ignorerChamps` est désormais REQUIS ici : la 3e copie porte `titre`,
        // absent du gardé, donc l'exécution nue refuse (cas B3). Ce cas-ci teste
        // le retrait pur — on dit donc explicitement qu'on ne récupère rien.
        await win.reparer442({ executer: true, ignorerChamps: true });

        expect(store.cours).toHaveLength(2);
        // Le premier exemplaire, celui que `find` atteignait déjà, est celui
        // qui reste : la 3e copie portait `titre` au lieu de `nomCours`, elle
        // ne doit PAS avoir pris sa place.
        expect(store.cours[0]).toEqual(DONNEES_TERRAIN.cours[0]);
        expect(store.cours[0].nomCours).toBe('Littérature et imaginaire');
        expect(store.cours[1].id).toBe('h2026-601-101-MQ-00001');

        expect(store.a2025_echellesTemplates).toHaveLength(1);
        expect(store.a2025_echellesTemplates[0].id).toBe('ECH_IDME_1');

        const ids = store.cours.map(c => c.id);
        expect(ids).toHaveLength(new Set(ids).size);
    });

    it('B2 · quand les copies diffèrent, le rapport DIT en quoi', async () => {
        // Terrain du 10 août (dry-run de Grégoire) : les trois exemplaires de
        // 601-102-MQ diffèrent entre eux. Le premier jet annonçait « les copies
        // DIFFÈRENT du 1er — voir la note plus bas » et cette note n'existait
        // pas. Une alerte sans matière au moment précis où l'on décide de
        // supprimer est pire qu'un silence : elle inquiète sans informer.
        const { db } = fauxStockage({
            cours: [
                { id: 'X', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire' },
                { id: 'X', codeCours: '601-102-MQ', titre: 'Littérature et imaginaire', session: 'Hiver' }
            ]
        });
        const journal = [];
        const espion = vi.spyOn(console, 'log').mockImplementation(m => journal.push(String(m)));

        const win = chargerScriptReparation(db);
        await win.reparer442();
        espion.mockRestore();

        const rapport = journal.join('\n');
        expect(rapport).toContain('ce qui diffère du gardé');
        expect(rapport).toContain('nomCours');   // présent au gardé, absent à la copie
        expect(rapport).toContain('session');    // absent au gardé, présent à la copie
        // Et la phrase qui remet l'écart à sa place : il n'était lu nulle part.
        expect(rapport).toContain('SEUL le 1er exemplaire était lu');
    });

    // ── Le cas réel du 10 août : la 3e copie portait des champs que le
    //    1er n'avait pas (heuresContact: 60, ponderation: '2-2-3'). Un simple
    //    retrait les aurait fait disparaître des données — invisiblement, car
    //    seul le 1er exemplaire est jamais lu.
    const TROIS_COPIES = {
        cours: [
            { id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ', session: 'Hiver', annee: '2026', heuresContact: '', ponderation: '' },
            { id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ', session: 'Hiver', annee: '2026' },
            { id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ', session: 'Hiver', annee: '2026', heuresContact: 60, ponderation: '2-2-3' }
        ]
    };

    it('B3 · l\'exécution REFUSE quand des champs disparaîtraient (pas de perte silencieuse)', async () => {
        const { store, ecritures, db } = fauxStockage(TROIS_COPIES);
        const win = chargerScriptReparation(db);

        await win.reparer442({ executer: true });   // sans dire quoi faire des champs

        expect(ecritures).toEqual([]);              // rien écrit
        expect(store.cours).toHaveLength(3);        // rien retiré
    });

    it('B4 · fusionnerChamps récupère AVANT de retirer — et n\'écrase rien', async () => {
        const { store, db } = fauxStockage(TROIS_COPIES);
        const win = chargerScriptReparation(db);

        await win.reparer442({ executer: true, fusionnerChamps: true });

        expect(store.cours).toHaveLength(1);
        expect(store.cours[0].heuresContact).toBe(60);
        expect(store.cours[0].ponderation).toBe('2-2-3');
        // Les champs DÉJÀ renseignés chez le gardé restent les siens.
        expect(store.cours[0].session).toBe('Hiver');
        expect(store.cours[0].annee).toBe('2026');
    });

    it('B5 · ignorerChamps retire sans récupérer — le choix est explicite', async () => {
        const { store, db } = fauxStockage(TROIS_COPIES);
        const win = chargerScriptReparation(db);

        await win.reparer442({ executer: true, ignorerChamps: true });

        expect(store.cours).toHaveLength(1);
        expect(store.cours[0].heuresContact).toBe('');
    });

    it('B6 · deux copies qui se contredisent sur un champ : AMBIGU, jamais deviné', async () => {
        const { store, db } = fauxStockage({
            cours: [
                { id: 'X', codeCours: '601-102-MQ', ponderation: '' },
                { id: 'X', codeCours: '601-102-MQ', ponderation: '2-2-3' },
                { id: 'X', codeCours: '601-102-MQ', ponderation: '1-2-3' }
            ]
        });
        const win = chargerScriptReparation(db);

        await win.reparer442({ executer: true, fusionnerChamps: true });

        // Le champ contesté n'est PAS renseigné au hasard.
        expect(store.cours).toHaveLength(1);
        expect(store.cours[0].ponderation).toBe('');
    });

    it('C · deux modèles homonymes à ids DIFFÉRENTS ne sont pas touchés', async () => {
        const donnees = {
            a2025_echellesTemplates: [
                { id: 'ECH_1', nom: 'IDME et niv 0', niveaux: [1, 2, 3] },
                { id: 'ECH_2', nom: 'IDME et niv 0', niveaux: [1, 2, 3, 4, 5] }
            ],
            h2026_evaluationsSauvegardees: [{ id: 'EV1', echelleId: 'ECH_2' }]
        };
        const { store, ecritures, db } = fauxStockage(donnees);

        const win = chargerScriptReparation(db);
        await win.reparer442({ executer: true });

        // Même en mode EXÉCUTION : rien n'est retiré, rien n'est réécrit.
        expect(ecritures).toEqual([]);
        expect(store.a2025_echellesTemplates).toHaveLength(2);
    });

    it('D · une collection saine n\'est pas réécrite', async () => {
        const { ecritures, db } = fauxStockage({
            cours: [{ id: 'A', codeCours: '601-101-MQ' }, { id: 'B', codeCours: '601-102-MQ' }],
            h2026_echellesTemplates: [{ id: 'E1', nom: 'Générique' }]
        });

        const win = chargerScriptReparation(db);
        await win.reparer442({ executer: true });

        expect(ecritures).toEqual([]);
    });

    it('E · annuler442() restaure l\'état exact d\'avant', async () => {
        const { store, db } = fauxStockage(DONNEES_TERRAIN);
        const avant = JSON.stringify(store);

        const win = chargerScriptReparation(db);
        await win.reparer442({ executer: true, ignorerChamps: true });
        expect(JSON.stringify(store)).not.toBe(avant);

        await win.annuler442();
        expect(JSON.stringify(store)).toBe(avant);
    });

    it('F · la portée couvre les familles reprises de dedoublonner-biblios (retiré)', async () => {
        // `scripts/dedoublonner-biblios.js` visait encore les globales NUES
        // `grillesTemplates`/`echellesTemplates` — vidées au boot depuis #358,
        // donc sans effet. Ce script le remplace : sa portée doit couvrir les
        // familles que l'ancien traitait, sans quoi le retrait perdrait du terrain.
        // ⚠ DEUX RÉGIMES DE CLÉ, ET IL FAUT LES DEUX (ajouté le 31 août 2026, #636).
        // Ce corpus ne portait que la clé NUE `cartouches_GRILLE_A`. Conséquence
        // mesurée : ce cas était vert AVANT S5, vert PENDANT toute la régression du
        // régime des cartouches, et vert APRÈS sa correction — il n'a jamais pu voir
        // le défaut qu'il est censé border, parce que son corpus décrivait un régime
        // que S5 a fait disparaître. C'est le vert qui sert d'alibi.
        // ⮕ La famille namespacée est AJOUTÉE, la nue est GARDÉE : on ne raccourcit
        // pas le corpus d'une sentinelle, on le scinde. Les deux doivent être
        // dédoublonnées — la nue parce qu'un résidu pré-migration existe encore chez
        // qui n'a pas redémarré, la namespacée parce que c'est le régime d'aujourd'hui.
        const { store, db } = fauxStockage({
            cartouches_GRILLE_A: [
                { id: 'CART_1', nom: 'Rétroaction dissertation' },
                { id: 'CART_1', nom: 'Rétroaction dissertation' }
            ],
            h2026_cartouches_GRILLE_B: [
                { id: 'CART_2', nom: 'Rétroaction analyse' },
                { id: 'CART_2', nom: 'Rétroaction analyse' }
            ],
            bibliothequePratiques: [
                { id: 'PRAT_1', nom: 'PAN-Standards' },
                { id: 'PRAT_1', nom: 'PAN-Standards' }
            ],
            bibliothequeProductions: [{ id: 'PROD_1', nom: 'Dissertation' }]
        });

        const win = chargerScriptReparation(db);
        await win.reparer442({ executer: true });

        expect(store.cartouches_GRILLE_A, 'résidu pré-migration : la clé nue est encore dédoublonnée').toHaveLength(1);
        expect(store.h2026_cartouches_GRILLE_B, 'régime d\'aujourd\'hui : la clé namespacée aussi').toHaveLength(1);
        expect(store.bibliothequePratiques).toHaveLength(1);
        expect(store.bibliothequeProductions).toHaveLength(1);
    });

    it('G · le rapport d\'homonymie ne crie pas sur un cours redonné à une autre session', async () => {
        // Deux fiches « Écriture et littérature » en H26 et A26 sont deux
        // objets légitimes — c'est le cas normal de chaque rentrée. Les
        // signaler serait une fausse alerte annuelle. En revanche, deux
        // échelles au même nom dans le MÊME magasin sont bien le symptôme
        // rapporté par la sonde #159.
        const { db } = fauxStockage({
            cours: [
                { id: 'h2026-601-101-MQ-00001', nomCours: 'Écriture et littérature', session: 'Hiver', annee: '2026' },
                { id: 'a2026-601-101-MQ-00001', nomCours: 'Écriture et littérature', session: 'Automne', annee: '2026' }
            ],
            a2025_echellesTemplates: [
                { id: 'ECH_1', nom: 'IDME et niv 0' },
                { id: 'ECH_2', nom: 'IDME et niv 0' }
            ]
        });
        const journal = [];
        const espion = vi.spyOn(console, 'log').mockImplementation(m => journal.push(String(m)));

        const win = chargerScriptReparation(db);
        await win.reparer442();
        espion.mockRestore();

        const rapport = journal.join('\n');
        expect(rapport).toContain('HOMONYMES');
        expect(rapport).toContain('ECH_1');
        expect(rapport).not.toContain('Écriture et littérature');
    });

    it('H · les deux fonctions sont réellement exportées', async () => {
        // Leçon du 10 août : un nom jamais exporté ne proteste pas.
        const { db } = fauxStockage(DONNEES_TERRAIN);
        const win = chargerScriptReparation(db);
        expect(typeof win.reparer442).toBe('function');
        expect(typeof win.annuler442).toBe('function');
    });
});
