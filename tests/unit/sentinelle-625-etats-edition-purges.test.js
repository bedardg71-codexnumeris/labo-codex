import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// SENTINELLE #625 (S7 du plan Conception, 31 août 2026) — LES ÉTATS DE CRÉATION
// NE SURVIVENT NI À L'ABANDON NI À LA BASCULE DE TRIMESTRE.
//
// CE QUI MANQUAIT (constat S3 de `Rapports/AUDIT-modele-objets-conception-2026-08-30.md`,
// §2.3). Le correctif #466/CO-16 (21 août) a posé un reset d'éditeur dans chacun
// des quatre éditeurs, mais chacun ne purge que le POINTEUR d'édition
// (`grilleTemplateActuelle`, `echelleTemplateActuelle`). Les TAMPONS DE CRÉATION —
// `window.tempCriteres` côté grilles, `window._niveauxNouvelleEchelle` et
// `window._reperesNouvelleEchelle` côté échelles — ont été oubliés dans deux
// éditeurs sur quatre. C'est le motif des « corrections qui se recouvrent
// partiellement » que l'audit instruit : le correctif existe, il est simplement
// plus étroit que son titre.
//
// ⮕ CE QUE CE BANC PROUVE, EN EXÉCUTANT LES VRAIS `grilles.js` ET `echelles.js` :
//   · A — `retourVueHierarchique` (l'« abandon » d'une création de grille) vide
//     `tempCriteres`, comme `annulerFormEchelle` vide déjà les siens. Le contraste
//     entre les deux éditeurs est CE constat, et le patron à recopier existait
//     donc déjà dans le fichier voisin ;
//   · B et C — les deux resets de bascule vident les tampons EN PLUS du pointeur ;
//   · D — LE CAS QUI PORTE LE SENS, et il ne se lit que sur les données : après
//     une bascule, la branche création du save reste armée (`grilleTemplateActuelle`
//     est nul, `tempCriteres` ne l'est pas). Les critères saisis dans l'ANCIEN
//     trimestre partaient donc en base dans le namespace du NOUVEAU. C'est le §4.5
//     des angles morts, et c'est une écriture inter-trimestre — pas un défaut
//     d'affichage.
//
// ⚠ CE QUE CE BANC NE VOIT PAS : Vitest tourne dans node, il ne rend rien. Ce que
// l'utilisateur VOIT dans l'éditeur après un abandon reste du ressort du test
// manuel §4.4/§4.5 (Mac et iPad). Ce banc prouve l'état des tampons et le contenu
// écrit en base, rien d'autre.
//
// ⚠⚠ PIÈGE DE HARNAIS PAYÉ EN ÉCRIVANT CE BANC, et il vaut pour toute sentinelle
// future sur ces deux fichiers. `grilleTemplateActuelle` et `echelleTemplateActuelle`
// sont des variables de MODULE : `chargerScript` les passe en PARAMÈTRES de la
// fonction sandbox, donc une réassignation interne (`grilleTemplateActuelle = null`)
// est invisible depuis le test, et un `win.grilleTemplateActuelle = {...}` posé par
// le test n'atteint jamais le code. Une assertion `expect(win.grilleTemplateActuelle)
// .toBeNull()` est donc VIDE : elle passe sur `undefined` sans que rien n'ait été
// vérifié — trois faux rouges et un faux vert dans la première version de ce
// fichier. Le pointeur ne se teste que par son EFFET : en mode édition le save
// réécrit la grille pointée, en mode création il en ajoute une. C'est ce que font
// A.b, B.b et C.b, et c'est pour cela qu'ils passent par `chargerGrilleTemplate` /
// `chargerEchellePourModif` au lieu de poser l'état à la main.

/* ------------------------------------------------------------------ harnais */

