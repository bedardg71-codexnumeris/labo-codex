/**
 * ============================================
 * MODULE 17 : GESTION DES MODES
 * ============================================
 * Gestion des modes Normal / Anonymisation
 */

(function() {
'use strict';

// ============================================
// CONSTANTES
// ============================================

const MODES = {
    NORMAL: 'normal',
    ANONYMISATION: 'anonymisation'
};

// ============================================
// ÉTAT GLOBAL
// ============================================

let modeActuel = db.getSync('modeApplication', MODES.NORMAL);

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le système de modes
 */
function initialiserSystemeModes() {

    // Récupérer le mode sauvegardé
    modeActuel = db.getSync('modeApplication', MODES.NORMAL);

    // Migration legacy : si 'simulation' en stockage (ancien mode supprimé), migrer vers 'normal'
    if (modeActuel === 'simulation') {
        modeActuel = MODES.NORMAL;
        db.setSync('modeApplication', MODES.NORMAL);
    }

    // Appliquer le thème
    appliquerTheme(modeActuel);

    // Synchroniser le bouton anonymisation de la nav
    _syncBtnAnonymisationNav();

    // Gérer l'affichage des boutons selon le mode
    gererAffichageBoutonPrimo(modeActuel);

    // Appliquer la classe tour-guide-actif si la visite guidée est active
    if (estTourGuideActif()) {
        document.body.classList.add('tour-guide-actif');
    }

    // Appliquer la classe aide-contextuelle-active si la préférence est active
    if (estAideContextuelleActive()) {
        document.body.classList.add('aide-contextuelle-active');
    }

    // Appliquer le thème selon la préférence (défaut = clair).
    // Le <body> porte .mode-clair en statique dans index.html (anti-flash) ;
    // on la retire ici seulement si l'utilisateur a explicitement choisi le
    // mode sombre. Logique symétrique pour rester cohérent dans les deux sens.
    var clair = estModeClair();
    document.body.classList.toggle('mode-clair', clair);
    var btnTheme = document.getElementById('btn-toggle-theme');
    if (btnTheme) btnTheme.textContent = clair ? 'Mode sombre' : 'Mode clair';
    // Synchroniser les radio buttons
    var radioClair = document.getElementById('radio-mode-clair');
    var radioSombre = document.getElementById('radio-mode-sombre');
    if (radioClair) radioClair.checked = clair;
    if (radioSombre) radioSombre.checked = !clair;
    // Synchroniser le bouton thème de la nav
    _syncBtnThemeNav();

}

// ============================================
// BOUTON ANONYMISATION DE L'EN-TÊTE
// ============================================

/**
 * Bascule entre le mode normal et le mode anonymisation
 */
function basculerModeAnonymisation() {
    const nouveauMode = modeActuel === MODES.ANONYMISATION
        ? MODES.NORMAL
        : MODES.ANONYMISATION;
    changerMode(nouveauMode);
}

/**
 * Synchronise le bouton anonymisation de l'en-tête (titre + classe .actif)
 */
function _syncBtnAnonymisationNav() {
    const btn = document.getElementById('btn-toggle-anonymisation-nav');
    if (!btn) return;
    const estAnonyme = modeActuel === MODES.ANONYMISATION;
    btn.classList.toggle('actif', estAnonyme);
    btn.title = estAnonyme ? 'Repasser en mode normal' : 'Passer en mode anonymisé';
    btn.setAttribute('aria-pressed', estAnonyme ? 'true' : 'false');
}

// ============================================
// GESTION DES MODES
// ============================================

/**
 * Change le mode actif
 * @param {string} nouveauMode - Le nouveau mode à activer
 */
async function changerMode(nouveauMode) {
    if (nouveauMode === modeActuel) return;


    // Sauvegarder le nouveau mode
    modeActuel = nouveauMode;
    db.setSync('modeApplication', nouveauMode);
    // Lot A, R1 : les empreintes de la garde, avant qu'aucun écran anonymisé n'existe.
    if (nouveauMode === MODES.ANONYMISATION) poserEmpreintesAnonymisation();

    // Appliquer le thème
    appliquerTheme(nouveauMode);

    // Mettre à jour le bouton anonymisation de l'en-tête
    _syncBtnAnonymisationNav();

    // Afficher/masquer le bouton Assistance Primo selon le mode
    gererAffichageBoutonPrimo(nouveauMode);

    // Recharger les données affichées selon le nouveau mode
    // SANS recharger toute la page
    rafraichirContenuSelonMode();

}

/**
 * Rafraîchit le contenu affiché selon le mode actif
 * SANS recharger toute la page
 */
function rafraichirContenuSelonMode() {

    // Sauvegarder la sous-section active
    const sousSectionSauvegardee = sousSectionActive;

    // Déclencher l'événement AVANT le rafraîchissement
    window.dispatchEvent(new CustomEvent('modeChanged', {
        detail: { mode: modeActuel }
    }));

    // Forcer le rafraîchissement des modules actifs
    // selon la sous-section affichée
    if (sousSectionSauvegardee) {
        // Identifier quel module doit se rafraîchir
        const mappingModules = {
            // NOTE: reglages-groupe supprimé (Beta 95), consolidé dans contexte-trimestre
            'calendrier-trimestre': 'initialiserTrimestreV2',  // 🆕 FIX (20 jan 2026): Rafraîchir section Trimestre
            'etudiants-liste': 'afficherListeEtudiantsConsultation',
            'etudiants-profil': 'afficherProfilEtudiant',
            // #575 (28 août 2026) — entrée retirée avec la vue « accordéon ».
            // Elle n'a jamais pu s'appliquer : `sousSectionActive` porte l'id du
            // DOM, qui est `evaluations-liste`, pas `evaluations-liste-evaluations`.
            'suivi-saisie': 'afficherTableauPresences',
            // 'suivi-groupe' (anciennement section plate 'apercu') :
            // chargerTableauBordApercu() est appelé par le dispatcher dans navigation.js.
            'suivi-profil': 'afficherProfilComplet'  // AJOUT: Rafraîchir le profil lors du changement de mode
        };

        const fonctionAAppeler = mappingModules[sousSectionSauvegardee];

        if (fonctionAAppeler && typeof window[fonctionAAppeler] === 'function') {

            // SPÉCIAL : Pour afficherProfilComplet
            if (fonctionAAppeler === 'afficherProfilComplet' && window.profilActuelDA) {
                // Récupérer les étudiants AVANT le changement de mode pour connaître la position
                const etudiantsAvant = window.etudiantsListeCache || [];
                const indexAvant = etudiantsAvant.findIndex(e => e.da === window.profilActuelDA);

                // 🔧 FIX (23 jan 2026): Utiliser obtenirEtudiantsCoursActif() pour cohérence
                // avec afficherProfilComplet() qui utilise aussi ce filtre par coursId
                const etudiantsTries = typeof obtenirEtudiantsCoursActif === 'function'
                    ? obtenirEtudiantsCoursActif()
                    : (typeof filtrerEtudiantsParMode === 'function'
                        ? filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants'))
                        : obtenirDonneesSelonMode('groupeEtudiants').filter(e => e.groupe !== '9999'));

                const etudiantExiste = etudiantsTries.find(e => e.da === window.profilActuelDA);

                if (etudiantExiste) {
                    // L'étudiant existe dans le nouveau mode, afficher son profil
                    window[fonctionAAppeler](window.profilActuelDA);
                } else {
                    // L'étudiant n'existe pas : afficher l'étudiant à la même position dans la nouvelle liste
                    let daAAfficher;

                    if (indexAvant >= 0 && indexAvant < etudiantsTries.length) {
                        // Afficher l'étudiant à la même position
                        daAAfficher = etudiantsTries[indexAvant].da;
                    } else {
                        // Position invalide : afficher le premier étudiant
                        daAAfficher = etudiantsTries[0]?.da;
                    }

                    if (daAAfficher) {
                        window[fonctionAAppeler](daAAfficher);
                    } else {
                        // Aucun étudiant disponible, retourner au suivi de groupe.
                        if (typeof naviguerVers === 'function') {
                            naviguerVers('suivi', 'groupe');
                        }
                    }
                }
            } else {
                window[fonctionAAppeler]();
            }
        } else {
            // Fallback : réafficher la sous-section
            if (typeof afficherSousSection === 'function') {
                afficherSousSection(sousSectionSauvegardee);
            }
        }
    }

}

/**
 * Applique le thème visuel selon le mode
 * @param {string} mode - Le mode actif
 */
function appliquerTheme(mode) {
    // Ajouter l'attribut data-mode sur le body
    document.body.setAttribute('data-mode', mode);

    // Retirer toutes les classes de mode
    document.body.classList.remove('mode-normal', 'mode-anonymise');

    // Ajouter la classe appropriée
    if (mode === MODES.ANONYMISATION) {
        document.body.classList.add('mode-anonymise');
    } else {
        document.body.classList.add('mode-normal');
    }

    // Toggler le bandeau anonymisation (HTML statique dans index.html)
    const bandeau = document.getElementById('bandeau-mode');
    if (bandeau) {
        bandeau.classList.toggle('u-hide', mode !== MODES.ANONYMISATION);
        // Synchroniser le checkbox « Afficher DA réels » avec la préférence courante
        if (mode === MODES.ANONYMISATION) {
            const checkbox = document.getElementById('checkbox-da-anonyme');
            if (checkbox) checkbox.checked = obtenirOptionAffichageDA();
        }
    }
}

// ============================================
// ANONYMISATION
// ============================================

/**
 * Choisit une catégorie culturelle selon les proportions définies
 * 85% québécois, 5% africain, 5% latino, 5% arabe
 * @returns {string} - Nom de la catégorie
 */
function choisirCategorieCulturelle() {
    const random = Math.random() * 100;

    if (random < 85) return 'quebecois';
    if (random < 90) return 'africains';
    if (random < 95) return 'latino';
    return 'arabes';
}

/**
 * Génère un mapping d'anonymisation pour les étudiants
 * @returns {Object} - Mapping DA réel → pseudonyme
 */
function genererMappingAnonyme() {
    // #767 (6 sept. 2026) — `doitRegenerer` était affecté (:310, :338) sans jamais être déclaré : sous le
    // 'use strict' du module, chaque lecture de groupeEtudiants en mode anonymisation levait
    // ReferenceError sur un trimestre sans mapping (démo, A2026). Déclaré ici, dans la portée où il est
    // affecté. Il n'est lu nulle part : les deux affectations documentent la branche, sans effet.
    let doitRegenerer = false;
    // Utiliser un mapping namespacé par trimestre pour éviter le mélange entre sessions
    const trId = typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : '';
    const cleMapping = trId ? `${trId}_mapping_anonymisation` : 'mapping_anonymisation';
    let mapping = db.getSync(cleMapping, {});

    // Migration : si ancien mapping global existe et pas de mapping namespacé, migrer
    if (Object.keys(mapping).length === 0 && trId) {
        const ancienMapping = db.getSync('mapping_anonymisation', {});
        if (Object.keys(ancienMapping).length > 0) {
            mapping = ancienMapping;
        }
    }

    // Lire les étudiants actuels DIRECTEMENT (éviter récursion avec obtenirDonneesSelonMode)
    const cleEtudiants = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtudiants, []);
    const etudiantsReels = etudiants.filter(e => e.groupe !== '9999');

    // Vérifier si le mapping existe ET utilise le nouveau format
    if (Object.keys(mapping).length > 0) {
        // Détecter l'ancien format (noms fictifs au lieu de "Élève X")
        const premierDA = Object.keys(mapping)[0];
        const premierMapping = mapping[premierDA];

        const estAncienFormat = premierMapping.nom ||
                               !premierMapping.prenom?.startsWith('Élève') ||
                               !premierMapping.hasOwnProperty('numero') ||
                               !premierMapping.hasOwnProperty('ordreAffichage');

        if (estAncienFormat) {
            doitRegenerer = true;
            mapping = {};
        } else {
            // Vérifier que TOUS les étudiants actuels sont couverts
            const manquants = etudiantsReels.filter(e => !mapping[e.da]);
            if (manquants.length > 0) {
                // Étendre le mapping existant avec les étudiants manquants
                const numerosExistants = Object.values(mapping).map(m => m.numero);
                let prochainNumero = numerosExistants.length > 0 ? Math.max(...numerosExistants) + 1 : 1;
                let prochainOrdre = Object.values(mapping).reduce((max, m) => Math.max(max, m.ordreAffichage || 0), 0) + 1;

                manquants.forEach(etudiant => {
                    mapping[etudiant.da] = {
                        nom: '',
                        prenom: `Élève ${prochainNumero}`,
                        nomComplet: `Élève ${prochainNumero}`,
                        numero: prochainNumero,
                        ordreAffichage: prochainOrdre
                    };
                    prochainNumero++;
                    prochainOrdre++;
                });

                db.setSync(cleMapping, mapping);
            }
            return mapping;
        }
    } else {
        doitRegenerer = true;
    }

    // Créer un nouveau mapping avec format "Élève X"
    // Créer un tableau de numéros et le mélanger (Fisher-Yates shuffle)
    const numeros = Array.from({ length: etudiantsReels.length }, (_, i) => i + 1);
    for (let i = numeros.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }

    // Créer aussi un ordre d'affichage aléatoire pour éviter de reconnaître par la position
    const ordresAffichage = Array.from({ length: etudiantsReels.length }, (_, i) => i);
    for (let i = ordresAffichage.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordresAffichage[i], ordresAffichage[j]] = [ordresAffichage[j], ordresAffichage[i]];
    }

    etudiantsReels.forEach((etudiant, index) => {
        const numero = numeros[index];

        mapping[etudiant.da] = {
            nom: '',
            prenom: `Élève ${numero}`,
            nomComplet: `Élève ${numero}`,
            numero: numero,
            ordreAffichage: ordresAffichage[index]
        };
    });

    db.setSync(cleMapping, mapping);
    return mapping;
}

