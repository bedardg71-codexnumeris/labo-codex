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
   - Cartes de statistiques (Total, Risques faibles, RàI 1/2/3)
   - Filtres avancés (Risque, RàI, Pattern)
   - Colonnes supplémentaires (Mobilisation M, Risque, Pattern)
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
   - #filtre-statut-liste : Select de filtrage par statut
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
 * Calcule le niveau de risque à l'échec (RàI) pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - { niveau: number (1|2|3), label: string, couleurFond: string, couleurTexte: string }
 */
function calculerNiveauRaI(da) {
    // Utiliser la fonction du profil étudiant si disponible
    if (typeof determinerCibleIntervention === 'function') {
        const cibleInfo = determinerCibleIntervention(da);

        // Convertir le niveau en badge RàI avec les bonnes couleurs
        let label, couleurFond, couleurTexte;

        if (cibleInfo.niveau === 1) {
            label = 'RàI 1';
            couleurFond = '#e8f5e9'; // Vert pâle
            couleurTexte = '#2e7d32'; // Vert foncé
        } else if (cibleInfo.niveau === 2) {
            label = 'RàI 2';
            couleurFond = '#fff9e6'; // Jaune pâle
            couleurTexte = '#f57c00'; // Orange/jaune foncé
        } else { // niveau 3
            label = 'RàI 3';
            couleurFond = '#fff3e0'; // Orange pâle
            couleurTexte = '#e65100'; // Orange foncé
        }

        return {
            niveau: cibleInfo.niveau,
            label: label,
            couleurFond: couleurFond,
            couleurTexte: couleurTexte
        };
    }

    // Fallback : calculer simplement avec R = 1 - (A × C × P)
    const assiduite = calculerAssiduitéGlobale(da) / 100;
    const completion = calculerTauxCompletion(da) / 100;
    const performance = calculerPerformance(da) / 100;

    const risque = 1 - (assiduite * completion * performance);
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

    // Filtrer par statut (actifs seulement par défaut)
    const filtreStatut = document.getElementById('filtre-statut-liste');
    if (filtreStatut && filtreStatut.value !== 'tous') {
        resultats = resultats.filter(function (e) {
            return e.statut === 'actif' || !e.statut;
        });
    }

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

    // NOUVEAU: Filtre par niveau de risque
    const filtreRisque = document.getElementById('filtre-risque-liste');
    if (filtreRisque && filtreRisque.value) {
        const niveauRisque = filtreRisque.value;
        resultats = resultats.filter(function (e) {
            const indices = calculerTousLesIndices(e.da);
            const risque = indices.R;

            switch(niveauRisque) {
                case 'minimal': return risque <= 0.20;
                case 'faible': return risque > 0.20 && risque <= 0.30;
                case 'modere': return risque > 0.30 && risque <= 0.40;
                case 'eleve': return risque > 0.40 && risque <= 0.50;
                case 'tres-eleve': return risque > 0.50 && risque <= 0.70;
                case 'critique': return risque > 0.70;
                default: return true;
            }
        });
    }

    // NOUVEAU: Filtre par niveau RàI
    const filtreRai = document.getElementById('filtre-rai-liste');
    if (filtreRai && filtreRai.value) {
        const niveauRai = parseInt(filtreRai.value);
        resultats = resultats.filter(function (e) {
            const cible = determinerCibleIntervention(e.da);
            return cible.niveau === niveauRai;
        });
    }

    // NOUVEAU: Filtre par pattern d'apprentissage
    const filtrePattern = document.getElementById('filtre-pattern-liste');
    if (filtrePattern && filtrePattern.value) {
        const patternFiltre = filtrePattern.value;
        resultats = resultats.filter(function (e) {
            const cible = determinerCibleIntervention(e.da);
            const pattern = cible.pattern.toLowerCase().replace(/\s+/g, '-');
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
 * Affiche la liste des étudiants avec l'assiduité
 * FONCTION PRINCIPALE D'AFFICHAGE
 */

function afficherListeEtudiantsConsultation() {
    console.log('🔵 Affichage de la liste des étudiants...');

    // 🔄 FORCER le recalcul des indices C et P avant affichage
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

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
        const cible = determinerCibleIntervention(e.da);
        return {
            ...e,
            indicesCalcules: indices,
            cibleCalculee: cible
        };
    });

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
            case 'mobilisation':
                valeurA = a.indicesCalcules.M;
                valeurB = b.indicesCalcules.M;
                break;
            case 'risque':
                valeurA = a.indicesCalcules.R;
                valeurB = b.indicesCalcules.R;
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

    // Récupérer les options de surlignage
    const surlignerCritique = document.getElementById('surligner-critique');
    const surlignerTresEleve = document.getElementById('surligner-tres-eleve');
    const surlignerNiveau3 = document.getElementById('surligner-niveau3');
    const surlignerNiveau2 = document.getElementById('surligner-niveau2');
    const surlignerBlocage = document.getElementById('surligner-blocage');

    etudiantsFiltres.forEach(function (etudiant) {
        // Utiliser les indices précalculés
        const indices = etudiant.indicesCalcules;
        const cible = etudiant.cibleCalculee;

        // Mobilisation (déjà calculée dans indices.M en 0-1)
        const mobilisation = Math.round(indices.M * 100); // Convertir en pourcentage
        const couleurMobilisation = obtenirCouleurMobilisation(indices.M);

        // Génération des badges
        const badgeRisque = genererBadgeRisque(indices.R);
        const badgePattern = genererBadgePattern(cible.pattern);
        const badgeRai = genererBadgeRaI(cible.niveau);

        const tr = document.createElement('tr');

        // Déterminer le surlignage à appliquer (priorité: plus critique en premier)
        let bgColor = '';
        let borderColor = '';
        let bgHover = '';

        // Priorité 1: Risque critique (>70%)
        if (surlignerCritique && surlignerCritique.checked && indices.R > 0.70) {
            bgColor = '#fff5f5';
            borderColor = '#dc2626';
            bgHover = '#fee2e2';
        }
        // Priorité 2: Risque très élevé (60-70%)
        else if (surlignerTresEleve && surlignerTresEleve.checked && indices.R >= 0.60 && indices.R <= 0.70) {
            bgColor = '#fff7ed';
            borderColor = '#ea580c';
            bgHover = '#ffedd5';
        }
        // Priorité 3: Blocage/Résistance
        else if (surlignerBlocage && surlignerBlocage.checked && (cible.pattern === 'Blocage' || cible.pattern === 'Résistance')) {
            bgColor = '#fef2f2';
            borderColor = '#f87171';
            bgHover = '#fee2e2';
        }
        // Priorité 4: Niveau 3 RàI
        else if (surlignerNiveau3 && surlignerNiveau3.checked && cible.niveau === 3) {
            bgColor = '#eff6ff';
            borderColor = '#2563eb';
            bgHover = '#dbeafe';
        }
        // Priorité 5: Niveau 2 RàI
        else if (surlignerNiveau2 && surlignerNiveau2.checked && cible.niveau === 2) {
            bgColor = '#f0f9ff';
            borderColor = '#0284c7';
            bgHover = '#e0f2fe';
        }

        // Appliquer le surlignage
        if (bgColor) {
            tr.style.backgroundColor = bgColor;
            tr.style.borderLeft = '4px solid ' + borderColor;
        }

        // Rendre la ligne cliquable
        tr.style.cursor = 'pointer';
        tr.onclick = function () {
            afficherPortfolio(etudiant.da);
        };

        // Effet de survol
        const bgOriginal = tr.style.backgroundColor || '';
        tr.onmouseenter = function () {
            if (bgHover) {
                this.style.backgroundColor = bgHover;
            } else {
                this.style.backgroundColor = 'var(--bleu-tres-pale)';
            }
        };
        tr.onmouseleave = function () {
            this.style.backgroundColor = bgOriginal;
        };

        // Échapper les valeurs pour sécurité
        // IMPORTANT: Utiliser daAffichage pour l'affichage, mais garder da pour les calculs
        const daAfficher = etudiant.daAffichage || etudiant.da; // Utiliser daAffichage si disponible
        const da = echapperHtml(daAfficher || '');
        const groupe = echapperHtml(etudiant.groupe || '');
        const nom = echapperHtml(etudiant.nom || '');
        const prenom = echapperHtml(etudiant.prenom || '');

        // NOUVEAU: Construire le HTML avec toutes les colonnes
        let html = '';
        html += '<td style="text-align: center; color: #64748b; font-weight: 600;">' + etudiant.num + '</td>';
        html += '<td>' + da + '</td>';
        html += '<td style="text-align: center;"><strong>' + groupe + '</strong></td>';
        html += '<td>' + nom + '</td>';
        html += '<td>' + prenom + '</td>';
        html += '<td style="text-align: center;">' + (etudiant.sa === 'Oui' ? '✓' : '') + '</td>';

        // Colonnes A-C-P avec couleurs
        const couleurA = obtenirCouleurAssiduite(Math.round(indices.A));
        const couleurC = obtenirCouleurCompletion(Math.round(indices.C));
        const couleurP = obtenirCouleurPerformance(Math.round(indices.P));

        html += '<td style="text-align: center;"><strong style="color: ' + couleurA + ';">' + Math.round(indices.A) + '%</strong></td>';
        html += '<td style="text-align: center;"><strong style="color: ' + couleurC + ';">' + Math.round(indices.C) + '%</strong></td>';
        html += '<td style="text-align: center;"><strong style="color: ' + couleurP + ';">' + Math.round(indices.P) + '%</strong></td>';

        // NOUVEAU: Colonne Mobilisation (M = A × C)
        html += '<td style="text-align: center;"><strong style="color: ' + couleurMobilisation + ';">' + mobilisation + '%</strong></td>';

        // NOUVEAU: Colonne Risque avec badge
        html += '<td style="text-align: center;"><span class="' + badgeRisque.classe + '">' + badgeRisque.label + '</span></td>';

        // NOUVEAU: Colonne Pattern avec badge
        html += '<td><span class="' + badgePattern.classe + '">' + badgePattern.label + '</span></td>';

        // NOUVEAU: Colonne RàI avec badge amélioré
        html += '<td style="text-align: center;"><span class="' + badgeRai.classe + '">' + badgeRai.label + '</span></td>';

        // NOUVEAU (Beta 85): Colonne Interventions
        const nbInterventions = (typeof obtenirInterventionsEtudiant === 'function')
            ? obtenirInterventionsEtudiant(etudiant.da).length
            : 0;

        if (nbInterventions > 0) {
            html += '<td style="text-align: center;"><span style="color: var(--bleu-principal); font-weight: 600;">📋 ' + nbInterventions + '</span></td>';
        } else {
            html += '<td style="text-align: center;"><span style="color: #ccc;">—</span></td>';
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
    const filtreStatut = document.getElementById('filtre-statut-liste');
    const rechercheNom = document.getElementById('recherche-nom-liste');

    if (filtreGroupe) {
        filtreGroupe.value = '';
    }
    if (filtreProgramme) {
        filtreProgramme.value = '';
    }
    if (filtreStatut) {
        filtreStatut.value = 'actifs';
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
    if (etudiants.length === 0) {
        // Mettre à jour seulement les éléments qui existent
        const elemStatTotal = document.getElementById('stat-total-etudiants');
        if (elemStatTotal) elemStatTotal.textContent = '0';

        document.getElementById('stat-risques-faibles').textContent = '—';
        document.getElementById('stat-risques-faibles-pct').textContent = '—';
        document.getElementById('stat-rai-1').textContent = '—';
        document.getElementById('stat-rai-1-pct').textContent = '—';
        document.getElementById('stat-rai-2').textContent = '—';
        document.getElementById('stat-rai-2-pct').textContent = '—';
        document.getElementById('stat-rai-3').textContent = '—';
        document.getElementById('stat-rai-3-pct').textContent = '—';
        return;
    }

    const total = etudiants.length;

    // Compter les risques faibles (≤ 30%)
    let risquesFaibles = 0;
    let rai1 = 0, rai2 = 0, rai3 = 0;

    etudiants.forEach(e => {
        const indices = calculerTousLesIndices(e.da);
        const risque = indices.R;
        const cible = determinerCibleIntervention(e.da);

        if (risque <= 0.30) risquesFaibles++;

        if (cible.niveau === 1) rai1++;
        else if (cible.niveau === 2) rai2++;
        else if (cible.niveau === 3) rai3++;
    });

    // Mettre à jour les cartes (seulement si l'élément existe)
    const elemStatTotal = document.getElementById('stat-total-etudiants');
    if (elemStatTotal) elemStatTotal.textContent = total;

    document.getElementById('stat-risques-faibles').textContent = risquesFaibles;
    document.getElementById('stat-risques-faibles-pct').textContent = `(${Math.round(risquesFaibles/total*100)}%)`;
    document.getElementById('stat-rai-1').textContent = rai1;
    document.getElementById('stat-rai-1-pct').textContent = `(${Math.round(rai1/total*100)}%)`;
    document.getElementById('stat-rai-2').textContent = rai2;
    document.getElementById('stat-rai-2-pct').textContent = `(${Math.round(rai2/total*100)}%)`;
    document.getElementById('stat-rai-3').textContent = rai3;
    document.getElementById('stat-rai-3-pct').textContent = `(${Math.round(rai3/total*100)}%)`;
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
 * Génère un badge de risque avec classe CSS appropriée
 * @param {number} risque - Valeur du risque (0-1)
 * @returns {Object} - {label, classe}
 */
function genererBadgeRisque(risque) {
    if (risque <= 0.20) {
        return { label: 'Minimal', classe: 'badge-sys badge-risque-minimal' };
    } else if (risque <= 0.30) {
        return { label: 'Faible', classe: 'badge-sys badge-risque-faible' };
    } else if (risque <= 0.40) {
        return { label: 'Modéré', classe: 'badge-sys badge-risque-modere' };
    } else if (risque <= 0.50) {
        return { label: 'Élevé', classe: 'badge-sys badge-risque-eleve' };
    } else if (risque <= 0.70) {
        return { label: 'Très élevé', classe: 'badge-sys badge-risque-tres-eleve' };
    } else {
        return { label: 'Critique', classe: 'badge-sys badge-risque-critique' };
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