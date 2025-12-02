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
   - #apercuRetroaction : Conteneur de l'aperçu
   - #exempleRetroaction : Zone d'affichage de l'aperçu
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
function initialiserModuleCartouches() {
    console.log('💬 Initialisation du module Cartouches de rétroaction');

    // Vérifier que nous sommes dans la bonne section
    const listeBanque = document.getElementById('listeCartouchesBanque');
    if (!listeBanque) {
        console.log('   ⚠️  Section rétroactions non active, initialisation reportée');
        return;
    }

    // NOUVELLE INTERFACE (Beta 80.2): Banque + import unifiés
    chargerFiltreGrillesCartouche();
    afficherBanqueCartouches();

    // Charger aussi l'ancien système pour compatibilité interne (caché)
    const selectGrille = document.getElementById('selectGrilleRetroaction');
    if (selectGrille) {
        chargerSelectGrillesRetroaction();
    }

    // Gestionnaire d'événements pour le bouton d'export global (Beta 92 - fix async)
    const btnExporter = document.getElementById('btnExporterToutesCartouches');
    if (btnExporter) {
        btnExporter.addEventListener('click', async function(e) {
            e.preventDefault();
            await exporterCartouches();
        });
    }

    // Gestionnaire d'événements pour le bouton d'export individuel (Beta 92 - fix async)
    const btnExporterIndiv = document.getElementById('btnExporterCartouche');
    if (btnExporterIndiv) {
        btnExporterIndiv.addEventListener('click', async function(e) {
            e.preventDefault();
            await exporterCartoucheActive();
        });
    }

    console.log('   ✅ Module Cartouches initialisé (interface unifiée 2 colonnes)');
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
function chargerSelectGrillesRetroaction() {
    const grilles = db.getSync('grillesTemplates', []);
    const select = document.getElementById('selectGrilleRetroaction');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Choisir une grille --</option>';
    grilles.forEach(grille => {
        const nomEchappe = echapperHtml(grille.nom);
        select.innerHTML += `<option value="${grille.id}">${nomEchappe}</option>`;
    });
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
function chargerCartouchesRetroaction() {
    const grilleId = document.getElementById('selectGrilleRetroaction').value;
    const selectCartouche = document.getElementById('selectCartouche');
    
    if (!grilleId) {
        // Aucune grille sélectionnée
        document.getElementById('aucuneEvalRetroaction').style.display = 'block';
        document.getElementById('infoCartouche').style.display = 'none';
        document.getElementById('matriceRetroaction').style.display = 'none';
        document.getElementById('apercuRetroaction').style.display = 'none';
        document.getElementById('listeCartouchesExistants').style.display = 'none';
        return;
    }
    
    // Charger les cartouches existantes pour cette grille
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    
    selectCartouche.innerHTML = '<option value="">-- Nouvelle cartouche --</option>';
    cartouches.forEach(cartouche => {
        const nomEchappe = echapperHtml(cartouche.nom);
        selectCartouche.innerHTML += `<option value="${cartouche.id}">${nomEchappe}</option>`;
    });
    
    document.getElementById('aucuneEvalRetroaction').style.display = 'none';
    document.getElementById('infoCartouche').style.display = 'block';
    
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
    if (listeAncienne) listeAncienne.style.display = 'none';
    
    // Initialiser une nouvelle cartouche par défaut
    initialiserNouveauCartouche(grilleId);
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
 * - chargerCartouchesRetroaction() (création par défaut)
 * - chargerMatriceRetroaction() (si aucune cartouche sélectionnée)
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
function initialiserNouveauCartouche(grilleId) {
    // Récupérer la grille sélectionnée
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);
    
    if (!grille) {
        alert('Grille introuvable');
        return;
    }
    
    // Les critères viennent directement de la grille
    const criteres = grille.criteres || [];
    
    // Récupérer l'échelle de performance globale
    const niveaux = db.getSync('niveauxEchelle', [
        { code: 'I', nom: 'Incomplet', min: 0, max: 64 },
        { code: 'D', nom: 'En Développement', min: 65, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100 }
    ]);
    
    // Créer la structure de cartouche
    cartoucheActuel = {
        id: 'CART' + Date.now(),
        nom: '',
        grilleId: grilleId,
        contexte: '',
        criteres: criteres.map(c => ({ id: c.id, nom: c.nom })),
        niveaux: niveaux.map(n => ({ code: n.code, nom: n.nom })),
        commentaires: {},
        verrouille: false
    };
    
    // Réinitialiser les champs
    document.getElementById('nomCartouche').value = '';
    document.getElementById('contexteCartouche').value = '';
    
    // Afficher la matrice et l'aperçu
    afficherMatriceRetroaction();
    mettreAJourMetriques();
    document.getElementById('matriceRetroaction').style.display = 'block';
    document.getElementById('apercuRetroaction').style.display = 'block';
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
function chargerMatriceRetroaction(cartoucheIdParam = null, grilleIdParam = null) {
    console.log('📋 chargerMatriceRetroaction() appelé avec params:', cartoucheIdParam, grilleIdParam);

    // Si appelé avec paramètres (nouvelle interface sidebar), utiliser directement
    let grilleId = grilleIdParam;
    let cartoucheId = cartoucheIdParam;

    // Sinon, lire depuis les selects (ancienne interface, compatibilité)
    if (!cartoucheId || !grilleId) {
        const selectGrille = document.getElementById('selectGrilleRetroaction');
        const selectCartouche = document.getElementById('selectCartouche');

        console.log('Lecture depuis selects - selectGrille trouvé:', !!selectGrille, 'valeur:', selectGrille?.value);
        console.log('Lecture depuis selects - selectCartouche trouvé:', !!selectCartouche, 'valeur:', selectCartouche?.value);

        grilleId = grilleId || selectGrille?.value;
        cartoucheId = cartoucheId || selectCartouche?.value;
    }

    console.log('GrilleId final:', grilleId, 'CartoucheId final:', cartoucheId);

    if (!cartoucheId) {
        console.log('⚠️ Pas de cartouche sélectionnée, initialisation nouvelle cartouche');
        // Nouvelle cartouche
        initialiserNouveauCartouche(grilleId);
        return;
    }

    // Charger la cartouche existante
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    console.log('Cartouches trouvées:', cartouches.length);

    cartoucheActuel = cartouches.find(c => c.id === cartoucheId);
    console.log('cartoucheActuel trouvé:', !!cartoucheActuel);

    if (cartoucheActuel) {
        // Stocker dans window pour accès global
        window.cartoucheActuel = cartoucheActuel;
        window.cartoucheActuel.grilleId = grilleId;

        // Remplir les champs
        const inputNom = document.getElementById('nomCartouche');
        const inputContexte = document.getElementById('contexteCartouche');

        if (inputNom) inputNom.value = cartoucheActuel.nom;
        if (inputContexte) inputContexte.value = cartoucheActuel.contexte || '';

        console.log('Champs nom/contexte remplis');

        // Afficher la matrice
        afficherMatriceRetroaction();
        calculerPourcentageComplete();

        document.getElementById('matriceRetroaction').style.display = 'block';
        document.getElementById('apercuRetroaction').style.display = 'block';

        console.log('✅ Matrice affichée');
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
 * - initialiserNouveauCartouche()
 * - chargerMatriceRetroaction()
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
function afficherMatriceRetroaction() {
    if (!cartoucheActuel) return;

    const container = document.getElementById('matriceContainer');

    // NOUVELLE LOGIQUE: Lire les niveaux depuis toutes les échelles disponibles
    // pour permettre d'ajouter des niveaux manquants (ex: niveau "0")
    const echelles = db.getSync('echellesTemplates', []);

    // Créer un Set de tous les niveaux disponibles (fusionner toutes les échelles)
    const niveauxDisponiblesMap = new Map(); // code -> {code, nom, couleur}

    // Ajouter les niveaux de TOUTES les échelles
    echelles.forEach(echelle => {
        if (echelle.niveaux) {
            echelle.niveaux.forEach(n => {
                if (!niveauxDisponiblesMap.has(n.code)) {
                    niveauxDisponiblesMap.set(n.code, {
                        code: n.code,
                        nom: n.nom,
                        couleur: n.couleur || '#cccccc'
                    });
                }
            });
        }
    });

    // Ajouter les niveaux de la cartouche (pour compatibilité ancienne structure)
    if (cartoucheActuel.niveaux) {
        cartoucheActuel.niveaux.forEach(n => {
            if (!niveauxDisponiblesMap.has(n.code)) {
                niveauxDisponiblesMap.set(n.code, {
                    code: n.code,
                    nom: n.nom,
                    couleur: n.couleur || '#cccccc'
                });
            }
        });
    }

    // Convertir en tableau et trier (0 en premier, puis I, D, M, E, etc.)
    const niveauxAffichage = Array.from(niveauxDisponiblesMap.values()).sort((a, b) => {
        // Ordre personnalisé: 0, I, D, M, E, puis autres
        const ordre = {'0': 0, 'I': 1, 'D': 2, 'M': 3, 'E': 4};
        const ordreA = ordre[a.code] !== undefined ? ordre[a.code] : 99;
        const ordreB = ordre[b.code] !== undefined ? ordre[b.code] : 99;
        return ordreA - ordreB;
    });

    const couleursParCode = {};
    niveauxAffichage.forEach(n => {
        couleursParCode[n.code] = n.couleur;
    });

    let html = `
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
                                  onchange="sauvegarderCommentaire('${key}')">${commentaireEchappe}</textarea>
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
 * NOTE:
 * - Sauvegarde en mémoire uniquement
 * - Persistance complète via sauvegarderCartouche()
 */
function sauvegarderCommentaire(key) {
    if (!cartoucheActuel) return;
    
    const textarea = document.getElementById(`comm_${key}`);
    if (textarea) {
        cartoucheActuel.commentaires[key] = textarea.value;
        calculerPourcentageComplete();
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
function sauvegarderCartouche() {
    if (!cartoucheActuel) return;
    
    const nom = document.getElementById('nomCartouche').value.trim();
    if (!nom) {
        alert('Veuillez donner un nom à la cartouche');
        return;
    }
    
    // Mettre à jour les champs
    cartoucheActuel.nom = nom;
    cartoucheActuel.contexte = document.getElementById('contexteCartouche').value.trim();
    
    const grilleId = cartoucheActuel.grilleId;
    let cartouches = db.getSync(`cartouches_${grilleId}`, []);
    
    // Vérifier si la cartouche existe déjà
    const index = cartouches.findIndex(c => c.id === cartoucheActuel.id);
    if (index >= 0) {
        // Mise à jour
        cartouches[index] = cartoucheActuel;
    } else {
        // Ajout
        cartouches.push(cartoucheActuel);
    }
    
    // Sauvegarder
    db.setSync(`cartouches_${grilleId}`, cartouches);

    // NOUVELLE INTERFACE (Beta 80.2): Rafraîchir la banque
    afficherBanqueCartouches();
    definirCartoucheActive(cartoucheActuel.id);

    // Rafraîchir l'interface (ancien système - compatibilité)
    chargerCartouchesRetroaction();
    document.getElementById('selectCartouche').value = cartoucheActuel.id;

    // Rafraîchir la nouvelle vue (ancien système)
    // DÉSACTIVÉ Beta 80.5+ : ancienne interface remplacée par sidebar
    // afficherToutesLesGrillesEtCartouches();

    // Rafraîchir la banque sidebar (Beta 80.5+)
    if (typeof afficherBanqueCartouches === 'function') {
        afficherBanqueCartouches();
    }

    console.log('✅ Cartouche sauvegardée avec succès');
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
    document.getElementById('zoneImportCommentaires').style.display = 'block';
    document.getElementById('matriceRetroaction').style.display = 'none';
}

/**
 * Annule l'import et retourne à la matrice
 * Efface le contenu du textarea d'import
 * 
 * UTILISÉ PAR:
 * - Bouton «Annuler» dans la zone d'import
 */
function annulerImportCommentaires() {
    document.getElementById('zoneImportCommentaires').style.display = 'none';
    document.getElementById('matriceRetroaction').style.display = 'block';
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
function importerCommentaires() {
    const texte = document.getElementById('commentairesColles').value.trim();
    
    if (!texte) {
        alert('Veuillez coller vos commentaires');
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
            const match = ligne.match(/^\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)$/);
            if (match && critereActuel) {
                const nomCritere = match[1].trim().toUpperCase();
                const niveau = match[2].trim();
                const commentaire = match[3].trim();
                
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
            alert('Aucun commentaire n\'a pu être importé. Vérifiez le format.');
            return;
        }
        
        // Rafraîchir l'affichage
        afficherMatriceRetroaction();
        calculerPourcentageComplete();
        annulerImportCommentaires();
        
        afficherNotificationSucces(`${compteur} commentaire(s) importé(s) avec succès !`);
        
    } catch (error) {
        console.error('Erreur d\'import:', error);
        alert('Erreur lors de l\'import. Vérifiez le format de vos données.');
    }
}

/* ===============================
   GÉNÉRATION D'APERÇU
   =============================== */

/**
 * Génère un aperçu aléatoire de rétroaction
 * Choisit un niveau aléatoire pour chaque critère
 * 
 * FONCTIONNEMENT:
 * 1. Pour chaque critère:
 *    - Tire un niveau aléatoire
 *    - Récupère le commentaire correspondant
 *    - Affiche dans une zone stylisée
 * 2. Simule ce que verrait un·e étudiant·e
 * 
 * UTILISÉ PAR:
 * - Bouton «Générer un aperçu aléatoire»
 * 
 * AFFICHAGE:
 * - Nom du critère en gras
 * - Niveau atteint
 * - Commentaire correspondant
 * - Style différencié par bloc
 * 
 * UTILITÉ:
 * - Tester visuellement les commentaires
 * - Vérifier la cohérence
 * - Prévisualiser le rendu final
 */
function genererApercuAleatoire() {
    if (!cartoucheActuel) return;
    
    let html = '<h6 class="u-texte-bleu-mb15">Rétroaction générée automatiquement :</h6>';
    
    cartoucheActuel.criteres.forEach(critere => {
        // Choisir un niveau aléatoire
        const niveauIndex = Math.floor(Math.random() * cartoucheActuel.niveaux.length);
        const niveau = cartoucheActuel.niveaux[niveauIndex];
        const key = `${critere.id}_${niveau.code}`;
        const commentaire = cartoucheActuel.commentaires[key] || '[Commentaire non défini]';
        
        const nomCritereEchappe = echapperHtml(critere.nom);
        const nomNiveauEchappe = echapperHtml(niveau.nom);
        const codeNiveauEchappe = echapperHtml(niveau.code);
        const commentaireEchappe = echapperHtml(commentaire);
        
        html += `
            <div style="margin-bottom: 15px; padding: 10px; background: var(--bleu-tres-pale); 
                 border-left: 3px solid var(--bleu-moyen);">
                <strong>${nomCritereEchappe}</strong> - Niveau : ${nomNiveauEchappe} (${codeNiveauEchappe})
                <p class="cartouche-mt5-mb0">${commentaireEchappe}</p>
            </div>
        `;
    });
    
    document.getElementById('exempleRetroaction').innerHTML = html;
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
 * 4. Appelle calculerPourcentageComplete()
 * 
 * UTILISÉ PAR:
 * - afficherMatriceRetroaction()
 * 
 * MÉTRIQUES AFFICHÉES:
 * - #nbCriteres : Nombre de critères
 * - #nbNiveaux : Nombre de niveaux
 * - #nbCommentaires : Total de cases à remplir (critères × niveaux)
 * - #pctComplete : Pourcentage (via calculerPourcentageComplete)
 */
function mettreAJourMetriques() {
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

    calculerPourcentageComplete();
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
 * - chargerMatriceRetroaction()
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
function calculerPourcentageComplete() {
    if (!cartoucheActuel) return;

    // CRITIQUE: Utiliser la même logique que afficherMatriceRetroaction()
    // pour compter tous les niveaux disponibles (pas seulement ceux de la cartouche)
    const echelles = db.getSync('echellesTemplates', []);

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
        element.style.background = 'var(--risque-critique)20';
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
 * - chargerCartouchesRetroaction()
 * - basculerVerrouillageCartouche()
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
                    <button onclick="basculerVerrouillageCartouche('${cartouche.id}', '${grilleId}')"
                          class="btn btn-tres-compact"
                          class="u-mr-10"
                          title="${cartouche.verrouille ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller'}">
                        ${cartouche.verrouille ? 'Verrouillée' : 'Modifiable'}
                    </button>
                    <button class="btn btn-modifier"
                            onclick="chargerCartouchePourModif('${cartouche.id}', '${grilleId}')">
                        Modifier
                    </button>
                    <button class="btn btn-principal"
                            onclick="dupliquerCartouche('${cartouche.id}', '${grilleId}')">
                        Dupliquer
                    </button>
                    <button class="btn btn-supprimer"
                            onclick="supprimerCartoucheConfirm('${cartouche.id}', '${grilleId}')">
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
function afficherToutesLesGrillesEtCartouches() {
    const container = document.getElementById('vueGrillesCartouches');
    if (!container) return;

    const grilles = db.getSync('grillesTemplates', []);

    if (grilles.length === 0) {
        container.innerHTML = `
            <div class="cartouche-zone-bleu-pale">
                <p class="u-texte-bleu-leger">Aucune grille de critères disponible</p>
                <small>Créez d'abord une grille dans <strong>Réglages → Grilles de critères</strong></small>
            </div>
        `;
        return;
    }

    container.innerHTML = grilles.map(grille => {
        const cartouches = db.getSync(`cartouches_${grille.id}`, []);
        const nomGrilleEchappe = echapperHtml(grille.nom);

        return `
            <details class="grille-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: white; overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-moyen) 100%);
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
                                                <button onclick="basculerVerrouillageCartouche('${cartouche.id}', '${grille.id}')"
                                                      class="btn btn-tres-compact"
                                                      class="u-mr-10"
                                                      title="${cartouche.verrouille ? 'Verrouillée - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller'}">
                                                    ${cartouche.verrouille ? 'Verrouillée' : 'Modifiable'}
                                                </button>
                                                <button class="btn btn-modifier"
                                                        onclick="chargerCartouchePourModif('${cartouche.id}', '${grille.id}')">
                                                    Modifier
                                                </button>
                                                <button class="btn btn-principal"
                                                        onclick="dupliquerCartouche('${cartouche.id}', '${grille.id}')">
                                                    Dupliquer
                                                </button>
                                                <button class="btn btn-supprimer"
                                                        onclick="supprimerCartoucheConfirm('${cartouche.id}', '${grille.id}')">
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

                    <button class="btn btn-confirmer" onclick="ajouterCartoucheAGrille('${grille.id}')">
                        + Ajouter une cartouche à cette grille
                    </button>
                </div>
            </details>
        `;
    }).join('');
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
function basculerVerrouillageCartouche(cartoucheId, grilleId) {
    let cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const index = cartouches.findIndex(c => c.id === cartoucheId);

    if (index !== -1) {
        // Basculer directement l'état (pas de checkbox, juste un span cliquable)
        cartouches[index].verrouille = !cartouches[index].verrouille;
        db.setSync(`cartouches_${grilleId}`, cartouches);

        // Afficher une notification spécifique
        const statut = cartouches[index].verrouille ? 'verrouillée' : 'déverrouillée';
        console.log(`🔒 Cartouche "${cartouches[index].nom}" ${statut}`);

        // DÉSACTIVÉ Beta 80.5+ : ancienne interface remplacée par sidebar
        // afficherListeCartouches(cartouches, grilleId);
        // afficherToutesLesGrillesEtCartouches();

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            afficherBanqueCartouches();
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
function dupliquerCartouche(cartoucheId, grilleId) {
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartoucheOriginal = cartouches.find(c => c.id === cartoucheId);
    
    if (cartoucheOriginal) {
        const nouveauCartouche = {
            ...cartoucheOriginal,
            id: 'CART' + Date.now(),
            nom: cartoucheOriginal.nom + ' (copie)',
            verrouille: false,
            commentaires: { ...cartoucheOriginal.commentaires }
        };

        cartouches.push(nouveauCartouche);
        db.setSync(`cartouches_${grilleId}`, cartouches);

        // NOUVELLE INTERFACE (Beta 80.5+): Charger directement la copie
        chargerCartouchePourModif(nouveauCartouche.id, grilleId);

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            afficherBanqueCartouches();
        }

        console.log('✅ Cartouche dupliquée avec succès');
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
function chargerCartouchePourModif(cartoucheId, grilleId) {
    console.log('📝 Chargement cartouche:', cartoucheId, 'de la grille:', grilleId);

    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    console.log('Cartouche trouvée:', cartouche ? 'OUI' : 'NON');
    console.log('Verrouillée:', cartouche?.verrouille);

    if (cartouche) {
        // Mettre à jour les selects cachés pour compatibilité (ancienne interface)
        const selectGrille = document.getElementById('selectGrilleRetroaction');
        const selectCartouche = document.getElementById('selectCartouche');
        if (selectGrille) selectGrille.value = grilleId;
        if (selectCartouche) selectCartouche.value = cartoucheId;

        // Afficher les boutons Dupliquer, Exporter, Importer et Supprimer (mode édition)
        const btnDupliquer = document.getElementById('btnDupliquerCartouche');
        const btnExporter = document.getElementById('btnExporterCartouche');
        const btnImporter = document.getElementById('btnImporterCartouche');
        const btnImporterTxt = document.getElementById('btnImporterCartoucheTxt');
        const btnSupprimer = document.getElementById('btnSupprimerCartouche');
        if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
        if (btnExporter) btnExporter.style.display = 'inline-block';
        if (btnImporter) btnImporter.style.display = 'inline-block';
        if (btnImporterTxt) btnImporterTxt.style.display = 'inline-block';
        if (btnSupprimer) btnSupprimer.style.display = 'inline-block';

        // NOUVELLE INTERFACE (Beta 80.5+): Passer les paramètres directement
        chargerMatriceRetroaction(cartoucheId, grilleId);

        // NOUVELLE INTERFACE (Beta 80.2): Highlight dans la banque
        definirCartoucheActive(cartoucheId);

        // Afficher toutes les zones nécessaires
        const messageAccueil = document.getElementById('messageAccueilCartouche');
        console.log('messageAccueil trouvé:', !!messageAccueil);
        if (messageAccueil) {
            messageAccueil.style.display = 'none';
            console.log('messageAccueil masqué');
        }

        const infoCartouche = document.getElementById('infoCartouche');
        console.log('infoCartouche trouvé:', !!infoCartouche);
        if (infoCartouche) {
            infoCartouche.style.display = 'block';
            console.log('infoCartouche affiché');
        }

        const zoneImport = document.getElementById('zoneImportUnifiee');
        console.log('zoneImport trouvé:', !!zoneImport);
        if (zoneImport) {
            zoneImport.style.display = 'block';
            console.log('zoneImport affiché');
        }

        const matriceRetroaction = document.getElementById('matriceRetroaction');
        console.log('matriceRetroaction trouvé:', !!matriceRetroaction);
        if (matriceRetroaction) {
            matriceRetroaction.style.display = 'block';
            console.log('matriceRetroaction affiché');
        }

        // Générer la checklist pour l'import partiel
        genererChecklistCriteresImport();

        console.log('✅ Cartouche chargée avec succès');

        // Si verrouillée, afficher l'alerte de verrouillage
        const alerteVerrouillage = document.getElementById('alerteVerrouillage');
        const btnDeverrouiller = document.getElementById('btnDeverrouillerCartouche');

        if (cartouche.verrouille) {
            console.log('🔒 Cartouche en lecture seule (verrouillée)');
            if (alerteVerrouillage) alerteVerrouillage.style.display = 'block';

            // Attacher l'événement au bouton
            if (btnDeverrouiller) {
                btnDeverrouiller.onclick = function() {
                    basculerVerrouillageCartouche(cartoucheId, grilleId);
                    // Recharger la cartouche pour mettre à jour l'affichage
                    setTimeout(() => chargerCartouchePourModif(cartoucheId, grilleId), 100);
                };
            }
        } else {
            if (alerteVerrouillage) alerteVerrouillage.style.display = 'none';
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
function supprimerCartoucheConfirm(cartoucheId, grilleId) {
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    if (cartouche && cartouche.verrouille) {
        alert('Déverrouillez ce cartouche (🔓) avant de le supprimer');
        return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer la cartouche «${cartouche?.nom}» ?`)) {
        const nouveauxCartouches = cartouches.filter(c => c.id !== cartoucheId);
        db.setSync(`cartouches_${grilleId}`, nouveauxCartouches);

        // NOUVELLE INTERFACE (Beta 80.2): Rafraîchir la banque
        afficherBanqueCartouches();

        // Ancien système (compatibilité)
        chargerCartouchesRetroaction();

        // Rafraîchir la nouvelle vue
        // DÉSACTIVÉ Beta 80.5+ : ancienne interface remplacée par sidebar
        // afficherToutesLesGrillesEtCartouches();

        // Rafraîchir la banque sidebar (Beta 80.5+)
        if (typeof afficherBanqueCartouches === 'function') {
            afficherBanqueCartouches();
        }

        console.log('✅ Cartouche supprimée');
    }
}

/**
 * Supprime la cartouche actuellement en édition
 * Appelée depuis le bouton de suppression principal
 * 
 * UTILISÉ PAR:
 * - Bouton «Supprimer» dans la zone d'édition
 */
function supprimerCartouche() {
    if (!cartoucheActuel) return;
    
    const grilleId = cartoucheActuel.grilleId;
    supprimerCartoucheConfirm(cartoucheActuel.id, grilleId);
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 * 
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec animation
 * 3. Supprime après 3 secondes
 * 
 * PARAMÈTRES:
 * @param {string} message - Message à afficher
 * 
 * UTILISÉ PAR:
 * - Toutes les fonctions de sauvegarde/modification
 * 
 * STYLE:
 * - Position fixe en haut à droite
 * - Fond vert (succès)
 * - Animation slideIn
 * - Disparaît après 3s
 */
function afficherNotificationSucces(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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

    // Parcourir toutes les clés localStorage
    const allKeys = Object.keys(localStorage);
    for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        if (key && key.startsWith('cartouches_')) {
            const grilleId = key.replace('cartouches_', '');
            cartouches[grilleId] = db.getSync(key, []);
        }
    }

    if (Object.keys(cartouches).length === 0) {
        alert('Aucune cartouche à exporter.');
        return;
    }

    // Compter le nombre total de cartouches
    let nbCartouches = 0;
    Object.values(cartouches).forEach(arr => {
        nbCartouches += arr.length;
    });

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Cartouches de rétroaction',
        `${nbCartouches} cartouche(s) pour ${Object.keys(cartouches).length} grille(s)`
    );

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { cartouches: cartouches },
        'cartouches',
        'Cartouches de rétroaction',
        metaEnrichies
    );

    // Générer nom de fichier avec watermark CC
    const nomFichier = genererNomFichierCC(
        'cartouches',
        'Cartouches-retroaction',
        donnees.metadata.version
    );

    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    afficherNotificationSucces(`${nbCartouches} cartouche(s) exportée(s) avec succès`);
    console.log('✅ Cartouches exportées avec licence CC BY-NC-SA 4.0');
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
function importerCartouches(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._cartouchesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            let message = estCC ?
                '<div style="margin-bottom: 15px;">' + genererBadgeCC(donnees.metadata) + '</div>' :
                '';

            message += '<p><strong>Voulez-vous importer ces cartouches ?</strong></p>';

            // Créer modal avec badge CC
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                        ${message}
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn" onclick="this.closest('div[style*=fixed]').parentElement.remove(); delete window._cartouchesImportEnAttente;">Annuler</button>
                            <button class="btn btn-confirmer" onclick="window.confirmerImportCartouches(window._cartouchesImportEnAttente); this.closest('div[style*=fixed]').parentElement.remove(); delete window._cartouchesImportEnAttente;">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Avertir si pas de licence CC
            if (!estCC) {
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
window.confirmerImportCartouches = function(donnees) {
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
        const grillesExistantes = db.getSync('grillesTemplates', []);
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
                `Les cartouches importées sont associées à des grilles qui n'existent pas encore dans votre système.\n\n` +
                `Grilles manquantes :\n${grillesManquantes.map(id => `  • ${id}`).join('\n')}\n\n` +
                `Les cartouches seront importées mais ne seront visibles qu'après avoir importé les grilles manquantes.\n\n` +
                `Continuer quand même ?`;

            if (!confirm(message)) {
                console.log('Import annulé par l\'utilisateur (dépendances manquantes)');
                return;
            }

            console.log(`⚠️ Import avec ${nbGrillesManquantes} dépendance(s) manquante(s):`, grillesManquantes);
        }

        let compteur = 0;

        // Importer chaque grille de cartouches
        Object.keys(cartouchesData).forEach(grilleId => {
            const cartouchesImportees = cartouchesData[grilleId];
            const cartouchesExistantes = db.getSync(`cartouches_${grilleId}`, []);

            // Fusionner : remplacer si même ID, sinon ajouter
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

                const index = cartouchesExistantes.findIndex(c => c.id === importee.id);
                if (index !== -1) {
                    cartouchesExistantes[index] = importee;
                } else {
                    cartouchesExistantes.push(importee);
                }
                compteur++;
            });

            db.setSync(`cartouches_${grilleId}`, cartouchesExistantes);
        });

        // Rafraîchir l'interface si on est dans la section
        const selectGrille = document.getElementById('selectGrilleRetroaction');
        if (selectGrille && selectGrille.value) {
            chargerCartouchesRetroaction();
        }

        afficherNotificationSucces(`✅ Import réussi ! ${compteur} cartouche(s) importée(s).`);
        console.log('✅ Cartouches importées:', compteur);

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
function importerCartoucheDepuisTxt(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!cartoucheActuel) {
        alert('Veuillez d\'abord sélectionner une grille et créer/sélectionner une cartouche');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let texte = e.target.result.trim();

            if (!texte) {
                alert('Le fichier est vide');
                return;
            }

            // PRÉ-PROCESSEUR : Nettoyer et normaliser automatiquement le fichier
            // Cela rend l'import beaucoup plus tolérant aux erreurs de format
            console.log('🧹 Nettoyage automatique du fichier...');

            // 1. Normaliser les sauts de ligne (Windows/Mac/Linux)
            texte = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // 2. Corriger les astérisques mal placés : **CRITÈRE (N) :** → **CRITÈRE (N)** :
            texte = texte.replace(/\*\*([^*]+)\(([IDME0])\)\s*:\s*\*\*/g, '**$1($2)** :');

            // 3. Normaliser les espaces autour des deux-points
            texte = texte.replace(/\*\*([^*]+)\(([IDME0])\)\*\*\s*:\s*/g, '**$1($2)** : ');

            // 4. Supprimer les lignes vides multiples (max 2 sauts de ligne consécutifs)
            texte = texte.replace(/\n{3,}/g, '\n\n');

            // 5. Nettoyer les espaces en fin de ligne
            texte = texte.split('\n').map(l => l.trimEnd()).join('\n');

            console.log('✅ Nettoyage terminé');

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
                    console.log(`✓ Match exact: "${nomRecherche}" → "${critere.nom}"`);
                    return critere;
                }

                // Stratégie 2: Le nom recherché est contenu dans le critère
                // Ex: "FRANÇAIS" matcherait "Français écrit"
                critere = cartoucheActuel.criteres.find(c =>
                    normaliserNom(c.nom).includes(rechercheNorm)
                );
                if (critere) {
                    console.log(`✓ Match partiel (contenu): "${nomRecherche}" → "${critere.nom}"`);
                    return critere;
                }

                // Stratégie 3: Le critère est contenu dans le nom recherché
                // Ex: "STRUCTURE DE TEXTE" matcherait "Structure"
                critere = cartoucheActuel.criteres.find(c =>
                    rechercheNorm.includes(normaliserNom(c.nom))
                );
                if (critere) {
                    console.log(`✓ Match partiel (inversé): "${nomRecherche}" → "${critere.nom}"`);
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
                    console.log(`✓ Match flou: "${nomRecherche}" → "${meilleurMatch.nom}"`);
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
                            console.log(`✅ Importé: ${critere.nom} (${niveauActuel}) - ${commentaire.substring(0, 50)}...`);
                        } else {
                            const critereNormalise = normaliserNom(critereActuel);
                            console.warn(`⚠️ Critère non trouvé: "${critereActuel}" (normalisé: "${critereNormalise}")`);
                            console.log('Critères disponibles:', cartoucheActuel.criteres.map(c => `"${c.nom}" (normalisé: "${normaliserNom(c.nom)}")`));
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
                    console.log(`📋 Section critère détectée: "${critereActuel}"`);
                    return;
                }

                // Détecter un début de commentaire : accepte TOUTES les variantes possibles
                // Formats acceptés :
                // - **CRITÈRE (NIVEAU)** :        (format correct)
                // - **CRITÈRE (NIVEAU) :**        (format incorrect mais courant)
                // - **CRITÈRE (NIVEAU):**         (sans espace)
                // - **CRITÈRE (NIVEAU) : **       (astérisques mal placés)
                // Regex ultra-flexible : capture tout entre ** et (NIVEAU), puis ignore tout jusqu'au :
                const matchDebut = ligne.match(/^\*\*(.+?)\s*\(([IDME0])\)\s*[:\*\s]+(.*)$/);
                if (matchDebut) {
                    const nomCritere = matchDebut[1].trim().toUpperCase();
                    const niveau = matchDebut[2].trim();
                    const debutCommentaire = matchDebut[3].trim();

                    console.log(`🔍 Regex matché: "${nomCritere}" (${niveau}) - Critère actuel: "${critereActuel}"`);
                    console.log(`   Normalisé: "${normaliserNom(nomCritere)}" vs "${normaliserNom(critereActuel || '')}"`);

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
                        console.log(`📝 Début commentaire détecté: ${nomCritere} (${niveau})`);
                    } else {
                        // Si pas de match direct, changer le critère actuel
                        // (cas où on saute une section ou mauvais ordre)
                        console.log(`⚠️ Pas de match: "${nomCritere}" ≠ "${critereActuel}" - Changement de contexte`);
                        critereActuel = nomCritere;
                        niveauActuel = niveau;
                        commentaireEnCours = [];
                        if (debutCommentaire) {
                            commentaireEnCours.push(debutCommentaire);
                        }
                        console.log(`📝 Début commentaire détecté (nouveau critère): ${nomCritere} (${niveau})`);
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
                alert('Aucun commentaire n\'a pu être importé. Vérifiez que :\n- Le fichier est au format Markdown attendu\n- Les noms de critères correspondent à ceux de la grille sélectionnée');
                return;
            }

            // Rafraîchir l'affichage
            afficherMatriceRetroaction();
            calculerPourcentageComplete();

            afficherNotificationSucces(`${compteur} commentaire(s) importé(s) depuis le fichier !`);

        } catch (error) {
            console.error('Erreur d\'import depuis .txt:', error);
            alert('Erreur lors de l\'import du fichier. Vérifiez le format.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    event.target.value = '';
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
 * 2. Appelle initialiserNouveauCartouche() pour créer une nouvelle cartouche
 * 3. Affiche le formulaire d'édition
 */
function ajouterCartoucheAGrille(grilleId) {
    // Sélectionner la grille dans le select (si existant, pour compatibilité)
    const selectGrille = document.getElementById('selectGrilleRetroaction');
    if (selectGrille) {
        selectGrille.value = grilleId;
    }

    // Masquer les boutons Dupliquer, Exporter, Importer et Supprimer (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerCartouche');
    const btnExporter = document.getElementById('btnExporterCartouche');
    const btnImporter = document.getElementById('btnImporterCartouche');
    const btnImporterTxt = document.getElementById('btnImporterCartoucheTxt');
    const btnSupprimer = document.getElementById('btnSupprimerCartouche');
    if (btnDupliquer) btnDupliquer.style.display = 'none';
    if (btnExporter) btnExporter.style.display = 'none';
    if (btnImporter) btnImporter.style.display = 'none';
    if (btnImporterTxt) btnImporterTxt.style.display = 'none';
    if (btnSupprimer) btnSupprimer.style.display = 'none';

    // Initialiser une nouvelle cartouche pour cette grille
    initialiserNouveauCartouche(grilleId);

    // Afficher les sections nécessaires
    document.getElementById('aucuneEvalRetroaction').style.display = 'none';
    document.getElementById('infoCartouche').style.display = 'block';
    document.getElementById('matriceRetroaction').style.display = 'block';

    // NOUVELLE INTERFACE (Beta 80.2): Masquer accueil, afficher zones
    const messageAccueil = document.getElementById('messageAccueilCartouche');
    if (messageAccueil) messageAccueil.style.display = 'none';

    const zoneImport = document.getElementById('zoneImportUnifiee');
    if (zoneImport) zoneImport.style.display = 'block';

    // Générer checklist pour import partiel
    genererChecklistCriteresImport();

    // NE PLUS faire de scroll - sidebar reste visible
}

/**
 * Duplique la cartouche actuellement en cours d'édition
 */
function dupliquerCartoucheActive() {
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) {
        alert('Aucune cartouche à dupliquer');
        return;
    }
    dupliquerCartouche(cartoucheActuel.id, cartoucheActuel.grilleId);
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
    const cartouches = db.getSync(`cartouches_${grilleId}`, []);
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
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(
        cartouche,
        'cartouche-retroaction',
        cartouche.nom || 'Cartouche',
        metaEnrichies
    );

    // Générer nom de fichier avec watermark CC
    // Beta 93: Nom de fichier basé sur cartouche.nom au lieu de critere-niveau
    const nomFichierBase = (cartouche.nom || 'Cartouche').replace(/\s+/g, '-');
    const nomFichier = genererNomFichierCC(
        'cartouche',
        nomFichierBase,
        exportAvecCC.metadata.version
    );

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    afficherNotificationSucces('Cartouche exportée avec succès');
    console.log('✅ Cartouche exportée avec licence CC BY-NC-SA 4.0');
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
    reader.onload = function(e) {
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
                `Voulez-vous continuer ?`
            );

            if (!confirmation) {
                console.log('Import annulé par l\'utilisateur');
                event.target.value = '';
                return;
            }

            // Récupérer les cartouches
            const cartouches = db.getSync(`cartouches_${grilleId}`, []);
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
            db.setSync(`cartouches_${grilleId}`, cartouches);

            // Recharger la cartouche dans le formulaire
            chargerCartouchePourModif(cartoucheId, grilleId);

            console.log('✅ Cartouche importée et remplacée avec succès');
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Cartouche importée et remplacée avec succès');
            } else {
                alert('Cartouche importée et remplacée avec succès !');
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assurez-vous qu\'il s\'agit d\'un fichier valide.');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    reader.readAsText(file);
}

/**
 * Supprime la cartouche actuellement en cours d'édition
 */
function supprimerCartoucheActive() {
    if (!cartoucheActuel || !cartoucheActuel.id || !cartoucheActuel.grilleId) {
        alert('Aucune cartouche à supprimer');
        return;
    }
    supprimerCartoucheConfirm(cartoucheActuel.id, cartoucheActuel.grilleId);
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

    if (infoCartouche) infoCartouche.style.display = 'none';
    if (zoneImport) zoneImport.style.display = 'none';
    if (matriceRetroaction) matriceRetroaction.style.display = 'none';
    if (messageAccueil) messageAccueil.style.display = 'block';

    // Réinitialiser les champs
    document.getElementById('nomCartouche').value = '';
    document.getElementById('contexteCartouche').value = '';

    console.log('Édition annulée - Retour à l\'accueil');
}

/**
 * Sauvegarde complète de la cartouche en cours d'édition
 */
function sauvegarderCartoucheComplete() {
    // Sauvegarder avec la fonction existante
    sauvegarderCartouche();

    // Message de confirmation (déjà géré par sauvegarderCartouche)
    console.log('Cartouche sauvegardée avec succès');
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
// window.genererApercuRetroaction = genererApercuRetroaction; // FIXME: fonction n'existe pas
window.importerCommentaires = importerCommentaires;
window.initialiserModuleCartouches = initialiserModuleCartouches;

// Nouvelles fonctions Beta 80.2 (interface unifiée)
window.afficherBanqueCartouches = afficherBanqueCartouches;
// window.filtrerCartouchesBanque = filtrerCartouchesBanque; // Fonction commentée (Beta 92)
window.creerNouvelleCartouche = creerNouvelleCartouche;
window.importerDepuisMarkdown = importerDepuisMarkdown;
window.importerPartiel = importerPartiel;
window.exporterCartouches = exporterCartouches;
window.importerCartouches = importerCartouches;
window.exporterCartoucheActive = exporterCartoucheActive;
window.importerCartoucheJSON = importerCartoucheJSON;
window.importerCartoucheDepuisTxt = importerCartoucheDepuisTxt;

// Nouvelles fonctions Beta 90 (boutons dans formulaire)
window.dupliquerCartoucheActive = dupliquerCartoucheActive;
window.exporterCartoucheActive = exporterCartoucheActive;
window.importerDansCartoucheActive = importerDansCartoucheActive;
window.supprimerCartoucheActive = supprimerCartoucheActive;
window.annulerFormCartouche = annulerFormCartouche;
window.sauvegarderCartoucheComplete = sauvegarderCartoucheComplete;

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
function chargerFiltreGrillesCartouche() {
    const grilles = db.getSync('grillesTemplates', []);
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
function afficherBanqueCartouches(grilleIdFiltre = '') {
    const grilles = db.getSync('grillesTemplates', []);
    let toutesLesCartouches = [];

    // Récupérer toutes les cartouches de toutes les grilles
    grilles.forEach(grille => {
        const cartouches = db.getSync(`cartouches_${grille.id}`, []);
        cartouches.forEach(cart => {
            toutesLesCartouches.push({
                ...cart,
                grilleId: grille.id,
                grilleNom: grille.nom
            });
        });
    });

    // Filtrer si nécessaire
    if (grilleIdFiltre) {
        toutesLesCartouches = toutesLesCartouches.filter(c => c.grilleId === grilleIdFiltre);
    }

    // Générer HTML de la liste
    const container = document.getElementById('listeCartouchesBanque');
    if (!container) return;

    if (toutesLesCartouches.length === 0) {
        container.innerHTML = '<p class="banque-vide">Aucune cartouche disponible</p>';
        return;
    }

    const html = toutesLesCartouches.map(cart => {
        const estActive = window.cartoucheActuel?.id === cart.id;
        const verrouIcone = cart.verrouille ? ' <span class="cartouche-texte-warning" title="Verrouillée">🔒</span>' : '';

        return `
            <div class="item-cartouche-banque ${estActive ? 'active' : ''}"
                 data-cartouche-id="${cart.id}"
                 data-grille-id="${cart.grilleId}"
                 onclick="chargerCartouchePourModif('${cart.id}', '${cart.grilleId}')">
                <div class="nom-cartouche">${echapperHtml(cart.nom)}${verrouIcone}</div>
                <div class="badge-grille">${echapperHtml(cart.grilleNom)}</div>
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

    afficherBanqueCartouches(grilleId);
}
*/

/**
 * Crée une nouvelle cartouche vide
 * Demande à l'utilisateur de choisir une grille
 */
function creerNouvelleCartouche() {
    const grilles = db.getSync('grillesTemplates', []);

    if (grilles.length === 0) {
        alert('Vous devez d\'abord créer au moins une grille de critères dans la section « Critères d\'évaluation »');
        return;
    }

    // Si une seule grille, l'utiliser directement
    if (grilles.length === 1) {
        ajouterCartoucheAGrille(grilles[0].id);
        return;
    }

    // Sinon, demander de choisir
    const choix = prompt(
        'Choisissez une grille :\n\n' +
        grilles.map((g, i) => `${i + 1}. ${g.nom}`).join('\n') +
        '\n\nEntrez le numéro de la grille :'
    );

    if (!choix) return;

    const index = parseInt(choix) - 1;
    if (index >= 0 && index < grilles.length) {
        ajouterCartoucheAGrille(grilles[index].id);
    } else {
        alert('Choix invalide');
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
        afficherNotificationSucces(`${nbCommentaires} commentaires importés avec succès !`);

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
function parserMarkdownCartouche(markdown) {
    const commentaires = {};
    const lignes = markdown.split('\n');

    lignes.forEach(ligne => {
        // Chercher pattern : **CRITÈRE (NIVEAU)** : Commentaire
        const match = ligne.match(/\*\*(.+?)\s*\(([IDME])\)\*\*\s*:\s*(.+)/);
        if (match) {
            const critere = match[1].trim().toUpperCase();
            const niveau = match[2].trim();
            const commentaire = match[3].trim();

            const cle = `${critere}_${niveau}`;
            commentaires[cle] = commentaire;
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
        afficherNotificationSucces(`${nbImportes} commentaires importés (critères sélectionnés)`);
        textarea.value = '';
        calculerPourcentageComplet();
    } else {
        alert('Aucun commentaire n\'a pu être importé. Vérifiez les noms de critères.');
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
    reader.onload = function(e) {
        try {
            const cartouches = JSON.parse(e.target.result);

            if (!Array.isArray(cartouches) || cartouches.length === 0) {
                alert('Fichier JSON invalide');
                return;
            }

            const cartouche = cartouches[0]; // Prendre la première

            // Demander quelle grille utiliser
            const grilles = db.getSync('grillesTemplates', []);
            if (grilles.length === 0) {
                alert('Créez d\'abord une grille de critères');
                return;
            }

            const grilleId = grilles[0].id; // Utiliser la première grille par défaut

            // Générer nouvel ID
            cartouche.id = `cartouche_${Date.now()}`;
            cartouche.grilleId = grilleId;

            // Sauvegarder
            const cartouchesExistantes = db.getSync(`cartouches_${grilleId}`, []);
            cartouchesExistantes.push(cartouche);
            db.setSync(`cartouches_${grilleId}`, cartouchesExistantes);

            // Rafraîchir l'affichage
            afficherBanqueCartouches();
            chargerCartouchePourModif(cartouche.id, grilleId);

            afficherNotificationSucces('Cartouche importée avec succès !');

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