/**
 * Anonymise un nom d'étudiant
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {string} - Nom anonymisé
 */
function anonymiserNom(da) {
    if (modeActuel !== MODES.ANONYMISATION) {
        return null; // Pas en mode anonymisation
    }

    const mapping = genererMappingAnonyme();
    return mapping[da]?.nomComplet || 'Étudiant Inconnu';
}

/**
 * #948 — Remplace un prénom entier dans un texte. L'ancienne forme
 * `\b${prenom}\b` ratait les prénoms qui commencent ou finissent par une
 * lettre accentuée (« Éloïse », « René ») : en JavaScript, `\b` ne tient pour
 * lettres que A-Z, a-z, 0-9 et _. La frontière est ici posée sur les lettres
 * Unicode, et le prénom est échappé (un « . » ou une « ( » n'est plus un motif).
 */
function _remplacerPrenomEntier(texte, prenom, remplacement, prefixe = '', drapeaux = 'gu') {
    const echappe = String(prenom).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const motif = new RegExp(`(^|[^\\p{L}\\p{N}_])(${prefixe}${echappe})(?![\\p{L}\\p{N}_])`, drapeaux);
    return texte.replace(motif, (_m, avant) => avant + prefixe + remplacement);
}

/**
 * Anonymise le texte d'une rétroaction en remplaçant les prénoms réels par les prénoms anonymisés
 * ✅ NOUVEAU (30 déc 2025) - Corrige le bug d'affichage des vrais prénoms en mode Anonymisé
 *
 * @param {string} texte - Le texte de la rétroaction
 * @param {string} daEtudiant - Le DA de l'étudiant concerné (pour obtenir le prénom anonymisé)
 * @returns {string} - Le texte anonymisé (ou original si pas en mode anonymisation)
 */
function anonymiserTexteRetroaction(texte, daEtudiant) {
    // Si pas en mode anonymisation, retourner le texte tel quel
    if (modeActuel !== MODES.ANONYMISATION) {
        return texte;
    }

    if (!texte) return texte;

    // Lire les étudiants DIRECTEMENT (pas via obtenirDonneesSelonMode pour éviter récursion)
    // ✅ NAMESPACING (Beta 95.5) : Utiliser cle() pour le namespacing par trimestre
    const cleEtudiants = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtudiants, []);
    const mapping = genererMappingAnonyme();

    let texteAnonyme = texte;

    // Remplacer tous les prénoms réels par "Élève X"
    // #948 — les plus longs d'abord : « Marie-Ève » avant « Marie », sinon le
    // second mangeait le début du premier et laissait « Élève 5-Ève ».
    etudiants.slice().sort((a, b) => String(b.prenom || '').length - String(a.prenom || '').length).forEach(etudiant => {
        if (etudiant.prenom && mapping[etudiant.da]) {
            const prenomReel = etudiant.prenom;
            const prenomAnonyme = mapping[etudiant.da].prenom || 'Élève';

            // Remplacer "Bonjour Prénom" par "Bonjour Élève X"
            texteAnonyme = _remplacerPrenomEntier(texteAnonyme, prenomReel, prenomAnonyme, 'Bonjour ', 'giu');

            // Remplacer le prénom seul suivi d'espace ou ponctuation (pour éviter les faux positifs)
            // Par exemple "Marie, tu as bien travaillé" → "Élève 5, tu as bien travaillé"
            texteAnonyme = _remplacerPrenomEntier(texteAnonyme, prenomReel, prenomAnonyme);
        }
    });

    // Si un DA spécifique est fourni et qu'on veut s'assurer que ce prénom est anonymisé
    if (daEtudiant && mapping[daEtudiant]) {
        const etudiant = etudiants.find(e => e.da === daEtudiant);
        if (etudiant && etudiant.prenom) {
            texteAnonyme = _remplacerPrenomEntier(texteAnonyme, etudiant.prenom, mapping[daEtudiant].prenom || 'Élève');
        }
    }

    return texteAnonyme;
}

// Exposer la fonction globalement
window.anonymiserTexteRetroaction = anonymiserTexteRetroaction;

/**
 * Anonymise un nom de fichier en mode anonymisation
 * ✅ NOUVEAU (Tier 0.2 — avril 2026)
 * Les noms de fichiers importés (ex: Tremblay_Sophie_TP2.pdf) peuvent contenir
 * des noms réels d'étudiants. En mode anonymisation, on les remplace par un nom
 * générique basé sur le nom anonymisé de l'étudiant associé.
 *
 * @param {string} nomFichier - Le nom du fichier original
 * @param {string} etudiantDA - Le DA de l'étudiant associé au fichier
 * @returns {string} - Le nom anonymisé (ou original si pas en mode anonymisation)
 */
function anonymiserNomFichier(nomFichier, etudiantDA) {
    if (modeActuel !== MODES.ANONYMISATION) {
        return nomFichier;
    }

    if (!nomFichier) return nomFichier;

    // Extraire l'extension du fichier original
    const match = nomFichier.match(/\.[^.]+$/);
    const extension = match ? match[0] : '';

    // Si on a un DA associé, utiliser le nom anonymisé
    if (etudiantDA) {
        const mapping = genererMappingAnonyme();
        const info = mapping[etudiantDA];
        if (info) {
            return `${info.prenom}_${info.nom}_document${extension}`;
        }
    }

    // Fallback : nom générique si pas de DA ou pas dans le mapping
    return `Document${extension}`;
}

window.anonymiserNomFichier = anonymiserNomFichier;

// ============================================
// UTILITAIRES
// ============================================

/**
 * Récupère les données selon le mode actif
 * FONCTION CENTRALE - Utilisée par tous les modules
 * 
 * @param {string} cle - Clé du localStorage (ex: 'groupeEtudiants', 'evaluationsSauvegardees')
 * @returns {Array|Object} - Données selon le mode actif
 */
/**
 * Résout le contexte de cours actif de façon FIABLE (#130).
 *
 * `infoCours` est un cache qui peut se désynchroniser : un write de cours
 * "legacy" (sélection/activation/sauvegarde de cours) réécrit `infoCours` à
 * partir d'un objet cours qui traîne un ancien champ `groupe`, écrasant le
 * groupe dérivé du groupe-cours actif. Résultat : le Suivi se vide alors que
 * le groupe-cours est bien assemblé et actif.
 *
 * La SSOT du groupe actif est l'entrée `actif===true` de `cle('groupesCours')`.
 * Si un groupe-cours actif vise LE MÊME cours que `infoCours`, on corrige
 * uniquement le `groupe` (et le mode), sans changer le cours ni perturber le
 * mode démo (dont le `infoCours.id` ne correspond à aucun groupe-cours réel).
 * Non destructif : retourne une copie, n'écrit rien.
 */
/**
 * Cadrage « Rencontres » (12 sept. 2026) — LA fiche de cours du contexte actif, ou null.
 * Résolution : le groupe-cours actif (pointeur `groupeCoursActif.coursId`) d'abord, puis
 * `infoCours.id` (qui est le coursId dans le chemin de l'orchestre, mais l'id du
 * groupe-cours dans celui de l'entité — d'où l'ordre). Lecture seule.
 */
function coursDuContexteActif() {
    const cours = db.getSync('cours', []) || [];
    if (!Array.isArray(cours) || cours.length === 0) return null;
    const gcActif = db.getSync('groupeCoursActif', null);
    if (gcActif && gcActif.coursId) {
        const parGC = cours.find(c => c && c.id === gcActif.coursId);
        if (parGC) return parGC;
    }
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.id) {
        return cours.find(c => c && c.id === infoCours.id) || null;
    }
    return null;
}

/**
 * Lot E du cadrage « Rencontres » (12 sept. 2026) — L'IDENTIFIANT DU CONTEXTE ACTIF, À UN SEUL ENDROIT.
 *
 * Mesuré le 11 sept. (Cowork, puis grep de la session) : dix-neuf sites recalculaient eux-mêmes
 * `infoCours._groupeCoursId || infoCours.id || null` pour lire ou écrire des données par
 * groupe-cours (échéances par groupe, captures, production diagnostique, corrélations…).
 * Un troisième mode de contexte se serait codé dix-neuf fois. Une fonction, vingt appels ;
 * ZÉRO changement de valeur (sentinelle-834-point-unique-contexte compare l'ancienne
 * expression et celle-ci sur la même grille d'`infoCours`).
 *
 * `_groupeCoursId` est fiable : unique par groupe-cours dans les deux chemins d'écriture
 * d'`infoCours` (orchestre et entité). `id` est le repli : selon le chemin, c'est le coursId
 * (partagé entre groupes) ou l'id du groupe-cours.
 *
 * @param {Object|null} [infoCours] - l'objet déjà lu par l'appelant ; absent = lu ici
 * @returns {string|null}
 */
function obtenirIdContexteActif(infoCours) {
    const info = (infoCours === undefined) ? db.getSync('infoCours', null) : infoCours;
    if (!info) return null;
    return info._groupeCoursId || info.id || null;
}

/** Un service EST un cours (`nature: 'service'`) : sans code, sans discipline, sans horaire obligatoire. */
function estCoursService(cours) {
    return !!cours && cours.nature === 'service';
}

/** Vrai quand le contexte actif (groupe-cours ou cours) porte un service. Point unique — ne pas recopier le test. */
function contexteActifEstService() {
    return estCoursService(coursDuContexteActif());
}

