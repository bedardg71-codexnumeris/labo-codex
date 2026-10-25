/* ===============================
   MODULE: TRIMESTRE V2 — LISTE TRIMESTRES
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 946-1394 (zone 2 MODULES-MAP §2.4).

   Périmètre : dropdown trimestre + liste gestion + archivage + bibliothèque
   + modal nouveau trimestre (11 fonctions).

   Dépendances cross-module accédées via `window.X` (résidu chargé AVANT) :
   - Zone 1 : `chargerIdentificationTrimestreV2`, `chargerCadreCalendrierV2`,
     `chargerJourneesSansCoursV2` (fusion #374),
     `afficherStatistiquesTrimestreV2`
   - Zone 3 : `chargerDropdownCoursV2`
   - Zone 8 : `peuplerDropdownGroupeCoursActif`
   =============================== */

(function() {
'use strict';

/* ===============================
   DROPDOWN TRIMESTRE
   =============================== */

/**
 * #928 (20 sept. 2026) — L'ORDRE DU CALENDRIER, pas celui de la création. Le registre garde l'ordre où les
 * trimestres ont été créés : A2024, reconstruit le 18 sept., arrivait après A2026 (capture de Grégoire).
 * Année, puis session dans l'année (Hiver, Été, Automne) — un tri alphabétique du nom mettrait « Hiver 2026 »
 * après « Automne 2026 ». Un trimestre sans année lisible (la démonstration) va à la fin, dans son ordre.
 * Rend une COPIE : le registre stocké n'est jamais réordonné.
 * @param {Array<{id:string, annee?:number, session?:string}>} trimestres
 * @returns {Array}
 */
function trierTrimestresChronologique(trimestres) {
    const RANG_SESSION = { H: 0, E: 1, A: 2 };
    const moment = (t) => {
        const parId = /^([ahe])(\d{4})$/i.exec(String((t && t.id) || ''));
        const annee = Number(t && t.annee) || (parId ? Number(parId[2]) : null);
        const session = String((t && t.session) || (parId ? parId[1] : '')).charAt(0).toUpperCase();
        if (!annee || !(session in RANG_SESSION)) return null;
        return annee * 10 + RANG_SESSION[session];
    };
    return (trimestres || [])
        .map((t, index) => ({ t, index, moment: moment(t) }))
        .sort((a, b) => {
            if (a.moment === null || b.moment === null) {
                if (a.moment === b.moment) return a.index - b.index;
                return a.moment === null ? 1 : -1;
            }
            return (a.moment - b.moment) || (a.index - b.index);
        })
        .map((x) => x.t);
}

/**
 * Popule le dropdown de sélection du trimestre depuis le registre
 */
function populerDropdownTrimestreV2() {
    const select = document.getElementById('selectTrimestreActif');
    if (!select) return;

    // Lire le registre des trimestres (de trimestres.js)
    let trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    // 🆕 FIX (23 jan 2026): En mode Normal, masquer le trimestre Démonstration
    // — mais pas quand la route démo est active (entrerEnDemo force mode=normal
    // pour désactiver l'anonymisation, il faut donc laisser passer demo si
    // demo-actif est true, sinon la démo tourne sans trimestre visible).
    const modeActuel = typeof window.modeActuel !== 'undefined' ? window.modeActuel : 'normal';
    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    if (modeActuel === 'normal' && !enDemo) {
        trimestres = trimestres.filter(t => t.id !== 'demo');
    }

    select.innerHTML = '';

    if (trimestres.length === 0) {
        // Aucun trimestre dans le registre - afficher un placeholder
        select.innerHTML = '<option value="">Aucun trimestre configuré</option>';
        return;
    }

    // Ajouter chaque trimestre du registre, dans l'ordre du calendrier (#928)
    trierTrimestresChronologique(trimestres).forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.nom;
        option.selected = (trimestreActif && t.id === trimestreActif.id);
        select.appendChild(option);
    });

    // 🆕 FIX (23 jan 2026): Forcer la valeur du select au trimestre actif
    if (trimestreActif) {
        select.value = trimestreActif.id;
    }

}

