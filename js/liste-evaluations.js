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
 * Une production produit-elle une ligne dans le tableau ?
 *
 * SSOT de la règle appliquée par `construireLignesEvaluations` — deux lecteurs,
 * une seule définition. Le portfolio est le contenant : il n'est pas évalué
 * pour lui-même, donc il n'a pas de ligne.
 *
 * #605 — Le second lecteur est le message « Fichier sous … », qui n'a de sens
 * QUE pour une production sans ligne. Tant que les deux règles vivaient
 * séparément, le message parlait de productions parfaitement visibles ailleurs
 * dans le même tableau.
 *
 * @param {Object} production
 * @returns {boolean}
 */
function productionGenereUneLigne(production) {
    return !!production && production.type !== 'portfolio';
}

/**
 * Calcule le statut workflow d'une ligne d'évaluation.
 * Hiérarchie : non-recu → recu → importe → annote → evalue
 * @param {Object} ligne - La ligne d'évaluation
 * @returns {string} Le statut workflow
 */
function calculerStatutWorkflow(ligne) {
    // Statut « Incomplet ; travail en cours » (25 oct. 2026) : ni évaluée, ni en attente de fichier.
    if (ligne.travailEnCours) return 'incomplet';

    // Beta 99.30 : une évaluation sans critère noté (ex. uniquement un jeton de
    // délai appliqué) ne doit pas être traitée comme évaluée. On retombe alors
    // sur le calcul normal (importé / annoté / reçu) basé sur le fichier.
    const evaluationVide = ligne.statut === 'evalue'
        && ligne.evaluationId
        && ligne.evaluationNotee === false;

    // Si évalué (ou remplacée/non-recevable), sauf le cas d'évaluation vide ci-dessus
    if (!evaluationVide
        && (ligne.statut === 'evalue' || ligne.statut === 'remplacee' || ligne.statut === 'non-recevable')) {
        return 'evalue';
    }

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

        // Signaler qu'un fichier existe sur une AUTRE production RÉELLE.
        // #346-cleanup : on exige que le productionId du fichier corresponde à une
        // production connue. Un productionId orphelin (legacy/coursId périmé, non
        // migré) ne déclenche plus le warning « Fichier sous … » — il était
        // trompeur (il prétendait pointer une autre production alors que la cible
        // n'existe pas, ce qui retombait sur le libellé générique « autre
        // production »). Le fichier orphelin reste traité par la branche
        // « non associé » plus haut.
        //
        // #605 — ET IL FAUT UNE SECONDE CONDITION, SANS QUOI LE MESSAGE NE PEUT
        // JAMAIS APPRENDRE QUOI QUE CE SOIT. Le tableau pose une ligne par
        // (élève × production qui génère une ligne) : un fichier posé sur une de
        // ces productions y est DÉJÀ affiché, à sa place, avec son statut. Le
        // répéter sur les N−1 autres lignes du même élève ne distingue pas le
        // fichier mal classé du fichier bien classé — les deux produisaient
        // exactement le même signal. Relevé le 30 août 2026 sur les données de
        // Grégoire : un élève ayant remis 1 travail sur 11 récoltait 10
        // avertissements, tous exacts et tous inutiles.
        // Reste le seul cas où le fichier n'a AUCUNE ligne à lui : une production
        // que `productionGenereUneLigne` écarte. Là, le message est la seule
        // trace du fichier dans ce tableau.
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const productions = obtenirDonneesSelonMode('productions');
        const productionsParId = new Map(productions.map(p => [p.id, p]));
        const fichierAutreProduction = fichiers.find(f =>
            f.etudiantDA === ligne.da
            && f.productionId
            && f.productionId !== ligne.productionId
            && productionsParId.has(f.productionId)
            && !productionGenereUneLigne(productionsParId.get(f.productionId))
        );
        if (fichierAutreProduction) {
            ligne.fichierAutreProduction = true;
            const prodReelle = productionsParId.get(fichierAutreProduction.productionId);
            ligne.fichierAutreProductionNom = prodReelle
                ? (prodReelle.titre || prodReelle.nom || '')
                : '';
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
        'evalue': 'Évalué',
        // #927 (20 sept. 2026) puis lot C de l'enregistrement (D1, 26 sept.) : « Non verrouillée ».
        // L'identifiant reste `non-enregistree` : le filtre retenu le mémorise (`etat.statut`).
        'non-enregistree': 'Non verrouillée',
        'incomplet': 'Incomplet'   // 25 oct. 2026 — le libellé complet est dans le badge de la ligne
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

// Vue Corbeille active ? Déclaré ICI et pas près de la section Corbeille :
// depuis #606, `afficherTableauEvaluations` et `toggleColonneEval` le lisent,
// et tous deux sont définis bien avant elle. Un `let` déclaré plus bas les
// laisserait dans sa zone morte temporelle — inoffensif tant que personne
// n'appelle pendant le chargement, et une ReferenceError le jour où ça arrive.
let vueCorbeilleActive = false;

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
    // ⚠ (25 oct. 2026) Ce que rend cette fonction n'est lu par personne : son seul appelant
    // (`initialiserListeEvaluations`) l'ignore depuis le retrait de l'écriture (Tier 6.2, ci-dessous).
    // L'indice C affiché vient des pratiques (`calculerDetailsCompletion`) et des snapshots.

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

// G2-b (#436) : dénominateur de la complétion alternative. Valeur historique
// EFFECTIVE (le champ de config qu'on croyait lire n'a jamais existé) —
// gelée ici jusqu'à décision, parce qu'elle sort à l'écran. Voir le corps de
// calculerCompletionAlternative.
const NB_ARTEFACTS_COMPLETION_ALTERNATIVE = 3;

/**
 * Calcule la complétion ALTERNATIVE (sur les N meilleurs artefacts)
 * Formule : Nombre de meilleurs artefacts remis ÷ N
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {number} - Indice entre 0 et 1
 */
function calculerCompletionAlternative(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');

    // G2-b (#436, 9 août 2026) — LECTURE FANTÔME RETIRÉE, VALEUR PRÉSERVÉE.
    // Ce nombre lisait `configPAN.nombreArtefacts`, un champ du miroir qu'AUCUN
    // code n'écrit : il rendait donc toujours 3, depuis toujours.
    //
    // ⚠ On ne le branche PAS sur la pratique active, alors que c'est ce que
    // G2-b fait partout ailleurs. Motif : `indice = meilleurs.length / N`
    // alimente `e.alternatif.completion`, l'indice C AFFICHÉ au tableau de
    // bord. Passer de 3 à `nombreARetenir` (4) ou `nombreTotal` (10) changerait
    // ce chiffre chez l'utilisateur — décision de sens, pas de nettoyage.
    // Question ouverte consignée au BACKLOG (#436).
    const nombreArtefacts = NB_ARTEFACTS_COMPLETION_ALTERNATIVE;

    
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
        // Échappement défensif sur error.message : si une erreur applicative
        // contient une chaîne utilisateur (ex. nom de fichier), elle ne doit
        // pas être interprétée comme HTML.
        const conteneur = document.getElementById('zone-chargement-evaluations');
        if (conteneur) {
            conteneur.innerHTML = `
                <p style="color: var(--rouge-erreur);">
                    <strong>Erreur de chargement</strong><br>
                    ${echapperHtml(error.message || '')}<br>
                    <small>Réessaie ; si le problème persiste, signale-le.</small>
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

    // #575 — LE FILTRE « NOTE » EST RETIRÉ, PARCE QU'IL N'A JAMAIS EXISTÉ.
    //
    // Ce bloc peuplait un `<select id="filtre-note-eval">` de codes `I/D/M/E`
    // quand la pratique était Standards, de tranches de 10 % sinon. L'audit du
    // 27 août le donne en exemple de code inutilisable hors IDME (§3 n° 8) —
    // il l'était, mais il était surtout INATTEIGNABLE : cet identifiant
    // n'apparaît NULLE PART dans `index.html`, et `git log -S` n'en trouve
    // aucune trace, depuis le premier commit du dépôt. La garde `if (selectNote)`
    // n'a donc jamais été vraie, et la branche « niveau » de
    // `appliquerFiltresSurLignes` jamais empruntée (la valeur lue vaut toujours
    // `''`, faute d'élément).
    //
    // ⮕ Le corriger aurait été un correctif sans effet
    // (`feedback-verifier-consommateurs-avant-brancher`). Un filtre par niveau,
    // s'il est voulu, est une fonction NEUVE : il lui faut son `<select>`, ses
    // options tirées de `niveauxOrdonnesDeLEchelle`, et une décision sur ce
    // qu'il propose quand les évaluations affichées ne partagent pas la même
    // échelle. Inscrit au backlog plutôt que ressuscité à l'aveugle.
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
        production: document.getElementById('filtre-production-eval')?.value || '',
        statut: document.getElementById('filtre-statut-eval')?.value || ''
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
            const filtreProduction = document.getElementById('filtre-production-eval');
            const filtreStatut = document.getElementById('filtre-statut-eval');

            if (filtreProduction && etat.production) filtreProduction.value = etat.production;
            if (filtreStatut && etat.statut) filtreStatut.value = etat.statut;


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
    // #572 — `filtre-groupe-eval` retiré : l'élément n'existe nulle part (le groupe-cours
    // actif filtre déjà en amont) ; il était lu à cinq endroits.
    const filtres = [
        'filtre-production-eval',
        'filtre-statut-eval'
    ];

    filtres.forEach(filtreId => {
        const filtre = document.getElementById(filtreId);
        // #572 — un listener par élément, pas un de plus à chaque visite de la
        // sous-section (double rendu, puis triple, à chaque `change`).
        if (filtre && !filtre.dataset.evenementsFiltresAttaches) {
            filtre.dataset.evenementsFiltresAttaches = '1';
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
    const filtreProduction = document.getElementById('filtre-production-eval');
    const filtreStatut = document.getElementById('filtre-statut-eval');
    const recherche = document.getElementById('recherche-evaluations');

    if (filtreProduction) filtreProduction.value = '';
    if (filtreStatut) filtreStatut.value = '';
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

    // #606 — Le retour à la liste passe toujours par ici : l'en-tête des
    // évaluations et le sélecteur de colonnes reviennent avec elle.
    appliquerEnTeteSelonVue();

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
        if (compteur) compteur.textContent = '0 ' + window.pluriel(0, 'évaluation', 'évaluations');
    } else {
        if (messageAucunResultat) messageAucunResultat.classList.add('u-hide');
        conteneurTableau.classList.remove('u-hide');

        // Calculer les statistiques
        // IMPORTANT : Exclure les non-recevables ET les non remis de la moyenne
        // #1055 : ni le travail diagnostique — il s'affiche, avec sa marque, mais ne pèse pas sur la moyenne.
        const evaluationsRecevables = lignesFiltrees.filter(ligne =>
            ligne.statut === 'evalue' && ligne.noteChiffree !== null && ligne.statutIntegrite !== 'plagiat' && ligne.statutIntegrite !== 'ia'
            && !ligne.diagnostique
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
                compteur.textContent = `${nbTotal} ${window.pluriel(nbTotal, 'non évalué', 'non évalués')}`;
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
                ? `Moyenne : ${formaterNotePourcentage(moyenneAffichee)}`
                : '';
        }

        const elemNbProductions = document.getElementById('nb-productions');
        if (elemNbProductions) {
            elemNbProductions.textContent = `${nbProductions} ${window.pluriel(nbProductions, 'production', 'productions')}`;
        }

        // Générer les lignes HTML
        corpsTableau.innerHTML = lignesFiltrees.map(ligne => genererLigneHTML(ligne)).join('');

        // Restaurer la visibilité des colonnes selon les préférences
        restaurerPreferencesColonnes();

        // Vérifier si le tableau déborde (après un court délai pour que le DOM soit peint)
        setTimeout(verifierDebordementTableau, 50);

    }

    // #934 — chaque rendu repart d'une sélection vide : les cases renaissent avec
    // les lignes, et « tout sélectionner » ne vise que les lignes affichées.
    mettreAJourSelectionEval();

    // Bandeau Phase 7 #3 : signaler la présence de doublons (au-dessus du tableau)
    if (typeof travauxDoublonsUI !== 'undefined' &&
        typeof travauxDoublonsUI.mettreAJourBandeau === 'function') {
        travauxDoublonsUI.mettreAJourBandeau();
    }
}

// ============================================
// RÉASSIGNER LA SÉLECTION (#934)
// ============================================
// Vécu le 22 sept. 2026 : 24 copies importées sous la mauvaise production,
// corrigées une par une depuis « Réassigner » de cette liste — 23 gestes en
// quatre minutes, et l'incident #931 au milieu. Grégoire : « Idéalement,
// j'aurais une option pour procéder à la réassignation par lot plutôt qu'une
// par une. » Ici : cocher les lignes qui portent une copie, « Réassigner la
// sélection (N) », choisir la cible ; UNE question groupée compte les copies,
// nomme les fichiers (ce que la liste n'affiche pas) et liste les conflits
// avant d'écrire. Vingt-quatre portes à la suite, c'est la fatigue qui a
// produit #931. L'écriture passe par `travauxUI.ecrireReassignation`, sur des
// mesures de `travauxUI.mesurerReassignation` : la vérification est séparée de
// l'écriture DANS le geste unique (#932), pas contournée ici.

/**
 * Les copies cochées, sans doublon (deux lignes peuvent résoudre le même fichier).
 * @returns {string[]} identifiants de fichiers
 */
function obtenirSelectionEval() {
    const cases = document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb:checked');
    const ids = [];
    cases.forEach(cb => {
        const id = cb.getAttribute('data-fichier-id');
        if (id && ids.indexOf(id) === -1) ids.push(id);
    });
    return ids;
}

/**
 * Met la barre de sélection et la case d'en-tête au diapason des cases cochées.
 * Appelée à chaque case cochée (`data-on-change`) et après chaque rendu.
 */
function mettreAJourSelectionEval() {
    const n = obtenirSelectionEval().length;
    const barre = document.getElementById('eval-barre-selection');
    const compte = document.getElementById('eval-barre-selection-compte');
    const bouton = document.getElementById('eval-btn-reassigner-selection');
    if (barre) barre.classList.toggle('u-hide', n === 0);
    if (compte) compte.textContent = n + ' ' + (n > 1 ? 'copies sélectionnées' : 'copie sélectionnée');
    if (bouton) bouton.textContent = 'Réassigner la sélection (' + n + ')';
    const boutonCorbeille = document.getElementById('eval-btn-corbeille-selection');
    if (boutonCorbeille) boutonCorbeille.textContent = 'Mettre à la corbeille (' + n + ')';

    const cbTout = document.getElementById('eval-tout-selectionner');
    if (cbTout) {
        const toutes = document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb');
        const cochees = document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb:checked');
        cbTout.checked = toutes.length > 0 && cochees.length === toutes.length;
        cbTout.indeterminate = cochees.length > 0 && cochees.length < toutes.length;
        cbTout.disabled = toutes.length === 0;
    }
}

/**
 * « Tout sélectionner » : suit le filtre — seules les lignes AFFICHÉES ont une case.
 * @param {HTMLInputElement} cb - la case d'en-tête
 */
function basculerToutSelectionnerEval(cb) {
    const coche = !!(cb && cb.checked);
    document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').forEach(c => { c.checked = coche; });
    mettreAJourSelectionEval();
}

/** Décoche tout. */
function viderSelectionEval() {
    document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').forEach(c => { c.checked = false; });
    mettreAJourSelectionEval();
}

/**
 * Trie des mesures de réassignation (`travauxUI.mesurerReassignation`) en ce que
 * le geste groupé fera, et ce qu'il laissera.
 *   · `dejaSurCible` : la copie est déjà sur la production cible — rien à faire ;
 *   · `ambigus`      : deux copies cochées pour un MÊME élève — écrites l'une après
 *                      l'autre, la seconde entrerait en conflit avec la première ;
 *                      aucune des deux ne bouge, l'utilisateur en choisit une ;
 *   · `aDeplacer`    : ce qui s'écrira — conflits compris, puisqu'ils sont nommés ;
 *   · `conflits`     : parmi `aDeplacer`, celles dont un fichier existant partira à
 *                      la corbeille ;
 *   · `orphelines`   : parmi `aDeplacer`, celles dont l'ancienne production garde
 *                      une évaluation sans copie.
 * Pure : aucune lecture du DOM ni du stockage. Sentinelle #934.
 * @param {Object[]} mesures
 * @returns {{aDeplacer: Object[], conflits: Object[], orphelines: Object[], dejaSurCible: Object[], ambigus: Object[]}}
 */
function composerRecapReassignation(mesures) {
    const dejaSurCible = [];
    const candidates = [];
    (mesures || []).forEach(m => {
        if (!m) return;
        if (!m.changeProduction) dejaSurCible.push(m); else candidates.push(m);
    });
    const parEleve = new Map();
    candidates.forEach(m => {
        const da = (m.fichier && m.fichier.etudiantDA) || '';
        if (!parEleve.has(da)) parEleve.set(da, []);
        parEleve.get(da).push(m);
    });
    const ambigus = [];
    const aDeplacer = [];
    candidates.forEach(m => {
        const da = (m.fichier && m.fichier.etudiantDA) || '';
        if (da && parEleve.get(da).length > 1) ambigus.push(m); else aDeplacer.push(m);
    });
    return {
        aDeplacer,
        conflits: aDeplacer.filter(m => m.conflit),
        orphelines: aDeplacer.filter(m => m.evaluationOrpheline),
        dejaSurCible,
        ambigus
    };
}

/**
 * Le HTML de la question groupée, à partir d'un récapitulatif et du nom de la cible.
 * Tout ce qui vient des données passe par `echapperHtml` (règle 1).
 * @param {Object} recap - rendu par `composerRecapReassignation`
 * @param {string} nomCible
 * @returns {string}
 */
function genererRecapReassignationHTML(recap, nomCible) {
    const n = recap.aDeplacer.length;
    const pl = (k, s, p) => k + ' ' + (k > 1 ? p : s);
    const li = (m) => '<li>' + echapperHtml(m.nomEleve) + ' — ' + echapperHtml(m.nomFichier) + '</li>';
    let html = '';
    if (n === 0) {
        html += '<p class="reassigner-recap-vide">Aucune copie à déplacer vers « ' + echapperHtml(nomCible) + ' ».</p>';
    } else {
        html += '<p><strong>' + pl(n, 'copie', 'copies') + '</strong> vers « ' + echapperHtml(nomCible) + ' » :</p>' +
            '<ul class="reassigner-recap-liste">' + recap.aDeplacer.map(li).join('') + '</ul>';
    }
    if (recap.conflits.length) {
        html += '<div class="reassigner-recap-bloc reassigner-recap-conflit"><p><strong>' + pl(recap.conflits.length, 'conflit', 'conflits') +
            '</strong> : un fichier existe déjà sur la cible. Il ira à la corbeille (récupérable pendant 30 jours).</p><ul class="reassigner-recap-liste">' +
            recap.conflits.map(m => '<li>' + echapperHtml(m.nomEleve) + ' : ' + echapperHtml(m.nomExistant) + ' → remplacé par ' + echapperHtml(m.nomFichier) + '</li>').join('') +
            '</ul></div>';
    }
    if (recap.orphelines.length) {
        // Mot validé par Grégoire (22 sept., soir), une ligne par ancienne production.
        const parAncienne = new Map();
        recap.orphelines.forEach(m => {
            const k = m.nomProductionActuelle || '?';
            if (!parAncienne.has(k)) parAncienne.set(k, []);
            parAncienne.get(k).push(m);
        });
        parAncienne.forEach((liste, ancienne) => {
            const k = liste.length;
            html += '<div class="reassigner-recap-bloc"><p>' + k + (k > 1 ? ' évaluations déjà faites' : ' évaluation déjà faite') +
                ' sur « ' + echapperHtml(ancienne) + ' » ' + (k > 1 ? 'n’auront' : 'n’aura') +
                ' plus de copie liée (l’évaluation elle-même est conservée).</p><ul class="reassigner-recap-liste">' +
                liste.map(li).join('') + '</ul></div>';
        });
    }
    if (recap.dejaSurCible.length) {
        html += '<div class="reassigner-recap-bloc"><p>' + pl(recap.dejaSurCible.length, 'copie déjà sur la cible, laissée telle quelle', 'copies déjà sur la cible, laissées telles quelles') + '.</p></div>';
    }
    if (recap.ambigus.length) {
        html += '<div class="reassigner-recap-bloc reassigner-recap-conflit"><p><strong>' + pl(recap.ambigus.length, 'copie non déplacée', 'copies non déplacées') +
            '</strong> : deux copies d’un·e même étudiant·e sont cochées. Choisis-en une.</p><ul class="reassigner-recap-liste">' +
            recap.ambigus.map(li).join('') + '</ul></div>';
    }
    return html;
}

/**
 * « Réassigner la sélection (N) » : la cible, la question groupée, puis l'écriture.
 */
function reassignerSelectionEval() {
    const ids = obtenirSelectionEval();
    if (ids.length === 0) return;
    if (typeof travauxUI === 'undefined' || typeof travauxUI.mesurerReassignation !== 'function' || typeof travauxUI.ecrireReassignation !== 'function') {
        notifications.erreur('Réassignation impossible', 'Le module des copies n’est pas chargé.');
        return;
    }
    const productions = obtenirDonneesSelonMode('productions') || [];
    if (productions.length === 0) {
        notifications.erreur('Aucune production', 'Crée d’abord des productions dans « Construction de la note ».');
        return;
    }
    const optionsProductions = productions.map(function(p) {
        const label = p.description ? (p.titre + ' - ' + p.description) : p.titre;
        return '<option value="' + echapperHtml(p.id) + '">' + echapperHtml(label) + '</option>';
    }).join('');

    const existante = document.getElementById('reassigner-selection-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'reassigner-selection-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML =
        '<div class="modal-contenu modal-compact" style="max-width: 560px;">' +
            '<button class="modal-fermer" data-action="fermerOverlayParent"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>' +
            '<h3 class="modal-titre">Réassigner ' + ids.length + (ids.length > 1 ? ' copies' : ' copie') + '</h3>' +
            '<label for="reassigner-selection-cible" style="font-size: 0.85em; color: var(--texte-secondaire);">Production cible :</label>' +
            '<select id="reassigner-selection-cible" class="controle-form" style="margin: 4px 0 12px 0; width: 100%;">' +
                '<option value="">— Choisir une production —</option>' + optionsProductions +
            '</select>' +
            '<div id="reassigner-selection-recap" class="reassigner-recap" aria-live="polite">' +
                '<p class="reassigner-recap-vide">Choisis la production cible pour voir ce qui sera déplacé.</p>' +
            '</div>' +
            '<div class="modal-actions" style="display:flex;gap:8px">' +
                '<button class="btn btn-principal" id="reassigner-selection-btn-confirmer" disabled>Réassigner</button>' +
                '<button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

    const selectCible = document.getElementById('reassigner-selection-cible');
    const zoneRecap = document.getElementById('reassigner-selection-recap');
    const btnConfirmer = document.getElementById('reassigner-selection-btn-confirmer');
    let recapCourant = null;
    let nomCibleCourant = '';

    // La question groupée se recompose à chaque cible choisie : elle MESURE, n'écrit rien.
    selectCible.addEventListener('change', function() {
        const cibleId = selectCible.value;
        if (!cibleId) {
            recapCourant = null;
            zoneRecap.innerHTML = '<p class="reassigner-recap-vide">Choisis la production cible pour voir ce qui sera déplacé.</p>';
            btnConfirmer.disabled = true;
            btnConfirmer.textContent = 'Réassigner';
            return;
        }
        const prod = productions.find(p => p.id === cibleId);
        nomCibleCourant = prod ? (prod.titre || prod.nom) : cibleId;
        const mesures = ids.map(id => travauxUI.mesurerReassignation(id, { productionId: cibleId }));
        recapCourant = composerRecapReassignation(mesures);
        zoneRecap.innerHTML = genererRecapReassignationHTML(recapCourant, nomCibleCourant);
        const n = recapCourant.aDeplacer.length;
        btnConfirmer.disabled = n === 0;
        btnConfirmer.textContent = n === 0 ? 'Réassigner' : 'Réassigner ' + n + (n > 1 ? ' copies' : ' copie');
    });

    // La question a été lue et nommait chaque conflit : on écrit chaque mesure, sans autre porte.
    btnConfirmer.addEventListener('click', function() {
        if (!recapCourant || recapCourant.aDeplacer.length === 0) return;
        let nb = 0;
        recapCourant.aDeplacer.forEach(m => { if (travauxUI.ecrireReassignation(m)) nb++; });
        overlay.remove();
        notifications.succes(nb + (nb > 1 ? ' copies réassignées' : ' copie réassignée') + ' vers « ' + nomCibleCourant + ' »');
        appliquerFiltres();
    });
}

// ============================================
// METTRE LA SÉLECTION À LA CORBEILLE (#1174)
// ============================================
// Vécu le 27 oct. 2026 : 22 copies cochées sur « Artefact 5 », et seul « Actions…
// → Supprimer » ligne par ligne. Décision de Grégoire (9 h 01) : toutes les copies
// cochées partent, y compris celles déjà évaluées. Le geste est celui de
// « Supprimer », répété : le fichier va à la corbeille, son blob reste, aucune
// évaluation n'est touchée. Une seule écriture : `travauxStockage.deplacerEnCorbeilleLot`.

/**
 * Le travail (élève × production) est-il lié à une reprise ? Supprimer le fichier
 * ne la défait pas (bug Grégoire 8 juin 2026). Règle partagée par la suppression
 * d'une copie et celle de la sélection.
 * @param {Object[]} evaluations
 * @param {string} da
 * @param {string} productionId
 * @returns {boolean}
 */
function _travailLieAUneReprise(evaluations, da, productionId) {
    if (!productionId) return false;
    return (evaluations || []).some(e => e &&
        // #360 — un doublon réconcilié porte `remplaceeParId` mais n'est PAS une
        // reprise : ne pas afficher l'avertissement « lié à une reprise » à tort.
        e.etudiantDA === da && e.productionId === productionId && (e.repriseDeId || (e.remplaceeParId && !e.reconcilieParDoublon))
    );
}

/**
 * Trie les copies cochées en ce que le geste groupé déplacera, et ce que la
 * question doit nommer :
 *   · `aDeplacer` : chaque copie trouvée (un id absent est ignoré) ;
 *   · `evaluees`  : parmi elles, celles dont l'évaluation est notée — elle reste
 *                   dans la liste, sans copie liée ;
 *   · `reprises`  : parmi elles, celles dont le travail est lié à une reprise.
 * Les noms viennent de `etudiants` tel que l'appelant le lit (anonymisé ou non) ;
 * jamais le DA en repli. Pure : aucune lecture du DOM ni du stockage. Sentinelle #1174.
 * @param {string[]} ids
 * @param {{fichiers?: Object[], evaluations?: Object[], etudiants?: Object[]}} donnees
 * @returns {{aDeplacer: Object[], evaluees: Object[], reprises: Object[]}}
 */
function composerRecapCorbeille(ids, donnees) {
    const { fichiers = [], evaluations = [], etudiants = [] } = donnees || {};
    const aDeplacer = [];
    (ids || []).forEach(id => {
        const f = fichiers.find(x => x && x.id === id);
        if (!f || aDeplacer.some(c => c.fichierId === id)) return;
        const e = f.etudiantDA ? etudiants.find(x => x && x.da === f.etudiantDA) : null;
        const evaluation = evaluations.find(ev => ev && f.evaluationId && ev.id === f.evaluationId) ||
            evaluations.find(ev => estDuCoupleDuFichier(ev, f) && !ev.remplaceeParId);
        aDeplacer.push({
            fichierId: f.id,
            nomEleve: e ? ((e.prenom || '') + ' ' + (e.nom || '')).trim() : 'Copie sans élève',
            nomFichier: f.nomFichier || f.id,
            evaluee: !!(evaluation && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0),
            reprise: _travailLieAUneReprise(evaluations, f.etudiantDA, f.productionId)
        });
    });
    return {
        aDeplacer,
        evaluees: aDeplacer.filter(c => c.evaluee),
        reprises: aDeplacer.filter(c => c.reprise)
    };
}

/**
 * Le HTML de la question groupée. Tout ce qui vient des données passe par
 * `echapperHtml` (règle 1).
 * @param {Object} recap - rendu par `composerRecapCorbeille`
 * @returns {string}
 */
function genererRecapCorbeilleHTML(recap) {
    const pl = (k, s, p) => k + ' ' + (k > 1 ? p : s);
    const noms = (liste) => '<ul class="reassigner-recap-liste">' + liste.map(c => '<li>' + echapperHtml(c.nomEleve) + '</li>').join('') + '</ul>';
    let html = '<p>Tu pourras les restaurer depuis la corbeille pendant 30 jours.</p>';
    if (recap.evaluees.length) {
        html += '<div class="reassigner-recap-bloc"><p><strong>' + pl(recap.evaluees.length, 'copie déjà évaluée', 'copies déjà évaluées') +
            '</strong> : leur évaluation et leur note restent dans la liste, sans copie liée.</p>' + noms(recap.evaluees) + '</div>';
    }
    if (recap.reprises.length) {
        html += '<div class="reassigner-recap-bloc reassigner-recap-conflit"><p><strong>' + pl(recap.reprises.length, 'copie liée', 'copies liées') +
            ' à une reprise.</strong> Mettre le fichier à la corbeille ne retire ni la reprise ni le statut « remplacée » de l’évaluation d’origine.</p>' +
            noms(recap.reprises) + '</div>';
    }
    return html;
}

/**
 * Après un passage à la corbeille : la liste, la vue Archivage si elle est
 * ouverte (suppression depuis un badge fichier), et le compteur « Corbeille (n) ».
 */
function _rafraichirApresCorbeille() {
    if (typeof appliquerFiltres === 'function') {
        appliquerFiltres();
    }
    if (typeof travauxUI !== 'undefined' && typeof travauxUI.afficherArchivage === 'function') {
        const conteneurArchivage = document.getElementById('evaluations-contenu-archivage');
        if (conteneurArchivage && conteneurArchivage.offsetParent !== null) {
            travauxUI.afficherArchivage();
        }
    }
    mettreAJourBoutonCorbeille();
}

/**
 * « Mettre à la corbeille (N) » : une seule question, puis une seule écriture.
 */
function mettreSelectionALaCorbeille() {
    const ids = obtenirSelectionEval();
    if (ids.length === 0 || typeof travauxStockage === 'undefined' || typeof travauxStockage.deplacerEnCorbeilleLot !== 'function') return;

    const recap = composerRecapCorbeille(ids, {
        fichiers: travauxStockage.obtenirFichiersGroupeActif() || [],
        evaluations: db.getSync(cle('evaluationsSauvegardees'), []) || [],
        etudiants: obtenirDonneesSelonMode('groupeEtudiants') || []
    });
    const n = recap.aDeplacer.length;
    if (n === 0) return;
    const copies = n > 1 ? n + ' copies' : 'une copie';

    const existante = document.getElementById('corbeille-selection-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'corbeille-selection-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML =
        '<div class="modal-contenu modal-compact" style="max-width: 480px;">' +
            '<button class="modal-fermer" data-action="fermerOverlayParent"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>' +
            '<h3 class="modal-titre">Mettre ' + copies + ' à la corbeille ?</h3>' +
            '<div class="reassigner-recap">' + genererRecapCorbeilleHTML(recap) + '</div>' +
            '<div class="modal-actions" style="display:flex;gap:8px">' +
                '<button class="btn btn-danger" id="corbeille-selection-btn-confirmer">Mettre ' + copies + ' à la corbeille</button>' +
                '<button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

    document.getElementById('corbeille-selection-btn-confirmer').addEventListener('click', function() {
        const nb = travauxStockage.deplacerEnCorbeilleLot(recap.aDeplacer.map(c => c.fichierId));
        overlay.remove();
        notifications.succes(nb + (nb > 1 ? ' copies mises à la corbeille.' : ' copie mise à la corbeille.'));
        _rafraichirApresCorbeille();
    });
}

/**
 * Construit la liste complète des lignes (évaluations + non évaluées)
 */
function construireLignesEvaluations(evaluations, productions, etudiants) {
    const lignes = [];
    // Lot N1b (21 sept. 2026) : l'id que rend LA désignation, sans repli. ⚠ La règle N'A PAS bougé :
    // c'est l'ID qui se compare à « standards », pas la famille — une Standards configurable (id propre)
    // affiche donc le pourcentage, comme avant. Ce lot ne change aucune note affichée.
    const pratiqueId = (typeof obtenirIdPratiqueActive === 'function') ? obtenirIdPratiqueActive() : null;
    const estPAN = !!pratiqueId && (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(pratiqueId) : pratiqueId) === 'standards';

    // Productions à évaluer (exclure le portfolio lui-même).
    // #605 — la règle vit dans `productionGenereUneLigne`, lue aussi par le
    // message « Fichier sous … ». Une seule définition, deux lecteurs.
    const productionsAEvaluer = productions.filter(productionGenereUneLigne);

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
                    // Le statut et le badge de la ligne (extraits le 25 oct. 2026, statut incomplet)
                    const { statut, badgeType, statutIntegrite, estOriginaleRemplacee, estNouvelleReprise, estTravailEnCours } =
                        _statutEtBadgeDeLigne(evaluation);

                    // Formater le nom de production avec description
                    let productionNomComplet = production.titre;
                    const descriptionAff = production.activiteApprentissage || production.description;
                    if (descriptionAff && descriptionAff.trim() !== '') {
                        productionNomComplet = `${production.titre} - ${descriptionAff}`;
                    }

                    // Évaluation existante
                    // ✅ NOUVEAU (29 déc 2025): Ajouter daAffichage pour anonymisation
                    // Si c'est une reprise, chercher les scores de l'originale
                    var scoresOriginaux = null;
                    if (estNouvelleReprise && evaluation.repriseDeId) {
                        var originale = evaluations.find(function(e) { return e.id === evaluation.repriseDeId; });
                        if (originale) {
                            // 28 oct. 2026 — une originale non recevable : « (était Non recevable (Plagiat)) », ni niveau ni note.
                            const libelleOriginale = _libelleNonRecevable(originale);
                            scoresOriginaux = {
                                niveauFinal: libelleOriginale || _niveauAffiche(originale) || '-',   // #941 lot S1
                                noteFinale: !libelleOriginale && originale.noteFinale != null ? originale.noteFinale : null
                            };
                        }
                    }

                    // Beta 99.30 : flag pour distinguer une évaluation réellement notée
                    // d'une évaluation enregistrée sans critère (ex. application
                    // d'un jeton de délai seul, sans note).
                    const evaluationNotee = Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0;

                    lignes.push({
                        da: etudiant.da,
                        daAffichage: etudiant.daAffichage || etudiant.da,
                        nom: etudiant.nom || '',
                        prenom: etudiant.prenom || '',
                        groupe: etudiant.groupe,
                        productionId: production.id,
                        productionNom: productionNomComplet,
                        diagnostique: window.ProductionDiagnostique.estDiagnostique(production),   // #1055 : hors de la moyenne
                        marque: window.ProductionDiagnostique.marqueHTML(production),
                        grilleNom: evaluation.grilleNom || '-',
                        cartoucheId: evaluation.cartoucheId || null,
                        cartoucheNom: obtenirNomCartouche(evaluation.grilleId, evaluation.cartoucheId),
                        note: obtenirNoteAffichee(evaluation, estPAN),
                        noteChiffree: evaluation.noteFinale != null ? evaluation.noteFinale : null,
                        // #941 lot S1 — aucun niveau pour une copie en points ; 28 oct. 2026 — ni pour une copie non recevable
                        // (la colonne dit « -- », comme la note ; le tri ne lui trouve pas de rang)
                        niveauFinal: statut === 'non-recevable' ? '-' : (_niveauAffiche(evaluation) || '-'),
                        // #575 — le code voyage avec SON échelle. Sans elle, le
                        // tri de la colonne « Niveau » n'a aucun ordre à lire.
                        echelleId: evaluation.echelleId || null,
                        statut: statut,
                        statutIntegrite: statutIntegrite,
                        statutRemise: evaluation.statutRemise || 'non-remis',  // ✅ Ajout statut de remise
                        evaluationId: evaluation.id,
                        evaluationNotee: evaluationNotee,
                        verrouille: evaluation.verrouillee || false,
                        // #927 (20 sept. 2026) — NON ENREGISTRÉE : le même test que `evaluationEntreDansLaNote`
                        // (`verrouillee === false`, strict). La liste la disait « Évalué » pendant que la note et la
                        // complétion l'ignoraient : 10 portfolios d'A2024 introuvables, rapport de Grégoire.
                        nonEnregistree: evaluation.verrouillee === false && !estOriginaleRemplacee && !estTravailEnCours,
                        travailEnCours: estTravailEnCours,
                        remplacee: estOriginaleRemplacee,
                        badgeType: badgeType,
                        scoresOriginaux: scoresOriginaux
                    });
                });
            } else {
                // Formater le nom de production avec description pour les non évaluées aussi
                let productionNomComplet = production.titre;
                const descriptionAffNonEval = production.activiteApprentissage || production.description;
                if (descriptionAffNonEval && descriptionAffNonEval.trim() !== '') {
                    productionNomComplet = `${production.titre} - ${descriptionAffNonEval}`;
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
                    diagnostique: window.ProductionDiagnostique.estDiagnostique(production),   // #1055 : hors de la moyenne
                    marque: window.ProductionDiagnostique.marqueHTML(production),
                    grilleNom: '-',
                    cartoucheId: null,
                    cartoucheNom: '-',
                    note: '-',
                    noteChiffree: null,
                    niveauFinal: '-',
                    echelleId: null,          // #575 — aucune évaluation, donc aucune échelle
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
    if (typeof travauxStockage !== 'undefined' && typeof travauxStockage.obtenirFichiersAffiches === 'function') {
        const fichiers = travauxStockage.obtenirFichiersAffiches() || []; // #1013 : ni lignes ni compte pour les copies d'un élève supprimé
        const productionIdsConnus = new Set(productions.map(p => p.id));

        // Fichiers sans étudiant (DA vide)
        fichiers.filter(f => !f.etudiantDA).forEach(fichier => {
            lignes.push({
                da: '', daAffichage: '', nom: '?',
                prenom: (typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : fichier.nomFichier) || 'Fichier non identifié',
                groupe: '', productionId: fichier.productionId || '', productionNom: 'Non associé', marque: '',
                associationManquante: true, estFichierNonAssocie: true, etudiantManquant: true, fichierId: fichier.id,
                grilleNom: '-', cartoucheId: null, cartoucheNom: '-',
                note: '-', noteChiffree: null, niveauFinal: '-',
                statut: 'non-evalue', statutRemise: 'non-remis', evaluationId: null, verrouille: false
            });
        });

        // Fichiers avec DA renseigné mais qui ont besoin d'un rattrapage :
        // production orpheline ou vide, OU — #612 T6.5 — DA qui ne correspond à
        // aucun·e élève de ce groupe.
        //
        // ⚠ POURQUOI LE TROISIÈME CAS. Un fichier dont le DA est inconnu est
        // stocké SOUS ce DA (`travaux-import.js` : `etudiantDA: etudiant ?
        // etudiant.da : daDetecte`). S'il porte en plus une production VALIDE,
        // il échappait aux deux branches — ni « sans DA » (son DA est
        // renseigné), ni « production orpheline » (sa production existe). Il
        // n'avait donc aucune ligne, nulle part : c'est le silence que #612
        // vient fermer.
        const daInscrits = new Set(etudiants.map(e => e.da));
        const fichiersOrphelins = fichiers.filter(f =>
            f.etudiantDA && (
                !f.productionId
                || !productionIdsConnus.has(f.productionId)
                || !daInscrits.has(f.etudiantDA)
            )
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
                    const nomProd = prod ? (prod.titre || prod.nom || prod.activiteApprentissage || prod.description) : match.productionId;
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
                productionId: '', productionNom: nomFichier || 'Fichier non associé', marque: '',
                // #612 T6.5 — DYNAMIQUE, jamais `true` en dur : l'infobulle de
                // `genererLigneHTML` choisit son diagnostic là-dessus. Posé à
                // `true` sans condition, un fichier dont l'élève EST inscrit se
                // verrait annoncer « Étudiant·e introuvable ».
                etudiantManquant: !etudiant,
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

    const cartouches = db.getSync(cle(`cartouches_${grilleId}`), []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    return cartouche ? cartouche.nom : '-';
}

/**
 * Obtient la note affichée selon la pratique de notation
 */
/**
 * #941 lot S1 (décision A) — le niveau qu'une ligne peut montrer : aucun pour une copie en
 * points, même enregistrée avec l'échelle de départ (`niveauFinalAffichable`, gabarits-utils.js).
 */
function _niveauAffiche(evaluation) {
    if (typeof niveauFinalAffichable === 'function') return niveauFinalAffichable(evaluation);
    return (evaluation && evaluation.niveauFinal) || '';
}

/**
 * La colonne du niveau d'une ligne. 28 oct. 2026 (seconde retouche de #1175) — une copie non recevable dit « -- »,
 * comme sa note : ses niveaux ne se lisent nulle part (décision de Grégoire, 6 h 46).
 */
function _celluleNiveau(ligne) {
    if (ligne.statut === 'non-recevable') return '<strong style="color: var(--gris-clair);">--</strong>';
    return ligne.niveauFinal && ligne.niveauFinal !== '-' ? `<strong>${echapperHtml(ligne.niveauFinal)}</strong>` : '-';
}

/** 28 oct. 2026 — le libellé d'une copie non recevable (registre, `libelleCopieNonRecevable`), null sinon. */
function _libelleNonRecevable(evaluation) {
    return (typeof libelleCopieNonRecevable === 'function' && libelleCopieNonRecevable(evaluation)) || null;
}

function obtenirNoteAffichee(evaluation, estPAN) {
    // #941 lot S1 — une copie en points se lit à sa note, même sous une pratique à niveaux.
    const enPoints = typeof evaluationEnPoints === 'function' && evaluationEnPoints(evaluation);
    if (estPAN && !enPoints) {
        return evaluation.niveauFinal || '-';
    } else {
        return evaluation.noteFinale != null && evaluation.noteFinale !== 0 ? formaterNotePourcentage(evaluation.noteFinale) : '-';
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
    const filtreProduction = document.getElementById('filtre-production-eval')?.value || '';
    const filtreStatut = document.getElementById('filtre-statut-eval')?.value || '';

    return lignes.filter(ligne => {

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
        } else if (filtreStatut === 'non-enregistree') {
            // #927 — y compris la reprise « À réévaluer » : non enregistrée elle aussi, donc non comptée.
            if (!ligne.nonEnregistree) return false;
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

        // #575 — le filtre « Note » est retiré : son `<select>` n'a jamais
        // existé dans `index.html`, donc cette branche n'a jamais été empruntée.
        // Voir la note de `genererOptionsFiltres`.

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
 * #776 — La note affichée dans la Liste des évaluations n'était pas arrondie :
 * « 92.52136752136752% » dans la colonne Note %, alors que la note originale
 * d'une reprise l'est depuis toujours (`genererLigneHTML`, badge « Reprise »).
 * Source d'affichage seulement : la valeur stockée n'est pas touchée.
 * 21 oct. 2026 : par `formaterNotePourcentage` ; une valeur non numérique reste telle quelle (banc #562).
 */
function _noteChiffreeAffichee(valeur) {
    return formaterNotePourcentage(valeur) || String(valeur);
}

/**
 * Le statut et le badge d'une ligne de la Liste pour une évaluation (extraits du constructeur des
 * lignes le 25 oct. 2026, statut « Incomplet ; travail en cours »).
 * @param {Object} evaluation
 * @returns {{statut: string, badgeType: string|null, statutIntegrite: string, estOriginaleRemplacee: boolean,
 *            estNouvelleReprise: boolean, estTravailEnCours: boolean}}
 */
function _statutEtBadgeDeLigne(evaluation) {
    // IMPORTANT : Quatre types de badges (par ordre de priorité)
    // 1. Intégrité académique : plagiat ou IA non autorisée (prioritaire)
    // 2. ORIGINALE remplacée : remplaceeParId existe → grisée, "Remplacée"
    // 3. NOUVELLE reprise : repriseDeId existe OU ID commence par EVAL_REPRISE_ → "Jeton de reprise appliqué"
    // 4. Délai : jetonDelaiApplique = true ET pas de repriseDeId → "Jeton de délai appliqué"

    const statutIntegrite = evaluation.statutIntegrite || 'recevable';
    const estNonRecevable = (statutIntegrite === 'plagiat' || statutIntegrite === 'ia');
    const estSoupcon = (statutIntegrite === 'soupcon');
    const estTravailEnCours = typeof window.evaluationTravailEnCours === 'function' && window.evaluationTravailEnCours(evaluation);   // 25 oct. 2026

    const estOriginaleRemplacee = !!evaluation.remplaceeParId;
    const estNouvelleReprise = evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_');
    const estRepriseCiblee = evaluation.jetonRepriseCibleeApplique === true;
    const aJetonDelai = evaluation.jetonDelaiApplique && !evaluation.repriseDeId && !evaluation.jetonRepriseCibleeApplique;

    // Déterminer le statut et le badge
    let statut = 'evalue';
    let badgeType = null;

    // Priorité 1 : Intégrité académique
    if (estNonRecevable) {
        statut = 'non-recevable';
        badgeType = statutIntegrite;   // « plagiat » ou « ia » : les clés de `BADGES_STATUT_COPIE`
    } else if (estSoupcon) {
        statut = 'evalue';
        badgeType = 'soupcon';
    } else if (estTravailEnCours) {
        // Statut « Incomplet ; travail en cours » (25 oct. 2026), sur le modèle de « Soupçon »
        statut = 'evalue';
        badgeType = 'incomplet';
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

    return { statut, badgeType, statutIntegrite, estOriginaleRemplacee, estNouvelleReprise: !!estNouvelleReprise, estTravailEnCours };
}

// Les badges d'un statut de la copie, sans valeur variable (statut incomplet, 25 oct. 2026 : en table plutôt
// qu'en branche de plus dans `genererLigneHTML`).
const BADGES_STATUT_COPIE = {
    plagiat: ' <span class="badge-jeton badge-jeton-plagiat">Non recevable (Plagiat)</span>',
    ia: ' <span class="badge-jeton badge-jeton-plagiat">Non recevable (IA)</span>',
    soupcon: ' <span class="badge-jeton badge-jeton-soupcon">À vérifier</span>',
    incomplet: ' <span class="badge-jeton badge-jeton-incomplet">Incomplet ; travail en cours</span>'
};

/**
 * Génère le HTML d'une ligne du tableau
 */
function genererLigneHTML(ligne) {
    // #562 (29 août 2026) — TOUT ce qui vient des données passe par `echapperHtml`,
    // attributs compris (`data-*`, `title`) : la règle 1 du projet est « sans
    // exception ». Le DA est nettoyé à l'import CSV, pas garanti sur les autres
    // chemins ; les identifiants (évaluation, production, fichier) arrivent
    // d'imports et de partages. Verrou : `sentinelle-562-liste-echappement`.
    // Déterminer les classes CSS et le badge selon le type
    let classeRemplacee = '';
    let badgeJeton = '';

    // Priorité aux badges d'intégrité, puis au statut incomplet (`BADGES_STATUT_COPIE`)
    if (Object.prototype.hasOwnProperty.call(BADGES_STATUT_COPIE, ligne.badgeType)) {
        badgeJeton = BADGES_STATUT_COPIE[ligne.badgeType];
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
                parties.push(echapperHtml(ligne.scoresOriginaux.niveauFinal));
            }
            if (ligne.scoresOriginaux.noteFinale != null) {
                parties.push(formaterNotePourcentage(ligne.scoresOriginaux.noteFinale));
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
    } else if (ligne.nonEnregistree) {
        // #927 — « À réévaluer » reste le mot de la reprise en attente (plus précis) ; toute autre non enregistrée le dit.
        statutW = 'non-enregistree';
    }
    const libelleStatut = statutW === 'a-reevaluer' ? 'À réévaluer' : obtenirLibelleStatut(statutW);
    let affichageNiveau;
    if (ligne.statut === 'non-recevable') {
        // #1175, troisième retouche (28 oct. 2026) — « -- », comme la note et le niveau : le « 0 » était faux en standards,
        // et une copie non recevable ne montre ni note ni niveau (décision de Grégoire, 6 h 46).
        affichageNiveau = '<strong style="color: var(--gris-clair);">--</strong>';
    } else {
        // Lot C (D1) — l'aide courte de « Non verrouillée ».
        const titreStatut = statutW === 'non-enregistree' ? 'Non verrouillée : ne compte pas encore dans la note.' : '';
        affichageNiveau = `<span class="travaux-badge-pill ${echapperHtml(statutW)}" title="${echapperHtml(titreStatut)}">${echapperHtml(libelleStatut)}</span>`;
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
        // #321 note différée : masquer le % par travail (le niveau IDME, colonne
        // distincte, reste visible). N'altère pas la valeur stockée.
        affichageNoteChiffree = (typeof noteDiffereeActive === 'function' && noteDiffereeActive())
            ? badgeNoteDifferee()
            // #776 : une décimale, comme la note originale d'une reprise (badge
            // « Reprise », plus haut dans cette même fonction) ; norme française depuis le 21 oct. 2026.
            // Une valeur non numérique reste rendue telle quelle (échappée) :
            // le banc d'échappement #562 en fournit une, et « NaN % » serait pire
            // que la valeur brute.
            : `<strong>${echapperHtml(_noteChiffreeAffichee(ligne.noteChiffree))}</strong>`;
    } else {
        affichageNoteChiffree = '-';
    }

    // #934 (22 sept. 2026) — la copie que porte cette ligne, résolue UNE fois : la
    // case de sélection et le menu Actions parlent du même fichier.
    const fichierLigne = trouverFichierDeLigne(ligne);

    // Générer le dropdown d'actions contextuel
    const boutons = genererDropdownActions(ligne, fichierLigne);

    const daAffiche = ligne.daAffichage || ligne.da;

    // #934 — une ligne « Non reçu » n'a rien à déplacer : pas de case.
    return `
        <tr data-evaluation-id="${echapperHtml(ligne.evaluationId || '')}" data-da="${echapperHtml(ligne.da)}" data-production-id="${echapperHtml(ligne.productionId || '')}"${classeRemplacee}>
            <td class="td-center eval-td-selection">${fichierLigne
                ? `<input type="checkbox" class="eval-selection-cb" data-fichier-id="${echapperHtml(fichierLigne.id)}" data-on-change="mettreAJourSelectionEval" aria-label="${echapperHtml('Sélectionner la copie de ' + (ligne.prenom || '') + ' ' + (ligne.nom || ''))}">`
                : ''}</td>
            <td class="td-left">${echapperHtml(daAffiche)}</td>
            <td class="td-left">${echapperHtml(ligne.nom)}</td>
            <td class="td-left">${echapperHtml(ligne.prenom)}</td>
            <td class="td-left">${ligne.associationManquante
                ? `${echapperHtml(ligne.productionNom)} ${ligne.estDoublon
                    ? `<span style="color: var(--rouge-danger); font-size: 0.85em;" title="Doublon : ce fichier est déjà associé à ${echapperHtml(ligne.diagnosticDoublon || '')}. Suppression sécuritaire."><span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Doublon</span>`
                    : (ligne.fichierId
                        ? `<button type="button" data-stop data-action="ouvrirProprieteFichier" data-param="${echapperHtml(ligne.fichierId)}" title="${ligne.etudiantManquant ? 'Étudiant·e introuvable : le DA du fichier ne correspond à aucun·e étudiant·e inscrit·e. Clique pour associer l’étudiant·e et la production.' : 'Aucune production liée à ce travail. Clique pour l’associer à une production.'}" style="color: var(--alerte-texte-attention); font-size: 0.85em; background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline;"><span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Non associé ›</button>`
                        : `<span style="color: var(--alerte-texte-attention); font-size: 0.85em;"><span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Non associé</span>`)}`
                : ligne.fichierAutreProduction
                    ? `${echapperHtml(ligne.productionNom)} <span style="color: var(--alerte-texte-attention); font-size: 0.85em;"><span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Fichier sous ${ligne.fichierAutreProductionNom ? echapperHtml(ligne.fichierAutreProductionNom) : 'autre production'}</span>`
                    : echapperHtml(ligne.productionNom)}${ligne.marque}</td>
            <td class="td-center">${badgeJeton}</td>
            <td class="td-center">${affichageNiveau}</td>
            <td class="td-center">${_celluleNiveau(ligne)}</td>
            <td class="td-center">${affichageNoteChiffree}</td>
            <td class="td-center">${boutons}</td>
        </tr>
    `;
}

/**
 * La copie que porte une ligne de la liste (élève × production), ou null.
 *
 * Une ligne ne stocke pas de `fichierId`, sauf les lignes dédiées aux fichiers non
 * associés : la copie se résout ici, dans cet ordre — l'id porté par la ligne,
 * puis l'évaluation liée (distingue original et reprise), puis l'élève × la
 * production (strict), puis, s'il est SEUL, le fichier de l'élève sans production
 * connue (souple, 5 mars 2026). Deux lecteurs : le menu Actions et, depuis #934, la
 * case de sélection pour « Réassigner la sélection ».
 * @param {Object} ligne
 * @returns {Object|null}
 */
function trouverFichierDeLigne(ligne) {
    if (typeof travauxStockage === 'undefined' || typeof travauxStockage.obtenirFichiersTravaux !== 'function') return null;
    const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
    const productions = obtenirDonneesSelonMode('productions');
    const productionIdsConnus = new Set(productions.map(p => p.id));
    let fichierImporte = null;
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
    return fichierImporte || null;
}

/**
 * Génère un <select> natif d'actions contextuel selon le statut de la ligne
 * @param {Object} ligne
 * @param {Object|null} [fichierResolu] - la copie déjà résolue par l'appelant (#934) ; sinon résolue ici
 */
function genererDropdownActions(ligne, fichierResolu) {
    // #562 — les identifiants interpolés dans `value="action|id|id"` sont échappés :
    // le navigateur décode `&quot;`/`&amp;` en lisant `.value`, `executerActionEval`
    // reçoit donc la valeur d'origine ; seul l'attribut est protégé.
    const fichierImporte = (fichierResolu === undefined) ? trouverFichierDeLigne(ligne) : fichierResolu;
    const fichierId = fichierImporte ? fichierImporte.id : null;
    const da = ligne.da;
    const prodId = ligne.productionId;
    const evalId = ligne.evaluationId;

    const options = [];

    // Évaluer — non évalué seulement
    if (ligne.statut === 'non-evalue') {
        options.push(`<option value="evaluer|${echapperHtml(da)}|${echapperHtml(prodId)}">Évaluer</option>`);
    }

    // Annoter — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="annoter|${echapperHtml(fichierId)}|${echapperHtml(prodId)}">Annoter</option>`);
    }

    // Consulter — si évaluation existe
    if (evalId) {
        options.push(`<option value="consulter|${echapperHtml(evalId)}">Consulter</option>`);
    }

    // Journal — si évaluation existe
    if (evalId) {
        options.push(`<option value="journal|${echapperHtml(evalId)}">Journal</option>`);
    }

    // Modifier une évaluation remplacée (verrouillée)
    if (evalId && ligne.statut === 'remplacee') {
        options.push(`<option value="modifier-remplacee|${echapperHtml(evalId)}">Modifier l'évaluation</option>`);
    }

    // Dossier PDF — évalué + export dispo
    if (ligne.statut === 'evalue' && typeof travauxExportPDF !== 'undefined') {
        options.push(`<option value="dossier|${echapperHtml(da)}|${echapperHtml(prodId)}">Dossier PDF</option>`);
    }

    // Éditer — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="editer|${echapperHtml(fichierId)}">Modifier</option>`);
    }

    // Beta 99.30 : Renommer — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="renommer|${echapperHtml(fichierId)}">Renommer</option>`);
    }

    // Transférer — si fichier importé, sauf remplacée/non-recevable
    if (fichierId && ligne.statut !== 'remplacee' && ligne.statut !== 'non-recevable') {
        options.push(`<option value="transferer">Transférer</option>`);
    }

    // Associer / Réassocier — si fichier importé (strict ou souple).
    //
    // #931 (22 sept. 2026) — PLUS DE REPLI SUR UNE LIGNE SANS FICHIER. Depuis le
    // 5 mars, une ligne sans fichier offrait quand même « Réassocier », en prenant
    // « un fichier du même DA sous une AUTRE production » — le PREMIER trouvé, sans
    // le nommer. Mesuré chez Grégoire : sur la ligne Exemple × Artefact 2 (rév), le
    // menu a déplacé son vieux « Portrait de lecteur », puis son Artefact 1 annoté
    // et évalué, à la place du fichier importé le matin même (parti à la corbeille
    // par la porte « Remplacer l'existant ? » de `reassignerCopie`, #932). Un
    // fichier qui vit sur une autre production se réassocie DEPUIS SA LIGNE, où le
    // menu sait de quel fichier il parle ; le fichier sans production d'un élève
    // est déjà rattrapé par le match souple ci-dessus (un seul ⇒ `fichierId`).
    // #932 (22 sept. 2026) — le mot est « réassigner » (Grégoire, 22 sept.), et le
    // geste ouvre Propriétés : la seule fenêtre qui MONTRE la copie (vignette, nom
    // de fichier) avant de la déplacer. La modale aveugle d'avant (un seul menu
    // « Production ») est retirée.
    if (fichierId) {
        const labelAssoc = ligne.productionId ? 'Réassigner' : 'Assigner';
        options.push(`<option value="associer|${echapperHtml(fichierId)}|${echapperHtml(da)}">${labelAssoc}</option>`);
    }

    // Supprimer — si fichier importé
    if (fichierId) {
        options.push(`<option value="supprimer|${echapperHtml(fichierId)}|${echapperHtml(da)}">Supprimer</option>`);
    }

    // ✅ AJOUT (16 mars 2026) : Supprimer évaluation orpheline (sans fichier)
    if (!fichierId && evalId) {
        options.push(`<option value="supprimer-eval|${echapperHtml(evalId)}">Supprimer l'évaluation</option>`);
    }

    // Phase 7 #3 : Voir les fichiers multiples — visible si ce (DA × production) a 2+ fichiers
    if (typeof travauxDoublonsUI !== 'undefined' &&
        typeof travauxDoublonsUI.aDoublonPourCas === 'function' &&
        travauxDoublonsUI.aDoublonPourCas(da, prodId)) {
        options.push(`<option value="examiner-doublons|${echapperHtml(da)}|${echapperHtml(prodId)}">Voir les fichiers multiples</option>`);
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
            window.evaluerProduction(parts[1], parts[2]); // #868 : la définition unique vit dans evaluation.js
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
        case 'renommer':
            renommerFichierDepuisListe(parts[1]);
            break;
        case 'transferer':
            if (typeof travauxUI !== 'undefined') {
                travauxUI.ouvrirModalTransfert();
            }
            break;
        case 'associer':
            ouvrirProprieteFichier(parts[1]); // #932 — Propriétés est le geste unique de réassignation
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
        case 'examiner-doublons':
            if (typeof travauxDoublonsUI !== 'undefined' &&
                typeof travauxDoublonsUI.ouvrirModale === 'function') {
                travauxDoublonsUI.ouvrirModale({ da: parts[1], productionId: parts[2] });
            }
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
 * Beta 99.30 : Renomme un fichier depuis le menu Actions de la liste des
 * évaluations. Préserve l'extension d'origine si l'utilisateur l'omet.
 */
function renommerFichierDepuisListe(fichierId) {
    if (typeof travauxStockage === 'undefined') return;
    const fichier = travauxStockage.obtenirFichierParId
        ? travauxStockage.obtenirFichierParId(fichierId)
        : null;
    if (!fichier) {
        alert('Fichier introuvable.');
        return;
    }
    const ancien = fichier.nomFichier || '';
    const matchExt = ancien.match(/\.[^.]+$/);
    const ext = matchExt ? matchExt[0] : '';
    const saisie = prompt('Nouveau nom du fichier :', ancien);
    if (saisie === null) return;
    let nouveau = saisie.trim();
    if (!nouveau || nouveau === ancien) return;
    if (ext && !nouveau.toLowerCase().endsWith(ext.toLowerCase())) {
        nouveau += ext;
    }
    travauxStockage.mettreAJourFichier(fichierId, { nomFichier: nouveau });
    notifications.succes('Fichier renommé : ' + nouveau);
    // Rafraîchir la liste pour refléter le nouveau nom (notamment dans la modale Propriétés)
    if (typeof initialiserListeEvaluations === 'function') {
        initialiserListeEvaluations();
    }
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
 *
 * #932 (22 sept. 2026) — LE GESTE UNIQUE DE RÉASSIGNATION. Cette modale MONTRE la
 * copie (vignette de la première page, nom de fichier en lecture) et c'est elle
 * qu'ouvrent « Réassigner » / « Assigner » du menu Actions et « Non associé › ».
 * Son enregistrement passe l'élève et la production par `travauxUI.reassignerCopie`
 * (porte de conflit qui nomme les fichiers, #931) et ATTEND le verdict : sur
 * refus, la modale reste ouverte et rien n'est écrit. Avant, elle appelait
 * `reassocierFichier` nu : deux copies d'un même élève × production pouvaient
 * coexister sans question ni corbeille.
 * Le jeton de reprise (#561), qui vivait dans la modale aveugle retirée, vit ici :
 * une case sous la production, visible quand les jetons sont actifs.
 *
 * @param {string} fichierId - ID du fichier à modifier
 */
function ouvrirProprieteFichier(fichierId) {
    var fichier = (typeof travauxStockage !== 'undefined')
        ? travauxStockage.obtenirFichierParId(fichierId) : null;
    if (!fichier) return;

    // La copie qu'on déplace, visible AVANT le geste.
    var vignette = (typeof travauxStockage.obtenirThumbnailSync === 'function') ? (travauxStockage.obtenirThumbnailSync(fichierId) || '') : '';
    var nomAffiche = (typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : (fichier.nomFichier || '')) || fichier.id;
    var extension = ((fichier.nomFichier || '').match(/\.([a-z0-9]{2,4})$/i) || [])[1];
    var etiquetteType = extension ? extension.toUpperCase() : (/pdf/i.test(fichier.typeMIME || '') ? 'PDF' : 'IMG');
    var meta = [];
    if (fichier.nombrePages) meta.push(fichier.nombrePages + (fichier.nombrePages > 1 ? ' pages' : ' page'));
    if (fichier.tailleFichier && window.TailleFichier) meta.push(window.TailleFichier.dire(fichier.tailleFichier, { decimales: 1 }));
    var apercuHTML =
        '<div class="prop-fichier-apercu">' +
            (vignette
                ? '<img class="prop-fichier-vignette" src="' + echapperHtml(vignette) + '" alt="">'
                : '<div class="prop-fichier-vignette prop-fichier-vignette-vide" data-thumbnail-id="' + echapperHtml(fichierId) + '"><span>' + echapperHtml(etiquetteType) + '</span></div>') +
            '<div class="prop-fichier-apercu-info">' +
                '<span class="prop-fichier-apercu-nom" id="prop-fichier-apercu-nom" title="' + echapperHtml(nomAffiche) + '">' + echapperHtml(nomAffiche) + '</span>' +
                (meta.length ? '<span class="prop-fichier-apercu-meta">' + echapperHtml(meta.join(' · ')) + '</span>' : '') +
            '</div>' +
        '</div>';

    // Jeton de reprise (#561) : une case, visible seulement quand les jetons sont actifs.
    var configJetons = (typeof obtenirConfigJetons === 'function') ? obtenirConfigJetons() : null;
    var blocJeton = (configJetons && configJetons.actif)
        ? '<label class="prop-fichier-jeton"><input type="checkbox" id="prop-fichier-jeton-reprise"> Cette copie est une reprise : appliquer un jeton de reprise sur la production choisie</label>'
        : '';

    // Étudiants du groupe actif
    var etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif() : [];
    etudiants.sort(function(a, b) {
        return (a.nom || '').localeCompare(b.nom || '') || (a.prenom || '').localeCompare(b.prenom || '');
    });
    var optionsEtudiants = etudiants.map(function(e) {
        // #1075, point 1 : en anonymisation, le DA affiché est celui du réglage (masqué par défaut).
        var label = (e.nom || '') + ', ' + (e.prenom || '') + ' (' + obtenirDAAffichage(e) + ')';
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
        var niv = _niveauAffiche(e);   // #941 lot S1 (et plus de « undefined » sans niveau)
        var note = e.noteFinale != null ? ' \u2014 ' + (niv ? niv + ' ' : '') + formaterNotePourcentage(e.noteFinale) : '';
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
            '<button class="modal-fermer" data-action="fermerOverlayParent"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>' +
            '<h3 class="modal-titre">Propri\u00e9t\u00e9s du fichier</h3>' +
            apercuHTML +
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
            blocJeton +
            '<label style="font-size: 0.85em; color: var(--texte-secondaire);">\u00c9valuation li\u00e9e :</label>' +
            '<select id="prop-fichier-evaluation" class="controle-form" style="margin: 4px 0 16px 0; width: 100%;">' +
                '<option value="">\u2014 Aucune \u2014</option>' +
                optionsEvals +
            '</select>' +
            '<small style="display:block;color:var(--gris-moyen);margin:-12px 0 16px 0;font-size:0.75em">Lier ce fichier \u00e0 une \u00e9valuation sp\u00e9cifique (originale ou reprise).</small>' +
            '<div class="modal-actions" style="display:flex;gap:8px">' +
                '<button class="btn btn-confirmer" id="prop-fichier-btn-sauver">Enregistrer</button>' +
                '<button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    // La vignette absente du cache mémoire se charge depuis IndexedDB, comme dans le carrousel.
    if (!vignette && typeof travauxStockage.chargerThumbnailsConteneur === 'function') {
        travauxStockage.chargerThumbnailsConteneur(overlay);
    }

    var fermer = function() { overlay.remove(); };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) fermer(); });

    document.getElementById('prop-fichier-btn-sauver').onclick = async function() {
        var nouveauNom = (document.getElementById('prop-fichier-nom') || {}).value || fichier.nomFichier;
        var nouveauDA = (document.getElementById('prop-fichier-etudiant') || {}).value || '';
        var nouvelleProd = (document.getElementById('prop-fichier-production') || {}).value || '';
        var nouvelleEval = (document.getElementById('prop-fichier-evaluation') || {}).value || '';
        var caseJeton = document.getElementById('prop-fichier-jeton-reprise');
        var appliquerJeton = !!(caseJeton && caseJeton.checked);
        var modifie = false;

        // #932 — l'élève ET la production passent par le geste unique, qui porte la
        // porte de conflit ; on ATTEND son verdict (#561). Sur refus : la modale
        // reste ouverte, rien n'est écrit (ni le nom, ni l'évaluation liée).
        var association = {};
        if (nouveauDA !== (fichier.etudiantDA || '')) association.etudiantDA = nouveauDA;
        if (nouvelleProd !== (fichier.productionId || '')) association.productionId = nouvelleProd;
        if (Object.keys(association).length > 0) {
            if (typeof travauxUI === 'undefined' || typeof travauxUI.reassignerCopie !== 'function') {
                notifications.erreur('Réassignation impossible', 'Le module des copies n’est pas chargé.');
                return;
            }
            var reassigne = await travauxUI.reassignerCopie(fichierId, association);
            if (!reassigne) {
                notifications.info('Réassignation annulée', 'La copie garde son étudiant·e et sa production ; rien n’a été modifié.');
                return;
            }
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

        // Jeton de reprise (#561) : APRÈS le verdict de la réassignation, jamais avant.
        // En dernier : l'évaluation de reprise qu'il crée devient l'évaluation liée.
        if (appliquerJeton && nouvelleProd) {
            await appliquerJetonRepriseSurCopie(fichierId, nouveauDA, nouvelleProd);
            modifie = true;
        }

        if (modifie) {
            notifications.succes('Propriétés mises à jour');
        }
        fermer();
        appliquerFiltres();
    };
}
window.ouvrirProprieteFichier = ouvrirProprieteFichier;

/**
 * Marque une copie comme reprise et applique le jeton sur l'évaluation active de
 * (élève × production), si elle existe. Ne s'appelle qu'APRÈS un verdict vrai de
 * `travauxUI.reassignerCopie` (#561) : posé avant, le jeton se consommait sur
 * l'ANCIENNE production.
 * @param {string} fichierId
 * @param {string} da
 * @param {string} productionId
 */
async function appliquerJetonRepriseSurCopie(fichierId, da, productionId) {
    travauxStockage.mettreAJourFichier(fichierId, { estReprise: true });
    var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    var evalActive = evaluations.find(function(e) {
        return e.etudiantDA === da && e.productionId === productionId && !e.remplaceeParId;
    });
    if (evalActive && typeof appliquerJetonReprise === 'function') {
        var nouvelleEval = await appliquerJetonReprise(evalActive.id);   // #1007 (2a-2) : async
        if (nouvelleEval) {
            travauxStockage.mettreAJourFichier(fichierId, { evaluationId: nouvelleEval.id });
        }
    }
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

    // Garde-fou reprise : si une reprise (ou un original « remplacé ») existe pour
    // ce travail, supprimer le fichier ne défait PAS la reprise → on oriente vers
    // le bon geste. Bug Grégoire 8 juin 2026.
    let avertissementReprise = '';
    try {
        const evalsTrim = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const contexteReprise = !!fichier && _travailLieAUneReprise(evalsTrim, da, fichier.productionId);
        if (contexteReprise) {
            avertissementReprise = `
            <p style="margin: 0 0 16px 0; padding: 10px 12px; font-size: 0.85em; background: var(--alerte-fond-attention); color: var(--alerte-texte-attention); border-left: 3px solid var(--alerte-bordure-attention); border-radius: 6px;">
                Ce travail est lié à une reprise. Déplacer le fichier à la corbeille ne retire ni la reprise ni le statut « remplacée » de l'évaluation d'origine. Pour annuler la reprise, supprime plutôt l'évaluation de reprise (ou décoche le jeton de reprise dans la page d'évaluation).
            </p>`;
        }
    } catch (e) { /* défensif : un échec de détection ne doit pas bloquer la suppression */ }

    // Retirer une modale existante
    const existante = document.getElementById('supprimer-fichier-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'supprimer-fichier-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre">Déplacer à la corbeille ?</h3>
            <p style="margin: 8px 0 16px 0; font-size: 0.9em;">
                Déplacer le fichier de <strong>${echapperHtml(nomEtudiant)}</strong> à la corbeille ?<br>
                <span style="color: var(--texte-secondaire); font-size: 0.9em;">${echapperHtml(nomFichier)}</span>
            </p>
            <p style="margin: 0 0 16px 0; font-size: 0.85em; color: var(--texte-secondaire);">
                Le fichier pourra être restauré pendant 30 jours.
            </p>
            ${avertissementReprise}
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
        notifications.succes(`Fichier de ${nomEtudiant} déplacé à la corbeille.`);
        _rafraichirApresCorbeille();
    };
}

// ============================================
// ACTIONS SUR LES ÉVALUATIONS
// ============================================

/**
 * Attache les événements aux boutons d'action
 */
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
            sessionStorage.setItem(cle('travaux-filtre-production'), evaluation.productionId);
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
 * L'évaluation ORIGINALE qu'une reprise a archivée, ou `null`. Lecture seule :
 * sert aussi bien à décider la restauration qu'à ANNONCER, dans la question de
 * confirmation, ce que la suppression va emporter.
 * @param {Array} evaluations - toutes les évaluations (contient la reprise)
 * @param {string} evaluationId - id de la reprise supprimée
 * @returns {object|null} l'originale à restaurer, ou null.
 */
function trouverOriginaleRemplaceePar(evaluations, evaluationId) {
    if (!Array.isArray(evaluations)) return null;
    // Le lien fait foi du côté de l'ORIGINALE (remplaceeParId === id supprimé).
    // Ne PAS exiger le lien réciproque (repriseDeId) : une reprise peut l'avoir
    // perdu (état orphelin du bug #141 — l'ancienne branche « entériner » de
    // retirerJetonReprise effaçait les props de la reprise sans toucher
    // l'originale). Le garde-fou du 8 juin (#136) reste : on ne restaure que
    // l'originale qui pointe précisément l'évaluation supprimée.
    // #360 (Option A) — IGNORER un marqueur de réconciliation de doublon :
    // `reconcilieParDoublon` pose `remplaceeParId` pour exclure un doublon
    // note-égale du moteur, MAIS ce n'est PAS une originale archivée par une
    // reprise. Sans ce garde, supprimer le survivant « restaurerait » (=
    // ressusciterait) le doublon → re-double-compte silencieux.
    return evaluations.find(e => e && e.remplaceeParId === evaluationId && !e.reconcilieParDoublon) || null;
}

/**
 * Restaure l'évaluation originale quand on supprime/retire une reprise.
 * Mutation in-place du tableau fourni.
 * @param {Array} evaluations - toutes les évaluations (contient la reprise)
 * @param {string} evaluationId - id de la reprise supprimée
 * @returns {boolean} true si une originale a été restaurée.
 */
function restaurerOriginaleSiReprise(evaluations, evaluationId) {
    // #612 (T6.6) — la RECHERCHE est extraite parce que la confirmation doit
    // annoncer le sort du fichier AVANT que la mutation ait décidé. Un seul
    // critère pour les deux lectures : deux copies finiraient par diverger sur
    // la garde #360.
    const originale = trouverOriginaleRemplaceePar(evaluations, evaluationId);
    if (!originale) return false;
    delete originale.remplaceeParId;
    delete originale.dateRemplacement;
    delete originale.archivee;
    delete originale.dateArchivage;
    return true;
}

/**
 * Supprime une évaluation. DÉFINITION UNIQUE — voir #557.
 *
 * ⚠ IL Y EN AVAIT DEUX. `evaluation.js` en portait une seconde, sans la
 * restauration de l'originale (correctif du 8 juin) ni la tolérance aux
 * évaluations orphelines (correctif du 16 mars). `evaluation.js` étant chargé
 * APRÈS `liste-evaluations.js`, c'est cette version-là qui gagnait `window` —
 * et donc tous les appels venus du profil étudiant et du sidebar d'évaluation.
 * ⮕ Supprimer une reprise depuis le profil laissait son originale « remplacée »
 * à jamais, sans aucun moyen de la récupérer.
 * ⮕ Les deux apports de la version retirée sont absorbés ici : la garde
 * « évaluation introuvable » et la confirmation qui NOMME ce qu'on détruit.
 */
async function supprimerEvaluation(evaluationId) {
    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(ev => ev.id === evaluationId);

    // #557 : absorbé de la version retirée d'`evaluation.js`. Sans cette garde,
    // un identifiant périmé faisait un filtrage sans effet, suivi d'une
    // notification de succès — on annonçait une suppression qui n'avait pas eu lieu.
    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier si l'évaluation est verrouillée
    // ✅ CORRIGÉ (16 mars 2026) : permettre la suppression d'une éval verrouillée
    // si le fichier source n'existe plus (évaluation orpheline, pas de moyen de déverrouiller)
    if (evaluation.verrouillee) {
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
            notifications.erreur('Suppression impossible', 'Cette évaluation est verrouillée. Déverrouillez-la d\'abord.');
            return;
        }
        // Fichier absent → évaluation orpheline, on permet la suppression
    }

    // #557 : absorbé de la version retirée d'`evaluation.js`. La confirmation
    // NOMME ce qu'on détruit — depuis le profil étudiant ou le sidebar, rien à
    // l'écran ne rappelle sur quelle évaluation le clic vient de porter.
    const quoi = (evaluation.etudiantNom && evaluation.productionNom)
        ? `l'évaluation de ${evaluation.etudiantNom} pour ${evaluation.productionNom}`
        : 'cette évaluation';
    // #612 (T6.6) — MÊME TROU QUE #607, AUTRE PORTE. Supprimer une reprise
    // restaure son originale (plus bas) et laissait le fichier remis pour la
    // reprise ACTIF : `evaluationId` mort, mais `dateModification` la plus
    // récente de la paire. La liste résout le fichier de chaque ligne SANS `id`
    // (`:60`), donc par le repli (DA, production) → « le plus récent ». La ligne
    // de l'originale restaurée ouvrait donc le travail de la reprise effacée.
    // Compté ICI, avant la question, pour que la question le DISE — même
    // exigence que les deux `confirm` du retrait de jeton.
    const emporteUneReprise = !!trouverOriginaleRemplaceePar(evaluations, evaluationId);
    const nbFichiersAnnonces = (emporteUneReprise && typeof window._compterFichiersDeEvaluation === 'function')
        ? window._compterFichiersDeEvaluation(evaluationId)
        : 0;
    const mentionFichiers = nbFichiersAnnonces
        ? `\n\nLe ou les ${nbFichiersAnnonces} fichier(s) remis pour la reprise iront à la corbeille (récupérables 30 jours).`
        : '';

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('evaluation'))) return;
    if (!confirm(`Veux-tu vraiment supprimer ${quoi} ?${mentionFichiers}\n\nCette action est irréversible.`)) {
        return;
    }
    // #1007 (relecture de Cowork) : la fenêtre a pu attendre des minutes (une mise à jour du
    // codex) ; une écriture de la même clé pendant ce temps serait perdue. On écrit à partir
    // de ce qui est en base MAINTENANT, pas de la lecture d'avant l'attente.
    evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    if (!evaluations.some(ev => ev.id === evaluationId)) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // COHÉRENCE REPRISE : supprimer une reprise restaure son évaluation originale
    // (retire le statut « remplacée »). Mutation in-place reflétée dans le tableau
    // filtré (objets partagés). Bug Grégoire 8 juin 2026.
    const originaleRestauree = restaurerOriginaleSiReprise(evaluations, evaluationId);

    const evaluationsFiltered = evaluations.filter(ev => ev.id !== evaluationId);

    // Lot B de l'enregistrement (#618) : sur un échec, rien de ce qui suit — ni détachement
    // du fichier, ni message « Évaluation supprimée ». Le témoin commun dit l'échec.
    // ⚠ (relecture de Cowork, « commenter ») `restaurerOriginaleSiReprise` a déjà muté le tableau
    // lu : pour une clé servie par le cache mémoire de `db`, la séance peut voir l'originale
    // restaurée jusqu'au rechargement. Même famille que le cadenas (R4) ; sans suite.
    if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluationsFiltered,
        { geste: 'Suppression de l\'évaluation' }) !== true) return;

    // #612 (T6.6) — le fichier de la reprise part avec elle. Le geste vit dans
    // `evaluation-jetons.js` (#607) et n'est pas réécrit ici : une seconde
    // définition finirait par diverger de la première (leçon #557).
    //
    // ORDRE : le détachement suit IMMÉDIATEMENT l'écriture des évaluations,
    // sans point d'attente entre les deux — et seulement si l'écriture a
    // VRAIMENT eu lieu (retour plus haut). Détacher plus tôt, ou sur un refus,
    // mettrait le fichier à la corbeille pour une suppression qui n'a pas eu
    // lieu — un état incohérent définitif.
    let nbFichiersCorbeille = 0;
    if (originaleRestauree
        && typeof window._detacherFichiersDeEvaluation === 'function') {
        nbFichiersCorbeille = window._detacherFichiersDeEvaluation(evaluationId, 'corbeille');
    }


    // Recalculer les indices C et P
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir complètement le tableau
    initialiserListeEvaluations();

    // Notification de succès
    notifications.succes(originaleRestauree
        ? 'Reprise supprimée, originale restaurée'
            + (nbFichiersCorbeille ? ' — ' + nbFichiersCorbeille + ' fichier(s) de reprise mis à la corbeille' : '')
        : 'Évaluation supprimée');
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
        notifications.erreur('Erreur', 'Évaluation introuvable');
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

// #572 (29 août 2026) — `toggleVerrouillerEvaluation` retirée : aucun appelant, aucun
// `data-action` (le verrouillage passe par `basculerVerrouillageEvaluationCourante`).

// #902 (17 sept. 2026) — le tri par liste déroulante est RETIRÉ : `#tri-evaluations` n'existe
// nulle part (ni `index.html`, ni HTML généré), `trierLignes` n'avait aucun appelant,
// `obtenirIndicesEtudiant` n'était appelée que par elle (et lisait deux formats absents :
// `indicesCP[da].actuel.PAN|SOM` et `indicesAssiduite[da].actuel.indice` — A, C et P valaient 0),
// et `trierListeEvaluations` (« appelée par le select de tri ») n'avait ni appelant ni `data-action`.
// Le tri vivant est celui des en-têtes de colonne, ci-dessous. Stock : le champ `tri` déjà écrit
// dans `filtresListeEvaluations` reste chez les gens, sans lecteur — inoffensif.

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
    // #570 — les flèches de la LISTE portent `tri-eval-*`. Elles s'appelaient
    // `tri-da`, `tri-nom`, `tri-prenom` comme celles du tableau des ÉTUDIANTS
    // (`etudiants.js`) : `getElementById` atteignait le premier tableau du DOM,
    // et trier la Liste par DA ne changeait jamais sa propre flèche.
    ['da', 'nom', 'prenom', 'production', 'jetons', 'niveau', 'niveauIDME', 'note'].forEach(col => {
        const elem = document.getElementById(`tri-eval-${col}`);
        if (elem) elem.textContent = '↕';
    });

    // Mettre à jour l'indicateur actif
    const elemActif = document.getElementById(`tri-eval-${triEvaluationsActuel.colonne}`);
    if (elemActif) {
        elemActif.textContent = triEvaluationsActuel.ordre === 'asc' ? '↑' : '↓';
    }
}

/**
 * Trie un tableau de lignes selon la colonne et l'ordre actuel
 * @param {Array} lignes - Tableau de lignes à trier
 * @param {Object} [tri] - `{ colonne, ordre }` — l'état du tri du module par
 *   défaut. Paramètre ouvert par #575 pour que la sentinelle exerce le tri
 *   RÉEL sans piloter l'écran : l'état vit en portée de module, il n'est pas
 *   posable de l'extérieur. Aucun appelant applicatif ne le passe.
 * @returns {Array} - Tableau trié
 */
function trierLignesParColonne(lignes, tri) {
    if (!lignes || lignes.length === 0) return lignes;

    const triLu = tri || triEvaluationsActuel;

    // Créer une copie pour ne pas modifier l'original
    const lignesTriees = [...lignes];
    const asc = triLu.ordre === 'asc';

    // #575 — LE RANG D'UN NIVEAU SE LIT DANS SON ÉCHELLE, ET IL SE LIT UNE FOIS.
    // Le comparateur est appelé O(n log n) fois et chaque résolution d'échelle
    // lit le stockage : la lecture se fait donc AVANT le tri, une fois par
    // échelle distincte. `null` = code étranger à l'échelle, ou aucune échelle
    // résolue — ces lignes n'ont pas de place dans l'ordre (voir plus bas).
    const rangs = new Map();
    if (triLu.colonne === 'niveauIDME') {
        const niveauxParEchelle = new Map();
        lignesTriees.forEach(ligne => {
            const cleEchelle = ligne.echelleId || '';
            if (!niveauxParEchelle.has(cleEchelle)) {
                niveauxParEchelle.set(cleEchelle, (typeof niveauxOrdonnesDeLEchelle === 'function')
                    ? niveauxOrdonnesDeLEchelle(ligne.echelleId || null)
                    : []);
            }
            const cible = String(ligne.niveauFinal || '').trim().toUpperCase();
            const trouve = niveauxParEchelle.get(cleEchelle).find(n => n.code === cible);
            rangs.set(ligne, trouve ? trouve.rang : null);
        });
    }

    // Fonction de comparaison
    lignesTriees.sort((a, b) => {
        let valeurA, valeurB;

        switch (triLu.colonne) {
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
                    'reprise-ciblee': 2,      // #572 — classée avec les reprises, plus avec les lignes sans jeton
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

            case 'niveauIDME': {
                // #575 — la table `{ I:1, D:2, M:3, E:4, '-':5 }` est partie.
                // Hors IDME, elle rendait 5 à TOUTES les lignes : cliquer sur
                // l'en-tête ne triait rien, en silence.
                //
                // ⮕ Une ligne sans rang lisible reste en FIN dans les deux sens.
                // Avant, le `?? 5` la faisait remonter en tête au tri
                // décroissant : les non-évaluées passaient devant les évaluées.
                // Une absence de niveau n'est pas un niveau élevé.
                const rangA = rangs.get(a);
                const rangB = rangs.get(b);
                if (rangA == null && rangB == null) return 0;
                if (rangA == null) return 1;
                if (rangB == null) return -1;
                return asc ? rangA - rangB : rangB - rangA;
            }

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

// #934 — la première colonne est la case de sélection (non masquable) : les rangs
// commencent à 2.
const colonneIndexMap = {
    'da': 2,
    'nom': 3,
    'prenom': 4,
    'production': 5,
    'jeton': 6,
    'statut': 7,
    'niveau': 8,
    'note': 9
};

/**
 * Fait correspondre l'en-tête du tableau à la vue affichée.
 *
 * #606 — La corbeille écrivait ses lignes dans le tableau des évaluations et
 * héritait de SON en-tête, qui nomme de tout autres données : « Prénom »
 * surmontait un nom de fichier, « Statut » une date de suppression, « Niveau »
 * un nombre de jours. Les colspan des lignes de corbeille (2 puis 3) achevaient
 * de décaler la lecture, et masquer une colonne dans le sélecteur décalait les
 * cellules d'un cran de plus — le sélecteur agit par rang de cellule, pas par
 * colonne logique.
 *
 * Les deux rangées d'en-tête vivent dans `index.html` ; une seule est visible.
 * Le sélecteur de colonnes disparaît avec la vue Évaluations : ses colonnes
 * n'existent pas dans la corbeille, et l'y laisser en ferait un levier qui
 * abîme l'alignement sans rien dire.
 */
function appliquerEnTeteSelonVue() {
    const enteteEval = document.getElementById('entete-evaluations');
    const enteteCorbeille = document.getElementById('entete-corbeille');
    const selecteurColonnes = document.getElementById('eval-colonnes-selecteur');

    if (enteteEval) enteteEval.classList.toggle('u-hide', vueCorbeilleActive);
    if (enteteCorbeille) enteteCorbeille.classList.toggle('u-hide', !vueCorbeilleActive);
    if (selecteurColonnes) selecteurColonnes.classList.toggle('u-hide', vueCorbeilleActive);
}

function toggleColonneEval(checkbox) {
    // #606 — La corbeille n'a pas ces colonnes. Agir ici décalerait ses cellules
    // sans que rien ne le dise. Le sélecteur est masqué dans cette vue ; cette
    // garde tient aussi pour un appel programmatique (restauration des
    // préférences au retour à la liste).
    if (vueCorbeilleActive) return;

    const colonne = checkbox.getAttribute('data-colonne');
    const index = colonneIndexMap[colonne];
    if (!index) return;

    const tableau = document.querySelector('#conteneur-tableau-evaluations .tableau');
    if (!tableau) return;

    // #606 — Portée RESTREINTE à la rangée d'en-tête des évaluations : depuis
    // qu'une seconde rangée existe, un `th:nth-child(n)` non qualifié atteignait
    // aussi la colonne de même rang dans l'en-tête de la corbeille.
    const cellules = tableau.querySelectorAll(`#entete-evaluations th:nth-child(${index}), tbody td:nth-child(${index})`);
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
// `vueCorbeilleActive` est déclaré en tête du module (#606) : ses lecteurs
// vivent bien plus haut dans le fichier.

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
    appliquerEnTeteSelonVue();

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

    // #606 — posé ici aussi : cette fonction est rappelée directement après une
    // restauration ou une suppression, sans repasser par `basculerVueCorbeille`.
    appliquerEnTeteSelonVue();

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

    if (compteur) compteur.textContent = `Corbeille — ${corbeille.length} ${window.pluriel(corbeille.length, 'fichier', 'fichiers')}`;

    // Masquer la moyenne et les productions
    const elemMoyenne = document.getElementById('moyenne-evaluations');
    if (elemMoyenne) elemMoyenne.textContent = '';
    const elemNbProductions = document.getElementById('nb-productions');
    if (elemNbProductions) elemNbProductions.textContent = '';

    // Bandeau d'information + bouton vider.
    // #606 — colspan 6 : la corbeille a SIX colonnes (Élève, Fichier,
    // Production, Supprimé le, Expire dans, Actions), pas les neuf du tableau
    // des évaluations.
    let html = `<tr><td colspan="6" style="padding: 10px 12px; background: var(--surface-alt);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.85em; color: var(--texte-secondaire);">Les fichiers sont supprimés automatiquement après 30 jours.</span>
            <button class="btn btn-danger btn-sm" data-action="viderTouteCorbeille">Vider la corbeille</button>
        </div>
    </td></tr>`;

    for (const fichier of corbeille) {
        const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
        const nomEtudiant = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : fichier.etudiantDA;
        const production = productions.find(p => p.id === fichier.productionId);
        const nomProduction = production ? (production.titre || production.nom || '—') : (fichier.productionId || '—');   // #572 — une production porte `titre`
        const nomFichier = fichier.nomFichier || fichier.id;

        const dateSup = new Date(fichier.dateSuppression);
        const dateAffichee = dateSup.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });

        // Calculer les jours restants avant expiration
        const msRestants = (dateSup.getTime() + 30 * 24 * 60 * 60 * 1000) - Date.now();
        const joursRestants = Math.max(0, Math.ceil(msRestants / (24 * 60 * 60 * 1000)));

        // #606 — Une cellule par colonne, dans l'ordre de `#entete-corbeille`.
        // Les colspan d'avant (2 sur l'élève, 3 sur les actions) servaient à
        // remplir les neuf colonnes d'un en-tête emprunté : ils décalaient la
        // lecture au lieu de l'aligner.
        html += `<tr>
            <td class="td-left">${echapperHtml(nomEtudiant)}</td>
            <td class="td-left">${echapperHtml(nomFichier)}</td>
            <td class="td-left">${echapperHtml(nomProduction)}</td>
            <td class="td-center">${dateAffichee}</td>
            <td class="td-center">${joursRestants} jour(s)</td>
            <td class="td-center">
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

    notifications.succes('Fichier restauré.');

    mettreAJourBoutonCorbeille();
    if (vueCorbeilleActive) {
        afficherVueCorbeille();
    } else {
        appliquerFiltres();
    }
}

/**
 * #560 (3 septembre 2026) — « du couple » = même élève, même production que le
 * fichier. C'est EXACTEMENT ce que la suppression définitive emporte : originale,
 * reprises, évaluation d'un fichier réimporté (tranché par Grégoire le 2 septembre ;
 * le code le faisait déjà, l'écran ne le disait pas). Le prédicat est UNIQUE : la
 * modale le lit pour annoncer, le filtre le lit pour détruire. Deux prédicats
 * auraient pu diverger sans qu'aucun test ne le voie.
 * @param {Object} objet - une évaluation, ou un autre fichier (mêmes champs)
 * @param {Object} fichier - le fichier qu'on supprime
 * @returns {boolean}
 */
function estDuCoupleDuFichier(objet, fichier) {
    return !!(fichier && fichier.etudiantDA && fichier.productionId && objet &&
        objet.etudiantDA === fichier.etudiantDA && objet.productionId === fichier.productionId);
}

/**
 * #560 — combien d'évaluations partent avec ce fichier. Fonction PURE : on lui
 * donne la liste, elle ne lit aucun magasin. C'est le compte que la modale lit
 * pour choisir entre « rien de plus » et la phrase arrêtée par Grégoire.
 * @param {Object} fichier - le fichier à supprimer
 * @param {Array} evaluations - les évaluations du trimestre (la source que la destruction filtre)
 * @returns {number}
 */
function compterEvaluationsDuCouple(fichier, evaluations) {
    return (evaluations || []).filter(function(ev) { return estDuCoupleDuFichier(ev, fichier); }).length;
}

/**
 * Supprime définitivement un fichier de la corbeille avec confirmation
 */
async function supprimerFichierDefinitivement(id) {
    if (typeof travauxStockage === 'undefined') return;

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('copieCorbeille'))) return;
    // #560 (3 septembre 2026) — la portée est MESURÉE à l'ouverture, sur les
    // mêmes sources que la destruction : la corbeille pour le fichier,
    // `cle('evaluationsSauvegardees')` pour ce qui part avec lui.
    const fichierCible = travauxStockage.obtenirCorbeille().find(function(f) { return f.id === id; }) || { id: id };
    const nbEvaluations = compterEvaluationsDuCouple(fichierCible, db.getSync(cle('evaluationsSauvegardees'), []));

    // Témoin négatif : sans évaluation qui parte avec lui, le fichier se supprime
    // sans un mot de plus — la phrase d'avant, telle quelle. Sinon, les mots
    // arrêtés par Grégoire le 2 septembre 2026 au soir, tels quels (tranché :
    // TOUT ce qui touche le couple élève × production part — originale, reprises,
    // évaluation d'un fichier réimporté).
    const phrasePortee = nbEvaluations > 0
        ? 'Le fichier, ses annotations et toutes les évaluations de cet élève pour cette production seront effacés.'
        : 'Le fichier sera supprimé de façon permanente.';

    const existante = document.getElementById('supprimer-definitif-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'supprimer-definitif-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre">Supprimer définitivement ?</h3>
            <p style="margin: 8px 0 16px 0; font-size: 0.9em;">
                ${phrasePortee}
            </p>
            <p style="margin: 0 0 16px 0; font-size: 0.85em; color: var(--alerte-texte-attention);">
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

        // Nettoyer les évaluations liées — par le MÊME prédicat que la modale a lu
        // pour annoncer la portée (#560) : ce qu'on détruit est ce qu'on a dit.
        // Lecture directe (read-modify-write : lire TOUTES les évaluations pour réécrire sans perte) ;
        // l'ÉCRITURE, elle, passe par le garde des modes (#560).
        var nbEvalsRetirees = 0;
        if (fichier && fichier.etudiantDA && fichier.productionId) {
            var evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
            var avant = evaluations.length;
            evaluations = evaluations.filter(function(ev) {
                return !estDuCoupleDuFichier(ev, fichier);
            });
            if (evaluations.length < avant) {
                // #560 — par le garde des modes, comme `supprimerEvaluation`. Depuis le lot A
                // de l'enregistrement (26 sept. 2026), l'anonymisation y écrit comme le mode normal.
                // Lot B (#618) : « Fichier et N évaluations supprimés » ne compte que ce qui
                // l'a vraiment été. Sur un échec, le message dit le fichier seul (il est
                // bien supprimé) et le témoin commun dit l'échec pour les évaluations.
                if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations,
                    { geste: 'Suppression des évaluations du fichier' }) === true) {
                    nbEvalsRetirees = avant - evaluations.length;
                }
                // Tier 6.3 : Invalider les caches de moyennes
                window._moyennesQualifies = null;
                window._moyennesToutes = null;
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }
            }
        }

        overlay.remove();
        // #560 — le message d'après dit ce qui est parti, pas ce qu'on croyait partir :
        // « et évaluation » s'affichait même quand aucune n'existait, ou quand
        // l'écriture venait d'être refusée quelques lignes plus haut.
        notifications.succes(nbEvalsRetirees > 0
            ? `Fichier et ${nbEvalsRetirees} ${pluriel(nbEvalsRetirees, 'évaluation', 'évaluations')} supprimés définitivement.`
            : 'Fichier supprimé définitivement.');
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
async function viderTouteCorbeille() {
    if (typeof travauxStockage === 'undefined') return;

    const corbeille = travauxStockage.obtenirCorbeille();
    if (corbeille.length === 0) return;

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('corbeille'))) return;
    // #560 — ce qui part avec les fichiers, compté sur la même source et par le
    // même prédicat que la destruction ; rien de plus n'est dit s'il n'y a rien.
    const nbEvalsLiees = db.getSync(cle('evaluationsSauvegardees'), [])
        .filter(function(ev) { return corbeille.some(function(f) { return estDuCoupleDuFichier(ev, f); }); }).length;
    const phraseEvalsLiees = nbEvalsLiees > 0 ? `
            <p style="margin: 0 0 16px 0; font-size: 0.9em;">
                ${nbEvalsLiees} ${pluriel(nbEvalsLiees, 'évaluation liée à ces fichiers partira', 'évaluations liées à ces fichiers partiront')} avec eux.
            </p>` : '';

    const existante = document.getElementById('vider-corbeille-modal-overlay');
    if (existante) existante.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vider-corbeille-modal-overlay';
    overlay.className = 'modal-overlay actif';
    overlay.innerHTML = `
        <div class="modal-contenu modal-compact" style="max-width: 440px;">
            <button class="modal-fermer" data-action="fermerOverlayParent"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre">Vider la corbeille ?</h3>
            <p style="margin: 8px 0 16px 0; font-size: 0.9em;">
                Supprimer définitivement les <strong>${corbeille.length}</strong> fichier(s) de la corbeille ?
            </p>${phraseEvalsLiees}
            <p style="margin: 0 0 16px 0; font-size: 0.85em; color: var(--alerte-texte-attention);">
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
        // ✅ #556 (28 août 2026) : on détruit EXACTEMENT l'ensemble annoncé — la liste
        // capturée au moment de l'affichage, celle dont le nombre est écrit dans la modale.
        // Deux défauts se refermaient ici : `viderCorbeille()` sans argument détruisait la
        // corbeille de TOUS les groupes-cours du trimestre, et cette relecture pouvait
        // rendre un autre ensemble que l'affiché si le groupe-cours actif changeait entre
        // l'ouverture de la modale et le clic de confirmation.
        var fichiersCorbeille = corbeille;
        await travauxStockage.viderCorbeille(fichiersCorbeille);

        // Nettoyer les évaluations liées à chaque fichier supprimé
        // Lecture directe (read-modify-write : lire TOUTES les évaluations pour réécrire sans perte) ;
        // l'ÉCRITURE, elle, passe par le garde des modes (#560).
        if (fichiersCorbeille.length > 0) {
            var evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
            var avant = evaluations.length;
            evaluations = evaluations.filter(function(ev) {
                return !fichiersCorbeille.some(function(f) {
                    return estDuCoupleDuFichier(ev, f);
                });
            });
            if (evaluations.length < avant) {
                // #560 — même garde que ci-dessus. « Corbeille vidée. » reste vrai sur un échec
                // (les fichiers sont partis) ; le témoin commun dit celui des évaluations.
                sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations,
                    { geste: 'Suppression des évaluations de la corbeille' });
                // Tier 6.3 : Invalider les caches de moyennes
                window._moyennesQualifies = null;
                window._moyennesToutes = null;
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }
            }
        }

        overlay.remove();
        notifications.succes('Corbeille vidée.');
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
window.consulterEvaluationDepuisListe = consulterEvaluationDepuisListe;
window.supprimerEvaluation = supprimerEvaluation;
window._restaurerOriginaleSiReprise = restaurerOriginaleSiReprise;
window.modifierEvaluationRemplacee = modifierEvaluationRemplacee;
window.calculerEtSauvegarderIndiceCompletion = calculerEtSauvegarderIndiceCompletion;
window.trierTableauParColonne = trierTableauParColonne;
// #575 — exposée pour la sentinelle `sentinelle-575-ordre-niveaux-derive-echelle`,
// qui exerce le tri réel plutôt qu'une copie. Même convention que
// `window._restaurerOriginaleSiReprise` : le souligné dit « pas une API ».
window._trierLignesParColonne = trierLignesParColonne;
window._genererLigneHTML = genererLigneHTML;   // #562 — exposé pour le banc d'échappement (patron _trierLignesParColonne)
// #605 — exposés pour la sentinelle qui vérifie que les DEUX lecteurs de
// `productionGenereUneLigne` restent d'accord : le tableau et le message
// « Fichier sous … ». Même convention du souligné : pas une API.
window._construireLignesEvaluations = construireLignesEvaluations;
window._calculerStatutWorkflow = calculerStatutWorkflow;
window._productionGenereUneLigne = productionGenereUneLigne;
window.rechargerFiltreProduction = rechargerFiltreProduction; // Pour mise à jour après duplication/modification de productions

// Alias pour compatibilité avec le HTML
window.appliquerFiltres = appliquerFiltres;
window.filtrerListeEvaluations = appliquerFiltres;
window.reinitialiserFiltresEval = reinitialiserFiltres;
window.rechercherEvaluations = rechercherEvaluations;

// Select d'actions et sélecteur de colonnes
window.executerActionEval = executerActionEval;
window.toggleColonneEval = toggleColonneEval;
// #934 — réassigner la sélection
window.mettreAJourSelectionEval = mettreAJourSelectionEval;
window.basculerToutSelectionnerEval = basculerToutSelectionnerEval;
window.viderSelectionEval = viderSelectionEval;
window.reassignerSelectionEval = reassignerSelectionEval;
window.mettreSelectionALaCorbeille = mettreSelectionALaCorbeille;
window._composerRecapCorbeille = composerRecapCorbeille;          // sentinelle #1174 (fonction pure)
window._genererRecapCorbeilleHTML = genererRecapCorbeilleHTML;    // idem
window._composerRecapReassignation = composerRecapReassignation;     // sentinelle #934 (fonction pure)
window._genererRecapReassignationHTML = genererRecapReassignationHTML; // idem
window._trouverFichierDeLigne = trouverFichierDeLigne;               // idem
window.ouvrirAnnotationDepuisListe = ouvrirAnnotationDepuisListe;
window.ouvrirEditeurDepuisListe = ouvrirEditeurDepuisListe;
window.confirmerSuppressionFichier = confirmerSuppressionFichier;

// Corbeille
window.basculerVueCorbeille = basculerVueCorbeille;
window.restaurerFichierCorbeille = restaurerFichierCorbeille;
window.supprimerFichierDefinitivement = supprimerFichierDefinitivement;
window.viderTouteCorbeille = viderTouteCorbeille;


})();
