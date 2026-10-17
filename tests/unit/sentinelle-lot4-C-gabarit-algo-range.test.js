/**
 * Sentinelle — LE GABARIT ALGORITHMIQUE SE RANGE (consigne du 4 septembre 2026, lot 4, volet C).
 *
 * Décisions de Grégoire, sur son écran, le 4 septembre : les SOUS-CRITÈRES viennent en
 * premier, sous la rangée du critère ; la formule, le commentaire et la projection suivent,
 * en CARTES nommées et repliables — ouvert ce qui porte la note (sous-critères, formule),
 * fermé ce qui porte les mots (commentaire, projection, codes) ; « Modèle de rétroaction »
 * se lit « Modèle d'observation » (h, 17 h 50 — d'abord « commentaire » ; ↻ 1.120 : « Modèle des phrases
 * (bilan et décompte) », et la carte « Observation » s'appelle « Bilan ») ; « Norme externe (épreuve uniforme) » se lit
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
 *       et le plafond de hauteur est relevé dans une règle SCOPÉE ;
 *   F — C.3 (décision du 4 sept., 15 h 40) : un critère algorithmique NEUF naît « sans
 *       projection » ; les critères existants gardent leur modèle, à la lecture comme après
 *       rechargement ; la norme externe se choisit ;
 *   G — coup d'œil de Grégoire (§7) : corbeille partout, chevrons en coin, paliers sur deux rangées ;
 *   H — second coup d'œil (§8) : paliers numérotés sans chevrons, sous-critères déplaçables aux
 *       chevrons (le code voyage avec le sous-critère), « Descripteur ».
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
    // ui-blocs.js d'abord : depuis les retouches du 4 sept. (c, d), la corbeille et les
    // chevrons de l'éditeur sont ses rendus réels — on les éprouve, on ne les stubbe plus.
    const globaux = {
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
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    // Les registres réels — le gabarit rend '' pour un registre absent.
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = require(path.join(racine, 'js/evaluation-enonces.js'));
    win.projectionAlgo = require(path.join(racine, 'js/evaluation-projection.js'));
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
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
    it('A.a en ÉDITION : la rangée du critère, puis les sous-critères, puis formule · commentaire · projection (lot A : plus de carte des codes)', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const rangee = pos(html, 'data-champ="nom"');
        const sousCriteres = pos(html, 'sous-criteres-conteneur--en-tete');
        const formule = pos(html, 'data-pli="CR:formule"');
        const commentaire = pos(html, 'data-pli="CR:commentaire"');
        const projection = pos(html, 'data-pli="CR:projection"');
        for (const p of [rangee, sousCriteres, formule, commentaire, projection]) expect(p).toBeGreaterThan(-1);
        expect(rangee).toBeLessThan(sousCriteres);
        expect(sousCriteres).toBeLessThan(formule);
        expect(formule).toBeLessThan(commentaire);
        expect(commentaire).toBeLessThan(projection);
        // ↻ Lot A (5 sept. 2026) : plus de carte « Codes d'annotation » — la liste des sous-critères porte tout.
        expect(html).not.toContain('data-pli="CR:codes"');
    });

    it('A.b ouvert ce qui porte la note, replié ce qui porte les mots', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        expect(carte(html, 'formule')).toEqual({ presente: true, ferme: false });
        expect(carte(html, 'commentaire')).toEqual({ presente: true, ferme: true });
        expect(carte(html, 'projection')).toEqual({ presente: true, ferme: true });
        expect(carte(html, 'codes')).toEqual({ presente: false });
        // Le bloc des sous-critères n'est PAS une carte : il ne se replie pas (cadrage, friction nommée).
        expect(html).not.toMatch(/data-pli="CR:sous-criteres"/);
        // Chaque carte est une VRAIE carte du composant, avec son en-tête cliquable et son contenu.
        for (const s of ['formule', 'commentaire', 'projection']) {
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
    it('B.a « Modèle des phrases (bilan et décompte) » dans le gabarit (↻ 1.120, d\'abord « Modèle d\'observation ») ; ni « rétroaction » ni « commentaire » ; la cartouche garde son mot', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        expect(html).toContain('Modèle des phrases (bilan et décompte)');
        expect(html).not.toContain('Modèle d\'observation');
        expect(html).not.toContain('Modèle de rétroaction');
        expect(html).not.toContain('Modèle de commentaire');
        expect(source('js/grilles.js')).not.toContain('Modèle de rétroaction');
        expect(source('js/grilles.js')).not.toContain('Modèle de commentaire');
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
        // ↻ §8 (5 sept. 2026, titres confirmés par Grégoire à 7 h 24) : « Projection » devient
        // « Ce que l'élève lit » — le décompte s'y compose, avant les paliers. ↻ La carte « Bilan »
        // (1.120) : « Observation » s'appelle « Bilan » et ne porte que ce que l'élève lit dans son bilan.
        for (const titre of ['Formule', 'Bilan', 'Ce que l\'élève lit']) {
            expect(html).toMatch(new RegExp('<span class="accordeon-chevron">[▶▼]</span> ' + titre.replace(/'/g, "(?:'|&#x27;|&#39;)")));
        }
        expect(html).not.toMatch(/<\/span> Codes d(?:'|&#x27;|&#39;)annotation/);
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
        domAvecPlis(liste(), { 'CR:formule': true, 'CR:commentaire': true, 'CR:projection': false });
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

describe('lot 4 · C.D — les sous-critères : UNE seule liste (lot A du 5 sept.) — la note à plat, la case en tête, les mots sous un pli par rangée', () => {
    const plat = (html) => html.slice(pos(html, 'sous-criteres-conteneur--en-tete'), pos(html, 'data-pli="CR:formule"'));
    const COCHEE = { ...GRILLE, criteres: [{ ...ALGO, codesDepuisSousCriteres: true }] };

    it('D.a case décochée : code · nom · pondération, chevrons et corbeille ; ni couleur, ni observation ; plus de carte des codes', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const bloc = plat(html);
        expect(bloc).toContain('data-champ="code"');
        expect(bloc).toContain('data-champ="nom"');
        expect(bloc).toContain('data-champ="ponderation"');
        // Retouche c (4 sept.) : la suppression est la corbeille en coin, avec le triplet.
        expect(bloc).toMatch(/data-action="supprimerSousCritere" data-param="G1" data-param2="0" data-param3="1"[^>]*><img src="icons\/icons8-trash\.svg"/);
        expect(bloc).not.toContain('btn-supprimer');
        expect(bloc).toContain('data-action="ajouterSousCritere"');
        expect(bloc).toContain('sous-criteres-compteur">(2)');
        // La case, en tête de la liste, AVANT la première rangée ; sous elle, la ligne qui dit où vit la palette.
        expect(bloc).toContain('data-on-change="modifierCodesDepuisSousCriteresHandler"');
        expect(bloc).toContain('Utiliser ces sous-critères comme codes d\'annotation');
        expect(pos(bloc, 'class="sous-criteres-codes')).toBeGreaterThan(pos(bloc, 'sous-criteres-header'));
        expect(pos(bloc, 'class="sous-criteres-codes')).toBeLessThan(pos(bloc, 'class="sous-critere-item avec-outils"'));
        expect(bloc).toContain('sous-criteres-codes-palette">Sans cette case, la copie utilise la palette générale (Annoter › palette). Cochée, ce sont ces sous-critères qui deviennent les codes de la copie.</small>');
        // Décochée : ni couleur ni observation, et le mot « rétroaction » n'apparaît pas dans le bloc.
        expect(bloc).not.toContain('data-champ="retroaction"');
        expect(bloc).not.toContain('sous-critere-couleur-groupe');
        // ↻ La carte « Bilan » (1.120) : le pli « Quand la copie ne porte aucun code » vit sous la case, coché
        // ou non, avec le même composant (`sous-critere-pli`) ; ce qui n'existe pas décoché, c'est le pli DE RANGÉE.
        expect(bloc).not.toContain('data-pli="CR:sc:');
        expect(bloc).not.toContain('> Observation</h3>');
        expect(bloc).not.toContain('sous-critere-champs-grid--note-codes');
        expect(bloc.toLowerCase()).not.toContain('rétroaction');
        expect(html).not.toContain('data-pli="CR:codes"');
        expect(html).not.toContain('sous-critere-code-lecture');
        // Les handlers sont ceux d'avant, avec les mêmes index : l'ordre change le rendu, pas les données.
        expect(bloc).toMatch(/data-on-change="modifierSousCritereHandler" data-grille-id="G1" data-critere-index="0" data-sc-index="1" data-champ="nom"/);
    });

    it('D.b case cochée : chaque rangée a sa pastille (le sélecteur de la palette) et son pli « Observation », fermé par défaut, même handler et mêmes index', () => {
        const { win, liste } = monter([COCHEE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(COCHEE)));
        const html = liste().innerHTML;
        const bloc = plat(html);
        expect(bloc).toContain('sous-criteres-codes--actif');
        expect((bloc.match(/sous-critere-couleur-groupe/g) || []).length).toBe(2);
        // Sans `travauxOutils` (le harnais), la pastille est le repli ; le sélecteur à douze pastilles est éprouvé
        // dans WebKit par le spec source-unique-codes.
        expect((bloc.match(/class="travaux-retro-couleur"/g) || []).length).toBe(2);
        expect(source('js/grilles.js')).toMatch(/rendreCouleurSousCritere\(critere, sc, \{ grilleId: grilleId, index: index, scIndex: scIndex \}\)/);
        expect((bloc.match(/sous-critere-champs-grid--note-codes/g) || []).length).toBe(2);
        expect((bloc.match(/data-champ="retroaction"/g) || []).length).toBe(2);
        // Le pli : une vraie carte du composant, fermée, sans id, dans SA rangée, après le coin des outils.
        expect(bloc).toContain('class="carte accordeon sous-critere-pli ferme" data-pli="CR:sc:sc_0"');
        expect(bloc).toContain('class="carte accordeon sous-critere-pli ferme" data-pli="CR:sc:sc_1"');
        expect(bloc).not.toMatch(/sous-critere-pli[^>]*\sid=/);
        const rangees = bloc.split('class="sous-critere-item avec-outils"').slice(1);
        expect(rangees.length).toBe(2);
        rangees.forEach((r, i) => {
            expect(r, 'rangée ' + i).toContain('data-pli="CR:sc:sc_' + i + '"');
            expect(r, 'rangée ' + i).toContain('<span class="accordeon-chevron">▶</span> Observation</h3>');
            expect(r, 'rangée ' + i).toMatch(new RegExp('data-on-change="modifierSousCritereHandler" data-grille-id="G1" data-critere-index="0" data-sc-index="' + i + '" data-champ="retroaction"'));
            expect(pos(r, 'sous-critere-champs-grid')).toBeLessThan(pos(r, 'bloc-coin-outils'));
            expect(pos(r, 'bloc-coin-outils')).toBeLessThan(pos(r, 'sous-critere-pli'));
            expect((r.match(/data-champ="code"/g) || []).length, 'un seul champ Code par rangée').toBe(1);
        });
        expect(bloc).toMatch(/data-sc-index="1" data-champ="retroaction">La thèse &quot;doit&quot; être explicite\.<\/textarea>/);
        expect(bloc.toLowerCase()).not.toContain('rétroaction');
        expect(bloc).toContain('la couleur et l\'observation d\'ici');
        // Un sous-critère n'est rendu qu'UNE fois : le nom ne s'écrit qu'une fois, plus de lecture recopiée.
        // (dans le BLOC des sous-critères : la rangée du critère a son propre champ « nom »)
        expect((bloc.match(/data-champ="nom"/g) || []).length).toBe(2);
        expect((bloc.match(/data-champ="code"/g) || []).length).toBe(2);
        expect(html).not.toContain('sous-critere-code-lecture');
        expect(html).not.toContain('data-pli="CR:codes"');
    });

    it('D.c tout ce qui vient de la grille est échappé (règle 1) — le nom, l\'observation, le code', () => {
        const G = { id: 'G4', criteres: [{ ...ALGO, codesDepuisSousCriteres: true, sousCriteres: [{ id: 's', code: '<i>', nom: '<img src=x onerror=alert(1)>', ponderation: 1, retroaction: '</textarea><script>' }] }] };
        const { win, liste } = monter([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(html).not.toContain('<img src=x');
        expect(html).not.toContain('</textarea><script>');
        expect(html).not.toContain('value="<i>"');
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(html).toContain('&lt;/textarea&gt;&lt;script&gt;');
    });

    it('D.d sans sous-critère : le bouton des défauts à plat, la case présente mais inactive, et plus de carte des codes', () => {
        const G = { id: 'G5', criteres: [{ id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20 }] };
        const { win, liste } = monter([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(html).toContain('data-action="initialiserSousCriteresParDefaut"');
        expect(html).toContain('Aucun sous-critère défini.');
        expect(html).toMatch(/data-on-change="modifierCodesDepuisSousCriteresHandler"[^>]*\sdisabled/);
        expect(html).not.toContain('data-pli="CR:codes"');
        expect(html).not.toContain('Aucun sous-critère : ajoute-en dans le bloc');
    });

    it('D.e les plis des observations vivent en mémoire, par rangée, et se relisent au redessin ; rien n\'entre dans la grille', () => {
        const { win, liste, store } = monter([COCHEE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(COCHEE)));
        const avant = JSON.stringify(store[CLE]);
        // L'enseignant a déplié l'observation du second, puis tape : le redessin relit l'état du DOM.
        liste().querySelectorAll = (sel) => sel === '.carte.accordeon[data-pli]'
            ? [{ dataset: { pli: 'CR:sc:sc_1' }, classList: { contains: () => false } }]
            : [];
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(COCHEE)));
        const html = liste().innerHTML;
        expect(html).toContain('class="carte accordeon sous-critere-pli" data-pli="CR:sc:sc_1"');
        expect(html).toContain('class="carte accordeon sous-critere-pli ferme" data-pli="CR:sc:sc_0"');
        const seconde = html.split('class="sous-critere-item avec-outils"')[2];
        expect(seconde).toContain('<span class="accordeon-chevron">▼</span> Observation</h3>');
        expect(JSON.stringify(store[CLE])).toBe(avant);
        expect(avant).not.toMatch(/"pli|plisGabarit|data-pli/);
        expect(Object.keys(store)).toEqual([CLE]);
    });

    it('D.f la carte des codes n\'existe plus dans le code ni dans le CSS ; la rangée cochée a sa grille à quatre colonnes, le pli sa bande de 44 px — scopés', () => {
        const code = source('js/grilles.js');
        expect(code).not.toContain('rendreBlocCodesAlgo');
        expect(code).not.toContain("'codes', 'Codes d\\'annotation'");
        expect((code.match(/function rendrePliObservationSousCritere\(/g) || []).length).toBe(1);
        expect((code.match(/rendreActivationCodes\(critere, \{ grilleId: grilleId, index: index \}\)/g) || []).length).toBe(1);
        const css = source('styles.css');
        expect(css).toContain('#listeCriteres .sous-critere-champs-grid--note-codes {\n    grid-template-columns: 80px 1fr 100px 64px;');
        expect(css).toContain('#listeCriteres .sous-critere-pli {');
        expect(css).toMatch(/#listeCriteres \.sous-critere-pli \.accordeon-header \{[^}]*min-height: 44px/);
        expect(css).not.toContain('.sous-critere-champs-grid--code');
        expect(css).not.toContain('.sous-critere-code-lecture');
        expect(css).not.toContain('.sous-critere-description-groupe');
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
        expect(css).toContain('#listeCriteres .sous-critere-champs-grid--note-codes {');
        // La grille des cinq colonnes du lot des codes (3 sept.) reste la règle de base.
        expect(css).toContain('grid-template-columns: 80px 1fr 100px 64px auto;');
    });

    it('E.c les deux écrans passent par le même rendu, et plus aucun bloc ne se dessine hors carte', () => {
        const code = source('js/grilles.js');
        expect((code.match(/\$\{rendreCartesGabaritAlgo\(critere,/g) || []).length).toBe(2);
        expect(code).not.toContain('sansCadre');
    });
});

/* --------------------------------- F — C.3 : un critère neuf naît sans projection */

