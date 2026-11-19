/**
 * LES DESCRIPTEURS DE NIVEAU DANS L'ÉDITEUR DE GRILLES — lot `descripteurs-grille` (18 nov. 2026).
 *
 * Décision de Grégoire (18 nov.) : dans la grille elle-même, l'enseignant·e décrit, critère par critère, ce qui
 * est attendu à certains niveaux. Chaque niveau de l'échelle a sa case, toutes facultatives.
 * Forme du stockage, inchangée : `critere.descripteurs = { echelleId, parNiveau: { code: texte ≤ 5 000 } }`.
 *
 * Ce que ce banc verrouille :
 *   S — LE STOCKAGE (fonctions pures de `grilles.js`) : écrire, vider (SA clé seule), changer d'échelle sans
 *       perte ; l'échelle déjà posée l'emporte ; les refus ; aucun objet reçu n'est muté.
 *   E — D'OÙ VIENNENT LES NIVEAUX : l'échelle posée, sinon celle d'un critère voisin, sinon la première du
 *       trimestre ; une échelle posée mais disparue se dit.
 *   G — LES GESTES, sur un faux stockage : un critère composé à la main reçoit ses descripteurs ; vider une case ;
 *       changer d'échelle (les textes restent, montrés sous « Textes gardés d’une autre échelle », puis à leur
 *       place au retour) ; un algorithmique ; un voisin reprend l'échelle ; en création, rien en base ; un refus.
 *   A — UN CRITÈRE EN POINTS ne change pas : pas de case vide, pas de menu ; son barème tel quel ; les gestes
 *       n'écrivent rien sur un analytique sans échelle.
 *   X — LA SÉCURITÉ : textes, noms et codes piégés restent du texte ; aucun handler en ligne.
 *
 * Break-tests : voir le rapport du lot (plans de travail/RAPPORT-2026-11-18-descripteurs-grille.md).
 *
 * Grilles, échelles et textes FICTIFS.
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
const IDME = { id: 'ECH_FICTIVE_IDME', nom: 'Échelle fictive IDME', niveaux: [
    { code: 'I', nom: 'Incomplet' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }] };
const TROIS = { id: 'ECH_FICTIVE_TROIS', nom: 'Échelle fictive à trois paliers', niveaux: [
    { code: 'P1', nom: 'Palier un' }, { code: 'P2', nom: 'Palier deux' }, { code: 'P3', nom: 'Palier trois' }] };

/** Une grille composée à la main : aucun critère n'a de descripteurs. */
function grilleALaMain() {
    return {
        id: 'GRILLE_MAIN', nom: 'Grille fictive à la main',
        criteres: [
            { id: 'CR_A', nom: 'Pertinence fictive', type: 'holistique', ponderation: 40, description: '', niveauSOLO: 'aucun' },
            { id: 'CR_B', nom: 'Rigueur fictive', type: 'holistique', ponderation: 30, description: '', niveauSOLO: 'aucun' },
            { id: 'CR_C', nom: 'Langue fictive', type: 'algorithmique', ponderation: 20, description: '', niveauSOLO: 'aucun' },
            { id: 'CR_D', nom: 'Questions fictives', type: 'analytique', ponderation: 10, description: '', niveauSOLO: 'aucun',
                bareme: [{ id: 'TR_1', nom: 'Juste', pointsMin: 10, pointsMax: 10, texte: 'Tout est juste.' }] }
        ]
    };
}

