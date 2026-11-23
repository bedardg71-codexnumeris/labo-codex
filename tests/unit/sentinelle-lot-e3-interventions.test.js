/**
 * LOT E3 DE L'ENREGISTREMENT — LA FICHE D'UNE INTERVENTION OU D'UNE RENCONTRE (D3, D0 ; 28 sept. 2026)
 *
 * Une intervention existante s'enregistre toute seule, champ par champ, par l'écrivain unique de la fiche
 * (`sauvegarderPresencesIntervention`, qui écrit par `sauvegarderDonneesSelonMode` : le témoin commun parle).
 * Une nouvelle n'existe qu'au clic « Créer l'intervention » / « Créer la rencontre ». « Annuler » devient
 * « Fermer ».
 *
 * ⚠⚠ LE POINT DE LA CONSIGNE : modifier une intervention COMPLÉTÉE n'écrit aucune présence.
 *
 * ↻ 23 NOV. 2026 (décision de Grégoire, 22 nov., 20 h 51 ; plans de travail/CONSIGNE-2026-11-22-release-publication.md,
 * 1a) : LA CASE « Reporter les présences dans la saisie des présences… » EST RETIRÉE, avec la question de complétion qui
 * ne servait qu'à la porter et l'écrivain qu'elle déclenchait. Elle ne faisait pas ce qu'elle promettait (#1304). Passer
 * à « Complétée », ou créer une intervention déjà complétée, n'écrit plus AUCUNE présence, sans question. SOURCE TARIE,
 * STOCK GARDÉ : une présence facultative déjà écrite par l'ancienne case reste telle quelle (essai « le stock »).
 * Break-tests (23 nov. 2026), chacun rouge puis remis à l'identique : (1) un report remis dans l'écrivain
 * (`db.setSync(cle('presences'), …)` au passage à « Complétée ») → « aucune présence » et « le stock » rouges ; (2) la
 * question remise (`uiDialogues.confirmerAction` au passage) → « aucune question » rouge ; (3) `caseReport` remis dans
 * les mots → « rien ne reste de la case » rouge.
 *
 * Harnais : `bac-suivi.js` (modes.js RÉEL, store partagé). Noms fictifs.
 */
// ↻ #1152, retouche 2 du lot 5 (29 oct. 2026, plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md) : le champ « Séance concernée » (interventionSeance) est retiré.
import { describe, it, expect, vi } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const intervention = (extra) => Object.assign({ id: 'I1', titre: 'Rattrapage', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2,
    contexte: 'en-classe', description: '', etudiants: ['2000001'], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [],
    objectifVise: '', bilan: null, statut: 'en-cours', groupeCoursId: 'GC1' }, extra);

