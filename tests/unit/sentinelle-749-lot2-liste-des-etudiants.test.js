import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #749 LOT 2 — LA LISTE DES ÉTUDIANT·ES DIT VRAI (cadrage 11, 11 sept. 2026)
//
// Décision de Grégoire (14 h 17) : « les abandons visibles (grisés) ». La note
// de l'écran affirmait déjà que les abandons, inactifs et décrochages restent
// dans le tableau « pour consultation, mais exclus des statistiques » — et le
// filtre les retirait. Elle devient vraie. LE PIÈGE de ce lot : élargir
// l'affichage sans élargir la population statistique. C'est ce que verrouille
// le cas A.
//
// VERROUILLÉ ICI (L-1 à L-11 de l'audit du 6, lot 2 du cadrage 11) :
//   A. un élève en abandon est RENDU, grisé (`tr.etudiant-inactif`), avec son
//      statut en clair — et `#moy-a` ne bouge pas par rapport au même groupe
//      sans lui ;
//   B. « # » trie sur l'ordre d'origine dans les deux sens ; « DA » trie en
//      numérique ;
//   C. la recherche ignore accents et casse (« aime » → Aimé, « comaneci » →
//      Comăneci) — une seule fonction, partagée avec le filtre pattern ;
//   D. un rendu n'appelle plus `calculerEtStockerIndicesCP` directement
//      (la chaîne d'indices.js le fait) ; la saisie passe par une enveloppe
//      différée (200 ms) — trois frappes, un rendu ;
//   E. les options du filtre pattern sont exactement les six patterns que le
//      calcul produit ;
//   F. « ≥ Min. » tient au re-rendu ; 0 évaluation est sous N ;
//   G. un DA en double est refusé à l'ajout et ignoré à l'import (compté) ;
//      le groupe est padé à l'écriture, normalisé à la lecture (« 1 » = « 00001 »
//      = une entrée du filtre) ;
//   H. le bouton d'aide contextuelle du titre survit au rendu.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Harnais : faux DOM à éléments créés à la demande, db de banc, modes.js réel,
// etudiants.js et trimestre-v2-etudiants.js réels. Même patron que le banc
// d'audit du 6 (audit-sous-onglets-suivi-2026-09-06.test.js), réduit au lot.
// ---------------------------------------------------------------------------
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(init) {
    const el = { _html: '', get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; this.children = []; } };
    return Object.assign(el, { textContent: '', value: '', checked: false, disabled: false, style: {}, dataset: {}, classList: classList(), children: [], title: '',
        setAttribute(n, v) { this['attr_' + n] = v; }, getAttribute(n) { return this['attr_' + n] === undefined ? null : this['attr_' + n]; },
        appendChild(c) { this.children.push(c); return c; }, insertBefore(c) { this.children.unshift(c); return c; }, get firstChild() { return this.children[0] || null; },
        addEventListener() {}, removeEventListener() {}, focus() {}, click() {}, scrollIntoView() {},
        querySelector(sel) { return (this._registre && this._registre[sel]) || null; }, querySelectorAll() { return []; }, insertAdjacentHTML(p, h) { this.innerHTML += h; }, remove() {}, closest() { return null; },
        getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 20, right: 100, bottom: 20 }; }, offsetWidth: 100, offsetHeight: 20, scrollWidth: 100, clientWidth: 100 }, init || {});
}
function fauxDocument(elements, selecteurs) {
    return {
        getElementById: (id) => (elements[id] || (elements[id] = elementDom({ id }))),
        querySelector: (s) => { const r = selecteurs[s]; return Array.isArray(r) ? (r[0] || null) : (r || null); },
        querySelectorAll: (s) => { if (s === '#tbody-suivi-liste tr') return (elements['tbody-suivi-liste'] || { children: [] }).children; const r = selecteurs[s]; return Array.isArray(r) ? r : (r ? [r] : []); },
        createElement: (tag) => elementDom({ tagName: String(tag).toUpperCase() }),
        addEventListener() {}, body: elementDom(), readyState: 'complete',
    };
}
function dbBanc(store, journal) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push(k); },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); journal.push(k); },
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; },
    };
}
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

