/**
 * SENTINELLE (21 nov. 2026) — LA PRATIQUE « PAR STANDARDS », LOT 2 : INSCRIRE UN NIVEAU.
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (lot 2, et la section du 21 nov. 2026).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-2-inscrire.md.
 *
 * VERROUILLÉ ICI, sur les modules RÉELS (le navigateur est éprouvé par la spec Playwright du lot) :
 *   A. Deux inscriptions sur la même cible donnent deux entrées.
 *   B. Aucune écriture ne réduit la liste ; une annulation ne retire rien (elle s'AJOUTE, l'inscription ne change pas).
 *   C. Les coches distinguent « non renseigné » (null) de « renseigné, non respecté » (false) ; une inscription sans coche
 *      est complète ; l'application ne calcule RIEN à partir d'elles (ni niveau proposé, ni refusé, ni alerte).
 *   D. La correction d'un DA déplace les inscriptions (et les annulations), sans en ajouter ni en retirer.
 *   E. La note brève, la raison d'une annulation et les textes de la cible sont échappés à l'affichage.
 *   F. Un codex enregistré puis rouvert rend la liste à l'identique (vrai ZIP, vrai `chargerCodex`).
 *   G. (Révisé au lot 3, 21 nov. 2026.) Une case montre le NIVEAU RETENU, le meilleur ; elle ne montre plus le dernier.
 *      Une case sans donnée porte le nom du niveau « sans donnée ». (`etatDeLaCase`, le dernier niveau, est retirée.)
 *   H. La clé est inscrite à tous les registres nominatifs.
 *   I. L'assistant pose la question avant de retirer une cible qui porte des niveaux inscrits ; ses inscriptions restent.
 *      Un critère retiré ne pose pas de question : l'inscription garde le texte du critère jugé.
 *   J. Les cibles offertes pour une production (sa liste facultative ; sans liste, toutes).
 *   K. Une échelle à trois niveaux comme à six : la fenêtre offre chacun, le « sans donnée » compris (E3).
 *   L. Complément du 21 nov., 9 h 17 : une inscription peut ne porter aucun niveau (une « remarque ») ; `niveau: null`,
 *      jamais le niveau « sans donnée » ; l'inscription vide est refusée, en mots ; une remarque n'entre pas au niveau
 *      retenu (révisé au lot 3), et la case montre ✎ quand elle n'a que des remarques ; l'historique, l'annulation, les critères.
 *
 * Données fictives (Zoé Fictive, Yan Inventé, cours « 999-ZZZ-ZZ »). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import JSZip from 'jszip';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc, RACINE } from './_helpers/bac-suivi.js';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';
import { tranche } from './_helpers/tranche.js';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const CLE = 'test_inscriptionsCibles';

const ZOE = '2100001';
const YAN = '2100002';
const CIBLE = { id: 'cib-lire', etiquette: 'Lire un texte', enonce: 'Dégager le sens d\'un texte.', poids: 1, terminale: false,
    criteres: [{ id: 'crit-a', texte: 'Repère les idées', essentiel: true }, { id: 'crit-b', texte: 'Cite le texte', essentiel: false },
        { id: 'crit-c', texte: 'Reformule sans contresens', essentiel: true }] };
const CIBLE_SANS_CRITERE = { id: 'cib-ecrire', etiquette: 'Rédiger une analyse', enonce: 'Rédiger.', poids: 1, terminale: true, criteres: [] };
const ECHELLE = { id: 'ECH-banc', nom: 'Échelle du banc', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 12.49, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 12.5, max: 37.49, valeurCalcul: 25 },
    { code: '2', nom: 'Ça y est presque', min: 37.5, max: 62.49, valeurCalcul: 50 }, { code: '3', nom: 'Acquis', min: 62.5, max: 87.49, valeurCalcul: 75 },
    { code: '4', nom: 'Avancé', min: 87.5, max: 100, valeurCalcul: 100 }] };

/* ================================================================ Le module propriétaire, sur un magasin de banc */
function monterInscriptions(store = {}) {
    const journal = [];
    const win = { echapperHtml };
    let n = 0;
    chargerScript('js/pratiques/inscriptions-cibles.js', { db: dbBanc(store, journal), cle: (k) => 'test_' + k, echapperHtml }, win);
    chargerScript('js/pratiques/note-cibles.js', { ...fonctionsDeLEchelle() }, win);   // lot 3 : le niveau retenu d'une case
    win.genererIdUnique = (p) => p + 'BANC' + (++n);
    return { win, IC: win.InscriptionsCibles, store, journal };
}
const saisie = (IC, quoi = {}) => Object.assign({ da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '2', echelleId: ECHELLE.id,
    date: '2026-11-21', productionId: null, noteBreve: '', criteres: IC.etatDesCriteres(CIBLE, {}) }, quoi);
const ecritures = (journal) => journal.filter(e => e.k === CLE).map(e => e.v);
/** Lot 3 : ce qu'une case retient (le meilleur niveau) et ses comptes, par `NoteCibles` sur l'historique de la case. */
const etatCase = (win, liste, da = ZOE, cibleId = CIBLE.id, echelle = ECHELLE) => win.NoteCibles.retenirDansLHistorique(
    win.InscriptionsCibles.historiqueDeLaCase(liste, da, 'ENS1', cibleId), win.NoteCibles.ordreDeLEchelle(echelle));

