/**
 * demo-activation.js
 * Phases 5.B, 5.C et 5.D du chantier Autonomisation
 * (PLAN-AUTONOMISATION-UTILISATEUR.md).
 *
 * Seule source de vérité pour l'activation et la désactivation du mode démo
 * depuis le retrait de js/donnees-demo.js en Phase 5.D (Beta 99.24).
 *
 * Exports :
 *   - activerModeDemo() : appelé par toggleDemoHandler au cochage
 *   - desactiverModeDemo() : appelé par toggleDemoHandler au décochage
 *     et par le bouton « Quitter la démo » du bandeau vert
 *   - afficherBandeauDemo(show) : UI du bandeau vert
 *   - initialiserBandeauDemoSiActif() : appelée au boot pour restaurer
 *     l'affichage du bandeau si demo-actif='true' (pas de nettoyage)
 *
 * Étapes d'activation (depuis Audit 1 Table 2, docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md) :
 *   1. Snapshot état utilisateur (restauré au toggle OFF)
 *   2. Flag demo-actif='true'
 *   3. Upsert trimestre 'demo' actif dans la liste globale trimestres
 *   4. Fusion des données démo vers les 6 clés globales polluées (P2 accepté)
 *   5. Pointeurs infoCours, groupeCoursActif
 *   6. Pré-sélections sidebar
 *   7. Mode normal forcé
 *   8. Calcul des 3 dérivées : calendrier, snapshots, indices
 *   9. Bandeau + navigation + rerender
 */
