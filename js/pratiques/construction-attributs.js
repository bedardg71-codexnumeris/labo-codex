/* ===============================================================================
   MODULE : Attributs de construction de la note (#326 R3 — banc de décision)
   ───────────────────────────────────────────────────────────────────────────
   PUR, lecture seule, testable sans DOM ni stockage.

   RÔLE : transformer une CONFIG RÉSOLUE (sortie de construireConfigComplete) en une
   liste ORDONNÉE d'« attributs de construction de la note », lisibles par famille,
   pour peupler les LIGNES du tableau du Comparateur (RELAIS-326 §4.3.4 / N5).
   La note finale n'est qu'UNE ligne parmi d'autres : on trace l'écart de note
   jusqu'à la dimension qui le cause (pondération, reprises, nb de productions,
   méthode de sélection, composantes…), ou on constate « pareil sauf le nom ».

   POSTURE (SPEC §1/§6, SKILL_pratiques_notation §2 bis/§12) : on DÉCRIT ce que la
   pratique fait dans la construction de la note — JAMAIS « plus/moins sévère »,
   JAMAIS de hiérarchie entre familles (anti « palmarès de générosité »).

   ANCRES (RELAIS §4.3.4) : pondération / reprises / nb de productions sont
   TOUJOURS rendues (même « égale » / « s.o. ») pour confirmer « pareil sur cet axe ».

   SOCLE COMMUN vs FAMILY-SPECIFIC (RELAIS §4.6) : R4 aligne les colonnes par `axe` ;
   un axe absent d'une famille s'affiche « s.o. » dans sa colonne.

   ⚠️ Constat R1 (discordance jetons STD levée, RELAIS §4.5) : côté pratique VIVANTE,
   seul SPE porte des jetons (le wizard n'en écrit que pour `specifications`) ; la
   section jetons « STD » des captures venait de l'ancien éditeur mort (#338). On ne
   liste donc PAS les jetons comme axe STD.
   =============================================================================== */
