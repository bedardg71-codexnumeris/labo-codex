/**
 * SENTINELLE (29 oct. 2026) — LES JETONS PAR DÉFAUT : L'ÉCRAN DIT CE QUE FAIT L'APPLICATION.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-29-jetons-par-defaut.md. Décision de Grégoire (29 oct., 7 h 51) : une
 * pratique neuve n'offre les jetons que si l'enseignant·e coche « Activer le système de jetons » ; une pratique existante
 * sans réglage garde ce qu'elle fait (les jetons offerts) et sa case s'affiche cochée. Décision de Cowork : un « non »
 * explicite est respecté.
 *
 * ↻ RÉÉCRITE LE 28 NOV. 2026 — SANS DÉCLARATION, PAS DE JETONS, POUR LES ANCIENNES PRATIQUES AUSSI (décision de Grégoire,
 * 8 h 42, relayée par Cowork à 8 h 45 et 9 h 05). Il étend aux pratiques d'avant le 29 oct. la règle qu'il a posée pour
 * l'élève (D5, 24 sept.) et pour toute pratique neuve (29 oct.) : une pratique qui ne porte aucun réglage de jetons n'en
 * offre pas, nulle part. Sa fiche s'affiche DÉCOCHÉE ; l'enregistrer sans toucher aux jetons n'écrit aucun bloc ; le
 * moteur ne lui prête plus le défaut (2 / 2 / 2). Changement de comportement, pas une réécriture : aucune pratique n'est
 * modifiée, et les jetons déjà accordés restent comptés, affichés et retirables. Les essais A(a), B(a), C(e) et le
 * dernier de D disent la règle neuve ; les autres n'ont pas bougé.
 *
 * VERROUILLÉ ICI :
 *   A. Le moteur (`_normaliserConfigJetons`, js/evaluation-jetons.js) : `actif: false` ou `activer: false` explicite donne
 *      des jetons inactifs, quelle que soit la forme (plate, imbriquée, le seul drapeau). Sans réglage : le défaut, actif.
 *   B. Le formulaire de la pratique (`remplirFormulairePratique`, js/pratiques-gestion.js) affiche ce que le moteur résout.
 *   C. Une copie dont la reprise est appliquée garde sa note quand sa pratique devient inactive.
 *   D. Une pratique neuve porte un choix explicite (voir la section D).
 *
 * Données fictives. BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JETONS_DECLARES, pratiqueQuiDeclareSesJetons, ANCIEN_REGLAGE_DU_TRIMESTRE } from './_helpers/jetons-declares.js';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, fauxDocument, dbBanc, echapperHtml, elementDom, monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const clone = (x) => JSON.parse(JSON.stringify(x));

/** Le moteur des jetons (réel), avec UNE pratique active. */
function moteur(pratique) {
    const store = { pratiquesConfigurables: pratique ? [Object.assign(clone(pratique), { id: 'PR' })] : [], evaluationsSauvegardees: [] };
    return chargerScript('js/evaluation-jetons.js', {
        db: { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: () => {}, get: async () => null, set: async () => {} },
        cle: (k) => k,
        obtenirIdPratiqueActive: () => (pratique ? 'PR' : null),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} }
    });
}
const actif = (pratique) => moteur(pratique).obtenirConfigJetons().actif;

/* La classe Spécifications (pratique-pan-specifications.js, `configurerPratique`) étale la configuration reçue sur son
   défaut `{ actif: true, delai, reprise }` : c'est ce bloc-là qui arrive au moteur par ce chemin. */
function blocDeLaClasseSpecifications(configuration) {
    const win = chargerScript('js/pratiques/pratique-pan-specifications.js', {});
    const instance = new win.PratiquePanSpecifications();
    instance.configurerPratique(configuration);
    return instance.config.jetons;
}

