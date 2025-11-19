/* ===============================
   MODULE: LISTE DES ÉTUDIANTS (VERSION AMÉLIORÉE)
   Beta 84 - Tableau amélioré

   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'affichage de la liste des étudiants
   dans la section Tableau de bord › Liste des individus.

   Contenu de ce module:
   - Affichage du tableau amélioré des étudiants
   - Calcul des indices A-C-P-M-R pour chaque étudiant
   - Filtrage avancé (groupe, programme, risque, RàI, pattern)
   - Recherche par nom
   - Tri par colonnes cliquables
   - Surlignage conditionnel
   - Cartes de statistiques du groupe
   - Navigation vers les portfolios

   NOUVELLES FONCTIONNALITÉS Beta 84:
   - Cartes de statistiques (Total, Engagement favorable, RàI 1/2/3)
   - Filtres avancés (Engagement, RàI, Pattern)
   - Colonnes supplémentaires (Engagement E, Pattern, RàI)
   - Tri cliquable sur toutes les colonnes
   - Badges visuels améliorés avec couleurs système
   - Surlignage des cas critiques
   - Police système moderne
   =============================== */

/* ===============================
   VARIABLES GLOBALES DE TRI
   =============================== */

// État du tri actuel
let triActuel = {
    colonne: 'nom', // Colonne par défaut: nom (ordre alphabétique)
    ordre: 'asc'    // 'asc' ou 'desc'
};

// Cache des données pour optimisation
let donneesTableauCache = [];

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, echapperHtml()
   - 09-2-saisie-presences.js : calculerTotalHeuresPresence(), calculerNombreSeances(), obtenirDureeMaxSeance()
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - calculerTotalHeuresPresence() (depuis 09-2)
   - calculerNombreSeances() (depuis 09-2)
   - obtenirDureeMaxSeance() (depuis 09-2)
   
   Éléments HTML requis:
   - #tbody-etudiants-liste : Tbody du tableau
   - #compteur-etudiants-liste : Compteur
   - #filtre-groupe-liste : Select de filtrage par groupe
   - #filtre-programme-liste : Select de filtrage par programme
   - #recherche-nom-liste : Input de recherche
   - #message-aucun-etudiant : Message si liste vide
   - #tableEtudiantsListe : Conteneur du tableau
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'presences' : Array des présences (pour calcul assiduité)
   - 'cadreCalendrier' : Object avec dates clés
   - 'seancesHoraire' : Array des séances
   
   COMPATIBILITÉ:
   - ES6+ requis
   - Navigateurs modernes
   - Pas de dépendances externes
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de liste des étudiants
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge les options des filtres
 * 3. Affiche le tableau des étudiants
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 * 
 * NOTE: Cette fonction peut être appelée plusieurs fois
 * (à chaque changement de section) pour recharger les données
 */
function initialiserModuleListeEtudiants() {
    console.log('👥 Initialisation du module Liste des Étudiants');

    // Vérifier que nous sommes dans la bonne section
    const tbody = document.getElementById('tbody-tableau-bord-liste');
    if (!tbody) {
        console.log('   ⚠️  Section liste des étudiants non active, initialisation reportée');
        return;
    }

    // Vider le champ de recherche lors du chargement de la section
    // (contrairement à saisie-presences où la persistance est utile)
    const rechercheNom = document.getElementById('recherche-nom-liste');
    if (rechercheNom) {
        rechercheNom.value = '';
    }

    // Charger les options des filtres
    chargerOptionsFiltres();

    // Afficher la liste des étudiants
    afficherListeEtudiantsConsultation();

    console.log('   ✅ Module Liste des Étudiants initialisé');
}

/**
 * Force le rechargement du module (à appeler quand on change de section)
 */
function rechargerListeEtudiants() {
    initialiserModuleListeEtudiants();
}

/**
 * Alias pour le rechargement (appelé par navigation.js)
 */
function chargerListeEtudiants() {
    console.log('🔄 chargerListeEtudiants() appelée');
    rechargerListeEtudiants();
}

/* ===============================
   CHARGEMENT DES OPTIONS DE FILTRES
   =============================== */

/**
 * Charge les options des filtres (groupes et programmes)
 */
function chargerOptionsFiltres() {
    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiants = typeof filtrerEtudiantsParMode === 'function'
        ? filtrerEtudiantsParMode(tousEtudiants)
        : tousEtudiants.filter(e => e.groupe !== '9999');

    // Charger les groupes
    const filtreGroupe = document.getElementById('filtre-groupe-liste');
    if (filtreGroupe) {
        const groupesSet = new Set();
        etudiants.forEach(function (e) {
            if (e.groupe && e.groupe.trim() !== '') {
                groupesSet.add(e.groupe);
            }
        });

        const groupes = Array.from(groupesSet).sort();

        filtreGroupe.innerHTML = '<option value="">Tous les groupes</option>';
        groupes.forEach(function (groupe) {
            const option = document.createElement('option');
            option.value = groupe;
            option.textContent = 'Groupe ' + groupe;
            filtreGroupe.appendChild(option);
        });

        console.log('✅ ' + groupes.length + ' groupes chargés dans le filtre');
    }

    // Charger les programmes
    const filtreProgramme = document.getElementById('filtre-programme-liste');
    if (filtreProgramme) {
        const programmesSet = new Set();
        etudiants.forEach(function (e) {
            if (e.programme && e.programme.trim() !== '') {
                programmesSet.add(e.programme);
            }
        });

        const programmes = Array.from(programmesSet).sort();

        filtreProgramme.innerHTML = '<option value="">Tous les programmes</option>';
        programmes.forEach(function (programme) {
            const option = document.createElement('option');
            option.value = programme;
            option.textContent = programme;
            filtreProgramme.appendChild(option);
        });

        console.log('✅ ' + programmes.length + ' programmes chargés dans le filtre');
    }
}

/* ===============================
   CALCUL DE L'ASSIDUITÉ
   =============================== */

/**
 * Calcule le taux d'assiduité global d'un étudiant (jusqu'à aujourd'hui)
 * @param {string} da - Numéro de DA de l'étudiant
 * @returns {number} - Taux d'assiduité en pourcentage (0-100)
 */
