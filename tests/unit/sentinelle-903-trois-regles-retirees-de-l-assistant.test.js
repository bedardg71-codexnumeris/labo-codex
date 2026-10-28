import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #903 (21 sept. 2026) — TROIS RÈGLES QUE RIEN N'APPLIQUE ONT QUITTÉ L'ASSISTANT :
// plafonnement, remplacement, déclaratif des reprises (tranché par Grégoire le 17 sept.).
//
// ⛔ LIMITE DE GRÉGOIRE DU 20 SEPT. : « Je ne veux pas qu'on efface des données de façon
// irréversible. » On retire des CASES, pas des données. L'assistant RECONSTRUIT l'objet à
// la réédition : sans `conserverReglesRetirees`, rouvrir puis enregistrer effaçait les
// trois champs. Le stock ci-dessous est l'objet qu'écrivait l'ancien assistant, CAPTURÉ
// sur le code de `fe3e884e` (banc A1 de l'audit du 16 sept.), pas réécrit de mémoire.
//
// Le volet Comparateur est jugé dans `construction-attributs-326` ; la note qui ne bouge
// pas (verrou à 50, 87,43 sans verrou) dans `audit-pratiques-notation-config-2026-09-16`.

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');
const clone = (v) => JSON.parse(JSON.stringify(v));
/** JSON à clés triées : l'égalité de deux objets, sans dépendre de l'ordre d'écriture. */
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x))
    ? Object.keys(x).sort().reduce((o, c) => { o[c] = x[c]; return o; }, {}) : x);

const STOCK_SOM = {
    id: 'stock-som', nom: 'SOM banc', auteur: 'A B', etablissement: '', description: '', discipline: '',
    type: 'sommative', variante: 'progressive', pratiques: ['SOM'], dansBibliotheque: true,
    dateCreation: '2026-09-17T12:00:00.000Z',
    configuration: {
        afficherRang: true, afficherMoyenneGroupe: true,
        reglesSommatives: ['remplacement', 'double_verrou', 'plafonnement'],
        remplacement: { actif: true, nbPaires: 3 },
        conditions_speciales: [
            { type: 'double_verrou', condition: { evaluation: 'Dissertation', comparateur: '<', seuil: 90 }, consequence: { action: 'echec', note_max: 50 } },
            { type: 'plafonnement', description: 'Examen non remis', consequence: { action: 'plafonner', valeur: 50 } }
        ],
        reprises: { permises: true, mode: 'limite' }
    },
    calcul_note: { methode: 'moyenne_ponderee' },
    seuils: { type: 'pourcentage', va_bien: 80, difficulte: 70, grande_difficulte: 60 },
    nbEvaluationsPrevues: 8,
    reglesSpeciales: ['remplacement', 'double_verrou', 'plafonnement']
};
/** Une pratique qui ne porte QUE des règles retirées (variante « plafonnement » : sans remplacement). */
const STOCK_SOM_PLAFOND_SEUL = {
    id: 'stock-plaf', nom: 'SOM plafond', auteur: 'A B', etablissement: '', description: '', discipline: '',
    type: 'sommative', variante: 'plafonnement', pratiques: ['SOM'], dansBibliotheque: true,
    dateCreation: '2026-09-17T12:00:00.000Z',
    configuration: {
        afficherRang: false, afficherMoyenneGroupe: true, reglesSommatives: ['plafonnement'],
        conditions_speciales: [{ type: 'plafonnement', description: 'Examen non remis', consequence: { action: 'plafonner', valeur: 45 } }],
        reprises: { permises: false, mode: 'non' }
    },
    calcul_note: { methode: 'moyenne_ponderee' },
    reglesSpeciales: ['plafonnement']
};
const STOCK_STD = {
    id: 'stock-std', nom: 'STD banc', auteur: 'A B', etablissement: '', description: '', discipline: '',
    type: 'standards', variante: 'n-meilleurs', pratiques: ['STD'], dansBibliotheque: true,
    dateCreation: '2026-09-17T12:00:00.000Z',
    configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'ech1', grilleId: 'gr1', varianteCalcul: 'n-meilleurs',
        portfolio: { utiliser: true, nombreTotal: 12, nombreARetenir: 7, methodeSelection: 'meilleurs',
            minimumCompletion: 3, reprisesPermises: 'non', hybride: false } },
    calcul_note: { methode: 'conversion_niveaux' }
};

