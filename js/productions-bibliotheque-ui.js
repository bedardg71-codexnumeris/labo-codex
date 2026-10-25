/* ===============================
   GESTIONNAIRE DE BIBLIOTHÈQUE DE PRODUCTIONS (UI)
   ✅ EXTRACTION (16 mai 2026, refactor étape 3)

   Sous-module extrait de productions.js (lignes 1939-2607).
   Périmètre : modale Gestionnaire de bibliothèque + 14 actions associées.

   Distinction avec productions-bibliotheque.js (chargé AVANT) :
   - productions-bibliotheque.js : storage layer (CRUD Bibliothèque
     `bibliothequeProductions`, non namespacée)
   - productions-bibliotheque-ui.js (ce fichier) : interface utilisateur
     (modale Gestionnaire, sections Sélection/Disponibles, filtres, actions
     dupliquer/retirer/supprimer/importer trimestre)

   Dépendances (toutes via globales/window) :
   - Storage layer (productions-bibliotheque.js) :
     obtenirToutesLesProductionsBibliotheque, listerTrimestresAvecProductions,
     formaterNomTrimestre, obtenirProductionsTrimestre,
     importerDansBibliotheque, ajouterALaBibliotheque, retirerDeLaBibliotheque
   - Résidu productions.js : getCleProductions,
     getTypeLabel (tous exposés sur window)
   - Autres sous-modules : afficherListeProductions (productions-liste.js),
     afficherTableauProductions, mettreAJourPonderationTotale (productions.js)
   - Globaux : BibliothequeUI, db, echapperHtml, genererIdUnique, toggleDisplay
   =============================== */

