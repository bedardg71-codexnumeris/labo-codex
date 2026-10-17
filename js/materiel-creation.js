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
 * Les objets sont construits par `materielAssistant.construire` (fonction pure).
 *
 * ⛔ AUCUN OBJET EXISTANT N'EST MODIFIÉ. Chaque mutateur AJOUTE un objet neuf, et refuse
 * (lève) si son identifiant est déjà pris : la présence se vérifie dans la file, à l'instant
 * de l'écriture (#599).
 *
 * Aucun objet partiel ne reste visible : trois clés ne s'écrivent pas en une transaction, alors
 * une écriture qui échoue fait DÉFAIRE celles qui l'ont précédée, en ordre inverse (chaque
 * retrait ne retire que l'identifiant qu'on vient de créer). Si un retrait échoue lui aussi,
 * le message le dit et nomme ce qui pourrait rester : jamais un échec muet.
 *
 * Refus clairs, avant toute écriture : aucun trimestre actif (`cle()` retombe alors sur la clé
 * nue, comme le savent les semeurs de départ, #358), ou un trimestre archivé (lecture seule).
 * Textes de Claude Code, 17 oct. 2026, PROVISOIRES (relus au lot 3).
 */
(function () {
    'use strict';

    var C = {};

    C.MESSAGES = {
        sansTrimestre: 'Aucun trimestre n’est ouvert : la grille n’a nulle part où être rangée. Ouvre ton trimestre, puis reviens la créer ; ce que tu as saisi reste ici tant que la page reste ouverte.',
        archive: 'Le trimestre ouvert est archivé, en lecture seule : rien ne peut y être créé. Ouvre ton trimestre en cours, puis reviens créer ta grille.',
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
            retro: !!o.cartouche,
            descr: o.grille.criteres.some(function (c) { return !!c.descripteurs; }),
            niveaux: m.niveaux.map(function (n) {
                return String(n.titre.valeur).trim() + ' (' + String(n.min.valeur).trim() + ' à ' + String(n.max.valeur).trim() + ' %)';
            })
        };
    }

    /**
     * Crée l'échelle, la grille et (rétroactions) la cartouche d'un modèle complet.
     * @param {Object} m - modèle de l'assistant, sans manque (`materielAssistant.calculs`)
     * @returns {Promise<{objets: Object, resume: Object}|{erreur: string}>}
     */
    C.creer = async function (m) {
        if (typeof window.cle !== 'function' || window.cle('grillesTemplates') === 'grillesTemplates') return { erreur: C.MESSAGES.sansTrimestre };
        if (typeof window.estTrimestreArchive === 'function' && window.estTrimestreArchive()) return { erreur: C.MESSAGES.archive };
        // Les clés sont figées une fois : les trois objets vont dans le MÊME trimestre.
        var cles = { echelles: window.cle('echellesTemplates'), grilles: window.cle('grillesTemplates') };
        var o = window.materielAssistant.construire(m, contexte(cles));
        var plan = [{ cle: cles.echelles, objet: o.echelle }, { cle: cles.grilles, objet: o.grille }];
        if (o.cartouche) plan.push({ cle: window.cle('cartouches_' + o.grille.id), objet: o.cartouche });
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

    window.materielCreation = C;
})();
