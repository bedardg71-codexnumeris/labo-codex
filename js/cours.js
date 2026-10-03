/* ===============================
   MODULE 08: GESTION DES COURS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration technique des cours :
   code, nom, compétences, enseignant·e, session, horaires.
   
   Contenu de ce module:
   - Affichage du tableau des cours
   - Ajout/modification de cours
   - Reprise d'un cours dans le trimestre actif (sans duplication)
   - Activation d'un cours (cours actif)
   - Suppression de cours
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, coursEnEdition
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #tableauCoursContainer : Conteneur du tableau
   - #nombreCours : Nombre total de cours
   - #sessionActive : Session du cours actif
   - #resumeCours : Résumé du cours actif
   - #btnAjouterCours : Bouton d'ajout
   - #formulaireCours : Formulaire d'ajout/édition
   - #titreFormCours : Titre du formulaire
   - #btnTexteCours : Texte du bouton de sauvegarde
   - Champs du formulaire : voir structure ci-dessous
   
   LocalStorage utilisé:
   - 'cours' : Array des cours configurés
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Migre les cours existants pour ajouter le champ pratiqueId
 *
 * CONTEXTE:
 * Les cours créés avant l'implémentation de l'association pratique ↔ cours
 * n'ont pas de champ pratiqueId. Cette fonction ajoute automatiquement
 * la pratique par défaut (pan-maitrise) aux cours qui n'en ont pas.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Pour chaque cours sans pratiqueId, ajoute 'pan-maitrise'
 * 3. Sauvegarde les cours modifiés
 *
 * @returns {number} - Nombre de cours migrés
 */