let store = [];
const db = {
    getSync: (k, def) => {
        if (k === 'pratiquesConfigurables') return store;
        if (k === 'modalitesEvaluation') return {};
        return def !== undefined ? def : null;
    },
    setSync: (k, v) => { if (k === 'pratiquesConfigurables') store = v; }
};
const globaux = {
    db, cle: (k) => k,
    notifications: { erreur: () => {}, succes: () => {} },
    normaliserIdPratique: (t) => t,
    genererIdUnique: () => 'id-genere',
    echapperHtml: (s) => String(s == null ? '' : s)
};
const win = chargerScript('js/pratiques/modalites-evaluation.js', globaux);
chargerScript('js/pratiques/construction-attributs.js', globaux, win);
chargerScript('js/wizard-pratique-v2.js', globaux, win);
for (const f of ['creerPratiqueV2', 'chargerPratiqueExistante', 'conserverReglesRetirees', 'deduireTypePratique'])
    if (typeof win[f] !== 'function') throw new Error('banc incomplet : ' + f);

/** Rouvre par l'assistant puis enregistre ; `retouche` modifie les réponses relues, comme le ferait l'écran. */
async function rouvrirEtEnregistrer(stock, retouche) {
    store = [clone(stock)];
    win.wizardState.reponses = {};
    win.chargerPratiqueExistante(stock.id);
    const reponses = win.wizardState.reponses;
    if (retouche) retouche(reponses);
    win.wizardState.pratiqueId = stock.id;
    win.wizardState.modeEdition = true;
    await win.creerPratiqueV2();
    expect(store).toHaveLength(1);
    return { reponses: clone(reponses), apres: clone(store[0]) };
}
async function creerNeuve(reponses) {
    store = [];
    win.wizardState.reponses = clone(reponses);
    win.wizardState.pratiqueId = 'neuve';
    win.wizardState.modeEdition = false;
    await win.creerPratiqueV2();
    return clone(store[0]);
}

const CHAMPS_RETIRES = ['nbPairesRemplacement', 'infoRemplacement', 'conditionPlafonnement', 'valeurPlafonnement',
    'infoPlafonnement', 'reprisesPermises', 'infoReprisesPedago'];

describe('#903 · A — les cases ont quitté l\'assistant', () => {
    it('A.1 « Utilises-tu des règles spéciales ? » : verrou, aucune — rien d\'autre (E2, 28 oct. 2026 : le portfolio sort aussi)', () => {
        const options = win.ETAPES_WIZARD['regles-sommative'].champs[0].options.map(o => o.value);
        expect(options).toEqual(['double_verrou', 'aucune']);
    });
    it('A.2 aucune étape n\'offre un des sept champs retirés, même si les clés retirées traînent dans les réponses', () => {
        const reponses = { reglesSommatives: ['remplacement', 'double_verrou', 'portfolio', 'plafonnement'] };
        let vus = 0;
        for (const etape of Object.values(win.ETAPES_WIZARD)) {
            const champs = (etape.champs || []).concat(etape.getChampsDynamiques ? etape.getChampsDynamiques(reponses) : []);
            vus += champs.length;
            expect(champs.map(c => c.id).filter(id => CHAMPS_RETIRES.includes(id))).toEqual([]);
        }
        expect(vus).toBeGreaterThan(20);           // le banc a bien parcouru des champs
        // Le verrou, lui, est toujours configuré.
        const ids = win.ETAPES_WIZARD['config-sommative-regles'].getChampsDynamiques(reponses).map(c => c.id);
        // #900 (lot N6) : « nombre d'artefacts » et « qualitatif » du portfolio sommatif sont retirés (aucun lecteur) ;
        // E2 (28 oct. 2026) : son texte d'information aussi (`infoPortfolio`), la règle n'ayant aucun calcul.
        expect(ids).toEqual(['infoVerrou', 'nomEvalVerrouillee', 'seuilVerrou', 'plafondVerrou']);
    });
    it('A.3 les phrases qui promettaient ces règles ne sont plus dans l\'assistant', () => {
        const src = lire('js/wizard-pratique-v2.js');
        expect(src.length).toBeGreaterThan(50000);
        for (const phrase of ['Remplacement automatique :', 'remplace la mi-session', 'Plafonnement : la note est plafonnée',
            'La note est plafonnée si certaines conditions', 'Avec remplacement progressif', 'Avec plafonnement conditionnel',
            'Reprises permises', 'Des reprises limitées favorisent']) {
            expect(src.includes(phrase), phrase).toBe(false);
        }
    });
    it('A.4 la classification ne rend plus « progressive » ni « plafonnement », et tait les clés retirées', () => {
        expect(win.deduireTypePratique({ calcNoteFinale: 'moyenne', reglesSommatives: ['remplacement', 'plafonnement'] }))
            .toEqual({ type: 'sommative', variante: 'classique', regles: [], confiance: 1.0 });
        expect(win.deduireTypePratique({ calcNoteFinale: 'moyenne', reglesSommatives: ['remplacement', 'double_verrou'] }))
            .toEqual({ type: 'sommative', variante: 'verrou', regles: ['double_verrou'], confiance: 1.0 });
    });
});

