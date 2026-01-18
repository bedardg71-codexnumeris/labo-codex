/* ===============================
   MODULE: RAPPORT DE BUG POUR TESTEURS
   Beta 95.5 - 18 janvier 2026

   Permet aux testeurs d'envoyer facilement des rapports de bug
   avec les informations techniques nécessaires au débogage.

   ✅ AMÉLIORATIONS (18 jan 2026) :
   - Stack trace complet pour les erreurs
   - Historique des 10 dernières actions (clics, navigation)
   - Contexte de données selon la section active
   - Capture d'écran intégrée
   - État stockage pertinent
   =============================== */

// ===============================
// VERSION DE L'APPLICATION
// ===============================

/**
 * Version actuelle de l'application
 * ⚠️ MODIFIER ICI lors de chaque nouvelle release
 */
const VERSION_APP = 'Beta 95.5';

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
const MAX_ACTIONS = 10;

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

    // Détecter l'OS
    if (ua.includes('Mac OS X')) {
        const match = ua.match(/Mac OS X (\d+[._]\d+)/);
        os = `macOS ${match ? match[1].replace('_', '.') : ''}`;
    } else if (ua.includes('Windows')) {
        os = 'Windows';
    } else if (ua.includes('iPad')) {
        os = 'iPadOS';
    } else if (ua.includes('iPhone')) {
        os = 'iOS';
    } else if (ua.includes('Linux')) {
        os = 'Linux';
    }

    return { navigateur, os };
}

/**
 * Obtient l'état actuel de l'application
 */
function obtenirEtatApplication() {
    const etat = {
        version: VERSION_APP,
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

    // Nombre de cours
    try {
        const cours = db.getSync('listeCours', []);
        etat.nbCours = Array.isArray(cours) ? cours.length : 0;
        const coursActif = Array.isArray(cours) ? cours.find(c => c.actif) : null;
        etat.coursActif = coursActif ? `${coursActif.codeCours} (${coursActif.session}${coursActif.annee})` : 'aucun';
    } catch (e) {
        etat.nbCours = 'erreur';
    }

    // Nombre de productions
    try {
        const productions = db.getSync('productions', []);
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
                contexte.nbEvaluations = (db.getSync('evaluationsSauvegardees', []) || []).length;
                contexte.pratiqueActive = db.getSync('modalitesEvaluation', {})?.pratique || 'non définie';
                break;

            case 'presences':
                contexte.nbPresences = (db.getSync('presences', []) || []).length;
                contexte.horaireActif = db.getSync('horaireActif', 'non défini');
                break;

            case 'construction':
                if (sousSection === 'productions') {
                    contexte.nbProductions = (db.getSync('productions', []) || []).length;
                }
                if (sousSection === 'grille-criteres') {
                    contexte.nbGrilles = (db.getSync('grillesCriteres', []) || []).length;
                }
                if (sousSection === 'echelle-performance') {
                    contexte.nbEchelles = (db.getSync('echellesPerformance', []) || []).length;
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
            const valeur = localStorage.getItem(cle);
            if (valeur !== null) {
                // Tronquer si trop long
                etat[cle] = valeur.length > 50 ? valeur.substring(0, 50) + '...' : valeur;
            }
        } catch (e) {
            etat[cle] = 'erreur lecture';
        }
    });

    // Ajouter les clés namespacées si trimestre actif
    try {
        const trimestre = localStorage.getItem('trimestreActif');
        if (trimestre) {
            const cleNamespace = `${trimestre}_groupeEtudiants`;
            const valeur = localStorage.getItem(cleNamespace);
            if (valeur) {
                try {
                    const parsed = JSON.parse(valeur);
                    etat[cleNamespace] = `${Array.isArray(parsed) ? parsed.length : '?'} étudiants`;
                } catch {
                    etat[cleNamespace] = 'présent (non parseable)';
                }
            }
        }
    } catch (e) {
        // Ignorer
    }

    return etat;
}

/**
 * Génère le rapport de bug en texte lisible
 */
