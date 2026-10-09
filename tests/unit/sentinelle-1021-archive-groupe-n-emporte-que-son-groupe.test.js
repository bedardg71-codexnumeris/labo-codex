import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';

// =====================================================================
// #1021, #956, #829 — L'ARCHIVE D'UN GROUPE N'EMPORTE QUE CE GROUPE (9 oct. 2026)
// =====================================================================
//
// « Archiver… » un groupe-cours (`Reserve.verserGroupeCours`, js/reserve.js) classe chaque clé
// du trimestre : filtrée par élève, filtrée par groupe, partagée, ou laissée. Jusqu'au lot, une
// clé que la Réserve ne connaissait pas partait ENTIÈRE (« Inconnue : inclure sans filtre ») :
// les notes du rapport, le confidentiel, les résultats ultérieurs… des élèves des AUTRES groupes.
//
// L'ESPACE : un trimestre fictif a2031, deux groupes (GC_UN, GC_DEUX), un élève dans chacun ;
// chaque famille de clés par élève remplie pour les deux. Tout ce qui appartient au groupe 2
// porte le DA 0000202 ou le témoin « SECRET2 ». On archive le groupe 1, en mode dossier.
//
// CE QUE CE BANC JUGE :
//   (a) rien du groupe 2 ne part (ni son DA, ni son témoin), clé par clé ;
//   (b) rien du groupe 1 ne se perd : chaque famille garde l'élève du groupe ;
//   (c) chaque clé du registre des trimestres (CLES_NAMESPACEES) a une règle dans la Réserve ;
//       une clé nouvelle, que personne n'a classée, ne part pas (au lieu de partir entière) ;
//   (d) #956 : la forme nue, figée, de `pratiquesConfigurables` ne part plus ; celle du trimestre oui ;
//   (e) #829 : la liste des élèves suivis du groupe part, celle de l'autre groupe non, et
//       l'archivage ne dit plus « clé non reconnue » ;
//   (f) rétro-compatibilité : une archive faite AVANT le lot (forme d'alors, figée ci-dessous)
//       se vérifie toujours, et sa forme nue des pratiques se relit toujours à la réouverture ;
//   (g) #1005 : « Vérifier » ne demande que la LECTURE du dossier (sélecteur et permission) ;
//       « Archiver… » ensuite, sur la même page, redemande l'ÉCRITURE — et l'obtient.
//
// TÉMOINS : chaque invariant a le sien, par mutation de la source EN MÉMOIRE ; une mutation qui
// ne remplace rien est refusée (« Témoin inerte »). Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log: () => {}, info: () => {}, debug: () => {}, error: () => {}, warn: () => {} };

const T = 'a2031';
const UN = '0000101';
const DEUX = '0000202';
const RETIRE = '0000303'; // retiré du groupe 2 (« Supprimer ») : sa trace ne regarde pas le groupe 1

const deux = (v1, v2) => ({ [UN]: v1, [DEUX]: v2 });

