/**
 * ============================================
 * MODULE 16 : LISTE DES ÉVALUATIONS
 * ============================================
 * Gestion de l'affichage et filtrage des évaluations
 */

(function() {
'use strict';


// ============================================
// FONCTION UTILITAIRE
// ============================================

/**
 * Calcule le statut workflow d'une ligne d'évaluation.
 * Hiérarchie : non-recu → recu → importe → annote → evalue
 * @param {Object} ligne - La ligne d'évaluation
 * @returns {string} Le statut workflow
 */
function calculerStatutWorkflow(ligne) {
    // Si évalué (ou remplacée/non-recevable)
    if (ligne.statut === 'evalue' || ligne.statut === 'remplacee' || ligne.statut === 'non-recevable') return 'evalue';

    // Vérifier si un fichier importé existe et s'il a des annotations
    if (typeof travauxStockage !== 'undefined' && typeof travauxStockage.obtenirFichiersTravaux === 'function') {
        // Résolution centralisée : évaluation → fichier par clé composite (DA, productionId)
        let fichier = (typeof travauxResolution !== 'undefined')
            ? travauxResolution.trouverFichierPourEvaluation({ etudiantDA: ligne.da, productionId: ligne.productionId })
            : null;

        // Soft-match : si pas de fichier trouvé, chercher un fichier non-associé unique
        if (!fichier) {
            const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
            const productions = obtenirDonneesSelonMode('productions');
            const productionIdsConnus = new Set(productions.map(p => p.id));
            const fichiersNonAssocies = fichiers.filter(f =>
                f.etudiantDA === ligne.da && (!f.productionId || !productionIdsConnus.has(f.productionId))
            );
            if (fichiersNonAssocies.length === 1) {
                fichier = fichiersNonAssocies[0];
                ligne.associationManquante = true;
            }
        }

        if (fichier) {
            const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
            if (annotation && typeof annotationContientDuContenu === 'function' && annotationContientDuContenu(annotation)) {
                return 'annote';
            }
            return 'importe';
        }

        // Signaler qu'un fichier existe sur une autre production
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const fichierAutreProduction = fichiers.find(f =>
            f.etudiantDA === ligne.da && f.productionId && f.productionId !== ligne.productionId
        );
        if (fichierAutreProduction) {
            ligne.fichierAutreProduction = true;
        }
    }

    // Statut remise manuelle "recu"
    if (ligne.statutRemise === 'recu') return 'recu';

    return 'non-recu';
}

/**
 * Obtient le libellé français du statut workflow
 * @param {string} statut - Le statut workflow
 * @returns {string} Le libellé
 */
function obtenirLibelleStatut(statut) {
    const libelles = {
        'non-recu': 'Non reçu',
        'recu': 'Reçu',
        'importe': 'Importé',
        'annote': 'Annoté',
        'evalue': 'Évalué'
    };
    return libelles[statut] || statut;
}

/**
 * Obtient l'ordre numérique du statut workflow (pour le tri)
 * @param {string} statut - Le statut workflow
 * @returns {number} L'ordre
 */
function obtenirOrdreStatut(statut) {
    const ordres = { 'non-recu': 0, 'recu': 1, 'importe': 2, 'annote': 3, 'evalue': 4 };
    return ordres[statut] ?? 0;
}

// ============================================
// VARIABLES GLOBALES DE TRI
// ============================================

// État du tri actuel (tri par colonne cliquable)
let triEvaluationsActuel = {
    colonne: 'nom',  // Colonne par défaut: nom (ordre alphabétique)
    ordre: 'asc'     // 'asc' ou 'desc'
};

// ============================================
// INITIALISATION
// ============================================


// ============================================
// 🆕 CALCUL DE L'INDICE C (COMPLÉTION)
// ============================================

/**
 * Fonction orchestratrice : Calcule et sauvegarde les deux indices de complétion
 * Appelée après chaque modification d'évaluation
 * 
 * ARCHITECTURE: Identique à calculerEtSauvegarderIndicesAssiduite() dans saisie-presences.js
 */
function calculerEtSauvegarderIndiceCompletion() {

    const etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    
    // Structure de sortie
    const indices = {
        sommatif: {},
        alternatif: {},
        dateCalcul: new Date().toISOString()
    };
    
    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));
    
    // Calculer pour chaque étudiant
    etudiantsActifs.forEach(etudiant => {
        indices.sommatif[etudiant.da] = calculerCompletionSommative(etudiant.da);
        indices.alternatif[etudiant.da] = calculerCompletionAlternative(etudiant.da);
    });
    
    // SUPPRIMÉ (Tier 6.2, 3 avril 2026) : écriture dans cle('indicesEvaluation')
    // La clé n'est lue par aucun module. Les indices C et P canoniques sont dans
    // cle('indicesCP') (calculés par portfolio.js).

    return indices;
}

/**
 * Calcule la complétion SOMMATIVE (depuis le début du trimestre)
 * Formule : Artefacts remis ÷ Total artefacts attendus
 * 
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {number} - Indice entre 0 et 1
 */
function calculerCompletionSommative(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    // ✅ CORRECTION (29 déc 2025): Utiliser obtenirDonneesSelonMode() pour namespace
    const productions = obtenirDonneesSelonMode('productions') || [];
    
    // Productions à évaluer (exclure portfolio)
    const productionsAEvaluer = productions.filter(p => p.type !== 'portfolio');
    const totalAttendus = productionsAEvaluer.length;
    
    if (totalAttendus === 0) {
        console.warn('⚠️ Aucune production configurée');
        return 0;
    }
    
    // Compter les productions distinctes remises (exclure remplacées)
    const evalsEtudiant = evaluations.filter(e => e.etudiantDA === da && !e.remplaceeParId);
    const productionsDistinctes = new Set(evalsEtudiant.map(e => e.productionId));
    const nbRemis = productionsDistinctes.size;
    
    const indice = nbRemis / totalAttendus;
    
    
    return Math.min(indice, 1);
}

/**
 * Calcule la complétion ALTERNATIVE (sur les N meilleurs artefacts)
 * Formule : Nombre de meilleurs artefacts remis ÷ N
 * 
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {number} - Indice entre 0 et 1
 */
function calculerCompletionAlternative(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const config = db.getSync('modalitesEvaluation', {});
    
    // Obtenir le nombre d'artefacts depuis les réglages
    const nombreArtefacts = config.configPAN?.nombreArtefacts || 3;
    
    
    // Récupérer les évaluations de cet étudiant
    const evalsEtudiant = evaluations.filter(e => e.etudiantDA === da);
    
    if (evalsEtudiant.length === 0) {
        return 0;
    }
    
    // Trier par note décroissante et prendre les N meilleurs
    const meilleurs = evalsEtudiant
        .filter(e => e.noteFinale !== null && e.noteFinale !== undefined)
        .sort((a, b) => (b.noteFinale || 0) - (a.noteFinale || 0))
        .slice(0, nombreArtefacts);
    
    const indice = meilleurs.length / nombreArtefacts;
    
    
    return Math.min(indice, 1);
}

/**
 * Initialise la page Liste des évaluations
 */
function initialiserListeEvaluations() {

    try {
        // 🆕 Calculer les indices de complétion
        calculerEtSauvegarderIndiceCompletion();

        // Charger et afficher les données
        chargerDonneesEvaluations();

        // Initialiser les événements des filtres
        initialiserEvenementsFilres();

        // Initialiser le bouton de réinitialisation
        const btnReinit = document.getElementById('btn-reinitialiser-filtres');
        if (btnReinit) {
            btnReinit.addEventListener('click', reinitialiserFiltres);
        }

        // Revérifier le débordement au redimensionnement
        window.removeEventListener('resize', verifierDebordementTableau);
        window.addEventListener('resize', verifierDebordementTableau);

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la liste des évaluations:', error);
        console.error('Stack trace:', error.stack);

        // Afficher un message d'erreur à l'utilisateur
        const conteneur = document.getElementById('zone-chargement-evaluations');
        if (conteneur) {
            conteneur.innerHTML = `
                <p style="color: var(--rouge-erreur);">
                    <strong>Erreur de chargement</strong><br>
                    ${error.message}<br>
                    <small>Consultez la console pour plus de détails.</small>
                </p>
            `;
        }
    }
}

/**
 * Charge toutes les données nécessaires et affiche le tableau
 */
function chargerDonneesEvaluations() {
    // Charger les données selon le mode actif (géré automatiquement par le module 17)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    // ✅ CORRECTION (22 fév 2026): Utiliser obtenirEtudiantsCoursActif() qui filtre par groupe-cours
    // obtenirDonneesSelonMode('groupeEtudiants') ne filtre que par coursId, pas par groupe
    const etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants') || [];
    // ✅ CORRECTION (29 déc 2025): Utiliser obtenirDonneesSelonMode() pour namespace
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Extraire les groupes uniques depuis les étudiants
    const groupes = etudiants.length > 0
        ? [...new Set(etudiants.map(e => e.groupe))].sort().map(g => ({ numero: g }))
        : [];

    const infoCours = db.getSync('infoCours', null);

    // Générer les options des filtres
    genererOptionsFiltres(groupes, productions);

    // Restaurer l'état des filtres sauvegardés
    restaurerEtatFiltres();

    // Afficher le tableau
    afficherTableauEvaluations(evaluations, productions, etudiants);
}

// ============================================
// GÉNÉRATION DES FILTRES
// ============================================

/**
 * Génère les options des filtres dynamiquement
 */
function genererOptionsFiltres(groupes, productions) {
    // Filtre Production
    const selectProduction = document.getElementById('filtre-production-eval');
    if (selectProduction) {
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>';
        productions.forEach(prod => {
            if (prod.type !== 'portfolio') { // Exclure le portfolio lui-même
                const option = document.createElement('option');
                option.value = prod.id;
                option.textContent = prod.titre;
                selectProduction.appendChild(option);
            }
        });
    }

    // Filtre Note (selon la pratique de notation)
    const selectNote = document.getElementById('filtre-note-eval');
    const pratiqueIdFiltres = typeof obtenirPratiqueActiveGroupeCours === 'function'
        ? obtenirPratiqueActiveGroupeCours()
        : (typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : 'sommative');
    const estPANFiltres = pratiqueIdFiltres === 'pan-standards' || pratiqueIdFiltres === 'pan-maitrise';

    if (selectNote) {
        selectNote.innerHTML = '<option value="">Toutes les notes</option>';

        if (estPANFiltres) {
            // Système IDME
            ['I', 'D', 'M', 'E'].forEach(niveau => {
                const option = document.createElement('option');
                option.value = niveau;
                option.textContent = niveau;
                selectNote.appendChild(option);
            });
        } else {
            // Système traditionnel (%)
            const tranches = [
                { label: '0-59%', min: 0, max: 59 },
                { label: '60-69%', min: 60, max: 69 },
                { label: '70-79%', min: 70, max: 79 },
                { label: '80-89%', min: 80, max: 89 },
                { label: '90-100%', min: 90, max: 100 }
            ];
            tranches.forEach(tranche => {
                const option = document.createElement('option');
                option.value = `${tranche.min}-${tranche.max}`;
                option.textContent = tranche.label;
                selectNote.appendChild(option);
            });
        }
    }
}

/**
 * Recharge uniquement le filtre de production
 * Appelée après création/modification/suppression d'une production
 */
function rechargerFiltreProduction() {
    // ✅ CORRECTION (29 déc 2025): Utiliser obtenirDonneesSelonMode() pour namespace
    const productions = obtenirDonneesSelonMode('productions') || [];
    const selectProduction = document.getElementById('filtre-production-eval');

    if (!selectProduction) return;

    // Sauvegarder la valeur actuellement sélectionnée
    const valeurActuelle = selectProduction.value;

    // Recharger les options
    selectProduction.innerHTML = '<option value="">Toutes les productions</option>';
    productions.forEach(prod => {
        if (prod.type !== 'portfolio') { // Exclure le portfolio lui-même
            const option = document.createElement('option');
            option.value = prod.id;
            option.textContent = prod.titre;
            selectProduction.appendChild(option);
        }
    });

    // Restaurer la sélection si elle existe toujours
    if (valeurActuelle && productions.some(p => p.id === valeurActuelle)) {
        selectProduction.value = valeurActuelle;
    }
}

// ============================================
// PERSISTANCE DES FILTRES
// ============================================

/**
 * Sauvegarde l'état actuel des filtres dans localStorage
 */
function sauvegarderEtatFiltres() {
    const etatFiltres = {
        groupe: document.getElementById('filtre-groupe-eval')?.value || '',
        production: document.getElementById('filtre-production-eval')?.value || '',
        statut: document.getElementById('filtre-statut-eval')?.value || '',
        note: document.getElementById('filtre-note-eval')?.value || '',
        tri: document.getElementById('tri-evaluations')?.value || 'nom-asc'
    };

    db.setSync('filtresListeEvaluations', etatFiltres);
}

