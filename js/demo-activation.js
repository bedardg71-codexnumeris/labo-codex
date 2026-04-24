/**
 * demo-activation.js
 * Phase 5.B du chantier Autonomisation (PLAN-AUTONOMISATION-UTILISATEUR.md).
 *
 * Active le mode démo sans passer par le legacy donnees-demo.js.
 * Le toggleDemoHandler de accueil.js appelle activerModeDemo() à la place
 * de entrerEnDemo() à partir de la Beta 99.24.
 *
 * Étapes reproduites depuis l'Audit 1 Table 2 (docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md) :
 *   1. Snapshot état utilisateur (pour restauration au toggle OFF)
 *   2. Flag demo-actif='true'
 *   3. Upsert trimestre 'demo' actif dans la liste globale trimestres
 *   4. Pointeurs trimestreActif, infoCours, groupeCoursActif
 *   5. Pré-sélections sidebar (horaireSelectionne, groupeSelectionne)
 *   6. Mode normal forcé
 *   7. Fusion des données démo vers les 6 clés globales polluées (P2 accepté —
 *      cf. section Décision architecturale du doc d'audit)
 *   8. Calcul des 3 dérivées : calendrier, snapshots, indices
 *   9. Bandeau + navigation + rerender
 *
 * Le toggle OFF (quitterDemo) reste sur le legacy jusqu'à Phase 5.C.
 */
(function() {
'use strict';

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

    // 2. cours (clé canonique) : merge par Map
    var coursCanoniques = db.getSync('cours', []) || [];
    var coursMap = new Map(coursCanoniques.map(function(c) { return [c.id, c]; }));
    for (var j = 0; j < listeCoursDemo.length; j++) {
        var cDemoCanon = listeCoursDemo[j];
        coursMap.set(cDemoCanon.id, Object.assign({}, cDemoCanon, { isDemo: true }));
    }
    db.setSync('cours', Array.from(coursMap.values()));

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

    // 4. grillesTemplates : upsert avec estDemo:true
    var grillesDemo = db.getSync('demo_grillesTemplates', []) || [];
    var grilles = db.getSync('grillesTemplates', []) || [];
    for (var g = 0; g < grillesDemo.length; g++) {
        var grilleDemo = grillesDemo[g];
        var marquee = Object.assign({}, grilleDemo, { estDemo: true });
        var idxGrille = grilles.findIndex(function(x) { return x.id === marquee.id; });
        if (idxGrille >= 0) grilles[idxGrille] = marquee;
        else grilles.push(marquee);
    }
    db.setSync('grillesTemplates', grilles);

    // 5. echellesTemplates : upsert avec estDemo:true
    var echellesDemo = db.getSync('demo_echellesTemplates', []) || [];
    var echelles = db.getSync('echellesTemplates', []) || [];
    for (var e = 0; e < echellesDemo.length; e++) {
        var echDemo = echellesDemo[e];
        var echMarquee = Object.assign({}, echDemo, { estDemo: true });
        var idxEch = echelles.findIndex(function(x) { return x.id === echMarquee.id; });
        if (idxEch >= 0) echelles[idxEch] = echMarquee;
        else echelles.push(echMarquee);
    }
    db.setSync('echellesTemplates', echelles);

    // 6. modalitesEvaluation : écrasement (mêmes contraintes que legacy)
    var modDemo = db.getSync('demo_modalitesEvaluation', null);
    if (modDemo) {
        db.setSync('modalitesEvaluation', modDemo);
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
            var cartouches = db.getSync(nom, []) || [];
            for (var c = 0; c < cartouchesPack.length; c++) {
                var cartouche = cartouchesPack[c];
                var existeCart = cartouches.some(function(x) { return x.id === cartouche.id; });
                if (!existeCart) {
                    cartouches.push(Object.assign({}, cartouche, { estDemo: true }));
                }
            }
            db.setSync(nom, cartouches);
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

        // Filet de sécurité : si les clés demo_* ont été effacées par un
        // quitterDemo legacy (bug question 3 de l'audit : le cleanup générique
        // supprime les clés Phase 1 permanentes, et le flag de version empêche
        // le re-peuplement au boot suivant), forcer un re-peuplement via
        // Phase 1. P3 du plan : accepté en audit, mitigé ici.
        var sentinelle = db.getSync('demo_groupesCours', null);
        if (!sentinelle || !Array.isArray(sentinelle) || sentinelle.length === 0) {
            console.warn('[Phase5.B] Données demo_* absentes, re-peuplement forcé via Phase 1');
            try { localStorage.removeItem('demo-version-installee'); } catch (e) { /* ignore */ }
            if (typeof initialiserDemoNamespace === 'function') {
                await initialiserDemoNamespace();
            }
        }

        // 1. Snapshot état utilisateur (restauré au toggle OFF)
        var trimestresAvant = db.getSync('trimestres', []) || [];
        var trimActifAvant = trimestresAvant.find(function(t) { return t.actif === true; });
        db.setSync('demo-etat-precedent', {
            trimestreActifId: trimActifAvant ? trimActifAvant.id : null,
            infoCours: db.getSync('infoCours', null),
            groupeCoursActif: db.getSync('groupeCoursActif', null),
            modeApplication: db.getSync('modeApplication', 'normal'),
            modalitesEvaluation: db.getSync('modalitesEvaluation', null),
            trimestres: trimestresAvant,
            listeCours: db.getSync('listeCours', []),
            cours: db.getSync('cours', []),
            enseignants: db.getSync('enseignants', []),
            grillesTemplates: db.getSync('grillesTemplates', []),
            echellesTemplates: db.getSync('echellesTemplates', [])
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

        // 14. Navigation vers l'aperçu
        if (typeof afficherSection === 'function') {
            afficherSection('apercu');
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

// ============================================
// Exports
// ============================================

window.activerModeDemo = activerModeDemo;

})();