describe('A · deux inscriptions sur la même cible donnent deux entrées', () => {
    it('deux gestes, deux entrées, dans l\'ordre ; l\'historique de la case les montre toutes les deux', async () => {
        const m = monterInscriptions();
        expect((await m.IC.inscrire([saisie(m.IC, { niveau: '1', date: '2026-11-10' })])).ok).toBe(true);
        expect((await m.IC.inscrire([saisie(m.IC, { niveau: '1', date: '2026-11-10' })])).ok).toBe(true);   // même niveau, même date
        const liste = m.store[CLE];
        expect(liste).toHaveLength(2);
        expect(liste.map(e => e.type)).toEqual(['inscription', 'inscription']);
        expect(new Set(liste.map(e => e.id)).size).toBe(2);
        expect(m.IC.historiqueDeLaCase(liste, ZOE, 'ENS1', CIBLE.id)).toHaveLength(2);
        expect(etatCase(m.win, liste).actives).toBe(2);
    });

    it('la forme rangée d\'une inscription : identité, étudiant·e, cible, niveau (code), date, note brève, production ou rien, critères', async () => {
        const m = monterInscriptions();
        await m.IC.inscrire([saisie(m.IC, { noteBreve: '  Les idées sont là ; la citation manque.  ', productionId: 'P1' })]);
        const [i] = m.store[CLE];
        // 22 nov. 2026 (l'écran d'observation) : `origine` s'ajoute ; une production désignée l'impose.
        // 24 nov. 2026 (« Tampons d'observation », lot 2) : `tampons` s'ajoute, la copie des tampons posés ; vide ici.
        expect(Object.keys(i).sort()).toEqual(['cibleId', 'criteres', 'da', 'date', 'echelleId', 'ensembleId', 'horodatage', 'id',
            'niveau', 'noteBreve', 'origine', 'productionId', 'tampons', 'type']);
        expect(i.tampons).toEqual([]);
        expect(i.origine).toBe('production');
        expect(i).toMatchObject({ type: 'inscription', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '2', echelleId: 'ECH-banc',
            date: '2026-11-21', productionId: 'P1', noteBreve: 'Les idées sont là ; la citation manque.' });
        expect(i.horodatage).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});

describe('B · aucune écriture ne réduit la liste ; une annulation ne retire rien', () => {
    it('chaque écriture garde, à l\'identique et en tête, tout ce qui était là', async () => {
        const VIEILLE = { id: 'VIEILLE', type: 'inscription', da: YAN, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '3',
            date: '2026-09-01', horodatage: '2026-09-01T12:00:00.000Z', productionId: null, noteBreve: '', criteres: [] };
        const m = monterInscriptions({ [CLE]: [clone(VIEILLE)] });
        const a = await m.IC.inscrire([saisie(m.IC)]);
        await m.IC.inscrire([saisie(m.IC, { cibleId: CIBLE_SANS_CRITERE.id, criteres: [] }), saisie(m.IC, { niveau: '3' })]);
        await m.IC.annuler(a.entrees[0].id, 'Erreur de saisie');
        const toutes = ecritures(m.journal);
        expect(toutes, 'trois gestes, trois écritures').toHaveLength(3);
        expect(toutes.map(v => v.length)).toEqual([2, 4, 5]);
        let avant = [VIEILLE];
        for (const apres of toutes) {
            expect(apres.length, 'la liste grandit').toBeGreaterThan(avant.length);
            expect(apres.slice(0, avant.length), 'ce qui était là reste, à l\'identique, à sa place').toEqual(avant);
            avant = apres;
        }
    });

    it('annuler AJOUTE une entrée qui désigne l\'inscription ; l\'inscription reste telle quelle, et l\'historique la montre annulée', async () => {
        const m = monterInscriptions();
        const r = await m.IC.inscrire([saisie(m.IC, { niveau: '3', noteBreve: 'bien' })]);
        const inscription = clone(m.store[CLE][0]);
        const an = await m.IC.annuler(r.entrees[0].id, '  Trace invalide : copie d\'un pair.  ');
        expect(an.ok).toBe(true);
        expect(m.store[CLE]).toHaveLength(2);
        expect(m.store[CLE][0], 'l\'inscription n\'est pas réécrite').toEqual(inscription);
        expect(m.store[CLE][1]).toMatchObject({ type: 'annulation', inscriptionId: inscription.id, da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id,
            raison: 'Trace invalide : copie d\'un pair.' });
        expect(m.store[CLE][1].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const h = m.IC.historiqueDeLaCase(m.store[CLE], ZOE, 'ENS1', CIBLE.id);
        expect(h).toHaveLength(1);
        expect(h[0].annulation.id).toBe(m.store[CLE][1].id);
        expect(etatCase(m.win, m.store[CLE])).toMatchObject({ retenu: null, actives: 0, remarques: 0, annulees: 1 });
    });

    it('refus, sans rien écrire : annuler deux fois ; annuler une inscription introuvable', async () => {
        const m = monterInscriptions();
        const r = await m.IC.inscrire([saisie(m.IC)]);
        await m.IC.annuler(r.entrees[0].id, '');
        const n = m.journal.length;
        expect(await m.IC.annuler(r.entrees[0].id, 'encore')).toEqual({ ok: false, motif: m.IC.MOTIFS.DEJA_ANNULEE });
        expect(await m.IC.annuler('INTROUVABLE', '')).toEqual({ ok: false, motif: m.IC.MOTIFS.INTROUVABLE });
        expect(m.journal.length, 'aucune écriture').toBe(n);
    });

    it('`ajouter` est la seule transformation : la liste rendue commence par la liste reçue, intacte', () => {
        const m = monterInscriptions();
        const avant = [{ id: 'a' }, { id: 'b' }];
        const gele = clone(avant);
        const apres = m.IC.ajouter(avant, [{ id: 'c' }]);
        expect(apres).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
        expect(avant, 'la liste reçue n\'est pas touchée').toEqual(gele);
    });
});

describe('C · les coches : « non renseigné » n\'est pas « non respecté », et rien ne se calcule à partir d\'elles', () => {
    it('true, false et null restent trois états, du formulaire au stockage', async () => {
        const m = monterInscriptions();
        const criteres = m.IC.etatDesCriteres(CIBLE, { 'crit-a': true, 'crit-b': false });
        expect(criteres.map(k => [k.id, k.respecte])).toEqual([['crit-a', true], ['crit-b', false], ['crit-c', null]]);
        await m.IC.inscrire([saisie(m.IC, { criteres })]);
        const rangee = JSON.parse(JSON.stringify(m.store[CLE][0]));   // ce qui voyage : du JSON
        expect(rangee.criteres.map(k => k.respecte)).toEqual([true, false, null]);
        expect(m.IC.compterCriteres(rangee.criteres)).toEqual({ respectes: 1, nonRespectes: 1, nonRenseignes: 1 });
    });

    it('une inscription sans aucune coche est complète : ses critères sont « non renseignés », pas « non respectés »', async () => {
        const m = monterInscriptions();
        const sans = saisie(m.IC);
        expect(m.IC.motifsRefus(sans, ECHELLE)).toEqual([]);
        await m.IC.inscrire([sans]);
        expect(m.store[CLE][0].criteres.map(k => k.respecte)).toEqual([null, null, null]);
        expect(m.store[CLE][0].criteres.some(k => k.respecte === false)).toBe(false);
    });

    it('le texte et la marque « essentiel » du critère jugé sont gardés avec l\'inscription', () => {
        const m = monterInscriptions();
        expect(m.IC.etatDesCriteres(CIBLE, { 'crit-a': true })[0]).toEqual({ id: 'crit-a', texte: 'Repère les idées', essentiel: true, respecte: true });
        expect(m.IC.etatDesCriteres(CIBLE_SANS_CRITERE, { x: true }), 'une cible sans critère').toEqual([]);
    });

    it('aucun niveau refusé ni alerte : tous les essentiels « non respectés » et le plus haut niveau s\'inscrivent ; tout « respecté » et le plus bas aussi', () => {
        const m = monterInscriptions();
        const tousNon = m.IC.etatDesCriteres(CIBLE, { 'crit-a': false, 'crit-b': false, 'crit-c': false });
        const tousOui = m.IC.etatDesCriteres(CIBLE, { 'crit-a': true, 'crit-b': true, 'crit-c': true });
        expect(m.IC.motifsRefus(saisie(m.IC, { niveau: '4', criteres: tousNon }), ECHELLE)).toEqual([]);
        expect(m.IC.motifsRefus(saisie(m.IC, { niveau: '1', criteres: tousOui }), ECHELLE)).toEqual([]);
    });

    it('la fenêtre ne propose aucun niveau : cocher tous les critères ne coche aucun niveau ; « Aucun niveau » reste coché', async () => {
        const e = monterEcran();
        e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
        const f = e.doc.querySelector('.tc-fenetre');
        f.querySelectorAll('.tc-coche--oui').forEach(b => b.click());
        expect([...f.querySelectorAll('.tc-coche[aria-pressed="true"]')].map(b => b.dataset.valeur)).toEqual(['oui', 'oui', 'oui']);
        expect(f.querySelectorAll('.tc-niveaux input:checked:not([data-sans-niveau])'), 'aucun niveau de l\'échelle').toHaveLength(0);
        expect(f.querySelector('.tc-niveaux input[data-sans-niveau]').checked).toBe(true);
        expect(f.querySelector('.tc-alerte').textContent).toBe('');
    });

    it('toucher encore une coche la ramène à « non renseigné » ; « Respecté » et « Non respecté » s\'excluent', () => {
        const e = monterEcran();
        e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
        const ligne = e.doc.querySelector('.tc-critere[data-critere="crit-a"]');
        const oui = ligne.querySelector('.tc-coche--oui');
        const non = ligne.querySelector('.tc-coche--non');
        oui.click();
        non.click();
        expect([oui.getAttribute('aria-pressed'), non.getAttribute('aria-pressed')]).toEqual(['false', 'true']);
        non.click();
        expect([oui.getAttribute('aria-pressed'), non.getAttribute('aria-pressed')]).toEqual(['false', 'false']);
    });

    it('de bout en bout, à l\'écran : une coche « respecté », une « non respecté », une laissée ; le niveau choisi ; tout est rangé tel quel', async () => {
        const e = monterEcran();
        e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
        const f = e.doc.querySelector('.tc-fenetre');
        f.querySelector('.tc-critere[data-critere="crit-a"] .tc-coche--oui').click();
        f.querySelector('.tc-critere[data-critere="crit-b"] .tc-coche--non').click();
        f.querySelector('.tc-niveaux input[value="4"]').checked = true;
        f.querySelector('.tc-retroaction').value = 'Bonne lecture.';
        f.querySelector('[data-tc="inscrire"]').click();
        await new Promise(r => setTimeout(r, 0));
        const [i] = e.store[CLE];
        expect(i.niveau).toBe('4');
        expect(i.criteres.map(k => k.respecte)).toEqual([true, false, null]);
        expect(i.noteBreve).toBe('Bonne lecture.');
        expect(e.doc.querySelector('.tc-fenetre'), 'la fenêtre se ferme').toBeNull();
    });
});

/* ================================================================ D. La correction d'un DA */
describe('D · la correction d\'un DA déplace les inscriptions et leurs annulations', () => {
    const T = 'a2026';
    const ANCIEN = '1111111';
    const NOUVEAU = '7654321';
    function monterCorrection() {
        const magasin = new Map();
        const semis = {
            [`${T}_groupeEtudiants`]: [{ da: ANCIEN, nom: 'Fictive', prenom: 'Zoé', groupe: '00001' }, { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: '00001' }],
            [`${T}_inscriptionsCibles`]: [
                { id: 'I1', type: 'inscription', da: ANCIEN, ensembleId: 'ENS1', cibleId: 'c1', niveau: '2', date: '2026-11-01', criteres: [] },
                { id: 'I2', type: 'inscription', da: ANCIEN, ensembleId: 'ENS1', cibleId: 'c1', niveau: '3', date: '2026-11-08', criteres: [] },
                { id: 'X1', type: 'annulation', inscriptionId: 'I1', da: ANCIEN, ensembleId: 'ENS1', cibleId: 'c1', date: '2026-11-09', raison: '' },
                { id: 'I3', type: 'inscription', da: YAN, ensembleId: 'ENS1', cibleId: 'c1', niveau: '1', date: '2026-11-01', criteres: [] }
            ]
        };
        Object.entries(semis).forEach(([k, v]) => magasin.set(k, JSON.stringify(v)));
        const db = {
            getSync: (k, d = null) => (magasin.has(k) ? JSON.parse(magasin.get(k)) : d),
            keysSync: () => [...magasin.keys()],
            async modifier(k, mutateur, d = null) {
                const lus = magasin.has(k) ? JSON.parse(magasin.get(k)) : d;
                const v = await mutateur(lus);
                if (v === undefined) return undefined;
                magasin.set(k, JSON.stringify(v));
                return v;
            }
        };
        const NOMS = ['groupeEtudiants', 'inscriptionsCibles', 'evaluationsSauvegardees', 'presences'];
        const cle = (nom) => (NOMS.includes(nom) ? `${T}_${nom}` : nom);
        const w = chargerScript('js/correction-da.js', { db, cle, modifierEtAnnoncer: (k, m, d) => db.modifier(k, m, d) });
        w.obtenirTrimestreId = () => T;
        w.temoinEnregistrement = { enregistre() {} };
        return { w, lire: (k) => JSON.parse(magasin.get(k)) };
    }

    it('la passe à blanc compte les inscriptions (pas les annulations), sans rien écrire', () => {
        const m = monterCorrection();
        const avant = m.lire(`${T}_inscriptionsCibles`);
        expect(m.w.CorrectionDA.passeABlanc(ANCIEN, '').comptes.inscriptions).toBe(2);
        expect(m.lire(`${T}_inscriptionsCibles`)).toEqual(avant);
    });

    it('corriger : toutes les entrées de l\'élève passent sous le nouveau DA ; rien n\'est ajouté ni retiré ; l\'autre élève ne bouge pas', async () => {
        const m = monterCorrection();
        const avant = m.lire(`${T}_inscriptionsCibles`);
        const r = await m.w.CorrectionDA.corriger(ANCIEN, NOUVEAU, { geste: 'banc' });
        expect(r.ok).toBe(true);
        const apres = m.lire(`${T}_inscriptionsCibles`);
        expect(apres).toHaveLength(avant.length);
        expect(apres.map(e => e.id)).toEqual(avant.map(e => e.id));
        expect(apres.filter(e => e.da === NOUVEAU).map(e => e.id)).toEqual(['I1', 'I2', 'X1']);
        expect(apres.filter(e => e.da === ANCIEN)).toEqual([]);
        expect(apres.find(e => e.id === 'I3').da).toBe(YAN);
        // Tout le reste de chaque entrée est intact.
        apres.forEach((e, i) => expect(Object.assign({}, e, { da: avant[i].da })).toEqual(avant[i]));
    });
});

/* ================================================================ L'écran (tableau-cibles.js), dans un vrai DOM (jsdom) */
function monterEcran({ store = {}, etudiants, cibles, echelle = ECHELLE, productions } = {}) {
    const dom = new JSDOM('<!doctype html><body><div id="hote"></div></body>');
    const doc = dom.window.document;
    const journal = [];
    const base = Object.assign({
        test_ensemblesCibles: [{ id: 'ENS1', coursId: 'COURS-ZZZ', cibles: cibles || [clone(CIBLE), clone(CIBLE_SANS_CRITERE)] }],
        test_echellesTemplates: [clone(echelle)]
    }, store);
    const db = dbBanc(base, journal);
    const win = { echapperHtml };
    const globaux = {
        document: doc, Event: dom.window.Event, echapperHtml, db, cle: (k) => 'test_' + k,
        CSS: { escape: (s) => String(s).replace(/["\\]/g, '\\$&') },
        obtenirEchelleResolue: (id) => (base.test_echellesTemplates || []).find(e => e.id === id) || null,
        genererBadgePratiqueHTML: () => '<span class="badge-type-pratique">STD</span>',
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? (productions || []) : []),
        ...fonctionsDeLEchelle()   // lots 3 et 4 : l'ordre des niveaux et la valeur ponctuelle, les fonctions réelles
    };
    let n = 0;
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/pratiques/note-cibles.js', globaux, win);   // lots 3 et 4 : le niveau retenu, la note
    win.genererIdUnique = (p) => p + 'ECRAN' + (++n);
    win.TableauNotation = { MOTS: { reglages: 'Réglages de la pratique', aucunEleve: 'Aucun·e étudiant·e.' },
        couleurSure: (c) => (c || 'var(--accent-primaire)'), rafraichirSiAffiche() {} };
    win.obtenirPratiqueParId = () => ({ expliquerNoteNonConstructible: () => 'Pas encore de note.' });
    chargerScript('js/tableau-cibles.js', globaux, win);
    const ctx = { etat: 'cibles', pratiqueId: 'cib-banc', pratiqueNom: 'Par standards du banc',
        donnees: { id: 'cib-banc', configuration: { type: 'cibles', ensembleCiblesId: 'ENS1', echelleId: echelle.id, niveauSansDonnee: String(echelle.niveaux[0].code) } },
        etudiants: etudiants || [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé' }, { da: YAN, nom: 'Inventé', prenom: 'Yan' }],
        productions: productions || [] };
    const hote = doc.getElementById('hote');
    hote.innerHTML = win.TableauCibles.construireHTML(ctx);
    win.TableauCibles.apresRendu(hote, ctx);
    return { win, TC: win.TableauCibles, IC: win.InscriptionsCibles, doc, hote, ctx, store: base, journal };
}

describe('E · la note brève, la raison et les textes de la cible sont échappés', () => {
    const PIEGE = '<img src=x onerror=alert(1)>';
    it('au tableau : le nom de l\'étudiant·e, l\'étiquette de la cible ; dans la fenêtre : l\'énoncé et les critères', () => {
        const cible = Object.assign(clone(CIBLE), { etiquette: PIEGE, enonce: '<b>gras</b>' });
        cible.criteres[0].texte = '<script>x</script>';
        const e = monterEcran({ cibles: [cible], etudiants: [{ da: ZOE, nom: PIEGE, prenom: 'Zoé' }] });
        // La chaîne produite (jsdom resérialise un attribut sans réécrire « < » : on juge la source, puis le DOM construit).
        const html = e.TC.construireHTML(e.ctx);
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img src=x');
        expect(e.hote.querySelectorAll('img, script')).toHaveLength(0);
        expect(e.hote.querySelector('.tn-eleve').textContent).toBe('Zoé ' + PIEGE);
        e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
        const f = e.doc.querySelector('.tc-fenetre');
        expect(f.querySelectorAll('script, b')).toHaveLength(0);
        expect([...f.querySelectorAll('img')].every(i => i.classList.contains('modal-close-icon')), 'seule l\'icône de fermeture').toBe(true);
        expect(f.querySelector('.tc-cible-etiquette').textContent).toBe(PIEGE);
        expect(f.querySelector('.tc-cible-enonce').textContent).toBe('<b>gras</b>');
        expect(f.querySelector('.tc-critere-texte').textContent).toContain('<script>x</script>');
    });

    it('à l\'historique : la note brève, la raison d\'une annulation et le texte d\'un critère gardé', () => {
        const criteres = [{ id: 'crit-a', texte: PIEGE, essentiel: true, respecte: true }];
        const inscriptions = [
            { id: 'I1', type: 'inscription', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '2', echelleId: 'ECH-banc', date: '2026-11-20',
                horodatage: '2026-11-20T12:00:00.000Z', productionId: null, noteBreve: PIEGE, criteres },
            { id: 'X1', type: 'annulation', inscriptionId: 'I1', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, date: '2026-11-21',
                horodatage: '2026-11-21T12:00:00.000Z', raison: '<a href="javascript:alert(1)">ici</a>' }];
        const e = monterEcran({ store: { [CLE]: inscriptions } });
        const ctx = e.TC.completerContexte(e.ctx);
        const html = e.TC.historiqueHTML(ctx, ZOE, CIBLE.id);
        expect(html).not.toContain('<img src=x');
        expect(html).not.toContain('<a href=');
        expect(html).toContain('&lt;img src=x');
        expect(html).toContain('&lt;a href=');
    });
});

/* ================================================================ F. Le codex : enregistré puis rouvert */
const consoleSandbox = { log() {}, warn() {}, info() {}, debug() {}, error: (...a) => console.error(...a) };
class FauxFileReader {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then((buf) => { this.result = buf; if (this.onload) this.onload(); }, () => { if (this.onerror) this.onerror(); }); }
}
function creerDbCodex(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return { _map: map, ready: true, init: async () => {}, get: async (k, d = null) => (map.has(k) ? map.get(k) : d), set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); }, keys: async () => [...map.keys()], listBlobIds: async () => [], getSync: (k, d = null) => (map.has(k) ? map.get(k) : d),
        setSync: (k, v) => { map.set(k, v); }, syncToLocalStorageCache: async () => {}, flush: async () => {} };
}
function monterCodex(db, muter = null) {
    const win = { addEventListener() {}, removeEventListener() {}, afficherProgression() {}, majProgression() {}, masquerProgression() {}, trimestreActif: 'a2026' };
    const doc = { readyState: 'loading', addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, contains() { return false; } } }),
        body: { addEventListener() {}, appendChild() {} }, documentElement: { addEventListener() {} } };
    const stockage = () => ({ _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    monterFichierSortant(win, { document: doc });
    const brut = lire('js/codex.js');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte');
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', 'db', 'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator', '"use strict";\n' + code)(win, doc, consoleSandbox, stockage(), stockage(), db, undefined, JSZip,
        FauxFileReader, (cb) => setTimeout(cb, 0), { confirmerAction: async () => true, demanderSaisie: async () => null }, undefined, (cb) => setTimeout(cb, 0),
        { userAgent: 'BacASable/lot-2 (Node; test)' });
    return win.Codex;
}

describe('F · un codex enregistré puis rouvert rend la liste à l\'identique', () => {
    const LISTE = [
        { id: 'I1', type: 'inscription', da: ZOE, ensembleId: 'ENS1', cibleId: 'c1', niveau: '2', echelleId: 'E1', date: '2026-11-01', horodatage: '2026-11-01T13:00:00.000Z',
            productionId: 'P1', noteBreve: 'Des « guillemets », un saut\nde ligne', criteres: [{ id: 'k1', texte: 'Repère', essentiel: true, respecte: true },
                { id: 'k2', texte: 'Cite', essentiel: false, respecte: false }, { id: 'k3', texte: 'Reformule', essentiel: true, respecte: null }] },
        { id: 'X1', type: 'annulation', inscriptionId: 'I1', da: ZOE, ensembleId: 'ENS1', cibleId: 'c1', date: '2026-11-02', horodatage: '2026-11-02T13:00:00.000Z', raison: '' },
        { id: 'I2', type: 'inscription', da: YAN, ensembleId: 'ENS1', cibleId: 'c1', niveau: '0', echelleId: 'E1', date: '2026-11-03', horodatage: '2026-11-03T13:00:00.000Z',
            productionId: null, noteBreve: '', criteres: [] }];

    it('la liste revient entière, dans le même ordre, les coches null et false distinctes', async () => {
        const source = monterCodex(creerDbCodex({ trimestres: [{ id: 'a2026', actif: true }], a2026_inscriptionsCibles: LISTE }));
        const zip = await source.generer({ silencieux: true });
        const cible = creerDbCodex({});
        const fichier = zip.blob; fichier.name = 'codex-banc.zip';
        await monterCodex(cible).charger(fichier);
        expect(cible._map.get('a2026_inscriptionsCibles')).toEqual(LISTE);
        expect(cible._map.get('a2026_inscriptionsCibles')[0].criteres.map(k => k.respecte)).toEqual([true, false, null]);
    }, 20000);

    it('la fusion de deux codex en fait l\'union, sans conflit, et la nomme en mots', () => {
        const Codex = monterCodex(creerDbCodex({}));
        const ici = { a2026_inscriptionsCibles: LISTE.slice(0, 2) };
        const labas = { a2026_inscriptionsCibles: LISTE.slice(0, 1).concat([LISTE[2]]) };
        expect(typeof Codex._analyserFusion).toBe('function');
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits).toEqual([]);
        expect(analyse.ajouts.a2026_inscriptionsCibles.map(e => e.id)).toEqual(['I2']);
    });
});

