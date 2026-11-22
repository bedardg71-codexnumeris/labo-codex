/**
 * LE RELEVÉ PAR CIBLE — LA FENÊTRE D'APERÇU ET LES SORTIES PDF (lot 5, première version, 21 nov. 2026)
 *
 * L'enseignant·e ouvre l'aperçu depuis la section « Cibles » du profil (un·e étudiant·e) ou depuis le tableau des cibles
 * (le groupe). Elle voit ce que l'étudiant·e recevra, puis télécharge un PDF (cet·te étudiant·e) ou un ZIP (un PDF par
 * étudiant·e du groupe, comme « Exporter pour Léa »).
 *
 * LECTURE SEULE : rien n'est enregistré, pas même les deux choix de la fenêtre (le mot, les remarques), qui valent le
 * temps de la fenêtre. Les données viennent de `ReleveCiblesData` ; la mise en page, de `ReleveCiblesRendu`.
 *
 * LE PDF : le moule de la synthèse de rétroaction (`travaux-export-pdf.js`, `ajouterPageSynthese` : HTML mis en image par
 * html2canvas, posé dans jsPDF), À UN ÉCART PRÈS, tranché ici : des PAGES LETTRE, les blocs rangés sans en couper un, au
 * lieu d'une seule page aussi haute que le contenu. Un relevé de dix cibles ferait une page de plusieurs mètres, qui ne
 * s'imprime pas. Un bloc plus haut qu'une page (une cible très documentée) reçoit sa page, haute comme lui.
 *
 * Mots de la fenêtre (écran de l'enseignant·e, « tu ») : PROPOSÉS, plans de travail/TEXTES-2026-11-21-releve-par-cible.md.
 *
 * API : window.ReleveCibles = { MOTS, estActif, ouvrir, ouvrirPourLeGroupe, boutonProfilHTML, boutonGroupeHTML, paginer }
 */
