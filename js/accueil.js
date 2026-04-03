/* ===============================
   MODULE: PAGE D'ACCUEIL
   Chantier 3 — Page d'accueil permanente

   Page unique pour tous les utilisateurs :
   3 accordéons (Découvrir, Parcourir, Piloter) + utilitaires

   Exports: afficherAccueil, initialiserAccueil, definirModeExpert
   =============================== */

(function() {
'use strict';

/**
 * Génère et affiche le contenu de la page d'accueil
 */
function afficherAccueil() {
    const conteneur = document.getElementById('accueil-contenu');
    if (!conteneur) return;

    afficherAccueilContenu(conteneur);
}

/**
 * Contenu de la page d'accueil : 3 accordéons + utilitaires
 */
function afficherAccueilContenu(conteneur) {
    // Checkbox démo : activée si en mode démo, ou par défaut si aucun cours réel
    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const listeCours = db.getSync('cours', null) || db.getSync('listeCours', []);
    const aDesCoursReels = listeCours.some(c => !c.isDemo && !c.estDemo);
    const demoChecked = enDemo || !aDesCoursReels;

    // Section toggle tooltips (miroir de Reglages > Preferences > Navigation)
    const prefsAff = db.getSync('preferencesAffichage', {});
    const tooltipsActifs = prefsAff.tooltips !== false;
    const tourGuideActif = !!prefsAff.tourGuide;
    const aideContextuelleActive = prefsAff.aideContextuelle !== false;

    const decouvrirHTML = `
        <div class="carte accordeon" id="accueil-decouvrir">
            <div class="accordeon-header">
                <h3 style="margin: 0; font-size: 1.1rem;">D\u00e9couvrir</h3>
                <span class="accordeon-chevron">\u25BC</span>
            </div>
            <div class="accordeon-contenu">
                <div class="accueil-cartes-decouvrir">

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x1F6B8;</span>
                            <input type="checkbox" id="checkbox-demo-accueil" ${demoChecked ? 'checked' : ''}
                                data-on-change="toggleDemoHandler">
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
                                data-on-change="toggleTourGuideHandler">
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
                                data-on-change="toggleTooltipsHandler">
                            <div>
                                <div class="decouvrir-titre">Info-bulles</div>
                                <div class="decouvrir-desc">D\u00e9crire l\u2019interface au survol</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x2139;&#xFE0F;</span>
                            <input type="checkbox" id="checkbox-aide-contextuelle-accueil" ${aideContextuelleActive ? 'checked' : ''}
                                data-on-change="toggleAideContextuelleHandler">
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

    const heroTitre = 'Que souhaites-tu faire\u00a0?';

    conteneur.innerHTML = `
        <div class="accueil-hero">
            <div style="font-style: italic; font-size: 0.82rem; line-height: 1.7; color: var(--texte-muted); max-width: 700px; margin: 0 auto 1.5rem; text-align: justify;">
                <p><strong>Labo Codex</strong> est un laboratoire p\u00e9dagogique. Ce n\u2019est pas un produit fini, c\u2019est un outil de recherche-action qui \u00e9volue avec ceux qui l\u2019utilisent.</p>
                <p style="margin-top: 0.6rem;"><strong>\u00c0 quoi sert ce labo\u00a0?</strong> \u00c0 transformer les gestes que tu fais d\u00e9j\u00e0 (observer, annoter, \u00e9valuer) en micro-donn\u00e9es qui \u00e9clairent ton jugement professionnel. L\u2019application ne remplace pas ton regard sur tes \u00e9l\u00e8ves. Elle le rend plus pr\u00e9cis, plus continu, plus partageable.</p>
                <p style="margin-top: 0.6rem;"><strong>Qu\u2019est-ce que \u00e7a change\u00a0?</strong> Le labo rend plus visibles des patterns\u00a0: un d\u00e9crochage silencieux, un blocage r\u00e9current, un progr\u00e8s qu\u2019une note seule ne montre pas. La diff\u00e9rence\u00a0: chaque geste laisse une trace utile. Chaque geste peut alimenter une boucle de r\u00e9troaction, autant pour ton \u00e9l\u00e8ve que pour toi. Tu interviens plus t\u00f4t, plus justement. La relation p\u00e9dagogique y gagne.</p>
                <p style="margin-top: 0.6rem;"><strong>Qu\u2019est-ce que \u00e7a demande\u00a0?</strong> De faire d\u2019abord dans l\u2019application ce que tu faisais d\u00e9j\u00e0 sur papier. Le flux est le m\u00eame. Peut-\u00eatre aussi d\u2019ajuster tes pratiques, mais l\u2019application est l\u00e0 pour te soutenir. Et derri\u00e8re l\u2019application il y a du vrai monde. Des humains. Aucune IA.</p>
                <p style="margin-top: 0.6rem;"><strong>Labo Codex est commun \u00e0 construire.</strong> Il est gratuit, open source et fonctionne hors ligne. Tes donn\u00e9es restent en s\u00e9curit\u00e9 chez toi. En retour, tu peux apporter ton exp\u00e9rience\u00a0: ce qui fonctionne, ce qui manque, ce que tu d\u00e9couvres. Chaque contexte disciplinaire apporte quelque chose de nouveau. En exp\u00e9rimentant ensemble on peut faire avancer la r\u00e9flexion, l\u2019\u00e9valuation et l\u2019accompagnement au coll\u00e9gial.</p>
            </div>
            <h1>${heroTitre}</h1>
        </div>

        ${decouvrirHTML}

        ${parcoursHTML}

        <div class="carte accordeon" id="accueil-piloter">
            <div class="accordeon-header">
                <h3 style="margin: 0; font-size: 1.1rem;">Piloter</h3>
                <span class="accordeon-chevron">\u25BC</span>
            </div>
            <div class="accordeon-contenu" style="display: block;">
                <div class="accueil-cartes accueil-cartes--8">
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="planification|structure-carte">
                        <div class="accueil-carte-icone">\uD83E\uDDE9</div>
                        <div class="accueil-carte-titre">Planifier ton cours</div>
                        <div class="accueil-carte-desc">
                            Organise tes s\u00e9quences, le\u00e7ons et activit\u00e9s pour leur alignement p\u00e9dagogique.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerVersWizard">
                        <div class="accueil-carte-icone">\uD83C\uDFA8</div>
                        <div class="accueil-carte-titre">Configurer ta pratique de notation</div>
                        <div class="accueil-carte-desc">
                            D\u00e9finis ce que tu mesures et comment tu le fais pour cr\u00e9er ta pratique de notation.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="afficherSection" data-param="presences">
                        <div class="accueil-carte-icone">&#x1F4CB;</div>
                        <div class="accueil-carte-titre">Saisir les pr\u00e9sences</div>
                        <div class="accueil-carte-desc">
                            Saisis les pr\u00e9sences du jour pour ton groupe et ajoute des observations.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="afficherSection" data-param="tableau-bord">
                        <div class="accueil-carte-icone">&#x1F4C8;</div>
                        <div class="accueil-carte-titre">Voir l\u2019\u00e9tat des lieux</div>
                        <div class="accueil-carte-desc">
                            Suis la participation, les r\u00e9sultats et la progression de ton groupe.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-importer">
                        <div class="accueil-carte-icone">&#x1F4E5;</div>
                        <div class="accueil-carte-titre">Importer des travaux</div>
                        <div class="accueil-carte-desc">
                            Importe les travaux de tes \u00e9tudiants (PDF, images) et pr\u00e9pare les fichiers.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-annoter">
                        <div class="accueil-carte-icone">&#x1F4DD;</div>
                        <div class="accueil-carte-titre">Annoter et \u00e9valuer</div>
                        <div class="accueil-carte-desc">
                            Annote les travaux de tes \u00e9tudiants et \u00e9value-les selon la grille de crit\u00e8res.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="tableau-bord|suivi-profil">
                        <div class="accueil-carte-icone">\uD83D\uDC64</div>
                        <div class="accueil-carte-titre">Consulter un profil \u00e9tudiant</div>
                        <div class="accueil-carte-desc">
                            Consulte le portrait d\u2019un \u00e9l\u00e8ve\u00a0: pr\u00e9sences, r\u00e9sultats et progression.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="tableau-bord|suivi-interventions">
                        <div class="accueil-carte-icone">\uD83D\uDEDF</div>
                        <div class="accueil-carte-titre">Pr\u00e9parer des interventions</div>
                        <div class="accueil-carte-desc">
                            Identifie les \u00e9l\u00e8ves \u00e0 risque et planifie des interventions diff\u00e9renci\u00e9es selon leurs besoins.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="accueil-utilitaires">
            <button class="accueil-utilitaire" data-action="ouvrirModalBackup">
                \uD83D\uDCBE Sauvegarder
            </button>
            <button class="accueil-utilitaire" data-action="afficherModalNouveautes">
                \u2709\uFE0F<span class="pastille-nouveautes"></span> Nouvelles
            </button>
        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-logo-link">
                <img src="img/logo-codex-numeris.png" alt="Logo Labo Codex" class="accueil-pied-logo">
            </a>
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; color: var(--gris-moyen); text-decoration: none;">codexnumeris.org</a>
            <span style="font-size: 0.75rem; color: var(--gris-clair); font-style: italic;">R\u00e9fl\u00e9chir, exp\u00e9rimenter, partager.</span>
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

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Toggle mode démo depuis checkbox */
function toggleDemoHandler(el) {
    if (el.checked) {
        if (typeof entrerEnDemo === 'function') entrerEnDemo();
    } else {
        if (typeof quitterDemo === 'function') quitterDemo();
    }
}

/** Toggle tour guidé depuis checkbox */
function toggleTourGuideHandler(el) {
    if (typeof definirTourGuide === 'function') definirTourGuide(el.checked);
}

/** Toggle tooltips depuis checkbox */
function toggleTooltipsHandler(el) {
    if (typeof definirTooltips === 'function') definirTooltips(el.checked);
}

/** Toggle aide contextuelle depuis checkbox */
function toggleAideContextuelleHandler(el) {
    if (typeof definirAideContextuelle === 'function') definirAideContextuelle(el.checked);
}

/** Navigation accueil : section + sous-section avec délai */
function naviguerAccueilCarte(sectionEtSousSection) {
    var parts = sectionEtSousSection.split('|');
    var section = parts[0];
    var sousSection = parts[1];
    afficherSection(section);
    if (sousSection) {
        setTimeout(function() { afficherSousSection(sousSection); }, 100);
    }
}

/** Navigation vers structure avec wizard */
function naviguerVersWizard() {
    afficherSection('structure');
    setTimeout(function() { if (typeof ouvrirWizardV2 === 'function') ouvrirWizardV2(); }, 300);
}

/** Ouvrir modal backup */
function ouvrirModalBackup() {
    if (window.backupReminder) window.backupReminder.afficherModal();
}

// === EXPORTS ===
window.afficherAccueil = afficherAccueil;
window.initialiserAccueil = initialiserAccueil;
window.definirModeExpert = definirModeExpert;
window.toggleDemoHandler = toggleDemoHandler;
window.toggleTourGuideHandler = toggleTourGuideHandler;
window.toggleTooltipsHandler = toggleTooltipsHandler;
window.toggleAideContextuelleHandler = toggleAideContextuelleHandler;
window.naviguerAccueilCarte = naviguerAccueilCarte;
window.naviguerVersWizard = naviguerVersWizard;
window.ouvrirModalBackup = ouvrirModalBackup;


})();