// ✅ NOUVEAU CODE
function calculerAssiduitéGlobale(da) {
    // Vérifier que la fonction nécessaire existe
    if (typeof calculerTotalHeuresPresence !== 'function') {
        console.warn('⚠️ Fonction calculerTotalHeuresPresence non disponible');
        return 0;
    }

    if (typeof obtenirDureeMaxSeance !== 'function') {
        console.warn('⚠️ Fonction obtenirDureeMaxSeance non disponible');
        return 0;
    }

    // Compter le nombre de séances RÉELLEMENT SAISIES pour cet élève
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    // IMPORTANT : Exclure les séances facultatives (interventions RàI) du décompte
    const presences = obtenirDonneesSelonMode('presences') || [];
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.da === da && p.heures !== null && p.heures !== undefined) {
            // Ne compter que les séances NON facultatives
            if (p.facultatif !== true) {
                datesSaisies.add(p.date);
            }
        }
    });

    const nombreSeances = datesSaisies.size;
    if (nombreSeances === 0) {
        return 0;
    }

    // Calculer la durée d'une séance
    const dureeSeance = obtenirDureeMaxSeance();
    const heuresOffertes = nombreSeances * dureeSeance;

    // Calculer les heures réelles de présence
    const heuresReelles = calculerTotalHeuresPresence(da, null);

    // Calculer le taux
    const taux = (heuresReelles / heuresOffertes) * 100;
    return Math.round(taux);
}

/**
 * Obtient la couleur selon les seuils configurés par l'utilisateur
 * @param {number} pourcentage - Valeur en pourcentage (0-100)
 * @returns {string} - Couleur CSS
 */
function obtenirCouleurSelonSeuils(pourcentage) {
    // Charger les seuils depuis localStorage
    let seuils;
    if (typeof chargerSeuilsInterpretation === 'function') {
        seuils = chargerSeuilsInterpretation().interpretation;
    } else {
        // Valeurs par défaut si le module n'est pas chargé
        seuils = { excellent: 0.85, bon: 0.80, acceptable: 0.70 };
    }

    const valeur = pourcentage / 100; // Convertir en 0-1

    if (valeur >= seuils.excellent) {
        return '#0284c7'; // Bleu (excellent)
    } else if (valeur >= seuils.bon) {
        return '#16a34a'; // Vert (bon)
    } else if (valeur >= seuils.acceptable) {
        return '#ca8a04'; // Jaune (acceptable)
    } else {
        return '#dc2626'; // Rouge (fragile/critique)
    }
}

/**
 * Obtient la couleur d'affichage selon le taux d'assiduité
 * @param {number} taux - Taux d'assiduité en pourcentage
 * @returns {string} - Code couleur CSS
 */
function obtenirCouleurAssiduite(taux) {
    return obtenirCouleurSelonSeuils(taux);
}

/**
 * Calcule le taux de complétion pour un étudiant
 * @param {string} da - Numéro de DA de l'étudiant
 * @returns {number} - Taux de complétion en pourcentage (0-100)
 */
/**
 * Calcule le taux de complétion pour un étudiant
 * VERSION CORRIGÉE - Lit depuis indicesCP (Single Source of Truth)
 *
 * PRINCIPE :
 * - L'indice C est calculé par portfolio.js avec le système PAN (N meilleurs artefacts)
 * - Cette fonction LIT l'indice C depuis indicesCP au lieu de le recalculer
 * - Respecte la pratique de notation configurée (SOM ou PAN)
 *
 * @param {string} da - Numéro de DA
 * @returns {number} - Taux de complétion en pourcentage (0-100)
 */
function calculerTauxCompletion(da) {
    // LIRE depuis la source unique de vérité (portfolio.js)
    if (typeof obtenirIndicesCP === 'function') {
        // Détecter la pratique active
        const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
        const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

        const indicesCP = obtenirIndicesCP(da, pratique);

        if (indicesCP && indicesCP.C !== undefined) {
            return Math.round(indicesCP.C);
        }
    }

    // Fallback : si obtenirIndicesCP n'est pas disponible ou pas encore calculé
    console.warn(`⚠️ Indice C non trouvé pour ${da} - Recalcul à la volée`);

    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const productions = obtenirDonneesSelonMode('productions') || [];
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // ✅ CORRECTION : Ne compter QUE les artefacts-portfolio pour l'indice C
    const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    // ✅ ÉTAPE 1 : Identifier les artefacts-portfolio RÉELLEMENT DONNÉS
    // (ceux pour lesquels au moins un étudiant a été évalué)
    const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));
    const artefactsDonnes = new Set();

    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            artefactsDonnes.add(evaluation.productionId);
        }
    });

    const nombreArtefactsDonnes = artefactsDonnes.size;

    // ✅ ÉTAPE 2 : Compter combien l'étudiant a remis parmi les artefacts-portfolio donnés
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        artefactsDonnes.has(e.productionId)
    );

    // Si aucun artefact n'a encore été donné, retourner 0
    if (nombreArtefactsDonnes === 0) return 0;

    // Calculer le pourcentage (sans dépasser 100%)
    return Math.min(100, Math.round((evaluationsEleve.length / nombreArtefactsDonnes) * 100));
}

/**
 * Obtient la couleur d'affichage selon le taux de complétion
 * @param {number} taux - Taux de complétion en pourcentage
 * @returns {string} - Code couleur CSS
 */
function obtenirCouleurCompletion(taux) {
    return obtenirCouleurSelonSeuils(taux);
}

/**
 * Calcule l'indice de Performance (P) pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {number} - Performance en pourcentage (0-100)
 */
function calculerPerformance(da) {
    // LIRE depuis la source unique de vérité (portfolio.js)
    if (typeof obtenirIndicesCP === 'function') {
        // Détecter la pratique active
        const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
        const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

        const indicesCP = obtenirIndicesCP(da, pratique);

        if (indicesCP && indicesCP.P !== undefined) {
            return Math.round(indicesCP.P);
        }
    }

    // Fallback si pas de données
    return 0;
}

/**
 * Obtient la couleur d'affichage selon la performance
 * @param {number} performance - Performance en pourcentage
 * @returns {string} - Code couleur CSS
 */
function obtenirCouleurPerformance(performance) {
    return obtenirCouleurSelonSeuils(performance);
}

/**
 * Calcule le coefficient de corrélation de Pearson entre deux séries de données
 * @param {number[]} x - Première série de données
 * @param {number[]} y - Deuxième série de données
 * @returns {number|null} - Coefficient r (-1 à 1), ou null si calcul impossible
 *
 * INTERPRÉTATION:
 * - r proche de 1 : corrélation positive forte (quand x ↑, y ↑)
 * - r proche de 0 : aucune corrélation linéaire
 * - r proche de -1 : corrélation négative forte (quand x ↑, y ↓)
 *
 * SEUILS CONVENTIONNELS (valeur absolue):
 * - |r| < 0.3 : Très faible
 * - 0.3 ≤ |r| < 0.5 : Faible
 * - 0.5 ≤ |r| < 0.7 : Modérée
 * - 0.7 ≤ |r| < 0.9 : Forte
 * - |r| ≥ 0.9 : Très forte
 */
