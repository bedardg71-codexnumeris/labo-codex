/* ===============================
   MODULE 10: GESTION DE L'HORAIRE DES COURS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration de l'horaire hebdomadaire :
   format des séances (2×2h ou 1×4h), jours, heures et locaux.
   
   Contenu de ce module:
   - Sélection du format horaire
   - Configuration des séances (jour, heures, local)
   - Affichage des séances configurées
   - Modification et suppression de séances
   - Sauvegarde dans localStorage
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - input[name="formatHoraire"] : Radio buttons pour le format
   - #seancesContainer : Conteneur des séances existantes
   - #formAjoutSeance : Formulaire d'ajout
   - #seancesFormContainer : Conteneur du formulaire dynamique
   - #btnConfirmerSeances : Bouton de confirmation
   - Champs du formulaire : voir afficherFormulaireSeances()
   
   LocalStorage utilisé:
   - 'formatHoraire' : Format sélectionné ('2x2' ou '1x4')
   - 'seancesHoraire' : Array des séances configurées
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module de gestion de l'horaire
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Restaure le format horaire sauvegardé
 * 3. Attache les événements aux radio buttons
 * 4. Affiche les séances existantes
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleHoraire() {
    console.log('🕐 Initialisation du module Horaire');

    // Vérifier que nous sommes dans la bonne section
    const radios = document.querySelectorAll('input[name="formatHoraire"]');
    if (radios.length === 0) {
        console.log('   ⚠️  Section horaire non active, initialisation reportée');
        return;
    }

    // Restaurer le format sauvegardé
    const formatSauvegarde = localStorage.getItem('formatHoraire') || '';
    if (formatSauvegarde) {
        const radioToCheck = document.querySelector(`input[name="formatHoraire"][value="${formatSauvegarde}"]`);
        if (radioToCheck) radioToCheck.checked = true;
    }

    // Attacher les événements
    radios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                localStorage.setItem('formatHoraire', this.value);
                mettreAJourInterfaceHoraire();
            }
        });
    });

    // Afficher les séances existantes
    afficherSeancesExistantes();

    // Mettre à jour l'interface selon le format sélectionné
    mettreAJourInterfaceHoraire();

    // Générer les séances complètes du trimestre
    genererSeancesCompletes();

    console.log('   ✅ Module Horaire initialisé');
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

/**
 * Met à jour l'interface selon le format horaire sélectionné
 * Active/désactive les éléments en fonction du contexte
 * 
 * FONCTIONNEMENT:
 * - Si format sélectionné: active le bouton de configuration
 * - Sinon: désactive le bouton et affiche un message
 */
function mettreAJourInterfaceHoraire() {
    const formatChecked = document.querySelector('input[name="formatHoraire"]:checked');
    const btnConfigurer = document.querySelector('.btn-ajouter[onclick="afficherFormulaireSeances()"]');
    const messageAucunFormat = document.getElementById('messageAucunFormat');

    if (formatChecked) {
        // Format sélectionné: activer le bouton et cacher le message
        if (btnConfigurer) {
            btnConfigurer.disabled = false;
            btnConfigurer.style.opacity = '1';
            btnConfigurer.style.cursor = 'pointer';
        }
        if (messageAucunFormat) {
            messageAucunFormat.style.display = 'none';
        }
    } else {
        // Aucun format: désactiver le bouton et afficher le message
        if (btnConfigurer) {
            btnConfigurer.disabled = true;
            btnConfigurer.style.opacity = '0.5';
            btnConfigurer.style.cursor = 'not-allowed';
        }
        if (messageAucunFormat) {
            messageAucunFormat.style.display = 'block';
        }
    }
}

/**
 * Génère les options pour le select d'heure de début
 * De 8h00 à 22h00
 * 
 * RETOUR:
 * - HTML string avec les options
 */
