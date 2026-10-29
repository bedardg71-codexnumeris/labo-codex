/* ===============================
   MODULE : PRATIQUES DE NOTATION — Gestion UI (Section Construction)
   (c) 2 janvier 2026 - Beta 95
   Renommé pratiques-materiel.js → pratiques-gestion.js le 11 mai 2026 (#266)

   Interface sidebar + bibliothèque + édition pour les pratiques de notation.
   Suit le même pattern que echelles.js (sidebar gauche, zone principale, modal bibliothèque).

   Distinction avec les autres modules « pratique » :
   - pratiques.js — configuration globale du cours (quelle pratique appliquer)
   - pratiques-bibliotheque.js — gabarits et fonctions de bibliothèque

   Dépendances:
   - pratiques-bibliotheque.js (gabarits et fonctions de bibliothèque)
   - db.js (stockage IndexedDB/localStorage)
   =============================== */

(function() {
'use strict';

// #464/CO-09 (21 août 2026) : la constante CLE_PRATIQUES_CONFIGURATIONS est
// RETIRÉE avec le repli de lecture vers la clé nue qu'elle servait (31 sites
// dans ce fichier). La clé est NAMESPACÉE depuis le 24 mai 2026 — toujours
// lire/écrire via cle('pratiquesConfigurables'). L'ancien commentaire « NON
// namespacée = partagée entre trimestres » était faux depuis mai.

/**
 * ID de la pratique actuellement en édition
 */
let pratiqueEnEditionMateriel = null;

/**
 * 🆕 FIX #4 (20 jan 2026) : Flag pour bloquer les sauvegardes pendant le remplissage
 * Évite que les fonctions appelées pendant remplirFormulairePratique() écrasent les valeurs
 */
let enChargementFormulaire = false;

// #1156 (25 oct. 2026) — `genererBadgeSourcePratique` (marques « Retirée » et « Gabarit ») et
// `genererIdCourtPratique` retirés, faute de lecteur : la fenêtre en deux colonnes ne porte plus de
// badge, et la puce d'identifiant vient du composant (`BibliothequeUI.renderPuceId`).

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

/**
 * Point d'entrée appelé par navigation.js quand on navigue vers conception-pratiques-notation
 * Note: Renommé en "Materiel" pour éviter conflit avec pratiques.js
 */
async function initialiserModulePratiquesMateriel() {

    // Afficher la sidebar avec la liste des pratiques
    await afficherListePratiquesMateriel();

    // Cacher le formulaire d'édition et montrer l'accueil
    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (conteneurEdition) conteneurEdition.classList.add('u-hide');
    if (accueil) accueil.classList.remove('u-hide');
    MenuSelection.marquer('menuPratiques', null);

}

/* ===============================
   GESTION DE LA SIDEBAR
   =============================== */

/**
 * Affiche la sélection des pratiques dans son menu (#1147 : la barre latérale est partie)
 * Note: Le bouton "Consulter la bibliothèque" est maintenant dans le HTML statique
 * Renommé avec suffixe "Materiel" pour éviter conflit avec pratiques.js
 */
async function afficherListePratiquesMateriel() {

    const emplacement = document.getElementById('selectionPratiques');
    if (!emplacement) {
        console.warn('[pratiques-gestion] ⚠️ Élément selectionPratiques introuvable');
        return;
    }

    // 🆕 FIX v3 (20 jan 2026) : Utiliser localStorage (cache synchrone) comme source principale
    // localStorage est toujours à jour grâce à la double écriture (setSync + set)
    const configurations = db.getSync(cle('pratiquesConfigurables'), null) || [];

    // Filtrer les pratiques dans la bibliothèque (affichées dans la sélection)
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    // #326 axe D : masque aussi les variantes d'essai (réservées au Labo › Exploration).
    const pratiquesDansBibliotheque = BibliothequeUI.filtrerParMaquette(BibliothequeUI.filtrerParModeDemo(
        configurations.filter(p => p.dansBibliotheque !== false)
    ));

    // #762 (6 sept. 2026) — LA PRATIQUE ASSIGNÉE AU GROUPE-COURS ACTIF SE VOIT ICI : un enseignant
    // pouvait croire sa pratique « activée » sans qu'aucune le soit (le repli « sommative » ne
    // correspond à aucune pratique de la liste). La SSOT : `obtenirIdPratiqueActive`.
    // #1147 (24 oct. 2026) : dans le menu, le nom seul ; « (active) » après le nom, parce que c'est un
    // ÉTAT et non une caractéristique (le badge « Active » de la barre latérale). Les badges de type et
    // de caractéristiques sont partis avec la barre ; la bibliothèque les montre.
    const pratiqueActiveId = (typeof obtenirIdPratiqueActive === 'function')
        ? obtenirIdPratiqueActive()
        : null;
    const edition = document.getElementById('conteneurEditionPratique');
    MenuSelection.rendre(emplacement, {
        idMenu: 'menuPratiques',
        elements: pratiquesDansBibliotheque.map(p => ({
            id: p.id, nom: p.nom, suffixe: p.id === pratiqueActiveId ? '(active)' : ''
        })),
        idOuvert: (pratiqueEnEditionMateriel && edition && !edition.classList.contains('u-hide')) ? pratiqueEnEditionMateriel : null,
        libelleAucun: 'Aucune pratique ouverte',
        libelleMenu: 'Pratique ouverte',
        phraseVide: 'Crée une nouvelle pratique ou puise dans la bibliothèque',
        ouvrir: chargerPratiquePourModif
    });
    // #1149, lot 3b : le menu se redessine après l'assistant et après « Appliquer au cours actif » ;
    // la chaîne de la pratique ouverte suit (sa méthode, « active »).
    if (edition && !edition.classList.contains('u-hide')) rendreChainePratique();
}

/**
 * Descriptions taxonomiques complètes selon le type (clés canoniques). #1156 : la table est éclatée
 * en ses trois parties, pour que la fenêtre de bibliothèque dise la famille en français
 * (`familleDeLaPratique`) avec les mêmes mots ; `obtenirDescriptionCourtePratique` la recompose
 * telle qu'avant.
 */
const FAMILLES_TAXONOMIQUES = {
    'sommative': { nom: 'Sommative', anglais: 'Traditional Grading', resume: 'Moyenne pondérée des évaluations' },
    'standards': { nom: 'PAN-Standards', anglais: 'Standards-Based Grading', resume: 'Maîtrise de standards/objectifs' },
    'specifications': { nom: 'PAN-Spécifications', anglais: 'Specifications Grading', resume: 'Évaluation dichotomique par forfaits' },
    'denotation': { nom: 'PAN-Dénotation', resume: 'Note finale certificative posée (non calculée) selon l\'atteinte de cibles d\'apprentissage' }
};

/**
 * Retourne la description courte (taxonomique) d'une pratique pour la sidebar
 * @param {Object} pratique - La configuration de pratique
 * @returns {string} Description courte
 */
function obtenirDescriptionCourtePratique(pratique) {
    if (!pratique) return '';

    // Retourner la description personnalisée si disponible, sinon la taxonomique
    if (pratique.description && pratique.description.trim().length > 0) {
        // Tronquer si trop long
        const desc = pratique.description.trim();
        return desc.length > 100 ? desc.substring(0, 97) + '...' : desc;
    }

    // Normalisation à la lecture (A-2 4c) : la table est indexée en canonique,
    // mais pratique.type peut encore être legacy tant que le select n'est pas migré.
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(pratique.type) : pratique.type);
    const f = FAMILLES_TAXONOMIQUES[typeCanon];
    return f ? `${f.nom}${f.anglais ? ` (${f.anglais})` : ''} - ${f.resume}` : (pratique.type || '');
}

/**
 * Génère un badge coloré selon le type de pratique (SOM, STD, SPE, DEN)
 * Utilise les variables CSS définies dans styles.css (03c-barres-gradient)
 */
function genererBadgeTypePratique(pratique) {
    if (!pratique) return '';

    // 🆕 FIX (20 jan 2026) : Chercher le type dans plusieurs sources possibles
    let type = null;

    // Source 1 : pratique.pratiques[0] (format attendu)
    if (pratique.pratiques && Array.isArray(pratique.pratiques) && pratique.pratiques[0]) {
        type = pratique.pratiques[0];
    }
    // Source 2 : pratique.type (format alternatif)
    else if (pratique.type) {
        // Session B : code des 4 familles routé vers le registre (source unique).
        // pratique.type peut être legacy ; le registre normalise. Inconnu → repli
        // 3 lettres majuscules (comportement historique préservé).
        const rep = (typeof obtenirRepresentationPratiqueStricte === 'function')
            ? obtenirRepresentationPratiqueStricte(pratique.type) : null;
        type = rep ? rep.code : pratique.type.toUpperCase().substring(0, 3);
    }

    if (!type) return '';

    const typesValides = ['SOM', 'STD', 'SPE', 'DEN', 'PAN'];
    if (!typesValides.includes(type)) return '';

    // #343-T3 — infobulle au survol du tag de famille (les explications existaient
    // déjà dans le wizard ; on les rend découvrables ici aussi). Textes STATIQUES
    // (pas de donnée utilisateur) repris des cartes « voie rapide » du wizard, donc
    // pas d'échappement requis. Apostrophes seules → sûres dans un attribut "double".
    const TOOLTIPS_FAMILLE = {
        SOM: 'Sommative — note finale par moyenne pondérée des évaluations.',
        STD: 'PAN – Standards — niveaux de maîtrise (ex. I-D-M-E) convertis en note.',
        SPE: 'PAN – Spécifications — travaux acceptables ou non ; note selon les forfaits réussis.',
        DEN: 'PAN – Dénotation — note finale certificative posée (non calculée) selon l\'atteinte de cibles d\'apprentissage explicites ; abandonne la fonction de tri.',
        PAN: 'Pratique alternative de notation (STD, SPE ou DEN).'
    };
    const infobulle = TOOLTIPS_FAMILLE[type] || '';

    // Utilise la classe CSS .badge-type-pratique avec modificateur
    return `<span class="badge-type-pratique badge-type-${type.toLowerCase()}" title="${infobulle}">${type}</span>`;
}

/* ===============================
   MODAL BIBLIOTHÈQUE
   =============================== */

// #327 — Les répertoires de classement (zone « Mes dossiers », ligne-select,
// handlers créer/renommer/supprimer/classer/retirer) sont désormais GÉNÉRIQUES
// dans BibliothequeUI.repertoires (js/bibliotheque-ui.js), paramétrés par `biblio`.
// La bibliothèque pratiques s'y enregistre dans afficherBibliothequePratiques()
// avec ses callbacks spécifiques. Le moteur (repertoires-bibliotheque.js, range
// PAR IDENTITÉ) est inchangé.

/**
 * #1156 (lot 3 des bibliothèques en deux colonnes) — LA FAMILLE D'UNE PRATIQUE, EN MOTS : la partie
 * française de la description taxonomique (`FAMILLES_TAXONOMIQUES`), à la place des badges SOM, STD,
 * SPE, DEN. Le code vient du registre (`obtenirRepresentationPratiqueStricte`, source unique), lu sur
 * `pratiques[0]`, puis `type`, puis `configuration.type` (la lecture du moteur,
 * `PratiqueConfigurable._typeFamille` : les pratiques de la démo n'ont que celui-là).
 */
function familleDeLaPratique(pratique) {
    if (!pratique) return null;
    const PAR_CODE = { SOM: 'sommative', STD: 'standards', SPE: 'specifications', DEN: 'denotation' };
    const source = (Array.isArray(pratique.pratiques) && pratique.pratiques[0]) || pratique.type ||
        (pratique.configuration && pratique.configuration.type) || '';
    let code = PAR_CODE[source] ? source : null;
    if (!code && typeof obtenirRepresentationPratiqueStricte === 'function') {
        const rep = obtenirRepresentationPratiqueStricte(source);
        code = rep ? rep.code : null;
    }
    return code ? FAMILLES_TAXONOMIQUES[PAR_CODE[code]] || null : (FAMILLES_TAXONOMIQUES[source] || null);
}

/** #1156 — la ligne en clair : la famille, puis l'auteur quand ce n'est pas l'utilisateur actif. */
function lignePratiqueBibliotheque(pratique, auteurActif) {
    const parts = [];
    const famille = familleDeLaPratique(pratique);
    if (famille) parts.push(famille.nom);
    const auteur = (pratique.metadata_cc && pratique.metadata_cc.auteur_original) || pratique.auteur || '';
    if (auteur && auteur !== auteurActif) parts.push('par ' + auteur);
    return parts.join(' · ');
}

/**
 * #1156 — L'aperçu qu'ouvre le nom d'une rangée : la description de la pratique, ou sa description
 * taxonomique sans la parenthèse anglaise ; la provenance ; puis l'échelle et la grille qu'elle
 * emploie (`configuration.echelleId`, `configuration.grilleId`), cherchées dans ce trimestre puis
 * dans la bibliothèque. Un identifiant qu'aucun des deux ne connaît n'est pas montré.
 */
function apercuPratiqueBibliotheque(pratique, catalogues) {
    const famille = familleDeLaPratique(pratique);
    const description = (pratique.description && pratique.description.trim())
        || (famille ? famille.nom + ' - ' + famille.resume : '');
    const conf = pratique.configuration || {};
    const nomDans = (liste, id) => {
        const x = id ? liste.find(e => e && (e.id === id || e.idOriginal === id)) : null;
        return x ? (x.nom || '') : '';
    };
    const lignes = [];
    const echelle = nomDans(catalogues.echelles, conf.echelleId);
    if (echelle) lignes.push(['Échelle de performance', echelle, '']);
    const grille = nomDans(catalogues.grilles, conf.grilleId);
    if (grille) lignes.push(['Grille de critères d\'évaluation', grille, '']);
    return { paragraphes: [description, BibliothequeUI.formaterInspireDe(pratique)], lignes: lignes };
}

/**
 * Les données de la bibliothèque des pratiques. #1156 : des rangées pour la fenêtre en deux colonnes
 * (`BibliothequeUI.creerFenetreDeuxColonnes`), plus aucun HTML. Mêmes gestes, mêmes fonctions de
 * données qu'avant ; seuls la place et le libellé changent.
 */
async function preparerDonneesBibliothequePratiques() {
    // Beta 99.39 Phase B : migration vers BibliothequeUI (sortir de l'outlier).
    const configurations = db.getSync(cle('pratiquesConfigurables'), null) || [];

    // Beta 99.39 (A.0) : masque les items démo en mode normal
    // #326 axe D : masque aussi les variantes d'essai (réservées au Labo › Exploration).
    const pratiquesDansBibliotheque = BibliothequeUI.filtrerParMaquette(BibliothequeUI.filtrerParModeDemo(
        configurations.filter(p => p.dansBibliotheque !== false)
    ));

    let toutesBibliotheque = [];
    if (typeof obtenirToutesLesPratiquesBibliotheque === 'function') {
        toutesBibliotheque = await obtenirToutesLesPratiquesBibliotheque();
    }
    const pratiquesDisponibles = BibliothequeUI.filtrerParMaquette(BibliothequeUI.filtrerParModeDemo(toutesBibliotheque));

    // #291 — réunion des deux magasins avant analyse (cf. grilles.js).
    const doublonsDetectes = analyserDoublons(
        reunirSources(pratiquesDansBibliotheque, pratiquesDisponibles), 'nom');
    // #291 — la puce d'identifiant ne s'affiche que sur une rangée que le bandeau nomme.
    const idsNommes = new Set();
    doublonsDetectes.forEach(groupe => groupe.exemplaires.forEach(ex => idsNommes.add(ex.id)));

    // #326 (demande terrain 17 juin) — Découvrabilité des maquettes. Les maquettes
    // d'exploration sont VOLONTAIREMENT masquées de cette bibliothèque (D-2 : elles
    // vivent dans le Labo → Comparateur). Résultat terrain : l'utilisateur les cherche
    // ici pour les supprimer et ne les trouve pas. On signale donc leur existence et
    // on pointe vers le seul endroit où on peut les comparer, les adopter ou les jeter.
    const nbMaquettes = BibliothequeUI.filtrerParModeDemo(
        configurations.filter(p => p.dansBibliotheque !== false)
    ).filter(p => BibliothequeUI.estMaquette(p)).length;

    // #320 — répertoires de classement (couche par-dessus, range par identité).
    const repsPratiques = (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.obtenir === 'function')
        ? window.repertoiresBibliotheque.obtenir('pratiques')
        : [];
    const repParPratique = {};
    repsPratiques.forEach(r => (r.itemIds || []).forEach(id => { repParPratique[id] = r.id; }));

    const auteurActif = BibliothequeUI.obtenirAuteurActif();
    const catalogues = {
        echelles: [].concat(db.getSync(cle('echellesTemplates'), []) || [],
            typeof obtenirToutesLesEchellesBibliotheque === 'function' ? (await obtenirToutesLesEchellesBibliotheque() || []) : []),
        grilles: [].concat(db.getSync(cle('grillesTemplates'), []) || [],
            typeof obtenirToutesLesGrillesBibliotheque === 'function' ? (await obtenirToutesLesGrillesBibliotheque() || []) : [])
    };

    // Colonne « Dans ce trimestre ». Pas de « Garder → » ni de « Tout garder » : aucun geste d'avant ne
    // versait une pratique du trimestre dans la bibliothèque (`importerPratiquesDansBibliotheque` n'a
    // pas d'appelant ; consigne du lot 3, § 2.1 ; inscrit). L'état calme paraît quand la relation unique
    // (`BibliothequeUI.lieeAExemplaire`) le dit — un gabarit livré avec l'app compte : il est listé dans
    // la bibliothèque.
    const rangeesTrimestre = pratiquesDansBibliotheque.map(pratique => {
        const rangee = {
            id: pratique.id,
            nom: BibliothequeUI.formaterTitre(pratique.nom || 'Sans titre'),
            ligne: lignePratiqueBibliotheque(pratique, auteurActif),
            afficherId: idsNommes.has(pratique.id),
            apercu: apercuPratiqueBibliotheque(pratique, catalogues),
            menu: [
                { label: 'Dupliquer', action: 'dupliquerPratiqueBibliotheque', param: pratique.id, title: 'Créer une copie' },
                { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'pratique', param2: pratique.id, title: 'Générer un fichier .lcz signé à transmettre (#329)' },
                // Legacy JSON — retrait prévu à la convergence des formats (P8 #329)
                { label: 'Exporter (JSON)', action: 'partagerPratiqueMateriel', param: pratique.id, title: 'Exporter en JSON (ancien format)' },
                { separateur: true },
                { label: 'Retirer de ce trimestre', action: 'retirerPratiqueDeBibliothequeMateriel', param: pratique.id, classe: 'btn-supprimer', title: 'La pratique quitte le menu de l\'écran ; ses données sont conservées' },
                { label: 'Supprimer définitivement', action: 'supprimerPratiqueDefinitivement', param: pratique.id, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
            ]
        };
        if (toutesBibliotheque.some(ex => BibliothequeUI.lieeAExemplaire(pratique, ex))) rangee.etat = 'Aussi dans ta bibliothèque';
        return rangee;
    });

    // Colonne « Dans ta bibliothèque », gabarits compris (leur marque « Gabarit » part, comme les badges
    // de type). « Déjà dans ce trimestre » par la même relation.
    const rangeesBibliotheque = pratiquesDisponibles.map(pratique => {
        const dejaPresent = pratiquesDansBibliotheque.some(p => BibliothequeUI.lieeAExemplaire(p, pratique));
        const repCourant = repParPratique[pratique.id] || null;
        const menu = [];
        repsPratiques.forEach(r => {
            if (r.id !== repCourant) {
                menu.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classer', param: 'pratiques', param2: pratique.id, param3: r.id, title: 'Ranger dans ce dossier' });
            }
        });
        if (repCourant) {
            menu.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirer', param: 'pratiques', param2: pratique.id, title: 'Sortir du dossier (repasse en non classées)' });
        }
        if (menu.length) menu.push({ separateur: true });
        menu.push({ label: 'Supprimer de ma bibliothèque', action: 'supprimerPratiqueDeBibliothequePartagee', param: pratique.id, classe: 'btn-supprimer', title: 'Supprimer de la bibliothèque' });

        const rangee = {
            id: pratique.id,
            nom: BibliothequeUI.formaterTitre(pratique.nom || 'Sans titre'),
            ligne: lignePratiqueBibliotheque(pratique, auteurActif),
            afficherId: idsNommes.has(pratique.id),
            dossier: repCourant,
            apercu: apercuPratiqueBibliotheque(pratique, catalogues),
            dejaPresent: dejaPresent,
            menu: menu
        };
        if (dejaPresent) {
            rangee.etat = 'Déjà dans ce trimestre';
        } else {
            rangee.passage = { label: 'Utiliser dans ce trimestre', action: 'ajouterPratiqueALaSelection', param: pratique.id, sens: 'versTrimestre' };
        }
        return rangee;
    });

    return {
        rangeesTrimestre,
        rangeesBibliotheque,
        doublonsDetectes,
        pratiquesDansBibliotheque,
        repsPratiques,
        nbMaquettes,
        trimestresAvecPratiques: (typeof listerTrimestresAvecPratiques === 'function') ? listerTrimestresAvecPratiques() : []
    };
}

/**
 * #326 — la note des maquettes, au-dessus des colonnes : elles ne s'affichent dans aucune des deux,
 * et l'utilisateur les cherche ici. Mêmes mots, même geste qu'avant ; des classes, aucun style en
 * ligne. #345 — masquée tant que COMPARATEUR_VISIBLE est false (lien vers une page masquée).
 */
function noteMaquettesBibliotheque(nbMaquettes) {
    const comparateurVisible = (typeof COMPARATEUR_VISIBLE === 'undefined' || COMPARATEUR_VISIBLE);
    if (!(nbMaquettes > 0 && comparateurVisible)) return '';
    const motMaquette = nbMaquettes > 1 ? 'maquettes' : 'maquette';
    return '<div class="biblio2-note">' +
        '<p>Tu as <strong>' + nbMaquettes + ' ' + motMaquette + '</strong> d\'exploration. ' +
            'Les maquettes ne s\'affichent pas ici : elles vivent dans <strong>Labo → Exploration des pratiques</strong>, ' +
            'où tu peux les comparer, les adopter ou les jeter.</p>' +
        '<button type="button" class="btn btn-secondaire" data-action="ouvrirExplorationMaquettes">Gérer mes maquettes</button>' +
    '</div>';
}

/**
 * Affiche la bibliothèque des pratiques de notation. #1156 : en deux colonnes. L'encadré « Pour
 * éditer une pratique, transfère-la d'abord dans ta sélection… » est parti : les deux colonnes le
 * disent (plan du 24 oct., lot 3).
 */
async function afficherBibliothequePratiques() {
    // #327 — la biblio « pratiques » auprès du moteur des dossiers (idempotent) : ses gestes
    // (créer, renommer, classer…) redessinent la fenêtre par ce rappel. #1156 : plus de « select »
    // de dossier par cartes (`renderLigneDossierSelect`), donc plus de `labelItem`.
    BibliothequeUI.repertoires.enregistrer('pratiques', {
        rafraichir: afficherBibliothequePratiques
    });

    const data = await preparerDonneesBibliothequePratiques();

    // #293 — « Masquer ce qui est déjà dans ce trimestre » (même préférence qu'avant).
    const rangeesBibliotheque = BibliothequeUI.filtrerParDejaPresent(data.rangeesBibliotheque);
    const toutesMasquees = data.rangeesBibliotheque.length > 0 && rangeesBibliotheque.length === 0;

    BibliothequeUI.creerFenetreDeuxColonnes({
        modalId: 'modalBibliothequePratiques',
        titre: 'Bibliothèque de pratiques de notation',
        aide: 'bibliotheque-fonctionnement',
        menuFichiers: [
            { label: 'Importer des pratiques', action: 'ouvrirFilePickerImportPratiques' },
            { label: 'Importer le partage d\'une ou d\'un collègue', action: 'partageImport.ouvrirSelecteurFichier' },
            { separateur: true },
            { label: 'Exporter les pratiques de ce trimestre', action: 'exporterPratiquesUtilisateur' },
            { note: 'Fichiers .json et .lcz' }
        ],
        champsFichier: [{ id: 'fichier-import-pratiques-modal', accept: '.json', onChange: 'importerPratiquesUtilisateur' }],
        avantColonnes: noteMaquettesBibliotheque(data.nbMaquettes) +
            BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes, {
                itemsSelection: data.pratiquesDansBibliotheque,
                mots: { selection: 'Dans ce trimestre', bibliotheque: 'Dans ta bibliothèque', retirer: 'Retirer de ce trimestre (données conservées)' },
                actions: {
                    retirer: 'retirerPratiqueDeBibliothequeMateriel',
                    supprimer: 'supprimerPratiqueDefinitivement',
                    supprimerPartagee: 'supprimerPratiqueDeBibliothequePartagee'
                }
            }),
        trimestre: {
            titre: 'Dans ce trimestre',
            phrase: 'Les pratiques que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.',
            idListe: 'listePratiquesDansBibliotheque',
            rangees: data.rangeesTrimestre,
            vide: 'Aucune pratique dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la avec « + Nouvelle pratique ».',
            // Brique C namespacing — pas 5, modèle COPIE. DIVERGENCE vs grilles : pratiquesConfigurables
            // est NAMESPACÉE par trimestre, donc listerTrimestresAvecPratiques() liste TOUS les trimestres
            // ≠ actif ayant des pratiques. Destination = trimestre ACTIF (`copierPratiqueDepuisTrimestre`) :
            // la ligne reste au pied de « Dans ce trimestre ». Garde D-C7 (cible jamais archivée) incluse.
            importAutreTrimestre: {
                titre: 'Importer depuis un autre trimestre',
                selectId: 'selectTrimestreImportPratiques',
                apercuId: 'previewPratiquesTrimestre',
                options: data.trimestresAvecPratiques.map(t => ({ value: t.id, label: `${t.nom} (${t.nombre} pratique${t.nombre > 1 ? 's' : ''})` })),
                actionVoir: 'afficherPratiquesTrimestreModal',
                libelleVoir: 'Voir les pratiques',
                actionTout: 'importerToutPratiquesTrimestreModal',
                tooltipTout: 'import-trimestre-tout-pratiques',
                aide: 'import-autre-trimestre'
            }
        },
        bibliotheque: {
            titre: 'Dans ta bibliothèque',
            // Sans « C'est d'ici que tu peux les partager. » : même raison qu'aux lots 1 et 2.
            phrase: 'Les pratiques que tu gardes pour tous tes trimestres.',
            idListe: 'listePratiquesDisponibles',
            compte: data.rangeesBibliotheque.length,
            rangees: rangeesBibliotheque,
            vide: toutesMasquees
                ? 'Toutes les pratiques de ta bibliothèque sont déjà dans ce trimestre.'
                : 'Ta bibliothèque est vide.',
            videFiltre: 'Aucune pratique dans ce dossier.',
            dossiers: {
                biblio: 'pratiques',
                reps: data.repsPratiques.map(r => ({ id: r.id, nom: r.nom })),
                refreshFn: 'afficherBibliothequePratiques',
                masquerLibelle: 'Masquer ce qui est déjà dans ce trimestre',
                labelPluriel: 'pratiques'
            },
            partages: window.partageSection ? partageSection.rangeesDeuxColonnes('pratique') : null
        }
    });
}

/**
 * Ferme le modal de bibliothèque
 */
function fermerModalBibliothequePratiques() {
    BibliothequeUI.fermerModal('modalBibliothequePratiques');
}

/* ===================================================================
   IMPORT INTER-TRIMESTRE DE PRATIQUES (Brique C namespacing — pas 5)
   Modèle COPIE : une pratique d'un trimestre source est DUPLIQUÉE dans le
   trimestre actif (id neuf + trace inspireDe), la source n'est JAMAIS mutée.
   DIVERGENCE vs grilles (pas 4) : pratiquesConfigurables ∈ CLES_NAMESPACEES →
   cleSource('pratiquesConfigurables', srcId) rend TOUJOURS <srcId>_pratiquesConfigurables
   (jamais la clé globale nue), donc TOUS les trimestres ≠ actif sont des sources
   (pas seulement les archivés). Cadrage C/D §2.5.
   Dépendances (option A, décision Grégoire 26 juin) : echelleId/grilleId de la
   pratique importée NE sont PAS remappés ; s'ils ne résolvent pas dans le
   trimestre actif, on AVERTIT (re-sélection manuelle), pas de copie transitive.
   =================================================================== */

/**
 * Liste les trimestres ≠ actif qui possèdent des pratiques configurées.
 * pratiquesConfigurables étant namespacée, cleSource rend toujours la clé propre du
 * trimestre source — il n'y a donc PAS de filtre « copie propre » comme pour les grilles.
 * Garde D-C7 : la cible d'un import n'est jamais un trimestre archivé (consultation =
 * lecture seule, cohérence avec la garde anti-écriture en archive de la Brique B).
 * @returns {Array<{id:string, nom:string, nombre:number}>}
 */
function listerTrimestresAvecPratiques() {
    if (typeof obtenirTrimestres !== 'function' || typeof cleSource !== 'function') return [];
    if (window.estTrimestreArchive && window.estTrimestreArchive()) return [];
    const actif = (typeof obtenirTrimestreId === 'function') ? obtenirTrimestreId() : (window.trimestreActif || '');
    const resultat = [];
    (obtenirTrimestres() || []).forEach(t => {
        if (!t || !t.id || t.id === actif) return;
        const pratiques = (db.getSync(cleSource('pratiquesConfigurables', t.id), []) || [])
            .filter(p => p && p.dansBibliotheque !== false);
        if (pratiques.length > 0) {
            resultat.push({ id: t.id, nom: t.nom || t.id, nombre: pratiques.length });
        }
    });
    resultat.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return resultat;
}

/**
 * Vérifie si les dépendances (échelle, grille de rétroaction DEN) d'une pratique
 * EXISTENT dans le trimestre actif. Lecture du catalogue actif par la clé GLOBALE NUE
 * ('echellesTemplates'/'grillesTemplates'), comme les dropdowns de l'éditeur de pratique
 * (chargerDropdownEchellesMat / chargerDropdownGrillesMat) — PAS cle(), qui ne préfixe
 * ces collections globales que hors de notre cas (actif archivé).
 * @param {Object} pratique
 * @returns {Array<string>} libellés des dépendances absentes (vide si tout résout)
 */
function verifierDependancesPratique(pratique) {
    const manquantes = [];
    const conf = (pratique && pratique.configuration) ? pratique.configuration : {};
    // « Existe » doit signifier « RE-SÉLECTIONNABLE » : les dropdowns de l'éditeur
    // (chargerDropdownEchellesMat / chargerDropdownGrillesMat) n'offrent que les
    // items dansBibliotheque !== false. On filtre pareil pour que l'avertissement
    // (option A) ne rate pas le cas « présente mais retirée de la barre latérale ».
    if (conf.echelleId) {
        const echelles = (db.getSync(cle('echellesTemplates'), []) || []).filter(e => e && e.dansBibliotheque !== false);
        if (!echelles.some(e => e.id === conf.echelleId)) manquantes.push('échelle');
    }
    if (conf.grilleId) {
        const grilles = (db.getSync(cle('grillesTemplates'), []) || []).filter(g => g && g.dansBibliotheque !== false);
        if (!grilles.some(g => g.id === conf.grilleId)) manquantes.push('grille de rétroaction');
    }
    return manquantes;
}

/**
 * Copie une pratique d'un trimestre source vers le trimestre ACTIF.
 * La trace de provenance (inspireDe / inspireDeTrimestre) est posée sur une COPIE —
 * la pratique source en mémoire et en stockage n'est jamais mutée. Id neuf, métadonnées
 * de partage retirées (comme dupliquerPratiqueBibliotheque). echelleId/grilleId NON
 * remappés (option A) ; les dépendances manquantes sont retournées pour avertissement.
 * @param {Object} pratiqueSource - pratique telle que lue dans le trimestre source
 * @param {string} srcId - id du trimestre source (ex. 'a2025')
 * @returns {{pratique:Object, depsManquantes:Array<string>}}
 */
function copierPratiqueDepuisTrimestre(pratiqueSource, srcId) {
    // Copie PROFONDE : aucune référence partagée avec la source (sous-objets
    // configuration / jetons / objectifs). Garantit STRUCTURELLEMENT l'invariant
    // §5.5 « source immuable » — pas seulement par la sérialisation de la
    // persistance. Une pratique est full-JSON (issue de localStorage) → round-trip
    // sans perte. Verrouillé par un break-test d'indépendance dans la sentinelle.
    const nouvellePratique = JSON.parse(JSON.stringify(pratiqueSource));
    nouvellePratique.id = genererIdUnique('pratique_');
    nouvellePratique.nom = `${pratiqueSource.nom || 'Pratique'} (importée)`;
    nouvellePratique.auteur = BibliothequeUI.obtenirAuteurActif();
    nouvellePratique.isDemo = false;
    // Trace de provenance : objet inspireDe structuré (schéma CC transversal lu par
    // formaterInspireDe / cc-license) + trimestre source (ajout Brique C). NB : une
    // STRING brute afficherait « Inspiré de Inconnu par Inconnu » sur la carte.
    nouvellePratique.inspireDe = BibliothequeUI.forgerInspireDe(pratiqueSource);
    nouvellePratique.inspireDeTrimestre = srcId;
    nouvellePratique.dansBibliotheque = true;
    nouvellePratique.dateCreation = new Date().toISOString();
    delete nouvellePratique.metadata_cc;
    delete nouvellePratique.auteurOriginal;
    delete nouvellePratique.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source
    delete nouvellePratique.estGabarit;

    const configurations = db.getSync(cle('pratiquesConfigurables'), null) || [];
    configurations.push(nouvellePratique);
    db.setSync(cle('pratiquesConfigurables'), configurations);
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('pratiquesConfigurables'));   // lot F : geste hors témoin (copierPratiqueDepuisTrimestre)

    return { pratique: nouvellePratique, depsManquantes: verifierDependancesPratique(nouvellePratique) };
}

