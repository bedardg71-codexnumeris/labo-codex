/* ===============================
   GESTIONNAIRE DE BIBLIOTHÈQUE DE PRODUCTIONS (UI)
   ✅ EXTRACTION (16 mai 2026, refactor étape 3)

   Sous-module extrait de productions.js (lignes 1939-2607).
   Périmètre : modale Gestionnaire de bibliothèque + 14 actions associées.

   Distinction avec productions-bibliotheque.js (chargé AVANT) :
   - productions-bibliotheque.js : storage layer (CRUD bibliothèque partagée
     `bibliothequeProductions`, non namespacée)
   - productions-bibliotheque-ui.js (ce fichier) : interface utilisateur
     (modale Gestionnaire, sections Sélection/Disponibles, filtres, actions
     dupliquer/retirer/supprimer/importer trimestre)

   Dépendances (toutes via globales/window) :
   - Storage layer (productions-bibliotheque.js) :
     obtenirToutesLesProductionsBibliotheque, listerTrimestresAvecProductions,
     formaterNomTrimestre, obtenirProductionsTrimestre,
     importerDansBibliotheque, ajouterALaBibliotheque, retirerDeLaBibliotheque
   - Résidu productions.js : getCleProductions, detecterDoublonsProductions,
     getTypeLabel (tous exposés sur window)
   - Autres sous-modules : afficherListeProductions (productions-liste.js),
     afficherTableauProductions, mettreAJourPonderationTotale (productions.js)
   - Globaux : BibliothequeUI, db, echapperHtml, genererIdUnique, toggleDisplay
   =============================== */

