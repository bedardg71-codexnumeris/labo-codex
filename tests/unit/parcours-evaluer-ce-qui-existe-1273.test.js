// =======================================================================
// #1273 — « ÉVALUER UNE PREMIÈRE PRODUCTION », « NOUS FAISONS » : UNE ÉTAPE DÉJÀ FAITE AVANCE
// =======================================================================
// Vécu par Grégoire sur l'iPad le 11 nov. 2026 : il avait créé sa grille juste avant de toucher « Commencer », et le
// parcours restait à l'étape de la grille. Elle ne comptait que les grilles absentes de l'instantané pris à « Commencer »
// (`grillesAvant`). Décision de Grégoire (27 nov. 2026, 14 h 41) : l'étape est faite dès qu'une grille EXISTE dans le
// trimestre, peu importe quand elle a été créée, et le parcours passe à la suivante. Même règle pour la pratique, la
// cartouche et la production.
// Ce banc juge le moteur du parcours hors du navigateur (aucune page : rien n'est ouvert, rien n'est visible) :
//   A. le lancement part de la première étape qui reste à faire, ce qui existait avant « Commencer » compris ;
//   B. ce qui ne compte pas : le matériel que l'application sème, ce que la démo marque, un gabarit de pratique, le
//      portfolio, la production d'un autre cours ;
//   C. ce que le parcours retient quand il y en a plusieurs ;
//   D. la reprise d'un parcours commencé avant ce changement : rien de son repère n'est réécrit ;
//   E. « Je regarde » (le modèle, dans la démo) garde son repère : ce que la démo contient déjà ne le fait pas avancer.
// Break-test (27 nov. 2026) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-27-parcours.md).

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

