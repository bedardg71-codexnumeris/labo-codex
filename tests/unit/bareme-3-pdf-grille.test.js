/**
 * LE BARÈME, LA GRILLE DU PDF — le PDF de la grille lit le barème (#1120, une part du geste 4).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-20-pdf-grille-bareme.md ; plan : PLAN-2026-10-19-bareme.md §4.
 * Retour de Grégoire (20 oct., 16 h 54) : « Quand je veux voir l'aperçu, c'est encore l'échelle de performance
 * qui est affichée. La visualisation du PDF ne ressemble pas du tout à ma grille. »
 *
 * Ce que ce banc verrouille :
 *   L — LA LIGNE D'UNE TRANCHE (`bareme.ligneEleve`) : ses points puis son texte, sans son nom ; l'unité au
 *       singulier sous 2 ; deux bornes au trait court ; une tranche à compléter montre son texte seul.
 *   E — L'ÉCHELLE EXIGÉE OU NON (`echelleExigee`) : seulement si un critère en lit une ; l'ancien format
 *       (`parNiveau` sans `echelleId`) se lit par la même fonction.
 *   P — LA PORTE (`ouvrirApercuPDFPour`) : une grille toute à barème s'ouvre sans échelle ; une mixte, non.
 *   C — L'APERÇU ET LE PDF DISENT LA MÊME CHOSE du même critère, grille toute à barème comme mixte ; la
 *       pondération d'une grille toute à barème s'intitule « Points », « % » ailleurs (Grégoire, 20 oct., 18 h 22).
 *   F — LA FORME DE LA GRILLE D'ORIGINE (décision de Grégoire, 20 oct., 18 h 39) : mêmes tranches partout
 *       → une colonne par tranche, nom en tête ; le texte puis les points dans chaque case ; les éléments
 *       observables ; la description ; le total. Un nom, un ordre, un nombre différents, des noms vides →
 *       la forme à une colonne. Aperçu et `autoTable` identiques.
 *   S — LA SÉCURITÉ : un `<img onerror>` dans le texte, le nom d'une tranche ou un élément observable sort en texte.
 *
 * Break-tests (faits le 20 oct.) : voir la demande de relecture.
 *
 * Grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

/* ------------------------------------------------------------------ harnais */