/**
 * Bouton « Voir les pratiques » : affiche, sous le sélecteur, la liste des pratiques du
 * trimestre choisi avec un bouton « Importer » par ligne.
 */
function afficherPratiquesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportPratiques');
    const preview = document.getElementById('previewPratiquesTrimestre');
    if (!select || !preview) return;

    const srcId = select.value;
    if (!srcId) { preview.classList.add('u-hide'); return; }

    const pratiques = (db.getSync(cleSource('pratiquesConfigurables', srcId), []) || [])
        .filter(p => p && p.dansBibliotheque !== false);
    if (pratiques.length === 0) {
        preview.innerHTML = '<p class="biblio2-phrase">Aucune pratique trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    // #1156 — l'aperçu vit dans la fenêtre en deux colonnes : des classes, aucun style en ligne.
    let html = '<ul class="biblio2-import-liste">';
    pratiques.forEach(pratique => {
        const desc = pratique.description ? `<p class="biblio2-rangee-meta">${echapperHtml(pratique.description)}</p>` : '';
        html += `
            <li class="biblio2-import-rangee">
                <div>
                    <strong>${echapperHtml(pratique.nom || 'Sans titre')}</strong>${desc}
                </div>
                <button type="button" data-action="importerUnePratiqueTrimestre" data-param="${echapperAttribut(srcId)}" data-param2="${echapperAttribut(pratique.id)}" class="btn btn-secondaire">
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
 * Bouton « Importer » d'une ligne d'aperçu : copie une seule pratique du trimestre source.
 * @param {string} srcId - id du trimestre source
 * @param {string} pratiqueId - id de la pratique dans le trimestre source
 */
/** État de la section d'import, à reposer après reconstruction du modal. */
function etatImportPratiques() {
    return BibliothequeUI.capturerImportTrimestre({
        modalId: 'modalBibliothequePratiques',
        selects: ['selectTrimestreImportPratiques'],
        apercu: 'previewPratiquesTrimestre'
    });
}

async function importerUnePratiqueTrimestre(srcId, pratiqueId) {
    if (window.estTrimestreArchive && window.estTrimestreArchive()) {
        alert('Import impossible : le trimestre actif est clos (consultation). Active un trimestre courant pour importer des pratiques.');
        return;
    }
    const pratiques = (db.getSync(cleSource('pratiquesConfigurables', srcId), []) || [])
        .filter(p => p && p.dansBibliotheque !== false);
    const pratique = pratiques.find(p => p.id === pratiqueId);
    if (!pratique) { alert('Pratique introuvable.'); return; }

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportPratiques();

    const res = copierPratiqueDepuisTrimestre(pratique, srcId);

    fermerModalBibliothequePratiques();
    await afficherListePratiquesMateriel();
    await afficherBibliothequePratiques();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherPratiquesTrimestreModal);

    const details = res.depsManquantes.length > 0
        ? `À re-sélectionner à l'édition (absent de ce trimestre) : ${res.depsManquantes.join(', ')}.`
        : '';
    notifications.succes(`« ${pratique.nom || 'Pratique'} » importée dans ce trimestre.`, details);
}

/**
 * Bouton « Tout importer » : copie toutes les pratiques du trimestre sélectionné dans
 * le trimestre actif.
 */
async function importerToutPratiquesTrimestreModal() {
    if (window.estTrimestreArchive && window.estTrimestreArchive()) {
        alert('Import impossible : le trimestre actif est clos (consultation). Active un trimestre courant pour importer des pratiques.');
        return;
    }
    const select = document.getElementById('selectTrimestreImportPratiques');
    if (!select || !select.value) { alert('Sélectionne d\'abord un trimestre.'); return; }

    const srcId = select.value;
    const trimestres = (typeof obtenirTrimestres === 'function') ? (obtenirTrimestres() || []) : [];
    const trimSrc = trimestres.find(t => t && t.id === srcId);
    const nomTrim = (trimSrc && trimSrc.nom) ? trimSrc.nom : srcId;

    const pratiques = (db.getSync(cleSource('pratiquesConfigurables', srcId), []) || [])
        .filter(p => p && p.dansBibliotheque !== false);
    if (pratiques.length === 0) { alert('Aucune pratique à importer dans ce trimestre.'); return; }

    const confirmation = confirm(
        `Veux-tu importer les ${pratiques.length} pratique(s) de ${nomTrim} dans ce trimestre ?\n\n` +
        'Chaque pratique est COPIÉE (l\'original du trimestre source reste intact).'
    );
    if (!confirmation) return;

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportPratiques();

    let nb = 0;
    const depsGlobales = new Set();
    for (const pratique of pratiques) {
        const res = copierPratiqueDepuisTrimestre(pratique, srcId);
        nb++;
        res.depsManquantes.forEach(d => depsGlobales.add(d));
    }

    fermerModalBibliothequePratiques();
    await afficherListePratiquesMateriel();
    await afficherBibliothequePratiques();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherPratiquesTrimestreModal);

    let details = `${nb} pratique(s) copiée(s).`;
    if (depsGlobales.size > 0) {
        details += ` Certaines référencent des éléments absents de ce trimestre (${[...depsGlobales].join(', ')}) — à re-sélectionner à l'édition.`;
    }
    notifications.succes('Import terminé', details);
}

/**
 * Ferme la bibliothèque puis ouvre le Labo → Comparateur, où vivent les maquettes
 * d'exploration (comparer / adopter / jeter). Routé par le dispatcher data-action
 * depuis la bannière de découvrabilité (#326). CSP-safe, aucun handler inline.
 */
function ouvrirExplorationMaquettes() {
    fermerModalBibliothequePratiques();
    if (typeof naviguerVers === 'function') {
        naviguerVers('labo', 'comparateur');
    }
}

/* ===============================
   GESTION DES PRATIQUES (AJOUT/RETRAIT)
   =============================== */

/**
 * Ajoute une pratique de la bibliothèque à la sélection de l'utilisateur
 */
async function ajouterPratiqueALaSelection(pratiqueId) {

    // Obtenir la configuration depuis la bibliothèque
    let configSource = null;
    if (typeof obtenirConfigurationPratiqueParId === 'function') {
        configSource = await obtenirConfigurationPratiqueParId(pratiqueId);
    }

    if (!configSource) {
        console.error('[pratiques-gestion] Configuration introuvable:', pratiqueId);
        return;
    }

    // #898 — un modèle Standards sans échelle DEMANDE l'échelle avant de rejoindre la
    // sélection. La question porte sur ce qui sera réellement écrit : la pratique déjà
    // en base si elle avait été retirée, sinon le modèle de la bibliothèque. Déjà dans
    // la sélection : pas de question, le verdict « déjà » répond plus bas. Question
    // fermée sans choix : rien n'est écrit, la bibliothèque reste ouverte.
    const enBase = (db.getSync(cle('pratiquesConfigurables'), null) || []).find(p => p.id === pratiqueId);
    let echelleAdoption = null;
    if (!enBase || enBase.dansBibliotheque === false) {
        const reponseEchelle = await demanderEchelleAdoption(enBase || configSource);
        if (!reponseEchelle.adopter) return;
        echelleAdoption = reponseEchelle.echelleId;
    }

    // #522 — la recherche, la garde d'identité et l'écriture tiennent dans la
    // file : entre une lecture et une écriture séparées, un second ajout lancé
    // depuis le même modal passerait la garde sur un instantané périmé.
    // ⚠ Le mutateur ne notifie pas : il rend un verdict, et l'appelant parle.
    let verdict = null;
    let nomEnPlace = null;
    const ecritLotF = await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];

        // Vérifier si déjà présente
        const existante = configurations.find(p => p.id === pratiqueId);

        if (existante) {
            // La pratique existe - vérifier si elle est dans la sélection
            if (existante.dansBibliotheque !== false) {
                verdict = 'deja';
                return undefined;
            }

            // La pratique existe mais a été retirée - la réactiver
            if (modeleDemandeEchelle(existante)) poserEchelleAdoption(existante, echelleAdoption);
            existante.dansBibliotheque = true;
            existante.dateAjout = new Date().toISOString();
            verdict = 'ajoutee';
            return configurations;
        }

        // Ajouter avec le flag dansBibliotheque
        const nouvelleConfig = poserEchelleAdoption({
            ...configSource,
            dansBibliotheque: true,
            dateAjout: new Date().toISOString()
        }, echelleAdoption);

        // #476 — garde d'identité au point d'écriture. La recherche ci-dessus
        // ne teste que `p.id === pratiqueId` : une pratique importée d'un autre
        // trimestre porte son ascendance dans `inspireDe.sourceId` sous un id
        // neuf, et s'ajoutait donc une seconde fois sans que rien ne le dise.
        const gardePratique = ajouterAvecGardeIdentite(configurations, nouvelleConfig);
        if (!gardePratique.ajoute) {
            verdict = 'conflit';
            nomEnPlace = (gardePratique.conflit || {}).nom || null;
            return undefined;
        }
        verdict = 'ajoutee';
        // security-ok: `configSource` vient de la bibliothèque, où toute entrée
        // passe déjà par assainirObjet (pratiques-bibliotheque.js, B-β). La garde
        // ne fait que refuser un doublon ; elle n'introduit aucune donnée neuve.
        return gardePratique.liste;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('pratiquesConfigurables'));   // lot F : geste hors témoin (ajouterPratiqueALaSelection)

    if (verdict === 'deja') {
        notifications.info('Cette pratique est déjà dans ce trimestre.');
        return;
    }
    if (verdict === 'conflit') {
        notifications.info(
            `« ${nomEnPlace || 'Cette pratique'} » est déjà dans ce trimestre.`,
            'Pour en avoir un second exemplaire, utilise « Dupliquer ».');
        return;
    }

    // ⚠ Relecture-vérification : la garde d'écriture de db.js (#340) peut
    // refuser une écriture en silence — le succès et le refus se ressemblent
    // depuis l'appelant. On relit avant d'annoncer quoi que ce soit.
    const verifPratiques = await db.get(cle('pratiquesConfigurables'), null) || [];

    // Rafraîchir la sidebar, puis la fenêtre. #1156 : la fenêtre se redessine, à la même position de
    // défilement, comme après un passage dans les quatre autres (consigne du lot 1, § 1.7) ; avant, elle
    // se fermait.
    await afficherListePratiquesMateriel();
    fermerModalBibliothequePratiques();
    await afficherBibliothequePratiques();

    if (!verifPratiques.some(p => p.id === pratiqueId && p.dansBibliotheque !== false)) {
        console.error('[pratiques-gestion] Écriture non confirmée —', pratiqueId,
            'absente de la sélection après db.modifier.');
        notifications.erreur(
            `« ${configSource.nom || 'Cette pratique'} » n'a PAS pu être ajoutée.`,
            'L\'enregistrement a été refusé. Ouvre la console pour la raison.');
        return;
    }

    notifications.succes(`Pratique "${configSource.nom}" ajoutée`);
}

