/**
 * PRIMO MODAL - Interface conversationnelle
 *
 * Gère l'affichage du modal conversationnel de Primo qui pose les questions
 * une par une et remplit automatiquement les formulaires de Réglages.
 *
 * VERSION : 1.0
 * DATE : 27 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
 */

// ============================================================================
// ÉTAT DU MODAL
// ============================================================================

let modalPrimoActif = false;
let indexQuestionActuelle = 0;
let reponsesPrimo = {};

// ============================================================================
// GESTION DU MODAL
// ============================================================================

/**
 * Ouvre le modal conversationnel de Primo
 */
function ouvrirModalConversationnel(indexDepart = 0) {
    // Réinitialiser l'état
    indexQuestionActuelle = indexDepart;
    reponsesPrimo = {};
    modalPrimoActif = true;

    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'modal-primo-conversation';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    modal.innerHTML = `
        <div id="primo-conversation-contenu" style="
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 600px;
            min-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out;
        ">
            <!-- Le contenu sera injecté ici -->
        </div>
    `;

    // Ajouter animations CSS
    ajouterAnimationsCSS();

    document.body.appendChild(modal);

    // Afficher la première question
    afficherQuestionActuelle();
}

/**
 * Ferme le modal conversationnel
 */
function fermerModalConversationnel() {
    const modal = document.getElementById('modal-primo-conversation');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => modal.remove(), 200);
    }
    modalPrimoActif = false;
}

/**
 * Ajoute les animations CSS au document
 */
function ajouterAnimationsCSS() {
    // Vérifier si déjà ajouté
    if (document.getElementById('primo-animations')) return;

    const style = document.createElement('style');
    style.id = 'primo-animations';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// AFFICHAGE DES QUESTIONS
// ============================================================================

/**
 * Affiche la question actuelle dans le modal
 */
async function afficherQuestionActuelle() {
    const contenu = document.getElementById('primo-conversation-contenu');
    if (!contenu) return;

    // Obtenir les questions actives (en tenant compte des sauts)
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);

    // Vérifier si on a terminé
    if (indexQuestionActuelle >= questionsActives.length) {
        await terminerConfiguration();
        return;
    }

    const question = questionsActives[indexQuestionActuelle];

    // Générer le HTML de la question
    contenu.innerHTML = genererHTMLQuestion(question);

    // Pré-remplir si réponse existe
    if (reponsesPrimo[question.id]) {
        preremplirReponse(question.id, reponsesPrimo[question.id]);
    }

    // Si c'est une action, l'exécuter automatiquement après affichage
    if (question.type === 'action') {
        console.log('[Primo] Question type action détectée - déclenchement automatique');
        // Petit délai pour que l'utilisateur voie le message
        setTimeout(() => {
            executerAction(question);
        }, 500);
    }
}

/**
 * Génère le HTML pour une question
 */
function genererHTMLQuestion(question) {
    let html = '';

    // En-tête avec Primo
    html += `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #1a5266, #2d7a8c);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                box-shadow: 0 4px 15px rgba(26, 82, 102, 0.3);
            ">
                😎
            </div>
        </div>
    `;

    // Question
    html += `
        <div style="margin-bottom: 25px;">
            <div style="
                font-size: 1.1rem;
                color: var(--gris-fonce);
                line-height: 1.6;
                white-space: pre-line;
                margin-bottom: 20px;
            ">${question.texte}</div>
    `;

    // Input selon le type
    html += genererInputQuestion(question);

    // Aide si présente
    if (question.aide) {
        html += `
            <div style="
                margin-top: 10px;
                padding: 10px;
                background: var(--bleu-tres-pale);
                border-left: 3px solid var(--bleu-principal);
                border-radius: 4px;
                font-size: 0.85rem;
                color: var(--gris-moyen);
            ">
                💡 ${question.aide}
            </div>
        `;
    }

    html += `</div>`;

    // Zone d'erreur
    html += `<div id="primo-erreur" style="
        color: var(--rouge);
        font-size: 0.9rem;
        margin-bottom: 15px;
        display: none;
    "></div>`;

    // Boutons de navigation
    html += genererBoutonsNavigation();

    return html;
}

/**
 * Génère l'input approprié selon le type de question
 */