/**
 * Restaure l'état des filtres depuis localStorage
 */
function restaurerEtatFiltres() {
    const etatSauvegarde = db.getSync('filtresListeEvaluations', null);

    if (!etatSauvegarde) {
        return;
    }

    try {
        // db.getSync retourne déjà un objet JavaScript, pas besoin de JSON.parse
        const etat = etatSauvegarde;

        // Restaurer chaque filtre (attendre que les éléments soient disponibles)
        setTimeout(() => {
            const filtreGroupe = document.getElementById('filtre-groupe-eval');
            const filtreProduction = document.getElementById('filtre-production-eval');
            const filtreStatut = document.getElementById('filtre-statut-eval');
            const filtreNote = document.getElementById('filtre-note-eval');
            const tri = document.getElementById('tri-evaluations');

            if (filtreGroupe && etat.groupe) filtreGroupe.value = etat.groupe;
            if (filtreProduction && etat.production) filtreProduction.value = etat.production;
            if (filtreStatut && etat.statut) filtreStatut.value = etat.statut;
            if (filtreNote && etat.note) filtreNote.value = etat.note;
            if (tri && etat.tri) tri.value = etat.tri;


            // Appliquer les filtres après restauration
            appliquerFiltres();
        }, 100);
    } catch (error) {
        console.error('❌ Erreur lors de la restauration des filtres:', error);
    }
}

/**
 * Initialise les événements des filtres
 */
function initialiserEvenementsFilres() {
    const filtres = [
        'filtre-groupe-eval',
        'filtre-production-eval',
        'filtre-statut-eval',
        'filtre-note-eval',
        'tri-evaluations'
    ];

    filtres.forEach(filtreId => {
        const filtre = document.getElementById(filtreId);
        if (filtre) {
            filtre.addEventListener('change', () => {
                sauvegarderEtatFiltres(); // Sauvegarder après chaque changement
                appliquerFiltres();
            });
        }
    });
}

/**
 * Réinitialise tous les filtres
 */
function reinitialiserFiltres() {
    const filtreGroupe = document.getElementById('filtre-groupe-eval');
    const filtreProduction = document.getElementById('filtre-production-eval');
    const filtreStatut = document.getElementById('filtre-statut-eval');
    const filtreNote = document.getElementById('filtre-note-eval');
    const tri = document.getElementById('tri-evaluations');
    const recherche = document.getElementById('recherche-evaluations');

    if (filtreGroupe) filtreGroupe.value = '';
    if (filtreProduction) filtreProduction.value = '';
    if (filtreStatut) filtreStatut.value = '';
    if (filtreNote) filtreNote.value = '';
    if (tri) tri.value = 'nom-asc';
    if (recherche) recherche.value = '';

    // Supprimer l'état sauvegardé dans localStorage
    db.removeSync('filtresListeEvaluations');

    appliquerFiltres();
}

// ============================================
// AFFICHAGE DU TABLEAU
// ============================================

/**
 * Affiche le tableau des évaluations avec filtrage
 */
function afficherTableauEvaluations(evaluations, productions, etudiants) {

    const corpsTableau = document.getElementById('corps-tableau-evaluations');
    const zoneChargement = document.getElementById('zone-chargement-evaluations');
    const conteneurTableau = document.getElementById('conteneur-tableau-evaluations');
    const messageAucunResultat = document.getElementById('message-aucun-resultat');
    const compteur = document.getElementById('compteur-evaluations');

    if (!corpsTableau) {
        console.error('❌ Élément #corps-tableau-evaluations introuvable');
        return;
    }

    // Masquer le chargement
    if (zoneChargement) {
        zoneChargement.classList.add('u-hide');
    }

    // Construire la liste complète : évaluations existantes + non évaluées
    const lignes = construireLignesEvaluations(evaluations, productions, etudiants);

    // Appliquer les filtres
    let lignesFiltrees = appliquerFiltresSurLignes(lignes);

    // Appliquer la recherche par mot-clé
    lignesFiltrees = appliquerRechercheTexte(lignesFiltrees);

    // Appliquer le tri par colonne cliquable
    lignesFiltrees = trierLignesParColonne(lignesFiltrees);

    // Mettre à jour les indicateurs de tri visuels
    mettreAJourIndicateursTri();

    // Afficher les résultats
    if (lignesFiltrees.length === 0) {
        conteneurTableau.classList.add('u-hide');
        if (messageAucunResultat) messageAucunResultat.classList.remove('u-hide');
        if (compteur) compteur.textContent = '0 évaluation(s)';
    } else {
        if (messageAucunResultat) messageAucunResultat.classList.add('u-hide');
        conteneurTableau.classList.remove('u-hide');

        // Calculer les statistiques
        // IMPORTANT : Exclure les non-recevables ET les non remis de la moyenne
        const evaluationsRecevables = lignesFiltrees.filter(ligne =>
            ligne.statut === 'evalue' && ligne.noteChiffree !== null && ligne.statutIntegrite !== 'plagiat' && ligne.statutIntegrite !== 'ia'
        );

        let moyenneAffichee = null;
        if (evaluationsRecevables.length > 0) {
            const somme = evaluationsRecevables.reduce((acc, ligne) => acc + ligne.noteChiffree, 0);
            moyenneAffichee = somme / evaluationsRecevables.length;
        }

        // Compter les productions uniques affichées
        const productionsUniques = [...new Set(lignesFiltrees.map(l => l.productionId))];
        const nbProductions = productionsUniques.length;

        // Mettre à jour les statistiques en haut
        if (compteur) {
            const nbTotal = lignesFiltrees.length;

            // Adapter le texte selon le filtre de statut
            const filtreStatut = document.getElementById('filtre-statut-eval')?.value;
            if (filtreStatut === 'non-evalue') {
                compteur.textContent = `${nbTotal} non évalué(s)`;
            } else if (filtreStatut === 'non-remis') {
                compteur.textContent = `${nbTotal} non remis`;
            } else {
                // Compter importés et évalués via statutWorkflow
                const nbImportes = lignesFiltrees.filter(l => l.statutWorkflow === 'importe' || l.statutWorkflow === 'annote').length;
                const nbEvalues = lignesFiltrees.filter(l => l.statutWorkflow === 'evalue').length;
                const details = [];
                if (nbImportes > 0) details.push(`${nbImportes} importé(s)`);
                if (nbEvalues > 0) details.push(`${nbEvalues} évalué(s)`);
                compteur.textContent = details.length > 0
                    ? `${nbTotal} résultat(s) (${details.join(', ')})`
                    : `${nbTotal} résultat(s)`;
            }
        }

        const elemMoyenne = document.getElementById('moyenne-evaluations');
        if (elemMoyenne) {
            elemMoyenne.textContent = moyenneAffichee !== null
                ? `Moyenne : ${moyenneAffichee.toFixed(1)}%`
                : '';
        }

        const elemNbProductions = document.getElementById('nb-productions');
        if (elemNbProductions) {
            elemNbProductions.textContent = `${nbProductions} production(s)`;
        }

        // Générer les lignes HTML
        corpsTableau.innerHTML = lignesFiltrees.map(ligne => genererLigneHTML(ligne)).join('');

        // Attacher les événements aux boutons d'action
        attacherEvenementsActions();

        // Restaurer la visibilité des colonnes selon les préférences
        restaurerPreferencesColonnes();

        // Vérifier si le tableau déborde (après un court délai pour que le DOM soit peint)
        setTimeout(verifierDebordementTableau, 50);

        const logMoyenne = moyenneAffichee !== null ? ` | Moyenne: ${moyenneAffichee.toFixed(1)}%` : '';
    }
}

/**
 * Construit la liste complète des lignes (évaluations + non évaluées)
 */
