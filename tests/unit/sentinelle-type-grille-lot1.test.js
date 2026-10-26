/**
 * Sentinelle — LE TYPE MONTE À LA GRILLE (consigne du 3 septembre 2026, lot 1).
 *
 * Arrêté par Grégoire : la grille déclare son type, celui de sa pratique ; ce
 * type est le DÉFAUT de ses critères ; un critère peut déroger par son propre
 * menu (la politique départementale impose 20 % pour le français) ; « mixte »
 * est un CONSTAT du badge, jamais une case. Aucune grille d'avant ce lot ne
 * porte `grille.type`, et rien n'est écrit dans ses données tant que
 * l'utilisateur n'a pas choisi lui-même.
 *
 *   A — le défaut d'un critère neuf, et ce que le menu MONTRE (lecture seule) ;
 *   B — en création : choisir « Analytique », ajouter trois critères — les trois
 *       sont analytiques sans rien cocher ; une dérogation faite à la main tient ;
 *   C — en édition : une grille d'avant ce lot fonctionne comme avant, le menu
 *       montre le déduit sans l'écrire, et le choix s'écrit (le vide RETIRE) ;
 *   D — le transport : `type` traverse l'import/export ET le partage, et aucun
 *       des deux ne FABRIQUE un type à une grille qui n'en a pas ;
 *   E — le badge dit ce qui EST : il ne lit jamais `grille.type` ;
 *   F — les témoins de source : les trois créateurs de critère lisent le défaut.
 *
 * ↻ RETOUCHE DU 4 SEPTEMBRE (décision de Grégoire, avant son coup d'œil) : le MENU
 *   montre ce que les données portent — « Non précisé » quand `grille.type` est
 *   absent — et la déduction se dit en clair SOUS le menu (« Tes critères sont tous
 *   holistiques. »), jamais par une couleur. Rien quand un type est déclaré, quand
 *   les types divergent, ou sans critère. Les cas B/C changent de sens, pas de
 *   périmètre : chacun affirme maintenant le menu ET la ligne.
 *
 * ⚠ Ce banc EXÉCUTE les fonctions réelles de grilles.js sur un stockage en
 * mémoire (patron des sentinelles #516 / #522) ; les assertions statiques (F)
 * ne font que nommer les sites, elles ne tiennent pas lieu de preuve.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

/* ------------------------------------------------------------------ harnais */

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        focus() {}, select() {}, querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, removeChild() {}, setAttribute() {}, click() {}, scrollIntoView() {}
    };
}

function fauxDocument() {
    const elements = {};
    return {
        _elements: elements,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {}, insertAdjacentHTML() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}

const CLE = 'a2026_grillesTemplates';

function monter(grilles) {
    const store = { [CLE]: grilles };
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
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true, prompt: () => 'Copie',
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },   // #483 : warning, le vrai nom
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null,
                          filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        nommerCopie: (n) => n + ' (copie)',
        // Déclarée dans js/config.js en production, avant grilles.js.
        grilleTemplateActuelle: null
    });
    win.bareme = chargerScript('js/bareme.js').bareme;   // #1120, lot 1 : la lecture du barème, que la liste des critères appelle
    win.estRessourceSupprimee = () => false;
    win.marquerRessourceSupprimee = () => {};
    win.IDS_GABARITS_HARDCODES = [];
    win.boutonRetirerBloc = () => '';
    win.boutonsReordonnerBloc = () => '';
    return { win, store, document, grilles: () => store[CLE] };
}

const crit = (id, type, extra = {}) => ({ id, nom: 'Critère ' + id, ponderation: 50, ...(type ? { type } : {}), ...extra });
const menu = (document) => document.getElementById('typeGrille').value;
const ligne = (document) => document.getElementById('precisionTypeGrille').textContent;
/** Choisir au menu comme le dispatcher le fait : l'élément porte déjà la valeur quand le handler part. */
const choisir = (win, document, valeur) => { const m = document.getElementById('typeGrille'); m.value = valeur; return win.modifierTypeGrilleHandler(m); };

/* -------------------------------------------- A — le défaut, et ce que le menu montre */