const ESPACE = {
    cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }],
    pratiquesConfigurables: [{ id: 'PR_NUE_FIGEE', nom: 'Pratique fictive d\'avant mai' }],
    [T + '_groupesCours']: [
        { id: 'GC_UN', coursId: 'C1', groupeNum: '1', nom: 'A2031-601-101-MQ-00001' },
        { id: 'GC_DEUX', coursId: 'C1', groupeNum: '2', nom: 'A2031-601-101-MQ-00002' }
    ],
    [T + '_groupeEtudiants']: [
        { da: UN, nom: 'Élève fictive Une', groupe: '1' },
        { da: DEUX, nom: 'Élève fictif SECRET2', groupe: '2' }
    ],
    // — par élève, en tableau
    [T + '_presences']: [{ da: UN, date: '2031-09-01' }, { da: DEUX, date: '2031-09-01', note: 'SECRET2' }],
    [T + '_evaluationsSauvegardees']: [{ id: 'E1', etudiantDA: UN }, { id: 'E2', etudiantDA: DEUX, retroaction: 'SECRET2' }],
    [T + '_evaluationsSauvegardees_backup_v1']: [{ id: 'E1', etudiantDA: UN }, { id: 'E2', etudiantDA: DEUX }],
    [T + '_chronoEvaluations']: [{ etudiantDA: UN, duree: 60 }, { etudiantDA: DEUX, duree: 61 }],
    [T + '_elevesDesinscrits']: [{ da: RETIRE, date: '2031-09-03' }],
    [T + '_etudiantsSuivis']: [{ da: UN }, { da: DEUX }],
    // — par élève, en objet { [da]: … }
    [T + '_indicesCP']: deux({ C: 80 }, { C: 81, t: 'SECRET2' }),
    [T + '_indicesPatternsRaI']: deux({ p: 'stable' }, { p: 'SECRET2' }),
    [T + '_indicesEvaluation']: deux({ completion: 1 }, { completion: 0.5 }),
    [T + '_portfoliosEleves']: deux({ ids: ['P1'] }, { ids: ['SECRET2'] }),
    [T + '_resultatsUlterieurs']: deux([{ cours: 'X', note: 70 }], [{ cours: 'SECRET2', note: 71 }]),
    [T + '_notesRapport']: deux('Note fictive', 'Note SECRET2'),
    [T + '_confidentielEtudiants']: deux({ texte: 'Confidentiel fictif' }, { texte: 'SECRET2' }),
    // — un niveau de plus : { sommatif: { [da]: … }, dateCalcul }
    [T + '_indicesAssiduite']: { sommatif: deux({ taux: 0.9 }, { taux: 0.4 }), dateCalcul: '2031-10-01' },
    // — les rencontres : une avec les deux élèves, une avec le seul élève du groupe 2
    [T + '_interventions']: [
        {
            id: 'I1', etudiants: [UN, DEUX], groupeCoursId: null, titre: 'Rencontre fictive',
            notesIndividuelles: deux('Bien', 'SECRET2'), snapshotAvant: deux({ c: 1 }, { c: 2 })
        },
        { id: 'I2', etudiants: [DEUX], groupeCoursId: 'GC_DEUX', titre: 'SECRET2', notesIndividuelles: { [DEUX]: 'SECRET2' } }
    ],
    // — par groupe-cours
    [T + '_fichiersTravaux_backup_v1']: [{ id: 'F1', groupeCoursId: 'GC_UN', etudiantDA: UN }, { id: 'F2', groupeCoursId: 'GC_DEUX', etudiantDA: DEUX }],
    [T + '_corbeilleFichiers_backup_v1']: [{ id: 'F3', groupeCoursId: 'GC_UN', etudiantDA: UN }, { id: 'F4', groupeCoursId: 'GC_DEUX', etudiantDA: DEUX }],
    [T + '_snapshots_GC_UN']: { hebdomadaires: [{ etudiants: [{ da: UN }] }] },
    [T + '_snapshots_GC_DEUX']: { hebdomadaires: [{ etudiants: [{ da: DEUX }] }] },
    [T + '_etudiantsSuivis_gc_GC_UN']: [{ da: UN }],
    [T + '_etudiantsSuivis_gc_GC_DEUX']: [{ da: DEUX }],
    [T + '_datesVerrouillees_gc_GC_UN']: ['2031-09-01'],
    [T + '_datesVerrouillees_gc_GC_DEUX']: ['2031-09-02'],
    // — partagées par le trimestre
    [T + '_productions']: [{ id: 'P1', titre: 'Production fictive' }],
    [T + '_pratiquesConfigurables']: [{ id: 'PR_TRIM', nom: 'Pratique fictive du trimestre' }],
    [T + '_modalitesEvaluation']: { pratique: 'PR_TRIM' },
    [T + '_collectionsProjection']: [{ id: 'CP1' }],
    [T + '_planification_seances']: { 'carte::lecon': { notes: 'Plan fictif' } },
    [T + '_preferencesRapport']: { inclureNotes: true },
    [T + '_dureePeriode']: 50,
    [T + '_resultatsBilan']: { id: 'R1', nbRepondants: 2, reponses: {} },
    // — états d'écran : ne voyagent pas (une recherche tapée peut porter un nom)
    [T + '_recherchePresences']: 'SECRET2',
    [T + '_groupeSelectionne']: 'GC_DEUX'
};

