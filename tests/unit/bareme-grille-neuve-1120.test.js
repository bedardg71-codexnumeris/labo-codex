/**
 * #1120 — UNE GRILLE NEUVE SE CONSTRUIT ENTIÈRE : sous-critères et barème dès la création, le barème sous
 * les sous-critères (21 oct. 2026).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-21-grille-neuve-sous-criteres-bareme.md. Le symptôme, vécu par
 * Grégoire : « Si je crée une grille neuve, aucun de ces boutons n'existe. »
 *
 * Ce que ce banc verrouille :
 *   A — EN CRÉATION, LES MÊMES SECTIONS qu'en modification : « Sous-critères » pour un critère holistique ou
 *       analytique, puis « Barème » pour un analytique ; rien de neuf pour un algorithmique (hors du lot).
 *   O — L'ORDRE : le barème SOUS les sous-critères, en création comme en modification.
 *   E — LES GESTES EN CRÉATION n'écrivent RIEN en base (décision E1) ; à « Créer la grille », la grille porte les
 *       sous-critères et les tranches, dans l'ordre ; un critère holistique n'y porte pas de barème.
 *   R — LES MÊMES REFUS en création (les points d'une tranche contre la pondération).
 *   P — LA PHRASE « Donne d'abord ses points… » (complément de 8 h 11) : présente à 0, absente à 5, sans
 *       redessiner, en création et en modification.
 *
 * Break-tests (faits le 21 oct.) : voir la demande de relecture du lot.
 *
 * Grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function vraiEchapperHtml(document) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

const K = 'a2032_grillesTemplates';
const cle = (k) => 'a2032_' + k;
const PHRASE = 'Donne d’abord ses points à ce critère : ceux de ses tranches iront de 0 à ce nombre.';

const HTML = `<!doctype html><html><body>
    <div id="accueilGrilles"></div><div id="conteneurEditionGrille" class="u-hide">
        <input id="nomGrilleTemplate"><textarea id="descriptionGrille"></textarea>
        <select id="typeGrille"></select><p id="precisionTypeGrille"></p><span id="totalPonderationAffichage"></span>
        <div id="panneauMetadonneesGrille"></div><div id="listeCriteres"></div><div id="vueGrillesCriteres"></div>
    </div></body></html>`;

function monter({ grilles = [] } = {}) {
    const dom = new JSDOM(HTML);
    const document = dom.window.document;
    const store = { [K]: grilles };
    const journal = [];
    let n = 0;
    const db = {
        get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; journal.push(['ecrit', k]); },
        setSync: (k, v) => { store[k] = v; journal.push(['ecrit', k]); },
        modifier: async (k, mutateur, defaut) => {
            const resultat = await mutateur(k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            journal.push(['ecrit', k]);
            return resultat;
        }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const win = { echapperHtml };
    chargerScript('js/temoin-enregistrement.js', { document }, win);
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre: (raison, geste, k) => journal.push(['nonEnregistre', raison, k]) };
    chargerScript('js/ui-blocs.js', { document }, win);
    chargerScript('js/bareme.js', {}, win);
    const predicats = {};   // la question de sortie commune (ui-dialogues.js) : le prédicat que grilles.js déclare
    win.uiDialogues = { declarerFicheEnCreation: (genre, p) => { predicats[genre] = p; }, quitterCreationSiConfirme: async () => true };
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml, alert() {}, confirm: () => true,
        genererIdUnique: (p) => p + 'banc' + (++n),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    }, win);
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    const ecritures = () => journal.filter(e => e[0] === 'ecrit' && e[1] === K).length;
    const carte = (i) => document.querySelectorAll('#listeCriteres .item-liste')[i];
    const titres = (i) => [...carte(i).querySelectorAll('.grille-attendu-titre')].map(h => h.textContent.trim());
    const phrase = (i) => carte(i).querySelector('[data-points-d-abord]');
    return { win, document, store, journal, ecritures, carte, titres, phrase, saisie: () => predicats.grille() };
}

/** « + Nouvelle grille », un nom, un critère analytique. */
async function enCreation(type = 'analytique') {
    const m = monter();
    await m.win.creerNouvelleGrille();
    m.document.getElementById('nomGrilleTemplate').value = 'Grille neuve du banc';
    const select = m.carte(0).querySelector('[data-on-change="modifierTypeCritereTempHandler"]');
    select.value = type;
    m.win.modifierTypeCritereTempHandler(select);
    return m;
}