describe('#903 · B — une pratique NEUVE n\'écrit plus les trois règles', () => {
    it('B.1 Sommative : ni remplacement, ni plafonnement, ni reprises — même si les réponses traînent', async () => {
        const p = await creerNeuve({ nom: 'Neuve', calcNoteFinale: 'moyenne',
            reglesSommatives: ['remplacement', 'double_verrou', 'plafonnement'], nbPairesRemplacement: 3,
            nomEvalVerrouillee: 'Dissertation', seuilVerrou: 90, plafondVerrou: 50,
            conditionPlafonnement: 'Examen non remis', valeurPlafonnement: 50, reprisesPermises: 'limite' });
        expect(p.configuration.remplacement).toBeUndefined();
        expect(p.configuration.reprises).toBeUndefined();
        expect(p.configuration.conditions_speciales.map(c => c.type)).toEqual(['double_verrou']);
        expect(p.reglesSpeciales).toEqual(['double_verrou']);
        expect(p.configuration.reglesSommatives).toBeUndefined();   // #900 (lot N6) : doublon de reglesSpeciales, plus écrit
        expect(p.variante).toBe('verrou');
        expect(canon(p)).not.toMatch(/remplacement|plafonn|reprises/i);
    });
    it('B.2 Standards : le portfolio ne porte plus reprisesPermises', async () => {
        const p = await creerNeuve({ nom: 'Neuve STD', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts',
            nbArtefactsSoumis: 12, nbArtefactsRetenus: 7, minAvantCalculFormatif: 3, utiliserPortfolio: true,
            reprisesPermises: 'limite', echelleId: 'ech1', grilleId: 'gr1' });
        expect(p.configuration.portfolio.nombreARetenir).toBe(7);
        expect('reprisesPermises' in p.configuration.portfolio).toBe(false);
    });
});

