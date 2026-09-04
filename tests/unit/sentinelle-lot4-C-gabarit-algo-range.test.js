/**
 * Sentinelle — LE GABARIT ALGORITHMIQUE SE RANGE (consigne du 4 septembre 2026, lot 4, volet C).
 *
 * Décisions de Grégoire, sur son écran, le 4 septembre : les SOUS-CRITÈRES viennent en
 * premier, sous la rangée du critère ; la formule, le commentaire et la projection suivent,
 * en CARTES nommées et repliables — ouvert ce qui porte la note (sous-critères, formule),
 * fermé ce qui porte les mots (commentaire, projection, codes) ; « Modèle de rétroaction »
 * se lit « Modèle de commentaire » ; « Norme externe (épreuve uniforme) » se lit
 * « Projection à l'EUF » (le nom seul : l'`id` voyage avec les grilles partagées).
 *
 *   A — l'ORDRE et l'état des cartes, sur les deux écrans (édition et création) ;
 *   B — les LIBELLÉS : « commentaire » dans le gabarit, « rétroaction » reste à la cartouche ;
 *       « Projection à l'EUF » par le nom, `norme_externe` par l'id ;
 *   C — les PLIS vivent en mémoire : relus à chaque redessin (le gabarit se redessine à
 *       chaque frappe), jamais écrits dans la grille, jamais persistés par le composant ;
 *   D — la ligne de partage traverse les sous-critères : code · nom · pondération à plat,
 *       couleur · rétroaction · activation dans la carte des codes ; tout ce qui vient de la
 *       grille est échappé ;
 *   E — le composant accordéon n'est pas touché : la bascule exige toujours une vraie carte,
 *       et le plafond de hauteur est relevé dans une règle SCOPÉE.
 *
 * ⚠ Ce banc EXÉCUTE les fonctions réelles de grilles.js (patron des sentinelles #516 / #522 /
 * lot 1) avec les registres réels (formules, énoncés, projection, codes) ; seules les
 * assertions de E sont statiques, et elles nomment un invariant, pas un comportement.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);

/* ------------------------------------------------------------------ harnais */

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
        _elements: elements,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}

const CLE = 'a2026_grillesTemplates';