function genererOptionsHeureDebut() {
    let options = '<option value="">Choisir...</option>';
    for (let h = 8; h <= 22; h++) {
        const heure = h < 10 ? `0${h}:00` : `${h}:00`;
        const affichage = `${h}h00`;
        options += `<option value="${heure}">${affichage}</option>`;
    }
    return options;
}

/**
 * Génère les options pour le select d'heure de fin
 * De 8h50 à 22h50
 * 
 * RETOUR:
 * - HTML string avec les options
 */
function genererOptionsHeureFin() {
    let options = '<option value="">Choisir...</option>';
    for (let h = 8; h <= 22; h++) {
        const heure = h < 10 ? `0${h}:50` : `${h}:50`;
        const affichage = `${h}h50`;
        options += `<option value="${heure}">${affichage}</option>`;
    }
    return options;
}

/* ===============================
   📅 GÉNÉRATION DES SÉANCES COMPLÈTES
   =============================== */

/**
 * Génère toutes les séances du trimestre avec leurs dates
 * SOURCE UNIQUE pour calendrier-saisie.js et calcul d'assiduité
 * 
 * FONCTIONNEMENT:
 * 1. Lit seancesHoraire (séances hebdomadaires configurées)
 * 2. Lit calendrierComplet (tous les jours du trimestre)
 * 3. Pour chaque jour de cours, crée les séances correspondantes
 * 4. Stocke dans localStorage.seancesCompletes
 * 
 * FORMAT DE SORTIE:
 * {
 *   "2025-08-25": [
 *     {
 *       id: "SEANCE-2025-08-25-A",
 *       seanceHoraireId: 123456,
 *       nom: "A",
 *       date: "2025-08-25",
 *       jour: "Lundi",
 *       debut: "13:00",
 *       fin: "14:50",
 *       local: "1709",
 *       numeroSemaine: 1
 *     }
 *   ],
 *   ...
 * }
 * 
 * RETOUR:
 * - Object avec toutes les séances datées
 */
function genererSeancesCompletes() {
    console.log('📚 Génération des séances complètes du trimestre...');

    // Lire les séances hebdomadaires configurées
    const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

    if (seancesHoraire.length === 0) {
        console.log('   ⚠️  Aucune séance hebdomadaire configurée');
        localStorage.setItem('seancesCompletes', JSON.stringify({}));
        return {};
    }

    // Lire le calendrier complet (source unique)
    const calendrierComplet = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');

    if (Object.keys(calendrierComplet).length === 0) {
        console.warn('   ⚠️  Calendrier complet non disponible');
        localStorage.setItem('seancesCompletes', JSON.stringify({}));
        return {};
    }

    // Créer un index des séances par jour de semaine
    const seancesParJour = {};
    seancesHoraire.forEach(seance => {
        if (!seancesParJour[seance.jour]) {
            seancesParJour[seance.jour] = [];
        }
        seancesParJour[seance.jour].push(seance);
    });

    // Générer toutes les séances pour chaque jour de cours
    const seancesCompletes = {};
    let compteurSeances = 0;

    Object.entries(calendrierComplet).forEach(([dateStr, infosJour]) => {
        // Ne créer des séances QUE pour les jours de cours ou reprises
        if (infosJour.statut !== 'cours' && infosJour.statut !== 'reprise') {
            return;
        }

        // Pour les reprises, utiliser le jour remplacé si disponible
        let jourPourSeances = infosJour.jourSemaine;
        if (infosJour.statut === 'reprise' && infosJour.jourRemplace) {
            jourPourSeances = infosJour.jourRemplace;
        }

        // Vérifier si ce jour a des séances configurées
        const seancesDuJour = seancesParJour[jourPourSeances] || [];

        if (seancesDuJour.length > 0) {
            seancesCompletes[dateStr] = seancesDuJour.map(seance => {
                compteurSeances++;
                return {
                    id: `SEANCE-${dateStr}-${seance.nom}`,
                    seanceHoraireId: seance.id,
                    nom: seance.nom,
                    date: dateStr,
                    jour: infosJour.jourSemaine,
                    debut: seance.debut,
                    fin: seance.fin,
                    local: seance.local,
                    numeroSemaine: infosJour.numeroSemaine || null
                };
            });
        } else {
            // Jour de cours sans séance configurée (reste vide)
            seancesCompletes[dateStr] = [];
        }
    });

    // Stocker dans localStorage - LA SOURCE UNIQUE
    localStorage.setItem('seancesCompletes', JSON.stringify(seancesCompletes));

    console.log(`✅ Séances complètes générées: ${compteurSeances} séances`);
    console.log(`   - Réparties sur ${Object.keys(seancesCompletes).length} jours de cours`);

    return seancesCompletes;
}

