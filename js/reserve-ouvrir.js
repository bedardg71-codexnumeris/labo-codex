/* ===============================
   MODULE : ARCHIVES OUVRIR — Réimport sélectif d'une archive
   Date : 28 avril 2026
   Backlog : #254
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md (voie de retour)

   Vocation
     Lit un fichier .reserve.zip exporté par le module Reserve, en
     extrait les ressources réutilisables (grilles, échelles, tampons
     personnalisés) et permet à l'utilisateur d'en réimporter une
     sélection vers ses bibliothèques actives.

   Scope v1 (28 avril 2026)
     - Lecture : input file (Safari + Chrome)
     - Réimport : grilles, échelles, tampons personnalisés
     - Mode doublon : ignore par défaut, toggle global « copie en double »
     - Hors scope v1 : productions, cartouches, pratiques (références
       croisées à remapper) ; données pédagogiques (étudiants, présences,
       évaluations, travaux) ; mode consultation namespace temporaire.

   Dépendances
     - ReserveVerifier.lireRepertoireZip, lireTexteDeLEntree, MOTS (reserve-verifier.js) :
       la lecture par tranches (#1025 : l'archive n'est plus chargée entière par JSZip)
     - validerZipSecurite (window.validerZipSecurite, depuis import-export.js)
     - importerGrillesExternes, importerEchellesExternes (window.*)
     - genererIdUnique (window.genererIdUnique, depuis main.js)
     - db (window.db)
     - echapperHtml (window.echapperHtml)
*/

