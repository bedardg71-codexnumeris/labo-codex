import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #453 §3 — UNE RÉFÉRENCE NON RÉSOLUE EST PRÉSERVÉE ET SIGNALÉE, JAMAIS
// BLANCHIE EN SILENCE.
//
// Le mécanisme, mesuré sur les données réelles de Grégoire (relevé r2 du
// 11 août 2026 : 27 champs perdus, 0 indécidable) :
//
//     productions.js   selectGrille.value = prod.grilleId || '';   (affichage)
//     productions.js   const grilleId = grille ? grille.value : ''; (relecture)
//
// Un <select> à qui on assigne un id ABSENT de ses options retombe
// silencieusement sur ''. Ouvrir un artefact dans cet état, corriger un
// détail, enregistrer : le '' de l'AFFICHAGE devient le '' du DISQUE — et
// l'écriture efface la preuve de ce qui l'a causée.
//
// Le correctif (`poserReferenceSelect`) réinjecte l'id non résolu comme
// option visible « ⚠ introuvable » : la référence fait l'aller-retour
// affichage → disque INTACTE, la console la signale, et seul un choix
// explicite de l'utilisateur peut désormais l'effacer. Les 13 références
// saines du relevé r2 étaient exposées au même piège — ce banc les protège.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceProductions = readFileSync(path.join(racineProjet, 'js', 'productions.js'), 'utf8');

// ---------------------------------------------------------------------------
// Banc DOM minimal mais FIDÈLE sur le point qui compte : un <select> HTML à
// qui on assigne une valeur absente de ses options retombe sur '' (semantique
// HTMLSelectElement, selectedIndex -1). Sans cette fidélité, le banc ne
// saurait pas rougir si le correctif disparaissait.
// ---------------------------------------------------------------------------
function fauxSelect(valeurs) {
    return {
        _options: (valeurs || ['']).map((v) => ({ value: v })),
        _v: '',
        get options() { return this._options; },
        appendChild(opt) { this._options.push(opt); },
        get value() { return this._v; },
        set value(v) {
            const s = String(v == null ? '' : v);
            this._v = this._options.some((o) => o.value === s) ? s : '';
        },
        get innerHTML() { return ''; },
        set innerHTML(html) {
            // Rebâtir les options depuis le HTML généré (value="...")
            this._options = [...String(html).matchAll(/value="([^"]*)"/g)].map((m) => ({ value: m[1] }));
            this._v = '';
        },
        style: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {},
        closest: () => null,
        disabled: false
    };
}

function fauxChamp() {
    return {
        value: '',
        textContent: '',
        innerHTML: '',
        style: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {},
        closest: () => null,
        disabled: false,
        parentElement: { querySelector: () => null, appendChild() {} }
    };
}

function monterBanc({ grilles = [], echelles = [], productions = [], cartouchesParGrille = {} } = {}) {
    const elements = {
        formulaireProduction: fauxChamp(),
        btnajouterProduction: fauxChamp(),
        titreFormEvaluation: fauxChamp(),
        btnTexteEvaluation: fauxChamp(),
        productionGrille: fauxSelect(['']),
        productionEchelle: fauxSelect(['']),
        productionCartouche: fauxSelect(['']),
        productionTitre: fauxChamp(),
        productionActivite: fauxChamp(),
        productionType: fauxChamp(),
        productionPonderation: fauxChamp(),
        productionObjectif: fauxChamp(),
        productionTache: fauxChamp(),
        productionDetailTache: fauxChamp(),
        productionDateEcheance: fauxChamp()
    };
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        createElement: () => ({ value: '', textContent: '', className: '' }),
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        body: { addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute: () => null, classList: { add() {}, remove() {}, contains: () => false, toggle() {} }, style: {} },
        documentElement: { addEventListener() {} }
    };
    const magasins = {
        'test_grillesTemplates': grilles,
        'test_echellesTemplates': echelles,
        'test_productions': productions
    };
    Object.keys(cartouchesParGrille).forEach((gid) => {
        magasins['cartouches_' + gid] = cartouchesParGrille[gid];
    });
    const stubs = {
        document: fauxDocument,
        echapperHtml: (s) => String(s == null ? '' : s),
        cle: (k) => 'test_' + k,
        genererIdUnique: (p) => (p || '') + 'ID_TEST',
        obtenirCoursActifId: () => null,
        obtenirIdentiteCCUtilisateur: () => 'Test',
        formaterDateCourte: (d) => d,
        notifications: { erreur() {}, succes() {}, info() {} },
        db: {
            get: async (k) => (k in magasins ? magasins[k] : null),
            getSync: (k, def) => (k in magasins ? magasins[k] : def),
            set: async () => {},
            setSync: () => {}
        },
        productionEnEdition: null,
        BibliothequeUI: {}
    };
    const win = chargerScript('js/productions.js', stubs);
    return { win, elements };
}

