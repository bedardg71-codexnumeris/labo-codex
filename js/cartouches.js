/* ===============================
   MODULE 07: CARTOUCHES DE RÉTROACTION
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère les cartouches de rétroaction basées sur
   les grilles de critères et les échelles de performance.
   
   Contenu de ce module:
   - Création et gestion des cartouches
   - Matrice de commentaires (critères × niveaux)
   - Import/export de commentaires
   - Génération d'aperçus aléatoires
   - Verrouillage et duplication
   - Calcul du pourcentage de complétion
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, cartoucheActuel
   - 05-grilles.js : Pour récupérer les grilles de critères
   - 06-echelles.js : Pour récupérer les niveaux de performance
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #selectGrilleRetroaction : Select pour choisir la grille
   - #selectCartouche : Select pour choisir/créer cartouche
   - #nomCartouche : Input pour le nom
   - #contexteCartouche : Textarea pour le contexte
   - #matriceContainer : Conteneur de la matrice
   - #matriceRetroaction : Conteneur global de la matrice
   - #listeCartouchesExistants : Conteneur liste
   - #listeCartouchesContainer : Liste des cartouches
   - #zoneImportCommentaires : Zone d'import
   - #commentairesColles : Textarea d'import
   - #nbCriteres, #nbNiveaux, #nbCommentaires, #pctComplete : Métriques
   
   LocalStorage utilisé:
   - 'cartouches_{grilleId}' : Array des cartouches par grille
   - 'grillesTemplates' : Array des grilles (lecture)
   - 'niveauxEchelle' : Array des niveaux (lecture)
   =============================== */

/* ===============================
   🔧 FONCTION HELPER ROBUSTE
   =============================== */

/**
 * Récupère les cartouches d'une grille de manière robuste
 * Gère le cas où les cartouches sont stockées comme objet unique au lieu de tableau
 * (Corrige un bug avec pack-demarrage-complet.json)
 *
 * @param {string} grilleId - L'ID de la grille
 * @returns {Promise<Array>} - Tableau des cartouches (toujours un tableau)
 */
async function obtenirCartouchesGrille(grilleId) {
    let cartouches = await db.get(`cartouches_${grilleId}`) || [];

    // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
    // Le pack-demarrage peut stocker un objet au lieu d'un tableau
    if (cartouches && !Array.isArray(cartouches)) {
        cartouches = [cartouches];
        // Optionnel: Corriger le stockage pour les prochaines fois
        await db.set(`cartouches_${grilleId}`, cartouches);
    }

    return cartouches;
}

/* ===============================
   ✅ AJOUT (28 janvier 2026) : DÉTECTION DES DOUBLONS
   Fonctions pour identifier les cartouches avec des noms similaires
   =============================== */

/**
 * Générer un badge de source pour une cartouche
 * @param {Object} cartouche - La cartouche
 * @param {Array} cartouchesLocales - Cartouches locales pour vérifier la source
 * @returns {string} HTML du badge
 */
function genererBadgeSourceCartouche(cartouche, cartouchesLocales) {
    return BibliothequeUI.genererBadgeSource(cartouche, cartouchesLocales);
}

function genererIdCourtCartouche(id) {
    return BibliothequeUI.genererIdCourt(id);
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module des cartouches de rétroaction
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge les grilles dans le select
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
async function initialiserModuleCartouches() {
    // Vérifier que nous sommes dans la bonne section
    const listeBanque = document.getElementById('listeCartouchesBanque');
    if (!listeBanque) {
        return;
    }

    // NOUVELLE INTERFACE (Beta 80.2): Banque + import unifiés
    await chargerFiltreGrillesCartouche();
    await afficherBanqueCartouches();

    // Charger aussi l'ancien système pour compatibilité interne (caché)
    const selectGrille = document.getElementById('selectGrilleRetroaction');
    if (selectGrille) {
        await chargerSelectGrillesRetroaction();
    }

    // Gestionnaire d'événements pour le bouton d'export global (Beta 92 - fix async)
    const btnExporter = document.getElementById('btnExporterToutesCartouches');
    if (btnExporter) {
        btnExporter.addEventListener('click', async function(e) {
            e.preventDefault();
            await exporterCartouches();
        });
    }

    // Note: Export/Import se font maintenant via la bibliothèque (8 décembre 2025)

    // ✅ AJOUT (8 décembre 2025) : Migration pour ajouter le flag dansBibliotheque
    await migrerCartouchesVersBibliotheque();

    // ✅ AJOUT (3 janvier 2026) : Assurer présence de la cartouche générique
    await assurerCartoucheGenerique();

}

/**
 * Assure la présence de la cartouche générique dans la bibliothèque
 * Facilite la compréhension du système pour les nouveaux utilisateurs
 */
async function assurerCartoucheGenerique() {
    // Vérifier que la grille générique existe
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grilleGenerique = grilles.find(g => g.id === 'GRILLE_GENERIQUE');
    if (!grilleGenerique) return;

    // Vérifier si la cartouche générique existe déjà ou a été supprimée volontairement
    const cartouches = await db.get('cartouches_GRILLE_GENERIQUE') || [];
    const existe = cartouches.some(c => c.id === 'CART_GENERIQUE');
    if (existe || window.estRessourceSupprimee('CART_GENERIQUE')) return;

    const cartoucheGenerique = {
        id: 'CART_GENERIQUE',
        nom: 'Cartouche générique (exemple)',
        grilleId: 'GRILLE_GENERIQUE',
        echelleId: 'ECHELLE_GENERIQUE',
        contexte: 'Exemple de cartouche de rétroaction - Modifie ou duplique selon tes besoins',
        criteres: [
            { id: 'CR_COMPREHENSION', nom: 'Compréhension' },
            { id: 'CR_APPLICATION', nom: 'Application' },
            { id: 'CR_ANALYSE', nom: 'Analyse' },
            { id: 'CR_SYNTHESE', nom: 'Synthèse' }
        ],
        niveaux: [
            { code: 'I', nom: 'Incomplet' },
            { code: 'D', nom: 'en Développement' },
            { code: 'M', nom: 'Maîtrisé' },
            { code: 'E', nom: 'Étendu' }
        ],
        commentaires: {
            'CR_COMPREHENSION_I': 'La compréhension du sujet reste insuffisante. Revois les concepts de base.',
            'CR_COMPREHENSION_D': 'Tu saisis les grandes lignes, mais certains aspects restent flous.',
            'CR_COMPREHENSION_M': 'Bonne compréhension du sujet et de ses enjeux.',
            'CR_COMPREHENSION_E': 'Excellente compréhension, tu perçois les nuances et les liens.',
            'CR_APPLICATION_I': 'Difficulté à appliquer les connaissances. Entraîne-toi avec des exemples simples.',
            'CR_APPLICATION_D': 'Application partielle. Continue à pratiquer pour plus d\'aisance.',
            'CR_APPLICATION_M': 'Tu appliques correctement les connaissances dans ce contexte.',
            'CR_APPLICATION_E': 'Application remarquable, tu adaptes tes connaissances avec créativité.',
            'CR_ANALYSE_I': 'L\'analyse manque de profondeur. Décompose davantage les éléments.',
            'CR_ANALYSE_D': 'Analyse en développement. Pousse plus loin l\'examen des composantes.',
            'CR_ANALYSE_M': 'Bonne capacité d\'analyse, tu identifies bien les éléments clés.',
            'CR_ANALYSE_E': 'Analyse approfondie et nuancée, tu perçois les subtilités.',
            'CR_SYNTHESE_I': 'La synthèse est absente ou incohérente. Travaille l\'intégration des idées.',
            'CR_SYNTHESE_D': 'Synthèse partielle. Cherche à mieux relier les éléments entre eux.',
            'CR_SYNTHESE_M': 'Bonne synthèse, tu intègres les éléments de façon cohérente.',
            'CR_SYNTHESE_E': 'Synthèse remarquable, tu reformules avec clarté et originalité.'
        },
        verrouille: false,
        dansBibliotheque: true
    };

    cartouches.push(cartoucheGenerique);
    await db.set('cartouches_GRILLE_GENERIQUE', cartouches);
}

/**
 * ✅ AJOUT (8 décembre 2025) : Migre les cartouches existantes vers le système de bibliothèque
 * Ajoute le flag dansBibliotheque=true à toutes les cartouches qui ne l'ont pas
 */
async function migrerCartouchesVersBibliotheque() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    let nbMigrees = 0;

    for (const grille of grilles) {
        const cle = `cartouches_${grille.id}`;
        let cartouches = await db.get(cle) || [];

        // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
        if (cartouches && !Array.isArray(cartouches)) {
            cartouches = [cartouches];
        }

        cartouches.forEach(cartouche => {
            if (cartouche.dansBibliotheque === undefined) {
                cartouche.dansBibliotheque = true;
                nbMigrees++;
            }
        });

        if (cartouches.length > 0) {
            await db.set(cle, cartouches);
        }
    }

    if (nbMigrees > 0) {
    }
}

/* ===============================
   📂 CHARGEMENT DES GRILLES ET CARTOUCHES
   =============================== */

/**
 * Charge les grilles de critères dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les grilles depuis localStorage
 * 2. Remplit le select avec les options
 * 
 * UTILISÉ PAR:
 * - initialiserModuleCartouches()
 * 
 * CLÉ LOCALSTORAGE:
 * - 'grillesTemplates' : Array des grilles créées dans module 05
 */
async function chargerSelectGrillesRetroaction() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const select = document.getElementById('selectGrilleRetroaction');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choisir une grille --</option>' +
        grilles.map(grille => `<option value="${echapperHtml(grille.id)}">${echapperHtml(grille.nom)}</option>`).join('');
}

/**
 * Charge les cartouches d'une grille sélectionnée
 * Appelée lors du changement de sélection dans #selectGrilleRetroaction
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'ID de la grille sélectionnée
 * 2. Si aucune grille: affiche message et masque interface
 * 3. Sinon: charge les cartouches de cette grille
 * 4. Affiche la liste des cartouches existantes
 * 5. Initialise une nouvelle cartouche par défaut
 * 
 * GÈRE:
 * - Changement d'événement sur #selectGrilleRetroaction
 */
async function chargerCartouchesRetroaction() {
    const grilleId = document.getElementById('selectGrilleRetroaction').value;
    const selectCartouche = document.getElementById('selectCartouche');
    
    if (!grilleId) {
        // Aucune grille sélectionnée
        document.getElementById('aucuneEvalRetroaction').classList.remove('u-hide');
        document.getElementById('infoCartouche').classList.add('u-hide');
        document.getElementById('matriceRetroaction').classList.add('u-hide');
        document.getElementById('listeCartouchesExistants').classList.add('u-hide');
        return;
    }
    
    // Charger les cartouches existantes pour cette grille
    let cartouches = await db.get(`cartouches_${grilleId}`) || [];

    // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
    if (cartouches && !Array.isArray(cartouches)) {
        cartouches = [cartouches];
    }

    selectCartouche.innerHTML = '<option value="">-- Nouvelle cartouche --</option>' +
        cartouches.map(cartouche => `<option value="${echapperHtml(cartouche.id)}">${echapperHtml(cartouche.nom)}</option>`).join('');

    document.getElementById('aucuneEvalRetroaction').classList.add('u-hide');
    document.getElementById('infoCartouche').classList.remove('u-hide');

    // Afficher la liste des cartouches existantes
    // DÉSACTIVÉ pour Beta 80.5+ : remplacé par la sidebar
    // if (cartouches.length > 0) {
    //     afficherListeCartouches(cartouches, grilleId);
    //     document.getElementById('listeCartouchesExistants').style.display = 'block';
    // } else {
    //     document.getElementById('listeCartouchesExistants').style.display = 'none';
    // }

    // Toujours masquer l'ancienne liste (Beta 80.5+)
    const listeAncienne = document.getElementById('listeCartouchesExistants');
    if (listeAncienne) listeAncienne.classList.add('u-hide');
    
    // Initialiser une nouvelle cartouche par défaut
    await initialiserNouveauCartouche(grilleId);
}

/* ===============================
   CRÉATION ET ÉDITION DE CARTOUCHE
   =============================== */

/**
 * Initialise une nouvelle cartouche vierge
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la grille sélectionnée
 * 2. Extrait les critères de la grille
 * 3. Récupère les niveaux depuis l'échelle globale
 * 4. Crée une structure de cartouche vide
 * 5. Affiche la matrice et l'aperçu
 * 6. Met à jour les métriques
 * 
 * PARAMÈTRES:
 * @param {string} grilleId - ID de la grille de critères
 * 
 * UTILISÉ PAR:
 * - await chargerCartouchesRetroaction() (création par défaut)
 * - await chargerMatriceRetroaction() (si aucune cartouche sélectionnée)
 * 
 * STRUCTURE CARTOUCHE:
 * {
 *   id: string,
 *   nom: string,
 *   grilleId: string,
 *   contexte: string,
 *   criteres: Array,
 *   niveaux: Array,
 *   commentaires: Object,
 *   verrouille: boolean
 * }
 */
async function initialiserNouveauCartouche(grilleId) {
    // Récupérer la grille sélectionnée
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);
    
    if (!grille) {
        alert('Grille introuvable');
        return;
    }
    
    // Les critères viennent directement de la grille
    const criteres = grille.criteres || [];
    
    // Récupérer l'échelle de performance depuis echellesTemplates
    const niveauxDefaut = [
        { code: 'I', nom: 'Incomplet', min: 0, max: 64 },
        { code: 'D', nom: 'en Développement', min: 65, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100 }
    ];
    const echelles = await db.get(cle('echellesTemplates'), []);
    const echelleActive = echelles.find(e => !e.estDemo) || echelles[0];
    const niveaux = echelleActive?.niveaux || niveauxDefaut;
    
    // Créer la structure de cartouche
    cartoucheActuel = {
        id: genererIdUnique('CART_'),
        nom: '',
        grilleId: grilleId,
        contexte: '',
        description: '', // 🆕 Beta 99.05 : Champ description uniforme
        criteres: criteres.map(c => ({ id: c.id, nom: c.nom })),
        niveaux: niveaux.map(n => ({ code: n.code, nom: n.nom })),
        commentaires: {},
        verrouille: false,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) : Visible dans la bibliothèque par défaut
    };

    // Auteur CC = identité de l'utilisateur (Plan 1 §4.4)
    cartoucheActuel.metadata_cc = {
        auteur_original: obtenirIdentiteCCUtilisateur(),
        date_creation: new Date().toISOString().split('T')[0],
        contributeurs: []
    };
    // 🔧 #466/CO-20 (21 août 2026) : synchroniser la 2e source. La sauvegarde
    // (sauvegarderCartoucheComplete) et 4 autres lecteurs lisent
    // window.cartoucheActuel ; ce chemin de CRÉATION n'écrivait que la variable
    // globale → « créer une nouvelle cartouche après en avoir ouvert une autre »
    // faisait recharger l'ANCIENNE après sauvegarde. L'unification sur UNE seule
    // source (retrait de la variable globale) part au lot L7/#469 — ici on ferme
    // le symptôme en gardant les deux mondes alignés.
    window.cartoucheActuel = cartoucheActuel;


    // Réinitialiser les champs
    document.getElementById('nomCartouche').value = '';
    document.getElementById('contexteCartouche').value = '';
    var specClear = document.getElementById('contexteSpecifiqueCartouche');
    if (specClear) specClear.value = '';

    await afficherMatriceRetroaction();
    mettreAJourMetriques();
    document.getElementById('matriceRetroaction').classList.remove('u-hide');
}

/**
 * Charge une cartouche existante pour modification
 * Appelée lors du changement de sélection dans #selectCartouche
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'ID de la cartouche sélectionnée
 * 2. Si vide: initialise une nouvelle cartouche
 * 3. Sinon: charge la cartouche depuis localStorage
 * 4. Remplit les champs (nom, contexte)
 * 5. Affiche la matrice avec les commentaires
 * 6. Calcule le pourcentage de complétion
 * 
 * GÈRE:
 * - Changement d'événement sur #selectCartouche
 */
async function chargerMatriceRetroaction(cartoucheIdParam = null, grilleIdParam = null) {


    // Si appelé avec paramètres (nouvelle interface sidebar), utiliser directement
    let grilleId = grilleIdParam;
    let cartoucheId = cartoucheIdParam;

    // Sinon, lire depuis les selects (ancienne interface, compatibilité)
    if (!cartoucheId || !grilleId) {
        const selectGrille = document.getElementById('selectGrilleRetroaction');
        const selectCartouche = document.getElementById('selectCartouche');

        grilleId = grilleId || selectGrille?.value;
        cartoucheId = cartoucheId || selectCartouche?.value;
    }

    if (!cartoucheId) {
        // Nouvelle cartouche
        await initialiserNouveauCartouche(grilleId);
        return;
    }

    // Charger la cartouche existante
    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    cartoucheActuel = cartouches.find(c => c.id === cartoucheId);

    if (cartoucheActuel) {
        // Stocker dans window pour accès global
        window.cartoucheActuel = cartoucheActuel;
        window.cartoucheActuel.grilleId = grilleId;

        // Remplir les champs
        const inputNom = document.getElementById('nomCartouche');
        const inputContexte = document.getElementById('contexteCartouche');

        if (inputNom) inputNom.value = cartoucheActuel.nom;
        if (inputContexte) inputContexte.value = cartoucheActuel.contexte || '';
        const inputContexteSpec = document.getElementById('contexteSpecifiqueCartouche');
        if (inputContexteSpec) inputContexteSpec.value = cartoucheActuel.contexteSpecifique || '';

        // Afficher les checkboxes pratiques compatibles
        const containerPratiques = document.getElementById('checkboxesPratiquesCartouche');
        if (containerPratiques && typeof GabaritsUtils !== 'undefined') {
            const pratiquesActuelles = cartoucheActuel.pratiquesCompatibles || [];
            containerPratiques.innerHTML = GabaritsUtils.genererCheckboxesPratiques('cartouche', pratiquesActuelles);
        }

        // Afficher la matrice
        await afficherMatriceRetroaction();
        await calculerPourcentageComplete();

        document.getElementById('matriceRetroaction').classList.remove('u-hide');

    } else {
        console.warn('❌ cartoucheActuel non trouvé');
    }
}

/* ===============================
   AFFICHAGE DE LA MATRICE
   =============================== */

/**
 * Affiche la matrice des commentaires (critères × niveaux)
 * 
 * FONCTIONNEMENT:
 * 1. Génère un tableau HTML
 * 2. En-tête: niveaux de performance
 * 3. Lignes: critères
 * 4. Cellules: textarea éditable pour chaque commentaire
 * 5. Clé unique: critereId_niveauCode
 * 
 * UTILISÉ PAR:
 * - await initialiserNouveauCartouche()
 * - await chargerMatriceRetroaction()
 * - importerCommentaires()
 * 
 * FORMAT CLÉS:
 * - Clé commentaire: "CRIT001_E" (critère + niveau)
 * - Stocké dans cartoucheActuel.commentaires
 * 
 * TABLEAU:
 * - Position sticky pour en-têtes (scroll horizontal)
 * - Textarea avec onchange pour sauvegarde auto
 * - Placeholder descriptif
 */
