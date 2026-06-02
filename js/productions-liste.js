/* ===============================
   LISTE DES PRODUCTIONS (SIDEBAR + CRUD UTILISATEUR)
   ✅ EXTRACTION (16 mai 2026, refactor étape 3)

   Sous-module extrait de productions.js. Contient :
   - dupliquerEtEditerProduction (fork production démo)
   - afficherListeProductions (sidebar)
   - chargerProductionPourModif (clic sidebar → formulaire)
   - creerNouvelleProduction (bouton + Nouvelle)
   - dupliquerProduction / dupliquerProductionActive (boutons Dupliquer)
   - supprimerProductionActive (bouton Supprimer)
   - importerProductionsExternes (consommé par reserve-ouvrir.js etc.)

   Wrappers délégation (sauvegarderProductionOriginale, annulerFormProductionOriginale,
   supprimerProductionOriginale) restent dans le résidu productions.js — anti-pattern
   §5.3 (variables module-scope à garder groupées).

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
    const cleProductions = getCleProductions();
    const productions = await db.get(cleProductions) || [];
    const production = productions.find(p => p.id === id);
    if (!production) return;

    const copie = BibliothequeUI.forkerItem(production, 'PROD_');
    // Les productions utilisent `titre` plutôt que `nom`
    if (production.titre) copie.titre = production.titre + ' (copie)';
    productions.push(copie);
    await db.set(cleProductions, productions);

    if (typeof afficherListeProductions === 'function') {
        await afficherListeProductions();
    }
    await chargerProductionPourModif(copie.id);

    const titreField = document.getElementById('productionTitre');
    if (titreField) {
        titreField.focus();
        titreField.select();
    }
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
    const container = document.getElementById('sidebarListeProductions');


    if (!container) {
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

    // 🆕 Beta 99.08 : Tri des productions dans la sidebar
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

    if (productionsFiltrees.length === 0) {
        container.innerHTML = '<p class="text-muted text-italic" style="font-size: 0.9rem; text-align: center; padding: 20px 10px;">Crée une nouvelle production ou puise dans la bibliothèque</p>';
        return;
    }

    const html = productionsFiltrees.map(prod => {
        const titre = prod.titre || 'Sans titre';
        // ✅ MODIF (28 janvier 2026) : Afficher l'activité d'apprentissage sous le titre
        const activite = prod.activiteApprentissage || prod.description || '';

        // 🆕 Beta 95.4 : Badges uniformisés avec grilles/échelles
        // Générer badges pratiques compatibles (utilise gabarits-utils.js)
        const badgesPratiques = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgesPratiques(prod)
            : '';

        // Badge de pondération (sauf pour portfolio conteneur et artefacts)
        const ponderationBadge = (prod.type !== 'portfolio' && prod.type !== 'artefact-portfolio' && prod.ponderation)
            ? `<span class="badge-caracteristique">${prod.ponderation}%</span>`
            : '';

        return `
            <div class="sidebar-item" data-id="${prod.id}" data-action="chargerProductionPourModif" data-param="${prod.id}">
                <div class="sidebar-item-titre">${echapperHtml(titre)}</div>
                ${activite ? `<div class="sidebar-item-activite">${echapperHtml(activite)}</div>` : ''}
                <div class="sidebar-item-badges">
                    ${badgesPratiques}
                    ${ponderationBadge}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Charge une production pour modification dans le formulaire
 * Appelée par le clic sur un item de la sidebar
 */
async function chargerProductionPourModif(id) {

    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.add('u-hide');

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Afficher les boutons Dupliquer, Supprimer et Export PDF (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    const btnExportPDFProd = document.getElementById('btnExporterPDFProduction');
    if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
    if (btnExportPDFProd) btnExportPDFProd.classList.remove('u-hide');

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

    // Highlighter l'item actif
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }

    // Mettre à jour les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // const productions = db.getSync('productions', []);
    // const production = productions.find(p => p.id === id);
    // mettreAJourMetriquesProduction(production);
}

