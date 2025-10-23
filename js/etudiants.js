/* ===============================
   MODULE 03: LISTE DES ÉTUDIANTS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'affichage de la liste des étudiants
   dans la section Étudiants › Liste des individus.
   
   Contenu de ce module:
   - Affichage du tableau des étudiants
   - Calcul de l'assiduité (indice A) pour chaque étudiant
   - Filtrage par groupe, programme, statut
   - Recherche par nom
   - Navigation vers les portfolios
   =============================== */

/* ===============================
   📋 DÉPENDANCES DE CE MODULE
   
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

/* ===============================
   📋 CHARGEMENT DES OPTIONS DE FILTRES
   =============================== */

/**
 * Charge les options des filtres (groupes et programmes)
 */
function chargerOptionsFiltres() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

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
   📊 CALCUL DE L'ASSIDUITÉ
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
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.da === da && p.heures !== null && p.heures !== undefined) {
            datesSaisies.add(p.date);
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
 * Obtient la couleur d'affichage selon le taux d'assiduité
 * @param {number} taux - Taux d'assiduité en pourcentage
 * @returns {string} - Code couleur CSS
 */
function obtenirCouleurAssiduite(taux) {
    if (taux >= 85) {
        return 'var(--risque-minimal)'; // Vert
    } else if (taux >= 70) {
        return 'var(--risque-modere)'; // Jaune
    } else {
        return 'var(--risque-tres-eleve)'; // Rouge
    }
}

/**
 * Calcule le taux de complétion pour un étudiant
 * @param {string} da - Numéro de DA de l'étudiant
 * @returns {number} - Taux de complétion en pourcentage (0-100)
 */
/**
 * Calcule le taux de complétion pour un étudiant
 * VERSION CORRIGÉE - Cohérente avec le calcul d'assiduité
 * 
 * PRINCIPE :
 * - Comme l'assiduité se base sur les séances RÉELLEMENT SAISIES,
 * - La complétion se base sur les artefacts RÉELLEMENT ÉVALUÉS (au moins une évaluation existe)
 * 
 * FORMULE : (artefacts remis par l'étudiant) / (artefacts pour lesquels AU MOINS une évaluation existe) × 100
 * 
 * @param {string} da - Numéro de DA
 * @returns {number} - Taux de complétion en pourcentage (0-100)
 */
function calculerTauxCompletion(da) {
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');
    const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');

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

    // Calculer le pourcentage
    return Math.round((evaluationsEleve.length / nombreArtefactsDonnes) * 100);
}

/**
 * Obtient la couleur d'affichage selon le taux de complétion
 * @param {number} taux - Taux de complétion en pourcentage
 * @returns {string} - Code couleur CSS
 */
function obtenirCouleurCompletion(taux) {
    if (taux >= 85) {
        return 'var(--risque-minimal)'; // Vert
    } else if (taux >= 70) {
        return 'var(--risque-modere)'; // Jaune
    } else {
        return 'var(--risque-tres-eleve)'; // Rouge
    }
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

    // Recherche par nom/prénom
    const rechercheNom = document.getElementById('recherche-nom-liste');
    if (rechercheNom && rechercheNom.value.trim()) {
        const recherche = rechercheNom.value.trim().toLowerCase();
        resultats = resultats.filter(function (e) {
            const nomComplet = (e.nom + ' ' + e.prenom).toLowerCase();
            return nomComplet.includes(recherche);
        });
    }

    return resultats;
}

/* ===============================
   📊 AFFICHAGE DU TABLEAU
   =============================== */

/**
 * Affiche la liste des étudiants avec l'assiduité
 * FONCTION PRINCIPALE D'AFFICHAGE
 */

function afficherListeEtudiantsConsultation() {
    console.log('🔵 Affichage de la liste des étudiants...');

    const tbody = document.getElementById('tbody-tableau-bord-liste');           // ← CHANGÉ
    const compteur = document.getElementById('compteur-etudiants-liste');
    const messageVide = document.getElementById('message-aucun-etudiant');
    const tableContainer = document.getElementById('tableEtudiantsListe');

    if (!tbody) {
        console.log('❌ Élément #tbody-tableau-bord-liste introuvable');        // ← CHANGÉ (message d'erreur)
        return;
    }

    // Charger les étudiants
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    console.log('📋 Nombre total d\'étudiants:', etudiants.length);

    // Appliquer les filtres
    const etudiantsFiltres = filtrerEtudiants(etudiants);

    console.log('📋 Nombre d\'étudiants après filtrage:', etudiantsFiltres.length);

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

    // Trier par nom
    etudiantsFiltres.sort(function (a, b) {
        const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
        const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
        return nomA.localeCompare(nomB);
    });

    // Générer le HTML
    tbody.innerHTML = '';

    etudiantsFiltres.forEach(function (etudiant) {
        // Calcul de l'assiduité
        const assiduite = calculerAssiduitéGlobale(etudiant.da);
        const couleurAssiduite = obtenirCouleurAssiduite(assiduite);
        const completion = calculerTauxCompletion(etudiant.da);
        const couleurCompletion = obtenirCouleurCompletion(completion);
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
        const da = echapperHtml(etudiant.da || '');
        const groupe = echapperHtml(etudiant.groupe || '');
        const nom = echapperHtml(etudiant.nom || '');
        const prenom = echapperHtml(etudiant.prenom || '');
        const codeProgramme = echapperHtml(etudiant.programme || '');
        const nomProgramme = echapperHtml(obtenirNomProgramme(etudiant.programme) || '');

        // Construire le HTML ligne par ligne pour éviter les erreurs
        let html = '';
        html += '<td>' + da + '</td>';
        html += '<td style="text-align: center;"><strong>' + groupe + '</strong></td>';
        html += '<td>' + nom + '</td>';
        html += '<td>' + prenom + '</td>';
        html += '<td style="text-align: center;">' + codeProgramme + '</td>';
        html += '<td>' + nomProgramme + '</td>';
        html += '<td style="text-align: center;">' + (etudiant.sa === 'Oui' ? '✓' : '') + '</td>';
        html += '<td style="text-align: center;">' + (etudiant.caf === 'Oui' ? '✓' : '') + '</td>';
        html += '<td style="text-align: center;"><strong style="color: ' + couleurAssiduite + ';">' + assiduite + '%</strong></td>';
        html += '<td style="text-align: center;"><strong style="color: ' + couleurCompletion + ';">' + completion + '%</strong></td>';

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

        afficherSousSection('tableau-bord-profil');

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
   📌 EXPORTS (si nécessaire pour tests)
   =============================== */

// Les fonctions sont automatiquement disponibles globalement
// car non encapsulées dans un module ES6