async function afficherMatriceRetroaction() {
    if (!cartoucheActuel) return;

    const container = document.getElementById('matriceContainer');

    // Utiliser les niveaux de l'échelle sélectionnée (stockés dans cartoucheActuel)
    // L'ordre est conservé tel que défini par l'utilisateur dans l'échelle
    let niveauxAffichage = [];

    // Si echelleId est défini, charger les couleurs depuis l'échelle source
    if (cartoucheActuel.echelleId) {
        const echelles = await db.get(cle('echellesTemplates')) || [];
        const echelleSource = echelles.find(e => e.id === cartoucheActuel.echelleId) || echelles.find(e => e.idOriginal === cartoucheActuel.echelleId);

        if (echelleSource && echelleSource.niveaux) {
            // Utiliser les niveaux de l'échelle avec leurs couleurs
            niveauxAffichage = echelleSource.niveaux.map(n => ({
                code: n.code,
                nom: n.nom,
                couleur: n.couleur || '#cccccc'
            }));
        }
    }

    // Fallback: utiliser les niveaux stockés dans la cartouche
    if (niveauxAffichage.length === 0 && cartoucheActuel.niveaux) {
        niveauxAffichage = cartoucheActuel.niveaux.map(n => ({
            code: n.code,
            nom: n.nom,
            couleur: n.couleur || '#cccccc'
        }));
    }

    const couleursParCode = {};
    niveauxAffichage.forEach(n => {
        couleursParCode[n.code] = n.couleur;
    });

    let html = `
        <div class="matrice-tableau-wrap">
        <table class="matrice-tableau">
            <thead>
                <tr>
                    <th class="cartouche-gradient-bleu">Critère / Niveau</th>
    `;

    // En-têtes des niveaux avec code et label + couleur de l'échelle
    niveauxAffichage.forEach(niveau => {
        const codeEchappe = echapperHtml(niveau.code);
        const nomEchappe = echapperHtml(niveau.nom);
        const couleurNiveau = couleursParCode[niveau.code] || 'var(--bleu-moyen)';
        html += `
                    <th style="background: ${couleurNiveau};">
                        <span class="niveau-code">${codeEchappe}</span>
                        <span class="niveau-label">${nomEchappe}</span>
                    </th>`;
    });

    html += `
                </tr>
            </thead>
            <tbody>
    `;

    // Lignes des critères
    cartoucheActuel.criteres.forEach(critere => {
        const nomCritereEchappe = echapperHtml(critere.nom);
        html += `
                <tr>
                    <td>${nomCritereEchappe}</td>
        `;

        // Cellules des commentaires - UTILISER niveauxAffichage au lieu de cartoucheActuel.niveaux
        niveauxAffichage.forEach(niveau => {
            const key = `${critere.id}_${niveau.code}`;
            const commentaire = cartoucheActuel.commentaires[key] || '';
            const commentaireEchappe = echapperHtml(commentaire);
            const nomNiveauEchappe = echapperHtml(niveau.nom);

            html += `
                    <td>
                        <textarea id="comm_${key}"
                                  data-critere="${critere.id}"
                                  data-niveau="${niveau.code}"
                                  placeholder="Commentaire pour ${nomCritereEchappe} - ${nomNiveauEchappe}"
                                  data-on-change="sauvegarderCommentaire" data-param="${key}">${commentaireEchappe}</textarea>
                    </td>
            `;
        });

        html += `
                </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        </div>
    `;

    container.innerHTML = html;

    // Mettre à jour les métriques
    mettreAJourMetriques();
}

/**
 * Sauvegarde un commentaire individuel
 * Appelée lors du changement dans une textarea (onchange)
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la valeur de la textarea
 * 2. Met à jour cartoucheActuel.commentaires
 * 3. Recalcule le pourcentage de complétion
 * 
 * PARAMÈTRES:
 * @param {string} key - Clé du commentaire (critereId_niveauCode)
 * 
 * UTILISÉ PAR:
 * - Textarea dans la matrice (onchange)
 * 
 * ⚠⚠ #517 (26 août 2026) — LA MATRICE S'ENREGISTRE MAINTENANT SEULE.
 *
 * Jusqu'ici cette fonction n'écrivait qu'en MÉMOIRE : la persistance n'arrivait
 * qu'au bouton « Enregistrer », tout en bas d'un écran long. Changer de
 * cartouche, changer de sous-onglet ou fermer l'application perdait toute la
 * saisie de la matrice, sans un mot.
 *
 * C'était le modèle INVERSE de ses trois voisins — grille, échelle et production
 * enregistrent au fil de la saisie —, dans le même onglet. Cette incohérence
 * entre écrans voisins suffisait à produire la perception « des fois ça
 * enregistre, des fois non ». Verdict de Grégoire (D2, 26 août) : enregistrement
 * automatique, comme les autres.
 */
async function sauvegarderCommentaire(key) {
    if (!cartoucheActuel) return;

    const textarea = document.getElementById(`comm_${key}`);
    if (textarea) {
        // ▣ L'ÉCRAN FAIT FOI PENDANT L'ÉDITION : la mémoire est mise à jour
        // d'abord, et c'est elle que lit le calcul de complétion.
        cartoucheActuel.commentaires[key] = textarea.value;
        await calculerPourcentageComplete();
        await persisterCartouchePartielle(c => { c.commentaires[key] = textarea.value; });
    }
}

/**
 * #517 — écrire UN champ de la cartouche ouverte, sans passer par le bouton.
 *
 * ⚠⚠ POURQUOI CE CHEMIN EST SÉPARÉ DE `sauvegarderCartouche()`. Celle-ci valide
 * le nom (avec une alerte bloquante), interroge l'utilisateur sur les doublons et
 * relit tout le formulaire. La faire tourner à chaque frappe dans la matrice
 * ouvrirait une boîte de dialogue au milieu d'une saisie. L'enregistrement au fil
 * de l'eau écrit donc le strict nécessaire, et rien d'autre.
 *
 * ⚠ Une cartouche JAMAIS ENREGISTRÉE n'a pas encore de place en base : le
 * mutateur rend `undefined` et rien n'est écrit. C'est exactement le modèle des
 * grilles et des échelles, dont les critères et les niveaux ne s'enregistrent
 * seuls qu'une fois l'objet créé — le premier enregistrement reste un geste.
 *
 * ⚠ Passe par `db.modifier` (#510) : deux commentaires quittés coup sur coup
 * liraient sinon le même instantané, et le second effacerait le premier. C'est
 * le défaut que ce même cycle vient de corriger sur les grilles ; l'introduire
 * ici en le sachant serait impardonnable.
 */
async function persisterCartouchePartielle(appliquer) {
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) return false;
    const resultat = await db.modifier(`cartouches_${cartoucheActuel.grilleId}`, (lues) => {
        const cartouches = lues || [];
        const enBase = cartouches.find(c => c.id === cartoucheActuel.id);
        if (!enBase) return undefined;              // pas encore enregistrée
        if (!enBase.commentaires) enBase.commentaires = {};
        appliquer(enBase);
        enBase.dateModification = new Date().toISOString();
        return cartouches;
    }, []);
    return resultat !== undefined;
}

/**
 * #531 (26 août 2026) — LES CODES DE NIVEAU VIENNENT DE L'ÉCHELLE, PAS D'UNE
 * LISTE ÉCRITE DANS UNE REGEX.
 *
 * ⚠⚠ CE QUI ÉTAIT CASSÉ, ET DEPUIS QUAND. Trois fonctions d'import lisaient le
 * niveau d'un commentaire avec une classe de caractères EN DUR — et pas la même :
 *   · `importerCartoucheDepuisTxt`  →  ([IDME0])   le zéro passe
 *   · `importerCommentaires`        →  ([IDME])    le zéro est REJETÉ
 *   · `parserMarkdownCartouche`     →  ([IDME])    le zéro est REJETÉ
 * L'échelle de Grégoire est « 0-IDME (5 niv.) » : selon le bouton d'import
 * emprunté, ses commentaires de niveau 0 revenaient ou disparaissaient EN
 * SILENCE. Et pour une échelle A/B/C/D, aucun des trois ne lisait quoi que ce soit.
 *
 * ⚠ UN CODE PEUT FAIRE JUSQU'À TROIS CARACTÈRES (`maxlength="3"` dans les deux
 * éditeurs d'échelle). Une classe `[...]` ne conviendrait donc pas : « NM » y
 * serait lu comme « N » ou « M ». D'où l'ALTERNANCE.
 *
 * ⚠ CE QUI N'EST PAS NÉCESSAIRE, ET POURQUOI C'EST ÉCRIT ICI. Un premier jet
 * triait les codes par longueur décroissante, « pour qu'un code court ne masque
 * pas un code long qui commence pareil ». Le break-test a montré que ce tri ne
 * change RIEN : le `\)` qui suit l'alternance force le moteur à revenir sur ses
 * pas, et « M+ » est trouvé même si « M » est essayé d'abord. Le tri a donc été
 * retiré plutôt que gardé « au cas où » — et la raison est notée pour que
 * personne ne le remette en croyant corriger un oubli.
 */
function codesNiveauxPourLecture(niveaux) {
    const codes = (niveaux || [])
        .map(n => String((n && n.code) != null ? n.code : '').trim())
        .filter(Boolean);
    if (codes.length === 0) return null;          // rien à lire : l'appelant décide
    // Échapper ce qui a un sens en expression régulière (« + », « . », « ( »…).
    return codes.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
}

/**
 * #531 — la ligne « **Critère (NIVEAU)** : commentaire », lue avec les codes RÉELS.
 * Rend `null` si la ligne n'en est pas une.
 */
function lireLigneCommentaire(ligne, niveaux) {
    const alternance = codesNiveauxPourLecture(niveaux);
    if (!alternance) return null;
    const motif = new RegExp('^\\*\\*(.+?)\\s*\\((' + alternance + ')\\)\\*\\*\\s*:\\s*(.*)$');
    const m = String(ligne || '').trim().match(motif);
    if (!m) return null;
    return { critere: m[1].trim(), niveau: m[2].trim(), commentaire: m[3].trim() };
}

/**
 * #517 — le CONTEXTE aussi. Il ouvre chaque rétroaction reçue par un étudiant·e :
 * le perdre en silence coûte autant que perdre une cellule de la matrice.
 *
 * ⚠ Le NOM, lui, reste au bouton : il déclenche la vérification de doublons, qui
 * pose une question à l'utilisateur. Une question par frappe n'est pas un
 * enregistrement automatique, c'est un harcèlement.
 */
async function sauvegarderContexteCartouche() {
    if (!cartoucheActuel) return;
    const champ = document.getElementById('contexteCartouche');
    if (!champ) return;
    const valeur = champ.value.trim();
    cartoucheActuel.contexte = valeur;
    await persisterCartouchePartielle(c => { c.contexte = valeur; });
}

/* ===============================
   SAUVEGARDE DE LA CARTOUCHE
   =============================== */

/**
 * Sauvegarde la cartouche complète dans localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Validation du nom (obligatoire)
 * 2. Récupération du contexte
 * 3. Recherche si cartouche existe déjà
 * 4. Mise à jour ou ajout
 * 5. Sauvegarde dans localStorage
 * 6. Rafraîchissement de l'interface
 * 
 * UTILISÉ PAR:
 * - Bouton «Sauvegarder la cartouche»
 * 
 * VALIDATION:
 * - Nom obligatoire (alert si vide)
 * - Contexte optionnel
 * 
 * CLÉ LOCALSTORAGE:
 * - 'cartouches_{grilleId}' : Array des cartouches
 * 
 * RETOUR:
 * - Notification de succès
 * - Sélection automatique de la cartouche sauvegardée
 */
async function sauvegarderCartouche() {
    if (!cartoucheActuel) return false;

    let nom = document.getElementById('nomCartouche').value.trim();
    if (!nom) {
        alert('Veuillez donner un nom à la cartouche');
        return false;
    }

    const grilleId = cartoucheActuel.grilleId;
    let cartouches = await db.get(`cartouches_${grilleId}`) || [];

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    const idActuel = cartoucheActuel?.id || null;
    const cartoucheOriginale = idActuel ? cartouches.find(c => c.id === idActuel) : null;
    const isCreation = !cartoucheOriginale;
    const isNameChange = cartoucheOriginale && cartoucheOriginale.nom !== nom;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        const resultat = await verifierEtGererDoublon('cartouche', nom, cartouches, idActuel);

        if (resultat === null) {
            // Utilisateur a annulé
            return false;
        }

        if (resultat && resultat.action === 'renommer') {
            nom = resultat.nouveauNom;
            document.getElementById('nomCartouche').value = nom;
        }

        if (resultat && resultat.action === 'ecraser') {
            // Supprimer la cartouche existante avec le même nom
            cartouches = cartouches.filter(c => c.nom !== nom);
        }
    }

    // Lire les pratiques compatibles sélectionnées
    const pratiquesCompatibles = typeof GabaritsUtils !== 'undefined'
        ? GabaritsUtils.lirePratiquesSelectionnees('cartouche')
        : [];

    // Mettre à jour les champs
    cartoucheActuel.nom = nom;
    // #502 (25 août 2026) — le champ « Description » a quitté l'écran : il ne
    // servait qu'au formulaire et au partage, rien ne le lisait ailleurs.
    // ⚠ On ne l'ÉCRASE PAS pour autant. Écrire '' ici effacerait la description
    // des cartouches déjà remplies au premier enregistrement — une donnée
    // perdue en silence, pour un champ qu'on voulait seulement cesser de
    // montrer. Ce qui existe est conservé tel quel.
    if (cartoucheActuel.description === undefined) cartoucheActuel.description = '';
    cartoucheActuel.contexte = document.getElementById('contexteCartouche').value.trim();
    cartoucheActuel.contexteSpecifique = (document.getElementById('contexteSpecifiqueCartouche') || {}).value ? document.getElementById('contexteSpecifiqueCartouche').value.trim() : '';
    cartoucheActuel.pratiquesCompatibles = pratiquesCompatibles;

    // Backfill metadata_cc pour cartouches anciennes (Plan 1 §4.4 : auteur = identité utilisateur)
    if (!cartoucheActuel.metadata_cc) cartoucheActuel.metadata_cc = {};
    if (!cartoucheActuel.metadata_cc.date_creation) {
        cartoucheActuel.metadata_cc.date_creation = new Date().toISOString().split('T')[0];
    }
    if (!cartoucheActuel.metadata_cc.auteur_original) {
        cartoucheActuel.metadata_cc.auteur_original = obtenirIdentiteCCUtilisateur();
    }
    if (!cartoucheActuel.metadata_cc.contributeurs) {
        cartoucheActuel.metadata_cc.contributeurs = [];
    }

    // 🆕 Beta 99.05 : Mise à jour dateModification systématique
    cartoucheActuel.dateModification = new Date().toISOString();

    // Vérifier si la cartouche existe déjà
    const index = cartouches.findIndex(c => c.id === cartoucheActuel.id);
    if (index >= 0) {
        // Mise à jour
        if (typeof ajouterContributeurSiNecessaire === 'function') {
            cartoucheActuel = ajouterContributeurSiNecessaire(cartoucheActuel);
        }
        cartouches[index] = cartoucheActuel;
    } else {
        cartouches.push(cartoucheActuel);
    }
    
    // Sauvegarder
    await db.set(`cartouches_${grilleId}`, cartouches);

    // NOUVELLE INTERFACE (Beta 80.2): Rafraîchir la banque
    await afficherBanqueCartouches();
    definirCartoucheActive(cartoucheActuel.id);

    // Rafraîchir l'interface (ancien système - compatibilité)
    await chargerCartouchesRetroaction();
    document.getElementById('selectCartouche').value = cartoucheActuel.id;

    // Rafraîchir la nouvelle vue (ancien système)
    // DÉSACTIVÉ Beta 80.5+ : ancienne interface remplacée par sidebar
    // await afficherToutesLesGrillesEtCartouches();

    // Rafraîchir la banque sidebar (Beta 80.5+)
    if (typeof afficherBanqueCartouches === 'function') {
        await afficherBanqueCartouches();
    }

    return true;
}

/* ===============================
   IMPORT DE COMMENTAIRES
   =============================== */

/**
 * Affiche la zone d'importation de commentaires
 * Masque la matrice pendant l'import
 * 
 * UTILISÉ PAR:
 * - Bouton «Importer des commentaires»
 */
function afficherImportCommentaires() {
    document.getElementById('zoneImportCommentaires').classList.remove('u-hide');
    document.getElementById('matriceRetroaction').classList.add('u-hide');
}

/**
 * Annule l'import et retourne à la matrice
 * Efface le contenu du textarea d'import
 * 
 * UTILISÉ PAR:
 * - Bouton «Annuler» dans la zone d'import
 */
function annulerImportCommentaires() {
    document.getElementById('zoneImportCommentaires').classList.add('u-hide');
    document.getElementById('matriceRetroaction').classList.remove('u-hide');
    document.getElementById('commentairesColles').value = '';
}

/**
 * Parse et importe les commentaires depuis un texte Markdown
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le texte collé
 * 2. Parse ligne par ligne
 * 3. Détecte les sections: ## CRITÈRE
 * 4. Détecte les commentaires: **CRITÈRE (NIVEAU)** : Texte
 * 5. Associe au bon critère et niveau
 * 6. Met à jour cartoucheActuel.commentaires
 * 7. Rafraîchit la matrice
 * 
 * UTILISÉ PAR:
 * - Bouton «Importer les commentaires»
 * 
 * FORMAT ATTENDU:
 * ## NOM_DU_CRITÈRE
 * 
 * **NOM_DU_CRITÈRE (I)** : Commentaire...
 * **NOM_DU_CRITÈRE (D)** : Commentaire...
 * **NOM_DU_CRITÈRE (M)** : Commentaire...
 * **NOM_DU_CRITÈRE (E)** : Commentaire...
 * 
 * REGEX:
 * - Section: /^##/
 * - Commentaire: /^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/
 * 
 * VALIDATION:
 * - Vérifie que le critère existe
 * - Vérifie que le niveau existe
 * - Compte les imports réussis
 * - Alerte si aucun import
 * 
 * RETOUR:
 * - Notification avec nombre de commentaires importés
 * - Retour automatique à la matrice
 */
async function importerCommentaires() {
    const texte = document.getElementById('commentairesColles').value.trim();
    
    if (!texte) {
        alert('Colle tes commentaires');
        return;
    }
    
    if (!cartoucheActuel) {
        alert('Aucune cartouche active');
        return;
    }
    
    try {
        // Parser le texte
        const lignes = texte.split('\n');
        let critereActuel = null;
        let compteur = 0;
        
        lignes.forEach(ligne => {
            ligne = ligne.trim();
            
            // Détecter un titre de critère : ## CRITÈRE
            if (ligne.startsWith('##')) {
                critereActuel = ligne.replace('##', '').trim().toUpperCase();
                return;
            }
            
            // Détecter un commentaire : **CRITÈRE (NIVEAU)** : Texte...
            // #531 — les codes viennent de l'ÉCHELLE de la cartouche ouverte,
            // plus d'une classe `[IDME]` qui rejetait le niveau 0 en silence.
            const lu = lireLigneCommentaire(ligne, cartoucheActuel && cartoucheActuel.niveaux);
            if (lu && critereActuel) {
                const nomCritere = lu.critere.toUpperCase();
                const niveau = lu.niveau;
                const commentaire = lu.commentaire;
                
                // Vérifier que le critère correspond
                if (nomCritere === critereActuel) {
                    // Trouver le critère correspondant dans la cartouche
                    const critere = cartoucheActuel.criteres.find(c =>
                        c.nom.toUpperCase() === critereActuel
                    );
                    
                    if (critere) {
                        const key = `${critere.id}_${niveau}`;
                        cartoucheActuel.commentaires[key] = commentaire;
                        compteur++;
                    }
                }
            }
        });
        
        if (compteur === 0) {
            alert('Aucun commentaire n\'a pu être importé. Vérifie le format.');
            return;
        }

        // Rafraîchir l'affichage
        await afficherMatriceRetroaction();
        await calculerPourcentageComplete();
        annulerImportCommentaires();
        
        notifications.succes(`${compteur} commentaire(s) importé(s) avec succès !`);
        
    } catch (error) {
        console.error('Erreur d\'import:', error);
        alert('Erreur lors de l\'import. Vérifie le format de tes données.');
    }
}

/* ===============================
   MÉTRIQUES ET PROGRESSION
   =============================== */

/**
 * Met à jour les métriques affichées
 * (Nombre de critères, niveaux, commentaires, pourcentage)
 * 
 * FONCTIONNEMENT:
 * 1. Compte les critères
 * 2. Compte les niveaux
 * 3. Calcule le total de commentaires à remplir
 * 4. Appelle await calculerPourcentageComplete()
 * 
 * UTILISÉ PAR:
 * - await afficherMatriceRetroaction()
 * 
 * MÉTRIQUES AFFICHÉES:
 * - #nbCriteres : Nombre de critères
 * - #nbNiveaux : Nombre de niveaux
 * - #nbCommentaires : Total de cases à remplir (critères × niveaux)
 * - #pctComplete : Pourcentage (via calculerPourcentageComplete)
 */
async function mettreAJourMetriques() {
    if (!cartoucheActuel) return;
    
    const nbCriteres = cartoucheActuel.criteres.length;
    const nbNiveaux = cartoucheActuel.niveaux.length;
    const nbTotal = nbCriteres * nbNiveaux;

    // Mettre à jour les métriques (si les éléments existent)
    const elemNbCriteres = document.getElementById('nbCriteres');
    const elemNbNiveaux = document.getElementById('nbNiveaux');
    const elemNbCommentaires = document.getElementById('nbCommentaires');

    if (elemNbCriteres) elemNbCriteres.textContent = nbCriteres;
    if (elemNbNiveaux) elemNbNiveaux.textContent = nbNiveaux;
    if (elemNbCommentaires) elemNbCommentaires.textContent = nbTotal;

    await calculerPourcentageComplete();
}

/**
 * Calcule et affiche le pourcentage de complétion
 * Change la couleur selon le niveau d'avancement
 * 
 * FONCTIONNEMENT:
 * 1. Compte les cellules remplies (non vides)
 * 2. Calcule le pourcentage
 * 3. Applique une couleur selon le niveau:
 *    - 100% : vert (complet)
 *    - 75%+ : bleu (presque complet)
 *    - 50%+ : orange (en cours)
 *    - <50% : rouge (début)
 * 
 * UTILISÉ PAR:
 * - sauvegarderCommentaire()
 * - await chargerMatriceRetroaction()
 * - importerCommentaires()
 * - mettreAJourMetriques()
 * 
 * AFFICHAGE:
 * - Met à jour #pctComplete
 * - Change le background de son parent
 * 
 * CRITÈRE DE REMPLISSAGE:
 * - Commentaire non vide après trim()
 */
async function calculerPourcentageComplete() {
    if (!cartoucheActuel) return;

    // CRITIQUE: Utiliser la même logique que await afficherMatriceRetroaction()
    // pour compter tous les niveaux disponibles (pas seulement ceux de la cartouche)
    const echelles = await db.get(cle('echellesTemplates')) || [];

    const niveauxDisponiblesMap = new Map();

    // Fusionner les niveaux de toutes les échelles
    echelles.forEach(echelle => {
        if (echelle.niveaux) {
            echelle.niveaux.forEach(n => {
                if (!niveauxDisponiblesMap.has(n.code)) {
                    niveauxDisponiblesMap.set(n.code, n);
                }
            });
        }
    });

    // Ajouter les niveaux de la cartouche
    if (cartoucheActuel.niveaux) {
        cartoucheActuel.niveaux.forEach(n => {
            if (!niveauxDisponiblesMap.has(n.code)) {
                niveauxDisponiblesMap.set(n.code, n);
            }
        });
    }

    const niveauxAffichage = Array.from(niveauxDisponiblesMap.values());

    const totalCases = cartoucheActuel.criteres.length * niveauxAffichage.length;
    let casesRemplies = 0;

    // Compter les cases remplies
    cartoucheActuel.criteres.forEach(critere => {
        niveauxAffichage.forEach(niveau => {
            const key = `${critere.id}_${niveau.code}`;
            if (cartoucheActuel.commentaires[key] && cartoucheActuel.commentaires[key].trim()) {
                casesRemplies++;
            }
        });
    });

    const pourcentage = Math.round((casesRemplies / totalCases) * 100);

    // Mettre à jour les cartes métriques (vérification existence éléments)
    const nbCriteres = cartoucheActuel.criteres.length;
    const nbNiveaux = niveauxAffichage.length;
    const nbCommARediger = totalCases - casesRemplies;

    const elemNbCriteres = document.getElementById('nbCriteres');
    const elemNbNiveaux = document.getElementById('nbNiveaux');
    const elemNbCommentaires = document.getElementById('nbCommentaires'); // ID correct: nbCommentaires (pas nbCommentairesRestants)
    const elemPctComplete = document.getElementById('pctComplete');

    if (elemNbCriteres) elemNbCriteres.textContent = nbCriteres;
    if (elemNbNiveaux) elemNbNiveaux.textContent = nbNiveaux;
    if (elemNbCommentaires) elemNbCommentaires.textContent = nbCommARediger;
    if (elemPctComplete) elemPctComplete.textContent = pourcentage + '%';

    // Changer la couleur selon le pourcentage
    const element = elemPctComplete ? elemPctComplete.parentElement : null;
    if (!element) return;
    if (pourcentage === 100) {
        element.style.background = 'var(--vert-pale)';
    } else if (pourcentage >= 75) {
        element.style.background = 'var(--bleu-carte)';
    } else if (pourcentage >= 50) {
        element.style.background = 'var(--orange-accent)20';
    } else {
        element.style.background = 'var(--niveau-attention-critique)20';
    }
}

