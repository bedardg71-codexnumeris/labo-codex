import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

// Sentinelle #512/#513 (25 août 2026) — L'APERÇU S'OUVRE SUR LE BON DOCUMENT,
// ET IL S'OUVRE MÊME SANS GRILLE.
//
// Deux constats de l'audit du 25 août, sur le même écran :
//
// #512 — `cranDocument` promet, sans demande explicite, le cran le plus HAUT que
//   le document puisse porter : c'est le comportement d'avant les crans, et rien
//   ne devait disparaître de ce que Grégoire voyait en ouvrant l'aperçu. La
//   promesse était court-circuitée au PREMIER usage : faute de valeur posée, le
//   `<select>` restait sur sa première option du HTML (« Consignes »), et le
//   code lisait cela comme un choix. Une production munie de sa grille, de son
//   échelle et de sa cartouche ouvrait son aperçu sur la seule page de consignes.
//
// #513 — la porte de l'aperçu exigeait une grille ET une échelle, alors que le
//   cran « Consignes » existe depuis #497. Une production sans grille — le cas
//   ordinaire d'un travail préparé avant qu'on ait monté son évaluation — ne
//   pouvait pas produire le document qu'on distribue aux étudiant·es ; le repli
//   renvoyait vers un formulaire qui, lui, réclame les deux. Une impasse polie.
//   Défaut voisin corrigé du même coup : « a des consignes » était écrit deux
//   fois, et les deux versions divergeaient — les blocs libres de #499 comptaient
//   pour le rendu, pas pour les crans.

/* ------------------------------------------------------------------ harnais */

/**
 * Un `<select>` FIDÈLE À HTML : assigner une valeur absente de la liste met
 * `selectedIndex` à -1 et `value` à ''.
 *
 * ⚠⚠ C'est toute la mécanique de #512 : sans cette fidélité, le banc accepterait
 * n'importe quelle valeur et prouverait le contraire de ce qui se passe dans un
 * navigateur. Un faux élément trop complaisant est une sentinelle qui ment.
 */
function fauxSelect(valeurs) {
    let valeur = valeurs[0];
    return {
        options: valeurs.map(v => ({ value: v, disabled: false, title: '' })),
        set value(v) { valeur = valeurs.indexOf(v) !== -1 ? v : ''; },
        get value() { return valeur; }
    };
}

