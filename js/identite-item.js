/* ===============================
   MODULE: IDENTITÉ D'UN ITEM DE BIBLIOTHÈQUE (#291 / #476)

   Rôle: fonctions PURES, sans lecture ni écriture de stockage, sans DOM.

   POURQUOI CE MODULE EXISTE

   Cinq détecteurs de doublons identiques vivaient dans grilles.js,
   cartouches.js, echelles.js, productions.js et pratiques-gestion.js. Tous
   commençaient par DÉDUPLIQUER PAR `id` avant de regrouper par nom. Trois
   conséquences, mesurées le 23 août 2026 :

     · une vraie collision d'identifiant (le même `id` deux fois dans la liste)
       rendait `[]` — l'anomalie la plus grave était la seule INVISIBLE ;
     · une copie (« ajouter à ma sélection » pose un `id` neuf + `idOriginal`)
       et deux entités homonymes mais distinctes sortaient INDISCERNABLES ;
     · le bandeau affirmait pourtant « IDs identiques = vraies copies, IDs
       différents = homonymes légitimes » — faux des deux côtés, la première
       moitié étant même une branche morte.

   D'où la plainte de Grégoire : « Lesquels sont lesquels ? ». La réponse
   technique est qu'on ne pouvait pas le savoir : l'information était détruite
   avant l'affichage.

   LE NOM N'EST PAS UNE IDENTITÉ. Grégoire possède en a2025 deux échelles
   « IDME et niv 0 » réellement utilisées toutes les deux (#450). On regroupe
   par nom pour ATTIRER L'ŒIL, mais on classe par IDENTITÉ, et on ne bloque
   jamais sur le nom.

   L'IDENTITÉ EXISTE DÉJÀ DANS LES DONNÉES, sous quatre formes posées par
   quatre chemins différents :
     · `idOriginal`               — « ajouter à ma sélection » depuis la biblio
     · `inspireDe.idOriginal`     — import d'un paquet collègue (D7)
     · `inspireDe.sourceId`       — duplication / dérivation de pratique
     · (`inspireDeTrimestre` est un identifiant de TRIMESTRE, pas d'item : il
       ne porte aucune identité et n'entre pas dans le calcul.)

   API publique (toutes pures) :
   - identitesDe(item)                 → Set des jetons d'identité
   - memeIdentite(a, b)                → booléen (intersection non vide)
   - classerGroupe(exemplaires)        → 'collision-id' | 'copie' | 'homonymes'
   - reunirSources(...listes)          → une liste unique, sans compter deux
                                         fois le même objet vu de deux magasins
   - analyserDoublons(liste, champNom) → groupes de même nom, classés

   Testé dans tests/unit/identite-item.test.js.
   =============================== */