/**
 * Retire une pratique de la sélection (mais pas de la bibliothèque globale)
 */
async function retirerPratiqueDeLaSelection(pratiqueId) {

    // Marquer comme retirée (au lieu de supprimer complètement)
    let retiree = false;
    const ecritLotF = await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueId);
        if (index === -1) return undefined;

        configurations[index].dansBibliotheque = false;
        retiree = true;
        return configurations;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('pratiquesConfigurables'));   // lot F : geste hors témoin (retirerPratiqueDeLaSelection)

    if (retiree) {
        // Rafraîchir la sidebar AVANT de réouvrir le modal
        await afficherListePratiquesMateriel();

        // Rafraîchir le modal
        fermerModalBibliothequePratiques();
        await afficherBibliothequePratiques();

        notifications.succes('Pratique retirée de ce trimestre');
    }
}

// Alias pour compatibilité - renommé avec suffixe Materiel
async function retirerPratiqueDeBibliothequeMateriel(pratiqueId) {
    await retirerPratiqueDeLaSelection(pratiqueId);
}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une pratique (hard delete)
 * @param {string} pratiqueId - ID de la pratique à supprimer
 */
async function supprimerPratiqueDefinitivement(pratiqueId) {
    const configurations = await db.get(cle('pratiquesConfigurables'), null) || [];
    const pratique = configurations.find(p => p.id === pratiqueId);

    if (!pratique) return;

    // Confirmation
    // #1156 — ce chemin n'efface pas l'exemplaire de la bibliothèque (il n'écrit que
    // `pratiquesConfigurables`) ; la question le dit, quand la relation unique le lie à un exemplaire
    // (gabarit compris : il reste dans la bibliothèque). Ses deux chemins (⋮ de « Dans ce trimestre »,
    // bandeau des doublons) passent ici. Même `confirm` qu'avant.
    const biblio = typeof obtenirToutesLesPratiquesBibliotheque === 'function'
        ? (await obtenirToutesLesPratiquesBibliotheque() || []) : [];
    const phraseBibliotheque = biblio.some(ex => BibliothequeUI.lieeAExemplaire(pratique, ex))
        ? '\n\nSon exemplaire de ta bibliothèque reste.' : '';
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('pratique'))) return;
    if (!confirm(`Supprimer définitivement la pratique «${pratique.nom}» ?\n\nCette action est irréversible.${phraseBibliotheque}`)) {
        return;
    }

    // Suppression définitive — le filtre s'applique à la collection FRAÎCHE,
    // pas à celle lue avant la question : la réponse peut se faire attendre.
    const ecritLotF = await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        return (lues || []).filter(p => p.id !== pratiqueId);
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('pratiquesConfigurables'));   // lot F : geste hors témoin (supprimerPratiqueDefinitivement)

    // Rafraîchir UI
    fermerModalBibliothequePratiques();
    await afficherListePratiquesMateriel();
    await afficherBibliothequePratiques();

}

/**
 * Supprime définitivement une pratique de la Bibliothèque
 * (section 2 de la modale Bibliothèque). Refuse les gabarits prédéfinis
 * (seeds présents dans MODELES_PRATIQUES_PREDEFINIS) qui seraient recréés
 * au prochain chargement de toute façon.
 * @param {string} pratiqueId - ID de la pratique à supprimer
 */
async function supprimerPratiqueDeBibliothequePartagee(pratiqueId) {
    // Une pratique peut exister à deux endroits :
    //   - dans bibliothequePratiques IDB (copie utilisateur, supprimable)
    //   - dans MODELES_PRATIQUES_PREDEFINIS (seed code source, non supprimable depuis l'UI)
    // Si l'ID partage entre les deux, on autorise la suppression de la copie IDB :
    // le seed se réinjecte automatiquement au prochain rafraîchissement via
    // obtenirToutesLesPratiquesBibliotheque (ligne 568 de pratiques-bibliotheque.js).
    const bibliotheque = await db.get('bibliothequePratiques') || [];
    const estDansIDB = bibliotheque.some(p => p.id === pratiqueId);

    if (!estDansIDB) {
        // L'ID n'existe que dans le seed — gabarit pur non supprimable
        if (typeof notifications !== 'undefined' && notifications.info) {
            notifications.info('Gabarit prédéfini', 'Ce gabarit est fourni par défaut avec l\'application et ne peut pas être supprimé. Il se réinjecte automatiquement au rafraîchissement.');
        } else {
            alert('Ce gabarit est fourni par défaut avec l\'application et ne peut pas être supprimé.');
        }
        return;
    }

    let items = [];
    if (typeof obtenirToutesLesPratiquesBibliotheque === 'function') {
        items = await obtenirToutesLesPratiquesBibliotheque();
    }
    const pratique = items.find(p => p.id === pratiqueId);
    const nom = (pratique && pratique.nom) || pratiqueId;
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('pratiqueBibliotheque'))) return;
    if (!confirm('Supprimer définitivement la pratique « ' + nom + ' » de la bibliothèque ?\n\nCette action est irréversible.')) return;
    const ok = await retirerPratiqueDeLaBibliotheque(pratiqueId);
    if (!ok) {
        if (typeof notifications !== 'undefined' && notifications.erreur) {
            notifications.erreur('Suppression échouée', 'La pratique n\'a pas pu être supprimée de la bibliothèque.');
        } else {
            alert('Impossible de supprimer cette pratique.');
        }
        return;
    }
    fermerModalBibliothequePratiques();
    await afficherBibliothequePratiques();
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une pratique dans la bibliothèque
 * @param {string} pratiqueId - ID de la pratique à dupliquer
 * @returns {Promise<Object|undefined>} la copie créée (undefined si pratique introuvable)
 */
