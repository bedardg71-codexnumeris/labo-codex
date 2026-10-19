/**
 * LA DISSECTION, LOT 13 — modifier les réponses d'un critère dans « Grilles de critères ».
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-19-dissection-13-modifier-les-reponses.md.
 *
 * Ce que ce banc verrouille :
 *   Z — LE POINT 0 : aucune évaluation ne lit les réponses (`descripteurs`) ; une copie notée garde
 *       ses points (`pointsAnalytiques`), quoi qu'on change ici.
 *   P — LES FONCTIONS PURES (`grilles.js`, `reponsesCritere`) : texte, points, ajout, retrait, refus.
 *   G — LES GESTES, sur un faux stockage : chaque geste écrit ce qu'il dit, dans l'ordre ; un refus
 *       n'écrit rien et le témoin dit pourquoi ; lié à une échelle, seul le texte change.
 *   R — LE RENDU : tout passe par `echapperHtml`, aucun gestionnaire en ligne.
 * Grilles et textes fictifs.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync } from 'node:fs';
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

/** Une grille fictive, comme la dissection la crée : en points, des réponses sous leurs points. */
function grilleEnPoints() {
    return {
        id: 'GRILLE_BANC', nom: 'Grille fictive', type: 'analytique',
        criteres: [
            { id: 'CR_1', nom: 'Introduction', type: 'analytique', ponderation: 4, descripteurs: { parNiveau: {
                '0 point': 'Aucune introduction.', '2 points': 'Une introduction incomplète.', '4 points': 'Une introduction complète.' } } },
            { id: 'CR_2', nom: 'Clarté', type: 'holistique', ponderation: 6,
                descripteurs: { echelleId: 'ECH_BANC', parNiveau: { I: 'Texte incomplet.', M: 'Texte maîtrisé.' } } }
        ]
    };
}

function monter({ grilles = [grilleEnPoints()], confirme = true } = {}) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const document = dom.window.document;
    const store = { [K]: grilles, [cle('echellesTemplates')]: [{ id: 'ECH_BANC', nom: 'Échelle du banc', niveaux: [{ code: 'I', nom: 'Incomplet' }, { code: 'M', nom: 'Maîtrisé' }] }] };
    const journal = [];
    const db = {
        get: async (k) => (k in store ? store[k] : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const resultat = await mutateur(k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const win = { echapperHtml };
    chargerScript('js/temoin-enregistrement.js', { document }, win);   // la vraie `raisonPourTemoin`
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre: (raison, geste, k) => journal.push(['nonEnregistre', raison, k]) };
    chargerScript('js/ui-blocs.js', { document }, win);                // la vraie corbeille
    chargerScript('js/materiel-dissection-lecture.js', {}, win);       // le vrai `avecUnite`
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml, confirm: (m) => { journal.push(['confirm', m]); return confirme; },
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
    }, win);
    const rendre = () => { win.afficherCriteresGrille(JSON.parse(JSON.stringify(store[K][0]))); };
    rendre();
    const par = (i) => { const c = store[K][0].criteres[i]; return c.descripteurs ? c.descripteurs.parNiveau : undefined; };
    const champs = (sel, i = 0) => [...document.querySelectorAll('#listeCriteres .item-liste')[i].querySelectorAll(sel)];
    return { win, document, store, journal, par, champs, rendre };
}

function changer(el, valeur) { el.value = valeur; }

