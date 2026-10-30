/**
 * Bac à sable des sous-onglets de Suivi — extrait du banc d'audit du 6 septembre 2026
 * (tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js) pour que les sentinelles du lot #767-#772
 * montent les modules RÉELS de js/ de la même façon : modes.js réel sur un store partagé, faux `document`
 * qui capture l'innerHTML et sert les champs d'un formulaire, `db` de banc avec journal et `db.modifier`
 * reproduit (db.js:532), minuteries virtuelles. « Recharger » = remonter un window neuf sur le MÊME store.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript, completerEcrivainsParDefaut, completerNoteParDefaut, completerMenuSelectionParDefaut, completerJetonsResolusParDefaut } from './charger-script.js';
import { chargerPredicatsCopie } from './predicats-copie.js';

export const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const clone = (x) => JSON.parse(JSON.stringify(x));
export const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

/** Chargement avec des noms INTERNES exposés sous window.__audit[<fichier>] (accesseurs, et mutateurs pour `_x`, `etatX`, `donneesX`). */
export function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = readFileSync(path.join(RACINE, chemin), 'utf8');
    const expo = '\n;window.__audit = window.__audit || {}; window.__audit[' + JSON.stringify(path.basename(chemin)) + '] = {'
        + noms.map(n => 'get ' + n + '() { return ' + n + '; }' + (/^(_|etat|donnees)/.test(n) ? ', set ' + n + '(v) { ' + n + ' = v; }' : '')).join(', ') + '};\n';
    const fin = code.lastIndexOf('})();');
    code = fin >= 0 ? code.slice(0, fin) + expo + code.slice(fin) : code + expo;
    globaux = completerEcrivainsParDefaut(globaux, win);   // lot E1 (voir charger-script.js)
    globaux = completerNoteParDefaut(globaux);             // 21 oct. 2026 (voir charger-script.js)
    globaux = completerMenuSelectionParDefaut(globaux, win, globaux.document);   // #1147 (voir charger-script.js)
    completerJetonsResolusParDefaut(win, chemin);   // jetons par défaut, 29 oct. 2026 (voir charger-script.js)
    const { document: doc, localStorage: ls, ...autres } = globaux;
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    const nomsG = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres)];
    const vals = [win, doc, console, ls || storage(), storage(), ...Object.values(autres)];
    new Function(...nomsG, '"use strict";\n' + code)(...vals);
    return win;
}

function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, force) { const v = force === undefined ? !s.has(c) : !!force; v ? s.add(c) : s.delete(c); return v; }, liste() { return [...s]; } }; }
export function elementDom(init) {
    const el = { _html: '', get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; this.children = []; } };
    return Object.assign(el, { textContent: '', value: '', checked: false, disabled: false, style: {}, dataset: {}, classList: classList(), children: [],
        setAttribute(n, v) { this['attr_' + n] = v; }, getAttribute(n) { return this['attr_' + n] === undefined ? null : this['attr_' + n]; }, hasAttribute(n) { return this['attr_' + n] !== undefined; }, removeAttribute(n) { delete this['attr_' + n]; },
        appendChild(c) { this.children.push(c); return c; }, addEventListener() {}, removeEventListener() {}, focus() {}, select() {}, click() {}, scrollIntoView() {},
        querySelector() { return null; }, querySelectorAll() { return []; }, getElementsByTagName() { return this.lignes || []; }, insertAdjacentHTML(p, h) { this.innerHTML += h; }, remove() {}, closest() { return null; },
        getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 20, right: 100, bottom: 20 }; }, offsetParent: {}, offsetWidth: 100, offsetHeight: 20 }, init || {});
}
export function fauxDocument(elements, selecteurs) {
    return {
        getElementById: (id) => (elements[id] || (elements[id] = elementDom({ id }))),
        querySelector: (s) => { const r = selecteurs[s]; return Array.isArray(r) ? (r[0] || null) : (r || null); },
        querySelectorAll: (s) => { const r = selecteurs[s]; return Array.isArray(r) ? r : (r ? [r] : []); },
        createElement: (tag) => elementDom({ tagName: String(tag).toUpperCase() }), createDocumentFragment: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
        body: elementDom(), documentElement: elementDom(), readyState: 'complete', activeElement: null
    };
}
export function dbBanc(store, journal) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v) }); },
        removeSync: (k) => { delete store[k]; journal.push({ k: '-' + k }); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v), async: true }); },
        remove: async (k) => { delete store[k]; journal.push({ k: '-' + k, async: true }); },
        keys: async () => Object.keys(store), useIndexedDB: false, memoryCache: new Map(),
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; }
    };
}