function obtenirContexteCoursActif() {
    const infoCours = db.getSync('infoCours', null);
    if (!infoCours || !infoCours.id) return infoCours;
    if (typeof window.cle !== 'function') return infoCours;
    // #851 (13 sept. 2026) : la vue « Cours (tous groupes) » de l'entête écrit `_modeCours: true`
    // (trimestre-v2-orchestre.js, seul écrivain) et laisse le dernier groupe-cours marqué actif.
    // La correction #130 ci-dessous le retrouvait (même coursId) et rabattait le contexte sur SON
    // groupe : depuis le 3 juin, « tous groupes » n'affichait que le groupe précédent.
    if (infoCours._modeCours === true) return infoCours;

    const listeGC = db.getSync(window.cle('groupesCours'), []);
    if (!Array.isArray(listeGC)) return infoCours;

    const gc = listeGC.find(function(g) { return g && g.actif && g.coursId === infoCours.id; });
    if (!gc) return infoCours;

    // Champ canonique `groupeNum` d'abord (#130/#306) ; `|| groupe` = filet
    // transitoire pour un enregistrement non encore purgé (normaliserCanonique).
    const groupeGC = gc.modeCours ? null : (gc.groupeNum || null);
    return Object.assign({}, infoCours, {
        groupe: groupeGC,
        _modeCours: !!gc.modeCours || groupeGC === null
    });
}

// ============================================================================
// CONTEXTE DE SIMULATION (#326 R2/Étape 2 — banc de décision, injection mémoire)
// ----------------------------------------------------------------------------
// Permet à simulerIndices() de faire calculer le moteur sur un CORPUS fictif en
// mémoire (profils-types générés) SANS écrire en stockage ni basculer le contexte
// (trimestre/cours). Transitoire, synchrone, posé puis effacé par simulerIndices
// en try/finally — jamais persisté. Seules les clés du corpus (évaluations,
// productions) sont interceptées ; la config des pratiques + les échelles restent
// lues du stockage réel (on ne simule que les artefacts d'élèves, pas les règles).
// Second usager (lot N2, #716, 22 sept. 2026) : le P historique des snapshots
// (snapshots.js) y pose les évaluations de l'élève échues à la date du snapshot.
// ============================================================================
let _contexteSimulation = null;
const _CLES_SIMULABLES = ['evaluationsSauvegardees', 'productions'];

function definirContexteSimulation(donnees) {
    _contexteSimulation = donnees || null;
}
function effacerContexteSimulation() {
    _contexteSimulation = null;
}
/**
 * Lot N2 (#716, 22 sept. 2026) — LA NOTE CALCULÉE SOUS CE CONTEXTE EST PROVISOIRE, QUOI QUE DISE LA PRATIQUE.
 * Le P historique d'un snapshot (snapshots.js) pose `noteProvisoire: true` avec les évaluations échues à sa
 * date. Décision de Grégoire (22 sept. 2026) : à une date passée, la note se calcule comme une note
 * provisoire — le réglage « notes finales » de la pratique (les obligatoires non remises valent 0) est
 * celui d'AUJOURD'HUI, et l'appliquer à la semaine 3 compterait 0 pour des obligatoires pas encore dues.
 * Seul lecteur : `calculerDetailsNoteFinale` (profil-etudiant-actions.js), le seul à lire `notesFinales`.
 * @returns {boolean}
 */
function contexteImposeNoteProvisoire() {
    return !!(_contexteSimulation && _contexteSimulation.noteProvisoire === true);
}
// Retourne le jeu injecté pour une clé simulable, ou null si pas de simulation en
// cours. Sert à router les lectures directes du chemin de calcul (db.getSync(cle('…')))
// SANS changer leur comportement hors simulation (repli sur l'appel direct existant).
function obtenirDonneesSimulationOuNull(cleBase) {
    if (_contexteSimulation && _CLES_SIMULABLES.includes(cleBase)
        && _contexteSimulation[cleBase] !== undefined) {
        return _contexteSimulation[cleBase];
    }
    return null;
}

// ============================================================================
// #397 — CACHE DE LECTURE DE PIPELINE (perf)
// Un « pipeline » (recalcul des indices sur N étudiants : assiduité, chaîne C/P,
// rendu prioritaires) relit les MÊMES clés une fois PAR étudiant — chaque
// obtenirDonneesSelonMode refait JSON.parse du blob entier + filtre coursId
// (mesuré : ~460 ms de gel à 75 étudiants, croissance quasi quadratique).
// L'orchestrateur encadre sa boucle de demarrerCacheLecture()/terminerCacheLecture()
// (try/finally) : le RÉSULTAT d'obtenirDonneesSelonMode est mémoïsé par clé pour
// la durée du lot. Réentrant (compteur de profondeur — la chaîne A → C/P imbrique
// deux pipelines). TOUTE écriture vide le cache (jamais de lecture périmée) —
// voir `invaliderCacheLecture` ci-dessous. Même couture que l'injection #326 R2.
// ============================================================================
let _cacheLecturePipeline = null;
let _cacheLectureProfondeur = 0;

function demarrerCacheLecture() {
    _cacheLectureProfondeur++;
    if (_cacheLectureProfondeur === 1) _cacheLecturePipeline = {};
}
function terminerCacheLecture() {
    _cacheLectureProfondeur--;
    if (_cacheLectureProfondeur <= 0) {
        _cacheLectureProfondeur = 0;
        _cacheLecturePipeline = null;
    }
}

/**
 * #447 (10 août 2026) — Vide le cache de lecture parce qu'une écriture vient
 * d'avoir lieu. Branché sur `db.surEcriture` : TOUTE écriture le déclenche,
 * quel que soit le chemin.
 *
 * ⮕ CE QUI NE MARCHAIT PAS. L'invalidation ne vivait qu'au bas de
 * `sauvegarderDonneesSelonMode`. Or plusieurs propriétaires SSOT écrivent
 * leur propre clé en `db.setSync`/`db.set` DIRECT — c'est légitime, mais ces
 * écritures ne vidaient rien. Mesuré au navigateur le 10 août : pendant un
 * seul `chargerTableauBordApercu()`, `indicesCP` est écrit à une profondeur
 * de pipeline de **2** ; le pipeline extérieur survit à l'écriture et
 * conserve sa mémoïsation d'AVANT. Aucune lecture périmée n'était servie ce
 * jour-là — mais rien n'empêchait le prochain lecteur ajouté dans cette
 * fenêtre d'en recevoir une, en silence.
 *
 * ⮕ C'est la famille du 10 août : une promesse écrite en commentaire que le
 * code ne tenait qu'à moitié. Elle est désormais tenue à l'endroit où toutes
 * les écritures passent, plutôt que par la discipline de chaque appelant.
 *
 * ⚠ L'INVALIDATION EST CIBLÉE SUR LA CLÉ ÉCRITE, et ce n'est pas un raffinement
 * gratuit : vider TOUT le cache à chaque écriture a été mesuré au navigateur le
 * 10 août à **+329 ms** sur un rendu d'aperçu à 75 étudiants — soit l'ordre de
 * grandeur du gain que #397 était venu chercher. Le rabot aurait rendu le cache
 * honnête en le rendant inutile. Seule la clé écrite est périmée ; c'est donc la
 * seule qu'on retire, et l'écart retombe dans le bruit de mesure.
 *
 * `db` passe la clé RÉELLE (`demo_indicesCP`), les lecteurs mémoïsent souvent la
 * clé de base (`indicesCP`) : les deux entrées sont retirées. Sans argument, on
 * retombe sur l'invalidation totale — l'ignorance se paie en prudence.
 *
 * @param {string} [cleEcrite] - clé réelle qui vient d'être écrite
 */
function invaliderCacheLecture(cleEcrite) {
    if (!_cacheLecturePipeline) return;
    if (!cleEcrite) { _cacheLecturePipeline = {}; return; }
    delete _cacheLecturePipeline[cleEcrite];
    const m = String(cleEcrite).match(/^(?:[aeh]\d{4}|demo)_(.+)$/);
    if (m) delete _cacheLecturePipeline[m[1]];
}

function obtenirDonneesSelonMode(cle) {
    const mode = modeActuel;

    // Injection mémoire (#326 R2) : si un corpus de simulation est posé, le moteur
    // lit DIRECTEMENT ce jeu pour les clés simulables (déjà scopé : pas de filtre
    // coursId, pas d'anonymisation). Toute autre clé suit le chemin normal ci-dessous.
    if (_contexteSimulation) {
        let cleBaseSim = cle;
        const trIdSim = typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : null;
        if (trIdSim && cle.startsWith(trIdSim + '_')) cleBaseSim = cle.substring(trIdSim.length + 1);
        if (_CLES_SIMULABLES.includes(cleBaseSim) && _contexteSimulation[cleBaseSim] !== undefined) {
            return _contexteSimulation[cleBaseSim];
        }
    }
    // #397 : pendant un pipeline (lot de calculs sur N étudiants), le résultat
    // par clé est mémoïsé — mêmes données, un seul parse + filtre coursId.
    if (_cacheLecturePipeline && Object.prototype.hasOwnProperty.call(_cacheLecturePipeline, cle)) {
        return _cacheLecturePipeline[cle];
    }

    // ===================================
    // MODE NORMAL : Données réelles
    // ===================================
    // (Primo aide l'utilisateur avec ses vraies données, pas des données simulées)

    // ✅ CORRECTION (Beta 97.11) : Extraire la clé de base (sans namespace trimestre)
    // Certains appelants passent cle('groupeEtudiants') = 'h2026_groupeEtudiants' (pré-namespacé),
    // d'autres passent 'groupeEtudiants' (clé de base). Les vérifications logiques (coursId,
    // anonymisation) doivent toujours comparer avec la clé de base.
    let cleBase = cle;
    const trimestreId = typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : null;
    if (trimestreId && cle.startsWith(trimestreId + '_')) {
        cleBase = cle.substring(trimestreId.length + 1);
    }

    // Déterminer la valeur par défaut selon le type de clé
    // IMPORTANT: 'presences' est un TABLEAU, pas un objet (utilisé avec .forEach dans profil-etudiant.js)
    const clesSontObjets = ['indicesAssiduiteDetailles', 'indicesCP', 'indicesAssiduite', 'calendrierComplet', 'snapshots'];
    const valeurParDefaut = clesSontObjets.includes(cleBase) ? {} : [];

    // Utiliser window.cle() pour le namespacing par trimestre (paramètre cle shadowed)
    const cleEffective = typeof window.cle === 'function' ? window.cle(cle) : cle;
    let donnees = db.getSync(cleEffective, valeurParDefaut);

    // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025)
    // Filtrer par coursId pour les données liées au cours actif uniquement
    // Ceci corrige le bug de contamination entre cours/trimestres
    // 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
    const clesAvecCoursId = ['groupeEtudiants', 'productions', 'presences', 'evaluationsSauvegardees'];
    if (clesAvecCoursId.includes(cleBase) && Array.isArray(donnees)) {
        const coursActif = obtenirContexteCoursActif();
        if (coursActif && coursActif.id) {
            const totalAvant = donnees.length;
            const avantFiltre = donnees;
            // 🆕 BETA 95.3 : Mode cours = tous les groupes fusionnés
            const estModeCours = coursActif._modeCours || coursActif.groupe === null;
            // Cadrage « Rencontres », lot A (12 sept. 2026) — dans un SERVICE, un élève appartient
            // par son coursId ; le numéro de groupe ne départage rien (un service n'a qu'un
            // groupe-cours), et une fiche sans coursId n'est pas la sienne (un service n'a pas
            // d'historique). Hors service, rien ne change : la garde se pose sur le service.
            const estService = (cleBase === 'groupeEtudiants') && contexteActifEstService();

            donnees = donnees.filter(item => {
                // Compatibilité : ancien format sans coursId
                if (!item.coursId) {
                    // Pour étudiants : vérifier groupe (sauf en mode cours)
                    if (cleBase === 'groupeEtudiants') {
                        if (estService) return false;
                        // En mode cours, accepter tous les étudiants (pas de filtre groupe)
                        if (estModeCours) {
                            return true;
                        }
                        // Étudiant sans groupe : l'inclure (import CSV sans association)
                        if (!item.groupe && !item.groupeReel) {
                            return true;
                        }
                        const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
                        // ✅ CORRECTION (9 jan 2026) : Normaliser les groupes avant comparaison
                        // "1" et "00001" doivent être considérés comme égaux
                        return normaliserNumeroGroupe(item.groupe) === normaliserNumeroGroupe(groupeCours);
                    }
                    // Pour autres données sans coursId : les inclure (migration progressive)
                    return true;
                }
                return item.coursId === coursActif.id;
            });
            // #154 (9 août 2026) — un filtre qui avale TOUT doit le dire.
            // Cas réel : les 11 productions H26 portaient le coursId d'AVANT
            // la migration des ids de cours (COURS1766455789356) ; ce filtre
            // rendait 0 partout — « Aucune production configurée », indice C
            // à 0 % — sans une ligne de console. Si plus rien ne passe et
            // qu'AUCUN coursId écarté n'existe dans le magasin `cours`, ce
            // ne sont pas des données d'un autre cours : c'est un modèle
            // ANTÉRIEUR (résurgence #346 — copie de navigateur jamais
            // migrée, import ancien). On le dit une fois par clé et par
            // session ; le multi-cours légitime (ids écartés présents au
            // magasin) reste silencieux.
            if (donnees.length === 0 && totalAvant > 0) {
                window._avertis154 = window._avertis154 || {};
                if (!window._avertis154[cleBase]) {
                    const idsEcartes = [...new Set(avantFiltre.map(it => it && it.coursId).filter(Boolean))];
                    const idsMagasin = new Set((db.getSync('cours', []) || []).map(c => c && c.id));
                    if (idsEcartes.length > 0 && idsEcartes.every(id => !idsMagasin.has(id))) {
                        window._avertis154[cleBase] = true;
                        console.warn('[#154] ' + cleEffective + ' : ' + totalAvant +
                            ' item(s) écartés par le filtre de cours — coursId inconnus du magasin (' +
                            idsEcartes.join(', ') + ') vs cours actif « ' + coursActif.id + ' ». ' +
                            'Désappariement probable (famille #346) : réparer avec ' +
                            'scripts/reparation-154-coursid-productions.js');
                    }
                }
            }
        }
    }

    // Si mode anonymisation, anonymiser selon le type de données
    if (mode === MODES.ANONYMISATION) {
        donnees = anonymiserDonnees(cleBase, donnees);
    }

    // #397 : mémoïsation pour la durée du pipeline (voir demarrerCacheLecture)
    if (_cacheLecturePipeline) {
        _cacheLecturePipeline[cle] = donnees;
    }

    return donnees;
}

