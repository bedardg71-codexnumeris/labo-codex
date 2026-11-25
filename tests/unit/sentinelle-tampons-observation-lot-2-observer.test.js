/**
 * SENTINELLE (24 nov. 2026) — TAMPONS D'OBSERVATION, LOT 2 : OBSERVER.
 *
 * Consigne de lot : « Tampons d'observation », lot 2 (Cowork, 24 nov. 2026, 16 h 30) ; décisions de Grégoire du 24 nov.
 * Rapport : plans de travail/RAPPORT-2026-11-24-tampons-observation-lot-2.md.
 *
 * VERROUILLÉ ICI, sur les modules RÉELS (inscriptions-cibles.js, observation-cibles.js, tableau-cibles.js,
 * travaux-outils.js, codex.js, correction-da.js, reserve.js). L'écran est joué au navigateur :
 * tests/integration/tampons-observation-lot-2-observer.spec.js.
 *   A. Le champ neuf : `tampons`, la COPIE de chaque tampon (six champs, jamais l'image), bornée, sans doublon.
 *   B. L'acceptation : un tampon seul suffit, aux DEUX endroits (`motifsRefus`, `motifsObservation`).
 *   C. Aucune inscription ne coche un critère du fait d'un tampon ; une trace de tampons seuls ne pose pas de niveau.
 *   D. Le rapprochement d'un critère déclaré : à l'affichage seulement, rogné, sans égard à la casse, le premier qui
 *      correspond ; rien n'est écrit dans l'inscription.
 *   E. L'historique : une trace de tampons seuls ne s'appelle pas « remarque » ; sa case montre ✎ ; un texte ET des
 *      tampons montrent les deux ; le nom lu est celui de l'inscription (renommer, supprimer n'y changent rien).
 *   F. Ce que l'écran offre vient des réglages : catégories d'observation seulement, ni masqués ni anciens.
 *   G. Le voyage du champ : codex enregistré puis rouvert, fusion de deux codex, Réserve, correction d'un DA.
 *   H. Rien en dur ; un tampon n'entre ni au niveau retenu ni à la note ; les lecteurs du champ.
 *   I. RETOUCHE (24 nov., 19 h) : « Déjà inscrit aujourd'hui » (même étudiant·e, même cible, même ensemble, même date,
 *      non annulées, toutes origines ; les noms une fois chacun, dans l'ordre inscrit) ; à l'historique, la liste des
 *      critères ne s'affiche pas quand aucun n'est renseigné, sauf le critère qui porte un tampon.
 *
 * RIEN EN DUR : les tampons, catégories et critères de ce banc sont créés ici, fictifs. BREAK-TESTS : journal au rapport.
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
const CLE = 'test_inscriptionsCibles';

const ZOE = '2300001';
const YAN = '2300002';
const CIBLE = { id: 'cib-banc', etiquette: 'Cible fictive', enonce: '', poids: 1, terminale: false,
    criteres: [{ id: 'crit-a', texte: 'Critère fictif A', essentiel: true }, { id: 'crit-b', texte: 'Critère fictif B', essentiel: false }] };
const ECHELLE = { id: 'ECH-banc', nom: 'Échelle du banc', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 33, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 34, max: 66, valeurCalcul: 50 },
    { code: '2', nom: 'Acquis', min: 67, max: 100, valeurCalcul: 100 }] };
const T1 = { id: 'custom-banc-1', nom: 'Tampon fictif 1', categorieId: 'cat-banc', categorieNom: 'Catégorie fictive', critere: 'Critère fictif A', emoji: '' };
const T2 = { id: 'custom-banc-2', nom: 'Tampon fictif 2', categorieId: 'cat-banc', categorieNom: 'Catégorie fictive', critere: '', emoji: '🌟' };
const CHAMPS_TAMPON = ['categorieId', 'categorieNom', 'critere', 'emoji', 'id', 'nom'];

/** Le tableau des cibles et l'écran « Observer », sur un magasin de banc, dans un vrai DOM (jsdom). */
function monter({ store = {}, outils } = {}) {
    const dom = new JSDOM('<!doctype html><body><div id="hote"></div></body>');
    const doc = dom.window.document;
    const journal = [];
    const base = Object.assign({ test_ensemblesCibles: [{ id: 'ENS1', coursId: 'COURS-ZZZ', cibles: [clone(CIBLE)] }], test_echellesTemplates: [clone(ECHELLE)] }, store);
    const db = dbBanc(base, journal);
    const win = { echapperHtml };
    const globaux = { document: doc, Event: dom.window.Event, echapperHtml, db, cle: (k) => 'test_' + k,
        CSS: { escape: (s) => String(s).replace(/["\\]/g, '\\$&') }, MutationObserver: dom.window.MutationObserver,
        obtenirEchelleResolue: (id) => (base.test_echellesTemplates || []).find(e => e.id === id) || null,
        genererBadgePratiqueHTML: () => '<span class="badge-type-pratique">STD</span>',
        obtenirDonneesSelonMode: () => [], obtenirCoursActifId: () => 'GC-banc', ...fonctionsDeLEchelle() };
    let n = 0;
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/pratiques/note-cibles.js', globaux, win);
    chargerScript('js/equipes.js', globaux, win);
    win.genererIdUnique = (p) => p + 'T' + (++n);
    win.TableauNotation = { MOTS: { reglages: 'Réglages de la pratique', aucunEleve: 'Aucun·e étudiant·e.', exporter: 'Exporter' },
        couleurSure: (c) => (c || 'var(--accent-primaire)'), rafraichirSiAffiche() {} };
    win.obtenirPratiqueParId = () => ({ expliquerNoteNonConstructible: () => 'Pas encore de note.' });
    if (outils) win.travauxOutils = outils;
    chargerScript('js/tableau-cibles.js', globaux, win);
    chargerScript('js/observation-cibles.js', globaux, win);
    const ctx = { etat: 'cibles', pratiqueId: 'cib-banc', pratiqueNom: 'Par standards du banc',
        donnees: { id: 'cib-banc', configuration: { type: 'cibles', ensembleCiblesId: 'ENS1', echelleId: ECHELLE.id, niveauSansDonnee: '0' } },
        etudiants: [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé' }, { da: YAN, nom: 'Inventé', prenom: 'Yan' }], productions: [] };
    const rendre = () => { const hote = doc.getElementById('hote'); hote.innerHTML = win.TableauCibles.construireHTML(ctx); win.TableauCibles.apresRendu(hote, ctx); return hote; };
    return { win, IC: win.InscriptionsCibles, TC: win.TableauCibles, OC: win.ObservationCibles, NC: win.NoteCibles, doc, ctx, store: base, journal, rendre };
}
const observation = (m, quoi = {}) => m.OC.saisieObservation(Object.assign({ da: ZOE, ensembleId: 'ENS1', cible: CIBLE, date: '2026-11-24',
    origine: 'observation', noteBreve: '', reponses: {}, tampons: [] }, quoi));
const inscrite = (quoi = {}) => Object.assign({ id: 'I1', type: 'inscription', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: null, echelleId: null,
    date: '2026-11-24', horodatage: '2026-11-24T15:00:00.000Z', productionId: null, origine: 'observation', noteBreve: '',
    criteres: CIBLE.criteres.map(k => Object.assign({ respecte: null }, k)), tampons: [] }, quoi);

describe('A · le champ neuf : `tampons`, la copie de chaque tampon', () => {
    it('six champs par tampon, et eux seuls : jamais l\'image ni un champ inconnu', () => {
        const { IC } = monter();
        const [t] = IC.construireTampons([Object.assign({ imageBase64: 'data:image/png;base64,AAAA', retroaction: 'x', custom: true }, T1)]);
        expect(Object.keys(t).sort()).toEqual(CHAMPS_TAMPON);
        expect(t).toEqual(T1);
    });
    it('bornés et resserrés ; sans identifiant, rien ; le même identifiant une seule fois ; quarante au plus', () => {
        const { IC } = monter();
        const [t] = IC.construireTampons([{ id: 7, nom: '  Un   nom ' + 'n'.repeat(200), categorieId: null, categorieNom: 'c'.repeat(300), critere: '  x  ' + 'k'.repeat(400), emoji: 'e'.repeat(40) }]);
        expect(t.id).toBe('7');
        expect(t.nom.startsWith('Un nom n')).toBe(true);
        expect([t.nom.length, t.categorieNom.length, t.critere.length, t.emoji.length]).toEqual([100, 100, 200, 16]);
        expect(t.categorieId).toBe('');
        expect(IC.construireTampons([{ nom: 'Sans identifiant' }, null, 'texte', T1, clone(T1), T2]).map(x => x.id)).toEqual([T1.id, T2.id]);
        expect(IC.construireTampons(Array.from({ length: 60 }, (_, i) => ({ id: 't' + i }))).length).toBe(40);
        for (const v of [null, undefined, 'tout', { id: 'x' }, 3]) expect(IC.construireTampons(v)).toEqual([]);
    });
    it('la forme rangée d\'une inscription gagne `tampons`, et lui seul ; une inscription d\'avant se lit sans tampon, sans être réécrite', async () => {
        const m = monter();
        await m.IC.inscrire([observation(m, { tampons: [T1, T2] })]);
        const [i] = m.store[CLE];
        expect(Object.keys(i).sort()).toEqual(['cibleId', 'criteres', 'da', 'date', 'echelleId', 'ensembleId', 'horodatage', 'id',
            'niveau', 'noteBreve', 'origine', 'productionId', 'tampons', 'type']);
        expect(i.tampons).toEqual([T1, T2]);
        const avant = { id: 'I0', type: 'inscription', da: ZOE, cibleId: CIBLE.id, niveau: '1', criteres: [] };
        const copie = clone(avant);
        expect(m.IC.lireTampons(avant)).toEqual([]);
        expect(avant).toEqual(copie);
        expect(m.IC.lireTampons({ tampons: 'x' })).toEqual([]);
    });
});

describe('B · l\'acceptation : un tampon seul suffit, aux deux endroits', () => {
    it('`motifsRefus` : un tampon, sans niveau, sans texte, sans critère renseigné, s\'inscrit ; vide des quatre, refusée', () => {
        const m = monter();
        expect(m.IC.motifsRefus(observation(m, { tampons: [T2] }), null)).toEqual([]);
        expect(m.IC.motifsRefus(observation(m), null)).toEqual([m.IC.MOTIFS.VIDE]);
        expect(m.IC.motifsRefus(Object.assign(observation(m), { tampons: [{ nom: 'sans identifiant' }] }), null)).toEqual([m.IC.MOTIFS.VIDE]);
    });
    it('`motifsObservation` : un tampon suffit ; vide, le refus nomme le tampon seulement si l\'écran en offre', () => {
        const m = monter();
        expect(m.OC.motifsObservation(observation(m, { tampons: [T1] }), true)).toEqual([]);
        expect(m.OC.motifsObservation(observation(m), true)).toEqual([m.IC.MOTIFS.OBSERVATION_VIDE_TAMPONS]);
        expect(m.OC.motifsObservation(observation(m), false)).toEqual([m.IC.MOTIFS.OBSERVATION_VIDE]);
        expect(m.OC.motifsObservation(observation(m)), 'sans second argument : le mot d\'avant').toEqual([m.IC.MOTIFS.OBSERVATION_VIDE]);
        expect(m.IC.MOTIFS.OBSERVATION_VIDE, 'le mot d\'avant n\'a pas changé').toBe('Renseigne un critère ou écris ce que tu as vu : une observation vide ne s\'inscrit pas.');
        expect(m.IC.MOTIFS.OBSERVATION_VIDE_TAMPONS).toContain('tampon');
    });
    it('un tampon seul s\'écrit : une inscription sans niveau, sans production, d\'origine « observation » ou « conversation »', async () => {
        const m = monter();
        const r = await m.IC.inscrire([observation(m, { tampons: [T2] }), observation(m, { da: YAN, origine: 'conversation', tampons: [T1] })]);
        expect(r.ok).toBe(true);
        expect(m.store[CLE].map(i => [i.niveau, i.productionId, i.origine, i.tampons.map(t => t.id)])).toEqual([
            [null, null, 'observation', [T2.id]], [null, null, 'conversation', [T1.id]]]);
    });
});

describe('C · aucune inscription ne coche un critère du fait d\'un tampon', () => {
    it('un tampon qui déclare un critère de la cible laisse ce critère « non renseigné »', () => {
        const m = monter();
        const s = observation(m, { tampons: [T1] });
        expect(T1.critere, 'témoin : le tampon déclare le texte exact d\'un critère de la cible').toBe(CIBLE.criteres[0].texte);
        expect(s.criteres.map(k => k.respecte)).toEqual([null, null]);
        expect(m.IC.construireInscription(s).criteres.map(k => k.respecte)).toEqual([null, null]);
        expect(m.IC.aUnCritereRenseigne(m.IC.construireInscription(s).criteres)).toBe(false);
    });
    it('les coches viennent des réponses, et d\'elles seules : avec ou sans tampon, les mêmes', () => {
        const m = monter();
        const reponses = { 'crit-b': false };
        expect(observation(m, { reponses, tampons: [T1, T2] }).criteres).toEqual(observation(m, { reponses }).criteres);
        expect(observation(m, { reponses, tampons: [T1] }).criteres.map(k => k.respecte)).toEqual([null, false]);
    });
    it('une trace de tampons ne pose pas de niveau ; elle n\'est une « remarque » que si elle porte un texte (Grégoire, 24 nov., 18 h 57)', () => {
        const { IC } = monter();
        const coche = [{ id: 'crit-a', texte: 'x', essentiel: false, respecte: true }];
        expect(IC.estSansNiveau(inscrite({ tampons: [T1] }))).toBe(true);
        expect(IC.estUneRemarque(inscrite({ tampons: [T1] }))).toBe(false);
        expect(IC.estUneRemarque(inscrite({ criteres: coche })), 'une coche seule n\'est pas une remarque').toBe(false);
        expect(IC.estUneRemarque(inscrite({ tampons: [T1], criteres: coche }))).toBe(false);
        expect(IC.estUneRemarque(inscrite({ noteBreve: '   ' })), 'des espaces ne sont pas un texte').toBe(false);
        expect(IC.estUneRemarque(inscrite({ tampons: [T1], noteBreve: 'Un texte' }))).toBe(true);
        expect(IC.estUneRemarque(inscrite({ noteBreve: 'Un texte', niveau: '1' })), 'avec un niveau, ce n\'est pas une remarque').toBe(false);
        expect(IC.estDeTamponsSeuls, 'retirée : la règle du texte la remplace').toBeUndefined();
    });

    it('un tampon n\'entre ni au niveau retenu ni à la note : la case reste sans donnée', () => {
        const m = monter();
        const liste = [inscrite({ tampons: [T1, T2] })];
        const retenu = m.NC.retenirDansLHistorique(m.IC.historiqueDeLaCase(liste, ZOE, 'ENS1', CIBLE.id), m.NC.ordreDeLEchelle(ECHELLE));
        expect(retenu.retenu).toBeNull();
        expect(retenu.remarques).toBe(1);
        expect(lire('js/pratiques/note-cibles.js'), 'le moteur de la note ne nomme pas les tampons').not.toMatch(/tampon/i);
    });
});

describe('D · le rapprochement d\'un critère déclaré : à l\'affichage seulement', () => {
    const criteres = [{ id: 'k1', texte: 'Critère fictif A' }, { id: 'k2', texte: 'Critère fictif B' }, { id: 'k3', texte: 'critère FICTIF a' }];
    it('rogné, sans égard à la casse, le premier qui correspond ; sinon sous la cible', () => {
        const { IC } = monter();
        const tampons = [Object.assign({}, T1, { critere: '  CRITÈRE   fictif a ' }), T2, Object.assign({}, T1, { id: 't3', critere: 'Critère fictif B' }),
            Object.assign({}, T1, { id: 't4', critere: 'Un critère que la cible n\'a pas' })];
        const r = IC.rapprocherTampons(tampons, criteres);
        expect(Object.keys(r.parCritere).sort()).toEqual(['k1', 'k2']);
        expect(r.parCritere.k1.map(t => t.id)).toEqual([T1.id]);
        expect(r.parCritere.k2.map(t => t.id)).toEqual(['t3']);
        expect(r.sousLaCible.map(t => t.id)).toEqual([T2.id, 't4']);
    });
    it('sans critère dans l\'inscription, tout se range sous la cible', () => {
        const { IC } = monter();
        expect(IC.rapprocherTampons([T1, T2], []).sousLaCible.map(t => t.id)).toEqual([T1.id, T2.id]);
        expect(IC.rapprocherTampons([], criteres)).toEqual({ parCritere: {}, sousLaCible: [] });
    });
    it('rien n\'est écrit : l\'inscription et ses tampons sont intacts après le rapprochement et le dessin', () => {
        const m = monter();
        const i = inscrite({ tampons: [T1, T2] });
        const avant = clone(i);
        m.IC.rapprocherTampons(m.IC.lireTampons(i), i.criteres);
        m.ctx.inscriptions = [i];
        m.store[CLE] = [i];
        m.rendre();
        m.TC.historiqueHTML(m.TC.completerContexte(m.ctx), ZOE, CIBLE.id, {});
        expect(i).toEqual(avant);
        expect(m.journal.filter(e => e.k === CLE)).toEqual([]);
    });
});

describe('E · l\'historique et la case', () => {
    const historique = (m, liste, options) => {
        m.store[CLE] = liste;
        const hote = m.rendre();
        const boite = m.doc.createElement('div');
        boite.innerHTML = m.TC.historiqueHTML(m.TC.completerContexte(m.ctx), ZOE, CIBLE.id, options || {});
        return { hote, boite };
    };
    it('une trace de tampons seuls : la date, l\'origine et les tampons ; ni « Remarque » ni « sans niveau »', () => {
        const m = monter();
        const { boite } = historique(m, [inscrite({ tampons: [T2] })]);
        const entree = boite.querySelector('.tc-entree');
        expect(entree.querySelector('.tc-entree-date').textContent).toBe(m.TC.dateLisible('2026-11-24'));
        expect(entree.querySelector('.tc-entree-origine').textContent.trim()).toBe(m.TC.origineLue({ origine: 'observation' }));
        expect([...entree.querySelectorAll('.tc-tampon-nom')].map(e => e.textContent)).toEqual([T2.nom]);
        expect(entree.querySelector('.tc-entree-niveau')).toBeNull();
        expect(entree.textContent).not.toMatch(/remarque|sans niveau/i);
    });
    it('au profil (lecture seule) : la même lecture, sans bouton d\'annulation', () => {
        const m = monter();
        const { boite } = historique(m, [inscrite({ tampons: [T2], origine: 'conversation' })], { lectureSeule: true });
        expect(boite.textContent).not.toMatch(/remarque|sans niveau/i);
        expect(boite.querySelector('.tc-entree-origine').textContent.trim()).toBe(m.TC.origineLue({ origine: 'conversation' }));
        expect(boite.querySelector('.tc-tampon-nom').textContent).toBe(T2.nom);
        expect(boite.querySelector('[data-tc="annuler"]')).toBeNull();
    });
    it('sa case montre ✎, comme une remarque, sans niveau', () => {
        const m = monter();
        const { hote } = historique(m, [inscrite({ tampons: [T2] })]);
        const laCase = hote.querySelector(`.tc-case[data-da="${ZOE}"][data-cible="${CIBLE.id}"]`);
        expect(laCase.classList.contains('tc-case--remarques')).toBe(true);
        expect(laCase.querySelector('.tc-case-remarque').textContent).toBe('✎');
        expect(laCase.querySelector('.tc-case-niveau')).toBeNull();
        expect(hote.querySelector(`.tc-case[data-da="${YAN}"] .tc-case-remarque`), 'témoin : une case sans trace n\'a pas le signe').toBeNull();
    });
    it('un texte ET des tampons : les deux se lisent, et c\'est une remarque', () => {
        const m = monter();
        const { boite } = historique(m, [inscrite({ tampons: [T2], noteBreve: 'Un texte fictif' })]);
        expect(boite.querySelector('.tc-entree-note').textContent).toBe('Un texte fictif');
        expect(boite.querySelector('.tc-tampon-nom').textContent).toBe(T2.nom);
        expect(boite.querySelector('.tc-entree-niveau--remarque')).not.toBeNull();
    });
    it('un tampon qui déclare un critère se lit À CÔTÉ de ce critère, qui reste « non renseigné » ; les autres, sous la cible', () => {
        const m = monter();
        const { boite } = historique(m, [inscrite({ tampons: [T1, T2] })]);
        const lignes = [...boite.querySelectorAll('.tc-entree-critere')];
        expect(lignes[0].querySelector('.tc-tampons--critere .tc-tampon-nom').textContent).toBe(T1.nom);
        expect(lignes[0].classList.contains('tc-entree-critere--vide'), 'le tampon ne coche pas le critère').toBe(true);
        expect(lignes.map(l => l.textContent).join(' '), 'aucun critère renseigné : seul le critère qui porte un tampon se lit (retouche du 24 nov.)').not.toContain('Critère fictif B');
        expect(lignes).toHaveLength(1);
        expect([...boite.querySelectorAll('.tc-tampons--cible .tc-tampon-nom')].map(e => e.textContent)).toEqual([T2.nom]);
    });
    it('le nom lu est celui de l\'inscription : avec l\'image si le poste a le tampon, l\'emoji copié sinon, le nom seul à défaut', () => {
        const poste = { [T1.id]: { src: 'data:image/png;base64,AAAA', emoji: false } };
        const m = monter({ outils: { imageDuTampon: (id) => poste[id] || null } });
        const sansEmoji = Object.assign({}, T2, { id: 'custom-banc-3', nom: 'Tampon fictif 3', emoji: '' });
        const { boite } = historique(m, [inscrite({ tampons: [Object.assign({}, T1, { critere: '' }), T2, sansEmoji] })]);
        const puces = [...boite.querySelectorAll('.tc-tampon')];
        expect(puces.map(p => p.querySelector('.tc-tampon-nom').textContent)).toEqual([T1.nom, T2.nom, 'Tampon fictif 3']);
        expect(puces[0].querySelector('img.tc-tampon-image').getAttribute('src')).toBe('data:image/png;base64,AAAA');
        expect(puces[1].querySelector('img')).toBeNull();
        expect(puces[1].querySelector('.tc-tampon-emoji').textContent).toBe('🌟');
        expect(puces[2].querySelector('img, .tc-tampon-emoji')).toBeNull();
    });
    it('les noms sont du texte : aucune balise n\'entre, aucun gestionnaire inline', () => {
        const m = monter({ outils: { imageDuTampon: () => ({ src: '"><img src=x onerror=1>', emoji: false }) } });
        const piege = Object.assign({}, T2, { nom: '<b onclick="x()">Gras</b>', emoji: '<i>e</i>', id: 'custom-"><script>' });
        const { boite } = historique(m, [inscrite({ tampons: [piege] })]);
        expect(boite.querySelector('.tc-tampon b, .tc-tampon i, .tc-tampon script')).toBeNull();
        expect(boite.querySelectorAll('.tc-tampon img')).toHaveLength(1);
        expect(boite.querySelector('.tc-tampon-nom').textContent).toBe('<b onclick="x()">Gras</b>');
        expect([...boite.querySelectorAll('.tc-tampons, .tc-tampons *')].flatMap(e => [...e.attributes].map(a => a.name)).filter(n => /^on/i.test(n))).toEqual([]);
    });
});

/* ---------------------------------------------------------------- Les réglages réels (travaux-outils.js) */
const CAT = 'cat-banc';
const AUTRE_CAT = 'cat-banc-2';
function monterOutils(stockInitial = {}) {
    const stock = Object.assign({
        categoriesPerso: [{ id: CAT, nom: 'Catégorie fictive' }, { id: AUTRE_CAT, nom: 'Autre catégorie fictive' }],
        nomsCategoriesTampons: { [CAT]: 'Catégorie fictive', [AUTRE_CAT]: 'Autre catégorie fictive' },
        tamponsPersonnalises: [{ id: T1.id, nom: T1.nom, categorie: CAT }, { id: T2.id, nom: T2.nom, categorie: CAT }, { id: 'custom-banc-9', nom: 'Tampon d\'ailleurs', categorie: AUTRE_CAT }],
        personnalisationObservations: { [T1.id]: { nom: T1.nom, critere: T1.critere, imageBase64: 'data:image/png;base64,AAAA' }, [T2.id]: { nom: T2.nom, emoji: '🌟', imageBase64: 'data:image/png;base64,BBBB' } }
    }, clone(stockInitial));
    const win = { addEventListener() {}, removeEventListener() {} };
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    const db = { ready: false, getSync: (k, d) => (k in stock ? stock[k] : d), setSync: (k, v) => { stock[k] = v; } };
    chargerScript('js/travaux-outils.js', { db, Image: ImageStub }, win);
    win.travauxOutils.rechargerTamponsPersonnalises();
    return { o: win.travauxOutils, stock };
}

describe('F · ce que l\'écran offre vient des réglages', () => {
    it('sans catégorie d\'observation, rien ; cochée, ses tampons et eux seuls, chacun dans la forme copiée', () => {
        expect(monterOutils().o.tamponsDObservation()).toEqual([]);
        const { o } = monterOutils({ categoriesObservation: [CAT] });
        expect(o.tamponsDObservation()).toEqual([T1, T2]);
        expect(o.tamponsDObservation().every(t => Object.keys(t).sort().join() === CHAMPS_TAMPON.join())).toBe(true);
    });
    it('un tampon masqué, une catégorie masquée n\'y sont pas ; l\'ordre est celui des réglages', () => {
        expect(monterOutils({ categoriesObservation: [CAT], elementsMasques: [T1.id] }).o.tamponsDObservation().map(t => t.id)).toEqual([T2.id]);
        expect(monterOutils({ categoriesObservation: [CAT], categoriesMasquees: [CAT] }).o.tamponsDObservation()).toEqual([]);
        const deux = monterOutils({ categoriesObservation: [CAT, AUTRE_CAT], ordreCategories: [AUTRE_CAT, CAT] }).o.tamponsDObservation();
        expect(deux.map(t => t.categorieId)).toEqual([AUTRE_CAT, CAT, CAT]);
    });
    it('l\'image se cherche par l\'identifiant : là si le tampon existe, null s\'il n\'existe plus', () => {
        const { o } = monterOutils({ categoriesObservation: [CAT] });
        expect(o.imageDuTampon(T1.id)).toEqual({ src: 'data:image/png;base64,AAAA', emoji: false });
        expect(o.imageDuTampon(T2.id).emoji, 'un emoji garde ses couleurs').toBe(true);
        expect(o.imageDuTampon('custom-supprime')).toBeNull();
    });
    it('renommer puis supprimer un tampon ne change pas ce que montre une trace déjà inscrite', async () => {
        const reglages = monterOutils({ categoriesObservation: [CAT] });
        const m = monter({ outils: reglages.o });
        expect(m.OC.tamponsOfferts()).toEqual([T1, T2]);
        await m.IC.inscrire([observation(m, { tampons: m.OC.tamponsRetenus(m.OC.tamponsOfferts(), new Set([T2.id])) })]);
        const lue = () => { const b = m.doc.createElement('div'); m.rendre(); b.innerHTML = m.TC.historiqueHTML(m.TC.completerContexte(m.ctx), ZOE, CIBLE.id, {}); return b; };
        const avant = clone(m.store[CLE]);
        expect(lue().querySelector('.tc-tampon-nom').textContent).toBe(T2.nom);
        // Renommé dans les réglages.
        reglages.stock.personnalisationObservations[T2.id].nom = 'Un autre nom';
        reglages.stock.tamponsPersonnalises[1].nom = 'Un autre nom';
        reglages.o.rechargerTamponsPersonnalises();
        expect(reglages.o.tamponsDObservation().find(t => t.id === T2.id).nom, 'témoin : le réglage a bien changé').toBe('Un autre nom');
        expect(lue().querySelector('.tc-tampon-nom').textContent).toBe(T2.nom);
        // Supprimé : le poste est rechargé sur des réglages qui n'ont plus ce tampon.
        const sans = clone(reglages.stock);
        sans.tamponsPersonnalises = sans.tamponsPersonnalises.filter(t => t.id !== T2.id);
        delete sans.personnalisationObservations[T2.id];
        m.win.travauxOutils = monterOutils(sans).o;
        expect(m.win.travauxOutils.imageDuTampon(T2.id), 'témoin : le tampon n\'existe plus').toBeNull();
        expect(m.win.travauxOutils.tamponsDObservation().map(t => t.id), 'témoin : il n\'est plus offert').toEqual([T1.id]);
        const apres = lue();
        expect(apres.querySelector('.tc-tampon-nom').textContent).toBe(T2.nom);
        expect(apres.querySelector('.tc-tampon img')).toBeNull();
        expect(apres.querySelector('.tc-tampon-emoji').textContent, 'l\'emoji copié reste').toBe('🌟');
        expect(m.store[CLE]).toEqual(avant);
    });
});

/* ---------------------------------------------------------------- Le voyage */
class FauxFileReader {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; if (this.onload) this.onload({ target: this }); }, (e) => { if (this.onerror) this.onerror(e); }); }
    readAsText(blob) { blob.text().then((t) => { this.result = t; if (this.onload) this.onload({ target: this }); }, (e) => { if (this.onerror) this.onerror(e); }); }
}
const consoleSandbox = { log() {}, info() {}, debug() {}, warn() {}, error() {} };
function creerDbCodex(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return { _map: map, ready: true, init: async () => {}, get: async (k, d = null) => (map.has(k) ? map.get(k) : d), set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); }, keys: async () => [...map.keys()], listBlobIds: async () => [], getSync: (k, d = null) => (map.has(k) ? map.get(k) : d),
        setSync: (k, v) => { map.set(k, v); }, syncToLocalStorageCache: async () => {}, flush: async () => {} };
}
function monterCodex(db) {
    const win = { addEventListener() {}, removeEventListener() {}, afficherProgression() {}, majProgression() {}, masquerProgression() {}, trimestreActif: 'a2031' };
    const doc = { readyState: 'loading', addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, contains() { return false; } } }),
        body: { addEventListener() {}, appendChild() {} }, documentElement: { addEventListener() {} } };
    const stockage = () => ({ _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    monterFichierSortant(win, { document: doc });
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', 'db', 'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator', '"use strict";\n' + lire('js/codex.js'))(win, doc, consoleSandbox, stockage(), stockage(), db, undefined, JSZip,
        FauxFileReader, (cb) => setTimeout(cb, 0), { confirmerAction: async () => true, demanderSaisie: async () => null }, undefined, (cb) => setTimeout(cb, 0),
        { userAgent: 'BacASable/tampons-observation-2 (Node; test)' });
    return win.Codex;
}

