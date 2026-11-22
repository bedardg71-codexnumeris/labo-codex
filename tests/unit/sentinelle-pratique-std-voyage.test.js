/**
 * SENTINELLE (21 nov. 2026) — LOT pratique-std-voyage (#1164) : UNE PRATIQUE « PAR STANDARDS » VOYAGE AVEC SES CIBLES.
 *
 * Rapport : plans de travail/RAPPORT-2026-11-21-pratique-std-voyage.md.
 *
 * Une section par règle du mandat, sur les modules RÉELS (`ensembles-cibles.js`, `pratiques-bibliotheque.js`,
 * `import-export.js` pour la liste blanche) et sur le texte de `pratiques-gestion.js` et `partage-format.js` :
 *   V1  emporter : une COPIE qui porte les cibles (étiquettes, énoncés, critères et essentiels, poids, terminales), le
 *       cours et l'échelle ; la pratique reçue et son trimestre ne sont pas touchés ;
 *   V2  CE QUI NE VOYAGE JAMAIS : aucune inscription, aucune annulation, rien d'un·e étudiant·e ; le voyage ne lit ni
 *       n'écrit `inscriptionsCibles` ; à l'arrivée, seules `ensemblesCibles` et `echellesTemplates` sont écrites ;
 *   V3  déposer : l'ensemble est recréé sous une identité NEUVE, la pratique le nomme, le bagage est retiré ; un
 *       ensemble déjà présent n'est jamais réécrit ;
 *   V4  l'échelle : recréée si le trimestre ne l'a pas (sans son verrou) ; présente, elle sert telle quelle, rien n'y est écrit ;
 *   V5  le cours : gardé s'il existe encore, sinon aucun ;
 *   V6  les autres familles : `emporter` rend l'objet reçu, `deposer` n'écrit rien ;
 *   V7  garder : le réglage des jetons d'une pratique du trimestre entre dans la bibliothèque (source locale) ; un
 *       fichier reçu passe par la liste blanche comme avant ;
 *   V8  les accroches : le bouton sur chaque rangée sans condition de famille, les deux imports par
 *       `importerPratiqueDepuisTrimestre`, `copierPratiqueDepuisTrimestre` inchangée et synchrone, les exports, le
 *       partage ; ni `console.log` ni handler inline dans ce que le lot ajoute.
 * L'écran (le bouton, l'état « ✓ Aussi dans ta bibliothèque », le tableau des cibles à l'arrivée) est jugé par
 * `tests/integration/pratique-std-voyage.spec.js`. La garde du lot 0 est rejouée à part.
 *
 * Données fictives (Zoé Fictive, DA 2100001). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc, RACINE } from './_helpers/bac-suivi.js';
import { tranche, position } from './_helpers/tranche.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const ZOE = '2100001';
const ECHELLE = { id: 'ECH-voy', nom: 'Échelle du voyage', verrouille: true, dansBibliotheque: true, dateImport: '2026-09-01', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 12.49, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 12.5, max: 37.49, valeurCalcul: 25 },
    { code: '2', nom: 'Acquis', min: 37.5, max: 100, valeurCalcul: 100 }] };
const CIBLES = [
    { id: 'cib-a', etiquette: 'Analyser', enonce: 'Analyser un texte.', poids: 1, terminale: false,
        criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true }, { id: 'k2', texte: 'Cite le texte', essentiel: false }] },
    { id: 'cib-b', etiquette: 'Dissertation', enonce: 'Rédiger une dissertation.', poids: 2.5, terminale: true, criteres: [] }];
const ENSEMBLE = { id: 'ENSC-src', coursId: 'cours-1', cibles: CIBLES, dateCreation: '2026-09-01T00:00:00.000Z', dateModification: '2026-09-02T00:00:00.000Z' };
const STD = { id: 'p-std', nom: 'Par standards fictive', calcul_note: { methode: 'niveaux_par_cible' }, jetons: { actif: false },
    configuration: { type: 'cibles', ensembleCiblesId: ENSEMBLE.id, echelleId: ECHELLE.id, niveauSansDonnee: '0' } };
const SOM = { id: 'p-som', nom: 'Sommative fictive', calcul_note: { methode: 'moyenne_ponderee' }, jetons: { actif: true, delai: { nombre: 2 } }, configuration: { seuilReussite: 60 } };
const INSCRIPTIONS = [
    { id: 'I1', type: 'inscription', da: ZOE, ensembleId: ENSEMBLE.id, cibleId: 'cib-a', niveau: '2', echelleId: ECHELLE.id, date: '2026-11-10', noteBreve: 'Remarque de Zoé', criteres: [] },
    { id: 'A1', type: 'annulation', inscriptionId: 'I1', da: ZOE, ensembleId: ENSEMBLE.id, cibleId: 'cib-a', date: '2026-11-11', raison: 'Erreur de saisie' }];

/** Un trimestre source `src` rempli, un trimestre actif `act` vide ; `cle` préfixe par l'actif, `cleSource` par la source. */
function monter(extra = {}) {
    const store = Object.assign({
        cours: [{ id: 'cours-1', codeCours: '999-ZZZ-ZZ', titre: 'Cours fictif' }],
        src_ensemblesCibles: [clone(ENSEMBLE)], src_echellesTemplates: [clone(ECHELLE)], src_pratiquesConfigurables: [clone(STD), clone(SOM)],
        src_inscriptionsCibles: clone(INSCRIPTIONS), src_groupeEtudiants: [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé' }]
    }, extra);
    const journal = [];
    const db = dbBanc(store, journal);
    let actif = 'act';
    let n = 0;
    let refuser = false;
    const globaux = {
        db, cle: (k) => actif + '_' + k, cleSource: (k, t) => t + '_' + k,
        genererIdUnique: (p) => p + 'neuf' + (++n),
        modifierEtAnnoncer: async (k, mutateur, defaut) => (refuser ? undefined : db.modifier(k, mutateur, defaut)),
        echapperHtml: (s) => String(s == null ? '' : s)
    };
    const win = chargerScript('js/pratiques/ensembles-cibles.js', globaux, {});
    return { EC: win.EnsemblesCibles, win, store, journal, db, activer: (t) => { actif = t; }, refuserLesEcritures: () => { refuser = true; } };
}
const cles = (journal) => [...new Set(journal.map(e => e.k))];

describe('V1 · emporter : une copie qui porte les définitions, et rien d\'autre ne bouge', () => {
    it('les cibles, leurs critères et essentiels, les poids, les terminales, le cours et l\'échelle, lus dans le trimestre source', () => {
        const { EC, store, journal } = monter();
        const avant = clone(store);
        const source = clone(STD);
        const emportee = EC.emporter(source, 'src');
        expect(emportee).not.toBe(source);
        expect(source).toEqual(STD);                                       // la pratique reçue n'est pas mutée
        expect(store).toEqual(avant);                                      // aucune écriture
        expect(journal).toEqual([]);
        const bagage = emportee.configuration[EC.CHAMP_EMPORTE];
        expect(bagage.cibles).toEqual(CIBLES);
        expect(bagage.coursId).toBe('cours-1');
        expect(bagage.echelle.niveaux).toEqual(ECHELLE.niveaux);
        // Les états locaux de l'échelle (verrou, place dans la barre, trace d'import) ne partent pas.
        for (const local of ['verrouille', 'dansBibliotheque', 'dateImport']) expect(bagage.echelle).not.toHaveProperty(local);
        expect(emportee.configuration.niveauSansDonnee).toBe('0');
        // La copie est profonde : la retoucher ne retouche pas la source.
        emportee.configuration.type = 'autre';
        expect(source.configuration.type).toBe('cibles');
    });

    it('sans trimestre source : le trimestre actif ; ensemble introuvable : la pratique telle quelle', () => {
        const { EC, activer } = monter();
        expect(EC.emporter(clone(STD))).not.toHaveProperty(['configuration', EC.CHAMP_EMPORTE]);   // l'actif (`act`) est vide
        activer('src');
        expect(EC.emporter(clone(STD)).configuration[EC.CHAMP_EMPORTE].cibles).toHaveLength(2);
        const orpheline = clone(STD); orpheline.configuration.ensembleCiblesId = 'ENSC-inconnu';
        expect(EC.emporter(orpheline, 'src')).toBe(orpheline);
    });

    it('un exemplaire déjà en voyage garde son bagage (son ensemble n\'est dans aucun trimestre lu)', () => {
        const { EC } = monter();
        const exemplaire = EC.emporter(clone(STD), 'src');
        expect(EC.emporter(exemplaire)).toBe(exemplaire);
        expect(EC.aEmporte(exemplaire)).toBe(true);
        expect(EC.etiquettesEmportees(exemplaire)).toEqual(['Analyser', 'Dissertation']);
    });
});

describe('V2 · ce qui ne voyage jamais : les inscriptions, les annulations, rien d\'un·e étudiant·e', () => {
    it('le bagage ne porte que des définitions : ni DA, ni remarque, ni raison d\'annulation, ni identifiant d\'inscription', () => {
        const { EC } = monter();
        const texte = JSON.stringify(EC.emporter(clone(STD), 'src'));
        for (const interdit of [ZOE, 'Remarque de Zoé', 'Erreur de saisie', 'I1', 'A1', 'inscription', 'annulation', 'Fictive']) expect(texte).not.toContain(interdit);
        const bagage = EC.emporter(clone(STD), 'src').configuration[EC.CHAMP_EMPORTE];
        expect(Object.keys(bagage).sort()).toEqual(['cibles', 'coursId', 'echelle']);
        for (const c of bagage.cibles) expect(Object.keys(c).sort()).toEqual(['criteres', 'enonce', 'etiquette', 'id', 'poids', 'terminale']);
    });

    it('à l\'arrivée, seuls `ensemblesCibles` et `echellesTemplates` du trimestre ACTIF sont écrits ; la source ne l\'est jamais', async () => {
        const { EC, store, journal } = monter();
        const avant = clone(store);
        const arrivee = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(cles(journal).sort()).toEqual(['act_echellesTemplates', 'act_ensemblesCibles']);
        for (const k of Object.keys(avant)) expect(store[k]).toEqual(avant[k]);                     // le trimestre source, octet pour octet
        expect(store).not.toHaveProperty('act_inscriptionsCibles');
        expect(JSON.stringify([arrivee, store.act_ensemblesCibles, store.act_echellesTemplates])).not.toContain(ZOE);
    });

    it('le texte du voyage ne nomme aucune donnée d\'étudiant·e', () => {
        const source = sansCommentaires(lire('js/pratiques/ensembles-cibles.js'));
        const bloc = tranche(source, 'const CHAMP_EMPORTE', 'function esc(', { longueurMin: 1500 });
        for (const interdit of ['inscriptionsCibles', 'InscriptionsCibles', 'groupeEtudiants', 'evaluationsSauvegardees', 'indicesCP', 'presences'])
            expect(bloc).not.toContain(interdit);
        // Les seules clés lues ou écrites par le voyage.
        const clesNommees = [...bloc.matchAll(/cleDe\(([^)]+)\)|cle\(([^)]+)\)|getSync\('([^']+)'/g)].map(m => (m[1] || m[2] || m[3]).replace(/'/g, '')).sort();
        expect([...new Set(clesNommees)]).toEqual(['CLE', 'cours', 'echellesTemplates', 'nom']);
    });
});