/**
 * 30 oct. 2026 — une échelle à repères, pour les bancs qui lisent la performance : l'échelle de l'enseignant fait foi.
 * Plages et repères sont des données du banc, jamais un défaut de l'application.
 */
export function echelleAReperes({ id = 'E_BANC', plages = [['I', 0, 64], ['D', 65, 74], ['M', 75, 84], ['E', 85, 100]], suffisance = 'D', maitrise = 'M' } = {}) {
    return { id, nom: 'Échelle du banc', seuilSuffisance: suffisance, seuilMaitrise: maitrise, niveaux: plages.map(([code, min, max]) => ({ code, nom: code, min, max })) };
}
/** Les globaux qui font de `echelle` celle des copies du groupe : une pratique Standards, et le résolveur. */
export function globauxEchelle(echelle) {
    return { designerPratiqueActive: () => ({ etat: 'ok', famille: 'standards' }), obtenirEchelleResolue: (id) => (id === echelle.id ? clone(echelle) : null) };
}
/** Une copie qui compte, posée sur `echelle` : c'est par les copies que le groupe dit son échelle. */
export function copieSurEchelle(echelle, da = '2000001') {
    return { id: 'COPIE_' + echelle.id, etudiantDA: da, productionId: 'P_BANC', echelleId: echelle.id, noteFinale: 70, verrouillee: true, coursId: 'GC1', groupe: '01' };
}

