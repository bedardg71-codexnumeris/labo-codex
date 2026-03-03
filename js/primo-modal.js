/**
 * PRIMO MODAL - Interface conversationnelle
 *
 * Gère l'affichage du modal conversationnel de Primo qui pose les questions
 * une par une et remplit automatiquement les formulaires de Réglages.
 *
 * VERSION : 1.1
 * DATE : 26 décembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex) avec Claude
 *
 * CHANGELOG :
 * - 1.1 (26 déc 2025) : Support texte dynamique et actionApres (Beta 95)
 *   - Question.texte peut être une fonction(reponses) pour texte dynamique
 *   - Question.actionApres exécuté après sauvegarde (ex: appliquer modèle)
 * - 1.0 (27 nov 2025) : Version initiale
 */

(function() {
'use strict';

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
function ouvrirModalConversationnel(indexDepart = 0, reponsesInitiales = null) {
    // Réinitialiser l'état
    indexQuestionActuelle = indexDepart;
    reponsesPrimo = reponsesInitiales || {};
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
            background: var(--surface-conteneur, #162c36);
            border-radius: var(--primo-border-radius, 12px);
            padding: var(--primo-padding, 35px);
            width: var(--primo-modal-width, 700px);
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
        /* Variables CSS pour Primo */
        :root {
            --primo-modal-width: 500px;
            --primo-padding: 35px;
            --primo-spacing-sm: 10px;
            --primo-spacing-md: 20px;
            --primo-spacing-lg: 30px;
            --primo-border-radius: 12px;
        }

        /* Animations */
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

        /* Barre de progression Primo */
        .primo-progress-bar {
            position: sticky;
            top: 0;
            background: var(--surface-conteneur, #162c36);
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--bordure-claire);
            z-index: 100;
        }
        .primo-progress-track {
            height: 6px;
            background: var(--gris-tres-pale);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .primo-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent-primaire), #2d7a8c);
            border-radius: 3px;
            transition: width 0.4s ease-out;
        }
        .primo-progress-text {
            font-size: 0.8rem;
            color: var(--gris-moyen);
            text-align: center;
        }

        /* Typographie améliorée pour les instructions */
        #primo-conversation-contenu h3 {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--accent-primaire);
            margin: 20px 0 12px 0;
            line-height: 1.4;
        }

        #primo-conversation-contenu p {
            line-height: 1.6;
            margin-bottom: 12px;
        }

        #primo-conversation-contenu code {
            background: var(--gris-tres-pale);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
            color: var(--gris-fonce);
        }

        #primo-conversation-contenu pre {
            background: var(--gris-tres-pale);
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 12px 0;
        }

        #primo-conversation-contenu ul,
        #primo-conversation-contenu ol {
            margin: 12px 0;
            padding-left: 25px;
        }

        #primo-conversation-contenu li {
            margin-bottom: 8px;
            line-height: 1.6;
        }

        #primo-conversation-contenu ol li {
            padding-left: 8px;
        }

        #primo-conversation-contenu strong {
            color: var(--accent-primaire);
            font-weight: 600;
        }

        /* Cartes d'instruction */
        .primo-instruction-card {
            background: var(--bleu-tres-pale);
            border-left: 4px solid var(--accent-primaire);
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }

        /* Badge d'étape complétée */
        .primo-step-completed {
            display: inline-block;
            background: var(--vert-success);
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
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
        console.log('[Guide] Question type action détectée - déclenchement automatique');
        // Petit délai pour que l'utilisateur voie le message
        setTimeout(() => {
            executerAction(question);
        }, 500);
    }
}

/**
 * Parse le markdown simple dans le texte
 * Gère: **bold**, bullet points, numérotation
 */
function parserMarkdownSimple(texte) {
    if (!texte) return '';

    // Convertir **bold** en <strong>
    texte = texte.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir lignes commençant par - en liste à puces
    texte = texte.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Convertir lignes commençant par chiffre. en liste numérotée
    texte = texte.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

    return texte;
}

/**
 * Calcule le nombre d'étapes du parcours en cours
 * @param {Array} questionsActives - Tableau des questions actives
 * @param {number} indexActuel - Index de la question actuelle
 * @returns {Object} - { indexDansParcours, totalParcours, titre }
 */
function calculerInfosParcours(questionsActives, indexActuel) {
    // Trouver les indices des fins de parcours
    const indexFinParcoursCourt = questionsActives.findIndex(q => q.finParcoursCourt);
    const indexMaterielIntro = questionsActives.findIndex(q => q.id === 'materiel-intro');
    const indexFinParcoursMateriel = questionsActives.findIndex(q => q.finParcoursMateriel);

    let indexDansParcours, totalParcours, titre;

    // Déterminer dans quel parcours on se trouve
    if (indexMaterielIntro !== -1 && indexFinParcoursMateriel !== -1 && indexActuel >= indexMaterielIntro && indexActuel <= indexFinParcoursMateriel) {
        // MODULE MATÉRIEL : Créer du matériel pédagogique
        // materiel-intro (détection) est exécutée en amont et masquée → on l'exclut du compteur
        indexDansParcours = indexActuel - indexMaterielIntro;
        totalParcours = indexFinParcoursMateriel - indexMaterielIntro;
        titre = 'Création de matériel pédagogique';
    } else if (indexFinParcoursCourt !== -1 && indexActuel <= indexFinParcoursCourt) {
        // MODULE 1 : Créer un groupe-cours (parcours court)
        indexDansParcours = indexActuel + 1;
        totalParcours = indexFinParcoursCourt + 1;
        titre = 'Configuration du groupe-cours';
    } else {
        // MODULE 1 étendu
        indexDansParcours = indexActuel + 1;
        totalParcours = questionsActives.length;
        titre = 'Configuration du groupe-cours';
    }

    return { indexDansParcours, totalParcours, titre };
}

/**
 * Génère le HTML pour une question
 */