/* ===============================
   LISTE DES CARTOUCHES
   =============================== */

/**
 * Affiche la liste des cartouches existantes
 * Avec options de verrouillage, édition, duplication, suppression
 * 
 * FONCTIONNEMENT:
 * 1. Génère une carte par cartouche
 * 2. Affiche le nom et la progression
 * 3. Boutons d'action selon l'état (verrouillée ou non)
 * 
 * PARAMÈTRES:
 * @param {Array} cartouches - Array des cartouches à afficher
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - await chargerCartouchesRetroaction()
 * - await basculerVerrouillageCartouche()
 * 
 * AFFICHAGE PAR CARTOUCHE:
 * - Nom
 * - Progression (X / Y commentaires remplis)
 * - Checkbox verrouillage
 * - Bouton Modifier (désactivé si verrouillé)
 * - Bouton Dupliquer
 * - Bouton Supprimer (désactivé si verrouillé)
 * 
 * OPACITÉ:
 * - Boutons désactivés à 50% d'opacité si verrouillé
 */
function afficherListeCartouches(cartouches, grilleId) {
    const container = document.getElementById('listeCartouchesContainer');

    container.innerHTML = cartouches.map(cartouche => {
        const nomEchappe = echapperHtml(cartouche.nom);
        const nbRemplis = Object.keys(cartouche.commentaires || {})
            .filter(k => cartouche.commentaires[k] && cartouche.commentaires[k].trim())
            .length;
        const nbTotal = (cartouche.criteres?.length || 0) * (cartouche.niveaux?.length || 0);

        return `
        <div class="item-liste cartouche-fond-bleu-pale">
            <div class="u-flex-between">
                <div>
                    <strong class="u-texte-bleu">${nomEchappe}</strong>
                    <small class="u-texte-bleu-leger-ml10">
                        ${nbRemplis} / ${nbTotal} commentaires remplis
                    </small>
                </div>
                <div>
                    <button data-action="basculerVerrouillageCartouche" data-param="${cartouche.id}" data-param2="${grilleId}"
                          class="btn btn-tres-compact"
                          class="u-mr-10"
                          title="${cartouche.verrouille ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller'}">
                        ${cartouche.verrouille ? 'Verrouillée' : 'Modifiable'}
                    </button>
                    <button class="btn btn-modifier"
                            data-action="chargerCartouchePourModif" data-param="${cartouche.id}" data-param2="${grilleId}">
                        Modifier
                    </button>
                    <button class="btn btn-principal"
                            data-action="dupliquerCartouche" data-param="${cartouche.id}" data-param2="${grilleId}">
                        Dupliquer
                    </button>
                    <button class="btn btn-supprimer"
                            data-action="supprimerCartoucheConfirm" data-param="${cartouche.id}" data-param2="${grilleId}">
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

/* ===============================
   📂 NOUVELLE INTERFACE: VUE PAR GRILLE
   Affiche toutes les grilles avec leurs cartouches
   =============================== */

/**
 * Affiche toutes les grilles avec leurs cartouches regroupées
 * NOUVELLE ARCHITECTURE: Sections repliables par grille
 *
 * FONCTIONNEMENT:
 * 1. Charge toutes les grilles depuis localStorage
 * 2. Pour chaque grille, charge ses cartouches
 * 3. Génère une section <details> repliable
 * 4. Affiche les cartouches de la grille
 * 5. Ajoute un bouton "Ajouter" spécifique à la grille
 *
 * AVANTAGES:
 * - Vue d'ensemble complète
 * - Hiérarchie grille → cartouches visible
 * - Navigation par scroll au lieu de select
 * - Actions contextuelles par grille
 */
async function afficherToutesLesGrillesEtCartouches() {
    const container = document.getElementById('vueGrillesCartouches');
    if (!container) return;

    const grilles = await db.get(cle('grillesTemplates')) || [];

    if (grilles.length === 0) {
        container.innerHTML = `
            <div class="cartouche-zone-bleu-pale">
                <p class="u-texte-bleu-leger">Aucune grille de critères disponible</p>
                <small>Crée d'abord une grille dans <strong>Conception → Grilles de critères</strong></small>
            </div>
        `;
        return;
    }

    // ✅ CORRECTION: Utiliser for...of au lieu de map() pour supporter await
    const htmlSections = [];
    for (const grille of grilles) {
        const cartouches = await db.get(`cartouches_${grille.id}`) || [];
        const nomGrilleEchappe = echapperHtml(grille.nom);

        htmlSections.push(`
            <details class="grille-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>${nomGrilleEchappe}</span>
                    <span class="cartouche-texte-secondaire">
                        ${cartouches.length} cartouche${cartouches.length > 1 ? 's' : ''}
                    </span>
                </summary>

                <div class="cartouche-p-15">
                    ${cartouches.length > 0 ? `
                        <div class="u-mb-15">
                            ${cartouches.map(cartouche => {
                                const nomCartoucheEchappe = echapperHtml(cartouche.nom);
                                const nbRemplis = Object.keys(cartouche.commentaires || {})
                                    .filter(k => cartouche.commentaires[k] && cartouche.commentaires[k].trim())
                                    .length;
                                const nbTotal = (cartouche.criteres?.length || 0) * (cartouche.niveaux?.length || 0);

                                return `
                                    <div class="item-liste cartouche-fond-bleu-pale">
                                        <div class="u-flex-between">
                                            <div>
                                                <strong class="u-texte-bleu">${nomCartoucheEchappe}</strong>
                                                <small class="u-texte-bleu-leger-ml10">
                                                    ${nbRemplis} / ${nbTotal} commentaires
                                                </small>
                                            </div>
                                            <div class="u-nowrap">
                                                <button data-action="basculerVerrouillageCartouche" data-param="${cartouche.id}" data-param2="${grille.id}"
                                                      class="btn btn-tres-compact"
                                                      class="u-mr-10"
                                                      title="${cartouche.verrouille ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller'}">
                                                    ${cartouche.verrouille ? 'Verrouillée' : 'Modifiable'}
                                                </button>
                                                <button class="btn btn-modifier"
                                                        data-action="chargerCartouchePourModif" data-param="${cartouche.id}" data-param2="${grille.id}">
                                                    Modifier
                                                </button>
                                                <button class="btn btn-principal"
                                                        data-action="dupliquerCartouche" data-param="${cartouche.id}" data-param2="${grille.id}">
                                                    Dupliquer
                                                </button>
                                                <button class="btn btn-supprimer"
                                                        data-action="supprimerCartoucheConfirm" data-param="${cartouche.id}" data-param2="${grille.id}">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <p class="cartouche-texte-italique-bleu-leger">
                            Aucune cartouche pour cette grille
                        </p>
                    `}

                    <button class="btn btn-confirmer" data-action="ajouterCartoucheAGrille" data-param="${grille.id}">
                        + Ajouter une cartouche à cette grille
                    </button>
                </div>
            </details>
        `);
    }

    container.innerHTML = htmlSections.join('');
}

/* ===============================
   🔒 VERROUILLAGE
   =============================== */

/**
 * Bascule le verrouillage d'une cartouche
 * Une cartouche verrouillée ne peut pas être modifiée ou supprimée
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les cartouches depuis localStorage
 * 2. Trouve la cartouche concernée
 * 3. Bascule l'état verrouille
 * 4. Sauvegarde
 * 5. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Checkbox dans afficherListeCartouches()
 * 
 * EFFET:
 * - Désactive/active les boutons Modifier et Supprimer
 * - Change l'opacité des boutons
 */
async function basculerVerrouillageCartouche(cartoucheId, grilleId) {
    let cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const index = cartouches.findIndex(c => c.id === cartoucheId);

    if (index !== -1) {
        // Basculer directement l'état (pas de checkbox, juste un span cliquable)
        cartouches[index].verrouille = !cartouches[index].verrouille;
        await db.set(`cartouches_${grilleId}`, cartouches);

        // Afficher une notification spécifique
        const statut = cartouches[index].verrouille ? 'verrouillée' : 'déverrouillée';

        // DÉSACTIVÉ Beta 80.5+ : ancienne interface remplacée par sidebar
        // afficherListeCartouches(cartouches, grilleId);
        // await afficherToutesLesGrillesEtCartouches();

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            await afficherBanqueCartouches();
        }
    }
}

/* ===============================
   🔄 DUPLICATION
   =============================== */

/**
 * Duplique une cartouche existante
 * 
 * FONCTIONNEMENT:
 * 1. Trouve la cartouche originale
 * 2. Crée une copie complète (deep copy)
 * 3. Change l'ID et ajoute «(copie)» au nom
 * 4. Déverrouille la copie
 * 5. Ajoute aux cartouches
 * 6. Sélectionne automatiquement la copie
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche à dupliquer
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton «Dupliquer» dans afficherListeCartouches()
 * 
 * RETOUR:
 * - Notification de succès
 * - Chargement automatique de la copie
 */
async function dupliquerCartouche(cartoucheId, grilleId) {
    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const cartoucheOriginal = cartouches.find(c => c.id === cartoucheId);
    
    if (cartoucheOriginal) {
        const nouveauCartouche = {
            ...cartoucheOriginal,
            id: genererIdUnique('CART_'),
            nom: nommerCopie(cartoucheOriginal.nom, cartouches),
            auteur: BibliothequeUI.obtenirAuteurActif(),
            isDemo: false,
            inspireDe: BibliothequeUI.forgerInspireDe(cartoucheOriginal),
            verrouille: false,
            dansBibliotheque: true,  // ✅ AJOUT (8 décembre 2025) : Copie visible par défaut
            commentaires: { ...cartoucheOriginal.commentaires }
        };

        // ✅ D4 (arbitrage du 24 août) — les métadonnées de partage de la source
        // n'ont plus cours : la copie est un original de l'utilisateur. Avant,
        // cette voie les conservait, contrairement à sa voisine de bibliothèque.
        delete nouveauCartouche.metadata_cc;
        delete nouveauCartouche.auteurOriginal;

        cartouches.push(nouveauCartouche);
        await db.set(`cartouches_${grilleId}`, cartouches); // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe

        // NOUVELLE INTERFACE (Beta 80.5+): Charger directement la copie
        await chargerCartouchePourModif(nouveauCartouche.id, grilleId);

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            await afficherBanqueCartouches();
        }

    }
}

/**
 * Charge une cartouche pour modification depuis la liste
 * Vérifie qu'elle n'est pas verrouillée
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton «Modifier» dans afficherListeCartouches()
 */
async function chargerCartouchePourModif(cartoucheId, grilleId) {

    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const cartouche = cartouches.find(c => c.id === cartoucheId);


    if (cartouche) {
        // Mettre à jour les selects cachés pour compatibilité (ancienne interface)
        const selectGrille = document.getElementById('selectGrilleRetroaction');
        const selectCartouche = document.getElementById('selectCartouche');
        if (selectGrille) selectGrille.value = grilleId;
        if (selectCartouche) selectCartouche.value = cartoucheId;

        // NOUVEAU (Beta 95): Peupler et désactiver les dropdowns grille ET échelle (mode édition)
        const echelleId = cartouche.echelleId || '';
        await populerDropdownsCartouche(grilleId, echelleId, true);

        // Afficher les boutons Dupliquer, Supprimer, Export PDF et Export texte (mode édition)
        const btnDupliquer = document.getElementById('btnDupliquerCartouche');
        const btnSupprimer = document.getElementById('btnSupprimerCartouche');
        const btnExportPDFEdit = document.getElementById('btnExporterPDFCartouche');
        const btnExportTexteEdit = document.getElementById('btnExporterTexteCartouche');
        if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
        if (btnExportPDFEdit) btnExportPDFEdit.classList.remove('u-hide');
        if (btnExportTexteEdit) btnExportTexteEdit.classList.remove('u-hide');

        // NOUVELLE INTERFACE (Beta 80.5+): Passer les paramètres directement
        await chargerMatriceRetroaction(cartoucheId, grilleId);

        // NOUVELLE INTERFACE (Beta 80.2): Highlight dans la banque
        definirCartoucheActive(cartoucheId);

        // Afficher toutes les zones nécessaires
        const messageAccueil = document.getElementById('messageAccueilCartouche');
        if (messageAccueil) {
            messageAccueil.classList.add('u-hide');
        }

        const infoCartouche = document.getElementById('infoCartouche');
        if (infoCartouche) {
            infoCartouche.classList.remove('u-hide');
        }

        const zoneImport = document.getElementById('zoneImportUnifiee');
        if (zoneImport) {
            zoneImport.classList.remove('u-hide');
        }

        const matriceRetroaction = document.getElementById('matriceRetroaction');
        if (matriceRetroaction) {
            matriceRetroaction.classList.remove('u-hide');
        }

        // Générer la checklist pour l'import partiel
        genererChecklistCriteresImport();

        // ✅ AJOUT (6 jan 2026) : Afficher le panneau métadonnées
        const panneauMeta = document.getElementById('panneauMetadonneesCartouche');
        if (panneauMeta && typeof genererPanneauMetadonnees === 'function') {
            panneauMeta.innerHTML = genererPanneauMetadonnees(cartouche, 'cartouche');
        }

        // Phase 4.B : mode lecture seule si item démo
        const conteneurCartouche = document.getElementById('infoCartouche');
        if (conteneurCartouche && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
            BibliothequeUI.appliquerModeLectureSeuleDemo(conteneurCartouche, cartouche, 'dupliquerEtEditerCartouche', 'Dupliquer pour créer ma cartouche');
        }

        // Afficher les boutons export PDF et texte dans la barre de boutons
        const btnExportPDF = document.getElementById('btnExporterPDFCartouche');
        const btnExportTexte = document.getElementById('btnExporterTexteCartouche');
        if (btnExportPDF) btnExportPDF.classList.remove('u-hide');
        if (btnExportTexte) btnExportTexte.classList.remove('u-hide');

        // Si verrouillée, afficher l'alerte de verrouillage
        const alerteVerrouillage = document.getElementById('alerteVerrouillage');
        const btnDeverrouiller = document.getElementById('btnDeverrouillerCartouche');

        if (cartouche.verrouille) {
            if (alerteVerrouillage) alerteVerrouillage.classList.remove('u-hide');

            // Attacher l'événement au bouton
            if (btnDeverrouiller) {
                btnDeverrouiller.onclick = async function() {
                    await basculerVerrouillageCartouche(cartoucheId, grilleId);
                    // Recharger la cartouche pour mettre à jour l'affichage
                    setTimeout(async () => await chargerCartouchePourModif(cartoucheId, grilleId), 100);
                };
            }
        } else {
            if (alerteVerrouillage) alerteVerrouillage.classList.add('u-hide');
        }

        // NE PLUS faire de scroll - la sidebar reste visible
    } else {
        console.warn('⚠️ Impossible de charger la cartouche (inexistante)');
    }
}

/* ===============================
   SUPPRESSION
   =============================== */

/**
 * Supprime une cartouche avec confirmation
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que la cartouche n'est pas verrouillée
 * 2. Demande confirmation
 * 3. Retire du localStorage
 * 4. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche à supprimer
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton «Supprimer» dans afficherListeCartouches()
 * 
 * SÉCURITÉ:
 * - Bloquée si verrouillée (alerte)
 * - Confirmation obligatoire
 */
async function supprimerCartoucheConfirm(cartoucheId, grilleId) {
    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    if (cartouche && cartouche.verrouille) {
        alert('D\u00e9verrouille ce cartouche avant de le supprimer');
        return;
    }

    if (confirm(`Es-tu sûr de vouloir supprimer la cartouche «${cartouche?.nom}» ?`)) {
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(cartoucheId)) {
            window.marquerRessourceSupprimee(cartoucheId);
        }
        const nouveauxCartouches = cartouches.filter(c => c.id !== cartoucheId);
        await db.set(`cartouches_${grilleId}`, nouveauxCartouches);

        // NOUVELLE INTERFACE (Beta 80.2): Rafraîchir la banque
        await afficherBanqueCartouches();

        // Ancien système (compatibilité)
        await chargerCartouchesRetroaction();

        // Rafraîchir la nouvelle vue
        // DÉSACTIVÉ Beta 80.5+ : ancienne interface remplacée par sidebar
        // await afficherToutesLesGrillesEtCartouches();

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            await afficherBanqueCartouches();
        }

    }
}

/**
 * Supprime la cartouche actuellement en édition
 * Appelée depuis le bouton de suppression principal
 * 
 * UTILISÉ PAR:
 * - Bouton «Supprimer» dans la zone d'édition
 */
async function supprimerCartouche() {
    if (!cartoucheActuel) return;

    const grilleId = cartoucheActuel.grilleId;
    await supprimerCartoucheConfirm(cartoucheActuel.id, grilleId);
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/* ===============================
   📤📥 EXPORT / IMPORT JSON
   =============================== */

/**
 * Exporte toutes les cartouches au format JSON
 *
 * FONCTIONNEMENT:
 * 1. Récupère toutes les clés localStorage commençant par 'cartouches_'
 * 2. Compile dans un objet structuré
 * 3. Génère un fichier JSON téléchargeable
 *
 * UTILISÉ PAR:
 * - Bouton «Exporter les cartouches»
 *
 * FORMAT EXPORT:
 * {
 *   version: "1.0",
 *   dateExport: "ISO string",
 *   cartouches: {
 *     grilleId1: [...],
 *     grilleId2: [...]
 *   }
 * }
 */
async function exporterCartouches() {
    const cartouches = {};
    let nbExclues = 0;

    // #389 : toutes les couches synchrones (localStorage ∪ memoryCache)
    const allKeys = db.keysSync();
    for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        if (key && key.startsWith('cartouches_')) {
            const grilleId = key.replace('cartouches_', '');
            const toutesCartouches = await db.get(key) || [];

            // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
            const cartouchesFiltrees = typeof filtrerRessourcesNonDemo === 'function'
                ? filtrerRessourcesNonDemo(toutesCartouches, 'cartouche')
                : toutesCartouches.filter(c => !c.estDemo && !c.auteurOriginal);
            nbExclues += toutesCartouches.length - cartouchesFiltrees.length;

            if (cartouchesFiltrees.length > 0) {
                cartouches[grilleId] = cartouchesFiltrees;
            }
        }
    }

    if (Object.keys(cartouches).length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune cartouche personnelle à exporter.\n\n${nbExclues} cartouche(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune cartouche à exporter.');
        }
        return;
    }

    // Compter le nombre total de cartouches
    let nbCartouches = 0;
    Object.values(cartouches).forEach(arr => {
        nbCartouches += arr.length;
    });

    // Informer si des cartouches ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Cartouches de rétroaction',
        `${nbCartouches} cartouche(s) pour ${Object.keys(cartouches).length} grille(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { cartouches: cartouches },
        'cartouches',
        'Cartouches de rétroaction',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('cartouches', { inclureLicence: true, precisionDate: 'minute' });

    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.succes(`${nbCartouches} cartouche(s) exportée(s) avec succès`);
}

/**
 * Importe des cartouches depuis un fichier JSON
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Valide la structure
 * 3. Fusionne avec les cartouches existantes (ou remplace si conflit)
 * 4. Sauvegarde dans localStorage
 * 5. Rafraîchit l'interface
 *
 * UTILISÉ PAR:
 * - Input file «Importer des cartouches»
 *
 * PARAMÈTRES:
 * @param {Event} event - Événement de changement du file input
 *
 * VALIDATION:
 * - Vérifie la version
 * - Vérifie la structure des données
 * - Alerte en cas d'erreur
 *
 * GESTION CONFLITS:
 * - Propose de remplacer ou fusionner
 * - Les cartouches avec même ID sont remplacées
 */
async function importerCartouches(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    var file = (target.files || [])[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._cartouchesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // Format aligné sur les autres modales d'import (modal-js-overlay /
            // modal-js-contenu du DS). z-index: 10001 pour passer au-dessus
            // des bibliothèques (10000).
            const modal = document.createElement('div');
            modal.classList.add('modal-import-cartouches');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px; padding: 20px;">
                        <div data-apercu-cc-slot style="margin-bottom: 15px;"></div>
                        <p><strong>Veux-tu importer ces cartouches ?</strong></p>
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportCartouches">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportCartouches">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            if (estCC && window.ApercuSandbox) {
                const slot = modal.querySelector('[data-apercu-cc-slot]');
                if (slot) {
                    window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                        hauteurMin: 120,
                        hauteurMax: 500
                    });
                }
            } else if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les cartouches
 * Fonction helper appelée depuis le modal de confirmation
 * PHASE 3.3: Détection de dépendances manquantes (Beta 91)
 */
window.confirmerImportCartouches = async function(donnees) {
    try {
        let cartouchesData;
        let metadata = null;

        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        if (donnees.contenu) {
            metadata = donnees.metadata;

            // Vérifier si c'est un export individuel (une seule cartouche)
            if (donnees.contenu.id && donnees.contenu.grilleId) {
                // Individual export: { metadata, contenu: { ...cartouche... } }
                const cartouche = { ...donnees.contenu };

                // Préserver metadata_cc si présent
                if (metadata && metadata.licence) {
                    cartouche.metadata_cc = {
                        auteur_original: metadata.auteur_original,
                        date_creation: metadata.date_creation,
                        licence: metadata.licence,
                        contributeurs: metadata.contributeurs || []
                    };
                }

                // Convertir en format batch pour traitement uniforme
                cartouchesData = {
                    [cartouche.grilleId]: [cartouche]
                };
            } else if (donnees.contenu.cartouches) {
                // Batch export: { metadata, contenu: { cartouches: {...} } }
                cartouchesData = donnees.contenu.cartouches;
            } else {
                throw new Error('Format invalide: structure de contenu non reconnue');
            }
        } else {
            // Ancien format direct
            cartouchesData = donnees.cartouches;
        }

        if (!cartouchesData || typeof cartouchesData !== 'object') {
            throw new Error('Format invalide: cartouches doit être un objet');
        }

        // PHASE 3.3: Détecter les dépendances manquantes (grilles référencées)
        const grillesExistantes = await db.get(cle('grillesTemplates')) || [];
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        const grillesManquantes = [];

        Object.keys(cartouchesData).forEach(grilleId => {
            if (!idsGrillesExistants.has(grilleId)) {
                grillesManquantes.push(grilleId);
            }
        });

        // Avertir l'utilisateur si des dépendances manquent
        if (grillesManquantes.length > 0) {
            const nbGrillesManquantes = grillesManquantes.length;
            const message = `⚠️ Attention : ${nbGrillesManquantes} grille(s) de critères manquante(s)\n\n` +
                `Les cartouches importées sont associées à des grilles qui n'existent pas encore dans ton système.\n\n` +
                `Grilles manquantes :\n${grillesManquantes.map(id => `  • ${id}`).join('\n')}\n\n` +
                `Les cartouches seront importées mais ne seront visibles qu'après avoir importé les grilles manquantes.\n\n` +
                `Continuer quand même ?`;

            if (!confirm(message)) {
                return;
            }

        }

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeCartouches
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa sélection
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_CARTOUCHES || 'bibliothequeCartouches';
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE) || [];

        let nbAjoutees = 0;
        let nbMisesAJour = 0;

        // Aplatir les cartouches de toutes les grilles pour la bibliothèque
        for (const grilleId of Object.keys(cartouchesData)) {
            const cartouchesImportees = cartouchesData[grilleId];

            cartouchesImportees.forEach(importee => {
                // Préserver metadata_cc pour batch export aussi
                if (metadata && metadata.licence && !importee.metadata_cc) {
                    importee.metadata_cc = {
                        auteur_original: metadata.auteur_original,
                        date_creation: metadata.date_creation,
                        licence: metadata.licence,
                        contributeurs: metadata.contributeurs || []
                    };
                }

                // S'assurer que la cartouche a sa grilleId
                importee.grilleId = importee.grilleId || grilleId;

                const indexBiblio = bibliotheque.findIndex(c => c.id === importee.id);
                if (indexBiblio >= 0) {
                    bibliotheque[indexBiblio] = { ...importee, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                    nbMisesAJour++;
                } else {
                    bibliotheque.push({ ...importee, dateAjoutBiblio: new Date().toISOString() });
                    nbAjoutees++;
                }
            });
        }

        // Sauvegarder uniquement la bibliothèque
        await db.set(CLE_BIBLIOTHEQUE, bibliotheque);

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequeCartouches')) {
            if (typeof afficherBibliothequeCartouches === 'function') {
                await afficherBibliothequeCartouches();
            }
        }

        let message = `✅ Import réussi !\n\n`;
        if (nbAjoutees > 0) message += `${nbAjoutees} nouvelle(s) cartouche(s) ajoutée(s).\n`;
        if (nbMisesAJour > 0) message += `${nbMisesAJour} cartouche(s) mise(s) à jour.\n`;
        message += `\nConsulte « Cartouches disponibles » pour les ajouter à ta sélection.`;
        notifications.succes(message);

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

