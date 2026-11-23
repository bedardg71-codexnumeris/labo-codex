/**
 * UNE PRATIQUE « PAR STANDARDS » EN SIMULATION, à côté de la pratique officielle d'un groupe (23 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-23-pratique-en-simulation.md.
 * Mesure : plans de travail/RAPPORT-2026-11-23-pratique-a-cote-mesure.md (dont ce lot est le « lot 1 »).
 *
 * LE LIEN : `groupesCours[].simulationPratiqueId`, un champ de plus sur le groupe-cours. Écrit par la fiche du groupe-cours
 * (js/trimestre-v2-groupes-cours.js), seul écrivain ; LU ICI, seul lecteur. Il n'entre dans aucun miroir (`infoCours`,
 * `groupeCoursActif`). Le pointeur de la pratique officielle (`pratiqueId`) n'est ni lu pour un calcul ni écrit ici.
 *
 * CE QUI NE BOUGE JAMAIS : la note officielle, les indices, le dépistage, l'export des résultats et le PDF d'une copie ne
 * lisent que la pratique désignée (`designerPratiqueActive`). Ce module ne passe par aucun d'eux.
 *
 * LA LECTURE : tout état autre que « ok » se lit « aucune simulation », avec son motif en clair. Rien n'est écrit à la
 * lecture : un pointeur vers une pratique supprimée reste tel quel, et les inscriptions faites sous elle restent au stock
 * (`inscriptionsCibles` n'accepte que des ajouts).
 *
 * L'ÉCRAN : une entrée à part sous le tableau de notation ; elle ouvre le tableau des cibles de la simulation dans SON
 * hôte (`#tableau-simulation-hote`), jamais à la place du contenu du tableau officiel. Rouvrir la sous-section montre
 * toujours le tableau officiel. Vue étendue seulement.
 *
 * Mots de l'écran : « Simulation » est décidé par Grégoire ; les autres sont PROPOSÉS
 * (plans de travail/TEXTES-2026-11-23-pratique-en-simulation.md).
 */
