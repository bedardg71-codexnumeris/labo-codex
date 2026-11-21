/**
 * SENTINELLE (21 nov. 2026) — LA PRATIQUE « PAR STANDARDS », LOTS 3 ET 4 : LE NIVEAU RETENU PAR CIBLE, PUIS LA NOTE.
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (décisions du mandat du 21 nov. en tête ; § 4, § 5,
 * lots 3 et 4). Rapport : plans de travail/RAPPORT-2026-11-21-moteur-cibles-3-4.md.
 *
 * Une section par règle du mandat, sur les modules RÉELS (`note-cibles.js`, `inscriptions-cibles.js`,
 * `ensembles-cibles.js`, `tableau-cibles.js`, `profil-cibles.js`, `pratique-configurable.js` et le registre), l'ordre des
 * niveaux et la valeur ponctuelle tirés du code réel (`_helpers/moteur-cibles.js`) :
 *   R1  le meilleur niveau parmi les inscriptions non annulées qui portent un niveau ; il ne redescend jamais ;
 *   R2  seule une annulation le fait baisser ;
 *   R3  une remarque n'y entre jamais ; une cible sans donnée porte le NOM du niveau « sans donnée » ;
 *   R4  au tableau : la case montre le niveau retenu et le compte ; la légende le dit ; l'historique dit, en clair, que le
 *       dernier niveau inscrit est plus bas ;
 *   R5  au profil : une ligne par cible (retenu, date, origine, rétroaction), puis toutes les inscriptions, barrées comprises ;
 *   R6  l'ordre par `ordonnerNiveauxParPlage`, seule source ; ordre illisible : rien de retenu, le motif en clair ; un code
 *       absent de l'échelle n'est pas lu ;
 *   R7  la note : la moyenne pondérée des valeurs ponctuelles ;
 *   R8  le double seuil : éteint d'office ; allumé, plafond si la moyenne des terminales est INFÉRIEURE au seuil ; sans
 *       terminale, il ne joue pas ;
 *   R9  pendant la session : aucune note tant qu'une cible est sans donnée ; les cibles en attente, nommées ;
 *   R10 à l'arrêt des notes (« Notes finalisées ») : une cible sans donnée compte pour 0 % ;
 *   R11 le niveau « sans donnée » inscrit se traite comme une cible sans inscription ;
 *   R12 une valeur ponctuelle manquante : « non calculable », son motif, jamais un chiffre ; le récit du profil ;
 *   R13 les lecteurs : la note de la pratique est celle du tableau et du profil ; null, jamais 0 ; le sens inverse (ni
 *       évaluations, ni `indicesCP`, ni productions lus) ; aucune écriture ;
 *   R14 le formulaire des productions n'exige aucune pondération en « Par standards » ;
 *   R15 les coches ne sont lues par aucun calcul ; une reprise n'est jamais plafonnée.
 * La garde du lot 0 (non-ingérence, cliquet) est rejouée à part : `sentinelle-moteur-cibles-0-garde.test.js`.
 *
 * Données fictives (Zoé Fictive, Yan Inventé, Léa Imaginaire). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const ZOE = '2100001';
const YAN = '2100002';
const LEA = '2100003';
const ENS = 'ENS1';
const ECHELLE = { id: 'ECH-banc', nom: 'Échelle du banc', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 12.49, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 12.5, max: 37.49, valeurCalcul: 25 },
    { code: '2', nom: 'Ça y est presque', min: 37.5, max: 62.49, valeurCalcul: 50 }, { code: '3', nom: 'Acquis', min: 62.5, max: 87.49, valeurCalcul: 75 },
    { code: '4', nom: 'Avancé', min: 87.5, max: 100, valeurCalcul: 100 }] };
const CIBLES = [
    { id: 'cib-a', etiquette: 'Analyser', enonce: 'Analyser un texte.', poids: 1, terminale: false, criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true }] },
    { id: 'cib-b', etiquette: 'Structurer', enonce: 'Organiser un propos.', poids: 1, terminale: false, criteres: [] },
    { id: 'cib-c', etiquette: 'Dissertation', enonce: 'Rédiger une dissertation.', poids: 2, terminale: true, criteres: [] }];
const CONF = { type: 'cibles', ensembleCiblesId: ENS, echelleId: ECHELLE.id, niveauSansDonnee: '0' };

let n = 0;
const I = (da, cibleId, niveau, date, extra) => Object.assign({ id: 'I' + (++n), type: 'inscription', da, ensembleId: ENS, cibleId, niveau,
    echelleId: niveau === null ? null : ECHELLE.id, date, horodatage: date + 'T12:00:00.000Z', productionId: null,
    noteBreve: niveau === null ? 'une remarque' : '', criteres: [] }, extra || {});
const A = (inscription, date = '2026-11-15', raison = '') => ({ id: 'A' + (++n), type: 'annulation', inscriptionId: inscription.id, da: inscription.da,
    ensembleId: ENS, cibleId: inscription.cibleId, date, horodatage: date + 'T13:00:00.000Z', raison });

/* ================================================================ Le moteur, sur un magasin témoin (lectures et écritures consignées) */
function monter({ inscriptions = [], cibles = CIBLES, echelle = ECHELLE, conf = CONF, autres = {} } = {}) {
    const store = Object.assign({ test_ensemblesCibles: [{ id: ENS, coursId: null, cibles: clone(cibles) }], test_echellesTemplates: [clone(echelle)],
        test_inscriptionsCibles: clone(inscriptions) }, autres);
    const lues = [];
    const ecrites = [];
    const db = { getSync: (k, d) => { lues.push(k); return k in store ? clone(store[k]) : (d !== undefined ? d : null); },
        setSync: (k) => { ecrites.push(k); }, get: async () => null, set: async (k) => { ecrites.push(k); } };
    const win = { echapperHtml };
    const globaux = { db, cle: (k) => 'test_' + k, echapperHtml, ...fonctionsDeLEchelle(),
        obtenirEchelleResolue: (id) => clone((store.test_echellesTemplates || []).find(e => e.id === id) || null) };
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/pratiques/note-cibles.js', globaux, win);
    return { win, NC: win.NoteCibles, store, lues, ecrites, globaux, eleve: (da, c = conf) => win.NoteCibles.lireEleve(c, da) };
}
const ligne = (eleve, cibleId) => eleve.retenue.lignes.find(l => l.cible.id === cibleId);