/**
 * Importe une cartouche depuis un fichier texte Markdown (.txt)
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier .txt sélectionné
 * 2. Parse le contenu Markdown
 * 3. Extrait les commentaires par critère et niveau
 * 4. Remplit la cartouche en cours d'édition
 * 5. Met à jour l'affichage
 *
 * UTILISÉ PAR:
 * - Input file «Importer depuis fichier .txt»
 *
 * PARAMÈTRES:
 * @param {Event} event - Événement de changement du file input
 *
 * FORMAT ATTENDU:
 * ## NOM_DU_CRITÈRE
 *
 * **NOM_DU_CRITÈRE (I)** : Commentaire...
 * **NOM_DU_CRITÈRE (D)** : Commentaire...
 * **NOM_DU_CRITÈRE (M)** : Commentaire...
 * **NOM_DU_CRITÈRE (E)** : Commentaire...
 *
 * VALIDATION:
 * - Vérifie qu'une cartouche est active
 * - Compte les imports réussis
 * - Alerte si aucun import
 */
function importerCartoucheDepuisTxt(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    if (!cartoucheActuel) {
        alert('Veuillez d\'abord sélectionner une grille et créer/sélectionner une cartouche');
        target.value = '';
        return;
    }

    // #531 — les codes de niveau à reconnaître viennent de l'ÉCHELLE de la
    // cartouche ouverte. Ils étaient écrits `[IDME0]` : bon pour l'échelle de
    // Grégoire, muet pour toute autre.
    const niveauxPourLecture = cartoucheActuel.niveaux;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let texte = e.target.result.trim();

            if (!texte) {
                alert('Le fichier est vide');
                return;
            }

            // PRÉ-PROCESSEUR : Nettoyer et normaliser automatiquement le fichier
            // Cela rend l'import beaucoup plus tolérant aux erreurs de format

            // 1. Normaliser les sauts de ligne (Windows/Mac/Linux)
            texte = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // 2. Corriger les astérisques mal placés : **CRITÈRE (N) :** → **CRITÈRE (N)** :
            // #531 — l'alternance des codes RÉELS remplace la classe `[IDME0]`, qui ne
            // valait que pour l'échelle de Grégoire et rien d'autre.
            const _codes = codesNiveauxPourLecture(niveauxPourLecture) || 'IDME0';
            texte = texte.replace(new RegExp('\\*\\*([^*]+)\\((' + _codes + ')\\)\\s*:\\s*\\*\\*', 'g'), '**$1($2)** :');

            // 3. Normaliser les espaces autour des deux-points
            texte = texte.replace(new RegExp('\\*\\*([^*]+)\\((' + _codes + ')\\)\\*\\*\\s*:\\s*', 'g'), '**$1($2)** : ');

            // 4. Supprimer les lignes vides multiples (max 2 sauts de ligne consécutifs)
            texte = texte.replace(/\n{3,}/g, '\n\n');

            // 5. Nettoyer les espaces en fin de ligne
            texte = texte.split('\n').map(l => l.trimEnd()).join('\n');


            // Parser le texte avec support multiligne
            const lignes = texte.split('\n');
            let critereActuel = null;
            let niveauActuel = null;
            let commentaireEnCours = [];
            let compteur = 0;

            // Fonction pour normaliser un nom de critère (pour matching flexible)
            const normaliserNom = (nom) => {
                return nom.toUpperCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Retirer accents
                    .replace(/[^A-Z0-9]/g, ''); // Garder seulement lettres et chiffres
            };

            // Fonction intelligente pour trouver le meilleur critère correspondant
            const trouverCritereCorrespondant = (nomRecherche) => {
                const rechercheNorm = normaliserNom(nomRecherche);

                // Stratégie 1: Correspondance exacte (normalisée)
                let critere = cartoucheActuel.criteres.find(c =>
                    normaliserNom(c.nom) === rechercheNorm
                );
                if (critere) {
                    return critere;
                }

                // Stratégie 2: Le nom recherché est contenu dans le critère
                // Ex: "FRANÇAIS" matcherait "Français écrit"
                critere = cartoucheActuel.criteres.find(c =>
                    normaliserNom(c.nom).includes(rechercheNorm)
                );
                if (critere) {
                    return critere;
                }

                // Stratégie 3: Le critère est contenu dans le nom recherché
                // Ex: "STRUCTURE DE TEXTE" matcherait "Structure"
                critere = cartoucheActuel.criteres.find(c =>
                    rechercheNorm.includes(normaliserNom(c.nom))
                );
                if (critere) {
                    return critere;
                }

                // Stratégie 4: Correspondance floue par distance de Levenshtein simplifiée
                // Trouve le critère le plus proche si la différence est < 3 caractères
                let meilleurMatch = null;
                let meilleurScore = Infinity;

                cartoucheActuel.criteres.forEach(c => {
                    const cnorm = normaliserNom(c.nom);
                    const score = Math.abs(cnorm.length - rechercheNorm.length);
                    if (score < 3 && score < meilleurScore) {
                        // Vérifier si au moins 70% des caractères correspondent
                        const intersection = [...rechercheNorm].filter(char => cnorm.includes(char)).length;
                        const similarite = intersection / Math.max(rechercheNorm.length, cnorm.length);
                        if (similarite > 0.7) {
                            meilleurMatch = c;
                            meilleurScore = score;
                        }
                    }
                });

                if (meilleurMatch) {
                    return meilleurMatch;
                }

                // Aucune correspondance trouvée
                return null;
            };

            // Fonction pour sauvegarder un commentaire complet
            const sauvegarderCommentaire = () => {
                if (niveauActuel && commentaireEnCours.length > 0 && critereActuel) {
                    const commentaire = commentaireEnCours.join(' ').trim();
                    if (commentaire) {
                        // Trouver le critère correspondant avec stratégies multiples
                        const critere = trouverCritereCorrespondant(critereActuel);

                        if (critere) {
                            const key = `${critere.id}_${niveauActuel}`;
                            cartoucheActuel.commentaires[key] = commentaire;
                            compteur++;
                        } else {
                            const critereNormalise = normaliserNom(critereActuel);
                            console.warn(`⚠️ Critère non trouvé: "${critereActuel}" (normalisé: "${critereNormalise}")`);
                        }
                    }
                }
                // Réinitialiser
                niveauActuel = null;
                commentaireEnCours = [];
            };

            lignes.forEach(ligne => {
                ligne = ligne.trim();

                // Ignorer les lignes vides et les séparateurs
                if (!ligne || ligne === '---') {
                    return;
                }

                // Détecter un titre de critère : ## CRITÈRE
                if (ligne.startsWith('##')) {
                    // Sauvegarder le commentaire précédent si nécessaire
                    sauvegarderCommentaire();
                    critereActuel = ligne.replace('##', '').trim().toUpperCase();
                    return;
                }

                // Détecter un début de commentaire : accepte TOUTES les variantes possibles
                // Formats acceptés :
                // - **CRITÈRE (NIVEAU)** :        (format correct)
                // - **CRITÈRE (NIVEAU) :**        (format incorrect mais courant)
                // - **CRITÈRE (NIVEAU):**         (sans espace)
                // - **CRITÈRE (NIVEAU) : **       (astérisques mal placés)
                // Regex ultra-flexible : capture tout entre ** et (NIVEAU), puis ignore tout jusqu'au :
                const matchDebut = ligne.match(new RegExp('^\\*\\*(.+?)\\s*\\(('
                    + (codesNiveauxPourLecture(niveauxPourLecture) || 'IDME0') + ')\\)\\s*[:\\*\\s]+(.*)$'));
                if (matchDebut) {
                    const nomCritere = matchDebut[1].trim().toUpperCase();
                    const niveau = matchDebut[2].trim();
                    const debutCommentaire = matchDebut[3].trim();


                    // Sauvegarder le commentaire précédent si nécessaire
                    sauvegarderCommentaire();

                    // Matching intelligent : utiliser la fonction multi-stratégies
                    // Vérifier d'abord si ça correspond au critère actuel
                    if (critereActuel && normaliserNom(nomCritere) === normaliserNom(critereActuel)) {
                        niveauActuel = niveau;
                        commentaireEnCours = [];
                        if (debutCommentaire) {
                            commentaireEnCours.push(debutCommentaire);
                        }
                    } else {
                        // Si pas de match direct, changer le critère actuel
                        // (cas où on saute une section ou mauvais ordre)
                        critereActuel = nomCritere;
                        niveauActuel = niveau;
                        commentaireEnCours = [];
                        if (debutCommentaire) {
                            commentaireEnCours.push(debutCommentaire);
                        }
                    }
                    return;
                }

                // Si on est en train de collecter un commentaire, ajouter cette ligne
                if (niveauActuel && ligne) {
                    commentaireEnCours.push(ligne);
                }
            });

            // Sauvegarder le dernier commentaire
            sauvegarderCommentaire();

            if (compteur === 0) {
                alert('Aucun commentaire n\'a pu être importé. Vérifie que :\n- Le fichier est au format Markdown attendu\n- Les noms de critères correspondent à ceux de la grille sélectionnée');
                return;
            }

            // Rafraîchir l'affichage
            await afficherMatriceRetroaction();
            await calculerPourcentageComplete();

            notifications.succes(`${compteur} commentaire(s) importé(s) depuis le fichier !`);

        } catch (error) {
            console.error('Erreur d\'import depuis .txt:', error);
            alert('Erreur lors de l\'import du fichier. Vérifie le format.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
}

/**
 * Exporte la cartouche active en fichier texte Markdown (.md)
 * Format compatible avec importerCartoucheDepuisTxt() pour aller-retour
 *
 * STRUCTURE DU FICHIER:
 * - En-tête métadonnées (ignoré par l'import — pas de ## ni **(X)**)
 * - Séparateur ---
 * - Pour chaque critère : ## NOM puis **NOM (I/D/M/E)** : commentaire
 *
 * UTILISÉ PAR:
 * - Bouton «Exporter en texte» dans la barre de boutons d'édition
 */
/**
 * #531 (26 août 2026) — LE MODÈLE VIDE, À DONNER À UNE IA.
 *
 * Demande de Grégoire : pouvoir télécharger un squelette de cartouche construit
 * à partir de la grille et de l'échelle CHOISIES, le faire remplir par une IA,
 * puis le réimporter.
 *
 * ⚠ La différence avec `exporterCartoucheEnTexte` tient en un mot : celle-ci
 * exporte une cartouche qui EXISTE, celle-ci fabrique le squelette AVANT qu'il y
 * en ait une. Les deux produisent le MÊME format — c'est ce qui rend le
 * réimport possible, et c'est pourquoi la structure des lignes est écrite une
 * seule fois, dans `lignesMatriceCartouche`.
 */
function lignesMatriceCartouche(criteres, niveaux, commentaires) {
    const lignes = [];
    const dit = commentaires || {};
    (criteres || []).forEach((critere, index) => {
        lignes.push('## ' + critere.nom);
        lignes.push('');
        (niveaux || []).forEach(niveau => {
            const cle = critere.id + '_' + niveau.code;
            lignes.push('**' + critere.nom + ' (' + niveau.code + ')** : ' + (dit[cle] || ''));
        });
        if (index < (criteres || []).length - 1) {
            lignes.push('');
            lignes.push('---');
            lignes.push('');
        }
    });
    return lignes;
}

/**
 * Le TEXTE du modèle de cartouche — fonction pure, sans DOM ni téléchargement.
 *
 * ⮕ Extraite de `telechargerModeleCartouche` le 27 août 2026 (#549). Tant que la
 * composition vivait derrière un `Blob` et un clic simulé, son contenu n'était
 * vérifiable que de visu : on pouvait prouver que le bouton téléchargeait
 * quelque chose, jamais que ce quelque chose disait ce qu'il fallait.
 *
 * @param {Object} grille - la grille, avec ses `criteres`
 * @param {Object} echelle - l'échelle, avec ses `niveaux`
 * @param {Object|null} production - la production dont on joint les consignes, ou `null`
 * @param {string} nomCartouche - le nom donné à la cartouche
 * @returns {string} le contenu Markdown du fichier
 */
function composerModeleCartouche(grille, echelle, production, nomCartouche) {
    const criteres = (grille && grille.criteres) || [];
    const niveaux = (echelle && echelle.niveaux) || [];

    // ⮕ #549 — LES BLOCS SONT CALCULÉS AVANT LES CONSIGNES, ET C'EST NÉCESSAIRE.
    // La consigne d'ancrage renvoie vers la section « Le travail demandé ». Elle
    // ne doit donc être écrite que si cette section existe VRAIMENT — et une
    // production peut être choisie sans porter la moindre consigne remplie.
    // Conditionner sur la présence de la production, comme le faisait le premier
    // jet, envoyait l'assistant chercher une section absente. Trouvé par un test.
    const blocsConsignes = (production && typeof blocsInformationDocument === 'function')
        ? (blocsInformationDocument(null, {
            production: production,
            inclureObjectif: true,
            inclureDescription: true,
            inclureDetailTache: true
        }) || [])
        : [];
    const aDesConsignes = blocsConsignes.length > 0;

    // ⚠ L'en-tête s'adresse à l'IA autant qu'à l'utilisateur. Il dit le format
    // EXACT à respecter, parce qu'une IA laissée libre reformate — et un fichier
    // reformaté n'est plus réimportable. Il est en commentaire Markdown : le
    // parseur ne lit que les lignes « **Critère (CODE)** : … », il ignore donc
    // tout ceci sans qu'on ait à le lui demander.
    const lignes = [];
    lignes.push('# ' + nomCartouche);
    lignes.push('');
    lignes.push('> CONSIGNES — à lire par l\'assistant, puis à laisser telles quelles.');
    lignes.push('>');
    lignes.push('> Rédige un commentaire de rétroaction pour chaque ligne « ** … ** : » présente');
    lignes.push('> ci-dessous, à la suite des deux-points. Une ligne = un commentaire. Traite toutes');
    lignes.push('> les lignes présentes, aucune de plus, aucune de moins.');
    lignes.push('>');
    lignes.push('> FORMAT (sans quoi la réimportation échoue)');
    lignes.push('> - ne modifie rien de ce qui précède les deux-points : astérisques, nom du critère,');
    lignes.push('>   code entre parenthèses, espaces, ponctuation ;');
    lignes.push('> - un commentaire tient sur une seule ligne, sans saut de ligne, sans puce ;');
    lignes.push('> - pas de gras ni d\'italique : le commentaire s\'affiche tel quel dans');
    lignes.push('>   l\'application, et les astérisques y resteraient visibles ;');
    lignes.push('> - ne touche à aucune autre partie du fichier.');
    lignes.push('>');
    lignes.push('> CE QUE TU ÉCRIS');
    lignes.push('> Le commentaire décrit ce qu\'un travail situé à ce niveau présente pour CE critère.');
    lignes.push('> Aucun travail n\'a été remis au moment où tu écris. N\'invente aucun détail de copie');
    lignes.push('> et ne décris jamais une personne.');
    lignes.push('>');
    lignes.push('> RÉDACTION');
    lignes.push('> Trois phrases, de 45 à 70 mots.');
    lignes.push('> 1. Ce qu\'un travail de ce niveau présente pour ce critère, au présent, sans « tu ».');
    lignes.push('> 2. Ce que ce niveau entraîne pour la suite du travail, ou ce qu\'il révèle de la');
    lignes.push('>    démarche.');
    lignes.push('> 3. Selon la position du niveau dans l\'échelle listée plus bas :');
    lignes.push('>    - niveaux situés sous le seuil de maîtrise : un conseil concret et exécutable,');
    lignes.push('>      introduit par « Pour progresser, » ou « Pour t\'améliorer, », à l\'impératif');
    lignes.push('>      deuxième personne ;');
    lignes.push('>    - niveaux atteignant ou dépassant la maîtrise : aucun conseil, mais un énoncé');
    lignes.push('>      de ce que ce niveau révèle de la démarche. Change de tournure d\'un critère');
    lignes.push('>      à l\'autre ; aucune formule ne doit revenir d\'un critère à l\'autre.');
    lignes.push('>');
    lignes.push('> ANCRAGE');
    if (aDesConsignes) {
        lignes.push('> - Parle de CETTE tâche, décrite plus bas sous « Le travail demandé », jamais');
        lignes.push('>   d\'un travail générique.');
    } else {
        lignes.push('> - AUCUNE TÂCHE N\'EST DÉCRITE dans ce fichier : reste sur le critère lui-même,');
        lignes.push('>   et n\'invente aucun contexte de travail.');
    }
    lignes.push('> - Emploie un vocabulaire constant d\'un niveau à l\'autre pour un même critère, de');
    lignes.push('>   sorte que la progression se lise verticalement d\'un niveau au suivant.');
    lignes.push('> - Aucune note, aucun pourcentage, aucune félicitation adressée à la personne.');
    lignes.push('');

    // ⮕ #549 — LE TRAVAIL DEMANDÉ VIENT AVANT LA MANIÈRE DE L'ÉVALUER.
    //
    // Sans ce bloc, l'assistant recevait les critères et les niveaux, mais pas
    // ce qui avait été demandé à l'élève : il écrivait des commentaires sur une
    // tâche qu'il ne connaissait pas. Symptôme rapporté par Grégoire le 27 août.
    //
    // ⚠ Les blocs viennent de `blocsInformationDocument` (`export-pdf.js`), le
    // composeur du DOCUMENT DE CONSIGNES — titres personnalisés, champs libres,
    // ordre du gabarit. En écrire un second ici ferait diverger deux textes qui
    // décrivent le même travail, et c'est exactement le patron que #529 a passé
    // une session à défaire.
    {
        const blocs = blocsConsignes;
        if (aDesConsignes) {
            lignes.push('## Le travail demandé');
            lignes.push('');
            lignes.push('_Ce que l\'étudiant·e devait faire. Appuie-toi dessus pour écrire des');
            lignes.push('commentaires qui parlent de CETTE tâche, et non d\'un travail générique._');
            lignes.push('');
            blocs.forEach(b => {
                lignes.push('**' + String(b.titre || '').replace(/\s*:\s*$/, '') + '**');
                lignes.push('');
                String(b.texte == null ? '' : b.texte).split('\n').forEach(l => lignes.push(l));
                lignes.push('');
            });
            lignes.push('---');
            lignes.push('');
        }
    }

    lignes.push('Grille : ' + grille.nom);
    lignes.push('Échelle : ' + echelle.nom);
    if (production) {
        lignes.push('Production : ' + (production.activiteApprentissage || production.nom || '(sans nom)'));
    }
    lignes.push('');
    lignes.push('Niveaux, du plus faible au plus élevé :');
    niveaux.forEach(n => {
        const borne = (n.min != null && n.max != null) ? ' [' + n.min + ' à ' + n.max + ' %]' : '';
        lignes.push('- **' + n.code + '** — ' + (n.nom || '') + borne
            + (n.description ? ' : ' + n.description : ''));
    });
    lignes.push('');
    lignes.push('Critères de la grille :');
    criteres.forEach(c => {
        lignes.push('- **' + c.nom + '**'
            + (c.ponderation ? ' (' + c.ponderation + ' %)' : '')
            + (c.description ? ' — ' + c.description : ''));
    });
    lignes.push('');
    lignes.push('---');
    lignes.push('');

    // La matrice, vide — MÊME structure que l'export d'une cartouche remplie.
    lignes.push(...lignesMatriceCartouche(criteres, niveaux, {}));

    return lignes.join('\n');
}

async function telechargerModeleCartouche() {
    const idGrille = (document.getElementById('selectGrilleCartouche') || {}).value;
    const idEchelle = (document.getElementById('selectEchelleCartouche') || {}).value;
    // #549 — la production est FACULTATIVE : un modèle sans consignes reste
    // utile, et l'exiger casserait un usage qui fonctionne depuis le 26 août.
    const idProduction = (document.getElementById('selectProductionCartouche') || {}).value;
    if (!idGrille || !idEchelle) {
        alert('Choisis d\'abord une grille et une échelle : le modèle est construit à partir des deux.');
        return;
    }

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const echelles = await db.get(cle('echellesTemplates')) || [];
    const grille = grilles.find(g => g.id === idGrille);
    const echelle = echelles.find(e => e.id === idEchelle);
    if (!grille || !echelle) {
        alert('Grille ou échelle introuvable.');
        return;
    }

    const criteres = grille.criteres || [];
    const niveaux = echelle.niveaux || [];
    if (criteres.length === 0 || niveaux.length === 0) {
        alert('Cette grille n\'a pas de critères, ou cette échelle pas de niveaux : il n\'y a pas de matrice à décrire.');
        return;
    }

    let production = null;
    if (idProduction) {
        const productions = await db.get(cle('productions')) || [];
        production = productions.find(p => p.id === idProduction) || null;
    }

    const nomCartouche = ((document.getElementById('nomCartouche') || {}).value || '').trim()
        || ('Cartouche — ' + grille.nom);

    const contenu = composerModeleCartouche(grille, echelle, production, nomCartouche);
    const nomFichier = ('modele-' + nomCartouche)
        .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
    const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Le message DIT si les consignes sont parties, parce que c'est le seul
    // moyen de s'apercevoir qu'on a oublié de choisir la production.
    notifications.succes('Modèle téléchargé',
        criteres.length + ' critère(s) × ' + niveaux.length + ' niveau(x) à remplir.'
        + (production
            ? ' Les consignes de « ' + (production.activiteApprentissage || 'la production') + ' » sont jointes.'
            : ' Sans consignes : aucune production choisie.'));
}

async function exporterCartoucheEnTexte() {
    if (!cartoucheActuel) {
        alert('Aucune cartouche active à exporter');
        return;
    }

    const lignes = [];

    // — En-tête métadonnées (informatif, ignoré par l'import) —
    lignes.push('# ' + (cartoucheActuel.nom || 'Cartouche sans nom'));
    lignes.push('');

    // Récupérer le nom de la grille
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === cartoucheActuel.grilleId);
    if (grille) {
        lignes.push('Grille : ' + grille.nom);
    }

    const meta = cartoucheActuel.metadata_cc || {};
    if (meta.auteur_original) {
        lignes.push('Auteur : ' + meta.auteur_original);
    }
    if (cartoucheActuel.dateCreation) {
        const date = new Date(cartoucheActuel.dateCreation);
        lignes.push('Date : ' + date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
    if (cartoucheActuel.description) {
        lignes.push('Description : ' + cartoucheActuel.description);
    }
    if (cartoucheActuel.contexte) {
        lignes.push('Contexte : ' + cartoucheActuel.contexte);
    }

    lignes.push('');
    lignes.push('---');
    lignes.push('');

    // — Matrice critères × niveaux —
    const criteres = cartoucheActuel.criteres || [];
    const niveaux = cartoucheActuel.niveaux || [];
    const commentaires = cartoucheActuel.commentaires || {};

    // #531 — une seule écriture de la structure, partagée avec le MODÈLE vide.
    // Deux copies divergeraient, et un modèle qui ne se relit pas ne sert à rien.
    lignes.push(...lignesMatriceCartouche(criteres, niveaux, commentaires));

    // Générer et télécharger le fichier
    const contenu = lignes.join('\n');
    const nomFichier = (cartoucheActuel.nom || 'cartouche')
        .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
    const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.succes('Cartouche exportée en format texte');
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/**
 * Ajoute une cartouche à une grille spécifique
 * Utilisée par le bouton "+ Ajouter une cartouche" dans chaque section de grille
 *
 * @param {string} grilleId - ID de la grille à laquelle ajouter une cartouche
 *
 * FONCTIONNEMENT:
 * 1. Sélectionne la grille dans le select (pour compatibilité avec l'ancien système)
 * 2. Appelle await initialiserNouveauCartouche() pour créer une nouvelle cartouche
 * 3. Affiche le formulaire d'édition
 */
async function ajouterCartoucheAGrille(grilleId) {
    // Sélectionner la grille dans le select (si existant, pour compatibilité)
    const selectGrille = document.getElementById('selectGrilleRetroaction');
    if (selectGrille) {
        selectGrille.value = grilleId;
    }

    // Masquer les boutons Dupliquer, Exporter, Importer, Supprimer, Export PDF et Export texte (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerCartouche');
    const btnExporter = document.getElementById('btnExporterCartouche');
    const btnImporter = document.getElementById('btnImporterCartouche');
    const btnImporterTxt = document.getElementById('btnImporterCartoucheTxt');
    const btnSupprimer = document.getElementById('btnSupprimerCartouche');
    const btnExportPDFInit = document.getElementById('btnExporterPDFCartouche');
    const btnExportTexteInit = document.getElementById('btnExporterTexteCartouche');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnExporter) btnExporter.classList.add('u-hide');
    if (btnImporter) btnImporter.classList.add('u-hide');
    if (btnImporterTxt) btnImporterTxt.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');
    if (btnExportPDFInit) btnExportPDFInit.classList.add('u-hide');
    if (btnExportTexteInit) btnExportTexteInit.classList.add('u-hide');

    // Initialiser une nouvelle cartouche pour cette grille
    await initialiserNouveauCartouche(grilleId);

    // Afficher les sections nécessaires
    document.getElementById('aucuneEvalRetroaction').classList.add('u-hide');
    document.getElementById('infoCartouche').classList.remove('u-hide');
    document.getElementById('matriceRetroaction').classList.remove('u-hide');

    // NOUVELLE INTERFACE (Beta 80.2): Masquer accueil, afficher zones
    const messageAccueil = document.getElementById('messageAccueilCartouche');
    if (messageAccueil) messageAccueil.classList.add('u-hide');

    const zoneImport = document.getElementById('zoneImportUnifiee');
    if (zoneImport) zoneImport.classList.remove('u-hide');

    // Générer checklist pour import partiel
    genererChecklistCriteresImport();

    // NE PLUS faire de scroll - sidebar reste visible
}

/**
 * Duplique la cartouche actuellement en cours d'édition
 */
async function dupliquerCartoucheActive() {
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) {
        alert('Aucune cartouche à dupliquer');
        return;
    }
    await dupliquerCartouche(cartoucheActuel.id, cartoucheActuel.grilleId);
}

/**
 * Exporte la cartouche actuellement en cours d'édition
 */
async function exporterCartoucheActive() {
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) {
        alert('Aucune cartouche à exporter');
        return;
    }

    const grilleId = cartoucheActuel.grilleId;
    const cartoucheId = cartoucheActuel.id;

    // Récupérer la cartouche
    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    if (!cartouche) {
        alert('Cartouche introuvable');
        return;
    }

    // NOUVEAU (Beta 92): Demander métadonnées enrichies
    // Beta 93: Fix - Utiliser cartouche.nom au lieu de criterenom/niveaunom qui n'existent pas
    const nbCriteres = cartouche.criteres ? cartouche.criteres.length : 0;
    const nbNiveaux = cartouche.niveaux ? cartouche.niveaux.length : 0;
    const description = `${cartouche.nom || 'Cartouche'} (${nbCriteres} critères, ${nbNiveaux} niveaux)`;

    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Cartouche de rétroaction',
        description
    );

    if (!metaEnrichies) {
        return;
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(
        cartouche,
        'cartouche-retroaction',
        cartouche.nom || 'Cartouche',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (accents préservés, horodaté)
    const nomFichier = genererNomFichierExport('cartouche', {
        nom: cartouche.nom || 'cartouche',
        inclureLicence: true,
        precisionDate: 'minute'
    });

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes('Cartouche exportée avec succès');
}

/**
 * Importe un fichier JSON pour remplacer la cartouche actuellement en cours d'édition
 * NOUVEAU (Beta 92): Support métadonnées Creative Commons
 */
function importerDansCartoucheActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Récupérer l'ID de la cartouche active
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) {
        alert('Aucune cartouche sélectionnée. Veuillez d\'abord sélectionner une cartouche à remplacer.');
        event.target.value = ''; // Reset input
        return;
    }

    const grilleId = cartoucheActuel.grilleId;
    const cartoucheId = cartoucheActuel.id;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Valider que c'est bien une cartouche
            if (!donnees || typeof donnees !== 'object') {
                alert('Le fichier JSON n\'est pas valide.');
                event.target.value = '';
                return;
            }

            // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata CC)
            let cartoucheImportee;
            let metadata = null;

            if (donnees.contenu) {
                // Nouveau format avec CC metadata
                metadata = donnees.metadata;
                cartoucheImportee = donnees.contenu;
            } else {
                // Ancien format direct
                cartoucheImportee = donnees;
            }

            // Afficher badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `📋 Matériel sous licence ${metadata.licence}\n` +
                    `👤 Auteur: ${metadata.auteur_original}\n` +
                    `📅 Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `⚠️ ATTENTION: Cette action va remplacer la cartouche actuelle.\n\n` +
                `Veux-tu continuer ?`
            );

            if (!confirmation) {
                event.target.value = '';
                return;
            }

            // Récupérer les cartouches
            const cartouches = await db.get(`cartouches_${grilleId}`) || [];
            const index = cartouches.findIndex(c => c.id === cartoucheId);

            if (index === -1) {
                alert('Cartouche introuvable.');
                event.target.value = '';
                return;
            }

            // Préserver l'ID original et le grilleId, puis remplacer les données
            const cartoucheMiseAJour = {
                ...cartoucheImportee,
                id: cartoucheId, // Garder l'ID original
                grilleId: grilleId // Garder le grilleId original
            };

            // Préserver les métadonnées CC si présentes
            if (metadata) {
                cartoucheMiseAJour.metadata_cc = metadata;
            }

            // Remplacer dans le tableau
            cartouches[index] = cartoucheMiseAJour;

            // Sauvegarder
            await db.set(`cartouches_${grilleId}`, cartouches);

            // Recharger la cartouche dans le formulaire
            await chargerCartouchePourModif(cartoucheId, grilleId);

            notifications.succes('Cartouche importée et remplacée avec succès');

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assure-toi qu\'il s\'agit d\'un fichier valide.');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    reader.readAsText(file);
}

/**
 * Supprime la cartouche actuellement en cours d'édition
 */
async function supprimerCartoucheActive() {
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) {
        alert('Aucune cartouche à supprimer');
        return;
    }
    await supprimerCartoucheConfirm(cartoucheActuel.id, cartoucheActuel.grilleId);
}

/**
 * Annule l'édition et retourne à l'accueil
 */
function annulerFormCartouche() {
    // Masquer les zones d'édition
    const infoCartouche = document.getElementById('infoCartouche');
    const zoneImport = document.getElementById('zoneImportUnifiee');
    const matriceRetroaction = document.getElementById('matriceRetroaction');
    const messageAccueil = document.getElementById('messageAccueilCartouche');

    if (infoCartouche) infoCartouche.classList.add('u-hide');
    if (zoneImport) zoneImport.classList.add('u-hide');
    if (matriceRetroaction) matriceRetroaction.classList.add('u-hide');
    if (messageAccueil) messageAccueil.classList.remove('u-hide');

    // Réinitialiser les champs
    document.getElementById('nomCartouche').value = '';
    document.getElementById('contexteCartouche').value = '';
    var specClear2 = document.getElementById('contexteSpecifiqueCartouche');
    if (specClear2) specClear2.value = '';

    // NOUVEAU (Beta 95): Réinitialiser les dropdowns grille ET échelle
    const selectGrille = document.getElementById('selectGrilleCartouche');
    const selectEchelle = document.getElementById('selectEchelleCartouche');
    if (selectGrille) {
        selectGrille.value = '';
        selectGrille.disabled = false;
    }
    if (selectEchelle) {
        selectEchelle.value = '';
        selectEchelle.disabled = false;
    }
    // #549 — le choix des consignes se remet à « aucune » comme les deux autres.
    const selectProdReset = document.getElementById('selectProductionCartouche');
    if (selectProdReset) selectProdReset.value = '';

}

/**
 * Sauvegarde complète de la cartouche en cours d'édition
 */
async function sauvegarderCartoucheComplete() {
    // 🆕 BETA 95.1 : Garder les IDs pour réafficher après sauvegarde
    const idSauvegarde = window.cartoucheActuel?.id;
    const grilleIdSauvegarde = window.cartoucheActuel?.grilleId;

    // Sauvegarder avec la fonction existante
    // On n'annonce la sauvegarde QUE si l'écriture a eu lieu : `sauvegarderCartouche`
    // abandonne sans écrire quand le nom est vide ou que le dialogue de doublon est
    // annulé. Même patron que grilles.js / echelles.js (#466/CO-16).
    const ecrite = await sauvegarderCartouche();
    if (!ecrite) return;

    // Message de confirmation
    // Le nom est relu dans le champ : `sauvegarderCartouche` y réécrit le nom
    // retenu quand le dialogue de doublon a mené à un renommage.
    const nomCartouche = document.getElementById('nomCartouche')?.value?.trim() || '';
    notifications.succes(`Cartouche "${nomCartouche}" sauvegardée !`);

    // 🆕 BETA 95.1 : Réouvrir la cartouche en mode édition pour qu'elle reste visible
    if (idSauvegarde && grilleIdSauvegarde && typeof chargerCartouchePourModif === 'function') {
        setTimeout(() => {
            chargerCartouchePourModif(idSauvegarde, grilleIdSauvegarde);
        }, 100);
    }
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Fermer modal import cartouches */
function fermerModalImportCartouches() {
    var modal = document.querySelector('.modal-import-cartouches');
    if (modal) {
        modal.remove();
    }
    delete window._cartouchesImportEnAttente;
}

/** Confirmer import + fermer modal */
function confirmerEtFermerImportCartouches() {
    window.confirmerImportCartouches(window._cartouchesImportEnAttente);
    fermerModalImportCartouches();
}

/** Ouvrir file picker import cartouches */
function ouvrirFilePickerImportCartouches() {
    var input = document.getElementById('fichier-import-cartouches-modal');
    if (input) input.click();
}

/* ===============================
   EXPORT DES FONCTIONS GLOBALES
   =============================== */

window.afficherToutesLesGrillesEtCartouches = afficherToutesLesGrillesEtCartouches;
window.ajouterCartoucheAGrille = ajouterCartoucheAGrille;
window.basculerVerrouillageCartouche = basculerVerrouillageCartouche;
window.chargerCartouchePourModif = chargerCartouchePourModif;
window.dupliquerCartouche = dupliquerCartouche;
window.supprimerCartoucheConfirm = supprimerCartoucheConfirm;
window.chargerCartouchesRetroaction = chargerCartouchesRetroaction;
window.sauvegarderCartouche = sauvegarderCartouche;
window.sauvegarderCommentaire = sauvegarderCommentaire;
window.persisterCartouchePartielle = persisterCartouchePartielle;           // #517
window.sauvegarderContexteCartouche = sauvegarderContexteCartouche;         // #517
window.codesNiveauxPourLecture = codesNiveauxPourLecture;                   // #531
window.lireLigneCommentaire = lireLigneCommentaire;                         // #531
window.lignesMatriceCartouche = lignesMatriceCartouche;                     // #531
window.parserMarkdownCartouche = parserMarkdownCartouche;                   // #531 — l'aller-retour est testé
window.composerModeleCartouche = composerModeleCartouche;                   // #549
window.telechargerModeleCartouche = telechargerModeleCartouche;             // #531
window.importerCommentaires = importerCommentaires;
window.initialiserModuleCartouches = initialiserModuleCartouches;

// Nouvelles fonctions Beta 80.2 (interface unifiée)
window.afficherBanqueCartouches = afficherBanqueCartouches;
// window.filtrerCartouchesBanque = filtrerCartouchesBanque; // Fonction commentée (Beta 92)
window.creerNouvelleCartouche = creerNouvelleCartouche;

// Nouvelles fonctions Beta 95 (dropdowns grille + échelle dans formulaire)
window.populerDropdownsCartouche = populerDropdownsCartouche;
window.populerDropdownGrilleCartouche = populerDropdownGrilleCartouche; // Alias compatibilité
window.onChangeSelectionCartouche = onChangeSelectionCartouche;
window.onChangeGrilleCartouche = onChangeGrilleCartouche; // Deprecated
window.initialiserNouveauCartoucheAvecEchelle = initialiserNouveauCartoucheAvecEchelle;
window.importerDepuisMarkdown = importerDepuisMarkdown;
window.importerPartiel = importerPartiel;
window.exporterCartouches = exporterCartouches;
window.importerCartouches = importerCartouches;
window.exporterCartoucheActive = exporterCartoucheActive;
window.importerCartoucheJSON = importerCartoucheJSON;
window.importerCartoucheDepuisTxt = importerCartoucheDepuisTxt;
window.exporterCartoucheEnTexte = exporterCartoucheEnTexte;

// Nouvelles fonctions Beta 90 (boutons dans formulaire)
window.dupliquerCartoucheActive = dupliquerCartoucheActive;
window.exporterCartoucheActive = exporterCartoucheActive;
window.importerDansCartoucheActive = importerDansCartoucheActive;
window.supprimerCartoucheActive = supprimerCartoucheActive;
window.annulerFormCartouche = annulerFormCartouche;
window.sauvegarderCartoucheComplete = sauvegarderCartoucheComplete;
// 🆕 #466/CO-16+CO-20 (21 août 2026) : appelé par changerTrimestreActifV2 — les
// DEUX sources de la cartouche courante (variable globale + window.cartoucheActuel,
// cf. CO-20) sont remises à null ensemble à la bascule.
function reinitialiserEditeurCartouchesApresBascule() { cartoucheActuel = null; window.cartoucheActuel = null; }
window.reinitialiserEditeurCartouchesApresBascule = reinitialiserEditeurCartouchesApresBascule;

// Wrappers délégation (Phase 5)
window.fermerModalImportCartouches = fermerModalImportCartouches;
window.confirmerEtFermerImportCartouches = confirmerEtFermerImportCartouches;
window.ouvrirFilePickerImportCartouches = ouvrirFilePickerImportCartouches;

/* ===============================
   📝 NOTES DE DOCUMENTATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger le module 05-grilles.js (grilles de critères)
 * 3. Charger le module 06-echelles.js (niveaux de performance)
 * 4. Charger ce module 07-cartouches.js
 * 5. Appeler initialiserModuleCartouches() depuis 99-main.js
 *
 * DÉPENDANCES:
 * - echapperHtml() depuis 01-config.js
 * - cartoucheActuel depuis 01-config.js
 * - Classes CSS depuis styles.css
 * - Grilles depuis localStorage (module 05)
 * - Niveaux depuis localStorage (module 06)
 *
 * LOCALSTORAGE:
 * - 'cartouches_{grilleId}' : Array des cartouches par grille
 * - 'grillesTemplates' : Array des grilles (lecture)
 * - 'niveauxEchelle' : Array des niveaux (lecture)
 *
 * MODULES DÉPENDANTS:
 * - 04-productions.js : Utilisera les cartouches pour générer rétroactions
 *
 * STRUCTURE DONNÉES:
 * Cartouche = {
 *   id: string (CART + timestamp),
 *   nom: string,
 *   grilleId: string,
 *   contexte: string,
 *   criteres: [{id, nom}, ...],
 *   niveaux: [{code, nom}, ...],
 *   commentaires: {critereId_niveauCode: string, ...},
 *   verrouille: boolean
 * }
 *
 * ÉVÉNEMENTS:
 * Tous les événements sont gérés via attributs HTML (onchange, onclick)
 * Pas d'addEventListener requis dans 99-main.js
 *
 * FORMAT IMPORT:
 * Markdown avec structure:
 * ## NOM_CRITÈRE
 * **NOM_CRITÈRE (CODE)** : Commentaire
 *
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */

/* ===============================================
   NOUVELLE INTERFACE (Beta 80.2) - BANQUE + IMPORT UNIFIÉS
   Layout 2 colonnes avec sidebar sticky
   =============================================== */

/**
 * Charge le filtre des grilles dans la sidebar
 * Remplit le select avec toutes les grilles disponibles
 */
async function chargerFiltreGrillesCartouche() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const selectFiltre = document.getElementById('filtreGrilleCartouche');

    if (!selectFiltre) return;

    // Garder l'option "Toutes les grilles"
    selectFiltre.innerHTML = '<option value="">Toutes les grilles</option>';

    grilles.forEach(grille => {
        const option = document.createElement('option');
        option.value = grille.id;
        option.textContent = echapperHtml(grille.nom);
        selectFiltre.appendChild(option);
    });
}

/**
 * Affiche la banque des cartouches (liste plate)
 * Peut être filtrée par grille via grilleIdFiltre
 *
 * @param {string} grilleIdFiltre - ID de la grille à filtrer (optionnel)
 */
async function afficherBanqueCartouches(grilleIdFiltre = '') {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    let toutesLesCartouches = [];

    // Récupérer toutes les cartouches de toutes les grilles
    // ✅ CORRECTION: Utiliser for...of au lieu de forEach pour supporter await
    for (const grille of grilles) {
        let cartouches = await db.get(`cartouches_${grille.id}`) || [];

        // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
        // Le pack-demarrage peut stocker un objet au lieu d'un tableau
        if (cartouches && !Array.isArray(cartouches)) {
            cartouches = [cartouches];
        }

        cartouches.forEach(cart => {
            toutesLesCartouches.push({
                ...cart,
                grilleId: grille.id,
                grilleNom: grille.nom
            });
        });
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les cartouches dans la bibliothèque
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const cartouchesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        toutesLesCartouches.filter(c => c.dansBibliotheque !== false)
    );

    // Filtrer si nécessaire
    let cartouchesFiltrees = cartouchesDansBibliotheque;
    if (grilleIdFiltre) {
        cartouchesFiltrees = cartouchesFiltrees.filter(c => c.grilleId === grilleIdFiltre);
    }


    // Générer HTML de la liste
    const container = document.getElementById('listeCartouchesBanque');
    if (!container) {
        console.warn('   ⚠️ Élément listeCartouchesBanque introuvable');
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Bouton "Consulter la bibliothèque" en en-tête
    let html = `
        <div style="margin-bottom: 15px;">
            <button data-action="afficherBibliothequeCartouches" class="btn btn-principal" style="width: 100%; font-size: 0.9rem;">
                Consulter la bibliothèque
            </button>
        </div>
    `;

    if (cartouchesFiltrees.length === 0) {
        container.innerHTML = html + '<p class="sidebar-vide">Crée une nouvelle cartouche ou puisez dans la bibliothèque</p>';
        return;
    }

    html += cartouchesFiltrees.map(cart => {
        const estActive = window.cartoucheActuel?.id === cart.id;
        const verrouIcone = cart.verrouille ? ' <span class="cartouche-texte-warning" title="Verrouillée"><img src="icons/icon-lock.svg" alt="" class="btn-inline-icon"></span>' : '';
        // Générer badges pratiques compatibles (utilise gabarits-utils.js)
        const badgesPratiques = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgesPratiques(cart)
            : '';

        return `
            <div class="sidebar-item ${estActive ? 'active' : ''}"
                 data-cartouche-id="${cart.id}"
                 data-grille-id="${cart.grilleId}"
                 data-action="chargerCartouchePourModif" data-param="${cart.id}" data-param2="${cart.grilleId}">
                <div class="sidebar-item-titre">${echapperHtml(cart.nom)}${verrouIcone}</div>
                <div class="sidebar-item-badges">${badgesPratiques} <span class="badge-caracteristique">${echapperHtml(cart.grilleNom)}</span></div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Filtre les cartouches selon la grille sélectionnée
 * Appelée par le select #filtreGrilleCartouche
 * DÉSACTIVÉ : Filtre retiré de l'interface (Beta 92)
 */