describe('lot 1 · A — le défaut d\'un critère neuf, et ce que le menu montre', () => {
    let win;
    beforeAll(() => { win = monter([]).win; });

    it('A.a le type de la grille est le défaut ; sans lui, holistique — comme avant', () => {
        expect(win.typeCritereParDefaut({ type: 'analytique' })).toBe('analytique');
        expect(win.typeCritereParDefaut({ type: 'algorithmique' })).toBe('algorithmique');
        expect(win.typeCritereParDefaut({ type: 'holistique' })).toBe('holistique');
        expect(win.typeCritereParDefaut({})).toBe('holistique');
        expect(win.typeCritereParDefaut(null)).toBe('holistique');
        // Un type que personne ne connaît n'est pas un défaut.
        expect(win.typeCritereParDefaut({ type: 'standard' })).toBe('holistique');
        expect(win.typeCritereParDefaut({ type: 'mixte' })).toBe('holistique');
    });

    it('A.b le menu montre le déclaré, sinon le déduit quand il est unique, sinon rien', () => {
        // Déclaré : il l'emporte, même si les critères disent autre chose.
        expect(win.typeGrilleAffiche({ type: 'analytique', criteres: [crit('1', 'holistique')] })).toBe('analytique');
        // Déduit : un seul type parmi les critères.
        expect(win.typeGrilleAffiche({ criteres: [crit('1', 'holistique'), crit('2', 'holistique')] })).toBe('holistique');
        expect(win.typeGrilleAffiche({ criteres: [crit('1', 'algorithmique')] })).toBe('algorithmique');
        // Rien : composition mixte, aucun critère, critères sans type, type inconnu.
        expect(win.typeGrilleAffiche({ criteres: [crit('1', 'holistique'), crit('2', 'algorithmique')] })).toBe('');
        expect(win.typeGrilleAffiche({ criteres: [] })).toBe('');
        expect(win.typeGrilleAffiche({ criteres: [crit('1', null)] })).toBe('');
        expect(win.typeGrilleAffiche({ criteres: [crit('1', 'standard')] })).toBe('');
        expect(win.typeGrilleAffiche(null)).toBe('');
        // Le menu ne connaît pas « mixte » : un `type: 'mixte'` écrit à la main n'est pas montré.
        expect(win.typeGrilleAffiche({ type: 'mixte', criteres: [crit('1', 'holistique')] })).toBe('holistique');
    });

    it('A.c la phrase sous le menu : le texte de Grégoire, tel quel — et rien si déclaré, mixte ou vide', () => {
        expect(win.phrasePrecisionTypeGrille({ criteres: [crit('1', 'holistique'), crit('2', 'holistique')] })).toBe('Tes critères sont tous holistiques.');
        expect(win.phrasePrecisionTypeGrille({ criteres: [crit('1', 'analytique')] })).toBe('Tes critères sont tous analytiques.');
        expect(win.phrasePrecisionTypeGrille({ criteres: [crit('1', 'algorithmique')] })).toBe('Tes critères sont tous algorithmiques.');
        // Déclaré : rien, même si les critères sont d'un seul type.
        expect(win.phrasePrecisionTypeGrille({ type: 'analytique', criteres: [crit('1', 'holistique')] })).toBe('');
        // Mixte : rien (le badge MIXTE le dit déjà). Sans critère : rien.
        expect(win.phrasePrecisionTypeGrille({ criteres: [crit('1', 'holistique'), crit('2', 'algorithmique')] })).toBe('');
        expect(win.phrasePrecisionTypeGrille({ criteres: [] })).toBe('');
        expect(win.phrasePrecisionTypeGrille(null)).toBe('');
    });
});

/* ----------------------------------------------------- B — en création, sans rien cocher */