(function() {
'use strict';

/* ===============================
   ÉTAT INTERNE
   =============================== */

// Payload de l’archive courant (source pour appliquerReimport)
var _payloadCourant = null;

// Mode navigation FSAPI : liste des archives détectés + handle racine
var _versementsListes = null;
var _handleReserveCourant = null;

/* ===============================
   UTILITAIRES
   =============================== */

function _echapper(s) {
    if (typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function _formaterDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return iso;
    }
}

/* ===============================
   LECTURE DU ZIP
   =============================== */

/**
 * Lit un fichier .reserve.zip et en extrait les ressources réimportables.
 *
 * @param {File} file - Fichier .zip sélectionné par l'utilisateur
 * @returns {Promise<{dossier, meta, donnees, ressources}>}
 */
async function chargerDepuisFichier(file) {
    if (!file) throw new Error('Aucun fichier fourni.');
    if (!window.ReserveVerifier || typeof window.ReserveVerifier.lireRepertoireZip !== 'function') {
        throw new Error('Bibliothèque de compression non chargée.');
    }

    // #1025 : l'archive n'est plus chargée entière (JSZip.loadAsync la lisait toute en mémoire,
    // copies comprises : 1,3 Go de pic pour une archive de 1,15 Go). On lit son répertoire
    // central, puis ses seuls textes, un à un, par tranches, comme « Vérifier ».
    var entrees;
    try {
        entrees = await window.ReserveVerifier.lireRepertoireZip(file);
    } catch (e) {
        // Un nom suspect est refusé dès le répertoire : on rend le message de
        // validerZipSecurite, comme avant ; toute autre erreur garde le message d'avant.
        var prefixeSuspect = window.ReserveVerifier.MOTS.erreurs.nomSuspect;
        var message = e && e.message ? e.message : '';
        if (message.indexOf(prefixeSuspect) === 0 && typeof window.validerZipSecurite === 'function') {
            var nomSuspect = message.slice(prefixeSuspect.length);
            var refus = window.validerZipSecurite({ files: { [nomSuspect]: { dir: false } } });
            if (!refus.valide) throw new Error('Validation sécurité : ' + refus.erreur);
        }
        throw new Error('Le fichier choisi n\'est pas un ZIP valide.');
    }

    // La même défense qu'avant (règle 3), sur la forme que lit validerZipSecurite.
    var parNom = {};
    entrees.forEach(function(e) { parNom[e.nom] = { dir: e.dir, _data: { uncompressedSize: e.tailleReelle }, entree: e }; });
    if (typeof window.validerZipSecurite === 'function') {
        var validation = window.validerZipSecurite({ files: parNom });
        if (!validation.valide) {
            throw new Error('Validation sécurité : ' + validation.erreur);
        }
    }

    function _lecteur(nom) {
        var f = parNom[nom];
        if (!f) return null;
        return function() {
            return window.ReserveVerifier.lireTexteDeLEntree(file, f.entree).then(function(texte) {
                if (texte === null) throw new Error('entrée tronquée : ' + nom);
                return texte;
            });
        };
    }

    // Localiser le dossier d’archive et les fichiers manifestes
    var fichierDonnees = null;
    var fichierMeta = null;
    var fichierPatch = null;
    var fichierManifesteGlobal = _lecteur('manifeste-archives.json');
    var dossierVersement = null;

    Object.keys(parNom).forEach(function(chemin) {
        var m = chemin.match(/^trimestres\/([^\/]+)\/(donnees|meta|manifeste-archives-patch)\.json$/);
        if (!m) return;
        if (m[2] === 'donnees' && !fichierDonnees) {
            fichierDonnees = _lecteur(chemin);
            dossierVersement = m[1];
        } else if (m[2] === 'meta' && !fichierMeta) {
            fichierMeta = _lecteur(chemin);
        } else if (m[2] === 'manifeste-archives-patch' && !fichierPatch) {
            fichierPatch = _lecteur(chemin);
        }
    });

    if (!fichierDonnees) {
        throw new Error('Le ZIP ne contient pas de archive reconnaissable (trimestres/.../donnees.json absent).');
    }

    var donnees, meta = null;
    try {
        donnees = JSON.parse(await fichierDonnees());
    } catch (e) {
        throw new Error('Échec de lecture de donnees.json : ' + (e.message || e));
    }

    if (fichierMeta) {
        try {
            meta = JSON.parse(await fichierMeta());
        } catch (e) {
            console.warn('[ReserveOuvrir] meta.json invalide, ignoré', e.message || e);
        }
    }

    // Auto-hydration du manifeste local (#248). Le simple fait d'ouvrir un
    // ZIP enregistre l’archive dans l'historique de l'app, peu importe
    // s'il a été créé avant ou après #248.
    await _hydrateManifesteDepuisZip(dossierVersement, fichierPatch, fichierManifesteGlobal, meta);

    var ressources = _extraireRessources(donnees);

    return {
        dossier: dossierVersement,
        meta: meta,
        donnees: donnees,
        ressources: ressources
    };
}

/**
 * Auto-hydration du manifeste local quand un ZIP est ouvert.
 * Stratégie en cascade :
 *   1. manifeste-archives.json à la racine (ZIPs récents) → fusion complète
 *   2. manifeste-archives-patch.json dans le dossier → upsert de l'entrée
 *   3. fallback : entrée minimum reconstruite depuis meta.json
 * Silencieux : aucun affichage si rien ne change ou si Reserve n'est pas chargé.
 */
async function _hydrateManifesteDepuisZip(dossierVersement, lirePatch, lireManifesteGlobal, meta) {
    if (!window.Reserve) return;

    try {
        if (lireManifesteGlobal && typeof window.Reserve.fusionnerManifesteRecu === 'function') {
            var manifesteTexte = await lireManifesteGlobal();
            var manifeste = JSON.parse(manifesteTexte);
            window.Reserve.fusionnerManifesteRecu(manifeste);
            return;
        }
    } catch (e) {
        console.warn('[ReserveOuvrir] manifeste-archives.json racine illisible, fallback patch', e.message || e);
    }

    if (typeof window.Reserve.upsertEntreeManifeste !== 'function') return;
    if (!dossierVersement) return;

    try {
        if (lirePatch) {
            var patchTexte = await lirePatch();
            var patchObj = JSON.parse(patchTexte);
            var entree = patchObj && patchObj.patch ? patchObj.patch : patchObj;
            if (entree && typeof entree === 'object') {
                window.Reserve.upsertEntreeManifeste(dossierVersement, entree);
                return;
            }
        }
    } catch (e) {
        console.warn('[ReserveOuvrir] manifeste-archives-patch.json illisible, fallback meta', e.message || e);
    }

    // Fallback : reconstruire une entrée minimum depuis meta.json
    if (!meta) return;
    var entreeFallback = {
        uuid: meta.uuid,
        trimestre: meta.trimestre,
        cours: meta.cours,
        nom_cours: meta.nom_cours || '',
        groupe: meta.groupe,
        statut: meta.statut || 'verse',
        source: meta.source || 'application (IndexedDB)',
        mode_archive: meta.mode_archive || 'zip',
        date_archive: meta.date_archive,
        donnees: !!(meta.contenu && meta.contenu.donnees),
        travaux: !!(meta.contenu && meta.contenu.nombre_fichiers_travaux > 0),
        nombre_etudiants: meta.contenu && meta.contenu.nombre_etudiants,
        nombre_fichiers_travaux: meta.contenu && meta.contenu.nombre_fichiers_travaux,
        taille_travaux_totale: meta.contenu && meta.contenu.taille_travaux_totale,
        notes: 'Hydraté depuis l\'ouverture du ZIP.'
    };
    window.Reserve.upsertEntreeManifeste(dossierVersement, entreeFallback);
}

/**
 * Lit une collection d'une archive sous ses deux formes de clé (#637, #953) :
 * `<trim>_<nom>` (namespacée) et `<nom>` (nue, héritée). La forme NAMESPACÉE
 * l'emporte en bloc : c'est elle que le trimestre archivé lisait. La nue ne sert
 * que si aucune namespacée n'existe. Un id répété n'est rendu qu'une fois.
 */
function _lireDeuxFormes(donnees, nom) {
    var namespacees = [];
    Object.keys(donnees).forEach(function(k) {
        // Préfixe = un seul segment (`a2025`) : `cartouches_G1` n'est pas une forme
        // namespacée de `G1`.
        var prefixe = k.slice(0, k.length - nom.length - 1);
        if (prefixe && prefixe.indexOf('_') < 0 && k === prefixe + '_' + nom &&
            Array.isArray(donnees[k])) {
            namespacees.push(donnees[k]);
        }
    });
    var sources = namespacees.length ? namespacees : (Array.isArray(donnees[nom]) ? [donnees[nom]] : []);
    var idsVus = new Set();
    return [].concat.apply([], sources).filter(function(item) {
        if (!item || !item.id) return true;
        if (idsVus.has(item.id)) return false;
        idsVus.add(item.id);
        return true;
    });
}

/**
 * Extrait les ressources réimportables et marque les doublons par ID.
 * Annote chaque production/cartouche/pratique avec ses références croisées
 * (grille/échelle) et un flag _ref*Manquante si la référence n'est ni dans
 * le payload ni dans les bibliothèques actives.
 */
function _extraireRessources(donnees) {
    var grillesActives = (window.db && db.getSync(cle('grillesTemplates'), [])) || [];
    var echellesActives = (window.db && db.getSync(cle('echellesTemplates'), [])) || [];
    var tamponsActifs = (window.db && db.getSync('tamponsPersonnalises', [])) || [];

    var cleProdActive = (typeof window.cle === 'function') ? cle('productions') : 'productions';
    var productionsActives = (window.db && db.getSync(cleProdActive, [])) || [];
    if (!Array.isArray(productionsActives)) productionsActives = [];

    var pratiquesActives = (window.db && db.getSync(cle('pratiquesConfigurables'), null) || []) || [];
    if (!Array.isArray(pratiquesActives)) pratiquesActives = [];

    var idsGrillesActives = new Set(grillesActives.map(function(g) { return g.id; }));
    var idsEchellesActives = new Set(echellesActives.map(function(e) { return e.id; }));
    var idsTamponsActifs = new Set(tamponsActifs.map(function(t) { return t.id; }));
    var idsProductionsActives = new Set(productionsActives.map(function(p) { return p.id; }));
    var idsPratiquesActives = new Set(pratiquesActives.map(function(p) { return p.id; }));

    // Grilles et échelles : les deux formes de clé d'une archive (#953, même règle que #637).
    // Depuis #358, le versement ne copie plus que `<trim>_grillesTemplates` /
    // `<trim>_echellesTemplates` : ne lire que la nue ne proposait rien.
    var grilles = _lireDeuxFormes(donnees, 'grillesTemplates')
        .filter(function(g) { return g && g.id && g.nom; })
        .map(function(g) { return Object.assign({}, g, { _doublon: idsGrillesActives.has(g.id) }); });

    var echelles = _lireDeuxFormes(donnees, 'echellesTemplates')
        .filter(function(e) { return e && e.id && e.nom; })
        .map(function(e) { return Object.assign({}, e, { _doublon: idsEchellesActives.has(e.id) }); });

    // Tampons (clé globale)
    var tampons = (Array.isArray(donnees.tamponsPersonnalises) ? donnees.tamponsPersonnalises : [])
        .filter(function(t) { return t && t.id; })
        .map(function(t) { return Object.assign({}, t, { _doublon: idsTamponsActifs.has(t.id) }); });

    // Productions : scanner toutes les clés *_productions du payload et flatten
    var productions = [];
    Object.keys(donnees).forEach(function(k) {
        if (k === 'productions' || /_productions$/.test(k)) {
            var arr = donnees[k];
            if (!Array.isArray(arr)) return;
            arr.forEach(function(p) {
                if (!p || !p.id || !p.titre) return;
                productions.push(Object.assign({}, p, { _doublon: idsProductionsActives.has(p.id) }));
            });
        }
    });

    // Cartouches : les DEUX formes de clé d'une archive (#637, 26 sept. 2026).
    // Depuis S5/#623, un trimestre range ses cartouches sous `<trim>_cartouches_<grilleId>`,
    // et le versement (`reserve.js`) copie cette clé complète ; la forme nue
    // `cartouches_<grilleId>` n'y est plus qu'un héritage d'avant S5. Ne lire que la nue
    // rendait une liste vide — ou périmée — pour toute archive récente (mesuré en WebKit,
    // `reserve-reouverture-cartouches-637.spec.js`).
    // ⚠ Pour une même grille, la forme NAMESPACÉE l'emporte en bloc : c'est elle que les
    // évaluations du trimestre ont lue (`cle('cartouches_…')`). La nue ne sert que si la
    // namespacée manque.
    var grillesDesCartouches = {};
    Object.keys(donnees).forEach(function(k) {
        var m = /^(?:[^_]+_)?cartouches_(.+)$/.exec(k);
        if (m) grillesDesCartouches[m[1]] = true;
    });

    var cartouches = [];
    Object.keys(grillesDesCartouches).forEach(function(grilleId) {
        var arr = _lireDeuxFormes(donnees, 'cartouches_' + grilleId);
        // Doublon = déjà là OÙ L'IMPORT ÉCRIRA : `importerCartouchesExternes` écrit sous
        // `cle('cartouches_<grilleId>')` (trimestre actif). Lire la clé de l'archive
        // comparait à un autre magasin que celui qui recevra la cartouche.
        var actuels = (window.db && db.getSync(cle('cartouches_' + grilleId), [])) || [];
        if (!Array.isArray(actuels)) actuels = [];
        var idsActuels = new Set(actuels.map(function(c) { return c.id; }));
        arr.forEach(function(c) {
            if (!c || !c.id) return;
            var clone = Object.assign({}, c);
            if (!clone.grilleId) clone.grilleId = grilleId;
            clone._doublon = idsActuels.has(c.id);
            cartouches.push(clone);
        });
    });

    // Pratiques : même règle (#953). La forme nue n'est plus écrite depuis la migration
    // du 24 mai 2026 (`main.js`) mais le versement la copie encore : figée, elle
    // proposait des pratiques d'avant la migration à la place de celles du trimestre.
    var pratiques = _lireDeuxFormes(donnees, 'pratiquesConfigurables')
        .filter(function(p) { return p && p.id && p.nom; })
        .map(function(p) { return Object.assign({}, p, { _doublon: idsPratiquesActives.has(p.id) }); });

    // Annotations des références croisées
    var idsGrillesDispo = new Set();
    grilles.forEach(function(g) { idsGrillesDispo.add(g.id); });
    idsGrillesActives.forEach(function(id) { idsGrillesDispo.add(id); });

    var idsEchellesDispo = new Set();
    echelles.forEach(function(e) { idsEchellesDispo.add(e.id); });
    idsEchellesActives.forEach(function(id) { idsEchellesDispo.add(id); });

    productions.forEach(function(p) {
        p._refGrille = p.grilleId || null;
        p._refEchelle = p.echelleId || null;
        p._refGrilleManquante = !!(p._refGrille && !idsGrillesDispo.has(p._refGrille));
        p._refEchelleManquante = !!(p._refEchelle && !idsEchellesDispo.has(p._refEchelle));
    });

    cartouches.forEach(function(c) {
        c._refGrille = c.grilleId || null;
        c._refGrilleManquante = !!(c._refGrille && !idsGrillesDispo.has(c._refGrille));
    });

    pratiques.forEach(function(p) {
        // #663 : la référence se lit où la pratique la range, quel que soit son âge.
        var echelleId = (p.configuration && p.configuration.echelleId)
            || (p.config && p.config.echelleId) || p.echelleId || null;
        p._refEchelle = echelleId;
        p._refEchelleManquante = !!(echelleId && !idsEchellesDispo.has(echelleId));
    });

    return {
        grilles: grilles,
        echelles: echelles,
        tampons: tampons,
        productions: productions,
        cartouches: cartouches,
        pratiques: pratiques
    };
}

/* ===============================
   EXTRACTION DU CONTENU PÉDAGOGIQUE (#257 v2.B-α)
   ===============================
   Lecture seule, en mémoire, à partir du donnees.json déjà parsé.
   N'écrit nulle part. Utilisé par le panneau « Contenu de l’archive »
   qui s'affiche au-dessus des sections de réimport.
*/

function _extraireContenuVersement(donnees, meta) {
    if (!donnees || typeof donnees !== 'object') donnees = {};
    if (!meta) meta = {};

    // Helper : matche une clé qui se termine par `suffixe` ou est égale au
    // bare. Utile car donnees.json contient les clés namespacées par
    // trimestre (h2026_groupeEtudiants, etc.) plutôt que les clés brutes.
    function _matchSuffixe(cle, suffixe) {
        return cle === suffixe || cle.endsWith('_' + suffixe);
    }

    // Helper : compte les entrées d'une valeur qui peut être array ou objet
    // { [da]: value | [...values] }
    function _compterEntreesParDa(v) {
        if (Array.isArray(v)) return v.length;
        if (v && typeof v === 'object') {
            var n = 0;
            Object.keys(v).forEach(function(k) {
                var sous = v[k];
                if (Array.isArray(sous)) n += sous.length;
                else if (sous && typeof sous === 'object') n += 1;
            });
            return n;
        }
        return 0;
    }

    // Scan unique des clés du payload
    var etudiantsRaw = [];
    var nbEvaluations = 0;
    var nbFichiersTravaux = 0;
    var nbPresencesEntrees = 0;
    var nbInterventions = 0;
    var nbSnapshots = 0;
    var titresProductions = new Set();

    Object.keys(donnees).forEach(function(k) {
        var v = donnees[k];

        if (_matchSuffixe(k, 'groupeEtudiants') && Array.isArray(v)) {
            v.forEach(function(e) { if (e && e.da) etudiantsRaw.push(e); });
        } else if (_matchSuffixe(k, 'evaluationsSauvegardees')) {
            nbEvaluations += _compterEntreesParDa(v);
        } else if (_matchSuffixe(k, 'fichiersTravaux') && Array.isArray(v)) {
            nbFichiersTravaux += v.length;
        } else if (_matchSuffixe(k, 'presences')) {
            nbPresencesEntrees += _compterEntreesParDa(v);
        } else if (_matchSuffixe(k, 'interventions')) {
            nbInterventions += _compterEntreesParDa(v);
        } else if (k === 'snapshots' || k.indexOf('snapshots_') === 0 || /_snapshots(_|$)/.test(k)) {
            if (Array.isArray(v)) nbSnapshots += v.length;
        } else if (k === 'productions' || /_productions$/.test(k)) {
            if (Array.isArray(v)) {
                v.forEach(function(p) { if (p && p.titre) titresProductions.add(p.titre); });
            }
        }
    });

    var etudiants = etudiantsRaw
        .filter(function(e) { return e.groupe !== '9999'; })
        .map(function(e, idx) {
            return {
                da: String(e.da),
                prenom: e.prenom || '',
                nom: e.nom || '',
                numeroAnonyme: idx + 1
            };
        });

    return {
        identification: {
            trimestre: meta.trimestre || '',
            cours: meta.cours || '',
            nom_cours: meta.nom_cours || '',
            groupe: meta.groupe || '',
            date_archive: meta.date_archive || '',
            appareil: meta.appareil || '',
            application_version: meta.application_version || ''
        },
        statistiques: {
            nbEtudiants: etudiants.length,
            nbEvaluations: nbEvaluations,
            nbFichiersTravaux: nbFichiersTravaux,
            nbPresencesEntrees: nbPresencesEntrees,
            nbSnapshots: nbSnapshots,
            nbInterventions: nbInterventions,
            nbProductionsDistinctes: titresProductions.size
        },
        etudiants: etudiants
    };
}

/* ===============================
   ACTIONS UTILISATEUR — modale
   =============================== */

async function actionOuvrir() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) {
        console.error('[ReserveOuvrir] Modale #modalOuvrirVersement introuvable dans le DOM');
        return;
    }

    _payloadCourant = null;
    _versementsListes = null;
    _handleReserveCourant = null;

    var etapeFichier = document.getElementById('reserve-ouvrir-etape-fichier');
    var etapeSelection = document.getElementById('reserve-ouvrir-etape-selection');
    var bouton = document.getElementById('reserve-ouvrir-bouton-reimporter');
    if (etapeFichier) etapeFichier.style.display = '';
    if (etapeSelection) etapeSelection.style.display = 'none';
    if (bouton) bouton.style.display = 'none';

    var toggle = document.getElementById('reserve-ouvrir-toggle-copie');
    if (toggle) toggle.checked = false;

    // Fermer le menu codex si ouvert
    var menu = document.getElementById('codex-menu');
    if (menu && !menu.classList.contains('u-hide') &&
        window.Codex && typeof window.Codex.toggleMenu === 'function') {
        window.Codex.toggleMenu();
    }

    modal.classList.add('actif');

    // Détection du mode et routage de l'étape 1
    var statut = (window.Reserve && typeof Reserve.statutHandle === 'function')
        ? await Reserve.statutHandle()
        : { supporte: false, persiste: false, nom: '', permission: 'inconnu' };

    if (statut.supporte && statut.persiste &&
        (statut.permission === 'granted' || statut.permission === 'prompt')) {
        await _afficherListeVersements();
    } else if (statut.supporte) {
        _afficherChoixDossier();
    } else {
        _afficherChoixFichier();
    }
}

