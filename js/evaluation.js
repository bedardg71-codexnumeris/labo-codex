/* ===============================
   MODULE EVALUATION: ÉVALUATIONS ET RÉTROACTIONS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'évaluation des productions étudiantes
   et la génération automatique de rétroactions.
   
   Contenu de ce module:
   - Sélection étudiant/production/grille/échelle/cartouche
   - Évaluation par critères avec niveaux
   - Génération automatique de rétroaction
   - Calcul de la note finale
   - Sauvegarde des évaluations
   - Navigation vers la liste des évaluations
   =============================== */

/* ===============================
   📋 DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, evaluationEnCours
   - 02-navigation.js : Pour navigation vers liste
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - afficherSousSection() (depuis 02-navigation.js)
   
   Éléments HTML requis:
   - #selectGroupeEval : Select pour filtrer par groupe
   - #selectEtudiantEval : Select pour choisir l'étudiant
   - #selectProduction1 : Select pour choisir la production
   - #selectGrille1 : Select pour choisir la grille
   - #selectEchelle1 : Select pour choisir l'échelle
   - #selectCartoucheEval : Select pour choisir la cartouche
   - #remiseProduction1 : Select pour le statut de remise
   - #listeCriteresGrille1 : Conteneur des critères
   - #noteProduction1 : Affichage de la note
   - #niveauProduction1 : Affichage du niveau
   - #retroactionFinale1 : Textarea de la rétroaction
   - #afficherDescription1, #afficherObjectif1, etc. : Checkboxes options
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'listeGrilles' : Array des productions (nom historique)
   - 'grillesTemplates' : Array des grilles de critères
   - 'niveauxEchelle' : Array des niveaux de performance
   - 'cartouches_{grilleId}' : Array des cartouches par grille
   - 'evaluationsSauvegardees' : Array des évaluations complètes
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module d'évaluation
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge les listes dans les selects
 * 3. Initialise les cases cochées par défaut
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleEvaluation() {
    console.log('📝 Initialisation du module Évaluation');

    // Vérifier que nous sommes dans la bonne section
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant) {
        console.log('   ⚠️  Section évaluations non active, initialisation reportée');
        return;
    }

    // Charger toutes les listes
    chargerListeEtudiantsEval();
    chargerGroupesEval();
    chargerGrillesDansSelect();
    chargerEchellePerformance();

    // S'assurer que toutes les cases sont cochées par défaut
    cocherOptionsParDefaut();

    const listeEval = document.getElementById('evaluations-liste');
    if (listeEval && listeEval.classList.contains('active')) {
        chargerListeEvaluationsRefonte();
    }

    // 🔄 Initialiser le mode évaluation en série
    initialiserModeEvaluationSerie();

    console.log('   ✅ Module Évaluation initialisé');
}

/* ===============================
   📂 CHARGEMENT DES LISTES
   =============================== */

/**
 * Charge la liste des étudiants dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les étudiants depuis localStorage
 * 2. Remplit le select avec les options
 * 
 * CLÉ LOCALSTORAGE:
 * - 'groupeEtudiants' : Array des étudiants
 */
function chargerListeEtudiantsEval() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const select = document.getElementById('selectEtudiantEval');

    if (!select) return;

    select.innerHTML = '<option value="">-- Choisir un·e étudiant·e --</option>';
    etudiants.forEach(etudiant => {
        const option = document.createElement('option');
        option.value = etudiant.da;
        option.textContent = `${etudiant.prenom} ${etudiant.nom} (${etudiant.da})`;
        select.appendChild(option);
    });
}

/**
 * Charge les groupes dans le select de filtre
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les étudiants depuis localStorage
 * 2. Extrait les groupes uniques
 * 3. Remplit le select des groupes
 */
function chargerGroupesEval() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const groupes = [...new Set(etudiants.map(e => e.groupe).filter(g => g))];
    groupes.sort();

    const select = document.getElementById('selectGroupeEval');
    if (!select) return;

    select.innerHTML = '<option value="">Tous les groupes</option>';
    groupes.forEach(groupe => {
        const option = document.createElement('option');
        option.value = groupe;
        option.textContent = `Groupe ${groupe}`;
        select.appendChild(option);
    });
}

/**
 * Filtre les étudiants selon le groupe sélectionné
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le groupe sélectionné
 * 2. Filtre la liste des étudiants
 * 3. Recharge le select des étudiants
 * 
 * UTILISÉ PAR:
 * - onchange="#selectGroupeEval" dans le HTML
 */
function filtrerEtudiantsParGroupe() {
    const groupeId = document.getElementById('selectGroupeEval').value;
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    const etudiantsFiltres = groupeId
        ? etudiants.filter(e => e.groupe === groupeId)
        : etudiants;

    const select = document.getElementById('selectEtudiantEval');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choisir un·e étudiant·e --</option>';
    etudiantsFiltres.forEach(etudiant => {
        const option = document.createElement('option');
        option.value = etudiant.da;
        option.textContent = `${etudiant.prenom} ${etudiant.nom} (${etudiant.da})`;
        select.appendChild(option);
    });
}

/**
 * Charge les productions (évaluations) dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les productions depuis localStorage
 * 2. Remplit le select
 * 
 * CLÉ LOCALSTORAGE:
 * - 'listeGrilles' : Array des productions (nom historique)
 */
function chargerProductionsDansSelect() {
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const select = document.getElementById('selectProduction1');

    if (!select) return;

    select.innerHTML = '<option value="">-- Choisir une production --</option>';
    productions.forEach(prod => {
        const nomEchappe = echapperHtml(prod.titre || prod.nom);
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = nomEchappe;
        select.appendChild(option);
    });
}

/**
 * Charge les grilles de critères dans le select
 * 
 * CLÉ LOCALSTORAGE:
 * - 'grillesTemplates' : Array des grilles de critères
 */
function chargerGrillesDansSelect() {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const select = document.getElementById('selectGrille1');

    if (!select) return;

    select.innerHTML = '<option value="">-- Choisir une grille --</option>';
    grilles.forEach(grille => {
        const nomEchappe = echapperHtml(grille.nom);
        const option = document.createElement('option');
        option.value = grille.id;
        option.textContent = nomEchappe;
        select.appendChild(option);
    });
}

/**
 * Charge l'échelle de performance dans le select
 * 
 * CLÉ LOCALSTORAGE:
 * - 'niveauxEchelle' : Array des niveaux de performance
 */
function chargerEchellePerformance() {
    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');
    const select = document.getElementById('selectEchelle1');

    if (!select) return;

    // SÉCURITÉ: Vérifier que l'échelle existe
    if (!niveaux || niveaux.length === 0) {
        console.error('❌ Aucune échelle de performance configurée');
        select.innerHTML = '<option value="">⚠️ Aucune échelle configurée - Aller dans Réglages › Échelle</option>';
        document.getElementById('noteProduction1').textContent = '--';
        document.getElementById('niveauProduction1').textContent = '--';
        return;
    }

    // Remplir le select avec l'échelle configurée
    select.innerHTML = `
        <option value="echelle-idme">Échelle IDME (${niveaux.length} niveaux)</option>
    `;

    // Sélectionner automatiquement l'échelle
    select.value = 'echelle-idme';

    // Utiliser les valeurs de calcul configurées par l'utilisateur
    const valeurs = {};
    niveaux.forEach(niveau => {
        // Si valeurCalcul existe, l'utiliser, sinon calculer le milieu de la plage
        valeurs[niveau.code] = niveau.valeurCalcul || (niveau.min + niveau.max) / 2;
    });

    console.log('✅ Échelle de performance chargée:', niveaux.length, 'niveaux');
}

/* ===============================
   🎯 CHARGEMENT D'UNE ÉVALUATION
   =============================== */

/**
 * Charge les évaluations d'un étudiant sélectionné
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'étudiant sélectionné
 * 2. Charge les productions disponibles
 * 3. Initialise evaluationEnCours
 * 
 * UTILISÉ PAR:
 * - onchange="#selectEtudiantEval" dans le HTML
 */
function chargerEvaluationsEtudiant() {
    const etudiantDA = document.getElementById('selectEtudiantEval').value;

    if (!etudiantDA) {
        // Masquer l'interface si aucun étudiant
        return;
    }

    // Initialiser evaluationEnCours
    evaluationEnCours = {
        etudiantDA: etudiantDA,
        productionId: null,
        grilleId: null,
        echelleId: null,
        cartoucheId: null,
        criteres: {},
        statutRemise: 'non-remis'
    };

    // Charger les productions
    chargerProductionsDansSelect();
}

/**
 * Charge une production sélectionnée pour évaluation
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la production sélectionnée
 * 2. Met à jour evaluationEnCours
 * 3. Affiche les informations de la production
 * 
 * UTILISÉ PAR:
 * - onchange="#selectProduction1" dans le HTML
 */
function chargerProduction(productionNum) {
    const productionId = document.getElementById('selectProduction1').value;

    if (!productionId || !evaluationEnCours) {
        return;
    }

    evaluationEnCours.productionId = productionId;

    // Récupérer les infos de la production
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const production = productions.find(p => p.id === productionId);

    if (production) {
        // Mettre à jour les infos (si besoin d'affichage)
        console.log('Production chargée:', production.titre || production.nom);
    }
}

/* ===============================
   📊 GRILLE ET CARTOUCHE
   =============================== */

/**
 * Charge la grille sélectionnée
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la grille sélectionnée
 * 2. Charge les cartouches disponibles pour cette grille
 * 3. Met à jour evaluationEnCours
 * 
 * UTILISÉ PAR:
 * - onchange="#selectGrille1" dans le HTML
 */
function chargerGrilleSelectionnee() {
    const grilleId = document.getElementById('selectGrille1').value;

    if (!grilleId || !evaluationEnCours) {
        return;
    }

    evaluationEnCours.grilleId = grilleId;

    // Charger les cartouches pour cette grille
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const selectCartouche = document.getElementById('selectCartoucheEval');

    if (!selectCartouche) return;

    selectCartouche.innerHTML = '<option value="">-- Choisir une cartouche --</option>';
    cartouches.forEach(cartouche => {
        const nomEchappe = echapperHtml(cartouche.nom);
        const option = document.createElement('option');
        option.value = cartouche.id;
        option.textContent = nomEchappe;
        selectCartouche.appendChild(option);
    });
}

/**
 * Charge la cartouche sélectionnée et affiche les critères
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la cartouche sélectionnée
 * 2. Vérifie le statut de remise
 * 3. Affiche les critères avec les niveaux
 * 
 * UTILISÉ PAR:
 * - onchange="#selectCartoucheEval" dans le HTML
 */
