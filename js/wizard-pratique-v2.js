/**
 * WIZARD PRATIQUE V2
 * Wizard de création de pratique de notation aligné sur l'architecture Beta 95
 *
 * ÉCRITURES pratiquesConfigurables : création et modification via wizard
 *
 * Structure :
 * 1. Définition des étapes (ETAPES_WIZARD)
 * 2. Gestion de la navigation (suivant, précédent, saut conditionnel)
 * 3. Affichage dynamique selon branche
 * 4. Validation et sauvegarde
 *
 * @version 2.0.0
 * @date 26 décembre 2025
 */

(function() {
'use strict';

// ============================================================================
// ÉTAT DU WIZARD
// ============================================================================

/**
 * État global du wizard
 */
const wizardState = {
    etapeActuelle: 'entree-pratique',
    historique: [],          // Pile des étapes visitées pour navigation arrière
    reponses: {},            // Réponses collectées à chaque étape
    modeEdition: false,      // true si modification d'une pratique existante
    pratiqueId: null,        // ID de la pratique en édition (null si création)
    grilleDeBase: null       // Lot E1 : la grille de base proposée, pas encore écrite
};

/**
 * Lot E1 (D3 : « tant qu'on n'a pas cliqué, rien n'existe ») — les grilles que
 * l'assistant peut proposer : celles en base, plus la grille de base générée à sa
 * demande, qui n'est écrite qu'avec la pratique (`finaliserCreationPratique`).
 */
function grillesDuWizard() {
    const grilles = db.getSync(cle('grillesTemplates'), []) || [];
    return wizardState.grilleDeBase ? grilles.concat([wizardState.grilleDeBase]) : grilles;
}

// Familles canoniques → badge (code court + libellé + description du diagnostic).
// SSOT du vocabulaire de famille dans l'assistant : consommé par le récapitulatif
// (genererRecapitulatif) ET par l'écran « Partir d'un modèle » (#319 Lot 2 a7,
// badge famille). Un seul endroit à éditer, pas de microcopy dupliqué.
const TYPE_BADGES = {
    'sommative': { code: 'SOM', classe: 'som', label: 'Sommative', description: 'Ta note finale est calculée par une moyenne pondérée des évaluations. C\'est la méthode traditionnelle, largement utilisée.' },
    'standards': { code: 'STD', classe: 'std', label: 'PAN – Standards', description: 'Tu évalues par niveaux de maîtrise (ex. : I-D-M-E). La note est construite à partir de la démonstration de compétences, pas d\'une simple moyenne.' },
    'specifications': { code: 'SPE', classe: 'spe', label: 'PAN – Spécifications', description: 'Chaque travail est jugé acceptable ou non. La note finale dépend du nombre de spécifications réussies (forfaits).' },
    // #319 Lot 5 (#318) : DEN reconnue à l'édition (code/couleur du registre canonique,
    // --den-violet). Parcours de CRÉATION reporté #318 — pas de carte Q1 pour DEN.
    'denotation': { code: 'DEN', classe: 'den', label: 'PAN – Dénotation', description: 'Rétroaction qualitative sur des cibles et des critères explicites ; la note certificative est posée par jugement à la fin.' }
};

// ============================================================================
// DÉFINITION DES ÉTAPES
// ============================================================================

/**
 * Le libellé d'une règle sommative — #809 (9 sept. 2026). SOURCE UNIQUE dans
 * `construction-attributs.js`, chargé avant ce fichier. Le repli rend la clé
 * brute plutôt qu'un trou, et n'invente aucun mot : si le module manquait, on
 * verrait « double_verrou », ce qui se remarque, plutôt qu'un libellé fantôme
 * qui divergerait en silence — c'est exactement ce qui était arrivé.
 */
function _libelleRegle(cle) {
    return (window.ConstructionAttributs && window.ConstructionAttributs.libelleRegleSommative)
        ? window.ConstructionAttributs.libelleRegleSommative(cle)
        : cle;
}

/**
 * #903 (21 sept. 2026) — TROIS RÈGLES QUE RIEN N'APPLIQUE ONT QUITTÉ L'ASSISTANT :
 * le plafonnement (sa condition est un texte libre), le remplacement (un nombre de
 * paires, sans dire lesquelles) et le déclaratif des reprises (une reprise vaut par
 * `remplaceeParId`, quel que soit le mode coché). Tranché par Grégoire le 17 sept.
 * On a retiré des CASES, pas des données : une pratique déjà enregistrée garde ce
 * qu'elle porte — voir `conserverReglesRetirees`, appelée par `sauvegarderPratique`.
 */
const REGLES_SOMMATIVES_RETIREES = ['remplacement', 'plafonnement'];

// ───────────────────────────────────────────────────────────────────────────
// INFÉRENCE COMPORTEMENTALE (bug testeur 8 juin : « pas-certain »)
// Le novice qui ne s'est pas reconnu dans les familles nommées ne se reconnaîtra
// pas davantage en les reformulant. On l'interroge donc sur ce qu'il FAIT (gestes
// observables) et on INFÈRE la famille. Un seul moteur de déduction (deduireTypePratique
// consomme ces signaux) ; ces helpers ne font que cartographier signal → famille.
// Déclarations de fonction → hoistées, donc appelables dans le littéral ETAPES_WIZARD.

// Cartographie d'un signal vers la valeur canonique calcNoteFinale (pas la famille
// directement : on réutilise ensuite les branches existantes de deduireTypePratique
// ET le routage existant — zéro duplication du mapping famille→config).
const _SIGNAUX_FAMILLE = {
    uniteCorrection:   { pourcentage: 'moyenne', niveau: 'niveaux', mention: 'acceptable' },
    sortReprise:       { compte: 'moyenne', remplacee: 'niveaux', exigence: 'acceptable' },
    departagePratique: { somme: 'moyenne', maitrise: 'niveaux', exigences: 'acceptable' }
};

/**
 * Infère la valeur canonique `calcNoteFinale` à partir des gestes observables.
 * - départage répondu → tranche directement ;
 * - deux signaux concordants → la famille commune ;
 * - signaux divergents → null (l'étape route vers le départage comportemental) ;
 * - un seul signal présent → ce signal.
 * @returns {'moyenne'|'niveaux'|'acceptable'|null}
 */
function _infererFamilleComportementale(reponses) {
    const dep = _SIGNAUX_FAMILLE.departagePratique[reponses.departagePratique];
    if (dep) return dep;
    const u = _SIGNAUX_FAMILLE.uniteCorrection[reponses.uniteCorrection];
    const r = _SIGNAUX_FAMILLE.sortReprise[reponses.sortReprise];
    if (u && r) return (u === r) ? u : null;   // divergence → départage
    return u || r || null;
}

/**
 * Routage après une étape d'inférence comportementale. Réutilise le moteur unique
 * (deduireTypePratique) puis les étapes de config existantes. Renvoie l'étape de
 * départage si les signaux divergent encore (jamais d'impasse, jamais « nomme ta méthode »).
 */
function _etapeApresInference(reponses) {
    // Tant que les DEUX gestes ne sont pas répondus, fin de traversée (renvoie null,
    // comme les autres étapes sur réponse absente). Sans ce garde, le compteur d'étapes
    // (calculerNbEtapes, traversée du graphe) bouclait : signaux absents → famille nulle
    // → 'departage-pratique', dont le suivant rebouclait sur lui-même jusqu'au plafond
    // (≈ 40 points parasites en tête de carte). Bug d'affichage 1.3.0.
    if (!reponses.uniteCorrection || !reponses.sortReprise) return null;
    const cls = deduireTypePratique(reponses);
    if (cls.type === 'sommative') return 'regles-sommative';
    if (cls.type === 'standards') return 'approche-evaluation';
    if (cls.type === 'specifications') return 'nb-evaluations';
    return 'departage-pratique'; // les deux signaux divergent → 3e question
}

/**
 * Configuration de toutes les étapes du wizard
 * Chaque étape définit son contenu, sa validation et sa navigation
 */
const ETAPES_WIZARD = {
    // ─────────────────────────────────────────────────────────────────────────
    // ENTRÉE — Deux portes (#319 Lot 2 a7)
    // Le novice rencontre du sens d'abord ; l'expert part d'un modèle et va vite.
    // Étape de tête en CRÉATION uniquement (l'édition entre à 'calcul-note-finale').
    // ─────────────────────────────────────────────────────────────────────────

    'entree-pratique': {
        id: 'entree-pratique',
        titre: 'Comment veux-tu créer ta pratique ?',
        description: 'Pars d\'un modèle existant pour aller vite, ou décris ta pratique étape par étape.',
        branche: 'commune',
        ordre: 1,
        champs: [
            {
                id: 'porteEntree',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'modele',
                        label: 'Partir d\'un modèle',
                        description: 'Choisis un gabarit prêt à l\'emploi ou une de tes pratiques. Tu l\'adoptes telle quelle ; tu pourras la renommer et l\'ajuster ensuite.'
                    },
                    {
                        value: 'decrire',
                        label: 'Décrire ma pratique',
                        description: 'Réponds à quelques questions sur ta façon de noter. L\'assistant identifie le type qui te correspond.'
                    }
                ]
            }
        ],
        suivant: (reponses) => reponses.porteEntree === 'modele' ? 'choix-modele' : 'calcul-note-finale',
        precedent: () => null
    },

    'choix-modele': {
        id: 'choix-modele',
        titre: 'Choisis un modèle',
        description: 'Adopter un modèle copie sa configuration dans une nouvelle pratique. L\'original n\'est pas modifié — tu pourras renommer et ajuster ta copie ensuite.',
        branche: 'commune',
        ordre: 2,
        // Liste construite dynamiquement : gabarits prédéfinis + pratiques de la
        // bibliothèque de l'enseignant. L'adoption saute au récapitulatif ; le clonage
        // réel est fait par etapeSuivanteV2 (préparation) puis creerPratiqueV2 (écriture).
        getChampsDynamiques: () => [
            {
                id: 'modeleChoisi',
                type: 'radio-cards',
                required: true,
                options: obtenirOptionsModeles()
            }
        ],
        suivant: () => 'recapitulatif',
        precedent: () => 'entree-pratique'
    },

    // Voie rapide (#319 Lot 2 a2) — atteinte par le lien « Je sais déjà ce que je
    // veux » sous Q1. Choix DIRECT de famille (réutilise l'id 'calcNoteFinale' comme
    // sous-questions-guidees) → saut à la branche de configuration. DEN incluse (#318).
    // Atteinte hors-graphe : wizardV2VoieRapide n'empile pas Q1 → voie-rapide occupe
    // la position de calcul-note-finale (compteur #134 cohérent).
    'voie-rapide': {
        id: 'voie-rapide',
        titre: 'Choisis directement ta famille',
        description: 'Tu sais déjà comment tu notes ? Choisis ta famille de pratique et passe directement à sa configuration.',
        branche: 'commune',
        ordre: 2,
        champs: [
            {
                id: 'calcNoteFinale',
                type: 'radio-cards',
                required: true,
                options: [
                    { value: 'moyenne', label: 'Sommative (SOM)', description: 'Note finale par moyenne pondérée des évaluations.' },
                    { value: 'niveaux', label: 'PAN – Standards (STD)', description: 'Niveaux de maîtrise (ex. I-D-M-E) convertis en note.' },
                    { value: 'acceptable', label: 'PAN – Spécifications (SPE)', description: 'Travaux acceptables ou non ; note selon les forfaits réussis.' },
                    { value: 'jugement', label: 'PAN – Dénotation (DEN)', description: 'Note finale certificative posée (non calculée) selon l\'atteinte de cibles d\'apprentissage explicites ; abandonne la fonction de tri.' }
                ]
            }
        ],
        suivant: (reponses) => {
            if (reponses.calcNoteFinale === 'moyenne') return 'regles-sommative';
            if (reponses.calcNoteFinale === 'niveaux') return 'approche-evaluation';
            if (reponses.calcNoteFinale === 'acceptable') return 'nb-evaluations';
            if (reponses.calcNoteFinale === 'jugement') return 'config-denotation';
            return null;
        },
        precedent: () => 'calcul-note-finale'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE DÉNOTATION (DEN couche 2, #318)
    // ─────────────────────────────────────────────────────────────────────────

    'config-denotation': {
        id: 'config-denotation',
        titre: 'Configuration de la dénotation',
        description: 'La note finale sera un jugement que tu poses, gardé par la confirmation que chaque cible d\'apprentissage est atteinte.',
        branche: 'denotation',
        ordre: 3,
        champs: [
            {
                id: 'infoDenotation',
                type: 'info',
                variante: 'attention',
                texte: 'La dénotation s\'appuie sur des cibles et des critères explicites (grille, échelle) pour la rétroaction ; elle abandonne la fonction de tri, mais produit toujours une note certificative (RREC : 60 réussite / 59 échec).'
            },
            {
                // #717 : une ligne par cible, chacune porte son id (EditeurCibles).
                id: 'ciblesDenotation',
                label: 'Cibles d\'apprentissage',
                type: 'liste-cibles',
                required: true
            },
            {
                id: 'infoMethodeSuggestion',
                type: 'info',
                texte: 'Suggestion statistique : un ancrage facultatif calculé à partir des niveaux atteints par cible. « L\'algorithme propose, le jugement tranche » — tu peux toujours t\'en écarter.'
            },
            {
                id: 'methodeSuggestionDen',
                type: 'radio-cards',
                required: true,
                options: [
                    { value: 'mode', label: 'Mode', description: 'La note la plus fréquente parmi les niveaux atteints par cible.' },
                    { value: 'mediane', label: 'Médiane', description: 'La valeur centrale des niveaux atteints par cible.' },
                    { value: 'moyenne', label: 'Moyenne', description: 'La moyenne des niveaux atteints par cible.' }
                ]
            },
            {
                // #343 (b) : DEN s'appuie sur des critères EXPLICITES pour la
                // rétroaction formative (échelle + grille), comme toute pratique.
                // Ces outils NE servent PAS à calculer la note (qui reste un jugement
                // saisi, gardé par les cibles) — ils explicitent les critères tout au
                // long de la session. Les deux sont optionnels.
                id: 'infoMaterielDen',
                type: 'info',
                texte: 'Tu peux rattacher une échelle de performance et une grille de critères pour ta rétroaction tout au long de la session. Elles rendent tes critères explicites, mais ne calculent pas la note finale — celle-ci reste le jugement que tu poses à la fin.'
            },
            {
                id: 'echelleId',
                type: 'select-echelle',
                required: false,
                label: 'Échelle de performance (optionnelle, pour la rétroaction)'
            },
            {
                id: 'grilleId',
                type: 'select-grille',
                required: false,
                label: 'Grille de critères (optionnelle, pour la rétroaction)'
            }
        ],
        suivant: () => 'infos-base',
        precedent: () => 'voie-rapide'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPES COMMUNES
    // ─────────────────────────────────────────────────────────────────────────

    'infos-base': {
        id: 'infos-base',
        titre: 'Informations de base',
        description: 'Ces informations servent à identifier ta pratique et à générer la licence Creative Commons (CC BY-NC-SA 4.0) pour le partage.',
        branche: 'commune',
        ordre: 1,
        champs: [
            { id: 'nom', label: 'Nom de la pratique', type: 'text', required: true, placeholder: 'Ex: Ma pratique de notation' },
            { id: 'auteur-row', type: 'row', champs: [
                { id: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'Prénom' },
                { id: 'nomAuteur', label: 'Nom', type: 'text', required: true, placeholder: 'Nom' }
            ]},
            { id: 'etablissement', label: 'Établissement', type: 'text', required: true, placeholder: 'Ex: Cégep de Drummondville' },
            { id: 'discipline', label: 'Discipline', type: 'select-disciplines', required: true },
            { id: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Décris brièvement ta pratique (optionnel)' },
            { id: 'infoCC', type: 'info', texte: 'Le partage n\'est pas obligatoire, mais ces informations permettent de protéger ton travail sous licence Creative Commons (CC BY-NC-SA 4.0) et d\'en attribuer la création si tu choisis de le partager.' }
        ],
        // #319 Lot 2 (a6) : infos-base est désormais juste AVANT le récapitulatif —
        // on nomme/attribue la pratique une fois qu'on sait ce qu'elle est.
        suivant: () => 'recapitulatif',
        precedent: (reponses) => {
            // Précédent = la dernière étape de configuration (ex-précédent du récap).
            // #900 (lot N6) : l'étape « Configuration sommative » (rang, moyenne du groupe) est retirée.
            if (reponses.typePratique === 'sommative') {
                const regles = deduireTypePratique(reponses).regles || [];
                return (regles.length > 0 && !regles.includes('aucune')) ? 'config-sommative-regles' : 'seuils-personnels';
            }
            if (reponses.typePratique === 'specifications') return 'choix-modele-bundles';
            if (reponses.typePratique === 'denotation') return 'config-denotation';
            return 'grille-criteres'; // PAN-Standards (portfolio — seule approche depuis #443)
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CLASSIFICATION COMPORTEMENTALE (Q1-Q5)
    // Remplace l'ancien type-pratique par des questions concrètes
    // ─────────────────────────────────────────────────────────────────────────

    'calcul-note-finale': {
        id: 'calcul-note-finale',
        titre: 'Comment calcules-tu la note finale ?',
        description: 'Cette question nous aide à identifier le type de pratique qui correspond à ta méthode.',
        branche: 'commune',
        ordre: 2,
        champs: [
            {
                id: 'calcNoteFinale',
                type: 'radio-cards',
                required: true,
                options: [
                    {
                        value: 'moyenne',
                        label: 'Moyenne pondérée des évaluations',
                        description: 'La note finale est calculée à partir de la moyenne des notes obtenues aux différentes évaluations, chacune ayant un poids.'
                    },
                    {
                        value: 'niveaux',
                        label: 'Niveaux de maîtrise (ex: I-D-M-E, A-B-C-D)',
                        description: 'Tu utilises une échelle de niveaux pour évaluer la maîtrise des apprentissages, puis convertis en note.'
                    },
                    {
                        value: 'acceptable',
                        label: 'Acceptable / Non acceptable avec forfaits',
                        description: 'Chaque travail est jugé acceptable ou non. La note finale dépend du nombre de spécifications réussies.'
                    },
                    {
                        // #318 — DEN devient une famille de 1er rang. Distinctif : PAS « le jugement
                        // professionnel » (commun à toutes les PAN — SKILL_pratiques_notation §2 bis),
                        // mais une note finale POSÉE et non calculée ; abandon du tri, certification conservée.
                        value: 'jugement',
                        label: 'Note finale posée, pas calculée (PAN – Dénotation)',
                        description: 'Tu poses la note finale certificative (RREC) selon l\'atteinte de cibles d\'apprentissage explicites, plutôt que de la calculer. La rétroaction en cours de route reste qualitative.'
                    },
                    {
                        value: 'pas-certain',
                        label: 'Je ne suis pas certain·e',
                        description: 'Des questions supplémentaires t\'aideront à identifier ta méthode.'
                    }
                ]
            },
            // Voie rapide (a2) : sortie expert, carte de même poids que les autres options.
            { id: 'voie-rapide-lien', type: 'lien-action', texte: 'Je sais déjà ce que je veux', description: 'Choisis directement ta famille de pratique (SOM, STD, SPE ou DEN) et passe à sa configuration.', action: 'wizardV2VoieRapide' }
        ],
        suivant: (reponses) => {
            if (reponses.calcNoteFinale === 'moyenne') return 'regles-sommative';
            if (reponses.calcNoteFinale === 'niveaux') return 'approche-evaluation';
            if (reponses.calcNoteFinale === 'acceptable') return 'nb-evaluations';
            if (reponses.calcNoteFinale === 'jugement') return 'config-denotation'; // #318
            if (reponses.calcNoteFinale === 'pas-certain') return 'sous-questions-guidees';
            return null;
        },
        precedent: () => 'entree-pratique'
    },

    // Bug testeur 8 juin : cet écran reposait STRICTEMENT la même question que
    // 'calcul-note-finale' (même champ calcNoteFinale, mêmes valeurs, juste reformulé).
    // Reformuler ne lève pas l'incertitude. On change d'AXE : deux questions sur ce
    // que l'enseignant FAIT (gestes observables), jamais sur le nom de sa méthode, et
    // on INFÈRE la famille (deduireTypePratique consomme uniteCorrection/sortReprise).
    'sous-questions-guidees': {
        id: 'sous-questions-guidees',
        titre: 'Identifions ta méthode',
        description: 'Deux questions sur ce que tu fais concrètement — pas besoin de nommer ta méthode, on la déduit.',
        branche: 'commune',
        ordre: 2,
        champs: [
            {
                id: 'uniteCorrection',
                type: 'radio-cards',
                required: true,
                question: 'Sur une copie corrigée, tu inscris le plus souvent…',
                options: [
                    { value: 'pourcentage', label: 'Un pourcentage ou une note chiffrée', description: 'Ex. 78 %, 17 sur 20.' },
                    { value: 'niveau', label: 'Un niveau ou une cote', description: 'Ex. A, I-D-M-E, 3 sur 4.' },
                    { value: 'mention', label: 'Une mention atteint / non atteint', description: 'Ex. réussi, à reprendre.' }
                ]
            },
            {
                id: 'sortReprise',
                type: 'radio-cards',
                required: true,
                question: 'Un élève rate un travail, le reprend et réussit. La première note…',
                options: [
                    { value: 'compte', label: 'Compte encore dans la moyenne', description: 'Les deux résultats pèsent dans la note finale.' },
                    { value: 'remplacee', label: 'Est remplacée — seul le meilleur niveau compte', description: 'On retient le meilleur résultat, pas l\'historique.' },
                    { value: 'exigence', label: 'N\'a pas vraiment de sens en soi', description: 'Ce qui compte, c\'est que l\'exigence finisse par être satisfaite.' }
                ]
            }
        ],
        suivant: (reponses) => _etapeApresInference(reponses),
        precedent: () => 'calcul-note-finale'
    },

    // Départage comportemental — atteint UNIQUEMENT quand les deux signaux ci-dessus
    // pointent des familles différentes (pratique hybride/floue). Jamais d'impasse,
    // jamais de retour à « nomme ta méthode » : une 3e question sur le geste.
    'departage-pratique': {
        id: 'departage-pratique',
        titre: 'Une dernière précision',
        description: 'Tes deux réponses pointent vers des approches différentes — une question pour trancher.',
        branche: 'commune',
        ordre: 2,
        champs: [
            {
                id: 'departagePratique',
                type: 'radio-cards',
                required: true,
                question: 'À la fin de la session, la note d\'un élève reflète surtout…',
                options: [
                    { value: 'somme', label: 'La somme de ses résultats accumulés', description: 'La note additionne ou moyenne ce qui a été obtenu au fil de la session.' },
                    { value: 'maitrise', label: 'Son niveau de maîtrise le plus avancé', description: 'Ce qui compte est le meilleur niveau atteint, pas l\'historique des essais.' },
                    { value: 'exigences', label: 'Le nombre d\'exigences qu\'il a fini par satisfaire', description: 'La note dépend des exigences satisfaites, peu importe quand.' }
                ]
            }
        ],
        // Garde anti-auto-boucle : ne route qu'une fois le départage répondu (sinon
        // null = fin de traversée, jamais un retour sur soi qui sature le compteur).
        suivant: (reponses) => reponses.departagePratique ? _etapeApresInference(reponses) : null,
        precedent: () => 'sous-questions-guidees'
    },

    'regles-sommative': {
        id: 'regles-sommative',
        titre: 'Utilises-tu des règles spéciales ?',
        description: 'Sélectionne toutes les règles qui s\'appliquent à ta pratique de notation.',
        branche: 'sommative',
        ordre: 3,
        champs: [
            {
                id: 'reglesSommatives',
                type: 'checkbox-cards',
                required: true,
                options: [
                    {
                        value: 'double_verrou',
                        label: _libelleRegle('double_verrou'),
                        description: 'Une évaluation spécifique (ex: la finale) doit être réussie pour passer le cours.'
                    },
                    {
                        value: 'portfolio',
                        label: _libelleRegle('portfolio'),
                        description: 'Un portfolio d\'artefacts contribue à la note, avec progression prise en compte.'
                    },
                    {
                        value: 'aucune',
                        label: 'Aucune règle spéciale',
                        description: 'Moyenne pondérée classique sans règle particulière.',
                        exclusive: true
                    }
                ]
            }
        ],
        suivant: () => 'nb-evaluations',
        precedent: () => 'calcul-note-finale'
    },

    'nb-evaluations': {
        id: 'nb-evaluations',
        titre: 'Nombre d\'évaluations',
        description: 'Combien d\'évaluations prévois-tu pour cette session ?',
        branche: 'commune',
        ordre: 4,
        champs: [
            {
                id: 'nbEvaluationsPrevues',
                label: 'Nombre d\'évaluations prévues',
                type: 'number',
                min: 1,
                max: 50,
                default: 6,
                required: true
            }
        ],
        suivant: () => 'seuils-personnels',
        precedent: (reponses) => {
            if (reponses.calcNoteFinale === 'moyenne') return 'regles-sommative';
            if (reponses.calcNoteFinale === 'niveaux') return 'approche-evaluation';
            return 'calcul-note-finale';
        }
    },

    'seuils-personnels': {
        id: 'seuils-personnels',
        titre: 'Tes seuils personnels',
        description: 'Ces seuils servent au dépistage automatique des étudiant·es en difficulté.',
        branche: 'commune',
        ordre: 5,
        champs: [
            {
                id: 'seuilVaBien',
                label: 'Ça va bien à partir de (%)',
                type: 'number',
                min: 0,
                max: 100,
                default: 75,
                required: true
            },
            {
                id: 'seuilDifficulte',
                label: 'En difficulté à partir de (%)',
                type: 'number',
                min: 0,
                max: 100,
                default: 65,
                required: true
            },
            {
                id: 'seuilGrandeDifficulte',
                label: 'Grande difficulté sous (%)',
                type: 'number',
                min: 0,
                max: 100,
                default: 55,
                required: true
            }
        ],
        suivant: (reponses) => {
            const classification = deduireTypePratique(reponses);
            const type = classification.type;
            const regles = classification.regles || [];
            // Sommative avec règles spéciales → configurer les règles
            if (type === 'sommative' && regles.length > 0 && !regles.includes('aucune')) {
                return 'config-sommative-regles';
            }
            if (type === 'sommative') return 'infos-base';
            // #443 : PAN-Standards n'a plus qu'une approche. Le branchement à
            // trois voies est retiré avec les étapes qu'il servait — un aiguillage
            // dont deux sorties sont mortes finit par être relu comme un choix.
            if (type === 'standards') return 'config-portfolio';
            if (type === 'specifications') return 'config-specifications';
            return 'infos-base';
        },
        precedent: () => 'nb-evaluations'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2 : ENRICHISSEMENT DE LA CAPTURE
    // ─────────────────────────────────────────────────────────────────────────

    'config-sommative-regles': {
        id: 'config-sommative-regles',
        titre: 'Configuration des règles spéciales',
        description: 'Précise les détails de tes règles de notation.',
        branche: 'sommative',
        ordre: 6,
        champs: [],
        getChampsDynamiques: (reponses) => {
            const regles = reponses.reglesSommatives || [];
            const champs = [];

            if (regles.includes('double_verrou')) {
                champs.push({
                    id: 'infoVerrou',
                    type: 'info',
                    texte: 'Verrou : une évaluation doit être réussie pour que la note finale dépasse un plafond.'
                });
                champs.push({
                    id: 'nomEvalVerrouillee',
                    label: 'Nom de l\'évaluation verrouillée',
                    type: 'text',
                    placeholder: 'Ex: Analyse finale',
                    required: true
                });
                champs.push({
                    id: 'seuilVerrou',
                    label: 'Seuil minimum requis (%)',
                    type: 'number',
                    min: 0,
                    max: 100,
                    default: 60,
                    required: true
                });
                champs.push({
                    id: 'plafondVerrou',
                    label: 'Note maximale si seuil non atteint (%)',
                    type: 'number',
                    min: 0,
                    max: 100,
                    default: 55,
                    required: true
                });
            }

            if (regles.includes('portfolio')) {
                champs.push({
                    id: 'infoPortfolio',
                    type: 'info',
                    texte: 'Portfolio de progression : les artefacts contribuent à la note avec prise en compte de la progression.'
                });
                // #900 (lot N6) : « Nombre d'artefacts dans le portfolio » et « Portfolio qualitatif »
                // sont retirés — leurs réponses (`portfolio.nbArtefacts`, `portfolio.qualitatif`)
                // n'étaient lues par rien.
            }

            return champs;
        },
        suivant: () => 'infos-base',
        precedent: () => 'seuils-personnels'
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE SOMMATIVE
    // ─────────────────────────────────────────────────────────────────────────

    // #900 (lot N6, 23 sept. 2026) : l'étape « Configuration sommative » (« Afficher le rang
    // dans le groupe ? », « Afficher la moyenne du groupe ? ») est retirée. Ses deux réponses
    // (`afficherRang`, `afficherMoyenneGroupe`) n'étaient lues par aucun écran.

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE PAN-STANDARDS
    // ─────────────────────────────────────────────────────────────────────────

    'approche-evaluation': {
        id: 'approche-evaluation',
        titre: 'Approche d\'évaluation',
        description: 'Comment souhaites-tu structurer tes évaluations ?',
        branche: 'standards',
        ordre: 4,
        // #443 (10 août 2026, décision Grégoire) — la carte « Par objectifs
        // d'apprentissage » est RETIRÉE. Elle promettait « la note finale selon
        // le niveau atteint pour chaque objectif » : #396 (5 août) avait déjà
        // rerouté son calcul vers `conversion_niveaux` au lieu de la retirer, et
        // #435 (9 août) a abattu le moteur sans repasser par cette surface. Le
        // wizard proposait donc un paradigme qu'aucun moteur ne tenait plus —
        // deux surfaces, deux vérités, exactement la confusion signalée au terrain.
        //
        // ⮕ L'étape est CONSERVÉE en écran d'information (arbitrage Grégoire) :
        // elle nomme explicitement ce sur quoi PAN-Standards s'appuie, au lieu
        // de le décider en coulisse. La carte unique est pré-cochée pour ne pas
        // faire cliquer sur une question sans alternative.
        champs: [
            {
                id: 'approcheEvaluation',
                type: 'radio-cards',
                required: true,
                default: 'par-artefacts',
                options: [
                    {
                        value: 'par-artefacts',
                        label: 'Par artefacts (portfolio)',
                        description: 'Les étudiant·es soumettent des artefacts. La note finale est calculée à partir des N meilleurs artefacts.'
                    }
                ]
            },
            {
                id: 'infoApprocheUnique',
                type: 'info',
                texte: 'PAN-Standards s\'appuie sur le portfolio : c\'est la progression à travers les artefacts qui construit la note.'
            }
        ],
        suivant: () => 'nb-evaluations',
        precedent: () => 'calcul-note-finale'
    },

    // --- Branche artefacts ---

    'config-portfolio': {
        id: 'config-portfolio',
        titre: 'Configuration du portfolio',
        description: 'Paramètre la gestion des artefacts',
        branche: 'standards-artefacts',
        ordre: 5,
        champs: [
            {
                id: 'utiliserPortfolio',
                label: 'Utiliser un portfolio ?',
                type: 'toggle',
                default: true
            },
            {
                id: 'nbArtefactsSoumis',
                label: 'Nombre d\'artefacts à soumettre',
                type: 'number',
                min: 1,
                max: 20,
                default: 12,
                required: true
            },
            // 🆕 #24 : Mode de sélection pour construction de la note
            {
                id: 'modeSelectionPortfolio',
                label: 'Construction de la note',
                type: 'select',
                options: [
                    { value: 'n_meilleurs', label: 'N meilleurs artefacts' },
                    { value: 'tous', label: 'Tous les artefacts' },
                    { value: 'derniers', label: 'N derniers artefacts' },
                    { value: 'hybride', label: 'Hybride (N meilleures + Obligatoires)' }
                ],
                default: 'n_meilleurs',
                required: true,
                aide: 'Hybride : combine N meilleures productions + productions obligatoires (ex: examen final). Configuration détaillée en Mode Expert.'
            },
            {
                id: 'nbArtefactsRetenus',
                label: 'Nombre d\'artefacts retenus pour la note finale',
                type: 'number',
                min: 1,
                max: 12,
                default: 7,
                required: true
            },
            {
                id: 'minAvantCalculFormatif',
                label: 'Minimum d\'artefacts avant calcul formatif',
                type: 'number',
                min: 0,
                max: 5,
                default: 3
            }
        ],
        suivant: () => 'echelle-performance',
        precedent: () => 'seuils-personnels'
    },

    // --- Branche objectifs ---

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCHE PAN-SPÉCIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────

    'config-specifications': {
        id: 'config-specifications',
        titre: 'Configuration de base',
        description: 'Paramètre le seuil d\'acceptabilité et les jetons',
        branche: 'specifications',
        ordre: 4,
        champs: [
            {
                id: 'seuilAcceptabilite',
                label: 'Seuil d\'acceptabilité (%)',
                type: 'number',
                min: 50,
                max: 100,
                default: 100,
                required: true,
                help: '100% = toutes les spécifications doivent être respectées'
            },
            {
                id: 'utiliserJetons',
                label: 'Utiliser un système de jetons ?',
                type: 'toggle',
                default: true
            }
        ],
        suivant: (reponses) => {
            if (reponses.utiliserJetons) return 'config-jetons';
            return 'choix-modele-bundles';
        },
        precedent: () => 'seuils-personnels'
    },

    'config-jetons': {
        id: 'config-jetons',
        titre: 'Configuration des jetons',
        description: 'Paramètre le système de jetons',
        branche: 'specifications',
        ordre: 5,
        condition: (reponses) => reponses.utiliserJetons === true,
        champs: [
            {
                id: 'nbJetonsDelai',
                label: 'Nombre de jetons délai par étudiant',
                type: 'number',
                min: 0,
                max: 10,
                default: 3
            },
            {
                id: 'dureeDelaiJours',
                label: 'Durée du délai accordé (jours)',
                type: 'number',
                min: 1,
                max: 14,
                default: 3
            },
            {
                // #853 (13 sept. 2026) : réglage de la pratique ; non = comportement antérieur.
                id: 'delaiSurReprise',
                label: 'Permettre un délai sur une reprise ?',
                type: 'toggle',
                default: false
            },
            {
                id: 'nbJetonsReprise',
                label: 'Nombre de jetons reprise par étudiant',
                type: 'number',
                min: 0,
                max: 10,
                default: 2
            }
        ],
        suivant: () => 'choix-modele-bundles',
        precedent: () => 'config-specifications'
    },

    'choix-modele-bundles': {
        id: 'choix-modele-bundles',
        titre: 'Forfaits de spécifications',
        description: 'Choisis un modèle prédéfini ou personnalise',
        branche: 'specifications',
        ordre: 6,
        champs: [], // Champs dynamiques (modèles de forfaits prédéfinis)
        getChampsDynamiques: () => {
            return [
                {
                    id: 'modeleBundle',
                    type: 'radio-cards',
                    required: true,
                    // #687 — LES QUATRE LIBELLÉS VIENNENT DU MODULE PUR, PAS D'ICI.
                    // Ils s'appelaient « Modèle Sciences » / « Modèle Littérature »
                    // et invitaient « les disciplines scientifiques » ou
                    // « littéraires » à se reconnaître, alors que ce qui les
                    // distingue est le nombre de forfaits et la place laissée à la
                    // reprise. Le résumé d'attributs affiche les MÊMES libellés
                    // pour les pratiques déjà créées : une seule source, donc les
                    // deux écrans ne peuvent plus diverger.
                    options: (window.ConstructionAttributs
                        ? window.ConstructionAttributs.MODELES_FORFAITS
                        : []).map(function(m) {
                            return { value: m.value, label: m.label, description: m.description };
                        })
                }
            ];
        },
        suivant: () => 'infos-base',
        precedent: (reponses) => {
            if (reponses.utiliserJetons) return 'config-jetons';
            return 'config-specifications';
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAPES FINALES (COMMUNES)
    // ─────────────────────────────────────────────────────────────────────────

    'echelle-performance': {
        id: 'echelle-performance',
        titre: 'Échelle de performance',
        description: 'Sélectionne l\'échelle à utiliser pour les évaluations',
        branche: 'finale',
        ordre: 7,
        condition: (reponses) => reponses.typePratique !== 'sommative',
        champs: [
            {
                id: 'echelleId',
                type: 'select-echelle',
                required: true,
                label: 'Échelle de performance',
                // #577 : choisir une échelle re-rend l'étape, pour que le bloc
                // des repères ci-dessous parle de CETTE échelle.
                rafraichir: true
            },
            {
                // #577 (28 août 2026, décision de Grégoire — A3, option A) : les
                // deux repères de maîtrise de l'échelle choisie se posent ICI,
                // au moment où l'utilisateur pense sa pratique, et restent
                // modifiables ensuite dans Conception → Échelles de performance.
                // Le bloc est CELUI de l'éditeur d'échelle (`blocReperesEchelle`),
                // pas une copie ; seul le handler diffère.
                //
                // ⚠ VOCABULAIRE : cette étape parle de « repères », jamais de
                // « seuils » — le mot est déjà pris par le dépistage
                // (`seuils-personnels`), et deux notions sous un même mot dans le
                // même parcours seraient indémêlables.
                //
                // ⏳ RÉSERVE DE GRÉGOIRE (arbitrage A1) : « suffisant / maîtrisé »
                // est le vocabulaire de PAN-Standards. Une autre famille de
                // pratique — ou un autre utilisateur — pourra nommer ces deux
                // repères autrement. Les libellés viennent d'une source unique
                // (`REPERES_ECHELLE`, echelles.js) ; les rendre configurables par
                // famille est un chantier à part, pas une retouche ici.
                id: 'reperesEchelle',
                type: 'reperes-echelle'
            }
        ],
        suivant: () => 'grille-criteres',
        precedent: (reponses) => {
            if (reponses.typePratique === 'standards') return 'config-portfolio';
            return 'choix-modele-bundles';
        }
    },

    'grille-criteres': {
        id: 'grille-criteres',
        titre: 'Grille de critères',
        description: 'Sélectionne la grille de critères pour l\'évaluation et le dépistage',
        branche: 'finale',
        ordre: 8,
        condition: (reponses) => reponses.typePratique !== 'sommative',
        champs: [
            {
                id: 'grilleId',
                type: 'select-grille',
                required: false,
                label: 'Grille de critères (optionnel)'
            },
            {
                id: 'infoGrille',
                type: 'info',
                texte: 'La grille peut également être configurée plus tard dans Conception → Grilles de critères.'
            }
        ],
        suivant: () => 'infos-base',
        precedent: () => 'echelle-performance'
    },

    'recapitulatif': {
        id: 'recapitulatif',
        titre: 'Récapitulatif',
        description: 'Vérifie tes choix avant de créer la pratique',
        branche: 'finale',
        ordre: 9,
        champs: [], // Généré dynamiquement
        suivant: () => null, // Fin du wizard
        // #319 Lot 2 (a6) : infos-base précède désormais le récap. Cas modèle (a7) :
        // l'adoption d'un gabarit saute à la fin → le retour ramène au choix du modèle.
        precedent: (reponses) => reponses._modeleAdopte ? 'choix-modele' : 'infos-base'
    }
};

// ============================================================================
// MODÈLES ADOPTABLES (#319 Lot 2 a7)
// ============================================================================

/**
 * Libellé court de la famille d'un modèle (badge de l'écran « Partir d'un modèle »).
 * Dérivé du type canonique via le SSOT TYPE_BADGES. Retourne '' si famille inconnue.
 * @param {Object} p - Modèle (gabarit prédéfini ou pratique de la bibliothèque)
 * @returns {string} - Code court ('SOM' / 'STD' / 'SPE') ou ''
 */
function libelleFamilleModele(p) {
    const type = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(p.type) : p.type);
    return (TYPE_BADGES[type] && TYPE_BADGES[type].code) || '';
}

/**
 * Construit la liste d'options radio-cards de l'étape 'choix-modele' :
 * gabarits prédéfinis + pratiques de la bibliothèque (helper canonique
 * obtenirToutesLesPratiquesBibliothequeSync, déjà dédoublonné par id).
 *
 * Sécurité : genererRadioCards n'échappe que la `value`. Les noms/descriptions
 * peuvent venir de données utilisateur (pratiques de la bibliothèque) → on les
 * échappe ICI avant injection. Le badge famille provient d'un mapping contrôlé.
 * @returns {Array<{value, label, description}>}
 */
function obtenirOptionsModeles() {
    let modeles = [];
    if (typeof obtenirToutesLesPratiquesBibliothequeSync === 'function') {
        try { modeles = obtenirToutesLesPratiquesBibliothequeSync(true) || []; }
        catch (e) { modeles = []; }
    }
    return modeles
        .filter(m => m && m.id)
        .map(m => {
            const titre = echapperHtml(m.nom || 'Sans nom');
            const badge = libelleFamilleModele(m);
            const meta = [badge, m.discipline ? echapperHtml(m.discipline) : '']
                .filter(Boolean).join(' · ');
            return {
                value: m.id,
                // Le titre est échappé ; le badge famille est ajouté en HTML contrôlé.
                label: meta ? `${titre} <span class="wizard-v2-modele-famille">${meta}</span>` : titre,
                description: echapperHtml(m.description || '')
            };
        });
}

/**
 * Prépare l'adoption d'un modèle au départ de l'étape 'choix-modele'.
 * Pose une COPIE PROFONDE figée du gabarit (_gabaritSource) que creerPratiqueV2
 * clonera tel quel — on court-circuite la reconstruction depuis les réponses, qui
 * est cassée pour les modèles (SPE : forfaits/typesTravaux perdus ; STD : echelleId
 * absente → création bloquée). Renseigne aussi les champs lus par le récapitulatif.
 * @param {Object} r - wizardState.reponses (muté)
 */
function preparerAdoptionModele(r) {
    let modeles = [];
    if (typeof obtenirToutesLesPratiquesBibliothequeSync === 'function') {
        try { modeles = obtenirToutesLesPratiquesBibliothequeSync(true) || []; }
        catch (e) { modeles = []; }
    }
    const gabarit = modeles.find(m => m && m.id === r.modeleChoisi);
    if (!gabarit) {
        // Id introuvable : retomber sur le parcours « décrire » plutôt que cloner du vide.
        reinitialiserAdoptionModele(r);
        return;
    }
    // Copie profonde : le clone final ne doit jamais aliaser le gabarit source.
    r._modeleAdopte = true;
    r._gabaritSource = JSON.parse(JSON.stringify(gabarit));
    // Champs d'affichage du récapitulatif (le diagnostic lit calcNoteFinale).
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(gabarit.type) : gabarit.type);
    const calcNoteFinaleMap = { 'sommative': 'moyenne', 'standards': 'niveaux', 'specifications': 'acceptable', 'denotation': 'jugement' };
    r.typePratique = typeCanon;
    r.calcNoteFinale = calcNoteFinaleMap[typeCanon] || 'moyenne';
    if (!r.nom) r.nom = gabarit.nom || '';
}

/**
 * Nettoie tout état d'adoption (retour arrière vers la porte « décrire », ou id de
 * modèle introuvable). Sans ça, recapitulatif.precedent ramènerait à tort vers
 * 'choix-modele' et creerPratiqueV2 clonerait un gabarit fantôme.
 * @param {Object} r - wizardState.reponses (muté)
 */
function reinitialiserAdoptionModele(r) {
    delete r._modeleAdopte;
    delete r._gabaritSource;
    delete r.modeleChoisi;
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Obtient l'étape suivante en fonction des réponses
 * @param {string} etapeActuelle - ID de l'étape actuelle
 * @param {Object} reponses - Réponses collectées
 * @returns {string|null} - ID de l'étape suivante ou null si fin
 */
function obtenirEtapeSuivante(etapeActuelle, reponses) {
    const etape = ETAPES_WIZARD[etapeActuelle];
    if (!etape || !etape.suivant) return null;

    const prochaine = etape.suivant(reponses);

    // Vérifier si l'étape suivante a une condition qui n'est pas remplie
    if (prochaine && ETAPES_WIZARD[prochaine]) {
        const etapeSuivante = ETAPES_WIZARD[prochaine];
        if (etapeSuivante.condition && !etapeSuivante.condition(reponses)) {
            // Sauter cette étape et passer à la suivante
            return obtenirEtapeSuivante(prochaine, reponses);
        }
    }

    return prochaine;
}

/**
 * Obtient l'étape précédente en fonction des réponses
 * @param {string} etapeActuelle - ID de l'étape actuelle
 * @param {Object} reponses - Réponses collectées
 * @returns {string|null} - ID de l'étape précédente ou null si début
 */
function obtenirEtapePrecedente(etapeActuelle, reponses) {
    const etape = ETAPES_WIZARD[etapeActuelle];
    if (!etape || !etape.precedent) return null;

    const precedente = etape.precedent(reponses);

    // Vérifier si l'étape précédente a une condition qui n'est pas remplie
    if (precedente && ETAPES_WIZARD[precedente]) {
        const etapePrecedente = ETAPES_WIZARD[precedente];
        if (etapePrecedente.condition && !etapePrecedente.condition(reponses)) {
            // Sauter cette étape et passer à la précédente
            return obtenirEtapePrecedente(precedente, reponses);
        }
    }

    return precedente;
}

/**
 * Passe à l'étape suivante
 */
function etapeSuivanteV2() {
    // Valider l'étape actuelle
    if (!validerEtape(wizardState.etapeActuelle)) {
        return;
    }

    // Sauvegarder les réponses
    sauvegarderReponsesEtape(wizardState.etapeActuelle);

    // Auto-déduire le type de pratique après les étapes de classification
    // ('voie-rapide' a2 : pose calcNoteFinale en direct → même déduction).
    const etapesClassification = ['calcul-note-finale', 'sous-questions-guidees', 'voie-rapide', 'regles-sommative', 'approche-evaluation'];
    if (etapesClassification.includes(wizardState.etapeActuelle)) {
        const classification = deduireTypePratique(wizardState.reponses);
        wizardState.reponses.typePratique = classification.type;
        wizardState.reponses.typeVariante = classification.variante;
    }

    // #319 Lot 2 (a7) — Adoption d'un modèle : au départ de 'choix-modele', préparer le
    // clonage (creerPratiqueV2 écrira le clone). La porte « décrire » nettoie tout état
    // d'adoption résiduel — l'utilisateur a pu revenir en arrière puis changer d'avis.
    if (wizardState.etapeActuelle === 'choix-modele') {
        preparerAdoptionModele(wizardState.reponses);
    } else if (wizardState.etapeActuelle === 'entree-pratique' && wizardState.reponses.porteEntree === 'decrire') {
        reinitialiserAdoptionModele(wizardState.reponses);
    }

    // Obtenir l'étape suivante
    const suivante = obtenirEtapeSuivante(wizardState.etapeActuelle, wizardState.reponses);

    if (suivante) {
        // Ajouter l'étape actuelle à l'historique
        wizardState.historique.push(wizardState.etapeActuelle);
        wizardState.etapeActuelle = suivante;
        afficherEtapeWizardV2(suivante);
    } else {
        // Fin du wizard - créer la pratique
    }
}

/**
 * Retourne à l'étape précédente
 */
function etapePrecedenteV2() {
    // Utiliser l'historique pour la navigation arrière
    if (wizardState.historique.length > 0) {
        const precedente = wizardState.historique.pop();
        wizardState.etapeActuelle = precedente;
        afficherEtapeWizardV2(precedente);
    }
}

/**
 * Voie rapide (#319 Lot 2 a2) — saut expert depuis le lien sous Q1 vers le choix
 * direct de famille. On N'EMPILE PAS Q1 (calcul-note-finale) : voie-rapide prend sa
 * position dans le parcours, donc le retour arrière ramène à l'écran d'entrée et le
 * compteur d'étapes (#134) reste cohérent. Le novice n'a aucun écran imposé.
 */
function wizardV2VoieRapide() {
    wizardState.etapeActuelle = 'voie-rapide';
    afficherEtapeWizardV2('voie-rapide');
}

/**
 * Re-rend l'étape courante après avoir sauvegardé ses champs (#319 Lot 3 a4).
 * Permet aux champs dynamiques dépendant d'une valeur saisie (garde-fou « >15
 * objectifs ») d'apparaître/disparaître en direct. Déclenché sur 'change' (après
 * blur) → aucun risque de perte de focus en cours de frappe.
 */
function wizardV2RafraichirEtapeCourante() {
    sauvegarderReponsesEtape(wizardState.etapeActuelle);
    afficherEtapeWizardV2(wizardState.etapeActuelle);
}

/**
 * Calcule le nombre total d'étapes pour le parcours actuel
 * @returns {number} - Nombre total d'étapes
 */
function calculerNbEtapes() {
    // #134 : dériver le total du graphe réel (obtenirEtapeSuivante) au lieu d'un compteur
    // manuel qui divergeait — il oubliait des étapes conditionnelles (config-sommative-regles,
    // config-sommative-regles…) → « étape 8 sur 7 » et dots désynchronisés. Le parcours
    // suit exactement les mêmes transitions et conditions que la navigation, donc le total
    // reste synchrone par construction selon les réponses actuelles.
    let count = 1; // point d'entrée du parcours (#319 Lot 2 : plus 'infos-base')
    let etape = wizardState.etapeInitiale || 'calcul-note-finale';
    let garde = 0;
    while (etape && garde++ < 50) {
        const suivante = obtenirEtapeSuivante(etape, wizardState.reponses);
        if (!suivante) break;
        count++;
        etape = suivante;
    }
    return count;
}

/**
 * Progression affichée (numéro courant + total), avec l'invariant total ≥ numéro.
 * #343-T4b : 'voie-rapide' est atteinte HORS-GRAPHE (wizardV2VoieRapide ne passe pas
 * par obtenirEtapeSuivante), donc la projection de calculerNbEtapes (depuis etapeInitiale)
 * peut être plus courte que le chemin réellement parcouru lorsque les réponses courantes
 * ne reproduisent pas la branche prise → on observait « 3 sur 2 » sur le parcours DEN.
 * Le total affiché ne doit jamais être inférieur au numéro de l'étape courante.
 * @returns {{numActuel: number, numTotal: number}}
 */
function calculerProgression() {
    const numActuel = calculerNumeroEtape();
    const numTotal = Math.max(calculerNbEtapes(), numActuel);
    return { numActuel, numTotal };
}

/**
 * Calcule le numéro de l'étape actuelle
 * @returns {number} - Numéro de l'étape (1-indexed)
 */
function calculerNumeroEtape() {
    return wizardState.historique.length + 1;
}

// ============================================================================
// AFFICHAGE
// ============================================================================

/**
 * Affiche une étape du wizard V2
 * @param {string} etapeId - ID de l'étape à afficher
 */
function afficherEtapeWizardV2(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) {
        console.error('[WizardV2] Étape inconnue:', etapeId);
        return;
    }


    // Mettre à jour le titre et la description
    const titreEl = document.getElementById('wizard-v2-titre');
    if (titreEl) titreEl.textContent = etape.titre;

    const descEl = document.getElementById('wizard-v2-description');
    if (descEl) descEl.textContent = etape.description || '';

    // Mettre à jour la progression
    mettreAJourProgression();

    // Générer le contenu
    const contenu = genererContenuEtape(etape);

    const conteneurContenu = document.getElementById('wizard-v2-contenu');

    if (conteneurContenu) {
        conteneurContenu.innerHTML = contenu;
    } else {
        console.error('[WizardV2] Conteneur #wizard-v2-contenu non trouvé !');
    }

    // Restaurer les valeurs précédentes si elles existent
    restaurerValeursEtape(etapeId);

    // Mettre à jour les boutons
    mettreAJourBoutons();
}

/**
 * Génère le contenu HTML pour une étape
 * @param {Object} etape - Configuration de l'étape
 * @returns {string} - HTML du contenu
 */
function genererContenuEtape(etape) {

    if (etape.id === 'recapitulatif') {
        return genererRecapitulatif();
    }

    // Obtenir les champs (statiques ou dynamiques)
    let champs = etape.champs || [];

    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    let html = '<div class="wizard-v2-champs">';

    champs.forEach((champ, index) => {
        const champHtml = genererChamp(champ);
        html += champHtml;
    });

    html += '</div>';
    return html;
}

/**
 * Génère le HTML pour un champ
 * @param {Object} champ - Configuration du champ
 * @returns {string} - HTML du champ
 */
function genererChamp(champ) {
    switch (champ.type) {
        case 'text':
            return genererChampTexte(champ);
        case 'textarea':
            return genererChampTextarea(champ);
        case 'liste-cibles':
            return genererChampListeCibles(champ);
        case 'number':
            return genererChampNumber(champ);
        case 'toggle':
            return genererChampToggle(champ);
        case 'select':
            return genererChampSelect(champ);
        case 'radio-cards':
            return genererRadioCards(champ);
        case 'checkbox-cards':
            return genererCheckboxCards(champ);
        case 'select-echelle':
            return genererSelectEchelle(champ);
        case 'reperes-echelle':
            return genererReperesEchelle(champ);
        case 'select-grille':
            return genererSelectGrille(champ);
        case 'select-disciplines':
            return genererChampSelectDisciplines(champ);
        case 'row':
            return genererChampRow(champ);
        case 'info':
            return genererInfo(champ);
        case 'lien-action':
            return genererLienAction(champ);
        default:
            console.warn('[WizardV2] Type de champ inconnu:', champ.type);
            return '';
    }
}

/**
 * Génère une carte-action (voie rapide a2), de même poids visuel que les cartes
 * d'options (demande Grégoire 7 juin). Carte CSP-safe (data-action, pas de handler
 * inline) ; clic + clavier gérés par le dispatcher de main.js (role="button"/tabindex).
 * Le bouton radio est DÉCORATIF : hors du groupe 'calcNoteFinale', `aria-hidden` et
 * neutralisé (`pointer-events:none`) — il aligne la carte sur les autres options sans
 * la rendre sélectionnable (l'action reste la navigation).
 */
function genererLienAction(champ) {
    const desc = champ.description
        ? `<div class="wizard-v2-card-description">${echapperHtml(champ.description)}</div>`
        : '';
    return `
        <div class="wizard-v2-champ">
            <div class="wizard-v2-radio-card wizard-v2-radio-card--action" role="button" tabindex="0" data-action="${champ.action}">
                <input type="radio" tabindex="-1" aria-hidden="true">
                <div class="wizard-v2-card-content">
                    <div class="wizard-v2-card-title">${echapperHtml(champ.texte)}</div>
                    ${desc}
                </div>
            </div>
        </div>
    `;
}

// Préfixe unique pour éviter conflits avec ancien wizard
const WIZARD_V2_ID_PREFIX = 'wizardv2-';

/**
 * Génère un champ texte
 */
function genererChampTexte(champ) {
    const required = champ.required ? 'required' : '';
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}${champ.required ? ' *' : ''}</label>
            <input type="text"
                   id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                   name="${champ.id}"
                   placeholder="${champ.placeholder || ''}"
                   ${required}>
        </div>
    `;
}

/**
 * 🆕 Beta 95.4 : Génère une rangée de champs côte à côte (2 colonnes)
 */
function genererChampRow(champ) {
    const champsHTML = champ.champs.map(sousChamp => {
        const required = sousChamp.required ? 'required' : '';
        return `
            <div class="wizard-v2-champ" style="flex: 1;">
                <label for="${WIZARD_V2_ID_PREFIX}${sousChamp.id}">${sousChamp.label}${sousChamp.required ? ' *' : ''}</label>
                <input type="text"
                       id="${WIZARD_V2_ID_PREFIX}${sousChamp.id}"
                       name="${sousChamp.id}"
                       placeholder="${sousChamp.placeholder || ''}"
                       ${required}>
            </div>
        `;
    }).join('');

    return `
        <div class="wizard-v2-row" style="display: flex; gap: 15px;">
            ${champsHTML}
        </div>
    `;
}

/**
 * Génère un champ textarea
 */
function genererChampTextarea(champ) {
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <textarea id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                      name="${champ.id}"
                      placeholder="${champ.placeholder || ''}"
                      rows="3"></textarea>
        </div>
    `;
}

/**
 * #717 — Liste des cibles de la dénotation : le composant commun `EditeurCibles`
 * (une ligne par cible, chacune porte son id). Les valeurs sont posées par
 * `restaurerValeursEtape`.
 */
function genererChampListeCibles(champ) {
    return `
        <div class="wizard-v2-champ">
            <label id="${WIZARD_V2_ID_PREFIX}${champ.id}-label">${champ.label}${champ.required ? ' *' : ''}</label>
            <div id="${WIZARD_V2_ID_PREFIX}${champ.id}" role="group" aria-labelledby="${WIZARD_V2_ID_PREFIX}${champ.id}-label">${window.EditeurCibles.rendre([])}</div>
        </div>
    `;
}

/**
 * Génère un champ number
 */
function genererChampNumber(champ) {
    const step = champ.step || 1;
    // onChange optionnel : re-render live de l'étape (ex. garde-fou a4 sur nbObjectifs).
    const onChange = champ.onChange ? `data-on-change="${champ.onChange}"` : '';
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}${champ.required ? ' *' : ''}</label>
            <input type="number"
                   id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                   name="${champ.id}"
                   min="${champ.min || 0}"
                   max="${champ.max || 100}"
                   step="${step}"
                   value="${champ.default || ''}"
                   ${onChange}>
            ${champ.help ? `<small class="wizard-v2-help">${champ.help}</small>` : ''}
        </div>
    `;
}

/**
 * Génère un champ toggle
 */
function genererChampToggle(champ) {
    const checked = champ.default ? 'checked' : '';
    return `
        <div class="wizard-v2-champ wizard-v2-toggle">
            <label class="toggle-label">
                <input type="checkbox"
                       id="${WIZARD_V2_ID_PREFIX}${champ.id}"
                       name="${champ.id}"
                       ${checked}>
                <span class="toggle-slider"></span>
                <span class="toggle-text">${champ.label}</span>
            </label>
        </div>
    `;
}

/**
 * Génère un champ select
 */
function genererChampSelect(champ) {
    let options = champ.options.map(opt => {
        const selected = opt.value === champ.default ? 'selected' : '';
        return `<option value="${echapperHtml(opt.value)}" ${selected}>${opt.label}</option>`;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}">
                ${options}
            </select>
        </div>
    `;
}

/**
 * Génère un champ select pour les disciplines (dropdown complet)
 * 🆕 Beta 95.4 : Utilise le même dropdown que le profil enseignant
 */
function genererChampSelectDisciplines(champ) {
    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}${champ.required ? ' *' : ''}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}" class="controle-form" ${champ.required ? 'required' : ''}>
                <option value="">— Sélectionner —</option>
                <optgroup label="Sciences de la santé et techniques (100)">
                    <option value="101 Biologie">101 Biologie</option>
                    <option value="109 Éducation physique">109 Éducation physique</option>
                    <option value="180 Soins infirmiers">180 Soins infirmiers</option>
                </optgroup>
                <optgroup label="Sciences et techniques (200)">
                    <option value="201 Mathématique">201 Mathématique</option>
                    <option value="202 Chimie">202 Chimie</option>
                    <option value="203 Physique">203 Physique</option>
                </optgroup>
                <optgroup label="Sciences humaines (300)">
                    <option value="300 Sciences humaines">300 Sciences humaines</option>
                    <option value="305 Économique">305 Économique</option>
                    <option value="320 Géographie">320 Géographie</option>
                    <option value="330 Histoire">330 Histoire</option>
                    <option value="332 Civilisations anciennes">332 Civilisations anciennes</option>
                    <option value="340 Philosophie">340 Philosophie</option>
                    <option value="345 Humanities">345 Humanities</option>
                    <option value="350 Psychologie">350 Psychologie</option>
                    <option value="360 Science politique">360 Science politique</option>
                    <option value="370 Intervention sociale">370 Intervention sociale</option>
                    <option value="381 Anthropologie">381 Anthropologie</option>
                    <option value="383 Études religieuses">383 Études religieuses</option>
                    <option value="385 Sociologie">385 Sociologie</option>
                    <option value="387 Sexologie">387 Sexologie</option>
                </optgroup>
                <optgroup label="Administration (400)">
                    <option value="401 Gestion et administration">401 Gestion et administration</option>
                    <option value="410 Techniques de comptabilité et de gestion">410 Techniques de comptabilité et de gestion</option>
                    <option value="412 Techniques de bureautique">412 Techniques de bureautique</option>
                    <option value="420 Informatique">420 Informatique</option>
                </optgroup>
                <optgroup label="Arts (500)">
                    <option value="502 Danse">502 Danse</option>
                    <option value="504 Art et esthétique">504 Art et esthétique</option>
                    <option value="506 Cinéma">506 Cinéma</option>
                    <option value="510 Arts plastiques">510 Arts plastiques</option>
                    <option value="520 Histoire de l'art">520 Histoire de l'art</option>
                    <option value="530 Musique">530 Musique</option>
                    <option value="550 Esthétique industrielle">550 Esthétique industrielle</option>
                    <option value="551 Arts et technologies">551 Arts et technologies</option>
                    <option value="560 Théâtre">560 Théâtre</option>
                    <option value="570 Design">570 Design</option>
                    <option value="581 Création littéraire">581 Création littéraire</option>
                    <option value="582 Techniques professionnelles de musique et de chanson">582 Techniques professionnelles de musique et de chanson</option>
                    <option value="589 Communication">589 Communication</option>
                </optgroup>
                <optgroup label="Langues et littérature (600)">
                    <option value="601 Français (langue et littérature)">601 Français (langue et littérature)</option>
                    <option value="602 Anglais (langue seconde)">602 Anglais (langue seconde)</option>
                    <option value="603 Anglais (langue et littérature)">603 Anglais (langue et littérature)</option>
                    <option value="604 Français (langue seconde)">604 Français (langue seconde)</option>
                    <option value="607 Espagnol">607 Espagnol</option>
                    <option value="608 Italien">608 Italien</option>
                    <option value="609 Allemand">609 Allemand</option>
                    <option value="610 Langues autochtones">610 Langues autochtones</option>
                    <option value="613 Mandarin">613 Mandarin</option>
                    <option value="615 Russe">615 Russe</option>
                    <option value="618 Hébreu">618 Hébreu</option>
                    <option value="619 Multilingue">619 Multilingue</option>
                </optgroup>
            </select>
        </div>
    `;
}

/**
 * Génère des cartes radio
 */
function genererRadioCards(champ) {
    let cards = champ.options.map(opt => {
        const disabled = opt.disabled ? 'disabled' : '';
        const disabledClass = opt.disabled ? 'wizard-v2-card-disabled' : '';
        // #443 : `champ.default` pré-coche une carte. Le collecteur lit
        // `input:checked` dans le DOM, donc une carte cochée d'avance suffit à
        // satisfaire `required` — pas besoin de semer la réponse à côté.
        // Utilisé par « Approche d'évaluation », devenue une étape à carte
        // unique : sans ça, l'utilisateur devrait cliquer une option qui n'a
        // pas d'alternative.
        const checked = (champ.default !== undefined && opt.value === champ.default) ? 'checked' : '';
        return `
            <label class="wizard-v2-radio-card ${disabledClass}">
                <input type="radio"
                       name="${champ.id}"
                       value="${echapperHtml(opt.value)}"
                       ${checked}
                       ${disabled}>
                <div class="wizard-v2-card-content">
                    <div class="wizard-v2-card-title">${opt.label}</div>
                    <div class="wizard-v2-card-description">${opt.description}</div>
                </div>
            </label>
        `;
    }).join('');

    // Énoncé optionnel (champ.question) : un radio-cards comportemental porte sa
    // propre question (l'étape peut en empiler plusieurs). Absent → markup inchangé.
    const idQ = WIZARD_V2_ID_PREFIX + champ.id + '-q';
    const enonce = champ.question
        ? `<p class="wizard-v2-question" id="${idQ}">${echapperHtml(champ.question)}</p>`
        : '';
    const a11y = champ.question ? ` role="radiogroup" aria-labelledby="${idQ}"` : '';

    return `
        <div class="wizard-v2-champ">
            ${enonce}
            <div class="wizard-v2-radio-cards"${a11y}>
                ${cards}
            </div>
        </div>
    `;
}

/**
 * Génère des cartes checkbox (multi-sélection)
 */
function genererCheckboxCards(champ) {
    let cards = champ.options.map(opt => {
        const exclusiveAttr = opt.exclusive ? 'data-exclusive="true"' : '';
        return `
            <label class="wizard-v2-radio-card wizard-v2-checkbox-card">
                <input type="checkbox"
                       name="${champ.id}"
                       value="${echapperHtml(opt.value)}"
                       ${exclusiveAttr}
                       data-action="wizardV2GererExclusionCheckbox">
                <div class="wizard-v2-card-content">
                    <div class="wizard-v2-card-title">${opt.label}</div>
                    <div class="wizard-v2-card-description">${opt.description}</div>
                </div>
            </label>
        `;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <div class="wizard-v2-radio-cards wizard-v2-checkbox-cards">
                ${cards}
            </div>
        </div>
    `;
}

/**
 * Génère un sélecteur d'échelle
 */
function genererSelectEchelle(champ) {
    // #910 — La liste offre les échelles de la bibliothèque, par le prédicat de la
    // question d'adoption (`obtenirEchellesOffertesAdoption`, pratiques-bibliotheque.js,
    // chargé avant ce fichier) : pas de filtre de plus écrit à la main.
    // ⚠ L'échelle DÉJÀ CHOISIE reste offerte même retirée de la bibliothèque. Sans
    // elle, `restaurerValeursEtape` ne trouve plus son <option>, le select retombe
    // sur « -- » et la pratique rouverte perd son échelle en silence à l'enregistrement.
    const idsOfferts = new Set(window.obtenirEchellesOffertesAdoption().map(e => e.id));
    const idChoisi = wizardState.reponses[champ.id];
    const echelles = (db.getSync(cle('echellesTemplates'), []) || [])
        .filter(e => e && (idsOfferts.has(e.id) || (idChoisi && e.id === idChoisi)));

    // Le vide se juge APRÈS le filtre : une bibliothèque où tout est retiré dit
    // le message, pas une liste vide.
    if (echelles.length === 0) {
        return `
            <div class="wizard-v2-champ">
                <label>${champ.label}</label>
                <div class="wizard-v2-alerte">
                    Aucune échelle de performance n'a été créée.
                    Tu pourras en créer une dans Conception → Échelles de performance.
                </div>
            </div>
        `;
    }

    let options = echelles.map(e => {
        const niveaux = e.niveaux ? e.niveaux.length : 0;
        return `<option value="${echapperHtml(e.id)}">${echapperHtml(e.nom || 'Sans nom')} (${niveaux} niveaux)</option>`;
    }).join('');

    // #577 : `rafraichir` re-rend l'étape au choix d'une échelle (même
    // mécanique que le garde-fou a4 : 'change', donc après blur).
    const onChange = champ.rafraichir ? ' data-on-change="wizardV2RafraichirEtapeCourante"' : '';

    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}"${onChange}>
                <option value="">-- Sélectionner une échelle --</option>
                ${options}
            </select>
        </div>
    `;
}

/**
 * #577 — Le bloc « Repères de maîtrise » de l'échelle CHOISIE, dans l'assistant.
 *
 * Trois états, et chacun se dit :
 *   · aucune échelle choisie → rien (le bloc désigne des niveaux d'une échelle) ;
 *   · l'ordre des plages de l'échelle n'est pas lisible → on renvoie à l'éditeur,
 *     où chaque niveau reçoit un code et une borne « Min » ;
 *   · sinon le bloc lui-même, précédé d'un avertissement si un repère manque —
 *     l'utilisateur peut avancer sans, mais il sait ce que ça coûte.
 *
 * L'écriture passe par `ecrireRepereEchelle` (echelles.js), la même transaction
 * que l'éditeur : mêmes refus, même règle du vide. L'aperçu est le même
 * producteur (`apercuNiveauxEchelleHtml`) : la zone de chaque niveau se lit
 * dès que les deux repères sont posés.
 */
function genererReperesEchelle(champ) {
    const echelleId = wizardState.reponses.echelleId;
    if (!echelleId) return '';

    const echelles = db.getSync(cle('echellesTemplates'), []) || [];
    const echelle = echelles.find(e => e && e.id === echelleId);
    if (!echelle) return '';

    const renvoi = 'Conception → Échelles de performance';
    if (typeof window.blocReperesEchelle !== 'function') {
        return genererInfo({ texte: `Les repères de maîtrise de cette échelle se posent dans ${renvoi}.` });
    }

    const bloc = window.blocReperesEchelle(echelle, { handler: 'wizardV2ModifierRepereEchelle' });
    if (!bloc) {
        return genererInfo({
            variante: 'attention',
            texte: `L'ordre des niveaux de cette échelle n'est pas lisible : ses repères de maîtrise se posent dans ${renvoi}, une fois chaque niveau doté d'un code et d'une borne « Min ».`
        });
    }

    const manque = !echelle.seuilSuffisance || !echelle.seuilMaitrise;
    const avertissement = manque
        ? genererInfo({
            variante: 'attention',
            texte: 'Sans ces deux repères, la rétroaction remise à l\'élève ne peut ni nommer ses priorités ni dire ce qui est acquis. Tu peux les poser ici, ou plus tard dans ' + renvoi + '.'
        })
        : '';
    const apercu = (typeof window.apercuNiveauxEchelleHtml === 'function')
        ? `<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px;">${window.apercuNiveauxEchelleHtml(echelle)}</div>`
        : '';

    return `
        ${avertissement}
        <div class="wizard-v2-champ" id="${WIZARD_V2_ID_PREFIX}${champ.id}-bloc">
            ${bloc}
            ${apercu}
        </div>
    `;
}

/**
 * #577 — Un repère posé depuis l'assistant : écrit sur l'échelle, puis l'étape
 * est re-rendue pour que la liste et l'aperçu disent l'état enregistré. Un
 * refus se voit sur le champ, sans rien écrire — comme dans l'éditeur.
 */
function wizardV2ModifierRepereEchelle(el) {
    if (typeof window.ecrireRepereEchelle !== 'function') return;
    return Promise.resolve(window.ecrireRepereEchelle(el.dataset.echelleId, el.dataset.champ, el.value))
        .then((resultat) => {
            if (resultat && resultat.ok) {
                wizardV2RafraichirEtapeCourante();
                return resultat;
            }
            if (typeof window.marquerChampRefuseEchelle === 'function') {
                window.marquerChampRefuseEchelle(el, resultat && resultat.refuse);
            }
            return resultat;
        });
}

/**
 * Génère un sélecteur de grille
 */
function genererSelectGrille(champ) {
    // Récupérer les grilles existantes (et la grille de base en attente, lot E1)
    const grilles = grillesDuWizard();

    if (grilles.length === 0) {
        return `
            <div class="wizard-v2-champ">
                <label>${champ.label}</label>
                <div class="wizard-v2-info-block" style="flex-direction: column; align-items: stretch;">
                    <p style="margin: 0 0 10px 0;">Aucune grille de critères n'a été créée. Tu peux en générer une de base pour commencer.</p>
                    <button type="button" class="wizard-v2-btn-demo-grille" data-action="wizardV2CreerGrilleDemo">Créer une grille de base (4\u00a0critères)</button>
                    <p class="wizard-v2-demo-grille-aide">Tu pourras la modifier plus tard dans Conception → Grilles de critères.</p>
                </div>
            </div>
        `;
    }

    let options = grilles.map(g => {
        const criteres = g.criteres ? g.criteres.length : 0;
        return `<option value="${echapperHtml(g.id)}">${echapperHtml(g.nom || 'Sans nom')} (${criteres} critères)</option>`;
    }).join('');

    return `
        <div class="wizard-v2-champ">
            <label for="${WIZARD_V2_ID_PREFIX}${champ.id}">${champ.label}</label>
            <select id="${WIZARD_V2_ID_PREFIX}${champ.id}" name="${champ.id}">
                <option value="">-- Aucune grille (configurer plus tard) --</option>
                ${options}
            </select>
        </div>
    `;
}

/**
 * Crée une grille de critères démo (4 critères de base) et rafraîchit l'affichage
 */
function wizardV2CreerGrilleDemo() {
    const grilleDemo = {
        id: genererIdUnique('GRILLE_'),
        nom: 'Grille de base',
        description: 'Grille générique créée par l\'assistant. Modifiable dans Conception → Grilles de critères.',
        criteres: [
            { id: 'c1', nom: 'Compréhension du sujet', description: 'Démontrer une compréhension juste du sujet traité.', poids: 25 },
            { id: 'c2', nom: 'Qualité de la démarche', description: 'Appliquer une démarche méthodique et rigoureuse.', poids: 25 },
            { id: 'c3', nom: 'Communication', description: 'Présenter les résultats de façon claire et structurée.', poids: 25 },
            { id: 'c4', nom: 'Esprit critique', description: 'Porter un regard critique et nuancé sur la production.', poids: 25 }
        ],
        dateCreation: new Date().toISOString()
    };

    // Lot E1 (D3) : RIEN n'est écrit ici. Avant, la grille entrait en base à ce clic
    // et y restait même si l'assistant était abandonné. Elle attend « Créer la pratique ».
    wizardState.grilleDeBase = grilleDemo;

    // Stocker l'ID pour pré-sélection
    wizardState.reponses.grilleId = grilleDemo.id;

    // Rafraîchir l'affichage de l'étape (#131 : la fonction s'appelle afficherEtapeWizardV2,
    // afficherEtapeV2 n'existe pas → ReferenceError, l'écran ne se rafraîchissait pas)
    afficherEtapeWizardV2(wizardState.etapeActuelle);
}

/**
 * Génère un bloc d'information
 */
function genererInfo(champ) {
    // variante 'attention' (a4) : bloc ambre distinct des infos neutres (bleues).
    const modif = champ.variante === 'attention' ? ' wizard-v2-info-block--attention' : '';
    return `
        <div class="wizard-v2-champ">
            <div class="wizard-v2-info-block${modif}">
                <span class="wizard-v2-info-icon icone-inline icone-inline--info" aria-hidden="true"></span>
                <span>${champ.texte}</span>
            </div>
        </div>
    `;
}

// ─── #319 Lot 4 (a8) — exemple de conséquence « ordre de grandeur » ───
// Décision Grégoire 7 juin 2026 : le chiffre reflète le TYPE de notation, PAS les
// réglages fins (artefacts retenus, seuils…). On simule la FAMILLE générique (id de
// pratique enregistré par défaut, résoluble par obtenirPratiqueParId SANS toucher
// aux données) sur deux profils démo contrastés. Lecture seule absolue : simulerIndices
// (#307) ne fait que lire (aucun write indicesCP). Hors démo : repli qualitatif, jamais
// de chiffre fabriqué. La pratique simulée ≠ la pratique active de l'utilisateur.
const ID_SIMULATION_PAR_FAMILLE = {
    'sommative': 'sommative',
    'standards': 'standards',
    'specifications': 'specifications'
};

const REPLI_EXEMPLE_PAR_FAMILLE = {
    'sommative': 'La note finale serait une moyenne pondérée : chaque évaluation compte une fois, selon son poids.',
    'standards': 'La note refléterait le niveau de maîtrise démontré ; une reprise réussie remplace un premier essai.',
    'specifications': 'La note dépendrait du nombre de spécifications réussies — un forfait atteint, un palier de note.'
};

/**
 * Calcule l'exemple « ordre de grandeur » (a8). Disponible en mode démo seulement
 * (les profils-types DEMO0xx vivent dans le namespace démo). Lecture seule.
 * @param {string} famille - classification.type (sommative|standards|specifications|denotation)
 * @returns {{disponible:boolean, idSimulation?:string, fortP?:number, difficulteP?:number}}
 */
function calculerExempleConsequence(famille) {
    const idSim = ID_SIMULATION_PAR_FAMILLE[famille];
    if (!idSim) return { disponible: false };
    if (typeof estEnModeDemo !== 'function' || !estEnModeDemo()) return { disponible: false };
    if (typeof simulerIndices !== 'function') return { disponible: false };
    const fort = simulerIndices('DEMO010', idSim);      // profil Fort (§8 note conception)
    const diff = simulerIndices('DEMO004', idSim);      // profil En difficulté
    if (!fort || !diff) return { disponible: false };
    return { disponible: true, idSimulation: idSim, fortP: fort.P, difficulteP: diff.P };
}

/**
 * Section « Ce que ça donnerait » (a8) : exemple chiffré en démo, repli qualitatif
 * hors démo. Chaîne vide si la famille n'est pas simulable (DEN/indéterminé).
 */
function genererSectionExemple(famille) {
    const ex = calculerExempleConsequence(famille);
    let html = '<div class="wizard-v2-recap-section">';
    html += '<h4>Ce que ça donnerait</h4>';
    if (ex.disponible) {
        html += '<p class="wizard-v2-recap-aide">Avec une pratique de ce type, sur les profils-types de la démonstration :</p>';
        html += `<p>Un profil <strong>fort</strong> : <strong>~${ex.fortP} %</strong></p>`;
        html += `<p>Un profil <strong>en difficulté</strong> : <strong>~${ex.difficulteP} %</strong></p>`;
        html += '<p class="wizard-v2-recap-aide">Ordre de grandeur lié au <em>type</em> de notation, pas à tes réglages fins.</p>';
    } else {
        const repli = REPLI_EXEMPLE_PAR_FAMILLE[famille];
        if (!repli) return '';   // famille non simulable (DEN/indéterminé) : pas de section
        html += `<p class="wizard-v2-recap-aide">${repli}</p>`;
    }
    html += '</div>';
    return html;
}

/**
 * #899 — la pratique EN RÉÉDITION porte-t-elle déjà des types de productions ET des forfaits ?
 * (le formulaire de gestion écrit `forfaits`, les gabarits `tableBundles` : les deux se lisent.)
 * En création, il n'y a rien à relire : faux.
 */
function _specificationPorteTypesEtForfaits() {
    if (!wizardState.modeEdition || !wizardState.pratiqueId) return false;
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const existante = pratiques.find(p => p.id === wizardState.pratiqueId);
    const configuration = existante && existante.configuration;
    if (!configuration) return false;
    const types = configuration.typesTravaux || [];
    const forfaits = configuration.forfaits || configuration.tableBundles || [];
    return types.length > 0 && forfaits.length > 0;
}

/**
 * Génère le récapitulatif
 */
function genererRecapitulatif() {
    const r = wizardState.reponses;
    const classification = deduireTypePratique(r);
    let html = '<div class="wizard-v2-recapitulatif">';

    // ─── Section 1 : Diagnostic du type de notation (proéminent) ───
    // Familles : SSOT module TYPE_BADGES (partagé avec l'écran « Partir d'un modèle »).
    const badge = TYPE_BADGES[classification.type] || { code: '?', classe: 'indetermine', label: 'Indéterminé', description: '' };

    html += `
        <div class="wizard-v2-recap-diagnostic wizard-v2-recap-diagnostic--${badge.classe}">
            <div class="wizard-v2-recap-diagnostic-intro">Ta pratique de notation a été identifiée comme</div>
            <div class="wizard-v2-recap-diagnostic-titre">
                <span class="wizard-v2-recap-badge">${badge.code}</span>
                <span class="wizard-v2-recap-badge-label">${badge.label}</span>
            </div>
            <p class="wizard-v2-recap-diagnostic-desc">${badge.description}</p>
    `;
    // #343-T4a — en DEN, la « variante » est un mode technique (eliminee/reduite/differee),
    // pas une variante de calcul lisible par l'enseignant ; le récap affiche déjà une
    // description DEN complète juste au-dessus → on n'ajoute pas une ligne redondante et
    // cryptique (« Variante : eliminee »). Les autres familles gardent la ligne.
    if (classification.variante && classification.type !== 'denotation') {
        const varianteLabels = {
            'classique': 'Classique',
            'verrou': 'Avec verrou d\'évaluation',
            'portfolio': 'Avec portfolio',
            // #901 (C-1) : sans parenthèse — la méthode ne se dit qu'à « Construction de la note ».
            'n-meilleurs': 'Par artefacts',
            'objectifs-ponderes': 'Par objectifs pondérés',
            'moyenne-ponderee': 'Moyenne pondérée des objectifs',
            'comptage': 'Comptage d\'objectifs',
            'seuils-critiques': 'Seuils critiques',
            'holistique': 'Holistique',
            'bundles': 'Forfaits de spécifications'
        };
        html += `<p class="wizard-v2-recap-diagnostic-meta">Variante\u00a0: <strong>${varianteLabels[classification.variante] || classification.variante}</strong></p>`;
    }
    if (classification.regles && classification.regles.length > 0 && !classification.regles.includes('aucune')) {
        // #809 (9 sept. 2026) — SOURCE UNIQUE. Ces quatre libellés vivaient ici
        // ET dans `construction-attributs.js` : deux tables identiques, deux
        // occasions de diverger. Ils vivent désormais là-bas seulement, comme
        // MODELES_FORFAITS et pour la même raison (module PUR, chargé avant
        // celui-ci). Le repli rend la clé brute — jamais un trou.
        const libelleRegle = (rl) => (window.ConstructionAttributs
            && window.ConstructionAttributs.libelleRegleSommative)
                ? window.ConstructionAttributs.libelleRegleSommative(rl)
                : rl;
        const reglesTexte = classification.regles.map(libelleRegle).join(', ');
        html += `<p class="wizard-v2-recap-diagnostic-meta">Règles\u00a0: ${reglesTexte}</p>`;
    }
    html += '</div>';

    // ─── Section 2 : Nom de la pratique (modifiable) ───
    const nomActuel = r.nom || 'Ma pratique de notation';
    html += `
        <div class="wizard-v2-recap-section">
            <h4>Nom de la pratique</h4>
            <p class="wizard-v2-recap-aide">Maintenant que tu connais ton type de notation, tu peux ajuster le nom si tu le souhaites.</p>
            <input type="text" id="wizard-v2-recap-nom" class="wizard-v2-recap-nom-input" value="${echapperHtml(nomActuel)}" placeholder="Ex\u00a0: ${badge.label} \u2013 Littérature H2026">
        </div>
    `;

    // ─── Section 3 : Informations de base ───
    html += '<div class="wizard-v2-recap-section">';
    html += '<h4>Informations de base</h4>';
    if (r.auteur) html += `<p><strong>Auteur\u00a0:</strong> ${echapperHtml(r.auteur)}</p>`;
    if (r.etablissement) html += `<p><strong>Établissement\u00a0:</strong> ${echapperHtml(r.etablissement)}</p>`;
    if (r.discipline) html += `<p><strong>Discipline\u00a0:</strong> ${echapperHtml(r.discipline)}</p>`;
    html += '</div>';

    // Section : Paramètres généraux
    if (r.nbEvaluationsPrevues || r.seuilVaBien) {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Paramètres généraux</h4>';
        if (r.nbEvaluationsPrevues) {
            html += `<p><strong>Évaluations prévues\u00a0:</strong> ${r.nbEvaluationsPrevues}</p>`;
        }
        if (r.seuilVaBien) {
            html += `<p><strong>Seuils\u00a0:</strong> Bien \u2265${r.seuilVaBien}% | Difficulté \u2264${r.seuilDifficulte}% | Grande difficulté &lt;${r.seuilGrandeDifficulte}%</p>`;
        }
        html += '</div>';
    }

    // Section spécifique selon le type (#900, lot N6 : la section « Configuration » d'une
    // sommative — rang et moyenne du groupe — part avec son étape.)
    if (r.typePratique === 'standards') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Configuration PAN-Standards</h4>';
        // #443 : le libellé « Par objectifs » part avec la carte. Le repli
        // `|| r.approcheEvaluation` reste : une pratique stockée qui porte encore
        // l'ancienne valeur s'affiche telle quelle plutôt que « undefined ».
        const approcheLabels = {
            'par-artefacts': 'Par artefacts (portfolio)'
        };
        html += `<p><strong>Approche\u00a0:</strong> ${approcheLabels[r.approcheEvaluation] || r.approcheEvaluation}</p>`;

        if (r.approcheEvaluation === 'par-artefacts') {
            // #133 : le wizard prime — on affiche les réponses saisies, défauts
            // alignés sur l'écriture (plus de lecture prioritaire de Primo).
            const nbSoumis = r.nbArtefactsSoumis || 12;
            const nbRetenus = r.nbArtefactsRetenus || 7;
            html += `<p><strong>Artefacts à soumettre\u00a0:</strong> ${nbSoumis}</p>`;
            html += `<p><strong>Artefacts retenus\u00a0:</strong> ${nbRetenus}</p>`;
            const modeSelectionLabels = {
                'n_meilleurs': 'N meilleurs artefacts',
                'tous': 'Tous les artefacts',
                'derniers': 'N derniers artefacts',
                'hybride': 'Hybride (N meilleures + Obligatoires)'
            };
            const modeSelection = r.modeSelectionPortfolio || 'n_meilleurs';
            html += `<p><strong>Construction de la note\u00a0:</strong> ${modeSelectionLabels[modeSelection] || modeSelection}</p>`;
        }
        html += '</div>';
    }

    if (r.typePratique === 'specifications') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Configuration PAN-Spécifications</h4>';
        html += `<p><strong>Seuil d'acceptabilité\u00a0:</strong> ${r.seuilAcceptabilite}%</p>`;
        html += `<p><strong>Système de jetons\u00a0:</strong> ${r.utiliserJetons ? 'Activé' : 'Désactivé'}</p>`;
        if (r.utiliserJetons) {
            html += `<p><strong>Jetons délai\u00a0:</strong> ${r.nbJetonsDelai} (${r.dureeDelaiJours} jours)</p>`;
            html += `<p><strong>Jetons reprise\u00a0:</strong> ${r.nbJetonsReprise}</p>`;
        }
        html += '</div>';
    }

    if (r.typePratique === 'denotation') {
        const cibles = Array.isArray(r.ciblesDenotation) ? r.ciblesDenotation : [];
        const methodeLabels = { 'mode': 'Mode', 'mediane': 'Médiane', 'moyenne': 'Moyenne' };
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Configuration PAN-Dénotation</h4>';
        html += `<p><strong>Mode :</strong> Éliminée (jugement narratif → note)</p>`;
        html += `<p><strong>Cibles d'apprentissage :</strong> ${cibles.length}</p>`;
        html += `<p><strong>Suggestion statistique :</strong> ${methodeLabels[r.methodeSuggestionDen] || r.methodeSuggestionDen || 'Mode'}</p>`;
        // #343 (b) : échelle/grille de rétroaction formative (n'entrent pas dans la note).
        if (r.echelleId) {
            const echelles = db.getSync(cle('echellesTemplates'), []);
            const echelle = echelles.find(e => e.id === r.echelleId);
            html += `<p><strong>Échelle (rétroaction) :</strong> ${echapperHtml(echelle?.nom || r.echelleId)}</p>`;
        }
        if (r.grilleId) {
            const grille = grillesDuWizard().find(g => g.id === r.grilleId);
            html += `<p><strong>Grille (rétroaction) :</strong> ${echapperHtml(grille?.nom || r.grilleId)}</p>`;
        }
        html += '</div>';
    }

    // Échelle et grille — section « Matériel pédagogique » pour STD/SPE (l'échelle y sert
    // au calcul/conversion de niveaux). DEN les affiche dans SON bloc ci-dessus, en
    // rétroaction formative : la note DEN est un jugement, PAS une conversion de niveaux.
    if (r.typePratique !== 'sommative' && r.typePratique !== 'denotation') {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Matériel pédagogique</h4>';
        if (r.echelleId) {
            const echelles = db.getSync(cle('echellesTemplates'), []);
            const echelle = echelles.find(e => e.id === r.echelleId);
            html += `<p><strong>Échelle\u00a0:</strong> ${echapperHtml(echelle?.nom || r.echelleId)}</p>`;
            // #577 : le récapitulatif dit si les deux repères sont posés — et ce
            // que leur absence coûte, plutôt que de la taire.
            if (echelle) {
                const posees = echelle.seuilSuffisance && echelle.seuilMaitrise;
                html += posees
                    ? `<p><strong>Repères de maîtrise\u00a0:</strong> suffisant à partir de ${echapperHtml(echelle.seuilSuffisance)}, maîtrisé à partir de ${echapperHtml(echelle.seuilMaitrise)}</p>`
                    : '<p><strong>Repères de maîtrise\u00a0:</strong> non posés — la rétroaction ne pourra ni nommer les priorités ni dire ce qui est acquis.</p>';
            }
        }
        if (r.grilleId) {
            const grille = grillesDuWizard().find(g => g.id === r.grilleId);
            html += `<p><strong>Grille\u00a0:</strong> ${echapperHtml(grille?.nom || r.grilleId)}</p>`;
        } else {
            html += `<p><strong>Grille\u00a0:</strong> <em>À configurer plus tard</em></p>`;
        }
        // #899 (texte choisi par Grégoire, 17 sept. 2026) — UNE SPÉCIFICATION CRÉÉE ICI NE PEUT
        // PAS ENCORE CALCULER : l'assistant ne collecte ni types de productions ni forfaits
        // (écarté : les collecter ici, ce serait un second écrivain). Le récapitulatif dit où
        // les régler. En réédition d'une pratique qui porte déjà les deux, la ligne se tait.
        if (r.typePratique === 'specifications' && !_specificationPorteTypesEtForfaits()) {
            html += '<p><strong>Types de productions et forfaits :</strong> à régler après la création, dans Conception → Pratiques de notation (clique sur la pratique). Tant qu\'ils manquent, aucune note ne peut être calculée.</p>';
        }
        html += '</div>';
    }

    // ─── #319 Lot 4 — exemple de conséquence (a8) + réassurance non-destructive (a9) ───
    html += genererSectionExemple(classification.type);
    if (!wizardState.modeEdition) {
        // a9 — création seulement : la garantie existe dans sauvegarderPratique,
        // on la rend visible (encadré info bleu réutilisé, design system).
        html += '<div class="wizard-v2-info-block">'
              + '<span>Ta pratique active n\'est pas modifiée : celle-ci s\'ajoute à ta bibliothèque.</span>'
              + '</div>';
    }

    // ─── Lien vers le banc de décision (#326, demande terrain 17 juin) ───
    // Depuis le formulaire d'une pratique, accès direct au comparateur du Labo
    // pour mettre cette pratique en regard d'autres sur des profils-types.
    // #345 — masquage réversible : toute la section (titre + aide + bouton) est
    // gated par COMPARATEUR_VISIBLE (config.js). Ne PAS laisser le titre orphelin.
    if (typeof COMPARATEUR_VISIBLE === 'undefined' || COMPARATEUR_VISIBLE) {
        html += '<div class="wizard-v2-recap-section">';
        html += '<h4>Comparer ce type de notation</h4>';
        html += '<p class="wizard-v2-recap-aide">Le banc de décision du Labo met plusieurs pratiques en regard, sur des profils-types, pour voir ce que chaque réglage change sur les notes.</p>';
        html += '<button type="button" class="btn btn-secondaire" data-action="ouvrirComparateurDepuisWizard">Ouvrir le comparateur du Labo</button>';
        html += '</div>';
    }

    html += '</div>';
    return html;
}

/**
 * Ferme le wizard puis ouvre le banc de décision (Labo › Comparateur). Lien
 * proposé dans le récapitulatif du formulaire de pratique (#326). Routé par le
 * dispatcher data-action (CSP-safe, aucun handler inline).
 */
function ouvrirComparateurDepuisWizard() {
    fermerWizardV2();
    if (typeof naviguerVers === 'function') {
        naviguerVers('labo', 'comparateur');
    }
}

/**
 * Met à jour l'indicateur de progression
 */
function mettreAJourProgression() {
    const { numActuel, numTotal } = calculerProgression();

    // Mettre à jour le texte
    const numEl = document.getElementById('wizard-v2-etape-num');
    if (numEl) numEl.textContent = numActuel;

    const totalEl = document.getElementById('wizard-v2-etape-total');
    if (totalEl) totalEl.textContent = numTotal;

    const nomEl = document.getElementById('wizard-v2-etape-nom');
    if (nomEl) {
        const etape = ETAPES_WIZARD[wizardState.etapeActuelle];
        nomEl.textContent = etape?.titre || '';
    }

    // Mettre à jour les dots
    mettreAJourDots(numActuel, numTotal);
}

/**
 * Met à jour les indicateurs visuels (dots)
 */
function mettreAJourDots(actuel, total) {
    const dotsContainer = document.getElementById('wizard-v2-dots');
    if (!dotsContainer) return;

    let html = '';
    for (let i = 1; i <= total; i++) {
        const classe = i < actuel ? 'wizard-v2-dot-complete' :
                       i === actuel ? 'wizard-v2-dot-active' : '';
        html += `<span class="wizard-v2-dot ${classe}"></span>`;
    }
    dotsContainer.innerHTML = html;
}

/**
 * Met à jour l'état des boutons de navigation
 */
function mettreAJourBoutons() {
    const btnPrecedent = document.getElementById('wizard-v2-btn-precedent');
    const btnSuivant = document.getElementById('wizard-v2-btn-suivant');
    const btnCreer = document.getElementById('wizard-v2-btn-creer');

    // Bouton Précédent
    if (btnPrecedent) {
        toggleDisplay(btnPrecedent, wizardState.historique.length > 0);
    }

    // Boutons Suivant/Créer
    const estDerniereEtape = wizardState.etapeActuelle === 'recapitulatif';
    if (btnSuivant) {
        toggleDisplay(btnSuivant, !estDerniereEtape);
    }
    if (btnCreer) {
        toggleDisplay(btnCreer, estDerniereEtape);
        // Lot E1 (D3) : le bouton final nomme le geste.
        btnCreer.textContent = wizardState.modeEdition ? 'Appliquer à la pratique' : 'Créer la pratique';
    }
}

// ============================================================================
// VALIDATION ET SAUVEGARDE
// ============================================================================

/**
 * Valide les champs de l'étape actuelle
 * @param {string} etapeId - ID de l'étape
 * @returns {boolean} - true si valide
 */
function validerEtape(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) return false;

    // Obtenir les champs
    let champs = etape.champs || [];
    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    let valide = true;
    const champsInvalides = [];

    champs.forEach(champ => {
        // Ignorer les champs de type 'info' (pas de validation)
        if (champ.type === 'info') return;

        if (champ.required) {
            let element = null;
            let valeurTrouvee = '';

            // Chercher l'élément selon le type de champ
            if (champ.type === 'radio-cards') {
                // Pour les radio-cards, chercher le radio coché
                element = document.querySelector(`input[name="${champ.id}"]:checked`);
                valeurTrouvee = element?.value || '';
            } else if (champ.type === 'checkbox-cards') {
                // Pour les checkbox-cards, chercher au moins une case cochée
                const checked = document.querySelectorAll(`input[name="${champ.id}"]:checked`);
                element = checked.length > 0 ? checked[0] : null;
                valeurTrouvee = checked.length > 0 ? 'selected' : '';
            } else if (champ.type === 'liste-cibles') {
                // #717 : au moins une cible nommée — règle du composant (lot N6), lue aussi par la gestion.
                element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);
                valeurTrouvee = window.EditeurCibles.motifRefus(window.EditeurCibles.lire(element)) === null ? 'cibles' : '';
            } else {
                // Pour les autres champs, chercher par ID avec préfixe V2
                element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);
                valeurTrouvee = element?.value || '';
            }


            // Validation selon le type
            let estValide = false;
            if (champ.type === 'radio-cards' || champ.type === 'checkbox-cards') {
                // Pour radio/checkbox-cards, vérifier qu'au moins un est coché
                estValide = !!element;
            } else {
                // Pour les autres champs, vérifier que la valeur n'est pas vide
                estValide = element && valeurTrouvee.trim() !== '';
            }

            if (!estValide) {
                valide = false;
                champsInvalides.push(champ.label || champ.id);

                // Afficher une erreur visuelle
                const container = document.querySelector(`[name="${champ.id}"]`)?.closest('.wizard-v2-champ') ||
                                 document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`)?.closest('.wizard-v2-champ');
                if (container) {
                    container.classList.add('wizard-v2-champ-erreur');
                }
            } else {

                // Retirer l'erreur visuelle si présente
                const container = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`)?.closest('.wizard-v2-champ');
                if (container) {
                    container.classList.remove('wizard-v2-champ-erreur');
                }
            }
        }
    });

    if (!valide) {
        const message = champsInvalides.length > 0
            ? `Remplis\u00a0: ${champsInvalides.join(', ')}`
            : 'Remplis tous les champs obligatoires.';
        notifications.erreur(message);
    }

    return valide;
}