function fermerDialogue() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (modal) modal.classList.remove('actif');
    _payloadCourant = null;
    _versementsListes = null;
    _handleReserveCourant = null;
}

function declencherInput() {
    var input = document.getElementById('reserve-ouvrir-input');
    if (input) input.click();
}

async function onFichierChoisi(el) {
    var file = el && el.files && el.files[0];
    if (!file) return;

    try {
        _payloadCourant = await chargerDepuisFichier(file);
        _afficherEtapeSelection(_payloadCourant);
    } catch (e) {
        console.error('[ReserveOuvrir] Chargement échoué', e);
        notifications.erreur('Lecture impossible', e.message || String(e));
        if (el) el.value = '';
    }
}

/* ===============================
   VUES ÉTAPE 1 — adaptées au navigateur
   =============================== */

function _afficherChoixFichier() {
    var elEtape = document.getElementById('reserve-ouvrir-etape-fichier');
    if (!elEtape) return;
    elEtape.innerHTML =
        '<input type="file" id="reserve-ouvrir-input" accept=".zip,.reserve.zip" ' +
        'style="display: none" data-on-change="ReserveOuvrir.onFichierChoisi">' +
        '<div style="text-align: center; padding: 24px 16px;">' +
        '<button data-action="ReserveOuvrir.declencherInput" class="btn btn-confirmer">' +
        '<img src="icons/icon-import.svg" alt="" class="btn-inline-icon">' +
        'Choisir un fichier .zip d\'archive&hellip;</button>' +
        '<p style="margin-top: 14px; font-size: 0.82rem; color: var(--texte-secondaire); line-height: 1.5;">' +
        'Si tu viens d’archiver depuis Safari, ton fichier ZIP est dans ton dossier ' +
        '<strong>T&eacute;l&eacute;chargements</strong> (<code>~/Downloads/</code>).' +
        '</p>' +
        '</div>';
}