describe('lot 1 · B — en création : choisir « Analytique », puis ajouter — sans rien cocher', () => {
    it('B.a la grille neuve part sans type : menu vide, premier critère holistique', () => {
        const { win, document } = monter([]);
        win.creerNouvelleGrille();
        expect(menu(document)).toBe('');
        expect(ligne(document), 'le premier critère, vide, est holistique — la ligne le dit').toBe('Tes critères sont tous holistiques.');
        expect(win.tempCriteres).toHaveLength(1);
        expect(win.tempCriteres[0].type).toBe('holistique');
    });

    it('B.b LE « FINI QUAND » : choisir Analytique, ajouter deux critères — les trois sont analytiques', async () => {
        const { win, document } = monter([]);
        win.creerNouvelleGrille();
        await choisir(win, document, 'analytique');
        expect(menu(document)).toBe('analytique');
        expect(ligne(document), 'déclaré : la ligne se tait').toBe('');
        // Le premier critère, vide, suivait le défaut : il suit le nouveau.
        expect(win.tempCriteres[0].type).toBe('analytique');
        win.ajouterCritereTemp();
        win.ajouterCritereTemp();
        expect(win.tempCriteres.map(c => c.type)).toEqual(['analytique', 'analytique', 'analytique']);
    });

    it('B.c une dérogation faite à la main tient quand le type de la grille change', async () => {
        const { win, document } = monter([]);
        win.creerNouvelleGrille();
        await choisir(win, document, 'analytique');
        win.ajouterCritereTemp();
        win.ajouterCritereTemp();
        // Le français, imposé à 20 % par la politique départementale : algorithmique.
        win.modifierCritereTemp(1, 'type', 'algorithmique');
        await choisir(win, document, 'holistique');
        expect(win.tempCriteres.map(c => c.type)).toEqual(['holistique', 'algorithmique', 'holistique']);
    });

    it('B.d à l\'enregistrement, la grille porte le type choisi et ses critères le leur', async () => {
        const { win, document, grilles } = monter([]);
        win.creerNouvelleGrille();
        document.getElementById('nomGrilleTemplate').value = 'Dissertation';
        await choisir(win, document, 'analytique');
        win.ajouterCritereTemp();
        win.ajouterCritereTemp();
        await win.sauvegarderGrilleTemplate();
        const g = grilles().find(x => x.nom === 'Dissertation');
        expect(g, 'la grille est enregistrée').toBeTruthy();
        expect(g.type).toBe('analytique');
        expect(g.criteres.map(c => c.type)).toEqual(['analytique', 'analytique', 'analytique']);
        // Le choix en attente est consommé : une prochaine création repart de rien.
        expect(win.tempTypeGrille).toBe('');
    });

    it('B.e SANS CHOIX, rien n\'est écrit : la grille n\'a pas de champ `type`', async () => {
        const { win, document, grilles } = monter([]);
        win.creerNouvelleGrille();
        document.getElementById('nomGrilleTemplate').value = 'Sans type';
        win.ajouterCritereTemp();
        await win.sauvegarderGrilleTemplate();
        const g = grilles().find(x => x.nom === 'Sans type');
        expect(g).toBeTruthy();
        expect(Object.prototype.hasOwnProperty.call(g, 'type'), 'aucun `type` fabriqué').toBe(false);
        expect(g.criteres.map(c => c.type)).toEqual(['holistique', 'holistique']);
    });

    it('B.f une valeur qui n\'est pas un type (« mixte », vide, inconnue) ne devient pas un défaut', async () => {
        const { win, document, grilles } = monter([]);
        win.creerNouvelleGrille();
        document.getElementById('nomGrilleTemplate').value = 'Forcée';
        await choisir(win, document, 'mixte');
        win.ajouterCritereTemp();
        expect(win.tempCriteres.map(c => c.type)).toEqual(['holistique', 'holistique']);
        await win.sauvegarderGrilleTemplate();
        expect(Object.prototype.hasOwnProperty.call(grilles().find(x => x.nom === 'Forcée'), 'type')).toBe(false);
    });
});

/* ------------------------------------------------ C — en édition, une grille d'avant ce lot */

const GRILLES_AVANT = () => ([
    { id: 'G0', nom: 'Toute holistique', dansBibliotheque: true, criteres: [crit('1', 'holistique'), crit('2', 'holistique')] },
    { id: 'GA', nom: 'Toute algorithmique', dansBibliotheque: true, criteres: [crit('1', 'algorithmique'), crit('2', 'algorithmique')] },
    { id: 'GM', nom: 'Mixte de fait', dansBibliotheque: true, criteres: [crit('1', 'holistique'), crit('2', 'algorithmique')] }
]);

const sansType = (g) => !Object.prototype.hasOwnProperty.call(g, 'type');

