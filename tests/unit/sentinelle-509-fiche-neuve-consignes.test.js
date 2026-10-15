import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle #509 (25 août 2026) — « + NOUVELLE PRODUCTION » PART VRAIMENT À NEUF.
//
// Le fil : l'audit du 25 août a trouvé, sur la zone des consignes, le défaut
// déjà corrigé pour les échéances par groupe (#468/CO-17). Deux chemins mènent
// à une fiche vierge, et un seul appelait le peuplement :
//
//   reinitialiserFormulaireProduction (productions.js) → peuplement appelé
//   creerNouvelleProduction          (productions-liste.js) → il ne l'était pas
//
// Ce que ça donnait à l'écran, et qui est reproduit ici :
//   AA — premier geste d'une session : AUCUN bloc rendu, donc rien à saisir,
//        et un enregistrement muet de chaînes vides.
//   AB — après l'édition d'une production A : ses champs personnalisés et ses
//        titres réécrits restaient affichés dans la fiche « neuve », et
//        s'enregistraient dans la NOUVELLE production.
//   AC — la couture : les deux chemins de remise à neuf doivent vider la même
//        zone. Un troisième chemin qui l'oublierait rouvrirait le même trou.

/* ------------------------------------------------------------------ harnais */

/** Le conteneur des blocs : il REÇOIT du HTML, on le relit tel quel. */
function conteneurBlocs() {
    return {
        id: 'champsPersonnalisesListe',
        innerHTML: '',
        querySelectorAll: () => [],
        querySelector: () => null
    };
}

/** Un champ de formulaire ordinaire, dont on veut seulement lire la valeur. */
function champ() {
    return {
        value: '', textContent: '', innerHTML: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        setAttribute() {}, getAttribute: () => null, addEventListener() {},
        querySelectorAll: () => [], querySelector: () => null, style: {},
        closest: () => null   // #1055 : `gererChangementTypeProduction` le demande (remise à neuf commune)
    };
}

function charger() {
    const els = {};
    // Les ids que `creerNouvelleProduction` touche SANS garde : leur absence
    // ferait échouer le test pour une raison qui n'est pas la sienne.
    ['productionActivite', 'productionTitre', 'productionType', 'productionPonderation',
     'productionGrille', 'btnTexteEvaluation', 'accueilProductions', 'formulaireProduction',
     'btnDupliquerProduction', 'btnSupprimerProduction', 'panneauMetadonneesProduction',
     'champsPortfolio', 'productionDateEcheance', 'productionContexte',
     'checkboxesPratiquesProduction'].forEach(id => { els[id] = champ(); });
    els['champsPersonnalisesListe'] = conteneurBlocs();

    const globaux = {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null),
              set: async () => {}, setSync: () => {} },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [], genererCheckboxesPratiques: () => '' },
        alert: () => {},
        genererIdUnique: (p) => p + '1',
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [],
            createElement: () => champ(), addEventListener() {}
        }
    };

    // #504 — `ui-blocs.js` d'abord : le rendu des blocs appelle ses helpers.
    const win = chargerScript('js/ui-blocs.js', globaux);
    // #1055 : « + Nouvelle production » passe par `reinitialiserFormulaireProduction`, qui vit
    // dans productions.js et y remet `productionEnEdition` (un global de config.js) à null.
    chargerScript('js/productions.js', { ...globaux, productionEnEdition: null }, win);

    // ⚠ `productions-liste.js` est une IIFE : ce qu'il appelle hors de son
    // corps se résout dans le scope global du sandbox, et le sandbox de
    // `chargerScript` ne passe QUE des paramètres nommés. Il faut donc lui
    // remettre en main les fonctions de `productions.js` — dont celle que
    // cette sentinelle surveille. Sans ce passage, `typeof peuplerBlocsConsignes`
    // vaudrait 'undefined' et la garde sauterait sans un mot : la sentinelle
    // serait aveugle, et le break-test resterait vert.
    chargerScript('js/productions-liste.js', {
        ...globaux,
        peuplerBlocsConsignes: win.peuplerBlocsConsignes,
        poserValeurChampGabarit: win.poserValeurChampGabarit,
        peuplerEcheancesParGroupe: win.peuplerEcheancesParGroupe,
        productionEnEdition: null,
        // Hors périmètre de cette sentinelle : le type de production et le
        // chargement différé des grilles ont leurs propres tests.
        gererChangementTypeProduction: () => {},
        chargerGrillesDisponiblesPourProduction: async () => {},
        setTimeout: () => 0
    }, win);

    return { win, els };
}

