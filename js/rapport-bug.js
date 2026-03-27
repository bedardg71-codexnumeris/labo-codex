/* ===============================
   MODULE: RAPPORT DE BUG POUR TESTEURS
   Beta 96 - 25 janvier 2026

   Permet aux testeurs d'envoyer facilement des rapports de bug
   avec les informations techniques nécessaires au débogage.

   ✅ AMÉLIORATIONS (18 jan 2026) :
   - Stack trace complet pour les erreurs
   - Historique des 10 dernières actions (clics, navigation)
   - Contexte de données selon la section active
   - Capture d'écran intégrée
   - État stockage pertinent

   ✅ AJOUT (25 fév 2026) :
   - Système de suivi des tickets (resolutions.json)
   - Badge de notification pour tickets en attente
   - Persistance du prénom testeur
   - Mode commentaire/feedback
   =============================== */

(function() {
'use strict';

// ===============================
// VERSION DE L'APPLICATION
// ===============================

/**
 * Version actuelle de l'application (lue dynamiquement)
 */
function getVersionApp() {
    return 'Beta ' + (window.VERSION_MAJEURE || '??');
}

// ===============================
// ARCHIVAGE LOCAL DES RAPPORTS
// ===============================

const CLE_RAPPORTS_ARCHIVES = 'rapportsBugArchives';
const MAX_RAPPORTS_ARCHIVES = 50;

// ===============================
// SUIVI DES TICKETS (RÉSOLUTIONS)
// ===============================

const CLE_PRENOM_TESTEUR = 'prenomTesteurBug';
const CLE_TICKETS_CONFIRMES = 'bugTicketsConfirmes';

// Résolutions chargées en mémoire
let resolutionsData = null;

// Mode actif du modal (bug ou commentaire)
let modeRapport = 'bug';

/**
 * Normalise un prénom pour comparaison (minuscules, sans accents, sans espaces superflus)
 */
function normaliserPrenom(prenom) {
    return (prenom || '').trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Charge les résolutions depuis resolutions.json
 */
async function chargerResolutions() {
    if (window.location.protocol === 'file:') return; // fetch impossible en file://
    try {
        const reponse = await fetch('resolutions.json?t=' + Date.now(), { cache: 'no-store' });
        if (!reponse.ok) return;
        resolutionsData = await reponse.json();
    } catch (e) {
        // Silencieux si hors-ligne ou fichier absent
    }
}

/**
 * Obtient les IDs des tickets confirmés par le testeur
 */
function obtenirTicketsConfirmes() {
    try {
        const data = localStorage.getItem(CLE_TICKETS_CONFIRMES);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Sauvegarde un ticket comme confirmé
 */
function confirmerTicket(id) {
    const confirmes = obtenirTicketsConfirmes();
    if (!confirmes.includes(id)) {
        confirmes.push(id);
        localStorage.setItem(CLE_TICKETS_CONFIRMES, JSON.stringify(confirmes));
    }
    // Rafraîchir la section suivi dans le modal
    const sectionSuivi = document.getElementById('sectionSuiviBugs');
    if (sectionSuivi) {
        sectionSuivi.outerHTML = genererSectionSuivi();
    }
    // Mettre à jour le badge
    mettreAJourBadgeBug();
}

/**
 * Action "Pas résolu" — pré-remplit un nouveau rapport
 */
function rouvrirTicket(id) {
    if (!resolutionsData?.tickets) return;
    const ticket = resolutionsData.tickets.find(t => t.id === id);
    if (!ticket) return;

    const textarea = document.getElementById('descriptionBug');
    if (textarea) {
        textarea.value = `⚠️ RÉOUVERTURE ticket #${ticket.id}\nProblème original : ${ticket.resume}\nCorrection proposée : ${ticket.correction}\n\nLe problème persiste : `;
        textarea.focus();
        // Placer le curseur à la fin
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        // Mettre à jour le rapport technique
        mettreAJourRapport();
        // Scroller vers la description
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Si on est en mode commentaire, basculer vers bug
    if (modeRapport !== 'bug') {
        modeRapport = 'bug';
        const sectionFormulaire = document.getElementById('sectionFormulaireBug');
        if (sectionFormulaire) {
            mettreAJourModeRapport();
        }
    }
}

/**
 * Génère le HTML de la section "Suivi de vos bugs"
 */
function genererSectionSuivi() {
    const prenom = normaliserPrenom(localStorage.getItem(CLE_PRENOM_TESTEUR) || '');
    const confirmes = obtenirTicketsConfirmes();
    const tickets = resolutionsData?.tickets || [];

    // Filtrer les tickets du testeur (si prénom vide, afficher tous)
    const ticketsFiltres = prenom
        ? tickets.filter(t => normaliserPrenom(t.testeur) === prenom)
        : tickets;

    // Aussi inclure les rapports archivés qui n'ont pas de résolution (rouge)
    const archives = obtenirRapportsArchives();
    const archivesSansResolution = [];
    if (prenom) {
        archives.forEach(r => {
            const prenomArchive = normaliserPrenom(r.prenom);
            if (prenomArchive !== prenom) return;
            // Vérifier si ce rapport a un ticket correspondant
            const aTicket = tickets.some(t =>
                normaliserPrenom(t.testeur) === prenomArchive
            );
            // On n'ajoute pas de faux rouges — les rouges sont gérés différemment
            // Les tickets absents du JSON mais ayant un rapport archivé seront rouges
        });
    }

    if (ticketsFiltres.length === 0) {
        return '<div id="sectionSuiviBugs"></div>';
    }

    // Compter les tickets jaunes non confirmés
    const nbEnAttente = ticketsFiltres.filter(t =>
        t.statut === 'jaune' && !confirmes.includes(t.id)
    ).length;

    const titreSection = nbEnAttente > 0
        ? `Suivi de vos bugs (${nbEnAttente} en attente)`
        : `Suivi de vos bugs`;

    let html = `<div id="sectionSuiviBugs" style="
        margin-bottom: 20px;
        padding: 15px;
        background: var(--gris-tres-pale);
        border-radius: 8px;
        border: 1px solid var(--bordure-claire);
    ">
        <h3 style="margin: 0 0 12px 0; font-size: 1rem; color: var(--accent-primaire);">
            📋 ${titreSection}
        </h3>`;

    ticketsFiltres.forEach(ticket => {
        const estConfirme = confirmes.includes(ticket.id);
        let couleur, icone, contenu, actions;

        if (ticket.statut === 'vert' || (ticket.statut === 'jaune' && estConfirme)) {
            // Vert — confirmé
            couleur = 'var(--vert-succes)';
            icone = '🟢';
            contenu = `<span style="color: var(--gris-moyen); font-style: italic;">Résolu et confirmé ✓</span>`;
            actions = '';
        } else if (ticket.statut === 'jaune') {
            // Jaune — en attente de confirmation
            couleur = 'var(--orange-accent)';
            icone = '🟡';
            const dateFormatee = formaterDateTicket(ticket.dateCorrection);
            contenu = `
                <div style="font-size: 0.85rem; color: var(--gris-fonce); margin-bottom: 6px;">
                    Correction: ${echapperHtmlLocal(ticket.correction)}
                </div>
                <div style="font-size: 0.8rem; color: var(--gris-moyen);">
                    Build ${ticket.build} — ${dateFormatee}
                </div>`;
            actions = `
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <button data-action="confirmerTicket" data-param="${ticket.id}" class="btn btn-secondaire" style="
                        font-size: 0.8rem; padding: 4px 10px; background: var(--vert-succes); color: white; border: none;">
                        ✅ C'est réglé
                    </button>
                    <button data-action="rouvrirTicket" data-param="${ticket.id}" class="btn btn-secondaire" style="
                        font-size: 0.8rem; padding: 4px 10px; color: var(--orange-accent); border-color: var(--orange-accent);">
                        ⚠️ Pas résolu
                    </button>
                </div>`;
        } else {
            // Rouge — en investigation (cas par défaut)
            couleur = 'var(--rouge-erreur)';
            icone = '🔴';
            contenu = `<span style="color: var(--gris-moyen); font-style: italic;">En cours d'investigation...</span>`;
            actions = '';
        }

        html += `
            <div style="
                background: var(--surface-conteneur, #162c36);
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom: 8px;
                border-left: 3px solid ${couleur};
            ">
                <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 4px;">
                    ${icone} #${ticket.id} — ${echapperHtmlLocal(ticket.resume)}
                </div>
                ${contenu}
                ${actions}
            </div>`;
    });

    html += '</div>';
    return html;
}

/**
 * Formate une date ISO (YYYY-MM-DD) en format lisible
 */
function formaterDateTicket(dateStr) {
    if (!dateStr) return '';
    try {
        const mois = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin',
                       'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
        const [annee, moisNum, jour] = dateStr.split('-');
        return `${parseInt(jour)} ${mois[parseInt(moisNum) - 1]} ${annee}`;
    } catch (e) {
        return dateStr;
    }
}

/**
 * Échappement HTML local (pour éviter XSS dans les données de résolution)
 */
function echapperHtmlLocal(str) {
    if (typeof echapperHtml === 'function') return echapperHtml(str);
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

/**
 * Met à jour le badge de notification sur le bouton bug dans l'en-tête
 */
function mettreAJourBadgeBug() {
    const prenom = normaliserPrenom(localStorage.getItem(CLE_PRENOM_TESTEUR) || '');
    const confirmes = obtenirTicketsConfirmes();
    const tickets = resolutionsData?.tickets || [];

    // Compter les tickets jaunes non confirmés pour ce testeur
    const ticketsFiltres = prenom
        ? tickets.filter(t => normaliserPrenom(t.testeur) === prenom)
        : tickets;

    const nbEnAttente = ticketsFiltres.filter(t =>
        t.statut === 'jaune' && !confirmes.includes(t.id)
    ).length;

    // Chercher ou créer le badge
    const btnBug = document.querySelector('.entete-controles-droite .btn-action-header');
    if (!btnBug) return;

    let badge = document.getElementById('badgeBugNotification');
    if (nbEnAttente > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'badgeBugNotification';
            badge.style.cssText = `
                position: absolute;
                top: -6px;
                right: -6px;
                background: var(--rouge-erreur);
                color: white;
                font-size: 0.7rem;
                font-weight: 700;
                min-width: 18px;
                height: 18px;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
                line-height: 1;
            `;
            // S'assurer que le parent est en position relative
            btnBug.style.position = 'relative';
            btnBug.appendChild(badge);
        }
        badge.textContent = nbEnAttente;
    } else if (badge) {
        badge.remove();
    }
}

/**
 * Archive un rapport de bug localement
 */
function archiverRapportBug(rapport, description, prenom, type) {
    try {
        const archives = db.getSync(CLE_RAPPORTS_ARCHIVES, []);

        const nouveauRapport = {
            id: genererIdUnique('BUG_'),
            date: new Date().toISOString(),
            prenom: prenom || 'Anonyme',
            description: description || 'Aucune description',
            rapport: rapport,
            envoye: true,
            type: type || 'bug'
        };

        archives.unshift(nouveauRapport);

        // Garder seulement les derniers rapports
        if (archives.length > MAX_RAPPORTS_ARCHIVES) {
            archives.length = MAX_RAPPORTS_ARCHIVES;
        }

        db.setSync(CLE_RAPPORTS_ARCHIVES, archives);
    } catch (e) {
        console.error('[Rapport Bug] Erreur archivage:', e);
    }
}

/**
 * Récupère les rapports archivés
 */
function obtenirRapportsArchives() {
    try {
        return db.getSync(CLE_RAPPORTS_ARCHIVES, []);
    } catch (e) {
        return [];
    }
}

/**
 * Supprime un rapport archivé
 */
function supprimerRapportArchive(id) {
    try {
        let archives = obtenirRapportsArchives();
        archives = archives.filter(r => r.id !== id);
        db.setSync(CLE_RAPPORTS_ARCHIVES, archives);
        return true;
    } catch (e) {
        console.error('[Rapport Bug] Erreur suppression:', e);
        return false;
    }
}

/**
 * Supprime tous les rapports archivés
 */
function viderRapportsArchives() {
    db.setSync(CLE_RAPPORTS_ARCHIVES, []);
}

/**
 * Détermine la couleur de bordure d'un rapport archivé en fonction des résolutions
 */
function obtenirCouleurArchive(rapport) {
    if (!resolutionsData?.tickets) return 'var(--accent-primaire)';

    const prenomArchive = normaliserPrenom(rapport.prenom);
    const confirmes = obtenirTicketsConfirmes();

    // Chercher un ticket correspondant (même testeur)
    const ticketCorrespondant = resolutionsData.tickets.find(t =>
        normaliserPrenom(t.testeur) === prenomArchive
    );

    if (!ticketCorrespondant) {
        // Pas de résolution → rouge (en investigation)
        return 'var(--rouge-erreur)';
    }

    if (ticketCorrespondant.statut === 'vert' || confirmes.includes(ticketCorrespondant.id)) {
        return 'var(--vert-succes)';
    }

    if (ticketCorrespondant.statut === 'jaune') {
        return 'var(--orange-accent)';
    }

    return 'var(--accent-primaire)';
}

/**
 * Détermine si un rapport archivé est confirmé (vert) pour l'opacité réduite
 */
function estArchiveConfirme(rapport) {
    if (!resolutionsData?.tickets) return false;

    const prenomArchive = normaliserPrenom(rapport.prenom);
    const confirmes = obtenirTicketsConfirmes();

    const ticketCorrespondant = resolutionsData.tickets.find(t =>
        normaliserPrenom(t.testeur) === prenomArchive
    );

    if (!ticketCorrespondant) return false;
    return ticketCorrespondant.statut === 'vert' || confirmes.includes(ticketCorrespondant.id);
}

/**
 * Affiche le modal de gestion des rapports archivés
 */
function ouvrirModalRapportsArchives() {
    const archives = obtenirRapportsArchives();

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('fr-CA') + ' ' + d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    };

    const listeHTML = archives.length === 0
        ? '<p style="text-align: center; color: var(--gris-moyen); padding: 30px;">Aucun rapport archivé</p>'
        : archives.map(r => {
            const couleurBordure = obtenirCouleurArchive(r);
            const opacite = estArchiveConfirme(r) ? '0.6' : '1';
            const typeBadge = r.type === 'commentaire'
                ? '<span style="font-size: 0.75rem; background: var(--accent-primaire); color: white; padding: 1px 6px; border-radius: 4px; margin-left: 8px;">💬</span>'
                : '';
            return `
            <div style="background: var(--gris-tres-pale); border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 3px solid ${couleurBordure}; opacity: ${opacite};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <strong style="color: var(--accent-primaire);">${r.prenom}</strong>${typeBadge}
                        <span style="color: var(--gris-moyen); font-size: 0.85rem; margin-left: 10px;">${formatDate(r.date)}</span>
                    </div>
                    <button data-action="supprimerEtRafraichirArchive" data-param="${r.id}" style="
                        background: none; border: none; cursor: pointer; font-size: 1.2rem;
                        color: var(--gris-clair); padding: 0;" title="Supprimer">×</button>
                </div>
                <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: var(--gris-fonce);">
                    ${(r.description || 'Aucune description').substring(0, 100)}${r.description?.length > 100 ? '...' : ''}
                </p>
                <button data-action="afficherRapportComplet" data-param="${r.id}" class="btn btn-secondaire" style="font-size: 0.8rem; padding: 4px 10px;">
                    Voir le rapport complet
                </button>
            </div>
        `}).join('');

    const modalHTML = `
        <div id="modalRapportsArchives" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); display: flex; align-items: center;
            justify-content: center; z-index: 10001;">
            <div style="background: var(--surface-conteneur, #162c36); border-radius: 12px; width: 90%; max-width: 600px;
                 max-height: 80vh; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="padding: 20px; border-bottom: 1px solid var(--gris-clair);
                     display: flex; justify-content: space-between; align-items: center;
                     background: var(--bleu-tres-pale);">
                    <h3 style="margin: 0; color: var(--accent-primaire);">
                        Rapports archivés (${archives.length})
                    </h3>
                    <button data-action="fermerModalRapportsArchives" style="
                        background: none; border: none; font-size: 1.8rem;
                        cursor: pointer; color: var(--gris-fonce);">&times;</button>
                </div>
                <div id="listeRapportsArchives" style="padding: 20px; max-height: 60vh; overflow-y: auto;">
                    ${listeHTML}
                </div>
                ${archives.length > 0 ? `
                <div style="padding: 15px; border-top: 1px solid var(--gris-clair); text-align: right;">
                    <button data-action="viderEtRafraichirArchives"
                            class="btn btn-secondaire" style="color: var(--rouge-erreur);">
                        Tout supprimer
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
}

function fermerModalRapportsArchives() {
    const modal = document.getElementById('modalRapportsArchives');
    if (modal?.parentElement) modal.parentElement.remove();
}

function supprimerEtRafraichirArchive(id) {
    supprimerRapportArchive(id);
    rafraichirListeArchives();
}

function rafraichirListeArchives() {
    fermerModalRapportsArchives();
    ouvrirModalRapportsArchives();
}

function viderEtRafraichirArchives() {
    if (confirm('Supprimer tous les rapports archivés ?')) {
        viderRapportsArchives();
        rafraichirListeArchives();
    }
}

function afficherRapportComplet(id) {
    const archives = obtenirRapportsArchives();
    const rapport = archives.find(r => r.id === id);
    if (!rapport) return;

    alert(rapport.rapport);
}

// ===============================
// CAPTURE DES ERREURS CONSOLE
// ===============================

// Stocker les dernières erreurs console (max 20)
const dernieresErreurs = [];
const MAX_ERREURS = 20;

// Intercepter console.error pour capturer les erreurs avec stack trace complet
const originalConsoleError = console.error;
console.error = function(...args) {
    // Appeler l'original
    originalConsoleError.apply(console, args);

    // Stocker l'erreur avec stack trace complet
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    let message = '';
    let stackTrace = '';

    args.forEach(arg => {
        if (arg instanceof Error) {
            message += arg.message + ' ';
            // ✅ Stack trace complet
            if (arg.stack) {
                stackTrace = arg.stack;
            }
        } else {
            message += String(arg) + ' ';
        }
    });

    // Si pas de stack trace, en générer un
    if (!stackTrace) {
        try {
            throw new Error('Stack trace');
        } catch (e) {
            // Retirer les 2 premières lignes (Error et cette fonction)
            stackTrace = e.stack?.split('\n').slice(3).join('\n') || '';
        }
    }

    dernieresErreurs.push({
        timestamp,
        message: message.trim(),
        stack: stackTrace
    });

    // Garder seulement les dernières erreurs
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
};

// Capturer aussi les erreurs non gérées avec stack trace
window.addEventListener('error', (event) => {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    dernieresErreurs.push({
        timestamp,
        message: `[UNCAUGHT] ${event.message}`,
        stack: event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`
    });
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
});

// Capturer les rejets de promesses non gérés
window.addEventListener('unhandledrejection', (event) => {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    const reason = event.reason;
    dernieresErreurs.push({
        timestamp,
        message: `[PROMISE REJECTED] ${reason?.message || reason}`,
        stack: reason?.stack || 'No stack trace'
    });
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
});

// ===============================
// HISTORIQUE DES ACTIONS
// ===============================

const dernieresActions = [];
const MAX_ACTIONS = 20;

/**
 * Enregistre une action utilisateur
 */
function enregistrerAction(type, details) {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    dernieresActions.push({ timestamp, type, details });
    if (dernieresActions.length > MAX_ACTIONS) {
        dernieresActions.shift();
    }
}

// Intercepter les clics
document.addEventListener('click', (event) => {
    const target = event.target;
    let description = '';

    // Identifier l'élément cliqué
    if (target.id) {
        description = `#${target.id}`;
    } else if (target.className && typeof target.className === 'string') {
        description = `.${target.className.split(' ')[0]}`;
    } else {
        description = target.tagName.toLowerCase();
    }

    // Ajouter le texte si disponible
    const texte = target.textContent?.substring(0, 30).trim();
    if (texte && texte.length > 0) {
        description += ` "${texte}${texte.length >= 30 ? '...' : ''}"`;
    }

    enregistrerAction('clic', description);
}, true);

// Intercepter les changements de navigation (si la fonction existe)
const originalAfficherSection = window.afficherSection;
if (typeof originalAfficherSection === 'function') {
    window.afficherSection = function(section, sousSection) {
        enregistrerAction('navigation', `${section} > ${sousSection || 'défaut'}`);
        return originalAfficherSection.apply(this, arguments);
    };
}

// ===============================
// COLLECTE D'INFORMATIONS
// ===============================

/**
 * Obtient les informations sur le navigateur et le système
 */
function obtenirInfosSysteme() {
    const ua = navigator.userAgent;
    let navigateur = 'Inconnu';
    let os = 'Inconnu';
    let appareil = '';

    // Détecter le navigateur
    if (ua.includes('Safari') && !ua.includes('Chrome')) {
        const match = ua.match(/Version\/(\d+\.\d+)/);
        navigateur = `Safari ${match ? match[1] : ''}`;
    } else if (ua.includes('Chrome')) {
        const match = ua.match(/Chrome\/(\d+)/);
        navigateur = `Chrome ${match ? match[1] : ''}`;
    } else if (ua.includes('Firefox')) {
        const match = ua.match(/Firefox\/(\d+)/);
        navigateur = `Firefox ${match ? match[1] : ''}`;
    } else if (ua.includes('Edge')) {
        navigateur = 'Edge';
    }

    // Détecter l'OS et l'appareil
    // Depuis iPadOS 13, l'iPad se fait passer pour macOS dans le user agent.
    // On le detecte via maxTouchPoints (iPad=5, Mac=0).
    const estIPad = (ua.includes('Mac OS X') && navigator.maxTouchPoints > 1) || ua.includes('iPad');
    const estIPhone = ua.includes('iPhone');

    if (estIPad) {
        os = 'iPadOS';
        appareil = 'iPad';
    } else if (estIPhone) {
        os = 'iOS';
        appareil = 'iPhone';
    } else if (ua.includes('Mac OS X')) {
        const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
        os = `macOS ${match ? match[1].replace(/_/g, '.') : ''}`;
        appareil = 'Mac';
    } else if (ua.includes('Windows')) {
        os = 'Windows';
        appareil = 'PC';
    } else if (ua.includes('Linux')) {
        os = 'Linux';
        appareil = 'PC';
    }

    return { navigateur, os, appareil };
}

/**
 * Obtient l'état actuel de l'application
 */
function obtenirEtatApplication() {
    const etat = {
        version: getVersionApp(),
        build: window.BUILD_ID || 'inconnu',
        dateHeure: new Date().toLocaleString('fr-CA'),
        sectionActive: typeof sectionActive !== 'undefined' ? sectionActive : 'inconnue',
        sousSectionActive: typeof sousSectionActive !== 'undefined' ? sousSectionActive : 'inconnue'
    };

    // Pratique de notation
    try {
        const pratiqueDefaut = db.getSync('pratiqueParDefaut', 'non définie');
        etat.pratiqueParDefaut = pratiqueDefaut;

        const modalites = db.getSync('modalitesEvaluation', {});
        etat.pratiqueActive = modalites.pratique || 'non définie';
    } catch (e) {
        etat.pratiqueParDefaut = 'erreur lecture';
    }

    // Nombre d'étudiants
    try {
        const etudiants = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('groupeEtudiants')
            : db.getSync('groupeEtudiants', []);
        etat.nbEtudiants = Array.isArray(etudiants) ? etudiants.length : 0;
    } catch (e) {
        etat.nbEtudiants = 'erreur';
    }

    // Nombre de cours et cours actif
    try {
        const cours = db.getSync('listeCours', []);
        etat.nbCours = Array.isArray(cours) ? cours.length : 0;
        // Utiliser infoCours (source de vérité) plutôt que chercher dans listeCours
        const infoCours = db.getSync('infoCours', null);
        if (infoCours && infoCours.id) {
            etat.coursActif = `${infoCours.codeCours || infoCours.sigle || infoCours.id} (${infoCours.session || '?'}${infoCours.annee || ''})`;
        } else {
            etat.coursActif = 'aucun';
        }
    } catch (e) {
        etat.nbCours = 'erreur';
    }

    // Nombre de productions
    try {
        const productions = db.getSync(cle('productions'), []);
        etat.nbProductions = Array.isArray(productions) ? productions.length : 0;
    } catch (e) {
        etat.nbProductions = 'erreur';
    }

    // Mode démo
    try {
        etat.modeDemo = db.getSync('modeApplication', 'normal');
    } catch (e) {
        etat.modeDemo = 'erreur';
    }

    return etat;
}

/**
 * ✅ NOUVEAU : Obtient le contexte spécifique à la section active
 */
function obtenirContexteSection() {
    const section = typeof sectionActive !== 'undefined' ? sectionActive : '';
    const sousSection = typeof sousSectionActive !== 'undefined' ? sousSectionActive : '';
    const contexte = {};

    try {
        // Contexte selon la section
        switch (section) {
            case 'reglages':
                if (sousSection === 'trimestre' || sousSection === 'reglages-trimestre') {
                    contexte.trimestreActif = db.getSync('trimestreActif', 'non défini');
                    contexte.infoCours = db.getSync('infoCours', {});
                }
                if (sousSection === 'groupe' || sousSection === 'reglages-groupe') {
                    contexte.dernierImport = sessionStorage.getItem('dernierImportType') || 'aucun';
                }
                if (sousSection === 'donnees' || sousSection === 'reglages-donnees') {
                    contexte.infoCours = db.getSync('infoCours', {});
                    // Vérifier le type de infoCours.enseignant
                    const info = db.getSync('infoCours', {});
                    contexte.typeEnseignant = typeof info?.enseignant;
                }
                break;

            case 'evaluations':
                contexte.nbEvaluations = (db.getSync(cle('evaluationsSauvegardees'), []) || []).length;
                contexte.pratiqueActive = db.getSync('modalitesEvaluation', {})?.pratique || 'non définie';
                break;

            case 'presences':
                // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée
                const clePresences = cle('presences');
                contexte.nbPresences = (db.getSync(clePresences, []) || []).length;
                contexte.horaireActif = db.getSync('horaireActif', 'non défini');
                break;

            case 'construction':
                if (sousSection === 'productions') {
                    contexte.nbProductions = (db.getSync(cle('productions'), []) || []).length;
                }
                if (sousSection === 'grille-criteres') {
                    contexte.nbGrilles = (db.getSync('grillesTemplates', []) || []).length;
                }
                if (sousSection === 'echelle-performance') {
                    contexte.nbEchelles = (db.getSync('echellesTemplates', []) || []).length;
                }
                break;
        }
    } catch (e) {
        contexte.erreur = e.message;
    }

    return contexte;
}

/**
 * ✅ NOUVEAU : Obtient l'état des clés localStorage pertinentes
 */
function obtenirEtatStockage() {
    const clesImportantes = [
        'trimestreActif',
        'coursActifId',
        'groupeActifId',
        'modeApplication',
        'pratiqueParDefaut'
    ];

    const etat = {};
    clesImportantes.forEach(cle => {
        try {
            const valeur = db.getSync(cle, null);
            if (valeur !== null) {
                // Tronquer si trop long
                const valeurStr = typeof valeur === 'string' ? valeur : JSON.stringify(valeur);
                etat[cle] = valeurStr.length > 50 ? valeurStr.substring(0, 50) + '...' : valeurStr;
            }
        } catch (e) {
            etat[cle] = 'erreur lecture';
        }
    });

    // Ajouter les clés namespacées si trimestre actif
    try {
        const trimestre = db.getSync('trimestreActif', null);
        if (trimestre) {
            const cleNamespace = `${trimestre}_groupeEtudiants`;
            const valeur = db.getSync(cleNamespace, null);
            if (valeur) {
                etat[cleNamespace] = `${Array.isArray(valeur) ? valeur.length : '?'} étudiants`;
            }
        }
    } catch (e) {
        // Ignorer
    }

    // Stats de stockage (diagnostic quota)
    if (window._storageStats) {
        var stats = window._storageStats;
        etat['localStorage'] = stats.localStorage.nbCles + ' clés, ' + stats.localStorage.tailleFormatee;
        etat['memoryCache'] = stats.memoryCache.nbCles + ' clés';
        etat['IDB'] = stats.idb.nbCles + ' clés (' + stats.idb.syncLocalStorage + ' sync LS, ' + stats.idb.dansMemoryCache + ' en mémoire)';
    }

    return etat;
}

/**
 * Génère le rapport de bug en texte lisible
 * @param {string} descriptionUtilisateur - Description du problème
 * @param {string} prenomTesteur - Prénom du testeur (optionnel)
 */
function genererRapportBug(descriptionUtilisateur = '', prenomTesteur = '') {
    const infosSysteme = obtenirInfosSysteme();
    const etatApp = obtenirEtatApplication();
    const contexteSection = obtenirContexteSection();
    const etatStockage = obtenirEtatStockage();

    // Générer l'identifiant du rapport
    const maintenant = new Date();
    const dateId = maintenant.toISOString().slice(0, 10); // 2026-01-30
    const heureId = maintenant.toTimeString().slice(0, 8).replace(/:/g, '-'); // 18-42-23
    const prenomNormalise = prenomTesteur.trim().toLowerCase().replace(/\s+/g, '-') || 'anonyme';

    const prefixe = modeRapport === 'commentaire' ? 'FEEDBACK' : 'BUG';
    const idRapport = `${prefixe}_${prenomNormalise}_${dateId}_${heureId}`;

    let rapport = modeRapport === 'commentaire'
        ? `=== COMMENTAIRE / FEEDBACK ===\n`
        : `=== RAPPORT DE BUG ===\n`;
    rapport += `${idRapport}.txt\n`;
    rapport += `Testeur: ${prenomTesteur.trim() || 'Non spécifié'}\n`;
    rapport += `Date: ${etatApp.dateHeure}\n`;
    rapport += `Version: ${etatApp.version} (Build ${etatApp.build})\n\n`;

    rapport += `--- SYSTÈME ---\n`;
    rapport += `Appareil: ${infosSysteme.appareil || 'Inconnu'}\n`;
    rapport += `Navigateur: ${infosSysteme.navigateur}\n`;
    rapport += `Système: ${infosSysteme.os}\n`;
    rapport += `Écran: ${window.screen.width}x${window.screen.height} (${window.devicePixelRatio || 1}x)\n`;
    rapport += `Touch: ${navigator.maxTouchPoints || 0} points\n\n`;

    rapport += `--- APPLICATION ---\n`;
    rapport += `Section active: ${etatApp.sectionActive} > ${etatApp.sousSectionActive}\n`;
    rapport += `Pratique par défaut: ${etatApp.pratiqueParDefaut}\n`;
    rapport += `Pratique active: ${etatApp.pratiqueActive}\n`;
    rapport += `Cours actif: ${etatApp.coursActif}\n`;
    rapport += `Nb cours: ${etatApp.nbCours}\n`;
    rapport += `Nb étudiants: ${etatApp.nbEtudiants}\n`;
    rapport += `Nb productions: ${etatApp.nbProductions}\n`;
    rapport += `Mode: ${etatApp.modeDemo}\n\n`;

    // ✅ NOUVEAU : Contexte section
    if (Object.keys(contexteSection).length > 0) {
        rapport += `--- CONTEXTE SECTION ---\n`;
        for (const [cle, valeur] of Object.entries(contexteSection)) {
            const valeurAffichee = typeof valeur === 'object' ? JSON.stringify(valeur) : valeur;
            rapport += `${cle}: ${valeurAffichee}\n`;
        }
        rapport += `\n`;
    }

    // ✅ NOUVEAU : État stockage
    if (Object.keys(etatStockage).length > 0) {
        rapport += `--- ÉTAT STOCKAGE ---\n`;
        for (const [cle, valeur] of Object.entries(etatStockage)) {
            rapport += `${cle}: ${valeur}\n`;
        }
        rapport += `\n`;
    }

    // ✅ NOUVEAU : Historique des actions
    if (dernieresActions.length > 0) {
        rapport += `--- DERNIÈRES ACTIONS (${dernieresActions.length}) ---\n`;
        dernieresActions.forEach(action => {
            rapport += `[${action.timestamp}] ${action.type}: ${action.details}\n`;
        });
        rapport += `\n`;
    }

    // Erreurs avec stack trace
    if (dernieresErreurs.length > 0) {
        rapport += `--- ERREURS CONSOLE (${dernieresErreurs.length}) ---\n`;
        dernieresErreurs.forEach(err => {
            rapport += `[${err.timestamp}] ${err.message}\n`;
            // ✅ Stack trace complet (limité à 5 lignes)
            if (err.stack) {
                const stackLines = err.stack.split('\n').slice(0, 5);
                stackLines.forEach(line => {
                    if (line.trim()) {
                        rapport += `    ${line.trim()}\n`;
                    }
                });
            }
        });
        rapport += `\n`;
    } else {
        rapport += `--- ERREURS CONSOLE ---\n`;
        rapport += `Aucune erreur détectée\n\n`;
    }

    if (descriptionUtilisateur) {
        const labelDescription = modeRapport === 'commentaire'
            ? `--- COMMENTAIRE ---`
            : `--- DESCRIPTION DU PROBLÈME ---`;
        rapport += `${labelDescription}\n`;
        rapport += `${descriptionUtilisateur}\n\n`;
    }

    rapport += modeRapport === 'commentaire'
        ? `=== FIN DU COMMENTAIRE ===`
        : `=== FIN DU RAPPORT ===`;

    return rapport;
}

// ===============================
// CAPTURE D'ÉCRAN
// ===============================

/**
 * ✅ NOUVEAU : Capture une capture d'écran de la page
 * Utilise html2canvas si disponible, sinon indique comment faire manuellement
 */
async function capturerEcran() {
    // Vérifier si html2canvas est disponible
    if (typeof html2canvas === 'function') {
        try {
            const canvas = await html2canvas(document.body, {
                scale: 0.5, // Réduire la taille
                logging: false,
                useCORS: true
            });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error('Erreur capture écran:', e);
            return null;
        }
    }
    return null;
}

/**
 * ✅ NOUVEAU : Télécharge la capture d'écran
 */
async function telechargerCaptureEcran(btn) {
    const modal = document.getElementById('modalRapportBug');
    if (!modal) return;

    // Sauvegarder le texte original du bouton
    const texteOriginal = btn ? btn.textContent : '📸 Capture écran';

    // Cacher le modal temporairement
    modal.classList.add('u-hide');

    // Créer un overlay de décompte
    const overlay = document.createElement('div');
    overlay.id = 'overlayDecompteCapture';
    overlay.innerHTML = `
        <div style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; flex-direction: column;
            align-items: center; justify-content: center; z-index: 10002;
            color: white; font-family: system-ui, sans-serif;">
            <div id="decompteNumero" style="font-size: 6rem; font-weight: bold; margin-bottom: 20px;">3</div>
            <div style="font-size: 1.5rem; margin-bottom: 30px;">Prends ta capture d'écran maintenant !</div>
            <div style="font-size: 1rem; opacity: 0.8; text-align: center; max-width: 400px;">
                <strong>Mac:</strong> Cmd + Shift + 4<br>
                <strong>Windows:</strong> Win + Shift + S<br>
                <strong>iPad:</strong> Power + Volume haut
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Décompte de 3 secondes
    const decompteEl = document.getElementById('decompteNumero');
    let compte = 3;

    const intervalle = setInterval(() => {
        compte--;
        if (compte > 0) {
            decompteEl.textContent = compte;
        } else {
            clearInterval(intervalle);
            // Retirer l'overlay et réafficher le modal
            overlay.remove();
            modal.classList.remove('u-hide');

            // Feedback visuel sur le bouton
            const btnCapture = document.getElementById('btnCaptureEcran');
            if (btnCapture) {
                btnCapture.textContent = '✓ Temps écoulé';
                btnCapture.style.background = 'var(--vert-positif)';
                setTimeout(() => {
                    btnCapture.textContent = texteOriginal;
                    btnCapture.style.background = '';
                }, 2000);
            }
        }
    }, 1000);
}

// ===============================
// INTERFACE UTILISATEUR
// ===============================

/**
 * Met à jour l'affichage du mode (bug vs commentaire)
 */
function mettreAJourModeRapport() {
    const btnBug = document.getElementById('btnModeBug');
    const btnComment = document.getElementById('btnModeCommentaire');
    const labelDescription = document.getElementById('labelDescriptionBug');
    const textarea = document.getElementById('descriptionBug');

    if (btnBug && btnComment) {
        if (modeRapport === 'bug') {
            btnBug.style.background = 'var(--accent-primaire)';
            btnBug.style.color = 'white';
            btnComment.style.background = 'transparent';
            btnComment.style.color = 'var(--gris-fonce)';
        } else {
            btnComment.style.background = 'var(--accent-primaire)';
            btnComment.style.color = 'white';
            btnBug.style.background = 'transparent';
            btnBug.style.color = 'var(--gris-fonce)';
        }
    }

    if (labelDescription) {
        labelDescription.textContent = modeRapport === 'commentaire'
            ? 'Ton commentaire ou suggestion :'
            : 'Décris le problème rencontré :';
    }

    if (textarea && !textarea.value) {
        textarea.placeholder = modeRapport === 'commentaire'
            ? "Dis-nous ce que tu penses de l'app.\n- Ce qui fonctionne bien\n- Ce qui pourrait être amélioré\n- Tes suggestions"
            : "Exemple :\n- J'étais dans la section Réglages > Cours\n- J'ai cliqué sur le bouton «Ajouter un cours»\n- Rien ne s'est passé (ou message d'erreur...)\n- Je m'attendais à voir le formulaire de création";
    }

    // Mettre à jour le rapport
    mettreAJourRapport();
}

/**
 * Change le mode du rapport
 */
function changerModeRapport(mode) {
    modeRapport = mode;
    mettreAJourModeRapport();
}

/**
 * Ouvre le modal de rapport de bug
 */
function ouvrirModalRapportBug() {
    // Réinitialiser le mode
    modeRapport = 'bug';

    // Charger les résolutions au passage
    chargerResolutions().then(() => {
        const sectionSuivi = document.getElementById('sectionSuiviBugs');
        if (sectionSuivi) {
            sectionSuivi.outerHTML = genererSectionSuivi();
        }
    });

    // Récupérer le prénom sauvegardé
    const prenomSauvegarde = localStorage.getItem(CLE_PRENOM_TESTEUR) || '';

    // Générer le rapport initial (sans description, avec prénom sauvegardé)
    const rapportInitial = genererRapportBug('', prenomSauvegarde);

    const modalHTML = `
        <div id="modalRapportBug" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: var(--surface-conteneur, #162c36);
                border-radius: 12px;
                width: 90%;
                max-width: 700px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
            ">
                <!-- En-tête -->
                <div style="
                    padding: 20px 25px;
                    border-bottom: 1px solid var(--gris-clair);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bleu-tres-pale);
                    border-radius: 12px 12px 0 0;
                ">
                    <h2 style="margin: 0; color: var(--accent-primaire); font-size: 1.3rem;">
                        Signaler un problème
                    </h2>
                    <button data-action="fermerModalRapportBug" style="
                        background: none;
                        border: none;
                        font-size: 1.8rem;
                        cursor: pointer;
                        color: var(--gris-fonce);
                        padding: 0;
                        line-height: 1;
                    ">&times;</button>
                </div>

                <!-- Contenu -->
                <div style="padding: 25px;">

                    <!-- Sélecteur de mode -->
                    <div style="display: flex; gap: 0; margin-bottom: 20px; border: 1px solid var(--bordure-claire); border-radius: 8px; overflow: hidden;">
                        <button id="btnModeBug" data-action="changerModeRapport" data-param="bug" style="
                            flex: 1; padding: 10px; border: none; cursor: pointer;
                            font-family: inherit; font-size: 0.9rem; font-weight: 600;
                            background: var(--accent-primaire); color: white;
                            transition: all 0.2s;">
                            🐛 Signaler un bug
                        </button>
                        <button id="btnModeCommentaire" data-action="changerModeRapport" data-param="commentaire" style="
                            flex: 1; padding: 10px; border: none; cursor: pointer;
                            font-family: inherit; font-size: 0.9rem; font-weight: 600;
                            background: transparent; color: var(--gris-fonce);
                            transition: all 0.2s;">
                            💬 Partager un commentaire
                        </button>
                    </div>

                    <!-- Instructions -->
                    <div class="info-box info-box--attention" style="
                        margin-bottom: 20px;
                        border-radius: 0 8px 8px 0;
                    ">
                        <strong>Comment signaler un bug :</strong>
                        <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                            <li>Décris le problème ci-dessous</li>
                            <li>Clique sur «Copier le rapport»</li>
                            <li>Envoie-le par courriel avec tes captures d'écran</li>
                        </ol>
                    </div>

                    <!-- Prénom du testeur -->
                    <div style="margin-bottom: 20px;">
                        <label for="prenomTesteur" style="
                            display: block;
                            font-weight: 600;
                            margin-bottom: 8px;
                            color: var(--accent-primaire);
                        ">
                            Ton prénom :
                        </label>
                        <input type="text" id="prenomTesteur" placeholder="Ex: Grégoire" value="${echapperHtmlLocal(prenomSauvegarde)}" style="
                            width: 100%;
                            max-width: 250px;
                            padding: 10px 12px;
                            border: 1px solid var(--gris-clair);
                            border-radius: 8px;
                            font-family: inherit;
                            font-size: 0.95rem;
                            box-sizing: border-box;
                        " data-on-input="sauvegarderPrenomEtMettreAJour">
                    </div>

                    <!-- Description du problème -->
                    <div id="sectionFormulaireBug" style="margin-bottom: 20px;">
                        <label id="labelDescriptionBug" for="descriptionBug" style="
                            display: block;
                            font-weight: 600;
                            margin-bottom: 8px;
                            color: var(--accent-primaire);
                        ">
                            Décris le problème rencontré :
                        </label>
                        <textarea id="descriptionBug" placeholder="Exemple :
- J'étais dans la section Réglages > Cours
- J'ai cliqué sur le bouton «Ajouter un cours»
- Rien ne s'est passé (ou message d'erreur...)
- Je m'attendais à voir le formulaire de création" style="
                            width: 100%;
                            height: 100px;
                            padding: 12px;
                            border: 1px solid var(--gris-clair);
                            border-radius: 8px;
                            font-family: inherit;
                            font-size: 0.95rem;
                            resize: vertical;
                            box-sizing: border-box;
                        " data-on-input="mettreAJourRapport"></textarea>
                    </div>

                    <!-- Rapport généré -->
                    <div style="margin-bottom: 20px;">
                        <label style="
                            display: block;
                            font-weight: 600;
                            margin-bottom: 8px;
                            color: var(--accent-primaire);
                        ">
                            Rapport technique (généré automatiquement) :
                        </label>
                        <pre id="rapportBugTexte" style="
                            background: var(--gris-tres-pale);
                            padding: 15px;
                            border-radius: 8px;
                            font-size: 0.75rem;
                            overflow-x: auto;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            max-height: 300px;
                            overflow-y: auto;
                            border: 1px solid var(--gris-clair);
                            margin: 0;
                        ">${typeof echapperHtml === 'function' ? echapperHtml(rapportInitial) : rapportInitial}</pre>
                    </div>

                    <!-- Boutons d'action -->
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 15px;">
                        <button id="btnCopierRapport" data-action="copierRapportBug" class="btn btn-principal" style="flex: 1; min-width: 120px;">
                            Copier le rapport
                        </button>
                        <button id="btnTelechargerTxt" data-action="telechargerRapportTxt" class="btn btn-secondaire" style="flex: 1; min-width: 120px;">
                            Enregistrer en TXT
                        </button>
                        <button id="btnEnvoyerCourriel" data-action="envoyerRapportParCourriel" class="btn btn-secondaire" style="flex: 1; min-width: 120px;">
                            Envoyer par courriel
                        </button>
                    </div>

                    <!-- Note captures d'écran -->
                    <div style="
                        padding: 12px;
                        background: var(--bleu-tres-pale);
                        border-radius: 8px;
                        font-size: 0.85rem;
                        margin-bottom: 15px;
                    ">
                        <strong>Captures d'écran :</strong>
                        Mac: <code style="background: var(--bordure-claire); padding: 2px 6px; border-radius: 4px;">Cmd+Shift+4</code> |
                        Windows: <code style="background: var(--bordure-claire); padding: 2px 6px; border-radius: 4px;">Win+Shift+S</code> |
                        iPad: <code style="background: var(--bordure-claire); padding: 2px 6px; border-radius: 4px;">Power+Vol.haut</code>
                    </div>

                    <!-- Section suivi des tickets -->
                    ${genererSectionSuivi()}

                    <!-- Lien vers archives -->
                    <div style="text-align: center;">
                        <button data-action="ouvrirModalRapportsArchives" style="
                            background: none; border: none; color: var(--accent-primaire);
                            cursor: pointer; font-size: 0.85rem; text-decoration: underline;">
                            📋 Voir mes rapports archivés
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal
    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
}

/**
 * Ferme le modal de rapport de bug
 */
function fermerModalRapportBug() {
    const modal = document.getElementById('modalRapportBug');
    if (modal && modal.parentElement) {
        modal.parentElement.remove();
    }
}

/**
 * Sauvegarde le prénom et met à jour le rapport + la section suivi
 */
function sauvegarderPrenomEtMettreAJour() {
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    localStorage.setItem(CLE_PRENOM_TESTEUR, prenom);

    // Rafraîchir la section suivi avec le nouveau prénom
    const sectionSuivi = document.getElementById('sectionSuiviBugs');
    if (sectionSuivi) {
        sectionSuivi.outerHTML = genererSectionSuivi();
    }

    // Mettre à jour le badge
    mettreAJourBadgeBug();

    // Mettre à jour le rapport technique
    mettreAJourRapport();
}

/**
 * Met à jour le rapport avec la description de l'utilisateur
 */
function mettreAJourRapport() {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);
    const pre = document.getElementById('rapportBugTexte');
    if (pre) {
        pre.textContent = rapport;
    }
}

/**
 * Copie le rapport dans le presse-papiers
 */
async function copierRapportBug(btn) {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);

    try {
        await navigator.clipboard.writeText(rapport);

        // Archiver le rapport localement
        archiverRapportBug(rapport, description, prenom, modeRapport === 'commentaire' ? 'commentaire' : 'bug');

        // Feedback visuel
        if (btn) {
            const texteOriginal = btn.textContent;
            btn.textContent = '✓ Copié !';
            btn.style.background = 'var(--vert-positif)';

            setTimeout(() => {
                btn.textContent = texteOriginal;
                btn.style.background = '';
            }, 2000);
        }
    } catch (err) {
        alert('Erreur lors de la copie. Sélectionne manuellement le texte du rapport.');
    }
}

/**
 * Enregistre le rapport en fichier TXT avec choix de l'emplacement
 * Utilise File System Access API si disponible (Chrome/Edge), sinon fallback
 */
async function telechargerRapportTxt(btn) {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);

    // Générer le nom du fichier avec date et prénom
    const maintenant = new Date();
    const dateStr = maintenant.toISOString().slice(0, 10); // 2026-02-01
    const heureStr = maintenant.toTimeString().slice(0, 8).replace(/:/g, '-'); // 21-45-00
    const prenomNormalise = prenom.trim().toLowerCase().replace(/\s+/g, '-') || 'anonyme';
    const prefixe = modeRapport === 'commentaire' ? 'FEEDBACK' : 'BUG';
    const nomFichier = `${prefixe}_${prenomNormalise}_${dateStr}_${heureStr}.txt`;

    let succes = false;

    // Essayer File System Access API (Chrome/Edge) pour choix de l'emplacement
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: nomFichier,
                types: [{
                    description: 'Fichier texte',
                    accept: { 'text/plain': ['.txt'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(rapport);
            await writable.close();
            succes = true;
        } catch (e) {
            // L'utilisateur a annulé ou erreur — fallback
            if (e.name !== 'AbortError') {
                console.warn('File System Access API non disponible, fallback téléchargement classique');
            } else {
                // Annulé par l'utilisateur, ne pas faire de fallback
                return;
            }
        }
    }

    // Fallback : téléchargement classique (Safari, Firefox, ou si erreur)
    if (!succes) {
        const blob = new Blob([rapport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
        succes = true;
    }

    // Archiver le rapport localement
    archiverRapportBug(rapport, description, prenom, modeRapport === 'commentaire' ? 'commentaire' : 'bug');

    // Feedback visuel
    if (btn && succes) {
        const texteOriginal = btn.textContent;
        btn.textContent = '✓ Enregistré !';
        btn.style.background = 'var(--vert-positif)';
        setTimeout(() => {
            btn.textContent = texteOriginal;
            btn.style.background = '';
        }, 2000);
    }
}

/**
 * Ouvre le client courriel avec le rapport pré-rempli
 */
function envoyerRapportParCourriel(btn) {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);

    // Nettoyer les caractères UTF-16 invalides (surrogates isolés)
    // Compatible Safari/iOS (pas de lookbehind)
    const nettoyerUTF16 = (str) => {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            // High surrogate (0xD800-0xDBFF)
            if (code >= 0xD800 && code <= 0xDBFF) {
                const nextCode = str.charCodeAt(i + 1);
                // Vérifie si suivi d'un low surrogate valide
                if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                    result += str[i] + str[i + 1];
                    i++; // Sauter le low surrogate
                } else {
                    result += '\uFFFD'; // Surrogate isolé → remplacement
                }
            }
            // Low surrogate isolé (pas précédé d'un high surrogate)
            else if (code >= 0xDC00 && code <= 0xDFFF) {
                result += '\uFFFD';
            }
            else {
                result += str[i];
            }
        }
        return result;
    };

    try {
        // Construire le mailto
        const typeLabel = modeRapport === 'commentaire' ? 'Feedback' : 'Bug';
        const sujet = encodeURIComponent(`[${typeLabel} Monitorage ${getVersionApp()}] ${description.substring(0, 50) || 'Rapport de bug'}...`);
        const corpsNettoye = nettoyerUTF16(rapport + '\n\n--- JOINS TES CAPTURES D\'ÉCRAN À CE COURRIEL ---');
        const corps = encodeURIComponent(corpsNettoye);

        // Archiver le rapport localement
        archiverRapportBug(rapport, description, prenom, modeRapport === 'commentaire' ? 'commentaire' : 'bug');

        // Feedback visuel
        if (btn) {
            const texteOriginal = btn.textContent;
            btn.textContent = '✓ Envoyé !';
            btn.style.background = 'var(--vert-positif)';
            setTimeout(() => {
                btn.textContent = texteOriginal;
                btn.style.background = '';
            }, 2000);
        }

        // Ouvrir le client courriel
        window.location.href = `mailto:labo@codexnumeris.org?subject=${sujet}&body=${corps}`;
    } catch (e) {
        console.error('Erreur lors de l\'envoi par courriel:', e);
        alert('Erreur lors de la préparation du courriel.\n\nUtilisez le bouton "Copier" pour copier le rapport manuellement.');
    }
}

// ===============================
// INITIALISATION AU CHARGEMENT
// ===============================

// Charger les résolutions et mettre à jour le badge au démarrage
document.addEventListener('DOMContentLoaded', function() {
    chargerResolutions().then(() => {
        mettreAJourBadgeBug();
    });
});

// ===============================
// EXPORTS GLOBAUX
// ===============================

window.ouvrirModalRapportBug = ouvrirModalRapportBug;
window.fermerModalRapportBug = fermerModalRapportBug;
window.mettreAJourRapport = mettreAJourRapport;
window.sauvegarderPrenomEtMettreAJour = sauvegarderPrenomEtMettreAJour;
window.copierRapportBug = copierRapportBug;
window.telechargerRapportTxt = telechargerRapportTxt;
window.envoyerRapportParCourriel = envoyerRapportParCourriel;
window.telechargerCaptureEcran = telechargerCaptureEcran;
window.enregistrerAction = enregistrerAction;
// Gestion des rapports archivés
window.ouvrirModalRapportsArchives = ouvrirModalRapportsArchives;
window.fermerModalRapportsArchives = fermerModalRapportsArchives;
window.supprimerEtRafraichirArchive = supprimerEtRafraichirArchive;
window.rafraichirListeArchives = rafraichirListeArchives;
window.afficherRapportComplet = afficherRapportComplet;
window.viderRapportsArchives = viderRapportsArchives;
window.viderEtRafraichirArchives = viderEtRafraichirArchives;
// Suivi des tickets
window.confirmerTicket = confirmerTicket;
window.rouvrirTicket = rouvrirTicket;
window.chargerResolutions = chargerResolutions;
window.mettreAJourBadgeBug = mettreAJourBadgeBug;
// Mode rapport
window.changerModeRapport = changerModeRapport;



})();