// ─── Lot A de l'enregistrement — la garde contre les substitutions (26 sept. 2026) ───
//
// En anonymisation, `anonymiserDonnees` remplace à la LECTURE : « Élève 32 » pour le prénom,
// « Gr. A » pour le groupe, des marqueurs (`daReel`, `etudiantDAReel`…) ; et
// `anonymiserTexteRetroaction` remplace les prénoms réels d'un texte par « Élève N ». Un écran
// qui relit ces valeurs et les réécrit (la rétroaction pré-remplie, le « Bonjour Élève 32 ! »
// généré depuis la liste anonymisée, un tableau lu par `obtenirDonneesSelonMode`) les enverrait
// dans les vraies données. Cette garde les RETIRE avant l'écriture, par motif : elle ne
// dépend pas du chemin de lecture, et une valeur qu'on ne reconnaît pas passe telle quelle.
//
// Assumé : un texte réel qui contiendrait déjà « Élève 12 » (écrit à la main, ou une
// substitution écrite avant ce lot par un écran qui n'avait pas de garde) serait lu comme une
// substitution et reçu le prénom de l'élève que le mapping actuel numérote 12.
const _CLES_SUBSTITUEES = ['groupeEtudiants', 'evaluationsSauvegardees', 'presences'];
const _MOTIF_ELEVE_N = /(^|[^\p{L}\p{N}_])Élève (\d+)(?![\p{L}\p{N}_])/gu;

function _estPseudonyme(valeur) {
    return typeof valeur === 'string' && /^(Élève \d+|Anonyme|Étudiant Inconnu)$/.test(valeur.trim());
}

function _estGroupeSubstitue(valeur) {
    return typeof valeur === 'string' && /^Gr\. ([A-Z]|\?)$/.test(valeur);
}

// « Élève N » → prénom réel de l'élève que le mapping numérote N ; un N inconnu reste tel quel.
// Rend le MÊME objet quand rien n'a changé : la garde parcourt tout le tableau à chaque écriture.
function _desanonymiserChaines(valeur, prenomParNumero) {
    if (typeof valeur === 'string') {
        if (valeur.indexOf('Élève ') === -1) return valeur;
        return valeur.replace(_MOTIF_ELEVE_N, (m, avant, n) =>
            prenomParNumero.has(n) ? avant + prenomParNumero.get(n) : m);
    }
    if (!valeur || typeof valeur !== 'object') return valeur;
    let copie = null;
    const cles = Object.keys(valeur);
    for (let i = 0; i < cles.length; i++) {
        const avant = valeur[cles[i]];
        const apres = _desanonymiserChaines(avant, prenomParNumero);
        if (apres !== avant) {
            if (!copie) copie = Array.isArray(valeur) ? valeur.slice() : { ...valeur };
            copie[cles[i]] = apres;
        }
    }
    return copie || valeur;
}

// Relecture croisée R1 (26 sept. 2026) — la garde ne touche que ce qui a CHANGÉ. Un élément
// identique à son empreinte est réécrit tel quel : une évaluation voisine dont un texte contient
// déjà « Élève 12 » n'est pas modifiée par l'enregistrement automatique d'une autre copie.
// Les empreintes ne se lisent PAS dans `db.getSync` au moment d'écrire : quand les données sont
// volumineuses, il rend l'objet même du cache mémoire, que l'auto-save a déjà modifié en place.
// Elles sont prises à l'entrée en anonymisation (`changerMode`), avant tout écran anonymisé, puis
// après chaque écriture gardée. Sans empreinte pour une clé (démarrage déjà en anonymisation,
// autre trimestre), tout le tableau passe par la garde : le côté sûr.
const _empreintesAnonymisation = new Map();   // clé effective → Map(identifiant → JSON)

function _identifiantElement(cleBase, item) {
    if (cleBase === 'evaluationsSauvegardees') return item.id !== undefined ? String(item.id) : null;
    const da = String(item.daReel !== undefined ? item.daReel : item.da);
    return cleBase === 'presences' ? [da, item.date, item.coursId || ''].join('|') : da;
}

function _cleBaseSubstituee(cle) {
    const trId = typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : null;
    const cleBase = (trId && cle.startsWith(trId + '_')) ? cle.substring(trId.length + 1) : cle;
    return _CLES_SUBSTITUEES.includes(cleBase) ? cleBase : null;
}

function _poserEmpreintes(cle, donnees) {
    const cleBase = _cleBaseSubstituee(cle);
    if (!cleBase || !Array.isArray(donnees)) return;
    const empreintes = new Map();
    donnees.forEach(item => {
        if (!item || typeof item !== 'object') return;
        const id = _identifiantElement(cleBase, item);
        if (id !== null) empreintes.set(id, JSON.stringify(item));
    });
    _empreintesAnonymisation.set(window.cle(cle), empreintes);
}

function poserEmpreintesAnonymisation() {
    _empreintesAnonymisation.clear();
    _CLES_SUBSTITUEES.forEach(k => _poserEmpreintes(k, db.getSync(window.cle(k), null)));
}

function retirerSubstitutionsAnonymisation(cle, donnees) {
    if (!Array.isArray(donnees)) return donnees;
    const cleBase = _cleBaseSubstituee(cle);
    if (!cleBase) return donnees;
    const empreintes = _empreintesAnonymisation.get(window.cle(cle)) || null;
    const inchange = (item) => {
        if (!empreintes) return false;
        const id = _identifiantElement(cleBase, item);
        return id !== null && empreintes.get(id) === JSON.stringify(item);
    };

    const reels = db.getSync(window.cle('groupeEtudiants'), []) || [];
    const parDA = new Map(reels.map(e => [String(e.da), e]));
    const mapping = genererMappingAnonyme();
    const prenomParNumero = new Map();
    Object.keys(mapping).forEach(da => {
        const eleve = parDA.get(String(da));
        if (eleve && eleve.prenom && mapping[da] && mapping[da].numero !== undefined) {
            prenomParNumero.set(String(mapping[da].numero), eleve.prenom);
        }
    });
    const groupesParLettre = {};
    const mappingGroupes = db.getSync('mapping_groupes_anonymes', {}) || {};
    Object.keys(mappingGroupes).forEach(reel => { groupesParLettre[mappingGroupes[reel]] = reel; });
    const groupeReel = (valeur, eleve) => (valeur in groupesParLettre)
        ? groupesParLettre[valeur] : (eleve ? eleve.groupe : '');

    return donnees.map(item => {
        if (!item || typeof item !== 'object') return item;
        if (inchange(item)) return item;
        const r = { ..._desanonymiserChaines(item, prenomParNumero) };
        if (cleBase === 'evaluationsSauvegardees') {
            if (r.etudiantDAReel !== undefined) r.etudiantDA = r.etudiantDAReel;
            delete r.etudiantDAReel;
            delete r.etudiantDAffichage;
            const eleve = parDA.get(String(r.etudiantDA));
            // Le prénom seul a déjà été rendu par `_desanonymiserChaines` ; le nom complet, lui,
            // se reprend à la fiche (« Élève 32 » + nom vide ne dit pas le nom de famille).
            if (_estPseudonyme(item.etudiantNom)) r.etudiantNom = eleve ? `${eleve.prenom} ${eleve.nom}` : '';
            if (_estGroupeSubstitue(r.groupe)) r.groupe = groupeReel(r.groupe, eleve);
        } else {
            // groupeEtudiants, presences : les marqueurs de `anonymiserDonnees`.
            const aMarqueur = r.daReel !== undefined;
            if (aMarqueur) r.da = r.daReel;
            const eleve = parDA.get(String(r.da));
            if (cleBase === 'groupeEtudiants') {
                if (aMarqueur) {
                    r.groupe = r.groupeReel;
                    delete r.groupeReel;
                    delete r.ordreAffichage;
                } else if (_estGroupeSubstitue(r.groupe)) {
                    r.groupe = groupeReel(r.groupe, eleve);
                }
                if (_estPseudonyme(item.prenom) && eleve) { r.prenom = eleve.prenom; r.nom = eleve.nom; }
            } else if (aMarqueur) {
                // Une présence ne porte ni nom ni prénom : ceux-là viennent de l'anonymisation.
                delete r.nom;
                delete r.prenom;
            }
            delete r.daReel;
            delete r.daAffichage;
        }
        return r;
    });
}

// ─── Relecture croisée R4 (lot A, 26 sept. 2026) — deux textes libres de plus ───
//
// Un champ de texte libre que le DOM remplit (pas un gabarit) : en anonymisation, vide, non
// modifiable, avec la mention ; l'écrivain qui le relit prend la base si `champMasqueAnonymisation`.
// Le `disabled` n'est rendu que s'il a été posé ICI (un verrou d'évaluation le pose aussi).
function poserChampTexteLibre(champ, valeur) {
    if (!champ) return;
    const masquer = modeActuel === MODES.ANONYMISATION;
    if (champ.dataset.placeholderOrigine === undefined) champ.dataset.placeholderOrigine = champ.placeholder || '';
    if (masquer) {
        champ.value = '';
        champ.disabled = true;
        champ.placeholder = window.MENTION_MASQUE_ANONYMISATION;
        champ.dataset.masqueAnonymisation = '1';
        return;
    }
    if (champ.dataset.masqueAnonymisation === '1') {
        champ.disabled = false;
        champ.placeholder = champ.dataset.placeholderOrigine;
        delete champ.dataset.masqueAnonymisation;
    }
    champ.value = valeur || '';
}

