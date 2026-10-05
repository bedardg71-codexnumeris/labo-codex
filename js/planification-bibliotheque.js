/* ===============================
   MODULE: BIBLIOTHÈQUE D'ALIGNEMENTS PÉDAGOGIQUES
   CRUD + Seed démo + Modale (via BibliothequeUI) + Actions

   Stockage : db.get/set('bibliothequeAlignements') — non namespacé, partagé entre trimestres
   Pattern : echelles.js sections bibliothèque

   Export: fonctions globales window.*
   =============================== */

(function () {
'use strict';

var CLE_BIBLIOTHEQUE_ALIGNEMENTS = 'bibliothequeAlignements';
var ID_DEMO = 'ALI_DEMO_ecriture_litterature';
var MODAL_ID = 'modalBibliothequeAlignements';

// ============================================
// CRUD — Bibliothèque
// ============================================

function obtenirTousLesAlignementsBibliothequeSync() {
    try {
        return db.getSync(CLE_BIBLIOTHEQUE_ALIGNEMENTS, []) || [];
    } catch (e) {
        console.warn('[BiblioAlignements] Erreur lecture sync:', e);
        return [];
    }
}

async function obtenirTousLesAlignementsBibliotheque() {
    try {
        return (await db.get(CLE_BIBLIOTHEQUE_ALIGNEMENTS)) || [];
    } catch (e) {
        console.warn('[BiblioAlignements] Erreur lecture async:', e);
        return [];
    }
}

async function sauvegarderBibliotheque(items) {
    try {
        await db.set(CLE_BIBLIOTHEQUE_ALIGNEMENTS, items);
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE_ALIGNEMENTS);   // lot F : geste hors témoin
    } catch (e) {
        console.warn('[BiblioAlignements] Erreur sauvegarde:', e);
    }
}

async function ajouterAlignementALaBibliotheque(item) {
    var items = await obtenirTousLesAlignementsBibliotheque();
    // Déduplique par id
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === item.id) {
            items[i] = item; // mise à jour si déjà présent
            await sauvegarderBibliotheque(items);
            return;
        }
    }
    items.push(item);
    await sauvegarderBibliotheque(items);
}

async function retirerAlignementDeLaBibliotheque(id) {
    var items = await obtenirTousLesAlignementsBibliotheque();
    items = items.filter(function (it) { return it.id !== id; });
    await sauvegarderBibliotheque(items);
}

function getNombreAlignementsBibliotheque() {
    return obtenirTousLesAlignementsBibliothequeSync().length;
}

// ============================================
// SEED DÉMO — Idempotent
// ============================================

function seederDemoSiNecessaire() {
    var items = obtenirTousLesAlignementsBibliothequeSync();
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === ID_DEMO) return; // déjà présent
    }

    var demo = window.CARTE_DEMO_ALIGNEMENT;
    if (!demo || !demo.cartes || !demo.cartes['carte_1']) {
        console.warn('[BiblioAlignements] CARTE_DEMO_ALIGNEMENT non disponible pour le seed');
        return;
    }

    var contenu = demo.cartes['carte_1'];
    var item = {
        id: ID_DEMO,
        nom: demo.metadata_cc.nom || 'Écriture et littérature (démo)',
        dateCreation: demo.metadata_cc.date_creation || '2026-02-07',
        dateModification: demo.metadata_cc.date_modification || '2026-02-17',
        dateAjoutBiblio: new Date().toISOString(),
        auteur: demo.metadata_cc.auteur_original || 'Labo Codex',
        dansBibliotheque: true,
        metadata_cc: JSON.parse(JSON.stringify(demo.metadata_cc)),
        donnees: JSON.parse(JSON.stringify({
            compteur: contenu.compteur || 0,
            compteurLiens: contenu.compteurLiens || 0,
            noeuds: contenu.noeuds || [],
            liens: contenu.liens || []
        }))
    };

    items.push(item);
    // Sauvegarde sync pour le seed initial (pas async)
    try {
        db.setSync(CLE_BIBLIOTHEQUE_ALIGNEMENTS, items);

    } catch (e) {
        console.warn('[BiblioAlignements] Erreur seed:', e);
    }
}

// ============================================
// TRIMESTRES — Lister les cartes par trimestre
// ============================================

