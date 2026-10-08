/* ===============================
   MODULE 06: ÉCHELLES DE PERFORMANCE
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère les échelles de performance pour les pratiques
   alternatives de notation (PAN/SBG).
   
   Contenu de ce module:
   - Définition des niveaux de performance par défaut
   - Gestion des échelles templates (création, édition, suppression)
   - Affichage du tableau des niveaux
   - Aperçu visuel de l'échelle
   - Conversion notes <-> niveaux
   - Chargement des échelles dans les selects
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #nomEchelleTemplate : Input pour le nom
   - #tableauNiveauxEchelle / #apercuEchelleNiveaux : éditeur de niveaux et son aperçu
   - #btnDupliquerEchelle : Bouton dupliquer

   LocalStorage utilisé:
   - 'echellesTemplates' : Array des échelles sauvegardées
   (⚰ #658 : les clés nues 'niveauxEchelle' et 'configEchelle' n'ont plus ni
   lecteur ni écrivain — le stock déjà écrit chez les gens reste, inerte.)
   =============================== */

/* ===============================
   NIVEAUX PAR DÉFAUT
   Échelle SOLO (Structure of Observed Learning Outcomes)
   =============================== */

/**
 * Niveaux de performance par défaut
 * Basés sur la taxonomie SOLO adaptée aux PAN
 * 
 * Structure de chaque niveau:
 * - code: Code court (1-3 lettres)
 * - nom: Nom descriptif du niveau
 * - description: Explication du niveau, en prose — c'est le texte que l'élève
 *   LIT (il part dans les PDF remis, cf. `export-pdf.js`, les cartouches et le
 *   comparateur). Il n'est PAS remplacé par le champ ci-dessous.
 * - niveauSOLO: l'étiquette SOLO STRUCTURÉE du niveau — ce que le calcul sait
 *   lire, là où la `description` est de la prose qu'il ne peut pas lire (#542
 *   lot 2). Facultatif : une échelle en pourcentages ou en lettres n'a pas de
 *   lecture SOLO.
 *   ⚠ POSÉ ICI PARCE QUE C'EST UN SEED — une échelle LIVRÉE, que l'utilisateur
 *   voit et modifie. Ce n'est pas la même chose que deviner l'étiquette d'une
 *   échelle EXISTANTE depuis sa prose : ça, ce serait exactement le défaut B9 —
 *   `obtenirNiveauSOLO()`, qui redevinait SOLO depuis le nom d'un critère et
 *   pouvait contredire le champ configuré. ⮕ **Elle a été supprimée au pas 4 du
 *   lot 3** (`trimestres.js`, 27 août 2026) ; le défaut est nommé ici parce que
 *   c'est le patron à ne pas recréer, pas parce qu'il vit encore. Aucune reprise
 *   automatique n'est faite sur les échelles déjà enregistrées : le champ y naît
 *   vide.
 *   ⚠ « I » reçoit `unistructurel` et NON un composite : sa description dit
 *   « Préstructurel, unistructurel », mais le menu ne prend qu'UNE étiquette
 *   (décision du 26 août : pas d'entrée composite, chaque lecteur n'a qu'une
 *   valeur à traiter). La nuance reste dans la prose, qui est faite pour ça.
 * - min: Pourcentage minimum
 * - max: Pourcentage maximum
 * - couleur: Variable CSS pour la couleur
 * 
 * ⚠️ NE PAS MODIFIER - Utilisé comme référence par défaut
 */
const niveauxDefaut = [
    {
        code: 'I',
        nom: 'Incomplet',
        description: 'Préstructurel, unistructurel',
        niveauSOLO: 'unistructurel',
        min: 0,
        max: 64.99,
        valeurCalcul: 32,
        couleur: 'var(--niveau-attention-critique)'
    },
    {
        code: 'D',
        nom: 'Développement',
        description: 'Multistructurel',
        niveauSOLO: 'multistructurel',
        min: 65,
        max: 74.99,
        valeurCalcul: 69.5,
        couleur: 'var(--niveau-attention-modere)'
    },
    {
        code: 'M',
        nom: 'Maîtrise',
        description: 'Relationnel',
        niveauSOLO: 'relationnel',
        min: 75,
        max: 84.99,
        valeurCalcul: 79.5,
        couleur: 'var(--niveau-attention-minimal)'
    },
    {
        code: 'E',
        nom: 'Étendu',
        description: 'Abstrait étendu',
        niveauSOLO: 'abstrait_etendu',
        min: 85,
        max: 100,
        valeurCalcul: 92.5,
        couleur: 'var(--niveau-attention-nul)'
    }
];

/* ===============================
   VARIABLE GLOBALE D'ÉTAT
   =============================== */

/**
 * Échelle actuellement en cours d'édition
 * null si nouvelle échelle ou aucune échelle sélectionnée
 * 
 * Structure:
 * {
 *   id: string,
 *   nom: string,
 *   niveaux: Array,
 *   config: Object,
 *   dateCreation: string ISO,
 *   dateModification: string ISO
 * }
 */
let echelleTemplateActuelle = null;

/* ===============================
   ✅ AJOUT (28 janvier 2026) : DÉTECTION DES DOUBLONS
   Fonctions pour identifier les échelles avec des noms similaires
   =============================== */

/**
 * Générer un badge de source pour une échelle
 * @param {Object} echelle - L'échelle
 * @param {Array} echellesLocales - Échelles locales pour vérifier la source
 * @returns {string} HTML du badge
 */
function genererBadgeSourceEchelle(echelle, echellesLocales) {
    return BibliothequeUI.genererBadgeSource(echelle, echellesLocales);
}

function genererIdCourtEchelle(id) {
    return BibliothequeUI.genererIdCourt(id);
}

/* ⚰ #658 (13 sept. 2026) — LA « VUE HIÉRARCHIQUE » EST RETIRÉE, avec
   `ajouterNiveauAEchelle`. Elle rendait dans `#vueEchellesNiveaux`, un <div> vide
   du bloc « Conteneurs cachés pour compatibilité » d'index.html : son rendu, et
   les boutons Modifier / Dupliquer / Supprimer qu'il portait, n'étaient vus par
   personne. Le bloc est parti avec ses huit conteneurs et tout ce qui rendait
   dedans : le sélecteur, le tableau et l'aperçu de l'ancien éditeur de niveaux,
   et les clés nues `niveauxEchelle` et `configEchelle`. L'éditeur vivant est
   celui de la barre latérale : `afficherNiveauxEchelle` → `#tableauNiveauxEchelle`.
   ⚠ `dupliquerEchelle` et `supprimerEchelle`, ci-dessous, n'avaient plus de
   déclencheur visible AVANT ce lot (leurs boutons étaient dans ce rendu caché).
   Elles restent : leurs sentinelles relèvent du chantier duplication (#476,
   arbitrage de #586 du 28 août 2026), pas de ce retrait. */

/**
 * Duplique une échelle spécifique par son ID
 *
 * @param {string} echelleId - ID de l'échelle à dupliquer
 *
 * FONCTIONNEMENT:
 * 1. Trouve l'échelle dans localStorage
 * 2. Crée une copie avec un nouveau nom
 * 3. Sauvegarde la copie
 * 4. Rafraîchit l'affichage
 */
async function dupliquerEchelle(echelleId) {
    // ⚠ La question posée à l'utilisateur ne doit PAS tenir la file ouverte :
    // c'est la plus longue fenêtre possible (le lot 1 l'a mesurée sur
    // `partagerPratique`). On lit donc hors file, uniquement pour proposer un
    // nom — puis la copie est forgée et poussée DANS la file, sur la
    // collection telle qu'elle est à cet instant-là.
    const echellesLues = await db.get(cle('echellesTemplates')) ||  [];
    const source = echellesLues.find(e => e.id === echelleId);

    if (!source) {
        console.error('Échelle introuvable:', echelleId);
        return;
    }

    const nouveauNom = prompt('Nom de la nouvelle échelle :', nommerCopie(source.nom, echellesLues));
    if (!nouveauNom) return;

    let nouvelleEchelleCreee = null;
    await db.modifier(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelle = echelles.find(e => e.id === echelleId);
        if (!echelle) return undefined;

        // ⚠⚠ CECI EST UNE LISTE BLANCHE, ET C'EST DÉLIBÉRÉ : un spread de `echelle`
        // emporterait `idOriginal`, et la COPIE se mettrait à répondre à l'identifiant
        // de la source dans `obtenirEchelleResolue` (le dédoublonnage d'import de
        // #542). Le prix à payer est qu'un champ métier neuf est PERDU tant qu'il
        // n'est pas ajouté ici — et c'est arrivé le 28 août même : les deux repères
        // de maîtrise (#555 lot 1) ne survivaient pas à une duplication.
        // ⮕ TOUT CHAMP MÉTIER AJOUTÉ À UNE ÉCHELLE DOIT ÊTRE AJOUTÉ ICI. Une
        // sentinelle le vérifie pour les repères.
        const nouvelleEchelle = {
            id: genererIdUnique('ECH_'),
            nom: nouveauNom,
            niveaux: JSON.parse(JSON.stringify(echelle.niveaux || [])), // Copie profonde
            config: JSON.parse(JSON.stringify(echelle.config || {})),
            // #555 — les repères désignent des CODES de niveau, et les niveaux sont
            // copiés à l'identique : les repères restent donc valides dans la copie.
            ...(echelle.seuilSuffisance ? { seuilSuffisance: echelle.seuilSuffisance } : {}),
            ...(echelle.seuilMaitrise ? { seuilMaitrise: echelle.seuilMaitrise } : {}),
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            auteur: BibliothequeUI.obtenirAuteurActif(),
            isDemo: false,
            inspireDe: BibliothequeUI.forgerInspireDe(echelle),
            dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Échelle dupliquée dans bibliothèque par défaut
        };

        echelles.push(nouvelleEchelle);
        nouvelleEchelleCreee = nouvelleEchelle;
        return echelles;
    }, []);

    if (!nouvelleEchelleCreee) return;
    const nouvelleEchelle = nouvelleEchelleCreee;

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

    notifications.succes(`Échelle «${nouvelleEchelle.nom}» créée avec succès.`);
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module des échelles de performance
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge les échelles templates dans le select
 * 3. Charge la configuration globale
 * 4. Affiche les niveaux et l'aperçu
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
/**
 * ✅ AJOUT (8 décembre 2025) : Migration des échelles existantes vers le système de bibliothèque
 * Ajoute le flag dansBibliotheque=true à toutes les échelles existantes qui n'ont pas ce flag
 */
async function migrerEchellesVersBibliotheque() {
    await db.modifier(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];

        let nbMigrees = 0;
        echelles.forEach(echelle => {
            if (echelle.dansBibliotheque === undefined) {
                echelle.dansBibliotheque = true;
                nbMigrees++;
            }
        });

        // Rien à migrer : le mutateur rend `undefined`, aucune écriture.
        if (nbMigrees === 0) return undefined;
        return echelles;
    }, []);
}

/* ===============================
   #574 — PLUS AUCUNE ÉCHELLE SEMÉE PAR LE CODE
   =============================== */

// ⮕ #574 (arbitré par Grégoire le 28 août 2026, option B) — `assurerEchelleGenerique`
// est RETIRÉE. Elle semait au boot, dans chaque trimestre, une « Échelle générique
// (exemple) » dont les niveaux portaient `valeur: 45/67/82/95` — pas `valeurCalcul`.
// Depuis #527 (retrait du repli milieu de plage), une évaluation sur cette échelle
// était NON CALCULABLE sur tous ses critères, sans message ciblé. Lui donner des
// `valeurCalcul` choisies par le projet aurait refabriqué l'arbitrage pédagogique
// que #526/#527 interdisent : on n'offre plus que des échelles que l'utilisateur
// complète lui-même. Même sort pour les deux gabarits d'échelle de
// `gabarits-utils.js`. Les échelles génériques DÉJÀ présentes dans les données
// ne sont pas touchées : elles se suppriment comme les autres (tombstone via
// `IDS_GABARITS_HARDCODES`, qui garde leurs ids pour cette raison).
//
// ⚠ Sonde AVANT toute décision sur les données existantes : `await _sonder574()`.

/* ─────────────────────────────────────────────────────────────────────────────
   ⚠⚠ LA CONTRADICTION APPARENTE — À LIRE AVANT DE DÉFAIRE CE SEMIS

   Une session qui lit deux faits du dépôt — « le SOLO codé en dur a été retiré du
   dépistage cet été » et « on sème une échelle SOLO » — peut conclure à une
   incohérence et défaire ce semis EN CROYANT BIEN FAIRE. Ce paragraphe existe
   pour l'en empêcher, et il est écrit ici, à côté du code, pas dans un plan.

   CE N'EST PAS UNE CONTRADICTION. Retirer le code en dur n'est pas retirer la
   proposition. Le dépistage ne doit plus EXIGER SOLO ; l'échelle semée le
   PROPOSE, et l'enseignant la remplace s'il veut. C'est la différence entre
   « imposé par le code » et « offert par défaut », et c'est toute la doctrine du
   chantier de l'été.

   ET CE N'EST PAS NON PLUS UN RENVERSEMENT DE #574. #574 n'interdisait pas de
   semer une échelle : il interdisait de semer une échelle SANS VALEURS
   EXPLOITABLES. L'ancienne `ECHELLE_GENERIQUE` portait `valeur: 45/67/82/95` et
   jamais `valeurCalcul` — c'est ce qui la rendait muette, et c'est exactement le
   défaut des huit échelles disciplinaires retirées le 1er septembre. Grégoire
   avait par ailleurs déjà tranché la règle générale, par écrit, le 26 août
   (BACKLOG.md, règle posée pour #529) :

       « SEEDER est permis : livrer IDME comme valeur de départ, modifiable, dans
         les données. C'est une commodité d'accueil, pas une contrainte.
         CODER EN DUR est interdit : inscrire les codes ou les noms dans la LOGIQUE. »

   ⮕ Semer une échelle IDME MUNIE de `valeurCalcul` est donc l'APPLICATION de
   #574, pas son renversement.

   ⚠ LA SEULE CONTRAINTE QUI SURVIT, et elle tient : les valeurs sont un POINT DE
   DÉPART, jamais une norme du projet. L'échelle est modifiable et supprimable
   comme n'importe quelle autre, son nom le dit, sa description le dit.

   ⮕ Si tu t'apprêtes à retirer ce semis : le motif ne peut pas être « SOLO est
   codé en dur » (il ne l'est pas, il est proposé) ni « #574 l'interdit » (il ne
   l'interdit pas). S'il en existe un autre, il est neuf — écris-le.
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * Sème l'échelle IDME de départ dans le trimestre actif — la pièce manquante du
 * triptyque (§2 du `plans de travail/PLAN-2026-09-01-materiel-seme-et-chemin-d-entree.md`).
 *
 * POURQUOI ELLE EXISTE. `GRILLE_GENERIQUE` et `CART_GENERIQUE` sont semées et
 * fonctionnent ; aucune échelle ne l'était depuis #574. Or sans échelle,
 * `calculerNote` sort en silence et `chargerGrilleSelectionnee` ne rend aucun
 * critère : le nouvel utilisateur avait deux tiers d'un triptyque et un écran qui
 * ne réagissait pas.
 *
 * POURQUOI IDME, et pas une échelle neutre. Deux motifs, et le second est celui
 * de Grégoire :
 *   1. l'application la SUPPOSE DÉJÀ — I/D/M/E est le repli codé en dur
 *      d'`afficherCriteresDepuisGrille` (evaluation-chargement.js) quand aucun
 *      niveau n'est trouvé. La semer ne fait qu'expliciter ce que le code fait
 *      déjà en cachette ;
 *   2. elle introduit la taxonomie SOLO et rend le dépistage possible — ce que
 *      l'application a de singulier. Une échelle neutre priverait le nouvel
 *      utilisateur de la porte d'entrée vers ce qui la distingue.
 *
 * ⚠ LES NIVEAUX SONT UNE COPIE PROFONDE DE `niveauxDefaut`, la forme canonique du
 * module (marquée « NE PAS MODIFIER — référence par défaut »). Aucune valeur n'est
 * inventée ici, et la copie évite qu'une modification de l'utilisateur ne remonte
 * dans la constante partagée par une douzaine de lecteurs.
 *
 * ⚠ IDENTIFIANT NEUF, jamais `ECHELLE_GENERIQUE`. Réutiliser l'ancien ferait se
 * confondre cette échelle avec les copies CASSÉES qui vivent encore dans les
 * données de qui l'a connue — la collision d'identité de #524, rejouée.
 * `ECHELLE_IDME_DEPART` entre dans `IDS_GABARITS_HARDCODES` (main.js) : sans quoi
 * l'utilisateur qui la supprime la verrait revenir au prochain boot, et
 * « ce qu'un utilisateur détruit, il l'a voulu » (énoncé 8) serait faux.
 */
async function assurerEchelleIdmeDeDepart() {
    // 🆕 Garde anti-resemage du global hérité — JUMELLE de celle
    // d'`assurerGrilleGenerique` (#358). Au boot, avant que `trimestreActif` soit
    // réhydraté, `cle()` retombe sur la clé GLOBALE nue : semer là recréerait
    // l'exemple dans le global que #358 retire. La navigation vers la section
    // rappelle ce module une fois le trimestre actif établi.
    if (cle('echellesTemplates') === 'echellesTemplates') return;

    // Supprimée volontairement : on ne la réinjecte pas. Ce test ne dépend pas de
    // la collection, il reste hors de la file.
    if (window.estRessourceSupprimee && window.estRessourceSupprimee('ECHELLE_IDME_DEPART')) return;

    const echelle = {
        id: 'ECHELLE_IDME_DEPART',
        // §3 : « de départ » d'abord, la précision ensuite — c'est le mot commun
        // aux trois pièces semées, et c'est lui qui doit se voir dans une liste.
        nom: 'Échelle de départ (IDME)',
        description: 'Quatre niveaux — Incomplet, Développement, Maîtrise, Étendu. '
            + 'Les valeurs ponctuelles sont un point de départ : modifie-les, ou remplace '
            + 'l\'échelle entière. Rien ici n\'est une norme du projet.',
        // Copie PROFONDE : la constante partagée ne doit jamais devenir mutable
        // par l'utilisateur (une douzaine de lecteurs s'appuient dessus).
        niveaux: JSON.parse(JSON.stringify(niveauxDefaut)),
        verrouille: false,
        dansBibliotheque: true
    };

    await db.modifier(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        // #599 — la présence se vérifie À L'INSTANT DE L'ÉCRITURE. Vérifiée avant,
        // deux boots concurrents sèmeraient deux fois.
        if (echelles.some(e => e && e.id === 'ECHELLE_IDME_DEPART')) return undefined;
        echelles.push(echelle);
        return echelles;
    }, []);
}
window.assurerEchelleIdmeDeDepart = assurerEchelleIdmeDeDepart;

/**
 * Sonde LECTURE SEULE #574 : dans TOUS les trimestres, quelles échelles sont
 * fabriquées par le code (générique semée, copies de gabarits), combien de
 * niveaux d'échelle n'ont PAS de `valeurCalcul` (la mesure promise par #526,
 * jamais faite), et combien d'évaluations, de productions et de cartouches
 * désignent une échelle fabriquée. N'écrit RIEN.
 * À lancer en console : await _sonder574()
 *
 * Lecture inter-trimestres par `await db.get()` (source réelle), copie archivée
 * `{trim}_echellesTemplates` sondée avant la clé globale ; une clé partagée n'est
 * lue qu'une fois. Les cartouches vivent sur des clés globales `cartouches_*`
 * (#593/D3) : énumérées par `db.keys()`.
 *
 * @returns {Promise<{echellesFabriquees:Array, niveauxSansValeur:Array,
 *   usages:{evaluations:number, productions:number, cartouches:number}, lignes:Array}>}
 */