describe('lot 4 · C.F — C.3 : un critère algorithmique NEUF naît sans projection, les existants gardent leur modèle', () => {
    const P = require(path.join(racine, 'js/evaluation-projection.js'));

    it('F.a le fragment neuf est « aucune » ; la LECTURE d\'un critère d\'avant #668 reste la norme externe', () => {
        expect(P.gabaritNeuf()).toEqual({ modeleProjection: 'aucune', paramsProjection: {} });
        expect(P.MODELE_PAR_DEFAUT).toBe('norme_externe');
        expect(P.normaliser({}).modeleId).toBe('norme_externe');                                   // existant sans champ : son modèle d'hier
        expect(P.normaliser({ modeleProjection: 'norme_externe' }).modeleId).toBe('norme_externe');   // existant explicite : inchangé
        expect(P.normaliser({ modeleProjection: 'aucune' }).modele.projette).toBe(false);
        // `poserDefautNeuf` ne touche que l'algorithmique qui n'a rien choisi.
        expect(P.poserDefautNeuf({ type: 'algorithmique' }).modeleProjection).toBe('aucune');
        expect(P.poserDefautNeuf({ type: 'holistique' }).modeleProjection).toBeUndefined();
        expect(P.poserDefautNeuf({ type: 'algorithmique', modeleProjection: 'norme_externe' }).modeleProjection).toBe('norme_externe');
        expect(P.poserDefautNeuf(null)).toBeNull();
    });

    it('F.b les trois naissances et les trois changements de type ÉCRIVENT « aucune » — un rendu, lui, n\'écrit rien', async () => {
        // Édition : naissance sur une grille algorithmique, puis un critère qui change de type.
        const G = { id: 'G7', nom: 'Algo', type: 'algorithmique', criteres: [{ id: 'H', nom: 'Contenu', type: 'holistique', ponderation: 50 }] };
        const a = monter([G]);
        await a.win.ajouterCritereGrille('G7');
        expect(a.store[CLE][0].criteres[1].type).toBe('algorithmique');
        expect(a.store[CLE][0].criteres[1].modeleProjection).toBe('aucune');
        await a.win.modifierCritereGrille('G7', 0, 'type', 'algorithmique');
        expect(a.store[CLE][0].criteres[0].modeleProjection).toBe('aucune');
        // Un critère existant SANS champ : un rendu ne l'écrit pas, et l'écran lui montre la norme externe.
        const AVANT = { id: 'G8', criteres: [{ id: 'V', nom: 'Vieux', type: 'algorithmique', ponderation: 100 }] };
        const b = monter([AVANT]);
        b.win.afficherCriteresGrille(JSON.parse(JSON.stringify(AVANT)));
        expect(b.store[CLE][0].criteres[0].modeleProjection).toBeUndefined();
        expect(b.liste().innerHTML).toContain('<option value="norme_externe" selected>');
        // Création : naissance, changement de type au menu du critère, retypage par le menu de la grille.
        const c = monter([]);
        c.win.tempTypeGrille = 'algorithmique'; c.win.tempCriteres = [];
        c.win.ajouterCritereTemp();
        expect(c.win.tempCriteres[0].modeleProjection).toBe('aucune');
        c.win.tempTypeGrille = ''; c.win.tempCriteres = [{ id: 'T', nom: 'x', type: 'holistique', ponderation: 0 }];
        c.win.modifierCritereTemp(0, 'type', 'algorithmique');
        expect(c.win.tempCriteres[0].modeleProjection).toBe('aucune');
        c.win.tempTypeGrille = ''; c.win.tempCriteres = [{ id: 'T2', nom: 'y', type: 'holistique', ponderation: 0 }];
        const menu = c.document.getElementById('typeGrille'); menu.value = 'algorithmique';
        await c.win.modifierTypeGrilleHandler(menu);
        expect(c.win.tempCriteres[0].modeleProjection).toBe('aucune');
        // Et l'écran d'un critère neuf dit « Aucune projection ».
        c.win.afficherCriteresTemp();
        expect(c.liste().innerHTML).toContain('<option value="aucune" selected>Aucune projection</option>');
        expect(c.liste().innerHTML).toContain('Aucune projection ne sera proposée');
        // Un critère qui reste holistique n'écrit rien.
        c.win.tempCriteres = [{ id: 'T3', nom: 'z', type: 'holistique', ponderation: 0 }];
        c.win.modifierCritereTemp(0, 'nom', 'z2');
        expect(c.win.tempCriteres[0].modeleProjection).toBeUndefined();
    });
});