/*
function filtrerCartouchesBanque() {
    const selectFiltre = document.getElementById('filtreGrilleCartouche');
    const grilleId = selectFiltre ? selectFiltre.value : '';

    await afficherBanqueCartouches(grilleId);
}
*/

/**
 * Peuple les dropdowns de sélection de grille et échelle pour les cartouches
 * @param {string} grilleId - ID de la grille à pré-sélectionner (optionnel)
 * @param {string} echelleId - ID de l'échelle à pré-sélectionner (optionnel)
 * @param {boolean} disabled - Si true, désactive les dropdowns (mode édition)
 */
/**
 * Un élément est-il dans la SÉLECTION de l'enseignant (sa barre latérale) ?
 *
 * ⚠ Rapport terrain de Grégoire, 24 août 2026 : « les grilles disponibles dans
 * le dropdown des cartouches ne correspondent pas à celles que j'utilise cet
 * automne. J'utilise 3 grilles, mais celles de H26 sont encore dans le
 * dropdown. » Mesuré sur ses captures : 3 grilles dans la barre latérale,
 * SEPT dans le menu du formulaire.
 *
 * La cause : `afficherListeGrilles` filtre sur `dansBibliotheque !== false`
 * (retirer une grille de sa sélection pose ce drapeau), et ce menu-ci ne
 * filtrait rien. Il offrait donc des grilles d'un trimestre passé, que
 * l'enseignant avait explicitement retirées — et une cartouche configurée sur
 * l'une d'elles se retrouve rattachée à une grille hors de son plan de travail.
 *
 * La convention existe déjà ailleurs dans le projet : `chargerDropdownEchellesMat`
 * (pratiques-gestion.js) l'applique depuis le 10 janvier 2026, avec le même motif.
 *
 * @param {Object} item - grille ou échelle
 * @returns {boolean}
 */