describe('V3 · déposer : l\'ensemble est recréé sous une identité neuve, et la pratique le nomme', () => {
    it('identité neuve, mêmes cibles et mêmes identités de cibles et de critères ; le bagage est retiré', async () => {
        const { EC, store } = monter();
        const emportee = EC.emporter(clone(STD), 'src');
        const temoin = clone(emportee);
        const arrivee = await EC.deposer(emportee);
        expect(emportee).toEqual(temoin);                                  // la pratique reçue n'est pas mutée
        expect(store.act_ensemblesCibles).toHaveLength(1);
        const ensemble = store.act_ensemblesCibles[0];
        expect(ensemble.id).not.toBe(ENSEMBLE.id);
        expect(ensemble.id).toMatch(/^ENSC_/);
        expect(ensemble.cibles).toEqual(CIBLES);
        expect(arrivee.configuration.ensembleCiblesId).toBe(ensemble.id);
        expect(arrivee.configuration).not.toHaveProperty(EC.CHAMP_EMPORTE);
        expect(arrivee.configuration.echelleId).toBe(ECHELLE.id);
        expect(arrivee.configuration.niveauSansDonnee).toBe('0');
        expect(arrivee.id).toBe(STD.id);
    });

    it('un ensemble déjà présent sous l\'identité de la source n\'est pas réécrit ; deux arrivées ont chacune le leur', async () => {
        const present = { id: ENSEMBLE.id, coursId: null, cibles: [{ id: 'cib-z', etiquette: 'Autre', enonce: '', criteres: [], poids: 1, terminale: false }], dateCreation: 'x', dateModification: 'x' };
        const { EC, store } = monter({ act_ensemblesCibles: [clone(present)] });
        const a1 = await EC.deposer(EC.emporter(clone(STD), 'src'));
        const a2 = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_ensemblesCibles).toHaveLength(3);
        expect(store.act_ensemblesCibles[0]).toEqual(present);
        expect(new Set([ENSEMBLE.id, a1.configuration.ensembleCiblesId, a2.configuration.ensembleCiblesId]).size).toBe(3);
    });

    it('une écriture refusée : null, et la pratique ne nomme rien de neuf', async () => {
        const { EC, store, refuserLesEcritures } = monter();
        refuserLesEcritures();
        expect(await EC.deposer(EC.emporter(clone(STD), 'src'))).toBeNull();
        expect(store).not.toHaveProperty('act_ensemblesCibles');
        // L'échelle déjà là : c'est l'écriture de l'ensemble qui est refusée, et la réponse est la même.
        const avecEchelle = monter({ act_echellesTemplates: [clone(ECHELLE)] });
        avecEchelle.refuserLesEcritures();
        expect(await avecEchelle.EC.deposer(avecEchelle.EC.emporter(clone(STD), 'src'))).toBeNull();
        expect(avecEchelle.store).not.toHaveProperty('act_ensemblesCibles');
    });
});