function _afficherChoixDossier() {
    var elEtape = document.getElementById('reserve-ouvrir-etape-fichier');
    if (!elEtape) return;
    elEtape.innerHTML =
        '<input type="file" id="reserve-ouvrir-input" accept=".zip,.reserve.zip" ' +
        'style="display: none" data-on-change="ReserveOuvrir.onFichierChoisi">' +
        '<div style="text-align: center; padding: 24px 16px;">' +
        '<button data-action="ReserveOuvrir.actionChoisirDossier" class="btn btn-confirmer">' +
        '<img src="icons/icon-filing-cabinet.svg" alt="" class="btn-inline-icon">' +
        'Choisir le dossier de ma archives&hellip;</button>' +
        '<p style="margin-top: 12px; font-size: 0.82rem; color: var(--texte-secondaire); line-height: 1.5;">' +
        'Pas encore de dossier configur&eacute; sur ce navigateur.' +
        '</p>' +
        '<div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--bordure-douce);">' +
        '<button data-action="ReserveOuvrir.declencherInput" class="btn btn-secondaire u-texte-petit">' +
        'ou choisir un fichier ZIP&hellip;</button>' +
        '</div>' +
        '</div>';
}

async function _afficherListeVersements() {
    var elEtape = document.getElementById('reserve-ouvrir-etape-fichier');
    if (!elEtape) return;

    elEtape.innerHTML = '<div style="text-align: center; padding: 24px;"><em>Chargement de les archives&hellip;</em></div>';

    var handle = null;
    try {
        handle = await Reserve.obtenirHandle();
    } catch (e) {
        console.warn('[ReserveOuvrir] obtenirHandle échoué', e.message || e);
    }

    if (!handle) {
        // Permission refusée → fallback file picker
        _afficherChoixFichier();
        return;
    }
    _handleReserveCourant = handle;

    var versements;
    try {
        versements = await _listerVersementsDansHandle(handle);
    } catch (e) {
        console.error('[ReserveOuvrir] Listage archives échoué', e);
        versements = [];
    }
    _versementsListes = versements;

    var html = '<div style="padding: 0 0 4px;">';
    html += '<div style="font-size: 0.82rem; color: var(--texte-secondaire); margin-bottom: 8px;">' +
        'Dossier d’archives&nbsp;: <code>' + _echapper(handle.name) + '</code></div>';

    if (versements.length === 0) {
        html += '<div style="padding: 12px 14px; background: var(--surface-carte); border-radius: var(--radius-moyen); font-size: 0.85rem; color: var(--texte-secondaire);">' +
            'Aucune archive d&eacute;tect&eacute; dans ce dossier.<br>' +
            '<span style="font-size: 0.78rem;">(<code>manifeste-archives.json</code> absent ou vide)</span>' +
            '</div>';
    } else {
        html += '<ul style="list-style: none; padding: 0; margin: 0; max-height: 320px; overflow-y: auto;">';
        versements.forEach(function(v, idx) {
            var p = v.patch || {};
            html += '<li class="reserve-ouvrir-versement-item" ' +
                'data-action="ReserveOuvrir.onChoisirVersement" data-param="' + idx + '" ' +
                'style="padding: 8px 10px; border: 1px solid var(--bordure-douce); border-radius: var(--radius-moyen); margin-bottom: 6px; cursor: pointer; font-size: 0.85rem;">' +
                '<strong>' + _echapper(v.dossier) + '</strong>';
            var details = [];
            if (p.date_archive) details.push(_echapper(_formaterDate(p.date_archive)));
            // p.nombre_etudiants vient du manifeste-archives.json importe ; un
            // manifeste compromis pourrait y mettre du HTML. Echapper avant
            // concatenation dans innerHTML.
            if (p.nombre_etudiants) details.push(_echapper(p.nombre_etudiants) + ' &eacute;tudiant(s)');
            if (p.mode_archive === 'fsapi') details.push('FSAPI');
            else if (p.mode_archive === 'zip') details.push('ZIP');
            if (details.length > 0) {
                html += '<div style="margin-top: 2px; color: var(--texte-secondaire); font-size: 0.78rem;">' +
                    details.join(' &middot; ') + '</div>';
            }
            html += '</li>';
        });
        html += '</ul>';
    }

    html += '<input type="file" id="reserve-ouvrir-input" accept=".zip,.reserve.zip" ' +
        'style="display: none" data-on-change="ReserveOuvrir.onFichierChoisi">';
    html += '<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--bordure-douce); text-align: center;">' +
        '<button data-action="ReserveOuvrir.declencherInput" class="btn btn-secondaire u-texte-petit">' +
        'Choisir un fichier ZIP&hellip;</button>' +
        ' <button data-action="ReserveOuvrir.actionChoisirDossier" class="btn btn-secondaire u-texte-petit" style="margin-left: 6px;">' +
        'Changer de dossier&hellip;</button>' +
        '</div>';
    html += '</div>';

    elEtape.innerHTML = html;
}

