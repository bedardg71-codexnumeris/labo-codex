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

    // SÉCURITÉ: Vérifier que l'échelle existe
    if (!niveaux || niveaux.length === 0) {
        console.error('❌ Aucune échelle de performance configurée');
        document.getElementById('noteProduction1').textContent = '--';
        document.getElementById('niveauProduction1').textContent = '--';
        return;
    }

    // Utiliser les valeurs de calcul configurées par l'utilisateur
    const valeurs = {};
    niveaux.forEach(niveau => {
        // Si valeurCalcul existe, l'utiliser, sinon calculer le milieu de la plage
        valeurs[niveau.code] = niveau.valeurCalcul || (niveau.min + niveau.max) / 2;
    });
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

    // Créer l'objet évaluation
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
        dateEvaluation: new Date().toISOString(),
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
        }
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

    // 🆕 AJOUTER ICI : Recalculer l'indice C après sauvegarde
    if (typeof calculerEtSauvegarderIndiceCompletion === 'function') {
        calculerEtSauvegarderIndiceCompletion();
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
 * Prépare une nouvelle évaluation (réinitialise le formulaire)
 */
function nouvelleEvaluation() {
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

    afficherNotificationSucces('Formulaire réinitialisé - Prêt pour une nouvelle évaluation');
}

/**
 * Navigation vers la liste des évaluations
 */
function naviguerVersListeEvaluations() {
    afficherSousSection('evaluations-liste-evaluations');
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
        const evaluationsEtudiant = evaluations.filter(e =>
            e.etudiantDA === etudiant.da
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
    const indicesCP = JSON.parse(localStorage.getItem('indicesEvaluation') || '{}');

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

        // Lire l'indice C - Compatible avec les deux structures
        let indiceC = 0;
        if (indicesCP.completion?.sommatif) {
            // Nouvelle structure
            indiceC = indicesCP.completion.sommatif[etudiant.da] || 0;
        } else if (indicesCP[etudiant.da]?.completion !== undefined) {
            // Ancienne structure (compatibilité)
            indiceC = indicesCP[etudiant.da].completion || 0;
        }

        console.log(`Étudiant ${etudiant.da}: C=${(indiceC * 100).toFixed(1)}%`);

        console.log(`Étudiant ${etudiant.da}: C=${indiceC}`);

        return {
            ...etudiant,
            evaluations: evalsEtudiant,
            indices: {
                completion: indiceC
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
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif !== false;
    const afficherAlternatif = config.affichageTableauBord?.afficherAlternatif || false;

    // Récupérer les indices depuis localStorage
    const indicesEval = JSON.parse(localStorage.getItem('indicesEvaluation') || '{}');

    let completionSommatif = 0;
    let completionAlternatif = 0;

    // Lire les indices (compatible avec les deux structures)
    if (indicesEval.completion?.sommatif) {
        completionSommatif = indicesEval.completion.sommatif[etudiant.da] || 0;
        completionAlternatif = indicesEval.completion.alternatif[etudiant.da] || 0;
    } else if (indicesEval[etudiant.da]?.completion !== undefined) {
        completionSommatif = indicesEval[etudiant.da].completion || 0;
        completionAlternatif = completionSommatif; // Fallback
    }

    const nbArtefacts = etudiant.evaluations.length;

    // Déterminer la couleur selon le taux (utiliser le sommatif par défaut)
    const tauxPrincipal = afficherSommatif ? completionSommatif : completionAlternatif;
    let couleurFond = '#e8f5e9'; // Vert clair par défaut
    if (tauxPrincipal < 0.5) {
        couleurFond = '#ffebee'; // Rouge clair
    } else if (tauxPrincipal < 0.75) {
        couleurFond = '#fff3e0'; // Orange clair
    }

    // CAS 1 : Afficher LES DEUX (sommatif / alternatif)
    if (afficherSommatif && afficherAlternatif) {
        return `
            <span class="carte-metrique" style="padding:8px 15px; background: ${couleurFond}; border-radius: 6px;">
                <strong style="font-size: 1.1rem;">C</strong>
                <span style="font-size: 1.1rem; font-weight: 600; margin-left: 8px;">
                    ${Math.round(completionSommatif * 100)}% / ${Math.round(completionAlternatif * 100)}%
                </span>
                <span style="font-size: 0.75rem; color: #666; margin-left: 5px;">(${nbArtefacts} artefacts)</span>
            </span>
        `;
    }

    // CAS 2 : Afficher SEULEMENT alternatif
    if (afficherAlternatif) {
        return `
            <span class="carte-metrique" style="padding:8px 15px; background: ${couleurFond}; border-radius: 6px;">
                <strong style="font-size: 1.1rem;">C (PAN)</strong>
                <span style="font-size: 1.1rem; font-weight: 600; margin-left: 8px;">
                    ${Math.round(completionAlternatif * 100)}%
                </span>
                <span style="font-size: 0.75rem; color: #666; margin-left: 5px;">(${nbArtefacts} artefacts)</span>
            </span>
        `;
    }

    // CAS 3 : Afficher SEULEMENT sommatif (par défaut)
    return `
        <span class="carte-metrique" style="padding:8px 15px; background: ${couleurFond}; border-radius: 6px;">
            <strong style="font-size: 1.1rem;">C</strong>
            <span style="font-size: 1.1rem; font-weight: 600; margin-left: 8px;">
                ${Math.round(completionSommatif * 100)}%
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
            return `
                            <tr>
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
                                <td>${echapperHtml(item.evaluation.grilleNom || '—')}</td>
                                <td>${echapperHtml(obtenirNomCartouche(item.evaluation.cartoucheId, item.evaluation.grilleId) || '—')}</td>

                                <td>
                                    <span ${obtenirClasseNote(item.evaluation.niveauFinal, item.evaluation.echelleId)}>

                                        ${item.evaluation.niveauFinal || '—'}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge-statut badge-succes">
                                        Évalué
                                    </span>
                                </td>
<td>${eval.niveauFinal || '—'}</td>
<td>${eval.noteFinale ? Math.round(eval.noteFinale) + '%' : '—'}</td>
                                <td>
                                    <button class="btn btn-modifier" onclick="modifierEvaluation('${item.evaluation.id}')" style="padding:5px 10px;">
                                        Modifier
                                    </button>
                                    <button class="btn btn-supprimer" onclick="supprimerEvaluation('${item.evaluation.id}')" style="padding:5px 10px;">
                                        Supprimer
                                    </button>
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
                                    <button class="btn btn-principal" onclick="evaluerProduction('${etudiant.da}', '${item.production.id}')" style="padding:5px 10px;">
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
    const nbRemis = evaluations.length;
    const resumeHTML = `
        <div class="carte" style="margin-top: 15px; background: var(--bleu-pale);">
            <h4 style="margin-bottom: 10px;">📊 Résumé de l'étudiant</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <strong>Artefacts remis:</strong> ${nbRemis} / ${nbAttendus} 
                    (${Math.round(etudiant.indices.completion * 100)}%)
                </div>
                <div>
                    <strong>Performance moyenne:</strong> ${Math.round(etudiant.indices.performance * 100)}%
                </div>
                <div>
                    <strong>Tendance:</strong> ${obtenirTendance(evaluations)}
                </div>
            </div>
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

    // Calculer le total d'artefacts
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const nbArtefactsAttendus = productions.filter(p =>
        p.type === 'artefact-portfolio' || p.type === 'production'
    ).length;
    const totalArtefactsAttendus = nbEtudiants * nbArtefactsAttendus;
    const totalArtefactsRemis = etudiants.reduce((sum, e) => sum + e.evaluations.length, 0);

    // Calculer les moyennes
    const moyenneC = etudiants.reduce((sum, e) => sum + e.indices.completion, 0) / nbEtudiants;
    const moyenneP = etudiants.reduce((sum, e) => sum + e.indices.performance, 0) / nbEtudiants;

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

/**
 * Obtient le nom d'une cartouche par son ID
 */
function obtenirNomCartouche(cartoucheId) {
    if (!cartoucheId) return '—';
    // Simplification - normalement on devrait chercher dans localStorage
    return cartoucheId.replace(/-/g, ' ');
}

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