(function() {
'use strict';

// ============================================
// UI — Bandeau démo
// ============================================

/**
 * Affiche ou masque le bandeau vert « Mode démonstration » en bas d'écran.
 * Ajoute/retire la classe .mode-demo sur <body> pour le padding global.
 */
function afficherBandeauDemo(show) {
    var bandeau = document.getElementById('bandeau-demo');
    if (bandeau) {
        if (typeof toggleDisplay === 'function') {
            toggleDisplay(bandeau, show);
        } else {
            bandeau.style.display = show ? '' : 'none';
        }
    }
    if (show) {
        document.body.classList.add('mode-demo');
    } else {
        document.body.classList.remove('mode-demo');
    }
}

/**
 * Appelée au boot. Si demo-actif='true' (rechargement pendant la démo),
 * ré-affiche le bandeau pour que l'utilisateur voie qu'il reste en démo.
 * Ne fait PAS de nettoyage : la démo reste active, les demo_* intactes.
 *
 * Remplace le legacy nettoyerResiduDemo + initialiserModuleDonneesDemo
 * depuis Phase 5.D. Le nettoyage automatique du legacy était la cause du
 * bug question 3 (suppression des clés Phase 1 permanentes).
 */
function initialiserBandeauDemoSiActif() {
    if (db.getSync('demo-actif', null) === 'true') {
        afficherBandeauDemo(true);
    }
}

/**
 * Migration silencieuse Phase 5.E — nettoyage one-shot des résidus legacy
 * au boot. Idempotente via flag 'migration-phase5-done'.
 *
 * Les cycles legacy entrerEnDemo/quitterDemo pouvaient laisser, en cas de
 * crash ou de chemin dégradé :
 *   - Items isDemo dans listeCours, cours, enseignants
 *   - Items estDemo dans grillesTemplates, echellesTemplates, cartouches_*
 *   - Trimestre 'demo' orphelin (actif=false) dans la liste globale trimestres
 *   - Flag demo-etat-precedent orphelin (sans demo-actif correspondant)
 *
 * Skippée si demo-actif='true' (mode démo actif : les items démo sont
 * légitimement présents dans les globaux, ne pas les retirer). La migration
 * s'exécutera au prochain boot hors démo.
 */
function migrerResidusPhase5() {
    if (db.getSync('migration-phase5-done', null)) return;

    // Skip si on est en plein mode démo : les items sont légitimes
    if (db.getSync('demo-actif', null) === 'true') return;

    var nbNettoyages = 0;

    // Helper : compte les items portant le flag isDemo/estDemo dans les 5 globaux
    function compterResidusFlag() {
        // #358 (G3) : grilles/échelles exclues du compte — la démo ne fusionne plus
        // de modèles vers le global, donc aucun résidu estDemo n'y subsiste.
        return (db.getSync('listeCours', []) || []).filter(function(c) { return c.isDemo; }).length
            + (db.getSync('cours', []) || []).filter(function(c) { return c.isDemo; }).length
            + (db.getSync('enseignants', []) || []).filter(function(e) { return e.isDemo; }).length;
    }

    // 1. Résidus isDemo/estDemo dans les 6 globaux + cartouches_*
    var countBefore = compterResidusFlag();

    if (countBefore > 0) {
        retirerItemsDemoDesGlobaux();
        // Recompte apres nettoyage : retirerItemsDemoDesGlobaux filtre par
        // ID-dans-pack ET flag, donc les residus legacy avec un ID non-prefixe
        // (anterieur au commit 40393ad) NE SONT PAS retires meme s'ils portent
        // le flag. Le delta reel = countBefore - countAfter.
        var countAfter = compterResidusFlag();
        nbNettoyages += (countBefore - countAfter);
    }

    // 2. Trimestre démo orphelin
    var trimestres = db.getSync('trimestres', []) || [];
    if (trimestres.some(function(t) { return t.id === 'demo'; })) {
        db.setSync('trimestres', trimestres.filter(function(t) { return t.id !== 'demo'; }));
        nbNettoyages++;
    }

    // 3. Snapshot orphelin (demo-etat-precedent sans demo-actif correspondant)
    if (db.getSync('demo-etat-precedent', null)) {
        db.removeSync('demo-etat-precedent');
        nbNettoyages++;
    }

    // Ne poser le flag QUE si vraiment rien ne reste a nettoyer. Si countAfter
    // > 0, il reste des residus legacy non couverts par retirerItemsDemoDesGlobaux
    // (ID non-prefixe). Laisser la migration retenter au prochain boot, dans
    // l'espoir qu'une future version sache les nettoyer.
    var residusRestants = compterResidusFlag();
    if (residusRestants === 0) {
        db.setSync('migration-phase5-done', '1');
    } else {
        console.warn('[Migration 5.E] ' + residusRestants + ' residus legacy NON nettoyes (ID non-prefixe). Migration NON marquee done, retry au prochain boot.');
    }

    if (nbNettoyages > 0) {
        console.warn('[Migration 5.E] ' + nbNettoyages + ' résidus legacy nettoyés');
    }
}

/**
 * Fusionne les données démo (lues depuis demo_* peuplées par Phase 1,
 * plus PACK_DEMARRAGE pour les cartouches qui ne sont pas dans demo_*)
 * vers les 6 clés globales qui servent l'UI (dropdowns Contexte, bibliothèques).
 *
 * Ces clés étaient polluées par fusionnerDonneesDemo legacy. Pré-requis P2
 * accepté : on préserve cette pollution en 5.B puisque Phase 4.B filtre déjà
 * l'affichage. Le nettoyage au toggle OFF (5.C) retire les items isDemo/estDemo.
 */
function fusionnerDemoVersGlobaux() {
    // 1. listeCours : push sans remplacer
    var listeCoursDemo = db.getSync('demo_listeCours', []) || [];
    var listeCours = db.getSync('listeCours', []) || [];
    for (var i = 0; i < listeCoursDemo.length; i++) {
        var cDemo = listeCoursDemo[i];
        var existe = listeCours.some(function(c) { return c.id === cDemo.id; });
        if (!existe) {
            var copie = Object.assign({}, cDemo, { isDemo: true });
            listeCours.push(copie);
        }
    }
    db.setSync('listeCours', listeCours);

    // 2. cours (clé canonique) : push sans remplacer (préserve les cours utilisateur
    // qui auraient le même ID qu'un cours démo)
    var coursCanoniques = db.getSync('cours', []) || [];
    for (var j = 0; j < listeCoursDemo.length; j++) {
        var cDemoCanon = listeCoursDemo[j];
        var existeCanon = coursCanoniques.some(function(c) { return c.id === cDemoCanon.id; });
        if (!existeCanon) {
            coursCanoniques.push(Object.assign({}, cDemoCanon, { isDemo: true }));
        }
    }
    db.setSync('cours', coursCanoniques);

    // 3. enseignants
    var ensDemo = db.getSync('demo_enseignants', []) || [];
    var enseignants = db.getSync('enseignants', []) || [];
    for (var k = 0; k < ensDemo.length; k++) {
        var eDemo = ensDemo[k];
        var existeEns = enseignants.some(function(e) { return e.id === eDemo.id; });
        if (!existeEns) {
            enseignants.push(Object.assign({}, eDemo, { isDemo: true }));
        }
    }
    db.setSync('enseignants', enseignants);

    // 4-5. #358 (G3) : grilles/échelles NON fusionnées vers le global.
    // Sous le namespacing, trimestreActif='demo' route cle('grillesTemplates')
    // vers demo_grillesTemplates (peuplé par peuplerNamespace en Phase 1) ; les
    // dropdowns Contexte et bibliothèques lisent via cle() / le pool de travail,
    // donc voient déjà les modèles démo SANS fusion vers la clé globale héritée.
    // (Fusionner ici réintroduirait la pollution du global que #358 supprime.)

    // 6. modalitesEvaluation : écrasement (mêmes contraintes que legacy),
    // via le module propriétaire (SSOT #328 Lot 1)
    var modDemo = db.getSync('demo_modalitesEvaluation', null);
    if (modDemo) {
        window.modalitesEvaluation.remplacer(modDemo, { discret: true });   // mode démo (lot F)
    }

    // 7. cartouches_* : lire depuis PACK_DEMARRAGE (Phase 1 ne les peuple pas
    // dans demo_*, gap Table 6). Sans ça, les niveaux de performance des
    // grilles démo seraient manquants.
    var pack = (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) ? PACK_DEMARRAGE : null;
    if (pack) {
        var clesPack = Object.keys(pack);
        for (var p = 0; p < clesPack.length; p++) {
            var nom = clesPack[p];
            if (nom.indexOf('cartouches_') !== 0) continue;
            var cartouchesPack = pack[nom] || [];
            // namespacé : sans `cle()`, le matériel démo serait POSÉ sous la clé nue
            // et LU sous la clé namespacée — donc invisible. Prédit au §2.3 de Z1.
            // S5/#623 : `nom` est la clé du PACK, toujours nue. Le magasin, lui, est
            var cartouches = db.getSync(cle(nom), []) || [];
            for (var c = 0; c < cartouchesPack.length; c++) {
                var cartouche = cartouchesPack[c];
                var existeCart = cartouches.some(function(x) { return x.id === cartouche.id; });
                if (!existeCart) {
                    cartouches.push(Object.assign({}, cartouche, { estDemo: true }));
                }
            }
            db.setSync(cle(nom), cartouches);
        }
    }
}

/**
 * Active le mode démo. Appelée par toggleDemoHandler quand la case est cochée.
 */
async function activerModeDemo() {
    try {
        // Guard résidu : si flag actif mais pas de bandeau, c'est un résidu
        if (db.getSync('demo-actif', null) === 'true') {
            var bandeau = document.getElementById('bandeau-demo');
            if (bandeau && bandeau.style.display !== 'none') {
                return;
            }
            db.setSync('demo-actif', null);
        }

        // 1. Snapshot état utilisateur (restauré au toggle OFF)
        var trimestresAvant = db.getSync('trimestres', []) || [];
        var trimActifAvant = trimestresAvant.find(function(t) { return t.actif === true; });
        db.setSync('demo-etat-precedent', {
            trimestreActifId: trimActifAvant ? trimActifAvant.id : null,
            infoCours: db.getSync('infoCours', null),
            groupeCoursActif: db.getSync('groupeCoursActif', null),
            modeApplication: db.getSync('modeApplication', 'normal'),
            modalitesEvaluation: db.getSync(cle('modalitesEvaluation'), null),
            trimestres: trimestresAvant,
            listeCours: db.getSync('listeCours', []),
            cours: db.getSync('cours', []),
            enseignants: db.getSync('enseignants', [])
            // #358 (G3) : grilles/échelles NON capturées — sous le namespacing,
            // les modèles démo vivent dans demo_grillesTemplates/demo_echellesTemplates
            // (permanents, jamais touchés par l'activation/désactivation). Le global
            // hérité n'est plus pollué par la démo, donc rien à sauvegarder/restaurer.
        });

        // 2. Flag
        db.setSync('demo-actif', 'true');

        // 3. Upsert trimestre 'demo' actif dans la liste globale trimestres
        var trimestres = (db.getSync('trimestres', []) || []).map(function(t) {
            return Object.assign({}, t, { actif: false });
        });
        var idxDemo = trimestres.findIndex(function(t) { return t.id === 'demo'; });
        var trimestreDemo = {
            id: 'demo',
            nom: 'Démonstration',
            session: 'D',
            annee: '2025',
            actif: true,
            isDemo: true
        };
        if (idxDemo >= 0) trimestres[idxDemo] = trimestreDemo;
        else trimestres.push(trimestreDemo);
        db.setSync('trimestres', trimestres);
        db.setSync('trimestreActif', 'demo');
        window.trimestreActif = 'demo';

        // 4. Fusion des données démo vers les globaux (polluables mais nécessaire
        //    pour que les dropdowns Contexte et les bibliothèques voient les items
        //    démo). P2 accepté.
        fusionnerDemoVersGlobaux();

        // 5. Pointeur infoCours = premier cours démo (depuis demo_listeCours)
        var listeCoursDemoPour5 = db.getSync('demo_listeCours', []) || [];
        var coursDemo = listeCoursDemoPour5[0] || null;
        if (coursDemo) {
            db.setSync('infoCours', coursDemo);
        }

        // 6. Pointeur groupeCoursActif = GC_DEMO (depuis demo_groupesCours)
        var groupesCoursDemo = db.getSync('demo_groupesCours', []) || [];
        var gcDemo = groupesCoursDemo.find(function(gc) { return gc.id === 'GC_DEMO'; });
        if (gcDemo) {
            db.setSync('groupeCoursActif', gcDemo);
        }

        // 7. Pré-sélections sidebar. cle() route maintenant vers demo_* grâce
        //    aux étapes 3-6 (trimestreActif='demo').
        if (typeof cle === 'function') {
            db.setSync(cle('horaireSelectionne'), 'HOR_DEMO');
            db.setSync(cle('groupeSelectionne'), '0demo');
        }

        // 8. Force mode normal (pas d'anonymisation pendant la démo par défaut)
        db.setSync('modeApplication', 'normal');
        if (typeof initialiserSystemeModes === 'function') {
            initialiserSystemeModes();
        }

        // 9. Calcul dérivée : calendrier complet pour demo
        if (typeof genererCalendrierComplet === 'function') {
            try {
                genererCalendrierComplet();
            } catch (e) {
                console.warn('[Phase5.B] genererCalendrierComplet:', e);
            }
        }

        // 10. Calcul dérivée : snapshots historiques (async, coûteux ~<1s sur
        //     200 évaluations × 20 étudiants ; P1 accepté)
        if (typeof reconstruireSnapshotsHistoriques === 'function') {
            try {
                await reconstruireSnapshotsHistoriques();
            } catch (e) {
                console.warn('[Phase5.B] reconstruireSnapshotsHistoriques:', e);
            }
        }

        // 11. Calcul dérivée : indices assiduité + cascade vers indices CP
        if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
            try {
                calculerEtSauvegarderIndicesAssiduite();
            } catch (e) {
                console.warn('[Phase5.B] calculerEtSauvegarderIndicesAssiduite:', e);
            }
        }

        // 12. UI : bandeau vert (via fonction legacy — sera déplacée en 5.D)
        if (typeof afficherBandeauDemo === 'function') {
            afficherBandeauDemo(true);
        }

        // 13. Header : dropdown groupe-cours refresh
        if (typeof peuplerDropdownGroupeCoursActif === 'function') {
            peuplerDropdownGroupeCoursActif();
        }

        // 13 bis. #749 lot 3 (11 sept. 2026, S-6) : la saisie des présences se
        //     réinitialise sur le groupe démo — bandeau « Configuration incomplète »
        //     réévalué, date posée sur la dernière séance, préférences du trimestre
        //     démo. Mesuré le 6 sept. : sans cet appel, l'écran gardait l'état du
        //     démarrage (le mapping `suivi-saisie` de modes.js vise une fonction qui
        //     n'existe pas — #736, cité, pas rejugé). Même geste que l'orchestre au
        //     changement de groupe-cours.
        if (typeof initialiserModuleSaisiePresences === 'function') {
            try {
                initialiserModuleSaisiePresences();
            } catch (e) {
                console.warn('[Phase5.B] initialiserModuleSaisiePresences:', e);
            }
        }

        // 14. Navigation vers Suivi › Suivi du groupe (anciennement section 'apercu').
        if (typeof naviguerVers === 'function') {
            naviguerVers('suivi', 'groupe');
        }

        // 15. Rerender complet selon le mode
        if (typeof rafraichirContenuSelonMode === 'function') {
            rafraichirContenuSelonMode();
        }

    } catch (error) {
        console.error('[Phase5.B] Erreur activation démo :', error);
        // Rollback minimal
        db.setSync('demo-actif', null);
        db.removeSync('demo-etat-precedent');
    }
}

/**
 * Retire les items injectés par le pack démo dans les clés globales.
 *
 * Filtrage STRICT par ID : seuls les items dont l'identifiant correspond
 * exactement à un item présent dans PACK_DEMARRAGE sont retirés.
 *
 * Ce filtrage par ID protège les items utilisateur même s'ils portent par
 * accident un flag estDemo/isDemo (héritage d'un cycle legacy ancien). Bug
 * de l'ancienne version (filtre aveugle sur estDemo:true) qui pouvait
 * supprimer les grilles utilisateur dans certains scénarios — corrigé ici.
 */
function retirerItemsDemoDesGlobaux() {
    var pack = (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) ? PACK_DEMARRAGE : null;

    function idsDuPack(collection) {
        if (!pack || !Array.isArray(pack[collection])) return new Set();
        var ids = new Set();
        for (var i = 0; i < pack[collection].length; i++) {
            var item = pack[collection][i];
            if (item && item.id) ids.add(item.id);
        }
        return ids;
    }

    // Symetrie avec fusionnerDemoVersGlobaux (cf. l. 173-176 commentant la
    // preservation des items utilisateur sur collision d'ID, fix incident du
    // 24 avril 2026). Cleanup-side : retirer un item SEULEMENT si son ID est
    // dans le pack ET qu'il porte un flag demo. Sans le flag, c'est un item
    // utilisateur qui a juste un ID en collision (cas observe pour
    // listeCours.id='demo-cours' qu'un utilisateur peut creer legitimement).
    function estItemDemo(item) {
        return !!(item && (item.isDemo === true || item.estDemo === true));
    }

    // listeCours : ID dans le pack ET flag isDemo
    var idsListeCours = idsDuPack('listeCours');
    db.setSync('listeCours', (db.getSync('listeCours', []) || []).filter(function(c) {
        return !(idsListeCours.has(c.id) && estItemDemo(c));
    }));

    // cours (clé canonique) : mêmes IDs que listeCours — PLUS un service créé pendant la
    // démonstration par Suivi › Rencontres (cadrage « Rencontres », 12 sept. 2026) : il porte
    // `creeEnDemonstration: true` avec `isDemo`, marqueur qu'aucun chemin utilisateur n'écrit.
    // Sans ce retrait, il resterait dans la vraie liste de cours de l'enseignant (clé globale).
    db.setSync('cours', (db.getSync('cours', []) || []).filter(function(c) {
        return !((idsListeCours.has(c.id) || c.creeEnDemonstration === true) && estItemDemo(c));
    }));

    // enseignants : retirer ENS_DEMO (ID synthétique fixe defini dans Phase 1).
    // Pas de risque de collision : ENS_DEMO est un ID systeme, pas un pattern
    // qu'un utilisateur creerait spontanement.
    db.setSync('enseignants', (db.getSync('enseignants', []) || []).filter(function(e) {
        return e.id !== 'ENS_DEMO';
    }));

    // #358 (G3) : grilles/échelles NON retirées du global ici. Elles n'y sont
    // plus injectées (fusionnerDemoVersGlobaux ne les fusionne plus), donc rien
    // à nettoyer. ⚠ Un filtre naïf serait FAUX : cette fonction tourne pendant
    // que trimestreActif='demo' (desactiverModeDemo l'appelle AVANT de restaurer
    // le trimestre), or cle('grillesTemplates')=demo_grillesTemplates est PERMANENT —
    // le filtrer corromprait le pack démo. Les modèles démo restent dans demo_*.

    // cartouches_* : lister dynamiquement les clés présentes dans le pack
    // et retirer uniquement les cartouches dont l'id est dans le pack ET
    // qui portent le flag estDemo.
    if (pack) {
        var clesPack = Object.keys(pack);
        for (var p = 0; p < clesPack.length; p++) {
            var nom = clesPack[p];
            if (nom.indexOf('cartouches_') !== 0) continue;
            var idsCart = new Set();
            var cartPack = pack[nom];
            if (Array.isArray(cartPack)) {
                for (var k = 0; k < cartPack.length; k++) {
                    if (cartPack[k] && cartPack[k].id) idsCart.add(cartPack[k].id);
                }
            }
            var cartouches = (db.getSync(cle(nom), []) || []).filter(function(c) {
                return !(idsCart.has(c.id) && estItemDemo(c));
            });
            if (cartouches.length === 0) {
                db.removeSync(cle(nom));
            } else {
                db.setSync(cle(nom), cartouches);
            }
        }
    }
}

/**
 * Désactive le mode démo. Appelée par toggleDemoHandler au décochage,
 * et par le bouton « Quitter la démo » du bandeau vert.
 *
 * Point clé Phase 5.C : ne supprime PAS les clés demo_* (elles sont
 * permanentes pour Phase 1). Corrige le bug question 3 à la source.
 */
async function desactiverModeDemo() {
    try {
        var etat = db.getSync('demo-etat-precedent', null);

        // 1. Filtrer les 6 globaux pour retirer items isDemo/estDemo
        retirerItemsDemoDesGlobaux();

        // 2. Retirer le trimestre 'demo' de la liste globale trimestres
        db.setSync('trimestres', (db.getSync('trimestres', []) || []).filter(function(t) {
            return t.id !== 'demo';
        }));

        // 3. Restaurer le trimestre actif précédent. changerTrimestreActif
        //    régénère aussi le calendrier du trimestre restauré et reset
        //    infoCours/groupeCoursActif à null — la restauration des pointeurs
        //    doit donc venir APRÈS.
        if (etat && etat.trimestreActifId && typeof changerTrimestreActif === 'function') {
            await changerTrimestreActif(etat.trimestreActifId);
        } else {
            // Pas de trimestre à restaurer : laisser trimestreActif vide
            db.removeSync('trimestreActif');
            window.trimestreActif = '';
        }

        // 4. Restaurer les pointeurs depuis snapshot
        if (etat) {
            if (etat.infoCours) db.setSync('infoCours', etat.infoCours);
            else db.removeSync('infoCours');

            if (etat.groupeCoursActif) db.setSync('groupeCoursActif', etat.groupeCoursActif);
            else db.removeSync('groupeCoursActif');

            if (etat.modalitesEvaluation) {
                // Restauration via le module propriétaire (SSOT #328 Lot 1)
                window.modalitesEvaluation.remplacer(etat.modalitesEvaluation, { discret: true });   // sortie du mode démo (lot F)
            }

            // Force normal si valeur legacy 'simulation'
            var mode = etat.modeApplication === 'simulation'
                ? 'normal'
                : (etat.modeApplication || 'normal');
            db.setSync('modeApplication', mode);
        }

        // 5. Nettoyer flags (mais PAS les clés demo_* — elles restent permanentes)
        db.removeSync('demo-actif');
        db.removeSync('demo-etat-precedent');

        // 6. UI : bandeau masqué
        if (typeof afficherBandeauDemo === 'function') {
            afficherBandeauDemo(false);
        }
        if (typeof retirerGuidageDemo === 'function') {
            retirerGuidageDemo();
        }

        // 7. UI : modes + header
        if (typeof initialiserSystemeModes === 'function') {
            initialiserSystemeModes();
        }
        if (typeof peuplerDropdownGroupeCoursActif === 'function') {
            peuplerDropdownGroupeCoursActif();
        }

        // 7 bis. #749 lot 3 (11 sept. 2026, S-6) : la saisie des présences reprend
        //     la date et le tri du trimestre restauré — les pointeurs (étape 4) sont
        //     revenus APRÈS le rafraîchissement de `changerTrimestreActif`, qui a
        //     tourné sans groupe-cours. Miroir de l'appel à l'activation.
        if (typeof initialiserModuleSaisiePresences === 'function') {
            try {
                initialiserModuleSaisiePresences();
            } catch (e) {
                console.warn('[Phase5.C] initialiserModuleSaisiePresences:', e);
            }
        }

        // 8. Navigate vers accueil (pas aperçu — choix Accueil V3)
        if (typeof afficherSection === 'function') {
            afficherSection('accueil');
        }

        // 9. Rerender
        if (typeof rafraichirContenuSelonMode === 'function') {
            rafraichirContenuSelonMode();
        }

    } catch (error) {
        console.error('[Phase5.C] Erreur désactivation démo :', error);
        // Fallback minimal : au moins masquer le bandeau et retirer le flag
        db.removeSync('demo-actif');
        if (typeof afficherBandeauDemo === 'function') afficherBandeauDemo(false);
    }
}

// ============================================
// Exports
// ============================================

window.activerModeDemo = activerModeDemo;
window.desactiverModeDemo = desactiverModeDemo;
window.afficherBandeauDemo = afficherBandeauDemo;
window.initialiserBandeauDemoSiActif = initialiserBandeauDemoSiActif;
window.migrerResidusPhase5 = migrerResidusPhase5;
// #358 (G3) : exposé pour la sentinelle — preuve comportementale que le nettoyage
// démo ne touche PAS aux modèles namespacés (demo_grillesTemplates est permanent).
window.retirerItemsDemoDesGlobaux = retirerItemsDemoDesGlobaux;

})();
