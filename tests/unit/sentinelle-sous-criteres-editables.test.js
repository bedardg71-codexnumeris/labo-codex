/**
 * Sentinelle — LES SOUS-CRITÈRES D'UN CRITÈRE NON ALGORITHMIQUE SE MODIFIENT (20 oct. 2026, Grégoire, 13 h 56,
 * sur sa grille « Journal de lecture »).
 *
 * Avant : `rendreAttenduSousCriteres` les montrait en lecture, et seulement si la dissection les avait écrits.
 * Maintenant (`grilles.js`, `rendreSousCriteresCritere`) : une rangée par sous-critère — le nom seul, modifiable,
 * les chevrons, la corbeille — et « + Ajouter un sous-critère », même quand il n'y en a aucun. Les gestes sont
 * ceux du gabarit algorithmique ; les bornes, celles de l'assistant.
 *
 * Ce que ce banc verrouille :
 *   R — LE RENDU : rangées, handlers et index ; section vide avec son bouton ; texte échappé ; rien pour un
 *       critère algorithmique (son gabarit a déjà la liste) ;
 *   G — LES GESTES : ajouter écrit la forme de la dissection ; la 31ᵉ est refusée sans écriture ; un nom de
 *       201 caractères est refusé sans écriture ; un nom de 200 passe ;
 *   A — L'HYPOTHÈSE RETENUE : ces sous-critères NE deviennent PAS des codes d'annotation — `codes-annotation.js`
 *       ne lit que le critère algorithmique activé, même si le drapeau traîne sur un autre critère.
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

const cle = (k) => 'a2032_' + k;

/** grilles.js, avec bareme.js et l'assistant (ses bornes), sur un faux `db` dont `modifier` applique le mutateur. */
function monter(grilles = []) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const store = { [cle('grillesTemplates')]: grilles, [cle('echellesTemplates')]: [] };
    const ecritures = [];
    const copie = (v) => JSON.parse(JSON.stringify(v));
    const db = {
        getSync: (k, d) => (k in store ? copie(store[k]) : d), get: async (k) => store[k], set: async () => {},
        modifier: async (k, mutateur, defaut) => {
            const r = mutateur(k in store ? copie(store[k]) : defaut);
            if (r !== undefined) { store[k] = r; ecritures.push(k); }
            return r;
        }
    };
    const win = chargerScript('js/bareme.js');
    chargerScript('js/materiel-assistant.js', {}, win);
    chargerScript('js/grilles.js', {
        db, cle, document: dom.window.document, echapperHtml: vraiEchapperHtml(dom.window.document),
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null, confirm: () => true,
        genererIdUnique: (p) => p + Math.random().toString(36).slice(2, 8)
    }, win);
    win.boutonsReordonnerBloc = (o) => `<button data-action="${o.actionHaut}" data-param3="${o.param3}"></button><button data-action="${o.actionBas}" data-param3="${o.param3}"></button>`;
    win.boutonRetirerBloc = (o) => `<button data-action="${o.action}" data-param3="${o.param3}"></button>`;
    const temoin = [];
    win.temoinEnregistrement = { nonEnregistre: (r) => temoin.push(r) };
    win.raisonPourTemoin = (r) => r;
    return { win, dom, store, ecritures, temoin };
}

const critere = (extra) => Object.assign({ id: 'CR_1', nom: 'Compréhension', description: '', ponderation: 10, type: 'holistique',
    formule: '', niveauSOLO: 'aucun', verrouille: false }, extra);
const SOUS = [{ id: 'SC_1', code: '0', nom: 'Résumer l’intrigue', ponderation: 1, retroaction: '' },
    { id: 'SC_2', code: '1', nom: 'Situer les personnages', ponderation: 1, retroaction: '' }];
const sc = (n) => Array.from({ length: n }, (_, i) => ({ id: 'SC_' + i, code: String(i), nom: 'Élément ' + i, ponderation: 1, retroaction: '' }));

function rendu(win, dom, c) {
    const div = dom.window.document.createElement('div');
    div.innerHTML = win.rendreAttenduCritere(c, { grilleId: 'GR_BANC', index: 2 });
    return div;
}