function genererRapportBug(descriptionUtilisateur = '') {
    const infosSysteme = obtenirInfosSysteme();
    const etatApp = obtenirEtatApplication();
    const contexteSection = obtenirContexteSection();
    const etatStockage = obtenirEtatStockage();

    let rapport = `=== RAPPORT DE BUG ===\n`;
    rapport += `Date: ${etatApp.dateHeure}\n`;
    rapport += `Version: ${etatApp.version}\n\n`;

    rapport += `--- SYSTÈME ---\n`;
    rapport += `Navigateur: ${infosSysteme.navigateur}\n`;
    rapport += `Système: ${infosSysteme.os}\n\n`;

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
        rapport += `--- DESCRIPTION DU PROBLÈME ---\n`;
        rapport += `${descriptionUtilisateur}\n\n`;
    }

    rapport += `=== FIN DU RAPPORT ===`;

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
async function telechargerCaptureEcran() {
    const btn = event.target;
    const texteOriginal = btn.textContent;
    btn.textContent = 'Capture en cours...';
    btn.disabled = true;

    try {
        const dataUrl = await capturerEcran();
        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `capture-bug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
            btn.textContent = 'Téléchargé !';
            btn.style.background = 'var(--vert-positif)';
        } else {
            // Pas de html2canvas, expliquer comment faire manuellement
            alert('Capture automatique non disponible.\n\nUtilisez :\n- Mac: Cmd + Shift + 4\n- Windows: Win + Shift + S\n- iPad: Power + Volume haut');
            btn.textContent = texteOriginal;
        }
    } catch (e) {
        alert('Erreur lors de la capture. Utilisez la méthode manuelle.');
        btn.textContent = texteOriginal;
    }

    btn.disabled = false;
    setTimeout(() => {
        btn.textContent = texteOriginal;
        btn.style.background = '';
    }, 2000);
}

// ===============================
// INTERFACE UTILISATEUR
// ===============================

/**
 * Ouvre le modal de rapport de bug
 */
function ouvrirModalRapportBug() {
    // Générer le rapport initial (sans description)
    const rapportInitial = genererRapportBug();

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
                background: white;
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
                    <h2 style="margin: 0; color: var(--bleu-principal); font-size: 1.3rem;">
                        Signaler un problème
                    </h2>
                    <button onclick="fermerModalRapportBug()" style="
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
                    <!-- Instructions -->
                    <div style="
                        background: #fff8e1;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin-bottom: 20px;
                        border-radius: 0 8px 8px 0;
                    ">
                        <strong style="color: #856404;">Comment signaler un bug :</strong>
                        <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
                            <li>Décrivez le problème ci-dessous</li>
                            <li>Cliquez sur «Copier le rapport»</li>
                            <li>Envoyez-le par courriel avec vos captures d'écran</li>
                        </ol>
                    </div>

                    <!-- Description du problème -->
                    <div style="margin-bottom: 20px;">
                        <label for="descriptionBug" style="
                            display: block;
                            font-weight: 600;
                            margin-bottom: 8px;
                            color: var(--bleu-principal);
                        ">
                            Décrivez le problème rencontré :
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
                        " oninput="mettreAJourRapport()"></textarea>
                    </div>

                    <!-- Rapport généré -->
                    <div style="margin-bottom: 20px;">
                        <label style="
                            display: block;
                            font-weight: 600;
                            margin-bottom: 8px;
                            color: var(--bleu-principal);
                        ">
                            Rapport technique (généré automatiquement) :
                        </label>
                        <pre id="rapportBugTexte" style="
                            background: #f5f5f5;
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
                        <button onclick="copierRapportBug()" class="btn btn-principal" style="flex: 1; min-width: 120px;">
                            Copier le rapport
                        </button>
                        <button onclick="telechargerCaptureEcran()" class="btn btn-secondaire" style="flex: 1; min-width: 120px;">
                            📸 Capture écran
                        </button>
                        <button onclick="envoyerRapportParCourriel()" class="btn btn-secondaire" style="flex: 1; min-width: 120px;">
                            Envoyer par courriel
                        </button>
                    </div>

                    <!-- Note captures d'écran -->
                    <div style="
                        padding: 12px;
                        background: var(--bleu-tres-pale);
                        border-radius: 8px;
                        font-size: 0.85rem;
                    ">
                        <strong>Captures d'écran manuelles :</strong>
                        Mac: <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">Cmd+Shift+4</code> |
                        Windows: <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">Win+Shift+S</code> |
                        iPad: <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">Power+Vol.haut</code>
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
 * Met à jour le rapport avec la description de l'utilisateur
 */
function mettreAJourRapport() {
    const description = document.getElementById('descriptionBug')?.value || '';
    const rapport = genererRapportBug(description);
    const pre = document.getElementById('rapportBugTexte');
    if (pre) {
        pre.textContent = rapport;
    }
}

/**
 * Copie le rapport dans le presse-papiers
 */
async function copierRapportBug() {
    const description = document.getElementById('descriptionBug')?.value || '';
    const rapport = genererRapportBug(description);

    try {
        await navigator.clipboard.writeText(rapport);

        // Feedback visuel
        const btn = event.target;
        const texteOriginal = btn.textContent;
        btn.textContent = 'Copié !';
        btn.style.background = 'var(--vert-positif)';

        setTimeout(() => {
            btn.textContent = texteOriginal;
            btn.style.background = '';
        }, 2000);
    } catch (err) {
        alert('Erreur lors de la copie. Sélectionnez manuellement le texte du rapport.');
    }
}

/**
 * Ouvre le client courriel avec le rapport pré-rempli
 */
function envoyerRapportParCourriel() {
    const description = document.getElementById('descriptionBug')?.value || '';
    const rapport = genererRapportBug(description);

    // Construire le mailto
    const sujet = encodeURIComponent(`[Bug Monitorage ${VERSION_APP}] ${description.substring(0, 50) || 'Rapport de bug'}...`);
    const corps = encodeURIComponent(rapport + '\n\n--- JOIGNEZ VOS CAPTURES D\'ÉCRAN À CE COURRIEL ---');

    // Ouvrir le client courriel
    window.location.href = `mailto:labo@codexnumeris.org?subject=${sujet}&body=${corps}`;
}

// ===============================
// EXPORTS GLOBAUX
// ===============================

window.ouvrirModalRapportBug = ouvrirModalRapportBug;
window.fermerModalRapportBug = fermerModalRapportBug;
window.mettreAJourRapport = mettreAJourRapport;
window.copierRapportBug = copierRapportBug;
window.envoyerRapportParCourriel = envoyerRapportParCourriel;
window.telechargerCaptureEcran = telechargerCaptureEcran;
window.enregistrerAction = enregistrerAction; // Pour usage externe si nécessaire

console.log('Module rapport-bug.js chargé (version améliorée)');
