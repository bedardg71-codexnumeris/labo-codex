/**
 * ============================================
 * MODULE 16 : LISTE DES ÉVALUATIONS
 * ============================================
 * Gestion de l'affichage et filtrage des évaluations
 */

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
// INITIALISATION
// ============================================

/**
 * Initialise la page Liste des évaluations
 */
function initialiserListeEvaluations() {
    console.log('🔄 Initialisation de la liste des évaluations...');

    // Charger et afficher les données
    chargerDonneesEvaluations();

    // Initialiser les événements des filtres
    initialiserEvenementsFilres();

    // Initialiser le bouton de réinitialisation
    const btnReinit = document.getElementById('btn-reinitialiser-filtres');
    if (btnReinit) {
        btnReinit.addEventListener('click', reinitialiserFiltres);
    }
}

/**
 * Charge toutes les données nécessaires et affiche le tableau
 */
function chargerDonneesEvaluations() {
    // Charger les données selon le mode actif (géré automatiquement par le module 17)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    // Extraire les groupes uniques depuis les étudiants
    const groupes = [...new Set(etudiants.map(e => e.groupe))].sort().map(g => ({ numero: g }));

    console.log(`Donnees chargees: ${evaluations.length} evaluations, ${productions.length} productions, ${etudiants.length} etudiants`);

    // Générer les options des filtres
    genererOptionsFiltres(groupes, productions);

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

/**
 * Initialise les événements des filtres
 */
function initialiserEvenementsFilres() {
    const filtres = [
        'filtre-groupe-eval',
        'filtre-production-eval',
        'filtre-statut-eval',
        'filtre-note-eval'
    ];

    filtres.forEach(filtreId => {
        const filtre = document.getElementById(filtreId);
        if (filtre) {
            filtre.addEventListener('change', appliquerFiltres);
        }
    });
}

/**
 * Réinitialise tous les filtres
 */
function reinitialiserFiltres() {
    document.getElementById('filtre-groupe-eval').value = '';
    document.getElementById('filtre-production-eval').value = '';
    document.getElementById('filtre-statut-eval').value = '';
    document.getElementById('filtre-note-eval').value = '';

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

    if (!corpsTableau) return;

    // Masquer le chargement
    if (zoneChargement) zoneChargement.style.display = 'none';

    // Construire la liste complète : évaluations existantes + non évaluées
    const lignes = construireLignesEvaluations(evaluations, productions, etudiants);

    // Appliquer les filtres
    const lignesFiltrees = appliquerFiltresSurLignes(lignes);

    // Afficher les résultats
    if (lignesFiltrees.length === 0) {
        conteneurTableau.style.display = 'none';
        messageAucunResultat.style.display = 'block';
        if (compteur) compteur.textContent = '0 évaluation(s)';
    } else {
        messageAucunResultat.style.display = 'none';
        conteneurTableau.style.display = 'block';
        if (compteur) compteur.textContent = `${lignesFiltrees.length} évaluation(s)`;

        // Générer les lignes HTML
        corpsTableau.innerHTML = lignesFiltrees.map(ligne => genererLigneHTML(ligne)).join('');

        // Attacher les événements aux boutons d'action
        attacherEvenementsActions();
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
            // Chercher si une évaluation existe
            const evaluation = evaluations.find(ev =>
                ev.etudiantDA === etudiant.da && ev.productionId === production.id
            );

            if (evaluation) {
                // Évaluation existante
                lignes.push({
                    da: etudiant.da,
                    nom: etudiant.nom,
                    groupe: etudiant.groupe,
                    productionId: production.id,
                    productionNom: production.titre,
                    grilleNom: evaluation.grilleNom || '-',
                    cartoucheId: evaluation.cartoucheId || null,
                    cartoucheNom: obtenirNomCartouche(evaluation.grilleId, evaluation.cartoucheId),
                    note: obtenirNoteAffichee(evaluation, pratiqueNotation),
                    niveauFinal: evaluation.niveauFinal || '-',
                    statut: 'evalue',
                    evaluationId: evaluation.id,
                    verrouille: evaluation.verrouille || false
                });
            } else {
                // Évaluation manquante
                lignes.push({
                    da: etudiant.da,
                    nom: etudiant.nom,
                    groupe: etudiant.groupe,
                    productionId: production.id,
                    productionNom: production.titre,
                    grilleNom: '-',
                    cartoucheId: null,
                    cartoucheNom: '-',
                    note: '-',
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
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    // Afficher le tableau avec les filtres appliqués
    afficherTableauEvaluations(evaluations, productions, etudiants);
}

/**
 * Applique les filtres sur les lignes
 */
function appliquerFiltresSurLignes(lignes) {
    const filtreGroupe = document.getElementById('filtre-groupe-eval').value;
    const filtreProduction = document.getElementById('filtre-production-eval').value;
    const filtreStatut = document.getElementById('filtre-statut-eval').value;
    const filtreNote = document.getElementById('filtre-note-eval').value;

    return lignes.filter(ligne => {
        // Filtre Groupe
        if (filtreGroupe && ligne.groupe !== filtreGroupe) return false;

        // Filtre Production
        if (filtreProduction && ligne.productionId !== filtreProduction) return false;

        // Filtre Statut
        if (filtreStatut && ligne.statut !== filtreStatut) return false;

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

// ============================================
// GÉNÉRATION HTML
// ============================================

/**
 * Génère le HTML d'une ligne du tableau
 */
function genererLigneHTML(ligne) {
    const badgeStatut = ligne.statut === 'evalue'
        ? '<span style="background: #28a745; color: white; padding: 4px 10px; border-radius: 4px; font-weight: 500; font-size: 0.85rem; display: inline-block;">Évalué</span>'
        : '<span style="background: #6c757d; color: white; padding: 4px 10px; border-radius: 4px; font-weight: 500; font-size: 0.85rem; display: inline-block;">Non évalué</span>';

    const lienCartouche = ligne.cartoucheNom && ligne.cartoucheNom !== '-'
        ? `<button class="btn btn-secondaire" style="padding: 4px 10px; font-size: 0.85rem;" onclick="ouvrirCartouche('${ligne.cartoucheId}', '${ligne.productionId}'); return false;" title="Voir la cartouche">
               ${echapperHtml(ligne.cartoucheNom)}
           </button>`
        : '-';

    const boutons = ligne.statut === 'evalue'
        ? genererBoutonsActionsEvalue(ligne)
        : genererBoutonsActionsNonEvalue(ligne);

    return `
        <tr data-evaluation-id="${ligne.evaluationId || ''}" data-da="${ligne.da}" data-production-id="${ligne.productionId}">
            <td>${ligne.da}</td>
            <td>${echapperHtml(ligne.nom)}</td>
            <td>${echapperHtml(ligne.productionNom)}</td>
            <td>${echapperHtml(ligne.grilleNom)}</td>
            <td>${lienCartouche}</td>
            <td style="text-align: center;"><strong>${ligne.note}</strong></td>
            <td style="text-align: center;">${badgeStatut}</td>
            <td style="white-space: nowrap;">${boutons}</td>
        </tr>
    `;
}

/**
 * Génère les boutons d'action pour une évaluation existante
 */
function genererBoutonsActionsEvalue(ligne) {
    const lectureSeule = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();
    const disabled = lectureSeule ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

    const texteVerrouillage = ligne.verrouille ? 'Déverrouiller' : 'Verrouiller';

    if (lectureSeule) {
        return `<span style="color: #999; font-size: 0.85rem; font-style: italic;">Lecture seule</span>`;
    }

    return `
        <button class="btn btn-secondaire" style="padding: 4px 8px; font-size: 0.85rem; margin-right: 5px;" onclick="toggleVerrouillerEvaluation('${ligne.evaluationId}')" title="${texteVerrouillage}">
            ${texteVerrouillage}
        </button>
        <button class="btn btn-modifier" style="padding: 4px 8px; font-size: 0.85rem; margin-right: 5px;" onclick="modifierEvaluation('${ligne.da}', '${ligne.productionId}')" title="Modifier">
            Modifier
        </button>
        <button class="btn btn-secondaire" style="padding: 4px 8px; font-size: 0.85rem; margin-right: 5px;" onclick="dupliquerEvaluation('${ligne.evaluationId}')" title="Dupliquer">
            Dupliquer
        </button>
        <button class="btn btn-supprimer" style="padding: 4px 8px; font-size: 0.85rem;" onclick="supprimerEvaluation('${ligne.evaluationId}')" title="Supprimer">
            Supprimer
        </button>
    `;
}

/**
 * Génère les boutons d'action pour une évaluation non faite
 */
function genererBoutonsActionsNonEvalue(ligne) {
    return `
        <button class="btn btn-ajouter" style="padding: 6px 12px; font-size: 0.85rem;" onclick="modifierEvaluation('${ligne.da}', '${ligne.productionId}')" title="Évaluer">
            ➕ Évaluer
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
 */
function modifierEvaluation(da, productionId) {
    // Naviguer vers Évaluations › Évaluer avec pré-sélection
    // TODO: Implémenter la navigation et la pré-sélection
    console.log(`✏️ Modification de l'évaluation: DA ${da}, Production ${productionId}`);
    alert(`Navigation vers l'évaluation à implémenter:\nDA: ${da}\nProduction: ${productionId}`);
}

/**
 * Duplique une évaluation pour un autre élève
 */
function dupliquerEvaluation(evaluationId) {
    // TODO: Implémenter la duplication
    console.log(`📋 Duplication de l'évaluation ${evaluationId}`);

    if (!confirm('Voulez-vous dupliquer cette évaluation pour un autre élève ?')) {
        return;
    }

    alert('Duplication à implémenter: sélection de l\'élève cible');
}

/**
 * Supprime une évaluation
 */
function supprimerEvaluation(evaluationId) {
    if (!confirm('Voulez-vous vraiment supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluationsFiltered = evaluations.filter(ev => ev.id !== evaluationId);

    localStorage.setItem('evaluationsSauvegardees', JSON.stringify(evaluationsFiltered));

    console.log(`🗑️ Évaluation ${evaluationId} supprimée`);

    // Recharger le tableau
    chargerDonneesEvaluations();
}

/**
 * Verrouille/Déverrouille une évaluation
 */
function toggleVerrouillerEvaluation(evaluationId) {
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
    const evaluation = evaluations.find(ev => ev.id === evaluationId);

    if (!evaluation) {
        console.error(`❌ Évaluation ${evaluationId} introuvable`);
        return;
    }

    evaluation.verrouille = !evaluation.verrouille;
    localStorage.setItem('evaluationsSauvegardees', JSON.stringify(evaluations));

    console.log(`🔒 Évaluation ${evaluationId} ${evaluation.verrouille ? 'verrouillée' : 'déverrouillée'}`);

    // Recharger le tableau
    chargerDonneesEvaluations();
}

// ============================================
// EXPORT
// ============================================

// Rendre les fonctions accessibles globalement
window.initialiserListeEvaluations = initialiserListeEvaluations;
window.ouvrirCartouche = ouvrirCartouche;
window.modifierEvaluation = modifierEvaluation;
window.dupliquerEvaluation = dupliquerEvaluation;
window.supprimerEvaluation = supprimerEvaluation;
window.toggleVerrouillerEvaluation = toggleVerrouillerEvaluation;