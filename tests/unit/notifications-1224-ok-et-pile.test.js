// #1224 (3 nov. 2026) — décision de Grégoire : rouge et orange restent jusqu'à « OK » ;
// vert et info partent seuls ; les messages s'empilent au lieu de se recouvrir.
// Vécu : après l'import des reprises, le vert « 13 fichier(s) importé(s) » s'est posé
// sur le rouge « Jetons non appliqués », qu'il n'a pas eu le temps de lire.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { tranche } from './_helpers/tranche.js';

let document, notifications;

beforeEach(() => {
    vi.useFakeTimers();
    document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    notifications = chargerScript('js/utils-notifications.js', { document }).notifications;
});
afterEach(() => vi.useRealTimers());

const affichees = () => [...document.querySelectorAll('.notification-succes')];

describe('#1224 · rouge et orange restent jusqu\'à « OK »', () => {
    it.each(['erreur', 'warning'])('%s est encore là après une minute, et part au « OK »', (type) => {
        notifications[type]('Jetons non appliqués', 'détail');
        vi.advanceTimersByTime(60000);
        expect(affichees()).toHaveLength(1);
        const ok = affichees()[0].querySelector('button.notification-ok');
        expect(ok && ok.textContent).toBe('OK');
        ok.click();
        vi.advanceTimersByTime(300);
        expect(affichees()).toHaveLength(0);
    });

    it.each(['succes', 'info'])('%s part seul après 3 s, sans bouton', (type) => {
        notifications[type]('13 fichier(s) importé(s)');
        expect(affichees()[0].querySelector('.notification-ok')).toBeNull();
        vi.advanceTimersByTime(2999);
        expect(affichees()).toHaveLength(1);
        vi.advanceTimersByTime(301);
        expect(affichees()).toHaveLength(0);
    });
});

// 20 nov. 2026 (essai de Grégoire sur l'iPad ; consigne, A6) : « Cette cartouche n'est pas encore créée » restait après
// la création et suivait dans « Productions ». Un avis PASSAGER part sans « OK » quand la fiche le retire, et au
// changement de page ; un orange ordinaire, lui, reste (#1224).
describe('A6 (20 nov. 2026) · un avis passager part quand il n\'est plus vrai', () => {
    it('`retirerPassagers` retire l\'avis passager, pas le rouge ni l\'orange ordinaires', () => {
        notifications.warning('Cette cartouche n\'est pas encore créée', 'détail', { passager: true });
        notifications.warning('Grille enregistrée');
        notifications.erreur('Jetons non appliqués');
        expect(affichees()).toHaveLength(3);
        notifications.retirerPassagers();
        vi.advanceTimersByTime(300);
        expect(affichees().map(n => n.querySelector('.notification-texte').textContent))
            .toEqual(['Grille enregistrée', 'Jetons non appliqués']);
    });

    it('au changement de page (`sectionAffichee`), l\'avis passager part aussi', () => {
        // Le module s'abonne à l'événement que js/navigation.js émet à chaque changement de sous-section.
        const dom = new JSDOM('<!doctype html><html><body></body></html>');
        const fenetre = { addEventListener: (t, f) => dom.window.addEventListener(t, f) };
        const n = chargerScript('js/utils-notifications.js', { document: dom.window.document }, fenetre).notifications;
        n.warning('Cette cartouche n\'est pas encore créée', '', { passager: true });
        n.warning('Reste là');
        dom.window.dispatchEvent(new dom.window.CustomEvent('sectionAffichee', { detail: { idSousSection: 'conception-productions' } }));
        vi.advanceTimersByTime(300);
        expect([...dom.window.document.querySelectorAll('.notification-succes .notification-texte')].map(e => e.textContent)).toEqual(['Reste là']);
    });

    it('l\'avis de la cartouche neuve est passager, dit « écris » et « Touche », et se tait pendant un parcours', () => {
        const src = readFileSync(new URL('../../js/cartouches.js', import.meta.url), 'utf8');
        expect(src).toContain("'Ce que tu écris n\\'est gardé qu\\'à l\\'écran. Touche « Créer la cartouche » ; '");
        expect(src).toContain('{ passager: true }');
        expect(src).not.toMatch(/Ce que tu tapes|Clique sur « Créer la cartouche »/);
        const avis = tranche(src, 'function signalerAutosaveCartoucheMuette(ecrit) {', 'function retirerLAvisDeFicheNeuve');
        // Pendant un parcours : rien ne paraît, et le drapeau « déjà signalé » n'est pas levé.
        expect(avis.indexOf('window.ParcoursMoteur.actif()) return;')).toBeGreaterThan(-1);
        expect(avis.indexOf('window.ParcoursMoteur.actif()) return;')).toBeLessThan(avis.indexOf('_autosaveCartoucheDejaSignalee = id;'));
        // À la création : l'avis part.
        expect(tranche(src, 'async function sauvegarderCartouche', 'await afficherBanqueCartouches();')).toContain('retirerLAvisDeFicheNeuve();');
    });
});

describe('#1224 · les messages s\'empilent', () => {
    it('le vert qui suit un rouge se range sous lui, dans la même pile, et le rouge reste', () => {
        notifications.erreur('Jetons non appliqués');
        notifications.succes('13 fichier(s) importé(s)');
        const pile = document.getElementById('notifications-pile');
        expect(pile.classList.contains('notifications-pile')).toBe(true);
        expect([...pile.children].map(n => n.querySelector('.notification-texte').textContent))
            .toEqual(['Jetons non appliqués', '13 fichier(s) importé(s)']);
        vi.advanceTimersByTime(3300);
        expect(affichees().map(n => n.querySelector('.notification-texte').textContent))
            .toEqual(['Jetons non appliqués']);
        expect(document.querySelectorAll('.notifications-pile')).toHaveLength(1);
    });

    it('un rouge identique déjà affiché ne se répète pas ; un autre rouge s\'ajoute', () => {
        notifications.erreur('Valeur invalide', 'de 0 à 100');
        notifications.erreur('Valeur invalide', 'de 0 à 100');
        expect(affichees()).toHaveLength(1);
        notifications.erreur('Valeur invalide', 'autre détail');
        expect(affichees()).toHaveLength(2);
    });

    it('un vert identique remplace le précédent et repart pour 3 s', () => {
        notifications.succes('Copié');
        vi.advanceTimersByTime(2000);
        notifications.succes('Copié');
        vi.advanceTimersByTime(300);
        expect(affichees()).toHaveLength(1);
        vi.advanceTimersByTime(2600);
        expect(affichees()).toHaveLength(1);
        vi.advanceTimersByTime(400);
        expect(affichees()).toHaveLength(0);
    });
});
