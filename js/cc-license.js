/**
 * cc-license.js
 * Module de gestion des licences Creative Commons
 *
 * Gère l'ajout de métadonnées CC BY-SA 4.0 aux exports/imports
 * de matériel pédagogique (grilles, échelles, cartouches, productions)
 */

// ============================================
// MÉTADONNÉES CC PAR DÉFAUT
// ============================================

const CC_LICENSE_DEFAULTS = {
    licence: "CC BY-SA 4.0",
    licence_url: "https://creativecommons.org/licenses/by-sa/4.0/",
    licence_resume: "Attribution-ShareAlike 4.0 International",
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
 * @returns {Object} - Objet avec métadonnées CC
 */
function ajouterMetadonnéesCC(contenu, type, nom) {
    const date_actuelle = new Date().toISOString().split('T')[0];

    return {
        metadata: {
            ...CC_LICENSE_DEFAULTS,
            type: type,
            nom: nom,
            date_creation: contenu.metadata?.date_creation || date_actuelle,
            date_modification: date_actuelle,
            version: contenu.metadata?.version || "1.0",
            contributeurs: contenu.metadata?.contributeurs || [],
            attribution: `Créé par ${CC_LICENSE_DEFAULTS.auteur_original} pour l'application Monitorage Pédagogique`
        },
        contenu: contenu
    };
}

/**
 * Génère le nom de fichier avec métadonnées CC
 * @param {string} type - Type de contenu
 * @param {string} nom - Nom du contenu
 * @param {string} version - Version
 * @returns {string} - Nom de fichier formaté
 */
function genererNomFichierCC(type, nom, version) {
    const nomNettoye = nom.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    return `${type}-${nomNettoye}-CC-BY-SA-v${version}-${date}.json`;
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
            <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg"
                 alt="CC BY-SA 4.0">

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
                    <li class="cc-condition-obligation">Partager sous la même licence (CC BY-SA 4.0)</li>
                </ul>
            </div>

            <p class="cc-metadata">
                Version <span class="cc-metadata-version">${metadata.version}</span> •
                Créé le ${metadata.date_creation} •
                Modifié le ${metadata.date_modification}
            </p>

            <a href="${metadata.licence_url}" target="_blank" class="cc-badge-lien">
                En savoir plus sur la licence CC BY-SA 4.0 →
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
 * Affiche une alerte si le matériel n'a pas de licence CC
 * @param {Object} donnees - Données importées
 */
function avertirSansLicence(donnees) {
    if (!verifierLicenceCC(donnees)) {
        alert(
            "⚠️ Ce matériel n'a pas de licence Creative Commons.\n\n" +
            "Il pourrait être protégé par le droit d'auteur traditionnel.\n" +
            "Assurez-vous d'avoir les droits nécessaires avant de l'utiliser."
        );
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
            <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg"
                 alt="CC BY-SA 4.0">

            <p class="cc-badge-titre">Matériel partagé sous licence libre</p>

            <p class="cc-badge-auteur">
                Ce matériel pédagogique est partagé sous licence
                <strong>CC BY-SA 4.0</strong> (Attribution-ShareAlike).
            </p>

            <div class="cc-badge-conditions">
                <p>
                    Vous pouvez librement partager, modifier et réutiliser ce matériel,
                    même à des fins commerciales, à condition d'attribuer les auteurs originaux
                    et de partager vos modifications sous la même licence.
                </p>
            </div>

            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" class="cc-badge-lien">
                En savoir plus sur la licence CC BY-SA 4.0 →
            </a>
        </div>
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