/* ================================================================ R1 — le meilleur, qui ne redescend jamais */
describe('R1 · le niveau retenu est le meilleur niveau inscrit ; il ne redescend jamais', () => {
    it('« Avancé » le 1er oct., puis « Ça y est presque » le 10 nov. : le retenu reste « Avancé »', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-a', '2', '2026-11-10')] });
        const l = ligne(m.eleve(ZOE), 'cib-a');
        expect(l.retenu.niveau).toBe('4');
        expect(l.niveau.nom).toBe('Avancé');
        expect(l.dernierPlusBas, 'le dernier niveau inscrit est plus bas').toBe(true);
        expect(l.dernier.niveau).toBe('2');
    });
    it('un niveau plus haut inscrit plus tard devient le retenu ; l\'ordre d\'écriture n\'y fait rien', () => {
        const a = I(ZOE, 'cib-a', '2', '2026-10-01');
        const b = I(ZOE, 'cib-a', '3', '2026-11-10');
        expect(ligne(monter({ inscriptions: [a, b] }).eleve(ZOE), 'cib-a').retenu.niveau).toBe('3');
        expect(ligne(monter({ inscriptions: [b, a] }).eleve(ZOE), 'cib-a').retenu.niveau).toBe('3');
    });
    it('deux inscriptions du même meilleur niveau : la première qui l\'a démontré est retenue (sa date, son origine)', () => {
        const premiere = I(ZOE, 'cib-a', '3', '2026-10-01', { productionId: 'P1', noteBreve: 'première trace' });
        const seconde = I(ZOE, 'cib-a', '3', '2026-11-01', { productionId: 'P2' });
        expect(ligne(monter({ inscriptions: [seconde, premiere] }).eleve(ZOE), 'cib-a').retenu.id).toBe(premiere.id);
    });
});

/* ================================================================ R2 — seule une annulation le fait baisser */
describe('R2 · seule une annulation peut faire baisser le niveau retenu', () => {
    it('« Avancé » annulé (trace invalidée) : le retenu redescend au meilleur des autres ; l\'inscription annulée reste dans l\'historique', () => {
        const haut = I(ZOE, 'cib-a', '4', '2026-10-01');
        const m = monter({ inscriptions: [haut, I(ZOE, 'cib-a', '2', '2026-10-05'), I(ZOE, 'cib-a', '1', '2026-11-01'), A(haut, '2026-11-02', 'copie d\'un pair')] });
        const l = ligne(m.eleve(ZOE), 'cib-a');
        expect(l.retenu.niveau).toBe('2');
        expect(l.annulees).toBe(1);
        expect(l.historique.find(x => x.inscription.id === haut.id).annulation.raison).toBe('copie d\'un pair');
    });
    it('sans annulation, un niveau plus bas ne fait rien baisser', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-a', '1', '2026-11-01'), I(ZOE, 'cib-a', '0', '2026-11-20')] });
        expect(ligne(m.eleve(ZOE), 'cib-a').retenu.niveau).toBe('4');
    });
});

/* ================================================================ R3 — une remarque n'y entre jamais ; « sans donnée » a un nom */
describe('R3 · une remarque n\'entre jamais au niveau retenu ; une cible sans donnée porte le nom du niveau « sans donnée »', () => {
    it('une cible qui n\'a que des remarques est sans donnée ; une remarque plus récente ne change pas un retenu', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', null, '2026-10-01'), I(ZOE, 'cib-a', null, '2026-10-02'),
            I(ZOE, 'cib-b', '3', '2026-10-01'), I(ZOE, 'cib-b', null, '2026-11-10')] });
        const e = m.eleve(ZOE);
        expect(ligne(e, 'cib-a')).toMatchObject({ retenu: null, sansDonnee: true, remarques: 2, actives: 2 });
        expect(ligne(e, 'cib-b').retenu.niveau).toBe('3');
        expect(ligne(e, 'cib-c')).toMatchObject({ retenu: null, sansDonnee: true, actives: 0 });
        expect(m.NC.nomSansDonnee(e)).toBe('Données insuffisantes');
    });
    it('au tableau : la case d\'une cible sans donnée porte le nom du niveau « sans donnée », ni vide ni zéro', () => {
        const e = monterEcran({ inscriptions: [I(ZOE, 'cib-a', null, '2026-10-01')] });
        const avecRemarque = e.hote.querySelector(`.tc-case[data-da="${ZOE}"][data-cible="cib-a"]`);
        const vide = e.hote.querySelector(`.tc-case[data-da="${YAN}"][data-cible="cib-a"]`);
        expect(vide.textContent).toBe('Données insuffisantes');
        expect(avecRemarque.textContent).toBe('✎Données insuffisantes1');
        for (const b of [vide, avecRemarque]) expect(b.querySelector('.tc-case-niveau'), 'aucun code de niveau').toBeNull();
    });
});