describe('V4 · l\'échelle : recréée si elle manque, laissée telle quelle si elle est là', () => {
    it('absente : recréée sous son identité, offerte au trimestre, sans le verrou ni les traces locales de la source', async () => {
        const { EC, store } = monter();
        await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_echellesTemplates).toHaveLength(1);
        const e = store.act_echellesTemplates[0];
        expect(e.id).toBe(ECHELLE.id);
        expect(e.nom).toBe(ECHELLE.nom);
        expect(e.niveaux).toEqual(ECHELLE.niveaux);
        expect(e.verrouille).toBe(false);
        expect(e.dansBibliotheque).toBe(true);
        expect(e).not.toHaveProperty('dateImport');
    });

    it('présente : rien n\'y est écrit, même retouchée ou retirée de la barre', async () => {
        const retouchee = Object.assign(clone(ECHELLE), { nom: 'Retouchée', dansBibliotheque: false });
        const { EC, store, journal } = monter({ act_echellesTemplates: [clone(retouchee)] });
        await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_echellesTemplates).toEqual([retouchee]);
        expect(cles(journal)).toEqual(['act_ensemblesCibles']);
    });

    it('sans échelle dans le bagage (la source ne l\'avait plus) : les cibles arrivent quand même', async () => {
        const { EC, store } = monter({ src_echellesTemplates: [] });
        const arrivee = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store).not.toHaveProperty('act_echellesTemplates');
        expect(store.act_ensemblesCibles[0].cibles).toEqual(CIBLES);
        expect(arrivee.configuration.echelleId).toBe(ECHELLE.id);
    });
});

