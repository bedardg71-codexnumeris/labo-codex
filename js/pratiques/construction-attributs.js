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

    // -------------------------------------------------------------------------
    // Valeurs de base par famille. Chacune est rangée sous un paramètre par
    // `extraire()` ; la fonction qui la calcule n'a pas à le savoir.
    // -------------------------------------------------------------------------
    function _ponderation(config, famille) {
        var portfolio = _lire(config, 'portfolio') || {};
        var cats = portfolio.categories || (_conf(config).categories);
        if (cats && cats.actif && cats.selection && cats.obligatoires) {
            var ps = cats.selection.ponderation, po = cats.obligatoires.ponderation;
            if (ps != null && po != null) return 'Sélection ' + ps + ' % / Obligatoires ' + po + ' %';
        }
        if (famille === 'sommative') return 'Par production (réglée dans Conception → Productions)';
        if (famille === 'denotation') return 's.o. (note = jugement)';
        var se = _lire(config, 'structure_evaluations') || {};
        if (se.ponderation && String(se.ponderation).toLowerCase() !== 'egale') return 'Inégale';
        return 'Égale';
    }

    function _reprises(config, famille) {
        if (famille === 'denotation') return 's.o.';
        // #324 (lot 11, 11 oct. 2026) — aligné sur #903 : le déclaratif des reprises d'une sommative
        // (`reprisesPermises`) n'est appliqué par rien, et une pratique créée depuis #903 ne le porte plus.
        // Ce qui vaut, quel que soit le réglage enregistré : une reprise prend la place de la copie d'origine
        // (`remplaceeParId`, écartée de la note par `evaluationEntreDansLaNote`). « Non permises »,
        // « Limitées » et « Illimitées » promettaient une règle. MOT D'ÉCRAN NEUF, soumis à Grégoire.
        if (famille === 'sommative') return 'La reprise prend la place de la copie d\'origine dans la note';
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
        // Relecture croisée du lot 28 (17 sept. 2026) : `derniers` est l'ALIAS de `recents` — c'est la valeur que
        // l'assistant et le formulaire écrivent pour « N derniers ». Ce lecteur-ci était le seul des cinq à
        // l'ignorer (portfolio.js, profil-etudiant-actions.js, pratique-pan-standards.js, la carte du profil).
        var methode = String(portfolio.methodeSelection || '');
        if (methode === 'derniers') methode = 'recents';
        if (methode.indexOf('recents') !== -1) return 'Récence (dernier essai retenu)';
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
    var REGLES_RETIREES = ['remplacement', 'plafonnement'];
    var REGLES_SOMMATIVES = {
        double_verrou: { axe: 'regleVerrou', libelle: 'Verrou sur une évaluation',
                         valeur: 'Actif (une évaluation doit être réussie)',
                         parametre: 'determination' },
        portfolio:     { axe: 'reglePortfolio', libelle: 'Portfolio de progression',
                         valeur: 'Actif', parametre: 'objet' }
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
        out.push(_row('nbProductions', 'Productions comptées', _nbProductions(config, famille), 'objet'));
        if (famille === 'standards') {
            var portfolio = _lire(config, 'portfolio') || {};
            var cats = portfolio.categories || _conf(config).categories;
            out.push(_row('composantes', 'Composantes',
                (cats && cats.actif) ? 'Portfolio + obligatoires/terminale (catégories)' : 'Portfolio seul', 'objet'));
        }
        if (famille === 'sommative') _pousserRegles(config, out, 'objet');
        out.push(_row('alignementCibles', 'Alignement sur des cibles d\'apprentissage',
            _alignementCibles(famille), 'objet'));
    }

    /** RÉVISABILITÉ — ce qui peut être repris, et combien de fois. */
    function _revisabilite(config, famille, out) {
        out.push(_row('reprises', 'Reprises', _reprises(config, famille), 'revisabilite'));
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
        out.push(_row('objetNote', 'Ce à quoi la note se rapporte', _objetNote(famille), 'communication'));
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
        out.push(_row('temporaliteNote', 'Temporalité de la note', _temporaliteNote(), 'communication'));
    }

    /** GRANULARITÉ — combien de niveaux, aux évaluations et au cours. */
    function _granularite(config, famille, out) {
        out.push(_row('granulariteEvaluation', 'Niveaux de performance (évaluations)',
            _granulariteEvaluation(config, famille), 'granularite'));
        out.push(_row('granulariteCours', 'Niveaux de la note du cours', NON_COUVERT, 'granularite'));
    }

    /** DÉTERMINATION — algorithme, jugement, ou les deux. */
    function _determination(config, famille, out) {
        out.push(_row('ponderation', 'Pondération', _ponderation(config, famille), 'determination'));
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
                seuil != null ? (seuil + ' %') : '—', 'determination'));
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

    /**
     * Extrait les attributs de construction de la note d'une config RÉSOLUE.
     * @param {object} config - sortie de construireConfigComplete (ou compatible).
     * @returns {{famille:string, attributs:Array<{axe,libelle,valeur,parametre}>}}
     *   Liste ordonnée SELON LES SIX PARAMÈTRES. Les six sont toujours
     *   représentés, y compris ceux que l'application ne couvre pas.
     *   Repli neutre : config vide → aucune exception, des valeurs lisibles.
     */
    function extraire(config) {
        var famille = _famille(config);
        var out = [];
        _objet(config, famille, out);
        _revisabilite(config, famille, out);
        _agentivite(out);
        _communication(config, famille, out);
        _granularite(config, famille, out);
        _determination(config, famille, out);
        return { famille: famille, attributs: out };
    }

    var api = {
        MODELES_FORFAITS: MODELES_FORFAITS,
        libelleModeleForfaits: libelleModeleForfaits,
        libelleRegleSommative: libelleRegleSommative,
        extraire: extraire,
        PARAMETRES: PARAMETRES.map(function (p) { return { cle: p.cle, libelle: p.libelle }; })
    };

    if (typeof window !== 'undefined') window.ConstructionAttributs = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