async function _sonder574() {
    var trimestres = [];
    try { trimestres = (db.getSync('trimestres', []) || []).filter(function (t) { return t && t.id; }); } catch (e) {}

    var lire = async function (nomCle, trimestreId) {
        var copie = trimestreId + '_' + nomCle;
        var v = await db.get(copie);
        if (Array.isArray(v)) return { cle: copie, liste: v };
        v = await db.get(nomCle);
        if (Array.isArray(v)) return { cle: nomCle, liste: v };
        return null;
    };
    var estFabriquee = function (e) {
        if (!e || !e.id) return false;
        if (e.id === 'ECHELLE_GENERIQUE') return true;
        if (String(e.id).indexOf('GABARIT_ECHELLE_') === 0) return true;
        if (e.idOriginal && String(e.idOriginal).indexOf('GABARIT_ECHELLE_') === 0) return true;
        return false;
    };
    var sansValeur = function (n) {
        return !n || n.valeurCalcul == null || String(n.valeurCalcul).trim() === '' || isNaN(Number(n.valeurCalcul));
    };

    var clesVues = {};
    var echellesFabriquees = [];
    var niveauxSansValeur = [];
    var idsFabriquees = {};
    for (var i = 0; i < trimestres.length; i++) {
        var t = trimestres[i];
        var ech = await lire('echellesTemplates', t.id);
        if (!ech || clesVues[ech.cle]) continue;
        clesVues[ech.cle] = true;
        ech.liste.forEach(function (e) {
            if (!e) return;
            var nb = (e.niveaux || []).filter(sansValeur).length;
            if (nb > 0) niveauxSansValeur.push({ cle: ech.cle, echelleId: e.id, nom: e.nom || '', niveauxSansValeur: nb, niveaux: (e.niveaux || []).length });
            if (estFabriquee(e)) { echellesFabriquees.push({ cle: ech.cle, echelleId: e.id, nom: e.nom || '', idOriginal: e.idOriginal || '' }); idsFabriquees[e.id] = true; }
        });
    }

    var usages = { evaluations: 0, productions: 0, cartouches: 0 };
    var lignes = [];
    var compter = function (liste, type, cleSrc) {
        (liste || []).forEach(function (item) {
            if (item && item.echelleId && idsFabriquees[item.echelleId]) {
                usages[type]++;
                lignes.push({ type: type, cle: cleSrc, id: item.id || '', echelleId: item.echelleId });
            }
        });
    };
    for (var k = 0; k < trimestres.length; k++) {
        var tid = trimestres[k].id;
        var evals = await db.get(tid + '_evaluationsSauvegardees');
        compter(evals, 'evaluations', tid + '_evaluationsSauvegardees');
        var prods = await db.get(tid + '_productions');
        compter(prods, 'productions', tid + '_productions');
    }
    var toutesCles = [];
    try { toutesCles = await db.keys(); } catch (e) { toutesCles = []; }
    try { toutesCles = toutesCles.concat(Object.keys(localStorage)); } catch (e) {}
    var clesCartouches = {};
    toutesCles.forEach(function (c) { if (typeof c === 'string' && c.indexOf('cartouches_') === 0) clesCartouches[c] = true; });
    var clesC = Object.keys(clesCartouches);
    for (var m = 0; m < clesC.length; m++) {
        var carts = await db.get(clesC[m]);
        compter(Array.isArray(carts) ? carts : (carts ? [carts] : []), 'cartouches', clesC[m]);
    }

    // ⚠ `console.log` assumé et nommé : la sortie console EST le produit de cette
    // sonde (même statut que `_diagnostiquerModeleCours`, `_diagnostiquerEchellesGrilles`).
    if (typeof console !== 'undefined' && console.table) {
        console.table(echellesFabriquees);
        console.table(niveauxSansValeur);
        if (lignes.length) console.table(lignes);
    }
    console.log('[Sonde #574] ' + trimestres.length + ' trimestre(s) · échelles fabriquées par le code : ' + echellesFabriquees.length
        + ' · échelles avec au moins un niveau SANS valeurCalcul : ' + niveauxSansValeur.length);
    console.log('[Sonde #574] désignent une échelle fabriquée — évaluations : ' + usages.evaluations
        + ' · productions : ' + usages.productions + ' · cartouches : ' + usages.cartouches);
    return { echellesFabriquees: echellesFabriquees, niveauxSansValeur: niveauxSansValeur, usages: usages, lignes: lignes };
}

// #464 / décision D2 du triage (21 août 2026) : assurerEchellesPersonnalisees
// RETIRÉE (~200 lignes, 8 échelles « collègues » codées en dur). Elle re-semait
// les 8 échelles dans CHAQUE trimestre à chaque boot et, appelée avant que le
// trimestre actif soit établi, recréait la clé NUE echellesTemplates que #358
// interdit (CO-11 — sa jumelle assurerEchelleGenerique, retirée par #574, portait la garde, pas
// elle). Le contenu est alors devenu du CATALOGUE, versé une fois dans la
// Bibliothèque.
// ↻ **ET CE VERSEMENT EST RETIRÉ À SON TOUR** (1er sept. 2026) : les huit
// échelles n'avaient pas de `valeurCalcul` et ne pouvaient donc rien calculer.
// Plus AUCUN chemin du code ne les sème. Ce qui reste chez les utilisateurs
// existants est de la donnée, pas du semis — pierre tombale complète et sonde
// de mesure dans `js/echelles-bibliotheque.js`.

async function initialiserModuleEchelles() {

    // En trimestre ARCHIVÉ (lecture seule), ne pas auto-migrer ni réinjecter les
    // échelles génériques/personnalisées : une simple consultation ne doit pas
    // modifier la copie d'archive (a2025_echellesTemplates = golden master).
    // Lot B2 namespacing — 26 juin 2026 (jumeau de la garde grilles.js).
    if (!(window.estTrimestreArchive && window.estTrimestreArchive())) {
        // ✅ AJOUT (8 décembre 2025) : Migration vers système de bibliothèque
        await migrerEchellesVersBibliotheque();

        // §2 du PLAN-2026-09-01 : l'échelle IDME de départ est semée ici, sous la
        // MÊME garde archivé que la migration ci-dessus — une consultation d'un
        // trimestre archivé ne doit rien écrire dans sa copie d'archive.
        // ⚠ Ce n'est pas le retour de l'`ECHELLE_GENERIQUE` de #574 : celle-là
        // n'avait pas de `valeurCalcul` et ne pouvait rien calculer. Le motif
        // complet est écrit à côté de `assurerEchelleIdmeDeDepart`, LIS-LE avant
        // de retirer cet appel.
        await assurerEchelleIdmeDeDepart();
    }

    // ⚰ #574 étendu (1er septembre 2026) — LE VERSEMENT DES HUIT ÉCHELLES
    // « COLLÈGUES » EST RETIRÉ, avec la fonction qui le faisait.
    // #464/D2 les avait sorties d'ici pour en faire du catalogue versé une fois
    // dans la Bibliothèque. Mesuré depuis : leurs 32 niveaux portaient
    // `valeur:` et jamais `valeurCalcul:`, donc toute évaluation faite avec l'une
    // d'elles affichait 0,0 % sans un mot. On les retire au lieu de les réparer —
    // leur poser des valeurs refabriquerait l'arbitrage que #526/#527 ont supprimé.
    // Motif complet et sonde de mesure : `js/echelles-bibliotheque.js`.

    // Afficher la sidebar avec la liste des échelles (Beta 80.5+)
    if (typeof afficherListeEchelles === 'function') {
        await afficherListeEchelles();
    }
}

/* ===============================
   📂 GESTION DES ÉCHELLES TEMPLATES
   =============================== */

/**
 * Sauvegarde le nom de l'échelle actuelle
 * Appelée lors du changement de valeur dans #nomEchelleTemplate
 *
 * FONCTIONNEMENT:
 * Met à jour le nom de l'échelle en mémoire ET dans localStorage
 *
 * @returns {Promise<boolean>} true si l'écriture a eu lieu, false sinon. Le
 * verdict est lu par `sauvegarderEchelleComplete` : sans lui, un refus
 * d'écriture produisait quand même une confirmation « sauvegardée ».
 * Cf. #466/CO-16, patron de `sauvegarderGrilleTemplate`.
 */
async function sauvegarderNomEchelle() {
    const nom = document.getElementById('nomEchelleTemplate')?.value?.trim();
    // Lot E1 (D3) : un nom vidé sur une échelle existante le dit, par le témoin.
    if (!nom && echelleTemplateActuelle && echelleTemplateActuelle.id && window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre('le nom ne peut pas être vide.', 'Modifier l\'échelle', cle('echellesTemplates'));
    }
    if (echelleTemplateActuelle && echelleTemplateActuelle.id && nom) {
        // #957 (26 sept. 2026) — L'ÉCRITURE PART DE L'ÉCHELLE EN BASE, pas de
        // `echelleTemplateActuelle`. La garde qui précédait ne resynchronisait
        // l'objet mémoire que si le NOMBRE de niveaux différait : toute autre
        // écriture partielle (repères, bibliothèque, autres modules) était
        // réécrite par la copie périmée. Même défaut que les grilles (5 → 6 → 5).
        // Ce que ce formulaire possède (nom, description) est posé sur la version
        // en base ; l'objet mémoire est remplacé par ce qui a été écrit.
        const description = document.getElementById('descriptionEchelle')?.value?.trim() || '';
        const idEdite = echelleTemplateActuelle.id;

        // Écrire dans la file : l'échelle relue en base, avec ce que le formulaire possède.
        // security-ok: écriture pré-existante, passée par la file. La source est
        // l'éditeur local, jamais un fichier importé : les imports passent par
        // confirmerImportEchelles.
        let ecrite = false;
        await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
            const echelles = lues || [];
            const index = echelles.findIndex(e => e.id === idEdite);
            if (index === -1) return undefined;
            let echelle = { ...echelles[index], nom: nom, description: description, dateModification: new Date().toISOString() };
            // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
            if (typeof ajouterContributeurSiNecessaire === 'function') {
                echelle = ajouterContributeurSiNecessaire(echelle);
            }
            echelles[index] = echelle;
            echelleTemplateActuelle = echelle;
            ecrite = true;
            return echelles;
        }, [], { geste: 'Modifier l\'échelle' });

        if (!ecrite) {
            // 🔧 #466/CO-16 (21 août 2026) : silence total quand l'échelle éditée
            // n'est pas dans le namespace du trimestre actif (édition à cheval
            // sur une bascule). Refus bruyant, patron de la sentinelle horaire.
            console.warn('[Échelles] Sauvegarde refusée : échelle', echelleTemplateActuelle.id, 'absente du trimestre actif', cle('echellesTemplates'));
            notifications.erreur(
                'Impossible d\'enregistrer cette échelle',
                'Elle n\'appartient pas au trimestre actif. Bascule sur son trimestre pour la modifier.'
            );
            return false;
        }

        // Recharger la sidebar pour afficher le nouveau nom
        await afficherListeEchelles();
        await definirEchelleActive(echelleTemplateActuelle.id);
        return true;
    }
    return false;
}

/**
 * Supprime une échelle template
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Retire l'échelle du localStorage
 * 3. Met à jour l'affichage
 * 
 * UTILISÉ PAR:
 * - Bouton supprimer dans la liste des échelles (modal)
 * - Paramètre echelleId: ID de l'échelle à supprimer
 * 
 * SÉCURITÉ:
 * - Confirmation obligatoire avant suppression
 */
async function supprimerEchelle(echelleId) {
    // #648 — un seul chemin : remplacement si quelque chose la nomme, sinon la
    // question d'avant, sans un mot de plus (voir supprimerOuRemplacerEchelle).
    const resultat = await supprimerOuRemplacerEchelle(echelleId, { questionSimple: 'Supprimer cette échelle ?' });
    if (!resultat.supprimee) return;

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

    // #468/CO-05 (21 août 2026) : l'appel à afficherEchellesPerformance() est
    // RETIRÉ — la fonction n'a jamais existé dans le dépôt. Il levait un
    // ReferenceError juste AVANT la notification : l'échelle partait vraiment,
    // sans que l'utilisateur en soit averti. Retrait, pas réanimation.
    notifierEchelleSupprimee(resultat);
}

/* ===============================
   CHARGEMENT DANS LES SELECTS
   Pour utilisation dans d'autres modules
   =============================== */

/**
 * Met à jour les options des selects de critères selon l'échelle
 * Utilisé lors de l'évaluation pour afficher les bons niveaux
 * 
 * FONCTIONNEMENT:
 * 1. Récupère tous les selects de critères
 * 2. Pour chaque select:
 *    - Sauvegarde la valeur actuelle
 *    - Reconstruit les options avec les niveaux
 *    - Restaure la valeur si elle existe toujours
 * 
 * PARAMÈTRES:
 * @param {Array} niveaux - Array d'objets niveau à utiliser
 * 
 * UTILISÉ PAR:
 * - Module 04-productions lors du changement d'échelle
 * - Après le chargement d'une échelle pour une évaluation
 * 
 * FORMAT OPTION:
 * - value: code du niveau
 * - text: code - nom (ex: «E - Étendu»)
 */