function monter({ grilles = [grilleALaMain()], echelles = [IDME, TROIS] } = {}) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const document = dom.window.document;
    const store = { [K]: grilles, [cle('echellesTemplates')]: echelles };
    const journal = [];
    let n = 0;
    const db = {
        get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
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
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml, confirm: () => true,
        genererIdUnique: (p) => p + 'banc' + (++n),
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
    }, win);
    const rendre = () => { win.afficherCriteresGrille(JSON.parse(JSON.stringify(store[K][0]))); };
    rendre();
    const critere = (i) => store[K][0].criteres[i];
    const carte = (i) => document.querySelectorAll('#listeCriteres .item-liste')[i];
    const cases = (i) => [...carte(i).querySelectorAll(':scope .grille-attendu > .grille-attendu-niveaux .grille-attendu-niveau')];
    const noms = (i) => cases(i).map(c => c.querySelector('strong').textContent);
    const valeurs = (i) => cases(i).map(c => c.querySelector('textarea').value);
    const gardes = (i) => [...carte(i).querySelectorAll('.grille-attendu-hors .grille-attendu-niveau')]
        .map(c => [c.querySelector('strong').textContent, c.querySelector('textarea').value]);
    const ecritures = () => journal.filter(e => e[0] === 'ecrit' && e[1] === K).length;
    /** Une case saisie comme le dispatcher le fait : la valeur est déjà dans l'élément quand le handler part. */
    const ecrire = async (i, code, texte) => {
        const t = carte(i).querySelector(`.grille-attendu-niveau textarea[data-niveau="${code}"]`);
        t.value = texte;
        await win.modifierDescripteurNiveauHandler(t);
        return t;
    };
    const choisirEchelle = async (i, id) => {
        const s = carte(i).querySelector('select[data-on-change="changerEchelleDescripteursHandler"]');
        s.value = id;
        await win.changerEchelleDescripteursHandler(s);
    };
    return { win, document, store, journal, critere, carte, cases, noms, valeurs, gardes, ecritures, ecrire, choisirEchelle, rendre };
}

const D = () => chargerScript('js/grilles.js', {
    db: { getSync: (k, d) => d, get: async () => null, modifier: async () => {}, set: async () => {} }, cle,
    document: new JSDOM('').window.document, echapperHtml: (s) => s, notifications: {}, grilleTemplateActuelle: null
}).descripteursNiveaux;

/* ======================================================= S — LE STOCKAGE */

describe('descripteurs · S — le stockage', () => {
    it('S.a écrire : un descripteur neuf naît avec l’échelle montrée ; le texte est rogné ; un second niveau s’ajoute', () => {
        const N = D();
        const r1 = N.avecTexte(undefined, 'ECH_X', 'D', '  Situe l’œuvre fictive.\n ');
        expect(r1).toEqual({ descripteurs: { echelleId: 'ECH_X', parNiveau: { D: 'Situe l’œuvre fictive.' } } });
        const r2 = N.avecTexte(r1.descripteurs, 'ECH_X', 'M', 'Nuance l’analyse fictive.');
        expect(r2.descripteurs).toEqual({ echelleId: 'ECH_X', parNiveau: { D: 'Situe l’œuvre fictive.', M: 'Nuance l’analyse fictive.' } });
    });

    it('S.b vider retire SA clé, jamais les autres ; vider une case vide ou réécrire le même texte : rien', () => {
        const N = D();
        const d = { echelleId: 'ECH_X', parNiveau: { I: 'un', D: 'deux', M: 'trois' } };
        expect(N.avecTexte(d, 'ECH_X', 'D', '   ').descripteurs).toEqual({ echelleId: 'ECH_X', parNiveau: { I: 'un', M: 'trois' } });
        expect(N.avecTexte(d, 'ECH_X', 'E', '')).toEqual({ inchange: true });
        expect(N.avecTexte(d, 'ECH_X', 'M', 'trois ')).toEqual({ inchange: true });
        expect(N.avecTexte(undefined, 'ECH_X', 'D', '')).toEqual({ inchange: true });
    });

    it('S.c changer d’échelle ne touche aucun texte ; la même échelle : rien ; aucune : refus', () => {
        const N = D();
        const d = { echelleId: 'ECH_X', parNiveau: { I: 'un', M: 'trois' } };
        expect(N.avecEchelle(d, 'ECH_Y')).toEqual({ descripteurs: { echelleId: 'ECH_Y', parNiveau: { I: 'un', M: 'trois' } } });
        expect(N.avecEchelle(undefined, 'ECH_Y')).toEqual({ descripteurs: { echelleId: 'ECH_Y', parNiveau: {} } });
        expect(N.avecEchelle(d, 'ECH_X')).toEqual({ inchange: true });
        expect(N.avecEchelle(d, '')).toEqual({ refuse: null });
    });

    it('S.d l’échelle déjà posée l’emporte sur l’échelle montrée (un DOM périmé ne la change pas)', () => {
        const N = D();
        expect(N.avecTexte({ echelleId: 'ECH_X', parNiveau: {} }, 'ECH_Y', 'I', 'un').descripteurs.echelleId).toBe('ECH_X');
        // Un ancien texte sans échelle (un holistique de la dissection) : le premier geste inscrit l'échelle montrée.
        expect(N.avecTexte({ parNiveau: { Bon: 'b' } }, 'ECH_Y', 'I', 'un').descripteurs).toEqual({ echelleId: 'ECH_Y', parNiveau: { Bon: 'b', I: 'un' } });
    });

    it('S.e les refus : plus de 5 000 caractères (5 000 passent) ; un code invalide ; un neuf sans échelle', () => {
        const N = D();
        expect(N.avecTexte(undefined, 'ECH_X', 'I', 'x'.repeat(5001))).toEqual({ refuse: 'Un texte de niveau fait 5 000 caractères au plus' });
        expect(N.avecTexte(undefined, 'ECH_X', 'I', 'x'.repeat(5000)).descripteurs.parNiveau.I).toHaveLength(5000);
        for (const code of ['', '__proto__', 'constructor', undefined]) expect(N.avecTexte(undefined, 'ECH_X', code, 'x')).toEqual({ refuse: null });
        expect(N.avecTexte(undefined, null, 'I', 'x')).toEqual({ refuse: null });
    });

    it('S.f aucun objet reçu n’est muté', () => {
        const N = D();
        const d = { echelleId: 'ECH_X', parNiveau: { I: 'un', D: 'deux' } };
        const avant = JSON.stringify(d);
        N.avecTexte(d, 'ECH_X', 'D', '');
        N.avecTexte(d, 'ECH_X', 'M', 'trois');
        N.avecEchelle(d, 'ECH_Y');
        expect(JSON.stringify(d)).toBe(avant);
    });
});