async function dupliquerPratiqueBibliotheque(pratiqueId) {
    // #476 volet 2 — séquence partagée. Les pratiques sont la seule famille à
    // lire/écrire en SYNCHRONE, à exiger un clone PROFOND, et à RENDRE la copie.
    return await BibliothequeUI.dupliquerVersBibliotheque({
        id: pratiqueId,
        prefixeId: 'pratique_',
        // Copie PROFONDE (et non un étalement) : aucune référence partagée avec
        // la source (sous-objets configuration / jetons / objectifs). Garantit
        // STRUCTURELLEMENT l'invariant « source immuable » (zéro-dette), pas
        // seulement par la sérialisation de la persistance. Aligné sur
        // copierPratiqueDepuisTrimestre (Brique C pas 5).
        cloneProfond: true,
        modifierListe: (mutateur) => db.modifier(cle('pratiquesConfigurables'), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
        // ✅ D3 (arbitrage du 24 août) — `nommerCopie` remplace la concaténation
        // nue, qui empilait « X (copie) (copie) ».
        nommerLaCopie: (copie, source, liste) => { copie.nom = nommerCopie(source.nom, liste); },
        forgerProvenance: (source) => BibliothequeUI.forgerInspireDe(source),
        siIntrouvable: () => alert('Pratique introuvable'),
        retoucherCopie: (copie) => { delete copie.estGabarit; }, // ce n'est plus un gabarit
        rafraichirUI: async () => {
            fermerModalBibliothequePratiques();
            await afficherListePratiquesMateriel();
            await afficherBibliothequePratiques();
        }
    });
}

/* ===============================
   ÉDITION DES PRATIQUES
   =============================== */

/**
 * Charge une pratique pour modification dans la zone principale
 * Utilise le formulaire HTML statique (IDs préfixés mat-)
 */
async function chargerPratiquePourModif(pratiqueId) {

    pratiqueEnEditionMateriel = pratiqueId;

    // Charger la configuration
    let pratique = null;

    // 🆕 FIX v3 (20 jan 2026) : localStorage comme source principale
    const configurations = db.getSync(cle('pratiquesConfigurables'), null) || [];
    pratique = configurations.find(p => p.id === pratiqueId);

    // Si pas trouvée, chercher dans la bibliothèque globale
    if (!pratique && typeof obtenirConfigurationPratiqueParId === 'function') {
        pratique = await obtenirConfigurationPratiqueParId(pratiqueId);
    }

    if (!pratique) {
        console.error('[pratiques-gestion] Pratique introuvable:', pratiqueId);
        return;
    }

    // Afficher le formulaire d'édition
    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (accueil) accueil.classList.add('u-hide');
    if (conteneurEdition) conteneurEdition.classList.remove('u-hide');

    // ✅ FIX (10 jan 2026) : Charger le dropdown des échelles AVANT de remplir le formulaire
    // Sinon la valeur de l'échelle ne peut pas être appliquée car le dropdown est vide
    await chargerDropdownEchellesMat();
    // #343-T1 — idem pour la grille de rétroaction DEN (section mat-config-denotation).
    await chargerDropdownGrillesMat();

    // Remplir les champs du formulaire (incluant l'échelle)
    remplirFormulairePratique(pratique);

    // Le menu montre la pratique ouverte
    MenuSelection.marquer('menuPratiques', pratiqueId);

    // Phase 4.B : mode lecture seule si item démo
    if (conteneurEdition && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneurEdition, pratique, 'dupliquerEtEditerPratique', 'Dupliquer pour créer ma pratique');
    }

    pratiqueOuverte = pratique;
    rendreChainePratique();   // #1149, lot 3b
}

/* ===============================
   LA CHAÎNE DES ÉTAPES (#1149, lot 3b, 24 oct. 2026)
   =============================== */

/** La pratique ouverte, telle que chargée (une pratique de la bibliothèque globale n'est pas dans la collection). */
let pratiqueOuverte = null;

/**
 * LES ÉTAPES D'UNE PRATIQUE (validées par Grégoire, 24 oct., 19 h 51). Fonction pure : la pratique, et ce
 * que l'écran a lu pour elle — la méthode que le moteur appliquera (`methodeDeCalculDeLaPratique`), son
 * libellé, le total des pondérations des productions, la pratique active du groupe-cours, les méthodes qui
 * consomment une échelle.
 * La famille sommative se reconnaît à sa MÉTHODE (`moyenne_ponderee`), pas à un nom affiché. « Échelle »
 * n'existe que pour les méthodes qui la consomment ; « Pondération », que pour la sommative : sous 100 %,
 * elle est « à régler » sans couleur (toutes les productions ne sont pas créées), au-dessus, critique.
 */
function etapesChainePratique(pratique, contexte) {
    const p = pratique || {};
    const c = contexte || {};
    const methode = c.methode || null;
    const etapes = [
        { id: 'methode', libelle: 'Méthode', reglee: !!methode, info: methode ? (c.libelleMethode || methode) : 'à choisir' }
    ];
    if (methode && (c.methodesAvecEchelle || []).includes(methode)) etapes.push(etapeEchelleDeLaPratique(p));
    if (methode === 'moyenne_ponderee') etapes.push(etapePonderationSommative(c.totalPonderation));
    const active = !!p.id && c.idActive === p.id;
    etapes.push({ id: 'groupe-cours', libelle: 'Groupe-cours', arrivee: true, reglee: active,
        info: active ? 'active' : 'à activer' });
    return etapes;
}

/** « Échelle » : seulement pour les méthodes qui la consomment. */
function etapeEchelleDeLaPratique(pratique) {
    const choisie = !!(pratique.configuration && pratique.configuration.echelleId);
    return { id: 'echelle', libelle: 'Échelle', reglee: choisie, info: choisie ? 'choisie' : 'à choisir' };
}

/** « Pondération » : la sommative seulement ; sous 100 %, à régler sans couleur ; au-dessus, critique. */
function etapePonderationSommative(totalPonderation) {
    const total = Number(totalPonderation) || 0;
    return { id: 'ponderation', libelle: 'Pondération', reglee: total === 100,
        info: formaterPourcentage(total), ton: total > 100 ? 'critique' : '' };
}

/** La pratique ouverte, dans sa version enregistrée d'abord (la fiche écrit à chaque changement de champ). */
function pratiquePourLaChaine() {
    const enregistree = (db.getSync(cle('pratiquesConfigurables'), null) || []).find(p => p && p.id === pratiqueEnEditionMateriel);
    if (enregistree) return enregistree;
    return (pratiqueOuverte && pratiqueOuverte.id === pratiqueEnEditionMateriel) ? pratiqueOuverte : null;
}

/** Le libellé de la famille d'une méthode, tel que la fiche l'affiche dans son menu « Type de pratique ». */
function libelleDeLaMethode(methode) {
    const familles = window.METHODE_PAR_FAMILLE || {};
    const famille = Object.keys(familles).find(f => familles[f] === methode);
    const menuType = document.getElementById('mat-pratique-type');
    const option = (famille && menuType) ? [...menuType.options].find(o => o.value === famille) : null;
    return option ? option.textContent.trim() : '';
}

/** Dessine la chaîne de la pratique ouverte (`#chainePratique`) ; elle paraît et part avec la fiche. */
function rendreChainePratique() {
    const conteneur = document.getElementById('chainePratique');
    if (!conteneur || typeof ChaineEtapes === 'undefined' || !pratiqueEnEditionMateriel) return;
    const pratique = pratiquePourLaChaine();
    if (!pratique) return;
    const methode = typeof methodeDeCalculDeLaPratique === 'function' ? methodeDeCalculDeLaPratique(pratique) : null;
    ChaineEtapes.dessiner(conteneur, etapesChainePratique(pratique, {
        methode: methode,
        libelleMethode: libelleDeLaMethode(methode),
        totalPonderation: typeof totalPonderationProductions === 'function'
            ? totalPonderationProductions(db.getSync(cle('productions'), []) || []) : 0,
        idActive: typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : null,
        methodesAvecEchelle: window.METHODES_AVEC_ECHELLE || []
    }), { libelle: 'Étapes de la pratique', surClic: suivreEtapeDeLaPratique });
}

/**
 * Le clic conduit, il n'agit pas. « Méthode » rouvre l'assistant en édition (comme `editerPratique`) ;
 * « Échelle » descend au menu de l'échelle ; « Pondération » ouvre les productions, où elle se règle ;
 * « Groupe-cours » descend au bouton « Appliquer au cours actif », sans l'appuyer.
 */
function suivreEtapeDeLaPratique(idEtape) {
    if (idEtape === 'methode') {
        if (typeof ouvrirWizardV2 === 'function' && pratiqueEnEditionMateriel) ouvrirWizardV2(true, pratiqueEnEditionMateriel);
        return;
    }
    if (idEtape === 'ponderation') {
        if (typeof afficherSousSection === 'function') afficherSousSection('conception-productions');
        return;
    }
    const cible = idEtape === 'echelle'
        ? document.getElementById('mat-echelle-id')
        : document.querySelector('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Phase 4.B : fork une pratique démo et charge la copie en édition.
 */
async function dupliquerEtEditerPratique(id) {
    // #476 volet 2 — séquence partagée. Les pratiques sont la seule famille à
    // lire et écrire en SYNCHRONE (`getSync`/`setSync`, localStorage) et la seule
    // à disposer d'un repli quand la source n'est pas dans la collection.
    // La collection transmise à `forkerItem` sert à sauter au premier rang de
    // copie libre (CO-24) : le moteur lui passe la liste lue, qui est la même.
    await BibliothequeUI.dupliquerEtEditerItem({
        id: id,
        prefixeId: 'pratique_',
        modifierListe: (mutateur) => db.modifier(cle('pratiquesConfigurables'), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement par forkerItem — aucune source externe
        repliSource: async (idSource) => (
            typeof obtenirConfigurationPratiqueParId === 'function'
                ? await obtenirConfigurationPratiqueParId(idSource)
                : null
        ),
        rafraichirListe: async () => {
            if (typeof afficherListePratiquesSidebar === 'function') await afficherListePratiquesSidebar();
        },
        chargerPourModif: async (idCopie) => { await chargerPratiquePourModif(idCopie); },
        champFocus: 'mat-pratique-nom'
    });
}

/**
 * Remplit tous les champs du formulaire avec les données de la pratique
 */
function remplirFormulairePratique(pratique) {
    // 🆕 FIX #4 (20 jan 2026) : Bloquer les sauvegardes pendant le remplissage
    enChargementFormulaire = true;

    // Normalisation à la lecture (A-2 4c) : type canonique pour les branches de
    // configuration, tout en restant tolérant aux données legacy non migrées.
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(pratique.type) : pratique.type);

    // En-tête
    const titrePratique = document.getElementById('mat-titre-pratique');
    const badgePratique = document.getElementById('mat-badge-pratique');
    const descriptionPratique = document.getElementById('mat-description-pratique');

    if (titrePratique) titrePratique.textContent = pratique.nom || 'Sans titre';
    if (badgePratique) badgePratique.innerHTML = genererBadgeTypePratique(pratique);
    // Ligne 2 : description personnalisée ou description taxonomique
    if (descriptionPratique) {
        descriptionPratique.textContent = pratique.description || obtenirDescriptionCourtePratique(pratique);
    }

    // Informations de base
    setValeurChamp('mat-pratique-nom', pratique.nom || '');
    // Volet B étape 2 : le <select> mat-pratique-type est désormais en valeurs canoniques.
    // On normalise pratique.type à la lecture pour qu'une pratique stockée en legacy
    // (pan-standards…) retrouve son option (standards…) sans rester non sélectionnée.
    setValeurChamp('mat-pratique-type', (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(pratique.type) : pratique.type) || '');
    setValeurChamp('mat-pratique-description', pratique.description || '');
    setValeurChamp('mat-pratique-discipline', pratique.discipline || '');

    // Affichage note
    const affNote = pratique.affichageNote || pratique.configuration?.affichageNote || 'complet';
    const radioComplet = document.getElementById('mat-affichage-note-complet');
    const radioLettre = document.getElementById('mat-affichage-note-lettre');
    if (affNote === 'lettre' && radioLettre) radioLettre.checked = true;
    else if (radioComplet) radioComplet.checked = true;

    // Toggle Provisoire/Finale (lit configuration.notesFinales)
    setCheckbox('mat-notes-finales', pratique.configuration?.notesFinales === true);

    // Afficher la description taxonomique selon le type
    afficherDescriptionTaxonomiqueMat(pratique.type);

    // Afficher les sections de configuration selon le type
    afficherConfigurationTypeMat(pratique.type);

    // Remplir les champs selon le type (comparaisons sur la forme canonique)
    if (typeCanon === 'standards') {
        const config = pratique.configuration || {};

        // 🆕 #24 : Déterminer le mode de sélection (hybride a priorité)
        const estHybride = config.portfolio?.hybride || config.categories?.actif || false;
        let modeSelection = config.portfolio?.methodeSelection || 'meilleurs';
        if (estHybride) modeSelection = 'hybride';

        // #435 (9 août 2026) — NORMALISATION des pratiques legacy, extension de
        // #396 (décision Grégoire, 9 août) : le mode « par-objectifs » est
        // retiré de l'application, moteur compris — il n'a jamais pu calculer
        // (appariement par un `objectifId` qu'aucun code n'écrit). Une pratique
        // stockée qui le porte encore s'ouvre sur son mode de sélection réel
        // (`methodeSelection`), avec un avertissement console. LECTURE SEULE :
        // aucune écriture tant que l'utilisateur ne sauvegarde pas lui-même —
        // même patron que la normalisation de `pan_par_objectif` (#396).
        if (config.varianteCalcul === 'par-objectifs' || config.parObjectifs) {
            console.warn('[Pratiques] Mode « par-objectifs » retiré (#435) : la pratique « '
                + (pratique.nom || pratique.id) + ' » est affichée avec son mode de sélection « '
                + modeSelection + ' ». Sa configuration parObjectifs est ignorée.');
        }

        // Le mode de sélection se pose TOUJOURS — y compris sans `config.portfolio`,
        // ce qui est précisément le cas d'une pratique par objectifs.
        setValeurChamp('mat-portfolio-selection', modeSelection);
        appliquerModeSelectionMat(modeSelection);

        // Portfolio
        // 🆕 Beta 95.7 : Accepter noms wizard (nbArtefacts*) ET noms legacy (nombreARetenir/nombreTotal) (#4)
        if (config.portfolio) {
            const valNombre = config.portfolio.nbArtefactsRetenus || config.portfolio.nombreARetenir || 5;

            setValeurChamp('mat-portfolio-nombre', valNombre);
            setValeurChamp('mat-portfolio-minimum', config.portfolio.minAvantCalculFormatif || config.portfolio.minimumCompletion || 7);
            setValeurChamp('mat-portfolio-total', config.portfolio.nbArtefactsSoumis || config.portfolio.nombreTotal || 10);
            // (#900, lot N6 : la case `mat-decoupler-pn` n'existait plus dans la page ; `decouplerPN` n'est plus écrit.)
        }

        // 🆕 Beta 95.4 : Catégories Sélection/Obligatoires
        // 🆕 #24 : Support du flag hybride depuis le wizard
        const categoriesActif = config.categories?.actif || config.portfolio?.hybride || false;
        if (config.categories || categoriesActif) {
            setCheckbox('mat-categories-actif', categoriesActif);
            setValeurChamp('mat-selection-nombre', config.categories?.selection?.nombreARetenir || 4);
            setValeurChamp('mat-selection-ponderation', config.categories?.selection?.ponderation || 65);
            setValeurChamp('mat-obligatoires-ponderation', config.categories?.obligatoires?.ponderation || 35);
            toggleCategoriesMat(); // Afficher/masquer les détails
        }

    }
    // Note : sommative n'a pas de section ici — aucune configuration spécifique requise
    //        (utilise uniquement les pondérations des productions)

    if (typeCanon === 'specifications') {
        const config = pratique.configuration || {};

        // Seuil
        // #935 (lot N6) : la valeur que la pratique PORTE, sous l'un ou l'autre nom, dans l'ordre du moteur
        // (`pratique-pan-specifications.js`). Lire le seul `seuilAcceptable` montrait 75 pour une pratique
        // de l'assistant créée à 70 — et l'enregistrer écrivait 75, qui l'emportait.
        const seuilPorte = (typeof config.seuilAcceptable === 'number') ? config.seuilAcceptable
            : (typeof config.seuilAcceptabilite === 'number' ? config.seuilAcceptabilite : null);
        // #935 (15 oct. 2026, Grégoire) : sans seuil, 100 % — une copie est satisfaisante quand toutes ses spécifications sont respectées ; un seuil écrit à 0 reste 0.
        setValeurChamp('mat-spec-seuil', seuilPorte !== null ? seuilPorte : 100);

        // Types de travaux
        afficherTypesTravauxMat(config.typesTravaux || []);

        // Forfaits
        afficherForfaitsMat(config.forfaits || [], config.typesTravaux || []);
    }

    // #343-T1 — DEN éditable inline. Cibles, méthode de suggestion, grille de
    // rétroaction. L'échelle utilise la carte commune (mat-echelle-id) plus bas.
    // #717 : les cibles s'éditent par le composant commun, chacune avec son id.
    if (typeCanon === 'denotation') {
        const config = pratique.configuration || {};
        window.EditeurCibles.poser(document.getElementById('mat-den-cibles'), config.objectifs);
        setValeurChamp('mat-den-suggestion', config.suggestion?.methode || 'mode');
        setValeurChamp('mat-den-grille', config.grilleId || '');
    } else {
        // La liste ne garde pas les cibles d'une autre pratique ouverte avant celle-ci.
        window.EditeurCibles.poser(document.getElementById('mat-den-cibles'), []);
    }

    // Échelle de performance
    if (pratique.configuration?.echelleId) {
        setValeurChamp('mat-echelle-id', pratique.configuration.echelleId);
        afficherPreviewEchelleMat();
        peuplerDropdownNoteMaximaleMat(); // 🆕 Beta 95.7 : Peupler dropdown note maximale
    }

    // Système de jetons
    const jetons = pratique.jetons || {};
    setCheckbox('mat-jetons-actif', jetons.actif || false);
    toggleSystemeJetonsMat(); // Afficher/masquer le contenu
    setValeurChamp('mat-jetons-nombre', jetons.nombre || 2);  // 🆕 Beta 95.7 : défaut 2
    setValeurChamp('mat-delai-duree', jetons.delaiDuree || 2);  // 🆕 Beta 95.7 : défaut 2 jours
    setCheckbox('mat-delai-sur-reprise', jetons.delaiSurReprise === true);  // #853 : absent = non (comportement antérieur)
    // Radio pour l'évaluation originale
    const radioArchiver = document.querySelector('input[name="mat-reprise-originale"][value="archiver"]');
    const radioSupprimer = document.querySelector('input[name="mat-reprise-originale"][value="supprimer"]');
    if (jetons.repriseOriginale === 'supprimer' && radioSupprimer) {
        radioSupprimer.checked = true;
    } else if (radioArchiver) {
        radioArchiver.checked = true;
    }
    setCheckbox('mat-jeton-ciblee-actif', jetons.cibleeActif !== false);
    setValeurChamp('mat-ciblee-plafond', jetons.cibleePlafond || ''); // 🆕 Beta 95.7 : Pas de défaut, l'utilisateur doit choisir
    // #853 (relecture de Cowork) : jetons réglés à la création (assistant, import) → ce formulaire
    // est inerte pour le moteur. On le DIT, et on désactive ses champs, au lieu de laisser cocher en vain.
    const jetonsAilleurs = jetonsReglesAilleurs(pratique);
    const noteAilleurs = document.getElementById('mat-jetons-regles-ailleurs');
    if (noteAilleurs) noteAilleurs.classList.toggle('u-hide', !jetonsAilleurs);
    CHAMPS_JETONS_MAT.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = jetonsAilleurs; });
    document.querySelectorAll('input[name="mat-reprise-originale"]').forEach(r => { r.disabled = jetonsAilleurs; });

    // 🆕 Beta 95.4 : Afficher le panneau métadonnées CC
    const panneauMeta = document.getElementById('panneauMetadonneesPratique');
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function') {
        panneauMeta.innerHTML = genererPanneauMetadonnees(pratique, 'pratique');
    }

    // 🆕 FIX #4 (20 jan 2026) : Débloquer les sauvegardes après le remplissage
    enChargementFormulaire = false;
}

