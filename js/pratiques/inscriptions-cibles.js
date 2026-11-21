/**
 * LES NIVEAUX INSCRITS — la pratique « Par standards », lot 2 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (§ 3 et lot 2, section du 21 nov. 2026).
 * Fiche des règles : plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md (N1 à N7, E2, E3).
 *
 * PROPRIÉTAIRE de la clé `inscriptionsCibles` (par trimestre : `cle('inscriptionsCibles')`). Seuls écrivains : `inscrire`
 * et `annuler`, appelés par le tableau des cibles (js/tableau-cibles.js). Tout autre module la LIT par les fonctions
 * pures ci-dessous.
 *
 * UNE LISTE OÙ L'ON AJOUTE. On n'y réécrit rien, on n'en retire rien (N6 : chaque inscription est gardée et datée ; limite
 * de Grégoire du 20 sept. 2026 : aucune suppression définitive). Une annulation (N7) est une ENTRÉE DE PLUS, qui désigne
 * l'inscription annulée : l'inscription elle-même ne change jamais. Deux appareils qui ont inscrit chacun de leur côté se
 * réunissent sans conflit à la fusion d'un codex (`codex.js`, listes à `id` : l'union des entrées).
 *
 * FORME (deux sortes d'entrées, distinguées par `type`) :
 *   inscription : { id, type: 'inscription', da, ensembleId, cibleId,
 *                   niveau,                  // le CODE du niveau dans l'échelle de la pratique (le « sans donnée » compris, E3)
 *                   echelleId,
 *                   date,                    // 'AAAA-MM-JJ' : la date de la trace (d'office aujourd'hui, modifiable)
 *                   horodatage,              // ISO : le moment où l'inscription a été écrite
 *                   productionId,            // l'id d'une production, ou null (observation, entretien : N3)
 *                   noteBreve,               // texte libre de l'enseignant·e (la rétroaction, N5) ; '' si rien
 *                   criteres: [ { id, texte, essentiel, respecte } ] }
 *   annulation  : { id, type: 'annulation', inscriptionId, da, ensembleId, cibleId, date, horodatage, raison }
 *
 * L'ÉTAT DES CRITÈRES (choix de Grégoire, 21 nov. 2026, 8 h 38). Chaque critère de la cible, tel qu'il était écrit au
 * moment du jugement (id, texte, « essentiel »), avec `respecte` :
 *   true  : renseigné, respecté ;
 *   false : renseigné, non respecté ;
 *   null  : non renseigné. C'est l'état d'office : une inscription sans aucune coche est complète, et « rien de coché »
 *           ne veut pas dire « aucun critère respecté ».
 * Le texte est gardé avec l'inscription : réécrire ou retirer un critère dans l'assistant ne change pas ce qu'une
 * inscription passée dit avoir jugé. Une cible sans critère donne `criteres: []`.
 * ⚠ L'APPLICATION NE CALCULE RIEN À PARTIR DES COCHES : ni niveau proposé, ni niveau refusé, ni alerte de cohérence
 * (fiche, N1 ; avertissement des sources sur le calcul, fiche § 6). Aucune fonction de ce module ne les lit pour décider.
 *
 * CE QUE CE MODULE NE FAIT PAS : il ne retient aucun niveau (lot 3) et ne calcule aucune note (lot 4). Il ne lit ni
 * n'écrit `evaluationsSauvegardees`.
 */