function cartoucheSelectionnee() {
    const cartoucheId = document.getElementById('selectCartoucheEval').value;

    if (!cartoucheId || !evaluationEnCours) {
        return;
    }

    evaluationEnCours.cartoucheId = cartoucheId;

    const statut = document.getElementById('remiseProduction1').value;
    if (statut !== 'remis') {
        document.getElementById('listeCriteresGrille1').innerHTML =
            '<p style="color: #999; font-style: italic;">Le travail doit être remis avant évaluation</p>';
        return;
    }

    const grilleId = evaluationEnCours.grilleId;
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    if (!cartouche) return;

    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // Afficher les critères
    const html = cartouche.criteres.map(critere => {
        const critereGrille = grille.criteres.find(c => c.id === critere.id);
        const ponderation = critereGrille ? critereGrille.ponderation : '?';

        return `
    <div style="margin-bottom: 15px; padding: 12px; background: white; border-radius: 4px; border-left: 3px solid var(--bleu-moyen);">
        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start;">
            <div>
    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
        <strong style="font-size: 0.9rem;">${echapperHtml(critere.nom)}</strong>
        <small style="color: #666;">(${ponderation}%)</small>
    </div>
    ${critereGrille?.description ?
                `<small style="display: block; color: #888; font-style: italic; margin-bottom: 10px; line-height: 1.3;">${echapperHtml(critereGrille.description)}</small>` : ''}
    <select id="eval_${critere.id}" class="controle-form" 
            onchange="niveauSelectionne('${critere.id}')" 
            style="font-size: 0.85rem; transition: background-color 0.3s ease; border: 2px solid #ddd; width: 100%;">
        <option value="">--</option>
        ${cartouche.niveaux.map(n => `<option value="${n.code}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
    </select>
</div>
            <div id="comm_${critere.id}" style="font-size: 0.85rem; line-height: 1.5; color: #555; font-style: italic; padding: 8px; background: #f8f9fa; border-radius: 4px; min-height: 60px;">
                Sélectionnez un niveau
            </div>
        </div>
    </div>
`;
    }).join('');

    document.getElementById('listeCriteresGrille1').innerHTML = html;
}

/* ===============================
   📝 ÉVALUATION DES CRITÈRES
   =============================== */

/**
 * Gère la sélection d'un niveau pour un critère
 * 
 * FONCTIONNEMENT:
 * 1. Enregistre le niveau sélectionné
 * 2. Affiche le commentaire correspondant
 * 3. Calcule la note en temps réel
 * 4. Génère la rétroaction en temps réel
 * 
 * UTILISÉ PAR:
 * - onchange sur les selects de critères
 */
function niveauSelectionne(critereId) {
    const selectElement = document.getElementById(`eval_${critereId}`);
    const niveau = selectElement.value;

    if (!evaluationEnCours) return;

    evaluationEnCours.criteres[critereId] = niveau;

    // Mettre à jour la couleur du select
    if (niveau) {
        const couleur = obtenirCouleurNiveau(niveau);
        selectElement.style.backgroundColor = couleur + '30'; // 30 = 20% opacité
        selectElement.style.borderColor = couleur;
        selectElement.style.fontWeight = 'bold';
    } else {
        selectElement.style.backgroundColor = 'transparent';
        selectElement.style.borderColor = '#ddd';
        selectElement.style.fontWeight = 'normal';
    }

    // Afficher le commentaire correspondant
    if (niveau && evaluationEnCours.cartoucheId) {
        const grilleId = evaluationEnCours.grilleId;
        const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
        const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId);

        if (cartouche) {
            const cle = `${critereId}_${niveau}`;
            const commentaire = cartouche.commentaires[cle] || '[Non défini]';

            const commDiv = document.getElementById(`comm_${critereId}`);
            if (commDiv) {
                commDiv.textContent = commentaire;
                commDiv.style.fontStyle = commentaire === '[Non défini]' ? 'italic' : 'normal';
                commDiv.style.color = commentaire === '[Non défini]' ? '#999' : '#555';
            }
        }
    }

    // Calculer la note et générer la rétroaction en temps réel
    calculerNote();
    genererRetroaction(1);
}

/* ===============================
   🧮 CALCUL DE LA NOTE
   =============================== */

/**
 * Calcule la note finale basée sur les critères évalués
 * 
 * FONCTIONNEMENT:
 * 1. Récupère tous les niveaux sélectionnés
 * 2. Calcule la moyenne pondérée en pourcentage
 * 3. Détermine le niveau global
 * 4. Met à jour l'affichage
 */
function calculerNote() {
    if (!evaluationEnCours) return;

    const grilleId = evaluationEnCours.grilleId;
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');

    // SÉCURITÉ: Vérifier que l'échelle existe
    if (!niveaux || niveaux.length === 0) {
        console.error('❌ Aucune échelle de performance configurée');
        document.getElementById('noteProduction1').textContent = '--';
        document.getElementById('niveauProduction1').textContent = '--';
        return;
    }

    // Utiliser les valeurs ponctuelles configurées par l'utilisateur
    const valeurs = {};
    niveaux.forEach(niveau => {
        // Si valeurCalcul existe, l'utiliser, sinon calculer le milieu de la plage
        valeurs[niveau.code] = niveau.valeurCalcul || (niveau.min + niveau.max) / 2;
    });

    let noteTotal = 0;
    let ponderationTotal = 0;

    grille.criteres.forEach(critere => {
        const niveau = evaluationEnCours.criteres[critere.id];
        if (niveau && valeurs[niveau]) {
            const ponderation = (critere.ponderation || 0) / 100;
            noteTotal += valeurs[niveau] * ponderation;
            ponderationTotal += ponderation;
        }
    });

    let pourcentage = 0;
    let niveauGlobal = '--';

    if (ponderationTotal > 0) {
        // La moyenne pondérée est directement en pourcentage
        pourcentage = noteTotal / ponderationTotal;

        // Déterminer le niveau global selon l'échelle
        const niveauFinal = niveaux.find(n => {
            return pourcentage >= n.min && pourcentage <= n.max;
        });

        niveauGlobal = niveauFinal ? niveauFinal.code : '--';
    }

    // Mettre à jour l'affichage
    document.getElementById('noteProduction1').textContent = pourcentage.toFixed(1) + ' %';
    document.getElementById('niveauProduction1').textContent = niveauGlobal;

    // Colorer l'encadré de la note finale selon le niveau
    const noteContainer = document.getElementById('noteProduction1').closest('div[style*="background"]');
    if (noteContainer && niveauGlobal !== '--') {
        const couleur = obtenirCouleurNiveau(niveauGlobal);
        if (couleur && couleur !== 'transparent') {
            noteContainer.style.background = couleur + '20'; // 20% opacité
            noteContainer.style.borderLeft = `4px solid ${couleur}`;
            noteContainer.style.transition = 'all 0.3s ease';
        }
    } else if (noteContainer) {
        // Réinitialiser si pas de niveau
        noteContainer.style.background = '#f0f4f8';
        noteContainer.style.borderLeft = '4px solid #ddd';
    }

    // Sauvegarder dans evaluationEnCours
    evaluationEnCours.noteMoyenne = pourcentage;
    evaluationEnCours.niveauFinal = niveauGlobal;
}

/* ===============================
   🎨 GESTION DES COULEURS
   =============================== */

/**
 * Récupère la couleur associée à un niveau de performance
 * 
 * PARAMÈTRES:
 * @param {string} codeNiveau - Code du niveau (I, D, M, E, etc.)
 * 
 * RETOUR:
 * @returns {string} - Couleur CSS (var(--...) ou #...)
 */
function obtenirCouleurNiveau(codeNiveau) {
    if (!codeNiveau) return 'transparent';

    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');
    const niveau = niveaux.find(n => n.code === codeNiveau);

    return niveau ? niveau.couleur : 'transparent';
}

/* ===============================
   💬 GÉNÉRATION DE LA RÉTROACTION
   =============================== */

/**
 * Génère la rétroaction finale automatiquement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie les options cochées
 * 2. Récupère les infos de la production
 * 3. Assemble le texte de rétroaction
 * 4. Ajoute l'adresse personnalisée si cochée
 * 5. Ajoute le contexte de la cartouche si coché
 * 6. Ajoute les commentaires des critères évalués
 * 
 * UTILISÉ PAR:
 * - niveauSelectionne() (en temps réel)
 * - onchange sur les checkboxes d'options
 */
function genererRetroaction(num) {
    if (!evaluationEnCours?.cartoucheId) {
        document.getElementById('retroactionFinale1').value = '';
        return;
    }

    const grilleId = evaluationEnCours.grilleId;
    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId);

    if (!cartouche) return;

    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const production = productions.find(p => p.id === evaluationEnCours.productionId);

    let texte = '';

    // Options (Description, Objectif, Tâche)
    if (document.getElementById('afficherDescription1')?.checked && production?.description) {
        texte += `Production : ${production.description}\n`;
    }
    if (document.getElementById('afficherObjectif1')?.checked && production?.objectif) {
        texte += `Objectif : ${production.objectif}\n`;
    }
    if (document.getElementById('afficherTache1')?.checked && production?.tache) {
        texte += `Tâche : ${production.tache}\n`;
    }

    // Adresse personnalisée
    if (document.getElementById('afficherAdresse1')?.checked) {
        const etudiantDA = evaluationEnCours.etudiantDA;
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiant = etudiants.find(e => e.da === etudiantDA);

        if (etudiant) {
            texte += `\nBonjour ${etudiant.prenom} !\n\n`;
        }
    }

    // Contexte de la cartouche
    if (document.getElementById('afficherContexte1')?.checked && cartouche.contexte) {
        texte += `${cartouche.contexte}\n\n`;
    }

    // Commentaires des critères
    texte += 'Voici quelques observations :\n\n';

    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);

    if (grille) {
        grille.criteres.forEach(critere => {
            const niveau = evaluationEnCours.criteres[critere.id];
            if (niveau) {
                const cle = `${critere.id}_${niveau}`;
                const commentaire = cartouche.commentaires[cle];

                if (commentaire) {
                    texte += `${critere.nom} (${niveau}) : ${commentaire}\n\n`;
                }
            }
        });
    }

    // Ajouter le niveau global à la fin
    if (evaluationEnCours.niveauFinal && evaluationEnCours.niveauFinal !== '--') {
        texte += `Le niveau global de cette production est : ${evaluationEnCours.niveauFinal}.`;
    }

    document.getElementById('retroactionFinale1').value = texte.trim();
}

/* ===============================
   💾 SAUVEGARDE DE L'ÉVALUATION
   =============================== */

/**
 * Sauvegarde l'évaluation complète dans localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Valide les champs obligatoires
 * 2. Crée l'objet évaluation complet
 * 3. Sauvegarde dans localStorage
 * 4. Affiche notification de succès
 * 
 * STRUCTURE DONNÉES:
 * Evaluation = {
 *   id, etudiantDA, etudiantNom, groupe,
 *   productionId, productionNom,
 *   grilleId, grilleNom,
 *   echelleId, cartoucheId,
 *   dateEvaluation, statutRemise,
 *   criteres: [{critereId, critereNom, niveauSelectionne, retroaction, ponderation}],
 *   noteFinale, niveauFinal,
 *   retroactionFinale,
 *   optionsAffichage: {description, objectif, tache, adresse, contexte}
 * }
 */
function sauvegarderEvaluation() {
    // 🔄 Détecter si on est en mode modification d'une évaluation existante
    if (window.evaluationEnCours?.idModification) {
        sauvegarderEvaluationModifiee();
        return;
    }

    const etudiantDA = document.getElementById('selectEtudiantEval').value;
    const productionId = document.getElementById('selectProduction1').value;
    const grilleId = document.getElementById('selectGrille1').value;

    if (!etudiantDA || !productionId || !grilleId) {
        alert('Veuillez sélectionner un étudiant, une production et une grille avant de sauvegarder.');
        return;
    }

    // Récupérer les données
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === etudiantDA);

    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const production = productions.find(p => p.id === productionId);

    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);

    // Collecter les évaluations des critères
    const criteres = [];
    if (grille && grille.criteres) {
        grille.criteres.forEach(critere => {
            const niveau = evaluationEnCours.criteres[critere.id];
            if (niveau) {
                const commDiv = document.getElementById(`comm_${critere.id}`);
                criteres.push({
                    critereId: critere.id,
                    critereNom: critere.nom,
                    niveauSelectionne: niveau,
                    retroaction: commDiv ? commDiv.textContent : '',
                    ponderation: critere.ponderation || 0
                });
            }
        });
    }

    // Créer l'objet évaluation avec horodatage
    const maintenant = new Date();
    const evaluation = {
        id: 'EVAL_' + Date.now(),
        etudiantDA: etudiantDA,
        etudiantNom: etudiant ? `${etudiant.prenom} ${etudiant.nom}` : '',
        groupe: etudiant ? etudiant.groupe : '',
        productionId: productionId,
        productionNom: production ? (production.titre || production.nom) : '',
        grilleId: grilleId,
        grilleNom: grille ? grille.nom : '',
        echelleId: document.getElementById('selectEchelle1').value,
        cartoucheId: document.getElementById('selectCartoucheEval').value,
        dateEvaluation: maintenant.toISOString(),
        heureEvaluation: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        statutRemise: document.getElementById('remiseProduction1').value,
        criteres: criteres,
        noteFinale: parseFloat(document.getElementById('noteProduction1').textContent) || 0,
        niveauFinal: document.getElementById('niveauProduction1').textContent,
        retroactionFinale: document.getElementById('retroactionFinale1').value,
        optionsAffichage: {
            description: document.getElementById('afficherDescription1').checked,
            objectif: document.getElementById('afficherObjectif1').checked,
            tache: document.getElementById('afficherTache1').checked,
            adresse: document.getElementById('afficherAdresse1').checked,
            contexte: document.getElementById('afficherContexte1').checked
        },
        verrouillee: true // Verrouiller par défaut toutes les nouvelles évaluations
    };

    // Sauvegarder
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    evaluations.push(evaluation);

    // Protection : bloquer en mode anonymisation, rediriger en mode simulation
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    // Protection : bloquer en mode anonymisation, rediriger en mode simulation
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur(
            'Modification impossible',
            'Les modifications sont impossibles en mode anonymisation.'
        );
        return;
    }

    afficherNotificationSucces(`Évaluation sauvegardée : ${evaluation.etudiantNom} - ${evaluation.productionNom}`);

    // 🔄 Recalculer les indices C et P après sauvegarde
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
}

/* ===============================
   🔄 AUTRES FONCTIONS
   =============================== */

/**
 * Change le statut de remise
 */
function changerStatutRemise(num) {
    const statut = document.getElementById('remiseProduction1').value;

    if (evaluationEnCours) {
        evaluationEnCours.statutRemise = statut;
    }

    // Si non remis, masquer les critères
    if (statut !== 'remis') {
        document.getElementById('listeCriteresGrille1').innerHTML =
            '<p style="color: #999; font-style: italic;">Le travail doit être remis avant évaluation</p>';
    } else if (evaluationEnCours?.cartoucheId) {
        // Si remis et cartouche sélectionnée, afficher les critères
        cartoucheSelectionnee();
    }
}

/**
 * Change l'échelle d'évaluation
 */
function changerEchelleEvaluation(num) {
    const echelleId = document.getElementById('selectEchelle1').value;

    if (evaluationEnCours) {
        evaluationEnCours.echelleId = echelleId;
    }
}

/**
 * Coche toutes les options par défaut
 */
function cocherOptionsParDefaut() {
    const options = ['Description', 'Objectif', 'Tache', 'Adresse', 'Contexte'];
    options.forEach(option => {
        const checkbox = document.getElementById(`afficher${option}1`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

/**
 * Prépare une nouvelle évaluation (réinitialise le formulaire ET les sélections mémorisées)
 */
function nouvelleEvaluation() {
    // Réinitialiser tous les selects
    document.getElementById('selectGroupeEval').value = '';
    document.getElementById('selectEtudiantEval').value = '';
    document.getElementById('selectProduction1').value = '';
    document.getElementById('selectGrille1').value = '';
    document.getElementById('selectEchelle1').value = '';
    document.getElementById('selectCartoucheEval').value = '';
    document.getElementById('remiseProduction1').value = 'non-remis';
    document.getElementById('listeCriteresGrille1').innerHTML = '<p style="color: #999; font-style: italic; font-size: 0.85rem;">Sélectionnez une grille et une cartouche</p>';
    document.getElementById('retroactionFinale1').value = '';
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    cocherOptionsParDefaut();

    evaluationEnCours = null;
    filtrerEtudiantsParGroupe();

    // 🔄 Effacer les sélections mémorisées du mode évaluation en série
    localStorage.removeItem('dernieresSelectionsEvaluation');
    console.log('✅ Sélections mémorisées effacées');

    // 🔄 Réinitialiser le mode modification
    if (window.evaluationEnCours?.idModification) {
        delete window.evaluationEnCours.idModification;
        console.log('✅ Mode modification réinitialisé');
    }

    // Masquer l'indicateur de progression
    const indicateur = document.getElementById('indicateurProgressionEval');
    if (indicateur) indicateur.style.display = 'none';

    // Masquer l'indicateur de modification
    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.style.display = 'none';

    // Masquer le bouton de verrouillage et réactiver le formulaire
    afficherOuMasquerBoutonVerrouillage(false);
    desactiverFormulaireEvaluation(false);

    afficherNotificationSucces('Paramètres réinitialisés - Prêt pour une nouvelle série d\'évaluations');
}

/**
 * Navigation vers la liste des évaluations
 */
function naviguerVersListeEvaluations() {
    afficherSousSection('evaluations-liste');
}

/**
 * Copie la rétroaction dans le presse-papier
 */
function copierRetroaction(num) {
    const texte = document.getElementById('retroactionFinale1').value;

    if (!texte || texte.trim() === '') {
        alert('Aucune rétroaction à copier');
        return;
    }

    navigator.clipboard.writeText(texte).then(() => {
        afficherNotificationSucces('Rétroaction copiée dans le presse-papier !');
    }).catch(err => {
        console.error('Erreur de copie:', err);
        alert('Erreur lors de la copie. Utilisez Cmd+A puis Cmd+C manuellement.');
    });
}

/**
 * Sauvegarde la rétroaction finale modifiée
 */
function sauvegarderRetroactionFinale(productionNum) {
    // La rétroaction est déjà dans le textarea, pas besoin de sauvegarde intermédiaire
    // Elle sera sauvegardée lors de la sauvegarde complète de l'évaluation
}

/**
 * Affiche une notification de succès
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
   REFONTE MODULE EVALUATION: LISTE DES ÉVALUATIONS
   Nouvelles fonctions pour la liste avec calcul des indices
   =============================== */

// === VARIABLES GLOBALES ===
let donneesEvaluationsFiltrees = [];

/* ===============================
   📊 CALCUL DES INDICES
   =============================== */

/**
 * Calcule et sauvegarde les indices C (Complétion) et P (Performance)
 * Basé sur le Guide de monitorage
 */
function calculerEtSauvegarderIndicesEvaluation() {
    console.log('📊 Calcul des indices C et P...');

    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    const indicesEvaluation = {};

    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );

    etudiantsActifs.forEach(etudiant => {
        // === CALCUL DE LA COMPLÉTION (C) ===
        // Compter les artefacts attendus
        const artefactsAttendus = productions.filter(p =>
            p.type === 'artefact-portfolio' || p.type === 'production'
        );

        // Compter les artefacts remis par cet étudiant
        // ⚠️ IMPORTANT: Exclure les évaluations remplacées par un jeton de reprise
        const evaluationsEtudiant = evaluations.filter(e =>
            e.etudiantDA === etudiant.da && !e.remplaceeParId
        );

        // Calculer le taux de complétion
        const completion = artefactsAttendus.length > 0
            ? evaluationsEtudiant.length / artefactsAttendus.length
            : 0;

        // === CALCUL DE LA PERFORMANCE (P) ===
        // Prendre les 3 dernières évaluations
        const dernieresEvals = evaluationsEtudiant
            .sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation))
            .slice(0, 3);

        let performance = 0;
        if (dernieresEvals.length > 0) {
            // Calculer la moyenne des notes IDME
            const sommeNotes = dernieresEvals.reduce((sum, evaluation) => {
                // Convertir la note lettre en valeur numérique
                const noteNumerique = convertirNoteEnValeur(evaluation.niveauFinal || evaluation.noteFinale);
                return sum + noteNumerique;
            }, 0);

            // Moyenne sur 4 (selon le Guide)
            performance = (sommeNotes / dernieresEvals.length) / 4;
        }

        // Sauvegarder les indices
        indicesEvaluation[etudiant.da] = {
            completion: Math.min(completion, 1), // Plafonner à 100%
            performance: Math.min(performance, 1), // Plafonner à 100%
            nbEvaluations: evaluationsEtudiant.length,
            nbAttendus: artefactsAttendus.length
        };
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('indicesEvaluation', JSON.stringify(indicesEvaluation));
    console.log('✅ Indices C et P sauvegardés:', indicesEvaluation);

    return indicesEvaluation;
}

/**
 * Convertit une note lettre en valeur numérique
 */
function convertirNoteEnValeur(note) {
    if (typeof note === 'number') return note;

    const conversion = {
        'M': 4, 'Maîtrise': 4,
        'I': 3, 'Intermédiaire': 3,
        'D': 2, 'Développement': 2,
        'B': 1, 'Base': 1,
        'O': 0, 'Observation': 0
    };

    return conversion[note] || 0;
}

/**
 * Calcule le risque d'échec selon la formule : 1 - (A × C × P)
 */
function calculerRisqueEchec(assiduite, completion, performance) {
    if (assiduite === 0 || completion === 0 || performance === 0) {
        return 1; // Risque maximal
    }
    return 1 - (assiduite * completion * performance);
}

/**
 * Détermine le niveau de risque avec classe CSS
 */
function obtenirClasseRisque(risque) {
    if (risque > 0.7) return 'risque-critique';
    if (risque > 0.5) return 'risque-tres-eleve';
    if (risque > 0.4) return 'risque-eleve';
    if (risque > 0.3) return 'risque-modere';
    if (risque > 0.2) return 'risque-faible';
    return 'risque-minimal';
}

/**
 * Obtient le nom réel d'une cartouche
 */
function obtenirNomCartouche(cartoucheId, grilleId) {
    if (!cartoucheId) return '—';

    // Si pas de grilleId, chercher dans toutes les cartouches
    if (!grilleId) {
        const cartouchesKeys = Object.keys(localStorage).filter(key => key.startsWith('cartouches_'));
        for (let key of cartouchesKeys) {
            const cartouches = JSON.parse(localStorage.getItem(key) || '[]');
            const cartouche = cartouches.find(c => c.id === cartoucheId);
            if (cartouche) return cartouche.nom;
        }
        return cartoucheId; // Retourner l'ID si rien trouvé
    }

    // Chercher dans la grille spécifique
    const cartouchesKey = `cartouches_${grilleId}`;
    const cartouches = JSON.parse(localStorage.getItem(cartouchesKey) || '[]');
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    return cartouche ? cartouche.nom : cartoucheId;
}

/**
 * Obtient la classe CSS ou le style pour une note selon l'échelle
 */
function obtenirClasseNote(note, echelleId) {
    // Si pas d'échelle spécifiée, utiliser les classes par défaut
    if (!echelleId) {
        const classes = {
            'M': 'note-maitrise',
            'I': 'note-intermediaire',
            'D': 'note-developpement',
            'B': 'note-base',
            'O': 'note-observation'
        };
        return classes[note] || '';
    }

    // Chercher l'échelle dans localStorage
    const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        // Fallback sur les classes par défaut si échelle non trouvée
        const classes = {
            'M': 'note-maitrise',
            'I': 'note-intermediaire',
            'D': 'note-developpement',
            'B': 'note-base',
            'O': 'note-observation'
        };
        return classes[note] || '';
    }

    // Trouver le niveau correspondant à la note
    const niveau = echelle.niveaux?.find(n => n.lettre === note || n.nom?.startsWith(note));

    // Si on a une couleur personnalisée, retourner un style inline
    if (niveau && niveau.couleur) {
        // Retourner comme attribut style au lieu de classe
        return `style="background: ${niveau.couleur}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"`;
    }

    // Sinon utiliser les classes par défaut
    const classes = {
        'M': 'note-maitrise',
        'I': 'note-intermediaire',
        'D': 'note-developpement',
        'B': 'note-base',
        'O': 'note-observation'
    };
    return classes[note] || '';
}

/* ===============================
   📋 AFFICHAGE DE LA LISTE
   =============================== */

/**
 * Charge et affiche la liste des évaluations avec accordéon
 */
function chargerListeEvaluationsRefonte() {
    console.log('📋 Chargement de la liste des évaluations...');

    // 🆕 NOUVEAU : Les indices sont maintenant calculés par liste-evaluations.js
    // L'ancien calcul est désactivé pour éviter les conflits de structure

    // Récupérer toutes les données
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const indicesA = JSON.parse(localStorage.getItem('indicesAssiduite') || '{}');
    // 🎯 LECTURE DEPUIS LA SOURCE UNIQUE : portfolio.js génère indicesCP
    const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');

    // Grouper les évaluations par étudiant
    const evaluationsParEtudiant = {};
    evaluations.forEach(evaluation => {
        if (!evaluationsParEtudiant[evaluation.etudiantDA]) {
            evaluationsParEtudiant[evaluation.etudiantDA] = [];
        }
        evaluationsParEtudiant[evaluation.etudiantDA].push(evaluation);
    });

    // Préparer les données pour l'affichage
    donneesEvaluationsFiltrees = etudiants.map(etudiant => {
        const evalsEtudiant = evaluationsParEtudiant[etudiant.da] || [];

        // 🎯 Lire les indices C et P depuis portfolio.js (Single Source of Truth)
        const indicesCPEtudiant = indicesCP[etudiant.da]?.actuel || null;
        const indiceC = indicesCPEtudiant ? indicesCPEtudiant.C / 100 : 0; // Convertir de 0-100 à 0-1
        const indiceP = indicesCPEtudiant ? indicesCPEtudiant.P / 100 : 0;

        return {
            ...etudiant,
            evaluations: evalsEtudiant,
            indices: {
                completion: indiceC,
                performance: indiceP
            }
        };
    });

    // Charger les filtres
    chargerFiltresEvaluations();

    // Afficher la liste
    afficherListeEvaluations(donneesEvaluationsFiltrees);

    // Mettre à jour les statistiques
    mettreAJourStatistiquesEvaluations();

    // Vérifier s'il y a une préférence sauvegardée
    const preference = localStorage.getItem('preferenceTriEvaluations');
    if (preference) {
        // Restaurer la préférence sauvegardée
        restaurerPreferenceTri();
    } else {
        // Appliquer le tri alphabétique par défaut
        document.getElementById('tri-evaluations').value = 'nom-asc';
        trierListeEvaluations();
    }
}

/**
 * Génère le badge de complétion selon les réglages d'affichage
 * @param {Object} etudiant - Données de l'étudiant avec indices
 * @returns {string} HTML du badge
 */
function genererBadgeCompletion(etudiant) {
    // 🎯 Lire depuis la source unique : portfolio.js génère indicesCP
    // Note : Les indices C et P n'ont pas de distinction sommatif/alternatif (uniquement l'indice A)
    const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');
    const indicesCPEtudiant = indicesCP[etudiant.da]?.actuel || null;

    // Convertir de pourcentage (0-100) en proportion (0-1)
    const completion = indicesCPEtudiant ? indicesCPEtudiant.C / 100 : 0;
    const nbArtefacts = etudiant.evaluations.length;

    // Déterminer la couleur selon le taux de complétion
    let couleurFond = '#e8f5e9'; // Vert clair par défaut
    if (completion < 0.5) {
        couleurFond = '#ffebee'; // Rouge clair
    } else if (completion < 0.75) {
        couleurFond = '#fff3e0'; // Orange clair
    }

    // Affichage unique (les indices C et P n'ont pas de modalité sommatif/alternatif)
    return `
        <span class="carte-metrique" style="padding:8px 15px; background: ${couleurFond}; border-radius: 6px;">
            <strong style="font-size: 1.1rem;">C</strong>
            <span style="font-size: 1.1rem; font-weight: 600; margin-left: 8px;">
                ${Math.round(completion * 100)}%
            </span>
            <span style="font-size: 0.75rem; color: #666; margin-left: 5px;">(${nbArtefacts} artefacts)</span>
        </span>
    `;
}

/**
 * Affiche la liste des évaluations en accordéon
 */
function afficherListeEvaluations(donneesEtudiants) {
    const conteneur = document.getElementById('conteneur-evaluations-accordeon');
    const messageVide = document.getElementById('message-aucune-evaluation');

    if (!conteneur) return;

    if (donneesEtudiants.length === 0) {
        conteneur.innerHTML = '';
        conteneur.style.display = 'none';
        messageVide.style.display = 'block';
        return;
    }

    conteneur.style.display = 'block';
    messageVide.style.display = 'none';

    // NE PAS TRIER ICI - Le tri est géré par trierListeEvaluations()
    // La fonction affiche les données dans l'ordre reçu

    // Générer le HTML
    const html = donneesEtudiants.map(etudiant => {
        const classeRisque = obtenirClasseRisque(etudiant.indices.risque);
        const iconToggle = '▶';

        return `
            <div class="carte etudiant-evaluation-carte" data-da="${etudiant.da}">
                <!-- En-tête cliquable -->
                <div class="etudiant-header" onclick="toggleEtudiantEval('${etudiant.da}')" style="cursor:pointer; padding: 15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="toggle-icon" id="toggle-${etudiant.da}">${iconToggle}</span>
                            <strong>${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}</strong>
                            <span class="badge-info">${etudiant.da}</span>
                            <span class="badge-info">${etudiant.groupe || 'Sans groupe'}</span>
                        </div>
                        <div style="display:flex; gap:15px; align-items:center;">
${genererBadgeCompletion(etudiant)}

</div>
                    </div>
                </div>
                
                <!-- Détails cachés par défaut -->
                <div class="etudiant-details" id="details-eval-${etudiant.da}" style="display:none; padding: 0 15px 15px 15px;">
                    ${genererDetailsEtudiant(etudiant)}
                </div>
            </div>
        `;
    }).join('');

    conteneur.innerHTML = html;
}

/**
 * Génère le HTML des détails d'un étudiant
 */
function genererDetailsEtudiant(etudiant) {
    const evaluations = etudiant.evaluations || [];
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    // Créer un tableau avec TOUTES les productions et leur statut
    const tableauComplet = productions.map(production => {
        // Chercher si cette production a été évaluée pour cet étudiant
        const evaluation = evaluations.find(e => e.productionId === production.id);

        return {
            production: production,
            evaluation: evaluation || null
        };
    });

    // Générer le tableau HTML
    const tableauHTML = `
        <table class="tableau" style="margin-top: 15px;">
            <thead>
                <tr>
                    <th>Production</th>
                    <th>Grille</th>
                    <th>Cartouche</th>
                    <th>Note (lettre)</th>
                    <th>Note (%)</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tableauComplet.map(item => {
        if (item.evaluation) {
            // Production évaluée
            const estRemplacee = item.evaluation.remplaceeParId ? true : false;
            const estReprise = item.evaluation.repriseDeId ? true : false;

            return `
                            <tr ${estRemplacee ? 'style="opacity: 0.6; background: #f5f5f5;"' : ''}>
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
                                <td>${echapperHtml(item.evaluation.grilleNom || '—')}</td>
                                <td>${echapperHtml(obtenirNomCartouche(item.evaluation.cartoucheId, item.evaluation.grilleId) || '—')}</td>

                                <td>
                                    <span ${obtenirClasseNote(item.evaluation.niveauFinal, item.evaluation.echelleId)}>

                                        ${item.evaluation.niveauFinal || '—'}
                                    </span>
                                </td>
                                <td>${Math.round(item.evaluation.noteFinale) || '—'}%</td>
                                <td>
                                    <span class="badge-statut badge-succes">
                                        ${estRemplacee ? 'Remplacée' : 'Évalué'}
                                    </span>
                                </td>
                                <td>${item.evaluation.dateEvaluation ? new Date(item.evaluation.dateEvaluation).toLocaleDateString('fr-CA') : '—'}</td>
                                <td>
                                    ${estRemplacee ? `
                                        <span style="color: #999; font-size: 0.85rem; font-style: italic;">
                                            Évaluation archivée
                                        </span>
                                    ` : item.evaluation.verrouillee ? `
                                        <button class="btn btn-annuler btn-compact" onclick="deverrouillerEvaluation('${item.evaluation.id}')">
                                            Déverrouiller
                                        </button>
                                        <button class="btn btn-supprimer btn-compact" disabled title="Déverrouillez d'abord pour supprimer">
                                            Supprimer
                                        </button>
                                    ` : `
                                        <button class="btn btn-modifier btn-compact" onclick="modifierEvaluation('${item.evaluation.id}')">
                                            Modifier
                                        </button>
                                        <button class="btn btn-annuler btn-compact" onclick="verrouillerEvaluation('${item.evaluation.id}')">
                                            Verrouiller
                                        </button>
                                        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluation('${item.evaluation.id}')">
                                            Supprimer
                                        </button>
                                    `}
                                </td>
                            </tr>
                        `;
        } else {
            // Production non évaluée
            return `
                            <tr style="opacity: 0.7;">
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
                                <td>—</td>
                                <td>—</td>
                                <td>—</td>
                                <td>
                                    <span class="badge-statut">
                                        Non remis
                                    </span>
                                </td>
                                <td>—</td>
                                <td>
                                    <button class="btn btn-confirmer btn-compact" onclick="evaluerProduction('${etudiant.da}', '${item.production.id}')">
                                        Évaluer
                                    </button>
                                </td>
                            </tr>
                        `;
        }
    }).join('')}
            </tbody>
        </table>
    `;

    // Ajouter le résumé
    const nbAttendus = productions.filter(p => p.type !== 'portfolio').length;
    const nbRemis = evaluations.filter(e => !e.remplaceeParId).length; // Ne compter que les évaluations actives
    const nbRemplacees = evaluations.filter(e => e.remplaceeParId).length;
    const nbReprises = evaluations.filter(e => e.repriseDeId).length;

    const resumeHTML = `
        <div class="carte" style="margin-top: 15px; background: var(--bleu-pale);">
            <h4 style="margin-bottom: 10px;">Résumé de l'étudiant</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <strong>Artefacts remis:</strong> ${nbRemis} / ${nbAttendus}
                    (${Math.round(etudiant.indices.completion * 100)}%)
                </div>
                <div>
                    <strong>Performance moyenne:</strong> ${Math.round(etudiant.indices.performance * 100)}%
                </div>
                <div>
                    <strong>Tendance:</strong> ${obtenirTendance(evaluations.filter(e => !e.remplaceeParId))}
                </div>
            </div>
            ${nbReprises > 0 ? `
                <div style="margin-top: 15px; padding: 10px; background: #f3e5f5; border-radius: 6px; border-left: 4px solid #9c27b0;">
                    <strong>Jetons de reprise appliqués:</strong> ${nbReprises}<br>
                    <span style="font-size: 0.85rem; color: #666;">
                        ${nbRemplacees} évaluation${nbRemplacees > 1 ? 's' : ''} remplacée${nbRemplacees > 1 ? 's' : ''} (archivée${nbRemplacees > 1 ? 's' : ''}, ne compte${nbRemplacees > 1 ? 'nt' : ''} plus dans les indices)
                    </span>
                </div>
            ` : ''}
        </div>
    `;

    return tableauHTML + resumeHTML;
}

/**
 * Toggle l'affichage des détails d'un étudiant
 */
function toggleEtudiantEval(da) {
    const details = document.getElementById(`details-eval-${da}`);
    const toggle = document.getElementById(`toggle-${da}`);

    if (!details) return;

    if (details.style.display === 'none') {
        details.style.display = 'block';
        if (toggle) toggle.textContent = '▼';
    } else {
        details.style.display = 'none';
        if (toggle) toggle.textContent = '▶';
    }
}

/* ===============================
   🔍 FILTRAGE
   =============================== */

/**
 * Charge les options de filtrage
 */
function chargerFiltresEvaluations() {
    // Charger les groupes
    const selectGroupe = document.getElementById('filtre-groupe-eval');
    if (selectGroupe) {
        const groupes = [...new Set(donneesEvaluationsFiltrees.map(e => e.groupe).filter(g => g))];
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';
        groupes.sort().forEach(groupe => {
            selectGroupe.innerHTML += `<option value="${groupe}">Groupe ${groupe}</option>`;
        });
    }

    // Charger les productions
    const selectProduction = document.getElementById('filtre-production-eval');
    if (selectProduction) {
        const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>';
        productions.forEach(prod => {
            selectProduction.innerHTML += `<option value="${prod.id}">${echapperHtml(prod.titre || prod.nom)}</option>`;
        });
    }
}

/**
 * Filtre la liste selon les critères sélectionnés
 */
function filtrerListeEvaluations() {
    const filtreGroupe = document.getElementById('filtre-groupe-eval')?.value;
    const filtreProduction = document.getElementById('filtre-production-eval')?.value;
    const filtreStatut = document.getElementById('filtre-statut-eval')?.value;

    let donneesFiltrees = [...donneesEvaluationsFiltrees];

    // Filtrer par groupe
    if (filtreGroupe) {
        donneesFiltrees = donneesFiltrees.filter(e => e.groupe === filtreGroupe);
    }

    // Filtrer par production
    if (filtreProduction) {
        donneesFiltrees = donneesFiltrees.filter(e =>
            e.evaluations.some(evaluation => eval.productionId === filtreProduction)
        );
    }

    // Filtrer par statut
    if (filtreStatut === 'evalues') {
        donneesFiltrees = donneesFiltrees.filter(e => e.evaluations.length > 0);
    } else if (filtreStatut === 'non-evalues') {
        donneesFiltrees = donneesFiltrees.filter(e => e.evaluations.length === 0);
    } else if (filtreStatut === 'risque') {
        donneesFiltrees = donneesFiltrees.filter(e => e.indices.risque > 0.4);
    }

    // Afficher les résultats filtrés
    afficherListeEvaluations(donneesFiltrees);

    // Afficher les résultats filtrés
    afficherListeEvaluations(donneesFiltrees);

    // AJOUTER : Réappliquer le tri actuel
    trierListeEvaluations();
}

/**
 * Réinitialise tous les filtres
 */
function reinitialiserFiltresEval() {
    document.getElementById('filtre-groupe-eval').value = '';
    document.getElementById('filtre-production-eval').value = '';
    document.getElementById('filtre-statut-eval').value = '';
    afficherListeEvaluations(donneesEvaluationsFiltrees);
}

/**
 * Trie la liste des évaluations selon le critère sélectionné
 */
function trierListeEvaluations() {
    const selectTri = document.getElementById('tri-evaluations');
    if (!selectTri) return;

    const critere = selectTri.value;
    let donneesTries = [...donneesEvaluationsFiltrees];

    // Debug - voir avant le tri
    console.log('Avant tri:', donneesTries.map(e => e.nom).slice(0, 5));

    switch (critere) {
        case 'nom-asc':
            donneesTries.sort((a, b) => {
                const nomA = (a.nom || '').toLowerCase();
                const nomB = (b.nom || '').toLowerCase();
                return nomA.localeCompare(nomB, 'fr');
            });
            break;

        case 'completion-asc':
            donneesTries.sort((a, b) => a.indices.completion - b.indices.completion);
            break;

        case 'completion-desc':
            donneesTries.sort((a, b) => b.indices.completion - a.indices.completion);
            break;
    }

    // Debug - voir après le tri
    console.log('Après tri:', donneesTries.map(e => e.nom).slice(0, 5));

    // IMPORTANT : Mettre à jour la variable globale
    donneesEvaluationsFiltrees = donneesTries;

    // Réafficher avec les données triées
    afficherListeEvaluations(donneesTries);

    // Sauvegarder la préférence
    localStorage.setItem('preferenceTriEvaluations', critere);
}

/**
 * Restaure la préférence de tri sauvegardée
 */
function restaurerPreferenceTri() {
    const preference = localStorage.getItem('preferenceTriEvaluations');
    if (preference) {
        const selectTri = document.getElementById('tri-evaluations');
        if (selectTri) {
            selectTri.value = preference;
            trierListeEvaluations();
        }
    }
}

/**
 * Restaure la préférence de tri sauvegardée
 */
function restaurerPreferenceTri() {
    const preference = localStorage.getItem('preferenceTriEvaluations');
    if (preference) {
        const selectTri = document.getElementById('tri-evaluations');
        if (selectTri) {
            selectTri.value = preference;
            trierListeEvaluations();
        }
    }
}

/* ===============================
   📊 STATISTIQUES
   =============================== */

/**
 * Met à jour les statistiques globales
 */
function mettreAJourStatistiquesEvaluations() {
    const etudiants = donneesEvaluationsFiltrees;
    const nbEtudiants = etudiants.length;
    const etudiantsEvalues = etudiants.filter(e => e.evaluations.length > 0).length;

    // 🎯 Calculer le total d'artefacts DONNÉS (même logique que portfolio.js)
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    // Identifier les artefacts-portfolio
    const artefactsPortfolioIds = new Set(
        productions
            .filter(p => p.type === 'artefact-portfolio')
            .map(a => a.id)
    );

    // Identifier les artefacts réellement donnés (avec au moins une évaluation)
    const artefactsDonnes = new Set();
    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            artefactsDonnes.add(evaluation.productionId);
        }
    });

    const nbArtefactsDonnes = artefactsDonnes.size;
    const totalArtefactsAttendus = nbEtudiants * nbArtefactsDonnes;
    const totalArtefactsRemis = etudiants.reduce((sum, e) => sum + e.evaluations.length, 0);

    // Calculer les moyennes C et P
    const moyenneC = nbEtudiants > 0
        ? etudiants.reduce((sum, e) => sum + (e.indices.completion || 0), 0) / nbEtudiants
        : 0;
    const moyenneP = nbEtudiants > 0
        ? etudiants.reduce((sum, e) => sum + (e.indices.performance || 0), 0) / nbEtudiants
        : 0;

    // Mettre à jour l'affichage
    const statEtudiants = document.getElementById('stat-etudiants-evalues');
    if (statEtudiants) {
        statEtudiants.textContent = `${etudiantsEvalues}/${nbEtudiants}`;
    }

    const statArtefacts = document.getElementById('stat-artefacts-completes');
    if (statArtefacts) {
        statArtefacts.textContent = `${totalArtefactsRemis}/${totalArtefactsAttendus}`;
    }

    const statMoyenne = document.getElementById('stat-moyenne-groupe');
    if (statMoyenne) {
        statMoyenne.innerHTML = `<strong>C:</strong> ${Math.round(moyenneC * 100)}%`;
    }
}

/* ===============================
   🔧 FONCTIONS UTILITAIRES
   =============================== */

// ✅ Fonction obtenirNomCartouche() supprimée (doublon incorrect)
// La version correcte est définie ligne 1107

/**
 * Obtient la classe CSS pour une note
 */
function obtenirClasseNote(note) {
    const classes = {
        'M': 'note-maitrise',
        'I': 'note-intermediaire',
        'D': 'note-developpement',
        'B': 'note-base',
        'O': 'note-observation'
    };
    return classes[note] || '';
}

/**
 * Formate une date ISO en format lisible
 */
function formaterDate(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO);
    return date.toLocaleDateString('fr-CA');
}

/**
 * Détermine la tendance d'un étudiant
 */
function obtenirTendance(evaluations) {
    if (evaluations.length < 2) return '—';

    // Comparer les 2 dernières évaluations
    const derniere = convertirNoteEnValeur(evaluations[0].niveauFinal);
    const avantDerniere = convertirNoteEnValeur(evaluations[1].niveauFinal);

    if (derniere > avantDerniere) return '↗ En progression';
    if (derniere < avantDerniere) return '↘ En régression';
    return '→ Stable';
}

/**
 * Fonction utilitaire pour échapper le HTML
 */
function echapperHtml(texte) {
    if (!texte) return '';
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
}

/* ===============================
   🚀 INITIALISATION
   =============================== */

/**
 * Ajouter à la fonction d'initialisation existante
 */
function initialiserListeEvaluations() {
    console.log('📋 Initialisation de la liste des évaluations');

    const sousSection = document.getElementById('evaluations-liste');
    if (!sousSection) {
        console.log('⚠️ Sous-section liste évaluations non trouvée');
        return;
    }

    // Charger la liste refaite
    chargerListeEvaluationsRefonte();

    console.log('✅ Liste des évaluations initialisée');
}

// Appeler lors du changement vers cette sous-section
// Ou ajouter dans le module existant

/* ===============================
   🔄 MODE ÉVALUATION EN SÉRIE
   Mémorisation et navigation fluide pour évaluer plusieurs étudiants
   =============================== */

/**
 * Mémorise les sélections actuelles pour réutilisation
 * Appelée automatiquement lors des changements de select
 */
function memoriserSelectionsEvaluation() {
    const selections = {
        production: document.getElementById('selectProduction1')?.value || '',
        grille: document.getElementById('selectGrille1')?.value || '',
        echelle: document.getElementById('selectEchelle1')?.value || '',
        cartouche: document.getElementById('selectCartoucheEval')?.value || '',
        remise: document.getElementById('remiseProduction1')?.value || 'remis',
        // Options d'affichage
        afficherDescription: document.getElementById('afficherDescription1')?.checked ?? true,
        afficherObjectif: document.getElementById('afficherObjectif1')?.checked ?? true,
        afficherTache: document.getElementById('afficherTache1')?.checked ?? true,
        afficherAdresse: document.getElementById('afficherAdresse1')?.checked ?? true,
        afficherContexte: document.getElementById('afficherContexte1')?.checked ?? true
    };

    localStorage.setItem('dernieresSelectionsEvaluation', JSON.stringify(selections));
    console.log('✅ Sélections mémorisées');
}

/**
 * Restaure les dernières sélections utilisées
 * Appelée lors du passage à un nouvel étudiant
 */
function restaurerSelectionsEvaluation() {
    const selectionsJson = localStorage.getItem('dernieresSelectionsEvaluation');
    if (!selectionsJson) return;

    try {
        const selections = JSON.parse(selectionsJson);

        // Restaurer les selects
        const selectProduction = document.getElementById('selectProduction1');
        const selectGrille = document.getElementById('selectGrille1');
        const selectEchelle = document.getElementById('selectEchelle1');
        const selectCartouche = document.getElementById('selectCartoucheEval');
        const selectRemise = document.getElementById('remiseProduction1');

        if (selectProduction && selections.production) {
            selectProduction.value = selections.production;
            // Déclencher le changement pour charger les dépendances
            const event = new Event('change', { bubbles: true });
            selectProduction.dispatchEvent(event);
        }

        // Attendre un court instant pour que les selects dépendants se remplissent
        setTimeout(() => {
            if (selectGrille && selections.grille) {
                selectGrille.value = selections.grille;
                selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
            }

            setTimeout(() => {
                if (selectEchelle && selections.echelle) {
                    selectEchelle.value = selections.echelle;
                }
                if (selectCartouche && selections.cartouche) {
                    selectCartouche.value = selections.cartouche;
                    selectCartouche.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (selectRemise && selections.remise) {
                    selectRemise.value = selections.remise;
                    selectRemise.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Restaurer les options d'affichage
                const checkboxes = {
                    'afficherDescription1': selections.afficherDescription,
                    'afficherObjectif1': selections.afficherObjectif,
                    'afficherTache1': selections.afficherTache,
                    'afficherAdresse1': selections.afficherAdresse,
                    'afficherContexte1': selections.afficherContexte
                };

                Object.entries(checkboxes).forEach(([id, value]) => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) checkbox.checked = value ?? true;
                });

                console.log('✅ Sélections restaurées');

                // Après restauration, vérifier s'il existe une évaluation sauvegardée pour cet étudiant
                setTimeout(() => {
                    verifierEtChargerEvaluationExistante();
                }, 200);
            }, 100);
        }, 100);
    } catch (error) {
        console.error('Erreur lors de la restauration des sélections:', error);
    }
}

/**
 * Vérifie s'il existe une évaluation sauvegardée pour l'étudiant et la production actuels
 * et charge les niveaux de maîtrise si elle existe
 */
function verifierEtChargerEvaluationExistante() {
    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    if (!etudiantDA || !productionId) {
        console.log('⏭️ Pas d\'étudiant ou de production sélectionné, skip');
        return;
    }

    // Chercher une évaluation existante
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationExistante = evaluations.find(e =>
        e.etudiantDA === etudiantDA &&
        e.productionId === productionId &&
        !e.remplaceeParId // Exclure les évaluations remplacées par un jeton
    );

    if (!evaluationExistante) {
        console.log('ℹ️ Aucune évaluation existante pour cet étudiant et cette production');

        // Masquer l'indicateur de verrouillage et réactiver le formulaire
        afficherOuMasquerBoutonVerrouillage(false);
        desactiverFormulaireEvaluation(false);

        // Réinitialiser l'ID de modification si présent
        if (window.evaluationEnCours?.idModification) {
            delete window.evaluationEnCours.idModification;
        }

        return;
    }

    console.log('📂 Évaluation existante trouvée, chargement des niveaux...', evaluationExistante);

    // Charger les niveaux de maîtrise dans les selects de critères
    // Attendre que les selects soient générés
    setTimeout(() => {
        let criteresCharges = 0;

        evaluationExistante.criteres.forEach(critere => {
            const selectId = `eval_${critere.critereId}`;
            const selectCritere = document.getElementById(selectId);

            if (selectCritere) {
                selectCritere.value = critere.niveauSelectionne;
                selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
                criteresCharges++;
            }
        });

        console.log(`✅ ${criteresCharges}/${evaluationExistante.criteres.length} niveaux de maîtrise chargés`);

        // Charger la rétroaction finale
        const retroaction = document.getElementById('retroactionFinale1');
        if (retroaction && evaluationExistante.retroactionFinale) {
            retroaction.value = evaluationExistante.retroactionFinale;
        }

        // Mettre à jour evaluationEnCours pour indiquer qu'on modifie cette évaluation
        if (window.evaluationEnCours) {
            window.evaluationEnCours.idModification = evaluationExistante.id;
            window.evaluationEnCours.criteres = {};
            evaluationExistante.criteres.forEach(c => {
                window.evaluationEnCours.criteres[c.critereId] = c.niveauSelectionne;
            });

            // Afficher l'indicateur de verrouillage si l'évaluation existe
            afficherOuMasquerBoutonVerrouillage(true, evaluationExistante.verrouillee || false);

            // Désactiver le formulaire si l'évaluation est verrouillée
            if (evaluationExistante.verrouillee) {
                desactiverFormulaireEvaluation(true);
            } else {
                desactiverFormulaireEvaluation(false);
            }
        }

        // Recalculer la note
        setTimeout(() => {
            if (typeof calculerNoteTotale === 'function') {
                calculerNoteTotale();
            }
        }, 100);
    }, 300);
}

/**
 * Navigue vers l'étudiant précédent dans la liste
 */
function naviguerEtudiantPrecedent() {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant || !selectEtudiant.value) return;

    const options = Array.from(selectEtudiant.options).filter(opt => opt.value !== '');
    const indexActuel = options.findIndex(opt => opt.value === selectEtudiant.value);

    if (indexActuel > 0) {
        selectEtudiant.value = options[indexActuel - 1].value;
        selectEtudiant.dispatchEvent(new Event('change', { bubbles: true }));

        // Restaurer les sélections
        setTimeout(() => restaurerSelectionsEvaluation(), 300);

        mettreAJourIndicateurProgression();
    }
}

/**
 * Navigue vers l'étudiant suivant dans la liste
 */
function naviguerEtudiantSuivant() {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant || !selectEtudiant.value) return;

    const options = Array.from(selectEtudiant.options).filter(opt => opt.value !== '');
    const indexActuel = options.findIndex(opt => opt.value === selectEtudiant.value);

    if (indexActuel >= 0 && indexActuel < options.length - 1) {
        selectEtudiant.value = options[indexActuel + 1].value;
        selectEtudiant.dispatchEvent(new Event('change', { bubbles: true }));

        // Restaurer les sélections
        setTimeout(() => restaurerSelectionsEvaluation(), 300);

        mettreAJourIndicateurProgression();
    }
}

/**
 * Met à jour l'indicateur de progression (X/Y évaluations réalisées)
 */
function mettreAJourIndicateurProgression() {
    const selectProduction = document.getElementById('selectProduction1');
    const indicateur = document.getElementById('indicateurProgressionEval');

    if (!selectProduction || !indicateur) return;

    const productionId = selectProduction.value;

    // Si aucune production sélectionnée, masquer l'indicateur
    if (!productionId) {
        indicateur.style.display = 'none';
        return;
    }

    // Compter le nombre total d'étudiants actifs
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );
    const totalEtudiants = etudiantsActifs.length;

    // Compter les évaluations déjà réalisées pour cette production
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationsProduction = evaluations.filter(e => e.productionId === productionId);

    // Compter les étudiants uniques évalués (au cas où il y aurait plusieurs évaluations par étudiant)
    const etudiantsEvalues = new Set(evaluationsProduction.map(e => e.etudiantDA));
    const nbEvaluations = etudiantsEvalues.size;

    // Afficher le compteur
    indicateur.textContent = `${nbEvaluations}/${totalEtudiants} évaluations`;
    indicateur.style.display = 'inline-block';

    // Changer la couleur selon la progression
    if (nbEvaluations === totalEtudiants) {
        indicateur.style.color = '#28a745'; // Vert - Terminé
    } else if (nbEvaluations > totalEtudiants / 2) {
        indicateur.style.color = '#ffc107'; // Jaune - En cours
    } else {
        indicateur.style.color = 'var(--bleu-principal)'; // Bleu - Début
    }
}

/**
 * Attache les événements de mémorisation aux selects
 * Appelée lors de l'initialisation du module
 */
function attacherEvenementsMemorisation() {
    const selectsAMemoriser = [
        'selectProduction1',
        'selectGrille1',
        'selectEchelle1',
        'selectCartoucheEval',
        'remiseProduction1'
    ];

    selectsAMemoriser.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', memoriserSelectionsEvaluation);
        }
    });

    // Mémoriser aussi les checkboxes
    const checkboxesAMemoriser = [
        'afficherDescription1',
        'afficherObjectif1',
        'afficherTache1',
        'afficherAdresse1',
        'afficherContexte1'
    ];

    checkboxesAMemoriser.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', memoriserSelectionsEvaluation);
        }
    });

    console.log('✅ Événements de mémorisation attachés');
}

/**
 * Insère les boutons de navigation et l'indicateur dans l'interface
 */
function insererNavigationEvaluationSerie() {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant) return;

    // Vérifier si déjà inséré
    if (document.getElementById('navigationEvaluationSerie')) return;

    // Créer le conteneur de navigation
    const nav = document.createElement('div');
    nav.id = 'navigationEvaluationSerie';
    nav.style.cssText = 'display: flex; gap: 10px; align-items: center; margin: 15px 0; justify-content: center;';

    nav.innerHTML = `
        <button class="btn btn-principal" onclick="naviguerEtudiantPrecedent()"
                title="Évaluer l'étudiant·e précédent·e"
                style="padding: 8px 12px; min-width: auto;">
            ←
        </button>

        <span id="indicateurProgressionEval"
              style="font-weight: 600; color: var(--bleu-principal); padding: 0 15px; display: none;">
            Étudiant·e 1/25
        </span>

        <button class="btn btn-principal" onclick="naviguerEtudiantSuivant()"
                title="Évaluer l'étudiant·e suivant·e"
                style="padding: 8px 12px; min-width: auto;">
            →
        </button>
    `;

    // Insérer après le select étudiant
    const parentContainer = selectEtudiant.closest('.form-group') || selectEtudiant.parentElement;
    if (parentContainer && parentContainer.nextSibling) {
        parentContainer.parentNode.insertBefore(nav, parentContainer.nextSibling);
    } else {
        selectEtudiant.parentElement?.appendChild(nav);
    }

    console.log('✅ Navigation évaluation en série insérée');
}

/**
 * Initialise le mode évaluation en série
 * À appeler depuis initialiserModuleEvaluation()
 */
function initialiserModeEvaluationSerie() {
    // Insérer l'interface de navigation
    insererNavigationEvaluationSerie();

    // Attacher les événements de mémorisation
    attacherEvenementsMemorisation();

    // Restaurer les dernières sélections si elles existent
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (selectEtudiant && selectEtudiant.value) {
        restaurerSelectionsEvaluation();
    }

    // Mettre à jour l'indicateur lors des changements
    selectEtudiant?.addEventListener('change', mettreAJourIndicateurProgression);

    // Mettre à jour aussi lors du changement de production
    const selectProduction = document.getElementById('selectProduction1');
    selectProduction?.addEventListener('change', mettreAJourIndicateurProgression);

    mettreAJourIndicateurProgression();

    console.log('✅ Mode évaluation en série initialisé');
}

/* ===============================
   🔄 REPRISE ET VERROUILLAGE D'ÉVALUATIONS
   =============================== */

/**
 * Charge une évaluation existante dans le formulaire pour modification
 * Utilisé notamment lors de l'application de jetons de reprise
 * @param {string} evaluationId - ID de l'évaluation à charger
 */

/**
 * ✨ FALLBACK: Extrait les niveaux des critères depuis la rétroaction
 * Utilisé quand evaluation.criteres est vide mais que la rétroaction contient les niveaux
 * Format attendu : "STRUCTURE (I) : commentaire..."
 */
function extraireNiveauxDepuisRetroaction(retroaction, grille) {
    if (!retroaction || !grille) return {};

    const niveauxExtrait = {};

    // Regex pour capturer : NOM_CRITERE (NIVEAU)
    // Ex: "STRUCTURE (I)" ou "PLAUSIBILITÉ (M)"
    const regex = /([A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ\s]+)\s*\(([IDMBE])\)/gi;
    let match;

    while ((match = regex.exec(retroaction)) !== null) {
        const nomCritere = match[1].trim();
        const niveau = match[2].toUpperCase();

        // Trouver le critère correspondant dans la grille
        const critere = grille.criteres.find(c =>
            c.nom.toUpperCase() === nomCritere.toUpperCase()
        );

        if (critere) {
            niveauxExtrait[critere.id] = niveau;
            console.log(`  ✅ Extrait : ${nomCritere} → ${niveau}`);
        } else {
            console.warn(`  ⚠️ Critère non trouvé dans la grille : ${nomCritere}`);
        }
    }

    return niveauxExtrait;
}

/**
 * Affiche le modal d'explication pour la réparation des évaluations
 */
function afficherModalReparationEvaluations() {
    document.getElementById('modalReparationEvaluations').classList.add('actif');
}

/**
 * Ferme le modal de réparation
 */
function fermerModalReparationEvaluations() {
    document.getElementById('modalReparationEvaluations').classList.remove('actif');
}

/**
 * Lance la réparation après confirmation via le modal
 */
function lancerReparationEvaluations() {
    // Fermer le modal
    fermerModalReparationEvaluations();

    // Lancer la réparation
    reparer_evaluations_criteres_manquants();
}

/**
 * 🔧 FONCTION DE RÉPARATION : Migre les évaluations avec critères manquants
 * Parcourt toutes les évaluations et extrait les critères depuis la rétroaction si absents
 * ⚠️ À utiliser manuellement en cas de pépin (ne s'active PAS automatiquement)
 */
function reparer_evaluations_criteres_manquants() {
    console.log('🔧 Début de la réparation des évaluations...');

    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');

    let nbEvaluationsReparees = 0;
    let nbEvaluationsIgnorees = 0;
    let nbEchoues = 0;

    const rapport = [];

    evaluations.forEach(evaluation => {
        // Vérifier si les critères sont absents ou vides
        const criteresMissing = !evaluation.criteres ||
                               !Array.isArray(evaluation.criteres) ||
                               evaluation.criteres.length === 0;

        if (criteresMissing) {
            console.log(`\n📋 Évaluation à réparer : ${evaluation.etudiantNom} - ${evaluation.productionNom}`);

            // Récupérer la grille
            const grille = grilles.find(g => g.id === evaluation.grilleId);

            if (!grille) {
                console.warn(`  ❌ Grille introuvable (ID: ${evaluation.grilleId})`);
                nbEchoues++;
                rapport.push(`❌ ${evaluation.etudiantNom} - ${evaluation.productionNom} : Grille introuvable`);
                return;
            }

            if (!evaluation.retroactionFinale) {
                console.warn(`  ❌ Aucune rétroaction disponible`);
                nbEchoues++;
                rapport.push(`❌ ${evaluation.etudiantNom} - ${evaluation.productionNom} : Pas de rétroaction`);
                return;
            }

            // Extraire les niveaux
            const niveauxExtrait = extraireNiveauxDepuisRetroaction(evaluation.retroactionFinale, grille);
            const nbExtrait = Object.keys(niveauxExtrait).length;

            if (nbExtrait > 0) {
                // Créer le tableau criteres
                evaluation.criteres = Object.keys(niveauxExtrait).map(critereId => {
                    const critere = grille.criteres.find(c => c.id === critereId);
                    return {
                        critereId: critereId,
                        critereNom: critere ? critere.nom : critereId,
                        niveauSelectionne: niveauxExtrait[critereId],
                        retroaction: '', // Pas de rétroaction individuelle disponible
                        ponderation: critere ? critere.ponderation : 0
                    };
                });

                console.log(`  ✅ ${nbExtrait} critère(s) restauré(s)`);
                nbEvaluationsReparees++;
                rapport.push(`✅ ${evaluation.etudiantNom} - ${evaluation.productionNom} : ${nbExtrait} critère(s) restauré(s)`);
            } else {
                console.warn(`  ⚠️ Aucun critère extrait de la rétroaction`);
                nbEchoues++;
                rapport.push(`⚠️ ${evaluation.etudiantNom} - ${evaluation.productionNom} : Extraction échouée`);
            }
        } else {
            nbEvaluationsIgnorees++;
        }
    });

    // Sauvegarder les modifications
    if (nbEvaluationsReparees > 0) {
        localStorage.setItem('evaluationsSauvegardees', JSON.stringify(evaluations));
        console.log(`\n💾 ${nbEvaluationsReparees} évaluation(s) sauvegardée(s)`);
    }

    // Rapport final
    console.log('\n📊 RAPPORT DE RÉPARATION :');
    console.log(`  ✅ Réparées : ${nbEvaluationsReparees}`);
    console.log(`  ⏭️ Ignorées (déjà OK) : ${nbEvaluationsIgnorees}`);
    console.log(`  ❌ Échecs : ${nbEchoues}`);
    console.log('\n📋 Détails :');
    rapport.forEach(ligne => console.log(`  ${ligne}`));

    // Notification utilisateur
    if (nbEvaluationsReparees > 0) {
        alert(`✅ Réparation terminée !\n\n` +
              `• ${nbEvaluationsReparees} évaluation(s) réparée(s)\n` +
              `• ${nbEvaluationsIgnorees} évaluation(s) déjà OK\n` +
              `• ${nbEchoues} échec(s)\n\n` +
              `Consultez la console (F12) pour les détails.`);
    } else {
        alert(`ℹ️ Aucune évaluation à réparer.\n\n` +
              `• ${nbEvaluationsIgnorees} évaluation(s) ont déjà leurs critères.\n` +
              `• ${nbEchoues} échec(s)`);
    }

    return {
        reparees: nbEvaluationsReparees,
        ignorees: nbEvaluationsIgnorees,
        echouees: nbEchoues,
        rapport: rapport
    };
}

function modifierEvaluation(evaluationId) {
    console.log('📝 Chargement de l\'évaluation:', evaluationId);

    // Récupérer l'évaluation
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // DEBUG: Afficher la structure de l'évaluation
    console.log('🔍 Évaluation trouvée:', {
        id: evaluation.id,
        etudiant: evaluation.etudiantNom,
        production: evaluation.productionNom,
        nbCriteres: evaluation.criteres?.length || 0,
        criteres: evaluation.criteres
    });

    // Note: On permet le chargement même si l'évaluation est verrouillée
    // Le formulaire sera simplement désactivé en mode lecture seule
    const estVerrouillee = evaluation.verrouillee || false;

    // Naviguer vers la section d'évaluation
    afficherSousSection('evaluations-individuelles');

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Charger l'étudiant
        const selectEtudiant = document.getElementById('selectEtudiantEval');
        if (selectEtudiant) {
            selectEtudiant.value = evaluation.etudiantDA;
            selectEtudiant.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Charger les sélections avec délais pour respecter les dépendances
        setTimeout(() => {
            // Production
            const selectProduction = document.getElementById('selectProduction1');
            if (selectProduction) {
                selectProduction.value = evaluation.productionId;
                selectProduction.dispatchEvent(new Event('change', { bubbles: true }));
            }

            setTimeout(() => {
                // Grille
                const selectGrille = document.getElementById('selectGrille1');
                if (selectGrille) {
                    selectGrille.value = evaluation.grilleId;
                    selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
                }

                setTimeout(() => {
                    // ⚠️ IMPORTANT : Initialiser evaluationEnCours AVANT de déclencher les événements
                    // Sinon cartoucheSelectionnee() retourne immédiatement car evaluationEnCours n'existe pas
                    console.log('🔧 Initialisation de evaluationEnCours AVANT les événements...');
                    window.evaluationEnCours = {
                        etudiantDA: evaluation.etudiantDA,
                        productionId: evaluation.productionId,
                        grilleId: evaluation.grilleId,
                        echelleId: evaluation.echelleId,
                        cartoucheId: evaluation.cartoucheId,
                        statutRemise: evaluation.statutRemise,
                        criteres: {},
                        idModification: evaluationId
                    };

                    // Pré-remplir les critères depuis l'évaluation chargée
                    if (evaluation.criteres && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0) {
                        evaluation.criteres.forEach(critere => {
                            window.evaluationEnCours.criteres[critere.critereId] = critere.niveauSelectionne;
                        });
                        console.log(`✅ ${evaluation.criteres.length} critères chargés depuis evaluation.criteres`);
                    } else {
                        // ✨ FALLBACK : Extraire les niveaux depuis la rétroaction
                        console.warn('⚠️ Aucun critère dans evaluation.criteres, tentative d\'extraction depuis la rétroaction...');

                        const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
                        const grille = grilles.find(g => g.id === evaluation.grilleId);

                        if (grille && evaluation.retroactionFinale) {
                            const niveauxExtrait = extraireNiveauxDepuisRetroaction(evaluation.retroactionFinale, grille);
                            const nbExtrait = Object.keys(niveauxExtrait).length;

                            if (nbExtrait > 0) {
                                window.evaluationEnCours.criteres = niveauxExtrait;
                                console.log(`✅ ${nbExtrait} niveau(x) extrait(s) depuis la rétroaction`);

                                // Créer un tableau evaluation.criteres temporaire pour le chargement
                                evaluation.criteres = Object.keys(niveauxExtrait).map(critereId => {
                                    const critere = grille.criteres.find(c => c.id === critereId);
                                    return {
                                        critereId: critereId,
                                        critereNom: critere ? critere.nom : critereId,
                                        niveauSelectionne: niveauxExtrait[critereId]
                                    };
                                });
                            } else {
                                console.warn('❌ Aucun niveau trouvé dans la rétroaction');
                            }
                        }
                    }

                    console.log('✅ evaluationEnCours initialisé:', window.evaluationEnCours);

                    // Échelle
                    const selectEchelle = document.getElementById('selectEchelle1');
                    if (selectEchelle) {
                        selectEchelle.value = evaluation.echelleId;
                        console.log('🔧 Déclenchement de l\'événement change sur selectEchelle...');
                        selectEchelle.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    // Cartouche - maintenant evaluationEnCours existe, cartoucheSelectionnee() va fonctionner
                    const selectCartouche = document.getElementById('selectCartoucheEval');
                    if (selectCartouche) {
                        selectCartouche.value = evaluation.cartoucheId;
                        console.log('🔧 Déclenchement de l\'événement change sur selectCartouche...');
                        selectCartouche.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    // Statut de remise
                    const selectRemise = document.getElementById('remiseProduction1');
                    if (selectRemise) {
                        selectRemise.value = evaluation.statutRemise;
                        console.log('🔧 Déclenchement de l\'événement change sur selectRemise...');
                        selectRemise.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    // Attendre que la cartouche et le statut de remise génèrent les critères
                    // Utiliser une vérification active au lieu d'un délai fixe
                    const attendreEtChargerCriteres = () => {
                        console.log('🔄 Démarrage de l\'attente des selects de critères...');

                        // ✅ Vérifier si l'évaluation a des critères à charger
                        if (!evaluation.criteres || !Array.isArray(evaluation.criteres) || evaluation.criteres.length === 0) {
                            console.warn('⚠️ Aucun critère à charger (tableau vide ou undefined). Le formulaire sera affiché vide.');
                            console.log('💡 Vous pouvez maintenant remplir les critères manuellement.');
                            return;
                        }

                        console.log('📋 Critères à charger:', evaluation.criteres.map(c => ({
                            id: c.critereId,
                            nom: c.critereNom,
                            niveau: c.niveauSelectionne
                        })));

                        let tentatives = 0;
                        const maxTentatives = 20; // Max 2 secondes (20 x 100ms)

                        const intervalle = setInterval(() => {
                            tentatives++;

                            // Vérifier si au moins un select de critère existe
                            // ⚠️ Les selects sont générés avec l'ID "eval_" et non "niveau_"
                            const premierCritere = evaluation.criteres[0];
                            const premierSelectId = premierCritere ? `eval_${premierCritere.critereId}` : null;
                            const premierSelect = premierSelectId ? document.getElementById(premierSelectId) : null;

                            console.log(`🔍 Tentative ${tentatives}/${maxTentatives} - Recherche de #${premierSelectId}:`, premierSelect ? 'TROUVÉ ✅' : 'NON TROUVÉ ❌');

                            if (premierSelect || tentatives >= maxTentatives) {
                                clearInterval(intervalle);

                                if (!premierSelect && tentatives >= maxTentatives) {
                                    console.error('❌ Timeout: Les selects de critères n\'ont pas été générés après 2 secondes');
                                    console.error('🔍 Contenu de listeCriteresGrille1:', document.getElementById('listeCriteresGrille1')?.innerHTML.substring(0, 200));
                                    return;
                                }

                                // Les selects existent, les remplir maintenant
                                console.log(`📝 Chargement des critères (trouvé après ${tentatives} tentatives)...`);
                                let criteresCharges = 0;

                                if (evaluation.criteres && Array.isArray(evaluation.criteres)) {
                                    evaluation.criteres.forEach(critere => {
                                        // ⚠️ Utiliser "eval_" comme préfixe, pas "niveau_"
                                        const selectId = `eval_${critere.critereId}`;
                                        const selectCritere = document.getElementById(selectId);
                                        console.log(`  → Critère ${critere.critereNom} (ID: ${selectId}):`, selectCritere ? 'EXISTS' : 'MISSING');

                                        if (selectCritere) {
                                            const valeurAvant = selectCritere.value;
                                            selectCritere.value = critere.niveauSelectionne;
                                            const valeurApres = selectCritere.value;
                                            console.log(`    Valeur: "${valeurAvant}" → "${valeurApres}"`);
                                            selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
                                            criteresCharges++;
                                        } else {
                                            console.warn(`⚠️ Select non trouvé pour critère ${critere.critereId}`);
                                        }
                                    });

                                    console.log(`✅ ${criteresCharges}/${evaluation.criteres.length} critères chargés`);
                                } else {
                                    console.error('❌ evaluation.criteres est undefined ou n\'est pas un tableau');
                                }

                                // Forcer le recalcul de la note après avoir chargé tous les critères
                                setTimeout(() => {
                                    if (typeof calculerNoteTotale === 'function') {
                                        calculerNoteTotale();
                                        console.log('✅ Note finale recalculée');
                                    }
                                }, 200);
                            }
                        }, 100); // Vérifier toutes les 100ms
                    };

                    // Charger les options d'affichage
                    if (evaluation.optionsAffichage) {
                        document.getElementById('afficherDescription1').checked = evaluation.optionsAffichage.description;
                        document.getElementById('afficherObjectif1').checked = evaluation.optionsAffichage.objectif;
                        document.getElementById('afficherTache1').checked = evaluation.optionsAffichage.tache;
                        document.getElementById('afficherAdresse1').checked = evaluation.optionsAffichage.adresse;
                        document.getElementById('afficherContexte1').checked = evaluation.optionsAffichage.contexte;
                    }

                    // Charger la rétroaction finale
                    const retroaction = document.getElementById('retroactionFinale1');
                    if (retroaction) {
                        retroaction.value = evaluation.retroactionFinale || '';
                    }

                    // evaluationEnCours a déjà été initialisé plus haut (avant les événements)
                    // Afficher l'indicateur de mode modification
                    afficherIndicateurModeModification(evaluation);

                    // Lancer le chargement des critères avec vérification active
                    attendreEtChargerCriteres();

                    // Afficher le bouton de verrouillage et désactiver le formulaire si nécessaire
                    afficherOuMasquerBoutonVerrouillage(true, estVerrouillee);
                    if (estVerrouillee) {
                        desactiverFormulaireEvaluation(true);
                        afficherNotificationSucces('Évaluation chargée en lecture seule (verrouillée)');
                    } else {
                        afficherNotificationSucces('Évaluation chargée - Vous pouvez maintenant la modifier');
                    }
                }, 300);
            }, 300);
        }, 300);
    }, 200);
}

