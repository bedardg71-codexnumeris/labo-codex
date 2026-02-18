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
                <div class="accueil-carte-icone">&#x1F6B8;</div>
                <div class="accueil-carte-titre">Explorer la d\u00e9mo</div>
                <div class="accueil-carte-desc">
                    D\u00e9couvrez l\u2019application avec des donn\u00e9es fictives de 20\u00a0\u00e9tudiants.
                </div>
            </div>
        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" style="font-size: 0.8rem; color: var(--gris-moyen); text-decoration: none;">codexnumeris.org</a>
        </div>
    `;
}

/**
 * Affichage retour : info cours actif + 4 cartes par intention
 */
function afficherAccueilRetour(conteneur) {
    // Checkbox démo : activée si en mode démo, ou par défaut si aucun cours réel
    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const listeCours = db.getSync('listeCours', []);
    const aDesCoursReels = listeCours.some(c => !c.isDemo && !c.estDemo);
    const demoChecked = enDemo || !aDesCoursReels;

    // Section toggle tooltips (miroir de Reglages > Preferences > Navigation)
    const prefsAff = db.getSync('preferencesAffichage', {});
    const tooltipsActifs = prefsAff.tooltips !== false;
    const tourGuideActif = !!prefsAff.tourGuide;
    const aideContextuelleActive = prefsAff.aideContextuelle !== false;

    const decouvrirHTML = `
        <div class="carte accordeon" id="accueil-decouvrir">
            <div class="accordeon-header" onclick="toggleAccordeonV2(this);">
                <h3 style="margin: 0; font-size: 1.1rem;">D\u00e9couvrir</h3>
                <span class="accordeon-chevron">\u25BC</span>
            </div>
            <div class="accordeon-contenu">
                <div class="accueil-cartes-decouvrir">

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x1F6B8;</span>
                            <input type="checkbox" id="checkbox-demo-accueil" ${demoChecked ? 'checked' : ''}
                                onchange="if(this.checked) { if(typeof entrerEnDemo==='function') entrerEnDemo(); } else { if(typeof quitterDemo==='function') quitterDemo(); }">
                            <div>
                                <div class="decouvrir-titre">Donn\u00e9es de d\u00e9monstration</div>
                                <div class="decouvrir-desc">Explorer avec des donn\u00e9es fictives</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x1F5FA;&#xFE0F;</span>
                            <input type="checkbox" id="checkbox-tour-guide-accueil" ${tourGuideActif ? 'checked' : ''}
                                onchange="if(typeof definirTourGuide==='function') definirTourGuide(this.checked);">
                            <div>
                                <div class="decouvrir-titre">Tour guid\u00e9</div>
                                <div class="decouvrir-desc">Afficher les conseils contextuels</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">\uD83D\uDCAC</span>
                            <input type="checkbox" id="checkbox-tooltips-accueil" ${tooltipsActifs ? 'checked' : ''}
                                onchange="if(typeof definirTooltips==='function') definirTooltips(this.checked);">
                            <div>
                                <div class="decouvrir-titre">Info-bulles</div>
                                <div class="decouvrir-desc">D\u00e9crire l\u2019interface au survol</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">\uD83D\uDCCD</span>
                            <input type="checkbox" id="checkbox-aide-contextuelle-accueil" ${aideContextuelleActive ? 'checked' : ''}
                                onchange="if(typeof definirAideContextuelle==='function') definirAideContextuelle(this.checked);">
                            <div>
                                <div class="decouvrir-titre">Aide contextuelle</div>
                                <div class="decouvrir-desc">Afficher les rep\u00e8res d\u2019aide</div>
                            </div>
                        </label>
                    </div>

                </div>
            </div>
        </div>
    `;

    // Panneau de parcours d'apprentissage (toujours visible : CTA ou progression)
    const parcoursHTML = (window.parcours && window.parcours.genererPanneauParcours)
        ? window.parcours.genererPanneauParcours()
        : '';

    // Hero adaptatif selon l'état du parcours
    const parcoursInitialise = window.parcours && window.parcours.estInitialise && window.parcours.estInitialise();
    const heroTitre = parcoursInitialise
        ? 'Que souhaites-tu faire\u00a0?'
        : 'Bienvenue\u00a0! Par o\u00f9 commencer\u00a0?';

    conteneur.innerHTML = `
        <div class="accueil-hero">
            <h1>${heroTitre}</h1>
        </div>

        ${parcoursHTML}

        ${decouvrirHTML}

        <div class="accueil-cartes accueil-cartes--8">
            <div class="accueil-carte" onclick="afficherSection('planification'); setTimeout(function(){ afficherSousSection('planification-carte'); }, 100);">
                <div class="accueil-carte-icone">\uD83E\uDDE9</div>
                <div class="accueil-carte-titre">Planifier ton cours</div>
                <div class="accueil-carte-desc">
                    Organise tes s\u00e9quences, le\u00e7ons et activit\u00e9s pour leur alignement p\u00e9dagogique.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('construction'); setTimeout(function(){ if(typeof ouvrirWizardV2==='function') ouvrirWizardV2(); }, 300);">
                <div class="accueil-carte-icone">\uD83C\uDFA8</div>
                <div class="accueil-carte-titre">Configurer ta pratique de notation</div>
                <div class="accueil-carte-desc">
                    D\u00e9finis ce que tu mesures et comment tu le fais pour cr\u00e9er ta pratique de notation.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('presences');">
                <div class="accueil-carte-icone">&#x1F4CB;</div>
                <div class="accueil-carte-titre">Saisir les pr\u00e9sences</div>
                <div class="accueil-carte-desc">
                    Saisis les pr\u00e9sences du jour pour ton groupe et ajoute des observations.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('evaluations'); setTimeout(function(){ afficherSousSection('evaluations-annoter'); }, 100);">
                <div class="accueil-carte-icone">&#x1F4DD;</div>
                <div class="accueil-carte-titre">Annoter et \u00e9valuer</div>
                <div class="accueil-carte-desc">
                    Annote les travaux de tes \u00e9tudiants et \u00e9value-les selon la grille de crit\u00e8res.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('evaluations'); setTimeout(function(){ afficherSousSection('evaluations-liste'); }, 100);">
                <div class="accueil-carte-icone">&#x2696;&#xFE0F;</div>
                <div class="accueil-carte-titre">\u00c9valuer une production</div>
                <div class="accueil-carte-desc">
                    Applique une grille de crit\u00e8res et construis une r\u00e9troaction diff\u00e9renci\u00e9e.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('tableau-bord'); setTimeout(function(){ afficherSousSection('tableau-bord-profil'); }, 100);">
                <div class="accueil-carte-icone">\uD83D\uDC64</div>
                <div class="accueil-carte-titre">Consulter un profil \u00e9tudiant</div>
                <div class="accueil-carte-desc">
                    Consulte le portrait d\u2019un \u00e9l\u00e8ve\u00a0: pr\u00e9sences, r\u00e9sultats et progression.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('tableau-bord');">
                <div class="accueil-carte-icone">&#x1F4C8;</div>
                <div class="accueil-carte-titre">Voir l\u2019\u00e9tat des lieux</div>
                <div class="accueil-carte-desc">
                    Suis la participation, les r\u00e9sultats et la progression de ton groupe.
                </div>
            </div>
            <div class="accueil-carte" onclick="afficherSection('tableau-bord'); setTimeout(function(){ afficherSousSection('tableau-bord-interventions'); }, 100);">
                <div class="accueil-carte-icone">\uD83D\uDEDF</div>
                <div class="accueil-carte-titre">Pr\u00e9parer des interventions</div>
                <div class="accueil-carte-desc">
                    Identifie les \u00e9l\u00e8ves \u00e0 risque et planifie des interventions diff\u00e9renci\u00e9es selon leurs besoins.
                </div>
            </div>
        </div>

        <div class="accueil-utilitaires">
            <button class="accueil-utilitaire" onclick="if(window.backupReminder) window.backupReminder.afficherModal();">
                \uD83D\uDCBE Sauvegarder
            </button>
            <button class="accueil-utilitaire" onclick="afficherModalNouveautes();">
                \u2709\uFE0F<span class="pastille-nouveautes"></span> Nouvelles
            </button>
        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" style="font-size: 0.8rem; color: var(--gris-moyen); text-decoration: none;">codexnumeris.org</a>
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