/* ================================================================ L'écran (tableau-cibles.js, profil-cibles.js), dans un vrai DOM */
function monterEcran({ inscriptions = [], cibles = CIBLES, echelle = ECHELLE, conf = CONF, productions = [] } = {}) {
    const dom = new JSDOM('<!doctype html><body><div id="hote"></div></body>');
    const doc = dom.window.document;
    const m = monter({ inscriptions, cibles, echelle, conf });
    const win = m.win;
    const etudiants = [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé' }, { da: YAN, nom: 'Inventé', prenom: 'Yan' }, { da: LEA, nom: 'Imaginaire', prenom: 'Léa' }];
    const designation = { etat: 'ok', id: 'cib-banc', donnees: { id: 'cib-banc', nom: 'Par standards du banc', configuration: clone(conf) } };
    const globaux = Object.assign({}, m.globaux, { document: doc, Event: dom.window.Event, CSS: { escape: (s) => String(s).replace(/["\\]/g, '\\$&') },
        genererBadgePratiqueHTML: () => '<span class="badge-type-pratique">STD</span>',
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : (k === 'groupeEtudiants' ? etudiants : [])) });
    win.TableauNotation = { MOTS: { reglages: 'Réglages de la pratique', aucunEleve: 'Aucun·e étudiant·e.' },
        couleurSure: (c) => (c || 'var(--accent-primaire)'), rafraichirSiAffiche() {} };
    win.designerPratiqueActive = () => clone(designation);
    win.arrondirIndiceSurCent = (d) => Math.round(Math.round(d * 100 * 1e6) / 1e6);   // portfolio.js, même règle
    chargerScript('js/tableau-cibles.js', globaux, win);
    chargerScript('js/profil-cibles.js', globaux, win);
    const ctx = { etat: 'cibles', pratiqueId: 'cib-banc', pratiqueNom: 'Par standards du banc', donnees: designation.donnees, etudiants, productions };
    const hote = doc.getElementById('hote');
    hote.innerHTML = win.TableauCibles.construireHTML(ctx);
    win.TableauCibles.apresRendu(hote, ctx);
    return Object.assign(m, { TC: win.TableauCibles, PC: win.ProfilCibles, doc, hote, ctx });
}
const caseDe = (e, da, cibleId) => e.hote.querySelector(`.tc-case[data-da="${da}"][data-cible="${cibleId}"]`);
const rangeeDe = (e, nom) => [...e.hote.querySelectorAll('tbody tr')].find(tr => tr.querySelector('.tn-eleve').textContent === nom);

/* ================================================================ R4 — le tableau */
describe('R4 · au tableau, la case montre le niveau retenu et le compte ; l\'historique dit le dernier plus bas, en clair', () => {
    const INSC = () => [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-a', '2', '2026-11-10'), I(ZOE, 'cib-a', null, '2026-11-12')];
    it('la case dit 4 (pas 2), et 3 inscriptions ; son libellé lu dit « niveau retenu » ; la légende le dit', () => {
        const e = monterEcran({ inscriptions: INSC() });
        const b = caseDe(e, ZOE, 'cib-a');
        expect(b.querySelector('.tc-case-niveau').textContent).toBe('4');
        expect(b.querySelector('.tc-case-compte').textContent).toBe('3');
        expect(b.getAttribute('aria-label')).toBe('Zoé Fictive, Analyser : niveau retenu Avancé, 3 inscriptions, dont 1 remarque');
        const legendes = [...e.hote.querySelectorAll('.tc-legende')].map(x => x.textContent);
        expect(legendes).toContain(e.TC.MOTS.legende);
        expect(e.TC.MOTS.legende).toMatch(/niveau retenu/);
        expect(legendes.join(' ')).not.toMatch(/dernier niveau inscrit/);
    });
    it('la fenêtre de la case : « Niveau retenu » en clair, la phrase du dernier niveau plus bas dans le texte (pas dans une bulle), l\'entrée retenue marquée', () => {
        const e = monterEcran({ inscriptions: INSC() });
        e.TC.ouvrirInscription(ZOE, 'cib-a', null);
        const f = e.doc.querySelector('.tc-fenetre');
        expect(f.querySelector('.tc-retenu').textContent).toContain('Niveau retenu : 4 · Avancé, inscrit le');
        const plusBas = f.querySelector('.tc-retenu-plus-bas');
        expect(plusBas.textContent).toMatch(/^Le dernier niveau inscrit, 2 · Ça y est presque \(le .+\), est plus bas : le niveau retenu ne redescend pas\.$/);
        expect(plusBas.closest('[title]'), 'aucune bulle').toBeNull();
        const marquees = [...f.querySelectorAll('.tc-entree')].filter(li => li.querySelector('.tc-entree-retenu'));
        expect(marquees).toHaveLength(1);
        expect(marquees[0].querySelector('.tc-entree-niveau').textContent).toBe('4 · Avancé');
    });
    it('sans dernier plus bas, aucune phrase ; une cible sans donnée le dit dans la fenêtre', () => {
        const e = monterEcran({ inscriptions: [I(ZOE, 'cib-a', '2', '2026-10-01'), I(ZOE, 'cib-a', '3', '2026-11-01')] });
        e.TC.ouvrirInscription(ZOE, 'cib-a', null);
        expect(e.doc.querySelector('.tc-retenu-plus-bas')).toBeNull();
        e.TC.fermer();
        e.TC.ouvrirInscription(ZOE, 'cib-b', null);
        expect(e.doc.querySelector('.tc-retenu').textContent).toBe('Niveau retenu : Sans donnée : « Données insuffisantes ». Aucun niveau n’est inscrit pour cette cible.');
    });
});

/* ================================================================ R5 — le profil */
describe('R5 · au profil : une ligne par cible (retenu, date, origine, rétroaction), puis toutes ses inscriptions', () => {
    it('le niveau retenu, sa date, son origine et sa rétroaction ; toutes les inscriptions, la remarque et l\'annulée (barrée) comprises ; aucun bouton d\'annulation', () => {
        const haut = I(ZOE, 'cib-a', '4', '2026-10-01', { productionId: 'P1', noteBreve: 'Très bonne analyse.' });
        const annulee = I(ZOE, 'cib-a', '3', '2026-10-20');
        const e = monterEcran({ productions: [{ id: 'P1', titre: 'Analyse 1' }],
            inscriptions: [haut, annulee, A(annulee, '2026-10-21', 'mauvaise cible'), I(ZOE, 'cib-a', null, '2026-11-05'), I(ZOE, 'cib-b', '3', '2026-10-05')] });
        expect(e.PC.estActive()).toBe(true);
        const d = new JSDOM('<!doctype html><body>' + e.PC.panneau(ZOE) + '</body>').window.document;
        const blocs = [...d.querySelectorAll('.pc-cible')];
        expect(blocs.map(b => b.querySelector('.pc-cible-titre').textContent.trim())).toEqual(['Analyser', 'Structurer', 'Dissertation Cible terminale']);
        const a = blocs[0].querySelector('.tc-retenu').textContent;
        expect(a).toContain('Niveau retenu : 4 · Avancé, inscrit le 1 octobre 2026.');
        expect(a).toContain('Production : Analyse 1');
        expect(a).toContain('Rétroaction : Très bonne analyse.');
        const entrees = [...blocs[0].querySelectorAll('.tc-entree')];
        expect(entrees).toHaveLength(3);
        expect(entrees.filter(li => li.classList.contains('tc-entree--annulee'))).toHaveLength(1);
        expect(blocs[0].textContent).toContain('Annulée le 21 octobre 2026 : mauvaise cible');
        expect(blocs[0].textContent).toContain('Remarque, sans niveau');
        expect(d.querySelectorAll('[data-tc="annuler"]'), 'le profil se lit ; on annule au tableau').toHaveLength(0);
        expect(blocs[2].querySelector('.tc-retenu').textContent).toContain('Sans donnée : « Données insuffisantes »');
    });
    it('hors d\'une pratique par standards, la section ne se montre pas', () => {
        const e = monterEcran();
        e.win.designerPratiqueActive = () => ({ etat: 'ok', id: 'som', donnees: { configuration: { type: 'sommative' } } });
        expect(e.PC.estActive()).toBe(false);
        expect(e.PC.panneau(ZOE)).toBe('');
    });
});

/* ================================================================ R6 — l'ordre de l'échelle */
describe('R6 · l\'ordre vient de `ordonnerNiveauxParPlage` ; ordre illisible : rien de retenu, le motif en clair ; un code étranger n\'est pas lu', () => {
    // Des codes dont l'ordre alphabétique contredit celui des plages : D (le plus haut) < I (le plus bas) < M.
    const LETTRES = { id: 'ECH-L', nom: 'Lettres', niveaux: [
        { code: 'M', nom: 'Maîtrise', min: 65, max: 84, valeurCalcul: 75 }, { code: 'D', nom: 'Distinction', min: 85, max: 100, valeurCalcul: 95 },
        { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 0 }] };
    const conf = Object.assign({}, CONF, { echelleId: 'ECH-L', niveauSansDonnee: 'I' });
    it('« D » l\'emporte sur « M » parce que sa plage est plus haute, pas par son code ni par l\'ordre de saisie', () => {
        const m = monter({ echelle: LETTRES, conf, inscriptions: [I(ZOE, 'cib-a', 'D', '2026-10-01'), I(ZOE, 'cib-a', 'M', '2026-11-01')] });
        expect(ligne(m.eleve(ZOE, conf), 'cib-a').retenu.niveau).toBe('D');
    });
    it('un niveau sans borne « Min » : ordre illisible, aucun niveau retenu, le motif le nomme ; la note est « non calculable »', () => {
        const ech = clone(ECHELLE);
        ech.niveaux[3].min = '';
        const m = monter({ echelle: ech, inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01')] });
        const e = m.eleve(ZOE);
        expect(e.retenue.ordre.ok).toBe(false);
        expect(e.retenue.ordre.motif).toBe('L’ordre des niveaux est illisible : « Acquis » n’a pas de borne « Min ». '
            + 'Aucun niveau n’est retenu tant que l’échelle ne dit pas l’ordre de ses niveaux (Conception → Échelles de performance).');
        expect(e.retenue.lignes.every(l => l.retenu === null)).toBe(true);
        expect(e.note).toMatchObject({ etat: 'non-calculable', note: null, motif: e.retenue.ordre.motif });
    });
    it('deux niveaux de même plage, ou de même code : illisible aussi', () => {
        const egal = clone(ECHELLE); egal.niveaux[2].min = 62.5; egal.niveaux[2].max = 87.49;
        expect(monter({ echelle: egal }).NC.ordreDeLEchelle(egal)).toMatchObject({ ok: false });
        const double = clone(ECHELLE); double.niveaux[2].code = '3';
        expect(monter({ echelle: double }).NC.ordreDeLEchelle(double).motif).toMatch(/deux niveaux portent le code « 3 »/);
    });
    it('au tableau, ordre illisible : le motif au-dessus, une seule fois ; aucune case ne montre un niveau', () => {
        const ech = clone(ECHELLE); ech.niveaux[3].min = '';
        const e = monterEcran({ echelle: ech, inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01')] });
        expect(e.hote.querySelectorAll('.tc-ordre-illisible')).toHaveLength(1);
        expect(e.hote.querySelectorAll('.tc-case-niveau')).toHaveLength(0);
    });
    it('un code absent de l\'échelle n\'est pas lu : il ne devient pas le retenu, il est compté à part', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '2', '2026-10-01'), I(ZOE, 'cib-a', 'Z', '2026-11-01'), I(ZOE, 'cib-b', 'Z', '2026-11-01')] });
        const e = m.eleve(ZOE);
        expect(ligne(e, 'cib-a')).toMatchObject({ horsEchelle: 1 });
        expect(ligne(e, 'cib-a').retenu.niveau).toBe('2');
        expect(ligne(e, 'cib-b')).toMatchObject({ retenu: null, sansDonnee: true, horsEchelle: 1 });
    });
    it('le moteur ne range pas les niveaux lui-même : il appelle la seule source', () => {
        const src = lire('js/pratiques/note-cibles.js');
        expect(src).toContain('ordonnerNiveauxParPlage(niveaux)');
        expect(src).not.toMatch(/\.sort\([^)]*\.min\b/);
    });
});

/* ================================================================ R7 — la moyenne pondérée */
describe('R7 · la note est la moyenne pondérée des valeurs ponctuelles des niveaux retenus', () => {
    it('4, 3, 3 aux poids 1, 1, 2 : (100 + 75 + 2 × 75) ÷ 4 = 81,25', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '3', '2026-10-01'), I(ZOE, 'cib-c', '3', '2026-10-01')] });
        const n0 = m.eleve(ZOE).note;
        expect(n0).toMatchObject({ etat: 'note', note: 81.25, moyenne: 81.25 });
        expect(n0.lignes.map(l => [l.cible.id, l.valeur, l.poids, l.part])).toEqual([['cib-a', 100, 1, 25], ['cib-b', 75, 1, 25], ['cib-c', 75, 2, 50]]);
    });
    it('la valeur PONCTUELLE, jamais le milieu de la plage', () => {
        const ech = clone(ECHELLE); ech.niveaux[3].valeurCalcul = 70;   // « Acquis » : plage 62,5 à 87,49, valeur 70
        const m = monter({ echelle: ech, inscriptions: ['cib-a', 'cib-b', 'cib-c'].map(c => I(ZOE, c, '3', '2026-10-01')) });
        expect(m.eleve(ZOE).note.note).toBe(70);
    });
});