/* ================================================================ A. LE MOTEUR */
describe('A · le moteur respecte un « non » explicite', () => {
    it('(a) une pratique sans aucun réglage de jetons : AUCUN jeton (↻ 28 nov. 2026 ; du 29 oct. au 28 nov. : le défaut, actif)', () => {
        const w = moteur({ type: 'sommative' });
        expect(w.verifierDisponibiliteJeton('1111111', 'reprise')).toBe(false);
        expect(w.verifierDisponibiliteJeton('1111111', 'delai')).toBe(false);
        expect(w.jetonsDeclares()).toBeNull();
        // Les valeurs restent celles du défaut (ce que la fiche pré-remplit) ; seuls les jetons sont éteints.
        expect(w.obtenirConfigJetons()).toEqual({
            actif: false, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
            repriseCiblee: { actif: true, nombre: 2, plafondNote: null }
        });
    });

    it('(b) l\'assistant « non » (`configuration.jetons = { activer: false }`) : inactifs (avant : le défaut, actifs)', () => {
        const c = moteur({ type: 'specifications', configuration: { jetons: { activer: false } } }).obtenirConfigJetons();
        expect(c.actif).toBe(false);
        expect(c.delai).toEqual({ nombre: 2, dureeJours: 2 });   // les valeurs du défaut, que le formulaire affiche
    });

    it('(c) une Spécifications « non » par le chemin de la classe (`{ actif: true, …, activer: false }`) : inactifs (avant : actifs)', () => {
        const bloc = blocDeLaClasseSpecifications({ jetons: { activer: false } });
        expect(bloc).toMatchObject({ actif: true, activer: false });   // la forme que la classe produit, mesurée
        expect(actif({ type: 'specifications', config: { jetons: bloc } })).toBe(false);
        expect(actif({ type: 'specifications', configuration: { jetons: bloc } })).toBe(false);
    });

    it('le seul drapeau, sous chaque emplacement et chaque nom : inactifs', () => {
        for (const bloc of [{ actif: false }, { activer: false }]) {
            expect(actif({ jetons: bloc }), 'plat ' + JSON.stringify(bloc)).toBe(false);
            expect(actif({ config: { jetons: bloc } }), 'config ' + JSON.stringify(bloc)).toBe(false);
            expect(actif({ configuration: { jetons: bloc } }), 'configuration ' + JSON.stringify(bloc)).toBe(false);
        }
    });

    it('un « oui » reste un oui ; un bloc plat sans `actif` reste actif (inchangé)', () => {
        expect(actif({ configuration: { jetons: { activer: true, delai: { nombre: 3, dureeJours: 3 }, reprise: { nombre: 2 } } } })).toBe(true);
        expect(actif({ jetons: { nombre: 2, delaiDuree: 2 } })).toBe(true);
        expect(actif({ jetons: { actif: false, nombre: 2, delaiDuree: 2 } })).toBe(false);
        expect(actif({ jetons: { activer: false, nombre: 2, delaiDuree: 2 } })).toBe(false);
    });

    it('les gestes de l\'enseignant·e suivent : plus de jeton disponible ; la synthèse de l\'élève ne déclare aucun jeton', () => {
        const w = moteur({ configuration: { jetons: { activer: false } } });
        expect(w.verifierDisponibiliteJeton('1111111', 'reprise')).toBe(false);
        expect(w.verifierDisponibiliteJeton('1111111', 'delai')).toBe(false);
        expect(w.jetonsDeclares()).toBeNull();
    });
});

/* ================================================================ B. LE FORMULAIRE */
/** Le formulaire RÉEL sur un faux document (le banc de #853), le moteur RÉEL dans la même fenêtre. */
function formulaire(pratique) {
    const store = { test_pratiquesConfigurables: [Object.assign({ id: 'PR', nom: 'Pratique banc', type: 'sommative' }, clone(pratique))] };
    const note = elementDom({ id: 'mat-jetons-regles-ailleurs' });
    note.classList.add('u-hide');
    const elements = { 'mat-jetons-regles-ailleurs': note };
    const radios = ['archiver', 'supprimer'].map(v => elementDom({ value: v, name: 'mat-reprise-originale' }));
    const document = fauxDocument(elements, {
        'input[name="mat-reprise-originale"][value="archiver"]': radios[0], 'input[name="mat-reprise-originale"][value="supprimer"]': radios[1]
    });
    const win = { addEventListener() {}, removeEventListener() {} };
    const globaux = {
        document, db: dbBanc(store, []), cle: (k) => 'test_' + k, echapperHtml,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        setTimeout: (f) => { f(); return 0; }, clearTimeout() {},
        toggleDisplay: (el, visible) => { if (el) el.style.display = visible ? '' : 'none'; }
    };
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);
    chargerScript('js/evaluation-jetons.js', Object.assign({ obtenirIdPratiqueActive: () => null }, globaux), win);
    chargerAvecInterne('js/pratiques-gestion.js', globaux, win, ['appliquerFormulaireDansCollection']);
    return { win, store, elements, radios, interne: win.__audit['pratiques-gestion.js'] };
}
/** La famille déduite d'une pratique, par le VRAI registre et le vrai lecteur des jetons de la fenêtre du banc. */
function familleDe(f, pratique) {
    const reg = chargerScript('js/pratiques/pratique-registre.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, cle: (k) => k },
        { configJetonsDeclareeDeLaPratique: f.win.configJetonsDeclareeDeLaPratique });
    return reg.familleDeduiteDeLaPratique(pratique);
}
const lu = (f) => ({
    actif: f.elements['mat-jetons-actif'].checked, nombre: f.elements['mat-jetons-nombre'].value, duree: f.elements['mat-delai-duree'].value,
    ciblee: f.elements['mat-jeton-ciblee-actif'].checked, archiver: f.radios[0].checked
});

