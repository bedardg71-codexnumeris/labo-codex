/* ===============================
   MODULE: TABLEAU DE BORD - APERÇU
   Calculs des indices A-C-P et affichage des métriques globales
   =============================== */

/**
 * MODULE: tableau-bord-apercu.js
 *
 * RÔLE:
 * Calcule et affiche les statistiques pédagogiques du tableau de bord
 * - Métriques globales du groupe (indices A-C-P)
 * - Distribution des niveaux d'engagement
 * - Alertes prioritaires (étudiants à engagement insuffisant)
 *
 * FONDEMENTS THÉORIQUES:
 * Basé sur le Guide de monitorage - Section ROUGE (indices primaires)
 * - Assiduité (A) : proportion de présence
 * - Complétion (C) : proportion d'artefacts remis
 * - Performance (P) : performance moyenne (3 derniers artefacts)
 * - Engagement : E = (A × C × P)^(1/3) (racine cubique pour compenser décroissance multiplicative)
 *
 * DÉPENDANCES:
 * - LocalStorage: groupeEtudiants, presences, evaluationsSauvegardees
 * - Modules: 09-2-saisie-presences.js (pour calculs assiduité)
 */

/* ===============================
   🔧 FONCTIONS HELPERS
   =============================== */

/**
 * Calcule le coefficient de corrélation de Pearson entre deux séries de données
 * @param {Array<number>} x - Première série de valeurs (0-1 decimal)
 * @param {Array<number>} y - Deuxième série de valeurs (0-1 decimal)
 * @returns {number|null} - Coefficient r entre -1 et 1, ou null si calcul impossible
 *
 * FORMULE: r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]
 * INTERPRÉTATION (Cohen, 1988):
 * - |r| < 0.3 : Très faible
 * - 0.3 ≤ |r| < 0.5 : Faible
 * - 0.5 ≤ |r| < 0.7 : Modérée
 * - 0.7 ≤ |r| < 0.9 : Forte
 * - |r| ≥ 0.9 : Très forte
 */
function calculerCorrelationPearson(x, y) {
    const n = x.length;

    // Vérifications de base
    if (n === 0 || n !== y.length) {
        return null;
    }

    // Calculer les moyennes
    const moyX = x.reduce((a, b) => a + b, 0) / n;
    const moyY = y.reduce((a, b) => a + b, 0) / n;

    // Calculer les écarts et produits
    let numerateur = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - moyX;
        const diffY = y[i] - moyY;
        numerateur += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }

    // Vérifier variance nulle (tous identiques)
    if (denomX === 0 || denomY === 0) {
        return null;
    }

    // Calculer r
    return numerateur / Math.sqrt(denomX * denomY);
}

/**
 * 🆕 BETA 91: Génère un diagnostic basique basé sur la note de passage (60%)
 * Utilisé quand SOLO et RàI sont désactivés
 * @param {Array} etudiants - [{da, valeur: 0-1}, ...] étudiants avec leur performance
 * @returns {string} - Message de diagnostic basique
 */
function genererDiagnosticNotePassage(etudiants) {
    if (!etudiants || etudiants.length === 0) {
        return '';
    }

    const notePassage = 0.60; // 60%
    const total = etudiants.length;

    const enReussite = etudiants.filter(e => e.valeur >= notePassage).length;
    const enDifficulte = total - enReussite;

    const pctReussite = Math.round((enReussite / total) * 100);
    const pctDifficulte = Math.round((enDifficulte / total) * 100);

    const messages = [];

    if (enReussite > 0) {
        messages.push(`${enReussite} étudiants (${pctReussite}%) ont une performance égale ou supérieure à la note de passage (60%)`);
    }

    if (enDifficulte > 0) {
        messages.push(`${enDifficulte} étudiants (${pctDifficulte}%) sont en difficulté avec une performance inférieure à 60%`);
    }

    return messages.length > 0 ? messages.join('. ') + '.' : '';
}

/**
 * 🆕 BETA 91: Génère une interprétation pédagogique de la performance du groupe
 * Analyse les niveaux IDME et les patterns pour identifier progression et difficultés
 * @param {Array} etudiants - [{da, valeur: 0-1}, ...] étudiants avec leur performance
 * @param {Object} echelle - Échelle IDME active
 * @returns {string} - Message d'interprétation pédagogique
 */
function genererInterpretationPerformance(etudiants, echelle) {
    if (!etudiants || etudiants.length === 0 || !echelle) {
        return '';
    }

    // Lire les patterns stockés
    const patterns = db.getSync('indicesPatternsRaI', {});

    // Classifier les étudiants par niveau IDME
    const niveaux = echelle.niveaux.filter(n => n.code !== '0' && n.code !== 0);
    const parNiveau = {};

    niveaux.forEach(niveau => {
        parNiveau[niveau.code] = [];
    });

    etudiants.forEach(etudiant => {
        const valeurPct = etudiant.valeur * 100;
        for (let i = niveaux.length - 1; i >= 0; i--) {
            const niveau = niveaux[i];
            const min = niveau.min || 0;
            const max = niveau.max || 100;
            if (valeurPct >= min && valeurPct <= max) {
                parNiveau[niveau.code].push(etudiant);
                break;
            }
        }
    });

    // Analyser selon les objectifs pédagogiques
    const messages = [];
    const total = etudiants.length;

    // 1. Combien ont atteint M ou E (objectif atteint)
    const niveauM = parNiveau['M'] || [];
    const niveauE = parNiveau['E'] || [];
    const objectifAtteint = niveauM.length + niveauE.length;

    if (objectifAtteint > 0) {
        const pct = Math.round((objectifAtteint / total) * 100);
        messages.push(`${objectifAtteint} étudiants (${pct}%) ont atteint ou dépassé le niveau de maîtrise`);
    }

    // 2. Parmi les D, combien en progression (pattern favorable)
    const niveauD = parNiveau['D'] || [];
    const dEnProgression = niveauD.filter(etudiant => {
        const pattern = patterns[etudiant.da];
        return pattern && (pattern.pattern === 'Stable' || pattern.niveauRai === 1);
    });

    if (dEnProgression.length > 0) {
        messages.push(`${dEnProgression.length} étudiants en Développement montrent une progression favorable et pourraient atteindre la maîtrise prochainement`);
    }

    // 3. Parmi les I, combien montrent des progrès (pattern pas blocage critique)
    const niveauI = parNiveau['I'] || [];
    const iAvecProgres = niveauI.filter(etudiant => {
        const pattern = patterns[etudiant.da];
        return pattern && pattern.pattern !== 'Blocage critique';
    });

    if (niveauI.length > 0) {
        if (iAvecProgres.length > 0) {
            messages.push(`Parmi les ${niveauI.length} étudiants en difficulté, ${iAvecProgres.length} montrent des signes de progrès`);
        } else {
            messages.push(`${niveauI.length} étudiants en difficulté nécessitent un accompagnement intensif`);
        }
    }

    // Générer le message final
    if (messages.length === 0) {
        return '';
    }

    return messages.join('. ') + '.';
}

/**
 * Calcule la distribution des étudiants selon les niveaux de l'échelle de performance
 * Lit l'échelle active depuis localStorage et compte les étudiants dans chaque plage
 * Exclut le niveau "0" (Aucun/plagiat)
 * @param {Array} etudiants - [{da, valeur: 0-1}, ...] valeurs de performance avec DA
 * @returns {string|null} - HTML compact "I : 5 • D : 8 • M : 12 • E : 3" ou null si erreur
 */
function calculerDistributionPerformance(etudiants) {
    if (!etudiants || etudiants.length === 0) {
        console.warn('📊 Distribution P : Aucun étudiant');
        return null;
    }

    // Lire l'échelle de performance active depuis localStorage
    // Essayer d'abord echellesTemplates (utilisé par echelles.js), puis echellesPerformance (fallback)
    let echelles = db.getSync('echellesTemplates', []);
    let echelleId = db.getSync('echellePerformanceActive', 'idme-5niv');

    console.log('📊 Distribution P : echelleId =', echelleId, 'echellesTemplates.length =', echelles.length);

    // Trouver l'échelle active (par ID ou par défaut)
    let echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        // Fallback : chercher l'échelle par défaut
        echelle = echelles.find(e => e.parDefaut === true) || echelles[0];
        console.log('📊 Distribution P : Échelle non trouvée par ID, utilisation échelle par défaut:', echelle?.id);
    }

    console.log('📊 Distribution P : echelle finale =', echelle);

    if (!echelle || !echelle.niveaux) {
        console.warn('📊 Distribution P : Échelle ou niveaux introuvables');
        return null;
    }

    // Trier les niveaux par valeur min croissante et exclure le niveau "0"
    const niveaux = echelle.niveaux
        .filter(n => n.code !== '0' && n.code !== 0) // Exclure niveau 0 (plagiat)
        .sort((a, b) => (a.min || 0) - (b.min || 0));

    console.log('📊 Distribution P : niveaux filtrés =', niveaux);

    if (niveaux.length === 0) {
        console.warn('📊 Distribution P : Aucun niveau après filtrage');
        return null;
    }

    // Compter les étudiants dans chaque plage
    const compteurs = {};
    niveaux.forEach(niveau => {
        compteurs[niveau.code] = 0;
    });

    etudiants.forEach(etudiant => {
        const valeurPct = etudiant.valeur * 100; // Convertir 0-1 en 0-100%

        // Trouver le niveau correspondant
        for (let i = niveaux.length - 1; i >= 0; i--) {
            const niveau = niveaux[i];
            const min = niveau.min || 0;
            const max = niveau.max || 100;

            if (valeurPct >= min && valeurPct <= max) {
                compteurs[niveau.code]++;
                break;
            }
        }
    });

    console.log('📊 Distribution P : compteurs =', compteurs);

    // Générer le HTML compact avec noms complets : "Incomplet ou insuffisant : 5 • En Développement : 11 • etc."
    const parts = niveaux.map(niveau => {
        const count = compteurs[niveau.code] || 0;
        // Utiliser le nom complet du niveau au lieu du code
        return `${niveau.nom} : ${count}`;
    });

    const result = parts.join(' <span class="tb-m-horizontal-6">•</span> ');
    console.log('📊 Distribution P : résultat =', result);

    return result;
}

/**
 * Génère un badge HTML indiquant la pratique de notation active
 * @returns {string} - HTML du badge avec icône et texte
 */