/* ======================================================= E — D'OÙ VIENNENT LES NIVEAUX */

describe('descripteurs · E — d’où viennent les niveaux', () => {
    const N = D();
    const ech = [IDME, TROIS];
    it('E.a l’échelle posée sur le critère', () => {
        const c = { type: 'holistique', descripteurs: { echelleId: TROIS.id, parNiveau: {} } };
        expect(N.echelleAffichee(c, [c], ech)).toEqual({ id: TROIS.id, echelle: TROIS });
    });
    it('E.b sinon celle d’un voisin par niveaux qui en porte une encore présente (pas d’un analytique, pas d’une disparue)', () => {
        const c = { type: 'holistique' };
        const disparue = { type: 'holistique', descripteurs: { echelleId: 'ECH_PARTIE', parNiveau: {} } };
        const analytique = { type: 'analytique', descripteurs: { echelleId: IDME.id, parNiveau: {} } };
        const voisin = { type: 'algorithmique', descripteurs: { echelleId: TROIS.id, parNiveau: {} } };
        expect(N.echelleAffichee(c, [c, disparue, analytique, voisin], ech)).toEqual({ id: TROIS.id, echelle: TROIS });
    });
    it('E.c sinon la première échelle du trimestre ; aucune : id nul', () => {
        expect(N.echelleAffichee({ type: 'holistique' }, [], ech)).toEqual({ id: IDME.id, echelle: IDME });
        expect(N.echelleAffichee({ type: 'holistique' }, [], [])).toEqual({ id: null, echelle: null });
    });
    it('E.d une échelle posée, disparue du trimestre : son id, sans échelle', () => {
        expect(N.echelleAffichee({ descripteurs: { echelleId: 'ECH_PARTIE' } }, [], ech)).toEqual({ id: 'ECH_PARTIE', echelle: null });
    });
});

/* ======================================================= G — LES GESTES */