(function () {
    'use strict';

    // Axes toujours rendus (ancres), dans cet ordre, en tête du tableau.
    var AXES_ANCRES = ['ponderation', 'reprises', 'nbProductions'];

    // --- Lecture robuste : la config résolue a des champs à plat (portfolio,
    // systeme_reprises, jetons, calcul_note…) MAIS certains réglages du wizard
    // vivent sous `configuration.*` (reprisesPermises, seuilAcceptabilite,
    // typesTravaux, tableBundles, objectifs, suggestion). On tente les deux. ---
    function _conf(config) { return (config && config.configuration) || {}; }
    function _famille(config) {
        return String((config && (config.type || _conf(config).type)) || '').toLowerCase();
    }
    // valeur lue à plat puis sous configuration.*
    function _lire(config, champ) {
        if (config && config[champ] !== undefined && config[champ] !== null) return config[champ];
        var c = _conf(config);
        return (c && c[champ] !== undefined) ? c[champ] : undefined;
    }

    var LIBELLE_SELECTION = {
        meilleurs: 'meilleurs', recents: 'récents', derniers: 'récents',
        'recents-meilleurs': 'récents-meilleurs', tous: 'tous'
    };

    function _row(axe, libelle, valeur, ancre) {
        return { axe: axe, libelle: libelle, valeur: (valeur === undefined || valeur === null || valeur === '') ? '—' : String(valeur), ancre: !!ancre };
    }

    // -------------------------------------------------------------------------
    // Valeurs des ANCRES par famille (toujours présentes).
    // -------------------------------------------------------------------------
    function _ponderation(config, famille) {
        var portfolio = _lire(config, 'portfolio') || {};
        var cats = portfolio.categories || (_conf(config).categories);
        if (cats && cats.actif && cats.selection && cats.obligatoires) {
            var ps = cats.selection.ponderation, po = cats.obligatoires.ponderation;
            if (ps != null && po != null) return 'Sélection ' + ps + ' % / Obligatoires ' + po + ' %';
        }
        if (famille === 'sommative') return 'Par production (réglée dans Conception › Productions)';
        if (famille === 'denotation') return 's.o. (note = jugement)';
        var se = _lire(config, 'structure_evaluations') || {};
        if (se.ponderation && String(se.ponderation).toLowerCase() !== 'egale') return 'Inégale';
        return 'Égale';
    }

    function _reprises(config, famille) {
        if (famille === 'denotation') return 's.o.';
        if (famille === 'sommative') {
            var rp = _lire(config, 'reprisesPermises');
            if (rp === 'non' || rp === false) return 'Non permises';
            if (rp === 'limitees' || rp === 'limited') return 'Limitées';
            if (rp === 'illimitees' || rp === true) return 'Illimitées';
            return 'Non permises';
        }
        if (famille === 'specifications') {
            var jetons = _lire(config, 'jetons') || {};
            if (jetons.activer === true || (jetons.reprise && jetons.reprise.nombre)) {
                var n = (jetons.reprise && jetons.reprise.nombre != null) ? jetons.reprise.nombre : '?';
                return 'Jetons de reprise (' + n + ')';
            }
            return 'Aucune (jetons désactivés)';
        }
        // STD : régime de reprises (récence par défaut) — PAS de jetons (constat R1).
        var sr = _lire(config, 'systeme_reprises') || {};
        if (sr.type) {
            var t = String(sr.type).toLowerCase();
            if (t.indexOf('illimit') !== -1) return 'Illimitées';
            if (t.indexOf('limit') !== -1) return 'Limitées';
        }
        // Sélection « récents » ⇒ la dernière tentative non remplacée est retenue.
        var portfolio = _lire(config, 'portfolio') || {};
        if (String(portfolio.methodeSelection || '').indexOf('recents') !== -1) return 'Récence (dernier essai retenu)';
        return 'Selon la sélection d\'artefacts';
    }

    function _nbProductions(config, famille) {
        if (famille === 'denotation') {
            var obj = _lire(config, 'objectifs');
            var nbC = Array.isArray(obj) ? obj.length : (Array.isArray(_conf(config).cibles) ? _conf(config).cibles.length : null);
            return nbC != null ? (nbC + ' cible(s) d\'apprentissage') : 'Cibles d\'apprentissage';
        }
        if (famille === 'specifications') {
            var tt = _lire(config, 'typesTravaux');
            return Array.isArray(tt) ? (tt.length + ' type(s) de travaux') : 'Forfaits par type de travaux';
        }
        if (famille === 'sommative') return 'Toutes les évaluations comptent';
        // STD
        var portfolio = _lire(config, 'portfolio') || {};
        var nb = portfolio.nombreARetenir, min = portfolio.minimumCompletion;
        if (nb != null && min != null) return nb + ' retenu(s) sur ' + min + ' minimum';
        if (nb != null) return nb + ' artefact(s) retenu(s)';
        return 'Sélection d\'artefacts';
    }

    // -------------------------------------------------------------------------
    // Attributs SPÉCIFIQUES par famille (après les ancres).
    // -------------------------------------------------------------------------
    function _specifiquesStandards(config, out) {
        var portfolio = _lire(config, 'portfolio') || {};
        var sel = String(portfolio.methodeSelection || '');
        out.push(_row('methodeSelection', 'Méthode de sélection',
            sel ? (LIBELLE_SELECTION[sel] || sel) : '—'));
        var cats = portfolio.categories || _conf(config).categories;
        out.push(_row('composantes', 'Composantes',
            (cats && cats.actif) ? 'Portfolio + obligatoires/terminale (catégories)' : 'Portfolio seul'));
        var nf = _lire(config, 'notesFinales');
        out.push(_row('notesFinales', 'Mode « note finale »',
            nf === true ? 'Oui (obligatoire non remise = 0)' : 'Non'));
        _ajouterEchelle(config, out);
    }

    function _specifiquesSpecifications(config, out) {
        var seuil = _lire(config, 'seuilAcceptabilite');
        out.push(_row('seuilAcceptabilite', 'Seuil d\'acceptabilité',
            seuil != null ? (seuil + ' %') : '—'));
        var modele = _lire(config, 'modeleBundle');
        var bundles = _lire(config, 'tableBundles');
        out.push(_row('forfaits', 'Forfaits (bundles)',
            modele ? ('Modèle ' + modele) : (Array.isArray(bundles) ? (bundles.length + ' palier(s)') : '—')));
        _ajouterEchelle(config, out);
    }

    function _specifiquesSommative(config, out) {
        var rs = _lire(config, 'reglesSpeciales');
        var libelle;
        if (Array.isArray(rs) && rs.length) libelle = rs.join(', ');
        else if (rs && typeof rs === 'object' && Object.keys(rs).length) libelle = Object.keys(rs).join(', ');
        else libelle = 'Aucune';
        out.push(_row('reglesSpeciales', 'Règles spéciales', libelle));
        // Pas d'échelle ni de grille en SOM (par design).
    }

    function _specifiquesDenotation(config, out) {
        out.push(_row('noteFinale', 'Note finale', 'Jugement saisi, gardé par l\'atteinte des cibles (RREC 60/59)'));
        var sug = _lire(config, 'suggestion') || {};
        var methode = sug.methode || _lire(config, 'methodeSuggestion');
        out.push(_row('suggestion', 'Suggestion statistique', methode ? String(methode) : '—'));
        // #343 (b) : DEN porte désormais échelle + grille OPTIONNELLES, pour la
        // rétroaction formative (elles n'entrent pas dans le calcul = jugement). On
        // les affiche comme « critères explicites » plutôt que « s.o. ».
        _ajouterEchelle(config, out, 'Optionnelle (rétroaction ; critères explicités par les cibles)');
        var grilleId = _lire(config, 'grilleId');
        out.push(_row('grille', 'Grille de critères (rétroaction)',
            grilleId ? 'Rattachée' : 'Optionnelle (critères explicités par les cibles)'));
    }

    function _ajouterEchelle(config, out, valeurSiAbsente) {
        var ech = _lire(config, 'echelle');
        var nom = ech && (ech.echelle_nom || ech.nom);
        var nb = ech && Array.isArray(ech.niveaux) ? ech.niveaux.length : null;
        var valeur;
        if (nom) valeur = nom + (nb ? (' (' + nb + ' niveaux)') : '');
        else if (nb) valeur = nb + ' niveaux';
        else valeur = valeurSiAbsente || '—';
        out.push(_row('echelle', 'Échelle de performance', valeur));
    }

    /**
     * Extrait les attributs de construction de la note d'une config RÉSOLUE.
     * @param {object} config - sortie de construireConfigComplete (ou compatible).
     * @returns {{famille:string, attributs:Array<{axe,libelle,valeur,ancre}>}}
     *   Liste ordonnée : ancres (pondération, reprises, nb de productions) puis
     *   attributs spécifiques à la famille. Repli neutre : config vide → ancres « — ».
     */
    function extraire(config) {
        var famille = _famille(config);
        var out = [];
        // Ancres, dans l'ordre AXES_ANCRES.
        out.push(_row('ponderation', 'Pondération', _ponderation(config, famille), true));
        out.push(_row('reprises', 'Reprises', _reprises(config, famille), true));
        out.push(_row('nbProductions', 'Productions comptées', _nbProductions(config, famille), true));
        // Spécifiques.
        if (famille === 'standards') _specifiquesStandards(config, out);
        else if (famille === 'specifications') _specifiquesSpecifications(config, out);
        else if (famille === 'sommative') _specifiquesSommative(config, out);
        else if (famille === 'denotation') _specifiquesDenotation(config, out);
        return { famille: famille, attributs: out };
    }

    var api = {
        extraire: extraire,
        AXES_ANCRES: AXES_ANCRES.slice()
    };

    if (typeof window !== 'undefined') window.ConstructionAttributs = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