async function _listerVersementsDansHandle(handle) {
    try {
        var fhManif = await handle.getFileHandle('manifeste-archives.json');
        var f = await fhManif.getFile();
        var manif = JSON.parse(await f.text());
        if (!manif || !manif.archives) return [];
        return Object.keys(manif.archives).map(function(d) {
            return { dossier: d, patch: manif.archives[d] };
        }).sort(function(a, b) {
            var da = (a.patch && a.patch.date_archive) || '';
            var dbDate = (b.patch && b.patch.date_archive) || '';
            return dbDate.localeCompare(da);
        });
    } catch (e) {
        if (e.name === 'NotFoundError') return [];
        console.warn('[ReserveOuvrir] Lecture manifeste-archives.json échouée', e.message || e);
        return [];
    }
}

async function _chargerVersementDirect(handleRacine, dossier) {
    var dossierTrim = await handleRacine.getDirectoryHandle('trimestres');
    var dossierVersement = await dossierTrim.getDirectoryHandle(dossier);

    var meta = null;
    try {
        var fhMeta = await dossierVersement.getFileHandle('meta.json');
        var fileMeta = await fhMeta.getFile();
        meta = JSON.parse(await fileMeta.text());
    } catch (e) {
        if (e.name !== 'NotFoundError') {
            console.warn('[ReserveOuvrir] meta.json invalide', e.message || e);
        }
    }

    var fhDonnees = await dossierVersement.getFileHandle('donnees.json');
    var fileDonnees = await fhDonnees.getFile();
    var donnees = JSON.parse(await fileDonnees.text());

    return {
        dossier: dossier,
        meta: meta,
        donnees: donnees,
        ressources: _extraireRessources(donnees)
    };
}

async function actionChoisirDossier() {
    if (!window.Reserve || typeof Reserve.obtenirHandle !== 'function') return;
    try {
        var handle = await Reserve.obtenirHandle({ forcer: true });
        if (handle) {
            await _afficherListeVersements();
        }
    } catch (e) {
        console.warn('[ReserveOuvrir] Choix dossier échoué', e.message || e);
    }
}

async function onChoisirVersement(idx) {
    var i = parseInt(idx, 10);
    if (isNaN(i) || !_versementsListes || !_versementsListes[i]) return;

    var versement = _versementsListes[i];
    if (!_handleReserveCourant) {
        notifications.erreur('Erreur', 'Dossier d’archives non disponible.');
        return;
    }

    try {
        var payload = await _chargerVersementDirect(_handleReserveCourant, versement.dossier);
        _payloadCourant = payload;
        _afficherEtapeSelection(payload);
    } catch (e) {
        console.error('[ReserveOuvrir] Chargement de l’archive échoué', e);
        notifications.erreur('Lecture impossible', e.message || String(e));
    }
}

/* ===============================
   RENDU UI
   =============================== */

function _afficherEtapeSelection(payload) {
    var etapeFichier = document.getElementById('reserve-ouvrir-etape-fichier');
    var etapeSelection = document.getElementById('reserve-ouvrir-etape-selection');
    var bouton = document.getElementById('reserve-ouvrir-bouton-reimporter');
    if (etapeFichier) etapeFichier.style.display = 'none';
    if (etapeSelection) etapeSelection.style.display = '';
    if (bouton) bouton.style.display = '';

    var elMeta = document.getElementById('reserve-ouvrir-meta');
    if (elMeta) {
        var m = payload.meta || {};
        var htmlMeta = '<strong>Archive</strong> : <code>' + _echapper(payload.dossier) + '</code>';
        if (m.uuid) htmlMeta += '<br><strong>UUID</strong> : <code style="font-size: 0.78rem;">' + _echapper(m.uuid) + '</code>';
        if (m.date_archive) htmlMeta += '<br><strong>Date</strong> : ' + _echapper(_formaterDate(m.date_archive));
        if (m.appareil) htmlMeta += ' &middot; <strong>Appareil</strong> : ' + _echapper(m.appareil);
        if (m.application_version) htmlMeta += ' &middot; Beta ' + _echapper(m.application_version);
        elMeta.innerHTML = htmlMeta;
    }

    // Panneau « Contenu de l’archive » (#257 v2.B-α)
    var elContenu = document.getElementById('reserve-ouvrir-contenu');
    if (elContenu) {
        var contenu = _extraireContenuVersement(payload.donnees, payload.meta);
        // Cache le contenu sur le payload pour le toggle d'anonymisation
        payload._contenuVersement = contenu;
        payload._etudiantsAnonymises = false;
        elContenu.innerHTML = _construirePanneauContenu(contenu, false);
    }

    var elSections = document.getElementById('reserve-ouvrir-sections');
    if (elSections) {
        var htmlSec = '';
        htmlSec += _construireSection('grilles', 'Grilles d\'évaluation', payload.ressources.grilles);
        htmlSec += _construireSection('echelles', 'Échelles de performance', payload.ressources.echelles);
        htmlSec += _construireSection('productions', 'Productions', payload.ressources.productions);
        htmlSec += _construireSection('cartouches', 'Cartouches de rétroaction', payload.ressources.cartouches);
        htmlSec += _construireSection('pratiques', 'Pratiques de notation', payload.ressources.pratiques);
        htmlSec += _construireSection('tampons', 'Tampons personnalisés', payload.ressources.tampons);
        elSections.innerHTML = htmlSec;
    }

    _majCompteur();
}