function monter(grilles) {
    const store = { [CLE]: JSON.parse(JSON.stringify(grilles)) };
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const valeur = (k in store ? store[k] : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const document = fauxDocument();
    const win = chargerScript('js/grilles.js', {
        db, document,
        cle: (k) => 'a2026_' + k,
        echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null,
                          filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    });
    // Les registres réels — le gabarit rend '' pour un registre absent.
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = require(path.join(racine, 'js/evaluation-enonces.js'));
    win.projectionAlgo = require(path.join(racine, 'js/evaluation-projection.js'));
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    win.boutonRetirerBloc = () => '';
    win.boutonsReordonnerBloc = () => '';
    return { win, store, document, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = {
    id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20,
    sousCriteres: [
        { id: 'sc_0', code: '0', nom: 'Aucune erreur', ponderation: 0, retroaction: '' },
        { id: 'sc_1', code: '1', nom: 'Thèse <b>non</b> dégagée', ponderation: 1, retroaction: 'La thèse "doit" être explicite.' }
    ]
};
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

/** Position de la première occurrence d'un marqueur dans le HTML rendu (−1 : absent). */
const pos = (html, marqueur) => html.indexOf(marqueur);
const carte = (html, section) => {
    const m = html.match(new RegExp('<div class="carte accordeon gabarit-algo-carte( ferme)?" data-pli="CR:' + section + '">'));
    return m ? { presente: true, ferme: !!m[1] } : { presente: false };
};
/** Le HTML d'une carte, de son ouverture à l'ouverture de la suivante (ou la fin). */
const contenuCarte = (html, section) => {
    const i = pos(html, 'data-pli="CR:' + section + '"');
    if (i < 0) return '';
    const suivant = html.indexOf('class="carte accordeon gabarit-algo-carte', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
};

/* ----------------------------------------------- A — l'ordre et l'état des cartes */

describe('lot 4 · C.A — l\'ordre du gabarit, et ce qui est ouvert ou replié', () => {
    it('A.a en ÉDITION : la rangée du critère, puis les sous-critères, puis formule · commentaire · projection · codes', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const rangee = pos(html, 'data-champ="nom"');
        const sousCriteres = pos(html, 'sous-criteres-conteneur--en-tete');
        const formule = pos(html, 'data-pli="CR:formule"');
        const commentaire = pos(html, 'data-pli="CR:commentaire"');
        const projection = pos(html, 'data-pli="CR:projection"');
        const codes = pos(html, 'data-pli="CR:codes"');
        for (const p of [rangee, sousCriteres, formule, commentaire, projection, codes]) expect(p).toBeGreaterThan(-1);
        expect(rangee).toBeLessThan(sousCriteres);
        expect(sousCriteres).toBeLessThan(formule);
        expect(formule).toBeLessThan(commentaire);
        expect(commentaire).toBeLessThan(projection);
        expect(projection).toBeLessThan(codes);
    });

    it('A.b ouvert ce qui porte la note, replié ce qui porte les mots', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        expect(carte(html, 'formule')).toEqual({ presente: true, ferme: false });
        expect(carte(html, 'commentaire')).toEqual({ presente: true, ferme: true });
        expect(carte(html, 'projection')).toEqual({ presente: true, ferme: true });
        expect(carte(html, 'codes')).toEqual({ presente: true, ferme: true });
        // Le bloc des sous-critères n'est PAS une carte : il ne se replie pas (cadrage, friction nommée).
        expect(html).not.toMatch(/data-pli="CR:sous-criteres"/);
        // Chaque carte est une VRAIE carte du composant, avec son en-tête cliquable et son contenu.
        for (const s of ['formule', 'commentaire', 'projection', 'codes']) {
            const c = contenuCarte(html, s);
            expect(c, s).toContain('class="accordeon-header"');
            expect(c, s).toContain('class="accordeon-chevron"');
            expect(c, s).toContain('class="accordeon-contenu"');
        }
    });

    it('A.c en CRÉATION : les mêmes cartes, sans les codes ni les sous-critères — la grille n\'est pas enregistrée, et on le dit', () => {
        const { win, liste } = monter([]);
        win.tempTypeGrille = 'algorithmique';
        win.tempCriteres = [{ id: 'TEMP_1', nom: 'Rigueur', type: 'algorithmique', ponderation: 100 }];
        win.afficherCriteresTemp();
        const html = liste().innerHTML;
        expect(pos(html, 'data-pli="TEMP_1:formule"')).toBeGreaterThan(-1);
        expect(pos(html, 'data-pli="TEMP_1:commentaire"')).toBeGreaterThan(pos(html, 'data-pli="TEMP_1:formule"'));
        expect(pos(html, 'data-pli="TEMP_1:projection"')).toBeGreaterThan(pos(html, 'data-pli="TEMP_1:commentaire"'));
        expect(html).not.toContain('data-pli="TEMP_1:codes"');
        expect(html).toContain('Les sous-critères se définissent une fois la grille enregistrée.');
        expect(html).toContain('mode: "temp"'.length ? 'modifierParamFormuleTempHandler' : '');
    });

    it('A.d un critère holistique ou analytique n\'a aucune carte — le gabarit long est celui de l\'algorithmique seul', () => {
        const { win, liste } = monter([]);
        win.afficherCriteresGrille({ id: 'G2', criteres: [{ id: 'H', nom: 'Contenu', type: 'holistique', ponderation: 50 }, { id: 'A', nom: 'Langue', type: 'analytique', ponderation: 50 }] });
        expect(liste().innerHTML).not.toContain('gabarit-algo-carte');
        expect(liste().innerHTML).not.toContain('sous-criteres-conteneur');
    });
});

/* ------------------------------------------------------------------ B — les libellés */

describe('lot 4 · C.B — les libellés', () => {
    it('B.a « Modèle de commentaire » dans le gabarit ; plus « Modèle de rétroaction » ; la cartouche garde son mot', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        expect(html).toContain('Modèle de commentaire');
        expect(html).not.toContain('Modèle de rétroaction');
        expect(source('js/grilles.js')).not.toContain('Modèle de rétroaction');
        // Témoin : « rétroaction » reste le mot de la CARTOUCHE, sur le travail (nuance de Grégoire).
        expect(source('index.html')).toContain('Cartouches de rétroaction');
        expect(source('js/cartouches.js')).toContain('Cartouches de rétroaction');
        // Le libellé du menu est le seul changement : la clé de données sous le menu n'a pas bougé.
        expect(html).toContain('data-on-change="modifierModeleEnoncesGrilleHandler"');
    });

    it('B.b « Projection à l\'EUF » par le NOM ; `norme_externe` par l\'id, qui voyage', () => {
        const P = require(path.join(racine, 'js/evaluation-projection.js'));
        const modeles = P.listerModeles();
        const norme = modeles.find(m => m.id === 'norme_externe');
        expect(norme).toBeTruthy();
        expect(norme.nom).toBe('Projection à l\'EUF');
        expect(modeles.map(m => m.nom)).not.toContain('Norme externe (épreuve uniforme)');
        // Et le gabarit rendu offre ce nom au menu, avec l'id inchangé comme valeur.
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        expect(liste().innerHTML).toMatch(/<option value="norme_externe" selected>Projection à l&#x27;EUF|<option value="norme_externe" selected>Projection à l'EUF/);
    });

    it('B.c les titres des cartes sont ceux que Grégoire lira', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        for (const titre of ['Formule', 'Commentaire', 'Projection', 'Codes d\'annotation']) {
            expect(html).toMatch(new RegExp('<span class="accordeon-chevron">[▶▼]</span> ' + titre.replace(/'/g, "(?:'|&#x27;|&#39;)")));
        }
    });
});

/* ------------------------------------------------------------ C — les plis, en mémoire */

describe('lot 4 · C.C — les plis vivent en mémoire, jamais dans la grille', () => {
    /** Simule l'état du DOM juste avant un redessin : les cartes en place, avec leur classe. */
    const domAvecPlis = (liste, plis) => {
        liste.querySelectorAll = (sel) => sel === '.carte.accordeon[data-pli]'
            ? Object.entries(plis).map(([pli, ferme]) => ({ dataset: { pli }, classList: { contains: (c) => c === 'ferme' && ferme } }))
            : [];
    };

    it('C.a le redessin RELIT l\'état laissé à l\'écran : une carte dépliée reste dépliée, une repliée reste repliée', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        // L'enseignant a déplié la projection et replié la formule, puis tape dans un champ :
        // le handler redessine tout. L'état est celui du DOM au moment du redessin.
        domAvecPlis(liste(), { 'CR:formule': true, 'CR:commentaire': true, 'CR:projection': false, 'CR:codes': true });
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        let html = liste().innerHTML;
        expect(carte(html, 'projection').ferme).toBe(false);
        expect(carte(html, 'formule').ferme).toBe(true);
        expect(carte(html, 'commentaire').ferme).toBe(true);
        // Le chevron suit ce que la bascule écrit : ▼ ouvert, ▶ replié.
        expect(contenuCarte(html, 'projection')).toContain('<span class="accordeon-chevron">▼</span>');
        expect(contenuCarte(html, 'formule')).toContain('<span class="accordeon-chevron">▶</span>');
        // Un redessin de plus, DOM vide entre-temps (aucune carte à relever) : l'état tient encore.
        liste().querySelectorAll = () => [];
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        html = liste().innerHTML;
        expect(carte(html, 'projection').ferme).toBe(false);
        expect(carte(html, 'formule').ferme).toBe(true);
    });

    it('C.b les plis sont par CRITÈRE : déplier la projection de l\'un ne déplie pas celle de l\'autre', () => {
        const AUTRE = { ...ALGO, id: 'CR2', nom: 'Français' };
        const G = { id: 'G3', criteres: [ALGO, AUTRE] };
        const { win, liste } = monter([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        domAvecPlis(liste(), { 'CR:projection': false });
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(html).toMatch(/gabarit-algo-carte" data-pli="CR:projection"/);
        expect(html).toMatch(/gabarit-algo-carte ferme" data-pli="CR2:projection"/);
    });

    it('C.c rien n\'est écrit dans la grille ni dans le stockage, et aucune carte ne porte d\'`id` (le composant ne persiste rien)', () => {
        const { win, liste, store } = monter([GRILLE]);
        const avant = JSON.stringify(store[CLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        domAvecPlis(liste(), { 'CR:projection': false, 'CR:formule': true });
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        expect(JSON.stringify(store[CLE])).toBe(avant);
        expect(avant).not.toMatch(/"pli|plisGabarit|data-pli/);
        const html = liste().innerHTML;
        expect(html).not.toMatch(/gabarit-algo-carte[^>]*\sid=/);
        // Et rien n'atteint la clé que `sauvegarderEtatAccordeons` écrit.
        expect(Object.keys(store)).toEqual([CLE]);
    });
});

/* ---------------------------------------- D — la ligne de partage des sous-critères */

describe('lot 4 · C.D — les sous-critères : la note à plat, les mots dans la carte des codes', () => {
    it('D.a à plat : code · nom · pondération et le retrait ; ni couleur, ni rétroaction', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const plat = html.slice(pos(html, 'sous-criteres-conteneur--en-tete'), pos(html, 'data-pli="CR:formule"'));
        expect(plat).toContain('data-champ="code"');
        expect(plat).toContain('data-champ="nom"');
        expect(plat).toContain('data-champ="ponderation"');
        expect(plat).toContain('data-action="supprimerSousCritere"');
        expect(plat).toContain('data-action="ajouterSousCritere"');
        expect(plat).toContain('sous-criteres-compteur">(2)');
        expect(plat).not.toContain('data-champ="retroaction"');
        expect(plat).not.toContain('sous-critere-couleur-groupe');
        expect(plat).not.toContain('modifierCodesDepuisSousCriteresHandler');
        // Les handlers sont ceux d'avant, avec les mêmes index : l'ordre change le rendu, pas les données.
        expect(plat).toMatch(/data-on-change="modifierSousCritereHandler" data-grille-id="G1" data-critere-index="0" data-sc-index="1" data-champ="nom"/);
    });

    it('D.b dans la carte des codes : l\'activation, puis par sous-critère la couleur et la rétroaction ; le nom s\'y LIT', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const codes = contenuCarte(liste().innerHTML, 'codes');
        expect(codes).toContain('data-on-change="modifierCodesDepuisSousCriteresHandler"');
        expect(codes).toContain('Utiliser ces sous-critères comme codes d\'annotation');
        expect((codes.match(/sous-critere-couleur-groupe/g) || []).length).toBe(2);
        expect((codes.match(/data-champ="retroaction"/g) || []).length).toBe(2);
        expect(codes).toMatch(/data-sc-index="1" data-champ="retroaction">La thèse &quot;doit&quot; être explicite\.<\/textarea>/);
        expect(codes).toContain('sous-critere-code-lecture">1 · Thèse &lt;b&gt;non&lt;/b&gt; dégagée');
        expect(codes).not.toContain('data-champ="nom"');
    });

    it('D.c tout ce qui vient de la grille est échappé (règle 1) — le nom, la rétroaction, le code', () => {
        const G = { id: 'G4', criteres: [{ ...ALGO, sousCriteres: [{ id: 's', code: '<i>', nom: '<img src=x onerror=alert(1)>', ponderation: 1, retroaction: '</textarea><script>' }] }] };
        const { win, liste } = monter([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(html).not.toContain('<img src=x');
        expect(html).not.toContain('</textarea><script>');
        expect(html).not.toContain('value="<i>"');
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('D.d sans sous-critère : le bouton des défauts à plat, et la carte des codes dit où les ajouter', () => {
        const G = { id: 'G5', criteres: [{ id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20 }] };
        const { win, liste } = monter([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(html).toContain('data-action="initialiserSousCriteresParDefaut"');
        expect(html).toContain('Aucun sous-critère défini.');
        expect(contenuCarte(html, 'codes')).toContain('Aucun sous-critère : ajoute-en dans le bloc « Sous-critères » ci-dessus');
    });
});

/* ------------------------------------------------ E — le composant n'est pas touché */

describe('lot 4 · C.E — le composant accordéon est employé, pas refait', () => {
    it('E.a la bascule exige toujours une vraie carte, et sa règle de hauteur n\'a pas bougé', () => {
        expect(source('js/pratiques.js')).toContain("headerElement.closest('.carte.accordeon')");
        expect(source('styles.css')).toContain('.carte.accordeon:not(.ferme) .accordeon-contenu {\n    max-height: 2000px;');
        expect(source('js/main.js')).toContain("e.target.closest('.accordeon-header')");
    });

    it('E.b le plafond est relevé dans une règle SCOPÉE à la liste des critères', () => {
        const css = source('styles.css');
        expect(css).toContain('#listeCriteres .gabarit-algo-carte:not(.ferme) .accordeon-contenu {\n    max-height: 6000px;');
        expect(css).toContain('#listeCriteres .sous-critere-champs-grid--note {');
        expect(css).toContain('#listeCriteres .sous-critere-champs-grid--code {');
        // La grille des cinq colonnes du lot des codes (3 sept.) reste la règle de base.
        expect(css).toContain('grid-template-columns: 80px 1fr 100px 64px auto;');
    });

    it('E.c les deux écrans passent par le même rendu, et plus aucun bloc ne se dessine hors carte', () => {
        const code = source('js/grilles.js');
        expect((code.match(/\$\{rendreCartesGabaritAlgo\(critere,/g) || []).length).toBe(2);
        expect(code).not.toContain('sansCadre');
    });
});