/* ================================================================ G. La case : le dernier, pas le meilleur */
describe('G · (révisé au lot 3) une case montre le NIVEAU RETENU et le compte ; plus le dernier', () => {
    const I = (id, niveau, date, h) => ({ id, type: 'inscription', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau, echelleId: 'ECH-banc', date,
        horodatage: h || date + 'T12:00:00.000Z', productionId: null, noteBreve: '', criteres: [] });
    it('« Avancé » le 1er nov., puis « En apprentissage » le 10 nov. : la case dit 4, pas 1 ; elle compte deux inscriptions', () => {
        const e = monterEcran({ store: { [CLE]: [I('I1', '4', '2026-11-01'), I('I2', '1', '2026-11-10')] } });
        const etat = etatCase(e.win, e.store[CLE]);
        expect(etat.retenu.niveau).toBe('4');
        expect(etat.actives).toBe(2);
        const bouton = e.hote.querySelector(`.tc-case[data-da="${ZOE}"][data-cible="${CIBLE.id}"]`);
        expect(bouton.querySelector('.tc-case-niveau').textContent).toBe('4');
        expect(bouton.querySelector('.tc-case-compte').textContent).toBe('2');
        expect(bouton.getAttribute('aria-label')).toBe('Zoé Fictive, Lire un texte : niveau retenu Avancé, 2 inscriptions');
        expect(e.hote.innerHTML).toContain('Une case montre le niveau retenu');
        expect(e.hote.innerHTML).not.toContain('pas le niveau retenu');
    });
    it('le meilleur l\'emporte sur le plus récent ; une inscription annulée ne compte pas', () => {
        const liste = [I('I1', '2', '2026-11-10', '2026-11-10T09:00:00.000Z'), I('I2', '3', '2026-11-10', '2026-11-10T10:00:00.000Z'),
            I('I3', '1', '2026-11-12', '2026-11-12T10:00:00.000Z'),
            { id: 'X', type: 'annulation', inscriptionId: 'I2', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, date: '2026-11-12', horodatage: '2026-11-12T00:00:00.000Z', raison: '' }];
        const m = monterInscriptions();
        expect(etatCase(m.win, liste)).toMatchObject({ actives: 2, annulees: 1 });
        expect(etatCase(m.win, liste).retenu.id).toBe('I1');
        expect(etatCase(m.win, liste.slice(0, 3)).retenu.id).toBe('I2');
    });
    it('une case sans inscription porte le nom du niveau « sans donnée », jamais un vide ni un zéro', () => {
        const e = monterEcran();
        const bouton = e.hote.querySelector(`.tc-case[data-da="${YAN}"][data-cible="${CIBLE.id}"]`);
        expect(bouton.classList.contains('tc-case--vide')).toBe(true);
        expect(bouton.textContent).toBe('Données insuffisantes');
        expect(bouton.getAttribute('aria-label')).toBe('Yan Inventé, Lire un texte : sans donnée (Données insuffisantes), aucune inscription');
    });
});

