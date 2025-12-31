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
            c.pratiqueId = 'pan-standards'; // Pratique par défaut
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
 * Migre les cours existants pour ajouter le flag dansBibliotheque
 *
 * CONTEXTE:
 * Avec le nouveau système de bibliothèque, tous les cours doivent avoir
 * un flag dansBibliotheque pour contrôler leur visibilité.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Pour chaque cours sans flag, ajoute dansBibliotheque: true (visible par défaut)
 * 3. Sauvegarde les cours modifiés
 *
 * @returns {number} - Nombre de cours migrés
 */
function migrerCoursDansBibliotheque() {
    const cours = db.getSync('listeCours', []);
    let nbMigres = 0;

    cours.forEach(c => {
        if (c.dansBibliotheque === undefined) {
            c.dansBibliotheque = true; // Par défaut, tous les cours existants restent visibles
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('listeCours', cours);
        console.log(`[Migration cours] ✅ ${nbMigres} cours migré(s) avec flag dansBibliotheque`);
    } else {
        console.log(`[Migration cours] Tous les cours ont déjà le flag dansBibliotheque`);
    }

    return nbMigres;
}

/* ===============================
   HELPER: Peupler sélecteur trimestre (Beta 93.5)
   =============================== */
/**
 * Peuple le sélecteur de trimestre dans le formulaire cours
 *
 * BETA 93.5: Version simplifiée - génère options depuis cours existants
 * BETA 94: Lira depuis une liste de trimestres configurés
 */
function peupleSelecteurTrimestre() {
    const select = document.getElementById('trimestreId');
    if (!select) return;

    const cours = db.getSync('listeCours', []);

    // Extraire trimestres uniques
    const trimestres = new Set();
    cours.forEach(c => {
        if (c.trimestreId) {
            trimestres.add(c.trimestreId);
        }
    });

    // Effacer options existantes (sauf la première)
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Ajouter les trimestres existants
    Array.from(trimestres).sort().forEach(tId => {
        const option = document.createElement('option');
        option.value = tId;

        // Formater le label: "h2026" → "Hiver 2026"
        const session = tId.charAt(0).toUpperCase() === 'H' ? 'Hiver' : 'Automne';
        const annee = tId.substring(1);
        option.textContent = `${session} ${annee}`;

        select.appendChild(option);
    });

    // Si aucun trimestre, ajouter un par défaut depuis le calendrier
    if (trimestres.size === 0) {
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        if (calendrier.dateDebut) {
            // Extraire année depuis dateDebut (format: YYYY-MM-DD)
            const annee = calendrier.dateDebut.substring(0, 4);
            // Déduire session: Janvier-Juin = Hiver, Juillet-Décembre = Automne
            const mois = parseInt(calendrier.dateDebut.substring(5, 7));
            const session = mois <= 6 ? 'h' : 'a';
            const trimestreId = session + annee;

            const option = document.createElement('option');
            option.value = trimestreId;
            option.textContent = `${session === 'h' ? 'Hiver' : 'Automne'} ${annee}`;
            select.appendChild(option);
        }
    }
}

/**
 * Initialise le module de gestion des cours
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Exécute les migrations nécessaires
 * 3. Charge et affiche le tableau des cours
 *
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleCours() {
    console.log('📚 Initialisation du module Cours');

    // Exécuter les migrations
    migrerCoursVersPratiques();
    migrerCoursDansBibliotheque();

    // Vérifier que nous sommes dans la bonne section
    const tableauContainer = document.getElementById('listeCoursSidebar');
    if (!tableauContainer) {
        console.log('   ⚠️  Section cours non active, initialisation reportée');
        return;
    }

    // Afficher la liste des cours dans la sidebar
    afficherListeCoursSidebar();

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
        // ✅ CORRECTION BUG (16 décembre 2025) : Support de toutes les pratiques
        const pratiqueNom = obtenirNomPratiqueFallback(c.pratiqueId);

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
   AFFICHAGE SIDEBAR
   =============================== */

/**
 * Affiche la liste des cours dans la sidebar
 *
 * FONCTIONNEMENT:
 * 1. Récupère les cours avec dansBibliotheque === true
 * 2. Génère la liste HTML avec items cliquables
 * 3. Met en surbrillance le cours actif
 *
 * UTILISÉ PAR:
 * - initialiserModuleCours()
 * - sauvegarderCours()
 * - retirerCoursDeBibliotheque()
 * - ajouterCoursIndividuel()
 */
async function afficherListeCoursSidebar() {
    const tousLesCours = await db.get('listeCours') || [];
    // ✅ NOUVEAU (9 décembre 2025) : Filtrer le groupe demo (99) selon le mode
    const coursFiltres = typeof filtrerCoursDemo === 'function' ? filtrerCoursDemo(tousLesCours) : tousLesCours;
    const coursDansBibliotheque = coursFiltres.filter(c => c.dansBibliotheque === true);
    const container = document.getElementById('listeCoursSidebar');

    if (!container) return;

    if (coursDansBibliotheque.length === 0) {
        container.innerHTML = `
            <p class="text-muted text-italic" style="font-size: 0.9rem; text-align: center; padding: 20px 10px;">
                Créez un nouveau cours ou puisez dans la bibliothèque
            </p>
        `;
        return;
    }

    let html = '';
    coursDansBibliotheque.forEach(c => {
        const activeClass = c.actif ? ' active' : '';

        html += `
            <div class="sidebar-item${activeClass}" onclick="afficherFormCours('${c.id}')">
                <div class="sidebar-item-titre">
                    ${echapperHtml(c.codeCours)}
                </div>
                <div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 3px;">
                    ${echapperHtml(c.session)}${echapperHtml(c.annee)}
                </div>
                ${c.actif ? '<div style="margin-top: 5px;"><span class="sidebar-item-badge">Actif</span></div>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Récupère tous les cours de la bibliothèque (disponibles à ajouter)
 *
 * FONCTIONNEMENT:
 * - Retourne les cours avec dansBibliotheque === false
 *
 * UTILISÉ PAR:
 * - ouvrirModalBibliothequeCours()
 *
 * @returns {Array} - Cours disponibles dans la bibliothèque
 */
function obtenirTousLesCoursBibliotheque() {
    const tousLesCours = db.getSync('listeCours', []);
    // ✅ NOUVEAU (9 décembre 2025) : Filtrer le groupe demo (99) selon le mode
    const coursFiltres = typeof filtrerCoursDemo === 'function' ? filtrerCoursDemo(tousLesCours) : tousLesCours;
    return coursFiltres.filter(c => c.dansBibliotheque === false);
}

/* ===============================
   FORMULAIRE D'AJOUT/ÉDITION
   =============================== */

/**
 * Helper: Obtient le nom de la pratique en fallback (sans PratiqueManager)
 * ✅ AJOUT (16 décembre 2025) : Support de toutes les pratiques de base
 *
 * @param {string} pratiqueId - ID de la pratique
 * @returns {string} - Nom de la pratique
 */
function obtenirNomPratiqueFallback(pratiqueId) {
    const noms = {
        'sommative': 'Sommative',
        'pan-standards': 'PAN-Standards',
        'pan-maitrise': 'PAN-Standards', // Rétrocompatibilité
        'pan-specifications': 'PAN-Spécifications',
        'specifications': 'PAN-Spécifications',
        'pan-denotation': 'PAN-Dénotation'
    };
    return noms[pratiqueId] || pratiqueId || 'PAN-Standards';
}

/**
 * Affiche la pratique active en lecture seule (Single Source of Truth)
 *
 * ✅ MODIFICATION (8 décembre 2025) : La pratique n'est plus modifiable ici
 * Elle doit être définie uniquement dans Réglages → Pratique de notation
 *
 * ✅ CORRECTION (8 décembre 2025) : Lecture du nom réel depuis PratiqueManager
 * au lieu d'un mapping codé en dur
 *
 * ✅ CORRECTION BUG (16 décembre 2025) : Lire depuis pratiqueParDefaut
 *
 * FONCTIONNEMENT:
 * 1. Lit la pratique depuis pratiqueParDefaut (pas modalitesEvaluation)
 * 2. Récupère le nom réel depuis PratiqueManager.listerPratiques()
 * 3. Affiche le nom de la pratique en lecture seule
 * 4. Ajoute [PAR DÉFAUT] si applicable
 */
async function afficherPratiqueEnLectureSeule() {
    const affichage = document.getElementById('pratiqueCoursAffichage');
    if (!affichage) return;

    // ✅ CORRECTION BUG (16 décembre 2025) : Lire depuis pratiqueParDefaut, pas modalitesEvaluation
    // Le modal "Bibliothèque de pratiques" sauvegarde dans pratiqueParDefaut
    const pratiqueId = db.getSync('pratiqueParDefaut', 'pan-standards');

    // Obtenir toutes les pratiques disponibles (codées + configurables)
    let nomPratique = 'Chargement...';

    try {
        if (typeof PratiqueManager !== 'undefined' && PratiqueManager.listerPratiques) {
            const toutesLesPratiques = await PratiqueManager.listerPratiques();

            // Chercher dans les pratiques codées
            let pratiqueTrouvee = toutesLesPratiques.codees?.find(p => p.id === pratiqueId);

            // Si pas trouvée, chercher dans les pratiques configurables
            if (!pratiqueTrouvee) {
                pratiqueTrouvee = toutesLesPratiques.configurables?.find(p => p.id === pratiqueId);
            }

            // Utiliser le nom de la pratique trouvée
            if (pratiqueTrouvee) {
                nomPratique = pratiqueTrouvee.nom;

                // Ajouter [PAR DÉFAUT] si c'est la pratique par défaut
                const pratiqueDefaut = db.getSync('pratiqueParDefaut', 'pan-maitrise');
                if (pratiqueId === pratiqueDefaut) {
                    nomPratique += ' [PAR DÉFAUT]';
                }
            } else {
                // Fallback si la pratique n'est pas trouvée
                nomPratique = obtenirNomPratiqueFallback(pratiqueId);
            }
        } else {
            // Fallback si PratiqueManager n'est pas disponible
            nomPratique = obtenirNomPratiqueFallback(pratiqueId);
        }
    } catch (error) {
        console.error('Erreur lors de la lecture de la pratique:', error);
        // Fallback en cas d'erreur
        nomPratique = obtenirNomPratiqueFallback(pratiqueId);
    }

    affichage.textContent = nomPratique;
}

/**
 * Navigue vers la section Pratique de notation
 * Appelée par le bouton "Modifier la pratique de notation"
 */
function naviguerVersPratiqueNotation() {
    // Naviguer vers Réglages → Pratique de notation
    afficherSousSection('reglages-pratique-notation');
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

    // Peupler le sélecteur de trimestre (Beta 93.5)
    peupleSelecteurTrimestre();

    // Afficher la pratique active en lecture seule (Single Source of Truth)
    afficherPratiqueEnLectureSeule();
    
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
            // 🆕 BETA 92: Champs pour métadonnées CC
            document.getElementById('courrielEnseignant').value = c.courriel || '';
            document.getElementById('siteWebEnseignant').value = c.siteWeb || '';
            document.getElementById('disciplineEnseignant').value = c.discipline || '';
            document.getElementById('institutionEnseignant').value = c.institution || '';
            document.getElementById('session').value = c.session || 'H';
            document.getElementById('annee').value = c.annee || '2025';
            document.getElementById('heuresParSemaine').value = c.heuresParSemaine || '4';
            document.getElementById('formatHoraire').value = c.formatHoraire || '2x2';
            // Beta 93.5: Charger trimestreId
            if (document.getElementById('trimestreId')) {
                document.getElementById('trimestreId').value = c.trimestreId || '';
            }

            // La pratique est affichée en lecture seule (pas modifiable ici)
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

            // La pratique est affichée en lecture seule (pas modifiable ici)

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

    // ✅ CORRECTION BUG (16 décembre 2025) : Lire depuis pratiqueParDefaut
    // Le modal "Bibliothèque de pratiques" sauvegarde dans pratiqueParDefaut, pas modalitesEvaluation
    const pratiqueId = db.getSync('pratiqueParDefaut', 'pan-standards');

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
        // 🆕 BETA 92: Champs pour métadonnées CC
        courriel: document.getElementById('courrielEnseignant').value,
        siteWeb: document.getElementById('siteWebEnseignant').value,
        discipline: document.getElementById('disciplineEnseignant').value,
        institution: document.getElementById('institutionEnseignant').value,
        session: document.getElementById('session').value,
        annee: document.getElementById('annee').value,
        heuresParSemaine: document.getElementById('heuresParSemaine').value,
        formatHoraire: document.getElementById('formatHoraire').value,
        pratiqueId: pratiqueId, // ✅ NOUVEAU : Association à une pratique
        trimestreId: document.getElementById('trimestreId')?.value || '', // ✅ BETA 93.5 : Association à un trimestre
        dansBibliotheque: true, // ✅ NOUVEAU : Visible dans sidebar par défaut
        verrouille: false,
        actif: false,
        dateEnregistrement: new Date().toISOString()
    };
    
    if (coursEnEdition) {
        // Modification - conserver l'état de verrouillage, actif, dansBibliotheque et pratiqueId si non modifié
        const index = cours.findIndex(c => c.id === coursEnEdition);
        if (index !== -1) {
            nouveauCours.verrouille = cours[index].verrouille;
            nouveauCours.actif = cours[index].actif;
            nouveauCours.dansBibliotheque = cours[index].dansBibliotheque; // Conserver flag bibliothèque
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

    // Mettre à jour la sidebar au lieu du tableau
    afficherListeCoursSidebar();
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
            dansBibliotheque: true, // ✅ NOUVEAU : Copie visible par défaut
            actif: false,
            verrouille: false
        };
        
        cours.push(nouveauCours);
        db.setSync('listeCours', cours);
        afficherTableauCours();
        afficherNotificationSucces('Cours dupliqué avec succès !');
    }
}

/**
 * Duplique un cours pour le trimestre actuellement actif
 * Utilisé depuis le modal Bibliothèque pour créer une copie dans un nouveau trimestre
 *
 * FONCTIONNEMENT:
 * 1. Récupère le cours original
 * 2. Obtient le trimestre actif (session + année)
 * 3. Crée une copie avec session/année du trimestre actif
 * 4. Génère un nouvel ID et trimestreId
 * 5. Sauvegarde et rafraîchit
 *
 * @param {string} id - ID du cours à dupliquer
 */
function dupliquerCoursPourTrimestreActif(id) {
    const cours = db.getSync('listeCours', []);
    const coursOriginal = cours.find(c => c.id === id);

    if (!coursOriginal) {
        alert('Cours introuvable');
        return;
    }

    // Obtenir le trimestre actif
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif) || trimestres[0];

    if (!trimestreActif) {
        alert('Aucun trimestre actif. Veuillez d\'abord créer un trimestre.');
        return;
    }

    // Créer la copie avec les infos du nouveau trimestre
    const nouveauCours = {
        ...coursOriginal,
        id: 'COURS' + Date.now(),
        session: trimestreActif.session,
        annee: trimestreActif.annee,
        trimestreId: trimestreActif.id,
        dateEnregistrement: new Date().toISOString(),
        dansBibliotheque: true,
        actif: false,
        verrouille: false
    };

    // Ne pas copier le suffixe "(copie)" si déjà présent
    if (!nouveauCours.codeCours.includes('(copie)')) {
        // Garder le code original, pas de suffixe
    }

    cours.push(nouveauCours);
    db.setSync('listeCours', cours);

    // Fermer le modal et rafraîchir
    fermerModalBibliothequeCours();

    // Rafraîchir le dropdown V2 si disponible
    if (typeof chargerDropdownCoursV2 === 'function') {
        chargerDropdownCoursV2();
    }

    // Rafraîchir le tableau legacy si visible
    if (typeof afficherTableauCours === 'function') {
        afficherTableauCours();
    }

    // Rafraîchir la sidebar
    if (typeof afficherListeCoursSidebar === 'function') {
        afficherListeCoursSidebar();
    }

    afficherNotificationSucces(`Cours dupliqué pour ${trimestreActif.nom} !`);
    console.log('[Cours] Cours dupliqué pour trimestre actif:', trimestreActif.id, nouveauCours);
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

    if (!coursASupprimer) {
        alert('Cours introuvable');
        return;
    }

    if (coursASupprimer.verrouille) {
        alert('Déverrouillez ce cours (🔓) avant de le supprimer');
        return;
    }

    // ===============================
    // COMPTER LES DONNÉES LIÉES (Beta 93.5)
    // ✅ NAMESPACING (Beta 95.5)
    // ===============================
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');
    const evaluations = db.getSync('evaluationsDetaillees', []);
    const presences = obtenirDonneesSelonMode('presences');

    const nbEtudiants = etudiants.filter(e => e.coursId === id).length;
    const nbProductions = productions.filter(p => p.coursId === id).length;
    const productionsIds = productions.filter(p => p.coursId === id).map(p => p.id);
    const nbEvaluations = evaluations.filter(e => productionsIds.includes(e.productionId)).length;
    const nbPresences = Object.keys(presences).filter(date => presences[date].coursId === id).length;

    // ===============================
    // CONFIRMATION DÉTAILLÉE (Beta 93.5)
    // ===============================
    const message = `Supprimer le cours ${coursASupprimer.sigle || coursASupprimer.codeCours} - ${coursASupprimer.titre || coursASupprimer.nomCours} (Groupe ${coursASupprimer.groupe}) ?\n\n` +
        `Cette action supprimera :\n` +
        `• ${nbEtudiants} étudiant(s)\n` +
        `• ${nbProductions} production(s)\n` +
        `• ${nbEvaluations} évaluation(s)\n` +
        `• ${nbPresences} date(s) de présences\n\n` +
        `⚠️ Cette action est IRRÉVERSIBLE !`;

    if (!confirm(message)) return;

    // ===============================
    // SUPPRESSION EN CASCADE (Beta 93.5)
    // ===============================

    // 1. Supprimer les étudiants du cours
    const nouveauxEtudiants = etudiants.filter(e => e.coursId !== id);
    db.setSync('groupeEtudiants', nouveauxEtudiants);
    console.log(`✅ [Suppression] ${nbEtudiants} étudiant(s) supprimé(s)`);

    // 2. Supprimer les productions du cours
    const nouvellesProductions = productions.filter(p => p.coursId !== id);
    db.setSync('productions', nouvellesProductions);
    console.log(`✅ [Suppression] ${nbProductions} production(s) supprimée(s)`);

    // 3. Supprimer les évaluations liées aux productions supprimées
    const nouvellesEvaluations = evaluations.filter(e => !productionsIds.includes(e.productionId));
    db.setSync('evaluationsDetaillees', nouvellesEvaluations);
    console.log(`✅ [Suppression] ${nbEvaluations} évaluation(s) supprimée(s)`);

    // 4. Supprimer les présences du cours
    const nouvellesPresences = {};
    Object.keys(presences).forEach(date => {
        if (presences[date].coursId !== id) {
            nouvellesPresences[date] = presences[date];
        }
    });
    db.setSync('presences', nouvellesPresences);
    console.log(`✅ [Suppression] ${nbPresences} date(s) de présences supprimée(s)`);

    // 5. Supprimer le cours lui-même
    const nouveauxCours = cours.filter(c => c.id !== id);

    // 6. Activer un autre cours si nécessaire
    if (coursASupprimer.actif && nouveauxCours.length > 0) {
        nouveauxCours[0].actif = true;
        console.log(`✅ [Suppression] Cours ${nouveauxCours[0].id} activé automatiquement`);
    }

    db.setSync('listeCours', nouveauxCours);

    // ✅ BETA 93.5: Si suppression du groupe démo (9999), mémoriser le choix
    if (id === '601-101-h2026-9999' || coursASupprimer.groupe === '9999') {
        db.setSync('groupeDemoSupprime', true);
        console.log('✅ [Suppression] Groupe démo supprimé - préférence mémorisée');
    }

    // 7. Rafraîchir l'affichage
    afficherTableauCours();
    afficherNotificationSucces('Cours et toutes ses données supprimés !');

    // 8. Recharger les vues si une fonction globale existe
    if (typeof rafraichirToutesLesVues === 'function') {
        rafraichirToutesLesVues();
    } else {
        // Sinon, recharger manuellement les principales vues
        if (typeof afficherListeEtudiants === 'function') {
            afficherListeEtudiants();
        }
        if (typeof afficherTableauProductions === 'function') {
            afficherTableauProductions();
        }
    }

    console.log(`✅ [Suppression] Cours ${id} et toutes ses données supprimés avec succès`);
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
   MODAL BIBLIOTHÈQUE (Simplifié, sans CC)
   =============================== */

/**
 * Ouvre le modal de la bibliothèque de cours
 *
 * FONCTIONNEMENT:
 * - Section 1 : Cours dans ma sélection (dansBibliotheque === true)
 * - Section 2 : Cours disponibles à ajouter (dansBibliotheque === false)
 * - Boutons simplifiés (sans export/import avec métadonnées CC)
 *
 * NOTE: Contrairement aux productions/grilles, les cours ne nécessitent
 * PAS de métadonnées CC car il s'agit de données ministérielles publiques
 */
async function ouvrirModalBibliothequeCours() {
    const tousLesCours = await db.get('listeCours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);
    const coursDisponibles = tousLesCours.filter(c => c.dansBibliotheque === false);

    let modalHTML = `
        <div id="modalBibliothequeCours" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 900px;
                max-height: 85vh;
                overflow-y: auto;
                padding: 30px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
            ">
                <!-- Bouton X sticky -->
                <button onclick="fermerModalBibliothequeCours()" style="
                    position: sticky;
                    top: 0;
                    right: 0;
                    float: right;
                    background: transparent;
                    border: none;
                    font-size: 28px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                " onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">
                    ×
                </button>
                <h2 style="margin-top: 0; color: var(--bleu-principal);">Bibliothèque de cours</h2>
                <p class="text-muted">Gérez vos configurations de cours</p>

                <!-- SECTION 1 : Ma sélection -->
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem;">
                    Cours dans votre sélection (${coursDansBibliotheque.length})
                </h3>
                <div style="margin-bottom: 30px;">
    `;

    if (coursDansBibliotheque.length === 0) {
        modalHTML += `<p class="text-muted" style="font-style: italic; padding: 20px 0;">Aucun cours dans votre sélection</p>`;
    } else {
        coursDansBibliotheque.forEach(cours => {
            const actifBadge = cours.actif ? '<span class="badge-info" style="margin-left: 10px;">Actif</span>' : '';

            modalHTML += `
                <div style="
                    border: 1px solid var(--bleu-clair);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: var(--bleu-tres-pale);">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--bleu-principal); margin-bottom: 5px;">
                                ${echapperHtml(cours.codeCours)} - ${echapperHtml(cours.nomCours)}${actifBadge}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--gris-moyen); margin-bottom: 3px;">
                                ${echapperHtml(cours.competence || '')}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--gris-moyen);">
                                ${echapperHtml(cours.prenomEnseignant)} ${echapperHtml(cours.nomEnseignant)} • ${echapperHtml(cours.session)}${echapperHtml(cours.annee)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button onclick="dupliquerCoursPourTrimestreActif('${cours.id}')"
                                    class="btn btn-confirmer btn-tres-compact"
                                    title="Créer une copie de ce cours pour le trimestre actif">
                                Dupliquer
                            </button>
                            <button onclick="partagerCours('${cours.id}')"
                                    class="btn btn-secondaire btn-tres-compact"
                                    title="Exporter ce cours en JSON pour le partager">
                                Exporter
                            </button>
                            <button onclick="retirerCoursDeBibliotheque('${cours.id}')"
                                    class="btn btn-supprimer btn-tres-compact"
                                    title="Retirer de votre sélection">
                                Retirer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    modalHTML += `
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="partagerTousLesCours()" class="btn btn-secondaire" title="Exporter tous vos cours en un seul fichier JSON">
                        Exporter tous mes cours
                    </button>
                </div>
    `;

    // SECTION 2 : Disponibles à ajouter
    modalHTML += `
                <h3 style="color: #3498db; font-size: 1.1rem; margin-top: 20px;">
                    Cours disponibles à ajouter
                </h3>
    `;

    if (coursDisponibles.length === 0) {
        modalHTML += `<p class="text-muted" style="font-style: italic; padding: 20px 0;">Aucun cours disponible</p>`;
    } else {
        coursDisponibles.forEach(cours => {
            modalHTML += `
                <div style="
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: white;">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--bleu-principal); margin-bottom: 5px;">
                                ${echapperHtml(cours.codeCours)} - ${echapperHtml(cours.nomCours)}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--gris-moyen); margin-bottom: 3px;">
                                ${echapperHtml(cours.competence || '')}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--gris-moyen);">
                                ${echapperHtml(cours.session)}${echapperHtml(cours.annee)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="ajouterCoursIndividuel('${cours.id}')"
                                    class="btn btn-confirmer btn-tres-compact"
                                    title="Ajouter ce cours à votre sélection">
                                Ajouter à ma sélection
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    modalHTML += `
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="document.getElementById('fichier-import-cours-modal').click()"
                            class="btn btn-confirmer" title="Importer des cours depuis un fichier JSON">
                        Importer des cours
                    </button>
                    <input type="file" id="fichier-import-cours-modal" accept=".json"
                           style="display: none;" onchange="importerCoursSimple(event)">
                </div>
            </div>
        </div>
    `;

    // Insérer le modal dans le body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * Ferme le modal de la bibliothèque
 */
function fermerModalBibliothequeCours() {
    const modal = document.getElementById('modalBibliothequeCours');
    if (modal && modal.parentElement) {
        modal.parentElement.remove();
    }
}

/**
 * Retire un cours de la sélection (passe dansBibliotheque à false)
 *
 * @param {string} id - ID du cours à retirer
 */
async function retirerCoursDeBibliotheque(id) {
    const cours = await db.get('listeCours') || [];
    const coursIndex = cours.findIndex(c => c.id === id);

    if (coursIndex !== -1) {
        cours[coursIndex].dansBibliotheque = false;
        cours[coursIndex].actif = false; // Un cours retiré ne peut plus être actif

        await db.set('listeCours', cours);
        fermerModalBibliothequeCours();
        await afficherListeCoursSidebar();
        alert('Cours retiré de votre sélection');
    }
}

/**
 * Ajoute un cours à la sélection (passe dansBibliotheque à true)
 *
 * @param {string} id - ID du cours à ajouter
 */
async function ajouterCoursIndividuel(id) {
    const cours = await db.get('listeCours') || [];
    const coursIndex = cours.findIndex(c => c.id === id);

    if (coursIndex !== -1) {
        cours[coursIndex].dansBibliotheque = true;

        await db.set('listeCours', cours);
        fermerModalBibliothequeCours();
        await afficherListeCoursSidebar();
        alert('Cours ajouté à votre sélection avec succès !');
    }
}

/* ===============================
   EXPORT/IMPORT SIMPLIFIÉS (Sans métadonnées CC)
   =============================== */

/**
 * Exporte les cours de la sélection au format JSON simple
 *
 * FONCTIONNEMENT:
 * - Exporte tous les cours avec dansBibliotheque === true
 * - Format JSON simple sans métadonnées CC (données ministérielles)
 * - Nom fichier : cours-YYYY-MM-DD.json
 */
async function exporterCoursSimple() {
    const tousLesCours = await db.get('listeCours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);

    if (coursDansBibliotheque.length === 0) {
        alert('Aucun cours à exporter dans votre sélection');
        return;
    }

    // Créer le JSON
    const dataStr = JSON.stringify(coursDansBibliotheque, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Générer nom de fichier avec date
    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichier = `cours-${dateStr}.json`;

    // Télécharger
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);

    alert(`${coursDansBibliotheque.length} cours exportés avec succès !`);
}

/**
 * Importe des cours depuis un fichier JSON
 *
 * FONCTIONNEMENT:
 * - Lit le fichier JSON
 * - Vérifie les doublons par codeCours + session + annee
 * - Ajoute les cours (dansBibliotheque = false par défaut)
 * - Génère de nouveaux IDs pour éviter conflits
 *
 * @param {Event} event - Événement de changement du input file
 */
async function importerCoursSimple(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const coursImportes = JSON.parse(e.target.result);

            if (!Array.isArray(coursImportes)) {
                alert('Format de fichier invalide : doit être un tableau de cours');
                return;
            }

            const coursExistants = await db.get('listeCours') || [];
            let nbAjoutes = 0;
            let nbDoublons = 0;

            coursImportes.forEach(coursImporte => {
                // Vérifier doublon (même code + session + année)
                const doublon = coursExistants.find(c =>
                    c.codeCours === coursImporte.codeCours &&
                    c.session === coursImporte.session &&
                    c.annee === coursImporte.annee
                );

                if (doublon) {
                    nbDoublons++;
                } else {
                    // Ajouter avec nouvel ID et flag dansBibliotheque = false
                    const nouveauCours = {
                        ...coursImporte,
                        id: 'COURS' + Date.now() + '_' + nbAjoutes,
                        dansBibliotheque: false, // Disponible à ajouter
                        actif: false, // Les cours importés ne sont jamais actifs par défaut
                        dateEnregistrement: new Date().toISOString()
                    };

                    coursExistants.push(nouveauCours);
                    nbAjoutes++;
                }
            });

            if (nbAjoutes > 0) {
                await db.set('listeCours', coursExistants);
            }

            // Message récapitulatif
            let message = `Import terminé :\n`;
            message += `✓ ${nbAjoutes} cours ajoutés\n`;
            if (nbDoublons > 0) {
                message += `• ${nbDoublons} doublon(s) ignoré(s)`;
            }

            alert(message);

            // Fermer et rafraîchir
            fermerModalBibliothequeCours();
            await ouvrirModalBibliothequeCours();

        } catch (error) {
            console.error('Erreur lors de l\'import :', error);
            alert('Erreur lors de l\'import du fichier. Vérifiez le format JSON.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
}

/* ===============================
   PARTAGE AVEC MÉTADONNÉES CC
   =============================== */

/**
 * Partage un cours individuel avec métadonnées Creative Commons
 *
 * FONCTIONNEMENT:
 * 1. Demande les métadonnées CC enrichies à l'utilisateur
 * 2. Marque le cours comme partagé (dansBibliotheque = false)
 * 3. Ajoute les métadonnées CC au cours
 * 4. Rafraîchit le modal et la sidebar
 *
 * @param {string} id - ID du cours à partager
 */
async function partagerCours(id) {
    try {
        const cours = await db.get('listeCours') || [];
        const coursAPartager = cours.find(c => c.id === id);

        if (!coursAPartager) {
            alert('Cours introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const nomAffiche = `${coursAPartager.codeCours} - ${coursAPartager.nomCours}`;
        const metadata = await demanderMetadonneesEnrichies('cours', nomAffiche);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagé (retirer de ma sélection)
        coursAPartager.dansBibliotheque = false;

        // Ajouter métadonnées CC
        coursAPartager.metadata_cc = metadata;

        // Sauvegarder
        await db.set('listeCours', cours);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeCours();
        await afficherListeCoursSidebar();
        await ouvrirModalBibliothequeCours();

        alert('Cours partagé avec succès !\n\nIl est maintenant disponible dans la section "Cours disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage du cours');
    }
}

/**
 * Partage tous les cours de la sélection avec métadonnées Creative Commons
 *
 * FONCTIONNEMENT:
 * 1. Demande les métadonnées CC globales
 * 2. Exporte tous les cours avec métadonnées
 * 3. Génère fichier JSON téléchargeable
 */
async function partagerTousLesCours() {
    const tousLesCours = await db.get('listeCours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);

    if (coursDansBibliotheque.length === 0) {
        alert('Aucun cours à partager dans votre sélection');
        return;
    }

    // Demander métadonnées CC pour l'export global
    const metadata = await demanderMetadonneesEnrichies('cours', 'Mes cours');
    if (!metadata) {
        return; // Annulé par l'utilisateur
    }

    // Créer le wrapper avec métadonnées
    const exportData = {
        metadata_cc: metadata,
        type: 'cours',
        nbCours: coursDansBibliotheque.length,
        dateExport: new Date().toISOString(),
        cours: coursDansBibliotheque
    };

    // Créer le JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Générer nom de fichier avec date
    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichier = `cours-${dateStr}.json`;

    // Télécharger
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);

    alert(`${coursDansBibliotheque.length} cours exportés avec métadonnées Creative Commons !`);
}

/* ===============================
   HELPER: Obtenir l'ID du cours actif (Beta 95)
   =============================== */

/**
 * Retourne l'ID du cours actuellement actif
 * Utilisé par horaire.js pour le namespacing des séances
 *
 * @returns {string|null} - ID du cours actif ou null si aucun
 */
function obtenirCoursActifId() {
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.id) {
        return infoCours.id;
    }

    // Fallback: chercher dans listeCours
    const listeCours = db.getSync('listeCours', []);
    const coursActif = listeCours.find(c => c.actif);
    return coursActif ? coursActif.id : null;
}

/* ===============================
   EXPORTS - Rendre les fonctions accessibles globalement
   =============================== */

window.obtenirCoursActifId = obtenirCoursActifId;
window.afficherFormCours = afficherFormCours;
window.sauvegarderCours = sauvegarderCours;
window.annulerFormCours = annulerFormCours;
window.modifierCours = modifierCours;
window.dupliquerCours = dupliquerCours;
window.dupliquerCoursPourTrimestreActif = dupliquerCoursPourTrimestreActif;
window.supprimerCours = supprimerCours;
window.activerCours = activerCours;
window.afficherTableauCours = afficherTableauCours;
window.initialiserModuleCours = initialiserModuleCours;
window.afficherListeCoursSidebar = afficherListeCoursSidebar;
window.ouvrirModalBibliothequeCours = ouvrirModalBibliothequeCours;
window.fermerModalBibliothequeCours = fermerModalBibliothequeCours;
window.retirerCoursDeBibliotheque = retirerCoursDeBibliotheque;
window.ajouterCoursIndividuel = ajouterCoursIndividuel;
window.exporterCoursSimple = exporterCoursSimple;
window.importerCoursSimple = importerCoursSimple;
window.naviguerVersPratiqueNotation = naviguerVersPratiqueNotation;
window.partagerCours = partagerCours;
window.partagerTousLesCours = partagerTousLesCours;