function construireLignesEvaluations(evaluations, productions, etudiants) {
    const lignes = [];
    const pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
        ? obtenirPratiqueActiveGroupeCours()
        : (typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : 'sommative');
    const estPAN = pratiqueId === 'pan-standards' || pratiqueId === 'pan-maitrise';

    // Productions à évaluer (exclure le portfolio lui-même)
    const productionsAEvaluer = productions.filter(p => p.type !== 'portfolio');

    // Pour chaque élève et chaque production, créer une ligne
    etudiants.forEach(etudiant => {
        productionsAEvaluer.forEach(production => {
            // IMPORTANT : Chercher TOUTES les évaluations (pas seulement la première)
            // Car avec les jetons, il peut y avoir l'originale + la nouvelle
            const evaluationsTrouvees = evaluations.filter(ev =>
                ev.etudiantDA === etudiant.da && ev.productionId === production.id
            );

            if (evaluationsTrouvees.length > 0) {
                // Créer une ligne pour CHAQUE évaluation trouvée
                evaluationsTrouvees.forEach(evaluation => {
                    // IMPORTANT : Quatre types de badges (par ordre de priorité)
                    // 1. Intégrité académique : plagiat ou IA non autorisée (prioritaire)
                    // 2. ORIGINALE remplacée : remplaceeParId existe → grisée, "Remplacée"
                    // 3. NOUVELLE reprise : repriseDeId existe OU ID commence par EVAL_REPRISE_ → "Jeton de reprise appliqué"
                    // 4. Délai : jetonDelaiApplique = true ET pas de repriseDeId → "Jeton de délai appliqué"

                    const statutIntegrite = evaluation.statutIntegrite || 'recevable';
                    const estNonRecevable = (statutIntegrite === 'plagiat' || statutIntegrite === 'ia');
                    const estSoupcon = (statutIntegrite === 'soupcon');

                    const estOriginaleRemplacee = evaluation.remplaceeParId ? true : false;
                    const estNouvelleReprise = evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_');
                    const estRepriseCiblee = evaluation.jetonRepriseCibleeApplique === true;
                    const aJetonDelai = evaluation.jetonDelaiApplique && !evaluation.repriseDeId && !evaluation.jetonRepriseCibleeApplique;

                    // Déterminer le statut et le badge
                    let statut = 'evalue';
                    let badgeType = null;

                    // Priorité 1 : Intégrité académique
                    if (estNonRecevable) {
                        statut = 'non-recevable';
                        badgeType = statutIntegrite === 'plagiat' ? 'plagiat' : 'ia';
                    } else if (estSoupcon) {
                        statut = 'evalue';
                        badgeType = 'soupcon';
                    }
                    // Priorité 2 : Jetons (seulement si pas de problème d'intégrité)
                    else if (estOriginaleRemplacee) {
                        // L'originale remplacée par une reprise
                        statut = 'remplacee';
                        badgeType = 'originale-reprise';
                    } else if (estRepriseCiblee) {
                        // La nouvelle évaluation de reprise ciblée
                        statut = 'evalue';
                        badgeType = 'reprise-ciblee';
                    } else if (estNouvelleReprise) {
                        // La nouvelle évaluation de reprise standard
                        statut = 'evalue';
                        badgeType = 'nouvelle-reprise';
                    } else if (aJetonDelai) {
                        // Évaluation avec délai accordé
                        statut = 'evalue';
                        badgeType = 'delai';
                    }

                    // Formater le nom de production avec description
                    let productionNomComplet = production.titre;
                    if (production.description && production.description.trim() !== '') {
                        productionNomComplet = `${production.titre} - ${production.description}`;
                    }

                    // Évaluation existante
                    // ✅ NOUVEAU (29 déc 2025): Ajouter daAffichage pour anonymisation
                    // Si c'est une reprise, chercher les scores de l'originale
                    var scoresOriginaux = null;
                    if (estNouvelleReprise && evaluation.repriseDeId) {
                        var originale = evaluations.find(function(e) { return e.id === evaluation.repriseDeId; });
                        if (originale) {
                            scoresOriginaux = {
                                niveauFinal: originale.niveauFinal || '-',
                                noteFinale: originale.noteFinale != null ? originale.noteFinale : null
                            };
                        }
                    }

                    lignes.push({
                        da: etudiant.da,
                        daAffichage: etudiant.daAffichage || etudiant.da,
                        nom: etudiant.nom || '',
                        prenom: etudiant.prenom || '',
                        groupe: etudiant.groupe,
                        productionId: production.id,
                        productionNom: productionNomComplet,
                        grilleNom: evaluation.grilleNom || '-',
                        cartoucheId: evaluation.cartoucheId || null,
                        cartoucheNom: obtenirNomCartouche(evaluation.grilleId, evaluation.cartoucheId),
                        note: obtenirNoteAffichee(evaluation, estPAN),
                        noteChiffree: evaluation.noteFinale != null ? evaluation.noteFinale : null,
                        niveauFinal: evaluation.niveauFinal || '-',
                        statut: statut,
                        statutIntegrite: statutIntegrite,
                        statutRemise: evaluation.statutRemise || 'non-remis',  // ✅ Ajout statut de remise
                        evaluationId: evaluation.id,
                        verrouille: evaluation.verrouillee || false,
                        remplacee: estOriginaleRemplacee,
                        badgeType: badgeType,
                        scoresOriginaux: scoresOriginaux
                    });
                });
            } else {
                // Formater le nom de production avec description pour les non évaluées aussi
                let productionNomComplet = production.titre;
                if (production.description && production.description.trim() !== '') {
                    productionNomComplet = `${production.titre} - ${production.description}`;
                }

                // Évaluation manquante
                // ✅ NOUVEAU (29 déc 2025): Ajouter daAffichage pour anonymisation
                lignes.push({
                    da: etudiant.da,
                    daAffichage: etudiant.daAffichage || etudiant.da,
                    nom: etudiant.nom || '',
                    prenom: etudiant.prenom || '',
                    groupe: etudiant.groupe,
                    productionId: production.id,
                    productionNom: productionNomComplet,
                    grilleNom: '-',
                    cartoucheId: null,
                    cartoucheNom: '-',
                    note: '-',
                    noteChiffree: null,
                    niveauFinal: '-',
                    statut: 'non-evalue',
                    statutRemise: 'non-remis',  // ✅ Ajout statut de remise (par défaut non remis)
                    evaluationId: null,
                    verrouille: false
                });
            }
        });
    });

    // Ajouter des lignes dédiées pour les fichiers non associés
    // (DA vide OU productionId orphelin) — une ligne par FICHIER réel
    if (typeof travauxStockage !== 'undefined' && typeof travauxStockage.obtenirFichiersGroupeActif === 'function') {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const productionIdsConnus = new Set(productions.map(p => p.id));

        // Fichiers sans étudiant (DA vide)
        fichiers.filter(f => !f.etudiantDA).forEach(fichier => {
            lignes.push({
                da: '', daAffichage: '', nom: '?',
                prenom: (typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : fichier.nomFichier) || 'Fichier non identifié',
                groupe: '', productionId: fichier.productionId || '', productionNom: 'Non associé',
                associationManquante: true, estFichierNonAssocie: true, etudiantManquant: true, fichierId: fichier.id,
                grilleNom: '-', cartoucheId: null, cartoucheNom: '-',
                note: '-', noteChiffree: null, niveauFinal: '-',
                statut: 'non-evalue', statutRemise: 'non-remis', evaluationId: null, verrouille: false
            });
        });

        // Fichiers avec DA valide mais productionId orphelin ou vide
        const fichiersOrphelins = fichiers.filter(f =>
            f.etudiantDA && (!f.productionId || !productionIdsConnus.has(f.productionId))
        );

        // Indexer les fichiers correctement associés par DA (pour détection doublon)
        const fichiersAssociesParDA = new Map();
        fichiers.forEach(f => {
            if (f.etudiantDA && f.productionId && productionIdsConnus.has(f.productionId)) {
                if (!fichiersAssociesParDA.has(f.etudiantDA)) fichiersAssociesParDA.set(f.etudiantDA, []);
                fichiersAssociesParDA.get(f.etudiantDA).push(f);
            }
        });

        fichiersOrphelins.forEach(fichier => {
            const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
            const nomFichier = typeof anonymiserNomFichier === 'function'
                ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA)
                : fichier.nomFichier;

            // Détection doublon : même DA + même nomFichier ou même taille qu'un fichier associé
            let estDoublon = false;
            let diagnosticDoublon = '';
            const associes = fichiersAssociesParDA.get(fichier.etudiantDA) || [];
            if (associes.length > 0) {
                const match = associes.find(a =>
                    (a.nomFichier && a.nomFichier === fichier.nomFichier) ||
                    (a.tailleFichier && a.tailleFichier > 0 && a.tailleFichier === fichier.tailleFichier)
                );
                if (match) {
                    const prod = productions.find(p => p.id === match.productionId);
                    const nomProd = prod ? (prod.titre || prod.nom || prod.description) : match.productionId;
                    const critere = (match.nomFichier === fichier.nomFichier) ? 'même nom' : 'même taille';
                    estDoublon = true;
                    diagnosticDoublon = nomProd + ' (' + critere + ')';
                }
            }

            lignes.push({
                da: fichier.etudiantDA, daAffichage: fichier.etudiantDA,
                nom: etudiant ? etudiant.nom : '?',
                prenom: etudiant ? etudiant.prenom : (nomFichier || 'Fichier non identifié'),
                groupe: etudiant ? (etudiant.groupe || '') : '',
                productionId: '', productionNom: nomFichier || 'Fichier non associé',
                associationManquante: true, estFichierNonAssocie: true, fichierId: fichier.id,
                estDoublon, diagnosticDoublon,
                grilleNom: '-', cartoucheId: null, cartoucheNom: '-',
                note: '-', noteChiffree: null, niveauFinal: '-',
                statut: 'non-evalue', statutRemise: 'non-remis', evaluationId: null, verrouille: false
            });
        });
    }

    // Calculer le statut workflow pour chaque ligne
    lignes.forEach(ligne => {
        ligne.statutWorkflow = calculerStatutWorkflow(ligne);
    });

    return lignes;
}

/**
 * Obtient le nom de la cartouche
 */
function obtenirNomCartouche(grilleId, cartoucheId) {
    if (!grilleId || !cartoucheId) return '-';

    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    return cartouche ? cartouche.nom : '-';
}

/**
 * Obtient la note affichée selon la pratique de notation
 */
function obtenirNoteAffichee(evaluation, estPAN) {
    if (estPAN) {
        return evaluation.niveauFinal || '-';
    } else {
        return evaluation.noteFinale != null && evaluation.noteFinale !== 0 ? `${evaluation.noteFinale}%` : '-';
    }
}

/**
 * Applique les filtres et recharge le tableau
 */
function appliquerFiltres() {
    // Mettre à jour le bouton corbeille
    mettreAJourBoutonCorbeille();

    // Si la vue corbeille est active, afficher la corbeille au lieu du tableau normal
    if (vueCorbeilleActive) {
        afficherVueCorbeille();
        return;
    }

    // Charger les données selon le mode actif
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // Afficher le tableau avec les filtres appliqués
    afficherTableauEvaluations(evaluations, productions, etudiants);
}

/**
 * Applique les filtres sur les lignes
 */
function appliquerFiltresSurLignes(lignes) {
    const filtreGroupe = document.getElementById('filtre-groupe-eval')?.value || '';
    const filtreProduction = document.getElementById('filtre-production-eval')?.value || '';
    const filtreStatut = document.getElementById('filtre-statut-eval')?.value || '';
    const filtreNote = document.getElementById('filtre-note-eval')?.value || '';

    return lignes.filter(ligne => {
        // Filtre Groupe
        if (filtreGroupe && ligne.groupe !== filtreGroupe) return false;

        // Filtre Production
        if (filtreProduction && ligne.productionId !== filtreProduction) return false;

        // Filtre Statut (workflow + jetons)
        if (filtreStatut === 'non-recu') {
            if (ligne.statutWorkflow !== 'non-recu') return false;
        } else if (filtreStatut === 'recu') {
            if (ligne.statutWorkflow !== 'recu') return false;
        } else if (filtreStatut === 'importe') {
            if (ligne.statutWorkflow !== 'importe') return false;
        } else if (filtreStatut === 'annote') {
            if (ligne.statutWorkflow !== 'annote') return false;
        } else if (filtreStatut === 'evalue') {
            if (ligne.statutWorkflow !== 'evalue') return false;
        } else if (filtreStatut === 'non-evalue') {
            if (ligne.statut !== 'non-evalue') return false;
        } else if (filtreStatut === 'non-associe') {
            if (!ligne.estFichierNonAssocie) return false;
        } else if (filtreStatut === 'jeton-delai') {
            if (ligne.badgeType !== 'delai') return false;
        } else if (filtreStatut === 'jeton-reprise') {
            if (ligne.badgeType !== 'nouvelle-reprise') return false;
        } else if (filtreStatut === 'jeton-reprise-ciblee') {
            if (ligne.badgeType !== 'reprise-ciblee') return false;
        } else if (filtreStatut === 'tous-jetons') {
            if (!['delai', 'nouvelle-reprise', 'reprise-ciblee'].includes(ligne.badgeType)) return false;
        } else if (filtreStatut === 'remplacees') {
            if (ligne.statut !== 'remplacee') return false;
        } else if (filtreStatut && ligne.statut !== filtreStatut) {
            return false;
        }

        // Filtre Note
        if (filtreNote) {
            if (filtreNote.includes('-')) {
                // Tranche de % (ex: "80-89")
                const [min, max] = filtreNote.split('-').map(Number);
                const note = parseFloat(ligne.note);
                if (isNaN(note) || note < min || note > max) return false;
            } else {
                // Niveau IDME
                if (ligne.niveauFinal !== filtreNote) return false;
            }
        }

        return true;
    });
}

/**
 * Applique une recherche textuelle sur les lignes
 * Recherche dans : DA, nom, prénom, production, grille, cartouche, note
 */
function appliquerRechercheTexte(lignes) {
    const champRecherche = document.getElementById('recherche-evaluations');
    if (!champRecherche) return lignes;

    const termeRecherche = champRecherche.value.toLowerCase().trim();

    // Si pas de terme de recherche, retourner toutes les lignes
    if (!termeRecherche) return lignes;

    return lignes.filter(ligne => {
        // Rechercher dans tous les champs pertinents
        // ✅ NOUVEAU (29 déc 2025): Utiliser daAffichage pour anonymisation
        const da = (ligne.daAffichage || ligne.da).toString().toLowerCase();
        const nom = ligne.nom.toLowerCase();
        const prenom = ligne.prenom.toLowerCase();
        const production = ligne.productionNom.toLowerCase();
        const noteChiffree = ligne.noteChiffree ? ligne.noteChiffree.toString() : '';

        // Retourner true si le terme est trouvé dans au moins un champ
        return da.includes(termeRecherche) ||
               nom.includes(termeRecherche) ||
               prenom.includes(termeRecherche) ||
               production.includes(termeRecherche) ||
               noteChiffree.includes(termeRecherche);
    });
}

/**
 * Fonction appelée par le champ de recherche (oninput)
 * Recharge le tableau avec la recherche appliquée
 */
function rechercherEvaluations() {
    // Recharger le tableau avec tous les filtres et la recherche
    appliquerFiltres();
}

// ============================================
// GÉNÉRATION HTML
// ============================================

/**
 * Génère le HTML d'une ligne du tableau
 */