describe('#453 · poserReferenceSelect — le contrat, cas par cas', () => {
    let win;
    beforeEach(() => { win = monterBanc().win; });

    it('⚠ LE PIÈGE D’ORIGINE : un id absent des options ne retombe plus sur «Aucune»', () => {
        const sel = fauxSelect(['', 'grille_vivante']);
        // Témoin de fidélité du banc : SANS le correctif, l'assignation retombe sur ''.
        sel.value = 'grille_fantome_H26';
        expect(sel.value).toBe('');

        win.poserReferenceSelect(sel, 'grille_fantome_H26', 'grille');
        // La référence est préservée…
        expect(sel.value).toBe('grille_fantome_H26');
        // …via une option injectée, visible et marquée.
        const injectee = sel.options.find((o) => o.value === 'grille_fantome_H26');
        expect(injectee).toBeDefined();
        expect(injectee.className).toBe('option-reference-introuvable');
        expect(injectee.textContent).toContain('introuvable');
    });

    it('l’ALLER-RETOUR complet : ce que l’enregistrement relit est l’id d’origine', () => {
        // Le chemin d'écriture (`lireDonneesFormulaireProduction`) relit
        // `select.value` tel quel : si l'affichage préserve, le disque préserve.
        const sel = fauxSelect(['', 'autre_grille']);
        win.poserReferenceSelect(sel, 'grille_1770742838756_23q82vbsk', 'grille');
        const grilleId = sel ? sel.value : '';
        expect(grilleId).toBe('grille_1770742838756_23q82vbsk');   // ← '' avant le correctif
    });

    it('une référence RÉSOLUE passe sans injection ni bruit', () => {
        const sel = fauxSelect(['', 'grille_vivante']);
        win.poserReferenceSelect(sel, 'grille_vivante', 'grille');
        expect(sel.value).toBe('grille_vivante');
        expect(sel.options).toHaveLength(2);   // rien d'injecté
    });

    it('une référence VIDE affiche «Aucune» — le correctif ne fabrique pas de donnée', () => {
        const sel = fauxSelect(['', 'grille_vivante']);
        sel.value = 'grille_vivante';
        win.poserReferenceSelect(sel, '', 'grille');
        expect(sel.value).toBe('');
        expect(sel.options).toHaveLength(2);
        win.poserReferenceSelect(sel, null, 'grille');
        expect(sel.value).toBe('');
    });

    it('l’effacement EXPLICITE reste possible : choisir «Aucune» à la main efface', () => {
        // Le correctif bloque le blanchiment SILENCIEUX, pas la volonté de
        // l'utilisateur : après injection, choisir '' reste un choix valide.
        const sel = fauxSelect(['']);
        win.poserReferenceSelect(sel, 'grille_fantome', 'grille');
        expect(sel.value).toBe('grille_fantome');
        sel.value = '';   // le geste de l'utilisateur dans l'interface
        expect(sel.value).toBe('');
    });

    it('un select absent du DOM ne fait rien exploser', () => {
        expect(() => win.poserReferenceSelect(null, 'grille_x', 'grille')).not.toThrow();
    });
});