function mettreAJourOptionsEchelle(niveaux) {
    const selects = document.querySelectorAll('#listeSelectsCriteres1 select.critere-select');

    selects.forEach(select => {
        const valeurActuelle = select.value;

        // Reconstruire les options avec les niveaux de l'échelle
        let optionsHTML = '<option value="">--</option>';
        niveaux.forEach(niveau => {
            const codeEchappe = echapperHtml(niveau.code);
            const nomEchappe = echapperHtml(niveau.nom);
            optionsHTML += `<option value="${codeEchappe}">${codeEchappe} - ${nomEchappe}</option>`;
        });

        select.innerHTML = optionsHTML;

        // Restaurer la valeur si elle existe toujours
        if (valeurActuelle && niveaux.find(n => n.code === valeurActuelle)) {
            select.value = valeurActuelle;
        }
    });
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 06-echelles.js
 * 3. Appeler initialiserModuleEchelles() depuis 99-main.js
 * 
 * DÉPENDANCES:
 * - echapperHtml() depuis 01-config.js
 * - Classes CSS depuis styles.css
 * 
 * LOCALSTORAGE:
 * - 'echellesTemplates': Array des échelles sauvegardées
 * 
 * MODULES DÉPENDANTS:
 * - 04-productions.js: Utilise les échelles pour l'évaluation
 * - 07-cartouches.js: Utilise les niveaux pour les rétroactions
 *
 * ÉVÉNEMENTS:
 * Tous les événements sont gérés via attributs HTML (onchange, onclick)
 * Pas d'addEventListener requis dans 99-main.js
 *
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */

/* ===============================
   EXPORT/IMPORT AVEC LICENCE CC
   =============================== */

/**
 * Exporte les échelles de performance avec métadonnées Creative Commons
 * Les exports incluent uniquement la structure des échelles et niveaux,
 * JAMAIS les données d'étudiants ou les évaluations
 *
 * FONCTIONNEMENT:
 * 1. Charge toutes les échelles depuis localStorage
 * 2. Ajoute métadonnées CC BY-NC-SA 4.0 (auteur, licence, version)
 * 3. Génère nom de fichier avec watermark CC
 * 4. Télécharge le fichier JSON
 *
 * FORMAT EXPORT:
 * {
 *   metadata: { licence, auteur_original, version, date, ... },
 *   contenu: { echelles: [...] }
 * }
 */
async function exporterEchelles() {
    const toutesEchelles = await db.get(cle('echellesTemplates')) || [];

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const echelles = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesEchelles, 'echelle')
        : toutesEchelles.filter(e => !e.estDemo && !e.auteurOriginal);
    const nbExclues = toutesEchelles.length - echelles.length;

    if (echelles.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune échelle personnelle à exporter.\n\n${nbExclues} échelle(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune échelle à exporter.');
        }
        return;
    }

    // Informer si des échelles ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Échelles de performance',
        `${echelles.length} échelle(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { echelles: echelles },
        'echelles',
        'Échelles de performance',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('echelles', { inclureLicence: true, precisionDate: 'minute' });

    // Télécharger
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.succes(`${echelles.length} échelle(s) exportée(s) avec succès`);
}

/**
 * Exporte l'échelle actuellement en cours d'édition
 * Avec support des métadonnées CC et suivi des contributeurs
 */
async function exporterEchelleActive() {
    if (!echelleTemplateActuelle) {
        alert('Aucune échelle sélectionnée à exporter.');
        return;
    }

    const echelles = await db.get(cle('echellesTemplates')) ||  [];
    const echelle = echelles.find(e => e.id === echelleTemplateActuelle.id);

    if (!echelle) {
        alert('Échelle introuvable.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Échelle de performance',
        echelle.nom
    );

    if (!metaEnrichies) {
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...echelle };

    // Si l'échelle a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (echelle.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Tu exportes un matériel créé par ' + echelle.metadata_cc.auteur_original + '.\n\n' +
            'Entre ton nom pour être crédité comme contributeur :\n' +
            '(Laisse vide si tu n\'as fait aucune modification)'
        );

        if (nomUtilisateur && nomUtilisateur.trim()) {
            // Ajouter le contributeur
            const contributeurs = echelle.metadata_cc.contributeurs || [];
            contributeurs.push({
                nom: nomUtilisateur.trim(),
                date: new Date().toISOString().split('T')[0],
                modifications: 'Modifications et adaptations'
            });

            // Créer les métadonnées enrichies
            contenuExport.metadata_cc = {
                ...echelle.metadata_cc,
                contributeurs: contributeurs
            };
        }
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(contenuExport, 'echelle-performance', echelle.nom, metaEnrichies);

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 🆕 Beta 95.3 : Nommage standardisé
    const nomFichier = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('echelle', { nom: echelle.nom, discipline: echelle.discipline, inclureLicence: true })
        : `echelle-${(echelle.nom || 'echelle').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes(`Échelle "${echelle.nom}" exportée avec succès`);
}

/**
 * Importe un fichier JSON pour remplacer l'échelle actuellement en cours d'édition
 * NOUVEAU (Beta 92): Support métadonnées Creative Commons
 */
async function importerDansEchelleActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Récupérer l'ID de l'échelle active
    if (!echelleTemplateActuelle || !echelleTemplateActuelle.id) {
        alert('Aucune échelle sélectionnée. Sélectionne d\'abord l\'échelle à remplacer.');
        event.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Valider que c'est bien une échelle
            if (!donnees || typeof donnees !== 'object') {
                alert('Le fichier JSON n\'est pas valide.');
                event.target.value = '';
                return;
            }

            // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata CC)
            let echelleImportee;
            let metadata = null;

            if (donnees.contenu) {
                // Nouveau format avec CC metadata
                metadata = donnees.metadata;
                echelleImportee = donnees.contenu;
            } else {
                // Ancien format direct
                echelleImportee = donnees;
            }

            // Afficher badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `Matériel sous licence ${metadata.licence}\n` +
                    `Auteur: ${metadata.auteur_original}\n` +
                    `Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `ATTENTION : cette action va remplacer l'échelle actuelle.\n\n` +
                `Veux-tu continuer ?`
            );

            if (!confirmation) {
                event.target.value = '';
                return;
            }

            // Préserver l'ID original et remplacer les données
            const echelleMiseAJour = {
                ...echelleImportee,
                id: echelleTemplateActuelle.id // Garder l'ID original
            };

            // Préserver les métadonnées CC si présentes
            if (metadata) {
                echelleMiseAJour.metadata_cc = metadata;
            }

            // ⚠ La collection est relue DANS la file : celle d'avant la
            // confirmation ne vaut plus rien. security-ok: `echelleImportee` est
            // déjà passée par la validation d'import en amont.
            let remplacee = false;
            await db.modifier(cle('echellesTemplates'), (lues) => {
                const echelles = lues || [];
                const index = echelles.findIndex(e => e.id === echelleTemplateActuelle.id);
                if (index === -1) return undefined;

                // Remplacer dans le tableau
                echelles[index] = echelleMiseAJour;
                remplacee = true;
                return echelles;
            }, []);

            if (!remplacee) {
                alert('Échelle introuvable.');
                event.target.value = '';
                return;
            }

            // Recharger l'échelle dans le formulaire
            await chargerEchellePourModif(echelleTemplateActuelle.id);

            // Rafraîchir la liste
            afficherEchellesExistantes();

            notifications.succes('Échelle importée et remplacée avec succès');

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
 * Importe des échelles depuis un fichier JSON avec gestion CC
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Vérifie et affiche la licence CC (si présente)
 * 3. Valide la structure des données
 * 4. Fusionne avec échelles existantes
 * 5. Rafraîchit l'interface
 *
 * GESTION LICENCE:
 * - Affiche badge CC si licence présente
 * - Avertit si pas de licence (droit d'auteur classique)
 * - Demande confirmation avant import
 *
 * @param {Event} event - Événement de changement du file input
 */
async function importerEchelles(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._echellesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // La classe `modal-import-echelles` cible la fermeture sans
            // impacter la bibliothèque ouverte en arrière-plan.
            const modal = document.createElement('div');
            modal.classList.add('modal-import-echelles');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px;">
                        <div data-apercu-cc-slot class="u-mb-15"></div>
                        <p><strong>Veux-tu importer ces échelles ?</strong></p>
                        <div class="u-flex-gap-10" style="margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportEchelles">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportEchelles">Importer</button>
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
            alert('Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les échelles
 * Fonction helper appelée depuis le modal de confirmation
 */
window.confirmerImportEchelles = async function(donnees) {
    try {
        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        let echellesImportees;

        if (donnees.contenu) {
            // Nouveau format avec CC metadata
            if (donnees.contenu.echelles) {
                // Batch export: { metadata, contenu: { echelles: [...] } }
                echellesImportees = donnees.contenu.echelles;
            } else {
                // Individual export: { metadata, contenu: { ...échelle... } }
                // Préserver metadata_cc dans l'échelle
                const echelle = { ...donnees.contenu };
                echelle.metadata_cc = donnees.metadata;
                echellesImportees = [echelle];
            }
        } else {
            // Ancien format direct
            echellesImportees = donnees.echelles || [donnees];
        }

        if (!Array.isArray(echellesImportees)) {
            throw new Error('Format invalide: échelles doit être un tableau');
        }

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeEchelles
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_ECHELLES || 'bibliothequeEchelles';
        // #599 — la fusion passe par la file : la Bibliothèque est
        // relue à l'instant de l'écriture. Hors file, un import et un ajout
        // concurrents s'écrasaient l'un l'autre.
        let nbAjoutees = 0;
        let nbMisesAJour = 0;

        const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE, (lues) => {
            const bibliotheque = lues || [];
            nbAjoutees = 0;
            nbMisesAJour = 0;
            echellesImportees.forEach(echelle => {
                const indexBiblio = bibliotheque.findIndex(e => e.id === echelle.id);
                if (indexBiblio >= 0) {
                    bibliotheque[indexBiblio] = { ...echelle, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                    nbMisesAJour++;
                } else {
                    bibliotheque.push({ ...echelle, dateAjoutBiblio: new Date().toISOString() });
                    nbAjoutees++;
                }
            });

            return bibliotheque;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE);   // lot F : geste hors témoin (confirmerImportEchelles)

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequeEchelles')) {
            await afficherBibliothequeEchelles();
        }

        const details = [];
        if (nbAjoutees > 0) details.push(`${nbAjoutees} nouvelle(s) échelle(s) ajoutée(s).`);
        if (nbMisesAJour > 0) details.push(`${nbMisesAJour} échelle(s) mise(s) à jour.`);
        details.push('Consulte « Échelles disponibles » pour les ajouter à ta barre latérale.');
        notifications.succes('Import réussi', details.join(' '));

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import.\n' + error.message);
    }
};

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.dupliquerEchelle = dupliquerEchelle;

// Exports des fonctions existantes (pour compatibilité)
window.initialiserModuleEchelles = initialiserModuleEchelles;
// Exposée pour la sentinelle #358 (garde anti-resemage du global hérité).
window._sonder574 = _sonder574;   // sonde console #574 (lecture seule)
window.supprimerEchelle = supprimerEchelle;
window.sauvegarderNomEchelle = sauvegarderNomEchelle;

// Export/Import avec licence CC
window.exporterEchelles = exporterEchelles;
window.exporterEchelleActive = exporterEchelleActive;
window.importerDansEchelleActive = importerDansEchelleActive;
window.importerEchelles = importerEchelles;

/* ===============================
   FONCTIONS SIDEBAR (Beta 80.5+)
   Layout 2 colonnes - Stubs minimaux
   =============================== */

async function afficherListeEchelles() {
    const echelles = await db.get(cle('echellesTemplates')) ||  [];

    const container = document.getElementById('sidebarListeEchelles');
    if (!container) {
        console.warn('   ⚠️ Élément sidebarListeEchelles introuvable');
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les échelles dans la bibliothèque
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const echellesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        echelles.filter(e => e.dansBibliotheque !== false)
    );

    // ✅ AJOUT (8 décembre 2025) : Bouton "Consulter la bibliothèque" en en-tête
    let html = `
        <div class="u-mb-15">
            <button data-action="afficherBibliothequeEchelles" class="btn btn-principal" style="width: 100%; font-size: 0.9rem;">
                Consulter la bibliothèque
            </button>
        </div>
    `;

    if (echellesDansBibliotheque.length === 0) {
        html += '<p class="sidebar-vide">Crée une nouvelle échelle ou puisez dans la bibliothèque</p>';
        container.innerHTML = html;
        return;
    }


    html += echellesDansBibliotheque.map(echelle => {
        const nomEchelle = echelle.nom || 'Sans titre';
        const nbNiveaux = echelle.niveaux?.length || 0;
        return `
            <div class="sidebar-item" data-id="${echelle.id}" data-action="ouvrirEchelleDepuisListe" data-param="${echelle.id}">
                <div class="sidebar-item-titre">${nomEchelle}</div>
                <div class="sidebar-item-badges"><span class="badge-caracteristique">${nbNiveaux} niveaux</span></div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * ✅ AJOUT (8 décembre 2025) : Afficher le modal de gestion de la bibliothèque d'échelles
 * Permet d'ajouter/retirer des échelles de la barre latérale
 * Avec filtre par discipline
 */
async function preparerDonneesBibliothequeEchelles() {
    const echelles = await db.get(cle('echellesTemplates')) || [];
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const echellesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        echelles.filter(e => e.dansBibliotheque !== false)
    );
    const echellesDisponibles = BibliothequeUI.filtrerParModeDemo(
        await obtenirToutesLesEchellesBibliotheque()
    );
    // #291 — réunion des deux magasins avant analyse (cf. grilles.js).
    const doublonsDetectes = analyserDoublons(
        reunirSources(echellesDansBibliotheque, echellesDisponibles), 'nom');

    // #327 — dossiers de classement (couche par-dessus, range par identité).
    const repsEchelles = (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.obtenir === 'function')
        ? window.repertoiresBibliotheque.obtenir('echelles')
        : [];
    const repParEchelle = {};
    repsEchelles.forEach(r => (r.itemIds || []).forEach(id => { repParEchelle[id] = r.id; }));

    // Section 1
    const cartesSection1 = echellesDansBibliotheque.map(echelle => ({
        nom: BibliothequeUI.formaterTitreDemo(echelle.nom || 'Sans titre', BibliothequeUI.estItemDemo(echelle)),
        id: echelle.id,
        afficherId: true,
        badgeSource: BibliothequeUI.genererBadgeSource(echelle, echellesDansBibliotheque),
        metadonnees: BibliothequeUI.formaterMetadonnees(echelle, {
            quantite: `${echelle.niveaux?.length || 0} niveau(x)`,
            discipline: true
        }),
        description: echelle.description || '',
        inspireDe: BibliothequeUI.formaterInspireDe(echelle),
        boutonPrincipal: { label: 'Dupliquer', action: 'dupliquerEchelleBibliotheque', param: echelle.id, classe: 'btn-confirmer', title: 'Créer une copie' },
        actionsMenu: [
            { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'echelle', param2: echelle.id, classe: 'btn-secondaire', title: 'Générer un fichier .lcz signé à transmettre (#329)' },
            { label: 'Retirer', action: 'retirerEchelleDeBibliotheque', param: echelle.id, classe: 'btn-secondaire', title: 'Retirer de la barre latérale (données conservées)' },
            { label: 'Supprimer', action: 'supprimerEchelleDefinitivement', param: echelle.id, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
        ]
    }));

    // Section 2 : #327 — cartes à plat (le groupage par dossier se fait au rendu
    // via repertoiresBibliotheque.grouper). Chaque carte porte au menu ⋮ les
    // actions « Classer dans … » / « Retirer du dossier » selon son dossier courant.
    const cartesSection2 = echellesDisponibles.map(echelle => {
        const dejaPresent = echelles.some(e => (e.id === echelle.id || e.idOriginal === echelle.id) && e.dansBibliotheque !== false);
        const estGabarit = echelle.estGabarit === true;
        const styleGabarit = estGabarit ? 'border-left: 4px solid var(--gabarit-couleur); background: var(--gabarit-fond);' : '';
        const gabaritBadge = estGabarit ? '<span style="font-size: 0.7rem; color: var(--gabarit-couleur); font-weight: 500;">(gabarit)</span>' : '';

        const repCourant = repParEchelle[echelle.id] || null;
        const actionsMenu = [];
        repsEchelles.forEach(r => {
            if (r.id !== repCourant) {
                actionsMenu.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classer', param: 'echelles', param2: echelle.id, param3: r.id, classe: 'btn-secondaire', title: 'Ranger dans ce dossier' });
            }
        });
        if (repCourant) {
            actionsMenu.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirer', param: 'echelles', param2: echelle.id, classe: 'btn-secondaire', title: 'Sortir du dossier (repasse en non classées)' });
        }
        actionsMenu.push({ label: 'Supprimer', action: 'supprimerEchelleDeBibliothequePartagee', param: echelle.id, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque', showAlways: true });

        return {
            nom: BibliothequeUI.formaterTitreDemo(echelle.nom || 'Sans titre', BibliothequeUI.estItemDemo(echelle)) + ' ' + gabaritBadge,
            id: echelle.id,
            afficherId: true,
            badgeSource: BibliothequeUI.genererBadgeSource(echelle, echellesDansBibliotheque),
            metadonnees: BibliothequeUI.formaterMetadonnees(echelle, {
                quantite: `${echelle.niveaux?.length || 0} niveau(x)`,
                discipline: true
            }),
            inspireDe: BibliothequeUI.formaterInspireDe(echelle),
            description: echelle.description || '',
            dejaPresent: dejaPresent,
            classeItem: 'echelle-disponible-item',
            styleExtra: styleGabarit,
            boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterEchelleIndividuelle', param: echelle.id, classe: 'btn-confirmer', title: 'Ajouter cette échelle à ta sélection' },
            actionsMenu: actionsMenu
        };
    });

    // Import trimestre
    const trimestresDisponibles = typeof listerTrimestresAvecEchelles === 'function' ? listerTrimestresAvecEchelles() : [];
    const sectionImportTrimestre = trimestresDisponibles.length > 0 ? { trimestres: trimestresDisponibles } : null;

    return { cartesSection1, cartesSection2, doublonsDetectes, sectionImportTrimestre, repsEchelles, echellesDansBibliotheque };
}

async function afficherBibliothequeEchelles() {
    // #327 — enregistre la biblio « echelles » auprès du helper générique de
    // répertoires (idempotent). Les items de Section 2 sont des cartes-config
    // déjà libellées : labelItem lit leur .nom tel quel.
    BibliothequeUI.repertoires.enregistrer('echelles', {
        rafraichir: afficherBibliothequeEchelles,
        ajouterItem: (id) => ajouterEchelleIndividuelle(id),
        supprimerItem: (id) => supprimerEchelleDeBibliothequePartagee(id),
        labelItem: (c) => c.nom,
        labelPluriel: 'échelles'
    });

    const data = await preparerDonneesBibliothequeEchelles();

    // Section 1
    let contenuSection1 = '';
    if (data.cartesSection1.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune échelle dans la barre latérale</p>';
    } else {
        data.cartesSection1.forEach(carte => {
            contenuSection1 += BibliothequeUI.renderCarteSelection(carte);
        });
    }

    const boutonsApresSection1 = `
        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button data-action="ajouterMesEchellesALaBibliotheque" class="btn btn-principal btn-mini">Ajouter mes échelles à la bibliothèque</button>
            <button data-action="exporterEchelles" class="btn btn-secondaire btn-mini">Exporter toutes mes échelles (JSON)</button>
            <button data-action="ouvrirFilePickerImportEchelles" class="btn btn-secondaire btn-mini">Importer des échelles (JSON)</button>
            <button data-action="partageImport.ouvrirSelecteurFichier" class="btn btn-secondaire btn-mini">Importer un partage (.lcz)</button>
            <input type="file" id="fichier-import-echelles-modal" accept=".json" style="display: none;" data-on-change="importerEchelles">
        </div>`;

    // Section import trimestre
    let sectionImportTrimestre = '';
    if (data.sectionImportTrimestre) {
        const trimestres = data.sectionImportTrimestre.trimestres;
        sectionImportTrimestre = `
            <div style="margin-top: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 6px; border: 1px solid var(--bordure-claire);">
                <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre</h4>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectTrimestreImportEchelles" class="controle-form" style="flex: 1; min-width: 200px;">
                        <option value="">-- Choisir un trimestre --</option>
                        ${trimestres.map(t => `<option value="${echapperHtml(t.cle)}">${t.nom} (${t.nombre} échelle${t.nombre > 1 ? 's' : ''})</option>`).join('')}
                    </select>
                    <button data-action="afficherEchellesTrimestreModal" class="btn btn-secondaire btn-compact">Voir les échelles</button>
                    <button data-action="importerToutEchellesTrimestreModal" class="btn btn-principal btn-compact">Tout importer</button>
                </div>
                <div id="previewEchellesTrimestre" class="u-hide" style="margin-top: 10px;"></div>
            </div>`;
    }

    // Filtres Section 2 : #327 — filtres discipline ET pratique retirés (incohérents
    // avec l'organisation par dossiers). La zone « Mes dossiers » (repliable) tient
    // lieu de tête de section ; le toggle « masquer déjà présents » (#293) est conservé.
    const filtresHTML = BibliothequeUI.repertoires.genererZone('echelles') +
        BibliothequeUI.renderToggleMasquerDejaPresent('afficherBibliothequeEchelles');

    // Section 2 — #293 (masquer déjà présents) puis #327 (groupage par dossier).
    const cartesAffichables = BibliothequeUI.filtrerParDejaPresent(data.cartesSection2);
    const enteteGroupe = (titre) => `<h4 style="margin:18px 0 8px; padding-bottom:4px; border-bottom:1px solid var(--bordure, #ddd); color:var(--texte-secondaire, #555); font-size:0.95rem;">${echapperHtml(titre)}</h4>`;

    let contenuSection2 = '';
    if (cartesAffichables.length === 0) {
        contenuSection2 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune échelle disponible à ajouter</p>';
    } else if (data.repsEchelles && data.repsEchelles.length === 0) {
        // Aucun dossier → liste à plat (comportement d'origine)
        cartesAffichables.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
    } else {
        // Dossier → select compact ; « Non classées » → cartes (ce qui reste à ranger).
        const groupes = window.repertoiresBibliotheque.grouper(cartesAffichables, 'echelles');
        groupes.forEach(g => {
            const cleGroupe = g.id || '__nonclasse__';
            contenuSection2 += `<div class="biblio-groupe-repertoire" data-repertoire-id="${echapperHtml(cleGroupe)}">`;
            contenuSection2 += enteteGroupe(g.titre);
            if (g.id) {
                contenuSection2 += BibliothequeUI.repertoires.renderLigneDossierSelect('echelles', g);
            } else {
                g.items.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
            }
            contenuSection2 += `</div>`;
        });
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeEchelles',
        titre: "Bibliothèque d'échelles de performance",
        sousTitre: 'Gérez les échelles de performance affichées dans la barre latérale.',
        onFermer: 'fermerModalBibliothequeEchelles',
        doublonsHTML: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes, {
            itemsSelection: data.echellesDansBibliotheque,
            actions: {
                retirer: 'retirerEchelleDeBibliotheque',
                supprimer: 'supprimerEchelleDefinitivement',
                supprimerPartagee: 'supprimerEchelleDeBibliothequePartagee'
            }
        }),
        titreSection1: 'Échelles dans la barre latérale',
        contenuIdListe1: 'listeEchellesDansBibliotheque',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        sectionImportTrimestre: sectionImportTrimestre,
        titreSection2: 'Échelles disponibles à ajouter à la barre latérale',
        filtresSection2: filtresHTML,
        contenuIdListe2: 'listeEchellesDisponibles',
        contenuSection2: contenuSection2,
        sectionPartages: window.partageSection ? partageSection.genererSectionHTML('echelle') : ''
    });
}

/**
 * ✅ AJOUT (8 décembre 2025) : Retirer une échelle de la bibliothèque (soft delete)
 * @param {string} id - ID de l'échelle à retirer
 */
/**
 * ✅ AJOUT (8 décembre 2025) : Ajoute une échelle individuelle à la bibliothèque
 */
async function ajouterEchelleIndividuelle(id) {
    try {
        // ⚠ La garde d'identité de #476 doit voir la collection telle qu'elle
        // est AU MOMENT DE L'ÉCRITURE : lue hors file, elle laisserait passer
        // un doublon ajouté entre-temps. Tout le geste entre donc dans la file,
        // et les deux messages sortent APRÈS — la file ne porte que l'écriture.
        let echelle = null;
        let nomEnConflit = null;
        let sourceIntrouvable = false;

        const ecritLotF = await db.modifier(cle('echellesTemplates'), async (lues) => {
            let echelles = lues || [];
            let trouvee = echelles.find(e => e.id === id);
            if (!trouvee) {
                trouvee = echelles.find(e => e.idOriginal === id);
            }

            if (!trouvee) {
                const toutesEchelles = await obtenirToutesLesEchellesBibliotheque();
                const echelleSource = toutesEchelles.find(e => e.id === id);
                if (!echelleSource) {
                    sourceIntrouvable = true;
                    return undefined;
                }
                // Générer un nouvel ID pour éviter les conflits (pattern Productions)
                const nouvelId = genererIdUnique('ECH_');
                trouvee = {
                    ...echelleSource,
                    id: nouvelId,
                    idOriginal: echelleSource.id,
                    dansBibliotheque: true,
                    dateImport: new Date().toISOString()
                };
                // #476 — garde d'identité au point d'écriture (cf. grilles.js).
                const gardeEchelle = ajouterAvecGardeIdentite(echelles, trouvee);
                if (!gardeEchelle.ajoute) {
                    nomEnConflit = (gardeEchelle.conflit && gardeEchelle.conflit.nom) || 'Une échelle';
                    return undefined;
                }
                echelles = gardeEchelle.liste;
            } else {
                trouvee.dansBibliotheque = true;
            }

            echelle = trouvee;
            return echelles;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('echellesTemplates'));   // lot F : geste hors témoin (ajouterEchelleIndividuelle)

        if (nomEnConflit) {
            alert(`« ${nomEnConflit} » est déjà dans ta sélection.\n\nPour en avoir un second exemplaire, utilise « Dupliquer ».`);
            return;
        }
        if (sourceIntrouvable) {
            alert('Échelle introuvable');
            return;
        }
        if (!echelle) return;

        // ⚠ Relecture-vérification : `db.set` refuse en silence (cf. grilles.js).
        const verifEchelle = await db.get(cle('echellesTemplates')) || [];

        fermerModalBibliothequeEchelles();
        await afficherListeEchelles();
        await afficherBibliothequeEchelles();

        if (!verifEchelle.some(e => e.id === echelle.id)) {
            console.error('[echelles] Écriture non confirmée —', echelle.id, 'absente après db.set.');
            alert(`« ${echelle.nom || 'Échelle'} » n'a PAS pu être ajoutée.\n\nL'enregistrement a été refusé. Ouvre la console pour la raison.`);
            return;
        }

        notifications.succes('Échelle ajoutée à ta sélection !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de l\'échelle');
    }
}

async function retirerEchelleDeBibliotheque(id) {
    const ecritLotF = await db.modifier(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelle = echelles.find(e => e.id === id);
        if (!echelle) return undefined;

        // Soft delete : marquer comme non présente dans la bibliothèque
        echelle.dansBibliotheque = false;
        return echelles;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('echellesTemplates'));   // lot F : geste hors témoin (retirerEchelleDeBibliotheque)

    // Rafraîchir les affichages
    await afficherListeEchelles();
    fermerModalBibliothequeEchelles();
    await afficherBibliothequeEchelles();

}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une échelle (hard delete)
 * @param {string} id - ID de l'échelle à supprimer
 */
async function supprimerEchelleDefinitivement(id) {
    // #648 (3 septembre 2026) — ce chemin vide l'ancrage ET la Bibliothèque. Le
    // remplacement passe d'abord, par le chemin partagé des trois gestes de
    // Conception (supprimerOuRemplacerEchelle) ; sans porteur, la question
    // d'avant, mot pour mot. Le commentaire #650 qui disait « ce chemin ne
    // vérifie aucune dépendance » n'a plus lieu d'être : il en vérifie autant
    // que les autres, parce que c'est le même code.
    // ⚠ Lecture hors file, pour NOMMER l'échelle dans la question.
    const echelles = await db.get(cle('echellesTemplates')) || [];
    const echelle = echelles.find(e => e.id === id);
    if (!echelle) return;

    const resultat = await supprimerOuRemplacerEchelle(id, {
        questionSimple: `Supprimer définitivement l'échelle «${echelle.nom}» ?\n\nCette action est irréversible.`
    });
    if (!resultat.supprimee) return;

    // Suppression du store partagé
    if (typeof retirerEchelleDeLaBibliotheque === 'function') {
        await retirerEchelleDeLaBibliotheque(id);
    }

    // Rafraîchir UI
    fermerModalBibliothequeEchelles();
    await afficherListeEchelles();
    await afficherBibliothequeEchelles();
    notifierEchelleSupprimee(resultat);
}

/**
 * Supprimer une échelle de la Bibliothèque uniquement (Section 2)
 * @param {string} id - ID de l'échelle à supprimer
 */
async function supprimerEchelleDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesEchellesBibliotheque === 'function'
        ? await obtenirToutesLesEchellesBibliotheque()
        : [];
    const echelle = biblio.find(e => e.id === id);
    if (!echelle) return;

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('echelleBibliotheque'))) return;
    if (!confirm(`Supprimer définitivement «${echelle.nom || 'Sans titre'}» de la Bibliothèque ?\n\nCette action est irréversible.`)) return;

    // #468/CO-25 (21 août 2026) : poser le tombstone AVANT le retrait. Sans lui,
    // un gabarit fourni par défaut revenait au prochain chargement — la
    // suppression semblait marcher, puis se défaisait toute seule.
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    await retirerEchelleDeLaBibliotheque(id);

    fermerModalBibliothequeEchelles();
    await afficherBibliothequeEchelles();
}

/**
 * Ajouter toutes les échelles locales à la Bibliothèque
 */
async function ajouterMesEchellesALaBibliotheque() {
    try {
        const echelles = await db.get(cle('echellesTemplates')) || [];

        if (echelles.length === 0) {
            alert('Aucune échelle à ajouter.\n\nCréez d\'abord des échelles.');
            return;
        }

        if (!confirm(`Veux-tu ajouter tes ${echelles.length} échelle(s) à la Bibliothèque ?\n\nElles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`)) return;

        const resultat = await importerEchellesDansBibliotheque(echelles);

        fermerModalBibliothequeEchelles();
        await afficherBibliothequeEchelles();

        if (resultat.ajoutees > 0) {
            notifications.succes(
                `${resultat.ajoutees} échelle(s) ajoutée(s) à la bibliothèque !`,
                resultat.existantes > 0 ? `${resultat.existantes} étai(en)t déjà présente(s).` : ''
            );
        } else {
            notifications.info('Toutes tes échelles étaient déjà dans la bibliothèque.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        alert('Erreur lors de l\'ajout des échelles à la bibliothèque.');
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une échelle dans la bibliothèque
 * @param {string} id - ID de l'échelle à dupliquer
 */
async function dupliquerEchelleBibliotheque(id) {
    // #476 volet 2 — séquence partagée (BibliothequeUI.dupliquerVersBibliotheque).
    await BibliothequeUI.dupliquerVersBibliotheque({
        id: id,
        prefixeId: 'ECH_',
        modifierListe: (mutateur) => db.modifier(cle('echellesTemplates'), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
        nommerLaCopie: (copie, source, liste) => { copie.nom = nommerCopie(source.nom, liste); },
        forgerProvenance: (source) => BibliothequeUI.forgerInspireDe(source),
        siIntrouvable: () => alert('Échelle introuvable'),
        rafraichirUI: async () => {
            fermerModalBibliothequeEchelles();
            await afficherListeEchelles();
            await afficherBibliothequeEchelles();
        }
    });
}

/**
 * ✅ AJOUT (8 décembre 2025) : Ajouter les échelles sélectionnées à la bibliothèque
 */
async function ajouterEchellesABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeEchellesDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Sélectionne au moins une échelle à ajouter.');
        return;
    }

    const echellesBibliotheque = obtenirToutesLesEchellesBibliotheque();

    let nbAjoutees = 0;

    await db.modifier(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        nbAjoutees = 0;

        checkboxes.forEach(checkbox => {
            const echelleId = checkbox.value;

            // Trouver l'échelle dans la bibliothèque
            const echelleBiblio = echellesBibliotheque.find(e => e.id === echelleId);
            if (!echelleBiblio) return;

            // Vérifier si déjà présente
            const echelleExistante = echelles.find(e => e.id === echelleId);

            if (echelleExistante) {
                // Réactiver une échelle retirée
                echelleExistante.dansBibliotheque = true;
                nbAjoutees++;
            } else {
                // Ajouter nouvelle échelle
                const nouvelleEchelle = {
                    ...echelleBiblio,
                    id: echelleId + '-local',  // Ajouter suffix pour éviter conflits
                    dansBibliotheque: true
                };
                echelles.push(nouvelleEchelle);
                nbAjoutees++;
            }
        });

        return echelles;
    }, []);

    // Rafraîchir les affichages
    await afficherListeEchelles();
    fermerModalBibliothequeEchelles();

    if (nbAjoutees > 0) {
        notifications.succes(`${nbAjoutees} échelle(s) ajoutée(s) à la barre latérale`);
    }
}

// #327 — filtrerEchellesParDiscipline + filtrerEchellesBibliotheque retirés :
// les filtres discipline/pratique n'existent plus (incohérents avec l'organisation
// par dossiers). Remplacés par la zone « Mes dossiers » + le groupage par dossier
// dans afficherBibliothequeEchelles.

/**
 * ✅ AJOUT (8 décembre 2025) : Fermer le modal de bibliothèque
 */
function fermerModalBibliothequeEchelles() {
    BibliothequeUI.fermerModal('modalBibliothequeEchelles');
}

/**
 * 🆕 Beta 95.3 : Afficher la prévisualisation des échelles d'un trimestre
 */
/** État de la section d'import, à reposer après reconstruction du modal. */
function etatImportEchelles() {
    return BibliothequeUI.capturerImportTrimestre({
        modalId: 'modalBibliothequeEchelles',
        selects: ['selectTrimestreImportEchelles'],
        apercu: 'previewEchellesTrimestre'
    });
}

function afficherEchellesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportEchelles');
    const preview = document.getElementById('previewEchellesTrimestre');

    if (!select || !preview) return;

    const cleSelectionnee = select.value;
    if (!cleSelectionnee) {
        preview.classList.add('u-hide');
        return;
    }

    const echelles = typeof obtenirEchellesTrimestre === 'function'
        ? obtenirEchellesTrimestre(cleSelectionnee)
        : [];

    if (echelles.length === 0) {
        preview.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucune échelle trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    let html = '<div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--bordure-claire); border-radius: 4px; padding: 10px;">';
    echelles.forEach(echelle => {
        const nbNiveaux = echelle.niveaux?.length || 0;
        html += `
            <div style="padding: 8px; border-bottom: 1px solid var(--bordure-claire); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${echelle.nom || 'Sans titre'}</strong>
                    ${echelle.discipline ? ` - ${echelle.discipline}` : ''}
                    <br><small style="color: var(--gris-moyen);">${nbNiveaux} niveau(x)${echelle.auteurOriginal ? ' • ' + echelle.auteurOriginal : ''}</small>
                </div>
                <button data-action="importerUneEchelleTrimestre" data-param="${cleSelectionnee}" data-param2="${echelle.id}" class="btn btn-confirmer btn-tres-compact">
                    Importer
                </button>
            </div>
        `;
    });
    html += '</div>';

    preview.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * 🆕 Beta 95.3 : Importer toutes les échelles d'un trimestre
 */
async function importerToutEchellesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportEchelles');
    if (!select || !select.value) {
        alert('Sélectionne d\'abord un trimestre.');
        return;
    }

    const cleSelectionnee = select.value;
    const codeTrimestre = cleSelectionnee.replace('_echelles', '');
    const nomTrimestre = typeof formaterNomTrimestreEchelles === 'function'
        ? formaterNomTrimestreEchelles(codeTrimestre)
        : codeTrimestre;

    const echelles = typeof obtenirEchellesTrimestre === 'function'
        ? obtenirEchellesTrimestre(cleSelectionnee)
        : [];

    if (echelles.length === 0) {
        alert('Aucune échelle à importer dans ce trimestre.');
        return;
    }

    const confirmation = confirm(
        `Veux-tu importer les ${echelles.length} échelle(s) de ${nomTrimestre} dans la Bibliothèque ?`
    );

    if (!confirmation) return;

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportEchelles();

    // Importer chaque échelle
    let ajoutees = 0;
    let existantes = 0;

    for (const echelle of echelles) {
        const resultat = await ajouterEchelleALaBibliotheque(echelle);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    // Rafraîchir l'affichage
    fermerModalBibliothequeEchelles();
    await afficherBibliothequeEchelles();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherEchellesTrimestreModal);

    notifications.succes('Import terminé', `${ajoutees} échelle(s) ajoutée(s) • ${existantes} déjà présente(s).`);
}

/**
 * 🆕 Beta 95.3 : Importer une seule échelle d'un trimestre
 */
async function importerUneEchelleTrimestre(cleTrimestre, echelleId) {
    const echelles = typeof obtenirEchellesTrimestre === 'function'
        ? obtenirEchellesTrimestre(cleTrimestre)
        : [];
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        alert('Échelle introuvable.');
        return;
    }

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportEchelles();

    const resultat = await ajouterEchelleALaBibliotheque(echelle);

    if (resultat) {
        // Rafraîchir l'affichage
        fermerModalBibliothequeEchelles();
        await afficherBibliothequeEchelles();
        await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherEchellesTrimestreModal);
        notifications.succes(`"${echelle.nom || 'Échelle'}" ajoutée à la bibliothèque.`);
    } else {
        notifications.info('Cette échelle est déjà dans la bibliothèque.');
    }
}

