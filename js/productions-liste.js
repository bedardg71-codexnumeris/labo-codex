/* ===============================
   LISTE DES PRODUCTIONS (MENU DE LA SÉLECTION + CRUD UTILISATEUR)
   ✅ EXTRACTION (16 mai 2026, refactor étape 3)

   Sous-module extrait de productions.js. Contient :
   - dupliquerEtEditerProduction (fork production démo)
   - afficherListeProductions (le menu de la sélection, #1147)
   - chargerProductionPourModif (choix dans le menu → formulaire)
   - creerNouvelleProduction (bouton + Nouvelle)
   - dupliquerProduction / dupliquerProductionActive (boutons Dupliquer)
   - supprimerProductionActive (bouton Supprimer)
   - importerProductionsExternes (consommé par reserve-ouvrir.js etc.)

   Plus aucun wrapper de délégation dans productions.js : fusionnés par #626 (31 août)
   et #633 (11 oct. 2026, annulerFormProduction).

   Dépendances (toutes via globales/window) :
   - getCleProductions (productions.js)
   - afficherFormProduction, annulerFormProduction, gererChangementTypeProduction,
     chargerGrillesDisponiblesPourProduction, afficherToutesLesProductionsParType,
     mettreAJourPonderationTotale, obtenirEcheancePlusTot (productions.js)
   - Helpers globaux : db, cle, echapperHtml, genererIdUnique, BibliothequeUI,
     GabaritsUtils, productionEnEdition (config.js)
   =============================== */

(function() {
'use strict';

/**
 * Phase 4.B : fork une production démo et charge la copie en édition.
 */
async function dupliquerEtEditerProduction(id) {
    // #476 volet 2 — séquence partagée ; ne reste que la plomberie des productions.
    await BibliothequeUI.dupliquerEtEditerItem({
        id: id,
        prefixeId: 'PROD_',
        modifierListe: (mutateur) => db.modifier(getCleProductions(), mutateur, []),
        // ✅ D9 + D3 (arbitrage du 24 août) — PLUS DE RETOUCHE ICI. `forkerItem`
        // renomme désormais le champ qui existe : `titre` pour une production, et
        // par `nommerCopie`. Avant, il posait un `nom` que la production n'avait
        // pas, puis cette retouche réécrivait le `titre` par concaténation nue —
        // deux défauts pour un seul renommage.
        rafraichirListe: async () => {
            if (typeof afficherListeProductions === 'function') await afficherListeProductions();
        },
        chargerPourModif: async (idCopie) => { await chargerProductionPourModif(idCopie); },
        champFocus: 'productionTitre'
    });
}

/**
 * Affiche la liste des productions dans la sidebar
 *
 * FONCTIONNEMENT:
 * 1. Récupère les productions depuis localStorage
 * 2. Récupère les grilles pour afficher le nom de la grille associée
 * 3. Génère le HTML pour chaque production
 * 4. Affiche le badge de type et la pondération
 * 5. Boutons Dupliquer (violet) et Supprimer (rouge)
 */
async function afficherListeProductions(filtreType = '') {
    // 🆕 Beta 95.4 : Utiliser la clé namespacée pour le trimestre actif
    const cleProductions = cle('productions');
    const cleGrilles = cle('grillesTemplates');
    const productions = await db.get(cleProductions) || [];
    const grilles = await db.get(cleGrilles) || [];
    const emplacement = document.getElementById('selectionProductions');
    if (!emplacement) {
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les productions dans la bibliothèque
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const productionsDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        productions.filter(p => p.dansBibliotheque !== false)
    );

    // Filtrer selon le type si nécessaire
    let productionsFiltrees = productionsDansBibliotheque;
    if (filtreType) {
        if (filtreType === 'sommative') {
            productionsFiltrees = productionsDansBibliotheque.filter(p =>
                !p.type.includes('formatif') && p.type !== 'portfolio' && p.type !== 'artefact-portfolio'
            );
        } else if (filtreType === 'formative') {
            productionsFiltrees = productionsDansBibliotheque.filter(p => p.type.includes('formatif'));
        } else if (filtreType === 'portfolio') {
            productionsFiltrees = productionsDansBibliotheque.filter(p =>
                p.type === 'portfolio' || p.type === 'artefact-portfolio'
            );
        }
    }

    // ✅ CORRECTION (8 décembre 2025) : Ne plus générer le bouton bibliothèque
    // car il est maintenant dans le HTML (comme pour Cours, Grilles, etc.)

    // 🆕 Beta 99.08 : Tri des productions (#930 : Grégoire s'en sert, par date d'échéance).
    // #1147 : il reste, dans la rangée du menu, et ordonne le menu ; sans tri, l'ordre personnalisé.
    const selectTri = document.getElementById('triProductions');
    const tri = selectTri ? selectTri.value : '';
    if (tri) {
        productionsFiltrees = [...productionsFiltrees].sort((a, b) => {
            if (tri === 'titre') {
                return (a.titre || '').localeCompare(b.titre || '', 'fr');
            } else if (tri === 'type') {
                return (a.type || '').localeCompare(b.type || '', 'fr');
            } else if (tri === 'echeance') {
                const dateA = obtenirEcheancePlusTot(a) || '9999';
                const dateB = obtenirEcheancePlusTot(b) || '9999';
                return dateA.localeCompare(dateB);
            }
            return 0;
        });
    }

    // #1147 (24 oct. 2026) : la sélection en menu déroulant, le titre seul, à plat (la barre latérale
    // ne rangeait pas les artefacts sous leur portfolio). La pondération, l'activité et la marque
    // « diagnostique » sont parties avec la barre ; « (à planifier) » reste, parce que c'est un ÉTAT
    // (#486 : sans échéance, la production est absente du calendrier et des indices C et P) et que
    // la barre était le seul endroit où il se voyait sans ouvrir la fiche. Le portfolio conteneur
    // n'a jamais de date propre : exclu, comme son badge l'était.
    const formulaire = document.getElementById('formulaireProduction');
    MenuSelection.rendre(emplacement, {
        idMenu: 'menuProductions',
        elements: productionsFiltrees.map(prod => ({
            id: prod.id,
            nom: prod.titre,
            suffixe: (prod.type !== 'portfolio' && typeof aucuneEcheanceAssignee === 'function'
                && aucuneEcheanceAssignee(prod)) ? '(à planifier)' : ''
        })),
        idOuvert: (productionEnEdition && formulaire && !formulaire.classList.contains('u-hide')) ? productionEnEdition : null,
        libelleAucun: 'Aucune production ouverte',
        libelleMenu: 'Production ouverte',
        phraseVide: 'Crée une nouvelle production ou puise dans la bibliothèque',
        ouvrir: chargerProductionPourModif
    });
}

/**
 * Charge une production pour modification dans le formulaire
 * Appelée par le choix dans le menu de la sélection (#1147)
 */
async function chargerProductionPourModif(id) {
    // Lot E3 (D3) : une production en cours de création ne se perd pas sans question.
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('production'))) return;

    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.add('u-hide');

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Afficher les boutons Dupliquer, Supprimer et Export PDF (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    // #501 — « Exporter en PDF » a quitté le gabarit : « Préparer le PDF » le
    // remplace, et le fait mieux. Le code mort part avec le bouton.
    if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

    // Appeler afficherFormProduction pour charger les données
    await afficherFormProduction(id);

    // ✅ AJOUT (6 jan 2026) : Afficher le panneau métadonnées
    const panneauMeta = document.getElementById('panneauMetadonneesProduction');
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function' && production) {
        panneauMeta.innerHTML = genererPanneauMetadonnees(production, 'production');
    }

    // Phase 4.B : mode lecture seule si item démo
    const conteneurProd = document.getElementById('formulaireProduction');
    if (conteneurProd && production && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneurProd, production, 'dupliquerEtEditerProduction', 'Dupliquer pour créer ma production');
    }

    // Le menu montre la production ouverte
    MenuSelection.marquer('menuProductions', id);

    // Mettre à jour les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // const productions = db.getSync('productions', []);
    // const production = productions.find(p => p.id === id);
    // mettreAJourMetriquesProduction(production);
}