describe('B · le formulaire affiche ce que le moteur résout', () => {
    // ↻ 28 nov. 2026 (décision de Grégoire, 8 h 42). Du 29 oct. au 28 nov. : la case s'affichait COCHÉE, et le premier
    // enregistrement d'un champ voisin écrivait un bloc de jetons actifs (la pratique passait hybride sans qu'on l'ait voulu).
    it('(a) une pratique sans réglage : la case s\'affiche DÉCOCHÉE, avec les valeurs du défaut pré-remplies', async () => {
        const f = formulaire({});
        await f.win.chargerPratiquePourModif('PR');
        expect(lu(f)).toEqual({ actif: false, nombre: 2, duree: 2, ciblee: true, archiver: true });
    });

    it('(a2) l\'enregistrer SANS toucher aux jetons n\'écrit aucun bloc : son badge reste CUM, l\'élève ne reçoit rien de neuf', async () => {
        const f = formulaire({});
        await f.win.chargerPratiquePourModif('PR');
        f.elements['mat-pratique-nom'] = f.elements['mat-pratique-nom'] || elementDom({ id: 'mat-pratique-nom' });
        f.elements['mat-pratique-nom'].value = 'Un nom changé';   // un champ voisin
        const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
        expect('jetons' in ecrite[0]).toBe(false);
        expect(ecrite[0].configuration && ecrite[0].configuration.jetons).toBeFalsy();
        expect(f.win.configJetonsDeclareeDeLaPratique(ecrite[0])).toBeNull();
        expect(familleDe(f, ecrite[0])).toMatchObject({ sigle: 'CUM', motif: 'tout-compte' });
        expect(moteur(ecrite[0]).jetonsDeclares()).toBeNull();
        // Deux enregistrements de suite : toujours rien.
        expect('jetons' in f.interne.appliquerFormulaireDansCollection(clone(ecrite))[0]).toBe(false);
    });

    it('(a3) COCHER la case écrit le bloc : les jetons sont offerts, le badge passe HYB', async () => {
        const f = formulaire({});
        await f.win.chargerPratiquePourModif('PR');
        f.elements['mat-jetons-actif'].checked = true;
        const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
        expect(ecrite[0].jetons).toMatchObject({ actif: true, nombre: 2, delaiDuree: 2 });
        expect(moteur(ecrite[0]).obtenirConfigJetons().actif).toBe(true);
        expect(familleDe(f, ecrite[0])).toMatchObject({ sigle: 'HYB', motif: 'reprise' });
    });

    it('(a4) RÉGLER un champ des jetons sans cocher écrit aussi le bloc (un refus explicite, avec la valeur réglée)', async () => {
        const f = formulaire({});
        await f.win.chargerPratiquePourModif('PR');
        f.elements['mat-jetons-nombre'].value = 3;
        const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
        expect(ecrite[0].jetons).toMatchObject({ actif: false, nombre: 3 });
        expect(familleDe(f, ecrite[0]).sigle).toBe('CUM');
    });

    it('(a5) une pratique qui PORTE un bloc le voit récrit à chaque enregistrement, comme avant', async () => {
        const f = formulaire({ jetons: { actif: true, nombre: 3, delaiDuree: 4, repriseOriginale: 'archiver', cibleeActif: false } });
        await f.win.chargerPratiquePourModif('PR');
        const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
        expect(ecrite[0].jetons).toMatchObject({ actif: true, nombre: 3, delaiDuree: 4, cibleeActif: false });
    });

    it('(a6) la décision d\'écrire, seule : `blocJetonsAEcrireMat`', () => {
        const f = formulaire({});
        const bloc = { actif: false, nombre: 2 };
        const ecrire = f.win.blocJetonsAEcrireMat;
        expect(ecrire(undefined, bloc, JSON.stringify(bloc))).toBeUndefined();              // sans bloc, intouché : rien
        expect(ecrire(undefined, { actif: true, nombre: 2 }, JSON.stringify(bloc))).toEqual({ actif: true, nombre: 2 });   // sans bloc, touché
        expect(ecrire({ actif: false }, bloc, JSON.stringify(bloc))).toBe(bloc);            // un bloc porté : récrit
        expect(ecrire(undefined, bloc, null)).toBeUndefined();                             // aucune fiche ouverte : rien
    });

    it('une pratique « non » (bloc plat `actif: false`) : décochée', async () => {
        const f = formulaire({ jetons: { actif: false, nombre: 3, delaiDuree: 4, repriseOriginale: 'archiver', cibleeActif: true } });
        await f.win.chargerPratiquePourModif('PR');
        expect(lu(f)).toEqual({ actif: false, nombre: 3, duree: 4, ciblee: true, archiver: true });
    });

    it('un bloc plat sans « reprise ciblée » ni « l\'original » : l\'écran dit « non », comme le moteur (avant : « oui »)', async () => {
        const f = formulaire({ jetons: { actif: true, nombre: 2, delaiDuree: 2 } });
        await f.win.chargerPratiquePourModif('PR');
        expect(lu(f)).toMatchObject({ actif: true, ciblee: false, archiver: false });
    });

    it('réglés à la création (l\'assistant « non ») : la case décochée, le message, les champs désactivés', async () => {
        const f = formulaire({ configuration: { jetons: { activer: false } } });
        await f.win.chargerPratiquePourModif('PR');
        expect(lu(f).actif).toBe(false);
        expect(f.elements['mat-jetons-regles-ailleurs'].classList.contains('u-hide')).toBe(false);
        expect(f.elements['mat-jetons-actif'].disabled).toBe(true);
    });
});

