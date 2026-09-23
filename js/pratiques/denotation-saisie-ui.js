/**
 * DÉNOTATION (DEN) — couche 2, lot DEN-2 : UI de saisie du jugement (profil étudiant).
 *
 * Quand la pratique active du groupe-cours est une Dénotation, le profil étudiant
 * offre un PANNEAU DE JUGEMENT (SPEC §6) :
 *  - liste des cibles avec une case « atteinte » PAR cible (garde-fou Dyer natif) ;
 *  - suggestion statistique en ANCRAGE (« l'algorithme propose, le jugement tranche »),
 *    modifiable, jamais imposée ;
 *  - champ note finale (saisie) + justification narrative (traçabilité) ;
 *  - garde visible : tant qu'une cible n'est pas confirmée, la note ne peut pas
 *    certifier (≥ 60) — sans empêcher la saisie d'un 59 (RREC échec).
 *
 * Écriture namespacée via le module SSOT denotation-jugements.js (DEN-0).
 * Sécurité : echapperHtml() sur tout texte ; data-action / data-on-change (zéro
 * handler inline) ; aucune couleur en dur (classes .alerte du design system).
 *
 * @module denotation-saisie-ui
 */
(function () {
    'use strict';

    function echapper(valeur) {
        const s = (valeur === null || valeur === undefined) ? '' : String(valeur);
        return (typeof window.echapperHtml === 'function') ? window.echapperHtml(s) : s;
    }

    function _notifSucces(msg) {
        if (window.notifications && typeof window.notifications.succes === 'function') {
            window.notifications.succes(msg);
        }
    }
    function _notifErreur(msg) {
        if (window.notifications && typeof window.notifications.erreur === 'function') {
            window.notifications.erreur(msg);
        } else {
            console.warn('[DEN] ' + msg);
        }
    }

    /**
     * Retourne l'instance de la pratique active SI c'est une Dénotation, sinon null.
     */
    function _pratiqueDenActive() {
        if (typeof obtenirPratiqueActive !== 'function' || !window.denotationJugements) return null;
        const inst = obtenirPratiqueActive();
        if (!inst || !inst.config) return null;
        return window.denotationJugements.estPratiqueDenotation(inst.config) ? inst : null;
    }

    function estActive() {
        return _pratiqueDenActive() !== null;
    }

    function _ciblesDe(inst) {
        return inst.config.objectifs
            || (inst.config.configuration && inst.config.configuration.objectifs)
            || [];
    }

    function _methodeSuggestion(inst) {
        const conf = inst.config.configuration || {};
        return (conf.suggestion && conf.suggestion.methode)
            || (inst.config.suggestion && inst.config.suggestion.methode)
            || 'mode';
    }

    /**
     * Suggestion statistique en ancrage (optionnelle). Réutilise le helper partagé
     * (DEN-1) ; les niveaux par cible proviennent de la logique STD existante.
     * Retourne null si rien d'exploitable (aucune évaluation liée aux cibles).
     */
    function _suggestion(inst, da) {
        if (typeof window.PratiquePANStandards !== 'function'
            || typeof window.suggererNoteHolistique !== 'function') return null;
        const cibles = _ciblesDe(inst);
        const methode = _methodeSuggestion(inst);
        try {
            const std = new window.PratiquePANStandards();
            if (typeof std._calculerNiveauxParObjectif !== 'function') return null;
            const niveaux = std._calculerNiveauxParObjectif(da, cibles);
            if (!niveaux) return null;
            const valeur = window.suggererNoteHolistique(niveaux, methode);
            if (valeur === null) return null;
            return { methode: methode, pourcentage: Math.round(valeur * 100) };
        } catch (e) {
            return null;
        }
    }

    /**
     * Bannière de garde (état des cibles). Même HTML à l'init et au recalcul live.
     */
    function _gardeBanniere(da, toutesAtteintes) {
        const cls = toutesAtteintes ? 'alerte-succes' : 'alerte-attention';
        const txt = toutesAtteintes
            ? 'Toutes les cibles sont confirmées atteintes — la note saisie peut certifier la réussite.'
            : 'Au moins une cible n\'est pas confirmée atteinte. Tant que c\'est le cas, la note ne peut pas certifier la réussite : elle sera plafonnée à 59. Tu peux quand même enregistrer.';
        return `<div id="den-garde-${echapper(da)}" class="alerte ${cls} den-garde">${txt}</div>`;
    }

    function _toutesAtteintesDOM(da, cibles) {
        if (!cibles.length) return false;
        return cibles.every(function (c) {
            const cb = document.getElementById('den-cible-' + c.id + '-' + da);
            return cb && cb.checked;
        });
    }

    /**
     * Génère le panneau de jugement pour un étudiant (HTML string).
     * @param {string} da
     * @returns {string}
     */
    function panneau(da) {
        const inst = _pratiqueDenActive();
        if (!inst) {
            return '<div class="alerte alerte-information">La pratique active n\'est pas une dénotation.</div>';
        }

        const cibles = _ciblesDe(inst);
        if (cibles.length === 0) {
            return '<div class="alerte alerte-attention">Cette pratique de dénotation n\'a pas encore de cibles d\'apprentissage. Ajoute des cibles dans la configuration de la pratique avant de poser un jugement (la trace des cibles est exigée pour certifier).</div>';
        }

        const pratiqueId = inst.config.id;
        const saisie = window.denotationJugements.lireJugementDenotation(pratiqueId, da) || {};
        const confirmations = saisie.ciblesAtteintes || {};
        const note = (typeof saisie.noteFinale === 'number') ? saisie.noteFinale : '';
        const justif = saisie.justification || '';
        const toutesAtteintes = cibles.every(function (c) { return confirmations[c.id] === true; });
        const suggestion = _suggestion(inst, da);

        const ciblesHtml = cibles.map(function (c) {
            const coche = confirmations[c.id] === true ? 'checked' : '';
            return `
                <label class="den-cible">
                    <input type="checkbox" id="den-cible-${echapper(c.id)}-${echapper(da)}"
                           data-da="${echapper(da)}" data-cible-id="${echapper(c.id)}"
                           data-on-change="denotationSaisie.recalculerGarde" data-param="${echapper(da)}"
                           ${coche}>
                    <span class="den-cible-nom">${echapper(c.nom || c.id)}</span>
                </label>`;
        }).join('');

        const suggestionHtml = suggestion
            ? `<div class="alerte alerte-information den-suggestion">
                   D'après les niveaux atteints par cible (${echapper(suggestion.methode)}) : <strong>${suggestion.pourcentage}&nbsp;%</strong>.
                   <span class="den-suggestion-note">Ancrage statistique — la note reste ton jugement.</span>
               </div>`
            : '';

        return `
            <div class="den-saisie" data-da="${echapper(da)}">
                <p class="den-saisie-intro u-texte-gris">
                    Dénotation : la note finale est un <strong>jugement</strong> que tu poses, gardé par la confirmation
                    que chaque cible est atteinte (voir le guide PAN).
                </p>

                ${_gardeBanniere(da, toutesAtteintes)}

                <fieldset class="den-cibles">
                    <legend>Cibles d'apprentissage</legend>
                    ${ciblesHtml}
                </fieldset>

                ${suggestionHtml}

                <div class="den-champ">
                    <label for="den-note-${echapper(da)}">Note finale (jugement, 0–100)</label>
                    <input type="number" id="den-note-${echapper(da)}" class="controle-form den-note"
                           min="0" max="100" step="1" value="${note}">
                </div>

                <div class="den-champ">
                    <label for="den-justif-${echapper(da)}">Justification (traçabilité)</label>
                    <textarea id="den-justif-${echapper(da)}" class="controle-form den-justif" rows="3"
                              placeholder="Sur quoi se fonde ce jugement ? (cibles atteintes, qualité des productions liées…)">${echapper(justif)}</textarea>
                </div>

                <button type="button" class="btn btn-principal"
                        data-action="denotationSaisie.enregistrer" data-param="${echapper(da)}">
                    Enregistrer le jugement
                </button>
            </div>`;
    }

    /**
     * Recalcule la bannière de garde en direct quand on coche/décoche une cible.
     * Appelé par data-on-change → recalculerGarde(da, el).
     */
    function recalculerGarde(da) {
        const inst = _pratiqueDenActive();
        if (!inst) return;
        const cibles = _ciblesDe(inst);
        const banniere = document.getElementById('den-garde-' + da);
        if (banniere) {
            banniere.outerHTML = _gardeBanniere(da, _toutesAtteintesDOM(da, cibles));
        }
    }

    /**
     * Enregistre le jugement saisi (data-action → enregistrer(da)).
     * Lit l'état des cases, la note et la justification, persiste via le module SSOT.
     */
    function enregistrer(da) {
        const inst = _pratiqueDenActive();
        if (!inst) { _notifErreur('Aucune pratique de dénotation active.'); return; }

        const pratiqueId = inst.config.id;
        const cibles = _ciblesDe(inst);

        // #717 : les coches d'une cible retirée restent enregistrées (elles ne sont plus
        // lues) ; réenregistrer le jugement ne les efface pas.
        const avant = window.denotationJugements.lireJugementDenotation(pratiqueId, da);
        const ciblesAtteintes = Object.assign({}, avant && avant.ciblesAtteintes);
        cibles.forEach(function (c) {
            const cb = document.getElementById('den-cible-' + c.id + '-' + da);
            ciblesAtteintes[c.id] = !!(cb && cb.checked);
        });

        const noteEl = document.getElementById('den-note-' + da);
        let noteFinale = null;
        if (noteEl && noteEl.value !== '') {
            noteFinale = parseInt(noteEl.value, 10);
            if (isNaN(noteFinale) || noteFinale < 0 || noteFinale > 100) {
                _notifErreur('La note finale doit être un nombre entier entre 0 et 100.');
                return;
            }
        }

        const justifEl = document.getElementById('den-justif-' + da);
        const justification = justifEl ? justifEl.value : '';

        const ok = window.denotationJugements.ecrireJugementDenotation(pratiqueId, da, {
            ciblesAtteintes: ciblesAtteintes,
            noteFinale: noteFinale,
            justification: justification
        });

        if (ok) {
            _notifSucces('Jugement enregistré.');
            recalculerGarde(da);
        } else {
            _notifErreur('Échec de l\'enregistrement du jugement.');
        }
    }

    window.denotationSaisie = {
        estActive: estActive,
        panneau: panneau,
        enregistrer: enregistrer,
        recalculerGarde: recalculerGarde
    };
})();