function calculerCorrelationPearson(x, y) {
    const n = x.length;
    if (n === 0 || n !== y.length) {
        return null;
    }

    // Calculer les moyennes
    const moyX = x.reduce((a, b) => a + b, 0) / n;
    const moyY = y.reduce((a, b) => a + b, 0) / n;

    // Calculer numérateur et dénominateurs
    let numerateur = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - moyX;
        const diffY = y[i] - moyY;
        numerateur += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }

    // Éviter division par zéro
    if (denomX === 0 || denomY === 0) {
        return null;
    }

    // Retourner le coefficient de Pearson
    return numerateur / Math.sqrt(denomX * denomY);
}

/**
 * Génère le contenu de la carte explicative sur le calcul des indices A-C-P
 * Affiche les détails selon la pratique active (PAN-Maîtrise ou Sommative)
 *
 * RETOUR:
 * - HTML formaté expliquant comment A, C et P sont calculés
 */
function genererExplicationCalculIndices() {
    // Récupérer la configuration de la pratique active
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratique = config.pratique || 'pan-maitrise';
    const isPAN = pratique === 'pan-maitrise';

    // Récupérer les paramètres de configuration
    const nbArtefacts = config.nombreArtefacts || 7;

    let html = '<strong>Méthodes de calcul des indices (pratique active : ' + (isPAN ? 'PAN-Maîtrise' : 'Sommative') + ')</strong><br><br>';

    // A - Assiduité (TOUJOURS DYNAMIQUE - comportement cumulatif)
    html += '<strong class="etud-texte-bleu">A (Assiduité)</strong> : ';
    html += 'Proportion des heures de présence parmi les heures de cours <strong>effectivement données jusqu\'à maintenant</strong>. ';
    html += '<br>Formule : <code>A = (heures présentes / heures données) × 100</code>';
    html += '<br><em class="etud-texte-gris-petit">→ Calculé uniquement sur les séances passées (pas sur le total prévu pour la session)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Exemple : Si 8 séances données sur 15 prévues, un étudiant présent 8/8 a A = 100% (pas 53%)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Indépendant de la pratique de notation (fait observable)</em>';

    html += '<br><br>';

    // C - Complétion (TOUJOURS DYNAMIQUE - mobilisation cumulée)
    html += '<strong class="etud-texte-bleu">C (Complétion)</strong> : ';
    html += 'Proportion de travaux remis parmi les travaux <strong>effectivement réalisés jusqu\'à maintenant</strong>. ';
    html += '<br>Formule : <code>C = (travaux remis / travaux réalisés) × 100</code>';
    html += '<br><em class="etud-texte-gris-petit">→ Un artefact devient "réalisé" dès qu\'une première évaluation existe pour celui-ci</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Exemple : Si 8 artefacts réalisés sur 10 prévus, un étudiant ayant remis 8/8 a C = 100% (pas 80%)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Indépendant de la pratique de notation (mobilisation observable)</em>';

    html += '<br><br>';

    // P - Performance (DÉPEND TOUJOURS DE LA PRATIQUE - résultat pédagogique)
    html += '<strong class="etud-texte-bleu">P (Performance)</strong> : ';
    html += '<strong>Calculé selon la pratique de notation en vigueur</strong>. ';

    if (isPAN) {
        html += '<br>→ <strong>PAN-Maîtrise</strong> : Moyenne des <strong>' + nbArtefacts + ' meilleurs artefacts</strong> selon l\'échelle IDME. ';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Les niveaux IDME (Insuffisant, Développement, Maîtrisé, Étendu) sont convertis en pourcentages.</em>';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Seuls les ' + nbArtefacts + ' meilleurs artefacts comptent dans le calcul de P</em>';
    } else {
        html += '<br>→ <strong>Sommative</strong> : Moyenne pondérée de <strong>toutes les évaluations</strong>. ';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Formule : <code>P = Σ(note × pondération) / Σ(pondérations)</code></em>';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Toutes les évaluations comptent selon leur pondération</em>';
    }

    html += '<br><br>';
    html += '<strong class="etud-texte-bleu">Résumé</strong> : ';
    html += '<strong>A et C</strong> mesurent le <strong>comportement cumulatif observable</strong> (contexte d\'apprentissage favorable ou non). ';
    html += '<strong>P</strong> mesure la <strong>qualité de l\'apprentissage</strong> selon la pratique pédagogique choisie (Sommative, PAN-Maîtrise, ou autre).';

    html += '<br><br>';
    html += '<em class="etud-texte-gris-moyen">💡 La pratique de notation et ses paramètres peuvent être modifiés dans <strong>Réglages › Pratique de notation</strong></em>';

    return html;
}

/**
 * Met à jour le contenu de la carte explicative sur le calcul des indices
 * Appelée lors de l'affichage du tableau
 */
function mettreAJourExplicationCalculIndices() {
    const carteNote = document.getElementById('note-calcul-indices-liste');
    if (!carteNote) {
        return;
    }

    const contenuHTML = genererExplicationCalculIndices();
    carteNote.innerHTML = contenuHTML;
}

/**
 * Génère le badge de pratique de notation (SOM ou PAN-Maîtrise)
 * Affiche la pratique choisie par l'utilisateur (pas de mode "Hybride")
 * Le mode comparatif est juste un affichage dual des calculs, pas une pratique distincte
 * Utilise les classes CSS .badge-pratique-compact.som ou .badge-pratique-compact.pan
 * @returns {string} - HTML du badge
 */
function genererBadgePratiqueListeEtudiants() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratique = config.pratique || 'pan-maitrise';

    let texte = '';
    let classePratique = '';
    let description = '';

    if (pratique === 'sommative') {
        texte = 'SOM';
        classePratique = 'som';
        description = 'Pratique sommative : moyenne pondérée provisoire';
    } else {
        // PAN-Maîtrise (par défaut)
        texte = 'PAN-Maîtrise';
        classePratique = 'pan';
        description = 'Pratique alternative : N meilleurs artefacts selon IDME';
    }

    return `<span class="badge-pratique-compact ${classePratique}" title="${description}">${texte}</span>`;
}

/**
 * Met à jour le titre de la liste des étudiants avec toggle et badge pratique
 * Similaire au format de l'Aperçu du Tableau de bord
 */
function mettreAJourTitreListeEtudiants() {
    const titre = document.getElementById('titre-liste-etudiants');
    if (!titre) {
        console.warn('⚠️ Élément #titre-liste-etudiants introuvable');
        return;
    }

    // Vider le titre et créer le conteneur avec layout flex
    titre.innerHTML = '';
    const conteneurTitre = document.createElement('div');
    conteneurTitre.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

    // Partie gauche : titre + badge pratique
    const partieGauche = document.createElement('div');
    partieGauche.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    partieGauche.innerHTML = `
        <span>Liste des étudiant·es</span>
        ${genererBadgePratiqueListeEtudiants()}
    `;

    // Partie droite : toggle 📐
    const partieDroite = document.createElement('div');
    partieDroite.innerHTML = `
        <span class="emoji-toggle" data-target="note-calcul-indices-liste"
              title="Afficher les détails de calcul des indices">📐</span>
    `;

    conteneurTitre.appendChild(partieGauche);
    conteneurTitre.appendChild(partieDroite);
    titre.appendChild(conteneurTitre);
}