function genererBadgePratique() {
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'alternative';
    const typePAN = config.typePAN || 'maitrise';
    const affichage = config.affichageTableauBord || {};

    let texte = '';
    let couleur = '';
    let description = '';

    if (affichage.afficherSommatif && affichage.afficherAlternatif) {
        // Mode hybride
        texte = 'Mode Hybride (SOM + PAN)';
        couleur = '#9c27b0'; // Violet
        description = 'Comparaison expérimentale des deux pratiques';
    } else if (pratique === 'sommative') {
        texte = 'Sommative traditionnelle (SOM)';
        couleur = '#ff6f00'; // Orange
        description = 'Moyenne pondérée provisoire';
    } else {
        // PAN
        const typesPAN = {
            'maitrise': 'Maîtrise (IDME)',
            'specifications': 'Spécifications',
            'denotation': 'Dénotation'
        };
        texte = `Alternative - ${typesPAN[typePAN] || 'PAN'}`;
        couleur = '#0277bd'; // Bleu
        description = 'N meilleurs artefacts';
    }

    return `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
                     background: ${couleur}15; border: 1.5px solid ${couleur}; border-radius: 20px;
                     font-size: 0.85rem; font-weight: 600; color: ${couleur}; margin-left: 12px;"
              title="${description}">
            ${texte}
        </span>
    `;
}

/**
 * Génère un badge compact indiquant la source des données (SOM, PAN, ou Hybride)
 * Pour les sections du tableau de bord
 * @returns {string} - HTML du badge
 */
function genererBadgeSourceDonnees() {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSommatif = affichage.afficherSommatif === true;
    const afficherAlternatif = affichage.afficherAlternatif === true;

    let texte = '';
    let couleur = '';
    let titre = '';

    if (afficherSommatif && afficherAlternatif) {
        // Mode hybride - les cartes montrent déjà (SOM) et (PAN)
        texte = 'Hybride';
        couleur = '#9c27b0';
        titre = 'Affichage des deux pratiques';
    } else if (afficherSommatif) {
        texte = 'Source : SOM';
        couleur = '#ff6f00';
        titre = 'Données calculées selon pratique sommative';
    } else {
        texte = 'Source : PAN';
        couleur = '#0277bd';
        titre = 'Données calculées selon pratique alternative';
    }

    return `
        <span style="display: inline-block; padding: 3px 10px; background: ${couleur}15;
                     border: 1px solid ${couleur}; border-radius: 12px;
                     font-size: 0.75rem; font-weight: 700; color: ${couleur};
                     margin-left: 8px; vertical-align: middle;"
              title="${titre}">
            ${texte}
        </span>
    `;
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module du tableau de bord - aperçu
 * Appelée par main.js au chargement
 */
function initialiserModuleTableauBordApercu() {
    console.log('Module Tableau de bord - Aperçu initialisé');

    // Charger les statistiques si la sous-section aperçu est active
    const apercu = document.getElementById('tableau-bord-apercu');
    if (apercu && apercu.classList.contains('active')) {
        chargerTableauBordApercu();
    }
}

/* ===============================
   📈 FONCTION PRINCIPALE
   =============================== */

function chargerTableauBordApercu() {
    console.log('Chargement du tableau de bord - aperçu');

    // 🔄 Calculer les indices C et P (SOM + PAN) avant l'affichage
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    } else {
        console.warn('⚠️ calculerEtStockerIndicesCP non disponible - Module portfolio.js non chargé ?');
    }

    // 🆕 BETA 91: Calculer et stocker les patterns + RàI pour tout le groupe (si RàI activé)
    const config = db.getSync('modalitesEvaluation', {});
    const raiActive = config.activerRai !== false; // Par défaut true

    if (raiActive && typeof calculerEtStockerPatternsGroupe === 'function') {
        calculerEtStockerPatternsGroupe();
    } else if (!raiActive) {
        console.log('ℹ️ RàI désactivé, patterns non calculés');
    } else {
        console.warn('⚠️ calculerEtStockerPatternsGroupe non disponible - Module profil-etudiant.js non chargé ?');
    }

    try {
        const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiants = typeof filtrerEtudiantsParMode === 'function'
            ? filtrerEtudiantsParMode(tousEtudiants)
            : tousEtudiants.filter(e => e.groupe !== '9999');

        const etudiantsActifs = etudiants.filter(e =>
            e.statut !== 'décrochage' && e.statut !== 'abandon'
        );

        // Ajouter les indices (structure : {sommatif: {...}, alternatif: {...}})
        const etudiantsAvecIndices = etudiantsActifs.map(etudiant => {
            const indices = calculerIndicesEtudiant(etudiant.da);
            return {
                ...etudiant,
                ...indices  // Ajoute sommatif et alternatif
            };
        });

        // Ajouter l'indicateur de pratique ou les checkboxes selon le mode
        const titre = document.querySelector('#tableau-bord-apercu h2');
        if (titre) {
            const config = db.getSync('modalitesEvaluation', {});
            const affichage = config.affichageTableauBord || {};

            // NOUVEAU Beta 90 : Détection automatique du mode comparatif
            // Si les deux pratiques sont affichées (OU si le flag explicite est true), c'est comparatif
            const afficherSom = affichage.afficherSommatif === true;
            const afficherPan = affichage.afficherAlternatif === true;
            const modeComparatif = (afficherSom && afficherPan) || affichage.modeComparatif === true;

            titre.innerHTML = '';
            const conteneurTitre = document.createElement('div');

            // Layout uniforme : titre à gauche, badges à droite
            conteneurTitre.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
            conteneurTitre.innerHTML = `
                <span>Vue d'ensemble</span>
                ${genererIndicateurPratiqueOuCheckboxes()}
            `;

            titre.appendChild(conteneurTitre);
        }

        // Afficher tout (sans noms d'étudiants dans l'aperçu)
        afficherMetriquesGlobales(etudiantsAvecIndices);
        afficherAlertesPrioritairesCompteurs(etudiantsAvecIndices);

        // Afficher RàI et Patterns uniquement si activé dans les réglages
        const config = db.getSync('modalitesEvaluation', {});
        const activerRai = config.activerRai !== false; // Par défaut true (rétrocompatibilité)

        if (activerRai) {
            afficherPatternsApprentissage(etudiantsAvecIndices);
            afficherNiveauxRaI(etudiantsAvecIndices);
        }

        // 🆕 BETA 93: Afficher le graphique d'évolution temporelle (moyennes groupe)
        if (typeof creerGraphiqueGroupeMoyennes === 'function') {
            creerGraphiqueGroupeMoyennes('graphique-groupe-moyennes');
        } else {
            console.warn('⚠️ creerGraphiqueGroupeMoyennes non disponible - Module graphiques-progression.js non chargé ?');
        }

        console.log('✅ Tableau de bord chargé (aperçu anonyme)');

        // 🆕 BETA 91: Initialiser les événements toggle après génération du HTML
        initialiserEvenementsToggle();

    } catch (error) {
        console.error('❌ Erreur chargement tableau de bord:', error);
    }
}

/**
 * 🆕 BETA 91: Génère une interprétation des patterns d'apprentissage du groupe
 * Ton réaliste équilibré : présente forces et défis sans jugement
 * Format : nombres absolus ET pourcentages (ex: "17 étudiants, 68%")
 * @param {Array} patterns - Distribution des patterns [{pattern, count}, ...]
 * @param {number} totalEtudiants - Nombre total d'étudiants
 * @returns {string} Message d'interprétation HTML
 */
function genererInterpretationPatterns(patterns, totalEtudiants) {
    if (!patterns || totalEtudiants === 0) return '';

    // Classifier les patterns par catégories
    const favorables = ['Progression', 'Stable', 'Excellence émergente'];
    const difficultesEmergentes = ['Blocage émergent', 'Défi spécifique'];
    const critiques = ['Blocage critique'];

    let nbFavorables = 0;
    let nbDifficultesEmergentes = 0;
    let nbCritiques = 0;

    patterns.forEach(p => {
        if (favorables.includes(p.pattern)) {
            nbFavorables += p.count;
        } else if (difficultesEmergentes.includes(p.pattern)) {
            nbDifficultesEmergentes += p.count;
        } else if (critiques.includes(p.pattern)) {
            nbCritiques += p.count;
        }
    });

    const pctFavorables = Math.round((nbFavorables / totalEtudiants) * 100);
    const pctDifficultesEmergentes = Math.round((nbDifficultesEmergentes / totalEtudiants) * 100);
    const pctCritiques = Math.round((nbCritiques / totalEtudiants) * 100);

    // Construction du message équilibré
    const messages = [];

    // 1. Trajectoires favorables
    if (nbFavorables > 0) {
        messages.push(`${nbFavorables} étudiants (${pctFavorables}%) montrent une trajectoire d'apprentissage favorable (Progression, Stable, Excellence émergente)`);
    }

    // 2. Difficultés émergentes
    if (nbDifficultesEmergentes > 0) {
        messages.push(`${nbDifficultesEmergentes} étudiants (${pctDifficultesEmergentes}%) rencontrent des difficultés émergentes et nécessitent un soutien préventif`);
    }

    // 3. Blocages critiques
    if (nbCritiques > 0) {
        messages.push(`${nbCritiques} étudiants (${pctCritiques}%) sont en blocage critique et nécessitent un accompagnement différencié immédiat`);
    }

    if (messages.length === 0) {
        return '';
    }

    return messages.join('. ') + '.';
}

/**
 * 🆕 BETA 91: Génère une interprétation du modèle RàI du groupe
 * Focus : efficacité pédagogique (taux Niveau 1 indique si enseignement universel fonctionne)
 * Format : nombres absolus ET pourcentages (ex: "17 étudiants, 68%")
 * @param {Array} rai - Distribution RàI [{niveau, count}, ...]
 * @param {number} totalEtudiants - Nombre total d'étudiants
 * @returns {string} Message d'interprétation HTML
 */
