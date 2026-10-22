/**
 * #1075, POINT 10 — LE RAPPORT DE BOGUE NE GARDE PAS LE TEXTE CLIQUÉ (22 oct. 2026).
 *
 * Constat : l'historique des actions gardait les 30 premiers caractères du texte de chaque élément
 * cliqué (`target.textContent?.substring(0, 30)`). Un nom d'élève cliqué dans une liste y entrait,
 * hors mode anonymisé, et partait avec le rapport (copié, enregistré ou envoyé par courriel).
 *
 * Ce banc verrouille `decrireElementClique` (rapport-bug.js) :
 *   A — ni le nom ni le texte d'un élément cliqué n'entrent dans la description ;
 *   B — ce qui reste dit l'élément : id, première classe, `data-action` le plus proche ;
 *   C — un DA porté par un id est masqué (suite de 5 chiffres ou plus) ;
 *   D — l'écouteur des clics ne passe que par elle (lecture du source).
 *
 * Break-test (22 oct.) : remettre l'ajout du texte dans `decrireElementClique` rougit A1 et A2 ;
 * retirer le masquage rougit C.
 *
 * Noms et DA FICTIFS.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(path.join(racine, 'js/rapport-bug.js'), 'utf8');

let w;
beforeAll(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
    w = dom.window;
    w.eval(source);
});

function element(html) {
    const hote = w.document.createElement('div');
    hote.innerHTML = html;
    w.document.body.appendChild(hote);
    return hote.querySelector('[data-cible]');
}

describe('#1075, point 10 — decrireElementClique', () => {
    it('A1 — le nom d\'un élève cliqué dans une liste n\'entre pas', () => {
        const el = element('<ul><li class="ligne-etudiant" data-action="ouvrirProfil"><span data-cible>Zébulon Fictif</span></li></ul>');
        const d = w.decrireElementClique(el);
        expect(d).not.toMatch(/Zébulon|Fictif/);
    });

    it('A2 — le texte d\'un bouton n\'entre pas non plus', () => {
        const el = element('<button id="btn-x" data-cible>Supprimer Zébulon</button>');
        expect(w.decrireElementClique(el)).toBe('#btn-x');
    });

    it('B — l\'élément est dit : id, sinon classe, et l\'action la plus proche', () => {
        expect(w.decrireElementClique(element('<li class="ligne-etudiant extra" data-action="ouvrirProfil"><span class="nom" data-cible>Zébulon</span></li>')))
            .toBe('.nom [ouvrirProfil]');
        expect(w.decrireElementClique(element('<p><em data-cible>x</em></p>'))).toBe('em');
    });

    it('C — un DA porté par un id est masqué', () => {
        const d = w.decrireElementClique(element('<div id="etu-1234567" data-cible>Zébulon</div>'));
        expect(d).toBe('#etu-#');
        expect(d).not.toMatch(/1234567/);
    });

    it('D — l\'écouteur des clics ne lit aucun texte', () => {
        const corps = tranche(source, "document.addEventListener('click'", '}, true);');
        expect(corps).toContain('decrireElementClique(event.target)');
        expect(corps).not.toMatch(/textContent|innerText/);
        const fn = tranche(source, 'function decrireElementClique', "document.addEventListener('click'");
        expect(fn).not.toMatch(/textContent|innerText|\.value\b/);
    });
});