describe('descripteurs · G — les gestes', () => {
    it('G.a un critère composé à la main : une case par niveau, vide, « Facultatif » ; deux niveaux décrits s’écrivent, et se relisent', async () => {
        const m = monter();
        const carte = m.carte(0);
        expect([...carte.querySelectorAll('.grille-attendu-titre')].map(h => h.textContent)).toEqual(['Ce qui est attendu à chaque niveau', 'Sous-critères']);
        expect(m.noms(0)).toEqual(['Incomplet', 'En développement', 'Maîtrisé', 'Étendu']);
        expect(m.valeurs(0)).toEqual(['', '', '', '']);
        expect(m.cases(0).map(c => c.querySelector('textarea').placeholder)).toEqual(Array(4).fill('Facultatif'));
        expect(m.cases(0)[1].querySelector('textarea').getAttribute('aria-label')).toBe('Ce qui est attendu au niveau En développement');
        const menu = carte.querySelector('.grille-attendu-echelle select');
        expect(carte.querySelector('.grille-attendu-echelle label').textContent).toBe('Niveaux de l’échelle');
        expect(menu.value).toBe(IDME.id);
        expect([...menu.options].map(o => o.textContent)).toEqual([IDME.nom, TROIS.nom]);
        expect(m.critere(0)).not.toHaveProperty('descripteurs');   // aucune écriture sans geste

        await m.ecrire(0, 'D', 'Situe l’œuvre fictive dans son contexte.');
        await m.ecrire(0, 'M', 'Nuance l’analyse fictive par des exemples.');
        expect(m.critere(0).descripteurs).toEqual({ echelleId: IDME.id, parNiveau: {
            D: 'Situe l’œuvre fictive dans son contexte.', M: 'Nuance l’analyse fictive par des exemples.' } });
        expect(m.ecritures()).toBe(2);
        m.rendre();
        expect(m.valeurs(0)).toEqual(['', 'Situe l’œuvre fictive dans son contexte.', 'Nuance l’analyse fictive par des exemples.', '']);
        // Les autres critères n'ont rien reçu.
        expect(m.store[K][0].criteres.slice(1).some(c => c.descripteurs)).toBe(false);
    });

    it('G.b une case vidée retire son texte, jamais les autres', async () => {
        const m = monter();
        await m.ecrire(0, 'D', 'Texte fictif D.');
        await m.ecrire(0, 'M', 'Texte fictif M.');
        m.rendre();
        await m.ecrire(0, 'D', '');
        expect(m.critere(0).descripteurs).toEqual({ echelleId: IDME.id, parNiveau: { M: 'Texte fictif M.' } });
    });

    it('G.c changer d’échelle ne supprime aucun texte : gardés, montrés par leur code sous « Textes gardés… », remis à leur place au retour', async () => {
        const m = monter();
        await m.ecrire(0, 'D', 'Texte fictif D.');
        await m.ecrire(0, 'M', 'Texte fictif M.');
        m.rendre();
        await m.choisirEchelle(0, TROIS.id);
        expect(m.critere(0).descripteurs).toEqual({ echelleId: TROIS.id, parNiveau: { D: 'Texte fictif D.', M: 'Texte fictif M.' } });
        // Le geste redessine : les paliers de la nouvelle échelle, vides ; les deux textes, gardés et modifiables.
        expect(m.noms(0)).toEqual(['Palier un', 'Palier deux', 'Palier trois']);
        expect(m.valeurs(0)).toEqual(['', '', '']);
        expect(m.gardes(0)).toEqual([['D', 'Texte fictif D.'], ['M', 'Texte fictif M.']]);
        expect(m.carte(0).querySelector('.grille-attendu-hors-titre').textContent).toBe('Textes gardés d’une autre échelle');
        expect(m.carte(0).querySelector('.grille-attendu-hors .grille-attendu-mention').textContent).toBe(
            'Leur niveau n’existe pas dans l’échelle « Échelle fictive à trois paliers ». Ils restent gardés et reprennent leur place si tu reviens à leur échelle ; vide une case pour retirer son texte.');
        // Un palier décrit dans la nouvelle échelle s'ajoute aux textes gardés.
        await m.ecrire(0, 'P2', 'Texte fictif du palier deux.');
        expect(Object.keys(m.critere(0).descripteurs.parNiveau)).toEqual(['D', 'M', 'P2']);
        // Le retour : D et M à leur place ; le texte du palier, gardé à son tour.
        m.rendre();
        await m.choisirEchelle(0, IDME.id);
        expect(m.valeurs(0)).toEqual(['', 'Texte fictif D.', 'Texte fictif M.', '']);
        expect(m.gardes(0)).toEqual([['P2', 'Texte fictif du palier deux.']]);
    });

    it('G.d un critère algorithmique reçoit aussi ses descripteurs ; pas de sous-critères ici', async () => {
        const m = monter();
        expect(m.noms(2)).toEqual(['Incomplet', 'En développement', 'Maîtrisé', 'Étendu']);
        expect(m.carte(2).querySelector('.grille-attendu .grille-sous-criteres')).toBeNull();
        await m.ecrire(2, 'D', 'Langue fictive : quelques erreurs.');
        expect(m.critere(2).descripteurs).toEqual({ echelleId: IDME.id, parNiveau: { D: 'Langue fictive : quelques erreurs.' } });
    });

    it('G.e un voisin sans échelle reprend celle choisie pour un autre critère de la grille', async () => {
        const m = monter();
        await m.choisirEchelle(0, TROIS.id);
        expect(m.carte(1).querySelector('.grille-attendu-echelle select').value).toBe(TROIS.id);
        expect(m.noms(1)).toEqual(['Palier un', 'Palier deux', 'Palier trois']);
        expect(m.critere(1)).not.toHaveProperty('descripteurs');   // montrée, pas écrite
        await m.ecrire(1, 'P3', 'Rigueur fictive au palier trois.');
        expect(m.critere(1).descripteurs.echelleId).toBe(TROIS.id);
    });

    it('G.f en création (`temp`) : le critère temporaire change, rien n’est écrit en base', async () => {
        const m = monter();
        m.win.tempCriteres = [{ id: 'TEMP_CR_1', nom: 'Critère fictif neuf', type: 'holistique', ponderation: 0 }];
        const div = m.document.createElement('div');
        div.innerHTML = m.win.rendreAttenduCritere(m.win.tempCriteres[0], { grilleId: 'temp', index: 0, criteres: m.win.tempCriteres });
        const t = div.querySelector('textarea[data-niveau="M"]');
        t.value = 'Texte fictif maîtrisé.';
        await m.win.modifierDescripteurNiveauHandler(t);
        expect(m.win.tempCriteres[0].descripteurs).toEqual({ echelleId: IDME.id, parNiveau: { M: 'Texte fictif maîtrisé.' } });
        expect(m.ecritures()).toBe(0);
    });

    it('G.g un texte trop long : refusé, le champ marqué, rien d’écrit', async () => {
        const m = monter();
        const t = await m.ecrire(0, 'I', 'x'.repeat(5001));
        expect(t.classList.contains('champ-refuse')).toBe(true);
        expect(m.critere(0)).not.toHaveProperty('descripteurs');
        expect(m.ecritures()).toBe(0);
        expect(m.journal.some(e => e[0] === 'nonEnregistre')).toBe(true);
    });

    it('G.h une seule échelle : dite en une ligne, sans menu ; aucune : l’écran guide vers les échelles', () => {
        const une = monter({ echelles: [IDME] });
        expect(une.carte(0).querySelector('.grille-attendu-echelle')).toBeNull();
        expect(une.carte(0).querySelector('.grille-attendu-mention').textContent).toBe('Niveaux de l’échelle « Échelle fictive IDME ».');
        const aucune = monter({ echelles: [] });
        expect(aucune.cases(0)).toHaveLength(0);
        expect(aucune.carte(0).querySelector('.grille-attendu-mention').textContent).toBe(
            'Aucune échelle dans ce trimestre : crée-en une dans Conception → Échelles de performance pour décrire ses niveaux.');
    });

    it('G.i l’échelle posée a disparu : le menu le dit, ses textes restent par leur code ; en choisir une les replace', async () => {
        const g = grilleALaMain();
        g.criteres[0].descripteurs = { echelleId: 'ECH_PARTIE', parNiveau: { D: 'Texte fictif D.', Z: 'Texte fictif Z.' } };
        const m = monter({ grilles: [g] });
        const menu = m.carte(0).querySelector('.grille-attendu-echelle select');
        expect(menu.options[menu.selectedIndex].textContent).toBe('Échelle introuvable');
        expect(m.cases(0)).toHaveLength(0);
        expect(m.gardes(0)).toEqual([['D', 'Texte fictif D.'], ['Z', 'Texte fictif Z.']]);
        await m.choisirEchelle(0, IDME.id);
        expect(m.valeurs(0)).toEqual(['', 'Texte fictif D.', '', '']);
        expect(m.gardes(0)).toEqual([['Z', 'Texte fictif Z.']]);
        expect(m.critere(0).descripteurs.parNiveau).toEqual({ D: 'Texte fictif D.', Z: 'Texte fictif Z.' });
    });
});

