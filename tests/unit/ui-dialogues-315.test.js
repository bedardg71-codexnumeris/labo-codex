import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #315 / #316 — modale async réutilisable (uiDialogues.confirmerAction / demanderSaisie).
//
// L'environnement Vitest est `node` (pas jsdom) : on monte un faux DOM minimal mais
// FONCTIONNEL (appendChild, addEventListener, simulation de clic/touche) pour vérifier
// réellement la résolution des Promises — pas seulement « ne plante pas ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// --- Faux DOM ---------------------------------------------------------------
let registre;   // tous les éléments créés (pour retrouver les boutons par texte)
let doc;

function fabriquerElement(tag) {
    const el = {
        tagName: String(tag).toUpperCase(),
        className: '', id: '', value: undefined, textContent: '', style: {},
        _attrs: {}, _listeners: {}, children: [], parent: null,
        setAttribute(k, v) { this._attrs[k] = String(v); },
        getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; },
        appendChild(child) { child.parent = this; this.children.push(child); return child; },
        addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
        removeEventListener(type, fn) {
            if (this._listeners[type]) this._listeners[type] = this._listeners[type].filter(f => f !== fn);
        },
        remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; },
        focus() { doc.activeElement = this; },
        select() { this._selectionne = true; }
    };
    registre.push(el);
    return el;
}

function reinitialiserDom() {
    registre = [];
    doc = {
        activeElement: null,
        _listeners: {},
        createElement: (tag) => fabriquerElement(tag),
        addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
        removeEventListener(type, fn) {
            if (this._listeners[type]) this._listeners[type] = this._listeners[type].filter(f => f !== fn);
        }
    };
    doc.body = fabriquerElement('body');
}

// Charge le module avec le faux window/document (l'IIFE écrit window.uiDialogues).
function chargerUiDialogues() {
    const code = readFileSync(path.join(racine, 'js', 'ui-dialogues.js'), 'utf8');
    const fauxWindow = {};
    new Function('window', 'document', code)(fauxWindow, doc);
    return fauxWindow.uiDialogues;
}

// Helpers de simulation
const bouton = (texte) => registre.find(e => e.tagName === 'BUTTON' && e.textContent === texte);
const cliquer = (el) => (el._listeners.click || []).forEach(fn => fn({ target: el }));
const overlay = () => registre.find(e => e._attrs.role === 'presentation');
const champSaisie = () => registre.find(e => e.id === 'ui-dialogue-saisie');
const touche = (key) => (doc._listeners.keydown || []).forEach(fn => fn({ key, preventDefault() {} }));

let uiDialogues;
beforeEach(() => {
    reinitialiserDom();
    uiDialogues = chargerUiDialogues();
});

describe('#315 · uiDialogues.confirmerAction', () => {
    it('clic « Confirmer » → résout true', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'Supprimer', message: 'Sûr ?', texteConfirmer: 'Supprimer' });
        cliquer(bouton('Supprimer'));
        await expect(p).resolves.toBe(true);
    });

    it('clic « Annuler » → résout false', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'X' });
        cliquer(bouton('Annuler'));
        await expect(p).resolves.toBe(false);
    });

    it('Échap → false ; Entrée → true', async () => {
        const p1 = uiDialogues.confirmerAction({ titre: 'X' });
        touche('Escape');
        await expect(p1).resolves.toBe(false);

        reinitialiserDom(); uiDialogues = chargerUiDialogues();
        const p2 = uiDialogues.confirmerAction({ titre: 'X' });
        touche('Enter');
        await expect(p2).resolves.toBe(true);
    });

    it('clic sur l\'overlay (hors modale) → false', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'X' });
        const ov = overlay();
        (ov._listeners.click || []).forEach(fn => fn({ target: ov }));
        await expect(p).resolves.toBe(false);
    });

    it('variante danger : bouton destructif (btn-supprimer) + focus sur Annuler', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'X', texteConfirmer: 'Supprimer', variante: 'danger' });
        expect(bouton('Supprimer').className).toContain('btn-supprimer');
        expect(doc.activeElement).toBe(bouton('Annuler')); // l'option SÛRE a le focus
        cliquer(bouton('Annuler'));
        await p;
    });

    it('referme l\'overlay et rend le focus à l\'élément précédent', async () => {
        const precedent = fabriquerElement('button');
        doc.activeElement = precedent;
        const p = uiDialogues.confirmerAction({ titre: 'X' });
        expect(doc.body.children.length).toBe(1); // overlay monté
        cliquer(bouton('Confirmer'));
        await p;
        expect(doc.body.children.length).toBe(0);   // overlay retiré
        expect(doc.activeElement).toBe(precedent);  // focus restauré
        expect((doc._listeners.keydown || []).length).toBe(0); // listener clavier nettoyé
    });

    it('clics multiples ne résolvent qu\'une fois (idempotent)', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'X' });
        cliquer(bouton('Confirmer'));
        cliquer(bouton('Annuler')); // après coup : ignoré
        await expect(p).resolves.toBe(true);
    });
});

