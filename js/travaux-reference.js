/**
 * LA COPIE DE RÉFÉRENCE (#1229, demande de Grégoire du 4 nov. 2026) — une seconde copie à côté de celle qu'on annote,
 * en Annoter comme en Évaluer : l'original d'une reprise, pour se référer à la première évaluation, ou la copie d'un
 * autre élève, quand on soupçonne un plagiat. « Au plus simple. »
 *
 * ⚠ LECTURE SEULE. La copie et ses annotations telles qu'enregistrées ; aucun outil, aucune écriture dans les copies,
 *   les annotations ou les évaluations, ni à l'ouverture, ni au zoom, ni à la fermeture. La seule écriture du module
 *   est la préférence de l'axe, au geste de la bascule (`axeCopieReference`, docs/DATA-OWNERSHIP.md).
 *
 * ⚠ SON PROPRE ZOOM, SES PROPRES GESTES. La visionneuse sert UN cadre à la fois, le dernier désigné
 *   (`configurerGestesZoom`, travaux-visionneuse.js). Ce module ne l'appelle jamais, ni `setConteneur` : il volerait les
 *   gestes de la copie annotée, et #1218 reviendrait (deux doigts ne la font plus défiler). Il garde son état (document,
 *   page, zoom) et ses écouteurs, posés sur son seul cadre. Le cadre de référence est un frère du cadre d'Annoter, jamais
 *   un descendant : aucun de ses gestes n'atteint les écouteurs de la copie annotée.
 */