// Le matériel que l'application sème, lu dans main.js (la liste vivante, pas une copie).
const IDS_FOURNIS = (() => {
    const bloc = /window\.IDS_GABARITS_HARDCODES = \[([\s\S]*?)\];/.exec(lire('js/main.js'))[1];
    return [...bloc.replace(/\/\/.*$/gm, '').matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
})();

const T = 'a2026';
const COURS = 'C1';
const SOURCES = ['js/bibliotheque-ui.js', 'js/parcours-classe.js', 'js/parcours-evaluer.js'].map((f) => [f, lire(f)]);

/**
 * Le parcours, chargé sur un trimestre fictif. `d` : grilles, cartouches (par grille), productions, pratiques,
 * echelles, evaluations, la pratique appliquée au cours, l'état du parcours au panneau et son repère enregistré.
 */
function monter(d = {}) {
    const store = new Map();
    const copie = (v) => JSON.parse(JSON.stringify(v));
    const poser = (k, v) => { store.set(k, copie(v)); };
    const demo = !!d.demo;
    const pre = demo ? 'demo' : T;
    poser('groupeCoursActif', { id: d.groupeActif || 'GC1' });
    poser(pre + '_grillesTemplates', d.grilles || []);
    poser(pre + '_productions', d.productions || []);
    poser(pre + '_pratiquesConfigurables', d.pratiques || []);
    poser(pre + '_echellesTemplates', d.echelles || [{ id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)' }]);
    poser(pre + '_evaluationsSauvegardees', d.evaluations || []);
    Object.entries(d.cartouches || {}).forEach(([g, liste]) => poser(pre + '_cartouches_' + g, liste));
    Object.entries(d.brut || {}).forEach(([k, v]) => poser(k, v));
    const db = { getSync: (k, def) => (store.has(k) ? copie(store.get(k)) : def), setSync: poser };
    const cle = (n) => pre + '_' + n;
    const prefs = { parcoursEvaluer: copie(d.ctx || {}) };
    const ecrits = [];
    const defs = {};
    const lances = [];
    const moteur = { courante: null, sauts: [], visite: false };
    const fenetre = {
        innerWidth: 1180,
        IDS_GABARITS_HARDCODES: IDS_FOURNIS,
        designerPratiqueActive: () => ({ idBrut: d.appliquee || null }),
        Assistance: {
            enregistrer: (def) => { defs[def.id] = def; },
            etatDe: () => ({ etat: d.etat || 'a-faire' }),
            etatModeleDe: () => ({ etat: 'a-faire' }),
            definirEtat() {}, definirEtatModele() {}, ouvrirPanneau() {}, parcours: () => [], suivantDe: () => null
        },
        ParcoursMoteur: {
            visible: () => false, fermer() {}, actif: () => moteur.courante !== null,
            lancer: (def, o) => { lances.push({ def, o }); moteur.courante = o.depuis; },
            allerA: (i) => { moteur.sauts.push(i); moteur.courante = i; },
            etapeCourante: () => moteur.courante,
            enVisite: () => moteur.visite
        },
        addEventListener() {}
    };
    const page = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        body: { classList: { toggle() {} }, appendChild() {} }, addEventListener() {}
    };
    const globaux = {
        db, cle,
        obtenirPreference: (k) => copie(prefs[k]),
        definirPreference: (k, v) => { ecrits.push(k); prefs[k] = copie(v); },
        estEnModeDemo: () => demo,
        obtenirEtudiantsCoursActif: () => [{ da: '1000001', prenom: 'Loutre', nom: 'Enjouée' }],
        // Comme modes.js : les productions du cours actif (et celles sans cours, l'ancien format).
        obtenirDonneesSelonMode: (n) => (db.getSync(cle(n), []) || []).filter((x) => !x.coursId || x.coursId === COURS)
    };
    const noms = Object.keys(globaux);
    for (const [, src] of SOURCES) new Function('window', 'document', ...noms, src)(fenetre, page, ...noms.map((n) => globaux[n]));
    const P = fenetre.ParcoursEvaluer;
    return {
        P, def: defs.evaluer, lances, prefs, ecrits, store, fenetre, moteur,
        etapes: P.etapes(),
        ctx: () => P.contexte(),
        donnee: (k) => db.getSync(pre + '_' + k, null)
    };
}

// ---------- Le matériel fictif ----------

const PRATIQUE = { id: 'PRAT_1', nom: 'Ma pratique', dateCreation: '2026-11-01T10:00:00.000Z' };
const GRILLE = { id: 'GRILLE_1', nom: 'Ma grille', criteres: [], dateCreation: '2026-11-11T15:20:00.000Z' };
const CARTOUCHE = { id: 'CART_1', nom: 'Ma cartouche', grilleId: 'GRILLE_1', dateCreation: '2026-11-11T15:30:00.000Z' };
const PRODUCTION = { id: 'PROD_1', titre: 'Mon texte', coursId: COURS, grilleId: 'GRILLE_1', dateCreation: '2026-11-12T09:00:00.000Z' };
// Ce que l'application sème dans chaque trimestre (grilles.js, cartouches.js, echelles.js).
const GRILLE_DE_DEPART = { id: 'GRILLE_GENERIQUE', nom: 'Grille de départ', criteres: [] };
const CARTOUCHE_DE_DEPART = { id: 'CART_GENERIQUE', nom: 'Cartouche de départ', grilleId: 'GRILLE_GENERIQUE' };

// Les étapes de « Nous faisons », par leur rang (0 : la première bulle).
const E = { pratique: 1, application: 2, echelle: 3, grille: 4, cartouche: 5, production: 6, consignes: 7, evaluation: 8 };

describe('#1273 — A. « Commencer » part de la première étape qui reste à faire', () => {
    it('la grille créée juste avant « Commencer » fait l’étape « Ta grille » (le cas vécu le 11 nov.)', async () => {
        const m = monter({ grilles: [GRILLE_DE_DEPART, GRILLE], cartouches: { GRILLE_GENERIQUE: [CARTOUCHE_DE_DEPART] }, pratiques: [PRATIQUE], appliquee: PRATIQUE.id });
        await m.def.lancer();
        expect(m.lances).toHaveLength(1);
        // La pratique existe et s'applique au cours : le parcours s'ouvre sur l'échelle (une étape par choix).
        expect(m.lances[0].o.depuis, 'le parcours s’ouvre sur l’échelle').toBe(E.echelle);
        expect(m.etapes[E.grille].atteint(), 'la grille d’avant « Commencer » fait l’étape').toBe(true);
        expect(m.ctx().grilleId).toBe(GRILLE.id);
        expect(m.etapes[E.cartouche].atteint(), 'aucune cartouche à la personne : l’étape reste à faire').toBe(false);
    });

    it('tout ce qui existe déjà : le parcours s’ouvre sur la première étape qui manque (ici, les consignes)', async () => {
        const m = monter({
            grilles: [GRILLE], cartouches: { GRILLE_1: [CARTOUCHE] }, productions: [PRODUCTION], pratiques: [PRATIQUE],
            appliquee: PRATIQUE.id, ctx: { echellesAvant: ['ECHELLE_IDME_DEPART'], echelleId: 'ECHELLE_IDME_DEPART' }, etat: 'en-cours'
        });
        await m.def.lancer();
        expect(m.lances[0].o.depuis).toBe(E.consignes);
        expect(m.ctx().productionId, 'la production retenue est celle qui existe').toBe(PRODUCTION.id);
    });

    it('une production trouvée au lancement : sa fiche s’ouvre aussitôt (l’application ne la rouvre pas d’elle-même)', async () => {
        const m = monter({ grilles: [GRILLE], cartouches: { GRILLE_1: [CARTOUCHE] }, productions: [PRODUCTION], pratiques: [PRATIQUE], appliquee: PRATIQUE.id, ctx: { echellesAvant: [], echelleId: 'ECHELLE_IDME_DEPART' }, etat: 'en-cours' });
        await m.def.lancer();
        expect(m.lances[0].o.depuis).toBe(E.consignes);
        const ouvertes = [];
        m.fenetre.modifierProduction = async (id) => { ouvertes.push(id); };
        vi.useFakeTimers();
        try {
            const avant = m.etapes[E.consignes].avant();
            // L'onglet « Productions » attendu en vain (aucune page) : deux secondes ; puis, sans naissance, un tour.
            await vi.advanceTimersByTimeAsync(2400);
            expect(ouvertes, 'la fiche est demandée sans l’attente de trois secondes').toEqual([PRODUCTION.id]);
            await vi.advanceTimersByTimeAsync(3000);
            await avant;
        } finally { vi.useRealTimers(); }
    });

    it('la confirmation « C’est fait » ne se dit pas pour une étape trouvée faite au lancement', async () => {
        const m = monter({ grilles: [GRILLE], pratiques: [PRATIQUE], appliquee: PRATIQUE.id });
        await m.def.lancer();
        // La bulle 6 (la cartouche) confirme la grille seulement si elle a été faite pendant ce passage.
        expect(m.etapes[E.cartouche].confirme()).toBe('');
    });
});

describe('#1273 — A bis. l’étape faite, le parcours va droit à la première qui reste à faire', () => {
    const TOUT = () => ({
        grilles: [GRILLE], cartouches: { GRILLE_1: [CARTOUCHE] }, productions: [PRODUCTION], pratiques: [PRATIQUE], appliquee: PRATIQUE.id
    });
    const garder = (m) => m.etapes[E.echelle].boutons.find((b) => b.libelle === 'Je garde celle-ci').action();

    it('l’échelle gardée pendant le passage, la suite existe : droit aux consignes, sans ouvrir les étapes d’entre les deux', async () => {
        const m = monter(TOUT());
        await m.def.lancer();
        expect(m.moteur.courante).toBe(E.echelle);
        expect(m.etapes[E.echelle].atteint(), 'l’échelle n’est pas encore choisie').toBe(false);
        garder(m);
        expect(m.etapes[E.echelle].atteint(), 'le saut se fait par le parcours, pas par le moteur').toBe(false);
        expect(m.moteur.sauts).toEqual([E.consignes]);
    });

    it('l’étape suivante reste à faire : rien ne saute, le moteur passe à la suivante', async () => {
        const m = monter({ pratiques: [PRATIQUE], appliquee: PRATIQUE.id });
        await m.def.lancer();
        expect(m.etapes[E.echelle].atteint()).toBe(false);
        garder(m);
        expect(m.etapes[E.echelle].atteint()).toBe(true);
        expect(m.moteur.sauts).toEqual([]);
    });

    it('une étape revue en visite ne saute pas', async () => {
        const m = monter(TOUT());
        await m.def.lancer();
        expect(m.etapes[E.echelle].atteint()).toBe(false);
        garder(m);
        m.moteur.visite = true;   // revue par le compteur : le moteur ne fait rien avancer, la bulle offre « Continuer »
        expect(m.etapes[E.echelle].atteint()).toBe(true);
        expect(m.moteur.sauts).toEqual([]);
    });

    it('une étape trouvée faite à son ouverture (jamais vue à faire depuis) ne saute pas : le moteur décide', async () => {
        const m = monter(TOUT());
        await m.def.lancer();
        expect(m.etapes[E.echelle].atteint()).toBe(false);
        garder(m);
        m.lances[0].o.surEtape(E.echelle);   // le moteur y arrive de nouveau
        expect(m.etapes[E.echelle].atteint()).toBe(true);
        expect(m.moteur.sauts).toEqual([]);
    });
});

describe('#1273 — B. ce qui ne compte pas', () => {
    it('le matériel semé et la démo : la grille et la cartouche de départ, une grille marquée de la démo', async () => {
        const m = monter({
            grilles: [GRILLE_DE_DEPART, { id: 'G_DEMO', nom: 'Une grille du pack', isDemo: true }, { id: 'G_AUTEUR', nom: 'Une autre', auteur: 'Demo Labo Codex' }],
            cartouches: { GRILLE_GENERIQUE: [CARTOUCHE_DE_DEPART], G_DEMO: [{ id: 'K_DEMO', isDemo: true }] },
            pratiques: [PRATIQUE], appliquee: PRATIQUE.id
        });
        await m.def.lancer();
        expect(m.etapes[E.grille].atteint()).toBe(false);
        expect(m.etapes[E.cartouche].atteint()).toBe(false);
    });

    it('une cartouche de la personne sous la grille de départ compte (elle est à elle)', async () => {
        const m = monter({ grilles: [GRILLE_DE_DEPART], cartouches: { GRILLE_GENERIQUE: [CARTOUCHE_DE_DEPART, { id: 'CART_MOI', grilleId: 'GRILLE_GENERIQUE' }] } });
        await m.def.lancer();
        expect(m.etapes[E.cartouche].atteint()).toBe(true);
        expect(m.ctx().cartoucheId).toBe('CART_MOI');
    });

    it('un gabarit de pratique ne compte pas ; une pratique adoptée d’un modèle de l’assistant, si (hors de la démo)', async () => {
        const gabarit = monter({ pratiques: [{ id: 'GAB', estGabarit: true }] });
        await gabarit.def.lancer();
        expect(gabarit.lances[0].o.depuis).toBe(0);
        expect(gabarit.etapes[E.pratique].atteint()).toBe(false);
        const adoptee = monter({ pratiques: [{ id: 'COPIE', auteur: 'Demo Labo Codex' }] });
        await adoptee.def.lancer();
        expect(adoptee.etapes[E.pratique].atteint()).toBe(true);
    });

    it('la production : ni le portfolio (un contenant), ni celle d’un autre cours, ni celle de la démo', async () => {
        const m = monter({
            productions: [
                { id: 'PORT', type: 'portfolio', coursId: COURS },
                { id: 'AUTRE_COURS', titre: 'Ailleurs', coursId: 'C2' },
                { id: 'P_DEMO', titre: 'Du pack', coursId: COURS, isDemo: true }
            ]
        });
        await m.def.lancer();
        expect(m.etapes[E.production].atteint()).toBe(false);
    });

    it('l’échelle garde sa règle : celle de départ ne fait pas l’étape à elle seule (« Je garde celle-ci » la fait)', async () => {
        const m = monter({ pratiques: [PRATIQUE], appliquee: PRATIQUE.id });
        await m.def.lancer();
        expect(m.etapes[E.echelle].atteint()).toBe(false);
    });
});

describe('#1273 — C. ce que le parcours retient quand il y en a plusieurs', () => {
    it('la plus récente par sa date de création, pas la dernière de la liste', async () => {
        const recente = { id: 'GRILLE_2', nom: 'La neuve', dateCreation: '2026-11-20T08:00:00.000Z' };
        const m = monter({ grilles: [recente, GRILLE] });
        await m.def.lancer();
        expect(m.etapes[E.grille].atteint()).toBe(true);
        expect(m.ctx().grilleId).toBe('GRILLE_2');
    });

    it('sans date, la dernière de la liste (l’application ajoute à la fin)', async () => {
        const m = monter({ productions: [{ id: 'P_A', coursId: COURS }, { id: 'P_B', coursId: COURS }] });
        await m.def.lancer();
        expect(m.etapes[E.production].atteint()).toBe(true);
        expect(m.ctx().productionId).toBe('P_B');
    });

    it('ce qu’il retenait déjà, tant que cela existe encore', async () => {
        const m = monter({ productions: [{ id: 'P_A', coursId: COURS }, { id: 'P_B', coursId: COURS }], ctx: { echellesAvant: [], productionId: 'P_A' }, etat: 'en-cours' });
        await m.def.lancer();
        expect(m.etapes[E.production].atteint()).toBe(true);
        expect(m.ctx().productionId).toBe('P_A');
    });

    it('la pratique : celle qui s’applique au cours, même plus ancienne ; l’application d’une autre des siennes fait l’étape', async () => {
        const ancienne = { id: 'PRAT_0', dateCreation: '2026-09-01T10:00:00.000Z' };
        const m = monter({ pratiques: [ancienne, PRATIQUE], appliquee: 'PRAT_0' });
        await m.def.lancer();
        expect(m.etapes[E.application].atteint()).toBe(true);
        expect(m.ctx().pratiqueId).toBe('PRAT_0');
        const aucune = monter({ pratiques: [ancienne, PRATIQUE], appliquee: 'UNE_PRATIQUE_INTEGREE' });
        await aucune.def.lancer();
        expect(aucune.lances[0].o.depuis, 'aucune des siennes n’est appliquée : l’étape « L’appliquer à ton cours »').toBe(E.application);
        expect(aucune.ctx().pratiqueId, 'sinon, la plus récente').toBe(PRATIQUE.id);
    });
});

describe('#1273 — D. la reprise d’un parcours commencé avant ce changement', () => {
    it('le repère enregistré n’est pas réécrit ; l’étape où l’on reprend se lit dans ce qui existe', async () => {
        const repere = {
            echellesAvant: ['ECHELLE_IDME_DEPART'], grillesAvant: ['GRILLE_GENERIQUE', 'GRILLE_1'], productionsAvant: [],
            pratiquesAvant: ['PRAT_1'], cartouchesAvant: ['CART_GENERIQUE'], grilleId: null, productionId: null, pratiqueId: null,
            cartoucheId: null, echelleId: null, evaluationId: null, evaluationDA: null, voiePratique: null
        };
        const m = monter({ grilles: [GRILLE_DE_DEPART, GRILLE], cartouches: { GRILLE_GENERIQUE: [CARTOUCHE_DE_DEPART] }, pratiques: [PRATIQUE], appliquee: PRATIQUE.id, ctx: repere, etat: 'en-cours' });
        const donneesAvant = JSON.stringify([...m.store.entries()].filter(([k]) => k.startsWith(T + '_')));
        await m.def.lancer();
        // Laissé à la première bulle : la pratique et son application existent, l'échelle reste à choisir.
        expect(m.lances[0].o.depuis).toBe(E.echelle);
        const ctx = m.ctx();
        for (const k of ['echellesAvant', 'grillesAvant', 'productionsAvant', 'pratiquesAvant', 'cartouchesAvant']) expect(ctx[k], k).toEqual(repere[k]);
        expect(JSON.stringify([...m.store.entries()].filter(([k]) => k.startsWith(T + '_'))), 'aucune donnée n’est écrite').toBe(donneesAvant);
    });

    it('« Commencer » ne pose plus d’instantané des grilles, productions, pratiques et cartouches', async () => {
        const m = monter({ grilles: [GRILLE], pratiques: [PRATIQUE] });
        await m.def.lancer();
        const ctx = m.ctx();
        for (const k of ['grillesAvant', 'productionsAvant', 'pratiquesAvant', 'cartouchesAvant']) expect(ctx[k], k).toBeUndefined();
        expect(Array.isArray(ctx.echellesAvant), 'l’échelle garde le sien (et la reprise s’y reconnaît)').toBe(true);
    });
});

describe('#1273 — E. « Je regarde » garde son repère', () => {
    it('dans la démo, une pratique du pack et une grille déjà là ne font pas avancer le modèle', async () => {
        const m = monter({
            demo: true, groupeActif: 'GC2',
            brut: { demo_groupesCours: [{ id: 'GC2', coursId: 'CD' }], demo_groupeEtudiants: [{ da: '2000001', prenom: 'Tapir', nom: 'Doux' }] },
            pratiques: [{ id: 'demo-pratique-1' }], grilles: [{ id: 'G_PACK', nom: 'Une grille du pack' }],
            productions: [{ id: 'P_PACK', titre: 'Du pack', grilleId: 'G_PACK' }]
        });
        await m.def.lancerModele();
        expect(m.lances).toHaveLength(1);
        expect(m.lances[0].o.depuis, 'le modèle part de sa première étape').toBe(0);
        const etapesModele = m.lances[0].def.etapes;
        expect(etapesModele[4].atteint(), 'la grille du pack n’est pas celle du modèle').toBe(false);
        expect(m.ecrits, 'rien ne s’écrit dans les préférences').toEqual([]);
    });
});