// Ce que l'élève du groupe 1 doit retrouver, famille par famille : (donnees) → vrai.
const GARDE_DU_GROUPE_1 = {
    groupeEtudiants: (v) => v.length === 1 && v[0].da === UN,
    presences: (v) => v.length === 1 && v[0].da === UN,
    evaluationsSauvegardees: (v) => v.length === 1 && v[0].etudiantDA === UN,
    evaluationsSauvegardees_backup_v1: (v) => v.length === 1 && v[0].etudiantDA === UN,
    chronoEvaluations: (v) => v.length === 1 && v[0].etudiantDA === UN,
    etudiantsSuivis: (v) => v.length === 1 && v[0].da === UN,
    indicesCP: (v) => Object.keys(v).join() === UN,
    indicesPatternsRaI: (v) => Object.keys(v).join() === UN,
    indicesEvaluation: (v) => Object.keys(v).join() === UN,
    portfoliosEleves: (v) => Object.keys(v).join() === UN,
    resultatsUlterieurs: (v) => Object.keys(v).join() === UN,
    notesRapport: (v) => v[UN] === 'Note fictive' && Object.keys(v).length === 1,
    confidentielEtudiants: (v) => Object.keys(v).join() === UN,
    indicesAssiduite: (v) => Object.keys(v.sommatif).join() === UN && v.dateCalcul === '2031-10-01',
    interventions: (v) => v.length === 1 && v[0].id === 'I1' && v[0].etudiants.join() === UN &&
        Object.keys(v[0].notesIndividuelles).join() === UN && Object.keys(v[0].snapshotAvant).join() === UN,
    fichiersTravaux_backup_v1: (v) => v.length === 1 && v[0].id === 'F1',
    corbeilleFichiers_backup_v1: (v) => v.length === 1 && v[0].id === 'F3',
    snapshots_GC_UN: (v) => v.hebdomadaires.length === 1,
    etudiantsSuivis_gc_GC_UN: (v) => v.length === 1 && v[0].da === UN,
    datesVerrouillees_gc_GC_UN: (v) => v.join() === '2031-09-01',
    productions: (v) => v.length === 1,
    pratiquesConfigurables: (v) => v[0].id === 'PR_TRIM',
    modalitesEvaluation: (v) => v.pratique === 'PR_TRIM',
    collectionsProjection: (v) => v.length === 1,
    planification_seances: (v) => !!v['carte::lecon'],
    preferencesRapport: (v) => v.inclureNotes === true,
    dureePeriode: (v) => v === 50,
    resultatsBilan: (v) => v.nbRepondants === 2
};

function creerDb(initial) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        get: async (k, def = null) => (map.has(k) ? map.get(k) : def),
        set: async (k, v) => { map.set(k, v); },
        keys: async () => [...map.keys()],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); }
    };
}

/** Un dossier du disque, en mémoire : ce que le mode dossier (Chrome, Edge) reçoit. */
function fauxDossier(nom) {
    const enfants = new Map();
    const fichiers = new Map();
    const absent = () => Object.assign(new Error('absent'), { name: 'NotFoundError' });
    return {
        kind: 'directory', name: nom, _enfants: enfants, _fichiers: fichiers,
        async getDirectoryHandle(n, o) {
            if (!enfants.has(n)) { if (!o || !o.create) throw absent(); enfants.set(n, fauxDossier(n)); }
            return enfants.get(n);
        },
        async getFileHandle(n, o) {
            if (!fichiers.has(n)) { if (!o || !o.create) throw absent(); fichiers.set(n, null); }
            return {
                kind: 'file', name: n,
                async createWritable() {
                    let contenu;
                    return { async write(x) { contenu = x; }, async close() { fichiers.set(n, contenu); }, async abort() {} };
                },
                async getFile() {
                    const c = fichiers.get(n);
                    return typeof c === 'string' ? new Blob([c]) : c;
                }
            };
        },
        async *values() {
            for (const [n] of fichiers) yield await this.getFileHandle(n);
            for (const [, d] of enfants) yield d;
        },
        async *entries() {
            for (const [n] of fichiers) yield [n, await this.getFileHandle(n)];
            for (const [n, d] of enfants) yield [n, d];
        }
    };
}

