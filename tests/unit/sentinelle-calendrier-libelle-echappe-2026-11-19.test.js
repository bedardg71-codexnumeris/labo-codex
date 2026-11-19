import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — lot « journées reprise » (19 nov. 2026, tranché par Cowork) : règle de
// sécurité n° 1 sur la case du Calendrier scolaire. Le libellé d'une journée sans cours
// (« S11 · motif », ou le motif seul, ou « Reprise <jour> ») est injecté tel quel dans
// la cellule (calendrier-vue.js, innerHTML). Le motif est la description saisie, et
// journeesSansCours VOYAGE par les imports : sans échappement, une description piégée
// devenait du HTML dans le calendrier. La CSP bloque les scripts en ligne ; il restait
// l'injection de HTML. Échappé à la construction du libellé.

const PIEGE = '<img src=x data-piege="1">Grève';
const JOUR_PIEGE = '<b>Lundi</b>';

function rendre() {
    let htmlInjecte = null;
    const stores = new Map([
        ['h2026_cadreCalendrier', { dateDebut: '2026-01-19' }],
        ['h2026_journeesSansCours', []],
        ['h2026_groupesCours', []]
    ]);
    const db = { getSync: (k, d) => (stores.has(k) ? stores.get(k) : (d !== undefined ? d : null)) };
    const conteneur = {
        set innerHTML(html) { htmlInjecte = html; },
        get innerHTML() { return htmlInjecte; },
        addEventListener: () => {}
    };
    const fauxDocument = {
        getElementById: (id) => (id === 'calendrier-vue'
            ? { querySelector: (sel) => (sel === '#conteneur-calendrier' ? conteneur : null) }
            : null),
        addEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
    };
    // Même règle que config.js (& < > " ').
    const echapperHtml = (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
    const calendrier = {
        '2026-02-03': { jourSemaine: 'Mardi', statut: 'conge', motif: PIEGE, nonReprise: true, numeroSemaine: 3 },
        '2026-02-04': { jourSemaine: 'Mercredi', statut: 'conge', motif: PIEGE },
        '2026-02-16': { jourSemaine: 'Lundi', statut: 'reprise', jourRemplace: JOUR_PIEGE, numeroSemaine: 5, numeroJour: 12 }
    };
    const win = chargerScript('js/calendrier-vue.js', {
        db,
        cle: (k) => 'h2026_' + k,
        obtenirCalendrierComplet: () => calendrier,
        echapperHtml,
        document: fauxDocument
    }, { sessionDepuisMois: undefined });
    win.afficherCalendrierScolaire();
    return htmlInjecte;
}

describe('règle n° 1 — le libellé d\'une journée sans cours sort ÉCHAPPÉ dans la case du calendrier', () => {
    const html = rendre();

    it('le rendu a bien eu lieu (la case du 3 février existe)', () => {
        expect(html).toContain('data-date="2026-02-03"');
    });

    it('journée non reprise : « S3 · » suivi du motif en texte, jamais en balise', () => {
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('S3 · &lt;img src=x data-piege=&quot;1&quot;&gt;Grève');
    });

    it('journée reprise (motif seul) : échappé aussi', () => {
        const caseDu4 = tranche(html, 'data-date="2026-02-04"', 'data-date="2026-02-05"');
        expect(caseDu4).toContain('&lt;img src=x');
        expect(caseDu4).not.toContain('<img');
    });

    it('jour de reprise : le jour remplacé (importé) est échappé', () => {
        expect(html).not.toContain('<b>Lundi</b>');
        expect(html).toContain('Reprise &lt;b&gt;Lundi&lt;/b&gt;');
    });
});