/**
 * Utilitaires pour manipuler les champs
 */
function setValeurChamp(id, valeur) {
    const el = document.getElementById(id);
    if (el) el.value = valeur;
}

function setCheckbox(id, valeur) {
    const el = document.getElementById(id);
    if (el) el.checked = valeur;
}

function getValeurChamp(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function getCheckbox(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

/**
 * #853 (relecture de Cowork, 13 sept. 2026) — la pratique porte-t-elle des jetons réglés
 * AILLEURS que dans ce formulaire ? Le moteur (`obtenirConfigJetonsPratique`) lit
 * `configuration.jetons` (assistant), puis `config.jetons`, et seulement ensuite le bloc plat
 * `jetons` que ce formulaire écrit. Si l'un des deux premiers existe, le formulaire est inerte :
 * on le dit à l'écran et on n'écrit rien (cause profonde : #854).
 */
function jetonsReglesAilleurs(pratique) {
    return !!(pratique && ((pratique.configuration && pratique.configuration.jetons)
        || (pratique.config && pratique.config.jetons)));
}

// #900 (lot N6) : les cases « Jetons de délai » et « Jetons de reprise » sont retirées — le moteur
// (`evaluation-jetons.js`) ne lisait ni `delaiActif` ni `repriseActif`. Le titre de chaque type reste.
const CHAMPS_JETONS_MAT = ['mat-jetons-actif', 'mat-jetons-nombre', 'mat-delai-duree',
    'mat-delai-sur-reprise', 'mat-jeton-ciblee-actif', 'mat-ciblee-plafond'];

/**
 * Affiche la description taxonomique selon le type de pratique
 * Note: Carte retirée du formulaire - info maintenant dans la sidebar
 * Fonction conservée pour compatibilité mais ne fait plus rien
 */
function afficherDescriptionTaxonomiqueMat(type) {
    // Description taxonomique maintenant affichée dans la sidebar
    // Cette fonction est conservée pour éviter les erreurs d'appel
    return;
}

/**
 * Affiche les sections de configuration selon le type
 */
function afficherConfigurationTypeMat(type) {
    // Normalisation à la lecture (A-2 4c) : le select peut encore livrer une
    // valeur legacy (pan-standards…) tant que le Temps 2 n'est pas fait.
    // Les ids DOM ci-dessous (mat-config-pan-standards…) sont des identifiants
    // d'éléments HTML, PAS des id de pratique — ils restent tels quels.
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(type) : type);

    // Cacher toutes les sections (style.display pour surcharger le style inline du HTML)
    const sections = ['mat-config-pan-standards', 'mat-config-sommative', 'mat-config-pan-specifications', 'mat-config-denotation', 'mat-config-defaut'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // (#434, 9 août 2026 : le bloc « Variante PAN-Standards » est retiré — le
    //  mode de sélection vit dans la section `mat-config-pan-standards`, dont
    //  la visibilité est déjà pilotée juste en dessous.)

    // Afficher la section appropriée
    let configId = 'mat-config-defaut';
    if (typeCanon === 'standards') {
        configId = 'mat-config-pan-standards';
    } else if (typeCanon === 'sommative') {
        configId = 'mat-config-sommative';
    } else if (typeCanon === 'specifications') {
        configId = 'mat-config-pan-specifications';
    } else if (typeCanon === 'denotation') {
        configId = 'mat-config-denotation';
    }

    const config = document.getElementById(configId);
    if (config) config.style.display = '';
}

/* ===============================
   HANDLERS DU FORMULAIRE (préfixe mat-)
   =============================== */

/**
 * Handler : Changement du type de pratique
 */
function changerTypePratiqueMat() {
    const type = getValeurChamp('mat-pratique-type');
    afficherDescriptionTaxonomiqueMat(type);
    afficherConfigurationTypeMat(type);

    // Mettre à jour le badge (comparaison sur la forme canonique ; le select
    // peut encore livrer une valeur legacy tant que le Temps 2 n'est pas fait).
    const badge = document.getElementById('mat-badge-pratique');
    if (badge) {
        const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(type) : type);
        const pratiques = typeCanon === 'standards' ? ['STD'] :
                         typeCanon === 'specifications' ? ['SPE'] :
                         typeCanon === 'sommative' ? ['SOM'] :
                         typeCanon === 'denotation' ? ['DEN'] : [];
        badge.innerHTML = genererBadgeTypePratique({ pratiques });
    }

    // Mettre à jour la description (ligne 2)
    const descriptionPratique = document.getElementById('mat-description-pratique');
    if (descriptionPratique) {
        // Utiliser la description personnalisée si disponible, sinon la taxonomique
        const descCustom = getValeurChamp('mat-pratique-description');
        descriptionPratique.textContent = descCustom || obtenirDescriptionCourtePratique({ type });
    }

    sauvegarderConfigPratiqueMat();
}

/**
 * Handler : Mise à jour du nom
 */
async function mettreAJourNomPratiqueMat() {
    const nouveauNom = getValeurChamp('mat-pratique-nom');
    if (!pratiqueEnEditionMateriel) return;

    // #522 — le nom, la description et la discipline sont trois champs voisins
    // du même formulaire : les quitter l'un après l'autre est le geste qui
    // lançait deux enregistrements sur le même instantané.
    let ecrit = false;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        configurations[index].nom = nouveauNom;
        ecrit = true;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });

    if (ecrit) {
        // Mettre à jour le titre et la sidebar
        const titre = document.getElementById('mat-titre-pratique');
        if (titre) titre.textContent = nouveauNom;
        await afficherListePratiquesMateriel();
    }
}

/**
 * Handler : Mise à jour de la description
 */
async function mettreAJourDescriptionPratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    const nouvelleDescription = getValeurChamp('mat-pratique-description');

    let pratiqueApres = null;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        configurations[index].description = nouvelleDescription;
        pratiqueApres = configurations[index];
        return configurations;
    }, [], { geste: 'Modifier la pratique' });

    if (pratiqueApres) {
        // Mettre à jour l'en-tête
        const descriptionPratique = document.getElementById('mat-description-pratique');
        if (descriptionPratique) {
            descriptionPratique.textContent = nouvelleDescription || obtenirDescriptionCourtePratique(pratiqueApres);
        }
    }
}

/**
 * Handler : Mise à jour de la discipline
 */
async function mettreAJourDisciplinePratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    const discipline = getValeurChamp('mat-pratique-discipline');
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        configurations[index].discipline = discipline;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });
}

/**
 * Sauvegarde la configuration complète de la pratique
 */
async function sauvegarderConfigPratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    // 🆕 FIX #4 (20 jan 2026) : Ne pas sauvegarder pendant le remplissage du formulaire
    if (enChargementFormulaire) {
        return;
    }

    // Phase 4.C : interdire références à des items démo (Plan §3.4)
    const echelleIdCourante = getValeurChamp('mat-echelle-id');
    if (echelleIdCourante && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.verifierReferencesPasDemo) {
        const violationDemo = BibliothequeUI.verifierReferencesPasDemo([
            { id: echelleIdCourante, collection: 'echellesTemplates', labelType: 'échelle' }
        ], { cible: cle('pratiquesConfigurables') });   // chantier du démo : écrire dans la démo n'est pas refusé
        if (violationDemo) {
            notifications.erreur('Référence démo non autorisée', violationDemo.message);
            // Revert le champ pour que l'utilisateur ne soit pas bloqué
            setValeurChamp('mat-echelle-id', '');
            return;
        }
    }

    // #522 (30 août 2026) — dix champs de ce formulaire portent
    // `data-on-change` vers cette fonction, et les tableaux voisins écrivent la
    // MÊME collection : la lecture, les mutations et l'écriture doivent tenir
    // dans la file par clé. Le corps est extrait tel quel dans
    // `appliquerFormulaireDansCollection`, qui est le mutateur.
    // #717 (2c) : retirer une cible cochée change la note — la question AVANT d'écrire.
    // « Annuler » n'écrit rien et remet la liste enregistrée à l'écran.
    const typeCanonEdite = (typeof normaliserIdPratique === 'function')
        ? normaliserIdPratique(getValeurChamp('mat-pratique-type')) : getValeurChamp('mat-pratique-type');
    if (typeCanonEdite === 'denotation') {
        const enregistree = (db.getSync(cle('pratiquesConfigurables'), null) || []).find(p => p.id === pratiqueEnEditionMateriel);
        const anciennes = (enregistree && enregistree.configuration && enregistree.configuration.objectifs) || [];
        const conteneur = document.getElementById('mat-den-cibles');
        const cibles = window.EditeurCibles.lire(conteneur);
        // Lot N6 : zéro cible ne s'enregistre pas (même règle que l'assistant, lue dans le
        // composant). La liste reste à l'écran telle quelle : c'est là qu'on ajoute la cible.
        const motif = window.EditeurCibles.motifRefus(cibles);
        if (motif) {
            notifications.erreur('Aucune cible', motif);
            return false;
        }
        if (!(await window.EditeurCibles.confirmerRetraits(pratiqueEnEditionMateriel, anciennes, cibles))) {
            window.EditeurCibles.poser(conteneur, anciennes);
            return false;
        }
    }

    await modifierEtAnnoncer(cle('pratiquesConfigurables'), appliquerFormulaireDansCollection, [], { geste: 'Modifier la pratique' });
    rendreChainePratique();   // #1149, lot 3b : l'échelle choisie, une conversion vers DEN
    return true;
}

/**
 * Applique les champs du formulaire à la pratique en édition.
 *
 * ⚠ C'est le MUTATEUR de `db.modifier` : il reçoit la collection lue DANS la
 * file et rend celle à écrire — ou `undefined` pour ne rien écrire du tout.
 * Il lit le DOM, mais n'attend rien : la file ne doit pas rester ouverte sur
 * une opération asynchrone.
 *
 * @param {Array|null} lues - la collection lue par la file
 * @returns {Array|undefined} la collection à écrire, ou `undefined` (refus)
 */
function appliquerFormulaireDansCollection(lues) {
    const configurations = lues || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) {
        console.warn('[pratiques-gestion] ⚠️ Pratique en édition introuvable:', pratiqueEnEditionMateriel);
        return undefined;
    }

    const type = getValeurChamp('mat-pratique-type');
    // NB (A-2 4c) : on persiste `type` tel quel (legacy tant que le select n'est
    // pas canonisé au Temps 2, fusionné avec 4d). typeCanon ne sert qu'aux
    // comparaisons internes, qui restent ainsi correctes legacy OU migré.
    configurations[index].type = type;
    const typeCanon = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(type) : type);

    // Affichage note
    configurations[index].affichageNote =
        document.querySelector('input[name="mat-affichage-note"]:checked')?.value || 'complet';

    // Mettre à jour pratiques[]
    configurations[index].pratiques = typeCanon === 'standards' ? ['STD'] :
                                      typeCanon === 'specifications' ? ['SPE'] :
                                      typeCanon === 'sommative' ? ['SOM'] :
                                      typeCanon === 'denotation' ? ['DEN'] : [];

    // Initialiser la configuration si absente
    if (!configurations[index].configuration) {
        configurations[index].configuration = {};
    }

    // Toggle Provisoire/Finale (pilote le titre du bloc Note dans le PDF rétroaction
    // via construireNoteProvisoire → renderRangeeNote).
    configurations[index].configuration.notesFinales = getCheckbox('mat-notes-finales');

    // Sauvegarder selon le type (comparaison canonique)
    if (typeCanon === 'standards') {
        // #434 — le mode de sélection est la SEULE saisie. #900 (lot N6) : sa projection
        // `varianteCalcul` n'est plus écrite — le moteur a cessé de la lire avec #435. Une
        // pratique qui la porte la garde (on n'efface pas), sans lecteur.
        const modeSelection = getValeurChamp('mat-portfolio-selection') || 'meilleurs';

        // Configuration Portfolio (#435 : plus de branche « par objectifs » —
        // le portfolio est LA configuration STD, toujours écrite)
        {
            const decouplerAvant = configurations[index].configuration.portfolio?.decouplerPN;
            configurations[index].configuration.portfolio = {
                methodeSelection: modeSelection,
                nombreARetenir: parseInt(getValeurChamp('mat-portfolio-nombre')) || 5,
                minimumCompletion: parseInt(getValeurChamp('mat-portfolio-minimum')) || 7,
                nombreTotal: parseInt(getValeurChamp('mat-portfolio-total')) || 10
            };
            // #900 (lot N6) : `decouplerPN` n'est plus écrit ; une pratique qui le porte le garde.
            if (decouplerAvant !== undefined) configurations[index].configuration.portfolio.decouplerPN = decouplerAvant;

            // 🆕 Beta 95.4 : Configuration Catégories Sélection/Obligatoires
            const categoriesActif = getCheckbox('mat-categories-actif');
            configurations[index].configuration.categories = {
                actif: categoriesActif,
                selection: {
                    nombreARetenir: parseInt(getValeurChamp('mat-selection-nombre')) || 4,
                    ponderation: parseInt(getValeurChamp('mat-selection-ponderation')) || 65
                },
                obligatoires: {
                    ponderation: parseInt(getValeurChamp('mat-obligatoires-ponderation')) || 35
                }
            };
        }

        // (#435 : la branche de sauvegarde « Par objectifs » est retirée avec le
        //  mode. Une config legacy `parObjectifs` déjà stockée n'est NI relue NI
        //  réécrite ici — elle reste inerte tant que l'utilisateur ne sauvegarde
        //  pas, et la normalisation d'ouverture l'a signalée en console.)
    } else if (typeCanon === 'specifications') {
        const seuilSaisi = parseInt(getValeurChamp('mat-spec-seuil'));   // #935 : défaut 100, un 0 reste 0
        configurations[index].configuration.seuilAcceptable = Number.isFinite(seuilSaisi) ? seuilSaisi : 100;
        // typesTravaux et forfaits sont gérés par leurs propres fonctions
    } else if (typeCanon === 'denotation') {
        // #343-T1 — DEN éditée inline. MÊME forme de config que la création assistant
        // (creerPratiqueV2) : la note finale reste un jugement saisi ; cibles = critères
        // explicites ; échelle/grille = rétroaction (n'entrent pas dans le calcul).
        // #717 : chaque cible garde l'id reçu à sa création (EditeurCibles).
        const cibles = window.EditeurCibles.lire(document.getElementById('mat-den-cibles'));
        configurations[index].configuration.type = 'denotation';
        configurations[index].configuration.modeDEN = 'eliminee';
        configurations[index].configuration.objectifs = cibles;
        configurations[index].configuration.suggestion = { methode: getValeurChamp('mat-den-suggestion') || 'mode' };
        configurations[index].configuration.grilleId = getValeurChamp('mat-den-grille') || null;
        // Le moteur DEN se déclenche sur calcul_note.methode='jugement_global' (racine,
        // skill §8/§10) ; on le pose pour rester valide à l'édition ET à une conversion vers DEN.
        configurations[index].calcul_note = { methode: 'jugement_global' };
    }

    // Échelle
    configurations[index].configuration.echelleId = getValeurChamp('mat-echelle-id');

    // Système de jetons
    // #853 (relecture de Cowork) : jetons réglés ailleurs (assistant, import) → le moteur ne lit pas le
    // bloc plat ; on n'en fabrique pas un qu'il ignorerait (cause profonde : #854).
    if (!jetonsReglesAilleurs(configurations[index])) {
    const repriseOriginale = document.querySelector('input[name="mat-reprise-originale"]:checked');
    const jetonsAvant = configurations[index].jetons || {};
    configurations[index].jetons = {
        actif: getCheckbox('mat-jetons-actif'),
        nombre: parseInt(getValeurChamp('mat-jetons-nombre')) || 2,  // 🆕 Beta 95.7 : défaut 2
        delaiDuree: parseInt(getValeurChamp('mat-delai-duree')) || 2,  // 🆕 Beta 95.7 : défaut 2 jours
        delaiSurReprise: getCheckbox('mat-delai-sur-reprise'),  // #853 : réglage de la pratique
        repriseOriginale: repriseOriginale ? repriseOriginale.value : 'archiver',
        cibleeActif: getCheckbox('mat-jeton-ciblee-actif'),
        cibleePlafond: getValeurChamp('mat-ciblee-plafond') || ''  // 🆕 Beta 95.7 : pas de défaut
    };
    // #900 (lot N6) : les cases « actif » du délai et de la reprise sont retirées (aucun lecteur) ; une
    // pratique qui porte leurs valeurs les garde — on cesse d'écrire, on n'efface pas.
    for (const cleMorte of ['delaiActif', 'repriseActif']) {
        if (jetonsAvant[cleMorte] !== undefined) configurations[index].jetons[cleMorte] = jetonsAvant[cleMorte];
    }
    }

    // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
    if (typeof ajouterContributeurSiNecessaire === 'function') {
        configurations[index] = ajouterContributeurSiNecessaire(configurations[index]);
    }

    // L'écriture est faite par la file, qui écrit dans les deux stores.
    // ⚠ L'ancien repli `catch → db.setSync` est retiré avec elle : réécrire la
    // collection hors de la file après un échec d'écriture y remettrait
    // exactement l'instantané que la file sert à ne plus perdre.
    return configurations;
}

