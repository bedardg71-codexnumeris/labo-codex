import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #403 (design tranché par Grégoire le 6 août 2026, livré le 7) — les objectifs
// de leçon entrent dans la boucle de vérification. Jusqu'ici la chaîne passait
// par compétence → idée maîtresse ; l'objectif de leçon, lui, n'était vérifié
// par rien (§6 quinquies, « rappel de périmètre »).
//
// Le lien vit sur le nœud SERVANT (`metadata.objectifsServis = [idObjectif…]`),
// pas sur l'objectif : pas de second système de liens, pas de nouveau type.
//
// Cette sentinelle verrouille les quatre coutures du chantier :
//   A. le modèle — la leçon parente fait foi à la lecture ;
//   B. la vérification — servi / vérifié en direct / vérifié en transitif ;
//   C. l'IDENTITÉ des objectifs — la couture que #403 rend critique : avant
//      ce jour, appliquerObjectifs() réattribuait les ids PAR RANG, donc
//      insérer un objectif au milieu décalait tous les liens d'un cran, en
//      silence. Inoffensif tant que rien ne visait les ids ; faux depuis ;
//   D. la duplication — la copie régénère les ids d'objectifs, les liens de
//      ses activités doivent suivre.

let store;

function monterModule() {
    store = {};

    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };

    const planificationDonnees = {
        getIndex: () => ({ active: 'carte_1' }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };

    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = planificationDonnees;
    return win.planificationCarte;
}

/** Leçon portant N objectifs, dont les ids sont prévisibles pour le test. */
function poserLecon(api, id, textesObjectifs = [], enfants = []) {
    const objectifs = textesObjectifs.map((texte, i) => ({ id: `obj_${id}_${i}`, texte }));
    api.etat.noeuds.set(id, {
        id, type: 'lecon', titre: 'Leçon', parent: null,
        enfants: enfants.slice(), cloneSourceId: null,
        metadata: objectifs.length ? { objectifs } : {}
    });
    return objectifs;
}

function poserEnfant(api, id, type, leconId, objectifsServis = null) {
    const metadata = {};
    if (objectifsServis) metadata.objectifsServis = objectifsServis.slice();
    api.etat.noeuds.set(id, {
        id, type, titre: type, parent: leconId,
        enfants: [], cloneSourceId: null, metadata
    });
    const lecon = api.etat.noeuds.get(leconId);
    if (lecon && lecon.enfants.indexOf(id) === -1) lecon.enfants.push(id);
}

function poserLien(api, source, cible, type = 'se_verifie_par') {
    const id = `lien_${source}_${cible}`;
    api.etat.liens.set(id, { id, source, cible, type });
}

// =======================================================================
// A. LE MODÈLE — la leçon parente fait foi
// =======================================================================
describe('#403 · A · modèle des objectifs servis', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('rend les objectifs déclarés servis par une activité de sa leçon', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte', 'Formuler une hypothèse']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);

        expect(api.objectifsServisPar(api.etat.noeuds.get('act1'))).toEqual([objs[0].id]);
    });

    it('ÉCARTE les ids qui n’appartiennent pas à sa leçon (clone déplacé, objectif retiré)', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserLecon(api, 'lec2', ['Tout autre chose']);
        // L'activité vit dans lec2 mais déclare un objectif de lec1.
        poserEnfant(api, 'act1', 'activite', 'lec2', [objs[0].id]);

        expect(api.objectifsServisPar(api.etat.noeuds.get('act1'))).toEqual([]);
    });

    it('rend [] pour un nœud libre (aucune leçon parente)', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        api.etat.noeuds.set('libre', {
            id: 'libre', type: 'activite', parent: null,
            enfants: [], cloneSourceId: null,
            metadata: { objectifsServis: [objs[0].id] }
        });

        expect(api.objectifsServisPar(api.etat.noeuds.get('libre'))).toEqual([]);
    });

    it('definirObjectifsServis écrit, et EFFACE la clé quand la liste se vide', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'act1', 'activite', 'lec1');

        expect(api.definirObjectifsServis('act1', [objs[0].id])).toBe(true);
        expect(api.etat.noeuds.get('act1').metadata.objectifsServis).toEqual([objs[0].id]);

        api.definirObjectifsServis('act1', []);
        expect('objectifsServis' in api.etat.noeuds.get('act1').metadata).toBe(false);
    });

    it('refuse les types qui ne peuvent pas servir un objectif (une connaissance)', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'conn1', 'procedurale', 'lec1');

        expect(api.definirObjectifsServis('conn1', [objs[0].id])).toBe(false);
        expect(api.etat.noeuds.get('conn1').metadata.objectifsServis).toBeUndefined();
    });

    it('le trio activité / soutien / révision peut servir, comme partout ailleurs', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        ['activite', 'soutien', 'revision'].forEach((type, i) => {
            poserEnfant(api, `n${i}`, type, 'lec1');
            expect(api.definirObjectifsServis(`n${i}`, [objs[0].id])).toBe(true);
        });
    });
});

