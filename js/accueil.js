/* ===============================
   MODULE: PAGE D'ACCUEIL
   Chantier 3 — Page d'accueil permanente

   Deux états :
   - Premier lancement (aucun cours) : 2 cartes (créer cours + démo)
   - Retour (cours existants) : 4 cartes par intention + infos cours

   Exports: afficherAccueil, initialiserAccueil, definirModeExpert
   =============================== */

(function() {
'use strict';

/**
 * Vérifie si c'est le premier lancement (aucun cours réel créé)
 */
function estPremierLancement() {
    const listeCours = db.getSync('listeCours', []);
    return listeCours.length === 0 || listeCours.every(c => c.isDemo || c.estDemo);
}

/**
 * Génère et affiche le contenu de la page d'accueil
 * Adapte le contenu selon l'état (premier lancement vs retour)
 */
function afficherAccueil() {
    const conteneur = document.getElementById('accueil-contenu');
    if (!conteneur) return;

    if (estPremierLancement()) {
        afficherAccueilPremierLancement(conteneur);
    } else {
        afficherAccueilRetour(conteneur);
    }
}

/**
 * Affichage premier lancement : bienvenue + 2 cartes
 */
function afficherAccueilPremierLancement(conteneur) {
    conteneur.innerHTML = `
        <div class="accueil-hero">
            <h1>Bienvenue dans le Monitorage</h1>
            <p class="accueil-sous-titre">Explorer. R\u00e9fl\u00e9chir. Transformer.</p>
            <p class="accueil-description">
                Un outil de suivi p\u00e9dagogique pour observer la progression de vos \u00e9tudiants
                et prioriser vos interventions.
            </p>
        </div>

        <div class="accueil-cartes">
            <div class="accueil-carte" onclick="if(typeof ouvrirModalConversationnel==='function') ouvrirModalConversationnel();">
                <div class="accueil-carte-icone">&#x1F393;</div>
                <div class="accueil-carte-titre">Cr\u00e9er mon premier cours</div>
                <div class="accueil-carte-desc">
                    Configurez votre cours en quelques \u00e9tapes guid\u00e9es.
                </div>
            </div>
            <div class="accueil-carte" onclick="if(typeof entrerEnDemo==='function') entrerEnDemo();">
                <div class="accueil-carte-icone">&#x1F50D;</div>
                <div class="accueil-carte-titre">Explorer la d\u00e9mo</div>
                <div class="accueil-carte-desc">
                    D\u00e9couvrez l\u2019application avec des donn\u00e9es fictives de 20\u00a0\u00e9tudiants.
                </div>
            </div>
        </div>

        <div class="accueil-pied">
            <span style="font-size: 0.8rem; color: var(--gris-moyen);">
                Monitorage p\u00e9dagogique \u2014 Suivi de l\u2019apprentissage
            </span>
        </div>
    `;
}

/**
 * Affichage retour : info cours actif + 4 cartes par intention
 */
function afficherAccueilRetour(conteneur) {
    // Récupérer infos du cours actif
    const infoCours = db.getSync('infoCours', null);
    let coursHTML = '';

    if (infoCours) {
        const sigle = infoCours.sigle || '';
        const titre = infoCours.titre || '';
        const groupe = infoCours.groupe || '';
        const session = infoCours.session || '';
        const annee = infoCours.annee || '';
        const detail = [sigle, groupe ? `Groupe ${groupe}` : '', session && annee ? `${session}${annee}` : ''].filter(Boolean).join(' \u2022 ');

        coursHTML = `
            <div class="accueil-cours-actif">
                <span class="accueil-cours-icone">&#x1F4DA;</span>
                <div class="accueil-cours-info">
                    <div class="accueil-cours-nom">${echapperHtml(titre || sigle)}</div>
                    <div class="accueil-cours-detail">${echapperHtml(detail)}</div>
                </div>
            </div>
        `;
    }

    conteneur.innerHTML = `
        <div class="accueil-hero">
            <h1>Que souhaitez-vous faire\u00a0?</h1>
        </div>

        ${coursHTML}

        <div class="accueil-cartes accueil-cartes--8">
            <div class="accueil-carte" onclick="afficherSection('presences');">
                <div class="accueil-carte-icone">&#x1F4CB;</div>
                <div class="accueil-carte-titre">Saisir les pr\u00e9sences</div>
                <div class="accueil-carte-desc">
                    Saisir les pr\u00e9sences du jour pour votre groupe et inclure des observations.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('evaluations'); setTimeout(function(){ afficherSousSection('evaluations-travaux'); }, 100);">
                <div class="accueil-carte-icone">&#x1F4DD;</div>
                <div class="accueil-carte-titre">Annoter des travaux</div>
                <div class="accueil-carte-desc">
                    Annoter les travaux et y apposer des r\u00e9troactions cibl\u00e9es et visuelles.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('evaluations'); setTimeout(function(){ afficherSousSection('evaluations-liste'); }, 100);">
                <div class="accueil-carte-icone">&#x2696;&#xFE0F;</div>
                <div class="accueil-carte-titre">\u00c9valuer une production</div>
                <div class="accueil-carte-desc">
                    Appliquer une grille de crit\u00e8res et construire une r\u00e9troaction diff\u00e9renci\u00e9e.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('tableau-bord');">
                <div class="accueil-carte-icone">&#x1F4C8;</div>
                <div class="accueil-carte-titre">Voir l'\u00e9tat des lieux</div>
                <div class="accueil-carte-desc">
                    Suivre la participation, les r\u00e9sultats et la progression du groupe.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('planification'); setTimeout(function(){ afficherSousSection('planification-carte'); }, 100);">
                <div class="accueil-carte-icone">\uD83D\uDDFA\uFE0F</div>
                <div class="accueil-carte-titre">Planifier mon cours</div>
                <div class="accueil-carte-desc">
                    Planifier et organiser les s\u00e9quences, le\u00e7ons et activit\u00e9s pour leur alignement p\u00e9dagogique.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('tableau-bord'); setTimeout(function(){ afficherSousSection('tableau-bord-profil'); }, 100);">
                <div class="accueil-carte-icone">\uD83D\uDC64</div>
                <div class="accueil-carte-titre">Consulter un profil \u00e9tudiant</div>
                <div class="accueil-carte-desc">
                    Consulter le portrait d\u2019un \u00e9l\u00e8ve\u00a0: pr\u00e9sences, r\u00e9sultats et progression.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherModalNouveautes();">
                <div class="accueil-carte-icone"><span class="pastille-nouveautes" title="Nouveaut\u00e9s">\u2709\uFE0F</span></div>
                <div class="accueil-carte-titre">Suivre le d\u00e9veloppement du projet</div>
                <div class="accueil-carte-desc">
                    Prendre connaissance des nouvelles fonctionnalit\u00e9s et des r\u00e9centes corrections de bugs.
                </div>
            </div>
            <div class="accueil-carte" onclick="if(window.backupReminder) window.backupReminder.afficherModal();">
                <div class="accueil-carte-icone">\uD83D\uDCBE</div>
                <div class="accueil-carte-titre">Faire une sauvegarde des donn\u00e9es</div>
                <div class="accueil-carte-desc">
                    Exporter en lieu s\u00fbr tout votre mat\u00e9riel dans un document JSON.
                </div>
            </div>
        </div>

        <div class="accueil-pied">
            <button onclick="if(typeof entrerEnDemo==='function') entrerEnDemo();">Explorer la d\u00e9mo</button>
            <span class="accueil-separateur">|</span>
            <button onclick="afficherSection('tableau-bord');">Tableau de bord complet</button>
        </div>
    `;

    // Mettre a jour la pastille des nouveautes (elle est maintenant dans le DOM)
    if (typeof mettreAJourPastille === 'function') mettreAJourPastille();
}

/**
 * Active ou désactive le mode expert (ouvrir direct sur tableau de bord)
 */
function definirModeExpert(actif) {
    const prefs = db.getSync('preferencesAffichage', {});
    prefs.modeExpert = !!actif;
    db.setSync('preferencesAffichage', prefs);
}

/**
 * Initialise le module accueil
 * Appelé par main.js au démarrage
 */
function initialiserAccueil() {
    // Charger l'état du checkbox mode expert si la section réglages est présente
    const checkbox = document.getElementById('checkbox-mode-expert');
    if (checkbox) {
        const prefs = db.getSync('preferencesAffichage', {});
        checkbox.checked = !!prefs.modeExpert;
    }
}

// === EXPORTS ===
window.afficherAccueil = afficherAccueil;
window.initialiserAccueil = initialiserAccueil;
window.definirModeExpert = definirModeExpert;


})();