/** Même chargement que chargerScript, avec des noms INTERNES exposés sous window.__audit[<fichier>] (patron du banc d'audit). */
function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = lire(chemin);
    const expo = '\n;window.__audit = window.__audit || {}; window.__audit[' + JSON.stringify(path.basename(chemin)) + '] = {'
        + noms.map(n => 'get ' + n + '() { return ' + n + '; }, set ' + n + '(v) { ' + n + ' = v; }').join(', ') + '};\n';
    const fin = code.lastIndexOf('})();');
    code = fin >= 0 ? code.slice(0, fin) + expo + code.slice(fin) : code + expo;
    const { document: doc, localStorage: ls, sessionStorage: ss, ...autres } = globaux;
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } });
    const noms2 = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres)];
    const vals = [win, doc, { warn() {}, error() {}, log() {} }, ls || storage(), ss || storage(), ...Object.values(autres)];
    // eslint-disable-next-line no-new-func
    new Function(...noms2, '"use strict";\n' + code)(...vals);
}

function storeBase() {
    return {
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '00001', _groupeCoursId: 'GC1' },
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', coursId: 'GC1', groupeNum: '00001' },
        test_groupesCours: [{ id: 'GC1', coursId: 'GC1', trimestreId: 'test', actif: true, groupeNum: '00001' }],
        test_groupeEtudiants: [
            { da: '2000001', nom: 'Césaire', prenom: 'Aimé', groupe: '00001', coursId: 'GC1', statut: 'actif' },
            { da: '2000002', nom: 'Absent', prenom: 'Bruno', groupe: '00001', coursId: 'GC1', statut: 'actif' },
            { da: '2000003', nom: 'Comăneci', prenom: 'Nadia', groupe: '1', coursId: 'GC1', statut: 'actif' },   // groupe non padé (stock d'avant)
        ],
        test_presences: [{ date: '2026-09-01', da: '2000001', periodesPresentes: 2, coursId: 'GC1' }, { date: '2026-09-01', da: '2000002', periodesPresentes: 0, coursId: 'GC1' }, { date: '2026-09-01', da: '2000003', periodesPresentes: 2, coursId: 'GC1' }],
        test_productions: [{ id: 'P1', nom: 'Artefact 1', coursId: 'GC1' }], test_evaluationsSauvegardees: [],
        test_grillesTemplates: [], test_echellesTemplates: [], test_pratiquesConfigurables: [], test_modalitesEvaluation: {}, test_portfoliosEleves: {},
    };
}