/**
 * Confirme et clôt un trimestre (« Clore », menu ⋮ d'un trimestre disponible).
 *
 * 14 oct. 2026 (consigne de Cowork, décision de Grégoire de clore l'hiver 2026) : « Clore » et
 * « Rouvrir » parlent par les fenêtres et les notifications de l'application, plus par
 * confirm/alert — les derniers de #1037, laissés au moratoire #622. Les mots sont ceux d'avant,
 * sans retouche ; le bouton de confirmation porte le nom du geste du menu.
 */
async function confirmerArchivage(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    if (!trimestre) {
        notifications.erreur('Trimestre non trouvé');
        return;
    }

    const confirme = await uiDialogues.confirmerAction({
        titre: `Clore le trimestre "${trimestre.nom}" ?`,
        message: `Un trimestre clos passe en lecture seule et ne peut plus être modifié.\n` +
            `Cette action est réversible par le bouton « Rouvrir ».`,
        preformate: true,
        texteConfirmer: 'Clore'
    });

    if (confirme) {
        const result = archiverTrimestre(id);
        if (result.success) {
            notifications.succes(`Trimestre "${trimestre.nom}" clos.`);
            rafraichirBibliothequeTrimestres();
        } else {
            // Un refus de clôture remplit `message`, pas `error` (#1002).
            notifications.erreur(`Erreur: ${result.error || result.message}`);
        }
    }
}

/**
 * Confirme et rouvre un trimestre clos (« Rouvrir », bouton de la carte close).
 *
 * 14 oct. 2026 : le bouton menait à `desarchiverTrimestre` sans passer par ici — il rouvrait sans
 * rien demander ni rien dire, et la carte restait « Clos » jusqu'à la réouverture de la
 * bibliothèque ; cette confirmation n'avait plus d'appelant. Il y mène de nouveau.
 */
async function confirmerDesarchivage(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    if (!trimestre) {
        notifications.erreur('Trimestre non trouvé');
        return;
    }

    const confirme = await uiDialogues.confirmerAction({
        titre: `Rouvrir le trimestre "${trimestre.nom}" ?`,
        message: `Cela permettra de modifier à nouveau les données de ce trimestre.`,
        texteConfirmer: 'Rouvrir'
    });

    if (confirme) {
        const result = desarchiverTrimestre(id);
        if (result.success) {
            notifications.succes(`Trimestre "${trimestre.nom}" rouvert.`);
            rafraichirBibliothequeTrimestres();
        } else {
            notifications.erreur(`Erreur: ${result.error}`);
        }
    }
}

/** La bibliothèque ouverte se redessine après un geste (même geste que « Supprimer… »). */
function rafraichirBibliothequeTrimestres() {
    populerDropdownTrimestreV2();
    if (document.getElementById('modalBibliothequeTrimestres')) {
        fermerModalBibliothequeTrimestres();
        ouvrirBibliothequeTrimestreV2();
    }
}

/* ===============================
   GESTION DES TRIMESTRES - NOUVEAU LAYOUT (Beta 95.2)
   Pattern : Bibliothèque + Formulaire
   =============================== */

/**
 * Rafraîchit l'affichage du formulaire trimestre actif
 * Le formulaire utilise les mêmes champs que l'ancien "Cadre régulier"
 * donc les fonctions existantes (chargerIdentificationTrimestreV2, etc.) s'appliquent
 * 🆕 BETA 95.2
 */
function afficherFormulaireTrimestreActif() {
    // Les champs du formulaire sont déjà remplis par les fonctions existantes :
    // - window.chargerIdentificationTrimestreV2()
    // - window.chargerCadreCalendrierV2()
    // - window.chargerJourneesSansCoursV2() (fusion #374)
    // - window.afficherStatistiquesTrimestreV2()

    // Cette fonction est appelée pour s'assurer que tout est à jour
}

/**
 * Ouvre la bibliothèque des trimestres (modal ou panel)
 * 🆕 BETA 95.2
 */
