/**
 * L'ÉCRAN D'OBSERVATION — la pratique « Par standards » (22 nov. 2026, première version réduite, « à l'essai »)
 *
 * Décisions de Grégoire du 22 nov. 2026 (conception le matin, périmètre réduit à 10 h 24).
 * Mots de l'écran : PROPOSÉS (plans de travail/TEXTES-2026-11-22-observation-par-standards.md).
 *
 * À QUOI ÇA SERT. Pendant une pratique guidée, l'enseignant·e circule et note ce qu'il ou elle voit, sans copie. Le
 * critère de réussite est le temps du geste : quelques secondes par étudiant·e, sur un iPad tenu d'une main.
 *
 * LES GESTES.
 *   1. Au tableau des cibles, « Observer » (le bandeau, en vue étendue comme en vue simple : un seul composant).
 *   2. Choisir une cible, une fois. D'office, tout le groupe défile ; on peut n'en garder que quelques-un·es.
 *   3. Un·e étudiant·e à la fois, son nom en grand ; les critères de la cible (« Respecté », « Non respecté » ou laissés
 *      vides) et un texte bref. Une cible sans critère : le texte seul, et l'écran le dit.
 *   4. « Inscrire et passer au suivant » écrit l'observation et passe au suivant ; le carrousel mène à n'importe qui.
 *   5. L'origine est « observation » d'office ; une touche la passe à « conversation ».
 *
 * CE QUE PORTE LE CARROUSEL, ET RIEN DE PLUS : le nom, « vu aujourd'hui » (une observation ou une conversation inscrite à
 * la date du jour pour cette cible, `InscriptionsCibles.vusALaDate`) et « absent aujourd'hui » (d'après les présences du
 * groupe : la règle de l'Animation, `EquipesLogique.separerAbsentsDuJour`, js/equipes.js ; sans fiche du jour, rien n'est dit). JAMAIS
 * le niveau retenu : il biaiserait le regard. Ce module ne lit pas `NoteCibles`.
 *
 * L'ÉCRAN NE POSE PAS DE NIVEAU. Une observation est une inscription de `inscriptionsCibles` sans niveau ni production
 * (`niveau: null`) : elle n'entre jamais au niveau retenu ni à la note. Seul écrivain : `InscriptionsCibles.inscrire`.
 *
 * Sécurité : tout nom, étiquette, critère passe par `echapperHtml` ; aucun handler inline (attribut `data-oc` et une
 * écoute posée sur la fenêtre). Sur iPad : des zones de 48 px, rien qui dépende d'un survol.
 */
