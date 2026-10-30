/**
 * AUDIT DES SIX SOUS-ONGLETS DE SUIVI — banc d'exécution des mesures (6 septembre 2026)
 *
 * Rapport : Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md. Cadré par
 * Rapports/prompts-audit/PROMPT-AUDIT-sous-onglets-suivi-2026-09-06.md. Quatrième audit cadré : le
 * complément du troisième (Rapports/AUDIT-onglet-suivi-2026-09-05.md, la chaîne des indices, jugée) —
 * ici, ce que chaque sous-onglet FAIT à l'écran et ÉCRIT en base, sur des élèves de banc.
 *
 * Ce fichier ne juge pas et ne corrige rien : il charge les modules RÉELS de js/ dans le bac à sable
 * (patron des trois bancs d'audit) et déclenche les gestes par leurs fonctions réelles, sur un faux
 * `document` qui capture l'innerHTML et sert les champs d'un formulaire. Le `db` de banc journalise
 * chaque écriture (clé, valeur) ; « recharger » = remonter un window neuf sur le MÊME store, puis relire.
 * Les `expect` sont les valeurs OBTENUES au 6 septembre 2026 (HEAD 2fb1facf, 1.123.5) ; quand elles
 * divergent de ce que le libellé du geste promet, le commentaire le dit et le rapport en fait un constat.
 * ⚠ Six mesures sont passées aux VALEURS D'APRÈS le lot #767-#772 (1.123.7, le même jour) : I-2, I-3, I-4,
 * L-7, S-5, A-3 — chacune le dit dans son titre ; le constat d'origine reste dans le rapport, la preuve du
 * correctif dans sa sentinelle (sentinelle-767…772, sentinelle-733 étendue).
 * Un `describe` par sous-onglet, dans l'ordre de la navigation. Aucune donnée réelle. Rien dans js/.
 *
 *   cd tests && npx vitest run unit/audit-sous-onglets-suivi-2026-09-06.test.js
 */
// ↻ #1152, retouche 2 du lot 5 (29 oct. 2026, plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md) : le champ « Séance concernée » (interventionSeance) est retiré.
import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript, completerNoteParDefaut } from './_helpers/charger-script.js';
import { echelleAReperes, globauxEchelle, copieSurEchelle } from './_helpers/bac-suivi.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MESURES = {};
const noter = (k, v) => { MESURES[k] = v; return v; };
afterAll(() => { console.log('AUDIT-SOUS-ONGLETS-MESURES ' + JSON.stringify(MESURES, null, 1)); });
const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Même chargement que chargerScript, avec des noms INTERNES exposés sous window.__audit[<fichier>]. */
function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = readFileSync(path.join(RACINE, chemin), 'utf8');
    const expo = '\n;window.__audit = window.__audit || {}; window.__audit[' + JSON.stringify(path.basename(chemin)) + '] = {'
        + noms.map(n => 'get ' + n + '() { return ' + n + '; }' + (/^(_|etat|donnees)/.test(n) ? ', set ' + n + '(v) { ' + n + ' = v; }' : '')).join(', ') + '};\n';
    const fin = code.lastIndexOf('})();');
    code = fin >= 0 ? code.slice(0, fin) + expo + code.slice(fin) : code + expo;
    const { document: doc, localStorage: ls, ...autres } = completerNoteParDefaut(globaux);   // #1137 : le module des nombres affichés
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    const nomsG = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres)];
    const vals = [win, doc, console, ls || storage(), storage(), ...Object.values(autres)];
    new Function(...nomsG, '"use strict";\n' + code)(...vals);
    return win;
}

/* ---------------------------------------------------------------------------------------------
   Le faux DOM : des éléments créés à la demande, un innerHTML capturé, des sélecteurs servis par
   un registre que le test remplit (checkboxes cochées, radios, champs).
   --------------------------------------------------------------------------------------------- */
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, force) { const v = force === undefined ? !s.has(c) : !!force; v ? s.add(c) : s.delete(c); return v; }, liste() { return [...s]; } }; }
function elementDom(init) {
    const el = { _html: '', get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; this.children = []; } };
    return Object.assign(el, { textContent: '', value: '', checked: false, disabled: false, style: {}, dataset: {}, classList: classList(), children: [],
        setAttribute(n, v) { this['attr_' + n] = v; }, getAttribute(n) { return this['attr_' + n] === undefined ? null : this['attr_' + n]; }, hasAttribute(n) { return this['attr_' + n] !== undefined; }, removeAttribute(n) { delete this['attr_' + n]; },
        appendChild(c) { this.children.push(c); return c; }, addEventListener() {}, removeEventListener() {}, focus() {}, select() {}, click() {}, scrollIntoView() {},
        querySelector() { return null; }, querySelectorAll() { return []; }, getElementsByTagName() { return this.lignes || []; }, insertAdjacentHTML(p, h) { this.innerHTML += h; }, remove() {}, closest() { return null; },
        getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 20, right: 100, bottom: 20 }; }, offsetParent: {}, offsetWidth: 100, offsetHeight: 20 }, init || {});
}
function fauxDocument(elements, selecteurs) {
    return {
        getElementById: (id) => (elements[id] || (elements[id] = elementDom({ id }))),
        querySelector: (s) => { const r = selecteurs[s]; return Array.isArray(r) ? (r[0] || null) : (r || null); },
        querySelectorAll: (s) => { const r = selecteurs[s]; return Array.isArray(r) ? r : (r ? [r] : []); },
        createElement: (tag) => elementDom({ tagName: String(tag).toUpperCase() }), createDocumentFragment: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
        body: elementDom(), documentElement: elementDom(), readyState: 'complete', activeElement: null
    };
}

/* ---------------------------------------------------------------------------------------------
   Le db de banc : un store partagé (survit au « rechargement »), un journal des écritures.
   --------------------------------------------------------------------------------------------- */
function dbBanc(store, journal) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v) }); },
        removeSync: (k) => { delete store[k]; journal.push({ k: '-' + k }); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v), async: true }); },
        remove: async (k) => { delete store[k]; journal.push({ k: '-' + k, async: true }); },
        keys: async () => Object.keys(store), useIndexedDB: false, memoryCache: new Map(),
        // db.modifier RÉEL (db.js:532) : lecture → mutateur → set, sérialisé par clé.
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; }
    };
}
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