function champMasqueAnonymisation(champ) {
    return !!(champ && champ.dataset && champ.dataset.masqueAnonymisation === '1');
}

// Le titre d'une intervention est un texte libre (« Suivi de ‹prénom› ») : en anonymisation,
// un titre générique daté le remplace partout où il s'affiche (cartes, profil, graphiques).
function titreInterventionAffiche(intervention, repli, nom) {
    if (!intervention) return repli || '';
    if (modeActuel === MODES.ANONYMISATION) {
        const d = intervention.date ? new Date(intervention.date + 'T12:00:00') : null;
        const quoi = nom || 'Intervention';
        return (d && !isNaN(d.getTime()))
            ? quoi + ' du ' + d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })
            : quoi;
    }
    return intervention.titre || repli || '';
}

/**
 * Lot B de l'enregistrement (D0 point 2, #618, #786 — 27 sept. 2026) : les raisons d'un
 * « Non enregistré », dites par le témoin commun (`temoin-enregistrement.js`).
 * Mots proposés par Cowork, à faire accepter par Grégoire.
 */
const RAISONS_NON_ENREGISTRE = {
    quota: 'la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre.',
    erreur: 'le navigateur a refusé l\'écriture.',
    garde: 'ces données ne correspondent pas au trimestre ouvert.',
    // #1029 — connexion IndexedDB perdue, et la réouverture n'y a rien fait (message
    // tranché par Grégoire, 5 oct. 2026, 13 h 44) : seul le rechargement rétablit l'accès,
    // et il perd ce qui n'a pas été écrit.
    connexion: 'le navigateur a refusé l\'écriture. Note ce que tu viens de saisir, puis recharge la page : ta saisie sera à refaire.',
    // #1075, point 2 (22 oct. 2026) — mots provisoires de Claude Code, à Grégoire avant la release.
    clos: 'ce trimestre est clos, en lecture seule. Pour une correction ponctuelle, coche « Permission d\'écriture » dans son bandeau.'
};

/**
 * #1075, point 2 (22 oct. 2026) — UN TRIMESTRE CLOS NE S'ÉCRIT PAS. Sa lecture seule n'était qu'une
 * règle CSS, qui visait des boutons `onclick` disparus : « Enregistrer », le cadenas, l'annotation
 * écrivaient dans un trimestre archivé. Les deux écritures de l'usager (`sauvegarderDonneesSelonMode`,
 * `modifierEtAnnoncer`) refusent maintenant une clé DU TRIMESTRE ACTIF quand il est archivé, sauf si
 * « Permission d'écriture » est cochée (`body.mode-ecriture-temp`, trimestres.js). Une clé globale,
 * ou celle d'un autre trimestre, passe : l'archivage et la réouverture d'archive écrivent ailleurs.
 * Banc : `tests/unit/sentinelle-1075-trimestre-clos-refuse.test.js`.
 * @param {string} cleEffective - la clé namespacée qui serait écrite
 * @returns {boolean} true si l'écriture doit être refusée
 */
function _trimestreClosRefuse(cleEffective) {
    if (typeof window.estTrimestreArchive !== 'function' || !window.estTrimestreArchive()) return false;
    const sonde = typeof window.cle === 'function' ? window.cle('§') : '§';
    if (sonde === '§' || cleEffective.indexOf(sonde.slice(0, -1)) !== 0) return false;
    const corps = typeof document !== 'undefined' ? document.body : null;
    return !(corps && corps.classList && corps.classList.contains('mode-ecriture-temp'));
}

/** Le refus d'un trimestre clos, dit par le témoin (sauf écriture discrète). Rend true s'il refuse. */
function _refuserSiTrimestreClos(cleEffective, geste, discret) {
    if (!_trimestreClosRefuse(cleEffective)) return false;
    const temoin = window.temoinEnregistrement;
    if (temoin && !discret) temoin.nonEnregistre(RAISONS_NON_ENREGISTRE.clos, geste, cleEffective);
    return true;
}

function _raisonNonEnregistre(error) {
    if (error && error.name === 'ConnexionPerdue') return RAISONS_NON_ENREGISTRE.connexion;
    const quota = error && (error.name === 'QuotaExceededError' ||
        (error.message && error.message.includes('quota')));
    return quota ? RAISONS_NON_ENREGISTRE.quota : RAISONS_NON_ENREGISTRE.erreur;
}

/**
 * #962 (5 oct. 2026) — le succès d'une écriture, dit au bon moment. `db.setSync` rend la
 * main AVANT le commit IndexedDB :
 *   - une GROSSE clé (au-delà du seuil de `db.js`) ne vit qu'en mémoire jusqu'au commit :
 *     « Enregistré » attend le commit (mesuré au banc WebKit : ≤ 4 ms pour 20 Mo) ;
 *   - une petite clé qui porte le « Non enregistré » affiché ne l'efface pas avant que SON
 *     commit ait réussi (l'échec précédent venait justement d'un commit) ;
 *   - toute autre petite clé : « Enregistré » tout de suite, comme avant.
 * Un commit qui échoue fait dire l'échec, avec le geste. L'abonné de `db.surEchecEcriture`
 * (plus bas) le dit aussi, sans geste, pour les écritures directes : il passe en premier,
 * celui-ci après, et c'est le texte avec le geste qui reste.
 * L'événement du codex (« donnees-enregistrees ») part tout de suite, comme avant : la
 * donnée a changé dans l'application.
 */
function _annoncerEnregistre(temoin, cles, geste, lot) {
    // #982 : un geste peut écrire PLUSIEURS clés ; il ne dit qu'UN « Enregistré », après la
    // dernière (et après tous les commits attendus). Les autres clés préviennent le codex.
    const liste = (Array.isArray(cles) ? cles : [cles]).filter((c, i, t) => c && t.indexOf(c) === i);
    if (liste.length === 0) return;
    const derniere = liste[liste.length - 1];
    const autres = liste.slice(0, -1);
    // `lot` (#982) : les clés ont déjà prévenu le codex à l'appel, et les commits attendus
    // ont été CAPTURÉS à l'appel (un échec survenu entre-temps ne doit pas se faire
    // effacer par un « Enregistré »).
    const signaler = (c) => {
        if (lot) return;
        if (typeof window.signalerEcritureUsager === 'function') window.signalerEcritureUsager(c);
    };
    const echecSur = (c) => typeof temoin.echecSur === 'function' && temoin.echecSur(c);
    const attenteDe = (c) => lot ? (lot.attentes.get(c) || null)
        : (typeof db.commitEnAttente === 'function' ? db.commitEnAttente(c) : null);
    const attentes = liste.map((c) => ({ cle: c, attente: attenteDe(c) })).filter((a) => a.attente);
    // Un LOT (#982) attend toujours ses commits : la fenêtre retarde déjà l'annonce, et un
    // commit de petite clé prend ~1 ms — aucun délai perçu, et jamais « Enregistré » avant
    // qu'un échec ait pu se dire.
    const attendre = (lot && attentes.length > 0) || attentes.some((a) => a.attente.grosse || echecSur(a.cle));
    const dire = () => {
        autres.forEach((c) => { if (typeof temoin.fermerSi === 'function') temoin.fermerSi(c); });
        temoin.enregistre(derniere);
    };
    autres.forEach(signaler);
    if (!attendre) dire();
    else signaler(derniere);
    if (attentes.length === 0) return;
    Promise.all(attentes.map((a) => a.attente.commit.then(null, (error) => { throw { cle: a.cle, error }; })))
        .then(
            () => { if (attendre) dire(); },
            (e) => temoin.nonEnregistre(_raisonNonEnregistre(e.error), geste, e.cle)
        );
}

// #982 — la fenêtre qui regroupe les annonces d'un même geste (voir plus bas).
const FENETRE_LOT_MS = 100;
const _lotAnnonce = { cles: [], attentes: new Map(), geste: undefined, minuterie: null };

function _viderLotAnnonce() {
    const lot = { cles: _lotAnnonce.cles, attentes: _lotAnnonce.attentes };
    const geste = _lotAnnonce.geste;
    _lotAnnonce.cles = [];
    _lotAnnonce.attentes = new Map();
    _lotAnnonce.geste = undefined;
    _lotAnnonce.minuterie = null;
    const temoin = window.temoinEnregistrement;
    if (temoin && lot.cles.length) _annoncerEnregistre(temoin, lot.cles, geste, lot);
}

/**
 * #982 (5 oct. 2026) — L'ANNONCE PUBLIQUE d'un geste de l'usager qui écrit hors des trois
 * écrivains annonceurs (`db` direct, entité, file d'attente). Décision de Grégoire (5 oct.,
 * 18 h 32) : « Enregistré » partout, de la même façon. La règle du lot 1 s'y applique : grosse
 * clé → « Enregistré » au commit ; échec → « Non enregistré » qui reste. Le codex est prévenu
 * comme avant (`signalerEcritureUsager`).
 *
 * Remplace `signalerEcritureUsager(cle)` aux gestes de l'usager ; une écriture de la machine
 * garde `signalerEcritureUsager` (le codex apprend, l'écran se tait).
 * @param {string|string[]} cles - la clé écrite, ou TOUTES celles d'un même geste (un seul
 *   « Enregistré », après la dernière)
 * @param {Object} [options] - `{ geste }`, dit sur un échec
 */
function annoncerEcritureUsager(cles, options) {
    const { geste } = options || {};
    const liste = (Array.isArray(cles) ? cles : [cles]).filter(Boolean);
    // Le codex apprend tout de suite, comme avant (« pas à jour » sans délai).
    liste.forEach((c) => {
        if (typeof window.signalerEcritureUsager === 'function') window.signalerEcritureUsager(c);
    });
    if (!window.temoinEnregistrement) return;
    // UN geste peut appeler plusieurs fois (suppression d'une ressource : la ressource, la
    // corbeille, le dossier ; une boucle d'import) : les clés reçues dans une courte fenêtre,
    // relancée à chaque appel, forment un seul lot et un seul « Enregistré », après la dernière.
    liste.forEach((c) => {
        const i = _lotAnnonce.cles.indexOf(c);
        if (i >= 0) _lotAnnonce.cles.splice(i, 1);
        _lotAnnonce.cles.push(c);
        const attente = typeof db.commitEnAttente === 'function' ? db.commitEnAttente(c) : null;
        if (attente) _lotAnnonce.attentes.set(c, attente);
    });
    if (geste) _lotAnnonce.geste = geste;
    clearTimeout(_lotAnnonce.minuterie);
    _lotAnnonce.minuterie = setTimeout(_viderLotAnnonce, FENETRE_LOT_MS);
}

/**
 * Sauvegarde des données selon le mode actif
 * FONCTION CENTRALE - À utiliser partout où on fait db.setSync()
 *
 * CONTRAT (lot B, #786) : `true` si l'écriture a eu lieu, `false` sinon — jamais une
 * chaîne. Avant, elle rendait `'quota'` ou `'error'`, truthy : les appelants en
 * `if (!…)` les lisaient comme un succès et affichaient « enregistré » sur un échec.
 * C'est ELLE qui fait parler le témoin commun, sur le succès comme sur l'échec :
 * l'appelant n'a plus à dire l'échec, seulement à ne pas dire un succès qui n'a pas eu lieu.
 *
 * @param {string} cle - Clé de base (ex: 'groupeEtudiants')
 * @param {*} donnees - Données à sauvegarder
 * @param {Object} [options]
 * @param {string} [options.geste] - Ce que l'usager croyait faire, dit par le témoin sur un
 *   échec (« Non enregistré – ‹geste› : ‹raison› », modèle des jetons).
 * @param {boolean} [options.discret] - N'annonce pas le succès : écritures que l'usager n'a
 *   pas faites (indices recalculés, migrations). Un échec est toujours dit.
 * @returns {boolean} true si l'écriture a eu lieu, false sinon
 */
