/**
 * materiel-creation.js — « Apporter mon matériel », lot 2 : les TROIS ÉCRITURES de « Créer ma
 * grille ».
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-2.md`, §2.
 *
 * Ce qui s'écrit, dans le trimestre actif (`cle(...)`), par `db.modifier`, dans cet ordre :
 *   1. l'échelle   → cle('echellesTemplates')
 *   2. la grille   → cle('grillesTemplates')
 *   3. la cartouche → cle('cartouches_<grilleId>'), seulement pour des rétroactions.
 * Une grille en points (étape 5 du plan « prêt pour lundi ») : la grille seule.
 * Les objets sont construits par `materielAssistant.construire` (fonction pure).
 *
 * ⛔ AUCUN OBJET EXISTANT N'EST MODIFIÉ. Chaque mutateur AJOUTE un objet neuf, et refuse
 * (lève) si son identifiant est déjà pris : la présence se vérifie dans la file, à l'instant
 * de l'écriture (#599).
 * ⚠ UNE EXCEPTION, NOMMÉE (étape 5 du critère algorithmique, 22 oct. 2026, option A tranchée par
 * Cowork) : `ajouterCodes` pose une liste de codes collée dans un critère algorithmique EXISTANT qui
 * n'en a AUCUN — ses sous-critères, vides, deviennent la liste. Rien d'autre du critère ni de la grille
 * ne change ; un critère qui a déjà des codes ou des sous-critères est refusé, vérifié dans la file, à
 * l'instant de l'écriture.
 *
 * Aucun objet partiel ne reste visible : trois clés ne s'écrivent pas en une transaction, alors
 * une écriture qui échoue fait DÉFAIRE celles qui l'ont précédée, en ordre inverse (chaque
 * retrait ne retire que l'identifiant qu'on vient de créer). Si un retrait échoue lui aussi,
 * le message le dit et nomme ce qui pourrait rester : jamais un échec muet.
 *
 * Refus clairs, avant toute écriture : aucun trimestre actif (`cle()` retombe alors sur la clé
 * nue, comme le savent les semeurs de départ, #358), ou un trimestre clos (lecture seule).
 * Textes de Claude Code, 17 oct. 2026, PROVISOIRES (relus au lot 3) ; celui du trimestre clos est de Cowork.
 */
