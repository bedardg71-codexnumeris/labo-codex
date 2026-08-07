import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// REPRISE D'UN TRIMESTRE À L'AUTRE — lot 2 (#407), 7 août 2026.
//
// Ferme #368 : chaque rentrée, retrouver la carte du 601-101 de la session
// précédente était un geste manuel — ouvrir la liste de TOUS les trimestres et
// reconnaître la bonne carte à son nom. Le `coursId` posé au lot 1 permet de la
// DÉSIGNER.
//
// Ce que cette sentinelle verrouille :
//  • la requête ne rend QUE les cartes du bon cours, et jamais celles du
//    trimestre courant (on ne se « reprend » pas soi-même) ;
//  • la reprise COPIE — la carte d'origine reste intacte, c'est la garantie
//    que l'enseignant peut recommencer sans rien perdre ;
//  • rien ne s'importe tout seul : la requête est en LECTURE PURE.

let store;
let coursActifCourant;

// ⚠ Les dépendances passent par `globaux` : `chargerScript` les injecte en
// paramètres de fonction, et une variable libre ne se résout PAS contre le faux
// `window` (leçon du lot 1, où le module levait ReferenceError en silence).
/**
 * @param {boolean} parReference Modélise le chemin `memoryCache` de `db.js`,
 *   qui rend l'objet STOCKÉ et non une copie — contrairement au chemin
 *   localStorage, qui reparse le JSON à chaque lecture. C'est ce chemin-là qui
 *   rend le deep-clone de `importerDepuisBibliotheque()` nécessaire, et c'est
 *   donc le SEUL harnais où « la source reste intacte » peut échouer.
 *   Le stub sérialisant (défaut) ne peut pas partager de référence : il rendrait
 *   ce test vert quoi qu'il arrive — une attestation, pas une preuve
 *   (break-test E : retirer le clone ne rougissait rien).
 */
function monterModule({ parReference = false } = {}) {
    store = {};
    coursActifCourant = null;
    // Par défaut le stub SÉRIALISE comme localStorage : sans ça, une mutation
    // atteindrait le store sans passer par la sauvegarde, et « ça persiste »
    // passerait même sans sauvegarde (leçon du break-test F, lot 1).
    const copie = (v) => (
        parReference || v === undefined || v === null ? v : JSON.parse(JSON.stringify(v))
    );
    const db = {
        getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = copie(v); },
        get: async (k, d) => (k in store ? copie(store[k]) : d),
        set: async (k, v) => { store[k] = copie(v); }
    };
    const win = chargerScript('js/planification-donnees.js', {
        db,
        cle: (k) => `a2026_${k}`,
        cleSource: (k, tid) => `${tid}_${k}`,
        obtenirCoursActifId: () => coursActifCourant,
        obtenirTrimestreId: () => 'a2026',
        obtenirTrimestres: () => [
            { id: 'h2026', nom: 'Hiver 2026' },
            { id: 'a2025', nom: 'Automne 2025' },
            { id: 'a2026', nom: 'Automne 2026' }
        ]
    });
    win.cle = (k) => `a2026_${k}`;
    return win;
}

/** Pose les cartes d'un trimestre (le trimestre actif est a2026). */
function poserTrimestre(tid, cartes) {
    const cartesContenu = {};
    cartes.forEach(c => {
        cartesContenu[c.id] = {
            compteur: 0, compteurLiens: 0,
            noeuds: c.noeuds || [], liens: []
        };
    });
    store[`${tid}_planification_mindmap`] = {
        index: {
            active: cartes[0] ? cartes[0].id : null,
            compteurCartes: cartes.length,
            cartes: cartes.map(c => {
                const e = { id: c.id, nom: c.nom };
                if (c.coursId) e.coursId = c.coursId;
                return e;
            })
        },
        cartes: cartesContenu
    };
}

