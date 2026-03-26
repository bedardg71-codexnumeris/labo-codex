/* ===============================
   MODULE BIBLIOTHÈQUE DE TAMPONS
   Version: 2026032001

   Partage et réutilisation des collections de tampons
   entre trimestres et entre collègues.

   Pattern identique à planification-bibliotheque.js
   et grilles-bibliotheque.js. Utilise BibliothequeUI.
   =============================== */

(function() {
'use strict';

var MODAL_ID = 'modalBibliothequeTampons';
var CLE_BIBLIO = 'bibliothequeTampons';

// ============================================
// CRUD — IDB non-namespacée (globale)
// ============================================

function obtenirTousSync() {
    return db.getSync(CLE_BIBLIO, []);
}

async function obtenirTous() {
    return (await db.get(CLE_BIBLIO)) || [];
}

async function sauvegarder(items) {
    await db.set(CLE_BIBLIO, items);
}

async function ajouterALaBibliotheque(tampon) {
    var items = await obtenirTous();
    if (items.find(function(t) { return t.id === tampon.id; })) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Doublon', 'Ce tampon est déjà dans la bibliothèque');
        }
        return false;
    }
    tampon.dansBibliotheque = true;
    tampon.dateAjoutBiblio = new Date().toISOString();
    items.push(tampon);
    await sauvegarder(items);
    return true;
}

async function retirerDeLaBibliotheque(tamponId) {
    var items = await obtenirTous();
    items = items.filter(function(t) { return t.id !== tamponId; });
    await sauvegarder(items);
}

async function importerDansBibliotheque(tampons) {
    var items = await obtenirTous();
    var idsExistants = new Set(items.map(function(t) { return t.id; }));
    var ajoutes = 0;
    tampons.forEach(function(t) {
        if (!idsExistants.has(t.id)) {
            t.dansBibliotheque = true;
            t.dateAjoutBiblio = new Date().toISOString();
            items.push(t);
            ajoutes++;
        }
    });
    await sauvegarder(items);
    return ajoutes;
}

// ============================================
// PARTAGER — tampon perso → bibliothèque
// ============================================

async function partagerTampon(tamponId) {
    // Chercher dans AUTOCOLLANTS (built-in + custom)
    var autocollants = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirAutocollants)
        ? travauxOutils.obtenirAutocollants() : [];
    var tampon = autocollants.find(function(a) { return a.id === tamponId; });
    if (!tampon) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Erreur', 'Tampon introuvable');
        }
        return;
    }

    var entry = {
        id: tampon.id,
        nom: tampon.nom,
        fichier: tampon.fichier || '',
        categorie: tampon.categorie || 'observations',
        imageBase64: _capturerImageBase64(tamponId),
        custom: tampon.custom || false,
        metadata_cc: {
            licence: 'CC BY-NC-SA 4.0',
            auteur: '',
            description_courte: tampon.nom
        }
    };

    var ok = await ajouterALaBibliotheque(entry);
    if (ok && typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Tampon "' + tampon.nom + '" ajouté à la bibliothèque');
    }
    rafraichirModal();
}

// ============================================
// AJOUTER — bibliothèque → tampons actifs
// ============================================

async function ajouterDepuisBibliotheque(tamponId) {
    var items = await obtenirTous();
    var tampon = items.find(function(t) { return t.id === tamponId; });
    if (!tampon) return;

    // Vérifier qu'il n'est pas déjà dans les tampons personnalisés
    var customs = db.getSync('tamponsPersonnalises', []);
    if (customs.find(function(c) { return c.id === tampon.id; })) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Déjà présent', 'Ce tampon est déjà dans ta palette');
        }
        return;
    }

    // Ajouter aux tampons personnalisés
    customs.push({
        id: tampon.id,
        nom: tampon.nom,
        categorie: tampon.categorie || 'observations'
    });
    db.setSync('tamponsPersonnalises', customs);

    // Si image base64, stocker pour affichage futur
    if (tampon.imageBase64) {
        var imagesCustom = db.getSync('tamponsImages', {});
        imagesCustom[tampon.id] = tampon.imageBase64;
        db.setSync('tamponsImages', imagesCustom);
    }

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Tampon "' + tampon.nom + '" ajouté à ta palette');
    }
    rafraichirModal();
}

// ============================================
// EXPORT / IMPORT JSON
// ============================================

