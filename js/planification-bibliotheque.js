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
// MODALE — La fenêtre en deux colonnes (#1157, lot 4 du plan du 24 oct. 2026)
// ============================================

/** « 17 nœuds · 12 liens » : le pluriel réel, « nœud » avec son œ. */
function compteNoeudsLiens(donnees) {
    var nbNoeuds = donnees ? (donnees.noeuds || []).length : 0;
    var nbLiens = donnees ? (donnees.liens || []).length : 0;
    return nbNoeuds + ' nœud' + (nbNoeuds > 1 ? 's' : '') + ' · ' + nbLiens + ' lien' + (nbLiens > 1 ? 's' : '');
}

/**
 * L'aperçu d'une carte de la bibliothèque : ce que sa rangée d'avant montrait en plus des
 * comptes (la description courte, l'auteur, la licence), avec les libellés des métadonnées CC.
 * Une carte qui n'a rien de plus n'a pas d'aperçu (null) : son nom n'est pas un bouton.
 */
function apercuAlignementBibliotheque(item) {
    var meta = item.metadata_cc || {};
    var description = meta.description_courte || '';
    var auteur = item.auteur || meta.auteur_original || '';
    var licence = meta.licence || '';
    if (!description && !auteur && !licence) return null;
    var lignes = [];
    if (auteur) lignes.push(['Auteur', auteur, '']);
    if (licence) lignes.push(['Licence', licence, '']);
    return { paragraphes: [description], lignes: lignes };
}

/**
 * Les rangées des deux colonnes. AUCUNE RELATION n'est enregistrée entre une carte et son
 * exemplaire : « Garder → » (`partagerAlignement`) et « ← Utiliser »
 * (`ajouterAlignementDepuisBibliotheque`) donnent chacun un `id` neuf sans nommer la source.
 * Il n'y a donc ni état calme (« ✓ Aussi… », « ✓ Déjà… ») ni « Tout garder » : le passage
 * reste offert sur chaque rangée, comme « Partager » et « Ajouter » avant (consigne du lot 4,
 * § 1.1 ; le lien est inscrit, pas ajouté).
 */
async function preparerDonneesBibliothequeAlignements() {
    var biblioItems = await obtenirTousLesAlignementsBibliotheque();
    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var cartesActives = (index && index.cartes) ? index.cartes : [];
    var auteurActif = BibliothequeUI.obtenirAuteurActif();

    var rangeesTrimestre = cartesActives.map(function (carte) {
        return {
            id: carte.id,
            nom: carte.nom || 'Sans titre',
            ligne: compteNoeudsLiens(window.planificationDonnees.chargerCarte(carte.id)),
            passage: { label: 'Garder dans ma bibliothèque', action: 'partagerAlignement', param: carte.id, sens: 'versBibliotheque' },
            menu: [
                { label: 'Dupliquer', action: 'dupliquerAlignementDuTrimestre', param: carte.id, title: 'Créer une copie dans ce trimestre' },
                { label: 'Exporter', action: 'exporterAlignementJSON', param: carte.id, title: 'Télécharger en JSON' },
                { separateur: true },
                { label: 'Supprimer définitivement', action: 'supprimerAlignementDuTrimestre', param: carte.id, classe: 'btn-supprimer', title: 'Supprimer cette carte de ce trimestre' }
            ]
        };
    });

    var rangeesBibliotheque = biblioItems.map(function (item) {
        var ligne = compteNoeudsLiens(item.donnees);
        var auteur = item.auteur || (item.metadata_cc && item.metadata_cc.auteur_original) || '';
        if (auteur && auteur !== auteurActif) ligne += ' · par ' + auteur;
        return {
            id: item.id,
            nom: item.nom || 'Sans titre',
            ligne: ligne,
            apercu: apercuAlignementBibliotheque(item),
            passage: { label: 'Utiliser dans ce trimestre', action: 'ajouterAlignementDepuisBibliotheque', param: item.id, sens: 'versTrimestre' },
            menu: [
                { label: 'Supprimer de ma bibliothèque', action: 'supprimerAlignementDeBibliotheque', param: item.id, classe: 'btn-supprimer', title: 'Supprimer de la bibliothèque' }
            ]
        };
    });

    return { rangeesTrimestre: rangeesTrimestre, rangeesBibliotheque: rangeesBibliotheque };
}

async function afficherBibliothequeAlignements() {
    var data = await preparerDonneesBibliothequeAlignements();

    BibliothequeUI.creerFenetreDeuxColonnes({
        modalId: MODAL_ID,
        titre: "Bibliothèque de cartes d'alignement",
        aide: 'bibliotheque-fonctionnement',
        menuFichiers: [
            { label: 'Importer une carte', action: '_declencherImportAlignementFichier' },
            { note: 'Fichier .json' }
        ],
        champsFichier: [{ id: 'biblio-alignements-fichier-import', accept: '.json', onChange: '_importerAlignementFichierChange' }],
        trimestre: {
            titre: 'Dans ce trimestre',
            // Seconde phrase vraie : les deux passages clonent les données (`importerDepuisBibliotheque`,
            // `exporterCartePourBibliotheque`, JSON.parse(JSON.stringify(…))) — deux copies séparées.
            phrase: 'Les cartes d\'alignement que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.',
            idListe: 'listeAlignementsTrimestre',
            rangees: data.rangeesTrimestre,
            vide: 'Aucune carte d\'alignement dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la avec « Nouvelle carte ».',
            // Import depuis un autre trimestre — il écrit dans CE trimestre
            // (`importerCarteTrimestreVersActif`) : au pied de « Dans ce trimestre ». Les cartes du
            // même cours (#368) remontent en tête : c'est le geste de la rentrée, le repli s'ouvre
            // d'emblée quand il y en a.
            importAutreTrimestre: optionsImportTrimestre()
        },
        bibliotheque: {
            titre: 'Dans ta bibliothèque',
            // Sans « C'est d'ici que tu peux les partager. » : même raison qu'aux lots 1 à 3.
            phrase: 'Les cartes d\'alignement que tu gardes pour tous tes trimestres.',
            idListe: 'listeAlignementsBibliotheque',
            rangees: data.rangeesBibliotheque,
            vide: 'Ta bibliothèque est vide. Garde-y une carte de ce trimestre pour la retrouver plus tard.'
        }
    });
}