// =======================================================================
// B. LA VÉRIFICATION — servi, puis vérifié (direct ou transitif)
// =======================================================================
describe('#403 · B · évaluation d’un objectif', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('INVITATION quand aucune activité ne le sert', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'act1', 'activite', 'lec1');

        const res = api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id);
        expect(res.etat).toBe('invitation');
    });

    it('SERVI quand une activité le sert mais que rien ne le vérifie', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);

        const res = api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id);
        expect(res.etat).toBe('servi');
        expect(res.message).toMatch(/aucune évaluation/i);
    });

    it('VÉRIFIÉ en DIRECT — une évaluation de la leçon coche l’objectif', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);
        poserEnfant(api, 'eval1', 'evaluation', 'lec1', [objs[0].id]);

        const res = api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id);
        expect(res.etat).toBe('verifie');
    });

    it('VÉRIFIÉ en TRANSITIF — l’activité qui le sert est reliée à une évaluation', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);
        api.etat.noeuds.set('evalLibre', {
            id: 'evalLibre', type: 'evaluation', parent: null,
            enfants: [], cloneSourceId: null, metadata: {}
        });
        poserLien(api, 'act1', 'evalLibre');

        const res = api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id);
        expect(res.etat).toBe('verifie');
        expect(res.message).toMatch(/via une activité reliée/i);
    });

    it('une évaluation qui coche SEULE ne suffit pas : il faut d’abord être SERVI', () => {
        // Le design dit « servi par ≥ 1 activité, ET vérifié ». Une évaluation
        // orpheline ne doit pas faire passer l'objectif au vert.
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'eval1', 'evaluation', 'lec1', [objs[0].id]);

        expect(api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id).etat).toBe('invitation');
    });

    it('les objectifs d’une même leçon sont évalués SÉPARÉMENT', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter', 'Formuler']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);
        poserEnfant(api, 'eval1', 'evaluation', 'lec1', [objs[0].id]);

        expect(api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id).etat).toBe('verifie');
        expect(api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[1].id).etat).toBe('invitation');
    });

    it('un lien vers autre chose qu’une évaluation ne vérifie rien', () => {
        const objs = poserLecon(api, 'lec1', ['Annoter un texte']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);
        api.etat.noeuds.set('conn', {
            id: 'conn', type: 'procedurale', parent: null,
            enfants: [], cloneSourceId: null, metadata: {}
        });
        poserLien(api, 'act1', 'conn', 's_acquiert_par');

        expect(api.evaluerObjectif(api.etat.noeuds.get('lec1'), objs[0].id).etat).toBe('servi');
    });
});