/**
 * Met à jour les en-têtes des colonnes A, C et E avec les statistiques calculées
 * @param {number|null} r_AP - Corrélation entre Assiduité et Performance
 * @param {number|null} r_CP - Corrélation entre Complétion et Performance
 * @param {number|null} moyenneE - Moyenne de l'engagement du groupe (0-100)
 *
 * AFFICHAGE DANS L'EN-TÊTE:
 * - A et C : Corrélations r=0.XX avec couleur selon force
 * - E : Moyenne du groupe (%)
 * - Si données manquantes: affiche "—"
 */
function mettreAJourEntetesAvecCorrelations(r_AP, r_CP, moyenneE) {
    // Chercher les en-têtes dans le HTML
    const enteteLigneA = document.querySelector('th[onclick*="assiduite"]');
    const enteteLigneC = document.querySelector('th[onclick*="completion"]');
    const enteteLigneE = document.querySelector('th[onclick*="engagement"]');

    if (!enteteLigneA || !enteteLigneC) {
        console.warn('⚠️ En-têtes A ou C introuvables pour afficher les corrélations');
        return;
    }

    // Fonction helper pour formater la corrélation
    function formaterCorrelation(r) {
        if (r === null || isNaN(r)) {
            return '<span class="etud-texte-gris-mini">—</span>';
        }

        const absR = Math.abs(r);
        let couleur;

        // Déterminer la couleur selon la force de corrélation
        if (absR >= 0.7) {
            couleur = '#2e7d32'; // Vert foncé (forte)
        } else if (absR >= 0.5) {
            couleur = '#f57c00'; // Orange (modérée)
        } else {
            couleur = '#c62828'; // Rouge (faible)
        }

        return `<span style="color: ${couleur}; font-size: 0.75rem; font-weight: 600;">r=${r.toFixed(2)}</span>`;
    }

    // Fonction helper pour formater la moyenne
    function formaterMoyenne(valeur) {
        if (valeur === null || isNaN(valeur)) {
            return '<span class="etud-texte-gris-mini">—</span>';
        }

        // Couleur selon la valeur de l'engagement moyen
        let couleur;
        if (valeur >= 70) {
            couleur = '#2e7d32'; // Vert (contexte favorable)
        } else if (valeur >= 55) {
            couleur = '#f57c00'; // Orange (contexte modéré)
        } else {
            couleur = '#c62828'; // Rouge (contexte difficile)
        }

        return `<span style="color: ${couleur}; font-size: 0.75rem; font-weight: 600;">moy=${Math.round(valeur)}%</span>`;
    }

    // Mettre à jour l'en-tête A (assiduité)
    const htmlA = `A<br><span class="text-xs-normal">(assiduité)</span><br>${formaterCorrelation(r_AP)}<span id="tri-assiduite" class="ml-4">↕</span>`;
    enteteLigneA.innerHTML = htmlA;

    // Mettre à jour l'en-tête C (complétion)
    const htmlC = `C<br><span class="text-xs-normal">(complétion)</span><br>${formaterCorrelation(r_CP)}<span id="tri-completion" class="ml-4">↕</span>`;
    enteteLigneC.innerHTML = htmlC;

    // Mettre à jour l'en-tête E (engagement) avec la moyenne
    if (enteteLigneE) {
        const htmlE = `E<br><span class="text-xs-normal">(engagement)</span><br>${formaterMoyenne(moyenneE)}<span id="tri-engagement" class="ml-4">↕</span>`;
        enteteLigneE.innerHTML = htmlE;
    }

    console.log(`📊 Statistiques affichées: A↔P r=${r_AP !== null ? r_AP.toFixed(3) : 'N/A'}, C↔P r=${r_CP !== null ? r_CP.toFixed(3) : 'N/A'}, E moy=${moyenneE !== null ? moyenneE.toFixed(1) : 'N/A'}%`);
}

/**
 * Calcule le niveau de risque à l'échec (RàI) pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - { niveau: number (1|2|3), label: string, couleurFond: string, couleurTexte: string }
 */
function calculerNiveauRaI(da) {
    // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
    // Cette fonction calcule le niveau RàI basé UNIQUEMENT sur P + SRPNF (sans A-C)
    // Garantit la cohérence avec Aperçu et Profil individuel
    if (typeof determinerNiveauRaiPedagogique === 'function') {
        const niveauInfo = determinerNiveauRaiPedagogique(da);

        // Convertir le niveau en badge RàI avec les bonnes couleurs
        let label, couleurFond, couleurTexte;

        if (niveauInfo.niveau === 1) {
            label = 'RàI 1';
            couleurFond = '#e8f5e9'; // Vert pâle
            couleurTexte = '#2e7d32'; // Vert foncé
        } else if (niveauInfo.niveau === 2) {
            label = 'RàI 2';
            couleurFond = '#fff9e6'; // Jaune pâle
            couleurTexte = '#f57c00'; // Orange/jaune foncé
        } else { // niveau 3
            label = 'RàI 3';
            couleurFond = '#fff3e0'; // Orange pâle
            couleurTexte = '#e65100'; // Orange foncé
        }

        return {
            niveau: niveauInfo.niveau,
            label: label,
            couleurFond: couleurFond,
            couleurTexte: couleurTexte
        };
    }

    // Fallback : calculer avec nouvelle formule R basée sur P uniquement
    const assiduite = calculerAssiduitéGlobale(da) / 100;
    const completion = calculerTauxCompletion(da) / 100;
    let performance = calculerPerformance(da) / 100;

    // ========================================
    // DÉCOUPLAGE P/R : Lire P_recent si disponible
    // ========================================
    const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';
    const donneesCP = indicesCP[da]?.actuel?.[pratique];

    if (donneesCP && donneesCP.details && donneesCP.details.decouplerPR &&
        donneesCP.details.P_recent !== null && donneesCP.details.P_recent !== undefined) {
        performance = donneesCP.details.P_recent / 100; // Utiliser P_recent si découplage activé
    }

    // ========================================
    // CALCUL DE R : Formule expérimentale basée sur P uniquement
    // Seuil critique à 65% : P < 65% → échec probable (données empiriques)
    // A et C servent de contexte diagnostique, pas de prédiction
    // ========================================
    let risque;
    if (performance < 0.65) {
        risque = 1.0;  // 100% - Risque critique
    } else {
        risque = Math.pow((1.0 - performance) / 0.35, 3);  // Décroissance cubique
    }
    const risquePct = risque * 100;

    // Déterminer le niveau selon les seuils
    let niveau, label, couleurFond, couleurTexte;
    if (risquePct < 50) {
        niveau = 1;
        label = 'RàI 1';
        couleurFond = '#e8f5e9';
        couleurTexte = '#2e7d32';
    } else if (risquePct < 70) {
        niveau = 2;
        label = 'RàI 2';
        couleurFond = '#fff9e6';
        couleurTexte = '#f57c00';
    } else {
        niveau = 3;
        label = 'RàI 3';
        couleurFond = '#fff3e0';
        couleurTexte = '#e65100';
    }

    return { niveau, label, couleurFond, couleurTexte };
}