function genererInterpretationRai(rai, totalEtudiants) {
    if (!rai || totalEtudiants === 0) return '';

    let niveau1 = 0;
    let niveau2 = 0;
    let niveau3 = 0;

    rai.forEach(r => {
        if (r.niveau === 1) niveau1 = r.count;
        if (r.niveau === 2) niveau2 = r.count;
        if (r.niveau === 3) niveau3 = r.count;
    });

    const pctNiveau1 = Math.round((niveau1 / totalEtudiants) * 100);
    const pctNiveau2 = Math.round((niveau2 / totalEtudiants) * 100);
    const pctNiveau3 = Math.round((niveau3 / totalEtudiants) * 100);

    // Analyse de l'efficacité pédagogique (seuils recommandés : 70-80% N1, 15-20% N2, 5-10% N3)
    let interpretation = '';

    if (pctNiveau1 >= 70) {
        interpretation = `La répartition RàI indique une efficacité satisfaisante de l'enseignement universel (${niveau1} étudiants, ${pctNiveau1}% au Niveau 1). `;
    } else if (pctNiveau1 >= 60) {
        interpretation = `La répartition RàI indique une efficacité acceptable de l'enseignement universel (${niveau1} étudiants, ${pctNiveau1}% au Niveau 1). `;
    } else {
        interpretation = `La répartition RàI suggère que l'enseignement universel pourrait être renforcé (${niveau1} étudiants, ${pctNiveau1}% au Niveau 1). `;
    }

    // Compléter avec Niveau 2 et 3
    if (niveau2 > 0) {
        interpretation += `${niveau2} étudiants (${pctNiveau2}%) nécessitent des interventions préventives ciblées. `;
    }

    if (niveau3 > 0) {
        interpretation += `${niveau3} étudiants (${pctNiveau3}%) requièrent un accompagnement intensif individualisé.`;
    }

    return interpretation;
}

/**
 * 🆕 BETA 91: Attache les événements de toggle pour les notes explicatives
 * Gère le clic sur les emojis 📐 pour afficher/masquer les cartes d'information
 * Utilise la classe CSS .ouvert pour l'animation de rotation (180deg)
 */
function initialiserEvenementsToggle() {
    document.querySelectorAll('.emoji-toggle').forEach(toggle => {
        // Retirer les anciens événements pour éviter les doublons
        const nouveauToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(nouveauToggle, toggle);

        // Attacher le nouvel événement
        nouveauToggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const isVisible = targetElement.style.display !== 'none';
                targetElement.style.display = isVisible ? 'none' : 'block';

                // 🎨 Animation de rotation via classe CSS (transition gérée par styles.css)
                if (isVisible) {
                    this.classList.remove('ouvert');
                } else {
                    this.classList.add('ouvert');
                }
            } else {
                console.warn('⚠️ Élément cible introuvable:', targetId);
            }
        });
    });

    console.log('✅ Événements toggle initialisés');
}

/**
 * Génère soit un badge de pratique simple, soit les checkboxes selon le mode
 * @returns {string} HTML du badge ou des checkboxes
 */
function genererIndicateurPratiqueOuCheckboxes() {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // NOUVEAU Beta 90 : Détection automatique du mode comparatif
    // Si les deux pratiques sont affichées, c'est le mode comparatif
    const modeComparatif = afficherSom && afficherPan;

    // MODE COMPARATIF: Afficher deux badges informatifs côte à côte
    // (similaires aux badges utilisés dans le profil étudiant)
    if (modeComparatif) {
        return `
            <div style="display: flex; gap: 10px; align-items: center;">
                ${genererBadgePratique('SOM', true)}
                ${genererBadgePratique('PAN', true)}
            </div>
        `;
    }

    // MODE NORMAL: Afficher un simple badge identifiant la pratique
    const pratique = afficherSom ? 'SOM' : 'PAN';

    // Utiliser la fonction globale unique (compact = true)
    return genererBadgePratique(pratique, true);
}


/* ===============================
   🧮 CALCULS DES INDICES
   =============================== */

/**
 * Récupère les indices calculés pour un étudiant
 * Retourne TOUJOURS sommatif ET alternatif
 * C'est l'affichage qui décide quoi montrer
 *
 * LECTURE DEPUIS STRUCTURE DUALE (SOM + PAN) :
 * - indicesCP[da].actuel.SOM → indices sommatifs
 * - indicesCP[da].actuel.PAN → indices alternatifs
 *
 * @param {string} da - DA de l'étudiant
 * @returns {Object} Indices complets { sommatif: {...}, alternatif: {...} }
 */
function calculerIndicesEtudiant(da) {
    // Récupérer les indices A depuis saisie-presences.js
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesA = obtenirDonneesSelonMode('indicesAssiduite') || {};

    // Récupérer les indices C et P depuis portfolio.js (Single Source of Truth)
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const indicesCPEtudiant = indicesCP[da]?.actuel || null;

    // 🔀 LECTURE DEPUIS LES DEUX BRANCHES
    const indicesSOM = indicesCPEtudiant?.SOM || null;
    const indicesPAN = indicesCPEtudiant?.PAN || null;

    // Structure complète avec sommatif ET alternatif
    // IMPORTANT: indicesA contient maintenant des objets { indice, heuresPresentes, heuresOffertes, nombreSeances }
    const assiduiteSommatif = indicesA.sommatif?.[da];
    const assiduiteAlternatif = indicesA.alternatif?.[da];

    const indices = {
        sommatif: {
            assiduite: (typeof assiduiteSommatif === 'object') ? assiduiteSommatif.indice : (assiduiteSommatif || 0),
            completion: indicesSOM ? indicesSOM.C / 100 : 0,
            performance: indicesSOM ? indicesSOM.P / 100 : 0
        },
        alternatif: {
            assiduite: (typeof assiduiteAlternatif === 'object') ? assiduiteAlternatif.indice : (assiduiteAlternatif || 0),
            completion: indicesPAN ? indicesPAN.C / 100 : 0,
            performance: indicesPAN ? indicesPAN.P / 100 : 0
        }
    };

    // ========================================
    // DÉCOUPLAGE P/R : Lire P_recent si activé pour PAN
    // ========================================
    let P_recent_PAN = null;
    if (indicesPAN && indicesPAN.details && indicesPAN.details.decouplerPR &&
        indicesPAN.details.P_recent !== null && indicesPAN.details.P_recent !== undefined) {
        P_recent_PAN = indicesPAN.details.P_recent / 100; // Convertir en proportion 0-1
        console.log(`[Découplage P/R] DA ${da}: P_recent=${indicesPAN.details.P_recent}% utilisé pour calcul risque PAN`);
    }

    // Calculer l'engagement pour les deux pratiques (E = racine cubique de A × C × P)
    indices.sommatif.engagement = calculerEngagement(
        indices.sommatif.assiduite,
        indices.sommatif.completion,
        indices.sommatif.performance
    );
    indices.sommatif.niveauEngagement = determinerNiveauEngagement(indices.sommatif.engagement);

    // Pour PAN: utiliser P_recent si découplage activé, sinon P normal
    const P_pour_engagement_PAN = P_recent_PAN !== null ? P_recent_PAN : indices.alternatif.performance;
    indices.alternatif.engagement = calculerEngagement(
        indices.alternatif.assiduite,
        indices.alternatif.completion,
        P_pour_engagement_PAN
    );
    indices.alternatif.niveauEngagement = determinerNiveauEngagement(indices.alternatif.engagement);

    return indices;
}

/**
 * Calcule le niveau d'engagement
 * FORMULE: E = (A × C × P)^(1/3) (racine cubique)
 * La racine cubique compense la décroissance multiplicative
 * Exemple: 80% × 80% × 80% = 51.2% → racine cubique → 80%
 *
 * @param {number} assiduite - Indice A (0-1)
 * @param {number} completion - Indice C (0-1)
 * @param {number} performance - Indice P (0-1)
 * @returns {number} Engagement entre 0 et 1
 */
function calculerEngagement(assiduite, completion, performance) {
    // Calcul du produit A × C × P
    const E_brut = assiduite * completion * performance;

    // Appliquer la racine cubique pour compenser la décroissance multiplicative
    const E_ajuste = Math.pow(E_brut, 1/3);

    return E_ajuste;
}

/**
 * Détermine le niveau d'engagement selon les seuils
 *
 * Seuils (échelle positive, inversée par rapport au risque):
 * - Très favorable: ≥ 0.80
 * - Favorable: 0.65 - 0.79
 * - Modéré: 0.50 - 0.64
 * - Fragile: 0.30 - 0.49
 * - Insuffisant: < 0.30
 *
 * @param {number} engagement - Indice d'engagement (0-1)
 * @returns {string} Niveau d'engagement
 */
function determinerNiveauEngagement(engagement) {
    if (engagement >= 0.80) return 'très favorable';
    if (engagement >= 0.65) return 'favorable';
    if (engagement >= 0.50) return 'modéré';
    if (engagement >= 0.30) return 'fragile';
    return 'insuffisant';
}

/* ===============================
   AFFICHAGE DES MÉTRIQUES
   =============================== */

/**
 * Affiche les métriques globales du groupe avec barres de distribution
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // Préparer les données pour chaque métrique
    const etudiantsSOM_A = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.assiduite
    }));

    const etudiantsPAN_A = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.assiduite
    }));

    const etudiantsSOM_C = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.completion
    }));

    const etudiantsPAN_C = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.completion
    }));

    const etudiantsSOM_P = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.performance
    }));

    const etudiantsPAN_P = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.performance
    }));

    const etudiantsSOM_E = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.engagement
    }));

    const etudiantsPAN_E = etudiants.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.engagement
    }));

    // 🆕 BETA 91: Calculer les corrélations A-P et C-P pour interprétation
    // Utiliser la pratique active (SOM ou PAN) pour les corrélations
    const valeursA = afficherPan ? etudiantsPAN_A.map(e => e.valeur) : etudiantsSOM_A.map(e => e.valeur);
    const valeursC = afficherPan ? etudiantsPAN_C.map(e => e.valeur) : etudiantsSOM_C.map(e => e.valeur);
    const valeursP = afficherPan ? etudiantsPAN_P.map(e => e.valeur) : etudiantsSOM_P.map(e => e.valeur);
    const valeursE = afficherPan ? etudiantsPAN_E.map(e => e.valeur) : etudiantsSOM_E.map(e => e.valeur);

    const r_AP = calculerCorrelationPearson(valeursA, valeursP);
    const r_CP = calculerCorrelationPearson(valeursC, valeursP);

    // Calculer la moyenne de E pour le groupe
    const moyenneE = valeursE.length > 0 ? valeursE.reduce((sum, val) => sum + val, 0) / valeursE.length : null;

    // Trouver la carte des indicateurs globaux
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteIndicateurs = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("Indicateurs globaux")) {
            carteIndicateurs = carte;
        }
    });

    if (!carteIndicateurs) return;

    // Conserver le header et la note toggle AVANT de vider
    const noteToggle = carteIndicateurs.querySelector('.carte-info-toggle');
    const header = carteIndicateurs.querySelector('h3');

    // Sauvegarder le HTML des éléments à préserver
    const headerHTML = header ? header.outerHTML : '';
    const noteToggleHTML = noteToggle ? noteToggle.outerHTML : '';

    // Vider et reconstruire avec header et note
    carteIndicateurs.innerHTML = headerHTML + noteToggleHTML;

    // Générer la légende unique en haut
    const legendeUnique = `
        <div class="distribution-legende-commune tb-barre-rai">
            <div class="tb-flex-center-around">
                <span style="color: #ff9800; text-align: center; font-weight: 600;">Fragile<br><span class="tb-texte-mini">30-49%</span></span>
                <span style="color: #ffc107; text-align: center; font-weight: 600;">Modéré<br><span class="tb-texte-mini">50-64%</span></span>
                <span style="color: #28a745; text-align: center; font-weight: 600;">Favorable<br><span class="tb-texte-mini">65-79%</span></span>
                <span style="color: #2196F3; text-align: center; font-weight: 600;">Très favorable<br><span class="tb-texte-mini">≥ 80%</span></span>
            </div>
        </div>
    `;

    // Générer les 4 barres de distribution avec interprétations
    const html = `
        <div class="tb-p-20">
            ${legendeUnique}
            ${genererBarreDistribution('Assiduité (A)', etudiantsSOM_A, etudiantsPAN_A, 'A', afficherSom, afficherPan, r_AP)}
            ${genererBarreDistribution('Complétion (C)', etudiantsSOM_C, etudiantsPAN_C, 'C', afficherSom, afficherPan, r_CP)}
            ${genererBarreDistribution('Performance (P)', etudiantsSOM_P, etudiantsPAN_P, 'P', afficherSom, afficherPan, null)}
            ${genererBarreDistribution('Engagement (E)', etudiantsSOM_E, etudiantsPAN_E, 'E', afficherSom, afficherPan, null, moyenneE)}
        </div>
    `;

    carteIndicateurs.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte de métrique avec les valeurs SOM et PAN
 * Format standard: fond blanc avec fine bordure
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 * @param {string} label - Nom de la métrique
 * @param {number} valeurSom - Valeur SOM
 * @param {number} valeurPan - Valeur PAN
 * @param {boolean} afficherSom - Afficher SOM
 * @param {boolean} afficherPan - Afficher PAN
 * @returns {string} HTML de la carte
 */
