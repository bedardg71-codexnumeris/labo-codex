import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — la MOISSONNEUSE des rattachements d'activités (#424 Lot F)
// =======================================================================
//
// planification_seances[<carte>::<lecon>].activites[<actId>] portait
// {retroaction, productionId} en PARALLÈLE du nœud. Depuis le portage, la
// vérité vit sur le nœud. La moisson porte les valeurs (rétroaction → nœud
// ACTIVITÉ ; production → nœud ÉVALUATION unique et libre de la même
// leçon), retire ce qu'elle a porté, et LAISSE EN PLACE ce qu'elle ne sait
// pas résoudre — consigné, jamais inventé.
//
// SANS DRAPEAU (patron #409/#428) : un backup Codex d'avant le portage
// réintroduit `activites` à l'import ; la moisson doit repasser.
// Relevé D1 (Grégoire, 8 août midi) : 3 rétroactions, 0 production,
// 0 référence morte — le cas nominal reproduit ce périmètre.
//
// On EXTRAIT le bloc réel de main.js (patron sentinelle-367) : le test
// rejoue le code livré, pas une réimplémentation qui divergerait.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceMain = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');

// ⚠ Bornes vérifiées AVANT chaque slice (défaut de la sentinelle #413 : un
// indexOf à -1 découpait le reste du fichier en restant vert).
function finDeBloc(depuis) {
    let profondeur = 0;
    let i = sourceMain.indexOf('{', depuis);
    expect(i).toBeGreaterThan(-1);
    for (; i < sourceMain.length; i++) {
        if (sourceMain[i] === '{') profondeur++;
        else if (sourceMain[i] === '}') { profondeur--; if (profondeur === 0) return i; }
    }
    throw new Error('accolade fermante introuvable');
}

function extraireMoisson() {
    const ancre = sourceMain.indexOf('#424 Lot F (8 août 2026) — MOISSONNEUSE');
    expect(ancre).toBeGreaterThan(-1);
    const debut = sourceMain.indexOf('try {', ancre);
    expect(debut).toBeGreaterThan(ancre);
    // Le catch part avec le try, sinon le fragment n'est pas du JS valide.
    const finTry = finDeBloc(debut);
    const ouvertureCatch = sourceMain.indexOf('catch', finTry);
    expect(ouvertureCatch).toBeGreaterThan(finTry);
    const finCatch = finDeBloc(ouvertureCatch);
    return sourceMain.slice(debut, finCatch + 1);
}

const CODE_MOISSON = extraireMoisson();

function rejouerMoisson(store, journal) {
    // ⚠ STUB COMPLET — leçon des DEUX faux-verts du 8 août : un stub sans
    // `setSync`/`removeSync` rend le test aveugle à une régression qui les
    // appellerait (TypeError avalé par le catch de la moisson). On expose
    // TOUT ce que db offre, même ce que la moisson n'appelle pas.
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxConsole = {
        warn: (...args) => { if (journal) journal.push(args.join(' ')); },
        error: () => {}, log: () => {}
    };
    new Function('db', 'console', '"use strict";\n' + CODE_MOISSON)(db, fauxConsole);
}

/** Un trimestre : cartes {id: noeuds[]} + entrées de séances. */
function poserTrimestre(store, tid, cartes, seances) {
    const contenu = {};
    Object.keys(cartes).forEach(cid => {
        contenu[cid] = { compteur: 0, compteurLiens: 0, noeuds: cartes[cid], liens: [] };
    });
    store[`${tid}_planification_mindmap`] = {
        index: { active: Object.keys(cartes)[0] || null, compteurCartes: Object.keys(cartes).length, cartes: [] },
        cartes: contenu
    };
    if (seances) store[`${tid}_planification_seances`] = seances;
    store['trimestres'] = (store['trimestres'] || []);
    if (!store['trimestres'].some(t => t.id === tid)) store['trimestres'].push({ id: tid, nom: tid });
}

