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

    // Mettre à jour aussi la liste de gestion des trimestres
    afficherListeTrimestreGestion();
}

/**
 * Affiche la liste des trimestres avec boutons de gestion (archiver, exporter, etc.)
 */
function afficherListeTrimestreGestion() {
    const container = document.getElementById('listeTrimestreGestion');
    if (!container) return;

    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    if (trimestres.length === 0) {
        container.innerHTML = '<p class="texte-muted">Aucun trimestre configuré.</p>';
        return;
    }

    container.innerHTML = trierTrimestresChronologique(trimestres).map(t => {
        const estActif = trimestreActif && t.id === trimestreActif.id;
        const estArchive = t.archive === true;

        // Classes CSS pour l'item
        const itemClasses = ['item-trimestre'];
        if (estActif) itemClasses.push('actif');
        if (estArchive) itemClasses.push('archive');

        // Badge d'état
        let badge = '';
        if (estActif) {
            badge = '<span class="badge-trimestre actif">Actif</span>';
        } else if (estArchive) {
            badge = '<span class="badge-trimestre archive">Archivé</span>';
        }

        // Statistiques si archivé
        let statsInfo = '';
        if (estArchive && t.statistiquesFinales) {
            const stats = t.statistiquesFinales;
            statsInfo = `<div class="item-trimestre-stats">
                ${stats.nbEtudiants || 0} étudiant(s)${t.dateFin ? ` • Archivé le ${t.dateFin}` : ''}
            </div>`;
        }

        // Boutons d'action
        let boutons = '';
        if (estActif) {
            // Le trimestre actif ne peut pas être archivé
            boutons = `<button class="btn btn-secondaire btn-compact" data-action="exporterTrimestreArchive" data-param="${t.id}" title="Exporter les données">
                Exporter
            </button>`;
        } else if (estArchive) {
            // Trimestre archivé : exporter, désarchiver ou supprimer (#361)
            boutons = `
                <button class="btn btn-secondaire btn-compact" data-action="exporterTrimestreArchive" data-param="${t.id}" title="Exporter les données">
                    Exporter
                </button>
                <button class="btn btn-secondaire btn-compact" data-action="confirmerDesarchivage" data-param="${t.id}" title="Désarchiver pour permettre les modifications">
                    Désarchiver
                </button>
                <button class="btn btn-supprimer btn-compact" data-action="confirmerSuppressionTrimestre" data-param="${t.id}" title="Supprimer définitivement ce trimestre et toutes ses données">
                    Supprimer…
                </button>`;
        } else {
            // Trimestre inactif : peut être activé, archivé ou supprimé (#361)
            boutons = `
                <button class="btn btn-principal btn-compact" data-action="changerTrimestreActifV2" data-param="${t.id}" title="Activer ce trimestre">
                    Activer
                </button>
                <button class="btn btn-secondaire btn-compact" data-action="confirmerArchivage" data-param="${t.id}" title="Archiver ce trimestre (lecture seule)">
                    Archiver
                </button>
                <button class="btn btn-secondaire btn-compact" data-action="exporterTrimestreArchive" data-param="${t.id}" title="Exporter les données">
                    Exporter
                </button>
                <button class="btn btn-supprimer btn-compact" data-action="confirmerSuppressionTrimestre" data-param="${t.id}" title="Supprimer définitivement ce trimestre et toutes ses données">
                    Supprimer…
                </button>`;
        }

        return `
            <div class="${itemClasses.join(' ')}">
                <div class="item-trimestre-info">
                    <span class="item-trimestre-nom">${echapperHtml(t.nom)}</span>${badge}
                    ${statsInfo}
                </div>
                <div class="item-trimestre-actions">
                    ${boutons}
                </div>
            </div>`;
    }).join('');

    // Mettre à jour l'info du trimestre ciblé pour l'export
    if (typeof afficherTrimestreCibleExport === 'function') {
        afficherTrimestreCibleExport();
    }
}

/**
 * Confirme et archive un trimestre
 */