function exporterBibliotheque() {
    var items = obtenirTousSync();
    if (!items || items.length === 0) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Aucune donnée', 'La bibliothèque est vide');
        }
        return;
    }

    var payload = {
        type: 'monitorage-tampons',
        version: 1,
        dateExport: new Date().toISOString(),
        tampons: items,
        metadata_cc: {
            licence: 'CC BY-NC-SA 4.0',
            auteur: '',
            description_courte: 'Collection de tampons Labo Codex'
        }
    };

    var jsonStr = JSON.stringify(payload, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tampons-bibliotheque-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(items.length + ' tampon(s) exporté(s)');
    }
}

async function importerFichier(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
        var texte = await file.text();
        var data = JSON.parse(texte);

        if (data.type !== 'monitorage-tampons' || !Array.isArray(data.tampons)) {
            if (typeof afficherNotificationErreur === 'function') {
                afficherNotificationErreur('Format invalide', 'Ce fichier n\'est pas une collection de tampons Labo Codex');
            }
            return;
        }

        var ajoutes = await importerDansBibliotheque(data.tampons);
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(ajoutes + ' tampon(s) importé(s) dans la bibliothèque');
        }
        rafraichirModal();
    } catch (e) {
        console.error('[Tampons-Biblio] Erreur import:', e);
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Erreur', 'Impossible de lire le fichier JSON');
        }
    }

    // Reset input pour permettre de re-sélectionner le même fichier
    event.target.value = '';
}

// ============================================
// MODALE — BibliothequeUI
// ============================================

