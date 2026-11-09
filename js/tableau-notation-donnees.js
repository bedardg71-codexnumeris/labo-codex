/**
 * TABLEAU DE NOTATION — les données (lot 1, 9 nov. 2026)
 *
 * Plan : `plans de travail/PLAN-2026-11-09-tableau-de-notation.md`. Ébauches :
 * `plans de travail/EBAUCHE-2026-11-09-tableau-standards.dc.html` et `…-specifications.dc.html`.
 *
 * UN RÉSULTAT SANS GRILLE. Pour reporter trente résultats évalués ailleurs, l'enseignant·e saisit,
 * production par production, ce que sa pratique demande (décision de Grégoire, 9 nov.) :
 *   - Standards : un NIVEAU de l'échelle de la pratique. La copie porte `niveauFinal` (le code) et
 *     `noteFinale` (la valeur ponctuelle du niveau, `valeurNumeriqueDuNiveau`) : la conversion code → note
 *     qu'une grille holistique fait déjà. Le calcul des standards la lit telle quelle.
 *   - Spécifications : ACCEPTABLE ou NON ACCEPTABLE (`acceptable`, booléen), sans pourcentage et sans
 *     seuil (point ouvert du plan, proposé : pas de seuil dans cette voie). `noteFinale` reste `null` : aucun
 *     chiffre n'est fabriqué. Le registre dit quand une telle copie compte (`evaluationCompteEnSpecifications`).
 * La copie porte `sansGrille: true`, `grilleId: null`, `criteres: []` : pas de critères, donc ni forces ni
 * défis par critère, ni rétroaction par critère, ni dépistage par critère (plan, « Ce que le résultat sans
 * grille ne donnera pas »). Elle naît verrouillée : elle compte dès qu'elle est saisie.
 *
 * Une case tient UNE copie : celle qui n'est pas remplacée (une reprise remplace l'originale). Une copie
 * évaluée avec une grille se lit au tableau mais ne s'y modifie pas (décidé par Cowork) : la toucher ouvre
 * l'évaluation. Une copie remplacée non plus. Vider une case retire le résultat sans grille qu'elle portait ;
 * rien d'autre. Un résultat sans grille n'a pas de reprise (`appliquerJetonReprise` le refuse).
 *
 * Ce module est PUR : il reçoit des tableaux et rend des tableaux neufs ou des objets. L'écriture, la
 * lecture du stockage et l'écran vivent dans `tableau-notation.js`.
 */