describe('V5 · le cours : gardé s\'il existe encore, sinon aucun', () => {
    it('le cours de la bibliothèque des cours reste nommé ; un cours inconnu ici n\'est pas nommé', async () => {
        const connu = monter();
        await connu.EC.deposer(connu.EC.emporter(clone(STD), 'src'));
        expect(connu.store.act_ensemblesCibles[0].coursId).toBe('cours-1');
        const inconnu = monter({ cours: [] });
        await inconnu.EC.deposer(inconnu.EC.emporter(clone(STD), 'src'));
        expect(inconnu.store.act_ensemblesCibles[0].coursId).toBeNull();
    });
});

describe('V6 · les autres familles passent inchangées', () => {
    it('emporter rend l\'objet reçu ; deposer rend l\'objet reçu et n\'écrit rien', async () => {
        const { EC, journal } = monter();
        for (const p of [clone(SOM), { id: 'x', configuration: { type: 'standards', portfolio: {} } }, { id: 'y' }, null]) {
            expect(EC.emporter(p, 'src')).toBe(p);
            expect(await EC.deposer(p)).toBe(p);
            expect(EC.aEmporte(p)).toBe(false);
        }
        expect(journal).toEqual([]);
    });

    it('une pratique d\'une autre famille qui porterait le champ ne dépose rien', async () => {
        const { EC, journal } = monter();
        const p = { id: 'z', configuration: { type: 'standards', ciblesEmportees: { cibles: CIBLES, echelle: ECHELLE } } };
        expect(await EC.deposer(p)).toBe(p);
        expect(journal).toEqual([]);
    });
});

describe('V7 · garder : le réglage des jetons entre dans la bibliothèque (source locale), la liste blanche reste pour un fichier', () => {
    function monterBibliotheque() {
        const store = {};
        const db = dbBanc(store, []);
        const wie = chargerScript('js/import-export.js');
        const win = { assainirObjet: wie.assainirObjet, SCHEMAS_IMPORT: wie.SCHEMAS_IMPORT };
        chargerScript('js/pratiques-bibliotheque.js', { db, cle: (k) => k, echapperHtml: (s) => String(s),
            notifications: { info() {}, succes() {}, erreur() {} } }, win);
        return { win, store };
    }

    it('source locale : `jetons` et le bagage des cibles sont gardés ; sans l\'option, `jetons` reste hors de la liste blanche', async () => {
        const { win, store } = monterBibliotheque();
        expect(typeof win.assainirObjet).toBe('function');
        const { EC } = monter();
        const r = await win.importerPratiquesDansBibliotheque([EC.emporter(clone(STD), 'src'), clone(SOM)], { sourceLocale: true });
        expect(r).toEqual({ ajoutees: 2, existantes: 0 });
        const biblio = store[win.CLE_BIBLIOTHEQUE_PRATIQUES];
        expect(biblio[0].jetons).toEqual({ actif: false });
        expect(biblio[0].configuration.ciblesEmportees.cibles).toEqual(CIBLES);
        expect(biblio[0].calcul_note).toEqual({ methode: 'niveaux_par_cible' });
        expect(biblio[1].jetons).toEqual(SOM.jetons);
        expect(biblio[1].configuration).toEqual(SOM.configuration);

        const fichier = monterBibliotheque();
        await fichier.win.importerPratiquesDansBibliotheque([clone(SOM)]);
        expect(fichier.store[fichier.win.CLE_BIBLIOTHEQUE_PRATIQUES][0]).not.toHaveProperty('jetons');
    });
});