describe('lot 13 · Z — le point 0 : aucune évaluation ne lit les réponses d’un critère', () => {
    it('Z.a aucun module d’évaluation, de note ou de bilan ne lit `descripteurs`', () => {
        // Le jour où l'un d'eux la lira, changer ou retirer une réponse pourra changer une note :
        // ce banc rougit, et la question remonte à Grégoire (consigne du lot 13, point 0).
        const lecteurs = readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js'))
            .filter(f => /\.descripteurs\b|\bdescripteurs\s*(?:\.[a-zA-Z]|\[)/.test(readFileSync(path.join(racine, 'js', f), 'utf8')));
        expect(lecteurs.sort()).toEqual(['grilles.js', 'import-export.js', 'materiel-assistant.js', 'materiel-creation.js']);
    });

    it('Z.b une copie notée porte ses points sous l’identifiant du critère, pas sous une réponse', () => {
        const src = readFileSync(path.join(racine, 'js', 'evaluation-calcul.js'), 'utf8');
        expect(src).toContain('const pts = source.pointsAnalytiques[critere.id];');
    });
});

describe('lot 13 · P — les fonctions pures', () => {
    const { win } = monter();
    const R = win.reponsesCritere;
    const PAR = { '0 point': 'A', '2 points': 'B', '4 points': 'C' };

    it('P.a le texte change à sa place, l’ordre reste ; 5 000 caractères au plus', () => {
        const r = R.texteModifie(PAR, 1, '2 points', '  Nouveau texte.  ');
        expect(Object.entries(r.parNiveau)).toEqual([['0 point', 'A'], ['2 points', 'Nouveau texte.'], ['4 points', 'C']]);
        expect(R.texteModifie(PAR, 1, '2 points', 'x'.repeat(5000)).parNiveau).toBeDefined();
        expect(R.texteModifie(PAR, 1, '2 points', 'x'.repeat(5001))).toEqual({ refuse: 'Une réponse fait 5 000 caractères au plus' });
    });

    it('P.b une réponse qui n’est plus à sa place n’est pas touchée, sans un mot', () => {
        expect(R.texteModifie(PAR, 0, '2 points', 'x')).toEqual({ refuse: null });
        expect(R.pointsModifies(PAR, 0, '2 points', '3')).toEqual({ refuse: null });
        expect(R.retiree(PAR, 0, '2 points')).toEqual({ refuse: null });
    });

    it('P.c les points changent la clé, à sa place : un nombre seul prend son unité (C1), le reste tel quel', () => {
        expect(Object.keys(R.pointsModifies(PAR, 1, '2 points', '3').parNiveau)).toEqual(['0 point', '3 points', '4 points']);
        expect(R.pointsModifies(PAR, 1, '2 points', '1,5').cle).toBe('1,5 point');
        expect(R.pointsModifies(PAR, 1, '2 points', ' 3-4 ').cle).toBe('3-4');
        expect(R.pointsModifies(PAR, 1, '2 points', '2 points').parNiveau).toEqual(PAR);   // inchangé : pas un doublon
        expect(R.pointsModifies(PAR, 1, '2 points', '3').parNiveau['3 points']).toBe('B');
    });

    it('P.d les refus des points, avec leur raison', () => {
        const refus = (s) => R.pointsModifies(PAR, 1, '2 points', s).refuse;
        expect(refus('  ')).toBe('Les points de la réponse sont obligatoires');
        expect(refus('_2')).toBe('Des points qui ne commencent pas par « _ »');
        expect(refus('101')).toBe('Des points de 0 à 100');
        expect(refus('-1')).toBe('Des points de 0 à 100');
        expect(refus('100')).toBeUndefined();
        expect(refus('x'.repeat(201))).toBe('Des points de 200 caractères au plus');
        expect(refus('4')).toBe('Une autre réponse de ce critère porte déjà ces points');
    });

    it('P.e ajouter : en dernier, texte vide, « Réponse N » libre ; au plus 20', () => {
        const r = R.ajoutee(PAR);
        expect(Object.entries(r.parNiveau).slice(-1)).toEqual([['Réponse 4', '']]);
        expect(R.ajoutee({ 'Réponse 2': 'x' }).cle).toBe('Réponse 3');
        expect(R.ajoutee({ a: '', 'Réponse 2': '' }).cle).toBe('Réponse 3');
        const vingt = Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['R' + i, '']));
        expect(R.ajoutee(vingt)).toEqual({ refuse: 'Au plus 20 réponses par critère' });
    });

    it('P.f retirer : cette réponse seule, l’ordre des autres reste', () => {
        expect(Object.entries(R.retiree(PAR, 1, '2 points').parNiveau)).toEqual([['0 point', 'A'], ['4 points', 'C']]);
    });
});

