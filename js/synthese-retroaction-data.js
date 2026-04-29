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

    // Mapping ordinal IDME pour comparaisons (force, progression, jauge)
    const ORDRE_NIV = { 'E': 4, 'M': 3, 'D': 2, 'I': 1, '0': 0 };

    // Échelle IDME de fallback si echellesTemplates absent ou échelle introuvable.
    // Les couleurs sont des hex pour l'export PDF rasterisé (pas de var(--…) qui
    // ne survit pas à html2canvas hors du DOM live).
    const SCALE_FALLBACK = [
        { code: '0', label: 'Non recevable',    solo: 'Préstructurel',    min: 0,  max: 0,   color: '#b8b8b8' },
        { code: 'I', label: 'Insuffisant',      solo: 'Unistructurel',    min: 1,  max: 64,  color: '#f08c3a' },
        { code: 'D', label: 'En développement', solo: 'Multistructurel',  min: 65, max: 74,  color: '#f0c83a' },
        { code: 'M', label: 'Maîtrisé',         solo: 'Relationnel',      min: 75, max: 84,  color: '#5fb84a' },
        { code: 'E', label: 'Étendu',           solo: 'Abstrait étendu',  min: 85, max: 100, color: '#27b9e0' }
    ];

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
            bilan:     construireBilan(evaluation, grille, echelle, stats)
        };
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
            prenom = prenom || parts.slice(0, -1).join(' ') || parts[0] || '';
            nom = nom || parts.slice(-1)[0] || '';
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
        const libelle = lettre === 'H' ? 'Hiver' : lettre === 'A' ? 'Automne' : lettre;
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
                due:         status === 'todo' ? (production.dateLimite || production.dateRemise || null) : null
            };
        });
    }

    /* =====================================================================
       E. ÉCHELLE IDME
       ===================================================================== */

    function lireEchelle(echelleId) {
        const echelles = db.getSync('echellesTemplates', []) || [];
        const echelle = echelles.find(x => x.id === echelleId);
        if (!echelle || !Array.isArray(echelle.niveaux) || !echelle.niveaux.length) {
            return SCALE_FALLBACK.slice();
        }
        return echelle.niveaux.map(n => ({
            code:  n.code || '',
            label: n.nom || n.label || '',
            solo:  n.description || n.solo || '',
            min:   typeof n.min === 'number' ? n.min : null,
            max:   typeof n.max === 'number' ? n.max : null,
            color: normaliserCouleur(n.couleur || n.color, n.code)
        }));
    }

    /**
     * Préserve la couleur telle qu'elle est stockée dans l'échelle utilisateur
     * (hex, rgb, hsl, nom CSS, var(--xxx)). Le rendu se fait dans le DOM live
     * donc html2canvas peut résoudre les variables CSS. On retombe sur le
     * fallback IDME uniquement quand aucune couleur n'est définie.
     */
    function normaliserCouleur(couleur, code) {
        if (typeof couleur === 'string' && couleur.trim()) {
            return couleur.trim();
        }
        const fallback = SCALE_FALLBACK.find(s => s.code === code);
        return fallback ? fallback.color : '#767169';
    }

    /* =====================================================================
       F. CRITÈRES
       ===================================================================== */

    function construireCriteres(evaluation, grille, cartouche) {
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const grilleCriteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];

        return criteres.map(c => {
            const def = grilleCriteres.find(gc => gc.id === c.critereId || gc.nom === c.critereNom) || {};
            const niveau = c.niveauSelectionne || '';
            const cleCart = c.critereId && niveau ? `${c.critereId}_${niveau}` : null;
            const commentaire =
                (c.retroaction && c.retroaction.trim()) ||
                (cartouche && cleCart && cartouche.commentaires && cartouche.commentaires[cleCart]) ||
                '';

            return {
                key:     c.critereId || c.critereNom || '',
                name:    c.critereNom || def.nom || '',
                weight:  typeof c.ponderation === 'number' ? c.ponderation : (def.ponderation || 0),
                sub:     def.description || '',
                code:    niveau,
                comment: commentaire
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

        const defis = criteres
            .filter(c => c.niveauSelectionne === 'I' || c.niveauSelectionne === 'D')
            .sort((a, b) => (ORDRE_NIV[a.niveauSelectionne] || 0) - (ORDRE_NIV[b.niveauSelectionne] || 0));

        const patrons = identifierPatrons(criteres, historique);
        // Vérification explicite M/E sur tous les critères : un travail Non recevable
        // (niveau '0') ou sans critères ne doit JAMAIS déclencher « tous maîtrisés ».
        const tousMaitrises = criteres.length > 0 &&
            criteres.every(c => c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E');

        let messageGlobal = '';
        if (tousMaitrises) {
            const totErr = stats ? (stats.totalErreursFr || 0) : 0;
            if (totErr > 0) {
                messageGlobal = `Tous les critères sont maîtrisés. Concentre-toi sur la qualité du français (${totErr} erreur${totErr > 1 ? 's' : ''} annotée${totErr > 1 ? 's' : ''}).`;
            } else {
                // Garde length > 0 : .every() retourne true sur tableau vide (vacuité JS).
                const maitriseLongtemps = historique[0] && Array.isArray(historique[0].criteres) &&
                    historique[0].criteres.length > 0 &&
                    historique[0].criteres.every(c => c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E');
                messageGlobal = maitriseLongtemps
                    ? "Tous les critères sont maîtrisés depuis plus d'un artefact. Tu peux aider tes collègues — c'est une excellente façon d'étendre tes compétences vers le niveau É (transfert à d'autres contextes)."
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
            priorites:      priorites
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
        const meilleur = criteres.reduce((acc, c) => {
            const o = ORDRE_NIV[c.niveauSelectionne] || 0;
            const oAcc = acc ? (ORDRE_NIV[acc.niveauSelectionne] || 0) : -1;
            return o > oAcc ? c : acc;
        }, null);
        if (!meilleur) return '';
        if (meilleur.niveauSelectionne !== 'M' && meilleur.niveauSelectionne !== 'E') return '';
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

    function construireProgressionResume(evaluation, evalPrecedente, historique) {
        const result = { message: '', tendance: '' };
        if (!evalPrecedente || !evaluation.niveauFinal || !evalPrecedente.niveauFinal) return result;

        const ordreAct = ORDRE_NIV[evaluation.niveauFinal] || 0;
        const ordrePre = ORDRE_NIV[evalPrecedente.niveauFinal] || 0;
        if (ordreAct < ordrePre) return result; // pas de signal de régression dans l'ancien code

        if (ordreAct > ordrePre) {
            const prodPrec = evalPrecedente.productionNom || 'la production précédente';
            result.message = `Progrès : ${evalPrecedente.niveauFinal} → ${evaluation.niveauFinal} depuis ${prodPrec}`;
        }

        if (historique.length >= 2) {
            const niveaux = [ordreAct].concat(historique.map(h => ORDRE_NIV[h.niveauFinal] || 0));
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
        const ameliores = evaluation.criteres
            .filter(c => {
                const p = prec[c.critereNom];
                return p && (p === 'I' || p === 'D') && (c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E');
            })
            .map(c => c.critereNom);
        return ameliores.length ? `Tu as progressé en ${ameliores.join(' et ')}.` : '';
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

    /* ----- J.4 — Note provisoire (portfolio) ----- */

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

        const estHybride = String(portfolio.methodeSelection || '').indexOf('hybride') !== -1;

        // Pondérations en mode hybride
        let pondSel = '';
        let pondObl = '';
        if (estHybride) {
            const cfgPrat = (typeof obtenirConfigPratiqueActive === 'function') ? obtenirConfigPratiqueActive() : null;
            let cats = cfgPrat && cfgPrat.categories ? cfgPrat.categories : null;
            if (!cats && typeof obtenirConfigCategories === 'function') cats = obtenirConfigCategories();
            if (cats) {
                if (cats.selection) pondSel = ` (${cats.selection.ponderation || 65}%)`;
                if (cats.obligatoires) pondObl = ` (${cats.obligatoires.ponderation || 35}%)`;
            }
        }

        const obtenirActivite = (productionId) => {
            const pr = productions.find(p => p.id === productionId);
            return pr ? (pr.activiteApprentissage || pr.description || '') : '';
        };
        const obtenirEcheance = (prod) => {
            if (prod.dateEcheance) return prod.dateEcheance;
            if (prod.echeancesParGroupe) {
                for (const gcId in prod.echeancesParGroupe) {
                    const entree = prod.echeancesParGroupe[gcId];
                    if (entree && entree.date) return entree.date;
                }
            }
            return null;
        };

        // Retenus triés par note décroissante
        const retenus = portfolio.artefactsRetenus.slice()
            .sort((a, b) => (b.note || 0) - (a.note || 0))
            .map(art => {
                const prod = productions.find(p => p.id === art.productionId);
                return {
                    titre:    prod ? (prod.titre || 'Artefact') : 'Artefact',
                    niveau:   art.niveau || '?',
                    activite: obtenirActivite(art.productionId)
                };
            });

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

        const obligatoires = estHybride
            ? artefactsPortfolio.filter(p => p.categorie === 'obligatoire').map(prod => {
                const evalObl = evaluations.find(e => e.productionId === prod.id && e.etudiantDA === da && !e.remplaceeParId && e.noteFinale != null);
                return {
                    titre:    prod.titre || 'Artefact',
                    niveau:   evalObl ? (evalObl.niveauFinal || null) : null,
                    activite: prod.activiteApprentissage || prod.description || '',
                    echeance: obtenirEcheance(prod)
                };
            })
            : [];

        return {
            retenus:                  retenus,
            nombreRetenus:            portfolio.nombreRetenus || retenus.length,
            moyenne:                  Math.round((portfolio.moyenne || 0) * 10) / 10,
            plafonnement:             portfolio.plafonnement || null,
            ponderationSelection:     pondSel,
            ponderationObligatoires:  pondObl,
            avenir:                   avenir,
            obligatoires:             obligatoires
        };
    }

    function identifierPatrons(criteresActuels, historique) {
        if (!Array.isArray(historique) || historique.length < 2) return [];

        const niveauxAt = (idx) => {
            const map = {};
            const ev = historique[idx];
            if (ev && Array.isArray(ev.criteres)) {
                ev.criteres.forEach(c => { map[c.critereNom] = c.niveauSelectionne; });
            }
            return map;
        };
        const cH1 = niveauxAt(0);
        const cH2 = niveauxAt(1);

        const estFaible = (n) => n === 'I' || n === 'D';

        return criteresActuels
            .filter(c => estFaible(c.niveauSelectionne) && estFaible(cH1[c.critereNom]) && estFaible(cH2[c.critereNom]))
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

    function lireGrille(grilleId) {
        if (!grilleId) return null;
        const grilles = db.getSync('grillesTemplates', []) || [];
        return grilles.find(g => g.id === grilleId) || null;
    }

    function lireCartouche(grilleId, cartoucheId) {
        if (!grilleId || !cartoucheId) return null;
        let cartouches = db.getSync(`cartouches_${grilleId}`, []);
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
        FAMILY_ORDER: FAMILY_ORDER,
        SCALE_FALLBACK: SCALE_FALLBACK
    };
})();