/* ================================================================ R8 — le double seuil */
describe('R8 · le double seuil : un réglage éteint d\'office ; allumé, il plafonne si la moyenne des terminales est INFÉRIEURE au seuil', () => {
    const INSC = (terminale) => [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '4', '2026-10-01'), I(ZOE, 'cib-c', terminale, '2026-10-01')];
    const ALLUME = Object.assign({}, CONF, { doubleSeuil: { actif: true, seuil: 60, plafond: 55 } });
    it('éteint d\'office (60 et 55 d\'office) : la terminale à 25 ne plafonne rien', () => {
        const m = monter({ inscriptions: INSC('1') });
        expect(m.NC.lireDoubleSeuil(CONF)).toEqual({ actif: false, seuil: 60, plafond: 55 });
        expect(m.eleve(ZOE).note).toMatchObject({ etat: 'note', note: 62.5, plafonnement: null });
    });
    it('allumé : la moyenne des terminales (25) est sous 60 : la note est plafonnée à 55 (la moyenne était 62,5)', () => {
        const n1 = monter({ inscriptions: INSC('1') }).eleve(ZOE, ALLUME).note;
        expect(n1).toMatchObject({ etat: 'note', note: 55, moyenne: 62.5 });
        expect(n1.plafonnement).toMatchObject({ seuil: 60, plafond: 55, moyenneTerminales: 25, sousLeSeuil: true, applique: true });
    });
    it('« inférieure » est strict : une moyenne des terminales de 60 pile n\'est pas plafonnée', () => {
        const ech = clone(ECHELLE); ech.niveaux[2].valeurCalcul = 60;
        const n2 = monter({ echelle: ech, inscriptions: [I(ZOE, 'cib-a', '1', '2026-10-01'), I(ZOE, 'cib-b', '1', '2026-10-01'), I(ZOE, 'cib-c', '2', '2026-10-01')] }).eleve(ZOE, ALLUME).note;
        expect(n2.terminales.moyenne).toBe(60);
        expect(n2.plafonnement.sousLeSeuil).toBe(false);
        expect(n2.note).toBe(n2.moyenne);
    });
    it('sans aucune cible terminale, il ne joue pas, même allumé ; l\'écran a de quoi dire pourquoi', () => {
        const sansTerminale = CIBLES.map(c => Object.assign({}, c, { terminale: false }));
        const m = monter({ cibles: sansTerminale, inscriptions: INSC('1') });
        expect(m.NC.aDesCiblesTerminales(sansTerminale)).toBe(false);
        expect(m.eleve(ZOE, ALLUME).note).toMatchObject({ note: 62.5, plafonnement: null });
        const fiche = lire('index.html');
        expect(fiche).toContain('Aucune cible n\'est terminale : le double seuil ne peut pas s\'allumer.');
        expect(lire('js/pratiques-gestion.js')).toMatch(/actif: terminales && getCheckbox\('mat-cibles-double-seuil'\)/);
    });
});

