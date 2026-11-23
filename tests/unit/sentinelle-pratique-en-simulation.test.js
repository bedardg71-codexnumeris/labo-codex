/**
 * SENTINELLE (23 nov. 2026) — UNE PRATIQUE « PAR STANDARDS » EN SIMULATION, À CÔTÉ DE LA PRATIQUE OFFICIELLE D'UN GROUPE.
 *
 * Plan : plans de travail/PLAN-2026-11-23-pratique-en-simulation.md.
 *
 * VERROUILLÉ ICI, sur les modules RÉELS (les écrans de bout en bout : tests/integration/pratique-en-simulation.spec.js) :
 *   A. La lecture du lien : aucune, ok, pratique supprimée, autre famille, devenue l'officielle, mêmes cibles que
 *      l'officielle. Tout état autre que « ok » porte son motif. Lire n'écrit rien.
 *   B. La fiche du groupe-cours : ce qu'elle refuse (l'officielle, les mêmes cibles, une autre famille) ; un lien déjà
 *      rangé et laissé tel quel n'est pas rejugé ; seules les « Par standards » sont offertes.
 *   C. Le tableau des cibles sous la simulation : la marque au titre et dans chaque fenêtre ; aucun bouton d'export, même
 *      sous une présentation de vue simple ; hors simulation, le HTML est celui d'avant, à l'octet.
 *   D. LE CONTEXTE VIT SUR L'HÔTE : le tableau officiel redessiné derrière la simulation ne détourne pas un clic fait
 *      dans la simulation ; l'inscription part sous l'ensemble de la simulation, et le redessin repasse par elle.
 *   E. La fusion de deux codex dont un seul porte la simulation : un conflit montré, qui DIT la simulation de chaque
 *      côté ; les inscriptions sont unies, sans conflit.
 *   F. Le champ n'est connu que de trois fichiers ; le module de la simulation n'écrit rien ; la chaîne officielle ne le
 *      nomme pas.
 *
 * Données fictives (Zoé Fictive, Yan Inventé). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import JSZip from 'jszip';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc, RACINE } from './_helpers/bac-suivi.js';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const ZOE = '2300001';
const YAN = '2300002';
const ECHELLE = { id: 'ECH-sim', nom: 'Échelle du banc', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 12.49, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 12.5, max: 37.49, valeurCalcul: 25 },
    { code: '2', nom: 'Ça y est presque', min: 37.5, max: 62.49, valeurCalcul: 50 }, { code: '3', nom: 'Acquis', min: 62.5, max: 87.49, valeurCalcul: 75 },
    { code: '4', nom: 'Avancé', min: 87.5, max: 100, valeurCalcul: 100 }] };
const cibles = (prefixe) => [{ id: prefixe + '-a', etiquette: 'Analyser', enonce: '', poids: 1, terminale: false, criteres: [] },
    { id: prefixe + '-b', etiquette: 'Structurer', enonce: '', poids: 1, terminale: false, criteres: [] }];
const parStandards = (id, nom, ensembleId) => ({ id, nom, dansBibliotheque: true, calcul_note: { methode: 'niveaux_par_cible' },
    configuration: { type: 'cibles', ensembleCiblesId: ensembleId, echelleId: ECHELLE.id, niveauSansDonnee: '0' } });
const SELECTION = { id: 'sel-1', nom: 'Sélection du banc', dansBibliotheque: true, configuration: { type: 'standards', portfolio: { nombreARetenir: 3 } } };
const SIMULEE = parStandards('cib-sim', 'Standards à simuler', 'ENS-SIM');
const AUTRE = parStandards('cib-autre', 'Autres standards', 'ENS-OFF');
const JUMELLE = parStandards('cib-jumelle', 'Standards jumeaux', 'ENS-SIM');
const BIBLIOTHEQUE = [SELECTION, SIMULEE, AUTRE, JUMELLE];
const gc = (extra) => Object.assign({ id: 'GC1', nom: 'Groupe fictif', pratiqueId: 'sel-1' }, extra || {});

/* ================================================================ Le module de la simulation, sur un magasin témoin */
function monterSimulation({ groupe = gc(), bibliotheque = BIBLIOTHEQUE } = {}) {
    const store = { groupeCoursActif: { id: 'GC1' }, test_groupesCours: [clone(groupe)], test_pratiquesConfigurables: clone(bibliotheque) };
    const ecrites = [];
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k) => { ecrites.push(k); }, set: async (k) => { ecrites.push(k); } };
    const trouver = (id) => (store.test_pratiquesConfigurables || []).find(p => p.id === id) || null;
    const win = { echapperHtml };
    const globaux = { db, cle: (k) => 'test_' + k, echapperHtml, normaliserIdPratique: (t) => t, trouverPratiqueEnBibliotheque: trouver,
        designerPratiqueActive: () => ({ etat: 'ok', donnees: trouver(store.test_groupesCours[0].pratiqueId) }), document: { getElementById: () => null } };
    chargerScript('js/simulation-pratique.js', globaux, win);
    return { S: win.SimulationPratique, store, ecrites, win, globaux };
}