/** Un champ saisi comme le dispatcher le fait : la valeur est déjà dans l'élément quand le handler part. */
async function saisir(m, selecteur, valeur, handler) {
    const el = m.document.querySelector(selecteur);
    el.value = valeur;
    await m.win[handler](el);
    return el;
}

const tranche = (m, i, j, champ) => m.carte(i).querySelectorAll('.grille-bareme-tranche')[j].querySelector(`[data-champ="${champ}"]`);

/** Deux sous-critères et trois tranches, avant « Créer la grille ». */
async function construire(m) {
    await saisir(m, '#listeCriteres [data-on-change="modifierPonderationCritereTempHandler"]', '10', 'modifierPonderationCritereTempHandler');
    for (const nom of ['Annoncer le plan', 'Conclure']) {
        await m.win.ajouterSousCritere('temp', 0);
        const champs = m.carte(0).querySelectorAll('.grille-sous-critere input');
        const el = champs[champs.length - 1];
        el.value = nom;
        await m.win.modifierSousCritereHandler(el);
    }
    const TRANCHES = [['Insuffisant', '0 à 3', 'Peu d’idées.'], ['Suffisant', '4 à 7', 'Des idées claires.'], ['Excellent', '8 à 10', 'Des idées fines.']];
    for (let j = 0; j < TRANCHES.length; j++) {
        await m.win.ajouterTrancheBareme('temp', 0);
        const [nom, points, texte] = TRANCHES[j];
        for (const [champ, valeur] of [['nom', nom], ['points', points], ['texte', texte]]) {
            const el = tranche(m, 0, j, champ);
            el.value = valeur;
            await m.win.modifierTrancheBaremeHandler(el);
        }
    }
}

/* ======================================================= A — LES MÊMES SECTIONS */

describe('#1120 grille neuve · A — en création, les sections de la modification', () => {
    it('A.a un critère analytique : « Sous-critères » et son bouton, « Barème » et « + Ajouter une tranche »', async () => {
        const m = await enCreation('analytique');
        expect(m.titres(0)).toEqual(['Sous-critères', 'Barème']);
        expect(m.carte(0).querySelector('[data-action="ajouterSousCritere"]').textContent).toBe('+ Ajouter un sous-critère');
        expect(m.carte(0).querySelector('[data-action="ajouterSousCritere"]').dataset.param).toBe('temp');
        expect(m.carte(0).querySelector('[data-action="ajouterTrancheBareme"]').textContent).toBe('+ Ajouter une tranche');
        expect(m.carte(0).querySelector('[data-action="ajouterTrancheBareme"]').dataset.param).toBe('temp');
        expect(m.carte(0).querySelector('.grille-attendu-titre .primo-aide[data-target="grille-bareme"]')).not.toBeNull();
    });

    it('A.b un critère holistique : « Sous-critères » seul, aucun barème', async () => {
        const m = await enCreation('holistique');
        expect(m.titres(0)).toEqual(['Sous-critères']);
        expect(m.carte(0).querySelector('[data-action="ajouterTrancheBareme"]')).toBeNull();
    });

    it('A.c un critère algorithmique : rien de neuf (ses sous-critères se définissent une fois la grille enregistrée)', async () => {
        const m = await enCreation('algorithmique');
        expect(m.carte(0).querySelector('.grille-attendu')).toBeNull();
        expect(m.carte(0).textContent).toContain('Les sous-critères se définissent une fois la grille enregistrée.');
    });
});

/* ======================================================= O — L'ORDRE */

