/* ===============================
   MODULE 08: GESTION DES COURS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration technique des cours :
   code, nom, compétences, enseignant·e, session, horaires.
   
   Contenu de ce module:
   - Affichage du tableau des cours
   - Ajout/modification de cours
   - Duplication de cours
   - Activation d'un cours (cours actif)
   - Suppression de cours
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, coursEnEdition
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #tableauCoursContainer : Conteneur du tableau
   - #nombreCours : Nombre total de cours
   - #sessionActive : Session du cours actif
   - #resumeCours : Résumé du cours actif
   - #btnAjouterCours : Bouton d'ajout
   - #formulaireCours : Formulaire d'ajout/édition
   - #titreFormCours : Titre du formulaire
   - #btnTexteCours : Texte du bouton de sauvegarde
   - Champs du formulaire : voir structure ci-dessous
   
   LocalStorage utilisé:
   - 'cours' : Array des cours configurés
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Migre les cours existants pour ajouter le champ pratiqueId
 *
 * CONTEXTE:
 * Les cours créés avant l'implémentation de l'association pratique ↔ cours
 * n'ont pas de champ pratiqueId. Cette fonction ajoute automatiquement
 * la pratique par défaut (pan-maitrise) aux cours qui n'en ont pas.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Pour chaque cours sans pratiqueId, ajoute 'pan-maitrise'
 * 3. Sauvegarde les cours modifiés
 *
 * @returns {number} - Nombre de cours migrés
 */