(function () {
    'use strict';

    const CHAMP = 'simulationPratiqueId';

    const MOTS = Object.freeze({
        marque: 'Simulation',
        // La fiche du groupe-cours
        champ: '7. Simulation (facultatif)',
        champAucune: '— Aucune simulation —',
        champAide: 'Une pratique « Par standards » à essayer sur ce groupe, à côté de sa pratique de notation. Elle ne change aucune note.',
        champSupprimee: 'Pratique supprimée',
        refusOfficielle: 'La simulation ne peut pas être la pratique de notation du groupe. Choisis une autre pratique, ou aucune simulation.',
        refusMemeEnsemble: 'Cette pratique partage ses cibles avec la pratique de notation du groupe : ce qui s’y inscrirait compterait dans la note. Choisis une autre pratique, ou aucune simulation.',
        refusAutreFamille: 'Seule une pratique « Par standards » peut être mise en simulation.',
        // L'entrée, sous le tableau de notation
        entree: (nom) => `Ce groupe a une pratique en simulation : « ${nom} ».`,
        ouvrir: 'Ouvrir la simulation',
        aucune: 'Aucune simulation.',
        motifIntrouvable: 'La pratique que ce groupe avait en simulation n’existe plus dans ce trimestre. Les niveaux et les observations inscrits sous elle sont gardés.',
        motifAutreFamille: 'La pratique que ce groupe avait en simulation n’est plus une pratique « Par standards ». Les niveaux et les observations inscrits sous elle sont gardés.',
        motifOfficielle: 'La pratique que ce groupe avait en simulation est devenue sa pratique de notation.',
        motifMemeEnsemble: 'La pratique que ce groupe avait en simulation partage ses cibles avec sa pratique de notation : elle ne peut pas être simulée à côté d’elle.',
        ouRegler: 'La simulation se choisit dans la fiche du groupe-cours.',
        // L'écran de la simulation
        bandeau: (officielle) => officielle
            ? `Rien de ce qui s’inscrit ici ne compte dans la note du groupe. Sa pratique de notation reste « ${officielle} ».`
            : 'Rien de ce qui s’inscrit ici ne compte dans la note du groupe.',
        revenir: 'Revenir au tableau de notation',
        titre: 'Tableau des cibles'
    });

    const MOTIFS = Object.freeze({
        introuvable: MOTS.motifIntrouvable, 'autre-famille': MOTS.motifAutreFamille,
        officielle: MOTS.motifOfficielle, 'meme-ensemble': MOTS.motifMemeEnsemble
    });

    const esc = (t) => echapperHtml(t == null ? '' : String(t));

    /* ============================== LA LECTURE ============================== */

    function _trouver(id) {
        return (id && typeof trouverPratiqueEnBibliotheque === 'function') ? trouverPratiqueEnBibliotheque(id) : null;
    }

    /** La famille d'une entrée de bibliothèque, lue comme la désignation la lit (`designerPratiqueActive`). */
    function _famille(donnees) {
        const type = donnees && ((donnees.configuration && donnees.configuration.type) || donnees.type || (donnees.config && donnees.config.type));
        return type ? normaliserIdPratique(type) : null;
    }

    function estParStandards(donnees) { return _famille(donnees) === 'cibles'; }

    function _ensembleDe(donnees) {
        const conf = (donnees && (donnees.configuration || donnees.config)) || {};
        return conf.ensembleCiblesId || null;
    }

    /**
     * Ce que vaut un lien de simulation, devant la pratique officielle du groupe. Lecture seule.
     * @param {?string} idBrut - `groupesCours[].simulationPratiqueId`
     * @param {?string} idOfficiel - `groupesCours[].pratiqueId` (lu pour comparer, jamais écrit)
     * @returns {{etat: 'aucune'|'ok'|'introuvable'|'autre-famille'|'officielle'|'meme-ensemble', idBrut: ?string,
     *            id: ?string, nom: string, donnees: ?Object, motif: string}}
     */
    function examiner(idBrut, idOfficiel) {
        const rien = (etat) => ({ etat, idBrut: idBrut || null, id: null, nom: '', donnees: null, motif: MOTIFS[etat] || '' });
        if (!idBrut) return rien('aucune');
        const donnees = _trouver(idBrut);
        if (!donnees) return rien('introuvable');
        if (!estParStandards(donnees)) return rien('autre-famille');
        const officielle = _trouver(idOfficiel);
        if (idOfficiel && (idOfficiel === idBrut || (officielle && officielle.id === donnees.id))) return rien('officielle');
        const ensemble = _ensembleDe(donnees);
        if (officielle && estParStandards(officielle) && ensemble && _ensembleDe(officielle) === ensemble) return rien('meme-ensemble');
        return { etat: 'ok', idBrut, id: donnees.id, nom: donnees.nom || '', donnees, motif: '' };
    }

    /** Le groupe-cours actif, dans la liste du trimestre (la source ; `groupeCoursActif` n'en est qu'un pointeur). */
    function _groupeActif() {
        const actif = db.getSync('groupeCoursActif', null);
        if (!actif || !actif.id) return null;
        const liste = db.getSync(cle('groupesCours'), []);
        return (Array.isArray(liste) ? liste.find(g => g && g.id === actif.id) : null) || null;
    }

    /** La simulation du groupe-cours actif. `groupeId` : null sans groupe actif. */
    function lire() {
        const gc = _groupeActif();
        return Object.assign(examiner(gc ? gc[CHAMP] : null, gc ? gc.pratiqueId : null), { groupeId: gc ? gc.id : null });
    }

    /** Parmi des pratiques du trimestre, celles qu'on peut mettre en simulation : les « Par standards ». */
    function candidatesParmi(pratiques) {
        return (Array.isArray(pratiques) ? pratiques : []).filter(p => p && estParStandards(p));
    }

    /**
     * La fiche du groupe-cours, avant d'écrire : pourquoi ce choix est refusé, ou ''. Un choix inchangé n'est jamais
     * refusé (un lien vers une pratique supprimée reste tant qu'on n'y touche pas).
     */
    function motifDeRefus(idChoisi, idOfficiel, idDejaRange) {
        if (!idChoisi || idChoisi === idDejaRange) return '';
        const etat = examiner(idChoisi, idOfficiel).etat;
        if (etat === 'officielle') return MOTS.refusOfficielle;
        if (etat === 'meme-ensemble') return MOTS.refusMemeEnsemble;
        return etat === 'ok' ? '' : MOTS.refusAutreFamille;
    }

    /* ============================== LA MARQUE ============================== */

    /** « Simulation », en étiquette : au bandeau, au titre du tableau, au titre de chaque fenêtre. Lisible sans survol. */
    function marqueHTML() {
        return `<span class="sim-marque">${esc(MOTS.marque)}</span>`;
    }

    /* ============================== L'ENTRÉE ET L'ÉCRAN ============================== */

    let _ouvert = null;   // { groupeId, pratiqueId } : la simulation à l'écran

    const _hote = () => document.getElementById('tableau-simulation-hote');
    const _entree = () => document.getElementById('tableau-simulation-entree');
    const _officiel = () => document.getElementById('tableau-notation-hote');

    function _entreeHTML(s) {
        if (s.etat === 'aucune') return '';
        if (s.etat === 'ok') {
            return `<div class="sim-entree">${marqueHTML()}<span class="sim-entree-texte">${esc(MOTS.entree(s.nom))}</span>`
                + `<button type="button" class="btn btn-secondaire" data-sim="ouvrir">${esc(MOTS.ouvrir)}</button></div>`;
        }
        return `<div class="sim-entree sim-entree--aucune"><p class="sim-entree-texte"><strong>${esc(MOTS.aucune)}</strong> ${esc(s.motif)} ${esc(MOTS.ouRegler)}</p></div>`;
    }

    function _surClic(e) {
        const geste = e.target.closest('[data-sim]');
        if (!geste) return;
        if (geste.dataset.sim === 'ouvrir') ouvrir();
        else if (geste.dataset.sim === 'fermer') fermer();
    }

    function _ecouter(noeud) {
        if (!noeud || noeud._simEcoutes) return;
        noeud._simEcoutes = true;
        noeud.addEventListener('click', _surClic);
    }

    function _nomOfficielle() {
        const d = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive() : null;
        return (d && d.etat === 'ok' && d.donnees && d.donnees.nom) || '';
    }

    function _valide(s) {
        return !!_ouvert && s.etat === 'ok' && s.groupeId === _ouvert.groupeId && s.id === _ouvert.pratiqueId;
    }

    /** Dessine l'écran de la simulation dans son hôte. Le tableau est celui des cibles, sur le contexte de la simulation. */
    function _rendre(s) {
        const hote = _hote();
        const avant = hote.querySelector('.tn-defilement');
        const defilement = avant ? avant.scrollLeft : 0;
        const base = window.TableauNotation.contexteDeSimulation({ id: s.id, donnees: s.donnees });
        // security-ok : `esc` (echapperHtml) sur tout texte ; `construireHTML` échappe les siens.
        hote.innerHTML = `<div class="sim-bandeau" role="status">${marqueHTML()}<span class="sim-bandeau-texte">${esc(MOTS.bandeau(_nomOfficielle()))}</span>`
            + `<button type="button" class="btn btn-secondaire sim-revenir" data-sim="fermer">${esc(MOTS.revenir)}</button></div>`
            + window.TableauCibles.construireHTML(base);
        _ecouter(hote);
        window.TableauCibles.apresRendu(hote, base);
        const zone = hote.querySelector('.tn-defilement');
        if (zone) zone.scrollLeft = defilement;
        window.TableauNotation.suivreDebordement(hote);
    }

    function _montrer(simulation) {
        [[_hote(), !simulation], [_officiel(), simulation], [_entree(), simulation]].forEach(([n, cache]) => { if (n) n.classList.toggle('u-hide', cache); });
    }

    /** Ouvre la simulation du groupe actif. Rend false si le groupe n'en a pas d'ouvrable. */
    function ouvrir() {
        const s = lire();
        if (s.etat !== 'ok' || !_hote() || !window.TableauCibles || !window.TableauNotation) return false;
        _ouvert = { groupeId: s.groupeId, pratiqueId: s.id };
        _montrer(true);
        _rendre(s);
        const titre = _hote().querySelector('.tn-titre');
        if (titre) titre.focus();
        return true;
    }

    /** Ferme l'écran de la simulation : le tableau officiel et l'entrée reparaissent. Rien n'est écrit. */
    function fermer() {
        if (!_ouvert) return;
        _ouvert = null;
        if (window.TableauCibles) window.TableauCibles.fermer();
        if (window.ObservationCibles) window.ObservationCibles.fermer();
        const hote = _hote();
        if (hote) hote.innerHTML = '';
        _montrer(false);
        const bouton = _entree() && _entree().querySelector('[data-sim="ouvrir"]');
        if (bouton) bouton.focus();
    }

    /** Après une écriture faite sous la simulation (`TableauCibles`) : le tableau de la simulation, jamais l'officiel. */
    function rerendre() {
        if (!_ouvert) return;
        const s = lire();
        if (_valide(s)) _rendre(s); else fermer();
    }

    /**
     * Appelé par `tableau-notation.js` après chaque rendu du tableau officiel (vue étendue) : l'entrée suit le groupe ;
     * une simulation à l'écran y reste si elle vaut toujours pour ce groupe, sinon elle se ferme.
     */
    function apresRenduOfficiel() {
        const entree = _entree();
        if (!entree) return;
        // security-ok : `_entreeHTML` échappe tout texte (esc).
        entree.innerHTML = _entreeHTML(lire());
        _ecouter(entree);
        rerendre();
    }

    window.SimulationPratique = {
        MOTS,
        lire,                 // la simulation du groupe-cours actif (lecture seule)
        candidatesParmi,      // la fiche du groupe-cours : les pratiques offertes
        motifDeRefus,         // la fiche du groupe-cours : avant d'écrire
        marqueHTML,           // tableau-cibles.js, observation-cibles.js : « Simulation » au titre
        ouvrir,
        fermer,               // tableau-notation.js : rouvrir la sous-section montre l'officiel
        rerendre,             // tableau-cibles.js : après une écriture faite sous la simulation
        apresRenduOfficiel    // tableau-notation.js : l'entrée, après chaque rendu du tableau officiel
    };
})();