function listerTrimestresAvecAlignements() {
    var trimestres = [];
    try {
        var allTrim = enumererTrimestres();
        for (var i = 0; i < allTrim.length; i++) {
            var code = allTrim[i].id;
            var donnees = db.getSync(code + '_planification_mindmap', null);
            if (donnees && donnees.index && donnees.index.cartes && donnees.index.cartes.length > 0) {
                trimestres.push({
                    code: code,
                    nom: allTrim[i].nom || code,
                    nbCartes: donnees.index.cartes.length
                });
            }
        }
    } catch (e) {
        console.warn('[BiblioAlignements] Erreur scan trimestres:', e);
    }
    return trimestres;
}

function obtenirAlignementsTrimestre(code) {
    try {
        var donnees = db.getSync(code + '_planification_mindmap', null);
        if (!donnees || !donnees.index || !donnees.cartes) return [];
        var cartes = [];
        for (var i = 0; i < donnees.index.cartes.length; i++) {
            var info = donnees.index.cartes[i];
            var contenu = donnees.cartes[info.id];
            if (contenu) {
                cartes.push({
                    id: info.id,
                    nom: info.nom || 'Sans titre',
                    dateCreation: info.dateCreation,
                    noeuds: (contenu.noeuds || []).length,
                    liens: (contenu.liens || []).length
                });
            }
        }
        return cartes;
    } catch (e) {
        return [];
    }
}

// ============================================
// MODALE — Affichage via BibliothequeUI
// ============================================

