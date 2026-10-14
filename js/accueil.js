/* ===============================
   MODULE: PAGE D'ACCUEIL
   19 avril 2026 — Refonte V3 (ebauches-accueil.html) :
     - hero « Que souhaites-tu faire ? »
     - bannière de bienvenue (si nouvel utilisateur sans groupe-cours)
     - section « Raccourcis » : grille 4×2 de 8 cartes d'action
     - section « Utilitaires » | « Aide » : rangée de 4 demi-cartes
         · 2 utilitaires neutres (Sauvegarder, Nouveautés)
         · 2 cartes orange palette accompagnement avec case à cocher
           (Accompagnement, Données démo)
     - pied de page

   La case « Accompagnement » pilote en bloc les 4 sous-systèmes d'aide
   (visite guidée, info-bulles, aide contextuelle, flèches didactiques).

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

    // L'accueil n'émet pas `sectionAffichee` (pas de sous-section) : une flèche
    // didactique d'une autre section pourrait persister à l'écran. On la masque.
    if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') {
        window.accompagnement.masquerFleche();
    }

    afficherAccueilContenu(conteneur);
}

/**
 * Génère la bannière de bienvenue, titrée « À propos » (ouverte par « Bienvenue dans Labo Codex ! »).
 *
 * Affichée à TOUS les utilisateurs, en permanence (accueil public par
 * défaut). Elle présente l'application, oriente vers l'onglet Cadre et
 * invite à rejoindre la Communauté de pratique Labo Codex hébergée par
 * l'AQPC.
 *
 * Historique : un encadré d'accès cadré 3-30 juin 2026 (refermage prévu
 * au 1er juillet) y avait été ajouté le 1er juin 2026. Le refermage a été
 * abandonné le 2 juin 2026 (Cloudflare Access désactivé sans date de
 * réactivation) ; l'encadré temporaire — avec sa logique de dates et sa
 * variante d'urgence J-7 — est remplacé par l'invitation permanente à la
 * CoP. Cf. DEPLOY.md v1.4 §3, ADR-008 (révision 2 juin 2026), BACKLOG.md #298.
 *
 * 27 août 2026 (#427/#508) : Cloudflare Access est réactivé le 1er septembre
 * 2026, porte ouverte (`Include → Everyone`) + OTP, session d'un mois — GESTE
 * POSÉ le 31 août 2026 à 08 h 36, la veille, pour être en place avant un cours
 * de 8 h. Le paragraphe ci-dessous est passé au présent le même jour ; il dit
 * le renouvellement du mois, parce que « valable un mois » se lisait comme une
 * date de péremption. La phrase d'avis (4e des 5 blocs du corps, avant
 * l'invitation à la CoP) a été doublée, du 27 au 31 août, d'un bandeau daté
 * (js/transitions.js, entrée `avis-identification-2026-09-01`), parce qu'un avis
 * vivant dans un accordéon repliable n'est pas lu.
 *
 * 31 août 2026 (#639) : le bandeau est RETIRÉ. Sa condition l'éteignait seule à
 * minuit, mais « s'éteint seul » est vrai pour l'écran et faux pour le dépôt —
 * l'entrée serait restée en place, invisible, sous un titre (« À partir du
 * 1ᵉʳ septembre ») qui annonçait au futur un geste déjà posé. Le paragraphe
 * ci-dessous, lui, PORTE SEUL l'information désormais : c'est le seul endroit
 * où le lecteur apprend comment l'accès fonctionne. Textes de référence au §8 de
 * `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
 * Cf. ADR-008 (révision 27 août 2026), DEPLOY.md (révision v1.6).
 * Source texte d'origine : docs/refonte-textes/textes-manquants-bloc4.md
 * (validé 19 avril 2026).
 *
 * 14 octobre 2026 : texte réécrit par Grégoire (mots arrêtés par lui, recopiés tels
 * quels) ; la barre repliable s'intitule « À propos ». L'amorce « Ton courriel, une
 * fois par mois. » disparaît : le paragraphe d'accès est désormais sans amorce.
 */
// La question de l'orthopédagogue, que disent le bandeau ET la carte : écrite une fois (sentinelle #846, B3).
const QUESTION_ORTHOPEDAGOGUE = 'Tu es orthopédagogue ?';