/** Un DOM minimal mais PERSISTANT : chaque id rend toujours le même objet. */
function faireDom() {
    const elements = {};
    const element = (id) => {
        if (!elements[id]) {
            elements[id] = {
                id, value: '', innerHTML: '', textContent: '', style: {},
                classList: { add() {}, remove() {}, contains: () => false },
                scrollIntoView() {}, focus() {}, click() {}
            };
        }
        return elements[id];
    };
    return { element };
}

function globauxCommuns(store, { element }) {
    return {
        db: {
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {},
        confirm: () => true,
        notifications: { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} },
        genererIdUnique: (p) => p + 'NEUF',
        obtenirIdentiteCCUtilisateur: () => 'test',
        // #1147 : les filtres rendent la liste (le menu la parcourt) ; le reste, du vide.
        BibliothequeUI: new Proxy({}, { get: (_, nom) => (String(nom).startsWith('filtrer') ? (l) => l : () => '') }),
        travauxOutils: { renderPickerCouleur: () => '' },
        document: {
            getElementById: element,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    };
}

/** Le vrai `grilles.js`, namespace de trimestre commutable (pour la bascule). */
function monterGrilles(store = {}) {
    const dom = faireDom();
    let trimestre = 'h2026';
    const globaux = {
        ...globauxCommuns(store, dom),
        cle: (k) => trimestre + '_' + k,
        grilleTemplateActuelle: null,
        critereEnEdition: null,
        calculerEtAfficherTotalPonderation: () => {},
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        ajouterContributeurSiNecessaire: (g) => g
    };
    const win = chargerScript('js/grilles.js', globaux);
    return { win, store, element: dom.element, basculer: (t) => { trimestre = t; } };
}

/** Le vrai `echelles.js`, monté sur `ui-blocs.js` comme le fait l'application. */
function monterEchelles(store = {}) {
    const dom = faireDom();
    const globaux = {
        ...globauxCommuns(store, dom),
        cle: (k) => 'a2026_' + k,
        echelleTemplateActuelle: null,
        prompt: (_q, d) => d || 'Copie',
        nommerCopie: (n) => n + ' (copie)',
        ordonnerNiveauxParPlage: (n) => n,
        zoneDuCodeDansNiveaux: () => null
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    win.travauxOutils = globaux.travauxOutils;
    chargerScript('js/echelles.js', globaux, win);
    return { win, store, element: dom.element };
}

const TROIS_CRITERES = () => ([
    { id: 'TEMP_CR_1', nom: 'Clarté du propos', type: 'holistique', ponderation: 40, description: '' },
    { id: 'TEMP_CR_2', nom: 'Structure', type: 'holistique', ponderation: 30, description: '' },
    { id: 'TEMP_CR_3', nom: 'Langue', type: 'holistique', ponderation: 30, description: '' }
]);

const GRILLE_EXISTANTE = () => ({
    id: 'G1', nom: 'Grille H2026',
    criteres: [{ id: 'CR_1', nom: 'Critère d\'origine', ponderation: 100 }]
});

const ECHELLE_EXISTANTE = () => ({
    id: 'E1', nom: 'Échelle A2026',
    niveaux: [{ code: 'A', nom: 'Atteint', min: 0, max: 100, valeurCalcul: 50 }]
});

const DEUX_NIVEAUX = () => ([
    { code: 'W', nom: 'Amorce', min: 0, max: 59, valeurCalcul: 30, couleur: '#111111' },
    { code: 'Z', nom: 'Transféré', min: 60, max: 100, valeurCalcul: 80, couleur: '#444444' }
]);

/* ---------------------------------------- A — l'abandon d'une création de grille */

describe('#625 · A — « Retour à la vue d\'ensemble » ne laisse aucun critère fantôme', () => {

    it('A.a LE CAS QUI PORTE LE SENS : trois critères saisis, puis abandon → le tampon est vide', () => {
        const { win } = monterGrilles({ h2026_grillesTemplates: [] });
        win.tempCriteres = TROIS_CRITERES();

        win.retourVueHierarchique();

        // Avant #625 : les trois critères survivaient à l'abandon, et
        // repartaient dans la grille suivante créée par le chemin « select ».
        expect(win.tempCriteres || [], 'l\'abandon doit vider les critères temporaires').toEqual([]);
    });

    it('A.b l\'abandon purge AUSSI le pointeur d\'édition — les deux moitiés, pas une', async () => {
        const store = { h2026_grillesTemplates: [GRILLE_EXISTANTE()] };
        const { win, element } = monterGrilles(store);

        // Grégoire ouvre G1 en édition, puis abandonne, puis crée autre chose.
        await win.chargerGrilleTemplate('G1');
        win.retourVueHierarchique();
        win.tempCriteres = TROIS_CRITERES();
        element('nomGrilleTemplate').value = 'Grille neuve';
        await win.sauvegarderGrilleTemplate();

        // La moitié qui marchait déjà (#466/CO-16) : on la verrouille par son
        // EFFET, seule chose observable. Pointeur vidé ⇒ le save AJOUTE ;
        // pointeur survivant ⇒ il aurait réécrit G1 sous le nom « Grille neuve ».
        expect(store.h2026_grillesTemplates).toHaveLength(2);
        expect(store.h2026_grillesTemplates[0].nom, 'G1 ne doit pas avoir été réécrite')
            .toBe('Grille H2026');
    });

    it('A.c le patron existait déjà à côté : `annulerFormEchelle` vide bien les siens', () => {
        const { win } = monterEchelles({ a2026_echellesTemplates: [] });
        win._niveauxNouvelleEchelle = DEUX_NIVEAUX();
        win._reperesNouvelleEchelle = { seuilMaitrise: 'Z' };

        win.annulerFormEchelle();

        // Ce cas est VERT avant comme après le correctif : c'est le témoin qui
        // distingue « le banc voit les tampons » de « le banc ne voit rien ».
        expect(win._niveauxNouvelleEchelle).toBeNull();
        expect(win._reperesNouvelleEchelle).toBeNull();
    });
});

/* -------------------------------------------- B et C — les deux resets de bascule */

describe('#625 · B — la bascule de trimestre vide le tampon de critères', () => {

    it('B.a `reinitialiserEditeurGrillesApresBascule` vide `tempCriteres`', () => {
        const { win } = monterGrilles({ h2026_grillesTemplates: [] });
        win.tempCriteres = TROIS_CRITERES();

        win.reinitialiserEditeurGrillesApresBascule();

        expect(win.tempCriteres || [], 'la bascule doit vider les critères temporaires').toEqual([]);
    });

    it('B.b et elle continue de vider le pointeur — #466/CO-16 n\'est pas défait', async () => {
        const store = { h2026_grillesTemplates: [GRILLE_EXISTANTE()], a2026_grillesTemplates: [] };
        const { win, element, basculer } = monterGrilles(store);

        // G1 ouverte en édition sous H2026, puis bascule sur A2026.
        await win.chargerGrilleTemplate('G1');
        basculer('a2026');
        win.reinitialiserEditeurGrillesApresBascule();

        // Les critères sont saisis APRÈS le reset : ce test isole le pointeur.
        win.tempCriteres = TROIS_CRITERES();
        element('nomGrilleTemplate').value = 'Grille A2026';
        await win.sauvegarderGrilleTemplate();

        // Pointeur survivant ⇒ mode édition ⇒ `findIndex` échoue dans A2026 ⇒
        // `horsTrimestreActif` ⇒ AUCUNE écriture. La longueur 1 est le témoin.
        expect(store.a2026_grillesTemplates, 'la grille neuve doit atteindre A2026').toHaveLength(1);
        expect(store.a2026_grillesTemplates[0].nom).toBe('Grille A2026');
        expect(store.h2026_grillesTemplates[0].nom, 'et G1 reste intacte dans H2026')
            .toBe('Grille H2026');
    });
});

describe('#625 · C — la bascule de trimestre vide les tampons d\'échelle', () => {

    it('C.a `reinitialiserEditeurEchellesApresBascule` vide niveaux ET repères', () => {
        const { win } = monterEchelles({ a2026_echellesTemplates: [] });
        win._niveauxNouvelleEchelle = DEUX_NIVEAUX();
        win._reperesNouvelleEchelle = { seuilMaitrise: 'Z' };

        win.reinitialiserEditeurEchellesApresBascule();

        // Les DEUX tampons : les repères sans leurs niveaux sont tout aussi
        // fantômes, et #555 lot 2 (e) a établi qu'ils vont par paire.
        expect(win._niveauxNouvelleEchelle ?? null, 'les niveaux temporaires').toBeNull();
        expect(win._reperesNouvelleEchelle ?? null, 'les repères qui vont avec').toBeNull();
    });

    it('C.b et elle continue de vider le pointeur — #466/CO-16 n\'est pas défait', async () => {
        const store = { a2026_echellesTemplates: [ECHELLE_EXISTANTE()] };
        const { win, element } = monterEchelles(store);

        // E1 ouverte en édition, puis reset de bascule.
        await win.chargerEchellePourModif('E1');
        win.reinitialiserEditeurEchellesApresBascule();

        // Les niveaux sont saisis APRÈS le reset : ce test isole le pointeur.
        win._niveauxNouvelleEchelle = DEUX_NIVEAUX();
        win._reperesNouvelleEchelle = {};
        element('nomEchelleTemplate').value = 'Échelle neuve';
        await win.sauvegarderEchelleComplete();

        // Pointeur vidé ⇒ branche création ⇒ une SECONDE échelle ; pointeur
        // survivant ⇒ E1 aurait été réécrite sous le nom « Échelle neuve ».
        expect(store.a2026_echellesTemplates).toHaveLength(2);
        expect(store.a2026_echellesTemplates[0].nom, 'E1 ne doit pas avoir été réécrite')
            .toBe('Échelle A2026');
    });
});

/* ------------- E — T7.3 : la porte « select », présumée morte mais inoffensive */

describe('#625 · E — la porte d\'entrée « select » repart de zéro si jamais on l\'atteint', () => {

    it('E.a entrer en création par `chargerGrilleTemplate()` ne ressuscite aucun résidu', async () => {
        const { win } = monterGrilles({ h2026_grillesTemplates: [] });

        // Un tampon plein, et l'entrée en création par la porte « select »
        // (aucun id, `select.value` vide) — le seul chemin qui PRÉSERVAIT le
        // résidu avant #625, par un `window.tempCriteres = window.tempCriteres || []`.
        win.tempCriteres = TROIS_CRITERES();
        await win.chargerGrilleTemplate();

        expect(win.tempCriteres, 'une porte d\'ENTRÉE en création remet à zéro').toEqual([]);
    });

    it('E.b et elle n\'abîme pas le mode ÉDITION — le témoin qui borne E.a', async () => {
        const store = { h2026_grillesTemplates: [GRILLE_EXISTANTE()] };
        const { win } = monterGrilles(store);

        // Avec un id, on n'entre PAS dans la branche création : la grille
        // existante se charge, et ses critères ne sont pas balayés.
        await win.chargerGrilleTemplate('G1');

        expect(store.h2026_grillesTemplates[0].criteres).toHaveLength(1);
        expect(store.h2026_grillesTemplates[0].criteres[0].nom).toBe('Critère d\'origine');
    });
});

/* ------------------- D — la conséquence, et elle ne se lit que sur les données */

describe('#625 · D — après bascule, aucun critère de l\'ancien trimestre n\'atteint le nouveau', () => {

    it('D.a LE CAS QUI PORTE LE SENS : créer une grille après bascule ne réécrit pas les critères de H2026', async () => {
        const store = { h2026_grillesTemplates: [], a2026_grillesTemplates: [] };
        const { win, element, basculer } = monterGrilles(store);

        // 1. Grégoire saisit trois critères dans une grille NEUVE, sous H2026.
        win.tempCriteres = TROIS_CRITERES();

        // 2. Il bascule sur A2026. L'application appelle le reset d'éditeur.
        basculer('a2026');
        win.reinitialiserEditeurGrillesApresBascule();

        // 3. Sous A2026, il crée une grille et l'enregistre.
        element('nomGrilleTemplate').value = 'Grille A2026';
        await win.sauvegarderGrilleTemplate();

        // Avant #625 : `grilleTemplateActuelle` était nul (le reset a fait sa
        // moitié) mais `tempCriteres` ne l'était pas — la branche création
        // écrivait `criteres: window.tempCriteres` dans le namespace A2026.
        const ecrite = store.a2026_grillesTemplates[0];
        expect(ecrite, 'la grille doit bien avoir été écrite sous A2026').toBeTruthy();
        expect(ecrite.nom).toBe('Grille A2026');
        expect(ecrite.criteres, 'aucun critère de H2026 ne doit traverser la bascule').toEqual([]);
        expect(store.h2026_grillesTemplates, 'et H2026 ne reçoit rien non plus').toEqual([]);
    });

    it('D.b le banc VOIT bien passer des critères quand il y en a — sinon D.a ne prouverait rien', async () => {
        const store = { h2026_grillesTemplates: [] };
        const { win, element } = monterGrilles(store);

        // Même chemin, SANS bascule : les critères saisis doivent, eux, être écrits.
        win.tempCriteres = TROIS_CRITERES();
        element('nomGrilleTemplate').value = 'Grille H2026';
        await win.sauvegarderGrilleTemplate();

        const ecrite = store.h2026_grillesTemplates[0];
        expect(ecrite.criteres.map((c) => c.nom))
            .toEqual(['Clarté du propos', 'Structure', 'Langue']);
    });
});

/* ------------------------------- F — rider M11 : un export, pas deux */

describe('#625 / M11 — `marquerChampRefuseEchelle` n\'est exporté qu\'UNE fois', () => {

    // Ce cas-ci lit la SOURCE, pas le comportement : deux `window.X = X` sont
    // indiscernables à l'exécution quand ils désignent la même fonction — le
    // second gagne, en silence, et rend le même objet. Seule la source le voit.
    // ⚠ Deux précautions, apprises ailleurs dans ce dépôt :
    //   · on ANCRE sur `^\s*window\.` au lieu de chercher le nom n'importe où —
    //     sinon le commentaire qui documente ce retrait, dans `echelles.js`,
    //     compterait comme une occurrence et le test mentirait dans le sens
    //     rassurant du « toujours rouge » ;
    //   · on retire quand même les lignes de commentaire d'abord, pour que la
    //     règle reste vraie si quelqu'un réindente ou déplace le bloc.
    const lignesDeCode = () => readFileSync(path.join(racineProjet, 'js/echelles.js'), 'utf8')
        .split('\n')
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l));

    it('F.a un seul export subsiste (il y en avait deux : #524 et #577)', () => {
        const exports = lignesDeCode()
            .filter((l) => /^\s*window\.marquerChampRefuseEchelle\s*=/.test(l));
        expect(exports).toHaveLength(1);
    });

    it('F.b et la fonction exportée existe toujours — le doublon retiré, pas la définition', () => {
        const definitions = lignesDeCode()
            .filter((l) => /function\s+marquerChampRefuseEchelle\s*\(/.test(l));
        expect(definitions, 'le retrait du doublon ne doit pas emporter la fonction')
            .toHaveLength(1);
    });

    it('F.c le commentaire orphelin est rendu à `ecrireRepereEchelle` — pas jeté', () => {
        // La ligne retirée portait, concaténé après un long blanc, le commentaire
        // d'une AUTRE fonction, vivante et jusque-là non documentée à cet endroit.
        const ligne = lignesDeCode()
            .find((l) => /^\s*window\.ecrireRepereEchelle\s*=/.test(l));
        expect(ligne, 'l\'export doit toujours exister').toBeTruthy();
        expect(ligne).toMatch(/#577/);
    });
});