/* ================================================================ H. Les registres nominatifs */
describe('H · la clé `inscriptionsCibles` est inscrite à tous les registres nominatifs', () => {
    const liste = (src, debut) => tranche(src, debut, '];');
    it('trimestres, propriété, correction d\'un DA, Réserve, vue simple, codex, DATA-OWNERSHIP', () => {
        expect(liste(lire('js/trimestres.js'), 'const CLES_NAMESPACEES')).toContain("'inscriptionsCibles'");
        expect(lire('js/db.js')).toMatch(/'inscriptionsCibles':\s*\['inscriptions-cibles\.js'\]/);
        expect(liste(lire('js/correction-da.js'), 'const FAMILLES')).toMatch(/nom: 'inscriptionsCibles', categorie: 'inscriptions'/);
        expect(liste(lire('js/reserve.js'), 'var CLES_FILTRER_PAR_DA')).toContain("'inscriptionsCibles'");
        expect(tranche(lire('js/vue-simple-donnees.js'), 'const CLES_DE_RESULTATS', ';')).toContain("'inscriptionsCibles'");
        expect(lire('js/codex.js')).toMatch(/inscriptionsCibles: \{ nom: 'les inscriptions sur les cibles'/);
        expect(lire('docs/DATA-OWNERSHIP.md')).toMatch(/\| `inscriptionsCibles` \| NS/);
    });
    it('la suppression d\'un trimestre l\'emporte par son préfixe (aucune liste à tenir)', () => {
        const corps = tranche(lire('js/trimestres.js'), 'async function supprimerTrimestre', 'MIGRATION DES DONNÉES EXISTANTES');
        expect(corps).toContain("k.startsWith(id + '_')");
    });
    it('un seul module écrit la clé : ni le tableau, ni l\'assistant, ni un moteur ne la nomment pour écrire', () => {
        for (const f of ['js/tableau-cibles.js', 'js/wizard-pratique-v2.js', 'js/tableau-notation.js']) {
            expect(lire(f), f).not.toMatch(/(setSync|modifier|modifierEtAnnoncer|sauvegarderDonneesSelonMode)\([^)]*inscriptionsCibles/);
        }
        expect(lire('js/pratiques/inscriptions-cibles.js')).toMatch(/modifierEtAnnoncer\(cle\(CLE\)/);
    });
});

/* ================================================================ I. L'assistant : retirer une cible, retirer un critère */
function monterAssistant(store, reponseQuestion) {
    const journal = [];
    const erreurs = [];
    const questions = [];
    const win = { addEventListener() {}, removeEventListener() {}, echapperHtml,
        uiDialogues: { confirmerAction: async (o) => { questions.push(o); return reponseQuestion; } } };
    let n = 0;
    const globaux = {
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} },
        db: dbBanc(store, journal), cle: (k) => 'test_' + k,
        notifications: { erreur: (m) => erreurs.push(m), succes() {}, info() {}, warning() {} },
        normaliserIdPratique: (t) => t, genererIdUnique: (p) => p + 'NEUF' + (++n), echapperHtml,
        formaterPourcentage: (v) => String(v).replace('.', ',') + '\u00a0%',
        confirm: () => { throw new Error('confirm() natif appelé'); }
    };
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    return { win, store, journal, erreurs, questions };
}
const CIBLES_ASSISTANT = [clone(CIBLE), clone(CIBLE_SANS_CRITERE)];
async function creerPuisRouvrir(a) {
    a.win.wizardState.reponses = { nom: 'Par standards banc', prenom: 'Zoé', nomAuteur: 'Fictive', calcNoteFinale: 'cibles', coursCibles: 'COURS-ZZZ',
        ciblesStandards: clone(CIBLES_ASSISTANT).map(c => Object.assign(c, { poids: String(c.poids) })), echelleId: ECHELLE.id, niveauSansDonnee: '0' };
    a.win.wizardState.pratiqueId = null;
    a.win.wizardState.modeEdition = false;
    a.win.wizardState.echelleDeDepart = null;
    await a.win.creerPratiqueV2();
    const p = a.store.test_pratiquesConfigurables[0];
    a.win.wizardState.modeEdition = true;
    a.win.wizardState.pratiqueId = p.id;
    a.win.chargerPratiqueExistante(p.id);
    return p;
}
function inscriptionsDuBanc(ensembleId) {
    const base = { type: 'inscription', ensembleId, echelleId: ECHELLE.id, horodatage: '2026-11-20T12:00:00.000Z', productionId: null, noteBreve: '' };
    return [
        Object.assign({ id: 'I1', da: ZOE, cibleId: CIBLE.id, niveau: '2', date: '2026-11-10', criteres: [{ id: 'crit-b', texte: 'Cite le texte', essentiel: false, respecte: false }] }, base),
        Object.assign({ id: 'I2', da: ZOE, cibleId: CIBLE.id, niveau: '3', date: '2026-11-12', criteres: [] }, base),
        Object.assign({ id: 'I3', da: YAN, cibleId: CIBLE.id, niveau: '1', date: '2026-11-12', criteres: [] }, base),
        { id: 'X3', type: 'annulation', inscriptionId: 'I3', da: YAN, ensembleId, cibleId: CIBLE.id, date: '2026-11-13', horodatage: '2026-11-13T12:00:00.000Z', raison: '' }
    ];
}