(function () {
    'use strict';

    const FAMILLES_DU_TABLEAU = ['STD', 'SPE'];
    const ACCEPTABLE = 'A';
    const NON_ACCEPTABLE = 'N';
    const CYCLE_SPE = Object.freeze(['', ACCEPTABLE, NON_ACCEPTABLE]);

    /** Le niveau et sa valeur ponctuelle ; null quand le niveau n'en a pas (il ne pourrait pas compter). */
    function _valeurDuNiveau(niveau) {
        if (!niveau || niveau.code == null || String(niveau.code) === '') return null;
        const lire = window.valeurNumeriqueDuNiveau;
        const valeur = typeof lire === 'function' ? lire(niveau) : null;
        return (typeof valeur === 'number' && !isNaN(valeur)) ? valeur : null;
    }

    /**
     * Les niveaux qu'une case de standards peut porter, dans l'ordre de l'échelle. Un niveau sans valeur
     * ponctuelle en est absent : saisi, il ne compterait pas (`evaluationEntreDansLaNote` exige une note).
     * @param {Object} echelle - `{ niveaux: [...] }`
     * @returns {Array<{code:string, nom:string, valeur:number, couleur:string|null}>}
     */
    function niveauxSaisissables(echelle) {
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        return niveaux
            .map(n => ({ niveau: n, valeur: _valeurDuNiveau(n) }))
            .filter(x => x.valeur !== null)
            .map(x => ({ code: String(x.niveau.code), nom: x.niveau.nom || String(x.niveau.code), valeur: x.valeur, couleur: x.niveau.couleur || null }));
    }

    /** Le cycle d'une case : la case vide, puis chaque valeur. */
    function cycleDeLaFamille(famille, echelle) {
        if (famille === 'SPE') return CYCLE_SPE.slice();
        return [''].concat(niveauxSaisissables(echelle).map(n => n.code));
    }

    /**
     * La valeur qui suit au toucher. Une valeur que le cycle ne porte pas (un niveau saisi sous une autre échelle, la
     * production ayant reçu la sienne depuis) repart du PREMIER NIVEAU, jamais de la case vide : un toucher n'efface pas
     * un résultat qu'il ne sait pas lire (relecture neuve, 9 nov. 2026).
     */
    function valeurSuivante(cycle, actuelle) {
        const i = cycle.indexOf(actuelle == null ? '' : String(actuelle));
        if (i === -1) return cycle.length > 1 ? cycle[1] : '';
        return cycle[(i + 1) % cycle.length];
    }

    /**
     * La valeur qu'une touche du clavier désigne : la lettre initiale d'une seule valeur du cycle, ou
     * Retour arrière / Supprimer pour vider. null : la touche ne dit rien au tableau.
     */
    function valeurParTouche(cycle, touche) {
        if (touche === 'Backspace' || touche === 'Delete') return '';
        if (typeof touche !== 'string' || touche.length !== 1) return null;
        const t = touche.toUpperCase();
        const candidates = cycle.filter(v => v !== '' && v.charAt(0).toUpperCase() === t);
        return candidates.length === 1 ? candidates[0] : null;
    }

    /** Vrai pour une copie saisie au tableau, sans grille. */
    function estResultatSansGrille(evaluation) {
        return !!evaluation && evaluation.sansGrille === true;
    }

    /**
     * La copie qu'une case montre : celle de l'élève pour cette production qui n'est pas remplacée ; s'il
     * en reste plusieurs (doublons d'avant), la plus récente.
     */
    function copieDeLaCase(evaluations, da, productionId) {
        const candidates = (evaluations || []).filter(e => e && e.etudiantDA === da && e.productionId === productionId);
        if (candidates.length === 0) return null;
        const actives = candidates.filter(e => !e.remplaceeParId);
        const pool = actives.length ? actives : candidates;
        return pool.slice().sort((a, b) => String(b.dateEvaluation || '').localeCompare(String(a.dateEvaluation || '')))[0];
    }

    /** La valeur que montre une case de spécifications pour une copie sans grille. */
    function _valeurSpe(evaluation) {
        if (evaluation.acceptable === true) return ACCEPTABLE;
        if (evaluation.acceptable === false) return NON_ACCEPTABLE;
        return '';
    }

    /**
     * L'état d'une case, pour l'écran.
     * @param {Object|null} evaluation - `copieDeLaCase`
     * @param {string} famille - 'STD' | 'SPE'
     * @param {boolean} compte - la copie entre dans la note (retenue en standards, compte en spécifications)
     * @returns {{valeur:string, forme:'vide'|'plein'|'contour', modifiable:boolean, evaluationId:string|null}}
     */
    function etatDeLaCase(evaluation, famille, compte) {
        if (!evaluation) return { valeur: '', forme: 'vide', modifiable: true, evaluationId: null };
        const valeur = (famille === 'SPE' && evaluation.sansGrille === true) ? _valeurSpe(evaluation) : String(evaluation.niveauFinal || '');
        return {
            valeur: valeur,
            forme: valeur === '' ? 'vide' : (compte ? 'plein' : 'contour'),
            modifiable: _modifiable(evaluation),
            evaluationId: evaluation.id || null
        };
    }

    /** Le tableau ne touche qu'un résultat sans grille qui n'est pas remplacé (relecture neuve, 9 nov. 2026). */
    function _modifiable(evaluation) {
        return estResultatSansGrille(evaluation) && !evaluation.remplaceeParId;
    }

    /** Les champs du résultat selon la famille ; null quand la valeur n'appartient pas au cycle. */
    function _champsDuResultat(famille, valeur, echelle) {
        if (famille === 'SPE') {
            if (valeur !== ACCEPTABLE && valeur !== NON_ACCEPTABLE) return null;
            return { acceptable: valeur === ACCEPTABLE, niveauFinal: '', noteFinale: null, echelleId: null };
        }
        const niveau = niveauxSaisissables(echelle).find(n => n.code === valeur);
        if (!niveau) return null;
        return { niveauFinal: niveau.code, noteFinale: niveau.valeur, echelleId: (echelle && (echelle.id || echelle.echelle_id)) || null };
    }

    /**
     * Une copie neuve, sans grille. `contexte` : { etudiant, production, coursId, groupeCoursId, id, maintenant }.
     */
    function construireResultatSansGrille(contexte, champs) {
        const { etudiant, production, coursId, groupeCoursId, id, maintenant } = contexte;
        return Object.assign({
            id: id,
            etudiantDA: etudiant.da,
            etudiantNom: `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim(),
            groupe: etudiant.groupe || '',
            coursId: coursId || null,
            groupeCoursId: groupeCoursId || null,
            productionId: production.id,
            productionNom: production.titre || production.nom || '',
            grilleId: null,
            grilleNom: '',
            cartoucheId: '',
            criteres: [],
            sansGrille: true,
            statutRemise: 'evalue',
            statutIntegrite: 'recevable',
            retroactionFinale: '',
            verrouillee: true,
            dateEvaluation: maintenant.toISOString()
        }, champs);
    }

    /**
     * Applique une saisie du tableau à la liste des évaluations, sans la modifier.
     * @param {Array} evaluations - le stock brut
     * @param {Object} saisie - { famille, valeur, echelle, contexte } ; `contexte` comme `construireResultatSansGrille`
     * @returns {{evaluations:Array, action:'cree'|'modifie'|'retire'|'inchange'|'refuse', evaluation:Object|null}}
     */
    function appliquerSaisie(evaluations, saisie) {
        const { famille, valeur, echelle, contexte } = saisie;
        const liste = Array.isArray(evaluations) ? evaluations : [];
        const existante = copieDeLaCase(liste, contexte.etudiant.da, contexte.production.id);
        if (existante && !_modifiable(existante)) return { evaluations: liste, action: 'refuse', evaluation: existante };
        if (valeur === '') return _retirer(liste, existante);
        const champs = _champsDuResultat(famille, valeur, echelle);
        if (!champs) return { evaluations: liste, action: 'refuse', evaluation: existante };
        if (!existante) {
            const neuve = construireResultatSansGrille(contexte, champs);
            return { evaluations: liste.concat([neuve]), action: 'cree', evaluation: neuve };
        }
        // Le verrou reposé à chaque saisie : un résultat du tableau compte toujours (relecture neuve, 9 nov. 2026).
        const modifiee = Object.assign({}, existante, champs, { verrouillee: true, dateModification: contexte.maintenant.toISOString() });
        return { evaluations: liste.map(e => (e === existante ? modifiee : e)), action: 'modifie', evaluation: modifiee };
    }

    function _retirer(liste, existante) {
        if (!existante) return { evaluations: liste, action: 'inchange', evaluation: null };
        return { evaluations: liste.filter(e => e !== existante), action: 'retire', evaluation: existante };
    }

    /**
     * DÉFAIT LE DERNIER GESTE DU TABLEAU (décision de Grégoire, 9 nov. 2026, 15 h 38 : « Annuler » et ⌘Z ; aucun toucher
     * de trop ne fait perdre un résultat). `geste` : { da, productionId, avant, apresId } — `avant` est la copie telle
     * qu'elle était (null : la case était vide), `apresId` l'id de la copie que le geste a laissée (null : il l'a retirée).
     * Ne touche qu'un résultat sans grille, et seulement si la case est encore dans l'état que le geste a laissé : tout
     * autre état (une évaluation faite depuis, une reprise) fait refuser, sans rien écrire.
     * @returns {{evaluations:Array, action:'defait'|'refuse'}}
     */
    function defaireSaisie(evaluations, geste) {
        const liste = Array.isArray(evaluations) ? evaluations : [];
        const refus = { evaluations: liste, action: 'refuse' };
        if (!geste || (geste.avant && !_modifiable(geste.avant))) return refus;
        const duCouple = liste.filter(e => e && e.etudiantDA === geste.da && e.productionId === geste.productionId);
        if (geste.apresId === null) {
            // Le geste avait vidé la case : elle doit être encore vide.
            if (duCouple.length > 0 || !geste.avant) return refus;
            return { evaluations: liste.concat([geste.avant]), action: 'defait' };
        }
        const courante = duCouple.find(e => e.id === geste.apresId);
        if (!courante || duCouple.length !== 1 || !_modifiable(courante)) return refus;
        return {
            evaluations: geste.avant ? liste.map(e => (e === courante ? geste.avant : e)) : liste.filter(e => e !== courante),
            action: 'defait'
        };
    }

    window.TableauNotationDonnees = {
        FAMILLES_DU_TABLEAU,
        ACCEPTABLE,
        NON_ACCEPTABLE,
        niveauxSaisissables,
        cycleDeLaFamille,
        valeurSuivante,
        valeurParTouche,
        copieDeLaCase,
        etatDeLaCase,
        appliquerSaisie,
        defaireSaisie
    };
})();
