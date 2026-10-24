import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #605 (30 août 2026) — « FICHIER SOUS … » NE PARLE QUE DE CE QUE LE
// TABLEAU NE MONTRE PAS.
//
// Relevé sur les données réelles de Grégoire, capture à l'appui, au retour de
// l'import du 30 août : un élève ayant remis 1 travail sur 11 récoltait DIX
// avertissements « Fichier sous Portrait de lecteur - lectrice », un sur chaque
// production encore à venir. Un élève n'ayant rien remis n'en avait aucun. La
// lecture spontanée est celle qu'il en a faite : « les travaux non remis
// semblent associés à celui que je viens d'importer ».
//
// MESURÉ AU CODE, trois faits qui se composent :
//   · le tableau pose une ligne par (élève × production), en écartant le
//     portfolio — `construireLignesEvaluations` ;
//   · le message se déclenchait dès qu'il existait UN fichier de cet élève sur
//     n'importe quelle production connue ≠ celle de la ligne, sans autre
//     condition ;
//   · la liste des productions « connues » comprend TOUTES les productions,
//     portfolios inclus.
//
// ⮕ Toute production non-portfolio a donc SA PROPRE LIGNE. Un fichier posé là y
// est déjà affiché, à sa place, avec son statut. Le répéter sur les N−1 autres
// lignes du même élève ne distingue pas le fichier MAL classé du fichier BIEN
// classé : les deux produisaient exactement le même signal. Un avertissement
// incapable de séparer les deux cas qu'il prétend arbitrer n'avertit de rien.
//
// La correction ne resserre pas un seuil : elle rattache le message à la seule
// condition qui le rend informatif — le fichier n'a AUCUNE ligne à lui. Les
// deux lecteurs de cette règle (le tableau, le message) lisent désormais la
// MÊME fonction, `productionGenereUneLigne`. C'est ce couplage que ce banc
// verrouille : une règle dupliquée redériverait en silence.

const PROD_PORTRAIT = { id: 'p_portrait', titre: 'Portrait de lecteur - lectrice', type: 'artefact' };
const PROD_ARTEFACTS = Array.from({ length: 10 }, (_, i) => ({
    id: 'p_art' + (i + 1),
    titre: 'Artefact ' + (i + 1),
    type: 'artefact'
}));
const PROD_PORTFOLIO = { id: 'p_folio', titre: 'Portfolio de fin de session', type: 'portfolio' };

const YANN = { da: '9000058', nom: 'Exemple', prenom: 'Yann', groupe: '00007' };
const LOU = { da: '9000200', nom: 'Postiche', prenom: 'Lou', groupe: '00007' };

function charger(fichiers, productions) {
    return chargerScript('js/liste-evaluations.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {}, removeSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (t) => (t == null ? '' : String(t)),
        obtenirLibelleStatut: (s) => 'Statut ' + s,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'productions' ? productions : []),
        obtenirNomCartouche: () => '-',
        obtenirNoteAffichee: () => '-',
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        travauxStockage: {
            obtenirFichiersTravaux: () => fichiers,
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirAnnotationFichier: () => null
        },
        travauxResolution: {
            trouverFichierPourEvaluation: ({ etudiantDA, productionId }) =>
                fichiers.find(f => f.etudiantDA === etudiantDA && f.productionId === productionId) || null
        },
        annotationContientDuContenu: () => false
    });
}

/**
 * Rejoue le vrai chemin : construire les lignes du tableau, puis calculer le
 * statut de chacune — c'est `calculerStatutWorkflow` qui pose le drapeau.
 */
function lignesAvecStatut(fichiers, productions, etudiants) {
    const win = charger(fichiers, productions);
    const lignes = win._construireLignesEvaluations([], productions, etudiants);
    lignes.forEach(l => { l.statutWorkflow = win._calculerStatutWorkflow(l); });
    return { win, lignes };
}

const avertissements = (lignes) => lignes.filter(l => l.fichierAutreProduction);

describe('#605 · le cas de Grégoire, reproduit', () => {
    const PRODUCTIONS = [PROD_PORTRAIT, ...PROD_ARTEFACTS];
    const FICHIER_PORTRAIT = { id: 'ft1', etudiantDA: YANN.da, productionId: PROD_PORTRAIT.id };

    it('un travail remis sur onze ne fabrique AUCUN avertissement', () => {
        const { lignes } = lignesAvecStatut([FICHIER_PORTRAIT], PRODUCTIONS, [YANN]);
        expect(lignes).toHaveLength(11);
        expect(avertissements(lignes)).toEqual([]);
    });

    it('le travail remis reste visible à sa place, avec son statut', () => {
        // Le point qui rend l'avertissement superflu : le fichier a sa ligne.
        const { lignes } = lignesAvecStatut([FICHIER_PORTRAIT], PRODUCTIONS, [YANN]);
        const sienne = lignes.find(l => l.productionId === PROD_PORTRAIT.id);
        expect(sienne.statutWorkflow).toBe('importe');
    });

    it('un élève sans aucun fichier n\'a rien non plus', () => {
        const { lignes } = lignesAvecStatut([FICHIER_PORTRAIT], PRODUCTIONS, [YANN, LOU]);
        const deLudovic = lignes.filter(l => l.da === LOU.da);
        expect(deLudovic).toHaveLength(11);
        expect(avertissements(deLudovic)).toEqual([]);
    });
});

