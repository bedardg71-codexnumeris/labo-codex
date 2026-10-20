/**
 * Sentinelle — « AUCUN » AU MENU « NIVEAU SOLO » (consigne du 4 septembre 2026, lot 4, volet B).
 *
 * Retour de Grégoire : « si je m'en tiens à une méthode traditionnelle, le menu des niveaux SOLO
 * devrait m'offrir la possibilité d'écrire "Aucun" ». Sens arrêté : « Aucun » (`'aucun'`) = ce
 * critère ne nourrit pas la lecture SOLO ; il compte dans la note, le dépistage le saute. Le
 * DÉFAUT ne bouge pas : sans étiquette, un critère est multistructurel (#542).
 *
 *   A — les deux menus offrent « Aucun », et le défaut reste multistructurel ;
 *   B — les lecteurs sautent : libellé vide, pas de parenthèse « () », pas de badge ;
 *   C — le dépistage : une grille toute « Aucun » n'a pas d'IPB, et le tableau de bord le DIT ;
 *   D — le transport : la valeur traverse l'import/export et le partage ; l'export du trimestre
 *       dit « aucun », pas « fondamental » ;
 *   E — l'aide sous le menu explique le choix.
 *
 * Carte des neuf lecteurs : `plans de travail/CARTE-2026-09-04-lot4-B-lecteurs-niveauSOLO.md`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ------------------------------------------------------------------ harnais */

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}
function fauxDocument() {
    const elements = {};
    return {
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} }, createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}
const dbVide = { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync() {},
                 modifier: async () => undefined };

function monterGrilles() {
    const document = fauxDocument();
    const win = chargerScript('js/grilles.js', {
        db: dbVide, document, cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + 'x', alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    });
    win.estRessourceSupprimee = () => false; win.IDS_GABARITS_HARDCODES = [];
    win.boutonRetirerBloc = () => ''; win.boutonsReordonnerBloc = () => '';
    return { win, liste: () => document.getElementById('listeCriteres') };
}

function monterProfil(grilleReference) {
    const stubs = {
        db: dbVide, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee() {}, afficherSection() {}, afficherSousSection() {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.65, chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (arr) => arr, estModeeLectureSeule: () => false,
        genererSeancesCompletes() {}, calculerEtSauvegarderIndicesAssiduite() {}, calculerEtStockerIndicesCP() {},
        obtenirGrilleReferenceDepistage: () => grilleReference,
        obtenirNombreProductionsPourPatterns: () => 3, obtenirIdsProductionsEvaluables: () => []
    };
    const win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    // #740 (16 sept. 2026) : le filtre SOLO « Aucun » vit dans helpers ; calculs le lit comme global — le VRAI, pas une copie.
    stubs.estCritereSurveilleParDepistage = win.estCritereSurveilleParDepistage;
    stubs.criteresSurveillesParDepistage = win.criteresSurveillesParDepistage;
    stubs.criteresSuiviFondations = win.criteresSuiviFondations;   // ↻ #1117, suite : la règle de l'IPB vit aussi dans helpers
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);
    return win;
}

const SOLO_MENU = (html, valeur) => new RegExp('<option value="' + valeur + '"( selected)?>').exec(html);

/* ---------------------------------------------------- A — le menu, et le défaut */

describe('lot 4 · B.A — les deux menus offrent « Aucun », le défaut reste multistructurel', () => {
    it('A.a en ÉDITION : « Aucun » est offert ; un critère « aucun » le montre choisi ; un critère sans étiquette montre multistructurel', () => {
        const { win, liste } = monterGrilles();
        win.afficherCriteresGrille({ id: 'G1', criteres: [
            { id: 'C1', nom: 'Langue', type: 'holistique', ponderation: 50, niveauSOLO: 'aucun' },
            { id: 'C2', nom: 'Contenu', type: 'holistique', ponderation: 50 }
        ] });
        const html = liste().innerHTML;
        const menus = html.split('data-champ="niveauSOLO"');
        expect(menus.length, 'deux menus SOLO').toBe(3);
        expect(menus[1]).toContain('<option value="aucun" selected>Aucun</option>');
        expect(menus[1]).toContain('<option value="multistructurel" >Multistructurel</option>');
        expect(menus[2]).toContain('<option value="multistructurel" selected>Multistructurel</option>');
        expect(menus[2]).toContain('<option value="aucun" >Aucun</option>');
        // ↻ Coup d'œil de Grégoire (4 sept., retouche a) : « Aucun » EN TÊTE du menu, avant
        // « Multistructurel » — l'ordre des options change, pas la valeur choisie par défaut.
        expect(menus[1].indexOf('value="aucun"')).toBeLessThan(menus[1].indexOf('value="multistructurel"'));
        expect(menus[2].indexOf('value="aucun"')).toBeLessThan(menus[2].indexOf('value="multistructurel"'));
    });

    it('A.b en CRÉATION : même menu, même défaut', () => {
        const { win, liste } = monterGrilles();
        win.tempTypeGrille = '';
        win.tempCriteres = [{ id: 'T1', nom: 'Langue', type: 'holistique', ponderation: 100, niveauSOLO: 'aucun' }, { id: 'T2', nom: 'X', type: 'holistique', ponderation: 0 }];
        win.afficherCriteresTemp();
        const html = liste().innerHTML;
        expect((html.match(/<option value="aucun"/g) || []).length).toBe(2);
        expect(html).toContain('<option value="aucun" selected>Aucun</option>');
        expect(html).toContain('<option value="multistructurel" selected>Multistructurel</option>');
        expect(html.indexOf('value="aucun"')).toBeLessThan(html.indexOf('value="multistructurel"'));
    });

    // ↻ 19 oct. 2026 (#1117, Grégoire, 22 h 05) : observation SOLO DÉSACTIVÉE, le critère créé à la
    // main reçoit « aucun ». Activée, le défaut de ce lot tient. La règle vit dans
    // `sentinelle-1117-solo-suit-le-reglage.test.js` ; ici, le défaut d'avant.
    it('A.c observation SOLO activée, le défaut d\'un critère neuf reste multistructurel — « Aucun » se choisit', () => {
        const { win } = monterGrilles();
        expect(win.niveauSOLOCritereNeuf(true)).toBe('multistructurel');
        const code = sansCommentaires(source('js/grilles.js'));
        expect(code).not.toContain("niveauSOLO: 'aucun'");
    });
});