/**
 * Sauvegarde les réponses de l'étape actuelle
 * @param {string} etapeId - ID de l'étape
 */
function sauvegarderReponsesEtape(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) return;

    // Obtenir les champs
    let champs = etape.champs || [];
    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    // Fonction interne pour sauvegarder un champ
    const sauvegarderChamp = (champ) => {
        if (champ.type === 'info') return;

        // 🆕 Beta 95.4 : Gérer les rows avec sous-champs
        if (champ.type === 'row' && champ.champs) {
            champ.champs.forEach(sousChamp => sauvegarderChamp(sousChamp));
            return;
        }

        const element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);

        if (champ.type === 'radio-cards') {
            const checked = document.querySelector(`input[name="${champ.id}"]:checked`);
            if (checked) {
                wizardState.reponses[champ.id] = checked.value;
            }
        } else if (champ.type === 'checkbox-cards') {
            const checked = document.querySelectorAll(`input[name="${champ.id}"]:checked`);
            wizardState.reponses[champ.id] = Array.from(checked).map(cb => cb.value);
        } else if (champ.type === 'toggle') {
            wizardState.reponses[champ.id] = element?.checked || false;
        } else if (champ.type === 'liste-cibles') {
            if (element) wizardState.reponses[champ.id] = window.EditeurCibles.lire(element);
        } else if (element) {
            wizardState.reponses[champ.id] = element.value;
        }
    };

    champs.forEach(sauvegarderChamp);

}