(function () {
'use strict';

/**
 * Normalise un nom pour le REGROUPEMENT visuel uniquement.
 * Insensible à la casse, aux espaces de bord et aux espaces multiples.
 * Ne sert jamais à décider d'une identité.
 *
 * @param {*} valeur
 * @returns {string} nom normalisé ('' si absent)
 */
function normaliserNom(valeur) {
    return String(valeur == null ? '' : valeur).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Ajoute un jeton au Set s'il s'agit d'une chaîne non vide.
 * Les `id` du projet sont toujours des chaînes ; une valeur numérique ou
 * booléenne qui traînerait ne doit pas créer d'identité fantôme.
 */
function ajouterJeton(jetons, valeur) {
    if (typeof valeur !== 'string') return;
    var propre = valeur.trim();
    if (propre) jetons.add(propre);
}

/**
 * Rend l'ensemble des jetons d'identité d'un item.
 *
 * Un jeton est un identifiant d'ITEM : le sien, ou celui d'un ancêtre dont il
 * descend directement. Deux items qui partagent au moins un jeton sont le même
 * élément ou deux exemplaires de la même lignée.
 *
 * @param {Object} item - grille, échelle, cartouche, production ou pratique
 * @returns {Set<string>} jetons (vide si l'item est nul ou sans identifiant)
 */
function identitesDe(item) {
    var jetons = new Set();
    if (!item || typeof item !== 'object') return jetons;

    ajouterJeton(jetons, item.id);
    ajouterJeton(jetons, item.idOriginal);

    var inspire = item.inspireDe;
    if (inspire && typeof inspire === 'object') {
        ajouterJeton(jetons, inspire.idOriginal);
        ajouterJeton(jetons, inspire.sourceId);
    }

    return jetons;
}

/**
 * Deux items relèvent-ils de la même identité ?
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean} true si leurs jetons d'identité se recoupent
 */
function memeIdentite(a, b) {
    var jetonsA = identitesDe(a);
    if (jetonsA.size === 0) return false;
    var jetonsB = identitesDe(b);
    if (jetonsB.size === 0) return false;

    for (var jeton of jetonsB) {
        if (jetonsA.has(jeton)) return true;
    }
    return false;
}

/**
 * Répartit des exemplaires en LIGNÉES par fermeture transitive de
 * `memeIdentite`. Deux exemplaires sont dans la même lignée s'ils sont reliés
 * par une chaîne de parentés, même sans jeton commun deux à deux.
 *
 * Cas visé : X ← Y ← Z. Y porte {Y, X} et Z porte {Z, Y} ; X porte {X}. X et Z
 * n'ont aucun jeton commun, et pourtant les trois sont bien une seule lignée.
 *
 * @param {Array} exemplaires
 * @returns {Array<number>} indice de lignée (1-based) pour chaque exemplaire
 */
function repartirEnLignees(exemplaires) {
    var n = exemplaires.length;
    var parent = new Array(n);
    for (var i = 0; i < n; i++) parent[i] = i;

    function racine(x) {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    for (var a = 0; a < n; a++) {
        for (var b = a + 1; b < n; b++) {
            if (memeIdentite(exemplaires[a], exemplaires[b])) {
                var ra = racine(a), rb = racine(b);
                if (ra !== rb) parent[ra] = rb;
            }
        }
    }

    // Numérotation stable : les lignées sont numérotées dans l'ordre
    // d'apparition de leur premier exemplaire.
    var numeros = new Map();
    var lignees = new Array(n);
    for (var k = 0; k < n; k++) {
        var r = racine(k);
        if (!numeros.has(r)) numeros.set(r, numeros.size + 1);
        lignees[k] = numeros.get(r);
    }
    return lignees;
}

/**
 * Classe un groupe d'exemplaires portant le même nom.
 *
 * Trois catégories, par gravité DÉCROISSANTE — un groupe mixte prend la
 * catégorie la plus grave qu'il contient, et le détail par exemplaire (lignée,
 * drapeau de collision) permet de voir lesquels sont concernés :
 *
 *   'collision-id' — au moins deux exemplaires portent LE MÊME `id`. Anomalie
 *                    de données : un identifiant est censé être unique. C'est
 *                    précisément le cas que l'ancien code rendait invisible.
 *   'copie'        — au moins deux exemplaires appartiennent à la même lignée
 *                    (l'un descend de l'autre, ou tous deux d'un même original).
 *                    Duplication : on peut n'en garder qu'un.
 *   'homonymes'    — chaque exemplaire est une entité distincte. CE N'EST PAS
 *                    UN DÉFAUT (#450).
 *
 * @param {Array} exemplaires - au moins deux items de même nom
 * @returns {'collision-id'|'copie'|'homonymes'}
 */
function classerGroupe(exemplaires) {
    var liste = Array.isArray(exemplaires) ? exemplaires : [];
    if (liste.length < 2) return 'homonymes';

    var idsVus = new Set();
    for (var i = 0; i < liste.length; i++) {
        var item = liste[i];
        var id = (item && typeof item.id === 'string') ? item.id.trim() : '';
        if (!id) continue;
        if (idsVus.has(id)) return 'collision-id';
        idsVus.add(id);
    }

    var lignees = repartirEnLignees(liste);
    var vues = new Set();
    for (var k = 0; k < lignees.length; k++) {
        if (vues.has(lignees[k])) return 'copie';
        vues.add(lignees[k]);
    }

    return 'homonymes';
}

/**
 * Réunit plusieurs magasins en UNE liste, sans compter deux fois le même objet.
 *
 * ⚠ CE HELPER EST LA RAISON POUR LAQUELLE LE RETRAIT DE L'ANCIENNE
 * DÉDUPLICATION NE PRODUIT PAS UN DÉLUGE DE FAUSSES ALERTES.
 *
 * Les cinq modales lisent DEUX magasins : la sélection locale de l'utilisateur
 * (`<trimestre>_grillesTemplates`…) et la bibliothèque partagée
 * (`bibliothequeGrilles`…). Or « Ajouter mes grilles à la bibliothèque »
 * (`ajouterGrilleALaBibliotheque`, grilles-bibliotheque.js) verse la grille
 * dans le magasin partagé EN CONSERVANT SON `id`. Le même identifiant vit donc
 * légitimement des deux côtés, et ce n'est PAS une anomalie : c'est un seul
 * objet, vu de deux endroits.
 *
 * Concaténer les deux listes telles quelles aurait donc classé
 * « collision d'identifiant » chacune des grilles que Grégoire a publiées —
 * exactement le bruit que ce chantier existe pour supprimer.
 *
 * La règle, elle, ne dédouane pas la vraie anomalie :
 *   · même `id` dans DEUX magasins différents → un seul exemplaire retenu ;
 *   · même `id` DEUX FOIS DANS LE MÊME magasin → les deux sont retenus, et
 *     `classerGroupe` les verra comme la collision qu'ils sont.
 *
 * Formellement, un `id` est retenu autant de fois que son nombre MAXIMAL
 * d'occurrences dans un même magasin. Les items sans `id` sont tous retenus :
 * rien ne permet de les rapprocher.
 *
 * L'ordre est préservé, magasin par magasin, dans l'ordre des arguments.
 *
 * @param {...Array} listes - magasins à réunir (non-tableaux ignorés)
 * @returns {Array} liste réunie, prête pour `analyserDoublons`
 */
function reunirSources() {
    var sortie = [];
    var dejaEmis = new Map();   // id → nombre d'exemplaires déjà retenus

    for (var i = 0; i < arguments.length; i++) {
        var liste = arguments[i];
        if (!Array.isArray(liste)) continue;

        var vusDansCeMagasin = new Map();
        var ajoutsDeCeMagasin = new Map();

        for (var j = 0; j < liste.length; j++) {
            var item = liste[j];
            if (!item || typeof item !== 'object') continue;

            var id = (typeof item.id === 'string') ? item.id.trim() : '';
            if (!id) { sortie.push(item); continue; }

            // Rang de cette occurrence à l'intérieur du magasin courant.
            var rang = vusDansCeMagasin.get(id) || 0;
            vusDansCeMagasin.set(id, rang + 1);

            // On ne retient que ce qui dépasse ce qu'un magasin précédent a
            // déjà fourni : le maximum, pas la somme.
            if (rang < (dejaEmis.get(id) || 0)) continue;

            sortie.push(item);
            ajoutsDeCeMagasin.set(id, (ajoutsDeCeMagasin.get(id) || 0) + 1);
        }

        ajoutsDeCeMagasin.forEach(function (n, id) {
            dejaEmis.set(id, (dejaEmis.get(id) || 0) + n);
        });
    }

    return sortie;
}

/**
 * Analyse une liste d'items et rend les groupes de même nom, classés.
 *
 * ⚠ NE DÉDUPLIQUE PAS PAR `id` EN AMONT. C'est tout l'objet de ce module :
 * la collision d'identifiant doit survivre jusqu'à l'affichage. Toute
 * déduplication ajoutée ici la ferait disparaître à nouveau.
 *
 * L'appelant passe une seule liste, déjà réunie (locaux + bibliothèque) :
 * c'est lui qui sait ce qu'il affiche à l'écran, et le bandeau ne doit décrire
 * que ce que l'utilisateur peut voir.
 *
 * @param {Array} liste - items à analyser (entrées nulles tolérées et écartées)
 * @param {string} [champNom] - 'nom' (défaut) ou 'titre' pour les productions
 * @returns {Array<{nom: string, categorie: string, count: number,
 *                  exemplaires: Array<{item: Object, id: string, idCourt: string,
 *                                      lignee: number, collisionId: boolean}>}>}
 */
function analyserDoublons(liste, champNom) {
    if (!Array.isArray(liste)) return [];
    var champ = champNom || 'nom';

    // Regroupement par nom normalisé, ordre d'apparition préservé.
    var groupes = new Map();
    for (var i = 0; i < liste.length; i++) {
        var item = liste[i];
        if (!item || typeof item !== 'object') continue;
        var nomNormalise = normaliserNom(item[champ]);
        if (!nomNormalise) continue;
        if (!groupes.has(nomNormalise)) groupes.set(nomNormalise, []);
        groupes.get(nomNormalise).push(item);
    }

    var resultat = [];
    groupes.forEach(function (exemplaires) {
        if (exemplaires.length < 2) return;

        var lignees = repartirEnLignees(exemplaires);

        // Quels `id` sont portés par plus d'un exemplaire du groupe ?
        var compteurIds = new Map();
        exemplaires.forEach(function (it) {
            var id = (it && typeof it.id === 'string') ? it.id.trim() : '';
            if (!id) return;
            compteurIds.set(id, (compteurIds.get(id) || 0) + 1);
        });

        resultat.push({
            // Le nom AFFICHABLE est celui du premier exemplaire, tel que stocké
            // (pas la forme normalisée, qui est un artefact de regroupement).
            nom: (exemplaires[0] && exemplaires[0][champ]) || 'Sans titre',
            categorie: classerGroupe(exemplaires),
            count: exemplaires.length,
            exemplaires: exemplaires.map(function (it, k) {
                var id = (it && typeof it.id === 'string') ? it.id.trim() : '';
                return {
                    item: it,
                    id: id,
                    idCourt: genererIdCourt(id),
                    // Le nom de CET exemplaire, tel que stocké : deux membres
                    // d'un groupe peuvent différer par la casse ou les espaces
                    // (« Artefact 7 » et « ARTEFACT  7 »), et c'est justement
                    // ce qu'il faut montrer pour les distinguer à l'écran.
                    nomAffiche: (it && it[champ]) || 'Sans titre',
                    lignee: lignees[k],
                    collisionId: id !== '' && compteurIds.get(id) > 1
                };
            })
        });
    });

    return resultat;
}

/**
 * ID court d'affichage : les 6 derniers caractères.
 * Repris de `BibliothequeUI.genererIdCourt` pour que ce module reste pur et
 * chargeable seul (les tests unitaires n'ont pas d'UI). Les deux doivent
 * rendre la même chose — la sentinelle le vérifie.
 *
 * @param {string} id
 * @returns {string}
 */
function genererIdCourt(id) {
    if (!id || id.length < 6) return id || '?';
    return id.slice(-6);
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.identitesDe = identitesDe;
window.memeIdentite = memeIdentite;
window.classerGroupe = classerGroupe;
window.reunirSources = reunirSources;
window.analyserDoublons = analyserDoublons;

})();