describe('I · l\'assistant : la question avant de retirer une cible qui porte des niveaux inscrits', () => {
    it('la question nomme la cible, ses inscriptions non annulées et le nombre d\'étudiant·es ; « non » n\'écrit rien', async () => {
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [clone(ECHELLE)] }, false);
        const p = await creerPuisRouvrir(a);
        a.store[CLE] = inscriptionsDuBanc(p.configuration.ensembleCiblesId);
        const avant = clone(a.store);
        const n = a.journal.length;
        a.win.wizardState.reponses.ciblesStandards = a.win.wizardState.reponses.ciblesStandards.filter(c => c.id !== CIBLE.id);
        await a.win.creerPratiqueV2();
        expect(a.questions).toHaveLength(1);
        expect(a.questions[0].message).toContain('« Lire un texte » : 2 niveaux inscrits pour 1 étudiant·e');
        expect(a.questions[0].message).toContain('Ses inscriptions restent enregistrées');
        expect(a.journal.length, 'rien n\'est écrit').toBe(n);
        expect(a.store).toEqual(avant);
    });

    it('« oui » : l\'ensemble est réécrit sans la cible ; ses inscriptions restent toutes', async () => {
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [clone(ECHELLE)] }, true);
        const p = await creerPuisRouvrir(a);
        a.store[CLE] = inscriptionsDuBanc(p.configuration.ensembleCiblesId);
        const inscriptions = clone(a.store[CLE]);
        a.win.wizardState.reponses.ciblesStandards = a.win.wizardState.reponses.ciblesStandards.filter(c => c.id !== CIBLE.id);
        await a.win.creerPratiqueV2();
        expect(a.questions).toHaveLength(1);
        expect(a.store.test_ensemblesCibles[0].cibles.map(c => c.id)).toEqual([CIBLE_SANS_CRITERE.id]);
        expect(a.store[CLE]).toEqual(inscriptions);
    });

    it('retirer une cible sans inscription, ou un critère visé par une coche : aucune question ; l\'inscription garde le texte du critère', async () => {
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [clone(ECHELLE)] }, false);
        const p = await creerPuisRouvrir(a);
        a.store[CLE] = inscriptionsDuBanc(p.configuration.ensembleCiblesId);
        const r = a.win.wizardState.reponses;
        r.ciblesStandards = r.ciblesStandards.filter(c => c.id !== CIBLE_SANS_CRITERE.id);
        r.ciblesStandards[0].criteres = r.ciblesStandards[0].criteres.filter(k => k.id !== 'crit-b');
        await a.win.creerPratiqueV2();
        expect(a.questions).toEqual([]);
        expect(a.store.test_ensemblesCibles[0].cibles[0].criteres.map(k => k.id)).toEqual(['crit-a', 'crit-c']);
        expect(a.store[CLE][0].criteres).toEqual([{ id: 'crit-b', texte: 'Cite le texte', essentiel: false, respecte: false }]);
    });
});