describe('lot 1 · C — en édition : une grille d\'avant ce lot fonctionne comme avant', () => {
    it('C.a ouvrir une grille toute holistique : le menu dit « Non précisé », la LIGNE dit la déduction, rien n\'est ÉCRIT', async () => {
        const { win, document, grilles } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('G0');
        expect(menu(document), 'le menu montre ce que les données portent : rien').toBe('');
        expect(ligne(document)).toBe('Tes critères sont tous holistiques.');
        expect(sansType(grilles().find(g => g.id === 'G0'))).toBe(true);
    });

    it('C.b y ajouter un critère : holistique, et toujours pas de champ `type`', async () => {
        const { win, grilles } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('G0');
        await win.ajouterCritereGrille('G0');
        const g = grilles().find(x => x.id === 'G0');
        expect(g.criteres).toHaveLength(3);
        expect(g.criteres[2].type).toBe('holistique');
        expect(sansType(g)).toBe(true);
    });

    it('C.c une grille toute algorithmique sans type déclaré : le menu le montre, mais un critère neuf reste holistique (la consigne : « exactement comme aujourd\'hui »)', async () => {
        const { win, document, grilles } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('GA');
        expect(menu(document)).toBe('');
        expect(ligne(document)).toBe('Tes critères sont tous algorithmiques.');
        await win.ajouterCritereGrille('GA');
        const g = grilles().find(x => x.id === 'GA');
        expect(g.criteres[2].type).toBe('holistique');
        expect(sansType(g)).toBe(true);
        expect(ligne(document), 'les types divergent maintenant : la ligne se tait, le badge dit MIXTE').toBe('');
    });

    it('C.d une composition mixte : le menu ne présélectionne rien', async () => {
        const { win, document } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('GM');
        expect(menu(document)).toBe('');
        expect(ligne(document), 'mixte : le badge le dit déjà').toBe('');
    });

    it('C.e choisir un type sur une grille existante : il s\'ÉCRIT, ses critères existants ne bougent pas, un critère neuf le reçoit', async () => {
        const { win, document, grilles } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('G0');
        document.getElementById('nomGrilleTemplate').value = 'Toute holistique';
        await choisir(win, document, 'analytique');
        let g = grilles().find(x => x.id === 'G0');
        expect(g.type).toBe('analytique');
        expect(menu(document)).toBe('analytique');
        expect(ligne(document), 'déclaré : la ligne se tait').toBe('');
        expect(g.criteres.map(c => c.type), 'les critères existants sont des données').toEqual(['holistique', 'holistique']);
        await win.ajouterCritereGrille('G0');
        g = grilles().find(x => x.id === 'G0');
        expect(g.criteres[2].type).toBe('analytique');
        // Et le voisin n'a rien reçu.
        expect(sansType(grilles().find(x => x.id === 'GA'))).toBe(true);
    });

    it('C.f revenir à « Non précisé » RETIRE le champ — jamais `type: \'\'`', async () => {
        const { win, document, grilles } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('G0');
        document.getElementById('nomGrilleTemplate').value = 'Toute holistique';
        await choisir(win, document, 'analytique');
        expect(grilles().find(x => x.id === 'G0').type).toBe('analytique');
        await choisir(win, document, '');
        expect(sansType(grilles().find(x => x.id === 'G0'))).toBe(true);
        expect(menu(document)).toBe('');
        expect(ligne(document), 'le champ retiré, la déduction revient').toBe('Tes critères sont tous holistiques.');
    });

    // #1147 (24 oct. 2026) : la barre latérale et son badge de composition sont partis ; le menu de la sélection,
    // lui, est redessiné (le nom seul) — le geste qui rafraîchissait le badge reste éprouvé.
    it('C.g le menu de la sélection est redessiné quand un critère change de type', async () => {
        const { win, document, grilles } = monter(GRILLES_AVANT());
        await win.chargerGrillePourModif('G0');
        expect(ligne(document)).toBe('Tes critères sont tous holistiques.');
        const barre = document.getElementById('selectionGrilles');
        barre.innerHTML = '';
        await win.modifierTypeCritereGrilleHandler({ dataset: { grilleId: 'G0', critereIndex: '1' }, value: 'algorithmique' });
        expect(grilles().find(x => x.id === 'G0').criteres[1].type).toBe('algorithmique');
        expect(barre.innerHTML, 'le menu a été redessiné').toContain('<select id="menuGrilles"');
        expect(ligne(document), 'mixte désormais : la ligne suit sans rechargement').toBe('');
    });

    it('C.h dupliquer depuis la barre latérale : la copie garde le type déclaré — et n\'en reçoit pas si la source n\'en a pas', async () => {
        const { win, grilles } = monter(GRILLES_AVANT().concat([{ id: 'GT', nom: 'Déclarée', type: 'analytique', dansBibliotheque: true, criteres: [crit('1', 'analytique')] }]));
        await win.dupliquerGrilleDepuisSidebar('GT');
        const copie = grilles().find(g => g.id !== 'GT' && g.nom === 'Déclarée (copie)');
        expect(copie).toBeTruthy();
        expect(copie.type).toBe('analytique');
        await win.dupliquerGrilleDepuisSidebar('G0');
        expect(sansType(grilles().find(g => g.nom === 'Toute holistique (copie)'))).toBe(true);
    });

    it('C.i dupliquer par la fenêtre modale (copie reconstruite champ par champ) : le type déclaré suit aussi', async () => {
        const { win, grilles } = monter(GRILLES_AVANT().concat([{ id: 'GT', nom: 'Déclarée', type: 'analytique', dansBibliotheque: true, criteres: [crit('1', 'analytique')] }]));
        await win.dupliquerGrille('GT');
        const copie = grilles().find(g => g.id !== 'GT' && g.nom === 'Copie');
        expect(copie, 'la copie « Copie » (nom rendu par le prompt du banc) est écrite').toBeTruthy();
        expect(copie.type).toBe('analytique');
        expect(copie.criteres.map(c => c.type)).toEqual(['analytique']);
        await win.dupliquerGrille('G0');
        expect(sansType(grilles().find(g => g.id !== 'G0' && g.nom === 'Copie' && g.criteres.length === 2))).toBe(true);
    });
});