/** Un store de départ : un groupe-cours GC1 de trois élèves, un autre GC2 avec un quatrième. */
function storeBase() {
    return {
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01', _groupeCoursId: 'GC1' },
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', nom: 'Groupe 01', coursId: 'GC1', groupeNum: '01' },
        test_groupesCours: [{ id: 'GC1', coursId: 'GC1', trimestreId: 'test', actif: true, groupeNum: '01' }, { id: 'GC2', coursId: 'GC2', trimestreId: 'test', actif: false, groupeNum: '02' }],
        test_groupeEtudiants: [
            { da: '2000001', nom: 'Assidu', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
            { da: '2000002', nom: 'Absent', prenom: 'Bruno', groupe: '01', coursId: 'GC1', statut: 'actif' },
            { da: '2000003', nom: 'Silence', prenom: 'Chloé', groupe: '01', coursId: 'GC1', statut: 'actif' },
            { da: '2000004', nom: 'Dautre', prenom: 'Dario', groupe: '02', coursId: 'GC2', statut: 'actif' }
        ],
        test_productions: [], test_evaluationsSauvegardees: [], test_presences: [], test_grillesTemplates: [], test_echellesTemplates: [],
        test_pratiquesConfigurables: [], test_modalitesEvaluation: {}, test_portfoliosEleves: {}
    };
}

/**
 * Monte un window neuf sur `store` (partagé) avec modes.js RÉEL et les modules demandés.
 * Rappeler `monter` sur le même store = « recharger la page ».
 */
function monter(store, opts = {}) {
    const journal = opts.journal || [];
    const db = dbBanc(store, journal);
    const elements = Object.assign({}, opts.elements || {});
    const selecteurs = Object.assign({}, opts.selecteurs || {});
    const document = fauxDocument(elements, selecteurs);
    const notifs = [], avertissements = [], confirmations = [];
    const prefs = Object.assign({}, opts.prefs || {});
    // Minuteries VIRTUELLES : setTimeout empile, `avancer(ms)` exécute ce qui est dû (l'horloge du banc, lue par Date.now, avance d'autant).
    const file = []; let horloge = Date.now(); const dateNowReel = Date.now;
    const avancer = (ms) => { const cible = horloge + ms; while (true) { file.sort((a, b) => a.t - b.t); const n = file[0]; if (!n || n.t > cible) break; file.shift(); horloge = Math.max(horloge, n.t); Date.now = () => horloge; try { n.f(); } catch (e) { avertissements.push('timer: ' + e.message); } } horloge = cible; Date.now = () => horloge; };
    const setTimeoutV = (f, d) => { file.push({ t: horloge + (d || 0), f }); return file.length; };
    Date.now = () => horloge;
    const win = { addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => (opts.aujourdhui || '2026-09-06'), cle, db,
        setTimeout: setTimeoutV, clearTimeout() {}, MutationObserver: function () { return { observe() {}, disconnect() {} }; },
        location: { hash: '', href: 'file:///index.html' }, innerWidth: 1366, innerHeight: 1024, requestAnimationFrame: (f) => { f(); return 0; }, getComputedStyle: () => ({ getPropertyValue: () => '' }) };
    const fwd = (nom) => (...a) => { if (typeof win[nom] !== 'function') throw new Error('global absent : ' + nom); return win[nom](...a); };
    let compteurIds = 0;
    const globauxBase = {
        document, db, cle, echapperHtml,
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info(t, m) { notifs.push({ type: 'info', t, m }); }, warning(t, m) { notifs.push({ type: 'warning', t, m }); }, avertissement(t, m) { notifs.push({ type: 'avertissement', t, m }); } },
        obtenirPreference: (n) => (n in prefs ? prefs[n] : null), definirPreference: (n, v) => { prefs[n] = v; journal.push({ k: 'pref:' + n, v }); },
        estEtudiantExclu: (e) => !!(e && e.statut && ['inactif', 'décrochage', 'abandon'].includes(e.statut)),
        obtenirDureePeriode: () => 50, obtenirSeancesCompletes: () => clone(store.test_seancesCompletes || {}), obtenirSeancesHoraire: () => clone(store.test_horaire || []),
        obtenirCalendrierComplet: () => clone(store.test_calendrierComplet || {}), genererSeancesCompletes() {},
        obtenirCoursActifId: () => store.infoCours && store.infoCours.id,
        genererIdUnique: (p) => p + 'BANC' + (++compteurIds), alert: (m) => { avertissements.push(m); }, confirm: (m) => { confirmations.push(m); return opts.confirmer !== false; },
        setTimeout: win.setTimeout, clearTimeout() {}, MutationObserver: win.MutationObserver, requestAnimationFrame: win.requestAnimationFrame,
        formaterDateComplete: (d) => String(d), formaterNbEtudiants: (n) => n + ' étudiant·e' + (n > 1 ? 's' : ''),
        afficherSection() {}, afficherSousSection() {}, naviguerVers() {}, afficherListeEtudiantsConsultation() {}, afficherNotificationCopiee() {}, toggleDisplay() {}, toggleAccordeonV2() {},
        COULEURS: { indices: { A: '#1976D2', C: '#FF6B35', P: '#4CAF50' } },
        // modes.js affecte `doitRegenerer` sans le déclarer (global implicite en mode non strict) : le bac, strict, doit le fournir.
        doitRegenerer: false
    };
    Object.assign(globauxBase, opts.globaux || {});
    const winModes = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    chargerScript('js/modes.js', globauxBase, winModes);
    const globaux = Object.assign({}, globauxBase, {
        obtenirDonneesSelonMode: winModes.obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: winModes.sauvegarderDonneesSelonMode,
        obtenirEtudiantsCoursActif: winModes.obtenirEtudiantsCoursActif, obtenirContexteCoursActif: winModes.obtenirContexteCoursActif,
        demarrerCacheLecture: winModes.demarrerCacheLecture, terminerCacheLecture: winModes.terminerCacheLecture, invaliderCacheLecture: winModes.invaliderCacheLecture,
        filtrerEtudiantsParMode: winModes.filtrerEtudiantsParMode, estModeeLectureSeule: winModes.estModeeLectureSeule, obtenirPratiqueActiveGroupeCours: winModes.obtenirPratiqueActiveGroupeCours,
        // #749 lot 2 : la normalisation partagée vit dans modes.js ; le libellé de statut dans main.js (non chargé ici).
        normaliserNumeroGroupe: winModes.normaliserNumeroGroupe,
        // #834 lot E (cadrage « Rencontres », 12 sept. 2026) : l'identifiant du contexte, point unique de modes.js.
        obtenirIdContexteActif: winModes.obtenirIdContexteActif, contexteActifEstService: winModes.contexteActifEstService,
        libelleStatutEtudiant: (st) => ({ 'inactif': 'Inactivité', 'décrochage': 'Décrochage', 'abandon': 'Abandon' }[st] || ''),
        // Lot E2 (28 sept. 2026) : le Cadre écrit les fiches d'élève par `modifierEtAnnoncer` (la file + le témoin).
        modifierEtAnnoncer: winModes.modifierEtAnnoncer
    });
    Object.assign(globaux, opts.globaux || {});
    // Lot E2 : un refus parle par le témoin commun ; il est rangé avec les notifications.
    if (!win.temoinEnregistrement) {
        win.temoinEnregistrement = { nonEnregistre(raison, geste) { notifs.push({ type: 'nonEnregistre', t: raison, geste }); }, enregistre() {} };
        win.raisonPourTemoin = (r) => { const t = String(r || '').trim(); const d = t.charAt(0).toLowerCase() + t.slice(1); return /[.!?]$/.test(d) ? d : d + '.'; };
    }
    // Lot 5 du cadrage 11 (12 sept. 2026), ↻ 30 oct. : la lettre du bilan d'une intervention se situe dans l'échelle —
    // la VRAIE `situerPourcentageDansEchelle` (js/profil-etudiant-helpers.js, chargé avant interventions.js dans l'app).
    if (!('situerPourcentageDansEchelle' in globaux)) {
        const winHelpers = {};
        chargerScript('js/profil-etudiant-helpers.js', globaux, winHelpers);
        globaux.situerPourcentageDansEchelle = winHelpers.situerPourcentageDansEchelle;
    }
    // 30 oct. 2026 : les seuils et leurs lecteurs sont les VRAIS, comme dans l'app (voir bac-suivi.js).
    const winConfig = {};
    chargerScript('js/interpretation-config.js', { db }, winConfig);
    win.NOTE_DE_PASSAGE = winConfig.NOTE_DE_PASSAGE;
    win.SEUILS_PAR_DEFAUT = winConfig.SEUILS_PAR_DEFAUT;
    if (!('obtenirSeuil' in globaux)) globaux.obtenirSeuil = winConfig.obtenirSeuil;
    if (typeof win.evaluationEntreDansLaNote !== 'function') chargerPredicatsCopie(win);
    for (const [k, v] of Object.entries(globaux)) if (!(k in win) && k !== 'document' && k !== 'db') win[k] = v;   // les modules lisent aussi window.X
    // Les exports window des modules montés : aiguillés à l'appel (résolution tardive).
    const modulesDemandes = opts.modules || [];
    const modules = modulesDemandes.includes('js/contexte-qualification.js') ? modulesDemandes : ['js/contexte-qualification.js', ...modulesDemandes];
    const exportsWindow = new Set();
    for (const f of modules) for (const m of readFileSync(path.join(RACINE, f.chemin || f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) exportsWindow.add(m[1]);
    for (const nom of exportsWindow) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && !(opts.objetsExportes || []).includes(nom)) globaux[nom] = fwd(nom);
    for (const f of modules) {
        if (typeof f === 'string') chargerScript(f, globaux, win); else chargerAvecInterne(f.chemin, globaux, win, f.internes);
    }
    return { win, store, db, journal, elements, selecteurs, notifs, avertissements, confirmations, prefs, interne: win.__audit || {}, document, avancer, restaurerHorloge: () => { Date.now = dateNowReel; } };
}

/* =============================================================================================
   5 · INTERVENTIONS — js/interventions.js
   ============================================================================================= */
describe('5 · Interventions — gestes et écritures', () => {
    const MODULES_I = [{ chemin: 'js/interventions.js', internes: ['genererAffichageNotesIndividuelles'] }];   // ↻ lot E3 : `sauvegarderInterventions` retirée (écritures par le témoin)
    const ECHELLE_I = echelleAReperes();   // 30 oct. 2026 : le bilan se lit dans l'échelle des copies du groupe
    const GLOBAUX_I = {
        determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
        calculerMoyennesCriteres: () => ({ structure: 0.645, rigueur: 0.75 }), obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '',
        obtenirSeuil: (n) => ({ defiSpecifique: 0.70 }[n] || 0.7),
        ...globauxEchelle(ECHELLE_I),
        calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
    };
    const monterI = (store, opts = {}) => monter(store, Object.assign({ modules: MODULES_I, globaux: GLOBAUX_I }, opts));

    it('I-1 · « Planifier une intervention » écrivait en base AVANT toute saisie, et le ré-affichage de la liste purgeait ce brouillon — depuis le lot 5 du cadrage 11, rien n\'est écrit avant « Enregistrer » (valeur d\'après)', () => {
        // Constat d'origine (6 sept.) : 1 intervention `jamaisSauvegardee: true` en base (1 écriture), puis
        // purgée au ré-affichage de la liste (0 intervention, 0 notification).
        const store = storeBase(); store.test_interventions = [];
        const b = monterI(store);
        b.win.afficherFormulaireIntervention();
        const ecrituresPlanifier = b.journal.filter(j => j.k === 'test_interventions').length;
        noter('I1.creation', { nb: store.test_interventions.length, ecritures: ecrituresPlanifier });
        expect(store.test_interventions.length).toBe(0);
        expect(ecrituresPlanifier).toBe(0);
        // L'enseignant change d'onglet et revient : la liste se ré-affiche — rien à purger, rien d'écrit.
        const b2 = monterI(store);
        b2.win.afficherListeInterventions();
        noter('I1.purge', { nb: store.test_interventions.length, ecritures: b2.journal.filter(j => j.k === 'test_interventions').length });
        expect(store.test_interventions.length).toBe(0);
        expect(b2.journal.filter(j => j.k === 'test_interventions').length).toBe(0);
    });

    it('I-2 · Enregistrer : la note individuelle d\'un élève DÉCOCHÉ était effacée — depuis #772, un champ affiché rempli est conservé (valeur d\'après)', () => {
        const store = storeBase();
        store.test_interventions = [{ id: 'I1', titre: 'Rattrapage', date: '2026-09-01', heure: '10:00', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'rattrapage', description: '',
            etudiants: ['2000001', '2000002'], analyse: null, observations: '', notesIndividuelles: { 2000001: 'Alice progresse.', 2000002: 'Bruno absent, à revoir.' }, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }];
        // Le formulaire, tel que l'enseignant le laisse : Alice cochée, Bruno décoché (il n'est pas venu), ses champs de note intacts.
        const cbAlice = elementDom({ value: '2000001', checked: true }), cbBruno = elementDom({ value: '2000002', checked: false });
        const b = monterI(store, {
            elements: { interventionNiveau: elementDom({ value: '2' }), interventionContexte: elementDom({ value: 'rattrapage' }), interventionTitre: elementDom({ value: 'Rattrapage' }), interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '10:00' }), interventionDuree: elementDom({ value: '2' }), interventionDescription: elementDom({ value: '' }), observationsIntervention: elementDom({ value: 'obs' }), objectifVise: elementDom({ value: '' }), 'note-2000001': elementDom({ value: 'Alice progresse.' }), 'note-2000002': elementDom({ value: 'Bruno absent, à revoir.' }) },
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': [cbAlice, cbBruno], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [cbAlice], 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] }
        });
        b.win.sauvegarderPresencesIntervention('I1');
        const i = store.test_interventions[0];
        noter('I2', { etudiants: i.etudiants, notes: i.notesIndividuelles, ecritures: b.journal.filter(j => j.k === 'test_interventions').length, notif: b.notifs.map(n => n.t) });
        expect(i.etudiants).toEqual(['2000001']);
        // Avant #772 : { 2000001 } seulement — la note de Bruno n'existait plus. Après : son champ, affiché et rempli, est conservé.
        expect(i.notesIndividuelles).toEqual({ 2000001: 'Alice progresse.', 2000002: 'Bruno absent, à revoir.' });
        expect(b.journal.filter(j => j.k === 'test_interventions').length).toBe(1);   // une écriture complète pour un clic — deux avant le lot 5 du cadrage 11
    });

    it('I-3 · Ouvrir une intervention d\'un AUTRE groupe-cours, puis l\'enregistrer sans rien toucher : ses participants étaient retirés — depuis #772, ce que le formulaire ne montre pas reste (valeur d\'après)', () => {
        const store = storeBase();
        // L'intervention a été planifiée quand GC2 était actif : Dario (GC2) en est le seul participant.
        store.test_interventions = [{ id: 'I2', titre: 'Suivi Dario', date: '2026-09-01', heure: '', duree: 2, type: 'individuel', niveauRai: 3, contexte: 'hors-classe', description: '',
            etudiants: ['2000004'], analyse: null, observations: '', notesIndividuelles: { 2000004: 'Plan de travail convenu.' }, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }];
        // GC1 est actif : le formulaire ne construit des cases que pour ses élèves (obtenirEtudiantsCoursActif) — Dario n'a pas de case.
        const conteneur = elementDom();
        const b = monterI(store, { elements: { conteneurPrincipal: conteneur, interventionNiveau: elementDom({ value: '3' }), interventionContexte: elementDom({ value: 'hors-classe' }), interventionTitre: elementDom({ value: 'Suivi Dario' }), interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '2' }), interventionDescription: elementDom({ value: '' }), observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) },
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': ['2000001', '2000002', '2000003'].map(da => elementDom({ value: da })), '#listeEtudiantsIntervention input[type="checkbox"]:checked': [], 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] } });
        b.win.ouvrirIntervention('I2', {});
        const html = conteneur.innerHTML;
        const casesRendues = (html.match(/id="etud-\d+"/g) || []);
        // Puis « Enregistrer » sans toucher à rien.
        b.win.sauvegarderPresencesIntervention('I2');
        const i = store.test_interventions[0];
        noter('I3', { casesRendues, listeVisible: html.includes('2000004'), etudiantsApres: i.etudiants, notesApres: i.notesIndividuelles, liste: html.includes('Dautre') });
        expect(casesRendues.sort()).toEqual(['id="etud-2000001"', 'id="etud-2000002"', 'id="etud-2000003"']);   // les trois de GC1, triés par nom à l'écran ; pas Dario
        // Avant #772 : [] et {} — Dario et sa note disparaissaient. Après : conservés, faute de case pour eux.
        expect(i.etudiants).toEqual(['2000004']);
        expect(i.notesIndividuelles).toEqual({ 2000004: 'Plan de travail convenu.' });
    });

    it('I-4 · La liste : le TITRE et la description entraient bruts (règle 1) — depuis #769, échappés partout (valeur d\'après)', () => {
        const store = storeBase();
        store.test_interventions = [{ id: 'I3', titre: 'Rattrapage <b>x</b> "y"', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'rattrapage', description: 'desc <i>z</i>',
            etudiants: ['2000001'], analyse: { nbEtudiants: 1, patternsCommuns: {}, progressions: {}, niveauxRai: { 1: 0, 2: 1, 3: 0 } }, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }];
        const liste = elementDom(), conteneur = elementDom();
        const b = monterI(store, { elements: { listeInterventions: liste, conteneurPrincipal: conteneur } });
        b.win.afficherListeInterventions();
        b.win.ouvrirIntervention('I3', {});
        noter('I4', { listeBrut: liste.innerHTML.includes('Rattrapage <b>x</b>'), formulaireEchappe: conteneur.innerHTML.includes('Rattrapage &lt;b&gt;x&lt;/b&gt;'), descriptionBrute: conteneur.innerHTML.includes('desc <i>z</i>') });
        expect(liste.innerHTML).not.toContain('Rattrapage <b>x</b> "y"');             // avant #769 : brut dans la liste
        expect(liste.innerHTML).toContain('Rattrapage &lt;b&gt;x&lt;/b&gt;');
        expect(conteneur.innerHTML).toContain('Rattrapage &lt;b&gt;x&lt;/b&gt;');      // échappé dans le champ titre du formulaire
        expect(conteneur.innerHTML).toContain('<textarea id="interventionDescription"');
        expect(conteneur.innerHTML).toContain('desc &lt;i&gt;z&lt;/i&gt;</textarea>'); // avant #769 : brute dans son textarea
    });

    it('I-5 · Le bilan : ses lettres venaient de 0,65/0,75/0,85 en clair, quand la suggestion d\'objectif du même écran lisait 0,64 — depuis le 30 oct. 2026, les deux lisent l\'échelle ; depuis le lot 5 du cadrage 11, la lettre sort des mêmes seuils (valeur d\'après)', () => {
        const store = storeBase();
        store.test_evaluationsSauvegardees = [copieSurEchelle(ECHELLE_I)];
        store.test_interventions = [{ id: 'I4', titre: 'Fini', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'rattrapage', description: '',
            etudiants: ['2000001'], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: ['Structure'], objectifVise: '', statut: 'completee',
            snapshotAvant: { 2000001: { P: 60, criteres: { structure: 0.645 } } }, bilan: { atteint: 'oui', suite: 'aucune', observationsBilan: '', dateBilan: 1 }, jamaisSauvegardee: false }];
        const conteneur = elementDom();
        const b = monterI(store, { elements: { conteneurPrincipal: conteneur } });
        b.win.ouvrirIntervention('I4', {});
        const html = conteneur.innerHTML;
        // La moyenne « avant » vaut 0,645, affichée 65 % : D dans l'échelle du banc (D à partir de 65).
        const bloc = html.slice(html.indexOf('Structure', html.indexOf('Bilan')));
        const m = bloc.match(/<td[^>]*>\s*([IDME—])\s+(\d+)\u00A0%/);
        noter('I5', { lettreAvant: m && m[1], pctAvant: m && m[2], present: html.includes('Bilan'), cellule: (bloc.match(/<td[^>]*>\s*[IDME—]\s+\d+\u00A0%/) || [''])[0].replace(/<[^>]+>/g, '').trim() });
        expect(html).toContain('Bilan');
        // Constat d'origine (6 sept.) : « I » à côté de « 65 % » (seuil 0,65 en clair, arrondi indépendant de la lettre).
        expect(m && m[1]).toBe('D');
        expect(m && m[2]).toBe('65');
    });

    it('I-6 · Rechargement : ce qui est écrit se relit à l\'identique ; le tableau est namespacé (test_interventions) ; la date passe d\'ISO à timestamp', () => {
        const store = storeBase(); store.test_interventions = [];
        const b = monterI(store, { selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]:checked': [elementDom({ value: '2000001', checked: true })], 'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] },
            elements: { interventionNiveau: elementDom({ value: '2' }), interventionContexte: elementDom({ value: 'rattrapage' }), interventionTitre: elementDom({ value: 'T' }), interventionDate: elementDom({ value: '2026-09-02' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '1.5' }), interventionDescription: elementDom({ value: 'd' }), observationsIntervention: elementDom({ value: 'o' }), objectifVise: elementDom({ value: 'obj' }), 'note-2000001': elementDom({ value: 'n1' }) } });
        b.win.afficherFormulaireIntervention();
        // Lot 5 du cadrage 11 : le brouillon vit en mémoire — son id se lit sur le bouton « Enregistrer ».
        const id = (b.document.getElementById('conteneurPrincipal').innerHTML.match(/data-action="sauvegarderPresencesIntervention" data-param="([^"]+)"/) || [])[1];
        expect(store.test_interventions.length).toBe(0);
        b.win.sauvegarderPresencesIntervention(id);
        const typeCreation = typeof store.test_interventions[0].dateCreation;
        const ecrit = clone(store.test_interventions[0]);
        const b2 = monterI(store);
        const relu = b2.win.obtenirIntervention(id);
        noter('I6', { cles: Object.keys(store).filter(k => /interv/i.test(k)), typeCreation, typeModification: typeof ecrit.dateModification, identique: JSON.stringify(relu) === JSON.stringify(ecrit) || null });
        expect(Object.keys(store).filter(k => /interv/i.test(k))).toEqual(['test_interventions']);
        expect(typeCreation).toBe('string');
        expect(typeof ecrit.dateModification).toBe('number');
        // obtenirIntervention pose des défauts sur l'objet relu (criteresCibles/objectifVise/bilan) : les champs écrits, eux, sont identiques.
        for (const k of Object.keys(ecrit)) expect(relu[k]).toEqual(ecrit[k]);
    });

    it('I-7 · Note individuelle d\'un élève parti (#748) : l\'en-tête comptait 2 notes pour une seule ligne rendue — depuis le lot 5 du cadrage 11, la note reste, grisée, « (n\'est plus dans le groupe) » (valeur d\'après)', () => {
        const store = storeBase();
        store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da !== '2000002');   // Bruno a quitté le trimestre
        store.test_interventions = [{ id: 'I5', titre: 'T', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'rattrapage', description: '',
            etudiants: ['2000001', '2000002'], analyse: { nbEtudiants: 2, patternsCommuns: {}, progressions: {}, niveauxRai: { 1: 0, 2: 2, 3: 0 } }, observations: '', notesIndividuelles: { 2000001: 'a', 2000002: 'b' }, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }];
        const liste = elementDom();
        const b = monterI(store, { elements: { listeInterventions: liste } });
        b.win.afficherListeInterventions();
        const html = liste.innerHTML;
        const bloc = html.slice(html.indexOf('Notes individuelles'));
        noter('I7', { compteur: (bloc.match(/<strong>(\d+)<\/strong>/) || [])[1], lignesAlice: (bloc.match(/Alice/g) || []).length, lignesBruno: (bloc.match(/Bruno|2000002/g) || []).length });
        expect(html).toContain('Notes individuelles');
        expect(bloc).toContain('Alice');
        // Constat d'origine (6 sept.) : ni « Bruno » ni « 2000002 » — sa note n'était pas rendue. Bruno a quitté le
        // trimestre : plus de fiche, donc son DA, grisé, avec la mention ; le compteur compte ses deux lignes.
        expect(bloc).toContain('<div class="etud-texte-gris-clair" style="margin-bottom: 8px; font-size: 0.9rem;">');
        expect(bloc).toContain('<strong>2000002</strong> (n\'est plus dans le groupe) : b');
        expect((bloc.match(/<strong>(\d+)<\/strong>/) || [])[1]).toBe('2');
    });
});