(function () {
    'use strict';

    const CLE = 'inscriptionsCibles';
    const INSCRIPTION = 'inscription';
    const ANNULATION = 'annulation';
    const LONGUEUR_NOTE_BREVE = 600;   // une note BRÈVE : la zone de saisie s'arrête là (choix technique)
    const LONGUEUR_RAISON = 300;

    /* ------------------------------------------------------------------ Les refus, en mots (propositions) */
    // Mots PROPOSÉS (plans de travail/TEXTES-2026-11-21-par-standards-lot-2.md) : Grégoire les relit sur l'aperçu.
    const MOTIFS = Object.freeze({
        SANS_NIVEAU: 'Choisis un niveau : c\'est lui qui s\'inscrit.',
        NIVEAU_HORS_ECHELLE: 'Ce niveau n\'est pas dans l\'échelle de la pratique : choisis-en un dans la liste.',
        DATE: 'La date n\'est pas valide : choisis une date dans le calendrier.',
        SANS_ELEVE: 'Choisis l\'étudiant·e.',
        SANS_PRODUCTION: 'Choisis la production.',
        AUCUNE_CIBLE_REMPLIE: 'Choisis un niveau pour au moins une cible, ou ferme sans rien inscrire.',
        INTROUVABLE: 'Cette inscription est introuvable dans ce trimestre : rien n\'a été annulé.',
        DEJA_ANNULEE: 'Cette inscription est déjà annulée.'
    });

    /* ------------------------------------------------------------------ Les dates */

    function deux(n) { return String(n).padStart(2, '0'); }

    /** La date du jour, à l'heure de l'appareil : 'AAAA-MM-JJ'. */
    function dateDuJour(maintenant) {
        const d = maintenant instanceof Date ? maintenant : new Date();
        return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate());
    }

    /** Vrai pour une date 'AAAA-MM-JJ' qui existe au calendrier. */
    function dateValide(texte) {
        if (typeof texte !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texte)) return false;
        const [a, m, j] = texte.split('-').map(Number);
        const d = new Date(a, m - 1, j);
        return d.getFullYear() === a && d.getMonth() === m - 1 && d.getDate() === j;
    }

    /* ------------------------------------------------------------------ L'état des critères (fonctions pures) */

    /** `respecte` lu : true, false, ou null (non renseigné). Toute autre valeur est « non renseigné ». */
    function lireRespecte(v) {
        return v === true ? true : (v === false ? false : null);
    }

    /**
     * L'état des critères d'une cible au moment du jugement : chaque critère de la cible, dans son ordre, avec sa réponse.
     * Un critère sans réponse est non renseigné (`null`). Une réponse pour un critère que la cible n'a plus est ignorée.
     * @param {Object} cible - forme rangée (`EnsemblesCibles.normaliserCible`)
     * @param {Object<string, boolean>} reponses - { [critereId]: true | false } ; absent = non renseigné
     * @returns {Array<{id, texte, essentiel, respecte}>}
     */
    function etatDesCriteres(cible, reponses) {
        const r = reponses || {};
        const criteres = (cible && Array.isArray(cible.criteres)) ? cible.criteres : [];
        return criteres.filter(k => k && k.id).map(k => ({
            id: String(k.id),
            texte: String(k.texte == null ? '' : k.texte),
            essentiel: k.essentiel === true,
            respecte: Object.prototype.hasOwnProperty.call(r, k.id) ? lireRespecte(r[k.id]) : null
        }));
    }

    /** Compte des trois états, pour l'historique : { respectes, nonRespectes, nonRenseignes }. */
    function compterCriteres(criteres) {
        const liste = Array.isArray(criteres) ? criteres : [];
        return {
            respectes: liste.filter(k => k && k.respecte === true).length,
            nonRespectes: liste.filter(k => k && k.respecte === false).length,
            nonRenseignes: liste.filter(k => !k || lireRespecte(k.respecte) === null).length
        };
    }

    /* ------------------------------------------------------------------ Construire (fonctions pures) */

    function texteLibre(v, max) {
        return String(v == null ? '' : v).trim().slice(0, max);
    }

    /**
     * Une inscription dans sa forme rangée.
     * @param {{id, da, ensembleId, cibleId, niveau, echelleId, date, horodatage, productionId, noteBreve, criteres}} s
     */
    function construireInscription(s) {
        const q = s || {};
        return {
            id: String(q.id || ''),
            type: INSCRIPTION,
            da: String(q.da == null ? '' : q.da),
            ensembleId: String(q.ensembleId || ''),
            cibleId: String(q.cibleId || ''),
            niveau: String(q.niveau == null ? '' : q.niveau),
            echelleId: q.echelleId ? String(q.echelleId) : null,
            date: String(q.date || ''),
            horodatage: String(q.horodatage || new Date().toISOString()),
            productionId: q.productionId ? String(q.productionId) : null,
            noteBreve: texteLibre(q.noteBreve, LONGUEUR_NOTE_BREVE),
            criteres: (Array.isArray(q.criteres) ? q.criteres : []).filter(k => k && k.id).map(k => ({
                id: String(k.id),
                texte: String(k.texte == null ? '' : k.texte),
                essentiel: k.essentiel === true,
                respecte: lireRespecte(k.respecte)
            }))
        };
    }

    /**
     * L'annulation d'une inscription : une entrée de plus, qui la désigne. Elle porte le DA, l'ensemble et la cible de
     * l'inscription (la Réserve et la correction d'un DA les lisent comme pour une inscription).
     */
    function construireAnnulation(s) {
        const q = s || {};
        const visee = q.inscription || {};
        return {
            id: String(q.id || ''),
            type: ANNULATION,
            inscriptionId: String(visee.id || ''),
            da: String(visee.da == null ? '' : visee.da),
            ensembleId: String(visee.ensembleId || ''),
            cibleId: String(visee.cibleId || ''),
            date: String(q.date || ''),
            horodatage: String(q.horodatage || new Date().toISOString()),
            raison: texteLibre(q.raison, LONGUEUR_RAISON)
        };
    }

    /* ------------------------------------------------------------------ Refuser (fonction pure) */

    /** Les codes que l'échelle offre à l'inscription : tout niveau qui a un code (le « sans donnée » compris, E3). */
    function codesDeLEchelle(echelle) {
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        return niveaux.filter(n => n && n.code !== undefined && n.code !== null && String(n.code) !== '').map(n => String(n.code));
    }

    /**
     * Les refus d'une inscription, dans l'ordre de l'écran. Vide : elle peut s'écrire. Les coches n'y entrent pas : elles
     * sont facultatives, et l'application ne juge pas le niveau à partir d'elles.
     * @param {{da, cibleId, niveau, date}} saisie
     * @param {Object} echelle - l'échelle de la pratique
     * @returns {string[]}
     */
    function motifsRefus(saisie, echelle) {
        const q = saisie || {};
        const motifs = [];
        if (!q.da) motifs.push(MOTIFS.SANS_ELEVE);
        if (q.niveau === undefined || q.niveau === null || String(q.niveau) === '') motifs.push(MOTIFS.SANS_NIVEAU);
        else if (codesDeLEchelle(echelle).indexOf(String(q.niveau)) === -1) motifs.push(MOTIFS.NIVEAU_HORS_ECHELLE);
        if (!dateValide(q.date)) motifs.push(MOTIFS.DATE);
        return motifs;
    }

    /* ------------------------------------------------------------------ Lire (fonctions pures sur une liste) */

    function estInscription(e) { return !!e && e.type === INSCRIPTION && !!e.id; }
    function estAnnulation(e) { return !!e && e.type === ANNULATION && !!e.inscriptionId; }

    /** La première annulation de chaque inscription : Map(inscriptionId → annulation). */
    function annulationsParInscription(liste) {
        const parId = new Map();
        (Array.isArray(liste) ? liste : []).forEach(e => {
            if (estAnnulation(e) && !parId.has(e.inscriptionId)) parId.set(e.inscriptionId, e);
        });
        return parId;
    }

    /** La plus récente d'abord : la date de la trace, puis le moment de l'écriture. */
    function plusRecenteDAbord(a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''))
            || String(b.horodatage || '').localeCompare(String(a.horodatage || ''));
    }

    function duneCase(e, da, ensembleId, cibleId) {
        return String(e.da) === String(da) && e.cibleId === cibleId && (!ensembleId || e.ensembleId === ensembleId);
    }

    /**
     * Toutes les inscriptions d'une case (un·e étudiant·e, une cible), la plus récente d'abord, chacune avec son
     * annulation (ou null). Les annulées restent dans la liste.
     * @returns {Array<{inscription:Object, annulation:Object|null}>}
     */
    function historiqueDeLaCase(liste, da, ensembleId, cibleId) {
        const annulations = annulationsParInscription(liste);
        return (Array.isArray(liste) ? liste : [])
            .filter(e => estInscription(e) && duneCase(e, da, ensembleId, cibleId))
            .slice().sort(plusRecenteDAbord)
            .map(i => ({ inscription: i, annulation: annulations.get(i.id) || null }));
    }

    /**
     * Ce qu'une case du tableau montre : la DERNIÈRE inscription non annulée (la plus récente par la date de la trace,
     * puis par le moment de l'écriture) et le compte des inscriptions. Ce n'est PAS le niveau retenu (lot 3) : aucune
     * règle de retenue n'est appliquée ici.
     * @returns {{derniere:Object|null, actives:number, annulees:number}}
     */
    function etatDeLaCase(liste, da, ensembleId, cibleId) {
        const h = historiqueDeLaCase(liste, da, ensembleId, cibleId);
        const actives = h.filter(x => !x.annulation);
        return { derniere: actives.length ? actives[0].inscription : null, actives: actives.length, annulees: h.length - actives.length };
    }

    /**
     * Les inscriptions non annulées de chaque cible d'un ensemble : { [cibleId]: { inscriptions, eleves } }. Pour la
     * question de l'assistant avant de retirer une cible.
     */
    function compterParCible(liste, ensembleId) {
        const annulations = annulationsParInscription(liste);
        const comptes = {};
        (Array.isArray(liste) ? liste : []).forEach(e => {
            if (!estInscription(e) || annulations.has(e.id) || (ensembleId && e.ensembleId !== ensembleId)) return;
            const c = comptes[e.cibleId] || (comptes[e.cibleId] = { inscriptions: 0, eleves: 0, das: new Set() });
            c.inscriptions++;
            c.das.add(String(e.da));
            c.eleves = c.das.size;
        });
        Object.keys(comptes).forEach(k => { delete comptes[k].das; });
        return comptes;
    }

    /**
     * Les cibles enregistrées qui ne sont plus dans la nouvelle liste ET qui portent au moins une inscription non annulée :
     * `[{ cible, inscriptions, eleves }]`. Lecture seule. Pour la question de l'assistant avant d'écrire (patron de #717).
     * @param {Array} liste - les entrées de `inscriptionsCibles`
     * @param {string} ensembleId
     * @param {Array} anciennes - les cibles rangées
     * @param {Array} nouvelles - les cibles à écrire
     */
    function ciblesRetireesInscrites(liste, ensembleId, anciennes, nouvelles) {
        const gardees = new Set((Array.isArray(nouvelles) ? nouvelles : []).map(c => c && String(c.id)));
        const comptes = compterParCible(liste, ensembleId);
        return (Array.isArray(anciennes) ? anciennes : [])
            .filter(c => c && c.id && !gardees.has(String(c.id)) && comptes[c.id])
            .map(c => ({ cible: c, inscriptions: comptes[c.id].inscriptions, eleves: comptes[c.id].eleves }));
    }

    /**
     * Les cibles qu'un geste « inscrire pour une production » offre : celles que la production déclare
     * (`production.ciblesRenseignees`, facultatif), dans l'ordre de l'ensemble ; sans liste, ou si aucune des cibles
     * déclarées n'est encore dans l'ensemble, toutes les cibles.
     * @param {Object} production
     * @param {Array} cibles - celles de l'ensemble, dans leur ordre
     * @returns {Array}
     */
    function ciblesOffertes(production, cibles) {
        const toutes = Array.isArray(cibles) ? cibles : [];
        const declarees = (production && Array.isArray(production.ciblesRenseignees)) ? production.ciblesRenseignees.map(String) : [];
        if (declarees.length === 0) return toutes.slice();
        const offertes = toutes.filter(c => c && declarees.indexOf(String(c.id)) !== -1);
        return offertes.length ? offertes : toutes.slice();
    }

    /* ------------------------------------------------------------------ Ajouter (fonction pure) */

    /**
     * La liste avec les entrées neuves AU BOUT. Rien d'autre ne change : aucune entrée n'est retirée, déplacée ni
     * réécrite. C'est la seule façon dont ce module transforme la liste.
     */
    function ajouter(liste, entrees) {
        const avant = Array.isArray(liste) ? liste : [];
        return avant.concat(Array.isArray(entrees) ? entrees : [entrees]);
    }

    /* ------------------------------------------------------------------ Lire, écrire (le stockage) */

    function lireToutes() {
        const liste = (typeof db !== 'undefined' && typeof cle === 'function') ? db.getSync(cle(CLE), []) : [];
        return Array.isArray(liste) ? liste : [];
    }

    function nouvelId() {
        return (typeof window.genererIdUnique === 'function') ? window.genererIdUnique('INSC_')
            : 'INSC_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    /**
     * Écrit en ajoutant au bout de ce qui est lu DANS la file d'écriture (`modifierEtAnnoncer`, modes.js : un trimestre
     * clos refuse, le témoin parle d'un échec). `entrees` : les entrées à ajouter, ou une fonction qui les rend une fois
     * le contrôle passé (l'annulation se construit avec l'inscription LUE dans la file, pas avec une copie d'avant).
     * `controle(liste)` : un motif de refus, ou null.
     */
    async function _ajouterAuStock(entrees, geste, controle) {
        let refus = null;
        const ecrite = await modifierEtAnnoncer(cle(CLE), (lues) => {
            const liste = Array.isArray(lues) ? lues : [];
            refus = controle ? controle(liste) : null;
            if (refus) return undefined;
            return ajouter(liste, typeof entrees === 'function' ? entrees() : entrees);
        }, [], { geste: geste }).catch(() => undefined);   // non discret : « Enregistré », et le codex le sait
        if (refus) return { ok: false, motif: refus };
        return { ok: ecrite !== undefined };
    }

    /**
     * Inscrit un ou plusieurs niveaux (un geste « inscrire pour une production » en écrit plusieurs, qui partagent la
     * production, la date et l'horodatage). Chaque saisie a déjà passé `motifsRefus`.
     * @param {Array<Object>} saisies - { da, ensembleId, cibleId, niveau, echelleId, date, productionId, noteBreve, criteres }
     * @param {{geste?:string}} [options]
     * @returns {Promise<{ok:boolean, entrees?:Array}>}
     */
    async function inscrire(saisies, options) {
        const liste = (Array.isArray(saisies) ? saisies : [saisies]).filter(Boolean);
        if (liste.length === 0) return { ok: false };
        const horodatage = new Date().toISOString();
        const entrees = liste.map(s => construireInscription(Object.assign({}, s, { id: nouvelId(), horodatage })));
        const r = await _ajouterAuStock(entrees, (options && options.geste) || 'Inscrire un niveau');
        return r.ok ? { ok: true, entrees } : r;
    }

    /**
     * Annule une inscription : ajoute une entrée d'annulation (datée d'aujourd'hui, raison facultative). L'inscription
     * reste telle quelle. Refus, sans rien écrire : inscription introuvable, ou déjà annulée.
     * @returns {Promise<{ok:boolean, motif?:string, entree?:Object}>}
     */
    async function annuler(inscriptionId, raison, options) {
        const maintenant = new Date();
        let entree = null;
        const r = await _ajouterAuStock(() => entree, (options && options.geste) || 'Annuler une inscription', (lues) => {
            const visee = lues.find(e => estInscription(e) && e.id === inscriptionId);
            if (!visee) return MOTIFS.INTROUVABLE;
            if (annulationsParInscription(lues).has(inscriptionId)) return MOTIFS.DEJA_ANNULEE;
            entree = construireAnnulation({ id: nouvelId(), inscription: visee, date: dateDuJour(maintenant),
                horodatage: maintenant.toISOString(), raison: raison });
            return null;
        });
        return r.ok ? { ok: true, entree } : r;
    }

    window.InscriptionsCibles = {
        CLE: CLE,
        INSCRIPTION: INSCRIPTION,
        ANNULATION: ANNULATION,
        LONGUEUR_NOTE_BREVE: LONGUEUR_NOTE_BREVE,
        LONGUEUR_RAISON: LONGUEUR_RAISON,
        MOTIFS: MOTIFS,
        dateDuJour: dateDuJour,
        dateValide: dateValide,
        lireRespecte: lireRespecte,
        etatDesCriteres: etatDesCriteres,
        compterCriteres: compterCriteres,
        construireInscription: construireInscription,
        construireAnnulation: construireAnnulation,
        codesDeLEchelle: codesDeLEchelle,
        motifsRefus: motifsRefus,
        annulationsParInscription: annulationsParInscription,
        historiqueDeLaCase: historiqueDeLaCase,
        etatDeLaCase: etatDeLaCase,
        compterParCible: compterParCible,
        ciblesRetireesInscrites: ciblesRetireesInscrites,
        ciblesOffertes: ciblesOffertes,
        ajouter: ajouter,
        lireToutes: lireToutes,
        inscrire: inscrire,
        annuler: annuler
    };
})();