function genererCarteMetrique(label, valeurSom, valeurPan, afficherSom, afficherPan, description = '') {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-tres-grande-orange">${formatPourcentage(valeurSom)}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-tres-grande-bleu-pan">${formatPourcentage(valeurPan)}</strong>`);
    }

    // Intégrer la description dans le label si présente
    const labelComplet = description ? `${label} <span class="tb-texte-petit-gris">(${description})</span>` : label;

    return `
        <div class="carte-metrique">
            <span class="label">${labelComplet}</span>
            <div class="tb-flex-gap15-baseline">
                ${valeurs.join('')}
            </div>
        </div>
    `;
}

/* ===============================
   NOUVELLES FONCTIONS : BARRES DE DISTRIBUTION
   =============================== */

/**
 * Génère une barre de distribution visuelle pour A, C, P ou E
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {string} label - Nom de la métrique (ex: "Assiduité")
 * @param {Array} etudiantsSOM - [{da, nom, prenom, valeur}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, valeur}] pour PAN
 * @param {string} type - Type de métrique ('A', 'C', 'P', 'E')
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre de distribution
 */
function genererBarreDistribution(label, etudiantsSOM, etudiantsPAN, type, afficherSom, afficherPan, correlation = null, moyenneEngagement = null) {
    console.log(`🎯 genererBarreDistribution appelée: type="${type}", afficherSom=${afficherSom}, afficherPan=${afficherPan}, correlation=${correlation}, moyenneEngagement=${moyenneEngagement}`);
    console.log(`   etudiantsSOM.length=${etudiantsSOM?.length || 0}, etudiantsPAN.length=${etudiantsPAN?.length || 0}`);

    // Gradient de couleurs selon les seuils d'engagement (4 zones, sans Insuffisant)
    // Orange (30-49%) → Jaune (50-64%) → Vert (65-79%) → Bleu (≥80%)
    // Transitions douces entre les couleurs
    const gradient = `linear-gradient(to right,
        #ff9800 0%,
        #ffc107 25%,
        #28a745 50%,
        #2196F3 75%)`;

    // Calculer les moyennes pour affichage
    let moyenneSOM = null;
    let moyennePAN = null;

    if (afficherSom && etudiantsSOM.length > 0) {
        const somme = etudiantsSOM.reduce((acc, e) => acc + e.valeur, 0);
        moyenneSOM = Math.round((somme / etudiantsSOM.length) * 100);
    }

    if (afficherPan && etudiantsPAN.length > 0) {
        const somme = etudiantsPAN.reduce((acc, e) => acc + e.valeur, 0);
        moyennePAN = Math.round((somme / etudiantsPAN.length) * 100);
    }

    // 🆕 BETA 91: Générer l'interprétation de la corrélation ou de la moyenne E ou distribution P
    let interpretationHTML = '';

    // PRIORITÉ 1: Distribution P ou diagnostic note de passage
    if (type === 'P' && (etudiantsSOM.length > 0 || etudiantsPAN.length > 0)) {
        const etudiants = afficherPan ? etudiantsPAN : etudiantsSOM;
        const config = db.getSync('modalitesEvaluation', {});
        const soloActive = config.afficherDescriptionsSOLO !== false; // Par défaut true
        const raiActive = config.activerRai !== false; // Par défaut true

        console.log('📊 Type P détecté, soloActive =', soloActive, 'raiActive =', raiActive);

        if (soloActive) {
            // 🆕 BETA 91: Distribution IDME + interprétation (si RàI activé)
            console.log('📊 Appel calculerDistributionPerformance avec', etudiants.length, 'étudiants');

            const distribution = calculerDistributionPerformance(etudiants);
            console.log('📊 Distribution retournée:', distribution);

            let interpretation = '';

            if (raiActive) {
                // Interprétation pédagogique avancée avec patterns
                const echelles = db.getSync('echellesTemplates', []);
                const echelleId = db.getSync('echellePerformanceActive', 'idme-5niv');
                let echelle = echelles.find(e => e.id === echelleId);
                if (!echelle) {
                    echelle = echelles.find(e => e.parDefaut === true) || echelles[0];
                }

                interpretation = echelle ? genererInterpretationPerformance(etudiants, echelle) : '';
                console.log('📊 Interprétation IDME+patterns retournée:', interpretation);
            }

            if (distribution) {
                interpretationHTML = `
                    <div class="tb-texte-description">
                        <div><span class="u-texte-gras">Distribution : </span>${distribution}</div>
                        ${interpretation ? `<div class="u-mt-6">${interpretation}</div>` : ''}
                    </div>
                `;
            } else {
                console.log('⚠️ Distribution est null/undefined, pas d\'affichage');
            }
        } else {
            // 🆕 BETA 91: Diagnostic basique note de passage (SOLO désactivé)
            console.log('📊 SOLO désactivé, génération diagnostic note de passage');
            const diagnostic = genererDiagnosticNotePassage(etudiants);
            console.log('📊 Diagnostic note de passage retourné:', diagnostic);

            if (diagnostic) {
                interpretationHTML = `
                    <div class="tb-texte-description">
                        ${diagnostic}
                    </div>
                `;
            }
        }
    }
    // PRIORITÉ 2: Corrélations A-P et C-P
    else if (correlation !== null && !isNaN(correlation)) {
        // Interprétation des corrélations A-P ou C-P avec force intégrée dans la phrase
        const absR = Math.abs(correlation);
        let forceAdjectif = '';
        let explication = '';

        // Déterminer la force de la corrélation (adjectif)
        if (absR >= 0.9) {
            forceAdjectif = 'très forte';
        } else if (absR >= 0.7) {
            forceAdjectif = 'forte';
        } else if (absR >= 0.5) {
            forceAdjectif = 'modérée';
        } else if (absR >= 0.3) {
            forceAdjectif = 'faible';
        } else {
            forceAdjectif = 'très faible';
        }

        // Explication pédagogique avec force intégrée et corrélation à la fin
        if (type === 'A') {
            explication = `Les étudiants assidus en classe ont une tendance ${forceAdjectif} à obtenir de meilleures performances. (r(${type}↔P) = ${correlation.toFixed(3)})`;
        } else if (type === 'C') {
            explication = `Les étudiants qui remettent plus de travaux ont une tendance ${forceAdjectif} à avoir de meilleures notes. (r(${type}↔P) = ${correlation.toFixed(3)})`;
        }

        interpretationHTML = `
            <div class="tb-texte-description">
                ${explication}
            </div>
        `;
    }
    // PRIORITÉ 3: Moyenne E
    else if (type === 'E' && moyenneEngagement !== null && !isNaN(moyenneEngagement)) {
        // Interprétation de la moyenne E avec qualification du niveau et impact sur contexte
        const moyE = moyenneEngagement * 100; // Convertir en pourcentage
        let niveauAdjectif = '';
        let impactContexte = '';

        if (moyE >= 70) {
            niveauAdjectif = 'bon';
            impactContexte = 'rend favorable le contexte d\'apprentissage';
        } else if (moyE >= 55) {
            niveauAdjectif = 'modéré';
            impactContexte = 'offre un contexte d\'apprentissage acceptable, mais améliorable';
        } else {
            niveauAdjectif = 'faible';
            impactContexte = 'fragilise le contexte d\'apprentissage et nécessite des interventions';
        }

        interpretationHTML = `
            <div class="tb-texte-description">
                Le ${niveauAdjectif} niveau d'engagement global du groupe (moy. ${Math.round(moyE)}%) ${impactContexte}.
            </div>
        `;
    }

    // Générer l'affichage dual des valeurs moyennes
    let valeursHTML = '';
    if (moyenneSOM !== null && moyennePAN !== null) {
        // Mode comparatif : afficher les deux valeurs
        valeursHTML = `
            <span style="display: flex; gap: 8px; align-items: center; font-size: 0.9rem; font-weight: 600; margin-left: 10px;">
                <span style="color: var(--som-orange);">${moyenneSOM}%</span>
                <span style="color: #999;">|</span>
                <span style="color: var(--pan-bleu);">${moyennePAN}%</span>
            </span>
        `;
    } else if (moyenneSOM !== null) {
        // Mode SOM uniquement
        valeursHTML = `<span class="tb-texte-moyen-orange">${moyenneSOM}%</span>`;
    } else if (moyennePAN !== null) {
        // Mode PAN uniquement
        valeursHTML = `<span class="tb-texte-moyen-bleu-pan">${moyennePAN}%</span>`;
    }

    // Générer les points pour SOM avec jitter aléatoire
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        // Grouper par score pour appliquer un jitter aux étudiants au même score
        const groupesSOM = {};
        etudiantsSOM.forEach(e => {
            const scoreArrondi = Math.round(e.valeur * 100);
            if (!groupesSOM[scoreArrondi]) {
                groupesSOM[scoreArrondi] = [];
            }
            groupesSOM[scoreArrondi].push(e);
        });

        // Générer les points avec jitter aléatoire pour éviter superposition parfaite
        Object.keys(groupesSOM).forEach(score => {
            const etudiants = groupesSOM[score];
            etudiants.forEach((e, index) => {
                // Mapper 30-100% sur 0-100% de la barre
                const position = Math.max(0, Math.min((e.valeur - 0.30) / 0.70 * 100, 100));
                // Jitter pour dilater les agglomérations : ±1.5% horizontal, ±12px vertical
                const jitterH = (Math.random() - 0.5) * 3.0; // -1.5% à +1.5%
                const jitterV = (Math.random() - 0.5) * 24; // -12px à +12px
                // Contraindre la position finale pour ne pas dépasser les bords
                const positionFinale = Math.max(0, Math.min(position + jitterH, 100));
                // Anonymiser le nom si en mode anonymisation
                const modeActif = db.getSync('modeApplication', 'normal');
                let nomAffiche;
                if (modeActif === 'anonymisation') {
                    // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                    if (e.prenom && e.prenom.startsWith('Élève')) {
                        nomAffiche = e.prenom;
                    } else {
                        // Sinon, utiliser la fonction d'anonymisation
                        nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                    }
                } else {
                    nomAffiche = `${e.nom}, ${e.prenom}`;
                }
                lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                    style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(nomAffiche)}"
                    data-valeur="${Math.round(e.valeur * 100)}%"
                    title="${echapperHtml(nomAffiche)} : ${Math.round(e.valeur * 100)}%"></div>`;
            });
        });
    }

    // Générer les points pour PAN avec jitter aléatoire
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        // Grouper par score pour appliquer un jitter aux étudiants au même score
        const groupesPAN = {};
        etudiantsPAN.forEach(e => {
            const scoreArrondi = Math.round(e.valeur * 100);
            if (!groupesPAN[scoreArrondi]) {
                groupesPAN[scoreArrondi] = [];
            }
            groupesPAN[scoreArrondi].push(e);
        });

        // Générer les points avec jitter aléatoire pour éviter superposition parfaite
        Object.keys(groupesPAN).forEach(score => {
            const etudiants = groupesPAN[score];
            etudiants.forEach((e, index) => {
                // Mapper 30-100% sur 0-100% de la barre
                const position = Math.max(0, Math.min((e.valeur - 0.30) / 0.70 * 100, 100));
                // Jitter pour dilater les agglomérations : ±1.5% horizontal, ±12px vertical
                const jitterH = (Math.random() - 0.5) * 3.0; // -1.5% à +1.5%
                const jitterV = (Math.random() - 0.5) * 24; // -12px à +12px
                // Contraindre la position finale pour ne pas dépasser les bords
                const positionFinale = Math.max(0, Math.min(position + jitterH, 100));
                // Anonymiser le nom si en mode anonymisation
                const modeActif = db.getSync('modeApplication', 'normal');
                let nomAffiche;
                if (modeActif === 'anonymisation') {
                    // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                    if (e.prenom && e.prenom.startsWith('Élève')) {
                        nomAffiche = e.prenom;
                    } else {
                        // Sinon, utiliser la fonction d'anonymisation
                        nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                    }
                } else {
                    nomAffiche = `${e.nom}, ${e.prenom}`;
                }
                lignesPAN += `<div class="barre-etudiant barre-etudiant-pan"
                    style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(nomAffiche)}"
                    data-valeur="${Math.round(e.valeur * 100)}%"
                    title="${echapperHtml(nomAffiche)} : ${Math.round(e.valeur * 100)}%"></div>`;
            });
        });
    }

    return `
        <div class="distribution-container u-mb-20">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 class="tb-titre-simple">${label}</h4>
                ${valeursHTML}
            </div>
            ${interpretationHTML}
            <div class="barre-indicateur" style="position: relative; height: 30px; margin-top: ${interpretationHTML ? '8px' : '0'};">
                <div class="barre-indicateur-overlay"></div>
                ${lignesSOM}
                ${lignesPAN}
            </div>
        </div>
    `;
}

/**
 * Génère une barre de distribution pour les patterns d'apprentissage
 * 4 zones : Stable (vert) | Défi (bleu) | Émergent (jaune) | Critique (orange)
 *
 * @param {Array} etudiantsSOM - [{da, nom, prenom, pattern}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, pattern}] pour PAN
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre
 */
function genererBarrePatterns(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan) {
    // 4 zones du spectre lumineux avec transitions douces
    // Vert → Cyan → Bleu → Indigo (bon → critique)
    // Gradient maintenant défini dans styles.css (.barre-patterns)

    // Mapper les patterns aux positions (centre de chaque zone)
    const positionPattern = {
        'stable': 12.5,          // Centre de 0-25%
        'progression': 12.5,
        'defi-specifique': 37.5, // Centre de 25-50%
        'blocage-emergent': 62.5,// Centre de 50-75%
        'blocage-critique': 87.5 // Centre de 75-100%
    };

    // Calculer les compteurs par pattern pour SOM et PAN
    const compteursSOM = { 'stable': 0, 'progression': 0, 'defi-specifique': 0, 'blocage-emergent': 0, 'blocage-critique': 0 };
    const compteursPAN = { 'stable': 0, 'progression': 0, 'defi-specifique': 0, 'blocage-emergent': 0, 'blocage-critique': 0 };

    // Générer les points pour SOM avec jitter (nuage de points)
    // SOM = GAUCHE de chaque zone (position - 2%)
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            const pattern = e.pattern || 'stable';
            compteursSOM[pattern] = (compteursSOM[pattern] || 0) + 1;

            const position = positionPattern[pattern] || 50;
            const decalageH = -2; // SOM à gauche
            const jitterH = (Math.random() - 0.5) * 3.0; // ±1.5% pour dilater agglomérations
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-pattern="${pattern}"
                title="${echapperHtml(nomAffiche)} : ${pattern}"></div>`;
        });
    }

    // Générer les points pour PAN avec jitter (nuage de points)
    // PAN = DROITE de chaque zone (position + 2%)
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => {
            const pattern = e.pattern || 'stable';
            compteursPAN[pattern] = (compteursPAN[pattern] || 0) + 1;

            const position = positionPattern[pattern] || 50;
            const decalageH = 2; // PAN à droite
            const jitterH = (Math.random() - 0.5) * 3.0; // ±1.5% pour dilater agglomérations
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            lignesPAN += `<div class="barre-etudiant barre-etudiant-pan"
                style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-pattern="${pattern}"
                title="${echapperHtml(nomAffiche)} : ${pattern}"></div>`;
        });
    }

    // Calculer les pourcentages pour chaque zone
    const totalSOM = etudiantsSOM.length || 1;
    const totalPAN = etudiantsPAN.length || 1;

    // Regrouper stable + progression
    const stableSOM = (compteursSOM['stable'] || 0) + (compteursSOM['progression'] || 0);
    const stablePAN = (compteursPAN['stable'] || 0) + (compteursPAN['progression'] || 0);
    const stablePctSOM = Math.round((stableSOM / totalSOM) * 100);
    const stablePctPAN = Math.round((stablePAN / totalPAN) * 100);

    const defiSOM = compteursSOM['defi-specifique'] || 0;
    const defiPAN = compteursPAN['defi-specifique'] || 0;
    const defiPctSOM = Math.round((defiSOM / totalSOM) * 100);
    const defiPctPAN = Math.round((defiPAN / totalPAN) * 100);

    const emergentSOM = compteursSOM['blocage-emergent'] || 0;
    const emergentPAN = compteursPAN['blocage-emergent'] || 0;
    const emergentPctSOM = Math.round((emergentSOM / totalSOM) * 100);
    const emergentPctPAN = Math.round((emergentPAN / totalPAN) * 100);

    const critiqueSOM = compteursSOM['blocage-critique'] || 0;
    const critiquePAN = compteursPAN['blocage-critique'] || 0;
    const critiquePctSOM = Math.round((critiqueSOM / totalSOM) * 100);
    const critiquePctPAN = Math.round((critiquePAN / totalPAN) * 100);

    // Générer labels avec compteurs et pourcentages
    let labelStable = 'Progression<br>stable';
    let labelDefi = 'Défi<br>spécifique';
    let labelEmergent = 'Blocage<br>émergent';
    let labelCritique = 'Blocage<br>critique';

    if (afficherSom && afficherPan) {
        labelStable += `<br><span class="tb-texte-mini-orange">${stableSOM} (${stablePctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${stablePAN} (${stablePctPAN}%)</span>`;
        labelDefi += `<br><span class="tb-texte-mini-orange">${defiSOM} (${defiPctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${defiPAN} (${defiPctPAN}%)</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-orange">${emergentSOM} (${emergentPctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${emergentPAN} (${emergentPctPAN}%)</span>`;
        labelCritique += `<br><span class="tb-texte-mini-orange">${critiqueSOM} (${critiquePctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${critiquePAN} (${critiquePctPAN}%)</span>`;
    } else if (afficherSom) {
        labelStable += `<br><span class="tb-texte-mini-orange">${stableSOM} (${stablePctSOM}%)</span>`;
        labelDefi += `<br><span class="tb-texte-mini-orange">${defiSOM} (${defiPctSOM}%)</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-orange">${emergentSOM} (${emergentPctSOM}%)</span>`;
        labelCritique += `<br><span class="tb-texte-mini-orange">${critiqueSOM} (${critiquePctSOM}%)</span>`;
    } else if (afficherPan) {
        labelStable += `<br><span class="tb-texte-mini-bleu-pan">${stablePAN} (${stablePctPAN}%)</span>`;
        labelDefi += `<br><span class="tb-texte-mini-bleu-pan">${defiPAN} (${defiPctPAN}%)</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-bleu-pan">${emergentPAN} (${emergentPctPAN}%)</span>`;
        labelCritique += `<br><span class="tb-texte-mini-bleu-pan">${critiquePAN} (${critiquePctPAN}%)</span>`;
    }

    // 🆕 BETA 91: Générer l'interprétation des patterns
    let interpretation = '';
    const etudiants = afficherSom ? etudiantsSOM : etudiantsPAN;
    if (etudiants && etudiants.length > 0) {
        // Note: stableSOM inclut déjà stable + progression (ligne 1337)
        // Si mode comparatif, utiliser les données de la pratique affichée
        if (afficherSom && afficherPan) {
            // Mode comparatif : utiliser les données de SOM uniquement (car les deux sont affichés)
            const patternsDistributionSOM = [
                { pattern: 'Progression', count: stableSOM },  // stable + progression regroupés
                { pattern: 'Stable', count: 0 },
                { pattern: 'Excellence émergente', count: 0 },
                { pattern: 'Défi spécifique', count: defiSOM },
                { pattern: 'Blocage émergent', count: emergentSOM },
                { pattern: 'Blocage critique', count: critiqueSOM }
            ];
            interpretation = genererInterpretationPatterns(patternsDistributionSOM, etudiantsSOM.length);
        } else if (afficherSom) {
            const patternsDistributionSOM = [
                { pattern: 'Progression', count: stableSOM },  // stable + progression regroupés
                { pattern: 'Stable', count: 0 },
                { pattern: 'Excellence émergente', count: 0 },
                { pattern: 'Défi spécifique', count: defiSOM },
                { pattern: 'Blocage émergent', count: emergentSOM },
                { pattern: 'Blocage critique', count: critiqueSOM }
            ];
            interpretation = genererInterpretationPatterns(patternsDistributionSOM, etudiantsSOM.length);
        } else if (afficherPan) {
            const patternsDistributionPAN = [
                { pattern: 'Progression', count: stablePAN },  // stable + progression regroupés
                { pattern: 'Stable', count: 0 },
                { pattern: 'Excellence émergente', count: 0 },
                { pattern: 'Défi spécifique', count: defiPAN },
                { pattern: 'Blocage émergent', count: emergentPAN },
                { pattern: 'Blocage critique', count: critiquePAN }
            ];
            interpretation = genererInterpretationPatterns(patternsDistributionPAN, etudiantsPAN.length);
        }
    }

    return `
        <div class="distribution-container u-mb-15">
            <h4 class="tb-titre-metrique">Répartition des patterns d'apprentissage</h4>
            ${interpretation ? `<div class="interpretation-barre">${interpretation}</div>` : ''}
            <div class="barre-patterns tb-barre-simple">
                <div class="barre-patterns-overlay"></div>
                ${lignesSOM}
                ${lignesPAN}
            </div>
            <div class="distribution-legende tb-barre-distribution">
                <span style="position: absolute; left: 12.5%; transform: translateX(-50%); color: #1bbd7e; font-weight: 600; text-align: center;">${labelStable}</span>
                <span style="position: absolute; left: 37.5%; transform: translateX(-50%); color: #11aec5; font-weight: 600; text-align: center;">${labelDefi}</span>
                <span style="position: absolute; left: 62.5%; transform: translateX(-50%); color: #2994ee; font-weight: 600; text-align: center;">${labelEmergent}</span>
                <span style="position: absolute; left: 87.5%; transform: translateX(-50%); color: #4f74f3; font-weight: 600; text-align: center;">${labelCritique}</span>
            </div>
        </div>
    `;
}

