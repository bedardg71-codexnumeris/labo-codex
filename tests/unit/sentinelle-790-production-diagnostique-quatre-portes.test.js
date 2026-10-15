/**
 * SENTINELLE #790 — LA PRODUCTION DIAGNOSTIQUE NE FRANCHIT AUCUNE DES QUATRE PORTES.
 *
 * ── D'OÙ VIENT CE BANC ─────────────────────────────────────────────────────────────────────────────
 * Grégoire fait écrire un texte en première semaine et le corrige sur une seule dimension, pour repérer
 * qui soutenir. Ses mots (7 septembre 2026) : « Comme un seul critère a été évalué, ce résultat ne peut
 * pas entrer dans le calcul de la note finale. » Le cas est disciplinaire ; le besoin ne l'est pas — un
 * enseignant de chimie fait la même chose sur son propre critère. Rien ici ne nomme une discipline.
 *
 * ── POURQUOI QUATRE PORTES ET PAS UNE ──────────────────────────────────────────────────────────────
 * Elles ne sont pas quatre variantes d'une même exclusion : chacune mène au palier RàI par un chemin
 * différent, et il suffit d'en oublier UNE pour que les trois autres ne servent à rien. La quatrième
 * est le piège — `depistagePeutJugerLaNonParticipation` juge « Non-participation → niveau 3 » dès qu'un
 * travail est dû ET qu'une copie est évaluée, deux conditions que la production diagnostique remplit à
 * elle seule en première semaine. Un élève arrivé en retard pour une raison d'horaire basculerait en
 * palier intensif par cette porte-là, l'exclusion de la note et de la complétion n'y changeant rien.
 *
 * ── CE QUI DOIT RESTER VRAI, ET QUI EST AUSSI GARDÉ ICI ────────────────────────────────────────────
 * La production diagnostique reste ENTIÈRE : on lui retire son poids, pas son existence. Le témoin de
 * chaque porte le vérifie à l'envers — décoché, le même travail compte partout. Sans ces témoins, un
 * filtre trop large (« plus rien ne compte ») laisserait toutes les attentes vertes.
 *
 * ── COMMENT LE FAIRE ROUGIR ────────────────────────────────────────────────────────────────────────
 * Retirer le filtre de `window.ProductionDiagnostique` d'un seul des sites câblés : la porte
 * correspondante rougit, les autres restent vertes. C'est le break-test de ce lot.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const MODULE = 'js/entites/production-diagnostique.js';

/** Le module pur, seul, sans bac : il ne lit aucun stockage. */
function moduleSeul() {
    return chargerScript(MODULE).ProductionDiagnostique;
}

/**
 * Un store où DEUX productions sont dues et évaluées : le texte diagnostique (`P_DIAG`)
 * et un travail ordinaire (`P_NORM`). Le second est le témoin de tout ce banc — s'il
 * disparaissait des calculs lui aussi, le filtre serait trop large.
 */