describe('lot 13 · G — les gestes, dans « Grilles de critères »', () => {
    it('G.a le texte d’une réponse s’enregistre à son blur', async () => {
        const m = monter();
        const t = m.champs('textarea')[1];
        changer(t, 'Une introduction qui annonce le sujet.');
        await m.win.modifierTexteReponseGrilleHandler(t);
        expect(m.par(0)).toEqual({ '0 point': 'Aucune introduction.', '2 points': 'Une introduction qui annonce le sujet.', '4 points': 'Une introduction complète.' });
    });

    it('G.b les points changent la clé ; le texte de la même réponse suit, sans nouveau rendu', async () => {
        const m = monter();
        const p = m.champs('.grille-attendu-points input')[1];
        changer(p, '3');
        await m.win.modifierPointsReponseGrilleHandler(p);
        expect(Object.keys(m.par(0))).toEqual(['0 point', '3 points', '4 points']);
        expect(p.value).toBe('3 points');
        const t = m.champs('textarea')[1];
        expect(t.dataset.reponseCle).toBe('3 points');
        changer(t, 'Suivi.');
        await m.win.modifierTexteReponseGrilleHandler(t);
        expect(m.par(0)['3 points']).toBe('Suivi.');
    });

    it('G.c un refus n’écrit rien : le champ est marqué, le témoin dit pourquoi', async () => {
        const m = monter();
        const avant = JSON.stringify(m.store[K]);
        const p = m.champs('.grille-attendu-points input')[1];
        changer(p, '4');
        await m.win.modifierPointsReponseGrilleHandler(p);
        expect(JSON.stringify(m.store[K])).toBe(avant);
        expect(p.classList.contains('champ-refuse')).toBe(true);
        expect(m.journal).toContainEqual(['nonEnregistre', 'une autre réponse de ce critère porte déjà ces points.', K]);
    });

    it('G.d ajouter : la réponse paraît en dernier, ses points prêts à saisir', async () => {
        const m = monter();
        await m.win.ajouterReponseGrille('GRILLE_BANC', 0);
        expect(Object.entries(m.par(0)).slice(-1)).toEqual([['Réponse 4', '']]);
        const points = m.champs('.grille-attendu-points input');
        expect(points.map(i => i.value)).toEqual(['0 point', '2 points', '4 points', 'Réponse 4']);
        expect(m.document.activeElement).toBe(points[3]);
    });

    it('G.e retirer : la confirmation du retrait d’un critère ; annulée, rien ne part', async () => {
        const non = monter({ confirme: false });
        await non.win.supprimerReponseGrille('GRILLE_BANC', 0, 1);
        expect(Object.keys(non.par(0))).toEqual(['0 point', '2 points', '4 points']);
        const oui = monter();
        await oui.win.supprimerReponseGrille('GRILLE_BANC', 0, 1);
        expect(oui.journal).toContainEqual(['confirm', 'Es-tu sûr de vouloir supprimer cette réponse ?']);
        expect(Object.keys(oui.par(0))).toEqual(['0 point', '4 points']);
        expect(oui.champs('textarea').map(t => t.value)).toEqual(['Aucune introduction.', 'Une introduction complète.']);
    });

    it('G.f la dernière réponse retirée : le critère n’a plus de descripteurs, comme un critère créé sans', async () => {
        const g = grilleEnPoints();
        g.criteres[0].descripteurs.parNiveau = { '2 points': 'Seule.' };
        const m = monter({ grilles: [g] });
        await m.win.supprimerReponseGrille('GRILLE_BANC', 0, 0);
        expect(m.store[K][0].criteres[0]).not.toHaveProperty('descripteurs');
    });

    it('G.g lié à une échelle : le texte se modifie, les niveaux non', async () => {
        const m = monter();
        const t = m.champs('textarea', 1)[1];
        changer(t, 'Un texte maîtrisé, revu.');
        await m.win.modifierTexteReponseGrilleHandler(t);
        expect(m.par(1)).toEqual({ I: 'Texte incomplet.', M: 'Un texte maîtrisé, revu.' });
        expect(m.champs('input, button', 1).filter(x => x.closest('.grille-attendu'))).toHaveLength(0);
        await m.win.ajouterReponseGrille('GRILLE_BANC', 1);
        await m.win.supprimerReponseGrille('GRILLE_BANC', 1, 0);
        expect(m.par(1)).toEqual({ I: 'Texte incomplet.', M: 'Un texte maîtrisé, revu.' });
    });
});

describe('lot 13 · R — le rendu', () => {
    it('R.a tout est échappé, même une clé piégée ; aucun gestionnaire en ligne', () => {
        const piege = '"><img src=x onerror="window.__pwn=1">';
        const g = grilleEnPoints();
        g.criteres[0].descripteurs.parNiveau = { [piege]: piege };
        const m = monter({ grilles: [g] });
        const bloc = m.document.querySelector('.grille-attendu');
        expect(bloc.querySelector('img[src="x"]')).toBeNull();   // la seule image est celle de la corbeille
        expect(m.champs('.grille-attendu-points input')[0].value).toBe(piege);
        expect(m.champs('textarea')[0].dataset.reponseCle).toBe(piege);
        expect(m.champs('textarea')[0].value).toBe(piege);
        expect([...bloc.querySelectorAll('*')].flatMap(e => [...e.attributes].map(x => x.name)).filter(n => /^on/i.test(n))).toEqual([]);
        expect(bloc.querySelector('[data-action="ajouterReponseGrille"]').textContent.trim()).toBe('+ Ajouter une réponse');
    });
});