function banc({ interventions = [], vue = 'interventions', statut = 'en-cours', quitter = true, confirmer = true, coche = false, contexte = 'en-classe' } = {}) {
    const store = storeBase();
    store.test_interventions = interventions;
    store.test_presences = [{ da: '2000001', date: '2026-08-25', heures: 2, coursId: 'GC1' }];
    const champs = { interventionNiveau: elementDom({ value: '2' }), interventionContexte: elementDom({ value: contexte }),
        interventionTitre: elementDom({ value: 'Rattrapage' }), interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '' }),
        interventionDuree: elementDom({ value: '2' }), interventionDescription: elementDom({ value: '' }),
        observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) };
    const cocheAlice = elementDom({ value: '2000001', checked: true });
    const radioStatut = elementDom({ name: 'interventionStatut', value: statut, checked: true });
    const radioEnCours = elementDom({ name: 'interventionStatut', value: 'en-cours' });
    const selecteurs = {
        '#listeEtudiantsIntervention input[type="checkbox"]': [cocheAlice], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [cocheAlice],
        '#listeEtudiantsIntervention textarea': [],
        'input[name="interventionStatut"]:checked': radioStatut, 'input[name="interventionStatut"][value="en-cours"]': radioEnCours,
        '#criteresCiblesContainer .critere-cible-cb:checked': [],
        '[data-fiche-intervention="I1"]': elementDom()
    };
    const fiches = {}; const questions = []; const confirmations = []; const cases = [];
    const uiDialogues = {
        declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
        quitterCreationSiConfirme: vi.fn(async (g, titre) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(titre); return quitter; }),
        // (Jusqu'au 23 nov. 2026, le passage à « Complétée » posait ici une question à case ; plus aucune : ce faux garde la
        // trace d'un appel qui ne doit plus venir.)
        confirmerAction: vi.fn(async (o) => { confirmations.push(o.titre); cases.push(o.caseACocher); return confirmer ? { coche } : false; })
    };
    const b = monter(store, { modules: ['js/interventions.js'],
        globaux: { determinerNiveauRaiPedagogique: () => ({ niveau: 2 }), calculerTousLesIndices: () => ({ P: 80 }), calculerMoyennesCriteres: () => ({}),
            obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7 },
        elements: Object.assign({ conteneurPrincipal: elementDom(), conteneurRencontres: elementDom(), listeInterventions: elementDom(), listeRencontres: elementDom() }, champs),
        selecteurs });
    b.win.definirVocabulaireInterventions(vue);
    b.temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    b.win.temoinEnregistrement = b.temoin;
    b.winModes.temoinEnregistrement = b.temoin;   // `sauvegarderDonneesSelonMode` lit le témoin de SA fenêtre
    b.win.raisonPourTemoin = (r) => String(r);
    b.fiches = fiches; b.questions = questions; b.confirmations = confirmations; b.cases = cases; b.uiDialogues = uiDialogues;
    // ⚠ `b.selecteurs` est la table COPIÉE par le harnais : c'est elle que lit le document.
    b.radioStatut = radioStatut; b.radioEnCours = radioEnCours;
    b.champ = (id) => b.document.getElementById(id);
    b.conteneur = () => b.document.getElementById(vue === 'rencontres' ? 'conteneurRencontres' : 'conteneurPrincipal');
    b.ecritures = (k = 'test_interventions') => b.journal.filter(j => j.k === k).length;
    // Un changement dans la fiche : l'écouteur attend un tour (horloge virtuelle du banc).
    b.changer = async (champ) => { const p = b.win.surChangementFicheIntervention('I1', champ); b.avancer(1); return p; };
    return b;
}
// `ui-dialogues.js` n'est pas chargé par le banc : la question passe par `window.uiDialogues` (posé à la main).

