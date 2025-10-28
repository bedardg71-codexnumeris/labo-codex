/* ===============================
   MODULE 07: CARTOUCHES DE RÉTROACTION
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère les cartouches de rétroaction basées sur
   les grilles de critères et les échelles de performance.
   
   Contenu de ce module:
   - Création et gestion des cartouches
   - Matrice de commentaires (critères × niveaux)
   - Import/export de commentaires
   - Génération d'aperçus aléatoires
   - Verrouillage et duplication
   - Calcul du pourcentage de complétion
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, cartoucheActuel
   - 05-grilles.js : Pour récupérer les grilles de critères
   - 06-echelles.js : Pour récupérer les niveaux de performance
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #selectGrilleRetroaction : Select pour choisir la grille
   - #selectCartouche : Select pour choisir/créer cartouche
   - #nomCartouche : Input pour le nom
   - #contexteCartouche : Textarea pour le contexte
   - #matriceContainer : Conteneur de la matrice
   - #matriceRetroaction : Conteneur global de la matrice
   - #apercuRetroaction : Conteneur de l'aperçu
   - #exempleRetroaction : Zone d'affichage de l'aperçu
   - #listeCartouchesExistants : Conteneur liste
   - #listeCartouchesContainer : Liste des cartouches
   - #zoneImportCommentaires : Zone d'import
   - #commentairesColles : Textarea d'import
   - #nbCriteres, #nbNiveaux, #nbCommentaires, #pctComplete : Métriques
   
   LocalStorage utilisé:
   - 'cartouches_{grilleId}' : Array des cartouches par grille
   - 'grillesTemplates' : Array des grilles (lecture)
   - 'niveauxEchelle' : Array des niveaux (lecture)
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module des cartouches de rétroaction
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge les grilles dans le select
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleCartouches() {
    console.log('💬 Initialisation du module Cartouches de rétroaction');
    
    // Vérifier que nous sommes dans la bonne section
    const selectGrille = document.getElementById('selectGrilleRetroaction');
    if (!selectGrille) {
        console.log('   ⚠️  Section rétroactions non active, initialisation reportée');
        return;
    }
    
    // Charger les grilles disponibles
    chargerSelectGrillesRetroaction();
    
    console.log('   ✅ Module Cartouches initialisé');
}

/* ===============================
   📂 CHARGEMENT DES GRILLES ET CARTOUCHES
   =============================== */

/**
 * Charge les grilles de critères dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les grilles depuis localStorage
 * 2. Remplit le select avec les options
 * 
 * UTILISÉ PAR:
 * - initialiserModuleCartouches()
 * 
 * CLÉ LOCALSTORAGE:
 * - 'grillesTemplates' : Array des grilles créées dans module 05
 */
function chargerSelectGrillesRetroaction() {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const select = document.getElementById('selectGrilleRetroaction');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choisir une grille --</option>';
    grilles.forEach(grille => {
        const nomEchappe = echapperHtml(grille.nom);
        select.innerHTML += `<option value="${grille.id}">${nomEchappe}</option>`;
    });
}

/**
 * Charge les cartouches d'une grille sélectionnée
 * Appelée lors du changement de sélection dans #selectGrilleRetroaction
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'ID de la grille sélectionnée
 * 2. Si aucune grille: affiche message et masque interface
 * 3. Sinon: charge les cartouches de cette grille
 * 4. Affiche la liste des cartouches existantes
 * 5. Initialise une nouvelle cartouche par défaut
 * 
 * GÈRE:
 * - Changement d'événement sur #selectGrilleRetroaction
 */
function chargerCartouchesRetroaction() {
    const grilleId = document.getElementById('selectGrilleRetroaction').value;
    const selectCartouche = document.getElementById('selectCartouche');
    
    if (!grilleId) {
        // Aucune grille sélectionnée
        document.getElementById('aucuneEvalRetroaction').style.display = 'block';
        document.getElementById('infoCartouche').style.display = 'none';
        document.getElementById('matriceRetroaction').style.display = 'none';
        document.getElementById('apercuRetroaction').style.display = 'none';
        document.getElementById('listeCartouchesExistants').style.display = 'none';
        return;
    }
    
    // Charger les cartouches existantes pour cette grille
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    
    selectCartouche.innerHTML = '<option value="">-- Nouvelle cartouche --</option>';
    cartouches.forEach(cartouche => {
        const nomEchappe = echapperHtml(cartouche.nom);
        selectCartouche.innerHTML += `<option value="${cartouche.id}">${nomEchappe}</option>`;
    });
    
    document.getElementById('aucuneEvalRetroaction').style.display = 'none';
    document.getElementById('infoCartouche').style.display = 'block';
    
    // Afficher la liste des cartouches existantes
    if (cartouches.length > 0) {
        afficherListeCartouches(cartouches, grilleId);
        document.getElementById('listeCartouchesExistants').style.display = 'block';
    } else {
        document.getElementById('listeCartouchesExistants').style.display = 'none';
    }
    
    // Initialiser une nouvelle cartouche par défaut
    initialiserNouveauCartouche(grilleId);
}

