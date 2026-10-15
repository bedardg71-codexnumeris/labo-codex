/* ===============================
   📦 MODULE: PREVIEW UI DES EXPORTS (Défense K-β)

   Affiche à l'utilisateur la liste des fichiers (ZIP) ou champs racine
   (JSON) qu'un export s'apprête à produire, avec confirmation explicite
   avant le téléchargement. Donne une seconde chance de repérer un
   contenu inattendu — la première étant le contrôle programmatique
   de la Défense K (validation whitelist).

   Référence : docs/securite/MODELE-MENACES.md §X-02 P2.

   Construction de la modale via createElement + textContent (pas
   d'innerHTML interpolé) pour respecter les règles de sécurité
   CLAUDE.md. CSP-compatible (pas d'event handler inline, addEventListener
   uniquement).

   Comportement : la modale est non bloquante côté JS — elle retourne
   une Promise qui résout `true` sur Télécharger, `false` sur Annuler
   ou Échap. Le pipeline d'export attend la résolution.
   =============================== */

(function () {
    'use strict';

    /** La taille d'une entrée (taille-fichier.js, #993) ; vide si inconnue. */
    function _formaterTaille(octets) {
        if (!octets || octets < 0) return '';
        return window.TailleFichier.dire(octets);
    }

    function _construireListeZip(zip) {
        var entrees = [];
        zip.forEach(function (path, file) {
            var taille = (file && file._data && file._data.uncompressedSize) || 0;
            entrees.push({
                principal: path,
                secondaire: file && file.dir ? '(dossier)' : _formaterTaille(taille)
            });
        });
        return entrees;
    }

    function _construireListeJson(payload) {
        var lignes = [];
        Object.keys(payload).forEach(function (k) {
            var v = payload[k];
            var secondaire = '';
            if (Array.isArray(v)) {
                secondaire = v.length + ' éléments';
            } else if (v && typeof v === 'object') {
                secondaire = Object.keys(v).length + ' propriété(s)';
            } else if (typeof v === 'string') {
                secondaire = '« ' + (v.length > 40 ? v.substring(0, 40) + '…' : v) + ' »';
            } else if (typeof v === 'number' || typeof v === 'boolean') {
                secondaire = String(v);
            } else {
                secondaire = typeof v;
            }
            lignes.push({ principal: k, secondaire: secondaire });
        });
        return lignes;
    }

    /**
     * Affiche une modale Promise<boolean>. true = Télécharger, false = Annuler.
     */
    function _afficherModale(opts) {
        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.className = 'modal-js-overlay';
            // z-index custom = 99999 : la modale d'export-preview doit
            // passer au-dessus de tout (biblios 10000, métadonnées 10001,
            // notification-succes 11000) — c'est la dernière barrière
            // avant le téléchargement effectif.
            overlay.style.zIndex = '99999';

            var modal = document.createElement('div');
            modal.className = 'modal-js-contenu export-preview-modal';

            var titre = document.createElement('h2');
            titre.className = 'modal-titre';
            titre.textContent = opts.titre || 'Confirmer l\'export';
            // Bouton aide (icône info) (Défense K-β a son propre contenu d'aide)
            var btnAide = document.createElement('button');
            btnAide.className = 'btn-aide-contextuelle';
            btnAide.setAttribute('data-aide', 'modal-export-preview');
            btnAide.setAttribute('aria-label', 'Aide : aperçu de l\'export');
            btnAide.innerHTML = '<span class="icone-info-aide taille-bouton" aria-hidden="true"></span>';
            titre.appendChild(document.createTextNode(' '));
            titre.appendChild(btnAide);
            modal.appendChild(titre);

            if (opts.sousTitre) {
                var sousTitre = document.createElement('p');
                sousTitre.className = 'export-preview-soustitre';
                sousTitre.textContent = opts.sousTitre;
                modal.appendChild(sousTitre);
            }

            var conteneurListe = document.createElement('div');
            conteneurListe.className = 'export-preview-liste';

            var lignes = opts.lignes || [];
            var maxAffiche = 100;
            for (var i = 0; i < Math.min(lignes.length, maxAffiche); i++) {
                var ligne = document.createElement('div');
                ligne.className = 'export-preview-ligne';
                var pri = document.createElement('span');
                pri.className = 'export-preview-ligne-pri';
                pri.textContent = lignes[i].principal;
                var sec = document.createElement('span');
                sec.className = 'export-preview-ligne-sec';
                sec.textContent = lignes[i].secondaire || '';
                ligne.appendChild(pri);
                ligne.appendChild(sec);
                conteneurListe.appendChild(ligne);
            }
            if (lignes.length > maxAffiche) {
                var resteLigne = document.createElement('div');
                resteLigne.className = 'export-preview-reste';
                resteLigne.textContent = '… et ' + (lignes.length - maxAffiche) + ' entrée(s) supplémentaire(s) non affichée(s).';
                conteneurListe.appendChild(resteLigne);
            }
            if (lignes.length === 0) {
                var vide = document.createElement('div');
                vide.className = 'export-preview-vide';
                vide.textContent = 'Aucun élément à inclure.';
                conteneurListe.appendChild(vide);
            }
            modal.appendChild(conteneurListe);

            if (opts.note) {
                var note = document.createElement('p');
                note.className = 'export-preview-note';
                note.textContent = opts.note;
                modal.appendChild(note);
            }

            var actions = document.createElement('div');
            actions.className = 'modal-actions';

            var btnAnnuler = document.createElement('button');
            btnAnnuler.type = 'button';
            btnAnnuler.className = 'btn btn-annuler';
            btnAnnuler.textContent = 'Annuler';

            var btnConfirmer = document.createElement('button');
            btnConfirmer.type = 'button';
            btnConfirmer.className = 'btn btn-confirmer';
            btnConfirmer.textContent = 'Télécharger';

            actions.appendChild(btnAnnuler);
            actions.appendChild(btnConfirmer);
            modal.appendChild(actions);

            overlay.appendChild(modal);

            function fermer(valeur) {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                document.removeEventListener('keydown', surEchap);
                resolve(valeur);
            }
            function surEchap(e) {
                if (e.key === 'Escape') fermer(false);
            }

            btnAnnuler.addEventListener('click', function () { fermer(false); });
            btnConfirmer.addEventListener('click', function () { fermer(true); });
            overlay.addEventListener('click', function (e) {
                // Clic sur l'overlay (hors modale) = annuler
                if (e.target === overlay) fermer(false);
            });
            document.addEventListener('keydown', surEchap);

            document.body.appendChild(overlay);
            // Focus initial sur Télécharger pour que Entrée valide directement.
            setTimeout(function () { btnConfirmer.focus(); }, 0);
        });
    }

    /**
     * Affiche une preview pour un objet JSZip et demande confirmation.
     * @param {JSZip} zip
     * @param {string} libelle - mot-clé pour le titre (ex. 'codex', 'archive')
     * @param {Object} [options]
     * @param {string} [options.taille] - lot G (#988) : la taille du fichier, dite par
     *   l'appelant (« environ 1,0 Go »), ajoutée au sous-titre. Texte, jamais du HTML.
     * @returns {Promise<boolean>}
     */
    async function previewZipEtConfirmer(zip, libelle, options) {
        if (!zip || typeof zip.forEach !== 'function') return true; // on ne bloque pas si l'argument est invalide
        var entrees = _construireListeZip(zip);
        var taille = options && options.taille ? ' – ' + String(options.taille) : '';
        return await _afficherModale({
            titre: 'Confirmer l\'export ' + (libelle || ''),
            // Accordé au nombre (mots de Grégoire, lot G, 29 sept. 2026 : plus de « (s) »).
            sousTitre: entrees.length + (entrees.length > 1 ? ' fichiers ou dossiers' : ' fichier ou dossier') + ' à inclure' + taille,
            lignes: entrees,
            note: 'Vérifie qu\'aucun nom de fichier n\'est inattendu avant de continuer.'
        });
    }

    /**
     * Affiche une preview pour un payload JSON (clés racine) et demande
     * confirmation.
     * @param {Object} payload
     * @param {string} libelle
     * @returns {Promise<boolean>}
     */
    async function previewJsonEtConfirmer(payload, libelle) {
        if (!payload || typeof payload !== 'object') return true;
        var lignes = _construireListeJson(payload);
        return await _afficherModale({
            titre: 'Confirmer l\'export ' + (libelle || ''),
            sousTitre: lignes.length + ' champ(s) racine dans le fichier JSON',
            lignes: lignes,
            note: 'Vérifie que la structure correspond à ce que tu attends avant de continuer.'
        });
    }

    // API publique
    window.SecuriteExportPreview = {
        previewZipEtConfirmer: previewZipEtConfirmer,
        previewJsonEtConfirmer: previewJsonEtConfirmer
    };

})();