/**
 * API publique pour obtenir les séances complètes
 * @returns {Object} - Séances complètes du trimestre
 */
function obtenirSeancesCompletes() {
    const seancesCompletes = localStorage.getItem('seancesCompletes');

    if (!seancesCompletes) {
        console.log('⚠️  seancesCompletes non trouvé, génération...');
        return genererSeancesCompletes();
    }

    return JSON.parse(seancesCompletes);
}

/**
 * API publique pour obtenir les séances d'une date spécifique
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Array} - Séances de cette date (ou tableau vide)
 */
function obtenirSeancesJour(dateStr) {
    const seancesCompletes = obtenirSeancesCompletes();
    return seancesCompletes[dateStr] || [];
}

/* ===============================
   📝 GESTION DU FORMULAIRE
   =============================== */

/**
 * Affiche le formulaire d'ajout de séances selon le format
 * Appelée lors du changement de format horaire
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie qu'un format est sélectionné
 * 2. Génère le HTML adapté (2 séances ou 1 séance)
 * 3. Affiche le formulaire
 * 
 * FORMAT '2x2':
 * - Affiche 2 formulaires (Séance A et Séance B)
 * - Champs: jour, début, fin, local pour chaque séance
 * 
 * FORMAT '1x4':
 * - Affiche 1 formulaire (Séance unique)
 * - Champs: jour, début, fin, local
 */
function afficherFormulaireSeances() {
    const formatChecked = document.querySelector('input[name="formatHoraire"]:checked');

    if (!formatChecked) {
        // Si aucun format sélectionné, afficher un message
        alert('Veuillez d\'abord sélectionner un format horaire (2×2h ou 1×4h)');
        return;
    }

    const format = formatChecked.value;
    const container = document.getElementById('seancesFormContainer');

    // Afficher directement le formulaire
    document.getElementById('formAjoutSeance').style.display = 'block';

    let html = '';

    if (format === '2x2') {
        document.getElementById('btnConfirmerSeances').textContent = 'Ajouter les séances';
        html = `
            <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: var(--bleu-moyen);">Séance A</strong>
                <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 0.8fr; gap: 10px; margin-top: 10px; align-items: end;">
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Jour de la semaine</label>
                        <select class="controle-form" id="jourSeanceA">
                            <option>Choisir...</option>
                            <option>Lundi</option>
                            <option>Mardi</option>
                            <option>Mercredi</option>
                            <option>Jeudi</option>
                            <option>Vendredi</option>
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Heure début</label>
                        <select class="controle-form" id="debutSeanceA">
                            ${genererOptionsHeureDebut()}
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Heure fin</label>
                        <select class="controle-form" id="finSeanceA">
                            ${genererOptionsHeureFin()}
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Local</label>
                        <input type="text" class="controle-form" id="localSeanceA" placeholder="Ex: 1709">
                    </div>
                </div>
            </div>
            
            <div style="background: white; padding: 10px; border-radius: 6px;">
                <strong style="color: var(--bleu-moyen);">Séance B</strong>
                <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 0.8fr; gap: 10px; margin-top: 10px; align-items: end;">
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Jour de la semaine</label>
                        <select class="controle-form" id="jourSeanceB">
                            <option>Choisir...</option>
                            <option>Lundi</option>
                            <option>Mardi</option>
                            <option>Mercredi</option>
                            <option>Jeudi</option>
                            <option>Vendredi</option>
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Heure début</label>
                        <select class="controle-form" id="debutSeanceB">
                            ${genererOptionsHeureDebut()}
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Heure fin</label>
                        <select class="controle-form" id="finSeanceB">
                            ${genererOptionsHeureFin()}
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Local</label>
                        <input type="text" class="controle-form" id="localSeanceB" placeholder="Ex: 1709">
                    </div>
                </div>
            </div>
        `;
    } else if (format === '1x4') {
        document.getElementById('btnConfirmerSeances').textContent = 'Ajouter la séance';
        html = `
            <div style="background: white; padding: 10px; border-radius: 6px;">
                <strong style="color: var(--bleu-moyen);">Séance unique (4h)</strong>
                <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 0.8fr; gap: 10px; margin-top: 10px; align-items: end;">
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Jour de la semaine</label>
                        <select class="controle-form" id="jourSeanceUnique">
                            <option>Choisir...</option>
                            <option>Lundi</option>
                            <option>Mardi</option>
                            <option>Mercredi</option>
                            <option>Jeudi</option>
                            <option>Vendredi</option>
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Heure début</label>
                        <select class="controle-form" id="debutSeanceUnique">
                            ${genererOptionsHeureDebut()}
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Heure fin</label>
                        <select class="controle-form" id="finSeanceUnique">
                            ${genererOptionsHeureFin()}
                        </select>
                    </div>
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem;">Local</label>
                        <input type="text" class="controle-form" id="localSeanceUnique" placeholder="Ex: 1709">
                    </div>
                </div>
            </div>
        `;
    }

    // Injecter le HTML dans le container
    container.innerHTML = html;
}