function genererBanniereBienvenue() {
    const replie = (typeof obtenirPreference === 'function') && obtenirPreference('banniereAccueilRepliee') === true;

    const paragrapheCommunaute = `
            <div class="banniere-bienvenue-acces">
                <p>L’Association québécoise de pédagogie collégiale (AQPC) héberge une Communauté de pratique (CoP) Labo Codex : le lieu idéal pour obtenir du soutien et échanger entre pairs. Des enseignant·es comme toi y explorent d’autres pratiques pédagogiques et co-construisent des ressources libres. Une belle occasion de développement professionnel !</p>
            </div>`;

    return `
        <div class="banniere-bienvenue carte ${replie ? 'est-replie' : ''}" id="banniere-bienvenue">
            <button type="button" class="banniere-bienvenue-toggle" data-action="basculerBanniereBienvenue" aria-expanded="${replie ? 'false' : 'true'}" aria-controls="banniere-bienvenue-corps">
                <span class="banniere-bienvenue-titre">À propos</span>
                <span class="banniere-chevron" aria-hidden="true"></span>
            </button>
            <div id="banniere-bienvenue-corps" class="banniere-bienvenue-corps">
            <p class="banniere-bienvenue-titre-etapes"><strong>Bienvenue dans Labo Codex !</strong></p>
            <p>Labo Codex est un outil de soutien à l’enseignement et au suivi des apprentissages.</p>
            <p>L’application te propose de numériser ton travail et de traiter les micro-données que tu crées et recueilles dans ton enseignement et elle les rend visibles et interprétables. Elle te permet ainsi de mieux voir les conditions de ton écosystème-classe et de mieux planifier tes interventions.</p>
            <p>Il n’y a aucune intelligence artificielle dans l’application. Aucune décision n’est prise à ta place. L’outil ne fait que t’éclairer et ton jugement professionnel est souverain.</p>
            <p>Labo Codex n’offre pas la possibilité de scroller très longtemps et elle ne provoque pas de grandes bouffées de dopamine. Par contre, elle permet de réfléchir à ta pratique et de te libérer un peu de ta charge mentale.</p>
            <p>Tu peux planifier, concevoir, évaluer et suivre la progression de tes étudiant·es. Les mêmes gestes que d’habitude, mais dans un seul outil numérique et portable ! Labo Codex est gratuit, ouvert et indépendant !</p>
            <p class="banniere-bienvenue-titre-etapes"><strong>Par où commencer ?</strong></p>
            <ol class="banniere-bienvenue-etapes">
                <li><strong>Pose ton cadre.</strong> Dans l’onglet Cadre, saisis ton trimestre, ton cours et ton groupe. Tu les crées une fois et l’application s’en sert par la suite.</li>
                <li><strong>Conçois tes productions et tes évaluations.</strong> Tu peux les élaborer seul·e ou les partager avec tes collègues.</li>
                <li><strong>Apprends pas à pas.</strong> Les tutoriels de Labo Codex, sur le blogue Codex Numeris, te montrent chaque étape en images.</li>
            </ol>
            <p><strong>${QUESTION_ORTHOPEDAGOGUE}</strong> Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent là.</p>
            <p><strong>Certains concepts sont nouveaux ?</strong> Trois guides expliquent la taxonomie SOLO, les micro-données et le modèle RàI, accessibles en tout temps par les boutons « Guide ».</p>
            <p>Tu entres ton adresse de courriel, tu reçois un code et c’est tout ! Une fois entré·e, tu restes connecté·e un mois sans avoir à redemander de code. Tes données restent sur ton appareil. Il n’y a pas de commerce. Le seul échange souhaité est ton feedback et tes rapports de bugs (si tu en rencontres).</p>
            ${paragrapheCommunaute}
            <div class="banniere-bienvenue-actions">
                <button class="btn btn-principal" data-action="demarrerTourGuide">
                    Commencer la visite guid\u00e9e
                </button>
                <button class="btn btn-secondaire" data-action="naviguerAccueilCarte" data-param="labo|labo-accompagnement">
                    Voir les guides p\u00e9dagogiques
                </button>
                <a class="btn btn-secondaire" href="https://codexnumeris.org/tutoriels" target="_blank" rel="noopener noreferrer">Voir les tutoriels <span aria-hidden="true">↗</span><span class="u-lecteur-ecran"> (s’ouvre dans un nouvel onglet)</span></a>
            </div>
            </div>
        </div>
    `;
}