/* ===============================
   CRÉATION ET ÉDITION DE CARTOUCHE
   =============================== */

/**
 * Initialise une nouvelle cartouche vierge
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la grille sélectionnée
 * 2. Extrait les critères de la grille
 * 3. Récupère les niveaux depuis l'échelle globale
 * 4. Crée une structure de cartouche vide
 * 5. Affiche la matrice et l'aperçu
 * 6. Met à jour les métriques
 * 
 * PARAMÈTRES:
 * @param {string} grilleId - ID de la grille de critères
 * 
 * UTILISÉ PAR:
 * - chargerCartouchesRetroaction() (création par défaut)
 * - chargerMatriceRetroaction() (si aucune cartouche sélectionnée)
 * 
 * STRUCTURE CARTOUCHE:
 * {
 *   id: string,
 *   nom: string,
 *   grilleId: string,
 *   contexte: string,
 *   criteres: Array,
 *   niveaux: Array,
 *   commentaires: Object,
 *   verrouille: boolean
 * }
 */
function initialiserNouveauCartouche(grilleId) {
    // Récupérer la grille sélectionnée
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);
    
    if (!grille) {
        alert('Grille introuvable');
        return;
    }
    
    // Les critères viennent directement de la grille
    const criteres = grille.criteres || [];
    
    // Récupérer l'échelle de performance globale
    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify([
        { code: 'I', nom: 'Incomplet', min: 0, max: 64 },
        { code: 'D', nom: 'En Développement', min: 65, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100 }
    ]));
    
    // Créer la structure de cartouche
    cartoucheActuel = {
        id: 'CART' + Date.now(),
        nom: '',
        grilleId: grilleId,
        contexte: '',
        criteres: criteres.map(c => ({ id: c.id, nom: c.nom })),
        niveaux: niveaux.map(n => ({ code: n.code, nom: n.nom })),
        commentaires: {},
        verrouille: false
    };
    
    // Réinitialiser les champs
    document.getElementById('nomCartouche').value = '';
    document.getElementById('contexteCartouche').value = '';
    
    // Afficher la matrice et l'aperçu
    afficherMatriceRetroaction();
    mettreAJourMetriques();
    document.getElementById('matriceRetroaction').style.display = 'block';
    document.getElementById('apercuRetroaction').style.display = 'block';
}

/**
 * Charge une cartouche existante pour modification
 * Appelée lors du changement de sélection dans #selectCartouche
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'ID de la cartouche sélectionnée
 * 2. Si vide: initialise une nouvelle cartouche
 * 3. Sinon: charge la cartouche depuis localStorage
 * 4. Remplit les champs (nom, contexte)
 * 5. Affiche la matrice avec les commentaires
 * 6. Calcule le pourcentage de complétion
 * 
 * GÈRE:
 * - Changement d'événement sur #selectCartouche
 */
function chargerMatriceRetroaction() {
    const grilleId = document.getElementById('selectGrilleRetroaction').value;
    const cartoucheId = document.getElementById('selectCartouche').value;
    
    if (!cartoucheId) {
        // Nouvelle cartouche
        initialiserNouveauCartouche(grilleId);
        return;
    }
    
    // Charger la cartouche existante
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    cartoucheActuel = cartouches.find(c => c.id === cartoucheId);
    
    if (cartoucheActuel) {
        // Remplir les champs
        document.getElementById('nomCartouche').value = cartoucheActuel.nom;
        document.getElementById('contexteCartouche').value = cartoucheActuel.contexte || '';
        
        // Afficher la matrice
        afficherMatriceRetroaction();
        calculerPourcentageComplete();
        
        document.getElementById('matriceRetroaction').style.display = 'block';
        document.getElementById('apercuRetroaction').style.display = 'block';
    }
}

/* ===============================
   AFFICHAGE DE LA MATRICE
   =============================== */

/**
 * Affiche la matrice des commentaires (critères × niveaux)
 * 
 * FONCTIONNEMENT:
 * 1. Génère un tableau HTML
 * 2. En-tête: niveaux de performance
 * 3. Lignes: critères
 * 4. Cellules: textarea éditable pour chaque commentaire
 * 5. Clé unique: critereId_niveauCode
 * 
 * UTILISÉ PAR:
 * - initialiserNouveauCartouche()
 * - chargerMatriceRetroaction()
 * - importerCommentaires()
 * 
 * FORMAT CLÉS:
 * - Clé commentaire: "CRIT001_E" (critère + niveau)
 * - Stocké dans cartoucheActuel.commentaires
 * 
 * TABLEAU:
 * - Position sticky pour en-têtes (scroll horizontal)
 * - Textarea avec onchange pour sauvegarde auto
 * - Placeholder descriptif
 */