/* ================================================================ R9 — l'attente pendant la session */
describe('R9 · pendant la session, aucune note chiffrée tant qu\'une cible est sans donnée ; les cibles en attente sont nommées', () => {
    const INSC = () => [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', null, '2026-10-02')];
    it('l\'état « attente », aucune note, les deux cibles nommées dans l\'ordre de l\'ensemble', () => {
        const n3 = monter({ inscriptions: INSC() }).eleve(ZOE).note;
        expect(n3).toMatchObject({ etat: 'attente', note: null, moyenne: null });
        expect(n3.enAttente.map(c => c.etiquette)).toEqual(['Structurer', 'Dissertation']);
        expect(n3.motif).toBe('Pas encore de note : les cibles « Structurer », « Dissertation » sont sans donnée. '
            + 'La note se calcule quand chaque cible a un niveau retenu, ou à l’arrêt des notes.');
    });
    it('au tableau et au profil, les cibles en attente se lisent dans le texte, sans bulle', () => {
        const e = monterEcran({ inscriptions: INSC() });
        const cellule = rangeeDe(e, 'Zoé Fictive').querySelector('.tc-cellule-note');
        expect(cellule.textContent).toBe('En attenteStructurer, Dissertation');
        expect(cellule.textContent).not.toMatch(/\d/);
        const d = new JSDOM('<!doctype html><body>' + e.PC.panneau(ZOE) + '</body>').window.document;
        expect([...d.querySelectorAll('.pc-attente-liste li strong')].map(x => x.textContent)).toEqual(['Structurer', 'Dissertation']);
        expect(d.querySelector('.pc-note-valeur').textContent).toBe('Pas encore de note.');
    });
});

/* ================================================================ R10 — l'arrêt des notes */
describe('R10 · à l\'arrêt des notes (« Notes finalisées »), une cible sans donnée compte pour 0 %', () => {
    it('« Avancé » sur une cible, rien sur les deux autres : (100 + 0 + 0) ÷ 4 = 25', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', null, '2026-10-02')] });
        const n4 = m.eleve(ZOE, Object.assign({}, CONF, { notesFinales: true })).note;
        expect(n4).toMatchObject({ etat: 'note', note: 25, enAttente: [] });
        expect(n4.lignes.map(l => l.compte)).toEqual(['retenu', 'zero-arret', 'zero-arret']);
    });
    it('l\'arrêt des notes est la case « Notes finalisées » de la fiche (`configuration.notesFinales`), celle que lit l\'export', () => {
        expect(lire('js/pratiques-gestion.js')).toContain("configurations[index].configuration.notesFinales = getCheckbox('mat-notes-finales');");
        expect(lire('js/export-resultats-finaux.js')).toContain('cfg.notesFinales === true');
        expect(lire('js/pratiques/note-cibles.js')).toContain('const notesFinales = conf.notesFinales === true;');
    });
});

/* ================================================================ R11 — le niveau « sans donnée » inscrit */
describe('R11 · le niveau « sans donnée » inscrit explicitement se traite comme une cible sans inscription', () => {
    const INSC = () => [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '3', '2026-10-01'), I(ZOE, 'cib-c', '0', '2026-10-01')];
    it('il est bien le niveau retenu de la cible (montré comme un niveau), mais la cible reste en attente pendant la session', () => {
        const e = monter({ inscriptions: INSC() }).eleve(ZOE);
        expect(ligne(e, 'cib-c')).toMatchObject({ sansDonnee: true, sansDonneeInscrit: true });
        expect(ligne(e, 'cib-c').retenu.niveau).toBe('0');
        expect(e.note).toMatchObject({ etat: 'attente', note: null });
        expect(e.note.enAttente.map(c => c.id)).toEqual(['cib-c']);
    });
    it('à l\'arrêt des notes, elle compte pour 0 % : (100 + 75 + 0) ÷ 4 = 43,75', () => {
        const n5 = monter({ inscriptions: INSC() }).eleve(ZOE, Object.assign({}, CONF, { notesFinales: true })).note;
        expect(n5).toMatchObject({ etat: 'note', note: 43.75 });
    });
});

