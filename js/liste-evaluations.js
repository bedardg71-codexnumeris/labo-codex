/**
 * ============================================
 * MODULE 16 : LISTE DES ÉVALUATIONS
 * ============================================
 * Gestion de l'affichage et filtrage des évaluations
 */

console.log('📦 Chargement du module liste-evaluations.js...');

// ============================================
// FONCTION UTILITAIRE
// ============================================

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 * @param {string} texte - Texte à échapper
 * @returns {string} - Texte échappé
 */
function echapperHtml(texte) {
    if (!texte) return '';
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
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
    console.log('Calcul des indices de complétion...');
    
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    
    // Structure de sortie
    const indices = {
        sommatif: {},
        alternatif: {},
        dateCalcul: new Date().toISOString()
    };
    
    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );
    
    // Calculer pour chaque étudiant
    etudiantsActifs.forEach(etudiant => {
        indices.sommatif[etudiant.da] = calculerCompletionSommative(etudiant.da);
        indices.alternatif[etudiant.da] = calculerCompletionAlternative(etudiant.da);
    });
    
    // Récupérer ou créer la structure indicesEvaluation
    let indicesEvaluation = JSON.parse(localStorage.getItem('indicesEvaluation') || '{}');
    indicesEvaluation.completion = indices;
    localStorage.setItem('indicesEvaluation', JSON.stringify(indicesEvaluation));
    
    console.log('✅ Indices de complétion sauvegardés');
    console.log('   Sommatif:', Object.keys(indices.sommatif).length, 'étudiants');
    console.log('   Alternatif:', Object.keys(indices.alternatif).length, 'étudiants');
    
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
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    
    // Productions à évaluer (exclure portfolio)
    const productionsAEvaluer = productions.filter(p => p.type !== 'portfolio');
    const totalAttendus = productionsAEvaluer.length;
    
    if (totalAttendus === 0) {
        console.warn('⚠️ Aucune production configurée');
        return 0;
    }
    
    // Compter les artefacts remis par cet étudiant
    const evalsEtudiant = evaluations.filter(e => e.etudiantDA === da);
    const nbRemis = evalsEtudiant.length;
    
    const indice = nbRemis / totalAttendus;
    
    console.log(`   Sommatif ${da}: ${nbRemis} / ${totalAttendus} artefacts = ${(indice * 100).toFixed(1)}%`);
    
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
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    
    // Obtenir le nombre d'artefacts depuis les réglages
    const nombreArtefacts = config.configPAN?.nombreArtefacts || 3;
    
    console.log(`   Calcul alternatif : ${nombreArtefacts} meilleurs artefacts`);
    
    // Récupérer les évaluations de cet étudiant
    const evalsEtudiant = evaluations.filter(e => e.etudiantDA === da);
    
    if (evalsEtudiant.length === 0) {
        console.log(`   Alternatif ${da}: Aucune évaluation, retour 0%`);
        return 0;
    }
    
    // Trier par note décroissante et prendre les N meilleurs
    const meilleurs = evalsEtudiant
        .filter(e => e.noteFinale !== null && e.noteFinale !== undefined)
        .sort((a, b) => (b.noteFinale || 0) - (a.noteFinale || 0))
        .slice(0, nombreArtefacts);
    
    const indice = meilleurs.length / nombreArtefacts;
    
    console.log(`   Alternatif ${da}: ${meilleurs.length} / ${nombreArtefacts} meilleurs = ${(indice * 100).toFixed(1)}%`);
    
    return Math.min(indice, 1);
}

/**
 * Initialise la page Liste des évaluations
 */