function migrerCoursVersPratiques() {
    const cours = db.getSync('cours', []);
    let nbMigres = 0;

    cours.forEach(c => {
        if (!c.pratiqueId) {
            c.pratiqueId = 'pan-standards'; // Pratique par défaut
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('cours', cours);
    }

    return nbMigres;
}

/**
 * Migre les cours existants pour ajouter le flag dansBibliotheque
 *
 * CONTEXTE:
 * Avec le nouveau système de bibliothèque, tous les cours doivent avoir
 * un flag dansBibliotheque pour contrôler leur visibilité.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Pour chaque cours sans flag, ajoute dansBibliotheque: true (visible par défaut)
 * 3. Sauvegarde les cours modifiés
 *
 * @returns {number} - Nombre de cours migrés
 */
function migrerCoursDansBibliotheque() {
    const cours = db.getSync('cours', []);
    let nbMigres = 0;

    cours.forEach(c => {
        if (c.dansBibliotheque === undefined) {
            c.dansBibliotheque = true; // Par défaut, tous les cours existants restent visibles
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('cours', cours);
    }

    return nbMigres;
}

/* ===============================
   HELPER: Peupler sélecteur trimestre (Beta 93.5)
   =============================== */
/**
 * Peuple le sélecteur de trimestre dans le formulaire cours
 *
 * BETA 93.5: Version simplifiée - génère options depuis cours existants
 * BETA 94: Lira depuis une liste de trimestres configurés
 */
function peupleSelecteurTrimestre() {
    const select = document.getElementById('trimestreId');
    if (!select) return;

    const cours = db.getSync('cours', []);

    // Extraire trimestres uniques
    const trimestres = new Set();
    cours.forEach(c => {
        if (c.trimestreId) {
            trimestres.add(c.trimestreId);
        }
    });

    // Effacer options existantes (sauf la première)
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Ajouter les trimestres existants
    Array.from(trimestres).sort().forEach(tId => {
        const option = document.createElement('option');
        option.value = tId;

        // Formater le label: "h2026" → "Hiver 2026", "e2025" → "Été 2025"
        const session = window.nomSession ? window.nomSession(tId.charAt(0)) : tId.charAt(0);
        const annee = tId.substring(1);
        option.textContent = `${session} ${annee}`;

        select.appendChild(option);
    });

    // Si aucun trimestre, ajouter un par défaut depuis le calendrier
    if (trimestres.size === 0) {
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        if (calendrier.dateDebut) {
            // Extraire année depuis dateDebut (format: YYYY-MM-DD)
            const annee = calendrier.dateDebut.substring(0, 4);
            // Déduire la session (3 sessions : H/E/A) depuis le mois de début
            const mois = parseInt(calendrier.dateDebut.substring(5, 7));
            const session = (window.sessionDepuisMois ? window.sessionDepuisMois(mois) : (mois <= 6 ? 'H' : 'A')).toLowerCase();
            const trimestreId = session + annee;

            const option = document.createElement('option');
            option.value = trimestreId;
            option.textContent = `${window.nomSession ? window.nomSession(session) : session} ${annee}`;
            select.appendChild(option);
        }
    }
}

/**
 * Initialise le module de gestion des cours
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Exécute les migrations nécessaires
 * 3. Charge et affiche le tableau des cours
 *
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleCours() {
    migrerCoursVersPratiques();
    migrerCoursDansBibliotheque();
}

/* ===============================
   🔄 REPRISE DANS LE TRIMESTRE ACTIF
   =============================== */
/**
 * Reprend un cours (description) dans le trimestre actif SANS dupliquer la description.
 *
 * Chantier E (refonte cours↔période, mai 2026) : remplace l'ancienne duplication, qui
 * créait un doublon de cours à chaque reprise. Ici, AUCUNE écriture dans `cours` :
 *  - si un groupe-cours pointe déjà vers cette description dans le trimestre actif → no-op
 *    (on ouvre simplement l'assemblage sur le groupe-cours existant) ;
 *  - sinon → on ouvre le formulaire d'assemblage en mode « nouveau », cours pré-sélectionné,
 *    pour que l'enseignant·e complète enseignant·e / horaire / groupe (brouillon à compléter).
 *
 * Le trimestre actif est résolu via obtenirTrimestreActif() — la MÊME source que le
 * namespacing cle() — pour rester cohérent avec le reste de l'UI d'assemblage.
 *
 * @param {string} coursId - ID de la description de cours à reprendre
 */
async function reprendreCoursDansTrimestreActif(coursId) {
    const tousLesCours = await db.get('cours') || [];
    const coursCible = tousLesCours.find(c => c.id === coursId);

    if (!coursCible) {
        notifications.erreur('Cours introuvable');
        return;
    }

    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
    if (!trimestreActif || !trimestreActif.id) {
        notifications.erreur('Aucun trimestre actif. Sélectionne ou crée un trimestre d\'abord.');
        return;
    }

    // No-op : un groupe-cours référence-t-il déjà cette description dans le trimestre actif ?
    const groupesCours = await window.GroupeCoursEntite.obtenirTous(trimestreActif.id);
    const gcExistant = groupesCours.find(gc =>
        gc.coursId === coursId ||
        gc.coursId === coursCible.sigle ||
        gc.coursId === coursCible.codeCours ||
        gc.coursId === coursCible.code
    );

    fermerModalBibliothequeCours();

    // Déployer l'accordéon « Groupe-cours » (active la sous-section + scrolle)
    if (typeof allerVersCarte === 'function') {
        allerVersCarte('accordeon-groupe-cours');
    }

    const libelleCours = coursCible.codeCours || coursCible.sigle || coursCible.nomCours || 'ce cours';
    const nomTrimestre = trimestreActif.nom || trimestreActif.id;

    if (gcExistant) {
        // Ouvrir l'assemblage sur le groupe-cours déjà présent
        const selectGC = document.getElementById('v2-selectGroupeCours');
        if (selectGC) selectGC.value = gcExistant.id;
        if (typeof changerGroupeCoursSelectionneV2 === 'function') {
            changerGroupeCoursSelectionneV2(gcExistant.id);
        }
        notifications.info(`${libelleCours} a déjà un groupe-cours dans ${nomTrimestre}.`);
        return;
    }

    // Nouveau groupe-cours brouillon, description pré-sélectionnée (aucun doublon de cours)
    // Lot E2 (28 sept. 2026) : `nouveauGroupeCoursV2` est asynchrone — il pose d'abord la
    // question de sortie si une création est en cours. On l'ATTEND, sinon sa remise à zéro
    // effaçait le cours présélectionné ; « Rester » (false) laisse la création en cours.
    if (typeof nouveauGroupeCoursV2 === 'function' && await nouveauGroupeCoursV2()) {
        const selectCours = document.getElementById('v2-gc-cours');
        if (selectCours) selectCours.value = coursId;
        if (typeof mettreAJourNomGroupeCoursV2 === 'function') {
            mettreAJourNomGroupeCoursV2();
        }
    }
    notifications.info(`Complète l'enseignant·e, l'horaire et le groupe pour reprendre ${libelleCours} dans ${nomTrimestre}.`);
}

/* ===============================
   MODAL BIBLIOTHÈQUE (Simplifié, sans CC)
   =============================== */

/**
 * Ouvre le modal de la bibliothèque de cours
 *
 * FONCTIONNEMENT:
 * - Section 1 : Cours dans ma sélection (dansBibliotheque === true)
 * - Section 2 : Cours disponibles à ajouter (dansBibliotheque === false)
 * - Boutons simplifiés (sans export/import avec métadonnées CC)
 *
 * NOTE: Contrairement aux productions/grilles, les cours ne nécessitent
 * PAS de métadonnées CC car il s'agit de données ministérielles publiques
 */
async function ouvrirModalBibliothequeCours() {
    const tousLesCours = await db.get('cours') || [];
    // #458 : « ta sélection » tolère le champ ABSENT (fiche née en cours de
    // session avant que la migration de boot pose le drapeau, ou tout futur
    // chemin de création qui l'oublierait). Seul un retrait EXPLICITE
    // (dansBibliotheque === false) envoie une fiche dans « disponibles » —
    // une fiche ne doit jamais être invisible des DEUX sections.
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque !== false);
    const coursDisponibles = tousLesCours.filter(c => c.dansBibliotheque === false);

    // Phase C #267 — migration vers BibliothequeUI (carte + menu ⋮)
    let contenuSection1 = '';
    if (coursDansBibliotheque.length === 0) {
        contenuSection1 = '<p class="text-muted" style="font-style: italic; padding: 20px 0;">Aucun cours dans ta sélection</p>';
    } else {
        coursDansBibliotheque.forEach(cours => {
            const actifBadge = cours.actif ? '<span class="badge-info" style="margin-left: 10px;">Actif</span>' : '';
            const titre = (cours.nature === 'service'
                ? echapperHtml(cours.nomCours) + ' - ' + motNature(cours) // le mot vient du point unique (js/mots-nature.js, 12 sept. 2026)
                : echapperHtml(cours.codeCours) + ' - ' + echapperHtml(cours.nomCours)) + actifBadge;
            const ens = (echapperHtml(cours.prenomEnseignant || '') + ' ' + echapperHtml(cours.nomEnseignant || '')).trim();
            const sess = echapperHtml((cours.session || '') + (cours.annee || ''));
            const meta = [ens, sess].filter(Boolean).join(' • ');
            contenuSection1 += BibliothequeUI.renderCarteSelection({
                nom: titre,
                id: cours.id,
                badgeSource: '',
                metadonnees: meta,
                description: cours.competence || '',
                boutonPrincipal: { label: 'Reprendre dans ce trimestre', action: 'reprendreCoursDansTrimestreActif', param: cours.id, classe: 'btn-confirmer', title: 'Créer un groupe-cours pour ce cours dans le trimestre actif (sans dupliquer le cours)' },
                // #449 : le réversible et le définitif coexistent — l'écart
                // se voit (libellés + seule la suppression est en rouge).
                actionsMenu: [
                    // #468/CT-13 : « Exporter » téléchargeait ZÉRO fichier — il
                    // déposait la fiche dans « à ajouter » et la sortait de la
                    // sélection, sans le dire. Les deux gestes existent
                    // maintenant côte à côte, chacun sous son vrai nom.
                    { label: 'Exporter', action: 'exporterUnCours', param: cours.id, classe: 'btn-secondaire', title: 'Télécharger ce cours en JSON (fichier à partager)' },
                    { label: 'Déposer dans les cours disponibles', action: 'partagerCours', param: cours.id, classe: 'btn-secondaire', title: 'Réversible : la fiche quitte ta sélection et rejoint « Cours disponibles à ajouter », avec ses métadonnées Creative Commons' },
                    { label: 'Retirer de ma sélection', action: 'retirerCoursDeBibliotheque', param: cours.id, classe: 'btn-secondaire', title: 'Réversible : la fiche reste disponible dans « à ajouter »' },
                    { label: 'Supprimer la fiche', action: 'supprimerFicheCours', param: cours.id, classe: 'btn-supprimer', title: 'Définitif, TOUS les trimestres — refusé si le cours porte des données' }
                ]
            });
        });
    }

    const boutonsApresSection1 = '<div style="text-align: center; margin-top: 15px;">' +
        '<button data-action="partagerTousLesCours" class="btn btn-secondaire" title="Exporter tous tes cours en un seul fichier JSON">Exporter tous mes cours</button>' +
        '</div>';

    let contenuSection2 = '';
    if (coursDisponibles.length === 0) {
        contenuSection2 = '<p class="text-muted" style="font-style: italic; padding: 20px 0;">Aucun cours disponible</p>';
    } else {
        coursDisponibles.forEach(cours => {
            const titre = cours.nature === 'service'
                ? echapperHtml(cours.nomCours) + ' - ' + motNature(cours) // le mot vient du point unique (js/mots-nature.js, 12 sept. 2026)
                : echapperHtml(cours.codeCours) + ' - ' + echapperHtml(cours.nomCours);
            const sess = echapperHtml((cours.session || '') + (cours.annee || ''));
            contenuSection2 += BibliothequeUI.renderCarteDisponible({
                nom: titre,
                id: cours.id,
                badgeSource: '',
                metadonnees: sess,
                description: cours.competence || '',
                dejaPresent: false,
                boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterCoursIndividuel', param: cours.id, classe: 'btn-confirmer', title: 'Ajouter ce cours à ta sélection' },
                // #449 : une fiche déjà hors sélection se supprime aussi d'ici.
                actionsMenu: [
                    { label: 'Supprimer la fiche', action: 'supprimerFicheCours', param: cours.id, classe: 'btn-supprimer', title: 'Définitif, TOUS les trimestres — refusé si le cours porte des données' }
                ]
            });
        });
        contenuSection2 += '<div style="text-align: center; margin-top: 15px;">' +
            '<button data-action="ouvrirFilePickerImportCours" class="btn btn-confirmer" title="Importer des cours depuis un fichier JSON">Importer des cours</button>' +
            '<input type="file" id="fichier-import-cours-modal" accept=".json" style="display: none;" data-on-change="importerCoursSimple">' +
            '</div>';
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeCours',
        titre: 'Bibliothèque de cours',
        sousTitre: 'Gère tes configurations de cours',
        onFermerAction: 'fermerModalBibliothequeCours',
        doublonsHTML: '',
        titreSection1: 'Cours dans ta sélection (' + coursDansBibliotheque.length + ')',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        titreSection2: 'Cours disponibles à ajouter',
        filtresSection2: '',
        contenuSection2: contenuSection2
    });
}

/**
 * Ferme le modal de la bibliothèque (Phase C #267 — passe par BibliothequeUI)
 */
function fermerModalBibliothequeCours() {
    BibliothequeUI.fermerModal('modalBibliothequeCours');
}

/**
 * Retire un cours de la sélection (passe dansBibliotheque à false)
 *
 * @param {string} id - ID du cours à retirer
 */
async function retirerCoursDeBibliotheque(id) {
    const cours = await db.get('cours') || [];
    const coursIndex = cours.findIndex(c => c.id === id);

    if (coursIndex !== -1) {
        cours[coursIndex].dansBibliotheque = false;
        cours[coursIndex].actif = false; // Un cours retiré ne peut plus être actif

        await db.set('cours', cours);
        if (window.signalerEcritureUsager) window.signalerEcritureUsager('cours');   // lot F : geste hors témoin (retirer un cours de ma sélection)
        fermerModalBibliothequeCours();
        alert('Cours retiré de ta sélection');
    }
}

/* ===============================
   #449 — SUPPRESSION D'UNE FICHE DE COURS, GARDÉE PAR RECENSEMENT
   (décision Grégoire, 11 août 2026, porte 3.2 ; livrée 19 août 2026)

   Le magasin `cours` est GLOBAL (#455) : supprimer une fiche la retire de
   TOUS les trimestres. Deux règles, tenues dans le même geste :
   1. le réversible (« Retirer de ma sélection ») et le définitif
      (« Supprimer la fiche ») coexistent dans le menu ⋮ — l'écart doit se
      voir au premier coup d'œil ;
   2. le définitif n'existe QUE gardé : recensement d'abord, REFUS dès que
      la fiche porte la moindre donnée (productions, étudiants, évaluations,
      présences, snapshots) — famille #154, les orphelins silencieux.
   L'interface est PLUS STRICTE que l'outil console
   `scripts/reparation-retirer-cours.js` : elle ne supprime qu'une fiche aux
   groupes-cours vides et n'a pas de { forcer } — le ménage de données de
   test reste le travail de l'outil console, en session.
   =============================== */

// Registre du projet : suffixes de clés namespacées dont les items portent
// un champ .coursId (partagé avec _diagnostiquerModeleCours et l'outil
// console — ne pas réinventer la liste ailleurs).
const SUFFIXES_FK_COURS = ['presences', 'productions', 'groupeEtudiants', 'groupesCours', 'evaluationsSauvegardees'];

async function _toutesClesStockage() {
    try {
        const idbKeys = await db.keys();
        return Array.from(new Set([...Object.keys(localStorage), ...idbKeys]));
    } catch (e) {
        return Object.keys(localStorage);
    }
}

/**
 * Recense tout ce qui pend à une fiche de cours. LECTURE SEULE.
 *
 * @param {string} coursId
 * @returns {Promise<{fiches: Array, refs: Array, gcDependants: Array,
 *   porteDonnees: Array, risqueGC: Array, clesSnapshots: string[],
 *   pointeurVise: boolean}>}
 */
async function recenserDependancesCours(coursId) {
    const magasin = db.getSync('cours', []) || [];
    const fiches = magasin.filter(c => c && c.id === coursId);

    const toutes = await _toutesClesStockage();
    const refs = [];            // { cle, retire, garde, total }
    const gcDependants = [];    // { gc, trim, nbEtu, nbEval, nbPres }

    for (const k of toutes) {
        if (!SUFFIXES_FK_COURS.some(s => k === s || k.endsWith('_' + s))) continue;
        let valeur = null;
        try { valeur = await db.get(k, null); } catch (e) { continue; }
        if (!Array.isArray(valeur)) continue;
        const retire = valeur.filter(it => it && it.coursId === coursId);
        if (retire.length === 0) continue;
        refs.push({
            cle: k,
            retire: retire,
            garde: valeur.filter(it => !(it && it.coursId === coursId)),
            total: valeur.length
        });
        if (k === 'groupesCours' || k.endsWith('_groupesCours')) {
            retire.forEach(g => { if (g && g.id) gcDependants.push({ gc: g, trim: k.replace(/_?groupesCours$/, '') || '(sans trimestre)' }); });
        }
    }

    // Toute clé qui n'est pas un groupe-cours porte des DONNÉES, pas de la
    // structure : sa seule présence est un motif de refus.
    const porteDonnees = refs.filter(r => !(r.cle === 'groupesCours' || r.cle.endsWith('_groupesCours')));

    // Ce que chaque groupe-cours dépendant porte réellement.
    const risqueGC = [];
    const clesSnapshots = [];
    for (const d of gcDependants) {
        d.nbEtu = 0; d.nbEval = 0; d.nbPres = 0;
        try {
            const etu = await db.get(d.trim + '_groupeEtudiants', []) || [];
            d.nbEtu = (Array.isArray(etu) ? etu : []).filter(e => e && (e.groupeCoursId === d.gc.id || e.coursId === coursId)).length;
            const ev = await db.get(d.trim + '_evaluationsSauvegardees', []) || [];
            d.nbEval = (Array.isArray(ev) ? ev : []).filter(e => e && e.coursId === coursId).length;
            const pr = await db.get(d.trim + '_presences', []) || [];
            d.nbPres = (Array.isArray(pr) ? pr : []).filter(p => p && p.coursId === coursId).length;
        } catch (e) { /* comptage best-effort */ }
        if (d.nbEtu || d.nbEval || d.nbPres) risqueGC.push(d);
        const cleSnap = d.trim + '_snapshots_' + d.gc.id;
        if (toutes.indexOf(cleSnap) !== -1) clesSnapshots.push(cleSnap);
    }

    const infoCours = db.getSync('infoCours', null);
    const pointeurVise = !!(infoCours && (infoCours.id === coursId || infoCours.coursId === coursId));

    return { fiches, refs, gcDependants, porteDonnees, risqueGC, clesSnapshots, pointeurVise };
}

/**
 * Les refus du geste : fiche introuvable, ou cours qui porte encore des données.
 * Dit le refus et rend true ; rend false si rien ne s'y oppose.
 */
function _refuserLaSuppressionDuCours(plan, coursId) {
    if (plan.fiches.length === 0) {
        alert('Cette fiche de cours est introuvable — elle a peut-être déjà été supprimée. Recharge la page.');
        return true;
    }
    const f = plan.fiches[0];
    const nom = (f.codeCours || f.sigle || f.code || coursId) + (f.nomCours ? ' — ' + f.nomCours : '');

    const motifs = [];
    plan.porteDonnees.forEach(r => motifs.push('· ' + r.cle + ' : ' + r.retire.length + ' élément(s)'));
    plan.risqueGC.forEach(d => motifs.push('· ' + d.trim + ' · groupe ' + (d.gc.groupeNum || d.gc.groupe || d.gc.id) +
        ' — ' + d.nbEtu + ' étudiant·e(s), ' + d.nbEval + ' évaluation(s), ' + d.nbPres + ' présence(s)'));
    plan.clesSnapshots.forEach(k => motifs.push('· captures hebdomadaires : ' + k));

    if (motifs.length > 0) {
        alert('Impossible de supprimer « ' + nom + ' ».\n\n' +
            'Ce cours porte encore des données :\n' + motifs.join('\n') + '\n\n' +
            'Supprimer la fiche laisserait ces données orphelines — c\'est le\n' +
            'mécanisme du bug des productions inaccessibles d\'août. Retire\n' +
            'd\'abord ce qui s\'y rattache, ou dis-le-moi en session s\'il\n' +
            's\'agit de données de test à nettoyer.');
        return true;
    }
    return false;
}

/**
 * Le geste complet : recense, REFUSE ou confirme, exécute.
 * Partagé par la Bibliothèque (menu ⋮) et le Cadre (`supprimerCoursV2`) —
 * un seul mécanisme, zéro suppression nue.
 *
 * @param {string} coursId
 * @returns {Promise<boolean>} true si la fiche a été supprimée
 */
async function supprimerFicheCoursAvecGarde(coursId) {
    let plan = await recenserDependancesCours(coursId);
    if (_refuserLaSuppressionDuCours(plan, coursId)) return false;
    const f = plan.fiches[0];
    const nom = (f.codeCours || f.sigle || f.code || coursId) + (f.nomCours ? ' — ' + f.nomCours : '');

    const details = plan.refs.map(r => '· ' + r.cle + ' : ' + r.retire.length + ' groupe(s)-cours vide(s) retiré(s)');
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('cours'))) return false;
    if (!confirm('Supprimer la fiche « ' + nom + ' » ?\n\n' +
        'Le cours est global : la fiche disparaît de TOUS les trimestres.\n' +
        (details.length ? '\nSera aussi retiré (aucune donnée d\'étudiant, d\'évaluation ou de présence) :\n' + details.join('\n') + '\n' : '') +
        '\nCette action est irréversible (filet : ton backup Codex).')) {
        return false;
    }
    // #1007 (relecture de Cowork) : la fenêtre a pu attendre des minutes (une mise à jour du
    // codex). Le plan est recensé de nouveau : on écrit celui de MAINTENANT, et les mêmes
    // refus valent s'il a changé entre-temps.
    plan = await recenserDependancesCours(coursId);
    if (_refuserLaSuppressionDuCours(plan, coursId)) return false;

    // Exécution — les références d'abord, la fiche ensuite, le pointeur en
    // dernier. Tous les exemplaires portant cet id partent ensemble (les
    // doublons #442 ne doivent pas survivre à leur fiche).
    for (const r of plan.refs) { await db.set(r.cle, r.garde); }
    const magasin = db.getSync('cours', []) || [];
    db.setSync('cours', magasin.filter(c => !(c && c.id === coursId)));
    if (window.signalerEcritureUsager) window.signalerEcritureUsager('cours');   // lot F : geste hors témoin (supprimer une fiche de cours)
    if (plan.pointeurVise) db.setSync('infoCours', null); // security-ok: remise à null, aucune donnée externe
    if (typeof db.flush === 'function') { try { await db.flush(); } catch (e) { /* durabilité best-effort */ } }
    return true;
}