const PRODUCTION_A = {
    id: 'PROD_A',
    // ⚠ Témoin DISTINCTIF : « Reconnaître le propos du texte » est le
    // placeholder du bloc objectif, et l'assertion aurait échoué pour une
    // raison qui n'est pas la sienne (même piège qu'en AA.c de la #499).
    objectif: 'OBJECTIF-DE-A',
    titresBlocs: { objectif: 'Objectif custom A' },
    champsPersonnalises: [{ id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' }]
};

/* --------------------------------------- AA — la fiche neuve a ses trois blocs */

describe('#509 · AA — au premier geste, la fiche neuve est saisissable', () => {
    it('AA.a les trois blocs ancrés sont rendus, même sans production ouverte avant', () => {
        const { win, els } = charger();
        expect(els['champsPersonnalisesListe'].innerHTML, 'la zone part vide').toBe('');

        win.creerNouvelleProduction();

        const rendu = els['champsPersonnalisesListe'].innerHTML;
        // Les trois champs que 53 sites lisent par identifiant : sans eux, la
        // fiche n'est pas allégée, elle est inutilisable.
        expect(rendu).toContain('id="productionObjectif"');
        expect(rendu).toContain('id="productionTache"');
        expect(rendu).toContain('id="productionDetailTache"');
    });
});

/* ------------------------------- AB — LE CAS QUI PORTE LE SENS : plus d'héritage */

describe('#509 · AB — la fiche neuve n\'hérite pas de la production précédente', () => {
    it('AB.a ni les champs personnalisés, ni les titres réécrits ne survivent', () => {
        const { win, els } = charger();

        // L'écran tel qu'il est APRÈS l'édition de la production A.
        win.peuplerBlocsConsignes(PRODUCTION_A);
        const avant = els['champsPersonnalisesListe'].innerHTML;
        expect(avant, 'témoin : A est bien à l\'écran').toContain('Remise du travail');
        expect(avant).toContain('Objectif custom A');

        win.creerNouvelleProduction();

        const rendu = els['champsPersonnalisesListe'].innerHTML;
        expect(rendu, 'le champ libre de A ne suit pas').not.toContain('Remise du travail');
        expect(rendu, 'ni ce qui y était tapé').not.toContain('Sur Léa uniquement');
        expect(rendu, 'ni le titre que A avait réécrit').not.toContain('Objectif custom A');
        // Et le titre d'origine est revenu : la zone est remise à neuf, pas vidée.
        expect(rendu, 'le bloc ancré retrouve son titre par défaut').toContain('Objectif d\'apprentissage');
    });

    it('AB.b le contenu des blocs ancrés de A ne reste pas non plus', () => {
        const { win, els } = charger();
        win.peuplerBlocsConsignes(PRODUCTION_A);
        expect(els['champsPersonnalisesListe'].innerHTML).toContain('OBJECTIF-DE-A');

        win.creerNouvelleProduction();

        expect(els['champsPersonnalisesListe'].innerHTML).not.toContain('OBJECTIF-DE-A');
    });
});

/* ------------------------------------------------- AC — la couture, en ratchet */

describe('#509 · AC — les deux chemins de remise à neuf vident la même zone', () => {
    const lire = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');
    // Le peuplement porte deux noms : `peuplerBlocsConsignes` (le vrai) et
    // `peuplerChampsPersonnalises` (compat, gardé le temps que les appels
    // s'alignent). Les deux comptent — c'est le même effet.
    const appellePeuplement = (corps) =>
        /peupler(BlocsConsignes|ChampsPersonnalises)\(null\)/.test(corps);

    it('AC.a « + Nouvelle production » (productions-liste.js) passe par le réinitialiseur commun', () => {
        // #1055 (15 oct. 2026) : ce chemin n'a plus sa propre liste de champs ; il délègue
        // à `reinitialiserFormulaireProduction`, que AC.b vérifie. Une liste à lui rouvrirait
        // le défaut : elle a déjà oublié les consignes (#509), les échéances (#468) et la
        // case « Diagnostique » (#1055).
        const source = lire('productions-liste.js');
        const debut = source.indexOf('function creerNouvelleProduction()');
        expect(debut).toBeGreaterThan(-1);
        const corps = source.slice(debut, source.indexOf('\nfunction ', debut + 10));
        expect(corps).toContain('window.reinitialiserFormulaireProduction()');
        expect(corps, 'une liste de champs propre à ce chemin est revenue').not.toMatch(/getElementById\('production(Titre|Activite|Type|Ponderation)'\)\.value = ''/);
    });

    it('AC.b le réinitialiseur commun (productions.js) l\'appelle aussi', () => {
        const source = lire('productions.js');
        const debut = source.indexOf('function reinitialiserFormulaireProduction()');
        expect(debut).toBeGreaterThan(-1);
        const corps = source.slice(debut, source.indexOf('\nfunction ', debut + 10));
        expect(appellePeuplement(corps)).toBe(true);
    });
});
