/**
 * trust-tofu.js — Lot T : confiance TOFU (Trust On First Use)
 *
 * Chantier #329 Voûte Phase 1, lot T (décision D3 du 11 mai 2026,
 * variante B : TOFU par défaut, WoT progressif opt-in post-pilote).
 * Plan canonique : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`.
 *
 * Rôle : lier un NOM D'AUTEUR à une CLÉ PUBLIQUE de signature. La
 * signature (lot F) garantit que le package n'a pas été altéré et
 * qu'il vient du détenteur de la clé ; le TOFU répond à la question
 * suivante : « cette clé est-elle bien celle de la personne nommée ? »
 *  - premier import d'un auteur → 'nouveau' (clé mémorisée à l'accept)
 *  - même auteur, même clé      → 'verifiee'
 *  - même auteur, AUTRE clé     → 'cle_changee' (ALERTE BLOQUANTE)
 *
 * LIMITE ASSUMÉE DU MODÈLE (à documenter au guide, P7) : le premier
 * contact piégé reste possible — TOFU ne garantit rien la première
 * fois, seulement la CONTINUITÉ d'identité ensuite. Les textes UI le
 * disent honnêtement (TEXTES_CONFIANCE.nouveau).
 *
 * STOCKAGE : clé GLOBALE `clesConnues` via db.js (PAS namespacée par
 * trimestre — la confiance en une personne ne dépend pas du trimestre).
 * Propriétaire : ce module (docs/DATA-OWNERSHIP.md). Chaque fiche
 * prévoit `signaturesWoT: []` — structure du WoT progressif (D3),
 * UI reportée post-pilote, aucune écriture avant le lot T2.
 *
 * SÉCURITÉ : les noms d'auteurs viennent de packages IMPORTÉS — la
 * modale est construite en API DOM pure avec textContent, AUCUN
 * innerHTML dans ce module (rien à échapper, rien à oublier d'échapper).
 * Pas de handler inline (CSP), écouteur clavier défensif (auto-détaché
 * si la modale a disparu du DOM).
 *
 * Tests : tests/unit/trust-tofu-T.test.js (3 états, normalisation,
 * persistance, remplacement de clé) + window._testTrustTofu() et
 * window._demoAlerteCleChangee() (terrain Safari).
 */