/* ===============================
   🔍 FILTRAGE ET RECHERCHE
   =============================== */

/**
 * Filtre les étudiants selon les critères sélectionnés
 * @param {Array} etudiants - Liste complète des étudiants
 * @returns {Array} - Liste filtrée des étudiants
 */
function filtrerEtudiants(etudiants) {
    let resultats = etudiants.slice(); // Copie

    // Filtrer pour afficher uniquement les étudiants actifs
    resultats = resultats.filter(function (e) {
        return e.statut === 'actif' || !e.statut;
    });

    // Filtrer par groupe
    const filtreGroupe = document.getElementById('filtre-groupe-liste');
    if (filtreGroupe && filtreGroupe.value) {
        const groupeFiltre = filtreGroupe.value;
        resultats = resultats.filter(function (e) {
            return e.groupe === groupeFiltre;
        });
    }

    // Filtrer par programme
    const filtreProgramme = document.getElementById('filtre-programme-liste');
    if (filtreProgramme && filtreProgramme.value) {
        const programmeFiltre = filtreProgramme.value;
        resultats = resultats.filter(function (e) {
            return e.programme === programmeFiltre;
        });
    }

    // NOUVEAU: Filtre par niveau RàI
    const filtreRai = document.getElementById('filtre-rai-liste');
    if (filtreRai && filtreRai.value) {
        const niveauRai = parseInt(filtreRai.value);
        resultats = resultats.filter(function (e) {
            // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
            const niveauInfo = determinerNiveauRaiPedagogique(e.da);
            return niveauInfo.niveau === niveauRai;
        });
    }

    // NOUVEAU: Filtre par pattern d'apprentissage
    const filtrePattern = document.getElementById('filtre-pattern-liste');
    if (filtrePattern && filtrePattern.value) {
        const patternFiltre = filtrePattern.value;
        resultats = resultats.filter(function (e) {
            // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
            const niveauInfo = determinerNiveauRaiPedagogique(e.da);
            const pattern = niveauInfo.pattern.toLowerCase().replace(/\s+/g, '-');
            return pattern === patternFiltre;
        });
    }

    // Recherche par nom/prénom/DA
    const rechercheNom = document.getElementById('recherche-nom-liste');
    if (rechercheNom && rechercheNom.value.trim()) {
        const recherche = rechercheNom.value.trim().toLowerCase();
        resultats = resultats.filter(function (e) {
            const nomComplet = (e.nom + ' ' + e.prenom).toLowerCase();
            const da = (e.da || '').toString().toLowerCase();
            return nomComplet.includes(recherche) || da.includes(recherche);
        });
    }

    return resultats;
}

/* ===============================
   AFFICHAGE DU TABLEAU
   =============================== */

/**
 * Masque ou affiche les colonnes Pattern et RàI selon le paramètre activerRai
 * @param {boolean} activerRai - true pour afficher, false pour masquer
 */
function masquerColonnesRaiSiDesactive(activerRai) {
    // Sélectionner les headers de colonnes Pattern et RàI
    const headers = document.querySelectorAll('th[onclick="trierTableauPar(\'pattern\')"], th[onclick="trierTableauPar(\'rai\')"]');

    headers.forEach(header => {
        if (activerRai) {
            header.style.display = '';  // Afficher
        } else {
            header.style.display = 'none';  // Masquer
        }
    });
}

/**
 * Affiche la liste des étudiants avec l'assiduité
 * FONCTION PRINCIPALE D'AFFICHAGE
 */