function sauvegarderDonneesSelonMode(cle, donnees, options) {
    const { geste, discret } = options || {};
    // Lot A de l'enregistrement (D5, Grégoire, 26 sept. 2026 : « Je choisis A ») — en
    // anonymisation, on écrit comme en mode normal ; seul l'AFFICHAGE protège l'identité.
    // Avant : `return false` ici. L'évaluation faite en anonymisation restait visible pendant
    // la séance (le cache mémoire la portait) puis disparaissait au rechargement, sans un mot.
    // Ce qui part vers les vraies données ne porte aucune valeur de substitution.
    if (modeActuel === MODES.ANONYMISATION) {
        donnees = retirerSubstitutionsAnonymisation(cle, donnees);
    }

    const temoin = window.temoinEnregistrement;
    // La clé écrite accompagne le témoin : un « Non enregistré » ne s'efface que par une
    // écriture réussie de LA MÊME clé (relecture de Cowork, R1).
    let cleEffective = cle;
    try {
        // Utiliser window.cle() pour le namespacing par trimestre (paramètre cle shadowed)
        cleEffective = window.cle(cle);
        // #1075, point 2 : un trimestre clos ne s'écrit pas. Une écriture discrète (recalcul,
        // migration) se tait ; celle de l'usager le dit.
        if (_refuserSiTrimestreClos(cleEffective, geste, discret)) return false;
        // #340 : la garde de `db` refuse une écriture incohérente et rend `false` (sans
        // rien écrire). Avant le lot B, un `return` nu : cette fonction rendait `true`.
        if (db.setSync(cleEffective, donnees) === false) {
            console.error(`❌ Écriture refusée par la garde #340 : ${cle}`);
            if (temoin) temoin.nonEnregistre(RAISONS_NON_ENREGISTRE.garde, geste, cleEffective);
            return false;
        }
        // #397/#447 : l'invalidation est CIBLÉE sur la clé écrite (voir
        // invaliderCacheLecture). Elle est faite ici explicitement ET signalée
        // par `db` : ce n'est pas une ceinture-bretelles décorative — cette
        // fonction doit tenir sa propre promesse sans dépendre d'un abonnement
        // qu'elle ne possède pas. La seconde invalidation est un `delete` sur
        // une entrée déjà retirée : gratuite.
        invaliderCacheLecture(cleEffective);
        if (modeActuel === MODES.ANONYMISATION) _poserEmpreintes(cle, donnees);   // R1
        if (temoin && !discret) _annoncerEnregistre(temoin, cleEffective, geste);
        return true;
    } catch (error) {
        // #618 : l'ancien toast disait « Les données sont sauvegardées » sur un quota
        // dépassé — faux à chaque fois : `db.setSync` ne lève que si RIEN n'a été écrit.
        const quota = error.name === 'QuotaExceededError' ||
            (error.message && error.message.includes('quota'));
        console.error(`❌ Erreur sauvegarde ${cle}${quota ? ' (quota)' : ''}:`, error);
        if (temoin) temoin.nonEnregistre(quota ? RAISONS_NON_ENREGISTRE.quota : RAISONS_NON_ENREGISTRE.erreur, geste, cleEffective);
        return false;
    }
}

/**
 * Lot E1 de l'enregistrement (D0 point 2, D3 — 27 sept. 2026) : le pendant de
 * `sauvegarderDonneesSelonMode` pour les écritures LUE-MODIFIÉE-ÉCRITE par `db.modifier`
 * (#510), celles des éditeurs de la Conception. Elles ne passaient pas par le témoin :
 * un champ de grille, d'échelle, de cartouche ou de pratique s'écrivait sans que rien
 * ne le dise, et un échec n'était qu'une promesse rejetée.
 *
 * Même contrat de parole : « Enregistré » après une écriture qui a eu lieu, « Non
 * enregistré – ‹geste› : ‹raison› » sur un échec, rien quand le mutateur a renoncé
 * (`undefined` : grille introuvable, index hors bornes — l'appelant dit son refus).
 *
 * ⚠ Un échec est RELANCÉ après que le témoin l'a dit : les appelants gardaient déjà
 * leur comportement sur une promesse rejetée (aucun succès affiché ensuite), et ce
 * lot ne le change pas.
 * ⚠ `db.set` refuse une écriture de la garde #340 par un `return` nu : le mutateur
 * enveloppé consulte la même garde AVANT de rendre sa valeur, pour ne pas annoncer
 * « Enregistré » sur un refus.
 *
 * @param {string} cleEffective - Clé DÉJÀ namespacée (`cle('grillesTemplates')`)
 * @param {function} mutateur - Voir `db.modifier`
 * @param {*} [defaut] - Voir `db.modifier`
 * @param {Object} [options] - `{ geste, discret }`, comme `sauvegarderDonneesSelonMode`
 * @returns {Promise<*>} ce que le mutateur a rendu (`undefined` sur un refus de garde)
 */
async function modifierEtAnnoncer(cleEffective, mutateur, defaut = null, options) {
    const { geste, discret } = options || {};
    const temoin = window.temoinEnregistrement;
    // #1075, point 2 : un trimestre clos ne s'écrit pas (voir `_trimestreClosRefuse`).
    if (_refuserSiTrimestreClos(cleEffective, geste, discret)) return undefined;
    let refuse = false;
    let ecrit = false;
    try {
        const resultat = await db.modifier(cleEffective, async (lues) => {
            const valeur = await mutateur(lues);
            if (valeur === undefined) return undefined;
            if (typeof db._ecritureAutorisee === 'function' && !db._ecritureAutorisee(cleEffective, valeur)) {
                refuse = true;
                return undefined;
            }
            ecrit = true;
            return valeur;
        }, defaut);
        if (refuse) {
            if (temoin) temoin.nonEnregistre(RAISONS_NON_ENREGISTRE.garde, geste, cleEffective);
            return undefined;
        }
        if (ecrit) {
            invaliderCacheLecture(cleEffective);
            if (temoin && !discret) _annoncerEnregistre(temoin, cleEffective, geste);
        }
        return resultat;
    } catch (error) {
        const quota = error && (error.name === 'QuotaExceededError' ||
            (error.message && error.message.includes('quota')));
        console.error(`❌ Écriture échouée ${cleEffective}${quota ? ' (quota)' : ''}:`, error);
        if (temoin) temoin.nonEnregistre(_raisonNonEnregistre(error), geste, cleEffective);
        throw error;
    }
}

/**
 * Lot E2 de l'enregistrement (D0 point 2, D3 — 28 sept. 2026) : le pendant de
 * `modifierEtAnnoncer` pour une écriture faite par une ENTITÉ qui possède sa collection
 * (`CoursEntite` : garde des doublons, forme de la fiche). L'entité écrit ; le témoin
 * commun parle après, sur le même contrat :
 *   - « Enregistré » quand `ecrire` rend une valeur (l'objet écrit) ;
 *   - rien quand elle rend null / undefined / false : l'entité a refusé, l'appelant le dit ;
 *   - « Non enregistré – ‹geste› : ‹raison› » sur un échec, RELANCÉ ensuite (même règle
 *     que `modifierEtAnnoncer`).
 * @param {string} cleEffective - la clé écrite par l'entité (celle qui efface un échec affiché)
 * @param {function(): Promise<*>} ecrire
 * @param {Object} [options] - `{ geste, discret }`
 * @returns {Promise<*>} ce que `ecrire` a rendu
 */
async function ecrireEtAnnoncer(cleEffective, ecrire, options) {
    const { geste, discret } = options || {};
    const temoin = window.temoinEnregistrement;
    try {
        const resultat = await ecrire();
        if (resultat && temoin && !discret) _annoncerEnregistre(temoin, cleEffective, geste);
        if (resultat) invaliderCacheLecture(cleEffective);
        return resultat;
    } catch (error) {
        const quota = error && (error.name === 'QuotaExceededError' ||
            (error.message && error.message.includes('quota')));
        console.error(`❌ Écriture échouée ${cleEffective}${quota ? ' (quota)' : ''}:`, error);
        if (temoin) temoin.nonEnregistre(_raisonNonEnregistre(error), geste, cleEffective);
        throw error;
    }
}

/**
 * Obtient l'option d'affichage du DA en mode anonymisation
 * @returns {boolean} - true pour afficher le DA réel, false pour "ANONYME"
 */
function obtenirOptionAffichageDA() {
    const option = db.getSync('anonymisation_afficher_da_reel', null);
    // ✅ CORRECTION (29 déc 2025) : Par défaut false (masquer DA) au lieu de true
    // En mode anonymisation, les DA doivent être masqués par défaut
    return option === null ? false : option === 'true' || option === true;
}

/**
 * Définit l'option d'affichage du DA en mode anonymisation
 * @param {boolean} afficherDAReel - true pour DA réel, false pour "ANONYME"
 */
function definirOptionAffichageDA(afficherDAReel) {
    db.setSync('anonymisation_afficher_da_reel', afficherDAReel);

    // Rafraîchir l'affichage si on est en mode anonymisation
    if (modeActuel === MODES.ANONYMISATION && typeof rafraichirContenuSelonMode === 'function') {
        rafraichirContenuSelonMode();
    }
}

/**
 * Réinitialise le mapping d'anonymisation (force regénération)
 * Utile quand la liste d'étudiants change
 */
function reinitialiserMappingAnonyme() {
    // Supprimer le mapping namespacé (nouveau format) et le global (ancien format)
    const trId = typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : '';
    if (trId) db.removeSync(`${trId}_mapping_anonymisation`);
    db.removeSync('mapping_anonymisation');
    db.removeSync('mapping_groupes_anonymes');
}

/**
 * Anonymise un numéro de groupe en le convertissant en lettre
 * @param {string} groupe - Numéro de groupe (ex: "00001", "00002")
 * @returns {string} - Groupe anonymisé avec lettre (ex: "Gr. A", "Gr. B")
 */
function anonymiserGroupe(groupe) {
    if (!groupe) return groupe;

    // Récupérer ou créer le mapping des groupes
    let mappingGroupes = db.getSync('mapping_groupes_anonymes', null);

    if (!mappingGroupes) {
        // Créer le mapping en collectant tous les groupes uniques
        // Utiliser cle() pour le namespacing par trimestre
        const cleNamespacee = cle('groupeEtudiants');
        const etudiants = db.getSync(cleNamespacee, []);
        const groupesUniques = [...new Set(etudiants.map(e => e.groupe).filter(Boolean))].sort();

        mappingGroupes = {};
        groupesUniques.forEach((g, index) => {
            // Convertir index en lettre (0 → A, 1 → B, etc.)
            const lettre = String.fromCharCode(65 + (index % 26));
            mappingGroupes[g] = `Gr. ${lettre}`;
        });

        db.setSync('mapping_groupes_anonymes', mappingGroupes);
    }

    return mappingGroupes[groupe] || `Gr. ?`;
}

/**
 * Anonymise les données selon leur type
 * @param {string} cle - Type de données (groupeEtudiants, evaluationsSauvegardees, etc.)
 * @param {Array|Object} donnees - Données à anonymiser
 * @returns {Array|Object} - Données anonymisées
 */