describe('R — le rendu des sous-critères d’un critère non algorithmique', () => {
    it('R.a une rangée par sous-critère : le nom modifiable, ses handlers et son index ; chevrons et corbeille', () => {
        const { win, dom } = monter();
        for (const type of ['holistique', 'analytique', undefined]) {
            const div = rendu(win, dom, critere({ type, sousCriteres: SOUS }));
            const champs = [...div.querySelectorAll('.grille-sous-critere input[data-champ="nom"]')];
            expect(champs.map(x => x.value)).toEqual(['Résumer l’intrigue', 'Situer les personnages']);
            expect(champs.map(x => [x.dataset.onChange, x.dataset.grilleId, x.dataset.critereIndex, x.dataset.scIndex]))
                .toEqual([['modifierSousCritereHandler', 'GR_BANC', '2', '0'], ['modifierSousCritereHandler', 'GR_BANC', '2', '1']]);
            expect(champs.map(x => x.getAttribute('aria-label'))).toEqual(['Nom du sous-critère 1', 'Nom du sous-critère 2']);
            expect(champs.every(x => x.getAttribute('maxlength') === '200')).toBe(true);
            // Le nom seul : ni code, ni pondération, ni couleur, ni observation.
            expect(div.querySelectorAll('.grille-sous-critere input, .grille-sous-critere textarea, .grille-sous-critere select')).toHaveLength(2);
            expect([...div.querySelectorAll('.grille-sous-critere [data-action]')].map(b => b.dataset.action + ':' + b.dataset.param3)).toEqual([
                'deplacerSousCritereHaut:0', 'deplacerSousCritereBas:0', 'supprimerSousCritere:0',
                'deplacerSousCritereHaut:1', 'deplacerSousCritereBas:1', 'supprimerSousCritere:1']);
            expect(div.querySelector('[data-action="ajouterSousCritere"]').textContent).toBe('+ Ajouter un sous-critère');
        }
    });

    it('R.b aucun sous-critère : la section se montre, vide, avec son bouton d’ajout', () => {
        const { win, dom } = monter();
        for (const c of [critere(), critere({ sousCriteres: [] })]) {
            const div = rendu(win, dom, c);
            expect([...div.querySelectorAll('.grille-attendu-titre')].map(h => h.textContent)).toEqual(['Sous-critères']);
            expect(div.querySelectorAll('.grille-sous-critere')).toHaveLength(0);
            const b = div.querySelector('[data-action="ajouterSousCritere"]');
            expect([b.dataset.param, b.dataset.param2]).toEqual(['GR_BANC', '2']);
        }
    });

    it('R.c un nom piégé reste du texte', () => {
        const { win, dom } = monter();
        const piege = '"><img src=x onerror="window.__pwn=1">';
        const div = rendu(win, dom, critere({ sousCriteres: [{ id: 'SC_X', code: '0', nom: piege, ponderation: 1 }] }));
        expect(div.querySelector('img')).toBeNull();
        expect(div.querySelector('.grille-sous-critere input').value).toBe(piege);
    });

    it('R.d critère algorithmique : rien ici (son gabarit porte la liste) ; sans contexte de handlers : rien', () => {
        const { win } = monter();
        expect(win.rendreAttenduCritere(critere({ type: 'algorithmique', sousCriteres: SOUS }), { grilleId: 'GR_BANC', index: 0 })).toBe('');
        expect(win.rendreAttenduCritere(critere({ sousCriteres: SOUS }))).toBe('');
    });
});