function monter({ productions = [], grilles = [], echelles = [] } = {}) {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const store = {
        'trimestres': [{ id: 'a2026', nom: 'Automne 2026', actif: true }],
        'a2026_productions': productions,
        'a2026_grillesTemplates': grilles,
        'a2026_echellesTemplates': echelles
    };
    const journal = { tables: [], textes: [] };
    const doc = new Proxy({
        internal: { pageSize: { getWidth: () => 216, getHeight: () => 279 }, getNumberOfPages: () => 1 },
        getTextWidth: () => 10,
        splitTextToSize: (t) => [String(t)],
        autoTable: (o) => { journal.tables.push(o); },
        text: (t) => { journal.textes.push(t); },
        save: () => {}
    }, { get: (o, k) => (k in o ? o[k] : () => {}) });

    const win = chargerScript('js/export-pdf.js', {
        db: {
            get: async (k) => (k in store ? store[k] : null),
            getSync: (k, d) => (k in store && store[k] !== null ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {}, alert: () => {},
        // Un VRAI document : `escapeHtml` échappe par textContent → innerHTML, c'est le navigateur qui travaille.
        document: dom.window.document
    });
    win.jspdf = { jsPDF: function () { return doc; } };
    return { win, journal, dom };
}

const tranche = (id, nom, min, max, texte) => ({ id, nom, pointsMin: min, pointsMax: max, texte });

/**
 * Quatre critères analytiques, quatre tranches chacun, aucune échelle. ⚠ Le 4e critère nomme sa
 * première tranche autrement (« Très bien ») : les tranches ne sont donc PAS les mêmes partout, et
 * la grille garde la forme à une colonne (la forme d'origine est éprouvée en F, sur `ORIGINE`).
 */
function critereJournal(n) {
    return {
        id: `CR_J${n}`, nom: `Critère ${n}`, type: 'analytique', ponderation: 4,
        bareme: [
            tranche(`TR_${n}a`, n === 4 ? 'Très bien' : 'Excellent', 3, 4, `Résume l'essentiel ${n}`),
            tranche(`TR_${n}b`, 'Satisfaisant', 2, 2, `Résume en partie ${n}`),
            tranche(`TR_${n}c`, 'Partiel', 1, 1, `Effleure le propos ${n}`),
            tranche(`TR_${n}d`, 'Insuffisant', 0, 0, `Ne résume pas ${n}`)
        ]
    };
}
const JOURNAL = { id: 'GR_J', nom: 'Journal de lecture A26', criteres: [1, 2, 3, 4].map(critereJournal) };
const NOMS_TRANCHES = ['Excellent', 'Très bien', 'Satisfaisant', 'Partiel', 'Insuffisant'];

const ECHELLE = { id: 'EC_1', nom: 'IDME', niveaux: [
    { code: 'I', nom: 'Incomplet' }, { code: 'D', nom: 'Développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }] };
const MIXTE = { id: 'GR_M', nom: 'Grille mixte', criteres: [
    { id: 'CR_H', nom: 'Structure', type: 'holistique', ponderation: 50 },
    critereJournal(9)
] };
const CARTOUCHE = { id: 'CA_1', commentaires: { 'CR_H_I': 'Plan absent', 'CR_H_M': 'Plan clair' } };

const OPTIONS = { cran: 'retroaction', taillePolice: 'petit' };

/**
 * Les lignes du tableau de l'aperçu : [nom, %, ...cases] ; une case à barème → la liste de ses tranches ;
 * une case à plusieurs lignes (forme d'origine) → la liste de ses lignes.
 */
function lignesApercu(dom, html) {
    const conteneur = dom.window.document.createElement('div');
    conteneur.innerHTML = html;   // security-ok: banc, HTML rendu par genererApercuCombine
    return Array.from(conteneur.querySelectorAll('tbody tr')).map(tr => Array.from(tr.children).map(td => {
        if (td.hasAttribute('data-tranches')) return Array.from(td.querySelectorAll('[data-tranche]')).map(d => d.textContent);
        if (td.hasAttribute('data-lignes')) return Array.from(td.querySelectorAll('[data-ligne]')).map(d => d.textContent);
        return td.textContent.trim();
    }));
}

/** Les mêmes lignes, lues dans l'appel `autoTable` du PDF ; une case objet → ses lignes. */
function lignesPDF(table) {
    return table.body.map(ligne => ligne.map(c => (c && typeof c === 'object') ? (c.content ? c.content.split('\n') : []) : c));
}

function entetesApercu(dom, html) {
    const conteneur = dom.window.document.createElement('div');
    conteneur.innerHTML = html;   // security-ok: banc
    return Array.from(conteneur.querySelectorAll('thead th')).map(th => th.textContent.trim());
}

/* ======================================================= L — la ligne d'une tranche */

describe('barème 3 · L — la ligne d’une tranche : ses points, puis son texte, sans son nom', () => {
    const { win } = monter();
    const B = win.bareme;

    it('L.a LE CAS QUI PORTE LE SENS : « 3-4 points : Résume l’essentiel », sans « Satisfaisant »', () => {
        const ligne = B.ligneEleve(tranche('T', 'Satisfaisant', 3, 4, 'Résume l’essentiel'));
        expect(ligne).toBe('3-4 points\u00a0: Résume l’essentiel');
        expect(ligne).not.toContain('Satisfaisant');
    });

    it('L.b un point : l’unité au singulier sous 2, le zéro compris', () => {
        expect(B.ligneEleve(tranche('T', '', 1, 1, 'X'))).toBe('1 point\u00a0: X');
        expect(B.ligneEleve(tranche('T', '', 0, 0, 'X'))).toBe('0 point\u00a0: X');
        expect(B.ligneEleve(tranche('T', '', 1.5, 1.5, 'X'))).toBe('1,5 point\u00a0: X');
        expect(B.ligneEleve(tranche('T', '', 2, 2, 'X'))).toBe('2 points\u00a0: X');
    });

    it('L.c deux bornes : trait court, virgule décimale, accord sur la borne haute', () => {
        expect(B.ligneEleve(tranche('T', '', 1, 2, 'X'))).toBe('1-2 points\u00a0: X');
        expect(B.ligneEleve(tranche('T', '', 0, 1, 'X'))).toBe('0-1 point\u00a0: X');
        expect(B.ligneEleve(tranche('T', '', 2.5, 3, 'X'))).toBe('2,5-3 points\u00a0: X');
    });

    it('L.d une tranche à compléter montre son texte seul, sans chiffre inventé ; rien à lire → rien', () => {
        expect(B.ligneEleve(tranche('T', 'Partiel', null, null, 'Effleure le propos'))).toBe('Effleure le propos');
        expect(B.ligneEleve(tranche('T', '', 2, 2, ''))).toBe('2 points');
        expect(B.ligneEleve(tranche('T', 'Partiel', null, null, ''))).toBe('');
    });
});

/* ======================================================= E — l'échelle exigée ou non */

describe('barème 3 · E — l’échelle n’est exigée que si un critère en lit une', () => {
    const { win } = monter();

    it('E.a LE CAS QUI PORTE LE SENS : une grille toute à barème ne l’exige pas', () => {
        expect(win.echelleExigee(JOURNAL)).toBe(false);
    });

    it('E.b une grille mixte l’exige, pour ses autres critères', () => {
        expect(win.echelleExigee(MIXTE)).toBe(true);
    });

    it('E.c l’ancien format (`parNiveau` sans `echelleId`) se lit comme un barème, par la même fonction', () => {
        const ancienne = { id: 'GR_A', criteres: [{ id: 'CR_A', type: 'analytique', ponderation: 4,
            descripteurs: { parNiveau: { '3-4': 'Résume l’essentiel', '2 points': 'Résume en partie' } } }] };
        expect(win.echelleExigee(ancienne)).toBe(false);
        // Avec `echelleId`, ce sont des textes de niveaux : l'échelle reste exigée.
        const lieeAEchelle = { id: 'GR_B', criteres: [{ id: 'CR_B', type: 'analytique', ponderation: 4,
            descripteurs: { echelleId: 'EC_1', parNiveau: { I: 'a' } } }] };
        expect(win.echelleExigee(lieeAEchelle)).toBe(true);
    });

    it('E.d une grille inconnue ou sans critère l’exige, comme avant', () => {
        expect(win.echelleExigee(null)).toBe(true);
        expect(win.echelleExigee({ id: 'GR_V', criteres: [] })).toBe(true);
    });
});

/* ======================================================= P — la porte de l'aperçu */

describe('barème 3 · P — l’aperçu s’ouvre sans échelle quand aucun critère n’en lit', () => {

    it('P.a LE CAS QUI PORTE LE SENS : une production liée au Journal de lecture, sans échelle, ouvre son aperçu', async () => {
        const { win } = monter({ grilles: [JOURNAL] });
        expect(await win.ouvrirApercuPDFPour({ grilleId: 'GR_J', echelleId: '' })).toBe(true);
    });

    it('P.b une grille mixte sans échelle, sans consignes, ne s’ouvre pas', async () => {
        const { win } = monter({ grilles: [MIXTE] });
        expect(await win.ouvrirApercuPDFPour({ grilleId: 'GR_M', echelleId: '' })).toBe(false);
    });
});

/* ======================================================= C — l'aperçu et le PDF disent la même chose */

describe('barème 3 · C — l’aperçu et le PDF disent la même chose du même critère', () => {

    it('C.a LE CAS QUI PORTE LE SENS : le Journal de lecture sans échelle — quatre lignes par critère, aucun « — », aucun nom', async () => {
        const { win, journal, dom } = monter();
        const html = win.genererApercuCombine(JOURNAL, null, null, OPTIONS);
        await win.genererPDFCombine(JOURNAL, null, null, OPTIONS);

        const apercu = lignesApercu(dom, html);
        expect(apercu).toHaveLength(4);
        apercu.forEach((ligne, i) => {
            const n = i + 1;
            expect(ligne).toEqual([`Critère ${n}`, '4', [
                `3-4 points\u00a0: Résume l'essentiel ${n}`, `2 points\u00a0: Résume en partie ${n}`,
                `1 point\u00a0: Effleure le propos ${n}`, `0 point\u00a0: Ne résume pas ${n}`]]);
        });
        expect(html).not.toContain('—');
        NOMS_TRANCHES.forEach(nom => expect(html).not.toContain(nom));

        expect(journal.tables).toHaveLength(1);
        expect(lignesPDF(journal.tables[0]), 'le PDF dit ce que dit l’aperçu').toEqual(apercu);
        expect(journal.tables[0].head[0]).toEqual(entetesApercu(dom, html));
        // Décision de Grégoire (20 oct., 18 h 22) : « Points » au-dessus de la pondération d'une grille toute à barème.
        expect(journal.tables[0].head[0]).toEqual(['Critère', 'Points', 'Barème']);
    });

    it('C.b une grille toute à barème, même avec une échelle choisie, ne montre pas les niveaux', () => {
        const { win, dom } = monter();
        const html = win.genererApercuCombine(JOURNAL, ECHELLE, null, OPTIONS);
        expect(entetesApercu(dom, html)).toEqual(['Critère', 'Points', 'Barème']);
        expect(html).not.toContain('Incomplet');
    });

    it('C.c une grille mixte garde ses colonnes de niveaux ; le critère à barème les réunit', async () => {
        const { win, journal, dom } = monter();
        const html = win.genererApercuCombine(MIXTE, ECHELLE, CARTOUCHE, OPTIONS);
        await win.genererPDFCombine(MIXTE, ECHELLE, CARTOUCHE, OPTIONS);

        const entetes = ['Critère', '%', 'I - Incomplet', 'D - Développement', 'M - Maîtrisé', 'E - Étendu'];
        expect(entetesApercu(dom, html)).toEqual(entetes);
        const apercu = lignesApercu(dom, html);
        expect(apercu[0]).toEqual(['Structure', '50', 'Plan absent', '—', 'Plan clair', '—']);
        expect(apercu[1][2]).toHaveLength(4);
        expect(apercu[1]).toHaveLength(3);

        const table = journal.tables[0];
        expect(table.head[0]).toEqual(entetes);
        expect(lignesPDF(table)).toEqual(apercu);
        expect(table.body[1][2].colSpan, 'la case du barème couvre les quatre niveaux').toBe(4);
        NOMS_TRANCHES.forEach(nom => expect(html).not.toContain(nom));
    });

    it('C.d une grille mixte sans échelle ne montre pas de tableau, et ne plante pas', async () => {
        const { win, journal } = monter();
        expect(win.tableauDesCriteres(MIXTE, null, null)).toBeNull();
        expect(() => win.genererApercuCombine(MIXTE, null, null, OPTIONS)).not.toThrow();
        await win.genererPDFCombine(MIXTE, null, null, OPTIONS);
        expect(journal.tables).toHaveLength(0);
    });

    it('C.f une grille à échelle garde « % », dans l’aperçu comme dans le PDF', async () => {
        const { win, journal, dom } = monter();
        const g = { id: 'GR_E', nom: 'Grille à échelle', criteres: [{ id: 'CR_H', nom: 'Structure', type: 'holistique', ponderation: 100 }] };
        const html = win.genererApercuCombine(g, ECHELLE, null, OPTIONS);
        await win.genererPDFCombine(g, ECHELLE, null, OPTIONS);
        expect(entetesApercu(dom, html)[1]).toBe('%');
        expect(journal.tables[0].head[0][1]).toBe('%');
    });

    it('C.e les tranches dans l’ordre où l’enseignant les a écrites, pas triées', () => {
        const { win } = monter();
        const g = { id: 'G', criteres: [{ id: 'C', nom: 'C', type: 'analytique', ponderation: 4, bareme: [
            tranche('a', '', 0, 0, 'zéro'), tranche('b', '', 3, 4, 'haut'), tranche('c', '', 1, 2, 'milieu')] }] };
        expect(win.tableauDesCriteres(g, null, null).lignes[0].tranches.map(l => l.split('\u00a0: ')[1]))
            .toEqual(['zéro', 'haut', 'milieu']);
    });
});

/* ======================================================= F — la forme de la grille d'origine */

const NOMS_ORIGINE = ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable'];
/** Les mêmes quatre tranches partout (noms et ordre), des points qui diffèrent : la grille de Grégoire, fictive. */
function critereOrigine(n, max) {
    const bornes = max === 5 ? [[1, 1], [2, 2], [3, 4], [5, 5]] : [[1, 3], [4, 5], [6, 8], [9, 10]];
    return {
        id: `CR_O${n}`, nom: `Partie fictive : critère ${n}`, type: 'analytique', ponderation: max,
        sousCriteres: [{ id: `SC_${n}a`, code: '0', nom: `Observable ${n}a` }, { id: `SC_${n}b`, code: '1', nom: `Observable ${n}b` }],
        bareme: NOMS_ORIGINE.map((nom, k) => tranche(`TR_O${n}${k}`, nom, bornes[k][0], bornes[k][1], `Texte ${n}.${k}`))
    };
}
const ORIGINE = { id: 'GR_O', nom: 'Grille d’origine fictive', description: 'Rendre compte d’une lecture fictive.',
    criteres: [critereOrigine(1, 5), critereOrigine(2, 5), critereOrigine(3, 10), critereOrigine(4, 10)] };

/** Une copie de la grille, chaque critère passé par `transformer(critere, rang)`. */
function avecTranches(g, transformer) {
    const copie = JSON.parse(JSON.stringify(g));
    copie.criteres = copie.criteres.map(transformer);
    return copie;
}

describe('barème 3 · F — mêmes tranches partout : la forme de la grille d’origine', () => {

    it('F.a LE CAS QUI PORTE LE SENS : une colonne par tranche, le texte puis les points, les observables, le total — aperçu = PDF', async () => {
        const { win, journal, dom } = monter();
        const html = win.genererApercuCombine(ORIGINE, null, null, OPTIONS);
        await win.genererPDFCombine(ORIGINE, null, null, OPTIONS);

        const entetes = ['Critère', 'Points', ...NOMS_ORIGINE];
        expect(entetesApercu(dom, html)).toEqual(entetes);
        const apercu = lignesApercu(dom, html);
        expect(apercu).toHaveLength(5);
        expect(apercu[0]).toEqual([['Partie fictive : critère 1', '· Observable 1a', '· Observable 1b'], '5',
            ['Texte 1.0', '1 point'], ['Texte 1.1', '2 points'], ['Texte 1.2', '3-4 points'], ['Texte 1.3', '5 points']]);
        expect(apercu[2][2]).toEqual(['Texte 3.0', '1-3 points']);
        expect(apercu[4], 'la rangée « Total »').toEqual(['Total', '30', []]);

        const table = journal.tables[0];
        expect(table.head[0]).toEqual(entetes);
        expect(lignesPDF(table), 'le PDF dit ce que dit l’aperçu').toEqual(apercu);
        expect(html).not.toContain('Barème');
    });

    it('F.b la description de la grille, au-dessus du tableau, dans l’aperçu et dans le PDF', async () => {
        const { win, journal, dom } = monter();
        const html = win.genererApercuCombine(ORIGINE, null, null, OPTIONS);
        await win.genererPDFCombine(ORIGINE, null, null, OPTIONS);
        const conteneur = dom.window.document.createElement('div');
        conteneur.innerHTML = html;   // security-ok: banc
        expect(conteneur.querySelector('[data-description-grille]').textContent).toBe('Rendre compte d’une lecture fictive.');
        expect(journal.textes).toContainEqual(['Rendre compte d’une lecture fictive.']);
        // Sans description : aucune ligne.
        const sans = Object.assign({}, ORIGINE, { description: '  ' });
        expect(win.genererApercuCombine(sans, null, null, OPTIONS)).not.toContain('data-description-grille');
    });

    it('F.c un nom, un ordre, un nombre différents, ou des noms vides → la forme à une colonne', () => {
        const { win } = monter();
        const cas = {
            'un nom différent': avecTranches(ORIGINE, (c, i) => (i === 2 ? Object.assign(c, { bareme: c.bareme.map((t, k) => (k === 0 ? Object.assign(t, { nom: 'Faible' }) : t)) }) : c)),
            'un ordre différent': avecTranches(ORIGINE, (c, i) => (i === 1 ? Object.assign(c, { bareme: c.bareme.slice().reverse() }) : c)),
            'un nombre différent': avecTranches(ORIGINE, (c, i) => (i === 3 ? Object.assign(c, { bareme: c.bareme.slice(0, 3) }) : c)),
            'des noms vides': avecTranches(ORIGINE, c => Object.assign(c, { bareme: c.bareme.map(t => Object.assign(t, { nom: '' })) }))
        };
        Object.entries(cas).forEach(([quoi, g]) => {
            const t = win.tableauDesCriteres(g, null, null);
            expect(t.colonnesTranches, quoi).toBeNull();
            expect(t.total, quoi).toBeNull();
        });
        // Les noms comparés après `trim` : une espace de trop ne change pas la forme.
        const espaces = avecTranches(ORIGINE, (c, i) => (i === 0 ? Object.assign(c, { bareme: c.bareme.map(t => Object.assign(t, { nom: ' ' + t.nom + ' ' })) }) : c));
        expect(win.tableauDesCriteres(espaces, null, null).colonnesTranches).toEqual(NOMS_ORIGINE);
    });

    it('F.d une tranche à compléter montre son texte seul ; une tranche sans texte, ses points seuls', () => {
        const { win } = monter();
        const g = avecTranches(ORIGINE, (c, i) => (i === 0 ? Object.assign(c, { bareme: c.bareme.map((t, k) =>
            (k === 0 ? Object.assign(t, { pointsMin: null, pointsMax: null }) : k === 1 ? Object.assign(t, { texte: '' }) : t)) }) : c));
        const cases = win.tableauDesCriteres(g, null, null).lignes[0].cases;
        expect(cases[0]).toEqual(['Texte 1.0']);
        expect(cases[1]).toEqual(['2 points']);
    });

    it('F.e une grille mixte ou à une colonne : ni total, ni description, ni observables', () => {
        const { win } = monter();
        [win.tableauDesCriteres(MIXTE, ECHELLE, null), win.tableauDesCriteres(JOURNAL, null, null)].forEach(t => {
            expect(t.total).toBeNull();
            expect(t.description).toBe('');
            t.lignes.forEach(l => expect(l.observables).toEqual([]));
        });
    });
});

/* ======================================================= S — la sécurité */

describe('barème 3 · S — le texte d’une tranche sort en texte', () => {
    it('S.a un `<img onerror>` dans le texte d’une tranche n’est pas un élément de l’aperçu', () => {
        const { win, dom } = monter();
        const charge = '<img src=x onerror="window.__pirate=1">';
        const g = { id: 'G', nom: 'G', criteres: [{ id: 'C', nom: 'C', type: 'analytique', ponderation: 2,
            bareme: [tranche('a', '', 2, 2, charge)] }] };
        const html = win.genererApercuCombine(g, null, null, OPTIONS);
        const conteneur = dom.window.document.createElement('div');
        conteneur.innerHTML = html;   // security-ok: banc, c'est l'échappement qu'on mesure
        expect(conteneur.querySelector('td[data-tranches] img')).toBeNull();
        expect(conteneur.querySelector('[data-tranche]').textContent).toBe('2 points\u00a0: ' + charge);
    });

    it('S.b forme d’origine : un `<img onerror>` dans un nom de tranche, un élément observable, la description sort en texte', () => {
        const { win, dom } = monter();
        const charge = '<img src=x onerror="window.__pirate=1">';
        const g = JSON.parse(JSON.stringify(ORIGINE));
        g.description = charge;
        g.criteres.forEach(c => { c.bareme[0].nom = charge; c.sousCriteres[0].nom = charge; });
        const html = win.genererApercuCombine(g, null, null, OPTIONS);
        const conteneur = dom.window.document.createElement('div');
        conteneur.innerHTML = html;   // security-ok: banc, c'est l'échappement qu'on mesure
        expect(conteneur.querySelector('img:not([alt])')).toBeNull();
        expect(conteneur.querySelector('thead th:nth-child(3)').textContent).toBe(charge);
        expect(conteneur.querySelector('tbody [data-ligne]:nth-child(2)').textContent).toBe('· ' + charge);
        expect(conteneur.querySelector('[data-description-grille]').textContent).toBe(charge);
    });
});