function genererHTMLQuestion(question) {
    let html = '';

    // En-tête du parcours
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);
    const infos = calculerInfosParcours(questionsActives, indexQuestionActuelle);
    const etapeTexte = `Étape ${infos.indexDansParcours}/${infos.totalParcours}`;
    const titreModule = infos.titre;

    html += `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <div style="
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #1a5266, #2d7a8c);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                box-shadow: 0 4px 15px rgba(26, 82, 102, 0.3);
                flex-shrink: 0;
            ">
                🗺️
            </div>
            <div style="flex: 1;">
                <h2 style="margin: 0 0 5px 0; font-size: 1.5rem; color: var(--accent-primaire);">${titreModule}</h2>
                <p style="margin: 0; color: var(--gris-moyen); font-size: 0.9rem;">
                    <strong style="color: var(--accent-primaire);">${etapeTexte}</strong>
                </p>
            </div>
        </div>
    `;

    // Question (avec parsing markdown) - Support texte dynamique (Beta 95)
    let texteQuestion = question.texte;
    if (typeof texteQuestion === 'function') {
        texteQuestion = texteQuestion(reponsesPrimo);
    }
    const texteFormate = parserMarkdownSimple(texteQuestion);

    html += `
        <div style="margin-bottom: var(--primo-spacing-lg, 30px);">
            <div style="
                font-size: 1.05rem;
                color: var(--gris-fonce);
                line-height: 1.6;
                white-space: pre-line;
                margin-bottom: var(--primo-spacing-md, 20px);
            ">${texteFormate}</div>
    `;

    // Input selon le type
    html += genererInputQuestion(question);

    // Aide si présente (avec parsing markdown)
    if (question.aide) {
        const aideFormatee = parserMarkdownSimple(question.aide);
        html += `
            <div style="
                margin-top: var(--primo-spacing-sm, 10px);
                padding: 12px 15px;
                background: var(--bleu-tres-pale);
                border-left: 4px solid var(--accent-primaire);
                border-radius: 6px;
                font-size: 0.9rem;
                color: var(--gris-fonce);
                line-height: 1.5;
            ">
                💡 ${aideFormatee}
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
                    onfocus="this.style.borderColor='var(--accent-primaire)'"
                    onblur="this.style.borderColor='var(--bordure-claire)'"
                />
            `;
            break;

        case 'number':
            html += `
                <input type="number" id="${inputId}"
                    placeholder="${question.placeholder || ''}"
                    value="${question.valeurDefaut || ''}"
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
                    onfocus="this.style.borderColor='var(--accent-primaire)'"
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
                    onfocus="this.style.borderColor='var(--accent-primaire)'"
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
                    onfocus="this.style.borderColor='var(--accent-primaire)'"
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
                    onfocus="this.style.borderColor='var(--accent-primaire)'"
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
                background: var(--surface-conteneur, #162c36);
                cursor: pointer;
                transition: border-color 0.2s;
            "
            onfocus="this.style.borderColor='var(--accent-primaire)'"
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
                    : `onmouseover="this.style.background='var(--bleu-tres-pale)'; this.style.borderColor='var(--accent-primaire)';"
                       onmouseout="if(!this.querySelector('input').checked) { this.style.background='var(--surface-conteneur)'; this.style.borderColor='var(--bordure-claire)'; }"`;

                html += `
                    <label style="${labelStyle}" ${hoverEvents}>
                        <input type="radio" name="${inputId}" value="${opt.value}"
                            style="margin-right: 10px;"
                            ${isDisabled ? 'disabled' : ''}
                            onchange="this.parentElement.parentElement.querySelectorAll('label').forEach(l => { if(!l.querySelector('input').disabled) { l.style.background='var(--surface-conteneur)'; l.style.borderColor='var(--bordure-claire)'; } }); this.parentElement.style.background='var(--bleu-tres-pale)'; this.parentElement.style.borderColor='var(--accent-primaire)';"
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

        case 'info':
            // Type informatif - affiche un message avec style distinct (Beta 95)
            // Utilisé pour les messages de confirmation ou d'information
            html += `
                <div style="
                    padding: 20px;
                    background: var(--bleu-tres-pale);
                    border-left: 4px solid var(--accent-primaire);
                    border-radius: 8px;
                    margin-top: 10px;
                ">
                    <div style="font-size: 1.2rem; margin-bottom: 8px;">ℹ️</div>
                    <div style="font-size: 0.95rem; color: var(--gris-fonce); line-height: 1.5;">
                        Ce message est informatif. Clique sur "Suivant" pour continuer.
                    </div>
                </div>
            `;
            break;

        case 'action':
            // Type spécial pour déclencher une action (import données demo, etc.)
            html += `
                <div id="action-status" style="
                    padding: 20px;
                    background: var(--bleu-tres-pale);
                    border-left: 4px solid var(--accent-primaire);
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

    let html = '<div style="display: flex; gap: var(--primo-spacing-sm, 10px); margin-top: var(--primo-spacing-lg, 30px);">';

    // Bouton Précédent
    if (!estPremiere) {
        html += `
            <button onclick="primoQuestionPrecedente()" style="
                flex: 1;
                padding: 8px 16px;
                background: var(--surface-conteneur, #162c36);
                color: var(--accent-primaire);
                border: 2px solid var(--accent-primaire);
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='var(--bleu-tres-pale)';"
               onmouseout="this.style.background='var(--surface-conteneur)';">
                ← Précédent
            </button>
        `;
    }

    // Bouton Suivant, Continuer ou Terminer
    if (question.type === 'message') {
        html += `
            <button onclick="terminerConfiguration().catch(err => console.error('[Guide] Erreur terminerConfiguration:', err))" style="
                flex: 2;
                padding: 8px 16px;
                background: linear-gradient(135deg, #1a5266, #2d7a8c);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
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
                padding: 8px 16px;
                background: var(--gris-clair);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
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
                padding: 8px 16px;
                background: linear-gradient(135deg, #1a5266, #2d7a8c);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
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
            padding: 8px 16px;
            background: var(--surface-conteneur, #162c36);
            color: var(--gris-moyen);
            border: 1px solid var(--bordure-claire);
            border-radius: 8px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        " onmouseover="this.style.background='var(--gris-tres-pale)'; this.style.borderColor='var(--gris-moyen)';"
           onmouseout="this.style.background='var(--surface-conteneur)'; this.style.borderColor='var(--bordure-claire)';">
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

    console.log('[Guide] primoQuestionSuivante() - Type:', question.type, 'ID:', question.id);

    // En mode notification, simplement avancer sans validation
    if (modeNotification) {
        console.log('[Guide] Mode notification - passage direct');
        indexQuestionActuelle++;
        afficherNotificationActuelle();

        // 🆕 BETA 92: Mettre à jour le bouton Précédent
        const btn = document.getElementById('primo-bouton-precedent');
        if (btn) {
            if (indexQuestionActuelle <= indexDepartModule) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }

        return;
    }

    // Pour les types 'instruction', 'message' et 'info', pas de validation nécessaire
    if (question.type === 'instruction' || question.type === 'message' || question.type === 'info') {
        console.log('[Guide] Type instruction/message/info - passage direct');
        indexQuestionActuelle++;
        afficherQuestionActuelle();
        return;
    }

    // Pour le type 'action', exécuter l'action puis passer à la suite
    if (question.type === 'action') {
        console.log('[Guide] Type action détecté - appel executerAction()');
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

    // Exécuter actionApres si définie (Beta 95 - pour appliquer modèles)
    if (question.actionApres && typeof question.actionApres === 'function') {
        try {
            question.actionApres(reponse, reponsesPrimo);
            console.log('[Guide] actionApres exécutée pour', question.id);
        } catch (e) {
            console.error('[Guide] Erreur dans actionApres:', e);
        }
    }

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
    if (confirm('Souhaites-tu vraiment annuler ? Les réponses non sauvegardées seront perdues.')) {
        fermerModalConversationnel();
    }
}

/**
 * Exécute une action spéciale (import données demo, etc.)
 */
async function executerAction(question) {
    console.log(`[Guide] Exécution de l'action: ${question.action}`);

    try {
        // Action spéciale : passer en mode notification (sans afficher de statut)
        if (question.action === 'passerEnModeNotification') {
            passerEnModeNotification();
            return; // Pas besoin de continuer l'exécution normale
        }

        // Afficher un indicateur de chargement (pour les autres actions)
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
            console.log('[Guide] importerDonneesDemo desactive (Chantier 1 — demantelement demo)');
        } else if (question.action === 'importerMaterielPedagogique') {
            await importerMaterielPedagogique();
        } else if (question.action === 'importerEchelleIDME') {
            await importerEchelleIDME();
        } else if (question.action === 'creerProduction') {
            await creerProduction();
        } else if (question.action === 'detecterContexteMateriel') {
            detecterContexteMateriel();
        } else if (question.action === 'creerEchelleDepuisParcours') {
            creerEchelleDepuisParcours();
        } else if (question.action === 'creerGrilleDepuisParcours') {
            creerGrilleDepuisParcours();
        } else if (question.action === 'creerProductionDepuisParcours') {
            creerProductionDepuisParcours();
        } else if (question.action === 'creerCartoucheDepuisParcours') {
            creerCartoucheDepuisParcours();
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
        console.error(`[Guide] Erreur lors de l'exécution de l'action ${question.action}:`, error);

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
                    background: var(--accent-primaire);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Continuer quand même</button>
            `;
        }
    }
}

// [Chantier 1 — 6 fev 2026] importerDonneesDemo supprimee (demantelement demo)

/**
 * Importe le matériel pédagogique (échelle, grille, cartouches)
 */
async function importerMaterielPedagogique() {
    console.log('[Guide] 🚀 Import du matériel pédagogique...');

    let compteur = 0;

    try {
        // 1. Importer l'échelle IDME
        console.log('[Guide] 📥 Import échelle IDME...');
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
        console.log('[Guide] ✅ Échelle IDME importée');

        // 2. Importer la grille SRPNF
        console.log('[Guide] 📥 Import grille SRPNF...');
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
        console.log('[Guide] ✅ Grille SRPNF importée');

        // 3. Importer les cartouches
        console.log('[Guide] 📥 Import cartouches SRPNF...');
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
        console.log('[Guide] ✅ Cartouches SRPNF importées');

        console.log(`[Guide] 🎉 Matériel pédagogique importé avec succès (${compteur}/3)`);

    } catch (error) {
        console.error('[Guide] ❌ Erreur import matériel pédagogique:', error);
        throw new Error(`Import échoué: ${error.message}`);
    }
}

/**
 * Importe uniquement l'échelle IDME
 */
async function importerEchelleIDME() {
    console.log('[Guide] 🚀 Import de l\'échelle IDME...');

    try {
        // Importer l'échelle IDME
        console.log('[Guide] 📥 Import échelle IDME...');
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
        console.log('[Guide] ✅ Échelle IDME importée avec succès');

    } catch (error) {
        console.error('[Guide] ❌ Erreur import échelle IDME:', error);
        throw new Error(`Import échoué: ${error.message}`);
    }
}

/**
 * Crée une production automatiquement avec les données collectées par Primo
 */
async function creerProduction() {
    console.log('[Guide] 🚀 Création de la production...');

    try {
        // Récupérer les données saisies par l'utilisateur
        const titre = reponsesPrimo['production-titre'] || 'Test de connaissances';
        const description = reponsesPrimo['production-description'] || 'Évaluation des connaissances';
        const ponderation = parseInt(reponsesPrimo['production-ponderation']) || 10;

        console.log('[Guide] 📝 Données production:', { titre, description, ponderation });

        // Trouver la grille SRPNF importée
        const grillesTemplates = db.getSync('grillesTemplates', []);
        const grilleSRPNF = grillesTemplates.find(g => g.id === 'grille-srpnf' || g.nom.includes('SRPNF'));

        if (!grilleSRPNF) {
            throw new Error('Grille SRPNF non trouvée. Assure-toi que l\'import du matériel pédagogique a fonctionné.');
        }

        console.log('[Guide] 📋 Grille SRPNF trouvée:', grilleSRPNF.id);

        // Créer l'objet production
        const nouvelleProduction = {
            id: genererIdUnique('PROD_'),
            titre,
            description,
            type: 'quiz',
            ponderation,
            objectif: '',
            tache: '',
            grilleId: grilleSRPNF.id,
            verrouille: false
        };

        console.log('[Guide] 💾 Objet production créé:', nouvelleProduction);

        // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Utiliser clé namespacée
        // Ajouter la production dans localStorage
        const cleProductions = cle('productions');
        const productions = db.getSync(cleProductions, []);
        productions.push(nouvelleProduction);
        db.setSync(cleProductions, productions);

        console.log('[Guide] ✅ Production créée avec succès:', titre);

        // Sauvegarder l'ID pour référence future
        reponsesPrimo.productionCreeeId = nouvelleProduction.id;

    } catch (error) {
        console.error('[Guide] ❌ Erreur création production:', error);
        throw new Error(`Création production échouée: ${error.message}`);
    }
}

// ============================================================================
// CRÉATION PROGRAMMATIQUE — MODULE MATÉRIEL (Beta 97.5+)
// Fonctions appelées par les questions type 'action' du parcours matériel
// ============================================================================

/**
 * Détecte le contexte de pratique pour le parcours matériel
 * Stocke le résultat dans reponsesPrimo['materiel-pratique-detectee']
 */
function detecterContexteMateriel() {
    var modalites = db.getSync('modalitesEvaluation', {});
    var pratique = modalites.pratique || null;

    if (!pratique) {
        reponsesPrimo['materiel-pratique-detectee'] = 'aucune';
    } else {
        reponsesPrimo['materiel-pratique-detectee'] = pratique;
    }

    console.log('[Guide] Pratique détectée pour module matériel:', reponsesPrimo['materiel-pratique-detectee']);
}

/**
 * Crée une échelle de performance depuis le parcours matériel
 * Modèles prédéfinis : IDME, ABCD. Personnalisé : depuis réponses M2a-M2c.
 * Patron : wizardV2CreerGrilleDemo() — lecture/écriture synchrone dans IndexedDB
 */
function creerEchelleDepuisParcours() {
    var choix = reponsesPrimo['materiel-echelle-choix'];
    var echelle;

    if (choix === 'idme') {
        echelle = {
            id: genererIdUnique('ECH_'),
            nom: 'IDME',
            niveaux: [
                { code: 'I', nom: 'Incomplet', couleur: '#ff9800', valeur: 50, min: 0, max: 64 },
                { code: 'D', nom: 'en Développement', couleur: '#ffc107', valeur: 69.5, min: 65, max: 74 },
                { code: 'M', nom: 'Maîtrisé', couleur: '#4caf50', valeur: 79.5, min: 75, max: 84 },
                { code: 'E', nom: 'Étendu', couleur: '#2196f3', valeur: 92.5, min: 85, max: 100 }
            ],
            dateCreation: new Date().toISOString()
        };
    } else if (choix === 'abcd') {
        echelle = {
            id: genererIdUnique('ECH_'),
            nom: 'ABCD',
            niveaux: [
                { code: 'D', nom: 'D', couleur: '#ff9800', valeur: 50, min: 0, max: 59 },
                { code: 'C', nom: 'C', couleur: '#ffc107', valeur: 65, min: 60, max: 69 },
                { code: 'B', nom: 'B', couleur: '#4caf50', valeur: 79.5, min: 70, max: 84 },
                { code: 'A', nom: 'A', couleur: '#2196f3', valeur: 92.5, min: 85, max: 100 }
            ],
            dateCreation: new Date().toISOString()
        };
    } else if (choix === 'personnaliser') {
        var nom = reponsesPrimo['materiel-echelle-nom'] || 'Échelle personnalisée';
        var nbNiveaux = parseInt(reponsesPrimo['materiel-echelle-niveaux']) || 4;
        var nomsNiveaux = (reponsesPrimo['materiel-echelle-noms-niveaux'] || '')
            .split('\n')
            .map(function(n) { return n.trim(); })
            .filter(function(n) { return n; });

        var couleurs = ['#ff9800', '#ffc107', '#4caf50', '#2196f3', '#9c27b0', '#e91e63'];
        var pas = 100 / nbNiveaux;

        var niveaux = [];
        for (var i = 0; i < nbNiveaux; i++) {
            var min = Math.round(i * pas);
            var max = i === nbNiveaux - 1 ? 100 : Math.round((i + 1) * pas) - 1;
            niveaux.push({
                code: (nomsNiveaux[i] || 'N' + (i + 1)).charAt(0).toUpperCase(),
                nom: nomsNiveaux[i] || 'Niveau ' + (i + 1),
                couleur: couleurs[i % couleurs.length],
                valeur: (min + max) / 2,
                min: min,
                max: max
            });
        }

        echelle = {
            id: genererIdUnique('ECH_'),
            nom: nom,
            niveaux: niveaux,
            dateCreation: new Date().toISOString()
        };
    }

    if (echelle) {
        var echelles = db.getSync('echellesTemplates', []);
        echelles.push(echelle);
        db.setSync('echellesTemplates', echelles);

        // Vérification post-création
        var echellesVerif = db.getSync('echellesTemplates', []);
        var trouvee = echellesVerif.find(function(e) { return e.id === echelle.id; });

        if (trouvee) {
            reponsesPrimo['materiel-echelle-id-cree'] = echelle.id;
            reponsesPrimo['materiel-echelle-nom-cree'] = echelle.nom;
            reponsesPrimo['materiel-echelle-nb-niveaux-crees'] = echelle.niveaux.length.toString();
            console.log('[Guide] ✅ Échelle créée:', echelle.nom, '(' + echelle.niveaux.length + ' niveaux)');
        } else {
            throw new Error('Échelle non trouvée après création dans IndexedDB');
        }
    }
}

/**
 * Crée une grille de critères depuis le parcours matériel
 * Modèle de base : 4 critères à 25%. Personnalisé : N critères depuis textarea.
 * Patron : wizardV2CreerGrilleDemo()
 */
function creerGrilleDepuisParcours() {
    var choix = reponsesPrimo['materiel-grille-choix'];
    var grille;

    if (choix === 'base') {
        grille = {
            id: genererIdUnique('GRILLE_'),
            nom: 'Grille de base',
            description: 'Grille générique avec 4 critères à pondération égale.',
            criteres: [
                { id: 'c1', nom: 'Compréhension du sujet', description: 'Démontrer une compréhension juste du sujet traité.', poids: 25 },
                { id: 'c2', nom: 'Qualité de la démarche', description: 'Appliquer une démarche méthodique et rigoureuse.', poids: 25 },
                { id: 'c3', nom: 'Communication', description: 'Présenter les résultats de façon claire et structurée.', poids: 25 },
                { id: 'c4', nom: 'Esprit critique', description: 'Porter un regard critique et nuancé sur la production.', poids: 25 }
            ],
            dateCreation: new Date().toISOString()
        };
    } else if (choix === 'personnaliser') {
        var nbCriteres = parseInt(reponsesPrimo['materiel-grille-nb-criteres']) || 4;
        var nomsCriteres = (reponsesPrimo['materiel-grille-noms-criteres'] || '')
            .split('\n')
            .map(function(n) { return n.trim(); })
            .filter(function(n) { return n; });

        var poidsEgal = Math.round(100 / nbCriteres * 100) / 100;
        var criteres = [];

        for (var i = 0; i < nbCriteres; i++) {
            criteres.push({
                id: 'c' + (i + 1),
                nom: nomsCriteres[i] || 'Critère ' + (i + 1),
                description: '',
                poids: i === nbCriteres - 1 ? Math.round((100 - poidsEgal * (nbCriteres - 1)) * 100) / 100 : poidsEgal
            });
        }

        grille = {
            id: genererIdUnique('GRILLE_'),
            nom: 'Grille personnalisée',
            description: 'Grille avec ' + nbCriteres + ' critères à pondération égale.',
            criteres: criteres,
            dateCreation: new Date().toISOString()
        };
    }

    if (grille) {
        var grilles = db.getSync('grillesTemplates', []);
        grilles.push(grille);
        db.setSync('grillesTemplates', grilles);

        // Vérification post-création
        var grillesVerif = db.getSync('grillesTemplates', []);
        var trouvee = grillesVerif.find(function(g) { return g.id === grille.id; });

        if (trouvee) {
            reponsesPrimo['materiel-grille-id-cree'] = grille.id;
            reponsesPrimo['materiel-grille-nom-cree'] = grille.nom;
            reponsesPrimo['materiel-grille-nb-criteres-crees'] = grille.criteres.length.toString();
            console.log('[Guide] ✅ Grille créée:', grille.nom, '(' + grille.criteres.length + ' critères)');
        } else {
            throw new Error('Grille non trouvée après création dans IndexedDB');
        }
    }
}

/**
 * Crée une production depuis le parcours matériel
 * Lie automatiquement la grille créée (si existante)
 * Clé : db.setSync(cle('productions'), [...])
 */
function creerProductionDepuisParcours() {
    var titre = reponsesPrimo['materiel-production-titre'] || 'Évaluation';
    var type = reponsesPrimo['materiel-production-type'] || 'travail';
    var ponderation = parseInt(reponsesPrimo['materiel-production-ponderation']) || 25;
    var grilleId = reponsesPrimo['materiel-grille-id-cree'] || null;

    var production = {
        id: genererIdUnique('PROD_'),
        titre: titre,
        description: '',
        type: type,
        ponderation: ponderation,
        grilleId: grilleId,
        verrouille: false,
        dateCreation: new Date().toISOString()
    };

    var cleProductions = typeof cle === 'function' ? cle('productions') : 'productions';
    var productions = db.getSync(cleProductions, []);
    productions.push(production);
    db.setSync(cleProductions, productions);

    // Vérification post-création
    var prodsVerif = db.getSync(cleProductions, []);
    var trouvee = prodsVerif.find(function(p) { return p.id === production.id; });

    if (trouvee) {
        reponsesPrimo['materiel-production-id-cree'] = production.id;
        console.log('[Guide] ✅ Production créée:', titre, '(' + ponderation + '%)');
    } else {
        throw new Error('Production non trouvée après création dans IndexedDB');
    }
}

/**
 * Crée une cartouche vide (matrice critère × niveau) depuis le parcours matériel
 * Lie à la grille et l'échelle créées
 * Clé : db.setSync('cartouches_' + grilleId, [...])
 */
function creerCartoucheDepuisParcours() {
    var grilleId = reponsesPrimo['materiel-grille-id-cree'];
    var echelleId = reponsesPrimo['materiel-echelle-id-cree'];

    if (!grilleId || !echelleId) {
        throw new Error('Grille ou échelle manquante pour créer la cartouche');
    }

    // Récupérer la grille et l'échelle
    var grilles = db.getSync('grillesTemplates', []);
    var grille = grilles.find(function(g) { return g.id === grilleId; });
    var echelles = db.getSync('echellesTemplates', []);
    var echelle = echelles.find(function(e) { return e.id === echelleId; });

    if (!grille || !echelle) {
        throw new Error('Grille ou échelle introuvable dans IndexedDB');
    }

    // Créer la matrice critère × niveau (textes vides)
    var retroactions = {};
    grille.criteres.forEach(function(critere) {
        retroactions[critere.id] = {};
        echelle.niveaux.forEach(function(niveau) {
            retroactions[critere.id][niveau.code] = '';
        });
    });

    var cartouche = {
        id: genererIdUnique('CART_'),
        grilleId: grilleId,
        echelleId: echelleId,
        nom: 'Cartouche - ' + grille.nom,
        retroactions: retroactions,
        dateCreation: new Date().toISOString()
    };

    var cleCartouche = 'cartouches_' + grilleId;
    var cartouches = db.getSync(cleCartouche, []);
    cartouches.push(cartouche);
    db.setSync(cleCartouche, cartouches);

    // Vérification post-création
    var cartouchesVerif = db.getSync(cleCartouche, []);
    var trouvee = cartouchesVerif.find(function(c) { return c.id === cartouche.id; });

    if (trouvee) {
        console.log('[Guide] ✅ Cartouche créée:', cartouche.nom);
    } else {
        throw new Error('Cartouche non trouvée après création dans IndexedDB');
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
                radio.parentElement.style.borderColor = 'var(--accent-primaire)';
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
        zoneErreur.classList.remove('u-hide');

        // Masquer après 5 secondes
        setTimeout(() => {
            zoneErreur.classList.add('u-hide');
        }, 5000);
    }
}

// ============================================================================
// FINALISATION
// ============================================================================

/**
 * Convertit les données horaireHebdomadaire en tableau seancesHoraire
 * Format Primo → Format attendu par horaire.js
 *
 * ✅ CORRECTION (2 jan 2026) : Sauvegarde dans seancesHoraire_{coursId}
 * au lieu de la clé globale legacy 'seancesHoraire'
 */
function creerSeancesHoraire() {
    const horaire = db.getSync('horaireHebdomadaire', null);
    if (!horaire || !horaire.nombreSeances) {
        console.log('[Guide] Aucun horaire à convertir');
        return;
    }

    // ✅ Récupérer le coursId depuis infoCours (créé juste avant)
    const infoCours = db.getSync('infoCours', null);
    if (!infoCours || !infoCours.id) {
        console.warn('[Guide] Impossible de sauvegarder horaire: infoCours.id manquant');
        // Fallback sur clé legacy pour ne pas perdre les données
        console.log('[Guide] Fallback sur clé legacy seancesHoraire');
    }
    const coursId = infoCours?.id;

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
        // ✅ Sauvegarder dans la clé namespacée par cours
        const cleSauvegarde = coursId ? `seancesHoraire_${coursId}` : 'seancesHoraire';
        db.setSync(cleSauvegarde, seances);
        console.log(`[Guide] ${seances.length} séance(s) créée(s) dans ${cleSauvegarde}:`, seances);

        // 🆕 BETA 95.1 (Bug Bruno) : Aussi sauvegarder dans horaireHebdo namespacé
        // pour que genererCalendrierComplet() puisse déterminer les jours avec cours
        db.setSync(cle('horaireHebdo'), seances);
        console.log(`[Guide] Séances aussi copiées dans ${cle('horaireHebdo')}`);
    }
}

/**
 * Termine la configuration et sauvegarde toutes les réponses
 */
async function terminerConfiguration() {
    console.log('[Guide] Configuration terminée !');
    console.log('[Guide] Réponses collectées:', reponsesPrimo);
    console.log('[Guide] DEBUG code-cours:', reponsesPrimo['code-cours']);
    console.log('[Guide] DEBUG titre-cours:', reponsesPrimo['titre-cours']);

    // Vérifier si c'est un parcours modulaire (retour au menu)
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);
    const questionActuelle = questionsActives[indexQuestionActuelle];
    const estParcoursCourt = questionActuelle && questionActuelle.finParcoursCourt === true;
    const estParcoursEvaluer = questionActuelle && questionActuelle.finParcoursEvaluer === true;
    const estParcoursMateriel = questionActuelle && questionActuelle.finParcoursMateriel === true;
    const estParcoursModulaire = estParcoursCourt || estParcoursEvaluer || estParcoursMateriel;

    // Sauvegarder toutes les réponses dans localStorage
    sauvegarderReponses(reponsesPrimo);

    // ✅ CORRECTION (2 jan 2026) : Créer le cours AVANT l'horaire
    // pour que creerSeancesHoraire() puisse utiliser le coursId
    creerCoursInitial(reponsesPrimo);

    // Créer le tableau de séances à partir de horaireHebdomadaire
    // Utilise maintenant seancesHoraire_{coursId} (namespacé)
    creerSeancesHoraire();

    // ✅ NOUVEAU (Beta 95.2 - 8 jan 2026) : Créer le groupe-cours
    // pour qu'il apparaisse dans le dropdown et lie toutes les entités
    creerGroupeCoursDepuisPrimo(reponsesPrimo);

    // Générer le calendrier complet à partir des données du trimestre
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
        console.log('[Guide] Calendrier complet généré');
    }

    // Générer les séances complètes à partir de l'horaire
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
        console.log('[Guide] Séances complètes générées');
    }

    if (estParcoursModulaire) {
        // PARCOURS MODULAIRE : Retourner au menu d'accueil
        console.log('[Guide] Parcours modulaire terminé - retour au menu');

        // Afficher notification de succès
        if (typeof afficherNotificationSucces === 'function') {
            // ✅ AJOUT (Beta 95.2) : Message plus explicite selon le parcours
            let messageType, messageDetails;
            if (estParcoursCourt) {
                messageType = 'Configuration de base';
                messageDetails = 'L\'application va se recharger pour appliquer les changements.';
            } else if (estParcoursMateriel) {
                messageType = 'Matériel pédagogique créé';
                messageDetails = 'Le matériel est disponible dans la section Matériel.';
            } else {
                messageType = 'Pratique de notation configurée';
                messageDetails = 'Les paramètres ont été appliqués au cours actif.';
            }
            afficherNotificationSucces(
                `${messageType} terminée ! ✅`,
                messageDetails
            );
        }

        // Fermer le modal
        fermerModalConversationnel();

        // ✅ CORRECTION (6 jan 2026 - Bug Olivier) : Recharger la page pour le parcours court aussi
        // Sinon l'interface ne reflète pas les nouvelles données (cours, étudiants, etc.)
        if (estParcoursCourt) {
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            // Parcours matériel ou autre : retour au menu d'accueil (pas besoin de reload)
            setTimeout(() => {
                if (typeof afficherModalAccueil === 'function') {
                    afficherModalAccueil();
                }
            }, 1000);
        }

    } else {
        // PARCOURS COMPLET : Configuration complète avec import matériel
        console.log('[Guide] Parcours complet - import matériel et rechargement');

        // Importer le matériel pédagogique de démarrage (asynchrone)
        await importerMaterielDemarrage();

        // [Chantier 2] Mode Assisté supprimé — rester en mode normal
        db.setSync('modeApplication', 'normal');
        console.log('[Guide] Mode de travail défini sur "normal"');

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
                    console.log(`[Guide] Sauvegarde valeur fixe pour ${question.id}:`, cible.valeurFixe);
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

    console.log('[Guide] Toutes les réponses ont été sauvegardées dans localStorage');
}

/**
 * Transforme une réponse selon la fonction transformation de la question
 */
function transformerReponse(questionId, valeur) {
    const question = obtenirQuestion(questionId);

    if (question && typeof question.transformation === 'function') {
        console.log(`[Guide] Transformation appliquée pour ${questionId}`);
        return question.transformation(valeur);
    }

    return valeur;
}

/**
 * Sauvegarde un champ dans localStorage
 * Supporte les chemins imbriqués (ex: 'parObjectifs.comptage.seuilMaitrise')
 */
function sauvegarderChamp(cible, valeur) {
    const { cle, champ } = cible;

    if (champ === null) {
        // Sauvegarde directe (ex: groupeEtudiants)
        db.setSync(cle, valeur);
    } else if (champ.includes('.')) {
        // Chemin imbriqué (ex: 'parObjectifs.comptage.seuilMaitrise')
        let objet = db.getSync(cle, {});
        const parties = champ.split('.');
        let ref = objet;

        // Naviguer jusqu'à l'avant-dernier niveau, créer si nécessaire
        for (let i = 0; i < parties.length - 1; i++) {
            if (!ref[parties[i]]) {
                ref[parties[i]] = {};
            }
            ref = ref[parties[i]];
        }

        // Assigner la valeur au dernier niveau
        ref[parties[parties.length - 1]] = valeur;
        db.setSync(cle, objet);
    } else {
        // Sauvegarde dans un objet (ex: infoCours.enseignant)
        let objet = db.getSync(cle, {});
        objet[champ] = valeur;
        db.setSync(cle, objet);
    }

    console.log(`[Guide] Sauvegardé: ${cle}${champ ? '.' + champ : ''} =`, valeur);
}

/**
 * Crée l'échelle IDME par défaut
 */
function creerEchelleIDMEParDefaut() {
    const echelleExistante = db.getSync('echellePerformance', null);

    if (echelleExistante) {
        console.log('[Guide] Échelle IDME déjà configurée');
        return;
    }

    // Créer l'échelle IDME par défaut
    const echelleIDME = {
        id: 'echelle-idme-defaut',
        nom: 'IDME (Incomplet, en Développement, Maîtrisé, Étendu)',
        niveaux: [
            { code: 'I', nom: 'Incomplet', min: 0, max: 64, valeur: 50, couleur: '#ef5350' },
            { code: 'D', nom: 'en Développement', min: 65, max: 74, valeur: 69.5, couleur: '#ffa726' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeur: 79.5, couleur: '#66bb6a' },
            { code: 'E', nom: 'Étendu', min: 85, max: 100, valeur: 92.5, couleur: '#42a5f5' }
        ],
        dateCreation: new Date().toISOString()
    };

    db.setSync('echellePerformance', echelleIDME);
    console.log('[Guide] Échelle IDME créée par défaut');
}

/**
 * Importe le matériel pédagogique de démarrage (échelle IDME + grille SRPNF + cartouches)
 */
async function importerMaterielDemarrage() {
    console.log('[Guide] 🚀 Début import matériel de démarrage...');

    // Vérifier si du matériel existe déjà
    const echellesExistantes = db.getSync('echellesTemplates', []);
    const grillesExistantes = db.getSync('grillesTemplates', []);

    console.log('[Guide] 🔍 Vérification matériel existant:', {
        echelles: echellesExistantes.length,
        grilles: grillesExistantes.length
    });

    if (echellesExistantes.length > 0 || grillesExistantes.length > 0) {
        console.log('[Guide] ⏭️ Matériel pédagogique déjà présent, import annulé');
        console.log('[Guide] Échelles existantes:', echellesExistantes);
        console.log('[Guide] Grilles existantes:', grillesExistantes);
        return;
    }

    try {
        // Charger le fichier materiel-demarrage.json
        console.log('[Guide] 📥 Chargement de materiel-demarrage.json...');
        const response = await fetch('materiel-demarrage.json');
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        const config = await response.json();
        console.log('[Guide] 📦 Fichier chargé:', config.metadata?.nom);

        const contenu = config.contenu;
        let nbImporte = 0;

        // Importer les échelles
        if (contenu.echelles && contenu.echelles.length > 0) {
            db.setSync('echellesTemplates', contenu.echelles);
            nbImporte += contenu.echelles.length;
            console.log(`[Guide] ✅ ${contenu.echelles.length} échelle(s) importée(s)`);
        }

        // Importer les grilles
        if (contenu.grilles && contenu.grilles.length > 0) {
            db.setSync('grillesTemplates', contenu.grilles);
            nbImporte += contenu.grilles.length;
            console.log(`[Guide] ✅ ${contenu.grilles.length} grille(s) importée(s)`);
        }

        // Importer les cartouches
        if (contenu.cartouches && contenu.cartouches.length > 0) {
            // Les cartouches sont stockées par grilleId sous forme de tableau
            contenu.cartouches.forEach(cartouche => {
                const cle = `cartouches_${cartouche.grilleId}`;
                db.setSync(cle, [cartouche]);
                nbImporte++;
                console.log(`[Guide] ✅ Cartouche importée pour grille ${cartouche.grilleId}`);
            });
        }

        console.log(`[Guide] 🎉 Matériel pédagogique importé: ${nbImporte} ressources`);

        // Notification à l'utilisateur
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(
                'Matériel pédagogique installé',
                `${nbImporte} ressources importées (échelle, grille, cartouches)`
            );
        }

    } catch (erreur) {
        console.error('[Guide] ❌ Erreur import matériel de démarrage:', erreur);
        console.error('[Guide] Détails:', erreur.message, erreur.stack);

        // Notification d'erreur à l'utilisateur
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur(
                'Import partiel',
                'Le matériel de base n\'a pas pu être importé. Tu pourras l\'ajouter manuellement plus tard.'
            );
        }

        // Fallback: créer au moins l'échelle IDME
        creerEchelleIDMEParDefaut();
    }
}

/**
 * Crée le cours initial à partir des réponses de Primo
 * Beta 95 : Génère coursId et trimestreId selon architecture multi-cours
 */
function creerCoursInitial(reponses) {
    const cours = db.getSync('listeCours', []);

    // Extraire les données des réponses
    const session = reponses['trimestre'] || 'Hiver';  // "Hiver", "Été", "Automne"
    const annee = reponses['annee'] || new Date().getFullYear().toString();
    const code = reponses['code-cours'] || '';  // "601-101-MQ"
    const groupe = reponses['numero-groupe'] || '00001';  // "00094"

    // Générer trimestreId : h2026, e2026, a2026
    const sessionCode = session === 'Hiver' ? 'h' : session === 'Été' ? 'e' : 'a';
    const trimestreId = sessionCode + annee;

    // Générer coursId : 601-101-h2026-94
    // Retirer le suffixe -MQ/-ML du code si présent
    const codeBase = code.replace(/-[A-Z]{2}$/, '');
    const groupeNumerique = groupe.replace(/^0+/, '') || '1';  // "00094" -> "94"
    const coursId = codeBase ? `${codeBase}-${trimestreId}-${groupeNumerique}` : genererIdUnique('COURS_');

    // Créer le nouveau cours
    const nouveauCours = {
        id: coursId,
        code: code,  // Code complet (ex: 601-101-MQ)
        titre: reponses['titre-cours'] || '',
        groupe: groupe,  // Groupe normalisé 5 chiffres
        session: session.charAt(0).toUpperCase(),  // "H", "E", "A"
        annee: annee,
        trimestreId: trimestreId,
        enseignant: reponses['nom-utilisateur'] || '',
        courriel: reponses['courriel-utilisateur'] || '',
        siteWeb: reponses['site-utilisateur'] || '',
        pratiqueId: reponses['pratique-notation'] || 'pan-maitrise',
        verrouille: false,
        actif: true,  // Premier cours = actif par défaut
        dateCreation: new Date().toISOString().split('T')[0]
    };

    // Vérifier si le cours existe déjà (mise à jour vs création)
    const indexExistant = cours.findIndex(c => c.id === coursId);
    if (indexExistant >= 0) {
        cours[indexExistant] = nouveauCours;
        console.log('[Guide] Cours mis à jour:', nouveauCours);
    } else {
        cours.push(nouveauCours);
        console.log('[Guide] Nouveau cours créé:', nouveauCours);
    }

    db.setSync('listeCours', cours);

    // ✅ CORRECTION (Beta 95 - 27 déc 2025) : Sauvegarder le cours complet dans infoCours
    // (pas seulement id et trimestreId, pour cohérence avec trimestre-v2.js et contexte.js)
    db.setSync('infoCours', nouveauCours);

    // Créer le trimestre si inexistant
    creerTrimestreSiAbsent(trimestreId, session, annee);

    console.log('[Guide] coursId:', coursId, 'trimestreId:', trimestreId);
}

/**
 * Crée le trimestre s'il n'existe pas déjà
 */
function creerTrimestreSiAbsent(trimestreId, session, annee) {
    const trimestres = db.getSync('trimestres', []);

    if (!trimestres.find(t => t.id === trimestreId)) {
        trimestres.push({
            id: trimestreId,
            nom: `${session} ${annee}`,
            session: session.charAt(0).toUpperCase(),
            annee: annee,
            dateCreation: new Date().toISOString().split('T')[0],
            actif: true
        });
        db.setSync('trimestres', trimestres);
        console.log('[Guide] Trimestre créé:', trimestreId);
    }
}

/**
 * Crée le groupe-cours à partir des données Primo
 * Beta 95.2 (8 jan 2026) : Lie cours + enseignant + horaire + pratique
 * Corrige le bug où le cours créé avec Primo n'apparaissait pas dans le dropdown
 */
function creerGroupeCoursDepuisPrimo(reponses) {
    // Récupérer les données créées par creerCoursInitial()
    const infoCours = db.getSync('infoCours', {});
    const coursId = infoCours.id || '';
    const trimestreId = infoCours.trimestreId || '';

    if (!coursId) {
        console.warn('[Guide] Pas de coursId, groupe-cours non créé');
        return;
    }

    // Créer ou récupérer l'enseignant
    const enseignantId = creerOuRecupererEnseignantPrimo(reponses);

    // Créer l'horaire dans la banque
    const horaireId = creerHoraireDansBanquePrimo(reponses, coursId);

    // Récupérer la pratique
    const pratiqueId = reponses['pratique-notation'] || 'pan-maitrise';

    // Créer le groupe-cours
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);

    // Vérifier si un groupe-cours existe déjà pour ce cours
    const existant = groupesCours.find(gc => gc.coursId === coursId);
    if (existant) {
        console.log('[Guide] Groupe-cours existant pour ce cours:', existant.id);
        db.setSync('groupeCoursActif', existant.id);
        return;
    }

    // Générer le nom du groupe-cours (aligné sur Trimestre)
    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const groupeNum = reponses['numero-groupe'] || '00001';
    const codeCours = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
    const nomGC = genererNomGroupeCoursPrimo(trimestreId, codeCours, groupeNum, horaireId);

    const nouveauGC = {
        id: genererIdUnique('GC_'),
        nom: nomGC,                    // Aligné sur Trimestre
        trimestreId: trimestreId,
        coursId: coursId,
        groupeNum: groupeNum,          // Aligné sur Trimestre (était "groupe")
        horaireId: horaireId,
        enseignantId: enseignantId,
        pratiqueId: pratiqueId,        // Bonus Primo
        dateCreation: new Date().toISOString(),
        actif: true
    };

    groupesCours.push(nouveauGC);
    db.setSync(cleGC, groupesCours);

    // Marquer comme actif
    db.setSync('groupeCoursActif', nouveauGC.id);

    console.log('[Guide] Groupe-cours créé:', nouveauGC);
}

/**
 * Crée ou récupère un enseignant existant
 * Beta 95.2 : Utilisé par creerGroupeCoursDepuisPrimo()
 */
function creerOuRecupererEnseignantPrimo(reponses) {
    const enseignants = db.getSync('enseignants', []);
    const nom = reponses['nom-utilisateur'] || '';
    const courriel = reponses['courriel-utilisateur'] || '';

    // Chercher enseignant existant par courriel
    if (courriel) {
        const existant = enseignants.find(e => e.courriel === courriel);
        if (existant) return existant.id;
    }

    // Créer nouvel enseignant
    const partiesNom = nom.split(' ');
    const nouvelEnseignant = {
        id: genererIdUnique('ENS_'),
        prenom: partiesNom[0] || '',
        nom: partiesNom.slice(1).join(' ') || nom,
        courriel: courriel,
        institution: '',
        departement: '',
        discipline: ''
    };

    enseignants.push(nouvelEnseignant);
    db.setSync('enseignants', enseignants);

    console.log('[Guide] Enseignant créé:', nouvelEnseignant.id);
    return nouvelEnseignant.id;
}

/**
 * Crée l'horaire dans la banque namespacée
 * Beta 95.2 : Utilisé par creerGroupeCoursDepuisPrimo()
 * FIX #50 (1er fév 2026) : Lire les séances depuis horaireHebdo namespacé
 * (créé par creerSeancesHoraire) au lieu de reponses['horaireHebdomadaire']
 */
function creerHoraireDansBanquePrimo(reponses, coursId) {
    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);

    // FIX #50 : Lire les séances depuis horaireHebdo namespacé (créé par creerSeancesHoraire)
    // ou depuis seancesHoraire_{coursId} en fallback
    const cleHoraireHebdo = cle('horaireHebdo');
    let seances = db.getSync(cleHoraireHebdo, []);

    // Fallback : essayer seancesHoraire_{coursId}
    if ((!seances || seances.length === 0) && coursId) {
        seances = db.getSync(`seancesHoraire_${coursId}`, []);
    }

    // Ne pas créer si pas de séances
    if (!seances || seances.length === 0) {
        console.log('[Guide] Pas de séances trouvées, horaire non créé');
        return null;
    }

    const nouvelHoraire = {
        id: genererIdUnique('HOR_'),
        coursId: coursId,
        seances: seances,
        dateCreation: new Date().toISOString().split('T')[0]
    };

    horaires.push(nouvelHoraire);
    db.setSync(cleHoraires, horaires);

    console.log('[Guide] Horaire créé:', nouvelHoraire.id, 'avec', seances.length, 'séance(s)');
    return nouvelHoraire.id;
}

/**
 * Génère le nom du groupe-cours (aligné sur Trimestre)
 * Format: H2026-601-101-MQ-00001 (Lun-AM / Mer-PM)
 */
function genererNomGroupeCoursPrimo(trimestreId, codeCours, groupeNum, horaireId) {
    // Formater le trimestre (ex: "h2026" → "H2026")
    let trimestreNom = '';
    if (trimestreId) {
        const trimestres = db.getSync('trimestres', []);
        const trimestre = trimestres.find(t => t.id === trimestreId);
        if (trimestre) {
            const sessionLettre = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' }[trimestre.session] ||
                                  trimestre.session?.charAt(0)?.toUpperCase() || '';
            trimestreNom = `${sessionLettre}${trimestre.annee}`;
        } else {
            // Fallback: extraire de l'ID (ex: "h2026" → "H2026")
            trimestreNom = trimestreId.charAt(0).toUpperCase() + trimestreId.slice(1);
        }
    }

    // Résumé horaire
    let horaireResume = '';
    if (horaireId) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const horaire = horaires.find(h => h.id === horaireId);

        if (horaire?.seances && horaire.seances.length > 0) {
            const abrevJour = { 'Lundi': 'Lun', 'Mardi': 'Mar', 'Mercredi': 'Mer',
                               'Jeudi': 'Jeu', 'Vendredi': 'Ven', 'Samedi': 'Sam', 'Dimanche': 'Dim' };
            const seancesAbregees = horaire.seances.map(s => {
                const jourAbrege = abrevJour[s.jour] || s.jour?.substring(0, 3) || '';
                const heure = parseInt(s.heureDebut?.split(':')[0] || '12');
                const periode = heure < 12 ? 'AM' : 'PM';
                return `${jourAbrege}-${periode}`;
            });
            horaireResume = seancesAbregees.join(' / ');
        }
    }

    // Assembler le nom
    let nom = '';
    if (trimestreNom) nom += trimestreNom;
    if (codeCours) nom += (nom ? '-' : '') + codeCours;
    if (groupeNum) nom += (nom ? '-' : '') + groupeNum;
    if (horaireResume) nom += ` (${horaireResume})`;

    return nom || 'Groupe-cours';
}

// ============================================================================
// MODE NOTIFICATION (PHASE 2 : PRATIQUE GUIDÉE)
// ============================================================================

let modeNotification = false;
let indexDepartModule = 0; // 🆕 BETA 92: Index de départ du module (pour limiter le bouton Précédent)

/**
 * Démarre directement en mode notification (sans passer par le modal)
 * @param {number} indexDepart - Index de la question de départ
 */
function demarrerModeNotification(indexDepart = 0) {
    console.log('[Guide] 🚀 Démarrage direct en mode notification');

    // Initialiser l'état
    indexQuestionActuelle = indexDepart;
    indexDepartModule = indexDepart; // 🆕 BETA 92: Sauvegarder l'index de départ
    reponsesPrimo = {};
    modalPrimoActif = true;

    // Passer en mode notification
    passerEnModeNotification();
}

/**
 * Passe du mode modal au mode notification
 */
function passerEnModeNotification() {
    console.log('[Guide] 🔄 Passage en mode notification');

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
        bottom: 80px;
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

    // 🆕 BETA 92: Créer le bouton "Quitter" à côté du bouton "Suivant"
    const boutonArreter = document.createElement('button');
    boutonArreter.id = 'primo-bouton-arreter';
    boutonArreter.innerHTML = 'Quitter';
    boutonArreter.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 190px;
        padding: 15px 30px;
        background: var(--surface-conteneur, #162c36);
        color: var(--gris-moyen);
        border: 2px solid var(--bordure-claire);
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 9998;
        transition: all 0.3s;
        pointer-events: auto;
    `;

    boutonArreter.onmouseover = function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15)';
        this.style.borderColor = 'var(--gris-moyen)';
    };

    boutonArreter.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        this.style.borderColor = 'var(--bordure-claire)';
    };

    boutonArreter.onclick = function() {
        // Demander confirmation avant d'arrêter
        if (confirm('Souhaites-tu vraiment quitter ce parcours ?\n\nTu pourras le relancer plus tard via le bouton 🗺️.')) {
            // Nettoyer le mode notification
            const container = document.getElementById('primo-notification-container');
            const boutonSuivant = document.getElementById('primo-bouton-suivant');
            const boutonArreter = document.getElementById('primo-bouton-arreter');
            const boutonPrecedent = document.getElementById('primo-bouton-precedent');

            if (container) container.remove();
            if (boutonSuivant) boutonSuivant.remove();
            if (boutonArreter) boutonArreter.remove();
            if (boutonPrecedent) boutonPrecedent.remove();

            modeNotification = false;
            modalPrimoActif = false;

            console.log('[Guide] 🛑 MODULE 2 quitté par l\'utilisateur');
        }
    };

    document.body.appendChild(boutonArreter);

    // 🆕 BETA 92: Créer le bouton "Précédent" à gauche du bouton "Quitter"
    const boutonPrecedent = document.createElement('button');
    boutonPrecedent.id = 'primo-bouton-precedent';
    boutonPrecedent.innerHTML = '← Précédent';
    boutonPrecedent.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 330px;
        padding: 15px 30px;
        background: var(--surface-conteneur, #162c36);
        color: var(--gris-moyen);
        border: 2px solid var(--bordure-claire);
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 9998;
        transition: all 0.3s;
        pointer-events: auto;
        opacity: 0.5;
    `;

    boutonPrecedent.onmouseover = function() {
        // 🆕 BETA 92: Vérifier par rapport à indexDepartModule
        if (indexQuestionActuelle > indexDepartModule) {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15)';
            this.style.borderColor = 'var(--gris-moyen)';
            this.style.opacity = '1';
        }
    };

    boutonPrecedent.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        this.style.borderColor = 'var(--bordure-claire)';
        // 🆕 BETA 92: Vérifier par rapport à indexDepartModule
        if (indexQuestionActuelle <= indexDepartModule) {
            this.style.opacity = '0.5';
        }
    };

    boutonPrecedent.onclick = function() {
        // 🆕 BETA 92: Ne pas déborder en-dessous de l'index de départ du module
        if (indexQuestionActuelle > indexDepartModule) {
            indexQuestionActuelle--;
            afficherNotificationActuelle();
            mettreAJourBoutonPrecedent();
        }
    };

    // Fonction pour mettre à jour l'état du bouton Précédent
    function mettreAJourBoutonPrecedent() {
        const btn = document.getElementById('primo-bouton-precedent');
        if (btn) {
            // 🆕 BETA 92: Désactiver si on est à l'index de départ du module
            if (indexQuestionActuelle <= indexDepartModule) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }
    }

    document.body.appendChild(boutonPrecedent);

    // 🆕 BETA 92: Ne PAS incrémenter ici - commencer directement à indexDepart
    // L'ancienne ligne "indexQuestionActuelle++" faisait sauter la première étape

    // Afficher la première notification (à l'index de départ)
    afficherNotificationActuelle();

    // Mettre à jour l'état initial du bouton Précédent (désactivé au départ)
    setTimeout(() => mettreAJourBoutonPrecedent(), 100);
}

/**
 * Affiche la notification correspondant à la question actuelle
 */
function afficherNotificationActuelle() {
    const questionsActives = obtenirQuestionsActives(reponsesPrimo);
    const question = questionsActives[indexQuestionActuelle];

    if (!question) {
        console.log('[Guide] Fin du mode notification');
        revenirEnModeModal();
        return;
    }

    const container = document.getElementById('primo-notification-container');
    if (!container) return;

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'primo-notification';
    notification.style.cssText = `
        background: var(--surface-conteneur, #162c36);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        border-left: 4px solid var(--accent-primaire);
        pointer-events: auto;
        animation: slideInRight 0.4s ease-out;
    `;

    // Icône tour guidé (petit)
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
    icone.innerHTML = '🗺️';

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
    console.log('[Guide] 🔄 Retour en mode modal pour conclusion');

    modeNotification = false;

    // Supprimer les éléments du mode notification
    const container = document.getElementById('primo-notification-container');
    const boutonSuivant = document.getElementById('primo-bouton-suivant');
    const boutonArreter = document.getElementById('primo-bouton-arreter');
    const boutonPrecedent = document.getElementById('primo-bouton-precedent');

    if (container) container.remove();
    if (boutonSuivant) boutonSuivant.remove();
    if (boutonArreter) boutonArreter.remove();
    if (boutonPrecedent) boutonPrecedent.remove();

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
            background: var(--surface-conteneur, #162c36);
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
window.demarrerModeNotification = demarrerModeNotification;

console.log('✅ Module primo-modal.js chargé');


})();