(function () {
    'use strict';

    var C = {};

    C.MESSAGES = {
        sansTrimestre: 'Aucun trimestre n’est ouvert : la grille n’a nulle part où être rangée. Ouvre ton trimestre, puis reviens la créer ; ce que tu as saisi reste ici tant que la page reste ouverte.',
        // « clos » et non « archivé » (relecture de Cowork, 17 oct.) : `estTrimestreArchive()` lit un trimestre
        // CLOS, gelé en lecture seule ; « archivé » veut dire déposé hors du navigateur (vocabulaire de Grégoire).
        clos: 'Le trimestre ouvert est clos : il se consulte sans se modifier. Ouvre un trimestre en cours, puis reviens créer ta grille.',
        echec: 'La création n’a pas abouti, et rien n’a été créé. Tu pourrais réessayer.',
        echecPartiel: 'La création n’a pas abouti, et l’application n’a pas pu retirer tout ce qu’elle venait d’écrire. Il pourrait rester : '
    };

    function lireNoms(cleCollection) {
        try { return (db.getSync(cleCollection, []) || []).map(function (o) { return o && o.nom; }).filter(Boolean); } catch (err) { return []; }
    }

    /** L'auteur et la licence, comme les créations à la main (grilles.js, echelles.js, cartouches.js). */
    function contexte(cles) {
        var ctx = { id: window.genererIdUnique, maintenant: new Date().toISOString(), nomsEchelles: lireNoms(cles.echelles) };
        try {
            if (window.BibliothequeUI && typeof window.BibliothequeUI.obtenirAuteurActif === 'function') ctx.auteur = window.BibliothequeUI.obtenirAuteurActif();
        } catch (err) { /* sans auteur, l'objet reste valide */ }
        if (typeof window.obtenirIdentiteCCUtilisateur === 'function') {
            ctx.metadataCc = { auteur_original: window.obtenirIdentiteCCUtilisateur(), date_creation: ctx.maintenant.split('T')[0], contributeurs: [] };
        }
        return ctx;
    }

    /** Ajoute UN objet neuf ; lève si son identifiant existe déjà (rien n'est alors écrit). */
    C.ajouter = function (cleCollection, objet) {
        return db.modifier(cleCollection, function (lues) {
            var liste = Array.isArray(lues) ? lues : [];
            if (liste.some(function (o) { return o && o.id === objet.id; })) throw new Error('Identifiant déjà pris : ' + objet.id);
            return liste.concat([objet]);
        }, []);
    };

    /** Retire UN objet par son identifiant ; ne touche à rien d'autre. */
    C.retirer = function (cleCollection, id) {
        return db.modifier(cleCollection, function (lues) {
            if (!Array.isArray(lues) || !lues.some(function (o) { return o && o.id === id; })) return undefined;
            return lues.filter(function (o) { return !(o && o.id === id); });
        }, []);
    };

    /** Défait les écritures faites, en ordre inverse ; rend les noms de ce qui n'a pas pu partir. */
    async function defaire(ecrites) {
        var restes = [];
        for (var k = ecrites.length - 1; k >= 0; k--) {
            try { await C.retirer(ecrites[k].cle, ecrites[k].objet.id); } catch (err) {
                console.error('[materiel] retrait impossible après un échec de création', ecrites[k].objet.id, err);
                restes.push('« ' + ecrites[k].objet.nom + ' »');
            }
        }
        return restes;
    }

    function resumer(m, o) {
        return {
            nom: o.grille.nom,
            nbC: o.grille.criteres.length,
            // #1125 : un barème décrit ses tranches comme des descripteurs décrivent leurs niveaux.
            descr: o.grille.criteres.some(function (c) { return !!c.descripteurs || Array.isArray(c.bareme); }),
            // Lot 3b1 : les boutons « La voir dans … » de la confirmation ouvrent ces objets-ci.
            ids: { grille: o.grille.id, echelle: o.echelle ? o.echelle.id : null },
            // Étape 5 : une grille en points, et son total (« sur 64 »).
            enPoints: !o.echelle,
            totalPoints: o.echelle ? null : o.grille.criteres.reduce(function (t, c) { return t + (c.ponderation == null ? 0 : c.ponderation); }, 0),
            // La dissection, lot 9 : les critères créés sans pondération (`null`), à compléter dans Grilles de critères.
            aCompleter: o.grille.criteres.filter(function (c) { return c.ponderation == null; }).length,
            niveaux: m.niveaux.map(function (n) {
                return String(n.titre.valeur).trim() + ' (' + String(n.min.valeur).trim() + ' à ' + String(n.max.valeur).trim() + ' %)';
            })
        };
    }

    /**
     * Crée l'échelle et la grille d'un modèle complet ; une grille en points, seule.
     * @param {Object} m - modèle de l'assistant, sans manque (`materielAssistant.calculs`)
     * @returns {Promise<{objets: Object, resume: Object}|{erreur: string}>}
     */
    C.creer = async function (m) {
        if (typeof window.cle !== 'function' || window.cle('grillesTemplates') === 'grillesTemplates') return { erreur: C.MESSAGES.sansTrimestre };
        if (typeof window.estTrimestreArchive === 'function' && window.estTrimestreArchive()) return { erreur: C.MESSAGES.clos };
        // Les clés sont figées une fois : les trois objets vont dans le MÊME trimestre.
        var cles = { echelles: window.cle('echellesTemplates'), grilles: window.cle('grillesTemplates') };
        var o = window.materielAssistant.construire(m, contexte(cles));
        var plan = (o.echelle ? [{ cle: cles.echelles, objet: o.echelle }] : []).concat([{ cle: cles.grilles, objet: o.grille }]);
        var ecrites = [];
        try {
            for (var k = 0; k < plan.length; k++) {
                await C.ajouter(plan[k].cle, plan[k].objet);
                ecrites.push(plan[k]);
            }
        } catch (err) {
            console.error('[materiel] création interrompue', err);
            var restes = await defaire(ecrites);
            return { erreur: restes.length ? C.MESSAGES.echecPartiel + restes.join(', ') + '.' : C.MESSAGES.echec };
        }
        return { objets: o, resume: resumer(m, o) };
    };

    // Étape 5 du critère algorithmique : textes de Claude Code, validés par Grégoire le 22 oct. 2026 (retouches de Cowork comprises).
    C.MESSAGES_CODES = {
        introuvable: 'Ce critère n’est plus là : rien n’a été ajouté. Choisis-en un autre.',
        refuse: function (motif) { return 'Rien n’a été ajouté. ' + motif + '.'; },
        echec: 'L’ajout n’a pas abouti ; rien n’a été ajouté. Réessaie.'
    };

    /** Les règles de `destinationsCodes` : le critère qui reçoit les codes (#1132) et la marque d'un critère né depuis le 21 oct. */
    C.reglesCodes = function () {
        return {
            critereQuiRecoit: function (g) { return window.enoncesAlgo ? window.enoncesAlgo.critereAlgorithmique(g) : null; },
            marque: window.codesAnnotation ? window.codesAnnotation.MARQUE : 'codesSousCriteresSeulement'
        };
    };

    /**
     * Pose `codes` ([{ code, nom, poids, commentaire }], `materielDissectionLecture.codesCompris`) comme
     * sous-critères du critère `critereId` de la grille `grilleId` : `{ code, nom, ponderation, retroaction }`,
     * la forme de `ajouterSousCritere` (grilles.js). Le commentaire passe TEL QUEL dans `retroaction`.
     * Le droit d'y écrire (`destinationsCodes`) se vérifie de nouveau dans la file : une liste ne remplace
     * jamais rien, même collée deux fois.
     * @returns {Promise<{resume: {grille: string, critere: string, nombre: number}}|{erreur: string}>}
     */
    C.ajouterCodes = async function (grilleId, critereId, codes) {
        if (typeof window.cle !== 'function' || window.cle('grillesTemplates') === 'grillesTemplates') return { erreur: C.MESSAGES.sansTrimestre };
        if (typeof window.estTrimestreArchive === 'function' && window.estTrimestreArchive()) return { erreur: C.MESSAGES.clos };
        var regles = C.reglesCodes(), resume = null, refus = null;
        try {
            await db.modifier(window.cle('grillesTemplates'), function (lues) {
                var liste = Array.isArray(lues) ? lues : [];
                var g = liste.find(function (x) { return x && x.id === grilleId; });
                var dest = g ? window.materielDissectionLecture.destinationsCodes([g], regles).find(function (d) { return d.critereId === critereId; }) : null;
                if (!dest) { refus = C.MESSAGES_CODES.introuvable; return undefined; }
                if (dest.motif) { refus = C.MESSAGES_CODES.refuse(dest.motif); return undefined; }
                var copie = JSON.parse(JSON.stringify(g));
                var c = copie.criteres.find(function (x) { return x && x.id === critereId; });
                c.sousCriteres = codes.map(function (k) {
                    return { id: window.genererIdUnique('SC_'), code: k.code, nom: k.nom, ponderation: k.poids, retroaction: k.commentaire };
                });
                resume = { grille: dest.grille, critere: dest.critere, nombre: codes.length };
                return liste.map(function (x) { return x === g ? copie : x; });
            }, []);
        } catch (err) {
            console.error('[materiel] ajout des codes interrompu', err);
            return { erreur: C.MESSAGES_CODES.echec };
        }
        return refus ? { erreur: refus } : { resume: resume };
    };

    window.materielCreation = C;
})();