/**
 * Sauvegarde une évaluation modifiée (écrase l'ancienne)
 * Appelée à la place de sauvegarderEvaluation() si on modifie une évaluation existante
 */
function sauvegarderEvaluationModifiee() {
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        // Pas en mode modification, utiliser la sauvegarde normale
        sauvegarderEvaluation();
        return;
    }

    // Récupérer les évaluations
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const indexEval = evaluations.findIndex(e => e.id === evaluationId);

    if (indexEval === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier que l'évaluation n'est pas verrouillée
    if (evaluations[indexEval].verrouillee) {
        afficherNotificationErreur('Évaluation verrouillée', 'Impossible de modifier une évaluation verrouillée');
        return;
    }

    // Créer la nouvelle version de l'évaluation (reprendre le code de sauvegarderEvaluation)
    const etudiantDA = document.getElementById('selectEtudiantEval').value;
    const productionId = document.getElementById('selectProduction1').value;
    const grilleId = document.getElementById('selectGrille1').value;

    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const etudiant = etudiants.find(e => e.da === etudiantDA);

    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const production = productions.find(p => p.id === productionId);

    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);

    // Collecter les évaluations des critères
    const criteres = [];
    if (grille && grille.criteres) {
        grille.criteres.forEach(critere => {
            const niveau = evaluationEnCours.criteres[critere.id];
            if (niveau) {
                const commDiv = document.getElementById(`comm_${critere.id}`);
                criteres.push({
                    critereId: critere.id,
                    critereNom: critere.nom,
                    niveauSelectionne: niveau,
                    retroaction: commDiv ? commDiv.textContent : '',
                    ponderation: critere.ponderation || 0
                });
            }
        });
    }

    // Mettre à jour l'évaluation existante avec horodatage
    const maintenant = new Date();
    evaluations[indexEval] = {
        ...evaluations[indexEval], // Garder l'ID et la date originale
        etudiantDA: etudiantDA,
        etudiantNom: etudiant ? `${etudiant.prenom} ${etudiant.nom}` : '',
        groupe: etudiant ? etudiant.groupe : '',
        productionId: productionId,
        productionNom: production ? (production.titre || production.nom) : '',
        grilleId: grilleId,
        grilleNom: grille ? grille.nom : '',
        echelleId: document.getElementById('selectEchelle1').value,
        cartoucheId: document.getElementById('selectCartoucheEval').value,
        dateModification: maintenant.toISOString(),
        heureModification: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        statutRemise: document.getElementById('remiseProduction1').value,
        criteres: criteres,
        noteFinale: parseFloat(document.getElementById('noteProduction1').textContent) || 0,
        niveauFinal: document.getElementById('niveauProduction1').textContent,
        retroactionFinale: document.getElementById('retroactionFinale1').value,
        optionsAffichage: {
            description: document.getElementById('afficherDescription1').checked,
            objectif: document.getElementById('afficherObjectif1').checked,
            tache: document.getElementById('afficherTache1').checked,
            adresse: document.getElementById('afficherAdresse1').checked,
            contexte: document.getElementById('afficherContexte1').checked
        },
        verrouillee: true // Verrouiller automatiquement après la sauvegarde
    };

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    afficherNotificationSucces(`Évaluation modifiée : ${evaluations[indexEval].etudiantNom} - ${evaluations[indexEval].productionNom}`);

    // Réinitialiser le mode modification
    delete window.evaluationEnCours.idModification;

    // Masquer l'indicateur de modification
    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.style.display = 'none';

    // Masquer le bouton de verrouillage
    afficherOuMasquerBoutonVerrouillage(false);

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
}