/** Monte fichier-sortant.js, reserve.js (et, sur demande, reserve-verifier.js) dans un bac à sable. */
function monter(db, options = {}) {
    const journal = { avertissements: [], notifications: [], selecteurs: [] };
    const doc = { readyState: 'loading', getElementById: () => null, createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };
    const win = {
        addEventListener: () => {}, dispatchEvent: () => {},
        afficherProgression: () => {}, majProgression: () => {}, masquerProgression: () => {},
        VERSION_MAJEURE: '1.193.0-banc', db,
        travauxStockage: { recupererBlob: async () => null },
        uiDialogues: { confirmerAction: async () => true, demanderAction: async () => null, informer: async () => {} },
        showDirectoryPicker: async (o) => { journal.selecteurs.push(o && o.mode); return options.dossier; }
    };
    const consoleBanc = Object.assign({}, consoleSandbox, { warn: (...a) => journal.avertissements.push(a.join(' ')) });
    const notifications = {};
    for (const type of ['succes', 'erreur', 'info', 'warning']) notifications[type] = (titre, message) => journal.notifications.push({ type, titre, message });
    const fauxSetTimeout = (cb, delai) => ((delai || 0) >= 60000 ? 0 : setTimeout(cb, 0));
    monterFichierSortant(win, { document: doc, setTimeout: fauxSetTimeout });
    const charger = (fichier) => {
        const brut = readFileSync(path.join(racine, fichier), 'utf8');
        const muter = options.muter && options.muter[fichier];
        const code = muter ? muter(brut) : brut;
        if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans ' + fichier);
        new Function(
            'window', 'document', 'console', 'db', 'notifications', 'JSZip', 'requestAnimationFrame',
            'setTimeout', 'navigator', 'localStorage', 'crypto', 'CustomEvent',
            '"use strict";\n' + code
        )(win, doc, consoleBanc, db, notifications, JSZip, (cb) => setTimeout(cb, 0),
            fauxSetTimeout, { userAgent: 'BacASable/1021 (Node; test)', platform: 'banc' },
            { getItem: () => null }, globalThis.crypto, class { constructor(type) { this.type = type; } });
    };
    charger('js/reserve.js');
    if (options.verifier) charger('js/reserve-verifier.js');
    return { win, reserve: win.Reserve, verifier: win.ReserveVerifier, journal, db };
}

const DOSSIER = 'a2031-601-101-gr00001';

/** Archive le groupe 1 en mode dossier ; rend `donnees.json` tel qu'il est parti, et le banc. */
async function archiverLeGroupe1(options = {}) {
    const racineDisque = fauxDossier('Archives_LaboCodex');
    const banc = monter(creerDb(ESPACE), Object.assign({}, options, { dossier: racineDisque }));
    const rendu = await banc.reserve.verserGroupeCours(T, 'GC_UN');
    expect(rendu && rendu.succes).toBe(true);
    const dossier = racineDisque._enfants.get('trimestres')._enfants.get(DOSSIER);
    const donnees = JSON.parse(dossier._fichiers.get('donnees.json'));
    return Object.assign(banc, { rendu, donnees, racineDisque });
}

/** Les clés parties qui portent quelque chose du groupe 2. */
function fuites(donnees) {
    return Object.keys(donnees).filter((k) => {
        const s = JSON.stringify(donnees[k]);
        return s.includes(DEUX) || s.includes(RETIRE) || s.includes('SECRET2');
    }).sort();
}

/** Les familles du groupe 1 absentes ou amputées. */
function pertes(donnees) {
    return Object.keys(GARDE_DU_GROUPE_1).filter((nom) => {
        const v = donnees[T + '_' + nom];
        try { return v === undefined || !GARDE_DU_GROUPE_1[nom](v); } catch (e) { return true; }
    }).sort();
}

/** Les noms du registre des trimestres, lus dans js/trimestres.js (commentaires retirés). */
function registreDesTrimestres() {
    const source = readFileSync(path.join(racine, 'js/trimestres.js'), 'utf8');
    const debut = source.indexOf('const CLES_NAMESPACEES = [');
    const fin = source.indexOf('];', debut);
    expect(debut).toBeGreaterThan(0);
    const corps = source.slice(debut, fin).split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
    return [...corps.matchAll(/'([A-Za-z0-9_]+)'/g)].map((m) => m[1]);
}

describe('#1021 · le harnais', () => {
    it('une mutation qui ne mord pas est refusée', () => {
        expect(() => monter(creerDb({}), { muter: { 'js/reserve.js': (s) => s.replace('CHAINE_ABSENTE_DU_LOT_1021', 'x') } })).toThrow(/Témoin inerte/);
    });

    it('le registre lu compte ses clés connues (le lecteur ne rend pas une liste vide)', () => {
        const noms = registreDesTrimestres();
        expect(noms.length).toBeGreaterThan(40);
        for (const n of ['notesRapport', 'confidentielEtudiants', 'resultatsUlterieurs', 'groupeEtudiants']) expect(noms).toContain(n);
    });
});

