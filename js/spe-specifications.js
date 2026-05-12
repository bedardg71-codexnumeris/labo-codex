/* ===============================
   MODULE PAN-SPÉCIFICATIONS (SPE)
   Créé le 2 janvier 2026

   Basé sur Linda B. Nilson (Specifications Grading)

   Fonctionnalités :
   - Échelle binaire (Acceptable / Non acceptable)
   - Grilles de spécifications (checklists)
   - Compteur de forfaits atteints par étudiant
   - Support des révisions multiples

   =============================== */

(function() {
    'use strict';


    // =========================================================================
    // CONSTANTES SPE
    // =========================================================================

    /**
     * Clés de bibliothèques (réutilisation des constantes existantes)
     */
    const CLE_BIBLIOTHEQUE_GRILLES = 'bibliothequeGrilles';
    const CLE_BIBLIOTHEQUE_PRODUCTIONS = 'bibliothequeProductions';
    const CLE_BIBLIOTHEQUE_ECHELLES = 'bibliothequeEchelles';

    /**
     * ID de l'échelle SPE par défaut
     */
    const ECHELLE_SPE_ID = 'ECHELLE_SPE_BINAIRE';

    /**
     * Configuration de l'échelle SPE binaire
     */
    const ECHELLE_SPE_DEFAUT = {
        id: ECHELLE_SPE_ID,
        nom: '[SPE] Acceptable / Non acceptable',
        type: 'spe-binaire',
        pratiques: ['SPE'],
        description: 'Gabarit SPE : Échelle binaire pour PAN-Spécifications. Conforme aux spécifications = Acceptable.',
        niveaux: [
            {
                code: 'A',
                nom: 'Acceptable',
                description: 'Le travail respecte TOUTES les spécifications.',
                min: 100,
                max: 100,
                couleur: '#28a745',
                valeurNumerique: 1
            },
            {
                code: 'N',
                nom: 'Non acceptable',
                description: 'Le travail ne respecte pas une ou plusieurs spécifications. À réviser.',
                min: 0,
                max: 0,
                couleur: '#dc3545',
                valeurNumerique: 0
            }
        ],
        config: {
            seuilReussite: 100,
            typeEchelle: 'spe-binaire'
        },
        dansBibliotheque: true,
        estGabarit: true,
        gabaritType: 'SPE',
        systeme: true, // Marqueur pour échelle système (non supprimable)
        dateCreation: '2026-01-02T00:00:00.000Z'
    };

    /**
     * Spécifications exemple pour une prise de position
     * DOIT être défini AVANT GRILLE_SPE_GABARIT
     */
    const EXEMPLE_SPECIFICATIONS_PRISE_POSITION = [
        'La prise de position équivaut à environ 750 mots (hors bibliographie et annexes)',
        'Au moins deux sources fiables sont convenablement citées',
        'Des faits établis sont tirés des sources fiables et servent à étayer les arguments principaux',
        'Le texte présente une structure claire (introduction, développement, conclusion)',
        'L\'orthographe et la grammaire sont correctes'
    ];

    /**
     * Gabarit de grille de spécifications
     */
    const GRILLE_SPE_GABARIT = {
        id: 'GRILLE_SPE_GABARIT_PRISE_POSITION',
        nom: '[SPE] Gabarit - Prise de position',
        type: 'specifications',
        typeSPE: true,
        estGabarit: true,
        gabaritType: 'SPE',
        pratiques: ['SPE'],
        description: 'Gabarit SPE : Grille de spécifications pour une prise de position écrite.',
        criteres: EXEMPLE_SPECIFICATIONS_PRISE_POSITION.map((spec, index) => ({
            id: 'crit_' + (index + 1),
            nom: spec,
            description: '',
            obligatoire: true,
            type: 'checkbox'
        })),
        dateCreation: '2026-01-02T00:00:00.000Z',
        auteur: 'Labo Codex',
        dansBibliotheque: true
    };

    /**
     * Gabarit de production SPE
     */
    const PRODUCTION_SPE_GABARIT = {
        id: 'PROD_SPE_GABARIT_PRISE_POSITION',
        titre: '[SPE] Gabarit - Prise de position',
        type: 'specifications',
        estGabarit: true,
        gabaritType: 'SPE',
        pratiques: ['SPE'],
        description: 'Gabarit SPE : Production de type "Prise de position" pour notation par spécifications. L\'étudiant prend position sur un enjeu lié à son domaine.',
        consignes: 'Prends position de façon éclairée par rapport à un enjeu scientifique ou technologique qui traverse un métier qui t\'intéresse.',
        ponderation: 0,
        dateCreation: '2026-01-02T00:00:00.000Z',
        auteur: 'Labo Codex',
        dansBibliotheque: true
    };

    /**
     * Gabarits supplémentaires SPE
     */
    const GABARITS_GRILLES_SPE = [
        // Grille pour Portfolio
        {
            id: 'GRILLE_SPE_GABARIT_PORTFOLIO',
            nom: '[SPE] Gabarit - Portfolio',
            type: 'specifications',
            typeSPE: true,
            estGabarit: true,
            gabaritType: 'SPE',
            pratiques: ['SPE'],
            description: 'Gabarit SPE : Portfolio des activités d\'apprentissage avec entrevue finale.',
            criteres: [
                { id: 'crit_1', nom: 'Le portfolio contient au moins 5 entrées réflexives', obligatoire: true, type: 'checkbox' },
                { id: 'crit_2', nom: 'Chaque entrée est datée et identifie l\'activité concernée', obligatoire: true, type: 'checkbox' },
                { id: 'crit_3', nom: 'Les réflexions démontrent une progression dans l\'apprentissage', obligatoire: true, type: 'checkbox' },
                { id: 'crit_4', nom: 'L\'étudiant peut expliquer ses choix lors de l\'entrevue', obligatoire: true, type: 'checkbox' }
            ],
            dateCreation: '2026-01-02T00:00:00.000Z',
            auteur: 'Labo Codex',
            dansBibliotheque: true
        },
        // Grille pour Présentation orale
        {
            id: 'GRILLE_SPE_GABARIT_ORAL',
            nom: '[SPE] Gabarit - Présentation orale',
            type: 'specifications',
            typeSPE: true,
            estGabarit: true,
            gabaritType: 'SPE',
            pratiques: ['SPE'],
            description: 'Gabarit SPE : Explication orale d\'une découverte ou d\'un concept.',
            criteres: [
                { id: 'crit_1', nom: 'La présentation respecte le temps alloué (±10%)', obligatoire: true, type: 'checkbox' },
                { id: 'crit_2', nom: 'Le sujet est clairement expliqué et compréhensible', obligatoire: true, type: 'checkbox' },
                { id: 'crit_3', nom: 'Au moins une source est citée pour appuyer les propos', obligatoire: true, type: 'checkbox' },
                { id: 'crit_4', nom: 'L\'étudiant peut répondre aux questions de base', obligatoire: true, type: 'checkbox' }
            ],
            dateCreation: '2026-01-02T00:00:00.000Z',
            auteur: 'Labo Codex',
            dansBibliotheque: true
        }
    ];

    /**
     * Table de correspondance forfaits par défaut
     * Note finale basée sur le nombre de travaux acceptables
     */
    const TABLE_FORFAITS_DEFAUT = {
        description: 'Table de correspondance travaux-note finale',
        noteEchec: 50,
        forfaits: [
            { lettre: 'A', note: 90, travaux: { prisePosition: 3, portfolio: 1, test: 2, oral: 1 } },
            { lettre: 'B', note: 80, travaux: { prisePosition: 2, portfolio: 1, test: 2, oral: 1 } },
            { lettre: 'C', note: 60, travaux: { prisePosition: 1, portfolio: 0, test: 2, oral: 0 } }
        ]
    };

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise le module SPE
     * - Crée les gabarits SPE dans les bibliothèques
     * - Configure les événements
     */
    async function initialiserModuleSPE() {

        // Créer les gabarits SPE dans les bibliothèques
        await creerGabaritsSPE();

        // Initialiser le compteur si on est en mode SPE
        const modalites = db.getSync('modalitesEvaluation') || {};
        if (modalites.pratique === 'pan-specifications') {
        }

    }

    /**
     * Crée tous les gabarits SPE dans les bibliothèques si inexistants
     */
    async function creerGabaritsSPE() {
        await creerEchelleSPESiInexistante();
        await creerGrilleSPESiInexistante();
        await creerProductionSPESiInexistante();
    }

    /**
     * Crée l'échelle SPE binaire si elle n'existe pas déjà
     */
    async function creerEchelleSPESiInexistante() {
        // Ajouter à la bibliothèque partagée (clé correcte)
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_ECHELLES) || [];

        // Vérifier si l'échelle SPE existe déjà
        const echelleSPE = bibliotheque.find(e => e.id === ECHELLE_SPE_ID);

        if (!echelleSPE) {
            bibliotheque.push({ ...ECHELLE_SPE_DEFAUT });
            await db.set(CLE_BIBLIOTHEQUE_ECHELLES, bibliotheque);
        }
    }

    /**
     * Crée tous les gabarits de grilles SPE si inexistants
     */
    async function creerGrilleSPESiInexistante() {
        // Ajouter à la bibliothèque partagée
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE_GRILLES) || [];
        let nbAjoutees = 0;

        // Gabarit principal (Prise de position)
        if (!bibliotheque.find(g => g.id === GRILLE_SPE_GABARIT.id)) {
            bibliotheque.push({ ...GRILLE_SPE_GABARIT });
            nbAjoutees++;
        }

        // Gabarits supplémentaires (Portfolio, Test, Oral)
        for (const gabarit of GABARITS_GRILLES_SPE) {
            if (!bibliotheque.find(g => g.id === gabarit.id)) {
                bibliotheque.push({ ...gabarit });
                nbAjoutees++;
            }
        }

        if (nbAjoutees > 0) {
            await db.set(CLE_BIBLIOTHEQUE_GRILLES, bibliotheque);
        }
    }

    /**
     * Crée le gabarit de production SPE si inexistant
     */
    async function creerProductionSPESiInexistante() {
        // Ajouter à la bibliothèque partagée des productions
        const bibliotheque = await db.get(CLE_BIBLIOTHEQUE_PRODUCTIONS) || [];
        const existe = bibliotheque.find(p => p.id === PRODUCTION_SPE_GABARIT.id);

        if (!existe) {
            bibliotheque.push({ ...PRODUCTION_SPE_GABARIT });
            await db.set(CLE_BIBLIOTHEQUE_PRODUCTIONS, bibliotheque);
        }
    }

    // =========================================================================
    // GRILLE DE SPÉCIFICATIONS (CHECKLIST)
    // =========================================================================

    /**
     * Structure d'une grille de spécifications
     * Différente d'une grille classique : pas de niveaux, juste des cases à cocher
     */
    function creerGrilleSpecifications(nom, specifications) {
        return {
            id: genererIdUnique('GRILLE_SPE_'),
            nom: nom,
            type: 'specifications',
            description: 'Grille de spécifications pour PAN-SPE',
            specifications: specifications.map((spec, index) => ({
                id: 'spec_' + (index + 1),
                texte: spec,
                obligatoire: true
            })),
            dateCreation: new Date().toISOString()
        };
    }

    // =========================================================================
    // ÉVALUATION SPE
    // =========================================================================

    /**
     * Évalue une production en mode SPE
     * @param {Array} specificationsRespectees - Array de booleans (true = respectée)
     * @returns {Object} { acceptable: boolean, nbRespectees: number, nbTotal: number }
     */
    function evaluerProductionSPE(specificationsRespectees) {
        const nbTotal = specificationsRespectees.length;
        const nbRespectees = specificationsRespectees.filter(s => s === true).length;
        const acceptable = nbRespectees === nbTotal;

        return {
            acceptable: acceptable,
            niveau: acceptable ? 'A' : 'N',
            niveauNom: acceptable ? 'Acceptable' : 'Non acceptable',
            nbRespectees: nbRespectees,
            nbTotal: nbTotal,
            pourcentage: nbTotal > 0 ? Math.round((nbRespectees / nbTotal) * 100) : 0
        };
    }

    // =========================================================================
    // COMPTEUR DE FORFAITS
    // =========================================================================

    /**
     * Calcule le forfait atteint par un étudiant
     * @param {string} etudiantDA - Numéro de dossier de l'étudiant
     * @returns {Object} { forfaitAtteint, detailParType, noteFinale }
     */
    async function calculerForfaitEtudiant(etudiantDA) {
        const modalites = db.getSync('modalitesEvaluation') || {};
        const specifications = modalites.specifications || {};
        const typesTravaux = specifications.typesTravaux || [];
        const forfaits = specifications.forfaits || [];

        // Récupérer les évaluations de l'étudiant
        // 🆕 FIX (9 jan 2026): Namespacing par trimestre via cle()
        const evaluations = await db.get(cle('evaluationsSauvegardees')) || [];
        const evalsEtudiant = evaluations.filter(e =>
            e.etudiantDA === etudiantDA &&
            e.statutRemise !== 'non-remis'
        );

        // Compter les productions acceptables par type
        const compteurParType = {};
        typesTravaux.forEach(type => {
            compteurParType[type.id] = 0;
        });

        // Pour chaque évaluation, déterminer si acceptable et quel type
        for (const evalItem of evalsEtudiant) {
            // Trouver le type de production
            const production = await obtenirProductionParId(evalItem.productionId);
            if (!production) continue;

            // Trouver le type correspondant
            const typeProd = typesTravaux.find(t =>
                t.nom === production.titre ||
                t.productionId === production.id
            );
            if (!typeProd) continue;

            // Vérifier si l'évaluation est acceptable
            const estAcceptable = verifierEvaluationAcceptable(evalItem);
            if (estAcceptable) {
                compteurParType[typeProd.id] = (compteurParType[typeProd.id] || 0) + 1;
            }
        }

        // Déterminer le forfait atteint
        // Trier les forfaits par note décroissante
        const forfaitsTries = [...forfaits].sort((a, b) => b.note - a.note);

        let forfaitAtteint = null;
        for (const forfait of forfaitsTries) {
            let toutesConditionsRemplies = true;

            for (const typeId in forfait.travaux) {
                const nbRequis = forfait.travaux[typeId] || 0;
                const nbAtteint = compteurParType[typeId] || 0;

                if (nbAtteint < nbRequis) {
                    toutesConditionsRemplies = false;
                    break;
                }
            }

            if (toutesConditionsRemplies) {
                forfaitAtteint = forfait;
                break; // Premier forfait satisfait (le plus élevé)
            }
        }

        return {
            forfaitAtteint: forfaitAtteint,
            forfaitLettre: forfaitAtteint ? forfaitAtteint.lettre : 'Aucun',
            noteFinale: forfaitAtteint ? forfaitAtteint.note : (specifications.noteEchec || 50),
            detailParType: compteurParType,
            typesTravaux: typesTravaux
        };
    }

    /**
     * Vérifie si une évaluation est "Acceptable" en SPE
     */
    function verifierEvaluationAcceptable(evaluation) {
        // Si on a une note finale de 100% → Acceptable
        if (evaluation.noteFinale >= 100) return true;

        // Si on a un niveau 'A' → Acceptable
        if (evaluation.niveauFinal === 'A' || evaluation.niveauFinal === 'Acceptable') return true;

        // Si tous les critères sont cochés (pour évaluation par checklist)
        if (evaluation.criteres && Array.isArray(evaluation.criteres)) {
            const tousCoches = evaluation.criteres.every(c =>
                c.respecte === true || c.niveau === 'A' || c.valeur === 100
            );
            if (tousCoches) return true;
        }

        return false;
    }

    /**
     * Obtient une production par son ID
     */
    async function obtenirProductionParId(productionId) {
        const productions = await db.get(cle('productions')) || [];
        return productions.find(p => p.id === productionId);
    }

    // =========================================================================
    // AFFICHAGE TABLEAU DE BORD SPE
    // =========================================================================

    /**
     * Génère le HTML du tableau de bord SPE pour un étudiant
     */
    async function genererTableauBordSPE(etudiantDA) {
        const resultat = await calculerForfaitEtudiant(etudiantDA);

        let html = `
            <div class="spe-dashboard" style="padding: 15px; background: var(--gris-tres-pale); border-radius: 8px; margin: 10px 0;">
                <h4 style="margin: 0 0 15px 0; color: var(--accent-primaire);">
                    Progression PAN-Spécifications
                </h4>

                <!-- Forfait atteint -->
                <div style="
                    background: ${resultat.forfaitAtteint ? 'var(--alerte-fond-succes, #d4edda)' : 'var(--alerte-fond-attention)'};
                    border: 2px solid ${resultat.forfaitAtteint ? 'var(--vert-succes)' : 'var(--btn-annuler)'};
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    margin-bottom: 15px;
                ">
                    <div style="font-size: 2rem; font-weight: bold;">
                        ${resultat.forfaitLettre}
                    </div>
                    <div style="font-size: 1.5rem; color: var(--gris-moyen);">
                        ${resultat.noteFinale}%
                    </div>
                </div>

                <!-- Détail par type -->
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--bleu-tres-pale);">
                            <th style="padding: 8px; text-align: left;">Type de production</th>
                            <th style="padding: 8px; text-align: center;">Acceptables</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        resultat.typesTravaux.forEach(type => {
            const nbAcceptables = resultat.detailParType[type.id] || 0;
            html += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid var(--bordure-claire);">${type.nom}</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid var(--bordure-claire);">
                        <span style="
                            background: ${nbAcceptables > 0 ? 'var(--vert-succes)' : 'var(--gris-moyen)'};
                            color: white;
                            padding: 2px 10px;
                            border-radius: 12px;
                            font-weight: bold;
                        ">${nbAcceptables}</span>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    /**
     * Génère le tableau récapitulatif de tous les étudiants en mode SPE
     */
    async function genererRecapitulatifClasseSPE() {
        const etudiants = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('groupeEtudiants')
            : db.getSync(cle('groupeEtudiants'), []);
        const modalites = db.getSync('modalitesEvaluation') || {};
        const specifications = modalites.specifications || {};
        const typesTravaux = specifications.typesTravaux || [];
        const forfaits = specifications.forfaits || [];

        let html = `
            <div class="spe-recap-classe" style="overflow-x: auto;">
                <table class="tableau" style="width: 100%; min-width: 600px;">
                    <thead>
                        <tr>
                            <th>Étudiant</th>
        `;

        // En-têtes des types de productions
        typesTravaux.forEach(type => {
            html += `<th style="text-align: center;">${type.nom}</th>`;
        });

        html += `
                            <th style="text-align: center;">Forfait</th>
                            <th style="text-align: center;">Note</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Ligne par étudiant
        for (const etudiant of etudiants) {
            const resultat = await calculerForfaitEtudiant(etudiant.da);

            html += `
                <tr>
                    <td>${etudiant.prenom} ${etudiant.nom}</td>
            `;

            typesTravaux.forEach(type => {
                const nb = resultat.detailParType[type.id] || 0;
                html += `
                    <td style="text-align: center;">
                        <span class="badge-spe ${nb > 0 ? 'acceptable' : ''}">${nb}</span>
                    </td>
                `;
            });

            html += `
                    <td style="text-align: center; font-weight: bold;">
                        ${resultat.forfaitLettre}
                    </td>
                    <td style="text-align: center;">
                        ${resultat.noteFinale}%
                    </td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    // =========================================================================
    // INTERFACE ÉVALUATION CHECKLIST
    // =========================================================================

    /**
     * Génère l'interface d'évaluation checklist pour SPE
     * @param {Array} specifications - Liste des spécifications
     * @param {Object} evaluationExistante - Évaluation existante (optionnel)
     */
    function genererInterfaceChecklistSPE(specifications, evaluationExistante = null) {
        const resultatsExistants = evaluationExistante?.criteres || [];

        let html = `
            <div class="spe-checklist" style="margin: 15px 0;">
                <h5 style="margin-bottom: 10px; color: var(--accent-primaire);">
                    Spécifications à vérifier
                </h5>
                <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 15px;">
                    Coche chaque spécification respectée. Le travail est <strong>Acceptable</strong>
                    uniquement si TOUTES les spécifications sont cochées.
                </p>
        `;

        specifications.forEach((spec, index) => {
            const existant = resultatsExistants.find(r => r.id === spec.id);
            const estCoche = existant ? existant.respecte : false;

            html += `
                <div class="spe-spec-item" style="
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px;
                    background: ${estCoche ? 'var(--alerte-fond-succes, #d4edda)' : '#fff'};
                    border: 1px solid ${estCoche ? 'var(--vert-succes)' : 'var(--bordure-claire)'};
                    border-radius: 6px;
                    margin-bottom: 8px;
                    transition: all 0.2s;
                ">
                    <input type="checkbox"
                           id="spec_${spec.id}"
                           class="spe-checkbox"
                           ${estCoche ? 'checked' : ''}
                           data-on-change="_mettreAJourSpecSPEChange" data-param="${spec.id}"
                           style="
                               width: 20px;
                               height: 20px;
                               margin-top: 2px;
                               cursor: pointer;
                           ">
                    <label for="spec_${spec.id}" style="cursor: pointer; flex: 1;">
                        ${spec.texte}
                    </label>
                </div>
            `;
        });

        html += `
                <div id="spe-resultat" class="spe-resultat" style="
                    margin-top: 15px;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                ">
                    <!-- Mis à jour dynamiquement -->
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Met à jour une spécification et recalcule le résultat
     */
    function mettreAJourSpecSPE(specId, estCoche) {
        // Mettre à jour le style visuel
        const checkbox = document.getElementById('spec_' + specId);
        if (checkbox) {
            const container = checkbox.closest('.spe-spec-item');
            if (container) {
                container.style.background = estCoche ? 'var(--alerte-fond-succes, #d4edda)' : '#fff';
                container.style.borderColor = estCoche ? 'var(--vert-succes)' : 'var(--bordure-claire)';
            }
        }

        // Recalculer le résultat
        recalculerResultatSPE();
    }

    /**
     * Recalcule et affiche le résultat de l'évaluation SPE
     */
    function recalculerResultatSPE() {
        const checkboxes = document.querySelectorAll('.spe-checkbox');
        const total = checkboxes.length;
        const coches = Array.from(checkboxes).filter(c => c.checked).length;
        const acceptable = coches === total;

        const resultatDiv = document.getElementById('spe-resultat');
        if (resultatDiv) {
            resultatDiv.style.background = acceptable ? 'var(--alerte-fond-succes, #d4edda)' : 'var(--alerte-fond-erreur, #f8d7da)';
            resultatDiv.style.border = `2px solid ${acceptable ? 'var(--vert-succes)' : 'var(--rouge-erreur)'}`;
            resultatDiv.innerHTML = `
                <div style="color: ${acceptable ? 'var(--vert-succes)' : 'var(--rouge-erreur)'};">
                    ${acceptable ? '✓ ACCEPTABLE' : '✗ NON ACCEPTABLE'}
                </div>
                <div style="font-size: 0.9rem; font-weight: normal; color: var(--gris-moyen); margin-top: 5px;">
                    ${coches} / ${total} spécifications respectées
                </div>
            `;
        }

        // Mettre à jour les champs cachés pour sauvegarde
        const noteFinale = document.getElementById('noteProduction1');
        const niveauFinal = document.getElementById('niveauProduction1');
        if (noteFinale) noteFinale.textContent = acceptable ? '100' : '0';
        if (niveauFinal) niveauFinal.textContent = acceptable ? 'Acceptable' : 'Non acceptable';
    }

    // =========================================================================
    // CRÉATION DE GRILLE DE SPÉCIFICATIONS
    // =========================================================================

    /**
     * Ouvre le modal de création d'une grille de spécifications
     */
    function creerGrilleSpecificationsSPE() {
        const modalites = db.getSync('modalitesEvaluation') || {};
        const specifications = modalites.specifications || {};
        const typesTravaux = specifications.typesTravaux || [];

        let optionsTypes = '<option value="">-- Sélectionner --</option>';
        typesTravaux.forEach(type => {
            optionsTypes += `<option value="${echapperHtml(type.id)}">${echapperHtml(type.nom)}</option>`;
        });

        const html = `
            <div id="modalCreerGrilleSPE" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: var(--surface-conteneur, #162c36);
                    border-radius: 8px;
                    padding: 30px;
                    max-width: 700px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: var(--accent-primaire);">
                            Créer une grille de spécifications
                        </h3>
                        <button data-action="fermerModalGrilleSPE" style="
                            background: none;
                            border: none;
                            font-size: 1.5rem;
                            cursor: pointer;
                            color: var(--gris-moyen);
                        "><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                    </div>

                    <!-- Explications -->
                    <div style="background: var(--bleu-pale); padding: 12px; border-radius: 6px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 0.9rem;">
                            <strong>Comment ça marche ?</strong><br>
                            Une grille de spécifications contient les critères que le travail doit respecter.
                            Si <strong>tous</strong> les critères sont cochés → le travail est <span style="color: var(--vert-succes);">Acceptable</span>.
                            Sinon → <span style="color: var(--rouge-erreur);">Non acceptable</span> (à réviser).
                        </p>
                    </div>

                    <form id="formGrilleSPE">
                        <!-- Nom de la grille -->
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: 500; display: block; margin-bottom: 5px;">
                                Nom de la grille :
                            </label>
                            <input type="text" id="spe-grille-nom" class="form-control"
                                   placeholder="Ex: Spécifications - Prise de position"
                                   required>
                        </div>

                        <!-- Type de production associé -->
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: 500; display: block; margin-bottom: 5px;">
                                Type de production associé (optionnel) :
                            </label>
                            <select id="spe-grille-type" class="form-control">
                                ${optionsTypes}
                            </select>
                        </div>

                        <!-- Liste des spécifications -->
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: 500; display: block; margin-bottom: 5px;">
                                Spécifications (une par ligne) :
                            </label>
                            <textarea id="spe-grille-specs" class="form-control" rows="8"
                                      placeholder="Le travail contient au moins 500 mots
Au moins 2 sources sont citées correctement
L'orthographe et la grammaire sont correctes
La structure est claire (intro, développement, conclusion)"></textarea>
                            <small class="text-muted">
                                Conseil : Formulez chaque spécification de façon observable et vérifiable.
                            </small>
                        </div>

                        <!-- Gabarit exemple -->
                        <div style="margin-bottom: 20px;">
                            <button type="button" class="btn btn-secondaire" data-action="chargerExempleSpecificationsSPE">
                                Charger un exemple (Prise de position)
                            </button>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondaire" data-action="fermerModalGrilleSPE">
                                Annuler
                            </button>
                            <button type="submit" class="btn btn-principal">
                                Créer la grille
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        // Gestionnaire de soumission
        document.getElementById('formGrilleSPE').addEventListener('submit', async function(e) {
            e.preventDefault();
            await sauvegarderGrilleSPE();
        });
    }

    /**
     * Charge l'exemple de spécifications (Prise de position)
     */
    function chargerExempleSpecificationsSPE() {
        const textarea = document.getElementById('spe-grille-specs');
        if (textarea) {
            textarea.value = EXEMPLE_SPECIFICATIONS_PRISE_POSITION.join('\n');
        }

        const nomInput = document.getElementById('spe-grille-nom');
        if (nomInput && !nomInput.value) {
            nomInput.value = 'Spécifications - Prise de position';
        }
    }

    /**
     * Ferme le modal de création de grille SPE
     */
    function fermerModalGrilleSPE() {
        const modal = document.getElementById('modalCreerGrilleSPE');
        if (modal) modal.remove();
    }

    /**
     * Sauvegarde la grille de spécifications
     */
    async function sauvegarderGrilleSPE() {
        const nom = document.getElementById('spe-grille-nom').value.trim();
        const typeId = document.getElementById('spe-grille-type').value;
        const specsText = document.getElementById('spe-grille-specs').value.trim();

        if (!nom) {
            alert('Veuillez entrer un nom pour la grille.');
            return;
        }

        if (!specsText) {
            alert('Veuillez entrer au moins une spécification.');
            return;
        }

        // Parser les spécifications (une par ligne)
        const specs = specsText.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (specs.length === 0) {
            alert('Veuillez entrer au moins une spécification.');
            return;
        }

        // Créer la grille
        const nouvelleGrille = {
            id: genererIdUnique('GRILLE_SPE_'),
            nom: nom,
            type: 'specifications',
            typeSPE: true,
            typeProductionId: typeId || null,
            description: `Grille de spécifications pour PAN-SPE (${specs.length} critères)`,
            criteres: specs.map((spec, index) => ({
                id: 'crit_' + (index + 1),
                nom: spec,
                description: '',
                obligatoire: true,
                type: 'checkbox' // Type spécial pour SPE
            })),
            dateCreation: new Date().toISOString(),
            auteur: 'Utilisateur',
            dansBibliotheque: true
        };

        // Sauvegarder dans les grilles (clé globale grillesTemplates)
        let grilles = await db.get('grillesTemplates') || [];
        grilles.push(nouvelleGrille);
        await db.set('grillesTemplates', grilles);

        // Ajouter aussi à la bibliothèque partagée
        if (typeof ajouterGrilleALaBibliotheque === 'function') {
            await ajouterGrilleALaBibliotheque(nouvelleGrille);
        }

        fermerModalGrilleSPE();
        alert(`Grille "${nom}" créée avec succès !\n\n${specs.length} spécification(s) ajoutée(s).\n\nTu peux maintenant l'utiliser pour évaluer tes productions.`);

    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.initialiserModuleSPE = initialiserModuleSPE;
    window.creerEchelleSPESiInexistante = creerEchelleSPESiInexistante;
    window.ECHELLE_SPE_ID = ECHELLE_SPE_ID;
    window.ECHELLE_SPE_DEFAUT = ECHELLE_SPE_DEFAUT;

    // Évaluation
    window.evaluerProductionSPE = evaluerProductionSPE;
    window.verifierEvaluationAcceptable = verifierEvaluationAcceptable;
    window.calculerForfaitEtudiant = calculerForfaitEtudiant;

    // Interface checklist
    window.genererInterfaceChecklistSPE = genererInterfaceChecklistSPE;
    window.mettreAJourSpecSPE = mettreAJourSpecSPE;
    window.recalculerResultatSPE = recalculerResultatSPE;

    // Tableaux de bord
    window.genererTableauBordSPE = genererTableauBordSPE;
    window.genererRecapitulatifClasseSPE = genererRecapitulatifClasseSPE;

    // Grilles de spécifications
    window.creerGrilleSpecifications = creerGrilleSpecifications;
    window.EXEMPLE_SPECIFICATIONS_PRISE_POSITION = EXEMPLE_SPECIFICATIONS_PRISE_POSITION;

    // Création de grilles SPE
    window.creerGrilleSpecificationsSPE = creerGrilleSpecificationsSPE;
    window.chargerExempleSpecificationsSPE = chargerExempleSpecificationsSPE;
    window.fermerModalGrilleSPE = fermerModalGrilleSPE;

    // Wrapper pour data-on-change : lit el.checked et appelle mettreAJourSpecSPE(specId, checked)
    window._mettreAJourSpecSPEChange = function(specId, el) {
        mettreAJourSpecSPE(specId, el.checked);
    };
    window.sauvegarderGrilleSPE = sauvegarderGrilleSPE;

    // Gabarits SPE
    window.GRILLE_SPE_GABARIT = GRILLE_SPE_GABARIT;
    window.GABARITS_GRILLES_SPE = GABARITS_GRILLES_SPE;
    window.PRODUCTION_SPE_GABARIT = PRODUCTION_SPE_GABARIT;
    window.TABLE_FORFAITS_DEFAUT = TABLE_FORFAITS_DEFAUT;
    window.creerGabaritsSPE = creerGabaritsSPE;

    // =========================================================================
    // INITIALISATION AU CHARGEMENT
    // =========================================================================

    let speInitialise = false;

    async function tentativeInitSPE() {
        if (speInitialise) return;

        // Vérifier que db est disponible et prêt
        if (typeof db === 'undefined') {
            return;
        }

        // Tester si db fonctionne
        try {
            await db.get('test_spe');
            speInitialise = true;
            await initialiserModuleSPE();
        } catch (e) {
        }
    }

    // Essayer plusieurs stratégies d'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tentativeInitSPE);
    } else {
        // DOM déjà chargé, essayer immédiatement
        setTimeout(tentativeInitSPE, 100);
    }

    // Écouter aussi db-ready au cas où
    document.addEventListener('db-ready', tentativeInitSPE);

    // Et window.onload comme fallback
    window.addEventListener('load', () => setTimeout(tentativeInitSPE, 500));


})();