(function () {
    'use strict';

    const MOTS = Object.freeze({
        titre: 'Observer',
        intro: 'Choisis une cible. Tu passes ensuite d’un·e étudiant·e à l’autre : coche ce que tu vois, écris une note brève si tu veux.',
        cible: 'La cible',
        nCriteres: (n) => (n === 0 ? 'sans critère' : `${n} ${n > 1 ? 'critères' : 'critère'}`),
        qui: 'Qui',
        toutLeGroupe: (n) => `Tout le groupe (${n})`,
        quelques: 'Quelques étudiant·es',
        quelquesAide: 'Touche les noms à garder.',
        gardes: (n) => `${n} ${n > 1 ? 'gardé·es' : 'gardé·e'}`,
        commencer: 'Commencer',
        choisisCible: 'Choisis une cible.',
        choisisQuelquun: 'Garde au moins un·e étudiant·e.',
        changerCible: 'Changer de cible',
        origine: 'Origine',
        observation: 'Observation',
        conversation: 'Conversation',
        conversationAide: 'Un échange hors séance : au bureau, par message.',
        vu: 'vu aujourd’hui',
        absent: 'absent aujourd’hui',
        criteresAide: 'Touche « Respecté » ou « Non respecté » ; laisse vide ce que tu n’as pas vu.',
        sansCritere: 'Cette cible n’a pas de critère : écris ce que tu observes.',
        note: 'Ce que tu as vu',
        noteAide: 'Facultatif, bref.',
        inscrire: 'Inscrire et passer au suivant',
        inscrireDernier: 'Inscrire',
        passer: 'Passer',
        fermer: 'Fermer',
        position: (i, n) => `${i} sur ${n}`,
        inscrit: (nom) => `Inscrit pour ${nom}.`,
        finTitre: 'Fin de la liste',
        fin: (vus, n) => `${vus} sur ${n} ${n > 1 ? 'étudiant·es vu·es' : 'étudiant·e vu·e'} aujourd’hui pour cette cible. Touche un nom pour revenir à quelqu’un.`,
        recommencer: 'Revenir au début',
        carrousel: 'Les étudiant·es'
    });

    const I = () => window.InscriptionsCibles;
    const T = () => window.TableauCibles;
    const esc = (t) => echapperHtml(t == null ? '' : String(t));
    const PREFIXE = 'oc';

    let _etat = null;   // { overlay, ctx, etape: 'choix'|'observer', cibleId, groupeEntier, gardes:Set, index, origine, date, absents:Set, retour }

    /* ============================== Fonctions pures ============================== */

    function nomEleve(e) { return `${(e && e.prenom) || ''} ${(e && e.nom) || ''}`.trim() || String((e && e.da) || ''); }

    /** Les étudiant·es qui défilent : tout le groupe, ou ceux et celles gardé·es, dans l'ordre du tableau. */
    function quiDefile(etudiants, groupeEntier, gardes) {
        const liste = Array.isArray(etudiants) ? etudiants : [];
        if (groupeEntier) return liste.slice();
        const g = gardes instanceof Set ? gardes : new Set(gardes || []);
        return liste.filter(e => g.has(String(e.da)));
    }

    /**
     * Ce que porte chaque pastille du carrousel : `{ da, nom, vu, absent }`. Rien d'autre (jamais un niveau).
     * @param {Array} eleves - ceux qui défilent
     * @param {Array} liste - les entrées de `inscriptionsCibles`
     * @param {{ensembleId, cibleId, date, absents:Set}} o
     */
    function etatDuCarrousel(eleves, liste, o) {
        const vus = I().vusALaDate(liste, o.ensembleId, o.cibleId, o.date);
        const absents = o.absents instanceof Set ? o.absents : new Set();
        return (eleves || []).map(e => ({ da: String(e.da), nom: nomEleve(e), vu: vus.has(String(e.da)), absent: absents.has(String(e.da)) }));
    }

    /** Les DA absents à cette date d'après les présences du groupe actif (règle de l'Animation). Sans fiche : personne. */
    function absentsDuJour(eleves, presences, date, coursId) {
        const logique = window.EquipesLogique;   // js/equipes.js : la règle « absent = fiche du jour à 0 période »
        const separer = logique && logique.separerAbsentsDuJour;
        if (typeof separer !== 'function') return new Set();
        const duGroupe = (Array.isArray(presences) ? presences : []).filter(p => p && (!coursId || !p.coursId || p.coursId === coursId));
        return new Set(separer(eleves || [], duGroupe, date).absents.map(e => String(e.da)));
    }

    /** La saisie d'une observation (la forme de `InscriptionsCibles.inscrire`) : aucun niveau, aucune production. */
    function saisieObservation(o) {
        return { da: String(o.da), ensembleId: o.ensembleId, cibleId: o.cible.id, niveau: null, echelleId: null, date: o.date,
            productionId: null, origine: o.origine, noteBreve: o.noteBreve || '', criteres: I().etatDesCriteres(o.cible, o.reponses || {}) };
    }

    /** Les refus d'une observation : vide (ni critère renseigné ni texte), puis ceux du module propriétaire (date…). */
    function motifsObservation(saisie) {
        const vide = !I().aUnCritereRenseigne(saisie.criteres) && String(saisie.noteBreve || '').trim() === '';
        if (vide) return [I().MOTIFS.OBSERVATION_VIDE];
        return I().motifsRefus(saisie, null);
    }

    /* ============================== Le dessin ============================== */

    function _cible() { return _etat.ctx.cibles.find(c => c.id === _etat.cibleId) || null; }
    function _defile() { return quiDefile(_etat.ctx.etudiants, _etat.groupeEntier, _etat.gardes); }

    function _fermerHTML() {
        return `<button type="button" class="modal-fermer" data-oc="fermer" aria-label="${esc(MOTS.fermer)}"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>`;
    }

    function _titreHTML() {
        const essai = (window.EnsemblesCibles && typeof window.EnsemblesCibles.etiquetteEssaiHTML === 'function') ? window.EnsemblesCibles.etiquetteEssaiHTML() : '';
        // Simulation (23 nov. 2026) : la marque, au titre de la fenêtre, à chaque étape.
        const simulation = (_etat.ctx.simulation && window.SimulationPratique) ? window.SimulationPratique.marqueHTML() + ' ' : '';
        return `<h3 class="modal-titre" id="oc-titre">${simulation}${esc(MOTS.titre)} ${essai}</h3>`;
    }

    function _choixHTML() {
        const ctx = _etat.ctx;
        const cibles = ctx.cibles.map(c => {
            const n = (c.criteres || []).length;
            return `<button type="button" class="oc-tuile" data-oc="cible" data-cible="${esc(c.id)}" aria-pressed="${c.id === _etat.cibleId}">`
                + `<span class="oc-tuile-nom">${esc(c.etiquette)}</span><span class="oc-tuile-detail">${esc(MOTS.nCriteres(n))}</span></button>`;
        }).join('');
        const tous = ctx.etudiants.length;
        const noms = _etat.groupeEntier ? '' : `<p class="tc-aide">${esc(MOTS.quelquesAide)} <span>${esc(MOTS.gardes(_etat.gardes.size))}</span></p>
            <div class="oc-noms">${ctx.etudiants.map(e => `<button type="button" class="oc-nom-choix" data-oc="garder" data-da="${esc(e.da)}" aria-pressed="${_etat.gardes.has(String(e.da))}">${esc(nomEleve(e))}</button>`).join('')}</div>`;
        return `${_fermerHTML()}${_titreHTML()}
            <p class="tc-aide">${esc(MOTS.intro)}</p>
            <section class="oc-section"><h4 class="tc-section-titre" id="oc-cible-titre">${esc(MOTS.cible)}</h4>
                <div class="oc-tuiles" role="group" aria-labelledby="oc-cible-titre">${cibles}</div></section>
            <section class="oc-section"><h4 class="tc-section-titre" id="oc-qui-titre">${esc(MOTS.qui)}</h4>
                <div class="oc-bascule" role="group" aria-labelledby="oc-qui-titre">
                    <button type="button" class="oc-bascule-choix" data-oc="groupe-entier" aria-pressed="${_etat.groupeEntier}">${esc(MOTS.toutLeGroupe(tous))}</button>
                    <button type="button" class="oc-bascule-choix" data-oc="quelques" aria-pressed="${!_etat.groupeEntier}">${esc(MOTS.quelques)}</button>
                </div>${noms}</section>
            <p class="tc-alerte u-hide" role="alert"></p>
            <div class="modal-actions"><button type="button" class="btn btn-neutre" data-oc="fermer">${esc(MOTS.fermer)}</button>
                <button type="button" class="btn btn-principal" data-oc="commencer">${esc(MOTS.commencer)}</button></div>`;
    }

    function _carrouselHTML(etats) {
        const pastilles = etats.map((x, i) => {
            const marques = (x.vu ? `<span class="oc-marque oc-marque--vu">${esc(MOTS.vu)}</span>` : '')
                + (x.absent ? `<span class="oc-marque oc-marque--absent">${esc(MOTS.absent)}</span>` : '');
            return `<li><button type="button" class="oc-pastille${x.vu ? ' oc-pastille--vu' : ''}${x.absent ? ' oc-pastille--absent' : ''}" data-oc="aller" data-index="${i}"`
                + `${i === _etat.index ? ' aria-current="true"' : ''}><span class="oc-pastille-nom">${esc(x.nom)}</span>${marques}</button></li>`;
        }).join('');
        return `<nav class="oc-carrousel" aria-label="${esc(MOTS.carrousel)}"><ol class="oc-carrousel-liste">${pastilles}</ol></nav>`;
    }

    function _origineHTML() {
        const o = _etat.origine;
        const C = I().ORIGINES;
        return `<div class="oc-origine"><span class="oc-origine-nom" id="oc-origine-titre">${esc(MOTS.origine)}</span>
            <div class="oc-bascule" role="group" aria-labelledby="oc-origine-titre">
                <button type="button" class="oc-bascule-choix" data-oc="origine" data-valeur="${C.OBSERVATION}" aria-pressed="${o === C.OBSERVATION}">${esc(MOTS.observation)}</button>
                <button type="button" class="oc-bascule-choix" data-oc="origine" data-valeur="${C.CONVERSATION}" aria-pressed="${o === C.CONVERSATION}">${esc(MOTS.conversation)}</button>
            </div>${o === C.CONVERSATION ? `<span class="tc-aide">${esc(MOTS.conversationAide)}</span>` : ''}</div>`;
    }

    function _observerHTML() {
        const ctx = _etat.ctx;
        const cible = _cible();
        const eleves = _defile();
        const etats = etatDuCarrousel(eleves, ctx.inscriptions, { ensembleId: ctx.ensemble.id, cibleId: cible.id, date: _etat.date, absents: _etat.absents });
        const tete = `${_fermerHTML()}${_titreHTML()}
            <div class="oc-tete"><p class="oc-cible">${esc(cible.etiquette)}</p>
                <button type="button" class="btn btn-neutre btn-mini" data-oc="changer">${esc(MOTS.changerCible)}</button></div>
            ${_origineHTML()}${_carrouselHTML(etats)}`;
        if (_etat.index >= eleves.length) {
            const vus = etats.filter(x => x.vu).length;
            return `${tete}<section aria-labelledby="oc-fin-titre"><h4 class="oc-nom" id="oc-fin-titre" tabindex="-1">${esc(MOTS.finTitre)}</h4>
                <p class="tc-aide">${esc(MOTS.fin(vus, eleves.length))}</p>
                <div class="modal-actions"><button type="button" class="btn btn-neutre" data-oc="recommencer">${esc(MOTS.recommencer)}</button>
                    <button type="button" class="btn btn-principal" data-oc="fermer">${esc(MOTS.fermer)}</button></div></section>
                <p class="oc-annonce" role="status" aria-live="polite"></p>`;
        }
        const x = etats[_etat.index];
        const marques = (x.vu ? `<span class="oc-marque oc-marque--vu">${esc(MOTS.vu)}</span>` : '')
            + (x.absent ? `<span class="oc-marque oc-marque--absent">${esc(MOTS.absent)}</span>` : '');
        const dernier = _etat.index === eleves.length - 1;
        return `${tete}
            <form data-oc-bloc novalidate>
                <div class="oc-qui"><h4 class="oc-nom" id="oc-nom" tabindex="-1">${esc(x.nom)}</h4>
                    <span class="oc-position">${esc(MOTS.position(_etat.index + 1, eleves.length))}</span>${marques}</div>
                <section class="oc-section">${T().criteresHTML(cible, PREFIXE, { aide: MOTS.criteresAide, sansCritere: MOTS.sansCritere })}</section>
                <label class="tc-champ" for="oc-note"><span class="tc-champ-nom">${esc(MOTS.note)}</span>
                    <textarea id="oc-note" class="controle-form oc-note" rows="2" maxlength="${I().LONGUEUR_NOTE_BREVE}" placeholder="${esc(MOTS.noteAide)}"></textarea></label>
                <p class="tc-alerte u-hide" role="alert"></p>
                <div class="modal-actions oc-actions"><button type="button" class="btn btn-neutre" data-oc="passer">${esc(MOTS.passer)}</button>
                    <button type="button" class="btn btn-principal oc-inscrire" data-oc="inscrire">${esc(dernier ? MOTS.inscrireDernier : MOTS.inscrire)}</button></div>
            </form>
            <p class="oc-annonce" role="status" aria-live="polite"></p>`;
    }

    /** Redessine la fenêtre ; garde l'annonce et place la pastille courante en vue. */
    function _dessiner(annonce, focus) {
        const contenu = _etat.overlay.querySelector('.oc-fenetre');
        // security-ok : tout texte des données passe par `esc` (echapperHtml) dans les gabarits.
        contenu.innerHTML = _etat.etape === 'choix' ? _choixHTML() : _observerHTML();
        const zone = contenu.querySelector('.oc-annonce');
        if (zone && annonce) zone.textContent = annonce;
        const courante = contenu.querySelector('.oc-pastille[aria-current="true"]');
        if (courante && typeof courante.scrollIntoView === 'function') courante.scrollIntoView({ block: 'nearest', inline: 'center' });
        const cible = focus ? contenu.querySelector(focus) : null;
        if (cible) cible.focus();
    }

    function _alerte(motifs) {
        const zone = _etat.overlay.querySelector('.tc-alerte');
        if (!zone) return;
        zone.textContent = (motifs || []).join(' ');
        zone.classList.toggle('u-hide', !(motifs && motifs.length));
    }

    /* ============================== Les gestes ============================== */

    function _lireAbsents(ctx, date) {
        const presences = (typeof obtenirDonneesSelonMode === 'function') ? (obtenirDonneesSelonMode('presences') || []) : [];
        const coursId = (typeof obtenirCoursActifId === 'function') ? obtenirCoursActifId() : null;
        return absentsDuJour(ctx.etudiants, presences, date, coursId);
    }

    /**
     * Ouvre l'écran d'observation sur le contexte du tableau des cibles (`TableauCibles.completerContexte`).
     * @returns {HTMLElement|null} la fenêtre
     */
    function ouvrir(ctx, retour) {
        if (!ctx || ctx.vide || !ctx.ensemble || !(ctx.cibles || []).length || !(ctx.etudiants || []).length) return null;
        fermer();
        if (T() && typeof T().fermer === 'function') T().fermer();
        const date = I().dateDuJour();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay actif tc-overlay oc-overlay';
        overlay.setAttribute('role', 'presentation');
        // security-ok : contenu dessiné par `_dessiner`, dont les gabarits échappent tout texte.
        overlay.innerHTML = '<div class="modal-contenu tc-fenetre oc-fenetre" role="dialog" aria-modal="true" aria-labelledby="oc-titre"></div>';
        overlay.addEventListener('click', _surClic);
        overlay.addEventListener('submit', (e) => e.preventDefault());
        document.body.appendChild(overlay);
        document.addEventListener('keydown', _surTouche, true);
        _etat = { overlay, ctx, etape: 'choix', cibleId: ctx.cibles.length === 1 ? ctx.cibles[0].id : null, groupeEntier: true,
            gardes: new Set(), index: 0, origine: I().ORIGINES.OBSERVATION, date, absents: _lireAbsents(ctx, date), retour, ecrit: false };
        _dessiner(null, '.oc-tuile');
        return overlay;
    }

    function fermer() {
        if (!_etat) return;
        const { overlay, retour, ecrit, ctx } = _etat;
        document.removeEventListener('keydown', _surTouche, true);
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        _etat = null;
        if (ecrit && T() && typeof T().rerendre === 'function') T().rerendre(null, ctx);   // le tableau derrière (celui de la simulation, sous elle) : ses comptes ont changé
        if (retour && document.contains(retour)) retour.focus();
    }

    /**
     * La date des observations de l'écran ouvert, à la place de celle du jour (23 nov. 2026, le parcours « Suivre ton
     * groupe par cibles » : l'observation de son exemple porte la date de son histoire, une séance de la démo). Les
     * absent·es et « vu aujourd'hui » suivent cette date. Refusée : l'écran fermé, une date qui n'en est pas une.
     * @param {string} date - AAAA-MM-JJ
     * @returns {boolean} true si la date est posée
     */
    function dater(date) {
        if (!_etat || !/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return false;
        _etat.date = String(date);
        _etat.absents = _lireAbsents(_etat.ctx, _etat.date);
        _dessiner(null, null);
        return true;
    }

    function _surTouche(e) {
        if (e.key !== 'Escape' || !_etat) return;
        if (document.getElementById('overlay-ui-dialogue')) return;
        e.preventDefault();
        fermer();
    }

    function _commencer() {
        const motifs = [];
        if (!_etat.cibleId) motifs.push(MOTS.choisisCible);
        if (_defile().length === 0) motifs.push(MOTS.choisisQuelquun);
        if (motifs.length) { _alerte(motifs); return false; }
        _etat.etape = 'observer';
        _etat.index = 0;
        _dessiner(null, '#oc-nom');
        return true;
    }

    function _aller(index, annonce) {
        _etat.index = Math.max(0, index);
        _dessiner(annonce, _etat.index >= _defile().length ? '#oc-fin-titre' : '#oc-nom');
    }

    async function _inscrire() {
        const bloc = _etat.overlay.querySelector('[data-oc-bloc]');
        const eleve = _defile()[_etat.index];
        if (!bloc || !eleve) return false;
        const saisie = saisieObservation({ da: eleve.da, ensembleId: _etat.ctx.ensemble.id, cible: _cible(), date: _etat.date,
            origine: _etat.origine, noteBreve: bloc.querySelector('.oc-note').value, reponses: T().lireCoches(bloc) });
        const motifs = motifsObservation(saisie);
        _alerte(motifs);
        if (motifs.length) return false;
        const r = await I().inscrire([saisie], { geste: 'Inscrire une observation' });
        if (!r.ok || !_etat) return false;
        _etat.ctx.inscriptions = I().ajouter(_etat.ctx.inscriptions, r.entrees);   // « vu aujourd'hui » sans relire le stock
        _etat.ecrit = true;
        _aller(_etat.index + 1, MOTS.inscrit(nomEleve(eleve)));
        return true;
    }

    function _garder(da) {
        if (_etat.gardes.has(da)) _etat.gardes.delete(da); else _etat.gardes.add(da);
        _dessiner(null, `.oc-nom-choix[data-da="${CSS.escape(da)}"]`);
    }

    function _choisirOrigine(valeur) {
        const C = I().ORIGINES;
        _etat.origine = valeur === C.CONVERSATION ? C.CONVERSATION : C.OBSERVATION;
        _rafraichirOrigine();
    }

    /** Les gestes de la fenêtre, par la valeur de `data-oc`. */
    const GESTES = {
        fermer: () => fermer(),
        cible: (g) => { _etat.cibleId = g.dataset.cible; _dessiner(null, `.oc-tuile[data-cible="${CSS.escape(_etat.cibleId)}"]`); },
        'groupe-entier': () => { _etat.groupeEntier = true; _dessiner(null, '[data-oc="groupe-entier"]'); },
        quelques: () => { _etat.groupeEntier = false; _dessiner(null, '[data-oc="quelques"]'); },
        garder: (g) => _garder(String(g.dataset.da)),
        commencer: () => _commencer(),
        changer: () => { _etat.etape = 'choix'; _dessiner(null, '.oc-tuile[aria-pressed="true"]'); },
        origine: (g) => _choisirOrigine(g.dataset.valeur),
        aller: (g) => _aller(Number(g.dataset.index) || 0),
        passer: () => _aller(_etat.index + 1),
        recommencer: () => _aller(0),
        inscrire: () => _inscrire()
    };

    function _surClic(e) {
        if (!_etat) return;
        if (e.target === _etat.overlay) { fermer(); return; }
        const geste = e.target.closest('[data-oc], [data-tc="coche"]');
        if (!geste) return;
        if (geste.dataset.tc === 'coche') { T().basculerCoche(geste); _alerte([]); return; }
        const faire = Object.prototype.hasOwnProperty.call(GESTES, geste.dataset.oc) ? GESTES[geste.dataset.oc] : null;
        if (faire) faire(geste);
    }

    /** La bascule de l'origine sans redessiner le formulaire (les coches en cours restent). */
    function _rafraichirOrigine() {
        const zone = _etat.overlay.querySelector('.oc-origine');
        if (!zone) return;
        const tmp = document.createElement('div');
        // security-ok : `_origineHTML` n'écrit que des mots de l'écran, échappés.
        tmp.innerHTML = _origineHTML();
        zone.replaceWith(tmp.firstElementChild);
        const presse = _etat.overlay.querySelector('.oc-origine [aria-pressed="true"]');
        if (presse) presse.focus();
    }

    window.ObservationCibles = {
        MOTS,
        ouvrir,
        fermer,
        dater,
        quiDefile,
        etatDuCarrousel,
        absentsDuJour,
        saisieObservation,
        motifsObservation
    };
})();
