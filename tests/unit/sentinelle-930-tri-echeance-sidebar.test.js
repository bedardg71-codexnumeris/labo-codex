import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #930 (22 sept. 2026) — LE TRI « ÉCHÉANCE » DE LA BARRE LATÉRALE.
//
// Rapport de Grégoire, 1.153.0, 10 h 16 : « L'ordre des artefacts ne se met pas
// à jour en fonction des dates ». Console : `obtenirEcheancePlusTot is not
// defined` à productions-liste.js:110, dans le `sort` du tri « échéance »,
// depuis `sauvegarderProduction`.
//
// Le fil : la fonction est née dans productions.js (Beta 99.08) pour ce tri.
// Le 16 mai 2026, le refactor `16236434` a sorti la barre latérale dans
// productions-liste.js — et l'en-tête de ce fichier a déclaré la fonction
// « fournie par productions.js », sans que personne ne l'exporte sur `window`.
// Quatre mois de ReferenceError à chaque tri par date, jamais vu : aucun test
// ne traversait la frontière entre les deux fichiers.
//
// Ce que cette sentinelle tient :
//   E1 — l'export existe.
//   E2 — la fonction rend bien la date la plus tôt, tous groupes confondus.
//   E3 — VERROU STRUCTUREL : tout ce que l'en-tête de productions-liste.js
//        attend de productions.js est réellement exporté. C'est la classe du
//        défaut qu'on ferme, pas le seul cas vu.
//   E4 — le trajet vécu : les deux fichiers chargés, le tri « échéance »
//        actif, le menu de la sélection (#1147) se dessine dans l'ordre des dates.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function chargerProductions() {
    const store = {};
    return chargerScript('js/productions.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirCoursActifId: () => 'COURS_A',
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {}
    });
}

/* ------------------------------------------------------------- E1 — l'export */

describe('#930 · E1 — obtenirEcheancePlusTot est exportée sur window', () => {
    it('E1.a productions.js la pose sur window', () => {
        const win = chargerProductions();
        expect(typeof win.obtenirEcheancePlusTot).toBe('function');
    });
});

/* ------------------------------------------------------- E2 — ce qu'elle rend */

describe('#930 · E2 — la date la plus tôt, tous groupes confondus', () => {
    it('E2.a Sans aucune date ⇒ null', () => {
        const win = chargerProductions();
        expect(win.obtenirEcheancePlusTot({ titre: 'x' })).toBeNull();
    });

    it('E2.b Legacy seule ⇒ la legacy', () => {
        const win = chargerProductions();
        expect(win.obtenirEcheancePlusTot({ dateEcheance: '2026-10-05' })).toBe('2026-10-05');
    });

    it('E2.c Un groupe plus tôt que la legacy ⇒ le groupe', () => {
        const win = chargerProductions();
        const prod = {
            dateEcheance: '2026-10-05',
            echeancesParGroupe: { GC_A: { assignee: true, date: '2026-10-01' }, GC_B: { assignee: true, date: '2026-10-12' } }
        };
        expect(win.obtenirEcheancePlusTot(prod)).toBe('2026-10-01');
    });

    it('E2.d Une date PRÉVUE (décochée) compte pour le tri — c\'est une date de la barre latérale, pas une date due', () => {
        // Supposition nommée le 22 sept. : trier, ce n'est pas compter. Une
        // production préparée pour le 1er octobre se range au 1er octobre.
        const win = chargerProductions();
        const prod = { echeancesParGroupe: { GC_A: { assignee: false, date: '2026-10-01' } } };
        expect(win.obtenirEcheancePlusTot(prod)).toBe('2026-10-01');
    });
});

/* ------------------------------------ E3 — l'en-tête de productions-liste.js */

describe('#930 · E3 — tout ce que productions-liste.js attend de productions.js est exporté', () => {
    it('E3.a Chaque nom déclaré « (productions.js) » dans l\'en-tête est sur window', () => {
        const source = readFileSync(path.join(racine, 'js/productions-liste.js'), 'utf8');
        const debut = source.indexOf('Dépendances');
        const fin = source.indexOf('Helpers globaux', debut);
        expect(debut, 'l\'en-tête doit lister ses dépendances').toBeGreaterThan(-1);
        expect(fin, 'l\'en-tête doit séparer les helpers globaux').toBeGreaterThan(debut);

        const bloc = source.slice(debut, fin).replace(/\(productions\.js\)/g, '');
        // Les identifiants camelCase : un nom de fonction, pas un mot de prose.
        const attendus = [...new Set(bloc.match(/\b[a-z][a-zA-Z]*[A-Z][a-zA-Z]*\b/g) || [])];
        expect(attendus.length, 'l\'en-tête nomme des fonctions').toBeGreaterThanOrEqual(8);
        expect(attendus).toContain('obtenirEcheancePlusTot');

        const win = chargerProductions();
        const manquants = attendus.filter(nom => typeof win[nom] !== 'function');
        expect(manquants, 'déclarés fournis par productions.js, absents de window').toEqual([]);
    });
});

/* ------------------------------------------------ E4 — le trajet des deux fichiers */

describe('#930 · E4 — les deux fichiers chargés, le tri « échéance » range le menu de la sélection (#1147 : il rangeait la barre latérale)', () => {
    async function barreLaterale(productions, tri) {
        const winProd = chargerProductions();
        const container = { innerHTML: '' };
        const elements = {
            selectionProductions: container,
            triProductions: { value: tri }
        };
        const winListe = chargerScript('js/productions-liste.js', {
            db: { get: async (k) => (k === 'a2026_productions' ? productions : []) },
            cle: (k) => `a2026_${k}`,
            echapperHtml: (t) => String(t == null ? '' : t),
            BibliothequeUI: { filtrerParModeDemo: (x) => x },
            aucuneEcheanceAssignee: (p) => winProd.aucuneEcheanceAssignee(p),
            productionEnEdition: null,   // #1147 : le menu lit la fiche ouverte (config.js)
            // ⚠ Renvoi par fermeture vers l'EXPORT de productions.js : si
            // l'export manque, ce renvoi lève — c'est le défaut de Grégoire.
            obtenirEcheancePlusTot: (p) => winProd.obtenirEcheancePlusTot(p),
            document: {
                getElementById: (id) => elements[id] || null,
                querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
                createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, contains: () => false } })
            }
        });
        await winListe.afficherListeProductions();
        // Les options du menu, sans « Aucune production ouverte » (valeur vide).
        return [...container.innerHTML.matchAll(/<option value="([^"]+)"/g)].map(m => m[1]);
    }

    const PRODUCTIONS = [
        { id: 'P_sans', titre: 'Sans date', type: 'travail', dansBibliotheque: true },
        { id: 'P_oct', titre: 'Octobre', type: 'travail', dansBibliotheque: true, dateEcheance: '2026-10-20' },
        { id: 'P_sept', titre: 'Septembre', type: 'travail', dansBibliotheque: true,
          echeancesParGroupe: { GC_A: { assignee: true, date: '2026-09-30' } } }
    ];

    it('E4.a Tri « échéance » : la plus tôt d\'abord, sans date en dernier — et aucune erreur', async () => {
        const ordre = await barreLaterale(PRODUCTIONS, 'echeance');
        expect(ordre).toEqual(['P_sept', 'P_oct', 'P_sans']);
    });

    it('E4.b Sans tri : l\'ordre du stock', async () => {
        const ordre = await barreLaterale(PRODUCTIONS, '');
        expect(ordre).toEqual(['P_sans', 'P_oct', 'P_sept']);
    });
});
