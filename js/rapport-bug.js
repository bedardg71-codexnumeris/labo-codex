/* ===============================
   MODULE: RAPPORT DE BUG POUR TESTEURS
   Beta 95.5 - 18 janvier 2026

   Permet aux testeurs d'envoyer facilement des rapports de bug
   avec les informations techniques nécessaires au débogage.
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

// Intercepter console.error pour capturer les erreurs
const originalConsoleError = console.error;
console.error = function(...args) {
    // Appeler l'original
    originalConsoleError.apply(console, args);

    // Stocker l'erreur
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    const message = args.map(arg => {
        if (arg instanceof Error) {
            return `${arg.message} (${arg.stack?.split('\n')[1]?.trim() || 'no stack'})`;
        }
        return String(arg);
    }).join(' ');

    dernieresErreurs.push({ timestamp, message });

    // Garder seulement les dernières erreurs
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
};

// Capturer aussi les erreurs non gérées
window.addEventListener('error', (event) => {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    dernieresErreurs.push({
        timestamp,
        message: `[UNCAUGHT] ${event.message} at ${event.filename}:${event.lineno}`
    });
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
});

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
    // ✅ NAMESPACING (Beta 95.5)
    try {
        const etudiants = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('groupeEtudiants')
            : db.getSync('groupeEtudiants', []);
        etat.nbEtudiants = etudiants.length;
    } catch (e) {
        etat.nbEtudiants = 'erreur';
    }

    // Nombre de cours
    try {
        const cours = db.getSync('listeCours', []);
        etat.nbCours = cours.length;
        const coursActif = cours.find(c => c.actif);
        etat.coursActif = coursActif ? `${coursActif.codeCours} (${coursActif.session}${coursActif.annee})` : 'aucun';
    } catch (e) {
        etat.nbCours = 'erreur';
    }

    // Nombre de productions
    try {
        const productions = db.getSync('productions', []);
        etat.nbProductions = productions.length;
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
 * Génère le rapport de bug en texte lisible
 */
function genererRapportBug(descriptionUtilisateur = '') {
    const infosSysteme = obtenirInfosSysteme();
    const etatApp = obtenirEtatApplication();

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

    if (dernieresErreurs.length > 0) {
        rapport += `--- ERREURS CONSOLE (${dernieresErreurs.length}) ---\n`;
        dernieresErreurs.forEach(err => {
            rapport += `[${err.timestamp}] ${err.message}\n`;
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
                            font-size: 0.8rem;
                            overflow-x: auto;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            max-height: 250px;
                            overflow-y: auto;
                            border: 1px solid var(--gris-clair);
                            margin: 0;
                        ">${echapperHtml(rapportInitial)}</pre>
                    </div>

                    <!-- Boutons d'action -->
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button onclick="copierRapportBug()" class="btn btn-principal" style="flex: 1; min-width: 150px;">
                            Copier le rapport
                        </button>
                        <button onclick="envoyerRapportParCourriel()" class="btn btn-secondaire" style="flex: 1; min-width: 150px;">
                            Envoyer par courriel
                        </button>
                    </div>

                    <!-- Note captures d'écran -->
                    <div style="
                        margin-top: 20px;
                        padding: 15px;
                        background: var(--bleu-tres-pale);
                        border-radius: 8px;
                        font-size: 0.9rem;
                    ">
                        <strong>Captures d'écran :</strong><br>
                        Sur Mac : <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">Cmd + Shift + 4</code><br>
                        Sur Windows : <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">Win + Shift + S</code><br>
                        Sur iPad : <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">Bouton Power + Volume haut</code><br>
                        <span style="color: var(--gris-moyen);">Joignez vos captures au courriel pour aider au débogage.</span>
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

console.log('Module rapport-bug.js chargé');
