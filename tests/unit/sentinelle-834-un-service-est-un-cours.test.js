import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #834 (lots A et B du cadrage « Rencontres », 12 sept. 2026) — UN SERVICE EST UN COURS.
//
// Décision de Grégoire (11 sept., 19 h 20) : « trois questions, un cours de service visible dans
// Cadre ». Principe de construction : un service EST un enregistrement de `cours` ordinaire
// (`nature: 'service'`), un groupe-cours de service EST un groupe-cours (`horaireId` possiblement
// null). Aucun magasin à part, aucun troisième chemin : `obtenirEtudiantsCoursActif()` rend sa
// liste SANS nouveau cas.
//
// VERROUILLÉ ICI :
//   A1. l'entité crée un service sans code (`nature: 'service'`, `codeCours: ''`) et un cours
//       ordinaire reste `nature: 'cours'` ; la nature est modifiable ;
//   A2. le formulaire du Cadre enregistre un service avec le seul nom — et refuse toujours un
//       COURS sans code (#540 tient) ;
//   B1. un groupe-cours dont le cours est un service s'enregistre SANS horaire (`horaireId: null`) ;
//       un groupe-cours ordinaire sans horaire est toujours refusé ;
//   B2. `obtenirSeancesHoraire` rend VIDE pour un service sans horaire — même quand le miroir
//       `horaireHebdo` du trimestre porte l'horaire du dernier groupe activé ; un groupe-cours
//       ordinaire sans `horaireId` garde son repli (rien ne bouge pour l'enseignant) ; un service
//       AVEC horaire lit le sien ;
//   B3. `obtenirEtudiantsCoursActif()` rend les élèves du service par le chemin commun, et
//       `contexteActifEstService()` dit vrai — et faux sur un cours ordinaire.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 au soir — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

function dbBanc(store) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        modifier: async (k, f, d) => { store[k] = clone(f(k in store ? clone(store[k]) : d)); },
    };
}
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', placeholder: '', style: {}, dataset: {}, options: [],
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: classList(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute() {}, getAttribute() { return null; }, closest() { return null; }, focus() {} };
}
function fauxDocument(elements) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
}
function notifs() { const j = []; return { j, api: { succes(t, m) { j.push({ type: 'succes', t, m }); }, erreur(t, m) { j.push({ type: 'erreur', t, m }); }, info() {}, warning() {} } }; }