/**
 * Crée une nouvelle production (formulaire vide)
 * Appelée par le bouton "+ Nouvelle production"
 */
function creerNouvelleProduction() {
    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.classList.add('u-hide');

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Cacher les boutons Dupliquer, Supprimer et Export PDF (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    const btnExportPDFNew = document.getElementById('btnExporterPDFProduction');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');
    if (btnExportPDFNew) btnExportPDFNew.classList.add('u-hide');

    // Réinitialiser le formulaire
    document.getElementById('productionActivite').value = '';
    document.getElementById('productionTitre').value = '';
    document.getElementById('productionType').value = '';
    document.getElementById('productionPonderation').value = '';
    document.getElementById('productionGrille').value = '';
    document.getElementById('productionObjectif').value = '';
    document.getElementById('productionTache').value = '';
    document.getElementById('productionDetailTache').value = '';

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesProduction');
    if (panneauMeta) panneauMeta.innerHTML = '';

    // Réinitialiser les champs portfolio et les notes explicatives
    const champsPortfolio = document.getElementById('champsPortfolio');
    if (champsPortfolio) champsPortfolio.classList.add('u-hide');

    // Réinitialiser la date d'échéance
    const inputDateEcheance = document.getElementById('productionDateEcheance');
    if (inputDateEcheance) inputDateEcheance.value = '';

    // Réinitialiser le contexte facultatif
    const productionContexte = document.getElementById('productionContexte');
    if (productionContexte) productionContexte.value = '';

    // Appeler gererChangementTypeProduction pour réinitialiser tous les états
    // (cartes contextuelles, notes, champs grisés, etc.)
    gererChangementTypeProduction();

    // Réinitialiser les checkboxes de pratiques compatibles
    const checkboxesContainer = document.getElementById('checkboxesPratiquesProduction');
    if (checkboxesContainer && typeof GabaritsUtils !== 'undefined') {
        checkboxesContainer.innerHTML = GabaritsUtils.genererCheckboxesPratiques('production', []);
    }

    // Changer le titre et le bouton
    document.getElementById('btnTexteEvaluation').textContent = 'Enregistrer';

    // Réinitialiser productionEnEdition
    productionEnEdition = null;

    // Réinitialiser les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // mettreAJourMetriquesProduction(null);

    // Retirer le highlight de tous les items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

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
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) return;

    // Créer une copie avec un nouvel ID. La copie devient un nouvel original
    // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY).
    const copie = {
        ...production,
        id: genererIdUnique('PROD_'),
        activiteApprentissage: `${production.activiteApprentissage || production.description || ''} (copie)`,
        description: `${production.activiteApprentissage || production.description || ''} (copie)`,
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: {
            nom: production.titre || production.activiteApprentissage || 'Inconnu',
            auteur: production.auteur || 'Inconnu',
            date: new Date().toISOString().slice(0, 10)
        },
        verrouille: false
    };

    productions.push(copie);
    await db.set(getCleProductions(), productions);

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

    alert(`Production "${copie.activiteApprentissage || copie.description}" dupliquée avec succès`);
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

    if (!confirm('Es-tu sûr de vouloir supprimer cette production ?')) {
        return;
    }

    let productions = await db.get(getCleProductions()) || [];
    productions = productions.filter(e => e.id !== productionEnEdition);

    await db.set(getCleProductions(), productions);

    // Fermer le formulaire et retourner à l'accueil
    annulerFormProduction();

    // Recharger la liste
    await afficherListeProductions();
    await afficherToutesLesProductionsParType();
    await mettreAJourPonderationTotale();

    // Mettre à jour le statut des modalités si la fonction existe
    if (typeof mettreAJourStatutModalites === 'function') {
        mettreAJourStatutModalites();
    }

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
    }

    alert('Production supprimée avec succès');
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