/* ================================================================ C. LA NOTE */
describe('C · une reprise déjà appliquée garde sa note quand les jetons deviennent inactifs', () => {
    const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/entites/production-diagnostique.js', 'js/pratiques/pratique-configurable.js',
        'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js',
        'js/pratiques/pratique-pan-specifications.js', 'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js',
        { chemin: 'js/saisie-presences.js', internes: [] }, 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js',
        'js/snapshots.js', 'js/evaluation-jetons.js'];
    const DA = '2000001';
    const copie = (id, prod, note, extra) => Object.assign({ id, etudiantDA: DA, productionId: prod, noteFinale: note, niveauFinal: 'M', ponderationCouverte: 100,
        verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-10-20T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: [] }, extra || {});
    function noteSous(jetons) {
        const store = storeBase();
        store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA);
        store.test_groupesCours[0].pratiqueId = 'som-banc';
        store.test_pratiquesConfigurables = [Object.assign({ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' },
            dansBibliotheque: true, configuration: {} }, jetons)];
        store.test_productions = [{ id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, coursId: 'GC1' }, { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, coursId: 'GC1' }];
        // L'originale (60) remplacée par sa reprise (90), appliquée quand les jetons étaient offerts.
        store.test_evaluationsSauvegardees = [copie('O1', 'P1', 60, { remplaceeParId: 'R1' }), copie('R1', 'P1', 90, { repriseDeId: 'O1', jetonRepriseApplique: true }), copie('E2', 'P2', 80)];
        store.test_jugementsDenotation = {};
        let win = null;
        const classe = (nom) => function (config) { return new win[nom](config); };
        const b = monter(store, { modules: MODULES, objetsExportes: ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', 'ProductionDiagnostique'],
            aujourdhui: '2026-10-29', journal: [], globaux: {
                PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
                PratiquePanSpecifications: classe('PratiquePanSpecifications'), obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
                obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false } });
        win = b.win;
        const sim = win.simulerIndices(DA, 'som-banc');
        return { P: sim.P, actif: win.obtenirConfigJetons().actif };
    }

    it('(e) sommative, reprise à 90 sur une originale à 60 : P = (90 × 40 + 80 × 60) / 100 = 84, jetons offerts ou refusés', () => {
        // ↻ 28 nov. 2026 : une pratique SANS réglage n'offre plus de jetons (`actif: false`) ; sa reprise déjà accordée
        // garde sa note, 84, au point près. C'est la mesure du point 1 de l'amendement de 8 h 45.
        expect(noteSous({})).toEqual({ P: 84, actif: false });
        expect(noteSous({ jetons: { actif: true, nombre: 2, delaiDuree: 2 } })).toEqual({ P: 84, actif: true });
        expect(noteSous({ jetons: { actif: false } })).toEqual({ P: 84, actif: false });
        expect(noteSous({ configuration: { jetons: { activer: false } } })).toEqual({ P: 84, actif: false });
    });
});