describe('#1021 · (a) (b) l\'archive du groupe 1', () => {
    it('n\'emporte rien du groupe 2, clé par clé', async () => {
        const { donnees } = await archiverLeGroupe1();
        expect(fuites(donnees)).toEqual([]);
    }, 20000);

    it('garde chaque famille de l\'élève du groupe 1', async () => {
        const { donnees } = await archiverLeGroupe1();
        expect(pertes(donnees)).toEqual([]);
    }, 20000);

    it('ne prend pas les états d\'écran, ni la trace d\'un élève retiré d\'un autre groupe', async () => {
        const { donnees } = await archiverLeGroupe1();
        for (const nom of ['recherchePresences', 'groupeSelectionne', 'elevesDesinscrits']) expect(donnees).not.toHaveProperty(T + '_' + nom);
    }, 20000);
});

describe('#1021 · (c) chaque clé du trimestre a sa règle', () => {
    it('chaque nom de CLES_NAMESPACEES, et chaque famille composée, est classé par la Réserve', () => {
        const { reserve } = monter(creerDb({}));
        const composees = ['snapshots_GC_X', 'etudiantsSuivis_gc_GC_X', 'datesVerrouillees_gc_GC_X', 'cartouches_G1'];
        const sansRegle = [...registreDesTrimestres(), ...composees].filter((n) => reserve.classerCleTrimestre(n) === null);
        expect(sansRegle).toEqual([]);
    });

    it('une clé que personne n\'a classée ne part pas : elle est dite, pas emportée entière', async () => {
        const racineDisque = fauxDossier('Archives_LaboCodex');
        const espace = Object.assign({}, ESPACE, { [T + '_nouvelleCleParEleve']: { [DEUX]: 'SECRET2' } });
        const banc = monter(creerDb(espace), { dossier: racineDisque });
        await banc.reserve.verserGroupeCours(T, 'GC_UN');
        const donnees = JSON.parse(racineDisque._enfants.get('trimestres')._enfants.get(DOSSIER)._fichiers.get('donnees.json'));
        expect(donnees).not.toHaveProperty(T + '_nouvelleCleParEleve');
        expect(banc.journal.avertissements.join('\n')).toMatch(/nouvelleCleParEleve/);
    }, 20000);
});

describe('#956 · (d) la forme nue des pratiques', () => {
    it('ne part plus ; la forme du trimestre part', async () => {
        const { donnees } = await archiverLeGroupe1();
        expect(donnees).not.toHaveProperty('pratiquesConfigurables');
        expect(donnees[T + '_pratiquesConfigurables'].map((p) => p.id)).toEqual(['PR_TRIM']);
    }, 20000);
});

describe('#829 · (e) les élèves suivis', () => {
    it('la liste du groupe part, celle de l\'autre groupe non, et rien n\'est dit « non reconnu »', async () => {
        const { donnees, journal } = await archiverLeGroupe1();
        expect(donnees[T + '_etudiantsSuivis_gc_GC_UN']).toEqual([{ da: UN }]);
        expect(donnees).not.toHaveProperty(T + '_etudiantsSuivis_gc_GC_DEUX');
        expect(journal.avertissements.filter((a) => /non reconnue|non classée/i.test(a))).toEqual([]);
    }, 20000);
});

