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

(function() {
'use strict';

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

    // Vérifier que nous sommes dans la bonne section
    const tbody = document.getElementById('tbody-suivi-liste');
    if (!tbody) {
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
    rechargerListeEtudiants();
}

/* ===============================
   CHARGEMENT DES OPTIONS DE FILTRES
   =============================== */

/**
 * Charge les options des filtres (groupes et programmes)
 */
function chargerOptionsFiltres() {
    // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);

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

    }
}

/* ===============================
   CALCUL DE L'ASSIDUITÉ
   =============================== */

/**
 * Calcule le taux d'assiduité global d'un étudiant (jusqu'à aujourd'hui)
 * 🆕 CORRIGÉ (22 jan 2026) : Calcul en PÉRIODES au lieu d'heures
 * @param {string} da - Numéro de DA de l'étudiant
 * @returns {number} - Taux d'assiduité en pourcentage (0-100)
 */
function calculerAssiduitéGlobale(da) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];

    // Filtrer les présences de cet étudiant (séances NON facultatives seulement)
    const presencesEtudiant = presences.filter(p =>
        p.da === da &&
        p.facultatif !== true &&
        (p.periodesPresentes !== null && p.periodesPresentes !== undefined ||
         p.heures !== null && p.heures !== undefined)
    );

    if (presencesEtudiant.length === 0) {
        return 0;
    }

    // 🆕 BETA 95.7 : Calculer en périodes
    let periodesOffertes = 0;
    let periodesPresentes = 0;

    presencesEtudiant.forEach(p => {
        // Obtenir le nombre de périodes de cette séance
        const nombrePeriodesSeance = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(p.date)
            : 2; // Fallback : 2 périodes par défaut

        periodesOffertes += nombrePeriodesSeance;

        // Utiliser periodesPresentes si disponible, sinon convertir depuis heures
        if (p.periodesPresentes !== undefined && p.periodesPresentes !== null) {
            periodesPresentes += p.periodesPresentes;
        } else if (p.heures !== undefined && p.heures !== null) {
            // Rétrocompatibilité : convertir heures en périodes
            const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;
            periodesPresentes += (p.heures * 60) / dureePeriode;
        }
    });

    if (periodesOffertes === 0) {
        return 0;
    }

    // Calculer le taux (plafonné à 100%)
    const taux = (periodesPresentes / periodesOffertes) * 100;
    return Math.min(100, Math.round(taux));
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
        return 'var(--vert-succes)'; // Vert (bon)
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
    // Tier 6.1 : LIRE UNIQUEMENT depuis la source unique de vérité (portfolio.js)
    // Le recalcul de secours a été supprimé pour éviter deux algorithmes divergents.
    // Si indicesCP n'est pas encore calculé, retourner null (les appelants gèrent ce cas).
    if (typeof obtenirIndicesCP === 'function') {
        const config = db.getSync('modalitesEvaluation', {});
        const pratique = config.pratique === 'sommative' ? 'SOM' : 'PAN';

        const indicesCP = obtenirIndicesCP(da, pratique);

        if (indicesCP && indicesCP.C !== undefined) {
            return Math.round(indicesCP.C);
        }
    }

    console.warn(`⚠️ calculerTauxCompletion(${da}) : indicesCP non disponible — retourne null`);
    return null;
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
        const config = db.getSync('modalitesEvaluation', {});
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

// calculerCorrelationPearson → déplacé dans indices.js (#206)

/**
 * Génère le contenu de la carte explicative sur le calcul des indices A-C-P
 * Affiche les détails selon la pratique active (PAN-Standards ou Sommative)
 *
 * RETOUR:
 * - HTML formaté expliquant comment A, C et P sont calculés
 */