/**
 * Entrée du menu ⋮ de la Bibliothèque (#449).
 */
async function supprimerFicheCours(id) {
    const fait = await supprimerFicheCoursAvecGarde(id);
    if (!fait) return;
    fermerModalBibliothequeCours();
    if (typeof window.chargerDropdownCoursV2 === 'function') window.chargerDropdownCoursV2();
    if (typeof window.populerDropdownsAssemblageV2 === 'function') window.populerDropdownsAssemblageV2();
    alert('Fiche supprimée (tous trimestres).');
}

/**
 * Ajoute un cours à la sélection (passe dansBibliotheque à true)
 *
 * @param {string} id - ID du cours à ajouter
 */
async function ajouterCoursIndividuel(id) {
    const cours = await db.get('cours') || [];
    const coursIndex = cours.findIndex(c => c.id === id);

    if (coursIndex !== -1) {
        cours[coursIndex].dansBibliotheque = true;

        await db.set('cours', cours);
        if (window.signalerEcritureUsager) window.signalerEcritureUsager('cours');   // lot F : geste hors témoin (ajouter un cours à ma sélection)
        fermerModalBibliothequeCours();
        alert('Cours ajouté à ta sélection avec succès !');
    }
}

/* ===============================
   EXPORT/IMPORT SIMPLIFIÉS (Sans métadonnées CC)
   =============================== */