/**
 * Verrouille une évaluation pour empêcher sa modification
 * @param {string} evaluationId - ID de l'évaluation à verrouiller
 */
function verrouillerEvaluation(evaluationId) {
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    evaluations[index].verrouillee = true;
    evaluations[index].dateVerrouillage = new Date().toISOString();

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de verrouiller en mode anonymisation');
        return;
    }

    afficherNotificationSucces('Évaluation verrouillée');

    // Recharger la liste
    if (typeof chargerListeEvaluationsRefonte === 'function') {
        chargerListeEvaluationsRefonte();
    }
}

/**
 * Déverrouille une évaluation pour permettre sa modification
 * @param {string} evaluationId - ID de l'évaluation à déverrouiller
 */
function deverrouillerEvaluation(evaluationId) {
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    evaluations[index].verrouillee = false;
    delete evaluations[index].dateVerrouillage;

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de déverrouiller en mode anonymisation');
        return;
    }

    afficherNotificationSucces('Évaluation déverrouillée');

    // Recharger la liste
    if (typeof chargerListeEvaluationsRefonte === 'function') {
        chargerListeEvaluationsRefonte();
    }
}

/**
 * Affiche un indicateur visuel indiquant qu'on est en mode modification d'une évaluation
 * @param {Object} evaluation - L'évaluation en cours de modification
 */