/* ======================================================= A — UN CRITÈRE EN POINTS */

describe('descripteurs · A — un critère en points ne change pas', () => {
    it('A.a sans échelle : aucune case de niveau, aucun menu ; son barème tel quel ; les gestes n’écrivent rien', async () => {
        const m = monter();
        const carte = m.carte(3);
        expect([...carte.querySelectorAll('.grille-attendu-titre')].map(h => h.textContent.trim())).toEqual(['Sous-critères', 'Barème']);
        expect(carte.querySelectorAll('.grille-attendu-niveau, .grille-attendu-echelle')).toHaveLength(0);
        const avant = JSON.stringify(m.store[K]);
        const leurre = m.document.createElement('textarea');
        Object.assign(leurre.dataset, { grilleId: 'GRILLE_MAIN', critereIndex: '3', niveau: 'I', echelleId: IDME.id });
        leurre.value = 'x';
        await m.win.modifierDescripteurNiveauHandler(leurre);
        const menu = m.document.createElement('select');
        Object.assign(menu.dataset, { grilleId: 'GRILLE_MAIN', critereIndex: '3' });
        menu.appendChild(Object.assign(m.document.createElement('option'), { value: IDME.id, selected: true }));
        await m.win.changerEchelleDescripteursHandler(menu);
        expect(JSON.stringify(m.store[K])).toBe(avant);
    });

    it('A.b lié à une échelle (assistant d’avant #1125) : ses textes écrits seulement, la mention d’avant, pas de menu', async () => {
        const g = grilleALaMain();
        g.criteres[3].descripteurs = { echelleId: IDME.id, parNiveau: { M: 'Texte fictif M.' } };
        const m = monter({ grilles: [g] });
        expect(m.noms(3)).toEqual(['Maîtrisé']);
        expect(m.carte(3).querySelector('.grille-attendu-echelle')).toBeNull();
        expect(m.carte(3).querySelector('.grille-attendu-mention').textContent).toBe('Les niveaux viennent de l’échelle « Échelle fictive IDME » : ici, seul leur texte se modifie.');
        await m.ecrire(3, 'M', 'Texte fictif M, revu.');
        expect(m.critere(3).descripteurs).toEqual({ echelleId: IDME.id, parNiveau: { M: 'Texte fictif M, revu.' } });
        expect(m.critere(3).bareme).toEqual(grilleALaMain().criteres[3].bareme);
    });
});