/**
 * Construit le panneau « Contenu de l’archive » (#257 v2.B-α).
 * Carte pliable affichant les statistiques et la liste anonymisable des
 * étudiant·es. Lecture seule, en mémoire.
 */
function _construirePanneauContenu(contenu, anonymiser) {
    if (!contenu) return '';
    var stats = contenu.statistiques || {};

    var lignesStats = [
        { libelle: 'Étudiant·es', valeur: stats.nbEtudiants },
        { libelle: 'Productions distinctes', valeur: stats.nbProductionsDistinctes },
        { libelle: 'Évaluations', valeur: stats.nbEvaluations },
        { libelle: 'Fichiers travaux', valeur: stats.nbFichiersTravaux },
        { libelle: 'Présences', valeur: stats.nbPresencesEntrees },
        { libelle: 'Snapshots', valeur: stats.nbSnapshots },
        { libelle: 'Interventions', valeur: stats.nbInterventions }
    ].filter(function(s) { return s.valeur > 0; });

    var htmlStats = lignesStats.map(function(s) {
        return '<div style="display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--bordure-douce);">' +
                    '<span>' + _echapper(s.libelle) + '</span>' +
                    '<strong>' + s.valeur + '</strong>' +
                '</div>';
    }).join('');

    var htmlListeEtudiants = '';
    var nbEtud = (contenu.etudiants || []).length;
    if (nbEtud > 0) {
        var lignes = contenu.etudiants.map(function(e) {
            var libelle = anonymiser
                ? 'Élève ' + e.numeroAnonyme
                : (e.prenom + ' ' + e.nom).trim() || ('DA ' + e.da);
            return '<li style="padding: 2px 0;">' + _echapper(libelle) + '</li>';
        }).join('');
        htmlListeEtudiants =
            '<details style="margin-top: 10px;">' +
                '<summary style="cursor: pointer; font-size: 0.85rem; user-select: none;">' +
                    'Voir la liste des ' + nbEtud + ' étudiant·es' +
                '</summary>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 8px;">' +
                    '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.82rem;">' +
                        '<input type="checkbox" ' + (anonymiser ? 'checked ' : '') +
                              'data-on-change="ReserveOuvrir.onChangerAnonymisationContenu">' +
                        'Anonymiser les noms' +
                    '</label>' +
                '</div>' +
                '<ul style="margin: 8px 0 0 0; padding-left: 18px; max-height: 180px; overflow-y: auto; font-size: 0.85rem; line-height: 1.5;">' +
                    lignes +
                '</ul>' +
            '</details>';
    }

    return '' +
        '<div style="border: 1px solid var(--bordure-douce); border-radius: var(--radius-moyen); padding: 10px 12px; background: var(--bleu-tres-pale);">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">' +
                '<strong style="font-size: 0.9rem;">Contenu de l’archive</strong>' +
                '<button class="btn-aide-contextuelle" data-aide="reserve-contenu-versement" data-stop aria-label="Aide : contenu de l’archive"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button>' +
            '</div>' +
            '<div style="font-size: 0.85rem;">' + htmlStats + '</div>' +
            htmlListeEtudiants +
        '</div>';
}

/**
 * Toggle anonymisation des étudiants dans le panneau de contenu.
 * Re-rend le panneau à partir du payload courant.
 */
function onChangerAnonymisationContenu(el) {
    if (!_payloadCourant || !_payloadCourant._contenuVersement) return;
    var anonymiser = el ? !!el.checked : !_payloadCourant._etudiantsAnonymises;
    _payloadCourant._etudiantsAnonymises = anonymiser;
    var elContenu = document.getElementById('reserve-ouvrir-contenu');
    if (elContenu) {
        elContenu.innerHTML = _construirePanneauContenu(_payloadCourant._contenuVersement, anonymiser);
    }
}

function _construireSection(typeRessource, libelle, items) {
    if (!Array.isArray(items) || items.length === 0) {
        return '<div class="u-mb-10" style="padding: 8px 10px; background: var(--surface-carte); border-radius: var(--radius-moyen); font-size: 0.82rem; color: var(--texte-secondaire);"><strong>' + _echapper(libelle) + '</strong> &mdash; <em>aucun</em></div>';
    }

    var nbDoublons = items.filter(function(it) { return it._doublon; }).length;
    var nbRefManquantes = items.filter(function(it) {
        return it._refGrilleManquante || it._refEchelleManquante;
    }).length;

    var html = '<div class="u-mb-10" style="border: 1px solid var(--bordure-douce); border-radius: var(--radius-moyen); overflow: hidden;">';
    html += '<div style="background: var(--surface-carte); padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.85rem;">';
    html += '<strong>' + _echapper(libelle) + '</strong>';
    html += '<span style="color: var(--texte-secondaire); font-size: 0.78rem;">' + items.length + ' &eacute;l&eacute;ment(s)';
    if (nbDoublons > 0) html += ' &middot; ' + nbDoublons + ' d&eacute;j&agrave; pr&eacute;sent(s)';
    if (nbRefManquantes > 0) html += ' &middot; <span style="color: var(--alerte-texte-attention);">' + nbRefManquantes + ' r&eacute;f. manquante(s)</span>';
    html += '</span>';
    html += '<span class="u-flex-gap-4">';
    html += '<button class="btn btn-secondaire u-texte-petit" data-action="ReserveOuvrir.onCheckTout" data-param="' + typeRessource + ':1" style="padding: 2px 6px;">Tout</button>';
    html += '<button class="btn btn-secondaire u-texte-petit" data-action="ReserveOuvrir.onCheckTout" data-param="' + typeRessource + ':0" style="padding: 2px 6px;">Aucun</button>';
    html += '</span>';
    html += '</div>';

    html += '<ul style="margin: 0; padding: 6px 10px; list-style: none;">';
    items.forEach(function(item, idx) {
        var doublon = !!item._doublon;
        var refManquante = !!(item._refGrilleManquante || item._refEchelleManquante);
        var libelleItem = item.nom || item.titre || item.id;

        // Construire les data-attributes pour les références (utilisés en Phase D auto-cochage)
        var attrsRef = '';
        if (item._refGrille) attrsRef += ' data-ref-grille="' + _echapper(item._refGrille) + '"';
        if (item._refEchelle) attrsRef += ' data-ref-echelle="' + _echapper(item._refEchelle) + '"';

        html += '<li style="padding: 3px 0; font-size: 0.85rem; ' + (doublon ? 'opacity: 0.55;' : '') + '">';
        html += '<label class="reserve-ouvrir-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;" ' +
                'data-type="' + typeRessource + '" data-idx="' + idx + '" ' +
                'data-doublon="' + (doublon ? '1' : '0') + '"' + attrsRef + '>';
        html += '<input type="checkbox" class="reserve-ouvrir-checkbox" data-on-change="ReserveOuvrir.onChangerSelection"' + (doublon ? ' disabled' : '') + '>';
        html += '<span>' + _echapper(libelleItem) + '</span>';

        var infos = [];
        if (doublon) {
            infos.push('<span style="color: var(--texte-secondaire);">d&eacute;j&agrave; pr&eacute;sent</span>');
        }
        if (refManquante) {
            var refs = [];
            if (item._refGrilleManquante) refs.push('grille manquante');
            if (item._refEchelleManquante) refs.push('&eacute;chelle manquante');
            infos.push('<span style="color: var(--alerte-texte-attention);">' + refs.join(', ') + '</span>');
        }
        if (infos.length > 0) {
            html += '<span style="font-size: 0.72rem; margin-left: auto;">' + infos.join(' &middot; ') + '</span>';
        }
        html += '</label>';
        html += '</li>';
    });
    html += '</ul>';
    html += '</div>';
    return html;
}