function afficherIndicateurModeModification(evaluation) {
    // Chercher si l'indicateur existe déjà
    let indicateur = document.getElementById('indicateurModeModification');

    if (!indicateur) {
        // Créer l'indicateur
        indicateur = document.createElement('div');
        indicateur.id = 'indicateurModeModification';
        indicateur.style.cssText = `
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
            padding: 15px 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 5px solid #e65100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Insérer l'indicateur au début du formulaire d'évaluation
        const conteneurForm = document.querySelector('#evaluations-saisie .contenu');
        if (conteneurForm) {
            conteneurForm.insertBefore(indicateur, conteneurForm.firstChild);
        }
    }

    // Mettre à jour le contenu
    const dateEval = evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleString('fr-CA') : 'Inconnue';
    indicateur.innerHTML = `
        <div style="flex: 1;">
            <strong>MODE MODIFICATION</strong><br>
            <span style="font-size: 0.9rem; opacity: 0.95;">
                Vous modifiez l'évaluation de <strong>${evaluation.etudiantNom}</strong>
                pour <strong>${evaluation.productionNom}</strong><br>
                Évaluation initiale : ${dateEval}
            </span>
        </div>
    `;

    indicateur.style.display = 'flex';
}

/**
 * Supprime une évaluation après confirmation
 * Les évaluations verrouillées ne peuvent pas être supprimées
 * @param {string} evaluationId - ID de l'évaluation à supprimer
 */
function supprimerEvaluation(evaluationId) {
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier si l'évaluation est verrouillée
    if (evaluation.verrouillee) {
        afficherNotificationErreur(
            'Suppression impossible',
            'Cette évaluation est verrouillée. Déverrouillez-la d\'abord pour la supprimer.'
        );
        return;
    }

    // Demander confirmation
    if (!confirm(`Voulez-vous vraiment supprimer l'évaluation de ${evaluation.etudiantNom} pour ${evaluation.productionNom} ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer l'évaluation
    evaluations = evaluations.filter(e => e.id !== evaluationId);

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Suppression impossible', 'Impossible de supprimer en mode anonymisation');
        return;
    }

    afficherNotificationSucces('Évaluation supprimée');

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Recharger la liste
    if (typeof chargerListeEvaluationsRefonte === 'function') {
        chargerListeEvaluationsRefonte();
    }
}

