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

    function _formaterTaille(octets) {
        if (!octets || octets < 0) return '';
        if (octets < 1024) return octets + ' o';
        if (octets < 1024 * 1024) return (octets / 1024).toFixed(1) + ' Ko';
        return (octets / (1024 * 1024)).toFixed(1) + ' Mo';
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
            overlay.style.cssText = [
                'position: fixed', 'top: 0', 'left: 0', 'right: 0', 'bottom: 0',
                'background: rgba(0, 0, 0, 0.65)',
                'z-index: 99999',
                'display: flex', 'align-items: center', 'justify-content: center',
                'padding: 20px'
            ].join('; ');

            var modal = document.createElement('div');
            modal.style.cssText = [
                'background: var(--surface-carte, #1a2730)',
                'color: var(--texte-principal, #ffffff)',
                'border: 1px solid var(--bordure-claire, #2a3942)',
                'border-radius: 12px',
                'padding: 24px',
                'max-width: 640px', 'width: 100%',
                'max-height: 80vh',
                'display: flex', 'flex-direction: column',
                'box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5)',
                'font-family: inherit'
            ].join('; ');

            var titre = document.createElement('h2');
            titre.style.cssText = 'margin: 0 0 6px 0; font-size: 1.2em; color: var(--accent-primaire, #4a9eff);';
            titre.textContent = opts.titre || 'Confirmer l\'export';
            modal.appendChild(titre);

            if (opts.sousTitre) {
                var sousTitre = document.createElement('p');
                sousTitre.style.cssText = 'margin: 0 0 16px 0; font-size: 0.9em; color: var(--gris-moyen, #a0adb6);';
                sousTitre.textContent = opts.sousTitre;
                modal.appendChild(sousTitre);
            }

            var conteneurListe = document.createElement('div');
            conteneurListe.style.cssText = [
                'flex: 1', 'overflow-y: auto',
                'background: var(--surface-conteneur, #142028)',
                'border: 1px solid var(--bordure-claire, #2a3942)',
                'border-radius: 8px',
                'padding: 12px',
                'margin-bottom: 16px',
                'min-height: 80px'
            ].join('; ');

            var lignes = opts.lignes || [];
            var maxAffiche = 100;
            for (var i = 0; i < Math.min(lignes.length, maxAffiche); i++) {
                var ligne = document.createElement('div');
                ligne.style.cssText = 'display: flex; justify-content: space-between; padding: 4px 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85em; border-bottom: 1px solid var(--bordure-tres-claire, #1f2c34);';
                var pri = document.createElement('span');
                pri.style.cssText = 'overflow-wrap: anywhere;';
                pri.textContent = lignes[i].principal;
                var sec = document.createElement('span');
                sec.style.cssText = 'color: var(--gris-moyen, #a0adb6); margin-left: 12px; flex-shrink: 0;';
                sec.textContent = lignes[i].secondaire || '';
                ligne.appendChild(pri);
                ligne.appendChild(sec);
                conteneurListe.appendChild(ligne);
            }
            if (lignes.length > maxAffiche) {
                var resteLigne = document.createElement('div');
                resteLigne.style.cssText = 'padding: 8px 0; font-size: 0.85em; color: var(--gris-moyen, #a0adb6); font-style: italic;';
                resteLigne.textContent = '… et ' + (lignes.length - maxAffiche) + ' entrée(s) supplémentaire(s) non affichée(s).';
                conteneurListe.appendChild(resteLigne);
            }
            if (lignes.length === 0) {
                var vide = document.createElement('div');
                vide.style.cssText = 'padding: 16px; text-align: center; color: var(--gris-moyen, #a0adb6);';
                vide.textContent = 'Aucun élément à inclure.';
                conteneurListe.appendChild(vide);
            }
            modal.appendChild(conteneurListe);

            if (opts.note) {
                var note = document.createElement('p');
                note.style.cssText = 'margin: 0 0 16px 0; font-size: 0.85em; color: var(--gris-moyen, #a0adb6);';
                note.textContent = opts.note;
                modal.appendChild(note);
            }

            var actions = document.createElement('div');
            actions.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px;';

            var btnAnnuler = document.createElement('button');
            btnAnnuler.type = 'button';
            btnAnnuler.textContent = 'Annuler';
            btnAnnuler.style.cssText = 'padding: 8px 16px; border-radius: 6px; border: 1px solid var(--bordure-claire, #2a3942); background: transparent; color: var(--texte-principal, #fff); cursor: pointer; font-family: inherit; font-size: 0.9em;';

            var btnConfirmer = document.createElement('button');
            btnConfirmer.type = 'button';
            btnConfirmer.textContent = 'Télécharger';
            btnConfirmer.style.cssText = 'padding: 8px 16px; border-radius: 6px; border: none; background: var(--accent-primaire, #4a9eff); color: #fff; cursor: pointer; font-family: inherit; font-size: 0.9em; font-weight: 600;';

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
     * @returns {Promise<boolean>}
     */
    async function previewZipEtConfirmer(zip, libelle) {
        if (!zip || typeof zip.forEach !== 'function') return true; // on ne bloque pas si l'argument est invalide
        var entrees = _construireListeZip(zip);
        return await _afficherModale({
            titre: 'Confirmer l\'export ' + (libelle || ''),
            sousTitre: entrees.length + ' fichier(s) ou dossier(s) à inclure',
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