describe('#316 · uiDialogues.demanderSaisie', () => {
    it('saisie + OK → résout la chaîne', async () => {
        const p = uiDialogues.demanderSaisie({ titre: 'Nom', message: 'Entre un nom' });
        champSaisie().value = 'Dossier A';
        cliquer(bouton('OK'));
        await expect(p).resolves.toBe('Dossier A');
    });

    it('#1037 · variante danger : le bouton d\'action est destructif ; sans elle, principal', async () => {
        const p = uiDialogues.demanderSaisie({ titre: 'X', texteConfirmer: 'Supprimer', variante: 'danger' });
        expect(bouton('Supprimer').className).toContain('btn-supprimer');
        expect(bouton('Supprimer').className).not.toContain('btn-principal');
        cliquer(bouton('Annuler'));
        await p;
    });

    it('#1037 · sans variante, le bouton d\'action reste principal', async () => {
        const p = uiDialogues.demanderSaisie({ titre: 'X' });
        expect(bouton('OK').className).toContain('btn-principal');
        champSaisie().value = 'y';
        cliquer(bouton('OK'));
        await expect(p).resolves.toBe('y');
    });

    it('valeur initiale pré-remplie ; Entrée la renvoie', async () => {
        const p = uiDialogues.demanderSaisie({ titre: 'X', valeurInitiale: 'prérempli' });
        expect(champSaisie().value).toBe('prérempli');
        touche('Enter');
        await expect(p).resolves.toBe('prérempli');
    });

    it('Annuler → null (contrat prompt) ; Échap → null', async () => {
        const p1 = uiDialogues.demanderSaisie({ titre: 'X' });
        cliquer(bouton('Annuler'));
        await expect(p1).resolves.toBeNull();

        reinitialiserDom(); uiDialogues = chargerUiDialogues();
        const p2 = uiDialogues.demanderSaisie({ titre: 'X' });
        touche('Escape');
        await expect(p2).resolves.toBeNull();
    });

    it('multiligne : Entrée n\'envoie PAS (textarea), OK envoie', async () => {
        const p = uiDialogues.demanderSaisie({ titre: 'X', multiligne: true });
        expect(champSaisie().tagName).toBe('TEXTAREA');
        touche('Enter'); // ignoré en multiligne
        champSaisie().value = 'ligne1\nligne2';
        cliquer(bouton('OK'));
        await expect(p).resolves.toBe('ligne1\nligne2');
    });
});

describe('#315 · option preformate (résumés multi-lignes)', () => {
    it('preformate pose white-space: pre-wrap sur le message (préserve les \\n)', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'X', message: 'ligne1\nligne2', preformate: true });
        const para = registre.find(e => e.tagName === 'P');
        expect(para.style.whiteSpace).toBe('pre-wrap');
        expect(para.textContent).toBe('ligne1\nligne2');
        cliquer(bouton('Annuler'));
        await p;
    });
});

describe('#316 · uiDialogues.informer', () => {
    it('un seul bouton ; clic « Fermer » → résout (void)', async () => {
        const p = uiDialogues.informer({ titre: 'Détails', message: 'a\nb', preformate: true });
        expect(bouton('Annuler')).toBeUndefined(); // pas de bouton d'annulation
        const para = registre.find(e => e.tagName === 'P');
        expect(para.style.whiteSpace).toBe('pre-wrap');
        cliquer(bouton('Fermer'));
        await expect(p).resolves.toBeUndefined();
    });

    it('Échap et Entrée ferment', async () => {
        const p1 = uiDialogues.informer({ titre: 'X' });
        touche('Escape');
        await p1;
        reinitialiserDom(); uiDialogues = chargerUiDialogues();
        const p2 = uiDialogues.informer({ titre: 'X' });
        touche('Enter');
        await p2;
        expect(doc.body.children.length).toBe(0);
    });
});

describe('#315 · sécurité (XSS)', () => {
    it('le message est posé en textContent (jamais interprété comme HTML)', async () => {
        const charge = '<img src=x onerror=alert(1)>';
        const p = uiDialogues.confirmerAction({ titre: 'X', message: charge });
        const para = registre.find(e => e.tagName === 'P');
        expect(para.textContent).toBe(charge); // chaîne brute, pas de nœud HTML injecté
        cliquer(bouton('Annuler'));
        await p;
    });
});