async function creerNouvelleEchelle() {
    // Lot E1 (D3) : une échelle en cours de création ne se perd pas sans question.
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('echelle'))) return;
    document.getElementById('accueilEchelles').classList.add('u-hide');
    document.getElementById('conteneurEditionEchelle').classList.remove('u-hide');

    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    // Les boutons Import/Export sont maintenant dans l'en-tête

    // Masquer les boutons Exporter, Importer, Dupliquer et Supprimer (mode création)
    // Note: Export/Import se font maintenant via la bibliothèque
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');
    rendreModeFicheEchelle(true);

    // #1042 — un exemple ouvert juste avant a verrouillé ce formulaire : le rouvrir d'abord.
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.quitterModeLectureSeuleDemo) BibliothequeUI.quitterModeLectureSeuleDemo(document.getElementById('conteneurEditionEchelle'));
    // Réinitialiser le formulaire
    document.getElementById('nomEchelleTemplate').value = '';
    document.getElementById('descriptionEchelle').value = '';

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesEchelle');
    if (panneauMeta) panneauMeta.innerHTML = '';

    // Initialiser avec 4 niveaux vides par défaut (structure typique)
    window._niveauxNouvelleEchelle = [
        { code: '', nom: '', min: 90, max: 100, valeurCalcul: 95, couleur: '#27ae60' },
        { code: '', nom: '', min: 75, max: 89, valeurCalcul: 82, couleur: '#3498db' },
        { code: '', nom: '', min: 60, max: 74, valeurCalcul: 67, couleur: '#f39c12' },
        { code: '', nom: '', min: 0, max: 59, valeurCalcul: 30, couleur: '#e74c3c' }
    ];

    // #555 lot 2 (e) — les repères d'une échelle NEUVE vivent dans un tampon
    // jusqu'à l'enregistrement, comme ses niveaux. Toujours vide au départ :
    // l'absence est l'état légitime, rien n'est deviné.
    window._reperesNouvelleEchelle = {};

    // Afficher les niveaux avec placeholders
    afficherNiveauxNouvelleEchelle();

    // Réinitialiser la référence à l'échelle actuelle
    echelleTemplateActuelle = null;

}

/**
 * Ajoute le premier niveau lors de la création d'une nouvelle échelle
 * Cette fonction est utilisée quand echelleTemplateActuelle est null
 */
function ajouterPremierNiveau() {
    // Créer une structure temporaire pour la nouvelle échelle
    const niveauxTemp = [
        {
            code: 'N1',
            nom: 'Nouveau niveau',
            min: 0,
            max: 100,
            valeurCalcul: 50,
            couleur: '#3498db'
        }
    ];

    // Stocker temporairement les niveaux
    window._niveauxNouvelleEchelle = niveauxTemp;

    // Afficher le tableau des niveaux avec le bouton pour en ajouter d'autres
    afficherNiveauxNouvelleEchelle();
}

/**
 * Affiche les niveaux pour une nouvelle échelle (pas encore sauvegardée)
 * Format identique aux échelles existantes avec placeholders
 */
/* ===============================
   🎓 NIVEAU SOLO ATTEINT — LE MENU DE L'ÉCHELLE (#542 lot 2)
   =============================== */

/**
 * Les cinq niveaux canoniques de la taxonomie SOLO, pour le menu « Niveau SOLO
 * atteint » des DEUX éditeurs d'échelle.
 *
 * ⚠⚠ DEUX SOLO, DEUX QUESTIONS DIFFÉRENTES — ET C'EST VOULU.
 *
 *   · SOLO sur le CRITÈRE de grille (`grilles.js`) : « quelle complexité ce
 *     critère EXIGE-t-il ? » — une VISÉE didactique. TROIS valeurs, parce qu'on
 *     ne conçoit jamais un critère qui vise l'unistructurel. C'est ce champ qui
 *     pilote l'IPB, lequel ne surveille que les critères « multistructurels »,
 *     les FONDATIONS.
 *
 *   · SOLO sur le NIVEAU d'échelle (ici) : « quelle complexité la réponse
 *     ATTEINT-elle ? » — un CONSTAT. CINQ valeurs, parce qu'une réponse, elle,
 *     peut être préstructurelle.
 *
 * ⮕ ON AJOUTE, ON NE DÉPLACE PAS (décision de Grégoire, 26 août 2026).
 *   Déplacer SOLO du critère vers l'échelle ferait perdre l'IPB : un élève qui
 *   bloque sur un critère « fondation » n'a pas les bases, tandis qu'un élève
 *   qui bute sur un critère de nuance bute sur ce qui est difficile pour tout le
 *   monde. Les compter pareil produirait des faux positifs en série.
 *
 * ⮕ QUE LES DEUX MENUS SOIENT VISIBLEMENT DIFFÉRENTS EST UN ACQUIS, PAS UN
 *   DÉFAUT : c'est ce qui apprend à l'utilisateur qu'il ne répond pas à la même
 *   question.
 *
 * ⮕ FACULTATIF, et ça compte : toutes les échelles n'ont pas de lecture SOLO —
 *   une échelle en pourcentages, une échelle A/B/C/D. « aucun » est une réponse
 *   légitime, pas un champ à remplir.
 *
 * ⮕ PAS D'ENTRÉE COMPOSITE, pas de sélection multiple : chaque lecteur du champ
 *   n'a qu'une étiquette à traiter. La nuance « I couvre aussi le
 *   préstructurel » reste dans la `description`, qui est le texte que l'élève
 *   lit.
 */
// ⮕ #542 lot 3, pas 2 — LA DESCRIPTION REJOINT LE LIBELLÉ, DANS LA MÊME SOURCE.
//
// Les quatre premières descriptions ne sont pas neuves : elles étaient écrites
// en dur dans `interpreterScoreIDME` (`profil-etudiant-sections-affichage.js`),
// choisies par une comparaison à 0,64 / 0,75 / 0,85 — les bornes de l'échelle de
// Grégoire recopiées dans le code. Elles sont RAPATRIÉES ici telles quelles :
// c'est leur mode de SÉLECTION qui était fautif, pas leur texte. Désormais elles
// sont attachées à l'étiquette SOLO du niveau, et c'est l'utilisateur qui décide
// quel niveau de SON échelle porte quelle étiquette.
//
// ⚠ « Préstructurel » est la SEULE description que le dépôt n'avait pas :
// l'ancien code n'en produisait que quatre, pour cinq niveaux SOLO. Celle-ci a
// donc été écrite à neuf, d'après la définition de la taxonomie —
// ✅ VALIDÉE PAR GRÉGOIRE le 27 août 2026, telle quelle.
//
// ✅ DÉCISION D4 DE LA PORTE TERRAIN (27 août) : « les longues ». Le dépôt
// portait TROIS formulations concurrentes des mêmes niveaux ; ce sont celles de
// la carte « Observation de la structure » qui sont retenues, reprises mot pour
// mot. Les courtes qui vivaient ici sont retirées — le chantier ne les empile
// pas à côté.
//
// ⏳ DEUX ÉCARTS SIGNALÉS À GRÉGOIRE, NON TRANCHÉS, ET VOLONTAIREMENT LAISSÉS :
//   · « préstructurel » garde sa formulation COURTE — il n'en existait pas de
//     longue à reprendre, et en écrire une serait décider d'un vocabulaire
//     pédagogique à sa place ;
//   · les quatre longues emploient « il/elle », un accord lourd que sa convention
//     d'écriture inclusive demande de reformuler. Elles sont reprises TELLES
//     QUELLES parce que sa décision porte sur ces textes-là ; la reformulation
//     est un geste distinct, et c'est le sien.
const NIVEAUX_SOLO_ECHELLE = [
    { valeur: 'prestructurel', libelle: 'Préstructurel',
      description: 'Aucun aspect pertinent n\'est traité' },
    { valeur: 'unistructurel', libelle: 'Unistructurel',
      description: 'À ce niveau unistructurel, l\'étudiant·e ne traite que d\'un seul aspect du savoir ou d\'un savoir-faire à la fois. L\'étudiant·e n\'a pas encore de réelle compréhension.' },
    { valeur: 'multistructurel', libelle: 'Multistructurel',
      description: 'À ce niveau multistructurel, l\'étudiant·e peut se concentrer sur plusieurs points pertinents à la fois. Cependant, il/elle les considère indépendamment.' },
    { valeur: 'relationnel', libelle: 'Relationnel',
      description: 'À ce niveau relationnel, l\'étudiant·e peut comprendre, lier et intégrer plusieurs aspects d\'une réponse dans un tout cohérent. Il/elle voit plusieurs aspects d\'une situation et sait l\'aborder de différentes façons.' },
    { valeur: 'abstrait_etendu', libelle: 'Abstrait étendu',
      description: 'À ce niveau abstrait étendu, l\'étudiant·e a la capacité de généraliser la structure au-delà de l\'information donnée. Il/elle comprend et il/elle est capable de transférer ses apprentissages à des contextes proches.' }
];

/**
 * Rend les <option> du menu SOLO d'un niveau d'échelle.
 *
 * UN SEUL producteur pour les DEUX éditeurs : `echelles.js` en porte deux
 * copies du même formulaire, et toute duplication y a fini par diverger. C'est
 * le patron que #529 a eu à défaire (deux replis aux valeurs différentes selon
 * le chemin emprunté), et celui que #542 a rejoué dans la conversion.
 *
 * @param {string} valeurCourante - `niveauSOLO` du niveau, ou vide
 * @returns {string} les <option>, « aucun » en tête et sélectionné par défaut
 */
function optionsNiveauSOLOEchelle(valeurCourante) {
    const v = String(valeurCourante == null ? '' : valeurCourante);
    let html = `<option value=""${v === '' ? ' selected' : ''}>— aucun —</option>`;
    for (const n of NIVEAUX_SOLO_ECHELLE) {
        // `n` vient de la constante `NIVEAUX_SOLO_ECHELLE` — aucune donnée
        // utilisateur ici. On échappe quand même : la Défense E est un lint
        // STATIQUE, et lui poser une exemption reviendrait à lui apprendre à se
        // taire sur ce patron. Échapper une constante ne coûte rien ; une
        // exemption, elle, survit au jour où le contenu cesse d'être constant.
        html += `<option value="${echapperHtml(n.valeur)}"${v === n.valeur ? ' selected' : ''}>${echapperHtml(n.libelle)}</option>`;
    }
    return html;
}