function genererLigneHTML(ligne) {
    // Déterminer les classes CSS et le badge selon le type
    let classeRemplacee = '';
    let badgeJeton = '';

    // Priorité aux badges d'intégrité
    if (ligne.badgeType === 'plagiat') {
        badgeJeton = ' <span class="badge-jeton badge-jeton-plagiat">Non recevable (Plagiat)</span>';
    } else if (ligne.badgeType === 'ia') {
        badgeJeton = ' <span class="badge-jeton badge-jeton-plagiat">Non recevable (IA)</span>';
    } else if (ligne.badgeType === 'soupcon') {
        badgeJeton = ' <span class="badge-jeton badge-jeton-soupcon">À vérifier</span>';
    }
    // Badges de jetons
    else if (ligne.badgeType === 'originale-reprise') {
        // Originale remplacée : classe grisée + badge "Remplacée"
        classeRemplacee = ' class="eval-remplacee"';
        badgeJeton = ' <span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Remplacée</span></span>';
    } else if (ligne.badgeType === 'reprise-ciblee') {
        // Nouvelle de reprise ciblée : badge "Reprise ciblée"
        badgeJeton = ' <span class="badge-jeton-reprise-ciblee-wrapper"><span class="badge-jeton-titre">Reprise ciblée</span></span>';
    } else if (ligne.badgeType === 'nouvelle-reprise') {
        // Nouvelle de reprise standard : badge "Reprise" + scores originaux
        var infoOriginale = '';
        if (ligne.scoresOriginaux) {
            var parties = [];
            if (ligne.scoresOriginaux.niveauFinal && ligne.scoresOriginaux.niveauFinal !== '-') {
                parties.push(ligne.scoresOriginaux.niveauFinal);
            }
            if (ligne.scoresOriginaux.noteFinale != null) {
                parties.push(ligne.scoresOriginaux.noteFinale + '%');
            }
            if (parties.length > 0) {
                infoOriginale = ' <span class="badge-jeton-original">(était ' + parties.join(' · ') + ')</span>';
            }
        }
        badgeJeton = ' <span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Reprise</span>' + infoOriginale + '</span>';
    } else if (ligne.badgeType === 'delai') {
        // Délai : badge "Délai"
        badgeJeton = ' <span class="badge-jeton-delai-wrapper"><span class="badge-jeton-titre">Délai</span></span>';
    }

    // Afficher le statut workflow avec badge coloré
    var statutW = ligne.statutWorkflow || 'non-recu';
    // Reprise en attente de réévaluation : pas encore resauvegardée (verrouillee=false)
    if (ligne.badgeType === 'nouvelle-reprise' && !ligne.verrouille) {
        statutW = 'a-reevaluer';
    }
    const libelleStatut = statutW === 'a-reevaluer' ? 'À réévaluer' : obtenirLibelleStatut(statutW);
    let affichageNiveau;
    if (ligne.statut === 'non-recevable') {
        affichageNiveau = '<strong style="color: var(--gris-clair);">0</strong>';
    } else {
        affichageNiveau = `<span class="travaux-badge-pill ${statutW}">${libelleStatut}</span>`;
    }

    // Afficher la note chiffrée (%)
    let affichageNoteChiffree;
    if (ligne.statutRemise === 'non-remis' || ligne.statutRemise === 'retard') {
        // Non remis ou en retard : afficher --
        affichageNoteChiffree = '<strong style="color: var(--gris-clair);">--</strong>';
    } else if (ligne.statut === 'non-recevable') {
        // Non recevable : afficher -- au lieu d'une note
        affichageNoteChiffree = '<strong style="color: var(--gris-clair);">--</strong>';
    } else if ((ligne.statut === 'evalue' || ligne.statut === 'remplacee') && ligne.noteChiffree !== null) {
        affichageNoteChiffree = `<strong>${ligne.noteChiffree}%</strong>`;
    } else {
        affichageNoteChiffree = '-';
    }

    // Générer le dropdown d'actions contextuel
    const boutons = genererDropdownActions(ligne);

    const daAffiche = ligne.daAffichage || ligne.da;

    return `
        <tr data-evaluation-id="${ligne.evaluationId || ''}" data-da="${ligne.da}" data-production-id="${ligne.productionId}"${classeRemplacee}>
            <td class="td-left">${daAffiche}</td>
            <td class="td-left">${echapperHtml(ligne.nom)}</td>
            <td class="td-left">${echapperHtml(ligne.prenom)}</td>
            <td class="td-left">${ligne.associationManquante
                ? `${echapperHtml(ligne.productionNom)} ${ligne.estDoublon
                    ? `<span style="color: var(--rouge-danger); font-size: 0.85em;" title="Doublon : ce fichier est déjà associé à ${echapperHtml(ligne.diagnosticDoublon || '')}. Suppression sécuritaire.">⚠ Doublon</span>`
                    : `<span style="color: var(--attention); font-size: 0.85em;">⚠ Non associé</span>`}`
                : ligne.fichierAutreProduction
                    ? `${echapperHtml(ligne.productionNom)} <span style="color: var(--attention); font-size: 0.85em;">⚠ Fichier sous autre production</span>`
                    : echapperHtml(ligne.productionNom)}</td>
            <td class="td-center">${badgeJeton}</td>
            <td class="td-center">${affichageNiveau}</td>
            <td class="td-center">${ligne.niveauFinal && ligne.niveauFinal !== '-' ? `<strong>${ligne.niveauFinal}</strong>` : '-'}</td>
            <td class="td-center">${affichageNoteChiffree}</td>
            <td class="td-center">${boutons}</td>
        </tr>
    `;
}

/**
 * Génère un <select> natif d'actions contextuel selon le statut de la ligne
 */
function genererDropdownActions(ligne) {
    // Trouver le fichier importé associé
    let fichierImporte = null;
    if (typeof travauxStockage !== 'undefined' && typeof travauxStockage.obtenirFichiersTravaux === 'function') {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const productions = obtenirDonneesSelonMode('productions');
        const productionIdsConnus = new Set(productions.map(p => p.id));
        // Match direct par fichierId (lignes dédiées non-associées)
        if (ligne.fichierId) {
            fichierImporte = fichiers.find(f => f.id === ligne.fichierId);
        }
        // Match prioritaire par evaluationId (distingue original vs reprise)
        if (!fichierImporte && ligne.evaluationId) {
            fichierImporte = fichiers.find(f =>
                f.evaluationId === ligne.evaluationId
            );
        }
        // Fallback : match strict par DA + productionId
        if (!fichierImporte) {
            fichierImporte = fichiers.find(f =>
                f.etudiantDA === ligne.da && f.productionId && f.productionId === ligne.productionId
            );
        }
        // Match souple : fichier du même DA sans productionId ou avec productionId orphelin
        // 🔧 FIX (5 mars 2026) : Ne soft-matcher que si l'étudiant n'a qu'UN seul fichier
        // non-associé. Sinon le match est ambigu (pourrait être pour une autre production).
        if (!fichierImporte) {
            const fichiersNonAssocies = fichiers.filter(f =>
                f.etudiantDA === ligne.da && (!f.productionId || !productionIdsConnus.has(f.productionId))
            );
            if (fichiersNonAssocies.length === 1) {
                fichierImporte = fichiersNonAssocies[0];
            }
        }
    }
    const fichierId = fichierImporte ? fichierImporte.id : null;
    const da = ligne.da;
    const prodId = ligne.productionId;
    const evalId = ligne.evaluationId;

    const options = [];

    // Évaluer — non évalué seulement
    if (ligne.statut === 'non-evalue') {
        options.push(`<option value="evaluer|${da}|${prodId}">Évaluer</option>`);
    }

    // Annoter — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="annoter|${fichierId}|${prodId}">Annoter</option>`);
    }

    // Consulter — si évaluation existe
    if (evalId) {
        options.push(`<option value="consulter|${evalId}">Consulter</option>`);
    }

    // Journal — si évaluation existe
    if (evalId) {
        options.push(`<option value="journal|${evalId}">Journal</option>`);
    }

    // Modifier une évaluation remplacée (verrouillée)
    if (evalId && ligne.statut === 'remplacee') {
        options.push(`<option value="modifier-remplacee|${evalId}">Modifier l'évaluation</option>`);
    }

    // Dossier PDF — évalué + export dispo
    if (ligne.statut === 'evalue' && typeof travauxExportPDF !== 'undefined') {
        options.push(`<option value="dossier|${da}|${prodId}">Dossier PDF</option>`);
    }

    // Éditer — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="editer|${fichierId}">Éditer</option>`);
    }

    // Transférer — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="transferer">Transférer</option>`);
    }

    // Associer / Réassocier — si fichier importé (strict ou souple)
    if (fichierId) {
        const labelAssoc = ligne.productionId ? 'Réassocier' : 'Associer';
        options.push(`<option value="associer|${fichierId}|${da}">${labelAssoc}</option>`);
    } else if (typeof travauxStockage !== 'undefined') {
        // Fichier mal associé OU non associé : même DA mais sous une autre production ou sans productionId
        // 🔧 FIX (5 mars 2026) : Inclure aussi les fichiers sans productionId (besoin d'association)
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const fichierAAssocier = fichiers.find(f =>
            f.etudiantDA === da && (!f.productionId || f.productionId !== prodId)
        );
        if (fichierAAssocier) {
            const label = fichierAAssocier.productionId ? 'Réassocier' : 'Associer';
            options.push(`<option value="associer|${fichierAAssocier.id}|${da}">${label}</option>`);
        }
    }

    // Supprimer — si fichier importé
    if (fichierId) {
        options.push(`<option value="supprimer|${fichierId}|${da}">Supprimer</option>`);
    }

    // ✅ AJOUT (16 mars 2026) : Supprimer évaluation orpheline (sans fichier)
    if (!fichierId && evalId) {
        options.push(`<option value="supprimer-eval|${evalId}">Supprimer l'évaluation</option>`);
    }

    if (options.length === 0) {
        return '<span class="texte-muted">-</span>';
    }

    return `<select class="eval-actions-select" data-on-change="executerActionEval">
        <option value="">Actions...</option>
        ${options.join('')}
    </select>`;
}

/**
 * Exécute l'action sélectionnée dans le <select> natif
 */
function executerActionEval(select) {
    const val = select.value;
    select.value = ''; // Reset immédiat
    if (!val) return;

    const parts = val.split('|');
    const action = parts[0];

    switch (action) {
        case 'evaluer':
            evaluerProduction(parts[1], parts[2]);
            break;
        case 'annoter':
            ouvrirAnnotationDepuisListe(parts[1], parts[2]);
            break;
        case 'consulter':
            consulterEvaluationDepuisListe(parts[1]);
            break;
        case 'dossier':
            if (typeof travauxExportPDF !== 'undefined') {
                travauxExportPDF.exporterDossierComplet(parts[1], parts[2]);
            }
            break;
        case 'editer':
            ouvrirEditeurDepuisListe(parts[1]);
            break;
        case 'transferer':
            if (typeof travauxUI !== 'undefined') {
                travauxUI.ouvrirModalTransfert();
            }
            break;
        case 'associer':
            associerProductionDepuisListe(parts[1], parts[2]);
            break;
        case 'supprimer':
            confirmerSuppressionFichier(parts[1], parts[2]);
            break;
        case 'supprimer-eval':
            supprimerEvaluation(parts[1]);
            break;
        case 'journal':
            if (typeof Journal !== 'undefined') {
                Journal.afficherJournal(parts[1]);
            }
            break;
        case 'modifier-remplacee':
            modifierEvaluationRemplacee(parts[1]);
            break;
    }
}

/**
 * Ouvre un fichier en mode annotation depuis la liste des évaluations.
 * L'évaluation existante sera chargée automatiquement par preRemplirEvaluation
 * → chargerEvaluationExistanteSiPresente quand l'utilisateur bascule en mode Évaluer.
 *
 * 🔧 FIX (29 mars 2026) : L'ancien callback appelait modifierEvaluationParId en mode
 * annotation (sans palettes eval), ce qui déclenchait le chemin standalone :
 * masquage de evaluations-contenu-fichiers, affichage du formulaire pleine largeur,
 * et _modifierEvaluationEnCours restait collé — contaminant les opérations suivantes.
 */
function ouvrirAnnotationDepuisListe(fichierId, productionId) {
    // Pré-sélectionner la production dans le filtre de la page Annoter
    if (productionId && typeof travauxUI !== 'undefined' && typeof travauxUI.setProductionFiltre === 'function') {
        travauxUI.setProductionFiltre(productionId);
    }

    afficherSection('evaluations');
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('evaluations-annoter');
    }

    // Callback minimal : empêche initialiserModuleTravaux de restaurer une session
    // précédente (qui ouvrirait le mauvais fichier). Le fichier cible sera ouvert
    // par le setTimeout ci-dessous.
    window._apresOuvertureFichier = function() {
        // No-op volontaire. L'évaluation sera chargée via preRemplirEvaluation
        // quand l'utilisateur cliquera sur Évaluer.
    };

    setTimeout(function() {
        if (typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
            travauxUI.ouvrirFichier(fichierId);
        }
    }, 200);
}

/**
 * Ouvre l'éditeur de pages depuis la liste des évaluations.
 * Accès direct à l'éditeur — le bouton « Propriétés » est dans l'éditeur.
 */
function ouvrirEditeurDepuisListe(fichierId) {
    afficherSection('evaluations');
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('evaluations-importer');
    }
    setTimeout(function() {
        if (typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirEditeurPages === 'function') {
            travauxUI.ouvrirEditeurPages(fichierId);
        }
    }, 200);
}

/**
 * Ouvre la modale Propriétés d'un fichier (nom, étudiant, production).
 * Accessible depuis un bouton dans l'éditeur de pages ou la liste.
 * @param {string} fichierId - ID du fichier à modifier
 */