function fixtureNominale(store) {
    // Le périmètre du relevé D1 : 3 rétroactions posées sciemment, h2026.
    poserTrimestre(store, 'h2026', {
        'carte_1': [
            { id: 'lecon-1', type: 'lecon', titre: 'L1', enfants: ['act-1', 'act-2'], metadata: {} },
            { id: 'act-1', type: 'activite', titre: 'A1', parent: 'lecon-1', enfants: [], metadata: {} },
            { id: 'act-2', type: 'soutien', titre: 'A2', parent: 'lecon-1', enfants: [], metadata: {} },
            { id: 'lecon-2', type: 'lecon', titre: 'L2', enfants: ['act-3'], metadata: {} },
            { id: 'act-3', type: 'expose', titre: 'A3', parent: 'lecon-2', enfants: [], metadata: {} }
        ]
    }, {
        'carte_1::lecon-1': {
            note: 'La plénière reste',
            activites: {
                'act-1': { retroaction: 'orale', productionId: null },
                'act-2': { retroaction: 'pairs', productionId: null }
            }
        },
        'carte_1::lecon-2': {
            activites: { 'act-3': { retroaction: 'ecrite', productionId: null } }
        }
    });
}

function noeudDe(store, tid, cid, nid) {
    return store[`${tid}_planification_mindmap`].cartes[cid].noeuds.find(n => n.id === nid);
}

describe('Moisson #424 · le cas nominal — les 3 rétroactions du relevé D1', () => {
    it('porte chaque rétroaction vers son nœud activité', () => {
        const store = {};
        fixtureNominale(store);
        rejouerMoisson(store);

        expect(noeudDe(store, 'h2026', 'carte_1', 'act-1').metadata.retroaction).toBe('orale');
        expect(noeudDe(store, 'h2026', 'carte_1', 'act-2').metadata.retroaction).toBe('pairs');
        expect(noeudDe(store, 'h2026', 'carte_1', 'act-3').metadata.retroaction).toBe('ecrite');
    });

    it('retire le sous-objet activites moissonné — la NOTE survit', () => {
        const store = {};
        fixtureNominale(store);
        rejouerMoisson(store);

        const seances = store['h2026_planification_seances'];
        expect(seances['carte_1::lecon-1'].activites).toBeUndefined();
        expect(seances['carte_1::lecon-2'].activites).toBeUndefined();
        expect(seances['carte_1::lecon-1'].note).toBe('La plénière reste');
    });

    it('est idempotente, et repasse SANS drapeau sur un backup réimporté', () => {
        const store = {};
        fixtureNominale(store);
        rejouerMoisson(store);
        const apres1 = JSON.stringify(store);
        rejouerMoisson(store);
        expect(JSON.stringify(store)).toBe(apres1);

        // Un backup d'avant le portage réintroduit activites : la moisson
        // repasse — c'est la raison d'être du « sans drapeau ».
        store['h2026_planification_seances']['carte_1::lecon-1'] = {
            activites: { 'act-1': { retroaction: 'pairs', productionId: null } }
        };
        rejouerMoisson(store);
        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites).toBeUndefined();
        // ⚠ ET le nœud n'a PAS été écrasé : il portait déjà 'orale' (prioritaire).
        expect(noeudDe(store, 'h2026', 'carte_1', 'act-1').metadata.retroaction).toBe('orale');
    });

    it('le code extrait ne lit ni ne pose AUCUN drapeau migration_*', () => {
        expect(CODE_MOISSON).not.toMatch(/migration_/);
    });
});

describe('Moisson #424 · priorité au nœud et défauts', () => {
    it('ne remplace jamais une rétroaction déjà posée sur le nœud', () => {
        const store = {};
        poserTrimestre(store, 'h2026', {
            'carte_1': [
                { id: 'lecon-1', type: 'lecon', enfants: ['act-1'], metadata: {} },
                { id: 'act-1', type: 'activite', parent: 'lecon-1', enfants: [], metadata: { retroaction: 'ecrite' } }
            ]
        }, {
            'carte_1::lecon-1': { activites: { 'act-1': { retroaction: 'orale', productionId: null } } }
        });
        rejouerMoisson(store);

        expect(noeudDe(store, 'h2026', 'carte_1', 'act-1').metadata.retroaction).toBe('ecrite');
        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites).toBeUndefined();
    });

    it('« aucune » n’est pas un rattachement : rien n’est porté, l’entrée part', () => {
        const store = {};
        poserTrimestre(store, 'h2026', {
            'carte_1': [
                { id: 'lecon-1', type: 'lecon', enfants: ['act-1'], metadata: {} },
                { id: 'act-1', type: 'activite', parent: 'lecon-1', enfants: [], metadata: {} }
            ]
        }, {
            'carte_1::lecon-1': { activites: { 'act-1': { retroaction: 'aucune', productionId: null } } }
        });
        rejouerMoisson(store);

        expect(noeudDe(store, 'h2026', 'carte_1', 'act-1').metadata.retroaction).toBeUndefined();
        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites).toBeUndefined();
    });

    it('balaie TOUS les trimestres, pas seulement l’actif (leçon #429)', () => {
        const store = {};
        poserTrimestre(store, 'a2025', {
            'carte_1': [
                { id: 'lecon-1', type: 'lecon', enfants: ['act-1'], metadata: {} },
                { id: 'act-1', type: 'activite', parent: 'lecon-1', enfants: [], metadata: {} }
            ]
        }, { 'carte_1::lecon-1': { activites: { 'act-1': { retroaction: 'orale', productionId: null } } } });
        poserTrimestre(store, 'h2026', {
            'carte_9': [
                { id: 'lecon-9', type: 'lecon', enfants: ['act-9'], metadata: {} },
                { id: 'act-9', type: 'revision', parent: 'lecon-9', enfants: [], metadata: {} }
            ]
        }, { 'carte_9::lecon-9': { activites: { 'act-9': { retroaction: 'pairs', productionId: null } } } });

        rejouerMoisson(store);

        expect(noeudDe(store, 'a2025', 'carte_1', 'act-1').metadata.retroaction).toBe('orale');
        expect(noeudDe(store, 'h2026', 'carte_9', 'act-9').metadata.retroaction).toBe('pairs');
    });
});

