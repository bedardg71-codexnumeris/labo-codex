/* ===============================
   DESSINER AU DOIGT (lot/dessiner-au-doigt, 18 nov. 2026)

   Vécu par Grégoire sur l'iPad (18 nov., 18 h 17) : sans crayon, rien ne se trace. Depuis #1123 (20 oct.), les outils
   qui tracent rejettent le doigt (rejet de paume) ; seuls le tampon, le code et Texte se posent d'un toucher. Décidé
   par Grégoire (18 h 45) : un choix « Dessiner au doigt », ÉTEINT par défaut ; éteint, rien ne change.

   Ce module tient la DÉCISION (pure, éprouvée par Vitest) et le RÉGLAGE de l'appareil. travaux-annotation.js
   l'applique ; travaux-outils.js pose l'interrupteur dans la palette, compacte et étendue, sur un écran tactile seulement.

   · CE QU'IL RETIENT : `laboCodex.dessinerAuDoigt` ({ allume }), dans `localStorage`, hors de `db` et hors trimestre
     (du genre de `laboCodex.aideMateriel`). Préférence de l'appareil : l'iPad la garde, le Mac ne la voit pas.
     Dans la démo, rien ne se retient : l'état vaut pour la visite (le confinement de la démo).
   · CE QU'IL DÉCIDE, pour le premier doigt posé sous un outil qui n'est ni Sélection ni Déplacer :
       'rien'    — le doigt n'annote pas (la paume, ou un outil qui trace, choix éteint) ;
       'toucher' — il pose d'un toucher, au relâcher (tampon, code, Texte ; et, choix allumé, un sommet de polygone) ;
       'tracer'  — choix allumé : il trace comme le crayon (stylo, surligneur, cercle, rectangle, les trois lignes).
     Le crayon garde la priorité : un doigt posé pendant un geste du crayon, ou dans les `delaiPaumeMs` qui le
     suivent, est la paume. En Évaluer, aucun doigt n'annote (#1217) : travaux-annotation.js l'arrête plus tôt, et
     la décision le redit.
   =============================== */
(function() {
    'use strict';

    var CLE = 'laboCodex.dessinerAuDoigt';
    var allumeVisite = null;   // dans la démo : l'état de la visite, jamais écrit

    /** Les outils qui tracent en glissant. Le polygone se pose sommet par sommet : il se pose d'un toucher. */
    function outilQuiTrace(outil) {
        if (!outil) return false;
        if (outil.id === 'stylo' || outil.type === 'surligneur') return true;
        return outil.type === 'forme' && outil.id !== 'polygone';
    }

    /**
     * Ce que fait un premier doigt posé sur la copie.
     * @param {{ outil: object, autocollantActif: boolean, allume: boolean, enEvaluer: boolean,
     *           styletEnCours: boolean, depuisStyletMs: number, delaiPaumeMs: number }} c
     * @returns {'rien'|'toucher'|'tracer'}
     */
    function gesteDuDoigt(c) {
        if (c.enEvaluer || c.styletEnCours || !(c.depuisStyletMs > c.delaiPaumeMs)) return 'rien';
        var outil = c.outil || {};
        if (c.autocollantActif || outil.type === 'symbole' || outil.id === 'texte') return 'toucher';
        if (!c.allume) return 'rien';
        if (outil.id === 'polygone') return 'toucher';
        return outilQuiTrace(outil) ? 'tracer' : 'rien';
    }

    /** Un écran tactile ? L'iPad, oui ; le Mac, non (ni toucher, ni pointeur grossier). */
    function estEcranTactile(nav, mm) {
        if (nav && nav.maxTouchPoints > 0) return true;
        try { return !!(mm && mm('(any-pointer: coarse)').matches); } catch (e) { return false; }
    }

    function _demo() { return typeof estEnModeDemo === 'function' && estEnModeDemo(); }

    /** Le choix, tel que l'appareil l'a gardé. Sans la clé : éteint. */
    function estAllume() {
        if (allumeVisite !== null) return allumeVisite;
        try {
            var v = JSON.parse(window.localStorage.getItem(CLE) || 'null');
            return !!(v && v.allume === true);
        } catch (e) { return false; }
    }

    function definirAllume(allume) {
        allume = !!allume;
        if (_demo()) { allumeVisite = allume; return; }
        allumeVisite = null;
        try { window.localStorage.setItem(CLE, JSON.stringify({ allume: allume })); } catch (e) { allumeVisite = allume; /* stockage refusé : l'état vaut pour la visite */ }
    }

    /** L'interrupteur touché (`data-on-change`) : un seul état, que la palette soit compacte ou étendue. */
    function basculer(caseACocher) {
        definirAllume(!!(caseACocher && caseACocher.checked));
        if (typeof document !== 'undefined') {
            document.querySelectorAll('.annot-doigt .interrupteur-case').forEach(function (c) { c.checked = estAllume(); });
        }
    }

    var api = {
        CLE: CLE,
        outilQuiTrace: outilQuiTrace,
        gesteDuDoigt: gesteDuDoigt,
        estEcranTactile: estEcranTactile,
        estAllume: estAllume,
        definirAllume: definirAllume,
        basculer: basculer
    };
    if (typeof window !== 'undefined') window.annotationDoigt = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