describe('#1120 grille neuve · O — le barème sous les sous-critères', () => {
    it('O.a en création et en modification, le bloc des sous-critères précède celui du barème', async () => {
        const m = await enCreation('analytique');
        await construire(m);
        const ordre = (c) => {
            const sous = c.querySelector('.grille-sous-criteres'), bareme = c.querySelector('.grille-bareme');
            return sous.compareDocumentPosition(bareme) & 4;   // DOCUMENT_POSITION_FOLLOWING
        };
        expect(ordre(m.carte(0)), 'en création').toBe(4);
        await m.win.sauvegarderGrilleTemplate(true);
        m.win.afficherCriteresGrille(m.store[K][0]);
        expect(m.titres(0)).toEqual(['Sous-critères', 'Barème']);
        expect(ordre(m.carte(0)), 'en modification').toBe(4);
    });
});

/* ======================================================= E — RIEN AVANT « CRÉER LA GRILLE » */

describe('#1120 grille neuve · E — ce qui s’écrit, et quand', () => {
    it('E.a deux sous-critères et trois tranches avant « Créer la grille » : RIEN en base', async () => {
        const m = await enCreation('analytique');
        await construire(m);
        expect(m.ecritures()).toBe(0);
        expect(m.store[K]).toEqual([]);
        // Ils vivent dans le critère temporaire, et à l'écran.
        expect(m.win.tempCriteres[0].sousCriteres.map(s => s.nom)).toEqual(['Annoncer le plan', 'Conclure']);
        expect(m.carte(0).querySelectorAll('.grille-bareme-tranche')).toHaveLength(3);
    });

    it('E.b à « Créer la grille », la grille porte sous-critères et tranches, dans l’ordre, avec leurs points', async () => {
        const m = await enCreation('analytique');
        await construire(m);
        await m.win.sauvegarderGrilleTemplate(true);
        expect(m.ecritures()).toBe(1);
        const c = m.store[K][0].criteres[0];
        expect(c.type).toBe('analytique');
        expect(c.ponderation).toBe(10);
        expect(c.sousCriteres.map(s => [s.code, s.nom, s.ponderation, s.retroaction])).toEqual([['0', 'Annoncer le plan', 1, ''], ['1', 'Conclure', 1, '']]);
        expect(c.bareme.map(t => [t.nom, t.pointsMin, t.pointsMax, t.texte])).toEqual([
            ['Insuffisant', 0, 3, 'Peu d’idées.'], ['Suffisant', 4, 7, 'Des idées claires.'], ['Excellent', 8, 10, 'Des idées fines.']]);
    });

    it('E.c réordonner et retirer en création : rien en base ; la grille créée garde ce qui reste, dans l’ordre', async () => {
        const m = await enCreation('analytique');
        await construire(m);
        await m.win.deplacerSousCritereBas('temp', 0, 0);
        await m.win.supprimerSousCritere('temp', 0, 1);
        await m.win.retirerTrancheBareme('temp', 0, m.win.tempCriteres[0].bareme[1].id);
        expect(m.ecritures()).toBe(0);
        await m.win.sauvegarderGrilleTemplate(true);
        const c = m.store[K][0].criteres[0];
        expect(c.sousCriteres.map(s => s.nom)).toEqual(['Conclure']);
        expect(c.bareme.map(t => t.nom)).toEqual(['Insuffisant', 'Excellent']);
    });

    it('E.d un critère holistique ne porte pas de barème : « + Ajouter une tranche » n’y fait rien', async () => {
        const m = await enCreation('holistique');
        await m.win.ajouterTrancheBareme('temp', 0);
        await m.win.ajouterSousCritere('temp', 0);
        expect(m.ecritures()).toBe(0);
        await m.win.sauvegarderGrilleTemplate(true);
        const c = m.store[K][0].criteres[0];
        expect(c).not.toHaveProperty('bareme');
        expect(c.sousCriteres).toHaveLength(1);
    });
});

/* ======================================================= Q — « FERMER » SANS CRÉER */

describe('#1120 grille neuve · Q — la question de « Fermer » voit ce qui est saisi', () => {
    it('Q.a une tranche ou un sous-critère, sans nom ni rien d’autre : la fiche porte une saisie', async () => {
        const m = await enCreation('analytique');
        m.document.getElementById('nomGrilleTemplate').value = '';
        m.win.tempTypeGrille = '';
        m.document.getElementById('conteneurEditionGrille').classList.remove('u-hide');
        expect(m.saisie(), 'rien de saisi').toBe(false);
        await m.win.ajouterTrancheBareme('temp', 0);
        expect(m.saisie(), 'une tranche').toBe(true);
        m.win.tempCriteres[0].bareme = [];
        await m.win.ajouterSousCritere('temp', 0);
        expect(m.saisie(), 'un sous-critère').toBe(true);
        expect(m.ecritures()).toBe(0);
    });
});