function storeDeuxTravaux({ diagnostique = true, avecTravailOrdinaire = true } = {}) {
    const store = storeBase();
    store.test_productions = [
        { id: 'P_DIAG', titre: 'Texte de départ', type: 'travail', ponderation: 10,
          dateEcheance: '2026-09-01', coursId: 'GC1', diagnostique: diagnostique },
        ...(avecTravailOrdinaire ? [{ id: 'P_NORM', titre: 'Analyse 1', type: 'travail', ponderation: 20,
          dateEcheance: '2026-09-02', coursId: 'GC1' }] : [])
    ];
    store.test_evaluationsSauvegardees = [
        { id: 'E_DIAG', productionId: 'P_DIAG', etudiantDA: '2000001', noteFinale: 40, coursId: 'GC1' },
        ...(avecTravailOrdinaire ? [{ id: 'E_NORM', productionId: 'P_NORM', etudiantDA: '2000001', noteFinale: 80, coursId: 'GC1' }] : [])
    ];
    return store;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 · le module pur — le seul endroit qui décide de ce qu\'est une production diagnostique', () => {
    it('un champ ABSENT vaut « non » : le trimestre entier ne disparaît pas des calculs', () => {
        const m = moduleSeul();
        // C'est l'invariant le plus important du module : le champ est NEUF, donc absent de toutes
        // les productions déjà enregistrées. Un défaut à `true` les sortirait toutes d'un coup.
        expect(m.estDiagnostique({ id: 'X' })).toBe(false);
        expect(m.estDiagnostique(null)).toBe(false);
        expect(m.estDiagnostique(undefined)).toBe(false);
    });

    it('seul le booléen `true` compte — ni « true », ni 1, ni un objet', () => {
        const m = moduleSeul();
        expect(m.estDiagnostique({ diagnostique: true })).toBe(true);
        expect(m.estDiagnostique({ diagnostique: 'true' })).toBe(false);
        expect(m.estDiagnostique({ diagnostique: 1 })).toBe(false);
        expect(m.estDiagnostique({ diagnostique: false })).toBe(false);
    });

    it('filtrer ne modifie jamais la liste reçue', () => {
        const m = moduleSeul();
        const source = [{ id: 'A', diagnostique: true }, { id: 'B' }];
        const filtre = m.filtrerProductions(source);
        expect(filtre.map((p) => p.id)).toEqual(['B']);
        expect(source).toHaveLength(2);           // l'entrée est intacte
    });

    it('une évaluation SANS productionId est CONSERVÉE — le doute ne fait rien disparaître', () => {
        const m = moduleSeul();
        const productions = [{ id: 'P_DIAG', diagnostique: true }];
        const evals = [
            { id: 'E1', productionId: 'P_DIAG' },
            { id: 'E2', productionId: 'P_AUTRE' },
            { id: 'E3' }                            // orpheline : impossible de la rattacher
        ];
        // Écarter dans le doute retirerait de la note des copies qui doivent y rester.
        expect(m.filtrerEvaluations(evals, productions).map((e) => e.id)).toEqual(['E2', 'E3']);
    });

    it('aucune production diagnostique : la liste d\'évaluations revient telle quelle', () => {
        const m = moduleSeul();
        const evals = [{ id: 'E1', productionId: 'P1' }, { id: 'E2', productionId: 'P2' }];
        expect(m.filtrerEvaluations(evals, [{ id: 'P1' }, { id: 'P2' }])).toHaveLength(2);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 · PORTE 2 — la fenêtre des patterns (obtenirIdsProductionsEvaluables)', () => {
    function idsEvaluables(productions, typePratique) {
        const win = chargerScript(MODULE);
        chargerScript('js/profil-etudiant-helpers.js', {
            obtenirTypePratiqueActive: () => typePratique,
            chargerSeuilsInterpretation: () => ({ nombreProductionsAnalyse: 3 })
        }, win);
        return win.obtenirIdsProductionsEvaluables(productions);
    }

    const PRODUCTIONS_SOM = [
        { id: 'P_DIAG', type: 'travail', diagnostique: true },
        { id: 'P_NORM', type: 'travail' },
        { id: 'P_CONTENEUR', type: 'portfolio' }
    ];
    const PRODUCTIONS_PAN = [
        { id: 'A_DIAG', type: 'artefact-portfolio', diagnostique: true },
        { id: 'A_NORM', type: 'artefact-portfolio' }
    ];

    it('SOMMATIVE — la production diagnostique sort, le travail ordinaire reste', () => {
        expect(idsEvaluables(PRODUCTIONS_SOM, 'sommative')).toEqual(['P_NORM']);
    });

    it('PAN/STANDARDS — l\'artefact diagnostique sort aussi (le filtre précède la bifurcation)', () => {
        // Le filtre est posé AVANT le tri PAN/Sommative, exprès : une exclusion recopiée dans
        // chaque branche finirait par ne plus valoir que pour l'une des deux.
        expect(idsEvaluables(PRODUCTIONS_PAN, 'standards')).toEqual(['A_NORM']);
    });

    it('TÉMOIN — décochée, la même production revient dans la fenêtre', () => {
        const sansMarqueur = PRODUCTIONS_SOM.map((p) => ({ ...p, diagnostique: false }));
        expect(idsEvaluables(sansMarqueur, 'sommative')).toEqual(['P_DIAG', 'P_NORM']);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 · PORTE 4 — le jugement de non-participation, celui qui annule les trois autres', () => {
    function verdict(store) {
        const b = monter(store, {
            modules: [MODULE, 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js'],
            aujourdhui: '2026-09-08'
        });
        return b.win.depistagePeutJugerLaNonParticipation();
    }

    it('SEULE une production diagnostique est due et corrigée → le verdict se TAIT', () => {
        // Le cas de la première semaine, exactement. Sans cette porte, un élève arrivé en retard
        // pour une raison d'horaire passerait « Non-participation → niveau 3 ».
        const r = verdict(storeDeuxTravaux({ avecTravailOrdinaire: false }));
        expect(r.possible).toBe(false);
        expect(r.raison).toBe('aucun-travail-du');
    });

    it('LES DEUX CONDITIONS SE VALIDENT SÉPARÉMENT — un travail ordinaire dû mais NON corrigé ne suffit pas', () => {
        // Le piège du filtre posé d'un seul côté : ici `travailDu` est vrai grâce à P_NORM, et la
        // seule copie corrigée est celle du diagnostique. Filtrer les productions sans filtrer les
        // évaluations laisserait passer le verdict.
        const store = storeDeuxTravaux();
        store.test_evaluationsSauvegardees = store.test_evaluationsSauvegardees.filter((e) => e.id !== 'E_NORM');
        const r = verdict(store);
        expect(r.possible).toBe(false);
        expect(r.raison).toBe('aucune-copie-evaluee');
    });

    it('TÉMOIN — un travail ordinaire dû ET corrigé : le verdict redevient possible', () => {
        expect(verdict(storeDeuxTravaux()).possible).toBe(true);
    });

    it('TÉMOIN INVERSE — décochée, la production diagnostique suffit à rouvrir le verdict', () => {
        // C'est la preuve que c'est bien le marqueur qui agit, et non un effet de bord du bac.
        const r = verdict(storeDeuxTravaux({ diagnostique: false, avecTravailOrdinaire: false }));
        expect(r.possible).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 · PORTES 1 ET 3 — la note, l\'indice P et la complétion, par les accesseurs des familles', () => {
    /**
     * Les trois familles lisent le stockage par deux accesseurs privés, et TOUS leurs appelants sont
     * des calculs. Le filtre y est donc posé une fois pour toutes plutôt que dans chaque `calculer*`.
     * Ce banc éprouve l'accesseur lui-même : c'est le point qu'un neuvième calcul écrit dans six mois
     * traverserait sans qu'on ait à y penser.
     */
    function instancier(fichier, classe, store) {
        const b = monter(store, { modules: [MODULE, { chemin: fichier, internes: [] }] });
        const Classe = b.win[classe];
        expect(typeof Classe, `${classe} doit être exportée`).toBe('function');
        const inst = Object.create(Classe.prototype);
        inst.config = { id: 'test', objectifs: [], tableBundles: [] };
        return inst;
    }

    const FAMILLES = [
        ['js/pratiques/pratique-sommative.js', 'PratiqueSommative'],
        ['js/pratiques/pratique-pan-standards.js', 'PratiquePANStandards'],
        ['js/pratiques/pratique-pan-specifications.js', 'PratiquePanSpecifications']
    ];

    FAMILLES.forEach(([fichier, classe]) => {
        it(`${classe} — ses deux accesseurs écartent la production diagnostique et sa copie`, () => {
            const inst = instancier(fichier, classe, storeDeuxTravaux());
            expect(inst._lireProductions().map((p) => p.id)).toEqual(['P_NORM']);
            expect(inst._lireEvaluations().map((e) => e.id)).toEqual(['E_NORM']);
        });

        it(`${classe} — TÉMOIN : décochée, les deux reviennent`, () => {
            const inst = instancier(fichier, classe, storeDeuxTravaux({ diagnostique: false }));
            expect(inst._lireProductions().map((p) => p.id)).toEqual(['P_DIAG', 'P_NORM']);
            expect(inst._lireEvaluations().map((e) => e.id)).toEqual(['E_DIAG', 'E_NORM']);
        });

        it(`${classe} — les productions BRUTES restent lisibles : sans elles, aucune copie ne se rattache`, () => {
            // `_lireProductionsBrutes` n'est pas un doublon oublié : c'est ce qui permet à
            // `_lireEvaluations` de savoir quelle copie appartient à une production diagnostique.
            // Si elle filtrait elle aussi, la production deviendrait introuvable et sa copie passerait.
            const inst = instancier(fichier, classe, storeDeuxTravaux());
            expect(inst._lireProductionsBrutes().map((p) => p.id)).toEqual(['P_DIAG', 'P_NORM']);
        });
    });

    it('PratiqueConfigurable — sa complétion ne compte NI la production diagnostique NI sa copie', () => {
        // Cette famille est la seule à lire le stockage en direct : sa performance délègue aux trois
        // autres (déjà filtrées) et la famille DEN ne lit aucune évaluation, sa note étant un jugement
        // saisi. Il n'y a donc que la complétion à fermer ici.
        const store = storeDeuxTravaux();
        const b = monter(store, { modules: [MODULE, 'js/pratiques/pratique-configurable.js'] });
        const Classe = b.win.PratiqueConfigurable;
        expect(typeof Classe).toBe('function');
        const inst = Object.create(Classe.prototype);
        inst.config = { id: 'test', famille: 'sommative' };

        // L'élève 2000001 a remis les DEUX travaux ; 2000002 n'a remis que le diagnostique.
        store.test_evaluationsSauvegardees.push(
            { id: 'E_DIAG_2', productionId: 'P_DIAG', etudiantDA: '2000002', noteFinale: 30, coursId: 'GC1' }
        );
        // Une seule production compte : celui qui n'a remis que le diagnostique est à 0 sur 1,
        // et non à 1 sur 2 — la remise du diagnostique ne lui vaut aucun crédit.
        expect(inst.calculerCompletion('2000001')).toBeGreaterThan(inst.calculerCompletion('2000002'));
        expect(inst.calculerCompletion('2000002')).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 · le formulaire — cocher, rouvrir, et ne jamais décocher par inadvertance', () => {
    /**
     * ⚠ C'EST LE MOTIF DE #785, CORRIGÉ CE MATIN SUR LES PRÉSENCES, ET IL SE REJOUE ICI.
     * `construireProductionData` fusionne par spread : un champ posé à `false` par un formulaire qui
     * n'a rien lu ÉCRASE le `true` enregistré. Le marqueur doit donc distinguer « décoché » de
     * « pas de case à l'écran », et ne rien poser dans le second cas.
     */
    function chargerProductions(elements) {
        const store = storeBase();
        // `lireDonneesFormulaireProduction` est INTERNE à productions.js, et le reste : le bac
        // l'expose par `chargerAvecInterne` plutôt que d'élargir la surface publique du module
        // pour les besoins d'un banc.
        const b = monter(store, {
            modules: [MODULE, { chemin: 'js/productions.js', internes: ['lireDonneesFormulaireProduction'] }],
            elements
        });
        b.lireFormulaire = () => b.win.__audit['productions.js'].lireDonneesFormulaireProduction();
        return b;
    }

    it('la case cochée pose `diagnostique: true`', () => {
        const b = chargerProductions({});
        b.document.getElementById('productionDiagnostique').checked = true;
        const d = b.lireFormulaire();
        expect(d.diagnostique).toBe(true);
        expect(b.win.construireProductionData(d, [], 'P_EXISTANTE').diagnostique).toBe(true);
    });

    it('la case DÉCOCHÉE pose bien `false` — on doit pouvoir revenir en arrière', () => {
        const b = chargerProductions({});
        b.document.getElementById('productionDiagnostique').checked = false;
        const d = b.lireFormulaire();
        expect(d.diagnostique).toBe(false);
        expect(b.win.construireProductionData(d, [], 'P_EXISTANTE').diagnostique).toBe(false);
    });

    it('⛔ AUCUNE CASE À L\'ÉCRAN : le champ n\'est PAS posé, donc le spread n\'écrase rien', () => {
        // Le cas qui détruit des données ailleurs : un formulaire partiel qui affirme « false ».
        const donneesSansCase = { titre: 'X', type: 'travail', diagnostique: null };
        const b = chargerProductions({});
        const construite = b.win.construireProductionData(donneesSansCase, [], 'P_EXISTANTE');
        expect('diagnostique' in construite).toBe(false);
    });

    it('le marqueur se pose AUSSI en modification — c\'est tout le cas d\'usage', () => {
        // `verrouille`, `dansBibliotheque` et `coursId` ne se posent qu'à la création (bug #346).
        // Celui-ci est l'inverse : l'enseignant coche la case sur un travail déjà produit et corrigé.
        const b = chargerProductions({});
        b.document.getElementById('productionDiagnostique').checked = true;
        const d = b.lireFormulaire();
        const enModification = b.win.construireProductionData(d, [], 'P_DEJA_EVALUEE');
        const aLaCreation = b.win.construireProductionData(d, [], null);
        expect(enModification.diagnostique).toBe(true);
        expect(aLaCreation.diagnostique).toBe(true);
        // Et la garde de #346 tient toujours : les champs d'état, eux, restent hors modification.
        expect('verrouille' in enModification).toBe(false);
        expect(aLaCreation.dansBibliotheque).toBe(true);   // #489 : `verrouille` n'est plus posé, même à la création
    });
});
