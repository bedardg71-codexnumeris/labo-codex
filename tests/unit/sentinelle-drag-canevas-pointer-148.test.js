import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

// Sentinelle statique — bug #148 (8 août 2026), le CANEVAS était resté souris.
//
// #144 (11 juin) avait converti les PALETTES en Pointer Events ; le canevas de
// la Carte d'alignement, lui, écoutait encore mousedown/mousemove/mouseup —
// 27 listeners. Sur iPad : aucun nœud ne se déplaçait (« la leçon suit
// toujours »), deux blocs empilés étaient indissociables, aucun lien ne se
// créait au doigt. Le code le SAVAIT — deux commentaires des 6-7 août nomment
// « le tactile du canevas » comme porte ouverte — mais aucun item BACKLOG ne
// la portait. Cette sentinelle est le cliquet : le fichier est 100 % Pointer
// Events, et il le reste.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const carte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

describe('sentinelle · glisser du canevas en Pointer Events (#148)', () => {

    it('RATCHET — plus AUCUN listener souris down/move/up dans planification-carte.js', () => {
        // La régression à empêcher n'est pas un site précis : c'est le retour
        // du PATRON. Un seul addEventListener('mousedown') réintroduit une
        // surface morte au toucher. (mouseenter/mouseleave restent permis :
        // le survol est un enrichissement, pas un geste.)
        expect(carte).not.toMatch(/addEventListener\('mouse(down|move|up)'/);
    });

    it('l’entrée du drag de nœud est pointerdown, gardée isPrimary', () => {
        const debut = carte.indexOf('function attacherEvenements(');
        expect(debut).toBeGreaterThan(-1);
        const bloc = carte.slice(debut, debut + 2600);
        expect(bloc).toContain("el.addEventListener('pointerdown'");
        expect(bloc).toMatch(/if \(!e\.isPrimary \|\| e\.button > 0\) return;/);
    });

    it('chaque flux document a son pointercancel — Safari annule, on nettoie', () => {
        // Sans pointercancel, un drag interrompu (Safari reprend le geste,
        // appel entrant, changement d’app) laisserait des listeners morts et
        // un bloc « collé au doigt ». Un cancel par pointerup, strictement.
        const ups = (carte.match(/document\.addEventListener\('pointerup'/g) || []).length;
        const cancels = (carte.match(/document\.addEventListener\('pointercancel'/g) || []).length;
        expect(ups).toBeGreaterThan(0);
        expect(cancels).toBe(ups);
    });

    it('le multi-toucher ne vole pas le drag — les handlers filtrent par pointerId', () => {
        // Un second doigt posé pendant un drag émet ses propres pointermove
        // sur document : sans filtre, le bloc suivrait les DEUX doigts.
        const filtres = (carte.match(/pointerId !== pid/g) || []).length;
        expect(filtres).toBeGreaterThanOrEqual(12);
    });

    it('le doublon ⌥ se re-saisit par un PointerEvent, pas un MouseEvent', () => {
        // L’entrée écoutant pointerdown, un MouseEvent('mousedown') synthétique
        // tomberait dans le vide : le clone naîtrait immobile sous le curseur.
        expect(carte).toContain("new PointerEvent('pointerdown'");
        expect(carte).not.toContain("new MouseEvent('mousedown'");
    });

    it('le lasso reste souris-seulement PAR DÉCISION — pointerType, pas un oubli d’API', () => {
        // Au doigt, glisser sur le fond doit rester le défilement natif du
        // canevas. La garde dit l’intention ; l’ancien mousedown la cachait.
        expect(suitDansLaFonction(carte, /espace\.addEventListener\('pointerdown'/, /pointerType !== 'mouse'\) return;/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('touch-action:none sur les surfaces de drag — sans lui, tout ceci est mort', () => {
        // Safari iPad cède le geste au défilement natif et envoie pointercancel
        // AVANT le premier pointermove : le JS est correct et il ne se passe
        // rien. C’est la moitié CSS du correctif, elle se teste aussi.
        const noeud = css.match(/\.planif-noeud \{[^}]*\}/);
        expect(noeud).not.toBeNull();
        expect(noeud[0]).toContain('touch-action: none');

        const poignee = css.match(/\.planif-lien-poignee \{[^}]*\}/);
        expect(poignee).not.toBeNull();
        expect(poignee[0]).toContain('touch-action: none');

        const barre = css.match(/\.planif-guide-barre \{[^}]*\}/);
        expect(barre).not.toBeNull();
        expect(barre[0]).toContain('touch-action: none');
    });

    it('les gardes d’interception (badge 🎯, boutons +/−) parlent pointerdown', () => {
        // L’entrée du drag étant pointerdown, une garde mousedown-seulement
        // laisserait le toucher du badge DÉMARRER un déplacement de bloc.
        const badge = carte.indexOf("badgeObjectif.addEventListener('pointerdown'");
        expect(badge).toBeGreaterThan(-1);
        const btn = carte.indexOf("btn.addEventListener('pointerdown'");
        expect(btn).toBeGreaterThan(-1);
    });
});