function confirmerArchivage(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    if (!trimestre) {
        alert('Trimestre non trouvé');
        return;
    }

    const confirme = confirm(
        `Archiver le trimestre "${trimestre.nom}" ?\n\n` +
        `Un trimestre archivé passe en lecture seule et ne peut plus être modifié.\n` +
        `Un export automatique sera généré.\n\n` +
        `Cette action est réversible via le bouton "Désarchiver".`
    );

    if (confirme) {
        const result = archiverTrimestre(id);
        if (result.success) {
            alert(`Trimestre "${trimestre.nom}" archivé avec succès.\n\nUn fichier d'export a été téléchargé.`);
            afficherListeTrimestreGestion();
        } else {
            alert(`Erreur: ${result.error}`);
        }
    }
}

/**
 * Confirme et désarchive un trimestre
 */
function confirmerDesarchivage(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    if (!trimestre) {
        alert('Trimestre non trouvé');
        return;
    }

    const confirme = confirm(
        `Désarchiver le trimestre "${trimestre.nom}" ?\n\n` +
        `Cela permettra de modifier à nouveau les données de ce trimestre.`
    );

    if (confirme) {
        const result = desarchiverTrimestre(id);
        if (result.success) {
            alert(`Trimestre "${trimestre.nom}" désarchivé.`);
            afficherListeTrimestreGestion();
        } else {
            alert(`Erreur: ${result.error}`);
        }
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
        alert('Aucun trimestre dans la bibliothèque.\n\nCliquez sur "+ Nouveau trimestre" pour en créer un.');
        return;
    }

    // Phase C #267 — modale BibliothequeUI avec carte + menu ⋮
    const trimestresActifs = trimestres.filter(t => !t.archive);
    const trimestresArchives = trimestres.filter(t => t.archive);

    function genererCarteTrim(t, estArchive) {
        const estActif = !!t.actif;
        const badgeActif = estActif ? '<span style="background: var(--vert-principal); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 10px;">Actif</span>' : '';
        const meta = estArchive ? 'Archivé' : (estActif ? 'Trimestre actuellement actif' : 'Disponible');

        let primaire = null;
        const actions = [];
        if (estArchive) {
            primaire = { label: 'Désarchiver', action: 'desarchiverTrimestre', param: t.id, classe: 'btn-confirmer', title: 'Restaurer ce trimestre comme actif' };
            // #361 : suppression définitive (jamais sur le trimestre actif)
            actions.push({ label: 'Supprimer…', action: 'confirmerSuppressionTrimestre', param: t.id, classe: 'btn-supprimer', title: 'Effacer définitivement ce trimestre et toutes ses données' });
        } else if (!estActif) {
            primaire = { label: 'Activer', action: 'changerTrimestreActifV2', param: t.id, classe: 'btn-confirmer', title: 'Définir comme trimestre actif' };
            actions.push({ label: 'Archiver', action: 'confirmerArchivage', param: t.id, classe: 'btn-secondaire', title: 'Conserver en lecture seule' });
            // #361 : suppression définitive (jamais sur le trimestre actif)
            actions.push({ label: 'Supprimer…', action: 'confirmerSuppressionTrimestre', param: t.id, classe: 'btn-supprimer', title: 'Effacer définitivement ce trimestre et toutes ses données' });
        } else {
            // Actif courant : aucune action primaire (déjà actif). Menu : archiver pour basculer ailleurs avant.
            // Pas de « Supprimer » ici — garde anti-actif (#361).
            actions.push({ label: 'Archiver', action: 'confirmerArchivage', param: t.id, classe: 'btn-secondaire', title: 'Conserver en lecture seule' });
        }

        return BibliothequeUI.renderCarteSelection({
            nom: echapperHtml(t.nom || t.id) + badgeActif,
            id: t.id,
            badgeSource: '',
            metadonnees: meta,
            description: '',
            boutonPrincipal: primaire,
            actionsMenu: actions
        });
    }

    let contenuSection1 = '';
    if (trimestresActifs.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucun trimestre actif</p>';
    } else {
        trimestresActifs.forEach(t => { contenuSection1 += genererCarteTrim(t, false); });
    }

    let contenuSection2 = '';
    let titreSection2 = '';
    if (trimestresArchives.length > 0) {
        titreSection2 = 'Trimestres archivés';
        trimestresArchives.forEach(t => { contenuSection2 += genererCarteTrim(t, true); });
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeTrimestres',
        titre: '📚 Bibliothèque des trimestres',
        sousTitre: 'Activez, archivez ou restaurez vos trimestres.',
        onFermerAction: 'fermerModalBibliothequeTrimestres',
        doublonsHTML: '',
        titreSection1: 'Trimestres disponibles',
        contenuSection1: contenuSection1,
        boutonsApresSection1: '',
        titreSection2: titreSection2,
        filtresSection2: '',
        contenuSection2: contenuSection2
    });

    if (!titreSection2) {
        const modalEl = document.getElementById('modalBibliothequeTrimestres');
        if (modalEl) {
            const h3s = modalEl.querySelectorAll('.biblio-section-titre');
            if (h3s.length >= 2 && !h3s[1].textContent.trim()) h3s[1].style.display = 'none';
        }
    }
}

