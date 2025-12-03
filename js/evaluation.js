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
   DÉPENDANCES DE CE MODULE
   
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
   - 'productions' : Array des productions (nom historique)
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

    // NOUVEAU (Beta 84): Trier par nom de famille (ordre alphabétique)
    etudiants.sort((a, b) => {
        const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
        const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
        return nomA.localeCompare(nomB);
    });

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

    // NOUVEAU (Beta 84): Trier par nom de famille (ordre alphabétique)
    etudiantsFiltres.sort((a, b) => {
        const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
        const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
        return nomA.localeCompare(nomB);
    });

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
 * - 'productions' : Array des productions (nom historique)
 */
function chargerProductionsDansSelect() {
    const productions = db.getSync('productions', []);
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
    const grilles = db.getSync('grillesTemplates', []);
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
 * Charge les échelles de performance disponibles dans le select
 *
 * CLÉ LOCALSTORAGE:
 * - 'echellesTemplates' : Array des échelles créées par l'utilisateur
 *
 * NOUVEAU (Beta 92): Support pratiques configurables
 * Si une pratique configurable est active, son échelle est ajoutée à la liste
 */
function chargerEchellePerformance() {
    const echelles = db.getSync('echellesTemplates', []);
    const select = document.getElementById('selectEchelle1');

    if (!select) return;

    // NOUVEAU: Vérifier si une pratique configurable est active avec une échelle définie
    let echellePratique = null;
    let pratiqueId = null;

    if (window.PratiqueManager) {
        // NOUVEAU Beta 91: Utiliser la pratique du cours actif
        const coursActifId = getCoursActifId();
        if (coursActifId) {
            pratiqueId = getPratiqueCours(coursActifId);
        } else {
            // Fallback: utiliser la configuration globale
            const modalites = db.getSync('modalitesEvaluation', {});
            pratiqueId = modalites.pratique || 'pan-maitrise';
        }

        // Si ce n'est pas une pratique codée en dur, charger l'échelle de la pratique
        if (pratiqueId && pratiqueId !== 'pan-maitrise' && pratiqueId !== 'sommative') {
            const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);
            const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

            if (pratiqueData && pratiqueData.config && pratiqueData.config.echelle) {
                echellePratique = {
                    id: `pratique-${pratiqueId}`,
                    nom: `${pratiqueData.config.nom} (Pratique active)`,
                    niveaux: pratiqueData.config.echelle.niveaux || [],
                    type: pratiqueData.config.echelle.type || 'niveaux',
                    source: 'pratique'
                };
            }
        }
    }

    // SÉCURITÉ: Vérifier qu'il existe au moins une échelle
    if ((!echelles || echelles.length === 0) && !echellePratique) {
        console.error('❌ Aucune échelle de performance configurée');
        select.innerHTML = '<option value="">⚠️ Aucune échelle configurée - Aller dans Matériel › Niveaux de performance</option>';
        document.getElementById('noteProduction1').textContent = '--';
        document.getElementById('niveauProduction1').textContent = '--';
        return;
    }

    // Remplir le select avec toutes les échelles disponibles
    select.innerHTML = '<option value="">-- Choisir une échelle --</option>';

    // NOUVEAU: Ajouter l'échelle de la pratique en premier (si disponible)
    if (echellePratique) {
        const nbNiveaux = echellePratique.niveaux?.length || 0;
        const nomEchappe = echellePratique.nom.replace(/[<>&"']/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
        }[c]));
        select.innerHTML += `<option value="${echellePratique.id}" style="background: #e3f2fd; font-weight: 600;">${nomEchappe} (${nbNiveaux} niveaux)</option>`;
    }

    // Ajouter les échelles personnalisées
    if (echelles && echelles.length > 0) {
        echelles.forEach(echelle => {
            const nomEchappe = (echelle.nom || 'Échelle sans nom').replace(/[<>&"']/g, c => ({
                '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
            }[c]));
            const nbNiveaux = echelle.niveaux?.length || 0;
            select.innerHTML += `<option value="${echelle.id}">${nomEchappe} (${nbNiveaux} niveaux)</option>`;
        });
    }

    // Sélection automatique
    if (echellePratique) {
        // Pré-sélectionner l'échelle de la pratique
        select.value = echellePratique.id;
    } else if (echelles.length === 1) {
        // Si une seule échelle personnalisée, la sélectionner
        select.value = echelles[0].id;
    }

    const totalEchelles = (echelles?.length || 0) + (echellePratique ? 1 : 0);
    console.log('✅ Échelles de performance chargées:', totalEchelles, 'échelle(s) disponible(s)', echellePratique ? '(dont pratique active)' : '');
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
    const btnVoirProfil = document.getElementById('btnVoirProfilDepuisEval');

    if (!etudiantDA) {
        // Masquer le bouton de profil si aucun étudiant
        if (btnVoirProfil) btnVoirProfil.style.display = 'none';
        return;
    }

    // Afficher le bouton de profil
    if (btnVoirProfil) btnVoirProfil.style.display = 'block';

    // ✅ FIX: Préserver les sélections actuelles (production, grille, échelle, cartouche)
    const selectProduction = document.getElementById('selectProduction1');
    const selectGrille = document.getElementById('selectGrille1');
    const selectEchelle = document.getElementById('selectEchelle1');
    const selectCartouche = document.getElementById('selectCartoucheEval');
    const selectRemise = document.getElementById('remiseProduction1');

    const productionActuelle = selectProduction?.value || null;
    const grilleActuelle = selectGrille?.value || null;
    const echelleActuelle = selectEchelle?.value || null;
    const cartoucheActuelle = selectCartouche?.value || null;
    const remiseActuelle = selectRemise?.value || 'non-remis';

    // ✅ Vider IMMÉDIATEMENT les critères AVANT de changer quoi que ce soit
    // (important pour éviter que les valeurs de l'étudiant précédent persistent)
    const selects = document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]');
    selects.forEach(select => {
        select.value = '';
        // ✅ Réinitialiser aussi la couleur de fond (enlever les couleurs vert/jaune/etc.)
        select.style.backgroundColor = '';
        select.style.borderColor = '#ddd';
        select.style.fontWeight = 'normal';

        // ✅ Vider aussi le commentaire de rétroaction du critère
        const critereId = select.id.replace('eval_', '');
        const commDiv = document.getElementById(`comm_${critereId}`);
        if (commDiv) {
            commDiv.textContent = 'Sélectionnez un niveau';
            commDiv.style.fontStyle = 'italic';
            commDiv.style.color = '#999';
        }
    });

    // Réinitialiser la note et le niveau
    const noteElem = document.getElementById('noteProduction1');
    const niveauElem = document.getElementById('niveauProduction1');
    if (noteElem) noteElem.textContent = '--';
    if (niveauElem) niveauElem.textContent = '--';

    // Vider la rétroaction finale
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) retroaction.value = '';

    // Initialiser evaluationEnCours avec le nouvel étudiant mais préserver les sélections
    evaluationEnCours = {
        etudiantDA: etudiantDA,
        productionId: productionActuelle,
        grilleId: grilleActuelle,
        echelleId: echelleActuelle,
        cartoucheId: cartoucheActuelle,
        criteres: {},  // ✅ Réinitialiser SEULEMENT les critères évalués
        statutRemise: remiseActuelle
    };

    // Charger les productions pour le nouvel étudiant (réinitialise le select)
    chargerProductionsDansSelect();

    // ✅ IMPORTANT: Restaurer la production sélectionnée APRÈS le rechargement du select
    setTimeout(() => {
        if (productionActuelle && selectProduction) {
            selectProduction.value = productionActuelle;
        }
        if (grilleActuelle && selectGrille) {
            selectGrille.value = grilleActuelle;
        }
        if (echelleActuelle && selectEchelle) {
            selectEchelle.value = echelleActuelle;
        }
        if (cartoucheActuelle && selectCartouche) {
            selectCartouche.value = cartoucheActuelle;
        }
        if (remiseActuelle && selectRemise) {
            selectRemise.value = remiseActuelle;
        }

        // Vérifier si une évaluation existe déjà pour ce nouvel étudiant
        // (Si oui, elle sera chargée et remplacera les critères vides)
        verifierEtChargerEvaluationExistante();
    }, 100);
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
    const productions = db.getSync('productions', []);
    const production = productions.find(p => p.id === productionId);

    if (production) {
        console.log('Production chargée:', production.titre || production.nom);

        // Pré-sélectionner la grille associée à cette production
        if (production.grilleId) {
            const selectGrille = document.getElementById('selectGrille1');
            if (selectGrille) {
                selectGrille.value = production.grilleId;

                // Déclencher le chargement de la grille et des cartouches
                chargerGrilleSelectionnee();

                // Attendre que les cartouches soient chargées, puis vérifier si une évaluation existe
                setTimeout(() => {
                    verifierEtChargerEvaluationExistante();
                }, 100);
            }
        }
    }
}