function genererExplicationCalculIndices() {
    // Récupérer la configuration de la pratique active
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'pan-maitrise';
    const isPAN = pratique === 'pan-maitrise';

    // Récupérer les paramètres de configuration
    const nbArtefacts = config.nombreArtefacts || 7;

    let html = '<strong>Méthodes de calcul des indices (pratique active : ' + (isPAN ? 'PAN-Standards' : 'Sommative') + ')</strong><br><br>';

    // A - Assiduité (TOUJOURS DYNAMIQUE - comportement cumulatif)
    html += '<strong class="u-texte-bleu">A (Assiduité)</strong> : ';
    html += 'Proportion des heures de présence parmi les heures de cours <strong>effectivement données jusqu\'à maintenant</strong>. ';
    html += '<br>Formule : <code>A = (heures présentes / heures données) × 100</code>';
    html += '<br><em class="etud-texte-gris-petit">→ Calculé uniquement sur les séances passées (pas sur le total prévu pour la session)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Exemple : Si 8 séances données sur 15 prévues, un étudiant présent 8/8 a A = 100% (pas 53%)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Indépendant de la pratique de notation (fait observable)</em>';

    html += '<br><br>';

    // C - Complétion (TOUJOURS DYNAMIQUE - mobilisation cumulée)
    html += '<strong class="u-texte-bleu">C (Complétion)</strong> : ';
    html += 'Proportion de travaux remis parmi les travaux <strong>effectivement réalisés jusqu\'à maintenant</strong>. ';
    html += '<br>Formule : <code>C = (travaux remis / travaux réalisés) × 100</code>';
    html += '<br><em class="etud-texte-gris-petit">→ Un artefact devient "réalisé" dès qu\'une première évaluation existe pour celui-ci</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Exemple : Si 8 artefacts réalisés sur 10 prévus, un étudiant ayant remis 8/8 a C = 100% (pas 80%)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Indépendant de la pratique de notation (mobilisation observable)</em>';

    html += '<br><br>';

    // P - Performance (DÉPEND TOUJOURS DE LA PRATIQUE - résultat pédagogique)
    html += '<strong class="u-texte-bleu">P (Performance)</strong> : ';
    html += '<strong>Calculé selon la pratique de notation en vigueur</strong>. ';

    if (isPAN) {
        html += '<br>→ <strong>PAN-Standards</strong> : Moyenne des <strong>' + nbArtefacts + ' meilleurs artefacts</strong> selon l\'échelle IDME. ';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Les niveaux IDME (Incomplet, en Développement, Maîtrisé, Étendu) sont convertis en pourcentages.</em>';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Seuls les ' + nbArtefacts + ' meilleurs artefacts comptent dans le calcul de P</em>';
    } else {
        html += '<br>→ <strong>Sommative</strong> : Moyenne pondérée de <strong>toutes les évaluations</strong>. ';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Formule : <code>P = Σ(note × pondération) / Σ(pondérations)</code></em>';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Toutes les évaluations comptent selon leur pondération</em>';
    }

    html += '<br><br>';
    html += '<strong class="u-texte-bleu">Résumé</strong> : ';
    html += '<strong>A et C</strong> mesurent le <strong>comportement cumulatif observable</strong> (contexte d\'apprentissage favorable ou non). ';
    html += '<strong>P</strong> mesure la <strong>qualité de l\'apprentissage</strong> selon la pratique pédagogique choisie (Sommative, PAN-Standards, ou autre).';

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
 * Génère le badge de pratique de notation (SOM, STD, SPE, DEN)
 * Affiche la pratique choisie par l'utilisateur (pas de mode "Hybride")
 * Le mode comparatif est juste un affichage dual des calculs, pas une pratique distincte
 * Utilise les classes CSS .badge-pratique-compact.som, .std, .spe, .den
 * @returns {string} - HTML du badge
 */
function genererBadgePratiqueListeEtudiants() {
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'pan-maitrise';
    const typePAN = config.typePAN || 'maitrise';

    let texte = '';
    let classePratique = '';
    let description = '';

    if (pratique === 'sommative') {
        texte = 'SOM';
        classePratique = 'som';
        description = 'Pratique sommative : moyenne pondérée provisoire';
    } else {
        // Pratiques PAN avec codes 3 lettres
        if (typePAN === 'specifications') {
            texte = 'SPE';
            classePratique = 'spe';
            description = 'PAN-Spécifications : pass/fail sur objectifs';
        } else if (typePAN === 'denotation') {
            texte = 'DEN';
            classePratique = 'den';
            description = 'Dénotation : sans notes chiffrées';
        } else {
            // Standards (maitrise) par défaut
            texte = 'STD';
            classePratique = 'std';
            description = 'PAN-Standards : N meilleurs artefacts selon IDME';
        }
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

    // Partie gauche : titre (badge pratique retiré - info déjà dans l'en-tête)
    const partieGauche = document.createElement('div');
    partieGauche.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    partieGauche.innerHTML = `
        <span>Liste des étudiant·es</span>
    `;

    // Partie droite : aide contextuelle 📍
    const partieDroite = document.createElement('div');
    partieDroite.innerHTML = `
        <span class="primo-aide" data-target="note-calcul-indices-liste"
              title="Explication du calcul des indices">📍</span>
    `;

    conteneurTitre.appendChild(partieGauche);
    conteneurTitre.appendChild(partieDroite);
    titre.appendChild(conteneurTitre);
}

/**
 * Met à jour les lignes moyenne et corrélation dans le thead
 */
function mettreAJourEntetesAvecCorrelations(r_AP, r_CP, r_EP, r_PatternP, r_RaiP, r_IntervP, moyenneA, moyenneC, moyenneP, moyenneE) {
    function fmtMoy(v) {
        if (v === null || v === undefined || isNaN(v)) return '—';
        return 'moy=' + Math.round(v) + '%';
    }
    function fmtCorr(r) {
        if (r === null || r === undefined || isNaN(r)) return '—';
        return 'r=' + r.toFixed(2);
    }

    // Ligne moyennes
    var moyA = document.getElementById('moy-a');
    var moyC = document.getElementById('moy-c');
    var moyP = document.getElementById('moy-p');
    var moyE = document.getElementById('moy-e');
    if (moyA) moyA.textContent = fmtMoy(moyenneA);
    if (moyC) moyC.textContent = fmtMoy(moyenneC);
    if (moyP) moyP.textContent = fmtMoy(moyenneP);
    if (moyE) moyE.textContent = fmtMoy(moyenneE);

    // Ligne corrélations avec P
    var corrA = document.getElementById('corr-a');
    var corrC = document.getElementById('corr-c');
    var corrE = document.getElementById('corr-e');
    var corrPattern = document.getElementById('corr-pattern');
    var corrRai = document.getElementById('corr-rai');
    var corrInterv = document.getElementById('corr-interv');
    if (corrA) corrA.textContent = fmtCorr(r_AP);
    if (corrC) corrC.textContent = fmtCorr(r_CP);
    if (corrE) corrE.textContent = fmtCorr(r_EP);
    if (corrPattern) corrPattern.textContent = fmtCorr(r_PatternP);
    if (corrRai) corrRai.textContent = fmtCorr(r_RaiP);
    if (corrInterv) corrInterv.textContent = fmtCorr(r_IntervP);

}

/**
 * Toggle visibilité d'une ligne d'en-tête (moyenne ou corrélation)
 * @param {string} type - 'moy' ou 'corr'
 * @param {boolean} visible
 */
function toggleLigneEntete(type, visible) {
    if (typeof visible === 'object' && visible !== null) visible = visible.checked;
    var tr = document.getElementById('tr-entete-' + type);
    if (tr) {
        if (visible) {
            tr.classList.remove('u-hide');
        } else {
            tr.classList.add('u-hide');
        }
    }
}
window.toggleLigneEntete = toggleLigneEntete;

/**
 * Toggle filtre minimum : grise les élèves sous le seuil et recalcule les moyennes
 * @param {boolean} actif - true = exclure les insuffisants des moyennes
 */
function toggleFiltreMinimum(actif) {
    if (typeof actif === 'object' && actif !== null) actif = actif.checked;
    // Griser/dé-griser les lignes
    document.querySelectorAll('#tbody-suivi-liste tr').forEach(tr => {
        if (actif && tr.dataset.insuffisant === 'true') {
            tr.style.opacity = '0.35';
        } else {
            tr.style.opacity = '';
        }
    });

    // Mettre à jour les moyennes
    const moy = actif ? window._moyennesQualifies : window._moyennesToutes;
    if (!moy) return;

    function fmtMoy(v) {
        if (v === null || v === undefined || isNaN(v)) return '—';
        return 'moy=' + Math.round(v) + '%';
    }

    var moyC = document.getElementById('moy-c');
    var moyP = document.getElementById('moy-p');
    var moyE = document.getElementById('moy-e');
    if (moyC) moyC.textContent = fmtMoy(moy.C);
    if (moyP) {
        moyP.textContent = fmtMoy(moy.P);
        if (actif && window._moyennesQualifies) {
            moyP.title = 'Moyenne P sur ' + window._moyennesQualifies.nb + ' élèves qualifiés (≥ minimum). ' + window._moyennesQualifies.nbInsuffisants + ' exclus.';
        }
    }
    if (moyE) moyE.textContent = fmtMoy(moy.E);
}
window.toggleFiltreMinimum = toggleFiltreMinimum;

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
            couleurFond = 'var(--alerte-fond-succes, #e8f5e9)'; // Vert pâle
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
    const tauxC = calculerTauxCompletion(da);
    const completion = tauxC !== null ? tauxC / 100 : 0;
    let performance = calculerPerformance(da) / 100;

    // ========================================
    // DÉCOUPLAGE P/R : Lire P_recent si disponible
    // ========================================
    const indicesCP = db.getSync(cle('indicesCP'), {});
    const config = db.getSync('modalitesEvaluation', {});
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
            // Normaliser le pattern : lowercase, sans accents, espaces → tirets
            const pattern = niveauInfo.pattern
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
                .replace(/\s+/g, '-');
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
    const headers = document.querySelectorAll('th[data-action="trierTableauPar"][data-param="pattern"], th[data-action="trierTableauPar"][data-param="rai"]');

    headers.forEach(header => {
        if (activerRai) {
            header.classList.remove('u-hide');
        } else {
            header.classList.add('u-hide');
        }
    });

    // Masquer/afficher les checkboxes Pattern et RàI dans le sélecteur de colonnes
    var selecteur = document.getElementById('liste-colonnes-selecteur');
    if (selecteur) {
        ['pattern', 'rai'].forEach(function(col) {
            var cb = selecteur.querySelector('input[data-colonne="' + col + '"]');
            if (cb && cb.parentElement) {
                if (activerRai) {
                    cb.parentElement.classList.remove('u-hide');
                } else {
                    cb.parentElement.classList.add('u-hide');
                }
            }
        });
    }
}

/**
 * Affiche la liste des étudiants avec l'assiduité
 * FONCTION PRINCIPALE D'AFFICHAGE
 */

function afficherListeEtudiantsConsultation() {

    // 🔄 FORCER le recalcul des indices A, C et P avant affichage
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
    }
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Vérifier si le modèle RàI est activé (préférence utilisateur)
    const activerRai = obtenirPreference('activerRai') !== false;

    // Afficher/masquer les colonnes Pattern et RàI dans les headers
    masquerColonnesRaiSiDesactive(activerRai);

    // NOUVEAU: Mettre à jour l'indicateur de tri visuel au chargement
    mettreAJourIndicateursTri();

    const tbody = document.getElementById('tbody-suivi-liste');
    const compteur = document.getElementById('compteur-suivi-liste');
    const messageVide = document.getElementById('message-aucun-etudiant');
    const tableContainer = document.getElementById('tableEtudiantsListe');

    if (!tbody) {
        return;
    }

    // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);


    // Appliquer les filtres
    let etudiantsFiltres = filtrerEtudiants(etudiants);


    // NOUVEAU: Mettre à jour les statistiques
    mettreAJourStatistiques(etudiantsFiltres);

    // Mettre à jour les badges nombre de personnes
    const nbEtudiants = etudiantsFiltres.length;
    const labelEtudiants = nbEtudiants + ' personne' + (nbEtudiants > 1 ? 's' : '');

    if (compteur) {
        compteur.textContent = labelEtudiants;
    }

    // Badge dans "Indicateurs globaux du groupe"
    const badgeIndicateurs = document.getElementById('badge-nb-etudiants-indicateurs');
    if (badgeIndicateurs) {
        badgeIndicateurs.textContent = labelEtudiants;
    }

    // Si aucun étudiant
    if (etudiantsFiltres.length === 0) {
        if (messageVide) {
            messageVide.classList.remove('u-hide');

            // Afficher le bon message selon le contexte
            const messageFiltreActif = document.getElementById('message-filtre-actif');
            const messageListeVide = document.getElementById('message-liste-vide');
            const btnResetFiltres = document.getElementById('btn-reset-filtres');

            if (etudiants.length === 0) {
                // Vraiment aucun étudiant dans le système
                if (messageFiltreActif) messageFiltreActif.classList.add('u-hide');
                if (messageListeVide) messageListeVide.classList.remove('u-hide');
                if (btnResetFiltres) btnResetFiltres.classList.add('u-hide');
            } else {
                // Des étudiants existent mais sont filtrés
                if (messageFiltreActif) messageFiltreActif.classList.remove('u-hide');
                if (messageListeVide) messageListeVide.classList.add('u-hide');
                if (btnResetFiltres) btnResetFiltres.classList.remove('u-hide');
            }
        }
        if (tableContainer) {
            tableContainer.classList.add('u-hide');
        }
        return;
    }

    // Afficher le tableau
    if (messageVide) {
        messageVide.classList.add('u-hide');
    }
    if (tableContainer) {
        tableContainer.classList.remove('u-hide');
    }

    // 🆕 BETA 91: Calculer les corrélations A-P et C-P sur TOUS les étudiants (avant filtrage)
    // Ceci assure la cohérence avec le tableau de bord qui calcule sur tous les étudiants
    // IMPORTANT: Utiliser la même pratique que le tableau de bord (SOM ou PAN selon config)
    // Réutiliser la variable config déjà chargée à la ligne 847
    const affichage = config.affichageTableauBord || {};
    const afficherSommatif = affichage.afficherSommatif !== false;
    const afficherAlternatif = affichage.afficherAlternatif !== false;

    // Déterminer quelle pratique afficher (cohérence avec apercu-contenu.js)
    let pratiqueAffichee = null;
    if (afficherSommatif && !afficherAlternatif) {
        pratiqueAffichee = 'SOM';
    } else if (!afficherSommatif && afficherAlternatif) {
        pratiqueAffichee = 'PAN';
    } else if (afficherSommatif && afficherAlternatif) {
        // Mode comparatif : utiliser PAN comme dans le tableau de bord
        pratiqueAffichee = 'PAN';
    }

    // Vérifier que calculerTousLesIndices existe (chargé depuis profil-etudiant.js)
    const tousIndices = typeof window.calculerTousLesIndices === 'function'
        ? etudiants.map(e => calculerTousLesIndices(e.da, pratiqueAffichee))
        : etudiants.map(e => calculerIndicesEtudiant(e.da)); // Fallback vers ancienne fonction

    const valeursA_tous = tousIndices.map(indices => indices.A);
    const valeursC_tous = tousIndices.map(indices => indices.C);
    const valeursP_tous = tousIndices.map(indices => indices.P);

    const r_AP = calculerCorrelationPearson(valeursA_tous, valeursP_tous);
    const r_CP = calculerCorrelationPearson(valeursC_tous, valeursP_tous);

    // NOUVEAU: Enrichir les données pour le tri (sans assigner les numéros encore)
    etudiantsFiltres = etudiantsFiltres.map((e) => {
        const indices = typeof window.calculerTousLesIndices === 'function'
            ? calculerTousLesIndices(e.da, pratiqueAffichee)
            : calculerIndicesEtudiant(e.da); // Fallback
        // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
        const niveauInfo = determinerNiveauRaiPedagogique(e.da);
        return {
            ...e,
            indicesCalcules: indices,
            cibleCalculee: niveauInfo
        };
    });

    // Déterminer le seuil minimum d'évaluations pour P
    const configPratiqueActiveTab = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const modalitesTab = db.getSync('modalitesEvaluation', {});
    const configPortfolioTab = configPratiqueActiveTab?.portfolio || modalitesTab.configPAN?.portfolio || {};
    const minimumCompletionTab = configPortfolioTab.minimumCompletion || modalitesTab.configPAN?.portfolio?.minimumCompletion || 3;

    // Compter les évaluations par étudiant (artefacts-portfolio évalués)
    // Pré-indexé par DA pour éviter O(N*M) — une seule passe sur les évaluations
    const productionsTab = obtenirDonneesSelonMode('productions') || [];
    const artefactIds = new Set(productionsTab.filter(p => p.type === 'artefact-portfolio').map(p => p.id));
    const evaluationsTab = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    const evalsParDA = new Map();
    evaluationsTab.forEach(ev => {
        if (artefactIds.has(ev.productionId) && !ev.remplaceeParId &&
            ev.noteFinale !== null && ev.noteFinale !== undefined) {
            evalsParDA.set(ev.etudiantDA, (evalsParDA.get(ev.etudiantDA) || 0) + 1);
        }
    });

    etudiantsFiltres.forEach(e => {
        const nbEvals = evalsParDA.get(e.da) || 0;
        e.nbEvaluations = nbEvals;
        e.performanceInsuffisante = nbEvals > 0 && nbEvals < minimumCompletionTab;
    });

    // 🆕 BETA 95.7 (22 jan): Calculer la moyenne A sur les étudiants avec PRÉSENCES SAISIES
    // (inclut les 0% = absents, exclut ceux sans aucune présence saisie)
    let presencesGlobal = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presencesGlobal)) presencesGlobal = [];

    // 🆕 BETA 95.7 (23 jan): Filtrer les présences par coursId du groupe-cours actif
    const coursIdActif = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;

    // Filtrer pour ne garder que les présences du cours actif
    const presencesCours = coursIdActif
        ? presencesGlobal.filter(p => p.coursId === coursIdActif)
        : presencesGlobal;

    // 🆕 DEBUG: Voir les DA dans les présences vs les DA des étudiants
    const dasPresences = [...new Set(presencesCours.map(p => p.da))];
    const dasEtudiants = etudiants.slice(0, 5).map(e => e.da); // 5 premiers pour debug

    const valeursA_avecPresences = [];
    etudiants.forEach((etudiant, index) => {
        const aDesPresences = presencesCours.some(p => p.da === etudiant.da);
        if (aDesPresences) {
            valeursA_avecPresences.push(valeursA_tous[index]);
        }
    });
    const moyenneA = valeursA_avecPresences.length > 0 ? valeursA_avecPresences.reduce((sum, val) => sum + val, 0) / valeursA_avecPresences.length : null;

    // 🆕 BETA 91: Calculer la moyenne de l'engagement E sur TOUS les étudiants (cohérence avec corrélations)
    const valeursE_tous = tousIndices.map(indices => {
        const A = indices.A / 100;
        const C = indices.C / 100;
        const P = indices.P / 100;
        const E_brut = A * C * P;
        const E = Math.pow(E_brut, 1/3);
        return E * 100; // Retourner en pourcentage
    });
    const moyenneE = valeursE_tous.length > 0 ? valeursE_tous.reduce((sum, val) => sum + val, 0) / valeursE_tous.length : null;
    const moyenneC = valeursC_tous.length > 0 ? valeursC_tous.reduce((sum, val) => sum + val, 0) / valeursC_tous.length : null;
    const moyenneP = valeursP_tous.length > 0 ? valeursP_tous.reduce((sum, val) => sum + val, 0) / valeursP_tous.length : null;
    const r_EP = calculerCorrelationPearson(valeursE_tous, valeursP_tous);

    // Moyennes filtrées (≥ minimum d'évaluations seulement)
    const etudiantsQualifies = etudiantsFiltres.filter(e => !e.performanceInsuffisante && (e.indicesCalcules.C > 0 || e.indicesCalcules.P > 0));
    const vP_qualifies = etudiantsQualifies.map(e => e.indicesCalcules.P);
    const vC_qualifies = etudiantsQualifies.map(e => e.indicesCalcules.C);
    const vE_qualifies = etudiantsQualifies.map(e => {
        const A = e.indicesCalcules.A / 100, C = e.indicesCalcules.C / 100, P = e.indicesCalcules.P / 100;
        return Math.pow(A * C * P, 1/3) * 100;
    });
    const moyenneP_qualifies = vP_qualifies.length > 0 ? vP_qualifies.reduce((s, v) => s + v, 0) / vP_qualifies.length : null;
    const moyenneC_qualifies = vC_qualifies.length > 0 ? vC_qualifies.reduce((s, v) => s + v, 0) / vC_qualifies.length : null;
    const moyenneE_qualifies = vE_qualifies.length > 0 ? vE_qualifies.reduce((s, v) => s + v, 0) / vE_qualifies.length : null;
    const nbInsuffisants = etudiantsFiltres.filter(e => e.performanceInsuffisante).length;

    // Stocker pour le toggle
    window._moyennesQualifies = { P: moyenneP_qualifies, C: moyenneC_qualifies, E: moyenneE_qualifies, A: moyenneA, nb: etudiantsQualifies.length, nbInsuffisants };
    window._moyennesToutes = { P: moyenneP, C: moyenneC, E: moyenneE, A: moyenneA };

    // Afficher le compteur à côté de la checkbox
    const badgeInsuf = document.getElementById('badge-nb-insuffisants');
    if (badgeInsuf) badgeInsuf.textContent = nbInsuffisants > 0 ? '(' + nbInsuffisants + ')' : '';

    // Info-bulles sur les moyennes P (Liste)
    const moyPCell = document.getElementById('moy-p');
    if (moyPCell) {
        const nbTotalPour = valeursP_tous.length;
        const nbAvecP0 = valeursP_tous.filter(v => v === 0).length;
        moyPCell.title = 'Moyenne P sur ' + nbTotalPour + ' élèves (tous inclus, ' + nbAvecP0 + ' à 0%). L\'aperçu exclut les élèves sans évaluation.';
    }

    // Corrélations Pattern↔P, RàI↔P, Interventions↔P
    var scorePattern = { 'Non-participation': 0, 'Données insuffisantes': null, 'Difficulté persistante': 1, 'Difficulté émergente': 2, 'Défi spécifique': 3, 'Stable': 4 };
    var valeursPattern = [];
    var valeursRai = [];
    var valeursInterv = [];
    var valeursP_pattern = [];
    var valeursP_rai = [];
    var valeursP_interv = [];

    etudiants.forEach(function(e, idx) {
        var rai = typeof determinerNiveauRaiPedagogique === 'function' ? determinerNiveauRaiPedagogique(e.da) : null;
        var pVal = valeursP_tous[idx];

        // Pattern (exclure données insuffisantes)
        if (rai && scorePattern[rai.pattern] !== undefined && scorePattern[rai.pattern] !== null) {
            valeursPattern.push(scorePattern[rai.pattern]);
            valeursP_pattern.push(pVal);
        }

        // RàI niveau (exclure niveau 0 = en attente)
        if (rai && rai.niveau > 0) {
            valeursRai.push(rai.niveau);
            valeursP_rai.push(pVal);
        }

        // Interventions (nombre)
        var nbInterv = typeof obtenirInterventionsEtudiant === 'function' ? obtenirInterventionsEtudiant(e.da).length : 0;
        valeursInterv.push(nbInterv);
        valeursP_interv.push(pVal);
    });

    var r_PatternP = calculerCorrelationPearson(valeursPattern, valeursP_pattern);
    var r_RaiP = calculerCorrelationPearson(valeursRai, valeursP_rai);
    var r_IntervP = calculerCorrelationPearson(valeursInterv, valeursP_interv);

    // Mettre à jour les lignes moyenne et corrélation dans le thead
    mettreAJourEntetesAvecCorrelations(r_AP, r_CP, r_EP, r_PatternP, r_RaiP, r_IntervP, moyenneA, moyenneC, moyenneP, moyenneE);

    // 🆕 BETA 91: Mettre à jour la carte explicative sur le calcul des indices
    mettreAJourExplicationCalculIndices();

    // 🆕 BETA 91: Mettre à jour le titre avec toggle et badge pratique
    mettreAJourTitreListeEtudiants();

    // Réattacher les événements Primo (pour l'icône 📍)
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
        if (etudiant.performanceInsuffisante) {
            tr.dataset.insuffisant = 'true';
        }

        // Rendre la ligne cliquable
        tr.style.cursor = 'pointer';
        tr.onclick = function () {
            // Afficher le profil ET basculer vers la sous-section Profil
            afficherSousSection('suivi-profil');
            afficherProfilComplet(etudiant.da);
        };

        // Effet de survol géré par CSS (plus fiable pour adaptation par mode)

        // Échapper les valeurs pour sécurité
        // IMPORTANT: En mode anonymisation, ne PAS afficher les DA du tout
        // Les élèves sont déjà identifiés par leur numéro (Élève 1, Élève 2, etc.)
        const modeAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();
        const da = modeAnonymisation ? '---' : echapperHtml(etudiant.da || '');
        const groupe = echapperHtml(etudiant.groupe || '');
        const nom = echapperHtml(etudiant.nom || '');  // Déjà anonymisé si mode anonymisation
        const prenom = echapperHtml(etudiant.prenom || '');  // Déjà anonymisé si mode anonymisation

        // NOUVEAU: Construire le HTML avec toutes les colonnes
        let html = '';
        html += '<td style="text-align: center; color: var(--texte-muted); font-weight: 600;">' + etudiant.num + '</td>';
        html += '<td>' + da + '</td>';
        html += '<td class="etud-text-center"><strong>' + groupe + '</strong></td>';
        html += '<td>' + nom + '</td>';
        html += '<td>' + prenom + '</td>';
        html += '<td class="etud-text-center">' + (etudiant.sa === 'Oui' ? '✓' : '') + '</td>';

        // 🆕 BETA 95.7 (22 jan) : Détecter données manquantes INDIVIDUELLEMENT
        const tiret = '<span class="etud-texte-gris-clair">—</span>';

        // Détection individuelle des données manquantes
        // Pour A : vérifier si des présences ont été SAISIES (même si absent = 0%)
        let presences = obtenirDonneesSelonMode('presences') || [];
        if (!Array.isArray(presences)) presences = [];
        const presencesEtudiant = presences.filter(p => p.da === etudiant.da);
        const aPresencesSaisies = presencesEtudiant.length > 0;  // Présences saisies (même si absent)

        // Pour C et P : au moins une évaluation
        const aEvaluations = indices.C > 0 || indices.P > 0;

        // Colonnes A-C-P avec couleurs
        const couleurA = obtenirCouleurAssiduite(Math.round(indices.A));
        const couleurC = obtenirCouleurCompletion(Math.round(indices.C));
        const couleurP = obtenirCouleurPerformance(Math.round(indices.P));

        // Colonne A : afficher si présences SAISIES (même si 0%), sinon tiret
        if (aPresencesSaisies) {
            html += '<td class="etud-text-center"><strong style="color: ' + couleurA + ';">' + Math.round(indices.A) + '%</strong></td>';
        } else {
            html += '<td class="etud-text-center">' + tiret + '</td>';
        }

        // Colonnes C et P : afficher si évaluations, sinon tiret
        if (aEvaluations) {
            html += '<td class="etud-text-center"><strong style="color: ' + couleurC + ';">' + Math.round(indices.C) + '%</strong></td>';
            html += '<td class="etud-text-center"><strong style="color: ' + couleurP + ';">' + Math.round(indices.P) + '%</strong></td>';
        } else {
            html += '<td class="etud-text-center">' + tiret + '</td>';
            html += '<td class="etud-text-center">' + tiret + '</td>';
        }

        // Colonne E : afficher seulement si présences saisies ET évaluations
        if (aPresencesSaisies && aEvaluations) {
            // Colonne Engagement E = (A × C × P)^(1/3) en pourcentage
            const E_brut = (indices.A / 100) * (indices.C / 100) * (indices.P / 100);
            const E = Math.pow(E_brut, 1/3);
            const engagementPct = Math.round(E * 100);
            const couleurE = obtenirCouleurEngagement(engagementPct);
            html += '<td class="etud-text-center"><strong style="color: ' + couleurE + ';">' + engagementPct + '%</strong></td>';
        } else {
            // Pas assez de données pour calculer E
            html += '<td class="etud-text-center">' + tiret + '</td>';
        }

        // Colonnes Pattern et RàI (affichées uniquement si RàI activé)
        // 🆕 BETA 95.7 : Même logique que E - besoin de présences ET évaluations
        // Toujours générer les cellules pour garder nth-child cohérent avec les checkboxes colonnes
        if (activerRai) {
            if (aPresencesSaisies && aEvaluations) {
                html += '<td class="etud-text-center"><span class="' + badgePattern.classe + '">' + badgePattern.label + '</span></td>';
                html += '<td class="etud-text-center"><span class="' + badgeRai.classe + '">' + badgeRai.label + '</span></td>';
            } else {
                html += '<td class="etud-text-center">' + tiret + '</td>';
                html += '<td class="etud-text-center">' + tiret + '</td>';
            }
        } else {
            // Cellules vides masquées — maintient le nombre de colonnes à 13
            html += '<td class="etud-text-center u-hide">' + tiret + '</td>';
            html += '<td class="etud-text-center u-hide">' + tiret + '</td>';
        }

        // NOUVEAU (Beta 85): Colonne Interventions
        const nbInterventions = (typeof obtenirInterventionsEtudiant === 'function')
            ? obtenirInterventionsEtudiant(etudiant.da).length
            : 0;

        if (nbInterventions > 0) {
            html += '<td class="etud-text-center"><span style="color: var(--accent-primaire); font-weight: 600;">📋 ' + nbInterventions + '</span></td>';
        } else {
            html += '<td class="etud-text-center"><span class="etud-texte-gris-clair">—</span></td>';
        }

        tr.innerHTML = html;
        tbody.appendChild(tr);
    });


    // Restaurer les préférences de colonnes visibles et vérifier le débordement
    restaurerPreferencesColonnesListe();
    setTimeout(verifierDebordementTableauListe, 50);
}

