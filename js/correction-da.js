/* ===============================
   #976 — CORRIGER LE DA D'UNE FICHE (lot 7 du chantier de l'enregistrement, 8 oct. 2026)

   Le souhait de Grégoire : une coquille de DA corrigée garde ses données. Tout ce qui
   porte l'ancien DA dans le TRIMESTRE ACTIF passe sous le nouveau (portée décidée le
   8 oct.) ; rien n'est copié puis effacé : chaque valeur est réécrite EN PLACE, clé par
   clé. Inventaire des clés : `plans de travail/MESURE-2026-10-08-976-cles-qui-portent-un-DA.md`.

   L'ordre : passe à blanc qui compte → écriture → vérification qui recompte.
   Ni doublon ni perte sur un échec en cours de route :
   - une clé s'écrit d'un bloc (`db.modifier` : une valeur, une écriture) : elle est
     entièrement sous l'ancien DA ou entièrement sous le nouveau, jamais les deux ;
   - la fiche porte d'abord une marque `correctionDA: { vers }`, et change de DA EN
     DERNIER : un échec laisse la fiche sous l'ancien DA, marquée ;
   - refaire le geste sur cette fiche reprend la même correction (le nouveau DA est
     celui de la marque) : les clés déjà passées n'ont plus rien sous l'ancien DA, les
     autres passent. Entre l'échec et la reprise, rien n'est perdu ni doublé, mais les
     données déjà passées ne s'affichent plus sous la fiche.

   Trois clés GLOBALES portent des résultats de l'élève : le registre longitudinal, les
   jetons, les jugements de dénotation. Elles suivent aussi (décision de Grégoire, 8 oct.,
   14 h 50), avec les mêmes garanties : une écriture par clé, un conflit refuse sans rien
   écrire, comptées par la passe à blanc et par le recompte, reprises comme les autres.
   Les autres globales qui portent un DA (états d'animation, validations d'écran) restent.
   =============================== */