/* ===============================
   📚 BANQUE D'ÉVALUATIONS
   Système de recherche et chargement d'évaluations
   =============================== */

/**
 * Ouvre le modal de la banque d'évaluations
 */
function ouvrirBanqueEvaluations() {
    const modal = document.getElementById('modalBanqueEvaluations');
    if (!modal) return;

    // Charger les filtres
    chargerFiltresBanqueEvaluations();

    // Afficher les évaluations
    filtrerBanqueEvaluations();

    modal.classList.add('actif');
}

/**
 * Ferme le modal de la banque d'évaluations
 */
function fermerBanqueEvaluations() {
    const modal = document.getElementById('modalBanqueEvaluations');
    if (modal) modal.classList.remove('actif');
}

/**
 * Charge les options de filtres
 */
function chargerFiltresBanqueEvaluations() {
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    // Filtre étudiants
    const selectEtudiant = document.getElementById('filtreBanqueEtudiant');
    if (selectEtudiant) {
        const etudiantsAvecEval = [...new Set(evaluations.map(e => e.etudiantDA))];
        selectEtudiant.innerHTML = '<option value="">Tous les étudiants</option>';

        etudiantsAvecEval.forEach(da => {
            const etudiant = etudiants.find(e => e.da === da);
            if (etudiant) {
                const option = document.createElement('option');
                option.value = da;
                option.textContent = `${etudiant.nom}, ${etudiant.prenom}`;
                selectEtudiant.appendChild(option);
            }
        });
    }

    // Filtre productions
    const selectProduction = document.getElementById('filtreBanqueProduction');
    if (selectProduction) {
        const productionsAvecEval = [...new Set(evaluations.map(e => e.productionId))];
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>';

        productionsAvecEval.forEach(id => {
            const production = productions.find(p => p.id === id);
            if (production) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = production.titre || production.nom;
                selectProduction.appendChild(option);
            }
        });
    }

    // Filtre groupes
    const selectGroupe = document.getElementById('filtreBanqueGroupe');
    if (selectGroupe) {
        const groupesAvecEval = [...new Set(evaluations.map(e => e.groupe).filter(g => g))].sort();
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';

        groupesAvecEval.forEach(groupe => {
            const option = document.createElement('option');
            option.value = groupe;
            option.textContent = groupe;
            selectGroupe.appendChild(option);
        });
    }
}