/* ===============================
   ÉCHELLES DE PERFORMANCE
   =============================== */

/**
 * Charge le dropdown des échelles
 * ✅ FIX (10 jan 2026) : N'affiche que les échelles dans la sidebar (dansBibliotheque !== false)
 */
async function chargerDropdownEchellesMat() {
    const select = document.getElementById('mat-echelle-id');
    if (!select) return;

    let echelles = [];
    try {
        const toutesEchelles = await db.get(cle('echellesTemplates')) || [];
        // Filtrer pour n'afficher que les échelles dans la sidebar
        echelles = toutesEchelles.filter(e => e.dansBibliotheque !== false);
    } catch (e) {
        echelles = [];
    }

    let html = '<option value="">-- Sélectionner une échelle --</option>';
    echelles.forEach(e => {
        html += `<option value="${echapperHtml(e.id)}">${echapperHtml(e.nom || 'Sans nom')}</option>`;
    });

    select.innerHTML = html;
}

/**
 * #343-T1 — Peuple le sélecteur de grille de la section DEN (rétroaction optionnelle).
 * Modelé sur chargerDropdownEchellesMat. Grilles depuis `grillesTemplates`.
 */
async function chargerDropdownGrillesMat() {
    const select = document.getElementById('mat-den-grille');
    if (!select) return;

    let grilles = [];
    try {
        const toutes = await db.get(cle('grillesTemplates')) || [];
        grilles = toutes.filter(g => g.dansBibliotheque !== false);
    } catch (e) {
        grilles = [];
    }

    let html = '<option value="">— Aucune —</option>';
    grilles.forEach(g => {
        html += `<option value="${echapperHtml(g.id)}">${echapperHtml(g.nom || 'Sans nom')}</option>`;
    });

    select.innerHTML = html;
}

/**
 * Affiche l'aperçu de l'échelle sélectionnée
 */
async function afficherPreviewEchelleMat() {
    const echelleId = getValeurChamp('mat-echelle-id');
    const preview = document.getElementById('mat-preview-echelle');
    const contenu = document.getElementById('mat-preview-echelle-contenu');

    if (!preview || !contenu) return;

    if (!echelleId) {
        preview.classList.add('u-hide');
        return;
    }

    let echelles = [];
    try {
        echelles = await db.get(cle('echellesTemplates')) || [];
    } catch (e) {
        echelles = [];
    }

    const echelle = echelles.find(e => e.id === echelleId);
    if (!echelle || !echelle.niveaux) {
        preview.classList.add('u-hide');
        return;
    }

    let html = '';
    echelle.niveaux.forEach(n => {
        html += `<div style="margin-bottom: 4px;"><span style="font-weight: 600;">${echapperHtml(n.code || n.nom)}</span>: ${echapperHtml(n.nom)}</div>`;
    });

    contenu.innerHTML = html;
    preview.classList.remove('u-hide');

    // 🆕 FIX #4 (20 jan 2026) : NE PAS sauvegarder ici !
    // Cette fonction est appelée pendant remplirFormulairePratique()
    // Sauvegarder à ce moment écrase les valeurs avec les défauts du formulaire
    // La sauvegarde se fait via les onchange des champs individuels
}

/**
 * 🆕 Beta 95.7 : Peuple le dropdown "Note maximale" avec les niveaux de l'échelle sélectionnée
 * Utilise db.getSync() pour être synchrone (compatible avec remplirFormulairePratique)
 */
function peuplerDropdownNoteMaximaleMat() {
    const select = document.getElementById('mat-ciblee-plafond');
    if (!select) return;

    const echelleId = getValeurChamp('mat-echelle-id');

    if (!echelleId) {
        select.innerHTML = '<option value="">— Sélectionner l\'échelle d\'abord —</option>';
        return;
    }

    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle || !echelle.niveaux) {
        select.innerHTML = '<option value="">— Échelle sans niveaux —</option>';
        return;
    }

    // Construire les options avec code et nom
    let html = '<option value="">— Sélectionner —</option>';
    echelle.niveaux.forEach(n => {
        const label = n.code ? `${n.code} (${n.nom})` : n.nom;
        const value = n.code || n.nom;
        html += `<option value="${echapperHtml(value)}">${echapperHtml(label)}</option>`;
    });

    select.innerHTML = html;
}

/* ===============================
   PAN-SPÉCIFICATIONS : Types de travaux
   =============================== */

/**
 * Affiche la liste des types de travaux
 */