describe('lot E3 · intervention existante — champ par champ, par le témoin', () => {
    it('un champ modifié s\'écrit tout seul, par le témoin, sans message ; la fiche reste ouverte', async () => {
        const b = banc({ interventions: [intervention()] });
        b.win.uiDialogues = b.uiDialogues;
        b.champ('interventionTitre').value = 'Rattrapage du lundi';
        expect(await b.changer(b.champ('interventionTitre'))).toBe(true);
        expect(b.store.test_interventions[0].titre).toBe('Rattrapage du lundi');
        expect(b.temoin.enregistre).toHaveBeenCalledWith('test_interventions');
        expect(b.notifs.filter(n => n.type === 'succes')).toEqual([]);
        expect(b.conteneur().innerHTML, 'pas de retour à la liste').not.toContain('listeInterventions');
    });

    it('LE POINT DE LA CONSIGNE : modifier une intervention COMPLÉTÉE n\'écrit aucune présence (empreinte avant / après)', async () => {
        const b = banc({ interventions: [intervention({ statut: 'completee' })], statut: 'completee' });
        b.win.uiDialogues = b.uiDialogues;
        const avant = JSON.stringify(b.store.test_presences);
        b.champ('interventionDate').value = '2026-09-02';
        await b.changer(b.champ('interventionDate'));
        b.champ('observationsIntervention').value = 'Bonne réception';
        await b.changer(b.champ('observationsIntervention'));
        expect(b.store.test_interventions[0]).toMatchObject({ date: '2026-09-02', observations: 'Bonne réception', statut: 'completee' });
        expect(JSON.stringify(b.store.test_presences)).toBe(avant);
        expect(b.ecritures('test_presences')).toBe(0);
        expect(b.confirmations).toEqual([]);
    });

    it('le passage à « Complétée » : aucune question, l\'intervention est complétée, AUCUNE présence écrite', async () => {
        const b = banc({ interventions: [intervention()], statut: 'completee' });
        b.win.uiDialogues = b.uiDialogues;
        const avant = JSON.stringify(b.store.test_presences);
        expect(await b.changer(b.radioStatut)).toBe(true);
        expect(b.confirmations, 'aucune question').toEqual([]);
        expect(b.store.test_interventions[0].statut).toBe('completee');
        expect(JSON.stringify(b.store.test_presences)).toBe(avant);
        expect(b.ecritures('test_presences')).toBe(0);
    });

    it('rattrapage : ni présence ni absence motivée écrite ; un MIO : rien non plus', async () => {
        const b = banc({ interventions: [intervention({ contexte: 'rattrapage', marquerNonParticipantsMotives: true })], statut: 'completee', contexte: 'rattrapage' });
        b.win.uiDialogues = b.uiDialogues;
        expect(await b.changer(b.radioStatut)).toBe(true);
        expect(b.store.test_interventions[0].statut).toBe('completee');
        expect(b.ecritures('test_presences')).toBe(0);
        expect(b.confirmations).toEqual([]);

        const c = banc({ interventions: [intervention({ type: 'mio', contexte: 'mio' })], statut: 'completee', contexte: 'mio' });
        c.win.uiDialogues = c.uiDialogues;
        expect(await c.changer(c.radioStatut)).toBe(true);
        expect(c.confirmations).toEqual([]);
        expect(c.ecritures('test_presences')).toBe(0);
    });

    it('LE STOCK : une présence facultative déjà écrite par l\'ancienne case reste telle quelle', async () => {
        const b = banc({ interventions: [intervention()], statut: 'completee' });
        b.win.uiDialogues = b.uiDialogues;
        const ancienne = { date: '2026-09-01', da: '2000001', heures: 2, notes: 'Intervention RàI : Rattrapage', coursId: 'GC1', facultatif: true };
        b.store.test_presences.push(ancienne);
        const avant = JSON.stringify(b.store.test_presences);
        expect(await b.changer(b.radioStatut)).toBe(true);
        b.champ('interventionDate').value = '2026-09-03';
        await b.changer(b.champ('interventionDate'));
        expect(JSON.stringify(b.store.test_presences), 'ni réécrite, ni retirée, ni doublée').toBe(avant);
        expect(b.ecritures('test_presences')).toBe(0);
    });

    it('rien ne reste de la case : ni ses mots, ni la question, ni l\'écrivain des présences', () => {
        const interventions = readFileSync(path.join(RACINE, 'js/interventions.js'), 'utf8');
        const presences = readFileSync(path.join(RACINE, 'js/saisie-presences.js'), 'utf8');
        for (const parti of ['caseReport', 'completerTitre', '_demanderReport', 'caseACocher', 'function transfererPresencesVersModule', 'window.transfererPresencesVersModule']) {
            expect(interventions, parti).not.toContain(parti);
        }
        expect(interventions).not.toMatch(/cle\('presences'\)/);
        expect(presences).not.toContain('window.ajouterPresencesIntervention');
        const b = banc({ interventions: [intervention()] });
        expect(typeof b.win.transfererPresencesVersModule).toBe('undefined');
    });

    it('une fiche fermée n\'écrit plus rien', async () => {
        const b = banc({ interventions: [intervention()] });
        delete b.selecteurs['[data-fiche-intervention="I1"]'];
        b.champ('interventionTitre').value = 'Autre';
        expect(await b.changer(b.champ('interventionTitre'))).toBe(false);
        expect(b.ecritures()).toBe(0);
    });
});