/**
 * Restaure les valeurs d'une étape précédemment remplie
 * @param {string} etapeId - ID de l'étape
 */
function restaurerValeursEtape(etapeId) {
    const etape = ETAPES_WIZARD[etapeId];
    if (!etape) return;

    // Obtenir les champs
    let champs = etape.champs || [];
    if (etape.getChampsDynamiques) {
        champs = etape.getChampsDynamiques(wizardState.reponses);
    }

    // Fonction interne pour restaurer un champ
    const restaurerChamp = (champ) => {
        if (champ.type === 'info') return;

        // 🆕 Beta 95.4 : Gérer les rows avec sous-champs
        if (champ.type === 'row' && champ.champs) {
            champ.champs.forEach(sousChamp => restaurerChamp(sousChamp));
            return;
        }

        const valeur = wizardState.reponses[champ.id];
        if (valeur === undefined) return;

        const element = document.getElementById(`${WIZARD_V2_ID_PREFIX}${champ.id}`);

        if (champ.type === 'radio-cards') {
            const radio = document.querySelector(`input[name="${champ.id}"][value="${valeur}"]`);
            if (radio) radio.checked = true;
        } else if (champ.type === 'checkbox-cards') {
            const values = Array.isArray(valeur) ? valeur : [];
            values.forEach(val => {
                const cb = document.querySelector(`input[name="${champ.id}"][value="${val}"]`);
                if (cb) cb.checked = true;
            });
        } else if (champ.type === 'toggle') {
            if (element) element.checked = valeur;
        } else if (champ.type === 'liste-cibles') {
            window.EditeurCibles.poser(element, valeur);
        } else if (element) {
            element.value = valeur;
        }
    };

    champs.forEach(restaurerChamp);
}

