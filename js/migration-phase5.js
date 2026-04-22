/**
 * migration-phase5.js
 * Migration silencieuse Phase 5 — retrait du mode démo legacy
 *
 * Plan 1 Autonomisation utilisateur (PLAN-AUTONOMISATION-UTILISATEUR.md).
 * Au 1er démarrage post-livraison, purge les résidus de donnees-demo.js :
 *   - flags de contrôle (demo-actif, demo-etat-precedent, demo-chargees)
 *   - trimestre id:'demo' dans la liste globale trimestres
 *   - items démo injectés dans les collections globales (isDemo / estDemo)
 *   - étudiants démo contaminant les namespaces trimestre
 *   - modalitesEvaluation écrasées par la démo (reset au défaut)
 *
 * Idempotent via le flag autonomisation-phase5-done. Ne touche jamais
 * le namespace demo_* (géré par demo-namespace.js).
 */
(function() {
'use strict';

const CLE_FLAG = 'autonomisation-phase5-done';

function filtrerCollection(cle, predicate) {
    const arr = db.getSync(cle, []);
    if (!Array.isArray(arr)) return;
    const filtre = arr.filter(item => item && predicate(item));
    if (filtre.length !== arr.length) {
        db.setSync(cle, filtre);
    }
}

function listerToutesClesLocalStorage() {
    const cles = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const c = localStorage.key(i);
            if (c) cles.push(c);
        }
    } catch (e) { /* storage indisponible */ }
    return cles;
}

function nettoyerResidusLegacy() {
    if (typeof db === 'undefined') return;
    if (db.getSync(CLE_FLAG, null) === 'true') return;

    // Flags de contrôle du système legacy
    db.removeSync('demo-actif');
    db.removeSync('demo-etat-precedent');
    db.removeSync('demo-chargees');

    // Trimestre 'demo' injecté dans la liste globale (vit désormais dans demo_trimestres)
    filtrerCollection('trimestres', t => t.id !== 'demo');

    // Items démo injectés dans les collections globales
    filtrerCollection('listeCours', c => !c.isDemo);
    filtrerCollection('cours', c => !c.isDemo);
    filtrerCollection('enseignants', e => !e.isDemo && e.id !== 'ENS_DEMO');
    filtrerCollection('horaires', h => !h.isDemo && h.id !== 'HOR_DEMO');
    filtrerCollection('groupesCours', gc => !gc.isDemo && gc.id !== 'GC_DEMO');
    filtrerCollection('grillesTemplates', g => !g.estDemo);
    filtrerCollection('echellesTemplates', e => !e.estDemo);

    // Reset modalitesEvaluation (la démo les écrasait dans la clé globale)
    db.removeSync('modalitesEvaluation');

    // Cartouches démo (clé dédiée)
    db.removeSync('cartouches_GRILLE_DEMO');

    // Étudiants démo contaminant les namespaces trimestre
    const toutesCles = listerToutesClesLocalStorage();
    for (const cle of toutesCles) {
        if (!cle.endsWith('_groupeEtudiants')) continue;
        if (cle === 'demo_groupeEtudiants') continue;
        filtrerCollection(cle, e => !e.isDemo && e.groupe !== '0demo' && e.groupe !== '9999' && e.groupe !== 'demo');
    }

    // Filtrage défensif des cartouches_* résiduels contenant estDemo
    for (const cle of toutesCles) {
        if (!cle.startsWith('cartouches_')) continue;
        if (cle === 'cartouches_GRILLE_DEMO') continue;
        filtrerCollection(cle, c => !c.estDemo);
    }

    db.setSync(CLE_FLAG, 'true');
    console.warn('[MIGRATION Phase 5] Résidus démo legacy nettoyés');
}

try {
    nettoyerResidusLegacy();
} catch (e) {
    console.error('[MIGRATION Phase 5] Erreur:', e);
}

})();