(function() {
    'use strict';

    const ZOOM_MIN = 0.25;
    const ZOOM_MAX = 4.0;
    const ZOOM_PAS = 0.1;
    const ZOOM_SENSIBILITE_MOLETTE = 0.025;      // les valeurs de la visionneuse
    const ZOOM_FACTEUR_MAX_EVENEMENT = 1.25;
    const SEUIL_PINCEMENT = 0.06;
    const MARGE = 32;                             // le jeu horizontal de la feuille dans son cadre (2 × 16 px)
    const estSafari = typeof GestureEvent !== 'undefined';

    // Les mots d'écran (proposés à Grégoire, à valider avant la mise en ligne).
    const MOTS = {
        menu: 'Copie de référence',
        etiquette: 'Référence',
        choisir: 'Choisir une copie…',
        original: 'original',
        reprise: 'reprise',
        coteACote: 'Côte à côte',
        superposer: 'L’une sous l’autre',
        fermer: 'Fermer la copie de référence',
        aucuneAutre: 'Aucune autre copie de cette production.',
        invite: 'Choisis la copie à mettre en regard.',
        illisible: 'Cette copie ne s’ouvre pas ici.'
    };

    const etat = {
        ouverte: false,
        fichier: null,         // la fiche de la copie de référence
        pdf: null,             // son document PDF.js (détruit à chaque changement et à la fermeture)
        image: null,           // ou son image
        page: 1,
        pages: 1,
        zoom: 1,               // le zoom du canevas rendu
        mode: 'largeur',       // 'largeur' (pleine largeur du cadre) ou 'manuel'
        jetonOuverture: 0,
        jetonRendu: 0,
        // Pour la vue côte à côte : le zoom de la copie annotée avant qu'elle ne passe dans sa moitié.
        zoomAnnoteAvant: null
    };

    let panneau = null;
    let cadre = null;
    let feuille = null;
    let canevas = null;

    /* ===============================
       OUVRIR, FERMER
       =============================== */

    /** Le geste du menu Actions. */
    function ouvrir() {
        const annotee = _copieAnnotee();
        if (!annotee) return;
        _monterPanneau();
        if (!panneau) return;
        etat.ouverte = true;
        _appliquerAxe(_axe());
        _suivreCopieAnnotee(annotee);
    }

    /** Fermer : Annoter redevient exactement comme avant. Rien n'est écrit. */
    function fermer() {
        etat.jetonOuverture++;
        etat.jetonRendu++;
        _libererDocument();
        etat.ouverte = false;
        etat.fichier = null;
        _rendreMoitieALaCopieAnnotee();
        if (panneau) panneau.remove();
        const zone = document.getElementById('travaux-zone-canvas');
        if (zone) zone.classList.remove('travaux-avec-reference', 'travaux-reference-cote');
        panneau = cadre = feuille = canevas = null;
    }

    /** La copie annotée a changé : une reprise appelle son original ; sinon la référence reste, si elle vaut encore. */
    function _suivreCopieAnnotee(annotee) {
        const choix = copiesProposees(annotee);
        const original = choix.find((c) => c.estOriginal);
        let cible = null;
        if (annotee.estReprise && original) cible = original.fichier.id;
        else if (etat.fichier && choix.some((c) => c.fichier.id === etat.fichier.id)) cible = etat.fichier.id;
        _remplirChoix(choix, cible);
        if (cible) {
            if (!etat.fichier || etat.fichier.id !== cible) afficherCopie(cible);
        } else {
            _libererDocument();
            etat.fichier = null;
            _message(choix.length ? MOTS.invite : MOTS.aucuneAutre);
        }
    }

    /**
     * Les copies proposées : celles de la même production, sans la copie annotée ni celles d'un élève supprimé. L'original
     * de l'élève (même élève, même production, sans `estReprise`) vient d'abord, puis les autres par nom.
     * @param {Object} annotee - la fiche de la copie annotée
     * @returns {Array<{fichier: Object, nom: string, estOriginal: boolean}>}
     */
    function copiesProposees(annotee) {
        if (!annotee || !annotee.productionId) return [];
        const fichiers = (travauxStockage.obtenirFichiersAffiches ? travauxStockage.obtenirFichiersAffiches() : []) || [];
        const liste = fichiers
            .filter((f) => f && f.id !== annotee.id && f.productionId === annotee.productionId)
            .map((f) => ({
                fichier: f,
                nom: _nomEleve(f),
                estOriginal: !!annotee.etudiantDA && f.etudiantDA === annotee.etudiantDA && !f.estReprise
            }));
        liste.sort((a, b) => (b.estOriginal - a.estOriginal) || a.nom.localeCompare(b.nom, 'fr'));
        return liste;
    }

    /** Le nom de l'élève, comme le carrousel : anonymisé quand le mode le veut. */
    function _nomEleve(f) {
        const anonyme = typeof anonymiserNom === 'function' ? anonymiserNom(f.etudiantDA) : null;
        if (anonyme) return String(anonyme);
        const eleve = (typeof travauxImport !== 'undefined' && travauxImport.trouverEtudiantParDA)
            ? travauxImport.trouverEtudiantParDA(f.etudiantDA) : null;
        if (eleve) return eleve.nom ? eleve.nom + ', ' + eleve.prenom : String(eleve.prenom || '');
        const nomFichier = typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier;
        return String(nomFichier || f.etudiantDA || f.id);
    }

    function _copieAnnotee() {
        return (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel()) || null;
    }

    /* ===============================
       LE PANNEAU
       =============================== */

    function _monterPanneau() {
        if (panneau && panneau.isConnected) return;
        const zone = document.getElementById('travaux-zone-canvas');
        if (!zone) return;
        panneau = document.createElement('section');
        panneau.className = 'travaux-reference';
        panneau.id = 'travaux-reference';
        panneau.setAttribute('aria-label', MOTS.menu);
        panneau.innerHTML = `
            <div class="travaux-reference-barre">
              <div class="travaux-reference-commandes">
                <span class="travaux-reference-etiquette">${echapperHtml(MOTS.etiquette)}</span>
                <select id="travaux-reference-choix" class="travaux-reference-choix" aria-label="${echapperHtml(MOTS.menu)}"></select>
                <div class="annot-bande-soudee">
                    <button class="travaux-btn-nav" id="travaux-reference-page-prec" data-action="travauxReference.pagePrecedente" title="Page précédente" aria-label="Page précédente" disabled><img src="icons/icon-chevron-left.svg" alt="" class="nav-seq-icon"></button>
                    <span class="travaux-reference-indicateur" id="travaux-reference-indicateur">--/--</span>
                    <button class="travaux-btn-nav" id="travaux-reference-page-suiv" data-action="travauxReference.pageSuivante" title="Page suivante" aria-label="Page suivante" disabled><img src="icons/icon-chevron-right.svg" alt="" class="nav-seq-icon"></button>
                </div>
                <div class="annot-bande-soudee">
                    <button class="travaux-btn-nav" data-action="travauxReference.zoomArriere" title="Zoom arrière" aria-label="Zoom arrière">−</button>
                    <button class="travaux-btn-zoom" id="travaux-reference-zoom" data-action="travauxReference.zoomLargeur" title="Pleine largeur">100 %</button>
                    <button class="travaux-btn-nav" data-action="travauxReference.zoomAvant" title="Zoom avant" aria-label="Zoom avant">+</button>
                </div>
                <button class="travaux-btn-zoom travaux-reference-axe" id="travaux-reference-axe" data-action="travauxReference.basculerAxe"></button>
                <button class="travaux-btn-nav" data-action="travauxReference.fermer" title="${echapperHtml(MOTS.fermer)}" aria-label="${echapperHtml(MOTS.fermer)}"><img src="icons/icon-close-window.svg" alt="" class="nav-seq-icon"></button>
              </div>
            </div>
            <div class="travaux-reference-cadre" id="travaux-reference-cadre">
                <div class="travaux-reference-feuille" id="travaux-reference-feuille"><canvas id="travaux-reference-canvas"></canvas></div>
                <p class="travaux-reference-message u-hide" id="travaux-reference-message"></p>
            </div>`;
        zone.appendChild(panneau);
        zone.classList.add('travaux-avec-reference');
        cadre = panneau.querySelector('#travaux-reference-cadre');
        feuille = panneau.querySelector('#travaux-reference-feuille');
        canevas = panneau.querySelector('#travaux-reference-canvas');
        panneau.querySelector('#travaux-reference-choix').addEventListener('change', (e) => {
            if (e.target.value) afficherCopie(e.target.value);
        });
        _equiperGestes(cadre);
    }

    function _remplirChoix(choix, idChoisi) {
        const select = panneau && panneau.querySelector('#travaux-reference-choix');
        if (!select) return;
        const options = choix.map((c) => {
            const precision = c.estOriginal ? MOTS.original : (c.fichier.estReprise ? MOTS.reprise : '');
            const texte = c.nom + (precision ? ' — ' + precision : '');
            return `<option value="${echapperHtml(c.fichier.id)}"${c.fichier.id === idChoisi ? ' selected' : ''}>${echapperHtml(texte)}</option>`;
        });
        select.innerHTML = (idChoisi ? '' : `<option value="" selected>${echapperHtml(MOTS.choisir)}</option>`) + options.join('');
        select.disabled = choix.length === 0;
    }

    function _message(texte) {
        if (!panneau) return;
        const p = panneau.querySelector('#travaux-reference-message');
        p.textContent = texte;
        p.classList.toggle('u-hide', !texte);
        feuille.classList.toggle('u-hide', !!texte);
        etat.page = 1;
        etat.pages = 1;
        _mettreAJourBarre();
    }

    /* ===============================
       L'AXE
       =============================== */

    function _axe() {
        const v = typeof obtenirPreference === 'function' ? obtenirPreference('axeCopieReference') : 'pile';
        return v === 'cote' ? 'cote' : 'pile';
    }

    /** La bascule : le seul geste du module qui écrit, et il n'écrit que la préférence. */
    async function basculerAxe() {
        const axe = _axe() === 'cote' ? 'pile' : 'cote';
        if (typeof definirPreference === 'function') definirPreference('axeCopieReference', axe);
        await _appliquerAxe(axe);
    }

    async function _appliquerAxe(axe) {
        const zone = document.getElementById('travaux-zone-canvas');
        if (!zone || !panneau) return;
        zone.classList.toggle('travaux-reference-cote', axe === 'cote');
        const bouton = panneau.querySelector('#travaux-reference-axe');
        bouton.textContent = axe === 'cote' ? MOTS.superposer : MOTS.coteACote;
        bouton.title = bouton.textContent;
        if (axe === 'cote') await _ajusterCopieAnnoteeASaMoitie();
        else await _rendreMoitieALaCopieAnnotee();
        if (etat.mode === 'largeur') await _rendre();
    }

    /**
     * Côte à côte, la copie annotée n'a plus que sa moitié : ajustée à la largeur du cadre entier, elle déborderait de
     * moitié. Elle prend la largeur de son cadre ; son zoom d'avant revient quand elle retrouve toute la place. L'une sous
     * l'autre, elle garde sa largeur : on n'y touche pas (règle du 2 nov. : lire l'écriture d'une marge à l'autre).
     */
    async function _ajusterCopieAnnoteeASaMoitie() {
        const V = travauxVisionneuse;
        const cadreAnnote = document.getElementById('travaux-canvas-container');
        const dims = V.getDimensionsOriginales();
        if (!cadreAnnote || !dims || !dims.w || !V.getFichierActuel()) return;
        if (!etat.zoomAnnoteAvant) etat.zoomAnnoteAvant = { zoom: V.getZoomActuel(), mode: V.getModeZoom() };
        await V.setZoomManuel(Math.min(2, (cadreAnnote.clientWidth - 40) / dims.w));
        V.recentrerVue();
    }

    async function _rendreMoitieALaCopieAnnotee() {
        const avant = etat.zoomAnnoteAvant;
        etat.zoomAnnoteAvant = null;
        if (!avant || !travauxVisionneuse.getFichierActuel()) return;
        const V = travauxVisionneuse;
        if (avant.mode === 'fit') await V.zoomAjuster();
        else if (avant.mode === 'fit-width') await V.zoomPleineLargeur();
        else if (avant.mode === 'fit-height') await V.zoomPleineHauteur();
        else { await V.setZoomManuel(avant.zoom); V.recentrerVue(); }
    }

    /* ===============================
       LA COPIE
       =============================== */

    /**
     * Affiche une copie dans la référence. Lit son fichier et ses annotations ; n'écrit rien.
     * @param {string} fichierId
     */
    async function afficherCopie(fichierId) {
        if (!panneau) return;
        const jeton = ++etat.jetonOuverture;
        _libererDocument();
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        etat.fichier = fichier || null;
        etat.page = 1;
        etat.pages = 1;
        etat.mode = 'largeur';
        if (!fichier) { _message(MOTS.illisible); return; }

        let blob = null;
        try { blob = await travauxStockage.recupererBlob(fichierId); } catch (e) {
            console.warn('[Travaux-Reference] Lecture du fichier refusée :', fichierId, (e && e.message) || e);
        }
        if (jeton !== etat.jetonOuverture) return;
        if (!blob) { _message(_motsSansFichier(fichier)); return; }

        if (!(await _chargerDocument(fichier, blob, jeton))) return;
        _message('');
        await _rendre();
        cadre.scrollLeft = 0;
        cadre.scrollTop = 0;
    }

    /**
     * Charge le document de la copie (PDF ou image) dans l'état. Faux si la copie est illisible ou si une autre
     * ouverture l'a devancée (le document dépassé est alors détruit).
     */
    async function _chargerDocument(fichier, blob, jeton) {
        try {
            if (fichier.typeMIME === 'application/pdf') {
                const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
                if (jeton !== etat.jetonOuverture) { try { pdf.destroy(); } catch (_) { /* déjà détruit */ } return false; }
                etat.pdf = pdf;
                etat.pages = pdf.numPages;
                return true;
            }
            if (String(fichier.typeMIME || '').startsWith('image/')) {
                const image = await _chargerImage(blob);
                if (jeton !== etat.jetonOuverture) return false;
                etat.image = image;
                return true;
            }
        } catch (e) {
            console.warn('[Travaux-Reference] Copie illisible :', fichier.id, (e && e.message) || e);
        }
        if (jeton === etat.jetonOuverture) _message(MOTS.illisible);
        return false;
    }

    /** #1028 : une copie sans fichier le dit, avec les mots de la visionneuse. */
    function _motsSansFichier(fichier) {
        const RC = window.ReserveCopies;
        if (RC && RC.estAuxArchives(fichier.id)) return RC.MOTS.copie.etiquette;
        const mots = travauxVisionneuse.MOTS_SANS_FICHIER || {};
        return fichier.blobStatut === 'manquant' ? mots.manquant : mots.introuvable;
    }

    function _chargerImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image illisible')); };
            img.src = url;
        });
    }

    /** Le second document PDF.js est détruit : son worker ne garde rien (cf. `previsualiserPDF`). */
    function _libererDocument() {
        if (etat.pdf) { try { etat.pdf.destroy(); } catch (_) { /* déjà détruit */ } }
        etat.pdf = null;
        etat.image = null;
    }

    /**
     * Rend la page courante hors écran, puis la pose : deux rendus PDF.js ne se croisent jamais sur le même canevas, et
     * un rendu dépassé (une autre page, un autre zoom) ne s'affiche pas. Les annotations sont dessinées par le
     * dessinateur de l'export, sur les données enregistrées, sans les toucher.
     */
    async function _rendre() {
        if (!canevas || (!etat.pdf && !etat.image)) return;
        const jeton = ++etat.jetonRendu;
        const hors = document.createElement('canvas');
        const ctx = hors.getContext('2d');
        const zoom = await _rendreFond(hors, ctx, jeton);
        if (zoom === null) return;
        const annotation = travauxStockage.obtenirAnnotationFichier(etat.fichier.id);
        const donneesPage = annotation && annotation.pages ? annotation.pages[etat.page - 1] : null;
        if (donneesPage && typeof travauxExportPDF !== 'undefined') {
            await travauxExportPDF.dessinerAnnotationsSurCtx(ctx, hors.width, hors.height, donneesPage, zoom);
        }
        if (jeton !== etat.jetonRendu || !canevas) return;
        canevas.width = hors.width;
        canevas.height = hors.height;
        canevas.getContext('2d').drawImage(hors, 0, 0);
        etat.zoom = zoom;
        _mettreAJourBarre();
    }

    /** Le fond de la page courante (la copie seule), hors écran. Rend son zoom, ou null si un autre rendu l'a devancé. */
    async function _rendreFond(hors, ctx, jeton) {
        if (etat.pdf) {
            const page = await etat.pdf.getPage(etat.page);
            if (jeton !== etat.jetonRendu) return null;
            const zoom = _zoomPour(page.getViewport({ scale: 1 }).width);
            const vp = page.getViewport({ scale: zoom });
            hors.width = Math.max(1, Math.floor(vp.width));
            hors.height = Math.max(1, Math.floor(vp.height));
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            return jeton === etat.jetonRendu ? zoom : null;
        }
        const img = etat.image;
        const zoom = _zoomPour(img.naturalWidth || img.width);
        hors.width = Math.max(1, Math.round((img.naturalWidth || img.width) * zoom));
        hors.height = Math.max(1, Math.round((img.naturalHeight || img.height) * zoom));
        ctx.drawImage(img, 0, 0, hors.width, hors.height);
        return zoom;
    }

    function _zoomPour(largeur) {
        if (etat.mode !== 'largeur' || !cadre || !largeur) return etat.zoom;
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (cadre.clientWidth - MARGE) / largeur));
    }

    function _mettreAJourBarre(zoomAffiche) {
        if (!panneau) return;
        const charge = !!(etat.pdf || etat.image);
        panneau.querySelector('#travaux-reference-indicateur').textContent = charge ? etat.page + '/' + etat.pages : '--/--';
        panneau.querySelector('#travaux-reference-page-prec').disabled = !charge || etat.page <= 1;
        panneau.querySelector('#travaux-reference-page-suiv').disabled = !charge || etat.page >= etat.pages;
        const pct = Math.round((zoomAffiche || etat.zoom) * 100);
        panneau.querySelector('#travaux-reference-zoom').textContent =
            (typeof formaterPourcentage === 'function' ? formaterPourcentage(pct) : pct + ' %');
    }

    /* ===============================
       PAGES ET ZOOM
       =============================== */

    async function pageSuivante() {
        if (etat.pdf && etat.page < etat.pages) { etat.page++; await _rendre(); cadre.scrollTop = 0; }
    }

    async function pagePrecedente() {
        if (etat.pdf && etat.page > 1) { etat.page--; await _rendre(); cadre.scrollTop = 0; }
    }

    async function zoomAvant() { await _zoomerAuCentre(Math.min(ZOOM_MAX, etat.zoom + ZOOM_PAS)); }
    async function zoomArriere() { await _zoomerAuCentre(Math.max(ZOOM_MIN, etat.zoom - ZOOM_PAS)); }
    async function zoomLargeur() { etat.mode = 'largeur'; await _rendre(); }

    function _zoomerAuCentre(cible) {
        if (!cadre) return Promise.resolve();
        return _rezoomer(cible, cadre.clientWidth / 2, cadre.clientHeight / 2);
    }

    /**
     * Change le zoom en gardant sous le même point du cadre la portion de copie qui s'y trouvait. La position du canevas
     * est MESURÉE avant et après, jamais déduite des marges (leçon de la visionneuse, 31 août 2026).
     */
    async function _rezoomer(cible, viseX, viseY) {
        if (!cadre || !canevas) return;
        const avantC = cadre.getBoundingClientRect();
        const avantK = canevas.getBoundingClientRect();
        const fx = avantK.width ? (viseX - (avantK.left - avantC.left)) / avantK.width : 0.5;
        const fy = avantK.height ? (viseY - (avantK.top - avantC.top)) / avantK.height : 0.5;
        etat.mode = 'manuel';
        etat.zoom = cible;
        await _rendre();
        if (!cadre || !canevas) return;
        const apresC = cadre.getBoundingClientRect();
        const apresK = canevas.getBoundingClientRect();
        cadre.scrollLeft = (apresK.left - apresC.left) + cadre.scrollLeft + fx * apresK.width - viseX;
        cadre.scrollTop = (apresK.top - apresC.top) + cadre.scrollTop + fy * apresK.height - viseY;
    }

    /* ===============================
       LES GESTES — sur le seul cadre de référence
       =============================== */

    let geste = null;          // { cible, origineFixee, viseX, viseY, depart, engagee, minuterie }
    let deuxDoigts = null;     // { x, y, scrollX, scrollY }

    function _charge() { return !!(etat.pdf || etat.image); }

    function _nouveauGeste() {
        return { cible: etat.zoom, depart: etat.zoom, origineFixee: false, viseX: 0, viseY: 0, engagee: null, minuterie: null };
    }

    /** L'aperçu d'un geste : une échelle CSS sur la feuille, sans re-rendu ; le point visé se fige au premier événement. */
    function _apercu(cible, clientX, clientY) {
        if (!geste.origineFixee) {
            const r = feuille.getBoundingClientRect();
            feuille.style.transformOrigin = (clientX - r.left) + 'px ' + (clientY - r.top) + 'px';
            const c = cadre.getBoundingClientRect();
            geste.viseX = clientX - c.left;
            geste.viseY = clientY - c.top;
            geste.origineFixee = true;
        }
        geste.cible = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, cible));
        feuille.style.transform = 'scale(' + (geste.cible / etat.zoom) + ')';
        _mettreAJourBarre(geste.cible);
    }

    async function _finirGeste() {
        const fini = geste;
        geste = null;
        if (!fini || !feuille) return;
        feuille.style.transform = '';
        feuille.style.transformOrigin = '';
        if (!fini.origineFixee || Math.abs(fini.cible - etat.zoom) < 0.01) { _mettreAJourBarre(); return; }
        await _rezoomer(fini.cible, fini.viseX, fini.viseY);
    }

    /** Tant que les doigts posés glissent sans pincer, l'échelle ne bouge pas (seuil de la visionneuse). */
    function _echellePincement(brute) {
        if (!deuxDoigts) return brute;
        if (geste.engagee === null) {
            if (Math.abs(brute - 1) < SEUIL_PINCEMENT) return null;
            geste.engagee = brute;
        }
        return brute / geste.engagee;
    }

    function _equiperGestes(el) {
        // Trackpad du Mac (pincement) et Ctrl + molette : le zoom. La molette seule défile, nativement.
        el.addEventListener('wheel', (e) => {
            if ((!e.ctrlKey && !e.metaKey) || !_charge()) return;
            e.preventDefault();
            if (!e.deltaY) return;
            if (!geste) geste = _nouveauGeste();
            const brut = Math.exp(-e.deltaY * ZOOM_SENSIBILITE_MOLETTE);
            const facteur = Math.min(ZOOM_FACTEUR_MAX_EVENEMENT, Math.max(1 / ZOOM_FACTEUR_MAX_EVENEMENT, brut));
            _apercu(geste.cible * facteur, e.clientX, e.clientY);
            clearTimeout(geste.minuterie);
            geste.minuterie = setTimeout(_finirGeste, 100);
        }, { passive: false });

        if (estSafari) {
            // Safari (iPad et Mac) : le pincement arrive en gesture* ; les bloquer empêche le zoom de la page entière.
            el.addEventListener('gesturestart', (e) => {
                e.preventDefault();
                if (_charge()) geste = _nouveauGeste();
            }, { passive: false });
            el.addEventListener('gesturechange', (e) => {
                e.preventDefault();
                if (!geste) return;
                const echelle = _echellePincement(e.scale);
                if (echelle === null) return;
                const x = e.clientX != null ? e.clientX : e.pageX - window.scrollX;
                const y = e.clientY != null ? e.clientY : e.pageY - window.scrollY;
                _apercu(geste.depart * echelle, x, y);
            }, { passive: false });
            el.addEventListener('gestureend', () => { if (geste) _finirGeste(); });
        } else {
            el.addEventListener('touchmove', (e) => {
                if (!deuxDoigts || !geste || e.touches.length !== 2) return;
                const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
                const echelle = _echellePincement(d / geste.distance);
                if (echelle === null) return;
                _apercu(geste.depart * echelle, (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    (e.touches[0].clientY + e.touches[1].clientY) / 2);
            }, { passive: false });
        }

        // Deux doigts déplacent la copie (iPad) ; le stylet n'est jamais un doigt.
        const amorcer = (e) => {
            const t = Array.from(e.touches || []);
            if (t.length < 2 || t.some((x) => x.touchType === 'stylus') || !_charge()) {
                deuxDoigts = null;
                if (!estSafari && geste && t.length === 0) _finirGeste();
                return;
            }
            deuxDoigts = { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2, scrollX: el.scrollLeft, scrollY: el.scrollTop };
            if (!estSafari && !geste) {
                geste = _nouveauGeste();
                geste.distance = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY) || 1;
            }
        };
        el.addEventListener('touchstart', amorcer, { passive: true });
        el.addEventListener('touchend', amorcer);
        el.addEventListener('touchcancel', amorcer);
        el.addEventListener('touchmove', (e) => {
            if (!deuxDoigts || !e.touches || e.touches.length < 2 || !e.cancelable) return;
            e.preventDefault();
            const x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const avantX = el.scrollLeft;
            const avantY = el.scrollTop;
            el.scrollLeft = deuxDoigts.scrollX - (x - deuxDoigts.x);
            el.scrollTop = deuxDoigts.scrollY - (y - deuxDoigts.y);
            // Le point fixe d'un pincement en cours défile avec la copie.
            if (geste && geste.origineFixee) {
                geste.viseX -= el.scrollLeft - avantX;
                geste.viseY -= el.scrollTop - avantY;
            }
        }, { passive: false });
    }

    /* ===============================
       SUIVRE LA COPIE ANNOTÉE
       =============================== */

    window.addEventListener('travaux-fichier-ouvert', (e) => {
        if (!etat.ouverte) return;
        if (!panneau || !panneau.isConnected) { fermer(); return; }   // la visionneuse a été reconstruite
        const annotee = (e.detail && e.detail.fichier) || _copieAnnotee();
        if (annotee) _suivreCopieAnnotee(annotee);
    });

    // La copie annotée fermée pour de bon (et non remplacée dans le même tour, cf. #1028) : la référence part avec elle.
    window.addEventListener('travaux-fichier-ferme', () => {
        if (!etat.ouverte) return;
        setTimeout(() => {
            if (etat.ouverte && (!_copieAnnotee() || !panneau || !panneau.isConnected)) fermer();
        }, 0);
    });

    window.travauxReference = {
        ouvrir: ouvrir,
        fermer: fermer,
        afficherCopie: afficherCopie,
        basculerAxe: basculerAxe,
        pageSuivante: pageSuivante,
        pagePrecedente: pagePrecedente,
        zoomAvant: zoomAvant,
        zoomArriere: zoomArriere,
        zoomLargeur: zoomLargeur,
        copiesProposees: copiesProposees,
        estOuverte: function() { return etat.ouverte; },
        getFichier: function() { return etat.fichier; },
        getZoom: function() { return etat.zoom; },
        getPage: function() { return etat.page; },
        MOTS: MOTS
    };
})();