/* ------------------------------------------------------ B — les lecteurs sautent */

describe('lot 4 · B.B — un critère « Aucun » n\'a pas de libellé SOLO, et les lecteurs le savent', () => {
    let win;
    beforeAll(() => { win = monterProfil(null); });

    it('B.a `libelleNiveauSOLO` : vide pour « aucun » ; les autres valeurs et le défaut comme avant', () => {
        expect(win.libelleNiveauSOLO('aucun')).toBe('');
        expect(win.libelleNiveauSOLO(undefined)).toBe('multistructurel');
        expect(win.libelleNiveauSOLO('')).toBe('multistructurel');
        expect(win.libelleNiveauSOLO('multistructurel')).toBe('multistructurel');
        expect(win.libelleNiveauSOLO('relationnel')).toBe('relationnel');
        expect(win.libelleNiveauSOLO('abstrait_etendu')).toBe('abstrait étendu');
    });

    it('B.b la cible d\'intensité nomme le défi sans « () » quand il n\'a pas d\'étiquette', () => {
        expect(win.nommerDefiAvecSOLO({ nom: 'Langue', niveauSOLO: 'aucun' })).toBe('Langue');
        expect(win.nommerDefiAvecSOLO({ nom: 'Langue', niveauSOLO: 'relationnel' })).toBe('Langue (relationnel)');
        expect(win.nommerDefiAvecSOLO({ nom: 'Langue' })).toBe('Langue (multistructurel)');
        // Et c'est bien elle que la cible appelle — plus la concaténation à la main.
        const code = sansCommentaires(source('js/profil-etudiant-calculs.js'));
        expect(code).toContain("suivi.diagnostic + ' — ' + nommerDefiAvecSOLO(defi)");
        expect(code).not.toContain("' (' + libelleNiveauSOLO(defi.niveauSOLO) + ')'");
    });

    it('B.c le formulaire d\'intervention : pas de badge sans libellé, le critère reste ciblable', () => {
        const code = sansCommentaires(source('js/interventions.js'));
        expect(code).toMatch(/var badgeSolo = niveauLabel && soloActive\s*\?/);   // ↻ #1117 : et le réglage
        expect(code).toContain("badgeSolo +");
        expect(code).toContain("'<input type=\"checkbox\" class=\"critere-cible-cb\" value=\"' + echapperHtml(c.nom)");
    });
});

/* -------------------------------------------------------------- C — le dépistage */

