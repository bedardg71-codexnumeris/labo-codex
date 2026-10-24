/**
 * #1149, LOT 3a — LES CHAÎNES D'ÉTAPES (24 oct. 2026). Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-chaines-etapes-3a.md.
 *
 * C — le composant commun (js/chaine-etapes.js) : le dessin de la barre du Trimestre, réglée, en attention,
 *     critique, le point d'arrivée, les liaisons, ce que dit le lecteur d'écran, une info piégée rendue en
 *     texte, le clic limité à son conteneur, une mise à jour qui ne reconstruit pas, l'option qui masque.
 * G — la fonction pure qui tire les trois étapes d'une grille et des productions (grilles.js,
 *     `etapesChaineGrille`), et la règle unique de la pondération (`etatPonderation`).
 *
 * Break-tests (faits le 24 oct.) : voir la demande de relecture.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function monterComposant() {
    const dom = new JSDOM('<!doctype html><html><body><nav id="a"></nav><nav id="b"></nav></body></html>');
    const win = {};
    new Function('window', 'document', '"use strict";\n' + readFileSync(path.join(racine, 'js/chaine-etapes.js'), 'utf8'))(win, dom.window.document);
    return { C: win.ChaineEtapes, document: dom.window.document };
}

const TROIS = () => [
    { id: 'un', libelle: 'Un', info: '2 x', reglee: true },
    { id: 'deux', libelle: 'Deux', info: '85 %', reglee: false, ton: 'attention' },
    { id: 'trois', libelle: 'Trois', info: 'aucune', reglee: false, arrivee: true }
];

describe('#1149 · C — le composant commun', () => {
    it('C.a dessine les classes de la barre du Trimestre : nœuds, libellés, infos, liaisons, arrivée', () => {
        const { C, document } = monterComposant();
        const nav = document.getElementById('a');
        C.dessiner(nav, TROIS(), { libelle: 'Étapes de la grille', prefixeIdInfo: 'x-info-' });
        expect(nav.classList.contains('barre-convergence')).toBe(true);
        expect(nav.getAttribute('aria-label')).toBe('Étapes de la grille');
        const enfants = [...nav.children].map(e => e.className);
        expect(enfants).toEqual(['bc-etape bc-complet', 'bc-liaison', 'bc-etape bc-attention',
            'bc-liaison bc-liaison-finale', 'bc-etape bc-destination']);
        const boutons = nav.querySelectorAll('button.bc-etape');
        expect([...boutons].map(b => b.dataset.etape)).toEqual(['un', 'deux', 'trois']);
        expect([...boutons].map(b => b.querySelector('.bc-label').textContent)).toEqual(['Un', 'Deux', 'Trois']);
        expect(document.getElementById('x-info-deux').textContent).toBe('85 %');
        expect(boutons[0].querySelector('.bc-noeud').getAttribute('aria-hidden')).toBe('true');
    });

    it('C.b les liaisons : verte entre deux étapes réglées, la finale reste pointillée tant que l\'arrivée ne l\'est pas', () => {
        const { C, document } = monterComposant();
        const nav = document.getElementById('a');
        const etapes = TROIS();
        etapes[1].reglee = true;
        C.dessiner(nav, etapes);
        const liaisons = nav.querySelectorAll('.bc-liaison');
        expect(liaisons[0].classList.contains('bc-liaison-ok')).toBe(true);
        expect(liaisons[1].classList.contains('bc-liaison-ok')).toBe(false);
        etapes[2].reglee = true;
        C.dessiner(nav, etapes);
        expect(liaisons[1].classList.contains('bc-liaison-ok')).toBe(true);
        expect(nav.querySelector('.bc-destination').classList.contains('bc-complet')).toBe(true);
        // L'étape d'avant n'est plus réglée : la liaison qui en part redevient grise, même vers une étape réglée.
        etapes[0].reglee = false;
        C.dessiner(nav, etapes);
        expect(liaisons[0].classList.contains('bc-liaison-ok')).toBe(false);
        expect(liaisons[1].classList.contains('bc-liaison-ok')).toBe(true);
    });

    it('C.c réglée efface « en attention » et « critique » ; « critique » se pose sur une étape non réglée', () => {
        const { C, document } = monterComposant();
        const nav = document.getElementById('a');
        const etapes = TROIS();
        etapes[1].ton = 'critique';
        C.dessiner(nav, etapes);
        const deux = nav.querySelector('[data-etape="deux"]');
        expect(deux.classList.contains('bc-critique')).toBe(true);
        expect(deux.classList.contains('bc-attention')).toBe(false);
        etapes[1].reglee = true;
        C.dessiner(nav, etapes);
        expect(deux.classList.contains('bc-critique')).toBe(false);
        expect(deux.classList.contains('bc-complet')).toBe(true);
    });

    it('C.d le lecteur d\'écran entend le libellé, l\'info, puis « réglée » ou « à régler »', () => {
        const { C, document } = monterComposant();
        const nav = document.getElementById('a');
        C.dessiner(nav, TROIS());
        const lu = [...nav.querySelectorAll('.bc-etape')].map(b => [...b.childNodes]
            .filter(n => n.getAttribute('aria-hidden') !== 'true').map(n => n.textContent).join(' '));
        expect(lu).toEqual(['Un 2 x , réglée', 'Deux 85 % , à régler', 'Trois aucune , à régler']);
    });

    it('C.e une info piégée est rendue en texte, jamais en HTML', () => {
        const { C, document } = monterComposant();
        const nav = document.getElementById('a');
        const piege = '<img src=x onerror="window.pwn=1">';
        C.dessiner(nav, [{ id: 'p', libelle: piege, info: piege, reglee: false }]);
        expect(nav.querySelector('img')).toBeNull();
        expect(nav.querySelector('.bc-info').textContent).toBe(piege);
        expect(nav.querySelector('.bc-label').textContent).toBe(piege);
    });

    it('C.f le clic appelle l\'action de SA chaîne seulement, avec l\'identifiant de l\'étape', () => {
        const { C, document } = monterComposant();
        const recus = [];
        C.dessiner(document.getElementById('a'), TROIS(), { surClic: (id) => recus.push('a:' + id) });
        C.dessiner(document.getElementById('b'), TROIS(), { surClic: (id) => recus.push('b:' + id) });
        document.querySelector('#a [data-etape="deux"] .bc-label').click();
        document.querySelector('#b [data-etape="trois"]').click();
        expect(recus).toEqual(['a:deux', 'b:trois']);
        // Redessiner ne double pas l'écouteur ; la dernière action remplace la précédente.
        C.dessiner(document.getElementById('a'), TROIS(), { surClic: (id) => recus.push('a2:' + id) });
        document.querySelector('#a [data-etape="un"]').click();
        expect(recus).toEqual(['a:deux', 'b:trois', 'a2:un']);
    });

    it('C.g une mise à jour garde les mêmes nœuds (l\'animation d\'entrée ne rejoue pas) ; d\'autres étapes les rebâtissent', () => {
        const { C, document } = monterComposant();
        const nav = document.getElementById('a');
        C.dessiner(nav, TROIS());
        const avant = nav.querySelector('[data-etape="deux"]');
        const etapes = TROIS();
        etapes[1].info = '100 %';
        C.dessiner(nav, etapes);
        expect(nav.querySelector('[data-etape="deux"]')).toBe(avant);
        expect(avant.querySelector('.bc-info').textContent).toBe('100 %');
        C.dessiner(nav, [{ id: 'seule', libelle: 'Seule' }]);
        expect(nav.querySelectorAll('.bc-etape')).toHaveLength(1);
        expect(nav.querySelectorAll('.bc-liaison')).toHaveLength(0);
    });

    it('C.h l\'option : afficherToutes(false) pose la classe qui masque, afficherToutes(true) la retire', () => {
        const { C, document } = monterComposant();
        C.afficherToutes(false);
        expect(document.body.classList.contains(C.CLASSE_MASQUEE)).toBe(true);
        C.afficherToutes(true);
        expect(document.body.classList.contains(C.CLASSE_MASQUEE)).toBe(false);
        // La règle de styles.css vise toutes les chaînes, celle du Trimestre comprise.
        const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
        expect(css).toMatch(new RegExp('body\\.' + C.CLASSE_MASQUEE + ' \\.barre-convergence \\{\\s*display: none;'));
    });
});

/* ======================================================= G — LA CHAÎNE DE LA GRILLE */