function afficherBibliothequeTampons() {
    // Fermer si déjà ouvert
    var existant = document.getElementById(MODAL_ID);
    if (existant) { existant.remove(); return; }

    // Section 1 : Mes tampons actuels (built-in + custom)
    var autocollants = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirAutocollants)
        ? travauxOutils.obtenirAutocollants() : [];
    var nomsCat = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirNomsCategories)
        ? travauxOutils.obtenirNomsCategories() : {};

    // Grouper par catégorie
    var parCat = {};
    autocollants.forEach(function(a) {
        if (a.legacy) return; // Exclure les legacy
        var cat = a.categorie || 'observations';
        if (!parCat[cat]) parCat[cat] = [];
        parCat[cat].push(a);
    });

    var htmlMesTampons = '';
    Object.keys(parCat).forEach(function(catId) {
        var nomCat = nomsCat[catId] || catId;
        var nbCat = parCat[catId].length;
        htmlMesTampons += '<div style="margin-bottom:16px;">';
        htmlMesTampons += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
        htmlMesTampons += '<span style="font-weight:600; color:var(--accent-primaire); font-size:0.85em;">' + nomCat + ' (' + nbCat + ')</span>';
        htmlMesTampons += '<div style="display:flex; gap:4px;">';
        htmlMesTampons += '<button class="btn btn-secondaire btn-tres-compact" style="font-size:0.75em;" data-action="tamponsBibliotheque.partagerCategorie" data-param="' + catId + '" title="Ajouter toute la catégorie à la bibliothèque">Partager</button>';
        htmlMesTampons += '<button class="btn btn-secondaire btn-tres-compact" style="font-size:0.75em;" data-action="tamponsBibliotheque.exporterCategorie" data-param="' + catId + '" title="Exporter cette catégorie en JSON">Exporter</button>';
        htmlMesTampons += '</div></div>';
        parCat[catId].forEach(function(t) {
            htmlMesTampons += BibliothequeUI.renderCarteSelection({
                nom: t.nom,
                id: t.id,
                badgeSource: t.custom
                    ? '<span class="badge-source badge-source--locale">Personnalisé</span>'
                    : '<span class="badge-source badge-source--id">Intégré</span>',
                metadonnees: nomCat,
                boutons: [
                    { label: 'Partager', action: 'tamponsBibliotheque.partagerTampon', param: t.id, classe: 'btn-confirmer', title: 'Ajouter à la bibliothèque partagée' },
                    { label: 'Exporter', action: 'tamponsBibliotheque.exporterUnTampon', param: t.id, classe: 'btn-secondaire', title: 'Télécharger en JSON' }
                ]
            });
        });
        htmlMesTampons += '</div>';
    });

    if (autocollants.filter(function(a) { return !a.legacy; }).length === 0) {
        htmlMesTampons = '<p style="color:var(--texte-secondaire);">Aucun tampon configuré.</p>';
    }

    // Boutons après Section 1
    var boutonsApres = '<div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">' +
        '<button class="btn btn-secondaire btn-tres-compact" data-action="tamponsBiblioClickImport">Importer un fichier JSON</button>' +
        '<input type="file" id="biblio-tampons-fichier-import" accept=".json" style="display:none" data-on-change="tamponsBiblioImporterFichier">' +
        '<button class="btn btn-secondaire btn-tres-compact" data-action="tamponsBibliotheque.exporterBibliotheque">Exporter la bibliothèque</button>' +
        '</div>' +
        '<p style="font-size:0.8em; color:var(--texte-secondaire); margin-top:8px;">Assurez-vous d\'avoir les droits sur les images importées.</p>';

    // Section 2 : Bibliothèque partagée
    var biblioItems = obtenirTousSync();
    var customsActuels = db.getSync('tamponsPersonnalises', []);
    var idsActuels = new Set(customsActuels.map(function(c) { return c.id; }));
    // Inclure aussi les built-in
    autocollants.forEach(function(a) { idsActuels.add(a.id); });

    var htmlBiblio = '';
    if (biblioItems.length === 0) {
        htmlBiblio = '<p style="color:var(--texte-secondaire);">Aucun tampon dans la bibliothèque partagée.<br>Utilise "Partager" pour y ajouter des tampons.</p>';
    } else {
        biblioItems.forEach(function(item) {
            var dejaPresent = idsActuels.has(item.id);
            var meta = (item.categorie ? (nomsCat[item.categorie] || item.categorie) : '') +
                (item.metadata_cc && item.metadata_cc.auteur ? ' · ' + item.metadata_cc.auteur : '') +
                (item.dateAjoutBiblio ? ' · ' + new Date(item.dateAjoutBiblio).toLocaleDateString('fr-CA') : '');
            htmlBiblio += BibliothequeUI.renderCarteDisponible({
                nom: item.nom || 'Sans titre',
                id: item.id,
                badgeSource: '<span class="badge-source badge-source--bibliotheque">Bibliothèque</span>',
                metadonnees: meta,
                description: (item.metadata_cc && item.metadata_cc.description_courte) || '',
                dejaPresent: dejaPresent,
                boutons: [
                    { label: 'Ajouter', action: 'tamponsBibliotheque.ajouterDepuisBibliotheque', param: item.id, classe: 'btn-confirmer', title: 'Copier dans ta palette de tampons' },
                    { label: 'Supprimer', action: 'tamponsBibliotheque.supprimerDeBibliotheque', param: item.id, classe: 'btn-supprimer', title: 'Retirer de la bibliothèque', showAlways: true }
                ]
            });
        });
    }

    BibliothequeUI.creerModal({
        modalId: MODAL_ID,
        titre: 'Bibliothèque de tampons',
        sousTitre: 'Partagez et réutilisez vos collections de tampons entre les trimestres.',
        onFermerAction: 'tamponsBibliotheque.fermerModal',
        doublonsHTML: '',
        titreSection1: 'Mes tampons (' + autocollants.filter(function(a) { return !a.legacy; }).length + ')',
        contenuIdListe1: 'listeTamponsPerso',
        contenuSection1: htmlMesTampons,
        boutonsApresSection1: boutonsApres,
        sectionImportTrimestre: '',
        titreSection2: 'Bibliothèque partagée (' + biblioItems.length + ')',
        filtresSection2: '',
        contenuIdListe2: 'listeTamponsBibliotheque',
        contenuSection2: htmlBiblio
    });
}

function fermerModal() {
    BibliothequeUI.fermerModal(MODAL_ID);
}

function rafraichirModal() {
    var existant = document.getElementById(MODAL_ID);
    if (existant) {
        existant.remove();
        afficherBibliothequeTampons();
    }
}

async function supprimerDeBibliotheque(tamponId) {
    await retirerDeLaBibliotheque(tamponId);
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Tampon retiré de la bibliothèque');
    }
    rafraichirModal();
}

