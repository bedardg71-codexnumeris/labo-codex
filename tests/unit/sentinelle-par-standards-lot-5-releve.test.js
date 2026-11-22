/**
 * SENTINELLE (21 nov. 2026) — LA PRATIQUE « PAR STANDARDS », LOT 5 : LE RELEVÉ PAR CIBLE QUE L'ÉTUDIANT·E REÇOIT.
 *
 * Conception : plans de travail/CONCEPTION-2026-11-21-releve-par-cible.md. Rapport : plans de travail/RAPPORT-2026-11-21-releve-par-cible.md.
 * Sur les modules RÉELS (`releve-cibles-data.js`, `releve-cibles-rendu.js`, `releve-cibles.js`, et ceux qu'ils lisent).
 *
 *   L1  le relevé LIT : aucune écriture, aucun geste d'inscription ni d'annulation dans ses trois modules ;
 *   L2  la note et le niveau de chaque cible sont ceux du profil et du tableau (le même calcul, jamais refait) ;
 *   L3  pendant la session, aucune note chiffrée tant qu'une cible est sans donnée : les cibles sans niveau, nommées ;
 *       à l'arrêt des notes, la note finale ; sous « note différée », aucun chiffre ;
 *   L4  les choix de didactique sont des données : d'office, les remarques sont montrées, les annulées non, les coches
 *       renseignées seulement ; chacun se renverse par une valeur, sans toucher au rendu ;
 *   L5  le mot de l'unité : « objectif » d'office, « cible » sur demande ; l'autre mot ne paraît alors nulle part ;
 *   L6  tout texte venu des données est échappé ; ni « CIB », ni handler en ligne, ni console.log ;
 *   L7  LES AUTRES PRATIQUES : hors « Par standards », rien ne s'ouvre et rien n'est offert ; le relevé n'est branché
 *       qu'à la section « Cibles » du profil et au tableau des cibles ; la synthèse de rétroaction et ses PDF ne le
 *       connaissent pas ;
 *   L8  les pages : jamais un bloc coupé ; un bloc plus haut qu'une page est seul sur la sienne.
 * La garde du lot 0 est rejouée à part : `sentinelle-moteur-cibles-0-garde.test.js` (16 sur 16).
 *
 * Données fictives (Zoé Fictive, Yan Inventé). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const ZOE = '2100001';
const YAN = '0001234';   // un DA à zéros de tête : il doit survivre au bouton du profil
const ENS = 'ENS1';
const ECHELLE = { id: 'ECH-banc', nom: 'Échelle du banc', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 12.49, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 12.5, max: 37.49, valeurCalcul: 25 },
    { code: '2', nom: 'Ça y est presque', min: 37.5, max: 62.49, valeurCalcul: 50 }, { code: '3', nom: 'Acquis', min: 62.5, max: 87.49, valeurCalcul: 75, description: 'Tous les critères essentiels sont respectés.' },
    { code: '4', nom: 'Avancé', min: 87.5, max: 100, valeurCalcul: 100, couleur: '#1a7f37' }] };
const CIBLES = [
    { id: 'cib-a', etiquette: 'Analyser', enonce: 'Analyser un texte.', poids: 1, terminale: false, criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true }, { id: 'k2', texte: 'Cite le texte', essentiel: false }] },
    { id: 'cib-b', etiquette: 'Structurer', enonce: 'Organiser un propos.', poids: 1, terminale: false, criteres: [] },
    { id: 'cib-c', etiquette: 'Dissertation', enonce: 'Rédiger une dissertation.', poids: 2, terminale: true, criteres: [] }];
const CONF = { type: 'cibles', ensembleCiblesId: ENS, echelleId: ECHELLE.id, niveauSansDonnee: '0' };
const ETUDIANTS = [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: '01' }, { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: '01' }];

let n = 0;
const I = (da, cibleId, niveau, date, extra) => Object.assign({ id: 'I' + (++n), type: 'inscription', da, ensembleId: ENS, cibleId, niveau,
    echelleId: niveau === null ? null : ECHELLE.id, date, horodatage: date + 'T12:00:00.000Z', productionId: null,
    noteBreve: niveau === null ? 'une remarque' : '', criteres: [] }, extra || {});
const A = (inscription, date = '2026-11-15', raison = '') => ({ id: 'A' + (++n), type: 'annulation', inscriptionId: inscription.id, da: inscription.da,
    ensembleId: ENS, cibleId: inscription.cibleId, date, horodatage: date + 'T13:00:00.000Z', raison });

/** Le banc : un magasin témoin (lectures et écritures consignées), les modules réels, un vrai DOM. `type` : la pratique active. */
function monter({ inscriptions = [], cibles = CIBLES, conf = CONF, type = 'cibles', differee = false, productions = [] } = {}) {
    const store = { test_ensemblesCibles: [{ id: ENS, coursId: null, cibles: clone(cibles) }], test_echellesTemplates: [clone(ECHELLE)],
        test_inscriptionsCibles: clone(inscriptions) };
    const ecrites = [];
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k) => { ecrites.push(k); }, get: async () => null, set: async (k) => { ecrites.push(k); } };
    const dom = new JSDOM('<!doctype html><body><div id="hote"></div></body>');
    const doc = dom.window.document;
    const win = { echapperHtml };
    const designation = { etat: 'ok', id: 'p-banc', donnees: { id: 'p-banc', nom: 'Pratique du banc', configuration: type === 'cibles' ? clone(conf) : { type } } };
    const globaux = { db, cle: (k) => 'test_' + k, echapperHtml, ...fonctionsDeLEchelle(), document: doc, Event: dom.window.Event,
        CSS: { escape: (s) => String(s) }, genererBadgePratiqueHTML: () => '<span class="badge-type-pratique">STD</span>',
        obtenirEchelleResolue: (id) => clone((store.test_echellesTemplates || []).find(e => e.id === id) || null),
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : (k === 'groupeEtudiants' ? ETUDIANTS : [])) };
    win.TableauNotation = { MOTS: { reglages: 'Réglages de la pratique', aucunEleve: 'Aucun·e étudiant·e.', exporter: 'Exporter' },
        couleurSure: (c) => (c || 'var(--accent-primaire)'), rafraichirSiAffiche() {} };
    win.designerPratiqueActive = () => clone(designation);
    win.obtenirEtudiantsCoursActif = () => clone(ETUDIANTS);
    win.noteDiffereeActive = () => differee;
    win.arrondirIndiceSurCent = (d) => Math.round(Math.round(d * 100 * 1e6) / 1e6);
    win.document = doc;
    win.addEventListener = () => {};
    win.removeEventListener = () => {};
    for (const f of ['js/pratiques/ensembles-cibles.js', 'js/pratiques/inscriptions-cibles.js', 'js/pratiques/note-cibles.js', 'js/tableau-cibles.js',
        'js/releve-cibles-data.js', 'js/releve-cibles-rendu.js', 'js/releve-cibles.js', 'js/profil-cibles.js']) chargerScript(f, globaux, win);
    const D = win.ReleveCiblesData;
    const releve = (da, demande) => D.construire(D.contexte(ETUDIANTS), ETUDIANTS.find(e => e.da === da), demande, { cours: '601-101 · Banc', date: '2026-11-21' });
    const feuille = (da, demande) => win.ReleveCiblesRendu.feuilleHTML(releve(da, demande));
    const texte = (da, demande) => { const d = doc.createElement('div'); d.innerHTML = feuille(da, demande); return d.textContent.replace(/\s+/g, ' '); };
    return { win, doc, D, RC: win.ReleveCibles, PC: win.ProfilCibles, TC: win.TableauCibles, ecrites, releve, feuille, texte };
}
const cible = (r, etiquette) => r.cibles.find(c => c.etiquette === etiquette);

