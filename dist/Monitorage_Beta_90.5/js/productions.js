/* ===============================
   MODULE 04: GESTION DES PRODUCTIONS ET ÉVALUATIONS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   INTERDICTION ABSOLUE de modifier les noms de fonctions.
   Les identifiants HTML et les clés localStorage sont protégés.
   Seuls les commentaires peuvent être modifiés/ajoutés.
   
   Contenu de ce module:
   - Affichage et gestion des productions (évaluations)
   - Ajout, modification, suppression de productions
   - Gestion des pondérations
   - Support des portfolios et artefacts
   - Réorganisation et verrouillage
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Variables du module 01-config.js:
   - productionEnEdition : ID de la production en cours d'édition
   - echapperHtml() : Fonction de sécurité XSS (si utilisée)
   
   Fonctions du module 14-utilitaires.js (si disponibles):
   - afficherNotificationSucces(message, details)
   - afficherNotificationErreur(message, details)
   
   Fonctions du module 02-navigation.js:
   - afficherSection(nomSection)
   - afficherSousSection(idSousSection)
   
   Éléments HTML requis:
   - #tableauEvaluationsContainer : Conteneur de la liste
   - #aucuneEvaluation : Message si vide
   - #formulaireProduction : Formulaire d'ajout/modification
   - #btnajouterProduction : Bouton d'ajout
   - #nombreEvaluations : Compteur
   - #ponderationTotale : Total pondération
   - #statutPonderation : Statut de la pondération
   - #typesEvaluations : Résumé des types
   - Tous les champs du formulaire (productionTitre, productionDescription, etc.)
   
   LocalStorage utilisé:
   - 'productions' : Array des productions/évaluations
   - 'grillesTemplates' : Array des grilles de critères (pour association)
   =============================== */

/* ===============================
   FONCTION: AFFICHER TABLEAU DES PRODUCTIONS
   Affiche toutes les productions avec leurs détails
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche la liste complète des productions/évaluations
 * 
 * UTILISÉ PAR:
 * - initialiserModuleProductions() au chargement
 * - sauvegarderProduction() après ajout/modification
 * - supprimerProduction() après suppression
 * - monterEvaluation() et descendreEvaluation() après réorganisation
 * - afficherSousSection() quand on arrive sur reglages-productions
 * 
 * FONCTIONNEMENT:
 * 1. Charge les productions depuis localStorage ('productions')
 * 2. Charge les grilles depuis localStorage ('grillesTemplates')
 * 3. Si liste vide : affiche un message
 * 4. Sinon : génère le HTML pour chaque production
 * 5. Met à jour les statistiques (nombre, types)
 * 6. Gère l'affichage spécial pour les portfolios
 */