function monter({ reglages = null, productions = [], grilles = [], echelles = [] } = {}) {
    const els = {
        'apercuPDF-cran': fauxSelect(['consignes', 'evaluation', 'retroaction']),
        'apercuPDF-orientation': { value: '' },
        'apercuPDF-disposition': { value: '' }
    };
    const store = {
        'trimestres': [{ id: 'a2026', nom: 'Automne 2026', actif: true }],
        'exportPDF_derniersReglages': reglages,   // ⚠ clé NON namespacée, lue nue par restaurerReglagesPDF
        'a2026_productions': productions,
        'a2026_grillesTemplates': grilles,
        'a2026_echellesTemplates': echelles
    };
    const win = chargerScript('js/export-pdf.js', {
        db: {
            get: async (k) => (k in store ? store[k] : null),
            getSync: (k, d) => (k in store && store[k] !== null ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {}, alert: () => {},
        document: {
            // ⚠ `modalApercuPDF` reste ABSENT : la porte est ce qu'on mesure, pas
            // le rendu. La fonction pose ses réglages puis s'arrête là.
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: (tag) => elementEchappant(tag)
        }
    });
    return { win, els };
}

const GRILLE = { id: 'GR_1', nom: 'Grille A26', criteres: [{ id: 'CR_1', nom: 'Critère' }] };
const ECHELLE = { id: 'EC_1', nom: 'IDME', niveaux: [{ code: 'I' }, { code: 'D' }] };
const PROD_COMPLETE = {
    id: 'P1', titre: 'Artefact 1', objectif: 'OBJECTIF', tache: 'TACHE', detailTache: 'DETAIL',
    grilleId: 'GR_1', echelleId: 'EC_1'
};
const PROD_SANS_GRILLE = { id: 'P2', titre: 'Travail préparatoire', detailTache: 'Consignes numérotées.' };

/* ----------------------------------- #512 — le cran par défaut n'est pas « Consignes » */

describe('#512 · le premier usage ne demande rien, et obtient le document complet', () => {

    it('A LE CAS QUI PORTE LE SENS : sans réglage mémorisé, le sélecteur ne demande rien', async () => {
        const { win, els } = monter({
            productions: [PROD_COMPLETE], grilles: [GRILLE], echelles: [ECHELLE]
        });

        await win.ouvrirApercuPDFPour({ productionId: 'P1', grilleId: 'GR_1', echelleId: 'EC_1' });

        // Avant le correctif : 'consignes' — la première option du HTML, lue
        // comme un choix de l'utilisateur.
        expect(els['apercuPDF-cran'].value,
            'aucune demande explicite : c\'est cranDocument qui doit trancher').toBe('');
    });

    it('B et « rien demandé » vaut bien le cran le plus HAUT', () => {
        const { win } = monter();
        const options = { production: PROD_COMPLETE };
        const cartouche = { id: 'CA_1' };
        expect(win.cranDocument({ ...options, cran: '' }, GRILLE, cartouche)).toBe('retroaction');
        expect(win.cranDocument({ ...options, cran: null }, GRILLE, cartouche)).toBe('retroaction');
    });

    it('C un cran mémorisé, lui, est une demande : il est respecté', async () => {
        const { win, els } = monter({
            reglages: { cran: 'evaluation' },
            productions: [PROD_COMPLETE], grilles: [GRILLE], echelles: [ECHELLE]
        });

        await win.ouvrirApercuPDFPour({ productionId: 'P1', grilleId: 'GR_1', echelleId: 'EC_1' });

        expect(els['apercuPDF-cran'].value).toBe('evaluation');
    });
});

/* --------------------------- #513 — le document de consignes n'exige pas de grille */

describe('#513 · une production sans grille produit son document de consignes', () => {

    it('A LE CAS QUI PORTE LE SENS : la porte s\'ouvre sans grilleId ni echelleId', async () => {
        const { win } = monter({ productions: [PROD_SANS_GRILLE] });

        // Avant le correctif : false, et le repli menait à un formulaire qui
        // réclame justement la grille et l'échelle qui manquent.
        const ouvert = await win.ouvrirApercuPDFPour({ productionId: 'P2' });
        expect(ouvert).toBe(true);
    });

    it('B ce qui n\'a RIEN à montrer reste refusé', async () => {
        const { win } = monter({ productions: [{ id: 'P3', titre: 'Fiche vide' }] });
        expect(await win.ouvrirApercuPDFPour({ productionId: 'P3' })).toBe(false);
        expect(await win.ouvrirApercuPDFPour({})).toBe(false);
    });

    it('C le rendu produit vraiment les consignes, sans grille ni échelle', () => {
        const { win } = monter();
        const html = win.genererApercuCombine(null, null, null, {
            production: PROD_SANS_GRILLE, inclureNomProduction: true,
            inclureObjectif: true, inclureDescription: true, inclureDetailTache: true
        });
        expect(html).not.toContain('Données manquantes');
        expect(html).toContain('Consignes numérotées.');
        expect(html).toContain('Travail préparatoire');
    });

    it('D un document sans rien du tout dit encore « Données manquantes »', () => {
        const { win } = monter();
        expect(win.genererApercuCombine(null, null, null, { production: null }))
            .toContain('Données manquantes');
    });
});

/* ------------------- #513 — une seule définition de « a des consignes » */

describe('#513 · les blocs nommés par l\'enseignant·e comptent, eux aussi', () => {

    it('A une production qui n\'a QUE des blocs libres a des consignes', () => {
        const { win } = monter();
        const prod = {
            id: 'P4',
            champsPersonnalises: [{ id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' }]
        };
        expect(win.productionAConsignes(prod)).toBe(true);
        // Et le cran suit : c'est là que les deux définitions divergeaient.
        expect(win.cransDisponibles(null, null, { production: prod })).toContain('consignes');
    });

    it('B un bloc libre sans contenu — ou sans titre — ne compte pas', () => {
        const { win } = monter();
        // Même règle que le rendu : ce serait un bandeau au-dessus du vide.
        expect(win.productionAConsignes({
            champsPersonnalises: [{ id: 'C1', titre: 'Remise', contenu: '   ' }]
        })).toBe(false);
        expect(win.productionAConsignes({
            champsPersonnalises: [{ id: 'C1', titre: '', contenu: 'du texte' }]
        })).toBe(false);
    });

    it('C le motif de refus dit la même chose que la règle', () => {
        const { win } = monter();
        const motif = win.raisonCranIndisponible('consignes', null, null, {});
        // Il nommait les trois blocs ancrés — un enseignant·e qui vient de
        // remplir « Format et mise en page » aurait lu un motif faux.
        expect(motif).not.toContain('objectif');
        expect(motif).toContain('bloc');
    });
});