/**
 * Annule l'ajout de séances
 * Masque le formulaire et réinitialise le mode édition
 * 
 * UTILISÉ PAR:
 * - Bouton «Annuler» dans le formulaire
 */
function annulerAjoutSeance() {
    const formAjout = document.getElementById('formAjoutSeance');
    const btnConfirmer = document.getElementById('btnConfirmerSeances');

    if (formAjout) {
        formAjout.style.display = 'none';
    }

    // Réinitialiser le bouton
    if (btnConfirmer) {
        const formatChecked = document.querySelector('input[name="formatHoraire"]:checked');
        if (formatChecked) {
            btnConfirmer.textContent = formatChecked.value === '2x2' ? 'Ajouter les séances' : 'Ajouter la séance';
        }
        btnConfirmer.removeAttribute('data-mode-edition');
    }
}

/**
 * Confirme et enregistre les séances
 * Appelée par le bouton «Ajouter» ou «Enregistrer les modifications»
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie le format horaire
 * 2. Récupère les valeurs des champs
 * 3. Valide les données
 * 4. Vérifie si mode édition ou ajout
 * 5. Crée/met à jour les objets séance(s)
 * 6. Sauvegarde dans localStorage
 * 7. Rafraîchit l'affichage
 * 8. Masque le formulaire
 * 
 * STRUCTURE DONNÉES:
 * Séance = {
 *   id: timestamp,
 *   nom: 'A' | 'B' | 'Unique',
 *   jour: string,
 *   debut: string (HH:MM),
 *   fin: string (HH:MM),
 *   local: string,
 *   verrouille: boolean
 * }
 */
