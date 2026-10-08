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

   Les clés GLOBALES ne sont pas touchées (consigne du 8 oct.). Trois d'entre elles
   portent des résultats (registre longitudinal, jetons, notes de dénotation) : si
   l'ancien DA y figure, le geste REFUSE plutôt que de laisser quelque chose derrière.
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
    function cleDObjet(obj, ancien, nouveau, etat) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return 0;
        const cles = Object.keys(obj).filter((k) => memeDA(k, ancien));
        if (cles.length === 0) return 0;
        if (Object.keys(obj).some((k) => memeDA(k, nouveau))) { etat.conflit = true; return 0; }
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
        { nom: 'mapping_anonymisation', brute: true, categorie: 'autres', deplacer: cleDObjet }
        // ⚠ Laissés exprès (mesure, § B) : les `_backup_v1` figés d'une migration ; la file
        // d'import en sessionStorage ; le champ `etudiantDA` des blobs du magasin IndexedDB
        // `fichiers` — aucun lecteur (`listerBlobsEtudiant` sans appelant), déjà non tenu par
        // `reassocierFichier`, et le réécrire réécrirait chaque copie entière.
    ];

    // Globales qui portent des résultats : comptées, jamais écrites (mesure, § C).
    const GLOBALES = [
        { nom: 'registreLongitudinal', libelle: 'le registre longitudinal', compter: (v, da) => (v && v.eleves && Object.keys(v.eleves).some((k) => memeDA(k, da)) ? 1 : 0) },
        { nom: 'jetonsEtudiants', libelle: 'les jetons attribués', compter: (v, da) => (v && typeof v === 'object' && Object.keys(v).some((k) => memeDA(k, da)) ? 1 : 0) },
        {
            nom: 'jugementsDenotation', libelle: 'les jugements de dénotation',
            compter: (v, da) => (v && typeof v === 'object'
                ? Object.values(v).filter((p) => p && typeof p === 'object' && Object.keys(p).some((k) => memeDA(k, da))).length : 0)
        }
    ];

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

    /** Les clés réelles du trimestre actif, famille par famille. */
    function clesDuTrimestre() {
        const prefixe = prefixeTrimestre();
        if (!prefixe) return [];
        const toutes = typeof db.keysSync === 'function' ? db.keysSync() : [];
        const liste = [];
        FAMILLES.forEach((f) => {
            if (f.compose) {
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
     * déjà ; les globales qui le retiennent. N'écrit rien.
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
                nouveau: nouveau ? compter(famille, v, nouveau) : 0,
                conflit: t.conflit
            };
        });
        const comptes = { evaluations: 0, presences: 0, copies: 0, resultats: 0, autres: 0 };
        parCle.forEach((c) => { comptes[c.famille.categorie] += c.ancien; });
        const globales = GLOBALES
            .map((g) => ({ nom: g.nom, libelle: g.libelle, n: g.compter(db.getSync(g.nom, null), ancien) }))
            .filter((g) => g.n > 0);
        return { cleFiches, fiche, reprise, parCle, comptes, globales };
    }

    /**
     * Le refus, ou null. Ordre : la forme du DA, une autre fiche, les globales, les données
     * déjà sous le nouveau DA (hors reprise de la même correction).
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
        if (mesure.globales.length) {
            return 'L\'ancien DA figure aussi dans ' + mesure.globales.map((g) => g.libelle).join(', ') +
                ', hors de ce trimestre : rien n\'a été déplacé.';
        }
        // En reprise, le nouveau DA porte déjà ce qui est passé au premier essai (le premier essai
        // a refusé toute donnée antérieure sous ce DA) : seul un conflit de clés d'objet bloque.
        const deja = mesure.parCle.filter((c) => c.conflit || (c.nouveau > 0 && !mesure.reprise));
        if (deja.length) return 'Des données portent déjà ce DA dans ce trimestre : rien n\'a été déplacé.';
        return null;
    }

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

        const attendu = mesure.parCle.reduce((s, c) => s + c.ancien + c.nouveau, 0);
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

    window.CorrectionDA = { FAMILLES, GLOBALES, MARQUE, transformer, compter, passeABlanc, refus, corriger, clesDuTrimestre };
})();
