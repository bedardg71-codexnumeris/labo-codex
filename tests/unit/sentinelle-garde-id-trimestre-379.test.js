import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #379 (audit qualité 5 août 2026, rapport B1+B2, 🔴) —
// Changer la session/année du trimestre ACTIF réécrit son id, donc le préfixe
// de TOUTES ses clés namespacées. Aucune migration n'existe : sans garde, les
// données restent sous l'ancien préfixe et « disparaissent » (famille de
// l'incident « cartes perdues » du 4 août). Gardes posées dans
// sauvegarderIdentificationTrimestreV2 : (1) collision d'id avec un autre
// trimestre du registre (mise à jour ET création) ; (2) orphelinage si des
// données vivent sous l'ancien préfixe — énumération DEUX couches
// (localStorage + memoryCache, leçon du 5 août). Volet B2 : après
// création+activation d'un trimestre, l'identification affichée doit être
// rechargée (sinon un « Enregistrer » réécrit l'id du nouveau trimestre avec
// les valeurs périmées → re-déclenche B1 avec collision).
//
// ↻ Lot E2 de l'enregistrement (28 sept. 2026, D3) : la session et l'année s'écrivent
// ensemble AU CHANGEMENT (plus de bouton « Enregistrer ») ; les deux gardes sont les
// mêmes, et leur refus parle par le TÉMOIN COMMUN (« Non enregistré – Identification du
// trimestre : … »), plus par notifications.erreur. Le nom a son propre écrivain.

/**
 * Environnement : champs du formulaire + registre trimestres + deux couches
 * de stockage (cf. sentinelle-fusion-journees-374 pour le pourquoi des couches).
 */
function creerEnvironnement({ champs, trimestres, donneesLS = {}, donneesCache = {} }) {
    const ls = { ...donneesLS };
    const cache = new Map(Object.entries(donneesCache));
    const store = { trimestres: JSON.parse(JSON.stringify(trimestres)) };

    const fauxLocalStorage = {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
    const db = {
        memoryCache: cache,
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; }
    };
    const elements = {};
    for (const [id, value] of Object.entries(champs)) {
        elements[id] = { value };
    }
    const fauxDocument = {
        addEventListener: () => {},
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => []
    };
    const notifications = { erreur: vi.fn(), succes: vi.fn() };
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    db.removeSync = (k) => { delete store[k]; };
    const win = chargerScript('js/trimestre-v2-init.js', {
        db, localStorage: fauxLocalStorage, document: fauxDocument, notifications,
        cle: (k) => k, setValue: () => {}, genererIdUnique: (p) => p + 'X'
    }, { temoinEnregistrement: temoin, raisonPourTemoin: (r) => r, afficherStatistiquesTrimestreV2() {} });
    return { win, store, notifications, temoin };
}

const champs = (session, annee, nom = '') => ({
    'v2-nomTrimestre': nom,
    'v2-sessionTrimestre': session,
    'v2-anneeTrimestre': annee
});

