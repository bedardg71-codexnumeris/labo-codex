/**
 * EXPLORATION DES PRATIQUES — moteur pur (axe D, #326)
 *
 * Lots D-0 (arbre de filiation) et D-1 (diff de config + mapping d'effets).
 * Fonctions PURES, sans effet de bord, testables sans DOM. L'exploration est
 * LECTURE SEULE (SPEC §12, invariant 1) : ce module lit et calcule, il
 * n'écrit jamais une pratique, une note ni un flag.
 *
 * SPEC  : plans de travail/SPEC_D_exploration_pratiques.md (§5 arbre, §6 diff)
 * Skill : Skills pour Claude Code/SKILL_pratiques_notation.md §12
 *
 * Hors périmètre de ces lots (UI/nav) : l'affichage de l'arbre/diff/matrice
 * (D-2/D-4), la dérivation via assistant condensé (D-3), le filtre
 * `estMaquette ≠ true` sur la sidebar/bibliothèque (D-2). Ici : le moteur seul.
 */
(function () {
    'use strict';

    // =========================================================================
    // D-0 — Arbre de filiation par `inspireDe.sourceId`
    // =========================================================================

    function _sourceIdDe(pratique) {
        return (pratique && pratique.inspireDe && pratique.inspireDe.sourceId) || null;
    }

    /**
     * Reconstruit l'arbre (forêt) de filiation des pratiques par
     * `inspireDe.sourceId`. Une SOUCHE (racine) = pratique sans `sourceId`, ou
     * dont la source n'est plus présente dans le jeu fourni (filiation
     * orpheline, ou filiation legacy `{nom, auteur, date}` sans id : ignorée
     * proprement, SPEC §3.1). Profondeur libre (une variante peut être dérivée).
     *
     * Anti-cycle : une pratique ne peut être sa propre ancêtre ; un cycle pur
     * (a→b→a) ne fait jamais boucler ni perdre de pratique — les nœuds non
     * atteints depuis une racine sont promus en racines.
     *
     * Pur, sans DOM, sans accès au stockage.
     *
     * @param {Array<{id, nom?, inspireDe?}>} pratiques
     * @returns {Array<{pratique, enfants}>} forêt de nœuds récursifs
     */
    function construireArbrePratiques(pratiques) {
        var liste = Array.isArray(pratiques)
            ? pratiques.filter(function (p) { return p && p.id != null; })
            : [];

        var parId = new Map();
        liste.forEach(function (p) { if (!parId.has(p.id)) parId.set(p.id, p); });

        var enfantsDe = new Map(); // id source -> [pratiques enfants]
        var racines = [];
        liste.forEach(function (p) {
            var src = _sourceIdDe(p);
            if (src && src !== p.id && parId.has(src)) {
                if (!enfantsDe.has(src)) enfantsDe.set(src, []);
                enfantsDe.get(src).push(p);
            } else {
                racines.push(p);
            }
        });

        var vus = new Set();
        function noeud(p) {
            vus.add(p.id);
            var enfants = (enfantsDe.get(p.id) || [])
                .filter(function (e) { return !vus.has(e.id); }) // coupe les cycles
                .map(noeud);
            return { pratique: p, enfants: enfants };
        }

        var foret = racines.map(noeud);
        // Filet anti-cycle : toute pratique jamais atteinte (boucle pure) devient
        // une racine pour ne JAMAIS perdre une pratique à l'affichage.
        liste.forEach(function (p) { if (!vus.has(p.id)) foret.push(noeud(p)); });
        return foret;
    }

    // =========================================================================
    // D-1 — Diff de config (cœur pédagogique) + mapping « ce que ça change »
    // =========================================================================

    function _estObjetSimple(v) {
        return v !== null && typeof v === 'object' && !Array.isArray(v);
    }

    function _egal(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    /**
     * Diff PROFOND de deux objets `config` de pratique. Pur, sans DOM, sans
     * effet de bord. Balaie récursivement les objets ; pour les tableaux
     * (échelle, table_conversion, conditions_speciales…) compare EN BLOC
     * (ajout/retrait/modification au chemin du tableau), jamais index par index
     * — un diff lisible prime sur un diff exhaustif (SPEC §6.1).
     *
     * PROPRIÉTÉ EXPLOITÉE (SPEC §6.1) : le diff est statique → il se calcule
     * même quand la note est « non calculable » (variante inachevée, ou famille
     * non simulable comme DEN). Aucun appel au moteur de calcul ici.
     *
     * Sortie triée par chemin (déterministe) ; `diff(B,A)` est le miroir exact
     * de `diff(A,B)` (ajout↔retrait, valeurs permutées).
     *
     * @returns {Array<{chemin, type, valeurA, valeurB}>}
     *          type ∈ 'ajout' (présent en B seul) | 'retrait' (en A seul) |
     *          'modification' (présent des deux côtés, différent)
     */
    function diffConfigsPratiques(configA, configB) {
        var diffs = [];

        function walk(a, b, prefixe) {
            var cles = new Set();
            if (_estObjetSimple(a)) Object.keys(a).forEach(function (k) { cles.add(k); });
            if (_estObjetSimple(b)) Object.keys(b).forEach(function (k) { cles.add(k); });

            cles.forEach(function (k) {
                var chemin = prefixe ? prefixe + '.' + k : k;
                var va = _estObjetSimple(a) ? a[k] : undefined;
                var vb = _estObjetSimple(b) ? b[k] : undefined;
                var aA = va !== undefined;
                var aB = vb !== undefined;

                if (aA && !aB) { diffs.push({ chemin: chemin, type: 'retrait', valeurA: va, valeurB: undefined }); return; }
                if (!aA && aB) { diffs.push({ chemin: chemin, type: 'ajout', valeurA: undefined, valeurB: vb }); return; }

                if (_estObjetSimple(va) && _estObjetSimple(vb)) { walk(va, vb, chemin); return; }
                if (!_egal(va, vb)) { diffs.push({ chemin: chemin, type: 'modification', valeurA: va, valeurB: vb }); }
            });
        }

        walk(configA || {}, configB || {}, '');
        diffs.sort(function (x, y) { return x.chemin < y.chemin ? -1 : (x.chemin > y.chemin ? 1 : 0); });
        return diffs;
    }

    // -------------------------------------------------------------------------
    // Mapping paramètre → phrase d'effet (« ce que ça change dans ce qu'on mesure »).
    //
    // CONTENU affiné le 15 juin 2026 (#326 D-1) à la demande de Grégoire ;
    // libellé final = son ressort, à ajuster au fil de l'usage. Registre :
    // pédagogique, québécois ; l'app tutoie l'enseignant.
    //
    // POSTURE (SPEC §1/§6, SKILL_pratiques_notation §2 bis/§12) : la phrase dit
    // ce que le réglage change DANS LA MESURE — pas s'il « monte la note ».
    // JAMAIS de cadrage « palmarès de générosité » (plus/moins sévère), JAMAIS
    // de hiérarchie entre familles : l'outil fait comprendre, il ne recommande pas.
    //
    // REPLI NEUTRE GARANTI : tout chemin non mappé (ou toute erreur d'une règle)
    // retombe sur « Réglage modifié. » — jamais d'échec (SPEC §6.2).
    // -------------------------------------------------------------------------

    // Libellés lisibles pour quelques valeurs codées (sinon : la valeur brute).
    var LIBELLE_MODE_DEN = { eliminee: 'éliminée', reduite: 'réduite', differee: 'différée' };
    var LIBELLE_SELECTION = {
        meilleurs: 'meilleurs', recents: 'récents',
        'recents-meilleurs': 'récents-meilleurs', tous: 'tous', derniers: 'récents'
    };
    function _lib(table, v) { return table[String(v)] || String(v); }

    var MAPPING_EFFETS = {
        // ── Reprises (4ᵉ pilier PAN) ──────────────────────────────────────
        'systeme_reprises.type': function (e) {
            var av = String(e.valeurA || '').toLowerCase();
            var ap = String(e.valeurB || '').toLowerCase();
            if (ap.indexOf('illimit') !== -1 && av.indexOf('illimit') === -1) {
                return 'Reprises illimitées : ce qui est mesuré devient l\'état d\'arrivée de la maîtrise, pas le moment où elle s\'installe.';
            }
            if (av.indexOf('illimit') !== -1 && ap.indexOf('illimit') === -1) {
                return 'Reprises limitées : la note tient compte de ce qui est démontré dans une fenêtre bornée d\'essais, pas au-delà.';
            }
            return 'Le régime de reprises change : ce que « refaire un travail » fait bouger dans la note n\'est plus le même.';
        },
        'systeme_reprises.niveau_retrogradable': function (e) {
            if (e.valeurB === true) return 'Un niveau acquis peut redescendre : la note suit la performance récente plutôt que le sommet déjà atteint.';
            if (e.valeurB === false) return 'Un niveau acquis reste acquis : la note retient le meilleur palier démontré, même si une production plus tardive est plus faible.';
            return 'La règle de rétrogradation des niveaux change : la note retient soit le meilleur palier, soit l\'état récent.';
        },

        // ── Structure et pondération des évaluations ──────────────────────
        'structure_evaluations.ponderation': function (e) {
            var ap = String(e.valeurB || '').toLowerCase();
            if (ap && ap !== 'egale') return 'Pondération inégale : la note se déplace vers les moments que tu choisis de faire compter davantage.';
            return 'Pondération égale : aucun moment du parcours ne pèse plus qu\'un autre dans la note.';
        },

        // ── Calcul de la note ─────────────────────────────────────────────
        'calcul_note.conditions_speciales': function (e) {
            if (e.type === 'ajout') return 'Une condition particulière s\'ajoute (p. ex. un plancher de maîtrise sur les évaluations terminales) : réussir l\'ensemble ne suffit plus si cette exigence n\'est pas remplie.';
            if (e.type === 'retrait') return 'Une condition particulière est retirée : la note n\'est plus bornée par cette exigence.';
            return 'Les conditions particulières du calcul changent : les bornes appliquées à la note ne sont plus les mêmes.';
        },
        'calcul_note.methode': function (e) {
            if (String(e.valeurB) === 'jugement_global') return 'La note finale devient un jugement que tu poses (dénotation), gardé par l\'atteinte des cibles : elle n\'est plus dérivée des artefacts.';
            if (String(e.valeurA) === 'jugement_global') return 'La note finale redevient calculée à partir des artefacts : elle n\'est plus un jugement posé à la main.';
            return 'La méthode de calcul change : la façon d\'agréger les évaluations en une note finale n\'est plus la même.';
        },

        // ── Portfolio (STD) : ce qui ENTRE dans la note ───────────────────
        // (cœur du « sort de chaque démonstration », SKILL §2 bis Standards.)
        'portfolio.methodeSelection': function (e) {
            var b = String(e.valeurB);
            if (b === 'meilleurs') return 'Sélection « meilleurs » : la note retient les meilleures démonstrations, peu importe quand elles ont eu lieu.';
            if (b === 'recents' || b === 'derniers') return 'Sélection « récents » : la note retient les démonstrations les plus récentes — ce qui est mesuré, c\'est où l\'élève est rendu.';
            if (b === 'recents-meilleurs') return 'Sélection « récents-meilleurs » : la note combine récence et meilleures démonstrations.';
            if (b === 'tous') return 'Sélection « tous » : la note prend toutes les démonstrations, sans en écarter.';
            return 'La méthode de sélection des artefacts change (' + _lib(LIBELLE_SELECTION, e.valeurA) + ' → ' + _lib(LIBELLE_SELECTION, e.valeurB) + ') : le sous-ensemble de démonstrations qui entre dans la note n\'est plus le même.';
        },
        'portfolio.nombreARetenir': function (e) {
            var a = Number(e.valeurA), b = Number(e.valeurB);
            if (!isNaN(a) && !isNaN(b) && b > a) return 'Plus d\'artefacts retenus (' + a + ' → ' + b + ') : la note s\'appuie sur un plus grand nombre de démonstrations.';
            if (!isNaN(a) && !isNaN(b) && b < a) return 'Moins d\'artefacts retenus (' + a + ' → ' + b + ') : la note s\'appuie sur moins de démonstrations, chacune pèse donc plus lourd.';
            return 'Le nombre d\'artefacts retenus change : la base de démonstrations sur laquelle la note se construit n\'est plus la même.';
        },
        'portfolio.minimumCompletion': function () {
            return 'Le minimum de productions exigées change : le seuil de démonstrations à fournir avant qu\'une note se construise se déplace.';
        },
        'notesFinales': function (e) {
            if (e.valeurB === true) return 'Mode « note finale » : une évaluation obligatoire non remise compte comme 0 — déposer tout le requis devient nécessaire.';
            if (e.valeurB === false) return 'Mode « note finale » désactivé : les obligatoires non remises ne comptent plus d\'office comme 0.';
            return 'Le mode « note finale » change : la façon de traiter les obligatoires non remises n\'est plus la même.';
        },

        // ── Échelle et seuils ─────────────────────────────────────────────
        'echelle.niveaux': function () {
            return 'Les niveaux de l\'échelle changent (nombre, libellés ou seuils %) : la granularité du jugement et sa conversion en pourcentage se déplacent.';
        },
        'echelle.type': function () {
            return 'Le type d\'échelle change : la manière d\'exprimer le jugement (niveaux, pourcentage…) n\'est plus la même.';
        },
        'seuils.niveau_acceptable': function () {
            return 'Le seuil d\'acceptabilité change : la barre de ce qui compte comme « acquis » se déplace.';
        },

        // ── Spécifications (SPE) : forfaits tout-ou-rien ──────────────────
        'tableBundles': function () {
            return 'Les forfaits (bundles) changent : les combinaisons de travaux requises pour atteindre chaque palier de note ne sont plus les mêmes.';
        },
        'typesTravaux': function () {
            return 'Les types de travaux et leurs seuils changent : ce qui rend un travail « acceptable » se déplace (rappel : l\'app approxime l\'acceptabilité par un seuil de note).';
        },

        // ── Famille / dénotation (DEN couche 2, #318) ─────────────────────
        'type': function (e) {
            if (String(e.valeurB) === 'denotation') return 'La pratique passe à la dénotation : la note finale devient un jugement posé, gardé par l\'atteinte des cibles.';
            if (String(e.valeurA) === 'denotation') return 'La pratique quitte la dénotation : la note redevient construite sur les artefacts.';
            return 'La famille de la pratique change : ce que la note mesure (sélection d\'artefacts, forfaits tout-ou-rien, jugement…) n\'est plus de même nature.';
        },
        'modeDEN': function (e) {
            return 'Le mode de dénotation passe de « ' + _lib(LIBELLE_MODE_DEN, e.valeurA) + ' » à « ' + _lib(LIBELLE_MODE_DEN, e.valeurB) + ' » : la façon de composer la note finale se déplace.';
        },
        'suggestion.methode': function (e) {
            return 'L\'ancrage proposé à la saisie change de méthode (' + String(e.valeurA) + ' → ' + String(e.valeurB) + ') : la suggestion statistique se calcule autrement, mais elle ne fait que proposer — la note finale reste ton jugement.';
        }
    };

    /**
     * Traduit une entrée de diff en « phrase d'effet ». Repli neutre garanti.
     * Pur. Ne lève jamais : une règle qui plante retombe sur le neutre.
     *
     * Robuste au nesting : un chemin sous `configuration.` (config exécutable lue
     * par `construireConfigComplete`) est normalisé pour retrouver la même règle
     * que sa forme à plat (ex. `configuration.portfolio.methodeSelection` →
     * `portfolio.methodeSelection`).
     */
    function phraseEffetPourDiff(entry) {
        if (!entry || !entry.chemin) return 'Réglage modifié.';
        var cheminNorm = String(entry.chemin).replace(/^configuration\./, '');
        var regle = MAPPING_EFFETS[entry.chemin] || MAPPING_EFFETS[cheminNorm];
        if (typeof regle === 'function') {
            try { return regle(entry) || 'Réglage modifié.'; }
            catch (e) { return 'Réglage modifié.'; }
        }
        return 'Réglage modifié.';
    }

    /**
     * Diff de haut niveau entre DEUX pratiques (enveloppes `{id, nom, config}`).
     * Diffe les objets `config` et enrichit chaque entrée d'une phrase d'effet.
     * Pur, lecture seule, survit au « non calculable ».
     *
     * @returns {Array<{chemin, type, valeurA, valeurB, effet}>}
     */
    function diffPratiques(pratiqueA, pratiqueB) {
        var ca = (pratiqueA && pratiqueA.config) || {};
        var cb = (pratiqueB && pratiqueB.config) || {};
        return diffConfigsPratiques(ca, cb).map(function (d) {
            return {
                chemin: d.chemin,
                type: d.type,
                valeurA: d.valeurA,
                valeurB: d.valeurB,
                effet: phraseEffetPourDiff(d)
            };
        });
    }

    // =========================================================================
    // D-4 — Diff « avant matrice » : helpers PURS pour la vue comparaison
    // =========================================================================

    /**
     * Deux pratiques partagent-elles une SOUCHE ? (l'une dérive de l'autre, ou
     * toutes deux d'une même source). Sert à n'afficher le diff « ce que ça change »
     * que quand les colonnes comparées sont des variantes d'une même base (SPEC §7).
     * Pur ; lit `inspireDe.sourceId`.
     */
    function partagentSouche(a, b) {
        if (!a || !b || a.id == null || b.id == null || a.id === b.id) return false;
        var sa = _sourceIdDe(a), sb = _sourceIdDe(b);
        return !!((sa && sa === b.id) || (sb && sb === a.id) || (sa && sb && sa === sb));
    }

    /**
     * Phrases d'effet entre deux objets `config` RÉSOLUS (forme à plat). Pur.
     * = diff profond + mapping « ce que ça change dans la mesure ». L'appelant
     * résout d'abord chaque config (construireConfigComplete) — les vraies
     * pratiques rangent sous `.configuration`, pas `.config` (cf. fix 16 juin).
     * @returns {Array<{chemin, type, effet}>}
     */
    function phrasesEffetEntreConfigs(configA, configB) {
        return diffConfigsPratiques(configA, configB).map(function (d) {
            return { chemin: d.chemin, type: d.type, effet: phraseEffetPourDiff(d) };
        });
    }

    // =========================================================================
    // D-5 — Hygiène de l'exploration (tri / filtre / péremption douce) — PUR
    //
    // SPEC §9 : éviter l'accumulation de maquettes semblables. Leviers purs,
    // sans DOM ni stockage : tri par nom/famille/date, filtre par texte/famille,
    // et « péremption douce » = SIGNALER (jamais détruire) les maquettes dormantes.
    // La famille est dérivée de la forme stockée (configuration.type | type),
    // sans dépendre du registre → reste pur et testable.
    // =========================================================================

    function _familleMaquette(p) {
        return (p && (p.type || (p.configuration && p.configuration.type) || (p.config && p.config.type))) || '';
    }

    // Date de référence d'une maquette pour la péremption : sa date de filiation
    // (forgerInspireDe) ou une date de création si présente. null si aucune.
    function _dateMaquette(p) {
        var d = (p && ((p.inspireDe && p.inspireDe.date) || p.dateCreation || p.dateModification)) || null;
        return d || null;
    }

    /**
     * Trie une liste de maquettes (copie, sans muter l'entrée). Tri stable, pur.
     * @param {Array} maquettes
     * @param {'nom'|'famille'|'date'} critere
     * @returns {Array} nouvelle liste triée
     */
    function trierMaquettes(maquettes, critere) {
        var liste = Array.isArray(maquettes) ? maquettes.slice() : [];
        var cmp;
        if (critere === 'famille') {
            cmp = function (a, b) { return _familleMaquette(a).localeCompare(_familleMaquette(b)); };
        } else if (critere === 'date') {
            // Plus récent d'abord ; les maquettes sans date finissent en dernier.
            cmp = function (a, b) {
                var da = _dateMaquette(a), dbb = _dateMaquette(b);
                if (!da && !dbb) return 0;
                if (!da) return 1;
                if (!dbb) return -1;
                return new Date(dbb) - new Date(da);
            };
        } else { // 'nom' (défaut)
            cmp = function (a, b) { return String((a && a.nom) || '').localeCompare(String((b && b.nom) || '')); };
        }
        return liste.sort(cmp);
    }

    /**
     * Filtre une liste de maquettes par texte (sur le nom, insensible casse/accents
     * approximée) et/ou par famille (code de type stocké). Pur.
     * @param {Array} maquettes
     * @param {{texte?:string, famille?:string}} criteres
     * @returns {Array}
     */
    function filtrerMaquettes(maquettes, criteres) {
        var liste = Array.isArray(maquettes) ? maquettes : [];
        var c = criteres || {};
        var texte = (c.texte || '').trim().toLowerCase();
        var famille = (c.famille || '').trim();
        return liste.filter(function (p) {
            if (famille && _familleMaquette(p) !== famille) return false;
            if (texte && String((p && p.nom) || '').toLowerCase().indexOf(texte) === -1) return false;
            return true;
        });
    }

    /**
     * Péremption douce (SPEC §9) : une maquette est « dormante » si sa date de
     * référence est antérieure de plus de `seuilJours` à `maintenant`. PUR —
     * ne supprime RIEN, ne fait que signaler (l'UI pose un badge discret).
     * @param {object} maquette
     * @param {{maintenant?:number|Date, seuilJours?:number}} [opts]
     * @returns {boolean} vrai si dormante (à signaler), faux sinon ou si date absente.
     */
    function maquetteDormante(maquette, opts) {
        var o = opts || {};
        var seuil = (typeof o.seuilJours === 'number') ? o.seuilJours : 30;
        var d = _dateMaquette(maquette);
        if (!d) return false; // pas de date → on ne signale pas (jamais de faux positif destructeur)
        var t = new Date(d).getTime();
        if (isNaN(t)) return false;
        var maintenant = (o.maintenant instanceof Date) ? o.maintenant.getTime()
            : (typeof o.maintenant === 'number') ? o.maintenant : Date.now();
        return (maintenant - t) / 86400000 > seuil;
    }

    // =========================================================================
    // Exposition (IIFE → window), cohérente avec les autres modules pratiques.
    // =========================================================================
    var api = {
        construireArbrePratiques: construireArbrePratiques,
        diffConfigsPratiques: diffConfigsPratiques,
        diffPratiques: diffPratiques,
        phraseEffetPourDiff: phraseEffetPourDiff,
        partagentSouche: partagentSouche,
        phrasesEffetEntreConfigs: phrasesEffetEntreConfigs,
        trierMaquettes: trierMaquettes,
        filtrerMaquettes: filtrerMaquettes,
        maquetteDormante: maquetteDormante
    };

    if (typeof window !== 'undefined') {
        window.ExplorationPratiques = api;
        window.construireArbrePratiques = construireArbrePratiques;
        window.diffPratiques = diffPratiques;
    }
})();