function afficherListeEtudiantsConsultation() {
    console.log('🔵 Affichage de la liste des étudiants...');

    // 🔄 FORCER le recalcul des indices C et P avant affichage
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Vérifier si le modèle RàI est activé
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const activerRai = config.activerRai !== false; // Par défaut true (rétrocompatibilité)

    // Afficher/masquer les colonnes Pattern et RàI dans les headers
    masquerColonnesRaiSiDesactive(activerRai);

    // NOUVEAU: Mettre à jour l'indicateur de tri visuel au chargement
    mettreAJourIndicateursTri();

    const tbody = document.getElementById('tbody-tableau-bord-liste');
    const compteur = document.getElementById('compteur-tableau-bord-liste');
    const messageVide = document.getElementById('message-aucun-etudiant');
    const tableContainer = document.getElementById('tableEtudiantsListe');

    if (!tbody) {
        console.log('❌ Élément #tbody-tableau-bord-liste introuvable');        // ← CHANGÉ (message d'erreur)
        return;
    }

    // Charger les étudiants
    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiants = typeof filtrerEtudiantsParMode === 'function'
        ? filtrerEtudiantsParMode(tousEtudiants)
        : tousEtudiants.filter(e => e.groupe !== '9999');

    console.log('Nombre total d\'étudiants:', etudiants.length);

    // Appliquer les filtres
    let etudiantsFiltres = filtrerEtudiants(etudiants);

    console.log('Nombre d\'étudiants après filtrage:', etudiantsFiltres.length);

    // NOUVEAU: Mettre à jour les statistiques
    mettreAJourStatistiques(etudiantsFiltres);

    // Mettre à jour le compteur
    if (compteur) {
        compteur.textContent = '(' + etudiantsFiltres.length + ' étudiant' + (etudiantsFiltres.length > 1 ? '·es' : '·e') + ')';
    }

    // Si aucun étudiant
    if (etudiantsFiltres.length === 0) {
        if (messageVide) {
            messageVide.style.display = 'block';

            // Afficher le bon message selon le contexte
            const messageFiltreActif = document.getElementById('message-filtre-actif');
            const messageListeVide = document.getElementById('message-liste-vide');
            const btnResetFiltres = document.getElementById('btn-reset-filtres');

            if (etudiants.length === 0) {
                // Vraiment aucun étudiant dans le système
                if (messageFiltreActif) messageFiltreActif.style.display = 'none';
                if (messageListeVide) messageListeVide.style.display = 'block';
                if (btnResetFiltres) btnResetFiltres.style.display = 'none';
            } else {
                // Des étudiants existent mais sont filtrés
                if (messageFiltreActif) messageFiltreActif.style.display = 'block';
                if (messageListeVide) messageListeVide.style.display = 'none';
                if (btnResetFiltres) btnResetFiltres.style.display = 'inline-block';
            }
        }
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
        return;
    }

    // Afficher le tableau
    if (messageVide) {
        messageVide.style.display = 'none';
    }
    if (tableContainer) {
        tableContainer.style.display = 'block';
    }

    // NOUVEAU: Enrichir les données pour le tri (sans assigner les numéros encore)
    etudiantsFiltres = etudiantsFiltres.map((e) => {
        const indices = calculerTousLesIndices(e.da);
        // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
        const niveauInfo = determinerNiveauRaiPedagogique(e.da);
        return {
            ...e,
            indicesCalcules: indices,
            cibleCalculee: niveauInfo
        };
    });

    // 🆕 BETA 91: Calculer les corrélations A-P et C-P pour afficher dans l'en-tête
    const valeursA = etudiantsFiltres.map(e => e.indicesCalcules.A);
    const valeursC = etudiantsFiltres.map(e => e.indicesCalcules.C);
    const valeursP = etudiantsFiltres.map(e => e.indicesCalcules.P);

    const r_AP = calculerCorrelationPearson(valeursA, valeursP);
    const r_CP = calculerCorrelationPearson(valeursC, valeursP);

    // 🆕 BETA 91: Calculer la moyenne de l'engagement E pour afficher dans l'en-tête
    const valeursE = etudiantsFiltres.map(e => {
        const A = e.indicesCalcules.A / 100;
        const C = e.indicesCalcules.C / 100;
        const P = e.indicesCalcules.P / 100;
        const E_brut = A * C * P;
        const E = Math.pow(E_brut, 1/3);
        return E * 100; // Retourner en pourcentage
    });
    const moyenneE = valeursE.length > 0 ? valeursE.reduce((sum, val) => sum + val, 0) / valeursE.length : null;

    // Mettre à jour les en-têtes avec les corrélations et la moyenne de E
    mettreAJourEntetesAvecCorrelations(r_AP, r_CP, moyenneE);

    // 🆕 BETA 91: Mettre à jour la carte explicative sur le calcul des indices
    mettreAJourExplicationCalculIndices();

    // 🆕 BETA 91: Mettre à jour le titre avec toggle et badge pratique
    mettreAJourTitreListeEtudiants();

    // Réattacher les événements des toggles emoji (pour le toggle 📐)
    if (typeof reattacherEvenementsToggles === 'function') {
        reattacherEvenementsToggles();
    }

    // NOUVEAU: Trier selon la colonne active
    etudiantsFiltres.sort(function (a, b) {
        let valeurA, valeurB;

        switch(triActuel.colonne) {
            case 'num':
                valeurA = a.num;
                valeurB = b.num;
                break;
            case 'da':
                valeurA = a.da;
                valeurB = b.da;
                break;
            case 'groupe':
                valeurA = a.groupe;
                valeurB = b.groupe;
                break;
            case 'nom':
                valeurA = a.nom.toLowerCase();
                valeurB = b.nom.toLowerCase();
                break;
            case 'prenom':
                valeurA = a.prenom.toLowerCase();
                valeurB = b.prenom.toLowerCase();
                break;
            case 'assiduite':
                valeurA = a.indicesCalcules.A;
                valeurB = b.indicesCalcules.A;
                break;
            case 'completion':
                valeurA = a.indicesCalcules.C;
                valeurB = b.indicesCalcules.C;
                break;
            case 'performance':
                valeurA = a.indicesCalcules.P;
                valeurB = b.indicesCalcules.P;
                break;
            case 'engagement':
                // Calculer l'engagement E = (A × C × P)^(1/3)
                const E_A = Math.pow((a.indicesCalcules.A / 100) * (a.indicesCalcules.C / 100) * (a.indicesCalcules.P / 100), 1/3);
                const E_B = Math.pow((b.indicesCalcules.A / 100) * (b.indicesCalcules.C / 100) * (b.indicesCalcules.P / 100), 1/3);
                valeurA = E_A;
                valeurB = E_B;
                break;
            case 'pattern':
                valeurA = a.cibleCalculee.pattern;
                valeurB = b.cibleCalculee.pattern;
                break;
            case 'rai':
                valeurA = a.cibleCalculee.niveau;
                valeurB = b.cibleCalculee.niveau;
                break;
            default:
                valeurA = a.num;
                valeurB = b.num;
        }

        // Comparer
        let comparaison = 0;
        if (typeof valeurA === 'string') {
            comparaison = valeurA.localeCompare(valeurB);
        } else {
            comparaison = valeurA - valeurB;
        }

        // Inverser si ordre descendant
        return triActuel.ordre === 'asc' ? comparaison : -comparaison;
    });

    // NOUVEAU: Assigner les numéros APRÈS le tri
    etudiantsFiltres = etudiantsFiltres.map((e, index) => {
        return {
            ...e,
            num: index + 1
        };
    });

    // Générer le HTML
    tbody.innerHTML = '';

    etudiantsFiltres.forEach(function (etudiant) {
        // Utiliser les indices précalculés
        const indices = etudiant.indicesCalcules;
        const cible = etudiant.cibleCalculee;

        // Génération des badges
        const badgePattern = genererBadgePattern(cible.pattern);
        const badgeRai = genererBadgeRaI(cible.niveau);

        const tr = document.createElement('tr');

        // Rendre la ligne cliquable
        tr.style.cursor = 'pointer';
        tr.onclick = function () {
            afficherPortfolio(etudiant.da);
        };

        // Effet de survol
        tr.onmouseenter = function () {
            this.style.backgroundColor = 'var(--bleu-tres-pale)';
        };
        tr.onmouseleave = function () {
            this.style.backgroundColor = '';
        };

        // Échapper les valeurs pour sécurité
        // IMPORTANT: Utiliser daAffichage pour l'affichage, mais garder da pour les calculs
        // En mode anonymisé, etudiant.nom et etudiant.prenom sont déjà anonymisés par modes.js
        const daAfficher = etudiant.daAffichage || etudiant.da; // Utiliser daAffichage si disponible
        const da = echapperHtml(daAfficher || '');
        const groupe = echapperHtml(etudiant.groupe || '');
        const nom = echapperHtml(etudiant.nom || '');  // Déjà anonymisé si mode anonymisation
        const prenom = echapperHtml(etudiant.prenom || '');  // Déjà anonymisé si mode anonymisation

        // NOUVEAU: Construire le HTML avec toutes les colonnes
        let html = '';
        html += '<td style="text-align: center; color: #64748b; font-weight: 600;">' + etudiant.num + '</td>';
        html += '<td>' + da + '</td>';
        html += '<td class="etud-text-center"><strong>' + groupe + '</strong></td>';
        html += '<td>' + nom + '</td>';
        html += '<td>' + prenom + '</td>';
        html += '<td class="etud-text-center">' + (etudiant.sa === 'Oui' ? '✓' : '') + '</td>';

        // Colonnes A-C-P avec couleurs
        const couleurA = obtenirCouleurAssiduite(Math.round(indices.A));
        const couleurC = obtenirCouleurCompletion(Math.round(indices.C));
        const couleurP = obtenirCouleurPerformance(Math.round(indices.P));

        html += '<td class="etud-text-center"><strong style="color: ' + couleurA + ';">' + Math.round(indices.A) + '%</strong></td>';
        html += '<td class="etud-text-center"><strong style="color: ' + couleurC + ';">' + Math.round(indices.C) + '%</strong></td>';
        html += '<td class="etud-text-center"><strong style="color: ' + couleurP + ';">' + Math.round(indices.P) + '%</strong></td>';

        // NOUVEAU: Colonne Engagement E = (A × C × P)^(1/3) en pourcentage
        const E_brut = (indices.A / 100) * (indices.C / 100) * (indices.P / 100);
        const E = Math.pow(E_brut, 1/3);
        const engagementPct = Math.round(E * 100);
        const couleurE = obtenirCouleurEngagement(engagementPct);
        html += '<td class="etud-text-center"><strong style="color: ' + couleurE + ';">' + engagementPct + '%</strong></td>';

        // Colonnes Pattern et RàI (affichées uniquement si RàI activé)
        if (activerRai) {
            // NOUVEAU: Colonne Pattern avec badge (centré)
            html += '<td class="etud-text-center"><span class="' + badgePattern.classe + '">' + badgePattern.label + '</span></td>';

            // NOUVEAU: Colonne RàI avec badge amélioré
            html += '<td class="etud-text-center"><span class="' + badgeRai.classe + '">' + badgeRai.label + '</span></td>';
        }

        // NOUVEAU (Beta 85): Colonne Interventions
        const nbInterventions = (typeof obtenirInterventionsEtudiant === 'function')
            ? obtenirInterventionsEtudiant(etudiant.da).length
            : 0;

        if (nbInterventions > 0) {
            html += '<td class="etud-text-center"><span style="color: var(--bleu-principal); font-weight: 600;">📋 ' + nbInterventions + '</span></td>';
        } else {
            html += '<td class="etud-text-center"><span class="etud-texte-gris-clair">—</span></td>';
        }

        tr.innerHTML = html;
        tbody.appendChild(tr);
    });

    console.log('✅ Liste des étudiants affichée avec ' + etudiantsFiltres.length + ' étudiant(s)');
}

