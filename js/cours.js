/* ===============================
   MODULE 08: GESTION DES COURS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration technique des cours :
   code, nom, compétences, enseignant·e, session, horaires.
   
   Contenu de ce module:
   - Affichage du tableau des cours
   - Ajout/modification de cours
   - Duplication de cours
   - Activation d'un cours (cours actif)
   - Suppression de cours
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, coursEnEdition
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #tableauCoursContainer : Conteneur du tableau
   - #nombreCours : Nombre total de cours
   - #sessionActive : Session du cours actif
   - #resumeCours : Résumé du cours actif
   - #btnAjouterCours : Bouton d'ajout
   - #formulaireCours : Formulaire d'ajout/édition
   - #titreFormCours : Titre du formulaire
   - #btnTexteCours : Texte du bouton de sauvegarde
   - Champs du formulaire : voir structure ci-dessous
   
   LocalStorage utilisé:
   - 'listeCours' : Array des cours configurés
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Migre les cours existants pour ajouter le champ pratiqueId
 *
 * CONTEXTE:
 * Les cours créés avant l'implémentation de l'association pratique ↔ cours
 * n'ont pas de champ pratiqueId. Cette fonction ajoute automatiquement
 * la pratique par défaut (pan-maitrise) aux cours qui n'en ont pas.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Pour chaque cours sans pratiqueId, ajoute 'pan-maitrise'
 * 3. Sauvegarde les cours modifiés
 *
 * @returns {number} - Nombre de cours migrés
 */