describe('Moisson #424 · la production voyage vers l’ÉVALUATION — jamais inventée', () => {
    function fixtureProduction(store, { deuxEvals = false, evalOccupee = false } = {}) {
        const noeuds = [
            { id: 'lecon-1', type: 'lecon', enfants: ['act-1', 'eval-1'].concat(deuxEvals ? ['eval-2'] : []), metadata: {} },
            { id: 'act-1', type: 'activite', parent: 'lecon-1', enfants: [], metadata: {} },
            { id: 'eval-1', type: 'evaluation', parent: 'lecon-1', enfants: [], metadata: evalOccupee ? { productionId: 'prod-deja' } : {} }
        ];
        if (deuxEvals) noeuds.push({ id: 'eval-2', type: 'evaluation', parent: 'lecon-1', enfants: [], metadata: {} });
        poserTrimestre(store, 'h2026', { 'carte_1': noeuds }, {
            'carte_1::lecon-1': { activites: { 'act-1': { retroaction: 'orale', productionId: 'prod-x' } } }
        });
    }

    it('évaluation UNIQUE et libre → la production s’y pose, l’entrée part', () => {
        const store = {};
        fixtureProduction(store);
        rejouerMoisson(store);

        expect(noeudDe(store, 'h2026', 'carte_1', 'eval-1').metadata.productionId).toBe('prod-x');
        expect(noeudDe(store, 'h2026', 'carte_1', 'act-1').metadata.retroaction).toBe('orale');
        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites).toBeUndefined();
    });

    it('DEUX évaluations → ne rien inventer : consigné, laissé en place', () => {
        const store = {};
        const journal = [];
        fixtureProduction(store, { deuxEvals: true });
        rejouerMoisson(store, journal);

        expect(noeudDe(store, 'h2026', 'carte_1', 'eval-1').metadata.productionId).toBeUndefined();
        expect(noeudDe(store, 'h2026', 'carte_1', 'eval-2').metadata.productionId).toBeUndefined();
        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites['act-1'].productionId).toBe('prod-x');
        expect(journal.some(l => l.includes('sans évaluation unique libre'))).toBe(true);
    });

    it('évaluation déjà OCCUPÉE → ne jamais écraser : consigné, laissé en place', () => {
        const store = {};
        fixtureProduction(store, { evalOccupee: true });
        rejouerMoisson(store);

        expect(noeudDe(store, 'h2026', 'carte_1', 'eval-1').metadata.productionId).toBe('prod-deja');
        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites['act-1']).toBeTruthy();
    });

    it('nœud d’activité INTROUVABLE → consigné, laissé en place', () => {
        const store = {};
        const journal = [];
        poserTrimestre(store, 'h2026', {
            'carte_1': [{ id: 'lecon-1', type: 'lecon', enfants: [], metadata: {} }]
        }, {
            'carte_1::lecon-1': { activites: { 'act-fantome': { retroaction: 'orale', productionId: null } } }
        });
        rejouerMoisson(store, journal);

        expect(store['h2026_planification_seances']['carte_1::lecon-1'].activites['act-fantome']).toBeTruthy();
        expect(journal.some(l => l.includes('introuvable'))).toBe(true);
    });
});
