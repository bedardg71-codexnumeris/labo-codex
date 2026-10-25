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
   - Duplication
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
   - #zoneImportCommentaires : Zone d'import
   - #commentairesColles : Textarea d'import
   - #chaineCartouche : la chaîne des étapes (#1149, lot 3b ; elle a remplacé les métriques, absentes de la page)
   
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
    // ⚠ La LECTURE reste hors file, délibérément : cette fonction est appelée
    // vingt-quatre fois, et sérialiser des lectures derrière la file d'écriture
    // les ralentirait sans rien protéger. Seule la RÉPARATION entre dans la
    // file — et elle y revérifie la forme, car elle a pu être corrigée
    // entre-temps par un appel concurrent.
    let cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];

    // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
    // Le pack-demarrage peut stocker un objet au lieu d'un tableau
    if (cartouches && !Array.isArray(cartouches)) {
        cartouches = [cartouches];
        // Optionnel: Corriger le stockage pour les prochaines fois
        await db.modifier(cle(`cartouches_${grilleId}`), (lues) => {
            if (Array.isArray(lues)) return undefined;   // déjà réparé
            return lues ? [lues] : [];
        }, []);
    }

    return cartouches;
}

/* ===============================
   ✅ AJOUT (28 janvier 2026) : DÉTECTION DES DOUBLONS
   Fonctions pour identifier les cartouches avec des noms similaires
   =============================== */

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
    const listeBanque = document.getElementById('selectionCartouches');
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
    await assurerCartoucheDeDepart();

}

/**
 * Assure la présence de la cartouche générique dans la bibliothèque
 * Facilite la compréhension du système pour les nouveaux utilisateurs
 */