function afficherNiveauxNouvelleEchelle() {
    const container = document.getElementById('tableauNiveauxEchelle');
    const apercuContainer = document.getElementById('apercuEchelleNiveaux');
    const niveaux = window._niveauxNouvelleEchelle || [];

    if (niveaux.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 8px; text-align: center; margin-bottom: 15px;">
                <p style="color: var(--gris-moyen); margin-bottom: 15px;">Aucun niveau défini.</p>
                <button class="btn btn-confirmer" data-action="ajouterPremierNiveau">
                    + Ajouter un niveau
                </button>
            </div>
        `;
        if (apercuContainer) apercuContainer.innerHTML = '';
        return;
    }

    // Placeholders pour guider l'utilisateur
    const placeholders = [
        { code: 'A', nom: 'Excellent' },
        { code: 'B', nom: 'Très bien' },
        { code: 'C', nom: 'Satisfaisant' },
        { code: 'D', nom: 'En développement' },
        { code: 'E', nom: 'Insuffisant' }
    ];

    const html = niveaux.map((niveau, index) => {
        const ph = placeholders[index] || { code: 'X', nom: 'Niveau' };
        return `
        <div class="item-liste" style="position: relative; padding: 15px 150px 15px 15px; background: var(--surface-conteneur, #162c36); margin-bottom: 10px;">
            ${/* Lot C (5 sept. 2026) — les chevrons et la corbeille en coin, sur la même ligne (le
                  modèle des productions) ; la cellule « Ordre » de la grille n'existe plus. */''}
            <div class="bloc-coin-outils">
                ${window.boutonsReordonnerBloc({
                    actionHaut: 'deplacerNiveauTempHaut', actionBas: 'deplacerNiveauTempBas',
                    param: index, premier: index === 0, dernier: index === niveaux.length - 1,
                    quoi: 'ce niveau'
                })}
                ${niveaux.length > 1 ? window.boutonRetirerBloc({
                    action: 'supprimerNiveauTemp',
                    param: index,
                    titre: 'Supprimer ce niveau'
                }) : ''}
            </div>
            <div class="echelle-niveau-grille">
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Code <span class="champ-requis" title="Champ obligatoire">*</span></label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(niveau.code)}"
                           placeholder="Ex: ${ph.code}"
                           maxlength="3"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="code"
                           style="font-weight: 600; text-align: center;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-niveau">Nom du niveau <span class="champ-requis" title="Champ obligatoire">*</span></label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(niveau.nom)}"
                           placeholder="Ex: ${ph.nom}"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="nom"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Min (%) <span class="champ-requis" title="Champ obligatoire">*</span>
                        <span class="primo-aide" data-target="echelle-plage-notes"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.min)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="min" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Max (%) <span class="champ-requis" title="Champ obligatoire">*</span></label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.max)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="max" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-valeur-ponctuelle">Valeur ponctuelle <span class="champ-requis" title="Champ obligatoire">*</span>
                        <span class="primo-aide" data-target="echelle-valeur-ponctuelle"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.valeurCalcul)}"
                           min="0"
                           max="100"
                           step="0.01"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="valeurCalcul" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Couleur</label>
                    ${window.travauxOutils.renderPickerCouleur(niveau.couleur, {
                        dataAttrs: {
                            'on-change': 'modifierNiveauTempHandler',
                            'niveau-index': index,
                            'champ': 'couleur'
                        }
                    })}
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Palier SOLO du niveau
                        <span class="echelle-texte-petit"> (facultatif)</span>
                    </label>
                    <select class="controle-form"
                            data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="niveauSOLO">
                        ${optionsNiveauSOLOEchelle(niveau.niveauSOLO)}
                    </select>
                </div>
            </div>
        </div>
    `}).join('');

    // Bouton ajouter niveau
    const btnAjouterNiveau = `
        <button class="sidebar-btn-ajouter" data-action="ajouterNiveauTemp">
            + Ajouter un niveau
        </button>
    `;

    // #555 lot 2 (e) — MÊME bloc de repères que l'éditeur vivant, sur le tampon.
    // Il n'apparaît que lorsque l'ordre des plages est lisible, donc jamais
    // avant que les codes soient saisis : on désigne des niveaux qui existent.
    const tampon = echelleNouvelleTampon();
    container.innerHTML = html + btnAjouterNiveau
        + blocReperesEchelle(tampon, { handler: 'modifierRepereTempHandler' });

    // Afficher l'aperçu visuel — le même que l'éditeur vivant : la zone de
    // chaque niveau s'y lit dès que les deux repères sont posés.
    if (apercuContainer) apercuContainer.innerHTML = apercuNiveauxEchelleHtml(tampon);
}

/**
 * L'échelle NEUVE telle qu'elle est en cours de saisie : ses niveaux et ses
 * repères, réunis en un objet que les mêmes lecteurs (`refusRepereEchelle`,
 * `blocReperesEchelle`, `apercuNiveauxEchelleHtml`) traitent comme une échelle
 * enregistrée. Pas d'`id` : rien n'est en base.
 */
function echelleNouvelleTampon() {
    return Object.assign(
        { id: null, niveaux: window._niveauxNouvelleEchelle || [] },
        window._reperesNouvelleEchelle || {}
    );
}

/**
 * Pose (ou retire) un repère sur l'échelle NEUVE, dans le tampon.
 *
 * ⮕ #555 lot 2 (e). Mêmes refus que `modifierRepereEchelle` — calculés par la
 * même fonction, sur le tampon — et même règle du vide : le vide RETIRE.
 * Rien n'est écrit en base ici ; c'est `sauvegarderEchelleComplete` qui
 * transporte les repères, après les avoir revérifiés contre les niveaux finaux.
 */
function modifierRepereTemp(champ, valeur) {
    if (!REPERES_ECHELLE[champ]) return { refuse: 'Repère inconnu.' };
    if (!window._reperesNouvelleEchelle) window._reperesNouvelleEchelle = {};

    const code = (valeur == null) ? '' : String(valeur).trim().toUpperCase();
    const refus = refusRepereEchelle(echelleNouvelleTampon(), champ, code);
    if (refus) return { refuse: refus };

    if (code === '') delete window._reperesNouvelleEchelle[champ];
    else window._reperesNouvelleEchelle[champ] = code;

    afficherNiveauxNouvelleEchelle();
    return { ok: true };
}

/**
 * Les repères du tampon, revérifiés contre les niveaux FINAUX de l'échelle
 * neuve. Rend `{ refuse }` au premier repère qui ne tient plus (un code renommé
 * après avoir été désigné, un ordre devenu illisible), sinon `{ reperes }` —
 * les seuls champs à écrire, sans clé vide.
 */
function reperesNouvelleEchellePourEnregistrement() {
    const tampon = echelleNouvelleTampon();
    const reperes = {};
    for (const champ of Object.keys(REPERES_ECHELLE)) {
        const code = tampon[champ];
        if (!code) continue;
        const refus = refusRepereEchelle(tampon, champ, code);
        if (refus) return { refuse: REPERES_ECHELLE[champ] + ' : ' + refus };
        reperes[champ] = code;
    }
    return { reperes };
}

/**
 * Modifie un niveau temporaire
 */
function modifierNiveauTemp(index, champ, valeur) {
    if (!window._niveauxNouvelleEchelle) return;
    // #524 — même règle que sur une échelle existante : un code ou un nom vide
    // n'entre pas. Une échelle neuve deviendra une échelle comme les autres.
    const refus = refusChampNiveau(champ, valeur);
    if (refus) return { refuse: refus };
    window._niveauxNouvelleEchelle[index][champ] = valeur;
    afficherNiveauxNouvelleEchelle();
    return { ok: true };
}

/**
 * Ajoute un niveau temporaire (vide avec couleur aléatoire)
 */
function ajouterNiveauTemp() {
    if (!window._niveauxNouvelleEchelle) {
        window._niveauxNouvelleEchelle = [];
    }
    // Couleurs prédéfinies pour les niveaux
    const couleurs = ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];
    const nbNiveaux = window._niveauxNouvelleEchelle.length;
    const couleur = couleurs[nbNiveaux % couleurs.length];

    window._niveauxNouvelleEchelle.push({
        code: '',
        nom: '',
        min: 0,
        max: 100,
        valeurCalcul: 50,
        couleur: couleur
    });
    afficherNiveauxNouvelleEchelle();
}

/**
 * Supprime un niveau temporaire
 */
function supprimerNiveauTemp(index) {
    if (!window._niveauxNouvelleEchelle) return;
    window._niveauxNouvelleEchelle.splice(index, 1);
    afficherNiveauxNouvelleEchelle();
}

/**
 * Déplace un niveau temporaire vers le haut
 */
function deplacerNiveauTempHaut(index) {
    if (!window._niveauxNouvelleEchelle || index <= 0) return;
    const niveaux = window._niveauxNouvelleEchelle;
    [niveaux[index - 1], niveaux[index]] = [niveaux[index], niveaux[index - 1]];
    afficherNiveauxNouvelleEchelle();
}

/**
 * Déplace un niveau temporaire vers le bas
 */
function deplacerNiveauTempBas(index) {
    if (!window._niveauxNouvelleEchelle) return;
    const niveaux = window._niveauxNouvelleEchelle;
    if (index >= niveaux.length - 1) return;
    [niveaux[index], niveaux[index + 1]] = [niveaux[index + 1], niveaux[index]];
    afficherNiveauxNouvelleEchelle();
}

/**
 * Annule l'édition d'une échelle et retourne à l'accueil
 */
/**
 * Lot E1 (D3) — une échelle existante s'enregistre toute seule : son pied ne montre
 * que « Fermer ». En création, « Créer l'échelle » : rien n'est écrit avant ce clic.
 * @param {boolean} enCreation
 */
function rendreModeFicheEchelle(enCreation) {
    const btnCreer = document.getElementById('btnCreerEchelle');
    if (btnCreer) btnCreer.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/** Lot E1 : « ma fiche est en création et porte une saisie » (ui-dialogues.js). */
function echelleEnCreationSaisie() {
    const conteneur = document.getElementById('conteneurEditionEchelle');
    if (echelleTemplateActuelle || !conteneur || conteneur.classList.contains('u-hide')) return false;
    const nom = document.getElementById('nomEchelleTemplate')?.value?.trim();
    const description = document.getElementById('descriptionEchelle')?.value?.trim();
    const niveaux = (window._niveauxNouvelleEchelle || []).some(n => String(n.code || '').trim() || String(n.nom || '').trim());
    return !!(nom || description || niveaux);
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('echelle', echelleEnCreationSaisie);

/** Lot E1 (D3) : « Fermer » (il n'annulait rien) — avec la question, en création. */
async function fermerFicheEchelle() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('echelle'))) return;
    annulerFormEchelle();
}

/** Lot E1 : ouvrir une autre échelle depuis la liste, sans perdre une création en cours. */
async function ouvrirEchelleDepuisListe(id) {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('echelle'))) return;
    await chargerEchellePourModif(id);
}

function annulerFormEchelle() {
    // Nettoyer les niveaux temporaires, et les repères qui vont avec (#555 (e))
    window._niveauxNouvelleEchelle = null;
    window._reperesNouvelleEchelle = null;
    // Masquer l'éditeur et réafficher l'accueil
    document.getElementById('conteneurEditionEchelle').classList.add('u-hide');
    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    document.getElementById('accueilEchelles').classList.remove('u-hide');

    // Réinitialiser les champs
    document.getElementById('nomEchelleTemplate').value = '';
    document.getElementById('descriptionEchelle').value = '';
    document.getElementById('tableauNiveauxEchelle').innerHTML = '';

    // Réinitialiser la référence à l'échelle actuelle
    echelleTemplateActuelle = null;

}

async function chargerEchellePourModif(id) {
    const echelles = await db.get(cle('echellesTemplates')) ||  [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) return;

    // Définir l'échelle comme échelle actuelle pour permettre les modifications
    echelleTemplateActuelle = echelle;

    document.getElementById('accueilEchelles').classList.add('u-hide');
    document.getElementById('conteneurEditionEchelle').classList.remove('u-hide');

    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    // Les boutons Import/Export sont maintenant dans l'en-tête

    // Note: Export/Import se font maintenant via la bibliothèque
    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');
    if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
    rendreModeFicheEchelle(false);

    // Remplir le formulaire
    document.getElementById('nomEchelleTemplate').value = echelle.nom || '';
    document.getElementById('descriptionEchelle').value = echelle.description || '';

    // ✅ AJOUT (6 jan 2026) : Afficher le panneau métadonnées
    const panneauMeta = document.getElementById('panneauMetadonneesEchelle');
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function') {
        panneauMeta.innerHTML = genererPanneauMetadonnees(echelle, 'echelle');
    }

    // Afficher les niveaux
    afficherNiveauxEchelle(echelle);

    // Phase 4.B : mode lecture seule si item démo
    const conteneur = document.getElementById('conteneurEditionEchelle');
    if (conteneur && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneur, echelle, 'dupliquerEtEditerEchelle', 'Dupliquer pour créer mon échelle');
    }

    // Mettre le highlight et rafraîchir la sidebar
    await definirEchelleActive(id);
    await afficherListeEchelles();
}

/**
 * Phase 4.B : fork une échelle démo et charge la copie en édition.
 */
async function dupliquerEtEditerEchelle(id) {
    // #476 volet 2 — séquence partagée ; ne reste que la plomberie des échelles.
    await BibliothequeUI.dupliquerEtEditerItem({
        id: id,
        prefixeId: 'ECH_',
        modifierListe: (mutateur) => db.modifier(cle('echellesTemplates'), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement par forkerItem — aucune source externe
        rafraichirListe: async () => { await afficherListeEchelles(); },
        chargerPourModif: async (idCopie) => { await chargerEchellePourModif(idCopie); },
        champFocus: 'nomEchelleTemplate'
    });
}

function afficherNiveauxEchelle(echelle) {
    const container = document.getElementById('tableauNiveauxEchelle');
    const apercuContainer = document.getElementById('apercuEchelleNiveaux');


    if (!container) {
        console.error('❌ Container tableauNiveauxEchelle introuvable');
        return;
    }

    if (!echelle.niveaux || echelle.niveaux.length === 0) {
        console.warn('⚠️ Aucun niveau défini pour cette échelle');
        container.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun niveau défini</p>';
        if (apercuContainer) apercuContainer.innerHTML = '';
        return;
    }

    // Afficher le tableau des niveaux en mode édition
    const html = echelle.niveaux.map((niveau, index) => `
        <div class="item-liste" style="position: relative; padding: 15px 150px 15px 15px; background: var(--surface-conteneur, #162c36); margin-bottom: 10px;">
            ${/* Lot C (5 sept. 2026) — les chevrons et la corbeille en coin, sur la même ligne (le
                  modèle des productions) ; la cellule « Ordre » de la grille n'existe plus. */''}
            <div class="bloc-coin-outils">
                ${window.boutonsReordonnerBloc({
                    actionHaut: 'deplacerNiveauEchelleHaut', actionBas: 'deplacerNiveauEchelleBas',
                    param: echelle.id,
                    param2: index,
                    premier: index === 0, dernier: index === echelle.niveaux.length - 1,
                    quoi: 'ce niveau'
                })}
                ${echelle.niveaux.length > 1 ? window.boutonRetirerBloc({
                    action: 'supprimerNiveauEchelle',
                    param: echelle.id,
                    param2: index,
                    titre: 'Supprimer ce niveau'
                }) : ''}
            </div>
            <div class="echelle-niveau-grille">
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Code <span class="champ-requis" title="Champ obligatoire">*</span></label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(niveau.code)}"
                           maxlength="3"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="code"
                           style="font-weight: 600; text-align: center;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-niveau">Nom du niveau <span class="champ-requis" title="Champ obligatoire">*</span></label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(niveau.nom)}"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="nom"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Min (%) <span class="champ-requis" title="Champ obligatoire">*</span>
                        <span class="primo-aide" data-target="echelle-plage-notes"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.min)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="min" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Max (%) <span class="champ-requis" title="Champ obligatoire">*</span></label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.max)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="max" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-valeur-ponctuelle">Valeur ponctuelle <span class="champ-requis" title="Champ obligatoire">*</span>
                        <span class="primo-aide" data-target="echelle-valeur-ponctuelle"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.valeurCalcul)}"
                           min="0"
                           max="100"
                           step="0.01"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="valeurCalcul" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Couleur</label>
                    ${window.travauxOutils.renderPickerCouleur(niveau.couleur, {
                        dataAttrs: {
                            'on-change': 'modifierNiveauEchelleHandler',
                            'echelle-id': echelle.id,
                            'niveau-index': index,
                            'champ': 'couleur'
                        }
                    })}
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Palier SOLO du niveau
                        <span class="echelle-texte-petit"> (facultatif)</span>
                    </label>
                    <select class="controle-form"
                            data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="niveauSOLO">
                        ${optionsNiveauSOLOEchelle(niveau.niveauSOLO)}
                    </select>
                </div>
            </div>
        </div>
    `).join('');

    // Ajouter un bouton pour ajouter un nouveau niveau
    const btnAjouterNiveau = `
        <button class="sidebar-btn-ajouter" data-action="ajouterNiveauEchelle" data-param="${echelle.id}">
            + Ajouter un niveau
        </button>
    `;

    container.innerHTML = html + btnAjouterNiveau + blocReperesEchelle(echelle);

    // Afficher l'aperçu visuel
    if (apercuContainer) apercuContainer.innerHTML = apercuNiveauxEchelleHtml(echelle);
}

/**
 * L'aperçu des niveaux d'une échelle — UN SEUL producteur pour les DEUX
 * éditeurs (#555 lot 2 (e)) : celui de l'échelle enregistrée et celui de
 * l'échelle neuve rendaient deux aperçus voisins, et seul le premier disait la
 * zone. Même patron que `optionsNiveauSOLOEchelle` : une copie divergerait.
 *
 * #555 — les deux repères se LISENT dans l'aperçu : sans cela, le choix
 * reste un formulaire dont on ne voit jamais l'effet.
 * ⮕ #555 lot 2 (b) — LA RÈGLE N'EST PAS RECOPIÉE ICI. Cet aperçu et
 * `zoneDuNiveau` répondaient à la même question par deux codes parallèles ; le
 * second est parti dans `zoneDuCodeDansNiveaux` (`profil-etudiant-calculs.js`).
 * Ne restent ici que les LIBELLÉS, propres à cet écran : on y parle de
 * l'échelle qu'on édite, pas d'un élève. Règle absente : aucune zone affichée,
 * jamais devinée — même garde que `niveauxRangesDeLEchelle`.
 */
function apercuNiveauxEchelleHtml(echelle) {
    const ranges = niveauxRangesDeLEchelle(echelle);
    const LIBELLE_ZONE = { acquis: 'maîtrisé', signale: 'suffisant', priorite: 'à travailler' };
    const libelleZoneDuCode = (code) => {
        if (typeof window.zoneDuCodeDansNiveaux !== 'function') return '';
        return LIBELLE_ZONE[window.zoneDuCodeDansNiveaux(code, ranges, echelle)] || '';
    };

    return ((echelle && echelle.niveaux) || []).map(niveau => {
        const zone = niveau.code ? libelleZoneDuCode(niveau.code) : '';
        return `
            <div style="text-align: center; flex: 1; padding: 10px; background: ${niveau.couleur}20; border-radius: 4px; margin: 0 2px;">
                <strong style="font-size: 1.2rem; color: ${niveau.couleur};">${echapperHtml(niveau.code || '?')}</strong>
                <div class="echelle-texte-petit-mt5">${niveau.min}%-${niveau.max}%</div>
                ${zone ? `<div class="echelle-texte-petit-mt5">${echapperHtml(zone)}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Le bloc « Repères de maîtrise » — deux listes, sous les niveaux.
 *
 * ⮕ #555. Il vit SOUS le tableau parce qu'il désigne des niveaux qui doivent
 * déjà exister : le proposer au-dessus reviendrait à demander un choix dans une
 * liste vide. Et il n'apparaît QUE si l'ordre des plages est lisible — sur une
 * échelle dont les bornes manquent, un choix serait sans effet et sans
 * explication.
 */
function blocReperesEchelle(echelle, options) {
    if (niveauxRangesDeLEchelle(echelle).length === 0) return '';
    // #555 lot 2 (e) — le même bloc sert l'échelle enregistrée (écriture en
    // base, par `modifierRepereEchelleHandler`) et l'échelle neuve (tampon, par
    // `modifierRepereTempHandler`). Seul le handler change ; le refus, non.
    const handler = (options && options.handler) || 'modifierRepereEchelleHandler';
    const attrId = echelle.id ? ` data-echelle-id="${echapperHtml(echelle.id)}"` : '';
    const champs = Object.keys(REPERES_ECHELLE).map((champ) => `
        <div class="groupe-form">
            <label class="echelle-texte-detail">${echapperHtml(REPERES_ECHELLE[champ])}</label>
            <select class="controle-form"
                    data-on-change="${handler}"${attrId}
                    data-champ="${champ}">
                ${optionsRepereEchelle(echelle, champ)}
            </select>
        </div>
    `).join('');

    return `
        <div class="carte-white-border" style="margin-top: 15px; padding: 15px;">
            <h4 class="titre-bleu-mb-15">Repères de maîtrise</h4>
            <p class="echelle-texte-detail" style="margin-bottom: 12px;">
                Ces deux repères disent à l'application où commence l'apprentissage
                suffisant, et où il est acquis. Sans eux, elle ne peut pas savoir
                quels critères présenter à l'élève comme des priorités.
                Les poser sur le même niveau revient à n'en avoir qu'un.
            </p>
            <div class="echelle-reperes-grille">${champs}</div>
        </div>
    `;
}

/**
 * Modifie un champ d'un niveau d'échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} niveauIndex - Index du niveau à modifier
 * @param {string} champ - Nom du champ à modifier
 * @param {any} valeur - Nouvelle valeur
 */
/**
 * #524 (26 août 2026) — LE CODE D'UN NIVEAU EST UNE CLÉ, PAS UNE ÉTIQUETTE.
 *
 * ⚠⚠ POURQUOI CE REFUS EXISTE. `niveau.code` sert d'INDEX aux commentaires de
 * cartouche et aux rendus PDF — `${critere.id}_${niveau.code}`, lu à 23 endroits.
 * Un code vide donne la clé `CR_1_` : TOUS les niveaux sans code se retrouvent
 * sur la même case, et le dernier commentaire écrase les autres. Sans un mot.
 *
 * ⚠ Une validation disait déjà « Code et nom obligatoires » — dans
 * `sauvegarderNiveaux()`, dont le bouton vivait dans le bloc « ANCIEN SYSTÈME »
 * masqué (retirés tous deux par #520, 13 sept. 2026), et qui écrivait dans
 * `#tableauNiveaux` quand l'éditeur vivant est
 * `#tableauNiveauxEchelle`. La garde existait, sur un chemin que personne
 * n'emprunte : c'est le motif AP-2, le même que #516 le matin même, sur l'écran
 * voisin. Deux fois en un jour, ce n'est plus un accident.
 *
 * ⮕ Le refus est donc posé ICI, sur le chemin vivant, et il vaut pour les deux
 * éditeurs (échelle neuve et échelle existante).
 */
/**
 * #525 (26 août 2026) — LA VALEUR D'UN NIVEAU, DÉCIDÉE UNE FOIS POUR TOUS.
 *
 * ⚠⚠ DEUX MODULES APPLIQUAIENT DEUX RÈGLES À LA MÊME DONNÉE :
 *   `evaluation-calcul.js`  →  `niveau.valeurCalcul || (min + max) / 2`
 *   (module Consolidation, retiré le 10 sept. 2026)  →  `valeurCalcul != null ? valeurCalcul : (min + max) / 2`
 *
 * Le premier trahit le ZÉRO. `0 || x` rend `x` : une valeur ponctuelle de 0 —
 * parfaitement légitime, et présente dans les échelles « IDME et niv 0 » de
 * Grégoire — était traitée comme ABSENTE et remplacée par le milieu de la plage.
 * Sur un niveau 0 dont la plage irait de 0 à 59, la note valait **29,5 au lieu
 * de 0**. Le pack de démonstration y échappe par chance : son niveau « Aucun »
 * a min 0 et max 0, dont le milieu vaut 0.
 *
 * ⮕ Une seule règle désormais, ici, et les deux lecteurs y passent. `!= null`
 * est la bonne : elle distingue « pas de valeur » de « la valeur zéro ».
 *
 * ⚠ Le repli sur le milieu de plage est RETIRÉ (#527, plus bas) : sans valeur
 * ponctuelle, la fonction rend `null`, jamais `NaN`, jamais un chiffre inventé —
 * et c'est à l'appelant de dire qu'il ne sait pas calculer.
 */
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const ponctuelle = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(ponctuelle)) {
        return ponctuelle;
    }
    // ⚠⚠ `Number('')` vaut ZÉRO, pas NaN. Sans ce filtre, une borne laissée
    // vide devenait 0 en silence — et deux bornes vides donnaient un niveau qui
    // « vaut 0 », impossible à distinguer d'un vrai niveau zéro. Trouvé par un
    // test qui attendait `null` et recevait `+0` (26 août).
    const brut = (v) => (v == null || String(v).trim() === '') ? NaN : Number(v);
    const min = brut(niveau.min);
    const max = brut(niveau.max);
    if (isNaN(min) || isNaN(max)) return null;   // ⚠ jamais NaN en silence

    // ⚠⚠ #527 (26 août 2026) — LE REPLI SUR LE MILIEU DE PLAGE EST RETIRÉ.
    //
    // Il fabriquait une décision pédagogique que seul l'enseignant peut prendre :
    // « Maîtrise » de 75 à 89 aurait valu 82, alors qu'il en veut peut-être 80.
    // La plage et la valeur ponctuelle sont deux conversions INVERSES (cf. §7 bis
    // du skill `pratiques-notation`) — l'une ne se déduit pas de l'autre.
    //
    // ▣ MESURÉ AVANT DE RETIRER, plutôt que supposé :
    //   · les échelles réelles de Grégoire — « aucun de mes niveaux n'a pas de
    //     valeur ponctuelle, j'ai travaillé tout l'hiver avec » (26 août) ;
    //   · le pack de démarrage — 9 niveaux d'échelle, 9 avec `valeurCalcul` ;
    //   · les échelles semées par le code — c'était FAUX (audit du 27 août) :
    //     l'échelle générique écrivait `valeur`, pas `valeurCalcul`, et les deux
    //     gabarits n'en avaient pas. ⮕ #574 (29 août) : plus AUCUNE échelle n'est
    //     semée par le code ; `_sonder574()` compte ce qui reste dans les données.
    // Le repli ne servait donc à personne, nulle part. Il ne pouvait que
    // fabriquer une note fausse le jour où une valeur manquerait vraiment.
    //
    // ⮕ `null` = « je ne sais pas calculer », et les deux lecteurs le savent :
    // `evaluation-calcul.js` EXCLUT le critère du total (`valeurCritere !==
    // undefined`, pondération comprise — pas de zéro silencieux) et
    // le module Consolidation (retiré) sautait le niveau. C'est la doctrine du projet : non
    // calculable et DIT, jamais un chiffre inventé.
    return null;
}