function fermerModalBibliothequeTrimestres() {
    BibliothequeUI.fermerModal('modalBibliothequeTrimestres');
}

/**
 * Archive le trimestre actuellement actif
 * 🆕 BETA 95.2
 */
function archiverTrimestreActif() {
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    if (!trimestreActif) {
        alert('Aucun trimestre actif à archiver.');
        return;
    }

    confirmerArchivage(trimestreActif.id);
}

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

    if (!trimestre) {
        alert('Trimestre non trouvé');
        return;
    }

    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
    if ((trimestreActif && trimestreActif.id === id) || trimestre.actif === true) {
        alert(
            'Le trimestre actif ne peut pas être supprimé.\n\n' +
            'Active un autre trimestre d\'abord, ou utilise l\'archivage pour le conserver en lecture seule.'
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
    const continuer = confirm(
        `Supprimer définitivement le trimestre « ${trimestre.nom} » ? ` +
        `Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles.`
    );
    if (!continuer) return;

    // Confirmation forte : ressaisir le nom exact du trimestre
    const saisie = prompt(
        `Confirmation finale — cette action est IRRÉVERSIBLE.\n\n` +
        `Pour supprimer "${trimestre.nom}" et toutes ses données, retape son nom exactement :`
    );
    if (saisie === null) return; // annulé
    if (saisie.trim() !== trimestre.nom) {
        alert('Le nom saisi ne correspond pas. Suppression annulée.');
        return;
    }

    supprimerTrimestre(id).then(function(result) {
        if (result.success) {
            alert(`Trimestre "${trimestre.nom}" supprimé (${result.nbCles} clés de données effacées).`);
            populerDropdownTrimestreV2();
            // Rafraîchir la modale bibliothèque si elle est ouverte
            if (document.getElementById('modalBibliothequeTrimestres')) {
                fermerModalBibliothequeTrimestres();
                ouvrirBibliothequeTrimestreV2();
            }
        } else {
            alert(`Erreur : ${result.error}`);
        }
    }).catch(function(e) {
        alert(`Erreur : ${e.message}`);
    });
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
        }
    } else {
        console.error('[Trimestre V2] Fonction changerTrimestreActif non disponible');
    }
}

/**
 * Ouvre la modal pour créer un nouveau trimestre
 */
