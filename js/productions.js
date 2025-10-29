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

    // Afficher le formulaire et cacher le bouton d'ajout
    form.style.display = 'block';
    btnAjouter.style.display = 'none';

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
            titre.textContent = 'Modifier l\'évaluation';
            btnTexte.textContent = 'Sauvegarder';

            document.getElementById('productionTitre').value = prod.titre;
            document.getElementById('productionDescription').value = prod.description || '';
            document.getElementById('productionType').value = prod.type;
            document.getElementById('productionPonderation').value = prod.ponderation;
            if (selectGrille) selectGrille.value = prod.grilleId || '';
            document.getElementById('productionObjectif').value = prod.objectif || '';
            document.getElementById('productionTache').value = prod.tache || '';

            // Gérer l'affichage des champs spécifiques au type
            gererChangementTypeProduction();

            // Si c'est un portfolio, charger les règles
            if (prod.type === 'portfolio' && prod.regles) {
                document.getElementById('portfolioNombreRetenir').value = prod.regles.nombreARetenir || 3;
                document.getElementById('portfolioMinimumCompleter').value = prod.regles.minimumCompletion || 7;
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
        titre.textContent = 'Nouvelle production';
        btnTexte.textContent = 'Ajouter';

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
    const grilleId = document.getElementById('productionGrille') ? 
        document.getElementById('productionGrille').value : '';

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
        const nombreRetenir = document.getElementById('portfolioNombreRetenir');
        const minimumCompleter = document.getElementById('portfolioMinimumCompleter');
        const nombreTotal = document.getElementById('portfolioNombreTotal');  // ← NOUVEAU
        
        productionData.regles = {
            nombreARetenir: nombreRetenir ? parseInt(nombreRetenir.value) : 3,
            minimumCompletion: minimumCompleter ? parseInt(minimumCompleter.value) : 7,
            nombreTotal: nombreTotal ? parseInt(nombreTotal.value) : 9  // ← NOUVEAU
        };
        // Pas besoin de stocker artefactsIds - sera détecté dynamiquement
        productionData.modeCalcul = 'provisoire';
    }

    if (productionEnEdition) {
        // Modifier la production existante
        const index = evaluations.findIndex(e => e.id === productionEnEdition);
        if (index !== -1) {
            evaluations[index] = {
                ...evaluations[index],
                ...productionData
            };
        }
    } else {
        // Ajouter nouvelle production
        productionData.id = 'PROD' + Date.now();
        evaluations.push(productionData);
    }

    localStorage.setItem('productions', JSON.stringify(evaluations));

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
    document.getElementById('formulaireProduction').style.display = 'none';
    // Réafficher le bouton d'ajout
    document.getElementById('btnajouterProduction').style.display = 'inline-block';
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
    const divPonderation = document.getElementById('productionPonderation').parentElement;
    const divGrille = document.getElementById('productionGrille') ? 
        document.getElementById('productionGrille').parentElement : null;
    const msgPonderation = document.getElementById('msgPonderationArtefact');

    // Réinitialiser tout d'abord
    if (champsPortfolio) champsPortfolio.style.display = 'none';
    if (divPonderation) divPonderation.style.display = 'block';
    if (divGrille) divGrille.style.display = 'block';
    if (msgPonderation) msgPonderation.style.display = 'none';

    // Appliquer selon le type
    if (type === 'portfolio') {
        // Portfolio conteneur : afficher config, masquer grille
        if (champsPortfolio) champsPortfolio.style.display = 'block';
        if (divGrille) divGrille.style.display = 'none';
    } else if (type === 'artefact-portfolio') {
        // Artefact individuel : masquer pondération, afficher message
        if (divPonderation) divPonderation.style.display = 'none';
        if (msgPonderation) msgPonderation.style.display = 'block';
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
            <strong>${art.titre}</strong>${art.description ? ' - ' + art.description : ''}
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
 * - portfolio : 📁 Portfolio (conteneur d'artefacts)
 * - artefact-portfolio : Artefact d'un portfolio
 * - autre : Autre
 */
function getTypeLabel(type) {
    const labels = {
        'examen': 'Examen',
        'travail': 'Travail écrit',
        'quiz': 'Quiz/Test',
        'presentation': 'Présentation',
        'portfolio': '📁 Portfolio (conteneur d\'artefacts)',
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
     * Fonction helper pour générer le HTML d'une production
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
        const bgColor = estPortfolio ? 'var(--bleu-carte)' : 'white';

        return `
            <div class="item-liste" style="background: ${bgColor}; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: var(--bleu-principal);">
                        ${estPortfolio ? '📁 ' : ''}${echapperHtml(prod.titre)}${prod.description ? ' - ' + echapperHtml(prod.description) : ''}
                    </strong>
                    <div style="white-space: nowrap;">
                        ${index > 0 ?
                            `<button onclick="monterEvaluation('${prod.id}')" class="btn btn-principal">↑</button>` : ''}
                        ${index < total - 1 ?
                            `<button onclick="descendreEvaluation('${prod.id}')" class="btn btn-principal">↓</button>` : ''}
                        <button onclick="modifierProduction('${prod.id || 'ERROR_NO_ID'}')" class="btn btn-modifier">Modifier</button>
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
                        <input type="text" value="${echapperHtml(nomGrille)}" class="controle-form"
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
                        ${prod.objectif ? `<p style="font-size: 0.85rem; margin-bottom: 5px;"><strong>Objectif:</strong> ${echapperHtml(prod.objectif)}</p>` : ''}
                        ${prod.tache ? `<p style="font-size: 0.85rem; margin-bottom: 0;"><strong>Tâche:</strong> ${echapperHtml(prod.tache)}</p>` : ''}
                    </div>
                ` : ''}
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
        // Afficher la nouvelle vue hiérarchique
        afficherToutesLesProductionsParType();

        // Afficher aussi l'ancienne vue (cachée) pour compatibilité
        afficherTableauProductions();
        mettreAJourPonderationTotale();
    }

    // Pas d'événements globaux à attacher pour l'instant
    // Les événements sont gérés via les attributs onclick dans le HTML

    console.log('✅ Module Productions initialisé avec nouvelle vue hiérarchique');
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