/* ===============================
   GRILLE ET CARTOUCHE
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
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
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
            '<p class="eval-texte-italic-gris">Le travail doit être remis avant évaluation</p>';
        return;
    }

    const grilleId = evaluationEnCours.grilleId;
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    if (!cartouche) return;

    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // CRITIQUE: Lire les niveaux depuis l'échelle sélectionnée (pas depuis la cartouche)
    // Cela permet d'utiliser des échelles avec plus ou moins de niveaux que la cartouche
    // NOUVEAU (Beta 92): Support échelles de pratiques configurables
    const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
    let echelleSelectionnee = null;

    // Vérifier si c'est une échelle de pratique configurable
    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

        if (pratiqueData && pratiqueData.config && pratiqueData.config.echelle) {
            echelleSelectionnee = {
                id: echelleId,
                niveaux: pratiqueData.config.echelle.niveaux || [],
                type: pratiqueData.config.echelle.type || 'niveaux'
            };
        }
    } else {
        // Échelle personnalisée classique
        const echelles = db.getSync('echellesTemplates', []);
        echelleSelectionnee = echelles.find(e => e.id === echelleId);
    }

    // Fallback: Si pas d'échelle sélectionnée ou non trouvée, utiliser les niveaux de la cartouche
    const niveauxDisponibles = (echelleSelectionnee && echelleSelectionnee.niveaux)
        ? echelleSelectionnee.niveaux
        : cartouche.niveaux;

    // Afficher les critères
    const html = cartouche.criteres.map(critere => {
        const critereGrille = grille.criteres.find(c => c.id === critere.id);
        const ponderation = critereGrille ? critereGrille.ponderation : '?';
        const estAlgorithmique = critereGrille?.type === 'algorithmique';
        const facteur = critereGrille?.facteurNormalisation || 500;

        // Vérifier si la catégorisation des erreurs est activée
        const modalites = db.getSync('modalitesEvaluation', {});
        let categorisationActive = modalites.activerCategorisationErreurs === true;

        // DÉTECTION AUTOMATIQUE : Si l'évaluation a des codes sauvegardés, forcer le mode catégorisation
        // Cela préserve les données existantes et la rétroaction précise
        if (evaluationEnCours?.donneesAlgorithmiques?.[critere.id]?.codes) {
            categorisationActive = true;
        }

        return `
    <div style="margin-bottom: 15px; padding: 12px; background: white; border-left: 3px solid ${estAlgorithmique ? 'var(--orange-accent)' : 'var(--bleu-moyen)'};">
        <div class="eval-grid-critere">
            <div>
    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
        <strong class="u-texte-09">${echapperHtml(critere.nom)}</strong>
        <small style="color: #666;">(${ponderation}%)</small>
        ${estAlgorithmique ? '<span style="font-size: 0.7rem; color: var(--orange-accent); font-weight: bold; margin-left: 6px;">ALGORITHMIQUE</span>' : ''}
    </div>
    ${critereGrille?.description ?
                `<small style="display: block; color: #888; font-style: italic; margin-bottom: 10px; line-height: 1.3;">${echapperHtml(critereGrille.description)}</small>` : ''}

    ${estAlgorithmique ? (categorisationActive ? `
        <!-- Interface algorithmique AVEC catégorisation -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="groupe-form">
                <label style="font-size: 0.75rem; color: #666;">Codes d'erreurs → séparer par ;</label>
                <input type="text"
                       id="eval_categories_${critere.id}"
                       class="controle-form"
                       placeholder="Ex: 1;4;6;1;4;10"
                       oninput="calculerNoteAlgorithmiqueAvecCategories('${critere.id}', ${ponderation}, ${facteur}, '${critereGrille?.id || ''}')"
                       style="font-size: 0.85rem;">
                <small style="font-size: 0.7rem; color: #999;">(Voir configuration de la grille)</small>
            </div>
            <div class="groupe-form">
                <label style="font-size: 0.75rem; color: #666;">Nombre de mots</label>
                <input type="number"
                       id="eval_mots_${critere.id}"
                       class="controle-form"
                       min="1"
                       placeholder="500"
                       oninput="calculerNoteAlgorithmiqueAvecCategories('${critere.id}', ${ponderation}, ${facteur}, '${critereGrille?.id || ''}')"
                       style="font-size: 0.85rem;">
            </div>
        </div>
        <div id="resultat_algo_${critere.id}" style="padding: 8px; background: #f0f8ff; border-radius: 4px; font-size: 0.85rem; color: #666; margin-bottom: 8px;">
            <span id="total_erreurs_${critere.id}">--</span> erreurs / <span id="mots_formule_${critere.id}">--</span> mots → <span id="note_algo_${critere.id}">--</span>/${ponderation} (<span id="pct_algo_${critere.id}">--</span>%) | Niveau: <span id="niveau_algo_${critere.id}">--</span><br>
            <strong>Catégorie dominante:</strong> <span id="cat_dominante_${critere.id}" style="color: var(--orange-accent);">--</span>
        </div>
        <!-- Menu sélecteur IDME pour modification manuelle (ex: jeton de reprise ciblée) -->
        <div style="margin-top: 8px;">
            <label style="font-size: 0.75rem; color: #666; margin-bottom: 4px; display: block;">Niveau IDME (modifiable manuellement) :</label>
            <select id="eval_${critere.id}" class="controle-form"
                    onchange="niveauSelectionne('${critere.id}')"
                    style="font-size: 0.85rem; transition: background-color 0.3s ease; border: 2px solid #ddd; width: 100%;">
                <option value="">-- Utiliser le niveau calculé --</option>
                ${niveauxDisponibles.map(n => `<option value="${n.code}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
            </select>
            <small style="font-size: 0.7rem; color: #999; display: block; margin-top: 4px;">Par défaut: utilise le niveau calculé automatiquement. Modifiez uniquement si nécessaire (ex: jeton de reprise ciblée).</small>
        </div>
    ` : `
        <!-- Interface algorithmique SIMPLE (sans catégorisation) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="groupe-form">
                <label style="font-size: 0.75rem; color: #666;">Nombre d'erreurs</label>
                <input type="number"
                       id="eval_erreurs_${critere.id}"
                       class="controle-form"
                       min="0"
                       placeholder="0"
                       oninput="calculerNoteAlgorithmiqueSimple('${critere.id}', ${ponderation}, ${facteur})"
                       style="font-size: 0.85rem;">
            </div>
            <div class="groupe-form">
                <label style="font-size: 0.75rem; color: #666;">Nombre de mots</label>
                <input type="number"
                       id="eval_mots_${critere.id}"
                       class="controle-form"
                       min="1"
                       placeholder="500"
                       oninput="calculerNoteAlgorithmiqueSimple('${critere.id}', ${ponderation}, ${facteur})"
                       style="font-size: 0.85rem;">
            </div>
        </div>
        <div id="resultat_algo_${critere.id}" style="padding: 8px; background: #f0f8ff; border-radius: 4px; font-size: 0.85rem; color: #666; margin-bottom: 8px;">
            <span id="total_erreurs_simple_${critere.id}">--</span> errreurs sur <span id="mots_simple_${critere.id}">--</span> mots → <span id="note_algo_${critere.id}">--</span>/${ponderation} (<span id="pct_algo_${critere.id}">--</span>%) | Niveau: <span id="niveau_algo_${critere.id}">--</span>
        </div>
        <!-- Menu sélecteur IDME pour modification manuelle (ex: jeton de reprise ciblée) -->
        <div style="margin-top: 8px;">
            <label style="font-size: 0.75rem; color: #666; margin-bottom: 4px; display: block;">Niveau IDME (modifiable manuellement) :</label>
            <select id="eval_${critere.id}" class="controle-form"
                    onchange="niveauSelectionne('${critere.id}')"
                    style="font-size: 0.85rem; transition: background-color 0.3s ease; border: 2px solid #ddd; width: 100%;">
                <option value="">-- Utiliser le niveau calculé --</option>
                ${niveauxDisponibles.map(n => `<option value="${n.code}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
            </select>
            <small style="font-size: 0.7rem; color: #999; display: block; margin-top: 4px;">Par défaut: utilise le niveau calculé automatiquement. Modifiez uniquement si nécessaire (ex: jeton de reprise ciblée).</small>
        </div>
    `) : `
        <!-- Interface standard (holistique/analytique) -->
        <select id="eval_${critere.id}" class="controle-form"
                onchange="niveauSelectionne('${critere.id}')"
                style="font-size: 0.85rem; transition: background-color 0.3s ease; border: 2px solid #ddd; width: 100%;">
            <option value="">--</option>
            ${niveauxDisponibles.map(n => `<option value="${n.code}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
        </select>
    `}
</div>
            <div id="comm_${critere.id}" style="font-size: 0.85rem; line-height: 1.5; color: #555; font-style: italic; padding: 8px; background: #f8f9fa; border-radius: 4px; min-height: 60px;">
                ${estAlgorithmique ? 'Saisissez les erreurs et le nombre de mots' : 'Sélectionnez un niveau'}
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
        const cartouches = db.getSync(`cartouches_${grilleId}`, []);
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

/**
 * Calcule automatiquement la note pour un critère algorithmique
 * Formule: Note = Pondération − (Erreurs ÷ Mots × Facteur)
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 */
function calculerNoteAlgorithmique(critereId, ponderation, facteur) {
    if (!evaluationEnCours) return;

    const erreursInput = document.getElementById(`eval_erreurs_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const erreurs = parseInt(erreursInput?.value) || 0;
    const mots = parseInt(motsInput?.value) || 0;

    if (mots === 0) {
        // Réinitialiser l'affichage
        document.getElementById(`note_algo_${critereId}`).textContent = '--';
        document.getElementById(`pct_algo_${critereId}`).textContent = '--';
        document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
        return;
    }

    // Calcul selon la formule: Pondération − (Erreurs ÷ Mots × Facteur)
    const noteCalculee = ponderation - (erreurs / mots * facteur);
    const pourcentage = (noteCalculee / ponderation) * 100;

    // Limiter entre 0 et 100%
    const pctFinal = Math.max(0, Math.min(100, pourcentage));

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync('echellesTemplates', []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        const niveau = echelleSelectionnee.niveaux.find(n => {
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats
    document.getElementById(`note_algo_${critereId}`).textContent = noteCalculee.toFixed(2);
    document.getElementById(`pct_algo_${critereId}`).textContent = pctFinal.toFixed(1);
    document.getElementById(`niveau_algo_${critereId}`).textContent = niveauIDME;

    // Sauvegarder dans evaluationEnCours
    evaluationEnCours.criteres[critereId] = niveauIDME;

    // Sauvegarder les données algorithmiques séparément pour pouvoir les recharger
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }
    evaluationEnCours.donneesAlgorithmiques[critereId] = {
        erreurs: erreurs,
        mots: mots,
        noteCalculee: noteCalculee,
        pourcentage: pctFinal
    };

    // Calculer la note globale et générer la rétroaction
    calculerNote();
    genererRetroaction(1);
}

/**
 * Génère une rétroaction sur le ratio d'erreurs en prévision de l'EUF
 * Formule: motsParErreur = Mots ÷ Erreurs
 * Interprétation: 1 erreur à chaque X mots
 * Seuil EUF: minimum 1 erreur à chaque 30 mots pour réussir
 *
 * @param {number} erreurs - Nombre total d'erreurs
 * @param {number} mots - Nombre de mots
 * @returns {string} Rétroaction EUF
 */
function genererRetroactionEUF(erreurs, mots) {
    if (erreurs === 0) {
        return ' En prévision de l\'EUF, l\'absence d\'erreur est exceptionnelle.';
    }
    if (mots === 0) return '';

    // Calcul: 1 erreur à chaque X mots
    const motsParErreur = mots / erreurs;

    let retroactionEUF = ` Tu fais en moyenne 1 erreur à chaque ${Math.round(motsParErreur)} mots.`;

    // Seuil EUF: minimum 30 mots par erreur pour réussir
    if (motsParErreur >= 100) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est excellent.';
    } else if (motsParErreur >= 75) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est très bien.';
    } else if (motsParErreur >= 60) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est bien.';
    } else if (motsParErreur >= 30) {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec. Il est recommandé de t\'inscrire au Centre d\'aide en français (CAF).';
    } else {
        retroactionEUF += ' En prévision de l\'EUF, ce ratio mènerait à un échec automatique. Il est fortement recommandé de t\'inscrire au Centre d\'aide en français (CAF).';
    }

    return retroactionEUF;
}

/**
 * Calcule la note algorithmique AVEC catégorisation des erreurs
 * Formule: Note = Pondération − (Total Erreurs ÷ Mots × Facteur)
 * + Calcul du mode (catégorie dominante) pour rétroaction différenciée
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 * @param {string} critereGrilleId - ID du critère dans la grille (pour récupérer les catégories)
 */
function calculerNoteAlgorithmiqueAvecCategories(critereId, ponderation, facteur, critereGrilleId) {
    if (!evaluationEnCours) return;

    const categoriesInput = document.getElementById(`eval_categories_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const categoriesTexte = categoriesInput?.value.trim() || '';
    const mots = parseInt(motsInput?.value) || 0;

    // Parser les codes de sous-critères (ex: "1;4;6;1;4" → ['1', '4', '6', '1', '4'])
    let codesSousCriteres = [];
    if (categoriesTexte) {
        codesSousCriteres = categoriesTexte.split(';')
            .map(c => c.trim())
            .filter(c => c !== '');
    }

    const totalErreurs = codesSousCriteres.length;

    // Afficher le total d'erreurs et le nombre de mots
    document.getElementById(`total_erreurs_${critereId}`).textContent = totalErreurs;
    document.getElementById(`mots_formule_${critereId}`).textContent = mots;

    if (mots === 0 || totalErreurs === 0) {
        // Réinitialiser l'affichage
        document.getElementById(`note_algo_${critereId}`).textContent = '--';
        document.getElementById(`pct_algo_${critereId}`).textContent = '--';
        document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
        document.getElementById(`cat_dominante_${critereId}`).textContent = '--';

        // Vérifier si l'élément existe avant d'y accéder
        const retroDiv = document.getElementById(`retroaction_cat_${critereId}`);
        if (retroDiv) retroDiv.style.display = 'none';

        return;
    }

    // === RÉCUPÉRER LES SOUS-CRITÈRES DEPUIS LA GRILLE ===
    const grilles = db.getSync('grillesTemplates', []);
    const grilleId = evaluationEnCours?.grilleId;
    const grille = grilles.find(g => g.id === grilleId);

    let sousCriteres = [];
    if (grille && grille.criteres) {
        const critereGrille = grille.criteres.find(c => c.id === critereId);
        if (critereGrille && critereGrille.sousCriteres) {
            sousCriteres = critereGrille.sousCriteres;
        }
    }

    // === CALCUL DE LA SOMME PONDÉRÉE DES ERREURS ===
    let sommePonderee = 0;
    codesSousCriteres.forEach(code => {
        // Trouver le sous-critère correspondant au code
        const sc = sousCriteres.find(s => s.code === code);
        if (sc) {
            // Ajouter la pondération (par défaut 1.0 si non définie)
            sommePonderee += (sc.ponderation !== undefined ? sc.ponderation : 1.0);
        } else {
            // Si le code n'existe pas dans les sous-critères, compter comme 1.0
            sommePonderee += 1.0;
        }
    });

    // Calcul selon la formule: Pondération − (Somme Pondérée ÷ Mots × Facteur)
    const noteCalculee = ponderation - (sommePonderee / mots * facteur);
    const pourcentage = (noteCalculee / ponderation) * 100;

    // Limiter entre 0 et 100%
    const pctFinal = Math.max(0, Math.min(100, pourcentage));

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync('echellesTemplates', []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        const niveau = echelleSelectionnee.niveaux.find(n => {
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats
    document.getElementById(`note_algo_${critereId}`).textContent = noteCalculee.toFixed(2);
    document.getElementById(`pct_algo_${critereId}`).textContent = pctFinal.toFixed(1);
    document.getElementById(`niveau_algo_${critereId}`).textContent = niveauIDME;

    // ⚠️ IMPORTANT: Sauvegarder le niveau dans evaluationEnCours pour qu'il soit inclus dans calculerNote()
    evaluationEnCours.criteres[critereId] = niveauIDME;

    // === CALCUL DU MODE (sous-critère dominant) ===
    const frequences = {};
    let maxFreq = 0;
    let codeDominant = null;

    codesSousCriteres.forEach(code => {
        frequences[code] = (frequences[code] || 0) + 1;
        if (frequences[code] > maxFreq) {
            maxFreq = frequences[code];
            codeDominant = code; // Premier en cas d'égalité
        }
    });

    // Afficher le sous-critère dominant
    if (codeDominant !== null) {
        // Trouver le nom du sous-critère dominant
        const scDominant = sousCriteres.find(s => s.code === codeDominant);
        const nomDominant = scDominant ? scDominant.nom : `Code ${codeDominant}`;

        document.getElementById(`cat_dominante_${critereId}`).textContent =
            `${nomDominant} (${maxFreq} occurrence${maxFreq > 1 ? 's' : ''} du code ${codeDominant})`;

        // Récupérer la rétroaction du sous-critère dominant
        if (scDominant && scDominant.retroaction) {
            // Construire la rétroaction complète avec le nombre d'erreurs et la somme pondérée
            let retroactionComplete = `Ta rédaction contient ${totalErreurs} erreur${totalErreurs > 1 ? 's' : ''} de français`;

            // Si la somme pondérée est différente du nombre d'erreurs, l'indiquer
            if (Math.abs(sommePonderee - totalErreurs) > 0.01) {
                retroactionComplete += ` (${sommePonderee.toFixed(1)} points)`;
            }

            retroactionComplete += ` pour ${mots} mots.`;

            // Ajouter la rétroaction EUF (Épreuve Uniforme de Français) immédiatement après le décompte
            const retroactionEUF = genererRetroactionEUF(totalErreurs, mots);
            if (retroactionEUF) {
                retroactionComplete += retroactionEUF;
            }

            // Ajouter la rétroaction spécifique à la catégorie dominante
            retroactionComplete += ` ${scDominant.retroaction}`;

            // Afficher la rétroaction dans la zone de commentaire normale
            const commDiv = document.getElementById(`comm_${critereId}`);
            if (commDiv) {
                commDiv.textContent = retroactionComplete;
            }

            // Sauvegarder la rétroaction finale pour genererRetroaction()
            const retroactionFinale = retroactionComplete;

            // Sauvegarder les données algorithmiques
            if (!evaluationEnCours.donneesAlgorithmiques) {
                evaluationEnCours.donneesAlgorithmiques = {};
            }

            evaluationEnCours.donneesAlgorithmiques[critereId] = {
                codes: codesSousCriteres,
                mots: mots,
                totalErreurs: totalErreurs,
                sommePonderee: sommePonderee,
                noteCalculee: noteCalculee,
                pourcentage: pctFinal,
                retroaction: retroactionFinale
            };

            // Masquer la zone orange (on ne l'utilise plus)
            const retroDiv = document.getElementById(`retroaction_cat_${critereId}`);
            if (retroDiv) retroDiv.style.display = 'none';
        } else {
            // Pas de rétroaction personnalisée, rétroaction générique
            let retroactionGenerique = `Ta rédaction contient ${totalErreurs} erreur${totalErreurs > 1 ? 's' : ''} de français pour ${mots} mots.`;

            // Ajouter la rétroaction EUF (Épreuve Uniforme de Français)
            const retroactionEUF = genererRetroactionEUF(totalErreurs, mots);
            if (retroactionEUF) {
                retroactionGenerique += retroactionEUF;
            }

            const commDiv = document.getElementById(`comm_${critereId}`);
            if (commDiv) {
                commDiv.textContent = retroactionGenerique;
            }

            // Sauvegarder les données algorithmiques
            if (!evaluationEnCours.donneesAlgorithmiques) {
                evaluationEnCours.donneesAlgorithmiques = {};
            }

            evaluationEnCours.donneesAlgorithmiques[critereId] = {
                codes: codesSousCriteres,
                mots: mots,
                totalErreurs: totalErreurs,
                sommePonderee: sommePonderee,
                noteCalculee: noteCalculee,
                pourcentage: pctFinal,
                retroaction: retroactionGenerique
            };
        }
    } else {
        document.getElementById(`cat_dominante_${critereId}`).textContent = '--';
        const commDiv = document.getElementById(`comm_${critereId}`);
        if (commDiv) {
            commDiv.textContent = 'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)';
        }
    }

    // Calculer la note globale et générer la rétroaction
    calculerNote();
    genererRetroaction(1);
}

/**
 * Calcule la note algorithmique SIMPLE (sans catégorisation des erreurs)
 * Formule: Note = Pondération − (Total Erreurs ÷ Mots × Facteur)
 * Rétroaction générique: "Ta rédaction contient X erreurs de français pour Y mots."
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 */
function calculerNoteAlgorithmiqueSimple(critereId, ponderation, facteur) {
    if (!evaluationEnCours) return;

    const erreursInput = document.getElementById(`eval_erreurs_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const erreurs = parseInt(erreursInput?.value) || 0;
    const mots = parseInt(motsInput?.value) || 0;

    // Mettre à jour l'affichage du résumé
    const totalErreursElem = document.getElementById(`total_erreurs_simple_${critereId}`);
    const motsElem = document.getElementById(`mots_simple_${critereId}`);
    if (totalErreursElem) totalErreursElem.textContent = erreurs;
    if (motsElem) motsElem.textContent = mots;

    if (mots === 0) {
        // Réinitialiser l'affichage
        document.getElementById(`note_algo_${critereId}`).textContent = '--';
        document.getElementById(`pct_algo_${critereId}`).textContent = '--';
        document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
        if (totalErreursElem) totalErreursElem.textContent = '--';
        if (motsElem) motsElem.textContent = '--';
        return;
    }

    // Calcul selon la formule: Pondération − (Total Erreurs ÷ Mots × Facteur)
    const noteCalculee = ponderation - (erreurs / mots * facteur);
    const pourcentage = (noteCalculee / ponderation) * 100;

    // Limiter entre 0 et 100%
    const pctFinal = Math.max(0, Math.min(100, pourcentage));

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync('echellesTemplates', []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        const niveau = echelleSelectionnee.niveaux.find(n => {
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats
    document.getElementById(`note_algo_${critereId}`).textContent = noteCalculee.toFixed(2);
    document.getElementById(`pct_algo_${critereId}`).textContent = pctFinal.toFixed(1);
    document.getElementById(`niveau_algo_${critereId}`).textContent = niveauIDME;

    // Construire la rétroaction générique simple
    let retroactionGenerique = `Ta rédaction contient ${erreurs} erreur${erreurs > 1 ? 's' : ''} de français pour ${mots} mots.`;

    // Ajouter la rétroaction EUF (Épreuve Uniforme de Français)
    const retroactionEUF = genererRetroactionEUF(erreurs, mots);
    if (retroactionEUF) {
        retroactionGenerique += retroactionEUF;
    }

    // Afficher dans le champ commentaire standard
    const champCommentaire = document.getElementById(`comm_${critereId}`);
    if (champCommentaire) {
        champCommentaire.value = retroactionGenerique;
    }

    // === SAUVEGARDE DANS evaluationEnCours ===
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }

    evaluationEnCours.donneesAlgorithmiques[critereId] = {
        erreurs: erreurs,
        mots: mots,
        noteCalculee: noteCalculee,
        pourcentage: pctFinal,  // Sauvegarder comme nombre, pas string
        niveau: niveauIDME,
        retroaction: retroactionGenerique
    };

    // Sauvegarder le critère dans evaluationEnCours.criteres avec le niveau
    evaluationEnCours.criteres[critereId] = niveauIDME;

    // Déclencher le recalcul et la régénération de rétroaction
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
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
    // NOUVEAU (Beta 92): Support échelles de pratiques configurables
    const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
    let echelleSelectionnee = null;

    // Vérifier si c'est une échelle de pratique configurable
    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

        if (pratiqueData && pratiqueData.config && pratiqueData.config.echelle) {
            echelleSelectionnee = {
                id: echelleId,
                niveaux: pratiqueData.config.echelle.niveaux || [],
                type: pratiqueData.config.echelle.type || 'niveaux'
            };
        }
    } else {
        // Échelle personnalisée classique
        const echelles = db.getSync('echellesTemplates', []);
        echelleSelectionnee = echelles.find(e => e.id === echelleId);
    }

    // SÉCURITÉ: Vérifier que l'échelle existe
    if (!echelleSelectionnee || !echelleSelectionnee.niveaux || echelleSelectionnee.niveaux.length === 0) {
        console.error('❌ Aucune échelle de performance sélectionnée');
        document.getElementById('noteProduction1').textContent = '--';
        document.getElementById('niveauProduction1').textContent = '--';
        return;
    }

    const niveaux = echelleSelectionnee.niveaux;

    // Utiliser les valeurs ponctuelles configurées par l'utilisateur
    const valeurs = {};
    niveaux.forEach(niveau => {
        // Si valeurCalcul existe, l'utiliser, sinon calculer le milieu de la plage
        valeurs[niveau.code] = niveau.valeurCalcul || (niveau.min + niveau.max) / 2;
    });

    let noteTotal = 0;
    let ponderationTotal = 0;
    const notesCriteres = []; // Pour collecter les notes à copier-coller

    // 🔍 DEBUG: Afficher les données algorithmiques disponibles
    console.log('🔍 DEBUG calculerNote() - Données algorithmiques:', evaluationEnCours.donneesAlgorithmiques);

    grille.criteres.forEach(critere => {
        const niveau = evaluationEnCours.criteres[critere.id];
        if (niveau) {
            const ponderation = (critere.ponderation || 0) / 100;

            // IMPORTANT: Pour les critères algorithmiques, utiliser le pourcentage exact calculé
            // au lieu de la valeur par défaut du niveau (ex: 61.5% au lieu de 32% pour I)
            // SAUF si l'utilisateur a manuellement sélectionné un niveau différent (jeton de reprise ciblée)
            let valeurCritere = valeurs[niveau];
            let sourceValeur = 'niveau défaut';

            // Vérifier si le select du critère est en mode manuel (valeur non vide)
            const selectCritere = document.getElementById(`eval_${critere.id}`);
            const niveauManuel = selectCritere?.value; // Niveau sélectionné manuellement (vide si "-- Utiliser le niveau calculé --")

            if (evaluationEnCours.donneesAlgorithmiques &&
                evaluationEnCours.donneesAlgorithmiques[critere.id] &&
                evaluationEnCours.donneesAlgorithmiques[critere.id].pourcentage !== undefined &&
                !niveauManuel) { // Utiliser l'algorithme SEULEMENT si pas de sélection manuelle
                // Utiliser le pourcentage exact du calcul algorithmique
                valeurCritere = evaluationEnCours.donneesAlgorithmiques[critere.id].pourcentage;
                sourceValeur = 'algorithme exact';
            } else if (niveauManuel) {
                // Niveau sélectionné manuellement : utiliser la valeur par défaut du niveau
                sourceValeur = 'manuel (jeton)';
            }

            if (valeurCritere !== undefined) {
                const contribution = valeurCritere * ponderation;
                noteTotal += contribution;
                ponderationTotal += ponderation;

                // Collecter le niveau IDME du critère pour l'export (ex: M, D, E, I)
                notesCriteres.push(niveau);

                // 🔍 DEBUG: Afficher le détail de chaque critère (convertir en nombre pour toFixed)
                const valNum = typeof valeurCritere === 'number' ? valeurCritere : parseFloat(valeurCritere);
                console.log(`  • ${critere.nom}: niveau=${niveau}, valeur=${valNum.toFixed(1)}%, source="${sourceValeur}", pond=${(ponderation * 100).toFixed(0)}%, contrib=${contribution.toFixed(2)}%`);
            }
        }
    });

    let pourcentage = 0;
    let niveauGlobal = '--';

    if (ponderationTotal > 0) {
        // La moyenne pondérée est directement en pourcentage
        pourcentage = noteTotal / ponderationTotal;

        // 🔍 DEBUG: Afficher le résultat final
        console.log(`🔍 DEBUG calculerNote() - Résultat: noteTotal=${noteTotal.toFixed(2)}%, ponderationTotal=${(ponderationTotal * 100).toFixed(0)}%, pourcentageFinal=${pourcentage.toFixed(1)}%`);

        // APPLIQUER LE PLAFOND (CEILING) si c'est une reprise ciblée
        if (evaluationEnCours.plafondNoteCiblee) {
            const niveauPlafond = niveaux.find(n => n.code === evaluationEnCours.plafondNoteCiblee);
            if (niveauPlafond && pourcentage > niveauPlafond.max) {
                console.log(`🔍 DEBUG calculerNote() - Application plafond "${evaluationEnCours.plafondNoteCiblee}": ${pourcentage.toFixed(1)}% → ${niveauPlafond.max}%`);
                pourcentage = niveauPlafond.max;
            }
        }

        // Déterminer le niveau global selon l'échelle
        const niveauFinal = niveaux.find(n => {
            return pourcentage >= n.min && pourcentage <= n.max;
        });

        niveauGlobal = niveauFinal ? niveauFinal.code : '--';

        // 🔍 DEBUG: Afficher le niveau déterminé
        console.log(`🔍 DEBUG calculerNote() - Niveau final: ${niveauGlobal} (${niveauFinal ? niveauFinal.nom : 'non trouvé'})`);
    }

    // Mettre à jour l'affichage
    document.getElementById('noteProduction1').textContent = pourcentage.toFixed(1) + ' %';
    document.getElementById('niveauProduction1').textContent = niveauGlobal;

    // Afficher les notes des critères pour copier-coller
    const criteresCopierElement = document.getElementById('criteresCopier');
    if (criteresCopierElement) {
        if (notesCriteres.length > 0) {
            criteresCopierElement.textContent = notesCriteres.join('\t');
        } else {
            criteresCopierElement.textContent = '--';
        }
    }

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
 * @param {string} codeNiveau - Code du niveau (I, D, M, E, 0, etc.)
 *
 * RETOUR:
 * @returns {string} - Couleur CSS (var(--...) ou #...)
 */
function obtenirCouleurNiveau(codeNiveau) {
    if (!codeNiveau) return 'transparent';

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync('echellesTemplates', []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    if (!echelleSelectionnee || !echelleSelectionnee.niveaux) {
        return 'transparent';
    }

    const niveau = echelleSelectionnee.niveaux.find(n => n.code === codeNiveau);

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
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId);

    if (!cartouche) return;

    const productions = db.getSync('productions', []);
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
            // Utiliser prenom qui sera soit le vrai nom en mode normal, soit "Élève X" en mode anonymisation
            console.log(`📝 [genererRetroaction] Mode actuel: ${db.getSync('modeApplication', null)}, Nom utilisé: ${etudiant.prenom}`);
            texte += `\nBonjour ${etudiant.prenom} !\n\n`;
        }
    }

    // Contexte de la cartouche
    if (document.getElementById('afficherContexte1')?.checked && cartouche.contexte) {
        texte += `${cartouche.contexte}\n\n`;
    }

    // Commentaires des critères
    texte += 'Voici quelques observations :\n\n';

    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (grille) {
        grille.criteres.forEach(critere => {
            const niveau = evaluationEnCours.criteres[critere.id];
            if (niveau) {
                // Vérifier si c'est un critère algorithmique
                if (critere.type === 'algorithmique' && evaluationEnCours.donneesAlgorithmiques?.[critere.id]?.retroaction) {
                    // Utiliser la rétroaction algorithmique sauvegardée
                    const retroAlgo = evaluationEnCours.donneesAlgorithmiques[critere.id].retroaction;
                    texte += `${critere.nom} (${niveau}) : ${retroAlgo}\n\n`;
                } else {
                    // Critère standard (holistique/analytique)
                    const cle = `${critere.id}_${niveau}`;
                    const commentaire = cartouche.commentaires[cle];

                    if (commentaire) {
                        texte += `${critere.nom} (${niveau}) : ${commentaire}\n\n`;
                    }
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
   SAUVEGARDE DE L'ÉVALUATION
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

    const productions = db.getSync('productions', []);
    const production = productions.find(p => p.id === productionId);

    const grilles = db.getSync('grillesTemplates', []);
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
        statutIntegrite: document.getElementById('statutIntegrite').value || 'recevable',
        notesIntegrite: document.getElementById('notesIntegrite').value || '',
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
        donneesAlgorithmiques: evaluationEnCours.donneesAlgorithmiques || {}, // Sauvegarder données du français écrit algorithmique
        verrouillee: true // Verrouiller par défaut toutes les nouvelles évaluations
    };

    // Lire l'état des checkboxes de jetons et appliquer si cochées
    const checkboxDelai = document.getElementById('checkboxJetonDelai');
    if (checkboxDelai && checkboxDelai.checked) {
        // Vérifier la disponibilité du jeton avant de l'appliquer
        if (typeof verifierDisponibiliteJeton === 'function' && verifierDisponibiliteJeton(etudiantDA, 'delai')) {
            const config = obtenirConfigJetons();
            evaluation.jetonDelaiApplique = true;
            evaluation.dateApplicationJetonDelai = maintenant.toISOString();
            evaluation.delaiAccorde = true;
            evaluation.dureeDelaiJours = config.delai.dureeJours;
        } else {
            // Décocher la checkbox si le jeton n'est pas disponible
            checkboxDelai.checked = false;
            const config = obtenirConfigJetons();
            const utilises = compterJetonsUtilises(etudiantDA, 'delai');
            afficherNotificationErreur(
                'Jetons épuisés',
                `Plus de jetons de délai disponibles (${utilises}/${config.delai.nombre} utilisés)`
            );
        }
    }

    // Sauvegarder
    let evaluations = db.getSync('evaluationsSauvegardees', []);
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

    // 🔄 Rafraîchir le tableau des évaluations si affiché
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
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
            '<p class="eval-texte-italic-gris">Le travail doit être remis avant évaluation</p>';
    } else if (evaluationEnCours?.cartoucheId) {
        // Si remis et cartouche sélectionnée, afficher les critères
        cartoucheSelectionnee();
    }
}

/**
 * Gère le changement de statut d'intégrité académique
 */
function changerStatutIntegrite() {
    const statut = document.getElementById('statutIntegrite').value;
    const divNotes = document.getElementById('divNotesIntegrite');
    const notes = document.getElementById('notesIntegrite');

    // Sauvegarder dans evaluationEnCours
    if (evaluationEnCours) {
        evaluationEnCours.statutIntegrite = statut;
        evaluationEnCours.notesIntegrite = notes.value;
    }

    // Afficher le champ de notes seulement si ce n'est pas "recevable"
    if (statut !== 'recevable') {
        divNotes.style.display = 'block';
    } else {
        divNotes.style.display = 'none';
        notes.value = ''; // Vider les notes si on repasse à recevable
        if (evaluationEnCours) {
            delete evaluationEnCours.notesIntegrite;
        }
    }

    // Si non recevable (plagiat ou IA), mettre tous les critères à 0 et désactiver
    const estNonRecevable = (statut === 'plagiat' || statut === 'ia');

    if (estNonRecevable) {
        // Récupérer tous les selects de critères
        const listeCriteres = document.getElementById('listeCriteresGrille1');
        const selectsCriteres = listeCriteres ? listeCriteres.querySelectorAll('select[id^="critere"]') : [];

        selectsCriteres.forEach(select => {
            select.value = '0'; // Mettre à "0 - Aucun"
            select.disabled = true; // Désactiver
            select.style.opacity = '0.5';
        });

        // Afficher un message d'avertissement
        const messageExistant = document.getElementById('message-non-recevable');
        if (!messageExistant && listeCriteres) {
            const message = document.createElement('div');
            message.id = 'message-non-recevable';
            message.className = 'alerte alerte-info';
            message.style.marginBottom = '15px';
            message.innerHTML = `
                <strong>Travail non recevable</strong><br>
                Les critères sont automatiquement à 0. Cette évaluation sera exclue des calculs de moyenne.
                ${statut === 'plagiat' ? 'Un jeton de reprise peut être appliqué pour permettre une nouvelle remise.' : ''}
            `;
            listeCriteres.insertBefore(message, listeCriteres.firstChild);
        }

        // Recalculer la note (qui sera 0)
        calculerNote();
    } else {
        // Réactiver les selects de critères
        const listeCriteres = document.getElementById('listeCriteresGrille1');
        const selectsCriteres = listeCriteres ? listeCriteres.querySelectorAll('select[id^="critere"]') : [];

        selectsCriteres.forEach(select => {
            select.disabled = false;
            select.style.opacity = '1';
        });

        // Retirer le message d'avertissement si présent
        const message = document.getElementById('message-non-recevable');
        if (message) {
            message.remove();
        }

        // Recalculer la note avec les valeurs actuelles
        calculerNote();
    }
}

// Fonction gererDelaiAccorde() supprimée - remplacée par appliquerJetonDelaiDepuisSidebar()

/**
 * Affiche les badges des jetons appliqués sur l'évaluation courante
 */
function afficherBadgesJetons() {
    const section = document.getElementById('gestionJetonsEvaluation');
    const conteneur = document.getElementById('infoJetonsAppliques');

    console.log('🔍 afficherBadgesJetons() - section:', section ? 'TROUVÉ' : 'NON TROUVÉ');
    console.log('🔍 afficherBadgesJetons() - conteneur:', conteneur ? 'TROUVÉ' : 'NON TROUVÉ');
    console.log('🔍 afficherBadgesJetons() - evaluationEnCours.idModification:', window.evaluationEnCours?.idModification);

    if (!section || !conteneur || !window.evaluationEnCours?.idModification) {
        console.log('❌ Sortie précoce de afficherBadgesJetons()');
        if (section) section.style.display = 'none';
        return;
    }

    // CORRECTION: Utiliser obtenirDonneesSelonMode au lieu de localStorage direct
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === window.evaluationEnCours.idModification);

    console.log('🔍 Évaluation trouvée:', evaluation ? 'OUI' : 'NON');
    if (evaluation) {
        console.log('   - ID:', evaluation.id);
        console.log('   - ID commence par EVAL_REPRISE_:', evaluation.id.startsWith('EVAL_REPRISE_'));
        console.log('   - jetonRepriseApplique:', evaluation.jetonRepriseApplique);
        console.log('   - repriseDeId:', evaluation.repriseDeId);
        console.log('   - jetonDelaiApplique:', evaluation.jetonDelaiApplique);
        console.log('   - delaiAccorde:', evaluation.delaiAccorde);
    }

    if (!evaluation) {
        section.style.display = 'none';
        return;
    }

    let badges = [];

    // Badge pour jeton de reprise (violet)
    // CORRECTION: Vérifier aussi si l'ID commence par EVAL_REPRISE_ (même logique que le tableau)
    const estNouvelleReprise = evaluation.jetonRepriseApplique || evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_');
    if (estNouvelleReprise) {
        console.log('✅ Ajout badge jeton de reprise');
        badges.push(`
            <span class="statut-badge" style="background: #9c27b0; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px;">
                <span>⭐ Reprise</span>
                <button onclick="retirerJetonDepuisSidebar('${evaluation.id}', 'reprise')"
                        style="background: none; border: none; color: white; cursor: pointer; font-size: 1rem; padding: 0; font-weight: bold; line-height: 1;"
                        title="Retirer le jeton de reprise">×</button>
            </span>
        `);
    }

    // Badge pour jeton de délai (orange)
    const aDejaJetonDelai = evaluation.jetonDelaiApplique || evaluation.delaiAccorde;
    if (aDejaJetonDelai) {
        badges.push(`
            <span class="statut-badge" style="background: #ff6f00; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px;">
                <span>⭐ Délai</span>
                <button onclick="retirerJetonDepuisSidebar('${evaluation.id}', 'delai')"
                        style="background: none; border: none; color: white; cursor: pointer; font-size: 1rem; padding: 0; font-weight: bold; line-height: 1;"
                        title="Retirer le jeton de délai">×</button>
            </span>
        `);
    }

    // Afficher ou masquer la section selon qu'il y a des badges
    if (badges.length > 0) {
        console.log('✅ Affichage des badges (' + badges.length + ')');
        conteneur.innerHTML = badges.join('');
        section.style.display = 'block';
    } else {
        console.log('⚠️ Aucun badge à afficher');
        section.style.display = 'none';
    }
}

/**
 * Affiche ou masque la section de gestion des jetons
 * @param {boolean} afficher - true pour afficher, false pour masquer
 */
function afficherGestionJetons(afficher) {
    const sectionBadges = document.getElementById('gestionJetonsEvaluation');
    const sectionOptions = document.getElementById('optionsJetons');
    const badgeDelai = document.getElementById('badgeJetonDelaiOption');
    const badgeReprise = document.getElementById('badgeJetonRepriseOption');
    const checkboxDelai = document.getElementById('checkboxJetonDelai');
    const checkboxReprise = document.getElementById('checkboxJetonReprise');

    if (afficher && window.evaluationEnCours?.idModification) {
        // MODE MODIFICATION : Évaluation existante
        // Récupérer l'évaluation pour vérifier si elle a déjà des jetons
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
        const evaluation = evaluations.find(e => e.id === window.evaluationEnCours.idModification);

        // Masquer complètement la section des badges (on utilise les checkboxes à la place)
        if (sectionBadges) sectionBadges.style.display = 'none';

        // Afficher la section des options de jetons
        if (sectionOptions) sectionOptions.style.display = 'block';

        if (evaluation) {
            // Vérifier si l'évaluation a déjà des jetons
            const aDejaJetonDelai = evaluation.jetonDelaiApplique || evaluation.delaiAccorde;
            const aDejaJetonReprise = evaluation.jetonRepriseApplique || evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_');

            // Toujours afficher les options
            if (badgeDelai) badgeDelai.style.display = 'flex';
            if (badgeReprise) badgeReprise.style.display = 'flex';

            // Cocher les checkboxes si les jetons sont déjà appliqués
            if (checkboxDelai) checkboxDelai.checked = aDejaJetonDelai;
            if (checkboxReprise) checkboxReprise.checked = aDejaJetonReprise;
        }

        // Afficher les jetons personnalisés
        afficherJetonsPersonnalisesEvaluation();
    } else if (afficher) {
        // MODE NOUVELLE ÉVALUATION : Afficher les options seulement (pas les badges)
        if (sectionBadges) sectionBadges.style.display = 'none';
        if (sectionOptions) sectionOptions.style.display = 'block';

        // Afficher tous les badges de jetons (aucun n'est encore appliqué)
        if (badgeDelai) badgeDelai.style.display = 'flex';
        if (badgeReprise) badgeReprise.style.display = 'flex';

        // Décocher les checkboxes
        if (checkboxDelai) checkboxDelai.checked = false;
        if (checkboxReprise) checkboxReprise.checked = false;

        // Afficher les jetons personnalisés
        afficherJetonsPersonnalisesEvaluation();
    } else {
        // MODE MASQUÉ : Tout masquer
        if (sectionBadges) sectionBadges.style.display = 'none';
        if (sectionOptions) sectionOptions.style.display = 'none';
    }
}

/**
 * Gère le changement de la checkbox jeton de délai
 * Applique ou retire le jeton selon l'état de la checkbox
 */
function gererChangementCheckboxJetonDelai() {
    const checkbox = document.getElementById('checkboxJetonDelai');
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        // Nouvelle évaluation : on laisse la checkbox cochée
        // Le jeton sera appliqué lors de la sauvegarde
        if (checkbox.checked) {
            console.log('✅ Jeton de délai marqué pour application lors de la sauvegarde');
        }
        return;
    }

    // Évaluation existante : appliquer ou retirer immédiatement
    if (checkbox.checked) {
        // Appliquer le jeton
        const succes = appliquerJetonDelai(evaluationId);
        if (!succes) {
            // Si l'application a échoué, décocher la checkbox
            checkbox.checked = false;
        }
    } else {
        // Retirer le jeton
        retirerJetonDelai(evaluationId);
    }
}

/**
 * Gère le changement de la checkbox jeton de reprise
 * Applique ou retire le jeton selon l'état de la checkbox
 */
function gererChangementCheckboxJetonReprise() {
    const checkbox = document.getElementById('checkboxJetonReprise');
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        console.warn('⚠️ Jeton de reprise : Impossible d\'appliquer sur une nouvelle évaluation (pas encore sauvegardée)');
        checkbox.checked = false;
        afficherNotificationErreur('Erreur', 'Veuillez d\'abord sauvegarder l\'évaluation avant d\'appliquer un jeton');
        return;
    }

    if (checkbox.checked) {
        // Pour le jeton de reprise, demander confirmation car cela crée une nouvelle évaluation
        const confirmer = confirm(
            'Appliquer un jeton de reprise créera une nouvelle évaluation qui remplacera celle-ci.\n\n' +
            'Voulez-vous continuer ?'
        );

        if (confirmer) {
            const nouvelleEval = appliquerJetonReprise(evaluationId);
            if (nouvelleEval) {
                // Charger la nouvelle évaluation dans le formulaire
                setTimeout(() => {
                    if (typeof modifierEvaluation === 'function') {
                        modifierEvaluation(nouvelleEval.id);
                    }
                }, 500);
            } else {
                // Si l'application a échoué, décocher la checkbox
                checkbox.checked = false;
            }
        } else {
            // L'utilisateur a annulé, décocher la checkbox
            checkbox.checked = false;
        }
    } else {
        // Retirer le jeton
        retirerJetonReprise(evaluationId);
    }
}

/**
 * Gère le changement de la checkbox jeton de reprise ciblée
 * Applique ou retire le jeton selon l'état de la checkbox
 */
function gererChangementCheckboxJetonRepriseCiblee() {
    const checkbox = document.getElementById('checkboxJetonRepriseCiblee');
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        console.warn('⚠️ Jeton de reprise ciblée : Impossible d\'appliquer sur une nouvelle évaluation (pas encore sauvegardée)');
        checkbox.checked = false;
        afficherNotificationErreur('Erreur', 'Veuillez d\'abord sauvegarder l\'évaluation avant d\'appliquer un jeton');
        return;
    }

    if (checkbox.checked) {
        // Pour le jeton de reprise ciblée, demander confirmation
        const confirmer = confirm(
            'Appliquer un jeton de reprise ciblée créera une nouvelle évaluation ciblant UN SEUL critère spécifique.\n\n' +
            'La correction apportée devra être justifiée et la note sera plafonnée selon votre configuration.\n\n' +
            'Voulez-vous continuer ?'
        );

        if (confirmer) {
            // Appliquer le jeton via le module evaluation-jetons.js
            if (typeof appliquerJetonRepriseCiblee === 'function') {
                const nouvelleEval = appliquerJetonRepriseCiblee(evaluationId);
                if (nouvelleEval) {
                    // Charger la nouvelle évaluation dans le formulaire
                    setTimeout(() => {
                        if (typeof modifierEvaluation === 'function') {
                            modifierEvaluation(nouvelleEval.id);
                        }
                    }, 500);
                } else {
                    // Si l'application a échoué, décocher la checkbox
                    checkbox.checked = false;
                }
            } else {
                console.error('❌ Fonction appliquerJetonRepriseCiblee non disponible');
                afficherNotificationErreur('Erreur', 'Module jetons non disponible');
                checkbox.checked = false;
            }
        } else {
            // L'utilisateur a annulé, décocher la checkbox
            checkbox.checked = false;
        }
    } else {
        // Retirer le jeton (TODO: implémenter si nécessaire)
        console.log('ℹ️ Retrait du jeton de reprise ciblée');
    }
}

/**
 * Retire un jeton depuis la barre latérale (pendant l'édition)
 * @param {string} evaluationId - ID de l'évaluation
 * @param {string} typeJeton - Type de jeton à retirer ('reprise', 'delai', ou 'reprise-ciblee')
 */
function retirerJetonDepuisSidebar(evaluationId, typeJeton) {
    console.log('🗑️ Retrait jeton:', typeJeton, 'pour évaluation:', evaluationId);

    if (typeJeton === 'reprise') {
        // Utiliser le module evaluation-jetons.js pour retirer le jeton de reprise
        if (typeof retirerJetonReprise === 'function') {
            retirerJetonReprise(evaluationId);
        } else {
            console.error('❌ Fonction retirerJetonReprise non disponible');
            afficherNotificationErreur('Erreur', 'Module jetons non disponible');
        }
    } else if (typeJeton === 'delai') {
        // Utiliser le module evaluation-jetons.js pour retirer le jeton de délai
        if (typeof retirerJetonDelai === 'function') {
            const succes = retirerJetonDelai(evaluationId);
            if (succes) {
                // Réafficher le bouton pour permettre de réappliquer le jeton
                const bouton = document.getElementById('boutonJetonDelai');
                if (bouton) bouton.style.display = 'block';
            }
        } else {
            console.error('❌ Fonction retirerJetonDelai non disponible');
            afficherNotificationErreur('Erreur', 'Module jetons non disponible');
        }
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
    document.getElementById('listeCriteresGrille1').innerHTML = '<p class="eval-texte-placeholder">Sélectionnez une grille et une cartouche</p>';
    document.getElementById('retroactionFinale1').value = '';
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    // Masquer les badges de jetons et boutons de jetons
    const section = document.getElementById('gestionJetonsEvaluation');
    const boutonDelai = document.getElementById('boutonJetonDelai');
    const boutonReprise = document.getElementById('boutonJetonReprise');
    if (section) section.style.display = 'none';
    if (boutonDelai) boutonDelai.style.display = 'none';
    if (boutonReprise) boutonReprise.style.display = 'none';

    cocherOptionsParDefaut();

    // 🔄 Réinitialiser evaluationEnCours à un objet vide (pas null) pour permettre l'affichage des jetons
    window.evaluationEnCours = {
        criteres: {}
    };
    filtrerEtudiantsParGroupe();

    // 🔄 Effacer les sélections mémorisées du mode évaluation en série
    db.removeSync('dernieresSelectionsEvaluation');
    console.log('✅ Sélections mémorisées effacées et mode nouvelle évaluation activé');

    // Masquer l'indicateur de progression
    const indicateur = document.getElementById('indicateurProgressionEval');
    if (indicateur) indicateur.style.display = 'none';

    // Masquer l'indicateur de modification
    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.style.display = 'none';

    // Masquer le bouton de verrouillage et réactiver le formulaire
    afficherOuMasquerBoutonVerrouillage(false);
    desactiverFormulaireEvaluation(false);

    // Afficher les options de jetons pour nouvelle évaluation
    afficherGestionJetons(true);

    // Masquer la ligne Supprimer cette évaluation (seulement pour évaluations existantes)
    const ligneSupprimer = document.getElementById('ligneSupprimerEvaluation');
    if (ligneSupprimer) {
        ligneSupprimer.style.display = 'none';
    }

    afficherNotificationSucces('Paramètres réinitialisés - Prêt pour une nouvelle série d\'évaluations');
}

/**
 * Réinitialise uniquement le formulaire (critères, notes) sans effacer les sélections
 */
function reinitialiserFormulaire() {
    // Réinitialiser uniquement les éléments du formulaire de notation
    document.getElementById('listeCriteresGrille1').innerHTML = '<p class="eval-texte-placeholder">Sélectionnez une grille et une cartouche</p>';
    document.getElementById('retroactionFinale1').value = '';
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    // Réinitialiser les checkboxes jetons
    const checkboxDelai = document.getElementById('checkboxJetonDelai');
    const checkboxReprise = document.getElementById('checkboxJetonReprise');
    if (checkboxDelai) checkboxDelai.checked = false;
    if (checkboxReprise) checkboxReprise.checked = false;

    // Réinitialiser la rétroaction finale
    const retroactionFinale = document.getElementById('retroactionFinale1');
    if (retroactionFinale) retroactionFinale.value = '';

    afficherNotificationSucces('Formulaire réinitialisé - Les sélections sont conservées');
}

/**
 * Navigation vers la liste des évaluations
 */
function naviguerVersListeEvaluations() {
    afficherSousSection('evaluations-liste');
}

/**
 * Navigation vers le formulaire d'évaluation pour un étudiant et une production spécifiques
 * Appelée depuis les badges d'artefacts dans le profil étudiant
 *
 * FONCTIONNEMENT:
 * - Si l'évaluation existe déjà : charge l'évaluation existante avec notes et commentaires
 * - Si l'évaluation n'existe pas : affiche un formulaire vide prêt à évaluer
 *
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} productionId - ID de la production à évaluer
 */
function evaluerProduction(da, productionId) {
    console.log('🎯 Navigation vers évaluation:', { da, productionId });

    // 1. Naviguer vers la section d'évaluation individuelle
    afficherSection('evaluations');
    afficherSousSection('evaluations-individuelles');

    // 2. Attendre que le DOM soit prêt et pré-remplir le formulaire
    setTimeout(() => {
        const selectEtudiant = document.getElementById('selectEtudiantEval');
        const selectProduction = document.getElementById('selectProduction1');

        if (!selectEtudiant || !selectProduction) {
            console.error('❌ Éléments de formulaire introuvables');
            return;
        }

        // 3. Pré-sélectionner l'étudiant
        selectEtudiant.value = da;

        // 4. Déclencher le chargement des productions pour cet étudiant
        chargerEvaluationsEtudiant();

        // 5. Attendre que les productions soient chargées et pré-sélectionner la production
        setTimeout(() => {
            selectProduction.value = productionId;

            // 6. Déclencher le chargement de la production
            // Le système va automatiquement détecter si une évaluation existe (via verifierEtChargerEvaluationExistante)
            // et la charger, sinon affichera un formulaire vide
            const event = new Event('change', { bubbles: true });
            selectProduction.dispatchEvent(event);

            console.log('✅ Formulaire d\'évaluation prêt pour:', { da, productionId });
        }, 200);
    }, 100);
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
   CALCUL DES INDICES
   =============================== */

/**
 * Calcule et sauvegarde les indices C (Complétion) et P (Performance)
 * Basé sur le Guide de monitorage
 */
function calculerEtSauvegarderIndicesEvaluation() {
    console.log('Calcul des indices C et P...');

    const etudiants = db.getSync('groupeEtudiants', []);
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const productions = db.getSync('productions', []);

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
    db.setSync('indicesEvaluation', indicesEvaluation);
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
            const cartouches = db.getSync(key, []);
            const cartouche = cartouches.find(c => c.id === cartoucheId);
            if (cartouche) return cartouche.nom;
        }
        return cartoucheId; // Retourner l'ID si rien trouvé
    }

    // Chercher dans la grille spécifique
    const cartouchesKey = `cartouches_${grilleId}`;
    const cartouches = db.getSync(cartouchesKey, []);
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
    const echelles = db.getSync('echellesTemplates', []);
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
   AFFICHAGE DE LA LISTE
   =============================== */

/**
 * Charge et affiche la liste des évaluations avec accordéon
 */
function chargerListeEvaluationsRefonte() {
    console.log('Chargement de la liste des évaluations...');

    // 🆕 NOUVEAU : Les indices sont maintenant calculés par liste-evaluations.js
    // L'ancien calcul est désactivé pour éviter les conflits de structure

    // Récupérer toutes les données
    const etudiants = db.getSync('groupeEtudiants', []);
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    // 🎯 LECTURE DEPUIS LA SOURCE UNIQUE : saisie-presences.js génère indicesAssiduiteDetailles
    const indicesAssiduiteDetailles = db.getSync('indicesAssiduiteDetailles', {});
    // 🎯 LECTURE DEPUIS LA SOURCE UNIQUE : portfolio.js génère indicesCP
    const indicesCP = db.getSync('indicesCP', {});

    // Détecter la pratique active
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

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

        // 🎯 Lire l'indice A depuis saisie-presences.js (Single Source of Truth)
        const indiceA = indicesAssiduiteDetailles[etudiant.da]?.actuel?.indice ?? 0;

        // 🎯 Lire les indices C et P depuis portfolio.js (Single Source of Truth)
        // Utiliser la pratique active (SOM ou PAN)
        const indicesCPEtudiant = indicesCP[etudiant.da]?.actuel?.[pratique] || null;
        const indiceC = indicesCPEtudiant && typeof indicesCPEtudiant.C === 'number' ? indicesCPEtudiant.C / 100 : 0;
        const indiceP = indicesCPEtudiant && typeof indicesCPEtudiant.P === 'number' ? indicesCPEtudiant.P / 100 : 0;

        // Calculer l'indice R (Risque) = 1 - (A × C × P)
        const indiceR = 1 - (indiceA * indiceC * indiceP);

        return {
            ...etudiant,
            evaluations: evalsEtudiant,
            indices: {
                assiduite: indiceA,
                completion: indiceC,
                performance: indiceP,
                risque: indiceR
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
    const preference = db.getSync('preferenceTriEvaluations', null);
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
    // Détecter la pratique active pour lire le bon indice C
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

    // Compter uniquement les artefacts distincts (exclure les évaluations remplacées)
    const evaluationsActives = etudiant.evaluations.filter(e => !e.remplaceeParId);
    const productionsDistinctes = new Set(evaluationsActives.map(e => e.productionId));
    const nbArtefacts = productionsDistinctes.size;

    // Convertir de pourcentage (0-100) en proportion (0-1)
    let completion = 0;

    // PRIORITÉ 1 : Utiliser obtenirIndicesCP si disponible (Single Source of Truth)
    if (typeof obtenirIndicesCP === 'function') {
        const indicesCPEtudiant = obtenirIndicesCP(etudiant.da, pratique);
        if (indicesCPEtudiant && typeof indicesCPEtudiant.C === 'number' && !isNaN(indicesCPEtudiant.C)) {
            completion = indicesCPEtudiant.C / 100;
        }
    }

    // PRIORITÉ 2 : Fallback - Lire directement depuis localStorage
    if (completion === 0) {
        const indicesCP = db.getSync('indicesCP', {});
        const actuel = indicesCP[etudiant.da]?.actuel;
        if (actuel && actuel[pratique] && typeof actuel[pratique].C === 'number') {
            completion = actuel[pratique].C / 100;
        }
    }

    // PRIORITÉ 3 : Fallback final - Calculer depuis le nombre d'artefacts
    if (completion === 0 && nbArtefacts > 0) {
        const productions = db.getSync('productions', []);
        const productionsAttendues = productions.filter(p => p.type !== 'portfolio').length;
        completion = productionsAttendues > 0 ? nbArtefacts / productionsAttendues : 0;
    }

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
            <strong class="eval-texte-11">C</strong>
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
    const productions = db.getSync('productions', []);

    // Créer un tableau avec TOUTES les productions et leur statut
    const tableauComplet = productions.map(production => {
        // Chercher si cette production a été évaluée pour cet étudiant
        // PRIORISER l'évaluation active (sans remplaceeParId) si elle existe
        const evaluationsProduction = evaluations.filter(e => e.productionId === production.id);
        let evaluation = null;

        if (evaluationsProduction.length > 0) {
            // PRIORITÉ 1 : Chercher une évaluation de reprise active (repriseDeId ET non remplacée)
            // C'est l'évaluation qui doit afficher l'étoile ⭐ violette
            evaluation = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);

            // PRIORITÉ 2 : Si pas de reprise, chercher une évaluation avec jeton de délai actif
            // C'est l'évaluation qui doit afficher l'étoile ⭐ orange
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => e.jetonDelaiApplique && !e.remplaceeParId);
            }

            // PRIORITÉ 3 : Si pas de jeton, chercher toute évaluation active (non remplacée)
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => !e.remplaceeParId);
            }

            // PRIORITÉ 4 : Si toutes sont remplacées, prendre la première (cas rare)
            if (!evaluation) {
                evaluation = evaluationsProduction[0];
            }
        }

        return {
            production: production,
            evaluation: evaluation
        };
    });

    // Générer le tableau HTML
    const tableauHTML = `
        <table class="tableau u-mt-15">
            <thead>
                <tr>
                    <th>Production</th>
                    <th>Grille</th>
                    <th>Cartouche</th>
                    <th>Note</th>
                    <th>Date</th>
                    <th>Actions</th>
                    <th class="eval-width-60" title="Verrouillage">🔒/🔓</th>
                </tr>
            </thead>
            <tbody>
                ${tableauComplet.map(item => {
        if (item.evaluation) {
            // Production évaluée
            const estRemplacee = item.evaluation.remplaceeParId ? true : false;
            const estReprise = item.evaluation.repriseDeId ? true : false;

            // Formater la note combinée
                                const noteLettre = item.evaluation.niveauFinal || '--';
                                const notePourcent = item.evaluation.noteFinale !== null ? Math.round(item.evaluation.noteFinale) : 0;
                                const noteAffichage = noteLettre !== '--' ? `${noteLettre} (${notePourcent}%)` : `-- (${notePourcent}%)`;

                                return `
                            <tr ${estRemplacee ? 'class="eval-desactive"' : ''}>
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
                                <td>${echapperHtml(item.evaluation.grilleNom || '—')}</td>
                                <td>${echapperHtml(obtenirNomCartouche(item.evaluation.cartoucheId, item.evaluation.grilleId) || '—')}</td>
                                <td>
                                    <span ${obtenirClasseNote(item.evaluation.niveauFinal, item.evaluation.echelleId)}>
                                        ${noteAffichage}
                                    </span>
                                    ${estRemplacee ? '<span class="badge-statut eval-ml-6">Remplacée</span>' : ''}
                                    ${estReprise ? '<span style="color: #9c27b0; font-size: 1.2rem; margin-left: 6px;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                    ${item.evaluation.jetonDelaiApplique ? '<span style="color: #ff6f00; font-size: 1.2rem; margin-left: 6px;" title="Jeton de délai appliqué">⭐</span>' : ''}
                                </td>
                                <td>${item.evaluation.dateEvaluation ? new Date(item.evaluation.dateEvaluation).toLocaleDateString('fr-CA') : '—'}</td>
                                <td>
                                    ${estRemplacee ? `
                                        <button class="btn btn-modifier btn-compact" onclick="modifierEvaluation('${item.evaluation.id}')">
                                            Consulter
                                        </button>
                                    ` : `
                                        <button class="btn btn-modifier btn-compact" onclick="modifierEvaluation('${item.evaluation.id}')">
                                            Consulter
                                        </button>
                                        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluation('${item.evaluation.id}')" ${item.evaluation.verrouillee ? 'disabled title="Déverrouillez d\'abord pour supprimer"' : ''}>
                                            Supprimer
                                        </button>
                                    `}
                                </td>
                                <td class="u-text-center">
                                    ${estRemplacee ? '' : `
                                        <span id="cadenas-${item.evaluation.id}"
                                              onclick="basculerVerrouillageEvaluation('${item.evaluation.id}')"
                                              style="font-size: 1.2rem; cursor: pointer; user-select: none;"
                                              title="${item.evaluation.verrouillee ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller'}">
                                            ${item.evaluation.verrouillee ? '🔒' : '🔓'}
                                        </span>
                                    `}
                                </td>
                            </tr>
                        `;
        } else {
            // Production non évaluée
            return `
                            <tr class="u-opacity-07">
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
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
                                <td>—</td>
                            </tr>
                        `;
        }
    }).join('')}
            </tbody>
        </table>
    `;

    // Ajouter le résumé
    const nbAttendus = productions.filter(p => p.type !== 'portfolio').length;

    // Compter les artefacts distincts actifs (exclure remplacées)
    const evaluationsActives = evaluations.filter(e => !e.remplaceeParId);
    const productionsDistinctes = new Set(evaluationsActives.map(e => e.productionId));
    const nbRemis = productionsDistinctes.size;

    // Lire les indices depuis la source unique (portfolio.js)
    const indicesCP = db.getSync('indicesCP', {});
    const indicesCPEtudiant = indicesCP[etudiant.da]?.actuel || null;

    // 🔍 DÉTERMINER LA PRATIQUE ACTIVE (SOM ou PAN)
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

    // Lire C et P depuis la branche appropriée
    const brancheActive = indicesCPEtudiant?.[pratique];
    const tauxCompletion = brancheActive?.C ?? (nbAttendus > 0 ? Math.round((nbRemis / nbAttendus) * 100) : 0);

    // Calcul de la performance moyenne avec fallback
    let performanceMoyenne = 0;
    if (brancheActive && typeof brancheActive.P === 'number' && !isNaN(brancheActive.P)) {
        performanceMoyenne = Math.round(brancheActive.P);
    } else if (evaluationsActives.length > 0) {
        // Fallback : calculer la moyenne des notes des évaluations actives
        const sommeNotes = evaluationsActives.reduce((sum, e) => sum + (e.noteFinale || 0), 0);
        performanceMoyenne = Math.round(sommeNotes / evaluationsActives.length);
    }

    const nbRemplacees = evaluations.filter(e => e.remplaceeParId).length;
    const nbReprises = evaluations.filter(e => e.repriseDeId).length;
    const nbDelais = evaluations.filter(e => e.jetonDelaiApplique && !e.remplaceeParId).length;

    const resumeHTML = `
        <div class="carte" style="margin-top: 15px; background: var(--bleu-pale);">
            <h4 style="margin-bottom: 10px;">Résumé de l'étudiant</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <strong>Artefacts remis:</strong> ${nbRemis} / ${nbAttendus}
                </div>
                <div>
                    <strong>Performance moyenne:</strong> ${performanceMoyenne}%
                </div>
                <div>
                    <strong>Tendance:</strong> ${obtenirTendance(evaluationsActives)}
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
        const productions = db.getSync('productions', []);
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
 * OBSOLETE: Cette fonction est maintenant gérée par liste-evaluations.js
 * Ne pas redéfinir ici pour éviter d'écraser la fonction moderne
 */
// function reinitialiserFiltresEval() {
//     // FONCTION OBSOLÈTE - Voir liste-evaluations.js ligne 377
//     // La fonction moderne reinitialiserFiltres() est exportée comme window.reinitialiserFiltresEval
// }

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

        case 'assiduite-asc':
            donneesTries.sort((a, b) => a.indices.assiduite - b.indices.assiduite);
            break;

        case 'assiduite-desc':
            donneesTries.sort((a, b) => b.indices.assiduite - a.indices.assiduite);
            break;

        case 'completion-asc':
            donneesTries.sort((a, b) => a.indices.completion - b.indices.completion);
            break;

        case 'completion-desc':
            donneesTries.sort((a, b) => b.indices.completion - a.indices.completion);
            break;

        case 'performance-asc':
            donneesTries.sort((a, b) => a.indices.performance - b.indices.performance);
            break;

        case 'performance-desc':
            donneesTries.sort((a, b) => b.indices.performance - a.indices.performance);
            break;

        case 'risque-asc':
            donneesTries.sort((a, b) => a.indices.risque - b.indices.risque);
            break;

        case 'risque-desc':
            donneesTries.sort((a, b) => b.indices.risque - a.indices.risque);
            break;
    }

    // Debug - voir après le tri
    console.log('Après tri:', donneesTries.map(e => e.nom).slice(0, 5));

    // IMPORTANT : Mettre à jour la variable globale
    donneesEvaluationsFiltrees = donneesTries;

    // Réafficher avec les données triées
    afficherListeEvaluations(donneesTries);

    // Sauvegarder la préférence
    db.setSync('preferenceTriEvaluations', critere);
}

/**
 * Restaure la préférence de tri sauvegardée
 */
function restaurerPreferenceTri() {
    const preference = db.getSync('preferenceTriEvaluations', null);
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
    const preference = db.getSync('preferenceTriEvaluations', null);
    if (preference) {
        const selectTri = document.getElementById('tri-evaluations');
        if (selectTri) {
            selectTri.value = preference;
            trierListeEvaluations();
        }
    }
}

/* ===============================
   STATISTIQUES
   =============================== */

/**
 * Met à jour les statistiques globales
 */
function mettreAJourStatistiquesEvaluations() {
    const etudiants = donneesEvaluationsFiltrees;
    const nbEtudiants = etudiants.length;
    const etudiantsEvalues = etudiants.filter(e => e.evaluations.length > 0).length;

    // 🎯 Calculer le total d'artefacts DONNÉS (même logique que portfolio.js)
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const productions = db.getSync('productions', []);

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
   FONCTIONS UTILITAIRES
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
// DÉSACTIVÉ : Cette fonction est maintenant gérée par liste-evaluations.js (vue tableau)
// function initialiserListeEvaluations() {
//     console.log('Initialisation de la liste des évaluations');
//
//     const sousSection = document.getElementById('evaluations-liste');
//     if (!sousSection) {
//         console.log('⚠️ Sous-section liste évaluations non trouvée');
//         return;
//     }
//
//     // Charger la liste refaite
//     chargerListeEvaluationsRefonte();
//
//     console.log('✅ Liste des évaluations initialisée');
// }

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

    db.setSync('dernieresSelectionsEvaluation', selections);
    console.log('✅ Sélections mémorisées');
}

/**
 * Sauvegarde les sélections actuelles pour les restaurer lors de la navigation
 * Appelée avant de changer d'étudiant (Précédent/Suivant)
 */
function sauvegarderSelectionsEvaluation() {
    const selectProduction = document.getElementById('selectProduction1');
    const selectGrille = document.getElementById('selectGrille1');
    const selectEchelle = document.getElementById('selectEchelle1');
    const selectCartouche = document.getElementById('selectCartoucheEval');
    const selectRemise = document.getElementById('remiseProduction1');

    const selections = {
        production: selectProduction?.value || '',
        grille: selectGrille?.value || '',
        echelle: selectEchelle?.value || '',
        cartouche: selectCartouche?.value || '',
        remise: selectRemise?.value || '',
        afficherDescription: document.getElementById('afficherDescription1')?.checked ?? true,
        afficherObjectif: document.getElementById('afficherObjectif1')?.checked ?? true,
        afficherTache: document.getElementById('afficherTache1')?.checked ?? true,
        afficherAdresse: document.getElementById('afficherAdresse1')?.checked ?? true,
        afficherContexte: document.getElementById('afficherContexte1')?.checked ?? true
    };

    db.setSync('dernieresSelectionsEvaluation', JSON.stringify(selections));
    console.log('💾 Sélections sauvegardées:', selections);
}

/**
 * Restaure les dernières sélections utilisées
 * Appelée lors du passage à un nouvel étudiant
 */
function restaurerSelectionsEvaluation() {
    const selectionsJson = db.getSync('dernieresSelectionsEvaluation', null);
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
        console.log('Pas d\'étudiant ou de production sélectionné, skip');
        return;
    }

    // Chercher une évaluation existante
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const evaluationExistante = evaluations.find(e =>
        e.etudiantDA === etudiantDA &&
        e.productionId === productionId &&
        !e.remplaceeParId // Exclure les évaluations remplacées par un jeton
    );

    if (!evaluationExistante) {
        console.log('Aucune évaluation existante pour cet étudiant et cette production');

        // Masquer l'indicateur de verrouillage et réactiver le formulaire
        afficherOuMasquerBoutonVerrouillage(false);
        desactiverFormulaireEvaluation(false);

        // Réinitialiser l'ID de modification si présent
        if (window.evaluationEnCours?.idModification) {
            delete window.evaluationEnCours.idModification;
        }

        // Masquer les badges de jetons
        const section = document.getElementById('gestionJetonsEvaluation');
        if (section) section.style.display = 'none';

        return;
    }

    console.log('📂 Évaluation existante trouvée, chargement des données...', evaluationExistante);

    // Charger la cartouche (si elle existe)
    if (evaluationExistante.cartoucheId) {
        const selectCartouche = document.getElementById('selectCartoucheEval');
        if (selectCartouche) {
            selectCartouche.value = evaluationExistante.cartoucheId;
        }
    }

    // Charger le statut de remise
    if (evaluationExistante.statutRemise) {
        const selectRemise = document.getElementById('remiseProduction1');
        if (selectRemise) {
            selectRemise.value = evaluationExistante.statutRemise;
        }
    }

    // Charger l'échelle (si elle existe)
    if (evaluationExistante.echelleId) {
        const selectEchelle = document.getElementById('selectEchelle1');
        if (selectEchelle) {
            selectEchelle.value = evaluationExistante.echelleId;
        }
    }

    // Déclencher l'affichage des critères maintenant que cartouche et statut sont chargés
    cartoucheSelectionnee();

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
            window.evaluationEnCours.delaiAccorde = evaluationExistante.delaiAccorde || false;
            window.evaluationEnCours.grilleId = evaluationExistante.grilleId;
            window.evaluationEnCours.echelleId = evaluationExistante.echelleId;
            window.evaluationEnCours.cartoucheId = evaluationExistante.cartoucheId;
            window.evaluationEnCours.statutRemise = evaluationExistante.statutRemise;
            window.evaluationEnCours.criteres = {};
            evaluationExistante.criteres.forEach(c => {
                window.evaluationEnCours.criteres[c.critereId] = c.niveauSelectionne;
            });

            // Restaurer les données algorithmiques (français écrit)
            if (evaluationExistante.donneesAlgorithmiques && Object.keys(evaluationExistante.donneesAlgorithmiques).length > 0) {
                console.log('📊 Restauration données algorithmiques');

                // Sauvegarder dans evaluationEnCours
                window.evaluationEnCours.donneesAlgorithmiques = evaluationExistante.donneesAlgorithmiques;

                Object.keys(evaluationExistante.donneesAlgorithmiques).forEach(critereId => {
                    const donnees = evaluationExistante.donneesAlgorithmiques[critereId];

                    // Restaurer le champ des codes (si existant - catégories)
                    if (donnees.codes && Array.isArray(donnees.codes)) {
                        const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                        if (inputCategories) {
                            inputCategories.value = donnees.codes.join(';');
                            console.log(`  ✓ Codes restaurés pour ${critereId}: ${donnees.codes.join(';')}`);
                        }
                    }

                    // Restaurer le champ du nombre de mots
                    if (donnees.mots !== undefined) {
                        const inputMots = document.getElementById(`eval_mots_${critereId}`);
                        if (inputMots) {
                            inputMots.value = donnees.mots;
                            console.log(`  ✓ Mots restaurés pour ${critereId}: ${donnees.mots}`);
                        }
                    }

                    // Restaurer le champ d'erreurs (si mode simple - sans catégorisation)
                    // CORRECTION: Supporter aussi totalErreurs pour compatibilité avec anciennes évaluations
                    const nbErreurs = donnees.erreurs !== undefined ? donnees.erreurs : donnees.totalErreurs;
                    if (nbErreurs !== undefined) {
                        const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
                        if (inputErreurs) {
                            inputErreurs.value = nbErreurs;
                            console.log(`  ✓ Erreurs restaurées pour ${critereId}: ${nbErreurs}`);
                        }
                    }

                    // Déclencher le recalcul pour afficher les résultats
                    setTimeout(() => {
                        const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                        const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);

                        if (inputCategories) {
                            inputCategories.dispatchEvent(new Event('input', { bubbles: true }));
                        } else if (inputErreurs) {
                            inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }, 100);
                });

                console.log(`✅ ${Object.keys(evaluationExistante.donneesAlgorithmiques).length} critères algorithmiques restaurés`);
            }

            // Note: Jetons de délai sont maintenant gérés par les badges cliquables
            // Plus besoin de restaurer une checkbox

            // Afficher l'indicateur de verrouillage si l'évaluation existe
            afficherOuMasquerBoutonVerrouillage(true, evaluationExistante.verrouillee || false);

            // Désactiver le formulaire si l'évaluation est verrouillée
            if (evaluationExistante.verrouillee) {
                desactiverFormulaireEvaluation(true);
            } else {
                desactiverFormulaireEvaluation(false);
            }

            // Afficher les badges des jetons appliqués
            afficherBadgesJetons();
        }

        // Recalculer la note
        setTimeout(() => {
            if (typeof calculerNote === 'function') {
                calculerNote();
                console.log('✅ Note finale recalculée après restauration critères');
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
        // Changer l'étudiant sélectionné
        selectEtudiant.value = options[indexActuel - 1].value;

        // ✅ Charger le nouvel étudiant (préserve production/grille/échelle, réinitialise critères)
        chargerEvaluationsEtudiant();

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
        // Changer l'étudiant sélectionné
        selectEtudiant.value = options[indexActuel + 1].value;

        // ✅ Charger le nouvel étudiant (préserve production/grille/échelle, réinitialise critères)
        chargerEvaluationsEtudiant();

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
    const evaluations = db.getSync('evaluationsSauvegardees', []);
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
        indicateur.style.color = 'var(--bleu-principal)'; // Bleu - En cours (meilleur contraste)
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
        <button class="btn btn-principal btn-compact" onclick="naviguerEtudiantPrecedent()"
                title="Évaluer l'étudiant·e précédent·e"
                style="padding: 6px 10px; min-width: auto; font-size: 0.9rem;">
            ←
        </button>

        <span id="indicateurProgressionEval"
              style="font-weight: 400; color: var(--gris-moyen); padding: 0 10px; display: inline-block; font-size: 0.85rem;">
            0/0 évaluations
        </span>

        <button class="btn btn-principal btn-compact" onclick="naviguerEtudiantSuivant()"
                title="Évaluer l'étudiant·e suivant·e"
                style="padding: 6px 10px; min-width: auto; font-size: 0.9rem;">
            →
        </button>

        <button id="btnVoirProfilDepuisEval" class="btn btn-secondaire btn-compact"
                onclick="ouvrirProfilDepuisEvaluation()"
                style="margin-left: 10px; display: none; padding: 6px 10px; min-width: auto; font-size: 0.85rem;"
                title="Voir le profil de l'étudiant·e">
            👤
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
 * FONCTION DE RÉPARATION : Migre les évaluations avec critères manquants
 * Parcourt toutes les évaluations et extrait les critères depuis la rétroaction si absents
 * ⚠️ À utiliser manuellement en cas de pépin (ne s'active PAS automatiquement)
 */
function reparer_evaluations_criteres_manquants() {
    console.log('Début de la réparation des évaluations...');

    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const grilles = db.getSync('grillesTemplates', []);

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
            console.log(`\nÉvaluation à réparer : ${evaluation.etudiantNom} - ${evaluation.productionNom}`);

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
        db.setSync('evaluationsSauvegardees', evaluations);
        console.log(`\n${nbEvaluationsReparees} évaluation(s) sauvegardée(s)`);
    }

    // Rapport final
    console.log('\nRAPPORT DE RÉPARATION :');
    console.log(`  ✅ Réparées : ${nbEvaluationsReparees}`);
    console.log(`  Ignorées (déjà OK) : ${nbEvaluationsIgnorees}`);
    console.log(`  ❌ Échecs : ${nbEchoues}`);
    console.log('\nDétails :');
    rapport.forEach(ligne => console.log(`  ${ligne}`));

    // Notification utilisateur
    if (nbEvaluationsReparees > 0) {
        alert(`✅ Réparation terminée !\n\n` +
              `• ${nbEvaluationsReparees} évaluation(s) réparée(s)\n` +
              `• ${nbEvaluationsIgnorees} évaluation(s) déjà OK\n` +
              `• ${nbEchoues} échec(s)\n\n` +
              `Consultez la console (F12) pour les détails.`);
    } else {
        alert(`Aucune évaluation à réparer.\n\n` +
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

/**
 * Charge une évaluation existante pour modification
 * Refactorisé le 16 novembre 2025 pour corriger bug timing chargement
 *
 * @param {string} evaluationId - ID de l'évaluation à charger
 */
function modifierEvaluation(evaluationId) {
    console.log('📝 Chargement de l\'évaluation:', evaluationId);

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    console.log('🔍 Évaluation trouvée:', {
        id: evaluation.id,
        etudiant: evaluation.etudiantNom,
        production: evaluation.productionNom,
        nbCriteres: evaluation.criteres?.length || 0
    });

    const estVerrouillee = evaluation.verrouillee || false;

    // Naviguer vers la section d'évaluation
    afficherSousSection('evaluations-individuelles');

    // ========== FONCTIONS HELPER ==========

    /**
     * Attend qu'une option spécifique apparaisse dans un select
     * Utilise un polling actif au lieu de délais fixes
     */
    const attendreOption = (selectId, valeurCherchee, maxTentatives = 20, delai = 100) => {
        return new Promise((resolve, reject) => {
            let tentatives = 0;
            const intervalle = setInterval(() => {
                tentatives++;
                const select = document.getElementById(selectId);
                const optionTrouvee = select ? Array.from(select.options).find(opt => opt.value === valeurCherchee) : null;

                if (optionTrouvee) {
                    clearInterval(intervalle);
                    console.log(`✅ #${selectId} option "${valeurCherchee}" trouvée après ${tentatives} tentatives`);
                    resolve(select);
                } else if (tentatives >= maxTentatives) {
                    clearInterval(intervalle);
                    reject(new Error(`Timeout: option "${valeurCherchee}" introuvable dans #${selectId}`));
                }
            }, delai);
        });
    };

    /**
     * Trouve le numéro de groupe d'un étudiant
     * Cherche d'abord dans les étudiants, puis en fallback dans l'évaluation elle-même
     */
    const trouverGroupeEtudiant = (da) => {
        // Méthode 1: Chercher dans la liste des étudiants
        // NOTE: La clé est 'groupeEtudiants', pas 'etudiants' (cohérence avec reste du code)
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        const etudiant = etudiants.find(e => e.da === da);
        if (etudiant && etudiant.groupe) {
            return etudiant.groupe;
        }

        // Méthode 2 (fallback): Si l'étudiant n'est pas trouvé, chercher le groupe
        // depuis l'évaluation elle-même (peut arriver si mode données différent)
        console.warn(`⚠️ Étudiant DA ${da} non trouvé dans liste étudiants, utilisation fallback`);

        // L'évaluation contient déjà le groupe via etudiantNom qui peut être parsé
        // OU on peut chercher dans d'autres évaluations du même étudiant
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const autreEval = evaluations.find(e => e.etudiantDA === da && e.id !== evaluationId);

        if (autreEval && autreEval.groupe) {
            console.log(`✅ Groupe trouvé via autre évaluation: ${autreEval.groupe}`);
            return autreEval.groupe;
        }

        // Si l'évaluation actuelle contient le groupe, l'utiliser
        if (evaluation.groupe) {
            console.log(`✅ Groupe trouvé dans évaluation actuelle: ${evaluation.groupe}`);
            return evaluation.groupe;
        }

        return null;
    };

    /**
     * Attend que les selects de critères soient générés dans le DOM
     */
    const attendreSelectsCriteres = (evaluation) => {
        return new Promise((resolve, reject) => {
            if (!evaluation.criteres || evaluation.criteres.length === 0) {
                console.warn('⚠️ Aucun critère à charger');
                resolve(false); // Pas de critères, mais pas une erreur
                return;
            }

            let tentatives = 0;
            const maxTentatives = 30; // 3 secondes max
            const premierCritereId = `eval_${evaluation.criteres[0].critereId}`;

            const intervalle = setInterval(() => {
                tentatives++;
                const premierSelect = document.getElementById(premierCritereId);

                if (premierSelect) {
                    clearInterval(intervalle);
                    console.log(`✅ Selects de critères générés après ${tentatives} tentatives`);
                    resolve(true);
                } else if (tentatives >= maxTentatives) {
                    clearInterval(intervalle);
                    console.error('❌ Timeout: selects de critères non générés');
                    console.error('Contenu listeCriteresGrille1:', document.getElementById('listeCriteresGrille1')?.innerHTML.substring(0, 200));
                    reject(new Error('Timeout génération selects critères'));
                }
            }, 100);
        });
    };

    // ========== CHARGEMENT SÉQUENTIEL ==========

    setTimeout(async () => {
        try {
            // ÉTAPE 0: Charger les selects de base (groupes, grilles, échelles)
            console.log('0️⃣ Initialisation des selects de base');
            if (typeof chargerGroupesEval === 'function') {
                chargerGroupesEval();
                console.log('  ✓ Groupes chargés');
            }
            if (typeof chargerGrillesDansSelect === 'function') {
                chargerGrillesDansSelect();
                console.log('  ✓ Grilles chargées');
            }
            if (typeof chargerEchellePerformance === 'function') {
                chargerEchellePerformance();
                console.log('  ✓ Échelles chargées');
            }

            // ÉTAPE 1: Charger le groupe (CRITIQUE - manquait dans l'ancienne version!)
            const numeroGroupe = trouverGroupeEtudiant(evaluation.etudiantDA);
            if (!numeroGroupe) {
                throw new Error(`Groupe introuvable pour étudiant DA ${evaluation.etudiantDA}`);
            }

            console.log(`1️⃣ Chargement groupe: ${numeroGroupe}`);
            const selectGroupe = document.getElementById('selectGroupeEval');
            if (selectGroupe) {
                selectGroupe.value = numeroGroupe;
                selectGroupe.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // ÉTAPE 2: Attendre et charger l'étudiant
            console.log(`2️⃣ Attente option étudiant: ${evaluation.etudiantDA}`);
            await attendreOption('selectEtudiantEval', evaluation.etudiantDA);
            const selectEtudiant = document.getElementById('selectEtudiantEval');
            selectEtudiant.value = evaluation.etudiantDA;
            selectEtudiant.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Étudiant chargé');

            // ÉTAPE 3: Attendre et charger la production
            console.log(`3️⃣ Attente option production: ${evaluation.productionId}`);
            await attendreOption('selectProduction1', evaluation.productionId);
            const selectProduction = document.getElementById('selectProduction1');
            selectProduction.value = evaluation.productionId;
            selectProduction.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Production chargée');

            // ÉTAPE 4: Attendre et charger la grille
            console.log(`4️⃣ Attente option grille: ${evaluation.grilleId}`);
            await attendreOption('selectGrille1', evaluation.grilleId);
            const selectGrille = document.getElementById('selectGrille1');
            selectGrille.value = evaluation.grilleId;
            selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Grille chargée');

            // ÉTAPE 5: Initialiser evaluationEnCours (AVANT cartouche/échelle)
            console.log('5️⃣ Initialisation evaluationEnCours');
            window.evaluationEnCours = {
                etudiantDA: evaluation.etudiantDA,
                productionId: evaluation.productionId,
                grilleId: evaluation.grilleId,
                echelleId: evaluation.echelleId,
                cartoucheId: evaluation.cartoucheId,
                statutRemise: evaluation.statutRemise,
                statutIntegrite: evaluation.statutIntegrite || 'recevable',
                notesIntegrite: evaluation.notesIntegrite || '',
                delaiAccorde: evaluation.delaiAccorde || false,
                jetonDelaiApplique: evaluation.jetonDelaiApplique || false,
                dateApplicationJetonDelai: evaluation.dateApplicationJetonDelai,
                jetonRepriseApplique: evaluation.jetonRepriseApplique || false,
                repriseDeId: evaluation.repriseDeId,
                dateApplicationJetonReprise: evaluation.dateApplicationJetonReprise,
                jetonRepriseCibleeApplique: evaluation.jetonRepriseCibleeApplique || false,
                repriseDeIdCiblee: evaluation.repriseDeIdCiblee,
                critereRepriseCiblee: evaluation.critereRepriseCiblee,
                plafondNoteCiblee: evaluation.plafondNoteCiblee,
                dateApplicationJetonRepriseCiblee: evaluation.dateApplicationJetonRepriseCiblee,
                criteres: {},
                idModification: evaluationId
            };

            // Pré-remplir les critères depuis l'évaluation
            if (evaluation.criteres && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0) {
                evaluation.criteres.forEach(critere => {
                    window.evaluationEnCours.criteres[critere.critereId] = critere.niveauSelectionne;
                });
                console.log(`✅ ${evaluation.criteres.length} critères pré-remplis`);
            } else {
                // FALLBACK : Extraire depuis rétroaction si criteres[] vide
                console.warn('⚠️ Extraction niveaux depuis rétroaction...');
                const grilles = db.getSync('grillesTemplates', []);
                const grille = grilles.find(g => g.id === evaluation.grilleId);

                if (grille && evaluation.retroactionFinale) {
                    const niveauxExtrait = extraireNiveauxDepuisRetroaction(evaluation.retroactionFinale, grille);
                    if (Object.keys(niveauxExtrait).length > 0) {
                        window.evaluationEnCours.criteres = niveauxExtrait;
                        evaluation.criteres = Object.keys(niveauxExtrait).map(critereId => ({
                            critereId,
                            critereNom: grille.criteres.find(c => c.id === critereId)?.nom || critereId,
                            niveauSelectionne: niveauxExtrait[critereId]
                        }));
                        console.log(`✅ ${Object.keys(niveauxExtrait).length} niveaux extraits`);
                    }
                }
            }

            // ÉTAPE 6: Charger échelle
            console.log('6️⃣ Chargement échelle');
            const selectEchelle = document.getElementById('selectEchelle1');
            if (selectEchelle) {
                selectEchelle.value = evaluation.echelleId;
                selectEchelle.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // ÉTAPE 7: Charger cartouche
            console.log('7️⃣ Chargement cartouche');
            const selectCartouche = document.getElementById('selectCartoucheEval');
            if (selectCartouche) {
                selectCartouche.value = evaluation.cartoucheId;
                selectCartouche.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // ÉTAPE 8: Charger statut de remise
            console.log('8️⃣ Chargement statut remise');
            const selectRemise = document.getElementById('remiseProduction1');
            if (selectRemise) {
                selectRemise.value = evaluation.statutRemise;
                selectRemise.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Charger statut d'intégrité académique
            const selectIntegrite = document.getElementById('statutIntegrite');
            const notesIntegrite = document.getElementById('notesIntegrite');
            if (selectIntegrite) {
                selectIntegrite.value = evaluation.statutIntegrite || 'recevable';
                if (notesIntegrite) notesIntegrite.value = evaluation.notesIntegrite || '';
                selectIntegrite.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Note: Jetons de délai sont maintenant gérés par les badges cliquables
            // Plus besoin de charger une checkbox

            // Afficher badges jetons
            afficherBadgesJetons();

            // ÉTAPE 9: Attendre que les selects de critères soient générés
            console.log('9️⃣ Attente génération selects de critères');
            const criteresGeneres = await attendreSelectsCriteres(evaluation);

            // ÉTAPE 10: Charger les valeurs des critères
            if (criteresGeneres && evaluation.criteres && Array.isArray(evaluation.criteres)) {
                console.log('🔟 Chargement des valeurs des critères');
                let criteresCharges = 0;

                evaluation.criteres.forEach(critere => {
                    const selectId = `eval_${critere.critereId}`;
                    const selectCritere = document.getElementById(selectId);

                    if (selectCritere) {
                        selectCritere.value = critere.niveauSelectionne;
                        selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
                        criteresCharges++;
                        console.log(`  ✓ ${critere.critereNom}: ${critere.niveauSelectionne}`);
                    } else {
                        console.warn(`  ⚠️ Select non trouvé pour critère ${critere.critereId}`);
                    }
                });

                console.log(`✅ ${criteresCharges}/${evaluation.criteres.length} critères chargés`);

                // ÉTAPE 10.5: Restaurer les données algorithmiques (français écrit)
                if (evaluation.donneesAlgorithmiques && Object.keys(evaluation.donneesAlgorithmiques).length > 0) {
                    console.log('🔟.5️⃣ Restauration données algorithmiques');

                    Object.keys(evaluation.donneesAlgorithmiques).forEach(critereId => {
                        const donnees = evaluation.donneesAlgorithmiques[critereId];

                        // Restaurer le champ des codes (si existant - catégories)
                        if (donnees.codes && Array.isArray(donnees.codes)) {
                            const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                            if (inputCategories) {
                                inputCategories.value = donnees.codes.join(';');
                                console.log(`  ✓ Codes restaurés pour ${critereId}: ${donnees.codes.join(';')}`);
                            }
                        }

                        // Restaurer le champ du nombre de mots
                        if (donnees.mots !== undefined) {
                            const inputMots = document.getElementById(`eval_mots_${critereId}`);
                            if (inputMots) {
                                inputMots.value = donnees.mots;
                                console.log(`  ✓ Mots restaurés pour ${critereId}: ${donnees.mots}`);
                            }
                        }

                        // Restaurer le champ d'erreurs (si mode simple - sans catégorisation)
                        if (donnees.erreurs !== undefined) {
                            const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
                            if (inputErreurs) {
                                inputErreurs.value = donnees.erreurs;
                                console.log(`  ✓ Erreurs restaurées pour ${critereId}: ${donnees.erreurs}`);
                            }
                        }

                        // Déclencher le recalcul pour afficher les résultats
                        // Attendre que le DOM soit complètement prêt
                        setTimeout(() => {
                            const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                            const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);

                            if (inputCategories) {
                                inputCategories.dispatchEvent(new Event('input', { bubbles: true }));
                            } else if (inputErreurs) {
                                inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }, 100);
                    });

                    console.log(`✅ ${Object.keys(evaluation.donneesAlgorithmiques).length} critères algorithmiques restaurés`);
                }

                // Forcer le recalcul de la note après restauration données algorithmiques
                setTimeout(() => {
                    if (typeof calculerNote === 'function') {
                        calculerNote();
                        console.log('✅ Note finale recalculée après restauration données algorithmiques');
                    }
                }, 200);
            }

            // ÉTAPE 11: Charger les options d'affichage
            console.log('1️⃣1️⃣ Chargement options d\'affichage');
            if (evaluation.optionsAffichage) {
                document.getElementById('afficherDescription1').checked = evaluation.optionsAffichage.description;
                document.getElementById('afficherObjectif1').checked = evaluation.optionsAffichage.objectif;
                document.getElementById('afficherTache1').checked = evaluation.optionsAffichage.tache;
                document.getElementById('afficherAdresse1').checked = evaluation.optionsAffichage.adresse;
                document.getElementById('afficherContexte1').checked = evaluation.optionsAffichage.contexte;
            }

            // ÉTAPE 12: Charger la rétroaction finale
            console.log('1️⃣2️⃣ Chargement rétroaction finale');
            const retroaction = document.getElementById('retroactionFinale1');
            if (retroaction) {
                retroaction.value = evaluation.retroactionFinale || '';
            }

            // ÉTAPE 13: Afficher indicateur de mode modification
            console.log('1️⃣3️⃣ Affichage indicateur modification');
            afficherIndicateurModeModification(evaluation);

            // ÉTAPE 14: Gérer le verrouillage
            console.log('1️⃣4️⃣ Gestion verrouillage');
            afficherOuMasquerBoutonVerrouillage(true, estVerrouillee);
            if (estVerrouillee) {
                desactiverFormulaireEvaluation(true);
                afficherNotificationSucces('Évaluation chargée en lecture seule (verrouillée)');
            } else {
                afficherNotificationSucces('Évaluation chargée - Vous pouvez maintenant la modifier');
            }

            // ÉTAPE 15: Afficher la section de gestion des jetons
            console.log('1️⃣5️⃣ Affichage gestion jetons');
            afficherGestionJetons(true);

            // ÉTAPE 16: Afficher la ligne Supprimer cette évaluation
            console.log('1️⃣6️⃣ Affichage ligne suppression');
            const ligneSupprimer = document.getElementById('ligneSupprimerEvaluation');
            if (ligneSupprimer) {
                ligneSupprimer.style.display = 'flex';
            }

            console.log('✅ Évaluation chargée avec succès');

        } catch (erreur) {
            console.error('❌ Erreur lors du chargement de l\'évaluation:', erreur);
            afficherNotificationErreur(
                'Erreur de chargement',
                `Impossible de charger l'évaluation: ${erreur.message}`
            );
        }
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

    // CORRECTION: Utiliser obtenirDonneesSelonMode au lieu de localStorage direct
    let evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
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

    const etudiants = db.getSync('groupeEtudiants', []);
    const etudiant = etudiants.find(e => e.da === etudiantDA);

    const productions = db.getSync('productions', []);
    const production = productions.find(p => p.id === productionId);

    const grilles = db.getSync('grillesTemplates', []);
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

    // Préserver les propriétés de jetons existantes
    const evaluationExistante = evaluations[indexEval];
    const proprietesJetons = {
        jetonRepriseCibleeApplique: evaluationExistante.jetonRepriseCibleeApplique,
        repriseDeIdCiblee: evaluationExistante.repriseDeIdCiblee,
        critereRepriseCiblee: evaluationExistante.critereRepriseCiblee,
        plafondNoteCiblee: evaluationExistante.plafondNoteCiblee,
        dateApplicationJetonRepriseCiblee: evaluationExistante.dateApplicationJetonRepriseCiblee,
        jetonDelaiApplique: evaluationExistante.jetonDelaiApplique,
        dateEcheanceOriginale: evaluationExistante.dateEcheanceOriginale,
        nombreJoursDelai: evaluationExistante.nombreJoursDelai,
        dateApplicationJetonDelai: evaluationExistante.dateApplicationJetonDelai,
        repriseDeId: evaluationExistante.repriseDeId,
        dateApplicationJetonReprise: evaluationExistante.dateApplicationJetonReprise,
        remplaceeParId: evaluationExistante.remplaceeParId,
        dateRemplacement: evaluationExistante.dateRemplacement,
        archivee: evaluationExistante.archivee,
        dateArchivage: evaluationExistante.dateArchivage
    };

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
        statutIntegrite: document.getElementById('statutIntegrite').value || 'recevable',
        notesIntegrite: document.getElementById('notesIntegrite').value || '',
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
        donneesAlgorithmiques: evaluationEnCours.donneesAlgorithmiques || {}, // Sauvegarder données du français écrit algorithmique
        ...proprietesJetons, // Préserver toutes les propriétés de jetons
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

    // 🔄 Rafraîchir le tableau des évaluations si affiché
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }
}

/**
 * Verrouille une évaluation individuelle (saisie de notes) pour empêcher sa modification
 * @param {string} evaluationId - ID de l'évaluation à verrouiller
 * NOTE: Fonction renommée pour éviter conflit avec verrouillerEvaluation de productions.js
 */
function verrouillerEvaluationIndividuelle(evaluationId) {
    let evaluations = db.getSync('evaluationsSauvegardees', []);
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
 * Déverrouille une évaluation individuelle (saisie de notes) pour permettre sa modification
 * @param {string} evaluationId - ID de l'évaluation à déverrouiller
 * NOTE: Fonction renommée pour cohérence avec verrouillerEvaluationIndividuelle
 */
function deverrouillerEvaluationIndividuelle(evaluationId) {
    let evaluations = db.getSync('evaluationsSauvegardees', []);
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
        <div class="u-flex-1">
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
    let evaluations = db.getSync('evaluationsSauvegardees', []);
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
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    const etudiants = db.getSync('groupeEtudiants', []);
    const productions = db.getSync('productions', []);

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
    const evaluations = db.getSync('evaluationsSauvegardees', []);

    // Récupérer les filtres dropdown
    const filtreGroupe = document.getElementById('filtreBanqueGroupe')?.value || '';
    const filtreEtudiant = document.getElementById('filtreBanqueEtudiant')?.value || '';
    const filtreProduction = document.getElementById('filtreBanqueProduction')?.value || '';
    const tri = document.getElementById('triBanqueEvaluation')?.value || 'date-desc';

    // Récupérer le terme de recherche textuelle
    const recherche = document.getElementById('recherche-banque-evaluations');
    const termeRecherche = recherche ? recherche.value.toLowerCase().trim() : '';

    // Filtrer
    let evaluationsFiltrees = evaluations.filter(evaluation => {
        // Filtres dropdown
        if (filtreGroupe && evaluation.groupe !== filtreGroupe) return false;
        if (filtreEtudiant && evaluation.etudiantDA !== filtreEtudiant) return false;
        if (filtreProduction && evaluation.productionId !== filtreProduction) return false;

        // Filtre de recherche textuelle
        if (termeRecherche) {
            const texteRecherche = [
                evaluation.etudiantNom || '',
                evaluation.etudiantDA || '',
                evaluation.productionNom || '',
                evaluation.grilleNom || '',
                evaluation.groupe || ''
            ].join(' ').toLowerCase();

            if (!texteRecherche.includes(termeRecherche)) return false;
        }

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
        const estDelai = evaluation.jetonDelaiApplique ? true : false;

        return `
            <div class="carte" style="margin-bottom: 15px; ${estRemplacee ? 'opacity: 0.6; border-left: 3px solid #999;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="u-flex-1">
                        <h4 style="margin: 0 0 10px 0;">
                            ${echapperHtml(evaluation.etudiantNom)}
                            ${evaluation.verrouillee ? '<span style="color: #ff9800; margin-left: 8px;">(Verrouillée)</span>' : ''}
                            ${estReprise ? '<span style="color: #9c27b0; margin-left: 8px;" title="Jeton de reprise appliqué">(Reprise)</span>' : ''}
                            ${estDelai ? '<span style="color: #ff6f00; margin-left: 8px;" title="Jeton de délai de remise appliqué">(Délai)</span>' : ''}
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
                            <div style="margin-top: 10px; padding: 8px; background: #f3e5f5; border-radius: 4px; font-size: 0.85rem; color: #7b1fa2; display: flex; justify-content: space-between; align-items: center;">
                                <span>⭐ Jeton de reprise appliqué - Remplace l'évaluation précédente</span>
                                <button onclick="retirerJeton('${evaluation.id}', 'reprise')"
                                        style="background: none; border: none; color: #7b1fa2; cursor: pointer; font-size: 1.2rem; padding: 0 5px; font-weight: bold;"
                                        title="Retirer le jeton de reprise">×</button>
                            </div>
                        ` : ''}
                        ${estDelai ? `
                            <div style="margin-top: 10px; padding: 8px; background: #fff3e0; border-radius: 4px; font-size: 0.85rem; color: #e65100; display: flex; justify-content: space-between; align-items: center;">
                                <span>⭐ Jeton de délai appliqué - Date limite étendue</span>
                                <button onclick="retirerJeton('${evaluation.id}', 'delai')"
                                        style="background: none; border: none; color: #e65100; cursor: pointer; font-size: 1.2rem; padding: 0 5px; font-weight: bold;"
                                        title="Retirer le jeton de délai">×</button>
                            </div>
                        ` : ''}
                    </div>
                    <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <button class="btn btn-modifier btn-compact" onclick="chargerEvaluationDepuisBanque('${evaluation.id}')">
                            Charger
                        </button>
                        <button class="btn btn-special btn-compact" onclick="appliquerJetonRepriseDepuisBanque('${evaluation.id}')"
                                style="background: #9c27b0; color: white;">
                            Jeton de reprise
                        </button>
                        <span onclick="basculerVerrouillageEvaluation('${evaluation.id}')"
                              style="font-size: 1.2rem; cursor: pointer; user-select: none; margin-right: 8px;"
                              title="${evaluation.verrouillee ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller'}">
                            ${evaluation.verrouillee ? '🔒' : '🔓'}
                        </span>
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
 * Applique un jeton de reprise depuis la Banque d'évaluations
 * Crée un duplicata de l'évaluation, marque l'originale comme remplacée,
 * et charge le duplicata pour modification immédiate
 * @param {string} evaluationId - ID de l'évaluation originale
 */
function appliquerJetonRepriseDepuisBanque(evaluationId) {
    // Utiliser le module evaluation-jetons.js pour appliquer le jeton
    if (typeof appliquerJetonReprise !== 'function') {
        afficherNotificationErreur('Erreur', 'Module jetons non disponible');
        return;
    }

    // Appliquer le jeton (archiver l'originale par défaut)
    const nouvelleEvaluation = appliquerJetonReprise(evaluationId, true);

    if (!nouvelleEvaluation) {
        // L'erreur a déjà été affichée par le module
        return;
    }

    // Fermer la banque
    if (typeof fermerBanqueEvaluations === 'function') {
        fermerBanqueEvaluations();
    }

    // Charger le duplicata pour modification immédiate
    setTimeout(() => {
        if (typeof modifierEvaluation === 'function') {
            modifierEvaluation(nouvelleEvaluation.id);
        }
    }, 500);
}

/**
 * Applique un jeton de reprise depuis la sidebar (pendant l'édition)
 * Transforme l'évaluation en cours en reprise de l'évaluation précédente
 */
/**
 * Applique un jeton de délai depuis la sidebar (pendant l'édition)
 */
function appliquerJetonDelaiDepuisSidebar() {
    // Vérifier qu'on est en train de modifier une évaluation
    if (!window.evaluationEnCours || !window.evaluationEnCours.idModification) {
        afficherNotificationErreur('Erreur', 'Vous devez charger une évaluation existante pour appliquer un jeton de délai');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Appliquer le jeton via le module evaluation-jetons.js
    if (typeof appliquerJetonDelai === 'function') {
        const succes = appliquerJetonDelai(evaluationId);
        if (succes) {
            // Masquer le bouton et afficher le badge
            const bouton = document.getElementById('boutonJetonDelai');
            if (bouton) bouton.style.display = 'none';
            afficherBadgesJetons();
        }
    } else {
        console.error('❌ Fonction appliquerJetonDelai non disponible');
        afficherNotificationErreur('Erreur', 'Module jetons non disponible');
    }
}

function appliquerJetonRepriseDepuisSidebar() {
    // Vérifier qu'on est en train de modifier une évaluation
    if (!window.evaluationEnCours || !window.evaluationEnCours.idModification) {
        afficherNotificationErreur('Erreur', 'Vous devez charger une évaluation existante pour appliquer un jeton de reprise');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Demander confirmation
    const confirmation = confirm(
        'Voulez-vous vraiment appliquer un jeton de reprise ?\n\n' +
        'Cela va créer une nouvelle évaluation qui remplacera la précédente.\n' +
        'L\'ancienne évaluation sera archivée et ne comptera plus dans les indices.'
    );

    if (!confirmation) {
        return;
    }

    // Appliquer le jeton en utilisant la fonction existante
    appliquerJetonRepriseDepuisBanque(evaluationId);

    // Le bouton va disparaître car la nouvelle évaluation aura déjà le jeton appliqué
    const bouton = document.getElementById('boutonJetonReprise');
    if (bouton) bouton.style.display = 'none';
}

/**
 * Bascule le verrouillage d'une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function basculerVerrouillageEvaluation(evaluationId) {
    // Utiliser obtenirDonneesSelonMode au lieu de localStorage direct
    let evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
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

    // Mettre à jour le cadenas dans le DOM immédiatement
    const cadenasElement = document.getElementById(`cadenas-${evaluationId}`);
    if (cadenasElement) {
        cadenasElement.textContent = estVerrouillee ? '🔒' : '🔓';
        cadenasElement.title = estVerrouillee ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller';
    }

    // Rafraîchir la liste de la banque (sans reload de page)
    if (typeof filtrerBanqueEvaluations === 'function') {
        filtrerBanqueEvaluations();
    }

    // Rafraîchir le profil étudiant si affiché (sans reload de page)
    if (typeof afficherProfilComplet === 'function' && window.profilActuelDA) {
        setTimeout(() => afficherProfilComplet(window.profilActuelDA), 100);
    }
}

/**
 * Retire un jeton (reprise ou délai) d'une évaluation
 * @param {string} evaluationId - ID de l'évaluation
 * @param {string} typeJeton - Type de jeton à retirer ('reprise' ou 'delai')
 */
function retirerJeton(evaluationId, typeJeton) {
    // Demander confirmation
    const typeTexte = typeJeton === 'reprise' ? 'de reprise' : 'de délai';
    const confirmation = confirm(`Voulez-vous vraiment retirer ce jeton ${typeTexte} ?\n\nCette action est irréversible.`);

    if (!confirmation) {
        return; // Annulation
    }

    let evaluations = db.getSync('evaluationsSauvegardees', []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    const evaluation = evaluations[index];

    if (typeJeton === 'reprise') {
        // Retirer le jeton de reprise
        delete evaluation.jetonRepriseApplique;
        delete evaluation.dateApplicationJetonReprise;
        delete evaluation.repriseDeId;
        afficherNotificationSucces('Jeton de reprise retiré');
    } else if (typeJeton === 'delai') {
        // Retirer le jeton de délai
        delete evaluation.jetonDelaiApplique;
        delete evaluation.dateApplicationJetonDelai;
        delete evaluation.delaiAccorde;
        afficherNotificationSucces('Jeton de délai retiré');
    }

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        afficherNotificationErreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    // Rafraîchir la liste
    filtrerBanqueEvaluations();

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
}

/**
 * Supprime une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function supprimerEvaluationBanque(evaluationId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    let evaluations = db.getSync('evaluationsSauvegardees', []);
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
    let evaluations = db.getSync('evaluationsSauvegardees', []);

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
   SYSTÈME DE VERROUILLAGE
   =============================== */

/**
 * Bascule le verrouillage de l'évaluation courante
 */
function basculerVerrouillageEvaluationCourante() {
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        afficherNotificationErreur('Erreur', 'Aucune évaluation en cours de modification');
        return;
    }

    // Utiliser obtenirDonneesSelonMode au lieu de localStorage direct
    let evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
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

    // Mettre à jour evaluationEnCours pour refléter le changement
    if (window.evaluationEnCours) {
        window.evaluationEnCours.verrouillee = estVerrouillee;
    }

    // Mettre à jour l'icône de verrouillage
    if (typeof mettreAJourBoutonVerrouillage === 'function') {
        mettreAJourBoutonVerrouillage(estVerrouillee);
    }

    // Notification
    const message = estVerrouillee
        ? `Évaluation verrouillée - Modification impossible`
        : `Évaluation déverrouillée - Modification autorisée`;
    afficherNotificationSucces(message);

    // Activer/désactiver tous les champs du formulaire (sans reload)
    if (typeof desactiverFormulaireEvaluation === 'function') {
        desactiverFormulaireEvaluation(estVerrouillee);
    }
}

/**
 * Met à jour l'icône de verrouillage (style productions)
 */
function mettreAJourBoutonVerrouillage(estVerrouillee) {
    const iconeVerrou = document.getElementById('iconeVerrouEval');

    if (!iconeVerrou) return;

    if (estVerrouillee) {
        // Verrouillée : cadenas fermé rouge
        iconeVerrou.textContent = '🔒';
        iconeVerrou.style.color = '#f44336'; // Rouge
        iconeVerrou.title = 'Évaluation verrouillée - Cliquez pour déverrouiller';
    } else {
        // Déverrouillée : cadenas ouvert vert
        iconeVerrou.textContent = '🔓';
        iconeVerrou.style.color = '#4caf50'; // Vert
        iconeVerrou.title = 'Évaluation modifiable - Cliquez pour verrouiller';
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
        'remiseProduction1',
        'statutIntegrite'  // Intégrité académique (recevabilité)
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

    // Désactiver tous les champs algorithmiques (codes d'erreurs, nombre de mots)
    const inputsAlgorithmiques = document.querySelectorAll('#listeCriteresGrille1 input[type="text"], #listeCriteresGrille1 input[type="number"]');
    console.log(`  Trouvé ${inputsAlgorithmiques.length} champs algorithmiques`);
    inputsAlgorithmiques.forEach(input => {
        input.disabled = desactiver;
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

/**
 * Filtre la liste des évaluations selon la recherche
 */
function filtrerListeEvaluations() {
    const recherche = document.getElementById('recherche-liste-evaluations');
    if (!recherche) return;

    const terme = recherche.value.toLowerCase().trim();
    const conteneur = document.getElementById('conteneur-evaluations-accordeon');
    if (!conteneur) return;

    const cartes = conteneur.getElementsByClassName('carte etudiant-evaluation-carte');

    for (let carte of cartes) {
        const da = carte.getAttribute('data-da') || '';
        const nom = carte.textContent.toLowerCase();

        if (terme === '' || da.includes(terme) || nom.includes(terme)) {
            carte.style.display = '';
        } else {
            carte.style.display = 'none';
        }
    }
}

/**
 * Ouvre la banque d'évaluations avec le terme de recherche pré-rempli
 */
function ouvrirBanqueAvecRecherche() {
    // Récupérer le terme de recherche rapide
    const rechercheRapide = document.getElementById('recherche-rapide-evaluation');
    const terme = rechercheRapide ? rechercheRapide.value : '';

    // Ouvrir la banque
    ouvrirBanqueEvaluations();

    // Transférer le terme dans le champ de recherche de la banque
    setTimeout(() => {
        const rechercheBanque = document.getElementById('recherche-banque-evaluations');
        if (rechercheBanque) {
            rechercheBanque.value = terme;
            rechercheBanque.focus();
            // Appliquer le filtre si un terme est présent
            if (terme.trim()) {
                filtrerBanqueEvaluations();
            }
        }
    }, 100);
}

/**
 * Ouvre le profil de l'étudiant depuis le formulaire d'évaluation
 */
function ouvrirProfilDepuisEvaluation() {
    const etudiantDA = document.getElementById('selectEtudiantEval').value;

    if (!etudiantDA) {
        alert('Veuillez sélectionner un·e étudiant·e');
        return;
    }

    // Naviguer vers la section Tableau de bord > Profil
    afficherSection('tableau-bord');

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Afficher la sous-section profil
        if (typeof afficherSousSection === 'function') {
            afficherSousSection('tableau-bord-profil');
        }

        // Attendre un peu puis charger le profil de l'étudiant
        setTimeout(() => {
            if (typeof afficherProfilComplet === 'function') {
                afficherProfilComplet(etudiantDA);

                // Attendre que le profil soit généré, puis scroller vers la section Productions
                setTimeout(() => {
                    const sectionProductions = document.querySelector('#contenuProfilEtudiant h3:contains("Productions")');
                    if (sectionProductions) {
                        sectionProductions.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        // Fallback: chercher par texte
                        const allH3 = document.querySelectorAll('#contenuProfilEtudiant h3');
                        for (let h3 of allH3) {
                            if (h3.textContent.includes('Productions')) {
                                h3.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                break;
                            }
                        }
                    }
                }, 300);
            } else {
                console.error('❌ Fonction afficherProfilComplet non disponible');
            }
        }, 100);
    }, 200);
}

// Exporter les fonctions
// window.filtrerListeEvaluations = filtrerListeEvaluations; // DÉSACTIVÉ : Géré par liste-evaluations.js
window.filtrerBanqueEvaluations = filtrerBanqueEvaluations;
window.ouvrirBanqueAvecRecherche = ouvrirBanqueAvecRecherche;
window.modifierEvaluationParId = modifierEvaluation; // Export sous un nom différent pour éviter conflit avec liste-evaluations.js
window.ouvrirProfilDepuisEvaluation = ouvrirProfilDepuisEvaluation;
// window.gererCheckboxJetonDelai = gererCheckboxJetonDelai; // FIXME: Fonctions non définies dans ce fichier
// window.gererCheckboxJetonReprise = gererCheckboxJetonReprise; // FIXME: Fonctions non définies dans ce fichier

// ============================================
// FONCTIONS POUR JETONS PERSONNALISÉS
// ============================================

/**
 * Affiche les jetons personnalisés disponibles dans le sidebar d'évaluation
 */
function afficherJetonsPersonnalisesEvaluation() {
    const conteneur = document.getElementById('jetonsPersonnalisesOptions');
    if (!conteneur) {
        console.log('⚠️ Conteneur jetonsPersonnalisesOptions non trouvé');
        return;
    }

    // Récupérer les jetons personnalisés depuis la configuration
    const config = db.getSync('modalitesEvaluation', {});
    const jetonsPersonnalises = config.jetons?.typesPersonnalises || [];

    console.log('🎯 Jetons personnalisés configurés:', jetonsPersonnalises.length, jetonsPersonnalises);

    if (jetonsPersonnalises.length === 0) {
        conteneur.innerHTML = '';
        conteneur.style.display = 'none';
        return;
    }

    // Afficher le conteneur
    conteneur.style.display = 'flex';

    // Générer un badge avec checkbox pour chaque jeton personnalisé
    conteneur.innerHTML = jetonsPersonnalises.map(jeton => `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
            <input type="checkbox" id="checkboxJetonPerso_${jeton.id}" class="u-mt-6">
            <div class="u-flex-1">
                <span class="badge-jeton-personnalise-wrapper">
                    <span class="badge-jeton-titre">${echapperHtml(jeton.nom)}</span>
                </span>
                <p class="text-085-muted-m5-0-0-0" style="margin: 4px 0 0 0; font-size: 0.75rem;">
                    ${echapperHtml(jeton.description)}
                </p>
            </div>
        </div>
    `).join('');
}

/**
 * Applique un jeton personnalisé à l'évaluation
 * @param {string} jetonId - ID du jeton à appliquer
 */
function appliquerJetonPersonnalise(jetonId) {
    if (!window.evaluationEnCours?.idModification) {
        afficherNotificationErreur('Erreur', 'Vous devez charger une évaluation existante pour appliquer un jeton');
        return;
    }

    // Récupérer les informations du jeton
    const config = db.getSync('modalitesEvaluation', {});
    const jeton = config.jetons?.typesPersonnalises?.find(j => j.id === jetonId);

    if (!jeton) {
        afficherNotificationErreur('Erreur', 'Jeton personnalisé introuvable');
        return;
    }

    // Confirmer l'application
    if (!confirm(`Voulez-vous appliquer le jeton «${jeton.nom}» à cette évaluation ?\n\n${jeton.description}`)) {
        return;
    }

    // Récupérer l'évaluation
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === window.evaluationEnCours.idModification);

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Ajouter le jeton personnalisé à l'évaluation
    if (!evaluation.jetonsPersonnalises) {
        evaluation.jetonsPersonnalises = [];
    }

    // Vérifier si ce jeton n'est pas déjà appliqué
    if (evaluation.jetonsPersonnalises.some(j => j.id === jetonId)) {
        afficherNotificationErreur('Erreur', 'Ce jeton est déjà appliqué à cette évaluation');
        return;
    }

    evaluation.jetonsPersonnalises.push({
        id: jetonId,
        nom: jeton.nom,
        description: jeton.description,
        dateApplication: new Date().toISOString()
    });

    // Sauvegarder
    db.setSync('evaluationsSauvegardees', evaluations);

    // Rafraîchir l'affichage
    afficherBadgesJetons();
    afficherJetonsPersonnalisesEvaluation();

    afficherNotificationSucces('Succès', `Jeton «${jeton.nom}» appliqué avec succès`);
}

/**
 * Confirme et supprime l'évaluation en cours depuis le sidebar
 */
function confirmerSuppressionEvaluationSidebar() {
    if (!window.evaluationEnCours?.idModification) {
        afficherNotificationErreur('Erreur', 'Aucune évaluation en cours de modification');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Appeler la fonction existante de suppression (qui inclut déjà la confirmation)
    supprimerEvaluation(evaluationId);

    // Si la suppression réussit, réinitialiser le formulaire
    setTimeout(() => {
        const evaluations = db.getSync('evaluationsSauvegardees', []);
        const evalExiste = evaluations.find(e => e.id === evaluationId);

        if (!evalExiste) {
            // L'évaluation a été supprimée, réinitialiser le formulaire
            nouvelleEvaluation();
        }
    }, 100);
}

// Écouter les changements de mode pour régénérer la rétroaction avec les noms anonymisés/réels
window.addEventListener('modeChanged', (event) => {
    console.log(`🔄 [evaluation.js] Mode changé détecté, régénération de la rétroaction si nécessaire`);

    // Si une évaluation est en cours et que la checkbox d'adresse est cochée, régénérer la rétroaction
    if (window.evaluationEnCours && document.getElementById('afficherAdresse1')?.checked) {
        console.log(`📝 [evaluation.js] Régénération de la rétroaction avec le nouveau mode: ${event.detail.mode}`);
        genererRetroaction(1);
    }
});

/**
 * Copie du texte en format TSV (Tab-Separated Values)
 * Utilise l'API Clipboard moderne avec le bon MIME type
 */
async function copierEnFormatTSV(texte) {
    try {
        const blob = new Blob([texte], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
            'text/plain': blob
        });
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie TSV:', err);
        return false;
    }
}

/**
 * Copie les 4 premiers critères (SRPN) dans le presse-papiers
 */
async function copierCriteresSRPN() {
    const element = document.getElementById('criteresCopier');
    if (!element || element.textContent === '--') {
        afficherNotificationErreur('Erreur', 'Aucun critère à copier');
        return;
    }

    // Extraire les 4 premiers critères (SRPN) avec tabulations
    const texte = element.textContent.trim();
    const criteres = texte.split('\t');
    const srpn = criteres.slice(0, 4).join('\t');

    console.log('[Debug] Copie SRPN TSV:', { texte, criteres, srpn });

    // Copier en format TSV
    const succes = await copierEnFormatTSV(srpn);
    if (succes) {
        afficherNotificationSucces('Copié', 'SRPN copiés dans le presse-papiers');
    } else {
        afficherNotificationErreur('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

/**
 * Copie les 5 critères (SRPNF) dans le presse-papiers
 */
async function copierCriteresSRPNF() {
    const element = document.getElementById('criteresCopier');
    if (!element || element.textContent === '--') {
        afficherNotificationErreur('Erreur', 'Aucun critère à copier');
        return;
    }

    // Copier tous les critères avec tabulations
    const texte = element.textContent.trim();

    console.log('[Debug] Copie SRPNF TSV:', { texte, length: texte.length });

    // Copier en format TSV
    const succes = await copierEnFormatTSV(texte);
    if (succes) {
        afficherNotificationSucces('Copié', 'SRPNF copiés dans le presse-papiers');
    } else {
        afficherNotificationErreur('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

// Exporter les fonctions
window.afficherJetonsPersonnalisesEvaluation = afficherJetonsPersonnalisesEvaluation;
window.appliquerJetonPersonnalise = appliquerJetonPersonnalise;
window.confirmerSuppressionEvaluationSidebar = confirmerSuppressionEvaluationSidebar;
window.reinitialiserFormulaire = reinitialiserFormulaire;
window.calculerNoteAlgorithmiqueAvecCategories = calculerNoteAlgorithmiqueAvecCategories;
window.calculerNoteAlgorithmiqueSimple = calculerNoteAlgorithmiqueSimple;
window.copierCriteresSRPN = copierCriteresSRPN;
window.copierCriteresSRPNF = copierCriteresSRPNF;
window.gererChangementCheckboxJetonRepriseCiblee = gererChangementCheckboxJetonRepriseCiblee;