/* ================================================================ J. Les cibles offertes pour une production */
describe('J · « inscrire pour une production » : les cibles que la production renseigne, sinon toutes', () => {
    const m = monterInscriptions();
    const cibles = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    it('sa liste, dans l\'ordre de l\'ensemble ; sans liste, toutes ; une liste périmée, toutes', () => {
        expect(m.IC.ciblesOffertes({ ciblesRenseignees: ['c', 'a'] }, cibles).map(c => c.id)).toEqual(['a', 'c']);
        expect(m.IC.ciblesOffertes({}, cibles).map(c => c.id)).toEqual(['a', 'b', 'c']);
        expect(m.IC.ciblesOffertes({ ciblesRenseignees: [] }, cibles).map(c => c.id)).toEqual(['a', 'b', 'c']);
        expect(m.IC.ciblesOffertes({ ciblesRenseignees: ['partie'] }, cibles).map(c => c.id)).toEqual(['a', 'b', 'c']);
    });
    it('à l\'écran : seules les cibles qui reçoivent un niveau s\'inscrivent ; les autres ne reçoivent rien (N4)', async () => {
        const productions = [{ id: 'P1', titre: 'Dissertation', ciblesRenseignees: [CIBLE.id, CIBLE_SANS_CRITERE.id] }];
        const e = monterEcran({ productions });
        e.TC.ouvrirParProduction(null);
        const f = e.doc.querySelector('.tc-fenetre');
        f.querySelector('.tc-pr-eleve').value = YAN;
        const prod = f.querySelector('.tc-pr-production');
        prod.value = 'P1';
        prod.dispatchEvent(new e.doc.defaultView.Event('change', { bubbles: true }));
        const blocs = f.querySelectorAll('.tc-bloc-cible');
        expect(blocs).toHaveLength(2);
        expect([...blocs].map(b => b.querySelector('input:checked').value), 'chaque cible part sur « Rien ce jour-là »').toEqual(['', '']);
        blocs[1].querySelector('input[value="3"]').checked = true;
        f.querySelector('[data-tc="inscrire-production"]').click();
        await new Promise(r => setTimeout(r, 0));
        expect(e.store[CLE]).toHaveLength(1);
        expect(e.store[CLE][0]).toMatchObject({ da: YAN, cibleId: CIBLE_SANS_CRITERE.id, niveau: '3', productionId: 'P1' });
    });
});

/* ================================================================ K. Une échelle à trois niveaux comme à six */
describe('K · rien n\'est codé en dur dans l\'échelle : trois niveaux comme six, le « sans donnée » compris (E3)', () => {
    for (const [nom, niveaux] of [
        ['trois', [['N', 'Non démontré', 0], ['P', 'Partiel', 60], ['A', 'Atteint', 100]]],
        ['six', [['0', 'Rien encore', 0], ['1', 'Amorcé', 20], ['2', 'En route', 40], ['3', 'Presque', 60], ['4', 'Atteint', 80], ['5', 'Dépassé', 100]]]
    ]) {
        it('à ' + nom + ' niveaux : une tuile par niveau, le premier marqué « sans donnée », et il s\'inscrit comme un autre', async () => {
            const echelle = { id: 'ECH-' + nom, nom: 'Maison', niveaux: niveaux.map(([code, n, v], i) => ({ code, nom: n, valeurCalcul: v, min: i * 10, max: i * 10 + 9 })) };
            const e = monterEcran({ echelle });
            expect(e.hote.querySelectorAll('.tn-repere .tn-niveau')).toHaveLength(niveaux.length);
            e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
            const f = e.doc.querySelector('.tc-fenetre');
            const tuiles = f.querySelectorAll('.tc-niveaux .tc-niveau:not(.tc-niveau--rien)');
            expect(tuiles).toHaveLength(niveaux.length);
            expect(tuiles[0].querySelector('.tc-niveau-marque').textContent).toBe('sans donnée');
            expect([...tuiles].filter(t => t.querySelector('.tc-niveau-marque'))).toHaveLength(1);
            tuiles[0].querySelector('input').checked = true;
            f.querySelector('[data-tc="inscrire"]').click();
            await new Promise(r => setTimeout(r, 0));
            expect(e.store[CLE].map(i => i.niveau)).toEqual([niveaux[0][0]]);
        });
    }
});

