import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #496 (25 août 2026) — « PRÉPARER LE PDF » MÈNE À L'APERÇU, PAS À
// UN FORMULAIRE QUI REDEMANDE CE QUE LA FICHE SAIT.
//
// Le fil : depuis la fiche d'une production, le bouton ouvrait un écran de
// sélection — production, grille, échelle, cartouche. Or la production PORTE
// déjà `grilleId`, `echelleId` et `cartoucheId`. Grégoire, 25 août : « ce
// bouton nous mène à une fenêtre qui ressemble déjà beaucoup aux gabarits de la
// production comme telle ».
//
// ⚠ ET L'ÉCRAN NE SE CONTENTAIT PAS D'ÊTRE REDONDANT : il se pré-remplissait
// avec les DERNIERS RÉGLAGES MÉMORISÉS, pas avec la production ouverte. Ouvrir
// l'artefact 1 après avoir préparé le PDF d'une dissertation proposait donc la
// grille de la dissertation — un document faux, à un geste de l'impression.
// C'est V1.b qui tient cette porte.
//
// Ce que cette sentinelle tient :
//   V1 — le raccourci part de la PRODUCTION, et d'elle seule.
//   V2 — le repli reste possible : ce qui ne peut pas s'afficher se demande.
//   V3 — `ouvrirApercuPDFPour` ne dépend d'AUCUN formulaire.

/* ------------------------------------------------------------------ harnais */

function element(id) {
    const classes = new Set();
    return {
        id, value: '', checked: false, style: {}, innerHTML: '', textContent: '',
        classList: {
            add: (c) => classes.add(c), remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c)
        },
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        // #497 étape 3 : l'aperçu pose désormais PLUSIEURS feuilles côte à côte,
        // donc il remonte au parent de la première. Dans le navigateur ce parent
        // existe toujours ; le mock doit en avoir un lui aussi.
        parentElement: {
            querySelectorAll: () => [], querySelector: () => null,
            appendChild() {}, removeChild() {}
        }
    };
}

/**
 * L'élément que `createElement` doit rendre. ⚠ `escapeHtml` (export-pdf.js)
 * pose le texte dans `textContent` et relit `innerHTML` : si les deux champs
 * sont indépendants, la fonction rend une chaîne VIDE et le document entier se
 * construit sans un mot — sans qu'aucune assertion ne bronche. Le harnais doit
 * être fidèle là où le code s'appuie sur le navigateur.
 */