const REFUS_VALEUR_NIVEAU = 'La valeur ponctuelle du niveau est obligatoire';
const REFUS_MIN_NIVEAU = 'La borne minimale du niveau est obligatoire';
const REFUS_MAX_NIVEAU = 'La borne maximale du niveau est obligatoire';
const REFUS_CODE_NIVEAU = 'Le code du niveau est obligatoire';
const REFUS_NOM_NIVEAU = 'Le nom du niveau est obligatoire';

/** Ce que le champ refuse, ou `null` s'il passe. Partagé par les deux éditeurs. */
function refusChampNiveau(champ, valeur) {
    const vide = !String(valeur == null ? '' : valeur).trim();
    if (champ === 'code' && vide) return REFUS_CODE_NIVEAU;
    if (champ === 'nom' && vide) return REFUS_NOM_NIVEAU;
    // ⚠⚠ #526 (26 août 2026) — LA PLAGE ET LA VALEUR PONCTUELLE SONT DEUX
    // CONVERSIONS INVERSES, ET LES DEUX SONT OBLIGATOIRES.
    //
    // Précision de Grégoire, ce jour-là : « la plage sert aux pratiques de
    // notation alternatives, la note ponctuelle sert à la notation sommative,
    // ou lorsque la note doit être convertie en note chiffrée ».
    //
    //   note chiffrée  →  CODE  : `pourcentage >= n.min && pourcentage <= n.max`
    //                             (evaluation-calcul.js) — c'est la PLAGE qui
    //                             détermine le niveau final d'un·e élève.
    //   CODE  →  note chiffrée  : `valeurCalcul` — c'est elle qui rend un chiffre
    //                             quand la certification en exige un.
    //
    // ⮕ L'une ne se déduit PAS de l'autre. Faire dériver la valeur ponctuelle du
    // milieu de la plage fabrique une décision pédagogique que seul l'enseignant
    // peut prendre : « Maîtrise » de 75 à 89 vaudrait 82, alors qu'il voudrait
    // peut-être 80 ou 85. C'est un fallback arbitraire, et le projet en interdit.
    if ((champ === 'min' || champ === 'max' || champ === 'valeurCalcul')
        && (vide || isNaN(Number(valeur)))) {
        if (champ === 'min') return REFUS_MIN_NIVEAU;
        if (champ === 'max') return REFUS_MAX_NIVEAU;
        return REFUS_VALEUR_NIVEAU;
    }
    return null;
}

/* =====================================================================
   #555 — LES DEUX REPÈRES DE MAÎTRISE D'UNE ÉCHELLE
   =====================================================================

   ⚠⚠ POURQUOI CES CHAMPS EXISTENT. Le code demandait « ce critère est-il un
   défi ? » et « tous les critères sont-ils maîtrisés ? » en testant les codes
   EN TOUTES LETTRES — `=== 'I' || === 'D'`, `=== 'M' || === 'E'` — à quatorze
   endroits. Ces réponses ne sont justes que sur l'échelle IDME de Grégoire.
   Sur l'échelle de quelqu'un d'autre, elles ne veulent rien dire : rien
   n'oblige un·e collègue à employer ces lettres, ni à en faire le même usage.

   ⮕ CE QUI MANQUAIT N'ÉTAIT PAS UN SEUIL CHIFFRÉ, MAIS UN REPÈRE SUR L'ÉCHELLE.
   Un niveau portait déjà `code`, `nom`, `description`, `niveauSOLO`, `min`,
   `max`, `valeurCalcul`, `couleur` — jamais « à partir d'ici, c'est acquis ».
   L'information vivait dans l'enseignement, pas dans l'outil.

   ⮕ DEUX REPÈRES, ET NON UN — décision de Grégoire, 28 août 2026. Sa gradation
   PAN-Standards distingue trois états, pas deux : au-dessous, l'apprentissage
   est insuffisant ; entre les deux, il est réel mais NON DURABLE (« maîtrisé,
   mais en développement ») ; au-dessus, il est acquis. Une seule frontière
   aurait forcé « en développement » dans l'une ou l'autre case, et la
   rétroaction remise à l'élève aurait dit une chose qu'il ne pense pas.

   ⚠ LES DEUX REPÈRES VIVENT SUR L'ÉCHELLE, PAS SUR SES NIVEAUX. Un marqueur
   par niveau autoriserait zéro marque, ou trois : un état incohérent que rien
   ne rattraperait. Ici la donnée ne peut désigner qu'un niveau à la fois.

   ⚠ ÉGALITÉ AUTORISÉE, et c'est voulu : poser les deux repères sur le MÊME
   niveau revient à n'en avoir qu'un — la zone intermédiaire disparaît. Le
   modèle à deux frontières contient donc le modèle à une, sans champ de plus.

   ⚠ L'ABSENCE EST UN ÉTAT LÉGITIME. Aucune échelle existante ne porte ces
   repères, et AUCUNE VALEUR N'EST DEVINÉE À LEUR PLACE — ni par les lettres,
   ni par une position dans la liste, ni par un pourcentage. Une échelle sans
   repères est une échelle dont on ne sait pas où commence la maîtrise, et les
   lecteurs devront le DIRE plutôt que de trancher (`feedback-zero-fallback-arbitraire`).
   ===================================================================== */

/** Les deux champs de repère, et leur libellé à l'écran. */
const REPERES_ECHELLE = {
    seuilSuffisance: 'Suffisant à partir de',
    seuilMaitrise:   'Maîtrisé à partir de'
};

/**
 * Les niveaux d'une échelle, rangés du plus faible au plus fort.
 *
 * Passe par `ordonnerNiveauxParPlage` (`profil-etudiant-calculs.js`) : l'ordre
 * des PLAGES, jamais celui de la saisie. Rend `[]` si la règle n'est pas
 * chargée — l'appelant refuse alors, il ne devine pas.
 */
function niveauxRangesDeLEchelle(echelle) {
    if (typeof window.ordonnerNiveauxParPlage !== 'function') return [];
    return window.ordonnerNiveauxParPlage((echelle && echelle.niveaux) || []);
}

/**
 * Refus motivé d'un repère, ou `null` si l'écriture peut avoir lieu.
 *
 * Trois refus, et aucun n'est cosmétique :
 *   · le code désigné n'est pas dans l'échelle — le repère pointerait dans le vide ;
 *   · l'ordre des plages n'est pas lisible — on ne peut rien garantir ;
 *   · la suffisance passerait AU-DESSUS de la maîtrise — un élève serait
 *     « acquis » sans être « suffisant », ce qui n'a pas de sens à l'écran.
 *
 * ⚠ Le vide N'EST PAS un refus : retirer un repère est un geste légitime.
 */
function refusRepereEchelle(echelle, champ, code) {
    if (!REPERES_ECHELLE[champ]) return 'Repère inconnu.';
    if (code == null || String(code).trim() === '') return null;

    const cible = String(code).trim().toUpperCase();
    const ranges = niveauxRangesDeLEchelle(echelle);
    if (ranges.length === 0) {
        return 'L\'ordre des niveaux n\'est pas lisible : vérifier que chaque niveau a un code et une borne « Min ».';
    }

    const vise = ranges.find((n) => n.code === cible);
    if (!vise) return 'Ce niveau ne fait pas partie de l\'échelle.';

    // L'autre repère, tel qu'il est DÉJÀ enregistré. Absent : rien à comparer.
    const autreChamp = (champ === 'seuilSuffisance') ? 'seuilMaitrise' : 'seuilSuffisance';
    const autreCode = echelle && echelle[autreChamp];
    if (!autreCode) return null;
    const autre = ranges.find((n) => n.code === String(autreCode).trim().toUpperCase());
    if (!autre) return null;

    const rangSuffisance = (champ === 'seuilSuffisance') ? vise.rang : autre.rang;
    const rangMaitrise   = (champ === 'seuilSuffisance') ? autre.rang : vise.rang;
    if (rangSuffisance > rangMaitrise) {
        return 'Le seuil de suffisance ne peut pas être plus haut que le seuil de maîtrise.';
    }
    return null;
}

/**
 * Écrit un repère sur l'échelle.
 *
 * Même sérialisation que `modifierNiveauEchelle` (#510) : `db.modifier` par
 * clé, jamais lecture-modification-écriture à la main. Le refus est calculé sur
 * l'échelle TELLE QU'ELLE EST EN BASE, à l'intérieur de la transaction — la
 * valider sur un instantané lu avant laisserait passer un ordre inversé posé
 * par un geste concurrent.
 */
async function modifierRepereEchelle(echelleId, champ, valeur) {
    const resultat = await ecrireRepereEchelle(echelleId, champ, valeur);
    if (!resultat.ok) return resultat;

    echelleTemplateActuelle = resultat.echelle;
    afficherNiveauxEchelle(echelleTemplateActuelle);
    return { ok: true };
}

/**
 * L'ÉCRITURE seule d'un repère, sans rafraîchir l'éditeur d'échelle.
 *
 * ⮕ #577 — extraite de `modifierRepereEchelle` pour l'assistant de
 * configuration des pratiques, qui pose les repères de l'échelle choisie sans
 * être l'éditeur d'échelle : il ne doit ni prendre `echelleTemplateActuelle`
 * ni redessiner `#tableauNiveauxEchelle`, qui vit dans un autre écran.
 *
 * @returns {Promise<{ok: true, echelle: Object} | {refuse: string|null}>}
 */
async function ecrireRepereEchelle(echelleId, champ, valeur) {
    if (!REPERES_ECHELLE[champ]) return { refuse: 'Repère inconnu.' };

    const code = (valeur == null) ? '' : String(valeur).trim().toUpperCase();
    let refus = null;
    let echelleModifiee = null;

    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const index = echelles.findIndex((e) => e.id === echelleId);
        if (index === -1) {
            refus = 'Échelle introuvable.';
            return undefined;
        }
        const echelle = echelles[index];

        refus = refusRepereEchelle(echelle, champ, code);
        if (refus) return undefined;

        // Le vide RETIRE le repère plutôt que d'écrire une chaîne creuse : une
        // clé présente et vide se lit « défini », et c'est faux.
        if (code === '') delete echelle[champ];
        else echelle[champ] = code;

        echelle.dateModification = new Date().toISOString();
        echelles[index] = echelle;
        echelleModifiee = echelle;
        return echelles;
    }, [], { geste: 'Modifier l\'échelle' });

    if (refus) return { refuse: refus };
    if (!echelleModifiee) return { refuse: null };
    return { ok: true, echelle: echelleModifiee };
}

/**
 * Le `<select>` d'un repère : les codes de l'échelle, dans l'ordre des plages.
 *
 * ⚠ `code` et `nom` sont SAISIS par l'utilisateur et partent dans un
 * `innerHTML` : les deux sont échappés ici, au plus près de la source.
 */
function optionsRepereEchelle(echelle, champ) {
    const courant = (echelle && echelle[champ]) ? String(echelle[champ]).trim().toUpperCase() : '';
    const options = ['<option value=""' + (courant === '' ? ' selected' : '') + '>— non défini —</option>'];
    niveauxRangesDeLEchelle(echelle).forEach((niveau) => {
        const libelle = niveau.nom ? (niveau.code + ' · ' + niveau.nom) : niveau.code;
        options.push('<option value="' + echapperHtml(niveau.code) + '"'
            + (niveau.code === courant ? ' selected' : '') + '>'
            + echapperHtml(libelle) + '</option>');
    });
    return options.join('');
}

async function modifierNiveauEchelle(echelleId, niveauIndex, champ, valeur) {
    // #524 — on refuse l'ÉCRITURE, on ne bloque pas la frappe (cf. #516).
    const refus = refusChampNiveau(champ, valeur);
    if (refus) return { refuse: refus };

    // #510 (25 août 2026) — MÊME COURSE QUE LES GRILLES, MÊME REMÈDE.
    // Lecture-modification-écriture de la collection entière, sur un champ qui
    // s'enregistre au blur : deux niveaux édités coup sur coup lisaient le même
    // instantané et le second effaçait le premier, en silence. `db.modifier`
    // sérialise la séquence par clé (cf. db.js).
    let echelleModifiee = null;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelleIndex = echelles.findIndex(e => e.id === echelleId);

        if (echelleIndex === -1) {
            console.error('❌ Échelle non trouvée pour modification:', echelleId);
            return undefined;
        }

        const echelle = echelles[echelleIndex];

        if (!echelle.niveaux || !echelle.niveaux[niveauIndex]) {
            console.error('❌ Niveau introuvable à l\'index:', niveauIndex);
            return undefined;
        }

        // Mettre à jour le champ
        echelle.niveaux[niveauIndex][champ] = valeur;

        // Remettre l'échelle modifiée dans le tableau
        echelles[echelleIndex] = echelle;
        echelleModifiee = echelle;
        return echelles;
    }, [], { geste: 'Modifier l\'échelle' });

    if (!echelleModifiee) return { refuse: null };

    // L'échelle rendue par le mutateur EST celle qui vient d'être écrite : plus
    // besoin de relire la collection pour éviter une référence obsolète — et
    // cette relecture pouvait justement rendre un instantané concurrent.
    echelleTemplateActuelle = echelleModifiee;

    // Réafficher pour mettre à jour l'aperçu visuel et les bordures colorées
    afficherNiveauxEchelle(echelleTemplateActuelle);
    return { ok: true };
}

/**
 * Ajoute un nouveau niveau à une échelle
 * @param {string} echelleId - ID de l'échelle
 */
async function ajouterNiveauEchelle(echelleId) {
    let echelleApres = null;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const index = echelles.findIndex(e => e.id === echelleId);
        if (index === -1) return undefined;

        const echelle = echelles[index];

        // Initialiser le tableau de niveaux si nécessaire
        if (!echelle.niveaux) {
            echelle.niveaux = [];
        }

        // Créer un nouveau niveau avec des valeurs par défaut
        const nouveauNiveau = {
            code: 'N',
            nom: 'Nouveau niveau',
            min: 0,
            max: 100,
            valeurCalcul: 50,
            couleur: '#cccccc'
        };

        // Ajouter le niveau à l'échelle
        echelle.niveaux.push(nouveauNiveau);

        // IMPORTANT: Mettre à jour l'échelle dans le tableau AVANT de sauvegarder
        echelles[index] = echelle;
        echelleApres = echelle;
        return echelles;
    }, [], { geste: 'Modifier l\'échelle' });

    if (!echelleApres) {
        console.error('❌ Échelle non trouvée:', echelleId);
        alert('Erreur: Échelle non trouvée');
        return;
    }

    // La file rend la valeur ÉCRITE : plus besoin de relire la collection.
    echelleTemplateActuelle = echelleApres;

    // Réafficher la liste des niveaux
    afficherNiveauxEchelle(echelleTemplateActuelle);

    // Mettre à jour la sidebar.
    // #468/CO-05 (21 août 2026) : l'écriture dans #nbNiveauxEchelle est RETIRÉE —
    // l'élément n'existe nulle part dans index.html, si bien que chaque ajout ou
    // retrait de niveau levait un TypeError et n'allait jamais jusqu'au bout.
    await afficherListeEchelles();

    // Notification de succès
    // Lot E1 (D3) : le niveau est déjà écrit ; le message ne demande plus d'enregistrer.
    notifications.succes(
        'Niveau ajouté.',
        `L'échelle contient maintenant ${echelleTemplateActuelle.niveaux.length} niveau(x). Ajuste son code, son nom, ses bornes et sa valeur : chaque champ s'enregistre tout seul.`
    );
}

