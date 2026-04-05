/**
 * cc-license.js
 * Module de gestion des licences Creative Commons
 *
 * Gère l'ajout de métadonnées CC BY-NC-SA 4.0 aux exports/imports
 * de matériel pédagogique (grilles, échelles, cartouches, productions)
 */

(function() {
'use strict';

// ============================================
// MÉTADONNÉES CC PAR DÉFAUT
// ============================================

const CC_LICENSE_DEFAULTS = {
    licence: "CC BY-NC-SA 4.0",
    licence_url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    licence_resume: "Attribution - Pas d'utilisation commerciale - Partage dans les mêmes conditions 4.0 International",
    auteur_original: "Grégoire Bédard",
    email_auteur: "labo@codexnumeris.org",
    site_auteur: "https://codexnumeris.org"
};

// ============================================
// 🆕 BETA 95.2: PROFIL AUTEUR DEPUIS GROUPE-COURS
// ============================================

/**
 * Obtient le profil auteur de l'enseignant du groupe-cours actif (synchrone)
 * Utilisé pour pré-remplir les métadonnées CC lors des exports
 *
 * @returns {Object|null} - Profil auteur ou null si non disponible
 */
function obtenirProfilAuteurActifSync() {
    try {
        // Vérifier que db est disponible
        if (typeof db === 'undefined' || !db.getSync) {
            return null;
        }

        // Obtenir la liste des enseignants
        const enseignants = db.getSync('enseignants', []);
        if (!enseignants || enseignants.length === 0) {
            return null;
        }

        let enseignant = null;

        // 🆕 Beta 95.4 : Stratégie de recherche améliorée (5 niveaux)

        // 1. D'abord essayer via le groupe-cours actif
        const trimestreActif = window.trimestreActif || db.getSync('trimestreActif', null);
        if (trimestreActif) {
            const cleGC = `${trimestreActif}_groupesCours`;
            const groupesCours = db.getSync(cleGC, []);
            const groupeActif = groupesCours.find(gc => gc.actif);

            if (groupeActif && groupeActif.enseignantId) {
                enseignant = enseignants.find(e => e.id === groupeActif.enseignantId);
            }
        }

        // 2. Sinon, lire le dropdown du profil enseignant (si visible)
        if (!enseignant) {
            const selectEnseignant = document.getElementById('v2-selectEnseignant');
            if (selectEnseignant && selectEnseignant.value) {
                enseignant = enseignants.find(e => e.id === selectEnseignant.value);
            }
        }

        // 3. Sinon, chercher l'enseignant marqué comme actif
        if (!enseignant) {
            enseignant = enseignants.find(e => e.actif);
        }

        // 4. Sinon, prendre le premier enseignant de la liste
        if (!enseignant && enseignants.length > 0) {
            enseignant = enseignants[0];
        }

        if (!enseignant) {
            return null;
        }

        // Convertir en profil auteur (format CC)
        const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim();
        return {
            auteur_original: nomComplet || CC_LICENSE_DEFAULTS.auteur_original,
            email_auteur: enseignant.courriel || '',
            institution: enseignant.institution || '',
            site_auteur: enseignant.siteWeb || '',
            niveau: enseignant.niveau || '',
            attribution: nomComplet ? `Créé par ${nomComplet}` : ''
        };

    } catch (err) {
        console.warn('[CC License] Erreur obtention profil auteur:', err);
        return null;
    }
}

// ============================================
// AJOUT DE MÉTADONNÉES CC
// ============================================

/**
 * Ajoute les métadonnées CC à un objet pour l'export
 * @param {Object} contenu - Le contenu à exporter
 * @param {string} type - Type de contenu ('grille', 'echelle', 'cartouche', 'production', 'pratique')
 * @param {string} nom - Nom du contenu
 * @param {Object} metaEnrichies - Métadonnées enrichies optionnelles (discipline, niveau, description_courte)
 * @returns {Object} - Objet avec métadonnées CC
 */
function ajouterMetadonnéesCC(contenu, type, nom, metaEnrichies = {}) {
    const date_actuelle = new Date().toISOString().split('T')[0];

    // 🆕 BETA 95.2: Utiliser le profil auteur de l'enseignant du groupe-cours actif
    // Priorité: metaEnrichies > profilAuteur (enseignant) > infoCours > défauts
    const profilAuteur = obtenirProfilAuteurActifSync();
    const infoCours = db.getSync('infoCours', {});

    const auteur_utilisateur = metaEnrichies.auteur ||
                               profilAuteur?.auteur_original ||
                               infoCours.enseignant ||
                               CC_LICENSE_DEFAULTS.auteur_original;

    const email_utilisateur = metaEnrichies.courriel ||
                             profilAuteur?.email_auteur ||
                             infoCours.courriel ||
                             CC_LICENSE_DEFAULTS.email_auteur;

    const site_utilisateur = metaEnrichies.siteWeb ||
                            profilAuteur?.site_auteur ||
                            infoCours.siteWeb ||
                            CC_LICENSE_DEFAULTS.site_auteur;

    // 🆕 BETA 95.2: Institution et niveau depuis profil auteur
    const institution_utilisateur = metaEnrichies.institution ||
                                    profilAuteur?.institution ||
                                    infoCours.institution ||
                                    "";

    const niveau_utilisateur = metaEnrichies.niveau ||
                               profilAuteur?.niveau ||
                               infoCours.niveau ||
                               "";

    // Déterminer l'auteur original (si c'est du matériel importé, préserver l'auteur)
    const auteur_original = contenu.metadata_cc?.auteur_original ||
                           contenu.metadata?.auteur_original ||
                           auteur_utilisateur;

    const date_creation = contenu.metadata_cc?.date_creation ||
                         contenu.metadata?.date_creation ||
                         date_actuelle;

    return {
        metadata: {
            ...CC_LICENSE_DEFAULTS,
            auteur_original: auteur_original,
            email_auteur: email_utilisateur,
            site_auteur: site_utilisateur,
            type: type,
            nom: nom,
            date_creation: date_creation,
            date_modification: date_actuelle,
            version: contenu.metadata?.version || "1.0",
            contributeurs: contenu.metadata_cc?.contributeurs || contenu.metadata?.contributeurs || [],
            attribution: profilAuteur?.attribution || `Créé par ${auteur_original} pour l'application Monitorage Pédagogique`,
            // 🆕 BETA 95.2: Métadonnées enrichies depuis profil auteur (enseignant)
            discipline: metaEnrichies.discipline || contenu.metadata?.discipline || [],
            niveau: niveau_utilisateur || contenu.metadata?.niveau || "",
            institution: institution_utilisateur || contenu.metadata?.institution || "",
            description_courte: metaEnrichies.description_courte || contenu.metadata?.description_courte || ""
        },
        contenu: contenu
    };
}

/**
 * Génère le nom de fichier avec métadonnées CC
 * @param {string} type - Type de contenu
 * @param {string} nom - Nom du contenu
 * @param {string} version - Version
 * @param {string} [auteur] - Auteur (optionnel, sinon récupéré depuis infoCours)
 * @returns {string} - Nom de fichier formaté
 */
function genererNomFichierCC(type, nom, version, auteur) {
    const nomNettoye = nom.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const date = new Date().toISOString().split('T')[0];

    // Récupérer l'auteur depuis infoCours si non fourni
    let auteurNettoye = '';
    if (!auteur && typeof db !== 'undefined') {
        const infoCours = db.getSync ? db.getSync('infoCours', {}) : {};
        auteur = infoCours?.enseignant || '';
    }
    if (auteur && typeof auteur === 'string') {
        auteurNettoye = auteur.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }

    // Format: type-nom-auteur-date.json (sans CC-BY-SA pour simplifier)
    const parties = [type, nomNettoye];
    if (auteurNettoye) parties.push(auteurNettoye);
    parties.push(date);

    return parties.join('-') + '.json';
}

// ============================================
// AFFICHAGE BADGE CC
// ============================================

/**
 * Génère le HTML du badge CC pour affichage lors de l'import
 * @param {Object} metadata - Métadonnées CC
 * @returns {string} - HTML du badge
 */
function genererBadgeCC(metadata) {
    if (!metadata || !metadata.licence) {
        return ''; // Pas de licence CC
    }

    let contributeurs_html = '';
    if (metadata.contributeurs && metadata.contributeurs.length > 0) {
        contributeurs_html = '<ul class="cc-badge-contributeurs">';
        metadata.contributeurs.forEach(contrib => {
            contributeurs_html += `<li>${contrib.nom} (${contrib.date}) : ${contrib.modifications}</li>`;
        });
        contributeurs_html += '</ul>';
    }

    return `
        <div class="cc-badge">
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
                <img src="licence CC/by-nc-sa-2.svg" alt="CC BY-NC-SA 4.0" style="height: 15px;">
            </a>

            <p class="cc-badge-titre">${metadata.nom || 'Matériel pédagogique'}</p>

            <p class="cc-badge-auteur">
                <strong>Créé par :</strong> ${metadata.auteur_original}
            </p>

            ${contributeurs_html}

            <div class="cc-badge-conditions">
                <h4>Tu peux :</h4>
                <ul>
                    <li>Partager ce matériel</li>
                    <li>Le modifier et le remixer</li>
                    <li>L'utiliser commercialement</li>
                </ul>

                <h4>À condition de :</h4>
                <ul>
                    <li class="cc-condition-obligation">Attribuer les auteurs originaux</li>
                    <li class="cc-condition-obligation">Pas d'usage commercial (NC)</li>
                    <li class="cc-condition-obligation">Partager sous la même licence (CC BY-NC-SA 4.0)</li>
                </ul>
            </div>

            <p class="cc-metadata">
                Version <span class="cc-metadata-version">${metadata.version}</span> •
                Créé le ${metadata.date_creation} •
                Modifié le ${metadata.date_modification}
            </p>

            <a href="${metadata.licence_url}" target="_blank" class="cc-badge-lien">
                En savoir plus sur la licence CC BY-NC-SA 4.0 →
            </a>
        </div>
    `;
}

// ============================================
// WORKFLOW DE MODIFICATION
// ============================================

/**
 * Enregistre une modification dans les métadonnées CC
 * @param {Object} materiel - Le matériel à modifier
 * @param {string} nomModificateur - Nom du modificateur
 * @param {string} descriptionModif - Description des modifications
 * @returns {Object} - Matériel avec métadonnées mises à jour
 */
function enregistrerModificationCC(materiel, nomModificateur, descriptionModif) {
    // Initialiser metadata si inexistant
    if (!materiel.metadata) {
        materiel.metadata = { ...CC_LICENSE_DEFAULTS };
    }

    // Initialiser contributeurs si inexistant
    if (!materiel.metadata.contributeurs) {
        materiel.metadata.contributeurs = [];
    }

    // Ajouter le contributeur
    materiel.metadata.contributeurs.push({
        nom: nomModificateur,
        date: new Date().toISOString().split('T')[0],
        modifications: descriptionModif
    });

    // Incrémenter version (1.0 → 1.1 → 1.2...)
    const [major, minor] = (materiel.metadata.version || "1.0").split('.');
    materiel.metadata.version = `${major}.${parseInt(minor || 0) + 1}`;

    // Mettre à jour date de modification
    materiel.metadata.date_modification = new Date().toISOString().split('T')[0];

    return materiel;
}

/**
 * Demande à l'utilisateur de s'identifier pour une modification
 * @returns {Object|null} - {nom, description} ou null si annulé
 */
function demanderAttributionModification() {
    const nom = prompt(
        "Ton nom (pour l'attribution Creative Commons) :",
        "Ton nom"
    );

    if (!nom || nom === "Ton nom") {
        return null; // Annulé
    }

    const description = prompt(
        "Brève description de tes modifications :",
        "Ajustements personnalisés"
    );

    if (!description) {
        return null; // Annulé
    }

    return { nom, description };
}

// ============================================
// 🆕 BETA 95.4 : GESTION AUTOMATIQUE DES CONTRIBUTEURS
// ============================================

/**
 * Ajoute l'enseignant actif comme contributeur si nécessaire
 * Règle : Si l'utilisateur actif n'est pas l'auteur original ET n'est pas déjà contributeur,
 * on l'ajoute une seule fois comme contributeur.
 *
 * @param {Object} document - Le document (production, grille, échelle, cartouche, pratique)
 * @returns {Object} - Le document avec contributeurs mis à jour si nécessaire
 */
function ajouterContributeurSiNecessaire(document) {
    if (!document) return document;

    // Obtenir le nom de l'enseignant actif
    const enseignantActif = obtenirNomEnseignantActif();
    if (!enseignantActif) {
        return document; // Pas d'enseignant actif, rien à faire
    }

    // Initialiser metadata si inexistant
    if (!document.metadata) {
        document.metadata = {};
    }
    if (!document.metadata_cc) {
        document.metadata_cc = {};
    }

    // Obtenir l'auteur original (plusieurs sources possibles)
    const auteurOriginal = document.metadata_cc?.auteur_original ||
                          document.metadata?.auteur_original ||
                          document.auteur ||
                          '';

    // Si l'enseignant actif EST l'auteur original, rien à faire
    if (auteurOriginal && auteurOriginal.toLowerCase() === enseignantActif.toLowerCase()) {
        return document;
    }

    // Initialiser contributeurs si inexistant
    if (!document.metadata_cc.contributeurs) {
        document.metadata_cc.contributeurs = [];
    }

    // Vérifier si l'enseignant est déjà contributeur
    const dejaContributeur = document.metadata_cc.contributeurs.some(
        c => c.nom && c.nom.toLowerCase() === enseignantActif.toLowerCase()
    );

    // Si pas encore contributeur, l'ajouter
    if (!dejaContributeur) {
        document.metadata_cc.contributeurs.push({
            nom: enseignantActif,
            date: new Date().toISOString().split('T')[0]
        });
    }

    return document;
}

/**
 * Obtient le nom complet de l'enseignant actif (via groupe-cours)
 * @returns {string|null} - Nom complet ou null si non trouvé
 */
function obtenirNomEnseignantActif() {
    try {
        if (typeof db === 'undefined' || !db.getSync) {
            return null;
        }

        const trimestreActif = window.trimestreActif || db.getSync('trimestreActif', null);
        if (!trimestreActif) {
            return null;
        }

        // Chercher le groupe-cours actif
        const groupesCours = db.getSync(`${trimestreActif}_groupesCours`, []);
        const groupeActif = groupesCours.find(gc => gc.actif);

        if (!groupeActif || !groupeActif.enseignantId) {
            return null;
        }

        // Trouver l'enseignant
        const enseignants = db.getSync('enseignants', []);
        const enseignant = enseignants.find(e => e.id === groupeActif.enseignantId);

        if (!enseignant) {
            return null;
        }

        // Construire le nom complet
        const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim();
        return nomComplet || null;

    } catch (err) {
        console.warn('[CC License] Erreur obtention enseignant actif:', err);
        return null;
    }
}

// Export global
window.ajouterContributeurSiNecessaire = ajouterContributeurSiNecessaire;
window.obtenirNomEnseignantActif = obtenirNomEnseignantActif;

// ============================================
// VALIDATION LICENCE
// ============================================

/**
 * Vérifie si un matériel importé a une licence CC valide
 * @param {Object} donnees - Données importées
 * @returns {boolean} - true si licence CC valide
 */
function verifierLicenceCC(donnees) {
    return !!(donnees.metadata &&
              donnees.metadata.licence &&
              donnees.metadata.licence.includes("CC"));
}

/**
 * Log discret si le matériel n'a pas de licence CC
 * (Remplace l'ancienne alerte bloquante qui était trop intrusive)
 * @param {Object} donnees - Données importées
 */
function avertirSansLicence(donnees) {
    if (!verifierLicenceCC(donnees)) {
        // Simple log console au lieu d'une alerte bloquante
    }
}

// ============================================
// BADGE PERMANENT POUR RÉGLAGES
// ============================================

/**
 * Génère le HTML d'un badge CC permanent pour la section Réglages
 * @returns {string} - HTML du badge permanent
 */
function genererBadgeCCPermanent() {
    return `
        <div class="cc-badge">
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">
                <img src="licence CC/by-nc-sa-2.svg" alt="CC BY-NC-SA 4.0" style="height: 15px;">
            </a>

            <p class="cc-badge-titre">Matériel partagé sous licence libre</p>

            <p class="cc-badge-auteur">
                Ce matériel pédagogique est partagé sous licence
                <strong>CC BY-NC-SA 4.0</strong> (Attribution - Pas d'utilisation commerciale - Partage dans les mêmes conditions).
            </p>

            <div class="cc-badge-conditions">
                <p>
                    Tu peux librement partager, modifier et réutiliser ce matériel à des fins éducatives,
                    à condition d'attribuer les auteurs originaux, de ne pas en faire usage commercial,
                    et de partager tes modifications sous la même licence. Cette licence protège le travail des enseignants
                    tout en favorisant le partage et le bien commun en éducation.
                </p>
            </div>

            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" class="cc-badge-lien">
                En savoir plus sur la licence CC BY-NC-SA 4.0 →
            </a>
        </div>
    `;
}

// ============================================
// MODAL MÉTADONNÉES ENRICHIES (Beta 91)
// ============================================

/**
 * Affiche un modal pour saisir les métadonnées enrichies avant l'export
 * @param {string} typeContenu - Type de contenu (pour affichage)
 * @param {string} nomContenu - Nom du contenu (prérempli)
 * @returns {Promise<Object>} - Promesse résolue avec {discipline: [], niveau: "", description_courte: ""} ou null si annulé
 */
function demanderMetadonneesEnrichies(typeContenu, nomContenu) {
    return new Promise((resolve) => {
        // Créer le modal s'il n'existe pas encore
        let modal = document.getElementById('modalMetadonneesEnrichies');
        if (!modal) {
            modal = creerModalMetadonneesEnrichies();
            document.body.appendChild(modal);
        }

        // Priorité : enseignants[] (sélectionné ou premier) > profilEnseignant (legacy)
        let profilEnseignant = null;
        if (typeof db !== 'undefined' && db.getSync) {
            const enseignants = db.getSync('enseignants', []);
            const selectEns = document.getElementById('v2-selectEnseignant');
            const ensId = selectEns?.value;
            profilEnseignant = ensId ? enseignants.find(e => e.id === ensId) : (enseignants[0] || null);
            if (!profilEnseignant) {
                profilEnseignant = db.getSync('profilEnseignant', null);
            }
        }
        const infoCours = db.getSync('infoCours', {});
        const listeCours = db.getSync('listeCours', []);
        const coursActif = listeCours.find(c => c.actif) || listeCours[0] || {};

        // Construire le nom complet (priorité: profilEnseignant > listeCours > infoCours)
        const prenom = profilEnseignant?.prenom || coursActif.prenomEnseignant || infoCours.prenomEnseignant || infoCours.enseignant || '';
        const nom = profilEnseignant?.nom || coursActif.nomEnseignant || infoCours.nomEnseignant || '';
        const nomComplet = [prenom, nom].filter(Boolean).join(' ');

        const courriel = profilEnseignant?.courriel || coursActif.courriel || infoCours.courriel || '';
        const siteWeb = profilEnseignant?.siteWeb || coursActif.siteWeb || infoCours.siteWeb || '';
        const discipline = profilEnseignant?.discipline || coursActif.discipline || infoCours.discipline || '';
        const institution = profilEnseignant?.institution || coursActif.institution || infoCours.institution || '';


        // Remplir les informations de base
        document.getElementById('metaTypeContenu').textContent = typeContenu;
        document.getElementById('metaNomContenu').textContent = nomContenu;

        // 🆕 Pré-remplir les champs avec les données utilisateur
        document.getElementById('metaNomAuteur').value = nomComplet;
        document.getElementById('metaCourriel').value = courriel;
        document.getElementById('metaSiteWeb').value = siteWeb;
        document.getElementById('metaDisciplines').value = discipline;
        document.getElementById('metaInstitution').value = institution;
        document.getElementById('metaNiveau').value = 'Collégial';

        // Pré-remplir avec la dernière description utilisée
        const derniereDescription = db.getSync('cc-derniere-description', '');
        document.getElementById('metaDescription').value = derniereDescription;
        document.getElementById('metaDescriptionCompteur').textContent = `${derniereDescription.length}/200`;

        // 🆕 Réinitialiser les checkboxes (intelligentes : cochées si valeur présente)
        document.getElementById('checkPartagerNom').checked = true;
        document.getElementById('checkPartagerCourriel').checked = !!courriel;
        document.getElementById('checkPartagerSiteWeb').checked = !!siteWeb;
        document.getElementById('checkPartagerDiscipline').checked = !!discipline;
        document.getElementById('checkPartagerInstitution').checked = !!institution;
        document.getElementById('checkPartagerNiveau').checked = true;
        document.getElementById('zoneClarification').classList.add('u-hide');

        // Afficher le modal
        modal.classList.remove('u-hide');

        // 🆕 Gérer la checkbox "Partager mon nom" → afficher/masquer la zone de clarification
        const checkNom = document.getElementById('checkPartagerNom');
        const zoneClarif = document.getElementById('zoneClarification');

        checkNom.onchange = function() {
            if (!this.checked) {
                zoneClarif.classList.remove('u-hide');
            } else {
                zoneClarif.classList.add('u-hide');
            }
        };

        // Gestionnaire de fermeture
        const fermer = (resultat) => {
            modal.classList.add('u-hide');
            resolve(resultat);
        };

        // Bouton Annuler
        document.getElementById('btnAnnulerMeta').onclick = () => fermer(null);

        // Bouton Valider
        document.getElementById('btnValiderMeta').onclick = () => {
            // 🆕 Vérifier l'intention si le nom n'est pas partagé
            const partagerNom = document.getElementById('checkPartagerNom').checked;

            if (!partagerNom) {
                const intention = document.querySelector('input[name="intentionPartage"]:checked');

                if (!intention) {
                    alert('Précise ton intention de partage.');
                    return;
                }

                if (intention.value === 'prive') {
                    // L'utilisateur ne veut pas partager → annuler l'export
                    alert('Export annulé. Ce matériel reste privé.');
                    fermer(null);
                    return;
                }
                // Si intention === 'anonyme', continuer avec auteur = "Anonyme"
            }

            // Valider la description (obligatoire)
            const description = document.getElementById('metaDescription').value.trim();
            if (!description) {
                alert('La description est obligatoire.');
                return;
            }

            // Sauvegarder la description pour le prochain export
            db.setSync('cc-derniere-description', description);

            // 🆕 Construire les métadonnées selon les checkboxes
            const disciplines = document.getElementById('checkPartagerDiscipline').checked
                ? document.getElementById('metaDisciplines').value.split(',').map(d => d.trim()).filter(d => d.length > 0)
                : [];

            const niveau = document.getElementById('checkPartagerNiveau').checked
                ? document.getElementById('metaNiveau').value
                : '';

            const institution = document.getElementById('checkPartagerInstitution').checked
                ? document.getElementById('metaInstitution').value.trim()
                : '';

            const auteur = partagerNom
                ? document.getElementById('metaNomAuteur').value.trim()
                : 'Anonyme';

            const courriel = document.getElementById('checkPartagerCourriel').checked
                ? document.getElementById('metaCourriel').value.trim()
                : '';

            const siteWeb = document.getElementById('checkPartagerSiteWeb').checked
                ? document.getElementById('metaSiteWeb').value.trim()
                : '';

            fermer({
                auteur: auteur,
                courriel: courriel,
                siteWeb: siteWeb,
                discipline: disciplines,
                niveau: niveau,
                institution: institution,
                description_courte: description
            });
        };

        // Compteur de caractères
        document.getElementById('metaDescription').oninput = (e) => {
            const longueur = e.target.value.length;
            document.getElementById('metaDescriptionCompteur').textContent = `${longueur}/200`;

            if (longueur > 200) {
                e.target.value = e.target.value.substring(0, 200);
                document.getElementById('metaDescriptionCompteur').textContent = '200/200';
            }
        };
    });
}

/**
 * Crée le HTML du modal de métadonnées enrichies
 * @returns {HTMLElement} - Élément modal
 */
function creerModalMetadonneesEnrichies() {
    const modal = document.createElement('div');
    modal.id = 'modalMetadonneesEnrichies';
    modal.className = 'modal u-hide';
    // z-index: 10001 pour passer au-dessus des modaux de bibliothèque (10000)
    modal.style.cssText = 'display: flex; position: fixed; z-index: 10001; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center;';

    modal.innerHTML = `
        <div class="modal-content modal-js-contenu" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-top: 0; color: var(--bleu-leger); display: flex; align-items: center; justify-content: space-between;">
                <span>Metadonnees d'export</span>
                <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank"
                   class="u-texte-mini" style="color: var(--bleu-leger); text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <img src="licence CC/by-nc-sa-2.svg"
                         alt="CC BY-NC-SA 4.0" style="height: 15px;">
                    En savoir plus
                </a>
            </h2>

            <p class="u-mb-20" style="color: var(--gris-leger);">
                Tu exportes : <strong id="metaTypeContenu"></strong><br>
                <span class="u-texte-09" id="metaNomContenu"></span>
            </p>

            <!-- Section 1: Informations personnelles -->
            <h3 class="cc-modal-section-titre">
                Informations personnelles
            </h3>

            <div class="cc-modal-ligne-champ u-mb-10">
                <input type="checkbox" id="checkPartagerNom" checked class="cc-modal-checkbox">
                <label for="checkPartagerNom" class="cc-modal-label">Nom</label>
                <input type="text" id="metaNomAuteur" class="cc-modal-input">
            </div>

            <div class="cc-modal-ligne-champ u-mb-10">
                <input type="checkbox" id="checkPartagerCourriel" checked class="cc-modal-checkbox">
                <label for="checkPartagerCourriel" class="cc-modal-label">Courriel</label>
                <input type="email" id="metaCourriel" class="cc-modal-input">
            </div>

            <div class="cc-modal-ligne-champ u-mb-15">
                <input type="checkbox" id="checkPartagerSiteWeb" checked class="cc-modal-checkbox">
                <label for="checkPartagerSiteWeb" class="cc-modal-label">Site web</label>
                <input type="url" id="metaSiteWeb" class="cc-modal-input">
            </div>

            <!-- Zone de clarification (cachée par défaut) -->
            <div id="zoneClarification" class="info-box info-box--attention u-mb-20" style="display: none;">
                <p class="u-mb-15" style="margin-top: 0; font-weight: 600; color: var(--gris-fonce);">
                    Clarification necessaire
                </p>
                <p class="u-mb-15 u-texte-09" style="margin-top: 0; color: var(--gris-fonce);">
                    Pourquoi ne veux-tu pas partager ton nom ?
                </p>
                <label class="cc-modal-radio-label u-mb-10">
                    <input type="radio" name="intentionPartage" value="anonyme" style="margin-right: 10px; margin-top: 3px;">
                    <span class="u-texte-09" style="line-height: 1.5;">
                        <strong>Je veux partager anonymement</strong><br>
                        <small style="color: var(--gris-leger);">Le materiel sera sous licence CC BY-NC-SA mais marque "Auteur anonyme"</small>
                    </span>
                </label>
                <label class="cc-modal-radio-label">
                    <input type="radio" name="intentionPartage" value="prive" style="margin-right: 10px; margin-top: 3px;">
                    <span class="u-texte-09" style="line-height: 1.5;">
                        <strong>Je ne veux pas partager ce materiel</strong><br>
                        <small style="color: var(--gris-leger);">Usage prive/personnel uniquement (annule l'export)</small>
                    </span>
                </label>
            </div>

            <!-- Section 2: Informations contextuelles -->
            <h3 class="cc-modal-section-titre">
                Informations contextuelles
            </h3>

            <div class="cc-modal-ligne-champ u-mb-10">
                <input type="checkbox" id="checkPartagerDiscipline" checked class="cc-modal-checkbox">
                <label for="checkPartagerDiscipline" class="cc-modal-label">Discipline(s)</label>
                <input type="text" id="metaDisciplines"
                       placeholder="Ex: Litterature, Philosophie"
                       class="cc-modal-input">
            </div>

            <div class="cc-modal-ligne-champ u-mb-10">
                <input type="checkbox" id="checkPartagerInstitution" class="cc-modal-checkbox">
                <label for="checkPartagerInstitution" class="cc-modal-label">Institution</label>
                <input type="text" id="metaInstitution"
                       placeholder="Ex: Cegep de Drummondville"
                       class="cc-modal-input">
            </div>

            <div class="cc-modal-ligne-champ u-mb-15">
                <input type="checkbox" id="checkPartagerNiveau" checked class="cc-modal-checkbox">
                <label for="checkPartagerNiveau" class="cc-modal-label">Niveau</label>
                <select id="metaNiveau" class="cc-modal-input">
                    <option value="">-- Non specifie --</option>
                    <option value="Collegial" selected>Collegial</option>
                    <option value="Universitaire">Universitaire</option>
                    <option value="Secondaire">Secondaire</option>
                </select>
            </div>

            <!-- Section 3: Description (obligatoire) -->
            <h3 class="cc-modal-section-titre u-mb-15">
                Description du contenu <span style="color: var(--rouge-erreur);">*</span>
            </h3>

            <div style="margin-bottom: 25px;">
                <textarea id="metaDescription"
                          placeholder="Decrivez brievement ce contenu pedagogique..."
                          maxlength="200"
                          class="cc-modal-textarea"></textarea>
                <small style="color: var(--gris-leger); display: block; margin-top: 5px;">
                    <span id="metaDescriptionCompteur">0/200</span> caracteres
                </small>
            </div>

            <div class="u-flex-gap-10" style="justify-content: flex-end;">
                <button id="btnAnnulerMeta"
                        class="btn btn-annuler">
                    Annuler
                </button>
                <button id="btnValiderMeta"
                        class="btn btn-principal">
                    Valider et exporter
                </button>
            </div>
        </div>
    `;

    return modal;
}

// ============================================
// MODAL CONFIGURATION COMPLÈTE (Beta 91)
// ============================================

/**
 * Modal spécial pour export de configuration complète
 * Demande plus d'informations que le modal standard (description longue 500 caractères)
 * @param {number} nbRessources - Nombre total de ressources à exporter
 * @returns {Promise<Object|null>} - Métadonnées ou null si annulé
 */
function demanderMetadonneesConfigComplete(nbRessources) {
    return new Promise((resolve) => {
        // Créer le modal s'il n'existe pas
        let modal = document.getElementById('modalConfigComplete');
        if (!modal) {
            modal = creerModalConfigComplete();
            document.body.appendChild(modal);
        }

        // Remplir les informations
        document.getElementById('configNbRessources').textContent = nbRessources;
        document.getElementById('configNom').value = '';
        document.getElementById('configAuteur').value = '';
        document.getElementById('configDisciplines').value = '';
        document.getElementById('configNiveau').value = 'Collégial';
        document.getElementById('configDescription').value = '';
        document.getElementById('configEmail').value = '';
        document.getElementById('configSite').value = '';
        document.getElementById('configLicenceAccept').checked = false;
        document.getElementById('configDescriptionCompteur').textContent = '0/500';

        // Afficher le modal
        modal.classList.remove('u-hide');

        // Gestionnaire de fermeture
        const fermer = (resultat) => {
            modal.classList.add('u-hide');
            resolve(resultat);
        };

        // Bouton Annuler
        document.getElementById('btnAnnulerConfig').onclick = () => fermer(null);

        // Bouton Valider
        document.getElementById('btnValiderConfig').onclick = () => {
            const nom = document.getElementById('configNom').value.trim();
            const auteur = document.getElementById('configAuteur').value.trim();
            const description = document.getElementById('configDescription').value.trim();
            const licenceAccept = document.getElementById('configLicenceAccept').checked;

            // Validation
            if (!nom) {
                alert('Le nom de ta pratique est obligatoire');
                return;
            }
            if (!auteur) {
                alert('Ton nom est obligatoire');
                return;
            }
            if (!description) {
                alert('Une description de ta pratique est obligatoire');
                return;
            }
            if (!licenceAccept) {
                alert('Tu dois accepter de partager sous licence CC BY-NC-SA 4.0');
                return;
            }

            const disciplines = document.getElementById('configDisciplines').value
                .split(',')
                .map(d => d.trim())
                .filter(d => d.length > 0);

            fermer({
                nom: nom,
                auteur: auteur,
                discipline: disciplines,
                niveau: document.getElementById('configNiveau').value,
                description: description,
                email: document.getElementById('configEmail').value.trim(),
                site: document.getElementById('configSite').value.trim()
            });
        };

        // Compteur de caractères
        document.getElementById('configDescription').oninput = (e) => {
            const longueur = e.target.value.length;
            document.getElementById('configDescriptionCompteur').textContent = `${longueur}/500`;

            if (longueur > 500) {
                e.target.value = e.target.value.substring(0, 500);
                document.getElementById('configDescriptionCompteur').textContent = '500/500';
            }
        };
    });
}

/**
 * Crée le HTML du modal de configuration complète
 */
function creerModalConfigComplete() {
    const modal = document.createElement('div');
    modal.id = 'modalConfigComplete';
    modal.className = 'modal u-hide';
    modal.style.cssText = 'display: flex; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; overflow-y: auto; padding: 20px 0;';

    modal.innerHTML = `
        <div class="modal-content modal-js-contenu" style="max-width: 700px; margin: auto;">
            <h2 style="margin-top: 0; color: var(--bleu-leger);">
                Partager ma pratique complete
            </h2>

            <p class="u-mb-20" style="color: var(--gris-leger); background: var(--bleu-tres-pale); padding: 15px; border-radius: 4px;">
                Tu es sur le point d'exporter <strong id="configNbRessources"></strong> ressource(s) pedagogique(s).<br>
                Ces ressources seront partagees avec d'autres enseignant-es.
            </p>

            <div class="cc-modal-groupe-form u-mb-20">
                <label class="cc-modal-form-label">
                    Nom de ta pratique <span style="color: var(--rouge-erreur);">*</span>
                </label>
                <input type="text"
                       id="configNom"
                       placeholder="Ex: PAN avec evaluation par competences"
                       class="cc-modal-input-full">
            </div>

            <div class="cc-modal-groupe-form u-mb-20">
                <label class="cc-modal-form-label">
                    Ton nom <span style="color: var(--rouge-erreur);">*</span>
                </label>
                <input type="text"
                       id="configAuteur"
                       placeholder="Ex: Gregoire Bedard"
                       class="cc-modal-input-full">
            </div>

            <div class="cc-modal-groupe-form u-mb-20">
                <label class="cc-modal-form-label">
                    Discipline(s) <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <input type="text"
                       id="configDisciplines"
                       placeholder="Ex: Litterature, Philosophie"
                       class="cc-modal-input-full">
            </div>

            <div class="cc-modal-groupe-form u-mb-20">
                <label class="cc-modal-form-label">
                    Niveau <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <select id="configNiveau" class="cc-modal-input-full">
                    <option value="">-- Non specifie --</option>
                    <option value="Collegial" selected>Collegial</option>
                    <option value="Universitaire">Universitaire</option>
                    <option value="Secondaire">Secondaire</option>
                </select>
            </div>

            <div class="cc-modal-groupe-form u-mb-20">
                <label class="cc-modal-form-label">
                    Description de ta pratique <span style="color: var(--rouge-erreur);">*</span>
                </label>
                <textarea id="configDescription"
                          placeholder="Decris ton approche pedagogique, tes principes d'evaluation, les objectifs vises..."
                          maxlength="500"
                          class="cc-modal-textarea" style="height: 120px;"></textarea>
                <small style="color: var(--gris-leger); display: block; margin-top: 5px;">
                    <span id="configDescriptionCompteur">0/500</span> caracteres
                </small>
            </div>

            <div class="cc-modal-groupe-form u-mb-20">
                <label class="cc-modal-form-label">
                    Ton courriel <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <input type="email"
                       id="configEmail"
                       placeholder="Ex: nom@cegep.qc.ca"
                       class="cc-modal-input-full">
            </div>

            <div class="cc-modal-groupe-form" style="margin-bottom: 25px;">
                <label class="cc-modal-form-label">
                    Ton site web <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <input type="url"
                       id="configSite"
                       placeholder="Ex: https://monsite.com"
                       class="cc-modal-input-full">
            </div>

            <div class="info-box info-box--attention u-mb-20">
                <label style="display: flex; align-items: start; cursor: pointer;">
                    <input type="checkbox" id="configLicenceAccept" style="margin-right: 10px; margin-top: 4px; transform: scale(1.3);">
                    <span class="u-texte-09" style="line-height: 1.5;">
                        <strong>J'accepte de partager cette configuration sous licence CC BY-NC-SA 4.0</strong><br>
                        <small style="color: var(--gris-leger);">
                            Cela signifie que d'autres enseignant-es pourront utiliser, modifier et partager ton travail,
                            a condition de t'attribuer la paternite, de ne pas en faire usage commercial,
                            et de partager sous la meme licence.
                        </small>
                    </span>
                </label>
            </div>

            <div class="u-flex-gap-10" style="justify-content: flex-end;">
                <button id="btnAnnulerConfig" class="btn btn-annuler">
                    Annuler
                </button>
                <button id="btnValiderConfig" class="btn btn-confirmer">
                    Exporter la pratique
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Génère le contenu du fichier LISEZMOI.txt
 * @param {Object} metadata - Métadonnées de la configuration
 * @param {Object} stats - Statistiques des ressources
 * @returns {string} - Contenu du fichier LISEZMOI
 */
function genererFichierLISEZMOI(metadata, stats) {
    const disciplines = metadata.discipline && metadata.discipline.length > 0
        ? metadata.discipline.join(', ')
        : 'Non spécifiée';

    return `===========================================
PRATIQUE PÉDAGOGIQUE : ${metadata.nom}
===========================================

Auteur : ${metadata.auteur}
Discipline : ${disciplines}
Niveau : ${metadata.niveau || 'Non spécifié'}
Date de création : ${metadata.date_creation}
Licence : CC BY-NC-SA 4.0

-------------------------------------------
DESCRIPTION
-------------------------------------------

${metadata.description}

-------------------------------------------
CONTENU DE CETTE CONFIGURATION
-------------------------------------------

Échelles de performance : ${stats.nbEchelles}
Grilles de critères : ${stats.nbGrilles}
Productions définies : ${stats.nbProductions}
Cartouches de rétroaction : ${stats.nbCartouches}

-------------------------------------------
COMMENT UTILISER CETTE CONFIGURATION
-------------------------------------------

1. Téléchargez le fichier PRATIQUE-COMPLETE-xxx.json
2. Dans l'application, allez dans Paramètres > Import/Export
3. Clique sur "Importer une configuration complète"
4. Sélectionne le fichier téléchargé
5. L'application importera automatiquement toutes les ressources
6. Tu pourras ensuite modifier la configuration selon tes besoins

-------------------------------------------
BESOIN D'AIDE ?
-------------------------------------------

Labo Codex : https://codexnumeris.org/labocodex/
Courriel : labo@codexnumeris.org

-------------------------------------------
ATTRIBUTION
-------------------------------------------

Si tu utilises ou adaptes cette pratique, mentionne :
"Basé sur la pratique de ${metadata.auteur} - ${metadata.nom}"

-------------------------------------------
LICENCE CC BY-NC-SA 4.0
-------------------------------------------

Cette configuration pédagogique est partagée sous licence
Creative Commons Attribution - Pas d'utilisation commerciale
- Partage dans les mêmes conditions 4.0 International.

Tu es libre de :
- Partager : copier et redistribuer le matériel
- Adapter : remixer, transformer et créer à partir du matériel

Selon les conditions suivantes :
- Attribution : tu dois créditer l'auteur original
- Pas d'utilisation commerciale : tu ne peux pas utiliser
  le matériel à des fins commerciales
- Partage dans les mêmes conditions : si tu modifies ou crées
  à partir du matériel, tu dois diffuser tes contributions
  sous la même licence

Plus d'informations : https://creativecommons.org/licenses/by-nc-sa/4.0/

-------------------------------------------

Exporté le ${metadata.date_export} - Version ${metadata.application_version}
${metadata.email_auteur ? `Contact : ${metadata.email_auteur}` : ''}
${metadata.site_auteur ? `Site : ${metadata.site_auteur}` : ''}
`;
}

// ============================================
// PANNEAU MÉTADONNÉES EN LECTURE SEULE (Beta 95.1)
// ============================================

/**
 * Génère le HTML du panneau métadonnées en lecture seule
 * @param {Object} ressource - La ressource avec ses métadonnées
 * @param {string} typeRessource - Type de ressource (grille, echelle, production, cartouche)
 * @returns {string} - HTML du panneau
 */
function genererPanneauMetadonnees(ressource, typeRessource) {
    if (!ressource) return '';

    // Récupérer les métadonnées (plusieurs formats possibles)
    const meta = ressource.metadata_cc || ressource.metadata || {};

    // 🆕 Beta 95.4 : Titre dynamique selon le type de ressource
    const titreParType = {
        'production': 'Métadonnées sur cette production',
        'grille': 'Métadonnées sur cette grille',
        'echelle': 'Métadonnées sur cette échelle',
        'cartouche': 'Métadonnées sur cette cartouche',
        'pratique': 'Métadonnées sur cette pratique'
    };
    const titreMetadonnees = titreParType[typeRessource] || 'Métadonnées';

    // Formatage de la date
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Déterminer l'auteur
    // 🆕 Beta 95.4 : Utiliser l'auteur stocké, ou fallback selon le type
    const valeursIgnorees = ['', 'Inconnu', 'Non spécifié', 'Unknown'];
    let auteur = meta.auteur_original || meta.auteur || ressource.auteur || '';

    if (!auteur || valeursIgnorees.includes(auteur)) {
        let profilAuteur = null;

        // Pour les pratiques (bibliothèque), utiliser directement le profil enseignant
        // car elles ne sont pas liées à un groupe-cours spécifique
        if (typeRessource === 'pratique') {
            profilAuteur = obtenirProfilAuteurActifSync();
        } else {
            // Pour les autres types (productions, grilles, etc.), essayer via groupe-cours
            const trimestreActif = window.trimestreActif || (typeof db !== 'undefined' && db.getSync ? db.getSync('trimestreActif', null) : null);

            if (trimestreActif && typeof db !== 'undefined' && db.getSync) {
                const groupesCours = db.getSync(`${trimestreActif}_groupesCours`, []);
                let groupeCours = null;

                // 1. Si la ressource a un groupeCoursId direct, l'utiliser
                if (ressource.groupeCoursId) {
                    groupeCours = groupesCours.find(gc => gc.id === ressource.groupeCoursId);
                }

                // 2. Sinon, si la ressource a un coursId, trouver le groupe-cours correspondant
                if (!groupeCours && ressource.coursId) {
                    groupeCours = groupesCours.find(gc => gc.coursId === ressource.coursId && gc.actif);
                    if (!groupeCours) {
                        groupeCours = groupesCours.find(gc => gc.coursId === ressource.coursId);
                    }
                }

                // 3. Sinon, prendre le groupe-cours actif
                if (!groupeCours) {
                    groupeCours = groupesCours.find(gc => gc.actif);
                }

                // Si on a trouvé un groupe-cours avec enseignantId, chercher l'enseignant
                if (groupeCours && groupeCours.enseignantId) {
                    const enseignants = db.getSync('enseignants', []);
                    const enseignant = enseignants.find(e => e.id === groupeCours.enseignantId);
                    if (enseignant) {
                        const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim();
                        if (nomComplet) {
                            profilAuteur = { auteur_original: nomComplet };
                        }
                    }
                }
            }

            // Fallback sur le profil auteur actif global
            if (!profilAuteur) {
                profilAuteur = obtenirProfilAuteurActifSync();
            }
        }

        auteur = profilAuteur?.auteur_original || 'Non spécifié';
    }
    const institution = meta.institution || ressource.institution || '';
    const dateCreation = meta.date_creation || ressource.dateCreation || ressource.dateAjout || '';
    const dateModif = meta.date_modification || ressource.dateModification || '';
    const description = meta.description_courte || meta.description || ressource.description || '';
    const discipline = Array.isArray(meta.discipline) ? meta.discipline.join(', ') : (meta.discipline || '');
    const licence = meta.licence || 'CC BY-NC-SA 4.0';
    const contributeurs = meta.contributeurs || [];

    // Construire les lignes du panneau - ORDRE UNIFORME pour tous les types
    let lignesHTML = '';

    // 1. Auteur (toujours affiché)
    lignesHTML += `
        <div class="meta-ligne">
            <span class="meta-label">Auteur</span>
            <span class="meta-valeur">${echapperHtmlCC(auteur)}</span>
        </div>
    `;

    // 2. Date de création (toujours affichée)
    const dateCreationFormatee = formatDate(dateCreation);
    lignesHTML += `
        <div class="meta-ligne">
            <span class="meta-label">Créé le</span>
            <span class="meta-valeur">${dateCreationFormatee || 'Non spécifié'}</span>
        </div>
    `;

    // 3. Date de modification (toujours affichée)
    const dateModifFormatee = formatDate(dateModif);
    const modifAffichee = (dateModifFormatee && dateModifFormatee !== dateCreationFormatee)
        ? dateModifFormatee : '—';
    lignesHTML += `
        <div class="meta-ligne">
            <span class="meta-label">Modifié le</span>
            <span class="meta-valeur">${modifAffichee}</span>
        </div>
    `;

    // 4. Contributeurs (si présents)
    if (contributeurs.length > 0) {
        const listeContributeurs = contributeurs.map(c => {
            const nom = c.nom || 'Anonyme';
            const date = c.date ? ` (${formatDate(c.date)})` : '';
            return `${echapperHtmlCC(nom)}${date}`;
        }).join(', ');

        lignesHTML += `
            <div class="meta-ligne">
                <span class="meta-label">Contributeur${contributeurs.length > 1 ? 's' : ''}</span>
                <span class="meta-valeur">${listeContributeurs}</span>
            </div>
        `;
    }

    // 5. Institution (si présente)
    if (institution) {
        lignesHTML += `
            <div class="meta-ligne">
                <span class="meta-label">Institution</span>
                <span class="meta-valeur">${echapperHtmlCC(institution)}</span>
            </div>
        `;
    }

    // 6. Discipline (si présente)
    if (discipline) {
        lignesHTML += `
            <div class="meta-ligne">
                <span class="meta-label">Discipline</span>
                <span class="meta-valeur">${echapperHtmlCC(discipline)}</span>
            </div>
        `;
    }

    // 7. Description (toujours affichée)
    lignesHTML += `
        <div class="meta-ligne meta-description">
            <span class="meta-label">Description</span>
            <span class="meta-valeur">${description ? echapperHtmlCC(description) : '—'}</span>
        </div>
    `;

    // 8. Licence (toujours affichée en dernier)
    lignesHTML += `
        <div class="meta-ligne meta-licence">
            <span class="meta-label">Licence</span>
            <span class="meta-valeur">
                <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank"
                   style="text-decoration: none;">
                    <img src="licence CC/by-nc-sa-2.svg" alt="${echapperHtmlCC(licence)}" style="height: 15px; vertical-align: middle;">
                </a>
            </span>
        </div>
    `;

    return `
        <div class="panneau-metadata" data-type="${typeRessource}" data-id="${ressource.id || ''}">
            <div class="panneau-metadata-header">
                <span class="panneau-metadata-titre">${titreMetadonnees}</span>
            </div>
            ${lignesHTML}
        </div>
    `;
}

/**
 * Fonction utilitaire pour échapper le HTML (locale à cc-license.js)
 */
function echapperHtmlCC(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// MODAL ÉDITION DES MÉTADONNÉES (Beta 95.1)
// ============================================

/**
 * Affiche le modal d'édition des métadonnées
 * @param {string} typeRessource - Type de ressource
 * @param {string} ressourceId - ID de la ressource
 */
async function afficherModalEditionMetadonnees(typeRessource, ressourceId) {
    // Récupérer la ressource selon son type
    let ressource = null;
    let cleStockage = '';

    switch(typeRessource) {
        case 'grille':
            const grilles = await db.get('grillesTemplates') || [];
            ressource = grilles.find(g => g.id === ressourceId);
            cleStockage = 'grillesTemplates';
            break;
        case 'echelle':
            const echelles = await db.get('echellesTemplates') || [];
            ressource = echelles.find(e => e.id === ressourceId);
            cleStockage = 'echellesTemplates';
            break;
        case 'production':
            const productions = await db.get(cle('productions')) || [];
            ressource = productions.find(p => p.id === ressourceId);
            cleStockage = cle('productions');
            break;
        case 'cartouche':
            // Les cartouches sont stockés par grille, on doit chercher dans toutes
            const grillesTemplates = await db.get('grillesTemplates') || [];
            for (const grille of grillesTemplates) {
                const cartouches = await db.get(`cartouches_${grille.id}`) || [];
                ressource = cartouches.find(c => c.id === ressourceId);
                if (ressource) {
                    cleStockage = `cartouches_${grille.id}`;
                    break;
                }
            }
            break;
        case 'pratique':
            // 🆕 Beta 95.4 : Support des pratiques
            const pratiques = await db.get('pratiques_configurations') || [];
            ressource = pratiques.find(p => p.id === ressourceId);
            cleStockage = 'pratiques_configurations';
            break;
    }

    if (!ressource) {
        alert('Ressource non trouvée');
        return;
    }

    // Créer ou récupérer le modal
    let modal = document.getElementById('modalEditionMetadonnees');
    if (!modal) {
        modal = creerModalEditionMetadonnees();
        document.body.appendChild(modal);
    }

    // Récupérer les métadonnées actuelles
    const meta = ressource.metadata_cc || ressource.metadata || {};

    // Pré-remplir les champs
    document.getElementById('editMetaAuteur').value = meta.auteur_original || meta.auteur || ressource.auteur || '';
    document.getElementById('editMetaInstitution').value = meta.institution || ressource.institution || '';
    document.getElementById('editMetaDiscipline').value = Array.isArray(meta.discipline) ? meta.discipline.join(', ') : (meta.discipline || '');
    document.getElementById('editMetaDescription').value = meta.description_courte || meta.description || ressource.description || '';

    // Stocker le contexte pour la sauvegarde
    modal.dataset.type = typeRessource;
    modal.dataset.id = ressourceId;
    modal.dataset.cle = cleStockage;

    // Afficher le nom de la ressource
    const nomRessource = ressource.nom || ressource.titre || 'Ressource';
    document.getElementById('editMetaTitre').textContent = `Métadonnées : ${nomRessource}`;

    // Afficher le modal
    modal.classList.remove('u-hide');
}

/**
 * Crée le HTML du modal d'édition des métadonnées
 * @returns {HTMLElement}
 */
function creerModalEditionMetadonnees() {
    const modal = document.createElement('div');
    modal.id = 'modalEditionMetadonnees';
    modal.className = 'modal u-hide';
    // z-index: 10001 pour passer au-dessus des modaux de bibliothèque (10000)
    modal.style.cssText = 'display: flex; position: fixed; z-index: 10001; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center;';

    modal.innerHTML = `
        <div class="modal-content modal-js-contenu" style="max-width: 550px;">
            <h2 id="editMetaTitre" style="margin-top: 0; color: var(--bleu-fonce); font-size: 1.2rem;">
                Métadonnées
            </h2>

            <p class="u-texte-09 u-texte-gris u-mb-20">
                Ces informations sont affichées dans la bibliothèque et incluses lors de l'export.
            </p>

            <div class="groupe-form u-mb-15">
                <label for="editMetaAuteur" class="cc-modal-form-label">Auteur</label>
                <input type="text" id="editMetaAuteur" class="controle-form" placeholder="Prénom Nom">
            </div>

            <div class="groupe-form u-mb-15">
                <label for="editMetaInstitution" class="cc-modal-form-label">Institution</label>
                <input type="text" id="editMetaInstitution" class="controle-form" placeholder="Ex: Cégep de Drummondville">
            </div>

            <div class="groupe-form u-mb-15">
                <label for="editMetaDiscipline" class="cc-modal-form-label">Discipline(s)</label>
                <input type="text" id="editMetaDiscipline" class="controle-form" placeholder="Ex: Littérature, Philosophie">
                <small class="u-texte-gris">Séparez plusieurs disciplines par des virgules</small>
            </div>

            <div class="groupe-form u-mb-20">
                <label for="editMetaDescription" class="cc-modal-form-label">Description</label>
                <textarea id="editMetaDescription" class="controle-form" rows="3" placeholder="Brève description de cette ressource..." style="resize: vertical;"></textarea>
            </div>

            <div class="u-flex-gap-10" style="justify-content: flex-end;">
                <button type="button" class="btn btn-annuler" data-action="fermerModalEditionMetadonnees">
                    Annuler
                </button>
                <button type="button" class="btn btn-confirmer" data-action="sauvegarderMetadonnees">
                    Sauvegarder
                </button>
            </div>
        </div>
    `;

    return modal;
}

/**
 * Ferme le modal d'édition des métadonnées
 */
function fermerModalEditionMetadonnees() {
    const modal = document.getElementById('modalEditionMetadonnees');
    if (modal) {
        modal.classList.add('u-hide');
    }
}

/**
 * Sauvegarde les métadonnées modifiées
 */
async function sauvegarderMetadonnees() {
    const modal = document.getElementById('modalEditionMetadonnees');
    if (!modal) return;

    const typeRessource = modal.dataset.type;
    const ressourceId = modal.dataset.id;
    const cleStockage = modal.dataset.cle;

    // Récupérer les valeurs du formulaire
    const auteur = document.getElementById('editMetaAuteur').value.trim();
    const institution = document.getElementById('editMetaInstitution').value.trim();
    const disciplineStr = document.getElementById('editMetaDiscipline').value.trim();
    const description = document.getElementById('editMetaDescription').value.trim();

    // Parser les disciplines
    const disciplines = disciplineStr ? disciplineStr.split(',').map(d => d.trim()).filter(d => d) : [];

    // Mettre à jour la ressource
    let liste = await db.get(cleStockage) || [];
    const index = liste.findIndex(r => r.id === ressourceId);

    if (index === -1) {
        alert('Ressource non trouvée');
        return;
    }

    // Initialiser metadata si nécessaire
    if (!liste[index].metadata_cc && !liste[index].metadata) {
        liste[index].metadata = {};
    }

    // Utiliser metadata_cc si existant, sinon metadata
    const metaKey = liste[index].metadata_cc ? 'metadata_cc' : 'metadata';
    if (!liste[index][metaKey]) {
        liste[index][metaKey] = {};
    }

    // Mettre à jour les champs
    liste[index][metaKey].auteur_original = auteur;
    liste[index][metaKey].institution = institution;
    liste[index][metaKey].discipline = disciplines;
    liste[index][metaKey].description_courte = description;
    liste[index][metaKey].date_modification = new Date().toISOString().split('T')[0];

    // Aussi mettre à jour au niveau ressource pour compatibilité
    if (auteur) liste[index].auteur = auteur;
    if (institution) liste[index].institution = institution;
    if (description) liste[index].description = description;

    // Sauvegarder
    await db.set(cleStockage, liste);

    // Fermer le modal
    fermerModalEditionMetadonnees();

    // Rafraîchir l'affichage du panneau métadonnées
    const panneau = document.querySelector(`.panneau-metadata[data-id="${ressourceId}"]`);
    if (panneau) {
        const nouveauPanneau = genererPanneauMetadonnees(liste[index], typeRessource);
        panneau.outerHTML = nouveauPanneau;
    }

    // Notification
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Métadonnées mises à jour');
    }
}

// ============================================
// 🆕 Beta 95.3 : NOMMAGE STANDARDISÉ EXPORTS
// ============================================

/**
 * Génère un nom de fichier export standardisé
 * Format: type-cours-discipline-date.json
 *
 * @param {string} type - Type de ressource (echelle, grille, production, etc.)
 * @param {Object} options - Options de nommage
 * @param {string} [options.nom] - Nom de l'élément
 * @param {string} [options.cours] - Code du cours
 * @param {string} [options.discipline] - Discipline
 * @param {boolean} [options.inclureLicence] - Ajouter CC-BY-SA au nom
 * @returns {string} Nom de fichier formaté
 */
function genererNomFichierExport(type, options = {}) {
    const nettoyer = (str) => (str || '').replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, '-').replace(/-+/g, '-').toLowerCase();
    const date = new Date().toISOString().split('T')[0];

    // Récupérer infos du cours actif si non fournies
    let cours = options.cours;
    let discipline = options.discipline;

    if ((!cours || !discipline) && typeof db !== 'undefined') {
        const infoCours = db.getSync ? db.getSync('infoCours', {}) : {};
        if (!cours) cours = infoCours?.codeCours || infoCours?.sigle || infoCours?.code || '';
        if (!discipline) discipline = infoCours?.discipline || '';
    }

    // Construire le nom
    const parties = [type];

    if (options.nom) parties.push(nettoyer(options.nom));
    if (cours) parties.push(nettoyer(cours));
    if (discipline) parties.push(nettoyer(discipline));
    if (options.inclureLicence) parties.push('CC-BY-SA');

    parties.push(date);

    return parties.join('-') + '.json';
}

// ============================================
// EXPORTS
// ============================================

window.ajouterMetadonnéesCC = ajouterMetadonnéesCC;
window.genererNomFichierCC = genererNomFichierCC;
window.genererNomFichierExport = genererNomFichierExport; // 🆕 Beta 95.3
window.genererBadgeCC = genererBadgeCC;
window.enregistrerModificationCC = enregistrerModificationCC;
window.demanderAttributionModification = demanderAttributionModification;
window.verifierLicenceCC = verifierLicenceCC;
window.avertirSansLicence = avertirSansLicence;
window.genererBadgeCCPermanent = genererBadgeCCPermanent;
window.demanderMetadonneesEnrichies = demanderMetadonneesEnrichies;
window.demanderMetadonneesConfigComplete = demanderMetadonneesConfigComplete;
window.genererFichierLISEZMOI = genererFichierLISEZMOI;

// Beta 95.1 : Panneau métadonnées et édition
window.genererPanneauMetadonnees = genererPanneauMetadonnees;
window.afficherModalEditionMetadonnees = afficherModalEditionMetadonnees;
window.fermerModalEditionMetadonnees = fermerModalEditionMetadonnees;
window.sauvegarderMetadonnees = sauvegarderMetadonnees;


})();