describe('#1021 · (f) une archive d\'avant le lot', () => {
    /**
     * L'archive du groupe 1 au format d'AVANT le lot, figée : ce que reserve.js emportait de plus
     * en 1.193.0 (mesuré au banc le 9 oct. 2026) — la forme nue des pratiques, les clés par élève
     * entières, un état d'écran. Son empreinte est celle que l'ancien rédacteur calculait.
     */
    async function archiveDAvant() {
        const banc = await archiverLeGroupe1({ verifier: true });
        const avant = Object.assign({}, banc.donnees, {
            pratiquesConfigurables: ESPACE.pratiquesConfigurables,
            [T + '_notesRapport']: ESPACE[T + '_notesRapport'],
            [T + '_confidentielEtudiants']: ESPACE[T + '_confidentielEtudiants'],
            [T + '_recherchePresences']: ESPACE[T + '_recherchePresences']
        });
        const dossier = banc.racineDisque._enfants.get('trimestres')._enfants.get(DOSSIER);
        const texte = JSON.stringify(avant);
        const meta = JSON.parse(dossier._fichiers.get('meta.json'));
        meta.integrite.donnees_json_sha256 = await banc.verifier.sha256Texte(texte);
        dossier._fichiers.set('donnees.json', texte);
        dossier._fichiers.set('meta.json', JSON.stringify(meta, null, 2));
        return { banc, avant };
    }

    it('se vérifie toujours : « vérifiée », données concordantes', async () => {
        const { banc } = await archiveDAvant();
        const entree = (banc.db.getSync('_manifesteReserve', null) || { archives: {} }).archives[DOSSIER] || null;
        const rapport = await banc.verifier.verifierArchive(banc.verifier.sourceDossier(banc.racineDisque, DOSSIER), entree, DOSSIER);
        expect(rapport.donneesConcordent).toBe(true);
        expect(rapport.etat).toBe('verifiee');
    }, 20000);

    it('sa forme nue des pratiques se relit à la réouverture ; la forme du trimestre d\'une archive neuve aussi', async () => {
        // `_lireDeuxFormes` (reserve-ouvrir.js), extraite telle quelle : c'est elle que la réouverture appelle.
        const source = readFileSync(path.join(racine, 'js/reserve-ouvrir.js'), 'utf8');
        const debut = source.indexOf('function _lireDeuxFormes(');
        const fin = source.indexOf('\n}\n', debut) + 2;
        expect(debut).toBeGreaterThan(0);
        const lireDeuxFormes = new Function(source.slice(debut, fin) + '\nreturn _lireDeuxFormes;')();

        // Une archive d'avant mai : la seule forme nue.
        expect(lireDeuxFormes({ pratiquesConfigurables: ESPACE.pratiquesConfigurables }, 'pratiquesConfigurables').map((p) => p.id))
            .toEqual(['PR_NUE_FIGEE']);
        // L'archive d'avant le lot (les deux formes) : celle du trimestre, comme depuis #953.
        const { avant } = await archiveDAvant();
        expect(lireDeuxFormes(avant, 'pratiquesConfigurables').map((p) => p.id)).toEqual(['PR_TRIM']);
        // L'archive du lot (forme du trimestre seule).
        const { donnees } = await archiverLeGroupe1();
        expect(lireDeuxFormes(donnees, 'pratiquesConfigurables').map((p) => p.id)).toEqual(['PR_TRIM']);
    }, 20000);
});

describe('#1005 · (g) « Vérifier » lit, « Archiver… » écrit', () => {
    /** Le dossier des archives, avec les permissions de Chrome : chaque mode demandé est consigné. */
    function dossierAvecPermissions(racineDisque) {
        const accordes = new Set();
        const demandes = [];
        return Object.assign(racineDisque, {
            _demandes: demandes,
            async queryPermission({ mode }) {
                demandes.push('query:' + mode);
                return accordes.has(mode) || (mode === 'read' && accordes.has('readwrite')) ? 'granted' : 'prompt';
            },
            async requestPermission({ mode }) { demandes.push('request:' + mode); accordes.add(mode); return 'granted'; },
            _accorder(mode) { accordes.add(mode); }
        });
    }

    it('Vérifier : sélecteur et permission en lecture seule ; puis Archiver… redemande l\'écriture', async () => {
        // Une première archive, faite dans un autre onglet : le dossier existe, la liste la connaît.
        const disque = fauxDossier('Archives_LaboCodex');
        const premier = monter(creerDb(ESPACE), { dossier: disque });
        await premier.reserve.verserGroupeCours(T, 'GC_UN');
        const registre = premier.db.getSync('_manifesteReserve', null);
        expect(registre.archives[DOSSIER].mode_archive).toBe('fsapi');

        // Une page neuve : aucun dossier en session. « Vérifier ».
        const dossier = dossierAvecPermissions(disque);
        const banc = monter(creerDb(Object.assign({}, ESPACE, { _manifesteReserve: registre })), { dossier, verifier: true });
        banc.verifier.actionVerifier(DOSSIER);
        const verification = () => ((banc.db.getSync('_manifesteReserve', null) || { archives: {} }).archives[DOSSIER] || {}).verification;
        for (let i = 0; i < 200 && !verification(); i++) await new Promise((r) => setTimeout(r, 10));
        expect(verification().etat).toBe('verifiee'); // la vérification a bien eu lieu, par ce dossier
        expect(banc.journal.selecteurs).toEqual(['read']);
        expect(dossier._demandes.filter((d) => /readwrite/.test(d))).toEqual([]);
        expect(banc.journal.notifications.map((n) => n.type)).not.toContain('erreur');

        // Sur la même page, le dossier accordé en lecture : « Archiver… » demande l'écriture.
        dossier._demandes.length = 0;
        dossier._accorder('read');
        const rendu = await banc.reserve.verserGroupeCours(T, 'GC_UN');
        expect(rendu && rendu.succes).toBe(true);
        expect(dossier._demandes).toEqual(['query:readwrite', 'request:readwrite']);
        expect(banc.journal.selecteurs).toEqual(['read']); // pas de second sélecteur
    }, 20000);
});