function confirmerAjoutSeances() {
    const formatChecked = document.querySelector('input[name="formatHoraire"]:checked');
    if (!formatChecked) return;

    const formatHoraire = formatChecked.value;
    let seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

    // Vérifier si on est en mode édition
    const btnConfirmer = document.getElementById('btnConfirmerSeances');
    const modeEdition = btnConfirmer.getAttribute('data-mode-edition');

    if (formatHoraire === '2x2') {
        // Valider et sauvegarder les 2 séances
        const seanceA = {
            id: modeEdition ? parseInt(modeEdition) : Date.now(),
            nom: 'A',
            jour: document.getElementById('jourSeanceA').value,
            debut: document.getElementById('debutSeanceA').value,
            fin: document.getElementById('finSeanceA').value,
            local: document.getElementById('localSeanceA').value,
            verrouille: false
        };

        const seanceB = {
            id: modeEdition ? parseInt(modeEdition) + 1 : Date.now() + 1,
            nom: 'B',
            jour: document.getElementById('jourSeanceB').value,
            debut: document.getElementById('debutSeanceB').value,
            fin: document.getElementById('finSeanceB').value,
            local: document.getElementById('localSeanceB').value,
            verrouille: false
        };

        // Validation simple
        if (!seanceA.jour || !seanceA.debut || !seanceA.fin ||
            !seanceB.jour || !seanceB.debut || !seanceB.fin) {
            alert('Veuillez remplir tous les champs obligatoires (jour, heures)');
            return;
        }

        if (modeEdition) {
            // Mode édition : remplacer les séances existantes
            seances = seances.filter(s => s.id !== parseInt(modeEdition) && s.id !== parseInt(modeEdition) + 1);
        }

        // Ajouter les séances
        seances.push(seanceA);
        seances.push(seanceB);

    } else if (formatHoraire === '1x4') {
        // Valider et sauvegarder la séance unique
        const seanceUnique = {
            id: modeEdition ? parseInt(modeEdition) : Date.now(),
            nom: 'Unique',
            jour: document.getElementById('jourSeanceUnique').value,
            debut: document.getElementById('debutSeanceUnique').value,
            fin: document.getElementById('finSeanceUnique').value,
            local: document.getElementById('localSeanceUnique').value,
            verrouille: false
        };

        // Validation simple
        if (!seanceUnique.jour || !seanceUnique.debut || !seanceUnique.fin) {
            alert('Veuillez remplir tous les champs obligatoires (jour, heures)');
            return;
        }

        if (modeEdition) {
            // Mode édition : remplacer la séance existante
            seances = seances.filter(s => s.id !== parseInt(modeEdition));
        }

        // Ajouter la séance
        seances.push(seanceUnique);
    }

    // Sauvegarder
    localStorage.setItem('seancesHoraire', JSON.stringify(seances));

    // Rafraîchir l'affichage
    afficherSeancesExistantes();

    // Régénérer les séances complètes du trimestre
    genererSeancesCompletes();

    // Réinitialiser le bouton
    btnConfirmer.textContent = formatHoraire === '2x2' ? 'Ajouter les séances' : 'Ajouter la séance';
    btnConfirmer.removeAttribute('data-mode-edition');

    // Masquer le formulaire
    annulerAjoutSeance();

    // Notification
    if (modeEdition) {
        alert('Séances modifiées avec succès !');
    } else {
        alert('Séances ajoutées avec succès !');
    }
}

/* ===============================
   AFFICHAGE DES SÉANCES
   =============================== */

/**
 * Affiche les séances existantes
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les séances depuis localStorage
 * 2. Si vide: affiche message
 * 3. Sinon: génère le HTML des séances
 * 4. Affiche les informations (jour, heures, local)
 * 5. Ajoute les boutons d'action (modifier, dupliquer, verrouiller, supprimer)
 * 6. Met à jour l'interface
 */