function initialiserListeEvaluations() {
    console.log('🔄 Initialisation de la liste des évaluations...');

    try {
        console.log('   Étape 1: Calcul des indices de complétion...');
        // 🆕 Calculer les indices de complétion
        calculerEtSauvegarderIndiceCompletion();
        console.log('   ✅ Indices calculés');

        console.log('   Étape 2: Chargement des données...');
        // Charger et afficher les données
        chargerDonneesEvaluations();
        console.log('   ✅ Données chargées');

        console.log('   Étape 3: Initialisation des événements...');
        // Initialiser les événements des filtres
        initialiserEvenementsFilres();
        console.log('   ✅ Événements initialisés');

        console.log('   Étape 4: Initialisation du bouton réinitialiser...');
        // Initialiser le bouton de réinitialisation
        const btnReinit = document.getElementById('btn-reinitialiser-filtres');
        if (btnReinit) {
            btnReinit.addEventListener('click', reinitialiserFiltres);
        }
        console.log('   ✅ Bouton initialisé');

        console.log('✅ Liste des évaluations initialisée');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la liste des évaluations:', error);
        console.error('Stack trace:', error.stack);

        // Afficher un message d'erreur à l'utilisateur
        const conteneur = document.getElementById('zone-chargement-evaluations');
        if (conteneur) {
            conteneur.innerHTML = `
                <p style="color: #d32f2f;">
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
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');

    // Extraire les groupes uniques depuis les étudiants
    const groupes = etudiants.length > 0
        ? [...new Set(etudiants.map(e => e.groupe))].sort().map(g => ({ numero: g }))
        : [];

    console.log(`Donnees chargees: ${evaluations.length} evaluations, ${productions.length} productions, ${etudiants.length} etudiants`);

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
    // Filtre Groupe
    const selectGroupe = document.getElementById('filtre-groupe-eval');
    if (selectGroupe) {
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';
        groupes.forEach(groupe => {
            const option = document.createElement('option');
            option.value = groupe.numero;
            option.textContent = `Groupe ${groupe.numero}`;
            selectGroupe.appendChild(option);
        });
    }

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
    const pratiqueNotation = JSON.parse(localStorage.getItem('pratiqueNotation') || '{}');

    if (selectNote) {
        selectNote.innerHTML = '<option value="">Toutes les notes</option>';

        if (pratiqueNotation.pratique === 'alternative' && pratiqueNotation.typePAN === 'maitrise') {
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

    localStorage.setItem('filtresListeEvaluations', JSON.stringify(etatFiltres));
    console.log('💾 Filtres sauvegardés:', etatFiltres);
}

/**
 * Restaure l'état des filtres depuis localStorage
 */
function restaurerEtatFiltres() {
    const etatSauvegarde = localStorage.getItem('filtresListeEvaluations');

    if (!etatSauvegarde) {
        console.log('📂 Aucun filtre sauvegardé à restaurer');
        return;
    }

    try {
        const etat = JSON.parse(etatSauvegarde);
        console.log('📂 Restauration des filtres:', etat);

        // Restaurer chaque filtre
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

        console.log('✅ Filtres restaurés avec succès');
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
    localStorage.removeItem('filtresListeEvaluations');
    console.log('🗑️ Filtres sauvegardés supprimés');

    appliquerFiltres();
}

// ============================================
// AFFICHAGE DU TABLEAU
// ============================================

/**
 * Affiche le tableau des évaluations avec filtrage
 */
function afficherTableauEvaluations(evaluations, productions, etudiants) {
    console.log('📊 Affichage du tableau des évaluations...');

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
        zoneChargement.style.display = 'none';
        console.log('✅ Zone de chargement masquée');
    }

    // Construire la liste complète : évaluations existantes + non évaluées
    const lignes = construireLignesEvaluations(evaluations, productions, etudiants);
    console.log(`📝 ${lignes.length} ligne(s) construite(s)`);

    // Appliquer les filtres
    let lignesFiltrees = appliquerFiltresSurLignes(lignes);
    console.log(`🔍 ${lignesFiltrees.length} ligne(s) après filtres`);

    // Appliquer la recherche par mot-clé
    lignesFiltrees = appliquerRechercheTexte(lignesFiltrees);
    console.log(`🔎 ${lignesFiltrees.length} ligne(s) après recherche`);

    // Appliquer le tri par colonne cliquable
    lignesFiltrees = trierLignesParColonne(lignesFiltrees);
    console.log(`🔄 Tri par colonne: ${triEvaluationsActuel.colonne} (${triEvaluationsActuel.ordre})`);

    // Mettre à jour les indicateurs de tri visuels
    mettreAJourIndicateursTri();

    // Afficher les résultats
    if (lignesFiltrees.length === 0) {
        conteneurTableau.style.display = 'none';
        if (messageAucunResultat) messageAucunResultat.style.display = 'block';
        if (compteur) compteur.textContent = '0 évaluation(s)';
        console.log('📭 Aucune évaluation à afficher');
    } else {
        if (messageAucunResultat) messageAucunResultat.style.display = 'none';
        conteneurTableau.style.display = 'block';

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
        // Afficher seulement le nombre d'évaluations recevables (qui comptent dans la moyenne)
        if (compteur) {
            compteur.textContent = `${evaluationsRecevables.length} évaluation(s)`;
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

        const logMoyenne = moyenneAffichee !== null ? ` | Moyenne: ${moyenneAffichee.toFixed(1)}%` : '';
        console.log(`✅ ${lignesFiltrees.length} évaluation(s) affichée(s)${logMoyenne}`);
    }
}

/**
 * Construit la liste complète des lignes (évaluations + non évaluées)
 */
function construireLignesEvaluations(evaluations, productions, etudiants) {
    const lignes = [];
    const pratiqueNotation = JSON.parse(localStorage.getItem('pratiqueNotation') || '{}');

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
                    const aJetonDelai = evaluation.jetonDelaiApplique && !evaluation.repriseDeId;

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
                    } else if (estNouvelleReprise) {
                        // La nouvelle évaluation de reprise
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
                    lignes.push({
                        da: etudiant.da,
                        nom: etudiant.nom || '',
                        prenom: etudiant.prenom || '',
                        groupe: etudiant.groupe,
                        productionId: production.id,
                        productionNom: productionNomComplet,
                        grilleNom: evaluation.grilleNom || '-',
                        cartoucheId: evaluation.cartoucheId || null,
                        cartoucheNom: obtenirNomCartouche(evaluation.grilleId, evaluation.cartoucheId),
                        note: obtenirNoteAffichee(evaluation, pratiqueNotation),
                        noteChiffree: evaluation.noteFinale || null,
                        niveauFinal: evaluation.niveauFinal || '-',
                        statut: statut,
                        statutIntegrite: statutIntegrite,
                        evaluationId: evaluation.id,
                        verrouille: evaluation.verrouillee || false,
                        remplacee: estOriginaleRemplacee,
                        badgeType: badgeType
                    });
                });
            } else {
                // Formater le nom de production avec description pour les non évaluées aussi
                let productionNomComplet = production.titre;
                if (production.description && production.description.trim() !== '') {
                    productionNomComplet = `${production.titre} - ${production.description}`;
                }

                // Évaluation manquante
                lignes.push({
                    da: etudiant.da,
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
                    evaluationId: null,
                    verrouille: false
                });
            }
        });
    });

    return lignes;
}

/**
 * Obtient le nom de la cartouche
 */
function obtenirNomCartouche(grilleId, cartoucheId) {
    if (!grilleId || !cartoucheId) return '-';

    const cartouches = JSON.parse(localStorage.getItem(`cartouches_${grilleId}`) || '[]');
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    return cartouche ? cartouche.nom : '-';
}

/**
 * Obtient la note affichée selon la pratique de notation
 */
function obtenirNoteAffichee(evaluation, pratiqueNotation) {
    if (pratiqueNotation.pratique === 'alternative' && pratiqueNotation.typePAN === 'maitrise') {
        return evaluation.niveauFinal || '-';
    } else {
        return evaluation.noteFinale ? `${evaluation.noteFinale}%` : '-';
    }
}

/**
 * Applique les filtres et recharge le tableau
 */
function appliquerFiltres() {
    // Charger les données selon le mode actif
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
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

        // Filtre Statut
        if (filtreStatut === 'actives') {
            // "Actives" exclut les évaluations remplacées par jetons
            if (ligne.statut === 'remplacee') return false;
        } else if (filtreStatut === 'jeton-delai') {
            // Afficher seulement les évaluations avec jeton de délai
            if (ligne.badgeType !== 'delai') return false;
        } else if (filtreStatut === 'jeton-reprise') {
            // Afficher seulement les nouvelles reprises (pas les originales remplacées)
            if (ligne.badgeType !== 'nouvelle-reprise') return false;
        } else if (filtreStatut === 'tous-jetons') {
            // Afficher toutes les évaluations avec jetons (délai + reprises nouvelles, exclure originales)
            if (!['delai', 'nouvelle-reprise'].includes(ligne.badgeType)) return false;
        } else if (filtreStatut === 'remplacees') {
            // Afficher seulement les évaluations originales remplacées
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
        const da = ligne.da.toString().toLowerCase();
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
    } else if (ligne.badgeType === 'nouvelle-reprise') {
        // Nouvelle de reprise : badge "Reprise"
        badgeJeton = ' <span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Reprise</span></span>';
    } else if (ligne.badgeType === 'delai') {
        // Délai : badge "Délai"
        badgeJeton = ' <span class="badge-jeton-delai-wrapper"><span class="badge-jeton-titre">Délai</span></span>';
    }

    // Afficher le niveau IDME
    let affichageNiveau;
    if (ligne.statut === 'non-recevable') {
        // Non recevable : afficher 0 ou --
        affichageNiveau = '<strong style="color: #999;">0</strong>';
    } else if ((ligne.statut === 'evalue' || ligne.statut === 'remplacee') && ligne.niveauFinal !== '-') {
        affichageNiveau = `<strong>${ligne.niveauFinal}</strong>`;
    } else {
        affichageNiveau = '<span class="badge-non-remis-wrapper"><span class="badge-jeton-titre">Non remis</span></span>';
    }

    // Afficher la note chiffrée (%)
    let affichageNoteChiffree;
    if (ligne.statut === 'non-recevable') {
        // Non recevable : afficher -- au lieu d'une note
        affichageNoteChiffree = '<strong style="color: #999;">--</strong>';
    } else if ((ligne.statut === 'evalue' || ligne.statut === 'remplacee') && ligne.noteChiffree !== null) {
        affichageNoteChiffree = `<strong>${ligne.noteChiffree}%</strong>`;
    } else {
        affichageNoteChiffree = '-';
    }

    // Choisir les boutons appropriés
    let boutons;
    if (ligne.statut === 'non-recevable') {
        boutons = genererBoutonsActionsNonRecevable(ligne);
    } else if (ligne.statut === 'remplacee') {
        boutons = genererBoutonsActionsRemplacee(ligne);
    } else if (ligne.statut === 'evalue') {
        boutons = genererBoutonsActionsEvalue(ligne);
    } else {
        boutons = genererBoutonsActionsNonEvalue(ligne);
    }

    return `
        <tr data-evaluation-id="${ligne.evaluationId || ''}" data-da="${ligne.da}" data-production-id="${ligne.productionId}"${classeRemplacee}>
            <td>${ligne.da}</td>
            <td>${echapperHtml(ligne.nom)}</td>
            <td>${echapperHtml(ligne.prenom)}</td>
            <td>${echapperHtml(ligne.productionNom)}</td>
            <td class="text-center">${badgeJeton}</td>
            <td class="text-center">${affichageNiveau}</td>
            <td class="text-center">${affichageNoteChiffree}</td>
            <td class="actions">${boutons}</td>
        </tr>
    `;
}

/**
 * Génère les boutons d'action pour une évaluation existante
 */
function genererBoutonsActionsEvalue(ligne) {
    const lectureSeule = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    if (lectureSeule) {
        return `<span style="color: #999; font-size: 0.85rem; font-style: italic;">Lecture seule</span>`;
    }

    const iconeVerrou = ligne.verrouille ? '🔒' : '🔓';
    const titreVerrou = ligne.verrouille ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller';

    return `
        <button class="btn btn-secondaire btn-compact" onclick="consulterEvaluationDepuisListe('${ligne.evaluationId}')" title="Consulter cette évaluation">
            Consulter
        </button>
        <button class="btn btn-modifier btn-compact" id="cadenas-liste-${ligne.evaluationId}" onclick="toggleVerrouillerEvaluation('${ligne.evaluationId}')" title="${titreVerrou}">
            ${iconeVerrou}
        </button>
        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluation('${ligne.evaluationId}')" title="Supprimer cette évaluation">
            Supprimer
        </button>
    `;
}

/**
 * Génère les boutons d'action pour une évaluation remplacée par un jeton
 * (Consulter + Verrouillage + Supprimer)
 */
function genererBoutonsActionsRemplacee(ligne) {
    const lectureSeule = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    if (lectureSeule) {
        return `<span style="color: #999; font-size: 0.85rem; font-style: italic;">Lecture seule</span>`;
    }

    const iconeVerrou = ligne.verrouille ? '🔒' : '🔓';
    const titreVerrou = ligne.verrouille ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller';

    return `
        <button class="btn btn-secondaire btn-compact" onclick="consulterEvaluationDepuisListe('${ligne.evaluationId}')" title="Consulter cette évaluation remplacée">
            Consulter
        </button>
        <button class="btn btn-modifier btn-compact" id="cadenas-liste-${ligne.evaluationId}" onclick="toggleVerrouillerEvaluation('${ligne.evaluationId}')" title="${titreVerrou}">
            ${iconeVerrou}
        </button>
        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluation('${ligne.evaluationId}')" title="Supprimer cette évaluation">
            Supprimer
        </button>
    `;
}

/**
 * Génère les boutons d'action pour une évaluation non recevable (plagiat ou IA)
 */
function genererBoutonsActionsNonRecevable(ligne) {
    const lectureSeule = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    if (lectureSeule) {
        return `<span style="color: #999; font-size: 0.85rem; font-style: italic;">Lecture seule</span>`;
    }

    const iconeVerrou = ligne.verrouille ? '🔒' : '🔓';
    const titreVerrou = ligne.verrouille ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller';

    return `
        <button class="btn btn-secondaire btn-compact" onclick="consulterEvaluationDepuisListe('${ligne.evaluationId}')" title="Consulter (lecture seule)">
            Consulter
        </button>
        <button class="btn btn-modifier btn-compact" id="cadenas-liste-${ligne.evaluationId}" onclick="toggleVerrouillerEvaluation('${ligne.evaluationId}')" title="${titreVerrou}">
            ${iconeVerrou}
        </button>
        <button class="btn btn-supprimer btn-compact" onclick="supprimerEvaluation('${ligne.evaluationId}')" title="Supprimer cette évaluation">
            Supprimer
        </button>
    `;
}

/**
 * Génère les boutons d'action pour une évaluation non faite
 */
function genererBoutonsActionsNonEvalue(ligne) {
    return `
        <button class="btn btn-confirmer btn-compact" onclick="consulterEvaluationDepuisListe('${ligne.da}', '${ligne.productionId}')" title="Évaluer">
            Évaluer
        </button>
    `;
}

// ============================================
// ACTIONS SUR LES ÉVALUATIONS
// ============================================

/**
 * Attache les événements aux boutons d'action
 */
function attacherEvenementsActions() {
    // Les événements sont gérés via onclick dans le HTML pour simplicité
    console.log('✅ Événements des actions attachés');
}

/**
 * Ouvre la page de la cartouche dans les réglages
 */
function ouvrirCartouche(cartoucheId, productionId) {
    // Naviguer vers Réglages › Rétroaction
    // TODO: Implémenter la navigation et la pré-sélection de la cartouche
    console.log(`🔍 Ouverture de la cartouche ${cartoucheId} pour la production ${productionId}`);
    alert('Navigation vers la cartouche à implémenter');
}

/**
 * Ouvre la page d'évaluation pour modifier/créer une évaluation
 * RENOMMÉ consulterEvaluationDepuisListe pour éviter conflit avec evaluation.js
 */
function consulterEvaluationDepuisListe(evaluationId) {
    console.log(`🔍 Consultation de l'évaluation ID:`, evaluationId);

    // Charger directement l'évaluation par son ID exact
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        alert('Évaluation non trouvée');
        console.error('❌ Évaluation introuvable, ID:', evaluationId);
        return;
    }

    console.log(`✅ Évaluation trouvée:`, evaluation.id);
    console.log('   - DA:', evaluation.etudiantDA);
    console.log('   - Production:', evaluation.productionId);
    console.log('   - repriseDeId:', evaluation.repriseDeId);
    console.log('   - jetonDelaiApplique:', evaluation.jetonDelaiApplique);
    console.log('   - remplaceeParId:', evaluation.remplaceeParId);

    // Naviguer vers la section Évaluations › Évaluer
    afficherSection('evaluations');

    // Attendre que la section soit chargée, puis appeler la fonction d'évaluation
    setTimeout(() => {
        // Appeler la fonction du module evaluation.js (qui attend un evaluationId)
        if (typeof window.modifierEvaluationParId === 'function') {
            window.modifierEvaluationParId(evaluation.id);
        } else {
            console.error('❌ Fonction modifierEvaluationParId non disponible');
            alert('Erreur: Module d\'évaluation non chargé correctement');
        }
    }, 200);
}

/**
 * Duplique une évaluation pour un autre élève
 */
function dupliquerEvaluation(evaluationId) {
    // TODO: Implémenter la duplication
    console.log(`Duplication de l'évaluation ${evaluationId}`);

    if (!confirm('Voulez-vous dupliquer cette évaluation pour un autre élève ?')) {
        return;
    }

    alert('Duplication à implémenter: sélection de l\'élève cible');
}

/**
 * Supprime une évaluation
 */
function supprimerEvaluation(evaluationId) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(ev => ev.id === evaluationId);

    // Vérifier si l'évaluation est verrouillée
    if (evaluation && evaluation.verrouillee) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Suppression impossible', 'Cette évaluation est verrouillée. Déverrouillez-la d\'abord.');
        } else {
            alert('Suppression impossible : cette évaluation est verrouillée. Déverrouillez-la d\'abord.');
        }
        return;
    }

    if (!confirm('Voulez-vous vraiment supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    const evaluationsFiltered = evaluations.filter(ev => ev.id !== evaluationId);

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluationsFiltered)) {
        afficherNotificationErreur('Erreur', 'Impossible de supprimer en mode anonymisation');
        return;
    }

    console.log(`Évaluation ${evaluationId} supprimée`);

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
 * Verrouille/Déverrouille une évaluation
 */