/* =============================================================================================
   1 · SUIVI DU GROUPE — js/tableau-bord-apercu.js
   ============================================================================================= */
describe('1 · Suivi du groupe — liste suivie, filtres, états', () => {
    const INTERNES_G = ['obtenirEtudiantsSuivis', 'sauvegarderEtudiantsSuivis', 'ajouterEtudiantSuivi', 'retirerEtudiantSuivi', 'nettoyerEtudiantsSuivis', 'appliquerFiltres', '_filtresActifs', '_tousEtudiantsEnrichis', '_etudiantsPrioritaires', 'MAX_ETUDIANTS_SUIVIS', 'CLE_SUIVI', 'genererBadgePratique', 'genererBadgeSourceDonnees'];
    const GLOBAUX_G = { calculerTousLesIndices: () => ({ A: 90, C: 100, P: 80, noteConstructible: true }), calculerIndicesEtudiant: () => ({ A: 90, C: 100, P: 80 }),
        determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable' }), diagnostiquerSuiviApprentissage: () => null, determinerCibleIntervention: () => ({}),
        obtenirTypePratiqueActive: () => 'standards', obtenirTermeProduction: () => 'artefact', accordTermeProduction: (n) => n + ' artefact(s)', obtenirLabelNoteFinale: () => 'Note', obtenirCodePratique: () => 'STD' };
    function storeSix() { const st = storeBase(); st.test_groupeEtudiants.push({ da: '2000005', nom: 'Einstein', prenom: 'Eva', groupe: '01', coursId: 'GC1', statut: 'actif' }, { da: '2000006', nom: 'Fermi', prenom: 'Fanny', groupe: '01', coursId: 'GC1', statut: 'actif' }); return st; }
    const monterG = (store, opts = {}) => monter(store, Object.assign({ modules: [{ chemin: 'js/tableau-bord-apercu.js', internes: INTERNES_G }], globaux: GLOBAUX_G }, opts));

    it('G-1 · La liste suivie : cinq ajouts acceptés, le DA d\'un autre groupe refusé À L\'AJOUT, le sixième refusé AVEC notification ; la clé est PAR GROUPE-COURS — valeurs d\'après #749 (11 sept.)', () => {
        // Constat d'origine (6 sept.) : 2000004 (GC2) accepté puis purgé ; sixième refus muet ; clé NUE `etudiantsSuivis`.
        const store = storeSix();
        const b = monterG(store);
        const i = b.interne['tableau-bord-apercu.js'];
        const acceptes = ['2000001', '2000002', '2000003', '2000004', '2000005', '2000006'].map(da => i.ajouterEtudiantSuivi(da));
        noter('G1', { max: i.MAX_ETUDIANTS_SUIVIS, cle: i.CLE_SUIVI, acceptes, cles: Object.keys(store).filter(k => /suivi/i.test(k)), notifs: b.notifs.length, avert: b.avertissements.length, liste: i.obtenirEtudiantsSuivis() });
        expect(acceptes).toEqual([true, true, true, false, true, true]);   // 2000004 est dans GC2 : refusé à l'ajout
        expect(i.obtenirEtudiantsSuivis().map(s => s.da)).toEqual(['2000001', '2000002', '2000003', '2000005', '2000006']);
        expect(i.ajouterEtudiantSuivi('2000007')).toBe(false);   // hors du groupe : refusé, sans bruit
        const nbNotifsAvant = b.notifs.length;
        store.test_groupeEtudiants.push({ da: '2000008', nom: 'Gauss', prenom: 'Gina', groupe: '01', coursId: 'GC1', statut: 'actif' });
        expect(i.ajouterEtudiantSuivi('2000008')).toBe(false);   // le sixième du groupe : refusé…
        expect(b.notifs.length).toBe(nbNotifsAvant + 1);          // …et dit
        expect(b.notifs[b.notifs.length - 1].type).toBe('info');
        expect(Object.keys(store).filter(k => /suivi/i.test(k))).toEqual(['test_etudiantsSuivis_gc_GC1']);
    });

    it('G-2 · Changer de groupe-cours puis afficher le panneau : la liste suivie du groupe A SURVIT, rien n\'est écrit sous B — valeur d\'après #749 (11 sept. ; constat d\'origine : purgée en base, vide au retour)', () => {
        const store = storeSix();
        const b = monterG(store);
        const i = b.interne['tableau-bord-apercu.js'];
        ['2000001', '2000002'].forEach(da => i.ajouterEtudiantSuivi(da));
        const avant = i.obtenirEtudiantsSuivis().map(s => s.da);
        // Le groupe-cours actif devient GC2 (le geste de Cadre), puis le panneau se rend : nettoyerEtudiantsSuivis est appelé à chaque rendu (:256).
        store.infoCours = { id: 'GC2', nom: 'Autre', groupe: '02', _groupeCoursId: 'GC2' }; store.groupeCoursActif = { id: 'GC2', coursId: 'GC2', groupeNum: '02', trimestreId: 'test' };
        const b2 = monterG(store);
        const i2 = b2.interne['tableau-bord-apercu.js'];
        const sousGC2 = i2.nettoyerEtudiantsSuivis().map(s => s.da);
        const ecritureSousGC2 = b2.journal.filter(j => j.k === 'etudiantsSuivis').map(j => j.v.map(s => s.da));
        // Retour à GC1.
        store.infoCours = { id: 'GC1', nom: 'Cours banc', groupe: '01', _groupeCoursId: 'GC1' }; store.groupeCoursActif = { id: 'GC1', coursId: 'GC1', groupeNum: '01', trimestreId: 'test' };
        const b3 = monterG(store);
        const apres = b3.interne['tableau-bord-apercu.js'].obtenirEtudiantsSuivis().map(s => s.da);
        const ecrituresSousGC2 = b2.journal.filter(j => /etudiantsSuivis/.test(j.k)).map(j => j.k);
        noter('G2', { avant, sousGC2, ecritureSousGC2, ecrituresSousGC2, apresRetourGC1: apres });
        expect(avant).toEqual(['2000001', '2000002']);
        expect(sousGC2).toEqual([]);              // B a sa propre liste, vide
        expect(ecritureSousGC2).toEqual([]);      // la clé nue n'est plus jamais écrite
        expect(ecrituresSousGC2).toEqual([]);     // et ouvrir « Détails » sous B n'écrit RIEN
        expect(apres).toEqual(['2000001', '2000002']);   // le cas réel de l'audit : GC1 survit
    });

    it('G-3 · Un élève passé en « abandon » libère son siège à la lecture, sans perdre son entrée en base — valeur d\'après #749 (constat d\'origine : siège occupé, invisible)', () => {
        const store = storeSix();
        const b = monterG(store);
        const i = b.interne['tableau-bord-apercu.js'];
        ['2000001', '2000002'].forEach(da => i.ajouterEtudiantSuivi(da));
        store.test_groupeEtudiants.find(e => e.da === '2000001').statut = 'abandon';
        const b2 = monterG(store);
        const i2 = b2.interne['tableau-bord-apercu.js'];
        const liste = i2.nettoyerEtudiantsSuivis().map(s => s.da);
        const actifsAffiches = store.test_groupeEtudiants.filter(e => e.coursId === 'GC1' && !['inactif', 'décrochage', 'abandon'].includes(e.statut)).map(e => e.da);
        const enBase = store.test_etudiantsSuivis_gc_GC1.map(s => s.da);
        noter('G3', { liste, enBase, actifsAffiches: actifsAffiches.length });
        expect(liste).not.toContain('2000001');   // le siège est libre : (1/5), pas (2/5)
        expect(enBase).toContain('2000001');      // mais rien n'a été effacé
        expect(actifsAffiches).not.toContain('2000001');
    });

    it('G-4 · Sans pratique de notation : aucun état vide — le mode d\'affichage retombe sur « standards » et le badge affirme une pratique', () => {
        const store = storeBase();
        const b = monterG(store);
        const mode = b.win.determinerModeAffichageTableauBord(null);
        const i = b.interne['tableau-bord-apercu.js'];
        let badge = null; try { badge = i.genererBadgePratique(); } catch (e) { badge = 'erreur: ' + e.message; }
        noter('G4', { mode, badge: String(badge).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) });
        expect(mode).toEqual({ afficherSom: false, afficherPan: true });
        expect(String(badge)).not.toMatch(/aucune pratique/i);
    });

    it('G-5 · Le filtre sur P ÉCARTE un élève dont le P n\'est pas constructible (affiché « — ») — valeur d\'après #749 (constat d\'origine : retenu)', () => {
        const store = storeSix();
        const b = monterG(store);
        const i = b.interne['tableau-bord-apercu.js'];
        i._tousEtudiantsEnrichis = [
            { da: '2000001', nom: 'Assidu', A: 90, C: 100, P: 80, M: 95, niveau: 1, suivi: null, noteConstructible: true },
            { da: '2000003', nom: 'Silence', A: 90, C: 0, P: 0, M: 45, niveau: 1, suivi: null, noteConstructible: false }
        ];
        i._filtresActifs = ['P'];
        i.appliquerFiltres();
        const retenus = i._etudiantsPrioritaires.map(e => e.da);
        noter('G5', { retenus });
        expect(retenus).toEqual([]);   // 2000003 affiche « — » : il ne peut pas être sous la borne
    });
});