/* ------------------------ G — les retouches du coup d'œil (4 sept., §7 : b, c, d) */

describe('lot 4 · C.G — coup d\'œil de Grégoire : corbeille partout, chevrons en coin, paliers sur deux rangées', () => {
    const GRILLE_PALIERS = { id: 'G9', nom: 'EUF', criteres: [{ ...ALGO, modeleProjection: 'norme_externe' }] };

    it('G.a plus aucun bouton « ✕ » de suppression dans les deux gabarits — la corbeille, en coin, avec le bon identifiant', () => {
        const a = monter([GRILLE_PALIERS]);
        a.win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE_PALIERS)));
        const edition = a.liste().innerHTML;
        expect(edition).not.toContain('btn-supprimer');
        expect(edition).not.toContain('✕');
        // Critère, deux sous-critères, et chaque palier de la norme externe : une corbeille chacun.
        const corbeilles = (edition.match(/icons8-trash\.svg/g) || []).length;
        const paliers = (edition.match(/class="sous-critere-item palier-projection"/g) || []).length;
        expect(paliers).toBeGreaterThan(1);
        expect(corbeilles).toBe(1 + 2 + paliers);
        expect(edition).toMatch(/data-action="supprimerPalierProjectionGrille" data-param="G9" data-param2="0" data-param3="0"/);
        expect(edition).toMatch(/data-action="supprimerCritereGrille" data-param="G9" data-param2="0"/);
        // En création, même chose : le palier s'identifie par (critère, index).
        const c = monter([]);
        c.win.tempTypeGrille = 'algorithmique';
        c.win.tempCriteres = [{ ...ALGO, id: 'TEMP_9', modeleProjection: 'norme_externe' }];
        c.win.afficherCriteresTemp();
        const creation = c.liste().innerHTML;
        expect(creation).not.toContain('btn-supprimer');
        expect(creation).not.toContain('✕');
        expect(creation).toMatch(/data-action="supprimerPalierProjectionTemp" data-param="0" data-param2="0"[^>]*><img src="icons\/icons8-trash\.svg"/);
        expect(creation).toMatch(/data-action="supprimerCritereTemp" data-param="0"[^>]*><img src="icons\/icons8-trash\.svg"/);
    });

    it('G.b les chevrons remplacent la pile « Ordre » : en coin, sur la même ligne que la corbeille, mêmes actions', () => {
        const G = { id: 'G10', criteres: [{ id: 'A', nom: 'Un', type: 'holistique', ponderation: 50 }, { id: 'B', nom: 'Deux', type: 'holistique', ponderation: 50 }] };
        const { win, liste } = monter([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(html).not.toContain('bloc-reordonner');
        expect(html).not.toContain('>Ordre<');
        expect(html).not.toContain('grid-template-columns: 60px');
        const coins = html.split('class="bloc-coin-outils"').slice(1);
        expect(coins).toHaveLength(2);
        // Dans le coin : monter, descendre, puis la corbeille — et le premier ne monte pas, le dernier ne descend pas.
        expect(coins[0]).toMatch(/data-action="deplacerCritereGrilleHaut" data-param="G10" data-param2="0" disabled/);
        expect(coins[0]).toMatch(/data-action="deplacerCritereGrilleBas" data-param="G10" data-param2="0"\s*>/);
        expect(coins[1]).toMatch(/data-action="deplacerCritereGrilleBas" data-param="G10" data-param2="1" disabled/);
        expect(coins[0].indexOf('pipeline-btn-reorder')).toBeLessThan(coins[0].indexOf('icons8-trash.svg'));
        // La rangée laisse la place au coin.
        expect(html).toContain('class="critere-rangee"');
        // En création aussi.
        const c = monter([]);
        c.win.tempCriteres = [{ id: 'T1', nom: 'a', type: 'holistique', ponderation: 0 }, { id: 'T2', nom: 'b', type: 'holistique', ponderation: 0 }];
        c.win.afficherCriteresTemp();
        expect(c.liste().innerHTML).not.toContain('bloc-reordonner');
        expect(c.liste().innerHTML).toMatch(/bloc-coin-outils[\s\S]*?data-action="deplacerCritereTempHaut" data-param="0" disabled/);
    });

    it('G.c un palier tient sur deux rangées côte à côte (la grille du formulaire groupe-cours), le nom a sa colonne, la note du composeur une seule fois', () => {
        const { win, liste } = monter([GRILLE_PALIERS]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE_PALIERS)));
        const projection = contenuCarte(liste().innerHTML, 'projection');
        const paliers = projection.split('class="sous-critere-item palier-projection"').slice(1);
        expect(paliers.length).toBeGreaterThan(1);
        for (const pal of paliers) {
            const bloc = pal.split('class="sous-critere-item palier-projection"')[0];
            expect((bloc.match(/class="grille-form-2col palier-rangee"/g) || []).length, 'deux rangées').toBe(2);
            expect(bloc).toContain('class="controle-form sous-critere-input-standard palier-nom"');
            expect(bloc).not.toContain('sous-critere-champs-grid');
            expect(bloc).not.toContain('sous-critere-description-groupe');
        }
        // La note sous les paliers : UNE fois par critère, plus dans chaque palier. ↻ Texte troué,
        // étape 2 (4 sept.) : la note « Écris {service}… » enseignait une syntaxe que le bouton rend
        // inutile ; elle est remplacée par la note du composeur, qui porte la décision de Grégoire sur
        // le préfixe engendré — au mot.
        expect((projection.match(/palier-note-service/g) || []).length).toBe(0);
        expect((projection.match(/palier-note-composer/g) || []).length).toBe(1);
        expect((projection.match(/avec un badge, elle est entière : c'est toi qui l'écris\./g) || []).length).toBe(1);
        // ↻ §7 (5 sept.) : la note vient EN TÊTE de la carte, avant le premier palier — à six paliers
        // de la rangée « Poser : », elle n'aidait personne.
        expect(projection.indexOf('palier-note-composer')).toBeLessThan(projection.indexOf('palier-projection'));
        expect(projection).toContain('value="Sans erreur"');
        // Les champs et leurs clés n'ont pas bougé (ce qui est enregistré non plus).
        for (const champ of ['libelle', 'ratioMax', 'texte', 'texteAide']) expect(projection).toContain('data-champ="' + champ + '"');
    });

    it('G.d les règles sont SCOPÉES à l\'éditeur, et la grille à deux colonnes est celle du formulaire groupe-cours', () => {
        const css = source('styles.css');
        expect(css).toContain('#listeCriteres .bloc-coin-outils {');
        expect(css).toContain('#listeCriteres .critere-rangee {');
        expect(css).toMatch(/#listeCriteres \.btn-icone-nu,\n#listeCriteres \.pipeline-btn-reorder \{\n    min-width: 44px;\n    min-height: 44px;/);
        expect(css).toContain('.grille-form-2col {\n    display: grid;\n    grid-template-columns: 1fr 1fr;');
        expect(source('index.html')).toContain('<div class="grille-form-2col u-mb-15">');
    });
});