describe('lot E3 · nouvelle intervention — rien avant « Créer l\'intervention »', () => {
    const ouvrirBrouillon = (b) => {
        b.win.afficherFormulaireIntervention();
        const id = (b.conteneur().innerHTML.match(/data-action="sauvegarderPresencesIntervention" data-param="([^"]+)"/) || [])[1];
        b.selecteurs['[data-fiche-intervention="' + id + '"]'] = elementDom();
        return id;
    };

    it('le bouton nomme le geste ; « Fermer » ; la saisie n\'écrit rien', async () => {
        const b = banc();
        const id = ouvrirBrouillon(b);
        expect(b.conteneur().innerHTML).toContain('data-param="' + id + '" class="btn btn-principal">Créer l\'intervention</button>');
        expect(b.conteneur().innerHTML).toContain('data-action="fermerFicheIntervention" data-param="' + id + '" class="btn btn-secondaire">Fermer</button>');
        const p = b.win.surChangementFicheIntervention(id, b.champ('interventionTitre')); b.avancer(1);
        expect(await p).toBe(false);
        expect(b.ecritures()).toBe(0);
    });

    it('« Créer l\'intervention » : écrite, « Intervention créée. », la fiche se rouvre existante (plus de bouton « Créer »)', () => {
        const b = banc();
        const id = ouvrirBrouillon(b);
        expect(b.win.sauvegarderPresencesIntervention(id)).toBe(true);
        expect(b.store.test_interventions.map(i => i.id)).toEqual([id]);
        expect(b.notifs.filter(n => n.type === 'succes').map(n => n.t)).toEqual(['Intervention créée.']);
        expect(b.conteneur().innerHTML).toContain('data-fiche-intervention="' + id + '"');
        expect(b.conteneur().innerHTML).not.toContain('Créer l\'intervention');
    });

    it('créer une intervention DÉJÀ complétée : aucune question, écrite complétée, aucune présence', () => {
        const b = banc({ statut: 'completee' });
        b.win.uiDialogues = b.uiDialogues;
        const id = ouvrirBrouillon(b);
        expect(b.win.sauvegarderPresencesIntervention(id)).toBe(true);
        expect(b.confirmations).toEqual([]);
        expect(b.store.test_interventions.map(i => i.statut)).toEqual(['completee']);
        expect(b.ecritures('test_presences')).toBe(0);
    });

    it('rencontre : « Créer la rencontre », « Rencontre créée. »', () => {
        const b = banc({ vue: 'rencontres' });
        const id = ouvrirBrouillon(b);
        expect(b.conteneur().innerHTML).toContain('>Créer la rencontre</button>');
        b.win.sauvegarderPresencesIntervention(id);
        expect(b.notifs.filter(n => n.type === 'succes').map(n => n.t)).toEqual(['Rencontre créée.']);
    });

    it('un échec d\'écriture à la création : aucun « créée »', () => {
        const b = banc();
        const id = ouvrirBrouillon(b);
        b.db.setSync = () => false;   // la garde #340 refuse
        expect(b.win.sauvegarderPresencesIntervention(id)).toBe(false);
        expect(b.notifs.filter(n => n.type === 'succes')).toEqual([]);
    });
});

describe('lot E3 · la question de sortie', () => {
    function bancDialogues(opts) {
        // La déclaration se fait au chargement du module : le banc pose `uiDialogues` AVANT.
        const store = storeBase(); store.test_interventions = [];
        const fiches = {}; const questions = [];
        const uiDialogues = {
            declarerFicheEnCreation: (g, p) => { fiches[g] = p; },
            quitterCreationSiConfirme: vi.fn(async (g, titre) => { if (!fiches[g] || !fiches[g]()) return true; questions.push(titre); return opts.quitter; })
        };
        const selecteurs = { '#listeEtudiantsIntervention input[type="checkbox"]:checked': [], '#listeEtudiantsIntervention textarea': [],
            'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }) };
        const b = monter(store, { modules: ['js/interventions.js'], globaux: { uiDialogues, determinerNiveauRaiPedagogique: () => null, obtenirGrilleReferenceDepistage: () => null },
            elements: { conteneurPrincipal: elementDom(), listeInterventions: elementDom(), interventionTitre: elementDom({ value: '' }), interventionDate: elementDom({ value: '2026-09-06' }) },
            selecteurs });
        b.win.uiDialogues = uiDialogues;
        return { b, fiches, questions };
    }

    it('sans saisie, « Fermer » ne demande rien ; avec un titre, la question « Cette intervention n\'est pas encore créée. »', async () => {
        const { b, fiches, questions } = bancDialogues({ quitter: false });
        b.win.afficherFormulaireIntervention();
        const id = (b.document.getElementById('conteneurPrincipal').innerHTML.match(/data-action="fermerFicheIntervention" data-param="([^"]+)"/) || [])[1];
        b.selecteurs['[data-fiche-intervention="' + id + '"]'] = elementDom();
        expect(b.win.interventionEnCreationAffichee()).toBe(true);
        expect(typeof fiches.intervention, 'le module déclare sa fiche au chargement').toBe('function');
        expect(fiches.intervention(), 'la date du jour posée à l\'ouverture n\'est pas une saisie').toBe(false);
        b.document.getElementById('interventionTitre').value = 'Rattrapage';
        expect(fiches.intervention()).toBe(true);
        await b.win.fermerFicheIntervention(id);
        expect(questions).toEqual(['Cette intervention n\'est pas encore créée.']);
        expect(b.win.obtenirIntervention(id), '« Rester » : le brouillon est là').not.toBeNull();
    });
});