/**
 * Crée une nouvelle production (formulaire vide)
 * Appelée par le bouton "+ Nouvelle production"
 * Lot E3 (D3) : rien n'existe avant « Créer la production » ; une création en cours
 * ne se remet pas à neuf sans question.
 */
async function creerNouvelleProduction() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('production'))) return;
    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.add('u-hide');

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Cacher les boutons Dupliquer, Supprimer et Export PDF (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // #1042 — un exemple ouvert juste avant a verrouillé ce formulaire : le rouvrir d'abord.
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.quitterModeLectureSeuleDemo) BibliothequeUI.quitterModeLectureSeuleDemo(document.getElementById('formulaireProduction'));
    // #1055 (15 oct. 2026) : la remise à neuf est CELLE de la fiche d'ajout
    // (`reinitialiserFormulaireProduction`, productions.js), et elle seule. Ce chemin
    // vidait le formulaire par sa propre liste de champs, qui avait déjà oublié les
    // consignes (#509), les échéances par groupe (#468/CO-17) — et la case
    // « Diagnostique » : la fiche neuve en héritait. Deux listes finissent toujours par
    // diverger ; il n'y en a plus qu'une.
    window.reinitialiserFormulaireProduction();

    // Réinitialiser les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // mettreAJourMetriquesProduction(null);

    // Une production en création n'est pas encore dans le menu
    MenuSelection.marquer('menuProductions', null);

    // Charger les grilles disponibles (avec petit délai pour laisser le DOM se mettre à jour)
    setTimeout(async () => {
        await chargerGrillesDisponiblesPourProduction();
    }, 50);
}

/**
 * Duplique une production existante
 *
 * @param {string} id - ID de la production à dupliquer
 */