describe('#453 · bout en bout — ouvrir un artefact aux références fantômes', () => {
    it('⚠ LE CAS DE GRÉGOIRE : grille, échelle et cartouche survivent à l’ouverture du formulaire', async () => {
        // Un artefact H26 dont les trois références visent des identifiants
        // qui n'existent dans AUCUN magasin (la branche H26 de #453, causée
        // par #454). Avant le correctif : les trois selects retombaient sur
        // «Aucune» et le prochain enregistrement écrivait ''.
        const { win, elements } = monterBanc({
            grilles: [{ id: 'grille_vivante', nom: 'Grille vivante' }],
            echelles: [{ id: 'echelle_vivante', nom: 'Échelle vivante' }],
            productions: [{
                id: 'PROD_H26_4', titre: 'Artefact 4', type: 'travail', ponderation: 10,
                grilleId: 'grille_fantome_23q82vbsk',
                echelleId: 'echelle_fantome_1767389426695',
                cartoucheId: 'cartouche_fantome_jl11zpy74'
            }]
        });

        await win.afficherFormProduction('PROD_H26_4');

        // Les trois références sont préservées à l'écran…
        expect(elements.productionGrille.value).toBe('grille_fantome_23q82vbsk');
        expect(elements.productionEchelle.value).toBe('echelle_fantome_1767389426695');
        expect(elements.productionCartouche.value).toBe('cartouche_fantome_jl11zpy74');

        // …et ce que le chemin d'enregistrement relirait est intact.
        const grille = elements.productionGrille;
        expect(grille ? grille.value : '').toBe('grille_fantome_23q82vbsk');
    });

    it('un artefact aux références SAINES se pré-remplit comme avant', async () => {
        const { win, elements } = monterBanc({
            grilles: [{ id: 'grille_vivante', nom: 'Grille vivante' }],
            echelles: [{ id: 'echelle_vivante', nom: 'Échelle vivante' }],
            productions: [{
                id: 'PROD_SAIN', titre: 'Artefact sain', type: 'travail', ponderation: 10,
                grilleId: 'grille_vivante', echelleId: 'echelle_vivante', cartoucheId: 'cart_1'
            }],
            cartouchesParGrille: { grille_vivante: [{ id: 'cart_1', nom: 'Cartouche' }] }
        });

        await win.afficherFormProduction('PROD_SAIN');

        expect(elements.productionGrille.value).toBe('grille_vivante');
        expect(elements.productionEchelle.value).toBe('echelle_vivante');
        expect(elements.productionCartouche.value).toBe('cart_1');
        // Aucune option «introuvable» n'a été injectée.
        const marquees = elements.productionGrille.options.filter((o) => o.className === 'option-reference-introuvable');
        expect(marquees).toHaveLength(0);
    });
});

describe('#453 · les invariants de source', () => {
    it('⚠ plus AUCUNE assignation directe qui blanchit : les trois selects passent par poserReferenceSelect', () => {
        // Les patrons fautifs d'origine ne doivent pas revenir.
        expect(sourceProductions).not.toMatch(/selectGrille\.value = prod\.grilleId \|\| ''/);
        expect(sourceProductions).not.toMatch(/selectGrilleInline\.value = prod\.grilleId \|\| ''/);
        expect(sourceProductions).not.toMatch(/selectEchelle\.value = prod\.echelleId/);
        expect(sourceProductions).not.toMatch(/selectCartouche\.value = prod\.cartoucheId/);
        // Et le remplaçant est bien en place aux quatre postes.
        expect(sourceProductions).toMatch(/poserReferenceSelect\(selectGrille, prod\.grilleId, 'grille'\)/);
        expect(sourceProductions).toMatch(/poserReferenceSelect\(selectGrilleInline, prod\.grilleId, 'grille'\)/);
        expect(sourceProductions).toMatch(/poserReferenceSelect\(selectEchelle, prod\.echelleId, 'échelle'\)/);
        expect(sourceProductions).toMatch(/poserReferenceSelect\(selectCartouche, prod\.cartoucheId, 'cartouche'\)/);
    });

    it('la référence préservée est SIGNALÉE (console.warn), pas silencieuse', () => {
        const bloc = sourceProductions.slice(
            sourceProductions.indexOf('function poserReferenceSelect'),
            sourceProductions.indexOf('async function prerenseignerFormulaireProduction')
        );
        expect(bloc).toMatch(/console\.warn/);
    });
});