function migrerCoursVersPratiques() {
    const cours = db.getSync('cours', []);
    let nbMigres = 0;

    cours.forEach(c => {
        if (!c.pratiqueId) {
            c.pratiqueId = 'pan-standards'; // Pratique par défaut
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('cours', cours);
    }

    return nbMigres;
}

/**
 * Migre les cours existants pour ajouter le flag dansBibliotheque
 *
 * CONTEXTE:
 * Avec le nouveau système de bibliothèque, tous les cours doivent avoir
 * un flag dansBibliotheque pour contrôler leur visibilité.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Pour chaque cours sans flag, ajoute dansBibliotheque: true (visible par défaut)
 * 3. Sauvegarde les cours modifiés
 *
 * @returns {number} - Nombre de cours migrés
 */
function migrerCoursDansBibliotheque() {
    const cours = db.getSync('cours', []);
    let nbMigres = 0;

    cours.forEach(c => {
        if (c.dansBibliotheque === undefined) {
            c.dansBibliotheque = true; // Par défaut, tous les cours existants restent visibles
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('cours', cours);
    }

    return nbMigres;
}

/* ===============================
   HELPER: Peupler sélecteur trimestre (Beta 93.5)
   =============================== */
/**
 * Peuple le sélecteur de trimestre dans le formulaire cours
 *
 * BETA 93.5: Version simplifiée - génère options depuis cours existants
 * BETA 94: Lira depuis une liste de trimestres configurés
 */
function peupleSelecteurTrimestre() {
    const select = document.getElementById('trimestreId');
    if (!select) return;

    const cours = db.getSync('cours', []);

    // Extraire trimestres uniques
    const trimestres = new Set();
    cours.forEach(c => {
        if (c.trimestreId) {
            trimestres.add(c.trimestreId);
        }
    });

    // Effacer options existantes (sauf la première)
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Ajouter les trimestres existants
    Array.from(trimestres).sort().forEach(tId => {
        const option = document.createElement('option');
        option.value = tId;

        // Formater le label: "h2026" → "Hiver 2026", "e2025" → "Été 2025"
        const session = window.nomSession ? window.nomSession(tId.charAt(0)) : tId.charAt(0);
        const annee = tId.substring(1);
        option.textContent = `${session} ${annee}`;

        select.appendChild(option);
    });

    // Si aucun trimestre, ajouter un par défaut depuis le calendrier
    if (trimestres.size === 0) {
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        if (calendrier.dateDebut) {
            // Extraire année depuis dateDebut (format: YYYY-MM-DD)
            const annee = calendrier.dateDebut.substring(0, 4);
            // Déduire la session (3 sessions : H/E/A) depuis le mois de début
            const mois = parseInt(calendrier.dateDebut.substring(5, 7));
            const session = (window.sessionDepuisMois ? window.sessionDepuisMois(mois) : (mois <= 6 ? 'H' : 'A')).toLowerCase();
            const trimestreId = session + annee;

            const option = document.createElement('option');
            option.value = trimestreId;
            option.textContent = `${window.nomSession ? window.nomSession(session) : session} ${annee}`;
            select.appendChild(option);
        }
    }
}

/**
 * Initialise le module de gestion des cours
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Exécute les migrations nécessaires
 * 3. Charge et affiche le tableau des cours
 *
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleCours() {
    migrerCoursVersPratiques();
    migrerCoursDansBibliotheque();
}

/* ===============================
   🔄 DUPLICATION
   =============================== */
/**
 * Duplique un cours pour le trimestre actuellement actif
 * Utilisé depuis le modal Bibliothèque pour créer une copie dans un nouveau trimestre
 *
 * FONCTIONNEMENT:
 * 1. Récupère le cours original
 * 2. Obtient le trimestre actif (session + année)
 * 3. Crée une copie avec session/année du trimestre actif
 * 4. Génère un nouvel ID et trimestreId
 * 5. Sauvegarde et rafraîchit
 *
 * @param {string} id - ID du cours à dupliquer
 */
function dupliquerCoursPourTrimestreActif(id) {
    const cours = db.getSync('cours', []);
    const coursOriginal = cours.find(c => c.id === id);

    if (!coursOriginal) {
        alert('Cours introuvable');
        return;
    }

    // Obtenir le trimestre actif
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif) || trimestres[0];

    if (!trimestreActif) {
        alert('Aucun trimestre actif. Veuillez d\'abord créer un trimestre.');
        return;
    }

    // Créer la copie avec les infos du nouveau trimestre
    const nouveauCours = {
        ...coursOriginal,
        id: genererIdUnique('COURS_'),
        session: trimestreActif.session,
        annee: trimestreActif.annee,
        trimestreId: trimestreActif.id,
        dateEnregistrement: new Date().toISOString(),
        dansBibliotheque: true,
        actif: false,
        verrouille: false
    };

    // Ne pas copier le suffixe "(copie)" si déjà présent
    if (!nouveauCours.codeCours.includes('(copie)')) {
        // Garder le code original, pas de suffixe
    }

    cours.push(nouveauCours);
    db.setSync('cours', cours);

    // Fermer le modal et rafraîchir
    fermerModalBibliothequeCours();

    // Rafraîchir le dropdown V2 si disponible
    if (typeof chargerDropdownCoursV2 === 'function') {
        chargerDropdownCoursV2();
    }

    notifications.succes(`Cours dupliqué pour ${trimestreActif.nom} !`);
}

/* ===============================
   MODAL BIBLIOTHÈQUE (Simplifié, sans CC)
   =============================== */

/**
 * Ouvre le modal de la bibliothèque de cours
 *
 * FONCTIONNEMENT:
 * - Section 1 : Cours dans ma sélection (dansBibliotheque === true)
 * - Section 2 : Cours disponibles à ajouter (dansBibliotheque === false)
 * - Boutons simplifiés (sans export/import avec métadonnées CC)
 *
 * NOTE: Contrairement aux productions/grilles, les cours ne nécessitent
 * PAS de métadonnées CC car il s'agit de données ministérielles publiques
 */
async function ouvrirModalBibliothequeCours() {
    const tousLesCours = await db.get('cours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);
    const coursDisponibles = tousLesCours.filter(c => c.dansBibliotheque === false);

    // Phase C #267 — migration vers BibliothequeUI (carte + menu ⋮)
    let contenuSection1 = '';
    if (coursDansBibliotheque.length === 0) {
        contenuSection1 = '<p class="text-muted" style="font-style: italic; padding: 20px 0;">Aucun cours dans ta sélection</p>';
    } else {
        coursDansBibliotheque.forEach(cours => {
            const actifBadge = cours.actif ? '<span class="badge-info" style="margin-left: 10px;">Actif</span>' : '';
            const titre = echapperHtml(cours.codeCours) + ' - ' + echapperHtml(cours.nomCours) + actifBadge;
            const ens = (echapperHtml(cours.prenomEnseignant || '') + ' ' + echapperHtml(cours.nomEnseignant || '')).trim();
            const sess = echapperHtml((cours.session || '') + (cours.annee || ''));
            const meta = [ens, sess].filter(Boolean).join(' • ');
            contenuSection1 += BibliothequeUI.renderCarteSelection({
                nom: titre,
                id: cours.id,
                badgeSource: '',
                metadonnees: meta,
                description: cours.competence || '',
                boutonPrincipal: { label: 'Reprendre dans ce trimestre', action: 'dupliquerCoursPourTrimestreActif', param: cours.id, classe: 'btn-confirmer', title: 'Créer une copie de ce cours pour le trimestre actif' },
                actionsMenu: [
                    { label: 'Exporter', action: 'partagerCours', param: cours.id, classe: 'btn-secondaire', title: 'Exporter ce cours en JSON pour le partager' },
                    { label: 'Retirer', action: 'retirerCoursDeBibliotheque', param: cours.id, classe: 'btn-supprimer', title: 'Retirer de ta sélection' }
                ]
            });
        });
    }

    const boutonsApresSection1 = '<div style="text-align: center; margin-top: 15px;">' +
        '<button data-action="partagerTousLesCours" class="btn btn-secondaire" title="Exporter tous tes cours en un seul fichier JSON">Exporter tous mes cours</button>' +
        '</div>';

    let contenuSection2 = '';
    if (coursDisponibles.length === 0) {
        contenuSection2 = '<p class="text-muted" style="font-style: italic; padding: 20px 0;">Aucun cours disponible</p>';
    } else {
        coursDisponibles.forEach(cours => {
            const titre = echapperHtml(cours.codeCours) + ' - ' + echapperHtml(cours.nomCours);
            const sess = echapperHtml((cours.session || '') + (cours.annee || ''));
            contenuSection2 += BibliothequeUI.renderCarteDisponible({
                nom: titre,
                id: cours.id,
                badgeSource: '',
                metadonnees: sess,
                description: cours.competence || '',
                dejaPresent: false,
                boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterCoursIndividuel', param: cours.id, classe: 'btn-confirmer', title: 'Ajouter ce cours à ta sélection' }
            });
        });
        contenuSection2 += '<div style="text-align: center; margin-top: 15px;">' +
            '<button data-action="ouvrirFilePickerImportCours" class="btn btn-confirmer" title="Importer des cours depuis un fichier JSON">Importer des cours</button>' +
            '<input type="file" id="fichier-import-cours-modal" accept=".json" style="display: none;" data-on-change="importerCoursSimple">' +
            '</div>';
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeCours',
        titre: 'Bibliothèque de cours',
        sousTitre: 'Gère tes configurations de cours',
        onFermerAction: 'fermerModalBibliothequeCours',
        doublonsHTML: '',
        titreSection1: 'Cours dans ta sélection (' + coursDansBibliotheque.length + ')',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        titreSection2: 'Cours disponibles à ajouter',
        filtresSection2: '',
        contenuSection2: contenuSection2
    });
}

/**
 * Ferme le modal de la bibliothèque (Phase C #267 — passe par BibliothequeUI)
 */
function fermerModalBibliothequeCours() {
    BibliothequeUI.fermerModal('modalBibliothequeCours');
}

/**
 * Retire un cours de la sélection (passe dansBibliotheque à false)
 *
 * @param {string} id - ID du cours à retirer
 */
async function retirerCoursDeBibliotheque(id) {
    const cours = await db.get('cours') || [];
    const coursIndex = cours.findIndex(c => c.id === id);

    if (coursIndex !== -1) {
        cours[coursIndex].dansBibliotheque = false;
        cours[coursIndex].actif = false; // Un cours retiré ne peut plus être actif

        await db.set('cours', cours);
        fermerModalBibliothequeCours();
        alert('Cours retiré de ta sélection');
    }
}

/**
 * Ajoute un cours à la sélection (passe dansBibliotheque à true)
 *
 * @param {string} id - ID du cours à ajouter
 */
async function ajouterCoursIndividuel(id) {
    const cours = await db.get('cours') || [];
    const coursIndex = cours.findIndex(c => c.id === id);

    if (coursIndex !== -1) {
        cours[coursIndex].dansBibliotheque = true;

        await db.set('cours', cours);
        fermerModalBibliothequeCours();
        alert('Cours ajouté à ta sélection avec succès !');
    }
}

/* ===============================
   EXPORT/IMPORT SIMPLIFIÉS (Sans métadonnées CC)
   =============================== */

/**
 * Exporte les cours de la sélection au format JSON simple
 *
 * FONCTIONNEMENT:
 * - Exporte tous les cours avec dansBibliotheque === true
 * - Format JSON simple sans métadonnées CC (données ministérielles)
 * - Nom fichier : cours-YYYY-MM-DD.json
 */
async function exporterCoursSimple() {
    const tousLesCours = await db.get('cours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);

    if (coursDansBibliotheque.length === 0) {
        alert('Aucun cours à exporter dans ta sélection');
        return;
    }

    // Créer le JSON
    const dataStr = JSON.stringify(coursDansBibliotheque, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Générer nom de fichier avec date
    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichier = `cours-${dateStr}.json`;

    // Télécharger
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);

    alert(`${coursDansBibliotheque.length} cours exportés avec succès !`);
}

/**
 * Importe des cours depuis un fichier JSON
 *
 * FONCTIONNEMENT:
 * - Lit le fichier JSON
 * - Vérifie les doublons par codeCours + session + annee
 * - Ajoute les cours (dansBibliotheque = false par défaut)
 * - Génère de nouveaux IDs pour éviter conflits
 *
 * @param {Event} event - Événement de changement du input file
 */
async function importerCoursSimple(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    var file = target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const coursImportes = JSON.parse(e.target.result);

            if (!Array.isArray(coursImportes)) {
                alert('Format de fichier invalide : doit être un tableau de cours');
                return;
            }

            const coursExistants = await db.get('cours') || [];
            let nbAjoutes = 0;
            let nbDoublons = 0;

            coursImportes.forEach(coursImporte => {
                // Vérifier doublon (même code + session + année)
                const doublon = coursExistants.find(c =>
                    c.codeCours === coursImporte.codeCours &&
                    c.session === coursImporte.session &&
                    c.annee === coursImporte.annee
                );

                if (doublon) {
                    nbDoublons++;
                } else {
                    // Ajouter avec nouvel ID et flag dansBibliotheque = false
                    const nouveauCours = {
                        ...coursImporte,
                        id: genererIdUnique('COURS_'),
                        dansBibliotheque: false, // Disponible à ajouter
                        actif: false, // Les cours importés ne sont jamais actifs par défaut
                        dateEnregistrement: new Date().toISOString()
                    };

                    coursExistants.push(nouveauCours);
                    nbAjoutes++;
                }
            });

            if (nbAjoutes > 0) {
                await db.set('cours', coursExistants);
            }

            // Message récapitulatif
            let message = `Import terminé :\n`;
            message += `✓ ${nbAjoutes} cours ajoutés\n`;
            if (nbDoublons > 0) {
                message += `• ${nbDoublons} doublon(s) ignoré(s)`;
            }

            alert(message);

            // Fermer et rafraîchir
            fermerModalBibliothequeCours();
            await ouvrirModalBibliothequeCours();

        } catch (error) {
            console.error('Erreur lors de l\'import :', error);
            alert('Erreur lors de l\'import du fichier. Vérifie le format JSON.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    target.value = '';
}

/* ===============================
   PARTAGE AVEC MÉTADONNÉES CC
   =============================== */

/**
 * Partage un cours individuel avec métadonnées Creative Commons
 *
 * FONCTIONNEMENT:
 * 1. Demande les métadonnées CC enrichies à l'utilisateur
 * 2. Marque le cours comme partagé (dansBibliotheque = false)
 * 3. Ajoute les métadonnées CC au cours
 * 4. Rafraîchit le modal et la sidebar
 *
 * @param {string} id - ID du cours à partager
 */
async function partagerCours(id) {
    try {
        const cours = await db.get('cours') || [];
        const coursAPartager = cours.find(c => c.id === id);

        if (!coursAPartager) {
            alert('Cours introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const nomAffiche = `${coursAPartager.codeCours} - ${coursAPartager.nomCours}`;
        const metadata = await demanderMetadonneesEnrichies('cours', nomAffiche);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagé (retirer de ma sélection)
        coursAPartager.dansBibliotheque = false;

        // Ajouter métadonnées CC
        coursAPartager.metadata_cc = metadata;

        // Sauvegarder
        await db.set('cours', cours);

        // Rafraîchir modal
        fermerModalBibliothequeCours();
        await ouvrirModalBibliothequeCours();

        alert('Cours partagé avec succès !\n\nIl est maintenant disponible dans la section "Cours disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage du cours');
    }
}

/**
 * Partage tous les cours de la sélection avec métadonnées Creative Commons
 *
 * FONCTIONNEMENT:
 * 1. Demande les métadonnées CC globales
 * 2. Exporte tous les cours avec métadonnées
 * 3. Génère fichier JSON téléchargeable
 */
async function partagerTousLesCours() {
    const tousLesCours = await db.get('cours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);

    if (coursDansBibliotheque.length === 0) {
        alert('Aucun cours à partager dans ta sélection');
        return;
    }

    // Demander métadonnées CC pour l'export global
    const metadata = await demanderMetadonneesEnrichies('cours', 'Mes cours');
    if (!metadata) {
        return; // Annulé par l'utilisateur
    }

    // Créer le wrapper avec métadonnées
    const exportData = {
        metadata_cc: metadata,
        type: 'cours',
        nbCours: coursDansBibliotheque.length,
        dateExport: new Date().toISOString(),
        cours: coursDansBibliotheque
    };

    // Créer le JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Générer nom de fichier avec date
    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichier = `cours-${dateStr}.json`;

    // Télécharger
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);

    alert(`${coursDansBibliotheque.length} cours exportés avec métadonnées Creative Commons !`);
}

/* ===============================
   HELPER: Obtenir l'ID du cours actif (Beta 95)
   =============================== */

/**
 * Retourne l'ID du cours actuellement actif
 * Utilisé par horaire.js pour le namespacing des séances
 *
 * @returns {string|null} - ID du cours actif ou null si aucun
 */
function obtenirCoursActifId() {
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.id) {
        return infoCours.id;
    }

    // Fallback: chercher dans listeCours
    const tousLesCours = db.getSync('cours', []);
    const coursActif = tousLesCours.find(c => c.actif);
    return coursActif ? coursActif.id : null;
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Ouvrir file picker import cours */
function ouvrirFilePickerImportCours() {
    var input = document.getElementById('fichier-import-cours-modal');
    if (input) input.click();
}

/* ===============================
   EXPORTS - Rendre les fonctions accessibles globalement
   =============================== */

window.obtenirCoursActifId = obtenirCoursActifId;
window.dupliquerCoursPourTrimestreActif = dupliquerCoursPourTrimestreActif;
window.initialiserModuleCours = initialiserModuleCours;
window.ouvrirModalBibliothequeCours = ouvrirModalBibliothequeCours;
window.fermerModalBibliothequeCours = fermerModalBibliothequeCours;
window.retirerCoursDeBibliotheque = retirerCoursDeBibliotheque;
window.ajouterCoursIndividuel = ajouterCoursIndividuel;
window.exporterCoursSimple = exporterCoursSimple;
window.importerCoursSimple = importerCoursSimple;
window.partagerCours = partagerCours;
window.partagerTousLesCours = partagerTousLesCours;
window.ouvrirFilePickerImportCours = ouvrirFilePickerImportCours;

})();