function monter(store, opts = {}) {
    const journal = [];
    const db = dbBanc(store, journal);
    const elements = Object.assign({}, opts.elements || {});
    const selecteurs = Object.assign({}, opts.selecteurs || {});
    const document = fauxDocument(elements, selecteurs);
    const notifs = [];
    const compteurs = { assiduite: 0, cp: 0 };
    const minuteries = [];
    const win = { addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-09-11', cle, db, location: { hash: '', href: 'file:///index.html' }, innerWidth: 1366, innerHeight: 1024,
        MutationObserver: function () { return { observe() {}, disconnect() {} }; }, requestAnimationFrame: (f) => { f(); return 0; }, getComputedStyle: () => ({ getPropertyValue: () => '' }),
        setTimeout: (f, d) => { minuteries.push({ f, d }); return minuteries.length; }, clearTimeout: (id) => { if (minuteries[id - 1]) minuteries[id - 1].f = null; } };
    const indices = opts.indices || {};
    const base = {
        document, db, cle, echapperHtml,
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info(t, m) { notifs.push({ type: 'info', t, m }); }, warning() {} },
        estEtudiantExclu: (e) => !!(e && e.statut && ['inactif', 'décrochage', 'abandon'].includes(e.statut)),
        libelleStatutEtudiant: (st) => ({ 'inactif': 'Inactivité', 'décrochage': 'Décrochage', 'abandon': 'Abandon' }[st] || ''),
        obtenirPreference: (n) => (n === 'activerRai' ? true : null), definirPreference() {},
        determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable', label: 'Universel' }), calculerCorrelationPearson: () => 0,
        calculerTousLesIndices: (da) => indices[da] || { A: 90, C: 100, P: 80, noteConstructible: true },
        calculerEtSauvegarderIndicesAssiduite: () => { compteurs.assiduite++; }, calculerEtStockerIndicesCP: () => { compteurs.cp++; },
        obtenirConfigPratiqueActive: () => ({ portfolio: { minimumCompletion: 3 } }), obtenirInterventionsEtudiant: () => [], obtenirTypePratiqueActive: () => 'standards',
        obtenirTermeProduction: () => 'artefact', obtenirCodePratique: () => 'STD', obtenirCoursActifId: () => 'GC1',
        afficherSousSection() {}, afficherProfilComplet() {}, reattacherEvenementsToggles() {}, afficherSection() {}, naviguerVers() {},
        afficherNotificationCopiee() {}, toggleDisplay() {}, toggleAccordeonV2() {},
        formaterDateComplete: (d) => String(d), formaterNbEtudiants: (n) => n + ' étudiant·e' + (n > 1 ? 's' : ''),
        COULEURS: { indices: { A: '#1976D2', C: '#FF6B35', P: '#4CAF50' } },
        obtenirDureePeriode: () => 50, obtenirSeancesCompletes: () => ({}), obtenirSeancesHoraire: () => [], obtenirCalendrierComplet: () => ({}), genererSeancesCompletes() {},
        dateLocaleYMD: () => '2026-09-11',
        MutationObserver: function () { return { observe() {}, disconnect() {} }; }, requestAnimationFrame: (f) => { f(); return 0; }, getComputedStyle: () => ({ getPropertyValue: () => '' }),
        setTimeout: win.setTimeout, clearTimeout: win.clearTimeout,
        alert() {}, confirm: () => true, genererIdUnique: (p) => p + 'X', doitRegenerer: false,
    };
    const winModes = { addEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    chargerScript('js/modes.js', base, winModes);
    const globaux = Object.assign({}, base, {
        obtenirDonneesSelonMode: winModes.obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: winModes.sauvegarderDonneesSelonMode,
        obtenirEtudiantsCoursActif: winModes.obtenirEtudiantsCoursActif, obtenirContexteCoursActif: winModes.obtenirContexteCoursActif,
        filtrerEtudiantsParMode: winModes.filtrerEtudiantsParMode, estModeeLectureSeule: winModes.estModeeLectureSeule,
        demarrerCacheLecture: winModes.demarrerCacheLecture, terminerCacheLecture: winModes.terminerCacheLecture,
        normaliserNumeroGroupe: winModes.normaliserNumeroGroupe,
        // Lot E2 (28 sept. 2026) : le Cadre écrit les fiches par `modifierEtAnnoncer` (la file + le témoin).
        modifierEtAnnoncer: winModes.modifierEtAnnoncer,
    });
    // Lot E2 : un refus parle par le témoin commun ; il est rangé dans le même journal que les notifications.
    win.temoinEnregistrement = { nonEnregistre(raison, geste) { notifs.push({ type: 'nonEnregistre', t: raison, geste }); }, enregistre() {} };
    win.raisonPourTemoin = (r) => { const t = String(r || '').trim(); const d = t.charAt(0).toLowerCase() + t.slice(1); return /[.!?]$/.test(d) ? d : d + '.'; };
    for (const [k, v] of Object.entries(globaux)) if (!(k in win) && k !== 'document' && k !== 'db') win[k] = v;
    // Les exports `window.X =` des modules montés sont aiguillés à l'appel (résolution tardive, patron du banc d'audit) :
    // un module qui appelle librement `obtenirCouleurSelonSeuils(...)` trouve la fonction que interpretation-config.js a posée sur `win`.
    const modules = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/etudiants.js', 'js/trimestre-v2-etudiants.js'];
    const fwd = (nom) => (...a) => { if (typeof win[nom] !== 'function') throw new Error('global absent : ' + nom); return win[nom](...a); };
    const exportsWindow = new Set();
    for (const f of modules) for (const m of lire(f).matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) exportsWindow.add(m[1]);
    for (const nom of exportsWindow) if (!(nom in globaux) && !/^[A-Z]/.test(nom)) globaux[nom] = fwd(nom);
    for (const f of modules.slice(0, 2)) chargerScript(f, globaux, win);
    chargerAvecInterne('js/etudiants.js', globaux, win, ['chargerOptionsFiltres']);
    chargerAvecInterne('js/trimestre-v2-etudiants.js', globaux, win, ['donneesImportEnAttenteV2']);
    // Le titre porte le bouton d'aide, comme dans index.html.
    const boutonAide = elementDom({ tagName: 'BUTTON', attr_data_aide: 'suivi-liste' });
    const titre = document.getElementById('titre-liste-etudiants');
    titre._registre = { '[data-aide]': boutonAide };
    return { win, store, journal, elements, notifs, compteurs, minuteries, document, boutonAide, interne: win.__audit['trimestre-v2-etudiants.js'], interneEtud: win.__audit['etudiants.js'],
        lignes() { return document.getElementById('tbody-suivi-liste').children; },
        das() { return document.getElementById('tableEtudiantsListe').classList.contains('u-hide') ? [] : this.lignes().map(tr => (tr.innerHTML.match(/<td>(\d{6,7})<\/td>/) || [])[1]); },
        moyA() { return document.getElementById('moy-a').textContent; } };
}