function _majCompteur() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    var n = modal.querySelectorAll('.reserve-ouvrir-checkbox:checked').length;
    var span = document.getElementById('reserve-ouvrir-compteur');
    if (span) span.textContent = String(n);
    var bouton = document.getElementById('reserve-ouvrir-bouton-reimporter');
    if (bouton) bouton.disabled = (n === 0);
}

function onChangerSelection(el) {
    if (el && el.checked) {
        _autoCocherReferences(el);
    }
    _majCompteur();
}

/**
 * Quand l'utilisateur coche un item avec des références croisées
 * (production→grille+échelle, cartouche→grille, pratique→échelle), auto-coche
 * les références dans le payload (si présentes). N'auto-décoche jamais.
 */
function _autoCocherReferences(input) {
    var label = input.closest && input.closest('label.reserve-ouvrir-item');
    if (!label) return;

    var refGrille = label.getAttribute('data-ref-grille');
    var refEchelle = label.getAttribute('data-ref-echelle');

    if (refGrille) _cocherSiPresent('grilles', refGrille);
    if (refEchelle) _cocherSiPresent('echelles', refEchelle);
}

function _cocherSiPresent(typeRessource, idCible) {
    if (!_payloadCourant || !_payloadCourant.ressources || !_payloadCourant.ressources[typeRessource]) return;
    var idx = _payloadCourant.ressources[typeRessource].findIndex(function(it) { return it.id === idCible; });
    if (idx < 0) return;

    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    var label = modal.querySelector('label.reserve-ouvrir-item[data-type="' + typeRessource + '"][data-idx="' + idx + '"]');
    if (!label) return;
    var inp = label.querySelector('input.reserve-ouvrir-checkbox');
    if (!inp || inp.disabled || inp.checked) return;
    inp.checked = true;
}

function onCheckTout(param) {
    var parts = String(param || '').split(':');
    if (parts.length !== 2) return;
    var type = parts[0];
    var etat = parts[1] === '1';
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    modal.querySelectorAll('label.reserve-ouvrir-item[data-type="' + type + '"]').forEach(function(label) {
        var input = label.querySelector('input.reserve-ouvrir-checkbox');
        if (input && !input.disabled) input.checked = etat;
    });
    _majCompteur();
}

function onChangerToggleCopie(el) {
    var copieEnDouble = !!(el && el.checked);
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    modal.querySelectorAll('label.reserve-ouvrir-item[data-doublon="1"]').forEach(function(label) {
        var input = label.querySelector('input.reserve-ouvrir-checkbox');
        if (!input) return;
        input.disabled = !copieEnDouble;
        if (!copieEnDouble) input.checked = false;
        label.style.opacity = copieEnDouble ? '1' : '0.55';
    });
    _majCompteur();
}

/* ===============================
   APPLICATION DU RÉIMPORT
   =============================== */

function _nettoyerMarqueurs(item) {
    var clone = JSON.parse(JSON.stringify(item));
    // Marqueurs internes au flux d'import qui ne doivent JAMAIS persister
    // dans les bibliotheques actives apres reimport. _doublon est pose par
    // la detection des collisions ; _refGrille / _refEchelle / _refXxxManquante
    // sont poses par l'auto-cochage des references croisees (#257 v1) pour
    // signaler des dependances manquantes a l'utilisateur. (M1)
    delete clone._doublon;
    delete clone._refGrille;
    delete clone._refEchelle;
    delete clone._refGrilleManquante;
    delete clone._refEchelleManquante;
    return clone;
}

// #627 — délégué à import-export.js (lu à l'appel ; ce fichier est chargé avant lui) : une
// seule règle de rebranchement pour les quatre chemins d'import.
function _rebrancherReferences(item, type, tables) {
    return (typeof window.rebrancherReferences === 'function')
        ? window.rebrancherReferences(item, type, tables) : 0;
}

function _faireCopie(item, prefixId) {
    var copie = _nettoyerMarqueurs(item);
    if (typeof window.genererIdUnique === 'function') {
        copie.id = window.genererIdUnique(prefixId);
    } else {
        copie.id = prefixId + '_' + Date.now() + '_' + Math.floor(Math.random() * 1e6).toString(16);
    }
    if (copie.nom) copie.nom = copie.nom + ' — copie';
    var maintenant = new Date().toISOString();
    copie.dateCreation = maintenant;
    copie.dateModification = maintenant;
    return copie;
}

function _collecterSelection() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal || !_payloadCourant) return null;

    var sel = {
        grilles: [], echelles: [], tampons: [],
        productions: [], cartouches: [], pratiques: []
    };
    var ressources = _payloadCourant.ressources;

    modal.querySelectorAll('label.reserve-ouvrir-item').forEach(function(label) {
        var input = label.querySelector('input.reserve-ouvrir-checkbox');
        if (!input || !input.checked) return;
        var type = label.getAttribute('data-type');
        var idx = parseInt(label.getAttribute('data-idx'), 10);
        var item = (ressources[type] || [])[idx];
        if (item && sel[type]) sel[type].push(item);
    });

    return sel;
}