function ouvrirProprieteFichier(fichierId) {
    var fichier = (typeof travauxStockage !== 'undefined')
        ? travauxStockage.obtenirFichierParId(fichierId) : null;
    if (!fichier) return;

    // Étudiants du groupe actif
    var etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif() : [];
    etudiants.sort(function(a, b) {
        return (a.nom || '').localeCompare(b.nom || '') || (a.prenom || '').localeCompare(b.prenom || '');
    });
    var optionsEtudiants = etudiants.map(function(e) {
        var label = (e.nom || '') + ', ' + (e.prenom || '') + ' (' + (e.da || '') + ')';
        var selected = (e.da === fichier.etudiantDA) ? ' selected' : '';
        return '<option value="' + echapperHtml(e.da || '') + '"' + selected + '>' + echapperHtml(label) + '</option>';
    }).join('');

    // Productions
    var productions = obtenirDonneesSelonMode('productions');
    var optionsProductions = productions.map(function(p) {
        var label = p.description ? (p.titre + ' - ' + p.description) : p.titre;
        var selected = (p.id === fichier.productionId) ? ' selected' : '';
        return '<option value="' + echapperHtml(p.id) + '"' + selected + '>' + echapperHtml(label) + '</option>';
    }).join('');

    // Évaluations de cet étudiant (pour lier le fichier à la bonne évaluation)
    var toutesEvals = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    var evalsEtudiant = toutesEvals.filter(function(e) {
        return e.etudiantDA === fichier.etudiantDA;
    });
    var optionsEvals = evalsEtudiant.map(function(e) {
        var prod = productions.find(function(p) { return p.id === e.productionId; });
        var nomProd = prod ? (prod.titre || prod.nom) : (e.productionId || '?');
        var type = e.remplaceeParId ? ' (Remplac\u00e9e)' : (e.repriseDeId ? ' (Reprise)' : '');
        var note = e.noteFinale != null ? ' \u2014 ' + e.niveauFinal + ' ' + e.noteFinale + '%' : '';
        var label = nomProd + type + note;
        var selected = (e.id === fichier.evaluationId) ? ' selected' : '';
        return '<option value="' + echapperHtml(e.id) + '"' + selected + '>' + echapperHtml(label) + '</option>';
    }).join('');

    // Retirer une modale existante
    var existante = document.getElementById('proprietes-fichier-overlay');
    if (existante) existante.remove();

    var overlay = document.createElement('div');
    overlay.id = 'proprietes-fichier-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML =
        '<div class="modal-contenu modal-compact" style="max-width: 520px;">' +
            '<button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>' +
            '<h3 class="modal-titre">Propri\u00e9t\u00e9s du fichier</h3>' +
            '<label style="font-size: 0.85em; color: var(--texte-secondaire);">Nom du document :</label>' +
            '<input type="text" id="prop-fichier-nom" class="controle-form" style="margin: 4px 0 12px 0; width: 100%;" value="' + echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : (fichier.nomFichier || '')) + '">' +
            '<label style="font-size: 0.85em; color: var(--texte-secondaire);">\u00c9tudiant\u00b7e :</label>' +
            '<select id="prop-fichier-etudiant" class="controle-form" style="margin: 4px 0 12px 0; width: 100%;">' +
                '<option value="">\u2014 Non associ\u00e9 \u2014</option>' +
                optionsEtudiants +
            '</select>' +
            '<label style="font-size: 0.85em; color: var(--texte-secondaire);">Production (artefact) :</label>' +
            '<select id="prop-fichier-production" class="controle-form" style="margin: 4px 0 12px 0; width: 100%;">' +
                '<option value="">\u2014 Non associ\u00e9 \u2014</option>' +
                optionsProductions +
            '</select>' +
            '<label style="font-size: 0.85em; color: var(--texte-secondaire);">\u00c9valuation li\u00e9e :</label>' +
            '<select id="prop-fichier-evaluation" class="controle-form" style="margin: 4px 0 16px 0; width: 100%;">' +
                '<option value="">\u2014 Aucune \u2014</option>' +
                optionsEvals +
            '</select>' +
            '<small style="display:block;color:var(--gris-moyen);margin:-12px 0 16px 0;font-size:0.75em">Lier ce fichier \u00e0 une \u00e9valuation sp\u00e9cifique (originale ou reprise).</small>' +
            '<div class="modal-actions" style="display:flex;gap:8px">' +
                '<button class="btn btn-confirmer" id="prop-fichier-btn-sauver">Sauvegarder</button>' +
                '<button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    var fermer = function() { overlay.remove(); };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) fermer(); });

    document.getElementById('prop-fichier-btn-sauver').onclick = function() {
        var nouveauNom = (document.getElementById('prop-fichier-nom') || {}).value || fichier.nomFichier;
        var nouveauDA = (document.getElementById('prop-fichier-etudiant') || {}).value || '';
        var nouvelleProd = (document.getElementById('prop-fichier-production') || {}).value || '';
        var nouvelleEval = (document.getElementById('prop-fichier-evaluation') || {}).value || '';
        var modifie = false;

        // etudiantDA et productionId sont des champs protégés → utiliser reassocierFichier
        var association = {};
        if (nouveauDA !== (fichier.etudiantDA || '')) association.etudiantDA = nouveauDA;
        if (nouvelleProd !== (fichier.productionId || '')) association.productionId = nouvelleProd;
        if (Object.keys(association).length > 0) {
            travauxStockage.reassocierFichier(fichierId, association);
            modifie = true;
        }

        // nomFichier et evaluationId → mettreAJourFichier (champs non protégés)
        var miseAJour = {};
        if (nouveauNom !== fichier.nomFichier) miseAJour.nomFichier = nouveauNom;
        if (nouvelleEval !== (fichier.evaluationId || '')) miseAJour.evaluationId = nouvelleEval;
        if (Object.keys(miseAJour).length > 0) {
            travauxStockage.mettreAJourFichier(fichierId, miseAJour);
            modifie = true;
        }

        if (modifie) {
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Propri\u00e9t\u00e9s mises \u00e0 jour');
            }
        }
        fermer();
    };
}
window.ouvrirProprieteFichier = ouvrirProprieteFichier;

/**
 * Ouvre une modale pour associer (ou réassocier) un fichier importé à une production
 */
function associerProductionDepuisListe(fichierId, da) {
    const productions = obtenirDonneesSelonMode('productions');
    if (productions.length === 0) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Aucune production', 'Crée d\'abord des productions dans « Construction de la note ».');
        }
        return;
    }

    // Trouver le fichier pour connaître la production actuelle
    let productionActuelle = null;
    if (typeof travauxStockage !== 'undefined') {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const fichier = fichiers.find(f => f.id === fichierId);
        if (fichier) productionActuelle = fichier.productionId;
    }

    // Vérifier si les jetons de reprise sont activés
    var configJetons = (typeof obtenirConfigJetons === 'function') ? obtenirConfigJetons() : null;
    var jetonsActifs = configJetons && configJetons.actif;

    var optionsHTML = productions.map(function(p) {
        var label = p.description ? (p.titre + ' - ' + p.description) : p.titre;
        return '<option value="' + p.id + '" ' + (p.id === productionActuelle ? 'selected' : '') + '>' + echapperHtml(label) + '</option>';
    }).join('');
    if (jetonsActifs) {
        optionsHTML += '<option value="__jeton_reprise__">Jeton de reprise</option>';
    }

    // Retirer une modale existante
    const existante = document.getElementById('associer-prod-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'associer-prod-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>
            <h3 class="modal-titre">${productionActuelle ? 'Réassocier' : 'Associer'} à une production</h3>
            <label style="font-size: 0.85em; color: var(--texte-secondaire);">Production :</label>
            <select id="associer-prod-select" class="controle-form" style="margin: 6px 0 16px 0; width: 100%;">
                <option value="">— Choisir une production —</option>
                ${optionsHTML}
            </select>
            <div class="modal-actions">
                <button class="btn btn-principal" id="associer-prod-btn-confirmer">Confirmer</button>
                <button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const fermer = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fermer(); });

    // Quand "Jeton de reprise" est sélectionné, afficher le sous-sélecteur de production cible
    var selectProd = document.getElementById('associer-prod-select');
    selectProd.addEventListener('change', function() {
        var sousSelect = document.getElementById('associer-jeton-prod-container');
        if (selectProd.value === '__jeton_reprise__') {
            if (!sousSelect) {
                var div = document.createElement('div');
                div.id = 'associer-jeton-prod-container';
                div.style.cssText = 'margin: 6px 0 16px 0;';
                div.innerHTML = '<label style="font-size: 0.85em; color: var(--texte-secondaire);">Pour quelle production ?</label>' +
                    '<select id="associer-jeton-prod-select" class="controle-form" style="margin: 4px 0 0 0; width: 100%;">' +
                    '<option value="">-- Choisir --</option>' + optionsHTML.replace('__jeton_reprise__', '').replace(/<option[^>]*__jeton_reprise__[^>]*>[^<]*<\/option>/g, '') + '</select>';
                selectProd.parentNode.insertBefore(div, selectProd.nextSibling.nextSibling);
            }
        } else if (sousSelect) {
            sousSelect.remove();
        }
    });

    document.getElementById('associer-prod-btn-confirmer').onclick = function() {
        var prodId = document.getElementById('associer-prod-select').value;
        if (!prodId) return;

        if (prodId === '__jeton_reprise__') {
            // Mode jeton : associer comme reprise
            var jetonProdSelect = document.getElementById('associer-jeton-prod-select');
            var jetonProdId = jetonProdSelect ? jetonProdSelect.value : '';
            if (!jetonProdId) return;

            // Réassocier le fichier à la production cible + marquer comme reprise
            if (typeof travauxUI !== 'undefined' && typeof travauxUI.changerProductionFichier === 'function') {
                travauxUI.changerProductionFichier(fichierId, jetonProdId);
            }
            travauxStockage.mettreAJourFichier(fichierId, { estReprise: true });

            // Appliquer le jeton de reprise si une évaluation existe
            var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
            var evalActive = evaluations.find(function(e) {
                return e.etudiantDA === da && e.productionId === jetonProdId && !e.remplaceeParId;
            });
            if (evalActive && typeof appliquerJetonReprise === 'function') {
                var nouvelleEval = appliquerJetonReprise(evalActive.id);
                if (nouvelleEval) {
                    travauxStockage.mettreAJourFichier(fichierId, { evaluationId: nouvelleEval.id });
                }
            }

            overlay.remove();
            appliquerFiltres();
            return;
        }

        if (typeof travauxUI !== 'undefined' && typeof travauxUI.changerProductionFichier === 'function') {
            travauxUI.changerProductionFichier(fichierId, prodId);
        }
        overlay.remove();
        appliquerFiltres();
    };
}

/**
 * Confirme et déplace un fichier à la corbeille (soft delete)
 */
function confirmerSuppressionFichier(fichierId, da) {
    if (typeof travauxStockage === 'undefined') return;

    // Trouver le fichier pour afficher son nom
    const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
    const fichier = fichiers.find(f => f.id === fichierId);
    const nomFichier = fichier ? (fichier.nomFichier || fichier.id) : fichierId;

    // Trouver le nom de l'étudiant (filtré par cours actif + anonymisation)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === da);
    const nomEtudiant = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : da;

    // Retirer une modale existante
    const existante = document.getElementById('supprimer-fichier-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'supprimer-fichier-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>
            <h3 class="modal-titre">Déplacer à la corbeille ?</h3>
            <p style="margin: 8px 0 16px 0; font-size: 0.9em;">
                Déplacer le fichier de <strong>${echapperHtml(nomEtudiant)}</strong> à la corbeille ?<br>
                <span style="color: var(--texte-secondaire); font-size: 0.9em;">${echapperHtml(nomFichier)}</span>
            </p>
            <p style="margin: 0 0 16px 0; font-size: 0.85em; color: var(--texte-secondaire);">
                Le fichier pourra être restauré pendant 30 jours.
            </p>
            <div class="modal-actions">
                <button class="btn btn-danger" id="supprimer-fichier-btn-confirmer">Déplacer à la corbeille</button>
                <button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('supprimer-fichier-btn-confirmer').onclick = () => {
        travauxStockage.deplacerEnCorbeille(fichierId);
        overlay.remove();
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`Fichier de ${nomEtudiant} déplacé à la corbeille.`);
        }
        appliquerFiltres();
        mettreAJourBoutonCorbeille();
    };
}

// ============================================
// ACTIONS SUR LES ÉVALUATIONS
// ============================================

/**
 * Attache les événements aux boutons d'action
 */
function attacherEvenementsActions() {
    // Les événements sont gérés via onclick dans le HTML pour simplicité
}

/**
 * Ouvre la page de la cartouche dans les réglages
 */
function ouvrirCartouche(cartoucheId, productionId) {
    // Naviguer vers Réglages › Rétroaction
    // TODO: Implémenter la navigation et la pré-sélection de la cartouche
    alert('Navigation vers la cartouche à implémenter');
}

/**
 * Ouvre la page d'évaluation pour modifier une évaluation existante
 * RENOMMÉ consulterEvaluationDepuisListe pour éviter conflit avec evaluation.js
 */