function estDansSelection(item) {
    return !!item && item.dansBibliotheque !== false;
}

async function populerDropdownsCartouche(grilleId = '', echelleId = '', disabled = false) {
    const selectGrille = document.getElementById('selectGrilleCartouche');
    const selectEchelle = document.getElementById('selectEchelleCartouche');

    // Peupler dropdown grille
    if (selectGrille) {
        const toutesGrilles = await db.get(cle('grillesTemplates')) || [];
        // On garde la sélection de l'enseignant, PLUS l'élément actuellement lié :
        // une cartouche déjà rattachée à une grille retirée doit continuer de
        // l'afficher, sinon l'ouvrir pour la lire la relierait en silence à autre
        // chose. On n'en propose pas de nouvelles ; on ne casse pas les anciennes.
        const grilles = toutesGrilles.filter(g =>
            estDansSelection(g) || g.id === grilleId || g.idOriginal === grilleId);
        let optionsHtml = '<option value="">-- Grille --</option>';
        grilles.forEach(grille => {
            const selected = (grille.id === grilleId || grille.idOriginal === grilleId) ? 'selected' : '';
            const nbCriteres = grille.criteres?.length || 0;
            optionsHtml += `<option value="${echapperHtml(grille.id)}" ${selected}>${echapperHtml(grille.nom)} (${nbCriteres} crit.)</option>`;
        });
        selectGrille.innerHTML = optionsHtml;
        // Grille toujours modifiable — les commentaires compatibles sont préservés
        selectGrille.disabled = false;
    }

    // Peupler dropdown échelle
    if (selectEchelle) {
        const toutesEchelles = await db.get(cle('echellesTemplates')) || [];
        const echelles = toutesEchelles.filter(e =>
            estDansSelection(e) || e.id === echelleId || e.idOriginal === echelleId);
        let optionsHtml = '<option value="">-- Échelle --</option>';
        let echelleMatchee = false;
        echelles.forEach(echelle => {
            const match = (echelle.id === echelleId || echelle.idOriginal === echelleId);
            if (match) echelleMatchee = true;
            const selected = match ? 'selected' : '';
            const nbNiveaux = echelle.niveaux?.length || 0;
            optionsHtml += `<option value="${echapperHtml(echelle.id)}" ${selected}>${echapperHtml(echelle.nom)} (${nbNiveaux} niv.)</option>`;
        });
        selectEchelle.innerHTML = optionsHtml;
        // Ne pas désactiver si aucune échelle n'est matchée (permet la correction manuelle)
        selectEchelle.disabled = disabled && echelleMatchee;
    }

    // #549 — Peupler le dropdown des consignes.
    //
    // ⚠ IL NE SERT QU'AU MODÈLE À FAIRE REMPLIR : il ne rattache RIEN, il ne
    // s'enregistre pas dans la cartouche. D'où l'absence de `data-on-change` —
    // sa valeur est lue au moment du téléchargement, et nulle part ailleurs.
    //
    // ⮕ Le libellé dit si la production a des consignes ou non. Sans cette
    // mention, en choisir une qui n'en a pas rend un modèle identique à celui
    // d'avant, sans que rien ne l'explique.
    const selectProduction = document.getElementById('selectProductionCartouche');
    if (selectProduction) {
        const valeurAvant = selectProduction.value;
        const productions = await db.get(cle('productions')) || [];
        const aDesConsignes = (p) => !!(
            (p.objectif && String(p.objectif).trim())
            || (p.tache && String(p.tache).trim())
            || (p.detailTache && String(p.detailTache).trim())
            || (Array.isArray(p.champsPersonnalises)
                && p.champsPersonnalises.some(c => c && c.titre && c.contenu))
        );
        let htmlProd = '<option value="">— aucune —</option>';
        productions
            .filter(p => p && p.type !== 'portfolio')   // le conteneur n'est pas un travail
            .forEach(p => {
                const nom = p.activiteApprentissage || p.nom || '(sans nom)';
                const marque = aDesConsignes(p) ? '' : ' — sans consignes';
                const selected = (p.id === valeurAvant) ? ' selected' : '';
                htmlProd += `<option value="${echapperHtml(p.id)}"${selected}>${echapperHtml(nom + marque)}</option>`;
            });
        selectProduction.innerHTML = htmlProd;
    }
}

// Alias pour compatibilité
async function populerDropdownGrilleCartouche(selectedId = '', disabled = false) {
    await populerDropdownsCartouche(selectedId, '', disabled);
}

/**
 * Gestionnaire unifié de changement de sélection (grille OU échelle)
 * Vérifie si les deux sont sélectionnés pour générer la matrice
 */
async function onChangeSelectionCartouche() {
    const selectGrille = document.getElementById('selectGrilleCartouche');
    const selectEchelle = document.getElementById('selectEchelleCartouche');
    const matriceRetroaction = document.getElementById('matriceRetroaction');

    const grilleId = selectGrille?.value;
    const echelleId = selectEchelle?.value;

    // Si les deux ne sont pas sélectionnés, masquer la matrice
    if (!grilleId || !echelleId) {
        if (matriceRetroaction) matriceRetroaction.classList.add('u-hide');
        return;
    }

    // En mode édition, avertir que la matrice va être reconfigurée
    if (cartoucheActuel && cartoucheActuel.grilleId && cartoucheActuel.grilleId !== grilleId) {
        const ok = confirm('Changer de grille va reconfigurer la matrice.\nLes commentaires des critères communs seront conservés.\n\nContinuer ?');
        if (!ok) {
            // Remettre l'ancienne valeur
            selectGrille.value = cartoucheActuel.grilleId;
            return;
        }
    }

    // Les deux sont sélectionnés - initialiser la cartouche
    await initialiserNouveauCartoucheAvecEchelle(grilleId, echelleId);
}

/**
 * Initialise ou met à jour une cartouche avec grille ET échelle spécifiées
 * Préserve le nom et les commentaires existants lors des changements dynamiques
 * @param {string} grilleId - ID de la grille (critères)
 * @param {string} echelleId - ID de l'échelle (niveaux)
 */
async function initialiserNouveauCartoucheAvecEchelle(grilleId, echelleId) {
    // Récupérer la grille
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) {
        console.error('❌ Grille introuvable:', grilleId);
        return;
    }

    // Récupérer l'échelle
    const echelles = await db.get(cle('echellesTemplates')) || [];
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        console.error('❌ Échelle introuvable:', echelleId);
        return;
    }

    // Les critères viennent de la grille
    const criteres = grille.criteres || [];

    // Les niveaux viennent de l'échelle sélectionnée
    const niveaux = echelle.niveaux || [];


    // Préserver les données existantes si on change de grille/échelle dynamiquement
    const nomActuel = document.getElementById('nomCartouche')?.value || '';
    const contexteActuel = document.getElementById('contexteCartouche')?.value || '';
    const commentairesExistants = cartoucheActuel?.commentaires || {};

    // Créer ou mettre à jour la structure de cartouche
    cartoucheActuel = {
        id: cartoucheActuel?.id || genererIdUnique('CART_'),
        nom: nomActuel,
        grilleId: grilleId,
        echelleId: echelleId,
        contexte: contexteActuel,
        criteres: criteres.map(c => ({ id: c.id, nom: c.nom })),
        niveaux: niveaux.map(n => ({ code: n.code, nom: n.nom })),
        commentaires: commentairesExistants,  // Préserver les commentaires compatibles
        verrouille: false,
        dansBibliotheque: true
    };
    window.cartoucheActuel = cartoucheActuel; // #466/CO-20 : garder les 2 sources alignées (cf. note à la création)

    // Afficher la matrice
    await afficherMatriceRetroaction();
    mettreAJourMetriques();
    document.getElementById('matriceRetroaction').classList.remove('u-hide');
}

/**
 * @deprecated Utiliser onChangeSelectionCartouche() à la place
 */
async function onChangeGrilleCartouche(grilleId) {
    // Rediriger vers la nouvelle fonction unifiée
    await onChangeSelectionCartouche();
}

/**
 * Crée une nouvelle cartouche vide
 * Affiche le formulaire avec dropdowns pour sélectionner grille ET échelle
 */
async function creerNouvelleCartouche() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const echelles = await db.get(cle('echellesTemplates')) || [];

    if (grilles.length === 0) {
        alert('Tu dois d\'abord créer au moins une grille de critères dans la section « Grilles de critères »');
        return;
    }

    if (echelles.length === 0) {
        alert('Tu dois d\'abord créer au moins une échelle de performance dans la section « Échelles de performance »');
        return;
    }

    // Masquer les boutons Dupliquer, Supprimer, Export PDF et Export texte (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerCartouche');
    const btnSupprimer = document.getElementById('btnSupprimerCartouche');
    const btnExportPDFCreation = document.getElementById('btnExporterPDFCartouche');
    const btnExportTexteCreation = document.getElementById('btnExporterTexteCartouche');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');
    if (btnExportPDFCreation) btnExportPDFCreation.classList.add('u-hide');
    if (btnExportTexteCreation) btnExportTexteCreation.classList.add('u-hide');

    // Afficher le formulaire
    const messageAccueil = document.getElementById('messageAccueilCartouche');
    const infoCartouche = document.getElementById('infoCartouche');
    if (messageAccueil) messageAccueil.classList.add('u-hide');
    if (infoCartouche) infoCartouche.classList.remove('u-hide');

    // Réinitialiser les champs
    document.getElementById('nomCartouche').value = '';
    document.getElementById('contexteCartouche').value = '';
    var specClear3 = document.getElementById('contexteSpecifiqueCartouche');
    if (specClear3) specClear3.value = '';

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesCartouche');
    if (panneauMeta) panneauMeta.innerHTML = '';

    // Peupler et activer les dropdowns grille ET échelle
    await populerDropdownsCartouche('', '', false);

    // Masquer la matrice jusqu'à sélection des deux
    const matriceRetroaction = document.getElementById('matriceRetroaction');
    if (matriceRetroaction) matriceRetroaction.classList.add('u-hide');

    // Si une seule grille ET une seule échelle, les sélectionner automatiquement
    if (grilles.length === 1 && echelles.length === 1) {
        const selectGrille = document.getElementById('selectGrilleCartouche');
        const selectEchelle = document.getElementById('selectEchelleCartouche');
        if (selectGrille) selectGrille.value = grilles[0].id;
        if (selectEchelle) selectEchelle.value = echelles[0].id;
        await onChangeSelectionCartouche();
    }

}

/**
 * Définit une cartouche comme active (highlight dans la banque)
 *
 * @param {string} cartoucheId - ID de la cartouche à marquer comme active
 */