/* ===============================
   📚 MAPPING DES PROGRAMMES
   =============================== */

/**
 * Obtient le nom complet d'un programme à partir de son code
 * @param {string} code - Code du programme (ex: "200.B1")
 * @returns {string} - Nom complet du programme
 */
function obtenirNomProgramme(code) {
    const programmes = {
        // Doubles DEC
        '221.D0': 'Technologies de l\'estimation et de l\'évaluation en bâtiment',
        '501.A0': 'Musique',
        '506.A0': 'Danse',
        '510.A0': 'Arts visuels',
        '310.B1': 'Techniques d\'intervention en criminologie',
        '551.A0': 'Techniques professionnelles de musique et de chanson',
        '551.B0': 'Technologies sonores',

        // Sciences et informatique
        '081.06': 'Tremplin DEC',
        '200.B0': 'Sciences de la nature',
        '200.B1': 'Sciences de la nature',
        '200.C1': 'Sciences, informatique et mathématique',
        '420.B0': 'Techniques de l\'informatique',
        '500.AE': 'Arts, lettres et communication – Multidisciplinaire',
        '500.AL': 'Arts, lettres et communication – Langues',

        // Techniques humaines et administration
        '322.A1': 'Techniques d\'éducation à l\'enfance',
        '351.A1': 'Techniques d\'éducation spécialisée',
        '410.A0': 'Techniques de la logistique du transport',
        '410.A1': 'Techniques des opérations et de la chaine logistique',
        '410.B0': 'Techniques de comptabilité et de gestion',
        '410.D0': 'Gestion de commerces',
        '410.F0': 'Techniques en services financiers et assurances',
        '410.G0': 'Techniques d\'administration et de gestion',

        // Santé et sciences humaines
        '141.A0': 'Techniques d\'inhalothérapie',
        '165.A0': 'Techniques de pharmacie',
        '180.A0': 'Soins Infirmiers',
        '180.B0': 'Soins Infirmiers – Passerelle DEP-DEC',
        '200.12': 'Double DEC Sciences nature / Sciences humaines',
        '241.A0': 'Techniques de génie mécanique',
        '300.M0': 'Sciences humaines',
        '300.13': 'Double DEC Sciences humaines / Arts visuels',
        '300.15': 'Double DEC Sciences humaines / Danse',
        '300.16': 'Double DEC Sciences humaines / Arts, lettres et comm.',
        '300.M1': 'Sciences humaines avec mathématiques'
    };

    return programmes[code] || '';
}

/**
/**
 * Réinitialise tous les filtres
 */
function resetFiltresListe() {
    const filtreGroupe = document.getElementById('filtre-groupe-liste');
    const filtreProgramme = document.getElementById('filtre-programme-liste');
    const rechercheNom = document.getElementById('recherche-nom-liste');

    if (filtreGroupe) {
        filtreGroupe.value = '';
    }
    if (filtreProgramme) {
        filtreProgramme.value = '';
    }
    if (rechercheNom) {
        rechercheNom.value = '';
    }

    afficherListeEtudiantsConsultation();  // ← CHANGEMENT ICI
}

/* ===============================
   📌 NAVIGATION VERS PORTFOLIO
   =============================== */

/**
 * Affiche le portfolio d'un étudiant
 * @param {string} da - Numéro de DA de l'étudiant
 */

/**
 * Affiche le profil/portfolio d'un étudiant
 * @param {string} da - Numéro de DA de l'étudiant
 */
function afficherPortfolio(da) {
    console.log('📂 Affichage du profil pour DA:', da);

    // Basculer vers la sous-section profil
    afficherSousSection('tableau-bord-profil');

    // Déléguer au module profil-etudiant.js pour l'affichage complet
    if (typeof afficherProfilComplet === 'function') {
        afficherProfilComplet(da);
    } else {
        // Fallback basique si le module n'est pas chargé
        console.warn('⚠️ Module profil-etudiant.js non chargé, affichage basique');

        const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiants = typeof filtrerEtudiantsParMode === 'function'
            ? filtrerEtudiantsParMode(tousEtudiants)
            : tousEtudiants.filter(e => e.groupe !== '9999');
        const etudiant = etudiants.find(e => e.da === da);

        if (!etudiant) {
            alert('Étudiant·e introuvable');
            console.error('❌ Aucun étudiant trouvé avec le DA:', da);
            return;
        }

        const container = document.getElementById('contenuProfilEtudiant');
        if (container) {
            container.innerHTML = `
                <div class="carte">
                    <h2>${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}</h2>
                    <p class="text-muted">DA: ${echapperHtml(etudiant.da)}</p>
                    <p class="text-muted">⚠️ Module profil complet non disponible</p>
                </div>
            `;
        }
    }

    console.log('✅ Profil chargé pour DA:', da);
}