function consulterEvaluationDepuisListe(evaluationId) {

    // 🔧 FIX (6 mars 2026) : Annuler tout timer d'ouverture précédent pour éviter
    // qu'un clic rapide sur plusieurs évaluations ouvre le fichier d'une évaluation
    // précédente (le setTimeout(500ms) restant ouvre le mauvais fichier tandis que
    // le callback _apresOuvertureFichier a été écrasé par le nouvel appel).
    if (window._consulterEvalTimerId) {
        clearTimeout(window._consulterEvalTimerId);
        window._consulterEvalTimerId = null;
    }
    // Nettoyer aussi le callback obsolète
    window._apresOuvertureFichier = null;

    // Charger directement l'évaluation par son ID exact
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        alert('Évaluation non trouvée');
        console.error('❌ Évaluation introuvable, ID:', evaluationId);
        return;
    }


    // Résolution centralisée évaluation → fichier
    let fichierId = null;
    if (typeof travauxResolution !== 'undefined') {
        const fichierTrouve = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (fichierTrouve) fichierId = fichierTrouve.id;
    }

    // Naviguer vers la section Évaluations
    afficherSection('evaluations');

    if (fichierId && typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
        // Mettre le filtre production sur la bonne production AVANT d'ouvrir le fichier
        if (evaluation.productionId) {
            sessionStorage.setItem('travaux-filtre-production', evaluation.productionId);
        }
        // Workflow visionneuse : ouvrir le fichier, basculer en mode évaluer,
        // puis charger l'évaluation sauvegardée.
        // preRemplirEvaluation (déclenché par basculerMode) a besoin de ~450ms
        // pour peupler les selects (150ms étudiant + 150ms production + change events).
        // modifierEvaluationParId doit s'exécuter APRÈS pour écraser evaluationEnCours
        // avec la bonne version (incluant idModification).
        window._apresOuvertureFichier = function() {
            if (typeof travauxUI.basculerMode === 'function') {
                travauxUI.basculerMode('evaluer');
            }
            setTimeout(function() {
                if (typeof window.modifierEvaluationParId === 'function') {
                    window.modifierEvaluationParId(evaluation.id);
                }
            }, 600);
        };
        afficherSousSection('evaluations-annoter');
        window._consulterEvalTimerId = setTimeout(function() {
            window._consulterEvalTimerId = null;
            // Synchroniser le dropdown avec le filtre persisté
            // 🔧 FIX (5 mars 2026) : Synchroniser le dropdown SANS passer le select
            // en argument — passer le select déclenche l'auto-navigation (estChangementManuel)
            // qui ouvre un fichier parasite AVANT ouvrirFichier(fichierId), créant une course.
            const selectFiltre = document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
            if (selectFiltre && evaluation.productionId) {
                selectFiltre.value = evaluation.productionId;
                if (typeof travauxUI.filtrerBadgesParProduction === 'function') {
                    travauxUI.filtrerBadgesParProduction();
                }
            }
            travauxUI.ouvrirFichier(fichierId);
        }, 500);
    } else {
        // Fallback : pas de fichier importé, ouvrir le formulaire en standalone
        // 🔧 FIX (5 mars 2026) : Naviguer vers la bonne sous-section et nettoyer
        // tout état visionneuse/eval restant pour éviter une interface déconstruite.
        afficherSousSection('evaluations-annoter');
        // Nettoyer le mode eval si encore actif (restant d'un précédent affichage)
        if (typeof travauxUI !== 'undefined' && typeof travauxUI.fermerModeEvaluation === 'function') {
            travauxUI.fermerModeEvaluation();
        }
        setTimeout(function() {
            if (typeof window.modifierEvaluationParId === 'function') {
                window.modifierEvaluationParId(evaluation.id);
            } else {
                console.error('❌ Fonction modifierEvaluationParId non disponible');
            }
        }, 300);
    }
}

/**
 * Ouvre la page d'évaluation pour créer une nouvelle évaluation
 * pour un étudiant et une production donnés
 */
function evaluerProduction(da, productionId) {

    // Déterminer l'étape du flux selon le statut du travail
    let etapeNavigation = 'evaluations-annoter'; // défaut: évaluation
    let ouvrirAnnotation = false;

    // Résolution centralisée : trouver le fichier pour cette évaluation
    let fichierImporte = null;
    if (typeof travauxResolution !== 'undefined') {
        fichierImporte = travauxResolution.trouverFichierPourEvaluation({ etudiantDA: da, productionId });
    }
    if (!fichierImporte && typeof travauxStockage !== 'undefined' && typeof travauxStockage.obtenirFichiersGroupeActif === 'function') {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        fichierImporte = fichiers.find(f => f.etudiantDA === da && !f.productionId);
    }

    if (!fichierImporte) {
        // Pas importé → aller à l'importation
        etapeNavigation = 'evaluations-importer';
    } else {
        // Vérifier annotation
        const annotation = travauxStockage.obtenirAnnotationFichier(fichierImporte.id);
        const aAnnotation = annotation && typeof annotationContientDuContenu === 'function' && annotationContientDuContenu(annotation);

        if (!aAnnotation) {
            // Importé mais pas annoté → ouvrir en mode annotation
            etapeNavigation = 'evaluations-annoter';
            ouvrirAnnotation = true;
        } else {
            // Annoté ou évalué → évaluation (comportement actuel)
        }
    }

    // Mettre le filtre production sur la bonne production AVANT de naviguer
    if (productionId) {
        sessionStorage.setItem('travaux-filtre-production', productionId);
    }

    // Naviguer vers la section appropriée
    afficherSection('evaluations');
    if (typeof afficherSousSection === 'function') {
        afficherSousSection(etapeNavigation);
    }

    // Si on navigue vers l'import, pas besoin de pré-remplir le formulaire d'évaluation
    if (etapeNavigation === 'evaluations-importer') {
        return;
    }

    // Synchroniser le dropdown filtre avec la production cible
    setTimeout(() => {
        const selectFiltre = document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
        if (selectFiltre && productionId) {
            selectFiltre.value = productionId;
            if (typeof travauxUI !== 'undefined' && typeof travauxUI.filtrerBadgesParProduction === 'function') {
                travauxUI.filtrerBadgesParProduction(selectFiltre);
            }
        }
    }, 100);

    // Si on doit ouvrir le fichier en mode annotation
    if (ouvrirAnnotation && fichierImporte) {
        setTimeout(() => {
            if (typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
                travauxUI.ouvrirFichier(fichierImporte.id);
            }
        }, 200);
        return;
    }

    // Rendre le formulaire d'évaluation visible
    setTimeout(() => {
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        const fichiersDiv = document.getElementById('evaluations-contenu-fichiers');
        const visDiv = document.getElementById('evaluations-contenu-visionneuse');
        if (evalDiv) evalDiv.classList.remove('u-hide');
        if (fichiersDiv) fichiersDiv.classList.add('u-hide');
        if (visDiv) visDiv.classList.add('u-hide');
    }, 50);

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Pré-remplir le formulaire avec l'étudiant et la production
        const selectEtudiant = document.getElementById('selectEtudiantEval');
        const selectProduction = document.getElementById('selectProduction1');

        if (!selectEtudiant || !selectProduction) {
            console.error('❌ Éléments de formulaire non trouvés');
            alert('Erreur: Formulaire d\'évaluation non disponible');
            return;
        }

        // Sélectionner l'étudiant
        selectEtudiant.value = da;

        // Déclencher le chargement des productions pour cet étudiant
        if (typeof chargerEvaluationsEtudiant === 'function') {
            chargerEvaluationsEtudiant();
        }

        // Attendre que les productions soient chargées
        setTimeout(() => {
            // Sélectionner la production
            selectProduction.value = productionId;

            // Déclencher le chargement de la grille associée
            const event = new Event('change');
            selectProduction.dispatchEvent(event);

        }, 100);
    }, 200);
}

/**
 * Duplique une évaluation pour un autre élève
 */
function dupliquerEvaluation(evaluationId) {
    // TODO: Implémenter la duplication

    if (!confirm('Veux-tu dupliquer cette évaluation pour un autre élève ?')) {
        return;
    }

    alert('Duplication à implémenter: sélection de l\'élève cible');
}

/**
 * Supprime une évaluation
 */
function supprimerEvaluation(evaluationId) {
    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(ev => ev.id === evaluationId);

    // Vérifier si l'évaluation est verrouillée
    // ✅ CORRIGÉ (16 mars 2026) : permettre la suppression d'une éval verrouillée
    // si le fichier source n'existe plus (évaluation orpheline, pas de moyen de déverrouiller)
    if (evaluation && evaluation.verrouillee) {
        var fichierExiste = false;
        if (typeof travauxResolution !== 'undefined') {
            fichierExiste = !!travauxResolution.trouverFichierPourEvaluation(evaluation);
        } else if (typeof travauxStockage !== 'undefined') {
            var fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
            fichierExiste = fichiers.some(function(f) {
                return f.etudiantDA === evaluation.etudiantDA && f.productionId === evaluation.productionId;
            });
        }
        if (fichierExiste) {
            if (typeof afficherNotificationErreur === 'function') {
                afficherNotificationErreur('Suppression impossible', 'Cette évaluation est verrouillée. Déverrouillez-la d\'abord.');
            } else {
                alert('Suppression impossible : cette évaluation est verrouillée. Déverrouillez-la d\'abord.');
            }
            return;
        }
        // Fichier absent → évaluation orpheline, on permet la suppression
    }

    if (!confirm('Veux-tu vraiment supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    const evaluationsFiltered = evaluations.filter(ev => ev.id !== evaluationId);

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluationsFiltered)) {
        afficherNotificationErreur('Erreur', 'Impossible de supprimer en mode anonymisation');
        return;
    }


    // Recalculer les indices C et P
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir complètement le tableau
    initialiserListeEvaluations();

    // Notification de succès
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Évaluation supprimée');
    }
}

/**
 * Permet de modifier une évaluation "Remplacée" (verrouillée après jeton de reprise).
 * Capture un snapshot avant, déverrouille temporairement, et navigue vers le formulaire.
 * Le re-verrouillage et le journal sont gérés dans sauvegarderEvaluationModifiee().
 *
 * IMPORTANT : ouvre le formulaire en mode STANDALONE (sans visionneuse) pour éviter
 * que preRemplirEvaluation charge la reprise active à la place de l'originale.
 */
function modifierEvaluationRemplacee(evaluationId) {
    // ACCÈS DIRECT — doit trouver l'évaluation dans TOUTES celles du trimestre (peut être cross-cours)
    var evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    var evaluation = evaluations.find(function(e) { return e.id === evaluationId; });

    if (!evaluation) {
        afficherNotificationErreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Capturer snapshot avant modification
    var avant = {
        statutIntegrite: evaluation.statutIntegrite,
        noteFinale: evaluation.noteFinale,
        niveauFinal: evaluation.niveauFinal,
        criteres: (evaluation.criteres || []).map(function(c) {
            return { critereId: c.critereId, niveau: c.niveauSelectionne };
        })
    };

    window._snapshotAvantModifRemplacee = { evalId: evaluationId, avant: avant };

    // Déverrouiller temporairement
    evaluation.verrouillee = false;
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    // Bloquer preRemplirEvaluation AVANT toute navigation
    // (afficherSousSection → initialiserModuleTravaux → afficherPalettesEval → preRemplirEvaluation)
    window._modifierEvaluationEnCours = true;
    window._forceStandaloneEval = true;

    // Fermer le mode évaluation visionneuse s'il est actif
    if (typeof travauxUI !== 'undefined' && typeof travauxUI.fermerModeEvaluation === 'function') {
        travauxUI.fermerModeEvaluation();
    }

    // Charger directement via modifierEvaluationParId (il gère la navigation)
    setTimeout(function() {
        if (typeof window.modifierEvaluationParId === 'function') {
            window.modifierEvaluationParId(evaluationId);
        } else {
            window._modifierEvaluationEnCours = false;
            window._forceStandaloneEval = false;
        }
        // Sécurité : nettoyer les flags après que modifierEvaluation ait eu le temps de finir
        setTimeout(function() {
            window._modifierEvaluationEnCours = false;
            window._forceStandaloneEval = false;
        }, 5000);
    }, 300);
}

/**
 * Verrouille/Déverrouille une évaluation
 */
function toggleVerrouillerEvaluation(evaluationId) {
    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(ev => ev.id === evaluationId);

    if (!evaluation) {
        console.error(`❌ Évaluation ${evaluationId} introuvable`);
        return;
    }

    // ✅ CORRECTION : Utiliser "verrouillee" (avec "e") pour cohérence avec evaluation.js
    evaluation.verrouillee = !evaluation.verrouillee;

    // Ajouter/supprimer la date de verrouillage
    if (evaluation.verrouillee) {
        evaluation.dateVerrouillage = new Date().toISOString();
    } else {
        delete evaluation.dateVerrouillage;
    }

    // Journal de bord — verrouillage/déverrouillage
    if (typeof Journal !== 'undefined') {
        Journal.ajouterEntree(evaluation,
            evaluation.verrouillee ? Journal.ACTIONS.VERROUILLAGE : Journal.ACTIONS.DEVERROUILLAGE,
            {});
    }

    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);


    // Mettre à jour le cadenas dans le DOM immédiatement
    const cadenasElement = document.getElementById(`cadenas-liste-${evaluationId}`);
    if (cadenasElement) {
        cadenasElement.textContent = evaluation.verrouillee ? '🔒' : '🔓';
        cadenasElement.title = evaluation.verrouillee ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller';
    }

    // Recharger le tableau
    chargerDonneesEvaluations();

    // Rafraîchir le profil étudiant si affiché (pour mettre à jour les autres éléments)
    if (typeof afficherProfilComplet === 'function' && window.profilActuelDA) {
        setTimeout(() => afficherProfilComplet(window.profilActuelDA), 100);
    }
}