function definirCartoucheActive(cartoucheId) {
    // Retirer le highlight de toutes les cartouches
    document.querySelectorAll('.item-cartouche-banque').forEach(item => {
        item.classList.remove('active');
    });

    // Ajouter le highlight à la cartouche active
    const itemActif = document.querySelector(`[data-cartouche-id="${cartoucheId}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

/**
 * Importe des commentaires depuis le textarea Markdown
 * Réutilise la logique existante de parsing
 */
function importerDepuisMarkdown() {
    const textarea = document.getElementById('markdownColle');
    if (!textarea) return;

    const markdown = textarea.value.trim();
    if (!markdown) {
        alert('Veuillez coller du texte Markdown dans la zone prévue');
        return;
    }

    // Vérifier qu'une cartouche est chargée
    if (!window.cartoucheActuel) {
        alert('Veuillez d\'abord créer ou charger une cartouche');
        return;
    }

    // Parser le Markdown (réutilise la fonction existante)
    try {
        const commentairesParsed = parserMarkdownCartouche(markdown);

        // Compter combien de commentaires seront importés
        const nbCommentaires = Object.keys(commentairesParsed).length;

        if (nbCommentaires === 0) {
            alert('Aucun commentaire valide trouvé dans le texte fourni');
            return;
        }

        // Confirmation
        const confirmer = confirm(
            `${nbCommentaires} commentaire(s) seront importés.\n\n` +
            'Les commentaires existants seront remplacés. Continuer ?'
        );

        if (!confirmer) return;

        // Remplir la matrice
        Object.keys(commentairesParsed).forEach(cle => {
            const textareaComment = document.getElementById(`comment_${cle}`);
            if (textareaComment) {
                textareaComment.value = commentairesParsed[cle];
            }
        });

        // Notification succès
        notifications.succes(`${nbCommentaires} commentaires importés avec succès !`);

        // Vider le textarea
        textarea.value = '';

        // Recalculer le pourcentage de complétion
        calculerPourcentageComplet();

    } catch (error) {
        console.error('Erreur lors du parsing Markdown:', error);
        alert('Erreur lors de l\'importation : format Markdown invalide');
    }
}

/**
 * Parse le markdown et retourne un objet {cle: commentaire}
 * Réutilise la logique existante de la fonction importerCommentaires()
 *
 * @param {string} markdown - Texte markdown à parser
 * @returns {Object} Objet avec clés critère_niveau
 */
function parserMarkdownCartouche(markdown, niveaux) {
    const commentaires = {};
    const lignes = markdown.split('\n');

    // #531 — les codes viennent de l'échelle passée par l'appelant, ou de la
    // cartouche ouverte à défaut. Une classe `[IDME]` écrite ici rejetait le
    // niveau 0 de l'échelle « 0-IDME » — et TOUT d'une échelle A/B/C/D.
    const niveauxLus = niveaux || (typeof cartoucheActuel !== 'undefined'
        && cartoucheActuel ? cartoucheActuel.niveaux : null);

    lignes.forEach(ligne => {
        const lu = lireLigneCommentaire(ligne, niveauxLus);
        if (lu && lu.commentaire) {
            commentaires[`${lu.critere.toUpperCase()}_${lu.niveau}`] = lu.commentaire;
        }
    });

    return commentaires;
}

/**
 * Importe seulement les critères sélectionnés (import partiel)
 */
function importerPartiel() {
    const checkboxes = document.querySelectorAll('#checklistCriteresImport input[type="checkbox"]:checked');
    const textarea = document.getElementById('markdownImportPartiel');

    if (checkboxes.length === 0) {
        alert('Veuillez cocher au moins un critère à importer');
        return;
    }

    if (!textarea || !textarea.value.trim()) {
        alert('Veuillez coller du texte Markdown dans la zone prévue');
        return;
    }

    // Parser le markdown
    const commentairesParsed = parserMarkdownCartouche(textarea.value);

    // Filtrer seulement les critères cochés
    const criteresSelectionnes = Array.from(checkboxes).map(cb => cb.value);
    let nbImportes = 0;

    Object.keys(commentairesParsed).forEach(cle => {
        // Extraire le critère de la clé (format: CRITERE_NIVEAU)
        const critere = cle.split('_')[0];

        if (criteresSelectionnes.includes(critere)) {
            const textareaComment = document.getElementById(`comment_${cle}`);
            if (textareaComment) {
                textareaComment.value = commentairesParsed[cle];
                nbImportes++;
            }
        }
    });

    if (nbImportes > 0) {
        notifications.succes(`${nbImportes} commentaires importés (critères sélectionnés)`);
        textarea.value = '';
        calculerPourcentageComplet();
    } else {
        alert('Aucun commentaire n\'a pu être importé. Vérifie les noms de critères.');
    }
}

/**
 * Exporte la cartouche actuellement active en JSON
 */
// OBSOLÈTE : Fonction dupliquée supprimée (exportait dans l'ancien format sans métadonnées CC)
// La fonction exporterCartoucheActive() correcte est définie plus haut (ligne 1885) et utilise ajouterMetadonnéesCC()

/**
 * Importe une cartouche depuis un fichier JSON
 *
 * @param {Event} event - Événement change du input file
 */
function importerCartoucheJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const cartouches = JSON.parse(e.target.result);

            if (!Array.isArray(cartouches) || cartouches.length === 0) {
                alert('Fichier JSON invalide');
                return;
            }

            const cartouche = cartouches[0]; // Prendre la première

            // Demander quelle grille utiliser
            const grilles = await db.get(cle('grillesTemplates')) || [];
            if (grilles.length === 0) {
                alert('Crée d\'abord une grille de critères');
                return;
            }

            const grilleId = grilles[0].id; // Utiliser la première grille par défaut

            // Générer nouvel ID
            cartouche.id = genererIdUnique('CART_');
            cartouche.grilleId = grilleId;

            // Sauvegarder
            const cartouchesExistantes = await db.get(`cartouches_${grilleId}`) || [];
            cartouchesExistantes.push(cartouche);
            await db.set(`cartouches_${grilleId}`, cartouchesExistantes);

            // Rafraîchir l'affichage
            await afficherBanqueCartouches();
            await chargerCartouchePourModif(cartouche.id, grilleId);

            notifications.succes('Cartouche importée avec succès !');

        } catch (error) {
            console.error('Erreur import JSON:', error);
            alert('Erreur lors de l\'importation du fichier JSON');
        }
    };
    reader.readAsText(file);
}

/**
 * Génère la checklist des critères pour l'import partiel
 * Appelée quand une cartouche est chargée
 */
function genererChecklistCriteresImport() {
    if (!window.cartoucheActuel) return;

    const container = document.getElementById('checklistCriteresImport');
    const btnImport = document.getElementById('btnImportPartiel');

    if (!container) return;

    const criteres = window.cartoucheActuel.criteres || [];

    if (criteres.length === 0) {
        container.innerHTML = '<p class="cartouche-texte-gris-italique">Aucun critère disponible</p>';
        if (btnImport) btnImport.disabled = true;
        return;
    }

    const html = criteres.map(crit => {
        return `
            <label>
                <input type="checkbox" value="${crit.nom.toUpperCase()}">
                <span>${echapperHtml(crit.nom)}</span>
            </label>
        `;
    }).join('');

    container.innerHTML = html;
    if (btnImport) btnImport.disabled = false;
}

/* ===============================
   📚 GESTION DE LA BIBLIOTHÈQUE
   ✅ AJOUT (8 décembre 2025)
   =============================== */

/**
 * Affiche le modal de gestion de la bibliothèque de cartouches
 * Permet d'ajouter/retirer des cartouches de la sidebar
 */
async function preparerDonneesBibliothequeCartouches() {
    const grilles = await db.get(cle('grillesTemplates')) || [];

    // Récupérer les cartouches locales (de toutes les grilles)
    let cartouchesLocales = [];
    for (const grille of grilles) {
        let cartouches = await db.get(`cartouches_${grille.id}`) || [];
        if (cartouches && !Array.isArray(cartouches)) cartouches = [cartouches];
        cartouches.forEach(cart => {
            cartouchesLocales.push({ ...cart, grilleId: grille.id, grilleNom: grille.nom });
        });
    }

    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const cartouchesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        cartouchesLocales.filter(c => c.dansBibliotheque !== false)
    );

    let cartouchesDisponibles = cartouchesLocales.filter(c => c.dansBibliotheque === false);
    if (window.CARTOUCHES_BIBLIOTHEQUE) {
        const cartouchesBibliothequePartagee = await obtenirToutesLesCartouchesBibliotheque();
        cartouchesDisponibles = [...cartouchesDisponibles, ...cartouchesBibliothequePartagee];
    }
    cartouchesDisponibles = BibliothequeUI.filtrerParModeDemo(cartouchesDisponibles);

    // #291 — voir le commentaire de grilles.js : réunion des deux magasins
    // avant analyse, sinon un même objet vu des deux côtés passerait pour
    // une collision d'identifiant.
    const doublonsDetectes = analyserDoublons(
        reunirSources(cartouchesDansBibliotheque, cartouchesDisponibles), 'nom');
    const toutesLesGrilleNoms = [...cartouchesLocales, ...cartouchesDisponibles].map(c => c.grilleNom || 'Autre');
    const disciplines = [...new Set(toutesLesGrilleNoms)].sort();

    // Section 1 : groupée par grille (#146)
    const cartesSection1 = [];
    const cartouchesParGrilleSection1 = {};
    cartouchesDansBibliotheque.forEach(c => {
        const g = c.grilleNom || 'Grille inconnue';
        if (!cartouchesParGrilleSection1[g]) cartouchesParGrilleSection1[g] = [];
        cartouchesParGrilleSection1[g].push(c);
    });

    Object.keys(cartouchesParGrilleSection1).sort().forEach(grilleNom => {
        cartouchesParGrilleSection1[grilleNom].forEach(cartouche => {
            cartesSection1.push({
                nom: BibliothequeUI.formaterTitreDemo(cartouche.nom || 'Sans titre', BibliothequeUI.estItemDemo(cartouche)),
                id: cartouche.id,
                afficherId: true,
                badgeSource: BibliothequeUI.genererBadgeSource(cartouche, cartouchesDansBibliotheque),
                metadonnees: BibliothequeUI.formaterMetadonnees(cartouche, {
                    quantite: `${Object.keys(cartouche.commentaires || {}).length} commentaire(s)`
                }),
                description: cartouche.description || '',
                inspireDe: BibliothequeUI.formaterInspireDe(cartouche),
                boutonPrincipal: { label: 'Dupliquer', action: 'dupliquerCartoucheBibliotheque', param: cartouche.id, param2: cartouche.grilleId, classe: 'btn-confirmer', title: 'Créer une copie' },
                actionsMenu: [
                    { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'cartouche', param2: cartouche.id, param3: cartouche.grilleId, classe: 'btn-secondaire', title: 'Générer un fichier .lcz signé à transmettre (#329)' },
                    { label: 'Retirer', action: 'retirerCartoucheDeBibliotheque', param: cartouche.id, param2: cartouche.grilleId, classe: 'btn-secondaire', title: 'Retirer de la barre latérale (données conservées)' },
                    { label: 'Supprimer', action: 'supprimerCartoucheDefinitivement', param: cartouche.id, param2: cartouche.grilleId, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
                ],
                groupe: grilleNom
            });
        });
    });

    // Section 2 : groupée par grille
    const cartesSection2 = [];
    const cartouchesParGrille = {};
    cartouchesDisponibles.forEach(c => {
        const g = c.grilleNom || 'Autre';
        if (!cartouchesParGrille[g]) cartouchesParGrille[g] = [];
        cartouchesParGrille[g].push(c);
    });

    Object.keys(cartouchesParGrille).sort().forEach(grilleNom => {
        cartouchesParGrille[grilleNom].forEach(cartouche => {
            const dejaPresent = cartouchesDansBibliotheque.some(c => c.id === cartouche.id || c.idOriginal === cartouche.id);
            cartesSection2.push({
                nom: BibliothequeUI.formaterTitreDemo(cartouche.nom || 'Sans titre', BibliothequeUI.estItemDemo(cartouche)),
                id: cartouche.id,
                afficherId: true,
                badgeSource: BibliothequeUI.genererBadgeSource(cartouche, cartouchesDansBibliotheque),
                metadonnees: BibliothequeUI.formaterMetadonnees(cartouche, {
                    quantite: `${Object.keys(cartouche.commentaires || {}).length} commentaire(s)`
                }),
                inspireDe: BibliothequeUI.formaterInspireDe(cartouche),
                description: cartouche.description || '',
                dejaPresent: dejaPresent,
                classeItem: 'cartouche-disponible-item',
                dataAttrs: `data-grille="${grilleNom}"`,
                boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterCartoucheIndividuelle', param: cartouche.id, param2: cartouche.grilleId, classe: 'btn-confirmer', title: 'Ajouter cette cartouche à ta sélection' },
                actionsMenu: [
                    { label: 'Supprimer', action: 'supprimerCartoucheDeBibliothequePartagee', param: cartouche.id, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque', showAlways: true }
                ],
                groupe: grilleNom
            });
        });
    });

    const trimestresAvecCartouches = await listerTrimestresAvecCartouches();

    return { cartesSection1, cartesSection2, doublonsDetectes, disciplines, cartouchesDansBibliotheque, trimestresAvecCartouches };
}

async function afficherBibliothequeCartouches() {
    const data = await preparerDonneesBibliothequeCartouches();

    // Section 1
    let contenuSection1 = '';
    if (data.cartesSection1.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune cartouche dans la barre latérale</p>';
    } else {
        let groupeCourant = null;
        data.cartesSection1.forEach(carte => {
            if (carte.groupe && carte.groupe !== groupeCourant) {
                groupeCourant = carte.groupe;
                contenuSection1 += `<h4 style="margin-top: 15px; margin-bottom: 10px; color: var(--gris-moyen);">${groupeCourant}</h4>`;
            }
            contenuSection1 += BibliothequeUI.renderCarteSelection(carte);
        });
    }

    const boutonsApresSection1 = `
        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
            <button data-action="exporterCartouches" class="btn btn-secondaire btn-mini">Exporter toutes mes cartouches (JSON)</button>
            <button data-action="ouvrirFilePickerImportCartouches" class="btn btn-secondaire btn-mini">Importer des cartouches (JSON)</button>
            <button data-action="partageImport.ouvrirSelecteurFichier" class="btn btn-secondaire btn-mini">Importer un partage (.lcz)</button>
            <input type="file" id="fichier-import-cartouches-modal" accept=".json" style="display: none;" data-on-change="importerCartouches">
        </div>`;

    // Filtres Section 2
    const filtresHTML = `
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--gris-moyen); font-weight: 500;">Filtrer par grille :</label>
            <select id="filtreGrilleCartouches" class="controle-form" data-on-change="filtrerCartouchesParGrille" style="max-width: 300px;">
                <option value="">Toutes les grilles</option>
                ${data.disciplines.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
        </div>
        ${BibliothequeUI.renderToggleMasquerDejaPresent('afficherBibliothequeCartouches')}`;

    // Section 2 — filtrage #293 (Masquer les items déjà dans la sidebar)
    const cartesAffichables = BibliothequeUI.filtrerParDejaPresent(data.cartesSection2);
    let contenuSection2 = '';
    let groupeCourant = null;
    cartesAffichables.forEach(carte => {
        if (carte.groupe && carte.groupe !== groupeCourant) {
            groupeCourant = carte.groupe;
            contenuSection2 += `<h4 style="margin-top: 20px; margin-bottom: 10px; color: var(--gris-moyen);">${groupeCourant}</h4>`;
        }
        contenuSection2 += BibliothequeUI.renderCarteDisponible(carte);
    });

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeCartouches',
        titre: 'Bibliothèque de cartouches de rétroaction',
        sousTitre: 'Gérez les cartouches de rétroaction affichées dans la barre latérale.',
        onFermer: 'fermerModalBibliothequeCartouches',
        doublonsHTML: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes, {
            itemsSelection: data.cartouchesDansBibliotheque,
            actions: {
                retirer: 'retirerCartoucheDeBibliotheque',
                supprimer: 'supprimerCartoucheDefinitivement',
                supprimerPartagee: 'supprimerCartoucheDeBibliothequePartagee',
                // Ces deux actions prennent (id, grilleId) : le magasin des
                // cartouches est `cartouches_<grilleId>`, pas une clé unique.
                champParam2: 'grilleId'
            }
        }),
        titreSection1: 'Cartouches dans la barre latérale',
        contenuIdListe1: 'listeCartouchesDansBibliotheque',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        titreSection2: 'Cartouches disponibles à ajouter à la barre latérale',
        filtresSection2: filtresHTML,
        contenuIdListe2: 'listeCartouchesDisponibles',
        contenuSection2: contenuSection2,
        sectionImportTrimestre: genererSectionImportTrimestreCartouches(data.trimestresAvecCartouches),
        sectionPartages: window.partageSection ? partageSection.genererSectionHTML('cartouche') : ''
    });
}

/* ===================================================================
   IMPORT INTER-TRIMESTRE DE CARTOUCHES

   Demandé par Grégoire le 24 août 2026 : « je veux pouvoir importer les
   cartouches d'un autre trimestre, comme je peux le faire avec les autres
   éléments ». Grilles, échelles, productions et pratiques avaient la section ;
   les cartouches, non.

   CE QUI REND CE CAS DIFFÉRENT DES QUATRE AUTRES. Une cartouche n'est pas
   rangée dans une collection à elle : elle est ANCRÉE à sa grille par la clé
   `cartouches_{grilleId}`. Une cartouche sans grille d'accueil n'est pas
   « orpheline » au sens figuré — elle est littéralement introuvable, parce
   qu'il n'existe aucun magasin où la lire. Le projet le dit déjà en toutes
   lettres dans `partageSection.dupliquerVersMesDocuments` : « Une cartouche est
   inutilisable sans sa grille : on duplique la grille parente entière. »

   D'où les deux chemins de `copierCartoucheDepuisTrimestre` :
     · la grille de MÊME LIGNÉE est déjà dans le trimestre actif (l'enseignant
       l'a importée avant) → la cartouche s'y rattache, et AUCUNE seconde grille
       n'est créée. C'est le point qui évite de refabriquer le problème des
       doublons de bibliothèque (#291 / #476) à chaque import de cartouche ;
     · sinon → la grille parente est copiée en n'emportant QUE la cartouche
       demandée, via `dupliquerGrillePartagee` (le lecteur de cartouches est
       injecté, c'est exactement ce pour quoi ce point d'extension existe).

   La lignée est décidée par `memeIdentite` (js/identite-item.js), jamais par le
   nom : Grégoire a deux échelles réellement homonymes en a2025 (#450).
   =================================================================== */

/**
 * Lit les cartouches d'une grille DANS un trimestre source.
 *
 * Routage canonique par `cleSource` : copie d'archive
 * `<srcId>_cartouches_<grilleId>` si elle existe, sinon la clé GLOBALE
 * `cartouches_<grilleId>`.
 *
 * ⚠ CORRECTIF DU 24 AOÛT, ET IL EST LE CŒUR DE LA FONCTIONNALITÉ. Ma première
 * version ne lisait QUE la copie d'archive, par crainte du repli sur le global
 * (#464/CT-26). Cette crainte était mal placée ici, et elle rendait la section
 * INVISIBLE pour le cas le plus courant — celui de Grégoire.
 *
 * Depuis #358, `grillesTemplates` est namespacée pour TOUT trimestre, pas
 * seulement les archivés : un trimestre vivant a ses grilles dans
 * `<srcId>_grillesTemplates` et ses cartouches dans la clé globale, keyée par
 * grille. Comme on n'itère QUE les grilles de la source, et qu'une grille
 * n'appartient qu'à un trimestre, ce global EST celui de la source.
 *
 * Le vrai risque — une grille présente à l'identique dans les deux trimestres,
 * dont le magasin de cartouches est alors littéralement partagé — est écarté en
 * amont par `lotsCartouchesDuTrimestre`, qui exclut ces grilles.
 *
 * Reproduit au navigateur avant correction : trimestre vivant, 2 cartouches
 * dans `cartouches_GR_H26`, section non rendue.
 *
 * @param {string} srcId - id du trimestre source (ex. 'h2026')
 * @param {string} grilleId - id de la grille DANS ce trimestre
 * @returns {Promise<Array>} les cartouches de cette grille, [] si aucune
 */
async function lireCartouchesDuTrimestre(srcId, grilleId) {
    const lot = await db.get(cleSource('cartouches_' + grilleId, srcId));
    return Array.isArray(lot) ? lot : [];
}

/**
 * Inventaire importable d'un trimestre source : ses grilles qui portent des
 * cartouches, chacune avec son lot. Source unique des trois appelants (liste des
 * trimestres, aperçu, « Tout importer ») — sans quoi la règle d'exclusion
 * ci-dessous vivrait en trois exemplaires.
 *
 * @param {string} srcId
 * @returns {Promise<Array<{grille:Object, cartouches:Array}>>}
 */
async function lotsCartouchesDuTrimestre(srcId) {
    const grilles = await db.get(cleSource('grillesTemplates', srcId)) || [];
    const grillesActives = await db.get(cle('grillesTemplates')) || [];
    const idsActifs = new Set(grillesActives.map(g => g && g.id).filter(Boolean));

    const lots = [];
    for (const grille of grilles) {
        if (!grille || !grille.id) continue;
        // Une grille présente À L'IDENTIQUE dans le trimestre actif partage son
        // magasin de cartouches — `cartouches_<id>` est global. Ce ne serait pas
        // un import : ce serait proposer à l'enseignant ses propres cartouches,
        // et les « importer » en ferait des doublons.
        if (idsActifs.has(grille.id)) continue;
        const cartouches = await lireCartouchesDuTrimestre(srcId, grille.id);
        if (cartouches.length > 0) lots.push({ grille, cartouches });
    }
    return lots;
}

/**
 * Liste les trimestres qui possèdent des cartouches PROPRES (copies d'archive),
 * avec leur compte. Calque de `listerTrimestresAvecGrilles` : un trimestre
 * vivant partage le catalogue global, il n'y a rien à lui importer.
 *
 * @returns {Promise<Array<{id:string, nom:string, nombre:number}>>}
 */
async function listerTrimestresAvecCartouches() {
    if (typeof obtenirTrimestres !== 'function' || typeof cleSource !== 'function') return [];
    // Garde D-C7, reprise des grilles : la CIBLE d'un import n'est JAMAIS un
    // trimestre archivé — la copie irait dans le catalogue global, invisible
    // depuis l'actif. Aucune source listée → pas de section affichée.
    if (window.estTrimestreArchive && window.estTrimestreArchive()) return [];

    const actif = (typeof obtenirTrimestreId === 'function')
        ? obtenirTrimestreId()
        : (window.trimestreActif || '');

    const resultat = [];
    for (const t of (obtenirTrimestres() || [])) {
        if (!t || !t.id || t.id === actif) continue;

        const lots = await lotsCartouchesDuTrimestre(t.id);
        const nombre = lots.reduce((n, lot) => n + lot.cartouches.length, 0);
        if (nombre > 0) resultat.push({ id: t.id, nom: t.nom || t.id, nombre });
    }

    resultat.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return resultat;
}

/**
 * Construit le bloc « Importer depuis un autre trimestre » du modal.
 * Rien à importer → chaîne vide, et `creerModal` n'affiche aucune section.
 */
function genererSectionImportTrimestreCartouches(trimestres) {
    if (!Array.isArray(trimestres) || trimestres.length === 0) return '';

    const options = trimestres.map(t =>
        `<option value="${echapperHtml(t.id)}">${echapperHtml(t.nom)} (${t.nombre} cartouche${t.nombre > 1 ? 's' : ''})</option>`
    ).join('');

    return `
        <div style="margin-top: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 6px; border: 1px solid var(--bordure-claire);">
            <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre</h4>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <select id="selectTrimestreImportCartouches" class="controle-form" style="flex: 1; min-width: 200px;">
                    <option value="">-- Choisir un trimestre --</option>
                    ${options}
                </select>
                <button data-action="afficherCartouchesTrimestreModal" class="btn btn-secondaire btn-compact">Voir les cartouches</button>
                <button data-action="importerToutCartouchesTrimestreModal" class="btn btn-principal btn-compact">Tout importer</button>
            </div>
            <p style="margin: 10px 0 0; font-size: 0.85rem; color: var(--gris-moyen);">
                Une cartouche arrive toujours avec sa grille : si la grille est déjà dans ce trimestre, la cartouche s'y range ; sinon la grille est copiée avec elle.
            </p>
            <div id="previewCartouchesTrimestre" class="u-hide" style="margin-top: 10px;"></div>
        </div>`;
}

/**
 * Pose la trace de provenance sur une COPIE de la cartouche source.
 *
 * Les DEUX chemins de `copierCartoucheDepuisTrimestre` passent par ici, et c'est
 * le point : `dupliquerGrillePartagee` recopie la cartouche via `copiePropre`,
 * qui remplace l'`id` sans rien poser d'autre. Sans cette trace, la cartouche
 * arrivée par le chemin « copie de la grille » ne portait AUCUNE lignée — et le
 * réimport suivant, passé par le rattachement, ne la reconnaissait pas : deux
 * exemplaires de la même cartouche, en silence. Trouvé par la preuve
 * d'intégration, pas par la sentinelle unitaire, qui n'enchaînait pas les deux
 * chemins.
 *
 * @param {Object} cartoucheSource
 * @param {string} srcId - id du trimestre source
 * @returns {Object} copie tracée (la source n'est pas touchée)
 */
function marquerProvenanceCartouche(cartoucheSource, srcId) {
    return {
        ...cartoucheSource,
        idOriginal: cartoucheSource.id,
        inspireDe: BibliothequeUI.forgerInspireDe(cartoucheSource),
        inspireDeTrimestre: srcId,
        dansBibliotheque: true,
        dateImport: new Date().toISOString()
    };
}

/**
 * Copie UNE cartouche d'un trimestre source vers le trimestre ACTIF.
 * La source n'est jamais mutée (la copie part d'un littéral neuf).
 *
 * @param {string} srcId - id du trimestre source
 * @param {Object} grilleSource - la grille parente, telle que lue dans la source
 * @param {Object} cartoucheSource - la cartouche à copier
 * @returns {Promise<{ajoutee:boolean, conflit:Object|null, grilleCreee:Object|null, grilleAccueil:Object|null}>}
 */
async function copierCartoucheDepuisTrimestre(srcId, grilleSource, cartoucheSource) {
    const grillesLocales = await db.get(cle('grillesTemplates')) || [];
    const grilleAccueil = grillesLocales.find(g => memeIdentite(g, grilleSource)) || null;

    // Chemin 1 — aucune grille d'accueil : la cartouche n'aurait aucun magasin
    // où vivre. On copie la grille parente en n'emportant QUE cette cartouche.
    if (!grilleAccueil) {
        const source = Object.assign({}, grilleSource, {
            inspireDe: BibliothequeUI.forgerInspireDe(grilleSource),
            inspireDeTrimestre: srcId
        });
        const res = partageSection.dupliquerGrillePartagee(
            source,
            () => [marquerProvenanceCartouche(cartoucheSource, srcId)]
        );
        return { ajoutee: true, conflit: null, grilleCreee: res.grille, grilleAccueil: null };
    }

    // Chemin 2 — la grille de même lignée est déjà là : la cartouche s'y range.
    const cleDest = `cartouches_${grilleAccueil.id}`;
    const existantes = await db.get(cleDest) || [];

    const copie = {
        ...marquerProvenanceCartouche(cartoucheSource, srcId),
        id: genererIdUnique('CART_'),
        grilleId: grilleAccueil.id
    };

    // #476 — garde d'identité AU POINT D'ÉCRITURE : réimporter deux fois la même
    // cartouche ne doit pas en empiler deux exemplaires silencieusement.
    const garde = ajouterAvecGardeIdentite(existantes, copie);
    if (!garde.ajoute) {
        return { ajoutee: false, conflit: garde.conflit, grilleCreee: null, grilleAccueil };
    }

    // security-ok: la source est une copie d'archive écrite par l'app elle-même, pas un fichier externe.
    await db.set(cleDest, garde.liste);
    return { ajoutee: true, conflit: null, grilleCreee: null, grilleAccueil };
}

/** État de la section d'import, à reposer après reconstruction du modal. */
function etatImportCartouches() {
    return BibliothequeUI.capturerImportTrimestre({
        modalId: 'modalBibliothequeCartouches',
        selects: ['selectTrimestreImportCartouches'],
        apercu: 'previewCartouchesTrimestre'
    });
}

/**
 * Bouton « Voir les cartouches » : liste les cartouches du trimestre choisi,
 * groupées par leur grille, avec un bouton « Importer » par ligne.
 */
async function afficherCartouchesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportCartouches');
    const preview = document.getElementById('previewCartouchesTrimestre');
    if (!select || !preview) return;

    const srcId = select.value;
    if (!srcId) { preview.classList.add('u-hide'); return; }

    const lots = await lotsCartouchesDuTrimestre(srcId);
    const grillesLocales = await db.get(cle('grillesTemplates')) || [];

    let html = '<div style="max-height: 260px; overflow-y: auto; border: 1px solid var(--bordure-claire); border-radius: 4px; padding: 10px;">';
    let total = 0;

    for (const { grille, cartouches } of lots) {
        const dejaLa = grillesLocales.some(g => memeIdentite(g, grille));
        const mention = dejaLa
            ? 'sa grille est déjà dans ce trimestre'
            : 'sa grille sera copiée avec elle';

        html += `<h5 style="margin: 12px 0 6px; color: var(--gris-moyen); font-size: 0.9rem;">
                    ${echapperHtml(grille.nom || 'Grille sans titre')}
                    <span style="font-weight: 400; font-style: italic;"> — ${mention}</span>
                 </h5>`;

        cartouches.forEach(cartouche => {
            total++;
            const nbCommentaires = Object.keys(cartouche.commentaires || {}).length;
            html += `
                <div style="padding: 8px; border-bottom: 1px solid var(--bordure-claire); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div style="min-width: 0;">
                        <strong>${echapperHtml(cartouche.nom || 'Sans titre')}</strong>
                        <br><small style="color: var(--gris-moyen);">${nbCommentaires} commentaire${nbCommentaires > 1 ? 's' : ''}</small>
                    </div>
                    <button data-action="importerUneCartoucheTrimestre" data-param="${echapperHtml(srcId)}" data-param2="${echapperHtml(grille.id)}" data-param3="${echapperHtml(cartouche.id)}" class="btn btn-confirmer btn-tres-compact">
                        Importer
                    </button>
                </div>`;
        });
    }
    html += '</div>';

    preview.innerHTML = total > 0
        ? html
        : '<p style="color: var(--gris-clair); font-style: italic;">Aucune cartouche trouvée dans ce trimestre.</p>';
    preview.classList.remove('u-hide');
}

/**
 * Bouton « Importer » d'une ligne d'aperçu : copie UNE cartouche.
 */
async function importerUneCartoucheTrimestre(srcId, grilleId, cartoucheId) {
    if (window.estTrimestreArchive && window.estTrimestreArchive()) {
        alert('Import impossible : le trimestre actif est archivé (consultation). Active un trimestre courant pour importer des cartouches.');
        return;
    }

    const grilles = await db.get(cleSource('grillesTemplates', srcId)) || [];
    const grilleSource = grilles.find(g => g && g.id === grilleId);
    if (!grilleSource) { alert('Grille introuvable dans le trimestre source.'); return; }

    const cartouches = await lireCartouchesDuTrimestre(srcId, grilleId);
    const cartoucheSource = cartouches.find(c => c && c.id === cartoucheId);
    if (!cartoucheSource) { alert('Cartouche introuvable dans le trimestre source.'); return; }

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportCartouches();

    const res = await copierCartoucheDepuisTrimestre(srcId, grilleSource, cartoucheSource);

    await afficherBanqueCartouches();
    await afficherBibliothequeCartouches();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherCartouchesTrimestreModal);

    if (!res.ajoutee) {
        const nomEnPlace = (res.conflit && res.conflit.nom) || 'Cette cartouche';
        notifications.info(
            `« ${nomEnPlace} » est déjà dans ce trimestre.`,
            'Pour en avoir un second exemplaire, utilise « Dupliquer ».');
        return;
    }

    const nom = cartoucheSource.nom || 'Cartouche';
    notifications.succes(
        `« ${nom} » importée dans ce trimestre.`,
        res.grilleCreee
            ? `Sa grille « ${res.grilleCreee.nom || 'Sans titre'} » a été copiée avec elle.`
            : `Rangée dans « ${(res.grilleAccueil && res.grilleAccueil.nom) || 'sa grille'} », déjà présente.`);
}

/**
 * Bouton « Tout importer » : copie toutes les cartouches du trimestre choisi.
 */
async function importerToutCartouchesTrimestreModal() {
    if (window.estTrimestreArchive && window.estTrimestreArchive()) {
        alert('Import impossible : le trimestre actif est archivé (consultation). Active un trimestre courant pour importer des cartouches.');
        return;
    }

    const select = document.getElementById('selectTrimestreImportCartouches');
    if (!select || !select.value) { alert('Sélectionne d\'abord un trimestre.'); return; }

    const srcId = select.value;
    const trimestres = (typeof obtenirTrimestres === 'function') ? (obtenirTrimestres() || []) : [];
    const trimSrc = trimestres.find(t => t && t.id === srcId);
    const nomTrim = (trimSrc && trimSrc.nom) ? trimSrc.nom : srcId;

    // Inventaire AVANT de demander confirmation : le nombre annoncé est mesuré,
    // jamais estimé.
    const lots = await lotsCartouchesDuTrimestre(srcId);

    const total = lots.reduce((n, lot) => n + lot.cartouches.length, 0);
    if (total === 0) { alert('Aucune cartouche à importer dans ce trimestre.'); return; }

    const etatSection = etatImportCartouches();

    const confirmation = confirm(
        `Veux-tu importer les ${total} cartouche(s) de ${nomTrim} dans ce trimestre ?\n\n` +
        'Chaque cartouche est COPIÉE (l\'original du trimestre source reste intact). ' +
        'Une grille absente d\'ici est copiée avec ses cartouches.'
    );
    if (!confirmation) return;

    let ajoutees = 0;
    let deja = 0;
    let grillesCreees = 0;
    for (const lot of lots) {
        for (const cartouche of lot.cartouches) {
            const res = await copierCartoucheDepuisTrimestre(srcId, lot.grille, cartouche);
            if (res.ajoutee) {
                ajoutees++;
                if (res.grilleCreee) grillesCreees++;
            } else {
                deja++;
            }
        }
    }

    await afficherBanqueCartouches();
    await afficherBibliothequeCartouches();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherCartouchesTrimestreModal);

    let details = `${ajoutees} cartouche(s) copiée(s).`;
    if (grillesCreees > 0) details += ` ${grillesCreees} grille(s) copiée(s) avec elles.`;
    if (deja > 0) details += ` ${deja} étai(en)t déjà présente(s).`;
    notifications.succes('Import terminé', details);
}

/**
 * Retirer une cartouche de la bibliothèque (soft delete)
 * @param {string} id - ID de la cartouche
 * @param {string} grilleId - ID de la grille parente
 */
/**
 * ✅ AJOUT (8 décembre 2025) : Ajoute une cartouche individuelle à la bibliothèque
 */
async function ajouterCartoucheIndividuelle(id, grilleId) {
    try {
        // Résoudre le grilleId vers une grille locale (le grilleId partagé peut différer)
        const grilles = await db.get(cle('grillesTemplates')) || [];
        let grilleLocale = grilles.find(g => g.id === grilleId);
        if (!grilleLocale) {
            grilleLocale = grilles.find(g => g.idOriginal === grilleId);
        }
        const grilleIdLocal = grilleLocale ? grilleLocale.id : grilleId;

        let cartouches = await db.get(`cartouches_${grilleIdLocal}`) || [];
        let cartouche = cartouches.find(c => c.id === id);
        if (!cartouche) {
            cartouche = cartouches.find(c => c.idOriginal === id);
        }

        if (!cartouche) {
            const toutesCartouches = await obtenirToutesLesCartouchesBibliotheque();
            const cartoucheSource = toutesCartouches.find(c => c.id === id);
            if (cartoucheSource) {
                if (!grilleLocale) {
                    alert('Veuillez d\'abord importer la grille associée depuis la bibliothèque de grilles.');
                    return;
                }
                // Générer un nouvel ID pour éviter les conflits (pattern Productions)
                const nouvelId = genererIdUnique('CART_');
                cartouche = {
                    ...cartoucheSource,
                    id: nouvelId,
                    idOriginal: cartoucheSource.id,
                    dansBibliotheque: true,
                    dateImport: new Date().toISOString()
                };
                // #476 — garde d'identité au point d'écriture (cf. grilles.js).
                const gardeCartouche = ajouterAvecGardeIdentite(cartouches, cartouche);
                if (!gardeCartouche.ajoute) {
                    const nomEnPlace = (gardeCartouche.conflit && gardeCartouche.conflit.nom) || 'Une cartouche';
                    alert(`« ${nomEnPlace} » est déjà dans ta sélection.\n\nPour en avoir un second exemplaire, utilise « Dupliquer ».`);
                    return;
                }
                cartouches = gardeCartouche.liste;
            } else {
                alert('Cartouche introuvable');
                return;
            }
        } else {
            cartouche.dansBibliotheque = true;
        }

        await db.set(`cartouches_${grilleIdLocal}`, cartouches);

        // ⚠ Relecture-vérification : `db.set` refuse en silence (cf. grilles.js).
        const verifCartouche = await db.get(`cartouches_${grilleIdLocal}`) || [];

        fermerModalBibliothequeCartouches();
        await afficherBanqueCartouches();
        await afficherBibliothequeCartouches();

        if (!verifCartouche.some(c => c.id === cartouche.id)) {
            console.error('[cartouches] Écriture non confirmée —', cartouche.id, 'absente après db.set.');
            alert(`« ${cartouche.nom || 'Cartouche'} » n'a PAS pu être ajoutée.\n\nL'enregistrement a été refusé. Ouvre la console pour la raison.`);
            return;
        }

        notifications.succes('Cartouche ajoutée à ta sélection !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de la cartouche');
    }
}

async function retirerCartoucheDeBibliotheque(id, grilleId) {
    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const cartouche = cartouches.find(c => c.id === id);

    if (cartouche) {
        cartouche.dansBibliotheque = false;
        await db.set(`cartouches_${grilleId}`, cartouches);

        // Rafraîchir le modal et la sidebar
        fermerModalBibliothequeCartouches();
        await afficherBanqueCartouches();
        await afficherBibliothequeCartouches();
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une cartouche (hard delete)
 * @param {string} id - ID de la cartouche à supprimer
 * @param {string} grilleId - ID de la grille associée
 */
async function supprimerCartoucheDefinitivement(id, grilleId) {
    const cartouches = await db.get(`cartouches_${grilleId}`) || [];
    const cartouche = cartouches.find(c => c.id === id);

    if (!cartouche) return;

    // Confirmation
    if (!confirm(`Supprimer définitivement la cartouche «${cartouche.nom}» ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Marquer comme supprimée si c'est un gabarit hardcodé
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    // Suppression définitive du store local
    const nouveauxCartouches = cartouches.filter(c => c.id !== id);
    await db.set(`cartouches_${grilleId}`, nouveauxCartouches);

    // Suppression du store partagé
    if (typeof retirerCartoucheDeLaBibliotheque === 'function') {
        await retirerCartoucheDeLaBibliotheque(id);
    }

    // Rafraîchir UI
    fermerModalBibliothequeCartouches();
    await afficherBanqueCartouches();
    await afficherBibliothequeCartouches();

}

/**
 * Supprimer une cartouche de la bibliothèque partagée uniquement (Section 2)
 * @param {string} id - ID de la cartouche à supprimer
 */
async function supprimerCartoucheDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesCartouchesBibliotheque === 'function'
        ? await obtenirToutesLesCartouchesBibliotheque()
        : [];
    const cartouche = biblio.find(c => c.id === id);
    if (!cartouche) return;

    if (!confirm(`Supprimer définitivement «${cartouche.nom || 'Sans titre'}» de la bibliothèque partagée ?\n\nCette action est irréversible.`)) return;

    // #468/CO-25 (21 août 2026) : poser le tombstone AVANT le retrait. Sans lui,
    // un gabarit fourni par défaut revenait au prochain chargement — la
    // suppression semblait marcher, puis se défaisait toute seule.
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    await retirerCartoucheDeLaBibliotheque(id);

    fermerModalBibliothequeCartouches();
    await afficherBibliothequeCartouches();
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une cartouche dans la bibliothèque
 * @param {string} id - ID de la cartouche à dupliquer
 * @param {string} grilleId - ID de la grille associée
 */
/**
 * Phase 4.B : fork une cartouche démo et charge la copie en édition.
 * grilleId est lu depuis cartoucheActuel (état courant du formulaire).
 */
async function dupliquerEtEditerCartouche(id) {
    const grilleId = (cartoucheActuel && cartoucheActuel.grilleId) || '';
    if (!grilleId) {
        alert('Grille introuvable pour cette cartouche');
        return;
    }
    // #476 volet 2 — séquence partagée. Les cartouches sont la seule famille
    // dont la clé est PARAMÉTRÉE par la grille porteuse : c'est pourquoi le
    // descripteur reçoit des rappels et non un nom de clé constant. Pas de
    // rafraîchissement de liste ici : cette voie n'en faisait pas.
    await BibliothequeUI.dupliquerEtEditerItem({
        id: id,
        prefixeId: 'CART_',
        lireListe: async () => await db.get(`cartouches_${grilleId}`) || [],
        ecrireListe: async (liste) => { await db.set(`cartouches_${grilleId}`, liste); }, // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement par forkerItem — aucune source externe
        chargerPourModif: async (idCopie) => { await chargerCartouchePourModif(idCopie, grilleId); },
        champFocus: 'nomCartouche'
    });
}

async function dupliquerCartoucheBibliotheque(id, grilleId) {
    // #476 volet 2 — séquence partagée. Clé PARAMÉTRÉE par la grille porteuse :
    // d'où des rappels de lecture/écriture plutôt qu'un nom de clé constant.
    await BibliothequeUI.dupliquerVersBibliotheque({
        id: id,
        prefixeId: 'CART_',
        lireListe: async () => await db.get(`cartouches_${grilleId}`) || [],
        ecrireListe: async (liste) => { await db.set(`cartouches_${grilleId}`, liste); }, // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
        nommerLaCopie: (copie, source, liste) => { copie.nom = nommerCopie(source.nom, liste); },
        forgerProvenance: (source) => BibliothequeUI.forgerInspireDe(source),
        siIntrouvable: () => alert('Cartouche introuvable'),
        rafraichirUI: async () => {
            fermerModalBibliothequeCartouches();
            await afficherBanqueCartouches();
            await afficherBibliothequeCartouches();
        }
    });
}

/**
 * Ajouter les cartouches sélectionnées à la bibliothèque
 */
async function ajouterCartouchesABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeCartouchesDisponibles input[type="checkbox"]:checked');
    let nbAjoutees = 0;

    for (const checkbox of checkboxes) {
        const id = checkbox.value;
        const grilleId = checkbox.dataset.grilleId;

        // Cas 1: Cartouche locale
        if (grilleId && grilleId !== 'undefined') {
            const cartouches = await db.get(`cartouches_${grilleId}`) || [];
            const cartouche = cartouches.find(c => c.id === id);

            if (cartouche) {
                cartouche.dansBibliotheque = true;
                await db.set(`cartouches_${grilleId}`, cartouches);
                nbAjoutees++;
            }
        }
        // Cas 2: Cartouche de la bibliothèque partagée - copier dans localStorage
        else {
            const cartouchesBibliotheque = await obtenirToutesLesCartouchesBibliotheque();
            const cartouche = cartouchesBibliotheque.find(c => c.id === id);

            if (cartouche) {
                // Trouver ou créer la grille correspondante
                let grilles = await db.get(cle('grillesTemplates')) || [];
                let grilleParente = grilles.find(g => g.id === cartouche.grilleId);

                if (!grilleParente) {
                    // Créer une grille minimale si elle n'existe pas
                    grilleParente = {
                        id: cartouche.grilleId,
                        nom: cartouche.grilleNom || cartouche.discipline || 'Grille importée',
                        criteres: cartouche.criteres || [],
                        discipline: cartouche.discipline || ''
                    };
                    grilles.push(grilleParente);
                    await db.set(cle('grillesTemplates'), grilles);
                }

                // Ajouter la cartouche
                const cartouchesGrille = await db.get(`cartouches_${cartouche.grilleId}`) || [];
                const nouvelleCartouche = {
                    ...cartouche,
                    id: genererIdUnique('CART_'),
                    dansBibliotheque: true
                };
                cartouchesGrille.push(nouvelleCartouche);
                await db.set(`cartouches_${cartouche.grilleId}`, cartouchesGrille);
                nbAjoutees++;
            }
        }
    }

    if (nbAjoutees > 0) {
        fermerModalBibliothequeCartouches();
        await afficherBanqueCartouches();
    }
}

