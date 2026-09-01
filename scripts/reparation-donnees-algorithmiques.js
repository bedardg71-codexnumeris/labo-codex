/**
 * reparation-donnees-algorithmiques.js
 *
 * Répare les évaluations dont `donneesAlgorithmiques[critereId].erreurs`
 * ne correspond pas au comptage live des tampons `errfr_*` de l'annotation
 * du fichier lié. Les mots sont LAISSÉS TELS QUELS (typés manuellement,
 * impossibles à reconstituer automatiquement).
 *
 * Pour chaque divergence : remplace erreurs, recalcule noteCalculee/
 * pourcentage/niveau/retroaction depuis l'échelle de la grille, met à jour
 * dateModification. La note finale globale (`noteFinale`/`niveauFinal`) est
 * recalculée pour rester cohérente avec le nouveau pourcentage algo.
 *
 * Usage console :
 *   1. Coller ce fichier en entier → mode PREVIEW (rien n'est écrit).
 *   2. Vérifier window.__reparationAlgo.aReparer (liste des modifications).
 *   3. Pour appliquer pour de vrai : await window.__reparationAlgo.appliquer()
 *      ⚠ ASYNCHRONE : ne recharger qu'APRÈS avoir vu « ÉCRITURE DRAINÉE ».
 */
(function() {
    'use strict';

    /**
     * #671 — LIRE SOUS LA CLÉ DU TRIMESTRE, ET DIRE SOUS LAQUELLE ON A LU.
     *
     * ⚠ CE SCRIPT A ÉTÉ MUET PENDANT TOUTE LA SOIRÉE DU 31 AOÛT 2026, ET SON
     * SILENCE RESSEMBLAIT À UN SUCCÈS. Il lisait les évaluations sous la clé
     * NAMESPACÉE (`cle('evaluationsSauvegardees')` → `a2026_…`) mais les
     * grilles et les échelles sous la clé NUE. En trimestre a2026 la clé nue
     * est vide : `grilles.find(...)` rendait `undefined`, la boucle sortait par
     * `return` pour les 27 copies — AVANT même de regarder une annotation.
     * Résultat affiché : « Rien à réparer », 0 à réparer ET 0 ignoré. Un zéro
     * qui ne portait aucun témoin, sur des données réellement divergentes.
     *
     * ⮕ On lit la clé du trimestre d'abord, la clé nue en repli, et on NOMME
     * celle qui a servi. Un zéro doit pouvoir dire d'où il vient.
     */
    function _lireNamespace(base) {
        const nommee = (typeof cle === 'function') ? cle(base) : base;
        let valeur = db.getSync(nommee, null);
        if (Array.isArray(valeur) && valeur.length) {
            console.log('[Réparation] ' + base + ' lu sous « ' + nommee + ' » : ' + valeur.length + ' entrée(s).');
            return valeur;
        }
        valeur = db.getSync(base, null);
        if (Array.isArray(valeur) && valeur.length) {
            console.warn('[Réparation] ' + base + ' introuvable sous « ' + nommee
                + ' », lu sous la clé NUE « ' + base + ' » : ' + valeur.length + ' entrée(s).');
            return valeur;
        }
        console.warn('[Réparation] ' + base + ' VIDE sous « ' + nommee + ' » ET sous « ' + base
            + ' ». Rien ne pourra être réparé, et ce n\'est pas une bonne nouvelle.');
        return [];
    }

    function compterErrfrAnnotation(annotation) {
        if (!annotation || !annotation.pages) return 0;
        let total = 0;
        for (const k of Object.keys(annotation.pages)) {
            const p = annotation.pages[k];
            if (!p || !p.shapes) continue;
            for (const s of p.shapes) {
                if (s.type && s.type.indexOf('errfr_') === 0) total++;
            }
        }
        return total;
    }

    function resoudreEchelle(echelleId) {
        if (!echelleId) return null;
        if (echelleId.indexOf('pratique-') === 0) {
            const pratiqueId = echelleId.replace('pratique-', '');
            const pratiques = (typeof db !== 'undefined' && db.getSync)
                ? (db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []))
                : [];
            const p = pratiques.find(x => x.id === pratiqueId);
            return p && p.config && p.config.echelle && p.config.echelle.niveaux
                ? { niveaux: p.config.echelle.niveaux }
                : null;
        }
        // #671 — LA CLÉ DU TRIMESTRE, PAS LA CLÉ NUE. Voir la note de
        // `_lireNamespace` : c'est ce qui rendait ce script muet en a2026.
        const echelles = _lireNamespace('echellesTemplates');
        return echelles.find(e => e.id === echelleId) || null;
    }

    function determinerNiveauIDME(pctFinal, echelle) {
        if (!echelle || !echelle.niveaux) return null;
        const n = echelle.niveaux.find(niv => {
            if (niv.code === '0' || niv.code === 0) return false;
            return pctFinal >= niv.min && pctFinal <= niv.max;
        });
        return n ? n.code : null;
    }

    // #668 — LA REGLE VIENT DU GABARIT, PAS D'ICI.
    //
    // Ce fichier portait une COPIE INTEGRALE de `genererRetroactionEUF` : une
    // seconde source de verite, qui aurait repare les donnees selon une regle
    // que le gabarit ne pilote plus. Elle est retiree.
    //
    // Ce script se colle dans la console de l'application : les registres y sont
    // charges. S'ils ne le sont pas, on REFUSE — un outil qui ECRIT dans les
    // donnees reelles ne doit pas se rabattre sur une regle de secours que
    // personne n'a choisie.
    function exigerRegistres() {
        const manquants = [];
        if (!window.projectionAlgo) manquants.push('projectionAlgo (js/evaluation-projection.js)');
        if (!window.formulesAlgo) manquants.push('formulesAlgo (js/evaluation-formules.js)');
        if (manquants.length) {
            throw new Error('[reparation-algo] REFUS : registre(s) absent(s) — ' + manquants.join(', ')
                + '. Coller ce script dans la console de l\'application, pas ailleurs.');
        }
    }

    function projectionEUF(critere, erreurs, mots) {
        const r = window.projectionAlgo.calculer(critere || null, { erreurs: erreurs, mots: mots });
        return r.applicable ? ' ' + r.texte : '';
    }

    function recalculerNoteFinale(evaluation, grille, echelle) {
        if (!grille || !grille.criteres || !echelle || !echelle.niveaux) return null;
        const valeurs = {};
        echelle.niveaux.forEach(n => {
            valeurs[n.code] = (typeof n.valeurCalcul === 'number') ? n.valeurCalcul : ((n.min + n.max) / 2);
        });
        const criteresMap = {};
        (evaluation.criteres || []).forEach(c => { criteresMap[c.critereId] = c; });

        let noteTotal = 0;
        let ponderationTotal = 0;
        grille.criteres.forEach(crit => {
            const c = criteresMap[crit.id];
            if (!c || !c.niveauSelectionne) return;
            const pond = (crit.ponderation || 0) / 100;
            let valeur = valeurs[c.niveauSelectionne];
            // Pour critère algo : préférer le pourcentage exact si présent
            const da = evaluation.donneesAlgorithmiques && evaluation.donneesAlgorithmiques[crit.id];
            if (crit.type === 'algorithmique' && da && typeof da.pourcentage === 'number') {
                valeur = da.pourcentage;
            }
            if (valeur === undefined) return;
            noteTotal += valeur * pond;
            ponderationTotal += pond;
        });
        if (ponderationTotal === 0) return null;
        const pctGlobal = noteTotal / ponderationTotal;
        const niveauGlobal = determinerNiveauIDME(pctGlobal, echelle);
        // Arrondir à 1 décimale comme convention app (cf. evaluation.js:2147)
        return { noteFinale: Math.round(pctGlobal * 10) / 10, niveauFinal: niveauGlobal || '' };
    }

    function obtenirFichierEtAnnotation(evaluation) {
        if (typeof travauxResolution === 'undefined') return { fichier: null, annotation: null };
        const fichier = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (!fichier || typeof travauxStockage === 'undefined') return { fichier: null, annotation: null };
        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        return { fichier: fichier, annotation: annotation };
    }

    function calculerReparations() {
        const cleEvals = cle('evaluationsSauvegardees');
        const evaluations = db.getSync(cleEvals, []) || [];
        const grilles = _lireNamespace('grillesTemplates');
        exigerRegistres();
        const aReparer = [];
        const ignores = [];

        evaluations.forEach(ev => {
            if (ev.remplaceeParId) return;
            if (!ev.donneesAlgorithmiques) return;
            const cles = Object.keys(ev.donneesAlgorithmiques);
            if (!cles.length) return;

            const grille = grilles.find(g => g.id === ev.grilleId);
            if (!grille || !grille.criteres) return;

            const { annotation } = obtenirFichierEtAnnotation(ev);
            if (!annotation) {
                cles.forEach(critereId => {
                    const crit = grille.criteres.find(c => c.id === critereId);
                    if (crit && crit.type === 'algorithmique') {
                        ignores.push({ evalId: ev.id, etudiantDA: ev.etudiantDA, raison: 'pas-annotation' });
                    }
                });
                return;
            }
            const errfrLive = compterErrfrAnnotation(annotation);

            cles.forEach(critereId => {
                const da = ev.donneesAlgorithmiques[critereId] || {};
                const crit = grille.criteres.find(c => c.id === critereId);
                if (!crit || crit.type !== 'algorithmique') return;

                const erreursActuel = (typeof da.erreurs === 'number')
                    ? da.erreurs
                    : (typeof da.totalErreurs === 'number' ? da.totalErreurs : null);
                if (erreursActuel === null) return;
                if (erreursActuel === errfrLive) return; // déjà cohérent

                const mots = (typeof da.mots === 'number') ? da.mots : 0;
                const ponderation = (typeof crit.ponderation === 'number') ? crit.ponderation : 20;
                const echelle = resoudreEchelle(ev.echelleId);

                let nouvelleNoteCalculee = null;
                let nouveauPct = null;
                let nouveauNiveau = null;
                let nouvelleRetroaction = da.retroaction || '';

                // #668 — LA FORMULE AUSSI VIENT DU GABARIT.
                // Ce site recalculait `ponderation - (errfrLive / mots * facteur)`
                // en dur, sans consulter `modeleFormule`. C'etait sans effet tant
                // qu'une seule formule existait ; depuis #667 il y en a trois, et
                // ce script aurait REECRIT les notes d'un critere regle sur
                // << ratio mots par erreur >> avec la formule historique. Trou
                // ouvert par #667, referme ici.
                const resFormule = window.formulesAlgo.calculer(crit, {
                    ponderation: ponderation, erreurs: errfrLive, mots: mots
                });
                if (resFormule.applicable) {
                    nouvelleNoteCalculee = resFormule.note;
                    nouveauPct = resFormule.pctBorne;
                    nouveauNiveau = determinerNiveauIDME(nouveauPct, echelle);
                    nouvelleRetroaction = `Ta rédaction contient ${errfrLive} erreur${errfrLive > 1 ? 's' : ''} de français pour ${mots} mots.${projectionEUF(crit, errfrLive, mots)}`;
                }

                aReparer.push({
                    evalId: ev.id,
                    etudiantDA: ev.etudiantDA,
                    etudiantNom: ev.etudiantNom || '',
                    productionId: ev.productionId,
                    productionNom: ev.productionNom || '',
                    critereId: critereId,
                    critereNom: crit.nom,
                    avant: {
                        erreurs: erreursActuel,
                        mots: mots,
                        noteCalculee: da.noteCalculee,
                        pourcentage: da.pourcentage,
                        niveau: da.niveau
                    },
                    apres: {
                        erreurs: errfrLive,
                        mots: mots, // inchangé volontairement
                        noteCalculee: nouvelleNoteCalculee,
                        pourcentage: nouveauPct,
                        niveau: nouveauNiveau,
                        retroaction: nouvelleRetroaction
                    },
                    motsInchange: true
                });
            });
        });

        return { aReparer: aReparer, ignores: ignores };
    }

    /**
     * ⚠ ASYNCHRONE, ET C'EST NÉCESSAIRE (#671, 1er septembre 2026).
     * `db.setSync` sur une valeur volumineuse bascule en IDB-FIRST
     * (`db.js:1536`, seuil 25 Kio) : il RETIRE la copie localStorage, met la
     * valeur dans `memoryCache` — VOLATILE — et lance l'écriture IndexedDB EN
     * ARRIÈRE-PLAN. Annoncer un compte avant `db.flush()`, c'est attester le
     * CALCUL et non l'ÉCRITURE. Éprouvé le 31 août au soir sur le script des
     * rétroactions d'amorce : compte annoncé, rechargement immédiat, alerte.
     */
    async function appliquerReparations() {
        const cleEvals = cle('evaluationsSauvegardees');
        const evaluations = db.getSync(cleEvals, []) || [];
        const grilles = _lireNamespace('grillesTemplates');
        const { aReparer } = calculerReparations();
        if (!aReparer.length) {
            console.log('[Réparation] Rien à réparer.');
            return { applique: 0 };
        }

        // Indexer par evalId pour accès rapide
        const evalParId = {};
        evaluations.forEach((ev, idx) => { evalParId[ev.id] = idx; });

        const maintenant = new Date().toISOString();
        let nbModifs = 0;

        aReparer.forEach(rep => {
            const idx = evalParId[rep.evalId];
            if (idx === undefined) return;
            const ev = evaluations[idx];
            if (!ev.donneesAlgorithmiques) ev.donneesAlgorithmiques = {};

            // Préserver les champs existants qu'on ne touche pas (codes, niveau manuel, etc.)
            const ancien = ev.donneesAlgorithmiques[rep.critereId] || {};
            const nouveau = Object.assign({}, ancien, {
                erreurs: rep.apres.erreurs
            });
            if (rep.apres.noteCalculee !== null) nouveau.noteCalculee = rep.apres.noteCalculee;
            if (rep.apres.pourcentage !== null) nouveau.pourcentage = rep.apres.pourcentage;
            if (rep.apres.niveau) nouveau.niveau = rep.apres.niveau;
            if (rep.apres.retroaction) nouveau.retroaction = rep.apres.retroaction;
            // Si totalErreurs (mode catégories) existait, l'aligner aussi
            if (typeof ancien.totalErreurs === 'number') nouveau.totalErreurs = rep.apres.erreurs;

            ev.donneesAlgorithmiques[rep.critereId] = nouveau;
            ev.dateModification = maintenant;
            nbModifs++;
        });

        // Recalculer la note finale globale pour chaque éval touchée
        const evalsTouchees = {};
        aReparer.forEach(rep => { evalsTouchees[rep.evalId] = true; });
        Object.keys(evalsTouchees).forEach(evalId => {
            const idx = evalParId[evalId];
            if (idx === undefined) return;
            const ev = evaluations[idx];
            const grille = grilles.find(g => g.id === ev.grilleId);
            const echelle = resoudreEchelle(ev.echelleId);
            const nouvelleNote = recalculerNoteFinale(ev, grille, echelle);
            if (nouvelleNote) {
                ev.noteFinale = nouvelleNote.noteFinale;
                ev.niveauFinal = nouvelleNote.niveauFinal;
            }
        });

        // Persister (db.setSync direct, accès intentionnel — réparation one-shot
        // qui doit écrire dans la clé namespacée du trimestre actif)
        db.setSync(cleEvals, evaluations);

        // ⚠ ATTENDRE QUE L'ÉCRITURE ATTERRISSE AVANT DE DIRE QU'ELLE EST FAITE.
        if (typeof db.flush === 'function') {
            await db.flush();
        } else {
            console.warn('[Réparation] db.flush() absent : NE PAS recharger tout de suite.');
        }
        const restantes = (db._pendingWrites && db._pendingWrites.size) || 0;
        if (restantes) {
            console.warn('[Réparation] ' + restantes + ' écriture(s) encore en attente après flush.');
        }

        console.log(`[Réparation] ${nbModifs} divergences corrigées sur ${Object.keys(evalsTouchees).length} évaluations, ÉCRITURE DRAINÉE.`);
        console.log('[Réparation] Recharge la page, puis réexporte les PDF.');
        return { applique: nbModifs, evalsTouchees: Object.keys(evalsTouchees).length, ecrituresEnAttente: restantes };
    }

    // === MODE PREVIEW (par défaut) ===
    const preview = calculerReparations();
    console.group('[Réparation Algo] Mode PREVIEW (rien n\'est écrit en DB)');
    console.log('À réparer :', preview.aReparer.length, 'divergences erreurs');
    console.log('Ignorés (pas d\'annotation) :', preview.ignores.length);
    if (preview.aReparer.length > 0) {
        console.table(preview.aReparer.map(r => ({
            etudiant: r.etudiantNom || r.etudiantDA,
            production: r.productionNom,
            avant: r.avant.erreurs + '/' + r.avant.mots + ' → ' + (typeof r.avant.pourcentage === 'number' ? r.avant.pourcentage.toFixed(1) + '%' : '—'),
            apres: r.apres.erreurs + '/' + r.apres.mots + ' → ' + (typeof r.apres.pourcentage === 'number' ? r.apres.pourcentage.toFixed(1) + '%' : '—'),
            niveauAvant: r.avant.niveau,
            niveauApres: r.apres.niveau
        })));
    }
    console.groupEnd();
    console.log('Pour appliquer : await window.__reparationAlgo.appliquer()  — attendre « ÉCRITURE DRAINÉE »');

    window.__reparationAlgo = {
        aReparer: preview.aReparer,
        ignores: preview.ignores,
        appliquer: appliquerReparations,
        recalculer: calculerReparations
    };
    return window.__reparationAlgo;
})();