describe('G · le champ neuf voyage', () => {
    const LISTE = [inscrite({ id: 'I1', tampons: [T1, T2] }), inscrite({ id: 'I2', da: YAN, tampons: [T2], origine: 'conversation' }),
        { id: 'I0', type: 'inscription', da: YAN, ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '1', echelleId: ECHELLE.id, date: '2026-11-20',
            horodatage: '2026-11-20T15:00:00.000Z', productionId: null, noteBreve: '', criteres: [] }];

    it('un codex enregistré puis rouvert rend les tampons à l\'identique ; une inscription d\'avant reste sans le champ', async () => {
        const zip = await monterCodex(creerDbCodex({ trimestres: [{ id: 'a2031', actif: true }], a2031_inscriptionsCibles: LISTE })).generer({ silencieux: true });
        const cible = creerDbCodex({});
        const fichier = zip.blob; fichier.name = 'codex-banc.zip';
        await monterCodex(cible).charger(fichier);
        const revenue = cible._map.get('a2031_inscriptionsCibles');
        expect(revenue).toEqual(LISTE);
        expect(revenue[0].tampons).toEqual([T1, T2]);
        expect('tampons' in revenue[2]).toBe(false);
    }, 20000);
    it('la fusion de deux codex en fait l\'union, sans conflit : l\'inscription venue d\'ailleurs arrive avec ses tampons', () => {
        const analyse = monterCodex(creerDbCodex({}))._analyserFusion({ a2031_inscriptionsCibles: [LISTE[0], LISTE[2]] }, { a2031_inscriptionsCibles: [LISTE[0], LISTE[1]] });
        expect(analyse.conflits).toEqual([]);
        expect(analyse.ajouts.a2031_inscriptionsCibles).toEqual([LISTE[1]]);
        expect(analyse.ajouts.a2031_inscriptionsCibles[0].tampons).toEqual([T2]);
    });
    it('la Réserve garde la part du groupe, chaque inscription entière, tampons compris', () => {
        const source = lire('js/reserve.js');
        const debut = source.indexOf('function _garderLesDA(objet, das) {');
        const fin = source.indexOf('\n/* ===', source.indexOf('function _filtrerParDA('));
        expect(debut).toBeGreaterThan(0);
        expect(fin).toBeGreaterThan(debut);
        const filtrer = new Function(source.slice(debut, fin) + '\nreturn _filtrerParDA;')();
        expect(source, 'la clé est au registre des clés filtrées par DA').toMatch(/var CLES_FILTRER_PAR_DA = \[[^\]]*'inscriptionsCibles'/);
        const part = filtrer('inscriptionsCibles', clone(LISTE), new Set([ZOE]));
        expect(part).toEqual([LISTE[0]]);
        expect(part[0].tampons).toEqual([T1, T2]);
    });
    it('la correction d\'un DA déplace l\'inscription sans toucher à ses tampons', async () => {
        const TRIM = 'a2031';
        const NOUVEAU = '7654321';
        const magasin = new Map();
        const semis = { [`${TRIM}_groupeEtudiants`]: [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: '00001' }, { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: '00001' }],
            [`${TRIM}_inscriptionsCibles`]: LISTE };
        Object.entries(semis).forEach(([k, v]) => magasin.set(k, JSON.stringify(v)));
        const db = { getSync: (k, d = null) => (magasin.has(k) ? JSON.parse(magasin.get(k)) : d), keysSync: () => [...magasin.keys()],
            async modifier(k, mutateur, d = null) { const v = await mutateur(magasin.has(k) ? JSON.parse(magasin.get(k)) : d); if (v === undefined) return undefined; magasin.set(k, JSON.stringify(v)); return v; } };
        const NOMS = ['groupeEtudiants', 'inscriptionsCibles', 'evaluationsSauvegardees', 'presences'];
        const w = chargerScript('js/correction-da.js', { db, cle: (nom) => (NOMS.includes(nom) ? `${TRIM}_${nom}` : nom), modifierEtAnnoncer: (k, mu, d) => db.modifier(k, mu, d) });
        w.obtenirTrimestreId = () => TRIM;
        w.temoinEnregistrement = { enregistre() {} };
        const r = await w.CorrectionDA.corriger(ZOE, NOUVEAU, { geste: 'banc' });
        expect(r.ok).toBe(true);
        const apres = JSON.parse(magasin.get(`${TRIM}_inscriptionsCibles`));
        expect(apres.find(e => e.id === 'I1')).toEqual(Object.assign({}, LISTE[0], { da: NOUVEAU }));
        expect(apres.find(e => e.id === 'I1').tampons).toEqual([T1, T2]);
        expect(apres.find(e => e.id === 'I2')).toEqual(LISTE[1]);
    });
});