/** Un store de départ : un groupe-cours GC1 de trois élèves, un autre GC2 avec un quatrième. */
export function storeBase() {
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
 * Monte un window neuf sur `store` (partagé) avec modes.js RÉEL et les modules demandés
 * (chaîne = chargerScript ; { chemin, internes } = chargerAvecInterne). Rappeler `monter` sur le même store = recharger.
 */
export function monter(store, opts = {}) {
    const journal = opts.journal || [];
    const db = dbBanc(store, journal);
    const elements = Object.assign({}, opts.elements || {});
    const selecteurs = Object.assign({}, opts.selecteurs || {});
    const document = fauxDocument(elements, selecteurs);
    const notifs = [], avertissements = [], confirmations = [];
    const prefs = Object.assign({}, opts.prefs || {});
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
        // Lot D du 12 sept. 2026 (« Tes prochains rendez-vous ») : interventions.js lit la date du jour par dateLocaleYMD
        // (js/date-utils.js, chargé tôt dans l'app) — le banc la fournit aux modules, pas seulement à son window.
        dateLocaleYMD: win.dateLocaleYMD,
        formaterDateComplete: (d) => String(d), formaterNbEtudiants: (n) => n + ' étudiant·e' + (n > 1 ? 's' : ''),
        afficherSection() {}, afficherSousSection() {}, naviguerVers() {}, afficherListeEtudiantsConsultation() {}, afficherNotificationCopiee() {}, toggleDisplay() {}, toggleAccordeonV2() {},
        COULEURS: { indices: { A: '#1976D2', C: '#FF6B35', P: '#4CAF50' } }
    };
    Object.assign(globauxBase, opts.globaux || {});
    const winModes = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    chargerScript('js/modes.js', globauxBase, winModes);
    const globaux = Object.assign({}, globauxBase, {
        obtenirDonneesSelonMode: winModes.obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: winModes.sauvegarderDonneesSelonMode,
        obtenirEtudiantsCoursActif: winModes.obtenirEtudiantsCoursActif, obtenirContexteCoursActif: winModes.obtenirContexteCoursActif,
        demarrerCacheLecture: winModes.demarrerCacheLecture, terminerCacheLecture: winModes.terminerCacheLecture, invaliderCacheLecture: winModes.invaliderCacheLecture,
        filtrerEtudiantsParMode: winModes.filtrerEtudiantsParMode, estModeeLectureSeule: winModes.estModeeLectureSeule, obtenirPratiqueActiveGroupeCours: winModes.obtenirPratiqueActiveGroupeCours,
        // Lot N1a (21 sept. 2026) : le pointeur SANS repli de modes.js, que lit la résolution du registre.
        lirePointeurPratiqueGroupeCours: winModes.lirePointeurPratiqueGroupeCours,
        // #749 lot 2 : le numéro de groupe s'écrit et se lit par la fonction unique de modes.js.
        normaliserNumeroGroupe: winModes.normaliserNumeroGroupe,
        // #834 lot E (cadrage « Rencontres ») : l'identifiant du contexte, point unique de modes.js.
        obtenirIdContexteActif: winModes.obtenirIdContexteActif, contexteActifEstService: winModes.contexteActifEstService,
        // Lot N2 (#716) : le P historique des snapshots pose les évaluations échues dans le contexte de simulation.
        definirContexteSimulation: winModes.definirContexteSimulation, effacerContexteSimulation: winModes.effacerContexteSimulation,
        contexteImposeNoteProvisoire: winModes.contexteImposeNoteProvisoire
    });
    Object.assign(globaux, opts.globaux || {});
    // Lot 5 du cadrage 11 (12 sept. 2026), ↻ 30 oct. : la lettre du bilan d'une intervention se situe dans l'échelle
    // (`situerPourcentageDansEchelle`, js/profil-etudiant-helpers.js, chargé avant interventions.js dans l'app). Le banc
    // fournit la VRAIE : une copie ici dériverait sans que personne le voie.
    if (!('situerPourcentageDansEchelle' in globaux)) {
        const winHelpers = {};
        chargerScript('js/profil-etudiant-helpers.js', globaux, winHelpers);
        globaux.situerPourcentageDansEchelle = winHelpers.situerPourcentageDansEchelle;
    }
    // 30 oct. 2026 (une seule source par famille de seuils) : les seuils et leurs lecteurs sont les VRAIS, comme dans
    // l'app (`interpretation-config.js`, sur le store du banc), sauf si le banc fournit son propre `obtenirSeuil`.
    const winConfig = {};
    chargerScript('js/interpretation-config.js', { db }, winConfig);
    win.NOTE_DE_PASSAGE = winConfig.NOTE_DE_PASSAGE;
    win.SEUILS_PAR_DEFAUT = winConfig.SEUILS_PAR_DEFAUT;
    if (!('obtenirSeuil' in globaux)) globaux.obtenirSeuil = winConfig.obtenirSeuil;
    for (const [k, v] of Object.entries(globaux)) if (!(k in win) && k !== 'document' && k !== 'db') win[k] = v;
    // Lot A du 16 sept. 2026 : les calculs du profil, les complétions, snapshots.js et le rapport appellent
    // `window.evaluationEntreDansLaNote` / `window.evaluationNonRemise` (pratique-registre.js). Posés en VRAI,
    // avant les modules ; un banc qui charge le registre lui-même les réécrit à l'identique.
    chargerPredicatsCopie(win);
    if (!('evaluationEntreDansLaNote' in globaux)) globaux.evaluationEntreDansLaNote = win.evaluationEntreDansLaNote;
    if (!('evaluationNonRemise' in globaux)) globaux.evaluationNonRemise = win.evaluationNonRemise;
    if (!('evaluationNonRecevable' in globaux)) globaux.evaluationNonRecevable = win.evaluationNonRecevable;
    if (!('evaluationCompteCommeRemise' in globaux)) globaux.evaluationCompteCommeRemise = win.evaluationCompteCommeRemise;   // 25 oct. 2026
    if (!('evaluationTravailEnCours' in globaux)) globaux.evaluationTravailEnCours = win.evaluationTravailEnCours;
    const modulesDemandes = opts.modules || [];
    const contexteQualification = 'js/contexte-qualification.js';
    const modules = modulesDemandes.includes(contexteQualification) ? modulesDemandes : [contexteQualification, ...modulesDemandes];
    const exportsWindow = new Set();
    for (const f of modules) for (const m of readFileSync(path.join(RACINE, f.chemin || f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) exportsWindow.add(m[1]);
    for (const nom of exportsWindow) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && !(opts.objetsExportes || []).includes(nom)) globaux[nom] = fwd(nom);
    for (const f of modules) {
        if (typeof f === 'string') chargerScript(f, globaux, win); else chargerAvecInterne(f.chemin, globaux, win, f.internes);
    }
    return { win, winModes, store, db, journal, elements, selecteurs, notifs, avertissements, confirmations, prefs, interne: win.__audit || {}, document, avancer, restaurerHorloge: () => { Date.now = dateNowReel; } };
}