(function () {
    'use strict';

    const MARQUE = 'correctionDA';

    function memeDA(x, da) {
        return x !== undefined && x !== null && String(x).trim() === String(da).trim();
    }

    function cloner(v) {
        return v === undefined || v === null ? v : JSON.parse(JSON.stringify(v));
    }

    /* ---- Les formes du DA (mesure, § A) : chacune rend le nombre de DA déplacés ---- */

    // [{ <champ>: da }]
    function champDeTableau(tab, champ, ancien, nouveau) {
        let n = 0;
        if (!Array.isArray(tab)) return 0;
        tab.forEach((el) => {
            if (el && typeof el === 'object' && memeDA(el[champ], ancien)) { el[champ] = nouveau; n++; }
        });
        return n;
    }

    // ['da', …]
    function elementsDeTableau(tab, ancien, nouveau) {
        let n = 0;
        if (!Array.isArray(tab)) return 0;
        for (let i = 0; i < tab.length; i++) {
            if (memeDA(tab[i], ancien)) { tab[i] = nouveau; n++; }
        }
        return n;
    }

    // { [da]: … } — un conflit (les deux DA présents) ne se fusionne pas : il est compté,
    // et la clé n'est pas réécrite (voir `transformer`).
    // `estVide(entrée)` (facultatif) : une entrée VIDE sous le nouveau DA n'est pas un conflit,
    // elle est remplacée — rien ne s'y perd (les jetons : `initialiserJetonsEtudiant` pose `{}`).
    function cleDObjet(obj, ancien, nouveau, etat, estVide) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 0;
        const cles = Object.keys(obj).filter((k) => memeDA(k, ancien));
        if (cles.length === 0) return 0;
        const cible = Object.keys(obj).filter((k) => memeDA(k, nouveau));
        if (cible.length && !(estVide && cible.every((k) => estVide(obj[k])))) { etat.conflit = true; return 0; }
        cible.forEach((k) => { delete obj[k]; });
        // Une seule entrée sous l'ancien DA, en pratique ; s'il y en avait deux (« 1234567 »
        // et « 1234567 » avec espace), deux entrées sous le même nouveau DA serait un doublon.
        if (cles.length > 1) { etat.conflit = true; return 0; }
        obj[nouveau] = obj[cles[0]];
        delete obj[cles[0]];
        return 1;
    }

    function copies(tab, ancien, nouveau) {
        let n = 0;
        if (!Array.isArray(tab)) return 0;
        tab.forEach((f) => {
            if (!f || typeof f !== 'object' || !memeDA(f.etudiantDA, ancien)) return;
            f.etudiantDA = nouveau;
            if (f.leaParsed && typeof f.leaParsed === 'object' && memeDA(f.leaParsed.da, ancien)) f.leaParsed.da = nouveau;
            // `<da>_<production>` ou `<da>_auto` (travaux-import.js) : le préfixe suit l'élève.
            const prefixe = String(ancien).trim() + '_';
            if (typeof f.groupeDocumentId === 'string' && f.groupeDocumentId.startsWith(prefixe)) {
                f.groupeDocumentId = nouveau + '_' + f.groupeDocumentId.slice(prefixe.length);
            }
            // `nomFichier`, `nomFichierLea`, `leaParsed.raw` : le nom du fichier déposé, gardé tel quel.
            n++;
        });
        return n;
    }

    /* ---- Les familles du trimestre actif ---- */
    // `categorie` : ce que la fenêtre compte (évaluations, présences, copies, résultats).
    const FAMILLES = [
        { nom: 'evaluationsSauvegardees', categorie: 'evaluations', deplacer: (v, a, n) => champDeTableau(v, 'etudiantDA', a, n) },
        { nom: 'presences', categorie: 'presences', deplacer: (v, a, n) => champDeTableau(v, 'da', a, n) },
        { nom: 'fichiersTravaux', categorie: 'copies', deplacer: copies },
        { nom: 'corbeilleFichiers', categorie: 'copies', deplacer: copies },
        { nom: 'annotationsTravaux', categorie: 'autres', deplacer: (v, a, n) => champDeTableau(v, 'etudiantDA', a, n) },
        { nom: 'indicesAssiduite', categorie: 'resultats', deplacer: (v, a, n, e) => (v ? cleDObjet(v.sommatif, a, n, e) : 0) },
        { nom: 'indicesCP', categorie: 'resultats', deplacer: cleDObjet },
        { nom: 'indicesPatternsRaI', categorie: 'resultats', deplacer: cleDObjet },
        { nom: 'indicesEvaluation', categorie: 'resultats', deplacer: cleDObjet },
        { nom: 'portfoliosEleves', categorie: 'resultats', deplacer: cleDObjet },
        { nom: 'resultatsUlterieurs', categorie: 'resultats', deplacer: cleDObjet },
        {
            nom: 'interventions', categorie: 'resultats',
            deplacer: (v, a, n, e) => {
                let total = 0;
                (Array.isArray(v) ? v : []).forEach((it) => {
                    if (!it || typeof it !== 'object') return;
                    let ici = elementsDeTableau(it.etudiants, a, n);
                    ici += cleDObjet(it.notesIndividuelles, a, n, e);
                    ici += cleDObjet(it.snapshotAvant, a, n, e);
                    if (ici) total++;
                });
                return total;
            }
        },
        { nom: 'notesRapport', categorie: 'autres', deplacer: cleDObjet },
        { nom: 'confidentielEtudiants', categorie: 'autres', deplacer: cleDObjet },
        { nom: 'chronoEvaluations', categorie: 'autres', deplacer: (v, a, n) => champDeTableau(v, 'etudiantDA', a, n) },
        { nom: 'elevesDesinscrits', categorie: 'autres', deplacer: (v, a, n) => champDeTableau(v, 'da', a, n) },
        // Clés composées, énumérées (hors des boucles du registre)
        {
            nom: 'snapshots_', compose: true, categorie: 'resultats',
            deplacer: (v, a, n, e) => {
                if (!v || typeof v !== 'object') return 0;
                let total = 0;
                (Array.isArray(v.hebdomadaires) ? v.hebdomadaires : []).forEach((s) => {
                    if (s && champDeTableau(s.etudiants, 'da', a, n)) total++;
                });
                (Array.isArray(v.interventions) ? v.interventions : []).forEach((s) => {
                    if (!s) return;
                    let ici = elementsDeTableau(s.etudiantsDA, a, n);
                    ici += cleDObjet(s.avant, a, n, e);
                    ici += cleDObjet(s.apres, a, n, e);
                    if (ici) total++;
                });
                return total;
            }
        },
        { nom: 'etudiantsSuivis_gc_', compose: true, categorie: 'autres', deplacer: (v, a, n) => champDeTableau(v, 'da', a, n) },
        { nom: 'mapping_anonymisation', brute: true, categorie: 'autres', deplacer: cleDObjet },
        // Les trois globales (décision du 8 oct., 14 h 50). `cleReelle` : la clé que lit leur
        // propriétaire (registre-longitudinal.js, evaluation-jetons.js, denotation-jugements.js).
        {
            nom: 'registreLongitudinal', globale: true, cleReelle: () => 'registreLongitudinal', categorie: 'longitudinal',
            // `eleves[da]` et son champ `da`. Les copies datées du dossier gardent le DA qu'elles
            // portaient à la capture : ce sont les trimestres d'alors, que la correction ne touche pas.
            deplacer: (v, a, n, e) => {
                if (!v || typeof v !== 'object' || !v.eleves) return 0;
                const k = cleDObjet(v.eleves, a, n, e);
                if (k && v.eleves[n] && memeDA(v.eleves[n].da, a)) v.eleves[n].da = n;
                return k;
            }
        },
        {
            nom: 'jetonsEtudiants', globale: true, cleReelle: () => 'jetonsEtudiants', categorie: 'jetons',
            deplacer: (v, a, n, e) => cleDObjet(v, a, n, e, jetonsVides),
            // Ce qui compte comme « déjà sous le nouveau DA » : une entrée qui n'est pas vide.
            presentSous: (v, da) => (v && typeof v === 'object'
                ? Object.keys(v).filter((k) => memeDA(k, da) && !jetonsVides(v[k])).length : 0),
            // La fenêtre compte les jetons attribués, pas l'entrée.
            afficher: (v, da) => {
                const k = v && typeof v === 'object' ? Object.keys(v).find((x) => memeDA(x, da)) : null;
                if (!k || !v[k] || typeof v[k] !== 'object') return 0;
                return Object.keys(v[k]).filter((j) => j !== '_historique')
                    .reduce((s, j) => s + (typeof v[k][j] === 'number' && v[k][j] > 0 ? v[k][j] : 0), 0);
            }
        },
        {
            nom: 'jugementsDenotation', globale: true, cleReelle: () => cle('jugementsDenotation'), categorie: 'denotation',
            deplacer: (v, a, n, e) => {
                if (!v || typeof v !== 'object') return 0;
                return Object.keys(v).reduce((s, p) => s + cleDObjet(v[p], a, n, e), 0);
            }
        }
        // ⚠ Laissés exprès (mesure, § B) : les `_backup_v1` figés d'une migration ; la file
        // d'import en sessionStorage ; le champ `etudiantDA` des blobs du magasin IndexedDB
        // `fichiers` — aucun lecteur (`listerBlobsEtudiant` sans appelant), déjà non tenu par
        // `reassocierFichier`, et le réécrire réécrirait chaque copie entière.
    ];

    // Une entrée de jetons sans jeton ni historique : rien à perdre.
    function jetonsVides(entree) {
        if (!entree || typeof entree !== 'object') return true;
        return Object.keys(entree).every((j) => (j === '_historique'
            ? !Array.isArray(entree[j]) || entree[j].length === 0
            : !(typeof entree[j] === 'number' && entree[j] > 0)));
    }

    /** Applique une famille à une COPIE de la valeur. @returns {{valeur, n, conflit}} */
    function transformer(famille, valeur, ancien, nouveau) {
        const copie = cloner(valeur);
        const etat = { conflit: false };
        const n = copie === undefined || copie === null ? 0 : famille.deplacer(copie, ancien, nouveau, etat);
        return { valeur: copie, n, conflit: etat.conflit };
    }

    // Ce qui porte un DA, sans rien changer : la même fonction, vers un DA impossible.
    function compter(famille, valeur, da) {
        return transformer(famille, valeur, da, '\u0000976').n;
    }

    function prefixeTrimestre() {
        const id = typeof window.obtenirTrimestreId === 'function' ? window.obtenirTrimestreId() : '';
        return id ? id + '_' : '';
    }

    /** Les clés réelles du trimestre actif, famille par famille, puis les trois globales. */
    function clesDuTrimestre() {
        const prefixe = prefixeTrimestre();
        if (!prefixe) return [];
        const toutes = typeof db.keysSync === 'function' ? db.keysSync() : [];
        const liste = [];
        FAMILLES.forEach((f) => {
            if (f.globale) {
                liste.push({ cle: f.cleReelle(), famille: f });
            } else if (f.compose) {
                toutes.filter((k) => k.startsWith(prefixe + f.nom)).sort().forEach((k) => liste.push({ cle: k, famille: f }));
            } else if (f.brute) {
                liste.push({ cle: prefixe + f.nom, famille: f });
            } else {
                const k = cle(f.nom);
                // Une famille que `cle()` rendrait nue serait globale : hors portée.
                if (k.startsWith(prefixe)) liste.push({ cle: k, famille: f });
            }
        });
        return liste;
    }

    function lireBrut(k) {
        return db.getSync(k, null);
    }

    function ficheDe(etudiants, da) {
        return (etudiants || []).find((e) => e && memeDA(e.da, da)) || null;
    }

    /**
     * La passe à blanc : ce que l'ancien DA porte, clé par clé ; ce que le nouveau porte
     * déjà. N'écrit rien.
     */
    function passeABlanc(ancien, nouveau) {
        const cleFiches = cle('groupeEtudiants');
        const etudiants = lireBrut(cleFiches) || [];
        const fiche = ficheDe(etudiants, ancien);
        const reprise = !!(fiche && fiche[MARQUE] && nouveau && memeDA(fiche[MARQUE].vers, nouveau));
        const parCle = clesDuTrimestre().map(({ cle: k, famille }) => {
            const v = lireBrut(k);
            const t = nouveau ? transformer(famille, v, ancien, nouveau) : { conflit: false };
            return {
                cle: k, famille,
                ancien: compter(famille, v, ancien),
                nouveau: !nouveau ? 0 : (famille.presentSous ? famille.presentSous(v, nouveau) : compter(famille, v, nouveau)),
                conflit: t.conflit,
                // Ce que la clé portera sous le nouveau DA une fois écrite : la valeur TRANSFORMÉE,
                // comptée comme le recompte compte (relecture de Cowork, 8 oct., 15 h 41 — une entrée
                // de jetons vide sous le nouveau DA faisait « attendu + 1 » à chaque essai).
                apres: nouveau && !t.conflit ? compter(famille, t.valeur, nouveau) : 0
            };
        });
        const comptes = { evaluations: 0, presences: 0, copies: 0, resultats: 0, autres: 0, jetons: 0, denotation: 0, longitudinal: 0 };
        parCle.forEach((c) => {
            comptes[c.famille.categorie] += c.famille.afficher ? c.famille.afficher(lireBrut(c.cle), ancien) : c.ancien;
        });
        return { cleFiches, fiche, reprise, parCle, comptes };
    }

    /**
     * Le refus, ou null. Ordre : une reprise vers un autre DA, la forme du DA, une autre fiche,
     * les données déjà sous le nouveau DA (hors reprise de la même correction).
     */
    function refus(ancien, nouveau, mesure) {
        if (!mesure.fiche) return 'Étudiant·e introuvable : la liste a changé depuis l\'ouverture de la fiche.';
        // Une correction arrêtée en chemin ne se finit que vers SON DA : un autre répartirait
        // les données sur trois DA.
        const marque = mesure.fiche[MARQUE];
        if (marque && !memeDA(marque.vers, nouveau)) {
            return 'Une correction vers ' + String(marque.vers) + ' s\'est arrêtée en chemin : termine-la avec ce DA.';
        }
        if (!/^\d{7}$/.test(nouveau || '')) return 'Le nouveau DA doit avoir sept chiffres.';
        if (memeDA(nouveau, ancien)) return 'Le nouveau DA est le même que l\'ancien.';
        const etudiants = lireBrut(mesure.cleFiches) || [];
        if (ficheDe(etudiants, nouveau)) return 'Ce DA est déjà celui d\'un·e autre étudiant·e de ce trimestre.';
        // En reprise, le nouveau DA porte déjà ce qui est passé au premier essai (le premier essai
        // a refusé toute donnée antérieure sous ce DA) : seul un conflit de clés d'objet bloque.
        const deja = mesure.parCle.filter((c) => c.conflit || (c.nouveau > 0 && !mesure.reprise));
        const dejaHors = deja.filter((c) => c.famille.globale);
        if (dejaHors.length) {
            return 'Ce DA porte déjà ' + dejaHors.map((c) => LIBELLES_GLOBALES[c.famille.categorie]).join(', ') +
                ' : rien n\'a été déplacé.';
        }
        if (deja.length) return 'Des données portent déjà ce DA dans ce trimestre : rien n\'a été déplacé.';
        return null;
    }

    // Mots du refus d'un conflit hors trimestre (validés par Grégoire, 8 oct., 15 h 41).
    const LIBELLES_GLOBALES = {
        longitudinal: 'une entrée au suivi longitudinal',
        jetons: 'des jetons',
        denotation: 'un jugement de dénotation'
    };

    function totalSous(da) {
        return clesDuTrimestre().reduce((s, { cle: k, famille }) => s + compter(famille, lireBrut(k), da), 0);
    }

    /**
     * Le geste. @returns {Promise<{ok, refus?, raison?, deplaces?}>}
     * `geste` : le nom que dit le témoin. Les écritures passent par `modifierEtAnnoncer`
     * (garde #340, témoin sur un échec), discrètes ; un seul « Enregistré » à la fin.
     */
    async function corriger(ancien, nouveau, options) {
        const geste = (options && options.geste) || 'Corriger le DA';
        nouveau = String(nouveau || '').trim();
        if (typeof window.estTrimestreArchive === 'function' && window.estTrimestreArchive()) {
            return { ok: false, refus: 'Ce trimestre est aux archives : il se lit sans se modifier.' };
        }
        const mesure = passeABlanc(ancien, nouveau);
        const r = refus(ancien, nouveau, mesure);
        if (r) return { ok: false, refus: r };

        const attendu = mesure.parCle.reduce((s, c) => s + c.apres, 0);
        const ecrites = [];
        const ecrire = async (k, mutateur) => {
            let refuseParGarde = true;
            const res = await modifierEtAnnoncer(k, (lus) => {
                const v = mutateur(lus);
                if (v === undefined) { refuseParGarde = false; return undefined; }
                return v;
            }, null, { geste, discret: true });
            if (res === undefined && refuseParGarde) throw new Error('garde');
            if (res !== undefined) ecrites.push(k);
        };
        try {
            // 1. La marque, sur la fiche (sous l'ancien DA).
            await ecrire(mesure.cleFiches, (lus) => {
                const fiches = cloner(lus) || [];
                const f = ficheDe(fiches, ancien);
                if (!f) return undefined;
                f[MARQUE] = { vers: nouveau, depuis: new Date().toISOString() };
                return fiches;
            });
            // 2. Chaque clé, relue DANS sa file (une écriture concurrente n'est pas perdue).
            for (const c of mesure.parCle) {
                if (c.ancien === 0) continue;
                await ecrire(c.cle, (lus) => {
                    const t = transformer(c.famille, lus, ancien, nouveau);
                    if (t.conflit) throw new Error('conflit');
                    return t.n ? t.valeur : undefined;
                });
            }
            // 3. La vérification, AVANT la fiche : rien sous l'ancien DA, tout sous le nouveau. Une
            //    écriture concurrente sous l'ancien DA (une saisie arrivée pendant le déplacement)
            //    laisse la fiche marquée : refaire le geste la fait passer à son tour.
            const resteAncien = totalSous(ancien);
            const sousNouveau = totalSous(nouveau);
            if (resteAncien !== 0 || sousNouveau !== attendu) {
                console.error('[CorrectionDA] Vérification :', { resteAncien, sousNouveau, attendu });
                return { ok: false, raison: 'le recompte ne tombe pas juste. Refais « Corriger le DA… » sur cette fiche pour finir.' };
            }
            // 4. La fiche, en dernier : son DA, et la marque retirée.
            await ecrire(mesure.cleFiches, (lus) => {
                const fiches = cloner(lus) || [];
                const f = ficheDe(fiches, ancien);
                if (!f) return undefined;
                f.da = nouveau;
                delete f[MARQUE];
                return fiches;
            });
        } catch (e) {
            console.error('[CorrectionDA] Écriture interrompue :', e);
            return { ok: false, raison: 'l\'écriture s\'est arrêtée en chemin. Rien n\'est perdu : refais « Corriger le DA… » sur cette fiche pour finir.' };
        }

        // 5. La fiche relue : sous le nouveau DA, plus sous l'ancien, sans marque.
        const fiches = lireBrut(mesure.cleFiches) || [];
        const fiche = ficheDe(fiches, nouveau);
        if (!fiche || ficheDe(fiches, ancien) || fiche[MARQUE]) {
            console.error('[CorrectionDA] Vérification de la fiche :', { trouvee: !!fiche });
            return { ok: false, raison: 'la fiche n\'a pas pris son nouveau DA. Refais « Corriger le DA… » sur cette fiche.' };
        }

        // Le codex apprend chaque clé écrite ; le témoin dit l'issue, une fois.
        if (typeof window.signalerEcritureUsager === 'function') ecrites.forEach((k) => window.signalerEcritureUsager(k));
        if (window.temoinEnregistrement) window.temoinEnregistrement.enregistre(mesure.cleFiches);
        return { ok: true, deplaces: mesure.comptes };
    }

    window.CorrectionDA = { FAMILLES, MARQUE, transformer, compter, passeABlanc, refus, corriger, clesDuTrimestre };
})();
