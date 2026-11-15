/**
 * #1280 — LES DERNIÈRES ACTIONS DU RAPPORT DE BOGUE SONT CELLES D'AVANT LE SIGNALEMENT (12 nov. 2026).
 *
 * Constat (rapport envoyé de l'iPad le 10 nov., en 1.241.0) : sur 20 « dernières actions », 19
 * venaient de la fenêtre du rapport elle-même (18 clics sur `#descriptionBug`, 1 sur
 * `#btnTelechargerTxt`). L'écouteur de clics posé sur `document` notait tout, et le tampon tournant
 * de 20 perdait ce qui avait été fait avant le signalement.
 *
 * Ce banc verrouille le filtre de l'écouteur (rapport-bug.js) :
 *   A — des actions hors de la fenêtre, puis 25 clics dedans : celles d'avant sont toutes là, et
 *       aucune ligne ne vient de la fenêtre ;
 *   B — le clic qui ouvre la fenêtre, fait hors d'elle, reste et ferme le journal ;
 *   C — `clicDansFenetreRapport` : toute la fenêtre, pas le seul champ ; prudente devant une cible
 *       sans `closest` ;
 *   D — l'écouteur passe par elle (lecture du source).
 *
 * Break-test (12 nov.) : retirer la ligne du filtre dans l'écouteur rougit A, B et D.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(path.join(racine, 'js/rapport-bug.js'), 'utf8');

const PAGE = `<!doctype html><html><body>
    <button id="btn-avant-1">a</button>
    <button id="btn-avant-2">b</button>
    <button id="btn-avant-3">c</button>
    <button id="btnSignaler" data-action="ouvrirModalRapportBug">Signaler</button>
    <div id="modalRapportBug" class="modal-overlay actif">
        <div class="modal-contenu">
            <input type="radio" id="modeCommentaire" name="mode">
            <textarea id="descriptionBug"></textarea>
            <button id="btnTelechargerTxt"><span class="libelle">Enregistrer</span></button>
        </div>
    </div>
</body></html>`;

let w;
beforeEach(() => {
    const dom = new JSDOM(PAGE, { runScripts: 'outside-only' });
    w = dom.window;
    // Le tampon est un `const` de l'IIFE du module : le banc le sort par une ligne glissée avant la
    // fermeture, sans rien exposer dans l'app. Si la fermeture change de forme, le banc le dit.
    const instrumente = source.replace(/\}\)\(\);\s*$/, 'window.__journalDuBanc = dernieresActions;\n})();');
    if (instrumente === source) throw new Error('fermeture de l\'IIFE de rapport-bug.js introuvable');
    w.eval(instrumente);
});

const cliquer = (selecteur) => {
    const el = w.document.querySelector(selecteur);
    el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
};
const journal = () => w.__journalDuBanc.map(a => a.details);

describe('#1280 — les clics de la fenêtre du rapport ne chassent pas les actions d\'avant', () => {
    it('A — trois actions, l\'ouverture, puis 25 clics dans la fenêtre : celles d\'avant sont toutes là', () => {
        cliquer('#btn-avant-1');
        cliquer('#btn-avant-2');
        cliquer('#btn-avant-3');
        cliquer('#btnSignaler');
        for (let i = 0; i < 18; i++) cliquer('#descriptionBug');
        for (let i = 0; i < 3; i++) cliquer('#modeCommentaire');
        for (let i = 0; i < 2; i++) cliquer('#btnTelechargerTxt .libelle');
        cliquer('#modalRapportBug');
        cliquer('.modal-contenu');

        expect(journal()).toEqual([
            '#btn-avant-1',
            '#btn-avant-2',
            '#btn-avant-3',
            '#btnSignaler [ouvrirModalRapportBug]'
        ]);
    });

    it('B — le clic qui ouvre la fenêtre reste, en dernier', () => {
        cliquer('#btnSignaler');
        cliquer('#descriptionBug');
        const j = journal();
        expect(j).toHaveLength(1);
        expect(j[0]).toContain('ouvrirModalRapportBug');
    });

    it('C — clicDansFenetreRapport : toute la fenêtre, et rien hors d\'elle', () => {
        const q = (s) => w.document.querySelector(s);
        expect(w.clicDansFenetreRapport(q('#descriptionBug'))).toBe(true);
        expect(w.clicDansFenetreRapport(q('#btnTelechargerTxt .libelle'))).toBe(true);
        expect(w.clicDansFenetreRapport(q('#modalRapportBug'))).toBe(true);
        expect(w.clicDansFenetreRapport(q('#btnSignaler'))).toBe(false);
        expect(w.clicDansFenetreRapport(w.document)).toBe(false);   // pas de `closest` sur le document
        expect(w.clicDansFenetreRapport(null)).toBe(false);
    });

    it('D — l\'écouteur des clics écarte la fenêtre avant d\'enregistrer', () => {
        const corps = tranche(source, "document.addEventListener('click'", '}, true);');
        const filtre = corps.indexOf('if (clicDansFenetreRapport(event.target)) return;');
        expect(filtre).toBeGreaterThan(-1);
        expect(filtre).toBeLessThan(corps.indexOf('enregistrerAction('));
    });
});