/* ================================================================ R12 — une valeur ponctuelle manquante */
describe('R12 · une valeur ponctuelle manquante : « non calculable », avec son motif, jamais un chiffre ; le récit du profil', () => {
    it('« Acquis » sans valeur, retenu pour une cible : non calculable, le motif nomme le niveau et la cible', () => {
        const ech = clone(ECHELLE); delete ech.niveaux[3].valeurCalcul;
        const n6 = monter({ echelle: ech, inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '3', '2026-10-01'), I(ZOE, 'cib-c', '4', '2026-10-01')] }).eleve(ZOE).note;
        expect(n6).toMatchObject({ etat: 'non-calculable', note: null, moyenne: null });
        expect(n6.motif).toBe('Note non calculable : le niveau « Acquis », retenu pour la cible « Structurer », n’a pas de valeur ponctuelle. '
            + 'Donne-lui une valeur dans Conception → Échelles de performance.');
    });
    it('le récit au profil : chaque cible, son niveau, sa valeur, son poids, sa part ; la moyenne ; le second seuil allumé et ce qu\'il fait', () => {
        const conf = Object.assign({}, CONF, { doubleSeuil: { actif: true, seuil: 60, plafond: 55 } });
        const e = monterEcran({ conf, inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '4', '2026-10-01'), I(ZOE, 'cib-c', '1', '2026-10-01')] });
        const d = new JSDOM('<!doctype html><body>' + e.PC.panneau(ZOE) + '</body>').window.document;
        const rangees = [...d.querySelectorAll('.pc-recit tbody tr')].map(tr => [...tr.children].map(x => x.textContent));
        expect(rangees).toEqual([['Analyser', '4 · Avancé', '100\u00a0%', '1', '25\u00a0%'], ['Structurer', '4 · Avancé', '100\u00a0%', '1', '25\u00a0%'],
            ['Dissertation terminale', '1 · En apprentissage', '25\u00a0%', '2', '50\u00a0%']]);
        expect(d.querySelector('.pc-note-valeur').textContent).toBe('Note actuelle 55\u00a0%');
        expect(d.querySelector('.pc-moyenne').textContent).toBe('Moyenne pondérée des niveaux retenus : 62,5\u00a0%.');
        expect(d.querySelector('.pc-seuil').textContent).toBe('Second seuil : la moyenne des cibles terminales est de 25\u00a0% (seuil : 60\u00a0%). '
            + 'Elle est inférieure au seuil : la note est plafonnée à 55\u00a0% (la moyenne était de 62,5\u00a0%).');
    });
    it('au profil, « non calculable » : le motif, aucun nombre à la place de la note', () => {
        const ech = clone(ECHELLE); delete ech.niveaux[4].valeurCalcul;
        const e = monterEcran({ echelle: ech, inscriptions: ['cib-a', 'cib-b', 'cib-c'].map(c => I(ZOE, c, '4', '2026-10-01')) });
        const d = new JSDOM('<!doctype html><body>' + e.PC.panneau(ZOE) + '</body>').window.document;
        expect(d.querySelector('.pc-note .alerte').textContent).toMatch(/^Note non calculable\. Note non calculable : le niveau « Avancé »/);
        expect(d.querySelector('.pc-note-valeur')).toBeNull();
        expect(rangeeDe(e, 'Zoé Fictive').querySelector('.tc-cellule-note .tc-note-etat').textContent).toBe('Non calculable');
    });
});

/* ================================================================ R13 — la pratique et ses lecteurs */
describe('R13 · les lecteurs : une seule note, null jamais 0, et le sens inverse', () => {
    const PRATIQUE = (conf = CONF) => ({ id: 'cib-banc', nom: 'Par standards du banc', type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true, configuration: clone(conf) });
    function monterPratique(inscriptions, conf = CONF) {
        const m = monter({ inscriptions, conf, autres: { test_pratiquesConfigurables: [PRATIQUE(conf)],
            test_evaluationsSauvegardees: [{ etudiantDA: ZOE, productionId: 'P1', noteFinale: 12, verrouillee: true }, { etudiantDA: LEA, productionId: 'P1', noteFinale: 95, verrouillee: true }],
            test_indicesCP: { [ZOE]: { actuel: { P: 99, pratique: 'cib-banc' } }, [LEA]: { actuel: { P: 88, pratique: 'cib-banc' } } },
            test_productions: [{ id: 'P1', titre: 'Analyse 1' }] } });
        const win = m.win;
        win.PratiqueManager = {};
        const globaux = Object.assign({}, m.globaux, { resoudreModeleParId: () => null, PratiqueConfigurable: function (config) { return new win.PratiqueConfigurable(config); } });
        chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
        chargerScript('js/pratiques/pratique-registre.js', globaux, win);
        return Object.assign(m, { p: win.obtenirPratiqueParId('cib-banc') });
    }
    const COMPLET = () => [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '3', '2026-10-01'), I(ZOE, 'cib-c', '3', '2026-10-01'), I(LEA, 'cib-a', '2', '2026-10-01')];
    it('calculerPerformance rend la note du moteur (0-1), le récit la même ; null pendant l\'attente — jamais 0, jamais le cache ni l\'évaluation', () => {
        const m = monterPratique(COMPLET());
        expect(m.p.calculerPerformance(ZOE)).toBe(0.8125);
        expect(m.p.decrireCalcul(ZOE).synthese.noteFinale).toBe(81.25);
        expect(m.p.decrireCalcul(ZOE).famille).toBe('CIB');
        expect(m.p.calculerPerformance(LEA), 'Léa : 95 à l\'évaluation, 88 au cache ; deux cibles en attente').toBeNull();
        expect(m.p.expliquerNoteNonConstructible(LEA)).toMatch(/^Pas encore de note : les cibles « Structurer », « Dissertation » sont sans donnée/);
        expect(m.p.decrireCalcul(LEA).synthese).toMatchObject({ noteFinale: null, etat: 'attente' });
        expect(m.p.expliquerNoteNonConstructible(ZOE)).toBeNull();
        expect(m.p.calculerPerformance(YAN)).toBeNull();
    });
    it('le sens inverse : la note lit l\'ensemble, l\'échelle et les inscriptions ; ni les évaluations, ni `indicesCP`, ni les productions ; elle n\'écrit rien', () => {
        const m = monterPratique(COMPLET());
        m.lues.length = 0;
        m.p.calculerPerformance(ZOE); m.p.decrireCalcul(LEA); m.p.expliquerNoteNonConstructible(LEA);
        expect(m.lues.filter(k => /evaluationsSauvegardees|indicesCP|productions/.test(k))).toEqual([]);
        expect(m.lues).toContain('test_inscriptionsCibles');
        expect(m.ecrites).toEqual([]);
    });
    it('la note du tableau et celle du profil sont celle de la pratique (même lecture, même arrondi que l\'indice P)', () => {
        const insc = COMPLET();
        const p = monterPratique(insc).p;
        const e = monterEcran({ inscriptions: insc });
        const attendu = Math.round(p.calculerPerformance(ZOE) * 100);
        expect(rangeeDe(e, 'Zoé Fictive').querySelector('.tc-note-valeur').textContent).toBe(`${attendu}\u00a0%`);
        const d = new JSDOM('<!doctype html><body>' + e.PC.panneau(ZOE) + '</body>').window.document;
        expect(d.querySelector('.pc-note-valeur strong').textContent).toBe('81,3\u00a0%');
    });
    it('la liste des étudiant·es écrit « — » pour une note non constructible et la sort des moyennes et des corrélations (jamais « 0 % »)', () => {
        const src = lire('js/etudiants.js');
        expect(src).toContain('const valeursP_tous = tousIndices.map(indices => (indices.noteConstructible === false ? null : indices.P));');
        expect(src).toMatch(/indices\.noteConstructible === false \? '<td class="etud-text-center">' \+ tiret \+ '<\/td>'/);
        expect(src).toContain('.filter(v => v !== null);');
        const profil = lire('js/profil-etudiant-sections-affichage.js');
        expect(profil).toContain("${sansNote ? '—' : prefixeNiveauGlobal + formaterPourcentage(indices.P)}");
    });
});