describe('A · la lecture du lien de simulation', () => {
    it('sans lien : aucune simulation, sans motif', () => {
        const s = monterSimulation().S.lire();
        expect([s.etat, s.motif, s.groupeId]).toEqual(['aucune', '', 'GC1']);
    });
    it('un lien vers une « Par standards » du trimestre : ok, avec son id, son nom et son entrée', () => {
        const s = monterSimulation({ groupe: gc({ simulationPratiqueId: 'cib-sim' }) }).S.lire();
        expect([s.etat, s.id, s.nom, s.donnees.configuration.ensembleCiblesId]).toEqual(['ok', 'cib-sim', 'Standards à simuler', 'ENS-SIM']);
    });
    it('la pratique a été supprimée : « introuvable », le motif dit que les inscriptions sont gardées ; le lien reste', () => {
        const m = monterSimulation({ groupe: gc({ simulationPratiqueId: 'cib-sim' }), bibliotheque: [SELECTION] });
        const s = m.S.lire();
        expect([s.etat, s.id, s.idBrut]).toEqual(['introuvable', null, 'cib-sim']);
        expect(s.motif).toContain('n’existe plus dans ce trimestre');
        expect(s.motif).toContain('sont gardés');
        expect(m.store.test_groupesCours[0].simulationPratiqueId, 'le lien reste au stock').toBe('cib-sim');
    });
    it('une pratique d\'une autre famille, l\'officielle elle-même, ou les mêmes cibles que l\'officielle : jamais « ok »', () => {
        expect(monterSimulation({ groupe: gc({ simulationPratiqueId: 'sel-1', pratiqueId: 'cib-autre' }) }).S.lire().etat).toBe('autre-famille');
        expect(monterSimulation({ groupe: gc({ simulationPratiqueId: 'cib-sim', pratiqueId: 'cib-sim' }) }).S.lire().etat).toBe('officielle');
        const meme = monterSimulation({ groupe: gc({ simulationPratiqueId: 'cib-jumelle', pratiqueId: 'cib-sim' }) }).S.lire();
        expect(meme.etat, 'ce qui s\'y inscrirait compterait dans la note officielle').toBe('meme-ensemble');
        expect(meme.motif).toContain('partage ses cibles');
    });
    it('lire n\'écrit rien, quel que soit l\'état', () => {
        for (const groupe of [gc(), gc({ simulationPratiqueId: 'cib-sim' }), gc({ simulationPratiqueId: 'disparue' })]) {
            const m = monterSimulation({ groupe });
            m.S.lire();
            expect(m.ecrites).toEqual([]);
        }
    });
});

describe('B · ce que la fiche du groupe-cours offre et refuse', () => {
    const S = monterSimulation().S;
    it('seules les « Par standards » sont offertes', () => {
        expect(S.candidatesParmi(BIBLIOTHEQUE).map(p => p.id)).toEqual(['cib-sim', 'cib-autre', 'cib-jumelle']);
    });
    it('refusées, en mots : la pratique de notation du groupe, une pratique aux mêmes cibles, une autre famille', () => {
        expect(S.motifDeRefus('cib-sim', 'cib-sim', null)).toBe(S.MOTS.refusOfficielle);
        expect(S.motifDeRefus('cib-jumelle', 'cib-sim', null)).toBe(S.MOTS.refusMemeEnsemble);
        expect(S.motifDeRefus('sel-1', 'cib-sim', null)).toBe(S.MOTS.refusAutreFamille);
    });
    it('acceptés : aucune simulation, une « Par standards » à côté d\'une autre pratique, un lien déjà rangé laissé tel quel', () => {
        expect(S.motifDeRefus(null, 'sel-1', 'cib-sim')).toBe('');
        expect(S.motifDeRefus('cib-sim', 'sel-1', null)).toBe('');
        expect(S.motifDeRefus('cib-sim', 'cib-autre', null)).toBe('');
        expect(S.motifDeRefus('disparue', 'sel-1', 'disparue'), 'un lien vers une pratique supprimée reste tant qu\'on n\'y touche pas').toBe('');
    });
});

