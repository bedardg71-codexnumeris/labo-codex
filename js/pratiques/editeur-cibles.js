/**
 * ÉDITEUR DES CIBLES D'UNE PRATIQUE DE DÉNOTATION (#717, lot N5, 23 sept. 2026)
 * ET DES CIBLES D'UNE PRATIQUE « PAR STANDARDS » (mode `standards`, lot 1, 21 nov. 2026 : plus bas). Le mode de la
 * dénotation est inchangé : mêmes lignes, même forme `{ id, nom }`, mêmes refus.
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
        if (estModeStandards(editeur)) majTotal(editeur);
        editeur.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /* =================================================================================================
     * LE MODE « PAR STANDARDS » (lot 1 de la pratique « Par standards », 21 nov. 2026)
     *
     * Le même composant, étendu : une cible y porte une étiquette, un énoncé, ses critères (un par ligne, chacun
     * pouvant être marqué « critère essentiel »), un poids et la case « terminale » (fiche de conception, C3 à C6).
     * Monter, descendre, retirer et ajouter une cible sont les gestes du mode de la dénotation, qui ne change pas.
     * Chaque cible (`data-cible-id`) et chaque critère (`data-critere-id`) portent leur identité, donnée à leur
     * création et jamais recalculée : renommer, déplacer, réécrire ne la touchent pas.
     * Les poids sont égaux d'office (une cible neuve prend le poids commun) et leur total se lit sous la liste.
     * Lu par l'assistant (wizard-pratique-v2.js) ; la fiche de la pratique montre les cibles sans les éditer.
     * ================================================================================================= */

    let compteurCritere = 0;
    /** Id neuf d'un critère : même règle que `nouvelIdCible` (jamais une position, jamais un id déjà vu). */
    function nouvelIdCritere() {
        compteurCritere++;
        return 'crit_' + Date.now().toString(36) + '_' + compteurCritere.toString(36);
    }

    function estModeStandards(editeur) {
        return !!(editeur && editeur.dataset && editeur.dataset.mode === 'standards');
    }

    function cibleStdVide(poids) {
        return { id: nouvelIdCible(), etiquette: '', enonce: '', criteres: [{ id: nouvelIdCritere(), texte: '', essentiel: false }],
            poids: poids, terminale: false };
    }

    function valeurPoids(poids) {
        if (poids === null || poids === undefined || (typeof poids === 'number' && !Number.isFinite(poids))) return '';
        return String(poids);
    }

    function critereHtml(k) {
        return `
            <li class="editeur-cibles-critere" data-critere-id="${echapper(k.id)}">
                <input type="text" class="controle-form editeur-cibles-critere-texte" value="${echapper(k.texte || '')}"
                       aria-label="Critère" placeholder="Un critère">
                <label class="editeur-cibles-essentiel">
                    <input type="checkbox" class="editeur-cibles-critere-essentiel"${k.essentiel ? ' checked' : ''}>
                    <span>Critère essentiel</span>
                </label>
                <button type="button" class="btn-icone-nu" data-action="EditeurCibles.retirerCritere" title="Retirer ce critère" aria-label="Retirer ce critère"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
            </li>`;
    }

    function ligneStdHtml(cible, partTexte) {
        const criteres = (Array.isArray(cible.criteres) && cible.criteres.length > 0)
            ? cible.criteres : [{ id: nouvelIdCritere(), texte: '', essentiel: false }];
        return `
            <li class="editeur-cibles-ligne editeur-cibles-ligne--std" data-cible-id="${echapper(cible.id)}">
                <div class="editeur-cibles-std-entete">
                    <label class="editeur-cibles-champ editeur-cibles-champ--etiquette">
                        <span class="editeur-cibles-champ-nom">Étiquette</span>
                        <input type="text" class="controle-form editeur-cibles-etiquette" value="${echapper(cible.etiquette || '')}"
                               placeholder="Ex. : Analyser un texte">
                    </label>
                    <label class="editeur-cibles-champ editeur-cibles-champ--poids">
                        <span class="editeur-cibles-champ-nom">Poids</span>
                        <input type="number" class="controle-form editeur-cibles-poids" min="0" step="any" inputmode="decimal"
                               value="${echapper(valeurPoids(cible.poids))}" data-on-input="EditeurCibles.majTotal">
                    </label>
                    <span class="editeur-cibles-part" aria-label="Part du total">${echapper(partTexte || '—')}</span>
                    <label class="editeur-cibles-terminale">
                        <input type="checkbox" class="editeur-cibles-terminale-case"${cible.terminale ? ' checked' : ''}>
                        <span>Cible terminale</span>
                    </label>
                    <span class="editeur-cibles-std-gestes">
                        <button type="button" class="btn-icone-nu pipeline-btn-reorder" data-action="EditeurCibles.monter" title="Monter" aria-label="Monter la cible"><img src="icons/icon-chevron-up.svg" alt=""></button>
                        <button type="button" class="btn-icone-nu pipeline-btn-reorder" data-action="EditeurCibles.descendre" title="Descendre" aria-label="Descendre la cible"><img src="icons/icon-chevron-down.svg" alt=""></button>
                        <button type="button" class="btn-icone-nu" data-action="EditeurCibles.retirer" title="Retirer la cible" aria-label="Retirer la cible"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                    </span>
                </div>
                <label class="editeur-cibles-champ editeur-cibles-champ--enonce">
                    <span class="editeur-cibles-champ-nom">Énoncé</span>
                    <textarea class="controle-form editeur-cibles-enonce" rows="2"
                              placeholder="Commence par un verbe d'action">${echapper(cible.enonce || '')}</textarea>
                </label>
                <div class="editeur-cibles-criteres">
                    <span class="editeur-cibles-champ-nom">Critères, un par ligne</span>
                    <ul class="editeur-cibles-criteres-liste">${criteres.map(critereHtml).join('')}</ul>
                    <button type="button" class="btn btn-secondaire btn-mini" data-action="EditeurCibles.ajouterCritere">+ Ajouter un critère</button>
                </div>
            </li>`;
    }

    /**
     * HTML de l'éditeur des cibles « Par standards ». Les cibles gardent leurs ids ; sans cible, une ligne vide.
     * @param {Array} cibles - forme rangée (`EnsemblesCibles.normaliserCible`)
     * @returns {string}
     */
    function rendreEditeurCiblesStandards(cibles) {
        const liste = (Array.isArray(cibles) ? cibles : []).filter(c => c && c.id);
        const lignes = liste.length > 0 ? liste : [cibleStdVide(1)];
        const etat = etatDesPoids(lignes.map(c => lirePoidsLocal(c.poids)));
        return `
            <div class="editeur-cibles editeur-cibles--std" data-editeur-cibles data-mode="standards">
                <ol class="editeur-cibles-liste">${lignes.map((c, i) => ligneStdHtml(c, etat.parts[i])).join('')}</ol>
                <p class="editeur-cibles-total${etat.valide ? '' : ' editeur-cibles-total--incomplet'}" aria-live="polite">${echapper(etat.texte)}</p>
                <button type="button" class="btn btn-secondaire btn-mini editeur-cibles-ajouter" data-action="EditeurCibles.ajouter">+ Ajouter une cible</button>
            </div>`;
    }

    function poserEditeurCiblesStandards(conteneur, cibles) {
        if (!conteneur) return;
        // security-ok: étiquettes, énoncés, critères et ids échappés par echapperHtml dans ligneStdHtml / critereHtml
        conteneur.innerHTML = rendreEditeurCiblesStandards(cibles);
        const editeur = conteneur.querySelector('[data-editeur-cibles]');
        majExtremites(editeur);
        majTotal(editeur);
    }

    /**
     * Les cibles telles que l'écran les montre, dans l'ordre, AVANT normalisation : une ligne sans étiquette est
     * rendue aussi (le refus la nomme « sans étiquette » si elle porte un poids fautif ; `normaliserCibles` l'écarte).
     * Le poids est rendu tel que saisi (texte) : `EnsemblesCibles.lirePoids` le lit, sans inventer de 1.
     * @param {HTMLElement} conteneur
     * @returns {Array<{id, etiquette, enonce, criteres, poids, terminale}>}
     */
    function lireEditeurCiblesStandards(conteneur) {
        if (!conteneur) return [];
        return Array.from(conteneur.querySelectorAll('.editeur-cibles-ligne--std')).map(li => ({
            id: li.dataset.cibleId,
            etiquette: (li.querySelector('.editeur-cibles-etiquette')?.value || '').trim(),
            enonce: (li.querySelector('.editeur-cibles-enonce')?.value || '').trim(),
            criteres: Array.from(li.querySelectorAll('.editeur-cibles-critere')).map(k => ({
                id: k.dataset.critereId,
                texte: (k.querySelector('.editeur-cibles-critere-texte')?.value || '').trim(),
                essentiel: !!k.querySelector('.editeur-cibles-critere-essentiel')?.checked
            })).filter(k => k.id && k.texte),
            poids: (li.querySelector('.editeur-cibles-poids')?.value || '').trim(),
            terminale: !!li.querySelector('.editeur-cibles-terminale-case')?.checked
        })).filter(c => c.id && (c.etiquette || c.enonce || c.criteres.length > 0));
    }

    function lirePoidsLocal(v) {
        if (window.EnsemblesCibles) return window.EnsemblesCibles.lirePoids(v);
        const n = Number(String(v == null ? '' : v).trim().replace(',', '.'));
        return String(v == null ? '' : v).trim() === '' || !Number.isFinite(n) ? NaN : n;
    }

    /** Le poids d'une cible neuve : le poids commun si tous sont égaux (« égaux d'office »), sinon 1. */
    function poidsDUneCibleNeuve(editeur) {
        const poids = Array.from(editeur.querySelectorAll('.editeur-cibles-poids')).map(i => lirePoidsLocal(i.value));
        if (poids.length > 0 && poids.every(p => p > 0 && p === poids[0])) return poids[0];
        return 1;
    }

    // Les nombres à la française : le module unique (js/note-pourcentage.js, #1137), jamais une virgule posée ici.
    function formaterLocal(n) {
        return window.formaterNombre(n);
    }

    /**
     * Le total des poids, la part de chacun (texte) et la phrase du total. Un poids absent ou qui n'est pas plus grand
     * que zéro rend le total illisible : il le dit, sans en inventer un. Fonction pure.
     * @param {number[]} poids - lus par `lirePoidsLocal` (NaN si vides)
     */
    function etatDesPoids(poids) {
        const valide = poids.length > 0 && poids.every(p => p > 0);
        const total = valide ? poids.reduce((s, p) => s + p, 0) : null;
        return {
            valide: valide,
            total: total,
            parts: poids.map(p => (total && p > 0) ? window.formaterPourcentage(Math.round(p / total * 1000) / 10) : '—'),
            texte: valide
                ? `Total des poids : ${formaterLocal(total)}. Chaque cible compte pour sa part du total.`
                : 'Total des poids : —. Un poids manque, ou n\'est pas plus grand que zéro.'
        };
    }

    /**
     * Le total des poids, et la part de chacun, relus à l'écran. Appelé à la saisie d'un poids (`data-on-input`),
     * et après ajouter, retirer, monter ou descendre.
     * @param {HTMLElement} el - un élément de l'éditeur, ou l'éditeur
     */
    function majTotal(el) {
        const editeur = (el && el.matches && el.matches('[data-editeur-cibles]')) ? el : editeurDe(el);
        if (!editeur) return;
        const champs = Array.from(editeur.querySelectorAll('.editeur-cibles-poids'));
        const etat = etatDesPoids(champs.map(i => lirePoidsLocal(i.value)));
        champs.forEach((i, n) => {
            const part = i.closest('.editeur-cibles-ligne')?.querySelector('.editeur-cibles-part');
            if (part) part.textContent = etat.parts[n];
            // Le poids fautif, et lui seul, se marque : le refus nomme sa cible, la case la montre.
            const refuse = !(lirePoidsLocal(i.value) > 0);
            i.classList.toggle('editeur-cibles-poids--refuse', refuse);
            i.setAttribute('aria-invalid', refuse ? 'true' : 'false');
        });
        const ligne = editeur.querySelector('.editeur-cibles-total');
        if (ligne) {
            ligne.textContent = etat.texte;
            ligne.classList.toggle('editeur-cibles-total--incomplet', !etat.valide);
        }
    }

    function ajouterCritere(el) {
        const li = el && el.closest ? el.closest('.editeur-cibles-ligne--std') : null;
        if (!li) return;
        const liste = li.querySelector('.editeur-cibles-criteres-liste');
        liste.insertAdjacentHTML('beforeend', critereHtml({ id: nouvelIdCritere(), texte: '', essentiel: false }));
        liste.lastElementChild.querySelector('.editeur-cibles-critere-texte').focus();
    }

    function retirerCritere(el) {
        const k = el && el.closest ? el.closest('.editeur-cibles-critere') : null;
        if (!k) return;
        const editeur = editeurDe(k);
        k.remove();
        if (editeur) editeur.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function ajouter(el) {
        const editeur = editeurDe(el);
        if (!editeur) return;
        const liste = editeur.querySelector('.editeur-cibles-liste');
        if (estModeStandards(editeur)) {
            liste.insertAdjacentHTML('beforeend', ligneStdHtml(cibleStdVide(poidsDUneCibleNeuve(editeur))));
            majExtremites(editeur);
            majTotal(editeur);
            liste.lastElementChild.querySelector('.editeur-cibles-etiquette').focus();
            return;
        }
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
     * #1007, lot 2b (3 oct. 2026) : une cible cochée porte des notes ; le codex est proposé
     * AVANT cette question (même condition : la lecture des coches ci-dessus). Les coches
     * sont relues après l'attente : la question nomme ce qui est vrai au moment de répondre.
     * Une cible jamais enregistrée n'est pas dans `anciennes` : elle ne propose jamais rien.
     * @returns {Promise<boolean>} vrai si l'écran peut écrire
     */
    async function confirmerRetraitCibles(pratiqueId, anciennes, nouvelles) {
        // Le pluriel (verdict de Cowork, 4 oct.) : dans l'assistant, plusieurs cibles cochées
        // peuvent partir d'un coup ; la phrase de la fenêtre suit leur nombre.
        const nbCochees = ciblesRetireesCochees(pratiqueId, anciennes, nouvelles).length;
        const porteDesNotes = nbCochees > 0;
        if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression(nbCochees > 1 ? 'cibles' : 'cible'))) return false;
        const retraits = ciblesRetireesCochees(pratiqueId, anciennes, nouvelles);
        if (retraits.length === 0) return true;
        const lignes = retraits.map(r => `« ${r.cible.nom || r.cible.id} » : cochée pour ${r.nbEleves} ${r.nbEleves > 1 ? 'étudiant·es' : 'étudiant·e'}`);
        const message = (retraits.length > 1 ? 'Tu retires des cibles déjà cochées.\n\n' : 'Tu retires une cible déjà cochée.\n\n')
            + lignes.join('\n')
            + '\n\nLa note de ces étudiant·es sera recalculée sans ' + (retraits.length > 1 ? 'elles' : 'elle') + '. Les coches restent enregistrées, mais ne comptent plus.\n\nRetirer quand même ?';
        return confirm(message);
    }

    // Mots VALIDÉS par Grégoire le 23 sept. 2026 (option B, raccourci proposé par Cowork).
    const MOTIF_AUCUNE_CIBLE = 'Ajoute au moins une cible : sans cible, aucune note ne peut dépasser 59.';

    /**
     * Lot N6 (23 sept. 2026) — UNE DÉNOTATION A AU MOINS UNE CIBLE. Sans cible, aucune ne
     * peut être atteinte : toutes les notes sont plafonnées à 59 (mesuré au lot N5). La règle
     * vit ICI, lue par l'assistant (champ requis) et par la gestion des pratiques (refus à
     * l'enregistrement) : elle n'est écrite qu'une fois.
     * @param {Array} cibles - telles que `lireEditeurCibles` les rend
     * @returns {string|null} le motif du refus, ou `null` si la liste peut s'enregistrer
     */
    function motifRefusCibles(cibles) {
        if (Array.isArray(cibles) && cibles.length > 0) return null;
        return MOTIF_AUCUNE_CIBLE;
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
        confirmerRetraits: confirmerRetraitCibles,
        motifRefus: motifRefusCibles,
        // Le mode « Par standards » (lot 1, 21 nov. 2026)
        nouvelIdCritere: nouvelIdCritere,
        rendreStandards: rendreEditeurCiblesStandards,
        poserStandards: poserEditeurCiblesStandards,
        lireStandards: lireEditeurCiblesStandards,
        majTotal: majTotal,
        ajouterCritere: ajouterCritere,
        retirerCritere: retirerCritere
    };
})();