/**
 * Filtrer les cartouches disponibles par grille
 */
function filtrerCartouchesParGrille() {
    const filtre = document.getElementById('filtreGrilleCartouches').value;
    const items = document.querySelectorAll('.cartouche-disponible-item');

    items.forEach(item => {
        toggleDisplay(item, filtre === '' || item.dataset.grille === filtre);
    });
}

/**
 * Fermer le modal de gestion de bibliothèque
 */
function fermerModalBibliothequeCartouches() {
    BibliothequeUI.fermerModal('modalBibliothequeCartouches');
}

// Exporter les fonctions
window.afficherBibliothequeCartouches = afficherBibliothequeCartouches;
window.retirerCartoucheDeBibliotheque = retirerCartoucheDeBibliotheque;
window.ajouterCartouchesABibliotheque = ajouterCartouchesABibliotheque;
window.filtrerCartouchesParGrille = filtrerCartouchesParGrille;
window.fermerModalBibliothequeCartouches = fermerModalBibliothequeCartouches;
window.ajouterCartoucheIndividuelle = ajouterCartoucheIndividuelle;
window.dupliquerCartoucheBibliotheque = dupliquerCartoucheBibliotheque;
window.dupliquerEtEditerCartouche = dupliquerEtEditerCartouche;
window.supprimerCartoucheDefinitivement = supprimerCartoucheDefinitivement;
window.supprimerCartoucheDeBibliothequePartagee = supprimerCartoucheDeBibliothequePartagee;

// Import inter-trimestre de cartouches (24 août 2026). Les trois premiers sont
// les cibles des `data-action` du modal ; les suivants sont exposés pour être
// éprouvés (sentinelle Vitest + preuve d'intégration).
window.afficherCartouchesTrimestreModal = afficherCartouchesTrimestreModal;
window.importerUneCartoucheTrimestre = importerUneCartoucheTrimestre;
window.importerToutCartouchesTrimestreModal = importerToutCartouchesTrimestreModal;
window.listerTrimestresAvecCartouches = listerTrimestresAvecCartouches;
window.copierCartoucheDepuisTrimestre = copierCartoucheDepuisTrimestre;
window.lireCartouchesDuTrimestre = lireCartouchesDuTrimestre;
window.lotsCartouchesDuTrimestre = lotsCartouchesDuTrimestre;
window.genererSectionImportTrimestreCartouches = genererSectionImportTrimestreCartouches;

/**
 * Importe une liste de cartouches externes (archives, voûte, etc.).
 * Les cartouches sont distribués dans cartouches_{grilleId} selon leur grilleId.
 *
 * @param {Array} nouveauxCartouches - Cartouches à importer (chacun doit avoir grilleId)
 * @param {Object} [options]
 * @param {boolean} [options.remplacer=false] - Remplacer si même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre de cartouches ajoutés/mis à jour
 */
window.importerCartouchesExternes = function(nouveauxCartouches, options) {
    if (!nouveauxCartouches || nouveauxCartouches.length === 0) return 0;
    options = options || {};

    var parGrille = {};
    for (var i = 0; i < nouveauxCartouches.length; i++) {
        var c = nouveauxCartouches[i];
        if (!c || !c.id || !c.grilleId) continue;
        if (!parGrille[c.grilleId]) parGrille[c.grilleId] = [];
        parGrille[c.grilleId].push(c);
    }

    var compteur = 0;
    var grillesIds = Object.keys(parGrille);

    for (var gi = 0; gi < grillesIds.length; gi++) {
        var grilleId = grillesIds[gi];
        var cleStockage = 'cartouches_' + grilleId;
        var existants = db.getSync(cleStockage, []) || [];
        if (!Array.isArray(existants)) existants = [];

        var nouveaux = parGrille[grilleId];
        var modifie = false;
        for (var j = 0; j < nouveaux.length; j++) {
            var cart = nouveaux[j];
            var idx = existants.findIndex(function(e) { return e.id === cart.id; });
            if (idx >= 0) {
                if (options.remplacer) {
                    existants[idx] = cart;
                    compteur++;
                    modifie = true;
                }
            } else {
                existants.push(cart);
                compteur++;
                modifie = true;
            }
        }

        if (modifie) {
            db.setSync(cleStockage, existants);
        }
    }

    if (compteur > 0 && !options.silencieux) {
        if (typeof afficherListeBibliothequeCartouches === 'function') afficherListeBibliothequeCartouches();
    }

    return compteur;
};

})();