// ============================================================================
// CLASSIFICATION COMPORTEMENTALE - Moteur d'inférence
// ============================================================================

/**
 * Déduit le type de pratique à partir des réponses comportementales
 * @param {Object} reponses - Réponses collectées dans le wizard
 * @returns {{ type: string, variante: string, regles: string[], confiance: number }}
 */
function deduireTypePratique(reponses) {
    let q1 = reponses.calcNoteFinale;

    // Cas « pas-certain » (bug testeur 8 juin) : ne PAS reposer la question nommée.
    // On infère la famille à partir des gestes observables (unité de correction, sort
    // de la reprise, départage éventuel) et on NORMALISE vers la valeur canonique —
    // les branches ci-dessous produisent ensuite type + variante (moteur unique).
    if (q1 === 'pas-certain') {
        const inf = _infererFamilleComportementale(reponses);
        if (!inf) return { type: null, variante: null, regles: [], confiance: 0 }; // divergent → départage
        q1 = inf;
    }

    if (q1 === 'moyenne') {
        // #903 : une clé retirée qui traînerait dans les réponses ne s'écrit pas.
        const regles = (reponses.reglesSommatives || []).filter(regle => !REGLES_SOMMATIVES_RETIREES.includes(regle));
        let variante = 'classique';

        if (regles.includes('double_verrou')) variante = 'verrou';
        else if (regles.includes('portfolio')) variante = 'portfolio';

        return { type: 'sommative', variante, regles, confiance: 1.0 };
    }

    if (q1 === 'niveaux') {
        // #443 : PAN-Standards n'a plus qu'une approche — la variante est
        // constante. Un `if` à branche unique donnerait à croire qu'il en
        // existe une autre.
        return { type: 'standards', variante: 'n-meilleurs', regles: [], confiance: 1.0 };
    }

    if (q1 === 'acceptable') {
        return { type: 'specifications', variante: 'bundles', regles: [], confiance: 1.0 };
    }

    // DEN couche 2 (#318, DEN-3) : 'jugement' est produit par la carte de la voie
    // rapide (création) ET par chargerPratiqueExistante (édition). Variante = le mode
    // de dénotation ; seul 'eliminee' est offert au premier lot (mode « réduite » plus tard).
    if (q1 === 'jugement') {
        return { type: 'denotation', variante: 'eliminee', regles: [], confiance: 1.0 };
    }

    return { type: null, variante: null, regles: [], confiance: 0 };
}