// ---------------------------------------------------------------------------
describe('#749 lot 2 · A — les abandons visibles, grisés ; les statistiques ne bougent pas', () => {
    it('un élève en abandon est rendu, grisé, avec son statut ; #moy-a est identique au même groupe sans lui', () => {
        const sans = storeBase();
        const b0 = monter(sans, { indices: { '2000001': { A: 100, C: 100, P: 80 }, '2000002': { A: 40, C: 100, P: 60 }, '2000003': { A: 80, C: 100, P: 70 } } });
        b0.win.afficherListeEtudiantsConsultation();
        const moySansAbandon = b0.moyA();
        expect(b0.das()).toEqual(['2000002', '2000001', '2000003']);   // tri par nom : Absent, Césaire, Comăneci

        const avec = storeBase();
        avec.test_groupeEtudiants.push({ da: '2000004', nom: 'Parti', prenom: 'Paul', groupe: '00001', coursId: 'GC1', statut: 'abandon' });
        avec.test_presences.push({ date: '2026-09-01', da: '2000004', periodesPresentes: 0, coursId: 'GC1' });
        const b = monter(avec, { indices: { '2000001': { A: 100, C: 100, P: 80 }, '2000002': { A: 40, C: 100, P: 60 }, '2000003': { A: 80, C: 100, P: 70 }, '2000004': { A: 0, C: 0, P: 0 } } });
        b.win.afficherListeEtudiantsConsultation();
        expect(b.das()).toEqual(['2000002', '2000001', '2000003', '2000004']);   // visible (Parti, dernier par le nom)
        const ligne = b.lignes()[3];
        expect(ligne.classList.contains('etudiant-inactif')).toBe(true);           // grisé
        expect(ligne.dataset.statut).toBe('abandon');
        expect(ligne.innerHTML).toContain('(Abandon)');                              // son statut en clair
        expect(b.moyA()).toBe(moySansAbandon);                                       // les statistiques ne l'ont pas compté
        expect(moySansAbandon).toBe('moy=73%');                                      // (100 + 40 + 80) / 3
    });

    it('les mots sont ceux de Cadre › Trimestre : Inactivité, Décrochage', () => {
        const store = storeBase();
        store.test_groupeEtudiants[1].statut = 'inactif';
        store.test_groupeEtudiants[2].statut = 'décrochage';
        const b = monter(store);
        b.win.afficherListeEtudiantsConsultation();
        // tri par nom : Absent (inactif), Césaire (actif), Comăneci (décrochage)
        expect(b.lignes()[0].innerHTML).toContain('(Inactivité)');
        expect(b.lignes()[2].innerHTML).toContain('(Décrochage)');
        expect(b.lignes()[1].classList.contains('etudiant-inactif')).toBe(false);
    });
});