(function() {
'use strict';

/**
 * #1156 (lot 3 des bibliothèques en deux colonnes) — LA LIGNE EN CLAIR D'UNE RANGÉE : ce que la
 * rangée disait (« Type: … • Pondération: … »), en mots : le libellé de lecture du type, sans le
 * préfixe 📁 (`getTypeLabel` le pose ; aucun emoji dans la fenêtre), puis la pondération à la
 * française (comme avant, artefacts compris), puis l'auteur quand ce n'est pas l'utilisateur actif
 * (même lecture que les grilles). Texte brut : la fenêtre l'échappe.
 */
function ligneProductionBibliotheque(prod, auteurActif) {
    const t = typeof typeProduction === 'function' ? typeProduction(prod.type) : null;
    const parts = [];
    const type = t ? (t.libelleLong || t.libelle) : (prod.type || '');
    if (type) parts.push(type);
    if (typeof prod.ponderation === 'number') {
        parts.push(formaterPourcentage(prod.ponderation));
    }
    const auteur = (prod.metadata_cc && prod.metadata_cc.auteur_original) || prod.auteur || '';
    if (auteur && auteur !== auteurActif) parts.push('par ' + auteur);
    return parts.join(' · ');
}

/**
 * #1156 — Les noms de ce qu'une production nomme (sa grille, son échelle, sa cartouche), cherchés
 * dans ce trimestre puis dans la bibliothèque. Un identifiant qu'aucun des deux ne connaît n'est
 * pas montré : l'aperçu ne dit que ce qu'il peut nommer.
 */
async function lecteurNomsProduction() {
    const grilles = [].concat(await db.get(cle('grillesTemplates')) || [],
        typeof obtenirToutesLesGrillesBibliotheque === 'function' ? (await obtenirToutesLesGrillesBibliotheque() || []) : []);
    const echelles = [].concat(await db.get(cle('echellesTemplates')) || [],
        typeof obtenirToutesLesEchellesBibliotheque === 'function' ? (await obtenirToutesLesEchellesBibliotheque() || []) : []);
    const cartouchesBiblio = typeof obtenirToutesLesCartouchesBibliotheque === 'function'
        ? (await obtenirToutesLesCartouchesBibliotheque() || []) : [];
    const cartouchesParGrille = {};
    const nomDans = (liste, id) => {
        const x = id ? liste.find(e => e && (e.id === id || e.idOriginal === id)) : null;
        return x ? (x.nom || '') : '';
    };
    return {
        grille: (id) => nomDans(grilles, id),
        echelle: (id) => nomDans(echelles, id),
        cartouche: async (grilleId, id) => {
            if (!id) return '';
            if (grilleId && !cartouchesParGrille[grilleId]) {
                cartouchesParGrille[grilleId] = await db.get(cle(`cartouches_${grilleId}`)) || [];
            }
            return nomDans((cartouchesParGrille[grilleId] || []).concat(cartouchesBiblio), id);
        }
    };
}

/**
 * #1156 — L'aperçu qu'ouvre le nom d'une rangée : l'objectif en entier, la provenance, puis ce que
 * la fiche nomme, sous les libellés de la fiche (« Grille de critères d'évaluation », « Échelle de
 * performance », « Cartouche de rétroaction »).
 */
async function apercuProductionBibliotheque(prod, noms) {
    const lignes = [];
    const grille = noms.grille(prod.grilleId);
    if (grille) lignes.push(['Grille de critères d\'évaluation', grille, '']);
    const echelle = noms.echelle(prod.echelleId);
    if (echelle) lignes.push(['Échelle de performance', echelle, '']);
    const cartouche = await noms.cartouche(prod.grilleId, prod.cartoucheId);
    if (cartouche) lignes.push(['Cartouche de rétroaction', cartouche, '']);
    return {
        paragraphes: [prod.objectif ? 'Objectif : ' + prod.objectif : '', BibliothequeUI.formaterInspireDe(prod)],
        lignes: lignes
    };
}

/** Le nom d'une rangée : le titre, puis l'activité (ou la description), comme avant. */
function nomProductionBibliotheque(prod) {
    const suite = prod.activiteApprentissage || prod.description;
    return BibliothequeUI.formaterTitre(prod.titre || 'Sans titre') + (suite ? ' - ' + suite : '');
}

/**
 * Les données de la bibliothèque des productions. #1156 : des rangées pour la fenêtre en deux
 * colonnes (`BibliothequeUI.creerFenetreDeuxColonnes`), plus aucun HTML. Mêmes gestes, mêmes
 * fonctions de données qu'avant ; seuls la place et le libellé changent.
 */
async function preparerDonneesBibliothequeProductions() {
    if (typeof obtenirToutesLesProductionsBibliotheque !== 'function') {
        return null;
    }

    const productionsUtilisateurBrut = await db.get(getCleProductions()) || [];
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const productionsUtilisateur = BibliothequeUI.filtrerParModeDemo(productionsUtilisateurBrut);
    const productionsDansSelection = productionsUtilisateur.filter(p => p.dansBibliotheque !== false);
    const productionsRetirees = productionsUtilisateur.filter(p => p.dansBibliotheque === false);
    const toutesProductionsBiblio = BibliothequeUI.filtrerParModeDemo(
        await obtenirToutesLesProductionsBibliotheque()
    );
    // #291 — champ 'titre' pour les productions : c'était la SEULE différence
    // entre les cinq détecteurs qu'`analyserDoublons` remplace.
    const doublonsDetectes = analyserDoublons(
        reunirSources(productionsUtilisateur, toutesProductionsBiblio), 'titre');
    // #291 — la puce d'identifiant ne s'affiche que sur une rangée que le bandeau nomme.
    const idsNommes = new Set();
    doublonsDetectes.forEach(groupe => groupe.exemplaires.forEach(ex => idsNommes.add(ex.id)));

    // Dossiers de classement (couche par-dessus, range par identité).
    const repsProductions = (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.obtenir === 'function')
        ? window.repertoiresBibliotheque.obtenir('productions')
        : [];
    const repParProduction = {};
    repsProductions.forEach(r => (r.itemIds || []).forEach(id => { repParProduction[id] = r.id; }));

    const auteurActif = BibliothequeUI.obtenirAuteurActif();
    const noms = await lecteurNomsProduction();

    // « Aussi dans ta bibliothèque » : la relation unique (`BibliothequeUI.lieeAExemplaire`). Pas
    // `dansBibliotheque`, qui veut dire « dans le menu de l'écran » sur une production du trimestre.
    const rangeesTrimestre = [];
    for (const prod of productionsDansSelection) {
        const rangee = {
            id: prod.id,
            nom: nomProductionBibliotheque(prod),
            ligne: ligneProductionBibliotheque(prod, auteurActif),
            afficherId: idsNommes.has(prod.id),
            apercu: await apercuProductionBibliotheque(prod, noms),
            dansBibliotheque: toutesProductionsBiblio.some(ex => BibliothequeUI.lieeAExemplaire(prod, ex)),
            menu: [
                { label: 'Dupliquer', action: 'dupliquerProductionBibliotheque', param: prod.id, title: 'Créer une copie' },
                { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'production', param2: prod.id, title: 'Générer un fichier .lcz signé à transmettre (#329)' },
                { separateur: true },
                { label: 'Retirer de ce trimestre', action: 'retirerProductionDeBibliotheque', param: prod.id, classe: 'btn-supprimer', title: 'La production quitte le menu de l\'écran ; ses données sont conservées' },
                { label: 'Supprimer définitivement', action: 'supprimerProductionDefinitivement', param: prod.id, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
            ]
        };
        if (rangee.dansBibliotheque) {
            rangee.etat = 'Aussi dans ta bibliothèque';
        } else {
            rangee.passage = { label: 'Garder dans ma bibliothèque', action: 'garderProductionDansBibliotheque', param: prod.id, sens: 'versBibliotheque' };
        }
        rangeesTrimestre.push(rangee);
    }

    // Identités déjà présentes dans la sélection.
    //
    // ⚠ L'exclusion se faisait par `id` NU. Or `ajouterProductionIndividuelle`
    // ne déplace pas l'item de la bibliothèque : il en fait une COPIE avec un
    // `id` tout neuf, et range l'ancien dans `idOriginal`. L'original ne
    // correspondait donc à aucun id de la sélection et RESTAIT listé ici.
    //
    // Vécu au terrain (Grégoire, 22 août 2026) : « quand je clique "ajouter à
    // ma sélection", il semble rien se passer ». L'ajout marchait — la section
    // « ta sélection » passait bien de (1) à (2) — mais la liste où il venait
    // de cliquer était identique, donc le geste paraissait sans effet. Et
    // recliquer empilait un exemplaire de plus, en silence (recoupe CO-24, qui
    // notait les boutons « re-cliquables » sans en trouver la cause).
    //
    // On compare donc sur l'IDENTITÉ : l'id propre ET l'id d'origine, des deux
    // côtés. #1156 : cette identité dit maintenant « Déjà dans ce trimestre » au lieu d'écarter la
    // rangée. Elle contient la relation unique (`lieeAExemplaire`) et la déborde d'un cas, la copie
    // sœur (même `idOriginal`), que la garde #476 refuserait de toute façon.
    const identitesEnSelection = new Set();
    productionsDansSelection.forEach(p => {
        if (p.id) identitesEnSelection.add(p.id);
        if (p.idOriginal) identitesEnSelection.add(p.idOriginal);
    });
    const dejaDansCeTrimestre = (prod) => identitesEnSelection.has(prod.id) ||
        !!(prod.idOriginal && identitesEnSelection.has(prod.idOriginal));

    // « Dans ta bibliothèque » : les exemplaires, puis les productions retirées de ce trimestre (la
    // section 2 d'avant les listait déjà : sans elles, une production retirée deviendrait
    // introuvable). Une retirée qui porte l'`id` d'un exemplaire n'est pas listée deux fois :
    // « ← Utiliser » sur l'exemplaire la remet (`ajouterProductionIndividuelle` la trouve par son id).
    const idsBiblio = new Set(toutesProductionsBiblio.map(p => p.id));
    const disponibles = toutesProductionsBiblio.map(prod => ({ prod, retiree: false }))
        .concat(productionsRetirees.filter(p => !idsBiblio.has(p.id)).map(prod => ({ prod, retiree: true })));

    const rangeesBibliotheque = [];
    for (const { prod, retiree } of disponibles) {
        const dejaPresent = dejaDansCeTrimestre(prod);
        const repCourant = repParProduction[prod.id] || null;
        const menu = [];
        repsProductions.forEach(r => {
            if (r.id !== repCourant) {
                menu.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classer', param: 'productions', param2: prod.id, param3: r.id, title: 'Ranger dans ce dossier' });
            }
        });
        if (repCourant) {
            menu.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirer', param: 'productions', param2: prod.id, title: 'Sortir du dossier (repasse en non classées)' });
        }
        // Une production retirée n'est pas dans la bibliothèque : le « Supprimer » d'avant n'y faisait
        // rien (`supprimerProductionDeBibliothequePartagee` ne la trouve pas), il n'est pas reporté.
        if (!retiree) {
            if (menu.length) menu.push({ separateur: true });
            menu.push({ label: 'Supprimer de ma bibliothèque', action: 'supprimerProductionDeBibliothequePartagee', param: prod.id, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque' });
        }

        const rangee = {
            id: prod.id,
            nom: nomProductionBibliotheque(prod),
            ligne: (retiree ? 'Retirée de ce trimestre · ' : '') + ligneProductionBibliotheque(prod, auteurActif),
            afficherId: idsNommes.has(prod.id),
            dossier: repCourant,
            apercu: await apercuProductionBibliotheque(prod, noms),
            dejaPresent: dejaPresent,
            menu: menu
        };
        if (dejaPresent) {
            rangee.etat = 'Déjà dans ce trimestre';
        } else {
            rangee.passage = { label: 'Utiliser dans ce trimestre', action: 'ajouterProductionIndividuelle', param: prod.id, sens: 'versTrimestre' };
        }
        rangeesBibliotheque.push(rangee);
    }

    return {
        rangeesTrimestre,
        rangeesBibliotheque,
        doublonsDetectes,
        trimestresDisponibles: listerTrimestresAvecProductions(),
        repsProductions,
        productionsDansSelection
    };
}

async function afficherBibliothequeProductions() {
    if (typeof obtenirToutesLesProductionsBibliotheque !== 'function') {
        notifications.erreur('Le module bibliothèque n\'est pas chargé.', 'Vérifiez que le fichier productions-bibliotheque.js est bien chargé.');
        return;
    }

    // #327 — la biblio « productions » auprès du moteur des dossiers (idempotent) : ses gestes
    // (créer, renommer, classer…) redessinent la fenêtre par ce rappel. #1156 : plus de « select »
    // de dossier par cartes (`renderLigneDossierSelect`), donc plus de `labelItem`.
    BibliothequeUI.repertoires.enregistrer('productions', {
        rafraichir: afficherBibliothequeProductions
    });

    const data = await preparerDonneesBibliothequeProductions();
    if (!data) return;

    // #293 — « Masquer ce qui est déjà dans ce trimestre » (même préférence qu'avant).
    const rangeesBibliotheque = BibliothequeUI.filtrerParDejaPresent(data.rangeesBibliotheque);
    const toutesMasquees = data.rangeesBibliotheque.length > 0 && rangeesBibliotheque.length === 0;
    const horsBibliotheque = data.rangeesTrimestre.filter(r => !r.dansBibliotheque).length;

    BibliothequeUI.creerFenetreDeuxColonnes({
        modalId: 'modalBibliothequeProductions',
        titre: 'Bibliothèque de productions',
        aide: 'bibliotheque-fonctionnement',
        menuFichiers: [
            { label: 'Importer des productions', action: 'ouvrirFilePickerImportProductions' },
            { label: 'Importer le partage d\'une ou d\'un collègue', action: 'partageImport.ouvrirSelecteurFichier' },
            { separateur: true },
            { label: 'Exporter les productions de ce trimestre', action: 'exporterProductions' },
            { note: 'Fichiers .json et .lcz' }
        ],
        champsFichier: [{ id: 'fichier-import-productions-modal', accept: '.json', onChange: 'importerProductions' }],
        avantColonnes: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes, {
            itemsSelection: data.productionsDansSelection,
            mots: { selection: 'Dans ce trimestre', bibliotheque: 'Dans ta bibliothèque', retirer: 'Retirer de ce trimestre (données conservées)' },
            actions: {
                retirer: 'retirerProductionDeBibliotheque',
                supprimer: 'supprimerProductionDefinitivement',
                supprimerPartagee: 'supprimerProductionDeBibliothequePartagee'
            }
        }),
        trimestre: {
            titre: 'Dans ce trimestre',
            phrase: 'Les productions que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.',
            idListe: 'listeProductionsDansBibliotheque',
            rangees: data.rangeesTrimestre,
            vide: 'Aucune production dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la avec « + Nouvelle production ».',
            boutonEntete: horsBibliotheque >= 2
                ? { label: 'Tout garder dans ma bibliothèque', action: 'ajouterMesProductionsALaBibliotheque' }
                : null
        },
        bibliotheque: {
            titre: 'Dans ta bibliothèque',
            // Sans « C'est d'ici que tu peux les partager. » : même raison qu'aux lots 1 et 2 (le
            // partage est sur la rangée du trimestre ; l'export depuis la bibliothèque est inscrit au plan).
            phrase: 'Les productions que tu gardes pour tous tes trimestres.',
            idListe: 'listeProductionsDisponibles',
            compte: data.rangeesBibliotheque.length,
            rangees: rangeesBibliotheque,
            vide: toutesMasquees
                ? 'Toutes les productions de ta bibliothèque sont déjà dans ce trimestre.'
                : 'Ta bibliothèque est vide. Garde-y une production de ce trimestre pour la retrouver plus tard.',
            videFiltre: 'Aucune production dans ce dossier.',
            dossiers: {
                biblio: 'productions',
                reps: data.repsProductions.map(r => ({ id: r.id, nom: r.nom })),
                refreshFn: 'afficherBibliothequeProductions',
                masquerLibelle: 'Masquer ce qui est déjà dans ce trimestre',
                labelPluriel: 'productions'
            },
            // #1156 — au pied de « Dans ta bibliothèque », comme pour les échelles : l'import de
            // productions d'un autre trimestre écrit dans la bibliothèque (`importerDansBibliotheque`,
            // `ajouterALaBibliotheque`), pas dans ce trimestre. Ses mots ne changent pas ; le filtre de
            // cours (`selectCoursImportProductions`) suit le trimestre choisi, comme avant.
            importAutreTrimestre: {
                titre: 'Importer depuis un autre trimestre',
                selectId: 'selectTrimestreImport',
                selectOnChange: 'mettreAJourFiltreCoursTrimestreProductions',
                selectSecond: { id: 'selectCoursImportProductions', label: 'Tous les cours', ariaLabel: 'Cours d\'où importer' },
                apercuId: 'previewProductionsTrimestre',
                options: data.trimestresDisponibles.map(t => ({ value: t.cle, label: `${t.nom} (${t.nombre} production${t.nombre > 1 ? 's' : ''})` })),
                actionVoir: 'afficherProductionsTrimestreModal',
                libelleVoir: 'Voir les productions',
                actionTout: 'importerToutTrimestreModal',
                tooltipTout: 'import-trimestre-tout-productions',
                aide: 'import-autre-trimestre'
            },
            partages: window.partageSection ? partageSection.rangeesDeuxColonnes('production') : null
        }
    });
}

/**
 * Ajoute une production individuelle au cours actuel (depuis la bibliothèque ou productions retirées)
 */
async function ajouterProductionIndividuelle(id) {
    try {
        // #340 — Capturer la clé namespacée UNE fois : le `await` ci-dessous
        // (obtenirToutesLesProductionsBibliotheque) ouvre une fenêtre pendant
        // laquelle le trimestre actif pourrait basculer. Sans capture, le
        // `db.set(getCleProductions(), ...)` final se résoudrait sous le NOUVEAU
        // namespace et écrirait le tableau lu sous l'ANCIEN → contamination.
        const cleProductions = getCleProductions();

        // ⚠ La garde d'identité de #476 doit voir la collection telle qu'elle est
        // AU MOMENT DE L'ÉCRITURE : lue hors file, elle laisserait passer un
        // exemplaire ajouté entre-temps. Tout le geste entre donc dans la file,
        // et les deux messages sortent APRÈS — la file ne porte que l'écriture.
        let prod = null;
        let titreEnConflit = null;
        let sourceIntrouvable = false;

        const ecritLotF = await db.modifier(cleProductions, async (lues) => {
        let productions = lues || [];
        prod = productions.find(p => p.id === id);

        // Si pas trouvée dans le cours actuel, chercher dans la Bibliothèque
        if (!prod) {
            const bibliotheque = await obtenirToutesLesProductionsBibliotheque();
            const prodBiblio = bibliotheque.find(p => p.id === id);

            if (!prodBiblio) {
                sourceIntrouvable = true;
                return undefined;
            }

            // Copier la production de la bibliothèque vers le cours actuel
            // Générer un nouvel ID pour éviter les conflits
            const nouvelId = genererIdUnique('PROD_');
            prod = {
                ...prodBiblio,
                id: nouvelId,
                idOriginal: prodBiblio.id, // Garder trace de l'original
                dansBibliotheque: true,
                dateImport: new Date().toISOString(),
                // #452 — une date d'échéance appartient au CALENDRIER d'un
                // trimestre : la copie reprise ne peut pas hériter de celle du
                // trimestre précédent. VIDER, pas deviner — reporter une date
                // sur le nouveau calendrier serait fabriquer une fausse donnée.
                dateEcheance: null
            };
            // #452 — second porteur de dates, le plus dangereux : ses
            // groupeCoursId désignent des groupes du trimestre PRÉCÉDENT
            // (inexistants ici), et le formulaire ne relisant que les groupes
            // affichés, ces entrées périmées survivraient en silence à chaque
            // enregistrement.
            delete prod.echeancesParGroupe;

            // #476 — garde d'identité au point d'écriture. La recherche
            // ci-dessus ne teste que `p.id === id` : un exemplaire déjà
            // présent sous un id neuf (copie, ou paquet collègue avec
            // `inspireDe`) passait au travers et s'empilait.
            const gardeProd = ajouterAvecGardeIdentite(productions, prod);
            if (!gardeProd.ajoute) {
                // Le nom affiché est TIRÉ du conflit rendu par la garde, en une
                // seule liaison : #476 vérifie ce chaînage, et un intermédiaire
                // le rompt sans rien casser à l'écran.
                titreEnConflit = (gardeProd.conflit || {}).titre || 'Cette production';
                return undefined;
            }
            productions = gardeProd.liste;

        } else {
            // Production déjà dans le cours, juste la marquer comme visible
            prod.dansBibliotheque = true;
        }

        return productions;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cleProductions);   // lot F : geste hors témoin (ajouterProductionIndividuelle)

        // Les messages vivent HORS du mutateur : la file ne porte que l'écriture.
        if (titreEnConflit) {
            notifications.info(
                `« ${titreEnConflit} » est déjà dans ce trimestre.`,
                'Pour en avoir un second exemplaire, utilise « Dupliquer ».');
            return;
        }
        if (sourceIntrouvable) {
            notifications.erreur('Production introuvable dans le cours actuel ni dans la bibliothèque.');
            return;
        }
        if (!prod) return;

        // ⚠ NE PAS ANNONCER UN SUCCÈS SANS L'AVOIR VÉRIFIÉ.
        //
        // `db.set` peut REFUSER l'écriture sans que l'appelant l'apprenne : la
        // garde #340 (js/productions-namespace-garde.js) bloque un tableau de
        // productions jugé étranger au trimestre visé, journalise
        // « [DB][GARDE #340] Écriture BLOQUÉE » — et `set` fait alors un simple
        // `return;`. La valeur de retour ne distingue donc pas le refus du
        // succès. Jusqu'ici on affichait « ajoutée à ton cours ! » dans les deux
        // cas : l'utilisateur voyait un succès, et rien n'arrivait.
        //
        // On relit donc la collection et on cherche la production. C'est la
        // seule preuve qui vaille.
        const verification = await db.get(cleProductions) || [];
        const bienEcrite = verification.some(p => p.id === prod.id);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherBibliothequeProductions();

        if (!bienEcrite) {
            console.error('[productions] Écriture non confirmée sur', cleProductions,
                '— production', prod.id, 'absente après db.set.');
            notifications.erreur(
                `"${prod.titre}" n'a PAS pu être ajoutée.`,
                'L\'enregistrement a été refusé. Ouvre la console : une ligne « [DB][GARDE #340] Écriture BLOQUÉE » en donne la raison.'
            );
            return;
        }

        notifications.succes(`"${prod.titre}" ajoutée à ton cours !`);
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        notifications.erreur('Erreur lors de l\'ajout de la production');
    }
}

/**
 * Ajoute toutes les productions du cours actuel à la Bibliothèque
 * Permet de rendre ses productions disponibles pour tous les trimestres
 */
async function ajouterMesProductionsALaBibliotheque() {
    try {
        // Récupérer les productions du cours actuel
        const productions = await db.get(getCleProductions()) || [];

        if (productions.length === 0) {
            notifications.info('Aucune production à ajouter.', 'Crée d\'abord des productions dans ton cours actuel.');
            return;
        }

        // Confirmer avec l'utilisateur
        const confirmation = await uiDialogues.confirmerAction({
            titre: 'Ajouter à la Bibliothèque',
            message: `Veux-tu ajouter tes ${productions.length} production(s) à la Bibliothèque ? Elles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`,
            texteConfirmer: 'Ajouter'
        });

        if (!confirmation) {
            return;
        }

        // Importer dans la Bibliothèque
        const resultat = await importerDansBibliotheque(productions);

        // Rafraîchir l'affichage
        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();

        // Message de confirmation
        if (resultat.ajoutees > 0) {
            notifications.succes(
                `${resultat.ajoutees} ${window.pluriel(resultat.ajoutees, 'production ajoutée', 'productions ajoutées')} à la bibliothèque.`,
                (resultat.existantes > 0 ? `${resultat.existantes} étai(en)t déjà présente(s).` : ''));
        } else {
            notifications.info(`Toutes tes productions étaient déjà dans la bibliothèque.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        notifications.erreur('Erreur lors de l\'ajout des productions à la bibliothèque.');
    }
}

/**
 * #1156 — « Garder dans ma bibliothèque → » : pour UNE production, ce que « Tout garder dans ma
 * bibliothèque » fait pour toutes — la même écriture (`importerDansBibliotheque`). Sans la
 * confirmation du geste groupé : il n'ajoute qu'un exemplaire, qui se supprime d'un geste.
 * @param {string} id - ID de la production du trimestre
 */
async function garderProductionDansBibliotheque(id) {
    try {
        const productions = await db.get(getCleProductions()) || [];
        const prod = productions.find(p => p.id === id);
        if (!prod) {
            notifications.erreur('Production introuvable.');
            return;
        }

        const resultat = await importerDansBibliotheque([prod]);

        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();

        if (resultat.ajoutees > 0) {
            notifications.succes('Production ajoutée à la bibliothèque !');
        } else {
            notifications.info('Cette production était déjà dans la bibliothèque.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        notifications.erreur('Erreur lors de l\'ajout de la production à la bibliothèque.');
    }
}

/**
 * 🆕 Beta 95.3 : Mettre à jour le dropdown filtre cours quand un trimestre est sélectionné
 */
function mettreAJourFiltreCoursTrimestreProductions() {
    const selectTrimestre = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');
    const preview = document.getElementById('previewProductionsTrimestre');

    if (!selectTrimestre || !selectCours) return;

    const cleSelectionnee = selectTrimestre.value;

    // Réinitialiser et masquer si aucun trimestre sélectionné
    if (!cleSelectionnee) {
        selectCours.innerHTML = '<option value="">Tous les cours</option>';
        selectCours.classList.add('u-hide');
        if (preview) preview.classList.add('u-hide');
        return;
    }

    // Récupérer les productions du trimestre
    const productions = obtenirProductionsTrimestre(cleSelectionnee);

    // Extraire les cours uniques
    const coursMap = new Map();
    productions.forEach(prod => {
        if (prod.coursId) {
            // Essayer de récupérer le nom du cours
            const nomCours = prod.sigleCours || prod.coursNom || prod.coursId;
            coursMap.set(prod.coursId, nomCours);
        }
    });

    // Peupler le dropdown cours
    let optionsHTML = '<option value="">Tous les cours</option>';
    coursMap.forEach((nom, id) => {
        optionsHTML += `<option value="${echapperHtml(id)}">${echapperHtml(nom)}</option>`;
    });
    selectCours.innerHTML = optionsHTML;

    // Afficher le dropdown seulement s'il y a des cours
    toggleDisplay(selectCours, coursMap.size > 0);

    // Masquer le preview
    if (preview) preview.classList.add('u-hide');
}

/**
 * Affiche un aperçu des productions d'un trimestre dans la modal
 * 🆕 Beta 95.3 : Avec support du filtre par cours
 */
function afficherProductionsTrimestreModal() {
    const select = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');
    const preview = document.getElementById('previewProductionsTrimestre');

    if (!select || !preview) return;

    const cleSelectionnee = select.value;
    if (!cleSelectionnee) {
        preview.classList.add('u-hide');
        return;
    }

    let productions = obtenirProductionsTrimestre(cleSelectionnee);

    // 🆕 Beta 95.3 : Filtrer par cours si sélectionné
    const coursFiltre = selectCours?.value || '';
    if (coursFiltre) {
        productions = productions.filter(p => p.coursId === coursFiltre);
    }

    if (productions.length === 0) {
        preview.innerHTML = '<p class="biblio2-phrase">Aucune production trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    // #1156 — l'aperçu vit dans la fenêtre en deux colonnes : des classes, aucun style en ligne.
    let html = '<ul class="biblio2-import-liste">';
    productions.forEach(prod => {
        const coursLabel = prod.sigleCours || prod.coursNom || '';
        const meta = [ligneProductionBibliotheque(prod, null), coursLabel].filter(Boolean).join(' · ');
        html += `
            <li class="biblio2-import-rangee">
                <div>
                    <strong>${echapperHtml(prod.titre || 'Sans titre')}</strong>${(prod.activiteApprentissage || prod.description) ? ` - ${echapperHtml(prod.activiteApprentissage || prod.description)}` : ''}
                    <p class="biblio2-rangee-meta">${echapperHtml(meta)}</p>
                </div>
                <button type="button" data-action="importerUneProductionTrimestre" data-param="${echapperAttribut(cleSelectionnee)}" data-param2="${echapperAttribut(prod.id)}" class="btn btn-secondaire">
                    Importer
                </button>
            </li>
        `;
    });
    html += '</ul>';

    preview.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * Importe toutes les productions d'un trimestre dans la bibliothèque
 * 🆕 Beta 95.3 : Avec support du filtre par cours
 */
async function importerToutTrimestreModal() {
    const select = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');

    if (!select || !select.value) {
        notifications.info('Sélectionne d\'abord un trimestre.');
        return;
    }

    const cleSelectionnee = select.value;
    const codeTrimestre = cleSelectionnee.replace('_productions', '');
    const nomTrimestre = formaterNomTrimestre(codeTrimestre);

    let productions = obtenirProductionsTrimestre(cleSelectionnee);

    // 🆕 Beta 95.3 : Filtrer par cours si sélectionné
    const coursFiltre = selectCours?.value || '';
    if (coursFiltre) {
        productions = productions.filter(p => p.coursId === coursFiltre);
    }

    if (productions.length === 0) {
        notifications.info('Aucune production à importer' + (coursFiltre ? ' pour ce cours.' : ' dans ce trimestre.'));
        return;
    }

    const coursLabel = coursFiltre ? ` du cours sélectionné` : '';
    const confirmation = await uiDialogues.confirmerAction({
        titre: 'Importer dans la Bibliothèque',
        message: `Veux-tu importer les ${productions.length} production(s)${coursLabel} de ${nomTrimestre} dans la Bibliothèque ?`,
        texteConfirmer: 'Importer'
    });

    if (!confirmation) return;

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportProductions();

    const resultat = await importerDansBibliotheque(productions);

    // Rafraîchir l'affichage
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
    await BibliothequeUI.restaurerImportTrimestre(
        etatSection, afficherProductionsTrimestreModal, mettreAJourFiltreCoursTrimestreProductions);

    notifications.succes('Import terminé.',
        `${resultat.ajoutees} ${window.pluriel(resultat.ajoutees, 'production ajoutée', 'productions ajoutées')}. ` +
        `${resultat.existantes} ${window.pluriel(resultat.existantes, 'déjà présente', 'déjà présentes')}.`);
}

/**
 * État de la section d'import, à reposer après reconstruction du modal.
 * Deux selects : le trimestre, puis le filtre de cours qui EN DÉPEND — il est
 * peuplé par un handler `onchange` que la restauration programmatique ne
 * déclenche pas, d'où `mettreAJourFiltreCoursTrimestreProductions` en rappel.
 */
function etatImportProductions() {
    return BibliothequeUI.capturerImportTrimestre({
        modalId: 'modalBibliothequeProductions',
        selects: ['selectTrimestreImport', 'selectCoursImportProductions'],
        apercu: 'previewProductionsTrimestre'
    });
}

/**
 * Importe une seule production d'un trimestre dans la bibliothèque
 */
async function importerUneProductionTrimestre(cleTrimestre, productionId) {
    const productions = obtenirProductionsTrimestre(cleTrimestre);
    const prod = productions.find(p => p.id === productionId);

    if (!prod) {
        notifications.erreur('Production introuvable.');
        return;
    }

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportProductions();

    const resultat = await ajouterALaBibliotheque(prod);

    if (resultat) {
        // Rafraîchir l'affichage
        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        await BibliothequeUI.restaurerImportTrimestre(
            etatSection, afficherProductionsTrimestreModal, mettreAJourFiltreCoursTrimestreProductions);
        notifications.succes(`"${prod.titre}" ajoutée à la bibliothèque !`);
    } else {
        notifications.info('Cette production est déjà dans la bibliothèque.');
    }
}

/**
 * Retire une production de la bibliothèque (soft delete)
 */
async function retirerProductionDeBibliotheque(id) {
    const okRetrait = await uiDialogues.confirmerAction({
        titre: 'Retirer de ce trimestre',
        message: 'Retirer cette production de ce trimestre ? Elle ne sera plus offerte dans le menu mais restera disponible dans le gestionnaire.',
        texteConfirmer: 'Retirer'
    });
    if (!okRetrait) {
        return;
    }

    try {
        // ⚠ La collection est relue DANS la file : celle d'avant la confirmation
        // ne vaut plus rien.
        let trouvee = false;
        const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
            const productions = lues || [];
            const production = productions.find(p => p.id === id);
            if (!production) return undefined;

            production.dansBibliotheque = false;
            trouvee = true;
            return productions;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (retirerProductionDeBibliotheque)

        if (!trouvee) {
            throw new Error('Production introuvable');
        }


        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        await afficherListeProductions();

    } catch (error) {
        console.error('Erreur lors du retrait:', error);
        notifications.erreur('Erreur', error.message);
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une production (hard delete)
 * @param {string} id - ID de la production à supprimer
 */
async function supprimerProductionDefinitivement(id) {
    // ⚠ Lecture hors file, pour NOMMER la production dans la question. La
    // confirmation ne doit pas tenir la file ouverte.
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) return;

    // Confirmation
    //
    // #1156 (25 oct. 2026) — L'EXEMPLAIRE DE LA BIBLIOTHÈQUE RESTE : la décision de Grégoire pour les
    // grilles (#1154), étendue par Cowork aux échelles, aux cartouches (lot 2), puis aux productions
    // (consigne du lot 3, § 1). Ce chemin retirait aussi l'exemplaire (`retirerDeLaBibliotheque`) ;
    // la fenêtre en deux colonnes présente deux exemplaires séparés, et « ← Utiliser dans ce
    // trimestre » ramène la production. La question le dit, quand la relation unique la lie à un
    // exemplaire. Ses deux chemins (⋮ de « Dans ce trimestre », bandeau des doublons) passent ici.
    // Stock : les productions déjà supprimées ont perdu le leur ; rien ne se répare.
    const biblio = typeof obtenirToutesLesProductionsBibliotheque === 'function'
        ? (await obtenirToutesLesProductionsBibliotheque() || []) : [];
    const phraseBibliotheque = biblio.some(ex => BibliothequeUI.lieeAExemplaire(production, ex))
        ? ' Son exemplaire de ta bibliothèque reste.' : '';
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('production'))) return;
    const okSuppr = await uiDialogues.confirmerAction({
        titre: 'Supprimer définitivement',
        message: `Supprimer définitivement la production «${production.titre}» ? Cette action est irréversible.${phraseBibliotheque}`,
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!okSuppr) {
        return;
    }

    // Suppression définitive du store local, DANS la file : la collection
    // filtrée est celle qui existe au moment de l'écriture.
    const ecritLotF = await db.modifier(getCleProductions(), (lues) => {
        return (lues || []).filter(p => p.id !== id);
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(getCleProductions());   // lot F : geste hors témoin (supprimerProductionDefinitivement)

    // Rafraîchir UI
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
    await afficherListeProductions();

}

/**
 * Supprimer une production de la Bibliothèque uniquement (Section 2)
 * @param {string} id - ID de la production à supprimer
 */
async function supprimerProductionDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesProductionsBibliotheque === 'function'
        ? await obtenirToutesLesProductionsBibliotheque()
        : [];
    const prod = biblio.find(p => p.id === id);
    if (!prod) return;

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('productionBibliotheque'))) return;
    const okSuppr = await uiDialogues.confirmerAction({
        titre: 'Supprimer de la Bibliothèque',
        message: `Supprimer définitivement «${prod.titre || 'Sans titre'}» de la Bibliothèque ? Cette action est irréversible.`,
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!okSuppr) return;

    await retirerDeLaBibliotheque(id);

    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une production dans la bibliothèque
 * @param {string} id - ID de la production à dupliquer
 */
async function dupliquerProductionBibliotheque(id) {
    // #476 volet 2 — séquence partagée (BibliothequeUI.dupliquerVersBibliotheque).
    await BibliothequeUI.dupliquerVersBibliotheque({
        id: id,
        prefixeId: 'PROD_',
        modifierListe: (mutateur) => db.modifier(getCleProductions(), mutateur, []),
        // ✅ D3 (arbitrage du 24 août) — `nommerCopie` remplace la concaténation
        // nue `${source.titre} (copie)`, qui empilait « X (copie) (copie) ». Les
        // productions nomment par `titre` : c'est ce champ qui est renommé.
        nommerLaCopie: (copie, source, liste) => { copie.titre = nommerCopie(source.titre, liste); },
        // ✅ D5 — provenance complète, `sourceId` compris.
        forgerProvenance: (source) => BibliothequeUI.forgerInspireDe(source),
        siIntrouvable: () => notifications.erreur('Production introuvable'),
        rafraichirUI: async () => {
            fermerModalBibliothequeProductions();
            await afficherBibliothequeProductions();
            await afficherListeProductions();
        }
    });
}

/**
 * Ajoute les productions sélectionnées à la bibliothèque
 *
 * ⚠ Sans appelant (mesuré le 25 oct. 2026, #1156) : aucune fenêtre ne pose de case à cocher dans
 * `#listeProductionsDisponibles`, ni avant ni après les deux colonnes. Laissée telle quelle.
 */
async function ajouterProductionsABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeProductionsDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        notifications.info('Sélectionne au moins une production à ajouter.');
        return;
    }

    try {
        let ajoutees = 0;

        await db.modifier(getCleProductions(), (lues) => {
        const productions = lues || [];
        ajoutees = 0;

        checkboxes.forEach(checkbox => {
            const id = checkbox.value;
            const productionData = JSON.parse(checkbox.dataset.production);

            // Vérifier si la production existe déjà
            const prodExistante = productions.find(p => p.id === id);
            if (prodExistante) {
                // Réactiver si elle était retirée
                if (prodExistante.dansBibliotheque === false) {
                    prodExistante.dansBibliotheque = true;
                    ajoutees++;
                } else {
                }
            } else {
                // Ajouter nouvelle production de la bibliothèque
                productions.push({
                    ...productionData,
                    dansBibliotheque: true
                });
                ajoutees++;
            }
        });

        return productions;
        }, []);

        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherTableauProductions();
        await mettreAJourPonderationTotale();

        if (ajoutees > 0) {
            notifications.succes(`${ajoutees} ${window.pluriel(ajoutees, 'production ajoutée', 'productions ajoutées')}.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        notifications.erreur('Erreur', error.message);
    }
}

// #327 — filtrerProductionsParDiscipline retiré (code mort) : le filtre par
// discipline n'existe plus (incohérent avec l'organisation par dossiers).
// Remplacé par la zone « Mes dossiers » + le groupage par dossier.

/**
 * Ferme le modal bibliothèque
 */
function fermerModalBibliothequeProductions() {
    BibliothequeUI.fermerModal('modalBibliothequeProductions');
}

/* ===============================
   EXPORTS WINDOW
   =============================== */

window.afficherBibliothequeProductions = afficherBibliothequeProductions;
window.retirerProductionDeBibliotheque = retirerProductionDeBibliotheque;
window.ajouterProductionsABibliotheque = ajouterProductionsABibliotheque;
window.fermerModalBibliothequeProductions = fermerModalBibliothequeProductions;
window.ajouterProductionIndividuelle = ajouterProductionIndividuelle;
window.ajouterMesProductionsALaBibliotheque = ajouterMesProductionsALaBibliotheque;
window.garderProductionDansBibliotheque = garderProductionDansBibliotheque;
window.afficherProductionsTrimestreModal = afficherProductionsTrimestreModal;
window.importerToutTrimestreModal = importerToutTrimestreModal;
window.importerUneProductionTrimestre = importerUneProductionTrimestre;
window.mettreAJourFiltreCoursTrimestreProductions = mettreAJourFiltreCoursTrimestreProductions;
window.supprimerProductionDefinitivement = supprimerProductionDefinitivement;
window.supprimerProductionDeBibliothequePartagee = supprimerProductionDeBibliothequePartagee;
window.dupliquerProductionBibliotheque = dupliquerProductionBibliotheque;

})();