/**
 * Replie ou déplie la bannière de bienvenue. L'état (préférence UI globale,
 * non namespacée par trimestre) est mémorisé via le système de préférences.
 * Le <button> natif gère Entrée/Espace et le focus ; seul le corps se masque,
 * la barre de titre — et donc l'affordance de réouverture — reste visible.
 */
function basculerBanniereBienvenue() {
    const banniere = document.getElementById('banniere-bienvenue');
    if (!banniere) return;
    const replie = !banniere.classList.contains('est-replie');
    banniere.classList.toggle('est-replie', replie);
    const toggle = banniere.querySelector('.banniere-bienvenue-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', replie ? 'false' : 'true');
    if (typeof definirPreference === 'function') {
        definirPreference('banniereAccueilRepliee', replie);
    }
}

/**
 * Contenu de la page d'accueil — V3 (19 avril 2026).
 *
 *   - Hero « Que souhaites-tu faire ? »
 *   - bannière de bienvenue (nouvel utilisateur)
 *   - porte de l'orthopédagogie (consigne du 12 sept. 2026) : une carte blanche, pleine
 *     largeur, au-dessus des tâches — elle n'en remplace aucune ; son lien prend le même
 *     chemin que la sous-navigation (Suivi › Rencontres, les trois questions). Grégoire :
 *     « Je veux que l'orthopédagogue sente qu'elle entre par la porte principale. »
 *     Ses mots, et ceux du bandeau, ne s'écrivent qu'ici.
 *   - Raccourcis : grille 4×2 de 8 cartes d'action
 *   - Utilitaires (gauche) | Aide (droite) : rangée de 4 demi-cartes
 *       · 2 utilitaires neutres (Sauvegarder, Nouveautés)
 *       · 2 cartes orange palette accompagnement avec case
 *         (Accompagnement, Données démo)
 *   - pied de page
 *
 * Aucun style= inline — tout passe par les classes CSS de index.html.
 */
