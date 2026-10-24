/**
 * #1147 (24 oct. 2026) — LE MENU DE LA SÉLECTION (js/menu-selection.js), qui remplace la barre latérale des
 * cinq bibliothèques de la Conception. Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-bibliotheques-menu-conception.md.
 *
 * Ce que ce banc verrouille, sur le module réel, dans un vrai DOM (JSDOM) :
 *   O — LES OPTIONS : la sélection dans l'ordre reçu, le nom seul ; « Aucune … ouverte » en tête, non choisissable,
 *       choisie quand aucune fiche n'est ouverte ; l'objet ouvert, choisi.
 *   E — L'ÉTAT : « (active) » après le nom, et seulement sur l'objet qui le porte.
 *   V — LA SÉLECTION VIDE : la phrase de l'écran, aucun menu.
 *   C — LE CHOIX : il appelle l'ouverture de l'écran avec l'identifiant tel qu'il est rangé ; une ouverture
 *       refusée ramène le menu à la fiche d'avant ; `marquer(null)` revient à « Aucune … ouverte ».
 *   X — UN NOM PIÉGÉ (`<img onerror>`) reste du texte, dans l'option comme dans l'identifiant.
 *
 * Noms fictifs.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CODE = readFileSync(path.join(racine, 'js/menu-selection.js'), 'utf8');
const echapperHtml = (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
const PIEGE = '<img src=x onerror="window.__pirate=1">';

let dom, doc, win, M, emplacement;
beforeEach(() => {
    dom = new JSDOM('<!doctype html><div id="selectionGrilles"></div>');
    doc = dom.window.document;
    win = {};
    new Function('window', 'document', 'echapperHtml', '"use strict";\n' + CODE)(win, doc, echapperHtml);
    M = win.MenuSelection;
    emplacement = doc.getElementById('selectionGrilles');
});

const GRILLES = [{ id: 'G1', nom: 'Dissertation' }, { id: 'G2', nom: 'Exposé oral' }, { id: 'G3', nom: '' }];
const options = () => [...doc.getElementById('menuGrilles').options];
const rendre = (o = {}) => M.rendre(emplacement, Object.assign({
    idMenu: 'menuGrilles', elements: GRILLES, idOuvert: null,
    libelleAucun: 'Aucune grille ouverte', libelleMenu: 'Grille ouverte',
    phraseVide: 'Crée une nouvelle grille ou puise dans la bibliothèque', ouvrir: async () => {}
}, o));

describe('#1147 · O — les options', () => {
    it('O.a la sélection dans l\'ordre reçu, le nom seul ; « Sans titre » pour un nom vide', () => {
        rendre();
        expect(options().map(o => o.textContent)).toEqual(['Aucune grille ouverte', 'Dissertation', 'Exposé oral', 'Sans titre']);
        expect(options().map(o => o.value)).toEqual(['', 'G1', 'G2', 'G3']);
    });

    it('O.b aucune fiche ouverte : « Aucune grille ouverte » est choisie, et ne se choisit pas', () => {
        rendre();
        const menu = doc.getElementById('menuGrilles');
        expect(menu.selectedIndex).toBe(0);
        expect(options()[0].disabled).toBe(true);
        expect(menu.dataset.ouvert).toBe('');
    });

    it('O.c la fiche ouverte est choisie ; un objet absent de la sélection revient à « Aucune … »', () => {
        rendre({ idOuvert: 'G2' });
        expect(doc.getElementById('menuGrilles').value).toBe('G2');
        rendre({ idOuvert: 'G9' });
        expect(doc.getElementById('menuGrilles').selectedIndex).toBe(0);
    });

    it('O.d le menu porte son étiquette (lecteur d\'écran) et passe par le dispatcher, sans gestionnaire en ligne', () => {
        rendre();
        const menu = doc.getElementById('menuGrilles');
        expect(doc.querySelector('label[for="menuGrilles"]').textContent).toBe('Grille ouverte');
        expect(menu.getAttribute('data-on-change')).toBe('MenuSelection.choisir');
        expect(emplacement.innerHTML).not.toMatch(/\son[a-z]+=/i);
    });
});

describe('#1147 · E — l\'état après le nom', () => {
    it('E.a « (active) » sur la seule pratique qui le porte', () => {
        rendre({ elements: [{ id: 'P1', nom: 'Standards' }, { id: 'P2', nom: 'Sommative', suffixe: '(active)' }] });
        expect(options().map(o => o.textContent)).toEqual(['Aucune grille ouverte', 'Standards', 'Sommative (active)']);
    });
});

describe('#1147 · V — la sélection vide', () => {
    it('V.a la phrase de l\'écran, aucun menu', () => {
        rendre({ elements: [] });
        expect(doc.getElementById('menuGrilles')).toBeNull();
        expect(emplacement.querySelector('.rangee-selection-vide').textContent).toBe('Crée une nouvelle grille ou puise dans la bibliothèque');
    });
});

describe('#1147 · C — le choix', () => {
    it('C.a choisir appelle l\'ouverture de l\'écran avec l\'identifiant tel qu\'il est rangé (un nombre reste un nombre)', async () => {
        const recus = [];
        rendre({ elements: [{ id: 7, nom: 'Ancienne' }, { id: 'G2', nom: 'Exposé oral' }],
                 ouvrir: async (id) => { recus.push(id); M.marquer('menuGrilles', id); } });
        const menu = doc.getElementById('menuGrilles');
        menu.value = '7';
        await M.choisir(menu);
        expect(recus).toEqual([7]);
        expect(menu.value).toBe('7');
    });

    it('C.b une ouverture refusée (création en cours qu\'on garde) ramène le menu à la fiche d\'avant', async () => {
        rendre({ idOuvert: 'G1', ouvrir: async () => {} });
        const menu = doc.getElementById('menuGrilles');
        menu.value = 'G2';
        await M.choisir(menu);
        expect(menu.value).toBe('G1');
    });

    it('C.c l\'ouverture qui redessine le menu : c\'est le menu en place qui est relu', async () => {
        rendre({ ouvrir: async (id) => rendre({ idOuvert: id }) });
        const ancien = doc.getElementById('menuGrilles');
        ancien.value = 'G2';
        await M.choisir(ancien);
        expect(doc.getElementById('menuGrilles')).not.toBe(ancien);
        expect(doc.getElementById('menuGrilles').value).toBe('G2');
    });

    it('C.d marquer(null) — « Fermer » — revient à « Aucune grille ouverte »', () => {
        rendre({ idOuvert: 'G1' });
        M.marquer('menuGrilles', null);
        const menu = doc.getElementById('menuGrilles');
        expect(menu.selectedIndex).toBe(0);
        expect(menu.dataset.ouvert).toBe('');
    });
});

describe('#1147 · X — un nom piégé reste du texte', () => {
    it('X.a dans l\'option et dans l\'identifiant', () => {
        rendre({ elements: [{ id: '"><img src=x onerror="window.__pirate=1">', nom: PIEGE }] });
        expect(emplacement.querySelector('img')).toBeNull();
        expect(options()[1].textContent).toBe(PIEGE);
        expect(options()[1].value).toBe('"><img src=x onerror="window.__pirate=1">');
        expect(emplacement.innerHTML).toContain('&lt;img');
    });

    it('X.b dans la phrase de la sélection vide et les libellés', () => {
        rendre({ elements: [], phraseVide: PIEGE });
        expect(emplacement.querySelector('img')).toBeNull();
        rendre({ libelleAucun: PIEGE, libelleMenu: PIEGE });
        expect(emplacement.querySelector('img')).toBeNull();
        expect(options()[0].textContent).toBe(PIEGE);
    });
});