/**
 * Génère une barre de distribution pour les niveaux RàI
 * 3 zones : Niveau 1 (vert) | Niveau 2 (jaune) | Niveau 3 (orange)
 *
 * @param {Array} etudiantsSOM - [{da, nom, prenom, niveau}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, niveau}] pour PAN
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre
 */
function genererBarreRaI(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan) {
    // 3 zones du spectre lumineux avec transitions douces
    // Bleu → Mauve → Violet (niveau 1 → niveau 3)
    // Gradient maintenant défini dans styles.css (.barre-rai)

    // Mapper les niveaux aux positions (centre de chaque zone)
    const positionNiveau = {
        1: 16.5,  // Centre de 0-33%
        2: 49.5,  // Centre de 33-66%
        3: 83     // Centre de 66-100%
    };

    // Calculer les compteurs par niveau pour SOM et PAN
    const compteursSOM = { 1: 0, 2: 0, 3: 0 };
    const compteursPAN = { 1: 0, 2: 0, 3: 0 };

    // Générer les points pour SOM avec jitter (nuage de points)
    // SOM = GAUCHE de chaque zone (position - 2%)
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            const niveau = e.niveau || 1;
            compteursSOM[niveau] = (compteursSOM[niveau] || 0) + 1;

            const position = positionNiveau[niveau] || 50;
            const decalageH = -2; // SOM à gauche
            const jitterH = (Math.random() - 0.5) * 3.0; // ±1.5% pour dilater agglomérations
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-niveau="${niveau}"
                title="${echapperHtml(nomAffiche)} : Niveau ${niveau}"></div>`;
        });
    }

    // Générer les points pour PAN avec jitter (nuage de points)
    // PAN = DROITE de chaque zone (position + 2%)
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => {
            const niveau = e.niveau || 1;
            compteursPAN[niveau] = (compteursPAN[niveau] || 0) + 1;

            const position = positionNiveau[niveau] || 50;
            const decalageH = 2; // PAN à droite
            const jitterH = (Math.random() - 0.5) * 3.0; // ±1.5% pour dilater agglomérations
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            lignesPAN += `<div class="barre-etudiant barre-etudiant-pan"
                style="left: ${positionFinale}%; top: calc(50% + ${jitterV}px);"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-niveau="${niveau}"
                title="${echapperHtml(nomAffiche)} : Niveau ${niveau}"></div>`;
        });
    }

    // Calculer les pourcentages pour chaque niveau
    const totalSOM = etudiantsSOM.length || 1;
    const totalPAN = etudiantsPAN.length || 1;

    const niveau1SOM = compteursSOM[1] || 0;
    const niveau1PAN = compteursPAN[1] || 0;
    const niveau1PctSOM = Math.round((niveau1SOM / totalSOM) * 100);
    const niveau1PctPAN = Math.round((niveau1PAN / totalPAN) * 100);

    const niveau2SOM = compteursSOM[2] || 0;
    const niveau2PAN = compteursPAN[2] || 0;
    const niveau2PctSOM = Math.round((niveau2SOM / totalSOM) * 100);
    const niveau2PctPAN = Math.round((niveau2PAN / totalPAN) * 100);

    const niveau3SOM = compteursSOM[3] || 0;
    const niveau3PAN = compteursPAN[3] || 0;
    const niveau3PctSOM = Math.round((niveau3SOM / totalSOM) * 100);
    const niveau3PctPAN = Math.round((niveau3PAN / totalPAN) * 100);

    // Générer labels avec compteurs et pourcentages
    let labelNiveau1 = 'Niveau 1<br>Universel';
    let labelNiveau2 = 'Niveau 2<br>Préventif';
    let labelNiveau3 = 'Niveau 3<br>Intensif';

    if (afficherSom && afficherPan) {
        labelNiveau1 += `<br><span class="tb-texte-mini-orange">${niveau1SOM} (${niveau1PctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${niveau1PAN} (${niveau1PctPAN}%)</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-orange">${niveau2SOM} (${niveau2PctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${niveau2PAN} (${niveau2PctPAN}%)</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-orange">${niveau3SOM} (${niveau3PctSOM}%)</span> <span class="tb-texte-mini-bleu-pan">${niveau3PAN} (${niveau3PctPAN}%)</span>`;
    } else if (afficherSom) {
        labelNiveau1 += `<br><span class="tb-texte-mini-orange">${niveau1SOM} (${niveau1PctSOM}%)</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-orange">${niveau2SOM} (${niveau2PctSOM}%)</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-orange">${niveau3SOM} (${niveau3PctSOM}%)</span>`;
    } else if (afficherPan) {
        labelNiveau1 += `<br><span class="tb-texte-mini-bleu-pan">${niveau1PAN} (${niveau1PctPAN}%)</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-bleu-pan">${niveau2PAN} (${niveau2PctPAN}%)</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-bleu-pan">${niveau3PAN} (${niveau3PctPAN}%)</span>`;
    }

    // 🆕 BETA 91: Générer l'interprétation RàI
    let interpretation = '';
    const etudiants = afficherSom ? etudiantsSOM : etudiantsPAN;
    if (etudiants && etudiants.length > 0) {
        // Si mode comparatif, utiliser les données de la pratique affichée
        if (afficherSom && afficherPan) {
            // Mode comparatif : utiliser les données combinées
            const raiDistribution = [
                { niveau: 1, count: niveau1SOM + niveau1PAN },
                { niveau: 2, count: niveau2SOM + niveau2PAN },
                { niveau: 3, count: niveau3SOM + niveau3PAN }
            ];
            interpretation = genererInterpretationRai(raiDistribution, etudiantsSOM.length);
        } else if (afficherSom) {
            const raiDistributionSOM = [
                { niveau: 1, count: niveau1SOM },
                { niveau: 2, count: niveau2SOM },
                { niveau: 3, count: niveau3SOM }
            ];
            interpretation = genererInterpretationRai(raiDistributionSOM, etudiantsSOM.length);
        } else if (afficherPan) {
            const raiDistributionPAN = [
                { niveau: 1, count: niveau1PAN },
                { niveau: 2, count: niveau2PAN },
                { niveau: 3, count: niveau3PAN }
            ];
            interpretation = genererInterpretationRai(raiDistributionPAN, etudiantsPAN.length);
        }
    }

    return `
        <div class="distribution-container u-mb-15">
            <h4 class="tb-titre-metrique">Modèle de la Réponse à l'intervention (RàI)</h4>
            ${interpretation ? `<div class="interpretation-barre">${interpretation}</div>` : ''}
            <div class="barre-rai tb-barre-simple">
                <div class="barre-rai-overlay"></div>
                ${lignesSOM}
                ${lignesPAN}
            </div>
            <div class="distribution-legende tb-barre-distribution">
                <span style="position: absolute; left: 16.5%; transform: translateX(-50%); color: #2196f3; font-weight: 600; text-align: center;">${labelNiveau1}</span>
                <span style="position: absolute; left: 49.5%; transform: translateX(-50%); color: #6366f1; font-weight: 600; text-align: center;">${labelNiveau2}</span>
                <span style="position: absolute; left: 83%; transform: translateX(-50%); color: #7c3aed; font-weight: 600; text-align: center;">${labelNiveau3}</span>
            </div>
        </div>
    `;
}

/**
 * Affiche les compteurs de niveaux d'engagement
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritairesCompteurs(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;
    const nbTotal = etudiants.length;

    // Calculer les statistiques pour SOM
    let somTresFavorable = 0, somFavorable = 0, somModere = 0, somFragile = 0, somInsuffisant = 0;
    etudiants.forEach(e => {
        const niveau = e.sommatif.niveauEngagement;
        if (niveau === 'très favorable') somTresFavorable++;
        else if (niveau === 'favorable') somFavorable++;
        else if (niveau === 'modéré') somModere++;
        else if (niveau === 'fragile') somFragile++;
        else if (niveau === 'insuffisant') somInsuffisant++;
    });

    // Calculer les statistiques pour PAN
    let panTresFavorable = 0, panFavorable = 0, panModere = 0, panFragile = 0, panInsuffisant = 0;
    etudiants.forEach(e => {
        const niveau = e.alternatif.niveauEngagement;
        if (niveau === 'très favorable') panTresFavorable++;
        else if (niveau === 'favorable') panFavorable++;
        else if (niveau === 'modéré') panModere++;
        else if (niveau === 'fragile') panFragile++;
        else if (niveau === 'insuffisant') panInsuffisant++;
    });

    // Trouver la carte Niveau d'engagement
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteEngagement = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("Niveau d'engagement")) {
            carteEngagement = carte;
        }
    });

    if (!carteEngagement) return;

    // Conserver le header et la note toggle
    const noteToggle = carteEngagement.querySelector('.carte-info-toggle');
    const header = carteEngagement.querySelector('h3');

    carteEngagement.innerHTML = '';
    carteEngagement.appendChild(header);
    if (noteToggle) carteEngagement.appendChild(noteToggle);

    // Générer les cartes (ordre inversé : favorable en haut, insuffisant en bas)
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${genererCarteEngagement('Engagement favorable', somTresFavorable + somFavorable, panTresFavorable + panFavorable, nbTotal, afficherSom, afficherPan, 'var(--alerte-fond-succes)', 'var(--btn-confirmer)')}
            ${genererCarteEngagement('Engagement modéré', somModere, panModere, nbTotal, afficherSom, afficherPan, '#fffbf0', '#fbc02d')}
            ${genererCarteEngagement('Engagement fragile', somFragile, panFragile, nbTotal, afficherSom, afficherPan, '#fff8f0', 'var(--risque-tres-eleve)')}
            ${genererCarteEngagement('Engagement insuffisant', somInsuffisant, panInsuffisant, nbTotal, afficherSom, afficherPan, '#fff5f5', 'var(--risque-critique)')}
        </div>
    `;

    carteEngagement.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte d'engagement avec les valeurs SOM et PAN colorées
 */
function genererCarteEngagement(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-grande-orange">${valeurSom}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-pan">${valeurPan}</strong>`);
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div class="u-flex-between">
                <span class="tb-texte-moyen-gris">${label}</span>
                <div class="tb-flex-gap15-baseline">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche la liste des étudiants à engagement insuffisant
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 * @param {boolean} afficherSommatif - Utiliser les indices sommatifs
 */
function afficherListeEtudiantsCritiques(etudiants, afficherSommatif) {
    const container = document.getElementById('tb-etudiants-critique');
    if (!container) return;

    const etudiantsCritiques = etudiants
        .filter(e => {
            const niveau = afficherSommatif ? e.sommatif.niveauEngagement : e.alternatif.niveauEngagement;
            return niveau === 'insuffisant';
        })
        .sort((a, b) => {
            const engagementA = afficherSommatif ? a.sommatif.engagement : a.alternatif.engagement;
            const engagementB = afficherSommatif ? b.sommatif.engagement : b.alternatif.engagement;
            return engagementA - engagementB; // Tri croissant (engagement le plus faible en premier)
        });

    container.innerHTML = etudiantsCritiques.map(e => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center;
                        padding: 12px; background: white; border-radius: 6px;
                        border-left: 4px solid var(--risque-critique);">
                <div>
                    <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                    <span style="color: #666; margin-left: 10px;">(${echapperHtml(e.groupe || '—')})</span>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
                        A: ${formatPourcentage(indices.assiduite)} |
                        C: ${formatPourcentage(indices.completion)} |
                        P: ${formatPourcentage(indices.performance)}
                    </div>
                </div>
                <button class="btn btn-principal"
                        onclick="afficherSection('etudiants'); setTimeout(() => { afficherSousSection('profil-etudiant'); chargerProfilEtudiant('${e.da}'); }, 100);"
                        class="tb-padding-compact">
                    Voir profil
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Génère une carte de pattern avec valeurs SOM et PAN colorées
 */
function genererCartePattern(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-grande-orange">${valeurSom}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-pan">${valeurPan}</strong>`);
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div class="u-flex-between">
                <span class="tb-texte-moyen-gris">${label}</span>
                <div class="tb-flex-gap15-baseline">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche les patterns d'apprentissage
 * En mode hybride, affiche SOM et PAN côte à côte
 *
 * NOUVEAU Beta 90 : Utilise l'interface de pratiques au lieu du calcul hardcodé
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherPatternsApprentissage(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    // IMPORTANT : Utiliser determinerCibleIntervention() pour garantir la cohérence
    // avec le tableau de liste des étudiants. Les patterns doivent être identiques
    // partout car ils sont basés sur la même logique (N derniers artefacts).

    // Préparer les données pour SOM et PAN
    // Note : determinerCibleIntervention() retourne le pattern basé sur les N derniers artefacts
    // ce qui garantit la cohérence méthodologique nécessaire pour détecter les patterns
    const etudiantsSOM = [];
    const etudiantsPAN = [];

    etudiants.forEach(e => {
        if (typeof determinerCibleIntervention === 'function') {
            const cibleInfo = determinerCibleIntervention(e.da);
            const pattern = cibleInfo ? cibleInfo.pattern : null;

            // Normaliser le pattern
            const patternNormalise = pattern ? pattern.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') : null;

            if (patternNormalise) {
                const etudiantData = {
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    pattern: patternNormalise
                };

                // Ajouter à SOM et PAN (même pattern pour les deux car basé sur les mêmes données)
                etudiantsSOM.push(etudiantData);
                etudiantsPAN.push({...etudiantData});
            }
        }
    });

    // Trouver la carte "Indicateurs globaux du groupe"
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteIndicateurs = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.toLowerCase().includes("indicateurs globaux")) {
            carteIndicateurs = carte;
        }
    });

    if (!carteIndicateurs) {
        console.warn('⚠️ [Patterns] Carte Indicateurs globaux non trouvée dans le DOM');
        return;
    }

    // Vérifier si la barre Patterns existe déjà pour éviter les doublons
    const barreExistante = carteIndicateurs.querySelector('.barre-patterns-container');
    if (barreExistante) {
        barreExistante.remove();
    }

    // Générer la barre de distribution et l'ajouter à la fin de la carte
    const html = `
        <div class="barre-patterns-container tb-padding-top-espacé">
            ${genererBarrePatterns(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan)}
        </div>
    `;

    carteIndicateurs.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte RàI avec valeurs SOM et PAN colorées
 */
function genererCarteRaI(label, description, valeurSomPct, valeurPanPct, valeurSomCount, valeurPanCount, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-grande-orange">${valeurSomPct}%</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-pan">${valeurPanPct}%</strong>`);
    }

    // Générer le texte du nombre d'étudiants
    let texteEtudiants = '';
    if (afficherSom && afficherPan) {
        texteEtudiants = `${valeurSomCount} / ${valeurPanCount} étudiants – ${description}`;
    } else if (afficherSom) {
        texteEtudiants = `${valeurSomCount} étudiants – ${description}`;
    } else if (afficherPan) {
        texteEtudiants = `${valeurPanCount} étudiants – ${description}`;
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div class="u-flex-between">
                <span class="tb-texte-moyen-gris">${label}</span>
                <div class="tb-flex-gap15-baseline">
                    ${valeurs.join('')}
                </div>
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 4px;">${texteEtudiants}</div>
        </div>
    `;
}

/**
 * Affiche les niveaux RàI (Réponse à l'intervention)
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 *
 * NOUVEAU Beta 90 : Utilise l'interface de pratiques au lieu du calcul hardcodé
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherNiveauxRaI(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    const pratiqueSOM = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('sommative') : null;
    const pratiquePAN = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('pan-maitrise') : null;

    // 🆕 NOUVEAU Beta 90+ : Utiliser determinerNiveauRaiPedagogique() pour cohérence
    // Cette fonction calcule le niveau RàI basé UNIQUEMENT sur P + SRPNF (sans A-C)
    // Garantit la cohérence avec la section Accompagnement (Single Source of Truth)

    const etudiantsSOM = [];
    const etudiantsPAN = [];

    // Utiliser la même fonction pour SOM et PAN (niveau RàI pédagogique identique)
    if (typeof determinerNiveauRaiPedagogique === 'function') {
        etudiants.forEach(e => {
            const niveauInfo = determinerNiveauRaiPedagogique(e.da);
            const niveau = niveauInfo ? niveauInfo.niveau : null;

            if (niveau) {
                const etudiantData = {
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    niveau: niveau
                };

                // Ajouter aux deux listes (même niveau pour SOM et PAN car basé sur les mêmes critères pédagogiques)
                etudiantsSOM.push({...etudiantData});
                etudiantsPAN.push({...etudiantData});
            }
        });
    } else {
        console.warn('⚠️ [RàI] Fonction determinerNiveauRaiPedagogique non disponible');
    }

    // Trouver la carte "Indicateurs globaux du groupe"
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteIndicateurs = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.toLowerCase().includes("indicateurs globaux")) {
            carteIndicateurs = carte;
        }
    });

    if (!carteIndicateurs) {
        console.warn('⚠️ [RàI] Carte Indicateurs globaux non trouvée dans le DOM');
        return;
    }

    // Vérifier si la barre RàI existe déjà pour éviter les doublons
    const barreExistante = carteIndicateurs.querySelector('.barre-rai-container');
    if (barreExistante) {
        barreExistante.remove();
    }

    // Générer la barre de distribution et l'ajouter à la fin de la carte
    const html = `
        <div class="barre-rai-container tb-padding-top">
            ${genererBarreRaI(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan)}
        </div>
    `;

    carteIndicateurs.insertAdjacentHTML('beforeend', html);
}

/**
 * ANCIENNE FONCTION (Beta 89 et antérieur) - OBSOLÈTE depuis Beta 90
 *
 * Cette fonction calculait les patterns directement selon les indices A-C-P.
 * Elle est désormais remplacée par l'appel à pratique.identifierPattern(da)
 * qui délègue la détection de pattern à la pratique active.
 *
 * Conservée en commentaire pour référence et compréhension de l'ancienne logique.
 *
 * @deprecated Utiliser pratique.identifierPattern(da) à la place
 */
/*
function determinerPattern(indices) {
    const {assiduite, completion, performance, niveauRisque} = indices;

    // Stable: tous les indices > 0.75, risque faible/minimal
    if (assiduite >= 0.75 && completion >= 0.75 && performance >= 0.75) {
        return 'stable';
    }

    // Critique: niveau de risque critique
    if (niveauRisque === 'critique') {
        return 'critique';
    }

    // Émergent: assiduité OK mais complétion ou performance en baisse
    if (assiduite >= 0.75 && (completion < 0.65 || performance < 0.65)) {
        return 'émergent';
    }

    // Défi: au moins un indice sous 0.75 mais pas de blocage critique
    return 'défi';
}
*/

/**
 * Affiche les actions recommandées (Top 5)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherActionsRecommandees(etudiants) {
    const container = document.getElementById('tb-liste-actions');
    const messageVide = document.getElementById('tb-aucune-action');

    if (!container) return;

    const config = db.getSync('modalitesEvaluation', {});
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif === true;

    // Filtrer étudiants à engagement faible et trier par priorité (engagement croissant)
    const etudiantsAEngagementFaible = etudiants
        .filter(e => {
            const engagement = afficherSommatif ? e.sommatif.engagement : e.alternatif.engagement;
            return engagement < 0.50; // Seuil: modéré ou moins
        })
        .sort((a, b) => {
            const engagementA = afficherSommatif ? a.sommatif.engagement : a.alternatif.engagement;
            const engagementB = afficherSommatif ? b.sommatif.engagement : b.alternatif.engagement;
            return engagementA - engagementB; // Tri croissant (engagement le plus faible en premier)
        })
        .slice(0, 5); // Top 5

    if (etudiantsAEngagementFaible.length === 0) {
        container.style.display = 'none';
        if (messageVide) messageVide.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    if (messageVide) messageVide.style.display = 'none';

    container.innerHTML = etudiantsAEngagementFaible.map((e, index) => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const recommendation = genererRecommandation(indices);

        return `
            <div style="padding: 15px; background: white; border-radius: 8px;
                        border-left: 4px solid ${getCouleurEngagement(indices.niveauEngagement)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span style="display: inline-block; width: 24px; height: 24px;
                                     background: ${getCouleurEngagement(indices.niveauEngagement)};
                                     color: white; border-radius: 50%; text-align: center;
                                     line-height: 24px; font-weight: bold; margin-right: 10px;">
                            ${index + 1}
                        </span>
                        <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                        <span style="color: #666; margin-left: 8px;">(${echapperHtml(e.groupe || '—')})</span>
                    </div>
                    <span class="badge-engagement engagement-${indices.niveauEngagement.replace(' ', '-')}"
                          class="tb-texte-capitalize">
                        ${indices.niveauEngagement}
                    </span>
                </div>
                <div class="tb-texte-gris-mb10">
                    ${recommendation}
                </div>
                <div style="display: flex; gap: 8px; font-size: 0.85rem;">
                    <span>A: ${formatPourcentage(indices.assiduite)}</span> |
                    <span>C: ${formatPourcentage(indices.completion)}</span> |
                    <span>P: ${formatPourcentage(indices.performance)}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Génère une recommandation d'action selon les indices
 *
 * @param {Object} indices - Indices A-C-P
 * @returns {string} Recommandation pédagogique
 */
function genererRecommandation(indices) {
    const {assiduite, completion, performance} = indices;

    // Identifier le défi principal
    if (assiduite < 0.65) {
        return "<strong>Priorité: Assiduité</strong> - Contacter l'étudiant pour comprendre les absences et proposer un soutien";
    }
    if (completion < 0.65) {
        return "📝 <strong>Priorité: Complétion</strong> - Rencontre pour identifier les obstacles et établir un échéancier réaliste";
    }
    if (performance < 0.65) {
        return "🎯 <strong>Priorité: Performance</strong> - Offrir du soutien pédagogique et des stratégies d'apprentissage";
    }
    if (assiduite < 0.75) {
        return "⚠️ <strong>Suivi: Assiduité</strong> - Surveiller l'évolution et encourager la régularité";
    }
    if (completion < 0.75) {
        return "⚠️ <strong>Suivi: Complétion</strong> - Rappeler les échéances et vérifier la charge de travail";
    }
    if (performance < 0.75) {
        return "⚠️ <strong>Suivi: Performance</strong> - Proposer des ressources complémentaires";
    }

    return "✓ Situation sous contrôle - Maintenir le suivi régulier";
}

/**
 * Retourne la couleur CSS selon le niveau d'engagement
 *
 * @param {string} niveau - Niveau d'engagement
 * @returns {string} Couleur CSS
 */
function getCouleurEngagement(niveau) {
    const couleurs = {
        'très favorable': '#2196F3',  // Bleu - Très bon
        'favorable': '#388e3c',        // Vert - Bon
        'modéré': '#fbc02d',           // Jaune - Attention
        'fragile': '#f57c00',          // Orange - Préoccupant
        'insuffisant': '#d32f2f'       // Rouge - Critique
    };
    return couleurs[niveau] || '#999';
}

/**
 * Affiche la distribution des niveaux de risque
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherDistributionRisques(etudiants) {
    const container = document.getElementById('tb-distribution-risques');
    if (!container) return;
    
    // Compter par niveau de risque
    const distribution = {
        'minimal': 0,
        'faible': 0,
        'modéré': 0,
        'élevé': 0,
        'très élevé': 0,
        'critique': 0
    };
    
    etudiants.forEach(e => {
        distribution[e.niveauRisque]++;
    });
    
    // Couleurs selon le niveau
    const couleurs = {
        'minimal': 'var(--risque-nul)',
        'faible': 'var(--risque-minimal)',
        'modéré': 'var(--risque-modere)',
        'élevé': 'var(--risque-eleve)',
        'très élevé': '#c0392b',
        'critique': '#7f0000'
    };
    
    // Générer le HTML
    container.innerHTML = Object.entries(distribution).map(([niveau, nombre]) => `
        <div style="padding: 15px; background: white; border-left: 4px solid ${couleurs[niveau]}; 
                    border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 1.5rem; font-weight: bold; color: ${couleurs[niveau]};">
                ${nombre}
            </div>
            <div style="font-size: 0.85rem; color: #666; text-transform: capitalize;">
                ${niveau}
            </div>
        </div>
    `).join('');
}

/**
 * Affiche les alertes prioritaires (étudiants à risque)
 * 
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritaires(etudiants) {
    const container = document.getElementById('tb-alertes-prioritaires');
    if (!container) return;
    
    // Filtrer les étudiants avec risque ≥ élevé (seuil 0.4)
    const etudiantsARisque = etudiants
        .filter(e => e.risque >= 0.4)
        .sort((a, b) => b.risque - a.risque);  // Tri décroissant
    
    if (etudiantsARisque.length === 0) {
        container.innerHTML = `
            <p class="tb-zone-succes">
                ✅ Aucune intervention urgente requise
            </p>
        `;
        return;
    }
    
    // Générer le tableau
    container.innerHTML = `
        <table class="tableau u-mt-15">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Groupe</th>
                    <th>Assiduité</th>
                    <th>Complétion</th>
                    <th>Performance</th>
                    <th>Niveau de risque</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${etudiantsARisque.map(e => `
                    <tr>
                        <td><strong>${echapperHtml(e.nom)}</strong></td>
                        <td>${echapperHtml(e.prenom)}</td>
                        <td>${echapperHtml(e.groupe || '—')}</td>
                        <td>${formatPourcentage(e.assiduite)}</td>
                        <td>${formatPourcentage(e.completion)}</td>
                        <td>${formatPourcentage(e.performance)}</td>
                        <td>
                            <span class="badge-risque risque-${e.niveauRisque.replace(' ', '-')}" 
                                  class="tb-texte-capitalize">
                                ${e.niveauRisque}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-principal" 
                                    onclick="afficherSousSection('tableau-bord-profil'); chargerProfilEtudiant('${e.da}')"
                                    class="tb-padding-compact">
                                Voir profil
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

/**
 * Met à jour le texte d'un élément HTML
 * 
 * @param {string} id - ID de l'élément
 * @param {string|number} valeur - Valeur à afficher
 */
function setStatText(id, valeur) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = valeur;
    } else {
        console.warn(`⚠️ Élément ${id} non trouvé`);
    }
}