function afficherAccueilContenu(conteneur) {
    // A.14 — La case « Données de démonstration » reflète strictement l'état réel.
    const demoChecked = typeof estEnModeDemo === 'function' && estEnModeDemo();
    // « Accompagnement » = ON uniquement si les 4 sous-systèmes sont actifs.
    const accChecked = accompagnementEstActif();

    // Hero h1 retiré le 27 mai 2026 : la phrase a été déplacée dans le bandeau global
    // (entête .titre-section, à côté de la date).
    const banniereBienvenueHTML = genererBanniereBienvenue();

    conteneur.innerHTML = `
        ${banniereBienvenueHTML}

        <div class="accueil-porte-ortho" id="accueil-porte-ortho">
            <div>
                <div class="accueil-porte-ortho-titre">${QUESTION_ORTHOPEDAGOGUE}</div>
                <div class="accueil-porte-ortho-desc">Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre.</div>
            </div>
            <button type="button" class="accueil-porte-ortho-lien" data-action="naviguerAccueilCarte" data-param="suivi|suivi-rencontres">Commencer →</button>
        </div>

        <div class="accueil-section-label">Tâches</div>
        <div class="accueil-grille-actions">

            <div class="accueil-action" role="button" tabindex="0" data-section="conception" data-action="ouvrirWizardPratique">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-data-sheet"></span></div>
                <div class="accueil-action-titre">Adopter ta pratique</div>
                <div class="accueil-action-desc">Notation sommative, par standards, par sp\u00e9cifications.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="conception" data-action="naviguerAccueilCarte" data-param="conception|conception-carte">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-puzzle"></span></div>
                <div class="accueil-action-titre">Planifier ton cours</div>
                <div class="accueil-action-desc">Carte mentale alignant s\u00e9quences, le\u00e7ons et \u00e9valuations.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-saisie">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-people"></span></div>
                <div class="accueil-action-titre">Saisir les pr\u00e9sences</div>
                <div class="accueil-action-desc">Pr\u00e9sences, retards et observations de s\u00e9ance.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="evaluations" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-importer">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-downloading"></span></div>
                <div class="accueil-action-titre">Importer des productions</div>
                <div class="accueil-action-desc">PDF, images et numérisations, prêts à annoter.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="evaluations" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-annoter">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-edit"></span></div>
                <div class="accueil-action-titre">Annoter et \u00e9valuer</div>
                <div class="accueil-action-desc">Annotation au stylet, grille d\u2019\u00e9valuation, bilan automatique.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-groupe">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-line-chart"></span></div>
                <div class="accueil-action-titre">Observer le groupe</div>
                <div class="accueil-action-desc">Engagement, structure des r\u00e9sultats, signaux \u00e0 surveiller.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-profil">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-profile"></span></div>
                <div class="accueil-action-titre">Consulter un profil</div>
                <div class="accueil-action-desc">Productions, progression et difficultés récurrentes.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-interventions">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-pause-button"></span></div>
                <div class="accueil-action-titre">Diff\u00e9rencier les interventions</div>
                <div class="accueil-action-desc">Mod\u00e8le R\u00e0I, niveaux 2 et 3, interventions selon le besoin.</div>
            </div>

        </div>

        <div class="accueil-grille-labels">
            <div class="accueil-section-label">Utilitaires</div>
            <div class="accueil-section-label">Aide</div>
        </div>

        <div class="accueil-grille-bas">

            <div class="accueil-utilitaire-demi" role="button" tabindex="0" data-action="ouvrirModalBackup">
                <div class="accueil-utilitaire-icone"><span class="accueil-icone-mask ico-acc-usb-memory"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Ton codex</div>
                    <div class="accueil-utilitaire-desc">Mets-le à jour : une copie complète de tes données.</div>
                </div>
            </div>

            <div class="accueil-utilitaire-demi" role="button" tabindex="0" data-action="afficherModalNouveautes">
                <div class="accueil-utilitaire-icone"><span class="accueil-icone-mask ico-acc-megaphone"></span><span class="pastille-nouveautes"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Nouveaut\u00e9s</div>
                    <div class="accueil-utilitaire-desc">Bêta publique ${window.VERSION_MAJEURE || ''} (Build ${window.BUILD_ID || ''})</div>
                </div>
            </div>

            <label for="checkbox-accompagnement-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone"><img src="icons/icons8-info-popup.svg" alt=""></div>
                <div>
                    <div class="accueil-aide-titre">Assistance</div>
                    <div class="accueil-aide-desc">Info-bulles et aide contextuelle.</div>
                </div>
                <input type="checkbox" id="checkbox-accompagnement-accueil"
                    class="accueil-aide-checkbox" ${accChecked ? 'checked' : ''}
                    data-on-change="toggleAccompagnementHandler">
            </label>

            <label for="checkbox-demo-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone"><img src="icons/icons8-binary-code.svg" alt=""></div>
                <div>
                    <div class="accueil-aide-titre">Donn\u00e9es d\u00e9mo <button class="btn-aide-contextuelle" data-aide="accueil-donnees-demo" aria-label="Aide : mode d\u00e9monstration"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></div>
                    <div class="accueil-aide-desc">Cours fictif d\u00e9j\u00e0 configur\u00e9, \u00e0 explorer librement.</div>
                </div>
                <input type="checkbox" id="checkbox-demo-accueil"
                    class="accueil-aide-checkbox" ${demoChecked ? 'checked' : ''}
                    data-on-change="toggleDemoHandler">
            </label>

        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-logo-link">
                <img src="img/logo-codex-numeris.svg" alt="Logo Codex Numeris" class="accueil-pied-logo">
            </a>
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-lien-site">codexnumeris.org</a>
            <span class="accueil-pied-tagline">R\u00e9fl\u00e9chir, exp\u00e9rimenter, partager.</span>
        </div>
    `;

    // Mettre à jour la pastille des nouveautés (elle est maintenant dans le DOM)
    if (typeof mettreAJourPastille === 'function') mettreAJourPastille();
}

/**
 * Active ou désactive le mode expert (ouvrir direct sur tableau de bord)
 */
function definirModeExpert(actif) {
    definirPreference('modeExpert', !!actif);
}

/**
 * Initialise le module accueil
 * Appelé par main.js au démarrage
 */