/**
 * Supprime un niveau d'une échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} index - Index du niveau à supprimer
 */
async function supprimerNiveauEchelle(echelleId, index) {
    // #1007, lot 2b : un code de niveau qu'une évaluation porte est une note ; le codex est
    // proposé avant la question (lecture seule, evaluation-sauvegarde.js). Une échelle
    // neuve (`_niveauxNouvelleEchelle`) ne passe pas ici et ne propose jamais rien.
    const echelleLue = (db.getSync(cle('echellesTemplates'), []) || []).find(e => e.id === echelleId);
    const niveauLu = (echelleLue && echelleLue.niveaux && echelleLue.niveaux[index]) || null;
    const porteDesNotes = !!niveauLu && typeof window.ligneEmployeeParUneEvaluation === 'function'
        && window.ligneEmployeeParUneEvaluation({ echelleId, niveauCode: niveauLu.code });
    if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('niveau'))) return;
    if (!confirm('Supprimer ce niveau ?')) return;

    let echelleApres = null;
    let refusDernierNiveau = false;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelleIndex = echelles.findIndex(e => e.id === echelleId);
        if (echelleIndex === -1 || !echelles[echelleIndex].niveaux) return undefined;

        const echelle = echelles[echelleIndex];

        // Sécurité : ne pas supprimer s'il ne reste qu'un seul niveau
        if (echelle.niveaux.length <= 1) {
            refusDernierNiveau = true;
            return undefined;
        }

        // Relu après l'attente : la ligne a changé de place, rien n'est retiré.
        if (niveauLu && !(echelle.niveaux[index] && echelle.niveaux[index].code === niveauLu.code)) return undefined;

        // Supprimer le niveau
        echelle.niveaux.splice(index, 1);

        // Remettre l'échelle modifiée dans le tableau
        echelles[echelleIndex] = echelle;
        echelleApres = echelle;
        return echelles;
    }, [], { geste: 'Modifier l\'échelle' });

    // Le message vit HORS du mutateur : la file ne doit porter que l'écriture.
    if (refusDernierNiveau) {
        alert('Impossible de supprimer : une échelle doit avoir au moins 1 niveau.');
        return;
    }
    if (!echelleApres) return;

    echelleTemplateActuelle = echelleApres;

    // Réafficher la liste des niveaux
    afficherNiveauxEchelle(echelleTemplateActuelle);

    // Mettre à jour la sidebar.
    // #468/CO-05 (21 août 2026) : l'écriture dans #nbNiveauxEchelle est RETIRÉE —
    // l'élément n'existe nulle part dans index.html, si bien que chaque ajout ou
    // retrait de niveau levait un TypeError et n'allait jamais jusqu'au bout.
    await afficherListeEchelles();
}

/**
 * Déplace un niveau vers le haut dans l'échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} index - Index du niveau à déplacer
 */
async function deplacerNiveauEchelleHaut(echelleId, index) {
    if (index === 0) return;

    let echelleApres = null;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelleIndex = echelles.findIndex(e => e.id === echelleId);
        if (echelleIndex === -1 || !echelles[echelleIndex].niveaux) return undefined;

        const echelle = echelles[echelleIndex];
        if (!echelle.niveaux[index] || !echelle.niveaux[index - 1]) return undefined;

        // Échanger avec le niveau précédent
        [echelle.niveaux[index - 1], echelle.niveaux[index]] = [echelle.niveaux[index], echelle.niveaux[index - 1]];

        // Remettre l'échelle modifiée dans le tableau
        echelles[echelleIndex] = echelle;
        echelleApres = echelle;
        return echelles;
    }, [], { geste: 'Modifier l\'échelle' });

    if (!echelleApres) return;
    echelleTemplateActuelle = echelleApres;

    // Réafficher
    afficherNiveauxEchelle(echelleTemplateActuelle);

}

/**
 * Déplace un niveau vers le bas dans l'échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} index - Index du niveau à déplacer
 */
async function deplacerNiveauEchelleBas(echelleId, index) {
    let echelleApres = null;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelleIndex = echelles.findIndex(e => e.id === echelleId);
        if (echelleIndex === -1 || !echelles[echelleIndex].niveaux) return undefined;

        const echelle = echelles[echelleIndex];

        // Le dernier niveau ne descend pas : refus, l'écriture est annulée.
        if (!echelle.niveaux[index] || index === echelle.niveaux.length - 1) return undefined;

        // Échanger avec le niveau suivant
        [echelle.niveaux[index], echelle.niveaux[index + 1]] = [echelle.niveaux[index + 1], echelle.niveaux[index]];

        // Remettre l'échelle modifiée dans le tableau
        echelles[echelleIndex] = echelle;
        echelleApres = echelle;
        return echelles;
    }, [], { geste: 'Modifier l\'échelle' });

    if (!echelleApres) return;
    echelleTemplateActuelle = echelleApres;

    // Réafficher
    afficherNiveauxEchelle(echelleTemplateActuelle);

}

async function definirEchelleActive(id) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

async function dupliquerEchelleDepuisSidebar(id) {
    let copieCreee = null;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const echelles = lues || [];
        const echelle = echelles.find(e => e.id === id);

        if (!echelle) return undefined;

        // ✅ D1 + D4 + D5 (arbitrage du 24 août) — même correctif que côté grilles :
        // c'était le même angle mort, sur la même voie « barre latérale ». Voir le
        // commentaire de `dupliquerGrilleDepuisSidebar` pour le détail du défaut.
        const copie = {
            ...echelle,
            id: genererIdUnique('ECH_'),
            nom: nommerCopie(echelle.nom, echelles),
            auteur: BibliothequeUI.obtenirAuteurActif(),
            isDemo: false,
            inspireDe: BibliothequeUI.forgerInspireDe(echelle),
            verrouille: false
        };
        delete copie.metadata_cc;
        delete copie.auteurOriginal;

        echelles.push(copie);
        copieCreee = copie;
        return echelles;
    }, [], { geste: 'Dupliquer l\'échelle' });

    if (!copieCreee) return;
    const copie = copieCreee;

    await afficherListeEchelles();
    await chargerEchellePourModif(copie.id);

    notifications.succes('Échelle "' + copie.nom + '" dupliquée !');
}

/**
 * Migre les évaluations d'une échelle vers une autre
 * @param {string} ancienneEchelleId - ID de l'échelle à remplacer
 * @param {string} nouvelleEchelleId - ID de la nouvelle échelle
 * @returns {number} Nombre d'évaluations migrées
 */
async function migrerEvaluationsVersNouvelleEchelle(ancienneEchelleId, nouvelleEchelleId) {
    // #650 (31 août 2026) — LA RÉAFFECTATION EST UNE SEULE SÉQUENCE ATOMIQUE.
    //
    // Avant : `db.get` … `db.set`, et entre les deux l'appelant pose DEUX
    // dialogues (le `confirm` « veux-tu migrer ? » puis le `prompt` de choix
    // de l'échelle de remplacement). La collection réécrite était donc celle
    // lue AVANT la réflexion de l'enseignant : tout ce qui s'enregistrait
    // pendant — une note saisie dans un autre onglet du même écran, une
    // auto-sauvegarde — était écrasé sans erreur et sans message.
    //
    // ⚠ Le compte est tenu HORS du mutateur, et c'est le point à ne pas rater :
    // `db.modifier` rend CE QUE LE MUTATEUR REND, or le mutateur doit rendre la
    // liste à écrire. L'appelant, lui, attend un NOMBRE (`nbMigrees`) pour la
    // notification. Compter dans le `return` du mutateur annoncerait un tableau.
    let nbMigrees = 0;

    await modifierEtAnnoncer(cle('evaluationsSauvegardees'), (lues) => {
        const evaluations = lues || [];
        nbMigrees = 0;

        evaluations.forEach(ev => {
            if (ev.echelleId === ancienneEchelleId) {
                ev.echelleId = nouvelleEchelleId;
                nbMigrees++;
            }
        });

        // Aucune évaluation ne référence plus cette échelle : le mutateur rend
        // `undefined`, donc rien n'est écrit. Réécrire la collection « telle
        // quelle » serait une occasion de plus de perdre ce qu'une autre
        // rafale vient d'y poser.
        if (nbMigrees === 0) return undefined;
        return evaluations;
    }, [], { geste: 'Remplacer l\'échelle' });

    return nbMigrees;
}

// =============================================================================
// #648 (3 septembre 2026) — SUPPRIMER UNE ÉCHELLE EST UN REMPLACEMENT.
//
// Décision de Grégoire : « On supprime une échelle pour la remplacer par une
// autre. Une évaluation ne tient pas s'il n'y a pas d'échelle. Le geste est
// incomplet, il doit être suivi d'un remplacement ou d'une correction. »
//
// Trois cas, tous tranchés :
//   · quelque chose la nomme  → remplacement obligatoire : par quoi, puis TOUT ce
//     qui la nomme suit (évaluations, productions, pratiques, grilles, cartouches
//     du trimestre actif), puis retrait ;
//   · trimestre archivé       → refus, en nommant les notes déjà remises ;
//   · rien ne la nomme        → rien de spécial : la question d'avant, sans un
//     mot de plus (« c'est peut-être un projet qui n'est pas terminé »).
//
// Ce que « ses notes suivent » exige, MESURÉ : une évaluation stocke le niveau de
// chaque critère par son CODE (evaluation-sauvegarde.js, `niveauSelectionne`), et
// la note le relit dans l'échelle désignée par `ev.echelleId`
// (evaluation-calcul.js:1264). Un successeur n'est donc proposé que s'il porte
// tous les codes de l'ancienne ; sinon la note tomberait à « -- » sans que
// personne le voie. Décision Grégoire : refuser et dire pourquoi, plutôt que
// d'inventer une correspondance.
//
// Le périmètre est le TRIMESTRE ACTIF : évaluations et échelles sont préfixées
// par trimestre (#358) ; un trimestre archivé garde sa copie et ses évaluations.
//
// Trois gestes de Conception passent ici (la liste, la zone d'édition, la
// section 1 de la bibliothèque modale) ; l'onglet Données fait la même mesure et
// le même remplacement avec sa propre modal (donnees-v2.js). La section 2 ne
// touche que la Bibliothèque : rien à remplacer, rien à dire.
// =============================================================================

/**
 * Les codes de niveaux de `nouvelle` couvrent-ils ceux d'`ancienne` ? Pure.
 * Les codes vides ne comptent pas : une évaluation ne stocke jamais un code vide.
 * @returns {{compatibles: boolean, manquants: string[]}}
 */
function comparerCodesEchelles(ancienne, nouvelle) {
    const codesDe = (e) => new Set(((e && e.niveaux) || [])
        .map(n => (n && n.code != null) ? String(n.code).trim() : '')
        .filter(c => c !== ''));
    const nouveaux = codesDe(nouvelle);
    const manquants = [...codesDe(ancienne)].filter(c => !nouveaux.has(c));
    return { compatibles: manquants.length === 0, manquants };
}

/**
 * Tout ce qui nomme une échelle, dans des magasins déjà lus. Pure.
 * @param {string} echelleId
 * @param {{evaluations: Array, productions: Array, pratiques: Array, grilles: Array, cartouchesParGrille: Object}} magasins
 * @returns {{evaluations: number, productions: number, pratiques: number, grilles: number, cartouches: number, total: number}}
 */
function compterPorteursEchelleDans(echelleId, magasins) {
    const liste = (x) => Array.isArray(x) ? x : (x ? [x] : []);
    const m = magasins || {};
    const nommeLEchelle = (x) => !!x && x.echelleId === echelleId;
    const nb = {
        evaluations: liste(m.evaluations).filter(nommeLEchelle).length,
        productions: liste(m.productions).filter(nommeLEchelle).length,
        // Une pratique range son échelle sous `configuration.echelleId`
        // (pratiques-gestion.js). L'ancienne garde de l'onglet Données lisait
        // `p.echelleId` : le mauvais référent, d'où le compte faux de #648.
        pratiques: liste(m.pratiques).filter(p => !!p && ((p.configuration && p.configuration.echelleId === echelleId) || p.echelleId === echelleId)).length,
        grilles: liste(m.grilles).filter(nommeLEchelle).length,
        cartouches: Object.values(m.cartouchesParGrille || {}).reduce((somme, ancrage) => somme + liste(ancrage).filter(nommeLEchelle).length, 0)
    };
    nb.total = nb.evaluations + nb.productions + nb.pratiques + nb.grilles + nb.cartouches;
    return nb;
}

/** Les magasins du trimestre actif, lus hors file — pour compter, jamais pour écrire. */
async function lireMagasinsEchelle() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const cartouchesParGrille = {};
    for (const g of (Array.isArray(grilles) ? grilles : [])) {
        if (g && g.id) cartouchesParGrille[g.id] = await db.get(cle(`cartouches_${g.id}`)) || [];
    }
    return {
        evaluations: await db.get(cle('evaluationsSauvegardees')) || [],
        productions: await db.get(cle('productions')) || [],
        pratiques: await db.get(cle('pratiquesConfigurables')) || [],
        grilles,
        cartouchesParGrille
    };
}

/** Même lecture, synchrone — pour la modal de l'onglet Données, qui n'attend pas. */
function lireMagasinsEchelleSync() {
    const grilles = db.getSync(cle('grillesTemplates'), []) || [];
    const cartouchesParGrille = {};
    (Array.isArray(grilles) ? grilles : []).forEach(g => {
        if (g && g.id) cartouchesParGrille[g.id] = db.getSync(cle(`cartouches_${g.id}`), []) || [];
    });
    return {
        evaluations: db.getSync(cle('evaluationsSauvegardees'), []) || [],
        productions: db.getSync(cle('productions'), []) || [],
        pratiques: db.getSync(cle('pratiquesConfigurables'), []) || [],
        grilles,
        cartouchesParGrille
    };
}

/**
 * #967 — les porteurs réunis des homonymes qu'« Écraser » retirerait (trimestre actif).
 * Lecture hors file : elle sert à refuser, jamais de base à une écriture.
 */
async function compterPorteursHomonymesEchelle(homonymes) {
    const magasins = await lireMagasinsEchelle();
    const nb = { evaluations: 0, productions: 0, pratiques: 0, grilles: 0, cartouches: 0, total: 0 };
    (homonymes || []).forEach(h => {
        const n = compterPorteursEchelleDans(h.id, magasins);
        Object.keys(nb).forEach(k => { nb[k] += n[k]; });
    });
    return nb;
}

/** « 12 évaluations, 2 productions et 1 pratique de notation » — pour l'enseignant. */
function decrirePorteursEchelle(nb) {
    const n = nb || {};
    const p = (k, s, pl) => `${k} ${k >= 2 ? pl : s}`;
    const parts = [];
    if (n.evaluations) parts.push(p(n.evaluations, 'évaluation', 'évaluations'));
    if (n.productions) parts.push(p(n.productions, 'production', 'productions'));
    if (n.pratiques) parts.push(p(n.pratiques, 'pratique de notation', 'pratiques de notation'));
    if (n.grilles) parts.push(p(n.grilles, 'grille', 'grilles'));
    if (n.cartouches) parts.push(p(n.cartouches, 'cartouche', 'cartouches'));
    if (parts.length === 0) return 'rien';
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1];
}

/** Réécrit un magasin par la file ; rend le nombre d'objets touchés (0 = rien écrit). */
async function _repointerEchelle(cleMagasin, estCible, appliquer) {
    let n = 0;
    await modifierEtAnnoncer(cleMagasin, (lues) => {
        const liste = Array.isArray(lues) ? lues : (lues ? [lues] : []);
        n = 0;
        liste.forEach(x => { if (x && estCible(x)) { appliquer(x); n++; } });
        return n === 0 ? undefined : liste;
    }, [], { geste: 'Remplacer l\'échelle' });
    return n;
}

/**
 * Tout ce qui nomme `ancienneId` dans le trimestre actif nomme désormais
 * `nouvelleId`. Chaque magasin par la file (#522) ; rend les comptes RÉELLEMENT
 * écrits — c'est eux que l'écran annonce après coup, pas ceux d'avant.
 */
async function remplacerEchellePartout(ancienneId, nouvelleId) {
    const nb = { evaluations: 0, productions: 0, pratiques: 0, grilles: 0, cartouches: 0 };
    nb.evaluations = await migrerEvaluationsVersNouvelleEchelle(ancienneId, nouvelleId);
    const nommeAncienne = (x) => x.echelleId === ancienneId;
    const versNouvelle = (x) => { x.echelleId = nouvelleId; };
    nb.productions = await _repointerEchelle(cle('productions'), nommeAncienne, versNouvelle);
    nb.pratiques = await _repointerEchelle(cle('pratiquesConfigurables'),
        p => (p.configuration && p.configuration.echelleId === ancienneId) || p.echelleId === ancienneId,
        p => {
            if (p.configuration && p.configuration.echelleId === ancienneId) p.configuration.echelleId = nouvelleId;
            if (p.echelleId === ancienneId) p.echelleId = nouvelleId;
        });
    const grilles = await db.get(cle('grillesTemplates')) || [];
    nb.grilles = await _repointerEchelle(cle('grillesTemplates'), nommeAncienne, versNouvelle);
    for (const g of (Array.isArray(grilles) ? grilles : [])) {
        if (g && g.id) nb.cartouches += await _repointerEchelle(cle(`cartouches_${g.id}`), nommeAncienne, versNouvelle);
    }
    nb.total = nb.evaluations + nb.productions + nb.pratiques + nb.grilles + nb.cartouches;
    return nb;
}

/**
 * Le chemin partagé par lequel une échelle quitte l'ancrage depuis Conception.
 * Rend { supprimee, nb, successeur } ; ne supprime JAMAIS sans successeur quand
 * quelque chose la nomme ; refuse dans un trimestre archivé ; sans porteur, pose
 * `options.questionSimple` et rien de plus.
 * ⚠ Lit hors file pour poser ses questions, écrit DANS la file (#522) : l'index
 * est recalculé au moment d'écrire, celui d'avant les questions ne vaut rien.
 */
async function supprimerOuRemplacerEchelle(id, options = {}) {
    const echelles = await db.get(cle('echellesTemplates')) || [];
    const echelle = echelles.find(e => e && e.id === id);
    if (!echelle) return { supprimee: false };
    const nomEchelle = echelle.nom || 'cette échelle';

    const nb = compterPorteursEchelleDans(id, await lireMagasinsEchelle());
    let successeur = null;
    let ecrits = null;

    if (nb.total === 0) {
        // Témoin négatif : rien ne la nomme — la question d'avant, sans un mot de plus.
        // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
        if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('echelle'))) return { supprimee: false, annulee: true };
        if (!confirm(options.questionSimple || 'Supprimer cette échelle ?')) return { supprimee: false, annulee: true };
    } else {
        if (window.estTrimestreArchive && window.estTrimestreArchive()) {
            alert(`Ce trimestre est clos : remplacer l'échelle «${nomEchelle}» toucherait ${decrirePorteursEchelle(nb)}, dont des notes déjà remises.\n\nRien n'a été modifié.`);
            return { supprimee: false, refusee: 'archive', nb };
        }
        const autres = echelles.filter(e => e && e.id !== id);
        const candidats = autres.filter(e => comparerCodesEchelles(echelle, e).compatibles);
        const ecartes = autres.length - candidats.length;
        if (candidats.length === 0) {
            const codes = (echelle.niveaux || []).map(n => n && n.code).filter(c => c != null && String(c).trim() !== '').join(', ');
            alert(`L'échelle «${nomEchelle}» est employée par ${decrirePorteursEchelle(nb)} : la supprimer, c'est la remplacer.\n\nAucune autre échelle de ce trimestre ne porte ses niveaux (${codes || 'aucun code'}). Crée d'abord une échelle aux mêmes niveaux, ou corrige celle-ci.\n\nRien n'a été modifié.`);
            return { supprimee: false, refusee: 'aucun-successeur', nb };
        }
        let question = `Supprimer l'échelle «${nomEchelle}», c'est la remplacer : ${decrirePorteursEchelle(nb)} suivront.\n\nPar quelle échelle la remplacer ?\n\n`;
        candidats.forEach((e, i) => { question += `${i + 1}. ${e.nom || 'Sans titre'}\n`; });
        if (ecartes > 0) {
            question += `\n(${ecartes} autre(s) échelle(s) du trimestre n'ont pas les mêmes niveaux et ne sont pas proposées.)\n`;
        }
        // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
        if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('echelle'))) return { supprimee: false, annulee: true };
        const choix = prompt(question + '\nEntre le numéro, ou Annuler pour ne rien changer :');
        const numero = parseInt(choix, 10);
        if (!numero || numero < 1 || numero > candidats.length) return { supprimee: false, annulee: true, nb };
        successeur = candidats[numero - 1];
        ecrits = await remplacerEchellePartout(id, successeur.id);
    }

    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }
    let supprimee = false;
    await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
        const liste = lues || [];
        const restants = liste.filter(e => !(e && e.id === id));
        if (restants.length === liste.length) return undefined;
        supprimee = true;
        return restants;
    }, [], { geste: 'Supprimer l\'échelle' });
    return { supprimee, nb: ecrits, successeur };
}

