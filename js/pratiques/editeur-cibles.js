/**
 * ÉDITEUR DES CIBLES D'UNE PRATIQUE DE DÉNOTATION (#717, lot N5, 23 sept. 2026)
 *
 * Décision de Grégoire (23 sept., 9 h 30, réponse A) : chaque cible reçoit une
 * identité permanente À SA CRÉATION. Les coches du jugement sont indexées par cet id
 * (`jugementsDenotation[pratiqueId][da].ciblesAtteintes[cible.id]`, lu par
 * `_calculerPerformanceDenotation`) : déplacer ou renommer une cible ne touche plus
 * aux coches déjà faites ; une cible retirée emporte ses coches.
 *
 * Avant ce lot, l'assistant ET la gestion des pratiques éditaient les cibles dans une
 * zone de texte et les nommaient par POSITION (`cible-1`, `cible-2`…) : retirer la
 * première faisait de la deuxième la `cible-1`, et ses coches glissaient. Une zone de
 * texte ne peut pas porter d'identité ; ce composant édite une liste de champs, un par
 * cible, chaque ligne portant son id (`data-cible-id`). UN composant pour les deux
 * écrans : la faute était recopiée deux fois.
 *
 * Le stock n'est pas converti : les ids `cible-1`, `cible-2`… déjà écrits sont des ids
 * valides, portés tels quels par les lignes. Seule une cible créée ensuite reçoit la
 * forme neuve (`nouvelIdCible`), qui n'est jamais une position ni un id déjà vu.
 *
 * Retirer une cible : les coches de la cible retirée NE SONT PAS effacées des données
 * (limite de Grégoire du 20 sept.) — elles cessent d'être lues. Mais la note change :
 * `confirmerRetraitCibles` pose la question avant que l'écran appelant n'écrive.
 */