function ouvrirBibliothequeTrimestreV2() {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];

    if (trimestres.length === 0) {
        // #1037 (11 oct. 2026) : la notification de l'application, mêmes mots.
        notifications.info('Aucun trimestre dans la bibliothèque.', 'Clique sur « + Nouveau trimestre » pour en créer un.');   // mots de Grégoire, 11 oct. 18 h 02
        return;
    }

    // #1159 (lot 6, 25 oct. 2026) — une seule liste ; les trimestres clos en bas, sous
    // « Clos (n) », replié. Mots proposés par Cowork, validés par Grégoire (25 oct., 19 h 06).
    const trimestresOuverts = trimestres.filter(t => !t.archive);
    const trimestresClos = trimestres.filter(t => t.archive);

    function rangeeTrim(t, estClos) {
        const estActif = !!t.actif;
        let passage = null;
        const menu = [];
        if (estClos) {
            passage = { label: 'Rouvrir', action: 'confirmerDesarchivage', param: t.id, title: 'Restaurer ce trimestre comme actif' };
            // E1 (#1022) : archiver un trimestre clos entier, hors du navigateur (mots dans ReserveTrimestre.MOTS)
            if (window.ReserveTrimestre) {
                menu.push({ label: ReserveTrimestre.MOTS.menu, action: ReserveTrimestre.ACTION, param: t.id, title: ReserveTrimestre.MOTS.menuTitre });
            }
            // #1028 : archiver les copies d'un trimestre clos, ses données restent (mots dans ReserveCopies.MOTS)
            if (window.ReserveCopies && !estActif) {
                menu.push({ label: ReserveCopies.MOTS.menu, action: ReserveCopies.ACTION, param: t.id, title: ReserveCopies.MOTS.menuTitre });
            }
            // E3 (#1024) : renvoyer aux archives un trimestre clos dont l'archive vérifiée le garde (mots dans ReserveRenvoyer.MOTS)
            if (window.ReserveRenvoyer && !estActif) {
                menu.push({ label: ReserveRenvoyer.MOTS.menu, action: ReserveRenvoyer.ACTION, param: t.id, title: ReserveRenvoyer.MOTS.menuTitre });
            }
            // #361 : suppression définitive (jamais sur le trimestre actif)
            if (menu.length) menu.push({ separateur: true });
            menu.push({ label: 'Supprimer…', action: 'confirmerSuppressionTrimestre', param: t.id, classe: 'btn-supprimer', title: 'Effacer définitivement ce trimestre et toutes ses données' });
        } else if (!estActif) {
            passage = { label: 'Activer', action: 'changerTrimestreActifV2', param: t.id, title: 'Définir comme trimestre actif' };
            menu.push({ label: 'Clore', action: 'confirmerArchivage', param: t.id, title: 'Conserver en lecture seule' });
            // #361 : suppression définitive (jamais sur le trimestre actif)
            menu.push({ separateur: true });
            menu.push({ label: 'Supprimer…', action: 'confirmerSuppressionTrimestre', param: t.id, classe: 'btn-supprimer', title: 'Effacer définitivement ce trimestre et toutes ses données' });
        }
        // Actif courant : ni bouton ni ⋮. Ni « Supprimer » (garde anti-actif, #361), ni « Clore » :
        // #1018 (lot 8, décision de Cowork, 11 oct. 2026) — `archiverTrimestre` refuse toujours le
        // trimestre actif ; un geste qui ne peut que refuser ne s'offre pas. Sans geste, la rangée
        // n'a pas de ⋮ (`renderMenuActions` ne dessine rien pour une liste vide).

        return {
            id: t.id,
            nom: t.nom || t.id,
            ligne: estClos ? 'Clos' : (estActif ? 'Actif' : 'Ouvert'),
            passage: passage,
            menu: menu
        };
    }

    BibliothequeUI.creerFenetreListe({
        modalId: 'modalBibliothequeTrimestres',
        titre: 'Bibliothèque des trimestres',
        phrase: 'Active, clos ou rouvre tes trimestres.',
        liste: { vide: 'Aucun trimestre ouvert.', rangees: trimestresOuverts.map(t => rangeeTrim(t, false)) },
        repli: { titre: 'Clos', rangees: trimestresClos.map(t => rangeeTrim(t, true)) }
    });
}

function fermerModalBibliothequeTrimestres() {
    BibliothequeUI.fermerModal('modalBibliothequeTrimestres');
}

// 14 oct. 2026 : `archiverTrimestreActif` est retiré — aucun appelant (ni bouton, ni module), et
// son seul geste, clore le trimestre ACTIF, est toujours refusé par `archiverTrimestre` (#1018).