/* ======================================================= R — LES MÊMES REFUS */

describe('#1120 grille neuve · R — les refus de la modification', () => {
    it('R.a des points au-delà de la pondération sont refusés, en création ; le nom et le texte restent', async () => {
        const m = await enCreation('analytique');
        await m.win.ajouterTrancheBareme('temp', 0);
        const nom = tranche(m, 0, 0, 'nom');
        nom.value = 'Suffisant';
        await m.win.modifierTrancheBaremeHandler(nom);
        const points = tranche(m, 0, 0, 'points');
        points.value = '3';
        await m.win.modifierTrancheBaremeHandler(points);   // pondération à 0
        expect(points.classList.contains('champ-refuse')).toBe(true);
        expect(m.journal.some(e => e[0] === 'nonEnregistre')).toBe(true);
        expect(m.win.tempCriteres[0].bareme[0]).toMatchObject({ nom: 'Suffisant', pointsMin: null, pointsMax: null });
        expect(m.ecritures()).toBe(0);
    });
});

/* ======================================================= P — LA PHRASE DES POINTS D'ABORD */

describe('#1120 grille neuve · P — « Donne d’abord ses points à ce critère »', () => {
    it('P.a en création : présente à 0, absente à 5 sans redessiner, de retour à 0', async () => {
        const m = await enCreation('analytique');
        const p = m.phrase(0);
        expect(p.textContent).toBe(PHRASE);
        expect(p.hidden).toBe(false);
        expect(p.previousElementSibling.textContent.trim()).toBe('Barème');   // sous le titre « Barème »
        await saisir(m, '#listeCriteres [data-on-change="modifierPonderationCritereTempHandler"]', '5', 'modifierPonderationCritereTempHandler');
        expect(m.phrase(0)).toBe(p);   // le même nœud : rien n'a été redessiné
        expect(p.hidden).toBe(true);
        await saisir(m, '#listeCriteres [data-on-change="modifierPonderationCritereTempHandler"]', '0', 'modifierPonderationCritereTempHandler');
        expect(p.hidden).toBe(false);
        // Elle ne bloque rien.
        await m.win.ajouterTrancheBareme('temp', 0);
        expect(m.win.tempCriteres[0].bareme).toHaveLength(1);
    });

    it('P.b en modification : présente à 0, absente à 5 sans redessiner', async () => {
        const m = monter({ grilles: [{ id: 'GRILLE_BANC', nom: 'Grille fictive', criteres: [
            { id: 'CR_1', nom: 'Idées', type: 'analytique', ponderation: 0 },
            { id: 'CR_2', nom: 'Clarté', type: 'holistique', ponderation: 0 }] }] });
        m.win.afficherCriteresGrille(m.store[K][0]);
        const p = m.phrase(0);
        expect(p.textContent).toBe(PHRASE);
        expect(p.hidden).toBe(false);
        expect(m.phrase(1), 'un critère holistique n’a pas de barème, donc pas de phrase').toBeNull();
        const champ = m.carte(0).querySelector('[data-on-change="modifierCritereGrilleHandler"][data-champ="ponderation"]');
        champ.value = '5';
        m.win.modifierCritereGrilleHandler(champ);
        await new Promise(r => setTimeout(r, 0));
        expect(m.store[K][0].criteres[0].ponderation).toBe(5);
        expect(m.phrase(0)).toBe(p);
        expect(p.hidden).toBe(true);
    });

    it('P.c rendue absente d’emblée quand le critère a déjà ses points', () => {
        const m = monter({ grilles: [{ id: 'GRILLE_BANC', nom: 'Grille fictive', criteres: [{ id: 'CR_1', nom: 'Idées', type: 'analytique', ponderation: 5 }] }] });
        m.win.afficherCriteresGrille(m.store[K][0]);
        expect(m.phrase(0).hidden).toBe(true);
    });
});