/**
 * Gestion de l'exclusion mutuelle pour checkbox-cards
 * Quand une option exclusive (ex: "aucune") est cochée, les autres sont décochées et vice-versa
 */
function wizardV2GererExclusionCheckbox(el) {
    const container = el.closest('.wizard-v2-checkbox-cards');
    if (!container) return;

    if (el.dataset.exclusive === 'true' && el.checked) {
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb !== el) cb.checked = false;
        });
    } else if (el.checked) {
        container.querySelectorAll('input[type="checkbox"][data-exclusive="true"]').forEach(cb => {
            cb.checked = false;
        });
    }
}

// ============================================================================
// CRÉATION DE LA PRATIQUE
// ============================================================================

/**
 * Crée la pratique à partir des réponses collectées
 * 🆕 FIX (20 jan 2026) : Async pour attendre la sauvegarde
 */
async function creerPratiqueV2() {
    const r = wizardState.reponses;

    // Lire le nom final depuis le champ éditable du récapitulatif (si présent)
    const champNomRecap = document.getElementById('wizard-v2-recap-nom');
    if (champNomRecap && champNomRecap.value.trim()) {
        r.nom = champNomRecap.value.trim();
    }

    // #319 Lot 2 (a7) — Adoption d'un modèle = CLONE FIDÈLE du gabarit. On copie sa
    // configuration intégrale et on court-circuite toute la reconstruction ci-dessous :
    // celle-ci, pilotée par les réponses, perd la config des gabarits (SPE : forfaits/
    // typesTravaux ; STD : echelleId absente → création bloquée). Le clone reçoit un
    // nouvel id, le nom/auteur du récap, et entre dans la bibliothèque.
    if (r._modeleAdopte && r._gabaritSource) {
        const src = r._gabaritSource;
        // #898 — un modèle Standards sans échelle DEMANDE l'échelle avant de s'adopter.
        // Question fermée sans choix : rien n'est écrit, l'assistant reste ouvert.
        const reponseEchelle = await demanderEchelleAdoption(src);
        if (!reponseEchelle.adopter) return;
        const clone = poserEchelleAdoption(JSON.parse(JSON.stringify(src)), reponseEchelle.echelleId);
        clone.id = wizardState.pratiqueId || genererIdUnique('pratique_');
        clone.nom = r.nom || src.nom || 'Pratique adoptée';
        const auteurRecap = `${r.prenom || ''} ${r.nomAuteur || ''}`.trim();
        if (auteurRecap) clone.auteur = auteurRecap;
        if (r.etablissement) clone.etablissement = r.etablissement;
        if (r.discipline) clone.discipline = r.discipline;
        if (r.description) clone.description = r.description;
        clone.dansBibliotheque = true;
        clone.dateCreation = new Date().toISOString();
        // Le clone est une pratique à part entière, pas un gabarit/seed prédéfini.
        delete clone.estGabarit;
        delete clone.dateAjoutBiblio;
        await finaliserCreationPratique(clone);
        return;
    }

    // Construire l'objet pratique. typeFinal vient de deduireTypePratique
    // (jamais 'pan-maitrise') → l'entrée 'pan-maitrise':'PAN' était du code mort,
    // retirée (A-2 4e, zéro-dette).
    const typeMapping = {
        'sommative': 'SOM',
        'standards': 'STD',
        'specifications': 'SPE',
        'denotation': 'DEN'
    };

    // Utiliser la classification comportementale déduite
    const classification = deduireTypePratique(r);
    const typeFinal = classification.type || r.typePratique;

    // Bug 31 mai : une pratique PAN-Standards calcule par conversion de niveaux (IDME)
    // → elle DOIT avoir une échelle. On bloque la création plutôt que de produire une
    // pratique invalide (qui échouerait ensuite à l'instanciation : « echelle manquante »).
    // SOM (moyenne pondérée) et SPE (seuils) n'utilisent pas d'échelle IDME → non bloqués.
    if (typeFinal === 'standards' && !r.echelleId) {
        notifications.erreur('Choisis une échelle de performance (IDME) avant de créer cette pratique PAN-Standards. Reviens à l\'étape « Échelle de performance ».');
        return;
    }

    const pratique = {
        id: wizardState.pratiqueId || genererIdUnique('pratique_'),
        nom: r.nom,
        auteur: `${r.prenom || ''} ${r.nomAuteur || ''}`.trim(),
        etablissement: r.etablissement || '',
        description: r.description || '',
        discipline: r.discipline || '',
        // La pratique naît canonique. Depuis #319 Lot 1, deduireTypePratique et tout
        // le flux interne produisent déjà le vocabulaire canonique ('standards'…) ;
        // normaliserIdPratique reste appelé ici par sécurité défensive (idempotent sur
        // un type déjà canonique, et ramène un éventuel legacy résiduel au canonique).
        type: (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(typeFinal) : typeFinal),
        variante: classification.variante || null,
        pratiques: [typeMapping[typeFinal] || 'STD'],  // Pour le badge (typeMapping indexé legacy, OK)
        dansBibliotheque: true,  // Pour apparaître dans la sidebar
        dateCreation: new Date().toISOString(),
        configuration: {}
    };

    // Bug 31 mai : méthode de calcul EXPLICITE par famille. Sans ça,
    // construireConfigComplete défaute tout à 'conversion_niveaux' (IDME) → une
    // pratique Sommative ou Spécifications serait calculée comme une PAN et exigerait
    // une échelle. Le switch de PratiqueConfigurable.calculerPerformance attend ces codes.
    if (typeFinal === 'sommative') {
        pratique.calcul_note = { methode: 'moyenne_ponderee' };
    } else if (typeFinal === 'specifications') {
        pratique.calcul_note = { methode: 'specifications' };
    } else if (typeFinal === 'denotation') {
        // DEN couche 2 (#318) : la note est un jugement saisi (moteur DEN-1).
        pratique.calcul_note = { methode: 'jugement_global' };
    } else {
        // #396 (5 août 2026) : la méthode de calcul dédiée « par objectif » est
        // RETIRÉE (jamais fonctionnelle — décision D2). L'approche « par objectifs »
        // vit dans Standards (fold Session C) et se calcule comme elle : conversion
        // de niveaux. (#443 : l'approche par objectifs est retirée du wizard ;
        // ce repli couvre toute la famille Standards, qui n'a plus qu'une voie.)
        pratique.calcul_note = { methode: 'conversion_niveaux' };
    }

    // Seuils personnels (toutes branches)
    if (r.seuilVaBien || r.seuilDifficulte || r.seuilGrandeDifficulte) {
        pratique.seuils = {
            type: 'pourcentage',
            va_bien: parseInt(r.seuilVaBien) || 75,
            difficulte: parseInt(r.seuilDifficulte) || 65,
            grande_difficulte: parseInt(r.seuilGrandeDifficulte) || 55
        };
    }

    // Nombre d'évaluations prévues
    if (r.nbEvaluationsPrevues) {
        pratique.nbEvaluationsPrevues = parseInt(r.nbEvaluationsPrevues) || 6;
    }

    // Règles sommatives (stockées pour référence)
    if (classification.regles && classification.regles.length > 0) {
        pratique.reglesSpeciales = classification.regles;
    }

    // Configuration selon le type
    if (typeFinal === 'sommative') {
        // #900 (lot N6) : ni `afficherRang`, ni `afficherMoyenneGroupe` (aucun lecteur), ni
        // `configuration.reglesSommatives` (doublon de `reglesSpeciales`, écrit plus haut).
        pratique.configuration = {};

        // Phase 2 : Enrichissement sommative
        const regles = classification.regles || [];
        if (regles.includes('double_verrou')) {
            pratique.configuration.conditions_speciales = pratique.configuration.conditions_speciales || [];
            pratique.configuration.conditions_speciales.push({
                type: 'double_verrou',
                condition: {
                    evaluation: r.nomEvalVerrouillee || 'Analyse finale',
                    comparateur: '<',
                    seuil: parseInt(r.seuilVerrou) || 60
                },
                consequence: {
                    action: 'echec',
                    note_max: parseInt(r.plafondVerrou) || 55
                }
            });
        }
        // (#900, lot N6 : le bloc `portfolio` d'une sommative n'est plus écrit — ni `utiliser`, ni
        //  `nbArtefacts`, ni `qualitatif` n'ont de lecteur ; la règle vit dans `reglesSpeciales`.)
    } else if (typeFinal === 'standards') {
        const modeSelection = r.modeSelectionPortfolio || 'n_meilleurs';
        const estHybride = modeSelection === 'hybride';

        // #900 (lot N6) : `varianteCalcul` n'est plus écrit — aucun lecteur depuis #435 (le moteur
        // ne route plus « par-objectifs »). Le mode de sélection est la seule commande.
        pratique.configuration = {
            approcheEvaluation: r.approcheEvaluation,
            echelleId: r.echelleId || null,
            grilleId: r.grilleId || null
        };

        if (r.approcheEvaluation === 'par-artefacts') {
            // #133 : le wizard prime — nbSoumis/retenus/min viennent des réponses
            // saisies, plus du SSOT global modalitesEvaluation (Primo n'écrase plus
            // ce que l'utilisateur tape). modalites reste lu ci-dessous pour les
            // catégories hybrides détaillées (Mode Expert), non collectées ici.
            const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
            const nbSoumis = parseInt(r.nbArtefactsSoumis) || 12;
            const nbRetenus = parseInt(r.nbArtefactsRetenus) || 7;
            const minFormatif = parseInt(r.minAvantCalculFormatif) || 3;

            pratique.configuration.portfolio = {
                utiliser: r.utiliserPortfolio !== false,
                // Noms standardisés (cohérents avec pratiques-gestion.js)
                nombreTotal: nbSoumis,
                nombreARetenir: nbRetenus,
                methodeSelection: estHybride ? 'meilleurs' : (modeSelection === 'n_meilleurs' ? 'meilleurs' : modeSelection),
                minimumCompletion: minFormatif
            };
            // 🆕 #24 : Activer catégories automatiquement si hybride. #900 (lot N6) : le drapeau
            // `portfolio.hybride` n'est plus écrit — `categories.actif` est ce que le moteur lit
            // (`obtenirConfigCategories`, portfolio.js), et la relecture le lit aussi.
            if (estHybride || modalites.utiliserCategories === 'oui' || modalites.categories?.actif) {
                pratique.configuration.categories = {
                    actif: true,
                    selection: {
                        nombreARetenir: parseInt(modalites.categories?.selection?.nombreARetenir) || 4,
                        ponderation: parseInt(modalites.categories?.selection?.ponderation) || 65
                    },
                    obligatoires: {
                        nombre: parseInt(modalites.categories?.obligatoires?.nombre) || 2,
                        ponderation: parseInt(modalites.categories?.obligatoires?.ponderation) || 35
                    }
                };
            }
        }
    } else if (typeFinal === 'specifications') {
        pratique.configuration = {
            // #935 (lot N6) : UN nom, celui que le moteur lit — `seuilAcceptable`. La réponse de
            // l'assistant garde son id d'étape (`seuilAcceptabilite`) ; seul le champ écrit change.
            // #935 (15 oct. 2026) : un 0 écrit reste 0 ; sans réponse, 100.
            seuilAcceptable: Number.isFinite(parseInt(r.seuilAcceptabilite)) ? parseInt(r.seuilAcceptabilite) : 100,
            jetons: {
                activer: r.utiliserJetons || false
            }
        };

        if (r.utiliserJetons) {
            pratique.configuration.jetons = {
                activer: true,
                // #853 : `surReprise` n'est écrit que coché — absent = non ; la pratique par
                // défaut reste identique au golden master #319.
                delai: Object.assign({
                    nombre: parseInt(r.nbJetonsDelai) || 3,
                    dureeJours: parseInt(r.dureeDelaiJours) || 3
                }, r.delaiSurReprise === true ? { surReprise: true } : {}),
                reprise: {
                    nombre: parseInt(r.nbJetonsReprise) || 2
                }
            };
        }

        if (r.modeleBundle) {
            pratique.configuration.modeleBundle = r.modeleBundle;
        }
    } else if (typeFinal === 'denotation') {
        // DEN couche 2 (#318, DEN-3). Mode « éliminée » seul pour l'instant.
        // #717 : chaque cible garde l'id reçu à sa création (EditeurCibles) ; les coches
        // du jugement y sont indexées. Déplacer ou renommer ne les touche pas.
        const cibles = (Array.isArray(r.ciblesDenotation) ? r.ciblesDenotation : [])
            .map(c => ({ id: c.id, nom: c.nom }));

        // #717 (2c) : retirer une cible cochée change la note — la question avant d'écrire.
        if (wizardState.modeEdition && wizardState.pratiqueId) {
            const existante = (db.getSync(cle('pratiquesConfigurables'), null) || []).find(p => p.id === wizardState.pratiqueId);
            const anciennes = (existante && existante.configuration && existante.configuration.objectifs) || [];
            if (!(await window.EditeurCibles.confirmerRetraits(wizardState.pratiqueId, anciennes, cibles))) return;
        }

        pratique.configuration = {
            type: 'denotation',
            modeDEN: 'eliminee',
            objectifs: cibles,
            suggestion: { methode: r.methodeSuggestionDen || 'mode' },
            // #343 (b) : échelle + grille OPTIONNELLES pour la rétroaction formative.
            // Elles n'entrent PAS dans le calcul (note = jugement saisi, jugement_global) ;
            // la validation n'exige pas d'échelle pour jugement_global. null si non choisies.
            echelleId: r.echelleId || null,
            grilleId: r.grilleId || null
        };
    }


    // Finaliser (sauvegarde + fermeture + notification + rafraîchissements).
    await finaliserCreationPratique(pratique);
}

