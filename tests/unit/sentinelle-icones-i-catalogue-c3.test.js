/**
 * SENTINELLE — les icônes « i » de la Conception qui désignent une clé du CATALOGUE.
 *
 * Relecture de Cowork du 17 oct. 2026 (VERDICT-RELECTURE-2026-10-17-apporter-mon-materiel-6-et-5b.md, C3) :
 * `gererClicPrimo` (accompagnement.js) ne cherchait que `document.getElementById(data-target)`. Six
 * cibles (`grille-type-critere-detail`, `grille-niveau-solo`, `echelle-valeur-ponctuelle`,
 * `echelle-plage-notes`, `retroaction-grille-descriptive`, `categories-selection-obligatoires`) ne
 * sont l'identifiant d'aucun élément : ce sont des clés de accompagnement-contenu-popup.js. Dix
 * icônes n'ouvraient rien. Repli : la clé au catalogue → `afficherAideContextuelle(clé)`.
 *
 * Le VRAI module et le VRAI catalogue, dans une fenêtre jsdom ; un vrai clic.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const CLES = ['grille-type-critere-detail', 'grille-niveau-solo', 'echelle-valeur-ponctuelle',
    'echelle-plage-notes', 'retroaction-grille-descriptive', 'categories-selection-obligatoires'];

let win;
beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body>' +
        CLES.map(c => '<span class="primo-aide" data-target="' + c + '">i</span>').join('') +
        '<div id="une-note"><p>Note locale.</p></div><span class="primo-aide" data-target="une-note">i</span>' +
        '<span class="primo-aide" data-target="ni-element-ni-cle">i</span></body></html>', { runScripts: 'outside-only' });
    win = dom.window;
    win.console.warn = () => {};
    win.eval(lire('js/accompagnement.js'));
    win.eval(lire('js/accompagnement-contenu-popup.js'));
});

const cliquer = (cible) => win.document.querySelector('.primo-aide[data-target="' + cible + '"]')
    .dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
const modale = () => win.document.querySelector('.aide-contextuelle-modal.active');

describe('C3 — une icône « i » qui désigne une clé du catalogue ouvre son aide', () => {
    it('les six clés n’ont aucun élément de ce nom dans index.html, grilles.js, echelles.js : le repli est leur seul chemin', () => {
        const sources = ['index.html', 'js/grilles.js', 'js/echelles.js'].map(lire).join('\n');
        CLES.forEach((c) => {
            expect(sources, c).toContain('data-target="' + c + '"');
            expect(sources, c).not.toContain('id="' + c + '"');
        });
    });

    it('chacune ouvre l’aide contextuelle de sa clé, avec son titre', () => {
        CLES.forEach((c) => {
            cliquer(c);
            expect(modale(), c).not.toBeNull();
            expect(modale().querySelector('#aide-ctx-titre').textContent.trim(), c).not.toBe('');
            win.fermerAideContextuelle();
        });
        cliquer('grille-type-critere-detail');
        expect(modale().querySelector('#aide-ctx-titre').textContent).toContain('Type de critère d’évaluation');
        expect(modale().textContent).toContain('Algorithmique');
    });

    it('le reste est inchangé : un élément présent ouvre la popup Primo ; ni élément ni clé n’ouvre rien', () => {
        cliquer('une-note');
        expect(win.document.querySelector('#primo-popup.active .primo-popup-body').textContent).toContain('Note locale.');
        expect(modale()).toBeNull();
        win.fermerPopupPrimo();
        cliquer('ni-element-ni-cle');
        expect(modale()).toBeNull();
        expect(win.document.querySelector('#primo-popup.active')).toBeNull();
    });
});