/**
 * Exporte les cours de la sélection au format JSON simple
 *
 * FONCTIONNEMENT:
 * - Exporte tous les cours avec dansBibliotheque === true
 * - Format JSON simple sans métadonnées CC (données ministérielles)
 * - Nom fichier : cours-YYYY-MM-DD.json
 */
async function exporterUnCours(id) {
    const tousLesCours = await db.get('cours') || [];
    const cours = tousLesCours.find(c => c.id === id);

    if (!cours) {
        alert('Cours introuvable');
        return;
    }

    // Même contrat que « Exporter tous mes cours » : métadonnées CC d'abord,
    // même enveloppe, même forme de fichier — un import ne fait pas la
    // différence entre un export d'un cours et un export de la sélection.
    const nomAffiche = `${cours.codeCours} - ${cours.nomCours}`;
    const metadata = await demanderMetadonneesEnrichies('cours', nomAffiche);
    if (!metadata) return;  // annulé par l'utilisateur

    const exportData = {
        metadata_cc: metadata,
        type: 'cours',
        nbCours: 1,
        dateExport: new Date().toISOString(),
        cours: [cours]
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Nom de fichier : le code du cours, épuré de ce qui ne passe pas en nom de fichier
    const dateStr = new Date().toISOString().split('T')[0];
    const codeEpure = String(cours.codeCours || 'cours').replace(/[^a-zA-Z0-9_-]/g, '-');
    const nomFichier = `cours-${codeEpure}-${dateStr}.json`;

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);

    alert(`« ${nomAffiche} » exporté avec métadonnées Creative Commons !`);
}