/* ===============================
   🆕 NOUVELLES FONCTIONNALITÉS Beta 84
   =============================== */

/**
 * Trie le tableau par une colonne donnée
 * @param {string} colonne - Nom de la colonne à trier
 */
function trierTableauPar(colonne) {
    console.log(`📊 Tri par colonne: ${colonne}`);

    // Si on clique sur la même colonne, inverser l'ordre
    if (triActuel.colonne === colonne) {
        triActuel.ordre = triActuel.ordre === 'asc' ? 'desc' : 'asc';
    } else {
        triActuel.colonne = colonne;
        triActuel.ordre = 'asc';
    }

    // Mettre à jour les indicateurs visuels
    mettreAJourIndicateursTri();

    // Réafficher le tableau avec le nouveau tri
    afficherListeEtudiantsConsultation();
}

/**
 * Met à jour les indicateurs visuels de tri (flèches)
 */
function mettreAJourIndicateursTri() {
    // Réinitialiser tous les indicateurs
    ['num', 'da', 'groupe', 'nom', 'prenom', 'assiduite', 'completion', 'performance', 'mobilisation', 'risque', 'pattern', 'rai'].forEach(col => {
        const elem = document.getElementById(`tri-${col}`);
        if (elem) elem.textContent = '↕';
    });

    // Mettre à jour l'indicateur actif
    const elemActif = document.getElementById(`tri-${triActuel.colonne}`);
    if (elemActif) {
        elemActif.textContent = triActuel.ordre === 'asc' ? '↑' : '↓';
    }
}

/**
 * Met à jour les cartes de statistiques du groupe
 * @param {Array} etudiants - Liste des étudiants après filtrage
 */
function mettreAJourStatistiques(etudiants) {
    // Cette fonction ne fait plus rien car les cartes métriques ont été retirées (Beta 90)
    // Elle est conservée pour éviter les erreurs si appelée ailleurs dans le code
    return;
}

/**
 * Obtient la couleur appropriée pour la mobilisation
 * @param {number} mobilisation - Valeur de mobilisation (0-1)
 * @returns {string} - Code couleur hexadécimal
 */
function obtenirCouleurMobilisation(mobilisation) {
    return obtenirCouleurSelonSeuils(mobilisation * 100);
}

/**
 * Obtient la couleur appropriée pour l'engagement
 * Basé sur les seuils d'engagement : <30% insuffisant, 30-49% fragile, 50-64% modéré, 65-79% favorable, ≥80% très favorable
 * @param {number} engagementPct - Valeur de l'engagement en pourcentage (0-100)
 * @returns {string} - Code couleur hexadécimal
 */
function obtenirCouleurEngagement(engagementPct) {
    // Utiliser les mêmes seuils que obtenirCouleurSelonSeuils pour cohérence
    return obtenirCouleurSelonSeuils(engagementPct);
}

/**
 * Génère un badge d'engagement avec classe CSS appropriée
 * Calcule l'engagement avec la formule E = (A × C × P)^(1/3)
 * @param {Object} indices - Objet contenant A, C et P (en pourcentages 0-100)
 * @returns {Object} - {label, classe}
 */
function genererBadgeEngagement(indices) {
    // Convertir les pourcentages en proportions (0-1)
    const A = indices.A / 100;
    const C = indices.C / 100;
    const P = indices.P / 100;

    // Calculer l'engagement avec racine cubique
    const E_brut = A * C * P;
    const E = Math.pow(E_brut, 1/3);

    // Déterminer le niveau selon les seuils
    if (E >= 0.80) {
        return { label: 'Très favorable', classe: 'badge-sys badge-engagement-tres-favorable' };
    } else if (E >= 0.65) {
        return { label: 'Favorable', classe: 'badge-sys badge-engagement-favorable' };
    } else if (E >= 0.50) {
        return { label: 'Modéré', classe: 'badge-sys badge-engagement-modere' };
    } else if (E >= 0.30) {
        return { label: 'Fragile', classe: 'badge-sys badge-engagement-fragile' };
    } else {
        return { label: 'Insuffisant', classe: 'badge-sys badge-engagement-insuffisant' };
    }
}

/**
 * Génère un badge de pattern avec classe CSS appropriée
 * @param {string} pattern - Pattern d'apprentissage
 * @returns {Object} - {label, classe}
 */
function genererBadgePattern(pattern) {
    switch(pattern) {
        case 'Blocage critique':
            return { label: pattern, classe: 'badge-sys badge-pattern-blocage-critique' };
        case 'Blocage émergent':
            return { label: pattern, classe: 'badge-sys badge-pattern-blocage-emergent' };
        case 'Défi spécifique':
            return { label: pattern, classe: 'badge-sys badge-pattern-defi-specifique' };
        case 'Stable':
            return { label: pattern, classe: 'badge-sys badge-pattern-stable' };
        case 'En progression':
            return { label: pattern, classe: 'badge-sys badge-pattern-progression' };
        default:
            return { label: pattern, classe: 'badge-sys' };
    }
}

/**
 * Génère un badge de RàI avec classe CSS appropriée
 * @param {number} niveau - Niveau RàI (1, 2, ou 3)
 * @returns {Object} - {label, classe}
 */
function genererBadgeRaI(niveau) {
    switch(niveau) {
        case 1:
            return { label: 'Niveau 1', classe: 'badge-sys badge-rai-1' };
        case 2:
            return { label: 'Niveau 2', classe: 'badge-sys badge-rai-2' };
        case 3:
            return { label: 'Niveau 3', classe: 'badge-sys badge-rai-3' };
        default:
            return { label: '—', classe: 'badge-sys' };
    }
}

/* ===============================
   📌 EXPORTS (si nécessaire pour tests)
   =============================== */

// Export des fonctions principales vers l'objet window
window.initialiserModuleListeEtudiants = initialiserModuleListeEtudiants;
window.rechargerListeEtudiants = rechargerListeEtudiants;
window.chargerListeEtudiants = chargerListeEtudiants;
window.afficherListeEtudiantsConsultation = afficherListeEtudiantsConsultation;
window.trierTableauPar = trierTableauPar;
window.obtenirNomProgramme = obtenirNomProgramme;