describe('lot 4 · B.C — le dépistage : une grille toute « Aucun » n\'a pas d\'IPB, et l\'écran le dit', () => {
    it('C.a `calculerIPB` rend null quand aucun critère n\'est multistructurel ; le profil nomme déjà la cause', () => {
        const toutAucun = monterProfil({ id: 'G', criteres: [{ id: 'a', nom: 'A', niveauSOLO: 'aucun' }, { id: 'b', nom: 'B', niveauSOLO: 'aucun' }] });
        expect(toutAucun.calculerIPB('1234567')).toBeNull();
        expect(toutAucun.diagnostiquerSuiviApprentissage('1234567')).toBeNull();
        // Le filtre est celui de #542 : un critère sans étiquette est une fondation, « aucun » n'en est pas une.
        // #740 (16 sept. 2026) : l'IPB filtre « multistructurel » PARMI les critères que le dépistage lit — la liste partagée.
        // ↻ #1117, suite (20 oct. 2026) : ce filtre vit dans `criteresSuiviFondations` (helpers), que l'IPB lit.
        const code = sansCommentaires(source('js/profil-etudiant-calculs.js'));
        expect(sansCommentaires(source('js/profil-etudiant-helpers.js')))
            .toContain("return surveilles.filter(c => (c.niveauSOLO || 'multistructurel') === 'multistructurel');");
        expect(code).toContain('var criteresMulti = criteresSuiviFondations(grille);');
        // #744 (lot C, 17 sept. 2026) : sans suivi, c'est la PERSISTANCE qui n'est pas calculable — le palier vient de la carte RàI.
        expect(code).toContain("'Persistance non calculable — aucun suivi des fondations disponible'");
    });

    it('C.b le sous-titre du tableau de bord : les critères surveillés, ou la phrase qui dit qu\'il n\'y en a pas', () => {
        // ↻ #1117, suite : le sous-titre lit la règle de l'IPB, la VRAIE, chargée depuis helpers.
        const h = monterProfil(null);
        const win = chargerScript('js/tableau-bord-apercu.js', {
            db: dbVide, cle: (k) => 'a2026_' + k, echapperHtml: (s) => String(s == null ? '' : s).replace(/</g, '&lt;'),
            document: fauxDocument(),
            criteresSuiviFondations: h.criteresSuiviFondations, etiquettesSOLOLuesParDepistage: h.etiquettesSOLOLuesParDepistage
        });
        const f = win.libelleCriteresMultiSurveilles;
        expect(typeof f).toBe('function');
        expect(f({ criteres: [{ nom: 'Langue' }, { nom: 'Rigueur', niveauSOLO: 'relationnel' }, { nom: 'Thèse', niveauSOLO: 'aucun' }] }))
            .toBe('Critères multistructurels surveillés : Langue');
        expect(f({ criteres: [{ nom: 'A', niveauSOLO: 'aucun' }, { nom: 'B', niveauSOLO: 'aucun' }] }))
            .toBe('Aucun critère multistructurel dans la grille de dépistage : le suivi des fondations ne surveille rien.');
        expect(f({ criteres: [{ nom: 'A', niveauSOLO: 'relationnel' }] }))
            .toBe('Aucun critère multistructurel dans la grille de dépistage : le suivi des fondations ne surveille rien.');
        // Sans grille, sans critère : rien — comme avant.
        expect(f(null)).toBe('');
        expect(f({ criteres: [] })).toBe('');
        // Et les noms sont échappés.
        expect(f({ criteres: [{ nom: '<b>' }] })).toBe('Critères multistructurels surveillés : &lt;b>');
        // Le site qui rend la barre passe par elle.
        expect(sansCommentaires(source('js/tableau-bord-apercu.js'))).toContain('var libelleMulti = libelleCriteresMultiSurveilles(');
    });
});

/* ------------------------------------------------------------- D — le transport */

describe('lot 4 · B.D — « aucun » voyage : import/export, partage, export du trimestre', () => {
    it('D.a `assainirObjet` (import/export) et `projeterEntite` (partage) gardent la valeur', () => {
        const grille = () => ({ id: 'G', nom: 'Grille', criteres: [{ id: 'C', nom: 'Langue', type: 'holistique', ponderation: 100, niveauSOLO: 'aucun' }] });
        const winIE = chargerScript('js/import-export.js');
        expect(winIE.assainirObjet(grille(), winIE.SCHEMAS_IMPORT.grille).criteres[0].niveauSOLO).toBe('aucun');
        const winP = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-format.js', { db: dbVide }, winP);
        expect(winP.partageFormat.projeterEntite(grille(), 'grille').criteres[0].niveauSOLO).toBe('aucun');
    });

    it('D.b l\'export du trimestre dit « aucun » — ni « fondamental », ni un type deviné (fonction privée : statique)', () => {
        const code = sansCommentaires(source('js/trimestres.js'));
        const f = code.slice(code.indexOf('function typeCritereSelonSOLO(critere)'), code.indexOf('function calculerSemaine('));
        expect(f).toContain("if (solo === 'aucun') return 'aucun';");
        expect(f).toContain("return 'fondamental';");
        expect(code).toContain("niveau_solo: (c.niveauSOLO || 'multistructurel'),");
    });
});

/* ------------------------------------------------------------------ E — l'aide */

describe('lot 4 · B.E — l\'aide sous le menu explique « Aucun »', () => {
    it('E.a la fiche « grille-niveau-solo » dit ce que « Aucun » retire, et ce qu\'il garde', () => {
        const code = source('js/accompagnement-contenu-popup.js');
        const fiche = code.slice(code.indexOf("'grille-niveau-solo': {"), code.indexOf("voirAussi: ['depistage-interpretation', 'suivi-apprentissage-fondamentaux']"));
        expect(fiche).toContain('« Aucun »');
        expect(fiche).toContain('il compte dans la note comme les autres');
        expect(fiche).toContain('le dépistage des fondations ne le surveille pas');
    });
});