function ouvrirModalNouveauTrimestre() {
    // Demander la session
    const sessionChoix = prompt(
        'Créer un nouveau trimestre\n\n' +
        'Quelle session ?\n' +
        '  A = Automne\n' +
        '  H = Hiver\n' +
        '  E = Été\n\n' +
        'Entre A, H ou E :'
    );

    if (!sessionChoix) return; // Annulé

    const session = sessionChoix.trim().toUpperCase();
    if (session !== 'A' && session !== 'H' && session !== 'E') {
        alert('Session invalide. Veuillez entrer A (Automne), H (Hiver) ou E (Été).');
        return;
    }

    // Demander l'année
    const anneeActuelle = new Date().getFullYear();
    const anneeChoix = prompt(
        `Quelle année ?\n\n` +
        `Exemples : ${anneeActuelle}, ${anneeActuelle + 1}\n\n` +
        `Entre l'année (4 chiffres) :`
    );

    if (!anneeChoix) return; // Annulé

    const annee = anneeChoix.trim();
    if (!/^\d{4}$/.test(annee)) {
        alert('Année invalide. Veuillez entrer 4 chiffres (ex: 2026).');
        return;
    }

    // Vérifier si ce trimestre existe déjà
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const id = `${session.toLowerCase()}${annee}`;
    if (trimestres.find(t => t.id === id)) {
        alert(`Le trimestre ${nomSession(session)} ${annee} existe déjà.`);
        return;
    }

    // Demander si on veut l'activer — seulement s'il y a un trimestre actif à désactiver.
    // #478 (c) : sans trimestre actif, un trimestre créé inactif laissait TOUT le Cadre sans
    // préfixe de trimestre (mesuré : un groupe-cours partait dans la clé nue et restait
    // invisible après activation jusqu'au rechargement), et le formulaire du groupe-cours
    // n'avait rien à présélectionner. Le premier trimestre d'un poste vierge est donc actif.
    const aucunTrimestreActif = !(typeof obtenirTrimestreActif === 'function' && obtenirTrimestreActif());
    const activer = aucunTrimestreActif || confirm(
        `Créer le trimestre ${nomSession(session)} ${annee} ?\n\n` +
        `Veux-tu l'activer immédiatement ?\n` +
        `(Le trimestre actuel sera désactivé)`
    );

    // Créer le trimestre
    const result = creerTrimestre(session, annee, activer);

    if (result) {
        alert(`Trimestre "${result.nom}" créé avec succès !`);

        // Rafraîchir l'interface
        populerDropdownTrimestreV2();

        if (activer) {
            // 🔧 #466/CT-05 (21 août 2026) : la création-avec-activation passait
            // par 4 recharges PARTIELLES (identification/cadre/journées/stats) au
            // lieu du chemin complet — le contexte de l'ANCIEN trimestre survivait
            // partout ailleurs : groupeCoursActif et infoCours pointaient l'ancien,
            // le miroir trimestreActif restait périmé, le dropdown Horaire offrait
            // les horaires de l'ancien namespace (édition ensuite REFUSÉE par le
            // garde du 29 mai, sans explication), l'en-tête listait l'ancien GC.
            // C'est le scénario type d'une rentrée. UN SEUL chemin de bascule
            // désormais : le même que le sélecteur (recharges + resets + miroirs).
            changerTrimestreActifV2(id);
        }
    } else {
        alert('Erreur lors de la création du trimestre.');
    }
}

// Exports — 11 fonctions migrées du bloc principal résidu (L4470-4480 originelles).
window.trierTrimestresChronologique = trierTrimestresChronologique;
window.populerDropdownTrimestreV2 = populerDropdownTrimestreV2;
window.afficherListeTrimestreGestion = afficherListeTrimestreGestion;
window.confirmerArchivage = confirmerArchivage;
window.confirmerDesarchivage = confirmerDesarchivage;
window.afficherFormulaireTrimestreActif = afficherFormulaireTrimestreActif;
window.ouvrirBibliothequeTrimestreV2 = ouvrirBibliothequeTrimestreV2;
window.fermerModalBibliothequeTrimestres = fermerModalBibliothequeTrimestres;
window.archiverTrimestreActif = archiverTrimestreActif;
window.confirmerSuppressionTrimestre = confirmerSuppressionTrimestre;
window.changerTrimestreActifV2 = changerTrimestreActifV2;
window.ouvrirModalNouveauTrimestre = ouvrirModalNouveauTrimestre;

})();