const TROIS = () => [I(ZOE, 'cib-a', '4', '2026-10-01', { noteBreve: 'Analyse fine.', productionId: 'P1' }), I(ZOE, 'cib-b', '3', '2026-10-08'), I(ZOE, 'cib-c', '2', '2026-11-01')];
const PRODUCTIONS = [{ id: 'P1', titre: 'Analyse du chapitre 2' }];

/* ================================================================ L1 */
describe('L1 · le relevé lit ; il n\'écrit rien', () => {
    it('construire, mettre en page, ouvrir l\'aperçu, changer le mot : aucune écriture au magasin', () => {
        const m = monter({ inscriptions: TROIS(), productions: PRODUCTIONS });
        m.feuille(ZOE);
        expect(m.RC.ouvrir(ZOE)).toBe(true);
        const mot = m.doc.querySelector('[data-rc="mot"]');
        mot.value = 'cible';
        mot.dispatchEvent(new m.doc.defaultView.Event('change', { bubbles: true }));
        m.RC.fermer();
        expect(m.ecrites).toEqual([]);
    });
    it('ses trois modules ne connaissent aucun geste d\'écriture', () => {
        for (const f of ['js/releve-cibles-data.js', 'js/releve-cibles-rendu.js', 'js/releve-cibles.js']) {
            const code = lire(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
            expect(code, f).not.toMatch(/\.set(Sync)?\(|\.inscrire\(|\.annuler\(|\.enregistrer\(|localStorage|sauvegarderPreference|definirPreference/);
        }
    });
});

/* ================================================================ L2 */
describe('L2 · la note et les niveaux du relevé sont ceux du profil et du tableau', () => {
    it('trois cibles démontrées : (100 + 75 + 2 × 50) ÷ 4 = 68,75, comme `eleveDuContexte` ; chaque niveau est le retenu', () => {
        const m = monter({ inscriptions: TROIS(), productions: PRODUCTIONS });
        const r = m.releve(ZOE);
        const eleve = m.TC.eleveDuContexte(m.D.contexte(ETUDIANTS), ZOE);
        expect(r.note).toMatchObject({ etat: 'note', finale: false, valeur: 68.75 });
        expect(r.note.valeur).toBe(eleve.note.note);
        expect(r.cibles.map(c => c.niveau.code)).toEqual(eleve.retenue.lignes.map(l => l.retenu.niveau));
        expect(cible(r, 'Analyser')).toMatchObject({ etat: 'niveau', date: '2026-10-01', part: 25 });
        expect(cible(r, 'Dissertation')).toMatchObject({ terminale: true, part: 50 });
    });
    it('le niveau ne redescend pas : « Avancé » puis « Ça y est presque » ; le relevé dit « Avancé », et montre les deux, la bonne marquée', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-a', '2', '2026-11-10')] });
        const c = cible(m.releve(ZOE), 'Analyser');
        expect(c.niveau.nom).toBe('Avancé');
        expect(c.entrees.map(e => [e.niveau.code, e.retenu])).toEqual([['2', false], ['4', true]]);
        expect(m.texte(ZOE)).toContain('Niveau actuel : 4 · Avancé, depuis le');
    });
});

/* ================================================================ L3 */
describe('L3 · la note pendant la session, à l\'arrêt des notes, et différée', () => {
    it('une cible sans donnée : aucune note chiffrée ; les objectifs sans niveau sont nommés ; la cible porte le nom du niveau « sans donnée »', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01')] });
        const r = m.releve(ZOE);
        expect(r.note).toMatchObject({ etat: 'attente', valeur: null, enAttente: ['Structurer', 'Dissertation'], lignes: [] });
        const t = m.texte(ZOE);
        expect(t).toContain('Pas encore de note.');
        expect(t).toContain('Objectifs encore sans niveau : Structurer, Dissertation.');
        expect(t).toContain('Niveau actuel : aucun pour l’instant (Données insuffisantes)');
        const carteNote = (() => { const d = m.doc.createElement('div'); d.innerHTML = m.feuille(ZOE); return d.querySelector('[data-releve-bloc="note"]').textContent; })();
        expect(carteNote.replace(/0 %\./, ''), 'aucun pourcentage hors la règle de fin de cours').not.toMatch(/\d\s*%/);
    });
    it('`noteEnSession: "rien"` : les objectifs en attente ne sont pas nommés', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01')] });
        expect(m.releve(ZOE, { noteEnSession: 'rien' }).note.enAttente).toEqual([]);
        expect(m.texte(ZOE, { noteEnSession: 'rien' })).not.toContain('encore sans niveau');
    });
    it('à l\'arrêt des notes : « Note finale », la cible sans donnée à 0 %, « Niveau final »', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-b', '3', '2026-10-08')], conf: Object.assign({}, CONF, { notesFinales: true }) });
        const r = m.releve(ZOE);
        expect(r.note).toMatchObject({ etat: 'note', finale: true, valeur: 43.75 });
        expect(r.note.lignes.find(l => l.etiquette === 'Dissertation').compte).toBe('zero-arret');
        const t = m.texte(ZOE);
        expect(t).toContain('Note finale : ');
        expect(t).toContain('Niveau final : 4 · Avancé');
        expect(t).not.toContain('Elle peut encore monter');
    });
    it('sous « note différée » : aucune note, aucun calcul, même quand elle se calculerait', () => {
        const m = monter({ inscriptions: TROIS(), differee: true });
        expect(m.releve(ZOE).note).toMatchObject({ etat: 'differee', valeur: null, lignes: [] });
        expect(m.texte(ZOE)).toContain('La note du cours sera communiquée plus tard.');
        expect(m.texte(ZOE)).not.toContain('68');
    });
});

/* ================================================================ L4 */
describe('L4 · les choix de didactique sont des données, chacun se renverse par une valeur', () => {
    const haut = I(ZOE, 'cib-a', '4', '2026-10-01', { noteBreve: 'trace invalidée' });
    const INSC = [haut, A(haut, '2026-10-03', 'copie d\'un pair'),
        I(ZOE, 'cib-a', '3', '2026-10-10', { criteres: [{ id: 'k1', texte: 'Relève trois procédés', essentiel: true, respecte: true },
            { id: 'k2', texte: 'Cite le texte', essentiel: false, respecte: null }] }),
        I(ZOE, 'cib-a', null, '2026-10-20', { noteBreve: 'Hésite encore sur la métaphore.' })];
    it('d\'office : les remarques sont montrées, les annulées non, les coches renseignées seulement, les critères de la cible et l\'échelle aussi', () => {
        const m = monter({ inscriptions: INSC });
        expect(m.D.CHOIX).toMatchObject({ mot: 'objectif', remarques: true, annulees: false, coches: 'renseignees', historique: 'tout', origine: true,
            noteEnSession: 'attente-nommee', poids: true, calcul: true, criteres: true, echelle: true, date: true });
        const c = cible(m.releve(ZOE), 'Analyser');
        expect(c.niveau.code, 'l\'annulée ne compte pas').toBe('3');
        expect(c.entrees.map(e => e.type)).toEqual(['remarque', 'niveau']);
        expect(c.entrees[1].criteres).toEqual([{ texte: 'Relève trois procédés', essentiel: true, respecte: true }]);
        expect(c.criteres).toEqual([{ texte: 'Relève trois procédés', essentiel: true }, { texte: 'Cite le texte', essentiel: false }]);
        const t = m.texte(ZOE);
        expect(t).toContain('Hésite encore sur la métaphore.');
        expect(t).not.toContain('trace invalidée');
        expect(t).not.toContain('copie d\'un pair');
        expect(t).toContain('3 · Acquis Tous les critères essentiels sont respectés.');
    });
    it('renversés : sans remarques ; avec les annulées (sans leur raison) ; toutes les coches ; aucune ; le retenu seul ; sans critères, sans échelle, sans poids, sans date', () => {
        const m = monter({ inscriptions: INSC });
        expect(cible(m.releve(ZOE, { remarques: false }), 'Analyser').entrees.map(e => e.type)).toEqual(['niveau']);
        expect(m.texte(ZOE, { remarques: false })).not.toContain('Hésite encore');
        const avec = cible(m.releve(ZOE, { annulees: true }), 'Analyser').entrees;
        expect(avec.filter(e => e.annulee)).toHaveLength(1);
        expect(m.texte(ZOE, { annulees: true })).toContain('Inscription annulée le');
        expect(m.texte(ZOE, { annulees: true }), 'la raison d\'une annulation reste chez l\'enseignant·e').not.toContain('copie d\'un pair');
        expect(cible(m.releve(ZOE, { coches: 'toutes' }), 'Analyser').entrees[1].criteres).toHaveLength(2);
        expect(cible(m.releve(ZOE, { coches: 'aucune' }), 'Analyser').entrees[1].criteres).toEqual([]);
        const seul = monter({ inscriptions: [I(ZOE, 'cib-a', '4', '2026-10-01'), I(ZOE, 'cib-a', '2', '2026-11-10')] });
        expect(cible(seul.releve(ZOE, { historique: 'retenu' }), 'Analyser').entrees.map(e => e.niveau.code)).toEqual(['4']);
        const nu = m.releve(ZOE, { criteres: false, echelle: false, poids: false, date: false });
        expect(cible(nu, 'Analyser')).toMatchObject({ criteres: [], poids: null, part: null });
        expect(nu.echelle).toBeNull();
        expect(nu.date).toBe('');
    });
    it('l\'origine : le titre de la production ; sans production, rien ; `origine: false` : jamais', () => {
        const m = monter({ inscriptions: TROIS(), productions: PRODUCTIONS });
        expect(cible(m.releve(ZOE), 'Analyser').entrees[0].origine).toBe('Analyse du chapitre 2');
        expect(cible(m.releve(ZOE), 'Structurer').entrees[0].origine).toBeNull();
        expect(m.texte(ZOE)).not.toContain('Sans production');
        expect(cible(m.releve(ZOE, { origine: false }), 'Analyser').entrees[0].origine).toBeNull();
    });
    it('une valeur inconnue ne dérègle rien : le choix d\'office tient', () => {
        const m = monter({});
        expect(m.D.lireChoix({ mot: 'standard', coches: 'oui', remarques: 'non' })).toEqual(clone(m.D.CHOIX));
    });
});

/* ================================================================ L5 */
describe('L5 · le mot de l\'unité : « objectif » d\'office, « cible » sur demande', () => {
    it('d\'office, le relevé dit « objectif » et n\'écrit « cible » nulle part ; sur demande, l\'inverse', () => {
        const m = monter({ inscriptions: [I(ZOE, 'cib-c', '2', '2026-11-01')] });
        const objectif = m.texte(ZOE);
        expect(objectif).toContain('Relevé par objectif');
        expect(objectif).toContain('objectif terminal');
        expect(objectif).not.toMatch(/cible/i);
        const cibleMot = m.texte(ZOE, { mot: 'cible' });
        expect(cibleMot).toContain('Relevé par cible');
        expect(cibleMot).toContain('cible terminale');
        expect(cibleMot).toContain('Cibles encore sans niveau');
        expect(cibleMot).not.toMatch(/objectif/i);
    });
    it('aucune phrase du relevé ne tutoie ni ne vouvoie l\'étudiant·e', () => {
        const m = monter({ inscriptions: TROIS() });
        for (const t of [m.texte(ZOE), m.texte(YAN)]) expect(t).not.toMatch(/\b(tu|ton|ta|tes|toi|vous|votre|vos)\b/i);
    });
});

/* ================================================================ L6 */
describe('L6 · sécurité : tout texte des données est échappé ; ni « CIB », ni handler en ligne, ni console.log', () => {
    it('une étiquette, un énoncé, un critère, une rétroaction et un nom hostiles restent du texte', () => {
        const mal = '<img src=x onerror="alert(1)">';
        const m = monter({ cibles: [{ id: 'cib-a', etiquette: mal, enonce: mal, poids: 1, terminale: false, criteres: [{ id: 'k1', texte: mal, essentiel: true }] }],
            inscriptions: [I(ZOE, 'cib-a', '3', '2026-10-01', { noteBreve: mal, criteres: [{ id: 'k1', texte: mal, essentiel: true, respecte: false }] })] });
        const d = m.doc.createElement('div');
        d.innerHTML = m.feuille(ZOE);
        expect(d.querySelectorAll('img')).toHaveLength(0);
        expect(d.textContent).toContain(mal);
    });
    it('les trois modules : aucun « CIB » affiché, aucun `on…=` dans un gabarit, aucun console.log', () => {
        const m = monter({ inscriptions: TROIS() });
        m.RC.ouvrir(ZOE);
        expect(m.doc.body.innerHTML).not.toMatch(/\bCIB\b/);
        expect(m.doc.body.innerHTML).not.toMatch(/\son[a-z]+\s*=/i);
        for (const f of ['js/releve-cibles-data.js', 'js/releve-cibles-rendu.js', 'js/releve-cibles.js']) {
            expect(lire(f), f).not.toMatch(/console\.(log|warn|error)|\bCIB\b/);
        }
    });
});

/* ================================================================ L7 */
describe('L7 · les autres pratiques ne voient rien du relevé', () => {
    it.each(['standards', 'sommative', 'specifications', 'denotation'])('pratique « %s » : pas de contexte, rien d\'offert, rien ne s\'ouvre', (type) => {
        const m = monter({ type, inscriptions: TROIS() });
        expect(m.D.contexte(ETUDIANTS)).toBeNull();
        expect(m.RC.estActif()).toBe(false);
        expect(m.RC.ouvrir(ZOE)).toBe(false);
        expect(m.doc.querySelector('.rc-overlay')).toBeNull();
        expect(m.PC.estActive()).toBe(false);
        expect(m.PC.panneau(ZOE)).toBe('');
    });
    it('le relevé n\'est branché qu\'à la section « Cibles » du profil et au tableau des cibles ; la synthèse et ses PDF ne le connaissent pas', () => {
        const dossier = path.join(RACINE, 'js');
        const fichiers = [];
        const parcourir = (d) => readdirSync(d, { withFileTypes: true }).forEach(e => (e.isDirectory() ? parcourir(path.join(d, e.name)) : (e.name.endsWith('.js') && fichiers.push(path.join(d, e.name)))));
        parcourir(dossier);
        const lecteurs = fichiers.filter(f => /ReleveCibles/.test(readFileSync(f, 'utf8'))).map(f => path.relative(RACINE, f).split(path.sep).join('/')).sort();
        expect(lecteurs).toEqual(['js/profil-cibles.js', 'js/releve-cibles-data.js', 'js/releve-cibles-rendu.js', 'js/releve-cibles.js', 'js/tableau-cibles.js']);
        for (const f of ['js/releve-cibles-data.js', 'js/releve-cibles-rendu.js', 'js/releve-cibles.js']) {
            expect(lire(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''), f).not.toMatch(/evaluationsSauvegardees|indicesCP|syntheseRetroaction|calculerDetailsNoteFinale|simulerIndices/);
        }
    });
    it('en « Par standards », le profil offre le relevé, le DA écrit tel quel (zéros de tête compris), sans `data-param`', () => {
        const m = monter({ inscriptions: TROIS() });
        const d = m.doc.createElement('div');
        d.innerHTML = m.PC.panneau(YAN);
        const b = d.querySelector('[data-action="ReleveCibles.ouvrir"]');
        expect(b.textContent).toBe(m.RC.MOTS.boutonProfil);
        expect(b.dataset.da).toBe(YAN);
        expect(b.hasAttribute('data-param')).toBe(false);
        expect(m.RC.ouvrir(b)).toBe(true);
        expect(m.doc.querySelector('[data-rc="etudiant"]').value).toBe(YAN);
        expect(m.doc.querySelector('[data-rc="groupe"]').textContent).toBe('Télécharger les 2 relevés du groupe (ZIP)');
    });
});

/* ================================================================ L8 */
describe('L8 · les pages : jamais un bloc coupé', () => {
    it('les blocs se suivent tant qu\'ils tiennent ; un bloc plus haut que la page est seul sur la sienne', () => {
        const m = monter({});
        expect(m.RC.paginer([100, 300, 500, 200, 1200, 50], 944).map(p => p.indices)).toEqual([[0, 1, 2], [3], [4], [5]]);
        expect(m.RC.paginer([], 944)).toEqual([]);
        expect(m.RC.paginer([944], 944)).toEqual([{ indices: [0], hauteur: 944 }]);
    });
    it('un bloc par cible, dans l\'ordre de l\'ensemble, entre l\'en-tête, la note et l\'échelle', () => {
        const m = monter({ inscriptions: TROIS() });
        const d = m.doc.createElement('div');
        d.innerHTML = m.feuille(ZOE);
        expect([...d.querySelectorAll('[data-releve-bloc]')].map(b => b.dataset.releveBloc)).toEqual(['entete', 'note', 'cible', 'cible', 'cible', 'echelle']);
    });
});

/*
 * JOURNAL DES BREAK-TESTS (21 nov. 2026) — chaque mutation posée dans le code réel, le fichier rejoué, la mutation retirée.
 * Tous les essais étaient au vert avant et après. « ROUGE (n) » : le nombre d'essais qui ont rougi. 15 mutations, 15 rouges.
 *
 * BT1  (L1) `releve-cibles.js`, `_surChangement` : une écriture au magasin quand on change le mot.            ROUGE (2)
 * BT2  (L2) `releve-cibles-data.js`, `_note` : la note du relevé refaite (moyenne + 1) au lieu de celle du moteur. ROUGE (2)
 * BT3  (L3) `_note` : l'attente retirée (une note paraîtrait avec des cibles sans donnée).                    ROUGE (2)
 * BT3b (L3) `_note` : la « note différée » ignorée.                                                           ROUGE (1)
 * BT4  (L4) `CHOIX.annulees` passe à vrai d'office.                                                           ROUGE (2)
 * BT4b (L4) `_entrees` : le filtre des remarques retiré (la case de la fenêtre ne ferait plus rien).          ROUGE (1)
 * BT4c (L4) `_coches` : les critères non renseignés montrés d'office.                                         ROUGE (1)
 * BT4d (L4) `releve-cibles-rendu.js`, `_entree` : la raison d'une annulation écrite à l'étudiant·e.           ROUGE (1)
 * BT5  (L5) `UNITES.objectif.terminal` dit « cible terminale ».                                               ROUGE (1)
 * BT5b (L5) `MOTS.noteTitre` tutoie (« Ta note du cours »).                                                   ROUGE (1)
 * BT6  (L6) `_cible` : l'étiquette d'une cible écrite sans `esc`.                                             ROUGE (1)
 * BT7  (L7) `_designation` : le relevé s'ouvre pour toute pratique.                                           ROUGE (4)
 * BT7b (L7) `synthese-retroaction-rendu.js` : une lecture de `ReleveCibles` ajoutée à la synthèse.            ROUGE (1)
 * BT7c (L7) `boutonProfilHTML` : le DA repasse par `data-param` (un DA à zéros de tête deviendrait un nombre). ROUGE (1)
 * BT8  (L8) `paginer` : plus de saut de page (tous les blocs sur une page).                                   ROUGE (1)
 */