function optionsImportTrimestre() {
    var donnees = window.planificationDonnees;
    var sources = (donnees && typeof donnees.listerTrimestresAvecCartes === 'function')
        ? donnees.listerTrimestresAvecCartes() : [];
    if (!sources.length) return null;
    var carte = window.planificationCarte;
    var reprises = (carte && typeof carte.reprisesDisponibles === 'function') ? carte.reprisesDisponibles() : [];
    return {
        titre: 'Importer depuis un autre trimestre',
        selectId: 'biblio-alignements-import-trimestre',
        apercuId: 'biblio-alignements-cartes-trimestre',
        options: sources.map(function (t) {
            return { value: t.id, label: t.nom + ' (' + t.cartes.length + ' carte' + (t.cartes.length > 1 ? 's' : '') + ')' };
        }),
        actionVoir: 'importerAlignementsTrimestre',
        libelleVoir: 'Voir les cartes',
        ouvert: reprises.length > 0,
        enTete: {
            id: 'biblio-alignements-meme-cours',
            titre: 'Même cours',
            rangees: reprises.map(function (r) {
                return rangeeCarteTrimestre(r.carte.nom, r.trimestreNom, r.trimestreId, r.carte.id, 'Reprendre');
            })
        }
    };
}

function rangeeCarteTrimestre(nom, detail, trimestreId, carteId, libelle) {
    return { nom: nom, detail: detail, action: 'importerCarteTrimestreVersActif', param: trimestreId, param2: carteId, libelle: libelle };
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

            // Sinon → import direct dans le trimestre actif. Seul chemin depuis le
            // lot 3 : « Importer une carte (fichier) » a quitté « Actions ▾ ». Le
            // nom inscrit dans le fichier passe avant celui du fichier, comme le
            // faisait l'ancien chemin ; `chargerCarte` migre les anciens types.
            var contenu = data.noeuds ? data : (data.cartes && data.cartes['carte_1']) || data;
            if (!contenu || !Array.isArray(contenu.noeuds)) {
                notifications.erreur('Ce fichier ne contient pas de carte d\'alignement.');
                return;
            }
            var nouvelId = window.planificationDonnees.importerDepuisBibliotheque({
                nom: data.nom || fichier.name.replace('.json', ''),
                donnees: {
                    compteur: contenu.compteur || 0,
                    compteurLiens: contenu.compteurLiens || 0,
                    noeuds: contenu.noeuds,
                    liens: contenu.liens || []
                }
            });
            if (nouvelId && window.planificationCarte) {
                window.planificationCarte.mettreAJourListeCartes();
                window.planificationCarte.chargerCarte(nouvelId);
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
 * Affiche les cartes du trimestre choisi, chacune avec « Importer ».
 */
function importerAlignementsTrimestre() {
    var select = document.getElementById('biblio-alignements-import-trimestre');
    var container = document.getElementById('biblio-alignements-cartes-trimestre');
    if (!select || !container) return;
    var source = (window.planificationDonnees.listerTrimestresAvecCartes() || [])
        .find(function (t) { return t.id === select.value; });
    if (!source) {
        container.innerHTML = '';
        container.classList.add('u-hide');
        return;
    }
    container.innerHTML = BibliothequeUI.renderRangeesImport(source.cartes.map(function (c) {
        return rangeeCarteTrimestre(c.nom, c.nbNoeuds + ' nœud' + (c.nbNoeuds > 1 ? 's' : ''), source.id, c.id, 'Importer');
    }));
    container.classList.remove('u-hide');
}

/**
 * Copie une carte d'un autre trimestre dans le trimestre actif (copie
 * indépendante : la source reste intacte), puis l'affiche.
 */
async function importerCarteTrimestreVersActif(trimestreId, carteId) {
    if (!window.planificationCarte || typeof window.planificationCarte.reprendreCarte !== 'function') return;
    window.planificationCarte.reprendreCarte(trimestreId, carteId);
    fermerModalBibliothequeAlignements();
    await afficherBibliothequeAlignements();
}

/**
 * Duplique une carte du trimestre actif (menu « ⋮ », lot 3). L'original n'est
 * pas touché ; la copie devient la carte affichée.
 */
async function dupliquerAlignementDuTrimestre(carteId) {
    if (!window.planificationCarte || typeof window.planificationCarte.dupliquerCarte !== 'function') return;
    var nouvelId = window.planificationCarte.dupliquerCarte(carteId);
    if (!nouvelId) return;
    fermerModalBibliothequeAlignements();
    await afficherBibliothequeAlignements();
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
window.importerCarteTrimestreVersActif = importerCarteTrimestreVersActif;
window.dupliquerAlignementDuTrimestre = dupliquerAlignementDuTrimestre;

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