/* ================================================================ R14 — la pondération des productions */
describe('R14 · en « Par standards », le formulaire des productions n\'exige aucune pondération (trouvaille du lot 2)', () => {
    const src = lire('js/productions.js');
    const debut = src.indexOf('function raisonChampsObligatoiresProduction(d) {');
    const corps = src.substring(debut, src.indexOf('\nfunction validerChampsObligatoiresProduction', debut));
    const regle = (famille) => new Function('window', corps + '\nreturn raisonChampsObligatoiresProduction;')({ obtenirTypePratiqueActive: () => famille });
    const sansPoids = (type) => ({ titre: 'Laboratoire 4', type, ponderation: 0 });
    it('« cibles » : à 0 %, aucun type n\'est refusé — la terminale et le conteneur compris', () => {
        for (const type of ['laboratoire', 'examen', 'terminale', 'portfolio', 'artefact-portfolio']) expect(regle('cibles')(sansPoids(type)), type).toBe('');
        expect(regle('cibles')({ type: 'examen', ponderation: 0 })).toBe('le nom de la production est requis.');
    });
    it('les autres familles ne changent pas', () => {
        const REFUS = 'la pondération est requise : plus de 0\u00a0%.';
        expect(regle('standards')(sansPoids('terminale'))).toBe(REFUS);
        expect(regle('standards')(sansPoids('examen'))).toBe('');
        expect(regle('sommative')(sansPoids('examen'))).toBe(REFUS);
    });
});

/* ================================================================ R15 — les coches, la reprise */
describe('R15 · les coches des critères ne sont lues par aucun calcul ; une reprise n\'est jamais plafonnée', () => {
    it('mêmes niveaux, coches contraires : même niveau retenu, même note', () => {
        const avec = (respecte) => [I(ZOE, 'cib-a', '4', '2026-10-01', { criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true, respecte }] }),
            I(ZOE, 'cib-b', '3', '2026-10-01'), I(ZOE, 'cib-c', '3', '2026-10-01')];
        const oui = monter({ inscriptions: avec(true) }).eleve(ZOE);
        const non = monter({ inscriptions: avec(false) }).eleve(ZOE);
        expect(ligne(non, 'cib-a').retenu.niveau).toBe('4');
        expect(non.note.note).toBe(oui.note.note);
        expect(lire('js/pratiques/note-cibles.js')).not.toMatch(/\.respecte\b/);
    });
    it('un niveau inscrit depuis une reprise est un niveau comme un autre : aucun plafond, et les productions ne sont pas lues', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-11-20', { productionId: 'P1-reprise' }), I(ZOE, 'cib-b', '4', '2026-10-01'), I(ZOE, 'cib-c', '4', '2026-10-01')],
            autres: { test_productions: [{ id: 'P1-reprise', titre: 'Reprise', repriseDe: 'P1', plafondReprise: 'M' }] } });
        expect(m.eleve(ZOE).note.note).toBe(100);
        expect(m.lues.filter(k => /productions|evaluations/.test(k))).toEqual([]);
    });
});

