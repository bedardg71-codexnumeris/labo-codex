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

   SIX PARAMÈTRES (9 sept. 2026) — CE QUI EST TOUJOURS RENDU A CHANGÉ.
   Avant : trois ANCRES (pondération / reprises / nb de productions). Maintenant :
   les SIX PARAMÈTRES du rapport PAREA « Laissons-les se tromper » (Cormier,
   Voisard, Turcotte, Arseneault-Hubert, Cégep André-Laurendeau, 2026,
   https://eduq.info/xmlui/handle/11515/40677) — objet, révisabilité, agentivité,
   communication, granularité, détermination. Sa thèse : l'étiquette d'une famille
   ne décrit pas une pratique et ne prédit pas ses effets ; ces six-là si.
   Ce module faisait DÉJÀ ce geste (décrire par axes, pas par famille) : le lot
   aligne son vocabulaire sur celui de la recherche, il ne change pas sa posture.

   ⮕ CHAQUE ATTRIBUT PORTE SON `parametre`, et les six sont TOUJOURS rendus —
   y compris ceux que l'application NE COUVRE PAS. Un paramètre non couvert
   s'affiche, il ne se masque pas : le silence se lirait comme une lacune de la
   pratique de l'utilisateur, alors que c'est une limite de l'outil.

   SOCLE COMMUN vs FAMILY-SPECIFIC (RELAIS §4.6) : R4 aligne les colonnes par `axe` ;
   un axe absent d'une famille s'affiche « s.o. » dans sa colonne.

   ⚠️ Constat R1 (discordance jetons STD levée, RELAIS §4.5) : côté pratique VIVANTE,
   seul SPE porte des jetons (le wizard n'en écrit que pour `specifications`) ; la
   section jetons « STD » des captures venait de l'ancien éditeur mort (#338). On ne
   liste donc PAS les jetons comme axe STD.

   LA FAMILLE « CIBLES » (21 nov. 2026) — la pratique « Par standards » (type « cibles », sigle affiché STD).
   Elle n'avait aucune branche ici : elle tombait dans les branches par défaut, écrites pour l'ancienne famille
   « standards » (devenue « Par sélection de productions », sigle SEL), et sa colonne disait « Sélection
   d'artefacts », « Non couvert (la note se rapporte à des instruments) » et « La reprise prend la place de la
   copie d'origine » : trois lignes fausses. Elle a maintenant SES lignes (`_lignesCibles`), tirées de sa config
   et des règles de plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md.
   ⮕ Ce module reste PUR : les cibles vivent dans un ensemble rangé par trimestre, que l'APPELANT lit par son
   propriétaire (`EnsemblesCibles`) et passe dans `contexte.cibles`.

   ⛔ GARDE CONTRE LA RÉCIDIVE : une famille que ce module ne connaît pas (`FAMILLES_DECRITES`) ne traverse
   PLUS les branches par défaut. Elle reçoit `NON_DECRIT` (`_lignesFamilleInconnue`) : rien d'emprunté.
   =============================================================================== */
(function () {
    'use strict';

    /**
     * Les six paramètres, dans l'ordre du rapport. TOUJOURS rendus, tous les six,
     * pour toutes les familles. `AXES_ANCRES` (trois axes) a été RETIRÉ : il
     * disait « ces trois lignes confirment "pareil sur cet axe" » ; ce sont
     * désormais les six paramètres qui portent cette fonction, et un axe n'est
     * plus qu'une ligne rangée sous l'un d'eux.
     */
    var PARAMETRES = [
        { cle: 'objet',         libelle: 'Objet — de quoi la note dépend' },
        { cle: 'revisabilite',  libelle: 'Révisabilité — ce qui peut être repris' },
        { cle: 'agentivite',    libelle: 'Agentivité — les choix laissés à l\'étudiant·e' },
        { cle: 'communication', libelle: 'Communication — ce que la note dit, et quand' },
        { cle: 'granularite',   libelle: 'Granularité — les niveaux de performance' },
        { cle: 'determination', libelle: 'Détermination — algorithme, jugement, ou les deux' }
    ];

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

    // `parametre` : la clé de PARAMETRES sous laquelle cette ligne se range.
    // Le champ `ancre` a disparu avec AXES_ANCRES — plus rien ne le lisait hors
    // de sa propre sentinelle.
    function _row(axe, libelle, valeur, parametre) {
        return {
            axe: axe, libelle: libelle,
            valeur: (valeur === undefined || valeur === null || valeur === '') ? '—' : String(valeur),
            parametre: parametre
        };
    }

    // Une valeur que l'application ne sait pas produire. Elle s'AFFICHE.
    var NON_COUVERT = 'Non couvert par l\'application';

    // Les familles que ce module sait décrire. Toute autre reçoit NON_DECRIT, jamais les valeurs d'une voisine.
    var FAMILLES_DECRITES = ['sommative', 'standards', 'specifications', 'denotation', 'cibles'];
    // Une famille que le comparateur ne sait pas (encore) décrire. Elle s'AFFICHE, comme NON_COUVERT.
    var NON_DECRIT = 'Non décrit par le comparateur pour cette pratique';

    // Les libellés des lignes que plusieurs familles portent : une seule source (la colonne de gauche prend celui
    // de la première colonne qui porte l'axe ; deux écritures finiraient par diverger selon l'ordre des colonnes).
    var LIBELLES = {
        nbProductions: 'Productions comptées',
        alignementCibles: 'Alignement sur des cibles d\'apprentissage',
        reprises: 'Reprises',
        objetNote: 'Ce à quoi la note se rapporte',
        temporaliteNote: 'Temporalité de la note',
        granulariteEvaluation: 'Niveaux de performance (évaluations)',
        granulariteCours: 'Niveaux de la note du cours',
        ponderation: 'Pondération'
    };

    // -------------------------------------------------------------------------
    // Valeurs de base par famille. Chacune est rangée sous un paramètre par
    // `extraire()` ; la fonction qui la calcule n'a pas à le savoir.
    // -------------------------------------------------------------------------
    function _ponderation(config, famille) {
        var portfolio = _lire(config, 'portfolio') || {};
        var cats = portfolio.categories || (_conf(config).categories);
        if (cats && cats.actif && cats.selection && cats.obligatoires) {
            var ps = cats.selection.ponderation, po = cats.obligatoires.ponderation;
            if (ps != null && po != null) return 'Sélection ' + formaterPourcentage(ps) + ' / Obligatoires ' + formaterPourcentage(po);
        }
        if (famille === 'sommative') return 'Par production (réglée dans Conception → Productions)';
        if (famille === 'denotation') return 's.o. (note = jugement)';
        var se = _lire(config, 'structure_evaluations') || {};
        if (se.ponderation && String(se.ponderation).toLowerCase() !== 'egale') return 'Inégale';
        return 'Égale';
    }

    function _reprises(config, famille) {
        if (famille === 'denotation') return 's.o.';
        if (famille === 'specifications') {
            var jetons = _lire(config, 'jetons') || {};
            if (jetons.activer === true || (jetons.reprise && jetons.reprise.nombre)) {
                var n = (jetons.reprise && jetons.reprise.nombre != null) ? jetons.reprise.nombre : '?';
                return 'Jetons de reprise (' + n + ')';
            }
            return 'Aucune (jetons désactivés)';
        }
        // #588 (8 nov. 2026) — Standards comme Sommative : une reprise prend la place de la copie d'origine
        // (`evaluationEntreDansLaNote`, pratique-registre.js), quelle que soit la sélection du portfolio — la récence,
        // décidée par Grégoire le 28 août (option A : la garder, et la dire). Avant : « Récence » sous « N derniers »
        // (la sélection, pas la reprise), « Selon la sélection d'artefacts » sinon, « Limitées »/« Illimitées » lus
        // dans `systeme_reprises`, un déclaratif que rien n'applique. Pas de jetons en Standards (constat R1).
        // Sommative : #324 (lot 11, 11 oct. 2026), aligné sur #903 — son déclaratif (`reprisesPermises`) n'est
        // appliqué par rien non plus ; la phrase est la sienne depuis (MOT D'ÉCRAN, soumis à Grégoire ce jour-là).
        return 'La reprise prend la place de la copie d\'origine dans la note';
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
        // #715 (21 sept. 2026) : sous « tous », rien n'est « retenu sur » — la note prend toutes les
        // productions évaluées, et `nombreARetenir` ne joue plus. Mots validés par Grégoire.
        if (String(portfolio.methodeSelection || '') === 'tous') {
            return 'Toutes les productions évaluées' + (min != null ? ' (' + min + ' minimum)' : '');
        }
        if (nb != null && min != null) return nb + ' retenu(s) sur ' + min + ' minimum';
        if (nb != null) return nb + ' artefact(s) retenu(s)';
        return 'Sélection d\'artefacts';
    }

    // -------------------------------------------------------------------------
    // DÉRIVATIONS — deux faits calculables sans aucun nouveau champ de config.
    // -------------------------------------------------------------------------

    /**
     * Ce à quoi la note se RAPPORTE : des cibles d'apprentissage, ou des
     * instruments d'évaluation. Dérivable de la seule famille, et c'est le fait
     * le plus informatif que le Comparateur puisse rendre au regard du rapport.
     *
     * ⚠ On décrit CE QUE LE CODE FAIT, pas ce que la famille vise. En standards,
     * la note se construit sur des ARTEFACTS (portfolio : `nombreARetenir`,
     * `methodeSelection`) — même si la famille se réclame de cibles. Seule la
     * dénotation rapporte la note à des cibles (`objectifs`).
     */
    function _objetNote(famille) {
        if (famille === 'denotation') return 'Cibles d\'apprentissage';
        if (famille === 'standards') return 'Artefacts (instruments d\'évaluation)';
        if (famille === 'specifications') return 'Travaux (instruments d\'évaluation)';
        if (famille === 'sommative') return 'Évaluations (instruments d\'évaluation)';
        return '—';
    }

    /**
     * L'alignement de la note sur des cibles d'apprentissage — le paramètre
     * OBJET du rapport. Non couvert partout où la note porte sur des
     * instruments : ce n'est pas un défaut de la pratique de l'utilisateur,
     * c'est une limite de l'application, et elle s'écrit.
     */
    function _alignementCibles(famille) {
        if (famille === 'denotation') return 'Couvert (la note se rapporte aux cibles)';
        return 'Non couvert (la note se rapporte à des instruments)';
    }

    /**
     * La TEMPORALITÉ de la note (rétroaction avant / avec / après).
     *
     * ⚠ La note différée EXISTE (`noteDiffereeActive()`, js/preferences.js:588)
     * mais c'est une PRÉFÉRENCE GLOBALE de l'utilisateur, pas un paramètre de la
     * pratique comparée : deux pratiques côte à côte auraient la même valeur,
     * et l'afficher comme un attribut de colonne mentirait. On pointe donc vers
     * son vrai emplacement. Valeur littérale, sans aucune lecture : CE MODULE
     * EST PUR, il ne touche ni au DOM ni au stockage.
     */
    function _temporaliteNote() {
        return 'Réglage global (note différée), dans Réglages → Préférences';
    }

    /**
     * Les niveaux de performance AUX ÉVALUATIONS — le paramètre GRANULARITÉ.
     * Extrait de l'échelle, qui les comptait déjà pour l'axe `echelle`.
     */
    function _granulariteEvaluation(config, famille) {
        var ech = _lire(config, 'echelle');
        var nb = (ech && Array.isArray(ech.niveaux)) ? ech.niveaux.length : null;
        if (nb) return nb + ' niveaux';
        if (famille === 'sommative') return 'Sans échelle de niveaux (note en pourcentage)';
        if (famille === 'specifications') return 'Binaire par travail (acceptable ou non)';
        return '—';
    }

    // -------------------------------------------------------------------------
    // RÈGLES SPÉCIALES (sommative) — LE CAS TRANCHÉ.
    //
    // `reglesSpeciales` était le seul axe qui ne se range pas sous UN paramètre :
    // « remplacement » relève de la révisabilité, « double_verrou » et
    // « plafonnement » de la détermination (des seuils), « portfolio » de l'objet.
    // ⮕ TRANCHÉ : ON ÉCLATE, une mention par règle cochée, chacune sous SON
    // paramètre. L'éclatement ne coûte rien (cinq valeurs, closes, écrites par
    // `wizard-pratique-v2.js:467-...`) et garder la ligne unique sous
    // DÉTERMINATION aurait rangé trois règles sur quatre au mauvais endroit —
    // exactement ce que le lot corrige.
    // Aucune règle cochée ⇒ une seule ligne « Aucune », sous détermination.
    //
    // ⮕ SOURCE UNIQUE DES QUATRE LIBELLÉS (#809, 9 sept. 2026). Ils vivaient
    // dans TROIS tables : les options de l'assistant, son récapitulatif
    // (`reglesLabels`) et ici. La table vit désormais ICI seulement, pour la
    // même raison que MODELES_FORFAITS — ce module est PUR et chargé AVANT le
    // wizard (`index.html` 14617 contre 14630) — et les deux écrans la lisent
    // par `libelleRegleSommative()`.
    //
    // ⚠ ET ELLES AVAIENT DÉJÀ DIVERGÉ, sans que rien ne le signale : l'écran de
    // saisie faisait cocher « Verrou sur une évaluation » et le récapitulatif
    // rendait « Verrou d'évaluation ». Deux surfaces, deux mots, pour la même
    // case. C'est le libellé de la SAISIE qui est retenu — c'est celui que
    // l'utilisateur rencontre en premier, et le plus explicite des deux.
    // -------------------------------------------------------------------------
    //
    // ⮕ #903 (21 sept. 2026) — DEUX RÈGLES SONT SORTIES DE LA TABLE : « remplacement » et
    // « plafonnement ». Rien ne les applique (l'assistant ne collectait pas de quoi), et
    // cette table les annonçait « Actif ». Une pratique ancienne peut encore PORTER leurs
    // clés (on n'efface pas ses données) : elles sont tues, pas rendues en mot brut.
    // ⮕ E2 (28 oct. 2026, décision de Grégoire) — « Portfolio de progression » (`portfolio`) les rejoint : aucun
    // calcul ne la lisait (SOM-C11). Tue à l'affichage, gardée dans les données de la pratique.
    var REGLES_RETIREES = ['remplacement', 'plafonnement', 'portfolio'];
    var REGLES_SOMMATIVES = {
        double_verrou: { axe: 'regleVerrou', libelle: 'Verrou sur une évaluation',
                         valeur: 'Actif (une évaluation doit être réussie)',
                         parametre: 'determination' }
    };

    /**
     * Le libellé d'une règle sommative, pour l'AFFICHAGE — dans le Comparateur
     * comme dans le récapitulatif de l'assistant. Une valeur inconnue est rendue
     * telle quelle : mieux vaut un mot brut qu'un trou (même règle que
     * `libelleModeleForfaits`).
     */
    function libelleRegleSommative(cle) {
        var r = REGLES_SOMMATIVES[cle];
        if (r) return r.libelle;
        return cle == null ? '' : String(cle);
    }

    /** Les clés de `reglesSpeciales`, que la config la porte en tableau ou en objet. */
    function _clesRegles(config) {
        var rs = _lire(config, 'reglesSpeciales');
        var cles = [];
        if (Array.isArray(rs)) cles = rs.slice();
        else if (rs && typeof rs === 'object') cles = Object.keys(rs);
        return cles.filter(function (c) { return c && c !== 'aucune' && REGLES_RETIREES.indexOf(c) === -1; });
    }

    /** Pousse les règles d'un paramètre donné. Rend true si au moins une l'a été. */
    function _pousserRegles(config, out, parametre) {
        var pose = false;
        _clesRegles(config).forEach(function (cle) {
            var r = REGLES_SOMMATIVES[cle];
            if (r && r.parametre === parametre) { out.push(_row(r.axe, r.libelle, r.valeur, parametre)); pose = true; }
            else if (!r && parametre === 'determination') {
                // Valeur inconnue : mieux vaut le mot brut qu'un trou.
                out.push(_row('regle_' + cle, 'Règle spéciale', String(cle), 'determination'));
                pose = true;
            }
        });
        return pose;
    }

    /**
     * Les modèles de FORFAITS de spécifications — #687.
     *
     * ⚠ CE SONT DES MÉCANIQUES DE REPRISE, PAS DES DISCIPLINES. Ils
     * s'appelaient « Modèle Sciences », « Modèle Littérature », et leur
     * description disait « Idéal pour les disciplines scientifiques » : un
     * enseignant de la « mauvaise » matière était invité à passer son chemin,
     * alors que ce qui les distingue est le nombre de forfaits et la place
     * laissée à la reprise. Le nom dit maintenant le mécanisme.
     *
     * ⚠⚠ LA `value` NE CHANGE PAS, ET C'EST NON NÉGOCIABLE : elle est
     * PERSISTÉE dans `pratique.configuration.modeleBundle`
     * (`wizard-pratique-v2.js:2782`). La renommer réécrirait la configuration
     * de pratiques déjà créées — ce qu'on ne fait pas aux données de quelqu'un.
     *
     * ⮕ LA TABLE VIT ICI, et pas dans le wizard, pour deux raisons mesurées :
     * ce module est chargé AVANT lui (`index.html` 14617 contre 14630), et il
     * est PUR — testable sans DOM. Le wizard la lit pour ses options ; il n'y a
     * donc qu'une source pour ces quatre libellés.
     */
    var MODELES_FORFAITS = [
        { value: 'sciences',     label: 'Forfaits progressifs',
          description: 'Plusieurs forfaits, du plus exigeant au plus accessible. Les reprises sont limitées.' },
        { value: 'simple',       label: 'Forfait unique',
          description: 'Un seul forfait pour tous les travaux. Configuration minimale.' },
        { value: 'litterature',  label: 'Forfaits flexibles',
          description: 'Plusieurs forfaits, avec de la place pour la révision et la reprise.' },
        { value: 'personnalise', label: 'Personnalisé',
          description: 'Crée tes propres forfaits de spécifications.' }
    ];

    /**
     * Le libellé d'un modèle de forfaits, pour l'AFFICHAGE.
     *
     * ⚠ Le résumé d'attributs montrait la `value` brute : une pratique créée
     * avant ce lot affichait « Modèle litterature » — sans accent, et avec le
     * nom d'une discipline. Débaptiser le wizard sans corriger ceci aurait
     * laissé le défaut à l'écran pour toutes les pratiques déjà créées.
     * Une valeur inconnue est rendue telle quelle : mieux vaut un mot brut
     * qu'un trou.
     */
    function libelleModeleForfaits(value) {
        for (var i = 0; i < MODELES_FORFAITS.length; i++) {
            if (MODELES_FORFAITS[i].value === value) return MODELES_FORFAITS[i].label;
        }
        return value == null ? '' : String(value);
    }

    // -------------------------------------------------------------------------
    // Lignes rangées sous chaque paramètre. Une famille qui n'en porte pas une
    // la laisse absente : le Comparateur affiche « s.o. » dans sa colonne.
    // -------------------------------------------------------------------------

    /** OBJET — de quoi la note dépend. */
    function _objet(config, famille, out) {
        out.push(_row('nbProductions', LIBELLES.nbProductions, _nbProductions(config, famille), 'objet'));
        if (famille === 'standards') {
            var portfolio = _lire(config, 'portfolio') || {};
            var cats = portfolio.categories || _conf(config).categories;
            out.push(_row('composantes', 'Composantes',
                (cats && cats.actif) ? 'Portfolio + obligatoires/terminale (catégories)' : 'Portfolio seul', 'objet'));
        }
        if (famille === 'sommative') _pousserRegles(config, out, 'objet');
        out.push(_row('alignementCibles', LIBELLES.alignementCibles,
            _alignementCibles(famille), 'objet'));
    }

    /** RÉVISABILITÉ — ce qui peut être repris, et combien de fois. */
    function _revisabilite(config, famille, out) {
        out.push(_row('reprises', LIBELLES.reprises, _reprises(config, famille), 'revisabilite'));
        if (famille === 'standards') {
            var portfolio = _lire(config, 'portfolio') || {};
            var sel = String(portfolio.methodeSelection || '');
            out.push(_row('methodeSelection', 'Méthode de sélection',
                sel ? (LIBELLE_SELECTION[sel] || sel) : '—', 'revisabilite'));
        }
        if (famille === 'specifications') {
            // Les modèles de forfaits sont des MÉCANIQUES DE REPRISE, pas des
            // disciplines — le commentaire de MODELES_FORFAITS le dit déjà.
            var modele = _lire(config, 'modeleBundle');
            var bundles = _lire(config, 'tableBundles');
            out.push(_row('forfaits', 'Forfaits (bundles)',
                modele ? libelleModeleForfaits(modele)
                       : (Array.isArray(bundles) ? (bundles.length + ' palier(s)') : '—'), 'revisabilite'));
        }
        if (famille === 'sommative') _pousserRegles(config, out, 'revisabilite');
    }

    /** AGENTIVITÉ — aucun axe ne la couvre. La ligne s'affiche quand même. */
    function _agentivite(out) {
        out.push(_row('agentivite', 'Choix et flexibilité laissés à l\'étudiant·e',
            NON_COUVERT, 'agentivite'));
    }

    /** COMMUNICATION — ce que la note dit, et quand. */
    function _communication(config, famille, out) {
        out.push(_row('objetNote', LIBELLES.objetNote, _objetNote(famille), 'communication'));
        if (famille !== 'sommative') {
            // Pas d'échelle en SOM, par design.
            _ajouterEchelle(config, out,
                famille === 'denotation' ? 'Optionnelle (rétroaction ; critères explicités par les cibles)' : undefined);
        }
        if (famille === 'denotation') {
            var grilleId = _lire(config, 'grilleId');
            out.push(_row('grille', 'Grille de critères (rétroaction)',
                grilleId ? 'Rattachée' : 'Optionnelle (critères explicités par les cibles)', 'communication'));
        }
        out.push(_row('temporaliteNote', LIBELLES.temporaliteNote, _temporaliteNote(), 'communication'));
    }

    /** GRANULARITÉ — combien de niveaux, aux évaluations et au cours. */
    function _granularite(config, famille, out) {
        out.push(_row('granulariteEvaluation', LIBELLES.granulariteEvaluation,
            _granulariteEvaluation(config, famille), 'granularite'));
        out.push(_row('granulariteCours', LIBELLES.granulariteCours, NON_COUVERT, 'granularite'));
    }

    /** DÉTERMINATION — algorithme, jugement, ou les deux. */
    function _determination(config, famille, out) {
        out.push(_row('ponderation', LIBELLES.ponderation, _ponderation(config, famille), 'determination'));
        if (famille === 'denotation') {
            out.push(_row('noteFinale', 'Note finale',
                'Jugement saisi, gardé par l\'atteinte des cibles (RREC 60/59)', 'determination'));
        }
        if (famille === 'standards') {
            var nf = _lire(config, 'notesFinales');
            out.push(_row('notesFinales', 'Mode « note finale »',
                nf === true ? 'Oui (obligatoire non remise = 0)' : 'Non', 'determination'));
        }
        if (famille === 'specifications') {
            // #935 (lot N6) : le nom unique d'abord, l'ancien nom de l'assistant ensuite (ordre du moteur).
            var seuil = _lire(config, 'seuilAcceptable');
            if (typeof seuil !== 'number') seuil = _lire(config, 'seuilAcceptabilite');
            out.push(_row('seuilAcceptabilite', 'Seuil d\'acceptabilité',
                seuil != null ? (formaterPourcentage(seuil)) : '—', 'determination'));
        }
        if (famille === 'denotation') {
            var sug = _lire(config, 'suggestion') || {};
            var methode = sug.methode || _lire(config, 'methodeSuggestion');
            out.push(_row('suggestion', 'Suggestion statistique', methode ? String(methode) : '—', 'determination'));
        }
        if (famille === 'sommative') {
            var pose = _pousserRegles(config, out, 'determination');
            // Aucune règle nulle part ⇒ on le dit, une fois, ici.
            if (!pose && _clesRegles(config).length === 0) {
                out.push(_row('reglesSpeciales', 'Règles spéciales', 'Aucune', 'determination'));
            }
        }
    }

    function _ajouterEchelle(config, out, valeurSiAbsente) {
        var ech = _lire(config, 'echelle');
        var nom = ech && (ech.echelle_nom || ech.nom);
        var nb = ech && Array.isArray(ech.niveaux) ? ech.niveaux.length : null;
        var valeur;
        if (nom) valeur = nom + (nb ? (' (' + nb + ' niveaux)') : '');
        else if (nb) valeur = nb + ' niveaux';
        else valeur = valeurSiAbsente || '—';
        out.push(_row('echelle', 'Échelle de performance', valeur, 'communication'));
    }

    // -------------------------------------------------------------------------
    // LA FAMILLE « CIBLES » — la pratique « Par standards » (21 nov. 2026).
    //
    // Chaque valeur vient de la config de la pratique (`configuration` : ensembleCiblesId, echelleId,
    // niveauSansDonnee, notesFinales, doubleSeuil), de son échelle résolue, et de son ensemble de cibles
    // (`contexte.cibles`, lu par l'appelant). Les phrases fixes disent ce que fait `NoteCibles`
    // (js/pratiques/note-cibles.js) ; le numéro de la règle de la fiche de conception est en marge.
    // Elle ne porte NI « Productions comptées », NI « Méthode de sélection », NI « Composantes » : ces lignes
    // sont absentes, et le Comparateur affiche « s.o. » dans sa colonne. Les coches « essentiel » des critères
    // ne sont lues par aucun calcul (choix de Grégoire, 21 nov. 2026) : elles ne sont pas décrites ici.
    // MOTS D'ÉCRAN : PROPOSÉS (plans de travail/TEXTES-2026-11-21-comparateur-par-standards.md).
    // -------------------------------------------------------------------------
    var ENSEMBLE_INTROUVABLE = 'Cibles introuvables dans ce trimestre';
    var ECHELLE_INTROUVABLE = 'Échelle introuvable dans ce trimestre';

    /** « 5 cibles, dont 2 terminales » — C6 : les terminales sont celles que vise le second seuil. */
    function _ciblesComptees(cibles) {
        if (!cibles) return ENSEMBLE_INTROUVABLE;
        if (cibles.length === 0) return 'Aucune cible';
        var t = cibles.filter(function (c) { return c && c.terminale === true; }).length;
        return cibles.length + (cibles.length > 1 ? ' cibles' : ' cible') + ', '
            + (t === 0 ? 'aucune terminale' : ('dont ' + t + (t > 1 ? ' terminales' : ' terminale')));
    }

    /** F2 : les poids sont égaux, ou fixés. Un poids illisible ou nul se dit (la note ne se calcule pas). */
    function _ponderationCibles(cibles) {
        if (!cibles) return ENSEMBLE_INTROUVABLE;
        if (cibles.length === 0) return 'Aucune cible';
        var poids = cibles.map(function (c) { return (c && typeof c.poids === 'number' && isFinite(c.poids) && c.poids > 0) ? c.poids : null; });
        if (poids.indexOf(null) !== -1) return 'Au moins une cible n\'a pas de poids plus grand que zéro';
        var min = Math.min.apply(null, poids), max = Math.max.apply(null, poids);
        return min === max ? 'Égale entre les cibles'
            : 'Inégale entre les cibles (poids de ' + formaterNombre(min) + ' à ' + formaterNombre(max) + ')';
    }

    /** E2 : le niveau nommé pour l'absence de données — celui que désigne `configuration.niveauSansDonnee`. */
    function _niveauSansDonnee(config) {
        var code = _conf(config).niveauSansDonnee;
        var norme = (code === undefined || code === null) ? '' : String(code).trim().toUpperCase();
        if (norme === '') return 'Aucun niveau désigné';
        var ech = _lire(config, 'echelle');
        var niveaux = (ech && Array.isArray(ech.niveaux)) ? ech.niveaux : [];
        if (niveaux.length === 0) return ECHELLE_INTROUVABLE;
        for (var i = 0; i < niveaux.length; i++) {
            var n = niveaux[i];
            if (n && n.code != null && String(n.code).trim().toUpperCase() === norme) return String(n.nom || n.code);
        }
        return 'Le niveau désigné n\'est plus dans l\'échelle';
    }

    /**
     * F4 : le second seuil. `contexte.doubleSeuil` est la lecture du moteur (`NoteCibles.lireDoubleSeuil` : éteint,
     * 60 et 55 d'office) ; sans elle, ce que la config porte, sans rien inventer.
     */
    function _doubleSeuil(config, contexte, cibles) {
        var brut = _conf(config).doubleSeuil || {};
        var ds = contexte.doubleSeuil || { actif: brut.actif === true, seuil: brut.seuil, plafond: brut.plafond };
        if (ds.actif !== true) return 'Éteint';
        if (cibles && !cibles.some(function (c) { return c && c.terminale === true; })) {
            return 'Allumé, sans effet : aucune cible terminale';
        }
        if (typeof ds.seuil !== 'number' || typeof ds.plafond !== 'number') return 'Allumé';
        return 'Note plafonnée à ' + formaterPourcentage(ds.plafond) + ' si la moyenne des cibles terminales est sous '
            + formaterPourcentage(ds.seuil);
    }

    function _lignesCibles(config, contexte, out) {
        var cibles = Array.isArray(contexte.cibles) ? contexte.cibles : null;
        var ech = _lire(config, 'echelle');
        var nbNiveaux = (ech && Array.isArray(ech.niveaux)) ? ech.niveaux.length : 0;

        // OBJET — F8 : rien d'autre que l'atteinte des cibles n'entre dans la note.
        out.push(_row('ciblesComptees', 'Cibles comptées', _ciblesComptees(cibles), 'objet'));
        out.push(_row('alignementCibles', LIBELLES.alignementCibles, 'Couvert (la note se rapporte aux cibles)', 'objet'));

        // RÉVISABILITÉ — T2, T3, O1 : le meilleur niveau démontré, jamais rétrogradé, jamais plafonné.
        out.push(_row('reprises', LIBELLES.reprises,
            'Le meilleur niveau démontré est retenu pour chaque cible ; une reprise ne le fait jamais baisser', 'revisabilite'));

        _agentivite(out);

        // COMMUNICATION — S2 : un niveau par cible, jamais une note par instrument.
        out.push(_row('objetNote', LIBELLES.objetNote, 'Cibles d\'apprentissage', 'communication'));
        _ajouterEchelle(config, out, ECHELLE_INTROUVABLE);
        out.push(_row('temporaliteNote', LIBELLES.temporaliteNote, _temporaliteNote(), 'communication'));

        // GRANULARITÉ — E1, E2.
        out.push(_row('granulariteEvaluation', LIBELLES.granulariteEvaluation,
            nbNiveaux ? (nbNiveaux + ' niveaux') : ECHELLE_INTROUVABLE, 'granularite'));
        out.push(_row('niveauSansDonnee', 'Niveau « sans donnée »', _niveauSansDonnee(config), 'granularite'));
        out.push(_row('granulariteCours', LIBELLES.granulariteCours, NON_COUVERT, 'granularite'));

        // DÉTERMINATION — F1 à F4, F7.
        out.push(_row('ponderation', LIBELLES.ponderation, _ponderationCibles(cibles), 'determination'));
        out.push(_row('calculNote', 'Calcul de la note',
            'Moyenne pondérée des valeurs des niveaux retenus', 'determination'));
        out.push(_row('doubleSeuil', 'Double seuil', _doubleSeuil(config, contexte, cibles), 'determination'));
        out.push(_row('notesFinalisees', 'Notes finalisées',
            _conf(config).notesFinales === true
                ? 'Oui : une cible sans donnée compte pour ' + formaterPourcentage(0)
                : 'Non : pas de note tant qu\'une cible est sans donnée', 'determination'));
    }

    /**
     * ⛔ LA GARDE. Une famille absente de FAMILLES_DECRITES : les six paramètres, et NON_DECRIT partout où la
     * valeur viendrait d'une branche par famille. Seuls restent les faits qui ne dépendent d'aucune famille :
     * l'échelle que la config porte, le réglage global de la temporalité, et les deux « non couvert » de l'outil.
     */
    function _lignesFamilleInconnue(config, out) {
        var ech = _lire(config, 'echelle');
        var nbNiveaux = (ech && Array.isArray(ech.niveaux)) ? ech.niveaux.length : 0;
        out.push(_row('nbProductions', LIBELLES.nbProductions, NON_DECRIT, 'objet'));
        out.push(_row('alignementCibles', LIBELLES.alignementCibles, NON_DECRIT, 'objet'));
        out.push(_row('reprises', LIBELLES.reprises, NON_DECRIT, 'revisabilite'));
        _agentivite(out);
        out.push(_row('objetNote', LIBELLES.objetNote, NON_DECRIT, 'communication'));
        _ajouterEchelle(config, out, NON_DECRIT);
        out.push(_row('temporaliteNote', LIBELLES.temporaliteNote, _temporaliteNote(), 'communication'));
        out.push(_row('granulariteEvaluation', LIBELLES.granulariteEvaluation,
            nbNiveaux ? (nbNiveaux + ' niveaux') : NON_DECRIT, 'granularite'));
        out.push(_row('granulariteCours', LIBELLES.granulariteCours, NON_COUVERT, 'granularite'));
        out.push(_row('ponderation', LIBELLES.ponderation, NON_DECRIT, 'determination'));
    }

    /**
     * Extrait les attributs de construction de la note d'une config RÉSOLUE.
     * @param {object} config - sortie de construireConfigComplete (ou compatible).
     * @param {{cibles?:Array, doubleSeuil?:{actif:boolean, seuil:number, plafond:number}}} [contexte] - famille
     *   « cibles » seulement : les cibles de l'ensemble (normalisées ; null ou absent = ensemble introuvable) et le
     *   double seuil tel que le moteur le lit. Ce module ne lit aucun stockage : l'appelant les fournit.
     * @returns {{famille:string, attributs:Array<{axe,libelle,valeur,parametre}>}}
     *   Liste ordonnée SELON LES SIX PARAMÈTRES. Les six sont toujours
     *   représentés, y compris ceux que l'application ne couvre pas.
     *   Famille inconnue ou config vide → aucune exception, NON_DECRIT : aucune valeur empruntée.
     */
    function extraire(config, contexte) {
        var famille = _famille(config);
        var out = [];
        if (famille === 'cibles') {
            _lignesCibles(config, contexte || {}, out);
        } else if (FAMILLES_DECRITES.indexOf(famille) === -1) {
            _lignesFamilleInconnue(config, out);
        } else {
            _objet(config, famille, out);
            _revisabilite(config, famille, out);
            _agentivite(out);
            _communication(config, famille, out);
            _granularite(config, famille, out);
            _determination(config, famille, out);
        }
        return { famille: famille, attributs: out };
    }

    var api = {
        MODELES_FORFAITS: MODELES_FORFAITS,
        libelleModeleForfaits: libelleModeleForfaits,
        libelleRegleSommative: libelleRegleSommative,
        extraire: extraire,
        NON_DECRIT: NON_DECRIT,
        PARAMETRES: PARAMETRES.map(function (p) { return { cle: p.cle, libelle: p.libelle }; })
    };

    if (typeof window !== 'undefined') window.ConstructionAttributs = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
