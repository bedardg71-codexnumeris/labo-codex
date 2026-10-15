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
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIO);   // lot F : geste hors témoin (bibliothèque de tampons : partager, supprimer, importer)
}

async function ajouterALaBibliotheque(tampon) {
    // B-β — passage obligé par assainirObjet. La fonction muait en place
    // l'objet reçu, ce qui n'est plus possible après sanitisation (l'objet
    // safe est une copie). On construit donc explicitement l'entrée pour
    // éviter de dépendre de la mutation in-place du callsite.
    var tamponSafe = (typeof window.assainirObjet === 'function' && window.SCHEMAS_IMPORT && window.SCHEMAS_IMPORT.tampon)
        ? window.assainirObjet(tampon, window.SCHEMAS_IMPORT.tampon)
        : tampon;
    if (!tamponSafe.id) return false;
    var items = await obtenirTous();
    if (items.find(function(t) { return t.id === tamponSafe.id; })) {
        notifications.erreur('Doublon', 'Ce tampon est déjà dans la bibliothèque');
        return false;
    }
    var entree = Object.assign({}, tamponSafe, {
        dansBibliotheque: true,
        dateAjoutBiblio: new Date().toISOString()
    });
    items.push(entree);
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
    // Défense H — vérifier les sceaux SHA-256 avant sanitisation. La
    // sanitisation retire des champs et invaliderait le sceau, donc l'ordre
    // est important : vérifier le sceau sur l'objet brut, puis assainir.
    var resumeSceau = null;
    if (window.SecuriteHash && typeof window.SecuriteHash.verifierLot === 'function') {
        resumeSceau = await window.SecuriteHash.verifierLot(tampons);
        if (resumeSceau.altere > 0) {
            console.warn('[Sécurité H] ' + resumeSceau.altere + ' tampon(s) avec sceau invalide :', resumeSceau.alteres);
        }
    }
    // Défense P (cf. MODELE-MENACES.md §3.1.bis) : chaque tampon importé est
    // sanitisé via le schéma défini en B-α. Tout champ hors schéma est retiré
    // (whitelist), et les chaînes sont tronquées + débalisées.
    var schema = (typeof SCHEMAS_IMPORT !== 'undefined' && SCHEMAS_IMPORT && SCHEMAS_IMPORT.tampon) ? SCHEMAS_IMPORT.tampon : null;
    var sanitiser = (typeof assainirObjet === 'function' && schema)
        ? function(t) { return Object.assign({}, assainirObjet(t, schema)); }
        : function(t) { return t; };
    tampons.forEach(function(brut) {
        var t = sanitiser(brut);
        if (!t.id) return; // tampon sans id après sanitisation : refusé
        if (!idsExistants.has(t.id)) {
            t.dansBibliotheque = true;
            t.dateAjoutBiblio = new Date().toISOString();
            items.push(t);
            ajoutes++;
        }
    });
    await sauvegarder(items);
    // Retourne soit juste le nombre (compat ancienne API), soit un object
    // si des informations de sceau sont disponibles (callers peuvent les
    // utiliser pour enrichir l'UI).
    if (resumeSceau && resumeSceau.altere > 0) {
        return { ajoutes: ajoutes, sceauAltere: resumeSceau.altere };
    }
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
        notifications.erreur('Erreur', 'Tampon introuvable');
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
            auteur_original: obtenirIdentiteCCUtilisateur(),
            description_courte: tampon.nom
        }
    };

    var ok = await ajouterALaBibliotheque(entry);
    if (ok) {
        notifications.succes('Tampon « ' + tampon.nom + ' » ajouté à la bibliothèque');
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
        notifications.erreur('Déjà présent', 'Ce tampon est déjà dans ta palette');
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
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('tamponsPersonnalises');   // lot F : geste hors témoin (ajouter un tampon depuis la bibliothèque)

    notifications.succes('Tampon « ' + tampon.nom + ' » ajouté à ta palette');
    rafraichirModal();
}

// ============================================
// EXPORT / IMPORT JSON
// ============================================