describe('Reprise · la requête par cours', () => {
    let api;
    beforeEach(() => { api = monterModule().planificationDonnees; });

    it('ne rend QUE les cartes du cours demandé', () => {
        poserTrimestre('h2026', [
            { id: 'carte_1', nom: 'Français 601-101', coursId: 'c-601' },
            { id: 'carte_2', nom: 'Philo', coursId: 'c-340' },
            { id: 'carte_3', nom: 'Sans cours' }
        ]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);

        const reprises = api.listerReprisesPourCours('c-601');
        expect(reprises).toHaveLength(1);
        expect(reprises[0].carte.nom).toBe('Français 601-101');
        expect(reprises[0].trimestreId).toBe('h2026');
        expect(reprises[0].trimestreNom).toBe('Hiver 2026');
    });

    it('ignore le trimestre COURANT — on ne se reprend pas soi-même', () => {
        // La carte du trimestre actif porte le même cours : elle ne doit jamais
        // être proposée, sinon la reprise dupliquerait la carte en cours.
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Celle d’ici', coursId: 'c-601' }]);

        expect(api.listerReprisesPourCours('c-601')).toHaveLength(0);
    });

    it('trouve la même carte dans PLUSIEURS trimestres antérieurs', () => {
        poserTrimestre('h2026', [{ id: 'carte_1', nom: '601-101 v2', coursId: 'c-601' }]);
        poserTrimestre('a2025', [{ id: 'carte_1', nom: '601-101 v1', coursId: 'c-601' }]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);

        const reprises = api.listerReprisesPourCours('c-601');
        expect(reprises).toHaveLength(2);
        expect(reprises.map(r => r.trimestreId).sort()).toEqual(['a2025', 'h2026']);
    });

    it('sans cours, ou pour un cours inconnu, elle ne propose rien', () => {
        poserTrimestre('h2026', [{ id: 'carte_1', nom: 'X', coursId: 'c-601' }]);
        expect(api.listerReprisesPourCours(null)).toEqual([]);
        expect(api.listerReprisesPourCours('')).toEqual([]);
        expect(api.listerReprisesPourCours('c-INCONNU')).toEqual([]);
    });

    it('une carte SANS cours n’est jamais proposée', () => {
        poserTrimestre('h2026', [{ id: 'carte_1', nom: 'Orpheline' }]);
        expect(api.listerReprisesPourCours('c-601')).toEqual([]);
    });

    it('la requête est en LECTURE PURE — rien ne s’importe tout seul', () => {
        poserTrimestre('h2026', [{ id: 'carte_1', nom: '601-101', coursId: 'c-601' }]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);
        const avant = JSON.stringify(store);

        api.listerReprisesPourCours('c-601');

        expect(JSON.stringify(store)).toBe(avant);
    });
});

describe('Reprise · le geste lui-même', () => {
    let api;
    beforeEach(() => { api = monterModule().planificationDonnees; });

    it('la copie arrive avec son contenu ET son cours', () => {
        poserTrimestre('h2026', [{
            id: 'carte_1', nom: '601-101', coursId: 'c-601',
            noeuds: [{ id: 'n1', type: 'lecon', titre: 'Accueil', metadata: { semaine: 3 } }]
        }]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);
        store['cours'] = [{ id: 'c-601', code: '601-101' }];

        const nouvelId = api.importerCarteDepuisTrimestre('h2026', 'carte_1');
        const arrivee = store['a2026_planification_mindmap'];

        expect(arrivee.cartes[nouvelId].noeuds).toHaveLength(1);
        expect(arrivee.cartes[nouvelId].noeuds[0].titre).toBe('Accueil');
        expect(api.obtenirCoursDeCarte(nouvelId)).toBe('c-601');
    });

    it('une fois reprise, la carte n’est plus proposée en reprise DEPUIS ce trimestre', () => {
        // La copie vit maintenant dans le trimestre actif, donc elle est exclue
        // par la règle « jamais le trimestre courant ». Seule la source reste
        // proposée — reprendre deux fois est possible, mais jamais en boucle
        // sur soi-même.
        poserTrimestre('h2026', [{ id: 'carte_1', nom: '601-101', coursId: 'c-601' }]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);
        store['cours'] = [{ id: 'c-601', code: '601-101' }];

        const nouvelId = api.importerCarteDepuisTrimestre('h2026', 'carte_1');
        const reprises = api.listerReprisesPourCours('c-601');

        expect(reprises.map(r => r.carte.id)).not.toContain(nouvelId);
        expect(reprises).toHaveLength(1);
        expect(reprises[0].trimestreId).toBe('h2026');
    });
});