function afficherTableauProductions() {
    const evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const container = document.getElementById('tableauEvaluationsContainer');

    if (evaluations.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-style: italic;">Aucune évaluation définie.</p>';
        document.getElementById('typesEvaluations').innerHTML =
            '<span style="color: var(--bleu-leger);">Aucune évaluation configurée</span>';
        document.getElementById('nombreEvaluations').textContent = '0';
        return;
    }

    container.innerHTML = evaluations.map((prod, index) => {
        const grilleAssociee = grilles.find(g => g.id === prod.grilleId);
        const nomGrille = grilleAssociee ? grilleAssociee.nom : 'Aucune grille';

        // Style spécial pour Portfolio
        const estPortfolio = prod.type === 'portfolio';
        const bgColor = estPortfolio ? 'var(--bleu-carte)' : 'var(--bleu-tres-pale)';
        const borderColor = estPortfolio ? 'var(--bleu-moyen)' : 'var(--bleu-leger)';

        return `
        <div class="item-liste" style="background: ${bgColor}; border-color: ${borderColor}; border-width: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: var(--bleu-principal);">
                    ${estPortfolio ? '📁 ' : ''}${prod.titre}${prod.description ? ' - ' + prod.description : ''}
                </strong>
                <div style="white-space: nowrap;">
                    ${index > 0 ?
                `<button onclick="monterEvaluation('${prod.id}')" class="btn btn-principal">↑</button>` : ''}
                    ${index < evaluations.length - 1 ?
                `<button onclick="descendreEvaluation('${prod.id}')" class="btn btn-principal">↓</button>` : ''}
                    <button onclick="modifierProduction('${prod.id}')" class="btn btn-modifier">Modifier</button>
                    <button onclick="supprimerProduction('${prod.id}')" class="btn btn-supprimer">Supprimer</button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: ${prod.type === 'artefact-portfolio' ? '1fr 1fr' : '1fr 1fr 1fr'}; gap: 10px;">
                <div>
                    <label style="font-size: 0.75rem; color: var(--bleu-moyen);">Type</label>
                    <input type="text" value="${getTypeLabel(prod.type)}" class="controle-form" 
                           readonly style="font-size: 0.85rem;">
                </div>
                ${prod.type !== 'artefact-portfolio' ? `
                <div>
                    <label style="font-size: 0.75rem; color: var(--bleu-moyen);">Pondération</label>
                    <input type="text" value="${prod.ponderation}%" class="controle-form" 
                           readonly style="font-size: 0.85rem; font-weight: bold;">
                </div>
                ` : ''}
                ${!estPortfolio ? `
                <div>
                    <label style="font-size: 0.75rem; color: var(--bleu-moyen);">Grilles de critères</label>
                    <input type="text" value="${nomGrille}" class="controle-form" 
                           readonly style="font-size: 0.85rem; ${!grilleAssociee ? 'color: var(--bleu-leger); font-style: italic;' : ''}">
                </div>
                ` : ''}
            </div>
            ${estPortfolio && prod.artefactsIds && prod.artefactsIds.length > 0 ? `
                <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px;">
                    <strong style="font-size: 0.85rem; color: var(--bleu-principal);">
                        ${prod.artefactsIds.length} artefacts sélectionnés
                    </strong> · 
                    ${prod.regles.nombreARetenir} à retenir pour note finale · 
                    Min. ${prod.regles.minimumCompletion} complétés requis
                </div>
            ` : ''}
            ${prod.objectif || prod.tache ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--bleu-tres-pale);">
                    ${prod.objectif ? `<p style="font-size: 0.85rem; margin-bottom: 5px;"><strong>Objectif:</strong> ${prod.objectif}</p>` : ''}
                    ${prod.tache ? `<p style="font-size: 0.85rem; margin-bottom: 0;"><strong>Tâche:</strong> ${prod.tache}</p>` : ''}
                </div>
            ` : ''}
        </div>
        `;
    }).join('');

    document.getElementById('nombreEvaluations').textContent = evaluations.length;
    mettreAJourResumeTypes(evaluations);
}

/* ===============================
   FONCTION: AFFICHER FORMULAIRE PRODUCTION
   Affiche le formulaire d'ajout ou de modification
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche et configure le formulaire de production
 * 
 * @param {string} id - ID de la production à modifier (null pour création)
 * 
 * UTILISÉ PAR:
 * - Bouton "Ajouter une production"
 * - modifierEvaluation(id) pour édition
 * 
 * FONCTIONNEMENT:
 * 1. Affiche le formulaire
 * 2. Cache le bouton d'ajout
 * 3. Si id fourni : mode modification
 *    - Charge les données de la production
 *    - Remplit les champs du formulaire
 *    - Change le titre et le texte du bouton
 * 4. Sinon : mode création
 *    - Vide tous les champs
 *    - Titre "Nouvelle production"
 * 5. Charge la liste des grilles disponibles
 */
function afficherFormProduction(id) {
    console.log('📝 afficherFormProduction appelée avec ID:', id, 'type:', typeof id);

    const form = document.getElementById('formulaireProduction');
    const btnAjouter = document.getElementById('btnajouterProduction');
    const titre = document.getElementById('titreFormEvaluation');
    const btnTexte = document.getElementById('btnTexteEvaluation');

    // Afficher le formulaire et cacher le bouton d'ajout (si les éléments existent)
    if (form) form.style.display = 'block';
    if (btnAjouter) btnAjouter.style.display = 'none';

    // Charger la liste des grilles dans le select (si l'élément existe)
    const selectGrille = document.getElementById('productionGrille');
    if (selectGrille) {
        const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
        selectGrille.innerHTML = '<option value="">Aucune grille</option>' +
            grilles.map(g => `<option value="${g.id}">${g.nom}</option>`).join('');
    }

    if (id) {
        // Mode modification
        const evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
        console.log('📦 Nombre de productions:', evaluations.length);
        console.log('🔑 IDs disponibles:', evaluations.map(e => e.id));

        // Debug détaillé de la recherche
        evaluations.forEach((e, idx) => {
            const match = e.id === id;
            console.log(`   [${idx}] "${e.id}" === "${id}" ? ${match} (types: ${typeof e.id} vs ${typeof id})`);
        });

        const prod = evaluations.find(e => e.id === id);
        console.log('📍 Production trouvée?', !!prod);

        if (prod) {
            productionEnEdition = id;
            if (titre) titre.textContent = 'Modifier l\'évaluation';
            if (btnTexte) btnTexte.textContent = 'Sauvegarder';

            document.getElementById('productionTitre').value = prod.titre;
            document.getElementById('productionDescription').value = prod.description || '';
            document.getElementById('productionType').value = prod.type;
            document.getElementById('productionPonderation').value = prod.ponderation;
            if (selectGrille) selectGrille.value = prod.grilleId || '';
            document.getElementById('productionObjectif').value = prod.objectif || '';
            document.getElementById('productionTache').value = prod.tache || '';

            // Gérer l'affichage des champs spécifiques au type
            gererChangementTypeProduction();

            // Synchroniser la grille inline si c'est un artefact de portfolio
            const selectGrilleInline = document.getElementById('productionGrilleInline');
            if (selectGrilleInline && prod.type === 'artefact-portfolio') {
                selectGrilleInline.value = prod.grilleId || '';
            }

            // Si c'est un portfolio, pas de configuration supplémentaire
            // Les règles de calcul (nombreARetenir, etc.) sont dans Réglages → Pratique de notation
            if (prod.type === 'portfolio') {
                console.log('📖 Chargement Portfolio - Les règles de calcul sont configurées dans Réglages › Pratique de notation');
            }
        } else {
            // Production non trouvée
            console.error('❌ Production non trouvée avec ID:', id);
            console.error('IDs disponibles:', evaluations.map(e => ({ id: e.id, titre: e.titre })));

            if (typeof afficherNotificationErreur === 'function') {
                afficherNotificationErreur('Évaluation introuvable', `ID: ${id}`);
            } else {
                alert('Erreur : Évaluation introuvable');
            }
            return;
        }
    } else {
        // Mode ajout
        productionEnEdition = null;
        if (titre) titre.textContent = 'Nouvelle production';
        if (btnTexte) btnTexte.textContent = 'Ajouter';

        // Réinitialiser les champs
        document.getElementById('productionTitre').value = '';
        document.getElementById('productionDescription').value = '';
        document.getElementById('productionType').value = '';
        document.getElementById('productionPonderation').value = '';
        if (selectGrille) selectGrille.value = '';
        document.getElementById('productionObjectif').value = '';
        document.getElementById('productionTache').value = '';

        // Réinitialiser les champs portfolio
        const portfolioNombreRetenir = document.getElementById('portfolioNombreRetenir');
        const portfolioMinimumCompleter = document.getElementById('portfolioMinimumCompleter');
        if (portfolioNombreRetenir) portfolioNombreRetenir.value = 3;
        if (portfolioMinimumCompleter) portfolioMinimumCompleter.value = 7;

        // Réinitialiser l'affichage
        gererChangementTypeProduction();
    }
}

/* ===============================
   FONCTION: SAUVEGARDER PRODUCTION
   Enregistre une production (création ou modification)
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Sauvegarde une production dans localStorage
 * 
 * UTILISÉ PAR:
 * - Bouton "Ajouter" ou "Sauvegarder" du formulaire
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les valeurs des champs
 * 2. Valide les champs obligatoires
 * 3. Si productionEnEdition existe : modification
 *    - Trouve la production existante
 *    - Met à jour ses propriétés
 * 4. Sinon : création
 *    - Génère un nouvel ID unique
 *    - Ajoute à la liste
 * 5. Gère les données spécifiques aux portfolios
 * 6. Sauvegarde dans localStorage
 * 7. Ferme le formulaire
 * 8. Rafraîchit l'affichage
 * 9. Affiche une notification de succès
 */

function sauvegarderProduction() {
    const titre = document.getElementById('productionTitre').value.trim();
    const description = document.getElementById('productionDescription').value.trim();
    const type = document.getElementById('productionType').value;
    const ponderation = parseInt(document.getElementById('productionPonderation').value) || 0;
    const objectif = document.getElementById('productionObjectif').value.trim();
    const tache = document.getElementById('productionTache').value.trim();

    // Lire la grille depuis le bon select selon le type
    let grilleId = '';
    if (type === 'artefact-portfolio') {
        const grilleInline = document.getElementById('productionGrilleInline');
        grilleId = grilleInline ? grilleInline.value : '';
    } else {
        const grille = document.getElementById('productionGrille');
        grilleId = grille ? grille.value : '';
    }

    // Validation : artefact-portfolio n'a pas besoin de pondération
    if (!titre || !type || (type !== 'artefact-portfolio' && ponderation === 0)) {
        alert('Veuillez remplir tous les champs obligatoires (Titre, Type et Pondération)');
        return;
    }

    let evaluations = JSON.parse(localStorage.getItem('productions') || '[]');

    // Préparer l'objet de base
    let productionData = {
        titre,
        description,
        type,
        ponderation,
        objectif,
        tache,
        grilleId,
        verrouille: false
    };

    // Si c'est un Portfolio, ajouter les données spécifiques
    if (type === 'portfolio') {
        // ✅ CORRECTION Phase 3: Les règles de calcul ne sont PLUS sauvegardées ici
        // Elles sont configurées dans Réglages → Pratique de notation → Configuration PAN
        console.log('📊 Sauvegarde Portfolio - Les règles de calcul sont dans modalitesEvaluation.configPAN.portfolio');

        // Pas besoin de stocker artefactsIds - sera détecté dynamiquement
        productionData.modeCalcul = 'provisoire';
    }

    if (productionEnEdition) {
        // Modifier la production existante
        console.log('✏️ MODE ÉDITION - ID:', productionEnEdition);
        const index = evaluations.findIndex(e => e.id === productionEnEdition);
        if (index !== -1) {
            console.log('   - Index trouvé:', index);
            console.log('   - Avant:', JSON.stringify(evaluations[index].regles));
            evaluations[index] = {
                ...evaluations[index],
                ...productionData
            };
            console.log('   - Après:', JSON.stringify(evaluations[index].regles));
        } else {
            console.error('❌ Index non trouvé pour ID:', productionEnEdition);
        }
    } else {
        // Ajouter nouvelle production
        console.log('➕ MODE AJOUT - Nouvelle production');
        productionData.id = 'PROD' + Date.now();
        evaluations.push(productionData);
        console.log('   - Nouveau ID:', productionData.id);
    }

    console.log('💾 Sauvegarde dans localStorage...');
    localStorage.setItem('productions', JSON.stringify(evaluations));
    console.log('✅ Sauvegarde terminée');

    annulerFormProduction();
    afficherTableauProductions();
    afficherToutesLesProductionsParType();
    mettreAJourPonderationTotale();

    // Afficher la notification de succès si la fonction existe
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(productionEnEdition ? 
            'Production modifiée avec succès !' : 
            'Production ajoutée avec succès !');
    }

    // Mettre à jour le statut des modalités si la fonction existe
    if (typeof mettreAJourStatutModalites === 'function') {
        mettreAJourStatutModalites();
    }

    productionEnEdition = null;
}

/* ===============================
   ❌ FONCTION: ANNULER FORMULAIRE
   Cache le formulaire et réinitialise l'état
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Annule l'ajout ou la modification d'une production
 * 
 * UTILISÉ PAR:
 * - Bouton "Annuler" du formulaire
 * - sauvegarderProduction() après succès
 * 
 * FONCTIONNEMENT:
 * 1. Cache le formulaire
 * 2. Réaffiche le bouton d'ajout
 * 3. Réinitialise la variable productionEnEdition
 */
function annulerFormProduction() {
    // Cacher le formulaire
    const form = document.getElementById('formulaireProduction');
    if (form) form.style.display = 'none';

    // Réafficher le bouton d'ajout (si l'élément existe - pas présent dans layout sidebar)
    const btnAjouter = document.getElementById('btnajouterProduction');
    if (btnAjouter) btnAjouter.style.display = 'inline-block';

    // Réinitialiser la variable d'édition
    productionEnEdition = null;
}

/* ===============================
   FONCTION: MODIFIER ÉVALUATION
   Lance la modification d'une production
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Lance la modification d'une production existante
 *
 * @param {string} id - ID de la production à modifier
 *
 * UTILISÉ PAR:
 * - Bouton "Modifier" dans la liste des productions
 *
 * FONCTIONNEMENT:
 * Appelle simplement afficherFormProduction() avec l'ID
 *
 * NOTE: Renommée de modifierEvaluation() en modifierProduction()
 * pour éviter conflit avec la fonction du même nom dans evaluation.js
 */
function modifierProduction(id) {
    afficherFormProduction(id);
}

/* ===============================
   FONCTION: SUPPRIMER PRODUCTION
   Supprime une production après confirmation
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Supprime une production de la liste
 * 
 * @param {string} id - ID de la production à supprimer
 * 
 * UTILISÉ PAR:
 * - Bouton "Supprimer" dans la liste des productions
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Charge la liste des productions
 * 3. Filtre pour retirer la production ciblée
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 * 6. Met à jour les pondérations
 */
function supprimerProduction(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
        let evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
        evaluations = evaluations.filter(e => e.id !== id);

        localStorage.setItem('productions', JSON.stringify(evaluations));
        afficherTableauProductions();
        afficherToutesLesProductionsParType();
        mettreAJourPonderationTotale();

        // Mettre à jour le statut des modalités si la fonction existe
        if (typeof mettreAJourStatutModalites === 'function') {
            mettreAJourStatutModalites();
        }
    }
}

/* ===============================
   🔒 FONCTION: VERROUILLER ÉVALUATION
   Bascule le statut de verrouillage
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Bascule le verrouillage d'une production
 * 
 * @param {string} id - ID de la production
 * 
 * UTILISÉ PAR:
 * - Checkbox "Verrouiller" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve la production ciblée
 * 3. Inverse son statut de verrouillage
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
function verrouillerEvaluation(id) {
    console.log('🔐 verrouillerEvaluation appelée avec ID:', id, 'type:', typeof id);

    let evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
    console.log('📦 Nombre de productions:', evaluations.length);
    console.log('🔑 IDs disponibles:', evaluations.map(e => e.id));

    // Debug détaillé de la recherche
    evaluations.forEach((e, idx) => {
        const match = e.id === id;
        console.log(`   [${idx}] "${e.id}" === "${id}" ? ${match} (types: ${typeof e.id} vs ${typeof id})`);
    });

    const index = evaluations.findIndex(e => e.id === id);
    console.log('📍 Index trouvé:', index);

    if (index !== -1) {
        evaluations[index].verrouille = !evaluations[index].verrouille;
        localStorage.setItem('productions', JSON.stringify(evaluations));
        afficherTableauProductions();
        afficherToutesLesProductionsParType();

        // Notification de succès
        if (typeof afficherNotificationSucces === 'function') {
            const statut = evaluations[index].verrouille ? 'verrouillée' : 'déverrouillée';
            afficherNotificationSucces(`Production ${statut}`);
        }
    } else {
        // Si l'évaluation n'est pas trouvée, afficher une erreur
        console.error('❌ Production non trouvée!');
        console.error('ID recherché:', id);
        console.error('IDs disponibles:', evaluations.map(e => ({ id: e.id, titre: e.titre })));

        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Évaluation introuvable', `ID: ${id}`);
        } else {
            alert('Erreur : Évaluation introuvable');
        }
    }
}

/* ===============================
   FONCTION: MONTER ÉVALUATION
   Déplace une production vers le haut
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Monte une production d'une position dans la liste
 * 
 * @param {string} id - ID de la production
 * 
 * UTILISÉ PAR:
 * - Bouton "↑" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve l'index de la production
 * 3. Si pas en première position : échange avec la précédente
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
function monterEvaluation(id) {
    let evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
    const index = evaluations.findIndex(e => e.id === id);

    if (index > 0) {
        [evaluations[index - 1], evaluations[index]] = [evaluations[index], evaluations[index - 1]];
        localStorage.setItem('productions', JSON.stringify(evaluations));
        afficherTableauProductions();
        afficherToutesLesProductionsParType();
    }
}

/* ===============================
   FONCTION: DESCENDRE ÉVALUATION
   Déplace une production vers le bas
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Descend une production d'une position dans la liste
 * 
 * @param {string} id - ID de la production
 * 
 * UTILISÉ PAR:
 * - Bouton "↓" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Charge la liste des productions
 * 2. Trouve l'index de la production
 * 3. Si pas en dernière position : échange avec la suivante
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
function descendreEvaluation(id) {
    let evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
    const index = evaluations.findIndex(e => e.id === id);

    if (index < evaluations.length - 1) {
        [evaluations[index], evaluations[index + 1]] = [evaluations[index + 1], evaluations[index]];
        localStorage.setItem('productions', JSON.stringify(evaluations));
        afficherTableauProductions();
        afficherToutesLesProductionsParType();
    }
}

/* ===============================
   🎯 FONCTION: GÉRER CHANGEMENT TYPE
   Adapte l'UI selon le type de production
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Gère l'affichage conditionnel selon le type de production
 * 
 * UTILISÉ PAR:
 * - Select "Type" du formulaire (événement onchange)
 * - afficherFormProduction() lors du chargement
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le type sélectionné
 * 2. Réinitialise l'affichage des sections
 * 3. Si "portfolio" :
 *    - Affiche les champs de configuration
 *    - Masque la sélection de grille
 * 4. Si "artefact-portfolio" :
 *    - Masque la pondération
 *    - Affiche un message informatif
 * 5. Sinon : affichage standard
 */
function gererChangementTypeProduction() {
    const type = document.getElementById('productionType').value;
    const champsPortfolio = document.getElementById('champsPortfolio');
    const champPonderation = document.getElementById('champPonderation');
    const champGrilleSeparee = document.getElementById('champGrilleSeparee');
    const champGrilleInline = document.getElementById('champGrilleInline');
    const msgPonderation = document.getElementById('msgPonderationArtefact');

    // Réinitialiser tout d'abord
    if (champsPortfolio) champsPortfolio.style.display = 'none';
    if (champPonderation) champPonderation.style.display = 'block';
    if (champGrilleSeparee) champGrilleSeparee.style.display = 'block';
    if (champGrilleInline) champGrilleInline.style.display = 'none';
    if (msgPonderation) msgPonderation.style.display = 'none';

    // Appliquer selon le type
    if (type === 'portfolio') {
        // Portfolio conteneur : afficher config, masquer grille
        if (champsPortfolio) champsPortfolio.style.display = 'block';
        if (champGrilleSeparee) champGrilleSeparee.style.display = 'none';
    } else if (type === 'artefact-portfolio') {
        // Artefact individuel : masquer pondération, afficher grille inline, afficher message
        if (champPonderation) champPonderation.style.display = 'none';
        if (champGrilleSeparee) champGrilleSeparee.style.display = 'none';
        if (champGrilleInline) champGrilleInline.style.display = 'block';
        if (msgPonderation) msgPonderation.style.display = 'block';

        // Synchroniser les selects de grille
        synchroniserGrilles();
    }
}

/**
 * Synchronise les deux selects de grille (inline et séparée)
 */
function synchroniserGrilles() {
    const grilleStandard = document.getElementById('productionGrille');
    const grilleInline = document.getElementById('productionGrilleInline');

    if (grilleStandard && grilleInline) {
        // Copier les options si nécessaire
        if (grilleInline.options.length === 1) { // Seulement "Aucune"
            grilleInline.innerHTML = grilleStandard.innerHTML;
        }
        // Synchroniser la valeur sélectionnée
        grilleInline.value = grilleStandard.value;
    }
}

/* ===============================
   📁 FONCTION: CHARGER ARTEFACTS DISPONIBLES
   Liste les artefacts pour un portfolio
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Charge et affiche les artefacts disponibles pour un portfolio
 * 
 * UTILISÉ PAR:
 * - Interface de gestion de portfolio (usage futur)
 * 
 * FONCTIONNEMENT:
 * 1. Charge toutes les productions
 * 2. Filtre celles de type "artefact-portfolio"
 * 3. Si aucun : affiche un message
 * 4. Sinon : génère des checkboxes pour chaque artefact
 */
function chargerArtefactsDisponibles() {
    const evaluations = JSON.parse(localStorage.getItem('productions') || '[]');
    const artefacts = evaluations.filter(p => p.type === 'artefact-portfolio');
    const container = document.getElementById('listeArtefactsDisponibles');

    if (!container) return;

    if (artefacts.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-style: italic;">Aucun artefact de type "Artefact d\'un portfolio" n\'existe encore. Crée-les d\'abord.</p>';
        return;
    }

    container.innerHTML = artefacts.map(art => `
        <label style="display: block; padding: 8px; margin-bottom: 5px; 
               background: var(--bleu-tres-pale); border-radius: 4px; cursor: pointer;">
            <input type="checkbox" name="artefactPortfolio" value="${art.id}"
                   style="margin-right: 10px;">
            <strong>${art.description || art.titre}</strong>
        </label>
    `).join('');
}

/* ===============================
   FONCTION: METTRE À JOUR PONDÉRATION TOTALE
   Calcule et affiche la pondération totale
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Calcule la pondération totale et met à jour l'affichage
 * 
 * UTILISÉ PAR:
 * - afficherTableauProductions() après chargement
 * - sauvegarderProduction() après ajout/modification
 * - supprimerProduction() après suppression
 * 
 * FONCTIONNEMENT:
 * 1. Charge toutes les productions
 * 2. Filtre les artefacts-portfolio (ne comptent pas)
 * 3. Calcule la somme des pondérations
 * 4. Affiche le total
 * 5. Affiche un statut coloré :
 *    - Vert si = 100%
 *    - Rouge si > 100%
 *    - Orange si < 100%
 */
function mettreAJourPonderationTotale() {
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

    // Ignorer les artefacts-portfolio dans le calcul (ils font partie du Portfolio)
    const productionsComptees = productions.filter(p => p.type !== 'artefact-portfolio');

    const total = productionsComptees.reduce((sum, prod) => sum + (prod.ponderation || 0), 0);

    document.getElementById('ponderationTotale').textContent = total + '%';

    const statut = document.getElementById('statutPonderation');
    if (total === 100) {
        statut.textContent = '✓ Pondération correcte';
        statut.style.color = 'green';
    } else if (total > 100) {
        statut.textContent = `${total - 100}% en trop`;
        statut.style.color = 'red';
    } else {
        statut.textContent = `${100 - total}% manquant`;
        statut.style.color = 'orange';
    }
}

/* ===============================
   📈 FONCTION: METTRE À JOUR RÉSUMÉ TYPES
   Génère le résumé des types de productions
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Génère un résumé textuel des types de productions
 * 
 * @param {Array} evaluations - Liste des productions
 * 
 * UTILISÉ PAR:
 * - afficherTableauProductions() après affichage
 * 
 * FONCTIONNEMENT:
 * 1. Compte les occurrences de chaque type
 * 2. Génère un texte du type "2 examens, 1 portfolio, 3 travaux"
 * 3. Affiche dans l'élément #typesEvaluations
 */
function mettreAJourResumeTypes(evaluations) {
    const compteurTypes = {};
    evaluations.forEach(prod => {
        compteurTypes[prod.type] = (compteurTypes[prod.type] || 0) + 1;
    });

    const resume = Object.entries(compteurTypes)
        .map(([type, count]) => `${count} ${getTypeLabel(type).toLowerCase()}${count > 1 ? 's' : ''}`)
        .join(', ');

    document.getElementById('typesEvaluations').textContent = resume || 'Aucune évaluation';
}

/* ===============================
   FONCTION: GET TYPE LABEL
   Retourne le libellé d'un type de production
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Convertit un code de type en libellé lisible
 * 
 * @param {string} type - Code du type
 * @returns {string} - Libellé du type
 * 
 * UTILISÉ PAR:
 * - afficherTableauProductions() pour l'affichage
 * - mettreAJourResumeTypes() pour le résumé
 * 
 * TYPES DISPONIBLES:
 * - examen : Examen
 * - travail : Travail écrit
 * - quiz : Quiz/Test
 * - presentation : Présentation
 * - portfolio : 📁 Portfolio (conteneur)
 * - artefact-portfolio : Artefact d'un portfolio
 * - autre : Autre
 */
function getTypeLabel(type) {
    const labels = {
        'examen': 'Examen',
        'travail': 'Travail écrit',
        'quiz': 'Quiz/Test',
        'presentation': 'Présentation',
        'portfolio': '📁 Portfolio (conteneur)',
        'artefact-portfolio': 'Artefact d\'un portfolio',
        'autre': 'Autre'
    };
    return labels[type] || type;
}

/* ===============================
   📁 FONCTION: GÉRER PORTFOLIO (PLACEHOLDER)
   Fonctionnalité à développer
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Gère un portfolio (fonctionnalité à venir)
 * 
 * @param {string} id - ID du portfolio
 * 
 * NOTE: Cette fonction est un placeholder pour une fonctionnalité future
 * qui permettra de gérer en détail les portfolios et leurs artefacts
 */
function gererPortfolio(id) {
    alert('Fonctionnalité "Gérer le portfolio" à venir.\nPortfolio ID: ' + id);
    // TODO: Créer une interface dédiée pour gérer les portfolios
    // - Sélectionner les artefacts inclus
    // - Définir les règles de sélection
    // - Gérer le mode provisoire/final
}

/* ===============================
   NOUVELLE VUE HIÉRARCHIQUE
   Affichage groupé par type de production
   =============================== */

/**
 * Affiche toutes les productions regroupées par type
 *
 * GROUPES:
 * 1. Portfolio + artefacts (portfolio et artefact-portfolio)
 * 2. Évaluations sommatives (examen, travail, quiz, presentation, autre)
 * 3. Évaluations formatives (types avec '-formatif')
 *
 * FONCTIONNEMENT:
 * - Utilise <details> pour sections repliables
 * - Chaque section affiche ses productions
 * - Bouton contextuel pour ajouter une production au type
 */
function afficherToutesLesProductionsParType() {
    const container = document.getElementById('vueProductionsParType');
    if (!container) return;

    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');

    if (productions.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                <p style="color: var(--bleu-leger);">Aucune production définie</p>
                <small>Ajoutez une production en utilisant les boutons ci-dessous</small>
            </div>
        `;
        return;
    }

    // Grouper les productions
    const portfolio = productions.find(p => p.type === 'portfolio');
    const artefacts = productions.filter(p => p.type === 'artefact-portfolio');
    const sommatives = productions.filter(p =>
        !p.type.includes('formatif') &&
        p.type !== 'portfolio' &&
        p.type !== 'artefact-portfolio'
    );
    const formatives = productions.filter(p => p.type.includes('formatif'));

    /**
     * Fonction helper pour générer le HTML d'une production (format compact optimisé)
     */
    function genererHtmlProduction(prod, index, total) {
        // Debug: vérifier si la production a un ID
        if (!prod.id) {
            console.error('❌ Production sans ID détectée:', prod);
            console.error('   Titre:', prod.titre);
            console.error('   Type:', prod.type);
        }

        const grilleAssociee = grilles.find(g => g.id === prod.grilleId);
        const nomGrille = grilleAssociee ? grilleAssociee.nom : 'Aucune grille';
        const estPortfolio = prod.type === 'portfolio';
        const estArtefact = prod.type === 'artefact-portfolio';
        const bgColor = estPortfolio ? 'var(--bleu-carte)' : 'white';
        const borderColor = estPortfolio ? 'var(--bleu-principal)' : estArtefact ? 'var(--bleu-leger)' : 'var(--orange-accent)';

        return `
            <div class="item-liste" style="background: ${bgColor}; margin-bottom: 8px; padding: 12px 15px;
                 border-left: 4px solid ${borderColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--bleu-principal);">
                            ${estPortfolio ? '📁 ' : ''}${echapperHtml(prod.titre)}${prod.description ? ' - ' + echapperHtml(prod.description) : ''}
                        </div>
                        <div style="color: #666; font-size: 0.85rem; margin-top: 2px;">
                            ${getTypeLabel(prod.type)}
                            ${!estArtefact ? `<span style="margin: 0 8px; color: #ccc;">•</span>
                            <strong style="color: var(--orange-accent);">${prod.ponderation}%</strong>` : ''}
                            ${!estPortfolio && nomGrille !== 'Aucune grille' ? `<span style="margin: 0 8px; color: #ccc;">•</span>
                            ${echapperHtml(nomGrille)}` : ''}
                        </div>
                        ${estPortfolio && prod.artefactsIds && prod.artefactsIds.length > 0 ? `
                            <div style="font-size: 0.85rem; color: #666; margin-top: 6px;">
                                📦 ${prod.artefactsIds.length} artefacts • ${prod.regles.nombreARetenir} à retenir • Min. ${prod.regles.minimumCompletion} complétés
                            </div>
                        ` : ''}
                        ${prod.objectif || prod.tache ? `
                            <div style="font-size: 0.85rem; color: #666; margin-top: 6px;">
                                ${prod.objectif ? `📌 ${echapperHtml(prod.objectif)}` : ''}
                                ${prod.objectif && prod.tache ? ' • ' : ''}
                                ${prod.tache ? `✏️ ${echapperHtml(prod.tache)}` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div style="white-space: nowrap; margin-left: 15px;">
                        ${index > 0 ?
                            `<button onclick="monterEvaluation('${prod.id}')" class="btn btn-principal"
                             style="padding: 4px 8px; font-size: 0.8rem; margin-right: 3px;">↑</button>` : ''}
                        ${index < total - 1 ?
                            `<button onclick="descendreEvaluation('${prod.id}')" class="btn btn-principal"
                             style="padding: 4px 8px; font-size: 0.8rem; margin-right: 3px;">↓</button>` : ''}
                        <button onclick="modifierProduction('${prod.id || 'ERROR_NO_ID'}')" class="btn btn-modifier"
                                style="padding: 4px 10px; font-size: 0.8rem; margin-right: 3px;">Modifier</button>
                        <button onclick="supprimerProduction('${prod.id}')" class="btn btn-supprimer"
                                style="padding: 4px 10px; font-size: 0.8rem;">Supprimer</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Construire le HTML
    let html = '';

    // Section 1: Portfolio + Artefacts
    if (portfolio || artefacts.length > 0) {
        html += `
            <details class="production-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: white; overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📁 Portfolio et artefacts</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${portfolio ? '1 portfolio' : ''}${portfolio && artefacts.length > 0 ? ' · ' : ''}${artefacts.length > 0 ? `${artefacts.length} artefact${artefacts.length > 1 ? 's' : ''}` : ''}
                    </span>
                </summary>
                <div style="padding: 15px;">
                    ${portfolio ? genererHtmlProduction(portfolio, 0, 1) : ''}
                    ${artefacts.map((art, idx) => genererHtmlProduction(art, idx, artefacts.length)).join('')}
                    ${!portfolio ? `
                        <button class="btn btn-confirmer" onclick="ajouterProductionAuType('portfolio')" style="margin-top: 10px;">
                            + Ajouter un portfolio
                        </button>
                    ` : ''}
                    <button class="btn btn-confirmer" onclick="ajouterProductionAuType('artefact-portfolio')" style="margin-top: 10px; margin-left: 10px;">
                        + Ajouter un artefact
                    </button>
                </div>
            </details>
        `;
    }

    // Section 2: Évaluations sommatives
    if (sommatives.length > 0) {
        html += `
            <details class="production-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: white; overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📝 Évaluations sommatives</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${sommatives.length} évaluation${sommatives.length > 1 ? 's' : ''}
                    </span>
                </summary>
                <div style="padding: 15px;">
                    ${sommatives.map((prod, idx) => genererHtmlProduction(prod, idx, sommatives.length)).join('')}
                    <button class="btn btn-confirmer" onclick="ajouterProductionAuType('examen')" style="margin-top: 10px;">
                        + Ajouter une évaluation sommative
                    </button>
                </div>
            </details>
        `;
    }

    // Section 3: Évaluations formatives
    if (formatives.length > 0) {
        html += `
            <details class="production-section" style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: white; overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📝 Évaluations formatives</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${formatives.length} évaluation${formatives.length > 1 ? 's' : ''}
                    </span>
                </summary>
                <div style="padding: 15px;">
                    ${formatives.map((prod, idx) => genererHtmlProduction(prod, idx, formatives.length)).join('')}
                    <button class="btn btn-confirmer" onclick="ajouterProductionAuType('examen-formatif')" style="margin-top: 10px;">
                        + Ajouter une évaluation formative
                    </button>
                </div>
            </details>
        `;
    }

    container.innerHTML = html;
}

/**
 * Ajoute une production du type spécifié
 *
 * @param {string} type - Type de production à créer
 *
 * FONCTIONNEMENT:
 * 1. Ouvre le formulaire
 * 2. Pré-sélectionne le type
 * 3. Scroll vers le formulaire
 */
function ajouterProductionAuType(type) {
    // Ouvrir le formulaire d'ajout
    afficherFormProduction(null);

    // Pré-sélectionner le type
    const selectType = document.getElementById('productionType');
    if (selectType) {
        selectType.value = type;
        // Déclencher l'événement change pour adapter l'interface
        gererChangementTypeProduction();
    }

    // Scroll vers le formulaire
    const form = document.getElementById('formulaireProduction');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* ===============================
   🚀 FONCTION D'INITIALISATION
   Point d'entrée du module
   ⚠️ NE PAS RENOMMER - Appelée par 99-main.js
   =============================== */

/**
 * Initialise le module Productions au chargement
 * 
 * APPELÉ PAR:
 * - 99-main.js dans la section des chargements conditionnels
 * 
 * FONCTIONNEMENT:
 * 1. Log de démarrage
 * 2. Vérifie si on est sur la sous-section productions
 * 3. Si oui : charge l'affichage et les données
 * 4. Attache les événements si nécessaire
 * 5. Log de succès
 * 
 * ÉVÉNEMENTS À GÉRER:
 * - Aucun événement global pour l'instant
 * - Les événements sont inline dans le HTML (onclick)
 * - À moderniser éventuellement avec addEventListener
 */
function initialiserModuleProductions() {
    console.log('Initialisation du module Productions');

    // Charger automatiquement si on est sur la page productions
    const sousSection = document.querySelector('#materiel-productions');
    if (sousSection && sousSection.classList.contains('active')) {
        // Afficher la sidebar avec la liste des productions (Beta 80.5+)
        afficherListeProductions();

        // Afficher aussi l'ancienne vue (cachée) pour compatibilité
        afficherTableauProductions();
        mettreAJourPonderationTotale();
    }

    // Pas d'événements globaux à attacher pour l'instant
    // Les événements sont gérés via les attributs onclick dans le HTML

    console.log('✅ Module Productions initialisé avec layout sidebar (Beta 80.5)');
}

/* ===============================
   EXPORT DES FONCTIONS GLOBALES
   =============================== */

window.afficherTableauProductions = afficherTableauProductions;
window.afficherToutesLesProductionsParType = afficherToutesLesProductionsParType;
window.ajouterProductionAuType = ajouterProductionAuType;
window.afficherFormProduction = afficherFormProduction;
window.sauvegarderProduction = sauvegarderProduction;
window.annulerFormProduction = annulerFormProduction;
window.modifierProduction = modifierProduction;
window.supprimerProduction = supprimerProduction;
window.verrouillerEvaluation = verrouillerEvaluation;
window.monterEvaluation = monterEvaluation;
window.descendreEvaluation = descendreEvaluation;
window.gererChangementTypeProduction = gererChangementTypeProduction;
window.chargerArtefactsDisponibles = chargerArtefactsDisponibles;
window.mettreAJourPonderationTotale = mettreAJourPonderationTotale;
window.getTypeLabel = getTypeLabel;
window.gererPortfolio = gererPortfolio;
window.initialiserModuleProductions = initialiserModuleProductions;

// Nouvelles fonctions sidebar (Beta 80.5+)
window.afficherListeProductions = afficherListeProductions;
window.filtrerListeProductions = filtrerListeProductions;
window.chargerProductionPourModif = chargerProductionPourModif;
window.creerNouvelleProduction = creerNouvelleProduction;
window.dupliquerProduction = dupliquerProduction;
window.dupliquerProductionActive = dupliquerProductionActive;
window.supprimerProductionActive = supprimerProductionActive;

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - 01-config.js (productionEnEdition)
 * - 02-navigation.js (afficherSection, afficherSousSection)
 * - 14-utilitaires.js (notifications - optionnel)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - 05-grilles.js (peut lier des grilles aux productions)
 * - Modules d'évaluation (utilisent les productions définies)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module DOIT être chargé APRÈS 01-config.js et 02-navigation.js
 * 
 * LOCALSTORAGE UTILISÉ:
 * - 'productions' : Array des productions/évaluations
 *   Structure: [{ id, titre, description, type, ponderation, grilleId, objectif, tache, verrouille }, ...]
 *   Note: Le nom 'productions' est historique et sera peut-être renommé
 * - 'grillesTemplates' : Array des grilles de critères (pour association)
 * 
 * FONCTIONS EXPORTÉES (accessibles globalement):
 * - afficherTableauProductions()
 * - afficherFormProduction(id)
 * - sauvegarderProduction()
 * - annulerFormProduction()
 * - modifierEvaluation(id)
 * - supprimerProduction(id)
 * - verrouillerEvaluation(id)
 * - monterEvaluation(id)
 * - descendreEvaluation(id)
 * - gererChangementTypeProduction()
 * - chargerArtefactsDisponibles()
 * - mettreAJourPonderationTotale()
 * - mettreAJourResumeTypes(evaluations)
 * - getTypeLabel(type)
 * - gererPortfolio(id)
 * - initialiserModuleProductions()
 * 
 * ÉLÉMENTS HTML REQUIS:
 * Voir la section <!-- Sous-section : Productions --> dans index.html
 * 
 * AMÉLIORATIONS FUTURES:
 * - Moderniser les événements (remplacer onclick par addEventListener)
 * - Implémenter complètement la gestion des portfolios
 * - Ajouter validation côté client plus robuste
 * - Permettre le glisser-déposer pour réorganiser
 * - Ajouter des filtres (par type, par pondération)
 */

/* ===============================
   FONCTIONS SIDEBAR (Beta 80.5+)
   Layout 2 colonnes avec navigation latérale
   =============================== */

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
function afficherListeProductions(filtreType = '') {
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const container = document.getElementById('sidebarListeProductions');

    if (!container) return;

    // Filtrer selon le type si nécessaire
    let productionsFiltrees = productions;
    if (filtreType) {
        if (filtreType === 'sommative') {
            productionsFiltrees = productions.filter(p =>
                !p.type.includes('formatif') && p.type !== 'portfolio' && p.type !== 'artefact-portfolio'
            );
        } else if (filtreType === 'formative') {
            productionsFiltrees = productions.filter(p => p.type.includes('formatif'));
        } else if (filtreType === 'portfolio') {
            productionsFiltrees = productions.filter(p =>
                p.type === 'portfolio' || p.type === 'artefact-portfolio'
            );
        }
    }

    if (productionsFiltrees.length === 0) {
        container.innerHTML = '<p class="sidebar-vide">Aucune production disponible</p>';
        return;
    }

    const html = productionsFiltrees.map(prod => {
        const typeLabel = getTypeLabel(prod.type);

        return `
            <div class="sidebar-item" data-id="${prod.id}" onclick="chargerProductionPourModif('${prod.id}')">
                <div class="sidebar-item-titre">${echapperHtml(prod.description || 'Sans titre')}</div>
                <div class="sidebar-item-badge">${typeLabel}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Filtre la liste des productions par type
 * Appelée par le select de filtre dans la sidebar
 */
function filtrerListeProductions() {
    const select = document.getElementById('filtreTypeProduction');
    if (!select) return;

    const filtreType = select.value;
    afficherListeProductions(filtreType);
}

/**
 * Charge une production pour modification dans le formulaire
 * Appelée par le clic sur un item de la sidebar
 */
function chargerProductionPourModif(id) {
    console.log('🔄 chargerProductionPourModif appelée avec ID:', id);

    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.style.display = 'none';

    // Afficher le formulaire et les options
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.style.display = 'block';

    const options = document.getElementById('optionsImportExportProductions');
    if (options) options.style.display = 'block';

    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
    if (btnSupprimer) btnSupprimer.style.display = 'inline-block';

    // Appeler afficherFormProduction pour charger les données
    afficherFormProduction(id);

    // Highlighter l'item actif
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }

    // Mettre à jour les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // const productions = JSON.parse(localStorage.getItem('productions') || '[]');
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
    if (accueil) accueil.style.display = 'none';

    // Afficher le formulaire et les options
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.style.display = 'block';

    const options = document.getElementById('optionsImportExportProductions');
    if (options) options.style.display = 'block';

    // Cacher les boutons Dupliquer et Supprimer (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    if (btnDupliquer) btnDupliquer.style.display = 'none';
    if (btnSupprimer) btnSupprimer.style.display = 'none';

    // Réinitialiser le formulaire
    document.getElementById('productionDescription').value = '';
    document.getElementById('productionTitre').value = '';
    document.getElementById('productionType').value = '';
    document.getElementById('productionPonderation').value = '';
    document.getElementById('productionGrille').value = '';
    document.getElementById('productionObjectif').value = '';
    document.getElementById('productionTache').value = '';

    // Réinitialiser les champs portfolio
    document.getElementById('champsPortfolio').style.display = 'none';
    document.getElementById('msgPonderationArtefact').style.display = 'none';

    // Changer le titre et le bouton
    document.getElementById('btnTexteEvaluation').textContent = 'Ajouter';

    // Réinitialiser productionEnEdition
    productionEnEdition = null;

    // Réinitialiser les métriques - DÉSACTIVÉ (cartes métriques supprimées)
    // mettreAJourMetriquesProduction(null);

    // Retirer le highlight de tous les items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Charger les grilles disponibles
    chargerGrillesDisponibles();
}

// SUPPRIMÉ: Définition dupliquée de chargerProductionPourModif
// Cette fonction est maintenant définie une seule fois aux lignes 1286-1318
// La duplication causait un bug où productionEnEdition n'était pas défini correctement

/**
 * Met le highlight sur la production active dans la sidebar
 *
 * @param {string} id - ID de la production active
 */
function definirProductionActive(id) {
    // Retirer le highlight de tous les items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Ajouter le highlight à l'item actif
    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

/**
 * DÉSACTIVÉ - Met à jour les cartes métriques avec les infos de la production
 * Les cartes métriques ont été supprimées (redondantes avec le formulaire)
 *
 * @param {object|null} production - Production à afficher (ou null pour réinitialiser)
 */
/*
function mettreAJourMetriquesProduction(production) {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');

    if (!production) {
        document.getElementById('ponderationProdMetrique').textContent = '-';
        document.getElementById('typeProdMetrique').textContent = '-';
        document.getElementById('grilleProdMetrique').textContent = '-';
        return;
    }

    // Pondération
    const ponderation = production.type === 'artefact-portfolio' ? 'N/A' : `${production.ponderation || 0}%`;
    document.getElementById('ponderationProdMetrique').textContent = ponderation;

    // Type
    const typeLabel = getTypeLabel(production.type);
    document.getElementById('typeProdMetrique').textContent = typeLabel;

    // Grille
    const grille = grilles.find(g => g.id === production.grilleId);
    const nomGrille = grille ? grille.nom : 'Aucune';
    document.getElementById('grilleProdMetrique').textContent = nomGrille;
}
*/

/**
 * Charge les grilles disponibles dans le select
 * (Fonction helper pour éviter la duplication de code)
 */
function chargerGrillesDisponibles() {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const select = document.getElementById('productionGrille');

    if (!select) return;

    select.innerHTML = '<option value="">Aucune</option>';
    grilles.forEach(grille => {
        const option = document.createElement('option');
        option.value = grille.id;
        option.textContent = grille.nom;
        select.appendChild(option);
    });
}

/**
 * Duplique une production existante
 *
 * @param {string} id - ID de la production à dupliquer
 */
function dupliquerProduction(id) {
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const production = productions.find(p => p.id === id);

    if (!production) return;

    // Créer une copie avec un nouvel ID
    const copie = {
        ...production,
        id: Date.now().toString(),
        description: `${production.description} (copie)`,
        verrouille: false
    };

    productions.push(copie);
    localStorage.setItem('productions', JSON.stringify(productions));

    // Recharger la liste
    afficherListeProductions();
    chargerProductionPourModif(copie.id);

    alert(`Production "${copie.description}" dupliquée avec succès`);
}

/**
 * Duplique la production actuellement en édition
 * Appelée par le bouton "Dupliquer" dans le formulaire
 */
function dupliquerProductionActive() {
    if (!productionEnEdition) {
        alert('Aucune production en cours d\'édition');
        return;
    }
    dupliquerProduction(productionEnEdition);
}

/**
 * Supprime la production actuellement en édition
 * Appelée par le bouton "Supprimer" dans le formulaire
 */
function supprimerProductionActive() {
    if (!productionEnEdition) {
        alert('Aucune production en cours d\'édition');
        return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
        return;
    }

    let productions = JSON.parse(localStorage.getItem('productions') || '[]');
    productions = productions.filter(e => e.id !== productionEnEdition);

    localStorage.setItem('productions', JSON.stringify(productions));

    // Fermer le formulaire et retourner à l'accueil
    annulerFormProduction();

    // Recharger la liste
    afficherListeProductions();
    afficherToutesLesProductionsParType();
    mettreAJourPonderationTotale();

    // Mettre à jour le statut des modalités si la fonction existe
    if (typeof mettreAJourStatutModalites === 'function') {
        mettreAJourStatutModalites();
    }

    alert('Production supprimée avec succès');
}

/**
 * Adapte la fonction sauvegarderProduction existante pour le nouveau layout
 * Cette fonction override la fonction originale pour ajouter le support sidebar
 */
const sauvegarderProductionOriginale = window.sauvegarderProduction;
window.sauvegarderProduction = function() {
    // Appeler la fonction originale
    if (typeof sauvegarderProductionOriginale === 'function') {
        sauvegarderProductionOriginale();
    }

    // Recharger la sidebar
    afficherListeProductions();

    // Mettre à jour les métriques
    const id = window.productionEnCoursEdition;
    if (id) {
        const productions = JSON.parse(localStorage.getItem('productions') || '[]');
        const production = productions.find(p => p.id === id);
        if (production) {
            // mettreAJourMetriquesProduction(production); // DÉSACTIVÉ (cartes métriques supprimées)
            definirProductionActive(id);
        }
    }
};

/**
 * Adapte la fonction annulerFormProduction pour le nouveau layout
 */
const annulerFormProductionOriginale = window.annulerFormProduction;
window.annulerFormProduction = function() {
    // Masquer le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.style.display = 'none';

    const options = document.getElementById('optionsImportExportProductions');
    if (options) options.style.display = 'none';

    // Afficher le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.style.display = 'block';

    // Retirer le highlight
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Réinitialiser l'ID d'édition
    window.productionEnCoursEdition = null;
};

/**
 * Adapte la fonction supprimerProduction pour le nouveau layout
 */
const supprimerProductionOriginale = window.supprimerProduction;
window.supprimerProduction = function(id) {
    if (!confirm('Supprimer cette production ?')) return;

    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const index = productions.findIndex(p => p.id === id);

    if (index === -1) return;

    productions.splice(index, 1);
    localStorage.setItem('productions', JSON.stringify(productions));

    // Recharger la sidebar
    afficherListeProductions();

    // Masquer le formulaire si c'était la production affichée
    if (window.productionEnCoursEdition === id) {
        annulerFormProduction();
    }

    alert('Production supprimée');
};