/* =============================================================================================
   2 · LISTE DES ÉTUDIANT·ES — js/etudiants.js (+ trimestre-v2-etudiants.js pour l'ajout)
   ============================================================================================= */
describe('2 · Liste des étudiant·es — tris, filtres, écritures par rendu, ajout', () => {
    function monterL(store, opts = {}) {
        const compteurs = { assiduite: 0, cp: 0 };
        const globaux = Object.assign({
            determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable', label: 'Universel' }), calculerCorrelationPearson: () => 0,
            calculerTousLesIndices: (da) => (store.indicesBanc && store.indicesBanc[da]) || { A: 90, C: 100, P: 80, noteConstructible: true },
            calculerEtSauvegarderIndicesAssiduite: () => { compteurs.assiduite++; }, calculerEtStockerIndicesCP: () => { compteurs.cp++; },
            obtenirConfigPratiqueActive: () => ({ portfolio: { minimumCompletion: 3 } }), obtenirInterventionsEtudiant: () => [], obtenirTypePratiqueActive: () => 'standards',
            obtenirTermeProduction: () => 'artefact', obtenirCodePratique: () => 'STD'
        }, opts.globaux || {});
        const b = monter(store, Object.assign({}, opts, { modules: ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/etudiants.js', { chemin: 'js/trimestre-v2-etudiants.js', internes: ['donneesImportEnAttenteV2'] }], globaux }));
        b.compteurs = compteurs;
        return b;
    }
    // Les lignes sont créées par createElement('tr') + appendChild : on lit les enfants du tbody, pas son innerHTML.
    const htmlTbody = (b) => { const t = b.document.getElementById('tbody-suivi-liste'); return t.innerHTML + t.children.map(c => c.innerHTML).join(''); };
    // Quand le filtre ne retient personne, la fonction sort AVANT de vider le tbody et masque la table : on lit donc 0 ligne si la table est masquée.
    const dasDuTbody = (b) => (b.document.getElementById('tableEtudiantsListe').classList.contains('u-hide') ? [] : (htmlTbody(b).match(/<td[^>]*>(\d{6,7})<\/td>/g) || []).map(x => x.replace(/<[^>]+>/g, '')));

    it('L-1 · Tri « DA » numérique (999999 avant 1000123) ; tri « # » sur l\'ordre d\'origine, dans les deux sens — valeurs d\'après #749 lot 2 (11 sept. ; constat d\'origine : lexicographique, sans effet)', () => {
        const store = storeBase();
        store.test_groupeEtudiants = [
            { da: '999999', nom: 'Zed', prenom: 'Zoé', groupe: '01', coursId: 'GC1', statut: 'actif' },
            { da: '2000001', nom: 'Assidu', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
            { da: '1000123', nom: 'Milieu', prenom: 'Max', groupe: '01', coursId: 'GC1', statut: 'actif' }
        ];
        const b = monterL(store);
        b.win.trierTableauPar('da');           // nom asc → da asc
        const ordreDA = dasDuTbody(b);
        b.win.trierTableauPar('num');          // da → num
        const ordreNum = dasDuTbody(b);
        b.win.trierTableauPar('num');          // num desc
        const ordreNumDesc = dasDuTbody(b);
        noter('L1', { ordreDA, ordreNum, ordreNumDesc, extrait: htmlTbody(b).slice(0, 300) });
        expect(ordreDA).toEqual(['999999', '1000123', '2000001']);       // numérique
        expect(ordreNum).toEqual(['999999', '2000001', '1000123']);        // « # » asc = l'ordre d'origine (stockage)
        expect(ordreNumDesc).toEqual(['1000123', '2000001', '999999']);    // « # » desc = renversé
    });

    it('L-2 · Un élève « abandon » RESTE dans le tableau, grisé, avec son statut — valeur d\'après #749 lot 2 (décision de Grégoire 11 sept. ; constat d\'origine : absent, la note de l\'écran mentait)', () => {
        const store = storeBase();
        store.test_groupeEtudiants[1].statut = 'abandon';
        const b = monterL(store);
        b.win.afficherListeEtudiantsConsultation();
        const das = dasDuTbody(b);
        const lignes = readFileSync(path.join(RACINE, 'index.html'), 'utf8').split('\n');
        // #853 (13 sept. 2026) : bornes par REPÈRE — la sous-section Liste, jusqu'à celle de la saisie —,
        // plus par numéros de ligne fixes (7700-7912), que tout ajout plus haut dans index.html décale.
        const debutListe = lignes.findIndex(l => /id="suivi-liste"/.test(l));
        const debutSaisie = lignes.findIndex(l => /id="suivi-saisie"/.test(l));
        const ligneIndex = lignes.findIndex((l, i) => i > debutListe && i < debutSaisie && /Les abandons/.test(l)) + 1;
        const phrase = (lignes[ligneIndex - 1] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 260);
        const t = b.document.getElementById('tbody-suivi-liste');
        const ligneAbandon = t.children.find(tr => tr.classList.contains('etudiant-inactif'));
        noter('L2', { das, ligneIndex, phrase, grisee: !!ligneAbandon, statut: ligneAbandon && ligneAbandon.dataset.statut });
        expect(das).toEqual(['2000002', '2000001', '2000003']);   // tri par nom : Absent, Assidu, Silence — l'abandon (Absent) est là
        expect(ligneAbandon && ligneAbandon.dataset.statut).toBe('abandon');
        expect(ligneAbandon.innerHTML).toContain('(Abandon)');
        expect(debutListe).toBeGreaterThan(0);
        expect(ligneIndex).toBeGreaterThan(debutListe + 1);   // la phrase est DANS la sous-section Liste
        expect(ligneIndex).toBeLessThan(debutSaisie + 1);
    });

    it('L-3 · La recherche par nom : insensible à la casse ET aux accents — valeur d\'après #749 lot 2 (constat d\'origine : un nom accentué cherché sans accent ne se trouvait pas ; élève en totem depuis #1180)', () => {
        const store = storeBase();
        store.test_groupeEtudiants[0] = { da: '2000001', nom: 'Chaleureux', prenom: 'Hérisson', groupe: '01', coursId: 'GC1', statut: 'actif' };
        const b = monterL(store);
        const chercher = (t) => { b.document.getElementById('recherche-nom-liste').value = t; b.win.afficherListeEtudiantsConsultation(); return dasDuTbody(b).length; };
        const r = { 'hérisson': chercher('hérisson'), 'HÉRISSON': chercher('HÉRISSON'), 'herisson': chercher('herisson'), 'chaleureux': chercher('chaleureux') };
        noter('L3', r);
        expect(r['hérisson']).toBe(1); expect(r['HÉRISSON']).toBe(1); expect(r['herisson']).toBe(1); expect(r['chaleureux']).toBe(1);
    });

    it('L-4 · Chaque rendu relance l\'assiduité ×1, qui chaîne CP — plus d\'appel direct à CP depuis etudiants.js — valeur d\'après #749 lot 2 (constat d\'origine : CP ×2 par rendu)', () => {
        const store = storeBase();
        const b = monterL(store);
        b.win.afficherListeEtudiantsConsultation();
        const apresUn = clone(b.compteurs);
        b.document.getElementById('recherche-nom-liste').value = 'a'; b.win.afficherListeEtudiantsConsultation();
        b.document.getElementById('recherche-nom-liste').value = 'as'; b.win.afficherListeEtudiantsConsultation();
        const grep = (readFileSync(path.join(RACINE, 'js/indices.js'), 'utf8').match(/calculerEtStockerIndicesCP\(\)/g) || []).length;
        noter('L4', { apresUnRendu: apresUn, apresTroisRendus: clone(b.compteurs), appelsCPDansIndicesJs: grep });
        expect(apresUn).toEqual({ assiduite: 1, cp: 0 });      // CP vient de la chaîne d'indices.js, non stubée ici
        expect(b.compteurs).toEqual({ assiduite: 3, cp: 0 });
        expect(grep).toBeGreaterThanOrEqual(1);
    });

    it('L-5 · Le filtre pattern offre les six patterns du code et rien d\'autre — valeur d\'après #749 lot 2 (constat d\'origine : « En progression » morte, deux patterns non filtrables)', () => {
        // #853 (13 sept. 2026) : le MENU du filtre, par repère — plus une fenêtre de lignes fixes, que
        // tout ajout plus haut dans index.html décale (l'absence de « progression » y aurait été
        // vérifiée hors du menu).
        const index = readFileSync(path.join(RACINE, 'index.html'), 'utf8').split('id="filtre-pattern-liste"')[1].split('</select>')[0];
        const calculs = readFileSync(path.join(RACINE, 'js/profil-etudiant-calculs.js'), 'utf8');
        const option = /value="progression"/.test(index);
        const patterns = ['Stable', 'Défi spécifique', 'Difficulté émergente', 'Difficulté persistante', 'Non-participation', 'Données insuffisantes', 'En progression'].map(p => [p, (calculs.match(new RegExp("'" + p + "'", 'g')) || []).length]);
        noter('L5', { option, patterns });
        expect(option).toBe(false);
        expect(patterns.find(p => p[0] === 'En progression')[1]).toBe(0);
        expect(patterns.find(p => p[0] === 'Stable')[1]).toBeGreaterThan(0);
        expect(/value="non-participation"/.test(index) && /value="donnees-insuffisantes"/.test(index)).toBe(true);
    });

    it('L-6 · Ajouter un élève dont le DA existe déjà (Cadre › Trimestre) : REFUSÉ, une seule fiche, notification nommant l\'élève existant — valeur d\'après #749 lot 2 (constat d\'origine : accepté, deux fiches)', async () => {
        const store = storeBase();
        const b = monterL(store, { elements: { 'v2-etudiantDA': elementDom({ value: '2000001' }), 'v2-etudiantNom': elementDom({ value: 'Doublon' }), 'v2-etudiantPrenom': elementDom({ value: 'Dede' }), 'v2-etudiantProgramme': elementDom({ value: '' }), 'v2-etudiantSA': elementDom({ value: '' }), 'v2-etudiantGroupe': elementDom({ value: '1' }) } });
        let erreur = null;
        try { await b.win.soumettreEtudiantV2(); } catch (e) { erreur = e.message; }
        const fiches = store.test_groupeEtudiants.filter(e => e.da === '2000001');
        noter('L6', { erreur, nbFichesMemeDA: fiches.length, groupeEcrit: fiches[1] && fiches[1].groupe, notifs: b.notifs.map(n => n.type + ':' + n.t) });
        expect(fiches.length).toBe(1);
        // ↻ Lot E2 (28 sept. 2026) : le refus parle par le témoin commun (« Non enregistré – Ajouter l'étudiant·e : … »).
        expect(b.notifs.some(n => n.type === 'nonEnregistre' && /^ce DA est déjà dans le groupe : Alice Assidu\./.test(n.t))).toBe(true);
        // Et un DA neuf, groupe « 1 » : écrit PADÉ (L-9)
        b.document.getElementById('v2-etudiantDA').value = '2000099';
        await b.win.soumettreEtudiantV2();
        expect(store.test_groupeEtudiants.find(e => e.da === '2000099').groupe).toBe('00001');
    });
    it('L-7 · Confirmer un import (Cadre › Trimestre) : les élèves étaient ÉCRITS puis la fonction levait ReferenceError sans confirmation — depuis #771, elle notifie (valeur d\'après)', async () => {
        const store = storeBase();
        const b = monterL(store);
        b.interne['trimestre-v2-etudiants.js'].donneesImportEnAttenteV2 = [{ da: '3000001', nom: 'Importé', prenom: 'Ivan', groupe: '01', programme: '' }, { da: '3000002', nom: 'Importée', prenom: 'Ida', groupe: '01', programme: '' }];
        let erreur = null;
        try { await b.win.confirmerImportV2(); } catch (e) { erreur = e.constructor.name + ': ' + e.message; }
        noter('L7', { erreur, nbApres: store.test_groupeEtudiants.length, notifsSucces: b.notifs.filter(n => n.type === 'succes').length });
        expect(store.test_groupeEtudiants.length).toBe(6);                       // écrits
        expect(erreur).toBe(null);                                                 // avant #771 : ReferenceError après l'écriture
        expect(b.notifs.filter(n => n.type === 'succes').length).toBe(1);         // et « 2 étudiant(s) importé(s) — 6 au total dans le groupe »
    });
});

/* =============================================================================================
   3 · SAISIE DES PRÉSENCES — js/saisie-presences.js
   ============================================================================================= */
describe('3 · Saisie des présences — écritures, répétition, verrouillage, barre du compteur', () => {
    const DATE = '2026-09-01';
    function monterS(store, opts = {}) {
        store.test_calendrierComplet = store.test_calendrierComplet || { [DATE]: { statut: 'cours', numeroSemaine: 2, jourSemaine: 'Mardi' }, '2026-09-03': { statut: 'cours', numeroSemaine: 2, jourSemaine: 'Jeudi' } };
        store.test_seancesCompletes = store.test_seancesCompletes || { [DATE]: [{ id: 'S1', date: DATE, nombrePeriodes: 2, numeroSemaine: 2, jour: 'Mardi' }] };
        store.test_horaire = store.test_horaire || [{ jour: 'Mardi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }];
        const compteurs = { assiduite: 0 };
        const globaux = Object.assign({ obtenirInfosJour: (d) => (store.test_calendrierComplet[d] || null), obtenirSeancesJour: (d) => (store.test_seancesCompletes[d] || []),
            calculerAssiduitePourAffichage: () => ({ taux: 100, periodesPresentes: 2, periodesTotal: 2 }), calculerEtSauvegarderIndicesAssiduite: () => { compteurs.assiduite++; },
            obtenirRangSeanceDansSemaine: () => 1, pluriel: (n, s) => s, genererCalendrierComplet() {}, cleSeancesCompletes: () => 'test_seancesCompletes', DUREE_PERIODE_DEFAUT: 50,
            obtenirCoursActifId: () => (opts.coursIdNul ? null : (store.infoCours && store.infoCours.id)) }, opts.globaux || {});
        const elements = Object.assign({ 'date-cours': elementDom({ value: DATE }), selectGroupePresences: elementDom({ value: '' }), selectTriPresences: elementDom({ value: 'nom' }),
            'periodes_2000001': elementDom({ value: '2' }), 'periodes_2000002': elementDom({ value: '0' }), 'periodes_2000003': elementDom({ value: '1.5' }),
            'notes_2000001': elementDom({ value: ' en retard ' }), 'notes_2000002': elementDom({ value: '' }), 'notes_2000003': elementDom({ value: '' }) }, opts.elements || {});
        const selecteurs = Object.assign({ '.input-periodes': ['2000001', '2000002', '2000003'].map(da => Object.assign(elements['periodes_' + da], { id: 'periodes_' + da, dataset: { da } })) }, opts.selecteurs || {});
        const b = monter(store, Object.assign({}, opts, { modules: [{ chemin: 'js/saisie-presences.js', internes: ['restaurerCompteurPresences', 'validerDateSaisie', 'verifierConfigurationFormatHoraire'] }], globaux, elements, selecteurs }));
        b.compteurs = compteurs;
        return b;
    }
    const presencesEcrites = (store) => clone(store.test_presences).map(p => ({ date: p.date, da: p.da, periodesPresentes: p.periodesPresentes, notes: p.notes, coursId: p.coursId, facultatif: p.facultatif, heures: p.heures }));

    // Lot D (27 sept. 2026) : « Enregistrer » est devenu « Confirmer la séance » (écrivain unique
    // `ecrirePresencesSeance`). Sur une séance saisie, le répéter n'a plus rien à écrire.
    it('S-1 · Confirmer la séance : un enregistrement par (da, date, coursId), forme {date, da, periodesPresentes, notes, coursId} ; répété deux fois → identique ; relu tel quel', () => {
        const store = storeBase();
        store.test_presences = [{ date: DATE, da: '2000004', periodesPresentes: 2, notes: '', coursId: 'GC2' }];   // une fiche d'un autre cours, même jour
        const b = monterS(store);
        b.win.confirmerSeancePresences();
        const premiere = presencesEcrites(store);
        b.win.confirmerSeancePresences();
        const seconde = presencesEcrites(store);
        const b2 = monterS(store);
        const relu = b2.db.getSync('test_presences');
        noter('S1', { premiere, identiqueApresRepetition: JSON.stringify(premiere) === JSON.stringify(seconde), ecrituresPresences: b.journal.filter(j => j.k === 'test_presences').length, notifs: b.notifs.map(n => n.t), relu: relu.length });
        expect(premiere).toEqual([
            { date: DATE, da: '2000004', periodesPresentes: 2, notes: '', coursId: 'GC2', facultatif: undefined, heures: undefined },
            { date: DATE, da: '2000001', periodesPresentes: 2, notes: 'en retard', coursId: 'GC1', facultatif: undefined, heures: undefined },
            { date: DATE, da: '2000002', periodesPresentes: 0, notes: '', coursId: 'GC1', facultatif: undefined, heures: undefined },
            { date: DATE, da: '2000003', periodesPresentes: 1.5, notes: '', coursId: 'GC1', facultatif: undefined, heures: undefined }
        ]);
        expect(seconde).toEqual(premiere);
        expect(JSON.stringify(relu)).toBe(JSON.stringify(store.test_presences));
    });

    it('S-2 · Deux gestes à la suite (2 périodes puis 0 pour Alice) : le second remplace le premier — pas de doublon, pas de fusion', () => {
        const store = storeBase(); store.test_presences = [];
        const b = monterS(store);
        b.win.confirmerSeancePresences();
        b.elements['periodes_2000001'].value = '0';
        b.win.mettreAJourLignePeriodesHandler({ dataset: { da: '2000001', dateStr: DATE, nbPeriodes: '2' } });
        b.win.viderEnregistrementPresences();
        const alice = store.test_presences.filter(p => p.da === '2000001');
        noter('S2', { fichesAlice: alice.length, periodes: alice[0] && alice[0].periodesPresentes });
        expect(alice.length).toBe(1);
        expect(alice[0].periodesPresentes).toBe(0);
    });

    it('S-3 · Si le cours actif est introuvable au clic (coursId null) : rien n\'est écrit, la fiche GC2 d\'Alice survit — valeur d\'après #749 lot 3 (11 sept. ; constat d\'origine : la fiche de l\'autre cours remplacée par une fiche coursId: null)', () => {
        const store = storeBase();
        store.test_presences = [{ date: DATE, da: '2000001', periodesPresentes: 2, notes: 'GC2', coursId: 'GC2' }];   // Alice suit aussi GC2
        const b = monterS(store, { coursIdNul: true });
        b.win.confirmerSeancePresences();
        const alice = store.test_presences.filter(p => p.da === '2000001');
        noter('S3', { fichesAlice: alice.map(p => ({ coursId: p.coursId, notes: p.notes })), ecritures: b.journal.filter(j => j.k === 'test_presences').length });
        expect(alice.length).toBe(1);
        expect(alice[0].coursId).toBe('GC2');       // avant le lot 3 : null
        expect(alice[0].notes).toBe('GC2');         // avant : 'en retard' (la fiche GC2 n'existait plus)
        expect(b.journal.filter(j => j.k === 'test_presences')).toHaveLength(0);
    });

    it('S-4 · Verrouiller une date : écrit sous `<trim>_datesVerrouillees_gc_<gc>` — valeur d\'après #749 lot 3 (11 sept. ; constat d\'origine : clé NUE partagée entre trimestres et cours) ; réécrit toujours les présences sans passer par le mode (#736, cité)', () => {
        const store = storeBase(); store.test_presences = [];
        const b = monterS(store);
        b.win.basculerVerrouillageDate(DATE);
        const cles = b.journal.map(j => j.k);
        noter('S4', { cles, datesVerrouillees: store['test_datesVerrouillees_gc_GC1'], presences: store.test_presences.length, verrou: b.interne['saisie-presences.js'].validerDateSaisie(DATE) });
        expect(store['test_datesVerrouillees_gc_GC1']).toEqual([DATE]);   // avant : store.datesVerrouillees
        expect(cles).not.toContain('datesVerrouillees');
        expect(Object.keys(store)).not.toContain('datesVerrouillees');
        expect(store.test_presences.length).toBe(3);
        // Déverrouiller : idempotent (retour à l'état initial).
        b.win.basculerVerrouillageDate(DATE);
        expect(store['test_datesVerrouillees_gc_GC1']).toEqual([]);
    });

    it('S-5 · La barre du compteur reconstruite au premier rendu : « Rapport » avait disparu et « Annuler » visait suivi-apercu-legacy — depuis #768, Rapport présent et Annuler → suivi-liste (valeur d\'après)', () => {
        const store = storeBase();
        const b = monterS(store);
        // #782 (7 sept. 2026) — MESURE MISE À JOUR. Le 6 sept., cette rangée lisait
        // la barre RECONSTRUITE par `restaurerCompteurPresences`. Cette reconstruction
        // était elle-même le défaut : elle écrasait la barre d'index.html à partir
        // d'un second gabarit, et a fait disparaître le bouton « Reporter dans Léa »
        // de la 1.124.0 sur les deux appareils. La fonction ne reconstruit plus rien ;
        // la barre n'existe qu'en statique. On mesure donc index.html, seule source.
        b.interne['saisie-presences.js'].restaurerCompteurPresences();
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8')
            .split('id="actions-presences-bar"')[1].split('</div>')[0];
        const config = readFileSync(path.join(RACINE, 'js/config.js'), 'utf8');
        const sousSectionsSuivi = (config.match(/suivi:\s*\[([\s\S]*?)\]/) || ['', ''])[1].match(/id:\s*'([^']+)'/g) || [];
        // #853 (13 sept. 2026) : fenêtre découpée par REPÈRE (la sous-section de saisie), plus par
        // numéros de ligne — sept lignes ajoutées plus haut dans index.html (réglage des jetons)
        // l'avaient décalée hors du bouton « Rapport », et l'essai rougissait sans défaut du code.
        // La ligne porte `<div id="suivi-saisie" class="sous-section">` : [1] = de la sous-section de
        // saisie jusqu'à la suivante.
        const indexHtml = readFileSync(path.join(RACINE, 'index.html'), 'utf8').split('id="suivi-saisie"')[1].split('class="sous-section"')[1];
        noter('S5', { rapportDansBarre: html.includes('ouvrirModaleRapportPresences'), rapportDansIndex: indexHtml.includes('ouvrirModaleRapportPresences'), verrou: html.includes('data-action="basculerVerrouillageDateActive"'), sousSectionsSuivi: sousSectionsSuivi.map(x => x.replace(/id:\s*'/, '').replace(/'$/, '')) });
        expect(indexHtml).toContain('ouvrirModaleRapportPresences');
        expect(html).toContain('ouvrirModaleRapportPresences');                   // avant #768 : absent de la barre reconstruite
        // ↻ 21 oct. 2026 (demande de Grégoire) : « Fermer » et la case partent ; un seul bouton, « Verrouiller la
        // saisie », sur la porte du verrou. Le retour à la liste passe par le sous-onglet « Liste », que config.js
        // déclare. Avant le lot D : « Annuler », qui visait suivi-apercu-legacy (#768).
        expect(html).toContain('data-action="basculerVerrouillageDateActive"');
        expect(html).not.toContain('fermerSaisiePresences');
        // (`sousSectionsSuivi` ci-dessus, noté seulement, cherche `suivi:` sans guillemets et rend [] ; la clé est `'suivi':`.)
        const suiviDeclare = (config.match(/'suivi':\s*\[([\s\S]*?)\]/) || ['', ''])[1];
        expect([...suiviDeclare.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1])).toContain('liste');
        expect(html).not.toContain('apercu-legacy');
    });

    it('S-6 · Le bandeau « Configuration incomplète » regarde aussi les séances complètes, et les trois préférences s\'écrivent sous `cle()` — valeur d\'après #749 lot 3 (11 sept. ; constat d\'origine : bandeau visible devant des séances, clés NUES)', () => {
        const store = storeBase();
        store.test_horaire = [];   // aucun horaire… mais des séances complètes existent (le cas du pack démo au boot)
        const b = monterS(store);
        b.interne['saisie-presences.js'].verifierConfigurationFormatHoraire();
        const alerteVisible = !b.elements['alerteFormatHoraire'].classList.contains('u-hide');
        let erreurInit = null;
        try { b.win.initialiserSaisiePresences(); } catch (e) { erreurInit = e.message; }
        const clesNues = b.journal.map(j => j.k).filter(k => /^presences_|^recherchePresences/.test(k));
        const clesTrimestre = b.journal.map(j => j.k).filter(k => /^test_presences_|^test_recherchePresences/.test(k));
        noter('S6', { alerteVisible, seancesCompletes: Object.keys(store.test_seancesCompletes).length, erreurInit, clesNues, clesTrimestre, valeurs: { date: store.test_presences_date, groupe: store.test_presences_groupe, tri: store.test_presences_tri } });
        expect(alerteVisible).toBe(false);                     // avant : true
        expect(clesNues).toEqual([]);                          // avant : ['presences_date', 'presences_groupe', 'presences_tri']
        expect(clesTrimestre).toEqual(['test_presences_date', 'test_presences_groupe', 'test_presences_tri']);
        expect(store.test_presences_date).toBe(DATE);
    });
});

/* =============================================================================================
   6 · ANIMATION — js/boite-outils.js
   ============================================================================================= */
describe('6 · Animation — tirage au sort, questions flash, clés', () => {
    const INTERNES_A = ['etatTirage', 'etatQuestions', 'obtenirCleQuestions', 'obtenirEtudiantsDisponibles'];
    function monterA(store, opts = {}) {
        const elements = Object.assign({ 'tirage-container': elementDom(), 'tirage-affichage': elementDom(), 'tirage-nb-restants': elementDom(), 'btn-tirer': elementDom(), 'questions-container': elementDom(), 'questions-affichage': elementDom(), 'questions-nb-restantes': elementDom(), 'btn-tirer-question': elementDom(), 'questions-filtre-categorie': elementDom({ options: [] }) }, opts.elements || {});
        return monter(store, Object.assign({}, opts, { modules: [{ chemin: 'js/boite-outils.js', internes: INTERNES_A }], elements, globaux: Object.assign({ prompt: () => 'Q modifiée' }, opts.globaux || {}) }));
    }
    const tirer = (b) => { b.win.lancerTirage(); b.avancer(3000); return b.elements['tirage-affichage'].innerHTML.replace(/<[^>]+>/g, '').trim(); };

    it('A-1 · Le tirage sans remise : chaque élève une fois, puis « Aucun étudiant disponible » et le bouton désactivé — PAS de réinitialisation automatique', () => {
        const store = storeBase();
        const b = monterA(store);
        b.win.initialiserTirage();
        const i = b.interne['boite-outils.js'];
        const tires = [tirer(b), tirer(b), tirer(b)];
        const quatrieme = tirer(b);
        noter('A1', { tires, dejaTires: i.etatTirage.dejaTires, quatrieme, boutonDesactive: b.elements['btn-tirer'].disabled, restants: b.elements['tirage-nb-restants'].textContent });
        b.restaurerHorloge();
        expect(new Set(i.etatTirage.dejaTires).size).toBe(3);
        expect(i.etatTirage.dejaTires.sort()).toEqual(['2000001', '2000002', '2000003']);
        expect(quatrieme).toMatch(/Aucun/);
        expect(b.elements['btn-tirer'].disabled).toBe(true);
        expect(i.etatTirage.dejaTires.length).toBe(3);   // rien n'a été remis à zéro
    });

    it('A-2 · etatTirage : clé NUE, survit au rechargement ; un autre groupe du MÊME cours ne vide rien ; un élève retiré du groupe est purgé de l\'état en base', () => {
        const store = storeBase();
        const b = monterA(store);
        b.win.initialiserTirage(); tirer(b); tirer(b);
        b.restaurerHorloge();
        const cles = Object.keys(store).filter(k => /tirage/i.test(k));
        // Rechargement : même store, window neuf.
        const b2 = monterA(store); b2.win.initialiserTirage();
        const apresReload = clone(b2.interne['boite-outils.js'].etatTirage.dejaTires);
        // Même cours (même id GC1), autre numéro de groupe : le test « groupe a changé » compare des ids de COURS → rien n'est vidé.
        store.infoCours = { id: 'GC1', nom: 'Cours banc', groupe: '01', _groupeCoursId: 'GC1' };
        const b3 = monterA(store); b3.win.initialiserTirage();
        const memeCours = clone(b3.interne['boite-outils.js'].etatTirage.dejaTires);
        // Un élève déjà tiré quitte le groupe (retiré dans Cadre) : à l'initialisation suivante, il est purgé de l'état ET l'état purgé est réécrit.
        const parti = apresReload[0];
        store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da !== parti);
        const b4 = monterA(store); b4.win.initialiserTirage();
        const apresDepart = clone(b4.interne['boite-outils.js'].etatTirage.dejaTires);
        const ecritApresDepart = clone(store.etatTirage.dejaTires);
        // L'élève revient (ré-ajouté) : son tirage est perdu.
        store.test_groupeEtudiants.push({ da: parti, nom: 'Revenu', prenom: 'R', groupe: '01', coursId: 'GC1', statut: 'actif' });
        const b5 = monterA(store); b5.win.initialiserTirage();
        const apresRetour = clone(b5.interne['boite-outils.js'].etatTirage.dejaTires);
        noter('A2', { cles, apresReload, memeCours, parti, apresDepart, ecritApresDepart, apresRetour });
        expect(cles).toEqual(['etatTirage']);
        expect(apresReload.length).toBe(2);
        expect(memeCours).toEqual(apresReload);
        expect(apresDepart).toEqual(apresReload.filter(da => da !== parti));
        expect(ecritApresDepart).toEqual(apresDepart);
        expect(apresRetour).not.toContain(parti);
    });
    it('A-3 · La modale des paramètres : le DA réel dans le DOM (data-da) ; le nom entrait brut — depuis #770, échappé (valeur d\'après)', () => {
        const store = storeBase();
        store.test_groupeEtudiants[0].nom = 'Assidu <b>gras</b>';
        const b = monterA(store);
        b.win.initialiserTirage();
        b.win.ouvrirModalParamsTirage();
        const html = b.document.body.innerHTML;
        noter('A3', { daDansDom: /data-da="2000001"/.test(html), nomBrut: html.includes('Assidu <b>gras</b>, Alice'), nomEchappe: html.includes('Assidu &lt;b&gt;gras&lt;/b&gt;') });
        expect(html).toMatch(/data-da="2000001"/);
        expect(html).not.toContain('Assidu <b>gras</b>, Alice');                   // avant #770 : brut
        expect(html).toContain('Assidu &lt;b&gt;gras&lt;/b&gt;, Alice');
    });

    it('A-4 · Les questions flash : clé assemblée « questionsFlash_<coursId> », NON namespacée ; « questionsFlash_global » si aucun cours actif', () => {
        const store = storeBase();
        const b = monterA(store, { elements: { 'nouvelle-question': elementDom({ value: 'Quel est le thème ?' }), 'nouvelle-question-categorie': elementDom({ value: '' }) } });
        b.win.initialiserQuestions();
        const i = b.interne['boite-outils.js'];
        const cleAvec = i.obtenirCleQuestions();
        b.win.ajouterQuestion();
        const clesEcrites = b.journal.map(j => j.k).filter(k => /question/i.test(k));
        store.infoCours = null;
        const cleSans = i.obtenirCleQuestions();
        noter('A4', { cleAvec, cleSans, clesEcrites, nbQuestions: (store[cleAvec] || {}).questions && store[cleAvec].questions.length });
        expect(cleAvec).toBe('questionsFlash_GC1');
        expect(cleSans).toBe('questionsFlash_global');
        expect(clesEcrites).toEqual(['questionsFlash_GC1']);
        expect(Object.keys(store)).not.toContain('test_questionsFlash_GC1');
    });
});

/* =============================================================================================
   4 · PROFILS INDIVIDUELS — rapport, volet confidentiel, onglet Développement, graphiques
   ============================================================================================= */
describe('4 · Profils individuels — écritures du profil, anonymisation, graphiques', () => {
    const DA = '2000001';
    function monterP(store, opts = {}) {
        const modifs = [];
        const globaux = Object.assign({
            calculerTousLesIndices: () => ({ A: 90, C: 100, P: 77, noteConstructible: true }), obtenirDetailsAssiduite: () => ({ periodesPresentes: 18, periodesTotal: 20, nbSeances: 10, taux: 90 }),
            obtenirTermeProduction: () => 'artefact', evaluationEntreDansLaNote: () => true, obtenirIdsProductionsEvaluables: () => [], obtenirPratiqueActive: () => null,
            modifierNotesPresence: (da, date, note) => { modifs.push({ da, date, note }); return true; }, toggleDisplay() {}
        }, opts.globaux || {});
        // Lot 4 du cadrage 11 : les graphiques convertissent par `profil-etudiant-calculs.js` (chargé ici, réel).
        const b = monter(store, Object.assign({}, opts, { modules: ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js', 'js/profil-etudiant-diagnostics.js', { chemin: 'js/graphiques-progression.js', internes: ['obtenirDonneesCriteres', 'moyenneCriteresHabiletes'] }], globaux, objetsExportes: ['profilActuelDA', 'etudiantsListeCache'] }));
        b.modifs = modifs;
        return b;
    }

    it('P-1 · Le rapport : ses six cases s\'écrivent sous <trim>_preferencesRapport, au GESTE seulement (le rendu n\'écrit rien) ; le texte, lui, est régénéré à chaque affichage — valeur d\'après le lot 4 du cadrage 11 (constat d\'origine : clé nue, écrite à chaque rendu)', () => {
        const store = storeBase();
        const b = monterP(store, { elements: { ['inclure-jetons-' + DA]: elementDom({ checked: false }), ['textarea-rapport-' + DA]: elementDom({ value: 'TEXTE RETOUCHÉ À LA MAIN' }) } });
        for (const s of ['identification', 'assiduite', 'completion', 'performance', 'date']) b.document.getElementById('inclure-' + s + '-' + DA).checked = true;
        b.win.genererEtAfficherRapport(DA);                       // le chemin du RENDU (restaurerPreferencesRapport → génération)
        const clesApresRendu = Object.keys(store).filter(k => /rapport/i.test(k));
        b.win.cocherSectionRapport(DA);                           // le GESTE sur une case
        const texte = b.document.getElementById('textarea-rapport-' + DA).value;
        noter('P1', { clesApresRendu, cles: Object.keys(store).filter(k => /rapport/i.test(k)), prefs: store.test_preferencesRapport, texteRetoucheConserve: texte.includes('RETOUCHÉ'), debut: texte.slice(0, 60) });
        expect(clesApresRendu).toEqual([]);
        expect(Object.keys(store).filter(k => /rapport/i.test(k))).toEqual(['test_preferencesRapport']);
        expect(store.test_preferencesRapport).toEqual({ identification: true, assiduite: true, completion: true, performance: true, jetons: false, date: true });
        expect(texte.includes('RETOUCHÉ')).toBe(false);
    });

    it('P-2 · Le volet confidentiel : écrit EN CLAIR sous <trim>_confidentielEtudiants, remplace tout le sous-objet du DA (le stock `servicesAdaptes` et `portrait*` tombe — lot 4 du cadrage 11), et réécrit les notes de présence en cascade', () => {
        const store = storeBase();
        store.test_confidentielEtudiants = { [DA]: { notes: 'ancienne note', categorie: 'x', portraitNuance: '3', servicesAdaptes: true }, '2000002': { notes: 'Bruno' } };
        const ta = elementDom({ value: 'note présence modifiée', dataset: { date: '2026-09-01', da: DA } });
        const b = monterP(store, { selecteurs: { '#confidentiel-notes-presences .note-presence-editable': [ta] } });
        b.win.ouvrirModalConfidentiel(DA);
        b.document.getElementById('confidentiel-notes').value = 'TDAH — plan adapté';
        const caseSA = b.document.getElementById('confidentiel-services-adaptes');
        b.win.sauvegarderConfidentiel();
        // ↻ Lot E3 (D3, 28 sept. 2026) : plus de cascade à « Enregistrer » — chaque note de présence
        // s'écrit à son propre changement, par le témoin (`enregistrerNotePresenceConfidentiel`).
        expect(b.modifs).toEqual([]);
        b.win.enregistrerNotePresenceConfidentiel(ta);
        const ecrit = store.test_confidentielEtudiants;
        noter('P2', { cles: Object.keys(store).filter(k => /confid/i.test(k)), da: ecrit[DA], autreDA: ecrit['2000002'], cascade: b.modifs, enClair: JSON.stringify(ecrit).includes('TDAH'), caseSA: { checked: caseSA.checked, disabled: caseSA.disabled } });
        expect(ecrit[DA].notes).toBe('TDAH — plan adapté');
        expect(caseSA).toMatchObject({ checked: false, disabled: true });   // l'élève de banc n'a pas `sa: 'Oui'` dans la liste : la case le reflète, sans se cocher
        expect(ecrit[DA]).not.toHaveProperty('servicesAdaptes');            // plus écrit : la liste des étudiant·es fait foi
        expect(ecrit[DA]).not.toHaveProperty('portraitNuance');             // le sous-objet est remplacé par ce que le formulaire porte — et le portrait n'y est plus
        expect(ecrit['2000002']).toEqual({ notes: 'Bruno' });   // les autres DA sont intacts
        expect(b.modifs).toEqual([{ da: DA, date: '2026-09-01', note: 'note présence modifiée' }]);
        expect(JSON.stringify(ecrit)).toContain('TDAH');
    });

    it('P-3 · En mode anonymisation, le volet confidentiel montre la vraie note et laisse enregistrer (il lit et écrit le store brut)', () => {
        const store = storeBase();
        store.modeApplication = 'anonymisation';
        store.test_confidentielEtudiants = { [DA]: { notes: 'diagnostic réel' } };
        const b = monterP(store);
        b.win.ouvrirModalConfidentiel(DA);
        const affiche = b.document.getElementById('confidentiel-notes').value;
        const nomTitre = b.document.getElementById('confidentiel-etudiant-nom').textContent;
        b.document.getElementById('confidentiel-notes').value = 'écrit en mode anonymisation';
        b.win.sauvegarderConfidentiel();
        noter('P3', { affiche, nomTitre, ecrit: store.test_confidentielEtudiants[DA].notes, ecritures: b.journal.filter(j => /confid/.test(j.k)).length });
        expect(affiche).toBe('diagnostic réel');
        expect(store.test_confidentielEtudiants[DA].notes).toBe('écrit en mode anonymisation');
    });

    it('P-4 · L\'onglet « Développement » retenu est écrit sous « profilOngletDeveloppementActif », clé NUE', () => {
        const store = storeBase();
        const conteneur = elementDom({ querySelectorAll: () => [] });
        const b = monterP(store, { selecteurs: { ['.onglets-developpement[data-da="' + DA + '"]']: conteneur } });
        b.win.changerOngletDeveloppement('forces-defis', DA);
        noter('P4', { cles: Object.keys(store).filter(k => /Onglet/i.test(k)), valeur: store.profilOngletDeveloppementActif });
        expect(Object.keys(store)).toContain('profilOngletDeveloppementActif');
        expect(Object.keys(store)).not.toContain('test_profilOngletDeveloppementActif');
    });

    it('P-5 · Courbe des critères, valeur d\'après #752 (lot 4 du cadrage 11) : « B » sur une échelle A/B/C → sa valeur (70) ; « 3 », « 21 » et « M », sans valeur dans cette échelle → points absents, comptés ; 3 points sur 30 → 10 — constat d\'origine : trou, 75 (lu comme /4), 21, 75 écrits en dur', () => {
        const store = storeBase();
        store.test_productions = [{ id: 'P1', nom: 'Un' }, { id: 'P2', nom: 'Deux' }, { id: 'P3', nom: 'Trois' }, { id: 'P4', nom: 'Quatre' }, { id: 'P5', nom: 'Cinq' }];
        store.test_echellesTemplates = [{ id: 'E3N', nom: 'Trois paliers', niveaux: [{ code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50 }, { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: 70 }, { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 90 }] }];
        const ev = (id, pid, critere, date) => ({ id, etudiantDA: DA, productionId: pid, coursId: 'GC1', echelleId: 'E3N', dateEvaluation: date, noteFinale: 70, criteres: [Object.assign({ critereNom: 'Structure' }, critere)] });
        store.test_evaluationsSauvegardees = [ev('E1', 'P1', { niveauSelectionne: 'B' }, '2026-02-01'), ev('E2', 'P2', { niveauSelectionne: '3' }, '2026-03-01'), ev('E3', 'P3', { niveauSelectionne: '21' }, '2026-04-01'), ev('E4', 'P4', { niveauSelectionne: 'M' }, '2026-05-01'), ev('E5', 'P5', { niveauSelectionne: 'A', points: 3, ponderation: 30 }, '2026-06-01')];
        const b = monterP(store);
        const g = b.interne['graphiques-progression.js'];
        const d = g.obtenirDonneesCriteres(DA);
        const sansEval = g.obtenirDonneesCriteres('2000002');
        const compte = { sansValeur: 0 };
        const dec = store.test_evaluationsSauvegardees.map(e => g.moyenneCriteresHabiletes(e, new Set(['Structure']), new Map(), compte));
        noter('P5', { structure: d && d.criteres.Structure, sansValeur: d && d.sansValeurConvertible, sansEval, decimal: dec, compte });
        expect(d.criteres.Structure).toEqual([70, null, null, null, 10]);
        expect(d.sansValeurConvertible).toEqual({ evaluations: 3, points: 3 });
        expect(dec).toEqual([0.7, null, null, null, 0.1]);
        expect(compte.sansValeur).toBe(3);
        expect(sansEval).toBe(null);
    });
});