// ============================================
// SYSTÈME DE TRI
// ============================================

/**
 * Récupère les indices A-C-P-R pour un étudiant
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object} - Objet avec {A, C, P, R}
 */
function obtenirIndicesEtudiant(da) {
    // Récupérer les indices selon la pratique active
    const pratiqueIdIndices = typeof obtenirPratiqueActiveGroupeCours === 'function'
        ? obtenirPratiqueActiveGroupeCours()
        : (typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : 'sommative');
    const pratique = (pratiqueIdIndices === 'pan-standards' || pratiqueIdIndices === 'pan-maitrise') ? 'PAN' : 'SOM';

    // Indice A (Assiduité)
    const indicesAssiduiteDetailles = db.getSync(cle('indicesAssiduite'), {});
    const A = indicesAssiduiteDetailles[da]?.actuel?.indice ?? 0;

    // Indices C et P (Complétion et Performance)
    const indicesCP = db.getSync(cle('indicesCP'), {});
    const donneesCP = indicesCP[da]?.actuel?.[pratique] || {};
    const C = donneesCP.C ?? 0;
    const P = donneesCP.P ?? 0;

    // ========================================
    // DÉCOUPLAGE P/R : Utiliser P_recent pour le calcul de R si activé
    // ========================================
    let P_pourRisque = P;
    if (donneesCP.details && donneesCP.details.decouplerPR &&
        donneesCP.details.P_recent !== null && donneesCP.details.P_recent !== undefined) {
        P_pourRisque = donneesCP.details.P_recent; // Déjà en pourcentage
    }

    // ========================================
    // CALCUL DE R : Formule expérimentale basée sur P uniquement
    // Seuil critique à 65% : P < 65% → échec probable (données empiriques)
    // A et C servent de contexte diagnostique, pas de prédiction
    // ========================================
    let R;
    const P_decimal = P_pourRisque / 100;  // Convertir en proportion 0-1
    if (P_decimal < 0.65) {
        R = 1.0;  // 100% - Risque critique
    } else {
        R = Math.pow((1.0 - P_decimal) / 0.35, 3);  // Décroissance cubique
    }

    return { A, C, P, R };
}

/**
 * Trie un tableau de lignes selon le critère spécifié
 * @param {Array} lignes - Tableau de lignes à trier
 * @param {string} critere - Critère de tri (ex: 'nom-asc', 'assiduite-desc')
 * @returns {Array} - Tableau trié
 */
function trierLignes(lignes, critere) {
    if (!critere || critere === '') return lignes;

    // Créer une copie pour ne pas modifier l'original
    const lignesTriees = [...lignes];

    // Extraire le type et la direction
    const [type, direction] = critere.split('-');
    const asc = direction === 'asc';

    // Fonction de comparaison
    lignesTriees.sort((a, b) => {
        let valeurA, valeurB;

        switch (type) {
            case 'nom':
                // Tri alphabétique par nom
                valeurA = a.nom.toLowerCase();
                valeurB = b.nom.toLowerCase();
                return asc
                    ? valeurA.localeCompare(valeurB, 'fr')
                    : valeurB.localeCompare(valeurA, 'fr');

            case 'assiduite':
                // Tri par indice A
                const indicesA_A = obtenirIndicesEtudiant(a.da);
                const indicesA_B = obtenirIndicesEtudiant(b.da);
                valeurA = indicesA_A.A;
                valeurB = indicesA_B.A;
                break;

            case 'completion':
                // Tri par indice C
                const indicesC_A = obtenirIndicesEtudiant(a.da);
                const indicesC_B = obtenirIndicesEtudiant(b.da);
                valeurA = indicesC_A.C;
                valeurB = indicesC_B.C;
                break;

            case 'performance':
                // Tri par indice P
                const indicesP_A = obtenirIndicesEtudiant(a.da);
                const indicesP_B = obtenirIndicesEtudiant(b.da);
                valeurA = indicesP_A.P;
                valeurB = indicesP_B.P;
                break;

            case 'risque':
                // Tri par indice R
                const indicesR_A = obtenirIndicesEtudiant(a.da);
                const indicesR_B = obtenirIndicesEtudiant(b.da);
                valeurA = indicesR_A.R;
                valeurB = indicesR_B.R;
                break;

            default:
                return 0;
        }

        // Comparaison numérique
        if (asc) {
            return valeurA - valeurB;
        } else {
            return valeurB - valeurA;
        }
    });

    return lignesTriees;
}

/**
 * Fonction appelée par le select de tri
 * Recharge le tableau avec le tri appliqué
 */
function trierListeEvaluations() {
    // Charger les données selon le mode actif
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // Afficher le tableau avec tri appliqué
    afficherTableauEvaluations(evaluations, productions, etudiants);
}

// ============================================
// TRI PAR COLONNE CLIQUABLE
// ============================================

/**
 * Trie le tableau par une colonne donnée (au clic sur l'en-tête)
 * @param {string} colonne - Nom de la colonne à trier
 */
function trierTableauParColonne(colonne) {

    // Si on clique sur la même colonne, inverser l'ordre
    if (triEvaluationsActuel.colonne === colonne) {
        triEvaluationsActuel.ordre = triEvaluationsActuel.ordre === 'asc' ? 'desc' : 'asc';
    } else {
        triEvaluationsActuel.colonne = colonne;
        triEvaluationsActuel.ordre = 'asc';
    }

    // Mettre à jour les indicateurs visuels (flèches)
    mettreAJourIndicateursTri();

    // Réafficher le tableau avec le nouveau tri
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');
    afficherTableauEvaluations(evaluations, productions, etudiants);
}

/**
 * Met à jour les indicateurs visuels de tri (flèches ↑↓↕)
 */
function mettreAJourIndicateursTri() {
    // Réinitialiser tous les indicateurs
    ['da', 'nom', 'prenom', 'production', 'jetons', 'niveau', 'niveauIDME', 'note'].forEach(col => {
        const elem = document.getElementById(`tri-${col}`);
        if (elem) elem.textContent = '↕';
    });

    // Mettre à jour l'indicateur actif
    const elemActif = document.getElementById(`tri-${triEvaluationsActuel.colonne}`);
    if (elemActif) {
        elemActif.textContent = triEvaluationsActuel.ordre === 'asc' ? '↑' : '↓';
    }
}

/**
 * Trie un tableau de lignes selon la colonne et l'ordre actuel
 * @param {Array} lignes - Tableau de lignes à trier
 * @returns {Array} - Tableau trié
 */
function trierLignesParColonne(lignes) {
    if (!lignes || lignes.length === 0) return lignes;

    // Créer une copie pour ne pas modifier l'original
    const lignesTriees = [...lignes];
    const asc = triEvaluationsActuel.ordre === 'asc';

    // Fonction de comparaison
    lignesTriees.sort((a, b) => {
        let valeurA, valeurB;

        switch (triEvaluationsActuel.colonne) {
            case 'da':
                // ✅ NOUVEAU (29 déc 2025): Utiliser daAffichage pour anonymisation
                valeurA = (a.daAffichage || a.da || '').toString();
                valeurB = (b.daAffichage || b.da || '').toString();
                return asc
                    ? valeurA.localeCompare(valeurB)
                    : valeurB.localeCompare(valeurA);

            case 'nom':
                valeurA = (a.nom || '').toLowerCase();
                valeurB = (b.nom || '').toLowerCase();
                return asc
                    ? valeurA.localeCompare(valeurB, 'fr')
                    : valeurB.localeCompare(valeurA, 'fr');

            case 'prenom':
                valeurA = (a.prenom || '').toLowerCase();
                valeurB = (b.prenom || '').toLowerCase();
                return asc
                    ? valeurA.localeCompare(valeurB, 'fr')
                    : valeurB.localeCompare(valeurA, 'fr');

            case 'production':
                valeurA = (a.productionNom || '').toLowerCase();
                valeurB = (b.productionNom || '').toLowerCase();
                return asc
                    ? valeurA.localeCompare(valeurB, 'fr')
                    : valeurB.localeCompare(valeurA, 'fr');

            case 'jetons':
                // Ordre: vide (0), délai (1), reprise (2), remplacée (3), non-recevable (4)
                const ordreJeton = {
                    '': 0,
                    'delai': 1,
                    'nouvelle-reprise': 2,
                    'originale-reprise': 3,
                    'plagiat': 4,
                    'ia': 4,
                    'soupcon': 4
                };
                const jetonA = ordreJeton[a.badgeType || ''] ?? 0;
                const jetonB = ordreJeton[b.badgeType || ''] ?? 0;
                return asc ? jetonA - jetonB : jetonB - jetonA;

            case 'niveau':
                // Tri par statut workflow (non-recu → recu → importe → annote → evalue → remis)
                const numA = obtenirOrdreStatut(a.statutWorkflow);
                const numB = obtenirOrdreStatut(b.statutWorkflow);
                return asc ? numA - numB : numB - numA;

            case 'niveauIDME':
                const ordreIDME = { 'I': 1, 'D': 2, 'M': 3, 'E': 4, '-': 5 };
                const idmeA = ordreIDME[a.niveauFinal] ?? 5;
                const idmeB = ordreIDME[b.niveauFinal] ?? 5;
                return asc ? idmeA - idmeB : idmeB - idmeA;

            case 'note':
                valeurA = a.noteChiffree ?? -1;
                valeurB = b.noteChiffree ?? -1;
                return asc ? valeurA - valeurB : valeurB - valeurA;

            default:
                return 0;
        }
    });

    return lignesTriees;
}

// ============================================
// SÉLECTEUR DE COLONNES VISIBLES
// ============================================

const colonneIndexMap = {
    'da': 1,
    'nom': 2,
    'prenom': 3,
    'production': 4,
    'jeton': 5,
    'statut': 6,
    'niveau': 7,
    'note': 8
};

function toggleColonneEval(checkbox) {
    const colonne = checkbox.getAttribute('data-colonne');
    const index = colonneIndexMap[colonne];
    if (!index) return;

    const tableau = document.querySelector('#conteneur-tableau-evaluations .tableau');
    if (!tableau) return;

    const cellules = tableau.querySelectorAll(`th:nth-child(${index}), td:nth-child(${index})`);
    cellules.forEach(cell => {
        if (checkbox.checked) {
            cell.classList.remove('u-hide');
        } else {
            cell.classList.add('u-hide');
        }
    });

    // Persister les préférences
    sauvegarderPreferencesColonnes();

    // Revérifier le débordement
    setTimeout(verifierDebordementTableau, 50);
}

function sauvegarderPreferencesColonnes() {
    const selecteur = document.getElementById('eval-colonnes-selecteur');
    if (!selecteur) return;
    const prefs = {};
    selecteur.querySelectorAll('input[data-colonne]').forEach(cb => {
        prefs[cb.getAttribute('data-colonne')] = cb.checked;
    });
    sessionStorage.setItem('eval-colonnes-visibles', JSON.stringify(prefs));
}

function restaurerPreferencesColonnes() {
    const raw = sessionStorage.getItem('eval-colonnes-visibles');
    if (!raw) return;
    try {
        const prefs = JSON.parse(raw);
        const selecteur = document.getElementById('eval-colonnes-selecteur');
        if (!selecteur) return;
        Object.keys(prefs).forEach(colonne => {
            const cb = selecteur.querySelector(`input[data-colonne="${colonne}"]`);
            if (cb) {
                cb.checked = prefs[colonne];
                if (!prefs[colonne]) {
                    toggleColonneEval(cb);
                }
            }
        });
    } catch (e) { console.warn('[ListeEval] column prefs corrupted, using defaults:', e.message || e); }
}

/**
 * Vérifie si le tableau déborde horizontalement et affiche un message le cas échéant.
 * Appelée après chaque rendu du tableau et après chaque toggle de colonne.
 */
