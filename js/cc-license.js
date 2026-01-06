/**
 * cc-license.js
 * Module de gestion des licences Creative Commons
 *
 * Gère l'ajout de métadonnées CC BY-NC-SA 4.0 aux exports/imports
 * de matériel pédagogique (grilles, échelles, cartouches, productions)
 */

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

    // 🆕 BETA 92: Utiliser les métadonnées enrichies du modal (avec checkboxes)
    // Si metaEnrichies contient auteur/courriel/siteWeb, les utiliser; sinon, fallback sur infoCours
    const infoCours = JSON.parse(localStorage.getItem('infoCours') || '{}');

    const auteur_utilisateur = metaEnrichies.auteur ||
                               infoCours.enseignant ||
                               CC_LICENSE_DEFAULTS.auteur_original;

    const email_utilisateur = metaEnrichies.courriel ||
                             infoCours.courriel ||
                             CC_LICENSE_DEFAULTS.email_auteur;

    const site_utilisateur = metaEnrichies.siteWeb ||
                            infoCours.siteWeb ||
                            CC_LICENSE_DEFAULTS.site_auteur;

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
            attribution: `Créé par ${auteur_original} pour l'application Monitorage Pédagogique`,
            // 🆕 BETA 92: Métadonnées enrichies avec discipline, niveau et institution
            discipline: metaEnrichies.discipline || contenu.metadata?.discipline || [],
            niveau: metaEnrichies.niveau || contenu.metadata?.niveau || "",
            institution: metaEnrichies.institution || contenu.metadata?.institution || "",
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
            <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg"
                 alt="CC BY-NC-SA 4.0">

            <p class="cc-badge-titre">${metadata.nom || 'Matériel pédagogique'}</p>

            <p class="cc-badge-auteur">
                <strong>Créé par :</strong> ${metadata.auteur_original}
            </p>

            ${contributeurs_html}

            <div class="cc-badge-conditions">
                <h4>Vous pouvez :</h4>
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
        "Votre nom (pour l'attribution Creative Commons) :",
        "Votre nom"
    );

    if (!nom || nom === "Votre nom") {
        return null; // Annulé
    }

    const description = prompt(
        "Brève description de vos modifications :",
        "Ajustements personnalisés"
    );

    if (!description) {
        return null; // Annulé
    }

    return { nom, description };
}

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
        console.log('ℹ️ Matériel importé sans métadonnées CC (usage normal)');
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
            <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg"
                 alt="CC BY-NC-SA 4.0">

            <p class="cc-badge-titre">Matériel partagé sous licence libre</p>

            <p class="cc-badge-auteur">
                Ce matériel pédagogique est partagé sous licence
                <strong>CC BY-NC-SA 4.0</strong> (Attribution - Pas d'utilisation commerciale - Partage dans les mêmes conditions).
            </p>

            <div class="cc-badge-conditions">
                <p>
                    Vous pouvez librement partager, modifier et réutiliser ce matériel à des fins éducatives,
                    à condition d'attribuer les auteurs originaux, de ne pas en faire usage commercial,
                    et de partager vos modifications sous la même licence. Cette licence protège le travail des enseignants
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

        // 🆕 BETA 92: Lire les informations de l'utilisateur depuis infoCours ET listeCours
        const infoCours = JSON.parse(localStorage.getItem('infoCours') || '{}');
        const listeCours = JSON.parse(localStorage.getItem('listeCours') || '[]');
        const coursActif = listeCours.find(c => c.actif) || listeCours[0] || {};

        // Construire le nom complet (prioriser listeCours puis infoCours)
        const prenom = coursActif.prenomEnseignant || infoCours.prenomEnseignant || infoCours.enseignant || '';
        const nom = coursActif.nomEnseignant || infoCours.nomEnseignant || '';
        const nomComplet = [prenom, nom].filter(Boolean).join(' ');

        const courriel = coursActif.courriel || infoCours.courriel || '';
        const siteWeb = coursActif.siteWeb || infoCours.siteWeb || '';
        const discipline = coursActif.discipline || infoCours.discipline || '';
        const institution = coursActif.institution || infoCours.institution || '';

        console.log('[CC Export] Pré-remplissage:', { nomComplet, courriel, siteWeb, discipline, institution });

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
        document.getElementById('metaDescription').value = '';
        document.getElementById('metaDescriptionCompteur').textContent = '0/200';

        // 🆕 Réinitialiser les checkboxes (intelligentes : cochées si valeur présente)
        document.getElementById('checkPartagerNom').checked = true;
        document.getElementById('checkPartagerCourriel').checked = !!courriel;
        document.getElementById('checkPartagerSiteWeb').checked = !!siteWeb;
        document.getElementById('checkPartagerDiscipline').checked = !!discipline;
        document.getElementById('checkPartagerInstitution').checked = !!institution;
        document.getElementById('checkPartagerNiveau').checked = true;
        document.getElementById('zoneClarification').style.display = 'none';

        // Afficher le modal
        modal.style.display = 'flex';

        // 🆕 Gérer la checkbox "Partager mon nom" → afficher/masquer la zone de clarification
        const checkNom = document.getElementById('checkPartagerNom');
        const zoneClarif = document.getElementById('zoneClarification');

        checkNom.onchange = function() {
            if (!this.checked) {
                zoneClarif.style.display = 'block';
            } else {
                zoneClarif.style.display = 'none';
            }
        };

        // Gestionnaire de fermeture
        const fermer = (resultat) => {
            modal.style.display = 'none';
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
                    alert('Veuillez préciser votre intention de partage.');
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
    modal.className = 'modal';
    modal.style.cssText = 'display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center;';

    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 30px; border-radius: 8px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <h2 style="margin-top: 0; color: var(--bleu-leger); display: flex; align-items: center; justify-content: space-between;">
                <span>📦 Métadonnées d'export</span>
                <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank"
                   style="font-size: 0.75rem; color: var(--bleu-leger); text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <img src="https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by-nc-sa.svg"
                         alt="CC BY-NC-SA 4.0" style="height: 15px;">
                    En savoir plus
                </a>
            </h2>

            <p style="color: var(--gris-leger); margin-bottom: 20px;">
                Vous exportez : <strong id="metaTypeContenu"></strong><br>
                <span style="font-size: 0.9rem;" id="metaNomContenu"></span>
            </p>

            <!-- Section 1: Informations personnelles -->
            <h3 style="font-size: 1rem; color: var(--bleu-moyen); margin-top: 20px; margin-bottom: 10px;">
                Informations personnelles
            </h3>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <input type="checkbox" id="checkPartagerNom" checked style="transform: scale(1.2); flex-shrink: 0;">
                <label for="checkPartagerNom" style="font-weight: 600; min-width: 150px; margin: 0;">Nom</label>
                <input type="text" id="metaNomAuteur"
                       style="flex: 1; padding: 8px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <input type="checkbox" id="checkPartagerCourriel" checked style="transform: scale(1.2); flex-shrink: 0;">
                <label for="checkPartagerCourriel" style="font-weight: 600; min-width: 150px; margin: 0;">Courriel</label>
                <input type="email" id="metaCourriel"
                       style="flex: 1; padding: 8px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <input type="checkbox" id="checkPartagerSiteWeb" checked style="transform: scale(1.2); flex-shrink: 0;">
                <label for="checkPartagerSiteWeb" style="font-weight: 600; min-width: 150px; margin: 0;">Site web</label>
                <input type="url" id="metaSiteWeb"
                       style="flex: 1; padding: 8px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <!-- Zone de clarification (cachée par défaut) -->
            <div id="zoneClarification" style="display: none; background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0 0 15px 0; font-weight: 600; color: #856404;">
                    ⚠️ Clarification nécessaire
                </p>
                <p style="margin: 0 0 15px 0; font-size: 0.9rem; color: #856404;">
                    Pourquoi ne voulez-vous pas partager votre nom ?
                </p>
                <label style="display: flex; align-items: start; margin-bottom: 10px; cursor: pointer;">
                    <input type="radio" name="intentionPartage" value="anonyme" style="margin-right: 10px; margin-top: 3px;">
                    <span style="font-size: 0.9rem; line-height: 1.5;">
                        <strong>Je veux partager anonymement</strong><br>
                        <small style="color: var(--gris-leger);">Le matériel sera sous licence CC BY-NC-SA mais marqué "Auteur anonyme"</small>
                    </span>
                </label>
                <label style="display: flex; align-items: start; cursor: pointer;">
                    <input type="radio" name="intentionPartage" value="prive" style="margin-right: 10px; margin-top: 3px;">
                    <span style="font-size: 0.9rem; line-height: 1.5;">
                        <strong>Je ne veux pas partager ce matériel</strong><br>
                        <small style="color: var(--gris-leger);">Usage privé/personnel uniquement (annule l'export)</small>
                    </span>
                </label>
            </div>

            <!-- Section 2: Informations contextuelles -->
            <h3 style="font-size: 1rem; color: var(--bleu-moyen); margin-top: 20px; margin-bottom: 10px;">
                Informations contextuelles
            </h3>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <input type="checkbox" id="checkPartagerDiscipline" checked style="transform: scale(1.2); flex-shrink: 0;">
                <label for="checkPartagerDiscipline" style="font-weight: 600; min-width: 150px; margin: 0;">Discipline(s)</label>
                <input type="text" id="metaDisciplines"
                       placeholder="Ex: Littérature, Philosophie"
                       style="flex: 1; padding: 8px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <input type="checkbox" id="checkPartagerInstitution" style="transform: scale(1.2); flex-shrink: 0;">
                <label for="checkPartagerInstitution" style="font-weight: 600; min-width: 150px; margin: 0;">Institution</label>
                <input type="text" id="metaInstitution"
                       placeholder="Ex: Cégep de Drummondville"
                       style="flex: 1; padding: 8px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <input type="checkbox" id="checkPartagerNiveau" checked style="transform: scale(1.2); flex-shrink: 0;">
                <label for="checkPartagerNiveau" style="font-weight: 600; min-width: 150px; margin: 0;">Niveau</label>
                <select id="metaNiveau"
                        style="flex: 1; padding: 8px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
                    <option value="">-- Non spécifié --</option>
                    <option value="Collégial" selected>Collégial</option>
                    <option value="Universitaire">Universitaire</option>
                    <option value="Secondaire">Secondaire</option>
                </select>
            </div>

            <!-- Section 3: Description (obligatoire) -->
            <h3 style="font-size: 1rem; color: var(--bleu-moyen); margin-top: 20px; margin-bottom: 15px;">
                Description du contenu <span style="color: red;">*</span>
            </h3>

            <div style="margin-bottom: 25px;">
                <textarea id="metaDescription"
                          placeholder="Décrivez brièvement ce contenu pédagogique..."
                          maxlength="200"
                          style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem; font-family: inherit; resize: vertical;"></textarea>
                <small style="color: var(--gris-leger); display: block; margin-top: 5px;">
                    <span id="metaDescriptionCompteur">0/200</span> caractères
                </small>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="btnAnnulerMeta"
                        class="btn"
                        style="background: var(--gris-pale); color: var(--gris-fonce);">
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
        modal.style.display = 'flex';

        // Gestionnaire de fermeture
        const fermer = (resultat) => {
            modal.style.display = 'none';
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
                alert('Le nom de votre pratique est obligatoire');
                return;
            }
            if (!auteur) {
                alert('Votre nom est obligatoire');
                return;
            }
            if (!description) {
                alert('Une description de votre pratique est obligatoire');
                return;
            }
            if (!licenceAccept) {
                alert('Vous devez accepter de partager sous licence CC BY-NC-SA 4.0');
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
    modal.className = 'modal';
    modal.style.cssText = 'display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; overflow-y: auto; padding: 20px 0;';

    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 30px; border-radius: 8px; max-width: 700px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3); margin: auto;">
            <h2 style="margin-top: 0; color: var(--bleu-leger);">
                📦 Partager ma pratique complète
            </h2>

            <p style="color: var(--gris-leger); margin-bottom: 20px; background: var(--bleu-tres-pale); padding: 15px; border-radius: 4px;">
                Vous êtes sur le point d'exporter <strong id="configNbRessources"></strong> ressource(s) pédagogique(s).<br>
                Ces ressources seront partagées avec d'autres enseignant·es.
            </p>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Nom de votre pratique <span style="color: red;">*</span>
                </label>
                <input type="text"
                       id="configNom"
                       placeholder="Ex: PAN avec évaluation par compétences"
                       style="width: 100%; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Votre nom <span style="color: red;">*</span>
                </label>
                <input type="text"
                       id="configAuteur"
                       placeholder="Ex: Grégoire Bédard"
                       style="width: 100%; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Discipline(s) <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <input type="text"
                       id="configDisciplines"
                       placeholder="Ex: Littérature, Philosophie"
                       style="width: 100%; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Niveau <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <select id="configNiveau"
                        style="width: 100%; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
                    <option value="">-- Non spécifié --</option>
                    <option value="Collégial" selected>Collégial</option>
                    <option value="Universitaire">Universitaire</option>
                    <option value="Secondaire">Secondaire</option>
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Description de votre pratique <span style="color: red;">*</span>
                </label>
                <textarea id="configDescription"
                          placeholder="Décrivez votre approche pédagogique, vos principes d'évaluation, les objectifs visés..."
                          maxlength="500"
                          style="width: 100%; height: 120px; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem; font-family: inherit; resize: vertical;"></textarea>
                <small style="color: var(--gris-leger); display: block; margin-top: 5px;">
                    <span id="configDescriptionCompteur">0/500</span> caractères
                </small>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Votre courriel <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <input type="email"
                       id="configEmail"
                       placeholder="Ex: nom@cegep.qc.ca"
                       style="width: 100%; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">
                    Votre site web <span style="color: var(--gris-leger); font-weight: normal;">(optionnel)</span>
                </label>
                <input type="url"
                       id="configSite"
                       placeholder="Ex: https://monsite.com"
                       style="width: 100%; padding: 10px; border: 1px solid var(--bleu-pale); border-radius: 4px; font-size: 0.95rem;">
            </div>

            <div style="background: #fff8e1; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <label style="display: flex; align-items: start; cursor: pointer;">
                    <input type="checkbox" id="configLicenceAccept" style="margin-right: 10px; margin-top: 4px; transform: scale(1.3);">
                    <span style="font-size: 0.9rem; line-height: 1.5;">
                        <strong>J'accepte de partager cette configuration sous licence CC BY-NC-SA 4.0</strong><br>
                        <small style="color: var(--gris-leger);">
                            Cela signifie que d'autres enseignant·es pourront utiliser, modifier et partager votre travail,
                            à condition de vous attribuer la paternité, de ne pas en faire usage commercial,
                            et de partager sous la même licence.
                        </small>
                    </span>
                </label>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="btnAnnulerConfig"
                        class="btn"
                        style="background: var(--gris-pale); color: var(--gris-fonce);">
                    Annuler
                </button>
                <button id="btnValiderConfig"
                        class="btn btn-primaire"
                        style="background: var(--bleu-leger); color: white;">
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
3. Cliquez sur "Importer une configuration complète"
4. Sélectionnez le fichier téléchargé
5. L'application importera automatiquement toutes les ressources
6. Vous pourrez ensuite modifier la configuration selon vos besoins

-------------------------------------------
BESOIN D'AIDE ?
-------------------------------------------

Labo Codex : https://codexnumeris.org/labocodex/
Courriel : labo@codexnumeris.org

-------------------------------------------
ATTRIBUTION
-------------------------------------------

Si vous utilisez ou adaptez cette pratique, veuillez mentionner :
"Basé sur la pratique de ${metadata.auteur} - ${metadata.nom}"

-------------------------------------------
LICENCE CC BY-NC-SA 4.0
-------------------------------------------

Cette configuration pédagogique est partagée sous licence
Creative Commons Attribution - Pas d'utilisation commerciale
- Partage dans les mêmes conditions 4.0 International.

Vous êtes libre de :
- Partager : copier et redistribuer le matériel
- Adapter : remixer, transformer et créer à partir du matériel

Selon les conditions suivantes :
- Attribution : Vous devez créditer l'auteur original
- Pas d'utilisation commerciale : Vous ne pouvez pas utiliser
  le matériel à des fins commerciales
- Partage dans les mêmes conditions : Si vous modifiez ou créez
  à partir du matériel, vous devez diffuser vos contributions
  sous la même licence

Plus d'informations : https://creativecommons.org/licenses/by-nc-sa/4.0/

-------------------------------------------

Exporté le ${metadata.date_export} - Version ${metadata.application_version}
${metadata.email_auteur ? `Contact : ${metadata.email_auteur}` : ''}
${metadata.site_auteur ? `Site : ${metadata.site_auteur}` : ''}
`;
}

// ============================================
// EXPORTS
// ============================================

window.ajouterMetadonnéesCC = ajouterMetadonnéesCC;
window.genererNomFichierCC = genererNomFichierCC;
window.genererBadgeCC = genererBadgeCC;
window.enregistrerModificationCC = enregistrerModificationCC;
window.demanderAttributionModification = demanderAttributionModification;
window.verifierLicenceCC = verifierLicenceCC;
window.avertirSansLicence = avertirSansLicence;
window.genererBadgeCCPermanent = genererBadgeCCPermanent;
window.demanderMetadonneesEnrichies = demanderMetadonneesEnrichies;
window.demanderMetadonneesConfigComplete = demanderMetadonneesConfigComplete;
window.genererFichierLISEZMOI = genererFichierLISEZMOI;