// =======================================================================
// C. L'IDENTITÉ DES OBJECTIFS — la couture que #403 rend critique
// =======================================================================
describe('#403 · C · les ids d’objectifs survivent aux remaniements de liste', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    function lecon(api2) { return api2.etat.noeuds.get('lec1'); }
    function ids(api2) {
        return api2.objectifsDeLecon(lecon(api2)).map((o) => o.id);
    }

    it('INSÉRER au milieu ne décale pas les ids des objectifs existants', () => {
        poserLecon(api, 'lec1', ['A', 'B']);
        const [idA, idB] = ids(api);

        // Ce que fait la carte : elle renvoie ses lignes AVEC leur identité,
        // la ligne neuve n'en ayant pas.
        api.appliquerObjectifs(lecon(api), [
            { id: idA, texte: 'A' },
            { id: null, texte: 'A bis' },
            { id: idB, texte: 'B' }
        ]);

        const apres = api.objectifsDeLecon(lecon(api));
        expect(apres.map((o) => o.texte)).toEqual(['A', 'A bis', 'B']);
        expect(apres[0].id).toBe(idA);
        expect(apres[2].id).toBe(idB); // ← décalait d'un cran avant le 7 août
        expect(apres[1].id).not.toBe(idB);
    });

    it('RETIRER au milieu laisse aux survivants leur id', () => {
        poserLecon(api, 'lec1', ['A', 'B', 'C']);
        const [idA, , idC] = ids(api);

        api.appliquerObjectifs(lecon(api), [
            { id: idA, texte: 'A' },
            { id: idC, texte: 'C' }
        ]);

        const apres = api.objectifsDeLecon(lecon(api));
        expect(apres.map((o) => o.id)).toEqual([idA, idC]);
    });

    it('sans id fourni, un texte INCHANGÉ garde son id même s’il a changé de rang', () => {
        // C'est le chemin de l'Organisateur : un champ texte, aucune identité
        // transmise. Insérer une ligne au milieu ne doit pas tout décaler.
        poserLecon(api, 'lec1', ['A', 'B']);
        const [idA, idB] = ids(api);

        api.appliquerObjectifs(lecon(api), ['A', 'Nouveau', 'B']);

        const apres = api.objectifsDeLecon(lecon(api));
        expect(apres[0].id).toBe(idA);
        expect(apres[2].id).toBe(idB);
    });

    it('une simple REFORMULATION conserve l’id (repli par rang)', () => {
        poserLecon(api, 'lec1', ['Annoter un texte']);
        const [idA] = ids(api);

        api.appliquerObjectifs(lecon(api), ['Annoter un texte littéraire']);

        const apres = api.objectifsDeLecon(lecon(api));
        expect(apres[0].id).toBe(idA);
        expect(apres[0].texte).toBe('Annoter un texte littéraire');
    });

    it('REFORMULER un objectif QUI A CHANGÉ DE RANG conserve son id', () => {
        // Le seul cas que la passe « par texte » ne peut pas rattraper : le
        // texte a changé ET le rang a bougé. Seule l'identité transmise par la
        // ligne (data-obj-id) répond — c'est ce qui justifie que la carte la
        // transmette au lieu de laisser deviner.
        poserLecon(api, 'lec1', ['A', 'B']);
        const [idA, idB] = ids(api);

        api.appliquerObjectifs(lecon(api), [
            { id: idA, texte: 'A' },
            { id: null, texte: 'Objectif intercalé' },
            { id: idB, texte: 'B reformulé' }
        ]);

        const apres = api.objectifsDeLecon(lecon(api));
        expect(apres.map((o) => o.texte)).toEqual(['A', 'Objectif intercalé', 'B reformulé']);
        expect(apres[2].id).toBe(idB);
        expect(apres[1].id).not.toBe(idB);
    });

    it('le lien #403 survit à « reformuler + insérer » en un seul geste', () => {
        const objs = poserLecon(api, 'lec1', ['A', 'B']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[1].id]); // sert « B »

        api.appliquerObjectifs(lecon(api), [
            { id: objs[0].id, texte: 'A' },
            { id: null, texte: 'Intercalé' },
            { id: objs[1].id, texte: 'B, mieux formulé' }
        ]);

        const apres = api.objectifsDeLecon(lecon(api));
        const servis = api.objectifsServisPar(api.etat.noeuds.get('act1'));
        expect(servis).toHaveLength(1);
        expect(apres.find((o) => o.id === servis[0]).texte).toBe('B, mieux formulé');
    });

    it('deux objectifs n’héritent JAMAIS du même id', () => {
        poserLecon(api, 'lec1', ['A']);
        const [idA] = ids(api);

        api.appliquerObjectifs(lecon(api), [
            { id: idA, texte: 'A' },
            { id: idA, texte: 'Copie de A' }
        ]);

        const apres = api.objectifsDeLecon(lecon(api));
        expect(apres[0].id).toBe(idA);
        expect(apres[1].id).not.toBe(idA);
    });

    it('le lien #403 suit son objectif à travers une insertion au milieu', () => {
        // La preuve de bout en bout : c'est ce que la couture C protège.
        const objs = poserLecon(api, 'lec1', ['A', 'B']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[1].id]); // sert « B »

        api.appliquerObjectifs(lecon(api), [
            { id: objs[0].id, texte: 'A' },
            { id: null, texte: 'A bis' },
            { id: objs[1].id, texte: 'B' }
        ]);

        const apres = api.objectifsDeLecon(lecon(api));
        const servis = api.objectifsServisPar(api.etat.noeuds.get('act1'));
        expect(servis).toHaveLength(1);
        // Toujours « B », pas « A bis ».
        expect(apres.find((o) => o.id === servis[0]).texte).toBe('B');
    });
});