function toggleVerrouillerEvaluation(evaluationId) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
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

    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

    console.log(`🔒 Évaluation ${evaluationId} ${evaluation.verrouillee ? 'verrouillée' : 'déverrouillée'}`);

    // Mettre à jour le cadenas dans le DOM immédiatement
    const cadenasElement = document.getElementById(`cadenas-liste-${evaluationId}`);
    if (cadenasElement) {
        cadenasElement.textContent = evaluation.verrouillee ? '🔒' : '🔓';
        cadenasElement.title = evaluation.verrouillee ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller';
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
    const pratiqueNotation = JSON.parse(localStorage.getItem('pratiqueNotation') || '{}');
    const pratique = pratiqueNotation.pratique === 'alternative' ? 'PAN' : 'SOM';

    // Indice A (Assiduité)
    const indicesAssiduiteDetailles = JSON.parse(localStorage.getItem('indicesAssiduiteDetailles') || '{}');
    const A = indicesAssiduiteDetailles[da]?.actuel?.indice ?? 0;

    // Indices C et P (Complétion et Performance)
    const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');
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
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
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
    console.log(`📊 Tri par colonne: ${colonne}`);

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
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');
    afficherTableauEvaluations(evaluations, productions, etudiants);
}

/**
 * Met à jour les indicateurs visuels de tri (flèches ↑↓↕)
 */