describe('G — les gestes, et les bornes de l’assistant', () => {
    const grille = (scs) => [{ id: 'GR_BANC', nom: 'Journal fictif', criteres: [critere({ type: 'analytique', sousCriteres: scs })] }];

    it('G.a ajouter, sur un critère sans sous-critère : la forme de la dissection, écrite', async () => {
        const g = grille(undefined);
        delete g[0].criteres[0].sousCriteres;
        const { win, store } = monter(g);
        await win.ajouterSousCritere('GR_BANC', 0);
        const ecrits = store[cle('grillesTemplates')][0].criteres[0].sousCriteres;
        expect(ecrits).toHaveLength(1);
        expect(ecrits[0]).toMatchObject({ code: '0', nom: '', ponderation: 1.0, retroaction: '' });
        expect(ecrits[0].id).toMatch(/^SC_/);
    });

    it('G.b la 31ᵉ est refusée : rien n’est écrit, le témoin dit pourquoi', async () => {
        const { win, store, ecritures, temoin } = monter(grille(sc(30)));
        await win.ajouterSousCritere('GR_BANC', 0);
        expect(ecritures).toEqual([]);
        expect(store[cle('grillesTemplates')][0].criteres[0].sousCriteres).toHaveLength(30);
        expect(temoin).toEqual(['Au plus 30 sous-critères par critère']);
        // La 30ᵉ passe.
        const m = monter(grille(sc(29)));
        await m.win.ajouterSousCritere('GR_BANC', 0);
        expect(m.store[cle('grillesTemplates')][0].criteres[0].sousCriteres).toHaveLength(30);
    });

    it('G.c un nom de 201 caractères est refusé sans écriture ; 200 passent', async () => {
        const { win, store, ecritures } = monter(grille(sc(2)));
        const r = await win.modifierSousCritere('GR_BANC', 0, 1, 'nom', 'x'.repeat(201));
        expect(r).toEqual({ refuse: 'Le nom d’un sous-critère fait 200 caractères au plus' });
        expect(ecritures).toEqual([]);
        expect(await win.modifierSousCritere('GR_BANC', 0, 1, 'nom', 'y'.repeat(200))).toEqual({ refuse: null });
        expect(store[cle('grillesTemplates')][0].criteres[0].sousCriteres[1].nom).toBe('y'.repeat(200));
    });

    it('G.d le champ refusé est marqué (le handler lit le refus)', async () => {
        const { win, dom } = monter(grille(sc(2)));
        const el = dom.window.document.createElement('input');
        Object.assign(el.dataset, { grilleId: 'GR_BANC', critereIndex: '0', scIndex: '0', champ: 'nom' });
        el.value = 'z'.repeat(201);
        await win.modifierSousCritereHandler(el);
        expect(el.classList.contains('champ-refuse')).toBe(true);
        el.value = 'Un nom court';
        await win.modifierSousCritereHandler(el);
        expect(el.classList.contains('champ-refuse')).toBe(false);
    });
});

describe('A — ces sous-critères ne deviennent pas des codes d’annotation', () => {
    function codes(grille) {
        const fenetre = {};
        chargerScript('js/evaluation-enonces.js', {}, fenetre);
        const magasin = {};
        const db = { getSync: (k, d) => (Object.prototype.hasOwnProperty.call(magasin, k) ? magasin[k] : d) };
        chargerScript('js/codes-annotation.js', { db, cle: (k) => 'a2026_' + k }, fenetre);
        return { estActive: fenetre.codesAnnotation.estActive(grille), ids: fenetre.codesAnnotation.listeCodes(grille).map(c => c.id) };
    }
    const REPLI = ['errfr_1', 'errfr_2', 'errfr_3', 'errfr_4', 'errfr_5', 'errfr_6', 'errfr_7', 'errfr_8', 'errfr_9', 'errfr_10'];

    it('A.a une grille sans critère algorithmique : le repli, même si le drapeau traîne sur un critère analytique', () => {
        const g = { id: 'GR_A', criteres: [critere({ type: 'analytique', sousCriteres: SOUS, codesDepuisSousCriteres: true })] };
        expect(codes(g)).toEqual({ estActive: false, ids: REPLI });
    });

    it('A.b une grille avec un critère algorithmique activé : ses codes à lui, jamais ceux du critère analytique', () => {
        const g = { id: 'GR_B', criteres: [
            critere({ type: 'analytique', sousCriteres: [{ id: 'SC_9', code: '9', nom: 'Pas un code', ponderation: 1 }], codesDepuisSousCriteres: true }),
            critere({ id: 'CR_2', type: 'algorithmique', sousCriteres: [{ id: 'SC_A', code: '1', nom: 'Syntaxe', ponderation: 1 }], codesDepuisSousCriteres: true })] };
        expect(codes(g)).toEqual({ estActive: true, ids: ['errfr_1'] });
    });
});