function genererInputQuestion(question) {
    let html = '';
    const inputId = 'primo-input-' + question.id;

    switch (question.type) {
        case 'text':
            html += `
                <input type="text" id="${inputId}"
                    placeholder="${question.placeholder || ''}"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid var(--bordure-claire);
                        border-radius: 8px;
                        font-size: 1rem;
                        transition: border-color 0.2s;
                    "
                    onfocus="this.style.borderColor='var(--bleu-principal)'"
                    onblur="this.style.borderColor='var(--bordure-claire)'"
                />
            `;
            break;

        case 'number':
            html += `
                <input type="number" id="${inputId}"
                    placeholder="${question.placeholder || ''}"
                    min="${question.validation?.min || 0}"
                    max="${question.validation?.max || 999}"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid var(--bordure-claire);
                        border-radius: 8px;
                        font-size: 1rem;
                        transition: border-color 0.2s;
                    "
                    onfocus="this.style.borderColor='var(--bleu-principal)'"
                    onblur="this.style.borderColor='var(--bordure-claire)'"
                />
            `;
            break;

        case 'date':
            html += `
                <input type="date" id="${inputId}"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid var(--bordure-claire);
                        border-radius: 8px;
                        font-size: 1rem;
                        transition: border-color 0.2s;
                    "
                    onfocus="this.style.borderColor='var(--bleu-principal)'"
                    onblur="this.style.borderColor='var(--bordure-claire)'"
                />
            `;
            break;

        case 'time':
            html += `
                <input type="time" id="${inputId}"
                    placeholder="${question.placeholder || ''}"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid var(--bordure-claire);
                        border-radius: 8px;
                        font-size: 1rem;
                        transition: border-color 0.2s;
                    "
                    onfocus="this.style.borderColor='var(--bleu-principal)'"
                    onblur="this.style.borderColor='var(--bordure-claire)'"
                />
            `;
            break;

        case 'textarea':
            html += `
                <textarea id="${inputId}"
                    placeholder="${question.placeholder || ''}"
                    rows="5"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid var(--bordure-claire);
                        border-radius: 8px;
                        font-size: 1rem;
                        resize: vertical;
                        transition: border-color 0.2s;
                    "
                    onfocus="this.style.borderColor='var(--bleu-principal)'"
                    onblur="this.style.borderColor='var(--bordure-claire)'"
                ></textarea>
            `;
            break;

        case 'select':
            const options = obtenirOptions(question.id);
            html += `<select id="${inputId}" style="
                width: 100%;
                padding: 12px;
                border: 2px solid var(--bordure-claire);
                border-radius: 8px;
                font-size: 1rem;
                background: white;
                cursor: pointer;
                transition: border-color 0.2s;
            "
            onfocus="this.style.borderColor='var(--bleu-principal)'"
            onblur="this.style.borderColor='var(--bordure-claire)'">
                <option value="">-- Choisis une option --</option>`;

            options.forEach(opt => {
                html += `<option value="${opt.value}">${opt.label}</option>`;
            });

            html += `</select>`;
            break;

        case 'radio':
            const radioOptions = obtenirOptions(question.id);
            radioOptions.forEach((opt, index) => {
                const isDisabled = opt.disabled === true;
                const labelStyle = isDisabled
                    ? `display: block;
                       padding: 15px;
                       margin-bottom: 10px;
                       border: 2px solid var(--bordure-claire);
                       border-radius: 8px;
                       cursor: not-allowed;
                       opacity: 0.5;
                       background: var(--gris-tres-pale);
                       transition: all 0.2s;`
                    : `display: block;
                       padding: 15px;
                       margin-bottom: 10px;
                       border: 2px solid var(--bordure-claire);
                       border-radius: 8px;
                       cursor: pointer;
                       transition: all 0.2s;`;

                const hoverEvents = isDisabled
                    ? ''
                    : `onmouseover="this.style.background='var(--bleu-tres-pale)'; this.style.borderColor='var(--bleu-principal)';"
                       onmouseout="if(!this.querySelector('input').checked) { this.style.background='white'; this.style.borderColor='var(--bordure-claire)'; }"`;

                html += `
                    <label style="${labelStyle}" ${hoverEvents}>
                        <input type="radio" name="${inputId}" value="${opt.value}"
                            style="margin-right: 10px;"
                            ${isDisabled ? 'disabled' : ''}
                            onchange="this.parentElement.parentElement.querySelectorAll('label').forEach(l => { if(!l.querySelector('input').disabled) { l.style.background='white'; l.style.borderColor='var(--bordure-claire)'; } }); this.parentElement.style.background='var(--bleu-tres-pale)'; this.parentElement.style.borderColor='var(--bleu-principal)';"
                        />
                        <strong>${opt.label}</strong>
                        ${opt.description ? `<div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 5px; margin-left: 24px;">${opt.description}</div>` : ''}
                        ${opt.disabledMessage && isDisabled ? `<div style="font-size: 0.8rem; color: var(--orange-accent); margin-top: 8px; margin-left: 24px; font-style: italic;">💡 ${opt.disabledMessage}</div>` : ''}
                    </label>
                `;
            });
            break;

        case 'message':
            // Pas d'input, juste le message (question finale)
            break;

        case 'instruction':
            // Pas d'input non plus, juste une instruction à lire
            // Le bouton "Suivant" permettra de continuer
            break;

        case 'action':
            // Type spécial pour déclencher une action (import données demo, etc.)
            html += `
                <div id="action-status" style="
                    padding: 20px;
                    background: var(--bleu-tres-pale);
                    border-left: 4px solid var(--bleu-principal);
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
                    <div style="font-size: 1rem; color: var(--gris-fonce);">
                        En cours d'exécution...
                    </div>
                </div>
            `;
            break;
    }

    return html;
}

/**
 * Génère les boutons de navigation
 */
function genererBoutonsNavigation() {
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);
    const question = questionsActives[indexQuestionActuelle];
    const estPremiere = indexQuestionActuelle === 0;
    const estDerniere = indexQuestionActuelle === questionsActives.length - 1;

    let html = '<div style="display: flex; gap: 10px; margin-top: 25px;">';

    // Bouton Précédent
    if (!estPremiere) {
        html += `
            <button onclick="primoQuestionPrecedente()" style="
                flex: 1;
                padding: 12px 20px;
                background: white;
                color: var(--bleu-principal);
                border: 2px solid var(--bleu-principal);
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='var(--bleu-tres-pale)';"
               onmouseout="this.style.background='white';">
                ← Précédent
            </button>
        `;
    }

    // Bouton Suivant, Continuer ou Terminer
    if (question.type === 'message') {
        html += `
            <button onclick="terminerConfiguration().catch(err => console.error('[Primo] Erreur terminerConfiguration:', err))" style="
                flex: 2;
                padding: 12px 20px;
                background: linear-gradient(135deg, #1a5266, #2d7a8c);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 12px rgba(26, 82, 102, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(26, 82, 102, 0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(26, 82, 102, 0.3)';">
                Terminer ✓
            </button>
        `;
    } else if (question.type === 'action') {
        // Pour les actions, le bouton est géré automatiquement par executerAction()
        html += `
            <button disabled style="
                flex: 2;
                padding: 12px 20px;
                background: var(--gris-clair);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: not-allowed;
                opacity: 0.6;
            ">
                Exécution en cours...
            </button>
        `;
    } else {
        // Texte du bouton selon le type
        const texteBouton = question.type === 'instruction' ? 'Continuer →' : 'Suivant →';

        html += `
            <button onclick="primoQuestionSuivante()" style="
                flex: 2;
                padding: 12px 20px;
                background: linear-gradient(135deg, #1a5266, #2d7a8c);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 12px rgba(26, 82, 102, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(26, 82, 102, 0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(26, 82, 102, 0.3)';">
                ${texteBouton}
            </button>
        `;
    }

    // Bouton Annuler (toujours présent)
    html += `
        <button onclick="confirmerAnnulation()" style="
            padding: 12px 20px;
            background: white;
            color: var(--gris-moyen);
            border: 1px solid var(--bordure-claire);
            border-radius: 8px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        " onmouseover="this.style.background='var(--gris-tres-pale)'; this.style.borderColor='var(--gris-moyen)';"
           onmouseout="this.style.background='white'; this.style.borderColor='var(--bordure-claire)';">
            Annuler
        </button>
    `;

    html += '</div>';
    return html;
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Passe à la question suivante
 */
function primoQuestionSuivante() {
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);
    const question = questionsActives[indexQuestionActuelle];

    console.log('[Primo] primoQuestionSuivante() - Type:', question.type, 'ID:', question.id);

    // En mode notification, simplement avancer sans validation
    if (modeNotification) {
        console.log('[Primo] Mode notification - passage direct');
        indexQuestionActuelle++;
        afficherNotificationActuelle();
        return;
    }

    // Pour les types 'instruction' et 'message', pas de validation nécessaire
    if (question.type === 'instruction' || question.type === 'message') {
        console.log('[Primo] Type instruction/message - passage direct');
        indexQuestionActuelle++;
        afficherQuestionActuelle();
        return;
    }

    // Pour le type 'action', exécuter l'action puis passer à la suite
    if (question.type === 'action') {
        console.log('[Primo] Type action détecté - appel executerAction()');
        executerAction(question);
        return; // L'action appellera afficherQuestionActuelle() après son exécution
    }

    // Récupérer la réponse
    const reponse = recupererReponse(question);

    // Valider
    const validation = validerReponse(question.id, reponse, reponsesPrimo);
    if (!validation.valide) {
        afficherErreur(validation.erreurs[0]);
        return;
    }

    // Sauvegarder la réponse
    reponsesPrimo[question.id] = reponse;

    // Passer à la suivante
    indexQuestionActuelle++;
    afficherQuestionActuelle();
}

/**
 * Retourne à la question précédente
 */
function primoQuestionPrecedente() {
    if (indexQuestionActuelle > 0) {
        indexQuestionActuelle--;
        afficherQuestionActuelle();
    }
}

/**
 * Confirme l'annulation de la configuration
 */
function confirmerAnnulation() {
    if (confirm('Es-tu sûr de vouloir annuler la configuration ? Tes réponses seront perdues.')) {
        fermerModalConversationnel();
    }
}

/**
 * Exécute une action spéciale (import données demo, etc.)
 */
async function executerAction(question) {
    console.log(`[Primo] Exécution de l'action: ${question.action}`);

    try {
        // Afficher un indicateur de chargement
        const statusDiv = document.getElementById('action-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
                <div style="font-size: 1rem; color: var(--gris-fonce);">
                    ${question.texte || 'Exécution en cours...'}
                </div>
            `;
        }

        // Exécuter l'action selon son type
        if (question.action === 'importerDonneesDemo') {
            await importerDonneesDemo();
        } else if (question.action === 'importerMaterielPedagogique') {
            await importerMaterielPedagogique();
        } else if (question.action === 'importerEchelleIDME') {
            await importerEchelleIDME();
        } else if (question.action === 'creerProduction') {
            await creerProduction();
        } else if (question.action === 'passerEnModeNotification') {
            // Action spéciale : passer en mode notification
            passerEnModeNotification();
            return; // Pas besoin de continuer l'exécution normale
        }

        // Succès - afficher confirmation
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 10px;">✅</div>
                <div style="font-size: 1rem; color: var(--gris-fonce);">
                    Action terminée avec succès !
                </div>
            `;
        }

        // Passer à la question suivante après 1.5 secondes
        setTimeout(() => {
            indexQuestionActuelle++;
            afficherQuestionActuelle();
        }, 1500);

    } catch (error) {
        console.error(`[Primo] Erreur lors de l'exécution de l'action ${question.action}:`, error);

        // Afficher l'erreur
        const statusDiv = document.getElementById('action-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                <div style="font-size: 1rem; color: var(--rouge);">
                    Erreur lors de l'exécution : ${error.message}
                </div>
                <button onclick="indexQuestionActuelle++; afficherQuestionActuelle();" style="
                    margin-top: 15px;
                    padding: 10px 20px;
                    background: var(--bleu-principal);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Continuer quand même</button>
            `;
        }
    }
}

/**
 * Importe les données de démonstration
 */
async function importerDonneesDemo() {
    console.log('[Primo] Import des données de démonstration...');

    try {
        // Charger le fichier donnees-demo.json
        const response = await fetch('donnees-demo.json');
        if (!response.ok) {
            throw new Error('Impossible de charger donnees-demo.json');
        }

        const donnees = await response.json();

        // Importer les données via la fonction existante
        if (typeof importerDonnees === 'function') {
            await importerDonnees(donnees);
            console.log('[Primo] ✅ Données de démonstration importées avec succès');
        } else {
            throw new Error('Fonction importerDonnees non disponible');
        }

    } catch (error) {
        console.error('[Primo] Erreur import données demo:', error);
        throw error;
    }
}

/**
 * Importe le matériel pédagogique (échelle, grille, cartouches)
 */
async function importerMaterielPedagogique() {
    console.log('[Primo] 🚀 Import du matériel pédagogique...');

    let compteur = 0;

    try {
        // 1. Importer l'échelle IDME
        console.log('[Primo] 📥 Import échelle IDME...');
        const responseEchelle = await fetch('materiel-demo/echelle-idme.json');
        if (!responseEchelle.ok) throw new Error('Échelle IDME introuvable');
        const echelleData = await responseEchelle.json();

        // Extraire l'échelle du nouveau format { metadata, contenu }
        const echelle = echelleData.contenu || echelleData.echelle || echelleData;
        const echelles = db.getSync('echelles', []);

        // Vérifier si l'échelle existe déjà
        const index = echelles.findIndex(e => e.id === echelle.id);
        if (index !== -1) {
            echelles[index] = echelle; // Remplacer
        } else {
            echelles.push(echelle); // Ajouter
        }

        db.setSync('echelles', echelles);
        compteur++;
        console.log('[Primo] ✅ Échelle IDME importée');

        // 2. Importer la grille SRPNF
        console.log('[Primo] 📥 Import grille SRPNF...');
        const responseGrille = await fetch('materiel-demo/grille-srpnf.json');
        if (!responseGrille.ok) throw new Error('Grille SRPNF introuvable');
        const grilleData = await responseGrille.json();

        // Extraire la grille du nouveau format { metadata, contenu }
        const grille = grilleData.contenu || grilleData.grille || grilleData;
        const grilles = db.getSync('grillesTemplates', []);

        // Vérifier si la grille existe déjà
        const indexGrille = grilles.findIndex(g => g.id === grille.id);
        if (indexGrille !== -1) {
            grilles[indexGrille] = grille; // Remplacer
        } else {
            grilles.push(grille); // Ajouter
        }

        db.setSync('grillesTemplates', grilles);
        compteur++;
        console.log('[Primo] ✅ Grille SRPNF importée');

        // 3. Importer les cartouches
        console.log('[Primo] 📥 Import cartouches SRPNF...');
        const responseCartouches = await fetch('materiel-demo/cartouches-srpnf.json');
        if (!responseCartouches.ok) throw new Error('Cartouches SRPNF introuvables');
        const cartouchesData = await responseCartouches.json();

        // Extraire la cartouche du nouveau format { metadata, contenu }
        const cartouche = cartouchesData.contenu || cartouchesData.cartouche || cartouchesData;
        const cleCartouche = `cartouches_${cartouche.grilleId}`;
        const cartouchesExistantes = db.getSync(cleCartouche, []);

        // Vérifier si la cartouche existe déjà
        const indexCartouche = cartouchesExistantes.findIndex(c => c.id === cartouche.id);
        if (indexCartouche !== -1) {
            cartouchesExistantes[indexCartouche] = cartouche; // Remplacer
        } else {
            cartouchesExistantes.push(cartouche); // Ajouter
        }

        db.setSync(cleCartouche, cartouchesExistantes);
        compteur++;
        console.log('[Primo] ✅ Cartouches SRPNF importées');

        console.log(`[Primo] 🎉 Matériel pédagogique importé avec succès (${compteur}/3)`);

    } catch (error) {
        console.error('[Primo] ❌ Erreur import matériel pédagogique:', error);
        throw new Error(`Import échoué: ${error.message}`);
    }
}

/**
 * Importe uniquement l'échelle IDME
 */
async function importerEchelleIDME() {
    console.log('[Primo] 🚀 Import de l\'échelle IDME...');

    try {
        // Importer l'échelle IDME
        console.log('[Primo] 📥 Import échelle IDME...');
        const responseEchelle = await fetch('materiel-demo/echelle-idme.json');
        if (!responseEchelle.ok) throw new Error('Échelle IDME introuvable');
        const echelleData = await responseEchelle.json();

        // Extraire l'échelle du nouveau format { metadata, contenu }
        const echelle = echelleData.contenu || echelleData.echelle || echelleData;
        const echelles = db.getSync('echelles', []);

        // Vérifier si l'échelle existe déjà
        const index = echelles.findIndex(e => e.id === echelle.id);
        if (index !== -1) {
            echelles[index] = echelle; // Remplacer
        } else {
            echelles.push(echelle); // Ajouter
        }

        db.setSync('echelles', echelles);
        console.log('[Primo] ✅ Échelle IDME importée avec succès');

    } catch (error) {
        console.error('[Primo] ❌ Erreur import échelle IDME:', error);
        throw new Error(`Import échoué: ${error.message}`);
    }
}

/**
 * Crée une production automatiquement avec les données collectées par Primo
 */
async function creerProduction() {
    console.log('[Primo] 🚀 Création de la production...');

    try {
        // Récupérer les données saisies par l'utilisateur
        const titre = reponsesPrimo['production-titre'] || 'Test de connaissances';
        const description = reponsesPrimo['production-description'] || 'Évaluation des connaissances';
        const ponderation = parseInt(reponsesPrimo['production-ponderation']) || 10;

        console.log('[Primo] 📝 Données production:', { titre, description, ponderation });

        // Trouver la grille SRPNF importée
        const grillesTemplates = db.getSync('grillesTemplates', []);
        const grilleSRPNF = grillesTemplates.find(g => g.id === 'grille-srpnf' || g.nom.includes('SRPNF'));

        if (!grilleSRPNF) {
            throw new Error('Grille SRPNF non trouvée. Assure-toi que l\'import du matériel pédagogique a fonctionné.');
        }

        console.log('[Primo] 📋 Grille SRPNF trouvée:', grilleSRPNF.id);

        // Créer l'objet production
        const nouvelleProduction = {
            id: 'PROD-PRIMO-' + Date.now(),
            titre,
            description,
            type: 'quiz',
            ponderation,
            objectif: '',
            tache: '',
            grilleId: grilleSRPNF.id,
            verrouille: false
        };

        console.log('[Primo] 💾 Objet production créé:', nouvelleProduction);

        // Ajouter la production dans localStorage
        const productions = db.getSync('productions', []);
        productions.push(nouvelleProduction);
        db.setSync('productions', productions);

        console.log('[Primo] ✅ Production créée avec succès:', titre);

        // Sauvegarder l'ID pour référence future
        reponsesPrimo.productionCreeeId = nouvelleProduction.id;

    } catch (error) {
        console.error('[Primo] ❌ Erreur création production:', error);
        throw new Error(`Création production échouée: ${error.message}`);
    }
}

// ============================================================================
// RÉCUPÉRATION ET PRÉ-REMPLISSAGE
// ============================================================================

/**
 * Récupère la réponse de la question actuelle
 */
function recupererReponse(question) {
    const inputId = 'primo-input-' + question.id;

    switch (question.type) {
        case 'text':
        case 'number':
        case 'date':
        case 'time':
        case 'textarea':
        case 'select':
            const input = document.getElementById(inputId);
            return input ? input.value : '';

        case 'radio':
            const radio = document.querySelector(`input[name="${inputId}"]:checked`);
            return radio ? radio.value : '';

        case 'message':
            return 'ok'; // Pas de réponse nécessaire

        default:
            return '';
    }
}

/**
 * Pré-remplit un champ avec une réponse existante
 */
function preremplirReponse(questionId, valeur) {
    const inputId = 'primo-input-' + questionId;
    const question = obtenirQuestion(questionId);

    if (!question) return;

    switch (question.type) {
        case 'text':
        case 'number':
        case 'date':
        case 'time':
        case 'textarea':
        case 'select':
            const input = document.getElementById(inputId);
            if (input) input.value = valeur;
            break;

        case 'radio':
            const radio = document.querySelector(`input[name="${inputId}"][value="${valeur}"]`);
            if (radio) {
                radio.checked = true;
                // Appliquer le style sélectionné
                radio.parentElement.style.background = 'var(--bleu-tres-pale)';
                radio.parentElement.style.borderColor = 'var(--bleu-principal)';
            }
            break;
    }
}

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

/**
 * Affiche un message d'erreur
 */
function afficherErreur(message) {
    const zoneErreur = document.getElementById('primo-erreur');
    if (zoneErreur) {
        zoneErreur.textContent = '⚠️ ' + message;
        zoneErreur.style.display = 'block';

        // Masquer après 5 secondes
        setTimeout(() => {
            zoneErreur.style.display = 'none';
        }, 5000);
    }
}

// ============================================================================
// FINALISATION
// ============================================================================

/**
 * Convertit les données horaireHebdomadaire en tableau seancesHoraire
 * Format Primo → Format attendu par horaire.js
 */
function creerSeancesHoraire() {
    const horaire = db.getSync('horaireHebdomadaire', null);
    if (!horaire || !horaire.nombreSeances) {
        console.log('[Primo] Aucun horaire à convertir');
        return;
    }

    const seances = [];
    const lettres = ['A', 'B', 'C'];
    const nbSeances = parseInt(horaire.nombreSeances) || 1;

    for (let i = 1; i <= nbSeances; i++) {
        const jour = horaire[`jour${i}`];
        const heureDebut = horaire[`heure${i}Debut`];
        const heureFin = horaire[`heure${i}Fin`];

        if (jour && heureDebut && heureFin) {
            // Calculer la durée en heures (décimal)
            const debut = heureDebut.split(':');
            const fin = heureFin.split(':');
            const debutMinutes = parseInt(debut[0]) * 60 + parseInt(debut[1]);
            const finMinutes = parseInt(fin[0]) * 60 + parseInt(fin[1]);
            const dureeMinutes = finMinutes - debutMinutes;
            const dureeHeures = dureeMinutes / 60;

            seances.push({
                lettre: lettres[i - 1] || `S${i}`,
                groupe: '',  // Vide par défaut
                jour: jour,
                debut: heureDebut,
                duree: dureeHeures,
                local: ''  // Pas demandé dans Primo pour l'instant
            });
        }
    }

    if (seances.length > 0) {
        db.setSync('seancesHoraire', seances);
        console.log(`[Primo] ${seances.length} séance(s) créée(s):`, seances);
    }
}

/**
 * Termine la configuration et sauvegarde toutes les réponses
 */
async function terminerConfiguration() {
    console.log('[Primo] Configuration terminée !');
    console.log('[Primo] Réponses collectées:', reponsesPrimo);

    // Sauvegarder toutes les réponses dans localStorage
    sauvegarderReponses(reponsesPrimo);

    // Créer le tableau de séances à partir de horaireHebdomadaire
    creerSeancesHoraire();

    // Créer le cours initial dans listeCours
    creerCoursInitial(reponsesPrimo);

    // Générer le calendrier complet à partir des données du trimestre
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
        console.log('[Primo] Calendrier complet généré');
    }

    // Générer les séances complètes à partir de l'horaire
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
        console.log('[Primo] Séances complètes générées');
    }

    // Importer le matériel pédagogique de démarrage (asynchrone)
    await importerMaterielDemarrage();

    // Définir le mode de travail sur "simulation" (Mode Assisté)
    // L'utilisateur qui utilise Primo est nécessairement en mode assisté
    db.setSync('modeApplication', 'simulation');
    console.log('[Primo] Mode de travail défini sur "simulation" (Mode Assisté)');

    // Afficher notification de succès
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(
            'Configuration terminée ! 🎉',
            'Ton application est maintenant prête à l\'emploi !'
        );
    }

    // Fermer le modal
    fermerModalConversationnel();

    // Marquer l'accueil comme vu
    if (typeof marquerAccueilVu === 'function') {
        marquerAccueilVu();
    }

    // Recharger l'interface pour refléter les changements
    setTimeout(() => {
        location.reload();
    }, 1500);
}

/**
 * Sauvegarde toutes les réponses dans localStorage
 */
function sauvegarderReponses(reponses) {
    const questionsActives = obtenirQuestionsActives(reponses);

    questionsActives.forEach(question => {
        // Pour les questions de type 'instruction' avec valeurFixe, utiliser cette valeur
        if (question.type === 'instruction' && question.champsCibles) {
            question.champsCibles.forEach(cible => {
                if (cible.valeurFixe !== undefined) {
                    console.log(`[Primo] Sauvegarde valeur fixe pour ${question.id}:`, cible.valeurFixe);
                    sauvegarderChamp(cible, cible.valeurFixe);
                }
            });
            return;
        }

        const valeur = reponses[question.id];
        if (!valeur) return;

        // Transformer la valeur si nécessaire
        const valeurTransformee = transformerReponse(question.id, valeur);

        // Sauvegarder dans les champs cibles
        question.champsCibles.forEach(cible => {
            sauvegarderChamp(cible, valeurTransformee);
        });
    });

    console.log('[Primo] Toutes les réponses ont été sauvegardées dans localStorage');
}

/**
 * Transforme une réponse selon la fonction transformation de la question
 */
function transformerReponse(questionId, valeur) {
    const question = obtenirQuestion(questionId);

    if (question && typeof question.transformation === 'function') {
        console.log(`[Primo] Transformation appliquée pour ${questionId}`);
        return question.transformation(valeur);
    }

    return valeur;
}

/**
 * Sauvegarde un champ dans localStorage
 */
function sauvegarderChamp(cible, valeur) {
    const { cle, champ } = cible;

    if (champ === null) {
        // Sauvegarde directe (ex: groupeEtudiants)
        db.setSync(cle, valeur);
    } else {
        // Sauvegarde dans un objet (ex: infoCours.enseignant)
        let objet = db.getSync(cle, {});
        objet[champ] = valeur;
        db.setSync(cle, objet);
    }

    console.log(`[Primo] Sauvegardé: ${cle}${champ ? '.' + champ : ''} =`, valeur);
}

/**
 * Crée l'échelle IDME par défaut
 */
function creerEchelleIDMEParDefaut() {
    const echelleExistante = db.getSync('echellePerformance', null);

    if (echelleExistante) {
        console.log('[Primo] Échelle IDME déjà configurée');
        return;
    }

    // Créer l'échelle IDME par défaut
    const echelleIDME = {
        id: 'echelle-idme-defaut',
        nom: 'IDME (Insuffisant, Développement, Maîtrisé, Étendu)',
        niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeur: 50, couleur: '#ef5350' },
            { code: 'D', nom: 'Développement', min: 65, max: 74, valeur: 69.5, couleur: '#ffa726' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeur: 79.5, couleur: '#66bb6a' },
            { code: 'E', nom: 'Étendu', min: 85, max: 100, valeur: 92.5, couleur: '#42a5f5' }
        ],
        dateCreation: new Date().toISOString()
    };

    db.setSync('echellePerformance', echelleIDME);
    console.log('[Primo] Échelle IDME créée par défaut');
}

/**
 * Importe le matériel pédagogique de démarrage (échelle IDME + grille SRPNF + cartouches)
 */
async function importerMaterielDemarrage() {
    console.log('[Primo] 🚀 Début import matériel de démarrage...');

    // Vérifier si du matériel existe déjà
    const echellesExistantes = db.getSync('echellesTemplates', []);
    const grillesExistantes = db.getSync('grillesTemplates', []);

    console.log('[Primo] 🔍 Vérification matériel existant:', {
        echelles: echellesExistantes.length,
        grilles: grillesExistantes.length
    });

    if (echellesExistantes.length > 0 || grillesExistantes.length > 0) {
        console.log('[Primo] ⏭️ Matériel pédagogique déjà présent, import annulé');
        console.log('[Primo] Échelles existantes:', echellesExistantes);
        console.log('[Primo] Grilles existantes:', grillesExistantes);
        return;
    }

    try {
        // Charger le fichier materiel-demarrage.json
        console.log('[Primo] 📥 Chargement de materiel-demarrage.json...');
        const response = await fetch('materiel-demarrage.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        const config = await response.json();
        console.log('[Primo] 📦 Fichier chargé:', config.metadata?.nom);

        const contenu = config.contenu;
        let nbImporte = 0;

        // Importer les échelles
        if (contenu.echelles && contenu.echelles.length > 0) {
            db.setSync('echellesTemplates', contenu.echelles);
            nbImporte += contenu.echelles.length;
            console.log(`[Primo] ✅ ${contenu.echelles.length} échelle(s) importée(s)`);
        }

        // Importer les grilles
        if (contenu.grilles && contenu.grilles.length > 0) {
            db.setSync('grillesTemplates', contenu.grilles);
            nbImporte += contenu.grilles.length;
            console.log(`[Primo] ✅ ${contenu.grilles.length} grille(s) importée(s)`);
        }

        // Importer les cartouches
        if (contenu.cartouches && contenu.cartouches.length > 0) {
            // Les cartouches sont stockées par grilleId sous forme de tableau
            contenu.cartouches.forEach(cartouche => {
                const cle = `cartouches_${cartouche.grilleId}`;
                db.setSync(cle, [cartouche]);
                nbImporte++;
                console.log(`[Primo] ✅ Cartouche importée pour grille ${cartouche.grilleId}`);
            });
        }

        console.log(`[Primo] 🎉 Matériel pédagogique importé: ${nbImporte} ressources`);

        // Notification à l'utilisateur
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(
                'Matériel pédagogique installé',
                `${nbImporte} ressources importées (échelle, grille, cartouches)`
            );
        }

    } catch (erreur) {
        console.error('[Primo] ❌ Erreur import matériel de démarrage:', erreur);
        console.error('[Primo] Détails:', erreur.message, erreur.stack);

        // Notification d'erreur à l'utilisateur
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur(
                'Import partiel',
                'Le matériel de base n\'a pas pu être importé. Vous pourrez l\'ajouter manuellement plus tard.'
            );
        }

        // Fallback: créer au moins l'échelle IDME
        creerEchelleIDMEParDefaut();
    }
}

/**
 * Crée le cours initial à partir des réponses de Primo
 */
function creerCoursInitial(reponses) {
    const cours = db.getSync('listeCours', []);

    // Créer le nouveau cours
    const nouveauCours = {
        id: 'COURS' + Date.now(),
        codeCours: '',  // Pas demandé par Primo (optionnel)
        nomCours: reponses['titre-cours'] || '',
        numeroCompetence: '',  // Pas demandé par Primo (optionnel)
        competence: '',  // Pas demandé par Primo (optionnel)
        elementsCompetence: '',  // Pas demandé par Primo (optionnel)
        prenomEnseignant: reponses['nom-utilisateur'] || '',
        nomEnseignant: '',  // Pas demandé par Primo (optionnel)
        departement: '',  // Pas demandé par Primo (optionnel)
        local: '',  // Pas demandé par Primo (optionnel)
        session: reponses['trimestre'] || '',
        annee: reponses['annee'] || '',
        heuresParSemaine: '',  // Calculé à partir de l'horaire (optionnel)
        formatHoraire: '',  // Calculé à partir de l'horaire (optionnel)
        pratiqueId: reponses['pratique-notation'] || 'pan-maitrise',
        verrouille: false,
        actif: true,  // Premier cours = actif par défaut
        dateEnregistrement: new Date().toISOString()
    };

    // Ajouter le cours
    cours.push(nouveauCours);
    db.setSync('listeCours', cours);

    console.log('[Primo] Cours initial créé:', nouveauCours);
}

// ============================================================================
// MODE NOTIFICATION (PHASE 2 : PRATIQUE GUIDÉE)
// ============================================================================

let modeNotification = false;

/**
 * Passe du mode modal au mode notification
 */
function passerEnModeNotification() {
    console.log('[Primo] 🔄 Passage en mode notification');

    modeNotification = true;

    // Fermer le modal
    const modal = document.getElementById('modal-primo-conversation');
    if (modal) {
        modal.remove();
    }

    // Créer le conteneur de notifications (coin supérieur droit)
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'primo-notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-width: 90vw;
        z-index: 9999;
        pointer-events: none;
    `;

    document.body.appendChild(notificationContainer);

    // Créer le bouton "Suivant" flottant (bas à droite)
    const boutonSuivant = document.createElement('button');
    boutonSuivant.id = 'primo-bouton-suivant';
    boutonSuivant.innerHTML = 'Suivant →';
    boutonSuivant.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 30px;
        background: linear-gradient(135deg, #1a5266, #2d7a8c);
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(26, 82, 102, 0.4);
        z-index: 9998;
        transition: all 0.3s;
        pointer-events: auto;
    `;

    boutonSuivant.onmouseover = function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 25px rgba(26, 82, 102, 0.5)';
    };

    boutonSuivant.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 20px rgba(26, 82, 102, 0.4)';
    };

    boutonSuivant.onclick = primoQuestionSuivante;

    document.body.appendChild(boutonSuivant);

    // Afficher la première notification
    afficherNotificationActuelle();
}

/**
 * Affiche la notification correspondant à la question actuelle
 */
function afficherNotificationActuelle() {
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);
    const question = questionsActives[indexQuestionActuelle];

    if (!question) {
        console.log('[Primo] Fin du mode notification');
        revenirEnModeModal();
        return;
    }

    const container = document.getElementById('primo-notification-container');
    if (!container) return;

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'primo-notification';
    notification.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        border-left: 4px solid var(--bleu-principal);
        pointer-events: auto;
        animation: slideInRight 0.4s ease-out;
    `;

    // Icône Primo (petit)
    const icone = document.createElement('div');
    icone.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #1a5266, #2d7a8c);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: white;
        float: left;
        margin-right: 15px;
    `;
    icone.innerHTML = '😎';

    // Bouton fermer
    const boutonFermer = document.createElement('button');
    boutonFermer.innerHTML = '×';
    boutonFermer.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--gris-moyen);
        cursor: pointer;
        padding: 5px 10px;
        line-height: 1;
        transition: color 0.2s;
    `;
    boutonFermer.onmouseover = () => boutonFermer.style.color = 'var(--gris-fonce)';
    boutonFermer.onmouseout = () => boutonFermer.style.color = 'var(--gris-moyen)';
    boutonFermer.onclick = () => notification.remove();

    // Texte de la notification (Markdown simplifié + interpolation variables)
    const texte = document.createElement('div');
    texte.style.cssText = `
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--gris-fonce);
        margin-top: 5px;
    `;

    // Interpoler les variables {{tutoriel.xxx}}
    let texteRendu = question.texte;
    texteRendu = texteRendu.replace(/\{\{tutoriel\.productionTitre\}\}/g, reponsesPrimo['production-titre'] || 'ta production');
    texteRendu = texteRendu.replace(/\{\{tutoriel\.productionDescription\}\}/g, reponsesPrimo['production-description'] || '');
    texteRendu = texteRendu.replace(/\{\{tutoriel\.productionPonderation\}\}/g, reponsesPrimo['production-ponderation'] || '10');

    texte.innerHTML = texteRendu
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    notification.style.position = 'relative';
    notification.appendChild(boutonFermer);
    notification.appendChild(icone);
    notification.appendChild(texte);

    // Vider le container et ajouter la nouvelle notification
    container.innerHTML = '';
    container.appendChild(notification);
}

/**
 * Revient au mode modal pour la conclusion
 */
function revenirEnModeModal() {
    console.log('[Primo] 🔄 Retour en mode modal pour conclusion');

    modeNotification = false;

    // Supprimer les éléments du mode notification
    const container = document.getElementById('primo-notification-container');
    const boutonSuivant = document.getElementById('primo-bouton-suivant');

    if (container) container.remove();
    if (boutonSuivant) boutonSuivant.remove();

    // Créer le modal SANS réinitialiser l'état
    const modal = document.createElement('div');
    modal.id = 'modal-primo-conversation';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in-out;
    `;

    modal.innerHTML = `
        <div id="primo-conversation-contenu" style="
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.4s ease-out;
        ">
        </div>
    `;

    document.body.appendChild(modal);
    modalPrimoActif = true;

    // Afficher la question actuelle (sans réinitialiser l'index)
    afficherQuestionActuelle();
}

// Animation slideInRight
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// ============================================================================
// EXPORTS
// ============================================================================

window.ouvrirModalConversationnel = ouvrirModalConversationnel;
window.fermerModalConversationnel = fermerModalConversationnel;
window.primoQuestionSuivante = primoQuestionSuivante;
window.primoQuestionPrecedente = primoQuestionPrecedente;
window.confirmerAnnulation = confirmerAnnulation;
window.terminerConfiguration = terminerConfiguration;
window.passerEnModeNotification = passerEnModeNotification;

console.log('✅ Module primo-modal.js chargé');