// ============================================
// SÉLECTEUR DE COLONNES VISIBLES (LISTE ÉTUDIANTS)
// ============================================

var listeColonneIndexMap = {
    'da': 2,
    'groupe': 3,
    'nom': 4,
    'prenom': 5,
    'sa': 6,
    'assiduite': 7,
    'completion': 8,
    'performance': 9,
    'engagement': 10,
    'pattern': 11,
    'rai': 12,
    'interv': 13
};

function toggleColonneListe(checkbox) {
    var colonne = checkbox.getAttribute('data-colonne');
    var index = listeColonneIndexMap[colonne];
    if (!index) return;

    var tableau = document.querySelector('#tableEtudiantsListe .tableau');
    if (!tableau) return;

    var cellules = tableau.querySelectorAll('th:nth-child(' + index + '), td:nth-child(' + index + ')');
    cellules.forEach(function(cell) {
        if (checkbox.checked) {
            cell.classList.remove('u-hide');
        } else {
            cell.classList.add('u-hide');
        }
    });

    sauvegarderPreferencesColonnesListe();
    setTimeout(verifierDebordementTableauListe, 50);
}

function sauvegarderPreferencesColonnesListe() {
    var selecteur = document.getElementById('liste-colonnes-selecteur');
    if (!selecteur) return;
    var prefs = {};
    selecteur.querySelectorAll('input[data-colonne]').forEach(function(cb) {
        prefs[cb.getAttribute('data-colonne')] = cb.checked;
    });
    sessionStorage.setItem('liste-colonnes-visibles', JSON.stringify(prefs));
}