(function () {
    'use strict';

    var trustTofu = {};

    var CLE_REGISTRE = 'clesConnues'; // globale, jamais via window.cle()

    // ------------------------------------------------------------------
    // Textes UI — français clair, tutoiement (convention du projet)
    // ------------------------------------------------------------------
    // {nom}, {nbImports}, {premierContact} sont substitués par les vues.
    trustTofu.TEXTES_CONFIANCE = {
        verifiee: 'Signature vérifiée : la clé correspond à celle de tes imports précédents de {nom}.',
        nouveau: 'Premier import signé par {nom}. Sa clé de signature sera mémorisée : '
            + 'les prochains packages de cette personne devront porter la même. '
            + 'Labo Codex ne peut pas garantir une identité au premier contact — '
            + 'en cas de doute, confirme avec la personne par un autre canal.',
        cle_changee_titre: 'La clé de signature a changé',
        cle_changee: 'Ce package se présente comme venant de {nom}, mais sa signature '
            + 'ne correspond pas à la clé mémorisée depuis ton premier import '
            + 'du {premierContact} ({nbImports} import(s) accepté(s)).',
        cle_changee_causes: 'Deux explications possibles : {nom} a changé d\'appareil ou '
            + 'perdu sa clé… ou quelqu\'un tente de se faire passer pour cette personne.',
        cle_changee_consigne: 'Ne fais confiance à la nouvelle clé que si tu as confirmé '
            + 'le changement avec {nom} par un autre canal (courriel, téléphone, en personne).',
        indeterminable: 'Ce package ne porte pas les informations nécessaires à la '
            + 'vérification de confiance (auteur ou clé publique manquants).'
    };

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Normalise un nom d'auteur pour servir d'index du registre :
     * Unicode NFC (macOS produit du NFD : « é » décomposé ≠ composé),
     * espaces réduits, minuscules. Empêche de contourner le TOFU en
     * variant la casse ou les espaces d'un nom connu.
     */
    function normaliserNomAuteur(nom) {
        return String(nom).normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
    }
    trustTofu.normaliserNomAuteur = normaliserNomAuteur;

    function lireRegistre() {
        var brut = (typeof db !== 'undefined' && db.getSync) ? db.getSync(CLE_REGISTRE, null) : null;
        if (!brut || typeof brut !== 'object' || typeof brut.auteurs !== 'object' || brut.auteurs === null) {
            return { version: 1, auteurs: {} };
        }
        return brut;
    }

    function ecrireRegistre(registre) {
        if (typeof db === 'undefined' || !db.setSync) {
            throw new Error('[trust-tofu] db indisponible — registre non persistable');
        }
        db.setSync(CLE_REGISTRE, registre);
    }

    function extraireIdentite(pkg) {
        var manifest = pkg && pkg.manifest;
        var nom = manifest && manifest.auteur && manifest.auteur.nom;
        var clePublique = manifest && manifest.clePublique;
        if (!nom || typeof nom !== 'string' || !clePublique || typeof clePublique !== 'string') {
            return null;
        }
        return { nom: nom, clePublique: clePublique };
    }

    // ------------------------------------------------------------------
    // API registre
    // ------------------------------------------------------------------

    /**
     * Vérifie la confiance TOFU d'un package (LECTURE SEULE — la
     * mémorisation est un acte séparé, posé quand l'utilisateur ACCEPTE
     * l'import : memoriserContact). Retourne :
     *   { statut: 'indeterminable' | 'nouveau' | 'verifiee' | 'cle_changee',
     *     auteur?, clePresentee?, fiche? (clone de la fiche connue) }
     */
    trustTofu.verifierConfianceTOFU = function (pkg) {
        var identite = extraireIdentite(pkg);
        if (!identite) {
            return { statut: 'indeterminable' };
        }
        var registre = lireRegistre();
        var fiche = registre.auteurs[normaliserNomAuteur(identite.nom)];
        if (!fiche) {
            return { statut: 'nouveau', auteur: identite.nom, clePresentee: identite.clePublique };
        }
        var ficheClone = JSON.parse(JSON.stringify(fiche));
        if (fiche.clePubliqueB64 === identite.clePublique) {
            return { statut: 'verifiee', auteur: identite.nom, fiche: ficheClone };
        }
        return {
            statut: 'cle_changee',
            auteur: identite.nom,
            clePresentee: identite.clePublique,
            fiche: ficheClone
        };
    };

    /**
     * Mémorise (ou confirme) le contact APRÈS qu'un import a été accepté.
     *  - auteur inconnu  → fiche créée (c'est le « First Use » du TOFU)
     *  - même clé        → dernierContact + nbImports
     *  - clé DIFFÉRENTE  → Error, SAUF options.remplacerCle === true
     *    (le remplacement exige le choix explicite de l'utilisateur —
     *    critère 19 du plan ; l'ancienne clé est conservée en trace).
     * Retourne la fiche persistée (clone).
     */
    trustTofu.memoriserContact = function (pkg, options) {
        options = options || {};
        var identite = extraireIdentite(pkg);
        if (!identite) {
            throw new Error('[trust-tofu] Package sans auteur ou sans clé publique — mémorisation impossible');
        }
        var maintenant = new Date().toISOString();
        var registre = lireRegistre();
        var index = normaliserNomAuteur(identite.nom);
        var fiche = registre.auteurs[index];

        if (!fiche) {
            fiche = {
                nom: identite.nom.normalize('NFC').replace(/\s+/g, ' ').trim(),
                clePubliqueB64: identite.clePublique,
                premierContact: maintenant,
                dernierContact: maintenant,
                nbImports: 1,
                signaturesWoT: [] // structure WoT progressif (D3) — UI post-pilote
            };
        } else if (fiche.clePubliqueB64 === identite.clePublique) {
            fiche.dernierContact = maintenant;
            fiche.nbImports = (fiche.nbImports || 0) + 1;
        } else if (options.remplacerCle === true) {
            fiche.anciennesCles = fiche.anciennesCles || [];
            fiche.anciennesCles.push({ clePubliqueB64: fiche.clePubliqueB64, remplaceeLe: maintenant });
            fiche.clePubliqueB64 = identite.clePublique;
            fiche.dernierContact = maintenant;
            fiche.nbImports = (fiche.nbImports || 0) + 1;
        } else {
            throw new Error('[trust-tofu] Clé différente de la clé connue pour « ' + identite.nom
                + ' » — remplacement refusé sans choix explicite (options.remplacerCle)');
        }

        registre.auteurs[index] = fiche;
        ecrireRegistre(registre);
        return JSON.parse(JSON.stringify(fiche));
    };

    /** Liste les fiches connues (clones) — futur panneau « Confiances ». */
    trustTofu.listerAuteursConnus = function () {
        var registre = lireRegistre();
        return Object.keys(registre.auteurs).map(function (k) {
            return JSON.parse(JSON.stringify(registre.auteurs[k]));
        });
    };

    /** Retire un auteur du registre (modération manuelle, D4). */
    trustTofu.oublierAuteur = function (nom) {
        var registre = lireRegistre();
        var index = normaliserNomAuteur(nom);
        if (!registre.auteurs[index]) return false;
        delete registre.auteurs[index];
        ecrireRegistre(registre);
        return true;
    };

    // ------------------------------------------------------------------
    // Alerte bloquante « clé changée »
    // ------------------------------------------------------------------

    /**
     * Substitution TEXTE PUR des gabarits {nom}/{nbImports}/{premierContact}.
     * Aucun échappement requis : le résultat n'entre dans le DOM que par
     * textContent (jamais innerHTML).
     */
    function substituer(gabarit, resultat) {
        var fiche = resultat.fiche || {};
        var premierContact = fiche.premierContact
            ? String(fiche.premierContact).slice(0, 10)
            : 'date inconnue';
        return gabarit
            .replace(/\{nom\}/g, String(resultat.auteur || ''))
            .replace(/\{nbImports\}/g, String(fiche.nbImports || 0))
            .replace(/\{premierContact\}/g, premierContact);
    }

    /**
     * Affiche l'alerte BLOQUANTE de changement de clé (critère 19 : choix
     * utilisateur requis). Retourne une Promise résolue avec :
     *   'refuser'         — défaut : ESC, clic hors de la carte, bouton Refuser
     *   'faire_confiance' — choix explicite de la nouvelle clé
     * La modale est construite à l'appel (API DOM + textContent : le nom
     * d'auteur vient d'un package importé, AUCUN innerHTML dans ce module)
     * et retirée du DOM à la fermeture. Style : .modal-overlay/.modal-contenu
     * du design system — PAS le style des alertes RaI (consigne du plan).
     */
    trustTofu.demanderDecisionCleChangee = function (resultat) {
        return new Promise(function (resolve) {
            var textes = trustTofu.TEXTES_CONFIANCE;

            function el(balise, classe, texte) {
                var noeud = document.createElement(balise);
                if (classe) noeud.className = classe;
                if (texte) noeud.textContent = texte;
                return noeud;
            }

            var overlay = el('div', 'modal-overlay');
            overlay.id = 'modalConfianceCleChangee';

            var carte = el('div', 'modal-contenu modal-compact');
            carte.setAttribute('role', 'dialog');
            carte.setAttribute('aria-modal', 'true');
            carte.setAttribute('aria-labelledby', 'titreConfianceCleChangee');

            var titre = el('h2', 'modal-titre', '⚠ ' + textes.cle_changee_titre);
            titre.id = 'titreConfianceCleChangee';
            carte.appendChild(titre);
            carte.appendChild(el('p', null, substituer(textes.cle_changee, resultat)));
            carte.appendChild(el('p', null, substituer(textes.cle_changee_causes, resultat)));
            var consigne = el('p');
            consigne.appendChild(el('strong', null, substituer(textes.cle_changee_consigne, resultat)));
            carte.appendChild(consigne);

            var actions = el('div', 'modal-actions-centre');
            var btnRefuser = el('button', 'btn btn-principal', 'Refuser l\'import');
            btnRefuser.type = 'button';
            btnRefuser.setAttribute('data-decision', 'refuser');
            var btnConfiance = el('button', 'btn btn-danger', 'Faire confiance à la nouvelle clé');
            btnConfiance.type = 'button';
            btnConfiance.setAttribute('data-decision', 'faire_confiance');
            actions.appendChild(btnRefuser);
            actions.appendChild(btnConfiance);
            carte.appendChild(actions);
            overlay.appendChild(carte);

            function conclure(decision) {
                document.removeEventListener('keydown', surClavier);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                resolve(decision);
            }

            // Écouteur global défensif : si la modale a disparu du DOM par un
            // autre chemin, se détacher au lieu d'agir (convention projet).
            function surClavier(e) {
                if (!document.body.contains(overlay)) {
                    document.removeEventListener('keydown', surClavier);
                    return;
                }
                if (e.key === 'Escape') conclure('refuser');
            }

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) {
                    conclure('refuser'); // clic hors carte = refus (défaut sûr)
                    return;
                }
                var bouton = e.target.closest ? e.target.closest('[data-decision]') : null;
                if (bouton) conclure(bouton.getAttribute('data-decision'));
            });
            document.addEventListener('keydown', surClavier);

            document.body.appendChild(overlay);
            overlay.classList.add('actif');
            btnRefuser.focus(); // a11y : focus sur l'action par défaut
        });
    };

    // ------------------------------------------------------------------
    // Tests console terrain (Safari)
    // ------------------------------------------------------------------

    /**
     * Valide le registre TOFU dans la console (8 scénarios). Utilise un
     * auteur de test dédié et NETTOIE sa fiche à la fin — le registre
     * réel n'est pas affecté.
     */
    window._testTrustTofu = function () {
        var resultats = [];
        function noter(nom, ok, detail) {
            resultats.push({ test: nom, ok: ok, detail: detail || '' });
        }
        function paquet(nom, cle) {
            return { manifest: { auteur: { nom: nom }, clePublique: cle, signature: 'x', algorithme: 'ECDSA-P256-SHA-256' } };
        }
        var AUTEUR = 'Test TOFU — auteur jetable';
        trustTofu.oublierAuteur(AUTEUR); // état propre même après un run interrompu

        var v = trustTofu.verifierConfianceTOFU(paquet(AUTEUR, 'CLE_A'));
        noter('1. auteur inconnu → nouveau', v.statut === 'nouveau', v.statut);
        trustTofu.memoriserContact(paquet(AUTEUR, 'CLE_A'));
        v = trustTofu.verifierConfianceTOFU(paquet(AUTEUR, 'CLE_A'));
        noter('2. même clé après mémorisation → verifiee', v.statut === 'verifiee', v.statut);
        v = trustTofu.verifierConfianceTOFU(paquet('  test tofu — AUTEUR JETABLE ', 'CLE_A'));
        noter('3. casse/espaces ≠ → toujours verifiee (normalisation)', v.statut === 'verifiee', v.statut);
        v = trustTofu.verifierConfianceTOFU(paquet(AUTEUR, 'CLE_B'));
        noter('4. autre clé → cle_changee', v.statut === 'cle_changee', v.statut);
        var aRefuse = false;
        try { trustTofu.memoriserContact(paquet(AUTEUR, 'CLE_B')); } catch (e) { aRefuse = true; }
        noter('5. mémoriser une autre clé sans choix explicite → refusé', aRefuse);
        trustTofu.memoriserContact(paquet(AUTEUR, 'CLE_B'), { remplacerCle: true });
        v = trustTofu.verifierConfianceTOFU(paquet(AUTEUR, 'CLE_B'));
        noter('6. remplacement explicite → verifiee sur la nouvelle clé', v.statut === 'verifiee', v.statut);
        var fiche = trustTofu.listerAuteursConnus().filter(function (f) {
            return normaliserNomAuteur(f.nom) === normaliserNomAuteur(AUTEUR);
        })[0];
        noter('7. ancienne clé tracée (anciennesCles)', !!(fiche && fiche.anciennesCles && fiche.anciennesCles.length === 1));
        v = trustTofu.verifierConfianceTOFU({ manifest: { auteur: {}, clePublique: null } });
        noter('8. package sans identité → indeterminable', v.statut === 'indeterminable', v.statut);

        trustTofu.oublierAuteur(AUTEUR);
        var verts = resultats.filter(function (r) { return r.ok; }).length;
        console.warn('[_testTrustTofu] ' + verts + '/' + resultats.length + ' verts (registre nettoyé)');
        console.table(resultats);
        return resultats;
    };

    /**
     * Démo visuelle de l'alerte bloquante (vérifier les DEUX modes,
     * sombre et clair). N'écrit rien : la décision est seulement loguée.
     */
    window._demoAlerteCleChangee = function () {
        return trustTofu.demanderDecisionCleChangee({
            statut: 'cle_changee',
            auteur: 'Marie-Hélène <script>Tremblay</script>', // doit s'afficher tel quel (textContent)
            clePresentee: 'CLE_B',
            fiche: { nom: 'Marie-Hélène Tremblay', clePubliqueB64: 'CLE_A', premierContact: '2026-05-12T10:00:00Z', nbImports: 3 }
        }).then(function (decision) {
            console.warn('[_demoAlerteCleChangee] décision :', decision);
            return decision;
        });
    };

    window.trustTofu = trustTofu;
})();