function exporterUnTampon(tamponId) {
    var autocollants = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirAutocollants)
        ? travauxOutils.obtenirAutocollants() : [];
    var tampon = autocollants.find(function(a) { return a.id === tamponId; });
    if (!tampon) return;

    var payload = {
        type: 'monitorage-tampons',
        version: 1,
        dateExport: new Date().toISOString(),
        tampons: [{
            id: tampon.id,
            nom: tampon.nom,
            fichier: tampon.fichier || '',
            categorie: tampon.categorie || 'observations',
            imageBase64: _capturerImageBase64(tamponId),
            custom: tampon.custom || false,
            metadata_cc: { licence: 'CC BY-NC-SA 4.0', auteur: '', description_courte: tampon.nom }
        }]
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tampon-' + tampon.id + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// ============================================
// CATÉGORIES — export/partage par catégorie
// ============================================

function _capturerImageBase64(tamponId) {
    try {
        var img = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirImageAutocollant)
            ? travauxOutils.obtenirImageAutocollant(tamponId) : null;
        if (img && img.complete && img.naturalWidth > 0) {
            var canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            return canvas.toDataURL('image/png');
        }
    } catch (e) { console.warn('[Tampons] image base64 capture failed:', e.message || e); }
    return '';
}

function _obtenirTamponsDCategorie(catId) {
    var autocollants = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirAutocollants)
        ? travauxOutils.obtenirAutocollants() : [];
    return autocollants.filter(function(a) {
        return !a.legacy && a.categorie === catId;
    });
}

function exporterCategorie(catId) {
    var tampons = _obtenirTamponsDCategorie(catId);
    if (tampons.length === 0) {
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Catégorie vide', 'Aucun tampon dans cette catégorie');
        }
        return;
    }

    var nomsCat = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirNomsCategories)
        ? travauxOutils.obtenirNomsCategories() : {};
    var nomCat = nomsCat[catId] || catId;

    var tamponsExport = tampons.map(function(t) {
        return {
            id: t.id,
            nom: t.nom,
            fichier: t.fichier || '',
            categorie: t.categorie,
            imageBase64: _capturerImageBase64(t.id),
            custom: t.custom || false,
            metadata_cc: { licence: 'CC BY-NC-SA 4.0', auteur: '', description_courte: t.nom }
        };
    });

    var payload = {
        type: 'monitorage-tampons',
        version: 1,
        dateExport: new Date().toISOString(),
        categorie: catId,
        categorieNom: nomCat,
        tampons: tamponsExport,
        metadata_cc: { licence: 'CC BY-NC-SA 4.0', auteur: '', description_courte: 'Catégorie : ' + nomCat }
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tampons-' + catId + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(tamponsExport.length + ' tampon(s) "' + nomCat + '" exporté(s)');
    }
}

async function partagerCategorie(catId) {
    var tampons = _obtenirTamponsDCategorie(catId);
    if (tampons.length === 0) return;

    var nomsCat = (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirNomsCategories)
        ? travauxOutils.obtenirNomsCategories() : {};
    var nomCat = nomsCat[catId] || catId;

    var ajoutes = 0;
    for (var i = 0; i < tampons.length; i++) {
        var t = tampons[i];
        var entry = {
            id: t.id,
            nom: t.nom,
            fichier: t.fichier || '',
            categorie: t.categorie,
            imageBase64: _capturerImageBase64(t.id),
            custom: t.custom || false,
            metadata_cc: { licence: 'CC BY-NC-SA 4.0', auteur: '', description_courte: t.nom }
        };
        var ok = await ajouterALaBibliotheque(entry);
        if (ok) ajoutes++;
    }

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(ajoutes + '/' + tampons.length + ' tampon(s) "' + nomCat + '" ajouté(s) à la bibliothèque');
    }
    rafraichirModal();
}

// ============================================
// API PUBLIQUE
// ============================================

// Wrappers délégués (data-action / data-on-change)
window.tamponsBiblioClickImport = function() {
    var input = document.getElementById('biblio-tampons-fichier-import');
    if (input) input.click();
};
window.tamponsBiblioImporterFichier = function(el) {
    importerFichier({ target: el });
};

window.tamponsBibliotheque = {
    afficherBibliothequeTampons: afficherBibliothequeTampons,
    fermerModal: fermerModal,
    partagerTampon: partagerTampon,
    ajouterDepuisBibliotheque: ajouterDepuisBibliotheque,
    supprimerDeBibliotheque: supprimerDeBibliotheque,
    exporterBibliotheque: exporterBibliotheque,
    exporterUnTampon: exporterUnTampon,
    importerFichier: importerFichier,
    obtenirTousSync: obtenirTousSync,
    obtenirTous: obtenirTous,
    ajouterALaBibliotheque: ajouterALaBibliotheque,
    retirerDeLaBibliotheque: retirerDeLaBibliotheque,
    importerDansBibliotheque: importerDansBibliotheque,
    exporterCategorie: exporterCategorie,
    partagerCategorie: partagerCategorie
};

})();