function mettreAJourIndicateursTri() {
    // Réinitialiser tous les indicateurs
    ['da', 'nom', 'prenom', 'production', 'jetons', 'niveau', 'note'].forEach(col => {
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
                valeurA = (a.da || '').toString();
                valeurB = (b.da || '').toString();
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
                valeurA = a.niveauFinal || '-';
                valeurB = b.niveauFinal || '-';
                // Ordre: -, I, D, M, E (ou 0)
                const ordreNiveau = { '-': 0, '0': 0, 'I': 1, 'D': 2, 'M': 3, 'E': 4 };
                const numA = ordreNiveau[valeurA] ?? 0;
                const numB = ordreNiveau[valeurB] ?? 0;
                return asc ? numA - numB : numB - numA;

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
// EXPORT
// ============================================

console.log('📤 Export des fonctions du module liste-evaluations.js...');

// Rendre les fonctions accessibles globalement
window.initialiserListeEvaluations = initialiserListeEvaluations;
window.ouvrirCartouche = ouvrirCartouche;
window.consulterEvaluationDepuisListe = consulterEvaluationDepuisListe;
window.dupliquerEvaluation = dupliquerEvaluation;
window.supprimerEvaluation = supprimerEvaluation;
window.toggleVerrouillerEvaluation = toggleVerrouillerEvaluation;
window.calculerEtSauvegarderIndiceCompletion = calculerEtSauvegarderIndiceCompletion;
window.trierListeEvaluations = trierListeEvaluations;
window.trierTableauParColonne = trierTableauParColonne;

// Alias pour compatibilité avec le HTML
window.appliquerFiltres = appliquerFiltres;
window.filtrerListeEvaluations = appliquerFiltres;
window.reinitialiserFiltresEval = reinitialiserFiltres;
window.rechercherEvaluations = rechercherEvaluations;

console.log('✅ Module liste-evaluations.js chargé - initialiserListeEvaluations disponible:', typeof window.initialiserListeEvaluations);