function monterIdentite(win) {
    chargerScript('js/identite-naturelle.js', {}, win);
    return win;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('A1 · l\'entité : un service se crée sans code, et sa nature est portée', () => {
    function monter(store) {
        const win = monterIdentite({ addEventListener() {} });
        let n = 0;
        const base = { db: dbBanc(store), genererIdUnique: (p) => p + 'X' + (++n), trouverDoublonNaturel: win.trouverDoublonNaturel, cleNaturelleCours: win.cleNaturelleCours };
        chargerScript('js/entites/cours-entite.js', base, win);
        return win;
    }
    it('un service : nature \'service\', code vide, seul le nom compte', async () => {
        const store = { cours: [] };
        const win = monter(store);
        const s = await win.CoursEntite.creer({ nature: 'service', nomCours: 'Aide à la réussite' });
        expect(s.nature).toBe('service');
        expect(s.codeCours).toBe('');
        expect(s.nomCours).toBe('Aide à la réussite');
        expect(store.cours.map(c => c.nature)).toEqual(['service']);
    });
    it('un cours ordinaire porte nature \'cours\' ; toute autre valeur est ramenée à \'cours\'', async () => {
        const win = monter({ cours: [] });
        const c = await win.CoursEntite.creer({ codeCours: '601-101-MQ', nomCours: 'Écriture', discipline: '601', ponderation: '2-2-3' });
        expect(c.nature).toBe('cours');
        const d = await win.CoursEntite.creer({ codeCours: '601-102-MQ', nature: 'atelier' });
        expect(d.nature).toBe('cours');
    });
    it('deux services sans code ne sont pas des doublons l\'un de l\'autre (#455 juge sur le code, seul)', async () => {
        const win = monter({ cours: [] });
        const a = await win.CoursEntite.creer({ nature: 'service', nomCours: 'Aide' });
        const b = await win.CoursEntite.creer({ nature: 'service', nomCours: 'Aide' });
        expect(a).not.toBeNull(); expect(b).not.toBeNull();
        expect(a.id).not.toBe(b.id);
    });
    it('la nature se modifie (un cours devenu service, et l\'inverse)', async () => {
        const store = { cours: [] };
        const win = monter(store);
        const c = await win.CoursEntite.creer({ codeCours: '601-101-MQ' });
        const maj = await win.CoursEntite.mettreAJour(c.id, { nature: 'service', codeCours: '' });
        expect(maj.nature).toBe('service');
        expect(store.cours[0].nature).toBe('service');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('A2 · le formulaire du Cadre : un service avec le seul nom passe ; un cours sans code est refusé', () => {
    function monterForm(valeurs) {
        const elements = {};
        const document = fauxDocument(elements);
        Object.entries(valeurs).forEach(([id, v]) => { document.getElementById(id).value = v; });
        const n = notifs();
        const appels = [];
        // Lot E2 (28 sept. 2026, D3) : les refus passent par le témoin commun.
        const temoin = { refus: [], nonEnregistre(raison, geste) { this.refus.push({ raison, geste }); }, enregistre() {} };
        const win = { addEventListener() {}, temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1) };
        const store = { cours: [], infoCours: null };
        const base = { document, db: dbBanc(store), notifications: n.api, echapperHtml: (s) => String(s == null ? '' : s),
            // Le stub fait ce que l'entité fait : il range la fiche, sinon `_postSauvegardeCoursV2` ne la retrouve pas.
            CoursEntite: { creer: async (d) => { appels.push(d); const c = Object.assign({ id: 'COURS_X' }, d); store.cours.push(c); return c; }, mettreAJour: async () => null, chercherDoublonCode: async () => null },
            confirm: () => true, toggleDisplay() {}, setTimeout: () => 0 };
        chargerScript('js/trimestre-v2-cours.js', base, win);
        return { win, n, appels, elements, temoin };
    }
    it('service + nom → CoursEntite.creer reçoit nature \'service\', code / discipline / pondération vides', async () => {
        const b = monterForm({ 'v2-natureCours': 'service', 'v2-nomCours': 'Aide à la réussite', 'v2-codeCours': '', 'v2-disciplineCours': '', 'v2-ponderation': '' });
        await b.win.sauvegarderCoursV2();
        expect(b.n.j.filter(x => x.type === 'erreur')).toEqual([]);
        expect(b.appels.length).toBe(1);
        expect(b.appels[0].nature).toBe('service');
        expect(b.appels[0].nomCours).toBe('Aide à la réussite');
        expect(b.appels[0].codeCours).toBe('');
        expect(b.appels[0].discipline).toBe('');
        expect(b.appels[0].ponderation).toBe('');
        // Consigne du 12 sept. 2026 : le mot vient du point unique ; lot E2 : « Service d’orthopédagogie « … » créé. »
        expect(b.n.j.some(x => x.type === 'succes' && /^Service d’orthopédagogie «\u00a0Aide à la réussite\u00a0» créé\.$/.test(x.t))).toBe(true);
        expect(b.temoin.refus).toEqual([]);
    });
    it('service SANS nom → refusé, rien n\'est créé', async () => {
        const b = monterForm({ 'v2-natureCours': 'service', 'v2-nomCours': '' });
        await b.win.sauvegarderCoursV2();
        expect(b.appels.length).toBe(0);
        // Lot E2 : « Non enregistré – Créer le service : le nom du service est requis… », aucun succès.
        expect(b.temoin.refus).toHaveLength(1);
        expect(b.temoin.refus[0].geste).toBe('Créer le service');
        expect(b.temoin.refus[0].raison).toMatch(/^le nom du service est requis/);
        expect(b.n.j.some(x => x.type === 'succes')).toBe(false);
    });
    it('cours ordinaire SANS code → toujours refusé (#540 tient) ; avec ses trois champs → créé en nature \'cours\'', async () => {
        const refus = monterForm({ 'v2-natureCours': 'cours', 'v2-nomCours': 'Écriture', 'v2-codeCours': '' });
        await refus.win.sauvegarderCoursV2();
        expect(refus.appels.length).toBe(0);
        expect(refus.temoin.refus[0]).toMatchObject({ geste: 'Créer le cours' });
        expect(refus.temoin.refus[0].raison).toMatch(/^le code du cours est requis/);
        const ok = monterForm({ 'v2-natureCours': 'cours', 'v2-nomCours': 'Écriture', 'v2-codeCours': '601-101-MQ', 'v2-disciplineCours': '601 Français', 'v2-ponderation': '2-2-3' });
        await ok.win.sauvegarderCoursV2();
        expect(ok.appels.length).toBe(1);
        expect(ok.appels[0].nature).toBe('cours');
        expect(ok.appels[0].codeCours).toBe('601-101-MQ');
    });
    it('le choix « Service » cache les blocs ministériels et renomme « Nom du service » ; « Cours » les remontre', () => {
        const b = monterForm({ 'v2-natureCours': 'service' });
        b.win.changerNatureCoursV2();
        for (const id of ['v2-champCodeCours', 'v2-ligneCompetence', 'v2-lignePonderation', 'v2-ligneDiscipline']) expect(b.elements[id].classList.contains('u-hide')).toBe(true);
        expect(b.elements['v2-labelNomCours'].innerHTML).toMatch(/Nom du service/);
        b.elements['v2-natureCours'].value = 'cours';
        b.win.changerNatureCoursV2();
        for (const id of ['v2-champCodeCours', 'v2-ligneCompetence', 'v2-lignePonderation', 'v2-ligneDiscipline']) expect(b.elements[id].classList.contains('u-hide')).toBe(false);
        expect(b.elements['v2-labelNomCours'].innerHTML).toBe('Nom du cours');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('B1 · le groupe-cours : l\'horaire est facultatif pour un service, requis pour un cours', () => {
    function monterGC(coursId, horaireId) {
        const store = {
            cours: [{ id: 'C_SERVICE', nature: 'service', nomCours: 'Aide à la réussite' }, { id: 'C_COURS', codeCours: '601-101-MQ', nomCours: 'Écriture' }],
            test_groupesCours: [], test_horaires: [{ id: 'HOR1', nom: 'Mar-Jeu', seances: [{ jour: 'Mardi', heureDebut: '10:00' }] }],
            trimestres: [{ id: 'test', session: 'automne', annee: '2026', actif: true }], enseignants: [{ id: 'ENS1', prenom: 'Léa', nom: 'Roy' }],
        };
        const elements = {};
        const document = fauxDocument(elements);
        document.getElementById('v2-gc-trimestre').value = 'test';
        document.getElementById('v2-gc-cours').value = coursId;
        document.getElementById('v2-gc-groupe').value = '00001';
        document.getElementById('v2-gc-horaire').value = horaireId;
        document.getElementById('v2-gc-enseignant').value = 'ENS1';
        const n = notifs();
        // Lot E2 (28 sept. 2026, D3) : les refus passent par le témoin commun.
        const temoin = { refus: [], nonEnregistre(raison, geste) { this.refus.push({ raison, geste }); }, enregistre() {} };
        const win = monterIdentite({ addEventListener() {}, temoinEnregistrement: temoin, raisonPourTemoin: (r) => r.charAt(0).toLowerCase() + r.slice(1) });
        const base = { document, db: dbBanc(store), cle, notifications: n.api, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'X1',
            trouverDoublonNaturel: win.trouverDoublonNaturel, cleNaturelleGroupeCours: win.cleNaturelleGroupeCours, obtenirTrimestreActif: () => store.trimestres[0], confirm: () => true };
        chargerScript('js/trimestre-v2-groupes-cours.js', base, win);
        return { win, store, n, elements, temoin };
    }
    it('service sans horaire → enregistré, horaireId null, le nom du service dans le nom du groupe-cours', () => {
        const b = monterGC('C_SERVICE', '');
        b.win.sauvegarderGroupeCoursV2();
        expect(b.n.j.filter(x => x.type === 'erreur')).toEqual([]);
        expect(b.store.test_groupesCours.length).toBe(1);
        expect(b.store.test_groupesCours[0].horaireId).toBeNull();
        expect(b.store.test_groupesCours[0].coursId).toBe('C_SERVICE');
        expect(b.store.test_groupesCours[0].nom).toContain('Aide à la réussite');
    });
    it('cours ordinaire sans horaire → refusé, rien n\'est écrit', () => {
        const b = monterGC('C_COURS', '');
        b.win.sauvegarderGroupeCoursV2();
        expect(b.store.test_groupesCours.length).toBe(0);
        expect(b.temoin.refus).toEqual([{ raison: 'choisis l\'horaire.', geste: 'Créer le groupe-cours' }]);
        expect(b.n.j.some(x => x.type === 'succes')).toBe(false);
    });
    it('le formulaire le DIT : l\'astérisque cède la place à « facultatif pour un service »', () => {
        const b = monterGC('C_SERVICE', '');
        b.win.mettreAJourNomGroupeCoursV2();
        expect(b.elements['v2-gc-horaireRequis'].classList.contains('u-hide')).toBe(true);
        expect(b.elements['v2-gc-horaireFacultatif'].classList.contains('u-hide')).toBe(false);
        const c = monterGC('C_COURS', 'HOR1');
        c.win.mettreAJourNomGroupeCoursV2();
        expect(c.elements['v2-gc-horaireRequis'].classList.contains('u-hide')).toBe(false);
        expect(c.elements['v2-gc-horaireFacultatif'].classList.contains('u-hide')).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('B2 · les séances : un service sans horaire n\'en a AUCUNE — le miroir du trimestre ne lui est pas servi', () => {
    function monterHoraire(gc, estService) {
        const store = {
            groupeCoursActif: { id: gc.id, coursId: gc.coursId, horaireId: gc.horaireId },
            test_groupesCours: [gc],
            test_horaires: [{ id: 'HOR1', nom: 'Mar-Jeu', periodesParSeance: 2, seances: [{ jour: 'Mardi', heureDebut: '10:00', heureFin: '12:00' }] }],
            // Le miroir écrit par l'activation du DERNIER groupe-cours ordinaire du trimestre :
            test_horaireHebdo: [{ jour: 'Jeudi', heureDebut: '08:00', heureFin: '10:00' }],
            test_calendrierComplet: {},
        };
        const win = { addEventListener() {}, obtenirTrimestreId: () => 'test', cle, db: dbBanc(store), dateLocaleYMD: () => '2026-09-11' };
        const base = { db: win.db, cle, obtenirCoursActifId: () => gc.coursId, obtenirTrimestreId: () => 'test', contexteActifEstService: () => estService,
            obtenirDonneesSelonMode: () => null, notifications: notifs().api, setTimeout: () => 0 };
        chargerScript('js/horaire.js', base, win);
        return win;
    }
    it('service, horaireId null → [] (pas le Jeudi du miroir)', () => {
        const win = monterHoraire({ id: 'GC_S', coursId: 'C_SERVICE', horaireId: null }, true);
        expect(win.obtenirSeancesHoraire('C_SERVICE')).toEqual([]);
    });
    it('cours ordinaire, horaireId absent → le repli sur le miroir tient (rien ne bouge pour l\'enseignant)', () => {
        const win = monterHoraire({ id: 'GC_C', coursId: 'C_COURS', horaireId: null }, false);
        expect(win.obtenirSeancesHoraire('C_COURS').map(s => s.jour)).toEqual(['Jeudi']);
    });
    it('service AVEC horaire → ses séances, périodes héritées (#830 tient)', () => {
        const win = monterHoraire({ id: 'GC_S', coursId: 'C_SERVICE', horaireId: 'HOR1' }, true);
        expect(win.obtenirSeancesHoraire('C_SERVICE').map(s => s.jour + '/' + s.nombrePeriodes)).toEqual(['Mardi/2']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('B3 · le goulot commun : obtenirEtudiantsCoursActif rend la liste du service sans nouveau cas', () => {
    function monterModes(store) {
        const win = { addEventListener() {}, obtenirTrimestreId: () => 'test', cle };
        // modes.js touche le DOM et quelques globaux au chargement : stubs inertes (patron de la sentinelle #749 lot 2).
        const base = { db: dbBanc(store), cle, document: fauxDocument({}), estEnModeDemo: () => false, obtenirTrimestreId: () => 'test',
            toggleDisplay() {}, afficherSousSection() {}, naviguerVers() {}, notifications: notifs().api, setTimeout: () => 0, clearTimeout() {},
            MutationObserver: function () { return { observe() {}, disconnect() {} }; }, obtenirPreference: () => null, definirPreference() {} };
        chargerScript('js/modes.js', base, win);
        return win;
    }
    const storeService = () => ({
        cours: [{ id: 'C_SERVICE', nature: 'service', nomCours: 'Aide' }, { id: 'C_COURS', codeCours: '601-101-MQ' }],
        infoCours: { id: 'C_SERVICE', codeCours: 'Aide', nomCours: 'Aide', groupe: '00001', _groupeCoursId: 'GC_S' },
        groupeCoursActif: { id: 'GC_S', coursId: 'C_SERVICE', horaireId: null, groupe: '00001' },
        test_groupesCours: [{ id: 'GC_S', coursId: 'C_SERVICE', groupeNum: '00001', actif: true, horaireId: null }],
        test_groupeEtudiants: [
            { da: '9900001', nom: 'Tremblay', prenom: 'Léa', groupe: '00001', coursId: 'C_SERVICE' },
            { da: '9900002', nom: 'Gagnon', prenom: 'Noah', groupe: '00001', coursId: 'C_SERVICE' },
            { da: '1234567', nom: 'Autre', prenom: 'Élève', groupe: '00008', coursId: 'C_COURS' },
        ],
    });
    it('les deux élèves du service, pas celui du cours', () => {
        const win = monterModes(storeService());
        expect(win.obtenirEtudiantsCoursActif().map(e => e.da).sort()).toEqual(['9900001', '9900002']);
    });
    it('contexteActifEstService : vrai sur le service, faux sur un cours ordinaire, faux sans contexte', () => {
        expect(monterModes(storeService()).contexteActifEstService()).toBe(true);
        const s = storeService();
        s.infoCours = { id: 'C_COURS', codeCours: '601-101-MQ', groupe: '00008', _groupeCoursId: 'GC_C' };
        s.groupeCoursActif = { id: 'GC_C', coursId: 'C_COURS', horaireId: 'HOR1' };
        expect(monterModes(s).contexteActifEstService()).toBe(false);
        expect(monterModes({ cours: [], infoCours: null, groupeCoursActif: null }).contexteActifEstService()).toBe(false);
    });
    it('le groupe-cours actif prime sur infoCours pour trouver la fiche (les deux chemins d\'écriture d\'infoCours divergent sur `id`)', () => {
        const s = storeService();
        s.infoCours = { id: 'GC_S', codeCours: 'Aide', groupe: '00001', _groupeCoursId: 'GC_S' }; // chemin entité : id = groupe-cours
        expect(monterModes(s).coursDuContexteActif().id).toBe('C_SERVICE');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 11 septembre 2026, 20 h 30 (Toronto). Chaque mutation appliquée
// au code de js/, la suite relancée, le fichier restauré à empreinte SHA-256 identique.
//   1. cours-entite.js : le champ `nature` retiré de la création        → 2 rouges (A1)
//   2. trimestre-v2-cours.js : la branche service de sauvegarderCoursV2 → 2 rouges (A2)
//   3. trimestre-v2-groupes-cours.js : l'horaire requis pour tous       → 1 rouge  (B1)
//   4. horaire.js : le court-circuit du service retiré (miroir servi)   → 1 rouge  (B2)
//   5. modes.js : la fiche cherchée par infoCours.id seul               → 1 rouge  (B3)
// 17/17 verts une fois restauré.