function anonymiserDonnees(cle, donnees) {

    if (!Array.isArray(donnees)) {
        return donnees; // Si ce n'est pas un tableau, retourner tel quel
    }

    const mapping = genererMappingAnonyme();
    const afficherDAReel = obtenirOptionAffichageDA();

    // Anonymiser selon le type de clé
    switch (cle) {
        case 'groupeEtudiants':
            // Anonymiser et ajouter l'ordre d'affichage
            const etudiantsAnonymes = donnees.map(etudiant => ({
                ...etudiant,
                daReel: etudiant.da,
                daAffichage: afficherDAReel ? etudiant.da : 'ANONYME',
                nom: mapping[etudiant.da]?.nom ?? '',
                prenom: mapping[etudiant.da]?.prenom || 'Anonyme',
                groupeReel: etudiant.groupe,
                groupe: etudiant.groupe ? anonymiserGroupe(etudiant.groupe) : etudiant.groupe,
                ordreAffichage: mapping[etudiant.da]?.ordreAffichage ?? 999
            }));

            // Trier selon l'ordre d'affichage aléatoire
            const etudiantsTries = etudiantsAnonymes.sort((a, b) => a.ordreAffichage - b.ordreAffichage);
            return etudiantsTries;

        case 'evaluationsSauvegardees':
            return donnees.map(evaluation => {
                const nomAnonyme = mapping[evaluation.etudiantDA]?.nomComplet || 'Anonyme';
                return {
                    ...evaluation,
                    etudiantDAReel: evaluation.etudiantDA,
                    etudiantDAffichage: afficherDAReel ? evaluation.etudiantDA : 'ANONYME',
                    etudiantNom: nomAnonyme,
                    groupe: evaluation.groupe ? anonymiserGroupe(evaluation.groupe) : evaluation.groupe
                };
            });

        case 'presences':
            return donnees.map(presence => ({
                ...presence,
                daReel: presence.da,
                daAffichage: afficherDAReel ? presence.da : 'ANONYME',
                nom: mapping[presence.da]?.nom ?? '',
                prenom: mapping[presence.da]?.prenom || 'Anonyme'
            }));

        default:
            // Pour les autres types de données, retourner tel quel
            return donnees;
    }
}

/**
 * Obtient le DA à afficher pour un étudiant en mode anonymisation
 * @param {Object} etudiant - Objet étudiant avec propriétés da et daAffichage
 * @returns {string} - Le DA à afficher
 */
function obtenirDAAffichage(etudiant) {
    if (modeActuel !== MODES.ANONYMISATION) {
        return etudiant.da;
    }
    return etudiant.daAffichage || etudiant.da;
}

/**
 * Le mode anonymisation est-il actif ? Le nom est historique : depuis le lot A de
 * l'enregistrement (26 sept. 2026), l'anonymisation n'est plus une lecture seule — on y
 * écrit comme en mode normal, et les lecteurs de cette fonction s'en servent pour MASQUER.
 * Même réponse que `estModeAnonymisation` ; 47 bancs la simulent sous ce nom.
 * @returns {boolean}
 */
function estModeeLectureSeule() {
    return modeActuel === MODES.ANONYMISATION;
}

// ============================================
// GESTION BOUTON ASSISTANCE PRIMO
// ============================================

/**
 * Gère l'affichage des boutons d'en-tête selon le mode actif
 * @param {string} mode - Le mode actif
 */
function gererAffichageBoutonPrimo(mode) {
    // Boutons Soutenir/Feedback (visibles en mode Normal uniquement)
    const boutonSoutenir = document.getElementById('btn-soutenir-projet');
    const boutonFeedback = document.getElementById('btn-feedback');

    if (boutonSoutenir) {
        toggleDisplay(boutonSoutenir, mode === MODES.NORMAL);
    }

    if (boutonFeedback) {
        toggleDisplay(boutonFeedback, mode === MODES.NORMAL);
    }
}

// ============================================
// EXPORT
// ============================================

/**
 * Les 4 sous-systèmes d'accompagnement (visite guidée, aide contextuelle,
 * tooltips hover, flèches didactiques) sont pilotés par la pref unique
 * `accompagnementActif` depuis le 20 avril 2026. Les fonctions ci-dessous
 * redirigent vers window.accompagnement pour préserver la rétrocompat des
 * appelants existants (parcours-apprentissage.js, modes.js internal usages).
 */
function estTourGuideActif() {
    return !!obtenirPreference('accompagnementActif');
}

// Alias rétrocompatibles (seront retirés dans une future version)
function estModeAssiste() { return estTourGuideActif(); }
function estModeGuide() { return estTourGuideActif(); }

function definirTourGuide(etat) {
    if (window.accompagnement && typeof window.accompagnement.definirActif === 'function') {
        window.accompagnement.definirActif(!!etat);
    } else {
        // Fallback si accompagnement.js pas encore chargé : écrit direct + synchro body
        definirPreference('accompagnementActif', !!etat);
        document.body.classList.toggle('tour-guide-actif', !!etat);
        document.body.classList.toggle('aide-contextuelle-active', !!etat);
        window.dispatchEvent(new Event('modeChanged'));
    }
}

function estAideContextuelleActive() {
    return !!obtenirPreference('accompagnementActif');
}

function definirAideContextuelle(etat) {
    // Même logique que definirTourGuide — délégué à accompagnement
    definirTourGuide(etat);
}

// ============================================
// THÈME CLAIR / SOMBRE
// ============================================

/**
 * Vérifie si le mode clair est activé (lecture de la préférence)
 * @returns {boolean} true si le mode clair est activé
 */
function estModeClair() {
    return !!obtenirPreference('modeClair');
}

/**
 * Active ou désactive le mode clair
 * @param {boolean} clair - true pour activer le mode clair, false pour le mode sombre
 */
function definirTheme(clair) {
    definirPreference('modeClair', !!clair);
    document.body.classList.toggle('mode-clair', !!clair);
    // Synchroniser les radio buttons et checkboxes legacy
    var radioClair = document.getElementById('radio-mode-clair');
    var radioSombre = document.getElementById('radio-mode-sombre');
    if (radioClair) radioClair.checked = !!clair;
    if (radioSombre) radioSombre.checked = !clair;
    document.querySelectorAll('#checkbox-mode-clair, #checkbox-mode-clair-accueil')
        .forEach(function(cb) { cb.checked = !!clair; });
    // Notifier les modules (graphiques, annotations, etc.)
    // Note : ne PAS dispatcher 'modeChanged' ici — réservé au changement Normal/Anonyme/Démo
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { clair: !!clair } }));
}

/**
 * Bascule entre le mode clair et le mode sombre
 */
function basculerTheme() {
    definirTheme(!estModeClair());
    _syncBtnThemeNav();
}

/** Synchroniser le titre du bouton thème dans la nav principale */
function _syncBtnThemeNav() {
    var btn = document.getElementById('btn-toggle-theme-nav');
    if (btn) btn.title = estModeClair() ? 'Passer en mode sombre' : 'Passer en mode clair';
}

/**
 * Vérifie si on est en mode Démo (route démo active)
 * @returns {boolean} true si la route démo est active
 */
function estEnModeDemo() {
    // Vérifier le flag explicite
    if (db.getSync('demo-actif', null) === 'true') return true;
    // Fallback robuste : vérifier le trimestre actif (couvre les cas de désync)
    if (typeof obtenirTrimestreActif === 'function') {
        const t = obtenirTrimestreActif();
        if (t && t.id === 'demo') return true;
    }
    return false;
}

/**
 * #948 — Le mode anonymisation est-il actif ? `modeActuel` est un `let` de ce
 * fichier : invisible depuis l'IIFE d'un autre module. Les exports de travaux
 * (travaux-archivage.js) en ont besoin pour nommer dossiers et fichiers.
 */
function estModeAnonymisation() {
    return modeActuel === MODES.ANONYMISATION;
}

window.MODES = MODES;
// Lot A de l'enregistrement (26 sept. 2026) — la mention d'un champ ou d'un texte masqué en
// anonymisation. Une seule source : ces mots sont soumis à Grégoire, ils se changent ici.
window.MENTION_MASQUE_ANONYMISATION = 'Masqué en anonymisation';
window.poserChampTexteLibre = poserChampTexteLibre;
window.champMasqueAnonymisation = champMasqueAnonymisation;
window.titreInterventionAffiche = titreInterventionAffiche;
window.estModeAnonymisation = estModeAnonymisation;
window.retirerSubstitutionsAnonymisation = retirerSubstitutionsAnonymisation;
window.initialiserSystemeModes = initialiserSystemeModes;
window.changerMode = changerMode;
window.estTourGuideActif = estTourGuideActif;
window.estModeAssiste = estModeAssiste;  // alias rétrocompatible
window.estModeGuide = estModeGuide;      // alias rétrocompatible
window.definirTourGuide = definirTourGuide;
window.estAideContextuelleActive = estAideContextuelleActive;
window.definirAideContextuelle = definirAideContextuelle;
window.estEnModeDemo = estEnModeDemo;
window.obtenirDonneesSelonMode = obtenirDonneesSelonMode;
// #397 — cache de lecture de pipeline (orchestrateurs : indices.js, portfolio.js,
// tableau-bord-apercu.js encadrent leurs boucles en try/finally)
window.demarrerCacheLecture = demarrerCacheLecture;
window.terminerCacheLecture = terminerCacheLecture;
window.invaliderCacheLecture = invaliderCacheLecture;

// #447 — abonnement au crochet d'écriture de `db` : c'est CE branchement qui
// fait tenir la promesse « jamais de lecture périmée » pour les écritures
// directes des propriétaires SSOT, pas seulement pour celles qui passent par
// sauvegarderDonneesSelonMode. `db.js` est le premier script chargé par
// index.html : `db` existe forcément ici.
if (typeof db !== 'undefined' && typeof db.surEcriture === 'function') {
    db.surEcriture(invaliderCacheLecture);
} else {
    // Pas de garde muette : si le crochet disparaît, on veut le savoir.
    console.error('[#447] db.surEcriture indisponible — le cache de lecture #397 peut servir des valeurs périmées.');
}

// #962 — un échec d'écriture IndexedDB d'arrière-plan (après `db.setSync`, quel que soit
// l'écrivain, même discret) fait dire « Non enregistré » au témoin. Avant : un
// `console.warn`, et le témoin avait déjà dit « Enregistré ». #1030 : une suppression
// d'arrière-plan (`db.removeSync`) qui échoue passe par le même abonné, mêmes mots.
if (typeof db !== 'undefined' && typeof db.surEchecEcriture === 'function') {
    db.surEchecEcriture((cleEcrite, error) => {
        const temoin = window.temoinEnregistrement;
        if (temoin) temoin.nonEnregistre(_raisonNonEnregistre(error), undefined, cleEcrite);
    });
} else {
    console.error('[#962] db.surEchecEcriture indisponible — un échec d\'écriture IndexedDB serait muet.');
}
window.definirContexteSimulation = definirContexteSimulation;
window.effacerContexteSimulation = effacerContexteSimulation;
window.obtenirDonneesSimulationOuNull = obtenirDonneesSimulationOuNull;
window.contexteImposeNoteProvisoire = contexteImposeNoteProvisoire;   // lot N2 (#716)
window.sauvegarderDonneesSelonMode = sauvegarderDonneesSelonMode;
window.modifierEtAnnoncer = modifierEtAnnoncer;
window.ecrireEtAnnoncer = ecrireEtAnnoncer;
window.annoncerEcritureUsager = annoncerEcritureUsager;
window.anonymiserNom = anonymiserNom;
window.anonymiserGroupe = anonymiserGroupe;
// 14 sept. 2026 : lu par la liste d'élèves du Cadre (trimestre-v2-etudiants.js), qui
// affichait les vrais noms en anonymisation. Sans cet export, le nom est privé à cette IIFE.
window.anonymiserDonnees = anonymiserDonnees;
window.estModeeLectureSeule = estModeeLectureSeule;
window.obtenirOptionAffichageDA = obtenirOptionAffichageDA;
window.definirOptionAffichageDA = definirOptionAffichageDA;
window.definirOptionAffichageDADepuisCheckbox = function(el) { definirOptionAffichageDA(el.checked); };
window.reinitialiserMappingAnonyme = reinitialiserMappingAnonyme;
window.obtenirDAAffichage = obtenirDAAffichage;
window.refuserSiTrimestreClos = _refuserSiTrimestreClos;   // #1075, point 2 : l'annotation écrit hors des deux fonctions
window.estModeClair = estModeClair;
window.definirTheme = definirTheme;
window.basculerTheme = basculerTheme;
window.basculerModeAnonymisation = basculerModeAnonymisation;