(function() {
'use strict';

/**
 * Affiche le modal gestionnaire de bibliothèque de productions
 * Permet d'ajouter/retirer des productions de la sidebar
 *
 * SECTIONS:
 * 1. Productions dans ma sélection (avec bouton "Retirer")
 * 2. Productions disponibles à ajouter (bibliothèque + productions retirées)
 */
async function preparerDonneesBibliothequeProductions() {
    if (typeof obtenirToutesLesProductionsBibliotheque !== 'function') {
        return null;
    }

    const productionsUtilisateurBrut = await db.get(getCleProductions()) || [];
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const productionsUtilisateur = BibliothequeUI.filtrerParModeDemo(productionsUtilisateurBrut);
    const productionsDansSelection = productionsUtilisateur.filter(p => p.dansBibliotheque !== false);
    const productionsRetirees = productionsUtilisateur.filter(p => p.dansBibliotheque === false);
    const toutesProductionsBiblio = BibliothequeUI.filtrerParModeDemo(
        await obtenirToutesLesProductionsBibliotheque()
    );
    const doublonsDetectes = detecterDoublonsProductions(productionsUtilisateur, toutesProductionsBiblio);

    // Section 1
    const cartesSection1 = productionsDansSelection.map(prod => ({
        nom: `${BibliothequeUI.formaterTitreDemo(prod.titre, BibliothequeUI.estItemDemo(prod))}${(prod.activiteApprentissage || prod.description) ? ' - ' + (prod.activiteApprentissage || prod.description) : ''}`,
        id: prod.id,
        badgeSource: BibliothequeUI.genererBadgeSource(prod, productionsDansSelection),
        metadonnees: BibliothequeUI.formaterMetadonnees(prod, {
            quantite: `Type: ${getTypeLabel(prod.type)} • Pondération: ${prod.ponderation}%`
        }),
        description: prod.objectif ? 'Objectif: ' + prod.objectif : '',
        inspireDe: BibliothequeUI.formaterInspireDe(prod),
        boutonPrincipal: { label: 'Dupliquer', action: 'dupliquerProductionBibliotheque', param: prod.id, classe: 'btn-confirmer', title: 'Créer une copie' },
        actionsMenu: [
            { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'production', param2: prod.id, classe: 'btn-secondaire', title: 'Générer un fichier .lcz signé à transmettre (#329)' },
            { label: 'Retirer', action: 'retirerProductionDeBibliotheque', param: prod.id, classe: 'btn-secondaire', title: 'Retirer de la barre latérale (données conservées)' },
            { label: 'Supprimer', action: 'supprimerProductionDefinitivement', param: prod.id, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
        ]
    }));

    // Section 2 : fusionner retirées + bibliothèque, exclure celles déjà en sélection.
    // #327 — cartes à plat (groupage par dossier au rendu via repertoiresBibliotheque).
    const toutesProductionsDisponibles = [...toutesProductionsBiblio, ...productionsRetirees];

    // Dossiers de classement (couche par-dessus, range par identité).
    const repsProductions = (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.obtenir === 'function')
        ? window.repertoiresBibliotheque.obtenir('productions')
        : [];
    const repParProduction = {};
    repsProductions.forEach(r => (r.itemIds || []).forEach(id => { repParProduction[id] = r.id; }));

    // Identités déjà présentes dans la sélection.
    //
    // ⚠ L'exclusion se faisait par `id` NU. Or `ajouterProductionIndividuelle`
    // ne déplace pas l'item de la bibliothèque : il en fait une COPIE avec un
    // `id` tout neuf, et range l'ancien dans `idOriginal`. L'original ne
    // correspondait donc à aucun id de la sélection et RESTAIT listé ici.
    //
    // Vécu au terrain (Grégoire, 22 août 2026) : « quand je clique "ajouter à
    // ma sélection", il semble rien se passer ». L'ajout marchait — la section
    // « ta sélection » passait bien de (1) à (2) — mais la liste où il venait
    // de cliquer était identique, donc le geste paraissait sans effet. Et
    // recliquer empilait un exemplaire de plus, en silence (recoupe CO-24, qui
    // notait les boutons « re-cliquables » sans en trouver la cause).
    //
    // On compare donc sur l'IDENTITÉ : l'id propre ET l'id d'origine, des deux
    // côtés.
    const identitesEnSelection = new Set();
    productionsDansSelection.forEach(p => {
        if (p.id) identitesEnSelection.add(p.id);
        if (p.idOriginal) identitesEnSelection.add(p.idOriginal);
    });

    const cartesSection2 = [];
    toutesProductionsDisponibles.forEach(prod => {
        if (identitesEnSelection.has(prod.id)) return;
        if (prod.idOriginal && identitesEnSelection.has(prod.idOriginal)) return;

        const repCourant = repParProduction[prod.id] || null;
        const actionsMenu = [];
        repsProductions.forEach(r => {
            if (r.id !== repCourant) {
                actionsMenu.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classer', param: 'productions', param2: prod.id, param3: r.id, classe: 'btn-secondaire', title: 'Ranger dans ce dossier' });
            }
        });
        if (repCourant) {
            actionsMenu.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirer', param: 'productions', param2: prod.id, classe: 'btn-secondaire', title: 'Sortir du dossier (repasse en non classées)' });
        }
        actionsMenu.push({ label: 'Supprimer', action: 'supprimerProductionDeBibliothequePartagee', param: prod.id, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque', showAlways: true });

        cartesSection2.push({
            nom: `${BibliothequeUI.formaterTitreDemo(prod.titre, BibliothequeUI.estItemDemo(prod))}${(prod.activiteApprentissage || prod.description) ? ' - ' + (prod.activiteApprentissage || prod.description) : ''}`,
            id: prod.id,
            badgeSource: BibliothequeUI.genererBadgeSource(prod, productionsUtilisateur),
            metadonnees: BibliothequeUI.formaterMetadonnees(prod, {
                quantite: `Type: ${getTypeLabel(prod.type)} • Pondération: ${prod.ponderation}%`
            }),
            inspireDe: BibliothequeUI.formaterInspireDe(prod),
            description: prod.objectif ? 'Objectif: ' + prod.objectif : '',
            dejaPresent: false,
            classeItem: 'production-disponible-item',
            boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterProductionIndividuelle', param: prod.id, classe: 'btn-confirmer', title: 'Ajouter cette production à ta sélection' },
            actionsMenu: actionsMenu
        });
    });

    // Import trimestre
    const trimestresDisponibles = listerTrimestresAvecProductions();
    const sectionImportTrimestre = trimestresDisponibles.length > 0 ? { trimestres: trimestresDisponibles } : null;

    return {
        cartesSection1,
        cartesSection2,
        doublonsDetectes,
        sectionImportTrimestre,
        repsProductions,
        nombreSelection: productionsDansSelection.length
    };
}

async function afficherBibliothequeProductions() {
    if (typeof obtenirToutesLesProductionsBibliotheque !== 'function') {
        notifications.erreur('Le module bibliothèque n\'est pas chargé.', 'Vérifiez que le fichier productions-bibliotheque.js est bien chargé.');
        return;
    }

    // #327 — enregistre la biblio « productions » auprès du helper générique de
    // répertoires (idempotent). Les items de Section 2 sont des cartes-config
    // déjà libellées : labelItem lit leur .nom tel quel.
    BibliothequeUI.repertoires.enregistrer('productions', {
        rafraichir: afficherBibliothequeProductions,
        ajouterItem: (id) => ajouterProductionIndividuelle(id),
        supprimerItem: (id) => supprimerProductionDeBibliothequePartagee(id),
        labelItem: (c) => c.nom,
        labelPluriel: 'productions'
    });

    const data = await preparerDonneesBibliothequeProductions();
    if (!data) return;

    // Section 1
    let contenuSection1 = '';
    if (data.cartesSection1.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune production dans la barre latérale</p>';
    } else {
        data.cartesSection1.forEach(carte => {
            contenuSection1 += BibliothequeUI.renderCarteSelection(carte);
        });
    }

    const boutonsApresSection1 = `
        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button data-action="ajouterMesProductionsALaBibliotheque" class="btn btn-principal btn-mini">Ajouter mes productions à la bibliothèque</button>
            <button data-action="exporterProductions" class="btn btn-secondaire btn-mini">Exporter toutes mes productions (JSON)</button>
            <button data-action="ouvrirFilePickerImportProductions" class="btn btn-secondaire btn-mini">Importer des productions (JSON)</button>
            <button data-action="partageImport.ouvrirSelecteurFichier" class="btn btn-secondaire btn-mini">Importer un partage (.lcz)</button>
            <input type="file" id="fichier-import-productions-modal" accept=".json" style="display: none;" data-on-change="importerProductions">
        </div>`;

    // Section import trimestre
    let sectionImportTrimestre = '';
    if (data.sectionImportTrimestre) {
        const trimestres = data.sectionImportTrimestre.trimestres;
        sectionImportTrimestre = `
            <div style="margin-top: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 6px; border: 1px solid var(--bordure-claire);">
                <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre</h4>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectTrimestreImport" class="controle-form" style="flex: 1; min-width: 200px;" data-on-change="mettreAJourFiltreCoursTrimestreProductions">
                        <option value="">-- Choisir un trimestre --</option>
                        ${trimestres.map(t => `<option value="${echapperHtml(t.cle)}">${echapperHtml(t.nom)} (${t.nombre} production${t.nombre > 1 ? 's' : ''})</option>`).join('')}
                    </select>
                    <select id="selectCoursImportProductions" class="controle-form" style="flex: 1; min-width: 150px; display: none;">
                        <option value="">Tous les cours</option>
                    </select>
                    <button data-action="afficherProductionsTrimestreModal" class="btn btn-secondaire btn-compact">Voir les productions</button>
                    <button data-action="importerToutTrimestreModal" class="btn btn-principal btn-compact">Tout importer</button>
                </div>
                <div id="previewProductionsTrimestre" class="u-hide" style="margin-top: 10px;"></div>
            </div>`;
    }

    // Filtres Section 2 : #327 — le filtre par discipline est retiré (incohérent avec
    // l'organisation par dossiers). La zone « Mes dossiers » (repliable) tient lieu de
    // tête de section.
    const filtresHTML = BibliothequeUI.repertoires.genererZone('productions');

    // Section 2 — #327 (groupage par dossier).
    const enteteGroupe = (titre) => `<h4 style="margin:18px 0 8px; padding-bottom:4px; border-bottom:1px solid var(--bordure, #ddd); color:var(--texte-secondaire, #555); font-size:0.95rem;">${echapperHtml(titre)}</h4>`;

    let contenuSection2 = '';
    if (data.cartesSection2.length === 0) {
        contenuSection2 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune production disponible à ajouter</p>';
    } else if (data.repsProductions && data.repsProductions.length === 0) {
        // Aucun dossier → liste à plat (comportement d'origine)
        data.cartesSection2.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
    } else {
        // Dossier → select compact ; « Non classées » → cartes (ce qui reste à ranger).
        const groupes = window.repertoiresBibliotheque.grouper(data.cartesSection2, 'productions');
        groupes.forEach(g => {
            const cleGroupe = g.id || '__nonclasse__';
            contenuSection2 += `<div class="biblio-groupe-repertoire" data-repertoire-id="${echapperHtml(cleGroupe)}">`;
            contenuSection2 += enteteGroupe(g.titre);
            if (g.id) {
                contenuSection2 += BibliothequeUI.repertoires.renderLigneDossierSelect('productions', g);
            } else {
                g.items.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
            }
            contenuSection2 += `</div>`;
        });
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeProductions',
        titre: 'Bibliothèque de productions',
        sousTitre: 'Gérez les productions affichées dans la barre latérale.',
        onFermer: 'fermerModalBibliothequeProductions',
        doublonsHTML: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes),
        titreSection1: `Productions dans ta sélection (${data.nombreSelection})`,
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        sectionImportTrimestre: sectionImportTrimestre,
        titreSection2: 'Productions disponibles à ajouter à la barre latérale',
        filtresSection2: filtresHTML,
        contenuIdListe2: 'listeProductionsDisponibles',
        contenuSection2: contenuSection2,
        sectionPartages: window.partageSection ? partageSection.genererSectionHTML('production') : ''
    });
}

/**
 * Ajoute une production individuelle au cours actuel (depuis la bibliothèque ou productions retirées)
 */
async function ajouterProductionIndividuelle(id) {
    try {
        // #340 — Capturer la clé namespacée UNE fois : le `await` ci-dessous
        // (obtenirToutesLesProductionsBibliotheque) ouvre une fenêtre pendant
        // laquelle le trimestre actif pourrait basculer. Sans capture, le
        // `db.set(getCleProductions(), ...)` final se résoudrait sous le NOUVEAU
        // namespace et écrirait le tableau lu sous l'ANCIEN → contamination.
        const cleProductions = getCleProductions();
        let productions = await db.get(cleProductions) || [];
        let prod = productions.find(p => p.id === id);

        // Si pas trouvée dans le cours actuel, chercher dans la bibliothèque partagée
        if (!prod) {
            const bibliotheque = await obtenirToutesLesProductionsBibliotheque();
            const prodBiblio = bibliotheque.find(p => p.id === id);

            if (!prodBiblio) {
                notifications.erreur('Production introuvable dans le cours actuel ni dans la bibliothèque.');
                return;
            }

            // Copier la production de la bibliothèque vers le cours actuel
            // Générer un nouvel ID pour éviter les conflits
            const nouvelId = genererIdUnique('PROD_');
            prod = {
                ...prodBiblio,
                id: nouvelId,
                idOriginal: prodBiblio.id, // Garder trace de l'original
                dansBibliotheque: true,
                dateImport: new Date().toISOString(),
                // #452 — une date d'échéance appartient au CALENDRIER d'un
                // trimestre : la copie reprise ne peut pas hériter de celle du
                // trimestre précédent. VIDER, pas deviner — reporter une date
                // sur le nouveau calendrier serait fabriquer une fausse donnée.
                dateEcheance: null
            };
            // #452 — second porteur de dates, le plus dangereux : ses
            // groupeCoursId désignent des groupes du trimestre PRÉCÉDENT
            // (inexistants ici), et le formulaire ne relisant que les groupes
            // affichés, ces entrées périmées survivraient en silence à chaque
            // enregistrement.
            delete prod.echeancesParGroupe;

            // Ajouter aux productions du cours
            productions.push(prod);
            await db.set(cleProductions, productions);

        } else {
            // Production déjà dans le cours, juste la marquer comme visible
            prod.dansBibliotheque = true;
            await db.set(cleProductions, productions);
        }

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherBibliothequeProductions();

        notifications.succes(`"${prod.titre}" ajoutée à ton cours !`);
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        notifications.erreur('Erreur lors de l\'ajout de la production');
    }
}

/**
 * Ajoute toutes les productions du cours actuel à la bibliothèque partagée
 * Permet de rendre ses productions disponibles pour tous les trimestres
 */
async function ajouterMesProductionsALaBibliotheque() {
    try {
        // Récupérer les productions du cours actuel
        const productions = await db.get(getCleProductions()) || [];

        if (productions.length === 0) {
            notifications.info('Aucune production à ajouter.', 'Crée d\'abord des productions dans ton cours actuel.');
            return;
        }

        // Confirmer avec l'utilisateur
        const confirmation = await uiDialogues.confirmerAction({
            titre: 'Ajouter à la bibliothèque partagée',
            message: `Veux-tu ajouter tes ${productions.length} production(s) à la bibliothèque partagée ? Elles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`,
            texteConfirmer: 'Ajouter'
        });

        if (!confirmation) {
            return;
        }

        // Importer dans la bibliothèque partagée
        const resultat = await importerDansBibliotheque(productions);

        // Rafraîchir l'affichage
        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();

        // Message de confirmation
        if (resultat.ajoutees > 0) {
            notifications.succes(
                `${resultat.ajoutees} ${window.pluriel(resultat.ajoutees, 'production ajoutée', 'productions ajoutées')} à la bibliothèque.`,
                (resultat.existantes > 0 ? `${resultat.existantes} étai(en)t déjà présente(s).` : ''));
        } else {
            notifications.info(`Toutes tes productions étaient déjà dans la bibliothèque.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        notifications.erreur('Erreur lors de l\'ajout des productions à la bibliothèque.');
    }
}

/**
 * 🆕 Beta 95.3 : Mettre à jour le dropdown filtre cours quand un trimestre est sélectionné
 */
function mettreAJourFiltreCoursTrimestreProductions() {
    const selectTrimestre = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');
    const preview = document.getElementById('previewProductionsTrimestre');

    if (!selectTrimestre || !selectCours) return;

    const cleSelectionnee = selectTrimestre.value;

    // Réinitialiser et masquer si aucun trimestre sélectionné
    if (!cleSelectionnee) {
        selectCours.innerHTML = '<option value="">Tous les cours</option>';
        selectCours.classList.add('u-hide');
        if (preview) preview.classList.add('u-hide');
        return;
    }

    // Récupérer les productions du trimestre
    const productions = obtenirProductionsTrimestre(cleSelectionnee);

    // Extraire les cours uniques
    const coursMap = new Map();
    productions.forEach(prod => {
        if (prod.coursId) {
            // Essayer de récupérer le nom du cours
            const nomCours = prod.sigleCours || prod.coursNom || prod.coursId;
            coursMap.set(prod.coursId, nomCours);
        }
    });

    // Peupler le dropdown cours
    let optionsHTML = '<option value="">Tous les cours</option>';
    coursMap.forEach((nom, id) => {
        optionsHTML += `<option value="${id}">${nom}</option>`;
    });
    selectCours.innerHTML = optionsHTML;

    // Afficher le dropdown seulement s'il y a des cours
    toggleDisplay(selectCours, coursMap.size > 0);

    // Masquer le preview
    if (preview) preview.classList.add('u-hide');
}

/**
 * Affiche un aperçu des productions d'un trimestre dans la modal
 * 🆕 Beta 95.3 : Avec support du filtre par cours
 */
function afficherProductionsTrimestreModal() {
    const select = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');
    const preview = document.getElementById('previewProductionsTrimestre');

    if (!select || !preview) return;

    const cleSelectionnee = select.value;
    if (!cleSelectionnee) {
        preview.classList.add('u-hide');
        return;
    }

    let productions = obtenirProductionsTrimestre(cleSelectionnee);

    // 🆕 Beta 95.3 : Filtrer par cours si sélectionné
    const coursFiltre = selectCours?.value || '';
    if (coursFiltre) {
        productions = productions.filter(p => p.coursId === coursFiltre);
    }

    if (productions.length === 0) {
        preview.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucune production trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    let html = '<div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--bordure-claire); border-radius: 4px; padding: 10px;">';
    productions.forEach(prod => {
        const coursLabel = prod.sigleCours || prod.coursNom || '';
        html += `
            <div style="padding: 8px; border-bottom: 1px solid var(--bordure-claire); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${prod.titre || 'Sans titre'}</strong>
                    ${(prod.activiteApprentissage || prod.description) ? ` - ${prod.activiteApprentissage || prod.description}` : ''}
                    <br><small style="color: var(--gris-moyen);">Type: ${prod.type || 'N/A'} • Pondération: ${prod.ponderation || 0}%${coursLabel ? ' • ' + coursLabel : ''}</small>
                </div>
                <button data-action="importerUneProductionTrimestre" data-param="${cleSelectionnee}" data-param2="${prod.id}" class="btn btn-confirmer btn-tres-compact">
                    Importer
                </button>
            </div>
        `;
    });
    html += '</div>';

    preview.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * Importe toutes les productions d'un trimestre dans la bibliothèque
 * 🆕 Beta 95.3 : Avec support du filtre par cours
 */
async function importerToutTrimestreModal() {
    const select = document.getElementById('selectTrimestreImport');
    const selectCours = document.getElementById('selectCoursImportProductions');

    if (!select || !select.value) {
        notifications.info('Sélectionne d\'abord un trimestre.');
        return;
    }

    const cleSelectionnee = select.value;
    const codeTrimestre = cleSelectionnee.replace('_productions', '');
    const nomTrimestre = formaterNomTrimestre(codeTrimestre);

    let productions = obtenirProductionsTrimestre(cleSelectionnee);

    // 🆕 Beta 95.3 : Filtrer par cours si sélectionné
    const coursFiltre = selectCours?.value || '';
    if (coursFiltre) {
        productions = productions.filter(p => p.coursId === coursFiltre);
    }

    if (productions.length === 0) {
        notifications.info('Aucune production à importer' + (coursFiltre ? ' pour ce cours.' : ' dans ce trimestre.'));
        return;
    }

    const coursLabel = coursFiltre ? ` du cours sélectionné` : '';
    const confirmation = await uiDialogues.confirmerAction({
        titre: 'Importer dans la bibliothèque partagée',
        message: `Veux-tu importer les ${productions.length} production(s)${coursLabel} de ${nomTrimestre} dans la bibliothèque partagée ?`,
        texteConfirmer: 'Importer'
    });

    if (!confirmation) return;

    const resultat = await importerDansBibliotheque(productions);

    // Rafraîchir l'affichage
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();

    notifications.succes('Import terminé.',
        `${resultat.ajoutees} ${window.pluriel(resultat.ajoutees, 'production ajoutée', 'productions ajoutées')}. ` +
        `${resultat.existantes} ${window.pluriel(resultat.existantes, 'déjà présente', 'déjà présentes')}.`);
}

/**
 * Importe une seule production d'un trimestre dans la bibliothèque
 */
async function importerUneProductionTrimestre(cleTrimestre, productionId) {
    const productions = obtenirProductionsTrimestre(cleTrimestre);
    const prod = productions.find(p => p.id === productionId);

    if (!prod) {
        notifications.erreur('Production introuvable.');
        return;
    }

    const resultat = await ajouterALaBibliotheque(prod);

    if (resultat) {
        // Rafraîchir l'affichage
        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        notifications.succes(`"${prod.titre}" ajoutée à la bibliothèque !`);
    } else {
        notifications.info('Cette production est déjà dans la bibliothèque.');
    }
}

/**
 * Retire une production de la bibliothèque (soft delete)
 */
async function retirerProductionDeBibliotheque(id) {
    const okRetrait = await uiDialogues.confirmerAction({
        titre: 'Retirer de la sélection',
        message: 'Retirer cette production de ta sélection ? Elle ne sera plus affichée dans la barre latérale mais restera disponible dans le gestionnaire.',
        texteConfirmer: 'Retirer'
    });
    if (!okRetrait) {
        return;
    }

    try {
        const productions = await db.get(getCleProductions()) || [];
        const production = productions.find(p => p.id === id);

        if (!production) {
            throw new Error('Production introuvable');
        }

        production.dansBibliotheque = false;

        await db.set(getCleProductions(), productions);


        fermerModalBibliothequeProductions();
        await afficherBibliothequeProductions();
        await afficherListeProductions();

    } catch (error) {
        console.error('Erreur lors du retrait:', error);
        notifications.erreur('Erreur', error.message);
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une production (hard delete)
 * @param {string} id - ID de la production à supprimer
 */
async function supprimerProductionDefinitivement(id) {
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) return;

    // Confirmation
    const okSuppr = await uiDialogues.confirmerAction({
        titre: 'Supprimer définitivement',
        message: `Supprimer définitivement la production «${production.titre}» ? Cette action est irréversible.`,
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!okSuppr) {
        return;
    }

    // Suppression définitive du store local
    const nouvellesProductions = productions.filter(p => p.id !== id);
    await db.set(getCleProductions(), nouvellesProductions);

    // Suppression du store partagé
    if (typeof retirerDeLaBibliotheque === 'function') {
        await retirerDeLaBibliotheque(id);
    }

    // Rafraîchir UI
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
    await afficherListeProductions();

}

/**
 * Supprimer une production de la bibliothèque partagée uniquement (Section 2)
 * @param {string} id - ID de la production à supprimer
 */
async function supprimerProductionDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesProductionsBibliotheque === 'function'
        ? await obtenirToutesLesProductionsBibliotheque()
        : [];
    const prod = biblio.find(p => p.id === id);
    if (!prod) return;

    const okSuppr = await uiDialogues.confirmerAction({
        titre: 'Supprimer de la bibliothèque partagée',
        message: `Supprimer définitivement «${prod.titre || 'Sans titre'}» de la bibliothèque partagée ? Cette action est irréversible.`,
        texteConfirmer: 'Supprimer',
        variante: 'danger'
    });
    if (!okSuppr) return;

    await retirerDeLaBibliotheque(id);

    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une production dans la bibliothèque
 * @param {string} id - ID de la production à dupliquer
 */
async function dupliquerProductionBibliotheque(id) {
    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === id);

    if (!production) {
        notifications.erreur('Production introuvable');
        return;
    }

    // Créer une copie avec un nouvel ID. La copie devient un nouvel original
    // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY). Si la
    // source était une démo, la copie perd le flag isDemo. Le champ nom de
    // production est `titre`, donc inspireDe.nom reçoit production.titre.
    const nouvelleProduction = {
        ...production,
        id: genererIdUnique('PROD_'),
        titre: `${production.titre} (copie)`,
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: {
            nom: production.titre || 'Inconnu',
            auteur: production.auteur || 'Inconnu',
            date: new Date().toISOString().slice(0, 10)
        },
        dansBibliotheque: true,
        dateCreation: new Date().toISOString()
    };

    // Supprimer les métadonnées de partage
    delete nouvelleProduction.metadata_cc;
    delete nouvelleProduction.auteurOriginal;

    // Ajouter à la liste
    productions.push(nouvelleProduction);
    await db.set(getCleProductions(), productions);

    // Rafraîchir UI
    fermerModalBibliothequeProductions();
    await afficherBibliothequeProductions();
    await afficherListeProductions();

}

/**
 * Ajoute les productions sélectionnées à la bibliothèque
 */
async function ajouterProductionsABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeProductionsDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        notifications.info('Sélectionne au moins une production à ajouter.');
        return;
    }

    try {
        const productions = await db.get(getCleProductions()) || [];
        let ajoutees = 0;

        checkboxes.forEach(checkbox => {
            const id = checkbox.value;
            const productionData = JSON.parse(checkbox.dataset.production);

            // Vérifier si la production existe déjà
            const prodExistante = productions.find(p => p.id === id);
            if (prodExistante) {
                // Réactiver si elle était retirée
                if (prodExistante.dansBibliotheque === false) {
                    prodExistante.dansBibliotheque = true;
                    ajoutees++;
                } else {
                }
            } else {
                // Ajouter nouvelle production de la bibliothèque
                productions.push({
                    ...productionData,
                    dansBibliotheque: true
                });
                ajoutees++;
            }
        });

        await db.set(getCleProductions(), productions);


        fermerModalBibliothequeProductions();
        await afficherListeProductions();
        await afficherTableauProductions();
        await mettreAJourPonderationTotale();

        if (ajoutees > 0) {
            notifications.succes(`${ajoutees} ${window.pluriel(ajoutees, 'production ajoutée', 'productions ajoutées')}.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        notifications.erreur('Erreur', error.message);
    }
}

// #327 — filtrerProductionsParDiscipline retiré (code mort) : le filtre par
// discipline n'existe plus (incohérent avec l'organisation par dossiers).
// Remplacé par la zone « Mes dossiers » + le groupage par dossier.

/**
 * Ferme le modal bibliothèque
 */
function fermerModalBibliothequeProductions() {
    BibliothequeUI.fermerModal('modalBibliothequeProductions');
}

/* ===============================
   EXPORTS WINDOW
   =============================== */

window.afficherBibliothequeProductions = afficherBibliothequeProductions;
window.retirerProductionDeBibliotheque = retirerProductionDeBibliotheque;
window.ajouterProductionsABibliotheque = ajouterProductionsABibliotheque;
window.fermerModalBibliothequeProductions = fermerModalBibliothequeProductions;
window.ajouterProductionIndividuelle = ajouterProductionIndividuelle;
window.ajouterMesProductionsALaBibliotheque = ajouterMesProductionsALaBibliotheque;
window.afficherProductionsTrimestreModal = afficherProductionsTrimestreModal;
window.importerToutTrimestreModal = importerToutTrimestreModal;
window.importerUneProductionTrimestre = importerUneProductionTrimestre;
window.mettreAJourFiltreCoursTrimestreProductions = mettreAJourFiltreCoursTrimestreProductions;
window.supprimerProductionDefinitivement = supprimerProductionDefinitivement;
window.supprimerProductionDeBibliothequePartagee = supprimerProductionDeBibliothequePartagee;
window.dupliquerProductionBibliotheque = dupliquerProductionBibliotheque;

})();