function restaurerPreferencesColonnesListe() {
    var raw = sessionStorage.getItem('liste-colonnes-visibles');
    if (!raw) return;
    try {
        var prefs = JSON.parse(raw);
        var selecteur = document.getElementById('liste-colonnes-selecteur');
        if (!selecteur) return;
        Object.keys(prefs).forEach(function(colonne) {
            var cb = selecteur.querySelector('input[data-colonne="' + colonne + '"]');
            if (cb) {
                cb.checked = prefs[colonne];
                if (!prefs[colonne]) {
                    toggleColonneListe(cb);
                }
            }
        });
    } catch (e) { console.warn('[Etudiants] column prefs corrupted, using defaults:', e.message || e); }
}

function verifierDebordementTableauListe() {
    var conteneur = document.getElementById('tableEtudiantsListe');
    if (!conteneur) return;

    var msgId = 'liste-msg-debordement';
    var msg = document.getElementById(msgId);

    var deborde = conteneur.scrollWidth > conteneur.clientWidth + 2;

    if (deborde) {
        if (!msg) {
            msg = document.createElement('div');
            msg.id = msgId;
            msg.className = 'eval-msg-debordement';
            msg.textContent = 'Le tableau dépasse l\u2019écran \u2014 décoche des colonnes ci-dessus pour ajuster la vue.';
            conteneur.parentNode.insertBefore(msg, conteneur);
        }
        msg.classList.remove('u-hide');
    } else if (msg) {
        msg.classList.add('u-hide');
    }
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
    const filtreRai = document.getElementById('filtre-rai-liste');
    const filtrePattern = document.getElementById('filtre-pattern-liste');
    const rechercheNom = document.getElementById('recherche-nom-liste');

    if (filtreGroupe) {
        filtreGroupe.value = '';
    }
    if (filtreProgramme) {
        filtreProgramme.value = '';
    }
    if (filtreRai) {
        filtreRai.value = '';
    }
    if (filtrePattern) {
        filtrePattern.value = '';
    }
    if (rechercheNom) {
        rechercheNom.value = '';
    }

    afficherListeEtudiantsConsultation();  // ← CHANGEMENT ICI
}