/** Le message d'après dit ce qui est parti — et, s'il y a eu remplacement, ce qui a suivi. */
function notifierEchelleSupprimee(resultat) {
    if (resultat && resultat.successeur) {
        notifications.succes('Échelle remplacée et supprimée', `«${resultat.successeur.nom || 'Sans titre'}» prend la place : ${decrirePorteursEchelle(resultat.nb)} suivent.`);
    } else {
        notifications.succes('Échelle supprimée');
    }
}

async function supprimerEchelleDepuisSidebar(id) {
    // #648 — le remplacement vit dans supprimerOuRemplacerEchelle, partagé par les
    // trois gestes de Conception ; ce qui reste ici est l'écran.
    const resultat = await supprimerOuRemplacerEchelle(id, { questionSimple: 'Supprimer cette échelle ?' });
    if (!resultat.supprimee) return;

    await afficherListeEchelles();
    document.getElementById('conteneurEditionEchelle')?.classList.add('u-hide');
    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    document.getElementById('accueilEchelles')?.classList.remove('u-hide');
    notifierEchelleSupprimee(resultat);
}

/**
 * Duplique l'échelle actuellement en cours d'édition
 */
async function dupliquerEchelleActive() {
    if (!echelleTemplateActuelle) {
        alert('Aucune échelle à dupliquer');
        return;
    }
    await dupliquerEchelleDepuisSidebar(echelleTemplateActuelle.id);
}

/**
 * Supprime l'échelle actuellement en cours d'édition
 */
async function supprimerEchelleActive() {
    if (!echelleTemplateActuelle) {
        alert('Aucune échelle à supprimer');
        return;
    }
    await supprimerEchelleDepuisSidebar(echelleTemplateActuelle.id);
}

/**
 * Sauvegarde complète de l'échelle en cours d'édition
 */
async function sauvegarderEchelleComplete() {
    let nom = document.getElementById('nomEchelleTemplate').value.trim();

    // Vérifier le nom
    if (!nom) {
        alert('Donne un nom à l\'échelle.');
        return;
    }

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    // ⚠ Cette lecture sert à POSER LA QUESTION du doublon, pas de base à une
    // écriture : `verifierEtGererDoublon` peut attendre l'utilisateur. Les deux
    // écritures ci-dessous relisent la collection dans la file.
    let echelles = await db.get(cle('echellesTemplates')) || [];
    const idActuel = echelleTemplateActuelle?.id || null;
    const isCreation = !echelleTemplateActuelle;
    const isNameChange = echelleTemplateActuelle && echelleTemplateActuelle.nom !== nom;
    let ecraserHomonyme = false;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        // #967 — un homonyme employé est refusé par la question elle-même.
        const resultat = await verifierEtGererDoublon('echelle', nom, echelles, idActuel, {
            porteursHomonymes: (homonymes) => compterPorteursHomonymesEchelle(homonymes)
        });

        if (resultat === null) {
            // Utilisateur a annulé
            return;
        }

        if (resultat && resultat.action === 'renommer') {
            nom = resultat.nouveauNom;
            document.getElementById('nomEchelleTemplate').value = nom;
        }

        // Relecture du lot E1, trouvaille 1 (a) : « Écraser » ne retire plus l'homonyme
        // ICI, avant les vérifications — une échelle sans niveau (ou aux repères refusés)
        // supprimait l'ancienne sans créer la nouvelle. Le retrait part dans l'écriture
        // de création, comme pour la grille. #967 : seul un homonyme que rien n'emploie
        // arrive ici ; il part sans laisser de référence.
        if (resultat && resultat.action === 'ecraser') ecraserHomonyme = true;
    }

    // Cas 1: Création d'une nouvelle échelle (echelleTemplateActuelle est null)
    if (!echelleTemplateActuelle && window._niveauxNouvelleEchelle) {
        const niveaux = window._niveauxNouvelleEchelle;

        if (niveaux.length === 0) {
            alert('Ajoute au moins un niveau de performance.');
            return;
        }

        // #555 lot 2 (e) — les repères posés dans le tampon, revérifiés contre
        // les niveaux FINAUX : un code renommé après avoir été désigné ne part
        // pas en base en silence. Le refus se dit, et l'enregistrement attend.
        const transport = reperesNouvelleEchellePourEnregistrement();
        if (transport.refuse) {
            alert('Repères de maîtrise — ' + transport.refuse);
            return;
        }

        // 🆕 Beta 95.3 : Capturer discipline depuis infoCours
        const infoCours = typeof db !== 'undefined' && db.getSync ? db.getSync('infoCours', {}) : {};
        const discipline = infoCours?.discipline || '';

        // Auteur CC = identité de l'utilisateur (Plan 1 §4.4)
        const identiteUtilisateur = obtenirIdentiteCCUtilisateur();

        // Créer la nouvelle échelle
        const nouvelleEchelle = {
            id: genererIdUnique('ECH_'),
            nom: nom,
            niveaux: niveaux,
            // #555 lot 2 (e) — uniquement les repères posés : jamais de clé vide.
            ...transport.reperes,
            description: document.getElementById('descriptionEchelle')?.value?.trim() || '',
            discipline: discipline, // 🆕 Beta 95.3
            dansBibliotheque: true,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            metadata_cc: {
                auteur_original: identiteUtilisateur,
                date_creation: new Date().toISOString().split('T')[0],
                contributeurs: []
            }
        };

        // Sauvegarder dans la base. La file relit : la collection écrite est
        // celle de l'instant, pas celle lue avant la question du doublon.
        await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
            let liste = lues || [];
            if (ecraserHomonyme) liste = liste.filter(e => e.nom !== nom);
            liste.push(nouvelleEchelle);
            return liste;
        }, [], { geste: 'Créer l\'échelle' });

        // Nettoyer les niveaux temporaires, et les repères qui vont avec
        window._niveauxNouvelleEchelle = null;
        window._reperesNouvelleEchelle = null;

        // Définir comme échelle actuelle
        echelleTemplateActuelle = nouvelleEchelle;

        // Message de confirmation (lot E1, D3 : le geste de création a son message)
        notifications.succes(`Échelle «\u00a0${nom}\u00a0» créée.`);
    } else {
        // Lot E1 (D3) : une échelle existante s'enregistre toute seule, champ par
        // champ ; « Créer l'échelle » ne paraît qu'en création. L'ancienne branche
        // « Enregistrer » d'une échelle existante est retirée avec son bouton.
        return;
    }

    // Recharger la liste pour refléter les changements
    await afficherListeEchelles();

    // 🆕 BETA 95.1 : Réouvrir l'échelle en mode édition pour qu'elle reste visible
    const idSauvegarde = echelleTemplateActuelle?.id;
    if (idSauvegarde && typeof chargerEchellePourModif === 'function') {
        setTimeout(() => {
            chargerEchellePourModif(idSauvegarde);
        }, 100);
    }
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler délégué pour modifierNiveauTemp(index, champ, valeur) */
/**
 * #524 — le champ refusé se voit, et ne le dit qu'une fois (cf. #516).
 * ⚠ Sans la garde `dejaMarque`, vider un champ puis cliquer trois fois ailleurs
 * produirait trois bandeaux pour un seul problème.
 */
function marquerChampRefuseEchelle(el, raison) {
    if (!el || !el.classList) return;
    if (!raison) { el.classList.remove('champ-refuse'); return; }
    const dejaMarque = el.classList.contains('champ-refuse');
    el.classList.add('champ-refuse');
    // Lot E1 (D3) : un seul message, par le témoin commun — « Non enregistré : ‹raison› ».
    // Avant : un panneau d'erreur à deux phrases, en plus du champ marqué. Le témoin
    // s'efface à la prochaine écriture réussie de la même clé.
    if (!dejaMarque && window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(raison), undefined, cle('echellesTemplates'));
    }
}

function modifierNiveauTempHandler(el) {
    var index = parseInt(el.dataset.niveauIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-float') ? parseFloat(el.value) : el.value;
    var resultat = modifierNiveauTemp(index, champ, valeur);
    marquerChampRefuseEchelle(el, resultat && resultat.refuse);
}

/** Handler délégué pour modifierNiveauEchelle(echelleId, index, champ, valeur) */
function modifierNiveauEchelleHandler(el) {
    var echelleId = el.dataset.echelleId;
    var index = parseInt(el.dataset.niveauIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-float') ? parseFloat(el.value) : el.value;
    Promise.resolve(modifierNiveauEchelle(echelleId, index, champ, valeur))
        .then(function (resultat) { marquerChampRefuseEchelle(el, resultat && resultat.refuse); });
}

/** #555 lot 2 (e) — pose un repère sur l'échelle NEUVE (tampon), et rend visible un refus. */
function modifierRepereTempHandler(el) {
    var resultat = modifierRepereTemp(el.dataset.champ, el.value);
    marquerChampRefuseEchelle(el, resultat && resultat.refuse);
}

/** #555 — écrit un repère de maîtrise, et rend visible un refus. */
function modifierRepereEchelleHandler(el) {
    Promise.resolve(modifierRepereEchelle(el.dataset.echelleId, el.dataset.champ, el.value))
        .then(function (resultat) { marquerChampRefuseEchelle(el, resultat && resultat.refuse); });
}

/** Annuler import échelles (fermer modal + cleanup) */
function fermerModalImportEchelles() {
    // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
    // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
    // est `<body>` → `.remove()` effacerait toute l'application).
    var wrapper = document.querySelector('.modal-import-echelles');
    if (wrapper) wrapper.remove();
    delete window._echellesImportEnAttente;
}

/** Confirmer import + fermer modal */
function confirmerEtFermerImportEchelles() {
    window.confirmerImportEchelles(window._echellesImportEnAttente);
    fermerModalImportEchelles();
}

/** Ouvrir le file picker pour import échelles */
function ouvrirFilePickerImportEchelles() {
    var input = document.getElementById('fichier-import-echelles-modal');
    if (input) input.click();
}

// Export global
window.afficherListeEchelles = afficherListeEchelles;
// 🆕 #466/CO-16 (21 août 2026) : appelé par changerTrimestreActifV2 (même patron
// que grilles) — le pointeur d'édition ne survit pas à la bascule.
// 🔧 #625 (31 août 2026) : les TAMPONS DE CRÉATION non plus. #466 ne purgeait que le
// pointeur, alors que la branche création de `sauvegarderEchelleComplete`
// (`!echelleTemplateActuelle && window._niveauxNouvelleEchelle`) restait armée : les
// niveaux saisis dans l'ancien trimestre partaient en base dans le namespace du
// NOUVEAU. Les deux tampons vont par PAIRE — des repères sans leurs niveaux sont
// tout aussi fantômes (#555 lot 2 (e)), et `annulerFormEchelle` les nettoie déjà
// ensemble. Constat S3 de l'audit du 30 août, angle mort §4.5.
function reinitialiserEditeurEchellesApresBascule() {
    echelleTemplateActuelle = null;
    window._niveauxNouvelleEchelle = null;
    window._reperesNouvelleEchelle = null;
}
window.reinitialiserEditeurEchellesApresBascule = reinitialiserEditeurEchellesApresBascule;
window.creerNouvelleEchelle = creerNouvelleEchelle;
window.annulerFormEchelle = annulerFormEchelle;
window.fermerFicheEchelle = fermerFicheEchelle;
window.ouvrirEchelleDepuisListe = ouvrirEchelleDepuisListe;
window.chargerEchellePourModif = chargerEchellePourModif;
window.dupliquerEtEditerEchelle = dupliquerEtEditerEchelle;
window.dupliquerEchelleDepuisSidebar = dupliquerEchelleDepuisSidebar;
window.supprimerEchelleDepuisSidebar = supprimerEchelleDepuisSidebar;
window.dupliquerEchelleActive = dupliquerEchelleActive;
window.supprimerEchelleActive = supprimerEchelleActive;
window.sauvegarderEchelleComplete = sauvegarderEchelleComplete;
window.deplacerNiveauEchelleHaut = deplacerNiveauEchelleHaut;
window.deplacerNiveauEchelleBas = deplacerNiveauEchelleBas;
window.ajouterNiveauEchelle = ajouterNiveauEchelle;
window.ajouterPremierNiveau = ajouterPremierNiveau;
window.afficherNiveauxNouvelleEchelle = afficherNiveauxNouvelleEchelle;
window.afficherNiveauxEchelle = afficherNiveauxEchelle;                     // #505 — pour que la sentinelle puisse EXÉCUTER ce rendu
window.modifierNiveauTemp = modifierNiveauTemp;
window.ajouterNiveauTemp = ajouterNiveauTemp;
window.supprimerNiveauTemp = supprimerNiveauTemp;
window.deplacerNiveauTempHaut = deplacerNiveauTempHaut;
window.deplacerNiveauTempBas = deplacerNiveauTempBas;
window.supprimerNiveauEchelle = supprimerNiveauEchelle;
window.modifierNiveauEchelle = modifierNiveauEchelle;
window.refusChampNiveau = refusChampNiveau;                                 // #524
window.valeurNumeriqueDuNiveau = valeurNumeriqueDuNiveau;                   // #525 — LA règle, pour tous les lecteurs
window.optionsNiveauSOLOEchelle = optionsNiveauSOLOEchelle;                 // #542 lot 2 — UN seul producteur pour les deux éditeurs
window.NIVEAUX_SOLO_ECHELLE = NIVEAUX_SOLO_ECHELLE;                         // #542 lot 2 — les cinq niveaux canoniques
window.REFUS_MIN_NIVEAU = REFUS_MIN_NIVEAU;
window.REFUS_VALEUR_NIVEAU = REFUS_VALEUR_NIVEAU;                           // #526
window.REFUS_MAX_NIVEAU = REFUS_MAX_NIVEAU;
window.marquerChampRefuseEchelle = marquerChampRefuseEchelle;               // #524
window.REFUS_CODE_NIVEAU = REFUS_CODE_NIVEAU;
window.REFUS_NOM_NIVEAU = REFUS_NOM_NIVEAU;
window.migrerEvaluationsVersNouvelleEchelle = migrerEvaluationsVersNouvelleEchelle;
// #648 — supprimer une échelle est un remplacement : le cœur partagé, exposé pour
// l'onglet Données (donnees-v2.js) et pour les sentinelles.
window.comparerCodesEchelles = comparerCodesEchelles;
window.compterPorteursEchelleDans = compterPorteursEchelleDans;
window.lireMagasinsEchelle = lireMagasinsEchelle;
window.lireMagasinsEchelleSync = lireMagasinsEchelleSync;
window.decrirePorteursEchelle = decrirePorteursEchelle;
window.compterPorteursHomonymesEchelle = compterPorteursHomonymesEchelle;
window.remplacerEchellePartout = remplacerEchellePartout;
window.supprimerOuRemplacerEchelle = supprimerOuRemplacerEchelle;
window.notifierEchelleSupprimee = notifierEchelleSupprimee;

// ✅ AJOUT (8 décembre 2025) : Exports fonctions bibliothèque
window.afficherBibliothequeEchelles = afficherBibliothequeEchelles;
window.retirerEchelleDeBibliotheque = retirerEchelleDeBibliotheque;
window.ajouterEchellesABibliotheque = ajouterEchellesABibliotheque;
window.fermerModalBibliothequeEchelles = fermerModalBibliothequeEchelles;
window.ajouterEchelleIndividuelle = ajouterEchelleIndividuelle;
window.dupliquerEchelleBibliotheque = dupliquerEchelleBibliotheque;
window.supprimerEchelleDefinitivement = supprimerEchelleDefinitivement;
window.supprimerEchelleDeBibliothequePartagee = supprimerEchelleDeBibliothequePartagee;
window.ajouterMesEchellesALaBibliotheque = ajouterMesEchellesALaBibliotheque;

// 🆕 Beta 95.3 : Exports fonctions import depuis trimestre
window.afficherEchellesTrimestreModal = afficherEchellesTrimestreModal;
window.importerToutEchellesTrimestreModal = importerToutEchellesTrimestreModal;
window.importerUneEchelleTrimestre = importerUneEchelleTrimestre;

// Phase 5 : Exports wrappers délégation
window.modifierNiveauTempHandler = modifierNiveauTempHandler;
window.modifierNiveauEchelleHandler = modifierNiveauEchelleHandler;
window.modifierRepereEchelleHandler = modifierRepereEchelleHandler;          // #555
window.modifierRepereTempHandler = modifierRepereTempHandler;                // #555 lot 2 (e)
window.modifierRepereTemp = modifierRepereTemp;                              // #555 lot 2 (e)
window.reperesNouvelleEchellePourEnregistrement = reperesNouvelleEchellePourEnregistrement; // #555 lot 2 (e) — testabilité
window.apercuNiveauxEchelleHtml = apercuNiveauxEchelleHtml;                  // #555 lot 2 (e) — testabilité
window.modifierRepereEchelle = modifierRepereEchelle;                        // #555
window.ecrireRepereEchelle = ecrireRepereEchelle;                            // #577 — l'assistant écrit sans redessiner l'éditeur
// 🔧 #625 / M11 (31 août 2026) : le second `window.marquerChampRefuseEchelle` vivait
// ici (doublon exact de l'export #524, ~230 lignes plus haut). Retiré. Son commentaire
// « #577 — le même marquage de refus dans l'assistant » disait la même chose que celui
// de #524 ; en revanche la ligne portait aussi, concaténé après un long blanc, le
// commentaire ORPHELIN d'`ecrireRepereEchelle` — rendu ci-dessus à sa fonction.
window.blocReperesEchelle = blocReperesEchelle;                              // #577 — le même bloc dans l'assistant
window.refusRepereEchelle = refusRepereEchelle;                              // #555
window.optionsRepereEchelle = optionsRepereEchelle;                          // #555
window.niveauxRangesDeLEchelle = niveauxRangesDeLEchelle;                    // #555
window.fermerModalImportEchelles = fermerModalImportEchelles;
window.confirmerEtFermerImportEchelles = confirmerEtFermerImportEchelles;
window.ouvrirFilePickerImportEchelles = ouvrirFilePickerImportEchelles;

// ================================================================
// API SSOT — Point d'écriture centralisé pour `echellesTemplates`
// Tier 6.4 : Les modules externes doivent passer par cette fonction.
// ================================================================

/**
 * Importe des échelles depuis une source externe.
 *
 * @param {Array} nouvellesEchelles - Échelles à importer
 * @param {Object} [options] - Options d'import
 * @param {boolean} [options.remplacer=false] - Remplacer si même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre d'échelles ajoutées/mises à jour
 */
window.importerEchellesExternes = function(nouvellesEchelles, options) {
    if (!nouvellesEchelles || nouvellesEchelles.length === 0) return 0;
    options = options || {};

    var echelles = db.getSync(cle('echellesTemplates'), []);
    var compteur = 0;

    for (var i = 0; i < nouvellesEchelles.length; i++) {
        var echelle = nouvellesEchelles[i];
        var index = echelles.findIndex(function(e) { return e.id === echelle.id; });

        if (index >= 0) {
            if (options.remplacer) {
                echelles[index] = echelle;
                compteur++;
            }
        } else {
            echelles.push(echelle);
            compteur++;
        }
    }

    if (compteur > 0) {
        db.setSync(cle('echellesTemplates'), echelles);

        if (!options.silencieux) {
            if (typeof afficherListeEchelles === 'function') afficherListeEchelles();
        }
    }

    return compteur;
};

})();