async function afficherBibliothequeAlignements() {
    var biblioItems = await obtenirTousLesAlignementsBibliotheque();

    // Section 1 : Cartes du trimestre actif
    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var cartesActives = (index && index.cartes) ? index.cartes : [];
    var contenuSection1 = '';

    if (cartesActives.length === 0) {
        contenuSection1 = '<p class="text-muted" style="padding: 10px;">Aucune carte d\'alignement dans le trimestre actif.</p>';
    } else {
        cartesActives.forEach(function (carte) {
            var donnees = window.planificationDonnees.chargerCarte(carte.id);
            var nbNoeuds = donnees ? (donnees.noeuds || []).length : 0;
            var nbLiens = donnees ? (donnees.liens || []).length : 0;
            contenuSection1 += BibliothequeUI.renderCarteSelection({
                nom: carte.nom || 'Sans titre',
                id: carte.id,
                badgeSource: '<span class="badge-source badge-source--locale">Trimestre actif</span>',
                metadonnees: nbNoeuds + ' noeud(s) \u00b7 ' + nbLiens + ' lien(s)',
                boutonPrincipal: { label: 'Partager', action: 'partagerAlignement', param: carte.id, classe: 'btn-confirmer', title: 'Ajouter à la Bibliothèque' },
                actionsMenu: [
                    { label: 'Exporter', action: 'exporterAlignementJSON', param: carte.id, classe: 'btn-secondaire', title: 'Télécharger en JSON' },
                    { label: 'Supprimer', action: 'supprimerAlignementDuTrimestre', param: carte.id, classe: 'btn-supprimer', title: 'Supprimer cette carte du trimestre actif', showAlways: true }
                ]
            });
        });
    }

    // Section 2 : Bibliothèque
    var contenuSection2 = '';
    if (biblioItems.length === 0) {
        contenuSection2 = '<p class="text-muted" style="padding: 10px;">La bibliothèque est vide. Partage une carte d\'alignement depuis la section ci-dessus.</p>';
    } else {
        biblioItems.forEach(function (item) {
            var nbNoeuds = item.donnees ? (item.donnees.noeuds || []).length : 0;
            var nbLiens = item.donnees ? (item.donnees.liens || []).length : 0;
            var auteur = item.auteur || (item.metadata_cc && item.metadata_cc.auteur_original) || '';
            var licence = (item.metadata_cc && item.metadata_cc.licence) || '';
            var meta = nbNoeuds + ' noeud(s) \u00b7 ' + nbLiens + ' lien(s)';
            if (auteur) meta += ' \u00b7 ' + auteur;
            if (licence) meta += ' \u00b7 ' + licence;

            contenuSection2 += BibliothequeUI.renderCarteDisponible({
                nom: item.nom || 'Sans titre',
                id: item.id,
                badgeSource: '<span class="badge-source badge-source--bibliotheque">Bibliothèque</span>',
                metadonnees: meta,
                description: (item.metadata_cc && item.metadata_cc.description_courte) || '',
                dejaPresent: false,
                boutonPrincipal: { label: 'Ajouter', action: 'ajouterAlignementDepuisBibliotheque', param: item.id, classe: 'btn-confirmer', title: 'Copier dans le trimestre actif' },
                actionsMenu: [
                    { label: 'Supprimer', action: 'supprimerAlignementDeBibliotheque', param: item.id, classe: 'btn-supprimer', title: 'Retirer de la bibliothèque', showAlways: true }
                ]
            });
        });
    }

    // Import trimestre
    var trimestres = listerTrimestresAvecAlignements();
    var sectionImportTrimestre = '';
    if (trimestres.length > 0) {
        var optionsHTML = '<option value="">-- Sélectionner un trimestre --</option>';
        trimestres.forEach(function (t) {
            optionsHTML += '<option value="' + t.code + '">' + t.nom + ' (' + t.nbCartes + ' carte(s))</option>';
        });
        sectionImportTrimestre = '<div class="info-box info-box--info" style="margin-bottom: 20px;">' +
            '<strong>Importer depuis un autre trimestre</strong>' +
            '<div style="margin-top: 8px; display: flex; gap: 10px; align-items: center;">' +
                '<select id="biblio-alignements-import-trimestre" class="form-control" style="display: inline-block; width: auto;">' + optionsHTML + '</select>' +
                '<button class="btn btn-secondaire btn-tres-compact" data-action="importerAlignementsTrimestre">Voir les cartes</button>' +
            '</div>' +
            '<div id="biblio-alignements-cartes-trimestre" style="margin-top: 10px;"></div>' +
        '</div>';
    }

    // Import fichier
    var boutonsApresSection1 = '<div style="margin-top: 15px; display: flex; gap: 10px;">' +
        '<button class="btn btn-secondaire btn-tres-compact" data-action="_declencherImportAlignementFichier">Importer un fichier JSON</button>' +
        '<input type="file" id="biblio-alignements-fichier-import" accept=".json" style="display:none" data-on-change="_importerAlignementFichierChange">' +
    '</div>';

    BibliothequeUI.creerModal({
        modalId: MODAL_ID,
        titre: "Bibliothèque de cartes d'alignement",
        sousTitre: 'Partage et réutilise tes cartes d\'alignement entre les trimestres.',
        onFermer: 'fermerModalBibliothequeAlignements',
        doublonsHTML: '',
        titreSection1: 'Mes cartes d\'alignement (trimestre actif)',
        contenuIdListe1: 'listeAlignementsTrimestre',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        sectionImportTrimestre: sectionImportTrimestre,
        titreSection2: 'Bibliothèque (' + biblioItems.length + ')',
        filtresSection2: '',
        contenuIdListe2: 'listeAlignementsBibliotheque',
        contenuSection2: contenuSection2
    });
}

function fermerModalBibliothequeAlignements() {
    BibliothequeUI.fermerModal(MODAL_ID);
}

// ============================================
// ACTIONS
// ============================================

/**
 * Partage un alignement du trimestre actif → Bibliothèque
 */
async function partagerAlignement(carteId) {
    var exportData = window.planificationDonnees.exporterCartePourBibliotheque(carteId);
    if (!exportData) {
        notifications.erreur('Impossible d\'exporter cette carte.');
        return;
    }

    // Demander les métadonnées CC si la fonction est disponible
    var metaCC = null;
    if (typeof demanderMetadonneesEnrichies === 'function') {
        metaCC = await demanderMetadonneesEnrichies('alignement pédagogique', exportData.nom);
        if (!metaCC) return; // annulé par l'utilisateur
    }

    var item = {
        id: genererIdUnique('ALI_'),
        nom: exportData.nom,
        dateCreation: exportData.dateCreation,
        dateModification: new Date().toISOString(),
        dateAjoutBiblio: new Date().toISOString(),
        auteur: (metaCC && metaCC.nom) || '',
        dansBibliotheque: true,
        metadata_cc: metaCC ? Object.assign({
            licence: 'CC BY-NC-SA 4.0',
            licence_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            type: 'alignement_pedagogique'
        }, metaCC) : null,
        donnees: exportData.donnees
    };

    await ajouterAlignementALaBibliotheque(item);

    // Rafraîchir la modale
    fermerModalBibliothequeAlignements();
    await afficherBibliothequeAlignements();
}