(function () {
    'use strict';

    const MOTS = Object.freeze({
        boutonProfil: 'Relevé de l’étudiant·e',
        boutonGroupe: 'Relevés des étudiant·es',
        titre: 'Relevé de l’étudiant·e',
        aide: 'Voici ce que l’étudiant·e recevra. Relis-le avant de le remettre : tes rétroactions et tes remarques y sont, telles que tu les as écrites.',
        etudiant: 'Étudiant·e',
        mot: 'Le mot que lit l’étudiant·e',
        motObjectif: 'objectif',
        motCible: 'cible',
        remarques: 'Montrer les remarques sans niveau',
        fermer: 'Fermer',
        telecharger: 'Télécharger ce relevé (PDF)',
        telechargerGroupe: (n) => `Télécharger les ${n} relevés du groupe (ZIP)`,
        enCours: 'Mise en page du relevé…',
        enCoursGroupe: (i, n) => `Relevé ${i} sur ${n}…`,
        fait: 'Le relevé est téléchargé.',
        faitGroupe: (n) => `${n} relevés téléchargés.`,
        echecs: (liste) => `Relevés qui n’ont pas pu être produits : ${liste}.`,
        echec: 'Le relevé n’a pas pu être produit.',
        indisponible: 'Le relevé n’est offert que pour une pratique « Par standards ».',
        aucunEtudiant: 'Ce groupe n’a pas d’étudiant·e.'
    });

    const D = () => window.ReleveCiblesData;
    const R = () => window.ReleveCiblesRendu;
    const esc = (t) => echapperHtml(t == null ? '' : String(t));
    const ECHELLE_IMAGE = 2;
    let _ouverte = null;   // { overlay, etudiants, da, retour, occupe }

    /* ------------------------------------------------------------------ Ce que la fenêtre lit */

    function estActif() {
        return !!(D() && R() && D().contexte([]));
    }

    /** Les étudiant·es du groupe-cours actif, comme au tableau de notation (exclu·es retiré·es, par nom). */
    function _etudiants() {
        const tous = (typeof window.obtenirEtudiantsCoursActif === 'function') ? (window.obtenirEtudiantsCoursActif() || []) : [];
        const exclu = (e) => typeof window.estEtudiantExclu === 'function' && window.estEtudiantExclu(e);
        return tous.filter(e => e && e.da && !exclu(e))
            .sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr') || String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'));
    }

    function _entete() {
        const infos = (window.ExportPDF && typeof window.ExportPDF.infosCours === 'function') ? (window.ExportPDF.infosCours() || {}) : {};
        const date = (window.InscriptionsCibles && typeof window.InscriptionsCibles.dateDuJour === 'function') ? window.InscriptionsCibles.dateDuJour() : '';
        return { cours: infos.sigleTitre || [infos.sigle, infos.titre].filter(Boolean).join(' · '), enseignant: '', date };
    }

    function _demande() {
        const o = _ouverte && _ouverte.overlay;
        if (!o) return {};
        return { mot: o.querySelector('[data-rc="mot"]').value, remarques: o.querySelector('[data-rc="remarques"]').checked };
    }

    function _releve(ctx, etudiant, demande, entete) {
        return D().construire(ctx, etudiant, demande, entete);
    }

    /* ------------------------------------------------------------------ Le PDF */

    /**
     * Range des blocs de hauteurs connues sur des pages : jamais un bloc coupé ; un bloc plus haut que la page est seul
     * sur la sienne. Pure.
     * @param {number[]} hauteurs - la hauteur de chaque bloc, marge comprise
     * @param {number} utile - la hauteur utile d'une page
     * @returns {Array<{indices:number[], hauteur:number}>}
     */
    function paginer(hauteurs, utile) {
        const pages = [];
        let courante = { indices: [], hauteur: 0 };
        (hauteurs || []).forEach((h, i) => {
            if (courante.indices.length && courante.hauteur + h > utile) { pages.push(courante); courante = { indices: [], hauteur: 0 }; }
            courante.indices.push(i);
            courante.hauteur += h;
        });
        if (courante.indices.length) pages.push(courante);
        return pages;
    }

    function _hote() {
        const hote = document.createElement('div');
        hote.style.cssText = `position: fixed; left: -10000px; top: 0; width: ${R().PAGE.largeur}px; pointer-events: none;`;
        document.body.appendChild(hote);
        return hote;
    }

    /** Le document jsPDF d'un relevé : des pages Lettre mises en image. */
    async function _document(releve) {
        if (typeof html2canvas !== 'function' || !window.jspdf) throw new Error('composants de mise en page absents');
        const P = R().PAGE;
        const blocs = R().blocs(releve);
        const hote = _hote();
        try {
            // security-ok : `feuilleHTML` et `pageHTML` échappent tout texte venu des données (echapperHtml).
            hote.innerHTML = R().feuilleHTML(releve);
            const noeuds = Array.from(hote.querySelectorAll('[data-releve-bloc]'));
            const hauteurs = noeuds.map(n => n.offsetHeight + 14);
            const utile = P.hauteur - 2 * P.margeV - P.pied;
            const pages = paginer(hauteurs, utile);
            let doc = null;
            for (let i = 0; i < pages.length; i++) {
                const hauteur = Math.max(P.hauteur, pages[i].hauteur + 2 * P.margeV + P.pied);
                hote.innerHTML = R().pageHTML(pages[i].indices.map(k => blocs[k]), i + 1, pages.length, releve, hauteur);
                const canvas = await html2canvas(hote.firstElementChild, { scale: ECHELLE_IMAGE, backgroundColor: '#ffffff', useCORS: true,
                    logging: false, width: P.largeur, height: hauteur });
                const format = [P.largeur * ECHELLE_IMAGE, hauteur * ECHELLE_IMAGE];
                if (!doc) doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'px', format, compress: true });
                else doc.addPage(format, 'portrait');
                doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, format[0], format[1]);
            }
            return doc;
        } finally {
            document.body.removeChild(hote);
        }
    }

    const _segment = (t) => String(t == null ? '' : t).normalize('NFC').replace(/[^a-zA-ZÀ-ÿ0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    /** Le nom du fichier d'un·e étudiant·e. En anonymisation : le nom anonyme seul, jamais le DA (comme l'export des travaux, #948). */
    function _nomFichier(etudiant) {
        const anonyme = typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation() === true;
        const nom = _segment([etudiant.nom, etudiant.prenom].filter(Boolean).join('_')) || 'etudiant';
        return anonyme ? `Releve_${nom}.pdf` : `Releve_${nom}_${_segment(etudiant.da)}.pdf`;
    }

    function _telecharger(blob, nom) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nom;
        a.click();
        URL.revokeObjectURL(url);
    }

    /* ------------------------------------------------------------------ La fenêtre */

    function _dire(texte, alerte) {
        const zone = _ouverte && _ouverte.overlay.querySelector('.rc-etat');
        if (!zone) return;
        zone.textContent = texte || '';
        zone.classList.toggle('rc-etat--alerte', !!alerte);
    }

    function _occuper(oui) {
        if (!_ouverte) return;
        _ouverte.occupe = oui;
        _ouverte.overlay.querySelectorAll('[data-rc="telecharger"], [data-rc="groupe"]').forEach(b => { b.disabled = oui; });
    }

    function _dessiner() {
        if (!_ouverte) return;
        const o = _ouverte.overlay;
        const etudiant = _ouverte.etudiants.find(e => String(e.da) === String(_ouverte.da)) || _ouverte.etudiants[0];
        const ctx = D().contexte(_ouverte.etudiants);
        const zone = o.querySelector('.rc-apercu');
        // security-ok : `feuilleHTML` échappe tout texte venu des données (echapperHtml).
        zone.innerHTML = R().feuilleHTML(_releve(ctx, etudiant, _demande(), _entete()));
        const feuille = zone.firstElementChild;
        const large = zone.clientWidth - 24;
        if (feuille && large > 0) feuille.style.zoom = String(Math.min(1, large / R().PAGE.largeur));
    }

    function _fermer() {
        if (!_ouverte) return;
        const { overlay, retour } = _ouverte;
        document.removeEventListener('keydown', _surTouche, true);
        window.removeEventListener('resize', _dessiner);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        _ouverte = null;
        if (retour && document.contains(retour)) retour.focus();
    }

    function _surTouche(e) {
        if (e.key !== 'Escape' || !_ouverte || _ouverte.occupe) return;
        e.preventDefault();
        _fermer();
    }

    async function _telechargerUn() {
        if (!_ouverte || _ouverte.occupe) return;
        const etudiant = _ouverte.etudiants.find(e => String(e.da) === String(_ouverte.da));
        if (!etudiant) return;
        _occuper(true);
        _dire(MOTS.enCours);
        try {
            const doc = await _document(_releve(D().contexte(_ouverte.etudiants), etudiant, _demande(), _entete()));
            _telecharger(doc.output('blob'), _nomFichier(etudiant));
            _dire(MOTS.fait);
        } catch (e) {
            _dire(MOTS.echec, true);
        } finally {
            _occuper(false);
        }
    }

    async function _telechargerGroupe() {
        if (!_ouverte || _ouverte.occupe || typeof JSZip === 'undefined') return;
        const etudiants = _ouverte.etudiants;
        const demande = _demande();
        const entete = _entete();
        const ctx = D().contexte(etudiants);
        const zip = new JSZip();
        const echecs = [];
        let faits = 0;
        _occuper(true);
        try {
            for (let i = 0; i < etudiants.length; i++) {
                _dire(MOTS.enCoursGroupe(i + 1, etudiants.length));
                try {
                    const doc = await _document(_releve(ctx, etudiants[i], demande, entete));
                    zip.file(_nomFichier(etudiants[i]), doc.output('blob'));
                    faits++;
                } catch (e) {
                    echecs.push(`${etudiants[i].prenom || ''} ${etudiants[i].nom || ''}`.trim() || String(etudiants[i].da));
                }
            }
            if (faits > 0) _telecharger(await zip.generateAsync({ type: 'blob' }), `Releves_${_segment(entete.cours) || 'groupe'}_${entete.date}.zip`);
            _dire(echecs.length ? MOTS.echecs(echecs.join(', ')) : MOTS.faitGroupe(faits), echecs.length > 0);
        } finally {
            _occuper(false);
        }
    }

    function _surClic(e) {
        const geste = e.target.closest('[data-rc]');
        if (!geste || !_ouverte) return;
        if (geste.dataset.rc === 'fermer' && !_ouverte.occupe) _fermer();
        else if (geste.dataset.rc === 'telecharger') _telechargerUn();
        else if (geste.dataset.rc === 'groupe') _telechargerGroupe();
    }

    function _surChangement(e) {
        const champ = e.target.closest('[data-rc]');
        if (!champ || !_ouverte) return;
        if (champ.dataset.rc === 'etudiant') _ouverte.da = champ.value;
        _dire('');
        _dessiner();
    }

    function _fenetreHTML(etudiants, da) {
        const choix = D().CHOIX;
        const options = etudiants.map(e => `<option value="${esc(e.da)}"${String(e.da) === String(da) ? ' selected' : ''}>${esc(`${e.nom || ''}, ${e.prenom || ''}`.replace(/^, |, $/g, ''))}</option>`).join('');
        return `
            <button type="button" class="modal-fermer" data-rc="fermer" aria-label="${esc(MOTS.fermer)}"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre" id="rc-fenetre-titre">${esc(MOTS.titre)}</h3>
            <p class="rc-aide">${esc(MOTS.aide)}</p>
            <div class="rc-reglages">
                <label class="rc-champ"><span>${esc(MOTS.etudiant)}</span><select class="controle-form" data-rc="etudiant">${options}</select></label>
                <label class="rc-champ"><span>${esc(MOTS.mot)}</span><select class="controle-form" data-rc="mot">
                    <option value="objectif"${choix.mot === 'objectif' ? ' selected' : ''}>${esc(MOTS.motObjectif)}</option>
                    <option value="cible"${choix.mot === 'cible' ? ' selected' : ''}>${esc(MOTS.motCible)}</option></select></label>
                <label class="rc-coche"><input type="checkbox" data-rc="remarques"${choix.remarques ? ' checked' : ''}> <span>${esc(MOTS.remarques)}</span></label>
            </div>
            <div class="rc-apercu" tabindex="0" aria-label="${esc(MOTS.titre)}"></div>
            <p class="rc-etat" role="status" aria-live="polite"></p>
            <div class="modal-actions">
                <button type="button" class="btn btn-neutre" data-rc="fermer">${esc(MOTS.fermer)}</button>
                <button type="button" class="btn btn-secondaire" data-rc="groupe">${esc(MOTS.telechargerGroupe(etudiants.length))}</button>
                <button type="button" class="btn btn-principal" data-rc="telecharger">${esc(MOTS.telecharger)}</button>
            </div>`;
    }

    /**
     * Ouvre l'aperçu du relevé. `da` : l'étudiant·e montré·e d'abord (le profil) ; absent : le ou la première du groupe.
     * Hors « Par standards », ou sans étudiant·e : rien ne s'ouvre.
     */
    function ouvrir(da) {
        // Le répartiteur `data-action` passe le bouton quand il n'a pas de `data-param` : le DA se lit sur lui, tel qu'écrit
        // (un `data-param` numérique court serait converti en nombre et perdrait ses zéros de tête).
        if (da && da.nodeType === 1) da = da.dataset.da;
        if (!estActif()) return false;
        let etudiants = _etudiants();
        if (da !== undefined && da !== null && !etudiants.some(e => String(e.da) === String(da))) {
            const tous = (typeof obtenirDonneesSelonMode === 'function') ? (obtenirDonneesSelonMode('groupeEtudiants') || []) : [];
            const lui = tous.find(e => e && String(e.da) === String(da));
            if (lui) etudiants = [lui].concat(etudiants);
        }
        if (!etudiants.length) return false;
        _fermer();
        const retour = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay actif rc-overlay';
        overlay.setAttribute('role', 'presentation');
        const premier = (da !== undefined && da !== null) ? String(da) : String(etudiants[0].da);
        // security-ok : `_fenetreHTML` échappe les noms et les DA (echapperHtml).
        overlay.innerHTML = `<div class="modal-contenu rc-fenetre" role="dialog" aria-modal="true" aria-labelledby="rc-fenetre-titre">${_fenetreHTML(etudiants, premier)}</div>`;
        overlay.addEventListener('click', _surClic);
        overlay.addEventListener('change', _surChangement);
        document.body.appendChild(overlay);
        document.addEventListener('keydown', _surTouche, true);
        window.addEventListener('resize', _dessiner);
        _ouverte = { overlay, etudiants, da: premier, retour, occupe: false };
        _dessiner();
        overlay.querySelector('[data-rc="etudiant"]').focus();
        return true;
    }

    function ouvrirPourLeGroupe() {
        return ouvrir();
    }

    /** Le bouton de la section « Cibles » du profil. Vide si le relevé n'est pas offert. */
    function boutonProfilHTML(da) {
        return `<button type="button" class="btn btn-secondaire rc-bouton" data-action="ReleveCibles.ouvrir" data-da="${esc(da)}">${esc(MOTS.boutonProfil)}</button>`;
    }

    /** Le bouton du tableau des cibles. */
    function boutonGroupeHTML() {
        return `<button type="button" class="btn btn-secondaire rc-bouton" data-action="ReleveCibles.ouvrirPourLeGroupe">${esc(MOTS.boutonGroupe)}</button>`;
    }

    window.ReleveCibles = { MOTS, estActif, ouvrir, ouvrirPourLeGroupe, boutonProfilHTML, boutonGroupeHTML, paginer, fermer: _fermer };
})();