function verifierDebordementTableau() {
    var conteneur = document.getElementById('conteneur-tableau-evaluations');
    if (!conteneur) return;

    // Chercher ou créer le message
    var msgId = 'eval-msg-debordement';
    var msg = document.getElementById(msgId);

    var deborde = conteneur.scrollWidth > conteneur.clientWidth + 2; // marge 2px

    if (deborde) {
        if (!msg) {
            msg = document.createElement('div');
            msg.id = msgId;
            msg.className = 'eval-msg-debordement';
            msg.textContent = 'Le tableau dépasse l\u2019écran \u2014 décoche des colonnes ci-dessus pour ajuster la vue.';
            // Insérer juste avant le conteneur tableau
            conteneur.parentNode.insertBefore(msg, conteneur);
        }
        msg.classList.remove('u-hide');
    } else if (msg) {
        msg.classList.add('u-hide');
    }
}

// ============================================
// CORBEILLE FICHIERS
// ============================================

let vueCorbeilleActive = false;

/**
 * Met à jour le bouton corbeille dans la zone de filtres
 */
function mettreAJourBoutonCorbeille() {
    if (typeof travauxStockage === 'undefined') return;

    const corbeille = travauxStockage.obtenirCorbeille();
    const nb = corbeille.length;
    let btn = document.getElementById('btn-corbeille-eval');

    if (nb === 0) {
        if (btn) btn.classList.add('u-hide');
        if (vueCorbeilleActive) {
            vueCorbeilleActive = false;
            appliquerFiltres();
        }
        return;
    }

    if (!btn) {
        // Créer le bouton à côté du bouton Réinitialiser
        const zoneFiltres = document.querySelector('#evaluations-liste .carte-grise-mb20 .grid-auto-180');
        if (!zoneFiltres) return;
        const div = document.createElement('div');
        div.className = 'groupe-form';
        div.style.cssText = 'display: flex; align-items: flex-end;';
        div.innerHTML = `<button class="btn btn-secondaire" id="btn-corbeille-eval" data-action="basculerVueCorbeille"></button>`;
        zoneFiltres.appendChild(div);
        btn = document.getElementById('btn-corbeille-eval');
    }

    btn.textContent = vueCorbeilleActive ? 'Retour à la liste' : `Corbeille (${nb})`;
    btn.classList.remove('u-hide');
}

/**
 * Bascule entre la vue normale et la vue corbeille
 */
function basculerVueCorbeille() {
    vueCorbeilleActive = !vueCorbeilleActive;
    mettreAJourBoutonCorbeille();

    if (vueCorbeilleActive) {
        afficherVueCorbeille();
    } else {
        appliquerFiltres();
    }
}

/**
 * Affiche le contenu de la corbeille dans le tableau principal
 */
function afficherVueCorbeille() {
    if (typeof travauxStockage === 'undefined') return;

    const corbeille = travauxStockage.obtenirCorbeille();
    const corpsTableau = document.getElementById('corps-tableau-evaluations');
    const conteneurTableau = document.getElementById('conteneur-tableau-evaluations');
    const messageAucunResultat = document.getElementById('message-aucun-resultat');
    const compteur = document.getElementById('compteur-evaluations');
    const zoneChargement = document.getElementById('zone-chargement-evaluations');

    if (!corpsTableau) return;

    if (zoneChargement) zoneChargement.classList.add('u-hide');

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    if (corbeille.length === 0) {
        conteneurTableau.classList.add('u-hide');
        if (messageAucunResultat) {
            messageAucunResultat.classList.remove('u-hide');
            messageAucunResultat.textContent = 'La corbeille est vide.';
        }
        if (compteur) compteur.textContent = 'Corbeille vide';
        return;
    }

    if (messageAucunResultat) messageAucunResultat.classList.add('u-hide');
    conteneurTableau.classList.remove('u-hide');

    if (compteur) compteur.textContent = `Corbeille — ${corbeille.length} fichier(s)`;

    // Masquer la moyenne et les productions
    const elemMoyenne = document.getElementById('moyenne-evaluations');
    if (elemMoyenne) elemMoyenne.textContent = '';
    const elemNbProductions = document.getElementById('nb-productions');
    if (elemNbProductions) elemNbProductions.textContent = '';

    // En-tête corbeille + bouton vider
    let html = `<tr><td colspan="9" style="padding: 10px 12px; background: var(--surface-alt);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.85em; color: var(--texte-secondaire);">Les fichiers sont supprimés automatiquement après 30 jours.</span>
            <button class="btn btn-danger btn-sm" data-action="viderTouteCorbeille">Vider la corbeille</button>
        </div>
    </td></tr>`;

    for (const fichier of corbeille) {
        const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
        const nomEtudiant = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : fichier.etudiantDA;
        const production = productions.find(p => p.id === fichier.productionId);
        const nomProduction = production ? production.nom : (fichier.productionId || '—');
        const nomFichier = fichier.nomFichier || fichier.id;

        const dateSup = new Date(fichier.dateSuppression);
        const dateAffichee = dateSup.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });

        // Calculer les jours restants avant expiration
        const msRestants = (dateSup.getTime() + 30 * 24 * 60 * 60 * 1000) - Date.now();
        const joursRestants = Math.max(0, Math.ceil(msRestants / (24 * 60 * 60 * 1000)));

        html += `<tr>
            <td class="td-left" colspan="2">${echapperHtml(nomEtudiant)}</td>
            <td class="td-left">${echapperHtml(nomFichier)}</td>
            <td class="td-left">${echapperHtml(nomProduction)}</td>
            <td class="td-center">${dateAffichee}</td>
            <td class="td-center">${joursRestants} jour(s)</td>
            <td class="td-center" colspan="3">
                <button class="btn btn-secondaire btn-sm" data-action="restaurerFichierCorbeille" data-param="${fichier.id}">Restaurer</button>
                <button class="btn btn-danger btn-sm" data-action="supprimerFichierDefinitivement" data-param="${fichier.id}">Supprimer</button>
            </td>
        </tr>`;
    }

    corpsTableau.innerHTML = html;
}

/**
 * Restaure un fichier depuis la corbeille
 */
function restaurerFichierCorbeille(id) {
    if (typeof travauxStockage === 'undefined') return;

    travauxStockage.restaurerDeCorbeille(id);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Fichier restauré.');
    }

    mettreAJourBoutonCorbeille();
    if (vueCorbeilleActive) {
        afficherVueCorbeille();
    } else {
        appliquerFiltres();
    }
}

/**
 * Supprime définitivement un fichier de la corbeille avec confirmation
 */
function supprimerFichierDefinitivement(id) {
    if (typeof travauxStockage === 'undefined') return;

    const existante = document.getElementById('supprimer-definitif-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'supprimer-definitif-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>
            <h3 class="modal-titre">Supprimer définitivement ?</h3>
            <p style="margin: 8px 0 16px 0; font-size: 0.9em;">
                Le fichier sera supprimé de façon permanente.
            </p>
            <p style="margin: 0 0 16px 0; font-size: 0.85em; color: var(--attention);">
                Cette action est irréversible.
            </p>
            <div class="modal-actions">
                <button class="btn btn-danger" id="supprimer-definitif-btn-confirmer">Supprimer définitivement</button>
                <button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('supprimer-definitif-btn-confirmer').onclick = async () => {
        // ✅ CORRIGÉ (16 mars 2026) : supprimer aussi les évaluations liées au fichier
        var corbeille = travauxStockage.obtenirCorbeille();
        var fichier = corbeille.find(function(f) { return f.id === id; });

        await travauxStockage.supprimerDefinitivement(id);

        // Nettoyer les évaluations liées (par etudiantDA + productionId)
        // ACCÈS DIRECT — read-modify-write : doit lire TOUTES les évaluations pour réécrire sans perte
        if (fichier && fichier.etudiantDA && fichier.productionId) {
            var evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
            var avant = evaluations.length;
            evaluations = evaluations.filter(function(ev) {
                return !(ev.etudiantDA === fichier.etudiantDA && ev.productionId === fichier.productionId);
            });
            if (evaluations.length < avant) {
                db.setSync(cle('evaluationsSauvegardees'), evaluations);
                // Tier 6.3 : Invalider les caches de moyennes
                window._moyennesQualifies = null;
                window._moyennesToutes = null;
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }
            }
        }

        overlay.remove();
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Fichier et évaluation supprimés définitivement.');
        }
        mettreAJourBoutonCorbeille();
        if (vueCorbeilleActive) {
            afficherVueCorbeille();
        } else {
            appliquerFiltres();
        }
    };
}

/**
 * Vide entièrement la corbeille avec confirmation
 */
function viderTouteCorbeille() {
    if (typeof travauxStockage === 'undefined') return;

    const corbeille = travauxStockage.obtenirCorbeille();
    if (corbeille.length === 0) return;

    const existante = document.getElementById('vider-corbeille-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vider-corbeille-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>
            <h3 class="modal-titre">Vider la corbeille ?</h3>
            <p style="margin: 8px 0 16px 0; font-size: 0.9em;">
                Supprimer définitivement les <strong>${corbeille.length}</strong> fichier(s) de la corbeille ?
            </p>
            <p style="margin: 0 0 16px 0; font-size: 0.85em; color: var(--attention);">
                Cette action est irréversible.
            </p>
            <div class="modal-actions">
                <button class="btn btn-danger" id="vider-corbeille-btn-confirmer">Tout supprimer</button>
                <button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('vider-corbeille-btn-confirmer').onclick = async () => {
        // ✅ CORRIGÉ (16 mars 2026) : supprimer aussi les évaluations liées aux fichiers de la corbeille
        var fichiersCorbeille = travauxStockage.obtenirCorbeille();
        await travauxStockage.viderCorbeille();

        // Nettoyer les évaluations liées à chaque fichier supprimé
        // ACCÈS DIRECT — read-modify-write : doit lire TOUTES les évaluations pour réécrire sans perte
        if (fichiersCorbeille.length > 0) {
            var evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
            var avant = evaluations.length;
            evaluations = evaluations.filter(function(ev) {
                return !fichiersCorbeille.some(function(f) {
                    return f.etudiantDA && f.productionId &&
                           ev.etudiantDA === f.etudiantDA && ev.productionId === f.productionId;
                });
            });
            if (evaluations.length < avant) {
                db.setSync(cle('evaluationsSauvegardees'), evaluations);
                // Tier 6.3 : Invalider les caches de moyennes
                window._moyennesQualifies = null;
                window._moyennesToutes = null;
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }
            }
        }

        overlay.remove();
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Corbeille vidée.');
        }
        mettreAJourBoutonCorbeille();
        if (vueCorbeilleActive) {
            afficherVueCorbeille();
        } else {
            appliquerFiltres();
        }
    };
}

// ============================================
// EXPORT
// ============================================


// Rendre les fonctions accessibles globalement
window.initialiserListeEvaluations = initialiserListeEvaluations;
window.ouvrirCartouche = ouvrirCartouche;
window.consulterEvaluationDepuisListe = consulterEvaluationDepuisListe;
window.dupliquerEvaluation = dupliquerEvaluation;
window.supprimerEvaluation = supprimerEvaluation;
window.toggleVerrouillerEvaluation = toggleVerrouillerEvaluation;
window.modifierEvaluationRemplacee = modifierEvaluationRemplacee;
window.calculerEtSauvegarderIndiceCompletion = calculerEtSauvegarderIndiceCompletion;
window.trierListeEvaluations = trierListeEvaluations;
window.trierTableauParColonne = trierTableauParColonne;
window.rechargerFiltreProduction = rechargerFiltreProduction; // Pour mise à jour après duplication/modification de productions

// Alias pour compatibilité avec le HTML
window.appliquerFiltres = appliquerFiltres;
window.filtrerListeEvaluations = appliquerFiltres;
window.reinitialiserFiltresEval = reinitialiserFiltres;
window.rechercherEvaluations = rechercherEvaluations;

// Select d'actions et sélecteur de colonnes
window.executerActionEval = executerActionEval;
window.toggleColonneEval = toggleColonneEval;
window.ouvrirAnnotationDepuisListe = ouvrirAnnotationDepuisListe;
window.ouvrirEditeurDepuisListe = ouvrirEditeurDepuisListe;
window.associerProductionDepuisListe = associerProductionDepuisListe;
window.confirmerSuppressionFichier = confirmerSuppressionFichier;

// Corbeille
window.basculerVueCorbeille = basculerVueCorbeille;
window.restaurerFichierCorbeille = restaurerFichierCorbeille;
window.supprimerFichierDefinitivement = supprimerFichierDefinitivement;
window.viderTouteCorbeille = viderTouteCorbeille;


})();