/**
 * Filtre et affiche les évaluations selon les critères sélectionnés
 */
function filtrerBanqueEvaluations() {
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');

    // Récupérer les filtres
    const filtreGroupe = document.getElementById('filtreBanqueGroupe')?.value || '';
    const filtreEtudiant = document.getElementById('filtreBanqueEtudiant')?.value || '';
    const filtreProduction = document.getElementById('filtreBanqueProduction')?.value || '';
    const tri = document.getElementById('triBanqueEvaluation')?.value || 'date-desc';

    // Filtrer
    let evaluationsFiltrees = evaluations.filter(evaluation => {
        if (filtreGroupe && evaluation.groupe !== filtreGroupe) return false;
        if (filtreEtudiant && evaluation.etudiantDA !== filtreEtudiant) return false;
        if (filtreProduction && evaluation.productionId !== filtreProduction) return false;
        return true;
    });

    // Trier
    evaluationsFiltrees.sort((a, b) => {
        switch (tri) {
            case 'date-desc':
                return new Date(b.dateEvaluation) - new Date(a.dateEvaluation);
            case 'date-asc':
                return new Date(a.dateEvaluation) - new Date(b.dateEvaluation);
            case 'groupe-asc':
                return (a.groupe || '').localeCompare(b.groupe || '');
            case 'etudiant-asc':
                // Trier par nom de famille (dernier mot)
                const nomA = a.etudiantNom.split(' ').pop();
                const nomB = b.etudiantNom.split(' ').pop();
                return nomA.localeCompare(nomB);
            case 'production-asc':
                return a.productionNom.localeCompare(b.productionNom);
            case 'note-desc':
                return b.noteFinale - a.noteFinale;
            case 'note-asc':
                return a.noteFinale - b.noteFinale;
            default:
                return 0;
        }
    });

    // Afficher
    afficherListeBanqueEvaluations(evaluationsFiltrees);
}

/**
 * Affiche la liste filtrée des évaluations
 */
