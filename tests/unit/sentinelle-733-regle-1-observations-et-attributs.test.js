/**
 * SENTINELLE #733 — RÈGLE 1 DE CLAUDE.md : DU TEXTE LIBRE DANS DU HTML PASSE PAR echapperHtml, SANS EXCEPTION.
 *
 * Audit de l'onglet Suivi, 5 septembre 2026, constats E-6 et G-4 (Rapports/AUDIT-onglet-suivi-2026-09-05.md).
 * Deux sites : les OBSERVATIONS d'une intervention (interventions.js, `<textarea id="observationsIntervention">`)
 * entraient brutes — un `</textarea>` dans le texte fermait le champ et ce qui suivait s'exécutait ; le bilan,
 * six lignes plus bas, était échappé. Et le volet confidentiel (profil-etudiant-confidentiel.js) interpolait
 * `data-date` et `data-da` sans échappement (le contenu du champ, lui, l'était).
 *
 * Mesure par MUTATION ÉVIDENTE : une valeur qui contient `</textarea>` ou une guillemet ne sort pas brute du
 * HTML rendu. Les deux rendus sont exécutés (faux DOM qui capture `innerHTML`), pas seulement lus.
 *
 * Break-test attendu : retirer l'un des trois `echapperHtml` → le cas correspondant rougit.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const classList = () => { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle() { return false; } }; };
const element = (init) => Object.assign({ innerHTML: '', textContent: '', value: '', checked: false, style: {}, dataset: {}, classList: classList(),
    setAttribute() {}, getAttribute() { return null; }, appendChild() {}, addEventListener() {}, removeEventListener() {}, focus() {}, select() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, insertAdjacentHTML() {}, remove() {} }, init || {});

describe('#733 · règle 1 — observations et attributs', () => {
    it('les observations d\'une intervention : « </textarea><img …> » ne ferme pas le champ — il sort échappé', () => {
        const PIEGE = 'Bonne séance.</textarea><img src=x onerror="alert(1)">';
        const intervention = { id: 'I1', titre: 'Rattrapage', date: '2026-02-09', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'rattrapage',
            description: '', etudiants: [], analyse: null, observations: PIEGE, notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours' };
        const store = { test_interventions: [intervention], test_groupeEtudiants: [{ da: '2000001', nom: 'Assidu', prenom: 'Alice' }], test_grillesTemplates: [] };
        const conteneur = element();
        const elements = { conteneurPrincipal: conteneur };
        const document = { getElementById: (id) => (elements[id] || (elements[id] = element())), querySelector: () => null, querySelectorAll: () => [],
            createElement: () => element(), addEventListener() {}, body: element(), documentElement: element(), readyState: 'complete' };
        const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = v; }, get: async () => null, set: async () => {} };
        const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
        chargerScript('js/interventions.js', { document, db, cle: (k) => 'test_' + k, echapperHtml,
            obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(store['test_' + String(k).replace(/^test_/, '')] || [])),
            obtenirEtudiantsCoursActif: () => JSON.parse(JSON.stringify(store.test_groupeEtudiants)),
            determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
            calculerMoyennesCriteres: () => null, obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
            notifications: { succes() {}, erreur() {}, info() {} }, alert() {}, genererIdUnique: (p) => p + '1', obtenirCoursActifId: () => 'GC1',
            obtenirSeancesCompletes: () => ({}), obtenirCalendrierComplet: () => ({}) }, win);
        win.ouvrirIntervention('I1', {});
        const html = conteneur.innerHTML;
        expect(html.length).toBeGreaterThan(1000);
        expect(html).not.toContain('</textarea><img');
        expect(html).toContain('Bonne séance.&lt;/textarea&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</textarea>');
    });

    it('le volet confidentiel : une date et un DA qui portent une guillemet ne cassent pas l\'attribut — ils sortent échappés', () => {
        const PIEGE_DATE = '2026-02-09" onmouseover="alert(1)';
        const PIEGE_DA = '2000001" data-x="';
        const store = { test_presences: [{ da: PIEGE_DA, date: PIEGE_DATE, periodesPresentes: 2, notes: 'note <b>x</b>' }] };
        const conteneur = element();
        const document = { getElementById: (id) => (id === 'confidentiel-notes-presences' ? conteneur : element()), querySelector: () => null, querySelectorAll: () => [],
            createElement: () => element(), addEventListener() {}, body: element(), documentElement: element(), readyState: 'complete' };
        const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} };
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/profil-etudiant-confidentiel.js', { document, db, cle: (k) => 'test_' + k, echapperHtml,
            obtenirDonneesSelonMode: () => [], toggleDisplay() {} }, win);
        win.chargerNotesPresencesConfidentiel(PIEGE_DA);
        const html = conteneur.innerHTML;
        expect(html).not.toContain('data-date="2026-02-09" onmouseover=');
        expect(html).toContain('data-date="2026-02-09&quot; onmouseover=&quot;alert(1)"');
        expect(html).toContain('data-da="2000001&quot; data-x=&quot;"');
        expect(html).toContain('note &lt;b&gt;x&lt;/b&gt;');   // le contenu était déjà échappé (escapeHtml local)
    });
});