describe('#379 — gardes sur le changement d\'id du trimestre actif', () => {
    it('BLOQUE le changement de session quand des données vivent sous l\'ancien préfixe (localStorage)', () => {
        const { win, store, temoin, notifications } = creerEnvironnement({
            champs: champs('automne', '2026'),
            trimestres: [{ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true }],
            donneesLS: { h2026_groupeEtudiants: [{ da: '111', nom: 'Untel' }] }
        });
        win.sauvegarderIdentificationTrimestreV2();
        expect(temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(temoin.nonEnregistre.mock.calls[0][1]).toMatch(/^(Identification du trimestre|Créer le trimestre)$/);
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(store.trimestres[0].id).toBe('h2026'); // registre INTACT
        expect(store.trimestreActif).toBeUndefined(); // miroir non basculé
    });

    it('BLOQUE aussi quand les données vivent en memoryCache SEULEMENT (leçon du 5 août)', () => {
        const { win, store, temoin, notifications } = creerEnvironnement({
            champs: champs('automne', '2026'),
            trimestres: [{ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true }],
            donneesCache: { h2026_evaluationsSauvegardees: [{ id: 'EV1' }] }
        });
        win.sauvegarderIdentificationTrimestreV2();
        expect(temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(temoin.nonEnregistre.mock.calls[0][1]).toMatch(/^(Identification du trimestre|Créer le trimestre)$/);
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(store.trimestres[0].id).toBe('h2026');
    });

    it('BLOQUE la collision : l\'id cible appartient déjà à un autre trimestre du registre', () => {
        const { win, store, temoin, notifications } = creerEnvironnement({
            champs: champs('automne', '2026'),
            trimestres: [
                { id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true },
                { id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: false }
            ]
        });
        win.sauvegarderIdentificationTrimestreV2();
        expect(temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(temoin.nonEnregistre.mock.calls[0][1]).toMatch(/^(Identification du trimestre|Créer le trimestre)$/);
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(store.trimestres[0].id).toBe('h2026');
        expect(store.trimestres).toHaveLength(2); // pas de doublon a2026
    });

    it('AUTORISE le changement d\'id quand l\'ancien préfixe ne porte AUCUNE donnée', () => {
        const { win, store, temoin, notifications } = creerEnvironnement({
            champs: champs('automne', '2026'),
            trimestres: [{ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true }]
        });
        win.sauvegarderIdentificationTrimestreV2();
        expect(temoin.nonEnregistre).not.toHaveBeenCalled();
        expect(store.trimestres[0].id).toBe('a2026');
        expect(store.trimestreActif).toBe('a2026');
    });

    it('AUTORISE un changement de nom seul (id inchangé) même avec des données', () => {
        const { win, store, temoin, notifications } = creerEnvironnement({
            champs: champs('hiver', '2026', 'Hiver 2026 — groupe pilote'),
            trimestres: [{ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true }],
            donneesLS: { h2026_groupeEtudiants: [{ da: '111' }] }
        });
        win.sauvegarderNomTrimestreV2();          // le nom : son propre écrivain
        win.sauvegarderIdentificationTrimestreV2(); // session/année inchangées : rien à écrire
        expect(temoin.nonEnregistre).not.toHaveBeenCalled();
        expect(store.trimestres[0].id).toBe('h2026');
        expect(store.trimestres[0].nom).toBe('Hiver 2026 — groupe pilote');
    });

    it('CRÉATION (aucun actif) : refuse de pousser un doublon d\'id dans le registre', () => {
        const { win, store, temoin, notifications } = creerEnvironnement({
            champs: champs('automne', '2026'),
            trimestres: [{ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: false }]
        });
        win.creerTrimestreV2();                     // lot E2 : la création a son bouton
        expect(temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(temoin.nonEnregistre.mock.calls[0][1]).toMatch(/^(Identification du trimestre|Créer le trimestre)$/);
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(store.trimestres).toHaveLength(1);
    });
});

describe('#379 volet B2 — création+activation recharge l\'identification affichée', () => {
    // RÉALIGNÉE #466/CT-05 (21 août 2026) : la création+activation ne fait plus
    // ses 4 recharges partielles — elle passe par le chemin COMPLET de bascule
    // (changerTrimestreActifV2), qui appelle les mêmes recharges parmi toutes
    // les autres. L'invariant de #379 (l'identification est rechargée) reste
    // exercé, à travers le chemin unique ; le harnais fournit désormais
    // changerTrimestreActif (succès) que le chemin complet exige.
    it('ouvrirModalNouveauTrimestre(activer) recharge l\'identification via le chemin complet de bascule', () => {
        const reponsesPrompt = ['A', '2027'];
        const win = chargerScript('js/trimestre-v2-liste.js', {
            db: { getSync: () => [], setSync: () => {} },
            prompt: () => reponsesPrompt.shift(),
            confirm: () => true,
            alert: () => {},
            nomSession: (s) => s,
            creerTrimestre: () => ({ id: 'a2027', nom: 'Automne 2027' }),
            obtenirTrimestres: () => [],
            cle: (k) => k
        });
        // #466 : le chemin complet exige window.changerTrimestreActif — le poser
        // sur win (les globals de chargerScript sont lexicaux, pas des propriétés window).
        win.changerTrimestreActif = () => true;
        win.chargerIdentificationTrimestreV2 = vi.fn();
        win.chargerCadreCalendrierV2 = vi.fn();
        win.chargerJourneesSansCoursV2 = vi.fn();
        win.afficherStatistiquesTrimestreV2 = vi.fn();
        win.chargerDropdownCoursV2 = vi.fn();    // appel non gardé du chemin complet

        win.ouvrirModalNouveauTrimestre();

        expect(win.chargerIdentificationTrimestreV2).toHaveBeenCalledTimes(1);
        expect(win.chargerCadreCalendrierV2).toHaveBeenCalledTimes(1);
    });
});
