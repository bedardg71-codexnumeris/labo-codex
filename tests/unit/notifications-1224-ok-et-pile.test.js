// #1224 (3 nov. 2026) — décision de Grégoire : rouge et orange restent jusqu'à « OK » ;
// vert et info partent seuls ; les messages s'empilent au lieu de se recouvrir.
// Vécu : après l'import des reprises, le vert « 13 fichier(s) importé(s) » s'est posé
// sur le rouge « Jetons non appliqués », qu'il n'a pas eu le temps de lire.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

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
