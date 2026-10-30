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
        // L-9 (#749 lot 2) : « 1 » et « 00001 » sont UNE entrée — normalisé à la
        // lecture (window.normaliserNumeroGroupe, modes.js), le stock reste tel quel.
        const norm = typeof normaliserNumeroGroupe === 'function' ? normaliserNumeroGroupe : (g) => String(g || '');
        etudiants.forEach(function (e) {
            if (e.groupe && String(e.groupe).trim() !== '') {
                groupesSet.add(norm(e.groupe));
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
            : 0; // #540 lot C : 0 est un refus de répondre, jamais un repli à 2.

        periodesOffertes += nombrePeriodesSeance;

        // Utiliser periodesPresentes si disponible, sinon convertir depuis heures
        if (p.periodesPresentes !== undefined && p.periodesPresentes !== null) {
            periodesPresentes += p.periodesPresentes;
        } else if (p.heures !== undefined && p.heures !== null) {
            // Rétrocompatibilité : convertir heures en périodes
            const dureePeriode = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);
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

// #821 lot A (10 sept. 2026) — `obtenirCouleurSelonSeuils` vit dans
// `contexte-qualification.js` (mécanisme 2 : un seuil sur un scalaire, réglable).
// Les trois enveloppes ci-dessous l'appellent par `window`. Son repli « module
// des seuils absent » (les trois défauts recopiés en dur) est parti avec elle.

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
        // Session C (Lot 3) : jeton SOM|PAN retiré — obtenirIndicesCP rend la
        // couche unique de la pratique active.
        const indicesCP = obtenirIndicesCP(da);

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
        // Session C (Lot 3) : jeton SOM|PAN retiré — couche unique active.
        const indicesCP = obtenirIndicesCP(da);

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
 * @param {Object} [reperes] - `reperesPerformance()`, lus une fois par rendu
 * @returns {string} - Code couleur CSS
 */
function obtenirCouleurPerformance(performance, reperes) {
    return window.obtenirCouleurPerformanceSelonEchelle(performance, reperes);
}

// calculerCorrelationPearson → déplacé dans indices.js (#206)

/**
 * Génère le contenu de la carte explicative sur le calcul des indices A-C-P.
 * Source UNIQUE partagée par les deux pages qui exposent cette note (#310) :
 * - Liste des étudiant·es (#note-calcul-indices-liste, ce module)
 * - Suivi du groupe (#note-indicateurs, tableau-bord-apercu.js)
 * Le terme production/artefact suit la pratique active via obtenirTermeProduction()
 * — jamais codé en dur — pour rester cohérent avec les notes dynamiques des
 * autres pages (CSP `script-src 'self'` : impossible depuis du HTML statique).
 *
 * @param {string} complementHtml - HTML optionnel ajouté en pied (ex. la note
 *   propre à la page Suivi du groupe sur les mini-courbes de Gauss). Microcopy
 *   interne déjà sûr — aucune donnée utilisateur n'est injectée ici.
 * RETOUR:
 * - HTML formaté expliquant comment A, C et P sont calculés
 */
function genererExplicationCalculIndices(complementHtml = '') {
    // Récupérer la configuration de la pratique active
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null);   // lot N1b : null sans pratique assignée — aucun repli
    const isPAN = pratique === 'standards';

    // Terme production/artefact dynamique (suit la pratique active) — #310.
    const termeSing = (typeof obtenirTermeProduction === 'function')
        ? obtenirTermeProduction('singulier') : 'artefact';
    const termePlur = (typeof obtenirTermeProduction === 'function')
        ? obtenirTermeProduction('pluriel') : 'artefacts';

    // Récupérer les paramètres de configuration
    const nbArtefacts = config.nombreArtefacts || 7;

    // Lot N1b (21 sept. 2026) : sans pratique assignée, l'aide ne nomme aucune pratique (avant : « PAN-Standards »,
    // le repli PRATIQUE_DEFAUT) et dit, pour P, la phrase du diagnostic du profil — aucun mot neuf.
    let html = '<strong>Méthodes de calcul des indices' + (pratique ? ' (pratique active : ' + (isPAN ? 'PAN-Standards' : 'Sommative') + ')' : '') + '</strong><br><br>';

    // A - Assiduité (TOUJOURS DYNAMIQUE - comportement cumulatif)
    html += '<strong class="u-texte-bleu">A (Assiduité)</strong> : ';
    html += 'Proportion des heures de présence parmi les heures de cours <strong>effectivement données jusqu\'à maintenant</strong>. ';
    html += '<br>Formule : <code>A = (heures présentes / heures données) × 100</code>';
    html += '<br><em class="etud-texte-gris-petit">→ Calculé uniquement sur les séances passées (pas sur le total prévu pour la session)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Exemple : Si 8 séances données sur 15 prévues, un étudiant présent 8/8 a A = 100\u00a0% (pas 53\u00a0%)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Indépendant de la pratique de notation (fait observable)</em>';

    html += '<br><br>';

    // C - Complétion (TOUJOURS DYNAMIQUE - mobilisation cumulée)
    html += '<strong class="u-texte-bleu">C (Complétion)</strong> : ';
    html += 'Proportion de travaux remis parmi les travaux <strong>effectivement réalisés jusqu\'à maintenant</strong>. ';
    html += '<br>Formule : <code>C = (travaux remis / travaux réalisés) × 100</code>';
    html += '<br><em class="etud-texte-gris-petit">→ Un ' + termeSing + ' devient "réalisé" dès qu\'une première évaluation existe pour celui-ci</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Exemple : Si 8 ' + termePlur + ' réalisés sur 10 prévus, un étudiant ayant remis 8/8 a C = 100\u00a0% (pas 80\u00a0%)</em>';
    html += '<br><em class="etud-texte-gris-petit">→ Indépendant de la pratique de notation (mobilisation observable)</em>';

    html += '<br><br>';

    // P - Performance (DÉPEND TOUJOURS DE LA PRATIQUE - résultat pédagogique)
    html += '<strong class="u-texte-bleu">P (Performance)</strong> : ';
    html += '<strong>Calculé selon la pratique de notation en vigueur</strong>. ';

    if (!pratique) {
        const diagnostic = (typeof window._diagnostiquerNoteNonCalculable === 'function') ? window._diagnostiquerNoteNonCalculable() : '';
        if (diagnostic) html += '<br>→ ' + echapperHtml(diagnostic);
    } else if (isPAN) {
        html += '<br>→ <strong>PAN-Standards</strong> : Moyenne des <strong>' + nbArtefacts + ' meilleurs ' + termePlur + '</strong> selon l\'échelle IDME. ';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Les niveaux IDME (Incomplet, Développement, Maîtrise, Étendu) sont convertis en pourcentages.</em>';
        html += '<br><em class="etud-texte-gris-petit">&nbsp;&nbsp;&nbsp;Seuls les ' + nbArtefacts + ' meilleurs ' + termePlur + ' comptent dans le calcul de P</em>';
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
    html += '<em class="etud-texte-gris-moyen">💡 La pratique de notation et ses paramètres peuvent être modifiés dans <strong>Conception → Pratiques de notation</strong></em>';

    // Complément propre à la page appelante (ex. mention Gauss du Suivi du groupe).
    if (complementHtml) {
        html += '<br><br>' + complementHtml;
    }

    return html;
}
// #310 : source unique exposée pour la page Suivi du groupe (tableau-bord-apercu.js).
window.genererExplicationCalculIndices = genererExplicationCalculIndices;

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
 * Met à jour le titre de la liste des étudiants avec toggle et badge pratique
 * Similaire au format de l'Aperçu du Tableau de bord
 */
function mettreAJourTitreListeEtudiants() {
    const titre = document.getElementById('titre-liste-etudiants');
    if (!titre) {
        console.warn('⚠️ Élément #titre-liste-etudiants introuvable');
        return;
    }

    // L-11 (#749 lot 2) : le bouton d'aide contextuelle (`data-aide="suivi-liste"`,
    // index.html) vit DANS ce h2 ; le vider le détruisait au premier rendu — la
    // capture démo montrait le « i » du primo-aide à sa place. On le garde et on le
    // remet à droite, avant le primo-aide.
    const boutonAide = titre.querySelector('[data-aide]');
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

    // Partie droite : aide contextuelle (icône info)
    const partieDroite = document.createElement('div');
    partieDroite.innerHTML = `
        <span class="primo-aide" data-target="note-calcul-indices-liste"
              title="Explication du calcul des indices"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
    `;

    if (boutonAide) partieDroite.insertBefore(boutonAide, partieDroite.firstChild);

    conteneurTitre.appendChild(partieGauche);
    conteneurTitre.appendChild(partieDroite);
    titre.appendChild(conteneurTitre);
}

/**
 * Met à jour les lignes moyenne et corrélation dans le thead
 */
function mettreAJourEntetesAvecCorrelations(r_AP, r_CP, r_PatternP, r_RaiP, r_IntervP, moyenneA, moyenneC, moyenneP) {
    function fmtMoy(v) {
        if (v === null || v === undefined || isNaN(v)) return '—';
        return 'moy=' + formaterPourcentage(Math.round(v));
    }
    function fmtCorr(r) {
        if (r === null || r === undefined || isNaN(r)) return '—';
        return 'r=' + formaterNombre(r, 2);
    }
    // Interprétation textuelle de l'intensité d'un coefficient de Pearson
    function intensiteCorr(r) {
        if (r === null || r === undefined || isNaN(r)) return null;
        var abs = Math.abs(r);
        var sens = r >= 0 ? 'positive' : 'négative';
        if (abs < 0.1) return 'lien quasi nul';
        if (abs < 0.3) return 'corrélation ' + sens + ' faible';
        if (abs < 0.5) return 'corrélation ' + sens + ' modérée';
        if (abs < 0.7) return 'corrélation ' + sens + ' forte';
        return 'corrélation ' + sens + ' très forte';
    }
    // Tooltip standard pour une cellule de corrélation
    function tooltipCorr(r, sujet, sensAttendu) {
        var base = 'Coefficient de Pearson entre ' + sujet + ' et P.\n';
        base += 'Échelle : −1 (lien inverse parfait) → 0 (aucun lien) → +1 (lien parfait).\n';
        if (sensAttendu) base += sensAttendu + '\n';
        var interp = intensiteCorr(r);
        if (interp) base += 'Ici : ' + interp + '.';
        else base += 'Ici : pas assez de données pour calculer r.';
        return base;
    }

    // Ligne moyennes
    var moyA = document.getElementById('moy-a');
    var moyC = document.getElementById('moy-c');
    var moyP = document.getElementById('moy-p');
    if (moyA) moyA.textContent = fmtMoy(moyenneA);
    if (moyC) moyC.textContent = fmtMoy(moyenneC);
    if (moyP) moyP.textContent = fmtMoy(moyenneP);

    // Ligne corrélations avec P
    var corrA = document.getElementById('corr-a');
    var corrC = document.getElementById('corr-c');
    var corrPattern = document.getElementById('corr-pattern');
    var corrRai = document.getElementById('corr-rai');
    var corrInterv = document.getElementById('corr-interv');
    if (corrA) {
        corrA.textContent = fmtCorr(r_AP);
        corrA.title = tooltipCorr(r_AP, 'Assiduité (A)', 'Sens attendu : positif (être présent → mieux performer).');
    }
    if (corrC) {
        corrC.textContent = fmtCorr(r_CP);
        corrC.title = tooltipCorr(r_CP, 'Complétion (C)', 'Sens attendu : positif (remettre les travaux → mieux performer).');
    }
    if (corrPattern) {
        corrPattern.textContent = fmtCorr(r_PatternP);
        corrPattern.title = tooltipCorr(r_PatternP, 'le pattern d\'apprentissage', 'Sens attendu : positif (Stable → P plus haute, Difficulté persistante → P plus basse).');
    }
    if (corrRai) {
        corrRai.textContent = fmtCorr(r_RaiP);
        corrRai.title = tooltipCorr(r_RaiP, 'le niveau RàI', 'Sens attendu : négatif (niveau RàI plus élevé = besoin d\'accompagnement = P plus basse).');
    }
    if (corrInterv) {
        corrInterv.textContent = fmtCorr(r_IntervP);
        corrInterv.title = tooltipCorr(r_IntervP, 'le nombre d\'interventions', 'Sens attendu : négatif (plus d\'interventions = étudiant·e en plus grande difficulté).');
    }

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
        return 'moy=' + formaterPourcentage(Math.round(v));
    }

    var moyC = document.getElementById('moy-c');
    var moyP = document.getElementById('moy-p');
    if (moyC) moyC.textContent = fmtMoy(moy.C);
    if (moyP) {
        moyP.textContent = fmtMoy(moy.P);
        if (actif && window._moyennesQualifies) {
            moyP.title = 'Moyenne P sur ' + window._moyennesQualifies.nb + ' étudiant·es qualifié·es (≥ minimum). ' + window._moyennesQualifies.nbInsuffisants + ' exclu·es.';
        }
    }
}
window.toggleFiltreMinimum = toggleFiltreMinimum;

/* ===============================
   🔍 FILTRAGE ET RECHERCHE
   =============================== */

/**
 * Filtre les étudiants selon les critères sélectionnés
 * @param {Array} etudiants - Liste complète des étudiants
 * @returns {Array} - Liste filtrée des étudiants
 */
/**
 * L-3 (#749 lot 2) — UNE normalisation pour la recherche et le filtre pattern :
 * minuscules, sans accents. « herisson » trouve Hérisson, « fiere » Fière,
 * « comaneci » Comăneci. Le tri par nom, lui, reste `localeCompare`.
 */
function normaliserTexteRecherche(texte) {
    return String(texte || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Lot 2 des seuils : un lot de calculs par passage sur le groupe. Le niveau RàI lit tout le cours : hors lot, il le
 * relirait pour chaque élève.
 */
function dansUnLotDeCalculs(calcul) {
    if (typeof demarrerCacheLecture === 'function') demarrerCacheLecture();
    try {
        return calcul();
    } finally {
        if (typeof terminerCacheLecture === 'function') terminerCacheLecture();
    }
}

function filtrerEtudiants(etudiants) {
    let resultats = etudiants.slice(); // Copie

    // L-2 (#749 lot 2, décision de Grégoire 11 sept. 2026 : « les abandons visibles,
    // grisés ») — le filtre `statut === 'actif'` est RETIRÉ. La note de l'écran
    // disait déjà que les abandons, inactifs et décrochages restent dans le tableau
    // pour consultation ; elle devient vraie. Les statistiques, elles, passent par
    // `estEtudiantExclu` plus bas et ne bougent pas.

    // Filtrer par groupe — L-9 : comparaison normalisée (« 1 » = « 00001 »)
    const filtreGroupe = document.getElementById('filtre-groupe-liste');
    if (filtreGroupe && filtreGroupe.value) {
        const norm = typeof normaliserNumeroGroupe === 'function' ? normaliserNumeroGroupe : (g) => String(g || '');
        const groupeFiltre = norm(filtreGroupe.value);
        resultats = resultats.filter(function (e) {
            return norm(e.groupe) === groupeFiltre;
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
        resultats = dansUnLotDeCalculs(() => resultats.filter(function (e) {
            // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
            const niveauInfo = determinerNiveauRaiPedagogique(e.da);
            return niveauInfo.niveau === niveauRai;
        }));
    }

    // NOUVEAU: Filtre par pattern d'apprentissage
    const filtrePattern = document.getElementById('filtre-pattern-liste');
    if (filtrePattern && filtrePattern.value) {
        const patternFiltre = filtrePattern.value;
        resultats = dansUnLotDeCalculs(() => resultats.filter(function (e) {
            // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
            const niveauInfo = determinerNiveauRaiPedagogique(e.da);
            // Normaliser le pattern : minuscules, sans accents, espaces → tirets
            const pattern = normaliserTexteRecherche(niveauInfo.pattern).replace(/\s+/g, '-');
            return pattern === patternFiltre;
        }));
    }

    // Recherche par nom/prénom/DA
    const rechercheNom = document.getElementById('recherche-nom-liste');
    if (rechercheNom && rechercheNom.value.trim()) {
        const recherche = normaliserTexteRecherche(rechercheNom.value.trim());
        resultats = resultats.filter(function (e) {
            const nomComplet = normaliserTexteRecherche((e.nom || '') + ' ' + (e.prenom || ''));
            const da = normaliserTexteRecherche(e.da || '');
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

/**
 * L-4 (#749 lot 2) — la recherche est câblée `data-on-input` : un rendu complet par
 * lettre tapée, avec recalcul des indices du groupe. Cette enveloppe ne rend qu'au
 * silence (200 ms) ; les `change` des sélecteurs, eux, restent immédiats.
 */
let _minuterieRenduListe = null;
function afficherListeEtudiantsConsultationDifferee() {
    if (_minuterieRenduListe) clearTimeout(_minuterieRenduListe);
    _minuterieRenduListe = setTimeout(function () {
        _minuterieRenduListe = null;
        afficherListeEtudiantsConsultation();
    }, 200);
}

/**
 * Le compte de la colonne « ≥ Min. » : les évaluations notées et non remplacées de chaque élève, rangées par DA (une passe).
 * #1055 : une production diagnostique n'y entre pas. Lot 2 des standards sans portfolio (29 oct. 2026) : en standards,
 * les productions comptées sont le pool de la note (`obtenirIdsPoolStdDuCorpus`) ; avant, les seuls « Artefact », et une
 * pratique sans artefacts mettait tout le groupe sous le minimum. Hors standards, les « Artefact », comme avant.
 * @returns {Map<string, number>}
 */
function compterEvaluationsPourMinimum(productions, evaluations) {
    const productionsTab = window.ProductionDiagnostique.filtrerProductions(productions);
    const estStandards = (typeof obtenirTypePratiqueActive === 'function' ? obtenirTypePratiqueActive() : null) === 'standards';
    const idsComptes = new Set(estStandards ? window.obtenirIdsPoolStdDuCorpus(productionsTab)
        : productionsTab.filter(p => p.type === 'artefact-portfolio').map(p => p.id));
    const evalsParDA = new Map();
    evaluations.forEach(ev => {
        if (idsComptes.has(ev.productionId) && !ev.remplaceeParId &&
            ev.noteFinale !== null && ev.noteFinale !== undefined) {
            evalsParDA.set(ev.etudiantDA, (evalsParDA.get(ev.etudiantDA) || 0) + 1);
        }
    });
    return evalsParDA;
}

function afficherListeEtudiantsConsultation() {

    // 🔄 FORCER le recalcul des indices A, C et P avant affichage.
    // L-4 (#749 lot 2) : cet appel CHAÎNE déjà calculerEtStockerIndicesCP
    // (indices.js, fin de calculerEtSauvegarderIndicesAssiduite — prouvé par la
    // sentinelle #749 du lot 1) ; l'appel direct qui suivait écrivait
    // `<trim>_indicesCP` une seconde fois par rendu. Retiré.
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
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

    // Mettre à jour les badges nombre de personnes — c'est un compte de LIGNES affichées
    // (abandons visibles compris depuis #749 lot 2), pas une statistique : les `moy=`
    // et `r=` de l'en-tête se calculent plus bas sur les actifs seulement.
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
        // Audit du 6 sept. (§ 2.4), commenté et laissé le 11 : on sort AVANT de
        // mettre à jour `#moy-*` et `#corr-*` — après un filtre qui ne retient
        // personne, l'en-tête garde les moyennes de l'affichage précédent, sous un
        // tableau masqué. Mineur : rien de faux n'est affiché à côté d'une ligne.
        return;
    }

    // Afficher le tableau
    if (messageVide) {
        messageVide.classList.add('u-hide');
    }
    if (tableContainer) {
        tableContainer.classList.remove('u-hide');
    }

    // Corrélations A-P et C-P calculées sur la population pédagogiquement pertinente :
    // les étudiants ACTIFS uniquement. Inclure les abandons/inactifs introduit un cluster
    // faible-A / faible-P qui gonfle artificiellement r sans signification pédagogique.
    // IMPORTANT: Utiliser la même pratique que le tableau de bord (déduite par calculerTousLesIndices).
    // Session C (#303) : mode comparatif retiré ; le jeton SOM|PAN est inerte
    // depuis Beta 95.5 (obtenirIndicesCP l'ignore). calculerTousLesIndices(da)
    // déduit la pratique active → un seul jeu d'indices A-C-P.

    // Vérifier que calculerTousLesIndices existe (chargé depuis profil-etudiant.js)
    const tousIndices = typeof window.calculerTousLesIndices === 'function'
        ? etudiants.map(e => calculerTousLesIndices(e.da))
        : etudiants.map(e => calculerIndicesEtudiant(e.da)); // Fallback vers ancienne fonction

    const valeursA_tous = tousIndices.map(indices => indices.A);
    const valeursC_tous = tousIndices.map(indices => indices.C);
    const valeursP_tous = tousIndices.map(indices => indices.P);

    // Identifier les étudiants actifs (≠ abandon/inactif/décrochage). Règle métier : main.js:60.
    const estExclu = typeof estEtudiantExclu === 'function' ? estEtudiantExclu : () => false;
    const indexActifs = etudiants.map((e, i) => estExclu(e) ? -1 : i).filter(i => i >= 0);
    const nbExclusInactifs = etudiants.length - indexActifs.length;
    const valeursA_actifsCorr = indexActifs.map(i => valeursA_tous[i]);
    const valeursC_actifsCorr = indexActifs.map(i => valeursC_tous[i]);
    const valeursP_actifsCorr = indexActifs.map(i => valeursP_tous[i]);

    // #743 (lot D, 19 sept. 2026) : une assiduité INCONNUE (`null`) n'entre pas dans la corrélation A-P —
    // Pearson la lirait comme un 0. La paire (A, P) de cet élève est écartée, pas remplacée.
    const pairesAP = valeursA_actifsCorr.map((a, i) => [a, valeursP_actifsCorr[i]]).filter(paire => paire[0] !== null);
    const r_AP = calculerCorrelationPearson(pairesAP.map(paire => paire[0]), pairesAP.map(paire => paire[1]));
    // Lot N1b (21 sept. 2026) : même règle pour une complétion inconnue (`null`, sans pratique assignée).
    const pairesCP = valeursC_actifsCorr.map((c, i) => [c, valeursP_actifsCorr[i]]).filter(paire => paire[0] !== null);
    const r_CP = calculerCorrelationPearson(pairesCP.map(paire => paire[0]), pairesCP.map(paire => paire[1]));

    // NOUVEAU: Enrichir les données pour le tri (sans assigner les numéros encore)
    etudiantsFiltres = dansUnLotDeCalculs(() => etudiantsFiltres.map((e) => {
        const indices = typeof window.calculerTousLesIndices === 'function'
            ? calculerTousLesIndices(e.da)
            : calculerIndicesEtudiant(e.da); // Fallback
        // 🆕 BETA 90+ : Utiliser determinerNiveauRaiPedagogique (Single Source of Truth)
        const niveauInfo = determinerNiveauRaiPedagogique(e.da);
        return {
            ...e,
            indicesCalcules: indices,
            cibleCalculee: niveauInfo
        };
    }));

    // Déterminer le seuil minimum d'évaluations pour P
    // G2-b (#436, 9 août 2026) : la SSOT `pratiquesConfigurables` était déjà lue en
    // premier ; les DEUX replis sur le miroir `configPAN.portfolio` sont retirés.
    // Ils ne pouvaient servir que quand la SSOT était muette — auquel cas le miroir
    // est, par construction, encore plus périmé qu'elle.
    const configPratiqueActiveTab = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const configPortfolioTab = configPratiqueActiveTab?.portfolio || {};
    const minimumCompletionTab = configPortfolioTab.minimumCompletion || 3;

    const evalsParDA = compterEvaluationsPourMinimum(obtenirDonneesSelonMode('productions') || [],
        obtenirDonneesSelonMode('evaluationsSauvegardees') || []);

    etudiantsFiltres.forEach(e => {
        const nbEvals = evalsParDA.get(e.da) || 0;
        e.nbEvaluations = nbEvals;
        // L-6 (#749 lot 2, décision Cowork nommée) : « ≥ Min. » signifie « au moins N
        // évaluations pour qu'un P soit fiable » (la note de l'écran) — 0 est sous N.
        // Avant : `nbEvals > 0 &&`, un élève sans évaluation n'était pas « insuffisant ».
        // Un élève exclu (abandon, inactif, décrochage) n'est jamais « insuffisant » :
        // il est hors des moyennes, hors du compte « (N) » de ≥ Min., et sa ligne reste
        // grisée par son statut, pas par le filtre (relecture adverse, 11 sept. 2026).
        e.performanceInsuffisante = !estExclu(e) && nbEvals < minimumCompletionTab;
    });

    // #750 (lot D, 19 sept. 2026, tranché par Grégoire le 16) — LA MOYENNE A DE LA LISTE SUIT LA RÈGLE DU
    // SUIVI DU GROUPE : y entre tout élève actif dont l'assiduité est CONNUE (des séances saisies comptent
    // pour lui), l'absent total à 0 % compris ; l'assiduité inconnue (`null`, #743) n'y entre pas.
    // Avant : « a une fiche de présence », ce qui écartait l'absent total (70 ici, 46,7 au Suivi).
    const valeursA_actifs = indexActifs.map(i => valeursA_tous[i]).filter(v => v !== null);
    const moyenneA = valeursA_actifs.length > 0 ? valeursA_actifs.reduce((s, v) => s + v, 0) / valeursA_actifs.length : null;

    // Moyenne C : tous les actifs (les 0% comptent)
    const valeursC_actifs = indexActifs.map(i => valeursC_tous[i]);
    const moyenneC = valeursC_actifs.length > 0 ? valeursC_actifs.reduce((s, v) => s + v, 0) / valeursC_actifs.length : null;

    // Moyenne P : actifs ayant au moins une évaluation (C>0 OU P>0), comme l'Aperçu
    const indexActifsAvecEval = indexActifs.filter(i => valeursC_tous[i] > 0 || valeursP_tous[i] > 0);
    const valeursP_actifsAvecEval = indexActifsAvecEval.map(i => valeursP_tous[i]);
    const nbActifsSansEval = indexActifs.length - indexActifsAvecEval.length;
    const moyenneP = valeursP_actifsAvecEval.length > 0 ? valeursP_actifsAvecEval.reduce((s, v) => s + v, 0) / valeursP_actifsAvecEval.length : null;

    // Moyennes filtrées (≥ minimum d'évaluations seulement, parmi actifs)
    const etudiantsQualifies = etudiantsFiltres.filter(e => !estExclu(e) && !e.performanceInsuffisante && (e.indicesCalcules.C > 0 || e.indicesCalcules.P > 0));
    const vP_qualifies = etudiantsQualifies.map(e => e.indicesCalcules.P);
    const vC_qualifies = etudiantsQualifies.map(e => e.indicesCalcules.C);
    const moyenneP_qualifies = vP_qualifies.length > 0 ? vP_qualifies.reduce((s, v) => s + v, 0) / vP_qualifies.length : null;
    const moyenneC_qualifies = vC_qualifies.length > 0 ? vC_qualifies.reduce((s, v) => s + v, 0) / vC_qualifies.length : null;
    const nbInsuffisants = etudiantsFiltres.filter(e => !estExclu(e) && e.performanceInsuffisante).length;

    // Stocker pour le toggle
    window._moyennesQualifies = { P: moyenneP_qualifies, C: moyenneC_qualifies, A: moyenneA, nb: etudiantsQualifies.length, nbInsuffisants };
    window._moyennesToutes = { P: moyenneP, C: moyenneC, A: moyenneA };

    // Afficher le compteur à côté de la checkbox
    const badgeInsuf = document.getElementById('badge-nb-insuffisants');
    if (badgeInsuf) badgeInsuf.textContent = nbInsuffisants > 0 ? '(' + nbInsuffisants + ')' : '';

    // Info-bulles : expliciter le dénominateur de chaque moyenne
    const suffixeExclus = nbExclusInactifs > 0 ? ' · ' + nbExclusInactifs + ' exclus (abandon/inactif)' : '';
    const moyACell = document.getElementById('moy-a');
    if (moyACell) {
        moyACell.title = 'Moyenne A sur ' + valeursA_actifs.length + ' actifs avec présences saisies' + suffixeExclus + '.';
    }
    const moyCCell = document.getElementById('moy-c');
    if (moyCCell) {
        moyCCell.title = 'Moyenne C sur ' + valeursC_actifs.length + ' actifs (les 0\u00a0% comptent)' + suffixeExclus + '.';
    }
    const moyPCell = document.getElementById('moy-p');
    if (moyPCell) {
        const suffixeSansEval = nbActifsSansEval > 0 ? ' · ' + nbActifsSansEval + ' actifs sans évaluation' : '';
        moyPCell.title = 'Moyenne P sur ' + valeursP_actifsAvecEval.length + ' actifs avec évaluations' + suffixeExclus + suffixeSansEval + '. Aligné avec l\'Aperçu.';
    }

    // Corrélations Pattern↔P, RàI↔P, Interventions↔P
    var scorePattern = { 'Non-participation': 0, 'Données insuffisantes': null, 'Difficulté persistante': 1, 'Difficulté émergente': 2, 'Défi spécifique': 3, 'Stable': 4 };
    var valeursPattern = [];
    var valeursRai = [];
    var valeursInterv = [];
    var valeursP_pattern = [];
    var valeursP_rai = [];
    var valeursP_interv = [];

    dansUnLotDeCalculs(() => etudiants.forEach(function(e, idx) {
        // Exclure les inactifs/abandons des corrélations (cohérence avec moyennes et Aperçu)
        if (estExclu(e)) return;
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
    }));

    var r_PatternP = calculerCorrelationPearson(valeursPattern, valeursP_pattern);
    var r_RaiP = calculerCorrelationPearson(valeursRai, valeursP_rai);
    var r_IntervP = calculerCorrelationPearson(valeursInterv, valeursP_interv);

    // Mettre à jour les lignes moyenne et corrélation dans le thead
    mettreAJourEntetesAvecCorrelations(r_AP, r_CP, r_PatternP, r_RaiP, r_IntervP, moyenneA, moyenneC, moyenneP);

    // 🆕 BETA 91: Mettre à jour la carte explicative sur le calcul des indices
    mettreAJourExplicationCalculIndices();

    // 🆕 BETA 91: Mettre à jour le titre avec toggle et badge pratique
    mettreAJourTitreListeEtudiants();

    // Réattacher les événements Primo (pour l'icône info)
    if (typeof reattacherEvenementsToggles === 'function') {
        reattacherEvenementsToggles();
    }

    // L-1 (#749 lot 2) : le tri « # » comparait `num`, posé APRÈS le tri — il ne
    // faisait rien. Décision : « # » trie sur l'ORDRE D'ORIGINE (celui du stockage),
    // ascendant ou descendant ; le numéro affiché reste celui de la ligne après tri.
    etudiantsFiltres.forEach(function (e, i) { e._ordreOrigine = i; });

    // NOUVEAU: Trier selon la colonne active
    etudiantsFiltres.sort(function (a, b) {
        let valeurA, valeurB;

        switch(triActuel.colonne) {
            case 'num':
                valeurA = a._ordreOrigine;
                valeurB = b._ordreOrigine;
                break;
            case 'da':
                valeurA = a.da;
                valeurB = b.da;
                break;
            case 'groupe':
                valeurA = a.groupe;
                valeurB = b.groupe;
                break;
            // #446 (trouvaille collatérale, 10 août 2026) : un étudiant sans
            // `nom` ou sans `prenom` — import CSV incomplet, fiche à moitié
            // saisie — faisait planter le comparateur, donc le TRI, donc le
            // rendu de toute la liste. Un champ manquant ne doit jamais coûter
            // l'écran entier : il trie comme une chaîne vide.
            case 'nom':
                valeurA = String(a.nom || '').toLowerCase();
                valeurB = String(b.nom || '').toLowerCase();
                break;
            case 'prenom':
                valeurA = String(a.prenom || '').toLowerCase();
                valeurB = String(b.prenom || '').toLowerCase();
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
            case 'pattern':
                valeurA = a.cibleCalculee.pattern;
                valeurB = b.cibleCalculee.pattern;
                break;
            case 'rai':
                valeurA = a.cibleCalculee.niveau;
                valeurB = b.cibleCalculee.niveau;
                break;
            default:
                valeurA = a._ordreOrigine;
                valeurB = b._ordreOrigine;
        }

        // Comparer.
        // #446 (trouvaille collatérale) : `valeurB` peut être `undefined` —
        // groupe absent, pattern non calculé, fiche incomplète — et
        // `localeCompare(undefined)` compare alors contre la chaîne "undefined"
        // au mieux, lève au pire. Le tri entier plantait, donc la liste ne
        // s'affichait plus : un champ vide chez UN étudiant coûtait l'écran de
        // TOUT le groupe. On normalise les deux côtés au moment de comparer.
        let comparaison = 0;
        if (typeof valeurA === 'string' || typeof valeurB === 'string') {
            // L-1 (#749 lot 2) : DA et groupe sont des nombres écrits en chaîne —
            // `{ numeric: true }` met 999999 avant 1000123, comme on le lit.
            const numerique = triActuel.colonne === 'da' || triActuel.colonne === 'groupe';
            comparaison = String(valeurA ?? '').localeCompare(String(valeurB ?? ''), undefined, numerique ? { numeric: true } : undefined);
        } else {
            comparaison = (valeurA ?? 0) - (valeurB ?? 0);
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

    const reperesP = window.reperesPerformance();   // une fois par rendu (règle de contexte-qualification.js)
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
        // L-2 (#749 lot 2) : un élève exclu des statistiques reste visible, GRISÉ
        // (patron `tr.etudiant-inactif` de Cadre › Trimestre, styles.css) et porte
        // son statut en clair dans la colonne Nom (mots de Cadre › Trimestre).
        const exclu = typeof estEtudiantExclu === 'function' && estEtudiantExclu(etudiant);
        const libelleStatut = exclu && typeof libelleStatutEtudiant === 'function' ? libelleStatutEtudiant(etudiant.statut) : '';
        if (exclu) {
            tr.classList.add('etudiant-inactif');
            tr.dataset.statut = etudiant.statut || '';
        }

        // Rendre la ligne cliquable
        tr.style.cursor = 'pointer';
        tr.onclick = function () {
            // #754 : afficherProfilComplet active lui-même la sous-section Profil, sans
            // réveiller le crochet de navigation.js — un seul rendu (avant : trois).
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
        html += '<td>' + nom + (libelleStatut ? ' <span class="etud-texte-gris-clair">(' + echapperHtml(libelleStatut) + ')</span>' : '') + '</td>';
        html += '<td>' + prenom + '</td>';
        html += '<td class="etud-text-center">' + (etudiant.sa === 'Oui' ? '<span class="icone-inline icone-inline--check" aria-label="Oui"></span>' : '') + '</td>';

        // 🆕 BETA 95.7 (22 jan) : Détecter données manquantes INDIVIDUELLEMENT
        const tiret = '<span class="etud-texte-gris-clair">—</span>';

        // Détection individuelle des données manquantes
        // Pour A : vérifier si des présences ont été SAISIES (même si absent = 0%)
        // #743 / #750 (lot D) : la colonne A suit l'indice — tiret tant que l'assiduité est inconnue,
        // pourcentage dès que des séances saisies comptent (l'absent total lit 0 %, comme au Suivi du groupe).
        const assiduiteConnue = indices.A !== null && indices.A !== undefined;

        // Pour C et P : au moins une évaluation
        const aEvaluations = indices.C > 0 || indices.P > 0;

        // Colonnes A-C-P avec couleurs
        const couleurA = assiduiteConnue ? obtenirCouleurAssiduite(Math.round(indices.A)) : '';
        const couleurC = obtenirCouleurCompletion(Math.round(indices.C));
        const couleurP = obtenirCouleurPerformance(Math.round(indices.P), reperesP);

        // Colonne A : afficher si l'assiduité est connue (même 0 %), sinon tiret
        if (assiduiteConnue) {
            html += '<td class="etud-text-center"><strong style="color: ' + couleurA + ';">' + formaterPourcentage(Math.round(indices.A)) + '</strong></td>';
        } else {
            html += '<td class="etud-text-center">' + tiret + '</td>';
        }

        // Colonnes C et P : afficher si évaluations, sinon tiret
        if (aEvaluations) {
            html += '<td class="etud-text-center"><strong style="color: ' + couleurC + ';">' + formaterPourcentage(Math.round(indices.C)) + '</strong></td>';
            html += '<td class="etud-text-center"><strong style="color: ' + couleurP + ';">' + formaterPourcentage(Math.round(indices.P)) + '</strong></td>';
        } else {
            html += '<td class="etud-text-center">' + tiret + '</td>';
            html += '<td class="etud-text-center">' + tiret + '</td>';
        }

        // Colonnes Pattern et RàI (affichées uniquement si RàI activé)
        // Toujours générer les cellules pour garder nth-child cohérent avec les checkboxes colonnes
        if (activerRai) {
            if (assiduiteConnue && aEvaluations) {
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

    // L-6 (#749 lot 2) : le tbody vient d'être reconstruit — si « ≥ Min. » est coché,
    // son effet (lignes grisées, moyennes qualifiées) doit être rappelé, sinon la
    // case reste cochée et l'effet est parti au premier tri ou à la première lettre.
    const chkMinimum = document.getElementById('chk-filtre-minimum');
    if (chkMinimum && chkMinimum.checked) toggleFiltreMinimum(true);

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
    'pattern': 10,
    'rai': 11,
    'interv': 12
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

// Audit du 6 sept. (§ 2.1), commenté le 11 : les colonnes visibles vivent en
// `sessionStorage` — perdues à la fermeture de l'onglet. Position, pas défaut :
// c'est une commodité de session, pas un réglage.
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
window.afficherListeEtudiantsConsultationDifferee = afficherListeEtudiantsConsultationDifferee;
window.trierTableauPar = trierTableauPar;
window.obtenirNomProgramme = obtenirNomProgramme;
window.reinitialiserFiltresListeEtudiants = reinitialiserFiltresListeEtudiants;
window.calculerTauxCompletion = calculerTauxCompletion;
window.toggleColonneListe = toggleColonneListe;
window.resetFiltresListe = resetFiltresListe;

})();