/* ======================================================= X — LA SÉCURITÉ */

describe('descripteurs · X — la sécurité', () => {
    const piege = '"><img src=x onerror="window.__pwn=1">';
    it('X.a textes, codes, noms de niveau et d’échelle piégés restent du texte ; aucun handler en ligne', () => {
        const ech = { id: 'ECH_PIEGE', nom: piege, niveaux: [{ code: 'I', nom: piege }, { code: piege, nom: 'Deux' }] };
        const g = grilleALaMain();
        g.criteres[0].descripteurs = { echelleId: 'ECH_PIEGE', parNiveau: { I: piege, [piege]: piege, 'Z"><b>': piege } };
        const m = monter({ grilles: [g], echelles: [ech, IDME] });
        const bloc = m.carte(0).querySelector('.grille-attendu');
        expect(bloc.querySelector('img, b')).toBeNull();
        expect(m.noms(0)).toEqual([piege, 'Deux']);
        expect(m.valeurs(0)).toEqual([piege, piege]);
        expect(m.cases(0)[1].querySelector('textarea').dataset.niveau).toBe(piege);
        expect(m.gardes(0)).toEqual([['Z"><b>', piege]]);
        expect(bloc.querySelector('select').options[0].textContent).toBe(piege);
        expect([...bloc.querySelectorAll('*')].flatMap(el => [...el.attributes].map(a => a.name)).filter(n => /^on/i.test(n))).toEqual([]);
    });

    it('X.b le source du lot : aucun console.log, aucun handler en ligne dans le rendu des descripteurs', () => {
        const src = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
        // Tout le bloc du lot : des constantes de ses textes jusqu'aux sous-critères qui le suivent.
        const debut = src.indexOf('const MAX_TEXTE_NIVEAU');
        const fin = src.indexOf('const TEXTES_SOUS_CRITERES', debut);
        const corps = src.slice(debut, fin);
        expect(debut).toBeGreaterThan(0);
        expect(fin).toBeGreaterThan(debut);
        expect(corps).toContain('function rendreDescripteursNiveaux(');
        expect(corps).not.toMatch(/console\.log|\son[a-z]+=/);
        expect(src).not.toMatch(/console\.log\(/);
    });
});