async function dupliquerProduction(id) {
    let copieCreee = null;
    const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
        const productions = lues || [];
        const production = productions.find(p => p.id === id);

        if (!production) return undefined;

        // Créer une copie avec un nouvel ID. La copie devient un nouvel original
        // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY).
        // ✅ D2 + D4 + D5 (arbitrage du 24 août) — ON RENOMME CE QUE L'UTILISATEUR VOIT.
        // Avant, le `titre` — le champ affiché dans la liste — restait IDENTIQUE à
        // celui de la source : rien ne distinguait la copie de l'originale. Ce sont
        // `activiteApprentissage` et `description` qui recevaient « (copie) », et la
        // description était ÉCRASÉE par l'activité au passage, perdant son texte sans
        // avertissement. Désormais : le titre passe par `nommerCopie`, les deux autres
        // champs sont laissés intacts, la provenance est complète et les métadonnées
        // de partage de la source sont retirées.
        const copie = {
            ...production,
            id: genererIdUnique('PROD_'),
            titre: nommerCopie(production.titre, productions),
            auteur: BibliothequeUI.obtenirAuteurActif(),
            isDemo: false,
            inspireDe: BibliothequeUI.forgerInspireDe(production)
        };
        delete copie.verrouille;   // #489 : le verrou d'une production n'existe plus, la copie ne le porte pas
        delete copie.metadata_cc;
        delete copie.auteurOriginal;
        delete copie.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source

        productions.push(copie);
        copieCreee = copie;
        return productions;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (dupliquerProduction)

    if (!copieCreee) return;
    const copie = copieCreee;

    // Recharger la liste
    await afficherListeProductions();
    await chargerProductionPourModif(copie.id);

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
    }

    notifications.succes(`Production "${copie.activiteApprentissage || copie.description}" dupliquée !`);
}

/**
 * Duplique la production actuellement en édition
 * Appelée par le bouton "Dupliquer" dans le formulaire
 */
async function dupliquerProductionActive() {
    if (!productionEnEdition) {
        alert('Aucune production en cours d\'édition');
        return;
    }
    await dupliquerProduction(productionEnEdition);
}

/**
 * Supprime la production actuellement en édition
 * Appelée par le bouton "Supprimer" dans le formulaire
 */
async function supprimerProductionActive() {
    if (!productionEnEdition) {
        alert('Aucune production en cours d\'édition');
        return;
    }

    // #1075, point 3 : une production employée ne part pas ; le refus vient avant le codex.
    const cible = (db.getSync(getCleProductions(), []) || []).find(p => p && p.id === productionEnEdition);
    if (cible && !productionSupprimable(productionEnEdition, cible.titre)) return;
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('production'))) return;
    if (!confirm('Es-tu sûr de vouloir supprimer cette production ?')) {
        return;
    }

    // ⚠ La collection est relue DANS la file : celle d'avant la confirmation ne
    // vaut plus rien.
    const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
        return (lues || []).filter(e => e.id !== productionEnEdition);
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (supprimerProductionActive)

    // Fermer le formulaire et retourner à l'accueil
    annulerFormProduction();

    // Recharger la liste
    await afficherListeProductions();
    await afficherToutesLesProductionsParType();
    await mettreAJourPonderationTotale();

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
    }

    notifications.succes('Production supprimée');
}

/**
 * Importe une liste de productions externes (archives, voûte, etc.).
 * Pattern symétrique à importerGrillesExternes / importerEchellesExternes.
 *
 * @param {Array} nouvellesProductions - Productions à importer
 * @param {Object} [options]
 * @param {boolean} [options.remplacer=false] - Remplacer si même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre de productions ajoutées/mises à jour
 */
window.importerProductionsExternes = function(nouvellesProductions, options) {
    if (!nouvellesProductions || nouvellesProductions.length === 0) return 0;
    options = options || {};

    var cleProductions = (typeof getCleProductions === 'function')
        ? getCleProductions()
        : (typeof cle === 'function' ? cle('productions') : 'productions');

    var productions = db.getSync(cleProductions, []) || [];
    if (!Array.isArray(productions)) productions = [];
    var compteur = 0;

    for (var i = 0; i < nouvellesProductions.length; i++) {
        var prod = nouvellesProductions[i];
        if (!prod || !prod.id) continue;
        var index = productions.findIndex(function(p) { return p.id === prod.id; });

        if (index >= 0) {
            if (options.remplacer) {
                productions[index] = prod;
                compteur++;
            }
        } else {
            productions.push(prod);
            compteur++;
        }
    }

    if (compteur > 0) {
        db.setSync(cleProductions, productions);

        if (!options.silencieux) {
            if (typeof afficherListeProductions === 'function') afficherListeProductions();
        }
    }

    return compteur;
};

/* ===============================
   EXPORTS WINDOW
   =============================== */

window.dupliquerEtEditerProduction = dupliquerEtEditerProduction;
window.afficherListeProductions = afficherListeProductions;
window.chargerProductionPourModif = chargerProductionPourModif;
window.creerNouvelleProduction = creerNouvelleProduction;
window.dupliquerProduction = dupliquerProduction;
window.dupliquerProductionActive = dupliquerProductionActive;
window.supprimerProductionActive = supprimerProductionActive;
// window.importerProductionsExternes assigné inline ci-dessus (préservation comportementale)

})();