function migrerCoursVersPratiques() {
    const cours = db.getSync('listeCours', []);
    let nbMigres = 0;

    cours.forEach(c => {
        if (!c.pratiqueId) {
            c.pratiqueId = 'pan-maitrise'; // Pratique par défaut
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('listeCours', cours);
        console.log(`[Migration cours] ✅ ${nbMigres} cours migré(s) avec pratique par défaut`);
    } else {
        console.log(`[Migration cours] Tous les cours ont déjà une pratique définie`);
    }

    return nbMigres;
}

/**
 * Initialise le module de gestion des cours
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge et affiche le tableau des cours
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleCours() {
    console.log('📚 Initialisation du module Cours');

    // Vérifier que nous sommes dans la bonne section
    const tableauContainer = document.getElementById('tableauCoursContainer');
    if (!tableauContainer) {
        console.log('   ⚠️  Section cours non active, initialisation reportée');
        return;
    }

    // Migrer les cours existants (ajouter pratiqueId si manquant)
    migrerCoursVersPratiques();

    // Afficher le tableau des cours
    afficherTableauCours();

    console.log('   ✅ Module Cours initialisé');
}

/* ===============================
   AFFICHAGE DU TABLEAU
   =============================== */

/**
 * Affiche le tableau des cours configurés
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les cours depuis localStorage
 * 2. Si vide: affiche message
 * 3. Sinon: génère le tableau HTML
 * 4. Met à jour les statistiques
 * 
 * UTILISÉ PAR:
 * - initialiserModuleCours()
 * - sauvegarderCours()
 * - activerCours()
 * - dupliquerCours()
 * - supprimerCours()
 *
 * STRUCTURE TABLEAU:
 * Code (100px) | Nom | Enseignant·e | Session (80px) | Actif (60px) | Actions (280px)
 * 
 * ACTIONS DISPONIBLES:
 * - modifier : Ouvre le formulaire d'édition
 * - dupliquer : Crée une copie
 * - supprimer : Supprime après confirmation
 * 
 * STATISTIQUES MISES À JOUR:
 * - #nombreCours : Total de configurations
 * - #sessionActive : Session du cours actif
 * - #resumeCours : Code + Nom du cours actif
 */
function afficherTableauCours() {
    const cours = db.getSync('listeCours', []);
    const container = document.getElementById('tableauCoursContainer');
    
    if (!container) return;
    
    if (cours.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-style: italic;">Aucun cours configuré.</p>';
        document.getElementById('nombreCours').textContent = '0';
        document.getElementById('resumeCours').textContent = 'Aucune configuration de cours';
        return;
    }
    
    let html = `
    <table class="tableau">
        <thead>
            <tr>
                <th style="width: 100px;">Code</th>
                <th>Nom du cours</th>
                <th>Enseignant·e</th>
                <th style="width: 80px;">Session</th>
                <th style="width: 120px;">Pratique</th>
                <th style="width: 60px;">Actif</th>
                <th style="width: 280px;">Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

    cours.forEach(c => {
        const codeEchappe = echapperHtml(c.codeCours);
        const nomEchappe = echapperHtml(c.nomCours);
        const competenceEchappe = echapperHtml(c.competence || '');
        const prenomEchappe = echapperHtml(c.prenomEnseignant);
        const nomEnsEchappe = echapperHtml(c.nomEnseignant);
        const sessionEchappe = echapperHtml(c.session + c.annee);

        // Afficher le nom de la pratique
        let pratiqueNom = 'PAN-Maîtrise'; // Par défaut
        if (c.pratiqueId === 'sommative') {
            pratiqueNom = 'Sommative';
        } else if (c.pratiqueId === 'pan-maitrise') {
            pratiqueNom = 'PAN-Maîtrise';
        }

        html += `
        <tr>
            <td><strong>${codeEchappe}</strong></td>
            <td>
                ${nomEchappe}
                ${competenceEchappe ? '<br><small style="color: var(--bleu-leger);">' + competenceEchappe + '</small>' : ''}
            </td>
            <td>${prenomEchappe} ${nomEnsEchappe}</td>
            <td>${sessionEchappe}</td>
            <td>
                <span style="font-size: 0.85rem; color: var(--bleu-leger);">${pratiqueNom}</span>
            </td>
            <td style="text-align: center;">
                <input type="radio"
                       name="cours-actif"
                       ${c.actif ? 'checked' : ''}
                       onchange="activerCours('${c.id}')"
                       title="Définir comme cours actif">
            </td>
            <td>
                <div class="btn-groupe" style="gap: 5px;">
                    <button class="btn btn-modifier btn-sm"
                            onclick="modifierCours('${c.id}')"
                            title="Modifier"
                            style="padding: 5px 10px; font-size: 0.85rem;">
                        Modifier
                    </button>
                    <button class="btn btn-ajouter btn-sm"
                            onclick="dupliquerCours('${c.id}')"
                            title="Dupliquer"
                            style="padding: 5px 10px; font-size: 0.85rem;">
                        Dupliquer
                    </button>
                    <button class="btn btn-supprimer btn-sm"
                            onclick="supprimerCours('${c.id}')"
                            title="Supprimer"
                            style="padding: 5px 10px; font-size: 0.85rem;">
                        Supprimer
                    </button>
                </div>
            </td>
        </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;

    // Mettre à jour les statistiques (vérifier existence élément DOM)
    const elemNombreCours = document.getElementById('nombreCours');
    if (elemNombreCours) {
        elemNombreCours.textContent = cours.length;
    }

    // Trouver le cours actif
    const coursActif = cours.find(c => c.actif) || cours[0];
    if (coursActif) {
        const elemSessionActive = document.getElementById('sessionActive');
        const elemResumeCours = document.getElementById('resumeCours');

        if (elemSessionActive) {
            elemSessionActive.textContent = coursActif.session + coursActif.annee;
        }
        if (elemResumeCours) {
            elemResumeCours.textContent = `${coursActif.codeCours} - ${coursActif.nomCours}`;
        }
    }
}

/* ===============================
   FORMULAIRE D'AJOUT/ÉDITION
   =============================== */

/**
 * Charge les pratiques disponibles dans le sélecteur du formulaire
 *
 * FONCTIONNEMENT:
 * 1. Récupère toutes les pratiques intégrées disponibles
 * 2. Détermine quelle pratique est marquée comme "par défaut"
 * 3. Remplit le <select id="pratiqueCours">
 * 4. Présélectionne la pratique par défaut
 */
function chargerSelecteurPratiques() {
    const selectPratique = document.getElementById('pratiqueCours');
    if (!selectPratique) return;

    // Obtenir la pratique par défaut depuis le storage
    const pratiqueParDefaut = getPratiqueParDefaut ? getPratiqueParDefaut() : 'pan-maitrise';

    // Liste des pratiques intégrées (codées en dur pour Beta 91)
    const pratiquesIntegrees = [
        {
            id: 'pan-maitrise',
            nom: 'PAN-Maîtrise (IDME 4 niveaux)',
            description: 'Échelle IDME, critères SRPNF, N meilleurs artefacts'
        },
        {
            id: 'sommative',
            nom: 'Sommative traditionnelle',
            description: 'Moyenne pondérée de toutes les évaluations'
        }
    ];

    // Vider le sélecteur
    selectPratique.innerHTML = '';

    // Ajouter les options
    pratiquesIntegrees.forEach(pratique => {
        const option = document.createElement('option');
        option.value = pratique.id;
        option.textContent = pratique.nom;

        // Marquer la pratique par défaut
        if (pratique.id === pratiqueParDefaut) {
            option.textContent += ' [PAR DÉFAUT]';
            option.selected = true;
        }

        selectPratique.appendChild(option);
    });
}

/**
 * Affiche le formulaire d'ajout ou d'édition
 * 
 * FONCTIONNEMENT:
 * 1. Affiche le formulaire, masque le bouton d'ajout
 * 2. Si id fourni: mode édition (charge les données)
 * 3. Sinon: mode création (champs vides)
 * 4. Met à jour le titre et le bouton
 * 
 * PARAMÈTRES:
 * @param {string|null} id - ID du cours à éditer (null pour nouveau)
 * 
 * UTILISÉ PAR:
 * - Bouton «Ajouter un cours»
 * - modifierCours()
 * 
 * MODES:
 * - Ajout: coursEnEdition = null, titre = "Nouvelle configuration"
 * - Édition: coursEnEdition = id, titre = "Modifier la configuration"
 */
function afficherFormCours(id = null) {
    const formulaire = document.getElementById('formulaireCours');
    const btnAjouter = document.getElementById('btnAjouterCours');
    const titre = document.getElementById('titreFormCours');
    const btnTexte = document.getElementById('btnTexteCours');

    if (!formulaire) return;

    formulaire.style.display = 'block';
    if (btnAjouter) btnAjouter.style.display = 'none';

    // Charger les pratiques disponibles dans le sélecteur
    chargerSelecteurPratiques();
    
    if (id) {
        // Mode édition
        const cours = db.getSync('listeCours', []);
        const c = cours.find(cours => cours.id === id);
        
        if (c) {
            coursEnEdition = id;
            if (titre) titre.textContent = 'Modifier la configuration';
            if (btnTexte) btnTexte.textContent = 'Sauvegarder';
            
            // Remplir les champs
            document.getElementById('codeCours').value = c.codeCours || '';
            document.getElementById('nomCours').value = c.nomCours || '';
            document.getElementById('numeroCompetence').value = c.numeroCompetence || '';
            document.getElementById('competence').value = c.competence || '';
            document.getElementById('elementsCompetence').value = c.elementsCompetence || '';
            document.getElementById('prenomEnseignant').value = c.prenomEnseignant || '';
            document.getElementById('nomEnseignant').value = c.nomEnseignant || '';
            document.getElementById('departement').value = c.departement || '';
            document.getElementById('local').value = c.local || '';
            document.getElementById('session').value = c.session || 'H';
            document.getElementById('annee').value = c.annee || '2025';
            document.getElementById('heuresParSemaine').value = c.heuresParSemaine || '4';
            document.getElementById('formatHoraire').value = c.formatHoraire || '2x2';

            // Charger la pratique associée
            const selectPratique = document.getElementById('pratiqueCours');
            if (selectPratique && c.pratiqueId) {
                selectPratique.value = c.pratiqueId;
            }
        }
    } else {
        // Mode ajout - MAIS vérifier s'il y a déjà un cours (créé par Primo par ex)
        const cours = db.getSync('listeCours', []);
        const coursActif = cours.find(c => c.actif);

        if (coursActif && cours.length > 0) {
            // Pré-remplir avec le premier cours ou le cours actif
            const premierCours = coursActif || cours[0];
            document.getElementById('codeCours').value = premierCours.codeCours || '';
            document.getElementById('nomCours').value = premierCours.nomCours || '';
            document.getElementById('numeroCompetence').value = premierCours.numeroCompetence || '';
            document.getElementById('competence').value = premierCours.competence || '';
            document.getElementById('elementsCompetence').value = premierCours.elementsCompetence || '';
            document.getElementById('prenomEnseignant').value = premierCours.prenomEnseignant || '';
            document.getElementById('nomEnseignant').value = premierCours.nomEnseignant || '';
            document.getElementById('departement').value = premierCours.departement || '';
            document.getElementById('local').value = premierCours.local || '';
            document.getElementById('session').value = premierCours.session || 'H';
            document.getElementById('annee').value = premierCours.annee || '2025';
            document.getElementById('heuresParSemaine').value = premierCours.heuresParSemaine || '4';
            document.getElementById('formatHoraire').value = premierCours.formatHoraire || '2x2';

            const selectPratique = document.getElementById('pratiqueCours');
            if (selectPratique && premierCours.pratiqueId) {
                selectPratique.value = premierCours.pratiqueId;
            }

            if (titre) titre.textContent = 'Configuration du cours';
            coursEnEdition = premierCours.id; // Permettre la modification
        } else {
            // Vraiment aucun cours - formulaire vide
            coursEnEdition = null;
            if (titre) titre.textContent = 'Nouvelle configuration de cours';
            if (btnTexte) btnTexte.textContent = 'Ajouter';

            // Réinitialiser les champs
            document.getElementById('codeCours').value = '';
            document.getElementById('nomCours').value = '';
            document.getElementById('numeroCompetence').value = '';
            document.getElementById('competence').value = '';
            document.getElementById('elementsCompetence').value = '';
            document.getElementById('prenomEnseignant').value = '';
            document.getElementById('nomEnseignant').value = '';
            document.getElementById('departement').value = '';
            document.getElementById('local').value = '';
            document.getElementById('session').value = 'H';
            document.getElementById('annee').value = new Date().getFullYear().toString();
            document.getElementById('heuresParSemaine').value = '4';
            document.getElementById('formatHoraire').value = '2x2';
        }
    }
}

/**
 * Annule le formulaire d'ajout/édition
 * Masque le formulaire et réaffiche le bouton d'ajout
 * 
 * UTILISÉ PAR:
 * - Bouton «Annuler» dans le formulaire
 */
function annulerFormCours() {
    const formulaire = document.getElementById('formulaireCours');
    const btnAjouter = document.getElementById('btnAjouterCours');
    
    if (formulaire) formulaire.style.display = 'none';
    if (btnAjouter) btnAjouter.style.display = 'inline-block';
    
    coursEnEdition = null;
}

/**
 * Sauvegarde un cours (ajout ou modification)
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les valeurs des champs du formulaire
 * 2. Crée l'objet cours
 * 3. Si coursEnEdition: met à jour le cours existant
 * 4. Sinon: ajoute un nouveau cours
 * 5. Sauvegarde dans localStorage
 * 6. Rafraîchit l'affichage
 * 7. Ferme le formulaire
 * 
 * UTILISÉ PAR:
 * - Bouton «Ajouter» / «Sauvegarder» du formulaire
 * 
 * STRUCTURE COURS:
 * {
 *   id: string,
 *   codeCours: string,
 *   nomCours: string,
 *   numeroCompetence: string,
 *   competence: string,
 *   elementsCompetence: string,
 *   prenomEnseignant: string,
 *   nomEnseignant: string,
 *   departement: string,
 *   local: string,
 *   session: string (H/A),
 *   annee: string,
 *   heuresParSemaine: string,
 *   formatHoraire: string,
 *   verrouille: boolean,
 *   actif: boolean,
 *   dateEnregistrement: string ISO
 * }
 * 
 * VALIDATION:
 * - Aucune validation stricte (tous les champs optionnels)
 * - L'utilisateur peut laisser des champs vides
 */
function sauvegarderCours() {
    let cours = db.getSync('listeCours', []);
    
    // Récupérer la pratique sélectionnée (ou pratique par défaut si non spécifiée)
    const selectPratique = document.getElementById('pratiqueCours');
    const pratiqueId = selectPratique ? selectPratique.value : null;

    const nouveauCours = {
        id: coursEnEdition || 'COURS' + Date.now(),
        codeCours: document.getElementById('codeCours').value,
        nomCours: document.getElementById('nomCours').value,
        numeroCompetence: document.getElementById('numeroCompetence').value,
        competence: document.getElementById('competence').value,
        elementsCompetence: document.getElementById('elementsCompetence').value,
        prenomEnseignant: document.getElementById('prenomEnseignant').value,
        nomEnseignant: document.getElementById('nomEnseignant').value,
        departement: document.getElementById('departement').value,
        local: document.getElementById('local').value,
        session: document.getElementById('session').value,
        annee: document.getElementById('annee').value,
        heuresParSemaine: document.getElementById('heuresParSemaine').value,
        formatHoraire: document.getElementById('formatHoraire').value,
        pratiqueId: pratiqueId, // ✅ NOUVEAU : Association à une pratique
        verrouille: false,
        actif: false,
        dateEnregistrement: new Date().toISOString()
    };
    
    if (coursEnEdition) {
        // Modification - conserver l'état de verrouillage, actif et pratiqueId si non modifié
        const index = cours.findIndex(c => c.id === coursEnEdition);
        if (index !== -1) {
            nouveauCours.verrouille = cours[index].verrouille;
            nouveauCours.actif = cours[index].actif;
            // Si aucune pratique sélectionnée, conserver l'ancienne
            if (!nouveauCours.pratiqueId && cours[index].pratiqueId) {
                nouveauCours.pratiqueId = cours[index].pratiqueId;
            }
            cours[index] = nouveauCours;
        }
    } else {
        // Ajout - si c'est le premier cours, le rendre actif par défaut
        if (cours.length === 0) {
            nouveauCours.actif = true;
        }
        cours.push(nouveauCours);
    }
    
    db.setSync('listeCours', cours);
    
    afficherTableauCours();
    annulerFormCours();
    
    // Notification
    if (coursEnEdition) {
        afficherNotificationSucces('Configuration du cours modifiée avec succès !');
    } else {
        afficherNotificationSucces('Configuration du cours ajoutée avec succès !');
    }
}

/* ===============================
   MODIFICATION
   =============================== */

/**
 * Ouvre le formulaire d'édition pour un cours
 * 
 * PARAMÈTRES:
 * @param {string} id - ID du cours à modifier
 * 
 * UTILISÉ PAR:
 * - Bouton «Modifier» dans le tableau
 */
function modifierCours(id) {
    afficherFormCours(id);
}

/* ===============================
   🔄 DUPLICATION
   =============================== */

/**
 * Duplique un cours existant
 * 
 * FONCTIONNEMENT:
 * 1. Trouve le cours original
 * 2. Crée une copie complète
 * 3. Change l'ID et ajoute «(copie)» au code
 * 4. Déverrouille et désactive la copie
 * 5. Ajoute aux cours
 * 6. Sauvegarde et rafraîchit
 * 
 * PARAMÈTRES:
 * @param {string} id - ID du cours à dupliquer
 * 
 * UTILISÉ PAR:
 * - Bouton «Dupliquer» dans le tableau
 * 
 * RETOUR:
 * - Notification de succès
 */
function dupliquerCours(id) {
    const cours = db.getSync('listeCours', []);
    const coursOriginal = cours.find(c => c.id === id);
    
    if (coursOriginal) {
        const nouveauCours = {
            ...coursOriginal,
            id: 'COURS' + Date.now(),
            codeCours: coursOriginal.codeCours + ' (copie)',
            dateEnregistrement: new Date().toISOString(),
            actif: false,
            verrouille: false
        };
        
        cours.push(nouveauCours);
        db.setSync('listeCours', cours);
        afficherTableauCours();
        afficherNotificationSucces('Cours dupliqué avec succès !');
    }
}

/* ===============================
   ⭐ ACTIVATION DU COURS
   =============================== */

/**
 * Active un cours comme cours principal
 * Un seul cours peut être actif à la fois
 * 
 * FONCTIONNEMENT:
 * 1. Désactive tous les cours
 * 2. Active le cours sélectionné
 * 3. Sauvegarde
 * 4. Rafraîchit l'affichage
 * 5. Met à jour les statistiques
 * 
 * PARAMÈTRES:
 * @param {string} id - ID du cours à activer
 * 
 * UTILISÉ PAR:
 * - Radio button dans le tableau
 * 
 * USAGE:
 * - Le cours actif est celui utilisé par défaut dans l'application
 * - Affiché dans les statistiques en haut
 * - Utilisé comme référence pour les autres modules
 * 
 * RETOUR:
 * - Notification de succès
 */
function activerCours(id) {
    let cours = db.getSync('listeCours', []);
    
    // Désactiver tous les cours
    cours.forEach(c => c.actif = false);
    
    // Activer le cours sélectionné
    const index = cours.findIndex(c => c.id === id);
    if (index !== -1) {
        cours[index].actif = true;
    }
    
    db.setSync('listeCours', cours);
    afficherTableauCours();
    afficherNotificationSucces('Cours activé !');
}

/* ===============================
   SUPPRESSION
   =============================== */

/**
 * Supprime un cours avec confirmation
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que le cours n'est pas verrouillé
 * 2. Demande confirmation
 * 3. Retire du localStorage
 * 4. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {string} id - ID du cours à supprimer
 * 
 * UTILISÉ PAR:
 * - Bouton «Supprimer» dans le tableau
 * 
 * SÉCURITÉ:
 * - Bloquée si verrouillé (alerte)
 * - Confirmation obligatoire
 * 
 * RETOUR:
 * - Notification de succès
 */
function supprimerCours(id) {
    const cours = db.getSync('listeCours', []);
    const coursASupprimer = cours.find(c => c.id === id);
    
    if (coursASupprimer && coursASupprimer.verrouille) {
        alert('Déverrouillez ce cours (🔓) avant de le supprimer');
        return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cours ${coursASupprimer?.codeCours} ?`)) {
        const coursFiltre = cours.filter(c => c.id !== id);
        db.setSync('listeCours', coursFiltre);
        afficherTableauCours();
        afficherNotificationSucces('Cours supprimé');
    }
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 * 
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec animation
 * 3. Supprime après 3 secondes
 * 
 * PARAMÈTRES:
 * @param {string} message - Message à afficher
 * 
 * UTILISÉ PAR:
 * - Toutes les fonctions de sauvegarde/modification
 * 
 * STYLE:
 * - Position fixe en haut à droite
 * - Fond vert (succès)
 * - Animation slideIn
 * - Disparaît après 3s
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
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 08-cours.js
 * 3. Appeler initialiserModuleCours() depuis 99-main.js
 * 
 * DÉPENDANCES:
 * - echapperHtml() depuis 01-config.js
 * - coursEnEdition depuis 01-config.js
 * - Classes CSS depuis styles.css
 * 
 * LOCALSTORAGE:
 * - 'listeCours' : Array des cours configurés
 * 
 * MODULES DÉPENDANTS:
 * - 09-calendrier.js : Utilisera le cours actif
 * - 10-horaire.js : Utilisera le format horaire du cours actif
 * - Autres modules référençant le cours actif
 * 
 * STRUCTURE DONNÉES:
 * Cours = {
 *   id: string (COURS + timestamp),
 *   codeCours: string,
 *   nomCours: string,
 *   numeroCompetence: string,
 *   competence: string,
 *   elementsCompetence: string,
 *   prenomEnseignant: string,
 *   nomEnseignant: string,
 *   departement: string,
 *   local: string,
 *   session: string,
 *   annee: string,
 *   heuresParSemaine: string,
 *   formatHoraire: string,
 *   verrouille: boolean,
 *   actif: boolean,
 *   dateEnregistrement: string ISO
 * }
 * 
 * ÉVÉNEMENTS:
 * Tous les événements sont gérés via attributs HTML (onchange, onclick)
 * Pas d'addEventListener requis dans 99-main.js
 * 
 * COURS ACTIF:
 * - Un seul cours peut être actif à la fois
 * - Premier cours ajouté = actif par défaut
 * - Radio button pour changer le cours actif
 * - Affiché dans les statistiques
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */

/* ===============================
   EXPORTS - Rendre les fonctions accessibles globalement
   =============================== */

window.afficherFormCours = afficherFormCours;
window.sauvegarderCours = sauvegarderCours;
window.annulerFormCours = annulerFormCours;
window.modifierCours = modifierCours;
window.dupliquerCours = dupliquerCours;
window.supprimerCours = supprimerCours;
window.activerCours = activerCours;
window.afficherTableauCours = afficherTableauCours;
window.initialiserModuleCours = initialiserModuleCours;