async function appliquerReimport() {
    var selection = _collecterSelection();
    if (!selection) {
        notifications.erreur('Erreur', 'Aucune sélection trouvée.');
        return;
    }

    var total = selection.grilles.length + selection.echelles.length + selection.tampons.length +
                selection.productions.length + selection.cartouches.length + selection.pratiques.length;
    if (total === 0) return;

    var toggleCopie = document.getElementById('reserve-ouvrir-toggle-copie');
    var copieEnDouble = !!(toggleCopie && toggleCopie.checked);

    var rapport = {
        grilles: 0, echelles: 0, tampons: 0,
        productions: 0, cartouches: 0, pratiques: 0,
        copies: 0, refsRemappees: 0
    };

    // Tables de remapping (ancienId -> nouveauId) pour les ressources référencées
    // par d'autres : grilles, échelles et cartouches ont des références entrantes
    // (productions.grilleId/echelleId/cartoucheId, cartouches.grilleId/echelleId,
    // pratiques.configuration/config.echelleId — #663).
    // Peuplées uniquement quand l'item est copié en double ; sinon l'ID reste stable.
    var remapGrilles = {};
    var remapEchelles = {};
    var remapCartouches = {};   // #654 (26 sept. 2026)

    function _preparerEtCollecter(items, prefix, table) {
        return items.map(function(item) {
            if (copieEnDouble && item._doublon) {
                rapport.copies++;
                var copie = _faireCopie(item, prefix);
                if (table && item.id) table[item.id] = copie.id;
                return copie;
            }
            return _nettoyerMarqueurs(item);
        });
    }

    // #627 : la règle commune (`rebrancherReferences`, import-export.js) — productions
    // (grille, échelle, cartouche), cartouches (grille, échelle), pratiques (les trois
    // formes de #663).
    var tables = { grilles: remapGrilles, echelles: remapEchelles, cartouches: remapCartouches };
    function _patcherReferences(item, type) {
        rapport.refsRemappees += _rebrancherReferences(item, type, tables);
        return item;
    }

    function _preparerEtPatcher(items, prefix, type, table) {
        return items.map(function(item) {
            var prepared;
            if (copieEnDouble && item._doublon) {
                rapport.copies++;
                prepared = _faireCopie(item, prefix);
                if (table && item.id) table[item.id] = prepared.id;
            } else {
                prepared = _nettoyerMarqueurs(item);
            }
            return _patcherReferences(prepared, type);
        });
    }

    // Préparation préalable, dans l'ordre des dépendances : grilles et échelles
    // (sources des remaps), puis cartouches (qui en dépendent ET en sont une source
    // pour les productions — #654 : préparées après, les productions gardaient
    // l'id d'une cartouche copiée), puis productions et pratiques.
    // L'ordre d'ÉCRITURE, plus bas, ne change pas.
    var grillesPretes = _preparerEtCollecter(selection.grilles, 'GRILLE', remapGrilles);
    var echellesPretes = _preparerEtCollecter(selection.echelles, 'ECH', remapEchelles);
    var cartouchesPretes = _preparerEtPatcher(selection.cartouches, 'CART', 'cartouche', remapCartouches);
    var productionsPretes = _preparerEtPatcher(selection.productions, 'PROD', 'production');
    var pratiquesPretes = _preparerEtPatcher(selection.pratiques, 'PRAT', 'pratique');

    try {
        // Grilles
        if (grillesPretes.length > 0 && typeof window.importerGrillesExternes === 'function') {
            rapport.grilles = window.importerGrillesExternes(grillesPretes, { remplacer: false }) || 0;
        }

        // Échelles
        if (echellesPretes.length > 0 && typeof window.importerEchellesExternes === 'function') {
            rapport.echelles = window.importerEchellesExternes(echellesPretes, { remplacer: false }) || 0;
        }

        // Productions
        if (productionsPretes.length > 0 && typeof window.importerProductionsExternes === 'function') {
            rapport.productions = window.importerProductionsExternes(productionsPretes, { remplacer: false }) || 0;
        }

        // Cartouches
        if (cartouchesPretes.length > 0 && typeof window.importerCartouchesExternes === 'function') {
            rapport.cartouches = window.importerCartouchesExternes(cartouchesPretes, { remplacer: false }) || 0;
        }

        // Pratiques
        if (pratiquesPretes.length > 0 && typeof window.importerPratiquesExternes === 'function') {
            rapport.pratiques = window.importerPratiquesExternes(pratiquesPretes, { remplacer: false }) || 0;
        }

        // Tampons : fusion manuelle (pas d'API publique dédiée)
        // #522 lot 5 : dans la file de la clé (db.modifier) — lue par getSync puis écrite par
        // `await db.set`, la liste perdait un tampon enregistré pendant l'aller-retour. Les
        // compteurs du rapport se font dans le mutateur, sur la liste qu'il écrit.
        if (selection.tampons.length > 0 && window.db) {
            var copiesTampons = 0, tamponsAjoutes = 0;
            await db.modifier('tamponsPersonnalises', function(lus) {
                var actuels = Array.isArray(lus) ? lus : [];
                var idsActuels = new Set(actuels.map(function(t) { return t.id; }));
                copiesTampons = 0; tamponsAjoutes = 0;
                for (var i = 0; i < selection.tampons.length; i++) {
                    var src = selection.tampons[i];
                    var item;
                    if (copieEnDouble && src._doublon) {
                        item = _faireCopie(src, 'TAMPON');
                        copiesTampons++;
                    } else {
                        item = _nettoyerMarqueurs(src);
                        if (idsActuels.has(item.id)) continue;
                    }
                    actuels.push(item);
                    idsActuels.add(item.id);
                    tamponsAjoutes++;
                }
                return actuels;
            }, []);
            rapport.copies += copiesTampons;
            rapport.tampons += tamponsAjoutes;
        }

        var totalAjoutes = rapport.grilles + rapport.echelles + rapport.tampons +
                           rapport.productions + rapport.cartouches + rapport.pratiques;
        var details = [];
        if (rapport.grilles > 0) details.push(rapport.grilles + ' grille(s)');
        if (rapport.echelles > 0) details.push(rapport.echelles + ' échelle(s)');
        if (rapport.productions > 0) details.push(rapport.productions + ' production(s)');
        if (rapport.cartouches > 0) details.push(rapport.cartouches + ' cartouche(s)');
        if (rapport.pratiques > 0) details.push(rapport.pratiques + ' pratique(s)');
        if (rapport.tampons > 0) details.push(rapport.tampons + ' tampon(s)');
        var detailStr = details.join(', ') || 'rien à importer (tout existait déjà)';
        if (rapport.copies > 0) detailStr += ' · ' + rapport.copies + ' copie(s) en double';
        if (rapport.refsRemappees > 0) detailStr += ' · ' + rapport.refsRemappees + ' référence(s) rebranchée(s) sur les copies';

        notifications.succes(
            totalAjoutes > 0 ? 'Réimport terminé' : 'Aucun réimport',
            detailStr
        );

        fermerDialogue();
    } catch (e) {
        console.error('[ReserveOuvrir] Réimport échoué', e);
        notifications.erreur('Erreur de réimport', e.message || String(e));
    }
}

/* ===============================
   EXPORTS
   =============================== */

window.ReserveOuvrir = {
    chargerDepuisFichier: chargerDepuisFichier,
    actionOuvrir: actionOuvrir,
    fermerDialogue: fermerDialogue,
    declencherInput: declencherInput,
    onFichierChoisi: onFichierChoisi,
    onChangerSelection: onChangerSelection,
    onCheckTout: onCheckTout,
    onChangerToggleCopie: onChangerToggleCopie,
    appliquerReimport: appliquerReimport,
    actionChoisirDossier: actionChoisirDossier,
    onChoisirVersement: onChoisirVersement,
    onChangerAnonymisationContenu: onChangerAnonymisationContenu
};

})();
