/* ===============================
   MODULE: TRIMESTRE V2 — LISTE TRIMESTRES
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 946-1394 (zone 2 MODULES-MAP §2.4).

   Périmètre : dropdown trimestre + liste gestion + archivage + bibliothèque
   + modal nouveau trimestre (11 fonctions).

   Dépendances cross-module accédées via `window.X` (résidu chargé AVANT) :
   - Zone 1 : `chargerIdentificationTrimestreV2`, `chargerCadreCalendrierV2`,
     `chargerEvenementsPrevusV2`, `chargerEvenementsImprevusV2`,
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

    // Ajouter chaque trimestre du registre
    trimestres.forEach(t => {
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

    container.innerHTML = trimestres.map(t => {
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
            // Trimestre archivé : exporter ou désarchiver
            boutons = `
                <button class="btn btn-secondaire btn-compact" data-action="exporterTrimestreArchive" data-param="${t.id}" title="Exporter les données">
                    Exporter
                </button>
                <button class="btn btn-secondaire btn-compact" data-action="confirmerDesarchivage" data-param="${t.id}" title="Désarchiver pour permettre les modifications">
                    Désarchiver
                </button>`;
        } else {
            // Trimestre inactif : peut être archivé ou activé
            boutons = `
                <button class="btn btn-principal btn-compact" data-action="changerTrimestreActifV2" data-param="${t.id}" title="Activer ce trimestre">
                    Activer
                </button>
                <button class="btn btn-secondaire btn-compact" data-action="confirmerArchivage" data-param="${t.id}" title="Archiver ce trimestre (lecture seule)">
                    Archiver
                </button>
                <button class="btn btn-secondaire btn-compact" data-action="exporterTrimestreArchive" data-param="${t.id}" title="Exporter les données">
                    Exporter
                </button>`;
        }

        return `
            <div class="${itemClasses.join(' ')}">
                <div class="item-trimestre-info">
                    <span class="item-trimestre-nom">${t.nom}</span>${badge}
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
    // - window.chargerEvenementsPrevusV2()
    // - window.chargerEvenementsImprevusV2()
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
        } else if (!estActif) {
            primaire = { label: 'Activer', action: 'changerTrimestreActifV2', param: t.id, classe: 'btn-confirmer', title: 'Définir comme trimestre actif' };
            actions.push({ label: 'Archiver', action: 'confirmerArchivage', param: t.id, classe: 'btn-secondaire', title: 'Conserver en lecture seule' });
        } else {
            // Actif courant : aucune action primaire (déjà actif). Menu : archiver pour basculer ailleurs avant.
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
 * Supprime le trimestre actuellement actif (non implémenté)
 * 🆕 BETA 95.2
 */
function supprimerTrimestreActif() {
    alert('La suppression de trimestre n\'est pas encore disponible.\n\nUtilisez l\'archivage pour conserver les données en lecture seule.');
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
            window.chargerEvenementsPrevusV2();
            window.chargerEvenementsImprevusV2();
            window.afficherStatistiquesTrimestreV2();

            // Rafraîchir le dropdown trimestre et le formulaire
            populerDropdownTrimestreV2();
            afficherFormulaireTrimestreActif();

            // Rafraîchir le dropdown des cours (filtré par trimestre)
            window.chargerDropdownCoursV2();

            // 🆕 BETA 95.2 : Rafraîchir le dropdown groupe-cours actif
            if (typeof peuplerDropdownGroupeCoursActif === 'function') {
                window.peuplerDropdownGroupeCoursActif();
            }

            // 🆕 BETA 95 FIX : Rafraîchir toutes les vues après changement de cours
            // (la liste d'étudiants, le tableau de bord, etc.)
            if (typeof rafraichirVuesApresCours === 'function') {
                rafraichirVuesApresCours();
            }

            // Mettre à jour le bandeau d'archivage si applicable
            if (typeof mettreAJourBandeauArchive === 'function') {
                mettreAJourBandeauArchive();
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
        '  H = Hiver\n\n' +
        'Entre A ou H :'
    );

    if (!sessionChoix) return; // Annulé

    const session = sessionChoix.trim().toUpperCase();
    if (session !== 'A' && session !== 'H') {
        alert('Session invalide. Veuillez entrer A (Automne) ou H (Hiver).');
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
        alert(`Le trimestre ${session === 'H' ? 'Hiver' : 'Automne'} ${annee} existe déjà.`);
        return;
    }

    // Demander si on veut l'activer
    const activer = confirm(
        `Créer le trimestre ${session === 'H' ? 'Hiver' : 'Automne'} ${annee} ?\n\n` +
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
            // Recharger les données du nouveau trimestre
            window.chargerCadreCalendrierV2();
            window.chargerEvenementsPrevusV2();
            window.chargerEvenementsImprevusV2();
            window.afficherStatistiquesTrimestreV2();
        }
    } else {
        alert('Erreur lors de la création du trimestre.');
    }
}

// Exports — 11 fonctions migrées du bloc principal résidu (L4470-4480 originelles).
window.populerDropdownTrimestreV2 = populerDropdownTrimestreV2;
window.afficherListeTrimestreGestion = afficherListeTrimestreGestion;
window.confirmerArchivage = confirmerArchivage;
window.confirmerDesarchivage = confirmerDesarchivage;
window.afficherFormulaireTrimestreActif = afficherFormulaireTrimestreActif;
window.ouvrirBibliothequeTrimestreV2 = ouvrirBibliothequeTrimestreV2;
window.fermerModalBibliothequeTrimestres = fermerModalBibliothequeTrimestres;
window.archiverTrimestreActif = archiverTrimestreActif;
window.supprimerTrimestreActif = supprimerTrimestreActif;
window.changerTrimestreActifV2 = changerTrimestreActifV2;
window.ouvrirModalNouveauTrimestre = ouvrirModalNouveauTrimestre;

})();