function afficherTypesTravauxMat(typesTravaux) {
    const conteneur = document.getElementById('mat-spec-types-travaux-liste');
    if (!conteneur) return;

    if (!typesTravaux || typesTravaux.length === 0) {
        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun type de production défini</p>';
        return;
    }

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr><th>Nom</th><th>Description</th><th style="width: 80px;">Actions</th></tr></thead>';
    html += '<tbody>';

    typesTravaux.forEach((t, index) => {
        html += `
            <tr>
                <td><input type="text" class="controle-form" value="${echapperHtml(t.nom || '')}" data-on-change="modifierTypeTravailMatHandler" data-mat-index="${index}" data-champ="nom"></td>
                <td><input type="text" class="controle-form" value="${echapperHtml(t.description || '')}" data-on-change="modifierTypeTravailMatHandler" data-mat-index="${index}" data-champ="description"></td>
                <td style="text-align: center;">
                    <button data-action="supprimerTypeTravailMat" data-param="${index}" class="btn btn-supprimer btn-tres-compact"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

// #522 (30 août 2026) — LA COURSE DE #510, SUR LA CLÉ DES PRATIQUES.
//
// Les éditeurs qui suivent lisaient la collection entière, y changeaient une
// valeur et la réécrivaient entière. Or leurs champs portent `data-on-change` :
// le `change` part AU BLUR, donc au moment précis où l'on clique dans la
// cellule voisine. Deux enregistrements coup sur coup lisaient le même
// instantané, et le second réécrivait la collection SANS la modification du
// premier — sans erreur et sans message.
//
// ⚠⚠ ET `getSync` NE PROTÉGEAIT PAS, contrairement à ce que « lecture
// synchrone » laisse croire : dans `db.set`, l'écriture IndexedDB est ATTENDUE
// avant le rafraîchissement de localStorage. Pendant tout cet aller-retour,
// `getSync` rend encore l'ANCIENNE valeur. La fenêtre est étroite, et réelle.
//
// `db.modifier` sérialise la séquence entière PAR CLÉ (cf. db.js) — ce qui
// couvre aussi deux éditeurs DIFFÉRENTS du même écran (un type de travail et un
// forfait) qui écrivent la même collection.
// ⚠ Le mutateur rend `undefined` pour ANNULER l'écriture : une pratique ou un
// index introuvable ne doit pas réécrire la collection telle quelle.
async function ajouterTypeTravailMat() {
    if (!pratiqueEnEditionMateriel) return;

    let typesApres = null;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        if (!configurations[index].configuration) configurations[index].configuration = {};
        if (!configurations[index].configuration.typesTravaux) configurations[index].configuration.typesTravaux = [];

        const nouveauId = configurations[index].configuration.typesTravaux.length + 1;
        configurations[index].configuration.typesTravaux.push({
            id: nouveauId,
            nom: `Type ${nouveauId}`,
            description: ''
        });

        typesApres = configurations[index].configuration.typesTravaux;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });

    if (typesApres) afficherTypesTravauxMat(typesApres);
}

async function modifierTypeTravailMat(indexType, propriete, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        // ⚠ Les bornes du type, pas seulement l'existence du tableau : sans ce
        // test, un index hors bornes levait une TypeError (le banc l'a attrapé).
        const types = configurations[index].configuration?.typesTravaux;
        if (!types || !types[indexType]) return undefined;

        types[indexType][propriete] = valeur;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });
}

/**
 * #1015 (11 oct. 2026) — un type de travail entre dans la note des spécifications : s'il porte
 * déjà des notes (une évaluation porte sur une production de ce type), le codex est proposé
 * avant de le retirer, comme pour un critère ou un niveau (#1007, lot 2b). Un forfait, lui,
 * fixe la note de quiconque a des travaux de ses types : il porte des notes dès qu'un des
 * types de la pratique en porte. Lecture seule.
 */
function _typesPortentDesNotes(types) {
    return typeof window.ligneEmployeeParUneEvaluation === 'function'
        && (types || []).some(t => t && window.ligneEmployeeParUneEvaluation({ typeTravail: t }));
}

function _pratiqueEnEditionLue() {
    return (db.getSync(cle('pratiquesConfigurables'), []) || []).find(p => p && p.id === pratiqueEnEditionMateriel) || null;
}

async function supprimerTypeTravailMat(indexType) {
    if (!pratiqueEnEditionMateriel) return;
    const typeLu = ((_pratiqueEnEditionLue() || {}).configuration?.typesTravaux || [])[indexType];
    const porteDesNotes = !!typeLu && _typesPortentDesNotes([typeLu]);
    if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('typeTravail'))) return;

    let typesApres = null;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1 || !configurations[index].configuration?.typesTravaux) return undefined;
        // #1015 — relu après l'attente : si la ligne a changé pendant la fenêtre, rien n'est retiré.
        if (typeLu && JSON.stringify(configurations[index].configuration.typesTravaux[indexType]) !== JSON.stringify(typeLu)) return undefined;

        configurations[index].configuration.typesTravaux.splice(indexType, 1);
        typesApres = configurations[index].configuration.typesTravaux;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });

    if (typesApres) afficherTypesTravauxMat(typesApres);
}

/* ===============================
   PAN-SPÉCIFICATIONS : Forfaits
   =============================== */

/**
 * Affiche la table des forfaits
 */
function afficherForfaitsMat(forfaits, typesTravaux) {
    const conteneur = document.getElementById('mat-spec-forfaits-liste');
    if (!conteneur) return;

    if (!forfaits || forfaits.length === 0) {
        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun forfait défini</p>';
        return;
    }

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr><th>Lettre</th><th>Note (%)</th>';

    typesTravaux.forEach(t => {
        html += `<th>${echapperHtml(t.nom)}</th>`;
    });

    html += '<th style="width: 80px;">Actions</th></tr></thead>';
    html += '<tbody>';

    forfaits.forEach((f, index) => {
        html += `<tr>
            <td><input type="text" class="controle-form" value="${echapperHtml(f.lettre || '')}" style="width: 50px;" data-on-change="modifierForfaitMatHandler" data-mat-index="${index}" data-champ="lettre"></td>
            <td><input type="number" class="controle-form" value="${f.note || 0}" style="width: 60px;" data-on-change="modifierForfaitMatHandler" data-mat-index="${index}" data-champ="note"></td>`;

        typesTravaux.forEach(t => {
            const quantite = f.travaux?.[t.id] || 0;
            html += `<td><input type="number" class="controle-form" value="${quantite}" style="width: 50px;" min="0" data-on-change="modifierTravailForfaitMatHandler" data-mat-index="${index}" data-type-id="${t.id}"></td>`;
        });

        html += `<td style="text-align: center;"><button data-action="supprimerForfaitMat" data-param="${index}" class="btn btn-supprimer btn-tres-compact"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button></td></tr>`;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

async function ajouterForfaitMat() {
    if (!pratiqueEnEditionMateriel) return;

    let apres = null;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        if (!configurations[index].configuration) configurations[index].configuration = {};
        if (!configurations[index].configuration.forfaits) configurations[index].configuration.forfaits = [];

        const nouveauId = configurations[index].configuration.forfaits.length + 1;
        configurations[index].configuration.forfaits.push({
            id: nouveauId,
            lettre: String.fromCharCode(64 + nouveauId),
            note: 100 - (nouveauId - 1) * 10,
            travaux: {}
        });

        apres = configurations[index].configuration;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });

    if (apres) afficherForfaitsMat(apres.forfaits, apres.typesTravaux || []);
}

async function modifierForfaitMat(indexForfait, propriete, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    if (propriete === 'note') valeur = parseInt(valeur) || 0;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        const forfaits = configurations[index].configuration?.forfaits;
        if (!forfaits || !forfaits[indexForfait]) return undefined;

        forfaits[indexForfait][propriete] = valeur;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });
}

async function modifierTravailForfaitMat(indexForfait, typeTravailId, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    const quantite = parseInt(valeur) || 0;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        const forfaits = configurations[index].configuration?.forfaits;
        if (!forfaits || !forfaits[indexForfait]) return undefined;

        if (!forfaits[indexForfait].travaux) forfaits[indexForfait].travaux = {};
        forfaits[indexForfait].travaux[typeTravailId] = quantite;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });
}

async function supprimerForfaitMat(indexForfait) {
    if (!pratiqueEnEditionMateriel) return;
    const configLue = (_pratiqueEnEditionLue() || {}).configuration || {};
    const porteDesNotes = !!(configLue.forfaits || [])[indexForfait] && _typesPortentDesNotes(configLue.typesTravaux);
    if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('forfait'))) return;

    let apres = null;
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1 || !configurations[index].configuration?.forfaits) return undefined;
        // #1015 — relu après l'attente : si la ligne a changé pendant la fenêtre, rien n'est retiré.
        const forfaitLu = (configLue.forfaits || [])[indexForfait];
        if (forfaitLu && JSON.stringify(configurations[index].configuration.forfaits[indexForfait]) !== JSON.stringify(forfaitLu)) return undefined;

        configurations[index].configuration.forfaits.splice(indexForfait, 1);
        apres = configurations[index].configuration;
        return configurations;
    }, [], { geste: 'Modifier la pratique' });

    if (apres) afficherForfaitsMat(apres.forfaits, apres.typesTravaux || []);
}

/* ===============================
   MISE À JOUR DES CHAMPS
   =============================== */

async function mettreAJourNomPratique(nouveauNom) {
    if (!pratiqueEnEditionMateriel) return;

    let ecrit = false;
    await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        configurations[index].nom = nouveauNom;
        ecrit = true;
        return configurations;
    }, []);

    if (ecrit) {
        // Mettre à jour le titre dans l'interface
        const titre = document.getElementById('titreEditionPratique');
        if (titre) titre.textContent = nouveauNom;

        // Rafraîchir la sidebar
        await afficherListePratiquesMateriel();
    }
}

async function mettreAJourDescriptionPratique(nouvelleDescription) {
    if (!pratiqueEnEditionMateriel) return;

    await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        configurations[index].description = nouvelleDescription;
        return configurations;
    }, []);
}

async function mettreAJourDisciplinePratique(nouvelleDiscipline) {
    if (!pratiqueEnEditionMateriel) return;

    await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        const configurations = lues || [];
        const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);
        if (index === -1) return undefined;

        configurations[index].discipline = nouvelleDiscipline;
        return configurations;
    }, []);
}

/* ===============================
   ACTIONS SUR LES PRATIQUES
   =============================== */

/**
 * Duplique une pratique existante
 */
async function dupliquerPratiqueMateriel(pratiqueId) {
    let configurations = await db.get(cle('pratiquesConfigurables'), null) || [];
    const original = configurations.find(p => p.id === pratiqueId);

    if (!original) {
        console.error('[pratiques-gestion] Pratique à dupliquer introuvable:', pratiqueId);
        return;
    }

    // ✅ D3 + D4 + D7 (arbitrage du 24 août). Avant : le nom était concaténé à la
    // main (« X (copie) (copie) » au deuxième tour), et ni les métadonnées de
    // partage ni le drapeau `estGabarit` n'étaient retirés — la copie gardait la
    // licence de la source et sa nature de gabarit.
    const copie = JSON.parse(JSON.stringify(original));
    copie.id = genererIdUnique('pratique_');
    copie.nom = nommerCopie(original.nom, configurations);
    copie.auteur = BibliothequeUI.obtenirAuteurActif();
    copie.isDemo = false;
    copie.inspireDe = BibliothequeUI.forgerInspireDe(original);
    copie.dateCreation = new Date().toISOString();
    delete copie.metadata_cc;
    delete copie.auteurOriginal;
    delete copie.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source
    delete copie.estGabarit;

    // #522 — l'ajout de la copie se fait DANS la file : la collection lue plus
    // haut a servi à NOMMER la copie, elle ne doit pas servir à réécrire le tout.
    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        const fraiches = lues || [];
        fraiches.push(copie);
        return fraiches;
    }, [], { geste: 'Dupliquer la pratique' });

    await afficherListePratiquesMateriel();
    await chargerPratiquePourModif(copie.id);

    notifications.succes('Pratique dupliquée');
}

/**
 * Supprime une pratique
 */
async function supprimerPratiqueMateriel(pratiqueId) {
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('pratique'))) return;
    if (!confirm('Es-tu sûr de vouloir supprimer cette pratique ?')) {
        return;
    }

    await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => {
        return (lues || []).filter(p => p.id !== pratiqueId);
    }, [], { geste: 'Supprimer la pratique' });

    pratiqueEnEditionMateriel = null;

    // Rafraîchir et afficher l'accueil
    await afficherListePratiquesMateriel();

    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (conteneurEdition) conteneurEdition.classList.add('u-hide');
    if (accueil) accueil.classList.remove('u-hide');

    notifications.succes('Pratique supprimée');
}

/**
 * Applique une pratique au cours actif
 */
async function appliquerPratiqueAuCours(pratiqueId) {
    // Bug 31 mai : message explicite (l'ancien « Erreur lors de l'application »
    // n'expliquait pas la cause). On distingue les trois échecs possibles.
    if (!pratiqueId) {
        alert('Aucune pratique ouverte à appliquer. Ouvre d\'abord une pratique dans la liste, puis réessaie.');
        return;
    }
    if (typeof appliquerConfigurationPratique !== 'function') {
        alert('Fonction d\'application non disponible.');
        return;
    }

    const succes = await appliquerConfigurationPratique(pratiqueId);
    if (!succes) {
        alert('Impossible d\'appliquer cette pratique : sa configuration est introuvable dans la bibliothèque. Enregistre-la d\'abord dans la bibliothèque, puis réessaie.');
        return;
    }

    // #762 (6 sept. 2026) — « AU COURS ACTIF », ET C'EST ÉCRIT DANS LA SOURCE DE VÉRITÉ.
    // `appliquerConfigurationPratique` n'écrit que les modalités (portfolio, variante) et le
    // dit depuis #328 (e3179c41, 11 juin) : « seule l'activation par la SSOT change la
    // pratique active ». Or cette activation n'avait plus de bouton — les cartes « Activer »
    // vivaient dans `#listePratiques`, retiré de la page le 9 décembre 2025. L'enseignant
    // cliquait ce bouton (infobulle : « Définit cette pratique comme configuration active du
    // cours »), lisait un succès, et `groupesCours[].pratiqueId` restait null : l'application
    // calculait en « sommative » et le profil disait « introuvable » (rapport de Grégoire,
    // BUG_grégoire_2026-09-06_07-48-42 ; ses données : `pratiqueId: null`, champ 6 du
    // groupe-cours vide, aucun badge). Le bouton fait maintenant ce qu'il dit.
    try {
        await PratiqueManager.changerPratiqueActive(pratiqueId);
    } catch (e) {
        alert('La configuration est appliquée, mais la pratique n\'a pas pu être assignée au groupe-cours actif : ' + (e && e.message ? e.message : e));
        return;
    }
    // La barre latérale suit : le badge « Active » se pose sur la pratique assignée.
    await afficherListePratiquesMateriel();
    notifications.succes('Pratique appliquée au cours actif', 'C\'est elle qui calcule maintenant les notes et les indices de ce groupe-cours.');
}

/**
 * Sauvegarde les modifications de la pratique en cours
 */
async function sauvegarderPratiqueMateriel() {
    if (!pratiqueEnEditionMateriel) {
        console.warn('[pratiques-gestion] Aucune pratique en édition');
        return;
    }


    // Les modifications sont déjà sauvegardées au fur et à mesure
    // Cette fonction sert de confirmation visuelle

    notifications.succes('Pratique enregistrée');
}

/**
 * Partage une pratique (export JSON)
 */
async function partagerPratiqueMateriel(pratiqueId) {
    let configurations = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const pratique = configurations.find(p => p.id === pratiqueId);

    if (!pratique) {
        console.error('[pratiques-gestion] Pratique à partager introuvable');
        return;
    }

    const exportData = {
        version: '1.0',
        type: 'configuration-pratique',
        dateExport: new Date().toISOString(),
        configuration: pratique
    };

    // Beta 99.39 : Nommage standardisé via helper unifié (#262 Phase 2)
    const nomFichier = genererNomFichierExport('pratique', {
        nom: pratique.nom,
        inclureLicence: true,
        precisionDate: 'minute'
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes('Fichier de partage téléchargé');
}

/**
 * Exporte toutes les pratiques de l'utilisateur
 * MODIFIÉ (8 jan 2026) : Support métadonnées CC comme les autres modules
 */
async function exporterPratiquesUtilisateur() {
    const toutesConfigurations = db.getSync(cle('pratiquesConfigurables'), null) || [];

    // ✅ MODIFIÉ (8 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const configurations = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesConfigurations, 'pratique')
        : toutesConfigurations.filter(c => !c.estDemo && !c.auteurOriginal);
    const nbExclues = toutesConfigurations.length - configurations.length;

    if (configurations.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune pratique personnelle à exporter.\n\n${nbExclues} pratique(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune pratique à exporter.');
        }
        return;
    }

    // Informer si des pratiques ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // ✅ AJOUTÉ (8 jan 2026) : Demander métadonnées enrichies CC
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Pratiques de notation',
        `${configurations.length} pratique(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { pratiques: configurations },
        'pratiques',
        'Pratiques de notation',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('pratiques', { inclureLicence: true, precisionDate: 'minute' });

    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.succes(`${configurations.length} pratique(s) exportée(s) avec succès`);
}

/**
 * Importer des pratiques depuis un fichier JSON
 * MODIFIÉ (8 jan 2026) : Support métadonnées CC comme les autres modules
 * @param {Event} event - Événement du changement de fichier
 */
async function importerPratiquesUtilisateur(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale
            window._pratiquesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = typeof verifierLicenceCC === 'function' && verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // La classe `modal-import-pratiques` cible la fermeture sans
            // impacter la bibliothèque ouverte en arrière-plan.
            const modal = document.createElement('div');
            modal.classList.add('modal-import-pratiques');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px; padding: 20px;">
                        <div data-apercu-cc-slot style="margin-bottom: 15px;"></div>
                        <p><strong>Veux-tu importer ces pratiques de notation ?</strong></p>
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportPratiques">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportPratiques">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            if (estCC && window.ApercuSandbox && typeof genererBadgeCC === 'function') {
                const slot = modal.querySelector('[data-apercu-cc-slot]');
                if (slot) {
                    window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                        hauteurMin: 120,
                        hauteurMax: 500
                    });
                }
            } else if (!estCC && typeof avertirSansLicence === 'function') {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les pratiques
 * AJOUTÉ (8 jan 2026) : Fonction helper appelée depuis le modal de confirmation
 */
window.confirmerImportPratiques = async function(donnees) {
    try {
        let pratiquesImportees;

        // Extraire le contenu (supporter ancien format et nouveau format CC)
        if (donnees.contenu && donnees.contenu.pratiques) {
            // Nouveau format CC: { metadata, contenu: { pratiques: [...] } }
            pratiquesImportees = donnees.contenu.pratiques;
        } else if (donnees.configurations) {
            // Ancien format: { configurations: [...] }
            pratiquesImportees = donnees.configurations;
        } else {
            throw new Error('Format invalide: pratiques ou configurations non trouvées');
        }

        if (!Array.isArray(pratiquesImportees)) {
            throw new Error('Format invalide: les pratiques doivent être un tableau');
        }
        // #467 — un nom reçu n'entre pas brut dans la Bibliothèque (import-export.js).
        pratiquesImportees = pratiquesImportees.map(p => window.assainirImportJson(p, 'pratique'));

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequePratiques
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_PRATIQUES || 'bibliothequePratiques';
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

            for (const config of pratiquesImportees) {
                // Ajouter avec un nouvel ID si nécessaire
                if (!config.id) {
                    config.id = genererIdUnique('PRAT_');
                }
                idsImportes.push(config.id);

                const indexBiblio = bibliotheque.findIndex(c => c.id === config.id);
                if (indexBiblio >= 0) {
                    bibliotheque[indexBiblio] = { ...config, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                    nbMisesAJour++;
                } else {
                    bibliotheque.push({ ...config, dateAjoutBiblio: new Date().toISOString() });
                    nbAjoutees++;
                }
            }

            return bibliotheque;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE);   // lot F : geste hors témoin (confirmerImportPratiques)

        // #793 — la bibliothèque ouverte est redessinée, puis l'œil conduit aux cartes importées.
        const ligneMasquee = await BibliothequeUI.conduireAuxImportes(
            'modalBibliothequePratiques', afficherBibliothequePratiques, idsImportes);

        const details = [];
        if (nbAjoutees > 0) details.push(`${nbAjoutees} nouvelle(s) pratique(s) ajoutée(s).`);
        if (nbMisesAJour > 0) details.push(`${nbMisesAJour} pratique(s) mise(s) à jour.`);
        // #1156 — « Pratiques disponibles » n'existe plus : les mots des grilles, des échelles et des cartouches.
        details.push(ligneMasquee || 'Elles sont dans ta bibliothèque : « Utiliser dans ce trimestre » les ajoute à ce trimestre.');
        notifications.succes('Import réussi', details.join(' '));

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

/* ===============================
   SYSTÈME DE JETONS
   =============================== */

/**
 * Toggle la visibilité du contenu du système de jetons
 */
function toggleSystemeJetonsMat() {
    const checkbox = document.getElementById('mat-jetons-actif');
    const contenu = document.getElementById('mat-contenu-jetons');

    if (contenu) {
        toggleDisplay(contenu, checkbox && checkbox.checked);
    }
}

/**
 * Lot E1 (D3) : la case « Système de jetons », cochée par l'usager. Les jetons
 * s'enregistrent comme leurs voisins, au changement ; avant, seul « Enregistrer la
 * pratique » les écrivait, et quitter la fiche les perdait.
 * ⚠ Séparée de `toggleSystemeJetonsMat`, que le CHARGEMENT du formulaire appelle :
 * enregistrer depuis elle écrirait un formulaire à moitié rempli.
 */
function onJetonsActifChangeMat() {
    toggleSystemeJetonsMat();
    sauvegarderConfigPratiqueMat();
}

/**
 * 🆕 #24 : Gère le changement du mode de sélection portfolio
 * Active automatiquement les catégories si "hybride" est sélectionné
 */
// #434 (9 août 2026) — descriptions du mode de sélection. Elles viennent du
// champ legacy retiré en Phase D ; seules celles dont l'option existe encore
// sont conservées (« grille de profils » et « autre » n'ont jamais été des
// modes de sélection, elles décrivaient des intentions sans effet de calcul).
const DESCRIPTIONS_MODE_SELECTION = {
    'meilleurs':     'Les N meilleures évaluations sont retenues pour calculer la note finale. Valorise le progrès.',
    'derniers':      'Les N évaluations les plus récentes sont retenues. Valorise l\'état actuel de maîtrise.',
    'tous':          'Toutes les évaluations du portfolio comptent, sans sélection.',
    'hybride':       'Les N meilleures de la Sélection, plus les productions Obligatoires, avec une pondération par bloc.'
};

/**
 * Handler : changement du mode de sélection du portfolio.
 *
 * ⚠ #434 — c'est désormais l'UNIQUE commande de la construction de la note.
 * Elle a absorbé la bascule Portfolio ↔ Par-Objectifs, que portait le champ
 * legacy `mat-variante-calcul` retiré en Phase D. Ce champ était le SEUL
 * chemin qui révélait `mat-config-par-objectifs` : sans cette reprise, le mode
 * « Par objectifs » serait devenu inatteignable.
 */
function onPortfolioSelectionChangeMat() {
    const select = document.getElementById('mat-portfolio-selection');
    const checkbox = document.getElementById('mat-categories-actif');
    const mode = select ? select.value : '';

    if (mode === 'hybride' && checkbox && !checkbox.checked) {
        checkbox.checked = true;
        toggleCategoriesMat();
    }

    appliquerModeSelectionMat(mode);
    sauvegarderConfigPratiqueMat();
}

/**
 * Reflète le mode de sélection dans l'interface (description sous le sélecteur).
 *
 * Séparée du handler parce que le CHARGEMENT d'une pratique doit produire le
 * même écran qu'un changement manuel — sans repasser par une sauvegarde.
 *
 * (#435 : la bascule Portfolio ↔ Par-Objectifs qu'elle portait est retirée
 * avec le panneau et son moteur — extension de #396.)
 */
function appliquerModeSelectionMat(mode) {
    const descriptionDiv = document.getElementById('mat-portfolio-selection-description');
    if (!descriptionDiv) return;
    if (DESCRIPTIONS_MODE_SELECTION[mode]) {
        descriptionDiv.textContent = DESCRIPTIONS_MODE_SELECTION[mode];
        descriptionDiv.classList.remove('u-hide');
        descriptionDiv.style.display = '';
    } else {
        descriptionDiv.classList.add('u-hide');
        descriptionDiv.style.display = 'none';
    }
}

/**
 * 🆕 Beta 95.4 : Toggle la visibilité des catégories Sélection/Obligatoires
 */
function toggleCategoriesMat() {
    const checkbox = document.getElementById('mat-categories-actif');
    const details = document.getElementById('mat-categories-details');

    if (details) {
        toggleDisplay(details, checkbox && checkbox.checked);
    }

    // Valider que les pondérations = 100%
    if (checkbox && checkbox.checked) {
        validerPonderationsCategoriesMat();
        // Charger la liste des productions avec checkboxes
        chargerProductionsPourCategories();
        // Calculer les pondérations unitaires
        recalculerPonderationsUnitaires();
    }

    // Sauvegarder automatiquement
    sauvegarderConfigPratiqueMat();
}

/**
 * 🆕 Beta 95.4 : Valide que les pondérations Sélection + Obligatoires = 100%
 */
function validerPonderationsCategoriesMat() {
    const pondSelection = parseInt(document.getElementById('mat-selection-ponderation')?.value) || 0;
    const pondOblig = parseInt(document.getElementById('mat-obligatoires-ponderation')?.value) || 0;
    const total = pondSelection + pondOblig;
    const validation = document.getElementById('mat-categories-validation');

    if (validation) {
        if (total === 100) {
            validation.innerHTML = `<span style="color: var(--vert-principal);"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>Total : ${formaterPourcentage(total)}</span>`;   // security-ok: formaterPourcentage ne rend que chiffres, virgule, U+00A0 et « % » (ou '')
        } else if (total < 100) {
            validation.innerHTML = `<span style="color: var(--orange-principal);"><span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Total : ${formaterPourcentage(total)} (il manque ${formaterPourcentage(100 - total)})</span>`;   // security-ok: formaterPourcentage ne rend que chiffres, virgule, U+00A0 et « % » (ou '')
        } else {
            validation.innerHTML = `<span style="color: var(--rouge-principal);"><span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Total : ${formaterPourcentage(total)} (dépasse de ${formaterPourcentage(total - 100)})</span>`;   // security-ok: formaterPourcentage ne rend que chiffres, virgule, U+00A0 et « % » (ou '')
        }
    }
}

/**
 * 🆕 Beta 95.4 : Charge et affiche les listes de checkboxes pour les deux catégories
 */
async function chargerProductionsPourCategories() {
    const listeSelection = document.getElementById('mat-selection-liste');
    const listeObligatoires = document.getElementById('mat-obligatoires-liste');

    if (!listeSelection || !listeObligatoires) return;

    // Charger les productions avec la bonne clé namespacée
    const cleProductions = cle('productions');
    const productions = await db.get(cleProductions) || [];

    // Filtrer : exclure portfolio conteneur et formatifs
    const productionsFiltrables = productions.filter(p =>
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );

    // Générer HTML pour chaque liste
    // #339 (15 oct. 2026, verdict de Cowork) : la terminale n'est plus proposée parmi les obligatoires — sa copie
    // n'entre jamais dans le pool et elle garde sa propre pondération (`_selectionnerArtefactsHybride`).
    const terminalId = _idTerminaleDesCategories(productionsFiltrables);
    listeSelection.innerHTML = genererCheckboxesCategorie(productionsFiltrables, 'selection', terminalId);
    listeObligatoires.innerHTML = genererCheckboxesCategorie(productionsFiltrables.filter(p => p.id !== terminalId), 'obligatoire', terminalId);

    // Recalculer les pondérations unitaires
    recalculerPonderationsUnitaires();
}

/**
 * #339 (15 oct. 2026) — l'id de la terminale, par la même source que la note (`identifierProductionTerminale`,
 * pratique-registre.js). Sa marque « obligatoire » déjà posée reste en base, inerte pour l'écran comme pour le calcul.
 */
function _idTerminaleDesCategories(productions) {
    const terminale = (typeof window.identifierProductionTerminale === 'function')
        ? window.identifierProductionTerminale(productions) : null;
    return terminale ? terminale.id : null;
}

/**
 * 🆕 Beta 95.4 : Génère le HTML des checkboxes pour une catégorie
 */
function genererCheckboxesCategorie(productions, categorie, terminalId = null) {
    if (productions.length === 0) {
        return '<p style="padding: 15px; color: var(--gris-moyen); text-align: center;">Aucune production</p>';
    }

    return productions.map(prod => {
        // #339 : la marque « obligatoire » d'une terminale est inerte — elle ne la grise pas dans la Sélection.
        const marque = (prod.id === terminalId && prod.categorie === 'obligatoire') ? null : prod.categorie;
        const checked = marque === categorie ? 'checked' : '';
        const estDansAutre = marque && marque !== categorie;
        const opacite = estDansAutre ? '0.4' : '1';
        const colorCategorie = categorie === 'selection' ? 'var(--accent-primaire)' : 'var(--orange-principal, #e67e22)';

        return `
            <label style="display: flex; align-items: center; gap: 10px; padding: 8px 12px;
                         border-bottom: 1px solid var(--gris-tres-clair); cursor: ${estDansAutre ? 'not-allowed' : 'pointer'};
                         opacity: ${opacite}; transition: background 0.15s;"
                   class="hover-fond-subtil">
                <input type="checkbox" ${checked}
                       data-on-change="toggleProductionCategorieHandler" data-prod-id="${prod.id}" data-categorie="${categorie}"
                       style="width: 16px; height: 16px; accent-color: ${colorCategorie};"
                       ${estDansAutre ? 'disabled' : ''}>
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem;">
                    ${echapperHtml(prod.titre || 'Sans titre')}
                </span>
                ${estDansAutre ? `<small style="color: var(--gris-moyen); white-space: nowrap;">(${marque === 'selection' ? 'Sélection' : 'Obligatoire'})</small>` : ''}
            </label>
        `;
    }).join('');
}

/**
 * 🆕 Beta 95.4 : Toggle une production dans une catégorie (exclusif)
 */
async function toggleProductionCategorie(prodId, categorie, checked) {
    let trouvee = false;
    await modifierEtAnnoncer(cle('productions'), (lues) => {
        const productions = lues || [];
        const prod = productions.find(p => p.id === prodId);
        if (!prod) return undefined;

        prod.categorie = checked ? categorie : null;
        trouvee = true;
        return productions;
    }, [], { geste: 'Modifier la pratique' });

    if (trouvee) {
        // Rafraîchir les deux listes (pour gérer l'exclusivité)
        chargerProductionsPourCategories();
    }
}

/**
 * 🆕 Beta 95.4 : Recalcule et affiche les pondérations unitaires
 */
async function recalculerPonderationsUnitaires() {
    // Charger les productions avec la bonne clé namespacée
    const cleProductions = cle('productions');
    const productions = await db.get(cleProductions) || [];

    // Compter productions par catégorie (hors portfolio et formatifs)
    const productionsFiltrables = productions.filter(p =>
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );
    const nbSelection = productionsFiltrables.filter(p => p.categorie === 'selection').length;
    // #339 : la terminale ne compte pas parmi les obligatoires, même cochée par une configuration d'avant (le calcul l'écarte).
    const terminalId = _idTerminaleDesCategories(productionsFiltrables);
    const nbObligatoires = productionsFiltrables.filter(p => p.categorie === 'obligatoire' && p.id !== terminalId).length;

    // Lire pondérations globales
    const pondSelection = parseInt(document.getElementById('mat-selection-ponderation')?.value) || 0;
    const pondObligatoires = parseInt(document.getElementById('mat-obligatoires-ponderation')?.value) || 0;
    const nombreARetenir = parseInt(document.getElementById('mat-selection-nombre')?.value) || 1;

    // Calculer pondérations unitaires
    const unitaireSelection = nombreARetenir > 0 ? pondSelection / nombreARetenir : 0;
    const unitaireObligatoires = nbObligatoires > 0 ? pondObligatoires / nbObligatoires : 0;

    // Afficher
    const divSelection = document.getElementById('mat-selection-unitaire');
    const divObligatoires = document.getElementById('mat-obligatoires-unitaire');

    if (divSelection) {
        const infoNb = nbSelection > 0 ? ` (${nbSelection} dans le pool)` : '';
        divSelection.innerHTML = `Pondération unitaire : <strong>${formaterPourcentage(unitaireSelection, 2)}</strong> par production retenue${infoNb}`;   // security-ok: formaterPourcentage ne rend que chiffres, virgule, U+00A0 et « % » (ou '')
    }
    if (divObligatoires) {
        const infoNb = nbObligatoires > 0 ? ` (${nbObligatoires} cochée${nbObligatoires > 1 ? 's' : ''})` : ' (aucune cochée)';
        divObligatoires.innerHTML = `Pondération unitaire : <strong>${formaterPourcentage(unitaireObligatoires, 2)}</strong> par production${infoNb}`;   // security-ok: formaterPourcentage ne rend que chiffres, virgule, U+00A0 et « % » (ou '')
    }

    // 🆕 Beta 95.7 : Mise à jour du résumé construction de la note
    const resumeContenu = document.getElementById('mat-categories-resume-contenu');
    if (resumeContenu) {
        const totalProductions = nombreARetenir + nbObligatoires;
        const totalPond = pondSelection + pondObligatoires;

        let html = `<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">`;
        html += `<span style="color: var(--accent-primaire);"><strong>${nombreARetenir}</strong> meilleure${nombreARetenir > 1 ? 's' : ''}</span>`;
        html += `<span style="color: var(--gris-moyen);">+</span>`;
        html += `<span style="color: var(--orange-principal);"><strong>${nbObligatoires}</strong> obligatoire${nbObligatoires > 1 ? 's' : ''}</span>`;
        html += `<span style="color: var(--gris-moyen);">=</span>`;
        html += `<span style="font-weight: 700; font-size: 1.1rem;"><strong>${totalProductions}</strong> production${totalProductions > 1 ? 's' : ''}</span>`;
        html += `</div>`;

        html += `<div style="margin-top: 8px; font-size: 0.85rem; color: var(--gris-fonce);">`;
        html += `(${formaterPourcentage(pondSelection)} + ${formaterPourcentage(pondObligatoires)} = ${formaterPourcentage(totalPond)})`;
        if (totalPond !== 100) {
            html += ` <span style="color: var(--orange-principal);">⚠️ ≠ 100\u00a0%</span>`;
        }
        html += `</div>`;

        resumeContenu.innerHTML = html;
    }
}

/* ===============================
   PAR-OBJECTIFS — RETIRÉ (#435, 9 août 2026)
   ===============================
   La section entière (table MODES_PAR_OBJECTIFS + 10 fonctions d'édition :
   chargerConfigParObjectifsMat, changerModeCalculObjectifsMat,
   afficherListeObjectifsMat, rafraichirListeObjectifsMat, ajouterObjectifMat,
   modifierObjectifMat, supprimerObjectifMat, afficherGrilleConversionMat,
   genererGrilleConversionMat, modifierGrilleConversionMat) est partie avec le
   panneau `mat-config-par-objectifs` et le moteur `_calculerPerformanceParObjectifs`.
   Extension de la décision #396 (Grégoire) : chemin jamais fonctionnel —
   l'appariement production→objectif reposait sur un `objectifId` sans écrivain. */

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler pour modifierTypeTravailMat(index, champ, value) */
function modifierTypeTravailMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var champ = el.dataset.champ;
    modifierTypeTravailMat(index, champ, el.value);
}

/** Handler pour modifierForfaitMat(index, champ, value) */
function modifierForfaitMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var champ = el.dataset.champ;
    modifierForfaitMat(index, champ, el.value);
}

/** Handler pour modifierTravailForfaitMat(index, typeId, value) */
function modifierTravailForfaitMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var typeId = parseInt(el.dataset.typeId);
    modifierTravailForfaitMat(index, typeId, el.value);
}