// =======================================================================
// D. DUPLICATION — la copie ne naît pas avec les liens de l'originale
// =======================================================================
describe('#403 · D · duplication d’une leçon', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('remappe les objectifsServis vers les objectifs de la COPIE', () => {
        const objs = poserLecon(api, 'lec1', ['A', 'B']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[1].id]);
        api.etat.noeuds.get('lec1').x = 0;
        api.etat.noeuds.get('lec1').y = 0;
        api.etat.noeuds.get('act1').x = 0;
        api.etat.noeuds.get('act1').y = 0;

        const copieId = api.dupliquerConteneurEnProfondeur('lec1');
        expect(copieId).toBeTruthy();

        const copie = api.etat.noeuds.get(copieId);
        const objsCopie = api.objectifsDeLecon(copie);
        const actCopie = api.etat.noeuds.get(copie.enfants[0]);

        // Des ids NEUFS…
        expect(objsCopie.map((o) => o.id)).not.toEqual(objs.map((o) => o.id));
        // …et le lien pointe vers l'objectif « B » DE LA COPIE.
        const servis = api.objectifsServisPar(actCopie);
        expect(servis).toHaveLength(1);
        expect(objsCopie.find((o) => o.id === servis[0]).texte).toBe('B');

        // L'originale n'a pas bougé.
        expect(api.objectifsServisPar(api.etat.noeuds.get('act1'))).toEqual([objs[1].id]);
    });

    it('la copie est évaluée pour elle-même (état identique à l’originale)', () => {
        const objs = poserLecon(api, 'lec1', ['A']);
        poserEnfant(api, 'act1', 'activite', 'lec1', [objs[0].id]);
        poserEnfant(api, 'eval1', 'evaluation', 'lec1', [objs[0].id]);
        ['lec1', 'act1', 'eval1'].forEach((n) => {
            api.etat.noeuds.get(n).x = 0;
            api.etat.noeuds.get(n).y = 0;
        });

        const copieId = api.dupliquerConteneurEnProfondeur('lec1');
        const copie = api.etat.noeuds.get(copieId);
        const objCopie = api.objectifsDeLecon(copie)[0];

        expect(api.evaluerObjectif(copie, objCopie.id).etat).toBe('verifie');
    });
});