/**
 * Finalise la création d'une pratique : sauvegarde puis fermeture, notification et
 * rafraîchissement des vues. Partagée par le parcours « décrire » (reconstruction
 * depuis les réponses) et l'adoption d'un modèle (#319 Lot 2 a7, clone du gabarit).
 * @param {Object} pratique - Objet pratique prêt à être persisté
 */
async function finaliserCreationPratique(pratique) {
    // Lot E1 (D3) : le mode est lu AVANT la fermeture, qui le remet à « création ».
    const enModification = wizardState.modeEdition === true;

    // Lot E1 : la grille de base proposée par l'assistant n'entre en base qu'ici, et
    // seulement si la pratique la retient.
    const grilleDeBase = wizardState.grilleDeBase;
    if (grilleDeBase && pratique.configuration && pratique.configuration.grilleId === grilleDeBase.id) {
        const ecrite = await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
            const grilles = lues || [];
            return grilles.some(g => g.id === grilleDeBase.id) ? grilles : grilles.concat([grilleDeBase]);
        }, [], { geste: 'Créer la pratique', discret: true }).catch(() => undefined);
        if (!ecrite) return;
        wizardState.grilleDeBase = null;
    }

    // Un échec : le témoin l'a dit ; l'assistant reste ouvert, rien n'est perdu.
    if (!(await sauvegarderPratique(pratique))) return;

    // Fermer le wizard
    fermerWizardV2();

    // D3 : l'assistant disait « créée » même en modification.
    notifications.succes(enModification
        ? `Pratique «\u00a0${pratique.nom}\u00a0» mise à jour.`
        : `Pratique «\u00a0${pratique.nom}\u00a0» créée.`);

    // Rafraîchir l'interface si nécessaire
    if (typeof chargerPratiques === 'function') {
        chargerPratiques();
    }

    // 🆕 FIX (20 jan 2026) : Rafraîchir aussi la sidebar de Construction > Pratiques
    if (typeof afficherListePratiquesMateriel === 'function') {
        afficherListePratiquesMateriel();
    }

    // 🆕 Bug 31 mai : rafraîchir AUSSI le select « Pratique de notation » de
    // l'assemblage groupe-cours. La sidebar était rafraîchie mais pas les dropdowns
    // d'assemblage → une pratique fraîchement créée restait invisible dans
    // « Modifier le groupe-cours » jusqu'au rechargement du formulaire.
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
}