/**
 * Alias pour resetFiltresListe() - utilisé par le bouton dans l'interface
 */
function reinitialiserFiltresListeEtudiants() {
    resetFiltresListe();
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

    // Basculer vers la sous-section profil
    afficherSousSection('suivi-profil');

    // Déléguer au module profil-etudiant.js pour l'affichage complet
    if (typeof afficherProfilComplet === 'function') {
        afficherProfilComplet(da);
    } else {
        // Fallback basique si le module n'est pas chargé
        console.warn('⚠️ Module profil-etudiant.js non chargé, affichage basique');

        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
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

}

/* ===============================
   🆕 NOUVELLES FONCTIONNALITÉS Beta 84
   =============================== */

/**
 * Trie le tableau par une colonne donnée
 * @param {string} colonne - Nom de la colonne à trier
 */
function trierTableauPar(colonne) {

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
        case 'Difficulté persistante':
            return { label: pattern, classe: 'badge-sys badge-pattern-difficulte-persistante' };
        case 'Difficulté émergente':
            return { label: pattern, classe: 'badge-sys badge-pattern-difficulte-emergente' };
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
window.reinitialiserFiltresListeEtudiants = reinitialiserFiltresListeEtudiants;
window.calculerTauxCompletion = calculerTauxCompletion;
window.toggleColonneListe = toggleColonneListe;
window.resetFiltresListe = resetFiltresListe;

})();