/* ================================================================ A bis. LA DÉCLARATION QUE LA DÉMO PORTERA (28 nov. 2026) */
describe('A bis · la déclaration que le pack de la démo portera rend exactement l\'ancien défaut', () => {
    const ANCIEN_DEFAUT = { actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
        repriseCiblee: { actif: true, nombre: 2, plafondNote: null } };
    it('posée à la racine d\'une pratique, pour les trois types de la démo : actifs, 2 délais de 2 jours, 2 reprises, reprise ciblée active', () => {
        for (const type of ['standards', 'specifications', 'cibles']) {
            const w = moteur(pratiqueQuiDeclareSesJetons('PR', { type }));
            expect(JSON.parse(JSON.stringify(w.obtenirConfigJetons())), type).toEqual(ANCIEN_DEFAUT);
            expect(w.jetonsDeclares(), type).not.toBeNull();
            expect(w.verifierDisponibiliteJeton('1111111', 'reprise'), type).toBe(true);
        }
        expect(JSON.parse(JSON.stringify(JETONS_DECLARES))).toEqual(ANCIEN_DEFAUT);
    });
    it('l\'ancien réglage explicite du trimestre est une déclaration : il vaut pour une pratique sans réglage, et sans pratique du tout', () => {
        const monte = (pratiques, actif) => chargerScript('js/evaluation-jetons.js', {
            db: { getSync: (k, d) => (k === 'pratiquesConfigurables' ? pratiques : (k === 'modalitesEvaluation' ? { configurationJetons: clone(ANCIEN_REGLAGE_DU_TRIMESTRE) }
                : (k === 'evaluationsSauvegardees' ? [] : (d !== undefined ? d : null)))), setSync: () => {} },
            cle: (k) => k, obtenirIdPratiqueActive: () => actif, obtenirDonneesSelonMode: () => []
        });
        for (const w of [monte([{ id: 'PR', type: 'sommative' }], 'PR'), monte([], null)]) {
            expect(w.obtenirConfigJetons()).toMatchObject({ actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2 } });
            expect(w.verifierDisponibiliteJeton('1111111', 'reprise')).toBe(true);
        }
    });
});