/** Handler pour toggleProductionCategorie(prodId, categorie, checked) */
function toggleProductionCategorieHandler(el) {
    toggleProductionCategorie(el.dataset.prodId, el.dataset.categorie, el.checked);
}

/** Ouvrir le file picker import pratiques */
function ouvrirFilePickerImportPratiques() {
    var input = document.getElementById('fichier-import-pratiques-modal');
    if (input) input.click();
}

/** Fermer modal import pratiques */
function fermerModalImportPratiques() {
    // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
    // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
    // est `<body>` → `.remove()` effacerait toute l'application).
    var wrapper = document.querySelector('.modal-import-pratiques');
    if (wrapper) wrapper.remove();
    delete window._pratiquesImportEnAttente;
}

/** Confirmer import pratiques + fermer */
function confirmerEtFermerImportPratiques() {
    window.confirmerImportPratiques(window._pratiquesImportEnAttente);
    fermerModalImportPratiques();
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

// Module principal
window.initialiserModulePratiquesMateriel = initialiserModulePratiquesMateriel;
window.etapesChainePratique = etapesChainePratique;   // #1149, lot 3b
window.rendreChainePratique = rendreChainePratique;
window.afficherListePratiquesMateriel = afficherListePratiquesMateriel;
// 🆕 #466/CO-16 (21 août 2026) : appelé par changerTrimestreActifV2 (même patron
// que grilles/échelles) — le pointeur d'édition ne survit pas à la bascule
// (l'auto-save avalait ses échecs en console.warn : modifications perdues).
function reinitialiserEditeurPratiquesApresBascule() { pratiqueEnEditionMateriel = null; }
window.reinitialiserEditeurPratiquesApresBascule = reinitialiserEditeurPratiquesApresBascule;
window.afficherBibliothequePratiques = afficherBibliothequePratiques;
window.fermerModalBibliothequePratiques = fermerModalBibliothequePratiques;
window.ouvrirExplorationMaquettes = ouvrirExplorationMaquettes;
// #327 — la gestion des répertoires de classement est passée au helper générique
// BibliothequeUI.repertoires (js/bibliotheque-ui.js). Plus d'exports spécifiques ici.
window.ajouterPratiqueALaSelection = ajouterPratiqueALaSelection;
window.retirerPratiqueDeLaSelection = retirerPratiqueDeLaSelection;
window.retirerPratiqueDeBibliothequeMateriel = retirerPratiqueDeBibliothequeMateriel;

// Édition
window.chargerPratiquePourModif = chargerPratiquePourModif;

/**
 * Navigation directe vers les réglages d'une pratique précise depuis n'importe
 * où dans l'app (utilisé par le lien « Réglages de la pratique » dans la
 * section Note finale du profil étudiant). Enchaîne section → sous-section →
 * chargement de la pratique. Les setTimeout laissent la cascade
 * `afficherSousSection → afficherListePratiquesMateriel` (async) peupler la
 * sidebar avant qu'on tente de sélectionner l'item.
 */
function ouvrirReglagesPratique(pratiqueId) {
    if (!pratiqueId) return;
    if (typeof afficherSection === 'function') afficherSection('conception');
    setTimeout(() => {
        if (typeof afficherSousSection === 'function') afficherSousSection('conception-pratiques-notation');
        setTimeout(() => {
            if (typeof chargerPratiquePourModif === 'function') chargerPratiquePourModif(pratiqueId);
        }, 150);
    }, 50);
}
window.ouvrirReglagesPratique = ouvrirReglagesPratique;
window.dupliquerEtEditerPratique = dupliquerEtEditerPratique;
window.dupliquerPratiqueMateriel = dupliquerPratiqueMateriel;
window.supprimerPratiqueMateriel = supprimerPratiqueMateriel;
window.appliquerPratiqueAuCours = appliquerPratiqueAuCours;
window.sauvegarderPratiqueMateriel = sauvegarderPratiqueMateriel;
window.partagerPratiqueMateriel = partagerPratiqueMateriel;
window.exporterPratiquesUtilisateur = exporterPratiquesUtilisateur;
window.importerPratiquesUtilisateur = importerPratiquesUtilisateur;

// Handlers formulaire (préfixe mat-)
window.changerTypePratiqueMat = changerTypePratiqueMat;
window.mettreAJourNomPratiqueMat = mettreAJourNomPratiqueMat;
window.mettreAJourDescriptionPratiqueMat = mettreAJourDescriptionPratiqueMat;
window.mettreAJourDisciplinePratiqueMat = mettreAJourDisciplinePratiqueMat;
window.sauvegarderConfigPratiqueMat = sauvegarderConfigPratiqueMat;
window.toggleSystemeJetonsMat = toggleSystemeJetonsMat;
window.onJetonsActifChangeMat = onJetonsActifChangeMat;
window.toggleCategoriesMat = toggleCategoriesMat;  // 🆕 Beta 95.4
window.onPortfolioSelectionChangeMat = onPortfolioSelectionChangeMat;  // 🆕 #24
window.chargerProductionsPourCategories = chargerProductionsPourCategories;  // 🆕 Beta 95.4
window.toggleProductionCategorie = toggleProductionCategorie;  // 🆕 Beta 95.4
window.recalculerPonderationsUnitaires = recalculerPonderationsUnitaires;  // 🆕 Beta 95.4
window.validerPonderationsCategoriesMat = validerPonderationsCategoriesMat;  // 🆕 Beta 95.4

// Échelles
window.chargerDropdownEchellesMat = chargerDropdownEchellesMat;
window.chargerDropdownGrillesMat = chargerDropdownGrillesMat;
window.afficherPreviewEchelleMat = afficherPreviewEchelleMat;
window.peuplerDropdownNoteMaximaleMat = peuplerDropdownNoteMaximaleMat;

// PAN-Spécifications : Types de travaux
window.afficherTypesTravauxMat = afficherTypesTravauxMat;
window.ajouterTypeTravailMat = ajouterTypeTravailMat;
window.modifierTypeTravailMat = modifierTypeTravailMat;
window.supprimerTypeTravailMat = supprimerTypeTravailMat;

// PAN-Spécifications : Forfaits
window.afficherForfaitsMat = afficherForfaitsMat;
window.ajouterForfaitMat = ajouterForfaitMat;
window.modifierForfaitMat = modifierForfaitMat;
window.modifierTravailForfaitMat = modifierTravailForfaitMat;
window.supprimerForfaitMat = supprimerForfaitMat;

// PAN-Standards : Par-Objectifs (variante STD)

// Anciennes fonctions (compatibilité)
window.mettreAJourNomPratique = mettreAJourNomPratique;
window.mettreAJourDescriptionPratique = mettreAJourDescriptionPratique;
window.mettreAJourDisciplinePratique = mettreAJourDisciplinePratique;

// Fonctions bibliothèque (manquantes avant Phase 5)
window.dupliquerPratiqueBibliotheque = dupliquerPratiqueBibliotheque;
// Brique C namespacing pas 5 — import inter-trimestre de pratiques (modèle COPIE).
window.listerTrimestresAvecPratiques = listerTrimestresAvecPratiques;
window.afficherPratiquesTrimestreModal = afficherPratiquesTrimestreModal;
window.importerUnePratiqueTrimestre = importerUnePratiqueTrimestre;
window.importerToutPratiquesTrimestreModal = importerToutPratiquesTrimestreModal;
window.copierPratiqueDepuisTrimestre = copierPratiqueDepuisTrimestre;
window.supprimerPratiqueDefinitivement = supprimerPratiqueDefinitivement;
window.supprimerPratiqueDeBibliothequePartagee = supprimerPratiqueDeBibliothequePartagee;

// Wrappers délégation (Phase 5)
window.modifierTypeTravailMatHandler = modifierTypeTravailMatHandler;
window.modifierForfaitMatHandler = modifierForfaitMatHandler;
window.modifierTravailForfaitMatHandler = modifierTravailForfaitMatHandler;
window.toggleProductionCategorieHandler = toggleProductionCategorieHandler;
// #468/CO-18 : exporté pour la sentinelle de rendu (le HTML des cases du mode
// hybride est vérifié hors navigateur — une balise laissée béante y est fatale).
window.genererCheckboxesCategorie = genererCheckboxesCategorie;
window.ouvrirFilePickerImportPratiques = ouvrirFilePickerImportPratiques;
window.fermerModalImportPratiques = fermerModalImportPratiques;
window.confirmerEtFermerImportPratiques = confirmerEtFermerImportPratiques;

// Constantes
// ⚠️ Accesseur VIVANT (bug 31 mai) : exporter la valeur brute figeait un snapshot
// à `null` au chargement (jamais re-synchronisé), car `pratiqueEnEditionMateriel` est
// un `let` interne à cette IIFE. Les wrappers de main.js (Dupliquer/Supprimer/Appliquer)
// lisaient ce null périmé. Un getter de closure renvoie toujours la valeur courante.
window.obtenirPratiqueEnEditionMateriel = function() { return pratiqueEnEditionMateriel; };



})();