/* ------------------------------------------------------------------ D — le transport */

function grilleDeclaree() {
    return {
        id: 'GR_T', nom: 'Grille analytique', type: 'analytique',
        criteres: [
            { id: 'CR_1', nom: 'Contenu', ponderation: 70, type: 'analytique' },
            { id: 'CR_2', nom: 'Langue', ponderation: 30, type: 'algorithmique' }
        ],
        dateCreation: '2026-09-03T00:00:00Z', dansBibliotheque: true,
        metadata_cc: { auteur_original: 'Banc', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
    };
}

function pkgAvec(grille) {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0', dateExport: '2026-09-03T12:00:00Z', auteur: { nom: 'Banc' },
            item_principal: { type: 'grille', id: 'GR_T' }, chaineAttribution: [],
            signature: null, clePublique: null, algorithme: null
        },
        entites: { grilles: [grille] }, references: [], medias: []
    };
}

describe('lot 1 · D — le type voyage, et personne ne le fabrique', () => {
    let winIE, winP;
    beforeAll(() => {
        winIE = chargerScript('js/import-export.js');
        const db = { getSync: (k, d) => (d !== undefined ? d : null) };
        winP = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db }, winP);
        chargerScript('js/partage-format.js', { db }, winP);
    });

    it('D.a import/export : `type` traverse l\'assainissement, avec ceux des critères', () => {
        const apres = winIE.assainirObjet(grilleDeclaree(), winIE.SCHEMAS_IMPORT.grille);
        expect(apres.type).toBe('analytique');
        expect(apres.criteres.map(c => c.type)).toEqual(['analytique', 'algorithmique']);
    });

    it('D.b partage : `type` traverse la projection, et le package reste VALIDE', () => {
        const projete = winP.partageFormat.projeterEntite(grilleDeclaree(), 'grille');
        expect(projete.type).toBe('analytique');
        expect(projete.criteres.map(c => c.type)).toEqual(['analytique', 'algorithmique']);
        const r = winP.partageValidation.validerPackage(pkgAvec(projete));
        expect(r.erreurs).toEqual([]);
        expect(r.valide).toBe(true);
    });

    it('D.c une grille SANS type arrive sans type — aucun des deux canaux n\'en fabrique', () => {
        const g = grilleDeclaree(); delete g.type;
        expect(winIE.assainirObjet(g, winIE.SCHEMAS_IMPORT.grille).type).toBeUndefined();
        expect(winP.partageFormat.projeterEntite(g, 'grille').type).toBeUndefined();
    });

    it('D.d le champ est déclaré des DEUX côtés, au niveau de la GRILLE (pas seulement du critère)', () => {
        expect(winIE.SCHEMAS_IMPORT.grille.type).toBeTruthy();
        expect(winP.partageSchemas.SCHEMA_ENTITE.grille.champs.type).toBeTruthy();
    });
});