/* ================================================================ C bis. LES JETONS DÉJÀ ACCORDÉS (28 nov. 2026) */
describe('C bis · dans une pratique sans réglage, un jeton déjà accordé reste compté et retirable', () => {
    const DA = '2000001';
    function moteurAvec(evaluations) {
        const store = { pratiquesConfigurables: [{ id: 'PR', type: 'sommative' }], evaluationsSauvegardees: clone(evaluations) };
        const notifs = [];
        const win = chargerScript('js/evaluation-jetons.js', {
            db: { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k, obtenirIdPratiqueActive: () => 'PR',
            obtenirDonneesSelonMode: (k) => store[k],
            sauvegarderDonneesSelonMode: (k, v) => { store[k] = v; return true; },
            notifications: { succes: (t) => notifs.push('succes:' + t), erreur: (t) => notifs.push('erreur:' + t), info() {}, avertissement() {} },
            confirm: () => true
        });
        return { win, store, notifs };
    }
    const ORIGINALE = { id: 'O1', etudiantDA: DA, productionId: 'P1', noteFinale: 60, remplaceeParId: 'R1', archivee: true };
    const REPRISE = { id: 'R1', etudiantDA: DA, productionId: 'P1', noteFinale: 90, repriseDeId: 'O1', jetonRepriseApplique: true };
    const AVEC_DELAI = { id: 'E2', etudiantDA: DA, productionId: 'P2', noteFinale: 80, jetonDelaiApplique: true, delaiAccorde: true, dureeDelaiJours: 2 };

    it('la pratique n\'offre plus de jetons, mais la reprise et le délai accordés restent COMPTÉS', () => {
        const b = moteurAvec([ORIGINALE, REPRISE, AVEC_DELAI]);
        expect(b.win.obtenirConfigJetons().actif).toBe(false);
        expect(b.win.compterJetonsUtilises(DA, 'reprise')).toBe(1);
        expect(b.win.compterJetonsUtilises(DA, 'delai')).toBe(1);
        const statut = b.win.obtenirStatutJetonsEtudiant(DA);
        expect(statut.reprise).toMatchObject({ utilises: 1, total: 2 });
        expect(statut.delai).toMatchObject({ utilises: 1, total: 2 });
        // Et rien de NEUF ne s'accorde.
        expect(b.win.verifierDisponibiliteJeton(DA, 'reprise')).toBe(false);
        expect(b.win.verifierDisponibiliteJeton(DA, 'delai')).toBe(false);
    });
    it('ils restent RETIRABLES : le délai se retire, la reprise aussi (l\'originale revient)', async () => {
        const b = moteurAvec([ORIGINALE, REPRISE, AVEC_DELAI]);
        expect(b.win.retirerJetonDelai('E2')).toBe(true);
        expect(b.store.evaluationsSauvegardees.find(e => e.id === 'E2').jetonDelaiApplique).toBeUndefined();
        expect(await b.win.retirerJetonReprise('R1')).toBe(true);
        const originale = b.store.evaluationsSauvegardees.find(e => e.id === 'O1');
        expect(originale.remplaceeParId).toBeUndefined();
        expect(b.win.compterJetonsUtilises(DA, 'reprise')).toBe(0);
    });
    it('les écrans qui les montrent et les retirent ne lisent pas la configuration des jetons', () => {
        const source = readFileSync(path.join(RACINE, 'js/evaluation-sauvegarde.js'), 'utf8');
        const debut = source.indexOf('function afficherBadgesJetons() {');
        const fin = source.indexOf('\nfunction ', debut + 10);
        expect(debut).toBeGreaterThan(-1);
        const badges = source.slice(debut, fin);
        expect(badges).toContain('data-action="retirerJetonDepuisSidebar"');
        expect(badges).not.toMatch(/obtenirConfigJetons|verifierDisponibiliteJeton|jetonsDeclares/);
    });
});

/* ================================================================ D. UNE PRATIQUE NEUVE PORTE UN CHOIX EXPLICITE */
/** L'assistant RÉEL (le harnais du golden master #319) : réponses posées, `creerPratiqueV2()`, pratique relue. */
function assistant() {
    let store = [];
    const db = {
        getSync: (k, d) => (k === 'pratiquesConfigurables' ? store : (k === 'modalitesEvaluation' ? {} : (d !== undefined ? d : null))),
        setSync: (k, v) => { if (k === 'pratiquesConfigurables') store = v; }
    };
    const globaux = { db, cle: (k) => k, notifications: { erreur() {}, succes() {} }, normaliserIdPratique: (t) => t, genererIdUnique: () => 'id-genere',
        echapperHtml, demanderEchelleAdoption: async () => ({ adopter: true, echelleId: 'ech1' }), poserEchelleAdoption: (p) => p };
    const win = chargerScript('js/pratiques/modalites-evaluation.js', globaux);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    return {
        win,
        async creer(reponses, { modeEdition = false, existantes = [] } = {}) {
            store = clone(existantes);
            win.wizardState.reponses = clone(reponses);
            win.wizardState.pratiqueId = 'PR';
            win.wizardState.modeEdition = modeEdition;
            await win.creerPratiqueV2();
            return store.find(p => p.id === 'PR');
        }
    };
}
const REPONSES = {
    SOM: { calcNoteFinale: 'moyenne', reglesSommatives: [], nom: 'SOM banc' },
    STD: { calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', modeSelectionPortfolio: 'n_meilleurs', nbArtefactsRetenus: 3,
        utiliserPortfolio: true, echelleId: 'ech1', grilleId: 'gr1', nom: 'STD banc' },
    DEN: { calcNoteFinale: 'jugement', typePratique: 'denotation', nom: 'DEN banc' },
    SPE_NON: { calcNoteFinale: 'acceptable', seuilAcceptabilite: 100, utiliserJetons: false, modeleBundle: 'standard', nom: 'SPE banc' },
    SPE_OUI: { calcNoteFinale: 'acceptable', seuilAcceptabilite: 100, utiliserJetons: true, nbJetonsDelai: 3, dureeDelaiJours: 3, nbJetonsReprise: 2,
        modeleBundle: 'standard', nom: 'SPE banc' }
};

describe('D · une pratique neuve n\'offre les jetons que si on les active', () => {
    it('(d) l\'assistant, Sommative, Standards, Dénotation (aucune question des jetons) : `jetons: { actif: false }`, inactifs (avant : rien, actifs)', async () => {
        const a = assistant();
        for (const cas of ['SOM', 'STD', 'DEN']) {
            const p = await a.creer(REPONSES[cas]);
            expect(p.jetons, cas).toEqual({ actif: false });
            expect(actif(p), cas).toBe(false);
        }
    });

    it('(d) le formulaire relit la pratique neuve décochée, ses champs ouverts ; cochée et enregistrée, les jetons sont offerts', async () => {
        const p = await assistant().creer(REPONSES.SOM);
        const f = formulaire(p);
        await f.win.chargerPratiquePourModif('PR');
        expect(lu(f).actif).toBe(false);
        expect(f.elements['mat-jetons-actif'].disabled).toBe(false);
        expect(f.elements['mat-jetons-regles-ailleurs'].classList.contains('u-hide')).toBe(true);
        f.elements['mat-jetons-actif'].checked = true;
        const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
        expect(actif(ecrite[0])).toBe(true);
    });

    it('l\'assistant, Spécifications : il écrit la réponse, et le moteur la respecte (« non » → inactifs ; « oui » → actifs)', async () => {
        const a = assistant();
        const non = await a.creer(REPONSES.SPE_NON);
        expect(non.configuration.jetons).toEqual({ activer: false });
        expect(non.jetons).toBeUndefined();   // le réglage existe : rien d'autre n'est posé
        expect(actif(non)).toBe(false);
        expect(actif(await a.creer(REPONSES.SPE_OUI))).toBe(true);
    });

    // ↻ 28 nov. 2026 : rien n'est toujours posé en modification ; mais sans réglage, la pratique n'offre plus de jetons.
    it('l\'assistant en MODIFICATION d\'une pratique sans réglage : rien n\'est posé, et elle n\'offre pas de jetons', async () => {
        const existante = { id: 'PR', nom: 'SOM banc', type: 'sommative', dansBibliotheque: true, calcul_note: { methode: 'moyenne_ponderee' }, configuration: {} };
        const p = await assistant().creer(REPONSES.SOM, { modeEdition: true, existantes: [existante] });
        expect(p.jetons).toBeUndefined();
        expect(actif(p)).toBe(false);
    });

    it('les cinq modèles fournis refusent les jetons ; une pratique installée d\'un modèle aussi (copie telle quelle)', async () => {
        const win = chargerScript('js/pratiques-bibliotheque.js', { db: { get: async () => [], getSync: () => [] }, cle: (k) => k });
        const ids = ['DEN-base', 'SPE-simple', 'SOM-litterature', 'STD-n-meilleurs', 'STD-n-recents'];
        for (const id of ids) {
            const installee = await win.obtenirConfigurationPratiqueParId(id);   // la source de « Utiliser dans ce trimestre » et de « Dupliquer… »
            expect(installee.jetons, id).toEqual({ actif: false });
            expect(actif(installee), id).toBe(false);
        }
    });
});

// JOURNAL DES BREAK-TESTS (29 oct. 2026) — copie de référence, mutation, lancement de ce fichier, restauration (sha256 identique) :
//   J1 evaluation-jetons.js — l'ancien `_normaliserConfigJetons` (actif lu avant activer ; le seul drapeau → null) → 11 rouges,
//      dont (b) et (c) ; (a), (d) en modification et les formulaires d'une pratique plate restent verts
//   J2 pratiques-gestion.js — l'ancienne lecture du formulaire (`pratique.jetons.actif || false`)                → 1 rouge, (a)
//   J3 wizard-pratique-v2.js — l'assistant ne pose plus le refus                                                → 2 rouges, (d)
//   J4 wizard-pratique-v2.js — le refus posé aussi en modification                                             → 1 rouge
//   J5 pratiques-bibliotheque.js — un modèle fourni sans refus                                                 → 1 rouge
//   Playwright (WebKit, jetons-par-defaut-29-oct.spec.js) : J1 → les deux essais rouges ; J2 → le formulaire rouge, Annoter vert.