// ============================================
// FILTRAGE DES ÉTUDIANTS PAR MODE
// ============================================

/**
 * Filtre la liste des étudiants selon le mode actuel
 * [Chantier 2] En mode démo, tous les étudiants passent (ils sont déjà demo)
 * Hors démo : exclure les groupes demo
 *
 * @param {Array} etudiants - Liste complète des étudiants
 * @returns {Array} - Liste filtrée selon le mode
 */
function filtrerEtudiantsParMode(etudiants) {
    if (!etudiants || !Array.isArray(etudiants)) {
        return [];
    }

    // En mode démo, tous les étudiants sont des étudiants demo → pas de filtre
    if (typeof estEnModeDemo === 'function' && estEnModeDemo()) {
        return etudiants;
    }

    // Hors démo : exclure les groupes demo
    const GROUPES_DEMO = ['9999', 'demo'];
    return etudiants.filter(e => !GROUPES_DEMO.includes(e.groupe));
}

// Exporter les fonctions
window.filtrerEtudiantsParMode = filtrerEtudiantsParMode;

// ============================================
// FILTRAGE DES ÉTUDIANTS PAR COURS/TRIMESTRE ACTIF
// ============================================

/**
 * Obtient les étudiants du cours actif uniquement
 * Filtre par coursId pour éviter la contamination entre trimestres
 * 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
 *
 * @returns {Array} - Liste des étudiants du cours actif (vide si aucun cours)
 */
/**
 * #749 lot 2 (L-9, 11 sept. 2026) — LA SEULE NORMALISATION D'UN NUMÉRO DE GROUPE.
 * « 1 » et « 00001 » sont le même groupe. Ce module comparait déjà padé (trois
 * copies locales de la même flèche) pendant que Cadre › Trimestre écrivait « 1 »
 * tel quel et que la Liste comparait brut : un seul groupe faisait deux entrées
 * dans le filtre. Une fonction, partagée par l'écriture (trimestre-v2-etudiants)
 * et les lectures (ici, etudiants.js). Le stock déjà écrit avec « 1 » reste tel
 * quel : il est normalisé À LA LECTURE, jamais réécrit.
 */
function normaliserNumeroGroupe(g) {
    // Un groupe absent (undefined, null, '') rend '00000' — avant, `String(undefined)`
    // rendait 'undefined' et ne se comparait à rien. Seul un groupe saisi « 0 » pourrait
    // désormais coïncider avec une fiche sans groupe (relecture adverse, 11 sept. 2026).
    return String(g || '').padStart(5, '0');
}

/**
 * #1038 (26 oct. 2026) — les productions que le filtre de cours d'`obtenirDonneesSelonMode` écarte
 * TOUTES. Même règle que lui : une production sans coursId passe pour tout cours, une du cours actif
 * passe. Si une seule passe, rien à dire ([]) : deux cours bien rangés ne font aucun bruit.
 * Pure : le stock brut du trimestre et l'id du cours actif, rien d'autre.
 * @returns {Array<{coursId: string, n: number}>} les cours qui portent les productions écartées
 */
function productionsRangeesAilleurs(stock, coursActifId) {
    const productions = Array.isArray(stock) ? stock.filter(Boolean) : [];
    if (!coursActifId || productions.some(p => !p.coursId || p.coursId === coursActifId)) return [];
    const parCours = new Map();
    productions.forEach(p => parCours.set(String(p.coursId), (parCours.get(String(p.coursId)) || 0) + 1));
    return Array.from(parCours, ([coursId, n]) => ({ coursId, n }));
}

function obtenirEtudiantsCoursActif() {
    // Obtenir le cours actif (résolu de façon fiable, cf. #130)
    const coursActif = obtenirContexteCoursActif();

    // Si aucun cours actif, retourner tableau vide
    if (!coursActif || !coursActif.id) {
        return [];
    }

    // Obtenir tous les étudiants
    const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];

    // 🆕 BETA 95.3 : Mode cours = tous les groupes fusionnés
    const estModeCours = coursActif._modeCours || coursActif.groupe === null;

    // Cadrage « Rencontres », lot A (12 sept. 2026) — mesuré sur la porte, rangée 9 : trois
    // élèves écrits dans un service, DEUX rendus. La fiche collée d'Omnivox portait le groupe
    // d'origine du collège (« 00007 ») ; le groupe-cours du service porte « 00001 » ; la
    // comparaison de groupe ci-dessous la faisait tomber, sans un mot. Dans un SERVICE,
    // l'appartenance se conclut sur le coursId seul (un service n'a qu'un groupe-cours). Une
    // fiche SANS coursId n'est pas la sienne (un service n'a pas d'historique) — tranché dans
    // `obtenirDonneesSelonMode`, d'où vient `tousEtudiants` : ici, elle n'arrive jamais (une
    // garde de plus serait morte, break-test du 12 sept. : 0 rouge). Hors service, RIEN ne
    // change — ce filtre est lu par tous les écrans de tous les enseignants.
    const estService = contexteActifEstService();

    // Filtrer par coursId (et optionnellement par groupe)
    const etudiantsFiltres = tousEtudiants.filter(e => {
        // 🆕 CORRECTION (23 jan 2026) : Utiliser groupeReel si disponible (mode anonymisation)
        const groupeEtudiant = e.groupeReel || e.groupe;

        // Compatibilité : si l'étudiant n'a pas de coursId, vérifier le groupe
        if (!e.coursId) {
            // Ancien format : vérifier si le groupe correspond au cours actif
            // En mode cours, accepter tous les étudiants (pas de filtre groupe)
            if (estModeCours) {
                return true; // Inclure tous les étudiants du trimestre
            }
            // Étudiant sans groupe : l'inclure (import CSV sans association)
            if (!groupeEtudiant) {
                return true;
            }
            const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
            // ✅ CORRECTION (9 jan 2026) : Normaliser les groupes avant comparaison
            return normaliserNumeroGroupe(groupeEtudiant) === normaliserNumeroGroupe(groupeCours);
        }

        // Nouveau format avec coursId
        if (e.coursId !== coursActif.id) {
            return false; // Pas le bon cours
        }

        // Si mode cours (tous groupes), ou un service : tous les élèves du cours
        if (estModeCours || estService) {
            return true;
        }

        // Sinon, filtrer aussi par groupe
        const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
        if (!groupeCours) return true; // Pas de groupe spécifié = tous
        return normaliserNumeroGroupe(groupeEtudiant) === normaliserNumeroGroupe(groupeCours);
    });

    // Appliquer le filtrage par mode (exclure groupe 9999 en mode normal)
    return filtrerEtudiantsParMode(etudiantsFiltres);
}

/**
 * Vérifie si un étudiant appartient au cours/trimestre actif
 *
 * @param {Object} etudiant - L'étudiant à vérifier
 * @returns {boolean} - true si l'étudiant est dans le cours actif
 */
function etudiantDansCoursActif(etudiant) {
    if (!etudiant) return false;

    const coursActif = db.getSync('infoCours', null);

    if (!coursActif || !coursActif.id) return false;

    // Vérifier coursId
    if (etudiant.coursId) {
        return etudiant.coursId === coursActif.id;
    }

    // Compatibilité ancien format : vérifier groupe
    // 🆕 CORRECTION (23 jan 2026) : Utiliser groupeReel si disponible (mode anonymisation)
    const groupeEtudiant = etudiant.groupeReel || etudiant.groupe;
    const groupeCours = coursActif.groupe || coursActif.groupes?.[0];
    return groupeEtudiant === groupeCours;
}

/**
 * Lot N1a (#710) — LE POINTEUR DE PRATIQUE DU GROUPE-COURS ACTIF, TEL QU'IL EST ÉCRIT. AUCUN REPLI.
 *
 * Décision de Grégoire (21 sept. 2026, 14 h 31) : sans pratique assignée, aucune note. Rendre
 * « sommative » à la place d'un pointeur vide faisait calculer un P de 87 au tableau de bord
 * pendant que le profil disait qu'aucune pratique n'était assignée.
 *
 * Lot N1b (21 sept. 2026) : `obtenirPratiqueActiveGroupeCours` et son repli « sommative » sont
 * RETIRÉS. Les lecteurs d'écran passent par la désignation (`designerPratiqueActive`,
 * `obtenirIdPratiqueActive`, `obtenirTypePratiqueActive` — pratique-registre.js) ; CE lecteur-ci
 * n'a qu'un appelant légitime : la désignation elle-même.
 *
 * @returns {string|null} l'id écrit dans `groupesCours[].pratiqueId`, brut (ni normalisé ni
 *          vérifié) ; null quand rien n'est assigné.
 */
function lirePointeurPratiqueGroupeCours() {
    // 🔧 FIX #328 L2-a (11 juin 2026) : la SSOT `groupesCours[].pratiqueId`
    // fait foi. L'ancien ordre lisait d'abord les COPIES (gcActif.pratiqueId,
    // infoCours.pratiqueId) — même patron copie-prioritaire que #332
    // (horaireId, corrigé le même jour). Les copies ne servent plus que si le
    // groupe-cours est INTROUVABLE dans la SSOT, jamais pour la contredire.
    // Le fallback sur le champ « pratiqueNotation » des modalités (que plus
    // rien n'écrivait) a été retiré.
    const gcActif = db.getSync('groupeCoursActif', null);

    // 1. SSOT : le groupe-cours actif dans la liste groupesCours
    if (gcActif && gcActif.id) {
        const groupesCours = db.getSync(cle('groupesCours'), []);
        const gc = Array.isArray(groupesCours)
            ? groupesCours.find(g => g && g.id === gcActif.id)
            : null;
        if (gc) {
            return gc.pratiqueId || null;
        }
    }

    // 2. GC introuvable dans la SSOT (état transitoire) : copies en dernier recours
    if (gcActif && gcActif.pratiqueId) {
        return gcActif.pratiqueId;
    }
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.pratiqueId) {
        return infoCours.pratiqueId;
    }

    return null;
}

// Exporter les nouvelles fonctions
window.obtenirEtudiantsCoursActif = obtenirEtudiantsCoursActif;
window.normaliserNumeroGroupe = normaliserNumeroGroupe;
window.productionsRangeesAilleurs = productionsRangeesAilleurs;   // #1038 : le sélecteur « Production » de l'import
// Cadrage « Rencontres » (12 sept. 2026) : le contexte de service, lu à un seul endroit.
window.obtenirIdContexteActif = obtenirIdContexteActif;
window.coursDuContexteActif = coursDuContexteActif;
window.estCoursService = estCoursService;
window.contexteActifEstService = contexteActifEstService;
window.etudiantDansCoursActif = etudiantDansCoursActif;
window.lirePointeurPratiqueGroupeCours = lirePointeurPratiqueGroupeCours;

// ============================================
// INITIALISATION AUTOMATIQUE
// ============================================

/**
 * Initialisation immédiate du système de modes
 * S'exécute dès que modes.js est chargé (AVANT tous les autres modules)
 */

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initialiserSystemeModes();
    });
} else {
    // DOM déjà prêt
    initialiserSystemeModes();
}



})();