describe('H · rien en dur, et les lecteurs du champ', () => {
    const fichiersJs = readdirSync(path.join(RACINE, 'js'), { recursive: true }).filter((f) => String(f).endsWith('.js')).map((f) => 'js/' + String(f).split(path.sep).join('/'));

    it('le code neuf ne nomme aucun tampon ni aucune catégorie fournis', () => {
        const { o } = monterOutils();
        const fournies = o.obtenirOrdreCategories().filter((c) => c !== CAT && c !== AUTRE_CAT);
        const fournis = o.obtenirAutocollants().filter((a) => !a.custom).map((a) => a.id);
        expect(fournies.length, 'témoin').toBeGreaterThan(0);
        expect(fournis.length, 'témoin').toBeGreaterThan(0);
        const neuf = lire('js/observation-cibles.js') + lire('js/pratiques/inscriptions-cibles.js') + lire('js/tableau-cibles.js') + lire('js/profil-cibles.js');
        for (const nom of fournies.concat(fournis)) expect(neuf, nom).not.toMatch(new RegExp('[\'"`]' + nom + '[\'"`]'));
    });
    it('seuls le module propriétaire, l\'écran « Observer » et le tableau des cibles lisent les tampons d\'une inscription', () => {
        const lecteurs = fichiersJs.filter((f) => /lireTampons|construireTampons|rapprocherTampons|dejaInscritALaDate|tamponsLusHTML/.test(lire(f))).sort();
        expect(lecteurs).toEqual(['js/observation-cibles.js', 'js/pratiques/inscriptions-cibles.js', 'js/tableau-cibles.js']);
        const offrent = fichiersJs.filter((f) => /tamponsDObservation|imageDuTampon/.test(lire(f))).sort();
        expect(offrent).toEqual(['js/observation-cibles.js', 'js/tableau-cibles.js', 'js/travaux-outils.js']);
    });
    it('l\'écran « Observer » ne donne pas aux tampons la classe des critères, et n\'écrit qu\'une inscription par geste', () => {
        const source = lire('js/observation-cibles.js');
        expect(source).not.toMatch(/class="[^"]*tc-critere[^"]*oc-tampon|class="[^"]*oc-tampon[^"]*tc-critere/);
        expect(source.match(/I\(\)\.inscrire\(/g)).toHaveLength(1);
        expect(source, 'le nom de travail n\'emploie pas « marque »').not.toMatch(/marque d[’']observation/i);
    });
    it('les mots proposés de l\'écran : la porte, l\'étiquette, les annonces', () => {
        const { OC } = monter();
        expect(OC.MOTS.reglerTampons).toBe('Régler mes tampons');
        expect(OC.MOTS.tampons).toBe('Tampons d’observation');
        expect(OC.MOTS.tamponRetenu('Tampon fictif', 'Zoé Fictive')).toBe('« Tampon fictif » retenu pour Zoé Fictive.');
        expect(OC.MOTS.tamponRelache('Tampon fictif')).toBe('« Tampon fictif » relâché.');
        expect(OC.MOTS.tamponsRetenus(['A', 'B'])).toBe('\u00a0: A, B');
        expect(OC.MOTS.tamponsRetenus([])).toBe('');
    });
});

describe('I · retouche du 24 nov. : « Déjà inscrit aujourd\'hui », et l\'historique sans la liste de tirets', () => {
    const T3 = { id: 'custom-banc-3', nom: 'Tampon fictif 3', categorieId: 'cat-banc', categorieNom: 'Catégorie fictive', critere: '', emoji: '' };
    const JOUR = '2026-11-24';
    const deja = (IC, liste, quoi = {}) => IC.dejaInscritALaDate(liste, quoi.da || ZOE, quoi.ensembleId || 'ENS1', quoi.cibleId || CIBLE.id, quoi.date || JOUR);
    it('les noms des tampons des traces du jour, une fois chacun, dans l\'ordre où ils ont été inscrits', () => {
        const { IC } = monter();
        const premiere = inscrite({ id: 'I1', horodatage: '2026-11-24T15:00:00.000Z', tampons: [T1, T2] });
        const seconde = inscrite({ id: 'I2', horodatage: '2026-11-24T15:05:00.000Z', tampons: [T2, T3] });
        expect(deja(IC, [premiere, seconde])).toEqual({ inscriptions: 2, tampons: [T1.nom, T2.nom, T3.nom] });
        expect(deja(IC, [seconde, premiere]), 'l\'ordre est celui de l\'écriture, pas celui de la liste').toEqual({ inscriptions: 2, tampons: [T1.nom, T2.nom, T3.nom] });
    });
    it('une inscription annulée n\'y paraît pas ; ni une autre cible, un autre jour, un·e autre étudiant·e, un autre ensemble', () => {
        const { IC } = monter();
        const liste = [
            inscrite({ id: 'I1', tampons: [T1] }),
            inscrite({ id: 'I2', tampons: [T2] }),
            { id: 'A1', type: 'annulation', inscriptionId: 'I2', da: ZOE, ensembleId: 'ENS1', cibleId: CIBLE.id, date: JOUR, horodatage: '2026-11-24T16:00:00.000Z', raison: '' },
            inscrite({ id: 'I3', cibleId: 'une-autre-cible', tampons: [T3] }),
            inscrite({ id: 'I4', date: '2026-11-23', tampons: [T3] }),
            inscrite({ id: 'I5', da: YAN, tampons: [T3] }),
            inscrite({ id: 'I6', ensembleId: 'ENS2', tampons: [T3] })
        ];
        expect(deja(IC, liste)).toEqual({ inscriptions: 1, tampons: [T1.nom] });
        expect(deja(IC, liste, { da: YAN }), 'témoin : l\'autre étudiant·e a bien la sienne').toEqual({ inscriptions: 1, tampons: [T3.nom] });
        expect(deja(IC, liste, { date: '2026-11-22' })).toEqual({ inscriptions: 0, tampons: [] });
    });
    it('toutes les origines comptent ; des traces sans tampon se comptent sans nom ; rien n\'est écrit', () => {
        const { IC } = monter();
        const liste = [inscrite({ id: 'I1', origine: 'production', productionId: 'P1', niveau: '2', echelleId: ECHELLE.id }),
            inscrite({ id: 'I2', origine: 'conversation', noteBreve: 'Un texte fictif' })];
        const avant = clone(liste);
        expect(deja(IC, liste)).toEqual({ inscriptions: 2, tampons: [] });
        expect(liste).toEqual(avant);
        expect(deja(IC, null)).toEqual({ inscriptions: 0, tampons: [] });
    });
    it('les mots de la ligne : avec des tampons, ceux de Grégoire (18 h 55) ; sans tampon, le mot court proposé', () => {
        const { OC } = monter();
        expect(OC.MOTS.dejaInscrit(['Incertain', 'Inexact'])).toBe('Déjà inscrit aujourd’hui\u00a0: Incertain, Inexact');
        expect(OC.MOTS.dejaInscrit([])).toBe('Déjà inscrit aujourd’hui.');
    });
    const historique = (m, liste) => {
        m.store[CLE] = liste;
        m.rendre();
        const boite = m.doc.createElement('div');
        boite.innerHTML = m.TC.historiqueHTML(m.TC.completerContexte(m.ctx), ZOE, CIBLE.id, {});
        return boite;
    };
    it('à l\'historique, aucun critère renseigné : la liste des critères ne s\'affiche pas (tampons seuls, texte seul)', () => {
        const m = monter();
        expect(historique(m, [inscrite({ tampons: [T2] })]).querySelector('.tc-entree-criteres')).toBeNull();
        expect(historique(m, [inscrite({ noteBreve: 'Un texte fictif' })]).querySelector('.tc-entree-criteres')).toBeNull();
    });
    it('dès qu\'un seul critère est renseigné, la liste s\'affiche entière, comme avant', () => {
        const m = monter();
        const criteres = CIBLE.criteres.map((k, n) => Object.assign({ respecte: n === 1 ? false : null }, k));
        const boite = historique(m, [inscrite({ criteres, tampons: [T2] })]);
        expect([...boite.querySelectorAll('.tc-entree-critere')].map(l => l.className.replace('tc-entree-critere tc-entree-critere--', ''))).toEqual(['vide', 'non']);
    });
    it('Q4 : sans niveau et sans texte (une coche, des tampons, les deux), aucune étiquette ; avec un texte, « Remarque, sans niveau »', () => {
        const m = monter();
        const coche = CIBLE.criteres.map((k, n) => Object.assign({ respecte: n === 0 ? true : null }, k));
        const etiquette = (quoi) => historique(m, [inscrite(quoi)]).querySelector('.tc-entree-niveau');
        expect(etiquette({ criteres: coche }), 'une coche seule').toBeNull();
        expect(etiquette({ tampons: [T2] }), 'des tampons seuls').toBeNull();
        expect(etiquette({ criteres: coche, tampons: [T2] }), 'une coche et des tampons').toBeNull();
        expect(historique(m, [inscrite({ criteres: coche })]).textContent).not.toMatch(/remarque|sans niveau/i);
        expect(etiquette({ noteBreve: 'Un texte fictif' }).textContent).toBe('Remarque, sans niveau');
        expect(etiquette({ noteBreve: 'Un texte fictif', criteres: coche, tampons: [T2] }).textContent).toBe('Remarque, sans niveau');
        expect(etiquette({ niveau: '2', echelleId: ECHELLE.id }).textContent, 'témoin : un niveau garde son étiquette').toContain('Acquis');
    });
    it('Q5 : les trois textes du tableau, mots de Grégoire (24 nov., 18 h 58)', () => {
        const m = monter();
        expect(m.TC.MOTS.legendeRemarques).toBe('✎ : des traces à lire, aucun niveau encore.');
        m.store[CLE] = [inscrite({ tampons: [T2] })];
        let laCase = m.rendre().querySelector(`.tc-case[data-da="${ZOE}"]`);
        expect(laCase.getAttribute('aria-label')).toMatch(/, 1 trace sans niveau$/);
        expect(laCase.getAttribute('title')).toBe(laCase.getAttribute('aria-label'));
        m.store[CLE] = [inscrite({ id: 'I1', tampons: [T2] }), inscrite({ id: 'I2', noteBreve: 'Un texte fictif' })];
        laCase = m.rendre().querySelector(`.tc-case[data-da="${ZOE}"]`);
        expect(laCase.getAttribute('aria-label')).toMatch(/, 2 traces sans niveau$/);
        expect(m.doc.getElementById('hote').textContent).toContain('✎ : des traces à lire, aucun niveau encore.');
        const q = (remarques, eleves, niveaux = 0) => m.IC.questionRetraitCibles([{ cible: { id: 'a', etiquette: 'Cible fictive' }, niveaux, remarques, eleves }]).message;
        expect(q(2, 1)).toContain('« Cible fictive » : 2 traces sans niveau pour 1 étudiant·e');
        expect(q(1, 1)).toContain('« Cible fictive » : 1 trace sans niveau pour 1 étudiant·e');
        expect(q(3, 2, 1)).toContain('« Cible fictive » : 1 niveau inscrit et 3 traces sans niveau pour 2 étudiant·es');
        expect(q(2, 1)).not.toMatch(/remarque/i);
    });
});