/**
 * Formate un nombre en pourcentage
 *
 * @param {number} valeur - Valeur entre 0 et 1
 * @returns {string} Pourcentage formaté (ex: "87%")
 */
function formatPourcentage(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) {
        return '—';
    }
    return Math.round(valeur * 100) + '%';
}

/**
 * Met à jour la largeur d'une barre de progression
 *
 * @param {string} id - ID de l'élément barre
 * @param {number} pourcentage - Pourcentage de largeur (0-100)
 */
function setBarre(id, pourcentage) {
    const element = document.getElementById(id);
    if (element) {
        element.style.width = Math.round(pourcentage) + '%';
    }
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js : echapperHtml()
 * - 09-2-saisie-presences.js : calculerNombreSeances() (optionnel)
 * - styles.css : classes badge-risque, carte-metrique, tableau
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - Aucun (module autonome)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module doit être chargé après config.js et navigation.js
 * 
 * LOCALSTORAGE UTILISÉ (lecture seule):
 * - 'groupeEtudiants' : Array des étudiants
 * - 'presences' : Array des présences
 * - 'evaluationsSauvegardees' : Array des évaluations
 * - 'productions' : Array des productions
 * 
 * HTML REQUIS:
 * Éléments avec IDs dans la sous-section tableau-bord-apercu:
 * - tb-total-etudiants
 * - tb-assiduite-moyenne
 * - tb-completion-moyenne
 * - tb-performance-moyenne
 * - tb-interventions-requises
 * - tb-distribution-risques
 * - tb-alertes-prioritaires
 * 
 * FORMULES UTILISÉES (Guide de monitorage):
 * - Assiduité (A) : SOMME(heures présent) / TOTAL(heures cours)
 * - Complétion (C) : NOMBRE(remis) / NOMBRE(attendus)
 * - Performance (P) : MOYENNE(3 derniers IDME) / 4
 * - Engagement : E = (A × C × P)^(1/3) (racine cubique)
 *
 * SEUILS D'ENGAGEMENT:
 * - Très favorable: ≥ 0.80
 * - Favorable: 0.65 - 0.79
 * - Modéré: 0.50 - 0.64
 * - Fragile: 0.30 - 0.49
 * - Insuffisant: < 0.30
 */