/**
 * 🆕 #361 (2 juillet 2026) : parcours de suppression DÉFINITIVE d'un trimestre.
 * Remplace le stub supprimerTrimestreActif (retiré — le trimestre ACTIF ne
 * peut justement PAS être supprimé, garde anti-actif dans trimestres.js).
 *
 * Parcours : garde anti-actif → garde du codex → confirmation → confirmation
 * forte (ressaisir le nom exact) → suppression → message d'état.
 *
 * #1007 (2 oct. 2026) — LE FILET EST UN CODEX À PART. Avant les confirmations, un
 * fichier à part, sous un autre nom, que les mises à jour suivantes ne touchent pas
 * (`Codex.ecrireAPartAvantSuppression`) ; il remplace le refus « codex pas à jour » du
 * lot I bis. Seul chemin de suppression d'un trimestre (les quatre boutons
 * « Supprimer… » mènent ici).
 * Banc : tests/integration/1007-codex-a-part-avant-suppression.spec.js.
 */
async function confirmerSuppressionTrimestre(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    // #1037 (11 oct. 2026) — « Supprimer… » parle par les fenêtres et les notifications de
    // l'application, plus par alert/confirm/prompt ; les mots sont ceux d'avant. « Clore » et
    // « Rouvrir » ont suivi le 14 oct. 2026.
    if (!trimestre) {
        notifications.erreur('Trimestre non trouvé');
        return;
    }

    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
    if ((trimestreActif && trimestreActif.id === id) || trimestre.actif === true) {
        notifications.warning(
            'Le trimestre actif ne peut pas être supprimé.',
            'Active un autre trimestre d\'abord, ou clos-le pour le conserver en lecture seule.'
        );
        return;
    }

    // Module du codex absent : rien n'est supprimé (dans le doute, on refuse).
    if (typeof Codex === 'undefined' || !Codex || typeof Codex.ecrireAPartAvantSuppression !== 'function') return;
    const ecrit = await Codex.ecrireAPartAvantSuppression(
        `Supprimer le trimestre « ${trimestre.nom} » efface pour de bon ses étudiant·es, ses évaluations, ses présences, ses productions, ses captures et ses modèles.`
    );
    if (!ecrit) return;

    // Mots validés par Grégoire le 1er oct. 2026 ; la phrase sur le codex à jour est retirée (#1007).
    const continuer = await uiDialogues.confirmerAction({
        titre: `Supprimer définitivement le trimestre « ${trimestre.nom} » ?`,
        message: 'Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles.',
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!continuer) return;

    // Confirmation forte : ressaisir le nom exact du trimestre
    const saisie = await uiDialogues.demanderSaisie({
        titre: 'Confirmation finale : cette action est irréversible.',   // mots de Grégoire, 11 oct. 18 h 02
        message: `Pour supprimer « ${trimestre.nom} » et toutes ses données, retape son nom exactement :`,
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (saisie === null) return; // annulé
    if (saisie.trim() !== trimestre.nom) {
        notifications.erreur('Le nom saisi ne correspond pas. Suppression annulée.');
        return;
    }

    supprimerTrimestre(id).then(function(result) {
        if (result.success) {
            notifications.succes(`Trimestre « ${trimestre.nom} » supprimé (${result.nbCles} clés de données effacées).`);
            rafraichirBibliothequeTrimestres();
        } else {
            notifications.erreur(`Erreur : ${result.error}`);
        }
    }).catch(function(e) {
        notifications.erreur(`Erreur : ${e.message}`);
    });
}

/** #683 : le semis du chargement, rejoué à la bascule, dans le même ordre et sous les mêmes gardes. */
async function semerMaterielDeDepartApresBascule() {
    const archive = !!(window.estTrimestreArchive && window.estTrimestreArchive());
    if (!archive) {
        if (typeof window.assurerGrilleDeDepart === 'function') await window.assurerGrilleDeDepart();
        if (typeof window.assurerEchelleIdmeDeDepart === 'function') await window.assurerEchelleIdmeDeDepart();
    }
    if (typeof window.assurerCartoucheDeDepart === 'function') await window.assurerCartoucheDeDepart();
}

/**
 * Change le trimestre actif et recharge l'interface
 * Délègue à la fonction de trimestres.js
 */
function changerTrimestreActifV2(valeur) {
    if (typeof valeur === 'object' && valeur && valeur.value !== undefined) valeur = valeur.value;

    // Appeler la fonction de trimestres.js
    if (typeof window.changerTrimestreActif === 'function') {
        const success = window.changerTrimestreActif(valeur);

        if (success) {
            // Recharger l'interface complète
            window.chargerIdentificationTrimestreV2();  // 🆕 FIX: Recharger nom, session, année
            window.chargerCadreCalendrierV2();
            window.chargerJourneesSansCoursV2();
            window.afficherStatistiquesTrimestreV2();

            // Rafraîchir le dropdown trimestre et le formulaire
            populerDropdownTrimestreV2();
            afficherFormulaireTrimestreActif();

            // Rafraîchir le dropdown des cours (filtré par trimestre)
            window.chargerDropdownCoursV2();

            // Horaire propre au trimestre (décision 29 mai 2026) : réinitialiser l'éditeur
            // d'horaire sur le nouveau trimestre. Sans ça, l'éditeur restait ouvert sur un
            // horaire de l'ancien trimestre → sauvegarde dans le mauvais namespace (no-op
            // silencieux + perte de la modif).
            if (typeof window.chargerHorairesV2 === 'function') {
                window.chargerHorairesV2();
            }

            // #332 constat 1 — mécanisme B (B2) : réinitialiser AUSSI le formulaire
            // groupe-cours. Sans ça, `groupeCoursEnEditionId` pointait un GC de
            // l'ancien trimestre (absent du nouveau namespace) → la sauvegarde
            // suivante ratait son findIndex en silence (no-op + faux succès).
            // Même geste que la réinitialisation de l'éditeur d'horaire ci-dessus.
            //
            // ⚠⚠ #446 (10 août 2026) — CE CORRECTIF N'AVAIT JAMAIS TOURNÉ.
            // `afficherEtatVideGroupeCoursV2` vit dans `trimestre-v2-groupes-cours.js`,
            // qui est une IIFE, et n'était pas exportée : le `typeof … === 'function'`
            // valait donc FAUX à chaque bascule, et la garde sortait en silence.
            // Constaté au terrain — après un passage H26 → A26, le bloc affichait
            // encore « H2026-601-101-MQ-00008 » alors qu'A26 n'a aucun groupe-cours.
            // La fonction est exportée depuis, et l'appel passe par `window.` : plus
            // de résolution par chaîne de scope, donc plus d'échec muet possible.
            // ⮕ Deuxième fois dans la journée qu'un garde `typeof` sur un nom
            // inaccessible avale un correctif entier (cf. #444, `sauvegarderPreference`).
            if (typeof window.afficherEtatVideGroupeCoursV2 === 'function') {
                window.afficherEtatVideGroupeCoursV2();
            }
            // La carte de résumé de la sidebar est rendue à part : l'état vide ne
            // la touche pas (à l'ANNULATION d'une édition, elle doit rester). Ici,
            // en revanche, le groupe qu'elle décrit appartient au trimestre quitté.
            if (typeof window.mettreAJourCarteResumeGroupeCoursV2 === 'function') {
                window.mettreAJourCarteResumeGroupeCoursV2(null);
            }

            // 🆕 BETA 95.2 : Rafraîchir le dropdown groupe-cours actif
            // ⚠⚠ #466/CT-05 (21 août 2026) — LES TROIS GARDES CI-DESSOUS ÉTAIENT
            // MORTS : ils testaient le nom NU (`typeof peuplerDropdown… `) alors
            // que les trois fonctions vivent dans des IIFE (orchestre, contexte,
            // trimestres) et ne sont accessibles que par `window.`. À CHAQUE
            // bascule : pas de restauration du groupe-cours actif (le pointeur
            // restait null — volet 2 de CT-05), pas de rafraîchissement des vues,
            // pas de bandeau d'archive. 3e occurrence du piège #444/#446 dans CE
            // fichier — le commentaire de #446, 40 lignes plus haut, décrivait
            // déjà exactement cette erreur.
            if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
                window.peuplerDropdownGroupeCoursActif();
            }

            // 🆕 BETA 95 FIX : Rafraîchir toutes les vues après changement de cours
            // (la liste d'étudiants, le tableau de bord, etc.)
            if (typeof window.rafraichirVuesApresCours === 'function') {
                window.rafraichirVuesApresCours();
            }

            // Mettre à jour le bandeau d'archivage si applicable
            if (typeof window.mettreAJourBandeauArchive === 'function') {
                window.mettreAJourBandeauArchive();
            }

            // 🆕 #466/CT-06 (21 août 2026) : réinitialiser AUSSI le formulaire
            // « Journées sans cours » — 3e formulaire de la même famille (#332
            // horaire, #446 groupe-cours) : un événement resté en édition à
            // cheval sur la bascule produisait « Journée modifiée » sans rien
            // écrire (findIndex raté en silence dans le nouveau namespace).
            if (typeof window.annulerFormEvenementV2 === 'function') {
                window.annulerFormEvenementV2();
            }

            // 🆕 #466/CO-16 (21 août 2026) : réinitialiser les QUATRE éditeurs de
            // Conception (grilles, échelles, cartouches, pratiques) — leurs
            // pointeurs d'édition survivaient à la bascule : « sauvegardée ! »
            // sans écriture (findIndex raté sur le nouveau namespace), ou pire,
            // édition fantôme d'une entité de l'ancien trimestre.
            ['reinitialiserEditeurGrillesApresBascule',
             'reinitialiserEditeurEchellesApresBascule',
             'reinitialiserEditeurCartouchesApresBascule',
             'reinitialiserEditeurPratiquesApresBascule'].forEach(function (fn) {
                if (typeof window[fn] === 'function') window[fn]();
            });

            // #446 (10 août 2026) — les deux surfaces qui restaient sur le
            // trimestre QUITTÉ, constatées en capture par Grégoire :
            //
            //   · la BARRE DE PROGRESSION du Cadre affichait encore « 2 GC /
            //     51 étud. » (les chiffres de H26) alors que le trimestre actif
            //     était A26, qui n'a aucun groupe-cours. Elle lit pourtant les
            //     bonnes clés namespacées : elle n'était simplement jamais
            //     rappelée, donc le DOM gardait le rendu d'avant la bascule ;
            //   · le SÉLECTEUR « Groupe-cours existants » gardait la liste de
            //     l'ancien trimestre — d'où un « H2026-… » proposé sous A2026.
            //
            // Les deux fonctions sont idempotentes et relisent tout : les
            // appeler ici suffit, il n'y a pas d'état à démêler.
            if (typeof window.mettreAJourBarreContexte === 'function') {
                window.mettreAJourBarreContexte();
            }
            if (typeof window.populerDropdownGroupeCoursV2 === 'function') {
                window.populerDropdownGroupeCoursV2();
            }

            // #683, mécanisme (i) (15 oct. 2026) : la bascule sème le matériel de départ
            // EXACTEMENT comme le chargement — grille puis échelle (abstenues en trimestre
            // archivé, comme dans initialiserModuleGrilles/Echelles), puis cartouche (qui
            // exige la grille du même trimestre ; son chargement ne s'abstient pas en
            // archive, la bascule non plus).
            semerMaterielDeDepartApresBascule().catch(function (e) {
                console.error('[Trimestre V2] #683 : semis du matériel de départ après bascule', e);
            });
        }
    } else {
        console.error('[Trimestre V2] Fonction changerTrimestreActif non disponible');
    }
}

// #975 (7 oct. 2026) : « + Nouveau trimestre » ouvre la fiche d'identification du Cadre en
// création (`ouvrirCreationTrimestreV2`, trimestre-v2-init.js) — le chemin du lot E2. L'ancien
// chemin par `prompt` et `alert` (ouvrirModalNouveauTrimestre) est retiré.

// Exports — fonctions migrées du bloc principal résidu (L4470-4480 originelles) ; #975 en retire ouvrirModalNouveauTrimestre.
window.trierTrimestresChronologique = trierTrimestresChronologique;
window.populerDropdownTrimestreV2 = populerDropdownTrimestreV2;
window.confirmerArchivage = confirmerArchivage;
window.confirmerDesarchivage = confirmerDesarchivage;
window.afficherFormulaireTrimestreActif = afficherFormulaireTrimestreActif;
window.ouvrirBibliothequeTrimestreV2 = ouvrirBibliothequeTrimestreV2;
window.fermerModalBibliothequeTrimestres = fermerModalBibliothequeTrimestres;
window.confirmerSuppressionTrimestre = confirmerSuppressionTrimestre;
window.changerTrimestreActifV2 = changerTrimestreActifV2;

})();