/* ------------------------------------------------------- E — le badge dit ce qui EST */

describe('lot 1 · E — le badge de composition ne lit JAMAIS `grille.type`', () => {
    let G;
    beforeAll(() => {
        G = chargerScript('js/gabarits-utils.js', {
            db: { getSync: (c, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
            cle: (k) => 'a2026_' + k, echapperHtml: (t) => String(t == null ? '' : t),
            estRessourceSupprimee: () => false, marquerRessourceSupprimee: () => {}
        }).GabaritsUtils;
    });

    it('E.a déclarée analytique, un critère passé en algorithmique : MIXTE', () => {
        const g = { type: 'analytique', criteres: [crit('1', 'analytique'), crit('2', 'algorithmique')] };
        expect(G.compositionGrille(g)).toBe('MIXTE');
    });

    it('E.b déclarée analytique, critères tous holistiques : HOLIS — le badge dit ce qui est, pas ce qui est déclaré', () => {
        expect(G.compositionGrille({ type: 'analytique', criteres: [crit('1', 'holistique'), crit('2', 'holistique')] })).toBe('HOLIS');
    });

    it('E.c déclarée, sans critère : rien — le type déclaré ne remplit pas le badge', () => {
        expect(G.compositionGrille({ type: 'analytique', criteres: [] })).toBe('');
        // #1154 : le badge est parti ; la composition, elle, reste vide.
        expect(G.compositionGrille({ type: 'analytique' })).toBe('');
    });
});

/* ------------------------------------------------------------ F — témoins de source */

describe('lot 1 · F — les témoins de source', () => {
    it('F.a les trois créateurs de critère vivants lisent le défaut de la grille', () => {
        const { win } = monter([]);
        expect(win.creerNouvelleGrille.toString()).toMatch(/typeCritereParDefautEnCours\(\)/);
        expect(win.ajouterCritereTemp.toString()).toMatch(/typeCritereParDefautEnCours\(\)/);
        expect(win.ajouterCritereGrille.toString()).toMatch(/typeCritereParDefaut\(g\)/);
        // Plus aucune ligne `type: 'holistique',` posée en dur sur un critère neuf
        // (elles étaient trois : creerNouvelleGrille, ajouterCritereTemp, ajouterCritereGrille).
        const s = source('js/grilles.js');
        expect((s.match(/^\s+type: 'holistique',$/gm) || []).length).toBe(0);
        // Témoin : les quatre critères de la grille générique semée gardent le leur.
        expect((s.match(/type: 'holistique' \}/g) || []).length).toBe(4);
    });

    it('F.b le menu de la grille existe, et il n\'offre PAS « mixte »', () => {
        const html = source('index.html');
        const debut = html.indexOf('id="typeGrille"');
        expect(debut).toBeGreaterThan(-1);
        const bloc = html.slice(debut, html.indexOf('</select>', debut));
        expect(bloc).toContain('data-on-change="modifierTypeGrilleHandler"');
        expect(bloc).toContain('value="analytique"');
        expect(bloc).not.toMatch(/mixte/i);
        // Une seule déclaration du menu.
        expect((html.match(/id="typeGrille"/g) || []).length).toBe(1);
    });

    it('F.c retouche du 4 sept. : le menu ne lit plus la déduction ; la ligne existe, une fois, sans couleur', () => {
        const { win } = monter([]);
        expect(win.chargerGrillePourModif.toString()).not.toMatch(/rendreMenuTypeGrille\(typeGrilleAffiche/);
        expect(win.chargerGrillePourModif.toString()).toMatch(/rendreMenuTypeGrille\(grille\.type\)/);
        const html = source('index.html');
        expect((html.match(/id="precisionTypeGrille"/g) || []).length).toBe(1);
        const debut = html.indexOf('id="precisionTypeGrille"');
        const balise = html.slice(html.lastIndexOf('<', debut), html.indexOf('>', debut) + 1);
        expect(balise).not.toMatch(/orange|vert|color|couleur/i);
    });
});