/* ------------------------ H — le second coup d'œil (4 sept., §8 : e, f, g) */

describe('lot 4 · C.H — second coup d\'œil : paliers numérotés, sous-critères déplaçables, « Descripteur »', () => {
    const GRILLE_PALIERS = { id: 'G9', nom: 'EUF', criteres: [{ ...ALGO, modeleProjection: 'norme_externe' }] };

    it('H.e les paliers sont numérotés par rang, « Sans erreur » compris, et n\'ont PAS de chevrons — l\'ordre est le seuil', () => {
        const { win, liste } = monter([GRILLE_PALIERS]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE_PALIERS)));
        const projection = contenuCarte(liste().innerHTML, 'projection');
        const paliers = projection.split('class="sous-critere-item palier-projection"').slice(1);
        expect(paliers.length).toBeGreaterThan(1);
        paliers.forEach((pal, i) => {
            expect(pal, 'palier ' + (i + 1)).toContain('<label class="sous-critere-label-petit">Palier ' + (i + 1) + '</label>');
            expect(pal).not.toContain('pipeline-btn-reorder');
        });
        expect(paliers[0]).toContain('value="Sans erreur"');
        expect(projection).not.toContain('<label class="sous-critere-label-petit">Palier</label>');
        // Le calcul lit les paliers dans leur ordre : aucun tri à la saisie (mesuré, inscrit).
        const P = source('js/evaluation-projection.js');
        expect(P).toContain('function _paliersDeRatio(paliers) {\n    return paliers.filter(function(p) { return !p.sansErreur; });');
    });

    it('H.f un sous-critère se déplace aux chevrons, son CODE voyage avec lui, la liste suit', async () => {
        const { win, liste, store } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        let html = liste().innerHTML;
        const plat = html.slice(pos(html, 'sous-criteres-conteneur--en-tete'), pos(html, 'data-pli="CR:formule"'));
        expect(plat).toMatch(/data-action="deplacerSousCritereHaut" data-param="G1" data-param2="0" data-param3="0" disabled/);
        expect(plat).toMatch(/data-action="deplacerSousCritereBas" data-param="G1" data-param2="0" data-param3="0"\s*>/);
        expect(plat).toMatch(/data-action="deplacerSousCritereBas" data-param="G1" data-param2="0" data-param3="1" disabled/);
        expect((plat.match(/class="bloc-coin-outils"/g) || []).length).toBe(2);
        // Le geste : le second passe premier ; le code « 1 » reste sur « Thèse », le « 0 » sur « Aucune erreur ».
        await win.deplacerSousCritereBas('G1', 0, 0);
        const scs = store[CLE][0].criteres[0].sousCriteres;
        expect(scs.map(sc => sc.code)).toEqual(['1', '0']);
        expect(scs.map(sc => sc.id)).toEqual(['sc_1', 'sc_0']);
        expect(scs[0].nom).toContain('Thèse');
        // Le rendu suit — une seule liste (lot A) : le code « 1 » passe premier, rien n'est recopié ailleurs.
        html = liste().innerHTML;
        expect(html.indexOf('value="1"')).toBeLessThan(html.indexOf('value="0"'));
        expect(html).not.toContain('sous-critere-code-lecture');
        // Aux bornes : rien ne bouge.
        await win.deplacerSousCritereHaut('G1', 0, 0);
        expect(store[CLE][0].criteres[0].sousCriteres.map(sc => sc.code)).toEqual(['1', '0']);
        await win.deplacerSousCritereBas('G1', 0, 1);
        expect(store[CLE][0].criteres[0].sousCriteres.map(sc => sc.code)).toEqual(['1', '0']);
        // Ce qui rend le déplacement sûr : la palette et le calcul lisent le CODE, jamais le rang.
        expect(source('js/codes-annotation.js')).toContain("var numero = (sc.code === undefined || sc.code === null) ? '' : String(sc.code).trim();");
        expect(source('js/evaluation-calcul.js')).toContain('sousCriteres.find(s => s.code === code)');
    });

    // D1 (Grégoire, 17 oct. 2026) : le champ redevient « Description » — les vrais descripteurs, par
    // niveau, sont dans le bloc « Ce qui est attendu à chaque niveau » du même écran.
    it('H.g la rangée du critère dit « Description », plus « Descripteur » — la clé du champ ne bouge pas', () => {
        const a = monter([GRILLE]);
        a.win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const edition = a.liste().innerHTML;
        expect(edition).toContain('>Description</label>');
        expect(edition).not.toContain('>Descripteur</label>');
        expect(edition).toContain('data-champ="description"');
        const c = monter([]);
        c.win.tempCriteres = [{ id: 'T', nom: 'x', type: 'holistique', ponderation: 0 }];
        c.win.afficherCriteresTemp();
        expect(c.liste().innerHTML).toContain('>Description</label>');
        expect(c.liste().innerHTML).not.toContain('>Descripteur</label>');
        expect(c.liste().innerHTML).toContain('data-champ="description"');
    });
});