async function assurerCartoucheDeDepart() {
    // Vérifier que la grille générique existe
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grilleGenerique = grilles.find(g => g.id === 'GRILLE_GENERIQUE');
    if (!grilleGenerique) return;

    // Vérifier si la cartouche générique existe déjà ou a été supprimée volontairement
    // La suppression volontaire ne dépend pas de la collection : ce test reste
    // ici. La PRÉSENCE, elle, se vérifie DANS la file — vérifiée avant, deux
    // appels concurrents au démarrage sèment deux fois (défaut jumeau de
    // `assurerGrilleDeDepart`, corrigé au lot 2c).
    if (window.estRessourceSupprimee('CART_GENERIQUE')) return;

    const cartoucheGenerique = {
        id: 'CART_GENERIQUE',
        // §3 du PLAN-2026-09-01 — même geste que pour la grille et l'échelle : les
        // trois pièces semées se reconnaissent désormais par « de départ », et
        // aucune ne se présente comme une simple illustration.
        nom: 'Cartouche de départ',
        grilleId: 'GRILLE_GENERIQUE',
        // #574 (29 août 2026) : plus d'`echelleId` — l'échelle générique n'est plus semée ;
        // la matrice se rend depuis les `niveaux` portés ci-dessous.
        contexte: 'Commentaires de rétroaction pour les quatre critères de la grille de départ.',
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

    await db.modifier(cle('cartouches_GRILLE_GENERIQUE'), (lues) => {
        const cartouches = lues || [];
        if (cartouches.some(c => c.id === 'CART_GENERIQUE')) return undefined;
        cartouches.push(cartoucheGenerique);
        return cartouches;
    }, []);
}

/**
 * ✅ AJOUT (8 décembre 2025) : Migre les cartouches existantes vers le système de bibliothèque
 * Ajoute le flag dansBibliotheque=true à toutes les cartouches qui ne l'ont pas
 */
async function migrerCartouchesVersBibliotheque() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    let nbMigrees = 0;

    for (const grille of grilles) {
        const cleCartouches = cle(`cartouches_${grille.id}`);
        // #522 lot 20 (12 oct. 2026) — dans la file de la clé : la migration court à
        // chaque entrée dans la section (navigation.js), donc à côté des gestes qui
        // écrivent les cartouches, eux-mêmes déjà dans la file.
        await db.modifier(cleCartouches, (lues) => {
            let cartouches = lues || [];
            // #1040 (11 oct. 2026) — n'écrire que si la migration a changé quelque chose :
            // avant, chaque ouverture réécrivait toutes les cartouches à l'identique.
            let aChange = false;

            // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
            if (cartouches && !Array.isArray(cartouches)) {
                cartouches = [cartouches];
                aChange = true;
            }

            cartouches.forEach(cartouche => {
                if (cartouche.dansBibliotheque === undefined) {
                    cartouche.dansBibliotheque = true;
                    nbMigrees++;
                    aChange = true;
                }
            });

            if (aChange && cartouches.length > 0) {
                return cartouches;
            }
            return undefined;
        }, []);
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
/**
 * #573 — `cartoucheIdAGarder` : la cartouche à ROUVRIR après le rafraîchissement.
 *
 * ⚠⚠ SANS CE PARAMÈTRE, « ENREGISTRER » FERMAIT CE QU'IL VENAIT D'ENREGISTRER.
 * Cette fonction se termine par `initialiserNouveauCartouche(grilleId)`, qui
 * remplace `cartoucheActuel` par une cartouche NEUVE (`CART_xxx` jamais écrit),
 * vide le nom et le contexte, et re-rend la matrice. `sauvegarderCartouche`
 * l'appelait sans rien pouvoir conserver : l'utilisateur voyait un message de
 * succès, puis un écran vide.
 *
 * ⮕ ET LA SUITE ÉTAIT SILENCIEUSE. La cellule tapée ensuite passait par
 * `persisterCartouchePartielle` (#517), qui cherche la cartouche EN BASE par
 * `cartoucheActuel.id` — l'id neuf, absent — et rendait `false`. Aucun des deux
 * appelants ne lisait ce verdict. **La frappe était perdue sans un mot.** C'est
 * le candidat désigné par l'audit du 27 août au symptôme rapporté par Grégoire,
 * « des fois ça enregistre, des fois non ».
 *
 * ⚠ APRÈS UNE SUPPRESSION (`:1646`), l'appel reste SANS argument, et c'est
 * voulu : la cartouche ouverte n'existe plus, en rouvrir une neuve est le bon
 * geste. Le défaut n'était pas d'initialiser — c'était de le faire aussi quand
 * l'objet venait d'être enregistré.
 *
 * @param {string} [cartoucheIdAGarder] - id à rouvrir ; sinon, cartouche neuve.
 */
async function chargerCartouchesRetroaction(cartoucheIdAGarder = null) {
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
    let cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];

    // ✅ CORRECTION (30 déc 2025): Gérer le cas où cartouches est un objet unique
    if (cartouches && !Array.isArray(cartouches)) {
        cartouches = [cartouches];
    }

    selectCartouche.innerHTML = '<option value="">-- Nouvelle cartouche --</option>' +
        cartouches.map(cartouche => `<option value="${echapperHtml(cartouche.id)}">${echapperHtml(cartouche.nom)}</option>`).join('');

    document.getElementById('aucuneEvalRetroaction').classList.add('u-hide');
    document.getElementById('infoCartouche').classList.remove('u-hide');


    // Toujours masquer l'ancienne liste (Beta 80.5+)
    const listeAncienne = document.getElementById('listeCartouchesExistants');
    if (listeAncienne) listeAncienne.classList.add('u-hide');
    
    // #573 — rouvrir la cartouche demandée plutôt que d'en initialiser une neuve.
    // La relecture passe par `chargerMatriceRetroaction`, le chemin d'ouverture
    // DÉJÀ existant : il rétablit `cartoucheActuel`, `window.cartoucheActuel`,
    // les champs et la matrice. En écrire un second aurait été le patron des
    // chemins parallèles qui divergent.
    if (cartoucheIdAGarder) {
        selectCartouche.value = cartoucheIdAGarder;
        await chargerMatriceRetroaction(cartoucheIdAGarder, grilleId);
        return;
    }

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
    
    // ⮕ #573 (rapport du 27 août, §3 n° 18) — LE REPLI `niveauxDefaut` A ÉTÉ
    // SUPPRIMÉ. C'était l'échelle IDME de Grégoire au complet — codes, noms et
    // plages `0-64 / 65-74 / 75-84 / 85-100` — posée en colonnes de la cartouche
    // NEUVE de n'importe qui dès que `echellesTemplates` était vide. Une matrice
    // de rétroaction est indexée par `niveau.code` : ces colonnes deviennent les
    // clés des commentaires, donc la structure de son document.
    //
    // ⮕ Sans échelle, aucune colonne n'est inventée : `niveaux` reste vide et la
    // matrice se rend vide. C'est la règle du dépôt depuis #527 — jamais un
    // libellé, une plage ni une couleur fabriqués.
    //
    // ⮕ #578 (arbitré par Grégoire le 29 août 2026, option A) — LA CARTOUCHE NE
    // DEVINE PLUS SON ÉCHELLE. Jusqu'ici : `echelles.find(e => !e.estDemo) ||
    // echelles[0]`, un ORDRE DE TABLEAU — la cartouche neuve prenait les colonnes
    // de la première échelle du trimestre, et n'écrivait aucun `echelleId`.
    //
    // ⚠ MESURÉ AVANT DE CODER, sur ses trois trimestres : 10 grilles, 9 sans
    // `echelleId` — la seule « avec » est GRILLE_GENERIQUE, semée par le code, et
    // l'éditeur de grille n'écrit jamais ce champ. Lire `grille.echelleId` (la
    // piste d'origine de l'item) aurait laissé TOUTES ses cartouches neuves sans
    // colonnes. Le modèle réel est : la grille dit les CRITÈRES ; l'échelle se
    // choisit là où on s'en sert — l'évaluation lit celle de l'évaluation, la
    // cartouche porte la sienne (`initialiserNouveauCartoucheAvecEchelle`).
    //
    // ⮕ La seule source est donc le CHOIX du formulaire (`selectEchelleCartouche`).
    // Sans choix : aucune colonne, et la matrice le DIT (règle #527/#573 : jamais
    // une colonne inventée). Avec choix : ses niveaux, et l'`echelleId` est ÉCRIT
    // sur la cartouche pour que la question ne se repose plus à la réouverture.
    // Résolution par `id` puis `idOriginal`, comme `afficherMatriceRetroaction`.
    let echelleChoisieId = ((document.getElementById('selectEchelleCartouche') || {}).value || '').trim();
    const echelles = await db.get(cle('echellesTemplates'), []) || [];
    // Lot 4, volet A — grille analytique sans échelle choisie : l'échelle de départ, si elle
    // est offerte (même règle que `onChangeSelectionCartouche`) ; sinon rien, comme avant.
    if (!echelleChoisieId && grilleEstAnalytique(grille)) {
        const depart = echelles.find(e => e && e.id === ID_ECHELLE_DE_DEPART && estDansSelection(e));
        if (depart) {
            echelleChoisieId = depart.id;
            const selectEchelleDepart = document.getElementById('selectEchelleCartouche');
            if (selectEchelleDepart) selectEchelleDepart.value = depart.id;
        }
    }
    const echelleChoisie = echelleChoisieId
        ? (echelles.find(e => e && e.id === echelleChoisieId)
            || echelles.find(e => e && e.idOriginal === echelleChoisieId)
            || null)
        : null;
    const niveaux = echelleChoisie ? (echelleChoisie.niveaux || []) : [];
    
    // Créer la structure de cartouche
    cartoucheActuel = {
        id: genererIdUnique('CART_'),
        nom: '',
        grilleId: grilleId,
        echelleId: echelleChoisie ? echelleChoisie.id : '',
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

    // #578 — le formulaire dit la vérité : la grille de la cartouche, et l'échelle
    // retenue (ou « — Échelle — » quand il n'y en a pas encore).
    await populerDropdownsCartouche(grilleId, cartoucheActuel.echelleId, false);

    await afficherMatriceRetroaction();
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
    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
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

        // Afficher la matrice
        await afficherMatriceRetroaction();

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

    // Lot 4, volet A — une grille analytique attache ses commentaires à des PALIERS (bornes
    // en %). Les bornes se lisent sur l'échelle SOURCE, comme ses couleurs ci-dessous ; la
    // copie que porte la cartouche (code, nom) ne change pas, ni la clé `critereId_niveau` :
    // rien de ce qui voyage ne bouge. Sans bornes (copie seule), le nom du niveau.
    const enPaliers = grilleEstAnalytique(await grilleDeCartouche(cartoucheActuel.grilleId));

    // Les colonnes : celles de l'échelle source (ses couleurs, ses bornes), sinon la copie que porte la
    // cartouche — par `niveauxDeLaMatrice`, que la chaîne des étapes compte aussi (#1149, lot 3b).
    const echellesLues = cartoucheActuel.echelleId ? (await db.get(cle('echellesTemplates')) || []) : [];
    const niveauxAffichage = niveauxDeLaMatrice(cartoucheActuel, echellesLues);

    // #578 — sans échelle, pas de colonnes : on le dit, on n'invente rien.
    // (Un tableau à une seule colonne « Critère / Niveau » se lisait comme un bug.)
    if (niveauxAffichage.length === 0) {
        container.innerHTML = '<div class="message-vide"><p>'
            + echapperHtml(enPaliers ? LIBELLES_PALIERS.sansEchellePaliers : LIBELLES_PALIERS.sansEchelleNiveaux) + '</p></div>';
        rendreChaineCartouche();
        return;
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
                    <th class="cartouche-gradient-bleu">${echapperHtml(enPaliers ? LIBELLES_PALIERS.coinPaliers : LIBELLES_PALIERS.coinNiveaux)}</th>
    `;

    // En-têtes des niveaux avec code et label + couleur de l'échelle — ou, pour une grille
    // analytique, le palier par ses bornes (lot 4, volet A).
    niveauxAffichage.forEach(niveau => {
        const codeEchappe = echapperHtml(niveau.code);
        const nomEchappe = echapperHtml(niveau.nom);
        const couleurNiveau = couleursParCode[niveau.code] || 'var(--bleu-moyen)';
        html += enPaliers ? `
                    <th style="background: ${couleurNiveau};">
                        <span class="niveau-code niveau-palier">${echapperHtml(libellePalier(niveau))}</span>
                    </th>` : `
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
            const nomNiveauEchappe = echapperHtml(enPaliers ? libellePalier(niveau) : niveau.nom);

            html += `
                    <td>
                        <textarea id="comm_${echapperHtml(key)}"
                                  data-critere="${echapperHtml(critere.id)}"
                                  data-niveau="${echapperHtml(niveau.code)}"
                                  placeholder="Commentaire pour ${nomCritereEchappe} - ${nomNiveauEchappe}"
                                  data-on-change="sauvegarderCommentaire" data-param="${echapperHtml(key)}">${commentaireEchappe}</textarea>
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

    rendreChaineCartouche();
}

/**
 * Les colonnes de la matrice — UNE SEULE LECTURE pour la matrice et pour l'étape « Commentaires ».
 * Les niveaux de l'échelle source (par id, puis par `idOriginal`), dans l'ordre de l'échelle, avec
 * leurs couleurs et leurs bornes ; sans elle, la copie que porte la cartouche. Fonction pure.
 */
function niveauxDeLaMatrice(cartouche, echelles) {
    if (!cartouche) return [];
    if (cartouche.echelleId) {
        const liste = echelles || [];
        const source = liste.find(e => e && e.id === cartouche.echelleId)
            || liste.find(e => e && e.idOriginal === cartouche.echelleId);
        if (source && Array.isArray(source.niveaux) && source.niveaux.length) {
            return source.niveaux.map(n => ({ code: n.code, nom: n.nom, min: n.min, max: n.max, couleur: n.couleur || '#cccccc' }));
        }
    }
    return (cartouche.niveaux || []).map(n => ({ code: n.code, nom: n.nom, couleur: n.couleur || '#cccccc' }));
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

    // #593 (29 août 2026) — LA CIBLE EST CAPTURÉE AVANT LE PREMIER `await`.
    // `cartoucheActuel` est une variable de module : si l'utilisateur ouvre une
    // autre cartouche pendant que la complétion se calcule, l'écriture partait
    // dans la NOUVELLE. Fenêtre théorique (jamais reproduite), fermée quand même :
    // la persistance reçoit la cartouche qui portait la cellule au moment du blur.
    const cible = cartoucheActuel;
    const textarea = document.getElementById(`comm_${key}`);
    if (textarea) {
        // ▣ L'ÉCRAN FAIT FOI PENDANT L'ÉDITION : la mémoire est mise à jour
        // d'abord, et c'est elle que lit la chaîne des étapes (« Commentaires »).
        cible.commentaires[key] = textarea.value;
        rendreChaineCartouche();
        const ecrit = await persisterCartouchePartielle(c => { c.commentaires[key] = textarea.value; }, cible);
        signalerAutosaveCartoucheMuette(ecrit);
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
/**
 * #573 — id de la cartouche pour laquelle l'avertissement a déjà été montré.
 *
 * ⚠ IL MÉMORISE UN ID, PAS UN BOOLÉEN, et c'est ce qui le réarme tout seul :
 * ouvrir une autre cartouche donne un id différent, donc un avertissement de
 * nouveau possible. Deux remises à zéro explicites avaient d'abord été posées à
 * l'ouverture et à l'initialisation ; le break-test les a montrées SANS EFFET —
 * les neutraliser laissait la sentinelle verte. Elles sont retirées : du code
 * qui ne change rien finit par être lu comme s'il changeait quelque chose.
 */
let _autosaveCartoucheDejaSignalee = null;

async function persisterCartouchePartielle(appliquer, cible = cartoucheActuel) {
    // #593 — `cible` : la cartouche visée au moment du geste, pas celle qui est
    // ouverte au moment où la promesse se résout.
    if (!cible || !cible.id || !cible.grilleId) return false;
    const resultat = await modifierEtAnnoncer(cle(`cartouches_${cible.grilleId}`), (lues) => {
        const cartouches = lues || [];
        const enBase = cartouches.find(c => c.id === cible.id);
        if (!enBase) return undefined;              // pas encore enregistrée
        if (!enBase.commentaires) enBase.commentaires = {};
        appliquer(enBase);
        enBase.dateModification = new Date().toISOString();
        return cartouches;
    }, [], { geste: 'Modifier la cartouche' });
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
    const ecrit = await persisterCartouchePartielle(c => { c.contexte = valeur; });
    signalerAutosaveCartoucheMuette(ecrit);
}

/**
 * Lot E1 (D3) — le contexte SPÉCIFIQUE, jumeau du contexte général : il s'enregistrait
 * au seul bouton, et quitter la fiche le perdait alors que son voisin était gardé.
 */
async function sauvegarderContexteSpecifiqueCartouche() {
    if (!cartoucheActuel) return;
    const champ = document.getElementById('contexteSpecifiqueCartouche');
    if (!champ) return;
    const valeur = champ.value.trim();
    cartoucheActuel.contexteSpecifique = valeur;
    const ecrit = await persisterCartouchePartielle(c => { c.contexteSpecifique = valeur; });
    signalerAutosaveCartoucheMuette(ecrit);
}

/**
 * #967 — tout ce qui nomme une cartouche, dans des magasins déjà lus. Pure.
 * Même forme que `compterPorteursEchelleDans` (echelles.js) : la phrase de refus
 * les décrit par `decrirePorteursEchelle`.
 * @param {string} cartoucheId
 * @param {{evaluations: Array, productions: Array}} magasins
 */
function compterPorteursCartoucheDans(cartoucheId, magasins) {
    const liste = (x) => Array.isArray(x) ? x : (x ? [x] : []);
    const m = magasins || {};
    const nommeLaCartouche = (x) => !!x && x.cartoucheId === cartoucheId;
    const nb = {
        evaluations: liste(m.evaluations).filter(nommeLaCartouche).length,
        productions: liste(m.productions).filter(nommeLaCartouche).length
    };
    nb.total = nb.evaluations + nb.productions;
    return nb;
}

/**
 * #967 — les porteurs réunis des homonymes qu'« Écraser » retirerait (trimestre actif).
 * Lecture hors file : elle sert à refuser, jamais de base à une écriture.
 */
async function compterPorteursHomonymesCartouche(homonymes) {
    const magasins = {
        evaluations: await db.get(cle('evaluationsSauvegardees')) || [],
        productions: await db.get(cle('productions')) || []
    };
    const nb = { evaluations: 0, productions: 0, total: 0 };
    (homonymes || []).forEach(h => {
        const n = compterPorteursCartoucheDans(h.id, magasins);
        Object.keys(nb).forEach(k => { nb[k] += n[k]; });
    });
    return nb;
}

/** Lot E1 : la cartouche ouverte est-elle en base ? (lecture synchrone du stock) */
function cartoucheEstEnBase(cartouche) {
    if (!cartouche || !cartouche.id || !cartouche.grilleId) return false;
    const liste = db.getSync(cle(`cartouches_${cartouche.grilleId}`), []) || [];
    return liste.some(c => c.id === cartouche.id);
}

/**
 * Lot E1 (D3) — le NOM d'une cartouche existante s'enregistre au changement de champ
 * (à la sortie, pas à chaque frappe), comme celui d'une grille (`sauvegarderNomGrille`).
 * La question du doublon est posée à ce moment-là : une question par nom changé, pas
 * par frappe (la crainte de #517 tient, le `change` la respecte).
 * En création, rien : c'est « Créer la cartouche » qui écrit.
 */
async function sauvegarderNomCartouche() {
    const cible = cartoucheActuel;
    if (!cartoucheEstEnBase(cible)) return;
    const champ = document.getElementById('nomCartouche');
    if (!champ) return;
    let nom = champ.value.trim();
    if (!nom) {
        // D3 : un champ vérifié dit « Non enregistré : ‹raison› ».
        if (window.temoinEnregistrement) {
            window.temoinEnregistrement.nonEnregistre('le nom ne peut pas être vide.', 'Modifier la cartouche', cle(`cartouches_${cible.grilleId}`));
        }
        return;
    }
    const cartouches = await db.get(cle(`cartouches_${cible.grilleId}`)) || [];
    const enBase = cartouches.find(c => c.id === cible.id);
    if (!enBase || enBase.nom === nom) return;

    let ecraserLeDoublon = false;
    if (typeof verifierEtGererDoublon === 'function') {
        // #967 — un homonyme employé est refusé par la question elle-même.
        const resultat = await verifierEtGererDoublon('cartouche', nom, cartouches, cible.id, {
            porteursHomonymes: (homonymes) => compterPorteursHomonymesCartouche(homonymes)
        });
        // Relecture R1 : pendant la question, l'usager a pu ouvrir une AUTRE cartouche
        // (le `change` part au blur, donc au clic dans la liste). Le champ montre alors
        // le nom de celle-là : le réécrire lui donnerait le nom de `cible`, et le
        // prochain `change` la renommerait. On ne touche au champ que s'il est encore
        // celui de `cible`.
        const champDeLaCible = cartoucheActuel === cible;
        if (resultat === null) {
            if (champDeLaCible) champ.value = enBase.nom || '';    // question annulée : le nom en base reste
            return;
        }
        if (resultat && resultat.action === 'renommer') {
            nom = resultat.nouveauNom;
            if (champDeLaCible) champ.value = nom;
        }
        if (resultat && resultat.action === 'ecraser') ecraserLeDoublon = true;
    }

    // #967 (cas noté à la fiche, en appliquant R1) — l'homonyme que l'usager a OUVERT
    // pendant la question ne disparaît pas sous ses yeux : rien n'est écrit, le témoin
    // le dit. Seul un homonyme que rien n'emploie arrive ici (le refus est en amont).
    if (ecraserLeDoublon && cartoucheActuel && cartoucheActuel !== cible
        && cartouches.some(c => c.id === cartoucheActuel.id && c.id !== cible.id && c.nom === nom)) {
        if (window.temoinEnregistrement) {
            window.temoinEnregistrement.nonEnregistre('tu as ouvert la cartouche qui porte déjà ce nom.', 'Modifier la cartouche', cle(`cartouches_${cible.grilleId}`));
        }
        return;
    }

    const resultat = await modifierEtAnnoncer(cle(`cartouches_${cible.grilleId}`), (lues) => {
        let liste = lues || [];
        if (ecraserLeDoublon) liste = liste.filter(c => c.id === cible.id || c.nom !== nom);
        const cartouche = liste.find(c => c.id === cible.id);
        if (!cartouche) return undefined;
        cartouche.nom = nom;
        cartouche.dateModification = new Date().toISOString();
        return liste;
    }, [], { geste: 'Modifier la cartouche' }).catch(() => undefined);
    if (resultat === undefined) return;
    cible.nom = nom;
    await afficherBanqueCartouches();
    // R1 : la liste surligne la cartouche OUVERTE, qui n'est plus forcément `cible`.
    if (cartoucheActuel) definirCartoucheActive(cartoucheActuel.id);
}

/**
 * Lot E1 (D3) — une cartouche existante s'enregistre toute seule : son pied ne montre
 * que « Fermer ». En création, « Créer la cartouche » : rien n'est écrit avant ce clic.
 * @param {boolean} enCreation
 */
function rendreModeFicheCartouche(enCreation) {
    const btnCreer = document.getElementById('btnCreerCartouche');
    if (btnCreer) btnCreer.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/** Lot E1 : « ma fiche est en création et porte une saisie » (ui-dialogues.js). */
function cartoucheEnCreationSaisie() {
    const info = document.getElementById('infoCartouche');
    if (!info || info.classList.contains('u-hide')) return false;
    if (cartoucheEstEnBase(cartoucheActuel)) return false;
    const valeur = (id) => (document.getElementById(id)?.value || '').trim();
    const commentaires = Object.values((cartoucheActuel && cartoucheActuel.commentaires) || {})
        .some(v => String(v || '').trim());
    return !!(valeur('nomCartouche') || valeur('contexteCartouche') || valeur('contexteSpecifiqueCartouche') || commentaires);
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('cartouche', cartoucheEnCreationSaisie);

/** Lot E1 (D3) : « Fermer » (il n'annulait rien) — avec la question, en création. */
async function fermerFicheCartouche() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('cartouche'))) return;
    annulerFormCartouche();
}

/** Lot E1 : ouvrir une autre cartouche depuis la liste, sans perdre une création en cours. */
async function ouvrirCartoucheDepuisListe(cartoucheId, grilleId) {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('cartouche'))) return;
    await chargerCartouchePourModif(cartoucheId, grilleId);
}

/**
 * #573 — dire quand l'enregistrement automatique n'a RIEN écrit.
 *
 * ⚠⚠ LES DEUX APPELANTS DE `persisterCartouchePartielle` IGNORAIENT SON VERDICT.
 * Elle rend `false` quand la cartouche ouverte n'est pas en base — exactement
 * l'état où « Enregistrer » laissait l'écran avant le correctif ci-dessus. La
 * saisie repartait dans le vide, et rien ne le disait. C'est le patron des
 * « boutons qui mentent » (#468), appliqué à un enregistrement automatique :
 * #517 promet d'écrire au fil de la frappe, donc son silence vaut promesse tenue.
 *
 * ⮕ LA CAUSE EST CORRIGÉE ; CE FILET RESTE. Un correctif qui referme un chemin
 * ne dit rien des autres : `persisterCartouchePartielle` refusera encore d'écrire
 * pour une cartouche jamais enregistrée, et ce jour-là il vaut mieux un
 * avertissement qu'une perte muette.
 *
 * ⚠ UNE SEULE FOIS PAR CARTOUCHE OUVERTE. Ces fonctions se déclenchent à chaque
 * frappe : avertir à chacune serait du harcèlement, la raison même pour laquelle
 * le nom est resté au bouton (#517). Le drapeau retombe à l'ouverture suivante.
 */
function signalerAutosaveCartoucheMuette(ecrit) {
    if (ecrit) return;
    const id = cartoucheActuel && cartoucheActuel.id;
    if (!id || _autosaveCartoucheDejaSignalee === id) return;
    _autosaveCartoucheDejaSignalee = id;
    if (typeof notifications !== 'undefined' && typeof notifications.warning === 'function') {
        // Lot E1 (D3) : relu contre la nouvelle règle — le bouton s'appelle « Créer la cartouche ».
        notifications.warning(
            'Cette cartouche n\'est pas encore créée',
            'Ce que tu tapes n\'est gardé qu\'à l\'écran. Clique sur « Créer la cartouche » ; '
            + 'ensuite, chaque champ s\'enregistrera tout seul.'
        );
    }
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
        alert('Donne un nom à la cartouche.');
        return false;
    }

    const grilleId = cartoucheActuel.grilleId;

    // ⚠ Cette lecture sert à POSER LA QUESTION du doublon, pas de base à
    // l'écriture : `verifierEtGererDoublon` peut attendre l'utilisateur.
    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
    let ecraserLeDoublon = false;

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    const idActuel = cartoucheActuel?.id || null;
    const cartoucheOriginale = idActuel ? cartouches.find(c => c.id === idActuel) : null;
    const isCreation = !cartoucheOriginale;
    const isNameChange = cartoucheOriginale && cartoucheOriginale.nom !== nom;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        // #967 — un homonyme employé est refusé par la question elle-même.
        const resultat = await verifierEtGererDoublon('cartouche', nom, cartouches, idActuel, {
            porteursHomonymes: (homonymes) => compterPorteursHomonymesCartouche(homonymes)
        });

        if (resultat === null) {
            // Utilisateur a annulé
            return false;
        }

        if (resultat && resultat.action === 'renommer') {
            nom = resultat.nouveauNom;
            document.getElementById('nomCartouche').value = nom;
        }

        if (resultat && resultat.action === 'ecraser') {
            // Le retrait de l'homonyme est REPORTÉ dans la file, avec l'écriture.
            ecraserLeDoublon = true;
        }
    }


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

    // Sauvegarder. La collection est relue DANS la file : celle d'avant la
    // question du doublon ne vaut plus rien.
    await modifierEtAnnoncer(cle(`cartouches_${grilleId}`), (lues) => {
        let liste = lues || [];

        // L'homonyme n'est retiré qu'ici.
        if (ecraserLeDoublon) {
            liste = liste.filter(c => c.nom !== nom);
        }

        // Vérifier si la cartouche existe déjà
        const index = liste.findIndex(c => c.id === cartoucheActuel.id);
        if (index >= 0) {
            // Mise à jour
            if (typeof ajouterContributeurSiNecessaire === 'function') {
                cartoucheActuel = ajouterContributeurSiNecessaire(cartoucheActuel);
            }
            liste[index] = cartoucheActuel;
        } else {
            liste.push(cartoucheActuel);
        }
        return liste;
    }, [], { geste: isCreation ? 'Créer la cartouche' : 'Modifier la cartouche' });

    // NOUVELLE INTERFACE (Beta 80.2): Rafraîchir la banque
    await afficherBanqueCartouches();
    definirCartoucheActive(cartoucheActuel.id);

    // Rafraîchir l'interface (ancien système - compatibilité)
    // ⚠ #573 — L'ID EST CAPTURÉ AVANT L'APPEL. `chargerCartouchesRetroaction`
    // réassigne `cartoucheActuel` ; lire `cartoucheActuel.id` APRÈS rendait l'id
    // de la cartouche NEUVE, que le `<select>` ne contient pas — il retombait
    // donc sur « -- Nouvelle cartouche -- ».
    // ⚠ La ligne `selectCartouche.value = cartoucheActuel.id` qui suivait cet
    // appel est RETIRÉE, et pas par économie : `chargerCartouchesRetroaction`
    // pose désormais elle-même la valeur, au moment où elle rouvre. La garder
    // aurait été une seconde écriture du même champ, à un endroit où
    // `cartoucheActuel` a déjà changé de sens — exactement le genre de doublon
    // qui survit à un correctif et le contredit un jour.
    await chargerCartouchesRetroaction(cartoucheActuel.id);

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
        annulerImportCommentaires();
        
        notifications.succes(`${compteur} commentaire(s) importé(s) avec succès !`);
        
    } catch (error) {
        console.error('Erreur d\'import:', error);
        alert('Erreur lors de l\'import. Vérifie le format de tes données.');
    }
}

/* ===============================
   LA CHAÎNE DES ÉTAPES (#1149, lot 3b, 24 oct. 2026)
   Elle remplace les métriques (#nbCriteres, #nbNiveaux, #nbCommentaires, #pctComplete) : ces
   éléments n'étaient plus dans la page, et leur compte fusionnait les niveaux de TOUTES les
   échelles quand la matrice ne montre que ceux de la sienne (#578).
   =============================== */

/**
 * LES QUATRE ÉTAPES D'UNE CARTOUCHE (validées par Grégoire, 24 oct., 19 h 45). Fonction pure : la
 * cartouche (ou, en création, ce que montrent ses deux menus), les grilles, les échelles, les
 * productions que le menu des productions montre. « Commentaires » compte les cases que la matrice
 * montre (critères de la cartouche × colonnes de `niveauxDeLaMatrice`) ; incomplète, elle reste
 * « à régler », sans couleur d'alerte.
 */
function etapesChaineCartouche(cartouche, grilles, echelles, productions) {
    const c = cartouche || {};
    const nbCriteres = criteresNommesDeLaGrille(c.grilleId, grilles);
    const colonnes = niveauxDeLaMatrice(c, echelles);
    const { total, remplies } = casesDeLaMatrice(c, colonnes);
    const nbProd = c.id ? (productions || []).filter(p => p && p.cartoucheId === c.id).length : 0;
    return [
        { id: 'grille', libelle: 'Grille', reglee: nbCriteres > 0,
          info: nbCriteres === 0 ? 'aucun' : nbCriteres + (nbCriteres > 1 ? ' critères' : ' critère') },
        { id: 'echelle', libelle: 'Échelle', reglee: !!c.echelleId,
          info: !c.echelleId ? 'à choisir' : colonnes.length + (colonnes.length > 1 ? ' niveaux' : ' niveau') },
        { id: 'commentaires', libelle: 'Commentaires', reglee: total > 0 && remplies === total,
          info: total === 0 ? 'aucune case' : remplies + ' sur ' + total },
        { id: 'production', libelle: 'Production', arrivee: true, reglee: nbProd > 0,
          info: nbProd === 0 ? 'aucune' : nbProd + ' prod.' }
    ];
}

/** Les critères nommés de la grille de la cartouche (par id, puis par `idOriginal`) ; 0 sans elle. */
function criteresNommesDeLaGrille(grilleId, grilles) {
    if (!grilleId) return 0;
    const grille = (grilles || []).find(g => g && (g.id === grilleId || g.idOriginal === grilleId));
    return grille ? (grille.criteres || []).filter(cr => cr && String(cr.nom == null ? '' : cr.nom).trim()).length : 0;
}

/** Les cases de la matrice (critères de la cartouche × colonnes) et celles qui portent un commentaire non vide. */
function casesDeLaMatrice(cartouche, colonnes) {
    const criteres = cartouche.criteres || [];
    const commentaires = cartouche.commentaires || {};
    let remplies = 0;
    criteres.forEach(cr => colonnes.forEach(n => {
        const texte = commentaires[cr.id + '_' + n.code];
        if (texte && String(texte).trim()) remplies++;
    }));
    return { total: criteres.length * colonnes.length, remplies: remplies };
}

/**
 * La cartouche que la chaîne lit : celle de l'écran. En création, tant que la grille ET l'échelle ne
 * sont pas choisies, `cartoucheActuel` peut encore être la cartouche ouverte avant « + Nouvelle » :
 * la chaîne lit alors les deux menus, sans commentaires.
 */
function cartouchePourLaChaine() {
    const btnCreer = document.getElementById('btnCreerCartouche');
    const enCreation = !!(btnCreer && !btnCreer.classList.contains('u-hide'));
    const c = cartoucheActuel;
    if (c && !(enCreation && cartoucheEstEnBase(c))) return c;
    const valeur = (id) => (document.getElementById(id) || {}).value || '';
    return { id: null, grilleId: valeur('selectGrilleCartouche'), echelleId: valeur('selectEchelleCartouche'),
        criteres: [], niveaux: [], commentaires: {} };
}

/** Dessine la chaîne en tête de la fiche (`#chaineCartouche`) ; elle paraît et part avec la fiche. */
function rendreChaineCartouche() {
    if (typeof document === 'undefined') return;
    const conteneur = document.getElementById('chaineCartouche');
    if (!conteneur || typeof ChaineEtapes === 'undefined') return;
    const lire = (k) => db.getSync(cle(k), []) || [];
    const productions = typeof productionsVisiblesPourLaChaine === 'function' ? productionsVisiblesPourLaChaine() : [];
    ChaineEtapes.dessiner(conteneur,
        etapesChaineCartouche(cartouchePourLaChaine(), lire('grillesTemplates'), lire('echellesTemplates'), productions),
        { libelle: 'Étapes de la cartouche', surClic: suivreEtapeDeLaCartouche });
}

/**
 * Le clic conduit, il n'écrit rien. « Grille » : une grille choisie s'ouvre dans son écran (ses critères
 * se règlent là) ; sinon, le menu de la fiche. « Échelle » : le menu de la fiche. « Commentaires » : la
 * première case vide de la matrice (la matrice, si toutes sont remplies ; le menu de l'échelle, si elle
 * n'est pas encore là). « Production » : les productions.
 */
function suivreEtapeDeLaCartouche(idEtape) {
    const aller = (id) => { if (typeof afficherSousSection === 'function') afficherSousSection(id); };
    const descendre = (el, bloc) => { if (el) el.scrollIntoView({ behavior: 'smooth', block: bloc || 'center' }); };
    if (idEtape === 'production') return aller('conception-productions');
    if (idEtape === 'grille') {
        if (cartouchePourLaChaine().grilleId) return aller('conception-grille-criteres');
        return descendre(document.getElementById('selectGrilleCartouche'));
    }
    if (idEtape === 'echelle') return descendre(document.getElementById('selectEchelleCartouche'));
    const matrice = document.getElementById('matriceRetroaction');
    if (!matrice || matrice.classList.contains('u-hide')) return descendre(document.getElementById('selectEchelleCartouche'));
    const vide = [...matrice.querySelectorAll('#matriceContainer textarea')].find(t => !t.value.trim());
    descendre(vide || matrice, vide ? 'center' : 'start');
}

/* ===============================
   LISTE DES CARTOUCHES
   =============================== */

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
 * 4. Ajoute aux cartouches (`verrouille: false` reste écrit : champ inerte,
 *    gardé pour la forme des fichiers échangés — #864)
 * 5. Sélectionne automatiquement la copie
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche à dupliquer
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Bouton « Dupliquer » de la zone d'édition
 * 
 * RETOUR:
 * - Notification de succès
 * - Chargement automatique de la copie
 */
async function dupliquerCartouche(cartoucheId, grilleId) {
    let copieCreee = null;
        await modifierEtAnnoncer(cle(`cartouches_${grilleId}`), (lues) => {
        const cartouches = lues || [];
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
            delete nouveauCartouche.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source

            cartouches.push(nouveauCartouche); // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
            copieCreee = nouveauCartouche;
            return cartouches;
        }
        return undefined;
    }, [], { geste: 'Dupliquer la cartouche' });

    if (copieCreee) {
        // NOUVELLE INTERFACE (Beta 80.5+): Charger directement la copie
        await chargerCartouchePourModif(copieCreee.id, grilleId);

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            await afficherBanqueCartouches();
        }
    }
}

/**
 * Charge une cartouche pour modification
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - Un clic sur une cartouche de la banque (afficherBanqueCartouches)
 */
async function chargerCartouchePourModif(cartoucheId, grilleId) {

    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
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
        rendreModeFicheCartouche(false);
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
 * 1. Demande confirmation
 * 2. Retire du localStorage
 * 3. Rafraîchit l'affichage
 * 
 * PARAMÈTRES:
 * @param {string} cartoucheId - ID de la cartouche à supprimer
 * @param {string} grilleId - ID de la grille parente
 * 
 * UTILISÉ PAR:
 * - supprimerCartoucheActive (bouton « Supprimer » de la zone d'édition)
 * 
 * SÉCURITÉ:
 * - Confirmation obligatoire
 */
async function supprimerCartoucheConfirm(cartoucheId, grilleId) {
    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    // #647 (2 septembre 2026, soir — mots arrêtés par Grégoire) : la question dit
    // la portée réelle. Ce chemin n'écrit QUE l'ancrage de la grille (trimestre
    // actif) ; il ne touche pas la Bibliothèque. Ce qui survit est dit,
    // seulement quand c'est mesuré : la copie qui reste dans la bibliothèque (on
    // peut la rajouter à la grille depuis la section 2), et les rétroactions déjà
    // rédigées des évaluations qui l'emploient (stockées dans l'évaluation,
    // restituées telles quelles au chargement — evaluation.js:1639).
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);
    const biblio = typeof obtenirToutesLesCartouchesBibliotheque === 'function'
        ? (await obtenirToutesLesCartouchesBibliotheque() || [])
        : [];
    const evaluations = await db.get(cle('evaluationsSauvegardees')) || [];
    const nbEvaluations = evaluations.filter(ev => ev && ev.cartoucheId === cartoucheId).length;

    let survivance = '';
    if (biblio.some(c => c.id === cartoucheId)) {
        survivance += 'Elle reste dans la Bibliothèque.\n';
    }
    if (nbEvaluations > 0) {
        survivance += `${nbEvaluations} évaluation(s) l'emploient : leur rétroaction déjà rédigée est conservée.\n`;
    }

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('cartouche'))) return;
    if (confirm(`Supprimer la cartouche «${cartouche?.nom}» de sa grille « ${grille ? grille.nom : grilleId} » ?\n\n${survivance ? survivance + '\n' : ''}Cette action est irréversible.`)) {
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(cartoucheId)) {
            window.marquerRessourceSupprimee(cartoucheId);
        }
        // La collection est relue DANS la file : celle d'avant la confirmation
        // ne vaut plus rien.
        await modifierEtAnnoncer(cle(`cartouches_${grilleId}`), (lues) => {
            return (lues || []).filter(c => c.id !== cartoucheId);
        }, [], { geste: 'Supprimer la cartouche' });

        // NOUVELLE INTERFACE (Beta 80.2): Rafraîchir la banque
        await afficherBanqueCartouches();

        // Ancien système (compatibilité)
        await chargerCartouchesRetroaction();

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            await afficherBanqueCartouches();
        }

    }
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
        // S5/#623 — ÉNUMÉRATION PAR PRÉFIXE, RÉÉCRITE.
        //
        // Avant : `key.startsWith('cartouches_')` sur les clés du magasin. Sous D2-A
        // les clés sont `<trimestreId>_cartouches_<grilleId>` : ce test aurait trouvé
        // ZÉRO, et la fonction aurait rendu une collection vide — sans erreur, sans
        // message. C'est le coût caché que le rapport Z1-S1 recense (famille A).
        //
        // ⮕ On énumère désormais sous le préfixe du trimestre ACTIF, en dérivant le
        // motif de `cle()` plutôt qu'en le réécrivant à la main : si le routage change
        // encore, ce site suit sans qu'on ait à y repenser.
        const motif = cle('cartouches_');
        if (key && key.startsWith(motif)) {
            const grilleId = key.slice(motif.length);
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
        // #599 — la fusion passe par la file : la Bibliothèque est
        // relue à l'instant de l'écriture. Hors file, un import et un ajout
        // concurrents s'écrasaient l'un l'autre.
        let nbAjoutees = 0;
        let nbMisesAJour = 0;
        let idsImportes = [];

        const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE, (lues) => {
            const bibliotheque = lues || [];
            nbAjoutees = 0;
            nbMisesAJour = 0;
            idsImportes = [];

            // Aplatir les cartouches de toutes les grilles pour la bibliothèque
            for (const grilleId of Object.keys(cartouchesData)) {
                // #467 — un nom reçu n'entre pas brut dans la Bibliothèque (import-export.js).
                const cartouchesImportees = cartouchesData[grilleId].map(c => window.assainirImportJson(c, 'cartouche'));

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
                    if (importee.id) idsImportes.push(importee.id);

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

            return bibliotheque;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE);   // lot F : geste hors témoin (confirmerImportCartouches)

        // #793 — la bibliothèque ouverte est redessinée, puis l'œil conduit aux cartes importées.
        const ligneMasquee = await BibliothequeUI.conduireAuxImportes(
            'modalBibliothequeCartouches', afficherBibliothequeCartouches, idsImportes);

        let message = `✅ Import réussi !\n\n`;
        if (nbAjoutees > 0) message += `${nbAjoutees} nouvelle(s) cartouche(s) ajoutée(s).\n`;
        if (nbMisesAJour > 0) message += `${nbMisesAJour} cartouche(s) mise(s) à jour.\n`;
        message += '\n' + (ligneMasquee || 'Consulte « Cartouches disponibles » pour les ajouter à ta sélection.');
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
        alert('Sélectionne d\'abord une grille, puis crée ou choisis une cartouche.');
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
            const cleCommentaire = critere.id + '_' + niveau.code;
            lignes.push('**' + critere.nom + ' (' + niveau.code + ')** : ' + (dit[cleCommentaire] || ''));
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
    // #593 — les deux repères de l'échelle (#555), s'ils sont posés.
    const nivx = (echelle && echelle.niveaux) || [];
    const repereMaitrise = (echelle && echelle.seuilMaitrise) ? (nivx.find(n => n && n.code === echelle.seuilMaitrise) || null) : null;
    const repereSuffisance = (echelle && echelle.seuilSuffisance) ? (nivx.find(n => n && n.code === echelle.seuilSuffisance) || null) : null;
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
    // #593 (29 août 2026) — « seuil de maîtrise » n'est plus un mot du code : c'est
    // le repère « Maîtrisé à partir de » que l'utilisateur pose sur SON échelle
    // (#555). Le modèle nomme le niveau qui le porte ; s'il n'y en a pas, il le
    // DIT et laisse le jugement à qui lit — jamais un seuil deviné.
    lignes.push('> 3. Selon la position du niveau dans l\'échelle listée plus bas :');
    if (repereMaitrise) {
        lignes.push('>    - niveaux situés sous « ' + repereMaitrise.nom + ' » (' + repereMaitrise.code + '), le niveau');
        lignes.push('>      à partir duquel cette échelle considère la maîtrise atteinte : un conseil concret');
        lignes.push('>      et exécutable, introduit par « Pour progresser, » ou « Pour t\'améliorer, »,');
        lignes.push('>      à l\'impératif deuxième personne ;');
        lignes.push('>    - niveaux à partir de « ' + repereMaitrise.nom + ' » : aucun conseil, mais un énoncé');
    } else {
        lignes.push('>    - cette échelle ne porte PAS de repère « Maîtrisé à partir de » : juge d\'après le');
        lignes.push('>      nom et la description de chaque niveau s\'il atteint les attentes ;');
        lignes.push('>    - niveaux sous les attentes : un conseil concret et exécutable, introduit par');
        lignes.push('>      « Pour progresser, » ou « Pour t\'améliorer, », à l\'impératif deuxième personne ;');
        lignes.push('>    - niveaux aux attentes ou au-delà : aucun conseil, mais un énoncé');
    }
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
        const borne = (n.min != null && n.max != null) ? ' [' + formaterNombre(n.min) + ' à ' + formaterPourcentage(n.max) + ']' : '';
        const repere = (repereMaitrise && n === repereMaitrise) ? '  ← « Maîtrisé à partir de » : à partir d\'ici'
            : ((repereSuffisance && n === repereSuffisance) ? '  ← « Suffisant à partir de » : à partir d\'ici' : '');
        lignes.push('- **' + n.code + '** — ' + (n.nom || '') + borne
            + (n.description ? ' : ' + n.description : '') + repere);
    });
    lignes.push('');
    lignes.push('Critères de la grille :');
    criteres.forEach(c => {
        lignes.push('- **' + c.nom + '**'
            + (c.ponderation ? ' (' + formaterPourcentage(c.ponderation) + ')' : '')
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
    rendreModeFicheCartouche(true);
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
    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
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
    // #1147 : le menu revient à « Aucune cartouche ouverte »
    MenuSelection.marquer('menuCartouches', null);

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
    // Lot E1 (D3) : le bouton ne paraît qu'en création ; en modification, le témoin parle.
    notifications.succes(`Cartouche «\u00a0${nomCartouche}\u00a0» créée.`);

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
   DIAGNOSTIC #578 — LES GRILLES PORTENT-ELLES UN echelleId ?
   =============================== */

/**
 * Diagnostic LECTURE SEULE : dans TOUS les trimestres, combien de grilles
 * portent un `echelleId`, combien n'en portent pas, et parmi celles qui en
 * portent un, combien désignent une échelle qui existe encore ?
 * N'écrit RIEN (aucun db.set/setSync) — uniquement des lectures + console.
 * À lancer en console : await _diagnostiquerEchellesGrilles()
 *
 * ⚠ POURQUOI CE DIAGNOSTIC EXISTE (#578, arbitré par Grégoire le 28 août 2026 :
 * MESURER AVANT DE CODER). `initialiserNouveauCartouche` choisit l'échelle
 * d'une cartouche neuve par `echelles.find(e => !e.estDemo) || echelles[0]` —
 * un ordre de tableau, pas une désignation. La source non arbitraire serait
 * `grille.echelleId`. Mais si les grilles réelles n'en portent pas, passer par
 * cette source laisserait la cartouche SANS colonnes : une régression pire que
 * le défaut. Le chiffre rendu ici décide donc de la suite ; le correctif ne
 * s'écrit pas avant.
 *
 * ⮕ CE QUE LA LECTURE DU CODE DIT DÉJÀ, ET QUE CE DIAGNOSTIC CONFRONTE AUX
 * DONNÉES : l'éditeur de grille (`grilles.js`) n'écrit JAMAIS `echelleId` ;
 * seule `GRILLE_GENERIQUE` en porte un, semé au boot. Le compte « avec » ne
 * peut donc venir que d'un import, d'un gabarit ou de la grille générique.
 *
 * Lecture inter-trimestres : via `await db.get()` (source réelle IDB), car
 * `getSync` ne voit que le trimestre actif préchargé. Pour chaque trimestre,
 * la copie namespacée `{trim}_grillesTemplates` est sondée d'abord (trimestre
 * archivé), puis la clé globale partagée `grillesTemplates` — même routage que
 * `cleSource`, mais sondé en base plutôt qu'en cache. Une clé partagée par
 * plusieurs trimestres n'est comptée qu'UNE fois.
 *
 * @returns {Promise<{total:number, avec:number, sans:number, resolues:number,
 *   introuvables:number, parCle:Object, lignes:Array}>}
 */
async function _diagnostiquerEchellesGrilles() {
    var trimestres = [];
    try { trimestres = db.getSync('trimestres', []) || []; } catch (e) { trimestres = []; }
    trimestres = trimestres.filter(function (t) { return t && t.id; });

    // Sonde la copie namespacée puis la clé globale ; rend { cle, liste } ou null.
    var lire = async function (nomCle, trimestreId) {
        var copie = trimestreId + '_' + nomCle;
        var v = await db.get(copie);
        if (Array.isArray(v)) return { cle: copie, liste: v };
        v = await db.get(nomCle);
        if (Array.isArray(v)) return { cle: nomCle, liste: v };
        return null;
    };

    var clesVues = {};
    var lignes = [];
    var parCle = {};

    for (var i = 0; i < trimestres.length; i++) {
        var t = trimestres[i];
        var grilles = await lire('grillesTemplates', t.id);
        if (!grilles) continue;
        if (clesVues[grilles.cle]) {
            clesVues[grilles.cle].push(t.id);
            continue;
        }
        clesVues[grilles.cle] = [t.id];

        var echelles = await lire('echellesTemplates', t.id);
        var idsEchelles = {};
        (echelles ? echelles.liste : []).forEach(function (e) {
            if (e && e.id) idsEchelles[e.id] = true;
        });

        var compte = { trimestres: clesVues[grilles.cle], total: 0, avec: 0, sans: 0, resolues: 0, introuvables: 0 };
        parCle[grilles.cle] = compte;

        grilles.liste.forEach(function (g) {
            if (!g) return;
            var porte = !!g.echelleId;
            var statut = !porte ? 'sans' : (idsEchelles[g.echelleId] ? 'resolue' : 'introuvable');
            compte.total++;
            if (porte) compte.avec++; else compte.sans++;
            if (statut === 'resolue') compte.resolues++;
            if (statut === 'introuvable') compte.introuvables++;
            lignes.push({
                cle: grilles.cle,
                grilleId: g.id,
                nom: g.nom || '',
                demo: !!(g.estDemo || g.auteurOriginal),
                echelleId: g.echelleId || '',
                statut: statut,
                cleEchelles: echelles ? echelles.cle : '(aucune)'
            });
        });
    }

    var total = lignes.length;
    var avec = lignes.filter(function (l) { return l.statut !== 'sans'; }).length;
    var sans = total - avec;
    var resolues = lignes.filter(function (l) { return l.statut === 'resolue'; }).length;
    var introuvables = lignes.filter(function (l) { return l.statut === 'introuvable'; }).length;

    // ⚠ `console.log` ASSUMÉ ICI, contre la règle 5 de CLAUDE.md (« zéro
    // console.log dans le nouveau code »), et l'exception est NOMMÉE plutôt que
    // subie : pour un outil de diagnostic, la SORTIE CONSOLE EST LE PRODUIT —
    // il n'a pas d'autre interface. Même statut que `_diagnostiquerModeleCours`
    // (`cours.js`) et `_diagnostiquerResolutionEchelles`
    // (`profil-etudiant-calculs.js`). `warn`/`error` seraient sémantiquement
    // faux — rien n'est anormal quand un diagnostic rend son compte.
    if (typeof console !== 'undefined' && console.table) console.table(lignes);
    console.log('[Diagnostic #578] ' + trimestres.length + ' trimestre(s), '
        + Object.keys(parCle).length + ' clé(s) de grilles distincte(s), ' + total + ' grille(s).');
    console.log('[Diagnostic #578] AVEC echelleId : ' + avec + ' (résolues : ' + resolues
        + ', introuvables : ' + introuvables + ') · SANS echelleId : ' + sans);
    Object.keys(parCle).forEach(function (k) {
        var c = parCle[k];
        console.log('  · ' + k + ' [' + c.trimestres.join(', ') + '] — ' + c.total + ' grille(s) : '
            + c.avec + ' avec (' + c.resolues + ' résolue(s), ' + c.introuvables + ' introuvable(s)), '
            + c.sans + ' sans');
    });
    if (total > 0 && sans === total) {
        console.log('[Diagnostic #578] Aucune grille ne porte d\'echelleId : lire `grille.echelleId` laisserait TOUTE cartouche neuve sans colonnes — c\'est pourquoi la cartouche prend son échelle du FORMULAIRE, jamais de la grille (option A, 29 août 2026).');
    }

    return { total: total, avec: avec, sans: sans, resolues: resolues, introuvables: introuvables, parCle: parCle, lignes: lignes };
}

/* ===============================
   EXPORT DES FONCTIONS GLOBALES
   =============================== */

window._diagnostiquerEchellesGrilles = _diagnostiquerEchellesGrilles;   // diagnostic console (#578, lecture seule)
window.ajouterCartoucheAGrille = ajouterCartoucheAGrille;
window.chargerCartouchePourModif = chargerCartouchePourModif;
window.etapesChaineCartouche = etapesChaineCartouche;   // #1149, lot 3b
window.niveauxDeLaMatrice = niveauxDeLaMatrice;
window.rendreChaineCartouche = rendreChaineCartouche;
window.dupliquerCartouche = dupliquerCartouche;
window.supprimerCartoucheConfirm = supprimerCartoucheConfirm;
window.chargerCartouchesRetroaction = chargerCartouchesRetroaction;
window.sauvegarderCartouche = sauvegarderCartouche;
window.compterPorteursCartoucheDans = compterPorteursCartoucheDans;                     // #967
window.compterPorteursHomonymesCartouche = compterPorteursHomonymesCartouche;         // #967
window.sauvegarderCommentaire = sauvegarderCommentaire;
window.persisterCartouchePartielle = persisterCartouchePartielle;           // #517
window.sauvegarderContexteSpecifiqueCartouche = sauvegarderContexteSpecifiqueCartouche; // lot E1
window.sauvegarderNomCartouche = sauvegarderNomCartouche;                             // lot E1
window.fermerFicheCartouche = fermerFicheCartouche;                                   // lot E1
window.ouvrirCartoucheDepuisListe = ouvrirCartoucheDepuisListe;                       // lot E1
window.sauvegarderContexteCartouche = sauvegarderContexteCartouche;         // #517
window.codesNiveauxPourLecture = codesNiveauxPourLecture;                   // #531
window.lireLigneCommentaire = lireLigneCommentaire;                         // #531
window.lignesMatriceCartouche = lignesMatriceCartouche;                     // #531
window.parserMarkdownCartouche = parserMarkdownCartouche;                   // #531 — l'aller-retour est testé
window.composerModeleCartouche = composerModeleCartouche;                   // #549
window.telechargerModeleCartouche = telechargerModeleCartouche;             // #531
window.importerCommentaires = importerCommentaires;
window.initialiserModuleCartouches = initialiserModuleCartouches;
window.assurerCartoucheDeDepart = assurerCartoucheDeDepart;   // #683 : la bascule de trimestre sème (trimestre-v2-liste.js)

// Nouvelles fonctions Beta 80.2 (interface unifiée)
window.afficherBanqueCartouches = afficherBanqueCartouches;
// window.filtrerCartouchesBanque = filtrerCartouchesBanque; // Fonction commentée (Beta 92)
window.creerNouvelleCartouche = creerNouvelleCartouche;

// Nouvelles fonctions Beta 95 (dropdowns grille + échelle dans formulaire)
window.populerDropdownsCartouche = populerDropdownsCartouche;
window.onChangeSelectionCartouche = onChangeSelectionCartouche;
window.initialiserNouveauCartoucheAvecEchelle = initialiserNouveauCartoucheAvecEchelle;
window.exporterCartouches = exporterCartouches;
window.importerCartouches = importerCartouches;
window.importerCartoucheDepuisTxt = importerCartoucheDepuisTxt;
window.exporterCartoucheEnTexte = exporterCartoucheEnTexte;

// Nouvelles fonctions Beta 90 (boutons dans formulaire)
window.dupliquerCartoucheActive = dupliquerCartoucheActive;
window.exporterCartoucheActive = exporterCartoucheActive;
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
        // #572 — PAS d'`echapperHtml` ici : `textContent` échappe DÉJÀ par
        // construction (c'est le mécanisme interne d'`echapperHtml` elle-même),
        // et il n'interprète pas les entités. Les faire passer deux fois affiche
        // le code littéral : une grille « L'atelier » devenait « L&#39;atelier »
        // dans le filtre. Le défaut existait avant pour `&` (« Écrit & oral ») ;
        // l'échappement des guillemets ajouté à `echapperHtml` l'a rendu courant.
        option.textContent = grille.nom;
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
        let cartouches = await db.get(cle(`cartouches_${grille.id}`)) || [];

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


    const emplacement = document.getElementById('selectionCartouches');
    if (!emplacement) {
        console.warn('   ⚠️ Élément selectionCartouches introuvable');
        return;
    }

    // #1147 (24 oct. 2026) : la sélection en menu déroulant, le nom seul (le nom de la grille est
    // parti avec la barre latérale ; la bibliothèque le montre). Ouvrir une cartouche demande sa grille.
    const grilleDe = {};
    cartouchesFiltrees.forEach(c => { if (!(c.id in grilleDe)) grilleDe[c.id] = c.grilleId; });
    const infoCartouche = document.getElementById('infoCartouche');
    MenuSelection.rendre(emplacement, {
        idMenu: 'menuCartouches',
        elements: cartouchesFiltrees.map(c => ({ id: c.id, nom: c.nom })),
        idOuvert: (window.cartoucheActuel && infoCartouche && !infoCartouche.classList.contains('u-hide')) ? window.cartoucheActuel.id : null,
        libelleAucun: 'Aucune cartouche ouverte',
        libelleMenu: 'Cartouche ouverte',
        phraseVide: 'Crée une nouvelle cartouche ou puise dans la bibliothèque',
        ouvrir: (id) => ouvrirCartoucheDepuisListe(id, grilleDe[id])
    });
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

/* ===============================
   LOT 4, VOLET A (4 septembre 2026) — LES PALIERS D'UNE GRILLE ANALYTIQUE
   =============================== */

/**
 * Retour de Grégoire : « quand on a une grille analytique et qu'on veut produire une
 * cartouche, nous n'avons pas le choix de créer une échelle, alors que la grille
 * analytique fonctionne uniquement avec des points. » Sa décision, la voie (a) : l'échelle
 * RESTE le mécanisme des paliers (le lot 3 déduit le niveau d'un chiffre par ses bornes,
 * et ce niveau ouvre la cartouche, clé `critereId_niveau`) ; elle cesse seulement de se
 * présenter comme des « niveaux » quand la grille est analytique — champ « Paliers »,
 * colonnes titrées par les bornes, échelle de départ préremplie.
 *
 * ⚠ [EN ATTENTE — mots PROPOSÉS à Grégoire (consigne du 4 sept.), pas arrêtés] : les
 * libellés que ses collègues liront vivent ICI, en un seul endroit. La forme des bornes
 * est exacte (« 0–64,99 % »), celle que l'éditeur d'échelles montre — le cadrage écrivait
 * « 0–64 % » ; un arrondi cacherait où tombe 64,5.
 */
const LIBELLES_PALIERS = {
    champNiveaux: 'Échelle (niveaux)',
    champPaliers: 'Paliers (bornes en %)',
    coinNiveaux: 'Critère / Niveau',
    coinPaliers: 'Critère / Palier',
    sansEchelleNiveaux: 'Cette cartouche n\'a pas encore d\'échelle. Choisis une échelle de performance ci-dessus : ses niveaux deviendront les colonnes de la matrice.',
    sansEchellePaliers: 'Cette cartouche n\'a pas encore de paliers. Choisis-les ci-dessus : leurs bornes deviendront les colonnes de la matrice.'
};
/** L'échelle semée par `assurerEchelleIdmeDeDepart` (echelles.js) — préremplie si elle est dans la base. */
const ID_ECHELLE_DE_DEPART = 'ECHELLE_IDME_DEPART';

/**
 * Une grille est analytique quand son type l'est — déclaré (lot 1), sinon déduit de ses
 * critères quand ils le sont tous. Une seule source : `typeGrilleAffiche` (grilles.js).
 * Une grille MIXTE (des critères à niveaux ET à points, sans type déclaré) n'est PAS
 * analytique : elle garde les mots des niveaux. Une grille déclarée analytique dont un
 * critère déroge l'est : le déclaré l'emporte, comme au menu.
 */
function grilleEstAnalytique(grille) {
    if (!grille || typeof window.typeGrilleAffiche !== 'function') return false;
    return window.typeGrilleAffiche(grille) === 'analytique';
}

/** Une borne, telle quelle, en français : 64.99 → « 64,99 », 85 → « 85 ». Vide si ce n'est pas un nombre. */
function formaterBornePalier(v) {
    return formaterNombre(v);   // #1137 : la règle vit dans js/note-pourcentage.js
}

/** Le titre d'un palier : « 65–74,99 % » ; sans bornes (copie d'échelle sans elles), le nom du niveau. */
function libellePalier(niveau) {
    if (!niveau) return '';
    const min = formaterBornePalier(niveau.min);
    const max = formaterBornePalier(niveau.max);
    if (min === '' || max === '') return String(niveau.nom || niveau.code || '');
    return min + '\u2013' + formaterPourcentage(niveau.max);
}

/** La grille d'une cartouche, par son id ou l'id d'origine d'une copie — `null` sans grille. */
async function grilleDeCartouche(grilleId) {
    if (!grilleId) return null;
    const grilles = await db.get(cle('grillesTemplates')) || [];
    return grilles.find(g => g && (g.id === grilleId || g.idOriginal === grilleId)) || null;
}

/** Le mot du champ : « Paliers (bornes en %) » pour une grille analytique, « Échelle (niveaux) » sinon. */
function adapterFormulaireCartoucheAuTypeGrille(grille) {
    const mot = document.getElementById('motEchelleCartouche');
    if (mot) mot.textContent = grilleEstAnalytique(grille) ? LIBELLES_PALIERS.champPaliers : LIBELLES_PALIERS.champNiveaux;
}
// Exposés ICI, après les déclarations : `const` n'est pas hoisté, et un export placé plus haut
// dans le fichier (avec ceux des fonctions) casserait le chargement du module (TDZ).
window.grilleEstAnalytique = grilleEstAnalytique;
window.libellePalier = libellePalier;
window.LIBELLES_PALIERS = LIBELLES_PALIERS;

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

    // Lot 4, volet A — le mot du champ suit la grille liée (création : aucune → « niveaux »).
    adapterFormulaireCartoucheAuTypeGrille(await grilleDeCartouche(grilleId));
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
    let echelleId = selectEchelle?.value;

    // Lot 4, volet A — la grille choisie dit si l'on parle de niveaux ou de paliers. Pour
    // une grille analytique sans échelle choisie, l'échelle de départ est PRÉREMPLIE si elle
    // est dans la base (et dans la sélection) ; sinon rien n'est prérempli — on ne devine
    // pas une échelle (#578), on offre celle qui existe.
    const grilleChoisie = await grilleDeCartouche(grilleId);
    adapterFormulaireCartoucheAuTypeGrille(grilleChoisie);
    if (grilleId && !echelleId && selectEchelle && grilleEstAnalytique(grilleChoisie)) {
        const echelles = await db.get(cle('echellesTemplates')) || [];
        const depart = echelles.find(e => e && e.id === ID_ECHELLE_DE_DEPART && estDansSelection(e));
        if (depart) {
            selectEchelle.value = depart.id;
            echelleId = depart.id;
        }
    }

    // Si les deux ne sont pas sélectionnés, masquer la matrice
    if (!grilleId || !echelleId) {
        if (matriceRetroaction) matriceRetroaction.classList.add('u-hide');
        rendreChaineCartouche();   // #1149, lot 3b : la grille choisie seule compte déjà
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
    document.getElementById('matriceRetroaction').classList.remove('u-hide');
}

/**
 * Crée une nouvelle cartouche vide
 * Affiche le formulaire avec dropdowns pour sélectionner grille ET échelle
 */
async function creerNouvelleCartouche() {
    // Lot E1 (D3) : une cartouche en cours de création ne se perd pas sans question.
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('cartouche'))) return;
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
    rendreModeFicheCartouche(true);
    if (btnExportPDFCreation) btnExportPDFCreation.classList.add('u-hide');
    if (btnExportTexteCreation) btnExportTexteCreation.classList.add('u-hide');

    // Afficher le formulaire
    const messageAccueil = document.getElementById('messageAccueilCartouche');
    const infoCartouche = document.getElementById('infoCartouche');
    if (messageAccueil) messageAccueil.classList.add('u-hide');
    if (infoCartouche) infoCartouche.classList.remove('u-hide');
    // #1147 : une cartouche en création n'est pas encore dans le menu
    MenuSelection.marquer('menuCartouches', null);

    // #1042 — un exemple ouvert juste avant a verrouillé ce formulaire : le rouvrir d'abord.
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.quitterModeLectureSeuleDemo) BibliothequeUI.quitterModeLectureSeuleDemo(document.getElementById('infoCartouche'));
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
    rendreChaineCartouche();   // #1149, lot 3b : la chaîne lit les deux menus vides

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
    MenuSelection.marquer('menuCartouches', cartoucheId);
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
 * Exporte la cartouche actuellement active en JSON
 */
// OBSOLÈTE : Fonction dupliquée supprimée (exportait dans l'ancien format sans métadonnées CC)
// La fonction exporterCartoucheActive() correcte est définie plus haut (ligne 1885) et utilise ajouterMetadonnéesCC()

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
                <input type="checkbox" value="${echapperHtml(crit.nom.toUpperCase())}">
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
        let cartouches = await db.get(cle(`cartouches_${grille.id}`)) || [];
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
                nom: BibliothequeUI.formaterTitreDemo(echapperHtml(cartouche.nom || 'Sans titre'), BibliothequeUI.estItemDemo(cartouche)),
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
                    { label: 'Retirer', action: 'retirerCartoucheDeBibliotheque', param: cartouche.id, param2: cartouche.grilleId, classe: 'btn-secondaire', title: 'Retirer de ta sélection (données conservées)' },
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
                nom: BibliothequeUI.formaterTitreDemo(echapperHtml(cartouche.nom || 'Sans titre'), BibliothequeUI.estItemDemo(cartouche)),
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
                dataAttrs: `data-grille="${echapperHtml(grilleNom)}"`,
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
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune cartouche dans ta sélection</p>';
    } else {
        let groupeCourant = null;
        data.cartesSection1.forEach(carte => {
            if (carte.groupe && carte.groupe !== groupeCourant) {
                groupeCourant = carte.groupe;
                contenuSection1 += `<h4 style="margin-top: 15px; margin-bottom: 10px; color: var(--gris-moyen);">${echapperHtml(groupeCourant)}</h4>`;
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
                ${data.disciplines.map(g => `<option value="${echapperHtml(g)}">${echapperHtml(g)}</option>`).join('')}
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
            contenuSection2 += `<h4 style="margin-top: 20px; margin-bottom: 10px; color: var(--gris-moyen);">${echapperHtml(groupeCourant)}</h4>`;
        }
        contenuSection2 += BibliothequeUI.renderCarteDisponible(carte);
    });

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeCartouches',
        titre: 'Bibliothèque de cartouches de rétroaction',
        sousTitre: 'Gère les cartouches de rétroaction de ta sélection.',
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
        titreSection1: 'Cartouches dans ta sélection',
        contenuIdListe1: 'listeCartouchesDansBibliotheque',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        titreSection2: 'Cartouches disponibles à ajouter à ta sélection',
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

    const lots = [];
    for (const grille of grilles) {
        if (!grille || !grille.id) continue;
        // ⚠⚠ SAUT RETIRÉ PAR S5/#623 — SA PRÉMISSE EST MORTE, ET ELLE ÉTAIT ÉCRITE.
        //
        // Le code sautait ici toute grille présente aussi dans le trimestre actif,
        // et il en donnait la raison : « `cartouches_<id>` est global », donc les
        // deux trimestres partageaient le même magasin et l'import n'aurait fait que
        // proposer à l'enseignant ses propres cartouches.
        //
        // Sous D2-A cette phrase est FAUSSE. Chaque trimestre a ses propres
        // `<trim>_cartouches_<id>`, et deux trimestres portant la même grille ont
        // des cartouches DIFFÉRENTES. C'est même le cas où l'import a le plus de
        // sens : rapatrier le travail fait l'an dernier sur la même grille.
        //
        // ⮕ Garder le saut aurait rendu ces lots invisibles — sans erreur, sans
        // message. Détecté par la sentinelle WebKit `cartouches-import-trimestre`,
        // que Vitest ne pouvait pas voir.
        //
        // ⮕ `grillesActives` et `idsActifs` ont été retirés AVEC le saut : ils ne
        // servaient qu'à lui. Les laisser aurait été garder un calcul dont plus
        // personne ne lit le résultat.
        //
        // ⚠ Le doublon que l'ancien commentaire redoutait n'est plus possible ici :
        // la source et la destination sont deux magasins distincts.
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
            <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre <button class="btn-aide-contextuelle" data-aide="import-autre-trimestre" aria-label="Aide : importer depuis un autre trimestre" title="Aide : importer depuis un autre trimestre"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></h4>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <select id="selectTrimestreImportCartouches" class="controle-form" style="flex: 1; min-width: 200px;">
                    <option value="">-- Choisir un trimestre --</option>
                    ${options}
                </select>
                <button data-action="afficherCartouchesTrimestreModal" class="btn btn-secondaire btn-compact">Voir les cartouches</button>
                <button data-action="importerToutCartouchesTrimestreModal" class="btn btn-principal btn-compact" data-tooltip="import-trimestre-tout-cartouches">Tout importer</button>
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
    // #656 — l'échelle de la cartouche se rattache comme à l'import, sur les deux chemins.
    const lireEchelleSource = (id) => (db.getSync(cleSource('echellesTemplates', srcId), []) || [])
        .find(e => e && e.id === id) || null;
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
            () => [marquerProvenanceCartouche(cartoucheSource, srcId)],
            lireEchelleSource
        );
        return { ajoutee: true, conflit: null, grilleCreee: res.grille, grilleAccueil: null };
    }

    // Chemin 2 — la grille de même lignée est déjà là : la cartouche s'y range.
    const cleDest = cle(`cartouches_${grilleAccueil.id}`);

    // #1144 (23 oct. 2026) — la grille d'accueil est de même LIGNÉE (`memeIdentite`, qui compte
    // `inspireDe.sourceId`), pas forcément aux mêmes ids de critères : une grille dupliquée en
    // reçoit de neufs. Rangée telle quelle, la copie gardait les ids de la source, et l'évaluation
    // affichait ses critères à la place de ceux de la grille. Rattachée ici, par id puis par nom.
    const copie = {
        ...window.cartoucheCorrespondance.rattacher(marquerProvenanceCartouche(cartoucheSource, srcId), grilleAccueil.criteres).cartouche,
        id: genererIdUnique('CART_'),
        grilleId: grilleAccueil.id
    };
    if (copie.echelleId) copie.echelleId = partageSection.rattacherEchelle(copie.echelleId, lireEchelleSource);

    // #476 — garde d'identité AU POINT D'ÉCRITURE : réimporter deux fois la même
    // cartouche ne doit pas en empiler deux exemplaires silencieusement.
    // #522 lot 5 : dans la file de la clé — lue hors file, la garde laissait passer
    // un exemplaire rangé entre-temps (deux copies rapprochées).
    // security-ok: la source est une copie d'archive écrite par l'app elle-même, pas un fichier externe.
    let garde = null;
    await db.modifier(cleDest, (lues) => {
        garde = ajouterAvecGardeIdentite(lues || [], copie);
        return garde.ajoute ? garde.liste : undefined;
    }, []);
    if (!garde.ajoute) {
        return { ajoutee: false, conflit: garde.conflit, grilleCreee: null, grilleAccueil };
    }
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cleDest);   // lot F : geste hors témoin (copierCartoucheDepuisTrimestre)
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
        alert('Import impossible : le trimestre actif est clos (consultation). Active un trimestre courant pour importer des cartouches.');
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
        alert('Import impossible : le trimestre actif est clos (consultation). Active un trimestre courant pour importer des cartouches.');
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

        // ⚠ La garde d'identité de #476 doit voir la collection telle qu'elle est
        // AU MOMENT DE L'ÉCRITURE : lue hors file, elle laisserait passer un
        // exemplaire ajouté entre-temps. Les messages sortent APRÈS le mutateur.
        let cartouche = null;
        let nomEnConflit = null;
        let sourceIntrouvable = false;
        let grilleManquante = false;

        const ecritLotF = await db.modifier(cle(`cartouches_${grilleIdLocal}`), async (lues) => {
        let cartouches = lues || [];
        cartouche = cartouches.find(c => c.id === id);
        if (!cartouche) {
            cartouche = cartouches.find(c => c.idOriginal === id);
        }

        if (!cartouche) {
            const toutesCartouches = await obtenirToutesLesCartouchesBibliotheque();
            const cartoucheSource = toutesCartouches.find(c => c.id === id);
            if (cartoucheSource) {
                if (!grilleLocale) {
                    grilleManquante = true;
                    return undefined;
                }
                // Générer un nouvel ID pour éviter les conflits (pattern Productions)
                const nouvelId = genererIdUnique('CART_');
                // #1144 — rangée sous la grille LOCALE (trouvée aussi par `idOriginal`, donc pas
                // forcément aux mêmes ids de critères) : rattachée à ses critères, et elle la pointe.
                cartouche = {
                    ...window.cartoucheCorrespondance.rattacher(cartoucheSource, grilleLocale.criteres).cartouche,
                    id: nouvelId,
                    idOriginal: cartoucheSource.id,
                    grilleId: grilleIdLocal,
                    dansBibliotheque: true,
                    dateImport: new Date().toISOString()
                };
                // #476 — garde d'identité au point d'écriture (cf. grilles.js).
                const gardeCartouche = ajouterAvecGardeIdentite(cartouches, cartouche);
                if (!gardeCartouche.ajoute) {
                    nomEnConflit = (gardeCartouche.conflit && gardeCartouche.conflit.nom) || 'Une cartouche';
                    return undefined;
                }
                cartouches = gardeCartouche.liste;
            } else {
                sourceIntrouvable = true;
                return undefined;
            }
        } else {
            cartouche.dansBibliotheque = true;
        }

        return cartouches;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle(`cartouches_${grilleIdLocal}`));   // lot F : geste hors témoin (ajouterCartoucheIndividuelle)

        // Les messages vivent HORS du mutateur : la file ne porte que l'écriture.
        if (grilleManquante) {
            alert('Importe d\'abord la grille associée depuis la bibliothèque de grilles.');
            return;
        }
        if (nomEnConflit) {
            alert(`« ${nomEnConflit} » est déjà dans ta sélection.\n\nPour en avoir un second exemplaire, utilise « Dupliquer ».`);
            return;
        }
        if (sourceIntrouvable) {
            alert('Cartouche introuvable');
            return;
        }
        if (!cartouche) return;

        // ⚠ Relecture-vérification : `db.set` refuse en silence (cf. grilles.js).
        const verifCartouche = await db.get(cle(`cartouches_${grilleIdLocal}`)) || [];

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
    let trouvee = false;
    const ecritLotF = await db.modifier(cle(`cartouches_${grilleId}`), (lues) => {
        const cartouches = lues || [];
        const cartouche = cartouches.find(c => c.id === id);
        if (!cartouche) return undefined;

        cartouche.dansBibliotheque = false;
        trouvee = true;
        return cartouches;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle(`cartouches_${grilleId}`));   // lot F : geste hors témoin (retirerCartoucheDeBibliotheque)

    if (trouvee) {
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
    // ⚠ Lecture hors file, pour NOMMER la cartouche dans la question. La
    // confirmation ne doit pas tenir la file ouverte.
    const cartouches = await db.get(cle(`cartouches_${grilleId}`)) || [];
    const cartouche = cartouches.find(c => c.id === id);

    if (!cartouche) return;

    // #647 (2 septembre 2026, soir) — ce chemin est le plus destructeur des trois :
    // la cartouche part de sa grille (ancrage du trimestre actif) ET, si elle s'y
    // trouve, de la Bibliothèque. La question le dit AVANT le geste, et ne
    // nomme la bibliothèque que si la cartouche y est vraiment — mesuré, pas supposé.
    // Ce qui SURVIT est dit aussi, seulement s'il y a quelque chose à dire : les
    // évaluations qui l'emploient gardent leur rétroaction déjà rédigée (elle est
    // stockée dans l'évaluation, `retroactionFinale`, pas relue depuis la cartouche).
    // Témoin négatif : une cartouche qui n'est que dans sa grille et que rien
    // n'emploie se supprime avec la question d'avant, sans un mot de plus.
    const biblio = typeof obtenirToutesLesCartouchesBibliotheque === 'function'
        ? (await obtenirToutesLesCartouchesBibliotheque() || [])
        : [];
    const aussiDansBibliotheque = biblio.some(c => c.id === id);
    const evaluations = await db.get(cle('evaluationsSauvegardees')) || [];
    const nbEvaluations = evaluations.filter(ev => ev && ev.cartoucheId === id).length;

    // ↻ 3 septembre 2026 (mesuré par Cowork sur une capture de Grégoire) : la grille
    // se nomme dans TOUS les cas — c'est son ancrage qu'on vide, toujours. Seule
    // la Bibliothèque reste conditionnelle. Même forme que la liste (1810).
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);
    let portee = '';
    if (aussiDansBibliotheque) {
        portee += 'Elle part aussi de la Bibliothèque.\n';
    }
    if (nbEvaluations > 0) {
        portee += `${nbEvaluations} évaluation(s) l'emploient : leur rétroaction déjà rédigée est conservée.\n`;
    }

    // Confirmation
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('cartouche'))) return;
    if (!confirm(`Supprimer définitivement la cartouche «${cartouche.nom}» de sa grille « ${grille ? grille.nom : grilleId} » ?\n\n${portee ? portee + '\n' : ''}Cette action est irréversible.`)) {
        return;
    }

    // Marquer comme supprimée si c'est un gabarit hardcodé
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    // Suppression définitive du store local, DANS la file.
    const ecritLotF = await db.modifier(cle(`cartouches_${grilleId}`), (lues) => {
        return (lues || []).filter(c => c.id !== id);
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle(`cartouches_${grilleId}`));   // lot F : geste hors témoin (supprimerCartoucheDefinitivement)

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
 * Supprimer une cartouche de la Bibliothèque uniquement (Section 2)
 * @param {string} id - ID de la cartouche à supprimer
 */
async function supprimerCartoucheDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesCartouchesBibliotheque === 'function'
        ? await obtenirToutesLesCartouchesBibliotheque()
        : [];
    const cartouche = biblio.find(c => c.id === id);
    if (!cartouche) return;

    // #647 (3 septembre 2026) — la même vérité que l'onglet Données, sur l'autre
    // chemin. Ce retrait n'écrit que la Bibliothèque : si la cartouche est
    // aussi ancrée à sa grille (`cartouches_<grilleId>`, clé EXACTE, lue au moment
    // où on parle), elle y RESTE et la question le dit. Sinon la suppression est
    // entière, et elle se fait sans un mot de plus.
    const nomCartouche = cartouche.nom || 'Sans titre';
    let question = `Supprimer définitivement «${nomCartouche}» de la Bibliothèque ?\n\nCette action est irréversible.`;
    if (cartouche.grilleId) {
        const ancrage = await db.get(cle(`cartouches_${cartouche.grilleId}`)) || [];
        if (ancrage.some(c => c.id === id)) {
            const grilles = await db.get(cle('grillesTemplates')) || [];
            const grille = grilles.find(g => g.id === cartouche.grilleId);
            question = `Retirer «${nomCartouche}» de la Bibliothèque ?\n\nLe retrait est irréversible ; la cartouche reste dans sa grille « ${grille ? grille.nom : cartouche.grilleId} ».`;
        }
    }
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('cartoucheBibliotheque'))) return;
    if (!confirm(question)) return;

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
        modifierListe: (mutateur) => db.modifier(cle(`cartouches_${grilleId}`), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement par forkerItem — aucune source externe
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
        modifierListe: (mutateur) => db.modifier(cle(`cartouches_${grilleId}`), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
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
        var cleStockage = cle('cartouches_' + grilleId);
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