describe('#749 lot 2 · B — les tris trient', () => {
    it('« # » trie sur l\'ordre d\'origine, asc puis desc ; « DA » trie en numérique', () => {
        const store = storeBase();
        store.test_groupeEtudiants = [
            { da: '999999', nom: 'Zed', prenom: 'Zoé', groupe: '00001', coursId: 'GC1', statut: 'actif' },
            { da: '2000001', nom: 'Assidu', prenom: 'Alice', groupe: '00001', coursId: 'GC1', statut: 'actif' },
            { da: '1000123', nom: 'Milieu', prenom: 'Max', groupe: '00001', coursId: 'GC1', statut: 'actif' },
        ];
        const b = monter(store);
        b.win.trierTableauPar('da');
        expect(b.das()).toEqual(['999999', '1000123', '2000001']);
        b.win.trierTableauPar('num');
        expect(b.das()).toEqual(['999999', '2000001', '1000123']);
        b.win.trierTableauPar('num');
        expect(b.das()).toEqual(['1000123', '2000001', '999999']);
    });
});

describe('#749 lot 2 · C — la recherche sans accents', () => {
    it('« aime », « cesaire », « comaneci » trouvent ; la casse ne compte pas', () => {
        const b = monter(storeBase());
        const chercher = (t) => { b.document.getElementById('recherche-nom-liste').value = t; b.win.afficherListeEtudiantsConsultation(); return b.das(); };
        expect(chercher('aime')).toEqual(['2000001']);
        expect(chercher('CESAIRE')).toEqual(['2000001']);
        expect(chercher('comaneci')).toEqual(['2000003']);
        expect(chercher('zzz')).toEqual([]);
    });

    it('une seule normalisation : la recherche et le filtre pattern lisent la même fonction', () => {
        const src = lire('js/etudiants.js');
        expect((src.match(/normaliserTexteRecherche\(/g) || []).length).toBeGreaterThanOrEqual(4);   // définition + pattern + recherche ×2
        expect((src.match(/normalize\('NFD'\)/g) || []).length).toBe(1);
    });
});

describe('#749 lot 2 · D — une lettre tapée ne recalcule pas le groupe trois fois', () => {
    it('un rendu n\'appelle plus calculerEtStockerIndicesCP directement', () => {
        const b = monter(storeBase());
        b.win.afficherListeEtudiantsConsultation();
        expect(b.compteurs).toEqual({ assiduite: 1, cp: 0 });
        const src = lire('js/etudiants.js');
        const corps = tranche(src, 'function afficherListeEtudiantsConsultation()', '\nfunction ');
        expect(corps).not.toMatch(/calculerEtStockerIndicesCP\(\)/);
    });

    it('la saisie passe par l\'enveloppe différée : trois frappes, une minuterie vivante, un rendu', () => {
        const b = monter(storeBase());
        expect(lire('index.html')).toMatch(/id="recherche-nom-liste"[^>]*data-on-input="afficherListeEtudiantsConsultationDifferee"/);
        b.win.afficherListeEtudiantsConsultationDifferee();
        b.win.afficherListeEtudiantsConsultationDifferee();
        b.win.afficherListeEtudiantsConsultationDifferee();
        expect(b.compteurs.assiduite).toBe(0);                                        // rien avant le silence
        const vivantes = b.minuteries.filter(m => m.f);
        expect(vivantes.length).toBe(1);
        expect(vivantes[0].d).toBe(200);
        vivantes[0].f();
        expect(b.compteurs.assiduite).toBe(1);
    });
});

describe('#749 lot 2 · E — le filtre pattern offre ce que le code produit', () => {
    it('les valeurs du sélecteur sont exactement les six patterns, normalisés', () => {
        const index = lire('index.html');
        const bloc = index.slice(index.indexOf('id="filtre-pattern-liste"'), index.indexOf('</select>', index.indexOf('id="filtre-pattern-liste"')));
        const valeurs = [...bloc.matchAll(/value="([^"]*)"/g)].map(m => m[1]).filter(Boolean).sort();
        const calculs = lire('js/profil-etudiant-calculs.js');
        const produits = ['Stable', 'Défi spécifique', 'Difficulté émergente', 'Difficulté persistante', 'Non-participation', 'Données insuffisantes'];
        for (const p of produits) expect(calculs.includes("'" + p + "'"), p).toBe(true);
        const attendues = produits.map(p => p.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')).sort();
        expect(valeurs).toEqual(attendues);
        expect(calculs.includes("'En progression'")).toBe(false);
    });
});

describe('#749 lot 2 · F — « ≥ Min. » tient au re-rendu, et 0 est sous N', () => {
    it('la case cochée, un tri reconstruit le tbody et les lignes sous le minimum restent grisées ; 0 évaluation est insuffisant', () => {
        const store = storeBase();
        store.test_evaluationsSauvegardees = [{ id: 'e1', productionId: 'P1', etudiantDA: '2000001', noteFinale: 80 }];   // 2000001 : 1 éval ; les autres : 0
        const b = monter(store);
        b.document.getElementById('chk-filtre-minimum').checked = true;
        b.win.afficherListeEtudiantsConsultation();
        const grisees = () => b.lignes().filter(tr => tr.style.opacity === '0.35').length;
        expect(b.lignes().map(tr => tr.dataset.insuffisant)).toEqual(['true', 'true', 'true']);   // 1 < 3 et 0 < 3
        expect(grisees()).toBe(3);
        b.win.trierTableauPar('nom');                                                  // re-rendu
        expect(grisees()).toBe(3);
        b.document.getElementById('chk-filtre-minimum').checked = false;
        b.win.trierTableauPar('nom');
        expect(grisees()).toBe(0);
    });
});

describe('#749 lot 2 · G — un DA en double refusé ; le groupe padé à l\'écriture, normalisé à la lecture', () => {
    const champs = (da, groupe) => ({ 'v2-etudiantDA': elementDom({ value: da }), 'v2-etudiantNom': elementDom({ value: 'Doublon' }), 'v2-etudiantPrenom': elementDom({ value: 'Dede' }), 'v2-etudiantProgramme': elementDom({ value: '' }), 'v2-etudiantSA': elementDom({ value: '' }), 'v2-etudiantGroupe': elementDom({ value: groupe }) });

    it('ajout : le DA d\'un élève existant est refusé, la notification le nomme, une seule fiche', async () => {
        const store = storeBase();
        const b = monter(store, { elements: champs('2000001', '1') });
        await b.win.soumettreEtudiantV2();
        expect(store.test_groupeEtudiants.filter(e => e.da === '2000001').length).toBe(1);
        // ↻ Lot E2 : « Non enregistré – Ajouter l'étudiant·e : ce DA est déjà dans le groupe : … », par le témoin.
        expect(b.notifs.some(n => n.type === 'nonEnregistre' && n.t === 'ce DA est déjà dans le groupe : Aimé Césaire.' && n.geste === 'Ajouter l\'étudiant·e')).toBe(true);
        expect(b.notifs.some(n => n.type === 'succes')).toBe(false);
    });

    it('ajout : un DA neuf avec groupe « 1 » est écrit « 00001 »', async () => {
        const store = storeBase();
        const b = monter(store, { elements: champs('2000099', '1') });
        await b.win.soumettreEtudiantV2();
        expect(store.test_groupeEtudiants.find(e => e.da === '2000099').groupe).toBe('00001');
    });

    it('import : un DA déjà présent est ignoré et compté ; le doublon interne aussi ; le stock existant ne bouge pas ; réimporter n\'ajoute rien', async () => {
        const store = storeBase();
        const b = monter(store);
        const lot = () => [{ da: '2000001', nom: 'Écrasé', prenom: 'X', groupe: '00001', programme: '' }, { da: '3000001', nom: 'Importé', prenom: 'Ivan', groupe: '00001', programme: '' }, { da: '3000001', nom: 'Doublon interne', prenom: 'Y', groupe: '00001', programme: '' }];
        b.interne.donneesImportEnAttenteV2 = lot();
        await b.win.confirmerImportV2();
        expect(store.test_groupeEtudiants.length).toBe(4);                                         // 3 + Ivan
        expect(store.test_groupeEtudiants.find(e => e.da === '2000001').nom).toBe('Césaire');     // intact, pas écrasé
        expect(store.test_groupeEtudiants.filter(e => e.da === '3000001').length).toBe(1);
        expect(b.notifs.some(n => n.type === 'succes' && n.t === '1 étudiant·e ajouté·e à Cours banc, 2 déjà présent·es (ignoré·es) — 4 au total dans le groupe')).toBe(true);   // #887 : le message nomme le cours
        b.interne.donneesImportEnAttenteV2 = lot();
        await b.win.confirmerImportV2();
        expect(store.test_groupeEtudiants.length).toBe(4);                                         // réimport : rien de plus
    });

    it('lecture : « 1 » et « 00001 » font UNE entrée du filtre Groupe, et le filtre les retient tous', () => {
        const b = monter(storeBase());
        b.interneEtud.chargerOptionsFiltres();
        const filtre = b.document.getElementById('filtre-groupe-liste');
        const valeurs = filtre.children.map(o => o.value).concat([...filtre.innerHTML.matchAll(/value="([^"]+)"/g)].map(m => m[1]));
        expect(valeurs).toEqual(['00001']);                                              // « Tous » (vide) + UNE entrée, padée
        filtre.value = '00001';
        b.win.afficherListeEtudiantsConsultation();
        expect(b.das()).toEqual(['2000002', '2000001', '2000003']);                       // 2000003 (groupe « 1 ») retenu ; tri par nom
    });
});

describe('#749 lot 2 · H — le bouton d\'aide du titre survit au rendu', () => {
    it('après un rendu, le bouton data-aide est à droite du titre', () => {
        const b = monter(storeBase());
        b.win.afficherListeEtudiantsConsultation();
        const titre = b.document.getElementById('titre-liste-etudiants');
        const conteneur = titre.children[0];
        const partieDroite = conteneur.children[1];
        expect(partieDroite.children[0]).toBe(b.boutonAide);
    });
});

// ---------------------------------------------------------------------------
// JOURNAL DES BREAK-TESTS (11 septembre 2026)
//   a. le filtre `statut === 'actif' || !statut` remis dans filtrerEtudiants :
//      A ROUGE (l'abandon n'est plus rendu). Remis.
//   b. `indexActifs` remis à « tous les élèves » (sans estExclu) : A ROUGE
//      (#moy-a change avec l'abandon — le piège du lot). Remis.
//   c. `{ numeric: true }` retiré : B ROUGE. Remis.
//   d. `normaliserTexteRecherche` sans `normalize('NFD')` : C ROUGE. Remis.
//   e. le rappel de toggleFiltreMinimum en fin de rendu retiré : F ROUGE. Remis.
//   f. la garde du DA en double retirée : G ROUGE. Remis.
// ---------------------------------------------------------------------------