/* ================================================================ Le tableau des cibles, dans un vrai DOM, sur deux hôtes */
function monterEcran() {
    const dom = new JSDOM('<!doctype html><body><div id="officiel"></div><div id="simulation"></div></body>');
    const doc = dom.window.document;
    const store = { test_ensemblesCibles: [{ id: 'ENS-OFF', coursId: null, cibles: cibles('off') }, { id: 'ENS-SIM', coursId: null, cibles: cibles('sim') }],
        test_echellesTemplates: [clone(ECHELLE)], test_inscriptionsCibles: [] };
    const db = dbBanc(store, []);
    const win = { echapperHtml };
    const appels = { officiel: 0, simulation: 0 };
    const globaux = { db, cle: (k) => 'test_' + k, echapperHtml, document: doc, Event: dom.window.Event, CSS: { escape: (s) => String(s).replace(/["\\]/g, '\\$&') },
        obtenirEchelleResolue: (id) => clone(store.test_echellesTemplates.find(e => e.id === id) || null),
        genererBadgePratiqueHTML: () => '<span class="badge-type-pratique">STD</span>', obtenirDonneesSelonMode: () => [], ...fonctionsDeLEchelle() };
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/pratiques/note-cibles.js', globaux, win);
    let n = 0;
    win.genererIdUnique = (p) => p + 'SIM' + (++n);
    win.TableauNotation = { MOTS: { reglages: 'Réglages de la pratique', aucunEleve: 'Aucun·e étudiant·e.', exporter: 'Exporter les notes' },
        couleurSure: (c) => (c || 'var(--accent-primaire)'), rafraichirSiAffiche() { appels.officiel++; } };
    win.SimulationPratique = { MOTS: { titre: 'Tableau des cibles' }, marqueHTML: () => '<span class="sim-marque">Simulation</span>', rerendre() { appels.simulation++; } };
    chargerScript('js/tableau-cibles.js', globaux, win);
    const etudiants = [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé' }, { da: YAN, nom: 'Inventé', prenom: 'Yan' }];
    const contexte = (pratique, extra) => Object.assign({ etat: 'cibles', pratiqueId: pratique.id, pratiqueNom: pratique.nom, donnees: pratique, etudiants, productions: [] }, extra || {});
    const rendre = (idHote, ctx) => { const h = doc.getElementById(idHote); h.innerHTML = win.TableauCibles.construireHTML(ctx); win.TableauCibles.apresRendu(h, ctx); return h; };
    return { win, doc, store, appels, contexte, rendre, TC: win.TableauCibles };
}

describe('C · le tableau des cibles sous la simulation : la marque, et aucun export', () => {
    it('le titre du tableau porte la marque ; hors simulation, le HTML est celui d\'avant, à l\'octet', () => {
        const e = monterEcran();
        const sim = e.TC.construireHTML(e.contexte(SIMULEE, { simulation: true }));
        const hors = e.TC.construireHTML(e.contexte(SIMULEE));
        expect(sim).toContain('<h3 class="tn-titre" tabindex="-1"><span class="sim-marque">Simulation</span> Tableau des cibles</h3>');
        expect(hors).toContain('<h3 class="tn-titre" tabindex="-1">Tableau de notation</h3>');
        expect(hors).not.toContain('sim-marque');
        expect(sim.replace('<span class="sim-marque">Simulation</span> Tableau des cibles', 'Tableau de notation'), 'rien d\'autre ne change').toBe(hors);
    });
    it('aucun bouton d\'export sous la simulation, même sous une présentation de vue simple (où il existe hors simulation)', () => {
        const e = monterEcran();
        const presentation = { cibles: true };
        expect(e.TC.construireHTML(e.contexte(SIMULEE, { presentation }))).toContain('exporterSyntheseResultatsCSV');
        expect(e.TC.construireHTML(e.contexte(SIMULEE, { presentation, simulation: true }))).not.toContain('exporterSyntheseResultatsCSV');
        expect(e.TC.construireHTML(e.contexte(SIMULEE, { simulation: true }))).not.toContain('exporterSyntheseResultatsCSV');
    });
    it('la fenêtre d\'une case et « Inscrire pour une production » portent la marque ; hors simulation, non', () => {
        const e = monterEcran();
        const base = e.contexte(SIMULEE, { simulation: true });
        e.rendre('simulation', base);
        expect(e.TC.ouvrirInscription(ZOE, 'sim-a', null, base).querySelector('.modal-titre').innerHTML).toBe('<span class="sim-marque">Simulation</span> Inscrire un niveau');
        expect(e.TC.ouvrirParProduction(null, base).querySelector('.modal-titre').innerHTML).toBe('<span class="sim-marque">Simulation</span> Inscrire pour une production');
        expect(e.TC.ouvrirInscription(ZOE, 'sim-a', null, e.contexte(SIMULEE)).querySelector('.modal-titre').innerHTML).toBe('Inscrire un niveau');
        e.TC.fermer();
    });
});

describe('D · le contexte vit sur l\'hôte : un clic dans la simulation écrit sous la simulation', () => {
    async function inscrireParClic(e, hote, cibleId) {
        hote.querySelector(`.tc-case[data-da="${ZOE}"][data-cible="${cibleId}"]`).click();
        const fenetre = e.doc.querySelector('.tc-overlay');
        fenetre.querySelector('input[type="radio"][value="3"]').checked = true;
        fenetre.querySelector('[data-tc="inscrire"]').click();
        await new Promise(r => setTimeout(r, 0));
        await new Promise(r => setTimeout(r, 0));
    }
    it('le tableau officiel (une autre « Par standards ») redessiné APRÈS la simulation ne détourne pas le clic', async () => {
        const e = monterEcran();
        const hoteSim = e.rendre('simulation', e.contexte(SIMULEE, { simulation: true }));
        e.rendre('officiel', e.contexte(AUTRE));   // la Liste rechargée : le tableau officiel se redessine derrière
        await inscrireParClic(e, hoteSim, 'sim-a');
        const stock = e.store.test_inscriptionsCibles;
        expect(stock.map(i => [i.da, i.ensembleId, i.cibleId, i.niveau])).toEqual([[ZOE, 'ENS-SIM', 'sim-a', '3']]);
        expect(e.appels, 'le redessin repasse par la simulation, jamais par le tableau officiel').toEqual({ officiel: 0, simulation: 1 });
    });
    it('et l\'inverse : un clic dans le tableau officiel écrit sous l\'officielle, et redessine l\'officiel', async () => {
        const e = monterEcran();
        const hoteOff = e.rendre('officiel', e.contexte(AUTRE));
        e.rendre('simulation', e.contexte(SIMULEE, { simulation: true }));
        await inscrireParClic(e, hoteOff, 'off-a');
        expect(e.store.test_inscriptionsCibles.map(i => i.ensembleId)).toEqual(['ENS-OFF']);
        expect(e.appels).toEqual({ officiel: 1, simulation: 0 });
    });
});

/* ================================================================ La fusion de deux codex */
const consoleSandbox = { log() {}, warn() {}, error() {}, info() {} };
function monterCodex() {
    const map = new Map();
    const db = { _map: map, ready: true, init: async () => {}, get: async (k, d = null) => (map.has(k) ? map.get(k) : d), set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); }, keys: async () => [...map.keys()], listBlobIds: async () => [], getSync: (k, d = null) => (map.has(k) ? map.get(k) : d),
        setSync: (k, v) => { map.set(k, v); }, syncToLocalStorageCache: async () => {}, flush: async () => {} };
    const win = { addEventListener() {}, removeEventListener() {}, afficherProgression() {}, majProgression() {}, masquerProgression() {}, trimestreActif: 'a2026',
        dateEnLettres: (d) => d.toISOString().slice(0, 10) };
    const doc = { readyState: 'loading', addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, contains() { return false; } } }),
        body: { addEventListener() {}, appendChild() {} }, documentElement: { addEventListener() {} } };
    const stockage = () => ({ _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    monterFichierSortant(win, { document: doc });
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', 'db', 'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator', '"use strict";\n' + lire('js/codex.js'))(win, doc, consoleSandbox, stockage(), stockage(), db, undefined, JSZip,
        function () {}, (cb) => setTimeout(cb, 0), { confirmerAction: async () => true, demanderSaisie: async () => null }, undefined, (cb) => setTimeout(cb, 0),
        { userAgent: 'BacASable/simulation (Node; test)' });
    return win.Codex;
}

