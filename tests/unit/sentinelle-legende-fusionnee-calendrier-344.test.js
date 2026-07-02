import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #344 — sentinelle carte Légende fusionnée du Calendrier scolaire
// (2 juillet 2026, décision Grégoire 29 juin 2026).
// Avant : 3 cartes métriques séparées en tête de page (« Semaines scolaires »,
// « Jours de cours », « Congés avec reprise »), carte Légende reléguée en 6e
// position de la grille des mois. Décision : UNE carte Légende fusionnée qui
// remonte EN HAUT, 2 colonnes (légende des couleurs | les 3 chiffres).
// Contrat verrouillé sur le HTML généré par afficherCalendrierScolaire :
//  1. la carte Légende précède la grille des mois (.cal-grid-2col) ;
//  2. les 3 métriques vivent DANS la carte Légende (colonne
//     .calendrier-legende-metriques), avec les bonnes valeurs ;
//  3. l'ancien bandeau de cartes métriques (.cal-grid-auto-200) est retiré ;
//  4. la grille des mois ne contient plus la légende (pas de 6e carte).
// Porte terrain (août) : rendu visuel 2 modes + empilage responsive.

let win;
let htmlInjecte;

function creerSandbox() {
    htmlInjecte = null;

    const stores = new Map();
    stores.set('h2026_cadreCalendrier', { dateDebut: '2026-01-19' });
    stores.set('h2026_evenementsPrevus', [
        { dateEvenement: '2026-02-02', dateReprise: '2026-02-16', description: 'Congé A' },
        { dateEvenement: '2026-03-02', dateReprise: '', description: 'Congé sans reprise' }
    ]);
    stores.set('h2026_evenementsImprevus', [
        { dateEvenement: '2026-04-01', dateReprise: '2026-04-08', description: 'Congé B' }
    ]);
    stores.set('h2026_groupesCours', []);

    const db = {
        getSync: (k, d) => (stores.has(k) ? stores.get(k) : (d !== undefined ? d : null))
    };

    // Faux conteneur qui capture le innerHTML injecté
    const conteneur = {
        set innerHTML(html) { htmlInjecte = html; },
        get innerHTML() { return htmlInjecte; },
        addEventListener: () => {}
    };
    const conteneurCalendrier = {
        querySelector: (sel) => (sel === '#conteneur-calendrier' ? conteneur : null)
    };
    const fauxDocument = {
        getElementById: (id) => {
            if (id === 'calendrier-vue') return conteneurCalendrier;
            if (id === 'nombreSemaines') return { textContent: '14' };
            if (id === 'nombreJoursCours') return { textContent: '28' };
            return null;
        },
        addEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
    };

    win = chargerScript('js/calendrier-vue.js', {
        db,
        cle: (k) => 'h2026_' + k,
        obtenirCalendrierComplet: () => ({}),
        document: fauxDocument
    }, { sessionDepuisMois: undefined });
}

beforeEach(() => {
    creerSandbox();
    win.afficherCalendrierScolaire();
    expect(htmlInjecte).toBeTruthy();
});

describe('#344 · carte Légende fusionnée en tête du Calendrier scolaire', () => {
    it('la carte Légende précède la grille des mois', () => {
        const posLegende = htmlInjecte.indexOf('calendrier-legende');
        const posGrilleMois = htmlInjecte.indexOf('cal-grid-2col');
        expect(posLegende).toBeGreaterThan(-1);
        expect(posGrilleMois).toBeGreaterThan(-1);
        expect(posLegende).toBeLessThan(posGrilleMois);
    });

    it('les 3 métriques vivent dans la colonne dédiée de la carte Légende, bonnes valeurs', () => {
        const posColonnes = htmlInjecte.indexOf('calendrier-legende-fusion');
        const posMetriques = htmlInjecte.indexOf('calendrier-legende-metriques');
        expect(posColonnes).toBeGreaterThan(-1);
        expect(posMetriques).toBeGreaterThan(posColonnes);

        expect(htmlInjecte).toContain('Semaines scolaires');
        expect(htmlInjecte).toContain('>14<');
        expect(htmlInjecte).toContain('Jours de cours');
        expect(htmlInjecte).toContain('>28<');
        // 2 congés avec dateReprise non vide (prévus + imprévus), le 3e exclu
        expect(htmlInjecte).toContain('Congés avec reprise');
        expect(htmlInjecte).toContain('>2<');
    });

    it('l\'ancien bandeau de 3 cartes métriques est retiré', () => {
        expect(htmlInjecte).not.toContain('cal-grid-auto-200');
    });

    it('la grille des mois ne contient plus la légende', () => {
        const posGrilleMois = htmlInjecte.indexOf('cal-grid-2col');
        const apresGrille = htmlInjecte.slice(posGrilleMois);
        expect(apresGrille).not.toContain('calendrier-legende');
    });

    it('la légende des couleurs (8 items) est complète dans la colonne gauche', () => {
        const items = htmlInjecte.match(/calendrier-legende-item/g) || [];
        expect(items.length).toBe(8);
        expect(htmlInjecte).toContain('Jour de cours régulier');
        expect(htmlInjecte).toContain('Échéance de production');
    });
});