describe('V8 · les accroches du lot dans le code', () => {
    const gestion = lire('js/pratiques-gestion.js');
    const code = sansCommentaires(gestion);
    const corps = (nom) => tranche(code, 'function ' + nom + '(', '\n}\n', { longueurMin: 80 });

    it('le bouton sur chaque rangée de « Dans ce trimestre », sans condition de famille, aux mots des autres bibliothèques', () => {
        const rangees = tranche(code, 'const rangeesTrimestre', 'const rangeesBibliotheque', { longueurMin: 500 });
        expect(rangees).toMatch(/lieeAExemplaire\(pratique, ex\)\)\) \{\s*rangee\.etat = 'Aussi dans ta bibliothèque';\s*\} else \{\s*rangee\.passage = \{ label: 'Garder dans ma bibliothèque', action: 'garderPratiqueDansBibliotheque', param: pratique\.id, sens: 'versBibliotheque' \};/);
        expect(rangees).not.toMatch(/type === 'cibles'|estParCibles|famille/);
        expect(code).toContain('window.garderPratiqueDansBibliotheque = garderPratiqueDansBibliotheque;');
    });

    it('garder : la pratique du trimestre, emportée, par l\'écriture de la bibliothèque en source locale ; aucune écriture du trimestre', () => {
        const garder = corps('garderPratiqueDansBibliotheque');
        expect(garder).toMatch(/importerPratiquesDansBibliotheque\(\[EC \? EC\.emporter\(pratique\) : pratique\], \{ sourceLocale: true \}\)/);
        expect(garder).not.toMatch(/setSync|db\.modifier|db\.set\(|removeSync/);
    });

    it('les deux imports d\'un autre trimestre passent par `importerPratiqueDepuisTrimestre`, qui dépose avant de copier', () => {
        const importer = corps('importerPratiqueDepuisTrimestre');
        expect(importer).toMatch(/EC\.deposer\(EC\.emporter\(pratiqueSource, srcId\)/);
        expect(position(importer, 'EC.deposer')).toBeLessThan(position(importer, 'copierPratiqueDepuisTrimestre('));
        expect(corps('importerUnePratiqueTrimestre')).toContain('await importerPratiqueDepuisTrimestre(pratique, srcId)');
        expect(corps('importerToutPratiquesTrimestreModal')).toContain('await importerPratiqueDepuisTrimestre(pratique, srcId)');
        // Plus aucun appel direct hors de la fonction du lot.
        expect(code.split('copierPratiqueDepuisTrimestre(').length - 1).toBe(2);   // sa définition, et l'appel du lot
    });

    it('`copierPratiqueDepuisTrimestre` reste synchrone et ne connaît pas les cibles (sentinelle #522)', () => {
        const copier = corps('copierPratiqueDepuisTrimestre');
        expect(code).toMatch(/\nfunction copierPratiqueDepuisTrimestre\(/);
        expect(copier).not.toMatch(/await|EnsemblesCibles|ciblesEmportees/);
    });

    it('« ← Utiliser dans ce trimestre » dépose avant l\'écriture, pour une entrée neuve que la garde d\'identité laisse passer', () => {
        const ajouter = corps('ajouterPratiqueALaSelection');
        expect(ajouter).toMatch(/EC\.aEmporte\(configSource\) && !enBase\s*&& ajouterAvecGardeIdentite\(/);
        expect(ajouter).toMatch(/configSource = await EC\.deposer\(configSource, \{ geste: 'Utiliser dans ce trimestre' \}\);\s*if \(!configSource\) return;/);
        expect(position(ajouter, 'EC.deposer(configSource')).toBeLessThan(position(ajouter, 'db.modifier(cle(\'pratiquesConfigurables\')'));
    });

    it('les exports et le partage font partir les cibles par la même fonction', () => {
        expect(corps('partagerPratiqueMateriel')).toContain('window.EnsemblesCibles.emporter(pratique)');
        expect(corps('exporterPratiquesUtilisateur')).toContain('window.EnsemblesCibles.emporter(c)');
        expect(sansCommentaires(lire('js/partage-format.js'))).toMatch(/type === 'pratique' && window\.EnsemblesCibles\) \? window\.EnsemblesCibles\.emporter\(itemPrincipal\)/);
    });

    it('ni `console.log` ni handler inline dans ce que le lot ajoute', () => {
        const voyage = sansCommentaires(lire('js/pratiques/ensembles-cibles.js'));
        for (const texte of [voyage, corps('garderPratiqueDansBibliotheque'), corps('importerPratiqueDepuisTrimestre')]) {
            expect(texte).not.toMatch(/console\.log/);
            expect(texte).not.toMatch(/\son[a-z]+\s*=\s*["'`]/);
        }
    });
});

/*
 * BREAK-TESTS — joués le 21 nov. 2026 (chaque mutation posée seule dans le code réel, le rouge relevé, le fichier remis ;
 * `git status` relu après : aucun reste). « Banc » = tests/integration/pratique-std-voyage.spec.js, sous Chrome.
 *
 * BT1 (V3) `deposer` : l'ensemble recréé reprend l'identité de la source au lieu d'une identité neuve.
 *      ROUGE (2) : « identité neuve, mêmes cibles… » ; « un ensemble déjà présent sous l'identité de la source n'est pas réécrit… ».
 *      Banc, ROUGE (3) : le voyage par la bibliothèque, l'import d'un autre trimestre, l'ensemble déjà présent.
 * BT2b (V4) `deposer` : l'échelle est écrite même quand le trimestre l'a déjà.
 *      ROUGE (1) : « présente : rien n'y est écrit, même retouchée ou retirée de la barre ».
 * BT3 (V2) `emporter` : les inscriptions du trimestre ajoutées au bagage.
 *      ROUGE (2) : « le bagage ne porte que des définitions… » ; « le texte du voyage ne nomme aucune donnée d'étudiant·e ».
 * BT4 (V1) `emporter` : le bagage posé sur la pratique reçue, sans copie.
 *      ROUGE (1) : « les cibles, leurs critères et essentiels… » (la pratique reçue est mutée).
 * BT5 (V3) `deposer` : le bagage laissé dans la configuration à l'arrivée.
 *      ROUGE (1) : « identité neuve… ». Banc, ROUGE (2).
 * BT6 (V6) `emporter` : la garde de famille retirée (toute pratique traitée comme « Par standards »).
 *      ROUGE (3) : « emporter rend l'objet reçu ; deposer… n'écrit rien » et deux essais de V1.
 * BT7 (V5) `deposer` : le cours gardé même inconnu.
 *      ROUGE (1) : « le cours… un cours inconnu ici n'est pas nommé ».
 * BT8 (V1) `echelleQuiVoyage` : le verrou et la place dans la barre partent avec l'échelle.
 *      ROUGE (1) : « les cibles, leurs critères et essentiels… ». (D'abord VERT : l'essai ne lisait pas le bagage ; durci.)
 * BT9 (V7) `ajouterPratiqueALaBibliotheque` : le réglage des jetons n'est plus gardé en source locale.
 *      ROUGE (1) : « source locale : `jetons` et le bagage… ». Banc, ROUGE (2).
 * BT9b (V7) la même ligne, sans la condition de source locale (les jetons d'un fichier reçu passeraient aussi).
 *      ROUGE (1) : le même essai (sa seconde moitié).
 * BT10 (V8) `preparerDonneesBibliothequePratiques` : le bouton réservé aux pratiques « Par standards ».
 *      ROUGE (1) : « le bouton sur chaque rangée… sans condition de famille ». Banc, ROUGE (2).
 * BT11 (V8) `importerUnePratiqueTrimestre` : retour à l'appel direct de `copierPratiqueDepuisTrimestre`.
 *      ROUGE (1) : « les deux imports d'un autre trimestre… ». Banc, ROUGE (1) : « Importer depuis un autre trimestre… ».
 * BT12 (V8) `ajouterPratiqueALaSelection` : le dépôt retiré.
 *      ROUGE (1) : « ← Utiliser dans ce trimestre dépose avant l'écriture… ». (D'abord VERT : l'essai ne jugeait que l'ordre ; durci.)
 *      Banc, ROUGE (1) : le voyage par la bibliothèque.
 * BT13 (V8) `partagerPratiqueMateriel` : l'export JSON sans `emporter`.
 *      ROUGE (1) : « les exports et le partage… ». Banc, ROUGE (1) : « Exporter (JSON)… ».
 * BT14 (V3) `deposer` : l'échec d'écriture de l'ensemble ignoré.
 *      ROUGE (1) : « une écriture refusée : null… ». (D'abord VERT : l'échelle échouait avant ; un second cas ajouté.)
 * BT15 (V8) `garderPratiqueDansBibliotheque` : la pratique gardée sans `emporter`.
 *      ROUGE (1) : « garder : la pratique du trimestre, emportée… ». Banc, ROUGE (1).
 * NON JOUABLE EN UNITAIRE : la relecture de l'échelle DANS la file (une course entre deux arrivées) ; la garde avant la
 *      file (BT2b) est celle qui est jugée.
 */

/* ------------------------------------------------------------------ Complément du 21 nov. 2026, 22 h (mandat de Cowork, 21 h) */
/*
 * V9   l'échelle : une IDENTIQUE déjà là sert (même identité, même nom, ou une copie déjà importée) ; une DIFFÉRENTE
 *      qui porte la même identité n'est ni réécrite ni employée : l'échelle reçue arrive en copie, sous une identité
 *      neuve et le nom suivi de « (importée) », et la pratique la nomme ;
 * V10  un partage .lcz nomme une identité d'échelle préfixée : à l'arrivée, la pratique nomme celle qui sert ;
 * V11  une « Par standards » sans bagage et sans ensemble dans le trimestre : `arriveSansCibles`, et ses mots.
 * Break-tests du complément : journal BT16 à BT20, en fin de fichier.
 */
const AUTRE = () => Object.assign(clone(ECHELLE), { niveaux: clone(ECHELLE.niveaux).map(n => (n.code === '1' ? Object.assign(n, { valeurCalcul: 40 }) : n)) });

describe('V9 · l\'échelle à l\'arrivée : identique, elle sert ; différente, une copie', () => {
    it('même identité, niveaux DIFFÉRENTS : l\'échelle en place n\'est ni réécrite ni employée ; une copie « (importée) » arrive et la pratique la nomme', async () => {
        const enPlace = AUTRE();
        const { EC, store } = monter({ act_echellesTemplates: [clone(enPlace)] });
        const arrivee = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_echellesTemplates).toHaveLength(2);
        expect(store.act_echellesTemplates[0]).toEqual(enPlace);
        const copie = store.act_echellesTemplates[1];
        expect(copie.id).not.toBe(ECHELLE.id);
        expect(copie.id).toMatch(/^ECH_/);
        expect(copie.nom).toBe('Échelle du voyage (importée)');
        expect(copie.niveaux).toEqual(ECHELLE.niveaux);
        expect(copie.verrouille).toBe(false);
        expect(arrivee.configuration.echelleId).toBe(copie.id);
        expect(arrivee.configuration.niveauSansDonnee).toBe('0');
    });

    it('un second dépôt retrouve la copie déjà importée : aucune troisième échelle', async () => {
        const { EC, store } = monter({ act_echellesTemplates: [AUTRE()] });
        const un = await EC.deposer(EC.emporter(clone(STD), 'src'));
        const deux = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_echellesTemplates).toHaveLength(2);
        expect(deux.configuration.echelleId).toBe(un.configuration.echelleId);
        expect(store.act_ensemblesCibles).toHaveLength(2);   // chaque pratique garde son propre ensemble
    });

    it('une autre identité, le même nom et les mêmes niveaux : elle sert, rien n\'est écrit aux échelles', async () => {
        const jumelle = Object.assign(clone(ECHELLE), { id: 'ECH-locale', verrouille: false });
        const { EC, store, journal } = monter({ act_echellesTemplates: [clone(jumelle)] });
        const arrivee = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_echellesTemplates).toEqual([jumelle]);
        expect(cles(journal)).toEqual(['act_ensemblesCibles']);
        expect(arrivee.configuration.echelleId).toBe('ECH-locale');
    });

    it('le même nom, des niveaux différents, une autre identité : ce n\'est pas elle ; l\'échelle reçue arrive sous son identité', async () => {
        const homonyme = Object.assign(AUTRE(), { id: 'ECH-homonyme' });
        const { EC, store } = monter({ act_echellesTemplates: [clone(homonyme)] });
        const arrivee = await EC.deposer(EC.emporter(clone(STD), 'src'));
        expect(store.act_echellesTemplates.map(e => e.id)).toEqual(['ECH-homonyme', ECHELLE.id]);
        expect(arrivee.configuration.echelleId).toBe(ECHELLE.id);
    });

    it('`memesNiveaux` : les codes, les noms, les valeurs ponctuelles et les bornes ; ni le nom de l\'échelle ni ses états locaux', () => {
        const { EC } = monter();
        expect(EC.memesNiveaux(ECHELLE, Object.assign(clone(ECHELLE), { nom: 'Autre nom', verrouille: false, id: 'x' }))).toBe(true);
        for (const [champ, valeur] of [['code', '9'], ['nom', 'Autre'], ['valeurCalcul', 26], ['min', 13], ['max', 38]]) {
            const e = clone(ECHELLE);
            e.niveaux[1][champ] = valeur;
            expect(EC.memesNiveaux(ECHELLE, e), champ).toBe(false);
        }
        expect(EC.memesNiveaux(ECHELLE, Object.assign(clone(ECHELLE), { niveaux: ECHELLE.niveaux.slice(0, 2) }))).toBe(false);
    });
});

describe('V10 · un partage .lcz : la pratique nomme l\'échelle qui sert, pas l\'identité préfixée du paquet', () => {
    const recue = () => {
        const { EC } = monter();
        const p = EC.emporter(clone(STD), 'src');
        p.configuration.echelleId = 'PARTAGE_abc_' + ECHELLE.id;   // ce que fait `prefixerEntites` à la réception
        return p;
    };
    it('trimestre vide : l\'échelle du bagage est recréée sous son identité, et nommée', async () => {
        const { EC, store } = monter();
        const arrivee = await EC.deposer(recue());
        expect(store.act_echellesTemplates.map(e => e.id)).toEqual([ECHELLE.id]);
        expect(arrivee.configuration.echelleId).toBe(ECHELLE.id);
        expect(arrivee.configuration).not.toHaveProperty('ciblesEmportees');
        expect(store.act_ensemblesCibles[0].id).toBe(arrivee.configuration.ensembleCiblesId);
    });
    it('l\'échelle identique est déjà là : elle sert, et la pratique la nomme', async () => {
        const { EC, store } = monter({ act_echellesTemplates: [clone(ECHELLE)] });
        const arrivee = await EC.deposer(recue());
        expect(store.act_echellesTemplates).toHaveLength(1);
        expect(arrivee.configuration.echelleId).toBe(ECHELLE.id);
    });
});

describe('V11 · une « Par standards » qui arrive sans ses cibles se reconnaît, et se dit', () => {
    it('sans bagage, et son ensemble absent du trimestre actif : oui', () => {
        const { EC } = monter();
        expect(EC.arriveSansCibles(clone(STD))).toBe(true);
    });
    it('avec son bagage, ou avec son ensemble dans le trimestre actif, ou d\'une autre famille : non', () => {
        const { EC } = monter({ act_ensemblesCibles: [clone(ENSEMBLE)] });
        expect(EC.arriveSansCibles(clone(STD))).toBe(false);
        const vide = monter();
        expect(vide.EC.arriveSansCibles(vide.EC.emporter(clone(STD), 'src'))).toBe(false);
        expect(vide.EC.arriveSansCibles(clone(SOM))).toBe(false);
        expect(vide.EC.arriveSansCibles(null)).toBe(false);
    });
    it('les mots de l\'avis nomment la pratique et renvoient à l\'assistant', () => {
        const { EC } = monter();
        const avis = EC.avisSansCibles('Par standards fictive');
        expect(avis.titre).toBe('« Par standards fictive » arrive sans ses cibles.');
        expect(avis.detail).toBe('Ce fichier ne les contient pas. Rouvre la pratique dans l\'assistant pour les dire.');
    });
});

describe('V12 · les portes par fichier déposent ou disent (lu dans le code ; joué au banc)', () => {
    const gestion = sansCommentaires(readFileSync(path.join(RACINE, 'js/pratiques-gestion.js'), 'utf8'));
    const partage = sansCommentaires(readFileSync(path.join(RACINE, 'js/partage-section.js'), 'utf8'));
    it('« Dupliquer » un partage : une pratique qui emporte passe par le dépôt, jamais par l\'écriture directe', () => {
        expect(partage).toMatch(/if \(partagee && EC\.aEmporte\(partagee\)\) \{\s*return partageSection\.dupliquerPratiqueAvecCibles\(partagee\)/);
        expect(partage).toMatch(/window\.EnsemblesCibles\.deposer\(copie, \{ geste: 'Dupliquer' \}\)\.then\(function \(prete\) \{\s*if \(!prete\) return null;\s*ajouterACollection\(window\.cle\('pratiquesConfigurables'\), prete\)/);
    });
    it('le fichier « Exporter (JSON) » d\'une seule pratique a un lecteur', () => {
        expect(gestion).toMatch(/if \(donnees\.type === 'configuration-pratique' && une && typeof une === 'object' && !Array\.isArray\(une\)\) return \[une\];/);
        expect(gestion).toMatch(/let pratiquesImportees = pratiquesDuFichier\(donnees\);/);
    });
    it('l\'import d\'un fichier et « Utiliser dans ce trimestre » disent une arrivée sans cibles', () => {
        expect(gestion).toMatch(/pratiquesImportees\.forEach\(direArriveeSansCibles\);/);
        expect(gestion).toMatch(/direArriveeSansCibles\(verifPratiques\.find\(p => p\.id === pratiqueId\)\);/);
        expect(gestion).toMatch(/if \(!EC \|\| !pratique \|\| !EC\.arriveSansCibles\(pratique\)\) return;\s*const avis = EC\.avisSansCibles\(pratique\.nom\);\s*notifications\.info\(avis\.titre, avis\.detail\);/);
        expect(partage).toMatch(/EC\.arriveSansCibles\(partagee\)/);
    });
});

/*
 * JOURNAL DES BREAK-TESTS DU COMPLÉMENT (joués un à un le 21 nov. 2026, chacun rétabli avant le suivant)
 * Voir la fin du rapport (plans de travail/RAPPORT-2026-11-21-pratique-std-voyage.md, « Complément »).
 */
/*
 * BT16 (V9) `choisirEchelle` : une échelle de même identité sert, quels que soient ses niveaux (la règle d'avant).
 *      ROUGE (3) : « même identité, niveaux DIFFÉRENTS… », « un second dépôt… », « une autre identité, le même nom… ».
 *      Banc, ROUGE (1) : « une échelle DIFFÉRENTE porte déjà la même identité… ».
 * BT17 (V10) `deposer` : la pratique ne nomme plus l'échelle qui sert.
 *      ROUGE (4) : deux essais de V9, les deux de V10. Banc, ROUGE (2) : le partage .lcz, l'échelle différente.
 * BT18 (V12) `partageSection.dupliquer` : le dépôt contourné.
 *      ROUGE (1) : « Dupliquer un partage… ». Banc, ROUGE (1) : le partage .lcz.
 * BT19 (V12) `pratiquesDuFichier` : le lecteur du fichier d'une seule pratique retiré.
 *      ROUGE (1) : « le fichier Exporter (JSON) d'une seule pratique a un lecteur ». Banc, ROUGE (2) : « Exporter
 *      (JSON) », l'ancien fichier.
 * BT20 (V11) `confirmerImportPratiques` : l'avis d'une arrivée sans cibles retiré.
 *      ROUGE (1) : « l'import d'un fichier et Utiliser… ». Banc, ROUGE (1) : l'ancien fichier.
 * BT21 (V11) `ajouterPratiqueALaSelection` : l'avis retiré.
 *      ROUGE (1) : le même. Banc, ROUGE (1) : l'ancien fichier.
 * (BT19 à BT21 rejoués après le découpage en `pratiquesDuFichier` et `direArriveeSansCibles`.)
 */