describe('#605 · le message subsiste là où il est la seule trace du fichier', () => {
    const PRODUCTIONS = [PROD_PORTRAIT, ...PROD_ARTEFACTS, PROD_PORTFOLIO];

    it('un fichier posé sur un portfolio est signalé — le portfolio n\'a pas de ligne', () => {
        const fichiers = [{ id: 'ft2', etudiantDA: YANN.da, productionId: PROD_PORTFOLIO.id }];
        const { lignes } = lignesAvecStatut(fichiers, PRODUCTIONS, [YANN]);

        // Aucune ligne pour le portfolio lui-même : sans le message, ce fichier
        // n'apparaîtrait nulle part dans ce tableau.
        expect(lignes.some(l => l.productionId === PROD_PORTFOLIO.id)).toBe(false);
        const signalees = avertissements(lignes);
        expect(signalees.length).toBe(11);
        expect(signalees[0].fichierAutreProductionNom).toBe('Portfolio de fin de session');
    });

    it('le message nomme la production, il ne retombe pas sur un libellé générique', () => {
        const fichiers = [{ id: 'ft2', etudiantDA: YANN.da, productionId: PROD_PORTFOLIO.id }];
        const { lignes } = lignesAvecStatut(fichiers, PRODUCTIONS, [YANN]);
        expect(avertissements(lignes).every(l => l.fichierAutreProductionNom === 'Portfolio de fin de session')).toBe(true);
    });

    it('un fichier sur une production INCONNUE ne déclenche pas ce message', () => {
        // #346-cleanup : il est traité par la branche « non associé », pas ici.
        const fichiers = [{ id: 'ft3', etudiantDA: YANN.da, productionId: 'p_disparue' }];
        const { lignes } = lignesAvecStatut(fichiers, PRODUCTIONS, [YANN]);
        expect(avertissements(lignes)).toEqual([]);
    });
});

describe('#605 · les deux lecteurs de la règle restent d\'accord', () => {
    // Le couplage est le fond du correctif : si l'un des deux sites cessait de
    // lire `productionGenereUneLigne`, le message reparlerait de productions
    // parfaitement visibles — sans qu'aucun autre test ne s'en aperçoive.
    const PRODUCTIONS = [PROD_PORTRAIT, ...PROD_ARTEFACTS, PROD_PORTFOLIO];

    it('aucune production qui a sa ligne ne peut être citée par le message', () => {
        const fichiers = [
            { id: 'a', etudiantDA: YANN.da, productionId: PROD_PORTRAIT.id },
            { id: 'b', etudiantDA: LOU.da, productionId: PROD_ARTEFACTS[3].id }
        ];
        const { lignes } = lignesAvecStatut(fichiers, PRODUCTIONS, [YANN, LOU]);

        const titresAvecLigne = new Set(lignes.map(l => l.productionNom));
        for (const l of avertissements(lignes)) {
            expect(titresAvecLigne.has(l.fichierAutreProductionNom), l.fichierAutreProductionNom).toBe(false);
        }
    });

    it('la règle de génération des lignes est bien celle que le message consulte', () => {
        const { win, lignes } = lignesAvecStatut([], PRODUCTIONS, [YANN]);
        const idsAvecLigne = new Set(lignes.map(l => l.productionId));
        for (const p of PRODUCTIONS) {
            expect(win._productionGenereUneLigne(p), p.titre).toBe(idsAvecLigne.has(p.id));
        }
    });

    it('le portfolio n\'est pas exclu par son titre mais par son type', () => {
        // Un portfolio renommé reste sans ligne ; un artefact intitulé
        // « Portfolio … » en garde une.
        const win = charger([], PRODUCTIONS);
        expect(win._productionGenereUneLigne({ id: 'x', titre: 'Recueil', type: 'portfolio' })).toBe(false);
        expect(win._productionGenereUneLigne({ id: 'y', titre: 'Portfolio hebdomadaire', type: 'artefact' })).toBe(true);
    });
});