function elementEchappant() {
    let texte = '';
    return {
        set textContent(v) { texte = v == null ? '' : String(v); },
        get textContent() { return texte; },
        set innerHTML(v) { texte = v == null ? '' : String(v); },
        get innerHTML() {
            return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        style: {}, classList: { add() {}, remove() {}, contains: () => false },
        setAttribute() {}, addEventListener() {},
        // ⚠ Un `appendChild` qui ne garde rien rend le harnais aveugle : les
        // feuilles créées par l'aperçu existeraient sans qu'on puisse lire ce
        // qu'elles montrent, et la sentinelle passerait pour une raison fausse.
        enfants: [],
        appendChild(n) { this.enfants.push(n); return n; },
        querySelector: () => null
    };
}

// ⚠ Chaque grille porte un critère au nom UNIQUE. C'est lui le témoin : le
// titre de l'aperçu affiche le nom de la PRODUCTION quand il y en a une, donc
// le nom de la grille n'y paraît jamais — chercher « Grille-4 A26 » dans le
// rendu ne prouverait rien.
const GRILLE_PROD = {
    id: 'GR_PROD', nom: 'Grille-4 A26',
    criteres: [{ nom: 'Rigueur-de-la-production', description: '', ponderation: 25 }]
};
const GRILLE_AUTRE = {
    id: 'GR_AUTRE', nom: 'Grille-5 FR-HOLIS',
    criteres: [{ nom: 'Critere-d-une-autre-grille', description: '', ponderation: 25 }]
};
const NIVEAUX = [{ code: 'E', nom: 'Expert', description: '', min: 90, max: 100 }];
const ECHELLE_PROD = { id: 'ECH_PROD', nom: '0-IDME', niveaux: NIVEAUX, config: {} };
const ECHELLE_AUTRE = { id: 'ECH_AUTRE', nom: 'Autre échelle', niveaux: NIVEAUX, config: {} };
const CARTOUCHE = { id: 'CART_1', nom: 'Stratégies de lecture', contexte: 'CONTEXTE-DE-LA-CARTOUCHE' };

const ARTEFACT = {
    id: 'PROD_A1', titre: 'Artefact 1', type: 'artefact-portfolio',
    grilleId: 'GR_PROD', echelleId: 'ECH_PROD', cartoucheId: 'CART_1'
};

function charger({ production = ARTEFACT, reglages = null } = {}) {
    const store = {
        'a2026_productions': production ? [production] : [],
        'a2026_grillesTemplates': [GRILLE_PROD, GRILLE_AUTRE],
        'a2026_echellesTemplates': [ECHELLE_PROD, ECHELLE_AUTRE],
        // ⚠ CLÉS MIGRÉES PAR S5/#623 LE 31 AOÛT 2026 : ce corpus semait sous la clé
        // NUE. Le code lit désormais par `cle(...)`, et le stub de ce fichier rend
        // `a2026_` + k (plus bas). La cartouche vivait donc dans une case que
        // personne ne lit plus, et son contexte n'atteignait jamais l'aperçu.
        'a2026_cartouches_GR_PROD': [CARTOUCHE],
        'a2026_cartouches_GR_AUTRE': []
    };
    if (reglages) store['exportPDF_derniersReglages'] = reglages;

    // Les éléments du modal d'aperçu, `apercuPDF-contenu` COMPRIS : sans lui
    // `rafraichirApercuPDF` sort tout de suite, et la sentinelle ne pourrait
    // vérifier que l'ouverture — jamais CE QUI EST MONTRÉ. Or c'est là qu'est
    // le défaut : un aperçu qui s'ouvre sur la grille d'un autre document.
    const els = {};
    for (const id of ['modalApercuPDF', 'apercuPDF-options-production',
                      'apercuPDF-orientation', 'apercuPDF-pied-enseignant',
                      'apercuPDF-pied-licence', 'apercuPDF-afficher-trimestre',
                      'apercuPDF-contenu', 'apercuPDF-page']) {
        els[id] = element(id);
    }

    // Le repli passe par `afficherFormulairePDFInline`, qui commence par
    // chercher la zone principale de la section active. Ce sélecteur est donc
    // le témoin observable du repli.
    const traces = { zonePrincipaleCherchee: 0, alertes: [], feuilles: [] };

    // #497 étape 3 : l'aperçu pose une feuille par page. Le conteneur les
    // collecte pour que la sentinelle puisse lire CE QUI EST MONTRÉ, feuille
    // par feuille — les consignes sur la première, l'évaluation sur la suivante.
    els['apercuPDF-page'].parentElement = {
        querySelectorAll: () => [], querySelector: () => null,
        appendChild: (f) => { traces.feuilles.push(f); return f; },
        removeChild() {}
    };

    const win = chargerScript('js/export-pdf.js', {
        db: {
            get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {},
        productionEnEdition: production ? production.id : null,
        alert: (m) => traces.alertes.push(String(m)),
        localStorage: {
            getItem: (k) => (k in store ? JSON.stringify(store[k]) : null),
            setItem: () => {}, removeItem: () => {}
        },
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: (sel) => {
                if (sel && sel.includes('zone-principale')) traces.zonePrincipaleCherchee++;
                return null;
            },
            querySelectorAll: () => [], addEventListener() {}, createElement: () => elementEchappant()
        }
    });
    return { win, els, traces, store };
}

const apercuOuvert = (els) => els['modalApercuPDF'].classList.contains('actif');

/* ------------------------------------------ V1 — le raccourci part de la fiche */

describe('#496 · V1 — le bouton mène droit à l\'aperçu', () => {
    it('V1.a Une production complète ouvre l\'aperçu sans passer par le formulaire', async () => {
        const { win, els, traces } = charger();
        await win.afficherFormulairePDFDepuisProduction();
        expect(apercuOuvert(els), 'le modal d\'aperçu doit s\'ouvrir').toBe(true);
        expect(traces.zonePrincipaleCherchee, 'le formulaire ne doit PAS être injecté').toBe(0);
    });

    it('V1.b LE CAS QUI PORTE LE SENS : la production gagne sur les réglages mémorisés', async () => {
        // Réglages laissés par un précédent document, sur une TOUTE AUTRE
        // grille. C'est la situation qui rendait le formulaire dangereux :
        // ouvrir l'artefact 1 après avoir préparé le PDF d'une dissertation
        // proposait la grille de la dissertation.
        const { win, els, traces } = charger({
            reglages: { grilleId: 'GR_AUTRE', echelleId: 'ECH_AUTRE', productionId: 'PROD_X' }
        });
        // Le harnais doit d'abord PROUVER que les réglages sont bien là :
        // sinon le test passerait pour une raison qui n'est pas la bonne.
        expect(win.restaurerReglagesPDF().grilleId).toBe('GR_AUTRE');

        await win.afficherFormulairePDFDepuisProduction();

        // La feuille 1 porte les consignes ; l'évaluation est sur la suivante
        // depuis #497 étape 3. On lit TOUT ce qui a été montré.
        const feuille1 = els['apercuPDF-contenu'].innerHTML || '';
        const suivantes = traces.feuilles.map(f => (f.enfants || [])
            .map(e => e.innerHTML || '').join('')).join('');
        const rendu = feuille1 + suivantes;

        expect(feuille1, 'l\'aperçu doit avoir été rendu').not.toBe('');
        expect(rendu, 'les critères de la grille de la production').toContain('Rigueur-de-la-production');
        expect(rendu, 'jamais ceux de la grille des réglages mémorisés')
            .not.toContain('Critere-d-une-autre-grille');
    });

    it('V1.c La cartouche est lue dans la grille DE LA PRODUCTION', async () => {
        const { win, els } = charger();
        await win.afficherFormulairePDFDepuisProduction();
        expect(apercuOuvert(els)).toBe(true);
        // Une cartouche vit sous `cartouches_<grilleId>`. Son CONTEXTE dans le
        // rendu prouve donc que la clé a été bâtie sur la grille de la
        // production — pas sur celle d'un autre document.
        expect(els['apercuPDF-contenu'].innerHTML).toContain('CONTEXTE-DE-LA-CARTOUCHE');
    });
});

/* ------------------------------------------------- V2 — le repli reste ouvert */

describe('#496 · V2 — ce qui ne peut pas s\'afficher se demande', () => {
    it('V2.a Une production sans grille retombe sur le formulaire', async () => {
        const { win, els, traces } = charger({
            production: { id: 'PROD_NU', titre: 'Sans grille', grilleId: '', echelleId: '' }
        });
        await win.afficherFormulairePDFDepuisProduction();
        expect(apercuOuvert(els), 'rien à montrer : l\'aperçu reste fermé').toBe(false);
        expect(traces.zonePrincipaleCherchee, 'le formulaire prend le relais').toBeGreaterThan(0);
    });

    it('V2.b Aucune production ouverte : le formulaire, comme avant', async () => {
        const { win, els, traces } = charger({ production: null });
        await win.afficherFormulairePDFDepuisProduction();
        expect(apercuOuvert(els)).toBe(false);
        expect(traces.zonePrincipaleCherchee).toBeGreaterThan(0);
    });

    it('V2.c Une production dont la grille n\'existe plus retombe aussi', async () => {
        const { win, els, traces } = charger({
            production: { id: 'PROD_ORPH', titre: 'Grille disparue',
                          grilleId: 'GR_SUPPRIMEE', echelleId: 'ECH_PROD' }
        });
        await win.afficherFormulairePDFDepuisProduction();
        expect(apercuOuvert(els)).toBe(false);
        expect(traces.zonePrincipaleCherchee).toBeGreaterThan(0);
    });
});

/* ------------------------------------- V3 — l'ouverture ne dépend d'aucun DOM */

describe('#496 · V3 — ouvrirApercuPDFPour se suffit à ses arguments', () => {
    it('V3.a Elle ouvre l\'aperçu sans qu\'aucun formulaire existe', async () => {
        const { win, els } = charger({ production: null });
        const ouvert = await win.ouvrirApercuPDFPour({
            productionId: null, grilleId: 'GR_PROD', echelleId: 'ECH_PROD', cartoucheId: ''
        });
        expect(ouvert).toBe(true);
        expect(apercuOuvert(els)).toBe(true);
    });

    it('V3.b Sans grille ou sans échelle, elle refuse et n\'ouvre rien', async () => {
        const { win, els } = charger({ production: null });
        expect(await win.ouvrirApercuPDFPour({ grilleId: '', echelleId: 'ECH_PROD' })).toBe(false);
        expect(await win.ouvrirApercuPDFPour({ grilleId: 'GR_PROD', echelleId: '' })).toBe(false);
        expect(await win.ouvrirApercuPDFPour({})).toBe(false);
        expect(apercuOuvert(els)).toBe(false);
    });

    it('V3.c Une grille introuvable est un refus, pas un aperçu vide', async () => {
        const { win, els } = charger({ production: null });
        expect(await win.ouvrirApercuPDFPour({
            grilleId: 'GR_FANTOME', echelleId: 'ECH_PROD'
        })).toBe(false);
        expect(apercuOuvert(els)).toBe(false);
    });

    it('V3.d Sans cartouche, le portrait reste le défaut', async () => {
        const { win, els } = charger({ production: null });
        await win.ouvrirApercuPDFPour({ grilleId: 'GR_PROD', echelleId: 'ECH_PROD', cartoucheId: '' });
        expect(els['apercuPDF-orientation'].value).toBe('portrait');
    });
});