/**
 * Importe des cours depuis un fichier JSON
 *
 * FONCTIONNEMENT:
 * - Lit le fichier JSON
 * - Vérifie les doublons par codeCours + session + annee
 * - Ajoute les cours (dansBibliotheque = false par défaut)
 * - Génère de nouveaux IDs pour éviter conflits
 *
 * @param {Event} event - Événement de changement du input file
 */
async function importerCoursSimple(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    var file = target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const coursImportes = JSON.parse(e.target.result);

            if (!Array.isArray(coursImportes)) {
                alert('Format de fichier invalide : doit être un tableau de cours');
                return;
            }

            const coursExistants = await db.get('cours') || [];
            let nbAjoutes = 0;
            let nbDoublons = 0;

            coursImportes.forEach(coursImporte => {
                // #455 : doublon = même CODE, point. Le cours est global (le
                // devis ministériel ne change pas d'un trimestre à l'autre) ;
                // comparer aussi session/année laissait entrer un « 601-101
                // d'automne » à côté du 601-101 existant — deux fiches pour la
                // même chose (famille #346/#454). session/annee sur les fiches
                // legacy sont historiques, non décisionnels.
                //
                // CT-15 (23 août 2026) : la comparaison était ici un `===`
                // BRUT, quand le formulaire, lui, normalisait casse et
                // espaces. « 601-101-mq » importé à côté d'un « 601-101-MQ »
                // existant n'était donc PAS vu comme un doublon — refusé à la
                // main, accepté par fichier. Une seule règle désormais,
                // `cleNaturelleCours`.
                const doublon = trouverDoublonNaturel(
                    coursExistants, coursImporte, cleNaturelleCours);

                if (doublon) {
                    nbDoublons++;
                } else {
                    // Ajouter avec nouvel ID et flag dansBibliotheque = false
                    const nouveauCours = {
                        ...coursImporte,
                        id: genererIdUnique('COURS_'),
                        dansBibliotheque: false, // Disponible à ajouter
                        actif: false, // Les cours importés ne sont jamais actifs par défaut
                        dateEnregistrement: new Date().toISOString()
                    };

                    coursExistants.push(nouveauCours);
                    nbAjoutes++;
                }
            });

            if (nbAjoutes > 0) {
                await db.set('cours', coursExistants);
                if (window.signalerEcritureUsager) window.signalerEcritureUsager('cours');   // lot F : geste hors témoin (importer des cours)
            }

            // Message récapitulatif
            let message = `Import terminé :\n`;
            message += `✓ ${nbAjoutes} cours ajoutés\n`;
            if (nbDoublons > 0) {
                message += `• ${nbDoublons} doublon(s) ignoré(s)`;
            }

            alert(message);

            // Fermer et rafraîchir
            fermerModalBibliothequeCours();
            await ouvrirModalBibliothequeCours();

        } catch (error) {
            console.error('Erreur lors de l\'import :', error);
            alert('Erreur lors de l\'import du fichier. Vérifie le format JSON.');
        }
    };

    reader.readAsText(file);

    // Réinitialiser l'input pour permettre de réimporter le même fichier
    target.value = '';
}