// #945 (25 sept. 2026) — ENTRÉE FAIT CE QUE FERAIT LE BOUTON QUI A LE FOCUS.
// Décision technique de Cowork : une confirmation `danger` pose le focus sur « Annuler » ;
// Entrée confirmait quand même la destruction. Focus hors des deux boutons : l'action sûre de
// la variante (danger → annuler ; ordinaire → confirmer, inchangé). Échap annule toujours.
describe('#945 · confirmerAction — Entrée suit le bouton qui a le focus', () => {
    const danger = () => uiDialogues.confirmerAction({ titre: 'Changer de cartouche', message: 'Remplacer ?', texteConfirmer: 'Remplacer', variante: 'danger' });
    const ordinaire = () => uiDialogues.confirmerAction({ titre: 'Continuer', message: 'Sûr ?', texteConfirmer: 'Continuer' });

    it('danger + Entrée (focus de départ sur Annuler) → false', async () => {
        const p = danger();
        expect(doc.activeElement).toBe(bouton('Annuler'));
        touche('Enter');
        await expect(p).resolves.toBe(false);
    });

    it('danger + focus déplacé sur le bouton rouge + Entrée → true', async () => {
        const p = danger();
        bouton('Remplacer').focus();
        touche('Enter');
        await expect(p).resolves.toBe(true);
    });

    it('danger + focus hors des deux boutons + Entrée → false', async () => {
        const p = danger();
        doc.activeElement = doc.body;
        touche('Enter');
        await expect(p).resolves.toBe(false);
    });

    it('ordinaire + Entrée (focus de départ sur Confirmer) → true (inchangé)', async () => {
        const p = ordinaire();
        expect(doc.activeElement).toBe(bouton('Continuer'));
        touche('Enter');
        await expect(p).resolves.toBe(true);
    });

    it('ordinaire + focus hors des deux boutons + Entrée → true (inchangé)', async () => {
        const p = ordinaire();
        doc.activeElement = doc.body;
        touche('Enter');
        await expect(p).resolves.toBe(true);
    });

    it('ordinaire + focus déplacé sur Annuler + Entrée → false', async () => {
        const p = ordinaire();
        bouton('Annuler').focus();
        touche('Enter');
        await expect(p).resolves.toBe(false);
    });

    it('Échap → false partout, même focus sur le bouton rouge', async () => {
        const p1 = danger();
        bouton('Remplacer').focus();
        touche('Escape');
        await expect(p1).resolves.toBe(false);
        reinitialiserDom(); uiDialogues = chargerUiDialogues();
        const p2 = ordinaire();
        touche('Escape');
        await expect(p2).resolves.toBe(false);
    });
});

// Lot E3 (28 sept. 2026) — la case d'une confirmation (`caseACocher`), pour le report des présences
// d'une intervention complétée. Décision de Grégoire : DÉCOCHÉE par défaut ; le choix est à l'usager.
describe('lot E3 · uiDialogues.confirmerAction, option caseACocher', () => {
    const laCase = () => registre.find(e => e.tagName === 'INPUT' && e._attrs.type === 'checkbox');
    const OPTIONS = { titre: 'Marquer cette intervention complétée ?', texteConfirmer: 'Marquer complétée',
        caseACocher: { texte: 'Reporter les présences…', aide: 'Le report se fait une seule fois…' } };

    it('la case naît décochée ; confirmer sans y toucher → { coche: false }', async () => {
        const p = uiDialogues.confirmerAction(OPTIONS);
        expect(laCase()).toBeTruthy();
        expect(laCase().checked).toBe(false);
        expect(registre.some(e => e.textContent === 'Reporter les présences…')).toBe(true);
        expect(registre.some(e => e.textContent === 'Le report se fait une seule fois…')).toBe(true);
        cliquer(bouton('Marquer complétée'));
        await expect(p).resolves.toEqual({ coche: false });
    });

    it('cochée par l\'usager → { coche: true }', async () => {
        const p = uiDialogues.confirmerAction(OPTIONS);
        laCase().checked = true;
        cliquer(bouton('Marquer complétée'));
        await expect(p).resolves.toEqual({ coche: true });
    });

    it('« Annuler » → false, cochée ou non', async () => {
        const p = uiDialogues.confirmerAction(OPTIONS);
        laCase().checked = true;
        cliquer(bouton('Annuler'));
        await expect(p).resolves.toBe(false);
    });

    it('sans l\'option : aucune case, la réponse reste un booléen', async () => {
        const p = uiDialogues.confirmerAction({ titre: 'X' });
        expect(laCase()).toBeUndefined();
        cliquer(bouton('Confirmer'));
        await expect(p).resolves.toBe(true);
    });
});