let G;
beforeAll(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const document = dom.window.document;
    const db = { getSync: (k, d) => d, setSync() {}, get: async () => null, set: async () => {}, modifier: async () => undefined };
    const cle = (k) => 'a2032_' + k;
    const win = {};
    chargerScript('js/gabarits-utils.js', { db, cle, echapperHtml: (t) => String(t == null ? '' : t) }, win);
    win.uiDialogues = { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true };
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml: (t) => String(t == null ? '' : t), alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        grilleTemplateActuelle: null
    }, win);
    G = win;
});

const cr = (nom, ponderation, type = 'holistique') => ({ id: 'CR_' + nom, nom, ponderation, type });
const etape = (etapes, id) => etapes.find(e => e.id === id);

describe('#1149 · G — les trois étapes d\'une grille (fonction pure)', () => {
    it('G.a l\'ordre, les libellés, le point d\'arrivée', () => {
        const e = G.etapesChaineGrille([cr('A', 100)], [], 'G1');
        expect(e.map(x => [x.id, x.libelle, !!x.arrivee])).toEqual([
            ['criteres', 'Critères', false], ['ponderation', 'Pondération', false], ['production', 'Production', true]]);
    });

    it('G.b Critères : aucun critère, un critère sans nom, un critère, cinq critères', () => {
        expect(etape(G.etapesChaineGrille([], [], 'G1'), 'criteres')).toMatchObject({ reglee: false, info: 'aucun' });
        expect(etape(G.etapesChaineGrille([cr('  ', 100)], [], 'G1'), 'criteres')).toMatchObject({ reglee: false, info: 'aucun' });
        expect(etape(G.etapesChaineGrille([cr('', 50), cr('B', 50)], [], 'G1'), 'criteres')).toMatchObject({ reglee: true, info: '1 critère' });
        const cinq = ['A', 'B', 'C', 'D', 'E'].map(n => cr(n, 20));
        expect(etape(G.etapesChaineGrille(cinq, [], 'G1'), 'criteres')).toMatchObject({ reglee: true, info: '5 critères' });
    });

    it('G.c Pondération : 100 % réglée ; 85 % en attention ; 110 % critique ; l\'espace insécable de #1137', () => {
        const p = (criteres) => etape(G.etapesChaineGrille(criteres, [], 'G1'), 'ponderation');
        expect(p([cr('A', 60), cr('B', 40)])).toMatchObject({ reglee: true, info: '100 %', ton: '' });
        expect(p([cr('A', 60), cr('B', 25)])).toMatchObject({ reglee: false, info: '85 %', ton: 'attention' });
        expect(p([cr('A', 60), cr('B', 50)])).toMatchObject({ reglee: false, info: '110 %', ton: 'critique' });
        expect(p([])).toMatchObject({ reglee: false, info: '0 %', ton: 'attention' });
    });

    it('G.d Pondération : une grille entièrement en points est réglée, « en points », quel que soit son total', () => {
        const p = etape(G.etapesChaineGrille([cr('A', 7, 'analytique'), cr('B', 30, 'analytique')], [], 'G1'), 'ponderation');
        expect(p).toMatchObject({ reglee: true, info: 'en points', ton: '' });
        // Une grille mixte garde ses « % ».
        expect(etape(G.etapesChaineGrille([cr('A', 7, 'analytique'), cr('B', 30)], [], 'G1'), 'ponderation'))
            .toMatchObject({ reglee: false, info: '37 %' });
    });

    it('G.e Production : zéro, une, deux productions de CETTE grille ; aucune en création', () => {
        const prods = [{ id: 'P1', grilleId: 'G1' }, { id: 'P2', grilleId: 'G2' }, { id: 'P3', grilleId: 'G1' }, null];
        expect(etape(G.etapesChaineGrille([], [], 'G1'), 'production')).toMatchObject({ reglee: false, info: 'aucune' });
        expect(etape(G.etapesChaineGrille([], prods, 'G2'), 'production')).toMatchObject({ reglee: true, info: '1 prod.' });
        expect(etape(G.etapesChaineGrille([], prods, 'G1'), 'production')).toMatchObject({ reglee: true, info: '2 prod.' });
        expect(etape(G.etapesChaineGrille([], prods, null), 'production')).toMatchObject({ reglee: false, info: 'aucune' });
    });

    it('G.f la règle unique : la somme de l\'avertissement (parseInt), les trois états', () => {
        expect(G.etatPonderation([cr('A', '60'), cr('B', 40)])).toEqual({ total: 100, enPoints: false, reglee: true, enDessous: false, auDessus: false });
        expect(G.etatPonderation([cr('A', 12.5), cr('B', 87.5)]).total).toBe(99);   // parseInt : mesuré, non changé (§ 2.6)
        expect(G.etatPonderation([cr('A', null), cr('B', 85)])).toMatchObject({ total: 85, enDessous: true });
        expect(G.etatPonderation(undefined)).toMatchObject({ total: 0, enDessous: true });
    });

    it('G.g grilles.js n\'additionne plus les pondérations qu\'à un seul endroit', () => {
        const src = readFileSync(path.join(racine, 'js/grilles.js'), 'utf8');
        expect(src.match(/\.reduce\([^\n]*ponderation/g)).toHaveLength(1);
    });
});
