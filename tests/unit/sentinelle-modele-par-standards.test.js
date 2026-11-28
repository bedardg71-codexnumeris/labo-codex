/*
 * SENTINELLE — LE « MODÈLE PAR STANDARDS » DE L'ASSISTANT (21 nov. 2026 ; décision de Grégoire, 21 h 33)
 * Rapport : plans de travail/RAPPORT-2026-11-21-modele-par-standards.md.
 *
 *   M1  les cinq modèles prédéfinis ne bougent pas : la liste, l'ordre, la configuration octet pour octet (empreinte
 *       prise sur main à 16360f43c, 1.253.0) ; aucun n'est de la famille « cibles » ;
 *   M2  le modèle n'existe QUE dans la liste de « Choisis un modèle » : la bibliothèque (source de « ← Utiliser dans ce
 *       trimestre », de « Dupliquer », de la vue simple) ne le rend jamais ;
 *   M3  dans la liste : après les cinq modèles, avant les pratiques de la bibliothèque, marqué « à l'essai », sigle STD ;
 *       les cinq autres cartes sont celles d'avant ;
 *   M4  le choisir ne clone rien : les réponses sont celles d'une pratique par standards, l'échelle de départ est posée
 *       (ou celle déjà rangée, réutilisée), le niveau « sans donnée » aussi ; aucune cible ;
 *   M5  le chemin : modèle → cibles → récapitulatif ; l'étape de l'échelle seulement si l'échelle posée manque ; les
 *       autres modèles sautent toujours au récapitulatif ; « Décrire ma pratique » garde son chemin ;
 *   M6  la garde : sans cibles, rien n'est créé ; avec des cibles, l'ensemble, l'échelle et la pratique sont écrits, la
 *       pratique nomme un ensemble qui existe, double seuil absent (éteint), jetons éteints, provenance dite ;
 *   M7  changer d'avis : un autre modèle, ou « Décrire ma pratique », retire les réglages posés d'office.
 *
 * BREAK-TESTS : journal en fin de fichier. Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc, RACINE } from './_helpers/bac-suivi.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const IDS_MODELES = ['DEN-base', 'SPE-simple', 'SOM-litterature', 'STD-n-meilleurs', 'STD-n-recents'];
const EMPREINTE_MODELES = '206ffd2a15c00f76aa5a848604b086756ead5b99df556df8b65e3a0d138999bd';
const ORDRE_AFFICHE = ['STD-n-recents', 'STD-n-meilleurs', 'SOM-litterature', 'SPE-simple', 'DEN-base'];
const MIENNE = { id: 'pratique-mienne', nom: 'Ma pratique fictive', type: 'sommative', discipline: 'Général', dateAjoutBiblio: '2026-10-01T00:00:00.000Z', configuration: {} };

const CIBLES = [
    { id: 'cib-a', etiquette: 'Analyser un texte', enonce: 'Analyser un texte fictif.', poids: '1', terminale: false, criteres: [] },
    { id: 'cib-b', etiquette: 'Rédiger une dissertation', enonce: 'Rédiger une dissertation fictive.', poids: '2', terminale: true, criteres: [] }
];

function monter(store = {}) {
    const journal = [];
    const erreurs = [];
    const win = { addEventListener() {}, removeEventListener() {}, echapperHtml };
    let n = 0;
    const globaux = {
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} },
        db: dbBanc(store, journal), cle: (k) => 'test_' + k,
        notifications: { erreur: (m) => erreurs.push(m), succes() {}, info() {}, warning() {} },
        normaliserIdPratique: (t) => t, genererIdUnique: (p) => p + 'NEUF' + (++n), echapperHtml,
        formaterPourcentage: (v) => String(v).replace('.', ',') + ' %',
        confirm: () => true,
        obtenirToutesLesPratiquesBibliothequeSync: (...a) => win.obtenirToutesLesPratiquesBibliothequeSync(...a),
        demanderEchelleAdoption: (...a) => win.demanderEchelleAdoption(...a),
        poserEchelleAdoption: (...a) => win.poserEchelleAdoption(...a)
    };
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);
    chargerScript('js/pratiques-bibliotheque.js', globaux, win);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    win.wizardState.reponses = {};
    win.wizardState.pratiqueId = null;
    win.wizardState.modeEdition = false;
    win.wizardState.echelleDeDepart = null;
    win.wizardState.ensembleCiblesAEcrire = null;
    return { win, store, journal, erreurs, E: win.ETAPES_WIZARD, M: win.MODELE_ASSISTANT_PAR_STANDARDS };
}
const choisir = (a, id) => { a.win.wizardState.reponses.modeleChoisi = id; a.win.preparerAdoptionModele(a.win.wizardState.reponses); return a.win.wizardState.reponses; };

describe('M1 · les cinq modèles prédéfinis ne bougent pas', () => {
    const { win } = monter();
    const modeles = win.MODELES_PRATIQUES_PREDEFINIS;
    it('la liste et l\'ordre', () => {
        expect(Object.keys(modeles)).toEqual(IDS_MODELES);
    });
    it('la configuration, octet pour octet (empreinte de main à 1.253.0)', () => {
        // ↻ 28 nov. 2026 (second lot du renommage) : « Modèle sommatif » devient « Modèle cumulatif », description comprise.
        // L'empreinte se prend sur les modèles où CETTE paire est remise à l'ancienne : elle ne bouge pas, donc rien d'autre
        // n'a changé. La paire neuve se vérifie à part.
        const avant28 = clone(modeles);
        expect({ nom: avant28['SOM-litterature'].nom, description: avant28['SOM-litterature'].description })
            .toEqual({ nom: 'Modèle cumulatif', description: 'Pour débuter avec une pratique cumulative' });
        avant28['SOM-litterature'].nom = 'Modèle sommatif';
        avant28['SOM-litterature'].description = 'Pour débuter avec une pratique sommative';
        expect(createHash('sha256').update(JSON.stringify(avant28)).digest('hex')).toBe(EMPREINTE_MODELES);
    });
    it('aucun modèle prédéfini n\'est de la famille « cibles », aucun ne porte d\'ensemble de cibles', () => {
        for (const m of Object.values(modeles)) {
            expect(m.type, m.id).not.toBe('cibles');
            expect(JSON.stringify(m), m.id).not.toMatch(/ensembleCiblesId|"cibles"/);
        }
    });
});

describe('M2 · le modèle n\'existe que dans la liste de l\'assistant', () => {
    it('la bibliothèque ne le rend jamais : ni la lecture synchrone, ni l\'asynchrone, ni la recherche par identité', async () => {
        const { win, M } = monter({ bibliothequePratiques: [clone(MIENNE)] });
        expect(win.obtenirToutesLesPratiquesBibliothequeSync(true).map(p => p.id)).toEqual([...ORDRE_AFFICHE, MIENNE.id]);
        expect((await win.obtenirToutesLesPratiquesBibliotheque(true)).map(p => p.id)).toEqual([...ORDRE_AFFICHE, MIENNE.id]);
        expect(await win.obtenirConfigurationPratiqueParId(M.id)).toBeFalsy();
    });
    it('aucun autre fichier de js/ ne le nomme : il vit dans l\'assistant seul', () => {
        const scripts = [...new Set([...readFileSync(path.join(RACINE, 'index.html'), 'utf8').matchAll(/<script src="(js\/[\w./-]+\.js)/g)].map(m => m[1]))];
        // 22 nov. 2026 (release 1.254.0) : les Nouvelles (js/changelog-data.js) le nomment — des mots affichés, pas une
        // voie qui l'offre ; elles sont seules exclues. Toute autre porte qui le nommerait fait toujours rougir.
        const quiLeNomment = scripts.filter(f => f !== 'js/changelog-data.js').filter(f => /MODELE_ASSISTANT_PAR_STANDARDS|Modèle par standards/.test(sansCommentaires(readFileSync(path.join(RACINE, f), 'utf8'))));
        expect(quiLeNomment).toEqual(['js/wizard-pratique-v2.js']);
    });
    it('son identité ne commence pas par « STD- » (l\'ancien sens), et le code interne ne s\'y lit pas', () => {
        const { M } = monter();
        expect(M.id).toBe('par-standards');
        expect(M.id).not.toMatch(/^STD-/);
        expect(JSON.stringify(M)).not.toMatch(/CIB/);
        expect(Object.isFrozen(M)).toBe(true);
        expect(M).not.toHaveProperty('configuration');   // des réglages, aucun contenu : il ne porte ni cible ni ensemble
    });
});

describe('M3 · la liste « Choisis un modèle »', () => {
    it('les cinq modèles, puis « Modèle par standards », puis les pratiques de la bibliothèque', () => {
        const { win, M } = monter({ bibliothequePratiques: [clone(MIENNE)] });
        expect(win.obtenirOptionsModeles().map(o => o.value)).toEqual([...ORDRE_AFFICHE, M.id, MIENNE.id]);
    });
    it('sa carte : le nom, le sigle STD, la phrase, la marque « à l\'essai » ; jamais « CIB »', () => {
        const { win, M } = monter();
        const carte = win.obtenirOptionsModeles().find(o => o.value === M.id);
        expect(carte.label).toBe('Modèle par standards <span class="wizard-v2-modele-famille">STD · Général</span>');
        expect(carte.description).toBe('Pour débuter avec une notation par standards : tu écris les cibles de ton cours');
        expect(carte.essai).toBe(true);
        expect(JSON.stringify(carte)).not.toMatch(/CIB/);
    });
    it('les cinq autres cartes sont celles d\'avant, et aucune ne porte la marque', () => {
        // ↻ 27 nov. 2026 (trois familles) : les sigles HYB et CUM ; « Modèle sommatif » garde son nom (rapport du lot).
        // ↻ 28 nov. 2026 (second lot du renommage) : il s'appelle « Modèle cumulatif », description comprise.
        const { win, M } = monter();
        const autres = win.obtenirOptionsModeles().filter(o => o.value !== M.id);
        expect(autres).toEqual([
            { value: 'STD-n-recents', label: 'N plus récentes <span class="wizard-v2-modele-famille">HYB · Général</span>', description: 'Garde les 5 évaluations les plus récentes, valorise l&#39;état actuel' },
            { value: 'STD-n-meilleurs', label: 'N meilleures évaluations <span class="wizard-v2-modele-famille">HYB · Général</span>', description: 'Garde les 7 meilleures évaluations sur 10, valorise la progression' },
            { value: 'SOM-litterature', label: 'Modèle cumulatif <span class="wizard-v2-modele-famille">CUM · Général</span>', description: 'Pour débuter avec une pratique cumulative' },
            { value: 'SPE-simple', label: 'Modèle simple <span class="wizard-v2-modele-famille">SPE · Général</span>', description: 'Pour débuter avec PAN – Spécifications' },
            { value: 'DEN-base', label: 'Modèle de base <span class="wizard-v2-modele-famille">DEN · Général</span>', description: win.MODELES_PRATIQUES_PREDEFINIS['DEN-base'].description.replace(/'/g, '&#39;') }
        ]);
    });
});

describe('M4 · le choisir pose des réglages, ne clone rien', () => {
    it('les réponses d\'une pratique par standards ; l\'échelle de départ en attente, son niveau « sans donnée » ; aucune cible', () => {
        const a = monter({ test_echellesTemplates: [] });
        const r = choisir(a, a.M.id);
        expect(r._modeleParStandards).toBe(true);
        expect(r).not.toHaveProperty('_modeleAdopte');
        expect(r).not.toHaveProperty('_gabaritSource');
        expect(r.typePratique).toBe('cibles');
        expect(r.calcNoteFinale).toBe('cibles');
        expect(r.nom).toBe('Modèle par standards');
        expect(r).not.toHaveProperty('ciblesStandards');
        const depart = a.win.wizardState.echelleDeDepart;
        expect(depart.nom).toBe('Échelle de départ – Par standards');
        expect(depart.niveaux.map(n => [n.code, n.valeurCalcul])).toEqual([['0', 0], ['1', 25], ['2', 50], ['3', 75], ['4', 100]]);
        expect(r.echelleId).toBe(depart.id);
        expect(r.niveauSansDonnee).toBe('0');
        expect(a.journal).toEqual([]);                    // choisir n'écrit rien
    });
    it('l\'échelle de départ est déjà rangée dans le trimestre : elle sert, aucune seconde n\'est préparée', () => {
        const dejaLa = Object.assign(monter().win.EnsemblesCibles.echelleDeDepart('ECH-deja'), { verrouille: true });
        const a = monter({ test_echellesTemplates: [clone(dejaLa)] });
        const r = choisir(a, a.M.id);
        expect(r.echelleId).toBe('ECH-deja');
        expect(a.win.wizardState.echelleDeDepart).toBeNull();
    });
    it('une échelle du même nom aux valeurs retouchées n\'est pas « la même » : l\'échelle de départ est préparée', () => {
        const retouchee = monter().win.EnsemblesCibles.echelleDeDepart('ECH-retouchee');
        retouchee.niveaux[2].valeurCalcul = 60;
        const a = monter({ test_echellesTemplates: [retouchee] });
        const r = choisir(a, a.M.id);
        expect(r.echelleId).not.toBe('ECH-retouchee');
        expect(a.win.wizardState.echelleDeDepart.id).toBe(r.echelleId);
    });
    it('un nom déjà saisi est gardé', () => {
        const a = monter();
        a.win.wizardState.reponses.nom = 'Mon cours fictif';
        expect(choisir(a, a.M.id).nom).toBe('Mon cours fictif');
    });
});

describe('M5 · le chemin de l\'assistant', () => {
    it('modèle → cibles → récapitulatif ; le retour suit le même chemin', () => {
        const a = monter();
        const r = choisir(a, a.M.id);
        expect(a.E['choix-modele'].suivant(r)).toBe('config-cibles');
        expect(a.E['config-cibles'].suivant(r)).toBe('recapitulatif');
        expect(a.E['recapitulatif'].precedent(r)).toBe('config-cibles');
        expect(a.E['config-cibles'].precedent(r)).toBe('choix-modele');
    });
    it('l\'échelle posée manque (retirée, ou sans son niveau « sans donnée ») : son étape s\'ouvre, puis le récapitulatif', () => {
        const a = monter();
        const r = choisir(a, a.M.id);
        r.niveauSansDonnee = '';
        expect(a.E['config-cibles'].suivant(r)).toBe('echelle-cibles');
        expect(a.E['echelle-cibles'].suivant(r)).toBe('recapitulatif');
        r.niveauSansDonnee = '0';
        r.echelleId = 'ECH-absente';
        expect(a.E['config-cibles'].suivant(r)).toBe('echelle-cibles');
    });
    it.each(ORDRE_AFFICHE)('le modèle %s saute toujours au récapitulatif, par l\'adoption d\'avant', (id) => {
        const a = monter();
        const r = choisir(a, id);
        expect(r._modeleAdopte).toBe(true);
        expect(r._gabaritSource.id).toBe(id);
        expect(r).not.toHaveProperty('_modeleParStandards');
        expect(a.E['choix-modele'].suivant(r)).toBe('recapitulatif');
        expect(a.E['recapitulatif'].precedent(r)).toBe('choix-modele');
    });
    it('« Décrire ma pratique » garde son chemin : cibles → échelle → informations → récapitulatif', () => {
        const a = monter();
        const r = { calcNoteFinale: 'cibles', typePratique: 'cibles' };
        expect(a.E['config-cibles'].suivant(r)).toBe('echelle-cibles');
        expect(a.E['echelle-cibles'].suivant(r)).toBe('infos-base');
        expect(a.E['config-cibles'].precedent(r)).toBe('calcul-note-finale');
        expect(a.E['recapitulatif'].precedent(r)).toBe('infos-base');
    });
});

describe('M6 · la garde : jamais de pratique « Par standards » sans cibles', () => {
    it('sans cible : la création est refusée en mots, rien n\'est écrit', async () => {
        const a = monter({ test_pratiquesConfigurables: [], test_echellesTemplates: [] });
        choisir(a, a.M.id);
        await a.win.creerPratiqueV2();
        expect(a.erreurs).toEqual([a.win.EnsemblesCibles.MOTIFS.AUCUNE_CIBLE]);
        expect(a.store.test_pratiquesConfigurables).toEqual([]);
        expect(a.store.test_echellesTemplates).toEqual([]);
        expect(a.store).not.toHaveProperty('test_ensemblesCibles');
    });
    it('une cible sans étiquette, ou d\'un poids nul : refusée aussi', async () => {
        for (const fautive of [{ id: 'x', etiquette: '', enonce: 'Rédiger', poids: '1' }, { id: 'y', etiquette: 'Analyser', poids: '0' }]) {
            const a = monter({ test_pratiquesConfigurables: [] });
            choisir(a, a.M.id).ciblesStandards = [fautive];
            await a.win.creerPratiqueV2();
            expect(a.erreurs).toHaveLength(1);
            expect(a.store.test_pratiquesConfigurables).toEqual([]);
        }
    });
    it('avec deux cibles : l\'ensemble, l\'échelle de départ et la pratique sont écrits ; la pratique nomme un ensemble qui existe', async () => {
        const a = monter({ test_pratiquesConfigurables: [], test_echellesTemplates: [] });
        const r = choisir(a, a.M.id);
        r.ciblesStandards = clone(CIBLES);
        await a.win.creerPratiqueV2();
        expect(a.erreurs).toEqual([]);
        const [p] = a.store.test_pratiquesConfigurables;
        expect(p).toMatchObject({ nom: 'Modèle par standards', type: 'cibles', pratiques: ['CIB'], calcul_note: { methode: 'niveaux_par_cible' },
            dansBibliotheque: true, jetons: { actif: false }, inspireDe: { sourceId: 'par-standards', nom: 'Modèle par standards' } });
        expect(Object.keys(p.configuration).sort()).toEqual(['echelleId', 'ensembleCiblesId', 'niveauSansDonnee', 'type']);   // pas de double seuil : éteint
        expect(p.configuration.niveauSansDonnee).toBe('0');
        expect(p).not.toHaveProperty('estGabarit');
        const [ensemble] = a.store.test_ensemblesCibles;
        expect(ensemble.id).toBe(p.configuration.ensembleCiblesId);
        expect(ensemble.cibles.map(c => [c.etiquette, c.poids, c.terminale])).toEqual([['Analyser un texte', 1, false], ['Rédiger une dissertation', 2, true]]);
        const [echelle] = a.store.test_echellesTemplates;
        expect(echelle.id).toBe(p.configuration.echelleId);
        expect(echelle.nom).toBe('Échelle de départ – Par standards');
        // L'ensemble est écrit AVANT la pratique.
        const ordre = a.journal.map(e => e.k);
        expect(ordre.indexOf('test_ensemblesCibles')).toBeGreaterThanOrEqual(0);
        expect(ordre.indexOf('test_ensemblesCibles')).toBeLessThan(ordre.lastIndexOf('test_pratiquesConfigurables'));
    });
    it('« Décrire ma pratique », sans le modèle : aucune provenance posée (la pratique d\'avant, telle quelle)', async () => {
        const a = monter({ test_pratiquesConfigurables: [], test_echellesTemplates: [] });
        const depart = a.win.EnsemblesCibles.echelleDeDepart('ECH-depart');
        a.win.wizardState.echelleDeDepart = depart;
        a.win.wizardState.reponses = { nom: 'Par standards fictive', calcNoteFinale: 'cibles', ciblesStandards: clone(CIBLES), echelleId: 'ECH-depart', niveauSansDonnee: '0' };
        await a.win.creerPratiqueV2();
        expect(a.erreurs).toEqual([]);
        expect(a.store.test_pratiquesConfigurables[0]).not.toHaveProperty('inspireDe');
    });
});

describe('M7 · changer d\'avis retire les réglages posés d\'office', () => {
    it('un autre modèle : plus de marque, plus d\'échelle de départ en attente, le nom du modèle repart', () => {
        const a = monter();
        choisir(a, a.M.id);
        const r = choisir(a, 'SOM-litterature');
        expect(r).not.toHaveProperty('_modeleParStandards');
        expect(a.win.wizardState.echelleDeDepart).toBeNull();
        expect(r).not.toHaveProperty('echelleId');
        expect(r).not.toHaveProperty('niveauSansDonnee');
        expect(r.nom).toBe('Modèle cumulatif');   // ↻ 28 nov. 2026 (second lot du renommage)
        expect(r._gabaritSource.id).toBe('SOM-litterature');
    });
    it('« Décrire ma pratique » : idem, et le nom du modèle ne reste pas dans le champ', () => {
        const a = monter();
        const r = choisir(a, a.M.id);
        a.win.reinitialiserAdoptionModele(r);
        expect(r).not.toHaveProperty('_modeleParStandards');
        expect(r).not.toHaveProperty('nom');
        expect(a.win.wizardState.echelleDeDepart).toBeNull();
    });
    it('une échelle choisie par l\'enseignant·e à l\'étape de l\'échelle n\'est pas retirée', () => {
        const a = monter({ test_echellesTemplates: [{ id: 'ECH-mienne', nom: 'Mon échelle fictive', niveaux: [{ code: 'A', valeurCalcul: 0 }, { code: 'B', valeurCalcul: 100 }] }] });
        const r = choisir(a, a.M.id);
        r.echelleId = 'ECH-mienne';
        r.niveauSansDonnee = 'A';
        a.win.reinitialiserAdoptionModele(r);
        expect(r.echelleId).toBe('ECH-mienne');
    });
});

/*
 * JOURNAL DES BREAK-TESTS (joués un à un le 21 nov. 2026, chacun rétabli avant le suivant ; 28 essais verts au départ)
 * BT1  (M1) pratiques-bibliotheque.js : un point ajouté à la description de « Modèle simple ».
 *      ROUGE (2) : l'empreinte ; « les cinq autres cartes sont celles d'avant ».
 * BT2  (M1, M2) pratiques-bibliotheque.js : le modèle ajouté aux modèles prédéfinis (une entrée « cibles » sans cibles).
 *      ROUGE (7) : la liste, l'empreinte, « aucun n'est de la famille cibles », la bibliothèque, « aucun autre fichier »,
 *      l'ordre de la liste, la carte.
 * BT3  (M4, M5, M6) wizard : le choix du modèle traité comme une adoption (la branche retirée).
 *      ROUGE (8) : les réponses, l'échelle, le chemin, les refus, la création. Banc, ROUGE : le parcours entier.
 * BT4  (M5) wizard : l'étape de l'échelle toujours sautée, même quand l'échelle posée manque.
 *      ROUGE (1) : « l'échelle posée manque… ».
 * BT5  (M6) wizard : les refus d'`EnsemblesCibles` éteints pour le modèle.
 *      ROUGE (2) : « sans cible… », « une cible sans étiquette, ou d'un poids nul… ».
 * BT6  (M7) wizard : `quitterModeleParStandards` ne fait rien.
 *      ROUGE (2) : « un autre modèle… », « Décrire ma pratique… ».
 * BT7  (M3) wizard : la marque « à l'essai » retirée de la carte.
 *      ROUGE (1) : « sa carte… ».
 * BT8  (M3) wizard : la carte placée en tête de liste.
 *      ROUGE (1) : « les cinq modèles, puis… ».
 * BT9  (M4) wizard : l'échelle de départ préparée même quand elle est déjà rangée.
 *      ROUGE (1) : « l'échelle de départ est déjà rangée… ».
 * BT10 (M6) wizard : la provenance posée sur toute pratique par standards neuve.
 *      ROUGE (1) : « Décrire ma pratique, sans le modèle… ».
 */