/*
 * JOURNAL DES BREAK-TESTS (21 nov. 2026) — chaque mutation posée dans le code réel, le fichier rejoué, la mutation retirée.
 * Tous les essais étaient au vert avant et après. « ROUGE (n) » : le nombre d'essais qui ont rougi.
 *
 * Passe automatisée (script hors dépôt) sur ce fichier et sur la sentinelle du lot 2 ; 23 mutations, 23 rouges.
 * BT1 (R1) `retenirDansLHistorique` : le rang retenu devient celui de la plus récente (« le dernier »), plus le meilleur.
 *      ROUGE (8) : « le meilleur l'emporte sur le plus récent ; une inscription annulée ne … » ; « « Avancé » le 1er nov., puis « En apprentissage » le 10 nov. : la case… » ; « « Avancé » le 1er oct., puis « Ça y est presque » le 10 nov. : le rete… » ; ….
 * BT2 (R2) `retenirDansLHistorique` : les inscriptions annulées redeviennent actives.
 *      ROUGE (3) : « annuler AJOUTE une entrée qui désigne l'inscription ; l'inscription re… » ; « le meilleur l'emporte sur le plus récent ; une inscription annulée ne … » ; « « Avancé » annulé (trace invalidée) : le retenu redescend au meilleur … ».
 * BT3 (R3) `retenirDansLHistorique` : une remarque (`niveau: null`) entre au retenu comme le niveau « 0 ».
 *      ROUGE (6) : « (révisé au lot 3) une remarque plus récente n'entre pas au niveau rete… » ; « une case qui n'a que des remarques le montre par ✎ et leur nombre, san… » ; « au tableau : la case d'une cible sans donnée porte le nom du niveau « … » ; ….
 * BT3b (R3) `tableau-cibles.js`, `_caseHTML` : la case sans donnée redevient « + » (plus le nom du niveau « sans donnée »).
 *      ROUGE (3) : « une case sans inscription porte le nom du niveau « sans donnée », jama… » ; « une case qui n'a que des remarques le montre par ✎ et leur nombre, san… » ; « au tableau : la case d'une cible sans donnée porte le nom du niveau « … ».
 * BT4 (R4) `tableau-cibles.js`, `_caseHTML` : la case montre le dernier niveau inscrit au lieu du retenu.
 *      ROUGE (2) : « « Avancé » le 1er nov., puis « En apprentissage » le 10 nov. : la case… » ; « la case dit 4 (pas 2), et 3 inscriptions ; son libellé lu dit « niveau… ».
 * BT4b (R4) `tableau-cibles.js`, `retenuHTML` : la phrase « le dernier niveau inscrit … est plus bas » retirée.
 *      ROUGE (1) : « la fenêtre de la case : « Niveau retenu » en clair, la phrase du derni… ».
 * BT5 (R5) `profil-cibles.js` : l'historique du profil perd `lectureSeule` (les boutons d'annulation reviennent).
 *      ROUGE (1) : « le niveau retenu, sa date, son origine et sa rétroaction ; toutes les … ».
 * BT5b (R5) `tableau-cibles.js`, `retenuHTML` : l'origine et la rétroaction du retenu retirées au profil.
 *      ROUGE (1) : « le niveau retenu, sa date, son origine et sa rétroaction ; toutes les … ».
 * BT6 (R6) `ordreDeLEchelle` : un niveau sans borne « Min » ne rend plus l'ordre illisible.
 *      ROUGE (2) : « au tableau, ordre illisible : le motif au-dessus, une seule fois ; auc… » ; « un niveau sans borne « Min » : ordre illisible, aucun niveau retenu, l… ».
 * BT6b (R6) `retenirDansLHistorique` : un code absent de l'échelle est lu (rang 99).
 *      ROUGE (1) : « un code absent de l'échelle n'est pas lu : il ne devient pas le retenu… ».
 * BT6c (R6) `_ordonner` : les niveaux rangés par leur code au lieu de `ordonnerNiveauxParPlage`.
 *      ROUGE (3) : « au tableau, ordre illisible : le motif au-dessus, une seule fois ; auc… » ; « un niveau sans borne « Min » : ordre illisible, aucun niveau retenu, l… » ; « « D » l'emporte sur « M » parce que sa plage est plus haute, pas par s… ».
 * BT7 (R7) `_moyennePonderee` : moyenne simple, les poids ignorés.
 *      ROUGE (9) : « « Avancé » sur une cible, rien sur les deux autres : (100 + 0 + 0) ÷ 4… » ; « à l'arrêt des notes, elle compte pour 0 % : (100 + 75 + 0) ÷ 4 = 43,75 » ; « le récit au profil : chaque cible, son niveau, sa valeur, son poids, s… » ; ….
 * BT8 (R8) `calculerNote` : « inférieure » devient « inférieure ou égale » (60 pile plafonné).
 *      ROUGE (1) : « « inférieure » est strict : une moyenne des terminales de 60 pile n'es… ».
 * BT8b (R8) `lireDoubleSeuil` : le double seuil allumé d'office.
 *      ROUGE (1) : « éteint d'office (60 et 55 d'office) : la terminale à 25 ne plafonne ri… ».
 * BT8c (R8) `calculerNote` : le double seuil joue sans cible terminale.
 *      ROUGE (1) : « sans aucune cible terminale, il ne joue pas, même allumé ; l'écran a d… ».
 * BT9 (R9) `calculerNote` : l'attente retirée (les cibles sans donnée comptent pour rien pendant la session).
 *      ROUGE (4) : « il est bien le niveau retenu de la cible (montré comme un niveau), mai… » ; « calculerPerformance rend la note du moteur (0-1), le récit la même ; n… » ; « au tableau et au profil, les cibles en attente se lisent dans le texte… » ; ….
 * BT10 (R10) `calculerNote` : « Notes finalisées » ignorée.
 *      ROUGE (2) : « « Avancé » sur une cible, rien sur les deux autres : (100 + 0 + 0) ÷ 4… » ; « à l'arrêt des notes, elle compte pour 0 % : (100 + 75 + 0) ÷ 4 = 43,75 ».
 * BT11 (R11) `retenirParCible` : le niveau « sans donnée » inscrit compte comme une valeur pendant la session.
 *      ROUGE (1) : « il est bien le niveau retenu de la cible (montré comme un niveau), mai… ».
 * BT12 (R12) `calculerNote` : une valeur ponctuelle manquante ne rend plus « non calculable ».
 *      ROUGE (2) : « au profil, « non calculable » : le motif, aucun nombre à la place de l… » ; « « Acquis » sans valeur, retenu pour une cible : non calculable, le mot… ».
 * BT13 (R13) `lireEleve` : une lecture de `evaluationsSauvegardees` ajoutée (sans changer aucun chiffre).
 *      ROUGE (2) : « le sens inverse : la note lit l'ensemble, l'échelle et les inscription… » ; « un niveau inscrit depuis une reprise est un niveau comme un autre : au… ».
 * BT13b (R13) `pratique-configurable.js`, `calculerPerformance` : l'attente rend 0 au lieu de null.
 *      ROUGE (1) : « calculerPerformance rend la note du moteur (0-1), le récit la même ; n… ».
 * BT14 (R14) `productions.js`, `raisonChampsObligatoiresProduction` : « cibles » retombe sur la règle commune.
 *      ROUGE (1) : « « cibles » : à 0 %, aucun type n'est refusé — la terminale et le conte… ».
 * BT15 (R15) `retenirDansLHistorique` : une inscription dont un critère est « non respecté » ne compte plus.
 *      ROUGE (1) : « mêmes niveaux, coches contraires : même niveau retenu, même note ».
 */
