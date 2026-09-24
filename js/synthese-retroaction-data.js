/**
 * synthese-retroaction-data.js — Construction du shape Feedback
 *
 * Module pur (zéro UI, zéro rendu). Assemble les données existantes du pipeline
 * (évaluation, grille, échelle, cartouche, annotation, productions du trimestre,
 * historique étudiant) dans un objet `Feedback` consommé par le rendu HTML
 * de la synthèse de rétroaction.
 *
 * Principe directeur : ne rien produire de nouveau. Si une donnée est absente,
 * le champ correspondant est null/vide et la section sera masquée au rendu.
 *
 * API publique : window.syntheseRetroactionData = { construireFeedback }
 */

(function() {
    'use strict';

    // ⮕ #575 B10 — `ORDRE_NIV = { E:4, M:3, D:2, I:1, '0':0 }` A ÉTÉ SUPPRIMÉE.
    //
    // C'était l'ordre de l'échelle de Grégoire, imposé au PDF remis à l'élève.
    // `ORDRE_NIV[code] || 0` rendait 0 à TOUT LE MONDE hors IDME : les défis ne
    // se triaient plus (les deux priorités affichées étaient les deux premières
    // du tableau, pas les deux plus faibles), aucune force ne ressortait, et la
    // ligne « Progrès » ne pouvait jamais s'afficher — le même défaut, dans le
    // même document, que celui corrigé le 28 août dans `evaluation-retroaction.js`.
    //
    // ⮕ Le rang se lit maintenant dans SON échelle, par `niveauDuCodeDansEchelle`
    // (`profil-etudiant-calculs.js`) : ordre des PLAGES, `min` croissant, borne
    // supérieure pour départager — jamais l'ordre de saisie, jamais un repli sur
    // `valeurCalcul`. Un code que l'échelle ne connaît pas n'a PAS de rang, et
    // l'appelant le dit plutôt que d'en inventer un.
    //
    // ⮕ La MARQUE de maîtrise se lit elle aussi dans l'échelle depuis le lot 2 de
    // #555 (`170db4c6`, 28 août 2026) : « quel niveau est faible » et « quel niveau
    // est maîtrisé » passent par `zoneDuNiveau` — voir « La zone d'un code » plus
    // bas. Ce module ne compare plus aucun code en toutes lettres ; l'essai « le
    // compte est ZÉRO » de `sentinelle-575-b10-ordre-synthese-pdf` le verrouille.

    // ⮕ #575 (lot 4 du plan SOLO) — `SCALE_FALLBACK` A ÉTÉ SUPPRIMÉE.
    //
    // C'était l'échelle IDME de Grégoire — codes, libellés, étiquettes SOLO,
    // plages ET couleurs — rendue quand l'échelle de l'évaluation ne se résolvait
    // pas. Or ce module alimente la page de synthèse du **PDF de rétroaction
    // REMIS À L'ÉLÈVE** (`travaux-export-pdf.js`, `ajouterPageSynthese`). Un·e
    // collègue dont l'échelle est introuvable — cas le plus courant : une
    // évaluation produite sous une pratique configurable, dont l'échelle vit
    // dans `pratiquesConfigurables[].config.echelle` et non dans
    // `echellesTemplates` — remettait donc à SES élèves un document portant
    // l'échelle d'un autre enseignant, présentée comme la sienne.
    //
    // ⮕ Sans échelle résolue, on ne rend RIEN : `lireEchelle` renvoie `[]`, la
    // légende et la jauge se masquent (le rendu lit partout `feedback.scale || []`),
    // et le reste du document tient. C'est le principe directeur déclaré en tête
    // de ce fichier — « si une donnée est absente, la section est masquée » —, et
    // la même règle que #527 pour la valeur ponctuelle : jamais un chiffre, un
    // libellé ni une couleur inventés.
    //
    // Couleur neutre des niveaux sans couleur définie, seule constante qui reste
    // (une conséquence d'affichage, pas une valeur métier).
    const COULEUR_NIVEAU_NEUTRE = '#767169';

    // Couleurs des familles de tampons (alignées sur la palette du handoff B).
    const FAMILY_COLOR = {
        action:        '#27b9e0',
        observations:  '#b85a3a',
        comprehension: '#5fb84a'
    };

    /* =====================================================================
       API PUBLIQUE
       ===================================================================== */

    /**
     * Construit le Feedback à partir de l'évaluation et de l'annotation du
     * fichier associé.
     *
     * @param {Object} evaluation  - Évaluation sauvegardée (cf. js/evaluation.js)
     * @param {Object} fichier     - Fichier de travail (cf. travauxStockage)
     * @param {Object|null} annotation - Annotation du fichier (peut être null)
     * @returns {Object} Feedback prêt à rendre
     */
    function construireFeedback(evaluation, fichier, annotation) {
        if (!evaluation) return null;

        const grille = lireGrille(evaluation.grilleId);
        const cartouche = lireCartouche(evaluation.grilleId, evaluation.cartoucheId);
        const echelle = lireEchelle(evaluation.echelleId);
        const stats = compterAnnotations(annotation);

        return {
            student:   construireStudent(evaluation),
            course:    construireCourse(evaluation),
            artefact:  construireArtefact(evaluation, cartouche),
            // Demande de Grégoire, 2 septembre 2026 : le nom de la grille sur le PDF.
            // Le nom vivant d'abord ; celui gravé sur l'évaluation si la grille a disparu.
            grille:    { nom: (grille && grille.nom) || evaluation.grilleNom || '' },
            trimestre: construireTrimestre(evaluation),
            scale:     echelle,
            criteria:  construireCriteres(evaluation, grille, cartouche),
            overall:   construireOverall(evaluation, echelle),
            stamps:    construireStamps(stats),
            errors:    construireErrors(stats, grille),
            errorsTotal: stats ? stats.totalErreursFr : 0,
            // #581 — LE NOM QUI TITRE LE DÉCOMPTE VIENT DE LA GRILLE.
            // Il était écrit « Français écrit » dans le module de rendu, et il
            // s'imprimait tel quel sur le PDF remis à l'élève : un enseignant de
            // chimie voyait son critère rebaptisé. Le nom existe déjà dans la
            // grille, il n'y avait rien à créer pour aller le chercher.
            errorsLabel: libelleErreurs(grille, evaluation),
            bilan:     construireBilan(evaluation, grille, echelle, stats),
            // Drapeau « vue recalculée a posteriori » (#347). Vrai quand des
            // artefacts ultérieurs sont entrés dans le portfolio agrégé depuis
            // la remise de CET artefact — auquel cas la synthèse ne reflète plus
            // la rétroaction historique reçue par l'élève au moment de la remise.
            recalculee: detecterRecalculPosteriori(evaluation),
            // #674 — SUR QUOI PORTE LA NOTE. Relue sur l'évaluation telle qu'elle est
            // en base (rétroactif : les copies muettes d'avant ce lot sont vues) ;
            // le rendu refuse de conclure et NOMME ce qui manque.
            portee: construirePortee(evaluation, grille)
        };
    }

    /**
     * #674 — La portée de la note de CETTE évaluation, pour le PDF de l'élève.
     *
     * La règle est celle du calcul (`porteeDepuisEvaluation`, evaluation-calcul.js),
     * pas une seconde lecture écrite ici. L'échelle est résolue par la voie unique
     * (`obtenirEchelleResolue`, #542) : ses niveaux BRUTS, avec `valeurCalcul`, sont
     * ce que la règle attend — `lireEchelle` ci-dessus les réduit pour le rendu.
     *
     * @returns {Object|null} `{incomplete, commencee, ponderationCouverte,
     *   ponderationGrille, criteresHorsNote, texte}` — `null` si la règle n'est pas chargée
     */
    function construirePortee(evaluation, grille) {
        if (typeof porteeDepuisEvaluation !== 'function') return null;
        const echelle = (typeof obtenirEchelleResolue === 'function')
            ? obtenirEchelleResolue(evaluation.echelleId || null)
            : null;
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        const p = porteeDepuisEvaluation(evaluation, grille, niveaux);
        return {
            incomplete: !!p.incomplete,
            commencee: !!p.commencee,
            ponderationCouverte: p.ponderationCouverte,
            ponderationGrille: p.ponderationGrille,
            criteresHorsNote: (p.criteresHorsNote || []).map(c => ({
                critereId: c.critereId, nom: c.nom, ponderation: c.ponderation, motif: c.motif, niveau: c.niveau
            })),
            texte: (typeof texteCriteresHorsNote === 'function') ? texteCriteresHorsNote(p) : ''
        };
    }

    /**
     * Détecte si la synthèse de cet artefact est RECALCULÉE A POSTERIORI.
     *
     * Le bilan (note de portfolio via `calculerDetailsNoteFinale`, points
     * récurrents, progression) agrège TOUTES les évaluations de l'élève. Si au
     * moins une évaluation de l'élève est postérieure (par `dateEvaluation`) à
     * l'évaluation courante, des données ultérieures à la remise de cet artefact
     * sont entrées dans le calcul : la vue n'est plus la rétroaction historique
     * reçue par l'élève au moment T.
     *
     * Critère retenu : `dateEvaluation` — c'est l'horodatage de l'acte de
     * correction (= la rétroaction reçue), déjà utilisé pour ordonner
     * l'historique (cf. lireHistorique). Comparaison stricte (>) pour ne marquer
     * que les évaluations réellement postérieures. Les évaluations remplacées
     * (`remplaceeParId`) ou sans note (`noteFinale == null`) sont ignorées : elles
     * n'entrent pas dans le portfolio agrégé.
     *
     * @param {Object} evaluation - Évaluation courante (l'artefact affiché)
     * @returns {boolean}
     */
    function detecterRecalculPosteriori(evaluation) {
        const da = evaluation && evaluation.etudiantDA;
        if (!da) return false;
        const dateCourante = evaluation.dateEvaluation
            ? new Date(evaluation.dateEvaluation).getTime()
            : NaN;
        if (isNaN(dateCourante)) return false;

        const evaluations = lireDonneesNamespace('evaluationsSauvegardees');
        return evaluations.some(e => {
            if (e.id === evaluation.id) return false;
            if (e.etudiantDA !== da) return false;
            if (e.remplaceeParId) return false;
            if (e.noteFinale == null) return false;
            const t = e.dateEvaluation ? new Date(e.dateEvaluation).getTime() : NaN;
            return !isNaN(t) && t > dateCourante;
        });
    }

    /* =====================================================================
       A. ÉLÈVE
       ===================================================================== */

    function construireStudent(evaluation) {
        const da = evaluation.etudiantDA || '';
        const etudiants = lireDonneesNamespace('groupeEtudiants');
        const e = etudiants.find(x => x.da === da) || {};

        // Fallback sur evaluation.etudiantNom si l'étudiant n'est plus trouvable
        let prenom = e.prenom || '';
        let nom = e.nom || '';
        if ((!prenom || !nom) && evaluation.etudiantNom) {
            const parts = String(evaluation.etudiantNom).trim().split(/\s+/);
            // Nom mononyme (ex: « Madonna ») : assigner uniquement au nom de
            // famille pour eviter le doublon « Madonna Madonna » dans le
            // header PDF (l'ancien `prenom || parts[0]` retombait sur le seul
            // token, qui etait deja affecte a `nom`). (nit4)
            if (parts.length === 1) {
                nom = nom || parts[0] || '';
            } else {
                prenom = prenom || parts.slice(0, -1).join(' ') || '';
                nom = nom || parts.slice(-1)[0] || '';
            }
        }

        return {
            firstName: prenom,
            lastName:  nom,
            da:        da,
            group:     e.groupe || evaluation.groupe || ''
        };
    }

    /* =====================================================================
       B. COURS
       ===================================================================== */

    function construireCourse(evaluation) {
        // infoCours = cours actif au moment de la lecture (l'éval qu'on exporte
        // appartient forcément au cours actif côté UI).
        const info = db.getSync('infoCours', null) || {};
        const trimestre = obtenirTrimestreActif() || {};

        const session = info.session || trimestre.session || '';
        const annee = info.annee || trimestre.annee || '';

        return {
            code:    info.codeCours || '',
            name:    info.nomCours || '',
            session: formaterSession(session, annee, trimestre),
            teacher: [info.prenomEnseignant, info.nomEnseignant].filter(Boolean).join(' ')
        };
    }

    function formaterSession(sessionLettre, annee, trimestre) {
        if (trimestre && trimestre.nom) return trimestre.nom;
        if (!sessionLettre) return '';
        const lettre = String(sessionLettre).toUpperCase();
        const libelle = window.nomSession ? window.nomSession(lettre) : lettre;
        return annee ? `${libelle} ${annee}` : libelle;
    }

    /* =====================================================================
       C. ARTEFACT
       ===================================================================== */

    function construireArtefact(evaluation, cartouche) {
        const productions = lireDonneesNamespace('productions');
        const ordonnees = ordonnerProductions(productions);
        const idx = ordonnees.findIndex(p => p.id === evaluation.productionId);
        const production = idx >= 0 ? ordonnees[idx] : null;

        return {
            number:    idx >= 0 ? idx + 1 : null,
            total:     ordonnees.length || null,
            title:     (production && (production.titre || production.nom)) || evaluation.productionNom || '',
            // Activité d'apprentissage (= description) — sous-titre signifiant pour l'élève
            activity:  (production && (production.activiteApprentissage || production.description)) || '',
            corrected: evaluation.dateEvaluation || '',
            // Objectif et tâche : champs portés par la production (cf. evaluation.js:1950-1954)
            objective: (production && production.objectif) || '',
            task:      (production && production.tache) || '',
            // Contexte : champ porté par la cartouche (spécifique d'abord, puis général)
            context:   cartouche ? (cartouche.contexteSpecifique || cartouche.contexte || '') : ''
        };
    }

    function ordonnerProductions(productions) {
        return productions
            .filter(p => !p.supprimee)
            .slice()
            .sort((a, b) => (a.numero || 999) - (b.numero || 999));
    }

    /* =====================================================================
       D. TRIMESTRE (TrimestreBar)
       ===================================================================== */

    function construireTrimestre(evaluation) {
        const productions = lireDonneesNamespace('productions');
        const ordonnees = ordonnerProductions(productions);
        if (!ordonnees.length) return [];

        const da = evaluation.etudiantDA;
        const evaluations = lireDonneesNamespace('evaluationsSauvegardees');
        const evalsEleve = evaluations.filter(e => e.etudiantDA === da && !e.remplaceeParId);

        // IDs des productions retenues dans le portfolio (les N meilleures selon
        // la pratique de notation). Permet de marquer ces cases visuellement
        // dans la TrimestreBar — sans afficher de note chiffrée.
        const idsRetenus = new Set();
        if (typeof calculerDetailsNoteFinale === 'function') {
            try {
                const details = calculerDetailsNoteFinale(da);
                if (details && details.portfolio && Array.isArray(details.portfolio.artefactsRetenus)) {
                    details.portfolio.artefactsRetenus.forEach(art => {
                        if (art && art.productionId) idsRetenus.add(art.productionId);
                    });
                }
            } catch (e) { /* silencieux : la marque retenu disparaît */ }
        }

        // gcId de l'ELEVE pour resoudre echeancesParGroupe sur la TrimestreBar
        const gcIdEleve = obtenirGcIdEleve(da);
        const obtenirDue = (prod) => {
            if (typeof obtenirEcheanceEffective === 'function') {
                const r = obtenirEcheanceEffective(prod, gcIdEleve);
                if (r && r.date) return r.date;
            }
            return prod.dateLimite || prod.dateRemise || null;
        };

        return ordonnees.map(production => {
            const evalProduction = evalsEleve.find(e => e.productionId === production.id);
            const estEnCours = production.id === evaluation.productionId;

            let status = 'todo';
            let code = null;
            if (estEnCours) {
                status = 'current';
                code = evaluation.niveauFinal || null;
            } else if (evalProduction && evalProduction.niveauFinal) {
                status = 'done';
                code = evalProduction.niveauFinal;
            }

            return {
                n:           production.numero || null,
                label:       production.titre || production.nom || '',
                status:      status,
                code:        code,
                obligatoire: !!production.obligatoire,
                retenu:      idsRetenus.has(production.id),
                due:         obtenirDue(production)
            };
        });
    }

    /* =====================================================================
       E. ÉCHELLE IDME
       ===================================================================== */

    /**
     * L'échelle de CETTE évaluation, ou un tableau vide.
     *
     * ⮕ #575 — deux changements, un seul geste. La résolution passe par
     * `obtenirEchelleResolue` (`profil-etudiant-calculs.js`), le chemin UNIQUE
     * livré par #542 lot 3 : il connaît les deux gisements — `echellesTemplates`
     * ET l'échelle embarquée d'une pratique configurable (`pratique-<id>`) —,
     * reconnaît un `idOriginal` après import, et refuse de deviner quand
     * plusieurs échelles existent sans désignation. Ce module relisait
     * `echellesTemplates` à la main : toute évaluation faite sous une pratique
     * configurable y était « introuvable », et tombait sur le repli supprimé.
     *
     * Repli local plutôt qu'un `null` : ce module est chargé par la page
     * d'export, où `profil-etudiant-calculs.js` est présent — mais un shape
     * `Feedback` ne doit jamais lever pour une dépendance absente.
     */
    function lireEchelle(echelleId) {
        const echelle = (typeof obtenirEchelleResolue === 'function')
            ? obtenirEchelleResolue(echelleId || null)
            : null;
        if (!echelle || !Array.isArray(echelle.niveaux) || !echelle.niveaux.length) {
            return [];
        }
        return echelle.niveaux.map(n => ({
            code:  n.code || '',
            label: n.nom || n.label || '',
            solo:  n.description || n.solo || '',
            min:   typeof n.min === 'number' ? n.min : null,
            max:   typeof n.max === 'number' ? n.max : null,
            color: normaliserCouleur(n.couleur || n.color)
        }));
    }

    /**
     * Préserve la couleur telle qu'elle est stockée dans l'échelle utilisateur
     * (hex, rgb, hsl, nom CSS, var(--xxx)). Le rendu se fait dans le DOM live
     * donc html2canvas peut résoudre les variables CSS. On retombe sur le
     * fallback IDME uniquement quand aucune couleur n'est définie.
     */
    function normaliserCouleur(couleur) {
        if (typeof couleur === 'string' && couleur.trim()) {
            return couleur.trim();
        }
        // #575 — un niveau sans couleur prend la neutre. Avant, il prenait celle
        // du niveau de MÊME CODE dans l'échelle de Grégoire : un « M » d'une
        // autre échelle héritait de son vert.
        return COULEUR_NIVEAU_NEUTRE;
    }

    /* =====================================================================
       F. CRITÈRES
       ===================================================================== */

    // #672 — LES AMORCES DE SAISIE, TEXTUELLEMENT.
    //
    // Ce sont les textes que le gabarit pose dans le div `comm_<critereId>` avant toute
    // saisie. Ils viennent de trois endroits, et cette liste doit les suivre :
    //   · js/evaluation-chargement.js:1029 et :1195 (les deux chemins de rendu) ;
    //   · js/evaluation-calcul.js:518 (mode catégories, remise à l'état initial) ;
    //   · « Saisis les points » : l'amorce du critère analytique (lot 2, 4 sept. 2026),
    //     posée par les deux mêmes chemins de rendu — déclarée ici au lot 3, quand le
    //     critère analytique s'est mis à entrer dans `criteres[]` avec sa `retroaction`.
    // ⚠ Une liste de reconnaissance périme en silence : si quelqu'un réécrit une de ces
    // phrases sans toucher ici, la garde cesse d'agir sans rien dire.
    // ⮕ `tests/unit/sentinelle-672-retroaction-mode-simple.test.js` va relire ces trois
    // fichiers et exiger que chaque phrase y soit ENCORE, hors commentaires.
    const AMORCES_DE_SAISIE = [
        'Saisissez les erreurs et le nombre de mots',
        'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)',
        'Sélectionne un niveau',
        'Saisis les points'
    ];

    function estAmorceDeSaisie(texte) {
        // Le div est engendré par un gabarit multiligne : son textContent porte
        // l'indentation du source. Comparer au texte nu passerait à côté.
        const nu = String(texte == null ? '' : texte).trim();
        return nu !== '' && AMORCES_DE_SAISIE.includes(nu);
    }

    // #939 — CE QUE L'ÉCRAN ÉCRIVAIT QUAND LA CARTOUCHE N'AVAIT RIEN POUR CE NIVEAU.
    // `_afficherCommentaireCritere` posait « [Non défini] » dans `comm_<critereId>`, et les
    // collecteurs l'enregistraient comme `criteres[].retroaction` : le PDF l'imprimait, le
    // texte copié vers Léa aussi. L'écran ne l'écrit plus (source) ; les évaluations
    // enregistrées avant le portent encore (stock), d'où sa reconnaissance ici — comme une
    // amorce, ce n'est pas un commentaire.
    const COMMENTAIRE_NON_DEFINI = '[Non défini]';

    /**
     * #939 — LE COMMENTAIRE D'UN CRITÈRE, UNE SEULE RÈGLE POUR LE PDF ET LE TEXTE COPIÉ.
     * Décision de Grégoire (24 sept. 2026) : le commentaire qui fait foi est celui qui est
     * enregistré avec l'évaluation ; une cartouche retouchée plus tard ne change pas une
     * copie déjà évaluée. Dans l'ordre :
     *   1. le commentaire enregistré (ou, à l'écran, celui du div `comm_` de cette copie),
     *      sauf une amorce de saisie (#672) ou « [Non défini] » ;
     *   2. la rétroaction algorithmique, gelée au calcul (#581) ;
     *   3. la cartouche, au niveau retenu ;
     *   4. rien — le critère se dit alors par son en-tête.
     * Rend le texte BRUT : l'anonymisation reste à l'appelant qui imprime (#566).
     */
    function commentaireDuCritere({ enregistre, algorithmique, cartouche, critereId, niveau } = {}) {
        const retenu = (t) => {
            const nu = String(t == null ? '' : t).trim();
            return (nu === '' || estAmorceDeSaisie(nu) || nu === COMMENTAIRE_NON_DEFINI) ? '' : nu;
        };
        const cleCart = critereId && niveau ? `${critereId}_${niveau}` : null;
        return retenu(enregistre) ||
            retenu(algorithmique) ||
            retenu(cartouche && cleCart && cartouche.commentaires ? cartouche.commentaires[cleCart] : '');
    }

    function construireCriteres(evaluation, grille, cartouche) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const grilleCriteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
        const donneesAlgo = evaluation.donneesAlgorithmiques || {};

        return criteres.map(c => {
            const def = grilleCriteres.find(gc => gc.id === c.critereId || gc.nom === c.critereNom) || {};
            const niveau = c.niveauSelectionne || '';
            const estAlgorithmique = def.type === 'algorithmique';
            const donneesAlgoCrit = (estAlgorithmique && donneesAlgo[c.critereId]) ? donneesAlgo[c.critereId] : null;
            const ponderationCrit = (typeof c.ponderation === 'number') ? c.ponderation : (def.ponderation || 0);

            // Rétroaction algorithmique persistée sur l'évaluation au moment de
            // la saisie. Sans ce fallback, le PDF affiche le placeholder
            // « Saisissez les erreurs et le nombre de mots ».
            // ⚠ #581 — CE TEXTE EST GELÉ, ET C'EST VOULU. Il a été engendré par
            // le registre d'énoncés au moment de la saisie ; changer le gabarit
            // aujourd'hui ne le réécrit pas, et ne DOIT pas : régénérer
            // écraserait le paragraphe de catégorie dominante que l'enseignant·e
            // a sous les yeux. Un correctif tarit la source, il ne touche pas au
            // stock déjà écrit.
            const retroAlgo = (donneesAlgoCrit && donneesAlgoCrit.retroaction)
                ? String(donneesAlgoCrit.retroaction).trim()
                : '';
            // #672 — UNE AMORCE DE SAISIE N'EST PAS UNE RÉTROACTION, ET ELLE EST TRUTHY.
            // Le repli `retroAlgo` ci-dessus était écrit POUR empêcher le placeholder
            // d'atteindre le PDF ; il ne le pouvait pas, parce que le placeholder
            // n'arrivait pas par le vide mais par `c.retroaction` — non vide, donc
            // gagnant. Les évaluations enregistrées avant la correction du mode simple
            // portent cette amorce en base : c'est ici, et seulement ici, qu'elles sont
            // rattrapées.
            // #939 — la cascade vit dans `commentaireDuCritere` : le texte copié vers Léa
            // (`evaluation-retroaction.js`) la lit aussi.
            const commentaireBrut = commentaireDuCritere({
                enregistre: c.retroaction, algorithmique: retroAlgo, cartouche, critereId: c.critereId, niveau
            });
            // #566 — LE TEXTE LIBRE PASSE PAR L'ANONYMISATION. Le modal de révision
            // anonymisait les rétroactions, la synthèse rasterisée JAMAIS : en mode
            // anonymisé, un prénom tapé dans une rétroaction sortait dans le PDF remis.
            // `anonymiserTexteRetroaction` rend le texte tel quel hors de ce mode.
            const commentaire = (typeof anonymiserTexteRetroaction === 'function')
                ? anonymiserTexteRetroaction(commentaireBrut, evaluation.etudiantDA)
                : commentaireBrut;

            // Données chiffrées du critère algorithmique : sert au rendu d'une
            // ligne compacte « N erreurs sur M mots → X/P (Y%) » dans le PDF,
            // analogue à la boîte de résultat de l'app. Le commentaire texte
            // (générique ou personnalisé) est préservé tel quel.
            const algo = (donneesAlgoCrit && typeof donneesAlgoCrit.erreurs === 'number' && typeof donneesAlgoCrit.mots === 'number') ? {
                erreurs:      donneesAlgoCrit.erreurs,
                mots:         donneesAlgoCrit.mots,
                noteCalculee: (typeof donneesAlgoCrit.noteCalculee === 'number') ? donneesAlgoCrit.noteCalculee : null,
                pourcentage:  (typeof donneesAlgoCrit.pourcentage === 'number') ? donneesAlgoCrit.pourcentage : null,
                ponderation:  ponderationCrit
            } : null;

            // Lot 3 (4 sept. 2026) — un critère analytique porte ses POINTS dans
            // `criteres[]` (`points`, à côté du niveau déduit). Le rendu les imprime
            // « 24 / 30 » à la place de l'échelle : l'élève ne lit que le chiffre
            // (décision de Grégoire). Le niveau, lui, a servi à choisir le commentaire.
            const points = (typeof c.points === 'number' && !isNaN(c.points)) ? c.points : null;
            return {
                key:     c.critereId || c.critereNom || '',
                name:    c.critereNom || def.nom || '',
                weight:  ponderationCrit,
                sub:     def.description || '',
                code:    niveau,
                points:  points,
                comment: commentaire,
                algo:    algo
            };
        });
    }

    /* =====================================================================
       G. NIVEAU GLOBAL
       ===================================================================== */

    function construireOverall(evaluation, echelle) {
        const code = evaluation.niveauFinal || '';
        const niveau = echelle.find(s => s.code === code);
        // Pas de `note` : `evaluation.retroactionFinale` est la concaténation
        // générée pour LÉA (objectif + tâche + commentaires par critère + niveau)
        // — afficher ce texte ici dupliquerait toutes les autres sections.
        return {
            code:  code,
            label: niveau ? niveau.label : '',
            color: niveau ? niveau.color : '#767169'
        };
    }

    /* =====================================================================
       H. TAMPONS PAR FAMILLE
       ===================================================================== */

    /**
     * #760 (24 sept. 2026) — les tampons de la copie, lus dans les RÉGLAGES ACTUELS
     * par le seul lecteur (`travauxOutils.observationsDesTampons`), comme la
     * rétroaction générale et la spécifique : catégories et tampons dans l'ordre des
     * réglages, noms et textes de l'utilisateur, tampons personnels et anciens
     * tampons compris, jetons absents. Hier : trois familles figées, noms du
     * catalogue, tri par nombre, tampons personnels et anciens tus.
     * @returns {Array<{id, nom, couleur, items: Array}>} une entrée par catégorie utilisée
     */
    function construireStamps(stats) {
        if (!stats || !stats.tampons) return [];
        if (typeof travauxOutils === 'undefined' || typeof travauxOutils.observationsDesTampons !== 'function') return [];
        // Couleurs personnalisées par catégorie (palette tampons configurée par l'utilisateur)
        const couleursCat = (typeof db !== 'undefined' && db.getSync) ? (db.getSync('couleursCategories', null) || {}) : {};

        return travauxOutils.observationsDesTampons(stats.tampons).map(cat => {
            const couleurFam = couleursCat[cat.id] || FAMILY_COLOR[cat.id] || '#767169';
            return {
                id:      cat.id,
                nom:     cat.nom,
                couleur: couleurFam,
                items:   cat.tampons.map(t => ({
                    id:      t.id,
                    nom:     t.nom,
                    count:   t.nombre,
                    comment: t.texte,
                    icone:   tamponEnDataURL(t.id, couleurFam),
                    couleur: couleurFam
                }))
            };
        });
    }

    /**
     * Convertit l'image PNG cachée d'un tampon en dataURL pour insertion
     * dans le HTML rasterisé (legende visuelle pour l'élève). Si une teinte
     * est fournie, l'image est repeinte dans cette couleur (mode source-in)
     * — c'est ainsi que l'app coloration les tampons monochromes selon la
     * catégorie. Si l'image n'est pas chargée, retourne null — le rendu
     * retombe sur la pastille couleur.
     */
    function tamponEnDataURL(id, tint) {
        if (typeof travauxOutils === 'undefined' || typeof travauxOutils.getImageAutocollant !== 'function') return null;
        const img = travauxOutils.getImageAutocollant(id);
        if (!img || !img.complete || !img.naturalWidth) return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            if (tint) {
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = tint;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            return canvas.toDataURL('image/png');
        } catch (e) {
            return null;
        }
    }

    /* =====================================================================
       I. ERREURS ANNOTÉES SUR LA COPIE
       ===================================================================== */

    /**
     * Le nom qui titre le décompte d'erreurs — #581.
     *
     * Les erreurs comptées ici sont des ANNOTATIONS sur la copie (`errfr_*`),
     * et les données ne les rattachent à aucun critère. Le seul nom vrai
     * disponible est donc celui du critère algorithmique de la grille : c'est
     * lui que l'enseignant·e a écrit, et lui que l'élève reconnaît.
     * Sans critère algorithmique lisible, le registre rend un libellé neutre —
     * jamais le nom d'une discipline.
     */
    function libelleErreurs(grille, evaluation) {
        if (typeof window === 'undefined' || !window.enoncesAlgo) return '';
        // #686 — grille introuvable : le nom que l'évaluation porte, plutôt que le libellé neutre.
        return window.enoncesAlgo.libelleCritere(
            window.enoncesAlgo.critereAlgorithmiqueOuNomme(grille, evaluation)
        );
    }

    function construireErrors(stats, grille) {
        if (!stats || !stats.erreursFr) return [];
        // 3 sept. 2026 — code, nom, couleur et texte viennent de la liste de la
        // grille de l'évaluation (ou du repli, à l'identique) : `codesAnnotation`.
        // Un identifiant que la liste ne connaît pas garde son numéro et un nom
        // neutre — il n'est jamais retiré du PDF.
        const codes = (typeof window !== 'undefined' && window.codesAnnotation) ? window.codesAnnotation : null;
        if (!codes) return [];

        return Object.keys(stats.erreursFr)
            .map(id => {
                const count = stats.erreursFr[id] || 0;
                const t = codes.code(grille, id);
                return {
                    code:        t.inconnu ? null : t.code,
                    name:        t.nom,
                    count:       count,
                    color:       t.couleur,
                    retroaction: t.retroaction || ''
                };
            })
            .filter(e => e.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 2);
    }

    /* =====================================================================
       J. BILAN — restitution fidèle de l'ancien bilan dans le contenant B
       Structure : 4 sections (concentration / récurrents / jetons / note
       provisoire) + intro motivationnelle. Toute donnée provient de sources
       déjà existantes : grille, évaluation, historique, tampons, erreurs FE,
       calculerDetailsNoteFinale (SSOT portfolio), obtenirConfigJetons.
       ===================================================================== */

    const BILAN_INTRO = "Mes standards sont très élevés à ton égard parce que je crois que tu as tout ce qu'il faut pour les atteindre et j'ai confiance en toi. Si tu as besoin d'aide, viens me voir.\nSelon toi, quel aspect de ta production mériterait le plus d'attention ?";

    /**
     * Le rang d'un code dans l'échelle de CETTE évaluation — ou `null`.
     *
     * ⮕ #575 B10. Un seul point d'entrée pour les trois comparaisons d'ordre du
     * bilan (défis, force, progression), pour qu'elles ne puissent pas répondre
     * différemment à la même question. `null` quand l'échelle ne se résout pas
     * ou ne connaît pas le code : c'est le principe déclaré en tête de ce module
     * — donnée absente, section masquée —, jamais un rang de repli.
     */
    function lecteurRang(echelleId) {
        return function (code) {
            const niveau = (typeof niveauDuCodeDansEchelle === 'function')
                ? niveauDuCodeDansEchelle(code, echelleId || null)
                : null;
            return (niveau && niveau.rang != null) ? niveau.rang : null;
        };
    }

    /**
     * La zone d'un code — `'priorite'`, `'signale'`, `'acquis'`, ou `null`.
     *
     * ⮕ #555 lot 2, et c'est la fin de B10b. Ce module testait les codes EN
     * TOUTES LETTRES à six endroits (quatorze comparaisons) : `=== 'I' || === 'D'`
     * pour les défis, `=== 'M' || === 'E'` pour « tous maîtrisés ». Ces réponses
     * ne valaient que sur l'échelle de Grégoire ; sur celle d'un·e collègue,
     * elles rendaient « aucun défi » et « personne ne maîtrise » — en silence, et
     * dans le document remis à l'élève.
     *
     * ⚠ `null` SIGNIFIE « L'ÉCHELLE NE DIT PAS », et la seule réponse acceptable
     * est alors de ne RIEN rendre. C'est le principe déclaré en tête de ce module.
     * ⚠ Et ici, pas de message d'explication non plus : `copierToutRetroaction`
     * copie le `textContent` de ce bilan dans ce qui est remis à l'élève. Une
     * note technique y serait un défaut pire que la section manquante.
     */
    function lecteurZone(echelleId) {
        return function (code) {
            return (typeof zoneDuNiveau === 'function')
                ? zoneDuNiveau(code, echelleId || null)
                : null;
        };
    }

    /**
     * Renvoie le libellé d'un code IDME tel qu'il est défini dans l'échelle
     * utilisateur (ex. "Insuffisant" / "En Développement" / "Maîtrisé"). Si
     * l'échelle ne contient pas ce code, retombe sur le code brut — aucun
     * libellé n'est codé en dur ici.
     */
    function libelleNiveau(echelle, code) {
        if (!Array.isArray(echelle)) return code || '';
        const niveau = echelle.find(s => s.code === code);
        return (niveau && niveau.label) || code || '';
    }

    /**
     * Ce que le bilan du PDF dit du niveau d'un critère : le libellé du niveau dans
     * l'échelle — ou, pour un critère analytique, SON CHIFFRE, « 1 / 2 » (points et poids
     * ENREGISTRÉS dans l'entrée de `criteres[]`, comme au rendu du critère).
     * ⮕ Retouche du lot 3, 4 septembre 2026, décision de Grégoire (arrêté 4 : l'élève ne lit
     * que la note chiffrée). Même règle que `_lectureNiveauBilan` du bilan de l'app
     * (`evaluation-retroaction.js`) — les deux textes vont au même élève et doivent dire la
     * même chose du même critère.
     */
    function lectureNiveauCritere(echelle, c) {
        if (c && typeof c.points === 'number' && !isNaN(c.points)) {
            return `${c.points} / ${c.ponderation == null ? '' : c.ponderation}`;
        }
        return libelleNiveau(echelle, c ? c.niveauSelectionne : '');
    }

    function construireBilan(evaluation, grille, echelle, stats) {
        const historique = lireHistorique(evaluation);
        const evalPrecedente = historique[0] || null;
        const da = evaluation.etudiantDA;
        // #940 — les critères à travailler, lus UNE fois : « Présentement » les nomme,
        // « Points récurrents » dit lesquels reviennent d'une copie à l'autre.
        const aTravailler = criteresATravailler(evaluation);

        return {
            intro:         BILAN_INTRO,
            concentration: construireConcentration(evaluation, grille, echelle, historique, stats, aTravailler),
            recurrents:    construireRecurrents(evaluation, echelle, evalPrecedente, historique, stats, grille, aTravailler),
            jetons:        construireJetons(da),
            note:          construireNoteProvisoire(da, affichageNiveauxSeulement(evaluation))
        };
    }

    /* ----- J.1 — Présentement, il faut se concentrer sur... ----- */

    /**
     * Les critères à travailler de cette copie : les priorités, puis les « à consolider »,
     * chacun trié du rang le plus faible au plus fort.
     */
    function criteresATravailler(evaluation) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];

        // #555 lot 2 — trois zones, lues dans les repères de l'échelle. « Défi »
        // n'est plus une lettre : c'est ce qui est SOUS le seuil de suffisance.
        const rangDe = lecteurRang(evaluation.echelleId);
        const zoneDe = lecteurZone(evaluation.echelleId);
        // ⚠ `rangOuDernier` (repli `Infinity` pour un code illisible) A ÉTÉ RETIRÉ
        // avec ce lot : les deux tableaux triés ci-dessous sont filtrés par ZONE,
        // et une zone non nulle implique un rang lisible — `zoneDuNiveau` rend
        // `null` dès que le code n'a pas de rang. Le repli était devenu
        // inatteignable, et un repli qu'on ne peut plus atteindre finit par être
        // lu comme une garantie qu'il n'offre plus.
        const parRangCroissant = (a, b) => rangDe(a.niveauSelectionne) - rangDe(b.niveauSelectionne);

        const defis = criteres.filter(c => zoneDe(c.niveauSelectionne) === 'priorite')
                              .sort(parRangCroissant);
        // La zone intermédiaire de Grégoire : « maîtrisé, mais en développement ».
        // Réel, donc pas un défi ; non durable, donc pas encore acquis.
        const signales = criteres.filter(c => zoneDe(c.niveauSelectionne) === 'signale')
                                 .sort(parRangCroissant);
        return { defis: defis, signales: signales };
    }

    function construireConcentration(evaluation, grille, echelle, historique, stats, aTravailler) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const grilleCriteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
        const zoneDe = lecteurZone(evaluation.echelleId);
        const defis = aTravailler.defis;
        const signales = aTravailler.signales;

        // Vérification explicite M/E sur tous les critères : un travail Non recevable
        // (niveau '0') ou sans critères ne doit JAMAIS déclencher « tous maîtrisés ».
        // Garde `length > 0` conservée : `.every()` rend `true` sur un tableau vide
        // (vacuité JS), et un travail non recevable ne doit JAMAIS déclencher
        // « tous maîtrisés ». Un niveau que l'échelle ne situe pas (`null`)
        // empêche la conclusion — on ne dit pas « tout est acquis » sur un doute.
        const tousMaitrises = criteres.length > 0 &&
            criteres.every(c => zoneDe(c.niveauSelectionne) === 'acquis');

        let messageGlobal = '';
        if (tousMaitrises) {
            const totErr = stats ? (stats.totalErreursFr || 0) : 0;
            if (totErr > 0) {
                // #581 — MÊMES MOTS QUE LE BILAN DE L'APP, et c'est obligatoire :
                // `copierToutRetroaction` copie l'un dans le document de l'autre.
                // Les deux lisent maintenant le MÊME énoncé `concentre` du même
                // gabarit ; deux chaînes jumelles pouvaient diverger, un registre
                // partagé ne le peut plus.
                // #686 — grille introuvable : le nom que l'évaluation porte, plutôt que rien.
                const critereAlgo = window.enoncesAlgo.critereAlgorithmiqueOuNomme(grille, evaluation);
                const phraseConcentre = window.enoncesAlgo.enonce(critereAlgo, 'concentre', {});
                messageGlobal = `Tous les critères sont maîtrisés.${phraseConcentre ? ` ${phraseConcentre}` : ''} (${totErr} erreur${totErr > 1 ? 's' : ''} annotée${totErr > 1 ? 's' : ''}).`;
            } else {
                // Garde length > 0 : .every() retourne true sur tableau vide (vacuité JS).
                // ⚠ L'évaluation précédente porte SON échelle, pas forcément celle-ci.
                const zonePrecedente = lecteurZone(historique[0] && historique[0].echelleId);
                const maitriseLongtemps = historique[0] && Array.isArray(historique[0].criteres) &&
                    historique[0].criteres.length > 0 &&
                    historique[0].criteres.every(c => zonePrecedente(c.niveauSelectionne) === 'acquis');
                // ⚠ F4-1 (audit du 21 sept. 2026) — la phrase disait « depuis plus
                // d'un artefact » et nommait le sommet de l'échelle (« vers le niveau
                // … ») : le mot du cours de Grégoire, et un niveau que l'élève d'un·e
                // autre ne vise pas forcément. Texte validé par Grégoire ; MÊMES MOTS
                // que le bilan de l'app (`evaluation-retroaction.js`), à l'apostrophe
                // près. Le lecteur du « niveau le plus haut » est parti avec elle.
                messageGlobal = maitriseLongtemps
                    ? "Tous les critères sont maîtrisés depuis plus d'une production. Tu peux aider tes collègues : c'est une excellente façon de transférer tes compétences à d'autres contextes."
                    : 'Tous les critères sont maîtrisés. Continue sur cette lancée !';
            }
        }

        // #940 — « Nom (niveau) : définition », pour les priorités ET les « à consolider »
        // (décision de Grégoire, 24 sept. 2026). La définition telle qu'écrite dans la grille ;
        // le niveau est le chiffre pour un analytique. La récurrence ne se dit plus ici : elle
        // se dit une seule fois, dans « Points récurrents ».
        const ligne = (d) => {
            const def = grilleCriteres.find(gc => gc.nom === d.critereNom || gc.id === d.critereId);
            return ligneCritereATravailler(d.critereNom, lectureNiveauCritere(echelle, d), def && def.description);
        };

        return {
            tousMaitrises:  tousMaitrises,
            messageGlobal:  messageGlobal,
            priorites:      defis.slice(0, 2).map(ligne),
            signales:       signales.map(ligne)
        };
    }

    /* ----- J.2 — Points récurrents ----- */

    function construireRecurrents(evaluation, echelle, evalPrecedente, historique, stats, grille, aTravailler) {
        // #940 — ce qui revient D'UNE COPIE À L'AUTRE. Les tampons de la copie en sont
        // sortis (décision de Grégoire, 24 sept. 2026) : ils sont en entier dans
        // « Commentaires ciblés », et leur répétition tronquée à 80 caractères est partie.
        const recurrences = lignesRecurrentes(aTravailler.defis.concat(aTravailler.signales),
            historique, evaluation.echelleId, lecteurZone);
        const francais = construireFrancaisResume(stats, grille, evaluation);
        // La tendance lit les cinq copies précédentes, comme avant #940 : l'historique
        // n'est plus plafonné (le compte des récurrences en a besoin), sa tendance oui.
        const progression = construireProgressionResume(evaluation, evalPrecedente, historique.slice(0, 5));
        const ameliorations = construireAmeliorations(evaluation, evalPrecedente);
        const force = construireForce(evaluation, echelle);

        return {
            force:         force,
            recurrences:   recurrences,
            francais:      francais,
            progression:   progression.message,
            tendance:      progression.tendance,
            ameliorations: ameliorations
        };
    }

    function construireForce(evaluation, echelle) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        if (!criteres.length) return '';
        // Un critère dont le niveau ne se lit pas dans l'échelle n'est la force de
        // personne : il ne peut pas devenir le meilleur, et si AUCUN ne se lit,
        // la ligne ne s'affiche pas. Avant, tous étaient à 0 et le premier du
        // tableau gagnait — l'ordre de saisie décidait de « ta force ».
        const rangDe = lecteurRang(evaluation.echelleId);
        const meilleur = criteres.reduce((acc, c) => {
            const rang = rangDe(c.niveauSelectionne);
            if (rang == null) return acc;
            const rangAcc = acc ? rangDe(acc.niveauSelectionne) : null;
            return (rangAcc == null || rang > rangAcc) ? c : acc;
        }, null);
        if (!meilleur) return '';
        // #555 lot 2 — « ta force » suppose un niveau ACQUIS, pas seulement le
        // moins faible. Un critère en zone « signalé » est réel mais non durable :
        // l'annoncer comme une force dirait à l'élève qu'il peut s'en détourner.
        if (lecteurZone(evaluation.echelleId)(meilleur.niveauSelectionne) !== 'acquis') return '';
        return `Ta force : ${meilleur.critereNom} (${lectureNiveauCritere(echelle, meilleur)})`;   // le chiffre pour un analytique
    }

    /**
     * La ligne « points récurrents » du décompte d'erreurs.
     *
     * #581 — elle s'ouvrait sur « Français : », quelle que soit la discipline.
     * Elle porte maintenant le nom du critère, exactement comme l'en-tête de la
     * section du PDF : les deux disent le même mot du même décompte.
     */
    function construireFrancaisResume(stats, grille, evaluation) {
        if (!stats || !stats.totalErreursFr) return '';
        const codes = (typeof window !== 'undefined' && window.codesAnnotation) ? window.codesAnnotation : null;
        const total = stats.totalErreursFr;
        const principal = Object.keys(stats.erreursFr || {})
            .sort((a, b) => stats.erreursFr[b] - stats.erreursFr[a])[0];
        // 3 sept. 2026 — le nom vient de la liste de la grille (`codesAnnotation`) ;
        // un identifiant inconnu ne nomme rien, comme hier.
        const meta = (principal && codes) ? codes.code(grille, principal) : null;
        const nomPrinc = (meta && !meta.inconnu) ? meta.nom : '';
        const titre = libelleErreurs(grille, evaluation);
        return `${titre} : ${total} erreur${total > 1 ? 's' : ''}${nomPrinc ? ` (principalement : ${nomPrinc})` : ''}`;
    }

    /**
     * La ligne « Progrès » et la tendance du parcours.
     *
     * ⮕ #575 B10, et c'est ICI que la porte terrain 2.7 du 28 août aurait frappé
     * une seconde fois. Comparer deux rangs n'a de sens que si les deux
     * évaluations parlent du MÊME barème : le 3e niveau d'une échelle à cinq et
     * le 3e d'une échelle à trois ne disent pas la même chose. La garde est
     * `echellesComparables` (`profil-etudiant-calculs.js`) — l'échelle RÉSOLUE,
     * jamais l'id désigné, sans quoi une échelle restaurée sous un identifiant
     * neuf passerait pour un autre barème et effacerait la ligne chez tout le
     * monde. Une échelle absente ou introuvable est une ABSENCE, pas un barème
     * concurrent : on lit alors dans l'échelle courante.
     */
    function construireProgressionResume(evaluation, evalPrecedente, historique) {
        const result = { message: '', tendance: '' };
        if (!evalPrecedente || !evaluation.niveauFinal || !evalPrecedente.niveauFinal) return result;

        const echelleId = evaluation.echelleId;
        const rangDe = lecteurRang(echelleId);
        // Repli restrictif : sans le lecteur, on ne peut pas savoir si les rangs
        // sont comparables, et on n'annonce pas un progrès qu'on n'a pas mesuré.
        const comparable = (e) => (typeof echellesComparables === 'function')
            && echellesComparables(e && e.echelleId, echelleId);

        if (!comparable(evalPrecedente)) return result;

        const ordreAct = rangDe(evaluation.niveauFinal);
        const ordrePre = rangDe(evalPrecedente.niveauFinal);
        // Un code étranger à l'échelle n'a pas de place dans son ordre : pas de
        // progrès annoncé, plutôt qu'un progrès mesuré sur un rang inventé.
        if (ordreAct == null || ordrePre == null) return result;
        if (ordreAct < ordrePre) return result; // pas de signal de régression dans l'ancien code

        if (ordreAct > ordrePre) {
            const prodPrec = evalPrecedente.productionNom || 'la production précédente';
            result.message = `Progrès : ${evalPrecedente.niveauFinal} → ${evaluation.niveauFinal} depuis ${prodPrec}`;
        }

        // Même exigence sur le parcours : une évaluation d'un autre barème, ou
        // dont le code ne se lit pas, sort de la moyenne au lieu d'y entrer à 0
        // — ce que faisait `ORDRE_NIV[…] || 0`, qui tirait la tendance vers le bas.
        const rangsAnterieurs = historique
            .filter(comparable)
            .map(h => rangDe(h.niveauFinal))
            .filter(rang => rang != null);

        if (rangsAnterieurs.length >= 2) {
            const niveaux = [ordreAct].concat(rangsAnterieurs);
            const moitie = Math.floor(niveaux.length / 2);
            if (moitie > 0) {
                const moyR = niveaux.slice(0, moitie).reduce((s, v) => s + v, 0) / moitie;
                const moyA = niveaux.slice(moitie).reduce((s, v) => s + v, 0) / (niveaux.length - moitie);
                if (moyR >= moyA - 0.3) {
                    const tend = moyR > moyA + 0.3 ? 'en progrès' : 'en consolidation';
                    result.tendance = `Parcours sur ${niveaux.length} productions : ${tend}`;
                }
            }
        }

        return result;
    }

    function construireAmeliorations(evaluation, evalPrecedente) {
        if (!evalPrecedente || !Array.isArray(evalPrecedente.criteres) || !Array.isArray(evaluation.criteres)) return '';
        const prec = {};
        evalPrecedente.criteres.forEach(c => { prec[c.critereNom] = c.niveauSelectionne; });

        // #555 lot 2 — « tu as progressé » = passé d'une PRIORITÉ à un ACQUIS.
        // ⚠ Chaque évaluation est lue dans SON échelle : la précédente peut avoir
        // été produite sous une autre, et comparer deux zones lues dans le mauvais
        // barème annoncerait des progrès qui n'ont pas eu lieu.
        const zoneAvant = lecteurZone(evalPrecedente.echelleId);
        const zoneApres = lecteurZone(evaluation.echelleId);
        // ⮕ DEUX PROGRÈS DE NATURES DIFFÉRENTES, et Grégoire a demandé qu'ils
        // soient dits différemment (28 août 2026, option 3 sur trois proposées).
        //   · vers ACQUIS   → « Tu as progressé en X. »
        //   · vers SIGNALÉ  → « Tu as fait de beaux progrès, maintenant il faut
        //                      les consolider. »
        // Le second est le passage le plus difficile — celui qui fait sortir de
        // l'insuffisance — mais il n'est pas durable. Le taire laisserait croire
        // qu'il ne compte pas ; le confondre avec l'autre, qu'il est réglé.
        //
        // ⚠⚠ « AVANT ≠ ACQUIS », PAS « AVANT = PRIORITÉ ». La règle d'origine
        // était `(avant === 'I' || avant === 'D') && (après === 'M' || 'E')` —
        // soit « ce n'était pas acquis, ça l'est devenu ». Traduire le côté
        // gauche par `=== 'priorite'` EXCLUT la zone intermédiaire et supprime
        // deux passages qui étaient annoncés : sur l'échelle de Grégoire, D → M
        // et D → E. Régression introduite le 28 août au lot 2, corrigée le jour
        // même — et invisible au break-test, qui mutait le côté DROIT.
        // ⮕ Un `null` (échelle sans repères) n'est pas « non acquis » : on ne
        // sait pas, donc on n'annonce rien.
        const ameliores = evaluation.criteres
            .filter(c => {
                const avant = zoneAvant(prec[c.critereNom]);
                return avant != null && avant !== 'acquis'
                    && zoneApres(c.niveauSelectionne) === 'acquis';
            })
            .map(c => c.critereNom);

        // Le progrès NON DURABLE : sorti d'une priorité, pas encore acquis.
        // ⚠ Un critère qui est passé à l'acquis n'est jamais ici : les deux
        // listes sont disjointes par construction (`=== 'signale'`).
        const consolides = evaluation.criteres
            .filter(c => zoneAvant(prec[c.critereNom]) === 'priorite'
                      && zoneApres(c.niveauSelectionne) === 'signale')
            .map(c => c.critereNom);

        const phrases = [];
        if (ameliores.length) phrases.push(`Tu as progressé en ${ameliores.join(' et ')}.`);
        if (consolides.length) {
            phrases.push(`En ${consolides.join(' et ')}, tu as fait de beaux progrès : `
                + 'maintenant il faut les consolider.');
        }
        return phrases.join(' ');
    }

    /* ----- J.3 — Jetons utilisés -----
       Aligne le rendu sur la config jetons : chaque type (Délai, Reprise,
       Reprise ciblée) est listé avec son max propre tel que défini dans
       obtenirConfigJetons(). Les types désactivés dans la config (ex.
       repriseCiblee.actif=false) sont omis. Les libellés des types sont
       les noms canoniques du projet (cf. profil-etudiant.js:1258-1266) —
       la config ne stocke pas de noms personnalisés.
    */

    function construireJetons(da) {
        if (!da || typeof obtenirConfigJetons !== 'function') return null;
        let config;
        try { config = obtenirConfigJetons(); } catch (e) { return null; }
        if (!config || !config.actif) return null;

        const evaluations = lireDonneesNamespace('evaluationsSauvegardees');
        const productions = lireDonneesNamespace('productions');
        const evalsEleve = evaluations.filter(e => e.etudiantDA === da && !e.remplaceeParId);

        const nomProduction = (e) => {
            const prod = productions.find(p => p.id === e.productionId);
            return prod ? (prod.titre || prod.nom || e.productionId) : (e.productionNom || e.productionId);
        };

        // Définition des types alignée sur la structure de obtenirConfigJetons :
        //   delai.nombre, reprise.nombre, repriseCiblee.{actif, nombre}.
        const types = [
            {
                cle:    'delai',
                nom:    'Délai',
                actif:  !!(config.delai && (config.delai.nombre || 0) > 0),
                max:    (config.delai && config.delai.nombre) || 0,
                utilisations: evalsEleve.filter(e => e.jetonDelaiApplique).map(nomProduction)
            },
            {
                cle:    'reprise',
                nom:    'Reprise',
                actif:  !!(config.reprise && (config.reprise.nombre || 0) > 0),
                max:    (config.reprise && config.reprise.nombre) || 0,
                utilisations: evalsEleve.filter(e => e.jetonRepriseApplique || e.repriseDeId).map(nomProduction)
            },
            {
                cle:    'repriseCiblee',
                nom:    'Reprise ciblée',
                actif:  !!(config.repriseCiblee && config.repriseCiblee.actif && (config.repriseCiblee.nombre || 0) > 0),
                max:    (config.repriseCiblee && config.repriseCiblee.nombre) || 0,
                utilisations: evalsEleve.filter(e => e.jetonRepriseCibleeApplique).map(nomProduction)
            }
        ].filter(t => t.actif).map(t => ({
            nom:           t.nom,
            utilises:      t.utilisations.length,
            max:           t.max,
            artefacts:     t.utilisations
        }));

        if (!types.length) return null;
        return { types: types };
    }

    /* ----- J.4 — Note finale / provisoire (portfolio) -----
       Le titre du bloc dans le PDF dépend du flag explicite
       `configuration.notesFinales` de la pratique active (par défaut false →
       « Note provisoire »). Aucun fallback arbitraire sur les pondérations :
       en mode hybride, si la config catégories est incomplète, on lève une
       erreur explicite plutôt que d'inventer 65/35.

       Le data shape sépare strictement `selection` (les N meilleurs retenus)
       de `obligatoires` (les productions obligatoires, retenues d'office) pour
       éliminer le doublon visible côté rendu.
    */

    /**
     * #882 (décision Grégoire du 16 sept. 2026) — « Niveau de performance » choisi dans la
     * palette Rétroaction : le PDF ne montre que des niveaux. Même priorité que l'aperçu de
     * `travaux-export-pdf.js` : le choix ENREGISTRÉ dans l'évaluation, sinon la pratique active.
     */
    function affichageNiveauxSeulement(evaluation) {
        const choix = evaluation && evaluation.optionsAffichage && evaluation.optionsAffichage.affichageNote;
        if (choix) return choix === 'lettre';
        const cfgPrat = (typeof obtenirConfigPratiqueActive === 'function') ? obtenirConfigPratiqueActive() : null;
        const cfg = cfgPrat || {};
        return (cfg.affichageNote || (cfg.configuration && cfg.configuration.affichageNote)) === 'lettre';
    }

    function construireNoteProvisoire(da, niveauxSeulement) {
        if (!da || typeof calculerDetailsNoteFinale !== 'function') return null;
        let details;
        try { details = calculerDetailsNoteFinale(da); } catch (e) { return null; }
        if (!details || !details.portfolio || !Array.isArray(details.portfolio.artefactsRetenus) || !details.portfolio.artefactsRetenus.length) {
            return null;
        }

        const portfolio = details.portfolio;
        const productions = lireDonneesNamespace('productions');
        const evaluations = lireDonneesNamespace('evaluationsSauvegardees');

        const cfgPrat = (typeof obtenirConfigPratiqueActive === 'function') ? obtenirConfigPratiqueActive() : null;
        const cfgConfiguration = cfgPrat && cfgPrat.configuration ? cfgPrat.configuration : (cfgPrat || {});

        const estHybride = String(portfolio.methodeSelection || '').indexOf('hybride') !== -1;
        const estFinale = cfgConfiguration.notesFinales === true;

        // Pondérations en mode hybride — uniquement depuis la config catégories.
        // Pas de fallback arbitraire (cf. feedback-zero-fallback-arbitraire).
        let ponderationSelection = null;
        let ponderationObligatoires = null;
        let erreurPonderation = null;
        let nombreARetenirSelection = null;   // #883 — « N retenues sur 4 possibles »
        if (estHybride) {
            let cats = cfgPrat && cfgPrat.categories ? cfgPrat.categories : null;
            if (!cats && cfgConfiguration.categories) cats = cfgConfiguration.categories;
            if (!cats && typeof obtenirConfigCategories === 'function') cats = obtenirConfigCategories();
            const pondSel = cats && cats.selection ? cats.selection.ponderation : null;
            const pondObl = cats && cats.obligatoires ? cats.obligatoires.ponderation : null;
            nombreARetenirSelection = (cats && cats.selection && typeof cats.selection.nombreARetenir === 'number')
                ? cats.selection.nombreARetenir : null;
            if (pondSel == null || pondObl == null) {
                erreurPonderation = 'Pondérations Sélection/Obligatoires manquantes dans la configuration de la pratique.';
            } else {
                ponderationSelection = pondSel;
                ponderationObligatoires = pondObl;
            }
        }

        const obtenirActivite = (productionId) => {
            const pr = productions.find(p => p.id === productionId);
            return pr ? (pr.activiteApprentissage || pr.description || '') : '';
        };
        // Resolution de l'echeance par groupe de l'ELEVE (pas par contexte
        // UI actif, qui peut differer si le dropdown a change entre temps).
        const gcIdEleve = obtenirGcIdEleve(da);
        const obtenirEcheance = (prod) => {
            if (typeof obtenirEcheanceEffective === 'function') {
                const r = obtenirEcheanceEffective(prod, gcIdEleve);
                return (r && r.date) || null;
            }
            if (prod.dateEcheance) return prod.dateEcheance;
            if (prod.echeancesParGroupe && gcIdEleve) {
                const entree = prod.echeancesParGroupe[gcIdEleve];
                return (entree && entree.date) || null;
            }
            return null;
        };

        // Croise un artefact retenu (depuis le calculateur) avec sa production
        // pour récupérer titre + catégorie. La catégorie pilote le bucket
        // (sélection vs obligatoires) en mode hybride. La note chiffrée
        // (`art.note`) est conservée pour l'affichage individuel dans le PDF.
        const decrireRetenu = (art) => {
            const prod = productions.find(p => p.id === art.productionId);
            return {
                titre:     prod ? (prod.titre || 'Production') : 'Production',
                niveau:    art.niveau || '?',
                note:      (typeof art.note === 'number') ? art.note : null,
                activite:  obtenirActivite(art.productionId),
                categorie: prod ? (prod.categorie || null) : null
            };
        };

        const retenusDecrits = portfolio.artefactsRetenus.slice()
            .sort((a, b) => (b.note || 0) - (a.note || 0))
            .map(decrireRetenu);

        // En hybride, séparer strictement sélection / obligatoires depuis la
        // catégorie de la production. En non-hybride, tout va dans `selection`.
        const selection = estHybride
            ? retenusDecrits.filter(r => r.categorie !== 'obligatoire')
            : retenusDecrits;
        const obligatoiresRetenus = estHybride
            ? retenusDecrits.filter(r => r.categorie === 'obligatoire')
            : [];

        // Sélection des artefacts portfolio (priorité au type explicite, fallback non-portfolio)
        // #883 — une production diagnostique n'est ni « à venir » ni obligatoire : elle ne compte pas.
        const productionsNotees = (typeof window.ProductionDiagnostique !== 'undefined')
            ? window.ProductionDiagnostique.filtrerProductions(productions)
            : productions;
        let artefactsPortfolio = productionsNotees.filter(p => p.type === 'artefact-portfolio');
        if (!artefactsPortfolio.length) {
            artefactsPortfolio = productionsNotees.filter(p => p.type !== 'portfolio');
        }

        const idsEvalues = new Set();
        evaluations
            .filter(e => e.etudiantDA === da && !e.remplaceeParId && e.noteFinale != null)
            .forEach(e => idsEvalues.add(e.productionId));

        const avenir = artefactsPortfolio
            .filter(p => !idsEvalues.has(p.id))
            .filter(p => !(estHybride && p.categorie === 'obligatoire'))
            .map(prod => ({
                titre:    prod.titre || 'Production',
                activite: prod.activiteApprentissage || prod.description || '',
                echeance: obtenirEcheance(prod)
            }));

        // Liste complète des obligatoires (retenus + non remis) pour le rendu
        // de la colonne dédiée. Les retenus ont déjà leur niveau ; les non
        // remis sont signalés par `niveau: null`.
        const obligatoiresTous = estHybride
            ? artefactsPortfolio.filter(p => p.categorie === 'obligatoire').map(prod => {
                const evalObl = evaluations.find(e => e.productionId === prod.id && e.etudiantDA === da && !e.remplaceeParId && e.noteFinale != null);
                return {
                    titre:    prod.titre || 'Production',
                    niveau:   evalObl ? (evalObl.niveauFinal || null) : null,
                    note:     evalObl && typeof evalObl.noteFinale === 'number' ? evalObl.noteFinale : null,
                    activite: prod.activiteApprentissage || prod.description || '',
                    echeance: obtenirEcheance(prod)
                };
            })
            : [];

        // Nombre d'évaluations dans le pool de sélection (= total évalués − obligatoires
        // RÉELLEMENT évaluées). Sert au titre « les N meilleures sur M évaluées ».
        const obligatoiresEvaluees = obligatoiresTous.filter(o => typeof o.note === 'number').length;
        const nombreEvaluesSelection = Math.max(0, (portfolio.nombreEvalues || 0) - obligatoiresEvaluees);

        // #882 — niveaux seulement : aucun chiffre ne quitte ce module (notes, moyenne,
        // pondérations). Les comptes et le tri ci-dessus les ont déjà lus. Le rendu n'a pas de
        // garde propre : sans pondération ni moyenne, il ne forme ni calcul ni note finale.
        if (niveauxSeulement) {
            const sansNote = (item) => Object.assign({}, item, {
                niveau: (typeof item.note === 'number' && !item.niveau) ? '?' : item.niveau,
                note: null
            });
            return {
                niveauxSeulement:         true,
                estHybride:               estHybride,
                estFinale:                estFinale,
                selection:                selection.map(sansNote),
                nombreSelection:          selection.length,
                nombreEvaluesSelection:   nombreEvaluesSelection,
                nombreARetenirSelection:  nombreARetenirSelection,
                obligatoires:             obligatoiresTous.map(sansNote),
                obligatoiresRetenus:      obligatoiresRetenus.length,
                ponderationSelection:     null,
                ponderationObligatoires:  null,
                erreurPonderation:        null,
                moyenne:                  null,
                plafonnement:             null,
                avenir:                   avenir
            };
        }

        return {
            estHybride:               estHybride,
            estFinale:                estFinale,
            selection:                selection,
            nombreSelection:          selection.length,
            nombreEvaluesSelection:   nombreEvaluesSelection,
            nombreARetenirSelection:  nombreARetenirSelection,
            obligatoires:             obligatoiresTous,
            obligatoiresRetenus:      obligatoiresRetenus.length,
            ponderationSelection:     ponderationSelection,
            ponderationObligatoires:  ponderationObligatoires,
            erreurPonderation:        erreurPonderation,
            moyenne:                  Math.round((portfolio.moyenne || 0) * 10) / 10,
            plafonnement:             portfolio.plafonnement || null,
            avenir:                   avenir
        };
    }

    function lireHistorique(evaluation) {
        return historiqueAnterieur(lireDonneesNamespace('evaluationsSauvegardees'), {
            da: evaluation.etudiantDA, idCopie: evaluation.id, date: evaluation.dateEvaluation
        });
    }

    /* =====================================================================
       #940 — LE BILAN : UNE SEULE RÈGLE POUR LE PDF ET POUR L'ÉCRAN
       ===================================================================== */
    // Le bilan de l'écran (`evaluation-retroaction.js`) lit ces trois fonctions : il est
    // copié par `copierToutRetroaction` dans ce que l'élève reçoit, et doit dire les mêmes
    // mots que le PDF (#581). Même motif que `commentaireDuCritere` (#939).

    /**
     * L'historique de l'élève AVANT cette copie — ses autres copies, la plus récente
     * d'abord, les reprises remplacées écartées.
     *
     * ⮕ #940 — deux changements, les deux nécessaires à « depuis N productions » :
     * · PLUS DE PLAFOND. Il était de cinq copies, et le compte aurait plafonné à 6 sans le
     *   dire. Un trimestre en compte rarement plus d'une dizaine : tout se lit.
     * · SEULES LES COPIES ANTÉRIEURES. Rouvrir la deuxième copie d'un trimestre prenait
     *   pour « précédente » la plus récente de toutes, POSTÉRIEURE à celle-ci. Une copie
     *   sans date reste (en fin de liste, comme avant) : on ne l'écarte pas sur un doute ;
     *   sans date pour la copie en cours (pas encore enregistrée), toutes les autres sont
     *   antérieures.
     *
     * @param {Array} evaluations - toutes les évaluations du trimestre
     * @param {{da: string, idCopie?: string, date?: string}} copie - l'élève, la copie en cours
     */
    function historiqueAnterieur(evaluations, { da, idCopie, date } = {}) {
        if (!da || !Array.isArray(evaluations)) return [];
        const limite = date ? new Date(date).getTime() : NaN;
        const quand = (e) => new Date(e.dateEvaluation || 0).getTime();
        return evaluations
            .filter(e => e && e.etudiantDA === da && !e.remplaceeParId && !(idCopie && e.id === idCopie))
            .filter(e => isNaN(limite) || !e.dateEvaluation || !(quand(e) > limite))
            .sort((a, b) => quand(b) - quand(a));
    }

    /**
     * Une ligne de « Présentement, il faut se concentrer sur » : `Nom (niveau) : définition`.
     * Sans définition dans la grille : `Nom (niveau)`, rien d'inventé. Sans niveau lisible :
     * le nom seul. Les morceaux arrivent déjà échappés quand l'appelant pose du HTML.
     */
    function ligneCritereATravailler(nom, niveau, definition) {
        const def = (definition == null) ? '' : String(definition).trim();
        const tete = niveau ? `${nom} (${niveau})` : String(nom);
        return def ? `${tete} : ${def}` : tete;
    }

    const MOT_DE_LA_ZONE = { priorite: 'prioritaire', signale: 'à consolider' };

    /**
     * « Points récurrents » : les critères à travailler sur cette copie ET sur la précédente.
     *
     * ⮕ Décision de Grégoire (24 sept. 2026) : « une récurrence identifiée dans le temps »,
     * « une cible de travail immédiate pour l'élève ». Dès DEUX productions. La ligne donne le
     * nombre réel de productions consécutives où le critère reste à travailler, en remontant
     * l'historique jusqu'à la première copie où il est acquis ; le mot vient de la zone de
     * la copie ACTUELLE.
     *
     * ⚠ CHAQUE COPIE EST LUE DANS SON ÉCHELLE (#555 lot 2) : une zone se compare à une zone,
     * jamais un code à un code.
     * ⚠ SEULE UNE COPIE OÙ LE CRITÈRE EST ACQUIS ARRÊTE LE COMPTE (décision de Grégoire,
     * 24 sept. 2026, après la relecture de Cowork). Une copie qui ne dit rien du critère est
     * SAUTÉE — elle n'interrompt pas la récurrence et n'entre pas dans le compte : critère
     * absent de sa grille (les productions d'un trimestre n'évaluent pas toutes les mêmes
     * critères), ou échelle sans repères (`null`). N compte les productions qui l'évaluent.
     *
     * @param {Array} criteres - les critères à travailler de la copie, dans l'ordre d'affichage
     * @param {Array} historique - les copies antérieures, la plus récente d'abord
     * @param {string|null} echelleId - l'échelle de la copie en cours
     * @param {Function} lecteurZoneDe - `echelleId → (code → zone)`
     * @param {Function} [formaterNom] - l'échappement du nom quand l'appelant pose du HTML
     * @returns {string[]} « Nom : prioritaire depuis N productions »
     */
    function lignesRecurrentes(criteres, historique, echelleId, lecteurZoneDe, formaterNom) {
        const nomDe = (typeof formaterNom === 'function') ? formaterNom : (n) => String(n);
        const zoneCourante = lecteurZoneDe(echelleId);
        const anterieures = (Array.isArray(historique) ? historique : []).map(ev => {
            const zoneDe = lecteurZoneDe(ev && ev.echelleId);
            const zones = {};
            if (ev && Array.isArray(ev.criteres)) {
                ev.criteres.forEach(c => { if (c && c.critereNom) zones[c.critereNom] = zoneDe(c.niveauSelectionne); });
            }
            return zones;
        });
        const lignes = [];
        (Array.isArray(criteres) ? criteres : []).forEach(c => {
            const mot = MOT_DE_LA_ZONE[zoneCourante(c.niveauSelectionne)];
            if (!mot) return;
            let productions = 1;
            for (const zones of anterieures) {
                const zone = zones[c.critereNom];
                if (zone === 'acquis') break;
                if (zone === 'priorite' || zone === 'signale') productions++;   // sinon : sautée
            }
            if (productions >= 2) lignes.push(`${nomDe(c.critereNom)} : ${mot} depuis ${productions} productions`);
        });
        return lignes;
    }

    /* =====================================================================
       LECTEURS / HELPERS
       ===================================================================== */

    function lireDonneesNamespace(cleBase) {
        if (typeof obtenirDonneesSelonMode === 'function') {
            const d = obtenirDonneesSelonMode(cleBase);
            return Array.isArray(d) ? d : [];
        }
        const cleEffective = (typeof window.cle === 'function') ? window.cle(cleBase) : cleBase;
        const donnees = db.getSync(cleEffective, []);
        return Array.isArray(donnees) ? donnees : [];
    }

    // Resoud le groupe-cours id pour un eleve (par son DA) plutot que par
    // le contexte UI actif. Necessaire pour echeancesParGroupe : la PDF
    // doit afficher la date du groupe de l'ELEVE, pas celle du groupe
    // affiche dans le dropdown au moment de l'export.
    function obtenirGcIdEleve(da) {
        if (!da) return null;
        const eleves = lireDonneesNamespace('groupeEtudiants');
        const eleve = eleves.find(e => e.da === da);
        if (!eleve || !eleve.groupe) return null;

        const gcs = lireDonneesNamespace('groupesCours');
        const infoCoursActif = db.getSync('infoCours', null);
        const coursIdActif = infoCoursActif ? (infoCoursActif.coursId || infoCoursActif.id) : null;

        // Match par numero de groupe + coursId actif (cas multi-cours)
        if (coursIdActif) {
            const gcExact = gcs.find(g => g.groupeNum === eleve.groupe && g.coursId === coursIdActif);
            if (gcExact) return gcExact.id;
        }
        // Fallback : juste par numero de groupe (un seul cours)
        const gcParGroupe = gcs.find(g => g.groupeNum === eleve.groupe);
        if (gcParGroupe) return gcParGroupe.id;

        return null;
    }

    function lireGrille(grilleId) {
        if (!grilleId) return null;
        const grilles = db.getSync(cle('grillesTemplates'), []) || [];
        return grilles.find(g => g.id === grilleId) || null;
    }

    function lireCartouche(grilleId, cartoucheId) {
        if (!grilleId || !cartoucheId) return null;
        let cartouches = db.getSync(cle(`cartouches_${grilleId}`), []);
        if (cartouches && !Array.isArray(cartouches)) cartouches = [cartouches];
        return (cartouches || []).find(c => c.id === cartoucheId) || null;
    }

    function compterAnnotations(annotation) {
        if (!annotation) return null;
        if (typeof travauxExportPDF !== 'undefined' && typeof travauxExportPDF.compterAnnotationsDetailees === 'function') {
            return travauxExportPDF.compterAnnotationsDetailees(annotation);
        }
        return null;
    }

    /* =====================================================================
       EXPORT
       ===================================================================== */

    window.syntheseRetroactionData = {
        construireFeedback: construireFeedback,
        // Exposés pour le rendu et les tests
        FAMILY_COLOR: FAMILY_COLOR,
        // #673 — EXPOSÉ POUR QUE LA LISTE RESTE UNIQUE. L'écran d'évaluation doit
        // reconnaître les mêmes amorces pour savoir ce qu'il a le droit d'effacer
        // (`_effacerRetroactionMachine`, evaluation-calcul.js). Recopier la liste
        // là-bas créerait deux inventaires qui divergeraient en silence — le défaut
        // que la sentinelle statique de #672 existe précisément pour empêcher.
        // Ce module charge AVANT evaluation-calcul.js (index.html l. 14602 vs 14645),
        // et l'appel a lieu bien après le chargement complet de toute façon.
        estAmorceDeSaisie: estAmorceDeSaisie,
        // #939 — la règle du commentaire d'un critère, lue par le PDF (ci-dessus), par le
        // texte copié vers Léa (`_rendreCommentairesCriteres`) et par l'écran d'évaluation
        // qui remplit `comm_<critereId>` (`_afficherCommentaireCritere`).
        commentaireDuCritere: commentaireDuCritere,
        // #940 — le bilan, lu par le PDF (ci-dessus) et par celui de l'écran
        // (`genererRetroactionBilan`, evaluation-retroaction.js).
        historiqueAnterieur: historiqueAnterieur,
        ligneCritereATravailler: ligneCritereATravailler,
        lignesRecurrentes: lignesRecurrentes
        // #575 — `SCALE_FALLBACK` était exposée ici ; elle n'avait aucun lecteur
        // hors du module. Sa remplaçante (`COULEUR_NIVEAU_NEUTRE`) reste privée
        // plutôt que d'ajouter un export que personne n'appelle.
    };
})();
