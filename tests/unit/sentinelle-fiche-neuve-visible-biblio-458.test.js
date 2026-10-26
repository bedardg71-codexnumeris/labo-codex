import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { globauxIdentiteNaturelle } from './_helpers/identite-naturelle.js';

// =======================================================================
// SENTINELLE #458 — une fiche de cours neuve est VISIBLE dans la Bibliothèque
// =======================================================================
//
// Terrain du 19 août 2026 (porte #449, rangée 2.2a) : Grégoire crée
// « 000-TEST-ZZ » au Cadre, ouvre la Bibliothèque — la fiche n'y est NULLE
// PART. Cause : `CoursEntite.creer` ne posait pas `dansBibliotheque`, et la
// modale filtrait en égalité STRICTE (`=== true` pour « ta sélection »,
// `=== false` pour « disponibles ») : une fiche au champ absent ne tombait
// dans aucune section, jusqu'au rechargement où la migration de boot posait
// le drapeau. Reproduit au Chromium avant correction.
//
// Ce qui est verrouillé, aux DEUX bouts :
//   A. la source : `CoursEntite.creer` pose `dansBibliotheque: true` ;
//   B. l'affichage : une fiche au champ ABSENT rend dans « ta sélection »
//      (le filtre tolère l'absent — seule une valeur false explicite envoie
//      en « disponibles ») ;
//   C. une fiche explicitement retirée (false) rend dans « disponibles »,
//      pas dans la sélection — la tolérance ne mange pas le retrait.

describe('#458 · une fiche neuve est visible dans la Bibliothèque', () => {

    it('A · CoursEntite.creer pose dansBibliotheque: true', async () => {
        const store = {};
        const win = chargerScript('js/entites/cours-entite.js', {
            db: {
                get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
                set: async (k, v) => { store[k] = v; },
                getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
                setSync: (k, v) => { store[k] = v; }
            },
            genererIdUnique: (p) => p + 'X1',
            // CT-15 : `creer` porte désormais la garde d'unicité #455.
            ...globauxIdentiteNaturelle()
        });

        const fiche = await win.CoursEntite.creer({ codeCours: '000-TEST-ZZ', nomCours: 'Test', discipline: 'Bio' });

        expect(fiche.dansBibliotheque).toBe(true);
        expect(store.cours[0].dansBibliotheque).toBe(true);
    });

    it('B · une fiche au champ ABSENT rend dans la liste, pas nulle part', async () => {
        const rendues = { selection: [], disponibles: [] };
        const win = chargerScript('js/cours.js', {
            db: {
                get: async () => [{ id: 'C_NEUF', codeCours: '000-TEST-ZZ', nomCours: 'Fiche neuve' }],
                getSync: (k, d) => d, setSync: () => {}, set: async () => {}
            },
            echapperHtml: (s) => String(s),
            BibliothequeUI: {
                // #1159 (lot 6) — réancré : la fenêtre à une seule liste reçoit les deux groupes
                // (la liste, « Mis de côté ») en données ; on lit leurs ids.
                creerFenetreListe(c) {
                    rendues.selection.push(...c.liste.rangees.map(r => r.id));
                    rendues.disponibles.push(...c.repli.rangees.map(r => r.id));
                },
                fermerModal() {}, ajouterOptgroupDemo() {}
            },
            alert() {}, confirm: () => false
        });

        await win.ouvrirModalBibliothequeCours();

        expect(rendues.selection).toEqual(['C_NEUF']);   // visible, section 1
        expect(rendues.disponibles).toEqual([]);          // pas en double
    });

    it('C · une fiche retirée (false explicite) rend dans « Mis de côté » seulement', async () => {
        const rendues = { selection: [], disponibles: [] };
        const win = chargerScript('js/cours.js', {
            db: {
                get: async () => [{ id: 'C_RETIRE', codeCours: '601-102-MQ', dansBibliotheque: false }],
                getSync: (k, d) => d, setSync: () => {}, set: async () => {}
            },
            echapperHtml: (s) => String(s),
            BibliothequeUI: {
                // #1159 (lot 6) — réancré : la fenêtre à une seule liste reçoit les deux groupes
                // (la liste, « Mis de côté ») en données ; on lit leurs ids.
                creerFenetreListe(c) {
                    rendues.selection.push(...c.liste.rangees.map(r => r.id));
                    rendues.disponibles.push(...c.repli.rangees.map(r => r.id));
                },
                fermerModal() {}, ajouterOptgroupDemo() {}
            },
            alert() {}, confirm: () => false
        });

        await win.ouvrirModalBibliothequeCours();

        expect(rendues.selection).toEqual([]);
        expect(rendues.disponibles).toEqual(['C_RETIRE']);
    });
});