(function () {
    'use strict';

    let compteur = 0;

    function echapper(texte) {
        return (typeof window.echapperHtml === 'function') ? window.echapperHtml(texte) : String(texte == null ? '' : texte);
    }

    /**
     * Id neuf d'une cible : horodatage + compteur de la session. Jamais une position ;
     * le compteur rend deux ids d'une même milliseconde distincts, l'horodatage deux
     * sessions distinctes — un id retiré ne revient donc pas.
     * @returns {string}
     */
    function nouvelIdCible() {
        compteur++;
        return 'cible_' + Date.now().toString(36) + '_' + compteur.toString(36);
    }

    function ligneHtml(cible) {
        return `
            <li class="editeur-cibles-ligne" data-cible-id="${echapper(cible.id)}">
                <input type="text" class="controle-form editeur-cibles-nom" value="${echapper(cible.nom || '')}"
                       aria-label="Nom de la cible" placeholder="Nom de la cible">
                <button type="button" class="btn-icone-nu pipeline-btn-reorder" data-action="EditeurCibles.monter" title="Monter" aria-label="Monter"><img src="icons/icon-chevron-up.svg" alt=""></button>
                <button type="button" class="btn-icone-nu pipeline-btn-reorder" data-action="EditeurCibles.descendre" title="Descendre" aria-label="Descendre"><img src="icons/icon-chevron-down.svg" alt=""></button>
                <button type="button" class="btn-icone-nu" data-action="EditeurCibles.retirer" title="Retirer" aria-label="Retirer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
            </li>`;
    }

    /**
     * HTML de la liste (le conteneur appelant la reçoit). Les cibles gardent leur id tel
     * quel ; sans cible, une ligne vide à remplir.
     * @param {Array<{id:string, nom:string}>} cibles
     * @returns {string}
     */
    function rendreEditeurCibles(cibles) {
        const liste = (Array.isArray(cibles) ? cibles : []).filter(c => c && c.id);
        const lignes = liste.length > 0 ? liste : [{ id: nouvelIdCible(), nom: '' }];
        return `
            <div class="editeur-cibles" data-editeur-cibles>
                <ol class="editeur-cibles-liste">${lignes.map(ligneHtml).join('')}</ol>
                <button type="button" class="btn btn-secondaire btn-mini editeur-cibles-ajouter" data-action="EditeurCibles.ajouter">+ Ajouter une cible</button>
            </div>`;
    }

    /**
     * Pose la liste dans `conteneur` et règle les boutons des extrémités.
     * @param {HTMLElement} conteneur
     * @param {Array<{id:string, nom:string}>} cibles
     */
    function poserEditeurCibles(conteneur, cibles) {
        if (!conteneur) return;
        // security-ok: noms et ids échappés par echapperHtml dans ligneHtml
        conteneur.innerHTML = rendreEditeurCibles(cibles);
        majExtremites(conteneur.querySelector('[data-editeur-cibles]'));
    }

    /**
     * Les cibles telles que l'écran les montre, dans l'ordre : `{ id, nom }`. Une ligne
     * laissée vide n'est pas une cible.
     * @param {HTMLElement} conteneur
     * @returns {Array<{id:string, nom:string}>}
     */
    function lireEditeurCibles(conteneur) {
        if (!conteneur) return [];
        return Array.from(conteneur.querySelectorAll('.editeur-cibles-ligne'))
            .map(li => ({ id: li.dataset.cibleId, nom: (li.querySelector('.editeur-cibles-nom')?.value || '').trim() }))
            .filter(c => c.id && c.nom);
    }

    function editeurDe(el) {
        return el && el.closest ? el.closest('[data-editeur-cibles]') : null;
    }

    function majExtremites(editeur) {
        if (!editeur) return;
        const lignes = editeur.querySelectorAll('.editeur-cibles-ligne');
        lignes.forEach((li, i) => {
            li.querySelector('[data-action="EditeurCibles.monter"]').disabled = (i === 0);
            li.querySelector('[data-action="EditeurCibles.descendre"]').disabled = (i === lignes.length - 1);
        });
    }

    // Un changement de structure (déplacer, retirer) est un changement de la liste :
    // l'écran appelant l'entend comme un `change` (la gestion des pratiques enregistre).
    function signalerChangement(editeur) {
        majExtremites(editeur);
        editeur.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function ajouter(el) {
        const editeur = editeurDe(el);
        if (!editeur) return;
        const liste = editeur.querySelector('.editeur-cibles-liste');
        liste.insertAdjacentHTML('beforeend', ligneHtml({ id: nouvelIdCible(), nom: '' }));
        majExtremites(editeur);
        liste.lastElementChild.querySelector('.editeur-cibles-nom').focus();
    }

    function monter(el) {
        const editeur = editeurDe(el);
        const li = el.closest('.editeur-cibles-ligne');
        if (!editeur || !li || !li.previousElementSibling) return;
        li.parentNode.insertBefore(li, li.previousElementSibling);
        signalerChangement(editeur);
    }

    function descendre(el) {
        const editeur = editeurDe(el);
        const li = el.closest('.editeur-cibles-ligne');
        if (!editeur || !li || !li.nextElementSibling) return;
        li.parentNode.insertBefore(li.nextElementSibling, li);
        signalerChangement(editeur);
    }

    function retirer(el) {
        const editeur = editeurDe(el);
        const li = el.closest('.editeur-cibles-ligne');
        if (!editeur || !li) return;
        li.remove();
        signalerChangement(editeur);
    }

    /**
     * Les cibles enregistrées absentes de la nouvelle liste ET cochées pour au moins un
     * étudiant·e : `{ cible, nbEleves }`. Lecture seule.
     * @param {string} pratiqueId
     * @param {Array} anciennes - `objectifs` enregistrés
     * @param {Array} nouvelles - `objectifs` à écrire
     */
    function ciblesRetireesCochees(pratiqueId, anciennes, nouvelles) {
        const gardes = new Set((nouvelles || []).map(c => c && c.id));
        const jugements = (window.denotationJugements && pratiqueId)
            ? (window.denotationJugements.lireTousLesJugements()[pratiqueId] || {}) : {};
        return (anciennes || [])
            .filter(c => c && c.id && !gardes.has(c.id))
            .map(c => ({
                cible: c,
                nbEleves: Object.keys(jugements).filter(da => jugements[da]
                    && jugements[da].ciblesAtteintes && jugements[da].ciblesAtteintes[c.id] === true).length
            }))
            .filter(r => r.nbEleves > 0);
    }

    /**
     * La question posée AVANT d'écrire, si une cible retirée porte des coches : elle
     * nomme la cible et le nombre d'étudiant·es (mots validés par Grégoire le 23 sept. 2026). Rien à demander → vrai.
     * @returns {boolean} vrai si l'écran peut écrire
     */
    function confirmerRetraitCibles(pratiqueId, anciennes, nouvelles) {
        const retraits = ciblesRetireesCochees(pratiqueId, anciennes, nouvelles);
        if (retraits.length === 0) return true;
        const lignes = retraits.map(r => `« ${r.cible.nom || r.cible.id} » : cochée pour ${r.nbEleves} ${r.nbEleves > 1 ? 'étudiant·es' : 'étudiant·e'}`);
        const message = (retraits.length > 1 ? 'Tu retires des cibles déjà cochées.\n\n' : 'Tu retires une cible déjà cochée.\n\n')
            + lignes.join('\n')
            + '\n\nLa note de ces étudiant·es sera recalculée sans ' + (retraits.length > 1 ? 'elles' : 'elle') + '. Les coches restent enregistrées, mais ne comptent plus.\n\nRetirer quand même ?';
        return confirm(message);
    }

    window.EditeurCibles = {
        nouvelId: nouvelIdCible,
        rendre: rendreEditeurCibles,
        poser: poserEditeurCibles,
        lire: lireEditeurCibles,
        ajouter: ajouter,
        monter: monter,
        descendre: descendre,
        retirer: retirer,
        ciblesRetireesCochees: ciblesRetireesCochees,
        confirmerRetraits: confirmerRetraitCibles
    };
})();