describe('#903 · C — une pratique DÉJÀ enregistrée garde ce qu\'elle porte : le diff de réédition est vide', () => {
    it('C.1 SOM aux trois règles : rouverte puis enregistrée, l\'objet est le même — les trois champs compris', async () => {
        const { reponses, apres } = await rouvrirEtEnregistrer(STOCK_SOM);
        expect(canon(apres)).toBe(canon(STOCK_SOM));
        // … et les réponses relues ne portent plus rien des règles retirées (ni cases, ni récapitulatif).
        expect(reponses.reglesSommatives).toEqual(['double_verrou']);
        for (const id of CHAMPS_RETIRES) expect(reponses[id], id).toBeUndefined();
        expect(reponses).toMatchObject({ nomEvalVerrouillee: 'Dissertation', seuilVerrou: 90, plafondVerrou: 50 });
    });
    it('C.2 elle ne porte QUE du retiré, et l\'écran fait cocher « Aucune règle spéciale » : objet inchangé', async () => {
        const { reponses, apres } = await rouvrirEtEnregistrer(STOCK_SOM_PLAFOND_SEUL, (r) => {
            expect(r.reglesSommatives).toEqual([]);        // rien de pré-coché : l'étape exige un choix
            r.reglesSommatives = ['aucune'];
        });
        expect(reponses.reglesSommatives).toEqual(['aucune']);
        expect(canon(apres)).toBe(canon(STOCK_SOM_PLAFOND_SEUL));
    });
    it('C.3 Standards : portfolio.reprisesPermises survit à la réédition', async () => {
        const { reponses, apres } = await rouvrirEtEnregistrer(STOCK_STD);
        expect(reponses.reprisesPermises).toBeUndefined();
        expect(canon(apres)).toBe(canon(STOCK_STD));
    });
    it('C.4 une VRAIE retouche passe, et n\'emporte pas le reste : le verrou décoché s\'en va, les trois champs restent', async () => {
        // E2 (28 oct. 2026) : la retouche cochait « portfolio », retiré depuis ; elle décoche maintenant le verrou (« aucune »).
        const { apres } = await rouvrirEtEnregistrer(STOCK_SOM, (r) => { r.reglesSommatives = ['aucune']; });
        expect(apres.reglesSpeciales).toEqual(['remplacement', 'plafonnement']);
        expect(apres.configuration.reglesSommatives).toEqual(['remplacement', 'plafonnement']);
        expect(apres.configuration.conditions_speciales).toEqual([STOCK_SOM.configuration.conditions_speciales[1]]);
        expect(apres.configuration.remplacement).toEqual({ actif: true, nbPaires: 3 });
        expect(apres.configuration.reprises).toEqual({ permises: true, mode: 'limite' });
        // #900 (lot N6) : le portfolio d'une sommative n'est plus écrit (ses réglages n'avaient aucun lecteur) ; le stock
        // n'en portait pas, il n'en porte toujours pas. Rang et moyenne du groupe, sans lecteur, passent tels quels.
        expect(apres.configuration.portfolio).toBeUndefined();
        expect(apres.configuration.afficherRang).toBe(true);
        expect(apres.configuration.afficherMoyenneGroupe).toBe(true);
        expect(apres.variante).toBe('progressive');
    });
    it('C.5 le récapitulatif d\'une pratique rouverte n\'annonce aucune des règles retirées', async () => {
        store = [clone(STOCK_SOM)];
        win.wizardState.reponses = {};
        win.chargerPratiqueExistante(STOCK_SOM.id);
        const c = win.deduireTypePratique(win.wizardState.reponses);
        expect(c).toEqual({ type: 'sommative', variante: 'verrou', regles: ['double_verrou'], confiance: 1.0 });
    });
    it('C.6 une pratique sans rien de retiré n\'est pas touchée par la conservation', () => {
        const neuve = { type: 'sommative', variante: 'verrou', reglesSpeciales: ['double_verrou'], configuration: { reglesSommatives: ['double_verrou'] } };
        const avant = canon(neuve);
        win.conserverReglesRetirees(neuve, { type: 'sommative', variante: 'classique', reglesSpeciales: ['aucune'], configuration: { reglesSommatives: ['aucune'] } });
        expect(canon(neuve)).toBe(avant);
    });
    it('C.7 changée de famille, elle n\'emporte pas les champs d\'une sommative', () => {
        const devenueStd = { type: 'standards', configuration: { portfolio: { nombreARetenir: 5 } } };
        win.conserverReglesRetirees(devenueStd, STOCK_SOM);
        expect(canon(devenueStd)).toBe(canon({ type: 'standards', configuration: { portfolio: { nombreARetenir: 5 } } }));
    });
});

describe('#903 · D — verrou structurel', () => {
    const tranche = (src, debut, fin) => {
        const i = src.indexOf(debut);
        if (i < 0) throw new Error('repère absent : ' + debut);
        const j = src.indexOf(fin, i + debut.length);
        if (j < 0) throw new Error('repère absent : ' + fin);
        const t = src.slice(i, j);
        if (t.length < 50) throw new Error('tranche vide : ' + debut);
        return t;
    };
    it('D.1 sauvegarderPratique conserve AVANT de remplacer l\'objet enregistré', () => {
        const t = tranche(lire('js/wizard-pratique-v2.js'), 'async function sauvegarderPratique(', 'pratiques[index] = pratique;');
        expect(t).toMatch(/conserverReglesRetirees\(pratique, existante\);/);
    });
    it('D.2 les anciennes « Nouvelles » gardent leurs mots : on ne réécrit pas l\'histoire', () => {
        expect(lire('js/changelog-data.js')).toMatch(/remplacement/i);
    });
});