function afficherSeancesExistantes() {
    const container = document.getElementById('seancesContainer');
    if (!container) return;

    const seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');

    if (seances.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-style: italic;">Aucune séance configurée.</p>';
        mettreAJourInterfaceHoraire();
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';

    seances.forEach(seance => {
        const isVerrouille = seance.verrouille || false;
        const jourEchappe = echapperHtml(seance.jour);
        const debutEchappe = echapperHtml(seance.debut);
        const finEchappe = echapperHtml(seance.fin);
        const localEchappe = echapperHtml(seance.local || '');

        html += `
            <div style="background: white; 
                        border: 1px solid var(--bleu-leger); 
                        border-radius: 6px; 
                        padding: 15px; 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        opacity: ${isVerrouille ? '0.7' : '1'};">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <strong style="color: var(--bleu-moyen);">Séance ${seance.nom}</strong>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.85rem;">
                            <input type="checkbox" 
                                   id="verrou-seance-${seance.id}" 
                                   ${isVerrouille ? 'checked' : ''}
                                   onchange="basculerVerrouillageSeance(${seance.id})"
                                   title="Verrouiller/Déverrouiller">
                            🔒 ${isVerrouille ? 'Verrouillée' : 'Déverrouiller'}
                        </label>
                    </div>
                    <div style="color: #666; font-size: 0.9rem;">
                        ${jourEchappe} • ${debutEchappe} à ${finEchappe}
                        ${localEchappe ? ` • Local ${localEchappe}` : ''}
                    </div>
                </div>
                <div class="btn-groupe" style="gap: 5px;">
                    <button class="btn btn-modifier btn-sm" 
                            onclick="modifierSeance(${seance.id})"
                            ${isVerrouille ? 'disabled' : ''}
                            title="Modifier"
                            style="padding: 5px 10px; font-size: 0.85rem;">
                        Modifier
                    </button>
                    <button class="btn btn-ajouter btn-sm" 
                            onclick="dupliquerSeance(${seance.id})"
                            title="Dupliquer"
                            style="padding: 5px 10px; font-size: 0.85rem;">
                        Dupliquer
                    </button>
                    <button class="btn btn-supprimer btn-sm" 
                            onclick="supprimerSeance(${seance.id})"
                            ${isVerrouille ? 'disabled' : ''}
                            title="Supprimer"
                            style="padding: 5px 10px; font-size: 0.85rem;">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
    mettreAJourInterfaceHoraire();
}

/**
 * Supprime une séance
 * 
 * PARAMÈTRES:
 * @param {number} id - ID de la séance à supprimer
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que la séance n'est pas verrouillée
 * 2. Demande confirmation
 * 3. Filtre le tableau pour retirer la séance
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'affichage
 */
function supprimerSeance(id) {
    let seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    const seance = seances.find(s => s.id === id);

    if (seance && seance.verrouille) {
        alert('Cette séance est verrouillée et ne peut pas être supprimée.');
        return;
    }

    if (!confirm('Supprimer cette séance de l\'horaire ?')) return;

    seances = seances.filter(s => s.id !== id);

    localStorage.setItem('seancesHoraire', JSON.stringify(seances));

    // Rafraîchir l'affichage
    afficherSeancesExistantes();

    // Régénérer les séances complètes du trimestre
    genererSeancesCompletes();
}

/* ===============================
   MODIFICATION
   =============================== */

/**
 * Ouvre le formulaire en mode édition pour modifier une séance
 * 
 * PARAMÈTRES:
 * @param {number} id - ID de la séance à modifier
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la séance depuis localStorage
 * 2. Affiche le formulaire
 * 3. Pré-remplit les champs avec les valeurs existantes
 * 4. Change le mode du formulaire en "édition"
 * 
 * UTILISÉ PAR:
 * - Bouton «Modifier» dans l'affichage des séances
 */
function modifierSeance(id) {
    const seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    const seance = seances.find(s => s.id === id);

    if (!seance) return;

    // Afficher le formulaire
    afficherFormulaireSeances();

    // Attendre que le DOM soit mis à jour
    setTimeout(() => {
        // Remplir les champs selon le format
        if (seance.nom === 'A' || seance.nom === 'B') {
            // Format 2x2
            const prefixe = seance.nom === 'A' ? 'A' : 'B';
            document.getElementById(`jourSeance${prefixe}`).value = seance.jour;
            document.getElementById(`debutSeance${prefixe}`).value = seance.debut;
            document.getElementById(`finSeance${prefixe}`).value = seance.fin;
            document.getElementById(`localSeance${prefixe}`).value = seance.local || '';
        } else {
            // Format 1x4
            document.getElementById('jourSeanceUnique').value = seance.jour;
            document.getElementById('debutSeanceUnique').value = seance.debut;
            document.getElementById('finSeanceUnique').value = seance.fin;
            document.getElementById('localSeanceUnique').value = seance.local || '';
        }

        // Changer le texte du bouton
        const btnConfirmer = document.getElementById('btnConfirmerSeances');
        btnConfirmer.textContent = 'Enregistrer les modifications';
        btnConfirmer.setAttribute('data-mode-edition', id);
    }, 100);
}

/* ===============================
   🔄 DUPLICATION
   =============================== */

/**
 * Duplique une séance existante
 * 
 * FONCTIONNEMENT:
 * 1. Trouve la séance originale
 * 2. Crée une copie complète
 * 3. Change l'ID et ajoute «(copie)» au nom
 * 4. Déverrouille la copie
 * 5. Ajoute aux séances
 * 6. Sauvegarde et rafraîchit
 * 
 * PARAMÈTRES:
 * @param {number} id - ID de la séance à dupliquer
 * 
 * UTILISÉ PAR:
 * - Bouton «Dupliquer» dans l'affichage des séances
 * 
 * RETOUR:
 * - Notification de succès
 */
function dupliquerSeance(id) {
    const seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    const seanceOriginal = seances.find(s => s.id === id);

    if (seanceOriginal) {
        const nouvelleSeance = {
            ...seanceOriginal,
            id: Date.now(),
            nom: seanceOriginal.nom + ' (copie)',
            verrouille: false
        };

        seances.push(nouvelleSeance);
        localStorage.setItem('seancesHoraire', JSON.stringify(seances));
        afficherSeancesExistantes();
        alert('Séance dupliquée avec succès !');
    }
}

/* ===============================
   🔒 VERROUILLAGE
   =============================== */

/**
 * Bascule le verrouillage d'une séance
 * Une séance verrouillée ne peut pas être modifiée ou supprimée
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les séances depuis localStorage
 * 2. Trouve la séance concernée
 * 3. Bascule l'état verrouille
 * 4. Sauvegarde
 * 5. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {number} id - ID de la séance
 * 
 * UTILISÉ PAR:
 * - Checkbox dans l'affichage des séances
 * 
 * EFFET:
 * - Désactive/active les boutons Modifier et Supprimer
 * - Change l'opacité de la carte
 */
function basculerVerrouillageSeance(id) {
    let seances = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
    const index = seances.findIndex(s => s.id === id);

    if (index !== -1) {
        seances[index].verrouille = document.getElementById(`verrou-seance-${id}`).checked;
        localStorage.setItem('seancesHoraire', JSON.stringify(seances));
        afficherSeancesExistantes();
    }
}

/* ===============================
   📚 DOCUMENTATION DU MODULE
   
   ORDRE DE CHARGEMENT:
   1. Charger le module 01-config.js (variables globales)
   2. Charger ce module 10-horaire.js
   3. Appeler initialiserModuleHoraire() depuis 99-main.js
   
   DÉPENDANCES:
   - echapperHtml() depuis 01-config.js
   - Classes CSS depuis styles.css
   
   LOCALSTORAGE:
   - 'formatHoraire' : Format sélectionné ('2x2' ou '1x4')
   - 'seancesHoraire' : Array des séances configurées
   
   MODULES DÉPENDANTS:
   - 11-pratiques.js : Utilisera l'horaire pour calculer les présences
   
   ÉVÉNEMENTS:
   Tous les événements sont gérés via attributs HTML (onchange, onclick)
   sauf les radio buttons qui sont attachés dans initialiserModuleHoraire()
   
   COMPATIBILITÉ:
   - Nécessite ES6+ pour les arrow functions et template literals
   - Fonctionne avec tous les navigateurs modernes
   - Pas de dépendances externes
   ===============================*/