/* ================================================================ L. Complément du 21 nov., 9 h 17 : une inscription sans niveau */
describe('L · une inscription peut ne porter aucun niveau (une remarque) ; ce n\'est jamais le niveau « sans donnée »', () => {
    const I_ = (id, niveau, date, extra) => Object.assign({ id, type: 'inscription', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau,
        echelleId: niveau === null ? null : 'ECH-banc', date, horodatage: date + 'T12:00:00.000Z', productionId: null, noteBreve: '', criteres: [] }, extra || {});

    it('une remarque s\'inscrit : `niveau: null`, `echelleId: null`, le texte gardé ; ni « 0 » ni chaîne vide', async () => {
        const m = monterInscriptions();
        const sans = saisie(m.IC, { niveau: null, noteBreve: 'Observé en atelier : relève les procédés, hésite sur les effets.' });
        expect(m.IC.motifsRefus(sans, ECHELLE)).toEqual([]);
        expect((await m.IC.inscrire([sans])).ok).toBe(true);
        const [i] = JSON.parse(JSON.stringify(m.store[CLE]));
        expect(i.niveau).toBeNull();
        expect(i.echelleId).toBeNull();
        expect(i.noteBreve).toBe('Observé en atelier : relève les procédés, hésite sur les effets.');
        expect(m.IC.estSansNiveau(i)).toBe(true);
        expect(m.IC.construireInscription({ niveau: '' }).niveau, 'une chaîne vide n\'est pas un code').toBeNull();
    });

    it('le niveau « sans donnée » (0 %) est un niveau : il s\'écrit « 0 », il n\'est pas une remarque, et la case le montre', async () => {
        const m = monterInscriptions();
        await m.IC.inscrire([saisie(m.IC, { niveau: '0' })]);
        expect(m.store[CLE][0].niveau).toBe('0');
        expect(m.IC.estSansNiveau(m.store[CLE][0])).toBe(false);
        expect(etatCase(m.win, m.store[CLE])).toMatchObject({ actives: 1, remarques: 0 });
        expect(etatCase(m.win, m.store[CLE]).retenu.niveau).toBe('0');
    });

    it('l\'inscription vide (ni niveau, ni texte, ni critère renseigné) est refusée, en mots ; un critère renseigné suffit depuis le 22 nov.', () => {
        const m = monterInscriptions();
        expect(m.IC.motifsRefus(saisie(m.IC, { niveau: null, noteBreve: '   ' }), ECHELLE)).toEqual([m.IC.MOTIFS.VIDE]);
        // Révisé le 22 nov. 2026 (l'écran d'observation) : des coches seules SUFFISENT désormais (sentinelle-observation-par-standards).
        const coches = m.IC.etatDesCriteres(CIBLE, { 'crit-a': true });
        expect(m.IC.motifsRefus(saisie(m.IC, { niveau: null, noteBreve: '', criteres: coches }), ECHELLE)).toEqual([]);
        expect(m.IC.MOTIFS.VIDE).toMatch(/^[A-ZÀ-Ü].{30,}[.]$/);
    });

    it('à l\'écran : « Inscrire » sans niveau ni texte affiche le refus dans la fenêtre (pas dans une bulle) et n\'écrit rien', async () => {
        const e = monterEcran();
        e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
        const f = e.doc.querySelector('.tc-fenetre');
        f.querySelector('[data-tc="inscrire"]').click();
        await new Promise(r => setTimeout(r, 0));
        const alerte = f.querySelector('.tc-alerte');
        expect(alerte.textContent).toBe(e.IC.MOTIFS.VIDE);
        expect(alerte.classList.contains('u-hide')).toBe(false);
        expect(alerte.getAttribute('role')).toBe('alert');
        expect(e.store[CLE] || []).toEqual([]);
    });

    it('à l\'écran : une remarque, avec des critères cochés ; le bouton dit ce qu\'il inscrit', async () => {
        const e = monterEcran();
        e.TC.ouvrirInscription(ZOE, CIBLE.id, null);
        const f = e.doc.querySelector('.tc-fenetre');
        const bouton = f.querySelector('[data-tc="inscrire"]');
        expect(bouton.textContent).toBe('Inscrire la remarque');
        const niveau = f.querySelector('.tc-niveaux input[value="2"]');
        niveau.checked = true;
        niveau.dispatchEvent(new e.doc.defaultView.Event('change', { bubbles: true }));
        expect(bouton.textContent).toBe('Inscrire le niveau');
        const sans = f.querySelector('.tc-niveaux input[data-sans-niveau]');
        sans.checked = true;
        sans.dispatchEvent(new e.doc.defaultView.Event('change', { bubbles: true }));
        expect(bouton.textContent).toBe('Inscrire la remarque');
        f.querySelector('.tc-critere[data-critere="crit-a"] .tc-coche--oui').click();
        f.querySelector('.tc-retroaction').value = 'Bonne piste à l\'oral.';
        bouton.click();
        await new Promise(r => setTimeout(r, 0));
        const [i] = e.store[CLE];
        expect(i.niveau).toBeNull();
        expect(i.criteres.map(k => k.respecte)).toEqual([true, null, null]);
    });

    it('(révisé au lot 3) une remarque plus récente n\'entre pas au niveau retenu ; la case la compte et la dit', () => {
        const liste = [I_('I1', '3', '2026-11-01'), I_('R1', null, '2026-11-10', { noteBreve: 'à revoir' })];
        const e = monterEcran({ store: { [CLE]: liste } });
        expect(etatCase(e.win, liste)).toMatchObject({ actives: 2, remarques: 1 });
        expect(etatCase(e.win, liste).retenu.id).toBe('I1');
        const bouton = e.hote.querySelector(`.tc-case[data-da="${ZOE}"][data-cible="${CIBLE.id}"]`);
        expect(bouton.querySelector('.tc-case-niveau').textContent).toBe('3');
        expect(bouton.querySelector('.tc-case-compte').textContent).toBe('2');
        expect(bouton.getAttribute('aria-label')).toBe('Zoé Fictive, Lire un texte : niveau retenu Acquis, 2 inscriptions, dont 1 remarque');
    });

    it('une case qui n\'a que des remarques le montre par ✎ et leur nombre, sans survol, et la légende le dit ; aucun niveau, aucun « 0 »', () => {
        const liste = [I_('R1', null, '2026-11-02', { noteBreve: 'a' }), I_('R2', null, '2026-11-09', { noteBreve: 'b' })];
        const e = monterEcran({ store: { [CLE]: liste } });
        const bouton = e.hote.querySelector(`.tc-case[data-da="${ZOE}"][data-cible="${CIBLE.id}"]`);
        expect(bouton.classList.contains('tc-case--remarques')).toBe(true);
        // Révisé au lot 3 : ✎, le nom du niveau « sans donnée » (la cible est sans donnée), et le compte.
        expect(bouton.textContent).toBe('✎Données insuffisantes2');
        expect(bouton.querySelector('.tc-case-niveau')).toBeNull();
        expect(bouton.getAttribute('aria-label')).toBe('Zoé Fictive, Lire un texte : sans donnée (Données insuffisantes), 2 remarques');
        expect([...e.hote.querySelectorAll('.tc-legende')].map(x => x.textContent)).toContain(e.TC.MOTS.legendeRemarques);
        expect(etatCase(e.win, liste).retenu).toBeNull();
    });

    it('l\'historique montre la remarque à sa date, parmi les inscriptions ; annulée, elle reste, barrée', async () => {
        const liste = [I_('I1', '3', '2026-11-01'), I_('R1', null, '2026-11-05', { noteBreve: 'Hésite sur les effets.' }), I_('I2', '2', '2026-11-12')];
        const e = monterEcran({ store: { [CLE]: liste } });
        let html = e.TC.historiqueHTML(e.TC.completerContexte(e.ctx), ZOE, CIBLE.id);
        const ordre = [...html.matchAll(/class="tc-entree-date">([^<]+)</g)].map(x => x[1]);
        expect(ordre).toEqual(['12 novembre 2026', '5 novembre 2026', '1er novembre 2026']);
        expect(html).toContain('tc-entree-niveau--remarque');
        expect(html).toContain('Remarque, sans niveau');
        const r = await e.IC.annuler('R1', 'Notée sur la mauvaise cible.');
        expect(r.ok).toBe(true);
        expect(e.store[CLE].find(x => x.id === 'R1')).toEqual(liste[1]);
        html = e.TC.historiqueHTML(e.TC.completerContexte(e.ctx), ZOE, CIBLE.id);
        expect(html).toMatch(/tc-entree tc-entree--annulee">[\s\S]*Remarque, sans niveau[\s\S]*Annulée le [^<]+ : Notée sur la mauvaise cible\./);
    });

    it('« inscrire pour une production » : « Aucun niveau » sans texte est refusé en nommant la cible ; avec un texte, c\'est une remarque', async () => {
        const productions = [{ id: 'P1', titre: 'Dissertation' }];
        const e = monterEcran({ productions });
        e.TC.ouvrirParProduction(null);
        const f = e.doc.querySelector('.tc-fenetre');
        f.querySelector('.tc-pr-eleve').value = YAN;
        const prod = f.querySelector('.tc-pr-production');
        prod.value = 'P1';
        prod.dispatchEvent(new e.doc.defaultView.Event('change', { bubbles: true }));
        const bloc = f.querySelector(`.tc-bloc-cible[data-cible="${CIBLE.id}"]`);
        const sans = bloc.querySelector('input[data-sans-niveau]');
        sans.checked = true;
        sans.dispatchEvent(new e.doc.defaultView.Event('change', { bubbles: true }));
        expect(bloc.querySelector('.tc-bloc-details').classList.contains('u-hide'), 'ses critères et sa rétroaction paraissent').toBe(false);
        f.querySelector('[data-tc="inscrire-production"]').click();
        await new Promise(r => setTimeout(r, 0));
        expect(f.querySelector('.tc-alerte').textContent).toBe('« Lire un texte » : choisis un niveau, renseigne un critère ou écris une rétroaction : une inscription vide ne s\'inscrit pas.');
        expect(e.store[CLE] || []).toEqual([]);
        bloc.querySelector('.tc-retroaction').value = 'A repris la cible à l\'oral.';
        f.querySelector('[data-tc="inscrire-production"]').click();
        await new Promise(r => setTimeout(r, 0));
        expect(e.store[CLE]).toHaveLength(1);
        expect(e.store[CLE][0]).toMatchObject({ da: YAN, cibleId: CIBLE.id, niveau: null, productionId: 'P1', noteBreve: 'A repris la cible à l\'oral.' });
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (21 nov. 2026)
 *
 * Chaque mutation a été posée dans `js/`, ce fichier lancé seul (un worker), le rouge relevé, puis la mutation retirée
 * (script hors dépôt ; le fichier muté est réécrit à l'identique après chaque essai). 32 essais au vert avant et après.
 *
 * BT1  inscriptions-cibles.js, `_ajouterAuStock` : une inscription neuve REMPLACE celle de la même case (un « upsert »).
 *      ROUGE (2) : A « deux gestes, deux entrées… », B « chaque écriture garde… ».
 * BT2  inscriptions-cibles.js, `ajouter` : la liste reçue tronquée à ses trois dernières entrées.
 *      ROUGE (1) : B « chaque écriture garde, à l'identique et en tête… ».
 * BT3  inscriptions-cibles.js, `annuler` : l'inscription visée reçoit `annulee = true` en place (une réécriture).
 *      ROUGE (2) : B « chaque écriture garde… », B « annuler AJOUTE une entrée… ».
 * BT4  inscriptions-cibles.js, `lireRespecte` : « non renseigné » devient « non respecté » (null → false).
 *      ROUGE (3) : C « true, false et null… », C « une inscription sans aucune coche… », C « de bout en bout… ».
 * BT5  inscriptions-cibles.js, `motifsRefus` : un refus « incohérent » quand un essentiel est non respecté au plus haut niveau.
 *      ROUGE (1) : C « aucun niveau refusé ni alerte… ».
 * BT6  correction-da.js, `FAMILLES` : la famille `inscriptionsCibles` ne déplace plus rien.
 *      ROUGE (1) : D « corriger : toutes les entrées de l'élève… ».
 * BT7  tableau-cibles.js, `historiqueHTML` : la note brève rendue sans `esc`.
 *      ROUGE (1) : E « à l'historique : la note brève, la raison… ».
 * BT8  codex.js, `genererCodex` : la clé `…_inscriptionsCibles` laissée hors du ZIP.
 *      ROUGE (1) : F « la liste revient entière… ».
 * BT9  inscriptions-cibles.js, `plusRecenteDAbord` : le plus haut niveau d'abord (le « meilleur » à la place du dernier).
 *      ROUGE (2) : G « Avancé le 1er nov., puis En apprentissage… », G « dernier : la date de la trace d'abord… ».
 * BT10 reserve.js : `'inscriptionsCibles'` retirée de `CLES_FILTRER_PAR_DA`.
 *      ROUGE (1) : H « trimestres, propriété, correction d'un DA, Réserve… ».
 * BT11 wizard-pratique-v2.js : l'appel à `_confirmerRetraitCiblesInscrites` retiré.
 *      ROUGE (2) : I « la question nomme la cible… », I « oui : l'ensemble est réécrit sans la cible… ».
 * BT12 inscriptions-cibles.js, `ciblesOffertes` : toujours toutes les cibles.
 *      ROUGE (1) : J « sa liste, dans l'ordre de l'ensemble… ».
 * BT13 tableau-cibles.js, `_niveauxHTML` : le niveau « sans donnée » retiré des tuiles.
 *      ROUGE (2) : K « à trois niveaux… », K « à six niveaux… ».
 *
 * Complément du 21 nov., 9 h 17 (41 essais au vert avant et après) :
 * BT14 inscriptions-cibles.js, `construireInscription` : une remarque reçoit le code « 0 » (le « sans donnée ») au lieu de null.
 *      ROUGE (3) : L « une remarque s'inscrit… », L « à l'écran : une remarque… », L « inscrire pour une production… ».
 * BT15 inscriptions-cibles.js, `motifsRefus` : le refus de l'inscription vide retiré.
 *      ROUGE (3) : L « l'inscription vide… est refusée », L « à l'écran : Inscrire sans niveau ni texte… », L « inscrire pour une production… ».
 * BT16 inscriptions-cibles.js, `etatDeLaCase` : la dernière inscription, remarque comprise, devient le « dernier niveau ».
 *      ROUGE (2) : L « la case garde le DERNIER NIVEAU… », L « une case qui n'a que des remarques… ».
 *      (Lot 3, 21 nov. 2026 : `etatDeLaCase` est retirée ; la règle « une remarque n'entre pas au niveau retenu » est
 *      gardée par la sentinelle des lots 3 et 4, règle 3, et son break-test.)
 * BT17 tableau-cibles.js, `_caseHTML` : la case qui n'a que des remarques rendue vide (« + »).
 *      ROUGE (1) : L « une case qui n'a que des remarques le montre par ✎… ».
 * BT18 tableau-cibles.js, `historiqueHTML` : la remarque n'est plus dite « Remarque, sans niveau ».
 *      ROUGE (1) : L « l'historique montre la remarque à sa date… ».
 */
