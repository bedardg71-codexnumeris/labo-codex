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
    // ⚠ CE QUI RESTE, ET QUI NE PEUT PAS ÊTRE FAIT ICI : ce module teste encore
    // les codes EN TOUTES LETTRES — `=== 'I' || === 'D'` pour les défis,
    // `=== 'M' || === 'E'` pour « tous maîtrisés ». L'ORDRE se dérive d'une
    // échelle ; « quel niveau est faible » et « quel niveau est maîtrisé », non.
    // C'est la marque de maîtrise de #555. Le faire sans elle remplacerait un
    // arbitrage codé en dur par un autre. Même butée que `evaluation-retroaction.js`.

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

    // Ordre d'affichage des familles dans la synthèse.
    const FAMILY_ORDER = ['action', 'observations', 'comprehension'];

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
            trimestre: construireTrimestre(evaluation),
            scale:     echelle,
            criteria:  construireCriteres(evaluation, grille, cartouche),
            overall:   construireOverall(evaluation, echelle),
            stamps:    construireStamps(stats),
            errors:    construireErrors(stats),
            errorsTotal: stats ? stats.totalErreursFr : 0,
            bilan:     construireBilan(evaluation, grille, echelle, stats),
            // Drapeau « vue recalculée a posteriori » (#347). Vrai quand des
            // artefacts ultérieurs sont entrés dans le portfolio agrégé depuis
            // la remise de CET artefact — auquel cas la synthèse ne reflète plus
            // la rétroaction historique reçue par l'élève au moment de la remise.
            recalculee: detecterRecalculPosteriori(evaluation)
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

    function construireCriteres(evaluation, grille, cartouche) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const grilleCriteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
        const donneesAlgo = evaluation.donneesAlgorithmiques || {};

        return criteres.map(c => {
            const def = grilleCriteres.find(gc => gc.id === c.critereId || gc.nom === c.critereNom) || {};
            const niveau = c.niveauSelectionne || '';
            const cleCart = c.critereId && niveau ? `${c.critereId}_${niveau}` : null;
            const estAlgorithmique = def.type === 'algorithmique';
            const donneesAlgoCrit = (estAlgorithmique && donneesAlgo[c.critereId]) ? donneesAlgo[c.critereId] : null;
            const ponderationCrit = (typeof c.ponderation === 'number') ? c.ponderation : (def.ponderation || 0);

            // Rétroaction algorithmique (ex. Français écrit : « Ta rédaction
            // contient X erreurs… ») persistée sur l'évaluation au moment de
            // la saisie. Sans ce fallback, le PDF affiche le placeholder
            // « Saisissez les erreurs et le nombre de mots ».
            const retroAlgo = (donneesAlgoCrit && donneesAlgoCrit.retroaction)
                ? String(donneesAlgoCrit.retroaction).trim()
                : '';
            const commentaireBrut =
                (c.retroaction && c.retroaction.trim()) ||
                retroAlgo ||
                (cartouche && cleCart && cartouche.commentaires && cartouche.commentaires[cleCart]) ||
                '';
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

            return {
                key:     c.critereId || c.critereNom || '',
                name:    c.critereNom || def.nom || '',
                weight:  ponderationCrit,
                sub:     def.description || '',
                code:    niveau,
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

    function construireStamps(stats) {
        const sortie = { action: [], observations: [], comprehension: [] };
        if (!stats || !stats.tampons) return sortie;

        // Catalogue + rétroactions par défaut + couleurs de catégories (palette utilisateur)
        const catalogue = (typeof travauxOutils !== 'undefined' && travauxOutils.AUTOCOLLANTS)
            ? travauxOutils.AUTOCOLLANTS
            : [];
        const retroactions = (typeof travauxOutils !== 'undefined' && typeof travauxOutils.obtenirRetroactionsObservations === 'function')
            ? travauxOutils.obtenirRetroactionsObservations()
            : {};
        // Couleurs personnalisées par catégorie (palette tampons configurée par l'utilisateur)
        const couleursCat = (typeof db !== 'undefined' && db.getSync) ? (db.getSync('couleursCategories', null) || {}) : {};

        Object.keys(stats.tampons).forEach(id => {
            const count = stats.tampons[id] || 0;
            if (!count) return;
            const meta = catalogue.find(a => a.id === id);
            if (!meta) return; // tampon inconnu (legacy non listé) → ignoré
            const famille = meta.categorie;
            if (!sortie[famille]) return; // catégorie 'qualite'/'diagnostic' legacy → ignorée
            const couleurFam = couleursCat[famille] || FAMILY_COLOR[famille] || '#767169';
            sortie[famille].push({
                id:      id,
                nom:     meta.nom || '',
                count:   count,
                comment: retroactions[id] || '',
                icone:   tamponEnDataURL(id, couleurFam),
                couleur: couleurFam
            });
        });

        // Tri stable : par count décroissant puis par nom
        FAMILY_ORDER.forEach(fam => {
            sortie[fam].sort((a, b) => (b.count - a.count) || a.nom.localeCompare(b.nom));
        });

        return sortie;
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
       I. ERREURS FRANÇAIS ÉCRIT
       ===================================================================== */

    function construireErrors(stats) {
        if (!stats || !stats.erreursFr) return [];

        const codes = (typeof travauxOutils !== 'undefined' && travauxOutils.CODES_ERREURS_FR)
            ? travauxOutils.CODES_ERREURS_FR
            : [];
        const retroactions = (typeof travauxOutils !== 'undefined' && typeof travauxOutils.obtenirRetroactionsErreursFr === 'function')
            ? travauxOutils.obtenirRetroactionsErreursFr()
            : {};
        // OUTILS expose la couleur de chaque code (personnalisable par l'utilisateur)
        const outils = (typeof travauxOutils !== 'undefined' && travauxOutils.OUTILS) ? travauxOutils.OUTILS : {};

        return Object.keys(stats.erreursFr)
            .map(id => {
                const count = stats.erreursFr[id] || 0;
                const meta = codes.find(c => c.id === id);
                const couleurOutil = outils[id] && outils[id].couleurBouton;
                return {
                    code:        meta ? meta.code : null,
                    name:        meta ? meta.nom : id,
                    count:       count,
                    color:       couleurOutil || '#141414',
                    retroaction: retroactions[id] || ''
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
     * Le niveau le plus haut de l'échelle de cette évaluation — ou `null`.
     *
     * ⮕ #575 B10, trouvé en chemin. Le message « tous les critères sont
     * maîtrisés depuis plus d'un artefact » nommait le niveau visé EN DUR :
     * « vers le niveau É (transfert à d'autres contextes) ». C'était le nom et
     * la description SOLO du dernier niveau de l'échelle de Grégoire, écrits
     * dans un PDF remis aux élèves de qui que ce soit — le défaut même que la
     * sentinelle jumelle interdit déjà pour la légende et la jauge.
     *
     * Le « plus haut » se lit par le rang, donc par les plages : c'est une
     * dérivation, pas une convention. Sans échelle résolue, `null` — la phrase
     * s'arrête alors avant la mention, plutôt que de nommer un niveau inventé.
     *
     * @returns {Object|null} `{ label, solo }` — `solo` vide si non renseigné.
     */
    function niveauLePlusHaut(echelleId, echelle) {
        const ordonnes = (typeof niveauxOrdonnesDeLEchelle === 'function')
            ? niveauxOrdonnesDeLEchelle(echelleId || null)
            : [];
        if (!ordonnes.length) return null;
        const sommet = ordonnes[ordonnes.length - 1];
        const dansEchelle = Array.isArray(echelle)
            ? echelle.find(n => n.code === sommet.code)
            : null;
        const label = sommet.nom || (dansEchelle && dansEchelle.label) || sommet.code;
        if (!label) return null;
        return { label: label, solo: (dansEchelle && dansEchelle.solo) || '' };
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

    function construireBilan(evaluation, grille, echelle, stats) {
        const historique = lireHistorique(evaluation);
        const evalPrecedente = historique[0] || null;
        const da = evaluation.etudiantDA;

        return {
            intro:         BILAN_INTRO,
            concentration: construireConcentration(evaluation, grille, echelle, historique, stats),
            recurrents:    construireRecurrents(evaluation, echelle, evalPrecedente, historique, stats),
            jetons:        construireJetons(da),
            note:          construireNoteProvisoire(da)
        };
    }

    /* ----- J.1 — Présentement, il faut se concentrer sur... ----- */

    function construireConcentration(evaluation, grille, echelle, historique, stats) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const grilleCriteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];

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

        const patrons = identifierPatrons(criteres, historique, evaluation.echelleId);
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
                messageGlobal = `Tous les critères sont maîtrisés. Concentre-toi sur la qualité du français (${totErr} erreur${totErr > 1 ? 's' : ''} annotée${totErr > 1 ? 's' : ''}).`;
            } else {
                // Garde length > 0 : .every() retourne true sur tableau vide (vacuité JS).
                // ⚠ L'évaluation précédente porte SON échelle, pas forcément celle-ci.
                const zonePrecedente = lecteurZone(historique[0] && historique[0].echelleId);
                const maitriseLongtemps = historique[0] && Array.isArray(historique[0].criteres) &&
                    historique[0].criteres.length > 0 &&
                    historique[0].criteres.every(c => zonePrecedente(c.niveauSelectionne) === 'acquis');
                const sommet = niveauLePlusHaut(evaluation.echelleId, echelle);
                const versLeSommet = sommet
                    ? ` — c'est une excellente façon d'étendre tes compétences vers le niveau ${sommet.label}${sommet.solo ? ` (${sommet.solo})` : ''}.`
                    : '.';
                messageGlobal = maitriseLongtemps
                    ? `Tous les critères sont maîtrisés depuis plus d'un artefact. Tu peux aider tes collègues${versLeSommet}`
                    : 'Tous les critères sont maîtrisés. Continue sur cette lancée !';
            }
        }

        const priorites = defis.slice(0, 2).map(d => {
            const def = grilleCriteres.find(gc => gc.nom === d.critereNom || gc.id === d.critereId);
            const desc = def && def.description ? def.description.toLowerCase() : '';
            const prefix = desc || d.critereNom;
            const niveauTxt = libelleNiveau(echelle, d.niveauSelectionne);
            const recurrent = patrons.indexOf(d.critereNom) !== -1
                ? '. Cet objectif est prioritaire depuis 3 productions'
                : '';
            return `${prefix} (${d.critereNom} ${niveauTxt})${recurrent}`;
        });

        return {
            tousMaitrises:  tousMaitrises,
            messageGlobal:  messageGlobal,
            priorites:      priorites,
            signales:       signales.map(d => `${d.critereNom} (${libelleNiveau(echelle, d.niveauSelectionne)})`)
        };
    }

    /* ----- J.2 — Points récurrents ----- */

    function construireRecurrents(evaluation, echelle, evalPrecedente, historique, stats) {
        const tampons = construireTamponsRecurrents(stats);
        const francais = construireFrancaisResume(stats);
        const progression = construireProgressionResume(evaluation, evalPrecedente, historique);
        const ameliorations = construireAmeliorations(evaluation, evalPrecedente);
        const force = construireForce(evaluation, echelle);

        return {
            force:         force,
            tampons:       tampons,
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
        return `Ta force : ${meilleur.critereNom} (${libelleNiveau(echelle, meilleur.niveauSelectionne)})`;
    }

    function construireTamponsRecurrents(stats) {
        if (!stats || !stats.tampons) return [];
        const catalogue = (typeof travauxOutils !== 'undefined' && travauxOutils.AUTOCOLLANTS) ? travauxOutils.AUTOCOLLANTS : [];
        const retroactions = (typeof travauxOutils !== 'undefined' && typeof travauxOutils.obtenirRetroactionsObservations === 'function')
            ? travauxOutils.obtenirRetroactionsObservations() : {};

        return Object.keys(stats.tampons)
            .map(id => {
                const count = stats.tampons[id] || 0;
                const meta = catalogue.find(a => a.id === id);
                const retro = retroactions[id] || '';
                if (!count || !meta || !retro) return null;
                return {
                    nom:          meta.nom || id,
                    count:        count,
                    retroaction:  retro.length > 80 ? retro.substring(0, 80) + '...' : retro
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.count - a.count)
            .slice(0, 2);
    }

    function construireFrancaisResume(stats) {
        if (!stats || !stats.totalErreursFr) return '';
        const codes = (typeof travauxOutils !== 'undefined' && travauxOutils.CODES_ERREURS_FR) ? travauxOutils.CODES_ERREURS_FR : [];
        const total = stats.totalErreursFr;
        const principal = Object.keys(stats.erreursFr || {})
            .sort((a, b) => stats.erreursFr[b] - stats.erreursFr[a])[0];
        const meta = principal ? codes.find(c => c.id === principal) : null;
        const nomPrinc = meta ? meta.nom : '';
        return `Français : ${total} erreur${total > 1 ? 's' : ''}${nomPrinc ? ` (principalement : ${nomPrinc})` : ''}`;
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

    function construireNoteProvisoire(da) {
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
        if (estHybride) {
            let cats = cfgPrat && cfgPrat.categories ? cfgPrat.categories : null;
            if (!cats && cfgConfiguration.categories) cats = cfgConfiguration.categories;
            if (!cats && typeof obtenirConfigCategories === 'function') cats = obtenirConfigCategories();
            const pondSel = cats && cats.selection ? cats.selection.ponderation : null;
            const pondObl = cats && cats.obligatoires ? cats.obligatoires.ponderation : null;
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
                titre:     prod ? (prod.titre || 'Artefact') : 'Artefact',
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
        let artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
        if (!artefactsPortfolio.length) {
            artefactsPortfolio = productions.filter(p => p.type !== 'portfolio');
        }

        const idsEvalues = new Set();
        evaluations
            .filter(e => e.etudiantDA === da && !e.remplaceeParId && e.noteFinale != null)
            .forEach(e => idsEvalues.add(e.productionId));

        const avenir = artefactsPortfolio
            .filter(p => !idsEvalues.has(p.id))
            .filter(p => !(estHybride && p.categorie === 'obligatoire'))
            .map(prod => ({
                titre:    prod.titre || 'Artefact',
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
                    titre:    prod.titre || 'Artefact',
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

        return {
            estHybride:               estHybride,
            estFinale:                estFinale,
            selection:                selection,
            nombreSelection:          selection.length,
            nombreEvaluesSelection:   nombreEvaluesSelection,
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

    /**
     * Les critères prioritaires depuis TROIS productions d'affilée.
     *
     * ⮕ #555 lot 2 — `estFaible` testait `n === 'I' || n === 'D'`. Chaque
     * évaluation de l'historique est maintenant lue dans SON échelle : un élève
     * dont la pratique a changé de barème en cours de trimestre n'hérite pas
     * d'un « objectif prioritaire depuis 3 productions » calculé sur des zones
     * qui ne parlaient pas de la même chose.
     */
    function identifierPatrons(criteresActuels, historique, echelleIdCourante) {
        if (!Array.isArray(historique) || historique.length < 2) return [];

        const zonesAt = (idx) => {
            const map = {};
            const ev = historique[idx];
            const zoneDe = lecteurZone(ev && ev.echelleId);
            if (ev && Array.isArray(ev.criteres)) {
                ev.criteres.forEach(c => { map[c.critereNom] = zoneDe(c.niveauSelectionne); });
            }
            return map;
        };
        const zH1 = zonesAt(0);
        const zH2 = zonesAt(1);
        const zoneCourante = lecteurZone(echelleIdCourante);

        return criteresActuels
            .filter(c => zoneCourante(c.niveauSelectionne) === 'priorite'
                      && zH1[c.critereNom] === 'priorite'
                      && zH2[c.critereNom] === 'priorite')
            .map(c => c.critereNom);
    }

    function lireHistorique(evaluation) {
        const da = evaluation.etudiantDA;
        if (!da) return [];
        const evaluations = lireDonneesNamespace('evaluationsSauvegardees');
        return evaluations
            .filter(e => e.etudiantDA === da && !e.remplaceeParId && e.id !== evaluation.id)
            .sort((a, b) => new Date(b.dateEvaluation || 0) - new Date(a.dateEvaluation || 0))
            .slice(0, 5);
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
        FAMILY_ORDER: FAMILY_ORDER
        // #575 — `SCALE_FALLBACK` était exposée ici ; elle n'avait aucun lecteur
        // hors du module. Sa remplaçante (`COULEUR_NIVEAU_NEUTRE`) reste privée
        // plutôt que d'ajouter un export que personne n'appelle.
    };
})();