/* ===============================
   PARTAGE AVEC MÉTADONNÉES CC
   =============================== */

/**
 * Partage un cours individuel avec métadonnées Creative Commons
 *
 * FONCTIONNEMENT:
 * 1. Demande les métadonnées CC enrichies à l'utilisateur
 * 2. Marque le cours comme partagé (dansBibliotheque = false)
 * 3. Ajoute les métadonnées CC au cours
 * 4. Rafraîchit le modal et la sidebar
 *
 * @param {string} id - ID du cours à partager
 */
async function partagerCours(id) {
    try {
        const cours = await db.get('cours') || [];
        const coursAPartager = cours.find(c => c.id === id);

        if (!coursAPartager) {
            alert('Cours introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const nomAffiche = `${coursAPartager.codeCours} - ${coursAPartager.nomCours}`;
        const metadata = await demanderMetadonneesEnrichies('cours', nomAffiche);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagé (retirer de ma sélection).
        // #468/CT-13 : `actif` suit, comme dans retirerCoursDeBibliotheque — un
        // cours qui a quitté la sélection ne peut pas rester le cours actif.
        coursAPartager.dansBibliotheque = false;
        coursAPartager.actif = false;

        // Ajouter métadonnées CC
        coursAPartager.metadata_cc = metadata;

        // Sauvegarder
        await db.set('cours', cours);
        if (window.signalerEcritureUsager) window.signalerEcritureUsager('cours');   // lot F : geste hors témoin (déposer un cours)

        // Rafraîchir modal
        fermerModalBibliothequeCours();
        await ouvrirModalBibliothequeCours();

        alert('Cours partagé avec succès !\n\nIl est maintenant disponible dans la section "Cours disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage du cours');
    }
}

/**
 * Partage tous les cours de la sélection avec métadonnées Creative Commons
 *
 * FONCTIONNEMENT:
 * 1. Demande les métadonnées CC globales
 * 2. Exporte tous les cours avec métadonnées
 * 3. Génère fichier JSON téléchargeable
 */
async function partagerTousLesCours() {
    const tousLesCours = await db.get('cours') || [];
    const coursDansBibliotheque = tousLesCours.filter(c => c.dansBibliotheque === true);

    if (coursDansBibliotheque.length === 0) {
        alert('Aucun cours à partager dans ta sélection');
        return;
    }

    // Demander métadonnées CC pour l'export global
    const metadata = await demanderMetadonneesEnrichies('cours', 'Mes cours');
    if (!metadata) {
        return; // Annulé par l'utilisateur
    }

    // Créer le wrapper avec métadonnées
    const exportData = {
        metadata_cc: metadata,
        type: 'cours',
        nbCours: coursDansBibliotheque.length,
        dateExport: new Date().toISOString(),
        cours: coursDansBibliotheque
    };

    // Créer le JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Générer nom de fichier avec date
    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichier = `cours-${dateStr}.json`;

    // Télécharger
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);

    alert(`${coursDansBibliotheque.length} cours exportés avec métadonnées Creative Commons !`);
}

/* ===============================
   HELPER: Obtenir l'ID du cours actif (Beta 95)
   =============================== */

/**
 * Retourne l'ID du cours actuellement actif
 * Utilisé par horaire.js pour le namespacing des séances
 *
 * @returns {string|null} - ID du cours actif ou null si aucun
 */
function obtenirCoursActifId() {
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.id) {
        return infoCours.id;
    }

    // Fallback: chercher dans listeCours
    const tousLesCours = db.getSync('cours', []);
    const coursActif = tousLesCours.find(c => c.actif);
    return coursActif ? coursActif.id : null;
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Ouvrir file picker import cours */
function ouvrirFilePickerImportCours() {
    var input = document.getElementById('fichier-import-cours-modal');
    if (input) input.click();
}

/* ===============================
   REFONTE COURS↔PÉRIODE — Chantier 0 : diagnostic read-only
   Voir docs/PLAN-refonte-cours-description-independante.md
   =============================== */

/**
 * Diagnostic LECTURE SEULE du modèle cours actuel, AVANT toute migration.
 * N'écrit RIEN (aucun db.set/setSync) — uniquement des lectures + console.
 * À lancer en console : await _diagnostiquerModeleCours()
 *
 * Produit, pour chaque codeCours :
 *  - le nombre d'objets `cours` portant ce code (révèle les doublons inter-trimestres),
 *  - pour chaque objet, son « score de données » = nombre de FK `coursId` le référençant
 *    (présences + productions + groupeEtudiants + groupesCours + évaluations + snapshots),
 *    tous trimestres confondus → identifie le canonique (score max) vs les doublons vides,
 *  - le repère ID estampillé (h2026-…) vs ID canonique (COURS_*).
 * Signale aussi les `coursId` orphelins (référencés par des données mais absents de `cours`).
 *
 * Lecture inter-trimestres : via `await db.get()` (source réelle IDB/localStorage), car
 * `getSync` ne voit que le trimestre actif préchargé en memoryCache. Snapshots : énumère
 * l'UNION des clés localStorage + IDB (le coursId est dans la clé `{trim}_snapshots_{id}`).
 *
 * @returns {Promise<{parCode:Object, scores:Object, orphelins:string[], nbCours:number, nbCanonique:number}>}
 */
async function _diagnostiquerModeleCours() {
    const cours = db.getSync('cours', []);
    const trimestres = db.getSync('trimestres', []);

    // Suffixes de clés namespacées dont les items portent un champ .coursId
    // (#449 : registre unique du module, partagé avec le recensement)
    const SUFFIXES_FK = SUFFIXES_FK_COURS;

    // coursId -> compteur par type de donnée
    const scores = {};
    const ajouter = (coursId, type, n) => {
        if (!coursId) return;
        if (!scores[coursId]) {
            scores[coursId] = { presences: 0, productions: 0, groupeEtudiants: 0, groupesCours: 0, evaluationsSauvegardees: 0, snapshots: 0 };
        }
        scores[coursId][type] += n;
    };
    const totalScore = (id) => {
        const s = scores[id];
        return s ? s.presences + s.productions + s.groupeEtudiants + s.groupesCours + s.evaluationsSauvegardees + s.snapshots : 0;
    };

    // Union des clés (localStorage + IDB) pour énumérer les snapshots
    let toutesCles = [];
    try {
        const idbKeys = await db.keys();
        toutesCles = Array.from(new Set([...Object.keys(localStorage), ...idbKeys]));
    } catch (e) {
        toutesCles = Object.keys(localStorage);
    }

    // Comptage des FK coursId, trimestre par trimestre
    for (const t of trimestres) {
        for (const suf of SUFFIXES_FK) {
            const arr = await db.get(`${t.id}_${suf}`) || [];
            if (Array.isArray(arr)) {
                arr.forEach(item => { if (item && item.coursId) ajouter(item.coursId, suf, 1); });
            }
        }
        // Snapshots : coursId encodé dans la clé {trim}_snapshots_{coursId}
        const prefixe = `${t.id}_snapshots_`;
        toutesCles.forEach(k => {
            if (typeof k === 'string' && k.startsWith(prefixe)) {
                ajouter(k.slice(prefixe.length), 'snapshots', 1);
            }
        });
    }

    // Regroupement des cours par codeCours
    const parCode = {};
    cours.forEach(c => {
        const code = c.codeCours || '(sans code)';
        (parCode[code] = parCode[code] || []).push(c);
    });

    const estCanonique = (id) => typeof id === 'string' && id.startsWith('COURS_');
    const idsConnus = new Set(cours.map(c => c.id));
    const orphelins = Object.keys(scores).filter(id => !idsConnus.has(id));
    const nbCanonique = cours.filter(c => estCanonique(c.id)).length;

    // Rapport console
    const codesDoublons = Object.keys(parCode).filter(code => parCode[code].length > 1);
    console.group(`[Diagnostic modèle cours] ${cours.length} cours · ${trimestres.length} trimestres`);
    console.log(`Doublons par code : ${codesDoublons.length} code(s) sur ${Object.keys(parCode).length}`);
    console.log(`IDs à ré-identifier (non COURS_*) : ${cours.length - nbCanonique} sur ${cours.length}`);

    Object.keys(parCode).sort().forEach(code => {
        const objets = parCode[code]
            .map(c => ({ c, score: totalScore(c.id) }))
            .sort((a, b) => b.score - a.score);
        const marqueur = objets.length > 1 ? ' ⚠️ DOUBLON' : '';
        console.group(`${code} : ${objets.length} objet(s)${marqueur}`);
        objets.forEach(({ c, score }, i) => {
            const s = scores[c.id] || {};
            const detail = Object.entries(s).filter(([, n]) => n > 0).map(([k, n]) => `${k}:${n}`).join(', ') || 'aucune donnée';
            const role = objets.length > 1 ? (i === 0 ? ' → canonique probable' : ' → doublon') : '';
            const idType = estCanonique(c.id) ? 'COURS_*' : 'estampillé';
            console.log(`${idType} | ${c.id} | ${(c.session || '?') + (c.annee || '')} | score ${score} (${detail})${role}`);
        });
        console.groupEnd();
    });

    if (orphelins.length) {
        console.group(`⚠️ coursId orphelins (référencés par des données mais absents de 'cours') : ${orphelins.length}`);
        orphelins.forEach(id => console.warn(`${id} | score ${totalScore(id)}`));
        console.groupEnd();
    }
    console.groupEnd();

    return { parCode, scores, orphelins, nbCours: cours.length, nbCanonique };
}

/* ===============================
   EXPORTS - Rendre les fonctions accessibles globalement
   =============================== */

window._diagnostiquerModeleCours = _diagnostiquerModeleCours;
window.obtenirCoursActifId = obtenirCoursActifId;
window.reprendreCoursDansTrimestreActif = reprendreCoursDansTrimestreActif;
window.initialiserModuleCours = initialiserModuleCours;
window.ouvrirModalBibliothequeCours = ouvrirModalBibliothequeCours;
window.fermerModalBibliothequeCours = fermerModalBibliothequeCours;
window.retirerCoursDeBibliotheque = retirerCoursDeBibliotheque;
// #449 — vérifier l'EXPORT réel, pas la présence de l'appel (leçon du 10 août)
window.recenserDependancesCours = recenserDependancesCours;
window.supprimerFicheCoursAvecGarde = supprimerFicheCoursAvecGarde;
window.supprimerFicheCours = supprimerFicheCours;
window.ajouterCoursIndividuel = ajouterCoursIndividuel;
window.exporterUnCours = exporterUnCours;
window.importerCoursSimple = importerCoursSimple;
window.partagerCours = partagerCours;
window.partagerTousLesCours = partagerTousLesCours;
window.ouvrirFilePickerImportCours = ouvrirFilePickerImportCours;

})();