async function exporterBibliotheque() {
    var items = obtenirTousSync();
    if (!items || items.length === 0) {
        notifications.erreur('Aucune donnée', 'La bibliothèque est vide');
        return;
    }

    var _hasProg = typeof window.afficherProgression === 'function';
    if (_hasProg) {
        window.afficherProgression('Export bibliothèque tampons');
        window.majProgression(20, 'Scellement des tampons...', items.length + ' tampons');
    }

    // Défense H — sceller chaque tampon avant export.
    var tamponsScelles = items;
    if (window.SecuriteHash && typeof window.SecuriteHash.scellerLot === 'function') {
        tamponsScelles = await window.SecuriteHash.scellerLot(items);
    }

    if (_hasProg) window.majProgression(70, 'Validation...');

    var payload = {
        type: 'monitorage-tampons',
        version: 1,
        dateExport: new Date().toISOString(),
        tampons: tamponsScelles,
        metadata_cc: {
            licence: 'CC BY-NC-SA 4.0',
            auteur_original: obtenirIdentiteCCUtilisateur(),
            description_courte: 'Collection de tampons Labo Codex'
        }
    };

    // Défense K — valider la structure du payload JSON avant download.
    // Bloque l'export si un payload a injecté un champ annexe à la racine.
    if (window.SecuriteExportValidation && typeof window.SecuriteExportValidation.validerExportTampons === 'function') {
        try {
            window.SecuriteExportValidation.validerExportTampons(payload);
        } catch (e) {
            console.error(e);
            notifications.erreur('Export bloqué', e.message);
            return;
        }
    }

    // K-β — preview UI : montrer les champs racine et demander confirmation.
    // Masquer la progression pendant la modale de preview (sinon superposition).
    if (window.SecuriteExportPreview && typeof window.SecuriteExportPreview.previewJsonEtConfirmer === 'function') {
        if (_hasProg) window.masquerProgression();
        var okPreview = await window.SecuriteExportPreview.previewJsonEtConfirmer(payload, 'bibliothèque tampons');
        if (!okPreview) {
            return;
        }
    } else if (_hasProg) {
        window.masquerProgression();
    }

    var jsonStr = JSON.stringify(payload, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tampons-bibliotheque-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    notifications.succes(items.length + ' tampon(s) exporté(s)');
}

// Limites de surface — équivalent JSON de validerZipSecurite pour le canal
// isolé d'import des tampons (Défense P, cf. MODELE-MENACES.md §3.1.bis).
// Les valeurs sont calibrées pour un usage légitime large (200 tampons
// d'une catégorie complète, 5 Mo couvre des PNG en base64 raisonnables).
var TAMPONS_FICHIER_TAILLE_MAX_OCTETS = 5 * 1024 * 1024;
var TAMPONS_NOMBRE_MAX_PAR_IMPORT = 200;

async function importerFichier(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
        if (file.size > TAMPONS_FICHIER_TAILLE_MAX_OCTETS) {
            notifications.erreur('Fichier trop volumineux', 'Limite : ' + window.TailleFichier.dire(TAMPONS_FICHIER_TAILLE_MAX_OCTETS, { decimales: 0 }) + '.');
            event.target.value = '';
            return;
        }

        var texte = await file.text();
        var data = JSON.parse(texte);

        if (data.type !== 'monitorage-tampons' || !Array.isArray(data.tampons)) {
            notifications.erreur('Format invalide', 'Ce fichier n\'est pas une collection de tampons Labo Codex');
            event.target.value = '';
            return;
        }

        if (data.tampons.length > TAMPONS_NOMBRE_MAX_PAR_IMPORT) {
            notifications.erreur('Trop de tampons', 'Limite : ' + TAMPONS_NOMBRE_MAX_PAR_IMPORT + ' tampons par import.');
            event.target.value = '';
            return;
        }

        var resultat = await importerDansBibliotheque(data.tampons);
        var ajoutes = (typeof resultat === 'object' && resultat !== null) ? resultat.ajoutes : resultat;
        var sceauAltere = (typeof resultat === 'object' && resultat !== null) ? resultat.sceauAltere : 0;
        var msg = ajoutes + ' tampon(s) importé(s) dans la bibliothèque';
        if (sceauAltere > 0) {
            msg += '\n\n⚠ ' + sceauAltere + ' tampon(s) avec sceau invalide (modifié(s) après l\'export). Vérifie avant utilisation.';
        }
        notifications.succes(msg);
        rafraichirModal();
    } catch (e) {
        console.error('[Tampons-Biblio] Erreur import:', e);
        notifications.erreur('Erreur', 'Impossible de lire le fichier JSON');
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
        // #467 — noms de catégorie importables (fichier de tampons) : échappés une fois ici,
        // pour le titre, la carte et les attributs plus bas.
        var nomCat = echapperHtml(nomsCat[catId] || catId);
        var catIdHtml = echapperHtml(catId);
        var nbCat = parCat[catId].length;
        htmlMesTampons += '<div style="margin-bottom:16px;">';
        htmlMesTampons += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
        htmlMesTampons += '<span style="font-weight:600; color:var(--accent-primaire); font-size:0.85em;">' + nomCat + ' (' + nbCat + ')</span>';
        htmlMesTampons += '<div style="display:flex; gap:4px;">';
        htmlMesTampons += '<button class="btn btn-secondaire btn-tres-compact" style="font-size:0.75em;" data-action="tamponsBibliotheque.partagerCategorie" data-param="' + catIdHtml + '" title="Ajouter toute la catégorie à la bibliothèque">Partager</button>';
        htmlMesTampons += '<button class="btn btn-secondaire btn-tres-compact" style="font-size:0.75em;" data-action="tamponsBibliotheque.exporterCategorie" data-param="' + catIdHtml + '" title="Exporter cette catégorie en JSON">Exporter</button>';
        htmlMesTampons += '</div></div>';
        parCat[catId].forEach(function(t) {
            htmlMesTampons += BibliothequeUI.renderCarteSelection({
                nom: echapperHtml(t.nom),
                id: t.id,
                badgeSource: t.custom
                    ? '<span class="badge-source badge-source--locale">Personnalisé</span>'
                    : '<span class="badge-source badge-source--id">Intégré</span>',
                metadonnees: nomCat,
                boutonPrincipal: { label: 'Partager', action: 'tamponsBibliotheque.partagerTampon', param: t.id, classe: 'btn-confirmer', title: 'Ajouter à la Bibliothèque' },
                actionsMenu: [
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
        '<p style="font-size:0.8em; color:var(--texte-secondaire); margin-top:8px;">Assure-toi d\'avoir les droits sur les images importées.</p>';

    // Section 2 : Bibliothèque
    var biblioItems = obtenirTousSync();
    var customsActuels = db.getSync('tamponsPersonnalises', []);
    var idsActuels = new Set(customsActuels.map(function(c) { return c.id; }));
    // Inclure aussi les built-in
    autocollants.forEach(function(a) { idsActuels.add(a.id); });

    var htmlBiblio = '';
    if (biblioItems.length === 0) {
        htmlBiblio = '<p style="color:var(--texte-secondaire);">Aucun tampon dans la Bibliothèque.<br>Utilise « Partager » pour y ajouter des tampons.</p>';
    } else {
        biblioItems.forEach(function(item) {
            var dejaPresent = idsActuels.has(item.id);
            var meta = (item.categorie ? echapperHtml(nomsCat[item.categorie] || item.categorie) : '') +
                (item.metadata_cc && (item.metadata_cc.auteur_original || item.metadata_cc.auteur) ? ' · ' + echapperHtml(item.metadata_cc.auteur_original || item.metadata_cc.auteur) : '') +
                (item.dateAjoutBiblio ? ' · ' + new Date(item.dateAjoutBiblio).toLocaleDateString('fr-CA') : '');
            htmlBiblio += BibliothequeUI.renderCarteDisponible({
                nom: echapperHtml(item.nom || 'Sans titre'),
                id: item.id,
                badgeSource: '<span class="badge-source badge-source--bibliotheque">Bibliothèque</span>',
                metadonnees: meta,
                description: (item.metadata_cc && item.metadata_cc.description_courte) || '',
                dejaPresent: dejaPresent,
                boutonPrincipal: { label: 'Ajouter', action: 'tamponsBibliotheque.ajouterDepuisBibliotheque', param: item.id, classe: 'btn-confirmer', title: 'Copier dans ta palette de tampons' },
                actionsMenu: [
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
        titreSection2: 'Bibliothèque (' + biblioItems.length + ')',
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
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('tampon'))) return;
    await retirerDeLaBibliotheque(tamponId);
    notifications.succes('Tampon retiré de la bibliothèque');
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
        notifications.erreur('Catégorie vide', 'Aucun tampon dans cette catégorie');
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

    notifications.succes(tamponsExport.length + ' tampon(s) "' + nomCat + '" exporté(s)');
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

    notifications.succes(ajoutes + '/' + tampons.length + ' tampon(s) "' + nomCat + '" ajouté(s) à la bibliothèque');
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
