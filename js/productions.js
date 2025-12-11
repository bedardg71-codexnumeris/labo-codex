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
async function afficherTableauProductions() {
    const evaluations = await db.get('productions') || [];
    const grilles = await db.get('grillesTemplates') || [];
    const container = document.getElementById('tableauEvaluationsContainer');

    if (evaluations.length === 0) {
        container.innerHTML = '<p class="text-muted prod-italic">Aucune évaluation définie.</p>';
        document.getElementById('typesEvaluations').innerHTML =
            '<span class="prod-texte-bleu-leger">Aucune évaluation configurée</span>';
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
            <div class="production-header">
                <strong class="production-titre">
                    ${estPortfolio ? '📁 ' : ''}${prod.titre}${prod.description ? ' - ' + prod.description : ''}
                </strong>
                <div class="production-actions">
                    ${index > 0 ?
                `<button onclick="monterEvaluation('${prod.id}')" class="btn btn-principal">↑</button>` : ''}
                    ${index < evaluations.length - 1 ?
                `<button onclick="descendreEvaluation('${prod.id}')" class="btn btn-principal">↓</button>` : ''}
                    <button onclick="modifierProduction('${prod.id}')" class="btn btn-modifier">Modifier</button>
                    <button onclick="supprimerProduction('${prod.id}')" class="btn btn-supprimer">Supprimer</button>
                </div>
            </div>
            <div class="production-champs-grille ${prod.type === 'artefact-portfolio' ? 'production-champs-grille-2col' : 'production-champs-grille-3col'}">
                <div>
                    <label class="production-champ-label">Type</label>
                    <input type="text" value="${getTypeLabel(prod.type)}" class="controle-form production-champ-input" readonly>
                </div>
                ${prod.type !== 'artefact-portfolio' ? `
                <div>
                    <label class="production-champ-label">Pondération</label>
                    <input type="text" value="${prod.ponderation}%" class="controle-form production-champ-input-bold" readonly>
                </div>
                ` : ''}
                ${!estPortfolio ? `
                <div>
                    <label class="production-champ-label">Grilles de critères</label>
                    <input type="text" value="${nomGrille}" class="controle-form ${!grilleAssociee ? 'production-champ-input-placeholder' : 'production-champ-input'}" readonly>
                </div>
                ` : ''}
            </div>
            ${estPortfolio && prod.artefactsIds && prod.artefactsIds.length > 0 ? `
                <div class="production-portfolio-info">
                    <strong>
                        ${prod.artefactsIds.length} artefacts sélectionnés
                    </strong> ·
                    ${prod.regles.nombreARetenir} à retenir pour note finale ·
                    Min. ${prod.regles.minimumCompletion} complétés requis
                </div>
            ` : ''}
            ${prod.objectif || prod.tache ? `
                <div class="production-details">
                    ${prod.objectif ? `<p><strong>Objectif:</strong> ${prod.objectif}</p>` : ''}
                    ${prod.tache ? `<p><strong>Tâche:</strong> ${prod.tache}</p>` : ''}
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
async function afficherFormProduction(id) {
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
    const selectGrilleInline = document.getElementById('productionGrilleInline');

    console.log('📋 Chargement des grilles disponibles...');
    console.log('   - selectGrille trouvé?', !!selectGrille);
    console.log('   - selectGrilleInline trouvé?', !!selectGrilleInline);

    if (selectGrille || selectGrilleInline) {
        const grilles = await db.get('grillesTemplates') || [];
        console.log('   - Nombre de grilles:', grilles.length);
        console.log('   - Grilles:', grilles.map(g => ({ id: g.id, nom: g.nom })));

        const optionsHtml = '<option value="">Aucune</option>' +
            grilles.map(g => `<option value="${g.id}">${g.nom}</option>`).join('');

        if (selectGrille) {
            selectGrille.innerHTML = optionsHtml;
        }
        if (selectGrilleInline) {
            selectGrilleInline.innerHTML = optionsHtml;
        }
    }

    if (id) {
        // Mode modification
        const evaluations = await db.get('productions') || [];
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

            // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Charger date d'échéance
            document.getElementById('productionDateEcheance').value = prod.dateEcheance || '';

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

        // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Réinitialiser date d'échéance
        document.getElementById('productionDateEcheance').value = '';

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

async function sauvegarderProduction() {
    const titre = document.getElementById('productionTitre').value.trim();
    const description = document.getElementById('productionDescription').value.trim();
    const type = document.getElementById('productionType').value;
    const ponderation = parseInt(document.getElementById('productionPonderation').value) || 0;
    const objectif = document.getElementById('productionObjectif').value.trim();
    const tache = document.getElementById('productionTache').value.trim();

    // ✨ NOUVEAU (Beta 94 - 10 déc 2025): Date d'échéance
    const dateEcheance = document.getElementById('productionDateEcheance').value || null;

    // Lire la grille depuis le bon select selon le type
    let grilleId = '';
    if (type === 'artefact-portfolio') {
        const grilleInline = document.getElementById('productionGrilleInline');
        grilleId = grilleInline ? grilleInline.value : '';
    } else {
        const grille = document.getElementById('productionGrille');
        grilleId = grille ? grille.value : '';
    }

    // ✅ NOUVEAU (Beta 94): Validation incluant dateEcheance obligatoire
    if (!titre || !type || (type !== 'artefact-portfolio' && ponderation === 0)) {
        alert('Veuillez remplir tous les champs obligatoires (Titre, Type et Pondération)');
        return;
    }

    if (!dateEcheance) {
        alert('La date d\'échéance est obligatoire pour toutes les productions');
        return;
    }

    let evaluations = await db.get('productions') || [];

    // Préparer l'objet de base
    let productionData = {
        titre,
        description,
        type,
        ponderation,
        objectif,
        tache,
        grilleId,
        dateEcheance,     // ✨ NOUVEAU (Beta 94 - 10 déc 2025)
        verrouille: false,
        dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Nouvelle production dans bibliothèque par défaut
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

    console.log('💾 Sauvegarde dans db.set...');
    await db.set('productions', evaluations);
    console.log('✅ Sauvegarde terminée');

    annulerFormProduction();
    await afficherTableauProductions();
    await afficherToutesLesProductionsParType();
    await mettreAJourPonderationTotale();

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

    // Mettre à jour le select des productions dans le module Évaluation
    if (typeof window.chargerProductionsDansSelect === 'function') {
        window.chargerProductionsDansSelect();
    }

    // Mettre à jour le filtre de production dans la liste des évaluations
    if (typeof window.rechargerFiltreProduction === 'function') {
        window.rechargerFiltreProduction();
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
async function modifierProduction(id) {
    await afficherFormProduction(id);
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
async function supprimerProduction(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
        let evaluations = await db.get('productions') || [];
        evaluations = evaluations.filter(e => e.id !== id);

        await db.set('productions', evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();
        await mettreAJourPonderationTotale();

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
async function verrouillerEvaluation(id) {
    console.log('🔐 verrouillerEvaluation appelée avec ID:', id, 'type:', typeof id);

    let evaluations = await db.get('productions') || [];
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
        await db.set('productions', evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();

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
async function monterEvaluation(id) {
    let evaluations = await db.get('productions') || [];
    const index = evaluations.findIndex(e => e.id === id);

    if (index > 0) {
        [evaluations[index - 1], evaluations[index]] = [evaluations[index], evaluations[index - 1]];
        await db.set('productions', evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();
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
async function descendreEvaluation(id) {
    let evaluations = await db.get('productions') || [];
    const index = evaluations.findIndex(e => e.id === id);

    if (index < evaluations.length - 1) {
        [evaluations[index], evaluations[index + 1]] = [evaluations[index + 1], evaluations[index]];
        await db.set('productions', evaluations);
        await afficherTableauProductions();
        await afficherToutesLesProductionsParType();
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
async function chargerArtefactsDisponibles() {
    const evaluations = await db.get('productions') || [];
    const artefacts = evaluations.filter(p => p.type === 'artefact-portfolio');
    const container = document.getElementById('listeArtefactsDisponibles');

    if (!container) return;

    if (artefacts.length === 0) {
        container.innerHTML = '<p class="text-muted prod-italic">Aucun artefact de type "Artefact d\'un portfolio" n\'existe encore. Crée-les d\'abord.</p>';
        return;
    }

    container.innerHTML = artefacts.map(art => `
        <label style="display: block; padding: 8px; margin-bottom: 5px; 
               background: var(--bleu-tres-pale); border-radius: 4px; cursor: pointer;">
            <input type="checkbox" name="artefactPortfolio" value="${art.id}"
                   class="u-mr-10">
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
async function mettreAJourPonderationTotale() {
    const productions = await db.get('productions') || [];

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
async function afficherToutesLesProductionsParType() {
    const container = document.getElementById('vueProductionsParType');
    if (!container) return;

    const productions = await db.get('productions') || [];
    const grilles = await db.get('grillesTemplates') || [];

    if (productions.length === 0) {
        container.innerHTML = `
            <div class="production-vide">
                <p>Aucune production définie</p>
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
                <div class="production-compact-header">
                    <div class="prod-flex-1">
                        <div class="production-compact-titre">
                            ${estPortfolio ? '📁 ' : ''}${echapperHtml(prod.titre)}${prod.description ? ' - ' + echapperHtml(prod.description) : ''}
                        </div>
                        <div class="production-compact-meta">
                            ${getTypeLabel(prod.type)}
                            ${!estArtefact ? `<span class="production-separateur">•</span>
                            <strong class="production-ponderation">${prod.ponderation}%</strong>` : ''}
                            ${!estPortfolio && nomGrille !== 'Aucune grille' ? `<span class="production-separateur">•</span>
                            ${echapperHtml(nomGrille)}` : ''}
                        </div>
                        ${estPortfolio && prod.artefactsIds && prod.artefactsIds.length > 0 ? `
                            <div class="production-compact-meta u-mt-6">
                                📦 ${prod.artefactsIds.length} artefacts • ${prod.regles.nombreARetenir} à retenir • Min. ${prod.regles.minimumCompletion} complétés
                            </div>
                        ` : ''}
                        ${prod.objectif || prod.tache ? `
                            <div class="production-compact-meta u-mt-6">
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
                    <span class="prod-texte-secondaire">
                        ${portfolio ? '1 portfolio' : ''}${portfolio && artefacts.length > 0 ? ' · ' : ''}${artefacts.length > 0 ? `${artefacts.length} artefact${artefacts.length > 1 ? 's' : ''}` : ''}
                    </span>
                </summary>
                <div class="prod-p-15">
                    ${portfolio ? genererHtmlProduction(portfolio, 0, 1) : ''}
                    ${artefacts.map((art, idx) => genererHtmlProduction(art, idx, artefacts.length)).join('')}
                    ${!portfolio ? `
                        <button class="btn btn-confirmer" onclick="ajouterProductionAuType('portfolio')" class="u-mt-10">
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
                    <span class="prod-texte-secondaire">
                        ${sommatives.length} évaluation${sommatives.length > 1 ? 's' : ''}
                    </span>
                </summary>
                <div class="prod-p-15">
                    ${sommatives.map((prod, idx) => genererHtmlProduction(prod, idx, sommatives.length)).join('')}
                    <button class="btn btn-confirmer" onclick="ajouterProductionAuType('examen')" class="u-mt-10">
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
                    <span class="prod-texte-secondaire">
                        ${formatives.length} évaluation${formatives.length > 1 ? 's' : ''}
                    </span>
                </summary>
                <div class="prod-p-15">
                    ${formatives.map((prod, idx) => genererHtmlProduction(prod, idx, formatives.length)).join('')}
                    <button class="btn btn-confirmer" onclick="ajouterProductionAuType('examen-formatif')" class="u-mt-10">
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
async function ajouterProductionAuType(type) {
    // Ouvrir le formulaire d'ajout
    await afficherFormProduction(null);

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
/**
 * Migration des productions existantes vers le système de bibliothèque
 * ✅ AJOUT (8 décembre 2025) : Support système bibliothèque avec sidebar
 *
 * Ajoute le flag dansBibliotheque: true à toutes les productions existantes
 * qui n'ont pas encore ce flag (migration une seule fois)
 */
async function migrerProductionsVersBibliotheque() {
    const productions = await db.get('productions') || [];

    let nbMigrees = 0;
    productions.forEach(prod => {
        if (prod.dansBibliotheque === undefined) {
            prod.dansBibliotheque = true;
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        await db.set('productions', productions);
        console.log(`✅ Migration bibliothèque: ${nbMigrees} production(s) ajoutée(s) à la bibliothèque`);
    }
}

function initialiserModuleProductions() {
    console.log('Initialisation du module Productions');

    // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
    migrerProductionsVersBibliotheque();

    // ✅ CORRECTION (8 décembre 2025) : Afficher la sidebar sans condition
    // comme pour les autres sections (Cours, Grilles, Échelles, Cartouches)
    const container = document.getElementById('sidebarListeProductions');
    console.log('[Productions] Container trouvé:', !!container);
    if (container) {
        console.log('[Productions] Appel afficherListeProductions()');
        afficherListeProductions();
    } else {
        console.log('[Productions] ⚠️ Container sidebarListeProductions non trouvé au chargement');
    }

    // Afficher aussi l'ancienne vue si on est sur la page productions
    const sousSection = document.querySelector('#materiel-productions');
    if (sousSection && sousSection.classList.contains('active')) {
        afficherTableauProductions();
        mettreAJourPonderationTotale();
    }

    // Pas d'événements globaux à attacher pour l'instant
    // Les événements sont gérés via les attributs onclick dans le HTML

    console.log('✅ Module Productions initialisé avec layout sidebar (Beta 80.5)');
}

/* ===============================
   GESTIONNAIRE DE BIBLIOTHÈQUE
   ✅ AJOUT (8 décembre 2025)
   =============================== */

/**
 * Affiche le modal gestionnaire de bibliothèque de productions
 * Permet d'ajouter/retirer des productions de la sidebar
 *
 * SECTIONS:
 * 1. Productions dans ma sélection (avec bouton "Retirer")
 * 2. Productions disponibles à ajouter (bibliothèque + productions retirées)
 */
async function afficherBibliothequeProductions() {
    // Vérifier que PRODUCTIONS_BIBLIOTHEQUE existe
    if (!window.PRODUCTIONS_BIBLIOTHEQUE) {
        alert('❌ Erreur : La bibliothèque de productions n\'est pas chargée.\n\nVérifiez que le fichier productions-bibliotheque.js est bien chargé.');
        return;
    }

    // Récupérer les productions existantes de l'utilisateur
    const productionsUtilisateur = await db.get('productions') || [];

    // Séparer productions dans sélection vs retirées
    const productionsDansSelection = productionsUtilisateur.filter(p => p.dansBibliotheque !== false);
    const productionsRetirees = productionsUtilisateur.filter(p => p.dansBibliotheque === false);

    // Construire le HTML du modal
    let modalHTML = `
        <div id="modalBibliothequeProductions" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 8px;
                padding: 30px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                position: relative;
            ">
                <!-- Bouton X sticky -->
                <button onclick="fermerModalBibliothequeProductions()" style="
                    position: sticky;
                    top: 0;
                    right: 0;
                    float: right;
                    background: transparent;
                    border: none;
                    font-size: 28px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                " onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">
                    ×
                </button>
                <h2 style="margin-top: 0; color: #2c3e50;">Bibliothèque de productions</h2>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    Gérez les productions affichées dans la barre latérale.
                </p>
    `;

    // SECTION 1 : Productions dans ma sélection
    if (productionsDansSelection.length > 0) {
        modalHTML += `
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Productions dans votre sélection (${productionsDansSelection.length})
                </h3>
                <div style="margin-bottom: 30px;">`;

        productionsDansSelection.forEach(prod => {
            const typeLabel = getTypeLabel(prod.type);
            modalHTML += `
                <div style="
                    border: 1px solid var(--bleu-clair);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: var(--bleu-tres-pale);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 4px;">
                                ${prod.titre} ${prod.description ? '- ' + prod.description : ''}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 4px;">
                                Type: ${typeLabel} • Pondération: ${prod.ponderation}%
                            </div>
                            ${prod.objectif ? `<div style="color: #95a5a6; font-size: 0.85em;">Objectif: ${prod.objectif}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button
                                onclick="partagerProduction('${prod.id}')"
                                class="btn btn-secondaire btn-tres-compact"
                                title="Partager avec la communauté">
                                Partager
                            </button>
                            <button
                                onclick="retirerProductionDeBibliotheque('${prod.id}')"
                                class="btn btn-supprimer btn-tres-compact"
                                title="Retirer de votre sélection">
                                Retirer
                            </button>
                        </div>
                    </div>
                </div>`;
        });

        modalHTML += `</div>`;
    }

    // Bouton "Partager toutes mes productions" après la Section 1
    modalHTML += `
                <div style="margin-top: 15px; text-align: center;">
                    <button onclick="exporterProductions()" class="btn btn-secondaire">
                        Partager toutes mes productions
                    </button>
                </div>
    `;

    // SECTION 2 : Productions disponibles
    // Obtenir toutes les productions de la bibliothèque
    const toutesProductionsBibliotheque = obtenirToutesLesProductionsBibliotheque();

    // Combiner avec les productions retirées
    const toutesProductionsDisponibles = [...toutesProductionsBibliotheque, ...productionsRetirees];

    // Obtenir la liste des disciplines disponibles
    const disciplinesSet = new Set();
    toutesProductionsDisponibles.forEach(prod => {
        if (!productionsDansSelection.find(p => p.id === prod.id)) {
            disciplinesSet.add(prod.discipline || 'Autres');
        }
    });
    const disciplinesDisponibles = Array.from(disciplinesSet).sort();

    modalHTML += `
                <h3 style="color: #3498db; font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Productions disponibles à ajouter
                </h3>

                <!-- Filtre par discipline -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">
                        Filtrer par discipline :
                    </label>
                    <select id="filtreDisciplineProductions" onchange="filtrerProductionsParDiscipline()" class="controle-form" style="max-width: 300px;">
                        <option value="">Toutes les disciplines</option>
                        ${disciplinesDisponibles.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>

                <div id="listeProductionsDisponibles" style="margin-bottom: 20px;">
    `;

    // Grouper par discipline
    const parDiscipline = {};
    toutesProductionsDisponibles.forEach(prod => {
        // Vérifier si déjà dans la sélection
        if (productionsDansSelection.find(p => p.id === prod.id)) {
            return;
        }

        const discipline = prod.discipline || 'Autres';
        if (!parDiscipline[discipline]) {
            parDiscipline[discipline] = [];
        }
        parDiscipline[discipline].push(prod);
    });

    // Afficher par discipline
    Object.keys(parDiscipline).sort().forEach(discipline => {
        modalHTML += `
                    <h4 style="color: #555; font-size: 0.95rem; margin-top: 15px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                        ${discipline}
                    </h4>
        `;

        parDiscipline[discipline].forEach(prod => {
            const typeLabel = getTypeLabel(prod.type);
            const estRetiree = productionsRetirees.find(p => p.id === prod.id);
            const badgeRetiree = estRetiree
                ? '<span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; margin-left: 8px;">Retirée</span>'
                : '';

            modalHTML += `
                <div class="production-disponible-item" data-discipline="${prod.discipline || 'Autres'}" style="
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: white;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 4px;">
                                ${prod.titre} ${prod.description ? '- ' + prod.description : ''}
                                ${badgeRetiree}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 4px;">
                                Type: ${typeLabel} • Pondération: ${prod.ponderation}%
                                ${prod.auteur ? ` • Par ${prod.auteur}` : ''}
                            </div>
                            ${prod.objectif ? `<div style="color: #95a5a6; font-size: 0.85em;">Objectif: ${prod.objectif}</div>` : ''}
                        </div>
                        <button
                            onclick="ajouterProductionIndividuelle('${prod.id}')"
                            class="btn btn-confirmer btn-tres-compact"
                            title="Ajouter cette production à votre sélection">
                            Ajouter à ma sélection
                        </button>
                    </div>
                </div>`;
        });
    });

    modalHTML += `
                </div>

                <!-- Bouton "Ajouter des productions" après la Section 2 -->
                <div style="margin-top: 15px; text-align: center;">
                    <button onclick="document.getElementById('fichier-import-productions-modal').click()" class="btn btn-secondaire">
                        Ajouter des productions
                    </button>
                    <input type="file" id="fichier-import-productions-modal" accept=".json" style="display: none;" onchange="importerProductions(event)">
                </div>
            </div>
        </div>
    `;

    // Ajouter le modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Ajoute une production individuelle à la bibliothèque (ma sélection)
 */
async function ajouterProductionIndividuelle(id) {
    try {
        const productions = await db.get('productions') || [];
        const prod = productions.find(p => p.id === id);

        if (!prod) {
            alert('Production introuvable');
            return;
        }

        // Marquer comme dans la bibliothèque
        prod.dansBibliotheque = true;

        // Sauvegarder
        await db.set('productions', productions);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherBibliothequeProductions();

        alert('Production ajoutée à votre sélection avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de la production');
    }
}

/**
 * Partage une production avec la communauté
 * Demande les métadonnées CC enrichies et marque la production comme partagée
 */
async function partagerProduction(id) {
    try {
        const productions = await db.get('productions') || [];
        const prod = productions.find(p => p.id === id);

        if (!prod) {
            alert('Production introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const metadata = await demanderMetadonneesEnrichies('production', prod.titre);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagée (retirer de ma sélection)
        prod.dansBibliotheque = false;

        // Ajouter métadonnées CC
        prod.metadata_cc = metadata;

        // Sauvegarder
        await db.set('productions', productions);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherBibliothequeProductions();

        alert('Production partagée avec succès !\n\nElle est maintenant disponible dans la section "Productions disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage de la production');
    }
}

/**
 * Retire une production de la bibliothèque (soft delete)
 */
async function retirerProductionDeBibliotheque(id) {
    if (!confirm('Retirer cette production de votre sélection ?\n\nElle ne sera plus affichée dans la barre latérale mais restera disponible dans le gestionnaire.')) {
        return;
    }

    try {
        const productions = await db.get('productions') || [];
        const production = productions.find(p => p.id === id);

        if (!production) {
            throw new Error('Production introuvable');
        }

        production.dansBibliotheque = false;

        await db.set('productions', productions);

        console.log('✅ Production retirée de la sélection:', id);

        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        await afficherListeProductions();

    } catch (error) {
        console.error('Erreur lors du retrait:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Ajoute les productions sélectionnées à la bibliothèque
 */
async function ajouterProductionsABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeProductionsDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Veuillez sélectionner au moins une production à ajouter.');
        return;
    }

    try {
        const productions = await db.get('productions') || [];
        let ajoutees = 0;

        checkboxes.forEach(checkbox => {
            const id = checkbox.value;
            const productionData = JSON.parse(checkbox.dataset.production);

            // Vérifier si la production existe déjà
            const prodExistante = productions.find(p => p.id === id);
            if (prodExistante) {
                // Réactiver si elle était retirée
                if (prodExistante.dansBibliotheque === false) {
                    prodExistante.dansBibliotheque = true;
                    ajoutees++;
                    console.log(`✅ Réajoutée à la sélection : ${prodExistante.titre}`);
                } else {
                    console.log(`Production déjà dans la sélection : ${id}`);
                }
            } else {
                // Ajouter nouvelle production de la bibliothèque
                productions.push({
                    ...productionData,
                    dansBibliotheque: true
                });
                ajoutees++;
                console.log(`✅ Ajoutée à la sélection : ${productionData.titre}`);
            }
        });

        await db.set('productions', productions);

        console.log(`✅ ${ajoutees} production(s) ajoutée(s) à la sélection`);

        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherTableauProductions();
        await mettreAJourPonderationTotale();

        if (ajoutees > 0) {
            alert(`${ajoutees} production(s) ajoutée(s) avec succès !`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Filtre les productions disponibles par discipline
 * ✅ AJOUT (8 décembre 2025)
 */
function filtrerProductionsParDiscipline() {
    const select = document.getElementById('filtreDisciplineProductions');
    const disciplineSelectionnee = select ? select.value : '';

    const items = document.querySelectorAll('.production-disponible-item');
    const titresDisciplines = document.querySelectorAll('#listeProductionsDisponibles h4');

    if (!disciplineSelectionnee) {
        // Afficher tout
        items.forEach(item => item.style.display = 'block');
        titresDisciplines.forEach(titre => titre.style.display = 'block');
    } else {
        // Filtrer par discipline
        items.forEach(item => {
            const discipline = item.dataset.discipline;
            item.style.display = discipline === disciplineSelectionnee ? 'block' : 'none';
        });

        // Afficher/cacher les titres de discipline selon le filtre
        titresDisciplines.forEach(titre => {
            const disciplineTitre = titre.textContent.trim();
            titre.style.display = disciplineTitre === disciplineSelectionnee ? 'block' : 'none';
        });
    }
}

/**
 * Ferme le modal bibliothèque
 */
function fermerModalBibliothequeProductions() {
    const modal = document.getElementById('modalBibliothequeProductions');
    if (modal) {
        modal.remove();
    }
}

/* ===============================
   EXPORT/IMPORT AVEC LICENCE CC
   =============================== */

/**
 * Exporte les productions avec métadonnées Creative Commons
 * Les exports incluent uniquement la structure des productions,
 * JAMAIS les données d'étudiants ou les évaluations individuelles
 *
 * FONCTIONNEMENT:
 * 1. Charge toutes les productions depuis localStorage
 * 2. Ajoute métadonnées CC BY-NC-SA 4.0 (auteur, licence, version)
 * 3. Génère nom de fichier avec watermark CC
 * 4. Télécharge le fichier JSON
 *
 * FORMAT EXPORT:
 * {
 *   metadata: { licence, auteur_original, version, date, ... },
 *   contenu: { productions: [...] }
 * }
 */
async function exporterProductions() {
    const productions = await db.get('productions') || [];

    if (productions.length === 0) {
        alert('Aucune production à exporter.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Productions pédagogiques',
        `${productions.length} production(s)`
    );

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { productions: productions },
        'productions',
        'Productions pédagogiques',
        metaEnrichies
    );

    // Générer nom de fichier avec watermark CC
    const nomFichier = genererNomFichierCC(
        'productions',
        'Productions-pedagogiques',
        donnees.metadata.version
    );

    // Télécharger
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Productions exportées avec licence CC BY-NC-SA 4.0');
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${productions.length} production(s) exportée(s) avec succès`);
    }
}

/**
 * Exporte la production actuellement en cours d'édition
 */
async function exporterProductionActive() {
    // Récupérer l'ID de la production depuis le sidebar actif
    const itemActif = document.querySelector('.sidebar-item.active');
    if (!itemActif) {
        alert('Aucune production sélectionnée à exporter.');
        return;
    }

    const productionId = itemActif.getAttribute('data-id');
    if (!productionId) {
        alert('Impossible de déterminer la production à exporter.');
        return;
    }

    const productions = await db.get('productions') || [];
    const production = productions.find(p => p.id === productionId);

    if (!production) {
        alert('Production introuvable.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Production pédagogique',
        production.description || production.titre || 'Production'
    );

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...production };

    // Si la production a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (production.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Vous allez exporter un matériel créé par ' + production.metadata_cc.auteur_original + '.\n\n' +
            'Entrez votre nom pour être crédité comme contributeur :\n' +
            '(Laissez vide si vous n\'avez fait aucune modification)'
        );

        if (nomUtilisateur && nomUtilisateur.trim()) {
            // Ajouter le contributeur
            const contributeurs = production.metadata_cc.contributeurs || [];
            contributeurs.push({
                nom: nomUtilisateur.trim(),
                date: new Date().toISOString().split('T')[0],
                modifications: 'Modifications et adaptations'
            });

            // Créer les métadonnées enrichies
            contenuExport.metadata_cc = {
                ...production.metadata_cc,
                contributeurs: contributeurs
            };
        }
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(
        contenuExport,
        'production',
        production.description || production.titre || 'Production',
        metaEnrichies
    );

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nomFichier = (production.description || production.titre || 'production').replace(/[^a-z0-9]/gi, '-');
    a.download = `production-${nomFichier}-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Production exportée avec licence CC BY-NC-SA 4.0');
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Production "${production.description || production.titre}" exportée avec succès`);
    }
}

/**
 * Importe un fichier JSON pour remplacer la production actuellement en cours d'édition
 * NOUVEAU (Beta 92): Support métadonnées Creative Commons
 */
async function importerDansProductionActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Récupérer l'ID de la production active
    const itemActif = document.querySelector('.sidebar-item.active');
    if (!itemActif) {
        alert('Aucune production sélectionnée. Veuillez d\'abord sélectionner une production à remplacer.');
        event.target.value = ''; // Reset input
        return;
    }

    const productionId = itemActif.getAttribute('data-id');
    if (!productionId) {
        alert('Impossible de déterminer la production à remplacer.');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Valider que c'est bien une production
            if (!donnees || typeof donnees !== 'object') {
                alert('Le fichier JSON n\'est pas valide.');
                event.target.value = '';
                return;
            }

            // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata CC)
            let productionImportee;
            let metadata = null;

            if (donnees.contenu) {
                // Nouveau format avec CC metadata
                metadata = donnees.metadata;
                productionImportee = donnees.contenu;
            } else {
                // Ancien format direct
                productionImportee = donnees;
            }

            // Afficher badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `📋 Matériel sous licence ${metadata.licence}\n` +
                    `👤 Auteur: ${metadata.auteur_original}\n` +
                    `📅 Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `⚠️ ATTENTION: Cette action va remplacer la production actuelle.\n\n` +
                `Voulez-vous continuer ?`
            );

            if (!confirmation) {
                console.log('Import annulé par l\'utilisateur');
                event.target.value = '';
                return;
            }

            // Récupérer les productions
            const productions = await db.get('productions') || [];
            const index = productions.findIndex(p => p.id === productionId);

            if (index === -1) {
                alert('Production introuvable.');
                event.target.value = '';
                return;
            }

            // Préserver l'ID original et remplacer les données
            const productionMiseAJour = {
                ...productionImportee,
                id: productionId // Garder l'ID original
            };

            // Préserver les métadonnées CC si présentes
            if (metadata) {
                productionMiseAJour.metadata_cc = metadata;
            }

            // Remplacer dans le tableau
            productions[index] = productionMiseAJour;

            // Sauvegarder
            await db.set('productions', productions);

            // Recharger la production dans le formulaire
            await afficherFormProduction(productionId);

            // Rafraîchir la liste
            await afficherListeProductions();

            console.log('✅ Production importée et remplacée avec succès');
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Production importée et remplacée avec succès');
            } else {
                alert('Production importée et remplacée avec succès !');
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assurez-vous qu\'il s\'agit d\'un fichier valide.');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    reader.readAsText(file);
}

/**
 * Importe des productions depuis un fichier JSON avec gestion CC
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Vérifie et affiche la licence CC (si présente)
 * 3. Valide la structure des données
 * 4. Fusionne avec productions existantes
 * 5. Rafraîchit l'interface
 *
 * GESTION LICENCE:
 * - Affiche badge CC si licence présente
 * - Avertit si pas de licence (droit d'auteur classique)
 * - Demande confirmation avant import
 *
 * @param {Event} event - Événement de changement du file input
 */
function importerProductions(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            let message = estCC ?
                '<div style="margin-bottom: 15px;">' + genererBadgeCC(donnees.metadata) + '</div>' :
                '';

            message += '<p><strong>Voulez-vous importer ces productions ?</strong></p>';

            // Créer modal avec badge CC
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                        ${message}
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn" onclick="this.closest('div[style*=fixed]').parentElement.remove()">Annuler</button>
                            <button class="btn btn-confirmer" onclick="window.confirmerImportProductions(${JSON.stringify(donnees).replace(/"/g, '&quot;')}); this.closest('div[style*=fixed]').parentElement.remove()">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Avertir si pas de licence CC
            if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les productions
 * Fonction helper appelée depuis le modal de confirmation
 * PHASE 3.3: Détection de dépendances manquantes (Beta 91)
 */
window.confirmerImportProductions = async function(donnees) {
    try {
        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        let productionsImportees;

        if (donnees.contenu) {
            // Nouveau format avec CC metadata
            if (donnees.contenu.productions) {
                // Batch export: { metadata, contenu: { productions: [...] } }
                productionsImportees = donnees.contenu.productions;
            } else {
                // Individual export: { metadata, contenu: { ...production... } }
                // Préserver metadata_cc dans la production
                const production = { ...donnees.contenu };
                production.metadata_cc = donnees.metadata;
                productionsImportees = [production];
            }
        } else {
            // Ancien format direct
            productionsImportees = donnees.productions || [donnees];
        }

        if (!Array.isArray(productionsImportees)) {
            throw new Error('Format invalide: productions doit être un tableau');
        }

        // PHASE 3.3: Détecter les dépendances manquantes (grilles référencées)
        const grillesExistantes = await db.get('grillesTemplates') || [];
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        const grillesManquantes = [];

        productionsImportees.forEach(prod => {
            if (prod.grilleId && !idsGrillesExistants.has(prod.grilleId)) {
                // Grille manquante détectée
                if (!grillesManquantes.includes(prod.grilleId)) {
                    grillesManquantes.push(prod.grilleId);
                }
            }
        });

        // Avertir l'utilisateur si des dépendances manquent
        if (grillesManquantes.length > 0) {
            const nbGrillesManquantes = grillesManquantes.length;
            const message = `⚠️ Attention : ${nbGrillesManquantes} grille(s) de critères manquante(s)\n\n` +
                `Les productions importées font référence à des grilles qui n'existent pas encore dans votre système.\n\n` +
                `Grilles manquantes :\n${grillesManquantes.map(id => `  • ${id}`).join('\n')}\n\n` +
                `Vous pouvez continuer l'import, mais ces productions ne fonctionneront correctement qu'après avoir importé les grilles manquantes.\n\n` +
                `Continuer quand même ?`;

            if (!confirm(message)) {
                console.log('Import annulé par l\'utilisateur (dépendances manquantes)');
                return;
            }

            console.log(`⚠️ Import avec ${nbGrillesManquantes} dépendance(s) manquante(s):`, grillesManquantes);
        }

        // Charger productions existantes
        const productionsExistantes = await db.get('productions') || [];

        // Fusionner (remplacer si même ID, sinon ajouter)
        productionsImportees.forEach(prod => {
            // ✅ AJOUT (8 décembre 2025) : Productions importées vont dans la bibliothèque, pas dans la sidebar automatiquement
            if (prod.dansBibliotheque === undefined) {
                prod.dansBibliotheque = false;
            }

            const index = productionsExistantes.findIndex(p => p.id === prod.id);
            if (index >= 0) {
                productionsExistantes[index] = prod;
            } else {
                productionsExistantes.push(prod);
            }
        });

        // Sauvegarder
        await db.set('productions', productionsExistantes);

        // ✅ MODIFICATION (8 décembre 2025) : Rafraîchir sidebar et tableau
        if (typeof afficherListeProductions === 'function') {
            await afficherListeProductions();
        }
        if (typeof afficherTableauProductions === 'function') {
            await afficherTableauProductions();
        }

        // Message informatif sur la bibliothèque
        alert(`Import réussi !\n\n${productionsImportees.length} production(s) importée(s) dans la bibliothèque.\n\nUtilisez "Consulter la bibliothèque" pour les ajouter à la barre latérale.`);
        console.log('✅ Productions importées:', productionsImportees.length);

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

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

// Export/Import avec licence CC
window.exporterProductions = exporterProductions;
window.exporterProductionActive = exporterProductionActive;
window.importerDansProductionActive = importerDansProductionActive;
window.importerProductions = importerProductions;

// Nouvelles fonctions sidebar (Beta 80.5+)
window.afficherListeProductions = afficherListeProductions;
// window.filtrerListeProductions = filtrerListeProductions; // Fonction commentée (Beta 92)
window.chargerProductionPourModif = chargerProductionPourModif;
window.creerNouvelleProduction = creerNouvelleProduction;
window.dupliquerProduction = dupliquerProduction;
window.dupliquerProductionActive = dupliquerProductionActive;
window.supprimerProductionActive = supprimerProductionActive;
window.chargerGrillesDisponiblesPourProduction = chargerGrillesDisponiblesPourProduction;

// Gestionnaire de bibliothèque (Beta 93)
window.afficherBibliothequeProductions = afficherBibliothequeProductions;
window.retirerProductionDeBibliotheque = retirerProductionDeBibliotheque;
window.ajouterProductionsABibliotheque = ajouterProductionsABibliotheque;
window.filtrerProductionsParDiscipline = filtrerProductionsParDiscipline;
window.fermerModalBibliothequeProductions = fermerModalBibliothequeProductions;

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
async function afficherListeProductions(filtreType = '') {
    const productions = await db.get('productions') || [];
    const grilles = await db.get('grillesTemplates') || [];
    const container = document.getElementById('sidebarListeProductions');

    console.log('[Productions] Total productions:', productions.length);
    console.log('[Productions] Productions détails:', productions.map(p => ({
        description: p.description,
        dansBibliotheque: p.dansBibliotheque
    })));

    if (!container) {
        console.log('[Productions] ⚠️ Container sidebarListeProductions introuvable');
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les productions dans la bibliothèque
    const productionsDansBibliotheque = productions.filter(p => p.dansBibliotheque !== false);
    console.log('[Productions] Dans bibliothèque:', productionsDansBibliotheque.length);

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

    if (productionsFiltrees.length === 0) {
        container.innerHTML = '<p class="text-muted text-italic" style="font-size: 0.9rem; text-align: center; padding: 20px 10px;">Créez une nouvelle production ou puisez dans la bibliothèque</p>';
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
 * DÉSACTIVÉ : Filtre retiré de l'interface (Beta 92)
 */
/*
function filtrerListeProductions() {
    const select = document.getElementById('filtreTypeProduction');
    if (!select) return;

    const filtreType = select.value;
    afficherListeProductions(filtreType);
}
*/

/**
 * Charge une production pour modification dans le formulaire
 * Appelée par le clic sur un item de la sidebar
 */
async function chargerProductionPourModif(id) {
    console.log('🔄 chargerProductionPourModif appelée avec ID:', id);

    // Masquer le message d'accueil
    const accueil = document.getElementById('accueilProductions');
    if (accueil) accueil.style.display = 'none';

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.style.display = 'block';

    // Note: Section optionsImportExportProductions supprimée (Beta 92)
    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    // Note: Export/Import se font maintenant via la bibliothèque
    const btnDupliquer = document.getElementById('btnDupliquerProduction');
    const btnSupprimer = document.getElementById('btnSupprimerProduction');
    if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
    if (btnSupprimer) btnSupprimer.style.display = 'inline-block';

    // Appeler afficherFormProduction pour charger les données
    await afficherFormProduction(id);

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
    if (accueil) accueil.style.display = 'none';

    // Afficher le formulaire
    const formulaire = document.getElementById('formulaireProduction');
    if (formulaire) formulaire.style.display = 'block';

    // Note: Section optionsImportExportProductions supprimée (Beta 92)
    // Cacher les boutons Dupliquer et Supprimer (mode création)
    // Note: Export/Import se font maintenant via la bibliothèque
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

    // Charger les grilles disponibles (avec petit délai pour laisser le DOM se mettre à jour)
    setTimeout(async () => {
        await chargerGrillesDisponiblesPourProduction();
    }, 50);
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
    const grilles = db.getSync('grillesTemplates', []);

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
 * Charge les grilles disponibles dans les selects de production
 * (Fonction helper pour éviter la duplication de code)
 * NOTE: Renommée pour éviter conflit avec chargerGrillesDisponibles() de pratiques.js
 */
async function chargerGrillesDisponiblesPourProduction() {
    const grilles = await db.get('grillesTemplates') || [];
    const selectStandard = document.getElementById('productionGrille');
    const selectInline = document.getElementById('productionGrilleInline');

    console.log('📋 chargerGrillesDisponiblesPourProduction appelée');
    console.log('   - Nombre de grilles:', grilles.length);
    console.log('   - selectStandard trouvé?', !!selectStandard);
    console.log('   - selectInline trouvé?', !!selectInline);

    if (!selectStandard && !selectInline) {
        console.warn('⚠️ Aucun sélecteur de grille trouvé!');
        return;
    }

    const optionsHtml = '<option value="">Aucune</option>' +
        grilles.map(g => `<option value="${g.id}">${g.nom}</option>`).join('');

    if (selectStandard) {
        selectStandard.innerHTML = optionsHtml;
        console.log('✅ Grilles chargées dans selectStandard');
    }

    if (selectInline) {
        selectInline.innerHTML = optionsHtml;
        console.log('✅ Grilles chargées dans selectInline');
    }
}

/**
 * Duplique une production existante
 *
 * @param {string} id - ID de la production à dupliquer
 */
async function dupliquerProduction(id) {
    const productions = await db.get('productions') || [];
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
    await db.set('productions', productions);

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

    alert(`Production "${copie.description}" dupliquée avec succès`);
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

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
        return;
    }

    let productions = await db.get('productions') || [];
    productions = productions.filter(e => e.id !== productionEnEdition);

    await db.set('productions', productions);

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
 * Adapte la fonction sauvegarderProduction existante pour le nouveau layout
 * Cette fonction override la fonction originale pour ajouter le support sidebar
 */
const sauvegarderProductionOriginale = window.sauvegarderProduction;
window.sauvegarderProduction = async function() {
    // Appeler la fonction originale
    if (typeof sauvegarderProductionOriginale === 'function') {
        await sauvegarderProductionOriginale();
    }

    // Recharger la sidebar
    await afficherListeProductions();

    // Mettre à jour les métriques
    const id = window.productionEnCoursEdition;
    if (id) {
        const productions = await db.get('productions') || [];
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
window.supprimerProduction = async function(id) {
    if (!confirm('Supprimer cette production ?')) return;

    const productions = await db.get('productions') || [];
    const index = productions.findIndex(p => p.id === id);

    if (index === -1) return;

    productions.splice(index, 1);
    await db.set('productions', productions);

    // Recharger la sidebar
    await afficherListeProductions();

    // Masquer le formulaire si c'était la production affichée
    if (window.productionEnCoursEdition === id) {
        annulerFormProduction();
    }

    alert('Production supprimée');
};