/**
 * #903 — UNE PRATIQUE DÉJÀ ENREGISTRÉE GARDE CE QU'ELLE PORTE (limite de Grégoire du
 * 20 sept. 2026 : « Je ne veux pas qu'on efface des données de façon irréversible »).
 * L'assistant reconstruit l'objet à neuf et ne connaît plus le plafonnement, le
 * remplacement ni le déclaratif des reprises : sans ce passage, rouvrir puis enregistrer
 * les effacerait. Ils passent donc TELS QUELS de `existante` à `pratique` — aucun calcul
 * ne les lit (mesuré au lot 29 et remesuré le 21 sept.). Mute et rend `pratique`.
 * @param {Object} pratique - l'objet reconstruit par l'assistant
 * @param {Object} existante - l'objet enregistré qu'il remplace
 * @returns {Object} pratique
 */
function conserverReglesRetirees(pratique, existante) {
    if (!pratique || !existante) return pratique;
    const clone = (v) => JSON.parse(JSON.stringify(v));
    const avant = existante.configuration || {};

    // Le déclaratif des reprises d'un portfolio Standards.
    if (pratique.type === 'standards' && pratique.configuration && pratique.configuration.portfolio
        && avant.portfolio && avant.portfolio.reprisesPermises !== undefined) {
        pratique.configuration.portfolio.reprisesPermises = clone(avant.portfolio.reprisesPermises);
    }
    if (pratique.type !== 'sommative' || existante.type !== 'sommative') return pratique;

    pratique.configuration = pratique.configuration || {};
    if (avant.reprises !== undefined) pratique.configuration.reprises = clone(avant.reprises);
    if (avant.remplacement !== undefined) pratique.configuration.remplacement = clone(avant.remplacement);
    const plafonnements = (avant.conditions_speciales || []).filter(c => c && c.type === 'plafonnement');
    if (plafonnements.length > 0) {
        pratique.configuration.conditions_speciales =
            (pratique.configuration.conditions_speciales || []).concat(clone(plafonnements));
    }

    // Les clés des règles : l'ordre enregistré est gardé, et « aucune » ne cohabite pas
    // avec une règle que la pratique porte encore.
    const fusionner = (nouvelles, anciennes) => {
        if (!Array.isArray(anciennes) || !anciennes.some(k => REGLES_SOMMATIVES_RETIREES.includes(k))) return nouvelles;
        const base = (Array.isArray(nouvelles) ? nouvelles : []).filter(k => k !== 'aucune');
        return anciennes.filter(k => REGLES_SOMMATIVES_RETIREES.includes(k) || base.includes(k))
            .concat(base.filter(k => !anciennes.includes(k)));
    };
    const cochees = pratique.reglesSpeciales;
    const reglesSpeciales = fusionner(cochees, existante.reglesSpeciales);
    if (reglesSpeciales !== undefined) pratique.reglesSpeciales = reglesSpeciales;
    // #900 (lot N6) : l'assistant n'écrit plus le doublon `configuration.reglesSommatives` ; une
    // pratique qui le porte le garde, fusionné avec les MÊMES cases cochées que `reglesSpeciales`.
    if (avant.reglesSommatives !== undefined) {
        const reglesSommatives = fusionner(cochees, avant.reglesSommatives);
        if (reglesSommatives !== undefined) pratique.configuration.reglesSommatives = reglesSommatives;
    }

    // La variante suivait la première règle cochée (remplacement > verrou > portfolio >
    // plafonnement) : elle reste ce qu'elle était tant que sa règle est toujours portée.
    const portees = pratique.reglesSpeciales || [];
    if (portees.includes('remplacement')) pratique.variante = 'progressive';
    else if (portees.includes('plafonnement') && pratique.variante === 'classique') pratique.variante = 'plafonnement';
    return pratique;
}

/**
 * #900 (lot N6, 23 sept. 2026) — LES RÉGLAGES SANS LECTEUR QU'UNE PRATIQUE PORTE DÉJÀ RESTENT.
 * L'assistant n'écrit plus « Afficher le rang », « Afficher la moyenne du groupe », le portfolio d'une
 * sommative (nombre d'artefacts, qualitatif) ni `portfolio.decouplerPN` : aucun écran ni calcul ne les lit.
 * Une pratique qui les porte les garde à la réédition (limite de Grégoire du 20 sept. : on cesse d'écrire, on
 * n'efface pas) — tels quels, puisque plus rien ne les édite. `varianteCalcul` (projection du mode de sélection,
 * lue seulement par l'avertissement « par-objectifs ») passe aussi tel quel. `portfolio.hybride` est à part : le
 * formulaire, son badge et la relecture le lisent encore (en « ou » avec `categories.actif`) — gardé figé, il
 * ferait rouvrir en « hybride » une pratique qu'on vient d'en sortir. Il n'est plus créé ; une pratique qui le
 * porte le garde ALIGNÉ sur `categories.actif`, ce que le moteur calcule. Mute et rend `pratique`.
 * @param {Object} pratique - l'objet reconstruit par l'assistant
 * @param {Object} existante - l'objet enregistré qu'il remplace
 * @returns {Object} pratique
 */
function conserverReglagesSansLecteur(pratique, existante) {
    if (!pratique || !existante) return pratique;
    const canon = (t) => (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(t) : t);
    if (canon(pratique.type) !== canon(existante.type)) return pratique;
    const clone = (v) => JSON.parse(JSON.stringify(v));
    const avant = existante.configuration || {};
    pratique.configuration = pratique.configuration || {};
    if (pratique.type === 'sommative') {
        for (const cle of ['afficherRang', 'afficherMoyenneGroupe', 'portfolio']) {
            if (avant[cle] !== undefined && pratique.configuration[cle] === undefined) pratique.configuration[cle] = clone(avant[cle]);
        }
    } else if (pratique.type === 'standards') {
        if (avant.varianteCalcul !== undefined) pratique.configuration.varianteCalcul = clone(avant.varianteCalcul);
        const portfolio = pratique.configuration.portfolio;
        if (portfolio && avant.portfolio) {
            if (avant.portfolio.decouplerPN !== undefined) portfolio.decouplerPN = clone(avant.portfolio.decouplerPN);
            if (avant.portfolio.hybride !== undefined) portfolio.hybride = !!(pratique.configuration.categories && pratique.configuration.categories.actif);
        }
    }
    return pratique;
}

/**
 * Lot N4 (#854, volet spécifications, 23 sept. 2026) — UNE SPÉCIFICATION ROUVERTE GARDE SA CONFIGURATION.
 * L'assistant reconstruit `configuration` à neuf avec ce qu'il sait éditer (seuil, jetons, modèle de forfaits) ;
 * les types de productions et les forfaits — le palier d'échec compris — se règlent ailleurs (formulaire de
 * gestion) et disparaissaient au premier enregistrement. On part donc de la configuration ENREGISTRÉE et on n'y
 * remplace que ce que l'assistant gère, à la place où chaque clé se trouvait : rouvrir puis enregistrer sans
 * rien toucher rend la même configuration, à l'octet.
 * - Le seuil s'écrit sous `seuilAcceptable`, le nom que le moteur lit (#935, lot N6). Une pratique ancienne qui
 *   porte `seuilAcceptabilite` le garde (aucune conversion en base) : le moteur, le formulaire et l'assistant
 *   lisent `seuilAcceptable` d'abord, il cesse d'être lu dès que le nom unique est écrit.
 * - Des jetons « désactivés » ne s'ajoutent pas à une pratique qui n'en portait pas.
 * Mute et rend `pratique`.
 * @param {Object} pratique - l'objet reconstruit par l'assistant
 * @param {Object} existante - l'objet enregistré qu'il remplace
 * @returns {Object} pratique
 */
function conserverConfigurationSpecifications(pratique, existante) {
    if (!pratique || !existante || pratique.type !== 'specifications' || existante.type !== 'specifications') return pratique;
    const avant = JSON.parse(JSON.stringify(existante.configuration || {}));
    const neuve = Object.assign({}, pratique.configuration || {});
    if (avant.jetons === undefined && neuve.jetons && neuve.jetons.activer !== true) delete neuve.jetons;
    pratique.configuration = Object.assign(avant, neuve);
    return pratique;
}

/**
 * #938 (10 oct. 2026) — L'ASSISTANT GARDE CE QU'IL N'ÉDITE PAS.
 * Il reconstruit l'objet à neuf ; tout champ réglé ailleurs (formulaire de gestion, partage CC) partait au premier
 * enregistrement. Mesuré par le vrai code, une pratique passée au formulaire puis rouverte par l'assistant perdait :
 * le bloc plat `jetons` (sommative, standards, dénotation — le moteur le lit en dernier recours), `affichageNote`
 * (lu par l'évaluation : note en lettre), `configuration.notesFinales` (lu par le calcul de la note finale), et les
 * catégories inactives d'une Standards. On nomme donc ce que l'assistant ÉDITE ; le reste de la pratique enregistrée
 * passe tel quel. S'il édite un champ, sa valeur l'emporte, même absente (une règle décochée, un seuil vidé).
 * - Les jetons : l'assistant n'écrit que `configuration.jetons`, et seulement pour une spécification ; le moteur le lit
 *   AVANT le bloc plat du formulaire. Aucun conflit : chacun garde le sien, le moteur tranche comme avant.
 * - La configuration ne passe que si la famille ne change pas : celle d'une autre famille ne s'applique pas.
 *   Les spécifications ont déjà leur passage (`conserverConfigurationSpecifications`, lot N4).
 * - Les catégories d'une Standards : leur absence dit « inactives ». Un bloc enregistré inactif reste ; un bloc actif
 *   que l'assistant n'écrit plus a été désactivé par lui (sortie du mode hybride) et ne revient pas.
 * Mute et rend `pratique`.
 * @param {Object} pratique - l'objet reconstruit par l'assistant
 * @param {Object} existante - l'objet enregistré qu'il remplace
 * @returns {Object} pratique
 */
const CHAMPS_EDITES_PAR_L_ASSISTANT = ['id', 'nom', 'auteur', 'etablissement', 'description', 'discipline', 'type',
    'variante', 'pratiques', 'dansBibliotheque', 'dateCreation', 'configuration', 'calcul_note', 'seuils',
    'nbEvaluationsPrevues', 'reglesSpeciales'];
const CONFIGURATION_EDITEE_PAR_L_ASSISTANT = {
    sommative: ['conditions_speciales'],
    standards: ['approcheEvaluation', 'echelleId', 'grilleId', 'portfolio', 'categories'],
    denotation: ['type', 'modeDEN', 'objectifs', 'suggestion', 'echelleId', 'grilleId']
};
function conserverCeQueLAssistantNEditePas(pratique, existante) {
    if (!pratique || !existante) return pratique;
    const clone = (v) => JSON.parse(JSON.stringify(v));
    for (const champ of Object.keys(existante)) {
        if (!CHAMPS_EDITES_PAR_L_ASSISTANT.includes(champ) && pratique[champ] === undefined && existante[champ] !== undefined) {
            pratique[champ] = clone(existante[champ]);
        }
    }
    const canon = (t) => (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(t) : t);
    const editee = CONFIGURATION_EDITEE_PAR_L_ASSISTANT[canon(pratique.type)];
    const avant = existante.configuration;
    if (!editee || canon(pratique.type) !== canon(existante.type) || !avant) return pratique;
    pratique.configuration = pratique.configuration || {};
    for (const champ of Object.keys(avant)) {
        if (!editee.includes(champ) && pratique.configuration[champ] === undefined && avant[champ] !== undefined) {
            pratique.configuration[champ] = clone(avant[champ]);
        }
    }
    if (canon(pratique.type) === 'standards' && pratique.configuration.categories === undefined
        && avant.categories && avant.categories.actif !== true) {
        pratique.configuration.categories = clone(avant.categories);
    }
    return pratique;
}

/**
 * Sauvegarde la pratique dans le stockage
 * 🆕 FIX (20 jan 2026) : Sauvegarde robuste avec vérification
 * @param {Object} pratique - Objet pratique à sauvegarder
 * @returns {boolean} true si l'écriture a eu lieu (lot E1 : le témoin dit l'échec)
 */