function afficherListeBanqueEvaluations(evaluations) {
    const conteneur = document.getElementById('listeBanqueEvaluations');
    if (!conteneur) return;

    if (evaluations.length === 0) {
        conteneur.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Aucune évaluation trouvée avec ces critères.</p>';
        return;
    }

    const html = evaluations.map(evaluation => {
        const dateEval = new Date(evaluation.dateEvaluation).toLocaleDateString('fr-CA');
        const heureEval = evaluation.heureEvaluation || new Date(evaluation.dateEvaluation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
        const estRemplacee = evaluation.remplaceeParId ? true : false;
        const estReprise = evaluation.repriseDeId ? true : false;

        return `
            <div class="carte" style="margin-bottom: 15px; ${estRemplacee ? 'opacity: 0.6; border-left: 3px solid #999;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0;">
                            ${echapperHtml(evaluation.etudiantNom)}
                            ${evaluation.verrouillee ? '<span style="color: #ff9800; margin-left: 8px;">(Verrouillée)</span>' : ''}
                            ${estReprise ? '<span style="color: #9c27b0; margin-left: 8px;" title="Jeton de reprise appliqué">(Reprise)</span>' : ''}
                            ${estRemplacee ? '<span style="color: #999; margin-left: 8px;" title="Évaluation remplacée">(Remplacée)</span>' : ''}
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; color: #666; font-size: 0.9rem;">
                            <div><strong>Production:</strong> ${echapperHtml(evaluation.productionNom)}</div>
                            <div><strong>Grille:</strong> ${echapperHtml(evaluation.grilleNom)}</div>
                            <div><strong>Note:</strong> ${evaluation.niveauFinal} (${Math.round(evaluation.noteFinale)}%)</div>
                            <div><strong>Date:</strong> ${dateEval} à ${heureEval}</div>
                        </div>
                        ${estRemplacee ? `
                            <div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 0.85rem; color: #666;">
                                Cette évaluation a été remplacée par un jeton de reprise et ne compte plus dans les indices
                            </div>
                        ` : ''}
                        ${estReprise ? `
                            <div style="margin-top: 10px; padding: 8px; background: #f3e5f5; border-radius: 4px; font-size: 0.85rem; color: #7b1fa2;">
                                Jeton de reprise appliqué - Remplace l'évaluation précédente
                            </div>
                        ` : ''}
                    </div>
                    <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <button class="btn btn-modifier btn-compact" onclick="chargerEvaluationDepuisBanque('${evaluation.id}')">
                            Charger
                        </button>
                        <button class="btn btn-annuler btn-compact" onclick="basculerVerrouillageEvaluation('${evaluation.id}')">
                            ${evaluation.verrouillee ? 'Déverrouiller' : 'Verrouiller'}
                        </button>
                        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluationBanque('${evaluation.id}')">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    conteneur.innerHTML = html;
}

/**
 * Charge une évaluation depuis la banque dans le formulaire
 * @param {string} evaluationId - ID de l'évaluation à charger
 */
function chargerEvaluationDepuisBanque(evaluationId) {
    // Utiliser la fonction existante modifierEvaluation
    fermerBanqueEvaluations();
    modifierEvaluation(evaluationId);
}

/**
 * Bascule le verrouillage d'une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function basculerVerrouillageEvaluation(evaluationId) {
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Basculer le statut
    evaluations[index].verrouillee = !evaluations[index].verrouillee;
    const estVerrouillee = evaluations[index].verrouillee;

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    const message = estVerrouillee ? 'Évaluation verrouillée' : 'Évaluation déverrouillée';
    afficherNotificationSucces(message);

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/**
 * Supprime une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function supprimerEvaluationBanque(evaluationId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier si l'évaluation est verrouillée
    if (evaluation.verrouillee) {
        afficherNotificationErreur('Suppression impossible', 'Déverrouillez l\'évaluation avant de la supprimer');
        return;
    }

    // Supprimer
    evaluations = evaluations.filter(e => e.id !== evaluationId);

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Suppression impossible', 'Impossible de supprimer en mode anonymisation');
        return;
    }

    afficherNotificationSucces('Évaluation supprimée');

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/**
 * Verrouille ou déverrouille toutes les évaluations
 * @param {boolean} verrouiller - true pour verrouiller, false pour déverrouiller
 */
function verrouillerToutesEvaluations(verrouiller) {
    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');

    if (evaluations.length === 0) {
        afficherNotificationErreur('Aucune évaluation', 'Aucune évaluation à modifier');
        return;
    }

    const message = verrouiller
        ? 'Êtes-vous sûr de vouloir verrouiller TOUTES les évaluations ?'
        : 'Êtes-vous sûr de vouloir déverrouiller TOUTES les évaluations ?';

    if (!confirm(message)) {
        return;
    }

    // Modifier toutes les évaluations
    evaluations = evaluations.map(e => ({
        ...e,
        verrouillee: verrouiller
    }));

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de modifier en mode anonymisation');
        return;
    }

    const resultat = verrouiller
        ? `${evaluations.length} évaluations verrouillées`
        : `${evaluations.length} évaluations déverrouillées`;

    afficherNotificationSucces(resultat);

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/* ===============================
   🎫 SYSTÈME DE JETONS DE REPRISE
   =============================== */

/**
 * Ouvre le modal pour appliquer un jeton de reprise
 */
function ouvrirModalJetonReprise() {
    const modal = document.getElementById('modalJetonReprise');
    if (!modal) return;

    // Récupérer l'ID de l'évaluation courante si elle existe
    const evaluationCouranteId = window.evaluationEnCours?.idModification;

    // Charger la liste des évaluations pouvant bénéficier d'un jeton
    chargerListeEvaluationsJeton(evaluationCouranteId);

    modal.classList.add('actif');
}

/**
 * Ferme le modal de jeton de reprise
 */
function fermerModalJetonReprise() {
    const modal = document.getElementById('modalJetonReprise');
    if (modal) modal.classList.remove('actif');

    // Réinitialiser les variables de sélection
    window.evaluationJetonPreselection = null;
    window.evaluationJetonSelectionnee = null;
}

/**
 * Charge la liste des évaluations éligibles pour un jeton de reprise
 * @param {string} evaluationIdAPreselectionner - ID de l'évaluation à pré-sélectionner (optionnel)
 */
function chargerListeEvaluationsJeton(evaluationIdAPreselectionner = null) {
    // Stocker l'ID de l'évaluation à pré-sélectionner
    window.evaluationJetonPreselection = evaluationIdAPreselectionner;

    // Charger les filtres
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationsEligibles = evaluations.filter(e => !e.remplaceeParId);

    // Peupler les filtres
    // Trier les étudiants par nom de famille (dernier mot)
    const etudiants = [...new Set(evaluationsEligibles.map(e => e.etudiantNom))].sort((a, b) => {
        const nomA = a.split(' ').pop(); // Dernier mot = nom de famille
        const nomB = b.split(' ').pop();
        return nomA.localeCompare(nomB);
    });
    const productions = [...new Set(evaluationsEligibles.map(e => e.productionNom))].sort();

    const filtreEtudiant = document.getElementById('filtreJetonEtudiant');
    const filtreProduction = document.getElementById('filtreJetonProduction');

    if (filtreEtudiant) {
        filtreEtudiant.innerHTML = '<option value="">Tous les étudiants</option>';
        etudiants.forEach(nom => {
            const option = document.createElement('option');
            option.value = nom;
            option.textContent = nom;
            filtreEtudiant.appendChild(option);
        });
    }

    if (filtreProduction) {
        filtreProduction.innerHTML = '<option value="">Toutes les productions</option>';
        productions.forEach(nom => {
            const option = document.createElement('option');
            option.value = nom;
            option.textContent = nom;
            filtreProduction.appendChild(option);
        });
    }

    // Afficher la liste filtrée
    filtrerListeJetons();
}

/**
 * Filtre et trie la liste des évaluations pour les jetons
 */
function filtrerListeJetons() {
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const conteneur = document.getElementById('listeJetonsEvaluations');

    if (!conteneur) return;

    // Récupérer les filtres
    const filtreEtudiant = document.getElementById('filtreJetonEtudiant')?.value || '';
    const filtreProduction = document.getElementById('filtreJetonProduction')?.value || '';
    const tri = document.getElementById('triJetonEvaluation')?.value || 'date-desc';

    // Filtrer les évaluations non remplacées
    let evaluationsFiltrees = evaluations.filter(e => !e.remplaceeParId);

    // Appliquer les filtres
    if (filtreEtudiant) {
        evaluationsFiltrees = evaluationsFiltrees.filter(e => e.etudiantNom === filtreEtudiant);
    }
    if (filtreProduction) {
        evaluationsFiltrees = evaluationsFiltrees.filter(e => e.productionNom === filtreProduction);
    }

    // Appliquer le tri
    evaluationsFiltrees.sort((a, b) => {
        switch(tri) {
            case 'date-desc':
                return new Date(b.dateEvaluation) - new Date(a.dateEvaluation);
            case 'date-asc':
                return new Date(a.dateEvaluation) - new Date(b.dateEvaluation);
            case 'etudiant-asc':
                // Trier par nom de famille (dernier mot)
                const nomA = a.etudiantNom.split(' ').pop();
                const nomB = b.etudiantNom.split(' ').pop();
                return nomA.localeCompare(nomB);
            case 'production-asc':
                return a.productionNom.localeCompare(b.productionNom);
            case 'note-desc':
                return b.noteFinale - a.noteFinale;
            case 'note-asc':
                return a.noteFinale - b.noteFinale;
            default:
                return 0;
        }
    });

    // Générer le HTML
    if (evaluationsFiltrees.length === 0) {
        conteneur.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Aucune évaluation trouvée</p>';
        return;
    }

    const html = evaluationsFiltrees.map(evaluation => {
        const dateEval = new Date(evaluation.dateEvaluation).toLocaleDateString('fr-CA');
        const heureEval = evaluation.heureEvaluation || new Date(evaluation.dateEvaluation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
        const estPreselection = evaluation.id === window.evaluationJetonPreselection;
        const estSelectionne = evaluation.id === window.evaluationJetonSelectionnee;

        return `
            <div class="item-carte" style="margin-bottom: 10px; padding: 15px; border: 2px solid ${estSelectionne ? 'var(--bleu-principal)' : estPreselection ? 'var(--bleu-moyen)' : '#ddd'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; ${estSelectionne ? 'background: var(--bleu-tres-pale);' : ''}"
                onclick="selectionnerEvaluationJeton('${evaluation.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 8px 0; color: var(--gris-fonce);">
                            ${echapperHtml(evaluation.etudiantNom)}
                            ${estPreselection && !estSelectionne ? '<span style="color: var(--bleu-moyen); margin-left: 8px;" title="Évaluation courante">(Courante)</span>' : ''}
                            ${estSelectionne ? '<span style="color: var(--bleu-principal); margin-left: 8px;" title="Sélectionnée">(Sélectionnée)</span>' : ''}
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; color: #666; font-size: 0.9rem;">
                            <div><strong>Production:</strong> ${echapperHtml(evaluation.productionNom)}</div>
                            <div><strong>Grille:</strong> ${echapperHtml(evaluation.grilleNom)}</div>
                            <div><strong>Note:</strong> ${evaluation.niveauFinal} (${Math.round(evaluation.noteFinale)}%)</div>
                            <div><strong>Date:</strong> ${dateEval} à ${heureEval}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    conteneur.innerHTML = html;

    // Pré-sélectionner automatiquement si une évaluation était spécifiée
    if (window.evaluationJetonPreselection && !window.evaluationJetonSelectionnee) {
        selectionnerEvaluationJeton(window.evaluationJetonPreselection);
    }
}

/**
 * Sélectionne une évaluation pour le jeton de reprise
 */
function selectionnerEvaluationJeton(evaluationId) {
    window.evaluationJetonSelectionnee = evaluationId;
    // Rafraîchir l'affichage pour mettre à jour la sélection
    filtrerListeJetons();
}

/**
 * Affiche les détails de l'évaluation sélectionnée pour le jeton
 */
function afficherDetailsEvaluationJeton() {
    const select = document.getElementById('selectEvaluationJeton');
    const conteneur = document.getElementById('detailsEvaluationJeton');

    if (!select || !conteneur) return;

    const evaluationId = select.value;
    if (!evaluationId) {
        conteneur.style.display = 'none';
        return;
    }

    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) return;

    const dateEval = new Date(evaluation.dateEvaluation).toLocaleString('fr-CA');

    conteneur.innerHTML = `
        <h4 style="margin-top: 0;">Détails de l'évaluation sélectionnée</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
            <div><strong>Étudiant:</strong> ${echapperHtml(evaluation.etudiantNom)}</div>
            <div><strong>Production:</strong> ${echapperHtml(evaluation.productionNom)}</div>
            <div><strong>Grille:</strong> ${echapperHtml(evaluation.grilleNom)}</div>
            <div><strong>Cartouche:</strong> ${echapperHtml(obtenirNomCartouche(evaluation.cartoucheId, evaluation.grilleId))}</div>
            <div><strong>Note:</strong> ${evaluation.niveauFinal} (${Math.round(evaluation.noteFinale)}%)</div>
            <div><strong>Date:</strong> ${dateEval}</div>
        </div>
        <div style="padding: 10px; background: #e3f2fd; border-radius: 4px; font-size: 0.9rem;">
            <strong>Critères évalués:</strong> ${evaluation.criteres.length} critères
        </div>
    `;

    conteneur.style.display = 'block';
}

/**
 * Applique un jeton de reprise à l'évaluation sélectionnée
 * Crée un duplicata, marque l'originale comme remplacée, et charge la nouvelle dans le formulaire
 */
function appliquerJetonReprise() {
    const evaluationId = window.evaluationJetonSelectionnee;

    if (!evaluationId) {
        afficherNotificationErreur('Erreur', 'Veuillez sélectionner une évaluation');
        return;
    }

    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const indexOriginal = evaluations.findIndex(e => e.id === evaluationId);

    if (indexOriginal === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    const evaluationOriginale = evaluations[indexOriginal];

    // Créer le duplicata avec un nouvel ID
    const nouvelleEvaluation = {
        ...evaluationOriginale,
        id: 'EVAL_REPRISE_' + Date.now(),
        dateEvaluation: new Date().toISOString(),
        repriseDeId: evaluationOriginale.id, // Lien vers l'originale
        jetonRepriseApplique: true,
        dateApplicationJeton: new Date().toISOString(),
        verrouillee: false // Déverrouiller pour permettre la modification immédiate
    };

    // Marquer l'originale comme remplacée
    evaluations[indexOriginal].remplaceeParId = nouvelleEvaluation.id;
    evaluations[indexOriginal].dateRemplacement = new Date().toISOString();

    // Ajouter la nouvelle évaluation
    evaluations.push(nouvelleEvaluation);

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    afficherNotificationSucces(`Jeton de reprise appliqué pour ${evaluationOriginale.etudiantNom}`);

    // Fermer le modal
    fermerModalJetonReprise();

    // Charger la nouvelle évaluation dans le formulaire pour modification
    setTimeout(() => {
        modifierEvaluation(nouvelleEvaluation.id);
    }, 500);

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
}

/**
 * Bascule le verrouillage de l'évaluation courante
 */
function basculerVerrouillageEvaluationCourante() {
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        afficherNotificationErreur('Erreur', 'Aucune évaluation en cours de modification');
        return;
    }

    let evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Basculer le statut de verrouillage
    evaluations[index].verrouillee = !evaluations[index].verrouillee;
    const estVerrouillee = evaluations[index].verrouillee;

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    // Mettre à jour le bouton
    mettreAJourBoutonVerrouillage(estVerrouillee);

    // Notification
    const message = estVerrouillee
        ? `Évaluation verrouillée - Modification impossible`
        : `Évaluation déverrouillée - Modification autorisée`;
    afficherNotificationSucces(message);

    // Si l'évaluation est verrouillée, désactiver tous les champs du formulaire
    desactiverFormulaireEvaluation(estVerrouillee);
}

/**
 * Met à jour l'icône de verrouillage (style productions)
 */
function mettreAJourBoutonVerrouillage(estVerrouillee) {
    const iconeStatut = document.getElementById('iconeStatutVerrouillageEval');
    const iconeVerrou = document.getElementById('iconeVerrouEval');

    if (!iconeStatut || !iconeVerrou) return;

    if (estVerrouillee) {
        // Verrouillée : coche grisée, cadenas actif
        iconeStatut.textContent = '☑️';
        iconeStatut.style.color = '#999';
        iconeVerrou.style.color = '#f44336'; // Rouge
        iconeStatut.title = 'Évaluation verrouillée - Cliquez pour déverrouiller';
        iconeVerrou.title = 'Évaluation verrouillée - Cliquez pour déverrouiller';
    } else {
        // Déverrouillée : coche bleue, cadenas grisé
        iconeStatut.textContent = '✅';
        iconeStatut.style.color = '';
        iconeVerrou.style.color = '#999';
        iconeStatut.title = 'Évaluation active - Cliquez pour verrouiller';
        iconeVerrou.title = 'Évaluation active - Cliquez pour verrouiller';
    }
}

/**
 * Affiche ou masque l'indicateur de verrouillage selon le contexte
 */
function afficherOuMasquerBoutonVerrouillage(afficher, estVerrouillee = false) {
    const indicateur = document.getElementById('indicateurVerrouillageEval');
    if (!indicateur) return;

    if (afficher) {
        indicateur.style.display = 'flex';
        mettreAJourBoutonVerrouillage(estVerrouillee);
    } else {
        indicateur.style.display = 'none';
    }
}

/**
 * Désactive ou active les champs du formulaire d'évaluation
 */
function desactiverFormulaireEvaluation(desactiver) {
    console.log(`${desactiver ? '🔒' : '🔓'} ${desactiver ? 'Désactivation' : 'Activation'} du formulaire d'évaluation...`);

    // Désactiver les selects de paramètres principaux
    const selects = [
        'selectGroupeEval',
        'selectEtudiantEval',
        'selectProduction1',
        'selectGrille1',
        'selectCartoucheEval',
        'selectEchelle1',
        'remiseProduction1'
    ];

    selects.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.disabled = desactiver;
            console.log(`  ${id}: ${elem.disabled ? 'DÉSACTIVÉ' : 'ACTIVÉ'}`);
        }
    });

    // Désactiver tous les selects de critères dans listeCriteresGrille1
    const selectsCriteres = document.querySelectorAll('#listeCriteresGrille1 select');
    console.log(`  Trouvé ${selectsCriteres.length} selects de critères`);
    selectsCriteres.forEach(select => {
        select.disabled = desactiver;
    });

    // Désactiver la zone de rétroaction finale
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) {
        retroaction.disabled = desactiver;
        console.log(`  retroactionFinale1: ${retroaction.disabled ? 'DÉSACTIVÉ' : 'ACTIVÉ'}`);
    }

    // Désactiver les checkboxes d'options d'affichage
    const checkboxes = [
        'afficherDescription1',
        'afficherObjectif1',
        'afficherTache1',
        'afficherAdresse1',
        'afficherContexte1'
    ];

    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.disabled = desactiver;
    });

    // Désactiver le bouton de sauvegarde
    const boutonsSauvegarde = document.querySelectorAll('#evaluations-individuelles button');
    boutonsSauvegarde.forEach(btn => {
        if (btn.textContent.includes('Sauvegarder')) {
            btn.disabled = desactiver;
            console.log(`  Bouton sauvegarde: ${btn.disabled ? 'DÉSACTIVÉ' : 'ACTIVÉ'}`);
        }
    });

    console.log(`✅ Formulaire ${desactiver ? 'verrouillé' : 'déverrouillé'}`);
}