function initialiserAccueil() {
    // Charger l'état du checkbox mode expert si la section réglages est présente
    const checkbox = document.getElementById('checkbox-mode-expert');
    if (checkbox) {
        checkbox.checked = !!obtenirPreference('modeExpert');
    }

    // Checkbox « Données démo » : re-synchroniser avec l'état réel après
    // db-ready (l'état peut venir d'IDB qui n'est pas dispo au premier rendu).
    // Bugfix 22 avril : la case se décochait au refresh malgré mode démo actif.
    //
    // #414 (8 août 2026) : `initialiserAccueil()` est appelée par `main.js` sous
    // `DOMContentLoaded`, donc cet écouteur se posait au même instant que celui
    // de #413 — et se manquait de la même façon. Quand `db-ready` était déjà
    // passé, la resynchronisation n'avait jamais lieu et le bug du 22 avril
    // revenait tel quel : la case « Données démo » se décochait au refresh
    // alors que le mode démo était bien actif. Le rattrapage du portillon ferme
    // la seule brèche qui restait à ce correctif.
    //
    // `once: false` : rejoué à chaque `db-ready` — après un import, le mode
    // démo peut avoir changé et les cases doivent le refléter.
    window.auDbPret(function() {
        const cbDemo = document.getElementById('checkbox-demo-accueil');
        if (cbDemo) {
            cbDemo.checked = typeof estEnModeDemo === 'function' && estEnModeDemo();
        }
        const cbAcc = document.getElementById('checkbox-accompagnement-accueil');
        if (cbAcc) {
            cbAcc.checked = accompagnementEstActif();
        }
    }, { once: false });
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Toggle mode démo depuis checkbox — routage vers activerModeDemo
 * (cochage) et desactiverModeDemo (décochage) dans js/demo-activation.js.
 * Le legacy donnees-demo.js a été retiré en Phase 5.D. */
function toggleDemoHandler(el) {
    // T7 : pendant un import de copies, la case garde son état (l'avis est donné par la garde).
    if (typeof window.importEmpecheLaBascule === 'function' && window.importEmpecheLaBascule(el.checked)) {
        el.checked = !el.checked;
        return;
    }
    if (el.checked) {
        if (typeof activerModeDemo === 'function') activerModeDemo();
    } else {
        if (typeof desactiverModeDemo === 'function') desactiverModeDemo();
    }
}

/**
 * Toggle « Accompagnement » : pilote en bloc les 4 sous-systèmes d'aide
 * (visite guidée, info-bulles, aide contextuelle, flèches didactiques).
 * Un seul état visible côté utilisateur — case cochée = les 4 actifs.
 */
function toggleAccompagnementHandler(el) {
    if (window.accompagnement && typeof window.accompagnement.definirActif === 'function') {
        window.accompagnement.definirActif(!!el.checked);
    }
    // La case de l'accueil et le bouton de l'en-tête sont le même interrupteur :
    // refléter le nouvel état sur le bouton d'en-tête (title/aria-pressed).
    if (typeof window.synchroniserControlesAssistance === 'function') {
        window.synchroniserControlesAssistance();
    }
}

/**
 * Lit l'état agrégé : true uniquement si les 4 sous-systèmes sont actifs.
 * Sert à initialiser la case « Accompagnement » sur la page d'accueil.
 */
function accompagnementEstActif() {
    return !!(window.accompagnement && window.accompagnement.estActif());
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
    // Règle SPA (CLAUDE.md) : après le changement de vue, déplacer le focus vers
    // le conteneur de la nouvelle section (utile aux utilisateurs clavier).
    setTimeout(function() { deplacerFocusVersSection(section); }, sousSection ? 150 : 60);
}

/**
 * Déplace le focus clavier vers le conteneur de la section affichée (règle SPA).
 * Échec gracieux si la section est absente. tabindex=-1 rend le conteneur
 * focusable par script sans l'ajouter à l'ordre de tabulation.
 */
function deplacerFocusVersSection(section) {
    var cible = document.getElementById('section-' + section);
    if (!cible) return;
    if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
    cible.focus();
}

/** Ouvre le wizard de pratique de notation par-dessus l'accueil (modale, pas de navigation). */
function ouvrirWizardPratique() {
    if (typeof ouvrirWizardV2 === 'function') ouvrirWizardV2();
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
window.toggleAccompagnementHandler = toggleAccompagnementHandler;
window.naviguerAccueilCarte = naviguerAccueilCarte;
window.basculerBanniereBienvenue = basculerBanniereBienvenue;
window.ouvrirWizardPratique = ouvrirWizardPratique;
window.ouvrirModalBackup = ouvrirModalBackup;

})();