describe('E · deux codex fusionnés, dont un seul porte la simulation', () => {
    const GROUPE = { id: 'GC1', nom: 'Groupe fictif', pratiqueId: 'sel-1', dateModification: '2026-11-20T15:00:00.000Z' };
    const I = (id, niveau) => ({ id, type: 'inscription', da: ZOE, ensembleId: 'ENS-SIM', cibleId: 'sim-a', niveau, echelleId: ECHELLE.id, date: '2026-11-20',
        horodatage: '2026-11-20T15:00:00.000Z', productionId: null, noteBreve: '', criteres: [] });
    const ici = { a2026_groupesCours: [Object.assign({}, GROUPE, { simulationPratiqueId: 'cib-sim' })], a2026_pratiquesConfigurables: clone(BIBLIOTHEQUE),
        a2026_inscriptionsCibles: [I('I1', '3'), I('I2', '4')] };
    const labas = { a2026_groupesCours: [clone(GROUPE)], a2026_pratiquesConfigurables: clone(BIBLIOTHEQUE), a2026_inscriptionsCibles: [I('I1', '3'), I('I3', '2')] };
    const Codex = monterCodex();

    it('le groupe-cours devient un conflit montré, tranché objet entier ; les inscriptions sont unies, sans conflit', () => {
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([{ cle: 'a2026_groupesCours', id: 'GC1' }]);
        expect(analyse.ajouts.a2026_inscriptionsCibles.map(e => e.id), 'l\'inscription de l\'autre codex arrive ; celles d\'ici restent').toEqual(['I3']);
    });
    it('chaque côté du conflit DIT sa simulation (sinon les deux se liraient pareil)', () => {
        const d = Codex._decrireLeConflit({ cle: 'a2026_groupesCours', id: 'GC1' }, ici, labas);
        expect(d.ici.detail).toBe('Simulation : « Standards à simuler »');
        expect(d.autre.detail).toBe('Aucune simulation');
    });
    it('deux groupes-cours qui ne diffèrent pas par la simulation n\'en disent rien', () => {
        const a = { a2026_groupesCours: [Object.assign({}, GROUPE, { nom: 'Groupe renommé' })] };
        const d = Codex._decrireLeConflit({ cle: 'a2026_groupesCours', id: 'GC1' }, a, labas);
        expect([d.ici.detail, d.autre.detail]).toEqual(['', '']);
    });
});