describe('Reprise · l’INDÉPENDANCE de la copie (harnais par référence)', () => {
    let api;
    // Le seul harnais où ce test peut échouer — voir `monterModule`.
    beforeEach(() => { api = monterModule({ parReference: true }).planificationDonnees; });

    it('retoucher la carte reprise ne touche PAS celle du trimestre d’origine', () => {
        // La garantie qui compte pour Grégoire : reprendre le 601-101 de l'hiver
        // pour l'automne ne doit jamais pouvoir abîmer le plan de l'hiver — qui
        // est une session déjà donnée, avec ses évaluations.
        poserTrimestre('h2026', [{
            id: 'carte_1', nom: '601-101', coursId: 'c-601',
            noeuds: [{ id: 'n1', type: 'lecon', titre: 'Accueil', metadata: { semaine: 3 } }]
        }]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);
        store['cours'] = [{ id: 'c-601', code: '601-101' }];

        const nouvelId = api.importerCarteDepuisTrimestre('h2026', 'carte_1');
        expect(nouvelId).toBeTruthy();

        // Retouche de la copie, comme le ferait l'enseignant à la rentrée.
        const copie = store['a2026_planification_mindmap'].cartes[nouvelId];
        copie.noeuds[0].titre = 'Accueil (revu pour A2026)';
        copie.noeuds[0].metadata.semaine = 1;
        copie.noeuds.push({ id: 'n2', type: 'lecon', titre: 'Nouveauté' });

        const origine = store['h2026_planification_mindmap'].cartes['carte_1'];
        expect(origine.noeuds).toHaveLength(1);
        expect(origine.noeuds[0].titre).toBe('Accueil');
        expect(origine.noeuds[0].metadata.semaine).toBe(3);
    });
});

describe('Reprise · les notes de leçon suivent la carte (#367 × #407)', () => {
    let api;
    beforeEach(() => { api = monterModule().planificationDonnees; });

    // TROU DÉTECTÉ AU BREAK-TEST DU 7 AOÛT (rituel de fin de session, §4).
    // `copierSeancesLecons()` traduit la clé composite de la carte SOURCE vers
    // celle de la carte d'ARRIVÉE — les ids de leçon (`planif-noeud_N`) venant
    // d'un compteur PAR CARTE, la copie porte un id de carte différent.
    // Sans cette traduction, la note s'écrivait dans le trimestre d'arrivée
    // sous la clé de la carte source : invisible sur la carte reprise, et
    // silencieusement collisionnable. Les trois volets ci-dessous rougissent
    // quand on remplace `cleCibleNote` par `cleSourceNote`.

    function poserRepriseAvecNote(notesSource) {
        poserTrimestre('h2026', [{
            id: 'carte_1', nom: '601-101', coursId: 'c-601',
            noeuds: [{ id: 'planif-noeud_3', type: 'lecon', titre: 'Accueil' }]
        }]);
        poserTrimestre('a2026', [{ id: 'carte_9', nom: 'Vide' }]);
        store['cours'] = [{ id: 'c-601', code: '601-101' }];
        store['h2026_planification_seances'] = notesSource;
        return api.importerCarteDepuisTrimestre('h2026', 'carte_1');
    }

    it('la note arrive sous la clé composite de la carte d’ARRIVÉE', () => {
        const nouvelId = poserRepriseAvecNote({
            'carte_1::planif-noeud_3': { note: 'Prévoir 20 min de plénière' }
        });

        const notes = store['a2026_planification_seances'];
        expect(notes[`${nouvelId}::planif-noeud_3`]).toEqual({ note: 'Prévoir 20 min de plénière' });
        // La clé de la carte SOURCE n'a rien à faire dans le trimestre d'arrivée.
        expect(notes['carte_1::planif-noeud_3']).toBeUndefined();
    });

    it('la note du trimestre d’origine reste en place — c’est une COPIE', () => {
        poserRepriseAvecNote({
            'carte_1::planif-noeud_3': { note: 'Prévoir 20 min de plénière' }
        });

        expect(store['h2026_planification_seances']['carte_1::planif-noeud_3'])
            .toEqual({ note: 'Prévoir 20 min de plénière' });
    });

    it('la note d’une AUTRE carte du trimestre source ne suit pas', () => {
        // Même id de leçon, autre carte : sans filtrage par clé composite
        // source, cette note serait aspirée dans la reprise.
        const nouvelId = poserRepriseAvecNote({
            'carte_1::planif-noeud_3': { note: 'la bonne' },
            'carte_7::planif-noeud_3': { note: 'celle d’une autre carte' }
        });

        const notes = store['a2026_planification_seances'];
        expect(notes[`${nouvelId}::planif-noeud_3`]).toEqual({ note: 'la bonne' });
        expect(Object.keys(notes)).toHaveLength(1);
    });
});