function afficherMatriceRetroaction() {
    if (!cartoucheActuel) return;
    
    const container = document.getElementById('matriceContainer');
    
    let html = `
        <table class="tableau" style="width: 100%;">
            <thead>
                <tr>
                    <th style="width: 200px; position: sticky; left: 0; background: var(--bleu-pale);">
                        Critère / Niveau
                    </th>
    `;
    
    // En-têtes des niveaux
    cartoucheActuel.niveaux.forEach(niveau => {
        const codeEchappe = echapperHtml(niveau.code);
        const nomEchappe = echapperHtml(niveau.nom);
        html += `<th style="text-align: center; background: var(--bleu-pale);">
            ${codeEchappe}<br>
            <small style="font-weight: normal;">${nomEchappe}</small>
         </th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // Lignes des critères
    cartoucheActuel.criteres.forEach(critere => {
        const nomCritereEchappe = echapperHtml(critere.nom);
        html += `
            <tr>
                <td style="font-weight: bold; background: var(--bleu-tres-pale); 
                     position: sticky; left: 0;">
                    ${nomCritereEchappe}
                </td>
        `;
        
        // Cellules des commentaires
        cartoucheActuel.niveaux.forEach(niveau => {
            const key = `${critere.id}_${niveau.code}`;
            const commentaire = cartoucheActuel.commentaires[key] || '';
            const commentaireEchappe = echapperHtml(commentaire);
            const nomNiveauEchappe = echapperHtml(niveau.nom);
            
            html += `
                <td style="padding: 8px;">
                    <textarea class="controle-form" 
                              id="comm_${key}"
                              data-critere="${critere.id}" 
                              data-niveau="${niveau.code}"
                              rows="3" 
                              placeholder="Commentaire pour ${nomCritereEchappe} - ${nomNiveauEchappe}"
                              onchange="sauvegarderCommentaire('${key}')"
                              style="font-size: 0.85rem; min-width: 200px;">${commentaireEchappe}</textarea>
                </td>
            `;
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Mettre à jour les métriques
    mettreAJourMetriques();
}

/**
 * Sauvegarde un commentaire individuel
 * Appelée lors du changement dans une textarea (onchange)
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la valeur de la textarea
 * 2. Met à jour cartoucheActuel.commentaires
 * 3. Recalcule le pourcentage de complétion
 * 
 * PARAMÈTRES:
 * @param {string} key - Clé du commentaire (critereId_niveauCode)
 * 
 * UTILISÉ PAR:
 * - Textarea dans la matrice (onchange)
 * 
 * NOTE:
 * - Sauvegarde en mémoire uniquement
 * - Persistance complète via sauvegarderCartouche()
 */
function sauvegarderCommentaire(key) {
    if (!cartoucheActuel) return;
    
    const textarea = document.getElementById(`comm_${key}`);
    if (textarea) {
        cartoucheActuel.commentaires[key] = textarea.value;
        calculerPourcentageComplete();
    }
}

/* ===============================
   SAUVEGARDE DE LA CARTOUCHE
   =============================== */

/**
 * Sauvegarde la cartouche complète dans localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Validation du nom (obligatoire)
 * 2. Récupération du contexte
 * 3. Recherche si cartouche existe déjà
 * 4. Mise à jour ou ajout
 * 5. Sauvegarde dans localStorage
 * 6. Rafraîchissement de l'interface
 * 
 * UTILISÉ PAR:
 * - Bouton «Sauvegarder la cartouche»
 * 
 * VALIDATION:
 * - Nom obligatoire (alert si vide)
 * - Contexte optionnel
 * 
 * CLÉ LOCALSTORAGE:
 * - 'cartouches_{grilleId}' : Array des cartouches
 * 
 * RETOUR:
 * - Notification de succès
 * - Sélection automatique de la cartouche sauvegardée
 */
function sauvegarderCartouche() {
    if (!cartoucheActuel) return;
    
    const nom = document.getElementById('nomCartouche').value.trim();
    if (!nom) {
        alert('Veuillez donner un nom à la cartouche');
        return;
    }
    
    // Mettre à jour les champs
    cartoucheActuel.nom = nom;
    cartoucheActuel.contexte = document.getElementById('contexteCartouche').value.trim();
    
    const grilleId = cartoucheActuel.grilleId;
    let cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    
    // Vérifier si la cartouche existe déjà
    const index = cartouches.findIndex(c => c.id === cartoucheActuel.id);
    if (index >= 0) {
        // Mise à jour
        cartouches[index] = cartoucheActuel;
    } else {
        // Ajout
        cartouches.push(cartoucheActuel);
    }
    
    // Sauvegarder
    localStorage.setItem(`cartouches_${grilleId}`, JSON.stringify(cartouches));
    
    // Rafraîchir l'interface
    chargerCartouchesRetroaction();
    document.getElementById('selectCartouche').value = cartoucheActuel.id;
    
    afficherNotificationSucces('Cartouche sauvegardée avec succès !');
}

/* ===============================
   IMPORT DE COMMENTAIRES
   =============================== */

/**
 * Affiche la zone d'importation de commentaires
 * Masque la matrice pendant l'import
 * 
 * UTILISÉ PAR:
 * - Bouton «Importer des commentaires»
 */
function afficherImportCommentaires() {
    document.getElementById('zoneImportCommentaires').style.display = 'block';
    document.getElementById('matriceRetroaction').style.display = 'none';
}

/**
 * Annule l'import et retourne à la matrice
 * Efface le contenu du textarea d'import
 * 
 * UTILISÉ PAR:
 * - Bouton «Annuler» dans la zone d'import
 */
function annulerImportCommentaires() {
    document.getElementById('zoneImportCommentaires').style.display = 'none';
    document.getElementById('matriceRetroaction').style.display = 'block';
    document.getElementById('commentairesColles').value = '';
}

/**
 * Parse et importe les commentaires depuis un texte Markdown
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le texte collé
 * 2. Parse ligne par ligne
 * 3. Détecte les sections: ## CRITÈRE
 * 4. Détecte les commentaires: **CRITÈRE (NIVEAU)** : Texte
 * 5. Associe au bon critère et niveau
 * 6. Met à jour cartoucheActuel.commentaires
 * 7. Rafraîchit la matrice
 * 
 * UTILISÉ PAR:
 * - Bouton «Importer les commentaires»
 * 
 * FORMAT ATTENDU:
 * ## NOM_DU_CRITÈRE
 * 
 * **NOM_DU_CRITÈRE (I)** : Commentaire...
 * **NOM_DU_CRITÈRE (D)** : Commentaire...
 * **NOM_DU_CRITÈRE (M)** : Commentaire...
 * **NOM_DU_CRITÈRE (E)** : Commentaire...
 * 
 * REGEX:
 * - Section: /^##/
 * - Commentaire: /^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/
 * 
 * VALIDATION:
 * - Vérifie que le critère existe
 * - Vérifie que le niveau existe
 * - Compte les imports réussis
 * - Alerte si aucun import
 * 
 * RETOUR:
 * - Notification avec nombre de commentaires importés
 * - Retour automatique à la matrice
 */
function importerCommentaires() {
    const texte = document.getElementById('commentairesColles').value.trim();
    
    if (!texte) {
        alert('Veuillez coller vos commentaires');
        return;
    }
    
    if (!cartoucheActuel) {
        alert('Aucune cartouche active');
        return;
    }
    
    try {
        // Parser le texte
        const lignes = texte.split('\n');
        let critereActuel = null;
        let compteur = 0;
        
        lignes.forEach(ligne => {
            ligne = ligne.trim();
            
            // Détecter un titre de critère : ## CRITÈRE
            if (ligne.startsWith('##')) {
                critereActuel = ligne.replace('##', '').trim().toUpperCase();
                return;
            }
            
            // Détecter un commentaire : **CRITÈRE (NIVEAU)** : Texte...
            const match = ligne.match(/^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/);
            if (match && critereActuel) {
                const nomCritere = match[1].trim().toUpperCase();
                const niveau = match[2].trim();
                const commentaire = match[3].trim();
                
                // Vérifier que le critère correspond
                if (nomCritere === critereActuel) {
                    // Trouver le critère correspondant dans la cartouche
                    const critere = cartoucheActuel.criteres.find(c =>
                        c.nom.toUpperCase() === critereActuel
                    );
                    
                    if (critere) {
                        const key = `${critere.id}_${niveau}`;
                        cartoucheActuel.commentaires[key] = commentaire;
                        compteur++;
                    }
                }
            }
        });
        
        if (compteur === 0) {
            alert('Aucun commentaire n\'a pu être importé. Vérifiez le format.');
            return;
        }
        
        // Rafraîchir l'affichage
        afficherMatriceRetroaction();
        calculerPourcentageComplete();
        annulerImportCommentaires();
        
        afficherNotificationSucces(`${compteur} commentaire(s) importé(s) avec succès !`);
        
    } catch (error) {
        console.error('Erreur d\'import:', error);
        alert('Erreur lors de l\'import. Vérifiez le format de vos données.');
    }
}

/* ===============================
   GÉNÉRATION D'APERÇU
   =============================== */

/**
 * Génère un aperçu aléatoire de rétroaction
 * Choisit un niveau aléatoire pour chaque critère
 * 
 * FONCTIONNEMENT:
 * 1. Pour chaque critère:
 *    - Tire un niveau aléatoire
 *    - Récupère le commentaire correspondant
 *    - Affiche dans une zone stylisée
 * 2. Simule ce que verrait un·e étudiant·e
 * 
 * UTILISÉ PAR:
 * - Bouton «Générer un aperçu aléatoire»
 * 
 * AFFICHAGE:
 * - Nom du critère en gras
 * - Niveau atteint
 * - Commentaire correspondant
 * - Style différencié par bloc
 * 
 * UTILITÉ:
 * - Tester visuellement les commentaires
 * - Vérifier la cohérence
 * - Prévisualiser le rendu final
 */
function genererApercuAleatoire() {
    if (!cartoucheActuel) return;
    
    let html = '<h6 style="color: var(--bleu-principal); margin-bottom: 15px;">Rétroaction générée automatiquement :</h6>';
    
    cartoucheActuel.criteres.forEach(critere => {
        // Choisir un niveau aléatoire
        const niveauIndex = Math.floor(Math.random() * cartoucheActuel.niveaux.length);
        const niveau = cartoucheActuel.niveaux[niveauIndex];
        const key = `${critere.id}_${niveau.code}`;
        const commentaire = cartoucheActuel.commentaires[key] || '[Commentaire non défini]';
        
        const nomCritereEchappe = echapperHtml(critere.nom);
        const nomNiveauEchappe = echapperHtml(niveau.nom);
        const codeNiveauEchappe = echapperHtml(niveau.code);
        const commentaireEchappe = echapperHtml(commentaire);
        
        html += `
            <div style="margin-bottom: 15px; padding: 10px; background: var(--bleu-tres-pale); 
                 border-left: 3px solid var(--bleu-moyen); border-radius: 4px;">
                <strong>${nomCritereEchappe}</strong> - Niveau : ${nomNiveauEchappe} (${codeNiveauEchappe})
                <p style="margin-top: 5px; margin-bottom: 0;">${commentaireEchappe}</p>
            </div>
        `;
    });
    
    document.getElementById('exempleRetroaction').innerHTML = html;
}

/* ===============================
   MÉTRIQUES ET PROGRESSION
   =============================== */

/**
 * Met à jour les métriques affichées
 * (Nombre de critères, niveaux, commentaires, pourcentage)
 * 
 * FONCTIONNEMENT:
 * 1. Compte les critères
 * 2. Compte les niveaux
 * 3. Calcule le total de commentaires à remplir
 * 4. Appelle calculerPourcentageComplete()
 * 
 * UTILISÉ PAR:
 * - afficherMatriceRetroaction()
 * 
 * MÉTRIQUES AFFICHÉES:
 * - #nbCriteres : Nombre de critères
 * - #nbNiveaux : Nombre de niveaux
 * - #nbCommentaires : Total de cases à remplir (critères × niveaux)
 * - #pctComplete : Pourcentage (via calculerPourcentageComplete)
 */
function mettreAJourMetriques() {
    if (!cartoucheActuel) return;
    
    const nbCriteres = cartoucheActuel.criteres.length;
    const nbNiveaux = cartoucheActuel.niveaux.length;
    const nbTotal = nbCriteres * nbNiveaux;
    
    document.getElementById('nbCriteres').textContent = nbCriteres;
    document.getElementById('nbNiveaux').textContent = nbNiveaux;
    document.getElementById('nbCommentaires').textContent = nbTotal;
    
    calculerPourcentageComplete();
}

/**
 * Calcule et affiche le pourcentage de complétion
 * Change la couleur selon le niveau d'avancement
 * 
 * FONCTIONNEMENT:
 * 1. Compte les cellules remplies (non vides)
 * 2. Calcule le pourcentage
 * 3. Applique une couleur selon le niveau:
 *    - 100% : vert (complet)
 *    - 75%+ : bleu (presque complet)
 *    - 50%+ : orange (en cours)
 *    - <50% : rouge (début)
 * 
 * UTILISÉ PAR:
 * - sauvegarderCommentaire()
 * - chargerMatriceRetroaction()
 * - importerCommentaires()
 * - mettreAJourMetriques()
 * 
 * AFFICHAGE:
 * - Met à jour #pctComplete
 * - Change le background de son parent
 * 
 * CRITÈRE DE REMPLISSAGE:
 * - Commentaire non vide après trim()
 */
function calculerPourcentageComplete() {
    if (!cartoucheActuel) return;
    
    const totalCases = cartoucheActuel.criteres.length * cartoucheActuel.niveaux.length;
    let casesRemplies = 0;
    
    // Compter les cases remplies
    cartoucheActuel.criteres.forEach(critere => {
        cartoucheActuel.niveaux.forEach(niveau => {
            const key = `${critere.id}_${niveau.code}`;
            if (cartoucheActuel.commentaires[key] && cartoucheActuel.commentaires[key].trim()) {
                casesRemplies++;
            }
        });
    });
    
    const pourcentage = Math.round((casesRemplies / totalCases) * 100);
    document.getElementById('pctComplete').textContent = pourcentage + '%';
    
    // Changer la couleur selon le pourcentage
    const element = document.getElementById('pctComplete').parentElement;
    if (pourcentage === 100) {
        element.style.background = 'var(--vert-pale)';
    } else if (pourcentage >= 75) {
        element.style.background = 'var(--bleu-carte)';
    } else if (pourcentage >= 50) {
        element.style.background = 'var(--orange-accent)20';
    } else {
        element.style.background = 'var(--risque-critique)20';
    }
}

/* ===============================
   LISTE DES CARTOUCHES
   =============================== */

/**
 * Affiche la liste des cartouches existantes
 * Avec options de verrouillage, édition, duplication, suppression
 * 
 * FONCTIONNEMENT:
 * 1. Génère une carte par cartouche
 * 2. Affiche le nom et la progression
 * 3. Boutons d'action selon l'état (verrouillée ou non)
 * 
 * PARAMÈTRES:
 * @param {Array} cartouches - Array des cartouches à afficher
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - chargerCartouchesRetroaction()
 * - basculerVerrouillageCartouche()
 * 
 * AFFICHAGE PAR CARTOUCHE:
 * - Nom
 * - Progression (X / Y commentaires remplis)
 * - Checkbox verrouillage
 * - Bouton Modifier (désactivé si verrouillé)
 * - Bouton Dupliquer
 * - Bouton Supprimer (désactivé si verrouillé)
 * 
 * OPACITÉ:
 * - Boutons désactivés à 50% d'opacité si verrouillé
 */
function afficherListeCartouches(cartouches, grilleId) {
    const container = document.getElementById('listeCartouchesContainer');
    
    container.innerHTML = cartouches.map(cartouche => {
        const nomEchappe = echapperHtml(cartouche.nom);
        const nbRemplis = Object.keys(cartouche.commentaires || {})
            .filter(k => cartouche.commentaires[k] && cartouche.commentaires[k].trim())
            .length;
        const nbTotal = (cartouche.criteres?.length || 0) * (cartouche.niveaux?.length || 0);
        
        return `
        <div style="padding: 12px; background: var(--bleu-tres-pale); border: 1px solid var(--bleu-leger); 
             border-radius: 6px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--bleu-principal);">${nomEchappe}</strong>
                    <small style="color: var(--bleu-leger); margin-left: 10px;">
                        ${nbRemplis} / ${nbTotal} commentaires remplis
                    </small>
                </div>
                <div>
                    <span onclick="basculerVerrouillageCartouche('${cartouche.id}', '${grilleId}')"
                          style="font-size: 1.2rem; cursor: pointer; user-select: none; margin-right: 10px;"
                          title="${cartouche.verrouille ? 'Verrouillé - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller'}">
                        ${cartouche.verrouille ? '🔒' : '🔓'}
                    </span>
                    <button class="btn btn-modifier" 
                            onclick="chargerCartouchePourModif('${cartouche.id}', '${grilleId}')" 
                            style="padding: 5px 12px; font-size: 0.85rem; 
                                   opacity: ${cartouche.verrouille ? '0.5' : '1'};"
                            ${cartouche.verrouille ? 'disabled' : ''}>
                        Modifier
                    </button>
                    <button class="btn btn-principal" 
                            onclick="dupliquerCartouche('${cartouche.id}', '${grilleId}')" 
                            style="padding: 5px 12px; font-size: 0.85rem;">
                        Dupliquer
                    </button>
                    <button class="btn btn-supprimer" 
                            onclick="supprimerCartoucheConfirm('${cartouche.id}', '${grilleId}')" 
                            style="padding: 5px 12px; font-size: 0.85rem; 
                                   opacity: ${cartouche.verrouille ? '0.5' : '1'};"
                            ${cartouche.verrouille ? 'disabled' : ''}>
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

/* ===============================
   🔒 VERROUILLAGE
   =============================== */

/**
 * Bascule le verrouillage d'une cartouche
 * Une cartouche verrouillée ne peut pas être modifiée ou supprimée
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les cartouches depuis localStorage
 * 2. Trouve la cartouche concernée
 * 3. Bascule l'état verrouille
 * 4. Sauvegarde
 * 5. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Checkbox dans afficherListeCartouches()
 * 
 * EFFET:
 * - Désactive/active les boutons Modifier et Supprimer
 * - Change l'opacité des boutons
 */
function basculerVerrouillageCartouche(cartoucheId, grilleId) {
    let cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const index = cartouches.findIndex(c => c.id === cartoucheId);
    
    if (index !== -1) {
        cartouches[index].verrouille = document.getElementById(`verrou-cartouche-${cartoucheId}`).checked;
        localStorage.setItem(`cartouches_${grilleId}`, JSON.stringify(cartouches));
        afficherListeCartouches(cartouches, grilleId);
    }
}

/* ===============================
   🔄 DUPLICATION
   =============================== */

/**
 * Duplique une cartouche existante
 * 
 * FONCTIONNEMENT:
 * 1. Trouve la cartouche originale
 * 2. Crée une copie complète (deep copy)
 * 3. Change l'ID et ajoute «(copie)» au nom
 * 4. Déverrouille la copie
 * 5. Ajoute aux cartouches
 * 6. Sélectionne automatiquement la copie
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche à dupliquer
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton «Dupliquer» dans afficherListeCartouches()
 * 
 * RETOUR:
 * - Notification de succès
 * - Chargement automatique de la copie
 */
function dupliquerCartouche(cartoucheId, grilleId) {
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const cartoucheOriginal = cartouches.find(c => c.id === cartoucheId);
    
    if (cartoucheOriginal) {
        const nouveauCartouche = {
            ...cartoucheOriginal,
            id: 'CART' + Date.now(),
            nom: cartoucheOriginal.nom + ' (copie)',
            verrouille: false,
            commentaires: { ...cartoucheOriginal.commentaires }
        };
        
        cartouches.push(nouveauCartouche);
        localStorage.setItem(`cartouches_${grilleId}`, JSON.stringify(cartouches));
        
        // Recharger et sélectionner la copie
        chargerCartouchesRetroaction();
        document.getElementById('selectCartouche').value = nouveauCartouche.id;
        chargerMatriceRetroaction();
        
        afficherNotificationSucces('Cartouche dupliquée avec succès !');
    }
}

/**
 * Charge une cartouche pour modification depuis la liste
 * Vérifie qu'elle n'est pas verrouillée
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton «Modifier» dans afficherListeCartouches()
 */
function chargerCartouchePourModif(cartoucheId, grilleId) {
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const cartouche = cartouches.find(c => c.id === cartoucheId);
    
    if (cartouche && !cartouche.verrouille) {
        document.getElementById('selectCartouche').value = cartoucheId;
        chargerMatriceRetroaction();
    }
}

/* ===============================
   SUPPRESSION
   =============================== */

/**
 * Supprime une cartouche avec confirmation
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que la cartouche n'est pas verrouillée
 * 2. Demande confirmation
 * 3. Retire du localStorage
 * 4. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche à supprimer
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton «Supprimer» dans afficherListeCartouches()
 * 
 * SÉCURITÉ:
 * - Bloquée si verrouillée (alerte)
 * - Confirmation obligatoire
 */
function supprimerCartoucheConfirm(cartoucheId, grilleId) {
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const cartouche = cartouches.find(c => c.id === cartoucheId);
    
    if (cartouche && cartouche.verrouille) {
        alert('Déverrouillez ce cartouche (🔓) avant de le supprimer');
        return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la cartouche «${cartouche?.nom}» ?`)) {
        const nouveauxCartouches = cartouches.filter(c => c.id !== cartoucheId);
        localStorage.setItem(`cartouches_${grilleId}`, JSON.stringify(nouveauxCartouches));
        
        chargerCartouchesRetroaction();
        afficherNotificationSucces('Cartouche supprimée');
    }
}

/**
 * Supprime la cartouche actuellement en édition
 * Appelée depuis le bouton de suppression principal
 * 
 * UTILISÉ PAR:
 * - Bouton «Supprimer» dans la zone d'édition
 */
function supprimerCartouche() {
    if (!cartoucheActuel) return;
    
    const grilleId = cartoucheActuel.grilleId;
    supprimerCartoucheConfirm(cartoucheActuel.id, grilleId);
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 * 
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec animation
 * 3. Supprime après 3 secondes
 * 
 * PARAMÈTRES:
 * @param {string} message - Message à afficher
 * 
 * UTILISÉ PAR:
 * - Toutes les fonctions de sauvegarde/modification
 * 
 * STYLE:
 * - Position fixe en haut à droite
 * - Fond vert (succès)
 * - Animation slideIn
 * - Disparaît après 3s
 */
function afficherNotificationSucces(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/* ===============================
   📤📥 EXPORT / IMPORT JSON
   =============================== */

/**
 * Exporte toutes les cartouches au format JSON
 *
 * FONCTIONNEMENT:
 * 1. Récupère toutes les clés localStorage commençant par 'cartouches_'
 * 2. Compile dans un objet structuré
 * 3. Génère un fichier JSON téléchargeable
 *
 * UTILISÉ PAR:
 * - Bouton «Exporter les cartouches»
 *
 * FORMAT EXPORT:
 * {
 *   version: "1.0",
 *   dateExport: "ISO string",
 *   cartouches: {
 *     grilleId1: [...],
 *     grilleId2: [...]
 *   }
 * }
 */
function exporterCartouches() {
    const cartouches = {};

    // Parcourir toutes les clés localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cartouches_')) {
            const grilleId = key.replace('cartouches_', '');
            cartouches[grilleId] = JSON.parse(localStorage.getItem(key) || '[]');
        }
    }

    const data = {
        version: "1.0",
        dateExport: new Date().toISOString(),
        cartouches: cartouches
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartouches-retroaction-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    afficherNotificationSucces('Cartouches exportées avec succès !');
}

/**
 * Importe des cartouches depuis un fichier JSON
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Valide la structure
 * 3. Fusionne avec les cartouches existantes (ou remplace si conflit)
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'interface
 *
 * UTILISÉ PAR:
 * - Input file «Importer des cartouches»
 *
 * PARAMÈTRES:
 * @param {Event} event - Événement de changement du file input
 *
 * VALIDATION:
 * - Vérifie la version
 * - Vérifie la structure des données
 * - Alerte en cas d'erreur
 *
 * GESTION CONFLITS:
 * - Propose de remplacer ou fusionner
 * - Les cartouches avec même ID sont remplacées
 */
function importerCartouches(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // Validation de base
            if (!data.version || !data.cartouches) {
                alert('Format de fichier invalide');
                return;
            }

            let compteur = 0;

            // Importer chaque grille de cartouches
            Object.keys(data.cartouches).forEach(grilleId => {
                const cartouchesImportees = data.cartouches[grilleId];
                const cartouchesExistantes = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');

                // Fusionner : remplacer si même ID, sinon ajouter
                cartouchesImportees.forEach(importee => {
                    const index = cartouchesExistantes.findIndex(c => c.id === importee.id);
                    if (index !== -1) {
                        cartouchesExistantes[index] = importee;
                    } else {
                        cartouchesExistantes.push(importee);
                    }
                    compteur++;
                });

                localStorage.setItem(`cartouches_${grilleId}`, JSON.stringify(cartouchesExistantes));
            });

            // Rafraîchir l'interface si on est dans la section
            const selectGrille = document.getElementById('selectGrilleRetroaction');
            if (selectGrille && selectGrille.value) {
                chargerCartouchesRetroaction();
            }

            afficherNotificationSucces(`${compteur} cartouche(s) importée(s) avec succès !`);

        } catch (error) {
            console.error('Erreur d\'import:', error);
            alert('Erreur lors de l\'import du fichier. Vérifiez le format.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
}

/**
 * Importe une cartouche depuis un fichier texte Markdown (.txt)
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier .txt sélectionné
 * 2. Parse le contenu Markdown
 * 3. Extrait les commentaires par critère et niveau
 * 4. Remplit la cartouche en cours d'édition
 * 5. Met à jour l'affichage
 *
 * UTILISÉ PAR:
 * - Input file «Importer depuis fichier .txt»
 *
 * PARAMÈTRES:
 * @param {Event} event - Événement de changement du file input
 *
 * FORMAT ATTENDU:
 * ## NOM_DU_CRITÈRE
 *
 * **NOM_DU_CRITÈRE (I)** : Commentaire...
 * **NOM_DU_CRITÈRE (D)** : Commentaire...
 * **NOM_DU_CRITÈRE (M)** : Commentaire...
 * **NOM_DU_CRITÈRE (E)** : Commentaire...
 *
 * VALIDATION:
 * - Vérifie qu'une cartouche est active
 * - Compte les imports réussis
 * - Alerte si aucun import
 */
function importerCartoucheDepuisTxt(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!cartoucheActuel) {
        alert('Veuillez d\'abord sélectionner une grille et créer/sélectionner une cartouche');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const texte = e.target.result.trim();

            if (!texte) {
                alert('Le fichier est vide');
                return;
            }

            // Parser le texte
            const lignes = texte.split('\n');
            let critereActuel = null;
            let compteur = 0;

            lignes.forEach(ligne => {
                ligne = ligne.trim();

                // Détecter un titre de critère : ## CRITÈRE
                if (ligne.startsWith('##')) {
                    critereActuel = ligne.replace('##', '').trim().toUpperCase();
                    return;
                }

                // Détecter un commentaire : **CRITÈRE (NIVEAU)** : Texte...
                const match = ligne.match(/^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/);
                if (match && critereActuel) {
                    const nomCritere = match[1].trim().toUpperCase();
                    const niveau = match[2].trim();
                    const commentaire = match[3].trim();

                    // Vérifier que le critère correspond
                    if (nomCritere === critereActuel) {
                        // Trouver le critère correspondant dans la cartouche
                        const critere = cartoucheActuel.criteres.find(c =>
                            c.nom.toUpperCase() === critereActuel
                        );

                        if (critere) {
                            const key = `${critere.id}_${niveau}`;
                            cartoucheActuel.commentaires[key] = commentaire;
                            compteur++;
                        }
                    }
                }
            });

            if (compteur === 0) {
                alert('Aucun commentaire n\'a pu être importé. Vérifiez que :\n- Le fichier est au format Markdown attendu\n- Les noms de critères correspondent à ceux de la grille sélectionnée');
                return;
            }

            // Rafraîchir l'affichage
            afficherMatriceRetroaction();
            calculerPourcentageComplete();

            afficherNotificationSucces(`${compteur} commentaire(s) importé(s) depuis le fichier !`);

        } catch (error) {
            console.error('Erreur d\'import depuis .txt:', error);
            alert('Erreur lors de l\'import du fichier. Vérifiez le format.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger le module 05-grilles.js (grilles de critères)
 * 3. Charger le module 06-echelles.js (niveaux de performance)
 * 4. Charger ce module 07-cartouches.js
 * 5. Appeler initialiserModuleCartouches() depuis 99-main.js
 *
 * DÉPENDANCES:
 * - echapperHtml() depuis 01-config.js
 * - cartoucheActuel depuis 01-config.js
 * - Classes CSS depuis styles.css
 * - Grilles depuis localStorage (module 05)
 * - Niveaux depuis localStorage (module 06)
 *
 * LOCALSTORAGE:
 * - 'cartouches_{grilleId}' : Array des cartouches par grille
 * - 'grillesTemplates' : Array des grilles (lecture)
 * - 'niveauxEchelle' : Array des niveaux (lecture)
 *
 * MODULES DÉPENDANTS:
 * - 04-productions.js : Utilisera les cartouches pour générer rétroactions
 *
 * STRUCTURE DONNÉES:
 * Cartouche = {
 *   id: string (CART + timestamp),
 *   nom: string,
 *   grilleId: string,
 *   contexte: string,
 *   criteres: [{id, nom}, ...],
 *   niveaux: [{code, nom}, ...],
 *   commentaires: {critereId_niveauCode: string, ...},
 *   verrouille: boolean
 * }
 *
 * ÉVÉNEMENTS:
 * Tous les événements sont gérés via attributs HTML (onchange, onclick)
 * Pas d'addEventListener requis dans 99-main.js
 *
 * FORMAT IMPORT:
 * Markdown avec structure:
 * ## NOM_CRITÈRE
 * **NOM_CRITÈRE (CODE)** : Commentaire
 *
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */