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
 *   ↻ #1150, LOT 4 (24 oct. 2026, maquette validée par Grégoire) : les cartes sont devenues les cinq ÉTAPES de
 *       l'atelier — Ce que tu comptes · Codes · Note · Paliers · Ce que l'élève lit —, UNE seule ouverte (« Ce
 *       que l'élève lit » au départ), l'étape ouverte gardée en mémoire par critère (`js/atelier-algo.js`), jamais
 *       dans la grille. Cette décision remplace « ouvert ce qui porte la note, fermé ce qui porte les mots ».
 *       A, B.c et C sont réécrits sur ces invariants ; les plis qui restent sont ceux des rangées (« Observation »).
 *       BREAK-TESTS (24 oct., restaurés, `shasum` identique) : Note après Paliers → A.a, B.c ; deux étapes
 *       ouvertes au rendu → A.b, C.a, C.b ; l'état oublié au redessin (`etats` remis à zéro) → C.a, C.b.
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
import { etapeDe, etapeOuverte } from './_helpers/atelier-algo.js';
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
    win.bareme = chargerScript('js/bareme.js').bareme;   // #1120, lot 1 : la lecture du barème, que la liste des critères appelle
    // Les registres réels — le gabarit rend '' pour un registre absent.
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = require(path.join(racine, 'js/evaluation-enonces.js'));
    win.projectionAlgo = require(path.join(racine, 'js/evaluation-projection.js'));
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.atelierAlgo = require(path.join(racine, 'js/atelier-algo.js'));   // #1150 : l'atelier du critère, qui rend le gabarit
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
// ↻ #1150 : les cartes sont les étapes de l'atelier (`_helpers/atelier-algo.js`).
const ETAPE_DE = { formule: 'note', projection: 'paliers', commentaire: 'eleve' };
const carte = (html, section, id) => {
    const e = etapeDe(html, id || 'CR', ETAPE_DE[section] || section);
    return e ? { presente: true, ferme: !etapeOuverte(html, id || 'CR', ETAPE_DE[section] || section) } : { presente: false };
};
/** Le HTML d'une étape, de sa section à la suivante (ou à l'aperçu). */
const contenuCarte = (html, section, id) => etapeDe(html, id || 'CR', ETAPE_DE[section] || section);
/** Un atelier sans DOM, pour l'état en mémoire : `ouvrir` n'a besoin que de son critère et de son contexte. */
const atelierFictif = (critereId, index) => ({
    _critere: { id: critereId }, _ctx: { mode: 'grille', grilleId: 'G1', index: index || 0 },
    querySelectorAll: () => [], querySelector: () => null
});
const ORDRE = ['compte', 'codes', 'note', 'paliers', 'eleve'];

/* ----------------------------------------------- A — l'ordre et l'état des cartes */

describe('lot 4 · C.A — ↻ #1150 : l\'ordre des étapes, et UNE seule ouverte', () => {
    it('A.a en ÉDITION : la rangée du critère, puis la chaîne, puis Ce que tu comptes · Codes (les sous-critères) · Note · Paliers · Ce que l\'élève lit', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const rangee = pos(html, 'data-champ="nom"');
        const chaine = pos(html, 'class="atelier-algo-chaine"');
        const positions = ORDRE.map((e) => pos(html, 'data-etape="' + e + '"'));
        for (const p of [rangee, chaine, ...positions]) expect(p).toBeGreaterThan(-1);
        expect(rangee).toBeLessThan(chaine);
        expect(chaine).toBeLessThan(positions[0]);
        positions.slice(1).forEach((p, n) => expect(p, ORDRE[n + 1]).toBeGreaterThan(positions[n]));
        // Les sous-critères sont dans l'étape « Codes », la formule dans « Note », les paliers dans « Paliers ».
        expect(contenuCarte(html, 'codes')).toContain('sous-criteres-conteneur--en-tete');
        expect(contenuCarte(html, 'formule')).toContain('Le calcul de la note');   // ↻ étape 4a : les trois cartes
        expect(contenuCarte(html, 'projection')).toContain('class="table-cas"');   // ↻ lot 3a : la table des paliers
        expect(html).not.toContain('gabarit-algo-carte');
        expect(html).not.toContain('data-pli="CR:codes"');
    });

    it('A.b UNE seule étape ouverte au départ, « Ce que l\'élève lit » ; chaque étape a son en-tête-bouton, relié à son corps', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        expect(ORDRE.filter((e) => etapeOuverte(html, 'CR', e))).toEqual(['eleve']);
        expect((html.match(/<div class="atelier-algo-etape-corps" id="[^"]+">/g) || []).length).toBe(1);
        expect((html.match(/<div class="atelier-algo-etape-corps" id="[^"]+" hidden>/g) || []).length).toBe(4);
        for (const e of ORDRE) {
            const c = contenuCarte(html, e);
            expect(c, e).toMatch(new RegExp('<button type="button" class="atelier-algo-etape-tete" data-action="atelierAlgo.basculerEtape" aria-expanded="' + (e === 'eleve') + '" aria-controls="atelier-algo-0-' + e + '">'));
            expect(c, e).toContain('id="atelier-algo-0-' + e + '"');
            expect(c, e).toContain('class="atelier-algo-etape-resume" data-resume>');
        }
    });

    it('A.c en CRÉATION : les mêmes étapes, et (↻ #1131, 21 oct. 2026) les sous-critères, par la cible `temp`', () => {
        const { win, liste } = monter([]);
        win.tempTypeGrille = 'algorithmique';
        win.tempCriteres = [{ id: 'TEMP_1', nom: 'Rigueur', type: 'algorithmique', ponderation: 100 }];
        win.afficherCriteresTemp();
        const html = liste().innerHTML;
        const positions = ORDRE.map((e) => pos(html, 'data-critere-id="TEMP_1"') < 0 ? -1 : etapeDe(html, 'TEMP_1', e).length);
        positions.forEach((n, k) => expect(n, ORDRE[k]).toBeGreaterThan(0));
        expect(html).not.toContain('Les sous-critères se définissent une fois la grille enregistrée.');
        expect(html).toContain('data-action="initialiserSousCriteresParDefaut" data-param="temp" data-param2="0"');
        expect(etapeDe(html, 'TEMP_1', 'codes')).toContain('class="sous-criteres-conteneur');
        expect(etapeDe(html, 'TEMP_1', 'note')).toContain('data-on-change="modifierReglageCalculAlgo" data-cible="temp"');   // ↻ étape 4a
    });

    it('A.d un critère holistique ou analytique n\'a aucune carte — le gabarit long est celui de l\'algorithmique seul', () => {
        const { win, liste } = monter([]);
        win.afficherCriteresGrille({ id: 'G2', criteres: [{ id: 'H', nom: 'Contenu', type: 'holistique', ponderation: 50 }, { id: 'A', nom: 'Langue', type: 'analytique', ponderation: 50 }] });
        expect(liste().innerHTML).not.toContain('gabarit-algo');
        expect(liste().innerHTML).not.toContain('atelier-algo-etape');
        expect(liste().innerHTML).not.toContain('sous-criteres-conteneur');
    });
});

/* ------------------------------------------------------------------ B — les libellés */

describe('lot 4 · C.B — les libellés', () => {
    it('B.a « Modèle des phrases (bilan et décompte) » dans le gabarit (↻ 1.120, d\'abord « Modèle d\'observation ») ; ni « rétroaction » ni « commentaire » ; la cartouche garde son mot', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        expect(html).toContain('Modèle des phrases</label>');   // ↻ lot 3a (ébauche du 26 oct.) : « Modèle des phrases »
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
        // ↻ Lot 3a (26 oct. 2026) : le menu des modèles est parti ; un critère sous `norme_externe` montre sa
        // limite fixée (« Retirer la limite »), et l'id ne change pas dans la grille.
        const { win, liste, store } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        expect(liste().innerHTML).toContain('data-action="retirerLimiteAlgo"');
        expect(liste().innerHTML).not.toContain('<option value="norme_externe"');
        // Un critère d'avant ne porte pas le champ : il LIT `norme_externe` (la migration), rien n'est écrit.
        expect(store[CLE][0].criteres[0].modeleProjection).toBeUndefined();
        expect(P.normaliser(store[CLE][0].criteres[0]).modeleId).toBe('norme_externe');
    });

    it('B.c les titres des étapes sont ceux de la maquette validée (↻ #1150) : « Formule » devient « Note », la projection « Paliers », « Bilan » « Ce que l\'élève lit »', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const titres = [...html.matchAll(/<span class="atelier-algo-etape-nom">([^<]+)<\/span>/g)].map((m) => m[1].replace(/&#x27;|&#39;/g, "'"));
        // ↻ Lot 3a (26 oct. 2026) : les noms de l'ébauche validée.
        expect(titres).toEqual(['Ce que tu relèves et comptes', 'Codes utilisés', 'Note calculée', 'Cas d’interprétation', 'Ce que l’étudiant·e lit']);
        expect(html).not.toMatch(/<span class="accordeon-chevron">[▶▼]<\/span> (?:Formule|Bilan|Ce que l)/);
        expect(html).not.toMatch(/<\/span> Codes d(?:'|&#x27;|&#39;)annotation/);
    });
});

/* ------------------------------------------------------------ C — les plis, en mémoire */

describe('lot 4 · C.C — ↻ #1150 : l\'étape ouverte vit en mémoire, par critère, jamais dans la grille', () => {
    it('C.a le redessin relit l\'étape ouverte : « Paliers » ouverte reste ouverte, seule ; fermer tout tient aussi', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        win.atelierAlgo.ouvrir(atelierFictif('CR'), 'paliers', false);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        let html = liste().innerHTML;
        expect(ORDRE.filter((e) => etapeOuverte(html, 'CR', e))).toEqual(['paliers']);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        expect(ORDRE.filter((e) => etapeOuverte(liste().innerHTML, 'CR', e))).toEqual(['paliers']);
        win.atelierAlgo.ouvrir(atelierFictif('CR'), null, false);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        html = liste().innerHTML;
        expect(ORDRE.filter((e) => etapeOuverte(html, 'CR', e))).toEqual([]);
        win.atelierAlgo.ouvrir(atelierFictif('CR'), 'eleve', false);   // l'état de départ, pour la suite du banc
    });

    it('C.b l\'état est par CRITÈRE : ouvrir « Paliers » de l\'un laisse l\'autre sur « Ce que l\'élève lit »', () => {
        const AUTRE = { ...ALGO, id: 'CR2', nom: 'Français' };
        const G = { id: 'G1', criteres: [ALGO, AUTRE] };
        const { win, liste } = monter([G]);
        win.atelierAlgo.ouvrir(atelierFictif('CR'), 'paliers', false);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        const html = liste().innerHTML;
        expect(ORDRE.filter((e) => etapeOuverte(html, 'CR', e))).toEqual(['paliers']);
        expect(ORDRE.filter((e) => etapeOuverte(html, 'CR2', e))).toEqual(['eleve']);
        // Deux ateliers, des identifiants préfixés par l'index du critère.
        expect(html).toContain('id="atelier-algo-0-paliers"');
        expect(html).toContain('id="atelier-algo-1-paliers"');
        win.atelierAlgo.ouvrir(atelierFictif('CR'), 'eleve', false);
    });

    it('C.c rien n\'est écrit dans la grille ni dans le stockage ; plus aucune carte du composant accordéon pour les étapes', () => {
        const { win, liste, store } = monter([GRILLE]);
        const avant = JSON.stringify(store[CLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        win.atelierAlgo.ouvrir(atelierFictif('CR'), 'note', false);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        expect(JSON.stringify(store[CLE])).toBe(avant);
        expect(avant).not.toMatch(/"ouverte|atelier|data-etape/);
        const html = liste().innerHTML;
        expect(html).not.toContain('gabarit-algo-carte');
        expect(Object.keys(store)).toEqual([CLE]);
        win.atelierAlgo.ouvrir(atelierFictif('CR'), 'eleve', false);
    });
});

/* ---------------------------------------- D — la ligne de partage des sous-critères */

describe('lot 4 · C.D — les sous-critères : UNE seule liste (lot A du 5 sept.) — la note à plat, la case en tête, les mots sous un pli par rangée', () => {
    const plat = (html) => contenuCarte(html, 'codes');   // ↻ #1150 : l'étape « Codes »
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
        expect(html).toContain('Aucun sous-critère pour l\'instant : ajoute les tiens, ou pars de la liste du français écrit.');   // 22 oct. 2026, consigne du miroir, point 7
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
        expect((code.match(/rendreActivationCodes\(critere, \{ grilleId: grilleId, index: index, criteres: ctx\.criteres \}\)/g) || []).length).toBe(1);   // #1132 : les critères de la grille, pour dire où vont les codes
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
        // ↻ #1150 : les cartes du gabarit sont parties — leur plafond avec elles.
        expect(css).not.toContain('.gabarit-algo-carte');
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
        expect(b.liste().innerHTML).toContain('data-action="retirerLimiteAlgo"');   // ↻ lot 3a : sa limite est fixée
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
        // Et l'écran d'un critère neuf le dit (↻ lot 3a : « Aucune limite fixée », et « Fixer une limite »).
        c.win.afficherCriteresTemp();
        expect(c.liste().innerHTML).toContain('data-action="fixerLimiteAlgo"');
        expect(c.liste().innerHTML).toContain('Aucune limite fixée : l’étudiant·e ne lit aucun palier.');
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
        // Critère et deux sous-critères : une corbeille chacun. ↻ Lot 3a (ébauche du 26 oct.) : un palier se retire
        // par le lien « Retirer ce palier », au pied de sa rangée — même action, même identifiant.
        const corbeilles = (edition.match(/icons8-trash\.svg/g) || []).length;
        const paliers = (edition.match(/class="table-cas-rangee"/g) || []).length;
        expect(paliers).toBeGreaterThan(1);
        expect(corbeilles).toBe(1 + 2);
        expect((edition.match(/>Retirer ce palier<\/button>/g) || []).length).toBe(paliers);
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
        expect(creation).toMatch(/data-action="supprimerPalierProjectionTemp" data-param="0" data-param2="0">Retirer ce palier<\/button>/);
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

    // ↻ Lot 3a de la table de cas (26 oct. 2026) : un palier est une RANGÉE de la table (Quand · Nom court ·
    // L'étudiant·e lit), l'introduction de la table porte la décision sur le préfixe, une fois, en tête.
    it('G.c un palier tient sur une rangée de trois colonnes, le nom a sa colonne, l\'introduction une seule fois', () => {
        const { win, liste } = monter([GRILLE_PALIERS]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE_PALIERS)));
        const projection = contenuCarte(liste().innerHTML, 'projection');
        const paliers = projection.split('class="table-cas-rangee"').slice(1);
        expect(paliers.length).toBeGreaterThan(1);
        for (const pal of paliers) {
            for (const col of ['table-cas-quand', 'table-cas-nom', 'table-cas-textes']) expect(pal, col).toContain('class="' + col + '"');
            expect(pal).toContain('class="controle-form palier-nom"');
        }
        expect((projection.match(/palier-note-service/g) || []).length).toBe(0);
        expect((projection.match(/class="table-cas-ou"/g) || []).length).toBe(1);
        expect((projection.match(/Un verdict sans bloc est précédé de la moyenne/g) || []).length).toBe(1);
        expect(projection.indexOf('table-cas-ou')).toBeLessThan(projection.indexOf('table-cas-rangee'));
        expect(projection).toContain('value="Sans erreur"');
        // Les champs : ceux d'hier, le seuil en pourcentage (il s'enregistre en `ratioMax`, banc table-de-cas).
        for (const champ of ['libelle', 'seuilPourcent', 'texte', 'texteAide', 'leveSignalement']) expect(projection).toContain('data-champ="' + champ + '"');
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

    // ↻ Lot 3a (26 oct. 2026) : les rangées ne portent plus de numéro — chacune dit QUAND elle s'applique (rien de
    // compté, jusqu'à N % de la limite, au-delà du dernier seuil) ; toujours sans chevrons : l'ordre est le seuil.
    it('H.e les paliers se lisent dans l\'ordre du calcul, « Sans erreur » en tête, et n\'ont PAS de chevrons — l\'ordre est le seuil', () => {
        const { win, liste } = monter([GRILLE_PALIERS]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE_PALIERS)));
        const projection = contenuCarte(liste().innerHTML, 'projection');
        const paliers = projection.split('class="table-cas-rangee"').slice(1);
        expect(paliers.length).toBeGreaterThan(1);
        paliers.forEach((pal) => expect(pal).not.toContain('pipeline-btn-reorder'));
        expect(paliers[0]).toContain('value="Sans erreur"');
        expect(paliers[0]).toContain('<strong>Rien de compté</strong>');
        expect(paliers[paliers.length - 1]).toContain('<strong>Au-delà du dernier seuil</strong>');
        expect(projection).not.toContain('<label class="sous-critere-label-petit">Palier');
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
