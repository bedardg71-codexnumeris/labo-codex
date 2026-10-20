/**
 * #703 · L'ÉDITEUR DE GRILLE DIT QUE DES CRITÈRES N'ONT PAS DE TYPE, ET PROPOSE
 * (décision de Grégoire, 19 sept. 2026 ; constat C-1 de l'audit du moteur)
 *
 * LE FAIT : le type déclaré à la grille n'est lu ni par le calcul ni par la palette, qui ne
 * connaissent que `critere.type`. Une grille passée en « Analytique » garde ses critères sans
 * type en holistique, sans un mot. ÉCARTÉ : faire suivre le type d'office.
 *
 * CE QUE CE BANC VERROUILLE :
 *   A · les mots et le compte, et les cas où l'éditeur se tait ;
 *   B · le geste : le type va aux critères SANS type et à eux seuls ; sans le geste, rien d'écrit ;
 *   C · LA MESURE exigée par la consigne — le geste ne recalcule aucune note enregistrée : les
 *       évaluations en base sont identiques à l'octet, et la portée relue pour le PDF aussi.
 *
 * Aucune donnée réelle. Harnais : celui de `sentinelle-type-grille-lot1.test.js`, avec un
 * `classList` qui retient son état (l'avis se montre et se cache par `u-hide`).
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function fauxElement() {
    const classes = new Set();
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c),
            toggle: (c, force) => { const f = force === undefined ? !classes.has(c) : !!force; if (f) classes.add(c); else classes.delete(c); return f; } },
        focus() {}, select() {}, querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, removeChild() {}, setAttribute() {}, click() {}, scrollIntoView() {}
    };
}
function fauxDocument() {
    const elements = {};
    return { getElementById: (id) => (elements[id] || (elements[id] = fauxElement())), querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {}, insertAdjacentHTML() {} }, createElement: () => fauxElement(), addEventListener() {}, removeEventListener() {} };
}

const CLE_GRILLES = 'a2026_grillesTemplates';
const CLE_EVALS = 'a2026_evaluationsSauvegardees';
const echapper = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function monter(grilles, evaluations) {
    const store = { [CLE_GRILLES]: grilles, [CLE_EVALS]: evaluations || [] };
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => { const r = await mutateur(k in store ? store[k] : defaut); if (r === undefined) return undefined; store[k] = r; return r; }
    };
    const document = fauxDocument();
    const win = chargerScript('js/grilles.js', {
        db, document, cle: (k) => 'a2026_' + k, echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true, prompt: () => 'Copie',
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', nommerCopie: (n) => n + ' (copie)', grilleTemplateActuelle: null
    });
    win.estRessourceSupprimee = () => false; win.marquerRessourceSupprimee = () => {}; win.IDS_GABARITS_HARDCODES = [];
    win.bareme = chargerScript('js/bareme.js').bareme;   // #1120, lot 1 : la lecture du barème, que la liste des critères appelle
    win.boutonRetirerBloc = () => ''; win.boutonsReordonnerBloc = () => '';
    const avis = () => document.getElementById('avisTypeCriteresGrille');
    const choisir = (valeur) => { const m = document.getElementById('typeGrille'); m.value = valeur; return win.modifierTypeGrilleHandler(m); };
    return { win, store, document, avis, choisir, grille: (id) => store[CLE_GRILLES].find((g) => g.id === id) };
}

// Une grille d'avant le lot 1 : trois critères SANS type, un quatrième déjà algorithmique.
const GRILLE = () => ({ id: 'G1', nom: 'Analyse', dansBibliotheque: true, criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 40 }, { id: 'c2', nom: 'Organisation', ponderation: 30 },
    { id: 'c3', nom: 'Style', ponderation: 10 }, { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' } ] });
const EVAL = (id, extra) => Object.assign({ id, etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1', noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: true,
    criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 40 }, { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'M', ponderation: 30 },
        { critereId: 'c3', critereNom: 'Style', niveauSelectionne: 'M', ponderation: 10 }, { critereId: 'a1', critereNom: 'Français écrit', niveauSelectionne: 'M', ponderation: 20 }],
    donneesAlgorithmiques: { a1: { erreurs: 4, mots: 500, pourcentage: 84, niveau: 'M' } } }, extra || {});

describe('#703 · A — ce que l\'éditeur dit, et quand il se tait', () => {
    it('A.a les mots : le compte, le singulier, et la phrase des évaluations déjà faites', () => {
        const { win } = monter([]);
        const g = Object.assign(GRILLE(), { type: 'analytique' });
        expect(win.motsAvisCriteresSansType(g, 0)).toEqual({
            phrase: '3 critères de cette grille n\'ont pas de type : ils se calculent encore en holistique.', bouton: 'Les passer en analytique' });
        expect(win.motsAvisCriteresSansType(g, 12).phrase).toBe(
            '3 critères de cette grille n\'ont pas de type : ils se calculent encore en holistique. Les 12 évaluations déjà faites avec ces critères gardent leur note.');
        const un = { id: 'G2', type: 'algorithmique', criteres: [{ id: 'k', nom: 'K', ponderation: 100 }] };
        expect(win.motsAvisCriteresSansType(un, 1)).toEqual({
            phrase: 'Un critère de cette grille n\'a pas de type : il se calcule encore en holistique. L\'évaluation déjà faite avec ce critère garde sa note.', bouton: 'Le passer en algorithmique' });
    });

    it('A.b il se tait : grille sans type, grille holistique (rien ne diverge), aucun critère sans type, grille en création (sans identifiant)', () => {
        const { win } = monter([]);
        expect(win.motsAvisCriteresSansType(GRILLE(), 0)).toBeNull();
        expect(win.motsAvisCriteresSansType(Object.assign(GRILLE(), { type: 'holistique' }), 0)).toBeNull();
        expect(win.motsAvisCriteresSansType({ id: 'G3', type: 'analytique', criteres: [{ id: 'k', type: 'holistique' }] }, 0)).toBeNull();
        expect(win.motsAvisCriteresSansType({ type: 'analytique', criteres: [{ id: 'k' }] }, 0)).toBeNull();
    });

    it('A.c à l\'écran : passer la grille en « Analytique » montre l\'avis, son compte et son bouton ; revenir à « Non précisé » le cache', async () => {
        const { win, avis, choisir } = monter([GRILLE()], [EVAL('EV1'), EVAL('EV2'), EVAL('EV3', { grilleId: 'AUTRE' })]);
        await win.chargerGrillePourModif('G1');
        expect(avis().classList.contains('u-hide'), 'grille sans type : rien à dire').toBe(true);
        await choisir('analytique');
        expect(avis().classList.contains('u-hide')).toBe(false);
        expect(avis().innerHTML).toContain('3 critères de cette grille n&#39;ont pas de type');
        expect(avis().innerHTML).toContain('Les 2 évaluations déjà faites avec ces critères gardent leur note.');   // EV3 est d'une autre grille
        expect(avis().innerHTML).toContain('data-action="appliquerTypeGrilleAuxCriteresSansType"');
        expect(avis().innerHTML).toContain('>Les passer en analytique</button>');
        await choisir('');
        expect(avis().classList.contains('u-hide')).toBe(true);
        expect(avis().innerHTML).toBe('');
    });
});

describe('#703 · B — le geste, et rien sans lui', () => {
    it('B.a SANS le geste, changer le type de la grille n\'écrit aucun type sur les critères', async () => {
        const { win, choisir, grille } = monter([GRILLE()]);
        await win.chargerGrillePourModif('G1');
        await choisir('analytique');
        expect(grille('G1').type).toBe('analytique');
        expect(grille('G1').criteres.map((c) => c.type)).toEqual([undefined, undefined, undefined, 'algorithmique']);
    });

    it('B.b le geste : les trois critères sans type deviennent analytiques, l\'algorithmique n\'est PAS touché, et l\'avis se tait', async () => {
        const { win, avis, choisir, grille } = monter([GRILLE()]);
        await win.chargerGrillePourModif('G1');
        await choisir('analytique');
        await win.appliquerTypeGrilleAuxCriteresSansType();
        expect(grille('G1').criteres.map((c) => c.type)).toEqual(['analytique', 'analytique', 'analytique', 'algorithmique']);
        expect(avis().classList.contains('u-hide')).toBe(true);
    });

    it('B.c le geste ne part pas sous une grille sans type ni sous « Holistique » : rien n\'est écrit', async () => {
        const { win, choisir, grille } = monter([GRILLE()]);
        await win.chargerGrillePourModif('G1');
        await win.appliquerTypeGrilleAuxCriteresSansType();
        await choisir('holistique');
        await win.appliquerTypeGrilleAuxCriteresSansType();
        expect(grille('G1').criteres.map((c) => c.type)).toEqual([undefined, undefined, undefined, 'algorithmique']);
    });
});

describe('#703 · C — LA MESURE : le geste ne recalcule aucune note enregistrée', () => {
    const ECHELLE = [{ code: 'I', min: 0, max: 59, valeurCalcul: 50 }, { code: 'D', min: 60, max: 74, valeurCalcul: 65 },
        { code: 'M', min: 75, max: 89, valeurCalcul: 84 }, { code: 'E', min: 90, max: 100, valeurCalcul: 95 }];
    const valeurNumeriqueDuNiveau = (n) => (n && n.valeurCalcul != null && !isNaN(Number(n.valeurCalcul))) ? Number(n.valeurCalcul) : null;

    for (const type of ['analytique', 'algorithmique']) {
        it(`vers « ${type} » : les évaluations en base sont identiques, et la portée relue pour le PDF aussi`, async () => {
            const { win, store, choisir, grille } = monter([GRILLE()], [EVAL('EV1'), EVAL('EV2', { noteFinale: 72.5, niveauFinal: 'D' })]);
            const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
            await win.chargerGrillePourModif('G1');
            const evalsAvant = JSON.stringify(store[CLE_EVALS]);
            const porteeAvant = JSON.stringify(calcul.porteeDepuisEvaluation(store[CLE_EVALS][0], grille('G1'), ECHELLE));
            await choisir(type);
            await win.appliquerTypeGrilleAuxCriteresSansType();
            expect(grille('G1').criteres.slice(0, 3).map((c) => c.type)).toEqual([type, type, type]);
            expect(JSON.stringify(store[CLE_EVALS])).toBe(evalsAvant);
            const porteeApres = calcul.porteeDepuisEvaluation(store[CLE_EVALS][0], grille('G1'), ECHELLE);
            // La portée cite les critères de la grille : on compare ce qu'elle CONCLUT, et les valeurs comptées.
            const conclusion = (p) => ({ couverte: p.ponderationCouverte, grille: p.ponderationGrille, incomplete: p.incomplete, hors: p.criteresHorsNote.length,
                valeurs: p.criteresComptes.map((c) => c.critere.id + ':' + c.niveau + ':' + c.valeur) });
            expect(conclusion(porteeApres)).toEqual(conclusion(JSON.parse(porteeAvant)));
            expect(conclusion(porteeApres)).toEqual({ couverte: 100, grille: 100, incomplete: false, hors: 0, valeurs: ['c1:M:84', 'c2:M:84', 'c3:M:84', 'a1:M:84'] });
        });
    }
});