async function sauvegarderPratique(pratique) {
    // Récupérer les pratiques existantes
    let pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];

    // Mise à jour ou ajout
    const index = pratiques.findIndex(p => p.id === pratique.id);
    if (index >= 0) {
        // CO-01 (Bloquant, audit Conception 20-21 août 2026) : l'édition wizard
        // reconstruit l'objet à neuf — on FUSIONNE l'enveloppe que l'assistant ne
        // sait pas éditer, au lieu de la détruire. Invariant CC (SPEC D §3.1) :
        // inspireDe n'est JAMAIS effacé. #938 : l'enveloppe n'est plus une liste de
        // quatre champs, c'est tout ce que l'assistant n'édite pas (plus bas).
        const existante = pratiques[index];
        // La construction réécrit dateCreation et force dansBibliotheque:true —
        // l'édition ne change ni la date de naissance, ni le statut de sidebar
        // (une maquette adoptée passe par « Adopter », pas par « Enregistrer »).
        if (existante.dateCreation) pratique.dateCreation = existante.dateCreation;
        if (existante.dansBibliotheque !== undefined) pratique.dansBibliotheque = existante.dansBibliotheque;
        // L'étape auteur peut être sautée en édition : ne jamais remplacer par du vide.
        if (!pratique.auteur && existante.auteur) pratique.auteur = existante.auteur;
        if (!pratique.etablissement && existante.etablissement) pratique.etablissement = existante.etablissement;
        conserverReglesRetirees(pratique, existante);
        conserverReglagesSansLecteur(pratique, existante);           // lot N6 (#900)
        conserverConfigurationSpecifications(pratique, existante);   // lot N4 (#854)
        conserverCeQueLAssistantNEditePas(pratique, existante);      // #938 (inspireDe, metadata_cc… compris)
        pratiques[index] = pratique;
    } else {
        pratiques.push(pratique);
    }

    // Lot E1 (D0 point 2) : par le témoin commun. Avant, `db.setSync` direct : un échec
    // n'était dit nulle part, et l'assistant annonçait « créée » quand même.
    const ecrite = sauvegarderDonneesSelonMode('pratiquesConfigurables', pratiques, {
        geste: wizardState.modeEdition ? 'Appliquer à la pratique' : 'Créer la pratique'
    });

    // #328 L2-b2 : plus AUCUNE synchronisation miroir — le type de la pratique
    // active se dérive partout de la SSOT groupesCours[].pratiqueId via
    // obtenirTypePratiqueActive (helper D2). Sauvegarder une pratique ne touche
    // plus modalitesEvaluation.
    return ecrite;
}

// ============================================================================
// INTERFACE PUBLIQUE
// ============================================================================

/**
 * Ouvre le wizard V2
 * @param {boolean} modeEdition - true pour modifier une pratique existante
 * @param {string} pratiqueId - ID de la pratique à modifier (si modeEdition)
 */
function ouvrirWizardV2(modeEdition = false, pratiqueId = null) {

    // #319 Lot 2 (a6/a7) : infos-base n'est plus l'entrée. En CRÉATION, le parcours
    // démarre à l'écran d'entrée à deux portes (entree-pratique). En ÉDITION, on entre
    // directement à la classification (calcul-note-finale) — pas de choix de modèle au
    // ré-ouvert d'une pratique existante. etapeInitiale sert aussi de point de départ
    // au compteur de progression (calculerNbEtapes).
    const etapeInitiale = modeEdition ? 'calcul-note-finale' : 'entree-pratique';

    // Réinitialiser l'état
    wizardState.etapeActuelle = etapeInitiale;
    wizardState.etapeInitiale = etapeInitiale;
    wizardState.historique = [];
    wizardState.reponses = {};
    wizardState.modeEdition = modeEdition;
    wizardState.pratiqueId = pratiqueId;

    // 🆕 Beta 95.4 : Pré-remplir avec le profil enseignant du groupe-cours actif
    if (!modeEdition) {
        const profilEnseignant = obtenirProfilEnseignantActifWizard();
        if (profilEnseignant) {
            wizardState.reponses.prenom = profilEnseignant.prenom || '';
            wizardState.reponses.nomAuteur = profilEnseignant.nom || '';
            wizardState.reponses.etablissement = profilEnseignant.institution || '';
            wizardState.reponses.discipline = profilEnseignant.discipline || '';
        }
    }

    // Si édition, charger les données existantes
    if (modeEdition && pratiqueId) {
        chargerPratiqueExistante(pratiqueId);
    }

    // Afficher le modal
    const modal = document.getElementById('modalWizardPratiqueV2');
    if (modal) {
        modal.classList.add('actif');
        afficherEtapeWizardV2(wizardState.etapeActuelle);
    } else {
        console.error('[WizardV2] Modal #modalWizardPratiqueV2 non trouvé');
    }
}

/**
 * 🆕 Beta 95.4 : Obtient le profil de l'enseignant du groupe-cours actif
 * @returns {Object|null} - { prenom, nom, institution, discipline } ou null
 */
function obtenirProfilEnseignantActifWizard() {
    try {
        const trimestreActif = window.trimestreActif || (typeof db !== 'undefined' && db.getSync ? db.getSync('trimestreActif', null) : null);
        if (!trimestreActif) return null;

        const groupesCours = db.getSync(`${trimestreActif}_groupesCours`, []);
        const groupeActif = groupesCours.find(gc => gc.actif);
        if (!groupeActif || !groupeActif.enseignantId) return null;

        const enseignants = db.getSync('enseignants', []);
        const enseignant = enseignants.find(e => e.id === groupeActif.enseignantId);
        if (!enseignant) return null;

        return {
            prenom: enseignant.prenom || '',
            nom: enseignant.nom || '',
            institution: enseignant.institution || '',
            discipline: enseignant.discipline || ''
        };
    } catch (e) {
        console.warn('[WizardV2] Erreur obtention profil enseignant:', e);
        return null;
    }
}

/**
 * Ferme le wizard V2
 */
function fermerWizardV2() {
    const modal = document.getElementById('modalWizardPratiqueV2');
    if (modal) {
        modal.classList.remove('actif');
    }

    // Réinitialiser l'état (ouvrirWizardV2 réécrit etapeActuelle/etapeInitiale selon
    // le mode ; on réaligne sur l'entrée de création par cohérence).
    wizardState.etapeActuelle = 'entree-pratique';
    wizardState.historique = [];
    wizardState.reponses = {};
    wizardState.modeEdition = false;
    wizardState.pratiqueId = null;
    wizardState.grilleDeBase = null;   // lot E1 : abandonner l'assistant n'écrit aucune grille
}

/**
 * Charge une pratique existante pour édition
 * @param {string} pratiqueId - ID de la pratique
 */
function chargerPratiqueExistante(pratiqueId) {
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const pratique = pratiques.find(p => p.id === pratiqueId);

    if (!pratique) {
        console.warn('[WizardV2] Pratique non trouvée:', pratiqueId);
        return;
    }

    // Mapper les données vers les réponses du wizard.
    // Normalisation défensive à la lecture : pratique.type peut être stocké en
    // legacy ('standards'…) dans d'anciennes données ; normaliserIdPratique
    // (registre) le ramène au canonique ('standards'/'specifications'/'sommative').
    // Depuis #319 Lot 1, le flux INTERNE du wizard est canonique de bout en bout :
    // plus de pont de conversion canon→legacy (l'ancienne table interne est retirée).
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(pratique.type) : pratique.type);
    const calcNoteFinaleMap = {
        'sommative': 'moyenne',
        'standards': 'niveaux',
        'specifications': 'acceptable',
        'denotation': 'jugement'   // #319 Lot 5 : sans ça, une DEN retombait sur 'moyenne' → badge SOM
    };

    // CO-01 : recharger l'AUTEUR dans les clés que lit la construction
    // (prenom/nomAuteur) — sinon l'auteur d'origine est remplacé par ce que
    // l'éditeur retape, ou par du vide quand l'étape infos est sautée.
    const morceauxAuteur = (pratique.auteur || '').trim().split(/\s+/).filter(Boolean);

    wizardState.reponses = {
        nom: pratique.nom,
        auteur: pratique.auteur,
        prenom: morceauxAuteur.length > 1 ? morceauxAuteur[0] : '',
        nomAuteur: morceauxAuteur.length > 1 ? morceauxAuteur.slice(1).join(' ') : (morceauxAuteur[0] || ''),
        etablissement: pratique.etablissement,
        description: pratique.description,
        discipline: pratique.discipline,
        typePratique: typeCanon,
        calcNoteFinale: calcNoteFinaleMap[typeCanon] || 'moyenne',
        typeVariante: pratique.variante || null,
        // #903 : les règles retirées ne reviennent ni dans les cases ni dans le récapitulatif ;
        // l'objet enregistré les garde (`conserverReglesRetirees`).
        reglesSommatives: (pratique.reglesSpeciales || pratique.configuration?.reglesSommatives || [])
            .filter(regle => !REGLES_SOMMATIVES_RETIREES.includes(regle)),
        nbEvaluationsPrevues: pratique.nbEvaluationsPrevues || null,
        seuilVaBien: pratique.seuils?.va_bien || null,
        seuilDifficulte: pratique.seuils?.difficulte || null,
        seuilGrandeDifficulte: pratique.seuils?.grande_difficulte || null
    };

    // Ajouter la configuration spécifique
    if (pratique.configuration) {
        const config = pratique.configuration;

        if (typeCanon === 'sommative') {
            // #854 (audit du 16 sept. 2026, constat A-2) — ROUVRIR NE CHANGE PAS UNE RÈGLE.
            // Les valeurs des règles spéciales n'étaient pas relues : ré-enregistrer les
            // ramenait aux défauts (verrou « Dissertation, 90, 50 » → « Analyse finale, 60, 55 »).
            // Condition posée par Grégoire pour brancher le verrou (#897) : une règle appliquée
            // ne change pas à l'insu de l'enseignant·e. (#903 : le remplacement et le
            // plafonnement ne se relisent plus ici — ils passent tels quels à l'enregistrement.)
            for (const regle of (config.conditions_speciales || [])) {
                if (regle && regle.type === 'double_verrou') {
                    wizardState.reponses.nomEvalVerrouillee = regle.condition?.evaluation;
                    wizardState.reponses.seuilVerrou = regle.condition?.seuil;
                    wizardState.reponses.plafondVerrou = regle.consequence?.note_max;
                }
            }
        } else if (typeCanon === 'standards') {
            // Audit du 16 sept. 2026, constat B-2 — L'APPROCHE SE DÉDUIT DU PORTFOLIO.
            // Les gabarits « N meilleures » / « N plus récentes » portent un `portfolio` mais
            // pas d'`approcheEvaluation`. Enregistrer avec une approche absente n'écrit pas le
            // bloc portfolio : la pratique revient sans lui. Mesuré le 17 sept. : DANS LA PAGE,
            // l'étape « Approche d'évaluation » (carte unique pré-cochée, #443) repose la valeur
            // avant l'enregistrement, et le portfolio survivait ; seul un enregistrement qui ne
            // traverse pas l'étape le perdait (le banc de l'audit). La relecture ne dépend plus
            // de cette carte : un portfolio présent EST l'approche par artefacts.
            wizardState.reponses.approcheEvaluation = config.approcheEvaluation
                || (config.portfolio ? 'par-artefacts' : undefined);
            wizardState.reponses.echelleId = config.echelleId;
            wizardState.reponses.grilleId = config.grilleId;

            if (config.portfolio) {
                // #132 : la création écrit les noms standardisés (nombreTotal /
                // nombreARetenir / methodeSelection / minimumCompletion). Relire les
                // anciens noms (nbArtefactsSoumis…) rendait undefined → la config réelle
                // était écrasée par les défauts à la re-sauvegarde. On relit les bons noms.
                wizardState.reponses.utiliserPortfolio = config.portfolio.utiliser;
                wizardState.reponses.nbArtefactsSoumis = config.portfolio.nombreTotal;
                wizardState.reponses.nbArtefactsRetenus = config.portfolio.nombreARetenir;
                wizardState.reponses.minAvantCalculFormatif = config.portfolio.minimumCompletion;
                // Restaurer la méthode de sélection (sinon le round-trip repart sur 'n_meilleurs').
                // L'écriture stocke 'meilleurs' pour le mode 'n_meilleurs' → mapping inverse.
                // B-2 (suite) : la table ignorait le vocabulaire du MOTEUR. `recents` (le gabarit
                // « N plus récentes », et toute pratique d'avant #434) se relisait « N meilleurs ».
                // `recents` = `derniers` (alias, portfolio.js) → l'option « N derniers » de l'écran.
                // `recents-meilleurs` n'a plus d'option depuis #434 : la valeur est GARDÉE telle
                // quelle, et l'écriture la repasse intacte — jamais convertie en silence ici.
                const methodeVersMode = {
                    'meilleurs': 'n_meilleurs', 'tous': 'tous', 'derniers': 'derniers',
                    'recents': 'derniers', 'recents-meilleurs': 'recents-meilleurs'
                };
                // #900 (lot N6) : hybride = catégories actives, comme au moteur et au formulaire de
                // gestion ; `portfolio.hybride` reste lu pour les pratiques qui le portent encore.
                wizardState.reponses.modeSelectionPortfolio = (config.portfolio.hybride || config.categories?.actif)
                    ? 'hybride'
                    : (methodeVersMode[config.portfolio.methodeSelection] || 'n_meilleurs');
            }

            // #443 (10 août 2026) — NORMALISATION d'une pratique legacy « par
            // objectifs », dans la continuité de #396 et #435. L'approche est
            // retirée du wizard : une config stockée qui la porte encore
            // s'ouvre sur sa structure RÉELLE (le portfolio), avec un
            // avertissement console. LECTURE SEULE : rien n'est réécrit tant
            // que l'utilisateur ne sauvegarde pas lui-même — même patron que
            // les normalisations de #396 (registre) et #435
            // (pratiques-gestion.js:1135).
            //
            // ⚠ NE PAS écrire ici le nom du jeton retiré par #396 : sa
            // sentinelle est un cliquet d'ABSENCE qui grep ce fichier en
            // entier, commentaires compris. Une note de bas de page suffit à
            // le faire rougir — c'est arrivé en écrivant celle-ci.
            if (config.approcheEvaluation === 'par-objectifs' || config.objectifs) {
                console.warn('[WizardV2] Approche « par objectifs » retirée (#443) : la pratique « '
                    + (pratique.nom || pratique.id) + ' » s\'ouvre sur le portfolio. '
                    + 'Sa configuration `objectifs` est ignorée, et sera remplacée si tu sauvegardes.');
                wizardState.reponses.approcheEvaluation = 'par-artefacts';
            }
        } else if (typeCanon === 'specifications') {
            // Lot N4 (#854, volet spécifications) — ROUVRIR NE CHANGE RIEN. Sans cette branche, le seuil
            // repassait à 100 et les jetons à « désactivés » au premier enregistrement. Le seuil se lit
            // sous ses deux noms, dans l'ordre du moteur (#935, lot N6) : `seuilAcceptable` (le nom unique),
            // puis `seuilAcceptabilite` (l'assistant d'avant N6). Types et forfaits ne sont pas des réponses
            // de l'assistant : ils passent tels quels à l'enregistrement (`conserverConfigurationSpecifications`).
            const seuil = (typeof config.seuilAcceptable === 'number') ? config.seuilAcceptable : config.seuilAcceptabilite;
            if (seuil !== undefined) wizardState.reponses.seuilAcceptabilite = seuil;
            const jetons = config.jetons || {};
            wizardState.reponses.utiliserJetons = jetons.activer === true;
            if (jetons.activer === true) {
                if (jetons.delai) {
                    wizardState.reponses.nbJetonsDelai = jetons.delai.nombre;
                    wizardState.reponses.dureeDelaiJours = jetons.delai.dureeJours;
                    wizardState.reponses.delaiSurReprise = jetons.delai.surReprise === true;
                }
                if (jetons.reprise) wizardState.reponses.nbJetonsReprise = jetons.reprise.nombre;
            }
            if (config.modeleBundle !== undefined) wizardState.reponses.modeleBundle = config.modeleBundle;
        } else if (typeCanon === 'denotation') {
            // #343 (b) round-trip d'édition DEN : restaurer les cibles, la suggestion, et
            // l'échelle/grille de rétroaction. #717 : les cibles reviennent AVEC leur id.
            if (Array.isArray(config.objectifs)) {
                wizardState.reponses.ciblesDenotation = config.objectifs
                    .filter(o => o && o.id).map(o => ({ id: o.id, nom: o.nom }));
            }
            if (config.suggestion && config.suggestion.methode) {
                wizardState.reponses.methodeSuggestionDen = config.suggestion.methode;
            }
            wizardState.reponses.echelleId = config.echelleId;
            wizardState.reponses.grilleId = config.grilleId;
        }
    }
}


// ============================================================================
// EXPORTS
// ============================================================================

window.ouvrirWizardV2 = ouvrirWizardV2;
window.fermerWizardV2 = fermerWizardV2;
window.etapeSuivanteV2 = etapeSuivanteV2;
window.etapePrecedenteV2 = etapePrecedenteV2;
window.creerPratiqueV2 = creerPratiqueV2;
window.deduireTypePratique = deduireTypePratique;
// Bug testeur 8 juin : exposé pour la sentinelle d'inférence comportementale.
window._etapeApresInference = _etapeApresInference;
window._infererFamilleComportementale = _infererFamilleComportementale;
window.wizardV2GererExclusionCheckbox = wizardV2GererExclusionCheckbox;
window.wizardV2CreerGrilleDemo = wizardV2CreerGrilleDemo;
window.wizardV2VoieRapide = wizardV2VoieRapide;
window.wizardV2RafraichirEtapeCourante = wizardV2RafraichirEtapeCourante;
window.wizardV2ModifierRepereEchelle = wizardV2ModifierRepereEchelle;   // #577
window.ouvrirComparateurDepuisWizard = ouvrirComparateurDepuisWizard;

// Exposés pour la testabilité (#317) : la relecture d'édition (#132) et le
// calcul du nombre d'étapes (#134) sont verrouillés par sentinelles. wizardState
// est exposé pour permettre aux tests de poser les réponses et de lire le résultat.
window.chargerPratiqueExistante = chargerPratiqueExistante;
window.calculerNbEtapes = calculerNbEtapes;
window.calculerProgression = calculerProgression;               // #343-T4b (testabilité de l'invariant total ≥ numéro)
window.obtenirEtapeSuivante = obtenirEtapeSuivante;
window.wizardState = wizardState;
// #319 Lot 3 : testabilité des configs de champs (défaut reprises a3, garde-fou a4).
window.ETAPES_WIZARD = ETAPES_WIZARD;
// #443 — exposé pour la sentinelle : que la définition d'étape porte un
// `default` ne prouve pas que le RENDU pré-coche. Les deux se cassent
// séparément, et seul le rendu compte pour l'utilisateur.
window.genererRadioCards = genererRadioCards;
window.conserverReglesRetirees = conserverReglesRetirees;
window.conserverReglagesSansLecteur = conserverReglagesSansLecteur;
window.calculerExempleConsequence = calculerExempleConsequence; // #319 Lot 4 a8 (testabilité)
window.genererRecapitulatif = genererRecapitulatif;             // #319 Lot 4 a8/a9 (testabilité du rendu)
window.genererContenuEtape = genererContenuEtape;
// #691 l'exposait pour le sélecteur de modèles de pratiques-bibliotheque.js, retiré avec
// lui (#469, 12 oct. 2026, cible absente) ; la pose reste pour les bancs (#577).
window.TYPE_BADGES = TYPE_BADGES;               // #577 (testabilité du rendu d'une étape)
window.afficherEtapeWizardV2 = afficherEtapeWizardV2;           // #577 (spec WebKit : rendre une étape dans le vrai DOM)

})();