describe('F · le champ, ses trois fichiers, et la chaîne officielle qui ne le connaît pas', () => {
    const fichiersJs = (dossier) => readdirSync(path.join(RACINE, dossier), { withFileTypes: true })
        .flatMap(f => f.isDirectory() ? fichiersJs(path.join(dossier, f.name)) : (f.name.endsWith('.js') ? [path.join(dossier, f.name)] : []));
    it('`simulationPratiqueId` n\'est nommé que par le module de la simulation, la fiche du groupe-cours et la fusion', () => {
        const nomment = fichiersJs('js').filter(f => lire(f).includes('simulationPratiqueId')).sort();
        expect(nomment).toEqual(['js/codex.js', 'js/simulation-pratique.js', 'js/trimestre-v2-groupes-cours.js']);
    });
    it('le module de la simulation n\'écrit dans aucun stock et ne touche pas au pointeur de la pratique officielle', () => {
        const code = lire('js/simulation-pratique.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(code).not.toMatch(/setSync|db\.set\(|db\.modifier|sauvegarderDonneesSelonMode|modifierEtAnnoncer|changerPratiqueActive/);
        expect(code).not.toMatch(/pratiqueId\s*=[^=]/);
    });
    it('les miroirs du groupe-cours (`infoCours`, `groupeCoursActif`) ne portent pas le champ', () => {
        expect(lire('js/entites/groupe-cours.js')).not.toContain('simulation');
    });
});

/* BREAK-TESTS (23 nov. 2026) — chaque test a été vu rouge sur le code d'avant, ou sur une mutation, puis vert :
 *   D1. `_surClicTableau` relit `_contexteCourant` (code d'avant le lot) : l'inscription part sous 'ENS-OFF' → D rouge.
 *   D2. `_rerendre` sans la branche `ctx.simulation` : { officiel: 1, simulation: 0 } → D rouge.
 *   C1. `exporter` rendu sans la garde `ctx.simulation` : le bouton reparaît → C rouge.
 *   E1. `_coteDeLElement` sans `_direLaSimulation` (code d'avant) : détails vides des deux côtés → E rouge.
 *   A1. `examiner` sans la comparaison des ensembles : 'ok' au lieu de 'meme-ensemble' → A rouge.
 */