/**
 * Ajoute un alignement de la bibliothèque au trimestre actif
 */
async function ajouterAlignementDepuisBibliotheque(biblioId) {
    var items = await obtenirTousLesAlignementsBibliotheque();
    var item = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === biblioId) { item = items[i]; break; }
    }
    if (!item || !item.donnees) {
        notifications.erreur('Alignement introuvable dans la bibliothèque.');
        return;
    }

    var nouvelId = window.planificationDonnees.importerDepuisBibliotheque({
        nom: item.nom,
        donnees: item.donnees
    });

    if (!nouvelId) {
        notifications.erreur('Erreur lors de l\'import.');
        return;
    }

    // Rafraîchir l'UI de la carte mentale
    if (window.planificationCarte) {
        window.planificationCarte.mettreAJourListeCartes();
        window.planificationCarte.chargerCarte(nouvelId);
    }

    // Rafraîchir la modale
    fermerModalBibliothequeAlignements();
    await afficherBibliothequeAlignements();
}

/**
 * Exporte un alignement en fichier JSON avec métadonnées CC
 */
async function exporterAlignementJSON(carteId) {
    var exportData = window.planificationDonnees.exporterCartePourBibliotheque(carteId);
    if (!exportData) {
        notifications.erreur('Impossible d\'exporter cette carte.');
        return;
    }

    // Demander les métadonnées CC
    var metaCC = null;
    if (typeof demanderMetadonneesEnrichies === 'function') {
        metaCC = await demanderMetadonneesEnrichies('alignement pédagogique', exportData.nom);
        if (!metaCC) return; // annulé
    }

    var fichier = {
        metadata_cc: metaCC ? Object.assign({
            licence: 'CC BY-NC-SA 4.0',
            licence_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            type: 'alignement_pedagogique',
            nom: exportData.nom,
            date_creation: exportData.dateCreation,
            date_modification: new Date().toISOString().split('T')[0]
        }, metaCC) : {
            type: 'alignement_pedagogique',
            nom: exportData.nom,
            date_creation: exportData.dateCreation,
            date_modification: new Date().toISOString().split('T')[0]
        },
        donnees: exportData.donnees
    };

    var blob = new Blob([JSON.stringify(fichier, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (exportData.nom || 'alignement').replace(/[^a-zA-Z0-9àâéèêëïôùûüçÀÂÉÈÊËÏÔÙÛÜÇ _-]/g, '') + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Supprime une carte d'alignement du trimestre actif.
 * Refuse si c'est la dernière carte du trimestre (au moins 1 doit rester).
 * Si la carte supprimée était l'active, bascule sur la première restante.
 */
async function supprimerAlignementDuTrimestre(carteId) {
    var index = window.planificationDonnees && window.planificationDonnees.getIndex();
    if (!index || !index.cartes) return;
    var carte = index.cartes.find(function (c) { return c.id === carteId; });
    if (!carte) return;
    if (index.cartes.length <= 1) {
        notifications.warning('Impossible de supprimer la dernière carte du trimestre actif.');
        return;
    }
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('carte'))) return;
    const okSuppr = await uiDialogues.confirmerAction({
        titre: 'Supprimer la carte',
        message: 'Supprimer définitivement la carte « ' + carte.nom + ' » du trimestre actif ?',
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!okSuppr) return;
    // #1007 : l'index est relu après l'attente (la fenêtre, puis la question) ; celui d'avant
    // ne vaut plus rien.
    index = window.planificationDonnees.getIndex();
    if (!index || !index.cartes || index.cartes.length <= 1
        || !index.cartes.some(function (c) { return c.id === carteId; })) return;

    window.planificationDonnees.supprimerCarte(carteId);
    index.cartes = index.cartes.filter(function (c) { return c.id !== carteId; });
    var nouvelleActive = index.active;
    if (index.active === carteId) {
        nouvelleActive = index.cartes[0].id;
        index.active = nouvelleActive;
    }
    window.planificationDonnees.sauvegarderIndex(index);

    if (window.planificationCarte) {
        if (typeof window.planificationCarte.mettreAJourListeCartes === 'function') {
            window.planificationCarte.mettreAJourListeCartes();
        }
        if (index.active === nouvelleActive && typeof window.planificationCarte.chargerCarte === 'function') {
            window.planificationCarte.chargerCarte(nouvelleActive);
        }
    }

    fermerModalBibliothequeAlignements();
    await afficherBibliothequeAlignements();
}

/**
 * Supprime un alignement de la Bibliothèque
 */
async function supprimerAlignementDeBibliotheque(id) {
    const messageSuppr = (id === ID_DEMO)
        ? 'Supprimer la carte démo de la bibliothèque ? Elle sera recréée au prochain chargement.'
        : 'Supprimer cette carte d\'alignement de la Bibliothèque ? Cette action est irréversible.';
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('carteBibliotheque'))) return;
    const okSuppr = await uiDialogues.confirmerAction({
        titre: 'Supprimer de la bibliothèque',
        message: messageSuppr,
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!okSuppr) return;

    await retirerAlignementDeLaBibliotheque(id);

    // Rafraîchir la modale
    fermerModalBibliothequeAlignements();
    await afficherBibliothequeAlignements();
}

/**
 * Importe un fichier JSON comme alignement
 */
function importerAlignementFichier(event) {
    var fichier = event.target.files && event.target.files[0];
    if (!fichier) return;

    var reader = new FileReader();
    reader.onload = async function (e) {
        try {
            var data = JSON.parse(e.target.result);

            // Si le fichier a metadata_cc → import dans la bibliothèque
            if (data.metadata_cc && data.donnees) {
                var item = {
                    id: genererIdUnique('ALI_'),
                    nom: data.metadata_cc.nom || fichier.name.replace('.json', ''),
                    dateCreation: data.metadata_cc.date_creation || new Date().toISOString(),
                    dateModification: data.metadata_cc.date_modification || new Date().toISOString(),
                    dateAjoutBiblio: new Date().toISOString(),
                    auteur: data.metadata_cc.auteur_original || '',
                    dansBibliotheque: true,
                    metadata_cc: data.metadata_cc,
                    donnees: data.donnees
                };
                await ajouterAlignementALaBibliotheque(item);

                // Rafraîchir la modale
                fermerModalBibliothequeAlignements();
                await afficherBibliothequeAlignements();
                return;
            }

            // Sinon → import direct dans le trimestre (comportement existant via conception-carte)
            // Déclencher l'import classique en simulant l'input file
            var inputClassique = document.getElementById('planif-fichier-import');
            if (inputClassique) {
                // On ne peut pas repousser le même fichier, mais on peut appeler importerCarte directement
                // si elle est accessible. Sinon, on importe via planificationDonnees.
                var nouvelId = window.planificationDonnees.importerDepuisBibliotheque({
                    nom: fichier.name.replace('.json', ''),
                    donnees: data.noeuds ? data : (data.cartes && data.cartes['carte_1']) || data
                });
                if (nouvelId && window.planificationCarte) {
                    window.planificationCarte.mettreAJourListeCartes();
                    window.planificationCarte.chargerCarte(nouvelId);
                }
            }

            // Rafraîchir la modale
            fermerModalBibliothequeAlignements();
            await afficherBibliothequeAlignements();

        } catch (err) {
            notifications.erreur('Erreur lors de la lecture du fichier JSON', err.message);
        }
    };
    reader.readAsText(fichier);
    event.target.value = '';
}

/**
 * Affiche les cartes d'un trimestre sélectionné pour import
 */
function importerAlignementsTrimestre() {
    var select = document.getElementById('biblio-alignements-import-trimestre');
    var container = document.getElementById('biblio-alignements-cartes-trimestre');
    if (!select || !container) return;

    var code = select.value;
    if (!code) {
        container.innerHTML = '';
        return;
    }

    var cartes = obtenirAlignementsTrimestre(code);
    if (cartes.length === 0) {
        container.innerHTML = '<p class="text-muted">Aucune carte dans ce trimestre.</p>';
        return;
    }

    var html = '';
    cartes.forEach(function (c) {
        html += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--bordure);">' +
            '<span>' + echapperHtml(c.nom) + ' <small class="text-muted">(' + c.noeuds + ' noeuds, ' + c.liens + ' liens)</small></span>' +
            '<button class="btn btn-confirmer btn-tres-compact" data-action="importerCarteDepuisTrimestre" data-param="' + echapperHtml(code) + '" data-param2="' + echapperHtml(c.id) + '">Importer dans la bibliothèque</button>' +
        '</div>';
    });
    container.innerHTML = html;
}

/**
 * Importe une carte d'un autre trimestre dans la bibliothèque
 */
async function importerCarteDepuisTrimestre(codeTrimestre, carteId) {
    try {
        // #393 (audit 5 août) : voie canonique cleSource() — ne pas dupliquer le
        // savoir du namespacing (repli conservé pour un chargement précoce).
        var donnees = (typeof cleSource === 'function')
            ? db.getSync(cleSource('planification_mindmap', codeTrimestre), null)
            : db.getSync(codeTrimestre + '_planification_mindmap', null);
        if (!donnees || !donnees.cartes || !donnees.cartes[carteId]) {
            notifications.erreur('Carte introuvable.');
            return;
        }

        var infosCarte = null;
        if (donnees.index && donnees.index.cartes) {
            for (var i = 0; i < donnees.index.cartes.length; i++) {
                if (donnees.index.cartes[i].id === carteId) {
                    infosCarte = donnees.index.cartes[i];
                    break;
                }
            }
        }

        var contenu = donnees.cartes[carteId];
        var item = {
            id: genererIdUnique('ALI_'),
            nom: infosCarte ? infosCarte.nom : 'Sans titre',
            dateCreation: infosCarte ? infosCarte.dateCreation : new Date().toISOString(),
            dateModification: new Date().toISOString(),
            dateAjoutBiblio: new Date().toISOString(),
            auteur: '',
            dansBibliotheque: true,
            metadata_cc: null,
            donnees: JSON.parse(JSON.stringify({
                compteur: contenu.compteur || 0,
                compteurLiens: contenu.compteurLiens || 0,
                noeuds: contenu.noeuds || [],
                liens: contenu.liens || []
            }))
        };

        await ajouterAlignementALaBibliotheque(item);

        // Rafraîchir la modale
        fermerModalBibliothequeAlignements();
        await afficherBibliothequeAlignements();

    } catch (e) {
        notifications.erreur('Erreur lors de l\'import', e.message);
    }
}

// ============================================
// SEED AU CHARGEMENT
// ============================================

seederDemoSiNecessaire();

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.CLE_BIBLIOTHEQUE_ALIGNEMENTS = CLE_BIBLIOTHEQUE_ALIGNEMENTS;
window.obtenirTousLesAlignementsBibliotheque = obtenirTousLesAlignementsBibliotheque;
window.obtenirTousLesAlignementsBibliothequeSync = obtenirTousLesAlignementsBibliothequeSync;
window.ajouterAlignementALaBibliotheque = ajouterAlignementALaBibliotheque;
window.retirerAlignementDeLaBibliotheque = retirerAlignementDeLaBibliotheque;
window.getNombreAlignementsBibliotheque = getNombreAlignementsBibliotheque;
window.afficherBibliothequeAlignements = afficherBibliothequeAlignements;
window.fermerModalBibliothequeAlignements = fermerModalBibliothequeAlignements;
window.partagerAlignement = partagerAlignement;
window.ajouterAlignementDepuisBibliotheque = ajouterAlignementDepuisBibliotheque;
window.exporterAlignementJSON = exporterAlignementJSON;
window.supprimerAlignementDuTrimestre = supprimerAlignementDuTrimestre;
window.supprimerAlignementDeBibliotheque = supprimerAlignementDeBibliotheque;
window.importerAlignementFichier = importerAlignementFichier;
window.importerAlignementsTrimestre = importerAlignementsTrimestre;
window.importerCarteDepuisTrimestre = importerCarteDepuisTrimestre;

// Wrapper : clic sur bouton → déclenche le file input caché
window._declencherImportAlignementFichier = function() {
    var input = document.getElementById('biblio-alignements-fichier-import');
    if (input) input.click();
};

// Wrapper : onchange du file input → construit un objet event-like pour importerAlignementFichier
window._importerAlignementFichierChange = function(el) {
    importerAlignementFichier({ target: el });
};

})();
